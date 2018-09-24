using ExpressBase.Common;
using ExpressBase.Common.Extensions;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class WebFormViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public WebFormViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }
        public async Task<IViewComponentResult> InvokeAsync(string refid)
        {

            var formObj = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
            var Obj = EbSerializers.Json_Deserialize(formObj.Data[0].Json);

            EbWebForm WebForm = Obj as EbWebForm;
            if (WebForm != null)
            {

                foreach (EbControl control in WebForm.Controls)
                {
                    if (control is EbSimpleSelect)
                    {
                        (control as EbSimpleSelect).InitFromDataBase(this.ServiceClient);
                    }
                }
                ViewBag.HtmlHead = WebForm.GetHead();
                WebForm.IsRenderMode = true;
                ViewBag.WebFormHtml = WebForm.GetHtml();

                ViewBag.WebFormObj = Common.EbSerializers.Json_Serialize(WebForm);

                //ViewBag.FlatControls = JsonConvert.SerializeObject(WebForm.Controls.FlattenEbControls());
                //ViewBag.WebFormObj = JsonConvert.SerializeObject(WebForm);
                ViewBag.WebFormObj = EbSerializers.Json_Serialize(WebForm);
                ViewBag.FlatControls = EbSerializers.Json_Serialize(WebForm.Controls.FlattenEbControls());
            }

            return View();
        }
    }
}
