﻿using ExpressBase.Common;
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

            EbWebForm WebForm = EbFormHelper.GetEbObject<EbWebForm>(refid, this.ServiceClient, this.Redis, null);
            //String timeStamp = DateTime.Now.ToString();
            //int timeStampInt = (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1)).TotalSeconds);

            //WebForm.SetContextId("ctx_" + timeStampInt);

            WebForm.IsRenderMode = true;//this property must set before AfterRedisGet //userctrl using this prop
            WebForm.RefId = refid;
            WebForm.UserObj = ViewBag.__User;
            WebForm.SolutionObj = ViewBag.__Solution;
            WebForm.AfterRedisGet(this.Redis, this.ServiceClient);
            ViewBag.FormPermissions = JsonConvert.SerializeObject(WebForm.GetLocBasedPermissions());

            if (WebForm != null)
            {
                //************Localization - Feature Disabled Temporarily************
                //string[] Keys = EbControlContainer.GetKeys(WebForm);
                //Dictionary<string, string> KeyValue = ServiceClient.Get<GetDictionaryValueResponse>(new GetDictionaryValueRequest { Keys = Keys, Locale = Locale }).Dict;
                //EbWebForm WebForm_L = WebForm.Localize(KeyValue) as EbWebForm;
                EbWebForm WebForm_L = WebForm;
                //*******************************************************************

                foreach (EbControl control in WebForm_L.Controls.FlattenAllEbControls().ToList().FindAll(e => e is EbDataGrid_New))// for old objects
                {
                    (control as EbDataGrid_New).ProcessDvColumnCollection();
                }

                foreach (EbControl control in WebForm_L.Controls.FlattenEbControls())
                {
                    if (control is EbSimpleSelect)
                    {
                        (control as EbSimpleSelect).InitFromDataBase(this.ServiceClient);
                    }
                    if (control is EbChartControl)
                    {
                        (control as EbChartControl).InitFromDataBase(this.ServiceClient, this.Redis);
                    }
                    else if (control is EbTVcontrol)
                    {
                        (control as EbTVcontrol).InitFromDataBase(this.ServiceClient, this.Redis);
                    }
                    else if (control is IEbPowerSelect && (control as IEbPowerSelect).RenderAsSimpleSelect)
                    {
                        (control as IEbPowerSelect).InitFromDataBase_SS(this.ServiceClient);
                    }
                    else if (control is EbDGSimpleSelectColumn)
                    {
                        EbDGSimpleSelectColumn SimpleSelectColumn = (control as EbDGSimpleSelectColumn);
                        SimpleSelectColumn.EbSimpleSelect.InitFromDataBase(this.ServiceClient);

                        SimpleSelectColumn.DBareHtml = SimpleSelectColumn.EbSimpleSelect.GetBareHtml();
                    }
                    else if (control is EbUserLocation)
                    {
                        (control as EbUserLocation).InitFromDataBase(ViewBag.__User, ViewBag.__Solution, ViewBag.formRefId);
                    }
                    else if ((control is EbRadioButton) && control.Name.Equals("eb_default"))
                    {
                        if (ViewBag.wc == RoutingConstants.UC)
                        {
                            if (!(ViewBag.__User.Roles.Contains(SystemRoles.SolutionOwner.ToString()) || ViewBag.__User.Roles.Contains(SystemRoles.SolutionAdmin.ToString()) || ViewBag.__User.Roles.Contains(SystemRoles.SolutionPM.ToString())))
                                control.IsDisable = true;
                        }
                    }
                    else if (control is EbUserSelect)
                    {
                        (control as EbUserSelect).InitOptions(WebForm.SolutionObj.Users);
                    }
                    else if (control is EbDGUserSelectColumn)
                    {
                        (control as EbDGUserSelectColumn).InitOptions(WebForm.SolutionObj.Users);
                    }
                    else if (control is EbTextBox)
                    {
                        (control as EbTextBox).InitFromDataBase(this.ServiceClient);
                    }
                    else if (control is EbDGStringColumn)
                    {
                        (control as EbDGStringColumn).InitFromDataBase(this.ServiceClient);
                    }
                    else if (control is EbMeetingScheduler)
                    {
                        //(control as EbMeetingScheduler).UsersList = WebForm.SolutionObj.Users;
                        (control as EbMeetingScheduler).InitParticipantsList(this.ServiceClient);
                    }
                    else if (control is EbInputGeoLocation)
                    {
                        (control as EbInputGeoLocation).GetDefaultApikey(this.ServiceClient);
                    }
                    else if (control is EbTagInput)
                    {
                        (control as EbTagInput).InitFromDataBase(this.ServiceClient);
                    }
                    else if (control is EbQuestionnaireConfigurator)
                    {
                        (control as EbQuestionnaireConfigurator).InitFromDataBase(this.ServiceClient);
                    }
                    else if (control is EbRenderQuestionsControl)
                    {
                        (control as EbRenderQuestionsControl).InitFromDataBase(this.ServiceClient);
                    }
                }
                ViewBag.HtmlHead = WebForm_L.GetHead();
                ViewBag.WebFormHtml = WebForm_L.GetHtml();
                ViewBag.ControlOperations = EbControlContainer.GetControlOpsJS(WebForm_L as EbControlContainer, BuilderType.WebForm);
                ViewBag.WebFormObj = EbSerializers.Json_Serialize(WebForm_L);
            }

            return View();
        }
    }
}
