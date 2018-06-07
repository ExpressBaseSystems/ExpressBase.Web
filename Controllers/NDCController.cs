using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RestSharp;
using System.Net.Http;
using System.Net;
using System.IO;
using System.Threading;
using System.Xml;
using Newtonsoft.Json;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class NDCController : Controller
    {
        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

		private string getRequestXml(AirShoppingReq temp)
		{
			string rawXml = @"<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:edis='http://www.iata.org/IATA/EDIST'>
   <soapenv:Header/>
   <soapenv:Body>
      <AirShoppingRQ xsi:schemaLocation='https://iflyrestest.ibsgen.com:6012/iRes_NdcRes_WS/services/NdcResServiceSOAPPort?xsd=../../xsd/ndcres/AirShoppingRQ.xsd' Version='' xmlns='http://www.iata.org/IATA/EDIST' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>
         <PointOfSale>
            <Location>
               <CountryCode>@countrycode</CountryCode>
            </Location>
         </PointOfSale>
         <Document>
            <Name>NDC</Name>
            <ReferenceVersion>15.1.2</ReferenceVersion>
         </Document>
         <Party>
            <Sender>
               <AgentUserSender>
                  <AgentUserID>@username</AgentUserID>
               </AgentUserSender>
            </Sender>
            <Recipient>
               <ORA_Recipient>
                  <AirlineID>@airlineid</AirlineID>
               </ORA_Recipient>
            </Recipient>
         </Party>
         <Travelers>
            <Traveler>
               <AnonymousTraveler>
                  <PTC Quantity='1'>ADT</PTC>
               </AnonymousTraveler>
            </Traveler>
         </Travelers>
         <CoreQuery>
            <OriginDestinations>
               <OriginDestination>
                  <Departure>
                     <AirportCode>@from</AirportCode>
                     <Date>@date</Date>
                  </Departure>
                  <Arrival>
                     <AirportCode>@to</AirportCode>
                  </Arrival>
                  <CalendarDates DaysAfter='2' DaysBefore='2'/>
               </OriginDestination>
            </OriginDestinations>
         </CoreQuery>
         <Preferences>
            <Preference>
               <TransferPreferences>
                  <Connection>
                     <MaxNumber>5</MaxNumber>
                  </Connection>
               </TransferPreferences>
            </Preference>
         </Preferences>
      </AirShoppingRQ>
   </soapenv:Body>
</soapenv:Envelope>".Replace("@from", temp.From).Replace("@to", temp.To).Replace("@date", temp.Date).Replace("@countrycode", temp.CountryCode).Replace("@airlineid", temp.AirlineID).Replace("@username", temp.UserName);
			return rawXml;
		}

		[HttpGet("/flightsearch/{from}/{to}/{date}")]
		public async Task<List<string>> AirShoppingSearchAsync(string from, string to, string date)
		{
			AirShoppingReq[] Arr = new AirShoppingReq[2];
            List<string> ReturnList = new List<string>(); 
			Arr[0] = new AirShoppingReq { From = from, To = to, Date = date, CountryCode = "DE",AirlineID = "XQ" , UserName = "HKTHONUSR", Url = "https://iflyrestest.ibsgen.com:6013/" };
			Arr[1] = new AirShoppingReq { From = "OKA", To = "NRT", Date = date, CountryCode = "KR", AirlineID = "JW" , UserName = "Guest EN", Url = "https://iflyresdemo.ibsplc.aero:6080/" };
			for (int i = 0; i < Arr.Length; i++)
			{
				string rawXml = getRequestXml(Arr[i]);

				var rClient = new RestClient(Arr[i].Url);
				rClient.AddDefaultHeader("username", "HKTHONUSR");
				rClient.AddDefaultHeader("password", "12345");
				object response = null;
				try
				{
					RestRequest req = new RestRequest("iRes_NdcRes_WS/services/NdcResServiceSOAPPort?wsdl", Method.POST);
					req.AddHeader("username", "HKTHONUSR");
					req.AddHeader("password", "12345");
					req.AddParameter("application/xml", rawXml, ParameterType.RequestBody);

					EventWaitHandle handle = new AutoResetEvent(false);
					rClient.ExecuteAsync(req, r =>
					{
						response = r;
						handle.Set();
					});
					handle.WaitOne();
				}
				catch (Exception ee)
				{
                    Console.WriteLine("Exception: " + ee.ToString());
                }

				XmlDocument doc = new XmlDocument();
				doc.LoadXml((response as IRestResponse).Content);
				string json = JsonConvert.SerializeXmlNode(doc);
                ReturnList.Add(json);
                
			}
			return ReturnList;
		}
	}
	public class AirShoppingReq
	{
		public string CountryCode;
		public string AirlineID;
		public string From;
		public string To;
		public string Date;
		public string UserName;
		public string Url;
	}
}
