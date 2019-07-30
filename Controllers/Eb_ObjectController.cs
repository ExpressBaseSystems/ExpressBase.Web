using System;
using System.Collections.Generic;
using System.Threading.Tasks;
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
using ExpressBase.Objects.EmailRelated;
using ExpressBase.Common.Structures;
using ExpressBase.Common.JsonConverters;
using ExpressBase.Web.BaseControllers;
using System.Text.RegularExpressions;
using ExpressBase.Web.Filters;
using ExpressBase.Objects.Objects.SmsRelated;
using ExpressBase.Common.Extensions;
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
            ViewBag.al_arz_map_key = Environment.GetEnvironmentVariable(EnvironmentConstants.AL_GOOGLE_MAP_KEY);
            dynamic dsobj = null;
            Context2Js _c2js = new Context2Js();
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            ViewBag.currentUser = LoggedInUser;
            EbObjectType type = (EbObjectType)(objtype);
            HttpContext.Items["ObjectType"] = type;
            ViewBag.mode = buildermode;

            Eb_Solution soln = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", ViewBag.cid));
            if (soln == null)
            {
                this.ServiceClient.Post(new UpdateSolutionRequest { SolnId = ViewBag.cid, UserId = ViewBag.UId });
                soln = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", ViewBag.cid));
            }
            ViewBag.versioning = soln.IsVersioningEnabled;

            if (objid != "null")
            {
                ViewBag.Obj_id = objid;
                EbObjectExploreObjectResponse resultlist = ServiceClient.Get(new EbObjectExploreObjectRequest { Id = Convert.ToInt32(objid) });
                List<EbObjectWrapper> objectlist = resultlist.Data;
                if (objectlist.Count > 0)
                    foreach (EbObjectWrapper element in objectlist)
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

                        if (String.IsNullOrEmpty(element.Json_wc) && !String.IsNullOrEmpty(element.Json_lc))
                        {
                            ViewBag.ReadOnly = true;
                            dsobj = EbSerializers.Json_Deserialize(element.Json_lc);
                            ViewBag.dsObj = dsobj;
                            dsobj.Status = element.Status;
                            dsobj.RefId = element.RefId;
                            dsobj.VersionNumber = element.VersionNumber;
                            dsobj.DisplayName = element.DisplayName;
                            ViewBag.Workingcopy = element.Wc_All;
                        }
                        else if (String.IsNullOrEmpty(element.Json_lc) && !String.IsNullOrEmpty(element.Json_wc))
                        {
                            ViewBag.ReadOnly = false;
                            dsobj = EbSerializers.Json_Deserialize(element.Json_wc);
                            ViewBag.dsObj = dsobj;
                            dsobj.Status = element.Status;
                            dsobj.RefId = element.RefId;
                            dsobj.VersionNumber = element.VersionNumber;
                            dsobj.DisplayName = element.DisplayName;
                            ViewBag.Workingcopy = element.Wc_All;
                        }
                    }
            }
            else
            {
                ViewBag.IsNew = "true";
                ViewBag.Refid = string.Empty;
                ViewBag.ObjectName = "*Untitled";
                ViewBag.NameObj4Title = EbSerializers.Json_Serialize(new NameObj (){ Value = "*Untitled" });//regional languages not support in ViewBag
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


            }
            if (type.Equals(EbObjectTypes.DataReader))
            {
                Type[] typeArray = typeof(EbDataSourceMain).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.DataReader, typeof(EbDataSourceMain));
                //_jsResult = CSharpToJs.GenerateJs<EbDatasourceMain>(BuilderType.DataSource, typeArray);
                if (dsobj != null)
                {
                    dsobj.AfterRedisGet(Redis, ServiceClient);
                    ViewBag.dsObj = dsobj;
                }
            }
            else if (type.Equals(EbObjectTypes.DataWriter))
            {
                Type[] typeArray = typeof(EbDataSourceMain).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.DataWriter, typeof(EbDataSourceMain));
                //_jsResult = CSharpToJs.GenerateJs<EbDatasourceMain>(BuilderType.DataSource, typeArray);
                if (dsobj != null)
                {
                    dsobj.AfterRedisGet(Redis, ServiceClient);
                    ViewBag.dsObj = dsobj;
                }
            }
            else if (type.Equals(EbObjectTypes.SqlFunction))
            {
                Type[] typeArray = typeof(EbDataSourceMain).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.SqlFunctions, typeof(EbDataSourceMain));
                if (dsobj != null)
                {
                    dsobj.AfterRedisGet(Redis, ServiceClient);
                    ViewBag.dsObj = dsobj;
                }
            }
            else if (type.Equals(EbObjectTypes.TableVisualization) || type.Equals(EbObjectTypes.ChartVisualization) || type.Equals(EbObjectTypes.GoogleMap))
            {
                Type[] typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.DVBuilder, typeof(EbDataVisualizationObject));
                if (dsobj != null)
                {
                    //---------------------temp fix to copy old prop value (string) to new prop value (EbScript)-------------------------------
                    foreach (DVBaseColumn c in (dsobj as EbDataVisualization).Columns)
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

                    dsobj.AfterRedisGet(Redis, ServiceClient);
                    ViewBag.dsObj = dsobj;
                }
            }
            else if (type.Equals(EbObjectTypes.Report))
            {
                Type[] typeArray = typeof(EbReportObject).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.Report, typeof(EbReportObject));
                if (dsobj != null)
                {
                    //-------------------------temp fix to copy old prop value (string) to new prop value (EbScript)----------------------------
                    foreach (EbReportDetail dt in (dsobj as EbReport).Detail)
                    {
                        foreach (EbReportField field in dt.Fields)
                        {
                            if (field is EbDataField)
                            {
                                var _new = (field as EbDataField).AppearExpression;
                                var old = (field as EbDataField).AppearanceExpression;
                                if (_new == null)
                                {
                                    if (!string.IsNullOrEmpty(old))
                                        _new = new EbScript { Code = old, Lang = ScriptingLanguage.CSharp };
                                    else
                                        _new = new EbScript();
                                    (field as EbDataField).AppearExpression = _new;
                                }
                                if (field is EbCalcField)
                                {
                                    var __new = (field as EbCalcField).ValExpression;
                                    var _old = (field as EbCalcField).ValueExpression;
                                    if (__new == null)
                                    {
                                        if (!string.IsNullOrEmpty(_old))
                                            __new = new EbScript { Code = _old, Lang = ScriptingLanguage.CSharp };
                                        else
                                            __new = new EbScript();
                                        (field as EbCalcField).ValExpression = __new;
                                    }
                                }
                            }
                        }
                    }
                    //----------------------------------------------------------------------------------------------------------------------------

                    dsobj.AfterRedisGet(Redis, ServiceClient);
                    ViewBag.dsObj = dsobj;
                }
            }
            else if (type.Equals(EbObjectTypes.EmailBuilder))
            {
                Type[] typeArray = typeof(EbEmailTemplateBase).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.EmailBuilder, typeof(EbEmailTemplateBase));
                if (dsobj != null)
                {
                    dsobj.AfterRedisGet(Redis);
                    ViewBag.dsObj = dsobj;
                }
            }
            else if (type.Equals(EbObjectTypes.FilterDialog))
            {
                Type[] typeArray = typeof(EbFilterDialog).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.FilterDialog, typeof(EbFilterDialog));
                if (dsobj != null)
                {
                    dsobj.AfterRedisGet(Redis);
                    ViewBag.dsObj = dsobj;
                }
            }
            else if (type.Equals(EbObjectTypes.SmsBuilder))
            {
                Type[] typeArray = typeof(EbSmsTemplateBase).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.SmsBuilder, typeof(EbSmsTemplateBase));
                if (dsobj != null)
                {
                    dsobj.AfterRedisGet(Redis);
                    ViewBag.dsObj = dsobj;
                }
            }
            else if (type.Equals(EbObjectTypes.Api))
            {
                Type[] typeArray = typeof(EbApiWrapper).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.ApiBuilder, typeof(EbApiWrapper));
                if (dsobj != null)
                {
                    dsobj.AfterRedisGet(Redis);
                    ViewBag.dsObj = dsobj;
                }
            }

            if (type.Equals(EbObjectTypes.UserControl) || type.Equals(EbObjectTypes.WebForm) || type.Equals(EbObjectTypes.FilterDialog))
            {
                EbObjAllVerWithoutCircularRefResp result = this.ServiceClient.Get<EbObjAllVerWithoutCircularRefResp>(new EbObjAllVerWithoutCircularRefRqst { EbObjectRefId = ViewBag.Refid, EbObjType = EbObjectTypes.UserControl.IntCode });
                string UserControlsHtml = string.Empty;

                foreach (KeyValuePair<string, List<EbObjectWrapper>> _object in result.Data)
                {
                    EbObjectWrapper _objverL = null;
                    string versionHtml = "<select style = 'float: right; border: none;'>";
                    foreach (EbObjectWrapper _objver in _object.Value)
                    {
                        versionHtml += "<option refid='" + _objver.RefId + "'>" + _objver.VersionNumber + "</option>";
                        _objverL = _objver;
                    }
                    versionHtml += "</select>";
                    UserControlsHtml += string.Concat("<div eb-type='UserControl' class='tool'>", _objverL.DisplayName, versionHtml, "</div>");
                }

                ViewBag.UserControlHtml = string.Concat(HtmlConstants.TOOL_HTML.Replace("@id@", "toolb_user_ctrls").Replace("@label@", "User Controls"), UserControlsHtml, "</div>");

                if (dsobj is EbWebForm)
                {
                    EbWebForm _dsobj = dsobj as EbWebForm;
                    _dsobj.AfterRedisGet(Redis, this.ServiceClient);
                    ViewBag.dsObj = _dsobj;
                }
                else if (dsobj is EbUserControl)
                {
                    EbUserControl _dsobj = dsobj as EbUserControl;
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

        public EbRootObjectResponse CommitEbObject(string _refid, string _json, string _changeLog, string _rel_obj, string _tags, string _apps)
        {
            EbRootObjectResponse _response = new EbRootObjectResponse();
            try
            {
                EbObject obj = EbSerializers.Json_Deserialize(_json);
                obj.BeforeSave();
                string _rel_obj_tmp = obj.DiscoverRelatedRefids();
                if (_rel_obj_tmp.Length > 0)
                    _rel_obj_tmp = _rel_obj_tmp.Substring(0, _rel_obj_tmp.Length - 1);//removing excess comma
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
                    UniqueObjectNameCheckResponse uniqnameresp = ServiceClient.Get(new UniqueObjectNameCheckRequest { ObjName = obj.Name });
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
                            DisplayName = obj.DisplayName
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
                        DisplayName = obj.DisplayName
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
                EbObject obj = EbSerializers.Json_Deserialize(_json);
                obj.BeforeSave();
                string _rel_obj_tmp = obj.DiscoverRelatedRefids();
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
                    UniqueObjectNameCheckResponse uniqnameresp = ServiceClient.Get(new UniqueObjectNameCheckRequest { ObjName = obj.Name });
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
                            DisplayName = obj.DisplayName
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
                        DisplayName = obj.DisplayName
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
            if (Objtype == (int)EbObjectTypes.DataReader)
                VCName = "CodeEditor";
            else if (Objtype == (int)EbObjectTypes.TableVisualization)
                VCName = "DVBuilder";
            else if (Objtype == (int)EbObjectTypes.WebForm)
                VCName = "FormBuilder";
            else if (Objtype == (int)EbObjectTypes.Report)
                VCName = "ReportBuilder";
            else if (Objtype == (int)EbObjectTypes.EmailBuilder)
                VCName = "Emailbuilder";
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
            List<EbObjectWrapper> objlist = ServiceClient.Get(new EbObjectUpdateDashboardRequest { Refid = refid }).Data;
            EbObjectWrapper w = objlist[0];
            return ViewComponent("ObjectDashboard", new { refid, objname = w.Name, w.Status, vernum = w.VersionNumber, workcopies = w.Wc_All, _tags = w.Tags, _apps = w.Apps, _dashbord_tiles = w.Dashboard_Tiles, _versioning = versioning });
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
            DeleteObjectResponse res = ServiceClient.Post(new DeleteEbObjectRequest { ObjId = objid });
            if (res.RowsDeleted > 0)
                return true;
            return false;
        }

        [HttpPost]
        public string EnableLogging(bool ProfilerValue, int objid)
        {
            var response = ServiceClient.Post(new EnableLogRequest { Islog = ProfilerValue, ObjId = objid });
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
