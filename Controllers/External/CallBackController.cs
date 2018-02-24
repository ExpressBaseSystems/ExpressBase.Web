using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.Controllers.External
{
    public class CallBackController : EbBaseExtController
    {
        public CallBackController(IServiceClient _client, IRedisClient _redis)
            : base(_client, _redis) { }


        [HttpGet("iata/callback/{res}")]
        public void IATANDCCallBack()
        {
            Console.WriteLine("IATA Call Back Http Get");
        }

        [HttpPost("iata/callback/{res}")]
        public void IATANDCCallBack(string res)
        {
            Console.WriteLine("IATA Call Back Http Post with res");
            Console.WriteLine(res);
        }

        [HttpPost("iata/callback/")]
        public void IATANDCCallBack(int i)
        {
            Console.WriteLine("IATA Call Back Http Post No Res");
        }
    }
}