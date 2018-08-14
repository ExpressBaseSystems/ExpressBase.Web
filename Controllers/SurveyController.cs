using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.Controllers
{
    public class SurveyController : EbBaseIntCommonController
    {
        public SurveyController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        public IActionResult CreateSurvey()
        {
            GetSurveyQueriesResponse resp = this.ServiceClient.Get(new GetSurveyQueriesRequest());
            ViewBag.Queries = resp.Data;
            return View();
        }

        public bool SaveQues(string survey)
        {
            var o = JsonConvert.DeserializeObject<EbSurveyQuery>(survey);
            SurveyQuesResponse resp = this.ServiceClient.Post(new SurveyQuesRequest {
                Query = o
            });
            return resp.Status;
        }
    }
}
