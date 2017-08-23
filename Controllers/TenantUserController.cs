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
            List<EbObjectWrapper> dvlist = new List<EbObjectWrapper>();
            EbObjectResponse fr = null;
            var EbConfig = ViewBag.EbConfig;
           // IServiceClient client = EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            fr = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataVisualization, TenantAccountId = ViewBag.cid });
            foreach (var element in fr.Data)
                //if (element.EbObjectType==EbObjectType.DataVisualization)
                //    {
                dvlist.Add(element);
            //    }
            ViewBag.dvlist = dvlist;
            return View();
        }


        public IActionResult UserDashboard()
        {

           // IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
           //var fr = this.ServiceClient.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { Uid = ViewBag.UId, restype = "img", TenantAccountId = ViewBag.cid });
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

            return View();
        }

        [HttpPost]
        public IActionResult UserPreferences(int i)
        {
            var req = this.HttpContext.Request.Form;
           // IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var res = this.ServiceClient.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), TenantAccountId = ViewBag.cid });
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

        [HttpGet]
        public IActionResult CreateUser()
        {
           // IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var fr = this.ServiceClient.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { restype = "roles", TenantAccountId = ViewBag.cid });
            ViewBag.dict = fr.Data;
            return View();
        }

        [HttpPost]
        public IActionResult CreateUser(int itemid)
        {
            var req = this.HttpContext.Request.Form;
            var res = this.ServiceClient.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), TenantAccountId = ViewBag.cid, op = "createuser" });
            return View();
        }

        public IActionResult UserLogout()
        {
            ViewBag.Fname = null;
           // IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var abc = this.ServiceClient.Post(new Authenticate { provider = "logout", Meta = new Dictionary<string, string> { { "wc", ViewBag.wc }, { "cid", ViewBag.cid } } });
            HttpContext.Response.Cookies.Delete("Token");
            HttpContext.Response.Cookies.Delete("rToken");
            return RedirectToAction("UsrSignIn", "Ext");

        }

     

        [HttpGet]
        public IActionResult ManageRoles()
        {
            //IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.Application, TenantAccountId = ViewBag.cid});
            ViewBag.dict = resultlist.Data;
            return View();
        }

        [HttpPost]
        public IActionResult ManageRoles(int itemid)
        {
            var req = this.HttpContext.Request.Form;
            //IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);

            if (itemid > 0)
            {
                var fr = this.ServiceClient.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { id = itemid, restype = "getpermissions", TenantAccountId = ViewBag.cid });
                //ViewBag.permissions = fr.Permissions;
                ViewBag.RoleName = fr.Data["rolename"];
                ViewBag.ApplicationId = fr.Data["applicationid"];
                ViewBag.ApplicationName = fr.Data["applicationname"];
                ViewBag.Description = fr.Data["description"];
                ViewBag.DominantRefId = fr.Data["dominantrefid"];
            }

            var resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.Application, TenantAccountId = ViewBag.cid});
            ViewBag.dict = resultlist.Data;
            ViewBag.roleid = req["roleid"];

            return View();
        }

        public string GetRowAndColumn(string DominantRefiid, int ObjectType, int RoleId)
        {
           // IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            List<string> _permissionsData = new List<string>(); // FOR NEW MODE

            if (RoleId > 0)
            {
                var fr = this.ServiceClient.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { id = RoleId, restype = "getpermissions", TenantAccountId = ViewBag.cid });
                _permissionsData = fr.Permissions;
            }

            var resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { DominantId = DominantRefiid, EbObjectType = ObjectType, TenantAccountId = ViewBag.cid });
            ViewBag.dict = resultlist.Data;
            string html = @"<thead><tr><th>@Header</th></tr></thead><tbody>@tbody</tbody>";
            string header = string.Empty;
            string tbody = string.Empty;

            if (ObjectType == 11)
            {
                foreach (var Op in Enum.GetValues(typeof(EbDataVisualization.Operations)))
                    header += "<th> @Operation </th>".Replace("@Operation", Op.ToString());

                foreach (var obj in resultlist.Data)
                {
                    tbody += "<tr>";
                    tbody += "<td>{0}</td>".Fmt(obj.Name);
                    foreach (var Op in Enum.GetValues(typeof(EbDataVisualization.Operations)))
                    {
                        var perm = string.Format("{0}_{1}", obj.Id, (int)Op);
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
            var fr = this.ServiceClient.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { restype = "subroles", id = roleid, Colvalues = Dict, TenantAccountId = ViewBag.cid });

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

        public Dictionary<string, string> GetUsers(int roleid, string searchtext)
        {
            string html = string.Empty;
            string seluser = string.Empty;
            // IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            Dictionary<string, object> Dict = new Dictionary<string, object>();
            Dict["searchtext"] = searchtext;
            var fr = this.ServiceClient.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { Colvalues = Dict, restype = "getusers", id = roleid, TenantAccountId = ViewBag.cid });
            List<string> users = fr.Data.ContainsKey("users") ? fr.Data["users"].ToString().Replace("[", "").Replace("]", "").Split(new char[] { ',' }).ToList() : null;


            foreach (var key in fr.Data.Keys)
            {
                if (key == "users")
                {
                    string uid = fr.Data["users"].ToString().Replace("[", "").Replace("]", "");
                    seluser += "<div id ='@userid' class='alert alert-success columnDrag'>@users<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;'>x</button></div>".Replace("@users", fr.Data[uid].ToString()).Replace("@userid", fr.Data["users"].ToString());
                }
                else

                    html += "<div id ='@userid' class='alert alert-success columnDrag'>@users</div>".Replace("@users", fr.Data[key].ToString()).Replace("@userid", key);
                //if (key != "users")
                //{
                //    var checkedrole = users.Contains(key) ? "checked" : string.Empty;
                //    html += @"
                //<div class='row'>
                //    <div class='col-md-1'>
                //        <input type ='checkbox' @checked name ='@users' value = '@userid' aria-label='...'>
                //    </div>

                //    <div class='col-md-8'>
                //        <h4 name = 'head4' style='color:black;'>@users</h4>                        
                //    </div>               
                //</div> ".Replace("@users", fr.Data[key].ToString()).Replace("@userid", key).Replace("@checked", checkedrole);
                //}
            }
            var result = new Dictionary<string, string>();
            result.Add("Seluser", seluser);
            result.Add("Users", html);
            return result;
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
            TokenRequiredUploadResponse res= null;
            res = this.ServiceClient.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { Colvalues = Dict, op = "rbac_roles" });

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
                var fr = this.ServiceClient.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { restype = "users", TenantAccountId = ViewBag.cid });
                ViewBag.dict = fr.Data;
               
            }
            else if(type == "usergroup")
            {
                // get user groups
            }
            else
            {
                var fr = this.ServiceClient.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { restype = "roles", TenantAccountId = ViewBag.cid });
                ViewBag.dict = fr.Data;
            }
            if (ViewBag.isAjaxCall)
                return PartialView();
            else
                return View();
        }

        public IActionResult EbObjectList(EbObjectType type)
        {
            ViewBag.EbObjectType = (int)type;

            IServiceClient client = this.ServiceClient;


            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { RefId = null, VersionId = Int32.MaxValue, EbObjectType = (int)type, TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            var rlist = resultlist.Data;

            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();

            foreach (var element in rlist)
            {
                if (element.EbObjectType == type)
                    ObjList[element.Id] = element;
            }

            ViewBag.Objlist = ObjList;

            if (ViewBag.isAjaxCall)
                return PartialView();
            else
                return View();
        }


    }
}

