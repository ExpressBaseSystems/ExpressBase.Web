using ExpressBase.Common;
using ExpressBase.Common.Data;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Auth;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Threading.Tasks;
using Twilio.Rest.Api.V2010.Account;

namespace ExpressBase.Web.Controllers
{
    public class SMSLogController : EbBaseIntCommonController
    {
        public SMSLogController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public IActionResult SMSLogConsole()
        {
            Type[] typeArray = typeof(EbDashBoardWraper).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DashBoard, typeof(EbObject));
            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;
            ViewBag.ControlOperations = EbControlContainer.GetControlOpsJS((new EbWebForm()) as EbControlContainer, BuilderType.FilterDialog);

            List<int> types = new List<int>() { 19 };
            GetAllCommitedObjectsResp Result = this.ServiceClient.Get<GetAllCommitedObjectsResp>(new GetAllCommitedObjectsRqst { Typelist = types });
            ViewBag.SMSLogObject = JsonConvert.SerializeObject(Result.Data);
            return View("SmsLogConsole");
        }

        public ListSMSLogsResponse Get_SMS_List(string Refid, string FromDate, string ToDate)
        {
            ListSMSLogsResponse resp = new ListSMSLogsResponse();
            string query = string.Empty;
            List<Param> _params = new List<Param>();
            if (!string.IsNullOrEmpty(Refid))
            {
                query = @"
                    SELECT
		                    l.send_from, l.send_to, l.message_body, u.fullname as executed_by, l.eb_created_at as executed_at, 
                            l.status, (CASE WHEN l.status='success' THEN '' ELSE l.result END) as result, l.id   
	                    FROM
		                    eb_sms_logs l, eb_users u 
	                    WHERE
		                    l.id NOT IN (SELECT retryof FROM eb_sms_logs WHERE retryof IS NOT NULL) AND u.id =l.eb_created_by AND
		                    (l.eb_created_at::date BETWEEN :from_date AND :to_date) AND 
							l.refid = :refid AND COALESCE(l.eb_del,'F') = 'F'
	                    ORDER BY 
		                    l.id DESC;";
                _params.Add(new Param { Name = "refid", Type = ((int)EbDbTypes.String).ToString(), Value = Refid });
            }
            else
            {
                query = @"
                    SELECT
		                    l.send_from, l.send_to, l.message_body, u.fullname as executed_by, l.eb_created_at as executed_at, 
                            l.status, (CASE WHEN l.status='success' THEN '' ELSE l.result END) as result, l.id   
	                    FROM
		                    eb_sms_logs l, eb_users u 
	                    WHERE
		                    l.id NOT IN (SELECT retryof FROM eb_sms_logs WHERE retryof IS NOT NULL) AND u.id =l.eb_created_by AND
		                    (l.eb_created_at::date between :from_date AND :to_date) AND 
							COALESCE(l.eb_del,'F') = 'F'
	                    ORDER BY 
		                    l.id DESC, status ASC;";
            }

            DateTime Fdate = DateTime.ParseExact(FromDate, "dd-MM-yyyy", null);
            DateTime Tdate = DateTime.ParseExact(ToDate, "dd-MM-yyyy", null);
            _params.Add(new Param { Name = "from_date", Type = ((int)EbDbTypes.DateTime).ToString(), Value = Fdate.ToString() });
            _params.Add(new Param { Name = "to_date", Type = ((int)EbDbTypes.DateTime).ToString(), Value = Tdate.ToString() });

            string[] arrayy = new string[] { "From", "To", "Message", "Executed By", "Executed At", "Status", "Response", "id" };
            DVColumnCollection DVColumnCollection = GetColumnsForSMSLog(arrayy);
            EbDataVisualization Visualization = new EbTableVisualization { Sql = query, ParamsList = _params, Columns = DVColumnCollection, AutoGen = false, IsPaging = true };

            resp.Visualization = EbSerializers.Json_Serialize(Visualization);
            var x = EbSerializers.Json_Serialize(resp);
            return resp;
        }

        public DVColumnCollection GetColumnsForSMSLog(string[] strArray)
        {
            var Columns = new DVColumnCollection();
            try
            {
                foreach (string str in strArray)
                {
                    DVBaseColumn _col = null;
                    if (str == "From")
                        _col = new DVStringColumn { Data = 0, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    if (str == "To")
                        _col = new DVStringColumn { Data = 1, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    if (str == "Message")
                        _col = new DVStringColumn { Data = 2, Name = str, sTitle = str, Type = EbDbTypes.String, AllowedCharacterLength = 20, bVisible = true };
                    if (str == "Executed By")
                        _col = new DVStringColumn { Data = 3, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    if (str == "Executed At")
                        _col = new DVDateTimeColumn { Data = 4, Name = str, sTitle = str, Type = EbDbTypes.Date, bVisible = true, Format = DateFormat.DateTime, ConvretToUsersTimeZone = true };
                    if (str == "Status")
                        _col = new DVStringColumn { Data = 5, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    if (str == "Response")
                        _col = new DVStringColumn { Data = 6, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    if (str == "id")
                        _col = new DVNumericColumn { Data = 7, Name = str, sTitle = str, Type = EbDbTypes.Int32, bVisible = false };

                    _col.Name = str;
                    _col.RenderType = _col.Type;
                    _col.ClassName = "tdheight";
                    _col.Font = null;
                    _col.Align = Align.Left;
                    Columns.Add(_col);
                }

                var str1 = String.Format("T0.status == \"{0}\"", "failure");
                Columns.Add(new DVButtonColumn { Data = 8, Name = "Action", sTitle = "Action", ButtonText = "Retry", ButtonClassName = "retryBtn", bVisible = true, IsCustomColumn = true, RenderCondition = new AdvancedCondition { Value = new EbScript { Code = str1, Lang = ScriptingLanguage.CSharp } } });
            }
            catch (Exception e)
            {
                Console.WriteLine("no coloms" + e.StackTrace);
            }

            return Columns;
        }

        public RetrySmsResponse SmsRetry(int Id, string RefId)
        {
            RetrySmsResponse response = null;
            if (Id > 0 && RefId != null && RefId != String.Empty)
                response = this.ServiceClient.Post(new RetrySmsRequest { SmslogId = Id, RefId = RefId });
            return response;
        }
    }
}
