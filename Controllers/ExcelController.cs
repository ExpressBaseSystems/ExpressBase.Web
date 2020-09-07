using System.IO;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;


// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class ExcelController : EbBaseIntCommonController
    {
        // GET: /<controller>/

        public ExcelController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async void UploadExcelAsync()
        {
            //InsertBatchDataResponse response = null;
            IFormFileCollection files = Request.Form.Files;
            string _refid = Request.Form["RefId"];
            Stream stream = files[0].OpenReadStream();
            using (MemoryStream MS = new MemoryStream())
            {
                stream.CopyTo(MS);
                byte[] bytes = MS.ToArray();
                ExcelUploadResponse response = this.ServiceClient.Post<ExcelUploadResponse>(new ExcelUploadRequest { Bytes = bytes, RefId = _refid });
                
            }

            //ExcelUploadResponse response = this.ServiceClient.Get<ExcelUploadResponse>(new ExcelUploadRequest { stream = stream, _refid = _refid });
        }

        public FileContentResult download(string refid)
        {
            FileContentResult file = null;
            if (refid != null && refid != string.Empty)
            {
                ExcelDownloadResponse response = this.ServiceClient.Get<ExcelDownloadResponse>(new ExcelDownloadRequest { _refid = refid });
                byte[] stream = response.stream;
                string fileName = response.fileName;
                file = File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);  
            }
            return file;
        }
    }
}
