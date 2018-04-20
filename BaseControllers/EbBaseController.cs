using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Common.ServiceStack.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.IdentityModel.Tokens.Jwt;

namespace ExpressBase.Web.BaseControllers
{
    public class EbBaseController : Controller
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected EbMqClient MqClient { get; set; }

        protected RedisClient Redis { get; set; }

        protected EbStaticFileClient FileClient { get; set; }

        public CustomUserSession Session { get; set; }

        public EbBaseController(IServiceClient _ssclient)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
        }

        public EbBaseController(IEbStaticFileClient _sfc)
        {
            this.FileClient = _sfc as EbStaticFileClient;
        }

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public EbBaseController(IServiceClient _ssclient, IEbMqClient _mqc)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.MqClient = _mqc as EbMqClient;
        }

        public EbBaseController(IServiceClient _ssclient, IEbStaticFileClient _sfc)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.FileClient = _sfc as EbStaticFileClient;
        }

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
            this.FileClient = _sfc as EbStaticFileClient;
        }

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
            this.MqClient = _mqc as EbMqClient;
        }

        public EbBaseController(IServiceClient _ssclient, IEbMqClient _mqc, IEbStaticFileClient _sfc)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.MqClient = _mqc as EbMqClient;
            this.FileClient = _sfc as EbStaticFileClient;
        }

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc, IEbStaticFileClient _sfc)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
            this.MqClient = _mqc as EbMqClient;
            this.FileClient = _sfc as EbStaticFileClient;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            ViewBag.Env = Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT);
            base.OnActionExecuting(context);
        }

        public bool IsTokenValid(string rtoken)
        {
            bool isvalid = false;
            var jwtToken = new JwtSecurityToken(rtoken);

            DateTime startDate = new DateTime(1970, 1, 1);
            DateTime exp_time = startDate.AddSeconds(Convert.ToInt64(jwtToken.Payload[TokenConstants.EXP]));

            if (exp_time > DateTime.Now)
            {
                isvalid = true;
            }
            return isvalid;
        }
    }
}