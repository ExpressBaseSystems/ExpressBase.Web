using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Objects.Attributes;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Objects.ReportRelated;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ProtoBuf;
using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.Controllers
{
    public class ImportExportController : EbBaseIntCommonController
    {
        public ImportExportController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        public IActionResult Index()
        {
            return View();
        }
        public void Export(string _refid)
        {
            List<EbObject> ObjectCollection = new List<EbObject>();
            var obj = GetObjfromDB(_refid);
            if (obj is EbDataSource)
            {
                var _o = obj as EbDataSource;
                ObjectCollection.Add(_o);
                EbFilterDialog fd;
                if (!_o.FilterDialogRefId.IsEmpty())
                {
                    fd = _o.FilterDialog;
                    if (fd is null)
                    {
                        var fdobj = GetObjfromDB(_o.FilterDialogRefId);
                        ObjectCollection.Add(fdobj);
                    }
                }
            }
            if (obj is EbTableVisualization)
            {
                var _o = obj as EbTableVisualization;
                ObjectCollection.Add(_o);
                EbDataSource ds;
                if (_o.DataSourceRefId.IsEmpty())
                {
                    ds = _o.EbDataSource;
                    if (ds is null)
                    {
                        var dsobj = GetObjfromDB(_o.DataSourceRefId);
                        ObjectCollection.Add(dsobj);
                    }
                }
                foreach (DVBaseColumn _col in _o.Columns)
                {
                    if (!_col.LinkRefId.IsNullOrEmpty())
                    {
                        var linkobj = GetObjfromDB(_col.LinkRefId);
                        ObjectCollection.Add(linkobj);
                    }
                }
            }
            if (obj is EbChartVisualization)
            {
                var _o = obj as EbChartVisualization;
                ObjectCollection.Add(_o);
                EbDataSource ds;
                if (_o.DataSourceRefId.IsEmpty())
                {
                    ds = _o.EbDataSource;
                    if (ds is null)
                    {
                        var dsobj = GetObjfromDB(_o.DataSourceRefId);
                        ObjectCollection.Add(dsobj);
                    }
                }
            }
            if (obj is EbReport)
            {
                var _o = obj as EbReport;
                ObjectCollection.Add(_o);
                EbDataSource ds;
                if (_o.DataSourceRefId.IsEmpty())
                {
                    ds = _o.EbDataSource;
                    if (ds is null)
                    {
                        var dsobj = GetObjfromDB(_o.DataSourceRefId);
                        ObjectCollection.Add(dsobj);
                    }
                }
                foreach (var dt in _o.Detail)
                {
                    foreach (var field in dt.Fields)
                    {
                        if (field is EbDataField)
                        {
                            if (!(field as EbDataField).LinkRefId.IsEmpty())
                            {
                                var linkobj = GetObjfromDB((field as EbDataField).LinkRefId);
                                ObjectCollection.Add(linkobj);
                            }
                        }
                    }
                }

            }
            if (obj is EbWebForm)
            {
                EbWebForm _o = obj as EbWebForm;
                foreach (EbControl control in _o.Controls)
                {
                    PropertyInfo[] _props = control.GetType().GetProperties();
                    foreach (PropertyInfo _prop in _props)
                    {
                        if(_prop.IsDefined(typeof(OSE_ObjectTypes)))
                            ObjectCollection.Add(GetObjfromDB(_prop.GetValue(obj, null).ToString()));
                    }
                }
            }
            if (obj is EbBotForm)
            {

            }
            string stream = EbSerializers.Json_Serialize(ObjectCollection);
            using (System.IO.StreamWriter file = new System.IO.StreamWriter(@"E:\ExportFile.txt"))
            {
                file.WriteLine(stream);
            }
        }

        public void Import()
        {
            string text = System.IO.File.ReadAllText(@"E:\ExportFile.txt");
            List<EbObject> ObjectCollection = (List<EbObject>)EbSerializers.Json_Deserialize(text);
            foreach (EbObject obj in ObjectCollection)
            {
                obj.Name = obj.Name + "imported2";
                var ds = new EbObject_Create_New_ObjectRequest
                {
                    Name = obj.Name,
                    Description = obj.Description,
                    Json = EbSerializers.Json_Serialize(obj),
                    Status = ObjectLifeCycleStatus.Dev,
                    Relations = "_rel_obj",
                    IsSave = false,
                    Tags = "_tags",
                    Apps = "0"
                };
                EbObject_Create_New_ObjectResponse res = ServiceClient.Post(ds);
            }

        }

        public EbObject GetObjfromDB(string _refid)
        {
            var res = ServiceClient.Get(new EbObjectParticularVersionRequest { RefId = _refid });
            var obj = EbSerializers.Json_Deserialize(res.Data[0].Json);
            return obj;
        }
    }
}