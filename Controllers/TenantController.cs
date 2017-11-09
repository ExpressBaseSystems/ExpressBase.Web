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
using ExpressBase.Common;
using ExpressBase.Objects;
using System.Net;
using ServiceStack.Text;
using ExpressBase.Data;
using System.Text.RegularExpressions;
using System.Collections;
using ServiceStack.Redis;
using ExpressBase.Security;



// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class TenantController : EbBaseNewController
    {
        public TenantController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult ProfileSetup()
        {
            User _user = new User();
            _user = this.Redis.Get<User>(string.Format("{0}-{1}-{2}", ViewBag.cid, ViewBag.email, ViewBag.wc));
            ViewBag.ImgSrc = _user.Proimg;
            return View();
        }

        [HttpPost]
        public IActionResult ProfileSetup(int i)
        {
           
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.ServiceClient;
            var res = client.Post<CreateAccountResponse>(new CreateAccountRequest { op = "updatetenant", Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), Token = ViewBag.token });
            if (res.id >= 0)
            {
                return RedirectToAction("TenantDashboard","Tenant");
            }

            return View();
        }

      
        public IActionResult TenantDashboard()
        {
            return View();
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
            
              return View();
          
        }

        [HttpGet]
        public IActionResult TenantAccounts()
        {
            IServiceClient client = this.ServiceClient;
            var fr = client.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { Uid = Convert.ToInt32(ViewBag.UId), Token = ViewBag.token });
            ViewBag.dict = fr.returnlist;
            return View();

        }

        [HttpPost]
        public IActionResult TenantAccounts(int i)
        {

            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.ServiceClient;
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

        public IActionResult Logout()
        {
            ViewBag.Fname = null;
            IServiceClient client = this.ServiceClient;
            var abc = client.Post(new Authenticate { provider = "logout" });
            HttpContext.Response.Cookies.Delete("bToken");
            HttpContext.Response.Cookies.Delete("rToken");
            return RedirectToAction("Index", "Ext");

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

            {
                return View();
            }
        }

        [HttpGet]
        public IActionResult TenantProfile()
        {
            ViewBag.logtype = HttpContext.Request.Query["t"];
            ViewBag.TId = Convert.ToInt32(HttpContext.Request.Query["Id"]);

            return View();
        }

        [HttpPost]
        public IActionResult TenantProfile(int i)
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.ServiceClient;
            var res = client.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { op = "updatetenant", Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), Token = ViewBag.token });
            if (res.id >= 0)
            {
                return RedirectToAction("TenantDashboard", new RouteValueDictionary(new { controller = "Tenant", action = "TenantDashboard", Id = res.id }));
            }
            return View();

        }

        public IActionResult marketPlace()
        {
            return View();
        }

        public IActionResult dbConfig()
        {
            return View();
        }

        public IActionResult AddAccount2()
        {
            return View();
        }

        public IActionResult SimpleAdvanced()
        {
            return View();
        }

        public IActionResult SimpleDbConf()
        {
            return View();
        }

        public IActionResult Engineering()
        {
            return View();
        }
        
      //public JsonResult GetEbObjects_json()
      //  {
      //      var req = this.HttpContext.Request.Form;
      //      IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
      //      var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { TenantAccountId = ViewBag.cid, Token = ViewBag.token });
      //      var rlist = resultlist.Data;
      //      Dictionary<int, string> ObjList = new Dictionary<int, string>();
      //      foreach (var element in rlist)
      //      {
      //          if (element.EbObjectType.ToString() == req["ebobjtype"])
      //          {
      //              ObjList[element.Id] = element.Name;
      //          }
      //      }
      //      return Json(ObjList);
      //  }

        public IActionResult CreateApplications()
        {
            return View();
        }

        public class ObjectCaller
        {
            public int obj_id { get; set; }
            public int TenantId { get; set; }

            public ObjectCaller(int id, int cid)
            {
                this.obj_id = id;
                this.TenantId = cid;
            }

        }

        [HttpGet]
        public IActionResult TenantAcc()
        {
            IServiceClient client = this.ServiceClient;
            var fr = client.Get<GetAccountResponse>(new GetAccountRequest());
            ViewBag.dict = fr.returnlist;
            return View();
        }
    }
}
