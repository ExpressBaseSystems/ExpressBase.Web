using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Security;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Common.ServiceStack.Auth;
using ExpressBase.Web.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.BaseControllers
{
    public class EbBasetIntBotController : EbBaseIntController
    {
        public EbBasetIntBotController(IServiceClient _ssclient) : base(_ssclient) { }

        public EbBasetIntBotController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public EbBasetIntBotController(IServiceClient _ssclient, IEbStaticFileClient _sfc) : base(_ssclient, _sfc) { }

        public EbBasetIntBotController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _sfc) { }

		public int AnonUserId { get; set; }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            string host = context.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(CharConstants.DOT);

            //string path = context.HttpContext.Request.Path.Value.ToLower();

			string btoken_aid = HelperFunction.GetDecriptedString_Aes(context.HttpContext.Request.Headers[RoutingConstants.BEARER_TOKEN]);
			string sBToken = btoken_aid.Substring(0, btoken_aid.LastIndexOf(CharConstants.DOT));
            string sRToken = context.HttpContext.Request.Headers[RoutingConstants.REFRESH_TOKEN];
			this.AnonUserId = Convert.ToInt32(btoken_aid.Substring(btoken_aid.LastIndexOf(CharConstants.DOT) + 1));

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

			Response.Headers.Add(RoutingConstants.BEARER_TOKEN, HelperFunction.GetEncriptedString_Aes(this.ServiceClient.BearerToken + CharConstants.DOT + this.AnonUserId.ToString()));
        }

    }
}
