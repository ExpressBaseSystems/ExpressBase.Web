using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects.ServiceStack_Artifacts;

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
            return this.ServiceClient.Post(new GetNotificationsRequest());
        }
        
    }
}
