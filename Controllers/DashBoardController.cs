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

namespace ExpressBase.Web.Controllers
{
    public class DashBoardController : EbBaseIntCommonController
    {
        public DashBoardController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        [HttpPost]
        public string DashBoardGetObj(string refid)
        {
            EbObjectParticularVersionResponse Resp = this.ServiceClient.Post(new EbObjectParticularVersionRequest()
            {
                RefId = refid
            });

            return Resp.Data[0].Json;
        }
        public IActionResult DashBoardView()
        {
            return View();
        }
    }
}
