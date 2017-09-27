using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System.IO;
using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.Net.Http.Headers;
using System.Text;

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
                byte[] fileByte = this.ServiceClient.Post<byte[]>(new DownloadFileRequest { ObjectId = filename.Substring(0, filename.IndexOf('.')) });
                EbFile.Bytea_ToFile(fileByte, sFilePath);
            }

            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            if (filename.ToLower().EndsWith(".pdf"))
                HttpContext.Response.Headers[HeaderNames.ContentType] = "application/pdf";
            return System.IO.File.OpenRead(sFilePath);
        }

        [HttpPost]
        public async Task<JsonResult> UploadFileAsync(string byteArray,string fileName)
        {
            JsonResult resp = null;       
            try
            {
                if (byteArray != null)
                {
                    byte[] myFileVal = Encoding.ASCII.GetBytes(byteArray);              
                    this.ServiceClient.Post(new UploadFileRequest { FileName = fileName, ByteArray = myFileVal });
                    resp = new JsonResult(new UploadFileControllerResponse { Uploaded = "OK" });
                }


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

                            this.ServiceClient.Post(new UploadFileRequest { FileName = formFile.FileName, ByteArray = myFileContent });

                            resp = new JsonResult(new UploadFileControllerResponse { Uploaded = "OK" });
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
    }
}
