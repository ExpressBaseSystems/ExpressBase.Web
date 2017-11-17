using ExpressBase.Security;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class DVTableViewComponent: ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(string dsobj, int tabnum, int type, string refid, string ssurl, int counter)
        {

            ViewBag.dsObj = dsobj;
            ViewBag.tabnum = tabnum;
            ViewBag.ObjType = type;
            ViewBag.Refid = refid;
            ViewBag.ServiceUrl = ssurl;
            ViewBag.counter = counter;
            return View("dvTableComponent");
        }
    }
}
