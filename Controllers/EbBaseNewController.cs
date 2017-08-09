using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using Microsoft.AspNetCore.Mvc.Filters;
using System.IdentityModel.Tokens.Jwt;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class EbBaseNewController : Controller
    {
        protected JsonServiceClient ServiceClient { get; set; }

        public EbBaseNewController(IServiceClient _client)
        {
            this.ServiceClient = _client as JsonServiceClient;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            try
            {
                var controller = context.Controller as Controller;
                this.ServiceClient.BearerToken = context.HttpContext.Request.Cookies["Token"];
                this.ServiceClient.RefreshToken = context.HttpContext.Request.Cookies["rToken"];

                var tokenS = (new JwtSecurityTokenHandler()).ReadToken(context.HttpContext.Request.Cookies["Token"]) as JwtSecurityToken;

                controller.ViewBag.tier = context.HttpContext.Request.Query["tier"];
                controller.ViewBag.tenantid = context.HttpContext.Request.Query["id"];
                controller.ViewBag.UId = Convert.ToInt32(tokenS.Claims.First(claim => claim.Type == "uid").Value);
                controller.ViewBag.cid = tokenS.Claims.First(claim => claim.Type == "cid").Value;
                controller.ViewBag.wc = tokenS.Claims.First(claim => claim.Type == "wc").Value;

                controller.ViewBag.isAjaxCall = (context.HttpContext.Request.Headers["X-Requested-With"] == "XMLHttpRequest");

                base.OnActionExecuting(context);
            }
            catch (System.ArgumentNullException ane)
            {
                if (!(context.Controller is ExpressBase.Web.Controllers.ExtController))
                {
                    if (ane.ParamName == "token" || ane.ParamName == "rToken")
                    {
                        context.Result = new RedirectResult("~/Ext/Index");
                        return;
                    }
                }
            }
        }
    }
}
