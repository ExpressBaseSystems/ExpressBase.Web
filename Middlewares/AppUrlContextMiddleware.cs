using ExpressBase.Common;
using ExpressBase.Common.Helpers;
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

            DebugHelper.PrintObject(this._cfg, printAsJson: true, label: "this._cfg");
            DebugHelper.PrintObject(context.Request, label: "context");

            var host = context.Request.Host.ToString(); //demobakerystaging.localhost:41500 || localhost:41500

            string subdomain = null;
            string domain = null;
            string devConsoleHost = null;
            string userConsoleHost = null;
            string externalSolutionId = null;


            if (this._cfg.Scheme.Replace("://",String.Empty) != context.Request.Scheme)
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsync("Invalid Scheme.");
                return;
            }


            var parts = host.Split('.', StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length >= 2)
            {
                subdomain = parts[0] ?? null; //demobakerystaging
                domain = parts[1] ?? null;  //localhost:41500
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

            if (StringHelper.HasValue(subdomain) == true)
            {
                
                if (subdomain.EndsWith("-dev", StringComparison.OrdinalIgnoreCase))
                {
                    context.Items["DevConsoleHost"] = subdomain + "-dev" + "." + this._cfg.BaseHost; //demobakerystaging-dev.localhost:41500
                }


                context.Items["ExternalSolutionId"] = subdomain?.Replace(this._cfg.DevDomainSuffix, string.Empty); //demobakerystaging
                context.Items["UserConsoleHost"] = subdomain?.Replace(this._cfg.DevDomainSuffix, string.Empty) + "." + this._cfg.BaseHost; //demobakerystaging.localhost:41500
                context.Items["SubDomain"] = subdomain;
            }

            context.Items["BaseHost"] = this._cfg.BaseHost;
            context.Items["Scheme"] = this._cfg.Scheme;
            context.Items["Host"] = host;
            context.Items["Domain"] = domain; 

            await _next(context);
        }
    }
}
