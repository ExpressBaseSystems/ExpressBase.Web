using ExpressBase.Common;
using ExpressBase.Common.Data;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
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

        public SqlJobResponse ExecuteSqlJob(string Refid)
        {
            SqlJobResponse resp = this.ServiceClient.Post<SqlJobResponse>(new SqlJobRequest
            {
                RefId= Refid,
                GlobalParams = new List<Param> { new Param { Name = "date_to_consolidate", Type = "6", Value = "28-02-2015" } }
            });
            return resp;
        }

        public IActionResult SqlJobConsole()
        {
            List<int> types = new List<int>() { 26 };
            GetAllLiveObjectsResp Result = this.ServiceClient.Get<GetAllLiveObjectsResp>(new GetAllLiveObjectsRqst { Typelist = types });
            ViewBag.SqlJobObject = JsonConvert.SerializeObject(Result.Data);
            return View();
        }
        public SqlJobsListGetResponse Get_Jobs_List(string Refid , string Date)
        {
            SqlJobsListGetResponse resp = this.ServiceClient.Get(new SqlJobsListGetRequest()
            {
                RefId = Refid,
                Date =  Date

            });
            var Temp = new DSController(this.ServiceClient , this.Redis);
            resp.SqlJobsDvColumns = EbSerializers.Json_Serialize(Temp.GetColumnsForSqlJob(resp.SqlJobsColumns));
            return resp;  
        }

        public RetryJobResponse JobRetry(int id)
        {
            RetryJobResponse response = this.ServiceClient.Post<RetryJobResponse>(new RetryJobRequest { JoblogId = id , RefId = "ebdbllz23nkqd620180220120030-ebdbllz23nkqd620180220120030-26-2642-3506-2642-3506" });
            return response;
        }

        public void ProcessorLogic()
        {
            this.ServiceClient.Post <ProcessorResponse> (new ProcessorRequest()); ;
        }
    }
}
