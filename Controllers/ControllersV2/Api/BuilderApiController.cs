using ExpressBase.Common;
using ExpressBase.Web.Filters;
using ExpressBase.Web.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ExpressBase.Web.Controllers.ControllersV2.Api
{
    [Route("internal/api/v2/[controller]")]
    [ApiController]
    public class BuilderApiController : ControllerBase
    {
        [ServiceFilter(typeof(SolutionContextFilter))]
        [TypeFilter(typeof(ApiUserAuthenticationFilter), Arguments = new object[] { RoutingConstants.DC })]
        [HttpGet("GetPublicFormUrl")]
        public IActionResult GetPublicFormUrl(string RefId)
        {
            var toReturn = new
            {
                RefId = RefId,
                PublicFormUrl = EbPublicFormHelper.GenerateUrl(this.HttpContext,Url, RefId)
            };

            return Ok(toReturn);
        }
    }
}
