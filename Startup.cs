using ExpressBase.Common;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Web.Filters;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Cors.Internal;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http.Features;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Reflection;
using System.Collections.Generic;

namespace ExpressBase.Web2
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables();

            if (env.IsDevelopment())
            {
                builder.AddApplicationInsightsSettings(developerMode: true);
            }
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add framework services.
            services.AddApplicationInsightsTelemetry(Configuration);

            services.AddDataProtection(opts =>
            {
                opts.ApplicationDiscriminator = "expressbase.web";
            }); // for antiforgery checking 

            services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigin",
                    builder => builder
                     .SetIsOriginAllowedToAllowWildcardSubdomains()
                    .WithOrigins("https://*.expressbase.com", "https://*." + RoutingConstants.STAGEHOST)
                    .AllowAnyMethod());
            });

            services.AddMvc();

            services.Configure<MvcOptions>(options =>
            {
                options.Filters.Add(new CorsAuthorizationFilterFactory("AllowSpecificOrigin"));
            });
            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders =
                    ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            });

            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardLimit = 5;
                options.ForwardedForHeaderName = "Eb-X-Forwarded-For";
            });

            services.Configure<FormOptions>(options =>
            {
                options.ValueCountLimit = 512; // 512 items max
                options.ValueLengthLimit = 1024 * 1024 * 100; // 100MB max len form data
            });

            services.AddSingleton<AreaRouter>();
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            // Added - uses IOptions<T> for your settings.
            services.AddOptions();


            services.AddScoped<IServiceClient, JsonServiceClient>(serviceProvider =>
            {
                JsonServiceClient client = new JsonServiceClient
                {
                    BaseUri = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL),
                    RefreshTokenUri = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_GET_ACCESS_TOKEN_URL)
                };
                client.Timeout = new TimeSpan(0, 3, 0);
                return client;
            });

            services.AddScoped<IEbMqClient, EbMqClient>(serviceProvider =>
            {
                return new EbMqClient();
            });

            services.AddScoped<IEbAuthClient, EbAuthClient>(serviceProvider =>
            {
                return new EbAuthClient();
            });

            services.AddScoped<IEbStaticFileClient, EbStaticFileClient>(serviceProvider =>
            {
                return new EbStaticFileClient();
            });

            services.AddScoped<IEbServerEventClient, EbServerEventClient>(serviceProvider =>
            {
                return new EbServerEventClient();
            });

            //  StripeConfiguration.SetApiKey("sk_test_eOhkZcaSagCU9Hh33lcS6wQs");
            string env = Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT);
             var redisPassword = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_REDIS_PASSWORD);
            var redisPort = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_REDIS_PORT);
            //if (env == "Development")
            //{
            //    services.AddScoped<IRedisClient, RedisClient>(serviceProvider =>
            //    {
            //        return new RedisClient(redisServer, Convert.ToInt32(redisPort), redisPassword);
            //    });
            //}
            //else
            //{
            var redisServer = "127.0.0.1";
            var redisConnectionString = string.Format("redis://{0}:{1}", redisServer, redisPort);
            var redisManager = new RedisManagerPool(redisConnectionString);
            services.AddScoped<IRedisClient, IRedisClient>(serviceProvider =>
            {
                return redisManager.GetClient();
            });

            var listRWRedis = new List<string>() { redisConnectionString }; var listRORedis = new List<string>() { redisConnectionString.Replace("-master", "-replicas") };
            PooledRedisClientManager pooledRedisManager = new PooledRedisClientManager(listRWRedis, listRORedis);
            services.AddSingleton<PooledRedisClientManager, PooledRedisClientManager>(serviceProvider =>
            {
                return pooledRedisManager;
            });
            //}

            ////Setting Assembly version in Redis
            //AssemblyName assembly = Assembly.GetExecutingAssembly().GetName();
            //String version = assembly.Name.ToString() + " - " + assembly.Version.ToString();
            //client.Set("WebAssembly", version);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, AreaRouter areaRouter)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            //app.UseForwardedHeaders(new ForwardedHeadersOptions
            //{
            //    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost
            //});

            app.UseForwardedHeaders();

            app.UseApplicationInsightsRequestTelemetry();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
                //app.UseHsts();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseApplicationInsightsExceptionTelemetry();

            app.UseStatusCodePagesWithReExecute("/StatusCode/{0}");

            app.UseStaticFiles(new StaticFileOptions()
            {
                OnPrepareResponse = (context) =>
                {
                    var headers = context.Context.Response.GetTypedHeaders();
                    headers.CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue
                    {
                        Private = true,
                        MaxAge = TimeSpan.FromDays(15)
                    };
                }
            });

            app.UseMvc(routes =>
            {
                routes.DefaultHandler = areaRouter;
                //routes.MapRoute(
                // name: "developer",
                // template: "dev",
                // defaults: new { controller = RoutingConstants.EXTCONTROLLER, action = "DevSignIn" }
                //);

                routes.MapRoute(
                    name: "default",
                    template: "{controller=Ext}/{action=Index}");

            });

            app.UseCors("AllowSpecificOrigin");

            app.Use(async (context, next) =>
            {
                context.Response.Headers.Remove("X-Frame-Options");
                if (env.IsStaging())
                {
                    context.Response.Headers.Add("X-Frame-Options", $"ALLOW-FROM SAMEDOMAIN *.{RoutingConstants.STAGEHOST}");
                    context.Response.Headers.Add("Content-Security-Policy", $"frame-ancestors 'self' {RoutingConstants.STAGEHOST} *.{RoutingConstants.STAGEHOST};");
                }
                if (env.IsProduction())
                    context.Response.Headers.Add("X-Frame-Options", "ALLOW-FROM SAMEDOMAIN");
                await next();
            }); // for web forwarding with masking
        }
    }
}
