using ExpressBase.Common.Helpers;
using ExpressBase.Web.Helpers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System;

namespace ExpressBase.Web.Controllers.ControllersV2
{
    [Microsoft.AspNetCore.Mvc.Route("v2/InternalException")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class InternalExceptionController : Controller
    {
        private readonly IHostingEnvironment _env;
        private readonly IServiceProvider _serviceProvider;
        private static readonly TimeSpan TicketTtl = TimeSpan.FromSeconds(90);

        public InternalExceptionController(IServiceProvider serviceProvider,IHostingEnvironment env) 
        {
            _env = env;
            _serviceProvider = serviceProvider;
        }

        [HttpGet("{ticketId?}")]
        //[RedisRateLimit(limit: 6, windowSeconds: 60, useIp: true, perPath: true, useExternalSolutionId: true, customKey: "internal_exceptions:v2")]
        public IActionResult Index(string ticketId)
        {
            var isDev = _env.IsDevelopment();

            if (HttpContextHelper.WantsJson(HttpContext))
            {
                SerializableExceptionDto exception = null;

                if (StringHelper.HasValue(ticketId))
                {
                    exception = InternalExcepionHelper.Get(this, ticketId);
                }

                var jsonResponse = new
                {
                    IsDevelopment = isDev,
                    TicketId = ticketId,
                    Exception = isDev ? exception?.Message : "an excpetion oocurred",
                    StackTrace = isDev ? exception?.StackTrace : null,
                    InnerExcerption = isDev ? exception?.InnerException?.Message : null,
                    InnerExcerptionStackTrace = isDev ? exception?.InnerException?.StackTrace : null,
                };

                return new JsonResult(jsonResponse);
            }


            if (StringHelper.HasValue(ticketId))
            {
                SerializableExceptionDto exception = InternalExcepionHelper.Get(this, ticketId);

                if (exception != null)
                {
                    return View(
                        "~/Views/InternalException/Index.cshtml",
                        new InternalExceptionViewModel
                        {
                            IsDevelopment = isDev,
                            TicketId = ticketId,
                            Exception = exception
                        }
                    );
                }
            }

            return View(
                "~/Views/InternalException/Index.cshtml",
                new InternalExceptionViewModel
                {
                    IsDevelopment = isDev,
                    TicketId = ticketId
                }
            );
        }

    }

    public sealed class InternalExceptionViewModel
    {
        public bool IsDevelopment { get; set; }
        public string TicketId { get; set; }
        public SerializableExceptionDto Exception { get; set; }
    }

}
