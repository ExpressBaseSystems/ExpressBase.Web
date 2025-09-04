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
using System.Linq;
using System.Text.RegularExpressions;

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
            int createdByUserId = this.LoggedInUser.UserId;

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
        {
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }

            string queryLower = Query.ToLower();

            // Block SELECT * on sensitive tables
            if (queryLower.Contains("select *") &&
               (queryLower.Contains("from eb_downloads") || queryLower.Contains("from eb_files_bytea")))
            {
                throw new InvalidOperationException("SELECT * is not allowed on tables with large BYTEA data. Please specify non-BYTEA columns explicitly.");
            }

            // Block SELECT of BYTEA columns directly from sensitive tables
            if ((queryLower.Contains("from eb_downloads") || queryLower.Contains("from eb_files_bytea")) &&
                queryLower.Contains("bytea"))
            {
                throw new InvalidOperationException("Selecting BYTEA columns directly is not allowed on these tables.");
            }

            DbClientQueryResponse ress = this.ServiceClient.Post<DbClientQueryResponse>(
                new DbClientSelectRequest { Query = Query, ClientSolnid = solutionid, IsAdminOwn = IsAdmin });

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
        [HttpPost]
        public ActionResult GetDbClientLogs(string tableName, bool Isadmin)
        {
            if (ViewBag.wc != RoutingConstants.DC)
            {
                return Unauthorized();
            }

            string solution = this.solutionid ?? ViewBag.Cid;

            DbClientLogsRequest request = new DbClientLogsRequest
            {
                TableName = tableName,
                SolutionId = solution,
                IsAdminOwn = Isadmin
            };

            try
            {
                List<DbClientLogsResponse> logs = this.ServiceClient.Post<List<DbClientLogsResponse>>(request);

                return Json(new
                {
                    success = true,
                    message = "Logs fetched successfully",
                    data = logs
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Failed to fetch logs",
                    error = ex.Message
                });
            }
        }





        public ActionResult CreateIndex(string tableName, string indexName, string indexColumns, bool Isadmin)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                return Unauthorized();
            }
            int createdByUserId = this.LoggedInUser.UserId;
            string solution = this.solutionid ?? ViewBag.Cid;
            // Create the request object
            DbClientIndexRequest request = new DbClientIndexRequest
            {
                TableName = tableName,
                IndexName = indexName,
                IndexColumns = indexColumns,
                ClientSolnid = solution,
                CreatedByUserId = createdByUserId,
                IsAdminOwn = Isadmin
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
        public ActionResult EditIndexName(string currentIndexName, string newIndexName, string tableName, bool Isadmin)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                return Unauthorized();
            }
            int createdByUserId = this.LoggedInUser.UserId;
            string solution = this.solutionid ?? ViewBag.Cid;

            // Create the request object
            DbClientEditIndexRequest request = new DbClientEditIndexRequest
            {
                CurrentIndexName = currentIndexName,
                NewIndexName = newIndexName,
                TableName = tableName,
                ClientSolnid = solution,
                CreatedByUserId = createdByUserId,
                IsAdminOwn = Isadmin
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
        public ActionResult CreateConstraint(string tableName, string columnName, string constraintType, string constraintName, bool Isadmin)
        {
            // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                return Unauthorized();
            }
            int createdByUserId = this.LoggedInUser.UserId;
            string solution = this.solutionid ?? ViewBag.Cid;
            // Create the request object
            DbClientConstraintRequest request = new DbClientConstraintRequest
            {
                TableName = tableName,
                ColumnName = columnName,
                ConstraintType = constraintType,
                ConstraintName = constraintName,
                ClientSolnid = solution,
                CreatedByUserId = createdByUserId,
                IsAdminOwn = Isadmin
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
        [HttpPost]
        public ActionResult GetFunctionHistory(string functionName)
        {
            if (ViewBag.wc != RoutingConstants.DC)
                return Unauthorized();

            string solution = this.solutionid ?? ViewBag.Cid;

            // Build request DTO
            DbClientFunctionHistoryRequest request = new DbClientFunctionHistoryRequest
            {
                FunctionName = functionName,
                SolutionId = solution,
                IsAdminOwn = true // or use ViewBag/LoggedInUser if needed
            };

            // Call service
            var history = this.ServiceClient.Post<List<DbClientFunctionHistoryResponse>>(request);

            return Json(new { success = true, data = history });
        }

        [HttpPost]
        public ActionResult LogEditedFunction(string functionName, string functionCode, bool Isadmin)
        {
            // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                return Unauthorized();
            }

            int createdByUserId = this.LoggedInUser.UserId;
            string solution = this.solutionid ?? ViewBag.Cid;

            // Build request
            DbClientLogEditedFunctionRequest request = new DbClientLogEditedFunctionRequest
            {
                FunctionName = functionName,
                FunctionCode = functionCode,
                ClientSolnid = solution,
                CreatedByUserId = createdByUserId,
                IsAdminOwn = Isadmin
            };

            // Call service
            DbClientLogEditedFunctionResponse response = this.ServiceClient.Post<DbClientLogEditedFunctionResponse>(request);

            if (response.Message == "Function edit logged successfully")
            {
                return Json(new { success = true, message = response.Message });
            }
            else
            {
                string errorMessage = response.Message.StartsWith("Error: ")
                    ? response.Message
                    : "Failed to log function edit: " + response.Message;

                return Json(new { success = false, message = errorMessage });
            }
        }



        [HttpPost]
        public ActionResult CreateFunction(string functionName, string functionCode, bool Isadmin)
        {
            // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                return Unauthorized();
            }
            int createdByUserId = this.LoggedInUser.UserId;
            string solution = this.solutionid ?? ViewBag.Cid;
            // Create the request object
            DbClientCreateFunctionRequest request = new DbClientCreateFunctionRequest
            {
                FunctionName = functionName,
                FunctionCode = functionCode,
                ClientSolnid = solution,
                IsAdminOwn = Isadmin,
                CreatedByUserId = createdByUserId

            };
            // Execute the request
            DbClientCreateFunctionResponse response = this.ServiceClient.Post<DbClientCreateFunctionResponse>(request);
            // Ensure the message consistency
            if (response.Message == "Function created successfully")
            {
                return Json(new
                {
                    success = true,
                    message = response.Message,
                    FunctionName = response.FunctionName
                });
            }
            else
            {
                string errorMessage = response.Message.StartsWith("Error: ")
                    ? response.Message
                    : "Failed to create function: " + response.Message;

                return Json(new
                {
                    success = false,
                    message = errorMessage
                });
            }
        }


        [HttpPost]
        public IActionResult GetFunctionByName(string functionName, string solution, bool isAdmin)
        {
            try
            {
                // Store solution and admin flag
                this.solutionid = solution;
                this.IsAdmin = isAdmin;


                // Call service to get functions
                var response = this.ServiceClient.Get(new GetDbTablesRequest
                {
                    IsAdminOwn = isAdmin,
                    ClientSolnid = solution,

                });

                // Search for matching function
                var matchedFunction = response.Tables.FunctionCollection
                    .FirstOrDefault(f => f.FunctionName == functionName);

                if (matchedFunction != null)
                {
                    return Json(new
                    {
                        success = true,
                        name = matchedFunction.FunctionName,
                        definition = matchedFunction.FunctionQuery
                    });
                }

                return Json(new { success = false, message = "Function not found" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }



        public DbClientQueryResponse InsertQuery(string Query)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }
            int createdByUserId = this.LoggedInUser.UserId;
            string solution = this.solutionid ?? ViewBag.Cid;
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientInsertRequest { Query = Query, ClientSolnid = solution, IsAdminOwn = IsAdmin,CreatedByUserId = createdByUserId });
            return ress;
        }

        public DbClientQueryResponse DropQuery(string Query)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }
            int createdByUserId = this.LoggedInUser.UserId;
            string solution = this.solutionid ?? ViewBag.Cid;
            DbClientQueryResponse ress = new DbClientQueryResponse();
            return ress;
        }

        public DbClientQueryResponse DeleteQuery(string Query)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }
            int createdByUserId = this.LoggedInUser.UserId;
            string solution = this.solutionid ?? ViewBag.Cid;
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientDeleteRequest { Query = Query, ClientSolnid = solution, IsAdminOwn = IsAdmin, CreatedByUserId = createdByUserId });
            return ress;
        }

        public DbClientQueryResponse AlterQuery(string Query)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }
            int createdByUserId = this.LoggedInUser.UserId;
            string solution = this.solutionid ?? ViewBag.Cid;
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientAlterRequest { Query = Query, ClientSolnid = solution, IsAdminOwn = IsAdmin, CreatedByUserId = createdByUserId });
            return ress;
        }

        private DbClientQueryResponse CreateQuery(string Query)
        {  // Check if the user is a developer
            if (ViewBag.wc != RoutingConstants.DC)
            {
                throw new UnauthorizedAccessException("Unauthorized access");
            }
            int createdByUserId = this.LoggedInUser.UserId;
            string solution = this.solutionid ?? ViewBag.Cid;
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientCreateRequest { Query = Query, ClientSolnid = solution, IsAdminOwn = IsAdmin, CreatedByUserId = createdByUserId });
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
            int createdByUserId = this.LoggedInUser.UserId;
            string solution = this.solutionid ?? ViewBag.Cid;
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
                else
                {
                    continue;
                }
                _col.EbSid = column.Type.ToString() + column.ColumnIndex;
                _col.RenderType = _col.Type;
                Columns.Add(_col);
            }
            return Columns;
        }
    }
}

