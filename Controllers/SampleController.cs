using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects;
using Microsoft.AspNetCore.Http;
using ExpressBase.Data;
using ExpressBase.Web.Filters;
using Microsoft.Extensions.Options;
using ExpressBase.Objects.Objects.TenantConnectionsRelated;
using ExpressBase.Web.Controllers;
using ExpressBase.Common.Connections;
using MongoDB.Driver;
using MongoDB.Driver.GridFS;
using MongoDB.Bson;
using System.IO;
using System.Drawing;
using Microsoft.EntityFrameworkCore;
using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;

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

        //[HttpGet]
        //public IActionResult MongoDBAsync()
        //{
        //    return View();
        //}

        [HttpGet]
        public async Task<IActionResult> MongoDBAsync(int j)
        {
            //var sMongodb_url = "mongodb://ahammedunni:Opera754$@cluster0-shard-00-00-lbath.mongodb.net:27017,cluster0-shard-00-01-lbath.mongodb.net:27017,cluster0-shard-00-02-lbath.mongodb.net:27017/admin?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
            //var mongoDatabase = (new MongoClient(sMongodb_url));
            //var database = mongoDatabase.GetDatabase("eb_images");

            //IGridFSBucket bucket = new GridFSBucket(database, new GridFSBucketOptions
            //{

            //    BucketName = "images",
            //    ChunkSizeBytes = 1048576, // 1MB
            //    WriteConcern = WriteConcern.WMajority,
            //    ReadPreference = ReadPreference.Secondary
            //});

            //var options = new GridFSUploadOptions
            //{
            //    ChunkSizeBytes = 64512, // 63KB
            //    Metadata = new BsonDocument
            //    {
            //        //{ "resolution", "1080P" },
            //        //{ "copyrighted", true }
            //    }
            //};


            for (int i = 0; i < 7; i++)
            {
                string imgName = "F://ExpressBase/MongoDB Uploads/" + (i+1) + ".jpg";
                byte[] imgByte = EbFile.Bytea_FromFile(imgName);

                this.ServiceClient.Post(new UploadFileRequest { FileName = imgName, ByteArray = imgByte });
           
            }

            //var fileId = new MongoDB.Bson.ObjectId("59b3d1d4282746464ca37d39");
            //var dwnldImageByte = await bucket.DownloadAsBytesAsync(fileId, new GridFSDownloadOptions() { CheckMD5 = true });

            //EbFile.Bytea_ToFile(dwnldImageByte, "F://ExpressBase/MongoDB Uploads/Downloads/5.pdf");
            return View();
        }



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
