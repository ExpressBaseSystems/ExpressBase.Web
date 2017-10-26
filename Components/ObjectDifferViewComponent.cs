using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class ObjectDifferViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(int tabnum)
        {
            ViewBag.TabNum = tabnum;
            return View();
        }
    }
}
