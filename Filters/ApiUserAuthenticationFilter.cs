using DocumentFormat.OpenXml.Presentation;
using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Helpers;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
using ExpressBase.Web.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using ServiceStack;
using ServiceStack.Auth;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace ExpressBase.Web.Filters
{

    public sealed class ApiUserAuthenticationFilter : IAsyncResourceFilter
    {
        private readonly IServiceClient _serviceClient;
        private readonly IEbAuthClient _authClient;
        private string _forcedConsole;

        //TODO: add support for stateless APIs
        public ApiUserAuthenticationFilter(IServiceClient serviceClient, IEbAuthClient authClient, string forcedConsole)
        {
            _serviceClient = serviceClient;
            _authClient = authClient;
            _forcedConsole = forcedConsole;
        }

        public Task OnResourceExecutionAsync(ResourceExecutingContext context, ResourceExecutionDelegate next)
        {
            string externalSoltionId;
            string internalSolutionId;
            string bearerToken = context.HttpContext.Request.Cookies[RoutingConstants.WEB_BEARER_TOKEN] ?? context.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
            string refreshToken = context.HttpContext.Request.Cookies[RoutingConstants.WEB_REFRESH_TOKEN] ?? context.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];
            User user;
            string userId;
            string userAuthId;
            string clientIp = HttpContextHelper.GetIp(context.HttpContext);
            string currentConsole;

            if (context.HttpContext.Items.ContainsKey(RoutingConstants.EXTERNAL_SOLUTION_ID))
            {
                externalSoltionId = context.HttpContext.Items[RoutingConstants.EXTERNAL_SOLUTION_ID].ToString();
            }
            else
            {
                throw new InvalidOperationException("External solution ID not found in context.");
            }

            if (context.HttpContext.Items.ContainsKey(RoutingConstants.INTERNAL_SOLUTION_ID))
            {
                internalSolutionId = context.HttpContext.Items[RoutingConstants.INTERNAL_SOLUTION_ID].ToString();
            }
            else
            {
                throw new InvalidOperationException("InternalSolutionId solution ID not found in context.");
            }
            if (context.HttpContext.Items.ContainsKey("Console"))
            {
                currentConsole = context.HttpContext.Items["Console"].ToString();
            }
            else
            {
                throw new InvalidOperationException("Console not found in context.");
            }

            if(this._forcedConsole != null && this._forcedConsole != currentConsole)
            {
                context.Result = new JsonResult(new
                {
                    success = false,
                    message = "Unauthorized access",
                    statusCode = 401
                })
                {
                    StatusCode = 401
                };
            }

            if(UserAuthenticationHelper.IsTokensValid(refreshToken, bearerToken, internalSolutionId, clientIp, currentConsole) )
            {

                var bearerTokenPayload = new JwtSecurityToken(bearerToken).Payload;

                userId = bearerTokenPayload[TokenConstants.UID]?.ToString() ?? throw new InvalidOperationException("Invalid session.");

                userAuthId = bearerTokenPayload[TokenConstants.SUB]?.ToString() ?? throw new InvalidOperationException("Invalid session.");

                var redisManager = context.HttpContext.RequestServices.GetRequiredService<PooledRedisClientManager>();

                user = UserAuthenticationHelper.GetUserObject(
                                redisManager,
                                _serviceClient,
                                userId,
                                userAuthId,
                                currentConsole,
                                internalSolutionId
                            );

            } else
            {

                context.Result = new JsonResult(new
                {
                    success = false,
                    message = "Unauthorized access",
                    statusCode = 401
                })
                {
                    StatusCode = 401
                };

                return Task.CompletedTask;


            }

            if(user != null)
            {
                context.HttpContext.Items[RoutingConstants.CONTEXT_BEARER_TOKEN] = bearerToken;
                context.HttpContext.Items[RoutingConstants.CONTEXT_REFRESH_TOKEN] = refreshToken;
                context.HttpContext.Items[RoutingConstants.AUTH_ID] = user.AuthId;
                context.HttpContext.Items[RoutingConstants.USER] = user;

            }
            else
            {
                context.Result = new JsonResult(new
                {
                    success = false,
                    message = "Unauthorized access",
                    statusCode = 401
                })
                {
                    StatusCode = 401
                };

                return Task.CompletedTask;
            }

            return next();

        }
    }
}
