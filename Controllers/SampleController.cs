using ExpressBase.Common;
using ExpressBase.Common.Connections;
using ExpressBase.Common.Data;
using ExpressBase.Objects.Objects.TenantConnectionsRelated;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.Controllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;


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
        public IActionResult ConnectionManager()
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest());
            ViewBag.Connections = solutionConnections;
            return View();
        }

        [HttpGet]
        public IActionResult EditSMTPConnection()
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest());
            ViewBag.SMTP = solutionConnections;
            return View();
        }

        [HttpGet]
        public IActionResult AddEmailAccount()
        {
            return View();
        }

        //[HttpGet]
        //public IActionResult SlackPost()
        //{

        //    return View();
        //}

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

        [HttpGet]
        public IActionResult AddSlack()
        {

            return View();
        }

        

        

        [HttpGet]
        public IActionResult Post2Slack()
        {

            SlackPayload payload = new SlackPayload
            {
                Text = "Unniasdasdasdasdasdasdasdad",
                Channel = "test",
            };

            this.ServiceClient.Post(new SlackPostRequest { Payload = payload, PostType = 0 });


            return View();
        }

        //public Task IActionResult (string message, string channel = null, string username = null)
        //{

        //    var payload = new
        //    {
        //        text = message,
        //        channel,
        //        username,
        //    };

        //    return View();
        //}


        public IActionResult xx()
        {
            return View();
        }

        //[HttpPost]
        //public IActionResult LoadImage(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    byte[] ImgByte = this.ServiceClient.Post<byte[]>(new DownloadFileRequest { ObjectId = req["ObjectId"] });

        //    FileContentResult result = this.File(ImgByte, "image/jpeg");

        //    return result;
        //}


        [HttpPost]
        public IActionResult AddEmailAccount(int i)
        {
            var req = this.HttpContext.Request.Form;
            SMTPConnection smtpcon = new SMTPConnection();
            smtpcon.NickName = req["nickname"];
            smtpcon.Smtp = req["smtp"];
            smtpcon.Port = req["port"];
            smtpcon.EmailAddress = req["email"];
            smtpcon.Password = req["pwd"];
            var r = this.ServiceClient.Post<bool>(new AddSMTPConnectionRequest { SMTPConnection = smtpcon });
            Console.WriteLine(req.ToString());
            return Redirect("/Sample/ConnectionManager");
        }

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
