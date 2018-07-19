using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.Serialization.Json;
using System.Runtime.Serialization;
using System.Globalization;
using RestSharp;
using System.Net;
using RestSharp.Authenticators;
using Newtonsoft.Json;
using System.Collections.ObjectModel;
using Flurl.Http;
using ExpressBase.Web.BaseControllers;
using ServiceStack;
using ServiceStack.Redis;
using Microsoft.AspNetCore.Mvc;

namespace ExpressBase.Web.Controllers
{
    public enum HttpMethods { GET, POST, PUT, DELETE, HEAD, CONNECT, OPTIONS, PATCH };
    public enum PlanType { FIXED, INFINITE };
    public enum PlanState { CREATED, ACTIVE, INACTIVE };
    public enum TermType { MONTHLY, WEEKLY, YEARLY };
    public enum PaymentMethod { bank, paypal };
    public enum CardState { expired, ok };

    public class PayPalController : EbBaseExtController
    {
        private const string OAuthTokenPath = "/v1/oauth2/token";
        public static string Response;
        public static int StatusCode;
        public static string P_PayResponse;
        public static int P_PayResCode;

        public static System.IO.Stream GenerateStreamFromString(string s)
        {
            var stream = new System.IO.MemoryStream();
            var writer = new System.IO.StreamWriter(stream);
            writer.Write(s);
            writer.Flush();
            stream.Position = 0;
            return stream;
        }

        public static System.IO.Stream GenerateStreamFromObject(object s)
        {
            var stream = new System.IO.MemoryStream();
            var writer = new System.IO.StreamWriter(stream);
            writer.Write(s);
            writer.Flush();
            stream.Position = 0;
            return stream;
        }

        public static string GetStringFromStream(System.IO.Stream stream)
        {
            System.IO.StreamReader reader = new System.IO.StreamReader(stream);
            string str = reader.ReadToEnd();
            return str;
        }

        private static async Task<string> GetResponseContents(HttpResponseMessage Response)
        {
            return await Response.Content.ReadAsStringAsync();
        }

        private static void PayPalCallback(IRestResponse response, RestRequestAsyncHandle handle)
        {
            if (response.StatusCode == HttpStatusCode.OK)
            {
                Response = response.Content;
                StatusCode = (int)response.StatusCode;
            }
            else
            {
                StatusCode = (int)response.StatusCode;
                Console.WriteLine("\nRequest Failed");
            }
        }

        private static async Task<HttpResponseMessage> Send(HttpMethod _method, Flurl.Http.FlurlRequest flurlRequest, string JsonBody)
        {
            return await flurlRequest.SendAsync(_method, new Flurl.Http.Content.CapturedJsonContent(JsonBody));
        }

        public PayPalController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis)
        {
        }

        [HttpGet]
        public IActionResult Index()
        {
            //SETTING UP THE BASIC STUFF
            string UserID = "AdNdziGTYMDZmy11d-ipJVDpptmA072bDxjVS6NwKJsdkGFxOhlKkGlUtmorIRiSpd4SXAFZuSQlReD-";
            string UserSecret = "ECceEM1qcJtc4QRute7_4pk80MYTbg78kqf6PhralI4PnU2UfEc7gkyBUygpzBHwi7XIoYr94s6drdD_";
            string UriString = "https://api.sandbox.paypal.com/";
            var client = new RestClient(new Uri(UriString));
            System.Net.CookieContainer CookieJar = new System.Net.CookieContainer();
            client.Authenticator = new HttpBasicAuthenticator(UserID, UserSecret);
            client.CookieContainer = CookieJar;


            //SENDING OAUTH-BASED AUTHENTICATION REQUEST
            var OAuthRequest = new RestRequest("v1/oauth2/token", Method.POST);
            OAuthRequest.AddHeader("Accept", "application/json");
            OAuthRequest.AddHeader("Accept-Language", "en_US");
            OAuthRequest.AddHeader("Content-Type", "application/x-www-form-urlencoded");
            OAuthRequest.AddParameter("grant_type", "client_credentials");


            //RECEIVING AND PARSING OAUTH RESPONSE
            var res = client.ExecuteAsyncPost(OAuthRequest, PayPalCallback, "POST");
            System.Threading.Thread.Sleep(8000);

            Console.WriteLine("OAUTH REQUEST\n***************");
            Console.WriteLine("HTTP Response Status Code :: " + StatusCode.ToString());
            Console.WriteLine("Message Body :: " + Response);
            var StreamData = GenerateStreamFromString(Response);
            var serializer = new DataContractJsonSerializer(typeof(PayPalOauthObject));
            var SerialOauthResponse = serializer.ReadObject(StreamData) as PayPalOauthObject;

            Console.WriteLine("\nNONCE:: " + SerialOauthResponse.Nonce +
                "\nAccess Token:: " + SerialOauthResponse.AccessToken +
                "\nToken Type:: " + SerialOauthResponse.TokenType +
                "\nApp ID:: " + SerialOauthResponse.AppId +
                "\nExpires In:: " + SerialOauthResponse.ExpiresIn.ToString());
            Console.WriteLine();


            //CREATING BILLING PLAN
            BillingPlanRequest Plan = new BillingPlanRequest();
            Plan.Name = "Test Plan";
            Plan.Description = "Testing the Billing Plan in PayPal";
            Plan.Type = "FIXED";
            Plan.PaymentDef = new List<PaymentDefinition>();


            //PLAN DEFINITION - HARD CODED FOR NOW, NEEDS TO BE CREATED DYNAMICALLY IN PRODUCTION
            Plan.PaymentDef.Add(
            new PaymentDefinition()
            {
                Name = "Regular payment definition",
                PaymentType = "REGULAR",
                Frequency = "MONTH",
                FrequencyInterval = "2",
                Amount = new Dictionary<string, string>() { { "value", "100" }, { "currency", "USD" } },
                Cycles = "12",
                ChargeModels = new List<ChargeModel>()
                {
                    new ChargeModel()
                    {
                        ChargeType = "SHIPPING",
                        ChargeAmount = new Dictionary<string, string>() {{ "value", "10" }, {"currency", "USD" } }
                    },
                    new ChargeModel()
                    {
                        ChargeType = "TAX",
                        ChargeAmount = new Dictionary<string, string>(){{ "value", "12" }, { "currency", "USD" } }
                    },
                }
            });
            Plan.PaymentDef.Add(
            new PaymentDefinition()
            {
                Name = "Regular payment definition",
                PaymentType = "TRIAL",
                Frequency = "WEEK",
                FrequencyInterval = "5",
                Amount = new Dictionary<string, string>() { { "value", "9.19" }, { "currency", "USD" } },
                Cycles = "12",
                ChargeModels = new List<ChargeModel>()
                {
                    new ChargeModel()
                    {
                        ChargeType = "SHIPPING",
                        ChargeAmount = new Dictionary<string, string>() {{ "value", "1" }, {"currency", "USD" } }
                    },
                    new ChargeModel()
                    {
                        ChargeType = "TAX",
                        ChargeAmount = new Dictionary<string, string>(){{ "value", "1" }, { "currency", "USD" } }
                    },
                }
            });

            Plan.MerchantPref.SetupFee = new Dictionary<string, string>() { { "value", "1" }, { "currency", "USD" } };
            Plan.MerchantPref.ReturnUrl = "https://payment.eb-test.info/paymentreturn/paypalreturn?res=accept&tok=" + SerialOauthResponse.AccessToken;
            Plan.MerchantPref.CancelUrl = "https://payment.eb-test.info/paymentreturn/paypalreturn?res=cancel";
            Plan.MerchantPref.AutoBillAmount = "YES";
            Plan.MerchantPref.InitialFailAmountAction = "CONTINUE";
            Plan.MerchantPref.MaxFailAttempts = "0";


            //PREPARING REQUEST TO CREATE BILLING PLAN
            string JsonBody = JsonConvert.SerializeObject(Plan, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            FlurlClient flurlClient = new FlurlClient(UriString);
            flurlClient.Headers.Add("Content-Type", "application/json");
            flurlClient.Headers.Add("Authorization", "Bearer " + SerialOauthResponse.AccessToken);
            FlurlRequest flurlRequest = new FlurlRequest(UriString + "v1/payments/billing-plans/");
            flurlRequest.Client = flurlClient;


            //SENDING BILLING PLAN REQUEST AND RECEIVING RESPONSE
            var PaymentPlanResult = Send(HttpMethod.Post, flurlRequest, JsonBody).Result;
            var ResultContents = GetResponseContents(PaymentPlanResult).Result;
            Console.WriteLine("Payment Plan Create Request :: ");
            Console.WriteLine("Response Code :: " + PaymentPlanResult.StatusCode);
            Console.WriteLine("Response :: " + ResultContents);
            BillingPlanResponse BillPlanResponse = new BillingPlanResponse();
            BillPlanResponse = JsonConvert.DeserializeObject<BillingPlanResponse>(ResultContents);
            Console.WriteLine("\nBilling Plan Response ID :: " + BillPlanResponse.PlanID);


            //ACTIVATING THE BILLING PLAN
            string PaymentPlanID = BillPlanResponse.PlanID;
            string Url = UriString + "v1/payments/billing-plans/" + PaymentPlanID + "/";
            FlurlRequest ActivateRequest = new FlurlRequest(Url);
            ActivateRequest.Client = flurlClient;
            string _activateJson = "[{  \"op\": \"replace\",  \"path\": \"/\",  \"value\": {    \"state\": \"ACTIVE\"  }}]";
            var ActResult = Send(new HttpMethod("PATCH"), ActivateRequest, _activateJson).Result;
            var ActResultContents = GetResponseContents(ActResult).Result;
            if (ActResult.StatusCode == HttpStatusCode.OK)
            {
                BillPlanResponse.CurrentState = BillingPlanResponse.PlanStateStrings[(int)PlanState.ACTIVE];
            }
            Console.WriteLine("\n\nPayment Plan Activation Request :: ");
            Console.WriteLine("Response Code :: " + ActResult.StatusCode);
            Console.WriteLine("Response :: " + ActResultContents);


            //CREATING AND PARSING THE BILLING AGREEMENT
            //Object Initializations
            //string PlanObject = "id : \"" + "\"" + PaymentPlanID;
            FundingInstrument fundingInstrument = new FundingInstrument();
            fundingInstrument.CardDetails = new CreditCard()
            {
                CardNumber = 4868693532126484.ToString(),
                Cvv2 = 568,
                CardType = "visa",
                ExpireMonth = 10,
                ExpireYear = 2026,
            };

            BillingAgreementRequest BillAgreementRequest = new BillingAgreementRequest()
            {
                Name = "Trial Billing Request",
                Description = "Trial billing agreement",
                StartDate = "2020-01-01T09:13:49Z",
                BillingPlan = new BillingPlanResponse(BillPlanResponse.PlanID),
                Payer = new PayerDetails()
                {
                    PayMethod = PayerDetails.PaymentMethodsStrings[(int)PaymentMethod.paypal],
                    FundingInstruments = null,
                    FundingOptionId = null
                }
            };

            string AgreementUrl = UriString + "v1/payments/billing-agreements/";
            FlurlRequest AgreementRequest = new FlurlRequest(AgreementUrl);
            AgreementRequest.Client = flurlClient;
            string AgreementJson = JsonConvert.SerializeObject(BillAgreementRequest, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            var AgreementResult = Send(HttpMethod.Post, AgreementRequest, AgreementJson).Result;
            var AgreementResConents = GetResponseContents(AgreementResult).Result;
            Console.WriteLine("\n\nBilling Agreement Creating Request :: ");
            Console.WriteLine("Response Code :: " + AgreementResult.StatusCode);
            Console.WriteLine("Response :: " + AgreementResConents);
            string AcceptUrl = AgreementResConents.Substring(AgreementResConents.IndexOf("href") + 7, 94);
            Console.WriteLine("Accept URL :: " + AcceptUrl);

            return Redirect(AcceptUrl);
        }

    }

    [DataContract(Name = "billing_agreement")]
    public class BillingAgreementRequest
    {
        private string _name;
        private string _description;
        private string _startDate;
        private AgreementDetails _agreementDetails;
        private PayerDetails _payer;
        private BillingPlanResponse _billingPlan;

        [DataMember(Name = "name")]
        public string Name
        {
            get { return _name; }
            set { _name = value; }
        }

        [DataMember(Name = "description")]
        public string Description
        {
            get { return _description; }
            set { _description = value; }
        }

        [DataMember(Name = "start_date")]
        public string StartDate
        {
            get { return _startDate; }
            set { _startDate = value; }
        }

        [DataMember(Name = "agreement_details")]
        public AgreementDetails Details
        {
            get { return _agreementDetails; }
            set { _agreementDetails = value; }
        }

        [DataMember(Name = "payer")]
        public PayerDetails Payer
        {
            get { return _payer; }
            set { _payer = value; }
        }

        [DataMember(Name = "plan")]
        public BillingPlanResponse BillingPlan
        {
            get { return _billingPlan; }
            set { _billingPlan = value; }
        }
    }

    [DataContract(Name = "payer")]
    public class PayerDetails
    {
        private string _paymentMethod;
        private List<FundingInstrument> _fundingInstruments;
        private string _fundingOptionId;

        public static string[] PaymentMethodsStrings = { "bank", "paypal" };

        [DataMember(Name = "payment_method")]
        public string PayMethod
        {
            get { return _paymentMethod; }
            set { _paymentMethod = value; }
        }

        [DataMember(Name = "funding_instruments")]
        public List<FundingInstrument> FundingInstruments
        {
            get { return _fundingInstruments; }
            set { _fundingInstruments = value; }
        }

        [DataMember(Name = "funding_option_id")]
        public string FundingOptionId
        {
            get { return _fundingOptionId; }
            set { _fundingOptionId = value; }
        }
    }

    [DataContract(Name = "funding_instruments")]
    public class FundingInstrument
    {
        private CreditCard _cardDetails;

        [DataMember(Name = "credit_card")]
        public CreditCard CardDetails
        {
            get { return _cardDetails; }
            set { _cardDetails = value; }
        }
    }

    [DataContract(Name = "credit_card")]
    public class CreditCard
    {
        private string _cardId;
        private string _cardNumber;
        private string _cardType;
        private int _expireMonth;
        private int _expireYear;
        private int _cvv2;
        private string _firstName;
        private string _lastName;
        private string _externalCustomerId;
        private CardState _state;
        private string _validUntil;

        [DataMember(Name = "id")]
        public string CardId
        {
            get { return _cardId; }
            set { _cardId = value; }
        }

        [DataMember(Name = "number")]
        public string CardNumber
        {
            get { return _cardNumber; }
            set { _cardNumber = value; }
        }

        [DataMember(Name = "type")]
        public string CardType
        {
            get { return _cardType; }
            set { _cardType = value; }
        }

        [DataMember(Name = "expire_month")]
        public int ExpireMonth
        {
            get { return _expireMonth; }
            set { _expireMonth = value; }
        }

        [DataMember(Name = "expire_year")]
        public int ExpireYear
        {
            get { return _expireYear; }
            set { _expireYear = value; }
        }

        [DataMember(Name = "cvv2")]
        public int Cvv2
        {
            get { return _cvv2; }
            set { _cvv2 = value; }
        }

        [DataMember(Name = "first_name")]
        public string FirstName
        {
            get { return _firstName; }
            set { _firstName = value; }
        }

        [DataMember(Name = "last_name")]
        public string LastName
        {
            get { return _lastName; }
            set { _lastName = value; }
        }

        [DataMember(Name = "external_customer_id")]
        public string ExternalCustomerId
        {
            get { return _externalCustomerId; }
            set { _externalCustomerId = value; }
        }

        [DataMember(Name = "state")]
        public CardState State
        {
            get { return _state; }
            set { _state = value; }
        }

        [DataMember(Name = "valid_until")]
        public string ValidUntil
        {
            get { return _validUntil; }
            set { _validUntil = value; }
        }
    }

    [DataContract(Name = "agreement_details")]
    public class AgreementDetails
    {
        private Currency _outstandingBalance;
        private string _cyclesRemaining;
        private string _cyclesCompleted;
        private string _nextBillingDate;
        private string _lastPaymentDate;
        private Currency _lastPaymentAmount;
        private string _finalPaymentDate;
        private string _failedPaymentCount;

        [DataMember(Name = "outstanding_balance")]
        public Currency OutstandingBalance
        {
            get { return _outstandingBalance; }
            set { _outstandingBalance = value; }
        }

        [DataMember(Name = "cycles_remaining")]
        public string CyclesRemaining
        {
            get { return _cyclesRemaining; }
            set { _cyclesRemaining = value; }
        }

        [DataMember(Name = "cycles_completed")]
        public string CyclesCompleted
        {
            get { return _cyclesCompleted; }
            set { _cyclesCompleted = value; }
        }

        [DataMember(Name = "next_billing_date")]
        public string NextBillingDate
        {
            get { return _nextBillingDate; }
            set { _nextBillingDate = value; }
        }

        [DataMember(Name = "last_payment_date")]
        public string LastPaymentDate
        {
            get { return _lastPaymentDate; }
            set { _lastPaymentDate = value; }
        }

        [DataMember(Name = "last_payment_amount")]
        public Currency LastPaymentAmount
        {
            get { return _lastPaymentAmount; }
            set { _lastPaymentAmount = value; }
        }

        [DataMember(Name = "final_payment_date")]
        public string FinalPaymentDate
        {
            get { return _finalPaymentDate; }
            set { _finalPaymentDate = value; }
        }

        [DataMember(Name = "failed_payment_count")]
        public string FailedPaymentCount
        {
            get { return _failedPaymentCount; }
            set { _failedPaymentCount = value; }
        }
    }

    [DataContract(Name = "payment_plan_response")]
    public class BillingPlanResponse
    {
        private string _planId;
        private string _planName;
        private string _planDesc;
        private string _type;
        private string _state;
        private string _createTime;
        private string _updateTime;
        private List<PaymentDefinition> _paymentDefinitions = new List<PaymentDefinition>();
        private List<Terms> _paymentTerms = new List<Terms>();
        private MerchantPreferences _merchantPref = new MerchantPreferences();
        private Currency _currencyCode;
        private List<LinkDescription> _links;

        public BillingPlanResponse()
        { }
        public BillingPlanResponse(string Id)
        {
            PlanID = Id;
            PlanName = null;
            PlanDesc = null;
            BillingPlanType = null;
            CurrentState = null;
            CreateTime = null;
            UpdateTime = null;
            PaymentDefinitions = null;
            PaymentTerms = null;
            MerchPreference = null;
            CurrencyCode = null;
            Links = null;
        }

        public static string[] PlanTypeStrings = { "FIXED", "INFINITE" };
        public static string[] PlanStateStrings = { "CREATED", "ACTIVE", "INACTIVE" };

        [DataMember(Name = "id")]
        public string PlanID
        {
            get { return _planId; }
            set { _planId = value; }
        }

        [DataMember(Name = "name")]
        public string PlanName
        {
            get { return _planName; }
            set { _planName = value; }
        }

        [DataMember(Name = "description")]
        public string PlanDesc
        {
            get { return _planDesc; }
            set { _planDesc = value; }
        }

        [DataMember(Name = "type")]
        public string BillingPlanType
        {
            get { return _type; }
            set { _type = value; }
        }

        [DataMember(Name = "state")]
        public string CurrentState
        {
            get { return _state; }
            set { _state = value; }
        }

        [DataMember(Name = "create_time")]
        public string CreateTime
        {
            get { return _createTime; }
            set { _createTime = value; }
        }

        [DataMember(Name = "update_time")]
        public string UpdateTime
        {
            get { return _updateTime; }
            set { _updateTime = value; }
        }

        [DataMember(Name = "payment_definitions")]
        public List<PaymentDefinition> PaymentDefinitions
        {
            get { return _paymentDefinitions; }
            set { _paymentDefinitions = value; }
        }

        [DataMember(Name = "terms")]
        public List<Terms> PaymentTerms
        {
            get { return _paymentTerms; }
            set { _paymentTerms = value; }
        }

        [DataMember(Name = "merchant_preferences")]
        public MerchantPreferences MerchPreference
        {
            get { return _merchantPref; }
            set { _merchantPref = value; }
        }

        [DataMember(Name = "currency_code")]
        public Currency CurrencyCode
        {
            get { return _currencyCode; }
            set { _currencyCode = value; }
        }

        [DataMember(Name = "links")]
        public List<LinkDescription> Links
        {
            get { return _links; }
            set { _links = value; }
        }
    }

    [DataContract(Name = "link")]
    public class LinkDescription
    {
        private string _href;
        private string _rel;
        private HttpMethods _method;

        [DataMember(Name = "href")]
        public string Href
        {
            get { return _href; }
            set { _href = value; }
        }

        [DataMember(Name = "rel")]
        public string Rel
        {
            get { return _rel; }
            set { _rel = value; }
        }

        [DataMember(Name = "method")]
        public HttpMethods RequestMethod
        {
            get { return _method; }
            set { _method = value; }
        }
    }

    [DataContract(Name = "terms")]
    public class Terms
    {
        private string _id;
        private TermType _type;
        private Currency _maxBillingAmount;
        private string _occurrences;
        private Currency _amountRange;
        private string _buyerEditable;

        [DataMember(Name = "id")]
        public string Id
        {
            get { return _id; }
            set { _id = value; }
        }

        [DataMember(Name = "type")]
        public TermType TypeOfTerm
        {
            get { return _type; }
            set { _type = value; }
        }

        [DataMember(Name = "max_billing")]
        public Currency MaxBillingAmount
        {
            get { return _maxBillingAmount; }
            set { _maxBillingAmount = value; }
        }

        [DataMember(Name = "occurrences")]
        public string Occurrences
        {
            get { return _occurrences; }
            set { _occurrences = value; }
        }

        [DataMember(Name = "amount_range")]
        public Currency AmountRange
        {
            get { return _amountRange; }
            set { _amountRange = value; }
        }

        [DataMember(Name = "buyer_editable")]
        public string BuyerEditable
        {
            get { return _buyerEditable; }
            set { _buyerEditable = value; }
        }
    }

    [DataContract(Name = "max_amount")]
    public class Currency
    {
        private string _currency;
        private string _value;

        [DataMember(Name = "currency")]
        public string CurrencyCode
        {
            get { return _currency; }
            set { _currency = value; }
        }

        [DataMember(Name = "value")]
        public string Value
        {
            get { return _value; }
            set { _value = value; }
        }
    }

    [DataContract(Name = "payment_plan")]
    public class BillingPlanRequest
    {
        private string _name;
        private string _description;
        private string _type = "FIXED";
        private List<PaymentDefinition> _paymentDef;
        private MerchantPreferences _merchantPref = new MerchantPreferences();

        [DataMember(Name = "name")]
        public string Name
        {
            get { return _name; }
            set { _name = value; }
        }

        [DataMember(Name = "description")]
        public string Description
        {
            get { return _description; }
            set { _description = value; }
        }

        [DataMember(Name = "type")]
        public string Type
        {
            get { return _type; }
            set { _type = value; }
        }

        [DataMember(Name = "payment_definitions")]
        public List<PaymentDefinition> PaymentDef
        {
            get { return _paymentDef; }
            set { _paymentDef = value; }
        }

        [DataMember(Name = "merchant_preferences")]
        public MerchantPreferences MerchantPref
        {
            get { return _merchantPref; }
            set { _merchantPref = value; }
        }
    }

    [DataContract(Name = "payment_def")]
    public class PaymentDefinition
    {
        private string _name;
        private string _type;
        private string _frequency;
        private string _frequencyInterval;
        private Dictionary<string, string> _amount = new Dictionary<string, string>();
        private string _cycles;
        private List<ChargeModel> _chargeModels = new List<ChargeModel>();

        [DataMember(Name = "name")]
        public string Name
        {
            get { return _name; }
            set { _name = value; }
        }

        [DataMember(Name = "type")]
        public string PaymentType
        {
            get { return _type; }
            set { _type = value; }
        }

        [DataMember(Name = "frequency")]
        public string Frequency
        {
            get { return _frequency; }
            set { _frequency = value; }
        }

        [DataMember(Name = "frequency_interval")]
        public string FrequencyInterval
        {
            get { return _frequencyInterval; }
            set { _frequencyInterval = value; }
        }

        [DataMember(Name = "amount")]
        public Dictionary<string, string> Amount
        {
            get { return _amount; }
            set { _amount = value; }
        }

        [DataMember(Name = "cycles")]
        public string Cycles
        {
            get { return _cycles; }
            set { _cycles = value; }
        }

        [DataMember(Name = "charge_models")]
        public List<ChargeModel> ChargeModels
        {
            get { return _chargeModels; }
            set { _chargeModels = value; }
        }
    }

    [DataContract(Name = "charge_models")]
    public class ChargeModel
    {
        private string _chargeType;
        private Dictionary<string, string> _chargeAmount = new Dictionary<string, string>();

        [DataMember(Name = "type")]
        public string ChargeType
        {
            get { return _chargeType; }
            set { _chargeType = value; }
        }

        [DataMember(Name = "amount")]
        public Dictionary<string, string> ChargeAmount
        {
            get { return _chargeAmount; }
            set { _chargeAmount = value; }
        }
    }

    [DataContract(Name = "merchant_preferences")]
    public class MerchantPreferences
    {
        private Dictionary<string, string> _setupFee = new Dictionary<string, string>();
        private string _returnUrl;
        private string _cancelUrl;
        private string _autoBillAmount;
        private string _initialFailAmountAction;
        private string _maxFailAttempts;
        private string _notifyUrl;

        [DataMember(Name = "setup_fee")]
        public Dictionary<string, string> SetupFee
        {
            get { return _setupFee; }
            set { _setupFee = value; }
        }

        [DataMember(Name = "return_url")]
        public string ReturnUrl
        {
            get { return _returnUrl; }
            set { _returnUrl = value; }
        }

        [DataMember(Name = "cancel_url")]
        public string CancelUrl
        {
            get { return _cancelUrl; }
            set { _cancelUrl = value; }
        }

        [DataMember(Name = "auto_bill_amount")]
        public string AutoBillAmount
        {
            get { return _autoBillAmount; }
            set { _autoBillAmount = value; }
        }

        [DataMember(Name = "initial_fail_amount_action")]
        public string InitialFailAmountAction
        {
            get { return _initialFailAmountAction; }
            set { _initialFailAmountAction = value; }
        }

        [DataMember(Name = "max_fail_attempts")]
        public string MaxFailAttempts
        {
            get { return _maxFailAttempts; }
            set { _maxFailAttempts = value; }
        }

        [DataMember(Name = "notify_url")]
        public string NotifyUrl
        {
            get { return _notifyUrl; }
            set { _notifyUrl = value; }
        }
    }

    [DataContract(Name = "oauthobject")]
    public class PayPalOauthObject
    {
        private string _nonce;
        private string _accessToken;
        private string _tokenType;
        private string _appId;
        private int _expiresIn;

        [DataMember(Name = "nonce")]
        public string Nonce
        {
            get { return _nonce; }
            set { _nonce = value; }
        }

        [DataMember(Name = "access_token")]
        public string AccessToken
        {
            get { return _accessToken; }
            set { _accessToken = value; }
        }

        [DataMember(Name = "token_type")]
        public string TokenType
        {
            get { return _tokenType; }
            set { _tokenType = value; }
        }

        [DataMember(Name = "app_id")]
        public string AppId
        {
            get { return _appId; }
            set { _appId = value; }
        }

        [DataMember(Name = "expires_in")]
        public int ExpiresIn
        {
            get { return _expiresIn; }
            set { _expiresIn = value; }
        }
    }

}
