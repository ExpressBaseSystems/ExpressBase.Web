using ExpressBase.Common.ServiceClients;
using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.BaseControllers
{
    public class EbBaseExtController : EbBaseController
    {
        public EbBaseExtController(IServiceClient _ssclient) : base(_ssclient) { }

        public EbBaseExtController(IEbStaticFileClient _sfc) : base(_sfc) { }

        public EbBaseExtController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public EbBaseExtController(IServiceClient _ssclient, IEbStaticFileClient _sfc) : base(_ssclient, _sfc) { }

        public EbBaseExtController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _sfc) { }
    }
}