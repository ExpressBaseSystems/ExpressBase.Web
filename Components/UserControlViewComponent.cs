using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Extensions;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.Components
{
    public class UserControlViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public UserControlViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public async Task<IViewComponentResult> InvokeAsync(string dsobj, int tabnum, int type, string refid, string ssurl)
        {
            //ViewBag.dsObj = dsobj;
            EbUserControl ucForm = EbSerializers.Json_Deserialize(dsobj);

            List<EbUserControl> AllUserControls = new List<EbUserControl>();

            if (dsobj != "null")//if not edit mode
            {
                foreach (EbControl ctrl in ucForm.Controls.FlattenAllEbControls())
                {
                    if (ctrl is EbUserControl)
                        AllUserControls.Add(ctrl as EbUserControl);
                }
                ViewBag.Html = ucForm.GetHtml(true);
                //ViewBag.Html = EbSerializers.Json_Deserialize(dsobj).GetHtml(true);
            }
            foreach (EbUserControl UserControls in AllUserControls)
            {
                UserControls.Controls.Clear();
            }
            ViewBag.dsObj = EbSerializers.Json_Serialize(ucForm);
            ViewBag.tabnum = tabnum;
            ViewBag.ObjType = type;
            ViewBag.Refid = refid;
            return View();
        }
    }
}
