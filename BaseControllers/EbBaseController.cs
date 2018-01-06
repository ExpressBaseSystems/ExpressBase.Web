using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Messaging;
using ServiceStack.Redis;

namespace ExpressBase.Web.BaseControllers
{
    public class EbBaseController : Controller
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public EbBaseController(IServiceClient _ssclient)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
        }

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }
    }
}