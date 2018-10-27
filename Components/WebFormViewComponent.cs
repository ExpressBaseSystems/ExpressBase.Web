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

            EbObjectParticularVersionResponse verResp = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });

            EbWebForm WebForm = EbSerializers.Json_Deserialize<EbWebForm>(verResp.Data[0].Json);// form object without localization
            if (WebForm != null)
            {
                
                EbWebForm WebForm_L = EbControlContainer.Localize<EbWebForm>(WebForm ,this.ServiceClient);

                foreach (EbControl control in WebForm_L.Controls.FlattenEbControls())
                {
                    if (control is EbSimpleSelect)
                    {
                        (control as EbSimpleSelect).InitFromDataBase(this.ServiceClient);
                    }
                }
                ViewBag.HtmlHead = WebForm_L.GetHead();
                WebForm_L.IsRenderMode = true;
                ViewBag.WebFormHtml = WebForm_L.GetHtml();
                ViewBag.ControlOperations = EbControlContainer.GetControlOpsJS(WebForm_L as EbControlContainer, BuilderType.WebForm);
                ViewBag.WebFormObj = EbSerializers.Json_Serialize(WebForm_L);
            }

            return View();
        }
    }
}
