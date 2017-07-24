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

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web2.Controllers
{
    public class TenantUserController : EbBaseController
    {
        private readonly EbSetupConfig EbConfig;

        public TenantUserController(IOptionsSnapshot<EbSetupConfig> ss_settings) : base(ss_settings)
        {
            this.EbConfig = ss_settings.Value;
        }

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
            IServiceClient client = EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            fr = client.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataVisualization, Token = ViewBag.token });
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

            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var fr = client.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { Uid = ViewBag.UId, restype = "img", Token = ViewBag.token });
            return View();
        }

        public IActionResult dv(int dvid)
        {
            var token = Request.Cookies["Token"];
            ViewBag.dvid = dvid;
            ViewBag.token = token;
            ViewBag.EbConfig = this.EbConfig;

            var redisClient = this.EbConfig.GetRedisClient();
            var tvpref = redisClient.Get<string>(string.Format("{0}_TVPref_{1}", ViewBag.cid, dvid));
            //var result = JsonConvert.DeserializeObject<Object>(tvpref);

            Dictionary<string, object> _dict = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, object>>(tvpref);
            ViewBag.dsid = _dict["dsId"];
            ViewBag.dvname = _dict["dvName"];
            int fdid = Convert.ToInt32(_dict["fdId"]);
            //var obj = GetByteaEbObjects_json(fdid);
            ViewBag.FDialog = GetByteaEbObjects_json(fdid);  //(obj.Value as Dictionary<int, EbFilterDialog>)[fdid];
            //ViewBag.EbForm38 = redisClient.Get<EbForm>(string.Format("form{0}", 47));
            return View();
        }

        public EbFilterDialog GetByteaEbObjects_json(int objId)
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = objId, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.FilterDialog, TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            var element = resultlist.Data[0];

            //Dictionary<int, EbFilterDialog> ObjList = new Dictionary<int, EbFilterDialog>();

            var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbFilterDialog>(element.Bytea);
            dsobj.Id = element.Id;
            //dsobj.EbObjectType = element.EbObjectType;
            //dsobj.Id = element.Id;
            //ObjList[element.Id] = dsobj;

            //return Json(ObjList);
            return dsobj;
        }

        [HttpGet]
        public IActionResult UserPreferences()
        {

            return View();
        }

        [HttpPost]
        public IActionResult UserPreferences(int i)
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var res = client.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), Token = ViewBag.token });
            return View();
        }


        public void TVPref4User(int tvid, string json)
        {
            this.EbConfig.GetRedisClient().Set(string.Format("{0}_TVPref_{1}_uid_{2}", ViewBag.cid, tvid, ViewBag.UId), json);
        }

        public string GetTVPref4User(int dvid, string parameters)
        {
            var redis = this.EbConfig.GetRedisClient();
            var sscli = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var token = Request.Cookies[string.Format("T_{0}", ViewBag.cid)];

            //redis.Remove(string.Format("{0}_ds_{1}_columns", "eb_roby_dev", dsid));
            //redis.Remove(string.Format("{0}_TVPref_{1}_uid_{2}", ViewBag.cid, dvid, ViewBag.UId));

            var tvpref = redis.Get<string>(string.Format("{0}_TVPref_{1}_uid_{2}", ViewBag.cid, dvid, ViewBag.UId));

            if (tvpref == null)
            {
                tvpref = redis.Get<string>(string.Format("{0}_TVPref_{1}", ViewBag.cid, dvid));
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
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var fr = client.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { restype = "roles", Token = ViewBag.token });
            ViewBag.dict = fr.Data;
            return View();
        }

        [HttpPost]
        public IActionResult CreateUser(int i)
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var res = client.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), Token = ViewBag.token, op = "createuser" });
            return View();
        }

        public IActionResult UserLogout()
        {
            ViewBag.Fname = null;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var abc = client.Post(new Authenticate { provider = "logout" });
            HttpContext.Response.Cookies.Delete("Token");
            HttpContext.Response.Cookies.Delete("rToken");
            return RedirectToAction("UsrSignIn", "Ext");

        }

        [HttpGet]
        public IActionResult EbRoles()
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var fr = client.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { restype = "roles", Token = ViewBag.token });
            ViewBag.dict = fr.Data;
            return View();
        }

        [HttpGet]
        public IActionResult ManageRoles()
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.Application, TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            ViewBag.dict = resultlist.Data;
            return View();
        }

        [HttpPost]
        public IActionResult ManageRoles(int roleid)
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            
            if (roleid > 0)
            {
                var fr = client.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { id = roleid, restype = "getpermissions", Token = ViewBag.token });
                //ViewBag.permissions = fr.Permissions;
                ViewBag.RoleName = fr.Data["rolename"];
                ViewBag.ApplicationId = fr.Data["applicationid"];
                ViewBag.ApplicationName = fr.Data["applicationname"];
            }
                 
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.Application, TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            ViewBag.dict = resultlist.Data;
            ViewBag.roleid = req["roleid"];

            return View();
        }


        public string GetRowAndColumn(int ApplicationId, int ObjectType,int RoleId)
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            List<string> _permissionsData = new List<string>(); // FOR NEW MODE

            if (RoleId > 0)
            {
                var fr = client.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { id = RoleId, restype = "getpermissions", Token = ViewBag.token });
                _permissionsData = fr.Permissions;
            }

            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { DominantId = ApplicationId, EbObjectType = ObjectType, TenantAccountId = ViewBag.cid, Token = ViewBag.token });
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

        public string SaveRoles(string[] Permissions, string RoleName,int ApplicationId)
        {
            var req = this.HttpContext.Request.Form;
            Dictionary<string, object> Dict = new Dictionary<string, object>();
            string return_msg;
            Dict["role_name"] = RoleName;
            Dict["permission"] = Permissions;
            Dict["applicationid"] = ApplicationId;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var res = client.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { Colvalues = Dict, Token = ViewBag.token, op = "saveroles" });
            if(res.id>0)
            {
                return_msg = "Success";
            }
            else
            {
                return_msg = "Failed";
            }
            return return_msg;

        }
    }
}

