﻿using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Runtime.Serialization;
using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System.Threading;
using Google.Apis.Auth.OAuth2.Flows;
using System.Threading.Tasks;
using File = Google.Apis.Drive.v3.Data.File;
using Google.Apis.Auth.OAuth2.Responses;
using System.IO;
using System.Text;
using Google.Apis.Upload;
using ExpressBase.Objects.ServiceStack_Artifacts;
using System.Collections.Generic;
using ServiceStack.Auth;
//using Unifonic;
// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class TestRobyController : EbBaseIntCommonController
    {


        public TestRobyController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }


        public IActionResult map()
        {
            return View();
        }

        public IActionResult route()
        {
            return View();
        }

        public IActionResult chart()
        {
            return View();
        }

        public IActionResult Anoy()
        {
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            return View();
        }

        public IActionResult Test()
        {
            return View("test");
        }



        //public async System.Threading.Tasks.Task slacktestAsync(string data12)
        //{
        //    try
        //    {
        //        //List<string> Userlist = new List<string>();
        //        //var data = new NameValueCollection();
        //        //data["token"] = "xoxp-769461419556-758454407603-774250883079-05e733a4e5a6476677eccb7b160bf61c";

        //        //var client = new WebClient();
        //        //var response = client.UploadValues("https://slack.com/api/channels.list", "POST", data);
        //        //string responseInString = Encoding.UTF8.GetString(response);
        //        //SlackChannelJsonResponse JsonData = JsonConvert.DeserializeObject<SlackChannelJsonResponse>(responseInString);             



        //        //foreach(object member in JsonData.channels)
        //        //{
        //        //    PropertyInfo info = member.GetType().GetProperty("name");
        //        //    string ee = info.GetValue(member).ToString();
        //        //    Userlist.Add(ee);
        //        //}


        //        //var parameters = new NameValueCollection();

        //        //// put your token here
        //        //parameters["token"] = "xoxp-769461419556-758454407603-774250883079-05e733a4e5a6476677eccb7b160bf61c";
        //        //parameters["channels"] = "general";

        //        //var client = new WebClient();
        //        //client.QueryString = parameters;
        //        //string fullFilePath = "C:\\Users\\Kurian Kalathoor\\Pictures\\430831-most-popular-relaxing-desktop-background-1920x1080.jpg";
        //        //FileStream stream = File.OpenRead(fullFilePath);
        //        //byte[] fileBytes = new byte[stream.Length];

        //        //stream.Read(fileBytes, 0, fileBytes.Length);
        //        //stream.Close();
        //        //byte[] responseBytes = client.UploadFile(
        //        //        "https://slack.com/api/files.upload",
        //        //        "C:\\Users\\Kurian Kalathoor\\Pictures\\430831-most-popular-relaxing-desktop-background-1920x1080.jpg"
        //        //);

        //        //String responseString = Encoding.UTF8.GetString(responseBytes);

        //        var applicationSid = "Your Application Sid";
        //        var urc = new UnifonicRestClient(applicationSid);

        //        Console.WriteLine("Call GetBalance");
        //        var getBalanceresult = urc.GetBalance();
        //        Console.WriteLine("Balance is:" + getBalanceresult.Balance);

        //        //Sender ID must be approved by our system before usage
        //        Console.WriteLine("Call AddSender");
        //        AddSenderResult addSenderResult = urc.AddSender("test");
        //        Console.WriteLine("Status of new sender name : " + addSenderResult.Status);


        //        Console.WriteLine("Call GetSenderStatus");
        //        GetSenderStatusResult getSenders = urc.GetSenderStatus("SenderSMS");
        //        Console.WriteLine("Status of Sender name 'SenderSMS' : " + getSenders.Status);

        //        Console.WriteLine("Call GetSenders");
        //        List<Sender> getSendersResult = urc.GetSenders();
        //        Console.WriteLine("You have {0} senders", getSendersResult.Count);
        //        for (int index = 0; index < getSendersResult.Count; index++)
        //        {
        //            Console.WriteLine("{0} : {1}", index + 1, getSendersResult[index].SenderID);
        //        }

        //        Console.WriteLine("Call DeleteSender");
        //        urc.DeleteSender("test");
        //        Console.WriteLine("Sender 'test' has been deleted successfully");

        //        Console.WriteLine("Call GetAppDefaultSender");
        //        var getAppDefaultSenderResult = urc.GetAppDefaultSender();
        //        Console.WriteLine("Default Sender name is:" + getAppDefaultSenderResult.SenderID);

        //        Console.WriteLine("Call ChangeAppDefaultSenderId");
        //        urc.ChangeAppDefaultSender("966000000000");
        //        Console.WriteLine("Default sender name has been changed successfully");

        //        //Sender ID must be approved by our system before usage
        //        Console.WriteLine("Call SendMessage");
        //        var sendSmsMessageResult = urc.SendSmsMessage("966000000000", "Test");
        //        Console.WriteLine("Message ID: {0} , Cost: {1} {2},Status: {3}", sendSmsMessageResult.MessageID,
        //        sendSmsMessageResult.Cost, sendSmsMessageResult.CurrencyCode, sendSmsMessageResult.Status);

        //        Console.WriteLine("Call SendBulkMessages");
        //        var sendBulkSmsMessagesResult = urc.SendBulkSmsMessages("966000000000,962799999999", "Test");
        //        Console.WriteLine("Total number of messages: " + sendBulkSmsMessagesResult.Messages.Count);
        //        foreach (var msg in sendBulkSmsMessagesResult.Messages)
        //        {
        //            Console.WriteLine("Message ID: {0} , Status: {1}", msg.MessageID, msg.Status);
        //        }

        //        Console.WriteLine("Call GetMessageStatus");
        //        var getSmsMessageStatusResult = urc.GetSmsMessageStatus("123456789");
        //        Console.WriteLine("Message Status is: " + getSmsMessageStatusResult.Status);

        //        Console.WriteLine("Call GetMessagesReport");
        //        var getSmsMessagesReportResult = urc.GetSmsMessagesReport(status: SmsMessageStatus.Queued);
        //        Console.WriteLine("Total number of messages: " + getSmsMessagesReportResult.TotalTextMessages);

        //        Console.WriteLine("Call GetMessageStatus");
        //        var getSmsMessagesDetailsResult = urc.GetSmsMessagesDetails();
        //        Console.WriteLine("Total number of messages: " + getSmsMessagesDetailsResult.Messages.Count);
        //        foreach (var msg in getSmsMessagesDetailsResult.Messages)
        //        {
        //            Console.WriteLine("Message ID: {0} , Cost: {1} {2},Status: {3}", msg.MessageID,
        //                msg.Cost, getSmsMessagesDetailsResult.CurrencyCode, msg.Status);
        //        }

        //        Console.WriteLine("Call VoiceCall");
        //        var callResult = urc.Call("966000000000", new Uri(
        //            "https://voiceusa.s3.amazonaws.com/voiceWavFiles1423399184883.wav"), timeScheduled: DateTime.Now.AddDays(1));
        //        Console.WriteLine("Call ID: {0} , Cost: {1} , Status: {2}", callResult.CallID,
        //           callResult.Cost, callResult.CallStatus);

        //        Console.WriteLine("Call GetCallIdStatus");
        //        var getCallStatusResult = urc.GetCallStatus("871");
        //        Console.WriteLine("Cost: {0} , Status: {1}", getCallStatusResult.Price, getCallStatusResult.CallStatus);

        //        Console.WriteLine("Call GetCallsDetails");
        //        var getCallsDetailsResult = urc.GetCallsDetails();
        //        Console.WriteLine("Total number of calls: " + getCallsDetailsResult.Calls.Count);
        //        foreach (var call in getCallsDetailsResult.Calls)
        //        {
        //            Console.WriteLine("Call ID: {0} , Status: {1}", call.CallID, call.CallStatus);
        //        }

        //        Console.WriteLine("Call TtsCall");
        //        var ttsCallResult = urc.TtsCall("966000000000", "welcome", TtsCallLanguages.English, timeScheduled: DateTime.UtcNow.AddDays(1));
        //        Console.WriteLine("Call ID: {0} , Cost: {1} , Status: {2}", ttsCallResult.CallID,
        //           ttsCallResult.Cost, ttsCallResult.CallStatus);

        //        Console.WriteLine("Call NumberInsight");
        //        var numberInsightResult = urc.NumberInsight("966000000000");
        //        Console.WriteLine("Status of the number 966000000000 is : {0}", numberInsightResult.SubscriberStatus);


        //        Console.WriteLine("Call MessagesInbox");
        //        var messagesInboxResult = urc.MessagesInbox("1200000012");
        //        Console.WriteLine("Number of messages is : {0}", messagesInboxResult.NumberOfMessages);

        //        Console.WriteLine("Call VoiceInbox");
        //        var voiceInboxResult = urc.VoiceInbox("12132944430");
        //        Console.WriteLine("Number of calls is : {0}", voiceInboxResult.TotalCalls.Count);

        //        Console.WriteLine("Call MessagesKeyword");
        //        urc.MessagesKeyword("12132944430", "Test", KeywordRules.Is);
        //        Console.WriteLine("Keyword added successfully");

        //        Console.WriteLine("Call GetScheduledMessages");
        //        var scheduledMessagesResult = urc.GetScheduledMessages();
        //        Console.WriteLine("Number of scheduled messages is {0}", scheduledMessagesResult.TotalTextMessages);

        //        Console.WriteLine("Call StopScheduledMessages");
        //        urc.StopScheduledMessage("96");
        //        Console.WriteLine("Scheduled message has been canceled");

        //        Console.WriteLine("Call GetScheduledCalls");
        //        var getScheduledCallsResult = urc.GetScheduledCalls();
        //        Console.WriteLine("Number of scheduled calls is {0}", getScheduledCallsResult.TotalVoiceCalls);

        //        Console.WriteLine("Call StopScheduledCalls");
        //        urc.StopScheduledCalls("46");
        //        Console.WriteLine("Scheduled call has been canceled");

        //        Console.WriteLine("Call SendVerificationCode");
        //        urc.SendVerificationCode("966000000000", "your code is", securityType: VerificationSecurityType.OTP);
        //        Console.WriteLine("Verification code has been sent to recipient");

        //        Console.WriteLine("Call VerifyNumber");
        //        var verifyNumberResult = urc.VerifyNumber("966000000000", "4865");
        //        Console.WriteLine("Verification status is : {0}", verifyNumberResult.VerifyStatus);

        //        Console.WriteLine("Call MessagesPricing");
        //        var messagesPricing = urc.MessagesPricing("SA");
        //        Console.WriteLine("Number of operators in Saudi Arabia is {0}", messagesPricing[0].Operators.Count);

        //        Console.WriteLine("Call GetVerificationDetails");
        //        var getVerificationDetailsResult = urc.GetVerificationDetails();
        //        Console.WriteLine("Number of verification messages is {0}", getVerificationDetailsResult.NumberOfMessages);

        //    }
        //    catch (Exception e)
        //    {
        //        Console.Out.WriteLine("-----------------");
        //        Console.Out.WriteLine(e.Message);
        //    }
        //}
        [HttpPost]
        public async Task storeauthcodeAsync(string data12)
        {
            try
            {
                var init = new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = new ClientSecrets
                    {
                        ClientId = "1080114714952-bjp6t1ifr0dn68u1rrr4icnfscfr9qfl.apps.googleusercontent.com",
                        ClientSecret = "DwaDGHou5ghXrJ0EitwnIQWu"
                    },
                    Scopes = new string[] { "https://www.googleapis.com/auth/drive" }
                };
                var flow = new Google.Apis.Auth.OAuth2.Flows.AuthorizationCodeFlow(init);
                var code = data12;
                Console.WriteLine("Fetching token for code: _" + code + "_");
                TokenResponse result = await flow.ExchangeCodeForTokenAsync("user", code, "https://myaccount.eb-test.xyz", CancellationToken.None);
                Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(result));
                GoogleCredential credential = GoogleCredential.FromAccessToken(result.AccessToken);
                Console.WriteLine("credentials created");
                var service = new DriveService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = ApplicationName,
                });
                Console.WriteLine("service created");
                byte[] byteArray = Encoding.ASCII.GetBytes("hagsd adhgasgd asdg assdghkajsgd asdgkasgd akjsgdka");
                Stream str = new MemoryStream(byteArray);
                var fileMetadata = new File()
                {
                    Name = "photo.jpg",
                    MimeType = "image/jpeg"
                };
                FilesResource.CreateMediaUpload request;
                string dir = System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
                Console.WriteLine("dir : " + dir);
                IUploadProgress response;
                using (Stream stream = new FileStream("430831-most-popular-relaxing-desktop-background-1920x1080.jpg",
                                        FileMode.Open, FileAccess.Read))
                {
                    request = service.Files.Create(
                        fileMetadata, stream, "image/jpeg");
                    request.Fields = "id";
                    response = request.Upload();
                }
                if (response != null)
                    Console.WriteLine("Exception" + response.Status.ToString());
                else if (response == null)
                    Console.WriteLine("Null Response");
                var file = request.ResponseBody;
                if (file != null)
                    Console.WriteLine("File ID: " + file.Id);
            }
            catch (Exception e)
            {
                Console.WriteLine("exception inside storeauth :" + e);
                Console.WriteLine(" StackTrace :" + e.StackTrace);
            }


    }

    internal class SlackUserJsonResponse
    {
        public memberobject[] members { get; set; }

        public SlackUserJsonResponse()
        {
            new memberobject();
        }
    }

    internal class SlackChannelJsonResponse
    {
        public memberobject[] channels { get; set; }

        public SlackChannelJsonResponse()
        {
            new memberobject();
        }
    }

            //if (credential.Token.IsExpired(Google.Apis.Util.SystemClock.Default))
            //{
            //    var refreshResult = credential.RefreshTokenAsync(CancellationToken.None).Result;
            //}
        }

        public IActionResult GetAPIKey(int a)
        {
            GenerateAPIKeyResponse resp = this.ServiceClient.Get(new GenerateAPIKey());

            List<string> apiSList = new List<string>();
            
            foreach(ApiKey key in resp.APIKeys)
            {
                apiSList.Add(key.ToJson());
            }

            ViewBag.APIKey = apiSList;

            return View();
        }

    internal class memberobject
    {
        public dynamic id { get; set; }
        public dynamic team_id { get; set; }
        public dynamic name { get; set; }
    }
    internal class WorkspaceTokenResponse
    {
        public Guid Id { get; set; }
        public string Token { get; set; }
        public string AppId { get; set; }
        public string TeamId { get; set; }
    }

}
