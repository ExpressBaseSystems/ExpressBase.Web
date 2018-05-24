using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Newtonsoft.Json;
using ExpressBase.Web.BaseControllers;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class MultiLanguageController : EbBaseIntCommonController
    {

        public MultiLanguageController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }
        // GET: /<controller>/

  //      public IActionResult multi_language()
  //      {
  //          return View();
  //      }
  //      [HttpPost]
  //      public Dictionary<int,string> getkeys(string k)
  //      {
  //          var resultlist = this.ServiceClient.Get<MLKeyResponse>(new MLKeyRequest { Key = k });
  //          var rlist = resultlist.Data;
  //          //string st=rlist.ToString();
  //          return rlist;
  //      }
  //      //public Dictionary<string,string> getlangandvalue(int id)
  //      //{
  //      //    var resultlist = this.ServiceClient.Get<MLLangValueResponse>(new MLLangValueRequest { Keyid = id });
  //      //    var rlist = resultlist.Data;
  //      //    return rlist;
  //      //}
  //      public List<MLRowEntry> getlangandvalue(int id)
  //      {
  //          var resultlist = this.ServiceClient.Get<MLLangValueResponse>(new MLLangValueRequest { Keyid = id });
  //          var rlist = resultlist.Data;
  //          return rlist;
  //      }
		//
		//public int setkey(string k,string v,int lid)
		//{
		//	var obj = new MLSetKeyRequest();
		//	obj.key = k;
		//	obj.value = v;
		//	obj.langid = lid;
		//	var rslt = this.ServiceClient.Post<MLSetKeyResponse>(obj);
		//	return rslt.Data;
		//}

		//public List<MLRecord> getkeysuggestion1(int stat, string[] lstrcd)
		//{
		//	List<string> l = new List<string>(lstrcd);
		//	MLRecord o = new MLRecord(l);
		//	List<MLRecord> obj = new List<MLRecord>();
		//	obj.Add(o);
		//	var resultlist = this.ServiceClient.Get<MLResponse>(new MLRequest {D_id=stat, D_member=obj});
		//	return resultlist.D_member;
		//}

		

		//public List<MLRecord> getlangvalrefference(int stat, string[] lstrcd)
		//{
		//	List<string> l = new List<string>(lstrcd);
		//	MLRecord o = new MLRecord(l);
		//	List<MLRecord> obj = new List<MLRecord>();
		//	obj.Add(o);
		//	var resultlist = this.ServiceClient.Get<MLResponse>(new MLRequest { D_id = stat, D_member = obj });
		//	return resultlist.D_member;
		//}

		//public List<MLRecord> getlanguage(int stat, string[] lstrcd)
		//{
		//	List<string> l = new List<string>(lstrcd);
		//	MLRecord o = new MLRecord(l);
		//	List<MLRecord> obj = new List<MLRecord>();
		//	obj.Add(o);
		//	var resultlist = this.ServiceClient.Get<MLResponse>(new MLRequest { D_id = stat, D_member = obj });
		//	return resultlist.D_member;
		//}

		public string GetKeySuggestion(string st, int off, int lim)
		{
			if (st == "")
				return null;
			var resultlist = this.ServiceClient.Get<MLGetSearchResultRspns>(new MLGetSearchResultRqst { Key_String = st, Offset = off, Limit =lim });
			return JsonConvert.SerializeObject(new { resultlist.Count, resultlist.D_member });
		}

		public Dictionary<string, int> LoadLang()
		{
			var resultlist = this.ServiceClient.Get<MLLoadLangResponse>(new MLLoadLangRequest { });
			var rlist = resultlist.Data;
			return rlist;
		}

		public Dictionary<int, MLKeyValue> GetStoredKeyValue(string k)
		{
			if (k == "")
				return null;
			var resultlist = this.ServiceClient.Get<MLGetStoredKeyValueResponse>(new MLGetStoredKeyValueRequest { Key=k });
			return resultlist.Data;
		}

		public int UpdateKeyValue(string d)
		{
			if (d == "")
				return 0;
			var data = JsonConvert.DeserializeObject<List<MLKeyValue>>(d);
			MLUpdateKeyValueRequest reqst = new MLUpdateKeyValueRequest();
			reqst.Data = data;
			var result = this.ServiceClient.Get<MLUpdateKeyValueResponse>(reqst);
			return result.Data;
		}

		public int AddKeyValue(string k, string d)
		{
			if (k == "" || d == "")
				return 0;
			var data = JsonConvert.DeserializeObject<List<MLAddKey>>(d);
			MLAddKeyRequest rqst = new MLAddKeyRequest();
			rqst.Data = data;
			rqst.Key = k;
			var result = this.ServiceClient.Get<MLAddKeyResponse>(rqst);
			return result.KeyId ;
		}

		public IActionResult MultiLanguage1()
		{
			return View();
		}

	}

}
