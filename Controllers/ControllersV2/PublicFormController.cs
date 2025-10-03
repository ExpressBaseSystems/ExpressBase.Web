using ExpressBase.Common.Helpers;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Objects.ServiceStack_Artifacts.EbButtonPublicFormAttachServiceStackArtifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using System;
using System.Linq;
using ExpressBase.Common.Extensions;
using System.Collections.Generic;
using ExpressBase.Common.Data;
using Newtonsoft.Json.Linq;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;
using Microsoft.AspNetCore.Mvc.Filters;
using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Security;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ServiceStack.Auth;
using Microsoft.AspNetCore.Http;
using ServiceStack.Redis;
using ExpressBase.Web.RateLimitters;
using ExpressBase.Objects.Dtos;
using ExpressBase.Web.Helpers;
using ExpressBase.Commons.Models;
using InternalExceptionHelper = ExpressBase.Web.Helpers.InternalExceptionHelper;

namespace ExpressBase.Web.Controllers.ControllersV2
{
    [Route("v2/PublicForm")]
    public class PublicFormController : EbBaseController
    {

        public PublicFormController(
            IServiceClient _client, 
            IHttpContextAccessor _cxtacc,
            IEbAuthClient _auth, 
            PooledRedisClientManager _pooledRedisManager, 
            IRedisClient _redis
            ) : base(
                _client, 
                _cxtacc, 
                _auth, 
                _pooledRedisManager, 
                _redis) 
            { }

        public override void OnActionExecuting(ActionExecutingContext context)
        {

            string externalSoultionId = HttpContext.Items["ExternalSolutionId"] as string;
            string internalSolutionId = GetIsolutionId(externalSoultionId);
            string clientIp = HttpContextHelper.GetClientIp(context);

            string bearerToken = context.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN] ?? "";
            string refreshToken = context.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN] ?? "";
            User user;
            string userAuthId;

            try
            {
                bool isTokenValid = IsTokensValid(refreshToken, bearerToken, externalSoultionId);

                if (
                    string.IsNullOrWhiteSpace(refreshToken) || 
                    string.IsNullOrWhiteSpace(bearerToken) ||
                    isTokenValid == false
                )
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
                                            { RoutingConstants.USER_AGENT, this.UserAgent},
                                            { UserSession.SESSION_TAG, UserSession.USER_SESSION_TAG_PUBLIC_FORM_V2},
                                        },
                        RememberMe = true
                    };


                    var authResponse = this.AuthClient.Get<MyAuthenticateResponse>(authRequest);

                    if (authResponse != null && authResponse.User != null)
                    {
                        user = authResponse.User;
                        bearerToken = authResponse.BearerToken;
                        refreshToken = authResponse.RefreshToken;
                        userAuthId = authResponse.UserId;

                        var cookieOpts = new Microsoft.AspNetCore.Http.CookieOptions
                        {
                            HttpOnly = true,
                            Secure = HttpContext.Request.IsHttps,
                            SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict,
                            Expires = DateTimeOffset.UtcNow.AddMinutes(59)
                        };

                        Response.Cookies.Append(RoutingConstants.WEB_BEARER_TOKEN, bearerToken ?? string.Empty, cookieOpts);
                        Response.Cookies.Append(RoutingConstants.WEB_REFRESH_TOKEN, refreshToken ?? string.Empty, cookieOpts);
                        Response.Cookies.Append(RoutingConstants.WEBAUTHID, userAuthId ?? string.Empty, cookieOpts);

                        this.ServiceClient.BearerToken = bearerToken ?? string.Empty;
                        this.ServiceClient.RefreshToken = refreshToken ?? string.Empty;
                        this.ServiceClient.Headers.Add(CacheConstants.RTOKEN, refreshToken ?? string.Empty);

                    }

                }

                //if a valid user is in session
                if(isTokenValid == true)
                {
                    this.ServiceClient.BearerToken = bearerToken ?? string.Empty;
                    this.ServiceClient.RefreshToken = refreshToken ?? string.Empty;
                    this.ServiceClient.Headers.Add(CacheConstants.RTOKEN, refreshToken ?? string.Empty);
                }

                
            }
            catch (Exception exception)
            {
                var helper = new InternalExceptionHelper(PooledRedisManager);
                context.Result = helper.Redirect(exception, context.Controller as Controller);
            }

        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
        }


        [HttpGet("Index")]
        [RedisRateLimit(limit: 10, windowSeconds: 60, useIp: true, perPath: true, useExternalSolutionId:true, customKey:"public_form:v2")]
        public IActionResult Index(string publicFormQparams)
        {

            try
            {
                string base64Key = Environment.GetEnvironmentVariable("EB_AES_ENC_KEY") ?? throw new Exception("EB_AES_ENC_KEY not found");
                PublicFormV2QueryParamsDto publicFormV2QueryParamsDto = 
                    QueryStringEncDecHelper.FromEncryptedQuery<PublicFormV2QueryParamsDto>(publicFormQparams, base64Key, paramName: "QueryParams");

                string publicFormRefId = publicFormV2QueryParamsDto.PublicFormRefId;
                string sourceFormRefId = publicFormV2QueryParamsDto.SourceFormRefId;
                int formDataId = publicFormV2QueryParamsDto.FormDataId;

                string paramsToPrefillInPublicForm = "";

                if (string.IsNullOrWhiteSpace(publicFormRefId))
                {

                    throw new ArgumentNullException(nameof(publicFormRefId), "publicFormRefId is required");
                }


                //if the request is originating as a part of the click triggered by EbButtonPublicForm

                if (string.IsNullOrWhiteSpace(sourceFormRefId) == false && formDataId > 0)
                {
                    ResponseEbButtonPublicFormAttachServiceStackArtifact Response;

                    try
                    {
                        Response =
                        ServiceClient.Get<ResponseEbButtonPublicFormAttachServiceStackArtifact>(
                            new RequestEbButtonPublicFormAttachServiceStackArtifact
                            {
                                PublicFormRefId = publicFormRefId,
                                SourceFormRefId = sourceFormRefId,
                                SourceFormDataId = formDataId
                            }
                       );

                    }
                    catch (WebServiceException ex)
                    {
                        
                        throw ex;
                    }


                    if (Response.Success == false)
                    {

                        throw new Exception("invalid response received from Service Stack");
                    }


                    if (Response.EbButtonPublicFormAttachServiceDto != null)
                    {

                        if (Response.EbButtonPublicFormAttachServiceDto.FutureDateTime.HasValue)
                        {
                            if (Response.EbButtonPublicFormAttachServiceDto.FutureDateTime.Value < DateTime.UtcNow)
                            {
                                throw new InvalidOperationException("The form has expired.");
                            }
                        }

                        if (Response.EbButtonPublicFormAttachServiceDto.DestinationValues != null && Response.EbButtonPublicFormAttachServiceDto.DestinationValues.Any())
                        {
                            var prefillParamList = new List<Param>();

                            foreach (var kvp in Response.EbButtonPublicFormAttachServiceDto.DestinationValues)
                            {


                                var jObj = kvp.Value as JObject ?? JObject.FromObject(kvp.Value);

                                prefillParamList.Add(new Param
                                {
                                    Name = jObj["Name"]?.ToString(),
                                    Type = jObj["Type"]?.ToString(),
                                    Value = jObj["Value"]?.ToString()
                                });
                            }

                            paramsToPrefillInPublicForm = Newtonsoft.Json.JsonConvert.SerializeObject(prefillParamList).ToBase64();

                        }

                    }
                    else
                    {
                        throw new Exception("invalid response received from Service Stack : EbButtonPublicFormAttachServiceDto is not set");
                    }
                }


                //setting mode to New, as specified in WebFormDVModes.New_Mode; so that the condition {else if ((int)WebFormDVModes.New_Mode == _mode)} in  WebFormController works 
                
                return RedirectToAction(
                    "Index", 
                    "WebForm", 
                    new { 
                        _r = publicFormRefId, 
                        _p = paramsToPrefillInPublicForm, 
                        _m = "2", 
                        _l = "1",
                        _rm = "5" 
                    }
               );
               
            }
            catch (Exception exception)
            {

                return new InternalExceptionHelper(PooledRedisManager).Redirect(exception, this);
            }
        }
    }
}
