using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Data;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class CalendarController : EbBaseIntCommonController
    {
        public CalendarController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        public IActionResult CalendarView(string refid)
        {
            Type[] typeArray = typeof(EbCalendarWrapper).GetTypeInfo().Assembly.GetTypes();

            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.Calendar, typeof(EbCalendarWrapper), typeof(EbObject));

            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectType = _jsResult.EbObjectTypes;
            //EbObjectParticularVersionResponse Resp = this.ServiceClient.Post(new EbObjectParticularVersionRequest()
            //{
            //    RefId = refid
            //});
            ////ViewBag.Refid = refid;
            //ViewBag.VersionNumber = Resp.Data[0].VersionNumber;
            //ViewBag.ObjType = Resp.Data[0].EbObjectType;
            //ViewBag.dsObj = Resp.Data[0].Json;
            //ViewBag.Status = Resp.Data[0].Status;
            return View();
        }

        public CalendarDataResponse getData(CalendarDataRequest request)
        {
            try
            {
                Eb_Solution s_obj = GetSolutionObject(ViewBag.cid); 
                request.eb_Solution = s_obj;
                if (request.CalendarObjString != null)
                    request.CalendarObj = EbSerializers.Json_Deserialize<EbCalendarView>(request.CalendarObjString);
                request.CalendarObjString = null;
                request.UserInfo = this.LoggedInUser;

                CalendarDataResponse resultlist1 = null;
                try
                {
                    this.ServiceClient.Timeout = new TimeSpan(0, 5, 0);
                    resultlist1 = this.ServiceClient.Post(request);
                    resultlist1.CalendarReturnObjString = EbSerializers.Json_Serialize(resultlist1.CalendarReturnObj);
                }
                catch (Exception e)
                {
                    Console.WriteLine("Exception: " + e.ToString());
                }
                return resultlist1;
            }
            catch (Exception e)
            {
                Console.WriteLine("Calendar conroller getdata request Exception........." + e.StackTrace);
            }
            return null;
        }        

        public IActionResult GetFilterBody(string dvobjt, bool _flag)
        {
            var dsObject = EbSerializers.Json_Deserialize(dvobjt);
            dsObject.AfterRedisGet(this.Redis, this.ServiceClient);

            Eb_Solution s_obj = GetSolutionObject(ViewBag.cid); 
 
            return ViewComponent("CalendarCommon", new { dvobjt = dvobjt, _user = this.LoggedInUser, _sol = s_obj, wc = "dc",  flag = _flag });
        }
    }

    public class CalendarReturnColumns
    {
        public DVColumnCollection Columns { get; set; }

        public DVColumnCollection LinesColumns { get; set; }

        public DVColumnCollection KeyColumns { get; set; }

        public CalendarReturnColumns()
        {
            this.Columns = new DVColumnCollection();
            this.LinesColumns = new DVColumnCollection();
            this.KeyColumns = new DVColumnCollection();
        }
    }
}
