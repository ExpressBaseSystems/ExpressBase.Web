using ExpressBase.Common;
using ExpressBase.Objects;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class BotFormBuilderViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(string dsobj, int tabnum, int type, string refid, string ssurl)
        {
            if (dsobj != "null")
            {// if edit mode
                EbBotForm botForm = EbSerializers.Json_Deserialize(dsobj);
                ViewBag.Html = botForm.GetHtml();
            }
            ViewBag.dsObj = dsobj;
            ViewBag.tabnum = tabnum;
            ViewBag.ObjType = type;
            ViewBag.Refid = refid;
            ViewBag.ssurl = ssurl;
            return View();
        }
    }
}
