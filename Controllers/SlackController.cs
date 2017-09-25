using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using RestSharp;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Newtonsoft.Json;
using ExpressBase.Common;

namespace ExpressBase.Web.Controllers
{
    public class SlackController : EbBaseNewController
    {
        public SlackController(IServiceClient _ssclient) : base(_ssclient) { }

        public IActionResult Index()
        {
            ViewBag.RedirectUrl = string.Format("http://ebunnislack.azurewebsites.net/slack/auth/{0}/{1}", ViewBag.cid, ViewBag.UId);
            return View();
        }

        [HttpGet("slack/auth/{TenantId}/{UserId}")]
        public IActionResult SlackAuthenticate(string TenantId, string UserId, string code)
        {
            string ClientId = "108334113943.243458054645";
            string ClientSecret = "6fd7e8ceb2593713ec12d38d5d0e88fa";

            var client = new RestClient("https://slack.com");

            string RedirectUri = String.Format("http://ebunnislack.azurewebsites.net/slack/auth/{0}/{1}", TenantId, UserId);
            
            var request = new RestRequest("api/oauth.access", Method.GET);
            request.AddParameter("client_id", ClientId);
            request.AddParameter("client_secret", ClientSecret);
            request.AddParameter("code",code);
            request.AddParameter("redirect_uri", RedirectUri);

            //Execute the request
            var res = client.ExecuteAsyncGet(request, SlackTokenCallBack, "GET");
            
            return View();
        }

        private void SlackTokenCallBack(IRestResponse restResponse, RestRequestAsyncHandle arg2)
        {
            string sToken = restResponse.Content;
            //string Token = "{\"ok\":true,\"access_token\":\"xoxp-108334113943-221049390612-246282639767-2e5c136f20e80573ca7ac3c00ee07606\",\"scope\":\"identify,files:write:user\",\"user_id\":\"U6H1FBGJ0\",\"team_name\":\"ExpressBase Systems\",\"team_id\":\"T369U3BTR\"}";

            string jsonToken = sToken.Replace("\\", string.Empty);
            SlackJson slackToken = JsonConvert.DeserializeObject<SlackJson>(jsonToken);
            bool res = this.ServiceClient.Post<bool>(new SlackAuthRequest { IsNew = true, SlackJson = slackToken });

        }

        
        [HttpGet]
        public IActionResult SlackTextPost()
        {
            return View();
        }


        [HttpPost]
        public IActionResult SlackTextPost(int i)
        {
            var req = this.HttpContext.Request.Form;

            SlackPayload payload = new SlackPayload
            {
                Channel = req["Channel"],
                Text = req["Text"],
            };

            this.ServiceClient.Post(new SlackPostRequest { Payload = payload, PostType = 0 });
            return View();
        }
        

        [HttpGet]
        public IActionResult SlackImagePost()
        {
            return View();
        }

        [HttpPost]
        public IActionResult SlackImagePost(int i)
        {
            var req = this.HttpContext.Request.Form;
            byte[] myFileContent;
            myFileContent = EbFile.Bytea_FromFile("F://1.jpg");

            SlackPayload payload = new SlackPayload
            {
                Channel = req["Channel"],
                Text = req["Content"],
                SlackFile = new SlackFile
                {
                    FileName = req["FileName"],
                    FileByte = myFileContent,
                    FileType = req["FileType"],

                }
            };

            this.ServiceClient.Post(new SlackPostRequest { Payload = payload, PostType = 1 });

            return View();
        }
    }
}