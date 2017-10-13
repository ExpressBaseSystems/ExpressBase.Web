using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects.ServiceStack_Artifacts;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class CommonController : EbBaseNewController
    {
        public CommonController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }
        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        public string GetAllUsers(string searchtext)
        {
            string html = string.Empty;
            Dictionary<string, object> Dict = new Dictionary<string, object>();
            Dict["searchtext"] = searchtext;
            var fr = this.ServiceClient.Get<GetUsersResponse>(new GetUsersRequest { Colvalues = Dict, TenantAccountId = ViewBag.cid });
            foreach (var key in fr.Data.Keys)
            {
                html += "<div id ='@userid' class='alert alert-success columnDrag'>@users</div>".Replace("@users", fr.Data[key].ToString()).Replace("@userid", key);
            }
            return html;
        }

        [HttpPost]
        public string uniquecheck(string text)
        {
            Dictionary<string, object> Dict = new Dictionary<string, object>();
            Dict["email"] = text;
            var fr = this.ServiceClient.Get<bool>(new UniqueRequest { Colvalues = Dict });
            if(fr)
                return "success";
            else
                return "failed";
        }
    }
}
