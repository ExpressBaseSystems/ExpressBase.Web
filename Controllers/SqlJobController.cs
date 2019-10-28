using ExpressBase.Common.Data;
using ExpressBase.Objects.ServiceStack_Artifacts;
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
    public class SqlJobController : EbBaseIntCommonController
    {
        public SqlJobController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public void Index()
        {
            SqlJobResponse resp = this.ServiceClient.Post<SqlJobResponse>(new SqlJobRequest
            {
                GlobalParams = new List<Param> { new Param { Name = "date_to_consolidate", Type = "6", Value = "28-02-2015" } }
            });
            //return View("Index");
        }

        public void JobRetry(int id)
        {
            id = 763;
            RetryJobResponse response = this.ServiceClient.Post<RetryJobResponse>(new RetryJobRequest { JoblogId = id });


        }
    }
}
