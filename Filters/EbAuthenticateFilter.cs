using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

namespace ExpressBase.Web.Filters
{
    public class EbAuthenticateFilter : ActionFilterAttribute
    {

    }
}
