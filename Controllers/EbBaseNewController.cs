using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using Microsoft.AspNetCore.Mvc.Filters;
using System.IdentityModel.Tokens.Jwt;
using ServiceStack.Redis;
using Microsoft.AspNetCore.Http;
using ServiceStack.Messaging;
using Microsoft.Extensions.Options;
using ExpressBase.Web2;
using System.Net.Http;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    //public class AllowCrossSiteIFrameAttribute : ActionFilterAttribute
    //{
    //    public override void OnResultExecuted(ResultExecutedContext filterContext)
    //    {
    //        filterContext.HttpContext.Response.Headers.Remove("X-Frame-Options");
    //        filterContext.HttpContext.Response.Headers.Add("X-Frame-Options", "ALLOW-FROM http://expressbase.com/");
    //        base.OnResultExecuted(filterContext);
    //    }
    //}  // for web forwarding with masking

    public class EbBaseNewController : Controller
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        protected RedisMessageQueueClient RedisMessageQueueClient { get; set; }

        protected RedisMessageProducer RedisMessageProducer { get; set; }

        public EbBaseNewController(IServiceClient _ssclient)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
        }

        public EbBaseNewController(IServiceClient _ssclient, IRedisClient _redis)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public EbBaseNewController(IServiceClient _ssclient, IRedisClient _redis, IMessageQueueClient _mqFactory, IMessageProducer _mqProducer)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
            this.RedisMessageQueueClient = _mqFactory as RedisMessageQueueClient;
            this.RedisMessageProducer = _mqProducer as RedisMessageProducer;
        }
     
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            try
            {
                var host = context.HttpContext.Request.Host.Host.Replace("www.", string.Empty);
                var path = context.HttpContext.Request.Path;
                string[] subdomain = host.Split('.');

                var controller = context.Controller as Controller;
                string bearertoken = context.HttpContext.Request.Cookies["bToken"];
                string refreshtoken = context.HttpContext.Request.Cookies["rToken"];
                this.ServiceClient.BearerToken = bearertoken;
                this.ServiceClient.RefreshToken = refreshtoken; 

                var tokenS = (new JwtSecurityTokenHandler()).ReadToken(context.HttpContext.Request.Cookies["bToken"]) as JwtSecurityToken;
                
                controller.ViewBag.tier = context.HttpContext.Request.Query["tier"];
                controller.ViewBag.tenantid = context.HttpContext.Request.Query["id"];
                controller.ViewBag.UId = Convert.ToInt32(tokenS.Claims.First(claim => claim.Type == "uid").Value);
                controller.ViewBag.cid = tokenS.Claims.First(claim => claim.Type == "cid").Value;
                controller.ViewBag.wc = tokenS.Claims.First(claim => claim.Type == "wc").Value;
                controller.ViewBag.email = tokenS.Claims.First(claim => claim.Type == "email").Value;
                controller.ViewBag.isAjaxCall = (context.HttpContext.Request.Headers["X-Requested-With"] == "XMLHttpRequest");
                controller.ViewBag.ServiceUrl = this.ServiceClient.BaseUri;
                base.OnActionExecuting(context);

               if(path.ToString().StartsWith("/Ext/", true, null) && !path.ToString().StartsWith("/Ext/Index", true, null))
                {        
                    if(!string.IsNullOrEmpty(bearertoken))
                    {    
                        if(controller.ViewBag.wc == "tc")
                        {
                            context.Result = new RedirectResult("~/Tenant/TenantDashboard");
                        }
                        else if(controller.ViewBag.wc == "dc")
                        {
                            context.Result = new RedirectResult("~/Dev/DevConsole");
                        }
                        else
                        {
                            context.Result = new RedirectResult("~/TenantUser/UserDashboard");
                        }
                    }
                }
                else if( path == "/" || path == "/Dev")
                {
                  
                    if (!string.IsNullOrEmpty(bearertoken))
                    {
                      
                        if (subdomain.Length == 3 || subdomain.Length == 2) // USER CONSOLE
                        {
                            if (controller.ViewBag.wc == "uc")
                            {
                                context.Result = new RedirectResult("~/TenantUser/UserDashboard");
                            }
                            else if (controller.ViewBag.wc == "dc")
                            {
                                context.Result = new RedirectResult("~/Dev/DevConsole");
                            }
                        }
                        else // TENANT CONSOLE
                        {
                            context.Result = new RedirectResult("~/Ext/Index");
                        }
                    }

                }
              

            }
            catch (System.ArgumentNullException ane)
            {
                if (!(context.Controller is ExpressBase.Web.Controllers.ExtController))
                {
                    if (ane.ParamName == "bToken" || ane.ParamName == "rToken")
                    {
                        context.Result = new RedirectResult("~/Ext/Index");
                        return;
                    }
                }
            }
        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            if (ControllerContext.ActionDescriptor.ActionName != "Logout")
            {
                var tok = this.ServiceClient.BearerToken;
                if (!string.IsNullOrEmpty(tok))
                    Response.Cookies.Append("bToken", this.ServiceClient.BearerToken, new CookieOptions());
            }
            base.OnActionExecuted(context);
        }
    }
}
