using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Security;

namespace ExpressBase.Web.Filters
{
    public static class UserExtensions
    {
        public static bool HasFormPermission(this User UserObject, string RefId, string ForWhat, int LocId, string console = "uc")
        {
            if (console != RoutingConstants.UC)
                return false;
            if (UserObject.Roles.Contains(SystemRoles.SolutionOwner.ToString()) ||
                UserObject.Roles.Contains(SystemRoles.SolutionAdmin.ToString()) ||
                UserObject.Roles.Contains(SystemRoles.SolutionPM.ToString()))
                return true;

            EbOperation Op = EbWebForm.Operations.Get(ForWhat);
            if (!Op.IsAvailableInWeb)
                return false;

            try
            {
                string Ps = string.Concat(RefId.Split("-")[2].PadLeft(2, '0'), '-', RefId.Split("-")[3].PadLeft(5, '0'), '-', Op.IntCode.ToString().PadLeft(2, '0'));
                string t = UserObject.Permissions.FirstOrDefault(p => p.Substring(p.IndexOf("-") + 1).Equals(Ps + ":" + LocId) ||
                            (p.Substring(p.IndexOf("-") + 1, 11).Equals(Ps) && p.Substring(p.LastIndexOf(":") + 1).Equals("-1")));
                if (!string.IsNullOrEmpty(t))
                    return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(string.Format("Exception when checking user permission: {0}\nRefId = {1}\nOperation = {2}\nLocId = {3}", e.Message, RefId, ForWhat, LocId));
            }

            return false;
        }
    }
}
