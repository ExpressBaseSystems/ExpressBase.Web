using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using ServiceStack.Auth;
using Microsoft.AspNetCore.Http;
using ExpressBase.Security;
using System.IdentityModel.Tokens.Jwt;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using ExpressBase.Common;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Common.EbServiceStack.ReqNRes;
using ExpressBase.Common.Constants;
using System.Net.Http;
using ExpressBase.Common.ServiceClients;

namespace ExpressBase.Web.Controllers
{
    public class BoteController : EbBaseExtController
    {      

        public BoteController(IServiceClient _client, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_client, _redis, _sfc) { }

        [HttpGet]
        public IActionResult Bot(string tid, string appid, string themeColor, string botdpURL)
        {
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            ViewBag.ServerEventUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVEREVENTS_EXT_URL);
            ViewBag.tid = tid;
            ViewBag.appid = appid;
            ViewBag.botdpURL = botdpURL;
            ViewBag.themeColor = themeColor.Replace("HEX","#");
            return View();
        }

        [HttpPost]
        public async Task<string> UploadImageOrginal(string base64, string filename, string refreshToken, string bearerToken)
        {
            this.ServiceClient.BearerToken = bearerToken;
            this.ServiceClient.RefreshToken = refreshToken;
            string Id = string.Empty;
            string url = string.Empty;
            byte[] myFileContent;
            try
            {
                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new FileMeta();
                myFileContent = System.Convert.FromBase64String(base64);
                uploadImageRequest.ImageByte = myFileContent;
                uploadImageRequest.ImageInfo.FileType = StaticFileConstants.JPG;
                uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                uploadImageRequest.ImageInfo.FileName = filename;

                Id = this.ServiceClient.Post<string>(uploadImageRequest);
                url = string.Format("{0}/static/{1}.{2}", ViewBag.BrowserURLContext, Id, uploadImageRequest.ImageInfo.FileType);

            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString());
                return "upload failed";
            }

            return url;
        }

        [HttpPost]
        public async Task<bool> UploadFileAsync(string base64, string filename,string type, string refreshToken, string bearerToken)
        {
            this.FileClient.BearerToken = bearerToken;
            this.FileClient.RefreshToken = refreshToken;
            string Id = string.Empty;
            string url = string.Empty;
            try
            {
                UploadFileAsyncRequest uploadFileRequest = new UploadFileAsyncRequest();
                uploadFileRequest.FileDetails = new FileMeta();
                        byte[] myFileContent;
                        myFileContent = System.Convert.FromBase64String(base64);
                        uploadFileRequest.FileByte = myFileContent;
                        uploadFileRequest.FileDetails.FileName = filename;
                        uploadFileRequest.FileDetails.FileType = type;
                        uploadFileRequest.FileDetails.Length = uploadFileRequest.FileByte.Length;

                        this.FileClient.Post<bool>(uploadFileRequest);
                return true;
            }
            catch (Exception e)
            {
                return false;
            }          
        }


        [HttpPost]
        public async Task<List<object>> AuthAndGetformlist(string cid, string appid, string socialId, string anon_email, string anon_phno, string user_ip, string user_browser, string user_name, string wc = "tc")
        {
			HttpClient client = new HttpClient();
			string result = await client.GetStringAsync("http://ip-api.com/json/" + user_ip);
			IpApiResponse IpApi = JsonConvert.DeserializeObject<IpApiResponse>(result);

			Dictionary<string, string> _Meta;
                _Meta = new Dictionary<string, string> {
					{ TokenConstants.WC, wc },
					{ TokenConstants.CID, cid },
					{ TokenConstants.SOCIALID, socialId },
					{ "phone", anon_phno },
					{ "emailId", anon_email },
					{ "anonymous", "true" },
					{ "appid", appid },
					{ "user_ip", user_ip },
					{ "user_browser", user_browser },
					{ "user_name", user_name },
					{ "city", IpApi.City},
					{ "region", IpApi.RegionName},
					{ "country", IpApi.Country},
					{ "latitude", IpApi.Lat},
					{ "longitude", IpApi.Lon},
					{ "timezone", IpApi.Timezone},
					{ "iplocationjson", result}
				};
            MyAuthenticateResponse authResponse = this.ServiceClient.Send<MyAuthenticateResponse>(new Authenticate
            {
                provider = CredentialsAuthProvider.Name,
                UserName = "NIL",
                Password = "NIL",
                Meta = _Meta,
            });
            if (authResponse != null)
            {
                this.ServiceClient.BearerToken = authResponse.BearerToken;
                this.ServiceClient.RefreshToken = authResponse.RefreshToken;
                var tokenS = (new JwtSecurityTokenHandler()).ReadToken(authResponse.BearerToken) as JwtSecurityToken;

                string email = tokenS.Claims.First(claim => claim.Type == "email").Value;

                User user = this.Redis.Get<User>(string.Format("{0}-{1}-{2}", cid, email, wc));
                var Ids = String.Join(",", user.EbObjectIds);
                //GetBotForm4UserResponse formlist = this.ServiceClient.Get<GetBotForm4UserResponse>(new GetBotForm4UserRequest { BotFormIds = "{" + Ids + ", 1170, 1172}", AppId = appid });
                GetBotForm4UserResponse formlist = this.ServiceClient.Get<GetBotForm4UserResponse>(new GetBotForm4UserRequest { BotFormIds =  Ids , AppId = appid });
                List<object> returnlist = new List<object>();
                returnlist.Add(authResponse);
                returnlist.Add(formlist.BotForms);
                CookieOptions options = new CookieOptions();
                Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, this.ServiceClient.BearerToken, options);
                Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);
                return returnlist;
            }
            else
            {
                return null;
            }

        }

		public class IpApiResponse
		{
			public string As { get; set; }
			public string City { get; set; }
			public string Country { get; set; }
			public string CountryCode { get; set; }
			public string Isp { get; set; }
			public string Lat { get; set; }
			public string Lon { get; set; }
			public string Org { get; set; }
			public string Query { get; set; }
			public string Region { get; set; }
			public string RegionName { get; set; }
			public string Status { get; set; }
			public string Timezone { get; set; }
			public string Zip { get; set; }
		}

		public dynamic GetCurForm(string refreshToken, string bearerToken, string refid)
        {
            this.ServiceClient.BearerToken = bearerToken;
            this.ServiceClient.RefreshToken = refreshToken;
            var formObj = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });

            var Obj = EbSerializers.Json_Deserialize(formObj.Data[0].Json);
            if (Obj is EbBotForm)
            {
                //EbBotForm obj = Obj as EbBotForm;
                foreach (EbControl control in Obj.Controls)
                {
                    if (control is EbSimpleSelect)
                    {
                        (control as EbSimpleSelect).InitFromDataBase(this.ServiceClient);
                    }
                    else if (control is EbDynamicCardSet)
                    {
						EbDynamicCardSet EbDynamicCards = (control as EbDynamicCardSet);
						EbDynamicCards.InitFromDataBase(this.ServiceClient);
						EbDynamicCards.BareControlHtml = EbDynamicCards.GetBareHtml();
                    }
                    //else if (control is EbImage)
                    //{
                    //    (control as EbCards).InitFromDataBase(this.ServiceClient);
                    //}
                }
            }
            if (Obj is EbTableVisualization)
            {
                EbTableVisualization Tobj = (Obj as EbTableVisualization);
                string BotCols = "[";
                string BotData = "[";
                int i = 0;

                foreach (DVBaseColumn col in Tobj.Columns)
                {
                    BotCols += "{" + "\"data\":" + i++ + ",\"title\":\"" + col.Name + "\"},";
                }
                BotCols = BotCols.TrimEnd(',') + "]";

                DataSourceDataResponse dresp = this.ServiceClient.Get<DataSourceDataResponse>(new DataSourceDataRequest { RefId = Tobj.DataSourceRefId, Draw = 1 });
                var data = dresp.Data;
                foreach (EbDataRow row in data)
                {
                    i = 0;
                    BotData += "{";
                    foreach (var item in row)
                    {
                        BotData += "\"" + i++ + "\":\"" + item + "\",";
                        //BotData += "\"" + item + "\",";
                    }
                    BotData = BotData.TrimEnd(',') + "},";
                }
                BotData = BotData.TrimEnd(',') + "]";

                Tobj.BotCols = BotCols;
                Tobj.BotData = BotData;
                return EbSerializers.Json_Serialize(Tobj);
            }
            if (Obj is EbChartVisualization)
            {
                return EbSerializers.Json_Serialize(Obj);
            }
            //else if (Obj is EbChartVisualization)
            //{

            //}
            return Obj;
        }
    }
}