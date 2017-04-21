using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ServiceStack;
using ExpressBase.ServiceStack;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.IdentityModel.Tokens.Jwt;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects;
using ExpressBase.Web.Filters;

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
  

        public IActionResult UserDashboard()
        {
           
            var token = Request.Cookies["Token"];     
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var fr = client.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { Uid = ViewBag.UId, restype = "img" ,Token=token});
            //if (string.IsNullOrEmpty(ViewBag.cid))
            //{
            //    foreach (int element in fr.dict.Keys)
            //    {
            //        redisClient.Set<string>(string.Format("uid_{0}_profileimage", ViewBag.UId), fr.dict[element]);
            //    }
            //}
           
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
                    _form.Init4Redis();
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
                    _form.Init4Redis();
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

    }
}
