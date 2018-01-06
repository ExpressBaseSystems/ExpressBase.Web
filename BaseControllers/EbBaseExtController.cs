using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.BaseControllers
{
    public class EbBaseExtController : EbBaseController
    {
        public EbBaseExtController(IServiceClient _ssclient) : base(_ssclient) { }

        public EbBaseExtController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }
    }
}