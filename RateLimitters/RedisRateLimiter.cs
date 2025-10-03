using ExpressBase.Web.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.RateLimitters
{
    internal static class RedisRateLimiter
    {
        internal sealed class Options
        {
            public int Limit { get; set; }                 // e.g., 20
            public TimeSpan Window { get; set; }           // e.g., TimeSpan.FromSeconds(30)
            public bool UseIp { get; set; } = true;        // fall back to IP if no CustomKey
            public string CustomKey { get; set; }          // if set, this is used as the identity
            public bool PerPath { get; set; } = true;      // true => bucket per request path
        }

        /// <summary>
        /// Limit by CustomKey (if provided) and, or by IP. Writes 429 and rate headers when exceeded.
        /// </summary>
        public static void Apply(ActionExecutingContext ctx, PooledRedisClientManager pool, Options opt)
        {
            if (ctx == null || pool == null || opt == null || opt.Limit <= 0 || opt.Window <= TimeSpan.Zero)
                return;

            var now = DateTimeOffset.UtcNow;

            // Align to fixed window
            var aligned = now.Ticks - (now.Ticks % opt.Window.Ticks);
            var windowStart = new DateTimeOffset(aligned, TimeSpan.Zero);
            var resetAt = windowStart.Add(opt.Window);


            string identity = null;

            var parts = new System.Collections.Generic.List<string>();

            if (!string.IsNullOrWhiteSpace(opt.CustomKey))
                parts.Add("k=" + opt.CustomKey.Trim());

            if (opt.UseIp)
            {
                var ip = GetClientIp(ctx);
                if (!string.IsNullOrWhiteSpace(ip)) parts.Add("ip=" + ip);
            }

            identity = parts.Count > 0 ? string.Join("|", parts) : null;

            var path = opt.PerPath ? (ctx.HttpContext.Request.Path.Value ?? "/") : "*";
            var key = $"rl:{identity}:{path}:{opt.Window.Ticks}:{windowStart.Ticks}";

            long count;
            using (var redis = pool.GetClient())
            {
                count = redis.IncrementValue(key);
                if (count == 1) redis.ExpireEntryIn(key, resetAt - now);
            }

            if (count > opt.Limit)
            {
                var secs = Math.Max(0, (int)(resetAt - now).TotalSeconds);
                var resp = ctx.HttpContext.Response;
                resp.Headers["Retry-After"] = secs.ToString();
                resp.Headers["X-RateLimit-Limit"] = opt.Limit.ToString();
                resp.Headers["X-RateLimit-Remaining"] = "0";
                resp.Headers["X-RateLimit-Reset"] = ToUnixSeconds(resetAt);

                ctx.Result = RateLimitedResult(ctx, "Rate limit exceeded. Try again later.");
                return;
            }

            var remaining = Math.Max(0, opt.Limit - (int)count);
            var headers = ctx.HttpContext.Response.Headers;
            headers["X-RateLimit-Limit"] = opt.Limit.ToString();
            headers["X-RateLimit-Remaining"] = remaining.ToString();
            headers["X-RateLimit-Reset"] = ToUnixSeconds(resetAt);
        }

        internal static void Apply(ActionExecutingContext context, object pool, Options options)
        {
            throw new NotImplementedException();
        }

        private static string GetClientIp(ActionExecutingContext ctx)
        {
            return HttpContextHelper.GetClientIp(ctx);
        }

        private static bool WantsJson(ActionExecutingContext ctx)
        {
            return HttpContextHelper.WantsJson(ctx);
        }

        private static IActionResult RateLimitedResult(ActionExecutingContext ctx, string message, object extra = null)
        {
            if (WantsJson(ctx))
            {
                object payload = null;

                if(extra != null)
                {
                    payload = new { error = "rate_limit_exceeded", message, extra };

                } else
                {
                    payload = new { error = "rate_limit_exceeded", message};
                }

                
                return new JsonResult(payload) { StatusCode = 429 };
            }

            return new ContentResult { StatusCode = 429, Content = message };
        }

        private static string ToUnixSeconds(DateTimeOffset dto) =>
            ((long)(dto - DateTimeOffset.UnixEpoch).TotalSeconds).ToString();



    }
}
