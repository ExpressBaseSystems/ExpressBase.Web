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

        private string getAirShoppingRequestXml(AirShoppingReq temp)
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

        private string getSeatAvailabilityRequestXml()
        {
            string rawXml = @"<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:edis='http://www.iata.org/IATA/EDIST'>
   <soapenv:Header/>
   <soapenv:Body>
      <edis:SeatAvailabilityRQ EchoToken='6546' TimeStamp='2016-11-21T23:38:00' Target='Production' Version='33' TransactionIdentifier='3' SequenceNmbr='33' TransactionStatusCode='Start' RetransmissionIndicator='true' CorrelationID='3' AsynchronousAllowedInd='true'>
         <edis:PointOfSale>
            <edis:Location>
               <edis:CountryCode>DE</edis:CountryCode>
               <edis:CityCode>FRA</edis:CityCode>
            </edis:Location>
         </edis:PointOfSale>
         <edis:Document>
            <edis:Metadata/>
            <edis:Name>NDC</edis:Name>
            <edis:ReferenceVersion>15.1.2</edis:ReferenceVersion>
         </edis:Document>
         <edis:Party>
            <edis:Sender>
               <edis:AgentUserSender>
                  <edis:AgentUserID>@agentuserid</edis:AgentUserID>
               </edis:AgentUserSender>
            </edis:Sender>
            <edis:Recipient>
               <edis:ORA_Recipient>
                  <edis:AirlineID>@airlineid</edis:AirlineID>
                  <edis:Name>SunExpress</edis:Name>
               </edis:ORA_Recipient>
            </edis:Recipient>
         </edis:Party>
         <edis:ShoppingResponseIDs>
            <edis:Owner>XQ</edis:Owner>
            <edis:ResponseID>1F126AF1-7FCF-414F-8A3D-E4FFA408F747</edis:ResponseID>
         </edis:ShoppingResponseIDs>
         <edis:Query>
            <edis:OriginDestination>
               <edis:OriginDestinationReferences>XQ_OD_1</edis:OriginDestinationReferences>
            </edis:OriginDestination>
         </edis:Query>
         <edis:DataList>
            <edis:FlightSegmentList>
               <edis:FlightSegment SegmentKey='@segmentid'>
                  <edis:Departure>
                     <edis:AirportCode>@depcode</edis:AirportCode>
                     <edis:Date>@depdate</edis:Date>
                     <edis:Time>@deptime</edis:Time>
                  </edis:Departure>
                  <edis:Arrival>
                     <edis:AirportCode>@arrcode</edis:AirportCode>
                     <edis:Date>@arrdate</edis:Date>
                     <edis:Time>@arrtime</edis:Time>
                     <edis:ChangeOfDay>0</edis:ChangeOfDay>
                  </edis:Arrival>
                  <edis:MarketingCarrier>
                     <edis:AirlineID>@airlineid</edis:AirlineID>
                     <edis:FlightNumber>@flightno</edis:FlightNumber>
                  </edis:MarketingCarrier>
                  <edis:Equipment>
                     <edis:AircraftCode>@aircraftcode</edis:AircraftCode>
                  </edis:Equipment>
            </edis:FlightSegment>
            </edis:FlightSegmentList>
            <edis:OriginDestinationList>
               <edis:OriginDestination refs='@segmentid' OriginDestinationKey='XQ_OD_1'>
                  <edis:DepartureCode>@depcode</edis:DepartureCode>
                  <edis:ArrivalCode>@arrcode</edis:ArrivalCode>
                  <edis:FlightReferences>@segmentid</edis:FlightReferences>
               </edis:OriginDestination>
            </edis:OriginDestinationList>
         </edis:DataList>
         <edis:Metadata/>
      </edis:SeatAvailabilityRQ>
   </soapenv:Body>
</soapenv:Envelope>".Replace("@agentuserid", "HKTHONUSR").Replace("@airlineid", "XQ").Replace("@segmentid", "XQ_SEG_1519310046482").Replace("@depcode", "FRA").Replace("@depdate", "2018-03-25Z").Replace("@deptime", "10:30").Replace("@arrcode", "ADB").Replace("@arrdate", "2018-03-25Z").Replace("@arrtime", "14:35").Replace("@flightno", "911").Replace("@aircraftcode", "738");

            return rawXml;
        }

        [HttpGet]
        public async Task<string> SeatAvailabilitySearchAsync()
        {
            SeatAvailabality ReqPar = new SeatAvailabality();
            List<string> ReturnList = new List<string>();
            string rawXml = getSeatAvailabilityRequestXml();

            var rClient = new RestClient("https://iflyrestest.ibsgen.com:6013/");
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
                Console.WriteLine(ee.Message);
            }
            XmlDocument doc = new XmlDocument();
            doc.LoadXml((response as IRestResponse).Content);

            return JsonConvert.SerializeXmlNode(doc);
             
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
				string rawXml = getAirShoppingRequestXml(Arr[i]);

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

    public class Airport
    {
        public string sAirCode;
        public string sDate;
        public string sTime;
    }
    public class MarketingCarrier
    {
        public string sAirlineId;
        public string sFlightNumber;

    }
    public class SeatAvailabality
    {
        public string sAirlineId;
        public string sOrgDestRef;
        public string sFlightSeg;
        public string sFrom;
        public string sTo;
        public Airport aDep;
        public Airport aArr;
        public string sAircraftCode;
    }
}
