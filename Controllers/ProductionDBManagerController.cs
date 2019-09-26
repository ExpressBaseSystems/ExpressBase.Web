using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
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
                SolutionId = solution_id,
                IsUpdate = false
            });
            return resp.Changes;
        }

        public Object UpdateDBFunctionByDB(string db_name, string solution)
        {
            CheckChangesInFunctionResponse resp = this.ServiceClient.Post<CheckChangesInFunctionResponse>(new CheckChangesInFunctionRequest
            {
                SolutionId = solution,
                IsUpdate = true
            });
            return resp;
        }

        public IActionResult DatabaseIntegrityCheck()
        {
            if (ViewBag.cid == "admin")
                if (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) || this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString()))
                {
                    GetSolutionForIntegrityCheckResponse resp = this.ServiceClient.Post<GetSolutionForIntegrityCheckResponse>(new GetSolutionForIntegrityCheckRequest
                    {
                    });
                    ViewBag.ChangesLog = resp.ChangesLog;
                    return View("ChangesView");
                }
            return Redirect("/StatusCode/401");
        }

        public bool UpdateInfraWithSqlScripts()
        {
            if (ViewBag.cid == "admin")
                if (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) || this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString()))
                {
                    UpdateInfraWithSqlScriptsResponse resp = this.ServiceClient.Post<UpdateInfraWithSqlScriptsResponse>(new UpdateInfraWithSqlScriptsRequest
                    {
                    });
                    return true;
                }
            return false;
        }
    }
}
