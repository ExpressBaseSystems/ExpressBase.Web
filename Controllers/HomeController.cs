using System.Web;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System;
using Microsoft.AspNetCore.Http;
using System.IO;
using ExpressBase.Common;
using ExpressBase.Data;
using ServiceStack;
using ExpressBase.ServiceStack.Services;
using ExpressBase.ServiceStack.Models;
using System.Net.Http;
using Newtonsoft.Json;
using System.Threading;
using System.Net;
using System.Reflection;
using Microsoft.AspNetCore.Routing;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.ServiceStack
{
    public class HomeController : Controller
    {
        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }
        //public IActionResult About()
        //{
        //    return View();
        //}
       


        [HttpGet]
        public ActionResult Registerview(int Id)
        {
            //if (Id > 0)
            //{
            //    //var id = Convert.ToInt32(Context.Request.Query["id"]);
            //    string html = string.Empty;
            //    IServiceClient client = new JsonServiceClient("http://localhost:53125/").WithCache();
            //    var fr = client.Get<ViewResponse>(new ViewUser { ColId = Id });
            //    Registermodel regis = new Registermodel
            //    {

            //        FirstName = fr.Viewvalues["firstname"].ToString(),
            //        LastName = fr.Viewvalues["lastname"].ToString(),
            //        MiddleName = fr.Viewvalues["middlename"].ToString(),
            //        Email = fr.Viewvalues["email"].ToString(),
            //        dob = Convert.ToDateTime(fr.Viewvalues["dob"]),
            //        Password = fr.Viewvalues["pwd"].ToString(),
            //        PhNoPrimary = fr.Viewvalues["phnoprimary"].ToString(),
            //        PhNoSecondary = fr.Viewvalues["phnosecondary"].ToString(),
            //        Landline = fr.Viewvalues["landline"].ToString(),
            //        Extension = fr.Viewvalues["extension"].ToString(),
            //        Locale = fr.Viewvalues["locale"].ToString(),
            //        Alternateemail = fr.Viewvalues["alternateemail"].ToString(),
            //        IsEdited = true


            //    };
            //    return View(regis);
            //}
            //else
            //{

            //    Registermodel register1 = new Registermodel
            //    {
            //        IsEdited = false
            //    };
            return View("registerview");


        }
        
       
    }
}
