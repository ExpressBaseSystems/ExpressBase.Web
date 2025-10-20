using DocumentFormat.OpenXml.Presentation;
using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Helpers;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Threading.Tasks;

namespace ExpressBase.Web.Filters
{

    public sealed class SolutionContextFilter : IAsyncResourceFilter
    {
        private readonly IServiceClient _serviceClient;

        public SolutionContextFilter(IServiceClient serviceClient)
        {
            _serviceClient = serviceClient;
        }

        public Task OnResourceExecutionAsync(ResourceExecutingContext context, ResourceExecutionDelegate next)
        {
            string internalSolutionId;
            string externalSoultionId;

            if(context.HttpContext.Items.ContainsKey(RoutingConstants.EXTERNAL_SOLUTION_ID))
            {
                externalSoultionId = context.HttpContext.Items[RoutingConstants.EXTERNAL_SOLUTION_ID].ToString();

            } else
            {
                throw new InvalidOperationException("External solution ID not found in context.");
            }


            /*if (externalSoultionId == CoreConstants.MYACCOUNT)
            {
                internalSolutionId = CoreConstants.EXPRESSBASE;
            }
            else if (externalSoultionId == CoreConstants.ADMIN)
            {
                externalSoultionId = CoreConstants.ADMIN;
            }*/

            var redisManager = context.HttpContext.RequestServices.GetRequiredService<PooledRedisClientManager>();

            if(RedisCacheHelper.Exists(redisManager, string.Format(CoreConstants.SOLUTION_ID_MAP, externalSoultionId)))
            {
                internalSolutionId = RedisCacheHelper.Get<string>(redisManager,string.Format(CoreConstants.SOLUTION_ID_MAP, externalSoultionId));

            } else
            {
                this._serviceClient.Post<UpdateSidMapResponse>(new UpdateSidMapRequest { ExtSolutionId = externalSoultionId });
                internalSolutionId = RedisCacheHelper.Get<string>(redisManager, string.Format(CoreConstants.SOLUTION_ID_MAP, externalSoultionId));
            }

            context.HttpContext.Items[RoutingConstants.INTERNAL_SOLUTION_ID] = internalSolutionId ?? throw new InvalidOperationException("External solution ID is invalid.");

            return next();
           
        }
    }
}
