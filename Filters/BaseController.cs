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
            
            var controller = context.Controller as Controller;
            var handler = new JwtSecurityTokenHandler();
            var token = context.HttpContext.Request.Cookies["Token"];
            var tokenS = handler.ReadToken(token) as JwtSecurityToken;

            //controller.ViewBag.Fname = tokenS.Claims.First(claim => claim.Type == "Fname").Value;
            controller.ViewBag.tier = context.HttpContext.Request.Query["tier"];
            controller.ViewBag.tenantid = context.HttpContext.Request.Query["id"];
            controller.ViewBag.token = token;
            controller.ViewBag.UId = Convert.ToInt32(tokenS.Claims.First(claim => claim.Type == "uid").Value);
            controller.ViewBag.cid = tokenS.Claims.First(claim => claim.Type == "cid").Value;

            controller.ViewBag.EbConfig = this.EbConfig;
            base.OnActionExecuting(context);


        }
    }
}
