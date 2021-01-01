using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;

namespace ExpressBase.Web.Controllers
{
    [Route("api/v2")]
    public class ApiV2Controller : EbBaseIntApiController
    {
        public ApiV2Controller(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [Route("data/visualization")]
        public ActionResult<MobileDataResponse> GetMobileData(string refid, int limit, int offset, string param, string sort_order, string search)
        {
            if (!Authenticated)
            {
                return Unauthorized();
            }


            return null;
        }
    }
}
