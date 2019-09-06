using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common.ProductionDBManager;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class ProductionDBManagerController : EbBaseIntCommonController
    {
        public ProductionDBManagerController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        public IActionResult Index()
        {
            return View();
        }

        public Object CheckChangesInFunction(string solution_id)
        {
            CheckChangesInFunctionResponse resp = this.ServiceClient.Post<CheckChangesInFunctionResponse>(new CheckChangesInFunctionRequest
            {
                SolutionId = solution_id
            });
            return resp.Changes ;
        }

        public Object UpdateDBFunctionByDB(List<Eb_FileChanges> data , string db_name )
        {
            UpdateDBFunctionByDBResponse resp = this.ServiceClient.Post<UpdateDBFunctionByDBResponse>(new UpdateDBFunctionByDBRequest
            {
                Changes = data,
                DBName = db_name
            });
            return resp;
        }

        public IActionResult DatabaseIntegrityCheck()
        {
            DBIntegrityCheckResponse resp = this.ServiceClient.Post<DBIntegrityCheckResponse>(new DBIntegrityCheckRequest
            {
            });
            ViewBag.ChangesLog = resp.ChangesLog;
            return View("ChangesView");
        }

    }
}
