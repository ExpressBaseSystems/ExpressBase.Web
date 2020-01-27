using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Controllers
{
    public class IoTController : EbBaseExtController
    {
        public IoTController(IServiceClient _ssclient) : base(_ssclient) { }


        [HttpPost]
        public void PushData(string data)
        {
            Console.WriteLine("__________________________________________________Received Input Data : " + data);

        }
    }
}
