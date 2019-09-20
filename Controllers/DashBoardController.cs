using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Objects;
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
        public IActionResult DashBoardView(string refid)
        {
            Type[] typeArray = typeof(EbDashBoardWraper).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DashBoard, typeof(EbDashBoardWraper));

            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectType = _jsResult.EbObjectTypes;

            EbObjectParticularVersionResponse Resp = this.ServiceClient.Post(new EbObjectParticularVersionRequest()
            {
                RefId = refid
            });
            //ViewBag.Refid = refid;
            ViewBag.VersionNumber = Resp.Data[0].VersionNumber;
            ViewBag.ObjType = Resp.Data[0].EbObjectType;
            ViewBag.dsObj = Resp.Data[0].Json;
            ViewBag.Status = Resp.Data[0].Status;
            return View();
        }
    }
}
