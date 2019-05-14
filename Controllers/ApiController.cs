using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Common;
using ExpressBase.Common.Connections;
using ExpressBase.Common.Data;
using ExpressBase.Common.Messaging;
using ExpressBase.Common.Messaging.ExpertTexting;
using ExpressBase.Common.Messaging.Twilio;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects;
using System.Collections.Specialized;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Http;
using ExpressBase.Web.Models;
using System.Runtime.Serialization;
using System.Xml;
using System.Xml.Serialization;
using System.IO;
using System.Text;
using ExpressBase.Common.Extensions;
using ExpressBase.Common.Constants;
using ServiceStack.Auth;
using ExpressBase.Common.EbServiceStack.ReqNRes;
using ExpressBase.Common.Enums;

namespace ExpressBase.Web.Controllers
{
    public class ApiController : EbBaseIntApiController
    {
        public ApiController(IServiceClient _client, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_client, _redis, _sfc) { }

        [HttpGet("/api/{_name}/{_version}/{format}")]
        public object Api(string _name, string _version, string format)
        {
            ApiResponse resp = null;
            format = format.ToLower();
            Dictionary<string, object> parameters = HttpContext.Request.Query.Keys.Cast<string>()
                .ToDictionary(k => k, v => HttpContext.Request.Query[v] as object);

            if (ViewBag.IsValid)
            {
                resp = this.ServiceClient.Get(new ApiRequest
                {
                    Name = _name,
                    Version = _version,
                    Data = parameters
                });
            }
            else
                resp = new ApiResponse { Message = ViewBag.Message };

            if (resp.Result.GetType() == typeof(ApiScript))
            {
                resp.Result = JsonConvert.DeserializeObject<dynamic>((resp.Result as ApiScript).Data);
            }

            if (format.Equals("xml"))
                return this.ToXML(resp);
            else
                return resp;
        }


        [HttpPost("/api/{_name}/{_version}/{format}")]
        public object Api(string _name, string _version, string format, [FromForm]Dictionary<string, string> form)
        {
            ApiResponse resp = null;
            format = format.ToLower();
            Dictionary<string, object> parameters = null;
            if (form.Count <= 0)
            {
                parameters = HttpContext.Request.Query.Keys.Cast<string>()
                .ToDictionary(k => k, v => HttpContext.Request.Query[v] as object);
            }
            else
            {
                parameters = form.Keys.Cast<string>()
                .ToDictionary(k => k, v => form[v] as object);
            }

            if (ViewBag.IsValid)
            {
                resp = this.ServiceClient.Get(new ApiRequest
                {
                    Name = _name,
                    Version = _version,
                    Data = parameters
                });
            }
            else
                resp = new ApiResponse { Message = new ApiMessage { Status = "Error", Description = ViewBag.Message } };

            if (resp.Result.GetType() == typeof(ApiScript))
            {
                resp.Result = JsonConvert.DeserializeObject<dynamic>((resp.Result as ApiScript).Data);
            }

            if (format.Equals("xml"))
                return this.ToXML(resp);
            else
                return resp;
        }

        [HttpGet("/api/{api_name}/{ver}/metadata")]
        public IActionResult ApiMetaData(string api_name, string ver)
        {
            if (ViewBag.IsValidSol)
            {
                ApiMetaResponse resp = this.ServiceClient.Get(new ApiMetaRequest { Name = api_name, Version = ver, SolutionId = this.SultionId });
                ViewBag.Meta = resp;
            }
            else
                return Redirect("/StatusCode/700");

            return View();
        }

        [HttpGet("/api/metadata")]
        public IActionResult ApiAllMeta()
        {
            if (ViewBag.IsValidSol)
            {
                ApiAllMetaResponse resp = this.ServiceClient.Get(new ApiAllMetaRequest { SolutionId = this.SultionId });
                ViewBag.Allmeta = resp.AllMetas;               
            }
            else
                return Redirect("/StatusCode/700");
            return View();
        }

        [HttpGet("/api/authenticate")]
        [HttpPost("/api/authenticate")]
        public ApiAuthResponse ApiLogin(string username,string password)
        {
            ApiAuthResponse response = new ApiAuthResponse();
            try
            {
                MyAuthenticateResponse authResponse = this.ServiceClient.Get<MyAuthenticateResponse>(new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = username,
                    Password = (password + username).ToMD5Hash(),
                    Meta = new Dictionary<string, string> { { RoutingConstants.WC, RoutingConstants.UC }, { TokenConstants.CID, this.SultionId } },
                    RememberMe = true
                    //UseTokenCookie = true
                });

                if (authResponse != null && authResponse.User != null)
                {
                    response.IsValid = true;
                    response.BToken = authResponse.BearerToken;
                    response.RToken = authResponse.RefreshToken;
                    response.UserId = authResponse.User.UserId;
                    response.DisplayName = authResponse.User.FullName;
                }
                else
                    response.IsValid = false;
            }
            catch(Exception e)
            {
                response.IsValid = false;
                Console.WriteLine("api auth request failed: " + e.Message);
            }
            return response;
        }

        [HttpGet("/api/logout")]
        [HttpPost("/api/logout")]
        public void ApiLogOut()
        {

        }

        [HttpGet("/api/upload")]
        [HttpPost("/api/upload")]
        public async Task<ApiResponse> UploadFile()
        {
            ApiResponse ApiResp = new ApiResponse { Result = new List<ApiFileData>()};
            UploadAsyncResponse res = new UploadAsyncResponse();
            EbFileCategory _FileType = EbFileCategory.File;
            var req = this.HttpContext.Request.Form;
            string fname = string.Empty;
            try
            {
                if (req["FileType"] == "image")
                {
                    _FileType = EbFileCategory.Images;
                }
                UploadFileAsyncRequest uploadFileRequest = new UploadFileAsyncRequest();
                uploadFileRequest.FileDetails = new FileMeta();
                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0)
                    {
                        fname = formFile.FileName.ToLower();
                        byte[] myFileContent;
                        using (var memoryStream = new MemoryStream())
                        {
                            await formFile.CopyToAsync(memoryStream);
                            memoryStream.Seek(0, SeekOrigin.Begin);
                            myFileContent = new byte[memoryStream.Length];
                            await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);
                            uploadFileRequest.FileByte = myFileContent;
                        }
                        uploadFileRequest.FileDetails.FileName = formFile.FileName.ToLower();
                        uploadFileRequest.FileDetails.FileType = formFile.FileName.SplitOnLast(CharConstants.DOT).Last().ToLower();
                        uploadFileRequest.FileDetails.Length = uploadFileRequest.FileByte.Length;
                        uploadFileRequest.FileDetails.FileCategory = _FileType;
                        res = this.FileClient.Post<UploadAsyncResponse>(uploadFileRequest);

                        (ApiResp.Result as List<ApiFileData>).Add(new ApiFileData
                        {
                            FileName = formFile.FileName.ToLower(),
                            FileType = req["FileType"],
                            FileRefId = res.FileRefId
                        });
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString());
                (ApiResp.Result as List<ApiFileData>).Add(new ApiFileData
                {
                    FileName = fname,
                    FileType = req["FileType"],
                    FileRefId = 0
                });
            }
            return ApiResp;
        }

        private Dictionary<string, object> F2D(FormCollection collection)
        {
            Dictionary<string, object> dict = new Dictionary<string, object>();
            foreach (var pair in collection)
            {
                dict.Add(pair.Key, pair.Value);
            }
            return dict;
        }

        public string ToXML(ApiResponse _apiresp)
        {
            string json = JsonConvert.SerializeObject(_apiresp);
            XmlDocument doc = JsonConvert.DeserializeXmlNode(json,"Root");
            XmlNode docNode = doc.CreateXmlDeclaration("1.0", "UTF-8", null);
            doc.PrependChild(docNode);
            return doc.InnerXml;
        }
    }
}
