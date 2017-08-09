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
        public async Task<IViewComponentResult> InvokeAsync(EbObjectType type)
        {
            //IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);

            //var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = 2, TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            //var rlist = resultlist.Data;
            //Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();
            //foreach (var element in rlist)
            //{
            //    ObjList[element.Id] = element;
            //}
            //ViewBag.Objlist = ObjList;
            return View();
        }
    }
}
