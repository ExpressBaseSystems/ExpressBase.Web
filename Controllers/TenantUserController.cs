using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ServiceStack;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects;
using ExpressBase.Web.Filters;
using ExpressBase.Data;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using ExpressBase.Web.Controllers;
using ExpressBase.Common;
using ExpressBase.Objects.ObjectContainers;
using ServiceStack.Redis;
using ExpressBase.Common.Objects;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web2.Controllers
{
    public class TenantUserController : EbBaseNewController
    {
     
        public TenantUserController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }
       

        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }


        public IActionResult DataVisualizations()
        {
            //List<EbObjectWrapper> dvlist = new List<EbObjectWrapper>();
            //EbObjectResponse fr = null;
            //var EbConfig = ViewBag.EbConfig;
            //// IServiceClient client = EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            //fr = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataVisualization, TenantAccountId = ViewBag.cid });
            //foreach (var element in fr.Data)
            //    //if (element.EbObjectType==EbObjectType.DataVisualization)
            //    //    {
            //    dvlist.Add(element);
            ////    }
            //ViewBag.dvlist = dvlist;
            return View();
        }


        public IActionResult UserDashboard()
        {

            return View();
        }

        //[HttpGet]
        //public IActionResult dv()
        //{
        //    IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
        //    var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, Token = ViewBag.token });
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
        //    resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataVisualization, Token = ViewBag.token });
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
        //public IActionResult dv(int objid)
        //{
        //    var token = Request.Cookies["Token"];
        //    ViewBag.dvid = objid;
        //    ViewBag.token = token;
        //    ViewBag.EbConfig = this.EbConfig;

        //    var redisClient = this.EbConfig.GetRedisClient();
        //    //if (ViewBag.wc == "uc")
        //    //{
        //        var tvpref = redisClient.Get<string>(string.Format("{0}_TVPref_{1}", ViewBag.cid, objid));
        //        //var result = JsonConvert.DeserializeObject<Object>(tvpref);

        //        Dictionary<string, object> _dict = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, object>>(tvpref);
        //        ViewBag.dsid = _dict["dsId"];
        //        ViewBag.dvname = _dict["dvName"];
        //        int fdid = Convert.ToInt32(_dict["fdId"]);
        //        //var obj = GetByteaEbObjects_json(fdid);
        //        ViewBag.FDialog = GetByteaEbObjects_json(fdid);  //(obj.Value as Dictionary<int, EbFilterDialog>)[fdid];
        //                                                         //ViewBag.EbForm38 = redisClient.Get<EbForm>(string.Format("form{0}", 47));
        //    //}
        //    //else if(ViewBag.wc == "dc")
        //    //{

        //    //}
        //    return View();
        //}

        //public EbFilterDialog GetByteaEbObjects_json(int objId)
        //{
        //    IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
        //    var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = objId, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.FilterDialog, TenantAccountId = ViewBag.cid, Token = ViewBag.token });
        //    var element = resultlist.Data[0];

        //    //Dictionary<int, EbFilterDialog> ObjList = new Dictionary<int, EbFilterDialog>();

        //    var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbFilterDialog>(element.Bytea);
        //    dsobj.Id = element.Id;
        //    //dsobj.EbObjectType = element.EbObjectType;
        //    //dsobj.Id = element.Id;
        //    //ObjList[element.Id] = dsobj;

        //    //return Json(ObjList);
        //    return dsobj;
        //}

        [HttpGet]
        public IActionResult UserPreferences()
        {
            var res = this.ServiceClient.Post<EditUserPreferenceResponse>(new EditUserPreferenceRequest());
            if(res.Data != null)
            {
                ViewBag.dateformat = res.Data["dateformat"];
                ViewBag.timezone = res.Data["timezone"];
                ViewBag.numformat = res.Data["numformat"];
                ViewBag.timezoneabbre = res.Data["timezoneabbre"];
                ViewBag.timezonefull = res.Data["timezonefull"];
                ViewBag.locale = res.Data["locale"];

            }

            return View();
        }

        [HttpPost]
        public IActionResult UserPreferences(int i)
        {
            var req = this.HttpContext.Request.Form;
            var res = this.ServiceClient.Post<UserPreferenceResponse>(new UserPreferenceRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value)});
            return View();
        }


        public void TVPref4User(int tvid, string json)
        {
            this.Redis.Set(string.Format("{0}_TVPref_{1}_uid_{2}", ViewBag.cid, tvid, ViewBag.UId), json);
        }

        public string GetTVPref4User(int dvid, string parameters)
        {
           // var redis = this.EbConfig.GetRedisClient();
           // var sscli = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var token = Request.Cookies[string.Format("T_{0}", ViewBag.cid)];

            //redis.Remove(string.Format("{0}_ds_{1}_columns", "eb_roby_dev", dsid));
            //redis.Remove(string.Format("{0}_TVPref_{1}_uid_{2}", ViewBag.cid, dvid, ViewBag.UId));

            var tvpref = this.Redis.Get<string>(string.Format("{0}_TVPref_{1}_uid_{2}", ViewBag.cid, dvid, ViewBag.UId));

            if (tvpref == null)
            {
                tvpref = this.Redis.Get<string>(string.Format("{0}_TVPref_{1}", ViewBag.cid, dvid));
            }

            return tvpref;
        }

        //private string GetColumn4DataTable(ColumnColletion __columnCollection)
        //{
        //    string colDef = string.Empty;
        //    colDef = "{\"dvName\": \"<Untitled>\",\"hideSerial\": false, \"hideCheckbox\": false, \"lengthMenu\":[ [100, 200, 300, -1], [100, 200, 300, \"All\"] ],";
        //    colDef += " \"scrollY\":300, \"rowGrouping\":\"\",\"leftFixedColumns\":0,\"rightFixedColumns\":0,\"columns\":[";
        //    colDef += "{\"width\":10, \"searchable\": false, \"orderable\": false, \"visible\":true, \"name\":\"serial\", \"title\":\"#\"},";
        //    colDef += "{\"width\":10, \"searchable\": false, \"orderable\": false, \"visible\":true, \"name\":\"checkbox\"},";
        //    foreach (EbDataColumn column in __columnCollection)
        //    {
        //        colDef += "{";
        //        colDef += "\"data\": " + __columnCollection[column.ColumnName].ColumnIndex.ToString();
        //        colDef += string.Format(",\"title\": \"{0}<span hidden>{0}</span>\"", column.ColumnName);
        //        var vis = (column.ColumnName == "id") ? false.ToString().ToLower() : true.ToString().ToLower();
        //        colDef += ",\"visible\": " + vis;
        //        colDef += ",\"width\": " + 100;
        //        colDef += ",\"name\": \"" + column.ColumnName + "\"";
        //        colDef += ",\"type\": \"" + column.Type.ToString() + "\"";
        //        //var cls = (column.Type.ToString() == "System.Boolean") ? "dt-center tdheight" : "tdheight";
        //        colDef += ",\"className\": \"tdheight\"";
        //        colDef += "},";
        //    }
        //    colDef = colDef.Substring(0, colDef.Length - 1) + "],";
        //    string colext = "\"columnsext\":[";
        //    colext += "{\"name\":\"serial\"},";
        //    colext += "{\"name\":\"checkbox\"},";
        //    foreach (EbDataColumn column in __columnCollection)
        //    {
        //        colext += "{";
        //        if (column.Type.ToString() == "System.Int32" || column.Type.ToString() == "System.Decimal" || column.Type.ToString() == "System.Int16" || column.Type.ToString() == "System.Int64")
        //            colext += "\"name\":\"" + column.ColumnName + "\",\"AggInfo\":true,\"DecimalPlace\":2,\"RenderAs\":\"Default\"";
        //        else if (column.Type.ToString() == "System.Boolean")
        //            colext += "\"name\":\"" + column.ColumnName + "\",\"IsEditable\":false,\"RenderAs\":\"Default\"";
        //        else if (column.Type.ToString() == "System.DateTime")
        //            colext += "\"name\":\"" + column.ColumnName + "\",\"Format\":\"Date\"";
        //        else if (column.Type.ToString() == "System.String")
        //            colext += "\"name\":\"" + column.ColumnName + "\",\"RenderAs\":\"Default\"";
        //        colext += "},";
        //    }
        //    colext = colext.Substring(0, colext.Length - 1) + "]";
        //    return colDef + colext + "}";
        //}

       

        public IActionResult Logout()
        {
            ViewBag.Fname = null;
           // IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var abc = this.ServiceClient.Post(new Authenticate { provider = "logout" });
            HttpContext.Response.Cookies.Delete("bToken");
            HttpContext.Response.Cookies.Delete("rToken");
            return RedirectToAction("UsrSignIn", "Ext");

        }

     

        [HttpGet]
        public IActionResult ManageRoles()
        {
            
            var resultlist = this.ServiceClient.Get<GetApplicationResponse>(new GetApplicationRequest());
            ViewBag.dict = resultlist.Data;    // get application from application table
            return View();
        }

        [HttpPost]
        public IActionResult ManageRoles(int itemid)
        {
            var req = this.HttpContext.Request.Form;
            //IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);

            if (itemid > 0)
            {
                var fr = this.ServiceClient.Get<GetPermissionsResponse>(new GetPermissionsRequest { id = itemid, TenantAccountId = ViewBag.cid });
                //ViewBag.permissions = fr.Permissions;
                ViewBag.RoleName = fr.Data["rolename"];
                ViewBag.ApplicationId = fr.Data["applicationid"];
                ViewBag.ApplicationName = fr.Data["applicationname"];
                ViewBag.Description = fr.Data["description"];
                ViewBag.DominantRefId = fr.Data["dominantrefid"];
            }

            //var resultlist = this.ServiceClient.Get<EbObjectObjListResponse>(new EbObjectObjListRequest {EbObjectType = (int)EbObjectType.Application});
            //ViewBag.dict = resultlist.Data;
            ViewBag.roleid = itemid;

            return View();
        }

        public string GetRowAndColumn(string ApplicationId, int ObjectType, int RoleId)
        {
           // IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            List<string> _permissionsData = new List<string>(); // FOR NEW MODE

            if (RoleId > 0)
            {
                var fr = this.ServiceClient.Get<GetPermissionsResponse>(new GetPermissionsRequest { id = RoleId, TenantAccountId = ViewBag.cid });
                _permissionsData = fr.Permissions;
            }

            var resultlist = this.ServiceClient.Get<GetApplicationObjectsResponse>(new GetApplicationObjectsRequest { Id = Convert.ToInt32(ApplicationId), objtype = ObjectType});
            ViewBag.dict = resultlist.Data;
            string html = @"<thead><tr><th>@Header</th></tr></thead><tbody>@tbody</tbody>";
            string header = string.Empty;
            string tbody = string.Empty;

            if (ObjectType == 16)
            {
                foreach (var Op in Enum.GetValues(typeof(EbTableVisualization.Operations)))
                    header += "<th> @Operation </th>".Replace("@Operation", Op.ToString());

                foreach (var obj in resultlist.Data.Keys)
                {
                    tbody += "<tr>";
                    tbody += "<td>{0}</td>".Fmt(resultlist.Data[obj]);
                    foreach (var Op in Enum.GetValues(typeof(EbTableVisualization.Operations)))
                    {
                        var perm = string.Format("{0}_{1}", obj, (int)Op);
                        var checked_string = _permissionsData.Contains(perm) ? "checked" : string.Empty;
                        tbody += "<td><input type = 'checkbox' name ='permissions' value='{0}' class='form-check-input' aria-label='...' {1}></td>".Fmt(perm, checked_string);
                    }
                    tbody += "</tr>";
                }
            }

            return html.Replace("@Header", header).Replace("@tbody", tbody);

        }
        public string GetSubRoles(int roleid, int applicationid) 
        {
            string html = string.Empty;
            // IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            Dictionary<string, object> Dict = new Dictionary<string, object>();
            Dict.Add("applicationid", applicationid);
            var fr = this.ServiceClient.Get<GetSubRolesResponse>(new GetSubRolesRequest { id = roleid, Colvalues = Dict, TenantAccountId = ViewBag.cid });

            List<string> subroles = fr.Data.ContainsKey("roles") ? fr.Data["roles"].ToString().Replace("[", "").Replace("]", "").Split(new char[] { ',' }).ToList() : new List<string>();

            foreach (var key in fr.Data.Keys)
            {
                if (key != "roles")
                {
                    var checkedrole = subroles.Contains(key) ? "checked" : string.Empty;
                    html += @"
                <div class='row'>
                    <div class='col-md-1'>
                        <input type ='checkbox' @checkedrole name = '@roles' value = '@roleid' aria-label='...'>
                    </div>

                    <div class='col-md-8'>
                        <h4 name = 'head4' style='color:black;'>@roles</h4>
                        <p class='text-justify'>dsgfds dgfrdhg dfhgdrewteberyrt reyhrtu6trujhfg reyer5y54</p>
                        <h6>
                            <i style = 'font-style:italic;' > Created by Mr X on 12/09/2017 at 02:00 pm</i>
                        </h6>
                    </div>               
                </div> ".Replace("@roles", fr.Data[key].ToString()).Replace("@roleid", key).Replace("@checkedrole", checkedrole);
                }
            }
            return html;
        }       

        public string SaveRoles(int RoleId, int ApplicationId,string RoleName, string Description, string users, string Permissions, string subrolesid) 
        {
            var req = this.HttpContext.Request.Form;
            Dictionary<string, object> Dict = new Dictionary<string, object>();
            string return_msg;
            Dict["roleid"] = RoleId;
            Dict["applicationid"] = ApplicationId;
            Dict["role_name"] = RoleName;
            Dict["Description"] = Description;
            Dict["users"] = string.IsNullOrEmpty(users) ? string.Empty : users;
            Dict["permission"] = string.IsNullOrEmpty(Permissions) ? string.Empty : Permissions;
            Dict["dependants"] = string.IsNullOrEmpty(subrolesid) ? string.Empty : subrolesid;

            //  IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);

            RBACRolesResponse res = this.ServiceClient.Post<RBACRolesResponse>(new RBACRolesRequest { Colvalues = Dict });

            if (res.id == 0)
            {
                return_msg = "Success";
            }
            else
            {
                return_msg = "Failed";
            }
            return return_msg;

        }

        public IActionResult CommonList(string type)
        {
            IServiceClient client = this.ServiceClient;
            ViewBag.ListType = type;
            if (type== "user")
            {
                var fr = this.ServiceClient.Get<GetUsersResponse>(new GetUsersRequest());
                ViewBag.dict = fr.Data;
               
            }
            else if(type == "usergroup")
            {
                var fr = this.ServiceClient.Get<GetUserGroupResponse>(new GetUserGroupRequest());
                ViewBag.dict = fr.Data;
            }
            else
            {
                var fr = this.ServiceClient.Get<GetRolesResponse>(new GetRolesRequest());
                ViewBag.dict = fr.Data;
            }
            if (ViewBag.isAjaxCall)
                return PartialView();
            else
                return View();
        }

        public string GetRoles(int userid)
        {
            string html = string.Empty;
            var fr = this.ServiceClient.Get<GetUserRolesResponse>(new GetUserRolesRequest { id = userid, TenantAccountId = ViewBag.cid });      
            List<string> subroles = fr.Data.ContainsKey("roles") ? fr.Data["roles"].ToString().Replace("[", "").Replace("]", "").Split(new char[] { ',' }).ToList() : new List<string>();

            foreach (var key in fr.Data.Keys)
            {
                if (key != "roles")
                {
                    var checkedrole = subroles.Contains(key) ? "checked" : string.Empty;
                    html += @"
                <div class='row'>
                    <div class='col-md-1'>
                        <input type ='checkbox' @checkedrole name = '@roles' value = '@roleid' aria-label='...'>
                    </div>

                    <div class='col-md-8'>
                        <h4 name = 'head4' style='color:black;'>@roles</h4>
                        <p class='text-justify'>dsgfds dgfrdhg dfhgdrewteberyrt reyhrtu6trujhfg reyer5y54</p>
                        <h6>
                            <i style = 'font-style:italic;' > Created by Mr X on 12/09/2017 at 02:00 pm</i>
                        </h6>
                    </div>               
                </div> ".Replace("@roles", fr.Data[key].ToString()).Replace("@roleid", key).Replace("@checkedrole", checkedrole);
                }
            }
            return html;
        }

        public string GetRoleUsers(int roleid)
        {
           
            string html = string.Empty;
            var fr = this.ServiceClient.Get<GetUsersRoleResponse>(new GetUsersRoleRequest {id = roleid, TenantAccountId = ViewBag.cid });

            foreach (var key in fr.Data.Keys)
            {
                html += "<div id ='@userid' class='alert alert-success columnDrag'>@users<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;'>x</button></div>".Replace("@users", fr.Data[key].ToString()).Replace("@userid", key);              
            }
            return html;
        }

        [HttpGet]
        public IActionResult UserGroups()
        {
            return View();
        }

        [HttpPost]
        public IActionResult UserGroups(int itemid)
        {
            var req = this.HttpContext.Request.Form;
            if(itemid > 0)
            {
                var fr = this.ServiceClient.Get<GetUserGroupResponse>(new GetUserGroupRequest { id = itemid,TenantAccountId = ViewBag.cid });
                List<int> userlist = fr.Data.ContainsKey("userslist") ? fr.Data["userslist"].ToString().Replace("[","").Replace("]","").Split(',').Select(int.Parse).ToList(): new List<int>();
                ViewBag.UGName = fr.Data["name"];
                ViewBag.UGDescription = fr.Data["description"];
                ViewBag.itemid = itemid;
                string html = "";
                if (fr.Data.ContainsKey("userslist"))
                {
                    foreach(var element in userlist)
                    {
                        html += "<div id ='@userid' class='alert alert-success columnDrag'>@users<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;'>x</button></div>".Replace("@users", fr.Data[element.ToString()].ToString()).Replace("@userid", element.ToString());
                    }
                    
                }
                ViewBag.UserList = html;

            }
            else
            {
                int groupid = string.IsNullOrEmpty(req["groupid"]) ? 0 : Convert.ToInt32(req["groupid"]);
                CreateUserGroupResponse res = this.ServiceClient.Post<CreateUserGroupResponse>(new CreateUserGroupRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value),Id = groupid });
            }          
            return View();
        }

        public string GetUserGroups(int userid)
        {
            string html = string.Empty;
            var fr = this.ServiceClient.Get<GetUser2UserGroupResponse>(new GetUser2UserGroupRequest {id= userid, TenantAccountId = ViewBag.cid });
            List<string> usergrouplist = fr.Data.ContainsKey("usergroups") ? fr.Data["usergroups"].ToString().Replace("[", "").Replace("]", "").Split(new char[] { ',' }).ToList() : new List<string>();

            foreach (var key in fr.Data.Keys)
            {
                if (key != "usergroups")
                {
                    var checkedrole = usergrouplist.Contains(key) ? "checked" : string.Empty;
                    html += @"
                <div class='row'>
                    <div class='col-md-1'>
                        <input type ='checkbox' @checkedrole name = '@usergroup' value = '@id' aria-label='...'>
                    </div>

                    <div class='col-md-8'>
                        <h4 name = 'head4' style='color:black;'>@usergroup</h4>
                        <p class='text-justify'>dsgfds dgfrdhg dfhgdrewteberyrt reyhrtu6trujhfg reyer5y54</p>
                        <h6>
                            <i style = 'font-style:italic;' > Created by Mr X on 12/09/2017 at 02:00 pm</i>
                        </h6>
                    </div>               
                </div> ".Replace("@usergroup", fr.Data[key].ToString()).Replace("@id", key).Replace("@checkedrole", checkedrole);
                }
            }
            return html;
        }

        [HttpGet]
        public IActionResult CreateUser()
        {
            return View();
        }

        [HttpPost]
        public IActionResult CreateUser(int itemid)
        {
            if(itemid > 0)
            {
                var fr = this.ServiceClient.Get<GetUserEditResponse>(new GetUserEditRequest { Id = itemid, TenantAccountId = ViewBag.cid });
                ViewBag.Name = fr.Data["name"];
                ViewBag.email = fr.Data["email"];
                ViewBag.itemid = itemid;
            }
            return View();
        }

        public void SaveUser(int userid,string roles,string usergroups)
        {
            var req = this.HttpContext.Request.Form;
            Dictionary<string, object> Dict = new Dictionary<string, object>();
          
            Dict["firstname"] = req["firstname"];
            Dict["email"] = req["email"];
            Dict["pwd"] = req["pwd"];
            Dict["roles"] = string.IsNullOrEmpty(roles) ? string.Empty : roles;
            Dict["group"] = string.IsNullOrEmpty(usergroups) ? string.Empty : usergroups;

            //  IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);

            CreateUserResponse res = this.ServiceClient.Post<CreateUserResponse>(new CreateUserRequest {Id = userid, Colvalues = Dict });

        }

    }
}

