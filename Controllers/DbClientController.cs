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

        private string solutionid;
        private bool IsAdmin;

        [Microsoft.AspNetCore.Mvc.Route("/dbclient")]
        public IActionResult DbClient(string clientSolnid)
        {
            try
            {
                if (ViewBag.wc == RoutingConstants.UC || ViewBag.wc == RoutingConstants.TC)
                    return Redirect("/StatusCode/401");
                //GetDbTablesResponse res = null;
                //if (ViewBag.cid == "admin" && this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) || this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString()))
                //{
                //    if (clientSolnid != null)
                //        res = this.ServiceClient.Get(new GetDbTablesRequest { IsAdminOwn = true, ClientSolnid = clientSolnid });
                //    else
                //        res = this.ServiceClient.Get(new GetDbTablesRequest { });
                //    ViewBag.IsAdminOwn = true;
                //}
                //else
                //{
                //    res = this.ServiceClient.Get(new GetDbTablesRequest { });
                //    ViewBag.IsAdminOwn = false;
                //}
                //ViewBag.Tables = res.Tables;
                //ViewBag.DB_Name = res.DB_Name;
                //ViewBag.TableCount = res.TableCount;
                ViewBag.User = this.LoggedInUser;
                ViewBag.solutionid = clientSolnid;

            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message + e.StackTrace);
            }
            return View();
        }
        [HttpPost]
        public IActionResult DbClientt()
        {
            GetDbTablesResponse res = null;
            if (ViewBag.cid == "admin")
                if (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) || this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString()))
                    res = this.ServiceClient.Get(new GetDbTablesRequest { IsAdminOwn = true, ClientSolnid = "" });
            ViewBag.Tables = res.Tables;
            ViewBag.DB_Name = res.DB_Name;
            ViewBag.TableCount = res.TableCount;
            ViewBag.IsAdminOwn = true;
            return View("DbClient");
        }

        public IActionResult SearchSolution(string clientSolnid)
        {
            if (ViewBag.wc == RoutingConstants.UC || ViewBag.wc == RoutingConstants.TC)
                return Redirect("/StatusCode/401");
            var user = this.LoggedInUser;
            return ViewComponent("DBClient", new { clientSolnid = clientSolnid, _user = user });
        }

        public List<DbClientQueryResponse> ExecuteQuery(string Query, string solution, bool Isadmin)
        { // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }
            solutionid = solution;
            IsAdmin = Isadmin;
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
                            // if (Query.IndexOf("eb_", StringComparison.OrdinalIgnoreCase) < 0 || IsAdmin)
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
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }
            DbClientQueryResponse ress = new DbClientQueryResponse();
            //bool containsSearchResult = Query.Contains("select");
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientSelectRequest { Query = Query, ClientSolnid = solutionid, IsAdminOwn = IsAdmin });
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




        public ActionResult CreateIndex(string tableName, string indexName, string indexColumns)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                return Unauthorized();
            }

            // Create the request object
            DbClientIndexRequest request = new DbClientIndexRequest
            {
                TableName = tableName,
                IndexName = indexName,
                IndexColumns = indexColumns,
                ClientSolnid = solutionid,
                IsAdminOwn = IsAdmin
            };

            // Execute the request
            DbClientIndexResponse response = this.ServiceClient.Post<DbClientIndexResponse>(request);

            // Return the appropriate ActionResult
            if (response.Result == 0) // Assuming 0 indicates success, adjust as needed
            {
                return Json(new { success = true, message = "Index created successfully." });
            }
            else
            {
                return Json(new { success = false, message = "Failed to create index.", error = response.Message });
            }
        }


        [HttpPost]
        public ActionResult EditIndexName(string currentIndexName, string newIndexName, string tableName)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                return Unauthorized();
            }

            // Create the request object
            DbClientEditIndexRequest request = new DbClientEditIndexRequest
            {
                CurrentIndexName = currentIndexName,
                NewIndexName = newIndexName,
                TableName = tableName,
                ClientSolnid = solutionid,
                IsAdminOwn = IsAdmin
            };

            // Execute the request
            DbClientEditIndexResponse response = this.ServiceClient.Post<DbClientEditIndexResponse>(request);

            // Return the appropriate ActionResult
            if (response.Result == 0) // Assuming 0 indicates success, adjust as needed
            {
                return Json(new { success = true, message = "Index name updated successfully." });
            }
            else
            {
                return Json(new { success = false, message = "Failed to update index name.", error = response.Message });
            }
        }



        [HttpPost]
        public ActionResult CreateConstraint(string tableName, string columnName, string constraintType, string constraintName)
        {
            // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                return Unauthorized();
            }

            // Create the request object
            DbClientConstraintRequest request = new DbClientConstraintRequest
            {
                TableName = tableName,
                ColumnName = columnName,
                ConstraintType = constraintType,
                ConstraintName = constraintName,
                ClientSolnid = solutionid,
                IsAdminOwn = IsAdmin
            };

            // Execute the request
            DbClientConstraintResponse response = this.ServiceClient.Post<DbClientConstraintResponse>(request);

            // Ensure the message consistency
            if (response.Message == "Constraint created successfully")
            {
                return Json(new { success = true, message = response.Message });
            }
            else
            {
                string errorMessage = response.Message.StartsWith("Error: ") ? response.Message : "Failed to create constraint: " + response.Message;
                return Json(new { success = false, message = errorMessage });
            }
        }


        public DbClientQueryResponse InsertQuery(string Query)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientInsertRequest { Query = Query, ClientSolnid = solutionid, IsAdminOwn = IsAdmin });
            return ress;
        }

        public DbClientQueryResponse DropQuery(string Query)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }
            DbClientQueryResponse ress = new DbClientQueryResponse();
            return ress;
        }

        public DbClientQueryResponse DeleteQuery(string Query)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientDeleteRequest { Query = Query, ClientSolnid = solutionid, IsAdminOwn = IsAdmin });
            return ress;
        }

        public DbClientQueryResponse AlterQuery(string Query)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientAlterRequest { Query = Query, ClientSolnid = solutionid, IsAdminOwn = IsAdmin });
            return ress;
        }

        private DbClientQueryResponse CreateQuery(string Query)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientCreateRequest { Query = Query, ClientSolnid = solutionid, IsAdminOwn = IsAdmin });
            return ress;
        }

        public DbClientQueryResponse TruncateQuery(string Query)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }
            DbClientQueryResponse ress = new DbClientQueryResponse();
            return ress;
        }

        public DbClientQueryResponse UpdateQuery(string Query)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientUpdateRequest { Query = Query, ClientSolnid = solutionid, IsAdminOwn = IsAdmin });
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
                _col.RenderType = _col.Type;
                Columns.Add(_col);
            }
            return Columns;
        }
    }
}
