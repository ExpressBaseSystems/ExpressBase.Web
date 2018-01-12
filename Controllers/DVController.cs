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
    public class DVController : EbBaseIntController
    {
        public DVController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        [HttpGet][HttpPost]
        public IActionResult dv( string refid, string rowData, string filterValues, int tabNum)
        {
            //string objid, EbObjectType objtype
            ViewBag.ServiceUrl = this.ServiceClient.BaseUri;

            User _user = this.Redis.Get<User>(string.Format("{0}-{1}-{2}", ViewBag.cid, ViewBag.email, ViewBag.wc));
            ViewBag.user = _user;

            var typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DVBuilder, typeof(EbDataVisualizationObject));

            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectType = _jsResult.EbObjectTypes;

            var resultlist = this.ServiceClient.Get<EbObjectWithRelatedDVResponse>(new EbObjectWithRelatedDVRequest { Refid = refid , Ids = _user.EbObjectIds.ToString()});
            var dsobj = resultlist.Dsobj;
            dsobj.AfterRedisGet(this.Redis);
            ViewBag.dvObject = dsobj;
            ViewBag.dvRefId = refid;
            ViewBag.rowData = rowData;
            ViewBag.filterValues = filterValues;
            ViewBag.tabNum = tabNum;
            ViewBag.DvList =JsonConvert.SerializeObject( resultlist.DvList);
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

        public Dictionary<string, List<EbObjectWrapper>> FetchAllDataVisualizations(EbObjectType type)
        {
            var resultlist = this.ServiceClient.Get<EbObjectObjListAllVerResponse>(new EbObjectObjLisAllVerRequest { EbObjectType = Convert.ToInt32(type) });
            var ObjDVListAll = resultlist.Data;

            return ObjDVListAll;
        }

    }
}

