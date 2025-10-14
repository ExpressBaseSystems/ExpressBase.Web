using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;

namespace ExpressBase.Web.Helpers
{
    public static class AppConfigViewHelper
    {
        public static string RenderJson(HttpContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context));

            // Get IOptions<AppConfiguration> directly from DI
            var cfg = context.RequestServices.GetService(typeof(IOptions<AppConfiguration>))
                      as IOptions<AppConfiguration>;

            if (cfg == null)
                throw new InvalidOperationException("IOptions<AppConfiguration> not found in RequestServices.");

            var appConfig = new
            {
                Env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
                Scheme = context.Items["Scheme"]?.ToString(),
                Host = context.Items["Host"]?.ToString(),
                BaseHost = cfg.Value.BaseHost,
                LocalPort = cfg.Value.LocalPort,
                Domain = context.Items["Domain"]?.ToString(),
                ServerEventUrlPrefix = cfg.Value.ServerEventUrlPrefix,
                DevConsoleHost = context.Items["DevConsoleHost"]?.ToString(),
                UserConsoleHost = context.Items["UserConsoleHost"]?.ToString()
            };

            var jsonSettings = new JsonSerializerSettings
            {
                StringEscapeHandling = StringEscapeHandling.EscapeHtml,
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };

            return JsonConvert.SerializeObject(appConfig, jsonSettings);
        }
    }
}
