using ExpressBase.Common;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Web.Filters;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ServiceStack;
using ServiceStack.Redis;
using Stripe;
using System;

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
                // This will push telemetry data through Application Insights pipeline faster, allowing you to view results immediately.
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

            services.AddMvc();

            services.AddSingleton<AreaRouter>();

            // Added - uses IOptions<T> for your settings.
            services.AddOptions();

            var connectionString = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            services.AddScoped<IServiceClient, JsonServiceClient>(serviceProvider =>
            {
                return new JsonServiceClient(connectionString);
            });

            services.AddScoped<IEbMqClient, EbMqClient>(serviceProvider =>
            {
                return new EbMqClient();
            });

            StripeConfiguration.SetApiKey("sk_test_eOhkZcaSagCU9Hh33lcS6wQs");

            var redisServer = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_REDIS_SERVER);
            var redisPassword = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_REDIS_PASSWORD);
            var redisPort = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_REDIS_PORT);

            //container.Resolve<IServerEvents>().Start();

            //var client = new ServerEventsClient("redis://YK8GtsURARN+x9qITeLj5GikW/rK/i8Uekr1ECxscLA=@ExpressBaseRedisCache.redis.cache.windows.net:6380?ssl=true");

            //client.Handlers["FileUpload"] = (client1, msg) => {
            //    //Deserialize JSON string to typed DTO
            //    var Response = msg.Json.FromJson<UploadFileControllerResponse>();
            //};

            services.AddScoped<IRedisClient, RedisClient>(serviceProvider =>
            {
                return new RedisClient(string.Format("redis://{0}@{1}:{2}", redisPassword, redisServer, redisPort));
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, AreaRouter areaRouter)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            app.UseApplicationInsightsRequestTelemetry();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseApplicationInsightsExceptionTelemetry();

            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.DefaultHandler = areaRouter;
                routes.MapRoute(
                 name: "developer",
                 template: "dev",
                 defaults: new { controller = RoutingConstants.EXTCONTROLLER, action = "DevSignIn" }
                );

                routes.MapRoute(
                    name: "default",
                    template: "{controller=Ext}/{action=Index}");

            });

            app.Use(async (context, next) =>
            {
                context.Response.Headers.Remove("X-Frame-Options");
                context.Response.Headers.Add("X-Frame-Options", "ALLOW-FROM http://expressbase.com");
                await next();
            }); // for web forwarding with masking
        }
    }
}
