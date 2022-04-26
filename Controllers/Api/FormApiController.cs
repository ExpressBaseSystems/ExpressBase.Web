using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web.Filters;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Net;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;

namespace ExpressBase.Web.Controllers
{
    [Route("api/form")]
    public class FormApiController : EbBaseIntApiController
    {
        public FormApiController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [HttpPost("submit")]
        [EbApiAuthGaurd]
        public ActionResult<SubmitFormDataApiResponse> WebFormSubmitCommonApi([FromForm] Dictionary<string, string> form)
        {
            if (!Authenticated) return Unauthorized();

            SubmitFormDataApiResponse response;
            try
            {
                int VerId = form.ContainsKey("form_ver_id") ? Convert.ToInt32(form["form_ver_id"]) : 0;
                string formData = form.ContainsKey("form_data") ? form["form_data"] : null;

                if (VerId == 0)
                    return new SubmitFormDataApiResponse() { Message = "Required parameter: form_ver_id", Status = (int)HttpStatusCode.BadRequest };
                if (string.IsNullOrWhiteSpace(formData))
                    return new SubmitFormDataApiResponse() { Message = "Required parameter: form_data", Status = (int)HttpStatusCode.BadRequest };

                SubmitFormDataApiRequest request = new SubmitFormDataApiRequest
                {
                    VerId = VerId,
                    FormData = formData,
                    DataId = form.ContainsKey("data_id") ? Convert.ToInt32(form["data_id"]) : 0,
                    CurrentLoc = form.ContainsKey("loc_id") ? Convert.ToInt32(form["loc_id"]) : 0
                };

                response = ServiceClient.Post(request);
            }
            catch (Exception ex)
            {
                Console.WriteLine("EXCEPTION AT webform_save API" + ex.Message);
                Console.WriteLine(ex.StackTrace);

                return new SubmitFormDataApiResponse()
                {
                    Message = ex.Message,
                    Status = (int)HttpStatusCode.InternalServerError
                };
            }
            return response;
        }

        [HttpPost("send_otp")]
        [EbApiAuthGaurd]
        public ActionResult<SendOtpApiResponse> SendVerificationOtp([FromForm] Dictionary<string, string> form)
        {
            if (!Authenticated) return Unauthorized();
            try
            {
                int VerId = form.ContainsKey("form_ver_id") ? Convert.ToInt32(form["form_ver_id"]) : 0;
                string ctrlName = form.ContainsKey("control_name") ? form["control_name"] : null;
                string mob = form.ContainsKey("mobile") ? form["mobile"] : null;
                string ema = form.ContainsKey("email") ? form["email"] : null;

                if (VerId == 0)
                    return new SendOtpApiResponse() { Message = "Required parameter: form_ver_id", Status = (int)HttpStatusCode.BadRequest };
                if (string.IsNullOrWhiteSpace(ctrlName))
                    return new SendOtpApiResponse() { Message = "Required parameter: control_name", Status = (int)HttpStatusCode.BadRequest };

                GetRefIdByVerIdResponse Resp = ServiceClient.Post<GetRefIdByVerIdResponse>(new GetRefIdByVerIdRequest { ObjVerId = VerId });
                if (Resp.RefId == "__not__found__")
                    return new SendOtpApiResponse() { Status = (int)HttpStatusCode.BadRequest, Message = "Invalid form_ver_id" };
                if (!EbFormHelper.HasPermission(this.LoggedInUser, Resp.RefId, OperationConstants.NEW, 0, true, RoutingConstants.UC))
                    return new SendOtpApiResponse() { Status = (int)HttpStatusCode.Forbidden, Message = "Access denied" };
                if (string.IsNullOrWhiteSpace(mob) && string.IsNullOrWhiteSpace(ema))
                    return new SendOtpApiResponse() { Status = (int)HttpStatusCode.BadRequest, Message = "Invalid mobile/email" };

                Authenticate2FAResponse r = ServiceClient.Post(new SendVerificationCodeRequest
                {
                    Mobile = mob,
                    Email = ema,
                    Key = Resp.RefId + "-" + ctrlName + "-" + this.LoggedInUser.UserId
                });
                SendOtpApiResponse resp = new SendOtpApiResponse()
                {
                    MobileOtpSent = r.MobileVerifCode.AuthStatus,
                    EmailOtpSent = r.EmailVerifCode.AuthStatus,
                    Status = (int)HttpStatusCode.OK,
                    Message = r.MobileVerifCode.Message + "; " + r.EmailVerifCode.Message
                };

                if (!resp.MobileOtpSent && !resp.EmailOtpSent)
                {
                    resp.Status = (int)HttpStatusCode.InternalServerError;
                    resp.Message = r.Message;
                }
                return resp;
            }
            catch (Exception ex)
            {
                return new SendOtpApiResponse() { Status = (int)HttpStatusCode.InternalServerError, Message = ex.Message };
            }
        }

        [HttpPost("verify_otp")]
        [EbApiAuthGaurd]
        public ActionResult<VerifyOtpApiResponse> VerifyVerificationOtp([FromForm] Dictionary<string, string> form)
        {
            if (!Authenticated) return Unauthorized();
            try
            {
                int VerId = form.ContainsKey("form_ver_id") ? Convert.ToInt32(form["form_ver_id"]) : 0;
                string ctrlName = form.ContainsKey("control_name") ? form["control_name"] : null;
                string mob = form.ContainsKey("mobile") ? form["mobile"] : null;
                string ema = form.ContainsKey("email") ? form["email"] : null;
                string otp = form.ContainsKey("otp") ? form["otp"] : null;

                if (VerId == 0)
                    return new VerifyOtpApiResponse() { Message = "Required parameter: form_ver_id", Status = (int)HttpStatusCode.BadRequest };
                if (string.IsNullOrWhiteSpace(ctrlName))
                    return new VerifyOtpApiResponse() { Message = "Required parameter: control_name", Status = (int)HttpStatusCode.BadRequest };
                if (string.IsNullOrWhiteSpace(mob) && string.IsNullOrWhiteSpace(ema))
                    return new VerifyOtpApiResponse() { Message = "Required parameter: email or mobile", Status = (int)HttpStatusCode.BadRequest };
                if (string.IsNullOrWhiteSpace(otp))
                    return new VerifyOtpApiResponse() { Message = "Required parameter: otp", Status = (int)HttpStatusCode.BadRequest };

                GetRefIdByVerIdResponse Resp = ServiceClient.Post<GetRefIdByVerIdResponse>(new GetRefIdByVerIdRequest { ObjVerId = VerId });
                if (Resp.RefId == "__not__found__")
                    return new VerifyOtpApiResponse() { Status = (int)HttpStatusCode.BadRequest, Message = "Invalid form_ver_id" };
                if (!EbFormHelper.HasPermission(this.LoggedInUser, Resp.RefId, OperationConstants.NEW, 0, true, RoutingConstants.UC))
                    return new VerifyOtpApiResponse() { Status = (int)HttpStatusCode.Forbidden, Message = "Access denied" };

                Authenticate2FAResponse r = ServiceClient.Post(new VerifyVerificationCodeRequest
                {
                    Mobile = mob,
                    Email = ema,
                    Otp = otp,
                    Key = Resp.RefId + "-" + ctrlName + "-" + this.LoggedInUser.UserId
                });

                VerifyOtpApiResponse resp = new VerifyOtpApiResponse()
                {
                    MobileOtpMatched = r.MobileVerifCode.AuthStatus,
                    EmailOtpMatched = r.EmailVerifCode.AuthStatus,
                    Status = r.ErrorMessage == null ? (int)HttpStatusCode.OK : (int)HttpStatusCode.InternalServerError,
                    Message = r.ErrorMessage ?? r.Message
                };

                return resp;
            }
            catch (Exception ex)
            {
                return new VerifyOtpApiResponse() { Status = (int)HttpStatusCode.InternalServerError, Message = ex.Message };
            }
        }
    }
}
