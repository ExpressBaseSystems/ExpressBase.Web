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
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace ExpressBase.Web.Controllers
{
    public class SqlJobController : EbBaseIntCommonController
    {
        public SqlJobController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public SqlJobResponse ExecuteSqlJob(string Refid , List<Param> Param)
        {
            SqlJobResponse resp = this.ServiceClient.Post<SqlJobResponse>(new SqlJobRequest
            {
                RefId = Refid,
                GlobalParams = new List<Param> { new Param { Name = "date_to_consolidate", Type = "6", Value = "28-02-2015" } }
            });
            return resp;
        }
         
        public IActionResult SqlJobConsole()
        {
            Type[] typeArray = typeof(EbDashBoardWraper).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DashBoard, typeof(EbObject));
            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;
            ViewBag.ControlOperations = EbControlContainer.GetControlOpsJS((new EbWebForm()) as EbControlContainer, BuilderType.FilterDialog);

            List<int> types = new List<int>() { 26 };
            GetAllLiveObjectsResp Result = this.ServiceClient.Get<GetAllLiveObjectsResp>(new GetAllLiveObjectsRqst { Typelist = types });
            ViewBag.SqlJobObject = JsonConvert.SerializeObject(Result.Data);
            return View();
        }

        public IActionResult GetScheduleVc(int ObjId)
        {
            return ViewComponent("SchedulerWindow", new { objid = ObjId, tasktype = JobTypes.SqlTask });
        }

        public SqlJobsListGetResponse Get_Jobs_List(string Refid , string Date)
        {
            SqlJobsListGetResponse resp = this.ServiceClient.Get(new SqlJobsListGetRequest()
            {
                RefId = Refid,
                Date = Date

            });
            var Temp = new DSController(this.ServiceClient, this.Redis);
            resp.SqlJobsDvColumns = EbSerializers.Json_Serialize(Temp.GetColumnsForSqlJob(resp.SqlJobsColumns));
            return resp;
        }


        public string GetSqljobObject(string refid)
        {
            EbObjectParticularVersionResponse Resp = this.ServiceClient.Post(new EbObjectParticularVersionRequest()
            {
                RefId = refid
            });
            return Resp.Data[0].Json;
        }
        public IActionResult GetFilterBody(string dvobj, string contextId)
        {
            var dsObject = EbSerializers.Json_Deserialize(dvobj);
            dsObject.AfterRedisGet(this.Redis, this.ServiceClient);
            Eb_Solution solu = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", ViewBag.cid));
            if (dsObject.FilterDialog != null)
                EbControlContainer.SetContextId(dsObject.FilterDialog, contextId);
            return ViewComponent("ParameterDiv", new { FilterDialogObj = dsObject.FilterDialog, _user = this.LoggedInUser, _sol = solu, wc = "dc", noCtrlOps = true });
        }

        public RetryJobResponse JobRetry(int id)
        {
            RetryJobResponse response = this.ServiceClient.Post<RetryJobResponse>(new RetryJobRequest { JoblogId = id, RefId = "ebdbllz23nkqd620180220120030-ebdbllz23nkqd620180220120030-26-2642-3506-2642-3506" });
            return response;
        }

        public void ProcessorLogic()
        {
            this.ServiceClient.Post<ProcessorResponse>(new ProcessorRequest()); ;
        }
    }
}
