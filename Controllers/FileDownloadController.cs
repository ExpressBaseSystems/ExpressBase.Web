using ExpressBase.Common.ServiceStack.ReqNRes;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Controllers
{
    public class FileDownloadController : EbBaseIntCommonController
    {
        public FileDownloadController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis)
        {
        }
        
        [HttpGet]
        public void Download()
        {
            FileDownloadRequestObject req = new FileDownloadRequestObject();
            var DownloadRes = this.ServiceClient.Post<FileDownloadResponseObject>(req);
        }
    }
}
