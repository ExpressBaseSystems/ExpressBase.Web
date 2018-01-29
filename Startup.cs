using ExpressBase.Common;
using ExpressBase.Common.Extensions;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.Filters;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Protocols;
using ServiceStack;
using ServiceStack.Redis;
using Stripe;
using System;
using System.Text;

namespace ExpressBase.Web2
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
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

            // Added - Confirms that we have a home for our DemoSettings
            services.Configure<EbSetupConfig>(Configuration.GetSection("EbSetupConfig"));


            //var connectionString = Configuration["EbSetupConfig:"+ EnvironmentConstants.SERVICESTACKEXTURL];
            var connectionString = Environment.GetEnvironmentVariable(EnvironmentConstants.SERVICESTACK_EXT_URL);
            //services.AddScoped(typeof(IServiceClient), ServiceClientFactory);
            services.AddScoped<IServiceClient, JsonServiceClient>(serviceProvider =>
            {
                return new JsonServiceClient(connectionString);
            });
            StripeConfiguration.SetApiKey("sk_test_eOhkZcaSagCU9Hh33lcS6wQs");
            var redisServer = Environment.GetEnvironmentVariable(EnvironmentConstants.REDIS_SERVER);
            var redisPassword = Environment.GetEnvironmentVariable(EnvironmentConstants.REDIS_PASSWORD);
            var redisPort = Environment.GetEnvironmentVariable(EnvironmentConstants.REDIS_PORT);


            //var redisConnectionString = string.Format("redis://{0}@{1}:{2}?ssl=true", redisPassword, redisServer, redisPort);

            //container.Register<IRedisClientsManager>(new RedisManagerPool(redisHost));

            //container.Register<IServerEvents>(c => new RedisServerEvents(c.Resolve<IRedisClientsManager>()));

            //container.Resolve<IServerEvents>().Start();

            
            //var client = new ServerEventsClient("redis://YK8GtsURARN+x9qITeLj5GikW/rK/i8Uekr1ECxscLA=@ExpressBaseRedisCache.redis.cache.windows.net:6380?ssl=true");

            //client.Handlers["FileUpload"] = (client1, msg) => {
            //    //Deserialize JSON string to typed DTO
            //    var Response = msg.Json.FromJson<UploadFileControllerResponse>();
            //};


            services.AddScoped<IRedisClient, RedisClient>(serviceProvider =>
            {
                return new RedisClient(string.Format("redis://{0}@{1}:{2}?ssl=true", redisPassword, redisServer, redisPort));
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
                 defaults: new { controller = "Ext", action = "DevSignIn" }
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
