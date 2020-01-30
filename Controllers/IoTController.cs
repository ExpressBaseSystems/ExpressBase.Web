using ExpressBase.Objects.ServiceStack_Artifacts;
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
         
        public void PushData(string data)
        {
            IoTDataResponse resultlist = this.ServiceClient.Get<IoTDataResponse>(new IoTDataRequest { Data =  data});
            Console.WriteLine("__________________________________________________Received Input Data : " + data);

        }
    }
}
