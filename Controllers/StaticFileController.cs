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
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ExpressBase.Web.Controllers
{
    public class StaticFileExtController : EbBaseExtController
    {
        public StaticFileExtController(IEbStaticFileClient _sfc) : base(_sfc) { }

        [HttpGet("images/logo/{filename}")]
        public IActionResult GetLogo(string filename)
        {
            filename = filename.SplitOnLast(CharConstants.DOT).First() + StaticFileConstants.DOTPNG;

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
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, GetMime(filename));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }
            return resp;
        }

        private string GetMime(string fname)
        {
            return StaticFileConstants.GetMime[fname.SplitOnLast(CharConstants.DOT).Last()];
        }
    }

    public class StaticFileController : EbBaseIntCommonController
    {
        public StaticFileController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _sfc) { }

        private const string UnderScore = "_";

        private const string RejexPattern = " *[\\~#%&*{}/:<>?|\"-]+ *";

        [HttpGet("images/dp/{userid}")]
        public IActionResult GetDP(string userid)
        {
            userid = userid.SplitOnLast(CharConstants.DOT).First() + StaticFileConstants.DOTPNG;

            DownloadFileResponse dfs = null;
            ActionResult resp = new EmptyResult();

            try
            {
                dfs = this.FileClient.Get<DownloadFileResponse>
                        (new DownloadDpRequest
                        {
                            ImageInfo = new ImageMeta
                            {
                                FileName = userid,
                                FileType = StaticFileConstants.PNG,
                                FileCategory = EbFileCategory.Dp
                            }
                        });

                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=2628000";
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, GetMime(userid));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
                resp = new EmptyResult();
            }
            return resp;
        }

        [HttpGet("files/loc/{filename}")]
        public IActionResult GetLocFiles(string filename)
        {
            filename = filename.SplitOnLast(CharConstants.DOT).First() + StaticFileConstants.DOTPNG;

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
                                    FileType = StaticFileConstants.PNG,
                                    FileCategory = EbFileCategory.LocationFile
                                }
                            });
                }

                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, GetMime(filename));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
                resp = new EmptyResult();
            }
            return resp;
        }

        [HttpGet("files/{filename}")]
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

        [HttpGet("files/ref/{filename}")]
        public IActionResult GetFileByRefId(string filename)
        {
            DownloadFileResponse dfs = null;
            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            ActionResult resp = new EmptyResult();
            try
            {
                dfs = this.FileClient.Get<DownloadFileResponse>
                        (new DownloadFileByRefIdRequest
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

        [HttpGet("images/{filename}")]
        public IActionResult GetImageById(string filename, string qlty)
        {
            DownloadFileResponse dfs = null;
            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            ActionResult resp = new EmptyResult();

            DownloadImageByIdRequest dfq = new DownloadImageByIdRequest();

            try
            {
                dfq.ImageInfo = new ImageMeta { FileRefId = Convert.ToInt32(filename.SplitOnLast(CharConstants.DOT).First()), FileCategory = EbFileCategory.Images, ImageQuality = ImageQuality.original };

                dfs = this.FileClient.Get<DownloadFileResponse>(dfq);

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

        [HttpGet("images/{qlty}/{filename}")]
        public IActionResult GetImageQualById(string filename, string qlty)
        {
            DownloadFileResponse dfs = null;
            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            ActionResult resp = new EmptyResult();

            DownloadImageByIdRequest dfq = new DownloadImageByIdRequest();

            try
            {
                dfq.ImageInfo = new ImageMeta { FileRefId = Convert.ToInt32(filename.SplitOnLast(CharConstants.DOT).First()), FileCategory = EbFileCategory.Images, ImageQuality = Enum.Parse<ImageQuality>(qlty) };

                dfs = this.FileClient.Get<DownloadFileResponse>(dfq);

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
                        uploadFileRequest.FileDetails.FileType = formFile.FileName.SplitOnLast(CharConstants.DOT).Last();
                        uploadFileRequest.FileDetails.Length = uploadFileRequest.FileByte.Length;
                        uploadFileRequest.FileDetails.FileCategory = EbFileCategory.File;

                        res = this.FileClient.Post<UploadAsyncResponse>(uploadFileRequest);

                        return new JsonResult(res);
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
        public async Task<int> UploadImageAsync(int i)
        {
            UploadAsyncResponse res = new UploadAsyncResponse();
            try
            {
                var req = this.HttpContext.Request.Form;
                List<string> tags = req["Tags"].ToList<string>();
                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new ImageMeta();
                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0 && Enum.IsDefined(typeof(ImageTypes), formFile.FileName.SplitOnLast(CharConstants.DOT).Last()))
                    {
                        byte[] myFileContent;
                        using (var memoryStream = new MemoryStream())
                        {
                            await formFile.CopyToAsync(memoryStream);
                            memoryStream.Seek(0, SeekOrigin.Begin);
                            myFileContent = new byte[memoryStream.Length];
                            await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);
                            uploadImageRequest.ImageByte = myFileContent;
                        }
                        uploadImageRequest.ImageInfo.MetaDataDictionary = new Dictionary<String, List<string>>();
                        uploadImageRequest.ImageInfo.MetaDataDictionary.Add("Tags", tags);

                        uploadImageRequest.ImageInfo.FileName = formFile.FileName;
                        uploadImageRequest.ImageInfo.FileType = formFile.FileName.SplitOnLast(CharConstants.DOT).Last();
                        uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                        uploadImageRequest.ImageInfo.FileCategory = EbFileCategory.Images;
                        uploadImageRequest.ImageInfo.ImageQuality = ImageQuality.original;

                        res = this.FileClient.Post<UploadAsyncResponse>(uploadImageRequest);
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString() + "\nResponse: " + res.ResponseStatus.Message);
            }
            return res.FileRefId;
        }

        [HttpPost]
        public async Task<int> UploadImageAsyncFromForm(int i)
        {
            UploadAsyncResponse res = new UploadAsyncResponse();
            try
            {
                var req = this.HttpContext.Request.Form;
                List<string> tags = req["Tags"].ToList<string>();
                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new ImageMeta();
                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0 && Enum.IsDefined(typeof(ImageTypes), formFile.FileName.SplitOnLast(CharConstants.DOT).Last()))
                    {
                        byte[] myFileContent;
                        using (var memoryStream = new MemoryStream())
                        {
                            await formFile.CopyToAsync(memoryStream);
                            memoryStream.Seek(0, SeekOrigin.Begin);
                            myFileContent = new byte[memoryStream.Length];
                            await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);
                            uploadImageRequest.ImageByte = myFileContent;
                        }
                        uploadImageRequest.ImageInfo.MetaDataDictionary = new Dictionary<String, List<string>>();
                        uploadImageRequest.ImageInfo.MetaDataDictionary.Add("Tags", tags);

                        uploadImageRequest.ImageInfo.FileName = formFile.FileName;
                        uploadImageRequest.ImageInfo.FileType = formFile.FileName.SplitOnLast(CharConstants.DOT).Last();
                        uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                        uploadImageRequest.ImageInfo.FileCategory = EbFileCategory.Images;
                        uploadImageRequest.ImageInfo.ImageQuality = ImageQuality.original;

                        res = this.FileClient.Post<UploadAsyncResponse>(uploadImageRequest);
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString() + "\nResponse: " + res.ResponseStatus.Message);
            }
            return res.FileRefId;
        }

        [HttpPost]
        public async Task<int> UploadDPAsync(int i)
        {
            UploadAsyncResponse res = new UploadAsyncResponse();
            try
            {
                var req = this.HttpContext.Request.Form;
                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new ImageMeta();
                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0 && Enum.IsDefined(typeof(ImageTypes), formFile.FileName.SplitOnLast(CharConstants.DOT).Last()))
                    {
                        byte[] myFileContent;
                        using (var memoryStream = new MemoryStream())
                        {
                            await formFile.CopyToAsync(memoryStream);
                            memoryStream.Seek(0, SeekOrigin.Begin);
                            myFileContent = new byte[memoryStream.Length];
                            await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);
                            uploadImageRequest.ImageByte = myFileContent;
                        }
                        uploadImageRequest.ImageInfo.FileName = formFile.FileName;
                        uploadImageRequest.ImageInfo.FileType = StaticFileConstants.PNG;
                        uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                        uploadImageRequest.ImageInfo.FileCategory = EbFileCategory.Dp;
                        uploadImageRequest.ImageInfo.ImageQuality = ImageQuality.original;

                        res = this.FileClient.Post<UploadAsyncResponse>(uploadImageRequest);
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString() + "\nResponse: " + res.ResponseStatus.Message);
            }

            return res.FileRefId;
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

        private string GetMime(string fname)
        {
            return StaticFileConstants.GetMime[fname.SplitOnLast(CharConstants.DOT).Last().ToLower()];
        }
    }
}