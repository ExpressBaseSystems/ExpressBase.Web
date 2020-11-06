using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Common;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using Microsoft.AspNetCore.Http;
using System.Xml;
using System.IO;
using ExpressBase.Common.Extensions;
using ExpressBase.Common.Constants;
using ServiceStack.Auth;
using ExpressBase.Common.EbServiceStack.ReqNRes;
using ExpressBase.Common.Enums;
using Microsoft.Net.Http.Headers;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Data;
using ExpressBase.Common.Connections;
using System.Net;
using ExpressBase.Common.NotificationHubs;
using ExpressBase.Security;
using ExpressBase.Objects;

namespace ExpressBase.Web.Controllers
{
    public class ApiController : EbBaseIntApiController
    {
        public ApiController(IServiceClient _client, IRedisClient _redis, IEbStaticFileClient _sfc, IEbAuthClient _auth) : base(_client, _redis, _sfc, _auth)
        {

        }

        [HttpGet("/api/{_name}/{_version}/{format?}")]
        public object Api(string _name, string _version, string format = "json")
        {
            var watch = new System.Diagnostics.Stopwatch(); watch.Start();
            ApiResponse resp = null;
            try
            {
                Dictionary<string, object> parameters = HttpContext.Request.Query.Keys.Cast<string>()
               .ToDictionary(k => k, v => HttpContext.Request.Query[v] as object);

                if (this.Authenticated)
                {
                    resp = this.ServiceClient.Get(new ApiRequest
                    {
                        Name = _name,
                        Version = _version,
                        Data = parameters
                    });

                    if (resp.Result != null && resp.Result.GetType() == typeof(ApiScript))
                    {
                        resp.Result = JsonConvert.DeserializeObject<dynamic>((resp.Result as ApiScript).Data);
                    }

                    watch.Stop();
                    resp.Name = _name;
                    resp.Version = _version;
                    resp.Message.ExecutedOn = DateTime.UtcNow.ToString();
                    resp.Message.ExecutionTime = watch.ElapsedMilliseconds.ToString() + " ms";
                }
                else
                {
                    watch.Stop();
                    resp = new ApiResponse
                    {
                        Name = _name,
                        Version = _version,
                        Message = new ApiMessage
                        {
                            Status = "Error",
                            Description = ViewBag.Message,
                            ExecutedOn = DateTime.UtcNow.ToString(),
                            ExecutionTime = watch.ElapsedMilliseconds.ToString() + " ms"
                        }
                    };
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.Message);
                watch.Stop();
                resp = new ApiResponse
                {
                    Name = _name,
                    Version = _version,
                    Message = new ApiMessage
                    {
                        Status = "Error",
                        Description = "Execution failed with unknown error's",
                        ExecutedOn = DateTime.UtcNow.ToString(),
                        ExecutionTime = watch.ElapsedMilliseconds.ToString() + " ms"
                    }
                };
            }

            if (format.ToLower().Equals("xml"))
                return this.ToXML(resp);
            else
                return resp;
        }

        [HttpPost("/api/{_name}/{_version}/{format?}")]
        public object Api(string _name, string _version, [FromForm] Dictionary<string, string> form, string format = "json")
        {
            var watch = new System.Diagnostics.Stopwatch(); watch.Start();
            ApiResponse resp = null;
            Dictionary<string, object> parameters = null;
            try
            {
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

                if (this.Authenticated)
                {
                    resp = this.ServiceClient.Get(new ApiRequest
                    {
                        Name = _name,
                        Version = _version,
                        Data = parameters
                    });

                    if (resp.Result != null && resp.Result.GetType() == typeof(ApiScript))
                    {
                        resp.Result = JsonConvert.DeserializeObject<dynamic>((resp.Result as ApiScript).Data);
                    }
                    watch.Stop();
                    resp.Name = _name;
                    resp.Version = _version;
                    resp.Message.ExecutedOn = DateTime.UtcNow.ToString();
                    resp.Message.ExecutionTime = watch.ElapsedMilliseconds.ToString() + " ms";
                }
                else
                {
                    watch.Stop();
                    resp = new ApiResponse
                    {
                        Name = _name,
                        Version = _version,
                        Message = new ApiMessage
                        {
                            Status = "Error",
                            Description = ViewBag.Message,
                            ExecutedOn = DateTime.UtcNow.ToString(),
                            ExecutionTime = watch.ElapsedMilliseconds.ToString() + " ms"
                        }
                    };
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.Message);
                watch.Stop();
                resp = new ApiResponse
                {
                    Name = _name,
                    Version = _version,
                    Message = new ApiMessage
                    {
                        Status = "Error",
                        Description = "Execution failed with unknown error's",
                        ExecutedOn = DateTime.UtcNow.ToString(),
                        ExecutionTime = watch.ElapsedMilliseconds.ToString() + " ms"
                    }
                };
            }

            if (format.ToLower().Equals("xml"))
                return this.ToXML(resp);
            else
                return resp;
        }

        [HttpGet("/api/{api_name}/{ver}/metadata")]
        public IActionResult ApiMetaData(string api_name, string ver)
        {
            if (this.IsValidSolution)
            {
                ApiMetaResponse resp = this.ServiceClient.Get(new ApiMetaRequest { Name = api_name, Version = ver, SolutionId = this.IntSolutionId });
                ViewBag.Meta = resp;
            }
            else
                return Redirect("/StatusCode/700");

            return View();
        }

        [HttpGet("/api/metadata")]
        public IActionResult ApiAllMeta()
        {
            if (this.IsValidSolution)
            {
                ApiAllMetaResponse resp = this.ServiceClient.Get(new ApiAllMetaRequest { SolutionId = this.IntSolutionId });
                ViewBag.Allmeta = resp.AllMetas;
            }
            else
                return Redirect("/StatusCode/700");
            return View();
        }

        [HttpGet("/api/authenticate")]
        [HttpPost("/api/authenticate")]
        public ApiAuthResponse ApiLogin(string username, string password)
        {
            ApiAuthResponse response = new ApiAuthResponse();
            try
            {
                MyAuthenticateResponse authResponse = this.AuthClient.Get<MyAuthenticateResponse>(new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = username,
                    Password = (password + username).ToMD5Hash(),
                    Meta = new Dictionary<string, string> {
                        { RoutingConstants.WC, RoutingConstants.UC },
                        { TokenConstants.CID, this.IntSolutionId },
                        { TokenConstants.IP, this.RequestSourceIp},
                        { RoutingConstants.USER_AGENT, this.UserAgent}
                    },
                    RememberMe = true
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
            catch (Exception e)
            {
                response.IsValid = false;
                Console.WriteLine("api auth request failed: " + e.Message);
            }
            return response;
        }

        [HttpGet("/api/auth")]
        [HttpPost("/api/auth")]
        public ApiAuthResponse ApiLoginByMd5(string username, string password, bool sso = false)
        {
            ApiAuthResponse response = new ApiAuthResponse();
            try
            {
                Authenticate authRequest = new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = username,
                    Password = password,
                    Meta = new Dictionary<string, string> {
                        { RoutingConstants.WC, RoutingConstants.MC },
                        { TokenConstants.CID, this.IntSolutionId },
                        { TokenConstants.IP, this.RequestSourceIp},
                        { RoutingConstants.USER_AGENT, this.UserAgent}
                    },
                    RememberMe = true
                };

                if (sso) authRequest.Meta.Add("sso", "true");

                MyAuthenticateResponse authResponse = this.AuthClient.Get<MyAuthenticateResponse>(authRequest);

                if (authResponse != null && authResponse.User != null)
                {
                    response.IsValid = true;
                    response.BToken = authResponse.BearerToken;
                    response.RToken = authResponse.RefreshToken;
                    response.UserId = authResponse.User.UserId;
                    response.DisplayName = authResponse.User.FullName;
                    response.User = authResponse.User;

                    try
                    {
                        Eb_Solution s_obj = GetSolutionObject(this.IntSolutionId);

                        if (s_obj != null && s_obj.Is2faEnabled)
                        {
                            response.Is2FEnabled = s_obj.Is2faEnabled;
                            this.ServiceClient.BearerToken = authResponse.BearerToken;
                            this.ServiceClient.RefreshToken = authResponse.RefreshToken;

                            Authenticate2FAResponse resp = this.ServiceClient.Post(new Authenticate2FARequest
                            {
                                MyAuthenticateResponse = authResponse,
                                SolnId = ViewBag.SolutionId,
                            });

                            if (resp != null)
                            {
                                response.TwoFAToken = resp.TwoFAToken;
                                response.TwoFAStatus = resp.AuthStatus;
                                response.TwoFAToAddress = resp.OtpTo;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("2FA failed :: " + ex.Message);
                    }

                    //set user dp to the authresponse
                    SetUserDp(response);
                }
                else
                    response.IsValid = false;
            }
            catch (Exception e)
            {
                response.IsValid = false;
                Console.WriteLine("api auth request failed: " + e.Message);
            }
            return response;
        }

        private void SetUserDp(ApiAuthResponse authresp)
        {
            this.FileClient.BearerToken = authresp.BToken;
            this.FileClient.RefreshToken = authresp.RToken;
            this.FileClient.Headers.Add(CacheConstants.RTOKEN, authresp.RToken);

            try
            {
                DownloadFileResponse dfs = this.FileClient.Get(new DownloadDpRequest
                {
                    ImageInfo = new ImageMeta
                    {
                        FileName = authresp.UserId.ToString(),
                        FileType = StaticFileConstants.PNG,
                        FileCategory = EbFileCategory.Dp
                    }
                });
                authresp.DisplayPicture = dfs.StreamWrapper.Memorystream.ToArray();
            }
            catch (Exception ex)
            {
                Console.WriteLine("api auth request getdp: " + ex.Message);
            }
        }

        [HttpPost("/api/auth_sso")]
        public ApiAuthResponse ApiLoginBySSO(string username, OtpType type)
        {
            ApiAuthResponse response = new ApiAuthResponse();

            if (this.IsValidSolution)
            {
                username = username?.Trim();

                try
                {
                    Authenticate2FAResponse resp = this.ServiceClient.Post(new SendSignInOtpRequest
                    {
                        UName = username,
                        SignInOtpType = type,
                        SolutionId = this.IntSolutionId,
                        WhichConsole = TokenConstants.MC
                    });

                    response.IsValid = resp == null ? false : resp.AuthStatus;

                    if (response.IsValid)
                    {
                        response.Is2FEnabled = resp.Is2fa;
                        response.TwoFAToAddress = resp.OtpTo;
                        response.TwoFAToken = resp.TwoFAToken;
                        response.UserAuthId = resp.UserAuthId;
                    }
                }
                catch (Exception)
                {
                    Console.WriteLine("Api Autheticate SSO failed");
                }
            }

            return response;
        }

        [HttpPost("/api/verify_otp")]
        public ApiAuthResponse VerifyOTP(string token, string authid, string otp)
        {
            ApiAuthResponse resp = new ApiAuthResponse();

            if (this.IsValidSolution)
            {
                User user = this.Authenticated ? this.LoggedInUser : GetUserObject(authid);

                Authenticate2FAResponse validateResp = null;
                try
                {
                    validateResp = this.ServiceClient.Post(new ValidateTokenRequest
                    {
                        Token = token,
                        UserAuthId = authid
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine("OTP validation failed" + ex.Message);
                }

                if (validateResp != null && validateResp.AuthStatus)
                {
                    if (otp == user.Otp)
                    {
                        resp.IsValid = true;

                        if (!this.Authenticated)
                        {
                            string username = string.IsNullOrEmpty(user.Email) ? user.PhoneNumber : user.Email;

                            try
                            {
                                ApiAuthResponse authresp = this.ApiLoginByMd5(username, "NIL", true);
                                resp.BToken = authresp.BToken;
                                resp.RToken = authresp.RToken;
                                resp.UserId = authresp.User.UserId;
                                resp.DisplayName = authresp.User.FullName;
                                resp.User = authresp.User;
                                resp.DisplayPicture = authresp.DisplayPicture;
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine("Api auth failed to internaly" + ex.Message);
                            }
                        }
                    }
                }
            }
            return resp;
        }

        [HttpPost("/api/resend_otp")]
        public ApiGenerateOTPResponse ResendOTP(string token, string authid)
        {
            ApiGenerateOTPResponse resp = new ApiGenerateOTPResponse();

            if (this.IsValidSolution)
            {
                bool sso = !string.IsNullOrEmpty(authid);
                User user = this.Authenticated ? this.LoggedInUser : GetUserObject(authid);

                Authenticate2FAResponse response;
                if (sso)
                {
                    response = this.ServiceClient.Post(new ResendOTPSignInRequest
                    {
                        Token = token,
                        SolnId = this.IntSolutionId,
                        UserAuthId = user.AuthId
                    });
                }
                else
                {
                    response = this.ServiceClient.Post(new ResendOTP2FARequest
                    {
                        Token = token
                    });
                }

                if (response != null && response.AuthStatus)
                {
                    resp.IsValid = true;
                    resp.StatusCode = HttpStatusCode.OK;
                }
            }
            else
                resp.StatusCode = HttpStatusCode.NotFound;

            return resp;
        }

        [HttpPost("/api/upload")]
        public async Task<ApiResponse> UploadFile()
        {
            ApiResponse ApiResp = new ApiResponse { Result = new List<ApiFileData>() };
            UploadAsyncResponse res = new UploadAsyncResponse();
            var req = this.HttpContext.Request.Form;
            string fname = string.Empty, _context = string.Empty;

            if (req.ContainsKey("Context") && !string.IsNullOrEmpty(req["Context"]))
                _context = req["Context"];
            try
            {
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
                        uploadFileRequest.FileDetails.FileCategory = EbFileCategory.File;
                        uploadFileRequest.FileDetails.Context = _context;
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

        [HttpPost("/api/files/upload")]
        public async Task<List<ApiFileData>> UploadFiles()
        {
            List<ApiFileData> ApiFiles = new List<ApiFileData>();

            var req = this.HttpContext.Request.Form;
            string _filename = string.Empty;

            if (!ViewBag.IsValid)
                throw new Exception();

            try
            {
                FileUploadRequest fileRequest = new FileUploadRequest();
                foreach (IFormFile formFile in req.Files)
                {
                    if (formFile.Length <= 0)
                        return ApiFiles;

                    _filename = formFile.FileName.ToLower();
                    fileRequest.FileCategory = this.GetFileType(_filename);

                    byte[] myFileContent;
                    using (var memoryStream = new MemoryStream())
                    {
                        await formFile.CopyToAsync(memoryStream);
                        memoryStream.Seek(0, SeekOrigin.Begin);
                        myFileContent = new byte[memoryStream.Length];
                        await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);
                        fileRequest.FileByte = myFileContent;
                    }

                    fileRequest.FileDetails.FileName = _filename;
                    fileRequest.FileDetails.FileType = _filename.SplitOnLast(CharConstants.DOT).Last();
                    fileRequest.FileDetails.Length = fileRequest.FileByte.Length;
                    fileRequest.FileDetails.FileCategory = fileRequest.FileCategory;
                    fileRequest.FileDetails.MetaDataDictionary = new Dictionary<String, List<string>>();

                    if (req.ContainsKey("context") && !string.IsNullOrEmpty(req["context"]))
                        fileRequest.FileDetails.Context = req["context"];

                    if (req.ContainsKey("categories") && !string.IsNullOrEmpty(req["categories"]))
                        fileRequest.FileDetails.MetaDataDictionary.Add("Category", req["categories"].ToString().Split(CharConstants.COMMA).ToList());

                    if (req.ContainsKey("tags") && !string.IsNullOrEmpty(req["tags"]))
                        fileRequest.FileDetails.MetaDataDictionary.Add("Tags", req["tags"].ToString().Split(CharConstants.COMMA).ToList());

                    var res = this.FileClient.Post<UploadAsyncResponse>(fileRequest);

                    ApiFiles.Add(new ApiFileData
                    {
                        FileName = _filename,
                        FileType = _filename.SplitOnLast(CharConstants.DOT).Last(),
                        FileRefId = res.FileRefId
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception:" + ex.ToString());
            }
            return ApiFiles;
        }

        private EbFileCategory GetFileType(string FileName)
        {
            string ext = FileName.SplitOnLast(CharConstants.DOT).Last();

            List<string> imageTypes = new List<string> { "jpg", "jpeg", "bmp", "gif", "png" };

            if (imageTypes.Contains(ext))
                return EbFileCategory.Images;
            else
                return EbFileCategory.File;
        }

        [HttpGet("/api/files/{filename}")]
        public IActionResult GetFile(string filename)
        {
            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            ActionResult resp = new EmptyResult();

            try
            {
                DownloadFileResponse dfs = this.FileClient.Get<DownloadFileResponse>(new DownloadFileByIdRequest
                {
                    FileDetails = new FileMeta { FileRefId = Convert.ToInt32(filename.SplitOnLast(CharConstants.DOT).First()), FileCategory = EbFileCategory.File }
                });

                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, GetMime(filename));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }
            return resp;
        }

        [HttpGet("/api/get_file")]
        public ApiFileResponse GetStaticFiles(EbFileCategory category, string filename)
        {
            ApiFileResponse response = new ApiFileResponse();

            if (this.Authenticated)
            {
                try
                {
                    int id = Convert.ToInt32(filename.SplitOnLast(CharConstants.DOT).First());
                    DownloadFileResponse dfs = null;

                    if (category == EbFileCategory.File)
                    {
                        dfs = this.FileClient.Get(new DownloadFileByIdRequest
                        {
                            FileDetails = new FileMeta
                            {
                                FileRefId = id,
                                FileCategory = EbFileCategory.File
                            }
                        });
                    }
                    else if (category == EbFileCategory.Images)
                    {
                        dfs = this.FileClient.Get(new DownloadImageByIdRequest
                        {
                            ImageInfo = new ImageMeta
                            {
                                FileRefId = id,
                                FileCategory = EbFileCategory.Images,
                                ImageQuality = ImageQuality.original
                            }
                        });
                    }

                    if (dfs.StreamWrapper != null)
                    {
                        response.StatusCode = HttpStatusCode.OK;

                        //Read the File into a Byte Array.
                        response.Bytea = dfs.StreamWrapper.Memorystream.ToArray();
                        response.ContentType = this.GetMime(filename);
                    }
                    else
                        response.StatusCode = HttpStatusCode.NotFound;
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    response.StatusCode = HttpStatusCode.NotFound;
                }
            }
            return response;
        }

        private string GetMime(string fname)
        {
            return StaticFileConstants.GetMime[fname.SplitOnLast(CharConstants.DOT).Last().ToLower()];
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
            XmlDocument doc = JsonConvert.DeserializeXmlNode(json, "Root");
            XmlNode docNode = doc.CreateXmlDeclaration("1.0", "UTF-8", null);
            doc.PrependChild(docNode);
            return doc.InnerXml;
        }

        [HttpGet("api/validate_solution")]
        public ValidateSidResponse ValidateSolution()
        {
            ValidateSidResponse resp = new ValidateSidResponse { Message = "Success" };
            try
            {
                resp.IsValid = this.IsValidSolution;

                if (IsValidSolution)
                {
                    try
                    {
                        DownloadFileResponse dfs = this.FileClient.Get(new DownloadLogoExtRequest
                        {
                            SolnId = this.IntSolutionId,
                        });
                        resp.Logo = dfs.StreamWrapper.Memorystream.ToArray();
                    }
                    catch (Exception ex)
                    {
                        resp.Message = "Solution is valid. Failed to fetch logo";
                        Console.WriteLine(ex.Message);
                    }

                    resp.SolutionObj = this.GetSolutionObject(this.IntSolutionId);

                    if (resp.SolutionObj != null && resp.SolutionObj.IsMobileSignupEnabled(out string refid))
                    {
                        try
                        {
                            EbMobilePage mobilePage = this.Redis.Get<EbMobilePage>(refid);
                            resp.SignUpPage = EbSerializers.Json_Serialize(mobilePage);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("Redis exception while getting mobile page");
                            Console.WriteLine(ex.Message);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                resp.Message = ex.Message;
            }
            return resp;
        }

        [HttpGet("api/get_solution_data")]
        public EbMobileSolutionData GetSolutionDataForMobile(bool export = true)
        {
            if (Authenticated)
            {
                EbMobileSolutionData data = this.ServiceClient.Get(new MobileSolutionDataRequest()
                {
                    Export = export
                });

                data.StatusCode = HttpStatusCode.OK;

                try
                {
                    Eb_Solution s_obj = GetSolutionObject(this.IntSolutionId);

                    if (s_obj == null) throw new Exception("Solution object null");

                    var locations = s_obj.Locations ?? new Dictionary<int, EbLocation>();

                    if (this.LoggedInUser.IsAdmin())
                    {
                        data.Locations.AddRange(locations.Select(kvp => kvp.Value).ToList());
                    }
                    else if (this.LoggedInUser.LocationIds != null)
                    {
                        if (this.LoggedInUser.LocationIds.Contains(-1))
                            data.Locations.AddRange(locations.Select(kvp => kvp.Value).ToList());
                        else
                        {
                            foreach (int _locid in this.LoggedInUser.LocationIds)
                            {
                                if (locations.ContainsKey(_locid))
                                    data.Locations.Add(locations[_locid]);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Exception at Solution data api,locations :: " + ex.Message);
                }

                return data;
            }

            return new EbMobileSolutionData { StatusCode = HttpStatusCode.Unauthorized };
        }

        [HttpPost("api/push_data")]
        public InsertDataFromWebformResponse WebFormSaveCommonApi([FromForm] Dictionary<string, string> form)
        {
            InsertDataFromWebformResponse Resp = null;

            if (Authenticated)
            {
                try
                {
                    WebformData FormData = JsonConvert.DeserializeObject<WebformData>(form["webform_data"]);
                    int RowId = Convert.ToInt32(form["rowid"]);
                    string RefId = form["refid"];
                    int LocId = Convert.ToInt32(form["locid"]);

                    Resp = ServiceClient.Post(new InsertDataFromWebformRequest
                    {
                        RefId = RefId,
                        FormData = FormData,
                        RowId = RowId,
                        CurrentLoc = LocId
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine("EXCEPTION AT webform_save API" + ex.Message);
                    Console.WriteLine(ex.StackTrace);
                }
            }
            return Resp;
        }

        [HttpPost("api/get_data")]
        public MobileVisDataResponse GetData(string refid, int limit, int offset, string param, string sort_order, string search, bool is_powerselect)
        {
            MobileVisDataResponse data = new MobileVisDataResponse();
            try
            {
                if (Authenticated)
                {
                    if (string.IsNullOrEmpty(refid))
                    {
                        data.Message = "Data source refid must be set";
                        return data;
                    }

                    MobileVisDataRequest request = new MobileVisDataRequest()
                    {
                        DataSourceRefId = refid,
                        Limit = limit,
                        Offset = offset,
                        IsPowerSelect = is_powerselect
                    };

                    if (param != null)
                        request.Params.AddRange(JsonConvert.DeserializeObject<List<Param>>(param));

                    if (sort_order != null)
                        request.SortOrder.AddRange(JsonConvert.DeserializeObject<List<SortColumn>>(sort_order));

                    if (search != null)
                        request.SearchColumns.AddRange(JsonConvert.DeserializeObject<List<Param>>(search));

                    var response = this.ServiceClient.Get(request);
                    data.Data = response?.Data;
                    data.Message = "Success";
                }
                else
                    data.Message = ViewBag.Message;
            }
            catch (Exception ex)
            {
                data.Message = ex.Message;

                Console.WriteLine("EXCEPTION AT get_data API" + ex.Message);
                Console.WriteLine(ex.StackTrace);
            }
            return data;
        }

        [HttpGet("api/get_formdata")] //refid = mobileform
        public MobileFormDataResponse GetMobileFormData(string refid, int row_id, int loc_id)
        {
            MobileFormDataResponse resp = null;
            try
            {
                if (Authenticated)
                {
                    resp = this.ServiceClient.Get(new MobileFormDataRequest
                    {
                        MobilePageRefId = refid,
                        RowId = row_id,
                        LocId = loc_id
                    });
                }
                else
                    resp = new MobileFormDataResponse { Message = ViewBag.Message };
            }
            catch (Exception ex)
            {
                Console.WriteLine("EXCEPTION AT get_data API" + ex.Message);
                Console.WriteLine(ex.StackTrace);
            }
            return resp;
        }

        [HttpGet("api/map")]
        public IActionResult Maps(string bToken, string rToken, string type, double latitude, double longitude)
        {
            try
            {
                //to use internally also check token in cookie
                if (bToken == null && rToken == null)
                {
                    bToken = HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
                    rToken = HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];
                }

                if (this.IsValidSolution && IsTokensValid(rToken, bToken, this.ExtSolutionId))
                {
                    this.ServiceClient.BearerToken = bToken;
                    this.ServiceClient.RefreshToken = rToken;
                    this.ServiceClient.Headers.Add(CacheConstants.RTOKEN, rToken);

                    EbConnectionFactory connection = new EbConnectionFactory(this.IntSolutionId, this.Redis);
                    EbMapConCollection MapCollection = connection.MapConnection;

                    ViewBag.Maps = MapCollection;
                    ViewBag.Latitude = latitude;
                    ViewBag.Longitude = longitude;

                    MapVendors MapType;
                    if (type == null)
                        MapType = MapVendors.GOOGLEMAP;
                    else
                        Enum.TryParse(type, out MapType);

                    ViewBag.MapType = MapType;
                }
                else
                    return Unauthorized();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return View();
        }

        [HttpGet("api/get_actions")]
        public MyActionsResponse GetMyActions()
        {
            try
            {
                if (Authenticated)
                {
                    return this.ServiceClient.Get(new MyActionsRequest());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("EXCEPTION AT get_actions API" + ex.Message);
                Console.WriteLine(ex.StackTrace);
            }
            return new MyActionsResponse();
        }

        [HttpGet("api/get_actions/{id}")]
        public ParticularActionResponse GetParticularAction(int id)
        {
            ParticularActionResponse response = null;
            try
            {
                if (Authenticated)
                {
                    if (id == 0)
                    {
                        Console.WriteLine("GetParticularAction parameter id must be greater than 0");
                        return response;
                    }
                    response = this.ServiceClient.Get(new ParticularActionsRequest { ActionId = id });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("EXCEPTION AT get_actions API" + ex.Message);
                Console.WriteLine(ex.StackTrace);
            }
            return response;
        }

        [HttpGet("api/get_action_info")]
        public MyActionInfoResponse GetMyActionInfo(int stageid, string refid, int dataid)
        {
            try
            {
                if (Authenticated)
                {
                    return this.ServiceClient.Get(new MyActionInfoRequest
                    {
                        StageId = stageid,
                        WebFormDataId = dataid,
                        WebFormRefId = refid
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("EXCEPTION AT get_actions API" + ex.Message);
                Console.WriteLine(ex.StackTrace);
            }
            return new MyActionInfoResponse();
        }

        [HttpPost("api/init_device")]
        public EbDeviceRegistration InitializeDevice(string registration)
        {
            EbDeviceRegistration response = null;
            try
            {
                if (Authenticated)
                {
                    var req = JsonConvert.DeserializeObject<EbDeviceRegistrationRequest>(registration);

                    if (req != null)
                    {
                        response = this.ServiceClient.Post(req);
                    }
                }
                else
                    response = new EbDeviceRegistration { StatusCode = HttpStatusCode.Unauthorized };
            }
            catch (Exception ex)
            {
                Console.WriteLine("EXCEPTION AT init_device API" + ex.Message);
                Console.WriteLine(ex.StackTrace);
            }
            return response;
        }

        [HttpGet("api/notifications/get_registration_id")]
        public async Task<IActionResult> GetNFRegistrationId()
        {
            if (Authenticated)
            {
                try
                {
                    var client = EbAzureNFClient.Create(this.IntSolutionId, this.Redis);

                    string id = await client.CreateRegistrationId();

                    Console.WriteLine("NF Registration created : " + id);

                    return Ok(id);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }
            return Unauthorized();
        }

        [HttpDelete("api/notifications/delete_registration")]
        public async Task<IActionResult> DeleteNFRegistration(string regid)
        {
            if (Authenticated)
            {
                try
                {
                    var client = EbAzureNFClient.Create(this.IntSolutionId, this.Redis);

                    await client.DeleteRegistration(regid);

                    Console.WriteLine("NF Registrationid '" + regid + "' deleted");

                    return Ok();
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }
            return Unauthorized();
        }

        [HttpPost("api/notifications/register")]
        public async Task<EbNFRegisterResponse> RegisterForNotification(string regid, string device)
        {
            EbNFRegisterResponse resp;

            if (Authenticated)
            {
                if (device == null || regid == null)
                {
                    Console.WriteLine("push notification register request parameter unset");
                    return new EbNFRegisterResponse("Parameters empty");
                }

                DeviceRegistration reg = JsonConvert.DeserializeObject<DeviceRegistration>(device);

                try
                {
                    var client = EbAzureNFClient.Create(this.IntSolutionId, this.Redis);

                    resp = await client.Register(regid, reg);

                    Console.WriteLine("NF Registrationid '" + regid + "' deleted");
                }
                catch (Exception ex)
                {
                    resp = new EbNFRegisterResponse(ex.Message);
                    Console.WriteLine(ex.Message);
                }
            }
            else
            {
                Console.WriteLine("Unauthorized");
                resp = new EbNFRegisterResponse("Unauthorized");
            }
            return resp;
        }

        [HttpPost("api/notifications/send")]
        public async Task<EbNFResponse> SendNotification(string payload)
        {
            EbNFResponse resp;

            if (Authenticated)
            {
                if (string.IsNullOrEmpty(payload))
                {
                    Console.WriteLine("push notification send payload empty");
                    return new EbNFResponse("Parameters empty");
                }

                EbNFRequest req = JsonConvert.DeserializeObject<EbNFRequest>(payload);

                try
                {
                    var client = EbAzureNFClient.Create(this.IntSolutionId, this.Redis);

                    resp = await client.Send(req);
                }
                catch (Exception ex)
                {
                    resp = new EbNFResponse(ex.Message);
                    Console.WriteLine(ex.Message);
                }
            }
            else
            {
                Console.WriteLine("Unauthorized");
                resp = new EbNFResponse("Unauthorized");
            }
            return resp;
        }
    }
}

