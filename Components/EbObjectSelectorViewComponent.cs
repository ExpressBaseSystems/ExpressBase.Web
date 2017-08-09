using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Objects;
using ServiceStack;
using ExpressBase.Objects.ServiceStack_Artifacts;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Components
{
    public class EbObjectSelectorViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        public EbObjectSelectorViewComponent(IServiceClient _client)
        {
            this.ServiceClient = _client as JsonServiceClient;
        }

        public async Task<IViewComponentResult> InvokeAsync(int type)
        {
            var resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { RefId = string.Empty, VersionId = Int32.MaxValue, EbObjectType = type, TenantAccountId = ViewBag.cid });
            var rlist = resultlist.Data;
            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in rlist)
            {
                ObjList[element.Id] = element;
            }
            ViewBag.Objlist = ObjList;

            return View();
        }
    }
}
