﻿using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Common.ServiceStack.Auth;
using ExpressBase.Common.Structures;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
using ExpressBase.Web.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Messaging;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

namespace ExpressBase.Web.BaseControllers
{
    public class EbBaseIntCommonController : EbBaseIntController
    {
        public EbBaseIntCommonController(IServiceClient _ssclient) : base(_ssclient)
        {
        }

        public EbBaseIntCommonController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis)
        {
        }

        public EbBaseIntCommonController(IServiceClient _ssclient, IEbMqClient _mqc) : base(_ssclient, _mqc)
        {
        }

        public EbBaseIntCommonController(IServiceClient _ssclient, IEbStaticFileClient _sfc) : base(_ssclient, _sfc)
        {
        }

        public EbBaseIntCommonController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc) : base(_ssclient, _redis, _mqc)
        {
        }

        public EbBaseIntCommonController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _sfc)
        {
        }

        public EbBaseIntCommonController(IServiceClient _ssclient, IEbMqClient _mqc, IEbStaticFileClient _sfc) : base(_ssclient, _mqc, _sfc)
        {
        }

        public EbBaseIntCommonController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _mqc, _sfc)
        {
        }
        public EbBaseIntCommonController(IServiceClient _ssclient, IRedisClient _redis, IEbServerEventClient _sec) : base(_ssclient, _redis, _sec)
        {
        }
        public EbBaseIntCommonController(IServiceClient _ssclient, IRedisClient _redis, IMessageQueueClient _mqFactory, IMessageProducer _mqProducer)
            : base(_ssclient, _redis)
        {
            this.RedisMessageQueueClient = _mqFactory as RedisMessageQueueClient;
            this.RedisMessageProducer = _mqProducer as RedisMessageProducer;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            base.OnActionExecuting(context);

            string sBToken = context.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
            string sRToken = context.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];
            string SSE_Sub_Id = context.HttpContext.Request.Headers[RoutingConstants.SSE_SUB_ID];
            string userAuthId = context.HttpContext.Request.Cookies[TokenConstants.USERAUTHID];
            string sWebBToken = context.HttpContext.Request.Cookies[RoutingConstants.WEB_BEARER_TOKEN];

            bool IsPublicFormRqst = !string.IsNullOrWhiteSpace(sWebBToken) &&
                ((context.HttpContext.Request.Query.TryGetValue("_rm", out StringValues st) && st.Count > 0 && st[0] == "5") || context.HttpContext.Request.Headers["eb_form_type"] == "public_form");

            if (IsPublicFormRqst)
            {
                sBToken = sWebBToken;
                sRToken = context.HttpContext.Request.Cookies[RoutingConstants.WEB_REFRESH_TOKEN];
                userAuthId = context.HttpContext.Request.Cookies["web_authid"];
            }

            if (string.IsNullOrEmpty(sBToken) || string.IsNullOrEmpty(sRToken))
            {
                context.Result = new RedirectResult("/");
            }
            else if (!IsTokensValid(sRToken, sBToken, ExtSolutionId))
                context.Result = new RedirectResult("/");
            else
            {
                try
                {
                    var bToken = new JwtSecurityToken(sBToken);

                    Session = new CustomUserSession();
                    Session.Id = context.HttpContext.Request.Cookies[CacheConstants.X_SS_PID];
                    //Session = Redis.Get<CustomUserSession>("urn:iauthsession:"+ Session.Id); // Exception when inside a controller where Redis is not initialised

                    this.ServiceClient.BearerToken = sBToken;
                    this.ServiceClient.RefreshToken = sRToken;
                    this.ServiceClient.Headers.Add(CacheConstants.RTOKEN, sRToken);
                    this.ServiceClient.Headers.Add(TokenConstants.SSE_SUBSCRIP_ID, SSE_Sub_Id);

                    if (this.MqClient != null)
                    {
                        this.MqClient.BearerToken = sBToken;
                        this.MqClient.RefreshToken = sRToken;
                        this.MqClient.Headers.Add(CacheConstants.RTOKEN, sRToken);
                        this.MqClient.Headers.Add(TokenConstants.SSE_SUBSCRIP_ID, SSE_Sub_Id);
                    }

                    if (this.FileClient != null)
                    {
                        this.FileClient.BearerToken = sBToken;
                        this.FileClient.RefreshToken = sRToken;
                        this.FileClient.Headers.Add(CacheConstants.RTOKEN, sRToken);
                        this.FileClient.Headers.Add(TokenConstants.SSE_SUBSCRIP_ID, SSE_Sub_Id);
                    }

                    var controller = context.Controller as Controller;
                    controller.ViewBag.tier = context.HttpContext.Request.Query["tier"];
                    controller.ViewBag.tenantid = context.HttpContext.Request.Query["id"];
                    controller.ViewBag.UId = Convert.ToInt32(bToken.Payload[TokenConstants.UID]);
                    controller.ViewBag.UAuthId = userAuthId;
                    controller.ViewBag.cid = bToken.Payload[TokenConstants.CID];
                    controller.ViewBag.cide = ExtSolutionId.Replace(RoutingConstants.DASHDEV, string.Empty);
                    controller.ViewBag.wc = bToken.Payload[TokenConstants.WC];
                    controller.ViewBag.email = bToken.Payload[TokenConstants.EMAIL];

                    controller.ViewBag.isAjaxCall = (context.HttpContext.Request.Headers["X-Requested-With"] == "XMLHttpRequest");
                    controller.ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
                    controller.ViewBag.ServerEventUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVEREVENTS_EXT_URL);
                    controller.ViewBag.StaticFileServerUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_STATICFILESERVER_EXT_URL);
                    controller.ViewBag.BrowserURLContext = context.HttpContext.Request.Host.Value;

                    this.LoggedInUser = this.Redis.Get<User>(bToken.Payload[TokenConstants.SUB].ToString());
                    controller.ViewBag.UserDisplayName = this.LoggedInUser.FullName;

                    controller.ViewBag.UserObject = JsonConvert.SerializeObject(this.LoggedInUser);
                    controller.ViewBag.EbObjectTypeMeta = JsonConvert.SerializeObject(this.GetObjectTypeMeta());

                    if (controller.ViewBag.wc == TokenConstants.UC || controller.ViewBag.wc == TokenConstants.TC)
                    {
                        ViewBag.Locations = GetAccessLoc(controller);
                        controller.ViewBag.CurrentLocation = this.LoggedInUser.Preference.DefaultLocation;
                    }

                }
                catch (System.ArgumentNullException ane)
                {
                    if (ane.ParamName == RoutingConstants.BEARER_TOKEN || ane.ParamName == RoutingConstants.REFRESH_TOKEN)
                    {
                        Console.WriteLine("Exception: " + ane.ToString());
                        context.Result = new RedirectResult("/");
                        return;
                    }
                }
            }
        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            if (ControllerContext.ActionDescriptor.ActionName != "Logout")
            {
                bool IsPublicFormRqst = !string.IsNullOrEmpty(context.HttpContext.Request.Cookies[RoutingConstants.WEB_BEARER_TOKEN]) &&
                    ((context.HttpContext.Request.Query.TryGetValue("_rm", out StringValues st) && st.Count > 0 && st[0] == "5") || context.HttpContext.Request.Headers["eb_form_type"] == "public_form");

                if (this.ServiceClient != null)
                {
                    if (!string.IsNullOrEmpty(this.ServiceClient.BearerToken))
                    {
                        if (!IsPublicFormRqst)
                            Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, this.ServiceClient.BearerToken, new CookieOptions());
                        else
                            Response.Cookies.Append(RoutingConstants.WEB_BEARER_TOKEN, this.ServiceClient.BearerToken, new CookieOptions());
                    }
                }
                if (this.FileClient != null)
                {
                    if (!string.IsNullOrEmpty(this.FileClient.BearerToken))
                    {
                        if (!IsPublicFormRqst)
                            Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, this.FileClient.BearerToken, new CookieOptions());
                        else
                            Response.Cookies.Append(RoutingConstants.WEB_BEARER_TOKEN, this.FileClient.BearerToken, new CookieOptions());
                    }
                }
            }

            base.OnActionExecuted(context);
        }

        public string GetAccessLoc(Controller contrlr)
        {
            string _json = string.Empty;
            List<EbLocation> list = new List<EbLocation>();
            try
            {
                Eb_Solution s_obj = GetSolutionObject(contrlr.ViewBag.cid);
                if (this.LoggedInUser.LocationIds.Contains(-1) || this.LoggedInUser.Roles.Contains("SolutionAdmin"))
                    list = s_obj?.Locations.Values.ToList();
                else
                {
                    foreach (int id in this.LoggedInUser.LocationIds)
                    {
                        list.Add(s_obj?.Locations[id]);
                    }
                }
                _json = JsonConvert.SerializeObject(list);

                contrlr.ViewBag.FinYears = JsonConvert.SerializeObject(GetFinancialYearsObject(s_obj, this.LoggedInUser));
                ViewBag.IsMultiLanguageEnabled = s_obj.IsMultiLanguageEnabled;
                if (s_obj.IsMultiLanguageEnabled)
                    contrlr.ViewBag.Languages = JsonConvert.SerializeObject(new MultiLanguageController(this.ServiceClient, this.Redis).LoadLang());
            }
            catch (Exception e)
            {
                Console.WriteLine("Error GetAccessLoc :" + e.StackTrace + "\n" + e.Message);
            }
            return _json;
        }

        public Dictionary<int, EbObjectTypeWrap> GetObjectTypeMeta()
        {
            Dictionary<int, EbObjectTypeWrap> _dict = new Dictionary<int, EbObjectTypeWrap>();
            foreach (EbObjectType objectType in EbObjectTypes.Enumerator)
            {
                _dict.Add(objectType.IntCode, new EbObjectTypeWrap
                {
                    Name = objectType.Alias,
                    IntCode = objectType.IntCode,
                    BMW = objectType.BMW,
                    IsUserFacing = objectType.IsUserFacing,
                    Icon = objectType.Icon
                });
            }
            return _dict;
        }
    }
}
