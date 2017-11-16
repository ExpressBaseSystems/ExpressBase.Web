﻿using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class EbProductPageViewComponent: ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync()
        {
           
            return View("EbProductsLogin");
        }
    }
}
