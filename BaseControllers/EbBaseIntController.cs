using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Common.ServiceStack.Auth;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack;
using ServiceStack.Messaging;
using ServiceStack.Redis;
using System;
using System.IdentityModel.Tokens.Jwt;

namespace ExpressBase.Web.Controllers
{
    public class EbBaseIntController : EbBaseController
    {
        protected RedisMessageQueueClient RedisMessageQueueClient { get; set; }

        protected RedisMessageProducer RedisMessageProducer { get; set; }

        public EbBaseIntController(IServiceClient _ssclient) : base(_ssclient) { }

        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public EbBaseIntController(IServiceClient _ssclient, IEbMqClient _mqc) : base(_ssclient, _mqc) { }

        public EbBaseIntController(IServiceClient _ssclient, IEbStaticFileClient _sfc) : base(_ssclient, _sfc) { }

        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc) : base(_ssclient, _redis, _mqc) { }

        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _sfc) { }

        public EbBaseIntController(IServiceClient _ssclient, IEbMqClient _mqc, IEbStaticFileClient _sfc) : base(_ssclient, _mqc, _sfc) { }

        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _mqc, _sfc) { }

        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis, IMessageQueueClient _mqFactory, IMessageProducer _mqProducer)
            : base(_ssclient, _redis)
        {
            this.RedisMessageQueueClient = _mqFactory as RedisMessageQueueClient;
            this.RedisMessageProducer = _mqProducer as RedisMessageProducer;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var host = context.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(CharConstants.DOT);
            var path = context.HttpContext.Request.Path.Value.ToLower();

            try
            {
                var jwtToken = new JwtSecurityToken(context.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN]);

                string bToken = context.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
                string rToken = context.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];
                Session = new CustomUserSession();
                Session.Id = context.HttpContext.Request.Cookies[CacheConstants.X_SS_PID];
                //Session = Redis.Get<CustomUserSession>("urn:iauthsession:"+ Session.Id); // Exception when inside a controller where Redis is not initialised

                this.ServiceClient.BearerToken = bToken;
                this.ServiceClient.RefreshToken = rToken;
                this.ServiceClient.Headers.Add(CacheConstants.RTOKEN, rToken);

                if (this.MqClient != null)
                {
                    this.MqClient.BearerToken = bToken;
                    this.MqClient.RefreshToken = rToken;
                    this.MqClient.Headers.Add(CacheConstants.RTOKEN, rToken);
                }

                if (this.FileClient != null)
                {
                    this.FileClient.BearerToken = bToken;
                    this.FileClient.RefreshToken = rToken;
                    this.FileClient.Headers.Add(CacheConstants.RTOKEN, rToken);
                }

                var controller = context.Controller as Controller;
                controller.ViewBag.tier = context.HttpContext.Request.Query["tier"];
                controller.ViewBag.tenantid = context.HttpContext.Request.Query["id"];
                controller.ViewBag.UId = Convert.ToInt32(jwtToken.Payload[TokenConstants.UID]);
                controller.ViewBag.UAuthId = context.HttpContext.Request.Cookies[TokenConstants.USERAUTHID];
                controller.ViewBag.cid = jwtToken.Payload[TokenConstants.CID];
                controller.ViewBag.wc = jwtToken.Payload[TokenConstants.WC];
                controller.ViewBag.email = jwtToken.Payload[TokenConstants.EMAIL];
                controller.ViewBag.isAjaxCall = (context.HttpContext.Request.Headers["X-Requested-With"] == "XMLHttpRequest");
                controller.ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
                controller.ViewBag.ServerEventUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVEREVENTS_EXT_URL);
                controller.ViewBag.StaticFileServerUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_STATICFILESERVER_EXT_URL);
                controller.ViewBag.BrowserURLContext = context.HttpContext.Request.Host.Value;
                base.OnActionExecuting(context);
            }
            catch (System.ArgumentNullException ane)
            {
                if (ane.ParamName == RoutingConstants.BEARER_TOKEN || ane.ParamName == RoutingConstants.REFRESH_TOKEN)
                {
                    context.Result = new RedirectResult("~/Ext/Index");
                    return;
                }
            }
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
    }
}
