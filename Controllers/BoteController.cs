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
using ExpressBase.Objects.ObjectContainers;
using System.IdentityModel.Tokens.Jwt;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using ExpressBase.Common;

namespace ExpressBase.Web.Controllers
{
    public class BoteController : EbBaseNewController
    {
        public BoteController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [HttpGet]
        public IActionResult Bot(string tid)
        {
            ViewBag.tid = tid;
            return View();
        }

        [HttpGet]
        public string GetSamp(string refid, string socialId)
        {
            string result = "SocialId not in Database";

            try
            {
                string cid = refid.Split('-')[0].Trim();
               // string authResponse = AuthAndGetformlist(refid, socialId);
                if (AuthAndGetformlist(refid, socialId) != null)
                {
                    var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
                    var dsobj = Common.EbSerializers.Json_Deserialize(resultlist.Data[0].Json);
                    dsobj.Status = resultlist.Data[0].Status;
                    dsobj.VersionNumber = resultlist.Data[0].VersionNumber;
                    result = dsobj.GetHtml();
                }
            }
            catch (Exception e)
            {
                result = e.Message;
            }

            return result;
        }

        [HttpGet]
        public string GetObjHtml(string refid, string socialId)
        {
            var host = this.HttpContext.Request.Host;
            string[] subdomain = host.Host.Split('.');
            string whichconsole = null;
            var req = this.HttpContext.Request.Form;
            if (host.Host.EndsWith("azurewebsites.net"))
            {
                if (subdomain.Length == 4) // USER CONSOLE
                {
                    if (!string.IsNullOrEmpty(req["console"]))
                    {
                        ViewBag.cid = subdomain[0];
                        whichconsole = "dc";
                    }
                    else
                    {
                        ViewBag.cid = subdomain[0];
                        whichconsole = "uc";
                    }

                }
                else // TENANT CONSOLE
                {
                    ViewBag.cid = "expressbase";
                    whichconsole = "tc";
                }
            }
            else if (host.Host.EndsWith("expressbase.com") || host.Host.EndsWith("expressbase.org"))
            {
                if (subdomain.Length == 3) // USER CONSOLE
                {
                    if (!string.IsNullOrEmpty(req["console"]))
                    {
                        ViewBag.cid = subdomain[0];
                        whichconsole = "dc";
                    }
                    else
                    {
                        ViewBag.cid = subdomain[0];
                        whichconsole = "uc";
                    }

                }
                else // TENANT CONSOLE
                {
                    ViewBag.cid = "expressbase";
                    whichconsole = "tc";
                }
            }
            else if (host.Host.EndsWith("localhost"))
            {
                if (subdomain.Length == 2) // USER CONSOLE
                {
                    if (!string.IsNullOrEmpty(req["console"]))
                    {
                        ViewBag.cid = subdomain[0];
                        whichconsole = "dc";
                    }
                    else
                    {
                        ViewBag.cid = subdomain[0];
                        whichconsole = "uc";
                    }
                }
                else // TENANT CONSOLE
                {
                    ViewBag.cid = "expressbase";
                    whichconsole = "tc";
                }
            }
            else
            {
                if (subdomain.Length == 5) // USER CONSOLE
                {
                    if (!string.IsNullOrEmpty(req["console"]))
                    {
                        ViewBag.cid = subdomain[0];
                        whichconsole = "dc";
                    }
                    else
                    {
                        ViewBag.cid = subdomain[0];
                        whichconsole = "uc";
                    }
                }
                else
                {
                    ViewBag.cid = "expressbase";
                    whichconsole = "tc";
                }
            }

           // string authResponse = ;

            if (AuthAndGetformlist(refid, socialId, whichconsole) != null)
            {
                var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
                var dsobj = Common.EbSerializers.Json_Deserialize(resultlist.Data[0].Json);
                dsobj.Status = resultlist.Data[0].Status;
                dsobj.VersionNumber = resultlist.Data[0].VersionNumber;
                return dsobj.GetHtml();
            }

            return "SocialId not in Database";
        }

        [HttpPost]
        public async Task<string> UploadImageOrginal(string base64,string filename, string refreshToken, string bearerToken)
        {
            this.ServiceClient.BearerToken = bearerToken;
            this.ServiceClient.RefreshToken = refreshToken;
            string Id = string.Empty;
            string url = string.Empty;
            byte[] myFileContent;
            try
            {
                UploadImageRequest uploadImageRequest = new UploadImageRequest();
                uploadImageRequest.ImageInfo = new FileMeta();
                uploadImageRequest.IsAsync = false;
                myFileContent = System.Convert.FromBase64String(base64);
                uploadImageRequest.ImageByte = myFileContent;
                uploadImageRequest.ImageInfo.FileType = "jpg";
                uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                uploadImageRequest.ImageInfo.FileName = filename;

                Id = this.ServiceClient.Post<string>(uploadImageRequest);
                if (ViewBag.cid == "expressbase" && ViewBag.wc == "tc")
                    url = string.Format("http://localhost:5000/static/{0}.{1}", Id, uploadImageRequest.ImageInfo.FileType);
                else
                    url = string.Format("http://{0}.localhost:5000/static/{1}.{2}", ViewBag.cid, Id, uploadImageRequest.ImageInfo.FileType);

            }
            catch (Exception e)
            {
                return "upload failed";
            }

            return url;
        }

        [HttpPost]
        public List<object> AuthAndGetformlist(string cid, string socialId, string wc = "tc")
        {
            MyAuthenticateResponse authResponse = this.ServiceClient.Send<MyAuthenticateResponse>(new Authenticate
            {
                provider = CredentialsAuthProvider.Name,
                UserName = "NIL",
                Password = "NIL",
                Meta = new Dictionary<string, string> { { "wc", wc }, { "cid", cid }, { "socialId", socialId } },
            });
            if(authResponse != null)
            {
                this.ServiceClient.BearerToken = authResponse.BearerToken;
                this.ServiceClient.RefreshToken = authResponse.RefreshToken;
                var tokenS = (new JwtSecurityTokenHandler()).ReadToken(authResponse.BearerToken) as JwtSecurityToken;


                ViewBag.cid = tokenS.Claims.First(claim => claim.Type == "cid").Value;
                ViewBag.wc = tokenS.Claims.First(claim => claim.Type == "wc").Value;
                ViewBag.email = tokenS.Claims.First(claim => claim.Type == "email").Value;

                User user = this.Redis.Get<User>(string.Format("{0}-{1}-{2}", ViewBag.cid, ViewBag.email, ViewBag.wc));
                var Ids = String.Join(",", user.EbObjectIds);
                var formlist = this.ServiceClient.Get<GetBotForm4UserResponse>(new GetBotForm4UserRequest { BotFormIds = "{" + Ids + "}" });
                List<object> returnlist = new List<object>();
                returnlist.Add(authResponse);
                returnlist.Add(formlist.BotForms);
                return returnlist;
            }
            else
            {
                return null;
            }
           
        }

        public EbBotForm GetCurForm(string refreshToken, string bearerToken, string refid)
        {
            this.ServiceClient.BearerToken = bearerToken;
            this.ServiceClient.RefreshToken = refreshToken;
            var formObj = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
            EbBotForm obj = EbSerializers.Json_Deserialize(formObj.Data[0].Json);
            string _selects = string.Empty;
            foreach (EbControl control in obj.Controls)
            {
                if (control is EbSimpleSelect)
                {
                    (control as EbSimpleSelect).GetOptionsHtml(this.ServiceClient);    
                }
            }
            return obj;
        }
    }
}