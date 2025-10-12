using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace ExpressBase.Web2
{
    public class Program
    {
        public static void Main(string[] args)
        {

            var config = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                        .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json",
                                     optional: true, reloadOnChange: true)
                        .AddEnvironmentVariables()
                        .Build();

            var host = new WebHostBuilder()
                .UseKestrel(options =>
                {
                    options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(5);
                    options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(5);
                    options.Limits.MinResponseDataRate = null;
                })
                .UseConfiguration(config)
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseUrls($"http://*:{config.GetValue<int>("AppConfiguration:LocalPort", 41500)}")
                .ConfigureLogging(logging =>
                {
                    logging.ClearProviders();
                    logging.AddConfiguration(config.GetSection("Logging"));
                    logging.AddConsole();
                    logging.AddDebug();
                })
                .UseStartup<Startup>()
                .Build();


            host.Run();
        }
    }
}
