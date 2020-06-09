﻿using System;
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
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Common.Extensions;
using ExpressBase.Objects.Helpers;

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

            Eb_Solution s_obj = GetSolutionObject(ViewBag.cid); 
            if (dsObject.FilterDialog != null)
                EbControlContainer.SetContextId(dsObject.FilterDialog, contextId);
            return ViewComponent("ParameterDiv", new { FilterDialogObj = dsObject.FilterDialog, _user = this.LoggedInUser, _sol = s_obj, wc = "dc" });
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
            JsonServiceClient sscli = ServiceClient; 
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

        [HttpPost]
        public EbQueryResponse GetColumnsCollection(string ds_refid, List<Param> parameter)
        {
            EbQueryResponse res = new EbQueryResponse(); 
            JsonServiceClient sscli = ServiceClient; 
            DataSourceColumnsResponse columnresp = sscli.Get<DataSourceColumnsResponse>(new DataSourceDataSetColumnsRequest { RefId = ds_refid.ToString(), Params = parameter });
            if ((columnresp.Columns == null || columnresp.Columns.Count == 0) && columnresp.ResponseStatus != null)
            {
                res.Message = columnresp.ResponseStatus.Message;
                res.Data = null;
                return res;
            }
            else
            {
                DSController dSController = new DSController(sscli, this.Redis);
                res.Data = EbSerializers.Json_Serialize(dSController.GetDVColumnCollection(columnresp.Columns));
                res.Message = null;
                return res;
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

        public DataSourceDataSetDataResponse getDataCollcetion(DataSourceDataSetDataRequest request)
        {
            DataSourceDataSetDataResponse resultlist1 = null;
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
            ServiceClient.Post(new EmailTemplateWithAttachmentMqRequest
            {
                ObjId = /*"ebdbllz23nkqd620180220120030-ebdbllz23nkqd620180220120030-15-2174-2909-2174-2909"*/2174,
                Params = _param
            });
            return 0;
        }

        [HttpPost]
        public SqlFuncDataTable ExecSqlFunction(string fname, string _params)
        {
            SqlFuncDataTable _table = new SqlFuncDataTable();
            EbDataTable _data = null;
            try
            {
                _data = this.ServiceClient.Post<SqlFuncTestResponse>(new SqlFuncTestRequest
                {
                    FunctionName = fname,
                    Parameters = JsonConvert.DeserializeObject<List<Param>>(_params)
                }).Data;

                _table.Colums = this.Dt2DvBaseColumn(_data.Columns);
                _table.Rows = _data.Rows;
            }
            catch (Exception e)
            {
                if (_data == null)
                {
                    EbDataTable t = new EbDataTable();
                    t.Columns.Add(new EbDataColumn(0, "status", EbDbTypes.BooleanOriginal));
                    t.Columns.Add(new EbDataColumn(1, "error", EbDbTypes.String));
                    t.Rows.Add(new EbDataRow());
                    t.Rows[0].Add(false);
                    t.Rows[0].Add(e.InnerException.Message);
                    _table.Colums = this.Dt2DvBaseColumn(t.Columns);
                    _table.Rows = t.Rows;
                }
                else
                {
                    _table.Colums = this.Dt2DvBaseColumn(_data.Columns);
                    _table.Rows = _data.Rows;
                }
            }
            return _table;
        }

        [HttpPost]
        public DataWriterDataTable ExecDataWriter(string qry, string _params)
        {
            DataWriterDataTable _table = new DataWriterDataTable();
            qry = Base64Decode(qry);
            EbDataTable _data = null;
            try
            {
                _data = this.ServiceClient.Post<DatawriterResponse>(new DatawriterRequest
                {
                    Sql = qry,
                    Parameters = JsonConvert.DeserializeObject<List<Param>>(_params)
                }).Data;

                _table.Colums = this.Dt2DvBaseColumn(_data.Columns);
                _table.Rows = _data.Rows;
            }
            catch (Exception e)
            {
                if (_data == null)
                {
                    EbDataTable t = new EbDataTable();
                    t.Columns.Add(new EbDataColumn(0, "status", EbDbTypes.BooleanOriginal));
                    t.Columns.Add(new EbDataColumn(1, "error", EbDbTypes.String));
                    t.Rows.Add(new EbDataRow());
                    t.Rows[0].Add(false);
                    t.Rows[0].Add(e.InnerException.Message);
                    _table.Colums = this.Dt2DvBaseColumn(t.Columns);
                    _table.Rows = t.Rows;
                }
                else
                {
                    _table.Colums = this.Dt2DvBaseColumn(_data.Columns);
                    _table.Rows = _data.Rows;
                }
            }
            return _table;
        }

        private DVColumnCollection Dt2DvBaseColumn(ColumnColletion Columns)
        {
            DVColumnCollection _columns = new DVColumnCollection();
            foreach (EbDataColumn column in Columns)
            {
                _columns.Add(new DVBaseColumn { Data = column.ColumnIndex, sTitle = column.ColumnName, Name = column.ColumnName, bVisible = true });
            }
            return _columns;
        }

        [HttpPost]
        public string GetSqlParams(string sql, int obj_type)
        {
            return JsonConvert.SerializeObject(SqlHelper.GetSqlParams(sql, obj_type));
        }

        private string Base64Decode(string base64EncodedData)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }
    }

    public class EbQueryResponse
    {
        public string Message { get; set; }

        public string Data { get; set; }
    }
}
