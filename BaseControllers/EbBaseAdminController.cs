using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.ServiceClients;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack;
using ServiceStack.Messaging;
using ServiceStack.Redis;

namespace ExpressBase.Web.BaseControllers
{
    public class EbBaseIntAdminController : EbBaseIntCommonController
    {
        public EbBaseIntAdminController(IServiceClient _ssclient) : base(_ssclient)
        {
        }

        public EbBaseIntAdminController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis)
        {
        }

        public EbBaseIntAdminController(IServiceClient _ssclient, IEbMqClient _mqc) : base(_ssclient, _mqc)
        {
        }

        public EbBaseIntAdminController(IServiceClient _ssclient, IEbStaticFileClient _sfc) : base(_ssclient, _sfc)
        {
        }

        public EbBaseIntAdminController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc) : base(_ssclient, _redis, _mqc)
        {
        }

        public EbBaseIntAdminController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _sfc)
        {
        }

        public EbBaseIntAdminController(IServiceClient _ssclient, IEbMqClient _mqc, IEbStaticFileClient _sfc) : base(_ssclient, _mqc, _sfc)
        {
        }

        public EbBaseIntAdminController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _mqc, _sfc)
        {
        }

        public EbBaseIntAdminController(IServiceClient _ssclient, IRedisClient _redis, IMessageQueueClient _mqFactory, IMessageProducer _mqProducer) : base(_ssclient, _redis, _mqFactory, _mqProducer)
        {
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            base.OnActionExecuting(context);

            if ((context.Controller as Controller).ViewBag.cid != "admin")
            {
                context.Result = new RedirectResult("/StatusCode/401");
            }
        }
    }
}
