using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace WebApplication1.Pages
{
    public class IndexModel : PageModel
    {
        private string[] Scopes = { DriveService.Scope.Drive };
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
        [Route("/Onget")]
        public void OnGet()
        {
            Console.WriteLine("Hello World!");
            UploadFIle(@"./430831-most-popular-relaxing-desktop-background-1920x1080.jpg");
        }

        public void DownloadFile(string blobId, string savePath)
        {
            var service = GetDriveServiceInstance();
            var request = service.Files.Get(blobId);
            var stream = new MemoryStream();
            // Add a handler which will be notified on progress changes.
            // It will notify on each chunk download and when the
            // download is completed or failed.
            request.MediaDownloader.ProgressChanged += (Google.Apis.Download.IDownloadProgress progress) =>
            {
                switch (progress.Status)
                {
                    case Google.Apis.Download.DownloadStatus.Downloading:
                        {
                            Console.WriteLine(progress.BytesDownloaded);
                            break;
                        }
                    case Google.Apis.Download.DownloadStatus.Completed:
                        {
                            Console.WriteLine("Download complete.");
                            SaveStream(stream, savePath);
                            break;
                        }
                    case Google.Apis.Download.DownloadStatus.Failed:
                        {
                            Console.WriteLine("Download failed.");
                            break;
                        }
                }
            };
            request.Download(stream);
        }

        public string UploadFIle(string path)
        {
            Console.WriteLine("upload started");
            var service = GetDriveServiceInstance();
            var fileMetadata = new Google.Apis.Drive.v3.Data.File();
            fileMetadata.Name = Path.GetFileName(path);
            fileMetadata.MimeType = "image/png";
            FilesResource.CreateMediaUpload request;
            using (var stream = new FileStream(path, FileMode.Open))
            {
                request = service.Files.Create(fileMetadata, stream, "image/png");
                request.Fields = "id";
                request.Upload();
            }

            var file = request.ResponseBody;
            Console.WriteLine("upload complete");
            return file.Id;
            
        }

        private DriveService GetDriveServiceInstance()
        {
            Console.WriteLine("Service started");
            GoogleCredential credential = GoogleCredential.FromJson(json);

            var service = new DriveService(new BaseClientService.Initializer()
            {
                ApiKey = "AIzaSyBrfVA8qXGtHso9vJ6DI_go9pHXIO-oS7U",
                ApplicationName = ApplicationName,
            });
            Console.WriteLine("service complete");
            return service;
        }

        private void SaveStream(MemoryStream stream, string saveTo)
        {
            using (FileStream file = new FileStream(saveTo, FileMode.Create, FileAccess.Write))
            {
                stream.WriteTo(file);
            }
        }
    }
}
