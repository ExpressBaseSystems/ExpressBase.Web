using CloudinaryDotNet;
using ExpressBase.Common.ServiceStack.ReqNRes;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System.IO;
using System.IO.Compression;

namespace ExpressBase.Web.Controllers
{
    public class FileDownloadController : EbBaseIntCommonController
    {
        public FileDownloadController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis)
        {
        }

        [HttpGet]
        public void Download()
        {
            this.ServiceClient.Post(new FileDownloadRequestObject());
        }


        //  Downloads Page
        [HttpGet("/Downloads")]
        public IActionResult DownloadsPage()//for excel and pdf downloads -
        {
            GetDownloadFileResponse response = this.ServiceClient.Get<GetDownloadFileResponse>(new GetDownloadFileRequest { IsGetAll = true });
            ViewBag.FileObjects = response.AllDownloadObjects;
            return View();
        }

        [HttpGet("/GetDownload")]
        public IActionResult GetDownload(int id, char op)
        {
            GetDownloadFileResponse response = this.ServiceClient.Get<GetDownloadFileResponse>(new GetDownloadFileRequest { Id = id });
            byte[] bytea = response.FileDownloadObject?.FileBytea;
            if (bytea != null)
            {
                byte[] decompressedData = Decompress(bytea);

                string extension = response.FileDownloadObject?.Filename.Split('.')[1];



                if (extension == "pdf")
                {
                    //    if (op == 'o')
                    //        return new FileStreamResult(new MemoryStream(decompressedData), "application/pdf");
                    //    else if (op == 'd')
                    return File(decompressedData, "application/pdf", response.FileDownloadObject?.Filename);
                }
                else if (extension == "xlsx")
                {
                    //if (op == 'o')
                    //    return new FileStreamResult(new MemoryStream(decompressedData), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                    //else if (op == 'd')
                    return File(decompressedData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", response.FileDownloadObject?.Filename);
                }
            }
            return Redirect("/StatusCode/404");
        }


        public static byte[] Decompress(byte[] data)
        {
            using (var compressedStream = new MemoryStream(data))
            using (var zipStream = new GZipStream(compressedStream, CompressionMode.Decompress))
            using (var resultStream = new MemoryStream())
            {
                zipStream.CopyTo(resultStream);
                return resultStream.ToArray();
            }
        }

    }
}
