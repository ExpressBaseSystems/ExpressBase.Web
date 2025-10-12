using ExpressBase.Common;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Web;
using ExpressBase.Web.Filters;
using ExpressBase.Web.Middlewares;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Cors.Internal;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;

namespace ExpressBase.Web2
{
    public class Startup
    {
        private readonly IHostingEnvironment _env;
        public IConfiguration Configuration { get; }


        public Startup(IConfiguration configuration, IHostingEnvironment env)
        {
            _env = env;
            Configuration = configuration;
        }


        public void ConfigureServices(IServiceCollection services)
        {

            if (_env.IsDevelopment())
            {
                services.AddApplicationInsightsTelemetry(options => { options.DeveloperMode = true; });
            }
            else
            {
                services.AddApplicationInsightsTelemetry(Configuration);
            }

            services.AddDataProtection(opts =>
            {
                opts.ApplicationDiscriminator = "expressbase.web";
            });


            services.AddCors(options =>
            {
                var scheme = (Configuration["AppConfiguration:Scheme"] ?? "https://").Trim();

                if (!scheme.Contains("://")) scheme = scheme + "://";

                var baseHost = (Configuration["AppConfiguration:BaseHost"] ?? string.Empty).Trim();

                options.AddPolicy("AllowSpecificOrigin", builder =>
                {
                    builder.SetIsOriginAllowedToAllowWildcardSubdomains();

                    if (!string.IsNullOrWhiteSpace(baseHost))
                    {

                        builder.WithOrigins($"{scheme}*.{baseHost}")
                               .AllowAnyMethod()
                               .AllowAnyHeader();
                    }
                    else
                    {

                        builder.WithOrigins(
                                "https://*.expressbase.com",
                                $"https://*.{RoutingConstants.STAGEHOST}"
                            )
                            .AllowAnyMethod()
                            .AllowAnyHeader();
                    }
                });
            });

            services.AddMvc()
                    .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);


            services.Configure<MvcOptions>(options =>
            {
                options.Filters.Add(new CorsAuthorizationFilterFactory("AllowSpecificOrigin"));
            });


            services.Configure<ForwardedHeadersOptions>(options =>
            {
                if (_env.IsProduction())
                {
                    options.ForwardedHeaders =
                        ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;


                    options.ForwardedForHeaderName = "Eb-X-Forwarded-For";
                }
                else
                {
                    options.ForwardedHeaders =
                        ForwardedHeaders.XForwardedFor |
                        ForwardedHeaders.XForwardedProto |
                        ForwardedHeaders.XForwardedHost;


                    options.KnownNetworks.Clear();
                    options.KnownProxies.Clear();
                }


                options.ForwardLimit = 5;
            });


            services.Configure<FormOptions>(options =>
            {
                options.ValueCountLimit = 512;
                options.ValueLengthLimit = 1024 * 1024 * 100; // 100 MB
            });

            services.AddSingleton<AreaRouter>();
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddOptions();


            services.AddScoped<IServiceClient, JsonServiceClient>(_ =>
            {
                var client = new JsonServiceClient
                {
                    BaseUri = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL),
                    RefreshTokenUri = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_GET_ACCESS_TOKEN_URL),
                    Timeout = TimeSpan.FromMinutes(3)
                };
                return client;
            });

            services.AddScoped<IEbMqClient, EbMqClient>();
            services.AddScoped<IEbAuthClient, EbAuthClient>();
            services.AddScoped<IEbStaticFileClient, EbStaticFileClient>();
            services.AddScoped<IEbServerEventClient, EbServerEventClient>();


            var redisServer = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_REDIS_SERVER);
            var redisPassword = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_REDIS_PASSWORD);
            var redisPort = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_REDIS_PORT);

            var redisConnectionString = $"redis://{redisPassword}@{redisServer}:{redisPort}";
            var redisManager = new RedisManagerPool(redisConnectionString);

            services.AddScoped<IRedisClient, IRedisClient>(_ => redisManager.GetClient());

            var listRWRedis = new List<string> { redisConnectionString };
            var listRORedis = new List<string> { redisConnectionString.Replace("-master", "-replicas") };

            var pooledRedisManager = new PooledRedisClientManager(listRWRedis, listRORedis);
            services.AddSingleton(pooledRedisManager);

            //services.AddScoped<RedisRateLimitFilter>(); //TODO: add in future for RedisRateLimitter


            services.Configure<AppConfiguration>(Configuration.GetSection("AppConfiguration"));
        }


        public void Configure(IApplicationBuilder app, IHostingEnvironment env, AreaRouter areaRouter)
        {
            var scheme = (Configuration["AppConfiguration:Scheme"] ?? string.Empty).Trim();
            var baseHost = (Configuration["AppConfiguration:BaseHost"] ?? string.Empty).Trim();


            app.UseForwardedHeaders();


            app.UseApplicationInsightsRequestTelemetry();

            if (env.IsDevelopment() || env.IsEnvironment("PreStaging"))
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseMiddleware<AppUrlContextMiddleware>();

            app.UseApplicationInsightsExceptionTelemetry();

            app.UseStatusCodePagesWithReExecute("/StatusCode/{0}");

            app.UseStaticFiles(new StaticFileOptions
            {
                OnPrepareResponse = context =>
                {
                    var headers = context.Context.Response.GetTypedHeaders();
                    headers.CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue
                    {
                        Private = true,
                        MaxAge = TimeSpan.FromDays(15)
                    };
                }
            });


            app.UseCors("AllowSpecificOrigin");


            app.Use(async (context, next) =>
            {

                context.Response.Headers.Remove("X-Frame-Options");
                context.Response.Headers.Remove("Content-Security-Policy");

                if (!string.IsNullOrWhiteSpace(baseHost))
                {
                    if (env.IsStaging())
                    {

                        context.Response.Headers.Add(
                            "Content-Security-Policy",
                            $"frame-ancestors 'self' https://{baseHost} https://*.{baseHost};"
                        );
                    }
                    else if (env.IsProduction())
                    {

                        context.Response.Headers.Add(
                            "Content-Security-Policy",
                            "frame-ancestors 'self';"
                        );
                    }
                }
                else
                {

                    if (env.IsStaging())
                    {
                        context.Response.Headers.Add(
                            "Content-Security-Policy",
                            $"frame-ancestors 'self' https://{RoutingConstants.STAGEHOST} https://*.{RoutingConstants.STAGEHOST};"
                        );
                    }
                    else if (env.IsProduction())
                    {
                        context.Response.Headers.Add(
                            "Content-Security-Policy",
                            "frame-ancestors 'self';"
                        );
                    }
                }

                await next();
            });


            app.UseMvc(routes =>
            {
                routes.DefaultHandler = areaRouter;
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Ext}/{action=Index}");
            });
        }
    }
}