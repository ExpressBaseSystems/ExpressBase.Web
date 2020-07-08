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
using Microsoft.Azure.NotificationHubs;

namespace ExpressBase.Web.Controllers
{
    public class ApiController : EbBaseIntApiController
    {
        private NotificationHubProxy _nfClient;

        public ApiController(IServiceClient _client, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_client, _redis, _sfc)
        {
            _nfClient = new NotificationHubProxy();
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

                if (ViewBag.IsValid)
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
        public object Api(string _name, string _version, [FromForm]Dictionary<string, string> form, string format = "json")
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

                if (ViewBag.IsValid)
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
        public ApiAuthResponse ApiLogin(string username, string password)
        {
            ApiAuthResponse response = new ApiAuthResponse();
            try
            {
                MyAuthenticateResponse authResponse = this.ServiceClient.Get<MyAuthenticateResponse>(new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = username,
                    Password = (password + username).ToMD5Hash(),
                    Meta = new Dictionary<string, string> {
                        { RoutingConstants.WC, RoutingConstants.MC },
                        { TokenConstants.CID, this.SultionId },
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
        public ApiAuthResponse ApiLoginByMd5(string username, string password)
        {
            ApiAuthResponse response = new ApiAuthResponse();
            try
            {
                MyAuthenticateResponse authResponse = this.ServiceClient.Get<MyAuthenticateResponse>(new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = username,
                    Password = password,
                    Meta = new Dictionary<string, string> {
                        { RoutingConstants.WC, RoutingConstants.MC },
                        { TokenConstants.CID, this.SultionId },
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
                    response.User = authResponse.User;

                    try
                    {
                        Eb_Solution s_obj = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", this.SultionId));

                        if (authResponse.User.IsAdmin())
                        {
                            response.Locations.AddRange(s_obj.Locations.Select(kvp => kvp.Value).ToList());
                        }
                        else if (s_obj != null && authResponse.User.LocationIds != null)
                        {
                            if (authResponse.User.LocationIds.Contains(-1))
                                response.Locations.AddRange(s_obj.Locations.Select(kvp => kvp.Value).ToList());
                            else
                            {
                                foreach (int _locid in authResponse.User.LocationIds)
                                {
                                    if (s_obj.Locations.ContainsKey(_locid))
                                        response.Locations.Add(s_obj.Locations[_locid]);
                                }
                            }
                        }

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

                    try
                    {
                        this.FileClient.BearerToken = response.BToken;
                        this.FileClient.RefreshToken = response.RToken;
                        this.FileClient.Headers.Add(CacheConstants.RTOKEN, response.RToken);

                        DownloadFileResponse dfs = this.FileClient.Get(new DownloadDpRequest
                        {
                            ImageInfo = new ImageMeta
                            {
                                FileName = response.UserId.ToString(),
                                FileType = StaticFileConstants.PNG,
                                FileCategory = EbFileCategory.Dp
                            }
                        });
                        response.DisplayPicture = dfs.StreamWrapper.Memorystream.ToArray();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("api auth request getdp: " + ex.Message);
                    }
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

        [HttpPost("/api/verify_or_resend_otp")]
        public ApiTwoFactorResponse Verify2FA(string token, string otp, bool resend)
        {
            ApiTwoFactorResponse resp = new ApiTwoFactorResponse();

            if (Authenticated)
            {
                Authenticate2FAResponse response;

                if (resend)
                {
                    resp.IsVerification = false;

                    response = this.ServiceClient.Post(new ResendOTP2FARequest
                    {
                        Token = token
                    });

                    if (response != null && response.AuthStatus)
                    {
                        resp.IsValid = true;
                        resp.StatusCode = HttpStatusCode.OK;
                    } 
                }
                else
                {
                    resp.IsVerification = true;

                    response = this.ServiceClient.Post(new Validate2FARequest
                    {
                        Token = token
                    });

                    if (response != null && response.AuthStatus)
                    {
                        if (otp == this.LoggedInUser.Otp)
                        {
                            resp.StatusCode = HttpStatusCode.OK;
                            resp.IsValid = true;
                        }
                    }
                }
            }
            else
                resp.StatusCode = HttpStatusCode.Unauthorized;

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

            if (ViewBag.IsValid)
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
            ValidateSidResponse resp = new ValidateSidResponse();
            try
            {
                resp.IsValid = ViewBag.IsValidSol;
                if (resp.IsValid)
                {
                    DownloadFileResponse dfs = this.FileClient.Get(new DownloadLogoExtRequest
                    {
                        SolnId = this.SultionId,
                    });
                    resp.Logo = dfs.StreamWrapper.Memorystream.ToArray();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
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
                    Eb_Solution s_obj = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", this.SultionId));

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

        [HttpGet("api/menu")]
        public GetMobMenuResonse GetAppData4Mob(int locid = 1)
        {
            if (ViewBag.IsValid)
            {
                return this.ServiceClient.Get(new GetMobMenuRequest
                {
                    LocationId = locid
                });
            }
            else
            {
                return new GetMobMenuResonse();
            }
        }

        [HttpGet("/api/objects_by_app")]
        public GetMobilePagesResponse GetObjectsByApp(int appid, int locid, bool pull_data = false)
        {
            locid = locid == 0 ? 1 : locid;
            GetMobilePagesResponse _objs = null;

            if (ViewBag.IsValid)
            {
                try
                {
                    _objs = this.ServiceClient.Get<GetMobilePagesResponse>(new GetMobilePagesRequest
                    {
                        LocationId = locid,
                        AppId = appid,
                        PullData = pull_data
                    });
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.Message);
                    _objs = new GetMobilePagesResponse();
                }
            }
            return _objs;
        }

        [HttpPost("/api/push_data")]
        public InsertDataFromWebformResponse WebFormSaveCommonApi([FromForm]Dictionary<string, string> form)
        {
            InsertDataFromWebformResponse Resp = null;
            if (ViewBag.IsValid)
            {
                try
                {
                    WebformData FormData = JsonConvert.DeserializeObject<WebformData>(form["webform_data"]);
                    int RowId = Convert.ToInt32(form["rowid"]);
                    string RefId = form["refid"];
                    int LocId = Convert.ToInt32(form["locid"]);

                    //string Operation = OperationConstants.NEW;
                    //if (RowId > 0)
                    //    Operation = OperationConstants.EDIT;

                    //if (!this.LoggedInUser.HasFormPermission(RefId, Operation, LocId))
                    //    return new InsertDataFromWebformResponse { RowAffected = -2, RowId = -2 };

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

        [HttpGet("api/get_data")] //refid = datasourcerefid
        public GetMobileVisDataResponse GetMobileVisData(string refid, string param, string sort_order, int limit, int offset, bool is_powerselect)
        {
            GetMobileVisDataResponse resp = null;
            try
            {
                if (ViewBag.IsValid)
                {
                    GetMobileVisDataRequest request = new GetMobileVisDataRequest()
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

                    resp = this.ServiceClient.Get(request);
                }
                else
                    resp = new GetMobileVisDataResponse { Message = ViewBag.Message };
            }
            catch (Exception ex)
            {
                Console.WriteLine("EXCEPTION AT get_data API" + ex.Message);
                Console.WriteLine(ex.StackTrace);
            }
            return resp;
        }

        [HttpGet("api/get_formdata")] //refid = mobileform
        public GetMobileFormDataResponse GetMobileFormData(string refid, int row_id, int loc_id)
        {
            GetMobileFormDataResponse resp = null;
            try
            {
                if (ViewBag.IsValid)
                {
                    resp = this.ServiceClient.Get(new GetMobileFormDataRequest
                    {
                        MobilePageRefId = refid,
                        RowId = row_id,
                        LocId = loc_id
                    });
                }
                else
                    resp = new GetMobileFormDataResponse { Message = ViewBag.Message };
            }
            catch (Exception ex)
            {
                Console.WriteLine("EXCEPTION AT get_data API" + ex.Message);
                Console.WriteLine(ex.StackTrace);
            }
            return resp;
        }

        [HttpGet("api/map")]
        public IActionResult Maps(string bToken, string rToken, string type, double latitude, double longitude, string place)
        {
            try
            {
                string host = HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
                string[] hostParts = host.Split(CharConstants.DOT);

                //to use internally also check token in cookie
                if (bToken == null && rToken == null)
                {
                    bToken = HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
                    rToken = HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];
                }

                if (ViewBag.IsValidSol && IsTokensValid(rToken, bToken, hostParts[0]))
                {
                    this.ServiceClient.BearerToken = bToken;
                    this.ServiceClient.RefreshToken = rToken;
                    this.ServiceClient.Headers.Add(CacheConstants.RTOKEN, rToken);

                    EbConnectionFactory connection = new EbConnectionFactory(this.SultionId, this.Redis);
                    EbMapConCollection MapCollection = connection.MapConnection;

                    ViewBag.Maps = MapCollection;
                    ViewBag.Latitude = latitude;
                    ViewBag.Longitude = longitude;
                    ViewBag.Place = place;

                    MapVendors MapType;
                    if (type == null)
                        MapType = MapVendors.GOOGLEMAP;
                    else
                        Enum.TryParse(type, out MapType);

                    ViewBag.MapType = MapType;
                }
                else
                    return new EmptyResult();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return View();
        }

        [HttpGet("api/get_actions")]
        public GetMyActionsResponse GetMyActions()
        {
            try
            {
                if (ViewBag.IsValid)
                {
                    return this.ServiceClient.Get(new GetMyActionsRequest());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("EXCEPTION AT get_actions API" + ex.Message);
                Console.WriteLine(ex.StackTrace);
            }
            return new GetMyActionsResponse();
        }

        [HttpGet("api/get_action_info")]
        public GetMyActionInfoResponse GetMyActionInfo(int stageid, string refid, int dataid)
        {
            try
            {
                if (ViewBag.IsValid)
                {
                    return this.ServiceClient.Get(new GetMyActionInfoRequest
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
            return new GetMyActionInfoResponse();
        }

        /// <summary>
        /// push notification for 
        /// </summary>
        /// <returns></returns>

        [HttpGet("api/notifications/register")]
        public async Task<IActionResult> CreatePushRegistrationId()
        {
            if (Authenticated)
            {
                var registrationId = await _nfClient.CreateRegistrationId();
                return Ok(registrationId);
            }

            return Unauthorized();
        }

        [HttpDelete("api/notifications/unregister")]
        public async Task<IActionResult> UnregisterFromNotifications(string regid)
        {
            if (Authenticated)
            {
                await _nfClient.DeleteRegistration(regid);
                return Ok();
            }

            return Unauthorized();
        }

        [HttpPut("api/notifications/enable")]
        [HttpPost("api/notifications/enable")]
        public async Task<IActionResult> RegisterForPushNotifications(string regid, string device)
        {
            if (Authenticated)
            {
                if (device != null)
                {
                    DeviceRegistration dr = JsonConvert.DeserializeObject<DeviceRegistration>(device);

                    HubResponse registrationResult = await _nfClient.RegisterForPushNotifications(regid, dr);

                    if (registrationResult.CompletedWithSuccess)
                        return Ok(true);

                    return BadRequest("An error occurred while sending push notification");
                }
                else
                {
                    Console.WriteLine("Hub registration updation :: device empty");
                }
            }
            return Unauthorized();
        }

        [HttpPost("api/notifications/send")]
        public async Task<IActionResult> SendNotification([FromBody] Common.NotificationHubs.Notification newNotification)
        {
            if (Authenticated)
            {
                HubResponse<NotificationOutcome> pushDeliveryResult = await _nfClient.SendNotification(newNotification);

                if (pushDeliveryResult.CompletedWithSuccess)
                    return Ok();

                return BadRequest("An error occurred while sending push notification: " + pushDeliveryResult.FormattedErrorMessages);
            }

            return Unauthorized();
        }
    }
}
