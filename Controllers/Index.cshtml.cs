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
        private string ApplicationName = "Test App By Suresh";

        private string json = @"{
  'type': 'service_account',
  'project_id': 'eb-test-223008',
  'private_key_id': '689dda17e462f3f2700be5f104e1071f041ed6fa',
  'private_key': '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDS1c1XxlVJFcDT\nvAWjqsm610ghBqlNuLpdMXnuvGBk4rD0fZKFcDMKf7Kx3Fd58fHh15MlU79T/+iL\nqflDzfYUr4rQHU8gEdSu/gc8vPPLXSEU1XFxRQnDEX9xXD4sTkBJQSR6+IDPiDVy\nRglONuk0coSFi6H0tNdKNpvmOmsXJTn4RU980coSd97jBxsyQuUVOT+BlPoZREyF\nZhTIQxFDWnNz4g7qeYDvsNfG0h9KR0VkCaJ54yNGu5PcuXc2Kgbt/3WHYz6KzpgY\nBIiLVGp6DwgPGWoJLvv1TWn5wX+hq4j+f85/qKq6lHPxn3rXO04P6JmysWMbzoaq\nGF8fb3LdAgMBAAECggEACs9gDTNT3aCyJ5kRH/RqjfwqTFkzVpMVaSBXjGRXu+x8\nnriOie14DH6CKsjtqki7unTrbENIQNYS9hBDwdR+XM6oWyXZj/8iDMvlEpnslR2E\nC/WqsKBV0QzlYCpW3L4xYSAoLu7tadalyONq6Dn8CI6jmVZQukOIc1tr8GjH42KT\nKTogi7fENwLdwvV01TNNLD3yP6owlz9TkvowZTPOYsGZcz/KVDkb6Ryj8BX7pKLs\nptGPe7Nt1lS+t+reZJGPuGXWYnBwvaRa0xaCgSBD2j2Zcwpm+m/ENDyA2rno7MNm\nTH3tRPR/HuAsBn9JUn15uZ/9BKQHoTqvnGw0pBtTIQKBgQDwQLRaXF8+teqoe2zp\nJEYuVH5vmpjd1b8QFZ+x0araCOTaiLzfxk3Prj6HT+fSHgvSPQxY7eEEYGVq3YKe\nMQX2bv04QQGhBC9VAr0Ol5ccNSbrh/tgO9XVhFiMnqyq+9jukXARt6ibBLGX7av4\nTTV2i3Y6QrR1K1492+Q8rIdw4QKBgQDgp30DsJp4aJBG+Bu5vzOr/Qo8SSdTaERS\nOKxcMOryGtzjYbVlYkQZdarW85kDjNRUrc0icbZQXKoS7dZkpw5eK237M512vdRs\nK46MvYhSIpbOyiIX/BtpJA0ag8NSCOU05iPZb4xoNXky2m0AFvYJQiZUV70Q42fv\nbrNvPQb1fQKBgQDvZvqQpEVAfxQCqWLgewX3+rg2y62SOAD4rSOBlLUUKRKq9OCI\nd9lnnnCucyBEzy3mZHDeWMQFkWzd7TbQHXeclgJ7wMM3yKzFoEH1vXaVZB2RS+Jg\nhZ9R8VwvW5ohk24aZBBxhzpapnW1N99KQN2Kb/PyoC+kJf/10hz/nMgl4QKBgQCL\nP4W/ucGljLqRIsycr6Upn+iuQXG8w05F4JcFddTLSFdOIYw8UVKArWy9W7SmfK5H\n5orWJMGqwiUxInbXYK0JNcYwBGg/5545hi4PkpNixcnQV34We8/JtezhWHbC7HyV\n82iZKAlRtoNvP/B8M79BMd1sPg4U37/WqzlRY/RiSQKBgQDeD18LIrjEvR8RtZm0\nUmSp/VPSpy+FZb6PTijwqS6UVcg43hthsLcmFQU0X6CJazyRLw0EracVa7PLJeou\nDvg4da9jYjIDlgzZAGeo6e37NFO62u2L7HhSYExnL+9DBbta8zYwtHv3y6LDfBKd\n2RS/DpioGnreN6l67R489rb2rQ==\n-----END PRIVATE KEY-----\n',
  'client_email': 'suresh-test-service-account@eb-test-223008.iam.gserviceaccount.com',
  'client_id': '117544013727211631254',
  'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
  'token_uri': 'https://oauth2.googleapis.com/token',
  'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
  'client_x509_cert_url': 'https://www.googleapis.com/robot/v1/metadata/x509/suresh-test-service-account%40eb-test-223008.iam.gserviceaccount.com'
}";

        public void OnGet()
        {
            Console.WriteLine("Hello World!");
            UploadFIle(@"C:\Users\sureba\Desktop\sign2.png");
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

            return file.Id;
        }

        private DriveService GetDriveServiceInstance()
        {
            GoogleCredential credential = GoogleCredential.FromJson(json);

            var service = new DriveService(new BaseClientService.Initializer()
            {
                ApiKey = "AIzaSyCxTcLGx-g_rG0lrrHJOdULFLYvyqx8leU",
                ApplicationName = ApplicationName,
            });

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
