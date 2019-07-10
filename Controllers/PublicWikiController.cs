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
        

            [HttpGet("/docs")]
            public IActionResult GetWikiList()
            {
                GetWikiListResponse resp = this.ServiceClient.Get(new GetWikiListRequest());
                ViewBag.WikiList = resp.WikiList;
                return View();
            }

        [HttpGet("/docs/{id}")]
        public IActionResult GetWikiList2(string id)
        {
            return Redirect("/docs");
        }

        [HttpGet("/publicwiki/view/{id}")]
        public IActionResult GetArticleById(string id)
        {
            GetWikiByIdResponse resp = this.ServiceClient.Get(new GetWikiByIdRequest()
            {
                    Id = Convert.ToInt32(id)
            });

            ViewBag.Wiki = resp.Wiki;

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

        //    }
        //}


    }
}
