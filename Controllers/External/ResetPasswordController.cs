using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Web.Models;
using Microsoft.AspNetCore.Http;

namespace ExpressBase.Web.Controllers.External
{
    public class ResetPasswordController : EbBaseExtController
    {
        public ResetPasswordController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [HttpGet("ResetPasswordIn")]
        public IActionResult Index()
        {
            ViewBag.cid = ViewBag.SolutionId;
            ViewBag.wc = ViewBag.WhichConsole;
            return View("ResetPage");
        }

        public EbAuthResponse Reset(PwDetails PwDetails)
        {
            EbAuthResponse resetResponse = new EbAuthResponse();
            if (PwDetails.NewPassword.Length > 7 && PwDetails.NewPassword != PwDetails.CurrentPassword)
            {
                string token = Request.Cookies[RoutingConstants.RPWToken];
                string authid = Request.Cookies[TokenConstants.USERAUTHID];
                User _u = GetUserObject(authid);
                if (_u != null)
                {
                    this.ServiceClient.BearerToken = _u.BearerToken;
                    this.ServiceClient.RefreshToken = _u.RefreshToken;
                    Authenticate2FAResponse response = this.ServiceClient.Post(new ValidateTokenRequest { Token = token, UserAuthId = authid });
                        resetResponse.ErrorMessage = response.ErrorMessage;
                    if (response.AuthStatus)
                    {
                        string[] authsplit = authid.Split(':');

                        ResetPwResponse resp = this.ServiceClient.Post(new ResetPwRequest
                        {
                            PwDetails = PwDetails,
                            SolnId = authsplit[0],
                            UserId = Convert.ToInt32(authsplit[1]),
                            Email = _u.Email
                        });
                        if (resp.Status)
                        {
                            CookieOptions options = new CookieOptions();
                            Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, _u.BearerToken, options);
                            Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, _u.RefreshToken, options);
                            Response.Cookies.Delete(RoutingConstants.RPWToken); // removing rpwtoken
                            ExtController ExtController = new ExtController(this.ServiceClient, this.Redis, null, null, null);
                            resetResponse.RedirectUrl = ExtController.RouteToDashboard(authsplit[2]);
                            resetResponse.AuthStatus = true;
                            ViewBag.UId = Convert.ToInt32(authsplit[1]);
                        }
                        else
                        {
                            resetResponse.ErrorMessage = resp.ErrorMessage;
                        }
                    }
                    else
                    {
                        resetResponse.ErrorMessage = response.ErrorMessage;
                    }
                }
            }
            else { resetResponse.ErrorMessage = "Validation error"; }
            return resetResponse;
        }
        public IActionResult ResetLink()
        {
            string authid = Request.Cookies[TokenConstants.USERAUTHID];
            User user = this.GetUserObject(authid);
            user.BearerToken = Request.Cookies[RoutingConstants.BEARER_TOKEN];
            user.RefreshToken = Request.Cookies[RoutingConstants.REFRESH_TOKEN];
            ExtController ExtController = new ExtController(this.ServiceClient, this.Redis, null, null, null);

            ExtController.RouteToResetPage(user, Response);
            return RedirectToAction("Index");
            // authresp.RedirectUrl = RoutingConstants.RESET_PASSWORD_PAGE;
        }
    }
}
