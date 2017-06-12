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
            List<EbObjectWrapper> dslist = new List<EbObjectWrapper>();
            EbObjectResponse fr = null;
            var EbConfig = ViewBag.EbConfig;
            IServiceClient client = EbConfig.GetServiceStackClient();
            fr = client.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, Token = ViewBag.token });
            foreach(var element in fr.Data)
            if (element.EbObjectType==EbObjectType.DataSource)
                {
                    dslist.Add(element);
                }
            ViewBag.dvlist = dslist;
            return View();
        }
        

        public IActionResult UserDashboard()
        {
             
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var fr = client.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { Uid = ViewBag.UId, restype = "img" ,Token=ViewBag.token });         
            return View();
        }

        [HttpGet]
        public IActionResult f(int fid, int id)
        {
            var token = Request.Cookies["Token"];
            var handler = new JwtSecurityTokenHandler();
            var tokenS = handler.ReadToken(token) as JwtSecurityToken;
            ViewBag.EbConfig = this.EbConfig;
            ViewBag.Fname = tokenS.Claims.First(claim => claim.Type == "Fname").Value;
            ViewBag.cid = tokenS.Claims.First(claim => claim.Type == "cid").Value;
            ViewBag.token = token;

            var redisClient = this.EbConfig.GetRedisClient();
            redisClient.Set<string>("token", token);
            Objects.EbForm _form = null;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var fr = client.Get<EbObjectResponse>(new EbObjectRequest { Id = fid, Token = token });
            if (id > 0)
            {
                if (fr.Data.Count > 0)
                {
                    _form = Common.EbSerializers.ProtoBuf_DeSerialize<EbForm>(fr.Data[0].Bytea);
                    _form.Init4Redis(this.EbConfig.GetRedisClient(), this.EbConfig.GetServiceStackClient());
                    _form.IsUpdate = true;
                    redisClient.Set<EbForm>(string.Format("form{0}", fid), _form);
                }
                string html = string.Empty;
                var vr = client.Get<ViewResponse>(new View { TableId = _form.Table.Id, ColId = id, FId = fid });
                redisClient.Set<EbForm>("cacheform", vr.ebform);
                ViewBag.EbForm = vr.ebform;
                ViewBag.FormId = fid;
                ViewBag.DataId = id;
                return View();
            }
            else
            {
                if (fr.Data.Count > 0)
                {
                    _form = Common.EbSerializers.ProtoBuf_DeSerialize<EbForm>(fr.Data[0].Bytea);
                    _form.Init4Redis(this.EbConfig.GetRedisClient(), this.EbConfig.GetServiceStackClient());
                    _form.IsUpdate = false;
                    redisClient.Set<EbForm>(string.Format("form{0}", fid), _form);
                }
                ViewBag.EbForm = _form;
                ViewBag.FormId = fid;
                ViewBag.DataId = id;
                ViewBag.EbForm38 = redisClient.Get<EbForm>(string.Format("form{0}", 38));
                return View();
            }
        }

        [HttpPost]
        public IActionResult f()
        {

            var req = this.HttpContext.Request.Form;
            var fid = Convert.ToInt32(req["fId"]);

            var redisClient = this.EbConfig.GetRedisClient();
            ViewBag.EbConfig = this.EbConfig;
            Objects.EbForm _form = redisClient.Get<Objects.EbForm>(string.Format("form{0}", fid));
            bool b = _form.IsUpdate;
            ViewBag.EbForm = _form;
            ViewBag.FormId = fid;
            ViewBag.formcollection = req as FormCollection;
          
            return View();
        }

        public IActionResult dv(int dsid)
        {
            var token = Request.Cookies["Token"];
            ViewBag.dsid = dsid;
            ViewBag.token = token;
            ViewBag.EbConfig = this.EbConfig;

            var redisClient = this.EbConfig.GetRedisClient();
            ViewBag.EbForm38 = redisClient.Get<EbForm>(string.Format("form{0}", 47));

            return View();
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
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var res = client.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), Token = ViewBag.token });

            return View();
        }
        public IActionResult TenantLogout()
        {
            ViewBag.Fname = null;
            return RedirectToAction("TenantSignup", "TenantExt");
        }

        public void TVPref4User(int tvid, string json)
        {
            this.EbConfig.GetRedisClient().Set(string.Format("{0}_TVPref_{1}_uid_{2}", ViewBag.cid, tvid, ViewBag.UId), json);
        }

        public string GetTVPref4User(int dsid, string parameters)
        {
            var redis = this.EbConfig.GetRedisClient();
            var sscli = this.EbConfig.GetServiceStackClient();
            var token = Request.Cookies[string.Format("T_{0}",ViewBag.cid)];

            //redis.Remove(string.Format("{0}_ds_{1}_columns", "eb_roby_dev", dsid));
            //redis.Remove(string.Format("{0}_TVPref_{1}_uid_{2}", "eb_roby_dev", dsid, 1));

            var tvpref = redis.Get<string>(string.Format("{0}_TVPref_{1}_uid_{2}", ViewBag.cid, dsid, ViewBag.TUId));

            //if (tvpref == null)
            //{
            //    var columnColletion = redis.Get<ColumnColletion>(string.Format("{0}_ds_{1}_columns", "eb_roby_dev", dsid));
            //    if (columnColletion == null)
            //    {
            //        var paramsList = new List<Dictionary<string, string>>();
            //        Newtonsoft.Json.Linq.JArray ja = JsonConvert.DeserializeObject<dynamic>(parameters);
            //        foreach (Newtonsoft.Json.Linq.JToken jt in ja)
            //        {
            //            var _dict = new Dictionary<string, string>();
            //            foreach (Newtonsoft.Json.Linq.JProperty jp in jt.Children())
            //                _dict.Add(jp.Name, jp.Value.ToString());
            //            paramsList.Add(_dict);
            //        }
            //        var resp = sscli.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { Id = dsid, Params = paramsList, Token = token, TenantAccountId = "eb_roby_dev" });
            //        columnColletion = resp.Columns;
            //    }

            //    tvpref = this.GetColumn4DataTable(columnColletion);
            //    redis.Set(string.Format("{0}_TVPref_{1}_uid_{2}", "eb_roby_dev", dsid, 1), tvpref);
            //}

            return tvpref;
        }

        private string GetColumn4DataTable(ColumnColletion __columnCollection)
        {
            string colDef = string.Empty;
            colDef = "{\"dvName\": \"<Untitled>\",\"hideSerial\": false, \"hideCheckbox\": false, \"lengthMenu\":[ [100, 200, 300, -1], [100, 200, 300, \"All\"] ],";
            colDef += " \"scrollY\":300, \"rowGrouping\":\"\",\"leftFixedColumns\":0,\"rightFixedColumns\":0,\"columns\":[";
            colDef += "{\"width\":10, \"searchable\": false, \"orderable\": false, \"visible\":true, \"name\":\"serial\", \"title\":\"#\"},";
            colDef += "{\"width\":10, \"searchable\": false, \"orderable\": false, \"visible\":true, \"name\":\"checkbox\"},";
            foreach (EbDataColumn column in __columnCollection)
            {
                colDef += "{";
                colDef += "\"data\": " + __columnCollection[column.ColumnName].ColumnIndex.ToString();
                colDef += string.Format(",\"title\": \"{0}<span hidden>{0}</span>\"", column.ColumnName);
                var vis = (column.ColumnName == "id") ? false.ToString().ToLower() : true.ToString().ToLower();
                colDef += ",\"visible\": " + vis;
                colDef += ",\"width\": " + 100;
                colDef += ",\"name\": \"" + column.ColumnName + "\"";
                colDef += ",\"type\": \"" + column.Type.ToString() + "\"";
                //var cls = (column.Type.ToString() == "System.Boolean") ? "dt-center tdheight" : "tdheight";
                colDef += ",\"className\": \"tdheight\"";
                colDef += "},";
            }
            colDef = colDef.Substring(0, colDef.Length - 1) + "],";
            string colext = "\"columnsext\":[";
            colext += "{\"name\":\"serial\"},";
            colext += "{\"name\":\"checkbox\"},";
            foreach (EbDataColumn column in __columnCollection)
            {
                colext += "{";
                if (column.Type.ToString() == "System.Int32" || column.Type.ToString() == "System.Decimal" || column.Type.ToString() == "System.Int16" || column.Type.ToString() == "System.Int64")
                    colext += "\"name\":\"" + column.ColumnName + "\",\"AggInfo\":true,\"DecimalPlace\":2,\"RenderAs\":\"Default\"";
                else if (column.Type.ToString() == "System.Boolean")
                    colext += "\"name\":\"" + column.ColumnName + "\",\"IsEditable\":false,\"RenderAs\":\"Default\"";
                else if (column.Type.ToString() == "System.DateTime")
                    colext += "\"name\":\"" + column.ColumnName + "\",\"Format\":\"Date\"";
                else if (column.Type.ToString() == "System.String")
                    colext += "\"name\":\"" + column.ColumnName + "\",\"RenderAs\":\"Default\"";
                colext += "},";
            }
            colext = colext.Substring(0, colext.Length - 1) + "]";
            return colDef + colext + "}";
        }

       
    }
}
        
