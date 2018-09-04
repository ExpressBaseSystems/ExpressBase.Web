using ExpressBase.Common.Constants;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class EbQuestionNaireViewComponent: ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected IRedisClient redis { get; set; }

        public EbQuestionNaireViewComponent(IServiceClient _client, IRedisClient _redis) {
            this.ServiceClient = _client as JsonServiceClient;
            this.redis = _redis;
        }

        public async Task<IViewComponentResult> InvokeAsync(int sid,string bToken, string rToken, int masterid)
        {
            var host = this.HttpContext.Request.Host;
            string[] hostParts = host.Host.Split(CharConstants.DOT);
            
            this.ServiceClient.Headers.Add("SolId", hostParts[0]);
            GetParticularSurveyResponse resp = this.ServiceClient.Post(new GetParticularSurveyRequest { SurveyId = sid });
            ViewBag.Survey = JsonConvert.SerializeObject(resp);
            ViewBag.Btok = bToken;
            ViewBag.Rtok = rToken;
            ViewBag.MasterId = masterid;
            return View();
        }
    }
}
