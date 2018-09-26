using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Common.ServiceStack.Auth;
using ExpressBase.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;

namespace ExpressBase.Web.BaseControllers
{
    public class EbBaseController : Controller
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected EbMqClient MqClient { get; set; }

        protected RedisClient Redis { get; set; }

        protected EbStaticFileClient FileClient { get; set; }

        public CustomUserSession Session { get; set; }

        protected User LoggedInUser { get; set; }

		public IHttpContextAccessor httpContextAccessor { get; set; }

		public EbBaseController(IServiceClient _ssclient, IRedisClient _redis, IHttpContextAccessor _cxtacc)
		{
			this.ServiceClient = _ssclient as JsonServiceClient;
			this.Redis = _redis as RedisClient;
			this.httpContextAccessor = _cxtacc as HttpContextAccessor;
		}

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

        public bool IsTokensValid(string sRToken, string sBToken, string subdomain)
        {
            bool isvalid = false;
            if (VerifySignature(sRToken) && VerifySignature(sBToken))
            {
                var rToken = new JwtSecurityToken(sRToken);
                var bToken = new JwtSecurityToken(sBToken);

                string rSub = rToken.Payload[TokenConstants.SUB].ToString();
                string bSub = bToken.Payload[TokenConstants.SUB].ToString();

                DateTime startDate = new DateTime(1970, 1, 1);
                DateTime exp_time = startDate.AddSeconds(Convert.ToInt64(rToken.Payload[TokenConstants.EXP]));

                if (exp_time > DateTime.Now && rSub == bSub) // Expiry of Refresh Token and matching Bearer & Refresh
                {
                    string[] subParts = rSub.Split(CharConstants.COLON);

                    if (rSub.EndsWith(TokenConstants.TC))
                        isvalid = true;
                    else if (subdomain.EndsWith(RoutingConstants.DASHDEV))
                    {
                        if (subParts[0] == subdomain.Replace(RoutingConstants.DASHDEV, string.Empty) && rSub.EndsWith(TokenConstants.DC))
                            isvalid = true;
                    }
                    else if (rSub.EndsWith(TokenConstants.UC) || rSub.EndsWith(TokenConstants.BC))
                    {
                        isvalid = true;
                    }
                }
            }
            return isvalid;
        }


        public bool VerifySignature(string token)
        {
            string PublicKey = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_JWT_PUBLIC_KEY_XML);
            int pos1 = PublicKey.IndexOf("<Modulus>");
            int pos2 = PublicKey.IndexOf("</Modulus>");
            int pos3 = PublicKey.IndexOf("<Exponent>");
            int pos4 = PublicKey.IndexOf("</Exponent>");
            string modkeypub = PublicKey.Substring(pos1 + 9, pos2 - pos1 - 9);
            string expkeypub = PublicKey.Substring(pos3 + 10, pos4 - pos3 - 10);

            try
            {
                string[] tokenParts = token.Split('.');
                RSACryptoServiceProvider rsa = new RSACryptoServiceProvider();
                rsa.ImportParameters(
                  new RSAParameters()
                  {
                      Modulus = FromBase64Url(modkeypub),
                      Exponent = FromBase64Url(expkeypub)
                  });

                SHA256 sha256 = SHA256.Create();
                byte[] hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(tokenParts[0] + '.' + tokenParts[1]));

                RSAPKCS1SignatureDeformatter rsaDeformatter = new RSAPKCS1SignatureDeformatter(rsa);
                rsaDeformatter.SetHashAlgorithm("SHA256");
                if (rsaDeformatter.VerifySignature(hash, FromBase64Url(tokenParts[2])))
                {
                    Console.WriteLine("Signature is verified");
                    return true;
                }
            }
            catch (Exception e) { Console.WriteLine("Exception from VerifySignature:" + e.ToString()); }
            return false;
        }

        public byte[] FromBase64Url(string base64Url)
        {
            string padded = base64Url.Length % 4 == 0
                ? base64Url : base64Url + "====".Substring(base64Url.Length % 4);
            string base64 = padded.Replace("_", "/")
                                  .Replace("-", "+");
            return Convert.FromBase64String(base64);
        }

    }
}