using ExpressBase.Common.Connections;
using ExpressBase.Objects.Objects.TenantConnectionsRelated;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.Controllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.IO;
using System.Threading.Tasks;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web2.Controllers
{
    public class SampleController : EbBaseNewController
    {
        public SampleController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }


        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult AddEmailAccount()
        {
            return View();
        }

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
            return View();
        }

        [HttpGet]
        public IActionResult MongoDBAsync()
        {
            return View();
        }

        [HttpPost]
        public async Task<JsonResult> UploadFileAsync(int i)
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
