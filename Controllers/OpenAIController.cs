


using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack.Redis;
using ServiceStack;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Http;
using System.Text;
using System.Collections.Generic;
using ExpressBase.Objects.ServiceStack_Artifacts;
using System.Linq;

namespace ExpressBase.Web.Controllers
{
    public class OpenAIController : EbBaseIntCommonController
    {
        private string JsonString = @"
        {
          ""tenant_id"": ""expressbase"",
          ""session_id"": """",
          ""db_schema"": {
            ""tables"": [
              {
                ""name"": ""sales"",
                ""columns"": {
                  ""sale_id"": ""int"",
                  ""customer_id"": ""int"",
                  ""product_id"": ""int"",
                  ""amount"": ""decimal"",
                  ""sale_date"": ""date""
                },
                ""primary_key"": [ ""sale_id"" ],
                ""foreign_keys"": [
                  {
                    ""column"": ""customer_id"",
                    ""references"": ""customers.customer_id""
                  }
                ]
              }
            ]
          },
         ""user_input"" : """"
        }";

        private string TableConfigData = @"
        {
            ""users"":"""" ,
            ""products"": ""Product catalog and inventory details"",
            ""orders"": """",
            ""categories"": ""Product categorization system"",
            ""inventory"": ""Stock levels and warehouse management"",
            ""customers"":"""" ,
            ""suppliers"": ""Vendor and supplier contact information"",
            ""transactions"": ""Financial transaction records"",
            ""reviews"": ""Customer feedback and ratings"",
            ""shipping_addresses"":"""" 
        }";
        //private string SessionID = "";

        //private string solutionId;

        //private bool isFirstChat = true;

        public OpenAIController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        private readonly HttpClient _httpClient = new HttpClient();

        CookieOptions options = new CookieOptions
        {
            Expires = DateTimeOffset.Now.AddDays(7),
            HttpOnly = true,
            Secure = true,
            Path = "/openai",
            SameSite = SameSiteMode.Strict
        };

        [Microsoft.AspNetCore.Mvc.Route("/openai")]
        public async Task<IActionResult> Index()
        {
            try
            {

                string url = $"http://127.0.0.1:8000/sql/generation";

                var content = new StringContent(JsonString, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                //Console.WriteLine(result);

                JObject jsonObject = JObject.Parse(result);
                string sessionId = jsonObject["session_id"]?.ToString();

                //OpenAIQueryResponse ress = new OpenAIQueryResponse();
                //ress = InsertQuery(sessionId);


                Response.Cookies.Append("Session_id", sessionId, options);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message + e.StackTrace);
            }

            return View();
        }

        [HttpGet]
        public async Task<string> NewChat()
        {
            try
            {
                string url = $"http://127.0.0.1:8000/sql/generation";

                var content = new StringContent(JsonString, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                //Console.WriteLine(result);

                JObject jsonObject = JObject.Parse(result);
                string sessionId = jsonObject["session_id"]?.ToString();

                //OpenAIQueryResponse ress = new OpenAIQueryResponse();
                //ress = InsertQuery(sessionId);

                Response.Cookies.Append("Session_id", sessionId, options);
                //isFirstChat = true;
                return "success";
            }
            catch(Exception e)
            {
                Console.WriteLine(e);
                return "error";
            }
        }

        [HttpGet]
        public async Task<string> TEST(string msg)
        {
            try
            {
                string url = $"http://127.0.0.1:8000/session{msg}/history";

                HttpResponseMessage response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                string apiResponse = await response.Content.ReadAsStringAsync();

                Console.WriteLine(apiResponse);

                return apiResponse;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message + e.StackTrace);
                return "error occured";
            }

            //return "Hai " + msg;
        }

        [HttpPost]
        public async Task<List<string>> PostRequest(string requestBody, bool isFirstChat)
        {
            try
            {
                string json = @"
                {
                    ""tenant_id"": ""expressbase"",
                    ""session_id"": """",
                    ""user_input"" : """"
                }";

                string url = $"http://127.0.0.1:8000/sql/generation";

                JObject jsonObject = JObject.Parse(json);

                if (Request.Cookies.TryGetValue("Session_id", out string sessionIdFromCookie))
                {   
                    jsonObject["session_id"] = sessionIdFromCookie;
                }

                jsonObject["user_input"] = requestBody;

                if (isFirstChat)
                {
                    OpenAISessionStoreResponse ress = new OpenAISessionStoreResponse();
                    ress = this.ServiceClient.Post<OpenAISessionStoreResponse>(new OpenAISessionStoreRequest { SessionId = sessionIdFromCookie, ChatHeading = requestBody});
                    isFirstChat = false;
                }

                var content = new StringContent(jsonObject.ToString(), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                JObject jsonObj = JObject.Parse(result);

                string resultString = "";
                List<string> resultList = new List<string>();

                string responseType = jsonObj["type"]?.ToString();
                if(responseType == "clarification")
                {
                    JArray contentArray = (JArray)jsonObj["content"]["clarifications"];
                    resultList.Add(contentArray[0].ToString());
                }
                else if(responseType == "SQL")
                {
                    string query = jsonObj["content"]["query"].ToString();
                    List<string> suggestions = jsonObj["content"]["suggestions"].ToObject<List<string>>();

                    resultList.Add(query);
                    resultList.AddRange(suggestions);
                }
                else
                {
                    resultList.Add("Error occured..!");
                    resultList.Add("This may happen because you send messages like 'Hi' or 'Hello.' You can directly give instructions to create a SQL query.");
                }

                //Console.WriteLine(resultString);

                return resultList;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message + e.StackTrace);
                return new List<string>();
            }

            //return "From post request" + requestBody;
        }

        [HttpGet]
        public async Task<string> LoadChatHistory()
        {
            try
            {
                ChatHistoryResponse ress = new ChatHistoryResponse();
                ress = this.ServiceClient.Get<ChatHistoryResponse>(new OpenAISessionStoreRequest { });
                JObject jsonObj = JObject.FromObject(ress);

                string resultList = string.Join(", ", jsonObj.Properties().Select(p => p.Value.ToString()));

                return resultList;
            }
            catch (Exception e)
            {
                return "";
            }
            //return new List<string>();
        }

        [HttpPost]
        public async Task<string> LoadSessionHistory(string session_id)
        {
            try
            {
                string url = $"http://127.0.0.1:8000/session{session_id}/history";

                var response = await _httpClient.GetAsync(url);
                string result = await response.Content.ReadAsStringAsync();

                return result;
            }
            catch (Exception e)
            {

            }
            return "";
        }


        [Microsoft.AspNetCore.Mvc.Route("/openai/TableConfig")]
        public async Task<IActionResult> TableConfig()
        {
            try
            {

            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message + e.StackTrace);
            }

            return View();
        }

        [HttpGet]
        public async Task<string> GetExistingData()
        {
            try
            {
                return TableConfigData;
            }
            catch(Exception e)
            {
                Console.WriteLine(e.Message + e.StackTrace);
            }
            return "";
        }

        //private OpenAIQueryResponse InsertQuery(string sessionId)
        //{
        //    OpenAIQueryResponse ress = new OpenAIQueryResponse();
        //    ress = this.ServiceClient.Post<OpenAIQueryResponse>(new OpenAISessionStoreRequest { SessionId = sessionId, SolutionId = solutionId});
        //    return ress;
        //}


    }
}
