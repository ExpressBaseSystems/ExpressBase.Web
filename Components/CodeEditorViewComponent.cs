using ExpressBase.Common.Objects;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class CodeEditorViewComponent: ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public CodeEditorViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public async Task<IViewComponentResult> InvokeAsync(string dsobj, int tabnum, int type, string refid, string ssurl)
        {
            ViewBag.dsObj = dsobj;
            ViewBag.tabnum = tabnum;
            ViewBag.ObjType = type;
            ViewBag.Refid = refid;
            //ViewBag.SqlFns = Getsqlfns((int)EbObjectTypes.SqlFunction);
            ViewBag.ssurl = ssurl;
            //ViewBag.TableSchema = GetTableSchemaRequest();
            return View("codeEditor");
        }
        public List<string> Getsqlfns(int obj_type)
        {
            var fdresultlist = this.ServiceClient.Get<EbObjectObjListResponse>(new EbObjectObjListRequest { EbObjectType = obj_type });
            var fdrlist = fdresultlist.Data;
            List<string> objects_list = new List<string>();
            foreach (var element in fdrlist)
            {
                objects_list.Add(element.Name);
            }
            return objects_list;
        }

        public string GetTableSchemaRequest()
        {
            var res = this.ServiceClient.Get<GetTbaleSchemaResponse>(new GetTableSchemaRequest());
            string schema = JsonConvert.SerializeObject(res.Data);

            return schema;
        }

    }
}
