using System;

namespace ExpressBase.Web.RateLimitters
{
    public sealed class RedisRateLimiterOptions
    {
        public int Limit { get; set; }  
        public TimeSpan Window { get; set; }
        public bool UseIp { get; set; } = true;
        public string CustomKey { get; set; }
        public bool PerPath { get; set; } = true;
        public bool UseExternalSolutionId { get; set; } = false;
    }
}
