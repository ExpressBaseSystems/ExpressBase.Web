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
    public class FilterDialogBuilderViewComponent:ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(string dsobj, int tabnum, int type, string refid, string ssurl)
        {
            EbFilterDialog Form = EbSerializers.Json_Deserialize(dsobj);
            List<EbUserControl> AllUserControls = new List<EbUserControl>();
            if (dsobj != "null")//  if not edit mode
            {
                foreach (EbControl ctrl in Form.Controls.FlattenAllEbControls())
                {
                    if (ctrl is EbUserControl)
                        AllUserControls.Add(ctrl as EbUserControl);
                }
                ViewBag.Html = Form.GetHtml();
            }
            foreach (EbUserControl UserControls in AllUserControls)
            {
                UserControls.Controls.Clear();
            }

            ViewBag.dsObj = EbSerializers.Json_Serialize(Form);

            ViewBag.tabnum = tabnum;
            ViewBag.ObjType = type;
            ViewBag.Refid = refid;
            ViewBag.ssurl = ssurl;
            return View();
        }
    }
}
