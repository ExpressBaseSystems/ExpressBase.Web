using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class SearchUserViewComponent : ViewComponent
    {

        public async Task<IViewComponentResult> InvokeAsync(string targetDivId)
        {
            ViewBag.targetdiv = targetDivId;

            return View();
            
        }

        
    }
}
