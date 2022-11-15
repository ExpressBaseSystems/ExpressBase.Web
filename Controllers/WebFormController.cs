using System;
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
using ExpressBase.Common.ServerEvents_Artifacts;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Security;
using System.Collections;
using ExpressBase.Objects.WebFormRelated;

namespace ExpressBase.Web.Controllers
{
    public class WebFormController : EbBaseIntCommonController
    {
        public WebFormController(IServiceClient _ssclient, IRedisClient _redis, IEbServerEventClient _sec) : base(_ssclient, _redis, _sec) { }

        public IActionResult Index(string _r, string _p, int _m, int _l, int _rm, string _lo = "")
        {
            //_r => refId; _p => params; _m => mode; _l => locId; _rm => renderMode
            string refId = _r, _params = _p, _locale = _lo;
            int _mode = _m, _locId = _l;//
            Console.WriteLine(string.Format("Webform Render - refid : {0}, prams : {1}, mode : {2}, locid : {3}", refId, _params, _mode, _locId));
            string resp = GetFormForRendering(refId, _params, _mode, _locId, _rm, false, false, _locale);
            EbFormAndDataWrapper result = JsonConvert.DeserializeObject<EbFormAndDataWrapper>(resp);
            if (result.ErrorMessage != null)
            {
                TempData["ErrorResp"] = GetFormattedErrMsg(result.ErrorMessage);
                return RedirectToAction("Index", "StatusCode", new { statusCode = result.ErrorCode, m = GetFormattedErrMsg(result.ErrorMessage, true) });
            }
            ViewBag.EbFormAndDataWrapper = resp;
            return View();
        }

        public IActionResult Inde(int _r, string _p, int _m, int _l, int _rm, string _lo = "")
        {
            GetRefIdByVerIdResponse Resp = ServiceClient.Post<GetRefIdByVerIdResponse>(new GetRefIdByVerIdRequest { ObjVerId = _r });
            return RedirectToAction("Index", "WebForm", new { _r = Resp.RefId, _p = _p, _m = _m, _l = _l, _rm = _rm, _lo =_lo });
        }

        [ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Any, NoStore = false)]
        public FileContentResult cxt2js()
        {
            EbToolbox _toolBox = new EbToolbox(BuilderType.WebForm);
            string all = _toolBox.EbOnChangeUIfns + ';' + _toolBox.AllMetas + ';' + _toolBox.AllControlls + ';' + _toolBox.EbObjectTypes + ';';
            all += EbControlContainer.GetControlOpsJS(new EbWebForm(), BuilderType.WebForm);
            all = all.Replace("AllMetas", "AllMetas_w").Replace("EbEnums", "EbEnums_w").Replace("EbObjects", "EbObjects_w").Replace("ControlOps", "ControlOps_w");
            return File(all.ToUtf8Bytes(), "text/javascript");
        }

        [ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Any, NoStore = false)]
        public FileContentResult cxt2js_vis()
        {
            var typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DVBuilder, typeof(EbDataVisualizationObject));
            string all = _jsResult.AllMetas + ';' +
                _jsResult.JsObjects + ';' +
                _jsResult.EbObjectTypes + ';';
            return File(all.ToUtf8Bytes(), "text/javascript");
        }

        public string GetFormForRendering(string _refId, string _params, int _mode, int _locId, int _renderMode, bool _dataOnly, bool _randomizeId, string _locale)
        {
            Console.WriteLine(string.Format("GetFormForRendering - refid : {0}, prams : {1}, mode : {2}, locid : {3}", _refId, _params, _mode, _locId));
            EbFormAndDataWrapper resp = new EbFormAndDataWrapper();
            resp.DisableEditButton = new Dictionary<string, string>() { { "disableEditButton", "0" } };

            EbWebForm WebForm = EbFormHelper.GetEbObject<EbWebForm>(_refId, this.ServiceClient, this.Redis, null);
            WebForm.IsRenderMode = true;//this property must set before AfterRedisGet //userctrl using this prop
            WebForm.UserObj = this.LoggedInUser;
            WebForm.SolutionObj = GetSolutionObject(ViewBag.cid);
            WebForm.AfterRedisGet(this.Redis, this.ServiceClient);
            EbWebForm WebForm_L;
            if (WebForm.IsLanguageEnabled && WebForm.SolutionObj.IsMultiLanguageEnabled) 
            {
                string[] Keys = EbWebForm.GetKeys(WebForm);
                Dictionary<string, string> KeyValue = ServiceClient.Get<GetDictionaryValueResponse>(new GetDictionaryValueRequest { Keys = Keys, Locale = _locale }).Dict;
                WebForm_L = WebForm.Localize(KeyValue) as EbWebForm;
            }
            else
                WebForm_L = WebForm;
            resp.RefId = _refId;
            resp.RenderMode = _renderMode > 0 ? _renderMode : 1;
            resp.Mode = WebFormModes.New_Mode.ToString().Replace("_", " ");
            resp.Url = $"/WebForm/Index?_r={_refId}&_p={_params}&_m={_mode}&_l={_locId}{(_renderMode != 2 ? "&_rm=" + _renderMode : "")}&_lo={_locale}";
            resp.IsPartial = _mode > 10;
            _mode = _mode > 0 ? _mode % 10 : _mode;

            try
            {
                GetRowDataBasedOnMode(_params, _mode, _refId, _locId, resp);
            }
            catch (Exception ex)
            {
                string t = $"Exception in GetFormForRendering.\n Message: {ex.Message}\n StackTrace: {ex.StackTrace}";
                Console.WriteLine(t);
                resp.Message = ex.Message;
                resp.ErrorMessage = t;
                resp.ErrorCode = (int)HttpStatusCode.InternalServerError;
                return JsonConvert.SerializeObject(resp);
            }

            if (ViewBag.wc == TokenConstants.DC)
                resp.Mode = WebFormModes.Preview_Mode.ToString().Replace("_", " ");

            ValidateRequest(resp, _mode, _locId, WebForm);

            if (!_dataOnly && resp.ErrorCode == 0)
            {
                if (_randomizeId)
                {
                    EbControl[] Allctrls = WebForm_L.Controls.FlattenAllEbControls();
                    BeforeSaveHelper.UpdateEbSid(WebForm_L, Allctrls, true);
                }
                try
                {
                    EbFormHelper.InitFromDataBase(WebForm_L, this.ServiceClient, this.Redis, ViewBag.wc);
                }
                catch (Exception ex)
                {
                    string t = $"Exception in InitFromDataBase.\n Message: {ex.Message}\n StackTrace: {ex.StackTrace}";
                    Console.WriteLine(t);
                    resp.Message = ex.Message;
                    resp.ErrorMessage = t;
                    resp.ErrorCode = (int)HttpStatusCode.InternalServerError;
                    return JsonConvert.SerializeObject(resp);
                }

                resp.WebFormHtml = WebForm_L.GetHtml();
                resp.WebFormObj = EbSerializers.Json_Serialize(WebForm_L);
                resp.FormPermissions = WebForm.GetLocBasedPermissions();
                resp.HtmlHead = WebForm_L.GetHead();
            }
            return JsonConvert.SerializeObject(resp);
        }

        private void ValidateRequest(EbFormAndDataWrapper resp, int _mode, int _locId, EbWebForm webForm)
        {
            //string _cid = webForm.RefId.Split('-')[1];
            //if (ViewBag.cid != _cid && ViewBag.Env == "Production")
            //{
            //    resp.Message = "Not found";
            //    resp.ErrorMessage = "Cid in refid does not match";
            //    resp.RedirectUrl = "/StatusCode/404";
            //    return;
            //}
            WebformDataWrapper wdr = JsonConvert.DeserializeObject<WebformDataWrapper>(resp.FormDataWrap);
            if (wdr.FormData == null)
            {
                resp.Message = wdr.Message;
                resp.ErrorMessage = resp.FormDataWrap;
                resp.ErrorCode = wdr.Status;
            }
            else if (ViewBag.wc != TokenConstants.DC)
            {
                int RowId = 0;
                if ((int)WebFormModes.Draft_Mode != _mode)
                {
                    SingleRow primRow = wdr.FormData.MultipleTables[wdr.FormData.MasterTable][0];
                    RowId = primRow.RowId;
                    _locId = primRow.LocId;
                }
                if (RowId > 0)
                {
                    bool neglectLocId = webForm.IsLocIndependent;
                    if (!(this.HasPermission(webForm.RefId, OperationConstants.VIEW, _locId, neglectLocId) || this.HasPermission(webForm.RefId, OperationConstants.EDIT, _locId, neglectLocId) ||
                        (this.HasPermission(webForm.RefId, OperationConstants.OWN_DATA, _locId, neglectLocId) && this.LoggedInUser.UserId == wdr.FormData.CreatedBy)))
                    {
                        resp.Message = "Access denied.";
                        resp.ErrorMessage = $"Access denied. RefId: {webForm.RefId}, DataId: {RowId}, LocId: {_locId}, Operation: View/Edit";
                        resp.ErrorCode = (int)HttpStatusCode.Unauthorized;
                    }
                }
                else
                {
                    if (!this.HasPermission(webForm.RefId, OperationConstants.NEW, _locId, true))
                    {
                        resp.Message = "Access denied.";
                        resp.ErrorMessage = $"Access denied. RefId: {webForm.RefId}, DataId: {RowId}, LocId: {_locId}, Operation: New";
                        resp.ErrorCode = (int)HttpStatusCode.Unauthorized;
                    }
                }
            }
        }

        private void GetRowDataBasedOnMode(string _params, int _mode, string refId, int _locId, EbFormAndDataWrapper resp)
        {
            if (_params != null)
            {
                List<Param> ob = JsonConvert.DeserializeObject<List<Param>>(_params.FromBase64());
                if ((int)WebFormDVModes.View_Mode == _mode && ob.Count == 1)
                {
                    Console.WriteLine("GetFormForRendering - View mode request identified.");
                    resp.RowId = Convert.ToInt32(ob[0].Value);
                    resp.FormDataWrap = getRowdata(refId, resp.RowId, _locId, resp.RenderMode);
                    if (resp.RowId > 0)
                    {
                        resp.Mode = WebFormModes.View_Mode.ToString().Replace("_", " ");
                        GetDisableEditBtnInfo(refId, resp.RowId, resp.DisableEditButton);
                    }
                    else
                    {
                        Console.WriteLine("GetFormForRendering - View mode requested but rowId is invalid.");
                        resp.Mode = WebFormModes.New_Mode.ToString().Replace("_", " ");
                    }
                }
                else if ((int)WebFormDVModes.New_Mode == _mode)// prefill mode
                {
                    Console.WriteLine("GetFormForRendering - Prefill mode requested.");
                    GetPrefillDataResponse Resp = ServiceClient.Post<GetPrefillDataResponse>(new GetPrefillDataRequest { RefId = refId, Params = ob, CurrentLoc = _locId, RenderMode = WebFormRenderModes.Normal });
                    resp.FormDataWrap = Resp.FormDataWrap;
                    resp.Mode = WebFormModes.Prefill_Mode.ToString().Replace("_", " ");
                }
                else if ((int)WebFormModes.Export_Mode == _mode || (int)WebFormModes.Clone_Mode == _mode)
                {
                    Console.WriteLine("GetFormForRendering - Export mode requested.");
                    string sRefId = ob.Find(e => e.Name == "srcRefId")?.ValueTo ?? refId;
                    int sRowId = Convert.ToInt32(ob.Find(e => e.Name == "srcRowId")?.ValueTo ?? 0);
                    GetExportFormDataResponse Resp = ServiceClient.Post<GetExportFormDataResponse>(new GetExportFormDataRequest { DestRefId = refId, SourceRefId = sRefId, SourceRowId = sRowId, CurrentLoc = _locId, RenderMode = WebFormRenderModes.Normal });
                    resp.FormDataWrap = Resp.FormDataWrap;
                    resp.Mode = ((WebFormModes)_mode).ToString().Replace("_", " ");
                }
                else if ((int)WebFormModes.Draft_Mode == _mode)
                {
                    Console.WriteLine("GetFormForRendering - Draft mode requested.");
                    int DraftId = Convert.ToInt32(ob.Find(e => e.Name == "id")?.ValueTo ?? 0);
                    GetFormDraftResponse Resp = ServiceClient.Post<GetFormDraftResponse>(new GetFormDraftRequest { RefId = refId, DraftId = DraftId, CurrentLoc = _locId });
                    resp.FormDataWrap = Resp.DataWrapper;
                    resp.Draft_FormData = Resp.FormDatajson;
                    resp.DraftId = DraftId;
                    resp.DraftInfo = Resp.DraftInfo;
                    resp.Mode = WebFormModes.Draft_Mode.ToString().Replace("_", " ");
                }
            }
            else
            {
                resp.FormDataWrap = getRowdata(refId, 0, _locId, resp.RenderMode);
            }
        }

        private void GetDisableEditBtnInfo(string refId, int rowId, Dictionary<string, string> DisableEditButton)
        {
            string dataId = Convert.ToString(rowId);
            bool Has_Key = CheckRedisEditCollection(refId, dataId);
            if (Has_Key)
            {
                string HashValue = this.Redis.GetValueFromHash($"{refId}_Edit", dataId);
                bool IsActive = CheckSubscriptionIdPulse(HashValue);
                if (IsActive)
                {
                    DisableEditButton["disableEditButton"] = "1";
                    GetSubscriptionId_InfoResponse res = GetSubscriberInfo(HashValue);
                    User UsrInfo = GetUserObject(res.AuthId);
                    DisableEditButton.Add("msg", $"This form is opend by {UsrInfo.FullName}");
                }
                else
                {
                    bool clrHashField = this.Redis.RemoveEntryFromHash($"{refId}_Edit", dataId);
                }
            }
        }

        private string GetFormattedErrMsg(string msg, bool ConvertToB64 = false)
        {
            msg = msg.Replace("`", "");
            int len = msg.Length > 500 ? 500 : msg.Length;
            if (!ConvertToB64)
                return msg.Substring(0, len).GraveAccentQuoted();
            return msg.Substring(0, len).ToBase64();
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

            Dictionary<string, string> EnableEditBtn = new Dictionary<string, string>() { { "disableEditButton", "0" } };
            ViewBag.disableEditButton = JsonConvert.SerializeObject(EnableEditBtn);

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
                TempData["ErrorResp"] = GetFormattedErrMsg(ViewBag.formData);
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

            string query = $@"
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
            WHERE COALESCE(FD.eb_del,'F') = 'F' AND COALESCE(FD.is_submitted,'F') = 'F' AND 
                FD.eb_created_by = @eb_created_by AND COALESCE(FD.draft_type, 0) = {(int)FormDraftTypes.NormalDraft}
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
                if (_col.Name == "display_name")
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

        public IActionResult ErrorBin()
        {
            if (ViewBag.wc != TokenConstants.UC)
                return Redirect("/StatusCode/404");

            string query = $@"
SELECT 
	ES.id, 
	ES.title, 
	ES.form_ref_id, 
	COALESCE(EO.display_name, '') display_name, 
    ES.message,
    ES.stack_trace,
    ES.eb_created_by,
	ES.eb_created_at, 
	ES.eb_lastmodified_at 
FROM eb_form_drafts ES
LEFT JOIN eb_objects_ver EOV ON ES.form_ref_id = EOV.refid
LEFT JOIN eb_objects EO ON EOV.eb_objects_id = EO.id
WHERE COALESCE(ES.eb_del,'F') = 'F' AND COALESCE(ES.is_submitted,'F') = 'F' AND ES.draft_type={(int)FormDraftTypes.ErrorBin}
ORDER BY ES.eb_created_at DESC, ES.eb_created_by
; ";

            List<Param> _params = new List<Param>();

            DVColumnCollection DVColumnCollection = new DVColumnCollection()
            {
                new DVNumericColumn { Data = 0, Name = "id", sTitle = "Id", Type = EbDbTypes.Int32, bVisible = false },
                new DVStringColumn { Data = 1, Name = "title", sTitle = "Subject", Type = EbDbTypes.String, bVisible = false},
                new DVStringColumn { Data = 2, Name = "form_ref_id", sTitle = "Ref id", Type = EbDbTypes.String, bVisible = false },
                new DVStringColumn { Data = 3, Name = "display_name", sTitle = "Form name", Type = EbDbTypes.String, bVisible = true, RenderAs = StringRenderType.LinkFromColumn, RefidColumn = new DVBaseColumn(), IdColumn = new DVBaseColumn()  },

                new DVStringColumn { Data = 4, Name = "message", sTitle = "Message", Type = EbDbTypes.String, bVisible = true, AllowedCharacterLength = 40 },
                new DVStringColumn { Data = 5, Name = "stack_trace", sTitle = "Stacktrace", Type = EbDbTypes.String, bVisible = true, AllowedCharacterLength = 50 },
                new DVNumericColumn { Data = 6, Name = "eb_created_by", sTitle = "Created By", Type = EbDbTypes.Int32, bVisible = true },

                new DVDateTimeColumn { Data = 7, Name = "eb_created_at", sTitle = "Created at", Type = EbDbTypes.Date, bVisible = true,Format = DateFormat.DateTime, ConvretToUsersTimeZone = true },
                new DVDateTimeColumn { Data = 8, Name = "eb_lastmodified_at", sTitle = "Last modified at", Type = EbDbTypes.Date, bVisible = true, Format = DateFormat.DateTime, ConvretToUsersTimeZone = true }
            };
            //new DVBooleanColumn{ Data = 3, Name = "is_submitted", sTitle = "Is submitted", Type = EbDbTypes.Boolean, bVisible = true, TrueValue = "T", FalseValue = "F", RenderAs = BooleanRenderType.Icon},

            foreach (DVBaseColumn _col in DVColumnCollection)
            {
                _col.RenderType = _col.Type;
                _col.ClassName = "tdheight";
                _col.Font = null;
                _col.Align = Align.Left;
                if (_col.Name == "display_name")
                {
                    _col.RefidColumn = DVColumnCollection.Get("form_ref_id");
                    _col.IdColumn = DVColumnCollection.Get("id");
                }
            }

            EbDataVisualization Visualization = new EbTableVisualization
            {
                Sql = query,
                ParamsList = _params,
                Columns = DVColumnCollection,
                AutoGen = false,
                IsPaging = true,
                PageLength = 500,
                RowHeight = 38
            };

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
                if (_refid.IsNullOrEmpty())
                    throw new FormException(FormErrors.E0120);
                if (_triggerctrl.IsNullOrEmpty())
                    throw new FormException(FormErrors.E0121);
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
                    Message = ex.Message,
                    Status = (int)HttpStatusCode.InternalServerError,
                    MessageInt = "Exception in PSImportFormData",
                    StackTraceInt = ex.StackTrace
                });
            }
        }

        //dg dr-api
        public string ImportFormData(string _refid, int _rowid, string _triggerctrl, List<Param> _params)
        {
            try
            {
                if (_refid.IsNullOrEmpty())
                    throw new FormException(FormErrors.E0122);
                if (_triggerctrl.IsNullOrEmpty())
                    throw new FormException(FormErrors.E0123);
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
                    Message = ex.Message,
                    Status = (int)HttpStatusCode.InternalServerError,
                    MessageInt = "Exception in ImportFormData",
                    StackTraceInt = ex.StackTrace
                });
            }
        }

        public string SendNotification(string link, string message, string uids)
        {
            string msg;
            try
            {
                NotifyByUserIDsResponse Resp = ServiceClient.Post<NotifyByUserIDsResponse>(new NotifyByUserIDsRequest
                {
                    Link = link,
                    Title = message,
                    UserIDs = uids
                });
                msg = Resp.Message;
            }
            catch (Exception e)
            {
                msg = e.Message;
            }
            return msg;
        }

        //public string GetDynamicGridData(string _refid, int _rowid, string _srcid, string[] _target)
        //{
        //    try
        //    {
        //        if (_refid.IsNullOrEmpty())
        //            throw new FormException(FormErrors.E0124);
        //        if (_srcid.IsNullOrEmpty())
        //            throw new FormException(FormErrors.E0125);
        //        if (_target.Length == 0)
        //            throw new FormException(FormErrors.E0126);

        //        GetDynamicGridDataResponse Resp = ServiceClient.Post<GetDynamicGridDataResponse>(new GetDynamicGridDataRequest { RefId = _refid, RowId = _rowid, SourceId = _srcid, Target = _target });
        //        return Resp.FormDataWrap;
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine("Exception in GetDynamicGridData. Message: " + ex.Message);
        //        return JsonConvert.SerializeObject(new WebformDataWrapper()
        //        {
        //            Message = ex.Message,
        //            Status = (int)HttpStatusCode.InternalServerError,
        //            MessageInt = "Exception in GetDynamicGridData",
        //            StackTraceInt = ex.StackTrace
        //        });
        //    }
        //}

        public string ExecuteSqlValueExpr(string _refid, string _triggerctrl, List<Param> _params, int _type)
        {
            ExecuteSqlValueExprResponse Resp = this.ServiceClient.Post<ExecuteSqlValueExprResponse>(new ExecuteSqlValueExprRequest { RefId = _refid, Trigger = _triggerctrl, Params = _params, ExprType = _type });
            string res = "null";
            if (!string.IsNullOrWhiteSpace(Resp.Result))
                res = Resp.Result;
            return res;
        }

        public string GetDataPusherJson(string RefId)
        {
            GetDataPusherJsonResponse Resp = this.ServiceClient.Post<GetDataPusherJsonResponse>(new GetDataPusherJsonRequest { RefId = RefId });
            return Resp.Json;
        }

        public string ExecuteReview(string Data, string RefId, int RowId, int CurrentLoc)
        {
            try
            {
                string Operation = OperationConstants.NEW;
                if (RowId > 0)
                    Operation = OperationConstants.EDIT;
                EbWebForm WebForm = EbFormHelper.GetEbObject<EbWebForm>(RefId, this.ServiceClient, this.Redis, null);
                bool neglectLocId = WebForm.IsLocIndependent;
                if (!(this.HasPermission(RefId, Operation, CurrentLoc, neglectLocId) || (Operation == OperationConstants.EDIT && this.HasPermission(RefId, OperationConstants.OWN_DATA, CurrentLoc, neglectLocId))))// UserId checked in SS for OWN_DATA
                    return JsonConvert.SerializeObject(new InsertDataFromWebformResponse { Status = (int)HttpStatusCode.Forbidden, Message = "Access denied to save this data entry!", MessageInt = "Access denied" });
                DateTime dt = DateTime.Now;
                Console.WriteLine("ExecuteReview request received : " + dt);
                ExecuteReviewResponse Resp = ServiceClient.Post<ExecuteReviewResponse>(
                    new ExecuteReviewRequest
                    {
                        RefId = RefId,
                        FormData = Data,
                        RowId = RowId,
                        CurrentLoc = CurrentLoc
                    });
                Console.WriteLine("ExecuteReview execution time : " + (DateTime.Now - dt).TotalMilliseconds);
                return JsonConvert.SerializeObject(Resp);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception : " + ex.Message + "\n" + ex.StackTrace);
                return JsonConvert.SerializeObject(new ExecuteReviewResponse { Status = (int)HttpStatusCode.InternalServerError, Message = "Something went wrong", MessageInt = ex.Message, StackTraceInt = ex.StackTrace });
            }
        }

        public string InsertWebformData(string ValObj, string RefId, int RowId, int CurrentLoc, int DraftId, string sseChannel, string sse_subscrId)
        {
            try
            {
                string Operation = OperationConstants.NEW;
                if (RowId > 0)
                    Operation = OperationConstants.EDIT;
                EbWebForm WebForm = EbFormHelper.GetEbObject<EbWebForm>(RefId, this.ServiceClient, this.Redis, null);
                bool neglectLocId = WebForm.IsLocIndependent;
                if (!(this.HasPermission(RefId, Operation, CurrentLoc, neglectLocId) || (Operation == OperationConstants.EDIT && this.HasPermission(RefId, OperationConstants.OWN_DATA, CurrentLoc, neglectLocId))))// UserId checked in SS for OWN_DATA
                    return JsonConvert.SerializeObject(new InsertDataFromWebformResponse { Status = (int)HttpStatusCode.Forbidden, Message = FormErrors.E0127, MessageInt = $"Access denied. Info: [{RefId}, {Operation}, {CurrentLoc}, {neglectLocId}]" });
                DateTime dt = DateTime.Now;
                Console.WriteLine("InsertWebformData request received : " + dt);
                InsertDataFromWebformResponse Resp = ServiceClient.Post<InsertDataFromWebformResponse>(
                    new InsertDataFromWebformRequest
                    {
                        RefId = RefId,
                        FormData = ValObj,
                        RowId = RowId,
                        CurrentLoc = CurrentLoc,
                        DraftId = DraftId
                    });
                Console.WriteLine("InsertWebformData execution time : " + (DateTime.Now - dt).TotalMilliseconds);
                //////using server events enable other opened form edit buttons
                //FormEdit_TabClosed(RefId, RowId.ToString(), sseChannel, sse_subscrId);

                return JsonConvert.SerializeObject(Resp);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception : " + ex.Message + "\n" + ex.StackTrace);
                return JsonConvert.SerializeObject(new InsertDataFromWebformResponse { Status = (int)HttpStatusCode.InternalServerError, Message = FormErrors.E0128 + ex.Message, MessageInt = "Exception in InsertWebformData[web]", StackTraceInt = ex.StackTrace });
            }
        }

        public int DeleteWebformData(string RefId, int RowId, int CurrentLoc)
        {
            if (!this.HasPermission(RefId, OperationConstants.DELETE, CurrentLoc))
                return -2; //Access Denied
            DeleteDataFromWebformResponse Resp = ServiceClient.Post<DeleteDataFromWebformResponse>(new DeleteDataFromWebformRequest { RefId = RefId, RowId = new List<int> { RowId } });
            return Resp.RowAffected;
        }

        public (int, string) CancelWebformData(string RefId, int RowId, int CurrentLoc, bool Cancel)
        {
            if (!this.HasPermission(RefId, OperationConstants.CANCEL, CurrentLoc))
                return (-2, null); //Access Denied
            CancelDataFromWebformResponse Resp = ServiceClient.Post<CancelDataFromWebformResponse>(new CancelDataFromWebformRequest { RefId = RefId, RowId = RowId, Cancel = Cancel });
            return (Resp.RowAffected, Resp.ModifiedAt);
        }

        public (int, string) LockUnlockWebformData(string RefId, int RowId, int CurrentLoc, bool Lock)
        {
            if (!this.HasPermission(RefId, OperationConstants.LOCK_UNLOCK, CurrentLoc))
                return (-2, null); //Access Denied
            LockUnlockWebFormDataResponse Resp = ServiceClient.Post<LockUnlockWebFormDataResponse>(new LockUnlockWebFormDataRequest { RefId = RefId, RowId = RowId, Lock = Lock });
            return (Resp.Status, Resp.ModifiedAt);
        }

        public string GetPushedDataInfo(string RefId, int RowId, int CurrentLoc)
        {
            if (!this.HasPermission(RefId, OperationConstants.AUDIT_TRAIL, CurrentLoc))
                return "Access Denied";
            GetPushedDataInfoResponse Resp = ServiceClient.Post<GetPushedDataInfoResponse>(new GetPushedDataInfoRequest { RefId = RefId, RowId = RowId });
            return Resp.Result;
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
            return EbFormHelper.HasPermission(this.LoggedInUser, RefId, ForWhat, LocId, NeglectLocId, RoutingConstants.UC);
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

        //list view print
        public IActionResult GetPdfReportMulti(string refId, string rowId, string _sub)
        {
            if (!this.HasPermission(refId, OperationConstants.PRINT, 0, true))
                return Redirect("/StatusCode/401");

            try
            {
                List<Param> p = new List<Param>
            {
                new Param { Name = "id", Value = rowId, Type = "16" }
            };

                string s = JsonConvert.SerializeObject(p);
                s = s.ToBase64();
                return Redirect("/ReportRender/RenderlinkMulti?refid=" + refId + "&_params=" + s + "&Sub=" + _sub);
            }

            catch (Exception e)
            {
                Console.WriteLine("Error in GetPdfReportMulti" + e.Message + e.StackTrace);
                return Redirect("/StatusCode/500");
            }
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

        public string UpdateIndexes(string refid, int limit, int offset)
        {
            try
            {
                if ((this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) ||
                    this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString())) && ViewBag.wc == RoutingConstants.DC)
                {
                    UpdateIndexesRespone Resp = ServiceClient.Post(new UpdateIndexesRequest { RefId = refid, Limit = limit, Offset = offset });
                    return Resp.Message;
                }
                return "Access denied. Must be a SolutionOwner/Admin in DevConsole.";
            }
            catch (Exception e)
            {
                return "ERROR : " + e.Message;
            }
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

        public string updateAllFormTables(string op)
        {
            if (ViewBag.wc == RoutingConstants.DC && this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
            {
                try
                {
                    UpdateAllFormTablesResponse r = this.ServiceClient.Post<UpdateAllFormTablesResponse>(new UpdateAllFormTablesRequest() { InMsg = op });
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
        public IActionResult GetProfile(int l)
        {
            GetMyProfileEntryResponse resp = this.ServiceClient.Get(new GetMyProfileEntryRequest());
            if (resp != null)
            {
                int _mode;
                string p = string.Empty;
                if (resp.RowId > 0)
                {
                    p = JsonConvert.SerializeObject(new List<Param> { new Param { Name = "id", Type = ((int)EbDbTypes.Int32).ToString(), Value = resp.RowId.ToString() } }).ToBase64();
                    _mode = (int)WebFormModes.View_Mode;
                }
                else
                    _mode = (int)WebFormModes.New_Mode;
                return RedirectToAction("Index", new
                {
                    _r = resp.Refid,
                    _l = l,
                    _m = _mode,
                    _p = p,
                    _rm = 4
                });
            }
            return Redirect("/StatusCode/404");
        }


        public bool EnableEditMode_SSE(string formId, string dataId, string sseChannel, string sse_subscrId)
        {
            string HashKey = $"{formId}_Edit";
            bool Has_Key = this.Redis.HashContainsEntry(HashKey, dataId);
            if (Has_Key)
            {
                string HashValue = this.Redis.GetValueFromHash(HashKey, dataId);
                bool IsActive = CheckSubscriptionIdPulse(HashValue);
                if (IsActive)
                {
                    return false;
                }
                else
                {
                    return SetHashEntry4FormEdit(HashKey, dataId, sse_subscrId, sseChannel);
                }

            }
            else
            {
                return SetHashEntry4FormEdit(HashKey, dataId, sse_subscrId, sseChannel);
            }
        }

        public bool CheckRedisEditCollection(string formId, string dataId)
        {
            string HashKey = $"{formId}_Edit";
            return this.Redis.HashContainsEntry(HashKey, dataId);
        }

        public bool CheckSubscriptionIdPulse(string sse_subscriberId)
        {
            SetTokenForServerEvents();
            CheckSubscriptionId_IsActiveResponse res = this.ServerEventClient.Post<CheckSubscriptionId_IsActiveResponse>(new CheckSubscriptionId_IsActiveRequest
            {
                ToSubscriptionId = sse_subscriberId
            });
            return res.IsActive;
        }

        public void FormEdit_TabClosed(string formId, string dataId, string sseChannel, string sse_subscrId)
        {
            string HashKey = $"{formId}_Edit";
            ////string HashValue=this.Redis.GetValueFromHash(HashKey, dataId);
            bool tem = this.Redis.RemoveEntryFromHash(HashKey, dataId);

            string Msg = "Edit button has been enabled";
            string Selector = "cmd.WebFormEdit_Enable";
            string[] channelArr = { sseChannel };
            SendFormEditSSE_Notification(Msg, Selector, channelArr);
        }

        public bool SetHashEntry4FormEdit(string HashKey, string dataId, string sse_subscriberId, string sseChannel)
        {
            bool HashSetKey_Value = this.Redis.SetEntryInHash(HashKey, dataId, sse_subscriberId);

            GetSubscriptionId_InfoResponse res = GetSubscriberInfo(sse_subscriberId);
            User UsrInfo = GetUserObject(res.AuthId);
            string Msg = $"This form is currently opened by {UsrInfo.FullName}";
            string Selector = "cmd.WebFormEdit_Disable";
            string[] channelArr = { sseChannel };
            SendFormEditSSE_Notification(Msg, Selector, channelArr);
            return true;
        }

        public GetSubscriptionId_InfoResponse GetSubscriberInfo(string sse_subscriberId)
        {
            SetTokenForServerEvents();
            return this.ServerEventClient.Post<GetSubscriptionId_InfoResponse>(new GetSubscriptionId_InfoRequest
            {
                ToSubscriptionId = sse_subscriberId
            });

        }
        public void SendFormEditSSE_Notification(string Msg, string Selector, string[] channelArr)
        {
            SetTokenForServerEvents();
            this.ServerEventClient.Post<NotifyResponse>(new NotifyChannelRequest
            {
                Msg = Msg,
                Selector = Selector,
                ToChannel = channelArr
            });

        }
        public void SetTokenForServerEvents()
        {
            this.ServerEventClient.BearerToken = this.ServiceClient.BearerToken;
            this.ServerEventClient.RefreshToken = this.ServiceClient.RefreshToken;
            this.ServerEventClient.RefreshTokenUri = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_GET_ACCESS_TOKEN_URL);
        }

        public string SendOTP_Contol(string formRefid, string ctrlId, string sendOTPto)
        {

            string Tstamp = DateTime.Now.ToString("yyyyMMddHHmmssfff");
            string otpRedisKey = string.Concat(formRefid, ctrlId, this.LoggedInUser.UserId, Tstamp);

            GetOTPResponse resp = this.ServiceClient.Post(new GetOTPRequest());
            this.Redis.SetValue(otpRedisKey, resp.OTP, new TimeSpan(1, 0, 0, 0));////////////////
                                                                                 //this.Redis.SetValue(otpRedisKey, resp.OTP);
            Eb_Solution sol = GetSolutionObject(this.LoggedInUser.CId);
            var temp = this.ServiceClient.Post<SmsDirectRequest>(new SmsDirectRequest
            {
                To = sendOTPto,
                Body = $"otp for verifivation is{resp.OTP}",
                SolnId = sol.SolutionID,
                UserAuthId = this.LoggedInUser.AuthId,
                UserId = this.LoggedInUser.UserId,
                WhichConsole = this.LoggedInUser.wc
            });
            //var klq = this.Redis.Remove(otpRedisKey);///////////////////////
            return Tstamp;
        }

        public bool VerifyOTP_control(string formRefid, string ctrlId, string tstamp, string otpValue)
        {
            bool b = false;
            string verifyKey = string.Concat(formRefid, ctrlId, this.LoggedInUser.UserId, tstamp);
            string otpRedisValue = this.Redis.GetValue(verifyKey);
            if (Int32.Parse(otpValue) == Int32.Parse(otpRedisValue))
            {
                b = true;
            }
            return b;
        }
        public bool ResendOTP_control(string formRefid, string ctrlId, string tstamp, string sendOTPto)
        {
            return true;//////////////////
            bool b = false;
            string verifyKey = string.Concat(formRefid, ctrlId, this.LoggedInUser.UserId, tstamp);
            string otpRedisValue = this.Redis.GetValue(verifyKey);
            if (Int32.Parse(sendOTPto) == Int32.Parse(otpRedisValue))
            {
                b = true;
            }
            return b;
        }
    }
}