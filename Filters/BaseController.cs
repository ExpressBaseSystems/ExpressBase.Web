using ExpressBase.Web2;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Filters
{
    [EbAuthenticateFilter]
    public class EbBaseController : Controller
    {
        protected readonly EbSetupConfig EbConfig;

        public EbBaseController(IOptionsSnapshot<EbSetupConfig> ss_settings)
        {
            this.EbConfig = ss_settings.Value;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var TAccountId = context.HttpContext.Request.Cookies["cid"];
            var controller = context.Controller as Controller;
            var handler = new JwtSecurityTokenHandler();
            var token = context.HttpContext.Request.Cookies["Token"];
            controller.ViewBag.EbConfig = this.EbConfig;
            if (!string.IsNullOrEmpty(token))
            {
                var tokenS = handler.ReadToken(token) as JwtSecurityToken;
                controller.ViewBag.Fname = tokenS.Claims.First(claim => claim.Type == "Fname").Value;
                controller.ViewBag.tier = context.HttpContext.Request.Query["tier"];
                controller.ViewBag.tenantid = context.HttpContext.Request.Query["id"];
                controller.ViewBag.token = token;
                controller.ViewBag.UId = Convert.ToInt32(tokenS.Claims.First(claim => claim.Type == "uid").Value);
                controller.ViewBag.cid = tokenS.Claims.First(claim => claim.Type == "cid").Value;
               
            }

            if (!string.IsNullOrEmpty(TAccountId))
            {
                var TUtoken = context.HttpContext.Request.Cookies[string.Format("T_{0}", TAccountId)];
                var TUtokenS = handler.ReadToken(TUtoken) as JwtSecurityToken;
                controller.ViewBag.TUFname = TUtokenS.Claims.First(claim => claim.Type == "Fname").Value;
                //controller.ViewBag.tier = context.HttpContext.Request.Query["tier"];
                //controller.ViewBag.tenantid = context.HttpContext.Request.Query["id"];
                controller.ViewBag.TUtoken = TUtoken;
                controller.ViewBag.TUId = Convert.ToInt32(TUtokenS.Claims.First(claim => claim.Type == "uid").Value);
                controller.ViewBag.cid = TUtokenS.Claims.First(claim => claim.Type == "cid").Value;
            }
            base.OnActionExecuting(context);


        }
    }
}
