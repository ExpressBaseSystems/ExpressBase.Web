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
using ExpressBase.Common.Application;
using System.Security.Cryptography;
using System.IO;
using ExpressBase.Common.Security;
using ExpressBase.Data;
using ExpressBase.Common.Extensions;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Web.Models;

namespace ExpressBase.Web.Controllers
{
	public class BoteController : EbBaseExtController
	{
		public BoteController(IServiceClient _client, IRedisClient _redis, IEbStaticFileClient _sfc, IEbAuthClient _auth) : base(_client, _redis, _sfc, _auth)
		{
		}

		[HttpGet]
		public IActionResult Bot(string tid, string appid, string pgur)
		{
			var host = this.HttpContext.Request.Host;
			////for getting page url in which bot is deployed
			byte[] Pge = Convert.FromBase64String(pgur);
			string ExtUrl = System.Text.Encoding.UTF8.GetString(Pge);
			//EbBotSettings settings = new EbBotSettings() { DpUrl = botdpURL, ThemeColor = themeColor.Replace("HEX", "#"), WelcomeMessage = msg };
			string cid = this.GetIsolutionId(tid);
			EbBotSettings settings = this.Redis.Get<EbBotSettings>(string.Format("{0}-{1}_app_settings", cid, appid));
			if (settings == null)
			{
				RedisBotSettingsResponse stgres = this.ServiceClient.Post<RedisBotSettingsResponse>(new RedisBotSettingsRequest
				{
					AppId = Int32.Parse(appid),
					AppType = 3,
					SolnId=cid
					
				});
				if (stgres.ResStatus == 1)
				{
					settings = this.Redis.Get<EbBotSettings>(string.Format("{0}-{1}_app_settings", cid, appid));
				}
				else
				{
					settings = new EbBotSettings()
					{
						Name = "- Application Name -",
						ThemeColor = "#055c9b",
						DpUrl = "../images/demobotdp4.png",
						WelcomeMessage = "Hi, I am EBbot from EXPRESSbase!!"
					};
				}

			}


			ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
			ViewBag.ServerEventUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVEREVENTS_EXT_URL);
			ViewBag.tid = tid;
			ViewBag.appid = appid;
			ViewBag.cid = cid;
			ViewBag.settings = JsonConvert.SerializeObject(settings);
			//ViewBag.Env = Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT);
			ViewBag.ControlOperations = EbControlContainer.GetControlOpsJS(new EbBotForm() as EbControlContainer, BuilderType.BotForm);
			return View();

			//this.ServiceClient.Headers.Add("SolId", tid);
			//GetBotSettingsResponse settings = this.ServiceClient.Get<GetBotSettingsResponse>(new GetBotSettingsRequest { AppId = Convert.ToInt32(appid) });
			//EbBotSettings seObj =  this.Redis.Get<EbBotSettings>(string.Format("{0}-{1}_app_settings", tid, appid));
			//if(seObj != null)
			//{
			//	settings.ThemeColor = seObj.ThemeColor ?? settings.ThemeColor;
			//	settings.DpUrl = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(seObj.DpUrl)) ?? botdpURL;
			//	settings.WelcomeMessage = seObj.WelcomeMessage ?? "Hi, I am EBbot from EXPRESSbase!";
			//}
		}

		public FileContentResult Js(string id, string mode)
		{
			string[] args = id.Split("-");
			string PushContent = "";
			string solid = args[0];
			string cid = this.GetIsolutionId(solid);
			string env = Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT);
			if (mode.Equals("s"))//if single bot
			{
				int appid = Convert.ToInt32(args[1]);
				EbBotSettings settings = this.Redis.Get<EbBotSettings>(string.Format("{0}-{1}_app_settings", cid, args[1]));
				if (settings == null)
				{
					
					RedisBotSettingsResponse stgres = this.ServiceClient.Post<RedisBotSettingsResponse>(new RedisBotSettingsRequest
					{
						AppId = Int32.Parse(args[1]),
						AppType = 3,
						SolnId=cid
					});
					if (stgres.ResStatus == 1)
					{
						settings = this.Redis.Get<EbBotSettings>(string.Format("{0}-{1}_app_settings", cid, args[1]));
					}
					else
					{
						settings = new EbBotSettings()
						{
							Name = "- Application Name -",
							ThemeColor = "#055c9b",
							DpUrl = "../images/demobotdp4.png",
							WelcomeMessage = "Hi, I am EBbot from EXPRESSbase!!"
						};
					}
					
				}
				PushContent = string.Format(@"
                    window.EXPRESSbase_SOLUTION_ID = '{0}';
                    window.EXPRESSbase_APP_ID = {1};
                    d.ebbotName = '{2}' || '< EBbot >';
                    d.ebbotThemeColor = '{3}' || '#055c9b';
                    d.botdpURL = '{4}';
                    d.botWelcomeMsg = '{5}' || 'Hi, I am EBbot from EXPRESSbase!!';					
					d.ebmod='{6}';
					d.botsubtext='{7}';
d.botProp={8}", solid, appid, settings.Name, settings.ThemeColor, settings.DpUrl, settings.WelcomeMessage, env, settings.Description,(JSON.stringify( settings.BotProp)) );


			}
			else
			{
				//int[] appids = args[1].Split(',').Select(n => Convert.ToInt32(n)).ToArray();
				//EbBotSettings temp = new EbBotSettings();
				//string color = "";
				//string name = "";
				//string url = "";
				//foreach(int i in appids)
				//{
				//	temp = this.Redis.Get<EbBotSettings>(string.Format("{0}-{1}_app_settings", solid, i));
				//	if (temp == null)
				//	{
				//		temp = new EbBotSettings() { Name = "-EB-BOT-", ThemeColor = "#055c9b", DpUrl = " "};
				//	}
				//	color += "'" + temp.ThemeColor ?? "#055c9b" + "',";
				//	name += "'" + temp.Name ?? "< EBbot >" + "',";
				//	url += "'" + temp.DpUrl ?? " " + "',";
				//}

				//PushContent = string.Format(@"
				//	d.ebbotNameColl = [{0}];
				//	d.ebbotThemeColorColl = [{1}];
				//	d.botdpURLColl = [{2}];", name.Substring(0, name.Length-1), color.Substring(0, color.Length - 1), url.Substring(0, url.Length - 1));
			}

			string FileContent = System.IO.File.ReadAllText("wwwroot/js/ChatBot/ebbot-ext.js");
			FileContent = FileContent.Replace("//PUSHED_JS_STATEMENTS", PushContent);
			return File(FileContent.ToUtf8Bytes(), "text/javascript");
		}

		public FileContentResult Css(string id, string mode)
		{
			string[] args = id.Split("-");
			string solid = args[0];
			string cid = this.GetIsolutionId(solid);
			string env = Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT);
			string FileContent = "";
			{
				int appid = Convert.ToInt32(args[1]);
				EbBotSettings settings = this.Redis.Get<EbBotSettings>(string.Format("{0}-{1}_app_settings", cid, args[1]));
				if (settings == null)
				{

					RedisBotSettingsResponse stgres = this.ServiceClient.Post<RedisBotSettingsResponse>(new RedisBotSettingsRequest
					{
						AppId = Int32.Parse(args[1]),
						AppType = 3,
						SolnId = cid
					});
					if (stgres.ResStatus == 1)
					{
						settings = this.Redis.Get<EbBotSettings>(string.Format("{0}-{1}_app_settings", cid, args[1]));
					}
					else
					{
						settings = new EbBotSettings()
						{
							Name = "- Application Name -",
							ThemeColor = "#055c9b",
							DpUrl = "../images/demobotdp4.png",
							WelcomeMessage = "Hi, I am EBbot from EXPRESSbase!!"
						};
					}

				}

				if (settings.CssContent==null || settings.CssContent.Count <9)
				{
					settings.CssContent = FetchCss(settings.CssContent);
				}
				FileContent = ReplaceCssContent(settings.CssContent);
				//byte[] data = System.Convert.FromBase64String(settings.CssContent);
				//FileContent = System.Text.ASCIIEncoding.ASCII.GetString(data);

			}
			
			//FileContent = System.IO.File.ReadAllText("wwwroot/css/ChatBot/bot-ext.css");
			//FileContent = FileContent.Replace("//PUSHED_JS_STATEMENTS", PushContent);
			return File(FileContent.ToUtf8Bytes(), "text/css");
		}
		public Dictionary<string, string> FetchCss(Dictionary<string, string> btCss)
		{//public Dictionary<string, Dictionary<string, string>> CssContent()
			var CssDict = new Dictionary<string, string>();
			var Cssconst = new Dictionary<string, string>();
			Cssconst = new EbBotSettings().CssContent;
			int i = 0;
			List<string> CssList = new List<string>();
			List<string> NameArr = new List<string>();
			//if any changes change in bote too
			foreach (var item in Cssconst)
			{
				NameArr.Add(item.Key);
				CssList.Add(item.Value);
			}

			if (btCss.Count == 0)
			{
				foreach (string CssConst in CssList)
				{
					CssDict.Add(NameArr[i], CssConst);
					i++;
				}
			}
			else if (btCss.Count < NameArr.Count)
			{
				for (int j = 0; j < NameArr.Count; j++)
				{
					if (btCss.ContainsKey(NameArr[j]))
					{
						CssDict.Add(NameArr[j], btCss[NameArr[j]]);
					}
					else
					{
						CssDict.Add(NameArr[j], CssList[j]);
					}
				}

			}
			return CssDict;


		}
		public string ReplaceCssContent( Dictionary<string, string> CssObj)
		{

			string Cssfile = System.IO.File.ReadAllText("wwwroot/css/ChatBot/bot-ext.css");


			foreach (var item in CssObj)
			{
				string CssConst = item.Key;
				//var html = "";
				//foreach (var property in item.Value)
				//{
				//	html += property.Key + ':' + property.Value + "!important;"+ '\n';
				//}
				//Cssfile = Cssfile.Replace(CssConst, html);
				Cssfile = Cssfile.Replace(CssConst, CssObj[CssConst]);


			}

			return Cssfile;
		}
		//[HttpGet("/apitest")]
		//public IActionResult Test()
		//{
		//    this.ServiceClient.BearerToken = "HxSLXUHuM5X_pZDW_0_SvbpupByEIlCw";
		//    ServiceClient.Get(new ApiTestReq());

		//    return Redirect("/statuscode/404"); ;
		//}

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
				uploadImageRequest.ImageInfo = new ImageMeta();
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
		public async Task<BotAuth_andFormList> AuthAndGetformlist(string cid, string appid, string socialId, string anon_email, string anon_phno, string user_ip, string user_browser, string user_name, string wc = TokenConstants.BC)
		{
			HttpClient client = new HttpClient();
			string result = await client.GetStringAsync("http://ip-api.com/json/" + user_ip);
			IpApiResponse IpApi = JsonConvert.DeserializeObject<IpApiResponse>(result);
			cid = this.GetIsolutionId(cid);
			Dictionary<string, string> _Meta;
			_Meta = new Dictionary<string, string> {
					{ TokenConstants.WC, wc },
					{ TokenConstants.CID, cid },
					{ TokenConstants.SOCIALID, socialId },
					{ "phone", anon_phno },
					{ "emailId", anon_email },
					{ "anonymous", "true" },
					{ "appid", appid },
					{ "user_ip", this.RequestSourceIp },
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

			this.AuthClient.Headers.Add("SolId", cid);

			MyAuthenticateResponse authResponse = this.AuthClient.Send<MyAuthenticateResponse>(new Authenticate
			{
				provider = CredentialsAuthProvider.Name,
				UserName = "NIL",
				Password = "NIL",
				Meta = _Meta,
			});
			if (authResponse != null)
			{

				return GetBotformlist(authResponse, cid, wc, appid);
				//CookieOptions options = new CookieOptions();
				//Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, this.ServiceClient.BearerToken, options);
				//Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);
				//Mymain();
				//string ctxt = GetEncriptedString("helleo", key_iv);
				//string ptxt = GetDecriptedString(ctxt, key_iv);
			}
			else
			{
				return null;
			}
		}



		[HttpPost]
		public BotAuth_andFormList PasswordAuthAndGetformlist(string cid, string appid, string socialId, string uname, string anon_phno, string user_ip, string user_browser, string pass, string wc = TokenConstants.BC)
		{
			HttpClient client = new HttpClient();
			IFormCollection req = this.HttpContext.Request.Form;
			//string result = await client.GetStringAsync("http://ip-api.com/json/" + user_ip);
			//IpApiResponse IpApi = JsonConvert.DeserializeObject<IpApiResponse>(result);
			cid = this.GetIsolutionId(cid);		
			this.AuthClient.Headers.Add("SolId", cid);
			MyAuthenticateResponse authResponse = null;
			List<object> returnlist = new List<object>();
			BotAuth_andFormList Bot_Obj = new BotAuth_andFormList();
			try {
				 authResponse = this.AuthClient.Send<MyAuthenticateResponse>(new Authenticate
				{
					provider = CredentialsAuthProvider.Name,
					UserName = uname,
					Password = (pass + uname).ToMD5Hash(),
					Meta = new Dictionary<string, string> {
							{ RoutingConstants.WC, wc },
							{ TokenConstants.CID, cid },
							{ TokenConstants.IP, this.RequestSourceIp},
							{ RoutingConstants.USER_AGENT, this.UserAgent}
						},
					RememberMe = true
				});
			}
			catch(Exception e)
			{
				Console.WriteLine("Exception: " + e.ToString());
				Bot_Obj.ErrorMsg=e.Message;
			}
			
			if (authResponse != null)
			{
				Console.WriteLine("authResponse != null " + req["uname"]);
				bool is2fa = false;
				////if (ViewBag.WhichConsole == "uc")
				{
					 Eb_Solution sol_Obj = GetSolutionObject(ViewBag.SolutionId);
					if (sol_Obj != null && sol_Obj.Is2faEnabled)
						is2fa = true;
				}
				if (is2fa) //if 2fa enabled
				{
					EbAuthResponse authresp = new EbAuthResponse();
					this.ServiceClient.BearerToken = authResponse.BearerToken;
					this.ServiceClient.RefreshToken = authResponse.RefreshToken;
					Authenticate2FAResponse resp = this.ServiceClient.Post(new Authenticate2FARequest
					{
						MyAuthenticateResponse = authResponse,
						SolnId = ViewBag.SolutionId,
					});
					authresp.AuthStatus = resp.AuthStatus;
					authresp.ErrorMessage = resp.ErrorMessage;
					authresp.Is2fa = resp.Is2fa;
					authresp.OtpTo = resp.OtpTo;

					CookieOptions options = new CookieOptions();
					Response.Cookies.Append(RoutingConstants.TWOFATOKEN, resp.TwoFAToken, options);
					Response.Cookies.Append(TokenConstants.USERAUTHID, authResponse.User.AuthId, options);
					Response.Cookies.Append("UserDisplayName", authResponse.User.FullName, options);
					if (req.ContainsKey("remember"))
						Response.Cookies.Append("UserName", req["uname"], options);
					Bot_Obj.Status = resp.AuthStatus; ;
					Bot_Obj.Is2Factor = resp.Is2fa;
					Bot_Obj.OtpTo = resp.OtpTo;
					Bot_Obj.ErrorMsg = resp.ErrorMessage;
					return Bot_Obj;
				}

				else//2fa NOT enabled
				{
					Console.WriteLine("Bot - AuthStatus true, not 2fa " + req["uname"]);
					return GetBotformlist(authResponse, cid, wc, appid);
				}
				
			}
			else
			{
				return  Bot_Obj;
			}
		}
		public BotAuth_andFormList GetBotformlist(MyAuthenticateResponse authResponse,string cid,string wc,string appid)
		{
			BotAuth_andFormList Bot_Obj = new BotAuth_andFormList();
			this.ServiceClient.BearerToken = authResponse.BearerToken;
			this.ServiceClient.RefreshToken = authResponse.RefreshToken;
			var tokenS = (new JwtSecurityTokenHandler()).ReadToken(authResponse.BearerToken) as JwtSecurityToken;

			string email = tokenS.Claims.First(claim => claim.Type == "email").Value;

			User user = this.Redis.Get<User>(string.Format(TokenConstants.SUB_FORMAT, cid, email, wc));
			var Ids = String.Join(",", user.EbObjectIds);			
			GetBotForm4UserResponse formlist = this.ServiceClient.Get<GetBotForm4UserResponse>(new GetBotForm4UserRequest { BotFormIds = Ids, AppId = appid });
			List<object> returnlist = new List<object>();
			List<object> objpro = new List<object>();

			Bot_Obj.BearerToken=(HelperFunction.GetEncriptedString_Aes(authResponse.BearerToken + CharConstants.DOT + authResponse.AnonId.ToString()));
			Bot_Obj.RefreshToken=authResponse.RefreshToken;
			Bot_Obj.BotFormDict=formlist.BotForms;
			if (user.UserId == 1)
				user.Preference.Locale = "en-IN";
			Bot_Obj.User=(JsonConvert.SerializeObject(user));
			Bot_Obj.BotFormNames=formlist.BotFormsDisp;

			CookieOptions options = new CookieOptions() {  SameSite = SameSiteMode.None };
			Response.Cookies.Append(RoutingConstants.BOT_BEARER_TOKEN, (authResponse.BearerToken + CharConstants.DOT + authResponse.AnonId.ToString()), options);
			Response.Cookies.Append(RoutingConstants.BOT_REFRESH_TOKEN, authResponse.RefreshToken, options);

			foreach (KeyValuePair<string, string> rfidlst in formlist.BotFormsDisp)
			{
				string rfid = rfidlst.Key;
				EbBotForm BtFrm = this.Redis.Get<EbBotForm>(rfid);
				objpro.Add(BtFrm?.IconPicker);
			}
			Bot_Obj.BotFormIcons=objpro;
			Bot_Obj.Status = true;
			return Bot_Obj;
		}
		public BotAuth_andFormList ValidateOtp(string otp,string appid)
		{
			BotAuth_andFormList Bot_Obj = new BotAuth_andFormList();
			EbAuthResponse authresp = new EbAuthResponse();
			string token = Request.Cookies[RoutingConstants.TWOFATOKEN];
			string authid = Request.Cookies[TokenConstants.USERAUTHID];
			string cid=ViewBag.cid;
			User _u = this.Redis.Get<User>(authid);
			if (_u != null)
			{
				this.ServiceClient.BearerToken = _u.BearerToken;
				this.ServiceClient.RefreshToken = _u.RefreshToken;
				Authenticate2FAResponse response = this.ServiceClient.Post(new Validate2FARequest { Token = token });
				authresp.AuthStatus = response.AuthStatus;
				authresp.ErrorMessage = response.ErrorMessage;
				Bot_Obj.Status = authresp.AuthStatus;
				Bot_Obj.ErrorMsg = authresp.ErrorMessage;
			}
			if (authresp.AuthStatus)
			{
				if (otp == _u.Otp)
				{
					this.ServiceClient.BearerToken = _u.BearerToken;
					this.ServiceClient.RefreshToken = _u.RefreshToken;					
					var Ids = String.Join(",", _u.EbObjectIds);
					GetBotForm4UserResponse formlist = this.ServiceClient.Get<GetBotForm4UserResponse>(new GetBotForm4UserRequest { BotFormIds = Ids, AppId = appid });
					List<object> returnlist = new List<object>();
					List<object> objpro = new List<object>();

					Bot_Obj.BearerToken = (HelperFunction.GetEncriptedString_Aes(_u.BearerToken + CharConstants.DOT + _u.UserId.ToString()));
					Bot_Obj.RefreshToken = _u.RefreshToken;
					Bot_Obj.BotFormDict = formlist.BotForms;
					if (_u.UserId == 1)
						_u.Preference.Locale = "en-IN";
					Bot_Obj.User = (JsonConvert.SerializeObject(_u));
					Bot_Obj.BotFormNames = formlist.BotFormsDisp;

					CookieOptions options = new CookieOptions();
					Response.Cookies.Append(RoutingConstants.BOT_BEARER_TOKEN, (_u.BearerToken + CharConstants.DOT + _u.UserId.ToString()), options);
					Response.Cookies.Append(RoutingConstants.BOT_REFRESH_TOKEN, _u.RefreshToken, options);

					foreach (KeyValuePair<string, string> rfidlst in formlist.BotFormsDisp)
					{
						string rfid = rfidlst.Key;
						EbBotForm BtFrm = this.Redis.Get<EbBotForm>(rfid);
						objpro.Add(BtFrm?.IconPicker);
					}
					Bot_Obj.BotFormIcons = objpro;
					Bot_Obj.Status = true;
					return Bot_Obj;
					
				}
				else
				{
					Bot_Obj.Status  = false;
					Bot_Obj.ErrorMsg = "The OTP you've entered is incorrect. Please try again.";

				}
			}
			return Bot_Obj;
		}

		public EbAuthResponse ResendOtp()
		{
			EbAuthResponse authresp = new EbAuthResponse();
			string token = Request.Cookies[RoutingConstants.TWOFATOKEN];
			string authid = Request.Cookies[TokenConstants.USERAUTHID];
			User _u = this.Redis.Get<User>(authid);
			this.ServiceClient.BearerToken = _u.BearerToken;
			this.ServiceClient.RefreshToken = _u.RefreshToken;
			Authenticate2FAResponse response = this.ServiceClient.Post(new ResendOTP2FARequest { Token = token });
			authresp.AuthStatus = response.AuthStatus;
			authresp.ErrorMessage = response.ErrorMessage;
			authresp.Is2fa = response.Is2fa;
			authresp.OtpTo = response.OtpTo;
			return authresp;
		}
		public class BotAuth_andFormList
		{
			public string BearerToken { get; set; }
			public string RefreshToken { get; set; }
			public Dictionary<string,string> BotFormDict { get; set; }
			public string User { get; set; }
			public Dictionary<string, string> BotFormNames { get; set; }
			public object BotFormIcons { get; set; }
			public bool Status { get; set; } = false;
			public string ErrorMsg { get; set; }
			public string OtpTo { get; set; }
			public bool Is2Factor { get; set; } = false;
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

		[HttpGet("Bots")]
		public IActionResult Bots(string bt)
		{
			//var host = this.HttpContext.Request.Host;
			//string[] hostParts = host.Host.Split(CharConstants.DOT);
			//if (!(hostParts.Length > 1))
			//{
			//    return RedirectToAction("SignIn", "Common");
			//}
			if (ViewBag.WhichConsole == "uc")
			{
				this.ServiceClient.Headers.Add("SolId", ViewBag.SolutionId);
				GetBotsResponse BotsObj = this.ServiceClient.Get<GetBotsResponse>(new GetBotsRequest { Id_lst = bt });
				ViewBag.BotDetails = EbSerializers.Json_Serialize(BotsObj.BotList);
				return View();
			}
			else
			{
				return Redirect("/statuscode/404"); 
			}
		}

		//copied to boti - febin
		//public dynamic GetCurForm(string refreshToken, string bearerToken, string refid)
		//      {
		//          this.ServiceClient.BearerToken = bearerToken;
		//          this.ServiceClient.RefreshToken = refreshToken;
		//          var formObj = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });

		//          var Obj = EbSerializers.Json_Deserialize(formObj.Data[0].Json);
		//          if (Obj is EbBotForm)
		//          {
		//              //EbBotForm obj = Obj as EbBotForm;
		//              foreach (EbControl control in Obj.Controls)
		//              {
		//                  if (control is EbSimpleSelect)
		//                  {
		//                      (control as EbSimpleSelect).InitFromDataBase(this.ServiceClient);
		//                  }
		//                  else if (control is EbDynamicCardSet)
		//                  {
		//				EbDynamicCardSet EbDynamicCards = (control as EbDynamicCardSet);
		//				EbDynamicCards.InitFromDataBase(this.ServiceClient);
		//				EbDynamicCards.BareControlHtml = EbDynamicCards.GetBareHtml();
		//                  }
		//                  //else if (control is EbImage)
		//                  //{
		//                  //    (control as EbCards).InitFromDataBase(this.ServiceClient);
		//                  //}
		//              }
		//          }
		//          if (Obj is EbTableVisualization)
		//          {
		//              EbTableVisualization Tobj = (Obj as EbTableVisualization);
		//              string BotCols = "[";
		//              string BotData = "[";
		//              int i = 0;

		//              foreach (DVBaseColumn col in Tobj.Columns)
		//              {
		//                  BotCols += "{" + "\"data\":" + i++ + ",\"title\":\"" + col.Name + "\"},";
		//              }
		//              BotCols = BotCols.TrimEnd(',') + "]";

		//              DataSourceDataResponse dresp = this.ServiceClient.Get<DataSourceDataResponse>(new DataSourceDataRequest { RefId = Tobj.DataSourceRefId, Draw = 1 });
		//              var data = dresp.Data;
		//              foreach (EbDataRow row in data)
		//              {
		//                  i = 0;
		//                  BotData += "{";
		//                  foreach (var item in row)
		//                  {
		//                      BotData += "\"" + i++ + "\":\"" + item + "\",";
		//                      //BotData += "\"" + item + "\",";
		//                  }
		//                  BotData = BotData.TrimEnd(',') + "},";
		//              }
		//              BotData = BotData.TrimEnd(',') + "]";

		//              Tobj.BotCols = BotCols;
		//              Tobj.BotData = BotData;
		//              return EbSerializers.Json_Serialize(Tobj);
		//          }
		//          if (Obj is EbChartVisualization)
		//          {
		//              return EbSerializers.Json_Serialize(Obj);
		//          }
		//          //else if (Obj is EbChartVisualization)
		//          //{
		//          //}
		//          return Obj;
		//      }


		public IActionResult SurveyAuth(int SurveyId, string FbId, string Name, string Email, string Cid)
		{
			Dictionary<string, string> _Meta = new Dictionary<string, string> {
					{ TokenConstants.WC, "bc" },
					{ TokenConstants.CID, Cid },
					{ TokenConstants.SOCIALID, FbId },
					{ "emailId", Email },
					{ "anonymous", "true" },
					{ "user_name", Name }
			};

			this.ServiceClient.Headers.Add("SolId", ViewBag.SolutionId);

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

				SurveyMasterResponse resp = this.ServiceClient.Post(new SurveyMasterRequest
				{
					SurveyId = SurveyId,
					AnonId = authResponse.AnonId,
					UserId = authResponse.User.UserId
				});

				return ViewComponent("EbQuestionNaire", new
				{
					sid = SurveyId,
					bToken = HelperFunction.GetEncriptedString_Aes(authResponse.BearerToken + CharConstants.DOT + authResponse.AnonId.ToString()),
					rToken = authResponse.RefreshToken,
					masterid = resp.Id
				});
			}
			else
			{
				return null;
			}
		}

	}

}