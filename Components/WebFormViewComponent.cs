using ExpressBase.Common;
using ExpressBase.Common.Extensions;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects;
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
        public async Task<IViewComponentResult> InvokeAsync(string[] arr)
        {
            string refid = arr[0];
            string Locale = arr[1];

            EbWebForm WebForm = this.Redis.Get<EbWebForm>(refid);
            if(WebForm == null)
            {
                EbObjectParticularVersionResponse verResp = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
                WebForm = EbSerializers.Json_Deserialize<EbWebForm>(verResp.Data[0].Json);// form object without localization
                this.Redis.Set<EbWebForm>(refid, WebForm);
            }            
            WebForm.AfterRedisGet(this.Redis, this.ServiceClient);
            if (WebForm != null)
            {
                //************Localization - Feature Disabled Temporarily************
                //string[] Keys = EbControlContainer.GetKeys(WebForm);
                //Dictionary<string, string> KeyValue = ServiceClient.Get<GetDictionaryValueResponse>(new GetDictionaryValueRequest { Keys = Keys, Locale = Locale }).Dict;
                //EbWebForm WebForm_L = EbControlContainer.Localize<EbWebForm>(WebForm, KeyValue);
                EbWebForm WebForm_L = WebForm;
                //*******************************************************************

                foreach (EbControl control in WebForm_L.Controls.FlattenEbControls())
                {
                    if (control is EbSimpleSelect)
                    {
                        (control as EbSimpleSelect).InitFromDataBase(this.ServiceClient);
                    }
                    else if (control is EbDGSimpleSelectColumn)
                    {
                        EbDGSimpleSelectColumn SimpleSelectColumn = (control as EbDGSimpleSelectColumn);
                        SimpleSelectColumn.EbSimpleSelect.InitFromDataBase(this.ServiceClient);

                        SimpleSelectColumn.DBareHtml = SimpleSelectColumn.EbSimpleSelect.GetBareHtml();
                    }
                    else if (control is EbUserLocation)
                    {
                        (control as EbUserLocation).InitFromDataBase(this.ServiceClient, ViewBag.__User, ViewBag.__Solution, ViewBag.formRefId);
                    }
                    else if((control is EbRadioButton) && control.Name.Equals("eb_default"))
                    {
                        if (ViewBag.wc == RoutingConstants.UC)
                        {
                            if (ViewBag.__User.Roles.Contains(SystemRoles.SolutionOwner.ToString()) || ViewBag.__User.Roles.Contains(SystemRoles.SolutionAdmin.ToString()) || ViewBag.__User.Roles.Contains(SystemRoles.SolutionPM.ToString()))
                                control.IsDisable = true;
                        }
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
