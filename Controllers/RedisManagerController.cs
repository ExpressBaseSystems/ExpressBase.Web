using Microsoft.AspNetCore.Mvc;
using ServiceStack.Redis;
using ServiceStack.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;
using System.Data;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using System.Reflection;
using ExpressBase.Common;
using ExpressBase.Web.BaseControllers;
using ServiceStack;
using ExpressBase.Web.Filters;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects;
using ExpressBase.Common.Data;
using ExpressBase.Security;
using ExpressBase.Objects.EmailRelated;
using ExpressBase.Objects.Objects.SmsRelated;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Web.Controllers;
// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace EbControllers
{
    public class RedisManagerController : EbBaseIntCommonController
    {
        public RedisManagerController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        // GET: /<controller>/
        [EbBreadCrumbFilter("Redis Explorer")]
        public IActionResult Index()
        {
            List<string> cmdlst = new List<string>();
            Type t = typeof(Commands);
            FieldInfo[] fields = t.GetFields(BindingFlags.Static | BindingFlags.Public);

            foreach (FieldInfo fi in fields)
            {
                cmdlst.Add(fi.Name.ToString());

            }
            ViewBag.cmdbag = cmdlst;
            List<EbGroup> lst = new List<EbGroup>();
            List<String> lst2 = new List<String>();
            foreach (var m in Redis.GetKeysByPattern("Grp_ob_*"))
            {
                var a = Redis.Get<string>(m);
                EbGroup obj = JsonConvert.DeserializeObject<EbGroup>(a);
                lst.Add(obj);
            }
            ViewBag.defltgrplst = lst.OrderBy(x => x.Name).ToList();

            Dictionary<string, List<string>> ptndict = new Dictionary<string, List<string>>();
            foreach (var m in Redis.GetKeysByPattern("Group_" + ViewBag.cid + "*"))
            {
                //    var a = Redis.Get<string>(m);
                List<string> l = Redis.GetAllItemsFromList(m);
                List<string> ptns = new List<string>();

                var name = "";

                for (int i = 0; i < l.Count; i++)
                {
                    EbGroup ob = JsonConvert.DeserializeObject<EbGroup>(l[i]);
                    ptns.Add(ob.Pattern);
                    name = ob.Name;
                }

                ptndict.Add(name, ptns);

            }
            ViewBag.csgrplst = ptndict;

            var text = "*" + ViewBag.cid + "*";

            foreach (var n in Redis.GetKeysByPattern(text))

            {
                lst2.Add(n);
            }

            ViewBag.allkeylist = JsonConvert.SerializeObject(lst2);


            ViewBag.grpdetails = ServiceClient.Get<RedisGroupDetailsResponse>(new RedisGetGroupDetails { }).GroupsDict;

            return View();

        }
        Dictionary<object, object> dict = new Dictionary<object, object>();
        List<string> list1 = new List<string>();



        public void Groupobjects()
        {
            EbGroup grp;
            string output;
            grp = new EbGroup("Web Forms", @"(\w+\-\w+\-)0(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_Webform", output);

            //grp = new EbGroup("Display Block", @"(\w+\-\w+\-)1(\-\w+\-\w+\-\w+\-\w)");
            //output = JsonConvert.SerializeObject(grp);
            //Redis.Set("Grp_ob_DisplayBlock", output);

            grp = new EbGroup("Data Readers", @"(\w+\-\w+\-)2(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_DataReader", output);

            grp = new EbGroup("Reports", @"(\w+\-\w+\-)3(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_Report", output);

            grp = new EbGroup("Data Writers", @"(\w+\-\w+\-)4(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_DataWriter", output);

            grp = new EbGroup("Sql Functions", @"(\w+\-\w+\-)5(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_SqlFunctions", output);

            grp = new EbGroup("Filter Dialogs", @"(\w+\-\w+\-)12(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_FilterDialog", output);


            // grp = new EbGroup("MobileForm", @"(\w+\-\w+\-)13(\-\w+\-\w+\-\w+\-\w)");
            // output = JsonConvert.SerializeObject(grp);
            //Redis.Set("Grp_ob_MobileForm", output);

            grp = new EbGroup("User Controls", @"(\w+\-\w+\-)14(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_UserControl", output);


            grp = new EbGroup("Email Builders", @"(\w+\-\w+\-)15(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_EmailBuilder", output);

            grp = new EbGroup("Table Visualizations", @"(\w+\-\w+\-)16(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_Tablevis", output);

            grp = new EbGroup("Chart Visualizations", @"(\w+\-\w+\-)17(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_Chartvis", output);

            grp = new EbGroup("Bot Forms", @"(\w+\-\w+\-)18(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_BotForm", output);

            grp = new EbGroup("Sms Builders", @"(\w+\-\w+\-)19(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_SmsBuilder", output);

            grp = new EbGroup("Api Builders", @"(\w+\-\w+\-)20(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_ApiBuilder", output);


            grp = new EbGroup("Column Colletion", @"(\w +\-\w +\-)2(\-\d +\-\d +\-\d +\-\d + _columns$)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_ColumnColletion", output);

            grp = new EbGroup("Connection String", @"(EbSolutionConnections *)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_ConnectionString", output);

            grp = new EbGroup("Users", @"(?:(?:.*):(?:.*):)(uc+$|dc+$)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_Users", output);
        }

        public List<string> FindMatch(string text)
        {
            IEnumerable<string> ptn = Redis.GetKeysByPattern("*" + ViewBag.cid + "*");
            foreach (var m in ptn)

            {
                if (m.Matches(text))
                    list1.Add(m);
            }
            return list1;
        }
        //public List<string> FindMatch(string text)
        //{
        //    foreach (var m in Redis.GetKeysByPattern(text))

        //    {
        //        list1.Add(m);
        //    }
        //    return list1;
        //}
        public bool Keydeletes(string textdel)
        {
            string prev_value = null;
            if (Redis.ContainsKey(textdel))
            {
                if (Redis.Type(textdel) == "list")
                { prev_value = JsonConvert.SerializeObject(Redis.GetAllItemsFromList(textdel)); }
                else if (Redis.Type(textdel) == "hash")
                { prev_value = JsonConvert.SerializeObject(Redis.GetAllEntriesFromHash(textdel)); }
                else if (Redis.Type(textdel) == "set")
                { prev_value = JsonConvert.SerializeObject(Redis.GetAllItemsFromSet(textdel)); }
                else if (Redis.Type(textdel) == "zset")
                { prev_value = JsonConvert.SerializeObject(Redis.GetAllItemsFromSortedSet(textdel)); }
                else if (Redis.Type(textdel) == "string")
                { prev_value = Redis.GetValue(textdel); }
                Redis.Remove(textdel);
                string new_value = "";
                RedisOperations opn = RedisOperations.Delete;
                ActivityLog(prev_value, new_value, opn, textdel);
                return true;
            }
            else
            {
                return false;
            }
        }



        public void ActivityLog(string prev, string newval, RedisOperations opn, string keyval)
        {

            int sln_id = 5;
            var x = ServiceClient.Post<LogRedisInsertResponse>(new LogRedisInsertRequest
            {
                Key = keyval,
                NewValue = newval,
                PreviousValue = prev,
                Operation = opn,
                SolutionId = sln_id

            });
            // object changed_at;

        }
        public List<EbRedisLogs> SetActivityLog()
        {
            int soln_id = 5;
            var x = ServiceClient.Get<LogRedisGetResponse>(new LogRedisGetRequest
            { SolutionId = soln_id }
                );
            return x.Logs;
        }
        public object ViewLogChanges(int logid)
        {
            var x = ServiceClient.Get<LogRedisViewChangesResponse>(new LogRedisViewChangesRequest
            {
                LogId = logid

            });
            string p = x.RedisLogValues.Prev_val.Replace(",", ",\n");
            string q = x.RedisLogValues.New_val.Replace(",", ",\n");
            object o = new Eb_ObjectController(this.ServiceClient, this.Redis).GetDiffer(p, q);
            return o;

        }


        public bool Keyvalueinput(string textkey, string textvalue)
        {
            bool b;
            long val = Redis.Exists(textkey);
            if (val >= 1) { return false; }
            if ((textkey != "") && (textvalue != ""))
            {
                Redis.Set(textkey, textvalue);
                b = true;
            }
            else { b = false; }
            return b;

        }
        //public List<string> Allkeys(string slname)
        //{
        //    List<String> lst3 = new List<String>();
        //    lst3 = Redis.GetAllKeys();

        //    return lst3;
        //}

        public Dictionary<int, List<string>> FindRegexMatch(string textregex)
        {
            List<string> list4 = new List<string>();
            Dictionary<int, List<string>> regxsearch = new Dictionary<int, List<string>>();
            try
            {
                var base64EncodedBytes = Convert.FromBase64String(textregex);
                var regx = System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
                Regex rgx = new Regex(regx);
                foreach (var m in Redis.GetKeysByPattern("*" + ViewBag.cid + "*"))
                {
                    if (rgx.IsMatch(m))
                        list4.Add(m);
                }
                regxsearch.Add(1, list4);
                return regxsearch;
            }
            catch (Exception e)
            {
                list4.Add(e.Message);
                regxsearch.Add(2, list4);
                return regxsearch;

            }



        }



        public void GroupPattern(string textgroup, List<string> ptnlst)
        {
            var t1 = ViewBag.cid;
            var flg = 0;
            string prev_value, new_value;
            var k = "Group_" + t1 + "_" + textgroup;
            prev_value = JsonConvert.SerializeObject(Redis.GetAllItemsFromList(k));
            if (Redis.Exists("Group_" + t1 + "_" + textgroup) > 0)
            {
                flg = 1;
                Redis.Remove(Encoding.UTF8.GetBytes("Group_" + t1 + "_" + textgroup));
            }

            foreach (var i in ptnlst)
            {
                var base64EncodedBytes = Convert.FromBase64String(i);
                var regx = System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
                EbGroup grp = new EbGroup(textgroup, regx);
                string output = JsonConvert.SerializeObject(grp);
                Redis.RPush("Group_" + t1 + "_" + textgroup, Encoding.UTF8.GetBytes(output));
                EbGroup dobj = JsonConvert.DeserializeObject<EbGroup>(output);
                string s1 = dobj.Pattern;
                string s2 = dobj.Name;
            }
            if (flg == 1)
            {
                new_value = JsonConvert.SerializeObject(Redis.GetAllItemsFromList(k));
                RedisOperations opn = RedisOperations.Edit;
                ActivityLog(prev_value, new_value, opn, textgroup);


            }


        }



        public object FindVal(string key_name)
        {

            object val = null;
            long idltm = Redis.ObjectIdleTime(key_name);

            var type = Redis.Type(key_name);
            var rx = new Regex("(?:(?:.*):(?:.*):)(uc+$|dc+$)");
            string dgp = "Group_" + ViewBag.cid + "*";
            if (type == "string")
            {
                try
                {
                    if (key_name.Matches("EbSolutionConnections*"))
                    {
                        val = Redis.Get<EbConnectionsConfig>(key_name);
                    }
                    else if (rx.IsMatch(key_name))
                    {
                        val = Redis.Get<User>(key_name);
                    }
                    else if (key_name.Matches(dgp))
                    {
                        val = Redis.Get<EbGroup>(key_name);
                    }
                    else if ((new Regex(@"(\w+\-\w+\-)2(\-\d+\-\d+\-\d+\-\d+_columns$)")).IsMatch(key_name))
                    {
                        val = Redis.Get<ColumnColletion>(key_name);
                    }
                    else if ((new Regex(@"(^solution_\w+)")).IsMatch(key_name))
                    {
                        val = Redis.Get<Eb_Solution>(key_name);
                    }
                    else if ((new Regex(@"(\w+\-\w+\-)0(\-\d+\-\d+\-\d+\-\d+$)")).IsMatch(key_name))
                    {
                        val = Redis.Get<EbWebForm>(key_name);
                    }
                    //else if ((new Regex(@"(\w+\-\w+\-)1(\-\w+\-\w+\-\w+\-\w)")).IsMatch(key_name))
                    //{
                    //    val = Redis.Get<EbObject>(key_name);
                    //}
                    else if ((new Regex(@"(\w+\-\w+\-)2(\-\d+\-\d+\-\d+\-\d+$)")).IsMatch(key_name))
                    {
                        val = Redis.Get<EbDataReader>(key_name);
                    }
                    else if ((new Regex(@"(\w+\-\w+\-)3(\-\d+\-\d+\-\d+\-\d+$)")).IsMatch(key_name))
                    {
                        val = Redis.Get<EbReport>(key_name);
                    }
                    else if ((new Regex(@"(\w+\-\w+\-)4(\-\d+\-\d+\-\d+\-\d+$)")).IsMatch(key_name))
                    {
                        val = Redis.Get<EbDataWriter>(key_name);
                    }
                    else if ((new Regex(@"(\w+\-\w+\-)5(\-\d+\-\d+\-\d+\-\d+$)")).IsMatch(key_name))
                    {
                        val = Redis.Get<EbSqlFunction>(key_name);
                    }
                    else if ((new Regex(@"(\w+\-\w+\-)12(\-\d+\-\d+\-\d+\-\d+$)")).IsMatch(key_name))
                    {
                        val = Redis.Get<EbFilterDialog>(key_name);
                    }
                    else if ((new Regex(@"(\w+\-\w+\-)14(\-\d+\-\d+\-\d+\-\d+$)")).IsMatch(key_name))
                    {
                        val = Redis.Get<EbUserControl>(key_name);
                    }
                    else if ((new Regex(@"(\w+\-\w+\-)15(\-\d+\-\d+\-\d+\-\d+$)")).IsMatch(key_name))
                    {
                        val = Redis.Get<EbEmailTemplate>(key_name);
                    }
                    else if ((new Regex(@"(\w+\-\w+\-)16(\-\d+\-\d+\-\d+\-\d+$)")).IsMatch(key_name))
                    {
                        val = Redis.Get<EbTableVisualization>(key_name);
                    }
                    else if ((new Regex(@"(\w+\-\w+\-)17(\-\d+\-\d+\-\d+\-\d+$)")).IsMatch(key_name))
                    {
                        val = Redis.Get<EbChartVisualization>(key_name);
                    }
                    else if ((new Regex(@"(\w+\-\w+\-)18(\-\d+\-\d+\-\d+\-\d+$)")).IsMatch(key_name))
                    {
                        val = Redis.Get<EbBotForm>(key_name);
                    }
                    else if ((new Regex(@"(\w+\-\w+\-)19(\-\d+\-\d+\-\d+\-\d+$)")).IsMatch(key_name))
                    {
                        val = Redis.Get<EbSmsTemplate>(key_name);
                    }
                    else if ((new Regex(@"(\w+\-\w+\-)20(\-\d+\-\d+\-\d+\-\d+$)")).IsMatch(key_name))
                    {
                        val = Redis.Get<EbApi>(key_name);
                    }
                    //else
                    //{
                    //    val = Redis.Get<string>(key_name);
                    //}

                }
                catch (Exception e)
                {
                    val = Redis.Get<string>(key_name);
                }

            }

            else if (type == "list")

                val = Redis.GetAllItemsFromList(key_name);

            else if (type == "hash")
            {
                val = Redis.GetAllEntriesFromHash(key_name);
            }
            else if (type == "set")
            {
                val = Redis.GetAllItemsFromSet(key_name);
            }
            else if (type == "zset")
            {
                // val = Redis.GetAllItemsFromSortedSet(key_name);
                val = Redis.GetAllWithScoresFromSortedSet(key_name);
            }
            return new FindValClass { Key = key_name, Obj = val, Type = type, Idltm = idltm };

        }

        private object Regex(string v)
        {
            throw new NotImplementedException();
        }

        public void ListInsert(string txtlistkey, string txtlistval, int flag)
        {
            if (flag == 1)
            {
                var lpushval = Encoding.UTF8.GetBytes(txtlistval);
                Redis.LPush(txtlistkey, lpushval);
            }
            if (flag == 2)
            {
                var rpushval = Encoding.UTF8.GetBytes(txtlistval);
                Redis.RPush(txtlistkey, rpushval);
            }
        }

        public void HashInsert(string txthashkey, string txthashfield, string txthashval)
        {
            var hashfield = Encoding.UTF8.GetBytes(txthashfield);
            var hashval = Encoding.UTF8.GetBytes(txthashval);
            Redis.HSet(txthashkey, hashfield, hashval);
        }
        public void SetInsert(string txtsetkey, string txtsetval)
        {
            var sethval = Encoding.UTF8.GetBytes(txtsetval);
            Redis.SAdd(txtsetkey, sethval);
        }

        public void SortedsetInsert(string txtzsetkey, string txtzsetscr, string txtzsetval)
        {
            double scor = Convert.ToDouble(txtzsetscr);
            var zsethval = Encoding.UTF8.GetBytes(txtzsetval);
            Redis.ZAdd(txtzsetkey, scor, zsethval);
        }
        //public bool Renamekey(string oldkey, string newkey)
        //{
        //    bool b;
        //    if (Redis.ContainsKey(newkey))
        //        b = false;
        //    else
        //    {
        //        Redis.RenameKey(oldkey, newkey);
        //        b = true;
        //    }
        //    return b;
        //}
        public bool StringvalEdit(string key1, string value1)
        {
            bool bl;
            if ((key1 != "") && (value1 != ""))
            {
                string prev = Redis.GetValue(key1);
                Redis.SetValue(key1, value1);
                RedisOperations opn = RedisOperations.Edit;
                ActivityLog(prev, value1, opn, key1);
                bl = true;
            }
            else bl = false;
            return bl;

        }
        public void ListValEdit(string l_keyid, string dict)
        {
            Dictionary<int, string> val = JsonConvert.DeserializeObject<Dictionary<int, string>>(dict);
            string prev_value, new_value;
            int v = Convert.ToInt32(Redis.LLen(l_keyid));
            int i;
            prev_value = JsonConvert.SerializeObject(Redis.GetAllItemsFromList(l_keyid));
            for (i = v; i < val.Count; i++)
            {
                var lv = Encoding.UTF8.GetBytes(val[i]);
                Redis.RPush(l_keyid, lv);

            }

            foreach (var item in val)
            {
                var listval = Encoding.UTF8.GetBytes(item.Value);
                Redis.LSet(l_keyid, item.Key, listval);
            }
            new_value = JsonConvert.SerializeObject(Redis.GetAllItemsFromList(l_keyid));
            RedisOperations opn = RedisOperations.Edit;
            ActivityLog(prev_value, new_value, opn, l_keyid);
        }
        public void SetValEdit(string l_keyid, string dict)
        {
            string prev_value, new_value;
            prev_value = JsonConvert.SerializeObject(Redis.GetAllItemsFromSet(l_keyid));
            Dictionary<string, string> val = JsonConvert.DeserializeObject<Dictionary<string, string>>(dict);
            Redis.SPop(l_keyid, Convert.ToInt32(Redis.SCard(l_keyid)));
            foreach (var item in val)
            {
                var setval = Encoding.UTF8.GetBytes(item.Value);
                Redis.SAdd(l_keyid, setval);
            }
            new_value = JsonConvert.SerializeObject(Redis.GetAllItemsFromSet(l_keyid));
            RedisOperations opn = RedisOperations.Edit;
            ActivityLog(prev_value, new_value, opn, l_keyid);
        }


        public void HashValEdit(string h_keyid, string dict)
        {
            string prev_value, new_value;

            Dictionary<string, string> val = JsonConvert.DeserializeObject<Dictionary<string, string>>(dict);
            var tp = Redis.Type(h_keyid);
            if (tp == "zset")
            {
                prev_value = JsonConvert.SerializeObject(Redis.GetAllItemsFromSortedSet(h_keyid));
                Redis.ZRemRangeByRank(h_keyid, 0, -1);
                foreach (var item in val)
                {
                    double scor = Convert.ToDouble(item.Value);
                    var zsethval = Encoding.UTF8.GetBytes(item.Key);

                    Redis.ZAdd(h_keyid, scor, zsethval);
                }
                new_value = JsonConvert.SerializeObject(Redis.GetAllItemsFromSortedSet(h_keyid));
                RedisOperations opn = RedisOperations.Edit;
                ActivityLog(prev_value, new_value, opn, h_keyid);
            }
            if (tp == "hash")
            {
                prev_value = JsonConvert.SerializeObject(Redis.GetAllEntriesFromHash(h_keyid));
                foreach (var item in val)
                {
                    var field = Encoding.UTF8.GetBytes(item.Key);
                    var v = Encoding.UTF8.GetBytes(item.Value);
                    Redis.HSet(h_keyid, field, v);
                }
                new_value = JsonConvert.SerializeObject(Redis.GetAllEntriesFromHash(h_keyid));
                RedisOperations opn = RedisOperations.Edit;
                ActivityLog(prev_value, new_value, opn, h_keyid);
            }


        }
        public object Terminal(string cmd)
        {
            int flag = 0;
            try
            {

                object[] arr = cmd.Split(" ");
                RedisText rd = new RedisText();
                rd = Redis.Custom(arr);
                if (rd.Text == null)
                {
                    List<string> terminal_list = new List<string>();
                    foreach (var child in rd.Children)
                    {
                        flag = 1;
                        terminal_list.Add(child.Text);
                    }
                    if (flag == 1)
                        return terminal_list;
                    else return "Invalid Entry";

                }
                else
                    return rd.Text;
            }
            catch (Exception e) { return e.Message; }
        }


    }
}
