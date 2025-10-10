using ExpressBase.Common.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServiceStack.Redis;
using System;

namespace ExpressBase.Web.Helpers
{
    public class InternalExceptionHelper : ExpressBase.Common.Helpers.InternalExceptionHelper
    {
        public InternalExceptionHelper(IServiceProvider serviceProvider) : base(serviceProvider.GetService(typeof(PooledRedisClientManager)) as PooledRedisClientManager)
        {
        }

        /// <summary>
        /// Create ticket and return a redirect to ErrorController.Index with { ticketId }.
        /// </summary>
        public IActionResult Redirect(Exception exception, Controller controller, TimeSpan? ttl = null)
        {
            if (controller == null) throw new ArgumentNullException(nameof(controller));
            var ticketId = this.Create(exception, ttl ?? TimeSpan.FromSeconds(90));
            return controller.RedirectToAction("Index", "InternalException", new { ticketId });
        }
    }
}
