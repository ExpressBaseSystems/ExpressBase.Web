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
            string _roles = string.Join(",", this.LoggedInUser.RoleIds.ToArray());

            var query = string.Format(@" SELECT
	                    a.id,a.form_ref_id,a.form_data_id,a.description,a.from_datetime,u.fullname,rol_.roles_id,rol_.roles as role_name
                    FROM 
	                    eb_my_actions a
                    LEFT JOIN
	                    eb_users u
                    ON
	                     u.id = ANY (string_to_array(user_ids,',')::int[])
                    LEFT JOIN
                    (
	                    SELECT 
		                    a.role_ids,string_agg(r.role_name,',') roles,string_agg(r.id::text,',') roles_id
	                    FROM 
		                    eb_my_actions a, eb_roles r
	                    WHERE 
		                    r.id = ANY (string_to_array(role_ids,',')::int[]) 
		                    AND r.id =ANY(string_to_array('{1}',',')::int[])
	                    GROUP BY
		                    a.role_ids
                    )rol_
                    ON rol_.role_ids = a.role_ids
                    WHERE
	                    ({0} = ANY(string_to_array(a.user_ids,',')::int[]) AND u.id = {0})
	                    OR
	                    (string_to_array(a.role_ids,',')::int[] && string_to_array('{1}',',')::int[]);", this.LoggedInUser.UserId, _roles);

            List<Param> _params = new List<Param>();
            string[] arrayy = new string[] { "id", "form_ref_id", "form_data_id", "description", "from_datetime", "fullname", "roles_id", "role_name" };
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
                     if (str == "id")
                        _col = new DVNumericColumn { Data = 0, Name = str, sTitle = str, Type = EbDbTypes.Int32, bVisible = false };
                    else if (str == "form_ref_id")
                        _col = new DVStringColumn { Data = 1, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = false };
                    else if (str == "form_data_id")
                        _col = new DVNumericColumn { Data = 2, Name = str, sTitle = str, Type = EbDbTypes.Int32, bVisible = false };
                    else if (str == "description")
                        _col = new DVStringColumn { Data = 3, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true,
                            RenderAs = StringRenderType.LinkFromColumn,RefidColumn = Columns.Get("form_ref_id"),IdColumn = Columns.Get("form_data_id")
                        };
                    else if(str == "from_datetime")
                        _col = new DVDateTimeColumn { Data = 4, Name = str, sTitle = str, Type = EbDbTypes.Date, bVisible = true,
                            Format = DateFormat.DateTime,ConvretToUsersTimeZone = true
                        };
                    else if (str == "fullname")
                        _col = new DVStringColumn { Data = 5, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    else if (str == "roles_id")
                        _col = new DVStringColumn { Data = 6, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = false };
                    else if (str == "role_name")
                        _col = new DVStringColumn { Data = 7, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
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

        public IActionResult GetAllNotifications()
        {
            ListSqlJobsResponse resp = new ListSqlJobsResponse();

            string query = string.Format(@"
                                                SELECT notification_id, notification, created_at  
                                                FROM eb_notifications 
                                                WHERE user_id = '{0}'
                                                AND message_seen ='F'
                                                ORDER BY created_at DESC;", this.LoggedInUser.UserId);

            List<Param> _params = new List<Param>();
            string[] array = new string[] { "notification_id", "notification", "created_at" };
            DVColumnCollection _DVColumnCollection = GetColumnsForNotifications(array);
            EbDataVisualization Visualization = new EbTableVisualization { Sql = query, Columns = _DVColumnCollection, AutoGen = false, IsPaging = true };
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

        public DVColumnCollection GetColumnsForNotifications(string[] strArray)
        {
            var Columns = new DVColumnCollection();
            try
            {
                foreach (string str in strArray)
                {
                    DVBaseColumn _col = null;
                    if (str == "notification_id")
                        _col = new DVNumericColumn { Data = 0, Name = str, sTitle = str, Type = EbDbTypes.Int32, bVisible = false };
                    else if (str == "notification")
                        _col = new DVStringColumn { Data = 1, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    else if (str == "created_at")
                        _col = new DVDateTimeColumn
                        {
                            Data = 2,
                            Name = str,
                            sTitle = str,
                            Type = EbDbTypes.Date,
                            bVisible = true,
                            Format = DateFormat.DateTime,
                            ConvretToUsersTimeZone = true
                        };
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
