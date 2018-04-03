using ExpressBase.Common;
using ExpressBase.Common.EbServiceStack.ReqNRes;
using ExpressBase.Common.ServiceClients;
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
    public class StaticFileController : EbBaseIntController
    {
        public StaticFileController(IServiceClient _ssclient, IEbStaticFileClient _sfc) : base(_ssclient, _sfc) { }

        [HttpGet("static/dp/{filename}")]
        public FileStream GetDP(string filename)
        {
            if (filename.StartsWith("dp") && filename.Split('.').Length == 2)
            {
                filename = filename.Split('.')[0] + ".jpg";
                string sFilePath = string.Format("StaticFiles/{0}/dp/{1}", ViewBag.cid, filename);
                if (!System.IO.File.Exists(sFilePath))
                {
                    byte[] fileByte = this.FileClient.Post<byte[]>(new DownloadFileRequest { FileDetails = new FileMeta { FileName = filename, FileType = "jpg" } });
                    if (fileByte.IsEmpty())
                        return System.IO.File.OpenRead("wwwroot/images/proimg.jpg");
                    EbFile.Bytea_ToFile(fileByte, sFilePath);
                }
                HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=604800";

                return System.IO.File.OpenRead(sFilePath);
            }
            else
                return null;
        }

        [HttpGet("static/{filename}")]
        public FileStream GetFile(string filename)
        {
            string sFilePath = string.Format("StaticFiles/{0}/{1}", ViewBag.cid, filename);
            try
            {
                if (!System.IO.File.Exists(sFilePath))
                {
                    byte[] fileByte = this.FileClient.Post<byte[]>
                        (new DownloadFileRequest
                        {
                            FileDetails = new FileMeta
                            {
                                FileName = filename,
                                FileType = filename.Split('.')[1].ToLower()
                            }
                        });
                    EbFile.Bytea_ToFile(fileByte, sFilePath);
                }
                HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
                if (filename.ToLower().EndsWith(".pdf"))
                    HttpContext.Response.Headers[HeaderNames.ContentType] = "application/pdf";
            }
            catch(Exception e) { }

            return System.IO.File.OpenRead(sFilePath);
        }

        [HttpPost]
        public async Task<JsonResult> UploadFileAsync(int i, string tags)
        {
            JsonResult resp = null;
            string Id = string.Empty;
            string url = string.Empty;

            tags = String.IsNullOrEmpty(tags) ? "FileUpload" : tags;

            try
            {
                var req = this.HttpContext.Request.Form;
                UploadFileAsyncRequest uploadFileRequest = new UploadFileAsyncRequest();
                uploadFileRequest.FileDetails = new FileMeta();

                if (!String.IsNullOrEmpty(tags))
                {
                    var tagarray = tags.ToString().Split(',');
                    List<string> Tags = new List<string>(tagarray);
                    uploadFileRequest.FileDetails.MetaDataDictionary = new Dictionary<String, List<string>>();
                    uploadFileRequest.FileDetails.MetaDataDictionary.Add("Tags", Tags);
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
                        uploadFileRequest.FileDetails.FileType = formFile.FileName.Split('.')[1];
                        uploadFileRequest.FileDetails.Length = uploadFileRequest.FileByte.Length;

                        this.FileClient.Post<bool>(uploadFileRequest);
                        url = string.Format("{0}/static/{1}.{2}", ViewBag.BrowserURLContext, Id, uploadFileRequest.FileDetails.FileType);

                        resp = new JsonResult(new UploadFileMqResponse { Uploaded = "OK", initialPreview = url, objId = Id });
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
                    if (formFile.Length > 0 && Enum.IsDefined(typeof(ImageTypes), formFile.FileName.Split('.')[1].ToLower()))
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
                        uploadImageRequest.ImageInfo.FileType = formFile.FileName.Split('.')[1];
                        uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;

                        this.FileClient.Post<bool>(uploadImageRequest);
                        resp = new JsonResult(new UploadFileMqResponse { Uploaded = "OK" });
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
                uploadImageRequest.ImageInfo.FileType = "png";
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
            List<FileMeta> resp= this.FileClient.Post(new InitialFileReq{ Type = (FileClass)type });
            return resp;
        }
    }
}