using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
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
        public async Task<IViewComponentResult> InvokeAsync(EbFilterDialog paramDiv)
        {
            if (paramDiv != null)
            {              

                foreach (EbControl control in paramDiv.Controls)
                {
                    if (control is EbSimpleSelect)
                    {
                        (control as EbSimpleSelect).InitFromDataBase(this.ServiceClient);
                    }
                }
                ViewBag.HtmlHead = paramDiv.GetHead();
                ViewBag.HtmlBody = paramDiv.GetHtml();
                ViewBag.FilterObj = Common.EbSerializers.Json_Serialize(paramDiv);
            }

            return View();
        }
    }
}
