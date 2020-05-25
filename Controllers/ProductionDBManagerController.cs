using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.ProductionDBManager;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using DiffPlex.DiffBuilder;
using DiffPlex;
using DiffPlex.DiffBuilder.Model;


// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class ProductionDBManagerController : EbBaseIntCommonController
    {
        public ProductionDBManagerController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        public IActionResult Index()
        {
            return View();
        }

        public Object CheckChangesInFiles(string solution_id)
        {
            CheckChangesInFilesResponse resp = this.ServiceClient.Post<CheckChangesInFilesResponse>((object)new CheckChangesInFilesRequest
            {
                SolutionId = solution_id
            });
            return resp;
        }

        public Object UpdateDBFilesByDB(string db_name, string solution)
        {
            UpdateDBFilesByDBResponse resp = this.ServiceClient.Post<UpdateDBFilesByDBResponse>((object)new UpdateDBFileByDBRequest
            {
                SolutionId = solution,
            });
            return resp;
        }

        public IActionResult DatabaseIntegrityCheck()
        {
            if (ViewBag.cid == "admin")
                if (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) || this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString()))
                {
                    GetSolutionForIntegrityCheckResponse resp = this.ServiceClient.Post<GetSolutionForIntegrityCheckResponse>(new GetSolutionForIntegrityCheckRequest
                    {
                    });
                    ViewBag.ChangesLog = resp.ChangesLog;
                    return View("ChangesView");
                }
            return Redirect("/StatusCode/401");
        }

        public Object UpdateInfraWithSqlScripts()
        {
            UpdateInfraWithSqlScriptsResponse resp = null;
            if (ViewBag.cid == "admin")
                if (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) || this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString()))
                {
                    resp = this.ServiceClient.Post<UpdateInfraWithSqlScriptsResponse>(new UpdateInfraWithSqlScriptsRequest
                    {
                    });
                    resp.isOwner = true;
                }
            resp.isOwner = false;
            return resp;
        }

        public Object GetFunctionOrProcedureQueries(Eb_FileDetails change, string solution_id)
        {
            GetFunctionOrProcedureQueriesResponse resp = this.ServiceClient.Post<GetFunctionOrProcedureQueriesResponse>((object)new GetFunctionOrProcedureQueriesRequest
            {
                ChangeList = change,
                SolutionId = solution_id
            });
            return resp;
        }

        public Object GetTableQueries(Eb_FileDetails change, string solution_id)
        {
            GetTableQueriesResponse resp = this.ServiceClient.Post<GetTableQueriesResponse>((object)new GetTableQueriesRequest
            {
                ChangeList = change,
                SolutionId = solution_id
            });
            return resp;
        }

        public Object ExecuteQuery(string query, string solution_id, string filename, string filetype)
        {
            ExecuteQueriesResponse resp = this.ServiceClient.Post<ExecuteQueriesResponse>((object)new ExecuteQueriesRequest
            {
                Query = query,
                SolutionId = solution_id,
                FileName = filename,
                FileType = filetype
            });
            return resp;
        }

        public Object GetScriptsForDiffView(string solution, string filename, string filepath, string filetype)
        {
            GetScriptsForDiffViewResponse resp = this.ServiceClient.Post<GetScriptsForDiffViewResponse>((object)new GetScriptsForDiffViewRequest
            {
                SolutionId = solution,
                FileHeader = filename,
                FilePath = filepath,
                FileType = filetype
            });
            resp.Result = GetDiffer(resp.InfraFileContent, resp.TenantFileContent);
            return resp;
        }

        public List<string> GetDiffer(string OldText, string NewText)
        {
            List<string> Diff = new List<string>();
            SideBySideDiffBuilder inlineBuilder = new SideBySideDiffBuilder(new Differ());
            SideBySideDiffModel diffmodel = inlineBuilder.BuildDiffModel(OldText, NewText);
            Diff.Add(Differ(diffmodel.OldText));
            Diff.Add(Differ(diffmodel.NewText));
            return Diff;
        }

        private string Differ(DiffPaneModel text)
        {
            const string spaceValue = "&nbsp;";
            const string tabValue = "&#9;";
            string html = "<div class=" + "'diffpane col-md-12'" + "><table cellpadding='0' cellspacing='0' class='diffTable'>";

            foreach (DiffPiece diffLine in text.Lines)
            {
                html += "<tr>";
                html += "<td class='lineNumber'>";
                html += diffLine.Position.HasValue ? diffLine.Position.ToString() : "&nbsp;";
                html += "</td>";
                html += "<td class='line " + diffLine.Type.ToString() + "Line'>";
                html += "<span class='lineText'>";

                if (diffLine.Type == ChangeType.Deleted || diffLine.Type == ChangeType.Inserted || diffLine.Type == ChangeType.Unchanged)
                {
                    html += diffLine.Text.Replace(" ", spaceValue.ToString()).Replace("\t", tabValue.ToString());
                }
                else if (diffLine.Type == ChangeType.Modified)
                {
                    foreach (DiffPiece character in diffLine.SubPieces)
                    {
                        if (character.Type == ChangeType.Imaginary) continue;
                        else
                        {
                            html += "<span class='" + character.Type.ToString() + "Character'>";
                            html += character.Text.Replace(" ", spaceValue.ToString()).Replace("\t", tabValue.ToString());
                            html += "</span>";
                        }
                    }
                }

                html += "</span>";
                html += "</td>";
                html += "</tr>";
            }

            html += "</table></div>";

            return html;
        }

        [HttpGet("/LastAccess")]
        public string LastAccess()
        { 
            if (ViewBag.cid == "admin")
                if (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) || this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString()))
                {
                     this.ServiceClient.Post(new LastSolnAccessRequest { SolnId = ViewBag.cid });
                    return "Servicestack is processing your request. Check mail after sometime.";
                }            
            return "No prmission";
        }

    }
}
