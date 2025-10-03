using ExpressBase.Common;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace ExpressBase.Web.Middlewares
{
    public class TokenCheckMiddleware
    {
        private readonly RequestDelegate _next;

        public async Task Invoke(HttpContext context)
        {
            string bearerToken = context.Request.Cookies[RoutingConstants.BEARER_TOKEN] ?? "";
            string refreshToken = context.Request.Cookies[RoutingConstants.REFRESH_TOKEN] ?? "";

            if (string.IsNullOrEmpty(bearerToken) || string.IsNullOrEmpty(refreshToken))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Unauthorized: Missing authentication tokens");
                return;
            }

           
            context.Items["BearerToken"] = bearerToken;
            context.Items["RefreshToken"] = refreshToken;

            await _next(context);
        }

    }
}
