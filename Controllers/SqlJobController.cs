using ExpressBase.Common;
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

        public IActionResult SqlJobConsole()
        {
            return View();
        }
        public SqlJobsListGetResponse Get_Jobs_List(string Refid , string Date)
        {
            SqlJobsListGetResponse resp = this.ServiceClient.Get(new SqlJobsListGetRequest()
            {
                Refid = Refid,
                Date =  Date

            });
            var Temp = new DSController(this.ServiceClient , this.Redis);
            resp.SqlJobsDvColumns = EbSerializers.Json_Serialize(Temp.GetColumns(resp.SqlJobsColumns));
            return resp;  
        }

        public void JobRetry(int id)
        {
            id = 763;
            RetryJobResponse response = this.ServiceClient.Post<RetryJobResponse>(new RetryJobRequest { JoblogId = id });


        }
    }
}
