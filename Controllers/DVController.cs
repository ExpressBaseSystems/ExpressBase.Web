using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web2;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Reflection;
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class DVController : EbBaseIntCommonController
    {
        public DVController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        [HttpGet]
        [HttpPost]
        public IActionResult dv(string refid, string rowData, string filterValues, int tabNum)
        {
            //string objid, EbObjectType objtype
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);

            User _user = this.Redis.Get<User>(string.Format(TokenConstants.SUB_FORMAT, ViewBag.cid, ViewBag.email, ViewBag.wc));
            ViewBag.user = _user;

            var typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DVBuilder, typeof(EbDataVisualizationObject));

            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectType = _jsResult.EbObjectTypes;

            var resultlist = this.ServiceClient.Get<EbObjectWithRelatedDVResponse>(new EbObjectWithRelatedDVRequest { Refid = refid, Ids = _user.EbObjectIds.ToString(), DsRefid = null });
            var dsobj = resultlist.Dsobj;
            dsobj.AfterRedisGet(this.Redis, this.ServiceClient);
            ViewBag.dvObject = dsobj;
            ViewBag.dvRefId = refid;
            ViewBag.filterValues = filterValues;
            ViewBag.tabNum = tabNum;
            ViewBag.rowData = rowData;
            ViewBag.DvList = JsonConvert.SerializeObject(resultlist.DvList);
            ViewBag.DvTaggedList = JsonConvert.SerializeObject(resultlist.DvTaggedList);
            return View();
        }


        //[HttpGet][HttpPost]
        //public IActionResult dvTable(string objid, EbObjectType objtype)
        //{
        //    ViewBag.ServiceUrl = this.ServiceClient.BaseUri;

        //    var typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();

        //    var _jsResult = CSharpToJs.GenerateJs<EbDataVisualizationObject>(BuilderType.DVBuilder, typeArray);

        //    ViewBag.Meta = _jsResult.Meta;
        //    ViewBag.JsObjects = _jsResult.JsObjects;
        //    ViewBag.EbObjectType = _jsResult.EbObjectTypes;
        //    if (objid != null)
        //    {
        //        var resultlist = this.ServiceClient.Get<EbObjectExploreObjectResponse>(new EbObjectExploreObjectRequest { Id = Convert.ToInt32(objid) });
        //        var rlist = resultlist.Data;
        //        foreach (var element in rlist)
        //        {
        //            ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
        //            List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
        //            ViewBag.LifeCycle = lifeCycle;
        //            ViewBag.IsNew = "false";
        //            ViewBag.ObjectName = element.Name;
        //            ViewBag.ObjectDesc = element.Description;
        //            ViewBag.Status = element.Status;
        //            ViewBag.VersionNumber = element.VersionNumber;
        //            ViewBag.Icon = "fa fa-database";
        //            ViewBag.ObjType = (int)objtype;
        //            ViewBag.Refid = element.RefId;
        //            ViewBag.Majorv = element.Dashboard_Tiles.MajorVersionNumber;
        //            ViewBag.Minorv = element.Dashboard_Tiles.MinorVersionNumber;
        //            ViewBag.Patchv = element.Dashboard_Tiles.PatchVersionNumber;

        //            EbDataVisualization dsobj = null;

        //            if (String.IsNullOrEmpty(element.Json_wc) && !String.IsNullOrEmpty(element.Json_lc))
        //            {
        //                ViewBag.ReadOnly = true;
        //                if (objtype == EbObjectType.TableVisualization)
        //                    dsobj = EbSerializers.Json_Deserialize<EbTableVisualization>(element.Json_lc);
        //                else if (objtype == EbObjectType.ChartVisualization)
        //                    dsobj = EbSerializers.Json_Deserialize<EbChartVisualization>(element.Json_lc);
        //            }
        //            else
        //            {
        //                ViewBag.ReadOnly = false;
        //                if (objtype == EbObjectType.TableVisualization)
        //                    dsobj = EbSerializers.Json_Deserialize<EbTableVisualization>(element.Json_wc);
        //                else if (objtype == EbObjectType.ChartVisualization)
        //                    dsobj = EbSerializers.Json_Deserialize<EbChartVisualization>(element.Json_wc);
        //            }

        //            dsobj.AfterRedisGet(this.Redis);
        //            ViewBag.dvObject = dsobj;
        //        }

        //    }

        //    return View();
        //}

        //[HttpGet][HttpPost]
        //public IActionResult dvChart(string objid, EbObjectType objtype)
        //{
        //    ViewBag.ServiceUrl = this.ServiceClient.BaseUri;

        //    var typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();

        //    var _jsResult = CSharpToJs.GenerateJs<EbDataVisualizationObject>(BuilderType.DVBuilder, typeArray);

        //    ViewBag.Meta = _jsResult.Meta;
        //    ViewBag.JsObjects = _jsResult.JsObjects;
        //    ViewBag.EbObjectType = _jsResult.EbObjectTypes;
        //    if (objid != null)
        //    {
        //        var resultlist = this.ServiceClient.Get<EbObjectExploreObjectResponse>(new EbObjectExploreObjectRequest { Id = Convert.ToInt32(objid) });
        //        var rlist = resultlist.Data;
        //        foreach (var element in rlist)
        //        {
        //            ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
        //            List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
        //            ViewBag.LifeCycle = lifeCycle;
        //            ViewBag.IsNew = "false";
        //            ViewBag.ObjectName = element.Name;
        //            ViewBag.ObjectDesc = element.Description;
        //            ViewBag.Status = element.Status;
        //            ViewBag.VersionNumber = element.VersionNumber;
        //            ViewBag.Icon = "fa fa-database";
        //            ViewBag.ObjType = (int)objtype;
        //            ViewBag.Refid = element.RefId;
        //            ViewBag.Majorv = element.Dashboard_Tiles.MajorVersionNumber;
        //            ViewBag.Minorv = element.Dashboard_Tiles.MinorVersionNumber;
        //            ViewBag.Patchv = element.Dashboard_Tiles.PatchVersionNumber;

        //            EbDataVisualization dsobj = null;

        //            if (String.IsNullOrEmpty(element.Json_wc) && !String.IsNullOrEmpty(element.Json_lc))
        //            {
        //                ViewBag.ReadOnly = true;
        //                if (objtype == EbObjectType.TableVisualization)
        //                    dsobj = EbSerializers.Json_Deserialize<EbTableVisualization>(element.Json_lc);
        //                else if (objtype == EbObjectType.ChartVisualization)
        //                    dsobj = EbSerializers.Json_Deserialize<EbChartVisualization>(element.Json_lc);
        //            }
        //            else
        //            {
        //                ViewBag.ReadOnly = false;
        //                if (objtype == EbObjectType.TableVisualization)
        //                    dsobj = EbSerializers.Json_Deserialize<EbTableVisualization>(element.Json_wc);
        //                else if (objtype == EbObjectType.ChartVisualization)
        //                    dsobj = EbSerializers.Json_Deserialize<EbChartVisualization>(element.Json_wc);
        //            }

        //            dsobj.AfterRedisGet(this.Redis);
        //            ViewBag.dvObject = dsobj;
        //        }

        //    }

        //    return View();
        //}


        public IActionResult dvCommon(string dvobj, string dvRefId, bool flag)
        {
            var dvObject = EbSerializers.Json_Deserialize(dvobj);
            dvObject.AfterRedisGet(this.Redis, this.ServiceClient);

            if (!string.IsNullOrEmpty(dvobj) && !string.IsNullOrEmpty(dvRefId) && !flag && dvObject.EbDataSource.FilterDialogRefId != null && dvObject.EbDataSource.FilterDialogRefId != "")
            {
                foreach (EbControl control in dvObject.EbDataSource.FilterDialog.Controls)
                {
                    if (control is EbSimpleSelect)
                    {
                        (control as EbSimpleSelect).InitFromDataBase(this.ServiceClient);
                    }
                }
                return ViewComponent("ParameterDiv", new { paramDiv = dvObject.EbDataSource.FilterDialog });
            }
            else
                return ViewComponent("DataVisualization", new { dvobjt = dvobj, dvRefId = dvRefId });
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
            DataSourceDataResponse resultlist1 = null;
            try
            {
                resultlist1 = this.ServiceClient.Get(request);
            }
            catch (Exception e)
            {

            }
            return resultlist1;
        }

        public Dictionary<string, List<EbObjectWrapper>> FetchAllDataVisualizations(int type)
        {
            var resultlist = this.ServiceClient.Get<EbObjectObjListAllVerResponse>(new EbObjectObjLisAllVerRequest { EbObjectType = type });
            var ObjDVListAll = resultlist.Data;

            return ObjDVListAll;
        }

        public class DvObjectWithRelatedObjects
        {
            public EbDataVisualization DsObj { get; set; }

            public List<EbObjectWrapper> DvList { get; set; }

            public List<EbObjectWrapper> DvTaggedList { get; set; }
        }

    }
}

