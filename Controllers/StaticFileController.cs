using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.EbServiceStack.ReqNRes;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web2;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using Newtonsoft.Json;
using ServiceStack;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

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

            try
            {
                if (filename.StartsWith(StaticFileConstants.LOGO))
                {
                    HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";

                    dfs = this.FileClient.Get<DownloadFileResponse>
                            (new DownloadFileExtRequest
                            {
                                FileName = filename,
                            });
                    if (dfs.StreamWrapper != null)
                        dfs.StreamWrapper.Memorystream.Position = 0;
                }

            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }

            return (dfs.StreamWrapper != null) ? new FileStreamResult(dfs.StreamWrapper.Memorystream, StaticFileConstants.GetMime[dfs.FileDetails.FileType]) : null;
        }
    }

    public class StaticFileController : EbBaseIntController
    {
        public StaticFileController(IServiceClient _ssclient, IEbStaticFileClient _sfc) : base(_ssclient, _sfc) { }

        [HttpGet("static/dp/{filename}")]
        public IActionResult GetDP(string filename)
        {
            filename = filename.Split(CharConstants.DOT)[0] + StaticFileConstants.DOTPNG;

            DownloadFileResponse dfs = null;

            try
            {
                if (filename.StartsWith(StaticFileConstants.DP))
                {
                    HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";

                    dfs = this.FileClient.Get<DownloadFileResponse>
                            (new DownloadFileRequest
                            {
                                FileDetails = new FileMeta
                                {
                                    FileName = filename,
                                    FileType = filename.Split(CharConstants.DOT)[1].ToLower()
                                }
                            });
                    if (dfs != null)
                        dfs.StreamWrapper.Memorystream.Position = 0;
                }

            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }

            return (dfs != null) ? new FileStreamResult(dfs.StreamWrapper.Memorystream, StaticFileConstants.GetMime[dfs.FileDetails.FileType]) : null;
        }

        [HttpGet("static/{filename}")]
        public IActionResult GetFile(string filename)
        {
            DownloadFileResponse dfs = null;
            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";

            try
            {
                dfs = this.FileClient.Get<DownloadFileResponse>
                        (new DownloadFileRequest
                        {
                            FileDetails = new FileMeta
                            {
                                FileName = filename,
                                FileType = filename.Split(CharConstants.DOT)[1].ToLower()
                            }
                        });
                dfs.StreamWrapper.Memorystream.Position = 0;
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }

            return (dfs != null) ? new FileStreamResult(dfs.StreamWrapper.Memorystream, StaticFileConstants.GetMime[dfs.FileDetails.FileType]) : null;
        }

        [HttpPost]
        public async Task<JsonResult> UploadFileAsync(int i, string tags)
        {
            JsonResult resp = null;
            string url = string.Empty;

            tags = String.IsNullOrEmpty(tags) ? "FileUpload" : tags;

            try
            {
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

                        this.FileClient.Post<bool>(uploadFileRequest);
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString());
                resp = new JsonResult(new UploadFileMqError { Uploaded = "ERROR" });
            }
            return resp;
        }

        [HttpPost]
        public async Task<JsonResult> UploadImageAsync(int i, string tags)
        {
            JsonResult resp = null;
            var dict = tags.IsEmpty() ? null : JsonConvert.DeserializeObject<Dictionary<string, List<string>>>(tags);
            try
            {
                var req = this.HttpContext.Request.Form;
                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new FileMeta();

                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0 && Enum.IsDefined(typeof(ImageTypes), formFile.FileName.Split(CharConstants.DOT)[1].ToLower()))
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

                        if (!dict.IsEmpty())
                        {
                            uploadImageRequest.ImageInfo.MetaDataDictionary = new Dictionary<String, List<string>>();
                            uploadImageRequest.ImageInfo.MetaDataDictionary.Add("Tags", dict[formFile.FileName]);
                        }
                        uploadImageRequest.ImageInfo.FileName = formFile.FileName;
                        uploadImageRequest.ImageInfo.FileType = formFile.FileName.Split(CharConstants.DOT)[1];
                        uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;

                        this.FileClient.Post<bool>(uploadImageRequest);
                        resp = new JsonResult(new UploadFileMqResponse { Uploaded = "OK",
                            initialPreview = "<img src='"+ Convert.ToBase64String(uploadImageRequest.ImageByte) + "'/>"
                        });
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString());
                resp = new JsonResult(new UploadFileMqError { Uploaded = "ERROR" });
            }

            return resp;
        }

        [HttpPost]
        public async Task<string> UploadDPAsync(string base64)
        {
            string Id = string.Empty;
            string url = string.Empty;
            byte[] myFileContent;
            try
            {
                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new FileMeta();
                string base64Norm = base64.Replace("data:image/png;base64,", "");
                myFileContent = System.Convert.FromBase64String(base64Norm);
                uploadImageRequest.ImageByte = myFileContent;
                uploadImageRequest.ImageInfo.FileType = StaticFileConstants.PNG;
                uploadImageRequest.ImageInfo.FileName = String.Format("dp_{0}.{1}", ViewBag.UId, uploadImageRequest.ImageInfo.FileType);
                uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;

                Id = this.FileClient.Post<string>(uploadImageRequest);
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
        public async Task<bool> UploadLogoAsync(int i, string tags)
        {
            tags = String.IsNullOrEmpty(tags) ? "Logo" : tags;

            try
            {
                var req = this.HttpContext.Request.Form;
                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new FileMeta();

                if (!String.IsNullOrEmpty(tags))
                {
                    var tagarray = tags.ToString().Split(',');
                    List<string> Tags = new List<string>(tagarray);
                    uploadImageRequest.ImageInfo.MetaDataDictionary = new Dictionary<String, List<string>>();
                    uploadImageRequest.ImageInfo.MetaDataDictionary.Add(StaticFileConstants.TAGS, Tags);
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

                            uploadImageRequest.ImageByte = myFileContent;
                        }

                        uploadImageRequest.ImageInfo.FileType = StaticFileConstants.PNG;
                        uploadImageRequest.ImageInfo.FileName = String.Format("logo_{0}.{1}", ViewBag.cid, uploadImageRequest.ImageInfo.FileType);
                        uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;


                        return this.FileClient.Post<bool>(uploadImageRequest);
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString());
            }
            return true;
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