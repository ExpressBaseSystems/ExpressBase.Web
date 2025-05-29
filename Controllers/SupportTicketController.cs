using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System.Net.Http.Formatting;
using Microsoft.AspNetCore.Http;
using System.Collections.Specialized;
using System.IO;
using ExpressBase.Common.LocationNSolution;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class SupportTicketController : EbBaseIntCommonController
    {
        public SupportTicketController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        // GET: /<controller>/
        public IActionResult bugsupport()
        {


            //to fetch all details of tickets of corresponding user of that corresponding solution to show as tables
            if (ViewBag.cid.Equals("admin"))
            {
                AdminSupportResponse asr = this.ServiceClient.Post<AdminSupportResponse>(new AdminSupportRequest { });
                ViewBag.tkttable = JsonConvert.SerializeObject(asr);
            }
            else
            {
                FetchSupportResponse fsr = this.ServiceClient.Post<FetchSupportResponse>(new FetchSupportRequest { });
                ViewBag.tkttable = JsonConvert.SerializeObject(fsr);

            }



            return View();
        }
        public IActionResult BugTickets()
        {
            // Fetch all tickets
            FetchSupportResponse fsr = this.ServiceClient.Post<FetchSupportResponse>(new FetchSupportRequest());

            // Debugging: Log the count of tickets fetched
            Console.WriteLine($"Active Tickets Count: {fsr.ActiveTicket?.Count ?? 0}");
            Console.WriteLine($"Closed Tickets Count: {fsr.ClosedTicket?.Count ?? 0}");

            // Return both Active and Closed tickets as JSON
            var result = new
            {
                ActiveTickets = fsr.ActiveTicket ?? new List<TicketLite>(),
                ClosedTickets = fsr.ClosedTicket ?? new List<TicketLite>()
            };

            return Json(result);
        }
        [HttpGet]
        public IActionResult GetTicketById(string ticketId)
        {
            if (string.IsNullOrWhiteSpace(ticketId))
            {
                return BadRequest("Ticket ID is required.");
            }

            // Call service to get the ticket details
            var request = new GetTicketByIdRequest { TicketId = ticketId };
            GetTicketByIdResponse response = this.ServiceClient.Get(request);

            if (response?.Ticket != null)
            {
                return Json(response.Ticket);
            }
            else
            {
                return NotFound("Ticket not found.");
            }
        }



        public IActionResult EditTicket(string tktno)
        {
            if (ViewBag.wc.Equals("tc"))
            {
                //to fetch solution id,name from tenant table  to show in dropdown
                TenantSolutionsResponse ts = this.ServiceClient.Post<TenantSolutionsResponse>(new TenantSolutionsRequest { });
                ViewBag.sol_ids = ts;
            }
            if (ViewBag.cid.Equals("admin"))
            {
                FetchAdminsResponse far = this.ServiceClient.Post<FetchAdminsResponse>(new FetchAdminsRequest { });
                ViewBag.AdminNames = far.AdminNames;
            }

            if (tktno == "newticket")
            {
                ViewBag.new_mode = true;
                ViewBag.tktdetails = ("sd");
                ViewBag.SptHstry = ("hk");
            }
            else
            {
                // fectch complete details of ticket and show it in edit /view ticket
                SupportDetailsResponse sd = this.ServiceClient.Post<SupportDetailsResponse>(new SupportDetailsRequest
                {
                    ticketno = tktno,
                    Usertype = this.LoggedInUser.wc

                });

                for (var i = 0; i < sd.supporttkt.Count; i++)
                {
                    var filecolect = sd.supporttkt[i].Fileuploadlst;
                }
                ViewBag.new_mode = false;
                ViewBag.tktdetails = JsonConvert.SerializeObject(sd);
                if (sd.SdrStatus == true)
                {
                    SupportHistoryResponse Sh = this.ServiceClient.Post<SupportHistoryResponse>(new SupportHistoryRequest
                    {
                        TicketNo = tktno,
                        UserType = this.LoggedInUser.wc,
                        UserObject = this.LoggedInUser
                    });
                    ViewBag.SptHstry = JsonConvert.SerializeObject(Sh);
                }


            }
            return View();
        }



        [HttpPost]

        public void SaveBugDetails(string title, string stats, string descp, string priority, string solid, string type_f_b, object fileCollection)
        {
            string usrtyp = null;
            SaveBugRequest sbrequest = new SaveBugRequest();
            var httpreq = this.HttpContext.Request.Form;
            if (ViewBag.wc.Equals("dc"))
            {
                solid = ViewBag.cid;
                usrtyp = "developer";
            }
            else if (ViewBag.wc.Equals("uc"))
            {
                solid = ViewBag.cid;
                usrtyp = "user";
            }
            else if (ViewBag.wc.Equals("tc"))
            {
                solid = httpreq["solid"].ToString();
                usrtyp = "tenant";
            }

            if (httpreq.Files.Count > 0)
            {
                byte[] fileData = null;

                for (int i = 0; i < httpreq.Files.Count; i++)
                {
                    var file = httpreq.Files[i];
                    if ((file.ContentType == "image/jpeg") || (file.ContentType == "image/jpg") || (file.ContentType == "image/png") || (file.ContentType == "application/pdf"))
                    {
                        if (file.Length < 2097152)
                        {

                            FileUploadCls flup = new FileUploadCls();
                            using (var memoryStream = new MemoryStream())
                            {
                                file.CopyTo(memoryStream);
                                memoryStream.Seek(0, SeekOrigin.Begin);
                                fileData = new byte[memoryStream.Length];
                                memoryStream.ReadAsync(fileData, 0, fileData.Length);
                                flup.Filecollection = fileData;
                            }
                            flup.FileName = file.FileName;
                            flup.ContentType = file.ContentType;
                            sbrequest.Fileuploadlst.Add(flup);
                        }
                    }
                }
            }

            sbrequest.title = httpreq["title"].ToString();
            sbrequest.description = httpreq["descp"].ToString();
            sbrequest.priority = httpreq["priority"].ToString();
            sbrequest.solutionid = solid;
            sbrequest.type_b_f = httpreq["type_f_b"].ToString();
            sbrequest.status = httpreq["stats"].ToString(); ;
            sbrequest.usertype = usrtyp;
            sbrequest.fullname = this.LoggedInUser.FullName;
            sbrequest.email = this.LoggedInUser.Email;


            SaveBugResponse sbr = this.ServiceClient.Post<SaveBugResponse>(sbrequest);
        }

        [HttpPost]
        public SubmitTicketResponse SubmitTicketDetails(string title, string stats, string descp, string priority, string solid, string type)
        {
            var stresponse = new SubmitTicketResponse();
            string usrtyp = null;
            var strequest = new SubmitTicketRequest();
            var httpreq = this.HttpContext.Request.Form;

            try
            {
                // Determine user type and solution ID based on ViewBag.wc
                if (ViewBag.wc.Equals("dc"))
                {
                    solid = ViewBag.cid;
                    usrtyp = "developer";
                }
                else if (ViewBag.wc.Equals("uc"))
                {
                    solid = ViewBag.cid;
                    usrtyp = "user";
                }
                else if (ViewBag.wc.Equals("tc"))
                {
                    solid = httpreq["solid"].ToString();
                    usrtyp = "tenant";
                }


                // File upload part
                if (httpreq.Files.Count > 0)
                {
                    Console.WriteLine($"Total files received: {httpreq.Files.Count}");

                    foreach (var file in httpreq.Files)
                    {
                        Console.WriteLine($"Received File: {file.FileName} - {file.ContentType} - {file.Length} bytes");

                        if (file != null && file.Length > 0)
                        {
                            FileUploadCls flup = new FileUploadCls();
                            using (var memoryStream = new MemoryStream())
                            {
                                file.CopyTo(memoryStream);
                                flup.Filecollection = memoryStream.ToArray();
                            }
                            flup.FileName = file.FileName;
                            flup.ContentType = file.ContentType;
                            strequest.Fileuploadlst.Add(flup);
                        }
                    }
                }

                // Populate the SubmitTicketRequest object with form data
                strequest.title = httpreq["title"].ToString();
                strequest.description = httpreq["description"].ToString();
                strequest.priority = httpreq["priority"].ToString();
                strequest.solutionid = solid; // Use the 'solid' parameter
                strequest.type_b_f = httpreq["type_f_b"].ToString(); // Use type_f_b from js
                strequest.status = httpreq["status"].ToString();
                strequest.usertype = usrtyp;
                strequest.fullname = this.LoggedInUser.FullName;
                strequest.email = this.LoggedInUser.Email;
                strequest.onBehalfOf = httpreq.ContainsKey("onBehalfOf") && int.TryParse(httpreq["onBehalfOf"], out int onBehalfValue)
             ? onBehalfValue
             : 0; // Default to 0 if no valid ID is provided


                // Post the ticket request to the service
                stresponse = this.ServiceClient.Post<SubmitTicketResponse>(strequest);

                // Check if there was an error
                if (!string.IsNullOrEmpty(stresponse.ErMsg))
                {
                    return stresponse;
                }

                // Handle the response from the service
                if (stresponse.Id > 0)
                {
                    stresponse.SuccessMessage = "Ticket has been submitted successfully.";
                }
                else
                {
                    stresponse.ErMsg = "Error occurred while saving the ticket.";
                }
            }
            catch (Exception e)
            {
                // Log the exception and set an error message in the response
                Console.WriteLine("Exception: " + e.Message + e.StackTrace);
                stresponse.ErMsg = "Unexpected error occurred: " + e.Message;
            }

            return stresponse;
        }

        [HttpGet]
        public Dictionary<int,string> GetUsers(string cid)
        {
           
                Eb_Solution s_obj = GetSolutionObject(cid); // Retrieve solution object
                if (s_obj != null && s_obj.Users != null)
                {
                    //    var usersList = s_obj.Users.Select(user => new
                    //    {
                    //        Id = user.UserId, // Adjust according to actual user properties
                    //        Name = user.UserName
                    //    }).ToList();

                    //    return Ok(usersList);
                    return  s_obj.Users;
                }
                return null;
            
           
        }



        [HttpPost]
        public IActionResult UpdateTicket()
        {
            try
            {
                var httpRequest = HttpContext.Request.Form;
                UpdateTicketRequest uptkt = new UpdateTicketRequest
                {
                    Fileuploadlst = new List<FileUploadCls>()
                };

                // Check required fields
                if (string.IsNullOrEmpty(httpRequest["updtkt"]))
                {
                    return Json(new { errorMessage = "Error: 'updtkt' field is missing in the request." });
                }
                if (string.IsNullOrEmpty(httpRequest["ticketId"]))
                {
                    return Json(new { errorMessage = "Error: 'ticketId' field is missing in the request." });
                }
                if (string.IsNullOrEmpty(httpRequest["solu_id"]))
                {
                    return Json(new { errorMessage = "Error: 'solu_id' field is missing in the request." });
                }

                // Deserialize JSON input
                Dictionary<string, string> changedTkt = JsonConvert.DeserializeObject<Dictionary<string, string>>(httpRequest["updtkt"]);
                uptkt.chngedtkt = changedTkt;
                uptkt.ticketid = httpRequest["ticketId"];
                uptkt.solution_id = httpRequest["solu_id"];
                uptkt.usrname = this.LoggedInUser?.FullName ?? "Unknown User";

                // Process uploaded files
                foreach (var file in httpRequest.Files)
                {
                    if (file.Length < 2097152) // Keep size restriction (2MB)
                    {
                        using (var memoryStream = new MemoryStream())
                        {
                            file.CopyTo(memoryStream);
                            byte[] fileData = memoryStream.ToArray();

                            uptkt.Fileuploadlst.Add(new FileUploadCls
                            {
                                Filecollection = fileData,
                                FileName = file.FileName,
                                ContentType = file.ContentType
                            });
                        }
                    }
                }


                // Debugging logs
                Console.WriteLine("Ticket update request received:");
                Console.WriteLine($"Ticket ID: {uptkt.ticketid}");
                Console.WriteLine($"Solution ID: {uptkt.solution_id}");
                Console.WriteLine($"Username: {uptkt.usrname}");
                Console.WriteLine($"Changes: {JsonConvert.SerializeObject(uptkt.chngedtkt)}");
                Console.WriteLine($"Attached Files: {uptkt.Fileuploadlst.Count}");

                // Call service
                UpdateTicketResponse upr = this.ServiceClient.Post<UpdateTicketResponse>(uptkt);

                if (upr.status)
                {
                    return Json(new { successMessage = "Ticket updated successfully" });
                }
                else
                {
                    return Json(new { errorMessage = "Failed to update ticket" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { errorMessage = $"Error: {ex.Message}" });
            }
        }



        public void UpdateTicketAdmin(string updtkt, string tktid, string solid)
        {

            UpdateTicketAdminRequest Uptkt = new UpdateTicketAdminRequest();
            Dictionary<string, string> chngtkt = JsonConvert.DeserializeObject<Dictionary<string, string>>(updtkt);
            var httpreq = this.HttpContext.Request.Form;

            Uptkt.chngedtkt = chngtkt;
            Uptkt.Ticketid = tktid;
            Uptkt.Solution_id = solid;
            Uptkt.usrname = this.LoggedInUser.FullName;
            UpdateTicketResponse upr = this.ServiceClient.Post<UpdateTicketResponse>(Uptkt);


        }

        public void ChangeStatus(string tktno, string reason)
        {
            ChangeStatusResponse sd = this.ServiceClient.Post<ChangeStatusResponse>(new ChangeStatusRequest
            {
                TicketNo = tktno,
                NewStatus = "Closed",
                UserName = this.LoggedInUser.FullName,
                Solution_id = ViewBag.cid,
                Reason = reason
            });


        }
        [HttpPost]
        public IActionResult Comment(string TicketNo, string Comments, string UserName, string Solution_id,string currentUserid)
        {
            CommentResponse Cr = this.ServiceClient.Post<CommentResponse>(new CommentRequest
            {
                TicketNo = TicketNo,
                Comments = Comments,
                UserName = UserName,
                Solution_id = Solution_id,
                currentUserid=currentUserid


            });

            return Json(Cr);
        }


        [HttpGet]
        public IActionResult CommentsByTicket(string tktno)
        {
            var response = this.ServiceClient.Post<CommentListResponse>(
                new CommentListRequest
                {
                    TicketNo = tktno
                });

            return Json(response);
        }





    }
}

