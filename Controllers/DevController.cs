﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Web.Filters;
using Microsoft.Extensions.Options;
using ExpressBase.Web2;
using ServiceStack;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects;
using ExpressBase.Common;
using ServiceStack.Text;
using System.Net;
using ExpressBase.Data;
using DiffPlex;
using DiffPlex.DiffBuilder;
using DiffPlex.DiffBuilder.Model;
using System.Text;
using ExpressBase.Objects.Objects;
using Newtonsoft.Json;
using ExpressBase.Common.Objects.Attributes;
using ServiceStack.Redis;
using ExpressBase.Common.Objects;
using Microsoft.AspNetCore.Routing;
using ExpressBase.Common.JsonConverters;
using System.Reflection;
using ExpressBase.Objects.EmailRelated;
using ExpressBase.Common.Structures;
using ExpressBase.Web.BaseControllers;
using System.Text.RegularExpressions;
using ExpressBase.Common.Extensions;
using ExpressBase.Common.Data;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

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
            return View();
        }

        [EbBreadCrumbFilter("Applications/", "AppName")]
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
            ViewBag.Types = JsonConvert.SerializeObject(_dict);
            ViewBag.Objects = JsonConvert.SerializeObject(_objects.Data);
            ViewBag.AppInfo = _objects.AppInfo;
            this.HttpContext.Items["AppName"] = _objects.AppInfo.Name;
            return View();
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

        [EbBreadCrumbFilter("NewApplication")]
        [HttpGet]
        public IActionResult CreateApplication()
        {

            return View();
        }

        [HttpPost]
        public IActionResult CreateApplication(int i)
        {
            var req = this.HttpContext.Request.Form;
            var resultlist = this.ServiceClient.Post<CreateApplicationResponse>(new CreateApplicationDevRequest
            {
                AppName = req["AppName"],
                AppType = Convert.ToInt32(req["AppType"]),
                Description = req["DescApp"],
                AppIcon = req["AppIcon"],
                Sid = req["Sid"]
            });

            if (resultlist.id > 0)
            {
                TempData[Msg] = "Application Created succesfully.";
                return RedirectToAction("AppDashBoard", new RouteValueDictionary(new { Id = resultlist.id, Type = Convert.ToInt32(req["AppType"]) }));
            }
            else
                TempData[Msg] = "Application Creation failed.";
            return View();
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
            List<Param> p = new List<Param>();
            ListOrdered resources = EbSerializers.Json_Deserialize<ListOrdered>(components);

            foreach (EbApiWrapper r in resources)
            {
                if (r is EbSqlReader || r is EbSqlWriter || r is EbSqlFunc)
                {
                    var obj = this.ServiceClient.Get(new EbObjectParticularVersionRequest { RefId = r.Refid });
                    EbDataSourceMain ds = EbSerializers.Json_Deserialize(obj.Data[0].Json);
                    if (ds.InputParams == null || ds.InputParams.Count <= 0)
                       p.Merge(this.GetSqlParams(ds, obj.Data[0].EbObjectType));
                    else
                       p.Merge(ds.InputParams);
                }
                else if(r is EbEmailNode)
                {
                    var obj = this.ServiceClient.Get(new EbObjectParticularVersionRequest { RefId = r.Refid });
                    EbEmailTemplate enode = EbSerializers.Json_Deserialize(obj.Data[0].Json);

                    if (!string.IsNullOrEmpty(enode.AttachmentReportRefID))
                    {
                        var rep = this.ServiceClient.Get(new EbObjectParticularVersionRequest { RefId = enode.AttachmentReportRefID });
                        EbReport o = EbSerializers.Json_Deserialize<EbReport>(rep.Data[0].Json);
                        if (!string.IsNullOrEmpty(o.DataSourceRefId))
                        {
                            var ds= this.ServiceClient.Get(new EbObjectParticularVersionRequest { RefId = o.DataSourceRefId });
                            p = p.Merge(this.GetSqlParams(EbSerializers.Json_Deserialize<EbDataSourceMain>(ds.Data[0].Json), ds.Data[0].EbObjectType));
                        }
                    }
                    if (!string.IsNullOrEmpty(enode.DataSourceRefId))
                    {
                        var ob = this.ServiceClient.Get(new EbObjectParticularVersionRequest { RefId = enode.DataSourceRefId });
                        p = p.Merge(this.GetSqlParams(EbSerializers.Json_Deserialize<EbDataSourceMain>(ob.Data[0].Json), ob.Data[0].EbObjectType));
                    }
                }
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
            return new ApiComponent {Name=o.Name,Version=o.VersionNumber };
        }

        [HttpGet]
        public string GetApiResponse(string name, string vers, string param)
        {
            ApiResponse resp = null;
            List<Param> pr = JsonConvert.DeserializeObject<List<Param>>(param);
            Dictionary<string, object> d = pr.Select(p => new { prop = p.Name, val = p.Value })
                .ToDictionary(x => x.prop, x => x.val as object);

            resp = this.ServiceClient.Get(new ApiRequest
            {
                Name = name,
                Version = vers,
                Data = d
            });

            return JsonConvert.SerializeObject(resp);
        }

        public IActionResult ApiConsole()
        {
            //string _json = @"{'Name':'Form1','MasterTable':'dg3f','MultipleTables':{'dg3f':[{'RowId':0,'IsUpdate':false,'Columns':[{'Name':'textbox0','Value':'abhilasha','Type':16,'AutoIncrement':false}]}],'dg3c':[{'RowId':0,'IsUpdate':false,'Columns':[{'Name':'date0','Value':'2018-11-17','Type':5,'AutoIncrement':false},{'Name':'textbox1','Value':'pushpam','Type':16,'AutoIncrement':false}]}]}}";
            string _json = @"{
'FormName':'Form1',
'MasterTable':'t1',
'Tables':[
{'TableName':'t1',
'Colums':[
	{'ColumName':'c1','EbDbType':16},
	{'ColumName':'c2','EbDbType':5},
	{'ColumName':'c3','EbDbType':16},
	{'ColumName':'c4','EbDbType':11},
	{'ColumName':'c5','EbDbType':16}
	]},
{'TableName':'t2',
'Colums':[
	{'ColumName':'c1','EbDbType':16},
	{'ColumName':'c2','EbDbType':16},
	{'ColumName':'c3','EbDbType':11},
	{'ColumName':'c4','EbDbType':16},
	{'ColumName':'c5','EbDbType':16}
	]},
	{'TableName':'t3',
'Colums':[
	{'ColumName':'c1','EbDbType':3},
	{'ColumName':'c2','EbDbType':16},
	{'ColumName':'c3','EbDbType':16},
	{'ColumName':'c4','EbDbType':16},
	{'ColumName':'c5','EbDbType':30}
	]}
]
}";
            var res = this.ServiceClient.Post<FormDataJsonResponse>(new FormDataJsonRequest
            {
                JsonData = _json
            });
            return View();
        }
    }
}
