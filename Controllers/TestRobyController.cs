using System;
using System.Collections.Generic;
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
        public static string ApplicationName = "Other client 1";
        public static string ClientId = "1080114714952-bjp6t1ifr0dn68u1rrr4icnfscfr9qfl.apps.googleusercontent.com";
        public static string ClientSecret = "DwaDGHou5ghXrJ0EitwnIQWu";
        public static string[] Scopes = new string[] { DriveService.Scope.Drive,
                                 DriveService.Scope.DriveFile};
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
        public static UserCredential GetUserCredential(out string error)
        {
            UserCredential credential = null;
            error = string.Empty;
            try
            {
                credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                    new ClientSecrets
                    {
                        ClientId = ClientId,
                        ClientSecret = ClientSecret
                    },
                    Scopes,
                    Environment.UserName,
                    CancellationToken.None,
                    new FileDataStore("Google Oaut2")).Result;
                Console.WriteLine("Success");
            }
            catch (Exception ex)
            {
                credential = null;
                error = "Failed to UserCredential Initialization:" + ex.ToString();
                Console.WriteLine("Failed : "+ex.ToString());
            }
            return credential;
        }

        public void btnAuthorize_Click(object sender, EventArgs e)
        {
            Console.WriteLine("Start ");
            string credentialError = string.Empty;
            string refreshToken = string.Empty;
            UserCredential credential = GetUserCredential(out credentialError);
            Console.WriteLine(credential);
            if (credential != null && string.IsNullOrWhiteSpace(credentialError))
            {
                refreshToken = credential.Token.RefreshToken;
                var service = new DriveService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = ApplicationName,
                });
                Console.WriteLine("After Service create ");
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
            Console.WriteLine("finished");
        }

        public async System.Threading.Tasks.Task Test()
        {
            string[] Scopes = new string[] { DriveService.Scope.Drive,
                                 DriveService.Scope.DriveFile};
            Console.WriteLine("Scopes: " + Scopes);
            string ApplicationName = "Other client 1";
            try
            {
                UserCredential credential;

                credential = await GoogleWebAuthorizationBroker.AuthorizeAsync(
                                new ClientSecrets
                                {
                                    
                                },
                                new[] { DriveService.Scope.Drive },
                                "kurianurl",
                                CancellationToken.None,
                                new FileDataStore("JSON.Key"));

                // Create Drive API service.
                
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }
    }
}
