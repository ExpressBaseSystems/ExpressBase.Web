using ExpressBase.Common.Connections;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.Controllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web2.Controllers
{

    public class SampleController : EbBaseNewController
    {
        public SampleController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        
        
        

        [HttpGet]
        public IActionResult DownloadFile()
        {
            return View();
        }

        [HttpPost]
        public IActionResult DownloadFile(int i)
        {
            var req = this.HttpContext.Request.Form;
            byte[] ImgByte = this.ServiceClient.Post<byte[]>(new DownloadFileRequest { ObjectId = req["ObjectId"] });

            FileContentResult result = this.File(ImgByte, "image/jpeg");
            ViewBag.Image = ImgByte;
            return View();
        }

        //public IActionResult xx()
        //{
        //    return View();
        //}

        //[HttpPost]
        //public IActionResult LoadImage(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    byte[] ImgByte = this.ServiceClient.Post<byte[]>(new DownloadFileRequest { ObjectId = req["ObjectId"] });

        //    FileContentResult result = this.File(ImgByte, "image/jpeg");

        //    return result;
        //}

        

        [HttpGet]
        public IActionResult MongoDBAsync()
        {
            return View();
        }

        //[HttpPost]
        //public async Task<IActionResult> MongoDBAsync(int j)
        //{

        //    //var fileId = new MongoDB.Bson.ObjectId("59b3d1d4282746464ca37d39");
        //    //var dwnldImageByte = await bucket.DownloadAsBytesAsync(fileId, new GridFSDownloadOptions() { CheckMD5 = true });

        //    //EbFile.Bytea_ToFile(dwnldImageByte, "F://ExpressBase/MongoDB Uploads/Downloads/5.pdf");
        //    return View();
        //}
        
        public IActionResult dragNdrop()
        {
            return View();
        }

        public IActionResult Eb_formBuilder()
        {
            return View();
        }

        public IActionResult GetData()
        {
            return View();
        }

        public string sample()
        {

            return "{'name':'haii'}";
        }

        public IActionResult Table()
        {
            return View();
        }

        public IActionResult Masterhome()
        {
            return View();
        }

        //[ValidateAntiForgeryToken]
        public IActionResult RForm(int id)
        {
            ViewBag.FormId = id;
            return View();
        }
    }
}
