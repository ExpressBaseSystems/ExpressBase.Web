﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Structures;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class CustomPageController : EbBaseIntCommonController
    {
        public CustomPageController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [HttpGet("leadmanagement/{ac}")]
        [HttpGet("leadmanagement")]
        public IActionResult LeadManagement(string ac)
        {
            //mode=0 -> new customer
            int mode = 0;
            if (!ac.IsNullOrEmpty())
                mode = 1;
            else
                ac = "0";

            var fr = this.ServiceClient.Get<GetManageLeadResponse>(new GetManageLeadRequest { AccId = Convert.ToInt32(ac), RequestMode = mode, SolnId = ViewBag.cid });

            if (fr.RespMode == 0)
                ViewBag.AccId = "0";
            else
                ViewBag.AccId = ac;
            ViewBag.MC_Mode = fr.RespMode;
            ViewBag.CustomerData = fr.CustomerDataDict;
            ViewBag.CostCenter = fr.CostCenterDict;
            ViewBag.DocDict = fr.DoctorDict;
            ViewBag.StaffDict = fr.StaffDict;
            ViewBag.NurseDict = fr.NurseDict;
            ViewBag.CrntCityList = fr.CrntCityList;
            ViewBag.CrntCountryList = fr.CrntCountryList;
            ViewBag.CityList = fr.CityList;
            ViewBag.DistrictList = fr.DistrictList;
            ViewBag.SourceCategoryList = fr.SourceCategoryList;
            ViewBag.SubCategoryList = fr.SubCategoryList;
            ViewBag.StatusDict = fr.StatusDict;
            ViewBag.ServiceList = fr.ServiceList;
            ViewBag.CustomerCategoryDict = fr.CustomerCategoryDict;
            ViewBag.AttachImgInfo = fr.AttachImgInfo;
            ViewBag.PrpImgInfo = fr.PrpImgInfo;
            ViewBag.DisableSave = fr.DisbleSave;

            ViewBag.BillPerm = true;// permission
            if (!ViewBag.BillPerm)
                fr.BillingList.Clear();

            //ViewBag.ImageIdList = fr.ImageIdList;
            ViewBag.Permission = this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString());

            if (mode == 1)
            {
                ViewBag.FeedbackList = JsonConvert.SerializeObject(fr.FeedbackList);
                ViewBag.BillingList = JsonConvert.SerializeObject(fr.BillingList);
                ViewBag.SurgeryList = JsonConvert.SerializeObject(fr.SurgeryList);
                ViewBag.GfcPrpList = JsonConvert.SerializeObject(fr.GfcPrpList);
            }

            return View();
        }

        //[HttpGet("FilesOf/{ac}")]
        //public string GetImgInfo(int ac)////
        //{
        //    return JsonConvert.SerializeObject(this.ServiceClient.Get(new GetImageInfoRequest { CustomerId = ac }).Data);
        //}

        public string SaveCustomer(int Mode, string CustomerInfo, string ImgRefId)
        {
            SaveCustomerResponse res = this.ServiceClient.Post<SaveCustomerResponse>(new SaveCustomerRequest { CustomerData = CustomerInfo, RequestMode = Mode, ImgRefId = ImgRefId, UserName = this.LoggedInUser.FullName });
            return res.Status;
        }

        public int SaveFollowup(string FollowupInfo)
        {
            SaveCustomerFollowupResponse res = this.ServiceClient.Post<SaveCustomerFollowupResponse>(
                new SaveCustomerFollowupRequest
                {
                    Data = FollowupInfo,
                    UserName = this.LoggedInUser.FullName,
                    Permission = this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString())
                });
            return res.Status;
        }
        public int SaveBilling(string BillingInfo)
        {
            SaveCustomerPaymentResponse res = this.ServiceClient.Post<SaveCustomerPaymentResponse>(new SaveCustomerPaymentRequest { Data = BillingInfo, UserName = this.LoggedInUser.FullName });
            return res.Status;
        }
        public int SaveSurgeryDtls(string SurgeryInfo)
        {
            //if (!this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
            //	return 0;
            SaveSurgeryDetailsResponse res = this.ServiceClient.Post<SaveSurgeryDetailsResponse>(
                new SaveSurgeryDetailsRequest
                {
                    Data = SurgeryInfo,
                    UserName = this.LoggedInUser.FullName,
                    Permission = this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString())
                });
            return res.Status;
        }
        public int SaveGfcPrpDtls(string GfcPrpInfo)
        {
            SaveGfcPrpDetailsResponse res = this.ServiceClient.Post<SaveGfcPrpDetailsResponse>(
                new SaveGfcPrpDetailsRequest
                {
                    Data = GfcPrpInfo,
                    UserName = this.LoggedInUser.FullName,
                    Permission = this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString())
                });
            return res.Status;
        }

        public bool UniqueCheck(string Key, string Value)
        {
            LmUniqueCheckResponse res = this.ServiceClient.Post<LmUniqueCheckResponse>(new LmUniqueCheckRequest { Key = Key, Value = Value });
            return res.Status;
        }

        //public int DeleteImages(int CustId, string ImgRefIds)
        //{
        //    LmDeleteImageResponse res = this.ServiceClient.Post<LmDeleteImageResponse>(new LmDeleteImageRequest { CustId = CustId, ImgRefIds = ImgRefIds });
        //    return res.RowsAffected;
        //}

        public bool DeleteCustomer(int CustId)
        {
            LmDeleteCustomerResponse res = null;
            if (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
            {
                res = this.ServiceClient.Post<LmDeleteCustomerResponse>(new LmDeleteCustomerRequest { CustId = CustId });
                return res.Status;
            }
            return false;
        }


    }
}
