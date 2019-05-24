﻿using System;
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
using ExpressBase.Common.Data;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Constants;

namespace ExpressBase.Web.Controllers
{
    public class WebFormController : EbBaseIntCommonController
    {
        public WebFormController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public IActionResult Index(string refId, string _params, int _mode, int _locId)
        {
            ViewBag.rowId = 0;
            ViewBag.formData = "null";
            ViewBag.Mode = WebFormModes.New_Mode.ToString().Replace("_", " ");
            ViewBag.IsPartial = _mode > 10;
            _mode = _mode > 0 ? _mode % 10 : _mode;
            if(_params != null)
            {
                List<Param> ob = JsonConvert.DeserializeObject<List<Param>>(_params.FromBase64());
                if((int)WebFormDVModes.View_Mode == _mode && ob.Count == 1)
                {
                    WebformData wfd = getRowdata(refId, Convert.ToInt32(ob[0].ValueTo), -1);////////////////////////current location
                    if (wfd.MultipleTables.Count == 0)
                    {
                        ViewBag.Mode = WebFormModes.Fail_Mode.ToString().Replace("_", " ");
                    }
                    else if (ob[0].ValueTo > 0)
                    {
                        ViewBag.rowId = ob[0].ValueTo;
                        ViewBag.Mode = WebFormModes.View_Mode.ToString().Replace("_", " ");
                        ViewBag.formData = JsonConvert.SerializeObject(wfd);
                    }
                }
                else if((int)WebFormDVModes.New_Mode == _mode)
                {
                    try
                    {
                        GetPrefillDataResponse Resp = ServiceClient.Post<GetPrefillDataResponse>(new GetPrefillDataRequest { RefId = refId, Params = ob });
                        ViewBag.formData = JsonConvert.SerializeObject(Resp.FormData);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Exception in getPrefillData. Message: " + ex.Message);
                    }
                }
            }
                                   
            if(ViewBag.wc == TokenConstants.DC)
            {
                ViewBag.Mode = WebFormModes.Preview_Mode.ToString().Replace("_", " ");
            }
            ViewBag.formRefId = refId;
            ViewBag.userObject = JsonConvert.SerializeObject(this.LoggedInUser);

            ViewBag.__Solution = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", ViewBag.cid));
            ViewBag.__User = this.LoggedInUser;

            return ViewComponent("WebForm", new string[] { refId, this.LoggedInUser.Preference.Locale });
        }
                
        public WebformData getRowdata(string refid, int rowid, int currentloc)
        {
            try
            {
                if(this.HasPermission(refid, OperationConstants.VIEW, currentloc) || this.HasPermission(refid, OperationConstants.NEW, currentloc) || this.HasPermission(refid, OperationConstants.EDIT, currentloc))
                {
                    GetRowDataResponse DataSet = ServiceClient.Post<GetRowDataResponse>(new GetRowDataRequest { RefId = refid, RowId = rowid, UserObj = this.LoggedInUser });
                    return DataSet.FormData;
                }
                throw new FormException("Access Denied for rowid " + rowid + " , current location " + currentloc);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in getRowdata. Message: " + ex.Message);
                return new WebformData();
            }
        }

        public string InsertWebformData(string TableName, string ValObj, string RefId, int RowId, int CurrentLoc)
        {
            string Operation = OperationConstants.NEW;
            if (RowId > 0)
                Operation = OperationConstants.EDIT;
            if (!this.HasPermission(RefId, Operation, CurrentLoc))
                return JsonConvert.SerializeObject(new InsertDataFromWebformResponse { RowAffected = -2, RowId = -2 });
                //throw new FormException("Access Denied");
            WebformData Values = JsonConvert.DeserializeObject<WebformData>(ValObj);
            //int _CurrentLoc = this.LoggedInUser.Preference.DefaultLocation;
            //if (!this.LoggedInUser.LocationIds.Contains(CurrentLoc))
            //{
            //    if (this.LoggedInUser.LocationIds.Contains(-1))
            //    {
            //        List<EbLocation> t = JsonConvert.DeserializeObject<List<EbLocation>>(ViewBag.Locations);
            //        var temp = t.FirstOrDefault<EbLocation>(e => e.LocId == CurrentLoc);
            //        if (temp != null)
            //            _CurrentLoc = CurrentLoc;
            //    }
            //}
            //else
            //    _CurrentLoc = CurrentLoc;
            InsertDataFromWebformResponse Resp = ServiceClient.Post<InsertDataFromWebformResponse>(
                new InsertDataFromWebformRequest
                {
                    RefId = RefId,
                    FormData = Values,
                    RowId = RowId,
                    CurrentLoc = CurrentLoc,
                    UserObj = this.LoggedInUser,
                    SolutionObj = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", ViewBag.cid))
                });
            return JsonConvert.SerializeObject(Resp);
            //return 0;
        }

        public int DeleteWebformData(string RefId, int RowId, int CurrentLoc)
        {
            if (!this.HasPermission(RefId, OperationConstants.DELETE, CurrentLoc))
                return -2; //throw new FormException("Access Denied");
            DeleteDataFromWebformResponse Resp = ServiceClient.Post<DeleteDataFromWebformResponse>(new DeleteDataFromWebformRequest { RefId = RefId, RowId = RowId, UserObj = this.LoggedInUser });
            return Resp.RowAffected;
        }

        public int CancelWebformData(string RefId, int RowId, int CurrentLoc)
        {
            if (!this.HasPermission(RefId, OperationConstants.CANCEL, CurrentLoc))
                return -2; //throw new FormException("Access Denied");
            CancelDataFromWebformResponse Resp = ServiceClient.Post<CancelDataFromWebformResponse>(new CancelDataFromWebformRequest { RefId = RefId, RowId = RowId, UserObj = this.LoggedInUser });
            return Resp.RowAffected;
        }

        public string GetAuditTrail(string refid, int rowid, int currentloc = -1)
        {
            //throw new FormException("Exception: AuditTrail not implemented");
            try
            {
                if (this.HasPermission(refid, OperationConstants.VIEW, currentloc) || this.HasPermission(refid, OperationConstants.NEW, currentloc) || this.HasPermission(refid, OperationConstants.EDIT, currentloc))
                {
                    GetAuditTrailResponse Resp = ServiceClient.Post<GetAuditTrailResponse>(new GetAuditTrailRequest { FormId = refid, RowId = rowid, UserObj = this.LoggedInUser });
                    return Resp.Json;
                }
                throw new FormException("GetAuditTrail Access Denied for rowid " + rowid + " , current location " + currentloc);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in GetAuditTrail. Message: " + ex.Message);
                return string.Empty;
            }
        }

        private bool HasPermission(string RefId, string ForWhat, int LocId)
        {
            if (ViewBag.wc != RoutingConstants.UC)
                return false;
            if (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) ||
                this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString()) ||
                this.LoggedInUser.Roles.Contains(SystemRoles.SolutionPM.ToString()))
                return true;
            
            EbOperation Op = EbWebForm.Operations.Get(ForWhat);
            if (!Op.IsAvailableInWeb)
                return false;

            try
            {
                string Ps = string.Concat(RefId.Split("-")[2].PadLeft(2, '0'), '-', RefId.Split("-")[3].PadLeft(5, '0'), '-', Op.IntCode.ToString().PadLeft(2, '0'));
                string t = this.LoggedInUser.Permissions.FirstOrDefault(p => p.Substring(p.IndexOf("-") + 1).Equals(Ps + ":" + LocId) ||
                            (p.Substring(p.IndexOf("-") + 1, 11).Equals(Ps) && p.Substring(p.LastIndexOf(":") + 1).Equals("-1")));
                if (!t.IsNullOrEmpty())
                    return true;
            }
            catch(Exception e)
            {
                Console.WriteLine("Exception when checking user permission: " + e.Message);
            }

            return false;
        }

        public bool DoUniqueCheck(string TableName, string Field, string Value, string type)
        {
            DoUniqueCheckResponse Resp = ServiceClient.Post<DoUniqueCheckResponse>(new DoUniqueCheckRequest { TableName = TableName, Field = Field, Value = Value, TypeS = type });
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

        public string getDesignHtml(string refId)
        {
            GetDesignHtmlResponse resp = ServiceClient.Post<GetDesignHtmlResponse>(new GetDesignHtmlRequest { RefId = refId });
            return resp.Html;
        }

        //public string AuditTrail(string refid, int rowid)
        //{
        //    //sourc == dest == type == dst id == dst verid== src id == src verid
        //    //ebdbllz23nkqd620180220120030-ebdbllz23nkqd620180220120030-0-2257-2976-2257-2976
        //    try
        //    {
        //        string[] refidparts = refid.Split("-");
        //        if (refidparts[1].Equals(ViewBag.cid))
        //        {
        //            if (this.LoggedInUser.EbObjectIds.Contains(refidparts[3].PadLeft(5, '0')) || this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
        //            {
        //                GetAuditTrailResponse Resp = ServiceClient.Post<GetAuditTrailResponse>(new GetAuditTrailRequest { FormId = refid, RowId = rowid });
        //                //----------------------This code should be changed

        //                EbObjectParticularVersionResponse verResp = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
        //                EbWebForm WebForm = EbSerializers.Json_Deserialize<EbWebForm>(verResp.Data[0].Json);
        //                if (WebForm != null)
        //                {
        //                    string[] Keys = EbControlContainer.GetKeys(WebForm);
        //                    Dictionary<string, string> KeyValue = ServiceClient.Get<GetDictionaryValueResponse>(new GetDictionaryValueRequest { Keys = Keys, Locale = this.LoggedInUser.Preference.Locale }).Dict;
        //                    EbWebForm WebForm_L = EbControlContainer.Localize<EbWebForm>(WebForm, KeyValue);

        //                    Dictionary<string, string> MLPair = GetMLPair(WebForm_L);

        //                    foreach (KeyValuePair<int, FormTransaction> item in Resp.Logs)
        //                    {
        //                        foreach (FormTransactionLine initem in item.Value.Details)
        //                        {
        //                            if (MLPair.ContainsKey(initem.FieldName))
        //                                initem.FieldName = MLPair[initem.FieldName];
        //                        }
        //                    }
        //                }

        //                //--------------------------------
        //                return JsonConvert.SerializeObject(Resp.Logs);
        //            }
        //        }
        //        return string.Empty;
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine("Exception in GetAuditTrail. Message: " + ex.Message);
        //        return string.Empty;
        //    }
        //}

        //private Dictionary<string, string> GetMLPair(EbWebForm WebForm_L)
        //{
        //    Dictionary<string, string> MLPair = new Dictionary<string, string>();
        //    EbControl[] controls = (WebForm_L as EbControlContainer).Controls.FlattenAllEbControls();
        //    foreach (EbControl control in controls)
        //    {
        //        PropertyInfo[] props = control.GetType().GetProperties();
        //        foreach (PropertyInfo prop in props)
        //        {
        //            if (prop.IsDefined(typeof(PropertyEditor)) && prop.GetCustomAttribute<PropertyEditor>().PropertyEditorType == (int)PropertyEditorType.MultiLanguageKeySelector)
        //            {
        //                if (prop.Name == "Label")
        //                    MLPair.Add(control.Name, control.GetType().GetProperty(prop.Name).GetValue(control, null) as String);
        //            }
        //        }
        //    }
        //    return MLPair;
        //}

        public string GetFormControlsFlat( string refId) {
            string SCtrls = string.Empty;
            SCtrls = EbSerializers.Json_Serialize(this.ServiceClient.Post<GetCtrlsFlatResponse>(new GetCtrlsFlatRequest() { RefId = refId }).Controls);
            return SCtrls;
        }

    }
}