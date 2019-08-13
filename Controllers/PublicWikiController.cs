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
namespace ExpressBase.Web.Controllers
{
    public class PublicWikiController : EbBaseExtController
    {
        public PublicWikiController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis)
        {
        }

        [HttpPost]
        public object GetWiki(string wiki_id)
        {
            GetWikiResponse resp = this.ServiceClient.Get(new GetWikiRequest()
            {
                Id = Convert.ToInt32(wiki_id)
            });
            return resp.Wiki;
        }


        [HttpGet("/Wiki")]
        public IActionResult GetWikiList()
        {
            GetWikiListResponse resp = this.ServiceClient.Get(new GetWikiListRequest());
            Console.WriteLine("Info: GetWikiList Wiki Count: " + resp.WikiList.Count);
            ViewBag.WikiList = resp.WikiList;
            ViewBag.WikiCat = resp.WikiCat;
            return View();
        }

        [HttpGet("/Wiki/{id}")]
        public IActionResult GetWikiListRedirect1(string id)
        {
            return Redirect("/Wiki");
        }

        [HttpGet("/Wiki/{category}/{wikiname}")]
        public IActionResult GetWikiListRedirect2(string category , string wikiname)
        {
            TempData["Category"] = category; 
            TempData["WikiName"] = wikiname;
            return Redirect("/Wiki"); 
        }

        [HttpGet("/Wiki/{category}/{id}/{title}")]
        public IActionResult GetArticleById(string id)
        {
            GetWikiByIdResponse resp = this.ServiceClient.Get(new GetWikiByIdRequest()
            {
                Id = Convert.ToInt32(id)
            });

            ViewBag.Wiki = resp.Wiki;
            var location = new Uri($"{Request.Scheme}s://{Request.Host}{Request.Path}{Request.QueryString}");
            ViewBag.Url = location.AbsoluteUri;
              object TagObject;
            TagObject = resp.Wiki.Tags.Split(',');
            ViewBag.TagObject = TagObject;
            ViewBag.Title = resp.Wiki.Title + " | EXPRESSbase Systems";        
            return View();
        }


        public object GetWikiBySearch(string search_wiki)
        {
            GetWikiBySearchResponse resp = this.ServiceClient.Get(new GetWikiBySearchRequest()
            {
                Wiki_Search = search_wiki
            });
            return resp.WikiListBySearch;
        }

        public IActionResult WikiLayout()
        {
            return View();
        }
        public IActionResult Edit()
        {
            return View();
        }
        //public bool UserReviewRate(string userreview)
        //{
        //    UserReviewRateResponse = new UserReviewRateRequest()
        //    {
        //     UserReview = Convert.ToInt32(userreview);
        //    }
        //}


    }
}
