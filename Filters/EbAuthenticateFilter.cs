using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;

namespace ExpressBase.Web.Filters
{
    public class EbAuthenticateFilter : ActionFilterAttribute
    {

    }

    public class EbApiAuthGaurd : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (context.Controller is EbBaseIntApiController apiController)
            {
                if (!apiController.IsAuthenticated())
                {
                    context.Result = new UnauthorizedResult();
                }
            }
        }
    }
}
