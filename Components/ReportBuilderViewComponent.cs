using ExpressBase.Common;
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
    public class ReportBuilderViewComponent: ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public ReportBuilderViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public async Task<IViewComponentResult> InvokeAsync(string dsobj, int tabnum, int type, string refid, string ssurl)
        {
            ViewBag.dsObj = dsobj;
            ViewBag.tabnum = tabnum;
            ViewBag.ObjType = type;
            ViewBag.Refid = refid;
            return View();
        }

        [HttpPost]
        public DataSourceColumnsResponse GetColumns(String refID)
        {
            DataSourceColumnsResponse cresp = new DataSourceColumnsResponse();
            cresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", refID));
            foreach (var columnCollection in cresp.Columns)
            {
                columnCollection.Sort(CompareEbDataColumn);
            }

            return cresp;
        }

        private int CompareEbDataColumn(object a, object b)
        {
            return (a as EbDataColumn).ColumnName.CompareTo((b as EbDataColumn).ColumnName);
        }
    }
}
