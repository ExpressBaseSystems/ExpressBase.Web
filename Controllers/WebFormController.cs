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
using ExpressBase.Common.Structures;

namespace ExpressBase.Web.Controllers
{
    public class WebFormController : EbBaseIntCommonController
    {
        public WebFormController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public IActionResult Index(string refId, string _params)
        {
            ViewBag.editModeObj = _params ?? "false";
            ViewBag.formRefId = refId;
            return ViewComponent("WebForm", new string[] { refId, this.LoggedInUser.Preference.Locale} );
        }

		public object getRowdata(string refid, int rowid)
		{
			try
			{
				GetRowDataResponse DataSet = ServiceClient.Post<GetRowDataResponse>(new GetRowDataRequest { RefId = refid, RowId = rowid });
				return DataSet;
			}
			catch (Exception ex)
			{
				Console.WriteLine("Exception in getRowdata. Message: " + ex.Message);
				return 0;
			}
		}

		public int InsertWebformData(string TableName, string ValObj, string RefId, int RowId)
        {
            Dictionary<string, List<SingleRecordField>>  Values = JsonConvert.DeserializeObject<Dictionary<string, List<SingleRecordField>>>(ValObj);
            InsertDataFromWebformResponse Resp = ServiceClient.Post<InsertDataFromWebformResponse>(new InsertDataFromWebformRequest { RefId = RefId, TableName = TableName, Values = Values, RowId = RowId });
            return Resp.RowAffected;
        }

        public bool DoUniqueCheck(string TableName, string Field, string Value, string type)
        {
            DoUniqueCheckResponse Resp = ServiceClient.Post<DoUniqueCheckResponse>(new DoUniqueCheckRequest { TableName = TableName, Field = Field, Value = Value,TypeS = type });
            return (Resp.NoRowsWithSameValue == 0);
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
	}
}