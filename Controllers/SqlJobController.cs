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

        public string ExecuteSqlJob(string Refid, List<Param> Param)
        {
            ExecuteSqlJobResponse resp = this.ServiceClient.Post<ExecuteSqlJobResponse>(new ExecuteSqlJobRequest
            {
                RefId = Refid,
                GlobalParams = Param
            });
            return resp.Message;
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
            return ViewComponent("SchedulerWindow", new { objid = ObjId, tasktype = JobTypes.SqlJobTask });
        }

        public ListSqlJobsResponse Get_Jobs_List(string Refid, string Date)
        {
            ListSqlJobsResponse resp = this.ServiceClient.Get(new ListSqlJobsRequest()
            {
                RefId = Refid,
                Date = Date

            });
            return resp;
        }

        public string AppendFRKColomns(string Refid)
        {
            List<string> ColomnList = new List<string>();
            DataSourceColumnsResponse columnresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", Refid));
            EbObjectParticularVersionResponse Resp = this.ServiceClient.Post(new EbObjectParticularVersionRequest()
            {
                RefId = Refid
            });
            var drObj = EbSerializers.Json_Deserialize(Resp.Data[0].Json) as EbDataReader;
            drObj.AfterRedisGet(this.Redis, this.ServiceClient);
            if (columnresp == null || columnresp.Columns.Count == 0)
            {
                Console.WriteLine("Column Object in Redis is null or count 0");
                columnresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new TableColumnsRequest { RefId = Refid, Params = (drObj.FilterDialog != null) ? drObj.FilterDialog.GetDefaultParams() : null });
                if (columnresp == null || columnresp.Columns.Count == 0)
                {
                    Console.WriteLine("Column Object from SS is null or count 0");
                    throw new Exception("Object Not found(Redis + SS)");
                }
            }
            for (int i = 0; i < columnresp.Columns[0].Count; i++)
            {
                ColomnList.Add(columnresp.Columns[0][i].ColumnName);
            }
            //return EbSerializers.Json_Serialize(ColomnList);
            return EbSerializers.Json_Serialize(columnresp.Columns[0]);
        }

        public string AppendPKColomns(string Refid)
        {
            List<string> ColomnList = new List<string>();
            List<Param> Para = null;
            if (Refid != null)
            {
                EbObjectParticularVersionResponse Resp = this.ServiceClient.Post(new EbObjectParticularVersionRequest()
                {
                    RefId = Refid
                });
                var drObj = EbSerializers.Json_Deserialize(Resp.Data[0].Json) as EbFilterDialog;
                Para = drObj.GetDefaultParams();
                for (int i = 0; i < Para.Count; i++)
                {
                    ColomnList.Add(Para[i].Name);
                }
            }
            return EbSerializers.Json_Serialize(Para);
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
            ViewComponentResult result = null;
            try
            {
                var dsObject = EbSerializers.Json_Deserialize(dvobj);
                if (dsObject != null)
                {
                    dsObject.AfterRedisGet(this.Redis, this.ServiceClient);
                    Eb_Solution solu = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", ViewBag.cid));
                    if (dsObject.FilterDialog != null)
                        EbControlContainer.SetContextId(dsObject.FilterDialog, contextId);
                    result = ViewComponent("ParameterDiv", new { FilterDialogObj = dsObject.FilterDialog, _user = this.LoggedInUser, _sol = solu, wc = "dc", noCtrlOps = true });
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.StackTrace + e.Message);
            }
            return result;
        }

        // retry a single line
        public RetryLineResponse JobRetry(int id, string RefId)
        {
            RetryLineResponse response = null;
            if (id > 0 && RefId != null && RefId != String.Empty)
                response = this.ServiceClient.Post(new RetryLineRequest { JoblogId = id, RefId = RefId });
            return response;
        }

        //run a job again
        public string RetryMaster(int masteId, string RefId, List<Param> Param)
        {
            RetryMasterResponse resp = this.ServiceClient.Post(new RetryMasterRequest { MasterId = masteId, RefId = RefId, GlobalParams = Param });

            return resp.ResponseStatus.Message;
        }
    }
}
