﻿using System;
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
            if (fsr.supporttkt != null)
            {
                Console.WriteLine($"Fetched Tickets Count: {fsr.supporttkt.Count}");
            }
            else
            {
                Console.WriteLine("No tickets found in the response.");
            }

            // Directly return all tickets as JSON response
            // No filtering is done here
            return Json(fsr.supporttkt ?? new List<SupportTktCls>());
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
        public SubmitTicketResponse SubmitTicketDetails(string title, string stats, string descp, string priority, string solid, string type, object fileCollection)
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
                    byte[] fileData = null;

                    for (int i = 0; i < httpreq.Files.Count; i++)
                    {
                        var file = httpreq.Files[i];
                        if ((file.ContentType == "image/jpeg") || (file.ContentType == "image/jpg") || (file.ContentType == "image/png") || (file.ContentType == "application/pdf"))
                        {
                            if (file.Length < 2097152) // File size limit: 2MB
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
                                strequest.Fileuploadlst.Add(flup);
                            }
                        }
                    }
                }


                // Populate the SubmitTicketRequest object with form data
                strequest.title = httpreq["title"].ToString();
                strequest.description = httpreq["description"].ToString();
                strequest.priority = httpreq["priority"].ToString();
                strequest.solutionid = solid;
                strequest.type_b_f = httpreq["type"].ToString();
                strequest.status = httpreq["stats"].ToString();
                strequest.usertype = usrtyp;
                strequest.fullname = this.LoggedInUser.FullName;
                strequest.email = this.LoggedInUser.Email;

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

        public void UpdateTicket(string filedelet, string solu_id, string tktid, string updtkt)
        {

            UpdateTicketRequest Uptkt = new UpdateTicketRequest();
            var httpreq = this.HttpContext.Request.Form;

            Dictionary<string, string> chngtkt = JsonConvert.DeserializeObject<Dictionary<string, string>>(updtkt);
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
                            Uptkt.Fileuploadlst.Add(flup);
                        }
                    }
                }
            }

            Uptkt.Filedel = JsonConvert.DeserializeObject<int[]>(filedelet);
            Uptkt.usrname = this.LoggedInUser.FullName;
            Uptkt.chngedtkt = chngtkt;
            Uptkt.ticketid = tktid;
            if (this.LoggedInUser.wc.Equals("tc"))
            {
                Uptkt.solution_id = solu_id;
            }
            else
            {
                Uptkt.solution_id = ViewBag.cid;
            }
            UpdateTicketResponse upr = this.ServiceClient.Post<UpdateTicketResponse>(Uptkt);

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
        public void Comment(string tktno, string cmnt)
        {
            CommentResponse Cr = this.ServiceClient.Post<CommentResponse>(new CommentRequest
            {
                TicketNo = tktno,
                Comments = cmnt,
                UserName = this.LoggedInUser.FullName,
                Solution_id = ViewBag.cid
            });


        }

    }
}
