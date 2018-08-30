using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.Serialization.Json;
using System.Runtime.Serialization;
using System.Globalization;
using RestSharp;
using System.Net;
using RestSharp.Authenticators;
using Newtonsoft.Json;
using System.Collections.ObjectModel;
using Flurl.Http;
using ExpressBase.Web.BaseControllers;
using ServiceStack;
using ServiceStack.Redis;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Common.ServiceStack.ReqNRes;
using ExpressBase.Common.Enums;
using System.Net;
using System.IO;
using System.Net.Http;
using System.Web;

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
            this.ServiceClient.Post(req);
        }
    }
}
