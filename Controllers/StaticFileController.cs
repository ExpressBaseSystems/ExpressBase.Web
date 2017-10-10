using ExpressBase.Common;
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
        [HttpGet("static/{tenantId}/{filename}")]
        public FileStream GetFile(string tenantId, string filename)
        {
            string sFilePath = string.Format("StaticFiles/{0}/{1}", tenantId, filename);
            if (!System.IO.File.Exists(sFilePath))
            {
                byte[] fileByte = this.ServiceClient.Post<byte[]>(new DownloadFileRequest { FileName = filename });
                EbFile.Bytea_ToFile(fileByte, sFilePath);
            }

            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            if (filename.ToLower().EndsWith(".pdf"))
                HttpContext.Response.Headers[HeaderNames.ContentType] = "application/pdf";
            return System.IO.File.OpenRead(sFilePath);
        }

        //[HttpPost("/event-subscribers/{Id}")]
        //public void Post(UploadFileControllerResponse request)
        //{

        //}

        [HttpPost]
        public async Task<JsonResult> UploadFileAsync(int i, string tags)
        {
            JsonResult resp = null;

            try
            {
                var req = this.HttpContext.Request.Form;

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

                            UploadFileRequest uploadFileRequest = new UploadFileRequest();

                            uploadFileRequest.IsAsync = false;
                            uploadFileRequest.FileName = formFile.FileName;
                            uploadFileRequest.ByteArray = myFileContent;

                            uploadFileRequest.MetaDataPair = new Dictionary<String, String>();
                            uploadFileRequest.MetaDataPair.Add("section", "upload-26");
                            uploadFileRequest.MetaDataPair.Add("type", "Unni-image");
                            uploadFileRequest.MetaDataPair.Add("tags", tags);

                            string Id = this.ServiceClient.Post<string>(uploadFileRequest);
                            string url =string.Format("<img src='/static/{0}/{1}.jpg' style='width: auto; height:auto; max-width:100%;max-height:100%;'/>", ViewBag.cid,Id);
                            resp = new JsonResult(new UploadFileControllerResponse { Uploaded = "OK", initialPreview =  url, objId = Id });
                        }
                    }
                }
            }
            catch (Exception e)
            {
                resp = new JsonResult(new UploadFileControllerError { Uploaded = "ERROR" });
            }

            return resp;
        }

        [HttpGet]
        public IActionResult FindFilesByTags(int i)
        {
            FindFilesByTagRequest findFilesByTagRequest = new FindFilesByTagRequest();
            findFilesByTagRequest.Filter = new KeyValuePair<string, string>("metadata.type", "Unni-image");
            var filesListJson = this.ServiceClient.Post(findFilesByTagRequest);

            List<string> files = new List<string>();
            foreach (var file in filesListJson.FileList)
            {
                files.Add(file.ObjectId);
            }

            ViewBag.Ids = files;
            return View();
        }
    }
}
