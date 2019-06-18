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
    public class WikiController : EbBaseIntCommonController
    {
        public WikiController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        [HttpGet("wiki/add/{id}")]
        public IActionResult AddWiki(int id)

        {
            ViewBag.id = id;
            if (id > 0)
            {
                GetWikiByIdResponse resp = this.ServiceClient.Get(new GetWikiByIdRequest()
                {       
                        Id = Convert.ToInt32(id)
                });

                if(resp == null)
                {
                   return Redirect("0");
                }
                else
                {
                    ViewBag.Wiki = resp.Wiki;
                    return View();
                }       
            }
            else {
                ViewBag.Wiki = new Wiki() { Id = 0 };
                return View(); }
            
        }


        //[HttpGet("wiki/add/{}")]
        //public IActionResult EditWiki(string id)
        //{
        //    GetWikiByIdResponse resp = this.ServiceClient.Get(new GetWikiByIdRequest()
        //    {
        //        Wiki = new Wiki()
        //        {
        //            Id = Convert.ToInt32(id)
        //        }
        //    });

        //    ViewBag.Wiki = resp.Wiki;
        //    return View();
        //}

        [HttpPost("wiki/save")]
        public IActionResult SaveWiki(object obj)
        {
            int id = Convert.ToInt32( Request.Form["id"]);
            if (id > 0)
            {
                UpdateWikiResponse resp = this.ServiceClient.Post(new UpdateWikiRequest
                {
                    Wiki = new Wiki
                    {
                        Category = Request.Form["category"],
                        Title = Request.Form["title"],
                        HTML = Request.Form["content"],
                        CreatedBy = ViewBag.UId,
                        Tags = Request.Form["tagbox"],
                        Id = id
                    }
                });
                
                return Redirect(string.Format("/publicwiki/view/{0}", resp.Wiki.Id));
            }
            else
            {
                 PersistWikiResponse resp = this.ServiceClient.Post(new PersistWikiRequest
                {
                    Wiki = new Wiki
                    {
                        Category = Request.Form["category"],
                        Title = Request.Form["title"],
                        HTML = Request.Form["content"],
                        CreatedBy = ViewBag.UId,
                        Tags = Request.Form["tagbox"]
                    }
                 
                });
                return Redirect(string.Format("/publicwiki/view/{0}", resp.Wiki.Id));
            }
        }
            
   }
}