using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common.Data;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class Query
    {
        public List<string> explain = new List<string>();
    }
    public class QueryExplainController : EbBaseIntCommonController
    {
        public QueryExplainController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public GetExplainResponse GetExplain(string query, List<Param> _params)
        {
            List<string> dataitem = new List<string>();
            GetExplainResponse res = ServiceClient.Get<GetExplainResponse>(new GetExplainRequest { Query = query, Params = _params });
            return res;
        }
    }
}
