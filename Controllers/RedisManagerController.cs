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
            List<EbGroup> lst1 = new List<EbGroup>();
            List<String> lst2 = new List<String>();
            foreach (var m in Redis.GetKeysByPattern("Grp_ob_*"))
            {
                var a = Redis.Get<string>(m);
                EbGroup obj = JsonConvert.DeserializeObject<EbGroup>(a);
                lst.Add(obj);
            }
            ViewBag.grpoblst = lst.OrderBy(x => x.Name).ToList();
            //foreach (var m in Redis.GetKeysByPattern("Grp_*"))
            //{
            //    var a = Redis.Get<string>(m);
            //    EbGroup obj = JsonConvert.DeserializeObject<EbGroup>(a);
            //    lst1.Add(obj);
            //}
            //ViewBag.grplst = lst.OrderBy(x => x.Name).ToList();
         
            var text = "*" + ViewBag.cid + "*";

            foreach (var n in Redis.GetKeysByPattern(text))

            {
                lst2.Add(n);
            }


            ViewBag.allkeylist = JsonConvert.SerializeObject(lst2);
            return View();
        }
        Dictionary<object, object> dict = new Dictionary<object, object>();
        List<string> list1 = new List<string>();



        public void Groupobjects()
        {
            EbGroup grp;
            string output;
            grp = new EbGroup("Web Forms", @"(\w+\-\w+\-)(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_Webform", output);

            grp = new EbGroup("Display Block", @"(\w+\-\w+\-)1(\-\w+\-\w+\-\w+\-\w)");
            output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_ob_DisplayBlock", output);

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
        }

        public List<string> FindMatch(string text)
        {
            foreach (var m in Redis.GetKeysByPattern(text))

            {
                list1.Add(m);
            }
            return list1;
        }


        public bool Keydeletes(string textdel)
        {
            if (Redis.ContainsKey(textdel))
            {
                string prev_value = Redis.GetValue(textdel);

                Redis.Remove(textdel);
                string new_value = null;
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
            string changed_by = ViewBag.Uid;
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
        //public List<EbRedisLogs> SetActivityLog()
        //{
        //    int soln_id = 5;
        //    var x = ServiceClient.Get<LogRedisGetResponse>(new LogRedisGetRequest
        //    { SolutionId = soln_id }
        //        );
        //    return x.Logs;
        //}
        public object ViewLogChanges(int logid)
        {
            var x = ServiceClient.Get<LogRedisViewChangesResponse>(new LogRedisViewChangesRequest
            {
                LogId = logid
            });
            return x.RedisLogValues;
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

        public List<string> FindRegexMatch(string textregex)
        {
            var base64EncodedBytes = Convert.FromBase64String(textregex);
            var regx = System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
            Regex rgx = new Regex(regx);
            foreach (var m in Redis.GetAllKeys())
            {
                if (rgx.IsMatch(m))
                    list1.Add(m);
            }
            return list1;
        }




        public void GroupPattern(string textgroup, string textpattern)
        {
            var base64EncodedBytes = Convert.FromBase64String(textpattern);
            var regx = System.Text.Encoding.UTF8.GetString(base64EncodedBytes);

            EbGroup grp = new EbGroup(textgroup, regx);

            string output = JsonConvert.SerializeObject(grp);
            Redis.Set("Grp_" + textgroup, output);

            EbGroup dobj = JsonConvert.DeserializeObject<EbGroup>(output);
            string s1 = dobj.Pattern;
            string s2 = dobj.Name;

        }



        public object FindVal(string key_name)
        {

            object val = null;
            var type = Redis.Type(key_name);

            if (type == "string")
                val = Redis.Get<string>(key_name);
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
            return new FindValClass { Key = key_name, Obj = val, Type = type };

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

            int v = Convert.ToInt32(Redis.LLen(l_keyid));
            int i;
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
        }
        public void SetValEdit(string l_keyid, string dict)
        {
            Dictionary<string, string> val = JsonConvert.DeserializeObject<Dictionary<string, string>>(dict);
            Redis.SPop(l_keyid, Convert.ToInt32(Redis.SCard(l_keyid)));
            foreach (var item in val)
            {
                var setval = Encoding.UTF8.GetBytes(item.Value);
                Redis.SAdd(l_keyid, setval);
            }

        }


        public void HashValEdit(string h_keyid, string dict)
        {
            Dictionary<string, string> val = JsonConvert.DeserializeObject<Dictionary<string, string>>(dict);
            var tp = Redis.Type(h_keyid);
            if (tp == "zset")
            {
                Redis.ZRemRangeByRank(h_keyid, 0, -1);
                foreach (var item in val)
                {
                    double scor = Convert.ToDouble(item.Value);
                    var zsethval = Encoding.UTF8.GetBytes(item.Key);

                    Redis.ZAdd(h_keyid, scor, zsethval);
                }
            }
            if (tp == "hash")
            {
                foreach (var item in val)
                {
                    var field = Encoding.UTF8.GetBytes(item.Key);
                    var v = Encoding.UTF8.GetBytes(item.Value);
                    Redis.HSet(h_keyid, field, v);
                }
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
