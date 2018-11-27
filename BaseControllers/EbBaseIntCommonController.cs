using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Common.ServiceStack.Auth;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
using ExpressBase.Web.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Messaging;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

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

        public EbBaseIntCommonController(IServiceClient _ssclient, IRedisClient _redis, IMessageQueueClient _mqFactory, IMessageProducer _mqProducer)
            : base(_ssclient, _redis)
        {
            this.RedisMessageQueueClient = _mqFactory as RedisMessageQueueClient;
            this.RedisMessageProducer = _mqProducer as RedisMessageProducer;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            string host = context.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(CharConstants.DOT);

            //string path = context.HttpContext.Request.Path.Value.ToLower();

            string sBToken = context.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
            string sRToken = context.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];

            if (string.IsNullOrEmpty(sBToken) || string.IsNullOrEmpty(sRToken))
            {
                context.Result = new RedirectResult("/");
            }
            else if (!IsTokensValid(sRToken, sBToken, hostParts[0]))
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

                    if (this.MqClient != null)
                    {
                        this.MqClient.BearerToken = sBToken;
                        this.MqClient.RefreshToken = sRToken;
                        this.MqClient.Headers.Add(CacheConstants.RTOKEN, sRToken);
                    }

                    if (this.FileClient != null)
                    {
                        this.FileClient.BearerToken = sBToken;
                        this.FileClient.RefreshToken = sRToken;
                        this.FileClient.Headers.Add(CacheConstants.RTOKEN, sRToken);
                    }

                    var controller = context.Controller as Controller;
                    controller.ViewBag.tier = context.HttpContext.Request.Query["tier"];
                    controller.ViewBag.tenantid = context.HttpContext.Request.Query["id"];
                    controller.ViewBag.UId = Convert.ToInt32(bToken.Payload[TokenConstants.UID]);
                    controller.ViewBag.UAuthId = context.HttpContext.Request.Cookies[TokenConstants.USERAUTHID];
                    controller.ViewBag.cid = bToken.Payload[TokenConstants.CID];
                    controller.ViewBag.wc = bToken.Payload[TokenConstants.WC];
                    controller.ViewBag.email = bToken.Payload[TokenConstants.EMAIL];
                    controller.ViewBag.UserDisplayName = context.HttpContext.Request.Cookies["UserDisplayName"];
                    controller.ViewBag.isAjaxCall = (context.HttpContext.Request.Headers["X-Requested-With"] == "XMLHttpRequest");
                    controller.ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
                    controller.ViewBag.ServerEventUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVEREVENTS_EXT_URL);
                    controller.ViewBag.StaticFileServerUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_STATICFILESERVER_EXT_URL);
                    controller.ViewBag.BrowserURLContext = context.HttpContext.Request.Host.Value;

                    this.LoggedInUser = this.Redis.Get<User>(bToken.Payload[TokenConstants.SUB].ToString());

                    if (controller.ViewBag.wc== TokenConstants.UC)
                        ViewBag.Locations = GetAccessLoc(controller.ViewBag.cid);
                }
                catch (System.ArgumentNullException ane)
                {
                    if (ane.ParamName == RoutingConstants.BEARER_TOKEN || ane.ParamName == RoutingConstants.REFRESH_TOKEN)
                    {
                        context.Result = new RedirectResult("/");
                        return;
                    }
                }
            }

            base.OnActionExecuting(context);
        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            if (ControllerContext.ActionDescriptor.ActionName != "Logout")
            {
                if (this.ServiceClient != null)
                    if (!string.IsNullOrEmpty(this.ServiceClient.BearerToken))
                        Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, this.ServiceClient.BearerToken, new CookieOptions());
                if (this.FileClient != null)
                    if (!string.IsNullOrEmpty(this.FileClient.BearerToken))
                        Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, this.FileClient.BearerToken, new CookieOptions());
            }

            base.OnActionExecuted(context);
        }

        public string GetAccessLoc(string cid)
        {
            string _json = string.Empty;
            List<EbLocation> list = new List<EbLocation>();
            var s_obj = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", cid));
            if (this.LoggedInUser.LocationIds.Contains(-1))
                list = s_obj.Locations.Values.ToList<EbLocation>();
            else
            {
                foreach (int id in this.LoggedInUser.LocationIds)
                {
                    list.Add(s_obj.Locations[id]);
                }
            }
            _json = JsonConvert.SerializeObject(list);
            return _json;
        }
    }
}