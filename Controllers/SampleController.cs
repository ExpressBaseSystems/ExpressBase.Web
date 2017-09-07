using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects;
using Microsoft.AspNetCore.Http;
using ExpressBase.Data;
using ExpressBase.Web.Filters;
using Microsoft.Extensions.Options;
using ExpressBase.Objects.Objects.TenantConnectionsRelated;
using ExpressBase.Web.Controllers;
using ExpressBase.Common.Connections;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web2.Controllers
{
    public class SampleController : EbBaseNewController
    {
        public SampleController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }


        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult AddEmailAccount()
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
            var r = this.ServiceClient.Post<bool>(new AddSMTPConnectionRequest { SMTPConnection = smtpcon });
            Console.WriteLine(req.ToString());
            return View();
        }

        public IActionResult dragNdrop()
        {
            return View();
        }
        public IActionResult Eb_formBuilder()
        {
            return View();
        }


        public IActionResult GetData()
        {
            return View();
        }

        public string sample()
        {

            return "{'name':'haii'}";
        }

        public IActionResult Table()
        {
            return View();
        }
        public IActionResult Masterhome()
        {
            return View();
        }

        //[ValidateAntiForgeryToken]
        public IActionResult RForm(int id)
        {
            ViewBag.FormId = id;
            return View();
        }
        
    }
}
