using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.ServiceClients;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack;
using ServiceStack.Redis;
using System;
using ExpressBase.Security;
using ExpressBase.Objects.ServiceStack_Artifacts;

namespace ExpressBase.Web.BaseControllers
{
    public class EbBaseExtController : EbBaseController
    {
        public EbBaseExtController(IServiceClient _ssclient) : base(_ssclient) { }

        public EbBaseExtController(IEbStaticFileClient _sfc) : base(_sfc) { }

        public EbBaseExtController(IEbStaticFileClient _sfc, IRedisClient _redis) : base(_sfc, _redis) { }

        public EbBaseExtController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public EbBaseExtController(IServiceClient _ssclient, IRedisClient _redis, IHttpContextAccessor _cxtacc, IEbMqClient _mqc) : base(_ssclient, _redis, _cxtacc, _mqc) { }

        public EbBaseExtController(IServiceClient _ssclient, IEbStaticFileClient _sfc) : base(_ssclient, _sfc) { }

        public EbBaseExtController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _sfc) { }

		public EbBaseExtController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc, IEbAuthClient _auth) : base(_ssclient, _redis, _sfc, _auth) { }

        public EbBaseExtController(IServiceClient _ssclient, IRedisClient _redis, IHttpContextAccessor _cxtacc, IEbMqClient _mqc, IEbAuthClient _auth) : base(_ssclient, _redis, _cxtacc, _mqc, _auth) { }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            try
            {
                base.OnActionExecuting(context);

                var controller = context.Controller as Controller;
                controller.ViewBag.SolutionId = IntSolutionId;
                controller.ViewBag.cid = IntSolutionId;
                controller.ViewBag.SolutionIdExt = ExtSolutionId;
                controller.ViewBag.WhichConsole = WhichConsole;
                controller.ViewBag.Env = Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT);
                if (controller.ViewBag.Env == "Production")
                {
                    controller.ViewBag.Root = "https://expressbase.com";
                }
                else
                {
                    controller.ViewBag.Root = "https://eb-test.cloud";
                }

            }
            catch (System.ArgumentNullException ane)
            {
                Console.WriteLine("Exception:" + ane.Message.ToString());
            }
        }
    }
}