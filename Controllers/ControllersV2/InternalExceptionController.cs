using ExpressBase.Common.Models;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web.RateLimitters;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using ServiceStack;
using ServiceStack.Redis;

using System;
using InternalExceptionHelper = ExpressBase.Web.Helpers.InternalExceptionHelper;

namespace ExpressBase.Web.Controllers.ControllersV2
{
    [Microsoft.AspNetCore.Mvc.Route("v2/InternalException")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class InternalExceptionController : EbBaseController
    {
        private readonly IHostingEnvironment _env;
        private static readonly TimeSpan TicketTtl = TimeSpan.FromSeconds(90);

        public InternalExceptionController(
            IServiceClient _client,
            IHttpContextAccessor _cxtacc,
            IEbAuthClient _auth,
            PooledRedisClientManager _pooledRedisManager,
            IHostingEnvironment env
            ) : base(
                _client,
                _cxtacc,
                _auth,
                _pooledRedisManager
                )
        {
            _env = env;
        }

        [HttpGet("{ticketId?}")]
        [RedisRateLimit(limit: 6, windowSeconds: 60, useIp: true, perPath: true, useExternalSolutionId: true, customKey: "internal_exceptions:v2")]
        public IActionResult Index(string ticketId)
        {
            var isDev = _env.IsDevelopment();
            var internalExceptionView = new InternalExceptionView { IsDevelopment = isDev, TicketId = ticketId };
            InternalExceptionHelper internalExceptionHelper = new InternalExceptionHelper(this.PooledRedisManager);


            if (!string.IsNullOrWhiteSpace(ticketId))
            {
                var internalExceptioninfo = internalExceptionHelper.Get(ticketId);

                if (internalExceptioninfo != null)
                {
                    internalExceptionView.Exception = internalExceptioninfo;
                    return View("~/Views/InternalException/Index.cshtml", internalExceptionView);
                }
               
            }

            internalExceptionView.TicketExpiredOrMissing = true;
            internalExceptionView.Exception = null ;
            return View("~/Views/InternalException/Index.cshtml", internalExceptionView);

        }
    }
}
