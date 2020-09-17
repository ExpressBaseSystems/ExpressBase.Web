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
            string Type = refid.Split("-")[2];
            EbObject Resp1 = new EbObject();
            if (Type == "17")
                Resp1 = EbFormHelper.GetEbObject<EbChartVisualization>(refid, this.ServiceClient, this.Redis, null);
            else if (Type == "16")
                Resp1 = EbFormHelper.GetEbObject<EbTableVisualization>(refid, this.ServiceClient, this.Redis, null);
            string s = EbSerializers.Json_Serialize(Resp1);
            return s;
        }
        public IActionResult DashBoardView(string refid, string rowData, string filterValues, int tabNum)
        {
            Type[] typeArray = typeof(EbDashBoardWraper).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DashBoard, typeof(EbObject));
            ViewBag.al_arz_map_key = Environment.GetEnvironmentVariable(EnvironmentConstants.AL_GOOGLE_MAP_KEY);
            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;
            //EbObjectParticularVersionResponse Resp = this.ServiceClient.Post(new EbObjectParticularVersionRequest(){ RefId = refid  });
            EbObject EbObj = EbFormHelper.GetEbObject<EbDashBoard>(refid, this.ServiceClient, this.Redis, null);
            ViewBag.VersionNumber = EbObj.VersionNumber;
            ViewBag.dsObj = EbSerializers.Json_Serialize(EbObj);
            ViewBag.Status = EbObj.Status;
            ViewBag.filterValues = filterValues;
            ViewBag.tabNum = tabNum;
            ViewBag.rowData = rowData;
            ViewBag.ControlOperations = EbControlContainer.GetControlOpsJS((new EbWebForm()) as EbControlContainer, BuilderType.WebForm);
            //ViewBag.ObjectIds = this.LoggedInUser.EbObjectIds;
            return View();
        }

        public string UserControlGetObj(string refid, List<Param> param)
        {
            param = new List<Param> { new Param { Name = "id", Type = "7", Value = "10" } };
            GetDashBoardUserCtrlResponse Resp = this.ServiceClient.Post(new GetDashBoardUserCtrlRequest() { RefId = refid, Param = param });

            return JsonConvert.SerializeObject(Resp);
        }

        public IActionResult GetFilterBody(string dvobj, string contextId)
        {
            var dsObject = EbSerializers.Json_Deserialize(dvobj);
            dsObject.AfterRedisGet(this.Redis, this.ServiceClient);
            Eb_Solution solu = GetSolutionObject(ViewBag.cid);
            if (dsObject.FilterDialog != null)
                EbControlContainer.SetContextId(dsObject.FilterDialog, contextId);
            return ViewComponent("ParameterDiv", new { FilterDialogObj = dsObject.FilterDialog, _user = this.LoggedInUser, _sol = solu, wc = "dc", noCtrlOps = true });
        }
    }
}
