using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.Controllers
{
    public class WebFormController : EbBaseIntCommonController
    {
        public WebFormController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public IActionResult Index(string refId , string _params)
        {
            ViewBag.editModeObj = _params ?? "false";
            ViewBag.formRefId = refId;
            return ViewComponent("WebForm", refId);
        }

        public int InsertBotDetails(string TableName, List<BotFormField> Fields, int Id)
        {
            try
            {
                var x = ServiceClient.Post<InsertIntoBotFormTableResponse>(new InsertIntoBotFormTableRequest { TableName = TableName, Fields = Fields ,Id = Id });
                return x.RowAffected;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in InsertBotDetails. Message: " + ex.Message);
                return 0;
            }
        }

        public object getRowdata(string refid, int rowid)
        {
            try
            {
                EbDataSet DataSet = ServiceClient.Post<EbDataSet>(new GetRowDataRequest { RefId = refid, RowId = rowid });
                GetRowDataResponse dataset = new GetRowDataResponse();

                dataset.RowValues = getDataSetAsRowCollection(DataSet);



                return dataset;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in InsertBotDetails. Message: " + ex.Message);
                return 0;
            }
        }

        private List<object> getDataSetAsRowCollection(EbDataSet dataset)
        {
            List<object> rowColl = new List<object>();
            foreach (EbDataTable dataTable in dataset.Tables)
            {
                foreach (EbDataRow dataRow in dataTable.Rows)
                {                    
                    foreach (object item in dataRow)
                    {
                        rowColl.Add(item);
                    }
                }
            }

            return rowColl;
        }
    }
}