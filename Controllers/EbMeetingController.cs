using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using Newtonsoft.Json;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Extensions;
using System.Reflection;
using ExpressBase.Common.Objects.Attributes;
using ExpressBase.Common.Data;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Constants;
using ExpressBase.Objects.Objects;
using System.IO;

namespace ExpressBase.Web.Controllers
{
    public class EbMeetingController : EbBaseIntCommonController
    {
        public EbMeetingController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }  // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }
    }
}
