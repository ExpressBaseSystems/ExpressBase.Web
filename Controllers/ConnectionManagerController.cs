using ExpressBase.Common;
using ExpressBase.Common.Connections;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class ConnectionManagerController : EbBaseNewController
    {
        public ConnectionManagerController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }
        
        // GET: /<controller>/
        public IActionResult Index()
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = 0 });
            ViewBag.Connections = solutionConnections.EBSolutionConnections;
            return View();
        }

        [HttpGet]
        public IActionResult EditSMTPConnection()
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMTP });
            ViewBag.SMTP = solutionConnections.EBSolutionConnections.EmailConnection;
            return View();
        }

        [HttpGet]
        public IActionResult AddEmailAccount()
        {
            return View();
        }

        [HttpGet]
        public IActionResult AddDataDB()
        {
            return View();
        }

        [HttpGet]
        public IActionResult AddFilesDB()
        {
            return View();
        }

        [HttpGet]
        public IActionResult EditDataDB()
        {
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA });
            ViewBag.DataDB = solutionConnections.EBSolutionConnections.DataDbConnection;
            return View();
        }

        [HttpGet]
        public IActionResult AddSMSAccount()
        {
            return View();
        }

        [HttpPost]
        public IActionResult AddEmailAccount(int i)
        {
            var req = this.HttpContext.Request.Form;
            SMTPConnection smtpcon = new SMTPConnection();
            smtpcon.NickName = req["nickname"];
            smtpcon.Smtp = req["smtp"];
            smtpcon.Port = req["port"];
            smtpcon.EmailAddress = req["email"];
            smtpcon.Password = req["pwd"];
            var r = this.ServiceClient.Post<bool>(new ChangeSMTPConnectionRequest { SMTPConnection = smtpcon, IsNew = true });
            Console.WriteLine(req.ToString());
            return Redirect("/ConnectionManager");
        }

        [HttpPost]
        public IActionResult EditEmailAccount(int i)
        {
            var req = this.HttpContext.Request.Form;
            SMTPConnection smtpcon = new SMTPConnection();
            smtpcon.NickName = req["nickname"];
            smtpcon.Smtp = req["smtp"];
            smtpcon.Port = req["port"];
            smtpcon.EmailAddress = req["email"];
            smtpcon.Password = req["pwd"];
            var r = this.ServiceClient.Post<bool>(new ChangeSMTPConnectionRequest { SMTPConnection = smtpcon, IsNew = false });
            return Redirect("/ConnectionManager");
        }

        [HttpPost]
        public IActionResult EditDataDB(int i)
        {
            var req = this.HttpContext.Request.Form;
            EbDataDbConnection DataDB = new EbDataDbConnection();
            DataDB.DatabaseName = req["databasename"];
            DataDB.Server = req["server"];
            DataDB.Port = Int32.Parse(req["port"]);
            DataDB.UserName = req["username"];
            DataDB.Password = req["pwd"];
            var r = this.ServiceClient.Post<bool>(new ChangeDataDBConnectionRequest {  DataDBConnection = DataDB, IsNew = false });
            return Redirect("/ConnectionManager");
        }

        [HttpPost]
        public IActionResult AddDataDB(int i)
        {
            var req = this.HttpContext.Request.Form;
            EbDataDbConnection DataDB = new EbDataDbConnection();
            DataDB.DatabaseName = req["databasename"];
            DataDB.Server = req["server"];
            DataDB.Port = Int32.Parse(req["port"]);
            DataDB.UserName = req["username"];
            DataDB.Password = req["pwd"];
            var r = this.ServiceClient.Post<bool>(new ChangeDataDBConnectionRequest { DataDBConnection = DataDB, IsNew = true });
            return Redirect("/ConnectionManager");
        }

        [HttpPost]
        public IActionResult AddFilesDB(int i)
        {
            var req = this.HttpContext.Request.Form;
            EbFilesDbConnection FilesDB = new EbFilesDbConnection();
            FilesDB.FilesDB_url = req["url"];
            var r = this.ServiceClient.Post<bool>(new ChangeFilesDBConnectionRequest { FilesDBConnection = FilesDB, IsNew = true });
            return Redirect("/ConnectionManager");
        }

        [HttpPost]
        public IActionResult EditFilesDB(int i)
        {
            var req = this.HttpContext.Request.Form;
            EbFilesDbConnection FilesDB = new EbFilesDbConnection();
            FilesDB.FilesDB_url = req["url"];
            var r = this.ServiceClient.Post<bool>(new ChangeFilesDBConnectionRequest { FilesDBConnection = FilesDB, IsNew = false });
            return Redirect("/ConnectionManager");
        }
    }
}
