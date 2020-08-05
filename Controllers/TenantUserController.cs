  using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Data;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security.Core;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web.Controllers;
using ExpressBase.Web.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace ExpressBase.Web2.Controllers
{
    public class TenantUserController : EbBaseIntCommonController
    {
        public TenantUserController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [EbBreadCrumbFilter()]
        [HttpGet("UserDashBoard")]
        public IActionResult UserDashboard()
        {
            if (ViewBag.UId > 1 || ViewBag.cide == "demo")
            {
                Type[] typeArray = typeof(EbDashBoardWraper).GetTypeInfo().Assembly.GetTypes();
                Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DashBoard, typeof(EbDashBoardWraper), typeof(EbObject));
                try
                {
                    Console.WriteLine("############################ ======------Google Key : " + Environment.GetEnvironmentVariable(EnvironmentConstants.AL_GOOGLE_MAP_KEY));
                    ViewBag.al_arz_map_key = Environment.GetEnvironmentVariable(EnvironmentConstants.AL_GOOGLE_MAP_KEY);
                }
                catch (Exception e)
                {
                    Console.WriteLine("key not found" + e.Message + e.StackTrace);
                }

                ViewBag.Meta = _jsResult.AllMetas;
                ViewBag.JsObjects = _jsResult.JsObjects;
                ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;

                GetUserDashBoardObjectsResponse Resp = this.ServiceClient.Post(new GetUserDashBoardObjectsRequest
                {
                    ObjectIds = this.LoggedInUser.GetDashBoardIds(),
                    SolutionOwner = (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) || this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString())) ? true : false
                });

                if (Resp.DashBoardObjectIds.Count != 0)
                {
                    ViewBag.ObjType = 22;
                    ViewBag.ControlOperations = EbControlContainer.GetControlOpsJS((new EbWebForm()) as EbControlContainer, BuilderType.WebForm);
                    ViewBag.AllDashBoard = JsonConvert.SerializeObject(Resp.DashBoardObjectIds, new JsonSerializerSettings
                    {
                        TypeNameHandling = TypeNameHandling.All
                    });
                    try
                    {
                        ViewBag.GetObjectId = Resp.DashBoardObjectIds[this.LoggedInUser.Preference.DefaultDashBoard];
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine("Default Dashboard not found" + e.Message + e.StackTrace);
                        ViewBag.GetObjectId = null;
                    }
                    if (this.LoggedInUser.Preference.DefaultDashBoard != null && this.LoggedInUser.Preference.DefaultDashBoard != string.Empty && ViewBag.GetObjectId != null)
                    {
                        ViewBag.GetObjectId = Resp.DashBoardObjectIds[this.LoggedInUser.Preference.DefaultDashBoard];
                        ViewBag.VersionNumber = ViewBag.GetObjectId.VersionNumber;
                        ViewBag.dsObj = EbSerializers.Json_Serialize(ViewBag.GetObjectId);
                        ViewBag.Status = ViewBag.GetObjectId.Status;
                    }
                    else
                    {
                        ViewBag.GetObjectId = Resp.DashBoardObjectIds.ElementAt(0);
                        ViewBag.VersionNumber = ViewBag.GetObjectId.Value.VersionNumber;
                        ViewBag.dsObj = EbSerializers.Json_Serialize(ViewBag.GetObjectId.Value);
                        ViewBag.Status = ViewBag.GetObjectId.Value.Status;
                        //ViewBag.DashBoardObjects = Resp.DashBoardObjectIds;
                    }
                }
                return View();
            }
            else
                return Redirect("/StatusCode/404");
        }

        [HttpGet]
        public IActionResult getSidebarMenu(int LocId)
        {
            return ViewComponent("EbQuickMenu", new { solnid = ViewBag.cid, email = ViewBag.email, console = ViewBag.wc, locid = LocId });
        }

        [HttpPost]
        public bool AddFavourite(int objid)
        {
            return this.ServiceClient.Post<AddFavouriteResponse>(new AddFavouriteRequest { ObjId = objid }).Status;
        }

        [HttpPost]
        public bool RemoveFavourite(int objid)
        {
            return this.ServiceClient.Post<RemoveFavouriteResponse>(new RemoveFavouriteRequest { ObjId = objid }).Status;
        }

        public IActionResult Logout()
        {
            ViewBag.Fname = null;
            var abc = this.ServiceClient.Post(new Authenticate
            {
                provider = "logout",
                Meta = new Dictionary<string, string> {
                    { TokenConstants.CID, ViewBag.cid }
                }
            });
            HttpContext.Response.Cookies.Delete(RoutingConstants.BEARER_TOKEN);
            HttpContext.Response.Cookies.Delete(RoutingConstants.REFRESH_TOKEN);
            HttpContext.Response.Cookies.Delete(TokenConstants.USERAUTHID);
            return Redirect("/");
        }

        [HttpPost]
        public int CreateConfig(EbLocationCustomField conf)
        {
            CreateLocationConfigResponse resp = ServiceClient.Post<CreateLocationConfigResponse>(new CreateLocationConfigRequest { Conf = conf });
            return resp.Id;
        }

        [EbBreadCrumbFilter("Locations")]
        [HttpGet]
        public IActionResult EbLocations(int id)
        {
            Type[] typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DVBuilder, typeof(EbDataVisualizationObject));
            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;

            var resp = this.ServiceClient.Get<LocationInfoResponse>(new LocationInfoRequest { });
            ViewBag.Config = JsonConvert.SerializeObject(resp.Config);
            ViewBag.LocCount = resp.Locations.Count;
            ViewBag.LocType = resp.LocationTypes;
            return View();
        }

        [HttpPost]
        public int CreateLocation(string locid, string lname, string sname, string img, string meta)
        {
            if (img == null)
                img = "../img";
            var resp = ServiceClient.Post<SaveLocationMetaResponse>(new SaveLocationMetaRequest { Locid = Convert.ToInt32(locid), Longname = lname, Shortname = sname, Img = img, ConfMeta = meta });
            return resp.Id;
        }


        public int CreateLocationH(EbLocation loc)
        {
            if (loc.Logo == null)
                loc.Logo = "../img";
            SaveLocationResponse resp = ServiceClient.Post<SaveLocationResponse>(new SaveLocationRequest { Location = loc });
            return resp.Id;
        }

        public int DeletelocConf(int id)
        {
            DeleteLocResponse resp = ServiceClient.Post<DeleteLocResponse>(new DeleteLocRequest { Id = id });
            return resp.id;
        }

        public CreateLocationTypeResponse CreateLocationType(EbLocationType loctype)
        {
            CreateLocationTypeResponse resp = this.ServiceClient.Post(new CreateLocationTypeRequest { LocationType = loctype });
            return resp;
        }

        public DeleteLocationTypeResponse DeleteLocationType(int id)
        {
            DeleteLocationTypeResponse resp = this.ServiceClient.Post(new DeleteLocationTypeRequest { Id = id });
            return resp;
        }

        public string GetLocationTree()
        {
            ListSqlJobsResponse resp = new ListSqlJobsResponse();
            string query = @"SELECT id, TRIM (longname) as longname, shortname, image, parent_id, (CASE WHEN is_group = 'F' THEN false ELSE true END) as is_group,
            eb_location_types_id, meta_json  FROM eb_locations WHERE COALESCE(eb_del,'F') = 'F';";
            string[] arrayy = new string[] { "id", "longname", "shortname", "image", "parent_id", "is_group", "eb_location_types_id", "meta_json" };
            DVColumnCollection DVColumnCollection = GetColumnsForLocationTree(arrayy);            
            EbDataVisualization Visualization = new EbTableVisualization { Sql = query, Columns = DVColumnCollection, AutoGen = false, IsPaging = false };
            return EbSerializers.Json_Serialize(Visualization);
        }

        public DVColumnCollection GetColumnsForLocationTree(string[] strArray)
        {
            var Columns = new DVColumnCollection();
            try
            {
                foreach (string str in strArray)
                {
                    DVBaseColumn _col = null;
                    if (str == "id")
                        _col = new DVNumericColumn { Data = 0, Name = str, sTitle = str, Type = EbDbTypes.Int32, bVisible = false };
                    if (str == "longname")
                        _col = new DVStringColumn
                        {
                            Data = 1,
                            Name = str,
                            sTitle = "Long Name",
                            Type = EbDbTypes.String,
                            bVisible = true,
                            RenderAs = StringRenderType.Tree,
                            ParentColumn = new List<DVBaseColumn>(),
                            GroupingColumn = new List<DVBaseColumn>(),
                            GroupFormId = new List<DVBaseColumn>(),
                            IsTree = true,
                            NeedAlphabeticOrder = true
                        };
                    if (str == "shortname")
                        _col = new DVStringColumn { Data = 2, Name = str, sTitle = "Short Name", Type = EbDbTypes.String, bVisible = true };
                    if (str == "image")
                        _col = new DVStringColumn { Data = 3, Name = str, sTitle = "Logo", Type = EbDbTypes.String, bVisible = true };
                    if (str == "parent_id")
                        _col = new DVNumericColumn { Data = 4, Name = str, sTitle = str, Type = EbDbTypes.Int32, bVisible = false };
                    if (str == "is_group")
                        _col = new DVBooleanColumn { Data = 5, Name = str, sTitle = str, Type = EbDbTypes.Boolean, bVisible = false };
                    if (str == "eb_location_types_id")
                        _col = new DVNumericColumn { Data = 6, Name = str, sTitle = str, Type = EbDbTypes.Boolean, bVisible = false };
                    if (str == "meta_json")
                        _col = new DVStringColumn { Data = 7, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = false };

                    _col.Name = str;
                    _col.RenderType = _col.Type;
                    _col.ClassName = "tdheight";
                    _col.Font = null;
                    _col.Align = Align.Left;
                    Columns.Add(_col);
                }
                Columns.Get("longname").ParentColumn.Add(Columns.Get("parent_id"));
                Columns.Get("longname").GroupingColumn.Add(Columns.Get("is_group"));
                Columns.Get("longname").GroupFormId.Add(Columns.Get("id"));
            }
            catch (Exception e)
            {
                Console.WriteLine("no coloms" + e.StackTrace);
            }

            return Columns;
        }

        [HttpGet("/scan")]
        public IActionResult SolutionQrScan()
        {
            return View();
        }
    }
}

