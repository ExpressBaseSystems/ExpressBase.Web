using ExpressBase.Common;
using ExpressBase.Common.Data;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.ServiceStack;
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
using ExpressBase.Security;
using System.Globalization;
using ExpressBase.Common.Singletons;
using System.Data.Common;

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
            //ListSqlJobsResponse resp = this.ServiceClient.Get(new ListSqlJobsRequest()
            //{
            //    RefId = Refid,
            //    Date = Date

            //});
            //return resp;

            ListSqlJobsResponse resp = new ListSqlJobsResponse();
            string query = @"
                    SELECT
                        logmaster_id , message, u.firstname as executed_by, l.createdat as executed_at, COALESCE(status, 'F') status, l.id, keyvalues 
                    FROM
                        eb_joblogs_lines l, eb_users u 
                    WHERE
                        u.id =l.createdby AND
                        logmaster_id IN (SELECT id FROM eb_joblogs_master WHERE to_char(created_at, 'dd-mm-yyyy') = :date AND refid = :refid AND COALESCE(eb_del,'F') = 'F') AND 
                        l.id NOT IN (SELECT retry_of FROM eb_joblogs_lines) AND COALESCE(l.eb_del,'F') = 'F'
                    ORDER BY 
                        logmaster_id DESC, status ASC; ";
            List<Param> _params = new List<Param>();
            _params.Add(new Param { Name = "date",Type = ((int)EbDbTypes.String).ToString() , Value = Date });
            _params.Add(new Param { Name = "refid", Type = ((int)EbDbTypes.String).ToString(), Value = Refid });
            string[] arrayy = new string[] { "logmaster_id", "message", "executed_by", "executed_at", "status", "id", "keyvalues" };
            DVColumnCollection DVColumnCollection = GetColumnsForSqlJob(arrayy);
            EbDataVisualization Visualization = new EbTableVisualization { Sql = query, ParamsList = _params,  Columns = DVColumnCollection, AutoGen = false, IsPaging=true };
            List<DVBaseColumn> RowGroupingColumns = new List<DVBaseColumn> { Visualization.Columns.Get("logmaster_id") };
            (Visualization as EbTableVisualization).RowGroupCollection.Add(new SingleLevelRowGroup { RowGrouping = RowGroupingColumns, Name = "singlelevel" });
            (Visualization as EbTableVisualization).CurrentRowGroup = (Visualization as EbTableVisualization).RowGroupCollection[0];
            resp.Visualization = EbSerializers.Json_Serialize(Visualization);
            var x = EbSerializers.Json_Serialize(resp);
            return resp;
        }

        public DVColumnCollection GetColumnsForSqlJob(string[] strArray)
        {
            var Columns = new DVColumnCollection();
            try
            {
                foreach (string str in strArray)
                {
                    DVBaseColumn _col = null;
                    if (str == "logmaster_id")
                        _col = new DVNumericColumn { Data = 0, Name = str, sTitle = str, Type = EbDbTypes.Int32, bVisible = false };                   
                   if (str == "executed_by")
                        _col = new DVStringColumn { Data = 2, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                   if (str == "executed_at")
                        _col = new DVDateTimeColumn { Data = 3, Name = str, sTitle = str, Type = EbDbTypes.Date, bVisible = true,Format = DateFormat.DateTime };
                   if (str == "status")
                        _col = new DVStringColumn { Data = 4, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                   if (str == "id")
                        _col = new DVNumericColumn { Data = 5, Name = str, sTitle = str, Type = EbDbTypes.Int32, bVisible = false };
                   if (str == "keyvalues")
                        _col = new DVStringColumn { Data = 6,  sTitle = str, Type = EbDbTypes.String, bVisible = false };
                    if (str == "message")
                        _col = new DVStringColumn { Data = 1, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    _col.Name = str;
                    _col.RenderType = _col.Type;
                    _col.ClassName = "tdheight";
                    _col.Font = null;
                    _col.Align = Align.Left;
                    Columns.Add(_col);
                }
                var str1 = String.Format("T0.status == \"{0}\"", "F");
                Columns.Add(new DVButtonColumn { Data = 7, Name = "Action", sTitle = "Action", ButtonText = "Retry", bVisible = true, IsCustomColumn = true,ButtonClassName= "retryBtn", RenderCondition = new AdvancedCondition { Value = new EbScript { Code = str1, Lang = ScriptingLanguage.CSharp } } });
            }
            catch (Exception e)
            {
                Console.WriteLine("no coloms" + e.StackTrace);
            }

            return Columns;
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
                    Eb_Solution solu = GetSolutionObject(ViewBag.cid);
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
        public string RetryMaster(int masterId, string RefId, List<Param> Param)
        {
            masterId = 188;
            RetryMasterResponse resp = this.ServiceClient.Post(new RetryMasterRequest { MasterId = masterId, RefId = RefId, GlobalParams = Param });
            return resp.ResponseStatus.Message;
        }

        public string DeleteJobExecution(int masterId)
        {
            masterId = 189; 
            DeleteJobExecutionResponse resp = this.ServiceClient.Post(new DeleteJobExecutionRequest {MasterId = masterId});
            return resp.ResponseStatus.Message;
        }
    }
}
