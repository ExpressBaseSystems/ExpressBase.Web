using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Helpers
{
    public class HttpContextHelper
    {

        public static string GetClientIp(ActionExecutingContext ctx)
        {
            return GetIpFromHttpContext(ctx.HttpContext);
        }

        public static string GetClientIp(ControllerContext ctx)
        {
            return GetIpFromHttpContext(ctx.HttpContext);
        }

        private static string GetIpFromHttpContext(HttpContext httpContext)
        {
            // If behind proxy and you've enabled ForwardedHeaders, X-Forwarded-For will be set.
            if (httpContext.Request.Headers.TryGetValue("X-Forwarded-For", out var fwd) && !string.IsNullOrWhiteSpace(fwd))
            {
                var s = fwd.ToString();
                var i = s.IndexOf(',');
                return i >= 0 ? s.Substring(0, i).Trim() : s.Trim();
            }

            return httpContext.Connection.RemoteIpAddress?.ToString();
        }


        public static bool WantsJson(ActionExecutingContext ctx)
        {
            // Accept: application/json or */*+json (eg. application/problem+json)
            if (ctx.HttpContext.Request.Headers.TryGetValue("Accept", out var accept))
            {
                var a = accept.ToString().ToLowerInvariant();
                if (a.Contains("application/json") || a.Contains("+json") || a.Contains("text/json"))
                    return true;
            }

            // Common fallbacks:
            //  - explicit format flag: ?format=json
            //  - typical API ajax X-Requested-With header
            var q = ctx.HttpContext.Request.Query;
            if (q.TryGetValue("format", out var fmt) && string.Equals(fmt.ToString(), "json", StringComparison.OrdinalIgnoreCase))
                return true;

            if (ctx.HttpContext.Request.Headers.TryGetValue("X-Requested-With", out var xrw) &&
                xrw.ToString().Equals("XMLHttpRequest", StringComparison.OrdinalIgnoreCase))
                return true;

            return false;
        }
    }
}
