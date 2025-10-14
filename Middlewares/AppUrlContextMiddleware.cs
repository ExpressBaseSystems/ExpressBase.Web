using ExpressBase.Common.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System;
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

            //DebugHelper.PrintObject(this._cfg, printAsJson: true, label: "this._cfg");
            //DebugHelper.PrintObject(context.Request, label: "context");

            var host = context.Request.Host.ToString(); //demobakerystaging-dev.expressbase.com
            string baseHost = _cfg.BaseHost; //expressbase.com

            string subdomain = null;
            string domain = null;
            string devConsoleHost = null;
            string userConsoleHost = null;
            string externalSolutionId = null;

            if (this._cfg.Scheme.Replace("://", String.Empty) != context.Request.Scheme)
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsync("Invalid Scheme.");
                return;
            }

            if (host.EndsWith(baseHost, StringComparison.OrdinalIgnoreCase))
            {
                subdomain = host.Substring(0, host.Length - baseHost.Length).TrimEnd('.');
                domain = baseHost;

            } else
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsync("Invalid Host header.");
                return;
            }

            if (StringHelper.HasValue(subdomain) == true)
            {
                
                if (subdomain.EndsWith(this._cfg.DevDomainSuffix, StringComparison.OrdinalIgnoreCase) == false)
                {
                    context.Items["DevConsoleHost"] = subdomain + this._cfg.DevDomainSuffix + "." + baseHost; //demobakerystaging-dev.expressbase.com
                } else
                {
                    context.Items["DevConsoleHost"] = subdomain + "." + baseHost; //demobakerystaging-dev.expressbase.com
                }


                context.Items["ExternalSolutionId"] = subdomain?.Replace(this._cfg.DevDomainSuffix, string.Empty); //demobakerystaging
                context.Items["UserConsoleHost"] = subdomain?.Replace(this._cfg.DevDomainSuffix, string.Empty) + "." + baseHost; //demobakerystaging.expressbase.com
                context.Items["SubDomain"] = subdomain; //demobakerystaging || demobakerystaging-dev
            }

            context.Items["BaseHost"] = baseHost;
            context.Items["Scheme"] = this._cfg.Scheme;
            context.Items["Host"] = host;
            context.Items["Domain"] = domain; 

            await _next(context);
        }
    }
}
