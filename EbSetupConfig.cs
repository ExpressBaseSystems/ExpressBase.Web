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

        public string RedisUrl { get; set; }

        public IServiceClient GetServiceStackClient()
        {
            return new JsonServiceClient(this.ServiceStackUrl).WithCache();
        }

        public RedisClient GetRedisClient()
        {
            return new RedisClient("139.59.39.130", 6379, "Opera754$");
        }
    }
}
