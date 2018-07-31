using ExpressBase.Common;
using ExpressBase.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class PageHeaderCommonViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public PageHeaderCommonViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            var _context = this.HttpContext;
            ViewBag.BreadCrumb = GetBrdCrumb(_context.Request.Host.ToString(), ViewBag.BrdPath, ViewBag.wc).ToString();
            return View();
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
