using ExpressBase.Common;
using ExpressBase.Common.Connections;
using ExpressBase.Common.Data;
using ExpressBase.Common.Messaging;
using ExpressBase.Common.Messaging.ExpertTexting;
using ExpressBase.Common.Messaging.Twilio;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class ConnectionManagerController : EbBaseIntCommonController
    {
        public ConnectionManagerController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _mqc, _sfc)
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
            var req = this.HttpContext.Request.Form;
            try
            {
                res = this.MqClient.Post<RefreshSolutionConnectionsAsyncResponse>(new RefreshSolutionConnectionsBySolutionIdAsyncRequest()
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

        // GET: /<controller>/

        //public IActionResult Index()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = 0 });
        //    if ((solutionConnections.EBSolutionConnections.FilesDbConnection.IsDefault == true))
        //        solutionConnections.EBSolutionConnections.FilesDbConnection = new EbFilesDbConnection();
        //    if ((solutionConnections.EBSolutionConnections.DataDbConnection.IsDefault == true))
        //        solutionConnections.EBSolutionConnections.DataDbConnection = new EbDataDbConnection();
        //    if ((solutionConnections.EBSolutionConnections.SMTPConnection == null))
        //        solutionConnections.EBSolutionConnections.SMTPConnection = new SMTPConnection();
        //    if (solutionConnections.EBSolutionConnections == null)
        //        solutionConnections.EBSolutionConnections.SMSConnection = new SMSConnection();
        //    if ((solutionConnections.EBSolutionConnections.ObjectsDbConnection.IsDefault == true))
        //        solutionConnections.EBSolutionConnections.ObjectsDbConnection = new EbObjectsDbConnection();

        //    ViewBag.Connections = solutionConnections.EBSolutionConnections;
        //    return View();
        //}


        //[HttpGet]
        //public IActionResult DataDb()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA });
        //    if ((solutionConnections.EBSolutionConnections.DataDbConnection.IsDefault == true))
        //        solutionConnections.EBSolutionConnections.DataDbConnection = new EbDataDbConnection();
        //    ViewBag.DataDb = solutionConnections.EBSolutionConnections.DataDbConnection;

        //    return View();
        //}

        //[HttpGet]
        //public IActionResult ObjectsDb()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA });
        //    if ((solutionConnections.EBSolutionConnections.ObjectsDbConnection.IsDefault == true))
        //        solutionConnections.EBSolutionConnections.ObjectsDbConnection = new EbObjectsDbConnection();
        //    ViewBag.ObjDb = solutionConnections.EBSolutionConnections.ObjectsDbConnection;

        //    return View();
        //}

        //[HttpGet]
        //public IActionResult FilesDb()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA });
        //    if ((solutionConnections.EBSolutionConnections.FilesDbConnection.IsDefault == true))
        //        solutionConnections.EBSolutionConnections.FilesDbConnection = new EbFilesDbConnection();
        //    ViewBag.FilesDb = solutionConnections.EBSolutionConnections.FilesDbConnection;
        //    return View();
        //}

        //[HttpGet]
        //public IActionResult SMTP()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMTP });
        //    if ((solutionConnections.EBSolutionConnections.EmailConnections == null))
        //        solutionConnections.EBSolutionConnections.EmailConnections = new EbMailConCollection();
        //    ViewBag.SMTP = solutionConnections.EBSolutionConnections.EmailConnections;

        //    return View();
        //}

        //[HttpGet]
        //public IActionResult SMSAccount()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMS });
        //    if (solutionConnections.EBSolutionConnections == null)
        //        solutionConnections.EBSolutionConnections.SMSConfigs = new EbSmsConCollection();
        //    ViewBag.SMS = solutionConnections.EBSolutionConnections.SMSConfigs;
        //    return View();
        //}

        //[HttpPost]
        //public string DataDb(int i)
        //{
        //    var req = this.HttpContext.Request.Form;

        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA, SolutionId = req["SolutionId"] });
        //     string solutionid = this.HttpContext.Request.Query["Sid"];

        //    EbDataDbConnection dbcon = new EbDataDbConnection()
        //    {
        //        DatabaseVendor = Enum.Parse<DatabaseVendors>(req["databaseVendor"].ToString()),
        //        DatabaseName = req["databaseName"],
        //        Server = req["server"],
        //        Port = Convert.ToInt32(req["port"]),
        //        UserName = req["userName"],
        //        Password = req["password"],
        //        ReadWriteUserName = req["readWriteUserName"],
        //        ReadWritePassword = req["readWritePassword"],
        //        ReadOnlyUserName = req["readOnlyUserName"],
        //        ReadOnlyPassword = req["readOnlyPassword"],
        //        Timeout = Convert.ToInt32(req["timeout"]),
        //        IsDefault = false,
        //        IsSSL = (req["IsSSL"] == "on") ? true : false
        //    };

        //    EbObjectsDbConnection objdbcon = new EbObjectsDbConnection()
        //    {
        //        DatabaseVendor = Enum.Parse<DatabaseVendors>(req["databaseVendor"].ToString()),
        //        DatabaseName = req["databaseName"],
        //        Server = req["server"],
        //        Port = Convert.ToInt32(req["port"]),
        //        UserName = req["userName"],
        //        Password = req["password"],
        //        ReadWriteUserName = req["readWriteUserName"],
        //        ReadWritePassword = req["readWritePassword"],
        //        ReadOnlyUserName = req["readOnlyUserName"],
        //        ReadOnlyPassword = req["readOnlyPassword"],
        //        Timeout = Convert.ToInt32(req["timeout"]),
        //        IsDefault = false,
        //        IsSSL = (req["IsSSL"] == "on") ? true : false
        //    };

        //    this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeDataDBConnectionRequest { DataDBConnection = dbcon, IsNew = false, SolutionId = req["SolutionId"] });
        //    this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeObjectsDBConnectionRequest { ObjectsDBConnection = objdbcon, IsNew = false, SolutionId = req["SolutionId"] });

        //    //if (solutionConnections.EBSolutionConnections.DataDbConnection != null)
        //    //{
        //    //    if (String.IsNullOrEmpty(dbcon.Password) && dbcon.UserName == solutionConnections.EBSolutionConnections.SMSConnection.UserName && dbcon.Server == solutionConnections.EBSolutionConnections.DataDbConnection.Server)
        //    //        dbcon.Password = solutionConnections.EBSolutionConnections.DataDbConnection.Password;
        //    //    if (!this.ServiceClient.Post<bool>(new ChangeDataDBConnectionRequest { DataDBConnection = dbcon, IsNew = false }))
        //    //    {
        //    //        if (req["databaseVendor"].ToString() == "ORACLE")
        //    //        {
        //    //            var response = this.ServiceClient.Post(new EbDbCreateRequest { dbName = dbcon.DatabaseName, ischange = "true" });
        //    //        }       
        //    //    }

        //    //}
        //    //else
        //    //    this.ServiceClient.Post<bool>(new ChangeDataDBConnectionRequest { DataDBConnection = dbcon, IsNew = true });
        //    //if (solutionConnections.EBSolutionConnections.ObjectsDbConnection != null)
        //    //{
        //    //    if (String.IsNullOrEmpty(objdbcon.Password) && objdbcon.UserName == solutionConnections.EBSolutionConnections.ObjectsDbConnection.UserName && objdbcon.Server == solutionConnections.EBSolutionConnections.ObjectsDbConnection.Server)
        //    //        objdbcon.Password = solutionConnections.EBSolutionConnections.ObjectsDbConnection.Password;
        //    //    if (!this.ServiceClient.Post<bool>(new ChangeObjectsDBConnectionRequest { ObjectsDBConnection = objdbcon, IsNew = false }))
        //    //    {
        //    //        if (req["databaseVendor"].ToString() == "ORACLE")
        //    //            this.ServiceClient.Post<bool>(new EbCreateOracleDBRequest { });
        //    //    }

        //    //}
        //    //else
        //    //    this.ServiceClient.Post<bool>(new ChangeObjectsDBConnectionRequest { ObjectsDBConnection = objdbcon, IsNew = true });
        //    return JsonConvert.SerializeObject(dbcon);
        //}

        // [HttpPost]
        //public IActionResult ObjectsDb(int i)
        //{
        //    ChangeConnectionResponse res = new ChangeConnectionResponse();
        //    try
        //    {
        //        var req = this.HttpContext.Request.Form;
        //        GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbOBJECTS, SolutionId = req["SolutionId"] });

        //        EbObjectsDbConnection dbcon = new EbObjectsDbConnection();
        //        dbcon.NickName = req["nickname"];
        //        dbcon.Server = req["server"];
        //        dbcon.Port = Int32.Parse(req["port"]);
        //        dbcon.UserName = req["username"];
        //        dbcon.DatabaseName = req["databasename"];
        //        dbcon.Timeout = 500;
        //        dbcon.Password = req["pwd"];
        //        if (!String.IsNullOrEmpty(req["Isdef"]))
        //            dbcon.IsDefault = false;

        //        if (solutionConnections.EBSolutionConnections.ObjectsDbConnection != null)
        //        {
        //                dbcon.Password = solutionConnections.EBSolutionConnections.ObjectsDbConnection.Password;
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeObjectsDBConnectionRequest { ObjectsDBConnection = dbcon, IsNew = false });
        //        }
        //        else
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeObjectsDBConnectionRequest { ObjectsDBConnection = dbcon, IsNew = true });
        //    }
        //    catch (Exception e)
        //    {
        //        Console.WriteLine("Exception: " + e.Message + "\nResponse: " + res.ResponseStatus.Message);
        //    }
        //    return Redirect("/ConnectionManager");
        //}

        //[HttpPost]
        //public string FilesDb(int i)
        //{
        //    ChangeConnectionResponse res = new ChangeConnectionResponse();
        //    try
        //    {
        //        var req = this.HttpContext.Request.Form;

        //        GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbFILES, SolutionId = req["SolutionId"] });
        //        EbFilesDbConnection dbcon = new EbFilesDbConnection()
        //        {
        //            FilesDbVendor = Enum.Parse<FilesDbVendors>(req["DatabaseVendor"].ToString()),
        //            FilesDB_url = req["ConnectionString"].ToString(),
        //            NickName = req["NickName"].ToString(),
        //            IsDefault = false
        //        };

        //        //if (solutionConnections.EBSolutionConnections.FilesDbConnection != null)
        //        //    res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeFilesDBConnectionRequest { FilesDBConnection = dbcon, IsNew = false, SolutionId = req["SolutionId"] });
        //        //else
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeFilesDBConnectionRequest { FilesDBConnection = dbcon, IsNew = true, SolutionId = req["SolutionId"] });
        //        return JsonConvert.SerializeObject(dbcon);

        //    }
        //    catch (Exception e)
        //    {
        //        res.ResponseStatus.Message = e.Message;
        //        return null;
        //    }
        //}

        //[HttpPost]
        //public string TwilioAccount()
        //{
        //    ChangeConnectionResponse res = new ChangeConnectionResponse();
        //    try
        //    {
        //        var req = this.HttpContext.Request.Form;
        //        GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMS, SolutionId = req["SolutionId"] });

        //        TwilioConnection smscon = new TwilioConnection
        //        {
        //            UserName = req["UserName"],
        //            From = req["From"],
        //            Password = req["Password"],
        //            Preference = (ConPreferences)Convert.ToInt32(req["Preference"]),
        //        };

        //        //if (solutionConnections.EBSolutionConnections.SMSConfigs.Capacity == 0)
        //        //{
        //        //    smscon.Preference = ConPreferences.PRIMARY;
        //        //}

        //        if (Convert.ToInt32(req["Conid"]) > 0)
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeSMSConnectionRequest { SMSConnection = smscon, IsNew = false, SolutionId = req["SolutionId"] });
        //        else
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeSMSConnectionRequest { SMSConnection = smscon, IsNew = true, SolutionId = req["SolutionId"] });
        //        return JsonConvert.SerializeObject(smscon);
        //    }
        //    catch (Exception e)
        //    {
        //        res.ResponseStatus.Message = e.Message;
        //        return null;
        //    }
        //}

        //[HttpPost]
        //public string ExpertTextingAccount()
        //{
        //    ChangeConnectionResponse res = new ChangeConnectionResponse();
        //    try
        //    {
        //        var req = this.HttpContext.Request.Form;
        //        ExpertTextingConnection smscon = new ExpertTextingConnection
        //        {
        //            UserName = req["UserName"],
        //            From = req["From"],
        //            Password = req["Password"],
        //            Preference = (ConPreferences)Convert.ToInt32(req["Preference"]),
        //            ApiKey = req["ApiKey"]
        //        };
        //        GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMS, SolutionId = req["SolutionId"] });
        //        //if (solutionConnections.EBSolutionConnections.SMSConfigs.Capacity == 0)
        //        //{
        //        //    smscon.Preference = ConPreferences.PRIMARY;
        //        //}
        //        if (Convert.ToInt32(req["Conid"]) > 0)
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeSMSConnectionRequest { SMSConnection = smscon, IsNew = false, SolutionId = req["SolutionId"] });
        //        else
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeSMSConnectionRequest { SMSConnection = smscon, IsNew = true, SolutionId = req["SolutionId"] });
        //        return JsonConvert.SerializeObject(smscon);
        //    }
        //    catch (Exception e)
        //    {
        //        res.ResponseStatus.Message = e.Message;
        //        return null;
        //    }
        //}

        //[HttpPost]
        //public string Cloudinary(int i)
        //{
        //    ChangeConnectionResponse res = new ChangeConnectionResponse();
        //    try
        //    {
        //        var req = this.HttpContext.Request.Form;

        //        GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.Cloudinary, SolutionId = req["SolutionId"] });
        //        EbCloudinaryConnection con = new EbCloudinaryConnection()
        //        {
        //            Account = new CloudinaryDotNet.Account(req["Cloud"], req["ApiKey"], req["ApiSecret"]),
        //            IsDefault = false
        //        };

        //        //if (String.IsNullOrEmpty(con.Account.Cloud) &&
        //        //    //con.Account.Cloud == solutionConnections.EBSolutionConnections.CloudinaryConnection.Account.Cloud &&
        //        //    //con.Account.ApiKey == solutionConnections.EBSolutionConnections.CloudinaryConnection.Account.ApiKey)
        //        //    res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeCloudinaryConnectionRequest { ImageManipulateConnection = con, IsNew = false, SolutionId = req["SolutionId"] });
        //        //else
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeCloudinaryConnectionRequest { ImageManipulateConnection = con, IsNew = true, SolutionId = req["SolutionId"] });
        //        return JsonConvert.SerializeObject(con);
        //    }
        //    catch (Exception e)
        //    {
        //        res.ResponseStatus.Message = e.Message;
        //        return null;
        //    }
        //}


        //[HttpPost]
        //public string FTP(int i)
        //{
        //    ChangeConnectionResponse res = new ChangeConnectionResponse();
        //    try
        //    {
        //        var req = this.HttpContext.Request.Form;

        //        GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.FTP, SolutionId = req["SolutionId"] });
        //        EbFTPConnection con = new EbFTPConnection()
        //        {
        //            Host = req["Host"],
        //            Username = req["Username"],
        //            Password = req["Password"],
        //            NickName = req["NickName"],
        //            IsDefault = false
        //        };

        //        //if (String.IsNullOrEmpty(con.Host) &&
        //        //    //con.Host == solutionConnections.EBSolutionConnections.FTPConnection.Host &&
        //        //    //con.Username == solutionConnections.EBSolutionConnections.FTPConnection.Username)
        //        //    res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeFTPConnectionRequest { FTPConnection = con, IsNew = false, SolutionId = req["SolutionId"] });
        //        //else
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeFTPConnectionRequest { FTPConnection = con, IsNew = true, SolutionId = req["SolutionId"] });
        //        return JsonConvert.SerializeObject(con);
        //    }
        //    catch (Exception e)
        //    {
        //        res.ResponseStatus.Message = e.Message;
        //        return null;
        //    }
        //}

        //[HttpPost]
        //public string SMTP(int i)
        //{
        //    ChangeConnectionResponse res = new ChangeConnectionResponse();
        //    try
        //    {
        //        var req = this.HttpContext.Request.Form;

        //        GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMTP, SolutionId = req["SolutionId"] });
        //        EbEmail smtpcon = new EbEmail
        //        {
        //            ProviderName = req["Emailvendor"],
        //            NickName = req["NickName"],
        //            Host = req["SMTP"],
        //            Port = Convert.ToInt32(req["Port"]),
        //            EmailAddress = req["Email"],
        //            Password = req["Password"],
        //            EnableSsl = Convert.ToBoolean(req["IsSSL"]),
        //            IsDefault = false
        //        };
        //        //if (solutionConnections.EBSolutionConnections.EmailConnections == null || solutionConnections.EBSolutionConnections.EmailConnections.Capacity == 0)
        //        //    smtpcon.Preference = ConPreferences.PRIMARY;
        //        //if (String.IsNullOrEmpty(smtpcon.Password) && smtpcon.EmailAddress == solutionConnections.EBSolutionConnections.SMTPConnection.EmailAddress)
        //        //{
        //        //    smtpcon.Password = solutionConnections.EBSolutionConnections.SMTPConnection.Password;
        //        //    res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeSMTPConnectionRequest { email = smtpcon, IsNew = false, SolutionId = req["SolutionId"] });
        //        //}
        //        //else
        //        res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeSMTPConnectionRequest { Email = smtpcon, IsNew = true, SolutionId = req["SolutionId"] });
        //        return JsonConvert.SerializeObject(smtpcon);
        //    }
        //    catch (Exception e)
        //    {
        //        res.ResponseStatus.Message = e.Message;
        //        return null;
        //    }
        //}

        [HttpPost]
        public bool DataDbTest()
        {
            var req = this.HttpContext.Request.Form;
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

        //[HttpPost]
        //public bool FilesDbTest()
        //{
        //    var req = this.HttpContext.Request.Form;
        //    EbFilesDbConnection dbcon = new EbFilesDbConnection()
        //    {
        //        FilesDbVendor = Enum.Parse<FilesDbVendors>(req["DatabaseVendor"].ToString()),
        //        FilesDB_url = req["ConnectionString"].ToString(),
        //        NickName = req["NickName"].ToString()
        //    };
        //    TestFileDbconnectionResponse resp = this.ServiceClient.Post<TestFileDbconnectionResponse>(new TestFileDbconnectionRequest { FilesDBConnection = dbcon });
        //    return resp.ConnectionStatus;
        //}
        //[HttpGet]
        //public IActionResult EditDataDB()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA });
        //    ViewBag.DataDB = solutionConnections.EBSolutionConnections.DataDbConnection;
        //    return View();
        //}

        //[HttpGet]
        //public IActionResult AddSMSAccount()
        //{
        //    return View();
        //}
        //[HttpPost]
        //public IActionResult AddSMTP(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    SMTPConnection smtpcon = new SMTPConnection();
        //    smtpcon.NickName = req["nickname"];
        //    smtpcon.Smtp = req["smtp"];
        //    smtpcon.Port = Int32.Parse(req["port"]);
        //    smtpcon.EmailAddress = req["email"];
        //    smtpcon.Password = req["pwd"];
        //    var r = this.ServiceClient.Post<bool>(new ChangeSMTPConnectionRequest { SMTPConnection = smtpcon, IsNew = true });
        //    Console.WriteLine(req.ToString());
        //    return Redirect("/ConnectionManager");
        //}

        //[HttpPost]
        //public IActionResult EditSMTP(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    SMTPConnection smtpcon = new SMTPConnection();
        //    smtpcon.NickName = req["nickname"];
        //    smtpcon.Smtp = req["smtp"];
        //    smtpcon.Port = Int32.Parse(req["port"]);
        //    smtpcon.EmailAddress = req["email"];
        //    smtpcon.Password = req["pwd"];
        //    var r = this.ServiceClient.Post<bool>(new ChangeSMTPConnectionRequest { SMTPConnection = smtpcon, IsNew = false });
        //    return Redirect("/ConnectionManager");
        //}

        //[HttpPost]
        //public IActionResult EditDataDB(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    EbDataDbConnection DataDB = new EbDataDbConnection();
        //    DataDB.DatabaseName = req["databasename"];
        //    DataDB.Server = req["server"];
        //    DataDB.Port = Int32.Parse(req["port"]);
        //    DataDB.UserName = req["username"];
        //    DataDB.Password = req["pwd"];
        //    DataDB.Timeout = Int32.Parse(req["timeout"]);
        //    var r = this.ServiceClient.Post<bool>(new ChangeDataDBConnectionRequest { DataDBConnection = DataDB, IsNew = false });
        //    return Redirect("/ConnectionManager");
        //}

        //[HttpPost]
        //public IActionResult AddDataDB(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    EbDataDbConnection DataDB = new EbDataDbConnection();
        //    DataDB.DatabaseName = req["databasename"];
        //    DataDB.Server = req["server"];
        //    DataDB.Port = Int32.Parse(req["port"]);
        //    DataDB.UserName = req["username"];
        //    DataDB.Password = req["pwd"];
        //    DataDB.Timeout = Int32.Parse(req["timeout"]);
        //    var r = this.ServiceClient.Post<bool>(new ChangeDataDBConnectionRequest { DataDBConnection = DataDB, IsNew = true });
        //    return Redirect("/ConnectionManager");
        //}

        //[HttpPost]
        //public IActionResult AddFilesDB(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    EbFilesDbConnection FilesDB = new EbFilesDbConnection();
        //    FilesDB.FilesDB_url = req["url"].ToString();
        //    var r = this.ServiceClient.Post<bool>(new ChangeFilesDBConnectionRequest { FilesDBConnection = FilesDB, IsNew = true });
        //    return Redirect("/ConnectionManager");
        //}

        //[HttpPost]
        //public IActionResult EditSMSAccount(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    SMSConnection smscon = new SMSConnection();
        //    smscon.ProviderName = req["provider"];
        //    smscon.NickName = req["nickname"];
        //    smscon.UserName = req["username"];
        //    smscon.From = req["from"];
        //    smscon.Password = req["pwd"];

        //    var r = this.ServiceClient.Post<bool>(new ChangeSMSConnectionRequest { SMSConnection = smscon, IsNew = false });
        //    return Redirect("/ConnectionManager");
        //}
        //[HttpGet]
        //public IActionResult EditSMTP()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMTP });
        //    ViewBag.SMTP = solutionConnections.EBSolutionConnections.SMTPConnection;
        //    return View();
        //}

        //[HttpGet]
        //public IActionResult AddSMTP()
        //{
        //    return View();
        //}

        //[HttpGet]
        //public IActionResult AddDataDB()
        //{
        //    return View();
        //}



        //-------------------------------------------------------------Integrations-----------------
        [HttpPost]
        public string AddDB()
        {
            var req = this.HttpContext.Request.Form;
            EbDbConfig con = new EbDbConfig();
            DatabaseVendors vendor = Enum.Parse<DatabaseVendors>(req["databaseVendor"].ToString());


            if (vendor == DatabaseVendors.PGSQL)
            {
                con = new PostgresConfig()
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
                    //DatabaseName = "ebdbvmqh4i6coh20180427060153",
                    //Server = "35.200.147.143",
                    //Port = 5432,
                    //UserName = "postgres",
                    //Password = "m04P0N4t95p53bx5",
                    //ReadWriteUserName = null,
                    //ReadWritePassword = null,
                    //ReadOnlyUserName = null,
                    //ReadOnlyPassword = null,
                    //Timeout = 500,
                    //NickName = "ebdbvmqh4i6coh20180427060153_Initial"
                };
            }
            if (vendor == DatabaseVendors.ORACLE)
            {
                con = new OracleConfig()
                {
                    //DatabaseName = req["databaseName"],
                    //Server = req["server"],
                    //Port = Convert.ToInt32(req["port"]),
                    //UserName = req["userName"],
                    //Password = req["password"],
                    //ReadWriteUserName = req["readWriteUserName"],
                    //ReadWritePassword = req["readWritePassword"],
                    //ReadOnlyUserName = req["readOnlyUserName"],
                    //ReadOnlyPassword = req["readOnlyPassword"],
                    //Timeout = Convert.ToInt32(req["timeout"]),
                    //IsSSL = (req["IsSSL"] == "on") ? true : false,
                    //NickName = req["nickname"]
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

            this.ServiceClient.Post<AddDBResponse>(new AddDBRequest
            {
                DbConfig = con,
                // IsNew = false,
                SolnId = req["SolutionId"]
            });
            return JsonConvert.SerializeObject(con);
        }

        [HttpPost]
        public string AddTwilio()
        {
            AddTwilioResponse res = new AddTwilioResponse();
            try
            {
                var req = this.HttpContext.Request.Form;
                //EbTwilioConfig twilioCon = new EbTwilioConfig
                //{
                //    UserName = "Test",
                //    From = "test",
                //    Password = "testpw",
                //    NickName = "nick",
                //};
                EbTwilioConfig twilioCon = new EbTwilioConfig
                {
                    UserName = req["UserName"],
                    From = req["From"],
                    Password = req["Password"],
                    NickName = req["nickname"]
                };
                res = this.ServiceClient.Post<AddTwilioResponse>(new AddTwilioRequest { Config = twilioCon, /*IsNew = true,*/ SolnId = req["SolutionId"] });
                return JsonConvert.SerializeObject(twilioCon);
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
                var req = this.HttpContext.Request.Form;
                //EbExpertTextingConfig con = new EbExpertTextingConfig
                //{
                //    UserName = "Test",
                //    From = "test",
                //    Password = "testpw",
                //    NickName = "nick",
                //    Id = 0
                //};
                EbExpertTextingConfig con = new EbExpertTextingConfig
                {
                    UserName = req["UserName"],
                    From = req["From"],
                    Password = req["Password"],
                    ApiKey = req["ApiKey"],
                    Id = Convert.ToInt32(req["Id"]),
                    NickName = req["nickname"]
                };
                res = this.ServiceClient.Post<AddETResponse>(new AddETRequest { Config = con,/* IsNew = true,*/  SolnId = req["SolutionId"] });
                return JsonConvert.SerializeObject(con);
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
            var req = this.HttpContext.Request.Form;
            try
            {
                //EbMongoConfig con = new EbMongoConfig
                //{
                //    UserName = "Test",
                //    Password = "testpw",
                //    Host = "test",
                //    Port = 0,
                //    Id = 0,
                //    NickName = "nick"
                //};
                EbMongoConfig con = new EbMongoConfig
                {
                    UserName = req["UserName"],
                    Password = req["Password"],
                    Host = req["server"],
                    Port = Convert.ToInt32(req["port"]),
                    Id = Convert.ToInt32(req["Id"]),
                    NickName = req["nickname"]
                };
                res = this.ServiceClient.Post<AddMongoResponse>(new AddMongoRequest { Config = con/*, IsNew = true*/, SolnId = req["SolutionId"] });
                return JsonConvert.SerializeObject(con);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }
        public string AddSMTP()
        {
            AddSmtpResponse res = new AddSmtpResponse();
            var req = this.HttpContext.Request.Form;
            try
            {
                //EbSmtpConfig con = new EbSmtpConfig
                //{
                //    EmailAddress = "sddsd",
                //    EnableSsl = true,
                //    ProviderName = SmtpProviders.Gmail,
                //    Password = "testpw",
                //    Host = "test",
                //    Port = 0,
                //    Id = 0,
                //    NickName = "nick"
                //};
                EbSmtpConfig con = new EbSmtpConfig
                {
                    // ProviderName = (SmtpProviders)Convert.ToInt32(req["Emailvendor"]),
                    NickName = req["NickName"],
                    Host = req["SMTP"],
                    Port = Convert.ToInt32(req["Port"]),
                    EmailAddress = req["Email"],
                    Password = req["Password"],
                    EnableSsl = Convert.ToBoolean(req["IsSSL"]),
                    Id = Convert.ToInt32(req["Id"])
                };
                con.ProviderName = (SmtpProviders)Enum.Parse(typeof(SmtpProviders), req["Emailvendor"]);
                res = this.ServiceClient.Post<AddSmtpResponse>(new AddSmtpRequest { Config = con, /*IsNew = true,*/ SolnId = req["SolnId"] });
                return JsonConvert.SerializeObject(con);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }
        public string AddCloudinary()
        {
            AddCloudinaryResponse res = new AddCloudinaryResponse();
            var req = this.HttpContext.Request.Form;
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

                res = this.ServiceClient.Post<AddCloudinaryResponse>(new AddCloudinaryRequest { Config = con/*, IsNew = true*/ , SolnId = req["SolutionId"] });
                return JsonConvert.SerializeObject(con);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        //[HttpGet("SolutionManager/{Sid}")]
        //public IActionResult GetIntegrationConfigs(string Sid)
        //{
        //    GetSolutioInfoResponse Solresp = this.ServiceClient.Get<GetSolutioInfoResponse>(new GetSolutioInfoRequest { IsolutionId = Sid });
        //    ViewBag.Connections = Solresp.EBSolutionConnections;
        //    ViewBag.SolutionInfo = Solresp.Data;

        //    GetIntegrationConfigsResponse res = this.ServiceClient.Get<GetIntegrationConfigsResponse>(new GetIntegrationConfigsRequest { });

        //    //ViewBag.cid = Sid;
        //    //ViewBag.Domain = this.HttpContext.Request.Host;
        //    //ViewBag.rToken = Request.Cookies["rToken"];
        //    //ViewBag.bToken = Request.Cookies["bToken"];
        //    return View();
        //}

        //[HttpGet("SolutionManager/{Sid}")]
        //public IActionResult SolutionManager(string Sid)
        //{
        //    // GetSolutioInfoResponse resp = this.ServiceClient.Get<GetSolutioInfoResponse>(new GetSolutioInfoRequest { IsolutionId = Sid });
        //    GetIntegrationConfigsResponse Solresp = this.ServiceClient.Get<GetIntegrationConfigsResponse>(new GetSolutionIntegrationRequest { IsolutionId = Sid });
        //    ViewBag.Connections = Solresp.EBSolutionConnections;
        //    ViewBag.SolutionInfo = Solresp.Data;
        //    ViewBag.cid = Sid;
        //    ViewBag.Domain = this.HttpContext.Request.Host;
        //    ViewBag.rToken = Request.Cookies["rToken"];
        //    ViewBag.bToken = Request.Cookies["bToken"];
        //    return View();
        //}

        public string Integrate()
        {
            EbIntegrationResponse res = new EbIntegrationResponse();
            var req = this.HttpContext.Request.Form;
            try
            {
                EbIntegration _obj = new EbIntegration
                {
                    Id = Convert.ToInt32(req["Id"]),
                    ConfigId = Convert.ToInt32(req["ConfId"]),
                    Preference = Enum.Parse<ConPreferences>(req["Preference"].ToString()),
                    Type = Enum.Parse<EbConnections>(req["Type"].ToString())
                };
                res = this.ServiceClient.Post<EbIntegrationResponse>(new EbIntegrationRequest { IntegrationO = _obj, SolnId = req["SolutionId"] });
                return JsonConvert.SerializeObject(res);
            }
            catch (Exception e)
            {
                res.ResponseStatus = new ResponseStatus { Message = e.Message };
                return JsonConvert.SerializeObject(res);
            }
        }

        public string IntegrateConfDelete()
        {
            EbIntegrationConfDeleteResponse res = new EbIntegrationConfDeleteResponse();
            var req = this.HttpContext.Request.Form;
            try
            {
                EbIntegrationConf _obj = new EbIntegrationConf
                {
                    Id = Convert.ToInt32(req["Id"])
                };
                res = this.ServiceClient.Post<EbIntegrationConfDeleteResponse>(new EbIntergationConfDeleteRequest { IntegrationConfdelete = _obj, SolnId = req["SolutionId"] });
                return JsonConvert.SerializeObject(res);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return JsonConvert.SerializeObject(res);
            }
        }

        public string IntegrateDelete()
        {
            EbIntegrationDeleteResponse res = new EbIntegrationDeleteResponse();
            var req = this.HttpContext.Request.Form;
            try
            {
                EbIntegration _obj = new EbIntegration
                {
                    Id = Convert.ToInt32(req["Id"])
                };
                res = this.ServiceClient.Post<EbIntegrationDeleteResponse>(new EbIntergationDeleteRequest { Integrationdelete = _obj, SolnId = req["SolutionId"] });
                return JsonConvert.SerializeObject(res);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return JsonConvert.SerializeObject(res);
            }
        }

        public string IntegrationSwitch(string preferancetype, string sid)
        {
            var req = JsonConvert.DeserializeObject<List<EbIntegration>>(preferancetype);
            var SolnId = ViewBag.cid;
            EbIntegrationSwitchResponse res = new EbIntegrationSwitchResponse();
           
            try
            {
                res = this.ServiceClient.Post<EbIntegrationSwitchResponse>(new EbIntergationSwitchRequest { Integrations = req, SolnId = sid });
                return JsonConvert.SerializeObject(res);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return JsonConvert.SerializeObject(res);
            }
        }

        public string PrimaryDelete(string preferancetype, string sid, string deleteId)
        {
            var req = JsonConvert.DeserializeObject<EbIntegration>(preferancetype);
            var SolnId = ViewBag.cid;
            EbIntegrationResponse res = new EbIntegrationResponse();

            try
            {
                res = this.ServiceClient.Post<EbIntegrationResponse>(new EbIntegrationRequest { IntegrationO = req, SolnId = sid });
                EbIntegration _obj = new EbIntegration
                {
                    Id = Convert.ToInt32(deleteId)
                };
                res = this.ServiceClient.Post<EbIntegrationResponse>(new EbIntergationDeleteRequest { Integrationdelete = _obj, SolnId = sid });
                return JsonConvert.SerializeObject(res);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return JsonConvert.SerializeObject(res);
            }
        }

        public void ConnectionsHelper()
        {
            _GetConectionsResponse res = ServiceClient.Get<_GetConectionsResponse>(new _GetConectionsRequest { });
        }
    }
}

