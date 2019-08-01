using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Data;
using ExpressBase.Common.Structures;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Scheduler.Jobs;
using ExpressBase.Web.BaseControllers;



using System.IO;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Drive.v3;
using Google.Apis.Drive.v3.Data;
using Google.Apis.Services;
using Google.Apis.Util.Store;


using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ServiceStack.Stripe;
using ServiceStack.Stripe.Types;
using System.Threading;
// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class TestRobyController : EbBaseIntCommonController
    {
        public TestRobyController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }


        public IActionResult map()
        {
            return View();
        }

        public IActionResult route()
        {
            return View();
        }

        public IActionResult chart()
        {
            return View();
        }

        public IActionResult Anoy()
        {
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            return View();
        }

        public async void Test()
        {
            string[] Scopes = new string[] { DriveService.Scope.Drive,
                                 DriveService.Scope.DriveFile};
            string ApplicationName = "Other client 1";
            try
            {
                UserCredential credential;

                using (var stream =
                    new FileStream("client_secret_1080114714952-m42q3n8khtv3ctibkrd1g71l1d8u4gom.apps.googleusercontent.com.json", FileMode.Open, FileAccess.Read))
                {
                    // The file token.json stores the user's access and refresh tokens, and is created
                    // automatically when the authorization flow completes for the first time.
                    string credPath = "token.json";
                    credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                        GoogleClientSecrets.Load(stream).Secrets,
                        Scopes,
                        "user",
                        CancellationToken.None,
                        new FileDataStore(credPath, true)).Result;
                    Console.WriteLine("Credential file saved to: " + credPath);
                }

                // Create Drive API service.
                var service = new DriveService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = ApplicationName,
                });

                var fileMetadata = new Google.Apis.Drive.v3.Data.File()
                {
                    Name = "photo.jpg"
                };
                FilesResource.CreateMediaUpload request;
                using (var stream = new System.IO.FileStream("430831-most-popular-relaxing-desktop-background-1920x1080.jpg",
                                        System.IO.FileMode.Open))
                {
                    request = service.Files.Create(
                        fileMetadata, stream, "image/jpeg");
                    request.Fields = "id";
                    request.Upload();
                }
                var file = request.ResponseBody;
                Console.WriteLine("File ID: " + file.Id);

                // Define parameters of request.
                FilesResource.ListRequest listRequest = service.Files.List();
                listRequest.PageSize = 10;
                listRequest.Fields = "nextPageToken, files(id, name)";

                // List files.
                IList<Google.Apis.Drive.v3.Data.File> files = listRequest.Execute()
                    .Files;
                Console.WriteLine("Files:");
                if (files != null && files.Count > 0)
                {
                    foreach (var filee in files)
                    {
                        Console.WriteLine("{0} ({1})", filee.Name, filee.Id);
                    }
                }
                else
                {
                    Console.WriteLine("No files found.");
                }
                Console.Read();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }
    }
}
