using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Common;
using ExpressBase.Objects;
using ExpressBase.Common.Objects;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Common.EbServiceStack.ReqNRes;
using ExpressBase.Common.ServiceClients;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class BotiController : EbBasetIntBotController
    {
        public BotiController(IServiceClient _client, IRedisClient _redis, IEbStaticFileClient  _sfs) : base(_client, _redis, _sfs)
        {
        }

        [HttpGet]
        public IActionResult addBot()
        {
            return View();
        }

        [HttpGet]
        public IActionResult BotDashBoard()
        {
            return View();
        }

        [HttpPost]
        public IActionResult BotDashBoard(string _name, string _fullname, string _url, string _sol_id, string _wel_msg, string chatid, string botid)
        {
            var req = this.HttpContext.Request.Form;
            var bot = new CreateBotRequest();
            bot.BotName = _name;
            bot.FullName = _fullname;
            bot.WebURL = _url;
            bot.SolutionId = _sol_id;
            bot.WelcomeMsg = _wel_msg;
            bot.BotId = botid;
            bot.ChatId = chatid;

            var res = ServiceClient.Post<CreateBotResponse>(bot);
            ViewBag.botname = _name;
            ViewBag.url = _url;
            ViewBag.welcomemsg = _wel_msg;
            ViewBag.botid = botid;
            ViewBag.fullname = _fullname;
            if (chatid != null)
            {
                ViewBag.chatid = chatid;
            }
            else
                ViewBag.chatid = res.BotId;
            return View();
        }

        [HttpPost]
        public IActionResult addBot(string _name, string _fullname, string _url, string _sol_id, string _wel_msg, string chatid, string botid)
        {
            var bot = new CreateBotRequest();
            bot.BotName = _name;
            bot.FullName = _fullname;
            bot.WebURL = _url;
            bot.SolutionId = _sol_id;
            bot.WelcomeMsg = _wel_msg;
            bot.BotId = botid;
            bot.ChatId = chatid;

            var res = ServiceClient.Post<CreateBotResponse>(bot);
            ViewBag.botname = _name;
            ViewBag.url = _url;
            ViewBag.welcomemsg = _wel_msg;
            ViewBag.botid = botid;
            ViewBag.fullname = _fullname;
            if (chatid != null)
            {
                ViewBag.chatid = chatid;
            }
            else
                ViewBag.chatid = res.BotId;
            return View();
        }

        [HttpGet]
        public IActionResult BotList()
        {
            int _sol_id = 100;
            var bot = new BotListRequest();
            bot.SolutionId = _sol_id;
            List<ChatBot> Bots = ServiceClient.Get<BotListResponse>(bot).Data;

            string _html = string.Empty;

            string BotTile = @"
        <form method='post' action='../Boti/addBot'>
             <div class='botlist-box' tabindex='1'>
                <div class='Bot-tile'>
                    <h4>@Name@</h4>
                    <div class='bottile-icon'></div>
                    <div class='sitename'>@WebsiteURL@</div>
                    <div class='pull-left'>
                        <div class='created-lbl'>@CreatedBy@</div>
                        <div class='created-date'>@CreatedAt@</div>
                    </div>
                    <div class='pull-right'>

                        <div class='modified-lbl'>@LastModifiedBy@</div>
                        <div class='modified-date'>@LastModifiedAt@</div>
                    </div>
                </div>
            </div>
            <input type='hidden' value='@Name@' name='_name' />
            <input type='hidden' value='@fullname@' name='_fullname' />
            <input type='hidden' value='@WebsiteURL@' name='_url' />
            <input type='hidden' value='@ViewBag.chatid' name='_chat_id' />
            <input type='hidden' value='@welcomeMsg@' name='_wel_msg' />
            <input type='hidden' value='@ViewBag.solid' name='_sol_id' />
            <input type='hidden' value='@chatid@' name='chatid' />
            <input type='hidden' value='@botid@' name='botid' />
         </form>";

            foreach (ChatBot chatbot in Bots)
            {
                _html += BotTile.Replace("@Name@", chatbot.Name)
                    .Replace("@fullname@", chatbot.FullName)
                    .Replace("@WebsiteURL@", chatbot.WebsiteURL)
                    .Replace("@LastModifiedBy@", chatbot.LastModifiedBy)
                    .Replace("@LastModifiedAt@", chatbot.LastModifiedAt.ToString())
                    .Replace("@CreatedBy@", chatbot.CreatedBy)
                    .Replace("@CreatedAt@", chatbot.CreatedAt.ToString())
                    .Replace("@welcomeMsg@", chatbot.WelcomeMsg)
                    .Replace("@chatid@", chatbot.ChatId)
                    .Replace("@botid@", chatbot.BotId)
                    .Replace("@ViewBag.solid", "100");
            }
            ViewBag.tileshtml = _html;
            return View();
        }

        public dynamic GetCurForm(string refid)
        {
            var formObj = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
            var Obj = EbSerializers.Json_Deserialize(formObj.Data[0].Json);
            if (Obj is EbBotForm)
            {
                //EbBotForm obj = Obj as EbBotForm;
                foreach (EbControl control in Obj.Controls)
                {
                    if (control is EbSimpleSelect)
                    {
                        (control as EbSimpleSelect).InitFromDataBase(this.ServiceClient);
						(control as EbSimpleSelect).BareControlHtml = (control as EbSimpleSelect).GetBareHtml();

					}
                    else if (control is EbDynamicCardSet)
                    {
                        EbDynamicCardSet EbDynamicCards = (control as EbDynamicCardSet);
                        EbDynamicCards.InitFromDataBase(this.ServiceClient);
                        EbDynamicCards.BareControlHtml = EbDynamicCards.GetBareHtml();
                    }
					else if(control is EbSurvey)
					{
						(control as EbSurvey).InitFromDataBase(this.ServiceClient);
						(control as EbSurvey).BareControlHtml = (control as EbSurvey).GetBareHtml();
					}
                    //else if (control is EbImage)
                    //{
                    //    (control as EbCards).InitFromDataBase(this.ServiceClient);
                    //}
                }
            }
            if (Obj is EbTableVisualization)
            {
                EbTableVisualization Tobj = (Obj as EbTableVisualization);
                Tobj.AfterRedisGet(this.Redis, this.ServiceClient);
                //string BotCols = "[";
                //string BotData = "[";
                //int i = 0;

                //foreach (DVBaseColumn col in Tobj.Columns)
                //{
                //	BotCols += "{" + "\"data\":" + i++ + ",\"title\":\"" + col.Name + "\"},";
                //}
                //BotCols = BotCols.TrimEnd(',') + "]";

                //DataSourceDataResponse dresp = this.ServiceClient.Get<DataSourceDataResponse>(new DataSourceDataRequest { RefId = Tobj.DataSourceRefId, Draw = 1 });
                //var data = dresp.Data;
                //foreach (EbDataRow row in data)
                //{
                //	i = 0;
                //	BotData += "{";
                //	foreach (var item in row)
                //	{
                //		BotData += "\"" + i++ + "\":\"" + item + "\",";
                //		//BotData += "\"" + item + "\",";
                //	}
                //	BotData = BotData.TrimEnd(',') + "},";
                //}
                //BotData = BotData.TrimEnd(',') + "]";

                //Tobj.BotCols = BotCols;
                //Tobj.BotData = BotData;
                //return EbSerializers.Json_Serialize(Tobj);
            }
            if (Obj is EbChartVisualization)
            {
                return EbSerializers.Json_Serialize(Obj);
            }
            //else if (Obj is EbChartVisualization)
            //{
            //}
            return Obj;
        }

        public int InsertBotDetails(string TableName, List<BotInsert> Fields)
        {
			try
			{
				var x = ServiceClient.Post<InsertIntoBotFormTableResponse>(new InsertIntoBotFormTableRequest { TableName = TableName, Fields = Fields, AnonUserId = this.AnonUserId });
				return x.RowAffected;
			}
			catch(Exception ex)
			{
				Console.WriteLine("Exception in InsertBotDetails. Message: "+ ex.Message);
				return 0;
			}            
        }

        [HttpPost]
        public IActionResult dvView1(string dvobj)
        {
            var dvObject = EbSerializers.Json_Deserialize(dvobj);
            dvObject.AfterRedisGet(this.Redis, this.ServiceClient);
            return ViewComponent("DataVisualization", new { dvobjt = dvobj, dvRefId = "", forWrap = "wrap" });
        }

        public DataSourceDataResponse getData(TableDataRequest request)
        {
            DataSourceDataResponse resultlist1 = null;
            try
            {
                resultlist1 = this.ServiceClient.Get(request);
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.ToString());
            }
            return resultlist1;
        }

        [HttpPost]
        public async Task<bool> UploadFileAsync(string base64, string filename, string type)
        {
            try
            {
                UploadFileAsyncRequest uploadFileRequest = new UploadFileAsyncRequest();
                uploadFileRequest.FileDetails = new FileMeta();
                byte[] myFileContent;
                myFileContent = System.Convert.FromBase64String(base64);
                uploadFileRequest.FileByte = myFileContent;
                uploadFileRequest.FileDetails.FileName = filename;
                uploadFileRequest.FileDetails.FileType = type;
                uploadFileRequest.FileDetails.Length = uploadFileRequest.FileByte.Length;

                this.FileClient.Post<UploadAsyncResponse>(uploadFileRequest);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.ToString());
                return false;
            }
        }

        [HttpPost]
        public bool SendSurveyResponse(string json)
        {
            var o = JsonConvert.DeserializeObject<SurveyLine>(json);
            SurveyLinesResponse resp = this.ServiceClient.Post(new SurveyLinesRequest
            {
                MasterId = o.MasterId,
                QuesId = o.QuesId,
                ChoiceIds = o.ChoiceIds,
                Answer = o.Answer,
                QuesType = o.QuesType
            });
            return resp.Status;
        }
    }
}