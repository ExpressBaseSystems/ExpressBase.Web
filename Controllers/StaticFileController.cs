using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.EbServiceStack.ReqNRes;
using ExpressBase.Common.Enums;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ExpressBase.Web.Controllers
{
    public class StaticFileExtController : EbBaseExtController
    {
        public StaticFileExtController(IEbStaticFileClient _sfc) : base(_sfc) { }

        [HttpGet("static/logo/{filename}")]
        public IActionResult GetLogo(string filename)
        {
            filename = filename.Split(CharConstants.DOT)[0] + StaticFileConstants.DOTPNG;

            DownloadFileResponse dfs = null;

            ActionResult resp = new EmptyResult();

            try
            {
                if (filename.StartsWith(StaticFileConstants.LOGO))
                {
                    HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=2628000";

                    dfs = this.FileClient.Get<DownloadFileResponse>
                            (new DownloadFileExtRequest
                            {
                                FileName = filename,
                            });
                }
                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, StaticFileConstants.GetMime[dfs.FileDetails.FileType]);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }
            return resp;
        }
    }

    public class StaticFileController : EbBaseIntCommonController
    {
        public StaticFileController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _sfc) { }

        private const string UnderScore = "_";

        private const string RejexPattern = " *[\\~#%&*{}/:<>?|\"-]+ *";

        [HttpGet("images/dp/{filename}")]
        public IActionResult GetDP(string filename)
        {
            filename = filename.Split(CharConstants.DOT)[0] + StaticFileConstants.DOTPNG;

            DownloadFileResponse dfs = null;
            ActionResult resp = new EmptyResult();

            try
            {
                if (filename.StartsWith(StaticFileConstants.DP))
                    dfs = this.FileClient.Get<DownloadFileResponse>
                            (new DownloadFileRequest
                            {
                                FileDetails = new FileMeta { FileName = filename, FileType = filename.Split(CharConstants.DOT)[1].ToLower(), FileCategory = EbFileCategory.Dp }
                            });

                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=2628000";
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, StaticFileConstants.GetMime[filename.Split(CharConstants.DOT)[1]]);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
                resp = new EmptyResult();
            }
            return resp;
        }

        [HttpGet("static/loc/{filename}")]
        public IActionResult GetLocFiles(string filename)
        {
            filename = filename.Split(CharConstants.DOT)[0] + StaticFileConstants.DOTPNG;

            DownloadFileResponse dfs = null;
            ActionResult resp = new EmptyResult();

            try
            {
                if (filename.StartsWith(StaticFileConstants.LOC))
                {
                    HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";

                    dfs = this.FileClient.Get<DownloadFileResponse>
                            (new DownloadFileRequest
                            {
                                FileDetails = new FileMeta
                                {
                                    FileName = filename,
                                    FileType = filename.Split(CharConstants.DOT)[1].ToLower(),
                                    FileCategory = EbFileCategory.LocationFile
                                }
                            });
                }

                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, StaticFileConstants.GetMime[filename.Split(CharConstants.DOT)[1]]);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
                resp = new EmptyResult();
            }
            return resp;
        }

        [HttpGet("static/{filename}")]
        public IActionResult GetFile(string filename)
        {
            DownloadFileResponse dfs = null;
            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            ActionResult resp = new EmptyResult();

            try
            {
                dfs = this.FileClient.Get<DownloadFileResponse>
                        (new DownloadFileByIdRequest
                        {
                            FileDetails = new FileMeta { FileStoreId = filename.Split(CharConstants.DOT)[0], FileCategory = EbFileCategory.File }
                        });
                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, StaticFileConstants.GetMime[filename.Split(CharConstants.DOT)[1]]);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }
            return resp;
        }

        [HttpGet("images/{filename}")]
        public IActionResult GetImageById(string filename, string qlty)
        {
            DownloadFileResponse dfs = null;
            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            ActionResult resp = new EmptyResult();

            DownloadImageByIdRequest dfq = new DownloadImageByIdRequest();

            try
            {
                dfq.ImageInfo = new ImageMeta { FileStoreId = filename.Split(CharConstants.DOT)[0], FileCategory = EbFileCategory.Images, ImageQuality = ImageQuality.original };

                dfs = this.FileClient.Get<DownloadFileResponse>(dfq);

                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, StaticFileConstants.GetMime[filename.Split(CharConstants.DOT)[1]]);
                }

            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }
            return resp;
        }

        [HttpGet("images/{qlty}/{filename}")]
        public IActionResult GetImageQualById(string filename, string qlty)
        {
            DownloadFileResponse dfs = null;
            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            ActionResult resp = new EmptyResult();

            string fname = String.Format("{0}_{1}.{2}", filename.Split(CharConstants.DOT)[0], qlty, filename.Split(CharConstants.DOT)[1]);
            DownloadImageByNameRequest dfq = new DownloadImageByNameRequest();

            try
            {
                dfq.ImageInfo = new ImageMeta { FileName =fname, FileCategory =EbFileCategory.Images, ImageQuality = Enum.Parse<ImageQuality>(qlty) };

                dfs = this.FileClient.Get<DownloadFileResponse>(dfq);

                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, StaticFileConstants.GetMime[dfs.FileDetails.FileType]);
                }

            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }
            return resp;

        }

        [HttpPost]
        public async Task<JsonResult> UploadFileAsync(int i, string tags)
        {
            UploadAsyncResponse res = new UploadAsyncResponse();
            JsonResult resp = null;

            try
            {
                string url = string.Empty;

                tags = String.IsNullOrEmpty(tags) ? "FileUpload" : tags;

                var req = this.HttpContext.Request.Form;
                UploadFileAsyncRequest uploadFileRequest = new UploadFileAsyncRequest();
                uploadFileRequest.FileDetails = new FileMeta();

                if (!String.IsNullOrEmpty(tags))
                {
                    var tagarray = tags.ToString().Split(CharConstants.COMMA);
                    List<string> Tags = new List<string>(tagarray);
                    uploadFileRequest.FileDetails.MetaDataDictionary = new Dictionary<String, List<string>>();
                    uploadFileRequest.FileDetails.MetaDataDictionary.Add(StaticFileConstants.TAGS, Tags);
                }

                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0)
                    {
                        byte[] myFileContent;

                        using (var memoryStream = new MemoryStream())
                        {
                            await formFile.CopyToAsync(memoryStream);
                            memoryStream.Seek(0, SeekOrigin.Begin);
                            myFileContent = new byte[memoryStream.Length];
                            await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);

                            uploadFileRequest.FileByte = myFileContent;
                        }

                        uploadFileRequest.FileDetails.FileName = formFile.FileName;
                        uploadFileRequest.FileDetails.FileType = formFile.FileName.Split(CharConstants.DOT)[1];
                        uploadFileRequest.FileDetails.Length = uploadFileRequest.FileByte.Length;
                        uploadFileRequest.FileDetails.FileCategory = EbFileCategory.File;
                        uploadFileRequest.FileDetails.FileRefId = 1;

                        res = this.FileClient.Post<UploadAsyncResponse>(uploadFileRequest);
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString());
                resp = new JsonResult(new UploadFileMqError { Uploaded = "ERROR" + "\nResponse: " + res.ResponseStatus.Message });
            }
            return ((resp == null) ? new JsonResult("") : resp);
        }

        [HttpPost]
        public async Task<JsonResult> UploadImageAsync(int i, string tags)
        {
            Regex regEx = new Regex(RejexPattern);
            UploadAsyncResponse res = new UploadAsyncResponse();
            JsonResult resp = null;
            var dict = tags.IsEmpty() ? null : JsonConvert.DeserializeObject<Dictionary<string, List<string>>>(tags);//workaround need to change
            Dictionary<string, List<string>> tagDict = new Dictionary<string, List<string>>();//workaround need to change

            foreach (KeyValuePair<string, List<string>> entry in dict)//workaround need to change
            {
                tagDict.Add(regEx.Replace(entry.Key.ToLower(), UnderScore), entry.Value);
            }
            try
            {
                var req = this.HttpContext.Request.Form;
                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new ImageMeta();

                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0 && Enum.IsDefined(typeof(ImageTypes), formFile.FileName.Split(CharConstants.DOT)[1].ToLower()))
                    {
                        string fname = regEx.Replace(formFile.FileName, UnderScore);

                        byte[] myFileContent;
                        using (var memoryStream = new MemoryStream())
                        {
                            await formFile.CopyToAsync(memoryStream);
                            memoryStream.Seek(0, SeekOrigin.Begin);
                            myFileContent = new byte[memoryStream.Length];
                            await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);
                            uploadImageRequest.ImageByte = myFileContent;
                        }

                        if (!dict.IsEmpty())
                        {
                            uploadImageRequest.ImageInfo.MetaDataDictionary = new Dictionary<String, List<string>>();
                            uploadImageRequest.ImageInfo.MetaDataDictionary.Add("Tags", tagDict[fname]);
                        }
                        uploadImageRequest.ImageInfo.FileName = fname;
                        uploadImageRequest.ImageInfo.FileType = fname.Split(CharConstants.DOT)[1];
                        uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                        uploadImageRequest.ImageInfo.FileCategory = EbFileCategory.Images;
                        uploadImageRequest.ImageInfo.ImageQuality = ImageQuality.original;
                        uploadImageRequest.ImageInfo.FileRefId = 1;

                        res = FileClient.Post<UploadAsyncResponse>(uploadImageRequest);
                        resp = new JsonResult(new UploadFileMqResponse
                        {
                            Uploaded = "OK",
                            initialPreview = "<img src='" + Convert.ToBase64String(uploadImageRequest.ImageByte) + "'/>" // 414 (URI Too Long)
                        });
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString() + "\nResponse: " + res.ResponseStatus.Message);
                resp = new JsonResult(new UploadFileMqError { Uploaded = "ERROR" });
            }

            return resp;
        }

        [HttpPost]
        public async Task<string> UploadDPAsync(string base64)
        {
            UploadAsyncResponse res = new UploadAsyncResponse();
            string Id = string.Empty;
            string url = string.Empty;
            byte[] myFileContent;
            try
            {
                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new ImageMeta();
                string base64Norm = base64.Replace("data:image/png;base64,", "");
                myFileContent = System.Convert.FromBase64String(base64Norm);
                uploadImageRequest.ImageByte = myFileContent;
                uploadImageRequest.ImageInfo.FileType = StaticFileConstants.PNG;
                uploadImageRequest.ImageInfo.FileName = String.Format("dp_{0}.{1}", ViewBag.UId, uploadImageRequest.ImageInfo.FileType);
                uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                uploadImageRequest.ImageInfo.FileCategory = EbFileCategory.Dp;
                uploadImageRequest.ImageInfo.ImageQuality = ImageQuality.original;

                res = this.FileClient.Post<UploadAsyncResponse>(uploadImageRequest);
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString() + "\n Response:" + res.ResponseStatus.Message);
                return "upload failed";
            }

            return url;
        }

        [HttpPost]
        public async Task<bool> UploadLogoAsync(string base64, string tid)
        {
            UploadAsyncResponse res = new UploadAsyncResponse();
            List<string> Tags = new List<string>() { "Logo" };
            byte[] myFileContent;
            try
            {
                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new ImageMeta();
                string base64Norm = base64.Replace("data:image/png;base64,", "");
                myFileContent = System.Convert.FromBase64String(base64Norm);
                uploadImageRequest.ImageByte = myFileContent;
                uploadImageRequest.ImageInfo.FileType = StaticFileConstants.PNG;
                uploadImageRequest.ImageInfo.FileName = String.Format("logo_{0}.{1}", tid, uploadImageRequest.ImageInfo.FileType);
                uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                uploadImageRequest.ImageInfo.MetaDataDictionary = new Dictionary<String, List<string>>();
                uploadImageRequest.ImageInfo.MetaDataDictionary.Add(StaticFileConstants.TAGS, Tags);
                uploadImageRequest.ImageInfo.FileCategory = EbFileCategory.SolLogo;
                uploadImageRequest.ImageInfo.ImageQuality = ImageQuality.original;

                res = this.FileClient.Post<UploadAsyncResponse>(uploadImageRequest);
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString() + "\nResponse: " + res.ResponseStatus.Message);
            }
            return true;
        }

        [HttpPost]
        public async Task<string> UploadLocAsync(string base64, string extra)
        {

            var dict = extra.IsEmpty() ? null : JsonConvert.DeserializeObject<Dictionary<string, string>>(extra);

            UploadAsyncResponse res = new UploadAsyncResponse();
            string Id = string.Empty;
            string url = string.Empty;
            byte[] myFileContent;
            try
            {
                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new ImageMeta();
                string base64Norm = base64.Replace("data:image/png;base64,", "");
                myFileContent = System.Convert.FromBase64String(base64Norm);
                uploadImageRequest.ImageByte = myFileContent;
                uploadImageRequest.ImageInfo.FileType = StaticFileConstants.JPG;
                uploadImageRequest.ImageInfo.FileName = String.Format("loc_{0}.{1}", dict["FileName"].ToLower(), uploadImageRequest.ImageInfo.FileType);
                uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                uploadImageRequest.ImageInfo.FileCategory = EbFileCategory.LocationFile;
                uploadImageRequest.ImageInfo.ImageQuality = ImageQuality.original;


                res = this.FileClient.Post<UploadAsyncResponse>(uploadImageRequest);
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString() + "\n Response:" + res.ResponseStatus.Message);
                return "upload failed";
            }

            return url;
        }

        public List<FileMeta> FindFilesByTags(int i, string tags, string bucketname)
        {
            FindFilesByTagRequest findFilesByTagRequest = new FindFilesByTagRequest();
            //tags = (string.IsNullOrEmpty(tags)) ? string.Empty : tags;
            if (string.IsNullOrEmpty(tags))
                return null;
            findFilesByTagRequest.Tags = new List<string>(tags.Split(','));

            List<FileMeta> FileInfoList = new List<FileMeta>();

            FileInfoList = this.FileClient.Post(findFilesByTagRequest);

            return FileInfoList;
        }

        [HttpPost]
        public List<FileMeta> FindFilesByTenant(int type)
        {
            List<FileMeta> resp = this.FileClient.Post(new InitialFileReq { Type = (FileClass)type });
            return resp;
        }
    }
}