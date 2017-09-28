using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Common.Objects;

namespace ExpressBase.Web.Components
{
    public class ObjectDashboardInitialViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(string refid)
        {
            ViewBag._Refid = refid;
            return View();

        }
    }
}
