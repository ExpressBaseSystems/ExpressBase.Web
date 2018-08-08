using ExpressBase.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ExpressBase.Web.Filters
{
    public class EbBreadCrumbFilter : ActionFilterAttribute, IActionFilter
    {
        private string Param = string.Empty;
        private string Key = string.Empty;
        private string ParamTemp = string.Empty;

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
            var _context = context.HttpContext;
            string brd = string.Empty;
            var controller = context.Controller as Controller;

            if (_context.Items[this.Key] != null)
            {
                brd = this.Param + _context.Items[this.Key];
            }
            else
                brd = this.ParamTemp;

            //controller.ViewBag.BrdPath = brd;
            controller.ViewBag.BreadCrumb = GetBrdCrumb(_context.Request.Host.ToString(), brd,controller.ViewBag.wc).ToString();
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

        public StringBuilder GetBrdCrumb(string host, string path, string wc)
        {
            string[] patharray;
            StringBuilder brd = new StringBuilder();
            if (path != null)
                patharray = path.Split("/");
            else
                patharray = new string[] { };

            if (wc == RoutingConstants.TC)
            {
                for (int i = 0; i < patharray.Length; i++)
                {
                    brd.Append(@"<span class='eb_slash'>/</span><span class='eb_context'><a href=''>" + patharray[i] + "</a></span>");
                }
            }
            else if (wc == RoutingConstants.DC)
            {
                string[] hostparts = host.Split(".");
                for (int i = 0; i < patharray.Length; i++)
                {
                    brd.Append(@"<span class='eb_slash'>/</span><span class='eb_context'><a href=''>" + patharray[i] + "</a></span>");
                }
            }
            else if (wc == RoutingConstants.UC)
            {
                string[] hostparts = host.Split(".");
                for (int i = 0; i < patharray.Length; i++)
                {
                    brd.Append(@"<span class='eb_slash'>/</span><span class='eb_context'><a href=''>" + patharray[i] + "</a></span>");
                }
            }
            return brd;
        }
    }
}
