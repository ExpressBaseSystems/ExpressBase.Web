﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using Newtonsoft.Json;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Extensions;
using System.Reflection;
using ExpressBase.Common.Objects.Attributes;
using ExpressBase.Common.Data;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Constants;
using ExpressBase.Objects.Objects;
using System.IO;
using System.Net;

namespace ExpressBase.Web.Controllers
{
    public class WebFormController : EbBaseIntCommonController
    {
        public WebFormController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public IActionResult Index(string refId, string _params, int _mode, int _locId)
        {
            Console.WriteLine(string.Format("Webform Render - refid : {0}, prams : {1}, mode : {2}, locid : {3}", refId, _params, _mode, _locId));
            ViewBag.renderMode = 1;
            ViewBag.rowId = 0;
            ViewBag.draftId = 0;
            ViewBag.formData_draft = 0;
            ViewBag.Mode = WebFormModes.New_Mode.ToString().Replace("_", " ");
            ViewBag.IsPartial = _mode > 10;
            _mode = _mode > 0 ? _mode % 10 : _mode;
            if (_params != null)
            {
                List<Param> ob = JsonConvert.DeserializeObject<List<Param>>(_params.FromBase64());
                if ((int)WebFormDVModes.View_Mode == _mode && ob.Count == 1)
                {
                    Console.WriteLine("Webform Render - View mode request identified.");
                    ViewBag.formData = getRowdata(refId, Convert.ToInt32(ob[0].ValueTo), _locId, 1);
                    if (ob[0].ValueTo > 0)
                    {
                        ViewBag.rowId = ob[0].ValueTo;
                        ViewBag.Mode = WebFormModes.View_Mode.ToString().Replace("_", " ");
                    }
                }
                else if ((int)WebFormDVModes.New_Mode == _mode)// prefill mode
                {
                    try
                    {
                        GetPrefillDataResponse Resp = ServiceClient.Post<GetPrefillDataResponse>(new GetPrefillDataRequest { RefId = refId, Params = ob, CurrentLoc = _locId, RenderMode = WebFormRenderModes.Normal });
                        ViewBag.formData = Resp.FormDataWrap;
                        ViewBag.Mode = WebFormModes.Prefill_Mode.ToString().Replace("_", " ");
                    }
                    catch (Exception ex)
                    {
                        ViewBag.formData = JsonConvert.SerializeObject(new WebformDataWrapper { Message = "Something went wrong", Status = (int)HttpStatusCode.InternalServerError, MessageInt = ex.Message, StackTraceInt = ex.StackTrace });
                        Console.WriteLine("Exception in getPrefillData. Message: " + ex.Message);
                    }
                }
                else if ((int)WebFormModes.Export_Mode == _mode)
                {
                    try
                    {
                        string sRefId = ob.Find(e => e.Name == "srcRefId")?.ValueTo ?? refId;
                        int sRowId = Convert.ToInt32(ob.Find(e => e.Name == "srcRowId")?.ValueTo ?? 0);
                        GetExportFormDataResponse Resp = ServiceClient.Post<GetExportFormDataResponse>(new GetExportFormDataRequest { DestRefId = refId, SourceRefId = sRefId, SourceRowId = sRowId, UserObj = this.LoggedInUser, CurrentLoc = _locId, RenderMode = WebFormRenderModes.Normal });
                        ViewBag.formData = Resp.FormDataWrap;
                        ViewBag.Mode = WebFormModes.Export_Mode.ToString().Replace("_", " ");
                    }
                    catch (Exception ex)
                    {
                        ViewBag.formData = JsonConvert.SerializeObject(new WebformDataWrapper { Message = "Something went wrong", Status = (int)HttpStatusCode.InternalServerError, MessageInt = ex.Message, StackTraceInt = ex.StackTrace });
                        Console.WriteLine("Exception in GetExportFormData. Message: " + ex.Message);
                    }
                }
                else if ((int)WebFormModes.Draft_Mode == _mode)
                {
                    try
                    {
                        int DraftId = Convert.ToInt32(ob.Find(e => e.Name == "id")?.ValueTo ?? 0);
                        GetFormDraftResponse Resp = ServiceClient.Post<GetFormDraftResponse>(new GetFormDraftRequest { RefId = refId, DraftId = DraftId });
                        ViewBag.formData = Resp.DataWrapper;
                        ViewBag.formData_draft = Resp.FormDatajson;
                        ViewBag.draftId = DraftId;
                        ViewBag.Mode = WebFormModes.Draft_Mode.ToString().Replace("_", " ");
                    }
                    catch (Exception ex)
                    {
                        ViewBag.formData = JsonConvert.SerializeObject(new WebformDataWrapper { Message = "Something went wrong", Status = (int)HttpStatusCode.InternalServerError, MessageInt = ex.Message, StackTraceInt = ex.StackTrace });
                        Console.WriteLine("Exception in GetExportFormData. Message: " + ex.Message);
                    }
                }
            }
            else
            {
                ViewBag.formData = getRowdata(refId, 0, _locId, 1);
            }

            if (ViewBag.wc == TokenConstants.DC)
            {
                ViewBag.Mode = WebFormModes.Preview_Mode.ToString().Replace("_", " ");
            }
            string temp = GetRedirectUrl(refId, _mode, _locId);
            if (temp != null)
                return Redirect(temp);

            ViewBag.formRefId = refId;
            ViewBag.userObject = JsonConvert.SerializeObject(this.LoggedInUser);

            ViewBag.__Solution = GetSolutionObject(ViewBag.cid);
            ViewBag.__User = this.LoggedInUser;

            return ViewComponent("WebForm", new string[] { refId, this.LoggedInUser.Preference.Locale });
        }

        //Check permission
        private string GetRedirectUrl(string RefId, int Mode, int LocId)
        {
            WebformDataWrapper wfd = JsonConvert.DeserializeObject<WebformDataWrapper>(ViewBag.formData);
            if (wfd.FormData == null)
            {
                TempData["ErrorResp"] = ViewBag.formData;
                return "/StatusCode/" + wfd.Status;
            }
            else if (ViewBag.wc != TokenConstants.DC)
            {
                int RowId = 0;
                if ((int)WebFormModes.Draft_Mode != Mode)
                {
                    SingleRow primRow = wfd.FormData.MultipleTables[wfd.FormData.MasterTable][0];
                    RowId = primRow.RowId;
                    LocId = primRow.LocId;
                }
                if (RowId > 0)
                {
                    EbWebForm WebForm = EbFormHelper.GetEbObject<EbWebForm>(RefId, this.ServiceClient, this.Redis, null);
                    bool neglectLocId = WebForm.IsLocIndependent;
                    if (!(this.HasPermission(RefId, OperationConstants.VIEW, LocId, neglectLocId) || this.HasPermission(RefId, OperationConstants.EDIT, LocId, neglectLocId)))
                    {
                        TempData["ErrorResp"] = $"`Access denied. RefId: {RefId}, DataId: {RowId}, LocId: {LocId}, Operation: View/Edit`";
                        return "/StatusCode/" + (int)HttpStatusCode.Unauthorized;
                    }
                }
                else
                {
                    if (!this.HasPermission(RefId, OperationConstants.NEW, LocId, true))
                    {
                        TempData["ErrorResp"] = $"`Access denied. RefId: {RefId}, DataId: {RowId}, LocId: {LocId}, Operation: New`";
                        return "/StatusCode/" + (int)HttpStatusCode.Unauthorized;
                    }
                }
            }
            return null;
        }

        //[HttpGet("WebFormRender/{refId}/{_params}/{_mode}/{_locId}/{rendermode}")]
        public IActionResult WebFormRender(string refId, string _params, int _mode, int _locId, int renderMode = 1)
        {
            Console.WriteLine(string.Format("Webform Render - refid : {0}, prams : {1}, mode : {2}, locid : {3}", refId, _params, _mode, _locId));
            ViewBag.renderMode = renderMode;
            ViewBag.rowId = 0;
            ViewBag.draftId = 0;
            ViewBag.formData_draft = 0;
            ViewBag.Mode = WebFormModes.New_Mode.ToString().Replace("_", " ");
            ViewBag.IsPartial = _mode > 10;
            _mode = _mode > 0 ? _mode % 10 : _mode;
            if (_params != null)
            {
                List<Param> ob = JsonConvert.DeserializeObject<List<Param>>(_params.FromBase64());
                if ((int)WebFormDVModes.View_Mode == _mode && ob.Count == 1)
                {
                    Console.WriteLine("Webform Render - View mode request identified.");
                    ViewBag.formData = getRowdata(refId, Convert.ToInt32(ob[0].ValueTo), _locId, renderMode);
                    if (ob[0].ValueTo > 0)
                    {
                        ViewBag.rowId = ob[0].ValueTo;
                        ViewBag.Mode = WebFormModes.View_Mode.ToString().Replace("_", " ");
                    }
                }
                else if ((int)WebFormDVModes.New_Mode == _mode)
                {
                    try
                    {
                        GetPrefillDataResponse Resp = ServiceClient.Post<GetPrefillDataResponse>(new GetPrefillDataRequest { RefId = refId, Params = ob, CurrentLoc = _locId, RenderMode = (WebFormRenderModes)renderMode });
                        ViewBag.formData = Resp.FormDataWrap;
                        ViewBag.Mode = WebFormModes.New_Mode.ToString().Replace("_", " ");
                    }
                    catch (Exception ex)
                    {
                        ViewBag.formData = JsonConvert.SerializeObject(new WebformDataWrapper { Message = "Something went wrong", Status = (int)HttpStatusCode.InternalServerError, MessageInt = ex.Message, StackTraceInt = ex.StackTrace });
                        Console.WriteLine("Exception in getPrefillData. Message: " + ex.Message);
                    }
                }
            }
            else
            {
                ViewBag.formData = getRowdata(refId, 0, _locId, renderMode);
            }

            if (ViewBag.wc == TokenConstants.DC)
            {
                ViewBag.Mode = WebFormModes.Preview_Mode.ToString().Replace("_", " ");
            }
            WebformDataWrapper wfd = JsonConvert.DeserializeObject<WebformDataWrapper>(ViewBag.formData);
            if (wfd.FormData == null)
            {
                TempData["ErrorResp"] = ViewBag.formData;
                return Redirect("/StatusCode/" + wfd.Status);
                //ViewBag.Mode = WebFormModes.Fail_Mode.ToString().Replace("_", " ");
            }
            ViewBag.formRefId = refId;
            ViewBag.userObject = JsonConvert.SerializeObject(this.LoggedInUser);

            ViewBag.__Solution = GetSolutionObject(ViewBag.cid);
            ViewBag.__User = this.LoggedInUser;

            return ViewComponent("WebForm", new string[] { refId, this.LoggedInUser.Preference.Locale });
        }

        public IActionResult Drafts()
        {
            if (ViewBag.wc != TokenConstants.UC)
                return Redirect("/StatusCode/404");

            string query = @"
            SELECT 
	            FD.id, 
	            FD.title, 
	            FD.form_ref_id, 
	            COALESCE(EO.display_name, '') display_name, 
	            FD.eb_created_at, 
	            FD.eb_lastmodified_at 
            FROM eb_form_drafts FD
            LEFT JOIN eb_objects_ver EOV ON FD.form_ref_id = EOV.refid
            LEFT JOIN eb_objects EO ON EOV.eb_objects_id = EO.id
            WHERE COALESCE(FD.eb_del,'F') = 'F' AND COALESCE(FD.is_submitted,'F') = 'F' AND FD.eb_created_by = @eb_created_by
            ; ";//ORDER BY FD.eb_lastmodified_at DESC

            List<Param> _params = new List<Param>
            {
                new Param { Name = "eb_created_by", Type = ((int)EbDbTypes.Int32).ToString(), Value = Convert.ToString(this.LoggedInUser.UserId) }
            };

            DVColumnCollection DVColumnCollection = new DVColumnCollection()
            {
                new DVNumericColumn { Data = 0, Name = "id", sTitle = "Id", Type = EbDbTypes.Int32, bVisible = false },
                new DVStringColumn { Data = 1, Name = "title", sTitle = "Subject", Type = EbDbTypes.String, bVisible = false},
                new DVStringColumn { Data = 2, Name = "form_ref_id", sTitle = "Ref id", Type = EbDbTypes.String, bVisible = false },
                new DVStringColumn { Data = 3, Name = "display_name", sTitle = "Form name", Type = EbDbTypes.String, bVisible = true, RenderAs = StringRenderType.LinkFromColumn, RefidColumn = new DVBaseColumn(), IdColumn = new DVBaseColumn()  },
                new DVDateTimeColumn { Data = 4, Name = "eb_created_at", sTitle = "Created at", Type = EbDbTypes.Date, bVisible = true,Format = DateFormat.DateTime, ConvretToUsersTimeZone = true },
                new DVDateTimeColumn { Data = 5, Name = "eb_lastmodified_at", sTitle = "Last modified at", Type = EbDbTypes.Date, bVisible = true, Format = DateFormat.DateTime, ConvretToUsersTimeZone = true }
            };
            //new DVBooleanColumn{ Data = 3, Name = "is_submitted", sTitle = "Is submitted", Type = EbDbTypes.Boolean, bVisible = true, TrueValue = "T", FalseValue = "F", RenderAs = BooleanRenderType.Icon},

            foreach (DVBaseColumn _col in DVColumnCollection)
            {
                _col.RenderType = _col.Type;
                _col.ClassName = "tdheight";
                _col.Font = null;
                _col.Align = Align.Left;
                if(_col.Name == "display_name")
                {
                    _col.RefidColumn = DVColumnCollection.Get("form_ref_id");
                    _col.IdColumn = DVColumnCollection.Get("id");
                }
            }

            EbDataVisualization Visualization = new EbTableVisualization { Sql = query, ParamsList = _params, Columns = DVColumnCollection, AutoGen = false, IsPaging = true };
            //List<DVBaseColumn> RowGroupingColumns = new List<DVBaseColumn> { Visualization.Columns.Get("eb_lastmodified_at") };
            //(Visualization as EbTableVisualization).RowGroupCollection.Add(new SingleLevelRowGroup { RowGrouping = RowGroupingColumns, Name = "singlelevel" });
            //(Visualization as EbTableVisualization).CurrentRowGroup = (Visualization as EbTableVisualization).RowGroupCollection[0];

            //(Visualization as EbTableVisualization).OrderBy = new List<DVBaseColumn> { Visualization.Columns.Get("eb_lastmodified_at") };

            ViewBag.TableViewObj = EbSerializers.Json_Serialize(Visualization);
            Type[] typeArray = typeof(EbDashBoardWraper).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DashBoard, typeof(EbObject));
            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;
            ViewBag.ControlOperations = EbControlContainer.GetControlOpsJS((new EbWebForm()) as EbControlContainer, BuilderType.FilterDialog);

            return View();
        }

        // to get Table- // refid form refid, rowid - form table entry id, currentloc - location id
        public string getRowdata(string refid, int rowid, int currentloc, int renderMode)
        {
            try
            {
                GetRowDataResponse DataSet = ServiceClient.Post<GetRowDataResponse>(new GetRowDataRequest { RefId = refid, RowId = rowid, CurrentLoc = currentloc, RenderMode = (WebFormRenderModes)renderMode });
                return DataSet.FormDataWrap;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in getRowdata. Message: " + ex.Message);
                return JsonConvert.SerializeObject(new WebformDataWrapper()
                {
                    Message = "Error in loading data...",
                    Status = (int)HttpStatusCode.InternalServerError,
                    MessageInt = ex.Message,
                    StackTraceInt = ex.StackTrace
                });
            }
        }

        //public string getDGdata(string refid, List<Param> _params)
        //{
        //    WebformDataWrapper WebformDataWrapper = new WebformDataWrapper();
        //    string ObjStr = string.Empty;
        //    try
        //    {
        //        EbDataReader dataReader = this.Redis.Get<EbDataReader>(refid);
        //        foreach (Param item in dataReader.InputParams)
        //        {
        //            foreach (Param _p in _params)
        //            {
        //                if (item.Name == _p.Name)
        //                    _p.Type = item.Type;
        //            }
        //        }
        //        GetImportDataResponse Resp = ServiceClient.Post<GetImportDataResponse>(new GetImportDataRequest { RefId = refid, Params = _params });
        //        WebformDataWrapper = new WebformDataWrapper { FormData = Resp.FormData, Status = (int)HttpStatusCodes.OK };
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine("Exception in getDGdata. Message: " + ex.Message);
        //        WebformDataWrapper = new WebformDataWrapper()
        //        {
        //            Message = "Error in loading data...",
        //            Status = (int)HttpStatusCodes.INTERNAL_SERVER_ERROR,
        //            MessageInt = ex.Message,
        //            StackTraceInt = ex.StackTrace
        //        };
        //    }
        //    ObjStr = JsonConvert.SerializeObject(WebformDataWrapper);
        //    return ObjStr;
        //}

        //ps form-api
        public string PSImportFormData(string _refid, int _rowid, string _triggerctrl, string _formModel)
        {
            try
            {
                if (_refid.IsNullOrEmpty() || _triggerctrl.IsNullOrEmpty())
                    throw new FormException("Refid and TriggerCtrl must be set");
                GetImportDataResponse Resp = ServiceClient.Post<GetImportDataResponse>(new GetImportDataRequest
                {
                    RefId = _refid,
                    Trigger = _triggerctrl,
                    WebFormData = _formModel,
                    Type = ImportDataType.PowerSelect
                });
                return Resp.FormDataWrap;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in ImportFormData. Message: " + ex.Message);
                return JsonConvert.SerializeObject(new WebformDataWrapper()
                {
                    Message = "Error in loading data...",
                    Status = (int)HttpStatusCode.InternalServerError,
                    MessageInt = ex.Message,
                    StackTraceInt = ex.StackTrace
                });
            }
        }

        //dg dr-api
        public string ImportFormData(string _refid, int _rowid, string _triggerctrl, List<Param> _params)
        {
            try
            {
                if (_refid.IsNullOrEmpty() || _triggerctrl.IsNullOrEmpty())
                    throw new FormException("Refid and TriggerCtrl must be set");
                GetImportDataResponse Resp = ServiceClient.Post<GetImportDataResponse>(new GetImportDataRequest
                {
                    RefId = _refid,
                    RowId = _rowid,
                    Trigger = _triggerctrl,
                    Params = _params,
                    Type = ImportDataType.DataGrid
                });
                return Resp.FormDataWrap;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in ImportFormData. Message: " + ex.Message);
                return JsonConvert.SerializeObject(new WebformDataWrapper()
                {
                    Message = "Error in loading data...",
                    Status = (int)HttpStatusCode.InternalServerError,
                    MessageInt = ex.Message,
                    StackTraceInt = ex.StackTrace
                });
            }
        }

        public string GetDynamicGridData(string _refid, int _rowid, string _srcid, string[] _target)
        {
            try
            {
                if (_refid.IsNullOrEmpty() || _srcid.IsNullOrEmpty() || _target.Length == 0)
                    throw new FormException("Refid, SrcId and Target must be set.");
                GetDynamicGridDataResponse Resp = ServiceClient.Post<GetDynamicGridDataResponse>(new GetDynamicGridDataRequest { RefId = _refid, RowId = _rowid, SourceId = _srcid, Target = _target });
                return Resp.FormDataWrap;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in GetDynamicGridData. Message: " + ex.Message);
                return JsonConvert.SerializeObject(new WebformDataWrapper()
                {
                    Message = "Error in loading data...",
                    Status = (int)HttpStatusCode.InternalServerError,
                    MessageInt = ex.Message,
                    StackTraceInt = ex.StackTrace
                });
            }
        }

        public string ExecuteSqlValueExpr(string _refid, string _triggerctrl, List<Param> _params)
        {
            ExecuteSqlValueExprResponse Resp = this.ServiceClient.Post<ExecuteSqlValueExprResponse>(new ExecuteSqlValueExprRequest { RefId = _refid, Trigger = _triggerctrl, Params = _params });
            return Resp.Data;
        }

        public string GetDataPusherJson(string RefId)
        {
            GetDataPusherJsonResponse Resp = this.ServiceClient.Post<GetDataPusherJsonResponse>(new GetDataPusherJsonRequest { RefId = RefId });
            return Resp.Json;
        }

        public string InsertWebformData(string ValObj, string RefId, int RowId, int CurrentLoc, int DraftId)
        {
            try
            {
                string Operation = OperationConstants.NEW;
                if (RowId > 0)
                    Operation = OperationConstants.EDIT;
                EbWebForm WebForm = EbFormHelper.GetEbObject<EbWebForm>(RefId, this.ServiceClient, this.Redis, null);
                bool neglectLocId = WebForm.IsLocIndependent;
                if (!this.HasPermission(RefId, Operation, CurrentLoc, neglectLocId))
                    return JsonConvert.SerializeObject(new InsertDataFromWebformResponse { Status = (int)HttpStatusCode.Forbidden, Message = "Access denied to save this data entry!", MessageInt = "Access denied" });
                DateTime dt = DateTime.Now;
                Console.WriteLine("InsertWebformData request received : " + dt);
                WebformData Values = JsonConvert.DeserializeObject<WebformData>(ValObj);
                InsertDataFromWebformResponse Resp = ServiceClient.Post<InsertDataFromWebformResponse>(
                    new InsertDataFromWebformRequest
                    {
                        RefId = RefId,
                        FormData = Values,
                        RowId = RowId,
                        CurrentLoc = CurrentLoc,
                        DraftId = DraftId
                    });
                Console.WriteLine("InsertWebformData execution time : " + (DateTime.Now - dt).TotalMilliseconds);
                return JsonConvert.SerializeObject(Resp);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception : " + ex.Message + "\n" + ex.StackTrace);
                return JsonConvert.SerializeObject(new InsertDataFromWebformResponse { Status = (int)HttpStatusCode.InternalServerError, Message = "Something went wrong", MessageInt = ex.Message, StackTraceInt = ex.StackTrace });
            }
        }

        public int DeleteWebformData(string RefId, int RowId, int CurrentLoc)
        {
            if (!this.HasPermission(RefId, OperationConstants.DELETE, CurrentLoc))
                return -2; //Access Denied
            DeleteDataFromWebformResponse Resp = ServiceClient.Post<DeleteDataFromWebformResponse>(new DeleteDataFromWebformRequest { RefId = RefId, RowId = new List<int> { RowId } });
            return Resp.RowAffected;
        }

        public int CancelWebformData(string RefId, int RowId, int CurrentLoc)
        {
            if (!this.HasPermission(RefId, OperationConstants.CANCEL, CurrentLoc))
                return -2; //Access Denied
            CancelDataFromWebformResponse Resp = ServiceClient.Post<CancelDataFromWebformResponse>(new CancelDataFromWebformRequest { RefId = RefId, RowId = RowId });
            return Resp.RowAffected;
        }

        public string GetAuditTrail(string refid, int rowid, int currentloc)
        {
            try
            {
                EbWebForm WebForm = EbFormHelper.GetEbObject<EbWebForm>(refid, this.ServiceClient, this.Redis, null);
                bool neglectLocId = WebForm.IsLocIndependent;
                if (this.HasPermission(refid, OperationConstants.AUDIT_TRAIL, currentloc, neglectLocId))
                {
                    GetAuditTrailResponse Resp = ServiceClient.Post<GetAuditTrailResponse>(new GetAuditTrailRequest { FormId = refid, RowId = rowid });
                    return Resp.Json;
                }
                Console.WriteLine("GetAuditTrail Access Denied for rowid " + rowid + " , current location " + currentloc);
                return "Access denied";
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in GetAuditTrail. Message: " + ex.Message);
                return $"Internal server error. Message: {ex.Message}";
            }
        }

        private bool HasPermission(string RefId, string ForWhat, int LocId, bool NeglectLocId = false)
        {
            if (ViewBag.wc != RoutingConstants.UC)
                return false;
            if (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) ||
                this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString()) ||
                this.LoggedInUser.Roles.Contains(SystemRoles.SolutionPM.ToString()))
                return true;

            EbOperation Op = EbWebForm.Operations.Get(ForWhat);
            EbObjectType EbType = RefId.GetEbObjectType();
            if (EbType.IntCode == EbObjectTypes.Report)
                Op = EbReport.Operations.Get(ForWhat);

            if (!Op.IsAvailableInWeb)
                return false;

            try
            {
                //Permission string format => 020-00-00982-02:5
                string[] refidParts = RefId.Split("-");
                string objType = refidParts[2].PadLeft(2, '0');
                string objId = refidParts[3].PadLeft(5, '0');
                string operation = Op.IntCode.ToString().PadLeft(2, '0');
                string pWithLoc = objType + '-' + objId + '-' + operation + (NeglectLocId ? "" : (":" + LocId));///////////
                string pGlobalLoc = objType + '-' + objId + '-' + operation + ":-1";
                string temp = this.LoggedInUser.Permissions.Find(p => p.Contains(pWithLoc) || p.Contains(pGlobalLoc));
                if (temp != null)
                    return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(string.Format("Exception when checking user permission: {0}\nRefId = {1}\nOperation = {2}\nLocId = {3}", e.Message, RefId, ForWhat, LocId));
            }

            return false;
        }

        public string DoUniqueCheck(UniqCheckParam[] uniqCheckParams)
        {
            DoUniqueCheckResponse Resp = ServiceClient.Post<DoUniqueCheckResponse>(new DoUniqueCheckRequest { UniqCheckParam = uniqCheckParams });
            return JsonConvert.SerializeObject(Resp.Response);
        }

        public IActionResult GetPdfReport(string refId, string rowId)
        {
            if (!this.HasPermission(refId, OperationConstants.PRINT, 0, true))
                return Redirect("/StatusCode/401");
            List<Param> p = new List<Param>
            {
                new Param { Name = "id", Value = rowId, Type = "7" }
            };
            string s = JsonConvert.SerializeObject(p);
            s = s.ToBase64();
            return Redirect("/ReportRender/Renderlink?refid=" + refId + "&_params=" + s);
        }

        public string SaveFormDraft(string RefId, int DraftId, string Json, int CurrentLoc, string Title)
        {
            try
            {
                Console.WriteLine("SaveDraft request received.");
                SaveFormDraftResponse Resp = ServiceClient.Post<SaveFormDraftResponse>(
                    new SaveFormDraftRequest
                    {
                        RefId = RefId,
                        DraftId = DraftId,
                        Data = Json,
                        LocId = CurrentLoc,
                        Title = Title
                    });
                Console.WriteLine("Returing from SaveDraft...");
                return JsonConvert.SerializeObject(Resp);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception : " + ex.Message + "\n" + ex.StackTrace);
                return JsonConvert.SerializeObject(new SaveFormDraftResponse { Status = (int)HttpStatusCode.InternalServerError, Message = "Something went wrong", MessageInt = ex.Message, StackTraceInt = ex.StackTrace });
            }
        }

        public string DiscardFormDraft(string RefId, int DraftId)
        {
            try
            {
                Console.WriteLine("DiscardFormDraft request received.");
                DiscardFormDraftResponse Resp = ServiceClient.Post<DiscardFormDraftResponse>(
                    new DiscardFormDraftRequest
                    {
                        RefId = RefId,
                        DraftId = DraftId
                    });
                Console.WriteLine("Returing from DiscardFormDraft...");
                return JsonConvert.SerializeObject(Resp);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception : " + ex.Message + "\n" + ex.StackTrace);
                return JsonConvert.SerializeObject(new DiscardFormDraftResponse { Status = (int)HttpStatusCode.InternalServerError, Message = "Something went wrong", MessageInt = ex.Message, StackTraceInt = ex.StackTrace });
            }
        }

        public string CheckEmailAndPhone(string RefId, int RowId, string Data)
        {
            CheckEmailAndPhoneResponse Resp = ServiceClient.Post<CheckEmailAndPhoneResponse>(
                new CheckEmailAndPhoneRequest
                {
                    RefId = RefId,
                    RowId = RowId,
                    Data = Data
                });
            return Resp.Data;
        }

        public string GetUserDetails(string RefId, int RowId, string CtrlName, int CurId)
        {
            GetProvUserListResponse Resp = ServiceClient.Post<GetProvUserListResponse>(
                new GetProvUserListRequest
                {
                    RefId = RefId,
                    RowId = RowId
                });
            return Resp.Data;
        }

        public string UpdateIndexes(string refid)
        {
            if ((this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) || 
                this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString())) && ViewBag.wc == RoutingConstants.DC)
            {
                UpdateIndexesRespone Resp = ServiceClient.Post(new UpdateIndexesRequest { RefId = refid });
                return Resp.Message;
            }
            return "Access denied. Must be a SolutionOwner/Admin in DevConsole.";
        }

        public int InsertBotDetails(string TableName, List<BotFormField> Fields, int Id)
        {
            try
            {
                InsertIntoBotFormTableResponse resp = ServiceClient.Post<InsertIntoBotFormTableResponse>(new InsertIntoBotFormTableRequest { TableName = TableName, Fields = Fields, Id = Id });
                return resp.RowAffected;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in InsertBotDetails. Message: " + ex.Message);
                return 0;
            }
        }

        public string getDesignHtml(string refId)
        {
            GetDesignHtmlResponse resp = ServiceClient.Post<GetDesignHtmlResponse>(new GetDesignHtmlRequest { RefId = refId });
            return resp.Html;
        }

        public string GetLocationConfig()
        {
            Eb_Solution SolutionObj = GetSolutionObject(ViewBag.Cid);
            return JsonConvert.SerializeObject(SolutionObj.LocationConfig);
        }

        //public string AuditTrail(string refid, int rowid)
        //{
        //    //sourc == dest == type == dst id == dst verid== src id == src verid
        //    //ebdbllz23nkqd620180220120030-ebdbllz23nkqd620180220120030-0-2257-2976-2257-2976
        //    try
        //    {
        //        string[] refidparts = refid.Split("-");
        //        if (refidparts[1].Equals(ViewBag.cid))
        //        {
        //            if (this.LoggedInUser.EbObjectIds.Contains(refidparts[3].PadLeft(5, '0')) || this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
        //            {
        //                GetAuditTrailResponse Resp = ServiceClient.Post<GetAuditTrailResponse>(new GetAuditTrailRequest { FormId = refid, RowId = rowid });
        //                //----------------------This code should be changed

        //                EbObjectParticularVersionResponse verResp = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
        //                EbWebForm WebForm = EbSerializers.Json_Deserialize<EbWebForm>(verResp.Data[0].Json);
        //                if (WebForm != null)
        //                {
        //                    string[] Keys = EbControlContainer.GetKeys(WebForm);
        //                    Dictionary<string, string> KeyValue = ServiceClient.Get<GetDictionaryValueResponse>(new GetDictionaryValueRequest { Keys = Keys, Locale = this.LoggedInUser.Preference.Locale }).Dict;
        //                    EbWebForm WebForm_L = EbControlContainer.Localize<EbWebForm>(WebForm, KeyValue);

        //                    Dictionary<string, string> MLPair = GetMLPair(WebForm_L);

        //                    foreach (KeyValuePair<int, FormTransaction> item in Resp.Logs)
        //                    {
        //                        foreach (FormTransactionLine initem in item.Value.Details)
        //                        {
        //                            if (MLPair.ContainsKey(initem.FieldName))
        //                                initem.FieldName = MLPair[initem.FieldName];
        //                        }
        //                    }
        //                }

        //                //--------------------------------
        //                return JsonConvert.SerializeObject(Resp.Logs);
        //            }
        //        }
        //        return string.Empty;
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine("Exception in GetAuditTrail. Message: " + ex.Message);
        //        return string.Empty;
        //    }
        //}

        //private Dictionary<string, string> GetMLPair(EbWebForm WebForm_L)
        //{
        //    Dictionary<string, string> MLPair = new Dictionary<string, string>();
        //    EbControl[] controls = (WebForm_L as EbControlContainer).Controls.FlattenAllEbControls();
        //    foreach (EbControl control in controls)
        //    {
        //        PropertyInfo[] props = control.GetType().GetProperties();
        //        foreach (PropertyInfo prop in props)
        //        {
        //            if (prop.IsDefined(typeof(PropertyEditor)) && prop.GetCustomAttribute<PropertyEditor>().PropertyEditorType == (int)PropertyEditorType.MultiLanguageKeySelector)
        //            {
        //                if (prop.Name == "Label")
        //                    MLPair.Add(control.Name, control.GetType().GetProperty(prop.Name).GetValue(control, null) as String);
        //            }
        //        }
        //    }
        //    return MLPair;
        //}

        public string GetFormControlsFlat(string refId)
        {
            string SCtrls = string.Empty;
            SCtrls = EbSerializers.Json_Serialize(this.ServiceClient.Post<GetCtrlsFlatResponse>(new GetCtrlsFlatRequest() { RefId = refId }).Controls);
            return SCtrls;
        }

        public string updateAllFormTables()
        {
            if (ViewBag.wc == RoutingConstants.DC && this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
            {
                try
                {
                    UpdateAllFormTablesResponse r = this.ServiceClient.Post<UpdateAllFormTablesResponse>(new UpdateAllFormTablesRequest());
                    return r.Message;
                }
                catch (Exception e)
                {
                    return e.Message;
                }
            }
            else
                return ViewBag.wc;
        }
        public string SearchInPlatform4FormData(string key)
        {
            GetGlobalSrchRsltsResp Resp = ServiceClient.Post<GetGlobalSrchRsltsResp>(new GetGlobalSrchRsltsReq { SrchText = key });
            return Resp.Data;
        }


        //for ebblueprint (save bg img,svg)
        public object SaveBluePrint(string svgtxtdata, string bpmeta, int bluprntid, string savBPobj)
        {
            SaveBluePrintRequest Svgreq = new SaveBluePrintRequest();
            //Dictionary<string, string> objBP = JsonConvert.DeserializeObject<Dictionary<string, string>>(savBPobj);
            var httpreq = this.HttpContext.Request.Form;
            if (httpreq.Files.Count > 0)
            {

                var BgFile = httpreq.Files[0];
                byte[] fileData = null;
                using (var memoryStream = new MemoryStream())
                {
                    BgFile.CopyTo(memoryStream);
                    memoryStream.Seek(0, SeekOrigin.Begin);
                    fileData = new byte[memoryStream.Length];
                    memoryStream.ReadAsync(fileData, 0, fileData.Length);
                    Svgreq.BgFile = fileData;
                    Svgreq.BgFileName = BgFile.FileName;
                }
            }
            Svgreq.Txtsvg = svgtxtdata;
            Svgreq.MetaBluePrint = bpmeta;
            Svgreq.BluePrintID = bluprntid;
            //Svgreq.BP_FormData = objBP;


            SaveBluePrintResponse BPres = this.ServiceClient.Post<SaveBluePrintResponse>(Svgreq);
            return BPres;
        }
        public object RetriveBluePrint(int idno)
        {
            RetriveBluePrintResponse rsvg = this.ServiceClient.Post<RetriveBluePrintResponse>(new RetriveBluePrintRequest { Idno = idno });
            return rsvg;

        }

        public object UpdateBluePrint_Dev(int bluprntid, string uptBPobj)
        {
            UpdateBluePrint_DevRequest UpReq = new UpdateBluePrint_DevRequest();
            UpReq.BluePrintID = 0;
            Dictionary<string, string> objBP = JsonConvert.DeserializeObject<Dictionary<string, string>>(uptBPobj);
            var httpreq = this.HttpContext.Request.Form;
            if (httpreq.Files.Count > 0)
            {

                var BgFile = httpreq.Files[0];
                byte[] fileData = null;
                using (var memoryStream = new MemoryStream())
                {
                    BgFile.CopyTo(memoryStream);
                    memoryStream.Seek(0, SeekOrigin.Begin);
                    fileData = new byte[memoryStream.Length];
                    memoryStream.ReadAsync(fileData, 0, fileData.Length);
                    UpReq.BgFile = fileData;
                    UpReq.BgFileName = BgFile.FileName;
                }
            }
            UpReq.BluePrintID = bluprntid;
            UpReq.BP_FormData_Dict = objBP;

            UpdateBluePrint_DevResponse UpResp = this.ServiceClient.Post<UpdateBluePrint_DevResponse>(UpReq);
            return UpResp;
        }
        public IActionResult GetProfile(string r, int l)
        {
            int _mode = 0;
            string p = string.Empty;
            EbObjectParticularVersionResponse verResp = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = r });
            if (verResp != null)
            {
                EbWebForm form = EbSerializers.Json_Deserialize<EbWebForm>(verResp.Data[0].Json);
                if (form != null)
                {
                    GetMyProfileEntryResponse resp = this.ServiceClient.Get(new GetMyProfileEntryRequest { TableName = form.TableName });
                    if (resp != null)
                    {
                        if (resp.RowId > 0)
                        {
                            p = JsonConvert.SerializeObject(new List<Param> { new Param { Name = "id", Type = ((int)EbDbTypes.Int32).ToString(), Value = resp.RowId.ToString() } }).ToBase64();
                            _mode = (int)WebFormModes.View_Mode;
                        }
                        else
                        {
                            _mode = (int)WebFormModes.New_Mode;
                        }
                        return RedirectToAction("WebFormRender", new
                        {
                            refId = r,
                            _locId = l,
                            _mode = _mode,
                            _params = p,
                            renderMode = 4
                        });
                    }
                }
            }
            return Redirect("/StatusCode/404");
        }
    }
}