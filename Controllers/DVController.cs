using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Data;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web2;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Reflection;
using System.Threading.Tasks;
using System.Net;
using System.Net.Mime;
using ExpressBase.Objects.Objects.DVRelated;
using OfficeOpenXml;
using System.IO.Compression;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class DVController : EbBaseIntCommonController
    {
        public DVController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        private ActionResult ExcelFileResult { get; set; }

        private ResponseStatus _Responsestatus = new ResponseStatus();

        [HttpGet]
        [HttpPost]
        public IActionResult dv(string refid, string rowData, string filterValues, int tabNum)
        {

            ViewBag.al_arz_map_key = Environment.GetEnvironmentVariable(EnvironmentConstants.AL_GOOGLE_MAP_KEY);
            //string objid, EbObjectType objtype
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);

            User _user = this.Redis.Get<User>(string.Format(TokenConstants.SUB_FORMAT, ViewBag.cid, ViewBag.email, ViewBag.wc));
            ViewBag.user = _user;
            ViewBag.currentUser = this.LoggedInUser;
            var typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DVBuilder, typeof(EbDataVisualizationObject));

            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectType = _jsResult.EbObjectTypes;

            EbObjectWithRelatedDVResponse resultlist = this.ServiceClient.Get<EbObjectWithRelatedDVResponse>(new EbObjectWithRelatedDVRequest { Refid = refid, Ids = _user.EbObjectIds.ToString(), DsRefid = null });
            EbDataVisualization dsobj = resultlist.Dsobj;
            if (dsobj.DataSourceRefId != string.Empty)
                dsobj.AfterRedisGet(this.Redis, this.ServiceClient);
            ViewBag.dvObject = dsobj;
            ViewBag.DispName = dsobj.DisplayName;
            ViewBag.dvRefId = refid;
            ViewBag.filterValues = filterValues;
            ViewBag.tabNum = tabNum;
            ViewBag.rowData = rowData;
            ViewBag.DvList = JsonConvert.SerializeObject(resultlist.DvList);
            ViewBag.DvTaggedList = JsonConvert.SerializeObject(resultlist.DvTaggedList);
            ViewBag.TypeRegister = _jsResult.TypeRegister;
            return View();
        }

        public IActionResult renderlink(string _refid, string Params)
        {
            byte[] encodedDataAsBytes = System.Convert.FromBase64String(Params);
            string returnValue = System.Text.ASCIIEncoding.ASCII.GetString(encodedDataAsBytes);
            return RedirectToAction("dv", new { refid = _refid, rowData = "", filterValues = returnValue, tabNum = 0 });
        }

        public IActionResult dvCommon(string dvobj, string dvRefId, bool _flag, string wc, string contextId, bool customcolumn, string _curloc, string submitId)
        {
            EbDataVisualization dvObject = EbSerializers.Json_Deserialize(dvobj);
            dvObject.AfterRedisGet(this.Redis, this.ServiceClient);
            Eb_Solution s_obj = GetSolutionObject(ViewBag.cid);
            return ViewComponent("DataVisualization", new { dvobjt = dvobj, dvRefId = dvRefId, flag = _flag, _user = this.LoggedInUser, _sol = s_obj, contextId = contextId, CustomColumn = customcolumn, wc = ViewBag.wc, curloc = _curloc, submitId = submitId });
        }

        public IActionResult GetFilterBody(string dvobj, string contextId)
        {
            EbDataVisualization dsObject = EbSerializers.Json_Deserialize(dvobj);
            dsObject.AfterRedisGetforFilter(this.Redis, this.ServiceClient);

            Eb_Solution s_obj = GetSolutionObject(ViewBag.cid);
            if (dsObject.EbFilterDialog != null)
                EbControlContainer.SetContextId(dsObject.EbFilterDialog, contextId);
            return ViewComponent("ParameterDiv", new { FilterDialogObj = dsObject.EbFilterDialog, _user = this.LoggedInUser, _sol = s_obj, wc = ViewBag.wc });
        }

        public string GetColumns(string dvobjt, bool CustomColumn)
        {
            EbDataVisualization dvobj = EbSerializers.Json_Deserialize(dvobjt);
            ReturnColumns returnobj = new ReturnColumns();
            dvobj.AfterRedisGet(this.Redis, this.ServiceClient);
            try
            {
                DataSourceColumnsResponse columnresp = new DataSourceColumnsResponse();
                columnresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", dvobj.DataSourceRefId));
                if (columnresp == null || columnresp.Columns == null || columnresp.Columns.Count == 0)
                {
                    Console.WriteLine("Column Object in Redis is null or count 0");
                    columnresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceDataSetColumnsRequest { RefId = dvobj.DataSourceRefId, SolnId = ViewBag.cid, Params = (dvobj.EbDataSource.FilterDialog != null) ? dvobj.EbDataSource.FilterDialog.GetDefaultParams() : null });
                    if (columnresp == null || columnresp.Columns.Count == 0)
                    {
                        Console.WriteLine("Column Object from SS is null or count 0");
                        throw new Exception("Object Not found(Redis + SS)");
                    }
                }
                DSController dscont = new DSController(this.ServiceClient, this.Redis);
                returnobj.ColumnsCollection = dscont.GetDVColumnCollection(columnresp.Columns);
                returnobj.Paramlist = (dvobj.EbDataSource.FilterDialog != null) ? dvobj.EbDataSource.FilterDialog.GetDefaultParams() : null;
                var __columns = (columnresp.Columns.Count > 1) ? columnresp.Columns[1] : columnresp.Columns[0];
                int _pos = __columns.Count + 100;
                DVColumnCollection Columns = GetDVcolumns(__columns);
                returnobj.ColumnOrginal = new DVColumnCollection();
                //dvobj.Columns.Add(new DVNumericColumn { Data = ++indx, Name = "RATE_GRAFT", sTitle = "RATE+GRAFT", Type = EbDbTypes.Int32, bVisible = true, sWidth = "100px", ClassName = "tdheight dt-body-right",Formula = "T0.RATE+T0.GRAFT" });
                if (dvobj.Columns == null || dvobj.Columns.Count == 0)
                    returnobj.Columns = Columns;
                else
                    returnobj.Columns = compareDVColumns(dvobj.Columns, Columns, CustomColumn);
                returnobj.DsColumns = returnobj.Columns;
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception (GetdvObject): " + e.StackTrace);
                returnobj.Message = e.Message;
                this._Responsestatus.Message = e.Message;
            }
            return EbSerializers.Json_Serialize(returnobj);
        }

        private DVColumnCollection compareDVColumns(DVColumnCollection OldColumns, DVColumnCollection CurrentColumns, bool CustomColumn)
        {
            int _colindex = -1;
            var NewColumns = new DVColumnCollection();
            foreach (DVBaseColumn oldcol in OldColumns)
            {
                var tempCol = CurrentColumns.Pop(oldcol.Name, oldcol.Type, oldcol.IsCustomColumn);
                if (tempCol != null)
                {
                    oldcol.Data = tempCol.Data;
                    if (oldcol.EbSid == null || oldcol.EbSid == "")
                        oldcol.EbSid = oldcol.Type.ToString() + oldcol.Data;
                    NewColumns.Add(oldcol);
                }
            }

            foreach (DVBaseColumn curcol in CurrentColumns)
            {
                NewColumns.Add(curcol);
                _colindex = curcol.Data;
            }
            if (CustomColumn)
            {
                _colindex = NewColumns.Count;
                foreach (DVBaseColumn oldcol in OldColumns)
                {
                    if (oldcol.IsCustomColumn)
                    {
                        oldcol.Data = _colindex;
                        NewColumns.Add(oldcol);
                        _colindex++;
                    }
                }
            }

            return NewColumns;
        }

        public string GetColumnsFromApi(string dvobjt)
        {
            EbDataVisualization dvobj = EbSerializers.Json_Deserialize(dvobjt);
            ReturnColumns returnobj = new ReturnColumns();
            ApiConversionResponse resultlist1 = null;
            ApiConversionRequest request = new ApiConversionRequest();
            request.Url = dvobj.Url;
            request.Headers = dvobj.Headers;
            request.Parameters = dvobj.Parameters;
            request.Method = dvobj.Method;
            try
            {
                this.ServiceClient.Timeout = new TimeSpan(0, 5, 0);
                resultlist1 = this.ServiceClient.Post<ApiConversionResponse>(request);
                returnobj.ColumnOrginal = GetDVcolumns(resultlist1.dataset.Tables[0].Columns);
                returnobj.Columns = returnobj.ColumnOrginal;
                returnobj.DsColumns = returnobj.ColumnOrginal;
                returnobj.ColumnsCollection = new List<DVColumnCollection>();
                returnobj.ColumnsCollection.Add(returnobj.Columns);
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.ToString());
                if (resultlist1 != null)
                {
                    this._Responsestatus.Message = resultlist1.Message;
                    returnobj.Message = resultlist1.Message;
                }
                else
                    returnobj.Message = e.ToString();
            }
            //return resultlist1;
            return EbSerializers.Json_Serialize(returnobj);
        }

        public DVColumnCollection GetDVcolumns(ColumnColletion __columns)
        {
            var Columns = new DVColumnCollection();
            var indx = -1;
            foreach (EbDataColumn column in __columns)
            {
                DVBaseColumn _col = null;

                if (column.Type == EbDbTypes.String)
                    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px" };
                else if (column.Type == EbDbTypes.Int16 || column.Type == EbDbTypes.Int32 || column.Type == EbDbTypes.Int64 || column.Type == EbDbTypes.Double || column.Type == EbDbTypes.Decimal || column.Type == EbDbTypes.VarNumeric)
                    _col = new DVNumericColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px" };
                else if (column.Type == EbDbTypes.Boolean)
                    _col = new DVBooleanColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px" };
                else if (column.Type == EbDbTypes.DateTime || column.Type == EbDbTypes.Date || column.Type == EbDbTypes.Time)
                    _col = new DVDateTimeColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, sType = "date-uk", Type = column.Type, bVisible = true, sWidth = "100px" };
                _col.EbSid = column.Type.ToString() + column.ColumnIndex;
                _col.RenderType = _col.Type;
                Columns.Add(_col);
                indx = column.ColumnIndex;
            }
            return Columns;
        }

        public object ExecuteTreeUpdate(string sql)
        {
            var resultlist = this.ServiceClient.Get<UpdateTreeColumnResponse>(new UpdateTreeColumnRequest { sql = sql });
            return new object();
        }
        //[HttpPost]//copied to boti - febin
        //public IActionResult dvView1(string dvobj)
        //{
        //    var dvObject = EbSerializers.Json_Deserialize(dvobj);
        //    dvObject.AfterRedisGet(this.Redis, this.ServiceClient);
        //    return ViewComponent("DataVisualization", new { dvobjt = dvobj, dvRefId = "", forWrap = "wrap" });
        //}

        public List<EbObjectWrapper> getAllRelatedDV(string refid)
        {
            List<EbObjectWrapper> DvList = new List<EbObjectWrapper>();
            if (refid != null)
            {
                var resultlist = this.ServiceClient.Get<EbObjectRelationsResponse>(new EbObjectRelationsRequest { DominantId = refid });
                var rlist = resultlist.Data;
                foreach (var element in rlist)
                {
                    if (element.EbObjectType.Equals(EbObjectTypes.TableVisualization) || element.EbObjectType.Equals(EbObjectTypes.ChartVisualization))
                    {
                        DvList.Add(element);
                    }
                }

            }
            return DvList;
        }

        public string getdv(string refid, string objtype, string dsrefid)
        {
            DvObjectWithRelatedObjects Obj = new DvObjectWithRelatedObjects();
            if (refid != null)
            {
                //var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
                var resultlist = this.ServiceClient.Get<EbObjectWithRelatedDVResponse>(new EbObjectWithRelatedDVRequest { Refid = refid, DsRefid = dsrefid });
                var dsobj = resultlist.Dsobj;
                dsobj.AfterRedisGet(this.Redis);
                Obj.DsObj = dsobj;
                Obj.DvList = resultlist.DvList;
                Obj.DvTaggedList = resultlist.DvTaggedList;
                //dsobj = EbSerializers.Json_Deserialize(resultlist.Data[0].Json);
                //dsobj.Status = resultlist.Data[0].Status;
                //dsobj.VersionNumber = resultlist.Data[0].VersionNumber;                
            }
            return EbSerializers.Json_Serialize(Obj);
        }

        public IActionResult dvgoogle()
        {
            return ViewComponent("GoogleRelated");
        }

        //copied to boti - febin
        public DataSourceDataResponse getData(TableDataRequest request)
        {
            try
            {
                request.eb_Solution = GetSolutionObject(ViewBag.cid);
                request.ReplaceEbColumns = true;
                if (request.DataVizObjString != null)
                    request.EbDataVisualization = EbSerializers.Json_Deserialize<EbDataVisualization>(request.DataVizObjString);
                if (request.CurrentRowGroup != null)
                    (request.EbDataVisualization as EbTableVisualization).CurrentRowGroup = EbSerializers.Json_Deserialize<RowGroupParent>(request.CurrentRowGroup);
                request.DataVizObjString = null;
                request.UserInfo = this.LoggedInUser;
                if (request.TFilters != null)
                {
                    foreach (TFilters para in request.TFilters)
                    {

                        if (para.Type == EbDbTypes.Date || para.Type == EbDbTypes.DateTime)
                        {
                            para.Value = DateTime.Parse(para.Value, CultureInfo.GetCultureInfo(this.LoggedInUser.Preference.Locale)).ToString("yyyy-MM-dd");
                        }
                        //para.Value = Convert.ToDateTime(DateTime.ParseExact(para.Value.ToString(), (CultureInfo.GetCultureInfo(this.LoggedInUser.Preference.Locale) as CultureInfo).DateTimeFormat.ShortDatePattern, CultureInfo.InvariantCulture)
                    }
                }
                DataSourceDataResponse resultlist1 = null;
                try
                {
                    this.ServiceClient.Timeout = new TimeSpan(0, 5, 0);
                    resultlist1 = this.ServiceClient.Post(request);
                }
                catch (Exception e)
                {
                    Console.WriteLine("Exception: " + e.ToString());
                }
                return resultlist1;
            }
            catch (Exception e)
            {
                Console.WriteLine("dvconroller getdata request Exception........." + e.StackTrace);
            }
            return null;
        }

        public ParticularApprovalColumnResponse PostWebformData(List<Param> Params, string RefId, int RowId, int CurrentLoc)
        {
            ParticularApprovalColumnResponse res = null;
            InsertDataFromWebformResponse Resp = null;
            try
            {
                WebformData obj = new WebformData();
                List<SingleColumn> singleColumns = new List<SingleColumn>();
                foreach (Param param in Params)
                {
                    singleColumns.Add(new SingleColumn
                    {
                        Name = param.Name,
                        Type = Convert.ToInt32(param.Type),
                        Value = param.Value
                    });
                }
                SingleTable ss = new SingleTable();
                ss.Add(new SingleRow { Columns = singleColumns });
                obj.MultipleTables.Add("eb_approval_lines", ss);
                Resp = ServiceClient.Post<InsertDataFromWebformResponse>(
                        new InsertDataFromWebformRequest
                        {
                            RefId = RefId,
                            FormData = obj,
                            RowId = RowId,
                            CurrentLoc = CurrentLoc
                        });
                if (Resp.Status == 200)
                {
                    try
                    {
                        res = ServiceClient.Post<ParticularApprovalColumnResponse>(
                                 new ParticularApprovalColumnRequest
                                 {
                                     RefId = RefId,
                                     RowId = RowId,
                                     CurrentLoc = CurrentLoc,
                                     UserObj = this.LoggedInUser
                                 });
                    }
                    catch (Exception ex)
                    {
                        res.Messaage = "EXCEPTION AT Approval in DV ParticularApprovalColumnResponse ---" + ex.Message;
                        Console.WriteLine("EXCEPTION AT Approval in DV ParticularApprovalColumnResponse" + ex.Message);
                        Console.WriteLine(ex.StackTrace);
                    }
                }

            }
            catch (Exception ex)
            {
                res.Messaage = "EXCEPTION AT Approval in DV ---" + Resp.Message + "----" + ex.Message;
                Console.WriteLine("EXCEPTION AT Approval in DV" + ex.Message);
                Console.WriteLine(ex.StackTrace);
            }
            return res;
        }

        public void SendSMS(SMSInitialRequest request)
        {
            if (request.RefId != null)
            {
                Eb_Solution sol = GetSolutionObject(this.LoggedInUser.CId);
                request.SolnId = sol.SolutionID;
                request.UserAuthId = this.LoggedInUser.AuthId;
                request.UserId = this.LoggedInUser.UserId;
                var xx = this.ServiceClient.Post(request);
            }
        }

        public object GetSMSPreview(string refid)
        {
            return new { Text = "hhhhhhhhhh", Ph = "123456789"};
        }

        public DataSourceDataResponse getData4Inline(InlineTableDataRequest _request)
        {
            InlineTableDataRequest request = new InlineTableDataRequest();
            request = _request;
            request.eb_solution = GetSolutionObject(ViewBag.cid);
            request.ReplaceEbColumns = true;
            if (request.DataVizObjString != null)
                request.EbDataVisualization = EbSerializers.Json_Deserialize<EbDataVisualization>(request.DataVizObjString);
            request.DataVizObjString = null;
            request.UserInfo = this.LoggedInUser;
            DataSourceDataResponse resultlist1 = null;
            try
            {
                resultlist1 = this.ServiceClient.Post(request);
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.ToString());
            }
            return resultlist1;
        }

        public DataSourceDataResponse getData4PowerSelect(TableDataRequest request)
        {
            try
            {
                request.eb_Solution = GetSolutionObject(ViewBag.cid);
                request.ReplaceEbColumns = false;
                if (request.DataVizObjString != null)
                    request.EbDataVisualization = EbSerializers.Json_Deserialize<EbDataVisualization>(request.DataVizObjString);
                request.DataVizObjString = null;
                request.UserInfo = this.LoggedInUser;
                if (request.TFilters != null)
                {
                    foreach (TFilters para in request.TFilters)
                    {

                        if (para.Type == EbDbTypes.Date || para.Type == EbDbTypes.DateTime)
                        {
                            para.Value = DateTime.Parse(para.Value, CultureInfo.GetCultureInfo(this.LoggedInUser.Preference.Locale)).ToString("yyyy-MM-dd");
                        }
                        //para.Value = Convert.ToDateTime(DateTime.ParseExact(para.Value.ToString(), (CultureInfo.GetCultureInfo(this.LoggedInUser.Preference.Locale) as CultureInfo).DateTimeFormat.ShortDatePattern, CultureInfo.InvariantCulture)
                    }
                }
                DataSourceDataResponse resultlist1 = null;
                try
                {
                    this.ServiceClient.Timeout = new TimeSpan(0, 5, 0);
                    resultlist1 = this.ServiceClient.Post(request);
                }
                catch (Exception e)
                {
                    Console.WriteLine("Exception: " + e.ToString());
                }
                return resultlist1;
            }
            catch (Exception e)
            {
                Console.WriteLine("dvconroller getdata request Exception........." + e.StackTrace);
            }
            return null;
        }

        public Dictionary<string, List<EbObjectWrapper>> FetchAllDataVisualizations(int type)
        {
            var resultlist = this.ServiceClient.Get<EbObjectObjListAllVerResponse>(new EbObjectObjLisAllVerRequest { EbObjectType = type });
            var ObjDVListAll = resultlist.Data;

            return ObjDVListAll;
        }

        public Dictionary<string, List<EbObjectWrapper>> FetchAllObjects(List<int> typelist)
        {
            GetAllCommitedObjectsResp resultlist = this.ServiceClient.Get<GetAllCommitedObjectsResp>(new GetAllCommitedObjectsRqst { Typelist = typelist });
            var ObjDVListAll = resultlist.Data;

            return ObjDVListAll;
        }

        public class DvObjectWithRelatedObjects
        {
            public EbDataVisualization DsObj { get; set; }

            public List<EbObjectWrapper> DvList { get; set; }

            public List<EbObjectWrapper> DvTaggedList { get; set; }
        }

        [HttpPost]
        public void exportToexcel(TableDataRequest req)
        {
            try
            {
                ExportToExcelMqRequest request = new ExportToExcelMqRequest();
                EbDataVisualization ebobject = EbSerializers.Json_Deserialize<EbDataVisualization>(req.DataVizObjString);
                request.EbDataVisualization = ebobject;
                request.Ispaging = false;
                request.UserInfo = this.LoggedInUser;
                request.RefId = ebobject.DataSourceRefId;
                request.IsExcel = true;
                request.Params = req.Params;
                this.ServiceClient.Post(request);
            }

            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.ToString());
            }

        }

        public IActionResult GetExcel(string refid, string filename)
        {

            var res = Redis.Get<byte[]>("excel" + refid);
            byte[] decompressedData = Decompress(res);
            Redis.Delete("excel" + refid);
            return File(decompressedData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
        }

        public static byte[] Decompress(byte[] data)
        {
            using (var compressedStream = new MemoryStream(data))
            using (var zipStream = new GZipStream(compressedStream, CompressionMode.Decompress))
            using (var resultStream = new MemoryStream())
            {
                zipStream.CopyTo(resultStream);
                return resultStream.ToArray();
            }
        }

    }

    public class ReturnColumns
    {
        public List<DVColumnCollection> ColumnsCollection { get; set; }

        public DVColumnCollection Columns { get; set; }

        public List<Param> Paramlist { get; set; }

        public DVColumnCollection DsColumns { get; set; }

        public DVColumnCollection ColumnOrginal { get; set; }

        public string Message { get; set; }
    }
}

