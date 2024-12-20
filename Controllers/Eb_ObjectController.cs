﻿using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using System.Reflection;
using DiffPlex.DiffBuilder;
using DiffPlex;
using DiffPlex.DiffBuilder.Model;
using Newtonsoft.Json;
using System.Text;
using ExpressBase.Common.Structures;
using ExpressBase.Web.BaseControllers;
using System.Text.RegularExpressions;
using ExpressBase.Web.Filters;
using ExpressBase.Objects.Objects.SmsRelated;
using ExpressBase.Common.SqlProfiler;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Helpers;
namespace ExpressBase.Web.Controllers
{
    public class Eb_ObjectController : EbBaseIntCommonController
    {
        public Eb_ObjectController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        [EbBreadCrumbFilter("Builders/", "ObjectType")]
        [HttpGet]
        [HttpPost]
        public IActionResult Index(string objid, int objtype, bool buildermode = true)
        {
            if (ViewBag.wc == "dc")
            {
                ViewBag.al_arz_map_key = Environment.GetEnvironmentVariable(EnvironmentConstants.AL_GOOGLE_MAP_KEY);
                dynamic _object = null;
                Context2Js _c2js = new Context2Js();
                ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
                ViewBag.currentUser = LoggedInUser;
                EbObjectType type = (EbObjectType)(objtype);
                HttpContext.Items["ObjectType"] = type;
                ViewBag.mode = buildermode;

                Eb_Solution soln = GetSolutionObject(ViewBag.cid);
                ViewBag.versioning = soln.IsVersioningEnabled;

                if (objid != "null")
                {
                    ViewBag.Obj_id = objid;
                    EbObjectExploreObjectResponse resultlist = ServiceClient.Get(new EbObjectExploreObjectRequest { Id = Convert.ToInt32(objid) });
                    EbObjectWrapper element = resultlist.Data;
                    if (element != null)
                    {
                        ViewBag.IsNew = "false";
                        ViewBag.ObjectName = element.DisplayName;
                        ViewBag.NameObj4Title = EbSerializers.Json_Serialize(new NameObj() { Value = element.DisplayName });//regional languages not support in ViewBag
                        ViewBag.ObjectDesc = element.Description;
                        ViewBag.Status = element.Status;
                        ViewBag.VersionNumber = element.VersionNumber;
                        ViewBag.ObjType = objtype;
                        ViewBag.Refid = element.RefId;
                        ViewBag.Majorv = element.Dashboard_Tiles.MajorVersionNumber;
                        ViewBag.Tags = element.Tags;
                        ViewBag.AppId = element.Apps;
                        ViewBag.DashboardTiles = element.Dashboard_Tiles;
                        ViewBag.IsLogEnabled = element.IsLogEnabled;
                        ViewBag.IsPublic = element.IsPublic;
                        ViewBag.workingMode = element.WorkingMode;

                        if (String.IsNullOrEmpty(element.Json_wc) && !String.IsNullOrEmpty(element.Json_lc))
                        {
                            ViewBag.ReadOnly = true;
                            _object = EbSerializers.Json_Deserialize(element.Json_lc);
                            ViewBag.dsObj = _object;
                            _object.Status = element.Status;
                            _object.RefId = element.RefId;
                            _object.VersionNumber = element.VersionNumber;
                            _object.DisplayName = element.DisplayName;
                            ViewBag.Workingcopy = element.Wc_All;
                        }
                        else if (String.IsNullOrEmpty(element.Json_lc) && !String.IsNullOrEmpty(element.Json_wc))
                        {
                            ViewBag.ReadOnly = false;
                            _object = EbSerializers.Json_Deserialize(element.Json_wc);
                            ViewBag.dsObj = _object;
                            _object.Status = element.Status;
                            _object.RefId = element.RefId;
                            _object.VersionNumber = element.VersionNumber;
                            _object.DisplayName = element.DisplayName;
                            ViewBag.Workingcopy = element.Wc_All;
                        }
                    }
                }
                else
                {
                    ViewBag.IsNew = "true";
                    ViewBag.Refid = string.Empty;
                    ViewBag.ObjectName = "*Untitled";
                    ViewBag.NameObj4Title = EbSerializers.Json_Serialize(new NameObj() { Value = "*Untitled" });//regional languages not support in ViewBag
                    ViewBag.Status = string.Empty;
                    ViewBag.ObjectDesc = string.Empty;
                    ViewBag.ReadOnly = false;
                    ViewBag.ObjType = objtype;
                    ViewBag.Majorv = 0;
                    ViewBag.Workingcopy = new string[0];
                    ViewBag.Tags = string.Empty;
                    ViewBag.AppId = "";
                    ViewBag.DashboardTiles = null;
                    ViewBag.VersionNumber = "1.0.0.w";
                    ViewBag.IsPublic = false;
                    ViewBag.workingMode = true;
                }
                if (type.Equals(EbObjectTypes.DataReader))
                {
                    Type[] typeArray = typeof(EbDataSourceMain).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.DataReader, typeof(EbDataSourceMain));
                    //_jsResult = CSharpToJs.GenerateJs<EbDatasourceMain>(BuilderType.DataSource, typeArray);
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis, ServiceClient);
                        ViewBag.dsObj = _object;
                    }
                }
                else if (type.Equals(EbObjectTypes.HtmlPage))
                {
                    Type[] typeArray = typeof(EbHtmlPageBase).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.HtmlPage, typeof(EbHtmlPageBase));
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis, ServiceClient);
                        ViewBag.dsObj = _object;
                    }
                }
                else if (type.Equals(EbObjectTypes.MaterializedView))
                {
                    Type[] typeArray = typeof(EbMaterializedViewBase).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.MaterializedView, typeof(EbMaterializedViewBase));
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis, ServiceClient);
                        ViewBag.dsObj = _object;
                    }
                }
                else if (type.Equals(EbObjectTypes.PosForm))
                {
                    Type[] typeArray = typeof(EbPosFormBase).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.PosForm, typeof(EbPosFormBase));
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis, ServiceClient);
                        ViewBag.dsObj = _object;
                    }
                }
                else if (type.Equals(EbObjectTypes.DataWriter))
                {
                    Type[] typeArray = typeof(EbDataSourceMain).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.DataWriter, typeof(EbDataSourceMain));
                    //_jsResult = CSharpToJs.GenerateJs<EbDatasourceMain>(BuilderType.DataSource, typeArray);
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis, ServiceClient);
                        ViewBag.dsObj = _object;
                    }
                }
                else if (type.Equals(EbObjectTypes.SqlFunction))
                {
                    Type[] typeArray = typeof(EbDataSourceMain).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.SqlFunctions, typeof(EbDataSourceMain));
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis, ServiceClient);
                        ViewBag.dsObj = _object;
                    }
                }
                else if (type.Equals(EbObjectTypes.TableVisualization) || type.Equals(EbObjectTypes.ChartVisualization) || type.Equals(EbObjectTypes.MapView))
                {
                    Type[] typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.DVBuilder, typeof(EbDataVisualizationObject), typeof(EbObject));
                    if (_object != null)
                    {
                        //---------------------temp fix to copy old prop value (string) to new prop value (EbScript)-------------------------------
                        foreach (DVBaseColumn c in (_object as EbDataVisualization).Columns)
                        {
                            if (c._Formula == null)
                            {
                                if (!string.IsNullOrEmpty(c.Formula))
                                    c._Formula = new EbScript { Code = c.Formula, Lang = ScriptingLanguage.CSharp };
                                else
                                    c._Formula = new EbScript();
                            }
                        }
                        //-----------------------------------------------------------------------------------------------------------------------
                        if (!(_object as EbDataVisualization).IsDataFromApi)
                            _object.AfterRedisGet(Redis, ServiceClient);
                        ViewBag.dsObj = _object;
                    }
                    GetFormBuilderRelatedDataResp result = this.ServiceClient.Get(new GetFormBuilderRelatedDataRqst { EbObjectRefId = null, EbObjType = EbObjectTypes.Null.IntCode });
                    ViewBag.roles = JsonConvert.SerializeObject(result.Roles);
                }
                else if (type.Equals(EbObjectTypes.Report))
                {
                    Type[] typeArray = typeof(EbReportObject).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.Report, typeof(EbReportObject));
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis, ServiceClient);
                        ViewBag.dsObj = _object;
                    }
                }
                else if (type.Equals(EbObjectTypes.EmailBuilder))
                {
                    Type[] typeArray = typeof(EbEmailTemplateBase).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.EmailBuilder, typeof(EbEmailTemplateBase));
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis);
                        ViewBag.dsObj = _object;
                    }
                }
                else if (type.Equals(EbObjectTypes.FilterDialog))
                {
                    Type[] typeArray = typeof(EbFilterDialog).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.FilterDialog, typeof(EbFilterDialog));
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis);
                        ViewBag.dsObj = _object;
                    }
                }
                else if (type.Equals(EbObjectTypes.SmsBuilder))
                {
                    Type[] typeArray = typeof(EbSmsTemplateBase).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.SmsBuilder, typeof(EbSmsTemplateBase));
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis);
                        ViewBag.dsObj = _object;
                    }
                }
                else if (type.Equals(EbObjectTypes.Api))
                {
                    Type[] typeArray = typeof(EbApiWrapper).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.ApiBuilder, typeof(EbApiWrapper));
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis);
                        ViewBag.dsObj = _object;
                    }
                }
                else if (type.Equals(EbObjectTypes.MobilePage))
                {
                    Type[] typeArray = typeof(EbMobilePageBase).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.MobilePage, typeof(EbMobilePageBase), typeof(EbObject));
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis);
                        ViewBag.dsObj = _object;
                    }
                }
                else if (type.Equals(EbObjectTypes.DashBoard))
                {
                    Type[] typeArray = typeof(EbDashBoardWraper).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.DashBoard, typeof(EbDashBoardWraper), typeof(EbObject));
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis);
                        ViewBag.dsObj = _object;
                    }
                    List<int> types = new List<int>() { 14, 16, 17, 21 };
                    GetAllLiveObjectsResp result = this.ServiceClient.Get<GetAllLiveObjectsResp>(new GetAllLiveObjectsRqst { Typelist = types });
                    ViewBag.ControlOperations = EbControlContainer.GetControlOpsJS((new EbWebForm()) as EbControlContainer, BuilderType.WebForm);
                    ViewBag.SideBarMenu = JsonConvert.SerializeObject(result.Data);
                }
                else if (type.Equals(EbObjectTypes.CalendarView))
                {
                    Type[] typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.Calendar, typeof(EbCalendarWrapper), typeof(EbObject));
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis);
                        ViewBag.dsObj = _object;
                    }
                }
                else if (type.Equals(EbObjectTypes.SqlJob))
                {
                    Type[] typeArray = typeof(EbSqlJobWrapper).GetTypeInfo().Assembly.GetTypes();
                    _c2js = new Context2Js(typeArray, BuilderType.SqlJob, typeof(EbSqlJobWrapper), typeof(EbObject));
                    if (_object != null)
                    {
                        _object.AfterRedisGet(Redis);
                        ViewBag.dsObj = _object;
                    }
                }

                if (type.Equals(EbObjectTypes.UserControl) || type.Equals(EbObjectTypes.WebForm) || type.Equals(EbObjectTypes.FilterDialog) || type.Equals(EbObjectTypes.BotForm))
                {
                    GetFormBuilderRelatedDataResp result = null;
                    if (type.Equals(EbObjectTypes.BotForm))
                    {
                        result = this.ServiceClient.Get(new GetFormBuilderRelatedDataRqst { EbObjectRefId = null, EbObjType = EbObjectTypes.Null.IntCode });
                    }
                    else
                    {
                        result = this.ServiceClient.Get(new GetFormBuilderRelatedDataRqst { EbObjectRefId = ViewBag.Refid, EbObjType = EbObjectTypes.UserControl.IntCode });
                        string UserControlsHtml = string.Empty;
                        foreach (KeyValuePair<string, List<EbObjectWrapper>> _obj in result.Data)
                        {
                            EbObjectWrapper _objverL = null;
                            string versionHtml = "<select style = 'float: right; border: none;'>";
                            foreach (EbObjectWrapper _objver in _obj.Value)
                            {
                                versionHtml += "<option refid='" + _objver.RefId + "'>" + _objver.VersionNumber + "</option>";
                                _objverL = _objver;
                            }
                            versionHtml += "</select>";
                            UserControlsHtml += string.Concat("<div eb-type='UserControl' class='tool'>", _objverL.DisplayName, versionHtml, "</div>");
                        }
                        ViewBag.UserControlHtml = string.Concat(HtmlConstants.TOOL_HTML.Replace("@id@", "toolb_user_ctrls").Replace("@label@", "User Controls"), UserControlsHtml, "</div>");
                    }

                    if (type.Equals(EbObjectTypes.WebForm) || type.Equals(EbObjectTypes.BotForm))
                    {
                        ViewBag.roles = JsonConvert.SerializeObject(result.Roles);
                        ViewBag.userGroups = JsonConvert.SerializeObject(result.UserGroups);
                        ViewBag.userTypes = JsonConvert.SerializeObject(result.UserTypes);
                    }

                    if (_object is EbWebForm)
                    {
                        EbWebForm _dsobj = _object as EbWebForm;
                        _dsobj.AfterRedisGet(Redis, this.ServiceClient);
                        ViewBag.dsObj = _dsobj;
                    }
                    else if (_object is EbUserControl)
                    {
                        EbUserControl _dsobj = _object as EbUserControl;
                        _dsobj.AfterRedisGet(Redis, this.ServiceClient);
                        ViewBag.dsObj = _dsobj;
                    }
                }
                ViewBag.Meta = _c2js.AllMetas;
                ViewBag.JsObjects = _c2js.JsObjects;
                ViewBag.EbObjectTypes = _c2js.EbObjectTypes;
                ViewBag.TypeRegister = _c2js.TypeRegister;
                return View();
            }
            else
                return Redirect("/StatusCode/401");
        }

        [ResponseCache(Duration = 1296000, Location = ResponseCacheLocation.Any, NoStore = false)]
        public FileContentResult cxt2js_dev(string v, int t)
        {
            EbObjectType objType = EbObjectTypes.Get(t);
            Context2Js _c2js = null;

            if (objType.Equals(EbObjectTypes.DataReader))
            {
                Type[] typeArray = typeof(EbDataSourceMain).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.DataReader, typeof(EbDataSourceMain));
            }
            else if (objType.Equals(EbObjectTypes.HtmlPage))
            {
                Type[] typeArray = typeof(EbHtmlPageBase).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.HtmlPage, typeof(EbHtmlPageBase));
            }
            else if (objType.Equals(EbObjectTypes.MaterializedView))
            {
                Type[] typeArray = typeof(EbMaterializedViewBase).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.MaterializedView, typeof(EbMaterializedViewBase));
            }
            else if (objType.Equals(EbObjectTypes.PosForm))
            {
                Type[] typeArray = typeof(EbPosFormBase).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.PosForm, typeof(EbPosFormBase));
            }
            else if (objType.Equals(EbObjectTypes.DataWriter))
            {
                Type[] typeArray = typeof(EbDataSourceMain).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.DataWriter, typeof(EbDataSourceMain));
            }
            else if (objType.Equals(EbObjectTypes.SqlFunction))
            {
                Type[] typeArray = typeof(EbDataSourceMain).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.SqlFunctions, typeof(EbDataSourceMain));
            }
            else if (objType.Equals(EbObjectTypes.TableVisualization) || objType.Equals(EbObjectTypes.ChartVisualization) || objType.Equals(EbObjectTypes.MapView))
            {
                Type[] typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.DVBuilder, typeof(EbDataVisualizationObject), typeof(EbObject));
            }
            else if (objType.Equals(EbObjectTypes.Report))
            {
                Type[] typeArray = typeof(EbReportObject).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.Report, typeof(EbReportObject));
            }
            else if (objType.Equals(EbObjectTypes.EmailBuilder))
            {
                Type[] typeArray = typeof(EbEmailTemplateBase).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.EmailBuilder, typeof(EbEmailTemplateBase));
            }
            else if (objType.Equals(EbObjectTypes.SmsBuilder))
            {
                Type[] typeArray = typeof(EbSmsTemplateBase).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.SmsBuilder, typeof(EbSmsTemplateBase));
            }
            else if (objType.Equals(EbObjectTypes.Api))
            {
                Type[] typeArray = typeof(EbApiWrapper).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.ApiBuilder, typeof(EbApiWrapper));
            }
            else if (objType.Equals(EbObjectTypes.MobilePage))
            {
                Type[] typeArray = typeof(EbMobilePageBase).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.MobilePage, typeof(EbMobilePageBase), typeof(EbObject));
            }
            else if (objType.Equals(EbObjectTypes.DashBoard))
            {
                Type[] typeArray = typeof(EbDashBoardWraper).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.DashBoard, typeof(EbDashBoardWraper), typeof(EbObject));
            }
            else if (objType.Equals(EbObjectTypes.CalendarView))
            {
                Type[] typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.Calendar, typeof(EbCalendarWrapper), typeof(EbObject));
            }
            else if (objType.Equals(EbObjectTypes.SqlJob))
            {
                Type[] typeArray = typeof(EbSqlJobWrapper).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.SqlJob, typeof(EbSqlJobWrapper), typeof(EbObject));
            }

            if (_c2js != null)
            {
                string st = _c2js.AllMetas + ';' + _c2js.JsObjects + ';' + _c2js.EbObjectTypes + ';' + _c2js.TypeRegister + ';';
                return File(st.ToUtf8Bytes(), "text/javascript");
            }

            EbToolbox _toolBox = null;
            if (objType.Equals(EbObjectTypes.WebForm))
                _toolBox = new EbToolbox(BuilderType.WebForm);
            else if (objType.Equals(EbObjectTypes.BotForm))
                _toolBox = new EbToolbox(BuilderType.BotForm);
            else if (objType.Equals(EbObjectTypes.FilterDialog))
                _toolBox = new EbToolbox(BuilderType.FilterDialog);
            else if (objType.Equals(EbObjectTypes.UserControl))
                _toolBox = new EbToolbox(BuilderType.UserControl);
            //else if (objType.Equals(EbObjectTypes.SurveyControl??))
            //    _toolBox = new EbToolbox(BuilderType.SurveyControl);

            if (_toolBox != null)
            {
                string all = _toolBox.EbObjectTypes + ';' + _toolBox.AllControlls + ';' + _toolBox.AllMetas + ';' + _toolBox.JsonToJsObjectFuncs + ';' + _toolBox.TypeRegister + ';' + _toolBox.EbOnChangeUIfns + ';';
                return File(all.ToUtf8Bytes(), "text/javascript");
            }
            return File(string.Empty.ToUtf8Bytes(), "text/javascript");
        }

        public EbRootObjectResponse CommitEbObject(string _refid, string _json, string _changeLog, string _rel_obj, string _tags, string _apps)
        {
            EbRootObjectResponse _response = new EbRootObjectResponse();
            try
            {
                string _rel_obj_tmp = string.Empty;
                EbObject obj = EbSerializers.Json_Deserialize(_json);
                obj.BeforeSave(ServiceClient, Redis);

                List<string> temp = obj.DiscoverRelatedRefids();
                if (temp?.Count > 0)
                    _rel_obj_tmp = string.Join(",", temp);

                if (obj is EbDataReader)
                {
                    bool ContainsRestricted = CheckRestricted((obj as EbDataReader).Sql);
                    if (ContainsRestricted)
                        _response.Message = "RestrictedStatementinQuerry";
                }
                else if (obj is EbDataWriter)
                {
                    bool ContainsRestricted = CheckDataWriterRestricted((obj as EbDataWriter).Sql);
                    if (ContainsRestricted)
                        _response.Message = "RestrictedStatementinQuerry";
                }
                else if (obj is EbSqlFunction)
                {
                    bool ContainsRestricted = CheckSqlFuncRestricted((obj as EbSqlFunction).Sql);
                    if (ContainsRestricted)
                        _response.Message = "RestrictedStatementinQuerry";
                }
                if (string.IsNullOrEmpty(_refid))
                {
                    UniqueObjectNameCheckResponse uniqnameresp = ServiceClient.Get(new UniqueObjectNameCheckRequest { ObjName = obj.DisplayName });
                    if (uniqnameresp.IsUnique)
                    {
                        EbObject_Create_New_ObjectRequest ds = new EbObject_Create_New_ObjectRequest
                        {
                            Name = obj.Name,
                            Description = obj.Description,
                            Json = EbSerializers.Json_Serialize(obj),
                            Status = ObjectLifeCycleStatus.Dev,
                            Relations = _rel_obj_tmp,
                            IsSave = false,
                            Tags = _tags,
                            Apps = _apps,
                            SourceSolutionId = ViewBag.cid,
                            SourceObjId = "0",
                            SourceVerID = "0",
                            DisplayName = obj.DisplayName,
                            HideInMenu = (obj as IEBRootObject).HideInMenu
                        };
                        EbObject_Create_New_ObjectResponse res = ServiceClient.Post(ds);
                        if (res.Message != string.Empty && res.RefId == null)
                        {
                            _response.Message = res.Message;
                        }
                        _response.Refid = res.RefId;
                    }
                    else
                        _response.Message = "nameisnotunique";
                }
                else
                {
                    EbObject_CommitRequest ds = new EbObject_CommitRequest
                    {
                        Name = obj.Name,
                        Description = obj.Description,
                        Json = EbSerializers.Json_Serialize(obj),
                        Relations = _rel_obj_tmp,
                        RefId = _refid,
                        ChangeLog = _changeLog,
                        Tags = _tags,
                        Apps = _apps,
                        DisplayName = obj.DisplayName,
                        HideInMenu = (obj as IEBRootObject).HideInMenu
                    };
                    EbObject_CommitResponse res = ServiceClient.Post(ds);
                    _response.Refid = res.RefId;
                    _response.Message = res.Message;
                }
            }
            catch (Exception e)
            {
                _response.Message = e.Message;
            }
            return _response;
        }

        public EbRootObjectResponse SaveEbObject(string _refid, string _json, string _rel_obj, string _tags, string _apps)
        {
            EbRootObjectResponse _response = new EbRootObjectResponse();
            try
            {
                string _rel_obj_tmp = string.Empty;
                EbObject obj = EbSerializers.Json_Deserialize(_json);
                obj.BeforeSave(ServiceClient, Redis);

                List<string> temp = obj.DiscoverRelatedRefids();
                if (temp?.Count > 0)
                    _rel_obj_tmp = string.Join(",", temp);

                if (obj is EbDataReader)
                {
                    bool ContainsRestricted = CheckRestricted((obj as EbDataReader).Sql);
                    if (ContainsRestricted)
                        _response.Message = "RestrictedStatementinQuerry";
                }
                else if (obj is EbDataWriter)
                {
                    bool ContainsRestricted = CheckDataWriterRestricted((obj as EbDataWriter).Sql);
                    if (ContainsRestricted)
                        _response.Message = "RestrictedStatementinQuerry";
                }
                else if (obj is EbSqlFunction)
                {
                    bool ContainsRestricted = CheckSqlFuncRestricted((obj as EbSqlFunction).Sql);
                    if (ContainsRestricted)
                        _response.Message = "RestrictedStatementinQuerry";
                }
                if (string.IsNullOrEmpty(_refid))
                {
                    UniqueObjectNameCheckResponse uniqnameresp = ServiceClient.Get(new UniqueObjectNameCheckRequest { ObjName = obj.DisplayName });
                    if (uniqnameresp.IsUnique)
                    {
                        EbObject_Create_New_ObjectRequest ds = new EbObject_Create_New_ObjectRequest
                        {
                            Name = obj.Name,
                            Description = obj.Description,
                            Json = EbSerializers.Json_Serialize(obj),
                            Status = ObjectLifeCycleStatus.Dev,
                            Relations = _rel_obj_tmp,
                            IsSave = true,
                            Tags = _tags,
                            Apps = _apps,
                            SourceSolutionId = ViewBag.cid,
                            SourceObjId = "0",
                            SourceVerID = "0",
                            DisplayName = obj.DisplayName,
                            HideInMenu = (obj as IEBRootObject).HideInMenu
                        };

                        EbObject_Create_New_ObjectResponse res = ServiceClient.Post(ds);
                        _response.Refid = res.RefId;
                        _response.Message = res.Message;
                    }
                    else _response.Message = "nameIsNotUnique";
                }
                else
                {
                    EbObject_SaveRequest ds = new EbObject_SaveRequest
                    {
                        RefId = _refid,
                        Name = obj.Name,
                        Description = obj.Description,
                        Json = EbSerializers.Json_Serialize(obj),
                        Relations = _rel_obj_tmp,
                        Tags = _tags,
                        Apps = _apps,
                        DisplayName = obj.DisplayName,
                        HideInMenu = (obj as IEBRootObject).HideInMenu
                    };

                    EbObject_SaveResponse res = ServiceClient.Post(ds);
                    _response.Refid = res.RefId;
                    _response.Message = res.Message;
                }
            }
            catch (Exception e)
            {
                _response.Message = e.Message;
            }
            return _response;
        }

        public IActionResult GetLifeCycle(int _tabNum, string cur_status, string refid)
        {
            return ViewComponent("ObjectLifeCycle", new { _tabnum = _tabNum, _cur_status = cur_status, _refid = refid });
        }

        public IActionResult VersionHistory(string objid, int tabNum)
        {
            return ViewComponent("VersionHistory", new { objid = objid, tabnum = tabNum });
        }

        [HttpPost]
        public string VersionCodes(string objid, int objtype)
        {
            EbObjectParticularVersionResponse resultlist = ServiceClient.Get(new EbObjectParticularVersionRequest { RefId = objid });
            if (resultlist.Data.Count > 0)
            {
                EbObject dsobj = EbSerializers.Json_Deserialize(resultlist.Data[0].Json);
                dsobj.Status = resultlist.Data[0].Status;
                dsobj.VersionNumber = resultlist.Data[0].VersionNumber;
                dsobj.RefId = objid;
                return EbSerializers.Json_Serialize(dsobj);
            }
            else return string.Empty;
        }

        [HttpPost]
        public Object GetVersionObj(string refid)
        {
            EbObjectParticularVersionResponse resultlist = ServiceClient.Get(new EbObjectParticularVersionRequest { RefId = refid });
            dynamic dsobj = EbSerializers.Json_Deserialize(resultlist.Data[0].Json);
            dsobj.Status = resultlist.Data[0].Status;
            dsobj.VersionNumber = resultlist.Data[0].VersionNumber;
            dsobj.RefId = refid;
            return dsobj;
        }

        [HttpPost]
        public IActionResult CallObjectEditor(string _dsobj, int _tabnum, int Objtype, string _refid, string _ssurl)
        {
            string VCName = string.Empty;
            if (Objtype == (int)EbObjectTypes.WebForm)
                VCName = "FormBuilder";

            else if (Objtype == (int)EbObjectTypes.DataReader || Objtype == (int)EbObjectTypes.DataWriter || Objtype == (int)EbObjectTypes.SqlFunction)
                VCName = "CodeEditor";

            else if (Objtype == (int)EbObjectTypes.Report)
                VCName = "ReportBuilder";

            else if (Objtype == (int)EbObjectTypes.FilterDialog)
                VCName = "FilterDialogBuilder";

            else if (Objtype == (int)EbObjectTypes.UserControl)
                VCName = " UserControl";

            else if (Objtype == (int)EbObjectTypes.EmailBuilder)
                VCName = "Emailbuilder";

            else if (Objtype == (int)EbObjectTypes.TableVisualization)
                VCName = "DVBuilder";

            else if (Objtype == (int)EbObjectTypes.ChartVisualization)
                VCName = "DVChart";

            else if (Objtype == (int)EbObjectTypes.MapView)
                VCName = "MapView";

            else if (Objtype == (int)EbObjectTypes.BotForm)
                VCName = "BotFormBuilder";

            else if (Objtype == (int)EbObjectTypes.SmsBuilder)
                VCName = "Smsbuilder";

            else if (Objtype == (int)EbObjectTypes.Api)
                VCName = "ApiBuilder";
            return ViewComponent(VCName, new { dsobj = _dsobj, tabnum = _tabnum, type = Objtype, refid = _refid, ssurl = _ssurl });

        }

        [HttpPost]
        public IActionResult CallDifferVC(int _tabnum)
        {
            return ViewComponent("ObjectDiffer", new { tabnum = _tabnum });
        }

        [HttpPost]
        public List<string> GetObjectsToDiff(string ver1refid, string ver2refid)
        {
            dynamic first_obj = GetVersionObj(ver1refid);
            dynamic second_obj = GetVersionObj(ver2refid);
            List<string> result = new List<string>();
            string v1 = first_obj.VersionNumber.Replace(".w", "");
            string v2 = second_obj.VersionNumber.Replace(".w", "");
            Version version1 = new Version(v1);
            Version version2 = new Version(v2);
            int res = version1.CompareTo(version2);
            if (res > 0)
            {
                result = GetDiffer(ToJSONusingReflection(second_obj), ToJSONusingReflection(first_obj));
            }
            else
            {
                result = GetDiffer(ToJSONusingReflection(first_obj), ToJSONusingReflection(second_obj));
            }

            return result;
        }

        private const char CURLY_BRACE_OPEN = '{';
        private const char CURLY_BRACE_CLOSE = '}';
        private const char NEW_LINE = '\n';
        private const char TAB = '\t';
        private const char COLON = ':';
        private const char COMMA = ',';
        private const char DOUBLE_QUOTE = '"';
        private const char SPACE = ' ';

        private string ToJSONusingReflection(object o)
        {
            StringBuilder sb = new StringBuilder();
            sb.Append(CURLY_BRACE_OPEN);

            PropertyInfo[] props = o.GetType().GetTypeInfo().GetProperties();
            foreach (PropertyInfo prop in props)
            {
                sb.Append(NEW_LINE);
                sb.Append(TAB);
                sb.Append(prop.Name);
                sb.Append(COLON);
                sb.Append(SPACE);
                if (prop.PropertyType == typeof(int))
                {
                    sb.Append(prop.GetValue(o).ToString());
                    sb.Append(COMMA);
                }
                else if (prop.PropertyType == typeof(string))
                {
                    sb.Append(DOUBLE_QUOTE);
                    object value = prop.GetValue(o, null);
                    if (value != null && !string.IsNullOrEmpty(value.ToString()))
                        sb.Append(prop.GetValue(o).ToString());
                    sb.Append(DOUBLE_QUOTE);
                    sb.Append(COMMA);
                }
            }

            sb.Append(NEW_LINE);
            sb.Append(CURLY_BRACE_CLOSE);
            return sb.ToString();
        }

        public List<string> GetDiffer(string OldText, string NewText)
        {
            List<string> Diff = new List<string>();
            SideBySideDiffBuilder inlineBuilder = new SideBySideDiffBuilder(new Differ());
            SideBySideDiffModel diffmodel = inlineBuilder.BuildDiffModel(OldText, NewText);
            Diff.Add(Differ(diffmodel.OldText));
            Diff.Add(Differ(diffmodel.NewText));
            return Diff;
        }

        private string Differ(DiffPaneModel text)
        {
            const string spaceValue = "&nbsp;";
            const string tabValue = "&#9;";
            string html = "<div class=" + "'diffpane col-md-12'" + "><table cellpadding='0' cellspacing='0' class='diffTable'>";

            foreach (DiffPiece diffLine in text.Lines)
            {
                html += "<tr>";
                html += "<td class='lineNumber'>";
                html += diffLine.Position.HasValue ? diffLine.Position.ToString() : "&nbsp;";
                html += "</td>";
                html += "<td class='line " + diffLine.Type.ToString() + "Line'>";
                html += "<span class='lineText'>";

                if (diffLine.Type == ChangeType.Deleted || diffLine.Type == ChangeType.Inserted || diffLine.Type == ChangeType.Unchanged)
                {
                    html += diffLine.Text.Replace(" ", spaceValue.ToString()).Replace("\t", tabValue.ToString());
                }
                else if (diffLine.Type == ChangeType.Modified)
                {
                    foreach (DiffPiece character in diffLine.SubPieces)
                    {
                        if (character.Type == ChangeType.Imaginary) continue;
                        else
                        {
                            html += "<span class='" + character.Type.ToString() + "Character'>";
                            html += character.Text.Replace(" ", spaceValue.ToString()).Replace("\t", tabValue.ToString());
                            html += "</span>";
                        }
                    }
                }

                html += "</span>";
                html += "</td>";
                html += "</tr>";
            }

            html += "</table></div>";

            return html;
        }

        public ActionResult Diff()
        {
            return View();
        }

        public List<EbObjectWrapper> GetVersions(string objid)
        {
            return ServiceClient.Get(new EbObjectAllVersionsRequest { RefId = objid }).Data;
        }

        public bool ChangeStatus(string _refid, string _changelog, string _status)
        {
            EbObjectChangeStatusResponse res = ServiceClient.Post(new EbObjectChangeStatusRequest { RefId = _refid, Status = (ObjectLifeCycleStatus)Enum.Parse(typeof(ObjectLifeCycleStatus), _status), ChangeLog = _changelog });
            return res.Response;
        }

        public string Create_Major_Version(string _refId, int _type)
        {
            return ServiceClient.Post(new EbObject_Create_Major_VersionRequest { RefId = _refId, EbObjectType = _type, Relations = null }).RefId;
        }

        public string Create_Minor_Version(string _refId, int _type)
        {
            return ServiceClient.Post(new EbObject_Create_Minor_VersionRequest { RefId = _refId, EbObjectType = _type, Relations = null }).RefId;
        }

        public string Create_Patch_Version(string _refId, int _type)
        {
            return ServiceClient.Post(new EbObject_Create_Patch_VersionRequest { RefId = _refId, EbObjectType = _type, Relations = null }).RefId;
        }

        [HttpPost]
        public IActionResult UpdateObjectDashboard(string refid, bool versioning)
        {
            EbObjectWrapper obj = ServiceClient.Get(new EbObjectUpdateDashboardRequest { Refid = refid }).Data;
            EbObjectWrapper w = obj;
            ViewBag.IsPublic = w.IsPublic;
            ViewBag.workingMode = w.WorkingMode;
            return ViewComponent("ObjectDashboard", new { refid, objname = w.Name, w.Status, vernum = w.VersionNumber, workcopies = w.Wc_All, _tags = w.Tags, _apps = w.Apps, _dashbord_tiles = w.Dashboard_Tiles, _versioning = versioning });
        }

        [HttpPost]
        public IActionResult UpdateBuilder(string _refid, int _tabnum, int _ObjType, string _ssurl)
        {
            dynamic versionObj = null;
            if (_ObjType == (int)EbObjectTypes.WebForm)
            {
                versionObj = Redis.Get<EbWebForm>(_refid);
                return ViewComponent("FormBuilder", new { dsobj = EbSerializers.Json_Serialize(versionObj), tabnum = _tabnum, type = _ObjType, refid = _refid, ssurl = _ssurl });
            }
            else if (_ObjType == (int)EbObjectTypes.DataReader || _ObjType == (int)EbObjectTypes.DataWriter || _ObjType == (int)EbObjectTypes.SqlFunction)
            {
                if (_ObjType == (int)EbObjectTypes.DataReader)
                    versionObj = Redis.Get<EbDataReader>(_refid);
                else if (_ObjType == (int)EbObjectTypes.DataWriter)
                    versionObj = Redis.Get<EbDataWriter>(_refid);
                else if (_ObjType == (int)EbObjectTypes.SqlFunction)
                    versionObj = Redis.Get<EbSqlFunction>(_refid);
                return ViewComponent("CodeEditor", new { dsobj = EbSerializers.Json_Serialize(versionObj), tabnum = _tabnum, type = _ObjType, refid = _refid, ssurl = _ssurl });
            }
            else if (_ObjType == (int)EbObjectTypes.Report)
            {
                versionObj = Redis.Get<EbReport>(_refid);
                return ViewComponent("ReportBuilder", new { dsobj = EbSerializers.Json_Serialize(versionObj), tabnum = _tabnum, type = _ObjType, refid = _refid, ssurl = _ssurl });
            }
            else if (_ObjType == (int)EbObjectTypes.FilterDialog)
            {
                versionObj = Redis.Get<EbFilterDialog>(_refid);
                return ViewComponent("FilterDialogBuilder", new { dsobj = EbSerializers.Json_Serialize(versionObj), tabnum = _tabnum, type = _ObjType, refid = _refid, ssurl = _ssurl });
            }
            else if (_ObjType == (int)EbObjectTypes.UserControl)
            {
                versionObj = Redis.Get<EbUserControl>(_refid);
                return ViewComponent("UserControl", new { dsobj = EbSerializers.Json_Serialize(versionObj), tabnum = _tabnum, type = _ObjType, refid = _refid, ssurl = _ssurl });
            }
            else if (_ObjType == (int)EbObjectTypes.EmailBuilder)
            {
                versionObj = Redis.Get<EbEmailTemplate>(_refid);
                return ViewComponent("Emailbuilder", new { dsobj = EbSerializers.Json_Serialize(versionObj), tabnum = _tabnum, type = _ObjType, refid = _refid, ssurl = _ssurl });
            }
            else if (_ObjType == (int)EbObjectTypes.TableVisualization)
            {
                versionObj = Redis.Get<EbTableVisualization>(_refid);
                return ViewComponent("DVBuilder", new { dsobj = EbSerializers.Json_Serialize(versionObj), tabnum = _tabnum, type = _ObjType, refid = _refid, ssurl = _ssurl });
            }
            else if (_ObjType == (int)EbObjectTypes.ChartVisualization)
            {
                versionObj = Redis.Get<EbChartVisualization>(_refid);
                return ViewComponent("DVChart", new { googlekey = ViewBag.al_arz_map_key, dsobj = EbSerializers.Json_Serialize(versionObj), tabnum = _tabnum, type = _ObjType, refid = _refid, ssurl = _ssurl });
            }
            else if (_ObjType == (int)EbObjectTypes.MapView)
            {
                versionObj = Redis.Get<EbGoogleMap>(_refid);
                return ViewComponent("MapView", new { googlekey = ViewBag.al_arz_map_key, dsobj = EbSerializers.Json_Serialize(versionObj), tabnum = _tabnum, type = _ObjType, refid = _refid, ssurl = _ssurl });
            }
            else if (_ObjType == (int)EbObjectTypes.BotForm)
            {
                versionObj = Redis.Get<EbBotForm>(_refid);
                return ViewComponent("BotFormBuilder", new { dsobj = EbSerializers.Json_Serialize(versionObj), tabnum = _tabnum, type = _ObjType, refid = _refid, ssurl = _ssurl });
            }
            else if (_ObjType == (int)EbObjectTypes.SmsBuilder)
            {
                versionObj = Redis.Get<EbSmsTemplate>(_refid);
                return ViewComponent("Smsbuilder", new { dsobj = EbSerializers.Json_Serialize(versionObj), tabnum = _tabnum, type = _ObjType, refid = _refid, ssurl = _ssurl });
            }
            else if (_ObjType == (int)EbObjectTypes.Api)
            {
                versionObj = Redis.Get<EbApi>(_refid);
                return ViewComponent("ApiBuilder", new { dsobj = EbSerializers.Json_Serialize(versionObj), tabnum = _tabnum, type = _ObjType, refid = _refid, ssurl = _ssurl });
            }
            else if (_ObjType == (int)EbObjectTypes.MobilePage)
            {
                versionObj = Redis.Get<EbMobilePage>(_refid);
                return ViewComponent("MobilePage", new { dsobj = EbSerializers.Json_Serialize(versionObj), tabnum = _tabnum, type = _ObjType, refid = _refid, ssurl = _ssurl });
            }
            return View();
        }

        public bool CheckRestricted(string _sql)
        {
            return
                Regex.IsMatch(_sql.ToLower(), @"\b(create\s|update\s|delete\s|insert\s|alter\s|truncate\s|drop\s)");
        }

        public bool CheckDataWriterRestricted(string sql)
        {
            return Regex.IsMatch(sql.ToLower(), @"\b(create\s|delete\s|alter\s|truncate\s|drop\s)");
        }

        public bool CheckSqlFuncRestricted(string sql)
        {
            return Regex.IsMatch(sql.ToLower(), @"\b(delete\s|alter\s|truncate\s|drop\s)");
        }

        public IActionResult GetProfilerView(string refid)
        {
            return ViewComponent("SqlProfiler", new { refid = refid });
        }

        public bool DeleteObject(int objid)
        {
            DeleteEbObjectResponse res = ServiceClient.Post(new DeleteEbObjectRequest { ObjId = objid });
            if (res.RowsDeleted > 0)
                return true;
            return false;
        }


        public CloneEbObjectResponse CloneObject(string refid, string apps)
        {
            CloneEbObjectResponse res = ServiceClient.Post(new CloneEbObjectRequest { RefId = refid, Apps = (apps == null) ? "" : apps });
            if (res.ClonedRefid != string.Empty && res.Status)
            {
                res.ObjId = Convert.ToInt32(res.ClonedRefid.Split("-")[3]);
                res.ObjectType = Convert.ToInt32(res.ClonedRefid.Split("-")[2]);
            }
            return res;
        }

        public bool ChangeAccess(int objid, int status)
        {
            ChangeObjectAccessResponse response = this.ServiceClient.Post(new ChangeObjectAccessRequest { ObjId = objid, Status = status });
            return response.Status;
        }

        [HttpPost]
        public string EnableLogging(bool ProfilerValue, int objid)
        {
            EnableLogResponse response = ServiceClient.Post(new EnableLogRequest { Islog = ProfilerValue, ObjId = objid });
            string msg = "";
            if (response.RowsDeleted > 0)
            {
                if (ProfilerValue)
                    msg = "Profiling Enabled";
                else
                    msg = "Profiling Disabled";
            }
            else
            {
                msg = "Sorry, Please Try Again";
            }
            return msg;
        }

        public EbExecutionLogs GetLogdetails(int idx)
        {
            GetLogdetailsResponse logdt = ServiceClient.Get(new GetLogdetailsRequest { Index = idx });
            return logdt.logdetails;
        }

        public RowColletion GetChartDetails(string refid)
        {
            GetChartDetailsResponse chartdt = ServiceClient.Get(new GetChartDetailsRequest { Refid = refid });
            return chartdt.data;
        }

        public RowColletion GetChart2Details(string refid)
        {
            GetChart2DetailsResponse chartdt = ServiceClient.Get(new GetChart2DetailsRequest { Refid = refid });
            return chartdt.data;
        }

        public ProfilerQueryResponse getdata(ProfilerQueryDataRequest request)
        {
            ProfilerQueryResponse resultlist1 = new ProfilerQueryResponse();
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
    }
    public class EbRootObjectResponse
    {
        public string Refid { get; set; }

        public string Message { get; set; }
    }
}
