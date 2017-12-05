using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ServiceStack.Redis;
using ExpressBase.Common;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using ExpressBase.Objects.ReportRelated;
using System.Reflection;
using System.Data;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class RBController : EbBaseNewController
    {
        public RBController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

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
