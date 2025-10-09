using ExpressBase.Common;
using FluentFTP;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Middlewares
{
    public class AppUrlContextMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly AppConfiguration _cfg;
        public AppUrlContextMiddleware(RequestDelegate next, IOptions<AppConfiguration> cfg)
        {
            _next = next;
            _cfg = cfg.Value;
        }

        public async Task Invoke(HttpContext context)
        {
            var host = context.Request.Host.ToString();

            string subdomain = null;
            string domain = null;
            string devConsoleHost = null;

            

            var parts = host.Split('.', StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length >= 2)
            {
                subdomain = parts[0] ?? null;
                domain = parts[1] ?? null;
            }
            else
            {
                domain = host;
            }

            if (domain != this._cfg.BaseHost)
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsync("Invalid Host header.");
                return;
            }


            if (!subdomain.EndsWith("-dev", StringComparison.OrdinalIgnoreCase))
            {
                devConsoleHost =subdomain + "-dev" + "." + this._cfg.BaseHost;
            } else
            {
                devConsoleHost = subdomain + "." + this._cfg.BaseHost;
            }

            context.Items["ExternalSolutionId"] = subdomain?.Replace(this._cfg.DevDomainSuffix, string.Empty);
            context.Items["BaseHost"] = this._cfg.BaseHost;
            context.Items["Scheme"] = this._cfg.Scheme;
            context.Items["Host"] = host;
            context.Items["Domain"] = domain;
            context.Items["SubDomain"] = subdomain;
            context.Items["UserConsoleHost"] = subdomain?.Replace(this._cfg.DevDomainSuffix, string.Empty) + "." + this._cfg.BaseHost;
            context.Items["DevConsoleHost"] = devConsoleHost;

            //DebugHelper.PrintObject(context.Items, printAsJson: false, label: "context");

            await _next(context);
        }
    }
}
