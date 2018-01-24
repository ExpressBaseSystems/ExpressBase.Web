using ExpressBase.Common;
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

        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis, IMessageQueueClient _mqFactory, IMessageProducer _mqProducer)
            : base(_ssclient, _redis)
        {
            this.RedisMessageQueueClient = _mqFactory as RedisMessageQueueClient;
            this.RedisMessageProducer = _mqProducer as RedisMessageProducer;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var host = context.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(RoutingConstants.DOT);
            var path = context.HttpContext.Request.Path.Value.ToLower();

            try
            {
                var jwtToken = new JwtSecurityToken(context.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN]);

                this.ServiceClient.BearerToken = context.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
                this.ServiceClient.RefreshToken = context.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];

                var controller = context.Controller as Controller;
                controller.ViewBag.tier = context.HttpContext.Request.Query["tier"];
                controller.ViewBag.tenantid = context.HttpContext.Request.Query["id"];
                controller.ViewBag.UId = Convert.ToInt32(jwtToken.Payload["uid"]);
                controller.ViewBag.cid = jwtToken.Payload["cid"];
                controller.ViewBag.wc = jwtToken.Payload["wc"];
                controller.ViewBag.email = jwtToken.Payload["email"];
                controller.ViewBag.isAjaxCall = (context.HttpContext.Request.Headers["X-Requested-With"] == "XMLHttpRequest");
                controller.ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.SERVICESTACKEXTURL);

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
                if (!string.IsNullOrEmpty(this.ServiceClient.BearerToken))
                    Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, this.ServiceClient.BearerToken, new CookieOptions());
            }

            base.OnActionExecuted(context);
        }
    }
}
