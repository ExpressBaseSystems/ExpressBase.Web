using System;
using Npgsql;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using System.Collections;
using Newtonsoft.Json;
using ExpressBase.Web.BaseControllers;
using ServiceStack.Redis;
using ServiceStack;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Common;
using ExpressBase.Common.Structures;

namespace ExpressBase.Web.Controllers
{
    public class DbClientController : EbBaseIntCommonController
    {
        public DbClientController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        public IActionResult DbClient()
        {
            GetDbTablesResponse res = this.ServiceClient.Get(new GetDbTablesRequest { });
            ViewBag.Tables = res.Tables;
            ViewBag.DB_Name = res.DB_Name;
            ViewBag.TableCount = res.TableCount;
            return View();
        }

        public List<DbClientQueryResponse> ExecuteQuery(string Query)
        {
            List<DbClientQueryResponse> responses = new List<DbClientQueryResponse>();
            string[] QueryList = Query.Split(";");
            try
            {
                foreach (string SplitQuery in QueryList)
                {
                    if (SplitQuery != string.Empty)
                    {
                        if (Query.IndexOf("insert into ", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            DbClientQueryResponse ress = new DbClientQueryResponse();
                            ress = InsertQuery(SplitQuery);
                            responses.Add(ress);
                        }
                        else if (Query.IndexOf("select ", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            if (Query.IndexOf("eb_", StringComparison.OrdinalIgnoreCase) < 0)
                            {
                                DbClientQueryResponse ress = new DbClientQueryResponse();
                                ress = SelectQuery(SplitQuery);
                                responses.Add(ress);
                            }                                
                        }
                        else if (Query.IndexOf("delete ", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            DbClientQueryResponse ress = new DbClientQueryResponse();
                            ress = DeleteQuery(SplitQuery);
                            responses.Add(ress);
                        }
                        else if (Query.IndexOf("drop ", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            DbClientQueryResponse ress = new DbClientQueryResponse();
                            ress = DropQuery(SplitQuery);
                            responses.Add(ress);
                        }
                        else if (Query.IndexOf("alter table ", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            DbClientQueryResponse ress = new DbClientQueryResponse();
                            ress = AlterQuery(SplitQuery);
                            responses.Add(ress);
                        }
                        else if (Query.IndexOf("truncate ", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            DbClientQueryResponse ress = new DbClientQueryResponse();
                            ress = TruncateQuery(SplitQuery);
                            responses.Add(ress);
                        }
                        else if (Query.IndexOf("update ", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            DbClientQueryResponse ress = new DbClientQueryResponse();
                            ress = UpdateQuery(SplitQuery);
                            responses.Add(ress);
                        }
                        else if (Query.IndexOf("create table ", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            DbClientQueryResponse ress = new DbClientQueryResponse();
                            ress = CreateQuery(SplitQuery);
                            responses.Add(ress);
                        }
                        else { }
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message + e.StackTrace);
            };
            return responses;
        }

        public DbClientQueryResponse SelectQuery(string Query)
        {
            DbClientQueryResponse ress = new DbClientQueryResponse();
            //bool containsSearchResult = Query.Contains("select");
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientSelectRequest { Query = Query });
            if (ress.Dataset != null)
            {
                ress.RowCollection = new List<RowColletion>();
                ress.ColumnCollection = new List<DVColumnCollection>();
                foreach (EbDataTable _table in ress.Dataset.Tables)
                {
                    ress.ColumnCollection.Add(ConvertColumns(_table.Columns));
                    ress.RowCollection.Add(_table.Rows);
                }
            }
            return ress;
        }

        public DbClientQueryResponse InsertQuery(string Query)
        {
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientInsertRequest { Query = Query });
            return ress;
        }

        public DbClientQueryResponse DropQuery(string Query)
        {
            DbClientQueryResponse ress = new DbClientQueryResponse();
            return ress;
        }

        public DbClientQueryResponse DeleteQuery(string Query)
        {
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientDeleteRequest { Query = Query });
            return ress;
        }

        public DbClientQueryResponse AlterQuery(string Query)
        {
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientAlterRequest { Query = Query });
            return ress;
        }

        private DbClientQueryResponse CreateQuery(string Query)
        {
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientCreateRequest { Query = Query });
            return ress;
        }

        public DbClientQueryResponse TruncateQuery(string Query)
        {
            DbClientQueryResponse ress = new DbClientQueryResponse();
            return ress;
        }

        public DbClientQueryResponse UpdateQuery(string Query)
        {
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientUpdateRequest { Query = Query });
            return ress;
        }

        public DVColumnCollection ConvertColumns(ColumnColletion __columns)
        {
            DVColumnCollection Columns = new DVColumnCollection();
            foreach (EbDataColumn column in __columns)
            {
                DVBaseColumn _col = null;
                if (column.Type == EbDbTypes.String)
                    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px" };
                else if (column.Type == EbDbTypes.Int16 || column.Type == EbDbTypes.Int32 || column.Type == EbDbTypes.Int64 || column.Type == EbDbTypes.Double || column.Type == EbDbTypes.Decimal || column.Type == EbDbTypes.VarNumeric)
                    _col = new DVNumericColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px" };
                else if (column.Type == EbDbTypes.Boolean)
                    _col = new DVBooleanColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px" };
                else if (column.Type == EbDbTypes.DateTime || column.Type == EbDbTypes.Date || column.Type == EbDbTypes.Time)
                    _col = new DVDateTimeColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, sType = "date-uk", Type = column.Type, bVisible = true, sWidth = "100px" };
                _col.EbSid = column.Type.ToString() + column.ColumnIndex;
                Columns.Add(_col);
            }
            return Columns;
        }
    }
}
