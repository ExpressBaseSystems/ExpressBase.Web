using ExpressBase.Objects.ObjectContainers;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class ParameterDivViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(EbFilterDialog paramDiv)
        {
            if (paramDiv != null)
            {
                ViewBag.HtmlHead = paramDiv.GetHead();
                ViewBag.HtmlBody = paramDiv.GetHtml();
            }

            return View();
        }
    }
}
