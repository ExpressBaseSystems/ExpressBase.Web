using System.Collections.Generic;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Newtonsoft.Json;

namespace ExpressBase.Web.Controllers
{
    public class NotificationsController : EbBaseIntCommonController
    {
        public NotificationsController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        [HttpGet]
        public string GetNotifications()
        {
            GetNotificationsResponse GetNf = this.ServiceClient.Post(new GetNotificationsRequest());
            return JsonConvert.SerializeObject(GetNf);
        }

        public void NotifyLogOut()
        {
            NotifyLogOutResponse res = this.ServiceClient.Post<NotifyLogOutResponse>(new NotifyLogOutRequest { });
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

        public int ClearAllNotifications(List<string> notificationLst)
        {
            for (var i = 0; i < notificationLst.Count; i++)
            {
                GetNotificationFromDB(notificationLst[i]);
            }
            return 1;
        }

        public IActionResult GetAllActions()
        {
            GetAllActionsResponse res = this.ServiceClient.Post<GetAllActionsResponse>(new GetAllActionsRequest());
            ViewBag.MyActionsData = JsonConvert.SerializeObject(res.PendingActions);
            return View();
        }

        public IActionResult GetAllNotifications()
        {
            GetAllNotificationsResponse res = this.ServiceClient.Post<GetAllNotificationsResponse>(new GetAllNotificationsRequest());
            ViewBag.Notifications = JsonConvert.SerializeObject(res.Notification);
            return View();
        }
    }
}
