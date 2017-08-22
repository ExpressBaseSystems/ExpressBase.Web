using ExpressBase.Data;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class DragNDropColumnsViewComponent:ViewComponent
    {

        protected IServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public DragNDropColumnsViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }
        public async Task<IViewComponentResult> InvokeAsync(string dsRefid)
        {
            DataSourceColumnsResponse columnresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", dsRefid));
            if (columnresp == null || columnresp.IsNull)
                columnresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = dsRefid, TenantAccountId = ViewBag.cid });
            ViewBag.data = GetTreeData(columnresp.Columns);
            return View();
        }

        private string GetTreeData(ColumnColletion columns)
        {
            foreach(EbDataColumn column in columns)
            {

            }
            return null;
        }
    }

    public class TreeData
    {
        public string text;
    }
}
