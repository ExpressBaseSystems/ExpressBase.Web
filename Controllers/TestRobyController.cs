using System;
using ExpressBase.Common;
using ExpressBase.Web.BaseControllers;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System.Threading;
using Google.Apis.Auth.OAuth2.Flows;
using System.Threading.Tasks;
using File = Google.Apis.Drive.v3.Data.File;
using Google.Apis.Auth.OAuth2.Responses;
using System.IO;
using System.Text;
// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class TestRobyController : EbBaseIntCommonController
    {

        public static string ClientId = "1080114714952-bjp6t1ifr0dn68u1rrr4icnfscfr9qfl.apps.googleusercontent.com";
        public static string ClientSecret = "DwaDGHou5ghXrJ0EitwnIQWu";
        public static string[] Scopes = new string[] { DriveService.Scope.Drive,
                                 DriveService.Scope.DriveFile};
        private string ApplicationName = "API by kc";

        private string json = @"{
  'type': 'service_account',
  'project_id': 'skillful-radar-245705',
  'private_key_id': '66be46107dffe85a53edfefe3e56461044deacb6',
  'private_key': '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDSG+M+42MZvRhG\nqAAOB6FWqtMLN5kqAgsQTmcZjlBdfFK2dgm/f+QOH2kk3n1T3BjevJeyXsK2E3xy\n1tT8js3Iv9ggUzUgBwtOG/2kRyJNjcfgWi5DRXCkwSpfcS0B4OlZu+LN7BTwbf26\npf+OaLp7Bv3TiFBnSBxppCdBmE4eSs20wwa5F9hQ2g9AUmx6M8Fgxn+AvSIX2dyQ\noxFtzeuzitTaRubuM5qZMFJ5UNq+pWtU0G/1zZ3bvvJ8dHDThmPYAENdZG/Q8m8/\nN7yGv3fkLAekIspNvV2HOZA/Rzek3pxIBKYmx8fZLUFKmrUfkfDGMrZcvlNNFKou\nu+5ebQ2BAgMBAAECggEAPunq2eHswsBEjKOxoIHYZcMw/qLfUhzagz92z8g1eEjJ\n26jsslLxTulI6qlUjc/SAqAmLFsDotGi6iA6FoYMSJhpdwRzW+vADtuCz7YdJ2vU\n9fEK+UnJuQu+TGXvPCjEtwHzoAWZH4VP/JvIMjRZ4oztZHHk4YhOObPVrWaVvavN\nkx+2/Sav4ud+7RWzstkLJz+vvX783YH3/Lr0AolVLKdgPq8Ty7rsU6D3izrVukQt\nK4HeNcMqeE4MxNCq8tpPn4SNOtxx4RN103cFEhDvYR3OO7WQrkU4bcx7zi0KzHUW\nKGRFBMpGV9lpMkdIAKjePG5gcvTlfBe/C2NVtsLkoQKBgQDr6MIYRSwmgo9/gwh2\n5ssoOE2+k0JmL42UEr28WvOPFey3yveZdotoksnTK/WkjA0dFhnT8Jc27nkd7MNb\nwt2ZZdCBODka4PuHu2C5UmAIcd90ELanSYGFAhFfOhdZHp9v6YX0Dvlhg5t6OcQE\nJAsefZxjHaPKEAmPIPGoVyR5RwKBgQDkAKMv0wZYc4EecmamC3enCNAeKODE7aK6\nQ2os7VE7305r4OClgydOvlJQY43rTbRIMjPSSx36cw7epaQk/I2f160juzhQsNwz\ntpnZchOmUGsPBDAs/Dmr0FaB3boi3Kj2V64BZPBhgYJRgYsafkfn0T3DNaQvDoi3\nc53NC6im9wKBgHxDUaHpJdVvJlk7U0UWUuLvrXv6I5qh58icipbhrbOsD9HMNtn+\nSHagA3GZkT3Ii8vLbXVnIK/Ns7ygj1MRdRqtN8QpMmNHKRcZC1zy2CT6noKLnzrF\nDFVcfnwTpGLML52Ke4XQMWo9IbOjI+4ucjDwZ2UKItF32yEqcECFDnBXAoGAOCow\nCMfi+Eb7t5RW1PBeOTdijQtk0x32yAtzTD3plOYdW1W6AQud0zfu7v6XJy+tCVvU\niCkY6WkOcKo9FR9hg86NSBAGf1oR5GtG2tnPHVkSBlDxzSMU0c4wgS0tfQj+VjCj\nHJTQ4jQU9h8DNTOGYwSYQk4kc7MQ2qAQb0I/+WECgYAwhMMICxOYZeqV3KKMf4tA\nfPBt2z48nOpwPJPRJM2OkTM4OMIUTZMSMTHdGNHHYpi9MDQydcK25f0aHSzwuxkB\nPzDw27T4/ZIMVeLLsxyPpMZw2qOdlE30LxwZguPwaxJSWT8CHFG3tbaIpuGVV5o5\nwetkYQErLvtMWdhWc+TC+g==\n-----END PRIVATE KEY-----\n',
  'client_email': 'kurian@skillful-radar-245705.iam.gserviceaccount.com',
  'client_id': '111527805126325213102',
  'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
  'token_uri': 'https://oauth2.googleapis.com/token',
  'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
  'client_x509_cert_url': 'https://www.googleapis.com/robot/v1/metadata/x509/kurian%40skillful-radar-245705.iam.gserviceaccount.com'
}";
        private DriveService service;

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
        
        public IActionResult Test()
        {
            return View("test");
        }
        //public class OAuth2AccessTokenReponse
        //{
        //    public string AccessToken;
        //    public int ExpiresInSeconds;
        //    public string TokenType;
        //}
        //public static string refreshAccessToken()
        //{
        //    using (System.Net.WebClient client = new System.Net.WebClient())
        //    {
        //        byte[] response = client.UploadValues("https://accounts.google.com/o/oauth2/token", new System.Collections.Specialized.NameValueCollection(){
        //        {"client_id", ClientId},
        //        {"client_secret", ClientSecret},
        //        {"refresh_token", "XXXXX"},
        //        {"grant_type", "refresh_token"}
        //    });
        //        string sresponse = System.Text.Encoding.Default.GetString(response);
        //        OAuth2AccessTokenReponse o = (OAuth2AccessTokenReponse)Newtonsoft.Json.JsonConvert.DeserializeObject(sresponse, typeof(OAuth2AccessTokenReponse));
        //        return o.AccessToken;
        //    }
        //}
        [HttpPost]
        public async Task storeauthcodeAsync(string data12)
        {
            try
            {
                var init = new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = new ClientSecrets
                    {
                        ClientId = "1080114714952-bjp6t1ifr0dn68u1rrr4icnfscfr9qfl.apps.googleusercontent.com",
                        ClientSecret = "DwaDGHou5ghXrJ0EitwnIQWu"
                    },
                    Scopes = new string[] { "https://www.googleapis.com/auth/drive" }
                };
                var flow = new Google.Apis.Auth.OAuth2.Flows.AuthorizationCodeFlow(init);

                var code = data12;


                Console.WriteLine("Fetching token for code: _" + code + "_");


                TokenResponse result = await flow.ExchangeCodeForTokenAsync("user", code, "https://myaccount.eb-test.xyz", CancellationToken.None);
                Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(result));
                GoogleCredential credential = GoogleCredential.FromAccessToken(result.AccessToken);
                Console.WriteLine("credentials created");
                var service = new DriveService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = ApplicationName,
                });
                Console.WriteLine("service created");
                byte[] byteArray = Encoding.ASCII.GetBytes("hagsd adhgasgd asdg assdghkajsgd asdgkasgd akjsgdka");
                Stream str = new MemoryStream(byteArray);
                var fileMetadata = new File()
                {
                    Name = "photo.txt"
                };
                FilesResource.CreateMediaUpload request;
                string dir = System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
                Console.WriteLine("dir : " + dir);

                using (Stream stream = new FileStream("430831-most-popular-relaxing-desktop-background-1920x1080.jpg",
                                        FileMode.Open, FileAccess.Read))
                {
                    request = service.Files.Create(
                        fileMetadata, stream, "TXT");
                    request.Fields = "id";
                    request.Upload();
                }
                Console.WriteLine("done");
                var file = request.ResponseBody;
                Console.WriteLine("File ID: " + file.Id);
            }
            catch (Exception e)
            {
                Console.WriteLine("exception inside storeauth :" + e);
                Console.WriteLine(" StackTrace :" + e.StackTrace);
            }

            //if (credential.Token.IsExpired(Google.Apis.Util.SystemClock.Default))
            //{
            //    var refreshResult = credential.RefreshTokenAsync(CancellationToken.None).Result;
            //}
        }


    }
}
