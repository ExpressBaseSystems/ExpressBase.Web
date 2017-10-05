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
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class DVController : EbBaseNewController
    {
        public DVController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        //[HttpGet]
        //public IActionResult DVEditor()
        //{
        //    var resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, TenantAccountId = ViewBag.cid });
        //    var rlist = resultlist.Data;
        //    Dictionary<int, EbObjectWrapper> ObjDSList = new Dictionary<int, EbObjectWrapper>();
        //    Dictionary<int, EbObjectWrapper> ObjDSListAll = new Dictionary<int, EbObjectWrapper>();
        //    Dictionary<int, string> ObjDVListAll = new Dictionary<int, string>();
        //    foreach (var element in rlist)
        //    {
        //        ObjDSListAll[element.Id] = element;
        //    }
        //    ViewBag.DSListAll = ObjDSListAll;
        //    ViewBag.DSList = ObjDSList;
        //    resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataVisualization, TenantAccountId = ViewBag.cid });
        //    rlist = resultlist.Data;
        //    foreach (var element in rlist)
        //    {
        //        ObjDVListAll[element.Id] = element.Name;
        //    }
        //    ViewBag.DVListAll = ObjDVListAll;
        //    ViewBag.Obj_id = 0;
        //    ViewBag.dsid = 0;
        //    ViewBag.tvpref = "{ }";
        //    ViewBag.isFromuser = 0;

        //    return View();
        //}

        //[HttpPost]
        //public IActionResult DVEditor(int objid)
        //{
        //    ViewBag.Obj_id = objid;

        //    var resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(objid), VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataVisualization, TenantAccountId = ViewBag.cid });
        //    var rlist = resultlist.Data;
        //    foreach (var element in rlist)
        //    {
        //        var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbDataVisualization>(element.Bytea);
        //        ViewBag.ObjectName = element.Name;
        //        ViewBag.dsid = dsobj.DataSourceRefId;
        //        if (ViewBag.wc == "dc")
        //        {
        //            //this.EbConfig.GetRedisClient().Remove(string.Format("{0}_TVPref_{1}", ViewBag.cid, ViewBag.Obj_id));
        //            ViewBag.tvpref = this.Redis.Get<string>(string.Format("{0}_TVPref_{1}", ViewBag.cid, ViewBag.Obj_id));
        //            //if (ViewBag.tvpref == null)
        //            //    ViewBag.tvpref = GetColumns(dsobj.dsid);
        //        }
        //        else
        //        {
        //            ViewBag.tvpref = this.Redis.Get<string>(string.Format("{0}_TVPref_{1}_uid_{2}", ViewBag.cid, objid, ViewBag.UId));
        //            if (ViewBag.tvpref == null)
        //                ViewBag.tvpref = this.Redis.Get<string>(string.Format("{0}_TVPref_{1}", ViewBag.cid, ViewBag.Obj_id));
        //        }
        //    }
        //    resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(ViewBag.dsid), VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, TenantAccountId = ViewBag.cid });
        //    rlist = resultlist.Data;
        //    Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();
        //    foreach (var element in rlist)
        //        ObjList[element.Id] = element;
        //    ViewBag.DSList = ObjList;

        //    resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, TenantAccountId = ViewBag.cid });
        //    rlist = resultlist.Data;
        //    Dictionary<int, EbObjectWrapper> ObjListAll = new Dictionary<int, EbObjectWrapper>();
        //    foreach (var element in rlist)
        //    {
        //        ObjListAll[element.Id] = element;
        //    }
        //    ObjListAll.Remove(ObjList.Keys.First<int>());
        //    ViewBag.DSListAll = ObjListAll;
        //    Dictionary<int, string> ObjDVListAll = new Dictionary<int, string>();
        //    resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataVisualization, TenantAccountId = ViewBag.cid });
        //    rlist = resultlist.Data;
        //    foreach (var element in rlist)
        //    {
        //        ObjDVListAll[element.Id] = element.Name;
        //    }
        //    ViewBag.DVListAll = ObjDVListAll;
        //    return View();
        //}


        [HttpGet]
        [HttpPost]
        public IActionResult dv(string objid, EbObjectType objtype)
        {
            FetchAllDataSources();
            //FetchAllDataVisualizations();
            ViewBag.ServiceUrl = this.ServiceClient.BaseUri;

            var typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();

            var _jsResult = CSharpToJs.GenerateJs<EbDataVisualizationObject>(BuilderType.DVBuilder, typeArray);

            ViewBag.Meta = _jsResult.Meta;
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
                    ViewBag.Majorv = element.MajorVersionNumber;
                    ViewBag.Minorv = element.MinorVersionNumber;
                    ViewBag.Patchv = element.PatchVersionNumber;

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
                    ViewBag.Majorv = element.MajorVersionNumber;
                    ViewBag.Minorv = element.MinorVersionNumber;
                    ViewBag.Patchv = element.PatchVersionNumber;

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
                    ViewBag.Majorv = element.MajorVersionNumber;
                    ViewBag.Minorv = element.MinorVersionNumber;
                    ViewBag.Patchv = element.PatchVersionNumber;

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

        public IActionResult dvCommon(string dvobj, string dvRefId)
        {
            return ViewComponent("DataVisualization", new { dvobjt = dvobj, dvRefId = dvRefId });
        }

        public string getdv(string id, EbObjectType objtype)
        {
            EbDataVisualization dsobj = null;
            if (id != null)
            {
                var resultlist = this.ServiceClient.Get<EbObjectExploreObjectResponse>(new EbObjectExploreObjectRequest { Id = Convert.ToInt32(id) });
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
                    ViewBag.Majorv = element.MajorVersionNumber;
                    ViewBag.Minorv = element.MinorVersionNumber;
                    ViewBag.Patchv = element.PatchVersionNumber;

                    

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
            return EbSerializers.Json_Serialize(ViewBag.dvObject);
        }

        //public PartialViewResult DataVisualisation(int dsid)
        //{
        //    var resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { Id = dsid, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, TenantAccountId = ViewBag.cid });
        //    var fdid = EbSerializers.Json_Deserialize<EbDataSource>(resultlist.Data[0].Json).FilterDialogRefId;

        //    //get fd obj
        //    resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { RefId = fdid, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.FilterDialog, TenantAccountId = ViewBag.cid });

        //    //redundant - REMOVE JITH
        //    var _filterDialog = EbSerializers.Json_Deserialize<EbFilterDialog>(resultlist.Data[0].Json);

        //    ViewBag.HtmlHead = _filterDialog.GetHead();
        //    ViewBag.HtmlBody = _filterDialog.GetHtml();

        //    string data = GetColumns(dsid);
        //    Dictionary<string, object> _dict = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, object>>(data);
        //    ViewBag.dsid = _dict["dsId"];
        //    ViewBag.dvname = _dict["dvName"];
        //    //ViewBag.FDialog = GetByteaEbObjects_json4fd(fdid);
        //    //            var xxx= @"
        //    //    <div class='tablecontainer' style='background-color:rgb(260,260,260);'>        
        //    //         <ul class='nav nav-tabs' id='table_tabs'>
        //    //                <li class='nav-item active'>
        //    //                    <a class='nav-link' href='#@tableId_tab_1' data-toggle='tab'><i class='fa fa-home' aria-hidden='true'></i>&nbsp; Home</a>
        //    //                </li>
        //    //         </ul></br>
        //    //         <div class='tab-content' id='table_tabcontent'>
        //    //             <div id='@tableId_tab_1' class='tab-pane active'>

        //    //                 <div id='TableControls_@tableId_1' class = 'well well-sm' style='margin-bottom:5px!important;'>
        //    //                    <label>@dvname</label>
        //    //                    <button id='btnGo' class='btn btn-primary' style='float: right;'>Run</button>

        //    //                </div>
        //    //                <div id='@tableId_1container'>
        //    //                    <div id='@tableId_1TableColumns4Drag' style='border:1px solid;display:none;height:100%;min-height: 400px;overflow-y: auto;'>
        //    //                    </div>         
        //    //                    <div style='width:auto;' id='@tableId_1divcont'>
        //    //                        <div id ='@tableId_1ColumnsDispaly' style= 'display:none;'class ='colCont'></div>
        //    //                        <table id='@tableId_1' class='table table-striped table-bordered'></table>
        //    //                    </div>
        //    //                    <div id='@tableId_1TableColumnsPPGrid' style='display:none;height:100%;min-height: 400px;overflow-y: auto;'></div>
        //    //                </div>
        //    //                <div id='graphcontainer_tab@tableId_1' style='display: none;'>
        //    //                <div style='height: 50px;margin-bottom: 5px!important;' class='well well-sm'>
        //    //                    <label>@dvname</label>
        //    //                    <div id = 'btnColumnCollapse@tableId_1' class='btn btn-default' style='float: right;'>
        //    //                        <i class='fa fa-cog' aria-hidden='true'></i>
        //    //                     </div>
        //    //                     <div class='dropdown' id='graphDropdown_tab@tableId_1' style='display: inline-block;padding-top: 1px;float:right'>
        //    //                             <button class='btn btn-default dropdown-toggle' type='button' data-toggle='dropdown'>
        //    //                           <span class='caret'></span></button>
        //    //                          <ul class='dropdown-menu'>
        //    //                                <li><a href =  '#'><i class='fa fa-line-chart custom'></i> Line</a></li>
        //    //                                <li><a href = '#'><i class='fa fa-bar-chart custom'></i> Bar </a></li>
        //    //                                <li><a href = '#'><i class='fa fa-area-chart custom'></i> AreaFilled </a></li>
        //    //                                <li><a href = '#'><i class='fa fa-pie-chart custom'></i> pie </a></li>
        //    //                                <li><a href = '#'> doughnut </a></li>
        //    //                                </ul>
        //    //                      </div>
        //    //                      <button id='reset_zoom@tableId_1' class='btn btn-default' style='float: right;'>Reset zoom</button>

        //    //                </div>
        //    //                <div id ='columns4Drag@tableId_1' style='display:none;'>
        //    //                    <div style='display: inline-block;'>
        //    //                        <label class='nav-header disabled'><center><strong>Columns</strong></center><center><font size='1'>Darg n Drop to X or Y Axis</font></center></label>
        //    //                        <input id='searchColumn@tableId_1' type='text' class ='form-control' placeholder='search for column'/>
        //    //                        <ul class='list-group' style='height: 450px; overflow-y: auto;'>
        //    //                         </ul>  
        //    //                    </div>
        //    //                    <div style='display: inline-block;vertical-align: top;width: 806px;'>
        //    //                        <div class='input-group'>
        //    //                          <span class='input-group-addon' id='basic-addon3'>X-Axis</span>
        //    //                          <div class='form-control' style='padding: 4px;height:33px' id ='X_col_name@tableId_1'></div>
        //    //                        </div>
        //    //                        <div class='input-group' style='padding-top: 1px;'>
        //    //                          <span class='input-group-addon' id='basic-addon3'>Y-Axis</span>
        //    //                          <div class='form-control' style='padding: 4px;height:33px' id ='Y_col_name@tableId_1'></div>
        //    //                        </div>
        //    //                    </div>
        //    //                </div>
        //    //                <canvas id='myChart@tableId_1' width='auto' height='auto'></canvas>
        //    //            </div>
        //    //          </div>
        //    //        </div>
        //    //</div>
        //    //<script>
        //    ////$.post('GetTVPref4User', { dsid: @dataSourceId }, function(data){
        //    //    var EbDataTable_@tableId = new EbDataTable({
        //    //        ds_id: @dataSourceId, 

        //    //        ss_url: '@servicestack_url', 
        //    //        tid: '@tableId_1' ,
        //    //        login:'@login',
        //    //        settings: @data,
        //    //        //fnKeyUpCallback: 
        //    //    });
        //    ////});
        //    //</script>"
        //    //.Replace("@dataSourceId", dsid.ToString().Trim())
        //    //.Replace("@tableId", "dv" + ViewBag.dsid.ToString())
        //    //.Replace("@dvname", ViewBag.dvname)
        //    //.Replace("@login", ViewBag.wc)
        //    //.Replace("@data", data)
        //    ////.Replace("@datasourcedd", this.getdropdownColumn())
        //    ////.Replace("@tableViewName", ((string.IsNullOrEmpty(this.Label)) ? "&lt;ReportLabel Undefined&gt;" : this.Label))
        //    //.Replace("@servicestack_url", "https://localhost:44377");
        //    //            //.Replace("@filters", this.filters)
        //    //            //.Replace("@FilterBH", this.FilterBH.ToString())
        //    //            //.Replace("@collapsBtn", (this.filters != null) ? @"<div id = 'btnCollapse' class='btn btn-default' data-toggle='collapse' data-target='#filterBox' aria-expanded='true' aria-controls='filterBox'>
        //    //            //                    <i class='fa fa-chevron-down' aria-hidden='true'></i>
        //    //            //                </div>" : string.Empty)
        //    //            //.Replace("@data.columns", this.ColumnColletion.ToJson())
        //    //            //.Replace("@dvId", dvid.ToString());
        //    //            // dv_id: @dvId, 
        //    //ViewBag.HtmlBody = ViewBag.HtmlBody + xxx;
        //    ViewBag.tableId = "dv" + ViewBag.dsid.ToString();
        //    ViewBag.data = data;
        //    return PartialView();
        //}



        public JsonResult SaveSettings(string json, string RefId, string type)
        {
            var req = this.HttpContext.Request.Form;
            EbDataVisualization obj = null;
            if (type == "TableVisualization")
                obj = EbSerializers.Json_Deserialize<EbTableVisualization>(json);
            else if (type == "ChartVisualization")
                obj = EbSerializers.Json_Deserialize<EbChartVisualization>(json);
            string SaveId = "";
            if (ViewBag.wc == "dc")
            {
                if (string.IsNullOrEmpty(RefId))
                {
                    var ds = new EbObject_Create_New_ObjectRequest();
                    ds.EbObjectType = (type == "TableVisualization") ? (int)EbObjectType.TableVisualization : (int)EbObjectType.ChartVisualization;
                    ds.Name = obj.Name;
                    ds.Json = json;
                    ds.Status = ObjectLifeCycleStatus.Live;
                    ds.Relations = "aaa";
                    var result = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
                    SaveId = result.RefId;
                }
                else
                {
                    var ds = new EbObject_CommitRequest();
                    ds.EbObjectType = (type == "TableVisualization") ? (int)EbObjectType.TableVisualization : (int)EbObjectType.ChartVisualization;
                    ds.Name = obj.Name;
                    ds.Json = json;
                    ds.Description = req["description"];
                    ds.Relations = req["rel_obj"];
                    ds.RefId = req["id"];
                    ds.ChangeLog = req["changeLog"];
                    var result = ServiceClient.Post<EbObject_CommitResponse>(ds);
                    SaveId = result.RefId;
                }
            }
            if (ViewBag.wc == "uc")
            {
                if (type == "TableVisualization")
                    this.Redis.Set<EbTableVisualization>(SaveId + ViewBag.UId, EbSerializers.Json_Deserialize<EbTableVisualization>(json));
                else if (type == "ChartVisualization")
                    this.Redis.Set<EbChartVisualization>(SaveId + ViewBag.UId, EbSerializers.Json_Deserialize<EbChartVisualization>(json));
            }
            else if (ViewBag.wc == "dc")
            {
                if (type == "TableVisualization")
                    this.Redis.Set<EbTableVisualization>(SaveId, EbSerializers.Json_Deserialize<EbTableVisualization>(json));
                else if (type == "ChartVisualization")
                    this.Redis.Set<EbChartVisualization>(SaveId, EbSerializers.Json_Deserialize<EbChartVisualization>(json));
            }
            return Json("Success");
        }

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

