using ExpressBase.Common;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class FilterDialogBuilderViewComponent:ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(string dsobj, int tabnum, int type, string refid, string ssurl)
        {
            ViewBag.dsObj = dsobj;
            if (dsobj != "null")
            {
                ViewBag.Html = EbSerializers.Json_Deserialize(dsobj).GetHtml();
            }
            ViewBag.tabnum = tabnum;
            ViewBag.ObjType = type;
            ViewBag.Refid = refid;
            ViewBag.ssurl = ssurl;
            return View();
        }
    }
}
