using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class CodeEditorViewComponent: ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(string dsobj, int tabnum, int type)
        {
            ViewBag.dsObj = dsobj;
            ViewBag.tabnum = tabnum;
            ViewBag.ObjType = type;

            var typeArray = typeof(EbDatasourceMain).GetTypeInfo().Assembly.GetTypes();
            var _jsResult = CSharpToJs.GenerateJs<EbDatasourceMain>(BuilderType.DataSource, typeArray);
            ViewBag.Meta = _jsResult.Meta;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;

            return View();
        }
    }
}
