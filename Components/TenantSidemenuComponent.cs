using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class TenantSideMenuViewComponent:ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(string refid)
        {
            ViewBag.bot = new { name = "jith"};
            return View();
        }
    }
}
