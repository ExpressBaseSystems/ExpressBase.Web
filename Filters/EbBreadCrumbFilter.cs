using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Filters
{
    public class EbBreadCrumbFilter : ActionFilterAttribute, IActionFilter
    {
        private string Param = "";
        private string Key = "";
        private string ParamTemp = "";

        public EbBreadCrumbFilter() { }

        public EbBreadCrumbFilter(string param, string key)
        {
            this.Param = param;
            this.Key = key;
        }

        public EbBreadCrumbFilter(String param)
        {
            this.Param = param;
        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            string brd = "";
            var controller = context.Controller as Controller;

            if (context.HttpContext.Items[this.Key] != null)
            {
                brd = this.Param + context.HttpContext.Items[this.Key];
            }
            else
                brd = this.ParamTemp;

            controller.ViewBag.BrdPath = brd;
            base.OnActionExecuted(context);
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            foreach (KeyValuePair<string, object> o in context.ActionArguments)
            {
                if (this.Param.Contains(o.Key))
                    this.ParamTemp = this.Param.Replace(o.Key.ToString(), o.Value.ToString());
                else
                    this.ParamTemp = this.Param;
            }

            if (context.ActionArguments.Count <= 0)
                this.ParamTemp = this.Param;

            base.OnActionExecuting(context);
        }
    }
}
