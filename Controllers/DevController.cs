using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Web.Filters;
using ServiceStack;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects;
using ExpressBase.Common;
using ServiceStack.Text;
using Newtonsoft.Json;
using ServiceStack.Redis;
using ExpressBase.Common.Objects;
using Microsoft.AspNetCore.Routing;
using System.Reflection;
using ExpressBase.Common.Structures;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Common.Data;
using ExpressBase.Objects.Helpers;
using ExpressBase.Common.Constants;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Application;
using ExpressBase.Objects.Objects.DVRelated;

namespace ExpressBase.Web.Controllers
{
    public class DevController : EbBaseIntCommonController
    {
        public const string Msg = "Msg";

        public DevController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [HttpGet("MyApplications")]
        public IActionResult DevDashboard()
        {
            GetAllApplicationResponse apps = this.ServiceClient.Get(new GetAllApplicationRequest());
            ViewBag.apps = apps.Data;
            ViewBag.Msg = TempData[Msg];
            ViewBag.Title = "Developer Home";
            ViewBag.JavaScriptFunction = TempData["ResetStore"] ?? "";
            TempData.Remove("ResetStore");
            return View();
        }

        [EbBreadCrumbFilter("Applications/", "AppName", new string[] { "/MyApplications" })]
        [HttpGet]
        public IActionResult AppDashBoard(int Id, EbApplicationTypes Type)
        {
            Dictionary<int, string> _dict = new Dictionary<int, string>();

            foreach (EbObjectType objectType in EbObjectTypes.Enumerator)
            {
                if (objectType.IsAvailableIn(Type))
                {
                    _dict.Add(objectType.IntCode, objectType.Name);
                }
            }
            GetObjectsByAppIdResponse _objects = this.ServiceClient.Get(new GetObjectsByAppIdRequest { Id = Id, AppType = Type });
            ViewBag.ObjectCollection = _objects.Data;
            ViewBag.AppInfo = _objects.AppInfo;

            if (Type == EbApplicationTypes.Web)
                ViewBag.AppSettings = JsonConvert.DeserializeObject<EbWebSettings>(_objects.AppInfo.AppSettings) ?? new EbWebSettings();
            else if (Type == EbApplicationTypes.Mobile)
                ViewBag.AppSettings = JsonConvert.DeserializeObject<EbMobileSettings>(_objects.AppInfo.AppSettings) ?? new EbMobileSettings();
            else if (Type == EbApplicationTypes.Bot)
            {
                EbBotSettings settings = JsonConvert.DeserializeObject<EbBotSettings>(_objects.AppInfo.AppSettings);
                if (settings != null)
                {
                    //////change count if any css Constant is added or removed
                    if (settings.CssContent == null || settings.CssContent.Count < 11)
                    {

                        settings.CssContent = CssContent(settings.CssContent);
                    }

                }
                ViewBag.AppSettings = settings ?? new EbBotSettings() { };
                ViewBag.EbfontLst = EbFont.FontFamilies;
            }

            this.HttpContext.Items["AppName"] = _objects.AppInfo.Name;
            ViewBag.Title = _objects.AppInfo.Name;
            ViewBag.ObjectsCount = _objects.ObjectsCount;
            return View();
        }

        public IActionResult ExportPackage()
        {
            Type[] typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DVBuilder, typeof(EbDataVisualizationObject));
            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;
            ViewBag.Visualization = GetAppsTree();

            return View("GetTree");
        }

        public string GetAppsTree()
        {
            string typestring = @"(0,'WebForm'),(2,'DataReader'),(3,'Report'),(4,'DataWriter'),(5,'SqlFunction'),(7,'JavascriptFunction'),(12,'FilterDialog'),(13,'MobilePage'),
            (14,'UserControl'),(15,'EmailBuilder'),(16,'TableVisualization'),(17,'ChartVisualization'),(18,'BotForm'),(19,'SmsBuilder'),(20,'Api'),(21,'MapView'),(22,'DashBoard'),
            (23,'KanBan'),(24,'CalendarView'),(25,'CsharpFunction'),(26,'SqlJob')";//(1, 'foo'), (2, 'bar'), (3, 'fooBar')

            string subquery = string.Format("(SELECT * FROM (values {0}) AS EOT(type_id, type_name)) AS EOT", typestring);
            string query = string.Format(@"SELECT 
	                             EO.id, EOT.type_name, EO.obj_name,EO.display_name,EO.obj_desc, EO2A.obj_id, EO2A.app_Id,app.applicationname
                            FROM
	                             eb_objects_ver EOV,eb_objects EO, 
	                             {0},
	                             eb_objects2application EO2A,
	                             eb_applications app
                            WHERE 
	                            EO.id = EO2A.obj_id AND
	                            app.id = EO2A.app_id AND
	                            EO.id = EOV.eb_objects_id AND
                                EO.obj_type = EOT.type_id AND
                                COALESCE(EO.eb_del, 'F') = 'F' AND
                                COALESCE(EOV.working_mode, 'F') <> 'T' AND
                                COALESCE(EO2A.eb_del, 'F') = 'F';", subquery);
                                        ;
            string[] arrayy = new string[] { "id", "type_name", "obj_name", "display_name", "obj_desc", "obj_id", "app_Id", "applicationname" };
            DVColumnCollection DVColumnCollection = GetColumnsForAppsTree(arrayy);
            EbDataVisualization Visualization = new EbTableVisualization { Sql = query, Columns = DVColumnCollection, AutoGen = false, IsPaging = false };
            List<DVBaseColumn> RowGroupingColumns = new List<DVBaseColumn> { Visualization.Columns.Get("applicationname"), Visualization.Columns.Get("type_name") };
            (Visualization as EbTableVisualization).RowGroupCollection.Add(new MultipleLevelRowGroup { RowGrouping = RowGroupingColumns, Name = "multilevel" });
            (Visualization as EbTableVisualization).CurrentRowGroup = (Visualization as EbTableVisualization).RowGroupCollection[0];
            return EbSerializers.Json_Serialize(Visualization);
        }

        public DVColumnCollection GetColumnsForAppsTree(string[] strArray)
        {
            var Columns = new DVColumnCollection();
            try
            {
                foreach (string str in strArray)
                {
                    DVBaseColumn _col = null;
                    if (str == "id")
                        _col = new DVNumericColumn { Data = 0, Name = str, sTitle = str, Type = EbDbTypes.Int32, bVisible = false };
                    if (str == "type_name")
                        _col = new DVStringColumn { Data = 1, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    if (str == "obj_name")
                        _col = new DVStringColumn { Data = 2, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = false };
                    if (str == "display_name")
                        _col = new DVStringColumn { Data = 3, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    if (str == "obj_desc")
                        _col = new DVStringColumn { Data = 4, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    if (str == "obj_id")
                        _col = new DVNumericColumn { Data = 5, Name = str, sTitle = str, Type = EbDbTypes.Int32, bVisible = false };
                    if (str == "app_Id")
                        _col = new DVNumericColumn { Data = 6, Name = str, sTitle = str, Type = EbDbTypes.Int32, bVisible = false };
                    if (str == "applicationname")
                        _col = new DVStringColumn { Data = 7, Name = str, sTitle = "App Name", Type = EbDbTypes.String, bVisible = true };
                    _col.Name = str;
                    _col.RenderType = _col.Type;
                    _col.ClassName = "tdheight";
                    _col.Font = null;
                    _col.Align = Align.Left;
                    Columns.Add(_col);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("no coloms" + e.StackTrace);
            }

            return Columns;
        }

        public Dictionary<string, string> CssContent(Dictionary<string, string> btCss)
        {
            //public Dictionary<string, Dictionary<string, string>> CssContent()
            var CssDict = new Dictionary<string, string>();
            var Cssconst = new Dictionary<string, string>();
            Cssconst = new EbBotSettings().CssContent;
            int i = 0;
            List<string> CssList = new List<string>();
            List<string> NameArr = new List<string>();

            //////if any changes change in bote too

            foreach (var item in Cssconst)
            {
                NameArr.Add(item.Key);
                CssList.Add(item.Value);
            }

            if (btCss.Count == 0)
            {
                foreach (string CssConst in CssList)
                {
                    CssDict.Add(NameArr[i], CssConst);
                    i++;
                }
            }
            else if (btCss.Count < NameArr.Count)
            {
                for (int j = 0; j < NameArr.Count; j++)
                {
                    if (btCss.ContainsKey(NameArr[j]))
                    {
                        CssDict.Add(NameArr[j], btCss[NameArr[j]]);
                    }
                    else
                    {
                        CssDict.Add(NameArr[j], CssList[j]);
                    }
                }

            }
            return CssDict;
        }
        public string ResetCssContent(string cssConst)
        {
            if (cssConst.Equals("BOT_HEADER_PART"))
                return BotConstants.BOT_HEADER_PART;
            if (cssConst.Equals("BOT_HEADER_ICON_CONT"))
                return BotConstants.BOT_HEADER_ICON_CONT;
            if (cssConst.Equals("BOT_HEADER_IMAGE"))
                return BotConstants.BOT_HEADER_IMAGE;
            if (cssConst.Equals("BOT_APP_NAME"))
                return BotConstants.BOT_APP_NAME;
            if (cssConst.Equals("BOT_HEADERSUBTEXT"))
                return BotConstants.BOT_HEADERSUBTEXT;
            if (cssConst.Equals("BOT_IFRAME_CSS"))
                return BotConstants.BOT_IFRAME_CSS;
            if (cssConst.Equals("BOT_CHAT_BUTTON"))
                return BotConstants.BOT_CHAT_BUTTON;
            if (cssConst.Equals("BOT_IMAGE_CONT"))
                return BotConstants.BOT_IMAGE_CONT;
            if (cssConst.Equals("BOT_BUTTON_IMAGE"))
                return BotConstants.BOT_BUTTON_IMAGE;
            if (cssConst.Equals("BOT_CLOSE_BUTTON"))
                return BotConstants.BOT_CLOSE_BUTTON;
            if (cssConst.Equals("BOT_MAXIMIZE_BUTTON"))
                return BotConstants.BOT_MAXIMIZE_BUTTON;
            else
                return "";
        }

        [HttpPost]
        public UpdateAppSettingsResponse UpdateAppSettingsMob(string settings, int appid, EbApplicationTypes type)
        {
            UpdateAppSettingsResponse resp = null;
            try
            {
                resp = this.ServiceClient.Post(new UpdateAppSettingsRequest
                {
                    Settings = settings,
                    AppId = appid,
                    AppType = type
                });
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
            return resp;
        }

        [HttpPost]
        public GetBotDetailsResponse GetBotDetails(int _appId)
        {
            GetBotDetailsResponse Botdtls = ServiceClient.Get<GetBotDetailsResponse>(new BotDetailsRequest { AppId = _appId });
            return Botdtls;
        }


        [HttpGet]
        public IActionResult Eb_formBuilder()
        {
            ViewBag.ObjType = this.HttpContext.Request.Query["objtype"];
            return View();
        }

        public IActionResult Eb_ChatFormBuilder()
        {
            ViewBag.ObjType = this.HttpContext.Request.Query["objtype"];
            return View();
        }

        [HttpPost]
        public IActionResult Eb_formBuilder(int i, int objtype)
        {
            //var req = this.HttpContext.Request.Form;
            //ViewBag.Objtype = req["objtype"];
            //ViewBag.Objid = req["objid"];

            //BuilderType _BuilderType = (BuilderType)Convert.ToInt32(ViewBag.Objtype);

            //EbObjectWrapper FormObj = GetFormObj(req["objid"].ToString(), Convert.ToInt32(req["objtype"]));
            //ViewBag.Json = FormObj.Json;
            //ViewBag.Name = FormObj.Name;
            //ViewBag.html = GetHtml2Render(_BuilderType, ViewBag.Objid);
            //return View();

            //================

            ViewBag.Header = "Edit WebForm";
            var req = this.HttpContext.Request.Form;
            int obj_id = Convert.ToInt32(req["objid"]);

            ViewBag.Obj_id = obj_id;
            var resultlist = this.ServiceClient.Get<EbObjectExploreObjectResponse>(new EbObjectExploreObjectRequest { Id = obj_id });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
                List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
                ViewBag.LifeCycle = lifeCycle;
                ViewBag.IsNew = "false";
                ViewBag.ObjType = objtype;
                ViewBag.ObjectName = element.Name;
                ViewBag.ObjectDesc = element.Description;
                ViewBag.Status = element.Status;
                ViewBag.VersionNumber = element.VersionNumber;
                ViewBag.Icon = "fa fa-database";
                ViewBag.Refid = element.RefId;
                ViewBag.Majorv = element.Dashboard_Tiles.MajorVersionNumber;
                ViewBag.Minorv = element.Dashboard_Tiles.MinorVersionNumber;
                ViewBag.Patchv = element.Dashboard_Tiles.PatchVersionNumber;

                if (String.IsNullOrEmpty(element.Json_wc) && !String.IsNullOrEmpty(element.Json_lc))
                {
                    EbWebForm dsobj = EbSerializers.Json_Deserialize<EbWebForm>(element.Json_lc);
                    ViewBag.Name = dsobj.Name;
                    ViewBag.Json = element.Json_lc;
                    ViewBag.html = dsobj.GetHtml();
                }
                else
                {
                    EbWebForm dsobj = EbSerializers.Json_Deserialize<EbWebForm>(element.Json_wc);
                    ViewBag.Name = dsobj.Name;
                    ViewBag.Json = element.Json_wc;
                    ViewBag.html = dsobj.GetHtml();
                }
            }

            return View();
        }

        public string CommitFormBuilder()
        {
            var req = this.HttpContext.Request.Form;
            string refid;
            if (string.IsNullOrEmpty(req["id"]))
            {
                var ds = new EbObject_Create_New_ObjectRequest();
                ds.EbObjectType = Convert.ToInt32(req["obj_type"]);
                ds.Name = req["name"];
                ds.Description = req["description"];
                ds.Json = req["filterdialogjson"];
                //if (ds.EbObjectType == 0)
                //   ds.EbObject = EbSerializers.Json_Deserialize<EbForm>(req["filterdialogjson"]);
                //else if (ds.EbObjectType == 12)
                //{
                //    ds.EbObject = EbSerializers.Json_Deserialize<EbFilterDialog>(req["filterdialogjson"]);
                //    (ds.EbObject as EbFilterDialog).EbObjectType = EbObjectType.WebForm;
                //}

                //(ds.EbObject as EbFilterDialog).EbObjectType = EbObjectType.FilterDialog;
                ds.Status = ObjectLifeCycleStatus.Dev;
                ds.Relations = "";
                ds.IsSave = false;

                var res = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
                refid = res.RefId;

            }
            else
            {
                var ds = new EbObject_CommitRequest();
                ds.EbObjectType = Convert.ToInt32(req["obj_type"]);
                ds.Name = req["name"];
                ds.Description = req["description"];
                ds.Json = req["filterdialogjson"];
                ds.Relations = "";
                ds.RefId = req["id"];
                ds.ChangeLog = "";
                var res = ServiceClient.Post<EbObject_CommitResponse>(ds);
                refid = res.RefId;
            }

            return refid;
        }

        public string SaveFormBuilder()
        {
            var req = this.HttpContext.Request.Form;
            string refid;
            if (string.IsNullOrEmpty(req["id"]))
            {
                var ds = new EbObject_Create_New_ObjectRequest();
                ds.EbObjectType = Convert.ToInt32(req["obj_type"]);
                ds.Name = req["name"];
                ds.Description = req["description"];
                ds.Json = req["filterdialogjson"];
                ds.Status = ObjectLifeCycleStatus.Dev;
                ds.Relations = "";
                ds.IsSave = true;

                var res = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
                refid = res.RefId;
            }
            else
            {

                var ds = new EbObject_SaveRequest();
                ds.RefId = req["Id"];
                ds.Name = req["Name"];
                ds.Description = req["Description"];
                ds.EbObjectType = Convert.ToInt32(req["obj_type"]);
                ds.Json = req["filterdialogjson"];
                ds.Relations = "";
                ViewBag.IsNew = "false";
                var res = this.ServiceClient.Post<EbObject_SaveResponse>(ds);
                refid = res.RefId;
            }
            return refid;
        }
        //Jith Builder related
        private string GetHtml2Render(BuilderType type, string objid)
        {
            IServiceClient client = this.ServiceClient;
            var resultlist = client.Get<EbObjectLatestCommitedResponse>(new EbObjectLatestCommitedRequest { RefId = objid });
            var rlist = resultlist.Data[0];
            string _html = string.Empty;

            EbControlContainer _form = null;
            if (type == BuilderType.FilterDialog)
                _form = EbSerializers.Json_Deserialize<EbFilterDialog>(rlist.Json) as EbControlContainer;
            else if (type == BuilderType.WebForm)
                _form = EbSerializers.Json_Deserialize<EbWebForm>(rlist.Json) as EbControlContainer;


            if (_form != null)
                _html += _form.GetHtml();

            return _html;
        }

        public EbObjectWrapper GetFormObj(string objId, int objType)
        {
            IServiceClient client = this.ServiceClient;
            var resultlist = client.Get<EbObjectLatestCommitedResponse>(new EbObjectLatestCommitedRequest { RefId = objId });
            var rlist = resultlist.Data[0];
            return rlist;
        }


        public IActionResult EbObjectList(EbObjectType type)
        {
            ViewBag.EbObjectType = (int)type;

            IServiceClient client = this.ServiceClient;

            var resultlist = client.Get<EbObjectListResponse>(new EbObjectListRequest { EbObjectType = (int)type });
            var rlist = resultlist.Data;

            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();

            foreach (var element in rlist)
            {
                if (element.EbObjectType.Equals(type))
                    ObjList[element.Id] = element;
            }

            ViewBag.Objlist = ObjList;

            if (ViewBag.isAjaxCall)
                return PartialView();
            else
                return View();
        }

        public string GetObjectList(EbObjectType type)
        {
            IServiceClient client = this.ServiceClient;

            var resultlist = client.Get<EbObjectListResponse>(new EbObjectListRequest { EbObjectType = (int)type });
            var rlist = resultlist.Data;

            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();
            var html = string.Empty;
            foreach (var element in rlist)
            {
                html += @"<a href='../Eb_Object/Index?objid=" + element.Id + @"&objtype=" + (int)type + @"'>
                <div class='col-md-6 objitems' name='objBox'>
                    <div class='col-md-1 obj-icon'>
                        <div class='obj-ic-cir'>
                            <i class='fa fa-file-text' aria-hidden='true'></i>
                        </div>
                    </div>
                    <div class='col-md-10'>
                        <h4 name='head4' style='color:black;'>" + element.Name + @"</h4>
                        <p class='text-justify'>" + element.Description + @"</p>
                        <a id='labels'>
                            <span name='Version' class='label label-default'>v " + element.VersionNumber + @"</span>
                            <span name='Application' class='label objbox-label'>" + type + @"</span>
                        </a>
                    </div>
                    <div class='col-md-1 objbox-footer'>
                        <input type='button' class='btn fa-input fa-lg' value='&#xf054;' style='font-family: FontAwesome;background: transparent;'>
                    </div>
                </div></a>";
            }
            return html;

        }

        [EbBreadCrumbFilter("Application/", "link")]
        [HttpGet]
        public IActionResult CreateApplication(int Id, EbApplicationTypes Type)
        {
            if (Id > 0)
            {
                ViewBag.Op = "Edit Application";
                HttpContext.Items["link"] = "Edit";
                GetApplicationResponse appData = this.ServiceClient.Get(new GetApplicationRequest { Id = Id });
                ViewBag.AppInfo = appData.AppInfo;
            }
            else
            {
                ViewBag.Op = "New Application";
                HttpContext.Items["link"] = "New";
                ViewBag.AppInfo = new AppWrapper { Id = 0, AppType = 1, Icon = "fa-home" };
            }
            return View();
        }

        public IActionResult DeleteApplication(int Id)
        {
            DeleteAppResponse resp = this.ServiceClient.Post(new DeleteAppRequest
            {
                AppId = Id
            });

            if (resp.Status)
            {
                TempData["ResetStore"] = "resetStore()";
                return Redirect("/MyApplications");
            }
            return View();
        }

        [HttpPost]
        public IActionResult CreateApplication(int i)
        {
            var req = this.HttpContext.Request.Form;
            var resultlist = this.ServiceClient.Post<CreateApplicationResponse>(new CreateApplicationRequest
            {
                AppId = Convert.ToInt32(req["Id"]),
                AppName = req["AppName"],
                AppType = Convert.ToInt32(req["AppType"]),
                Description = req["DescApp"],
                AppIcon = req["AppIcon"],
                Sid = ViewBag.cid
            });

            if (resultlist.Id > 0)
            {
                return RedirectToAction("AppDashBoard", new RouteValueDictionary(new
                {
                    Id = resultlist.Id,
                    Type = Convert.ToInt32(req["AppType"])
                }));
            }
            else
            {
                TempData[Msg] = "Unable to Save try again.";
                return RedirectToAction("CreateApplication");
            }
        }

        [HttpGet]
        public IActionResult Eb_EmailBuilder()
        {
            ViewBag.Header = "New Email Template";

            ViewBag.VersionNumber = 1;
            ViewBag.Obj_id = null;
            ViewBag.Refid = null;
            ViewBag.IsNew = "true";
            ViewBag.EditorHint = "CodeMirror.hint.sql";
            ViewBag.EditorMode = "text/x-sql";
            ViewBag.Icon = "fa fa-database";
            ViewBag.ObjType = EbObjectTypes.EmailBuilder.IntCode;
            ViewBag.ObjectName = "*Untitled";
            ViewBag.FilterDialogId = "null";

            var typeArray = typeof(EbEmailTemplateBase).GetTypeInfo().Assembly.GetTypes();

            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.EmailBuilder, typeof(EbEmailTemplateBase));

            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;

            return View();
        }

        [HttpPost]
        public IActionResult Eb_EmailBuilder(string Htmlcode)
        {
            ViewBag.Header = "Edit Email";
            var req = this.HttpContext.Request.Form;
            int obj_id = Convert.ToInt32(req["objid"]);
            ViewBag.Obj_id = Convert.ToInt32(req["objid"]);
            var resultlist = this.ServiceClient.Get<EbObjectExploreObjectResponse>(new EbObjectExploreObjectRequest { Id = obj_id });
            var rlist = resultlist.Data;

            foreach (var element in rlist)
            {
                ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
                List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
                ViewBag.LifeCycle = lifeCycle;
                ViewBag.IsNew = "false";
                ViewBag.ObjectName = element.Name;
                ViewBag.ObjectDesc = element.Description;
                ViewBag.Status = element.Status;
                ViewBag.VersionNumber = element.VersionNumber;
                ViewBag.Icon = "fa fa-database";
                ViewBag.ObjType = EbObjectTypes.EmailBuilder.IntCode;
                ViewBag.Refid = element.RefId;
                ViewBag.Majorv = element.Dashboard_Tiles.MajorVersionNumber;
                ViewBag.Minorv = element.Dashboard_Tiles.MinorVersionNumber;
                ViewBag.Patchv = element.Dashboard_Tiles.PatchVersionNumber;
                if (String.IsNullOrEmpty(element.Json_wc) && !String.IsNullOrEmpty(element.Json_lc))
                {
                    ViewBag.ReadOnly = true;
                    var dsobj = EbSerializers.Json_Deserialize<EbEmailTemplate>(element.Json_lc);
                    ViewBag.dsobj = dsobj;
                    ViewBag.html = dsobj.Body;
                }
                else
                {
                    ViewBag.ReadOnly = false;
                    var dsobj = EbSerializers.Json_Deserialize<EbEmailTemplate>(element.Json_wc);
                    ViewBag.dsobj = dsobj;
                    ViewBag.html = dsobj.Body;
                }
                var typeArray = typeof(EbEmailTemplateBase).GetTypeInfo().Assembly.GetTypes();

                Context2Js _jsResult = new Context2Js(typeArray, BuilderType.EmailBuilder, typeof(EbEmailTemplateBase));

                ViewBag.Meta = _jsResult.AllMetas;
                ViewBag.JsObjects = _jsResult.JsObjects;
                ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;
            }
            return View();
        }


        public string EmailTemplateCommit(string _Refid, string Htmlcode, string PropObj, string ChangeLog)
        {
            IServiceClient client = this.ServiceClient;
            var emailobj = EbSerializers.Json_Deserialize<EbEmailTemplate>(PropObj);
            string refid = "";
            if (string.IsNullOrEmpty(_Refid))
            {
                var ds = new EbObject_Create_New_ObjectRequest();
                ds.EbObjectType = EbObjectTypes.EmailBuilder.IntCode;
                ds.Name = emailobj.Name;
                ds.Description = emailobj.Description;

                ds.Json = EbSerializers.Json_Serialize(new EbEmailTemplate
                {
                    Body = emailobj.Body,
                    //EbObjectType = emailobj.EbObjectType,
                    Name = emailobj.Name,
                    Subject = emailobj.Subject,
                    DataSourceRefId = emailobj.DataSourceRefId

                });
                ds.Relations = "";
                ds.IsSave = false;

                var res = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
                refid = res.RefId;
            }
            else
            {
                var ds = new EbObject_CommitRequest();
                ds.EbObjectType = EbObjectTypes.EmailBuilder.IntCode;
                ds.Name = emailobj.Name;
                ds.Description = emailobj.Description;
                ds.Json = EbSerializers.Json_Serialize(new EbEmailTemplate
                {
                    Body = emailobj.Body,
                    //EbObjectType = emailobj.EbObjectType,
                    Name = emailobj.Name,
                    Subject = emailobj.Subject,
                    DataSourceRefId = emailobj.DataSourceRefId

                });
                ds.Relations = "";
                ds.RefId = _Refid;
                ds.ChangeLog = ChangeLog;
                var res = ServiceClient.Post<EbObject_CommitResponse>(ds);
                refid = res.RefId;
            }
            return refid;
        }

        public string EmailTemplateSave(string _Refid, string PropObj)
        {
            var req = this.HttpContext.Request.Form;

            var emailobj = EbSerializers.Json_Deserialize<EbEmailTemplate>(PropObj);
            string refid;
            if (string.IsNullOrEmpty(_Refid))
            {
                var ds = new EbObject_Create_New_ObjectRequest();
                ds.EbObjectType = EbObjectTypes.EmailBuilder.IntCode;
                ds.Name = emailobj.Name;
                ds.Description = emailobj.Description;
                ds.Json = EbSerializers.Json_Serialize(new EbEmailTemplate
                {
                    Body = emailobj.Body,
                    //EbObjectType = emailobj.EbObjectType,
                    Name = emailobj.Name,
                    Subject = emailobj.Subject,
                    DataSourceRefId = emailobj.DataSourceRefId

                });
                ds.Relations = "";
                ds.IsSave = true;

                var res = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
                refid = res.RefId;
            }
            else
            {

                var ds = new EbObject_SaveRequest();
                ds.RefId = _Refid;
                ds.Name = emailobj.Name;
                ds.Description = emailobj.Description;
                ds.EbObjectType = EbObjectTypes.EmailBuilder.IntCode;
                ds.Json = EbSerializers.Json_Serialize(new EbEmailTemplate
                {
                    Body = emailobj.Body,
                    //EbObjectType = emailobj.EbObjectType,
                    Name = emailobj.Name,
                    Subject = emailobj.Subject,
                    DataSourceRefId = emailobj.DataSourceRefId

                });
                ds.Relations = "";
                ViewBag.IsNew = "false";
                var res = this.ServiceClient.Post<EbObject_SaveResponse>(ds);
                refid = res.RefId;
            }
            return refid;
        }

        public int UpdateAppSettings(int id, int type, string settings)
        {
            SaveAppSettingsResponse response = this.ServiceClient.Get(new SaveAppSettingsRequest { AppId = id, AppType = type, Settings = settings });
            return response.ResStatus;
        }

        public IActionResult RedisExplorer()
        {
            List<string> dsCollection = new List<string>();

            var keys = this.Redis.GetAllKeys();
            string _json = string.Empty;

            foreach (string k in keys)
            {
                string[] splistr = k.Split("-");
                if (splistr.Length >= 3)
                {
                    if (splistr[2] == "2" && !k.EndsWith("columns"))
                    {
                        _json = this.Redis.Get<string>(k);
                    }
                }
            }
            return View();
        }

        [HttpGet]
        public string GetReq_respJson(string components)
        {
            ApiReqJsonResponse resp = this.ServiceClient.Get(new ApiReqJsonRequest { Components = EbSerializers.Json_Deserialize<ListOrdered>(components) });
            return JsonConvert.SerializeObject(resp.Params);
        }

        public string GetCompReqJson(string refid)
        {
            List<Param> p = null;
            var obj = this.ServiceClient.Get(new EbObjectParticularVersionRequest { RefId = refid });
            var o = EbSerializers.Json_Deserialize(obj.Data[0].Json);

            if (o is EbDataReader || o is EbDataWriter || o is EbSqlFunction)
            {
                if (o.InputParams == null || o.InputParams.Count <= 0)
                    p = this.GetSqlParams(o, obj.Data[0].EbObjectType);
                else
                    p = o.InputParams;
            }
            else if (o is EbApi)
            {
                return this.GetReq_respJson(EbSerializers.Json_Serialize((o as EbApi).Resources));
            }
            return JsonConvert.SerializeObject(p);
        }

        private List<Param> GetSqlParams(EbDataSourceMain o, int obj_type)
        {
            bool isFilter = false;
            if (o is EbDataReader)
            {
                if (!string.IsNullOrEmpty((o as EbDataReader).FilterDialogRefId))
                    isFilter = true;
            }

            if (!isFilter)
            {
                if ((o.InputParams != null) && (o.InputParams.Any()))
                    return o.InputParams;
                else
                    return SqlHelper.GetSqlParams(o.Sql, obj_type);
            }
            else
            {
                (o as EbDataReader).AfterRedisGet(Redis as RedisClient);
                List<Param> p = new List<Param>();
                foreach (EbControl ctrl in (o as EbDataReader).FilterDialog.Controls)
                {
                    p.Add(new Param
                    {
                        Name = ctrl.Name,
                        Type = ((int)ctrl.EbDbType).ToString(),
                    });
                }
                return p;
            }
        }

        [HttpGet]
        public ApiComponent GetComponent(string refid)
        {
            var obj = this.ServiceClient.Get(new EbObjectParticularVersionRequest { RefId = refid });
            var o = EbSerializers.Json_Deserialize(obj.Data[0].Json);
            string p = null;
            if (o is EbDataReader || o is EbDataWriter || o is EbSqlFunction)
            {
                if (o.InputParams == null || o.InputParams.Count <= 0)
                    p = JsonConvert.SerializeObject(this.GetSqlParams(o, obj.Data[0].EbObjectType));
                else
                    p = JsonConvert.SerializeObject(o.InputParams);
            }
            else if (o is EbApi)
            {
                p = this.GetReq_respJson(EbSerializers.Json_Serialize((o as EbApi).Resources));
            }
            else if (o is EbFormResource)
            {
                // set p as string List<Param>
            }

            return new ApiComponent { Name = o.Name, Version = o.VersionNumber, Parameters = p ?? "[]" };
        }

        [HttpGet]
        public string GetApiResponse(string name, string vers, string param, string component = null)
        {
            ApiParams pr = JsonConvert.DeserializeObject<ApiParams>(param);
            ApiResponse resp = null;

            try
            {
                if (component == null)
                {
                    List<Param> defaultParams = pr.Default.GroupBy(p => p.Name).Select(g => g.First()).ToList();

                    var watch = new System.Diagnostics.Stopwatch(); watch.Start();

                    Dictionary<string, object> d = defaultParams.Select(p => new { prop = p.Name, val = p.Value })
                        .ToDictionary(x => x.prop, x => x.val as object);

                    foreach (Param p in pr.Custom)
                    {
                        d.Add(p.Name, p.ValueTo);
                    }
                    resp = this.ServiceClient.Get(new ApiRequest
                    {
                        Name = name,
                        Version = vers,
                        Data = d
                    });

                    watch.Stop();
                    resp.Name = name;
                    resp.Version = vers;
                    resp.Message.ExecutedOn = DateTime.UtcNow.ToString();
                    resp.Message.ExecutionTime = watch.ElapsedMilliseconds.ToString() + " ms";
                }
                else
                {
                    resp = this.ServiceClient.Post(new ApiComponetRequest
                    {
                        Component = EbSerializers.Json_Deserialize(component),
                        Params = pr.Default
                    });
                }
                if (resp.Result != null && resp.Result.GetType() == typeof(ApiScript))
                {
                    resp.Result = JsonConvert.DeserializeObject<dynamic>((resp.Result as ApiScript).Data);
                }
            }
            catch (Exception ex)
            {
                if (resp == null)
                {
                    resp = new ApiResponse();
                }
                resp.Message.Description = ex.Message;
            }
            return JsonConvert.SerializeObject(resp);
        }

        public IActionResult SolutionConsole()
        {
            EbObjectObjListAllVerResponse public_res = this.ServiceClient.Get(new PublicObjListAllVerRequest { EbObjectType = 0 });
            EbObjectObjListAllVerResponse all_resp = this.ServiceClient.Get(new EbObjectObjLisAllVerRequest { EbObjectType = 0 });
            GetUserTypesResponse _userTypesResp = this.ServiceClient.Get(new GetUserTypesRequest());

            Eb_Solution solutionObj = GetSolutionObject(ViewBag.cid);
            if (solutionObj != null && solutionObj.SolutionSettings != null)
            {
                ViewBag.signupFormRefid = solutionObj.SolutionSettings.SignupFormRefid;
                if (solutionObj.SolutionSettings.UserTypeForms != null && solutionObj.SolutionSettings.UserTypeForms.Count > 0)
                {
                    foreach (var item in _userTypesResp.UserTypes)
                    {
                        var itemInB = solutionObj.SolutionSettings.UserTypeForms.FirstOrDefault(x => x.Id == item.Id);

                        if (itemInB != null)
                            item.RefId = itemInB.RefId;
                    }
                }
            }

            ViewBag.userTypes = _userTypesResp.UserTypes;
            ViewBag.objlist = public_res.Data;
            ViewBag.all_objlist = all_resp.Data;
            return View();
        }

        public string SaveSolutionSettings(string obj)
        {
            try
            {
                SolutionSettings solutionsettings = JsonConvert.DeserializeObject<SolutionSettings>(obj);
                if (solutionsettings != null && solutionsettings.UserTypeForms != null)
                {
                    CreateMyProfileTableResponse profResp = this.ServiceClient.Post(new CreateMyProfileTableRequest
                    {
                        UserTypeForms = solutionsettings.UserTypeForms
                    });
                    SaveSolutionSettingsResponse resp = this.ServiceClient.Post(new SaveSolutionSettingsRequest { SolutionSettings = obj });
                    return resp.Message;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message + e.StackTrace);
            }
            return "Something went wrong..";
        }

        [HttpGet]
        public string GetMobileFormControls(string refid)
        {
            MobileFormControlInfo info = new MobileFormControlInfo();
            try
            {
                EbMobilePage mPage = this.Redis.Get<EbMobilePage>(refid);
                if (mPage == null)
                {
                    var obj = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest
                    {
                        RefId = refid
                    });
                    mPage = EbSerializers.Json_Deserialize<EbMobilePage>(obj.Data[0].Json);
                }

                if (mPage.Container is EbMobileForm)
                {
                    info.IsForm = true;

                    foreach (EbMobileControl ctrl in (mPage.Container as EbMobileForm).ChildControls)
                    {
                        if (ctrl is INonPersistControl || ctrl is ILinesEnabled)
                            continue;
                        else if (ctrl is EbMobileTableLayout)
                        {
                            foreach (EbMobileTableCell cell in (ctrl as EbMobileTableLayout).CellCollection)
                            {
                                cell.ControlCollection.ForEach(item => AddControl(info, item));
                            }
                        }
                        else
                        {
                            AddControl(info, ctrl);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return EbSerializers.Json_Serialize(info);
        }

        private void AddControl(MobileFormControlInfo info, EbMobileControl ctrl)
        {
            ctrl.EbSid = "EB_FP_" + ctrl.Name;
            info.Controls.Add(ctrl);
            info.ControlMetas.Add(new EbMobileControlMeta
            {
                EbSid = ctrl.EbSid,
                Name = ctrl.Name,
                ControlName = ctrl.Name,
                ControlType = ctrl.GetType().Name
            });
        }
    }
}
