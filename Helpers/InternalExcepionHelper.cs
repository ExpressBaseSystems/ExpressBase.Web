using ExpressBase.Common.Helpers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack.Redis;
using System;
namespace ExpressBase.Web.Helpers
{
    public static class InternalExcepionHelper
    {
        private const string CachePrefix = "InternalExcepionHelper";
        private const int DefaultTimeSpanSeconds = 60;

        private static PooledRedisClientManager GetRedisManager(Controller controller)
        {
            if (controller == null)
                throw new ArgumentNullException(nameof(controller));

            var serviceProvider = controller.HttpContext?.RequestServices;

            if (serviceProvider == null)
                throw new InvalidOperationException("RequestServices not available in controller context.");

            var redisManager = serviceProvider.GetService(typeof(PooledRedisClientManager)) as PooledRedisClientManager;

            if (redisManager == null)
                throw new InvalidOperationException("PooledRedisClientManager not registered in DI container.");

            return redisManager;
        }

        private static void Set(Controller controller, Exception exception, string prefix, TimeSpan? ttl = null)
        {
            var redisManager = GetRedisManager(controller);
            var serializableEx = SerializableExceptionDto.FromException(exception);

            RedisCacheHelper.Set(redisManager, CachePrefix + prefix, serializableEx, ttl);
        }

        public static IActionResult Redirect(Exception exception, Controller controller, TimeSpan? ttl = null)
        {
            if (controller == null)
                throw new ArgumentNullException(nameof(controller));

            if (exception == null)
                throw new ArgumentNullException(nameof(exception));

            string ticketId = Guid.NewGuid().ToString("N");

            Set(controller, exception, ticketId, ttl ?? TimeSpan.FromSeconds(DefaultTimeSpanSeconds));

            return controller.RedirectToAction(
                "Index",
                "InternalException",
                new { ticketId }
            );
        }

        public static SerializableExceptionDto Get(Controller controller, string ticketId)
        {
            if (controller == null)
                throw new ArgumentNullException(nameof(controller));

            if (string.IsNullOrWhiteSpace(ticketId))
                throw new ArgumentNullException(nameof(ticketId));

            var redisManager = GetRedisManager(controller);

            var key = CachePrefix + ticketId;

            if (RedisCacheHelper.Exists(redisManager, key))
            {
                return RedisCacheHelper.Get<SerializableExceptionDto>(redisManager, key);
            }

            return null;
        }

    }
}
