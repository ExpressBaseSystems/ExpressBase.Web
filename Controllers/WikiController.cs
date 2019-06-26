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

                if (resp == null)
                {
                    return Redirect("0");
                }
                else
                {
                    ViewBag.Wiki = resp.Wiki;
                    return View();
                }
            }
            else
            {
                ViewBag.Wiki = new Wiki() { Id = 0 };
                return View();
            }

        }

        [HttpGet("/apitest")]
        public IActionResult Test()
        {
            this.ServiceClient.BearerToken = "HxSLXUHuM5X_pZDW_0_SvbpupByEIlCw";
            ServiceClient.Get(new ApiTestReq());

            return Redirect("/statuscode/404"); ;
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
            int id = Convert.ToInt32(Request.Form["id"]);
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
                        Status = Request.Form["status"],
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
                        Tags = Request.Form["tagbox"],
                        Status = Request.Form["status"]
                    }

                });
                return Redirect(string.Format("/publicwiki/view/{0}", resp.Wiki.Id));
            }
        }


        [HttpGet("wiki/admin")]
        public IActionResult WikiAdmin(int id)
        {
            WikiAdminResponse resp = this.ServiceClient.Get(new WikiAdminRequest());
            ViewBag.WikiList = resp.WikiList;
            return View();
        }


        public object Admin_Wiki_list(string status)
        {
            Admin_Wiki_ListResponse resp = this.ServiceClient.Get(new Admin_Wiki_ListRequest()
            {
                Status = status
            });
            return resp.WikiList;
        }

        public object Publish_wiki(int wiki_id , string wiki_status)
        {
            if(wiki_status == "Draft" || wiki_status =="Unpublish")
            {
                Publish_wikiResponse resp = this.ServiceClient.Post(new Publish_wikiRequest()
                {
                    Wiki_id = wiki_id,
                    Status = "Publish"
                });
                return resp;
            }
            else
            {
                Publish_wikiResponse resp = this.ServiceClient.Post(new Publish_wikiRequest()
                {
                    Wiki_id = wiki_id,
                    Status = "Unpublish"
                });
                return resp;
            }
        }


        public object PublicView()
        {
                PublicViewResponse resp = this.ServiceClient.Get(new PublicViewRequest());
                return resp;
           
        }
    }
}