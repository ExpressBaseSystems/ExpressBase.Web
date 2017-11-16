using System;
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
using ExpressBase.Objects.ObjectContainers;
using ExpressBase.Common.Objects.Attributes;
using ServiceStack.Redis;
using ExpressBase.Common.Objects;
using System.Reflection;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Security;
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class DVController : EbBaseNewController
    {
        public DVController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        [HttpGet]
        [HttpPost]
        public IActionResult dv(string objid, EbObjectType objtype)
        {
            //FetchAllDataSources();
            //FetchAllDataVisualizations();
            ViewBag.ServiceUrl = this.ServiceClient.BaseUri;


            User _user = this.Redis.Get<User>(string.Format("{0}-{1}-{2}", ViewBag.cid, ViewBag.email, ViewBag.wc));
            ViewBag.user = _user;

            var typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();

            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DVBuilder, typeof(EbDataVisualizationObject));

            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectType = _jsResult.EbObjectTypes;
            //Edit mode
            if (objid != null)
            {
                var resultlist = this.ServiceClient.Get<EbObjectExploreObjectResponse>(new EbObjectExploreObjectRequest { Id = Convert.ToInt32(objid) });
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
                    ViewBag.ObjType = (int)objtype;
                    ViewBag.Refid = element.RefId;
                    ViewBag.Majorv = element.Dashboard_Tiles.MajorVersionNumber;
                    ViewBag.Minorv = element.Dashboard_Tiles.MinorVersionNumber;
                    ViewBag.Patchv = element.Dashboard_Tiles.PatchVersionNumber;

                    EbDataVisualization dsobj = null;

                    if (String.IsNullOrEmpty(element.Json_wc) && !String.IsNullOrEmpty(element.Json_lc))
                    {
                        ViewBag.ReadOnly = true;
                        dsobj = EbSerializers.Json_Deserialize(element.Json_lc);
                    }
                    else
                    {
                        ViewBag.ReadOnly = false;
                        dsobj = EbSerializers.Json_Deserialize(element.Json_wc);
                    }

                    dsobj.AfterRedisGet(this.Redis);
                    ViewBag.dvObject = dsobj;
                }

            }
            //if (!string.IsNullOrEmpty(objid))
            //{
            //    EbDataVisualization dvObject = null;
            //    if (objtype == EbObjectType.TableVisualization)
            //    {
            //        dvObject = this.Redis.Get<EbTableVisualization>(objid + ViewBag.UId);
            //        if (dvObject == null)
            //            dvObject = this.Redis.Get<EbDataVisualization>(objid);
            //    }
            //    else if (objtype == EbObjectType.ChartVisualization)
            //    {
            //        dvObject = this.Redis.Get<EbChartVisualization>(objid + ViewBag.UId);
            //        if (dvObject == null)
            //            dvObject = this.Redis.Get<EbChartVisualization>(objid);
            //    }
            //    dvObject.AfterRedisGet(this.Redis);
            //    ViewBag.dvObject = dvObject;
            //}
            //ViewBag.dvRefId = objid;
            return View();
        }

        [HttpGet]
        [HttpPost]
        public IActionResult dvTable(string objid, EbObjectType objtype)
        {
            FetchAllDataSources();
            //FetchAllDataVisualizations();
            ViewBag.ServiceUrl = this.ServiceClient.BaseUri;

            var typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();

            var _jsResult = CSharpToJs.GenerateJs<EbDataVisualizationObject>(BuilderType.DVBuilder, typeArray);

            ViewBag.Meta = _jsResult.Meta;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectType = _jsResult.EbObjectTypes;
            if (objid != null)
            {
                var resultlist = this.ServiceClient.Get<EbObjectExploreObjectResponse>(new EbObjectExploreObjectRequest { Id = Convert.ToInt32(objid) });
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
                    ViewBag.ObjType = (int)objtype;
                    ViewBag.Refid = element.RefId;
                    ViewBag.Majorv = element.Dashboard_Tiles.MajorVersionNumber;
                    ViewBag.Minorv = element.Dashboard_Tiles.MinorVersionNumber;
                    ViewBag.Patchv = element.Dashboard_Tiles.PatchVersionNumber;

                    EbDataVisualization dsobj = null;

                    if (String.IsNullOrEmpty(element.Json_wc) && !String.IsNullOrEmpty(element.Json_lc))
                    {
                        ViewBag.ReadOnly = true;
                        if (objtype == EbObjectType.TableVisualization)
                            dsobj = EbSerializers.Json_Deserialize<EbTableVisualization>(element.Json_lc);
                        else if (objtype == EbObjectType.ChartVisualization)
                            dsobj = EbSerializers.Json_Deserialize<EbChartVisualization>(element.Json_lc);
                    }
                    else
                    {
                        ViewBag.ReadOnly = false;
                        if (objtype == EbObjectType.TableVisualization)
                            dsobj = EbSerializers.Json_Deserialize<EbTableVisualization>(element.Json_wc);
                        else if (objtype == EbObjectType.ChartVisualization)
                            dsobj = EbSerializers.Json_Deserialize<EbChartVisualization>(element.Json_wc);
                    }

                    dsobj.AfterRedisGet(this.Redis);
                    ViewBag.dvObject = dsobj;
                }

            }

            return View();
        }

        [HttpGet]
        [HttpPost]
        public IActionResult dvChart(string objid, EbObjectType objtype)
        {
            FetchAllDataSources();
            //FetchAllDataVisualizations();
            ViewBag.ServiceUrl = this.ServiceClient.BaseUri;

            var typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();

            var _jsResult = CSharpToJs.GenerateJs<EbDataVisualizationObject>(BuilderType.DVBuilder, typeArray);

            ViewBag.Meta = _jsResult.Meta;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectType = _jsResult.EbObjectTypes;
            if (objid != null)
            {
                var resultlist = this.ServiceClient.Get<EbObjectExploreObjectResponse>(new EbObjectExploreObjectRequest { Id = Convert.ToInt32(objid) });
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
                    ViewBag.ObjType = (int)objtype;
                    ViewBag.Refid = element.RefId;
                    ViewBag.Majorv = element.Dashboard_Tiles.MajorVersionNumber;
                    ViewBag.Minorv = element.Dashboard_Tiles.MinorVersionNumber;
                    ViewBag.Patchv = element.Dashboard_Tiles.PatchVersionNumber;

                    EbDataVisualization dsobj = null;

                    if (String.IsNullOrEmpty(element.Json_wc) && !String.IsNullOrEmpty(element.Json_lc))
                    {
                        ViewBag.ReadOnly = true;
                        if (objtype == EbObjectType.TableVisualization)
                            dsobj = EbSerializers.Json_Deserialize<EbTableVisualization>(element.Json_lc);
                        else if (objtype == EbObjectType.ChartVisualization)
                            dsobj = EbSerializers.Json_Deserialize<EbChartVisualization>(element.Json_lc);
                    }
                    else
                    {
                        ViewBag.ReadOnly = false;
                        if (objtype == EbObjectType.TableVisualization)
                            dsobj = EbSerializers.Json_Deserialize<EbTableVisualization>(element.Json_wc);
                        else if (objtype == EbObjectType.ChartVisualization)
                            dsobj = EbSerializers.Json_Deserialize<EbChartVisualization>(element.Json_wc);
                    }

                    dsobj.AfterRedisGet(this.Redis);
                    ViewBag.dvObject = dsobj;
                }

            }

            return View();
        }

        //[HttpPost]
        //public IActionResult dv(int objid)
        //{
        //    var token = Request.Cookies["Token"];
        //    ViewBag.dvid = objid;
        //    ViewBag.token = token;

        //    var tvpref = this.Redis.Get<string>(string.Format("{0}_TVPref_{1}", ViewBag.cid, objid));
        //    Dictionary<string, object> _dict = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, object>>(tvpref);
        //    ViewBag.dsid = _dict["dsId"];
        //    ViewBag.dvname = _dict["dvName"];
        //    int fdid = Convert.ToInt32(_dict["fdId"]);

        //    var resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, TenantAccountId = ViewBag.cid });
        //    var rlist = resultlist.Data;
        //    //Dictionary<int, EbObjectWrapper> ObjDSList = new Dictionary<int, EbObjectWrapper>();
        //    Dictionary<int, EbObjectWrapper> ObjDSListAll = new Dictionary<int, EbObjectWrapper>();
        //    Dictionary<int, string> ObjDVListAll = new Dictionary<int, string>();
        //    foreach (var element in rlist)
        //    {
        //        ObjDSListAll[element.Id] = element;
        //    }
        //    ViewBag.DSListAll = ObjDSListAll;
        //    return View();
        //}

        public IActionResult dvCommon(string dvobj, string dvRefId, bool flag)
        {
            var dvObject = EbSerializers.Json_Deserialize(dvobj);
            dvObject.AfterRedisGet(this.Redis);

            if (!string.IsNullOrEmpty(dvobj) && !string.IsNullOrEmpty(dvRefId) && !flag)
                return ViewComponent("ParameterDiv", new { paramDiv = dvObject.EbDataSource.FilterDialog });
            else
                return ViewComponent("DataVisualization", new { dvobjt = dvobj, dvRefId = dvRefId });
        }

        public List<EbObjectWrapper> getAllRelatedDV(string refid)
        {
            List<EbObjectWrapper> DvList = new List<EbObjectWrapper>();
            if (refid != null)
            {
                var resultlist = this.ServiceClient.Get<EbObjectRelationsResponse>(new EbObjectRelationsRequest { DominantId = refid });
                var rlist = resultlist.Data;
                foreach (var element in rlist)
                {
                    if (element.EbObjectType == EbObjectType.TableVisualization || element.EbObjectType == EbObjectType.ChartVisualization)
                    {
                        DvList.Add(element);
                    }
                }

            }
            return DvList;
        }

        public string getdv(string refid, EbObjectType objtype)
        {
            EbDataVisualization dsobj = null;
            if (refid != null)
            {
                var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
                dsobj = EbSerializers.Json_Deserialize(resultlist.Data[0].Json);
                dsobj.Status = resultlist.Data[0].Status;
                dsobj.VersionNumber = resultlist.Data[0].VersionNumber;

                
            }
             return EbSerializers.Json_Serialize(dsobj); 
        }

        public IActionResult dvgoogle()
        {
            return ViewComponent("GoogleRelated");
        }


        //public JsonResult SaveSettings(string json, string RefId, string type)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    EbDataVisualization obj = null;
        //    if (type == "TableVisualization")
        //        obj = EbSerializers.Json_Deserialize<EbTableVisualization>(json);
        //    else if (type == "ChartVisualization")
        //        obj = EbSerializers.Json_Deserialize<EbChartVisualization>(json);
        //    string SaveId = "";
        //    if (ViewBag.wc == "dc")
        //    {
        //        if (string.IsNullOrEmpty(RefId))
        //        {
        //            var ds = new EbObject_Create_New_ObjectRequest();
        //            ds.EbObjectType = (type == "TableVisualization") ? (int)EbObjectType.TableVisualization : (int)EbObjectType.ChartVisualization;
        //            ds.Name = obj.Name;
        //            ds.Json = json;
        //            ds.Status = ObjectLifeCycleStatus.Live;
        //            ds.Relations = "aaa";
        //            ds.Tags = "dddd";
        //            ds.IsSave = true;
        //            var result = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
        //            SaveId = result.RefId;
        //        }
        //        else
        //        {
        //            var ds = new EbObject_CommitRequest();
        //            ds.EbObjectType = (type == "TableVisualization") ? (int)EbObjectType.TableVisualization : (int)EbObjectType.ChartVisualization;
        //            ds.Name = obj.Name;
        //            ds.Json = json;
        //            ds.Relations = "aaaaaa";
        //            ds.ChangeLog = "eee";
        //            ds.RefId = RefId;
        //            ds.Tags = "dddd";
        //            var result = ServiceClient.Post<EbObject_CommitResponse>(ds);
        //            SaveId = result.RefId;
        //        }
        //    }
        //    if (ViewBag.wc == "uc")
        //    {
        //        if (type == "TableVisualization")
        //            this.Redis.Set<EbTableVisualization>(SaveId + ViewBag.UId, EbSerializers.Json_Deserialize<EbTableVisualization>(json));
        //        else if (type == "ChartVisualization")
        //            this.Redis.Set<EbChartVisualization>(SaveId + ViewBag.UId, EbSerializers.Json_Deserialize<EbChartVisualization>(json));
        //    }
        //    else if (ViewBag.wc == "dc")

        //    {
        //        if (type == "TableVisualization")
        //            this.Redis.Set<EbTableVisualization>(SaveId, EbSerializers.Json_Deserialize<EbTableVisualization>(json));
        //        else if (type == "ChartVisualization")
        //            this.Redis.Set<EbChartVisualization>(SaveId, EbSerializers.Json_Deserialize<EbChartVisualization>(json));
        //    }
        //    return Json("Success");
        //}

        // Get all DataSources
        private void FetchAllDataSources()
        {
            var resultlist = this.ServiceClient.Get<EbObjectObjListResponse>(new EbObjectObjListRequest { EbObjectType = (int)EbObjectType.DataSource });

            Dictionary<string, EbObjectWrapper> ObjDSListAll = new Dictionary<string, EbObjectWrapper>();
            foreach (var element in resultlist.Data)
                ObjDSListAll[element.RefId] = element;

            ViewBag.DSListAll = ObjDSListAll;
        }

        // Get All DVNames for Linking with each other -href click
        public Dictionary<string, List<EbObjectWrapper>> FetchAllDataVisualizations(EbObjectType type)
        {
            var resultlist = this.ServiceClient.Get<EbObjectObjListAllVerResponse>(new EbObjectObjLisAllVerRequest { EbObjectType = Convert.ToInt32(type) });
            var ObjDVListAll = resultlist.Data;

            return ObjDVListAll;
        }
    }
}

