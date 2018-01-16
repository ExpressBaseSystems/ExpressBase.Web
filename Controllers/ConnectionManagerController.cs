using ExpressBase.Common;
using ExpressBase.Common.Connections;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using ServiceStack;
using ServiceStack.Redis;
using System;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class ConnectionManagerController : EbBaseIntController
    {
        public ConnectionManagerController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        // GET: /<controller>/
        public IActionResult Index()
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = 0 });
            if ((solutionConnections.EBSolutionConnections.FilesDbConnection.IsDefault == true))
                solutionConnections.EBSolutionConnections.FilesDbConnection = new EbFilesDbConnection();
            if ((solutionConnections.EBSolutionConnections.DataDbConnection.IsDefault == true))
                solutionConnections.EBSolutionConnections.DataDbConnection = new EbDataDbConnection();
            if ((solutionConnections.EBSolutionConnections.SMTPConnection == null))
                solutionConnections.EBSolutionConnections.SMTPConnection = new SMTPConnection();
            if (solutionConnections.EBSolutionConnections == null)
                solutionConnections.EBSolutionConnections.SMSConnection = new SMSConnection();
            if ((solutionConnections.EBSolutionConnections.ObjectsDbConnection.IsDefault == true))
                solutionConnections.EBSolutionConnections.ObjectsDbConnection = new EbObjectsDbConnection();

            ViewBag.Connections = solutionConnections.EBSolutionConnections;
            return View();
        }
        [HttpGet]
        public IActionResult DataDb()
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA });
            if ((solutionConnections.EBSolutionConnections.DataDbConnection.IsDefault == true))
                solutionConnections.EBSolutionConnections.DataDbConnection = new EbDataDbConnection();
            ViewBag.DataDb = solutionConnections.EBSolutionConnections.DataDbConnection;

            return View();
        }

        [HttpGet]
        public IActionResult ObjectsDb()
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA });
            if ((solutionConnections.EBSolutionConnections.ObjectsDbConnection.IsDefault == true))
                solutionConnections.EBSolutionConnections.ObjectsDbConnection = new EbObjectsDbConnection();
            ViewBag.ObjDb = solutionConnections.EBSolutionConnections.ObjectsDbConnection;

            return View();
        }

        [HttpGet]
        public IActionResult FilesDb()
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA });
            if ((solutionConnections.EBSolutionConnections.FilesDbConnection.IsDefault == true))
                solutionConnections.EBSolutionConnections.FilesDbConnection = new EbFilesDbConnection();
            ViewBag.FilesDb = solutionConnections.EBSolutionConnections.FilesDbConnection;
            return View();
        }

        [HttpGet]
        public IActionResult SMTP()
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMTP });
            if ((solutionConnections.EBSolutionConnections.SMTPConnection == null))
                solutionConnections.EBSolutionConnections.SMTPConnection = new SMTPConnection();
            ViewBag.SMTP = solutionConnections.EBSolutionConnections.SMTPConnection;

            return View();
        }

        [HttpGet]
        public IActionResult SMSAccount()
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMS });
            if (solutionConnections.EBSolutionConnections == null)
                solutionConnections.EBSolutionConnections.SMSConnection = new SMSConnection();
            ViewBag.SMS = solutionConnections.EBSolutionConnections.SMSConnection;
            return View();
        }

        [HttpPost]
        public EbDataDbConnection DataDb(int i)
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA });
            var req = this.HttpContext.Request.Form;

            EbDataDbConnection dbcon = new EbDataDbConnection() {
                DatabaseName=req["DbName"],
                Server = req["Server"],
                Port = Convert.ToInt32(req["Port"]),
                UserName = req["AdminUname"],
                Password = req["AdminPw"],
                ReadWriteUserName = req["RWUname"],
                ReadWritePassword = req["RWPw"],
                ReadOnlyUserName = req["ReadOnlyUname"],
                ReadOnlyPassword = req["ReadOnlyPw"],
                Timeout = Convert.ToInt32(req["TimeOut"])
            }; 
            
            ////if (!String.IsNullOrEmpty(req["Isdef"]))
            //    dbcon.IsDefault = false;

            if (solutionConnections.EBSolutionConnections.DataDbConnection != null)
            {
                if (String.IsNullOrEmpty(dbcon.Password) && dbcon.UserName == solutionConnections.EBSolutionConnections.SMSConnection.UserName && dbcon.Server == solutionConnections.EBSolutionConnections.DataDbConnection.Server)
                    dbcon.Password = solutionConnections.EBSolutionConnections.DataDbConnection.Password;
                this.ServiceClient.Post<bool>(new ChangeDataDBConnectionRequest { DataDBConnection = dbcon, IsNew = false });
            }
            else
                this.ServiceClient.Post<bool>(new ChangeDataDBConnectionRequest { DataDBConnection = dbcon, IsNew = true });
            return dbcon;
        }

        [HttpPost]
        public IActionResult ObjectsDb(int i)
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbOBJECTS });
            var req = this.HttpContext.Request.Form;
            EbObjectsDbConnection dbcon = new EbObjectsDbConnection();
            dbcon.NickName = req["nickname"];
            dbcon.Server = req["server"];
            dbcon.Port = Int32.Parse(req["port"]);
            dbcon.UserName = req["username"];
            dbcon.Password = req["pwd"];
            if (!String.IsNullOrEmpty(req["Isdef"]))
                dbcon.IsDefault = false;

            if (solutionConnections.EBSolutionConnections.ObjectsDbConnection != null)
            {
                if (String.IsNullOrEmpty(dbcon.Password) && dbcon.UserName == solutionConnections.EBSolutionConnections.SMSConnection.UserName && dbcon.Server == solutionConnections.EBSolutionConnections.DataDbConnection.Server)
                    dbcon.Password = solutionConnections.EBSolutionConnections.ObjectsDbConnection.Password;
                this.ServiceClient.Post<bool>(new ChangeObjectsDBConnectionRequest { ObjectsDBConnection = dbcon, IsNew = false });
            }
            else
                this.ServiceClient.Post<bool>(new ChangeObjectsDBConnectionRequest { ObjectsDBConnection = dbcon, IsNew = true });
            return Redirect("/ConnectionManager");
        }

        [HttpPost]
        public IActionResult FilesDb(int i)
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbFILES });
            var req = this.HttpContext.Request.Form;
            EbFilesDbConnection dbcon = new EbFilesDbConnection();
            dbcon.FilesDB_url = req["url"].ToString();
            if (solutionConnections.EBSolutionConnections.FilesDbConnection != null)
                this.ServiceClient.Post<bool>(new ChangeFilesDBConnectionRequest { FilesDBConnection = dbcon, IsNew = false });
            else
                this.ServiceClient.Post<bool>(new ChangeFilesDBConnectionRequest { FilesDBConnection = dbcon, IsNew = true });
            return Redirect("/ConnectionManager");
        }

        [HttpPost]
        public IActionResult SMSAccount(int i)
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMS });
            var req = this.HttpContext.Request.Form;
            SMSConnection smscon = new SMSConnection();
            smscon.ProviderName = req["provider"];
            smscon.NickName = req["nickname"];
            smscon.UserName = req["username"];
            smscon.From = req["from"];
            smscon.Password = req["pwd"];

            if (!String.IsNullOrEmpty(solutionConnections.EBSolutionConnections.SMSConnection.UserName))
            {
                if (String.IsNullOrEmpty(smscon.Password) && smscon.UserName == solutionConnections.EBSolutionConnections.SMSConnection.UserName)
                    smscon.Password = solutionConnections.EBSolutionConnections.SMSConnection.Password;
                this.ServiceClient.Post<bool>(new ChangeSMSConnectionRequest { SMSConnection = smscon, IsNew = false });
            }
            else
                this.ServiceClient.Post<bool>(new ChangeSMSConnectionRequest { SMSConnection = smscon, IsNew = true });
            return Redirect("/ConnectionManager");
        }

        [HttpPost]
        public IActionResult SMTP(int i)
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMTP });
            var req = this.HttpContext.Request.Form;
            SMTPConnection smtpcon = new SMTPConnection();
            smtpcon.NickName = req["nickname"];
            smtpcon.Smtp = req["smtp"];
            smtpcon.Port = Int32.Parse(req["port"]);
            smtpcon.EmailAddress = req["email"];
            smtpcon.Password = req["pwd"];

            if (!String.IsNullOrEmpty(solutionConnections.EBSolutionConnections.SMTPConnection.EmailAddress))
            {
                if (String.IsNullOrEmpty(smtpcon.Password) && smtpcon.EmailAddress == solutionConnections.EBSolutionConnections.SMTPConnection.EmailAddress)
                    smtpcon.Password = solutionConnections.EBSolutionConnections.SMTPConnection.Password;
                this.ServiceClient.Post<bool>(new ChangeSMTPConnectionRequest { SMTPConnection = smtpcon, IsNew = false });
            }
            else
                this.ServiceClient.Post<bool>(new ChangeSMTPConnectionRequest { SMTPConnection = smtpcon, IsNew = true });
            return Redirect("/ConnectionManager");
        }

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
    }
}
