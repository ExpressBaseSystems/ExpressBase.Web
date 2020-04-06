using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class MapViewViewComponent :ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(string googlekey, string dsobj, int tabnum, int type, string refid, string ssurl, int counter)
        {
            ViewBag.dsObj = dsobj;
            ViewBag.tabnum = tabnum;
            ViewBag.ObjType = type;
            ViewBag.Refid = refid;
            ViewBag.ServiceUrl = ssurl;
            ViewBag.counter = counter;
            ViewBag.al_arz_map_key = googlekey;
            return View();
        }
    }
}
