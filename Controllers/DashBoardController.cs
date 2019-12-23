using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Data;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
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
        public IActionResult DashBoardView(string refid, string rowData, string filterValues, int tabNum)
        {
            Type[] typeArray = typeof(EbDashBoardWraper).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DashBoard, typeof(EbDashBoardWraper),typeof(EbObject));
            ViewBag.al_arz_map_key = Environment.GetEnvironmentVariable(EnvironmentConstants.AL_GOOGLE_MAP_KEY);
            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;

            EbObjectParticularVersionResponse Resp = this.ServiceClient.Post(new EbObjectParticularVersionRequest()
            {
                RefId = refid
            });
            //ViewBag.Refid = refid;
            ViewBag.VersionNumber = Resp.Data[0].VersionNumber;
            ViewBag.ObjType = Resp.Data[0].EbObjectType;
            ViewBag.dsObj = Resp.Data[0].Json;
            ViewBag.Status = Resp.Data[0].Status;
            ViewBag.filterValues = filterValues;
            ViewBag.tabNum = tabNum;
            ViewBag.rowData = rowData;
            ViewBag.ControlOperations = EbControlContainer.GetControlOpsJS((new EbUserControl()) as EbControlContainer, BuilderType.UserControl);
            //ViewBag.ObjectIds = this.LoggedInUser.EbObjectIds;
            return View();
        }

        public string UserControlGetObj(string refid , List<Param> param)
        {
            GetDashBoardUserCtrlResponse Resp = this.ServiceClient.Post(new GetDashBoardUserCtrlRequest() { RefId = refid, Param = param });

            return JsonConvert.SerializeObject(Resp);
        }

        public IActionResult GetFilterBody(string dvobj, string contextId)
        {
            var dsObject = EbSerializers.Json_Deserialize(dvobj);
            dsObject.AfterRedisGet(this.Redis, this.ServiceClient);
            Eb_Solution solu = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", ViewBag.cid));
            if (dsObject.FilterDialog != null)
                EbControlContainer.SetContextId(dsObject.FilterDialog, contextId);
            return ViewComponent("ParameterDiv", new { FilterDialogObj = dsObject.FilterDialog, _user = this.LoggedInUser, _sol = solu, wc = "dc" }); 
        }
    }
}
