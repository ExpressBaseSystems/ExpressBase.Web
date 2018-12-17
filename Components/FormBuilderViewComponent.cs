using ExpressBase.Common;
using ExpressBase.Common.Extensions;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class FormBuilderViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(string dsobj, int tabnum, int type, string refid, string ssurl)// dsobj filled with usercontrol.controls
        {
            EbWebForm webForm = EbSerializers.Json_Deserialize(dsobj);
            //webForm.AfterRedisGet();


            List<EbUserControl> AllUserControls = new List<EbUserControl>();
            if (dsobj != "null")// if not edit mode
            {
                foreach (EbControl ctrl in webForm.Controls.FlattenAllEbControls())
                {
                    if (ctrl is EbUserControl)
                        AllUserControls.Add(ctrl as EbUserControl);
                }
                ViewBag.Html = webForm.GetHtml();
            }

            foreach (EbUserControl UserControls in AllUserControls)
            {
                UserControls.Controls.Clear();
            }

            ViewBag.dsObj = EbSerializers.Json_Serialize(webForm);
            ViewBag.tabnum = tabnum;
            ViewBag.ObjType = type;
            ViewBag.Refid = refid;
            return View();
        }
    }
}
