using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Security;

namespace ExpressBase.Web.Components
{

    public class DBClientViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }
        public DBClientViewComponent(IServiceClient _client)
        {
            this.ServiceClient = _client as JsonServiceClient;
        }
        public async Task<IViewComponentResult> InvokeAsync(string clientSolnid, User _user )
        {
          
            GetDbTablesResponse res = null;
            if (ViewBag.cid == "admin" && (_user.Roles.Contains(SystemRoles.SolutionOwner.ToString()) || _user.Roles.Contains(SystemRoles.SolutionAdmin.ToString())))
            {
                if (clientSolnid != null)
                    res = this.ServiceClient.Get(new GetDbTablesRequest { IsAdminOwn = true, ClientSolnid = clientSolnid });
                else
                    res = this.ServiceClient.Get(new GetDbTablesRequest { IsAdminOwn = true });
                ViewBag.IsAdminOwn = true;
            }
            else
            {
                res = this.ServiceClient.Get(new GetDbTablesRequest { });
                ViewBag.IsAdminOwn = false;
            }
            ViewBag.Tables = res.Tables;
            ViewBag.DB_Name = res.DB_Name;
            ViewBag.TableCount = res.TableCount;
            ViewBag.Solutions = res.SolutionCollection;
            return View("DbClientComponent");
        }
    }
}
