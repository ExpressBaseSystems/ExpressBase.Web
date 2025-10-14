using ExpressBase.Common;
using ExpressBase.Common.Connections;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Data;
using ExpressBase.Common.Helpers;
using ExpressBase.Common.Messaging;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ExpressBase.Web.Controllers
{
    public class ConnectionManagerController : EbBaseIntTenantController
    {
        public ConnectionManagerController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc, IEbStaticFileClient _sfc) :
            base(_ssclient, _redis, _mqc, _sfc)
        {
        }

        [HttpGet]
        public IActionResult RefreshConnections()
        {
            return View();
        }

        [HttpPost]
        public IActionResult RefreshConnections(int i)
        {
            RefreshSolutionConnectionsAsyncResponse res = new RefreshSolutionConnectionsAsyncResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                res = this.MqClient.Post
                    <RefreshSolutionConnectionsAsyncResponse>(new RefreshSolutionConnectionsBySolutionIdAsyncRequest()
                    {
                        SolutionId = String.IsNullOrEmpty(req["solutionId"]) ? ViewBag.cid : req["solutionId"]
                    });
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.Message.ToString() + "\nResponse: " + res.ResponseStatus.Message);
            }
            return View();
        }

        [HttpPost]
        public bool DataDbTest()
        {
            IFormCollection req = this.HttpContext.Request.Form;
            EbDbConfig dbcon = new EbDbConfig()
            {
                DatabaseVendor = Enum.Parse<DatabaseVendors>(req["databaseVendor"].ToString()),
                DatabaseName = req["databaseName"],
                Server = req["server"],
                Port = Convert.ToInt32(req["port"]),
                UserName = req["userName"],
                Password = req["password"],
                ReadWriteUserName = req["readWriteUserName"],
                ReadWritePassword = req["readWritePassword"],
                ReadOnlyUserName = req["readOnlyUserName"],
                ReadOnlyPassword = req["readOnlyPassword"],
                Timeout = Convert.ToInt32(req["timeout"]),
                IsSSL = (req["IsSSL"] == "on") ? true : false
            };
            TestConnectionResponse res = this.ServiceClient.Post<TestConnectionResponse>(new TestConnectionRequest { DataDBConfig = dbcon });
            return res.ConnectionStatus;
        }

        //-------------------------------------------------------------Integrations-----------------

        [HttpPost]
        public string AddDB()
        {
            IFormCollection req = this.HttpContext.Request.Form;
            EbDbConfig con = new EbDbConfig();
            DatabaseVendors vendor = Enum.Parse<DatabaseVendors>(req["databaseVendor"].ToString());
            if (vendor == DatabaseVendors.PGSQL)
            {
                con = new PostgresConfig()
                {
                    DatabaseName = req["databaseName"],
                    Server = req["server"],
                    Port = Convert.ToInt32(req["port"]),
                    RoServer1 = req["roServer1"],
                    RoPort1 = string.IsNullOrWhiteSpace(req["roPort1"]) ? 0 : Convert.ToInt32(req["roPort1"]),
                    RoTimeout1 = string.IsNullOrWhiteSpace(req["roTimeout1"]) ? 0 : Convert.ToInt32(req["roTimeout1"]),
                    UserName = req["userName"],
                    Password = req["password"],
                    ReadWriteUserName = req["readWriteUserName"],
                    ReadWritePassword = req["readWritePassword"],
                    ReadOnlyUserName = req["readOnlyUserName"],
                    ReadOnlyPassword = req["readOnlyPassword"],
                    Timeout = Convert.ToInt32(req["timeout"]),
                    IsSSL = (req["IsSSL"] == "on") ? true : false,
                    NickName = req["nickname"],
                    Id = Convert.ToInt32(req["Id"])
                };
            }
            if (vendor == DatabaseVendors.ORACLE)
            {
                con = new OracleConfig()
                {
                    DatabaseName = req["databaseName"],
                    Server = req["server"],
                    Port = Convert.ToInt32(req["port"]),
                    UserName = req["userName"],
                    Password = req["password"],
                    ReadWriteUserName = req["readWriteUserName"],
                    ReadWritePassword = req["readWritePassword"],
                    ReadOnlyUserName = req["readOnlyUserName"],
                    ReadOnlyPassword = req["readOnlyPassword"],
                    Timeout = Convert.ToInt32(req["timeout"]),
                    IsSSL = (req["IsSSL"] == "on") ? true : false,
                    NickName = req["nickname"]
                };
            }
            if (vendor == DatabaseVendors.MYSQL)
            {
                con = new MySqlConfig()
                {
                    DatabaseName = req["databaseName"],
                    Server = req["server"],
                    Port = Convert.ToInt32(req["port"]),
                    UserName = req["userName"],
                    Password = req["password"],
                    ReadWriteUserName = req["readWriteUserName"],
                    ReadWritePassword = req["readWritePassword"],
                    ReadOnlyUserName = req["readOnlyUserName"],
                    ReadOnlyPassword = req["readOnlyPassword"],
                    Timeout = Convert.ToInt32(req["timeout"]),
                    IsSSL = (req["IsSSL"] == "on") ? true : false,
                    NickName = req["nickname"],
                    Id = Convert.ToInt32(req["Id"])
                };
            }
            if (vendor == DatabaseVendors.MSSQL)
            {
                con = new MSSqlConfig()
                {
                    DatabaseName = req["databaseName"],
                    Server = req["server"],
                    Port = Convert.ToInt32(req["port"]),
                    UserName = req["userName"],
                    Password = req["password"],
                    ReadWriteUserName = req["readWriteUserName"],
                    ReadWritePassword = req["readWritePassword"],
                    ReadOnlyUserName = req["readOnlyUserName"],
                    ReadOnlyPassword = req["readOnlyPassword"],
                    Timeout = Convert.ToInt32(req["timeout"]),
                    IsSSL = (req["IsSSL"] == "on") ? true : false,
                    NickName = req["nickname"],
                    Id = Convert.ToInt32(req["Id"])
                };
            }
            try
            {
                AddDBResponse response = this.ServiceClient.Post<AddDBResponse>(new AddDBRequest
                {
                    DbConfig = con,
                    SolnId = req["SolutionId"]
                });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests
                {
                    IsolutionId = req["SolutionId"]
                });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                Console.WriteLine("AddAB Controller :" + e + e.StackTrace);
            }
            return null;
        }

        [HttpPost]
        public string AddTwilio()
        {
            AddTwilioResponse res = new AddTwilioResponse();
            try
            {
                IFormCollection req = this.HttpContext.Request.Form;
                EbTwilioConfig twilioCon = new EbTwilioConfig
                {
                    UserName = req["UserName"],
                    From = req["From"],
                    Password = req["Password"],
                    NickName = req["nickname"],
                    Id = Convert.ToInt32(req["Id"])
                };
                res = this.ServiceClient.Post<AddTwilioResponse>(new AddTwilioRequest
                {
                    Config = twilioCon,
                    SolnId = req["SolutionId"]
                });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests
                {
                    IsolutionId = req["SolutionId"]
                });

                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddUnifonic()
        {
            AddUnifonicResponse res = new AddUnifonicResponse();
            try
            {
                IFormCollection req = this.HttpContext.Request.Form;
                EbUnifonicConfig UnifonicConf = new EbUnifonicConfig
                {
                    UserName = req["UserName"],
                    From = req["From"],
                    Password = req["Password"],
                    NickName = req["nickname"],
                    Id = Convert.ToInt32(req["Id"])
                };
                res = this.ServiceClient.Post<AddUnifonicResponse>(new AddUnifonicRequest
                {
                    Config = UnifonicConf,
                    SolnId = req["SolutionId"]
                });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests
                {
                    IsolutionId = req["SolutionId"]
                });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddExpertTexting()
        {
            AddETResponse res = new AddETResponse();
            try
            {
                IFormCollection req = this.HttpContext.Request.Form;

                EbExpertTextingConfig con = new EbExpertTextingConfig
                {
                    UserName = req["UserName"],
                    From = req["From"],
                    Password = req["Password"],
                    ApiKey = req["ApiKey"],
                    Id = Convert.ToInt32(req["Id"]),
                    NickName = req["nickname"]
                };
                res = this.ServiceClient.Post<AddETResponse>(new AddETRequest
                {
                    Config = con,
                    SolnId = req["SolutionId"]
                });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests
                {
                    IsolutionId = req["SolutionId"]
                });

                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddTextLocal()
        {
            AddTLResponse res = new AddTLResponse();
            try
            {
                IFormCollection req = this.HttpContext.Request.Form;

                EbTextLocalConfig con = new EbTextLocalConfig
                {
                    From = req["From"],
                    ApiKey = req["ApiKey"],
                    Id = Convert.ToInt32(req["Id"]),
                    NickName = req["nickname"],
                    BrandName = req["BrandName"]
                };

                res = this.ServiceClient.Post<AddTLResponse>(new AddTLRequest
                {
                    Config = con,
                    SolnId = req["SolutionId"]
                });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests
                {
                    IsolutionId = req["SolutionId"]
                });

                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddSmsBuddy()
        {
            AddSBResponse res = new AddSBResponse();
            try
            {
                IFormCollection req = this.HttpContext.Request.Form;

                EbSmsBuddyConfig con = new EbSmsBuddyConfig
                {
                    From = req["From"],
                    ApiKey = req["ApiKey"],
                    Id = Convert.ToInt32(req["Id"]),
                    NickName = req["nickname"]
                };
                res = this.ServiceClient.Post<AddSBResponse>(new AddSBRequest
                {
                    Config = con,
                    SolnId = req["SolutionId"]
                });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests
                {
                    IsolutionId = req["SolutionId"]
                });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddMongo()
        {
            AddMongoResponse res = new AddMongoResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbMongoConfig con = new EbMongoConfig
                {
                    UserName = req["UserName"],
                    Password = req["Password"],
                    Host = req["server"],
                    Port = Convert.ToInt32(req["port"]),
                    Id = Convert.ToInt32(req["Id"]),
                    NickName = req["nickname"]
                };
                res = this.ServiceClient.Post<AddMongoResponse>(new AddMongoRequest
                {
                    Config = con,
                    SolnId = req["SolutionId"]
                });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests
                {
                    IsolutionId = req["SolutionId"]
                });

                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddEmail()
        {
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                AddSmtpResponse response = null;
                EmailProtocols protocol = (EmailProtocols)Convert.ToInt32(req["protocol"]);
                EbConnectionTypes type = EbConnectionTypes.SMTP;
                if (protocol == EmailProtocols.SMTP)
                {
                    response = AddSmtp(req);
                }
                else
                {
                    if (protocol == EmailProtocols.IMAP)
                    {
                        response = AddImap(req);
                        type = EbConnectionTypes.IMAP;
                    }
                    else if (protocol == EmailProtocols.POP3)
                    {
                        response = AddPop3(req);
                        type = EbConnectionTypes.POP3;
                    }

                    EbIntegration integration = new EbIntegration
                    {
                        ConfigId = response.Id,
                        Preference = ConPreferences.MULTIPLE,
                        Type = type,
                        Id = !String.IsNullOrEmpty(req["IntegrationId"]) ? Convert.ToInt32(req["IntegrationId"]) : 0
                    };
                    Integrate(JsonConvert.SerializeObject(integration), false, req["SolnId"], false);
                }

                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests
                {
                    IsolutionId = req["SolnId"]
                });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                //res.ResponseStatus.Message = e.Message;
                Console.WriteLine(e.Message);
                return null;
            }

        }

        public AddSmtpResponse AddImap(IFormCollection req)
        {
            EbImapConfig con = new EbImapConfig
            {
                ProviderName = (EmailProviders)Convert.ToInt32(req["Emailvendor"]),
                Protocol = (EmailProtocols)Convert.ToInt32(req["protocol"]),
                NickName = req["NickName"],
                Host = req["SMTP"],
                Port = Convert.ToInt32(req["Port"]),
                EmailAddress = req["Email"],
                Password = req["Password"],
                Id = Convert.ToInt32(req["Id"])
            };

            Boolean.TryParse(req["IsSSL"], out bool a);
            if (a)
                con.EnableSsl = Convert.ToBoolean(req["IsSSL"]);
            else
                con.EnableSsl = (req["IsSSL"] == "on");

            AddSmtpResponse res = this.ServiceClient.Post<AddSmtpResponse>(new AddImapRequest
            {
                Config = con,
                SolnId = req["SolnId"]
            });
            return res;
        }

        public AddSmtpResponse AddPop3(IFormCollection req)
        {
            EbPop3Config con = new EbPop3Config
            {
                ProviderName = (EmailProviders)Convert.ToInt32(req["Emailvendor"]),
                Protocol = (EmailProtocols)Convert.ToInt32(req["protocol"]),
                NickName = req["NickName"],
                Host = req["SMTP"],
                Port = Convert.ToInt32(req["Port"]),
                EmailAddress = req["Email"],
                Password = req["Password"],
                Id = Convert.ToInt32(req["Id"])
            };

            Boolean.TryParse(req["IsSSL"], out bool a);
            if (a)
                con.EnableSsl = Convert.ToBoolean(req["IsSSL"]);
            else
                con.EnableSsl = (req["IsSSL"] == "on");

            AddSmtpResponse res = this.ServiceClient.Post<AddSmtpResponse>(new AddPop3Request
            {
                Config = con,
                SolnId = req["SolnId"]
            });
            return res;
        }

        public AddSmtpResponse AddSmtp(IFormCollection req)
        {
            EbSmtpConfig con = new EbSmtpConfig
            {
                ProviderName = (EmailProviders)Convert.ToInt32(req["Emailvendor"]),
                Protocol = (EmailProtocols)Convert.ToInt32(req["protocol"]),
                NickName = req["NickName"],
                Host = req["SMTP"],
                Port = Convert.ToInt32(req["Port"]),
                EmailAddress = req["Email"],
                Password = req["Password"],
                Id = Convert.ToInt32(req["Id"])
            };

            Boolean.TryParse(req["IsSSL"], out bool a);
            if (a)
                con.EnableSsl = Convert.ToBoolean(req["IsSSL"]);
            else
                con.EnableSsl = (req["IsSSL"] == "on");

            AddSmtpResponse res = this.ServiceClient.Post<AddSmtpResponse>(new AddSmtpRequest
            {
                Config = con,
                SolnId = req["SolnId"]
            });
            return res;
        }

        public string AddCloudinary()
        {
            AddCloudinaryResponse res = new AddCloudinaryResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbCloudinaryConfig con = new EbCloudinaryConfig
                {
                    Cloud = req["Cloud"],
                    ApiKey = req["ApiKey"],
                    ApiSecret = req["ApiSecret"],
                    NickName = req["NickName"],
                    Id = Convert.ToInt32(req["Id"])
                };

                res = this.ServiceClient.Post<AddCloudinaryResponse>(new AddCloudinaryRequest
                {
                    Config = con,
                    SolnId = req["SolutionId"]
                });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests
                {
                    IsolutionId = req["SolutionId"]
                });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddGoogleMap()
        {
            AddGoogleMapResponse res = new AddGoogleMapResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbGoogleMapConfig con = new EbGoogleMapConfig
                {
                    ApiKey = req["ApiKey"],
                    NickName = req["NickName"],
                    Id = Convert.ToInt32(req["Id"]),
                    MapType = MapType.COMMON,
                    Vendor = MapVendors.GOOGLEMAP
                };
                res = this.ServiceClient.Post<AddGoogleMapResponse>(new AddGoogleMapRequest { Config = con, SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        //public string AddOpenStreetMap()
        //{
        //    AddOpenStreetMapResponse res = new AddOpenStreetMapResponse();
        //    IFormCollection req = this.HttpContext.Request.Form;
        //    try
        //    {
        //        OpenStreetMapConfig con = new OpenStreetMapConfig
        //        {
        //            ApiKey = req["ApiKey"],
        //            NickName = req["NickName"],
        //            Id = Convert.ToInt32(req["Id"]),
        //            MapType = MapType.COMMON,
        //            Vendor = MapVendors.OSM
        //        };
        //        res = this.ServiceClient.Post<AddOpenStreetMapResponse>(new AddOpenStreetMapRequest { Config = con, SolnId = req["SolutionId"] });
        //        GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
        //        return JsonConvert.SerializeObject(resp);
        //    }
        //    catch (Exception e)
        //    {
        //        res.ResponseStatus.Message = e.Message;
        //        return null;
        //    }
        //}

        public string AddAzureNotificationHub()
        {
            MobileConfigResponse res = new MobileConfigResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                MobileConfig con = new MobileConfig
                {
                    AzureNFConnection = req["ConnectionStr"],
                    AzureNFHubName = req["HubName"],
                    NickName = req["NickName"],
                    AndroidAppSignInKey = req["SigninKey"],
                    AndroidAppURL = req["AndroidAppURL"],
                    Id = Convert.ToInt32(req["Id"]),
                };
                res = this.ServiceClient.Post<MobileConfigResponse>(new MobileConfigRequest { Config = con, SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddDropBox()
        {
            AddDropBoxResponse res = new AddDropBoxResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbDropBoxConfig con = new EbDropBoxConfig
                {
                    AccessToken = req["AccessToken"],
                    NickName = req["NickName"],
                    Id = Convert.ToInt32(req["Id"]),
                    Type = EbIntegrations.DropBox
                };
                res = this.ServiceClient.Post<AddDropBoxResponse>(new AddDropBoxRequest { Config = con, SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddAWSS3()
        {
            AddAWSS3Response res = new AddAWSS3Response();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                //RegionEndpoint rt = RegionEndpoint.EnumerableAllRegions.FirstOrDefault(e => e.SystemName == req["bucketRegion"].ToString());
                //RegionEndpoint r = RegionEndpoint.GetBySystemName(req["bucketRegion"].ToString());
                //RegionEndpoint bucketRegion = RegionEndpoint.APSouth1;
                //string rt = r.DisplayName;
                //r = ParseRegion(rt);
                //RegionEndpoint r = RegionEndpoint.r
                EbAWSS3Config con = new EbAWSS3Config
                {
                    BucketName = req["BucketName"],
                    AccessKeyID = req["AccessKeyID"],
                    SecretAccessKey = req["SecretAccessKey"],
                    BucketRegion = req["bucketRegion"].ToString(),
                    NickName = req["NickName"],
                    Id = Convert.ToInt32(req["Id"]),
                    Type = EbIntegrations.AWSS3
                };
                res = this.ServiceClient.Post<AddAWSS3Response>(new AddAWSS3Request { Config = con, SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddSendGrid()
        {
            AddSendGridResponse res = new AddSendGridResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbSendGridConfig con = new EbSendGridConfig
                {
                    ApiKey = req["ApiKey"],
                    NickName = req["NickName"],
                    Id = Convert.ToInt32(req["Id"]),
                    Type = EbIntegrations.SendGrid,
                    EmailAddress = req["EmailAddress"],
                    Name = req["Name"]
                };
                res = this.ServiceClient.Post<AddSendGridResponse>(new AddSendGridRequest { Config = con, SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddSlack()
        {
            AddSlackResponse res = new AddSlackResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbSlackConfig con = new EbSlackConfig
                {
                    NickName = req["NickName"],
                    Id = Convert.ToInt32(req["Id"]),
                    OAuthAccessToken = req["OAuthAccessToken"],
                    Channel = req["Channel"],
                    Type = EbIntegrations.Slack
                };
                res = this.ServiceClient.Post<AddSlackResponse>(new AddSlackRequest { Config = con, SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddFacebook()
        {
            AddfacebookResponse res = new AddfacebookResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbfacebbokConfig con = new EbfacebbokConfig
                {
                    NickName = req["NickName"],
                    Id = Convert.ToInt32(req["Id"]),
                    AppId = req["AppId"],
                    AppVersion = req["AppVersion"],
                    Type = EbIntegrations.Facebook
                };
                res = this.ServiceClient.Post<AddfacebookResponse>(new AddfacebookRequest { Config = con, SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddGoogleDriveAsync()
        {
            string RedirectUri = "";
            AddGoogleDriveResponse res = new AddGoogleDriveResponse();

            IFormCollection req = this.HttpContext.Request.Form;
            EbGoogleDriveConfig con = new EbGoogleDriveConfig
            {
                ClientID = req["ClientID"],
                Clientsecret = req["Clientsecret"],
                ApplicationName = req["ApplicationName"],
                Id = Convert.ToInt32(req["Id"]),
                NickName = req["NickName"],
                Type = EbIntegrations.GoogleDrive
            };
            try
            {
                GoogleAuthorizationCodeFlow.Initializer init = new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = new ClientSecrets
                    {
                        ClientId = con.ClientID,
                        ClientSecret = con.Clientsecret
                    },
                    Scopes = new string[] { "https://www.googleapis.com/auth/drive" }
                };
                AuthorizationCodeFlow flow = new AuthorizationCodeFlow(init);
                Console.WriteLine("Fetching token for code: _" + req["code"] + "_");

                if (HttpContext.Items.ContainsKey("Domain") && HttpContext.Items.ContainsKey("Scheme"))
                {

                    RedirectUri = HttpContext.Items["Scheme"].ToString() + "myaccount." + HttpContext.Items["Domain"].ToString();

                }
                else //TODO: TestAndRemoveInTheNextDeployment
                {
                    if (ViewBag.Env == "Staging")
                    {
                        RedirectUri = "https://myaccount." + RoutingConstants.STAGEHOST;
                    }
                    else if (ViewBag.Env == "Production")
                    {
                        RedirectUri = "https://myaccount.expressbase.com";
                    }
                        
                }

                //Console.WriteLine(RedirectUri);

                TokenResponse result = AsyncHelper.RunSync(() => GetGoogleDriveKey(flow, req["code"], RedirectUri));
                Console.WriteLine(JsonConvert.SerializeObject(result));
                con.RefreshToken = result.RefreshToken;
                res = this.ServiceClient.Post<AddGoogleDriveResponse>(new AddGoogleDriveRequest { Config = con, SolnId = req["SolutionId"] });
                Console.WriteLine("After inserstion GD : ");
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                Console.WriteLine("After Solution info : " + JsonConvert.SerializeObject(resp));
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus = new ResponseStatus { Message = e.Message };
                return JsonConvert.SerializeObject(res);
            }
        }

        public async Task<TokenResponse> GetGoogleDriveKey(AuthorizationCodeFlow flow, string code, string RedirectUri)
        {
            TokenResponse result = await flow.ExchangeCodeForTokenAsync("user", code, RedirectUri, CancellationToken.None);
            return result;
        }

        public string credientialBot(int Cid, string sid)
        {

            CredientialBotResponse response = new CredientialBotResponse();
            try
            {
                response = this.ServiceClient.Get<CredientialBotResponse>(new CredientialBotRequest
                {
                    ConfId = Cid,
                    SolnId = sid
                });
            }
            catch (Exception e)
            {
                response.ResponseStatus = new ResponseStatus
                {
                    Message = e.Message
                };
                return JsonConvert.SerializeObject(response);
            }
            return JsonConvert.SerializeObject(response);
        }

        public string Integrate(string _integration, bool deploy, string sid, bool drop)
        {
            EbIntegrationResponse res = new EbIntegrationResponse();
            EbIntegration integration = JsonConvert.DeserializeObject<EbIntegration>(_integration);
            try
            {
                //EbIntegration _obj = new EbIntegration
                //{
                //    Id = Convert.ToInt32(req["Id"]),
                //    ConfigId = Convert.ToInt32(req["ConfId"]),
                //    Preference = Enum.Parse<ConPreferences>(req["Preference"].ToString()),
                //    Type = Enum.Parse<EbConnectionTypes>(req["Type"].ToString())
                //};

                res = this.ServiceClient.Post<EbIntegrationResponse>(new EbIntegrationRequest
                {
                    IntegrationO = integration,
                    Deploy = deploy,
                    SolnId = sid,
                    Drop = drop
                });

                if (res?.ResponseStatus?.Message == ErrorTexConstants.DB_ALREADY_EXISTS)
                {
                    return JsonConvert.SerializeObject(res);
                }

                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests
                {
                    IsolutionId = sid
                });

                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus = new ResponseStatus { Message = e.Message };
                return JsonConvert.SerializeObject(res);
            }
        }

        public string IntegrateConfDelete(int Id, string sid)
        {
            EbIntegrationConfDeleteResponse res = new EbIntegrationConfDeleteResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbIntegrationConf _obj = new EbIntegrationConf
                {
                    Id = Convert.ToInt32(req["Id[Id]"])
                };

                res = this.ServiceClient.Post<EbIntegrationConfDeleteResponse>(new EbIntergationConfDeleteRequest
                {
                    IntegrationConfdelete = _obj,
                    SolnId = sid
                });

                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests
                {
                    IsolutionId = sid
                });

                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return JsonConvert.SerializeObject(res);
            }
        }

        public string IntegrateDelete(int Id, string sid)
        {
            EbIntegrationDeleteResponse res = new EbIntegrationDeleteResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbIntegration _obj = new EbIntegration
                {
                    Id = Convert.ToInt32(req["Id[Id]"])
                };

                res = this.ServiceClient.Post<EbIntegrationDeleteResponse>(new EbIntergationDeleteRequest
                {
                    Integrationdelete = _obj,
                    SolnId = sid
                });

                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests
                {
                    IsolutionId = sid
                });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return JsonConvert.SerializeObject(res);
            }
        }

        public string IntegrationSwitch(string preferancetype, string sid)
        {
            EbIntegrationSwitchResponse res = new EbIntegrationSwitchResponse();

            try
            {
                res = this.ServiceClient.Post<EbIntegrationSwitchResponse>(new EbIntergationSwitchRequest
                {
                    Integrations = JsonConvert.DeserializeObject<List<EbIntegration>>(preferancetype),
                    SolnId = sid
                });

                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests
                {
                    IsolutionId = sid
                });

                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return JsonConvert.SerializeObject(res);
            }
        }

        public string PrimaryDelete(string preferancetype, string sid, string deleteId)
        {
            EbIntegrationResponse res = new EbIntegrationResponse();

            try
            {
                if (preferancetype == string.Empty)
                {
                    EbIntegration req = JsonConvert.DeserializeObject<EbIntegration>(preferancetype);
                    res = this.ServiceClient.Post<EbIntegrationResponse>(new EbIntegrationRequest
                    {
                        IntegrationO = req,
                        SolnId = sid
                    });
                }
                EbIntegration _obj = new EbIntegration
                {
                    Id = Convert.ToInt32(deleteId)
                };
                res = this.ServiceClient.Post<EbIntegrationResponse>(new EbIntergationDeleteRequest { Integrationdelete = _obj, SolnId = sid });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = sid });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return JsonConvert.SerializeObject(res);
            }
        }
    }
}

