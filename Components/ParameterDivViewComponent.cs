using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects;
using ExpressBase.Security;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class ParameterDivViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public ParameterDivViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }
        public async Task<IViewComponentResult> InvokeAsync(EbFilterDialog FilterDialogObj, User _user, Eb_Solution _sol, string ParentRefid, string wc, string curloc, string submitId)
        {
            if (FilterDialogObj != null)
            {
                FilterDialogObj.IsRenderMode = true;
                foreach (EbControl control in FilterDialogObj.Controls)
                {
                    if (control is EbSimpleSelect)
                    {
                        (control as EbSimpleSelect).InitFromDataBase(this.ServiceClient);
                    }
                    else if (control is EbUserLocation)
                    {
                        (control as EbUserLocation).InitFromDataBase(this.ServiceClient, _user, _sol, ParentRefid);
                    }
                }
                ViewBag.HtmlHead = FilterDialogObj.GetHead();
                ViewBag.ControlOperations = EbControlContainer.GetControlOpsJS(FilterDialogObj as EbControlContainer, BuilderType.FilterDialog);
                ViewBag.HtmlBody = FilterDialogObj.GetHtml();

                ViewBag.FilterObj = Common.EbSerializers.Json_Serialize(FilterDialogObj);
                ViewBag.wc = wc;
                ViewBag.curloc = curloc;
                ViewBag.userObj = Common.EbSerializers.Json_Serialize(_user);
                var serializerSettings = new JsonSerializerSettings();
                serializerSettings.TypeNameHandling = TypeNameHandling.All;
                serializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
                ViewBag.submitId = submitId;
            }

            return View();
        }
    }
}
