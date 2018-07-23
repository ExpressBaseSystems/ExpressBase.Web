using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.Controllers
{
    public class ImportExportController : EbBaseIntCommonController
    {
        public ImportExportController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        public IActionResult Index()
        {
            return View();
        }
        public void Export(string _refid)
        {

        }
    }
}