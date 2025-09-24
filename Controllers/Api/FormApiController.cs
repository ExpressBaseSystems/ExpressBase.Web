using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects.ServiceStack_Artifacts.EbButtonPublicFormAttachServiceStackArtifacts;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web.Filters;
using ExpressBase.Web.Helpers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
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
        public IActionResult WebFormSubmitCommonApi([FromBody] JObject form)
        {
            if (!Authenticated) return Unauthorized();

            SubmitFormDataApiResponse response;
            try
            {
                int VerId = form.ContainsKey("form_ver_id") ? Convert.ToInt32(form["form_ver_id"]) : 0;
                string formData = form.ContainsKey("form_data") ? form["form_data"]?.ToString() : null;

                if (VerId == 0)
                    return StatusCode((int)HttpStatusCode.BadRequest, new SubmitFormDataApiResponse() { Message = "Required parameter: form_ver_id", Status = (int)HttpStatusCode.BadRequest });
                if (string.IsNullOrWhiteSpace(formData))
                    return StatusCode((int)HttpStatusCode.BadRequest, new SubmitFormDataApiResponse() { Message = "Required parameter: form_data", Status = (int)HttpStatusCode.BadRequest });

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

                return StatusCode((int)HttpStatusCode.InternalServerError, new SubmitFormDataApiResponse()
                {
                    Message = ex.Message,
                    Status = (int)HttpStatusCode.InternalServerError
                });
            }
            return StatusCode(response.Status, response);
        }

        [HttpPost("send_otp")]
        [EbApiAuthGaurd]
        public IActionResult SendVerificationOtp([FromBody] JObject form)
        {
            if (!Authenticated) return Unauthorized();
            try
            {
                int VerId = form.ContainsKey("form_ver_id") ? Convert.ToInt32(form["form_ver_id"]) : 0;
                string ctrlName = form.ContainsKey("control_name") ? form["control_name"]?.ToString() : null;
                string mob = form.ContainsKey("mobile") ? form["mobile"]?.ToString() : null;
                string ema = form.ContainsKey("email") ? form["email"]?.ToString() : null;

                if (VerId == 0)
                    return GetSendOtpApiResponse((int)HttpStatusCode.BadRequest, "Required parameter: form_ver_id");
                if (string.IsNullOrWhiteSpace(ctrlName))
                    return GetSendOtpApiResponse((int)HttpStatusCode.BadRequest, "Required parameter: control_name");

                GetRefIdByVerIdResponse Resp = ServiceClient.Post<GetRefIdByVerIdResponse>(new GetRefIdByVerIdRequest { ObjVerId = VerId });
                if (Resp.RefId == "__not__found__")
                    return GetSendOtpApiResponse((int)HttpStatusCode.BadRequest, "Invalid form_ver_id");
                if (!EbFormHelper.HasPermission(this.LoggedInUser, Resp.RefId, OperationConstants.NEW, 0, true, RoutingConstants.UC))
                    return GetSendOtpApiResponse((int)HttpStatusCode.Forbidden, "Access denied");
                if (string.IsNullOrWhiteSpace(mob) && string.IsNullOrWhiteSpace(ema))
                    return GetSendOtpApiResponse((int)HttpStatusCode.BadRequest, "Invalid mobile/email");

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
                return StatusCode(resp.Status, resp);
            }
            catch (Exception ex)
            {
                return GetSendOtpApiResponse((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        private IActionResult GetSendOtpApiResponse(int status, string msg)
        {
            return StatusCode(status, new SendOtpApiResponse() { Status = status, Message = msg });
        }

        private IActionResult GetVerifyOtpApiResponse(int status, string msg)
        {
            return StatusCode(status, new VerifyOtpApiResponse() { Status = status, Message = msg });
        }

        [HttpPost("verify_otp")]
        [EbApiAuthGaurd]
        public IActionResult VerifyVerificationOtp([FromBody] JObject form)
        {
            if (!Authenticated) return Unauthorized();
            try
            {
                int VerId = form.ContainsKey("form_ver_id") ? Convert.ToInt32(form["form_ver_id"]) : 0;
                string ctrlName = form.ContainsKey("control_name") ? form["control_name"]?.ToString() : null;
                string mob = form.ContainsKey("mobile") ? form["mobile"]?.ToString() : null;
                string ema = form.ContainsKey("email") ? form["email"]?.ToString() : null;
                string otp = form.ContainsKey("otp") ? form["otp"]?.ToString() : null;

                if (VerId == 0)
                    return GetVerifyOtpApiResponse((int)HttpStatusCode.BadRequest, "Required parameter: form_ver_id");
                if (string.IsNullOrWhiteSpace(ctrlName))
                    return GetVerifyOtpApiResponse((int)HttpStatusCode.BadRequest, "Required parameter: control_name");
                if (string.IsNullOrWhiteSpace(mob) && string.IsNullOrWhiteSpace(ema))
                    return GetVerifyOtpApiResponse((int)HttpStatusCode.BadRequest, "Required parameter: email or mobile");
                if (string.IsNullOrWhiteSpace(otp))
                    return GetVerifyOtpApiResponse((int)HttpStatusCode.BadRequest, "Required parameter: otp");

                GetRefIdByVerIdResponse Resp = ServiceClient.Post<GetRefIdByVerIdResponse>(new GetRefIdByVerIdRequest { ObjVerId = VerId });
                if (Resp.RefId == "__not__found__")
                    return GetVerifyOtpApiResponse((int)HttpStatusCode.BadRequest, "Invalid form_ver_id");
                if (!EbFormHelper.HasPermission(this.LoggedInUser, Resp.RefId, OperationConstants.NEW, 0, true, RoutingConstants.UC))
                    return GetVerifyOtpApiResponse((int)HttpStatusCode.Forbidden, "Access denied");

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

                return StatusCode(resp.Status, resp);
            }
            catch (Exception ex)
            {
                return GetVerifyOtpApiResponse((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }



        [HttpGet("control/button_public_form_attach/public_form_url")]
        //[EbApiAuthGaurd]
        public IActionResult ControlButtonPublicFormAttchBuildUrl(
            [FromQuery] string sourceFormRefId,
            [FromQuery] string publicFormRefId,
            [FromQuery] int formDataId
        )
        {

            DebugHelper.Log("-----------------");
            DebugHelper.Log(HostUrlHelper.GePublictHostUrl(this.ExtSolutionId));
            DebugHelper.Log("-----------------");
            /* if (!Authenticated)
             {
                 var unauthorizedResp = new
                 {
                     Status = (int)HttpStatusCode.Unauthorized,
                     Message = "Unauthorized",
                     ErrorCode = 1401
                 };

                 return StatusCode(unauthorizedResp.Status, unauthorizedResp);
             }*/
            try
            {

                if (string.IsNullOrWhiteSpace(publicFormRefId))
                {
         
                    throw new ArgumentNullException(nameof(publicFormRefId), "publicFormRefId is required");
                }
                
                if (string.IsNullOrWhiteSpace(sourceFormRefId))
                {
         
                    throw new ArgumentNullException(nameof(sourceFormRefId), "sourceFormRefId is required");
                }

                if (formDataId <= 0)
                {

                    throw new ArgumentNullException(nameof(publicFormRefId), "formDataId is required");
                }

                ResponseEbButtonPublicFormAttachServiceStackArtifact Response = 
                    ServiceClient.Get<ResponseEbButtonPublicFormAttachServiceStackArtifact>(
                        new RequestEbButtonPublicFormAttachServiceStackArtifact 
                        {
                            PublicFormRefId = publicFormRefId,
                            SourceFormRefId = sourceFormRefId,
                            SourceFormDataId = formDataId
                        }
                   );

                string host = HostUrlHelper.GePublictHostUrl(this.ExtSolutionId);
                string formRoutePrefix = "WebForm/Index";
                string url = host +
                            "/" +
                            formRoutePrefix +
                            "?" +
                            "r=" +
                            publicFormRefId;


                if (!string.IsNullOrEmpty(Response.QueryStringEncrypted))
                {
                    url +=  "&" + "_ebPrefillData=" + Response.QueryStringEncrypted;                    
                }

                return StatusCode(
                            (int)HttpStatusCode.OK,
                             new
                             {
                                 Status = (int)HttpStatusCode.OK,
                                 Message = Response.Message,
                                 Url = url
                             }
                        );


            }
            catch (Exception ex)
            {
                var errorResp = new
                {
                    Status = (int)HttpStatusCode.InternalServerError,
                    Message = "An unexpected error occurred.",
                    Details = ex.Message
                };

                return StatusCode(errorResp.Status, errorResp);
            }
        }
    }
}
