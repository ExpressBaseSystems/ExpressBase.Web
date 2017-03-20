using ServiceStack;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web2
{
    public class ServiceStackConfig
    {
        public string Url { get; set; }

        public IServiceClient GetClient()
        {
            return new JsonServiceClient(this.Url).WithCache();
        }
    }
}
