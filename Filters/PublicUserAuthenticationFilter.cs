using DocumentFormat.OpenXml.Presentation;
using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Helpers;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
using ExpressBase.Web.Helpers;
using Microsoft.AspNetCore.Http;
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

    public sealed class PublicUserAuthenticationFilter : IAsyncResourceFilter
    {
        private readonly IServiceClient _serviceClient;
        private readonly IEbAuthClient _authClient;

        public PublicUserAuthenticationFilter(IServiceClient serviceClient, IEbAuthClient authClient)
        {
            _serviceClient = serviceClient;
            _authClient = authClient;
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

            if(currentConsole != RoutingConstants.UC)
            {
                throw new InvalidOperationException("Invalid console.");
            }

            
            if(UserAuthenticationHelper.IsTokensValid(refreshToken, bearerToken, internalSolutionId, clientIp, currentConsole) == false)
            {

                var authRequest = new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = "NIL",
                    Password = "NIL",
                    Meta = new Dictionary<string, string> {
                                            { RoutingConstants.WC, TokenConstants.UC },
                                            { TokenConstants.EMAIL, TokenConstants.PUBLIC_FORM_V2_ANONYMOUS_USER_EMAIL },
                                            { TokenConstants.CID, internalSolutionId },
                                            { TokenConstants.IP, clientIp},
                                            { RoutingConstants.USER_AGENT, context.HttpContext.Request.Headers["User-Agent"].ToString()},
                                            { TokenConstants.SESSION_TAG, TokenConstants.ANONYMOUS_USER_V2_SESSION_TAG},
                                        },
                    RememberMe = true
                };


                var authResponse = this._authClient.Get<MyAuthenticateResponse>(authRequest);

                if (authResponse != null && authResponse.User != null)
                {
                    user = authResponse.User;
                    bearerToken = authResponse.BearerToken;
                    refreshToken = authResponse.RefreshToken;
                    //userAuthId = authResponse.User.AuthId;

                    var cookieOpts = new Microsoft.AspNetCore.Http.CookieOptions
                    {
                        HttpOnly = true,
                        Secure = context.HttpContext.Request.IsHttps,
                        SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict,
                        Expires = DateTimeOffset.UtcNow.AddMinutes(59) //TODO: shouldn't this be same as token expiry?
                    };

                    context.HttpContext.Response.Cookies.Append(RoutingConstants.WEB_BEARER_TOKEN, bearerToken, cookieOpts);
                    context.HttpContext.Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, bearerToken, cookieOpts);
                    context.HttpContext.Response.Cookies.Append(RoutingConstants.WEB_REFRESH_TOKEN, refreshToken, cookieOpts);
                    context.HttpContext.Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, refreshToken, cookieOpts);

                    if (_serviceClient is JsonServiceClient jsonServiceClient)
                    {
                        jsonServiceClient.BearerToken = bearerToken ?? string.Empty;
                        jsonServiceClient.RefreshToken = refreshToken ?? string.Empty;
                        jsonServiceClient.Headers.Add(CacheConstants.RTOKEN, refreshToken ?? string.Empty);
                    }

                }
                else
                {
                    throw new InvalidOperationException("Invalid session.");
                }

            } else
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
                throw new InvalidOperationException("Invalid session.");
            }

            return next();

        }
    }
}
