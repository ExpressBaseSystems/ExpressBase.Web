using ExpressBase.Web.Filters;
using Microsoft.AspNetCore.Mvc;
using System;

namespace ExpressBase.Web.RateLimitters
{
    public sealed class RedisRateLimitAttribute : TypeFilterAttribute
    {
        public RedisRateLimitAttribute(
            int limit,
            int windowSeconds,
            bool useIp = true,
            bool perPath = true,
            string customKey = null,
            bool useExternalSolutionId = true
        ) : base(typeof(RedisRateLimitFilter))
        {
            Arguments = new object[]
            {
                new RedisRateLimiterOptions
                {
                    Limit = limit,
                    Window = TimeSpan.FromSeconds(windowSeconds),
                    UseIp = useIp,
                    PerPath = perPath,
                    CustomKey = customKey,
                    UseExternalSolutionId = useExternalSolutionId
                }
            };
        }
    }
}
