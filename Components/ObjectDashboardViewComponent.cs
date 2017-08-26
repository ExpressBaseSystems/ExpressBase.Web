using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Common.Objects;

namespace ExpressBase.Web.Components
{
    public class ObjectDashboardViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(string objid,string objname,int totVer,ObjectLifeCycleStatus status)
        {
            ViewBag.ObjName = objname;
            ViewBag.TotalVersions= totVer;
            ViewBag.Status = status;
             return View();

        }
    }
}
