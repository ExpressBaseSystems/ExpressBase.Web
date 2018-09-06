using CloudinaryDotNet;
using ExpressBase.Common.ServiceStack.ReqNRes;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.Controllers
{
    public class FileDownloadController : EbBaseIntCommonController
    {
        public FileDownloadController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis)
        {
        }

        [HttpGet]
        public void Download(string cloud, string apiKey, string apiSecret)
        {
            this.ServiceClient.Post(new FileDownloadRequestObject()
            {
                Account = new Account(cloud, apiKey, apiSecret)
            });
        }
    }
}
