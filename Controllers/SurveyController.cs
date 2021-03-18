using System;
using System.Collections.Generic;
using System.Linq;
using ExpressBase.Common;
using ExpressBase.Common.Extensions;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web.Filters;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.Controllers
{
    public class SurveyController : EbBaseIntCommonController
    {
        public SurveyController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [EbBreadCrumbFilter("QuestionBank")]
        public IActionResult QuestionBank()
        {
            GetSurveyQueriesResponse resp = this.ServiceClient.Get(new GetSurveyQueriesRequest());
            ViewBag.Queries = resp.Data;
            return View();
        }

        [EbBreadCrumbFilter("QuestionBank")]
        public IActionResult question_bank()
        {
            try
            {
                List<EbQuestion> Qlist = new List<EbQuestion>();
                GetSurveyQuestionsResponse resp = this.ServiceClient.Get(new GetSurveyQuestionsRequest());
                Dictionary<String, String> ControlHTML = new Dictionary<String, String>();

                if (resp != null && resp.Data != null)
                {
                    foreach (String qs in resp.Data)
                    {
                        EbQuestion qstn = EbSerializers.Json_Deserialize<EbQuestion>(qs);
                        Qlist.Add(qstn);
                        IEnumerable<EbControl> QstnCtrls = qstn.QSec.Controls.FlattenEbControls();
                        IEnumerable<EbControl> AnswerCtrls = qstn.ASec.Controls.FlattenEbControls();
                        foreach (EbControl ctrl in QstnCtrls.Concat(AnswerCtrls))
                        {
                            if (!ControlHTML.Keys.Contains(qstn.EbSid_CtxId))////////////////
                                ControlHTML.Add(qstn.EbSid_CtxId, ctrl.GetHtml());
                        }

                    }
                    //_object = EbSerializers.Json_Deserialize(element.Json_lc);
                    //ViewBag.dsObj = _object;

                    ViewBag.ControlHTML = ControlHTML;
                    ViewBag.Questions = Qlist;
                }
            }
            catch (Exception ex)
            {
                String Msg = ex.Message;
            }
            return View();
        }

        public IActionResult SurveyHome()
        {
            GetSurveysByAppResponse resp = this.ServiceClient.Get(new GetSurveysByAppRequest { });
            ViewBag.Surveys = resp.Surveys;
            return View();
        }

        public SurveyQuesResponse SaveQues(string survey)
        {

            var o = JsonConvert.DeserializeObject<EbSurveyQuery>(survey);
            SurveyQuesResponse resp = this.ServiceClient.Post(new SurveyQuesRequest
            {
                Query = o
            });
            return resp;
        }

        public SaveQuestionResponse SaveQuestion(string EbQuestion)
        {
            EbQuestion o = ExpressBase.Common.EbSerializers.Json_Deserialize<EbQuestion>(EbQuestion);
            SaveQuestionResponse resp = this.ServiceClient.Post(new SaveQuestionRequest { Query = o });
            return resp;
        }

        public IActionResult ManageSurvey(int id)
        {
            ManageSurveyResponse resp = this.ServiceClient.Post<ManageSurveyResponse>(new ManageSurveyRequest { Id = id });
            ViewBag.QuestionList = resp.AllQuestions;
            ViewBag.SurveyData = JsonConvert.SerializeObject(resp.Obj);
            ViewBag.SurveyId = id;
            return View();
        }

        public int SaveSurvey(string SurveyInfo)
        {
            SaveSurveyResponse resp = this.ServiceClient.Post<SaveSurveyResponse>(new SaveSurveyRequest { Data = SurveyInfo });
            return resp.Status;
        }

        public Dictionary<int, string> GetSurveyNames()
        {
            GetSurveyListResponse resp = this.ServiceClient.Post<GetSurveyListResponse>(new GetSurveyListRequest { });
            return resp.SurveyDict;
        }
    }

}
