using ExpressBase.Common.Helpers;
using ExpressBase.Web.Helpers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack.Redis;
using System;

namespace ExpressBase.Web.Controllers.ControllersV2
{
    [ApiController]
    [Route("v2/[controller]")]
    public class HealthCheckController : ControllerBase
    {
        [HttpGet]
        public IActionResult Index()
        {
            try
            {

                string redisStatus = "Unknown";
                string testValue = null;
                string testKey = "healthcheck:testkey";
                string testData = Guid.NewGuid().ToString();
                var serverTimeZone = TimeZoneInfo.Local;
                var utcNow = DateTime.UtcNow;
                var localNow = TimeZoneInfo.ConvertTimeFromUtc(utcNow, serverTimeZone);

                try
                {
                    var sp = HttpContext != null ? HttpContext.RequestServices : null;

                    if (sp?.GetService(typeof(PooledRedisClientManager)) is PooledRedisClientManager pooledRedisClientManager)
                    {

                        var ttl = TimeSpan.FromSeconds(30);
                        RedisCacheHelper.SetRaw(pooledRedisClientManager, testKey, testData, ttl);


                        testValue = RedisCacheHelper.GetRaw(pooledRedisClientManager, testKey);


                        redisStatus = testValue == testData ? "ReadWriteOK" : "ReadWriteMismatch";

                    }
                    else
                    {
                        redisStatus = "NoServiceProvider";
                    }
                }
                catch (Exception ex)
                {
                    redisStatus = "Error: " + ex.Message;
                }

                var response = new
                {
                    status = "Healthy",
                    timestamp = localNow,
                    timeZone = new
                    {
                        id = serverTimeZone.Id,
                        displayName = serverTimeZone.DisplayName
                    },
                    environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                    machine = Environment.MachineName,
                    redis = new
                    {
                        status = redisStatus,
                        sampleValue = testValue,
                        ttlSeconds = 30
                    },
                    clientIp = HttpContextHelper.GetClientIp(this.ControllerContext),
                    host = HttpContext.Items["Host"]?.ToString()
                };

                return Ok(response);
            }
            catch (Exception exception)
            {
                var response = new
                {
                    status = "UnHealthy",
                    exception = exception.Message,
                };

                return Ok(response);
            }
        }
    }
}
