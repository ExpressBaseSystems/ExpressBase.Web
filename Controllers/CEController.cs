using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ExpressBase.Web2;
using ExpressBase.Web.Filters;
using ExpressBase.Objects;
using DiffPlex.DiffBuilder.Model;
using DiffPlex.DiffBuilder;
using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ServiceStack;
using ExpressBase.Data;
using DiffPlex;
using System.Text;
using ServiceStack.Redis;
using ExpressBase.Common.Objects;
using System.Reflection;
using ExpressBase.Common.Structures;
using ExpressBase.Common.Data;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Constants;
using System.Text.RegularExpressions;
using Newtonsoft.Json;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class CEController : EbBaseIntCommonController
    {
        public CEController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        //[HttpGet]
        //public IActionResult SqlFunction_Editor()
        //{
        //    ViewBag.Header = "New Sql Function";
        //    ViewBag.VersionNumber = 1;
        //    ViewBag.Obj_id = null;
        //    ViewBag.Code = "CREATE OR REPLACE FUNCTION function_name(p1 type, p2 type) \nRETURNS type AS \n$BODY$ \nBEGIN \n\t-- logic \nEND \n$BODY$ \nLANGUAGE language_name";
        //    ViewBag.IsNew = "true";
        //    ViewBag.EditorHint = "CodeMirror.hint.sql";
        //    ViewBag.EditorMode = "text/x-pgsql";
        //    ViewBag.Icon = "fa fa-database";
        //    ViewBag.ObjType = (int)EbObjectTypes.SqlFunction;
        //    ViewBag.ObjectName = "*Untitled";
        //    ViewBag.FilterDialogId = "null";//related to showing selected fd in select fd dropdown 
        //                                    //   ViewBag.FilterDialogs = GetObjects((int)EbObjectType.FilterDialog);
        //    ViewBag.SqlFns = Getsqlfns((int)EbObjectTypes.SqlFunction);
        //    return View();
        //}

        //[HttpPost]
        //public IActionResult SqlFunction_Editor(int i)
        //{
        //    ViewBag.Header = "Edit Sql Function";
        //    var req = this.HttpContext.Request.Form;
        //    string obj_id = req["objid"].ToString();

        //    ViewBag.Obj_id = obj_id;
        //    var resultlist = this.ServiceClient.Get<EbObjectNonCommitedVersionResponse>(new EbObjectNonCommitedVersionRequest { RefId = obj_id });
        //    var rlist = resultlist.Data;
        //    foreach (var element in rlist)
        //    {
        //        ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
        //        List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
        //        ViewBag.LifeCycle = lifeCycle;
        //        ViewBag.IsNew = "false";
        //        var dsobj = EbSerializers.Json_Deserialize<EbSqlFunction>(element.Json);
        //        ViewBag.ObjectName = element.Name;
        //        ViewBag.ObjectDesc = element.Description;
        //        ViewBag.Code = dsobj.Sql;
        //        ViewBag.Status = element.Status;
        //        ViewBag.VersionNumber = element.VersionNumber;
        //        ViewBag.EditorHint = "CodeMirror.hint.sql";
        //        ViewBag.EditorMode = "text/x-sql";
        //        ViewBag.Icon = "fa fa-database";
        //        ViewBag.ObjType = (int)EbObjectTypes.SqlFunction;
        //        ViewBag.FilterDialogId = dsobj.FilterDialogId;

        //    }
        //    ViewBag.SqlFns = Getsqlfns((int)EbObjectTypes.SqlFunction);
        //    return View();
        //}

        public Dictionary<string, EbObjectWrapper> GetObjects_refid_dict(int obj_type)
        {
            var fdresultlist = this.ServiceClient.Get<EbObjectObjListResponse>(new EbObjectObjListRequest { EbObjectType = obj_type });
            var fdrlist = fdresultlist.Data;
            Dictionary<string, EbObjectWrapper> objects_dict = new Dictionary<string, EbObjectWrapper>();
            foreach (var element in fdrlist)
            {
                objects_dict[element.RefId] = element;
            }
            return objects_dict;
        }

        public List<string> Getsqlfns(int obj_type)
        {
            var fdresultlist = this.ServiceClient.Get<EbObjectObjListResponse>(new EbObjectObjListRequest { EbObjectType = obj_type });
            var fdrlist = fdresultlist.Data;
            List<string> objects_list = new List<string>();
            foreach (var element in fdrlist)
            {
                objects_list.Add(element.Name);
            }
            return objects_list;
        }

        public List<EbObjectWrapper> GetVersions(string objid)
        {
            var resultlist = this.ServiceClient.Get<EbObjectAllVersionsResponse>(new EbObjectAllVersionsRequest { RefId = objid });
            var rlist = resultlist.Data;
            return rlist;
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

        public List<EbObjectWrapper> GetStatusHistory(string _refid)
        {
            var resultlist = this.ServiceClient.Get<EbObjectStatusHistoryResponse>(new EbObjectStatusHistoryRequest { RefId = _refid });
            var rlist = resultlist.Data;
            return rlist;
        }
        [HttpPost]
        public string GetColumns4Trial(string ds_refid, List<Param> parameter)
        {
            RedisClient redis = Redis;
            JsonServiceClient sscli = ServiceClient;
            var token = Request.Cookies[string.Format("T_{0}", ViewBag.cid)];
            DataSourceColumnsResponse columnresp = sscli.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = ds_refid.ToString(), Params = parameter });
            if (columnresp.Columns == null || columnresp.Columns.Count == 0)
            {
                return "";
            }
            else
            {
                string colDef = "[";
                var __columns = columnresp.Columns[0];
                foreach (EbDataColumn column in __columns)
                {
                    colDef += "{";
                    colDef += "\"data\": " + __columns[column.ColumnName].ColumnIndex.ToString();
                    colDef += ",\"title\": \"" + column.ColumnName + "\"";
                    colDef += ",\"visible\": " + true.ToString().ToLower();
                    colDef += "},";
                }
                return colDef.Substring(0, colDef.Length - 1) + "]";
            }
        }

        public DataSourceDataResponse getData(DataSourceDataRequest request)
        {
            DataSourceDataResponse resultlist1 = null;
            try
            {
                resultlist1 = this.ServiceClient.Get(request);
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.ToString());
            }
            return resultlist1;
        }
        public int Email(int val)
        {
            List<Param> _param = new List<Param> { new Param { Name = "ids", Type = ((int)EbDbTypes.Int32).ToString(), Value = val.ToString() } };
            ServiceClient.Post(new PdfCreateServiceMqRequest
            {
                ObjId = /*"ebdbllz23nkqd620180220120030-ebdbllz23nkqd620180220120030-15-2174-2909-2174-2909"*/2174,
                Params = _param
            });
            return 0;
        }

        [HttpPost]
        public string ExecSqlFunction(string fname,string _params)
        {
            return JsonConvert.SerializeObject(this.ServiceClient.Post(new SqlFuncTestRequest
            {
                FunctionName = fname,
                Parameters = JsonConvert.DeserializeObject<List<InputParam>>(_params)
            }));
        }

        public string DataWriterSqlEval(string sql, int obj_type)
        {
            sql = Base64Decode(sql);
            List<InputParam> param = new List<InputParam>();
            if (!string.IsNullOrEmpty(sql) && obj_type == EbObjectTypes.DataWriter)
            {
                List<string> _temp = new List<string>();
                Regex r = new Regex(@"\:\w+|\@\w+g");

                foreach (Match match in r.Matches(sql))
                {
                    if (!_temp.Contains(match.Value))
                    {
                        param.Add(new InputParam
                        {
                            Column = match.Value,
                        });

                        _temp.Add(match.Value);
                    }
                }
                return JsonConvert.SerializeObject(param);
            }
            else if (!string.IsNullOrEmpty(sql) && obj_type == EbObjectTypes.SqlFunction)
            {
                Regex r = new Regex(@"(\w+)(\s+|)\(.*?\)");
                Regex r1 = new Regex(@"\(.*?\)");
                string _func = r.Match(sql.Replace("\n", "")).Groups[1].Value;
                string _params = r.Match(sql.Replace("\n", "")).Groups[0].Value;
                string[] _arguments = r1.Match(_params).Groups[0].Value.Replace("(", "").Replace(")", "").Split(",");

                foreach (string _arg in _arguments)
                {
                    param.Add(new InputParam
                    {
                        Column = _arg.Split(" ")[0],
                    });
                }
                return JsonConvert.SerializeObject(new SqlFunParamWrapper { FunctionName = _func, Arguments = param });
            }
            else
                return null;
        }

        private string Base64Decode(string base64EncodedData)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }
    }
}
