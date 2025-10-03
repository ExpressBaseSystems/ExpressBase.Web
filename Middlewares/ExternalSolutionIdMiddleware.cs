using ExpressBase.Common;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace ExpressBase.Web.Middlewares
{
    public class ExternalSolutionIdMiddleware
    {
        private readonly RequestDelegate _next;
        public ExternalSolutionIdMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            var host = context.Request.Host.Host; 
            string subdomain = null;

            if (!string.IsNullOrEmpty(host))
            {
                var parts = host.Split('.');
                if (parts.Length > 1)
                {
                    subdomain = parts[0];
                }
            }

            context.Items["ExternalSolutionId"] = subdomain?.Replace(RoutingConstants.DASHDEV, string.Empty);

            await _next(context);
        }
    }
}
