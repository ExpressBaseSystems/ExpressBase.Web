using ExpressBase.Common.Data;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web.Filters;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;

namespace ExpressBase.Web.Controllers
{
    [Route("api/v2")]
    public class ApiV2Controller : EbBaseIntApiController
    {
        public ApiV2Controller(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [Route("data/visualization")]
        [EbApiAuthGaurd]
        public ActionResult<MobileDataResponse> GetMobileData(string refid, int limit, int offset, string param, string sort_order, string search)
        {
            if (string.IsNullOrEmpty(refid)) return BadRequest("refid must be set");

            try
            {
                EbMobileDataRequest request = new EbMobileDataRequest
                {
                    RefId = refid,
                    Limit = limit,
                    Offset = offset
                };

                if (param != null)
                    request.Parameters.AddRange(JsonConvert.DeserializeObject<List<Param>>(param));

                if (sort_order != null)
                    request.SortColumns.AddRange(JsonConvert.DeserializeObject<List<SortColumn>>(sort_order));

                if (search != null)
                    request.SearchColumns.AddRange(JsonConvert.DeserializeObject<List<Param>>(search));

                return ServiceClient.Get(request);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
