using ExpressBase.Web.Helpers;
using ExpressBase.Web.RateLimitters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack.Redis;
using System;

namespace ExpressBase.Web.Filters
{
    public class RedisRateLimitFilter : IActionFilter
    {
        private readonly PooledRedisClientManager _pool;
        private readonly RedisRateLimiterOptions _opt;

        private static string ToUnixSeconds(DateTimeOffset dto) =>
            ((long)(dto - DateTimeOffset.UnixEpoch).TotalSeconds).ToString();

        public RedisRateLimitFilter(PooledRedisClientManager pool, RedisRateLimiterOptions options)
        {
            _pool = pool ?? throw new ArgumentNullException(nameof(pool));
            _opt = options ?? throw new ArgumentNullException(nameof(options));
        }

        public void OnActionExecuting(ActionExecutingContext ctx)
        {
            if (_opt.Limit <= 0 || _opt.Window <= TimeSpan.Zero) return;

            var now = DateTimeOffset.UtcNow;

            var aligned = now.Ticks - (now.Ticks % _opt.Window.Ticks);
            var windowStart = new DateTimeOffset(aligned, TimeSpan.Zero);
            var resetAt = windowStart.Add(_opt.Window);

            var parts = new System.Collections.Generic.List<string>();

            if (!string.IsNullOrWhiteSpace(_opt.CustomKey))
                parts.Add("k=" + _opt.CustomKey.Trim());

            if (_opt.UseIp)
            {
                var ip = HttpContextHelper.GetClientIp(ctx);
                if (!string.IsNullOrWhiteSpace(ip)) parts.Add("ip=" + ip);
            }

            if(_opt.UseExternalSolutionId)
            {
                var subdomain = ctx.HttpContext.Items["ExternalSolutionId"] as string;
                if (!string.IsNullOrWhiteSpace(subdomain))
                    parts.Add("ExternalSolutionId=" + subdomain);
            }

            var identity = parts.Count > 0 ? string.Join("|", parts) : null;
            if (string.IsNullOrEmpty(identity))
                identity = "anon";

            var path = _opt.PerPath ? (ctx.HttpContext.Request.Path.Value ?? "/") : "*";
            var key = $"rl:{identity}:{path}:{_opt.Window.Ticks}:{windowStart.Ticks}";
            

            long count;
            using (var redis = _pool.GetClient())
            {
                count = redis.IncrementValue(key);
                
                if (count == 1)
                {

                    var ttl = resetAt - now;
                    if (ttl < TimeSpan.Zero) ttl = TimeSpan.Zero;
                    redis.ExpireEntryIn(key, ttl);
                }
            }

            if (count > _opt.Limit)
            {
                var secs = Math.Max(0, (int)(resetAt - now).TotalSeconds);
                var resp = ctx.HttpContext.Response;
                resp.Headers["Retry-After"] = secs.ToString();
                resp.Headers["X-RateLimit-Limit"] = _opt.Limit.ToString();
                resp.Headers["X-RateLimit-Remaining"] = "0";
                resp.Headers["X-RateLimit-Reset"] = ToUnixSeconds(resetAt);

                ctx.Result = BuildRateLimitedResult(ctx, "Rate limit exceeded. Try again later.");
                return;
            }

            var remaining = Math.Max(0, _opt.Limit - (int)count);
            var headers = ctx.HttpContext.Response.Headers;
            headers["X-RateLimit-Limit"] = _opt.Limit.ToString();
            headers["X-RateLimit-Remaining"] = remaining.ToString();
            headers["X-RateLimit-Reset"] = ToUnixSeconds(resetAt);
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {

        }

        private static IActionResult BuildRateLimitedResult(ActionExecutingContext ctx, string message, object extra = null)
        {
            if (HttpContextHelper.WantsJson(ctx))
            {
                object payload = null;

                if (extra != null)
                {
                    payload = new { error = "rate_limit_exceeded", message, extra };

                }
                else
                {
                    payload = new { error = "rate_limit_exceeded", message };
                }


                return new JsonResult(payload) { StatusCode = 429 };
            }

            return new ContentResult { StatusCode = 429, Content = message };
        }
    }
}
