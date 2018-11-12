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
using ExpressBase.Objects;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Extensions;
using System.Reflection;
using ExpressBase.Common.Objects.Attributes;

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

		public string AuditTrail(string refid, int rowid)
		{
			//sourc == dest == type == src id == src verid == dst id == dst verid
			//ebdbllz23nkqd620180220120030-ebdbllz23nkqd620180220120030-0-2257-2976-2257-2976
			try
			{
				string[] refidparts = refid.Split("-");
				if (refidparts[1].Equals(ViewBag.cid))
				{
					if(this.LoggedInUser.EbObjectIds.Contains(refidparts[5].PadLeft(5, '0')) || this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
					{
						GetAuditTrailResponse Resp = ServiceClient.Post<GetAuditTrailResponse>(new GetAuditTrailRequest { FormId = refid, RowId = rowid });
						//----------------------This code should be changed

						EbObjectParticularVersionResponse verResp = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
						EbWebForm WebForm = EbSerializers.Json_Deserialize<EbWebForm>(verResp.Data[0].Json);
						if (WebForm != null)
						{
							string[] Keys = EbControlContainer.GetKeys(WebForm);
							Dictionary<string, string> KeyValue = ServiceClient.Get<GetDictionaryValueResponse>(new GetDictionaryValueRequest { Keys = Keys, Locale = this.LoggedInUser.Preference.Locale }).Dict;							
							EbWebForm WebForm_L = EbControlContainer.Localize<EbWebForm>(WebForm, KeyValue);

							Dictionary<string, string> MLPair = GetMLPair(WebForm_L);

							foreach (KeyValuePair<int, FormTransaction> item in Resp.Logs)
							{
								foreach (FormTransactionLine initem in item.Value.Details)
								{
									if (MLPair.ContainsKey(initem.FieldName))
										initem.FieldName = MLPair[initem.FieldName];
								}
							}
						}

						//--------------------------------
						return JsonConvert.SerializeObject(Resp.Logs);
					}
				}
				return string.Empty;
			}
			catch (Exception ex)
			{
				Console.WriteLine("Exception in GetAuditTrail. Message: " + ex.Message);
				return string.Empty;
			}
		}

		private Dictionary<string, string> GetMLPair(EbWebForm WebForm_L)
		{
			Dictionary<string, string> MLPair = new Dictionary<string, string>();
			EbControl[] controls = (WebForm_L as EbControlContainer).Controls.FlattenAllEbControls();
			foreach (EbControl control in controls)
			{
				PropertyInfo[] props = control.GetType().GetProperties();
				foreach (PropertyInfo prop in props)
				{
					if (prop.IsDefined(typeof(PropertyEditor)) && prop.GetCustomAttribute<PropertyEditor>().PropertyEditorType == PropertyEditorType.MultiLanguageKeySelector)
					{
						if(prop.Name == "Label")
							MLPair.Add(control.Name, control.GetType().GetProperty(prop.Name).GetValue(control, null) as String);
					}
				}
			}
			return MLPair;
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
            WebformData Values = JsonConvert.DeserializeObject<WebformData>(ValObj);
            //InsertDataFromWebformResponse Resp = ServiceClient.Post<InsertDataFromWebformResponse>(new InsertDataFromWebformRequest { RefId = RefId, TableName = TableName, Values = Values, RowId = RowId });
            //return Resp.RowAffected;
            return 0;
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