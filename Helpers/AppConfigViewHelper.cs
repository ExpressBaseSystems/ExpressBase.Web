using ExpressBase.Common;
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
                Scheme = context.Items[RoutingConstants.SCHEME]?.ToString(),
                Host = context.Items[RoutingConstants.HOST]?.ToString(),
                BaseHost = cfg.Value.BaseHost,
                LocalPort = cfg.Value.LocalPort,
                Domain = context.Items[RoutingConstants.DOMAIN]?.ToString(),
                ServerEventUrlPrefix = cfg.Value.ServerEventUrlPrefix,
                DevConsoleHost = context.Items[RoutingConstants.DEV_CONSOLE_HOST]?.ToString(),
                UserConsoleHost = context.Items[RoutingConstants.USER_CONSOLE_HOST]?.ToString()
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
