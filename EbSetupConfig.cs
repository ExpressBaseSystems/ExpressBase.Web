using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web2
{
    public class EbSetupConfig
    {
        public string ServiceStackUrl { get; set; }

        public string RedisServer { get; set; }

        public int RedisPort { get; set; }

        public string RedisPassword { get; set; }

        public string Token { get; set; }

        public IServiceClient GetServiceStackClient()
        {
            return new JsonServiceClient(this.ServiceStackUrl).WithCache();
        }

        public IServiceClient GetServiceStackClient(string bearerToken, string refreshToken)
        {
            this.Token = bearerToken;
            return new JsonServiceClient(this.ServiceStackUrl) { BearerToken = bearerToken, RefreshToken = refreshToken };
        }

        public RedisClient GetRedisClient()
        {
            return new RedisClient(string.Format("redis://{0}@{1}:{2}?ssl=true", this.RedisPassword, this.RedisServer, this.RedisPort));
        }
    }
}
