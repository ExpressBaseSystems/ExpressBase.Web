using ExpressBase.Common;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Singletons;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security.Core;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web.Filters;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace ExpressBase.Web.Controllers
{
    public class SecurityController : EbBaseIntCommonController
    {
        public SecurityController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [EbBreadCrumbFilter("Security/type")]
        public IActionResult CommonList(string type, string show)
        {
            if (!HasPemissionToSecurity())
                return Redirect("/StatusCode/401");

            IServiceClient client = this.ServiceClient;
            type = type.ToLower();
            ViewBag.ListType = type;
            if (type == "users")
            {
                ViewBag.DisableNewUser = "false";
                GetUsersResponse1 fr = this.ServiceClient.Get<GetUsersResponse1>(new GetUsersRequest1() { Show = show });
                ViewBag.dict = JsonConvert.SerializeObject(fr.Data);
                Eb_Solution _solu = GetSolutionObject(ViewBag.Cid);
                if (_solu.PlanUserCount <= _solu.NumberOfUsers)
                    ViewBag.DisableNewUser = "true";
            }
            else if (type == "roles")
            {
                GetRolesResponse1 fr = this.ServiceClient.Get<GetRolesResponse1>(new GetRolesRequest1());
                ViewBag.dict = JsonConvert.SerializeObject(fr.Data);
            }
            else if (type == "usergroups")
            {
                GetUserGroupResponse1 fr = this.ServiceClient.Get<GetUserGroupResponse1>(new GetUserGroupRequest1());
                ViewBag.dict = JsonConvert.SerializeObject(fr.Data);
            }
            else if (type == "anonymoususers")
            {
                GetAnonymousUserResponse fr = this.ServiceClient.Get<GetAnonymousUserResponse>(new GetAnonymousUserRequest());
                ViewBag.dict = JsonConvert.SerializeObject(fr.Data);
            }
            else if (type == "usertypes")
            {
                GetUserTypesResponse fr = this.ServiceClient.Get<GetUserTypesResponse>(new GetUserTypesRequest());
                ViewBag.dict = JsonConvert.SerializeObject(fr.UserTypes);
            }
            if (ViewBag.isAjaxCall)
                return PartialView();
            else
                return View();
        }

        private bool HasPemissionToSecurity()
        {
            if (ViewBag.wc == RoutingConstants.UC)
            {
                if (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
                    return true;
                if (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString()))
                    return true;
            }
            return false;
        }

        //--------------MY PROFILE------------------------------------------

        [EbBreadCrumbFilter("Security")]
        public IActionResult MyProfile()
        {
            if (ViewBag.wc == RoutingConstants.TC)
                return Redirect("/MyProfile");
            string mode = "user";
            if (isTenant())
                mode = "tenant";
            GetMyProfileResponse fr = this.ServiceClient.Get<GetMyProfileResponse>(new GetMyProfileRequest
            {
                WC = ViewBag.wc,
                DBIds = this.LoggedInUser.GetDashBoardIds(),
                IsSolutionOwner = (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) || this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString())) ? true : false

            });

            Eb_Solution _solu = GetSolutionObject(ViewBag.Cid);

            Dictionary<string, int> _locs = new Dictionary<string, int>();

            if (this.LoggedInUser.LocationIds.Contains(-1))
            {
                foreach (KeyValuePair<int, EbLocation> entry in _solu.Locations)
                {
                    string st = entry.Value.ShortName + " - " + entry.Value.LongName;
                    if (!_locs.ContainsKey(st))
                        _locs.Add(st, entry.Key);
                    else if (!_locs.ContainsKey($"{st}[{entry.Key}]"))
                        _locs.Add($"{st}[{entry.Key}]", entry.Key);
                }
            }
            else
            {
                foreach (int id in this.LoggedInUser.LocationIds)
                {
                    if (_solu.Locations.ContainsKey(id))
                    {
                        string st = _solu.Locations[id].ShortName + " - " + _solu.Locations[id].LongName;
                        if (!_locs.ContainsKey(st))
                            _locs.Add(st, id);
                        else if (!_locs.ContainsKey($"{st}[{id}]"))
                            _locs.Add($"{st}[{id}]", id);
                    }
                }
            }

            ViewBag.LocsData = _locs;
            ViewBag.UserData = fr.UserData;
            ViewBag.RefIds = fr.RefIds;
            ViewBag.Mode = mode;
            return View();
        }

        [EbBreadCrumbFilter("My Profile")]
        [HttpGet("MyProfile")]
        public IActionResult MyProfile_Tenant()
        {
            if (ViewBag.wc == RoutingConstants.TC)
            {
                GetMyProfileResponse fr = this.ServiceClient.Get<GetMyProfileResponse>(new GetMyProfileRequest { WC = ViewBag.wc });
                ViewBag.UserData = fr.UserData;
                ViewBag.Title = "My Profile";
                return View();
            }
            return Redirect("/StatusCode/404");
        }

        public bool SaveMyProfile(string UserData)
        {
            bool isTenantAsUser = false;
            if (isTenant() && (ViewBag.wc == RoutingConstants.UC || ViewBag.wc == RoutingConstants.DC))
                isTenantAsUser = true;
            SaveMyProfileResponse fr = this.ServiceClient.Get<SaveMyProfileResponse>(new SaveMyProfileRequest { UserData = UserData, WC = ViewBag.wc, PreferenceOnly = isTenantAsUser });
            return (fr.RowsAffectd > 0);
        }

        public bool ChangeUserPassword(string OldPwd, string NewPwd)
        {
            if ((isTenant() && (ViewBag.wc == RoutingConstants.UC || ViewBag.wc == RoutingConstants.DC)) || this.LoggedInUser.UserId <= 1)
                return false;
            ChangeUserPasswordResponse resp = this.ServiceClient.Post<ChangeUserPasswordResponse>(new ChangeUserPasswordRequest { OldPwd = OldPwd, NewPwd = NewPwd, Email = ViewBag.email, WC = ViewBag.wc });
            return resp.isSuccess;
        }

        private bool isTenant()
        {
            foreach (var item in Enum.GetNames(typeof(SystemRoles)))
                if (this.LoggedInUser.Roles.Contains(item))
                    return true;
            return false;
        }


        //--------------MANAGE USER START------------------------------------

        [EbBreadCrumbFilter("Security")]
        public IActionResult ManageUser(int itemid, int Mode, string AnonymousUserInfo)
        {
            if (!HasPemissionToSecurity())
                return Redirect("/StatusCode/401");

            //Mode - CreateEdit = 1, View = 2, MyProfileView = 3
            ViewBag.Culture = CultureHelper.CulturesAsJson;
            ViewBag.TimeZone = CultureHelper.TimezonesAsJson;
            ViewBag.MU_Mode = Mode == 0 ? 1 : Mode;

            //var ip2 = HttpContext.Features.Get<IHttpConnectionFeature>()?.RemoteIpAddress?.ToString();
            //string ip =  this.Request.HttpContext.Connection.RemoteIpAddress.ToString();
            //string ip3 = GetRequestIP();

            //HttpClient client = new HttpClient(); 
            ////string result = await client.GetStringAsync("http://freegeoip.net/json");
            //string result = await client.GetStringAsync("http://ip-api.com/json");
            //IpApiResponse ooo = JsonConvert.DeserializeObject<IpApiResponse>(result);


            Dictionary<string, string> dict = new Dictionary<string, string>();
            //List<EbRole> Sysroles = new List<EbRole>();
            //foreach (var role in Enum.GetValues(typeof(SystemRoles)))
            //{
            //	Sysroles.Add(new EbRole() { Name = role.ToString(), Description = "SystemRole_" + role, Id = (int)role });
            //}
            //ViewBag.SystemRoles = JsonConvert.SerializeObject(Sysroles);
            GetManageUserResponse fr = this.ServiceClient.Get<GetManageUserResponse>(new GetManageUserRequest { Id = itemid, RqstMode = Mode, SolnId = ViewBag.cid });
            foreach (var role in Enum.GetValues(typeof(SystemRoles)))
            {
                fr.Roles.Add(new EbRole()
                {
                    Name = role.ToString(),
                    Description = "SYSTEM ROLE",
                    Id = (int)role
                });
            }
            ViewBag.Roles = JsonConvert.SerializeObject(fr.Roles);
            ViewBag.EBUserGroups = JsonConvert.SerializeObject(fr.EbUserGroups);
            ViewBag.Role2RoleList = JsonConvert.SerializeObject(fr.Role2RoleList);
            ViewBag.UserTypes = fr.UserTypes;
            List<string> UserStatus = new List<string>();
            foreach (var status in Enum.GetValues(typeof(EbUserStatus)))
            {
                UserStatus.Add(status.ToString());
            }
            ViewBag.UserStatusList = UserStatus;

            if (Mode == 3)
            {
                itemid = Convert.ToInt32(fr.UserData["id"]);
            }

            if (itemid == 1)
            {
                dict = JsonConvert.DeserializeObject<Dictionary<string, string>>(AnonymousUserInfo);
                ViewBag.U_Info = dict;
            }
            else if (itemid > 1)
            {
                if (fr.UserData.Count > 0)
                {
                    ViewBag.U_Info = fr.UserData;
                    ViewBag.U_Roles = JsonConvert.SerializeObject(fr.UserRoles);
                    ViewBag.U_Groups = JsonConvert.SerializeObject(fr.UserGroups);
                    ViewBag.LocConstraint = JsonConvert.SerializeObject(fr.LocConstraint);
                }
                else
                {
                    ViewBag.U_Roles = "";
                    ViewBag.U_Groups = "";
                    itemid = 0;
                }
            }
            else
            {
                ViewBag.U_Roles = "";
                ViewBag.U_Groups = "";
            }
            ViewBag.itemid = itemid;
            //for showing login activity log
            LoginActivityResponse Lar = this.ServiceClient.Post<LoginActivityResponse>(new LoginActivityRequest
            {
                UserObject = this.LoggedInUser,
                Alluser = false,
                TargetUser = itemid
            });
            ActivityLogin(Lar);


            return View();
        }

        public int SaveUser(int userid, string roles, string usergroups, string usrinfo)
        {
            Dictionary<string, string> Dict = JsonConvert.DeserializeObject<Dictionary<string, string>>(usrinfo);

            if (!HasPemissionToSecurity())
            {
                return 0;
            }
            else//temp fix
            {
                List<int> roleids = new List<int>();
                if (this.LoggedInUser.UserId == userid)
                {
                    if (!string.IsNullOrEmpty(Dict["roles"]))//for avoiding format exception in next line
                        roleids = Array.ConvertAll(Dict["roles"].Split(','), int.Parse).ToList();
                    if (!roleids.Contains((int)SystemRoles.SolutionOwner))
                    {
                        roleids.Add((int)SystemRoles.SolutionOwner);
                        Dict["roles"] = String.Join(",", roleids);
                    }
                }
            }

            if (userid <= 0 && ViewBag.Env == "Production")
            {
                Eb_Solution _solu = GetSolutionObject(ViewBag.Cid);
                if (_solu.PlanUserCount <= _solu.NumberOfUsers)
                    return -1;
            }

            SaveUserResponse res = this.ServiceClient.Post<SaveUserResponse>(new SaveUserRequest
            {
                Id = userid,
                FullName = Dict["fullname"],
                NickName = Dict["nickname"],
                EmailPrimary = Dict["email"].Trim().ToLower(),
                Password = Dict["pwd"],
                EmailSecondary = Dict["alternateemail"],
                DateOfBirth = Dict["dob"],
                Sex = Dict["sex"],
                PhonePrimary = Dict["phoneprimary"],
                PhoneSecondary = Dict["phonesecondary"],
                LandPhone = Dict["landline"],
                PhoneExtension = Dict["extension"],
                FbId = Dict["fbid"],
                FbName = Dict["fbname"],
                Roles = string.IsNullOrEmpty(Dict["roles"]) ? string.Empty : Dict["roles"],
                UserGroups = string.IsNullOrEmpty(Dict["usergroups"]) ? string.Empty : Dict["usergroups"],
                StatusId = Dict["statusid"],
                Hide = Dict["hide"],
                AnonymousUserId = Convert.ToInt32(Dict["anonymoususerid"]),
                Preference = Dict["preference"],
                UserType = Convert.ToInt32(Dict["eb_user_types_id"]),
                LocationAdd = Dict["loc_add"],
                LocationDelete = Dict["loc_delete"],
                ForceResetPassword = (Dict["forceresetpw"] == "true") ? "T" : "F"
            });
            return res.id;
        }

        public bool isValidEmail(string reqEmail)
        {
            UniqueCheckResponse temp = this.ServiceClient.Post<UniqueCheckResponse>(new UniqueCheckRequest { email = reqEmail.Trim().ToLower() });
            return temp.unrespose;
        }

        public bool ResetUserPassword(int userid, string username, string NewPwd)
        {
            if (!HasPemissionToSecurity())
                return false;
            else
            {
                ResetUserPasswordResponse resp = this.ServiceClient.Post<ResetUserPasswordResponse>(new ResetUserPasswordRequest { Id = userid, Email = username, NewPwd = NewPwd });
                return resp.isSuccess;
            }
        }

        public int DeleteUser(int userid)
        {
            if (!HasPemissionToSecurity())
                return 0;
            else
            {
                DeleteUserResponse resp = this.ServiceClient.Post<DeleteUserResponse>(new DeleteUserRequest { Id = userid });
                return resp.Status;
            }
        }


        //--------------MANAGE ANONYMOUS USER START------------------------------------
        [EbBreadCrumbFilter("Security")]
        public IActionResult ManageAnonymousUser(int itemid)
        {
            if (!HasPemissionToSecurity())
                return Redirect("/StatusCode/401");

            return View();
        }

        public string GetAnonymousUserInfo(int userid)
        {
            if (!HasPemissionToSecurity())
                return string.Empty;
            GetManageAnonymousUserResponse temp = this.ServiceClient.Post<GetManageAnonymousUserResponse>(new GetManageAnonymousUserRequest { Id = userid });
            return JsonConvert.SerializeObject(temp.UserData);
        }

        public int UpdateAnonymousUserInfo(int itemid, string name, string email, string phone, string remarks)
        {
            if (!HasPemissionToSecurity())
                return 0;
            UpdateAnonymousUserResponse temp = this.ServiceClient.Post<UpdateAnonymousUserResponse>(new UpdateAnonymousUserRequest { Id = itemid, FullName = name.IsNullOrEmpty() ? "" : name, EmailID = email.IsNullOrEmpty() ? "" : email, PhoneNumber = phone.IsNullOrEmpty() ? "" : phone, Remarks = remarks.IsNullOrEmpty() ? "" : remarks });
            return temp.RowAffected;
        }


        public string GetUserTypes(int typeid)
        {
            if (!HasPemissionToSecurity())
                return string.Empty;
            GetUserTypesResponse temp = this.ServiceClient.Get<GetUserTypesResponse>(new GetUserTypesRequest { Id = typeid });
            return JsonConvert.SerializeObject(temp.UserTypes);
        }

        [EbBreadCrumbFilter("Security")]
        public IActionResult ManageUserTypes(int itemid)
        {
            if (!HasPemissionToSecurity())
                return Redirect("/StatusCode/401");

            GetManageUserGroupResponse fr = this.ServiceClient.Get<GetManageUserGroupResponse>(new GetManageUserGroupRequest { id = itemid, SolnId = ViewBag.cid, Timezone = this.LoggedInUser.Preference.TimeZone });
            ViewBag.SelectedUserGroupInfo = JsonConvert.SerializeObject(fr.SelectedUserGroupInfo);
            ViewBag.UsersList = JsonConvert.SerializeObject(fr.UsersList);
            ViewBag.IpConsList = JsonConvert.SerializeObject(fr.IpConsList);
            ViewBag.DtConsList = JsonConvert.SerializeObject(fr.DtConsList);
            return View();
        }

        //----------------MANAGE USERGROUPS START----------------------------
        //[HttpGet]
        //public IActionResult ManageUserGroups()
        //{
        //	return View();
        //}

        //[HttpPost]
        [EbBreadCrumbFilter("Security")]
        public IActionResult ManageUserGroups(int itemid)
        {
            if (!HasPemissionToSecurity())
                return Redirect("/StatusCode/401");

            GetManageUserGroupResponse fr = this.ServiceClient.Get<GetManageUserGroupResponse>(new GetManageUserGroupRequest { id = itemid, SolnId = ViewBag.cid, Timezone = this.LoggedInUser.Preference.TimeZone });
            ViewBag.SelectedUserGroupInfo = JsonConvert.SerializeObject(fr.SelectedUserGroupInfo);
            ViewBag.UsersList = JsonConvert.SerializeObject(fr.UsersList);
            ViewBag.IpConsList = JsonConvert.SerializeObject(fr.IpConsList);
            ViewBag.DtConsList = JsonConvert.SerializeObject(fr.DtConsList);
            return View();
        }

        public int SaveUserGroup(int _id, string _userGroupInfo)
        {
            if (!HasPemissionToSecurity())
                return 0;

            Dictionary<string, string> Dict = JsonConvert.DeserializeObject<Dictionary<string, string>>(_userGroupInfo);
            SaveUserGroupResponse res = this.ServiceClient.Post<SaveUserGroupResponse>(new SaveUserGroupRequest
            {
                Id = _id,
                Name = Dict["name"],
                Description = Dict["description"],
                Users = string.IsNullOrEmpty(Dict["users"]) ? string.Empty : Dict["users"],
                IpConstraintNw = Dict["new_constraint_ip"],
                IpConstraintOld = Dict["deleted_ipconst_id"],
                DtConstraintNw = Dict["new_constraint_dt"],
                DtConstraintOld = Dict["deleted_ipconst_dt"],
                UsersTimezone = this.LoggedInUser.Preference.TimeZone
            });
            return res.id;
        }

        //---------------MANAGE ROLES START----------------------------------
        [EbBreadCrumbFilter("Security")]
        public IActionResult ManageRoles(int itemid)
        {
            if (!HasPemissionToSecurity())
                return Redirect("/StatusCode/401");
            ViewBag.itemid = itemid;
            return View();
        }

        //GET  PERMISSION OPERATIONS AS JS
        private string GetPermissionOperationsAsJs()
        {
            Assembly assembly = Assembly.GetAssembly(typeof(EbWebForm)); //DO NOT CHANGE
            List<Eb_ObjectTypeOperations> _listObj = new List<Eb_ObjectTypeOperations>();

            foreach (EbObjectType objectType in EbObjectTypes.Enumerator)
            {
                if (objectType.IsUserFacing)
                {
                    var eOperations = assembly.GetType(string.Format("ExpressBase.Objects.Eb{0}", objectType.Name))
                    .GetField("Operations").GetValue(null);

                    if (eOperations != null)
                    {
                        Eb_ObjectTypeOperations _obj = new Eb_ObjectTypeOperations { Op_Id = objectType.IntCode, Op_Name = objectType.Name, Operations = new List<string>() };
                        foreach (EbOperation Op in (eOperations as EbOperations).Enumerator)
                            _obj.Operations.Add(Op.ToString());

                        _listObj.Add(_obj);
                    }
                }
            }

            return EbSerializers.Json_Serialize(_listObj);
        }

        public object GetUserDetails(string srchTxt)
        {
            if (!HasPemissionToSecurity())
                return string.Empty;
            GetUserDetailsResponse fr = this.ServiceClient.Get<GetUserDetailsResponse>(new GetUserDetailsRequest { SearchText = srchTxt, SolnId = ViewBag.cid });
            return fr.UserList;
        }

        public string SaveRole(int _roleId, string _roleName, string _roleDesc, bool _isAnonymous, int _appId, string _permission, string _role2role, string _users, string _locations)
        {
            if (!HasPemissionToSecurity())
                return "Failed";
            if (Enum.TryParse(typeof(SystemRoles), _roleName.Trim().ToLower(), true, out object r))
                return "Failed";

            Dictionary<string, object> Dict = new Dictionary<string, object>();
            string return_msg;
            Dict["roleid"] = _roleId;
            Dict["applicationid"] = _appId;
            Dict["role_name"] = _roleName;
            Dict["Description"] = _roleDesc;
            Dict["IsAnonymous"] = _isAnonymous ? "T" : "F";
            Dict["users"] = string.IsNullOrEmpty(_users) ? string.Empty : _users;
            Dict["permission"] = string.IsNullOrEmpty(_permission) ? string.Empty : _permission;
            Dict["dependants"] = string.IsNullOrEmpty(_role2role) ? string.Empty : _role2role;
            Dict["locations"] = string.IsNullOrEmpty(_locations) ? string.Empty : _locations;

            SaveRoleResponse res = this.ServiceClient.Post<SaveRoleResponse>(new SaveRoleRequest { Colvalues = Dict });
            if (res.id == 0)
                return_msg = "Success";
            else if (res.id == -1)
                return_msg = "Duplicate";
            else
                return_msg = "Failed";

            return return_msg;
        }

        public bool isValidRoleName(string reqRoleName)
        {
            try
            {
                if (!HasPemissionToSecurity())
                    return false;
                if (Enum.TryParse(typeof(SystemRoles), reqRoleName.ToLower(), true, out object r))
                    return true;//role name is already exists
                UniqueCheckResponse result = this.ServiceClient.Post<UniqueCheckResponse>(new UniqueCheckRequest { roleName = reqRoleName });
                return result.unrespose;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in isValidRoleName : " + ex.Message);
                return false;
            }
        }


        //--------------------- TEST IP -------------------------------------------

        //public string GetRequestIP(bool tryUseXForwardHeader = true)
        //{
        //	string ip = null;

        //	// todo support new "Forwarded" header (2014) https://en.wikipedia.org/wiki/X-Forwarded-For

        //	// X-Forwarded-For (csv list):  Using the First entry in the list seems to work
        //	// for 99% of cases however it has been suggested that a better (although tedious)
        //	// approach might be to read each IP from right to left and use the first public IP.
        //	// http://stackoverflow.com/a/43554000/538763
        //	//
        //	if (tryUseXForwardHeader)
        //		ip = SplitCsv(GetHeaderValueAs<string>("X-Forwarded-For")).FirstOrDefault();

        //	// RemoteIpAddress is always null in DNX RC1 Update1 (bug).
        //	if (String.IsNullOrWhiteSpace(ip) && this.Request.HttpContext?.Connection?.RemoteIpAddress != null)
        //		ip = this.Request.HttpContext.Connection.RemoteIpAddress.ToString();

        //	if (String.IsNullOrWhiteSpace(ip))
        //		ip = GetHeaderValueAs<string>("REMOTE_ADDR");

        //	// _httpContextAccessor.HttpContext?.Request?.Host this is the local host.

        //	if (String.IsNullOrWhiteSpace(ip))
        //		throw new Exception("Unable to determine caller's IP.");

        //	return ip;
        //}

        //public T GetHeaderValueAs<T>(string headerName)
        //{
        //	StringValues values;

        //	if (this.Request.HttpContext?.Request?.Headers?.TryGetValue(headerName, out values) ?? false)
        //	{
        //		string rawValues = values.ToString();   // writes out as Csv when there are multiple.

        //		if (!rawValues.IsNullOrEmpty())
        //			return (T)Convert.ChangeType(values.ToString(), typeof(T));
        //	}
        //	return default(T);
        //}

        //public static List<string> SplitCsv(string csvList, bool nullOrWhitespaceInputReturnsNull = false)
        //{
        //	if (string.IsNullOrWhiteSpace(csvList))
        //		return nullOrWhitespaceInputReturnsNull ? null : new List<string>();

        //	return csvList
        //		.TrimEnd(',')
        //		.Split(',')
        //		.AsEnumerable<string>()
        //		.Select(s => s.Trim())
        //		.ToList();
        //}

        //public static bool IsNullOrWhitespace(string s)
        //{
        //	return String.IsNullOrWhiteSpace(s);
        //}


        public IActionResult LoginActivity()
        {
            LoginActivityResponse Lar = this.ServiceClient.Post<LoginActivityResponse>(new LoginActivityRequest
            {
                UserObject = this.LoggedInUser,
                Alluser = true
            });
            ActivityLogin(Lar);

            return View();
        }

        public void ActivityLogin(LoginActivityResponse Lar)
        {
            if (Lar.ErrMsg == null)
            {
                DVColumnCollection _columns = new DVColumnCollection();
                foreach (EbDataColumn col in Lar._data.Columns)
                {
                    string _title = string.Empty;
                    if (col.ColumnName == "ip_address")
                        _title = "IP Address";
                    else if (col.ColumnName == "signin_time")
                        _title = "SignIn Time";
                    else if (col.ColumnName == "signin_at")
                        _title = "SignIn Date";
                    else if (col.ColumnName == "signout_time")
                        _title = "SignOut Time";
                    else if (col.ColumnName == "signout_at")
                        _title = "SignOut Date";
                    else if (col.ColumnName == "fullname")
                        _title = "User Name";
                    else if (col.ColumnName == "duration")
                        _title = "Duration";
                    else if (col.ColumnName == "usertype")
                        _title = "User Type";
                    DVBaseColumn ebcol = new DVBaseColumn { Data = col.ColumnIndex, Name = col.ColumnName, sTitle = _title, bVisible = true, Type = col.Type };
                    _columns.Add(ebcol);
                }
                ViewBag.ColumnEb = JsonConvert.SerializeObject(_columns);
                ViewBag.RowsEb = JsonConvert.SerializeObject(Lar._data.Rows);
            }
        }

        public bool UpdateUserType(int itemid, string name)
        {
            UpdateUserTypeResponse resp = this.ServiceClient.Post(new UpdateUserTypeRequset { Id = itemid, Name = name });
            if (resp != null && resp.Status)
                return true;
            else
                return false;
        }
    }
}
