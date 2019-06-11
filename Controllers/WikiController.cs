using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class WikiController : EbBaseIntCommonController
    {
        public WikiController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        [HttpGet("wiki/add")]
        public IActionResult AddWiki()
        {
            return View();
        }

        //[HttpPost]
        //public IActionResult Index(object obj)
        //{
        //    StoreTitle();
        //    return View("Add_Wiki");
        //}

        [HttpPost("wiki/save")]
        public IActionResult SaveWiki(object obj)
        {
            PersistWikiResponse resp = this.ServiceClient.Post(new PersistWikiRequest
            {
                Wiki = new Wiki
                {
                    Category = Request.Form["subtitle"],
                    Title = Request.Form["title"],
                    HTML = Request.Form["content"]
                }
            });

            return Redirect(string.Format("/wiki/view/{0}", resp.Wiki.Id));
        }

        //public IActionResult View_Wiki()
        //{
        //    ViewBag.contentlist = GetContent();
        //    return View();
        //}

        //public void StoreTitle()
        //{
        //    this.ServiceClient.Post(new PersistWikiRequest
        //    {
        //        Title = Request.Form["title"],
        //        Subtitle = Request.Form["subtitle"],
        //        Content = Request.Form["content"]
        //    });

        //}
        //public GetTitleResponse GetTitle()
        //{
        //    GetTitleResponse str = this.ServiceClient.Post<GetTitleResponse>(new GetTitleRequest());
        //    return str;
        //}
        //public void StoreContent()
        //{

        //}



        //public GetContentResponse GetContent()
        //{
        //    GetContentResponse str1 = this.ServiceClient.Post<GetContentResponse>(new GetContentRequest());
        //    return str1;
        //}

    }

    public class PublicWikiController : EbBaseExtController
    {
        public PublicWikiController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis)
        {
        }

        [HttpGet("wiki/view/{id}")]
        public IActionResult GetArticleById(string id)
        {
            GetWikiByIdResponse resp = this.ServiceClient.Get(new GetWikiByIdRequest()
            {
                Wiki = new Wiki()
                {
                    Id = Convert.ToInt32(id)
                }
            });

            ViewBag.Wiki = resp.Wiki;

            return View();
        }

        [HttpGet("wiki/view/list")]
        public IActionResult GetWikiList()
        {
            GetWikiListResponse resp = this.ServiceClient.Get(new GetWikiListRequest());
            ViewBag.WikiList = resp.WikiList;
            return View();
        }
    }
}