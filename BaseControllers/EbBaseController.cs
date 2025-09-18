using DocumentFormat.OpenXml.Presentation;
using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Helpers;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Common.ServiceStack.Auth;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace ExpressBase.Web.BaseControllers
{
    public class EbBaseController : Controller
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected EbMqClient MqClient { get; set; }

        protected RedisClient Redis { get; set; }

        protected EbAuthClient AuthClient { get; set; }

        protected EbStaticFileClient FileClient { get; set; }

        protected EbStaticFileClient2 FileClient2 { get; set; }

        public CustomUserSession Session { get; set; }

        protected EbServerEventClient ServerEventClient { get; set; }

        protected PooledRedisClientManager PooledRedisManager { get; set; }

        public string Host { get; set; }

        public string ExtSolutionId { get; set; }

        public string IntSolutionId { get; set; }

        public string WhichConsole { get; set; }

        protected User LoggedInUser { get; set; }

        protected string CurrentLanguage { get; set; }

        public IHttpContextAccessor httpContextAccessor { get; set; }

        public string RequestSourceIp
        {
            get
            {
                string val = this.HttpContext.Request.Headers["X-Forwarded-For"];
                return string.IsNullOrWhiteSpace(val) ? string.Empty : val.Split(",")[0];
            }
        }

        public string UserAgent
        {
            get
            {
                return this.HttpContext.Request.Headers["User-Agent"].Count > 0 ? this.HttpContext.Request.Headers["User-Agent"][0] : string.Empty;
            }
        }

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis, IHttpContextAccessor _cxtacc)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
            this.httpContextAccessor = _cxtacc as HttpContextAccessor;
        }

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc, IEbAuthClient _auth, EbStaticFileClient2 _sfc2)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
            this.FileClient = _sfc as EbStaticFileClient;
            this.AuthClient = _auth as EbAuthClient;
            this.FileClient2 = _sfc2;
        }

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc, IEbAuthClient _auth)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
            this.FileClient = _sfc as EbStaticFileClient;
            this.AuthClient = _auth as EbAuthClient;
        }

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis, IHttpContextAccessor _cxtacc, IEbMqClient _mqc)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
            this.httpContextAccessor = _cxtacc as HttpContextAccessor;
            this.MqClient = _mqc as EbMqClient;
        }

        public EbBaseController(IServiceClient _ssclient)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
        }

        public EbBaseController(IEbStaticFileClient _sfc)
        {
            this.FileClient = _sfc as EbStaticFileClient;
        }
        public EbBaseController(IEbStaticFileClient _sfc, IRedisClient _redis)
        {
            this.FileClient = _sfc as EbStaticFileClient;
            this.Redis = _redis as RedisClient;
        }

        public EbBaseController(IEbStaticFileClient _sfc, IRedisClient _redis, EbStaticFileClient2 _sfc2)
        {
            this.FileClient = _sfc as EbStaticFileClient;
            this.Redis = _redis as RedisClient;
            this.FileClient2 = _sfc2;
        }

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis, PooledRedisClientManager pooledRedisManager)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
            this.PooledRedisManager = pooledRedisManager;
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

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc, EbStaticFileClient2 _sfc2)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
            this.FileClient = _sfc as EbStaticFileClient;
            this.FileClient2 = _sfc2;
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

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis, IEbServerEventClient _sec)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
            this.ServerEventClient = _sec as EbServerEventClient;
        }

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis, IEbServerEventClient _sec, PooledRedisClientManager pooledRedisManager)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
            this.ServerEventClient = _sec as EbServerEventClient;
            this.PooledRedisManager = pooledRedisManager;
        }

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc, IEbStaticFileClient _sfc)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
            this.MqClient = _mqc as EbMqClient;
            this.FileClient = _sfc as EbStaticFileClient;
        }

        public EbBaseController(IServiceClient _ssclient, IRedisClient _redis, IHttpContextAccessor _cxtacc, IEbMqClient _mqc, IEbAuthClient _auth)
        {
            this.ServiceClient = _ssclient as JsonServiceClient;
            this.Redis = _redis as RedisClient;
            this.httpContextAccessor = _cxtacc as HttpContextAccessor;
            this.MqClient = _mqc as EbMqClient;
            this.AuthClient = _auth as EbAuthClient;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            Host = context.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty).Replace(RoutingConstants.LIVEHOSTADDRESS, string.Empty).Replace(RoutingConstants.STAGEHOSTADDRESS, string.Empty).Replace(RoutingConstants.LOCALHOSTADDRESS, string.Empty);

            ExtSolutionId = Host.Replace(RoutingConstants.DASHDEV, string.Empty);
            IntSolutionId = this.GetIsolutionId(ExtSolutionId);
            WhichConsole = Host.Contains(RoutingConstants.DASHDEV) ? RoutingConstants.DC : (IntSolutionId == CoreConstants.EXPRESSBASE) ? RoutingConstants.TC : RoutingConstants.UC;

            Console.WriteLine(ExtSolutionId + "\n" + IntSolutionId + "\n" + WhichConsole);
            ViewBag.Env = Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT);
            ViewBag.ReCaptchaKey = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_RECAPTCHA_KEY);
            this.CurrentLanguage = context.HttpContext.Request.Cookies["ebLang"];
            base.OnActionExecuting(context);
        }

        public bool IsTokensValid(string sRToken, string sBToken, string subdomain)
        {
            if (string.IsNullOrWhiteSpace(sRToken) || string.IsNullOrWhiteSpace(sBToken))
                return false;

            bool isvalid = false;
            try
            {
                string isid = this.GetIsolutionId(subdomain.Replace(RoutingConstants.DASHDEV, string.Empty));
                if (VerifySignature(sRToken) && VerifySignature(sBToken))
                {
                    var rToken = new JwtSecurityToken(sRToken);
                    var bToken = new JwtSecurityToken(sBToken);
                    if (bToken.Payload[TokenConstants.CID].ToString() == isid)
                    {
                        string rSub = rToken.Payload[TokenConstants.SUB].ToString();
                        string bSub = bToken.Payload[TokenConstants.SUB].ToString();
                        string _ip = bToken.Payload[TokenConstants.IP].ToString();
                        //Console.WriteLine("Reqst IP : " + this.RequestSourceIp + " - Auth IP : " + _ip);
                        if (this.RequestSourceIp == _ip || _ip == string.Empty)
                        {
                            //Console.WriteLine("IP check success");
                            DateTime startDate = new DateTime(1970, 1, 1);
                            DateTime exp_time = startDate.AddSeconds(Convert.ToInt64(rToken.Payload[TokenConstants.EXP]));

                            if (exp_time > DateTime.Now && rSub == bSub) // Expiry of Refresh Token and matching Bearer & Refresh
                            {
                                string[] subParts = rSub.Split(CharConstants.COLON);

                                if (rSub.EndsWith(TokenConstants.TC))
                                    isvalid = true;
                                else if (WhichConsole == RoutingConstants.DC)
                                {
                                    if (subParts[0] == isid && rSub.EndsWith(TokenConstants.DC))
                                        isvalid = true;
                                }
                                else if (rSub.EndsWith(TokenConstants.UC) || rSub.EndsWith(TokenConstants.BC) || rSub.EndsWith(TokenConstants.MC) || rSub.EndsWith(TokenConstants.PC))
                                {
                                    isvalid = true;
                                }
                            }
                        }
                        else
                        {
                            Console.WriteLine("IP check failed");
                        }
                    }
                    else
                    {
                        Console.WriteLine("Token mismatch");
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message + e.StackTrace);
                Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, string.Empty, new CookieOptions());
                Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, string.Empty, new CookieOptions());
            }

            return isvalid;
        }

        public bool IsValidApiKey(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return false;
            bool isValid = false;
            try
            {
                isValid = JwtHelpers.ValidateToken(token, out ClaimsPrincipal cp);
                if (isValid)
                {
                    string _cid = cp.FindFirstValue(TokenConstants.CID);
                    int _uid = Convert.ToInt32(cp.FindFirstValue(TokenConstants.UID));
                    int _id = Convert.ToInt32(cp.FindFirstValue(TokenConstants.ID));
                    string _wc = cp.FindFirstValue(TokenConstants.WC);
                    string _sub = cp.FindFirstValue(TokenConstants.SUB);
                    if (_cid == IntSolutionId && _wc == TokenConstants.AC)
                    {
                        User user = GetUserObject($"{_cid}:{_uid}:{_wc}", TokenConstants.UC, true);//using UC permission models
                        if (user != null && user.UserId == _uid && user.ApiKeyId == _id)
                        {
                            this.LoggedInUser = user;
                            WhichConsole = TokenConstants.AC;
                            isValid = true;
                        }
                    }
                }
            }
            catch (Exception e)
            {
                isValid = false;
                Console.WriteLine(e.Message + e.StackTrace);
            }
            return isValid;
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
                    //Console.WriteLine("Signature is verified");
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

        public string GetIsolutionId(string esid)
        {
            string solnId = string.Empty;

            if (esid == CoreConstants.MYACCOUNT)
                solnId = CoreConstants.EXPRESSBASE;
            else if (esid == CoreConstants.ADMIN)
                solnId = CoreConstants.ADMIN;
            else if (this.Redis != null)
            {
                if (this.PooledRedisManager != null)
                {
                    using (var redis = this.PooledRedisManager.GetReadOnlyClient())
                    {
                        solnId = redis.Get<string>(string.Format(CoreConstants.SOLUTION_ID_MAP, esid));
                    }
                }
                else
                    solnId = this.Redis.Get<string>(string.Format(CoreConstants.SOLUTION_ID_MAP, esid));
                if (solnId == null || solnId == string.Empty)
                {
                    this.ServiceClient.Post<UpdateSidMapResponse>(new UpdateSidMapRequest { ExtSolutionId = esid });
                    solnId = this.Redis.Get<string>(string.Format(CoreConstants.SOLUTION_ID_MAP, esid));
                }
            }
            return solnId;
        }

        public Eb_Solution GetSolutionObject(string cid)
        {
            Eb_Solution s_obj = null;
            try
            {
                if (this.PooledRedisManager != null)
                {
                    using (var redis = this.PooledRedisManager.GetReadOnlyClient())
                        s_obj = redis.Get<Eb_Solution>(string.Format("solution_{0}", cid));
                }
                else
                    s_obj = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", cid));

                if (s_obj == null)
                {
                    this.ServiceClient.Post(new UpdateSolutionObjectRequest() { SolnId = cid });
                    s_obj = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", cid));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message + e.StackTrace);
            }
            return s_obj;
        }

        public User GetUserObject(string userAuthId, string _wc = null, bool _isApiUser = false)
        {
            User user = null;
            try
            {
                if (userAuthId != string.Empty)
                {
                    string[] parts = userAuthId.Split(":"); // iSolutionId:UserId:WhichConsole
                    if (parts.Length == 3)
                    {
                        if (this.PooledRedisManager != null)
                        {
                            using (var redis = this.PooledRedisManager.GetReadOnlyClient())
                                user = redis.Get<User>(userAuthId);
                        }
                        else
                            user = this.Redis.Get<User>(userAuthId);
                        if (user == null)
                        {
                            this.ServiceClient.Post(new UpdateUserObjectRequest() { SolnId = parts[0], UserId = Convert.ToInt32(parts[1]), UserAuthId = userAuthId, WC = _wc ?? parts[2], IsApiUser = _isApiUser });
                            user = this.Redis.Get<User>(userAuthId);
                        }
                    }
                    else
                    { Console.WriteLine("userAuthId incorrect" + userAuthId); }
                }
                else
                { Console.WriteLine("userAuthId incorrect" + userAuthId); }
            }
            catch (Exception e) { Console.WriteLine(e.Message + e.StackTrace); }
            return user;
        }

        public EbFinancialYears GetFinancialYearsObject(Eb_Solution s_obj, User user)
        {
            if (s_obj?.SolutionSettings?.EnableFinancialYear != true)
                return null;
            EbFinancialYears fys = s_obj?.FinancialYears ?? new EbFinancialYears();
            if (WhichConsole == RoutingConstants.UC)
            {
                string s = this.LoggedInUser.Preference.GetShortDatePattern();
                string sl = this.LoggedInUser.Preference.GetLongDatePattern();
                foreach (EbFinancialYear fy in fys.List)
                {
                    fy.FyStart_s = fy.FyStart.ToString(s, CultureInfo.InvariantCulture);
                    fy.FyEnd_s = fy.FyEnd.ToString(s, CultureInfo.InvariantCulture);
                    fy.FyStart_sl = fy.FyStart.ToString("dd-MMM-yyyy", CultureInfo.InvariantCulture);
                    fy.FyEnd_sl = fy.FyEnd.ToString("dd-MMM-yyyy", CultureInfo.InvariantCulture);
                    foreach (EbFinancialPeriod fp in fy.List)
                    {
                        fp.ActStart_s = fp.ActStart.ToString(s, CultureInfo.InvariantCulture);
                        fp.ActEnd_s = fp.ActEnd.ToString(s, CultureInfo.InvariantCulture);
                        fp.ActStart_disp = fp.ActStart.ToString("MMMM yyyy", CultureInfo.InvariantCulture);
                        //fp.ActStart_sl = fp.ActStart.ToString(sl, CultureInfo.InvariantCulture);
                        //fp.ActEnd_sl = fp.ActEnd.ToString(sl, CultureInfo.InvariantCulture);

                        if (fys.Current == 0)
                        {
                            if (DateTime.UtcNow >= fp.ActStart && DateTime.UtcNow <= fp.ActEnd)
                                fys.Current = fp.Id;
                        }
                    }
                    if (fy.List.Count == 1)
                    {
                        fy.List[0].ActStart_disp = "Year " + fy.List[0].ActStart.ToString("yyyy", CultureInfo.InvariantCulture);
                    }
                    else if (fy.List.Count == 2)
                    {
                        fy.List[0].ActStart_disp = "First Half";
                        fy.List[1].ActStart_disp = "Second Half";
                    }
                    else if (fy.List.Count == 4)
                    {
                        fy.List[0].ActStart_disp = "Quarter 1";
                        fy.List[1].ActStart_disp = "Quarter 2";
                        fy.List[2].ActStart_disp = "Quarter 3";
                        fy.List[3].ActStart_disp = "Quarter 4";
                    }
                }
                fys.IsFyAdmin = user.RoleIds.Exists(e => e == (int)SystemRoles.FinancialYearAdmin || e == (int)SystemRoles.SolutionOwner);
                fys.IsFyUser = user.RoleIds.Exists(e => e == (int)SystemRoles.FinancialYearUser);
            }
            return fys;
        }
    }
}