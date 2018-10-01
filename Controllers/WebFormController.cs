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
using Newtonsoft.Json;

namespace ExpressBase.Web.Controllers
{
    public class WebFormController : EbBaseIntCommonController
    {
        public WebFormController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public IActionResult Index(string refId, string _params)
        {
            ViewBag.editModeObj = _params ?? "false";
            ViewBag.formRefId = refId;
            return ViewComponent("WebForm", refId);
        }

        public int InsertWebformData(string TableName, string ValObj, string RefId, int RowId)
        {
            Dictionary<string, List<TableColumnMetaS>>  Values = JsonConvert.DeserializeObject<Dictionary<string, List<TableColumnMetaS>>>(ValObj);
            InsertDataFromWebformResponse Resp = ServiceClient.Post<InsertDataFromWebformResponse>(new InsertDataFromWebformRequest { RefId = RefId, TableName = TableName, Values = Values, RowId = RowId });
            return 0;
        }

        public int InsertBotDetails(string TableName, List<BotFormField> Fields, int Id)
        {
            try
            {
                InsertIntoBotFormTableResponse resp = ServiceClient.Post<InsertIntoBotFormTableResponse>(new InsertIntoBotFormTableRequest { TableName = TableName, Fields = Fields, Id = Id });
                return resp.RowAffected;
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