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

       
        public static string GetIp(HttpContext httpContext)
        {
            
            string headerValue = null;

            if (httpContext.Request.Headers.TryGetValue("Eb-X-Forwarded-For", out var ebFwd) &&
                !string.IsNullOrWhiteSpace(ebFwd))
            {
                headerValue = ebFwd.ToString();
            }
            else if (httpContext.Request.Headers.TryGetValue("X-Forwarded-For", out var stdFwd) &&
                     !string.IsNullOrWhiteSpace(stdFwd))
            {
                headerValue = stdFwd.ToString();
            }

            if (!string.IsNullOrWhiteSpace(headerValue))
            {
               
                var commaIndex = headerValue.IndexOf(',');
                var clientIp = commaIndex >= 0 ? headerValue.Substring(0, commaIndex) : headerValue;
                return clientIp.Trim();
            }

            
            var remoteIp = httpContext.Connection.RemoteIpAddress;

            return remoteIp?.MapToIPv4().ToString();
        }

        public static bool WantsJson(HttpContext httpContext)
        {

            if (httpContext.Request.Headers.TryGetValue("Accept", out var accept))
            {
                var a = accept.ToString().ToLowerInvariant();
                if (a.Contains("application/json") || a.Contains("+json") || a.Contains("text/json"))
                {
                    return true;
                }
                    
            }

          
            var q = httpContext.Request.Query;
            if (q.TryGetValue("format", out var fmt) && string.Equals(fmt.ToString(), "json", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
                

            if (httpContext.Request.Headers.TryGetValue("X-Requested-With", out var xrw) &&
                xrw.ToString().Equals("XMLHttpRequest", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
                

            return false;
        }
    }
}
