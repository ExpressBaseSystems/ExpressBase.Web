using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Common.ServiceStack.Auth;
using ExpressBase.Web.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using ExpressBase.Security;

namespace ExpressBase.Web.BaseControllers
{
    public class EbBaseIntApiController : EbBaseIntController
    {
        protected bool Authenticated { set; get; }

        protected bool IsValidSolution { set; get; }

        public EbBaseIntApiController(IServiceClient _ssclient) : base(_ssclient) { }

        public EbBaseIntApiController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }
        
        public EbBaseIntApiController(IServiceClient _ssclient, IRedisClient _redis, PooledRedisClientManager _pooledRedisManager) : base(_ssclient, _redis, _pooledRedisManager) { }

        public EbBaseIntApiController(IServiceClient _ssclient, IEbStaticFileClient _sfc) : base(_ssclient, _sfc) { }

        public EbBaseIntApiController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _sfc) { }

        public EbBaseIntApiController(IServiceClient _client, IRedisClient _redis, IEbStaticFileClient _sfc, IEbAuthClient _auth) : base(_client, _redis, _sfc, _auth) { }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            base.OnActionExecuting(context);

            string sBToken = context.HttpContext.Request.Headers[RoutingConstants.BEARER_TOKEN];
            string sRToken = context.HttpContext.Request.Headers[RoutingConstants.REFRESH_TOKEN];

            if (sBToken == null && sRToken == null)
            {
                sBToken = context.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
                sRToken = context.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];
            }

            string sAPIKey = context.HttpContext.Request.Headers[RoutingConstants.API_KEY];

            Controller controller = (Controller)context.Controller;

            if (this.Redis.Exists(string.Format(CoreConstants.SOLUTION_INTEGRATION_REDIS_KEY, this.IntSolutionId)) == 0)
            {
                controller.ViewBag.IsValidSol = false;
                IsValidSolution = false;
            }
            else
            {
                controller.ViewBag.IsValidSol = true;
                IsValidSolution = true;
            }

            if ((string.IsNullOrEmpty(sBToken) || string.IsNullOrEmpty(sRToken)) && string.IsNullOrEmpty(sAPIKey))
            {
                controller.ViewBag.IsValid = false;
                Authenticated = false;
                controller.ViewBag.Message = "Authentication token not present in request header";
            }
            else if (IsTokensValid(sRToken, sBToken, this.ExtSolutionId))
            {
                try
                {
                    controller.ViewBag.IsValid = true;
                    Authenticated = true;
                    controller.ViewBag.Message = "Authenticated";

                    JwtSecurityToken bToken = new JwtSecurityToken(sBToken);

                    this.LoggedInUser = this.Redis.Get<User>(bToken.Payload[TokenConstants.SUB].ToString());

                    Session = new CustomUserSession
                    {
                        Id = context.HttpContext.Request.Cookies[CacheConstants.X_SS_PID]
                    };

                    this.ServiceClient.BearerToken = sBToken;
                    this.ServiceClient.RefreshToken = sRToken;
                    this.ServiceClient.Headers.Add(CacheConstants.RTOKEN, sRToken);

                    if (this.FileClient != null)
                    {
                        this.FileClient.BearerToken = sBToken;
                        this.FileClient.RefreshToken = sRToken;
                        this.FileClient.Headers.Add(CacheConstants.RTOKEN, sRToken);
                    }
                }
                catch (ArgumentNullException ane)
                {
                    if (ane.ParamName == RoutingConstants.BEARER_TOKEN || ane.ParamName == RoutingConstants.REFRESH_TOKEN)
                    {
                        context.Result = new RedirectResult("/");
                        return;
                    }
                }
            }
            else if (IsValidApiKey(sAPIKey))
            {
                controller.ViewBag.IsValid = true;
                Authenticated = true;
                controller.ViewBag.Message = "Authenticated";
            }
            else
            {
                Console.WriteLine("B:  " + sBToken);
                Console.WriteLine("R:  " + sRToken);
                controller.ViewBag.IsValid = false;
                Authenticated = false;
                controller.ViewBag.Message = "Authentication failed";
            }
        }

        public List<string> GetAccessIds(int lid)
        {
            List<string> ObjIds = new List<string>();
            foreach (string perm in this.LoggedInUser.Permissions)
            {
                int id = Convert.ToInt32(perm.Split(CharConstants.DASH)[2]);
                int locid = Convert.ToInt32(perm.Split(CharConstants.COLON)[1]);
                if ((lid == locid || locid == -1) && !ObjIds.Contains(id.ToString()))
                    ObjIds.Add(id.ToString());
            }
            return ObjIds;
        }

        public bool IsAuthenticated()
        {
            return Authenticated;
        }
    }
}
