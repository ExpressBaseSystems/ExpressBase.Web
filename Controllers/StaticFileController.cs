﻿    using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using ServiceStack;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class StaticFileController : EbBaseNewController
    {
        public StaticFileController(IServiceClient _ssclient) : base(_ssclient) { }

        // GET: /<controller>/

        [HttpGet("static/dp/{filename}")]
        public FileStream GetDP(string filename)
        {
            if (filename.StartsWith("dp") && filename.Split('.').Length == 2)
            {
                filename = filename.Split('.')[0] + ".jpg";
                string sFilePath = string.Format("StaticFiles/{0}/dp/{1}", ViewBag.cid, filename);
                if (!System.IO.File.Exists(sFilePath))
                {
                    byte[] fileByte = this.ServiceClient.Post<byte[]>(new DownloadFileRequest { FileDetails = new FileMeta { FileName = filename, FileType = "jpg" } });
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
            if (!System.IO.File.Exists(sFilePath))
            {
                byte[] fileByte = this.ServiceClient.Post<byte[]>
                    (new DownloadFileRequest
                    {
                        FileDetails = new FileMeta
                        {
                            FileName = filename,
                            FileType =  filename.Split('.')[1].ToLower() }
                    });
                EbFile.Bytea_ToFile(fileByte, sFilePath);
            }

            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            if (filename.ToLower().EndsWith(".pdf"))
                HttpContext.Response.Headers[HeaderNames.ContentType] = "application/pdf";
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
                UploadFileRequest uploadFileRequest = new UploadFileRequest();
                uploadFileRequest.FileDetails = new FileMeta();

                if (!String.IsNullOrEmpty(tags))
                {
                    var tagarray = tags.ToString().Split(',');
                    List<string> Tags = new List<string>(tagarray);
                    uploadFileRequest.FileDetails.MetaDataDictionary = new Dictionary<String, List<string>>();
                    uploadFileRequest.FileDetails.MetaDataDictionary.Add("Tags", Tags);
                }
                uploadFileRequest.IsAsync = false;

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

                        Id = this.ServiceClient.Post<string>(uploadFileRequest);
                        if (ViewBag.cid == "expressbase")
                            url = string.Format("http://localhost:5000/static/{0}.{1}", Id, uploadFileRequest.FileDetails.FileType);
                        else
                            url = string.Format("http://{0}.localhost:5000/static/{1}.{2}", ViewBag.cid, Id, uploadFileRequest.FileDetails.FileType);

                        resp = new JsonResult(new UploadFileControllerResponse { Uploaded = "OK", initialPreview = url, objId = Id });
                    }
                }
            }
            catch (Exception e)
            {
                resp = new JsonResult(new UploadFileControllerError { Uploaded = "ERROR" });
            }
            return resp;
        }

        [HttpPost]
        public async Task<JsonResult> UploadImageAsync(int i, string tags)
        {
            JsonResult resp = null;
            string Id = string.Empty;
            string url = string.Empty;

            //tags = String.IsNullOrEmpty(tags) ? "UnniTest,PGSQL,FilterSearch,UploadImageAsync" : tags;
            try
            {
                var req = this.HttpContext.Request.Form;
                UploadImageRequest uploadImageRequest = new UploadImageRequest();
                uploadImageRequest.ImageInfo = new FileMeta();
                if (!String.IsNullOrEmpty(tags))
                {
                    List<string> Tags = new List<string>(tags.Split(','));
                    uploadImageRequest.ImageInfo.MetaDataDictionary = new Dictionary<String, List<string>>();
                    uploadImageRequest.ImageInfo.MetaDataDictionary.Add("Tags", Tags);
                }
                uploadImageRequest.IsAsync = false;

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

                        uploadImageRequest.ImageInfo.FileName = formFile.FileName;
                        uploadImageRequest.ImageInfo.FileType = formFile.FileName.Split('.')[1];
                        uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;

                        Id = this.ServiceClient.Post<string>(uploadImageRequest);
                        if (ViewBag.cid == "expressbase" && ViewBag.wc == "tc")
                            url = string.Format("http://localhost:5000/static/{0}.{1}",  Id, uploadImageRequest.ImageInfo.FileType);
                        else
                            url = string.Format("http://{0}.localhost:5000/static/{1}.{2}", ViewBag.cid, Id, uploadImageRequest.ImageInfo.FileType);

                        resp = new JsonResult(new UploadFileControllerResponse { Uploaded = "OK", initialPreview = url, objId = Id });
                    }
                }
            }
            catch (Exception e)
            {
                resp = new JsonResult(new UploadFileControllerError { Uploaded = "ERROR" });
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
                UploadImageRequest uploadImageRequest = new UploadImageRequest();
                uploadImageRequest.ImageInfo = new FileMeta();               
                uploadImageRequest.IsAsync = false;
                string base64Norm = base64.Replace("data:image/png;base64,", "");
                myFileContent = System.Convert.FromBase64String(base64Norm);
                uploadImageRequest.ImageByte = myFileContent;                           
                uploadImageRequest.ImageInfo.FileType = "jpg";
                        uploadImageRequest.ImageInfo.FileName = String.Format("dp_{0}.{1}", ViewBag.UId, uploadImageRequest.ImageInfo.FileType);
                        uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;

                        Id = this.ServiceClient.Post<string>(uploadImageRequest);
                        if(ViewBag.cid == "expressbase")
                            url = string.Format("http://localhost:5000/static/dp/dp_{0}.jpg", ViewBag.UId);
                        else
                        url = string.Format("http://{0}.localhost:5000/static/dp_{1}.{2}", ViewBag.cid, ViewBag.UId, uploadImageRequest.ImageInfo.FileType);              
            }
            catch (Exception e)
            {
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

            FileInfoList = this.ServiceClient.Post(findFilesByTagRequest);

            return FileInfoList;
        }
    }
}