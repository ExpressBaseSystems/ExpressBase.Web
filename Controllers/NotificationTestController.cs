using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Common.Data;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Common;
using ExpressBase.Common.Objects;
using System.Reflection;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class NotificationTestController : EbBaseIntCommonController
    {
        public NotificationTestController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        public IActionResult Index()
        {
            return View();
        }

        public void NotifyLogOut()
        {
            NotifyLogOutResponse res = this.ServiceClient.Post<NotifyLogOutResponse>(new NotifyLogOutRequest
            {
            });
        }

        public void NotifyByUserId(string user_id)
        {
            NotifyByUserIDResponse res = this.ServiceClient.Post<NotifyByUserIDResponse>(new NotifyByUserIDRequest
            {
                UsersID = int.Parse(user_id)
            });
        }

        public void NotifyByUserRole(List<int> role_id)
        {
            NotifyByUserRoleResponse res = this.ServiceClient.Post<NotifyByUserRoleResponse>(new NotifyByUserRoleRequest
            {
                RoleID = role_id
            });
        }

        public void NotifyByUserGroup(List<int> grp_id)
        {
            NotifyByUserGroupResponse res = this.ServiceClient.Post<NotifyByUserGroupResponse>(new NotifyByUserGroupRequest
            {
                GroupId = grp_id
            });
        }

        public object GetNotificationFromDB(string notification_id)
        {
            GetNotificationFromDbResponse res = this.ServiceClient.Post<GetNotificationFromDbResponse>(new GetNotificationFromDbRequest
            {
                NotificationId = notification_id
            });
            return res;
        }

        public object GetCompleteNotificationDetailsFromDB()
        {
            return this.ServiceClient.Post(new GetNotificationsRequest { user = this.LoggedInUser }); 
        }       

        public IActionResult GetAllActions()
        {
            ListSqlJobsResponse resp = new ListSqlJobsResponse();
            string _roles = string.Join(",", this.LoggedInUser.Roles
                                            .Select(ro => string.Format("'{0}'", ro)));
            var query = string.Format(@"SELECT form_ref_id,description, id
                    FROM eb_my_actions
                    WHERE '{0}' = any(string_to_array(user_ids, ',')) OR
                     role_id IN(select id from eb_roles where role_name IN({1}));", this.LoggedInUser.UserId, _roles);

            List<Param> _params = new List<Param>();
            string[] arrayy = new string[] { "form_ref_id", "description", "id"};
            DVColumnCollection _DVColumnCollection = GetColumnsForActions(arrayy);
            EbDataVisualization Visualization = new EbTableVisualization { Sql = query,Columns = _DVColumnCollection, AutoGen = false, IsPaging = true };
            resp.Visualization = EbSerializers.Json_Serialize(Visualization);
            var x = EbSerializers.Json_Serialize(resp);
            ViewBag.data = resp;

            var typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DVBuilder, typeof(EbDataVisualizationObject));

            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectType = _jsResult.EbObjectTypes;
            ViewBag.TypeRegister = _jsResult.TypeRegister;
            return View();
        }

        public DVColumnCollection GetColumnsForActions(string[] strArray)
        {
            var Columns = new DVColumnCollection();
            try
            {
                foreach (string str in strArray)
                {
                    DVBaseColumn _col = null;
                    if (str == "form_ref_id")
                    {
                        _col = new DVStringColumn { Data = 0, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true, RenderAs = StringRenderType.Link };
                    }
                    if (str == "description")
                        _col = new DVStringColumn { Data = 1, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    if (str == "id")
                        _col = new DVNumericColumn { Data = 2, Name = str, sTitle = str, Type = EbDbTypes.Int32, bVisible = false };
                    _col.Name = str;
                    _col.RenderType = _col.Type;
                    _col.ClassName = "tdheight";
                    _col.Font = null;
                    _col.Align = Align.Left;
                    Columns.Add(_col);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("no coloms" + e.StackTrace);
            }

            return Columns;
        }

    }
}
