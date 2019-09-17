using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class DashBoardController : EbBaseIntCommonController
    {
        public DashBoardController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        [HttpPost]
        public string DashBoardView(string refid)
        {
            EbObjectParticularVersionResponse Resp = this.ServiceClient.Post(new EbObjectParticularVersionRequest()
            {
                RefId = refid
            });
           
            return Resp.Data[0].Json;
        }

    }
}
