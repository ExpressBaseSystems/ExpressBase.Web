using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.IO;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.Extensions.Options;
using ExpressBase.Web.Filters;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web2.Controllers
{
    public class TenantController : EbBaseController
    {
        public TenantController(IOptionsSnapshot<EbSetupConfig> ss_settings) : base(ss_settings) { }

        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult DBCheck()
        {
            return View();
        }

        [HttpGet]
        public IActionResult TenantDashboard()
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var fr = client.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { Uid = ViewBag.UId, restype = "img", Token = ViewBag.token });
            //if (string.IsNullOrEmpty(ViewBag.cid))
            //{
            //    foreach (int element in fr.dict.Keys)
            //    {
            //        redisClient.Set<string>(string.Format("uid_{0}_profileimage", ViewBag.UId), fr.dict[element]);
            //    }
            //}

            return View();
        }

        [HttpPost]
        public IActionResult TenantDashboard(int i)
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var res = client.Post<bool>(new DbCheckRequest { CId = Convert.ToInt32(req["id"]), DBColvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value) });
            if (res)
            {
                return View();
            }
            else
            {
                ViewBag.Message = "Error in Connection";
                return View();
            }
        }

        [HttpGet]
        public IActionResult PricingSelect()
        {
            return View();
        }

        [HttpPost]
        public IActionResult PricingSelect(int i)
        {
            var req = this.HttpContext.Request.Form;
            return RedirectToAction("TenantAddAccount", new RouteValueDictionary(new { controller = "Tenant", action = "TenantAddAccount", tier = req["tier"], id = req["tenantid"] }));
        }

        [HttpGet]
        public IActionResult TenantAddAccount()
        {
            return View();
        }

        [HttpPost]
        public IActionResult TenantAddAccount(int i)
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var res = client.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), op = "insertaccount", Token = ViewBag.token });
            if (res.id >= 0)
            {
                return RedirectToAction("TenantAccounts", new RouteValueDictionary(new { controller = "Tenant", action = "TenantAccounts", Id = req["tenantid"], aid = res.id }));
            }
            else
            {
                return View();
            }
        }

        [HttpGet]
        public IActionResult TenantAccounts()
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var fr = client.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { Uid = Convert.ToInt32(ViewBag.UId), Token = ViewBag.token });
            ViewBag.dict = fr.returnlist;
            return View();
           
        }

        [HttpPost]
        public IActionResult TenantAccounts(int i)
        {
          
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var res = client.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), op = "insertaccount", Token = ViewBag.token });
            if (res.id >= 0)
            {
                return RedirectToAction("TenantAccounts", new RouteValueDictionary(new { controller = "Tenant", action = "TenantAccounts", Id = req["tenantid"], aid = res.id }));
            }
            else
            {
                return View();
            }
        }

        public IActionResult TenantHome()
        {
            return View();
        }

        public IActionResult TenantLogout()
        {
            ViewBag.Fname = null;
            return View();
        }

        public IActionResult ResetPassword()
        {
            return View();
        }

        [HttpGet]
        public IActionResult EmailConfirmation()
        {
            return View();
        }

        [HttpPost]
        public IActionResult EmailConfirmation(int i)
        {
            //var req = this.HttpContext.Request.Form;

            //JsonServiceClient client = new JsonServiceClient("http://localhost:53125/");
            //var res = client.Post<bool>(new Services.SendMail { Emailvals= req.ToDictionary(dict => dict.Key, dict => (object)dict.Value) });
            //if (res.id >= 0)
            //{
            //    return RedirectToAction("TenantProfile", new RouteValueDictionary(new { controller = "Tenant", action = "TenantProfile", Id = res.id }));

            //}
            //else
            {
                return View();
            }
        }

        public IActionResult UserPreferences()
        {
            return View();
        }

        [HttpGet]
        public IActionResult TenantProfile()
        {
            ViewBag.logtype = HttpContext.Request.Query["t"];
            ViewBag.EbConfig = this.EbConfig;
            ViewBag.TId = Convert.ToInt32(HttpContext.Request.Query["Id"]);

            return View();
        }

        [HttpPost]
        public IActionResult TenantProfile(int i)
        {
            var req = this.HttpContext.Request.Form;
            if (Request.Form.Files.Count > 0)
            {
                var files = Request.Form.Files;

                Dictionary<string, object> dict = new Dictionary<string, object>();
                foreach (var file in files)
                {
                    if (file.Length > 0)
                    {
                        using (var fileStream = file.OpenReadStream())
                        using (var ms = new MemoryStream())
                        {
                            fileStream.CopyTo(ms);
                            var fileBytes = ms.ToArray();
                            string img = Convert.ToBase64String(fileBytes);
                            string imgbase = Convert.ToBase64String(fileBytes);
                            dict.Add("profileimg", imgbase);
                            dict.Add("id", ViewBag.UId);
                            IServiceClient imgclient = this.EbConfig.GetServiceStackClient();
                            var imgres = imgclient.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { op = "tenantimgupload", Colvalues = dict });
                        }
                    }
                }
                return View();
            }
            else
            {
                IServiceClient client = this.EbConfig.GetServiceStackClient();
                var res = client.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { op = "updatetenant", Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value) });
                if (res.id >= 0)
                {
                    return RedirectToAction("TenantDashboard", new RouteValueDictionary(new { controller = "Tenant", action = "TenantDashboard", Id = res.id }));
                }
                return View();
            }
        }
        public IActionResult marketPlace()
        {
            return View();
        }
        public IActionResult dbConfig()
        {
            return View();
        }
    }
}
