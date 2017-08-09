using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class RBController : EbBaseNewController
    {
        public RBController(IServiceClient _client, IRedisClient _redis) : base (_client, _redis) { }

        public IActionResult ReportBuilder()
        {
            //var resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = 2, TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            //var rlist = resultlist.Data;
            //Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();
            //foreach (var element in rlist)
            //{
            //    ObjList[element.Id] = element;
            //}

            //ViewBag.Objlist = ObjList;
            return View();
        }
    }
}
