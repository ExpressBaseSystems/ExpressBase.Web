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
using ExpressBase.Common.Constants;
using System.IO;
using ExpressBase.Common.Enums;

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


        //==================================================== NEW CODE START - 02/04/2020 =========================================================
        
        //refid => refid of botform - required param
        //rowid => data id of the record - required only for edit mode
        public string GetCurForm_New(string refid, int rowid)
        {
            var ObjResp = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
            var Obj = EbSerializers.Json_Deserialize(ObjResp.Data[0].Json);
            string retStr = string.Empty;
            //EbBotForm BotForm = this.GetBotForm(refid);
            if (Obj is EbBotForm)
            {
                EbBotForm BotForm = Obj as EbBotForm;
                foreach (EbControl control in BotForm.Controls)
                {
                    if (control is EbSimpleSelect)
                    {
                        (control as EbSimpleSelect).InitFromDataBase(this.ServiceClient);
                        (control as EbSimpleSelect).BareControlHtml4Bot = (control as EbSimpleSelect).GetBareHtml();

                    }
                    if (control is EbTVcontrol)
                    {
                        (control as EbTVcontrol).InitFromDataBase(this.ServiceClient);
                        (control as EbTVcontrol).BareControlHtml4Bot = (control as EbTVcontrol).GetBareHtml();
                    }
                    else if (control is EbImage)
                    {
                        (control as EbImage).BareControlHtml4Bot = (control as EbImage).GetBareHtml();
                    } 
                    else if (control is EbMeetingPicker)
                    {
                        (control as EbMeetingPicker).BareControlHtml4Bot = (control as EbMeetingPicker).GetWrapedCtrlHtml4bot();
                    }
                    else if (control is EbPowerSelect && (control as EbPowerSelect).RenderAsSimpleSelect)
                    {
                        (control as EbPowerSelect).InitFromDataBase_SS(this.ServiceClient);
                    }
                    else if (control is EbDynamicCardSet)
                    {
                        EbDynamicCardSet EbDynamicCards = (control as EbDynamicCardSet);
                        EbDynamicCards.InitFromDataBase(this.ServiceClient);
                        EbDynamicCards.BareControlHtml4Bot = EbDynamicCards.GetBareHtml();
                    }
                    else if (control is EbSurvey)
                    {
                        (control as EbSurvey).InitFromDataBase(this.ServiceClient);
                        (control as EbSurvey).BareControlHtml = (control as EbSurvey).GetBareHtml();
                    }
                }
                Dictionary<string, string> Dict = new Dictionary<string, string>();
                Dict.Add("object", EbSerializers.Json_Serialize(BotForm));
                Dict.Add("data", this.GetFormData(refid, rowid));
                retStr = JsonConvert.SerializeObject(Dict);
            }
            else if (Obj is EbTableVisualization)
            {
                EbTableVisualization Tobj = (Obj as EbTableVisualization);
                Tobj.AfterRedisGet(this.Redis, this.ServiceClient);
                Dictionary<string, string> Dict = new Dictionary<string, string>();
                Dict.Add("object", EbSerializers.Json_Serialize(Obj));
                retStr = JsonConvert.SerializeObject(Dict);
            }
            else if (Obj is EbChartVisualization)
            {
                Dictionary<string, string> Dict = new Dictionary<string, string>();
                Dict.Add("object", EbSerializers.Json_Serialize(Obj));
                retStr = JsonConvert.SerializeObject(Dict);
            }

            return retStr;
        }

        //refid => refid of botform
        //rowid => 0 for EmptyModel and greater than 0 for Edit mode data
        public string GetFormData(string refid, int rowid)
        {
            EbBotForm BotForm = this.GetBotForm(refid);
            try
            {
                GetRowDataResponse DataSet = ServiceClient.Post<GetRowDataResponse>(new GetRowDataRequest { RefId = BotForm.WebFormRefId, RowId = rowid, UserObj = this.LoggedInUser, CurrentLoc = this.LoggedInUser?.Preference?.DefaultLocation ?? 1, RenderMode = WebFormRenderModes.Normal });
                return DataSet.FormDataWrap;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in getRowdata. Message: " + ex.Message);
                return JsonConvert.SerializeObject(new WebformDataWrapper()
                {
                    Message = "Error in loading data...",
                    Status = (int)HttpStatusCodes.INTERNAL_SERVER_ERROR,
                    MessageInt = ex.Message,
                    StackTraceInt = ex.StackTrace
                });
            }
        }

        //insert or update formdata
        public string UpdateFormData(string refid, int rowid, string data)
        {
            try
            {
                EbBotForm BotForm = this.GetBotForm(refid);
                WebformData Values = JsonConvert.DeserializeObject<WebformData>(data);
                InsertDataFromWebformResponse Resp = ServiceClient.Post<InsertDataFromWebformResponse>(
                    new InsertDataFromWebformRequest
                    {
                        RefId = BotForm.WebFormRefId,
                        FormData = Values,
                        RowId = rowid,
                        CurrentLoc = this.LoggedInUser?.Preference?.DefaultLocation ?? 1,
                        UserObj = this.LoggedInUser
                    });
                return JsonConvert.SerializeObject(Resp);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new InsertDataFromWebformResponse { Status = (int)HttpStatusCodes.INTERNAL_SERVER_ERROR, Message = "Something went wrong", MessageInt = ex.Message, StackTraceInt = ex.StackTrace });
            }
        }

        private EbBotForm GetBotForm(string refid)
        {
            EbBotForm BotForm = this.Redis.Get<EbBotForm>(refid);
            if (BotForm == null)
            {
                EbObjectParticularVersionResponse resp = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
                BotForm = EbSerializers.Json_Deserialize(resp.Data[0].Json);
                this.Redis.Set<EbBotForm>(refid, BotForm);
            }
            return BotForm;
        }

        //======================================================= NEW CODE END ================================================================

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
						(control as EbSimpleSelect).BareControlHtml4Bot = (control as EbSimpleSelect).GetBareHtml();

					}
					else if (control is EbPowerSelect && (control as EbPowerSelect).RenderAsSimpleSelect)
					{
						(control as EbPowerSelect).InitFromDataBase_SS(this.ServiceClient);
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
            return EbSerializers.Json_Serialize(Obj);
        }

        public int InsertBotDetails(string RefId, List<BotFormField> Fields)
        {
			try
			{
				var Resp = ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = RefId });
				var FormObj = EbSerializers.Json_Deserialize(Resp.Data[0].Json);
				if (FormObj is EbBotForm)
				{
					var BotForm = FormObj as EbBotForm;

					foreach (EbControl control in BotForm.Controls)
					{
						var CurFld = Fields.Find(i => i.Name == control.Name);
						if(CurFld != null)
						{
							//var engine = new Jurassic.ScriptEngine();
							//Console.WriteLine(engine.Evaluate("5 * 10 + 2"));
						}
					}

					var x = ServiceClient.Post<InsertIntoBotFormTableResponse>(new InsertIntoBotFormTableRequest { TableName = BotForm.TableName, Fields = Fields, AnonUserId = this.AnonUserId });
					return x.RowAffected;
				}
				
			}
			catch(Exception ex)
			{
				Console.WriteLine("Exception in InsertBotDetails. Message: "+ ex.Message);				
			}
			return 0;
		}

		public int SubmitBotForm(int Id, string RefId, List<BotFormField> Fields)
		{
			try
			{
				var x = ServiceClient.Post<SubmitBotFormResponse>(new SubmitBotFormRequest { Id = Id, RefId = RefId, Fields = Fields, AnonUserId = this.AnonUserId });
				return x.RowAffected;
			}
			catch (Exception ex)
			{
				Console.WriteLine("Exception in SubmitBotForm. Message: " + ex.Message);
			}
			return 0;

		}


		//var Resp = ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = RefId });
		//var FormObj = EbSerializers.Json_Deserialize(Resp.Data[0].Json);
		//if (FormObj is EbBotForm)
		//{
		//	var BotForm = FormObj as EbBotForm;

		//	if (!IsFormDataValid(FormObj, Fields))
		//	{
		//		return -1;
		//	}

		//	if (Id == 0)
		//	{
		//		var x = ServiceClient.Post<InsertIntoBotFormTableResponse>(new InsertIntoBotFormTableRequest { TableName = BotForm.TableName, Fields = Fields, AnonUserId = this.AnonUserId });
		//		return x.RowAffected;
		//	}
		//	else
		//	{
		//		var x = ServiceClient.Post<UpdateBotFormTableResponse>(new UpdateBotFormTableRequest { Id = Id, TableName = BotForm.TableName, Fields = Fields, AnonUserId = this.AnonUserId });
		//		return x.RowAffected;
		//	}
		//}

		
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

		//for redirecting to static controller
		[HttpPost]
		public ActionResult RedirectToStaticImage(int i)
		{
			return Redirect("/StaticFile/UploadImageAsync");
		}


		[HttpPost]
		public async Task<int> UploadFileAsync(int i)
		{
			UploadAsyncResponse res = new UploadAsyncResponse();
			try
			{
				var req = this.HttpContext.Request.Form;

				List<string> tags = string.IsNullOrEmpty(req["Tags"]) ? new List<string>() : req["Tags"].ToList<string>();
				List<string> catogory = string.IsNullOrEmpty(req["Category"]) ? new List<string>() : req["Category"].ToList<string>();
				string context = (req.ContainsKey("Context")) ? context = req["Context"] : StaticFileConstants.CONTEXT_DEFAULT;

				UploadFileAsyncRequest uploadFileRequest = new UploadFileAsyncRequest();
				uploadFileRequest.FileDetails = new FileMeta();

				foreach (var formFile in req.Files)
				{
					if (formFile.Length > 0)
					{
						byte[] myFileContent;

						using (var memoryStream = new MemoryStream())
						{
							await formFile.CopyToAsync(memoryStream);
							memoryStream.Seek(0, SeekOrigin.Begin);
							myFileContent = new byte[memoryStream.Length];
							await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);

							uploadFileRequest.FileByte = myFileContent;
						}

						uploadFileRequest.FileDetails.FileName = formFile.FileName.ToLower();
						uploadFileRequest.FileDetails.FileType = formFile.FileName.SplitOnLast(CharConstants.DOT).Last().ToLower();
						uploadFileRequest.FileDetails.Length = uploadFileRequest.FileByte.Length;
						uploadFileRequest.FileDetails.FileCategory = EbFileCategory.File;

						uploadFileRequest.FileDetails.MetaDataDictionary = new Dictionary<String, List<string>>();
						uploadFileRequest.FileDetails.MetaDataDictionary.Add("Tags", tags);
						uploadFileRequest.FileDetails.MetaDataDictionary.Add("Category", catogory);
						uploadFileRequest.FileDetails.Context = context;

						res = this.FileClient.Post<UploadAsyncResponse>(uploadFileRequest);

						if (res.FileRefId > 0)
							Console.WriteLine(String.Format("file Upload Success [RefId:{0}]", res.FileRefId));
						else
							Console.WriteLine("Exception: file Upload Failure");
					}
				}
			}
			catch (Exception e)
			{
				Console.WriteLine("Exception:" + e.ToString() + "\nResponse: " + res.ResponseStatus.Message);
			}
			return res.FileRefId;
		}

		[HttpPost]
		public async Task<int> UploadImageAsync(int i)
		{
			UploadAsyncResponse res = new UploadAsyncResponse();
			try
			{
				var req = this.HttpContext.Request.Form;
				List<string> tags = string.IsNullOrEmpty(req["Tags"]) ? new List<string>() : req["Tags"].ToList<string>();
				List<string> catogory = string.IsNullOrEmpty(req["Category"]) ? new List<string>() : req["Category"].ToList<string>();
				string context = (req.ContainsKey("Context")) ? context = req["Context"] : StaticFileConstants.CONTEXT_DEFAULT;

				UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
				uploadImageRequest.ImageInfo = new ImageMeta();
				foreach (var formFile in req.Files)
				{
					if (formFile.Length > 0 && Enum.IsDefined(typeof(ImageTypes), formFile.FileName.SplitOnLast(CharConstants.DOT).Last().ToLower()))
					{
						byte[] myFileContent;
						using (var memoryStream = new MemoryStream())
						{
							await formFile.CopyToAsync(memoryStream);
							memoryStream.Seek(0, SeekOrigin.Begin);
							myFileContent = new byte[memoryStream.Length];
							await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);
							uploadImageRequest.ImageByte = myFileContent;
						}
						uploadImageRequest.ImageInfo.MetaDataDictionary = new Dictionary<String, List<string>>();
						uploadImageRequest.ImageInfo.MetaDataDictionary.Add("Tags", tags);
						uploadImageRequest.ImageInfo.MetaDataDictionary.Add("Category", catogory);
						uploadImageRequest.ImageInfo.Context = context;

						uploadImageRequest.ImageInfo.FileName = formFile.FileName.ToLower();
						uploadImageRequest.ImageInfo.FileType = formFile.FileName.SplitOnLast(CharConstants.DOT).Last().ToLower();
						uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
						uploadImageRequest.ImageInfo.FileCategory = EbFileCategory.Images;
						uploadImageRequest.ImageInfo.ImageQuality = Common.ImageQuality.original;

						res = this.FileClient.Post<UploadAsyncResponse>(uploadImageRequest);

						if (res.FileRefId > 0)
							Console.WriteLine(String.Format("Img Upload Success [RefId:{0}]", res.FileRefId));
						else
							Console.WriteLine("Exception: Img Upload Failure");
					}
				}
			}
			catch (Exception e)
			{
				Console.WriteLine("Exception:" + e.ToString() + "\nResponse: " + res.ResponseStatus.Message);
			}
			return res.FileRefId;
		}
	}
}