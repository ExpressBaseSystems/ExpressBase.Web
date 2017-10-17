using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Common.Objects;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class Eb_ObjectController : EbBaseNewController
    {
        public Eb_ObjectController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        public IActionResult Index()
        {
            return View();
        }
        public string CommitEbObject(string _refid, string _json, string _changeLog, string _rel_obj, string _tags)
        {
            string refid;
            var obj = EbSerializers.Json_Deserialize(_json);
            if (string.IsNullOrEmpty(_refid))
            {
                var ds = new EbObject_Create_New_ObjectRequest();
                ds.Name = obj.Name;
                ds.Description = obj.Description;
                ds.Json = _json;
                ds.Status = ObjectLifeCycleStatus.Dev;
                ds.Relations = _rel_obj;
                ds.IsSave = false;
                ds.Tags = _tags;

                var res = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
                refid = res.RefId;

            }
            else
            {
                var ds = new EbObject_CommitRequest();
                ds.Name = obj.Name;
                ds.Description = obj.Description;
                ds.Json = _json;
                ds.Relations = _rel_obj;
                ds.RefId = _refid;
                ds.ChangeLog = _changeLog;
                ds.Tags = _tags;
                var res = ServiceClient.Post<EbObject_CommitResponse>(ds);
                refid = res.RefId;
            }

            return refid;
        }

        public string SaveEbObject(string _refid, string _json, string _rel_obj, string _tags)
        {
            string refid;
            var obj = EbSerializers.Json_Deserialize(_json);
            if (string.IsNullOrEmpty(_refid))
            {
                var ds = new EbObject_Create_New_ObjectRequest();
                ds.Name = obj.Name;
                ds.Description = obj.Description;
                ds.Json = _json;
                ds.Status = ObjectLifeCycleStatus.Dev;
                ds.Relations = _rel_obj;
                ds.IsSave = true;
                ds.Tags = _tags;

                var res = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
                refid = res.RefId;
            }
            else
            {
                var ds = new EbObject_SaveRequest();
                ds.RefId = _refid;
                ds.Name = obj.Name;
                ds.Description = obj.Description;
                ds.Json = _json;
                ds.Relations = _rel_obj;
                ds.Tags = _tags;

                var res = this.ServiceClient.Post<EbObject_SaveResponse>(ds);
                refid = res.RefId;
            }
            return refid;
        }
        public IActionResult GetLifeCycle(int _tabNum, string cur_status, string refid)
        {
            return ViewComponent("ObjectLifeCycle", new { _tabnum = _tabNum , _cur_status = cur_status , _refid  = refid });
        }

    }
}
