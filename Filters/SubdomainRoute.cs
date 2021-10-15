using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Enums;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Routing;

namespace ExpressBase.Web.Filters
{
    public class AreaRouter : IRouter
    {
        private IRouter _routeHandler;

        public AreaRouter(IRouter routeHandler)
        {
            _routeHandler = routeHandler;
        }

        public VirtualPathData GetVirtualPath(VirtualPathContext context)
        {
            return _routeHandler.GetVirtualPath(context);
        }

        public new async Task RouteAsync(RouteContext context)
        {
            var host = context.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(CharConstants.DOT);

            if (context.HttpContext.Request.Path.Value.Equals(CharConstants.BACKSLASH.ToString()))
            {
                if (hostParts[0] == RoutingConstants.MYACCOUNT)
                {
                    context.RouteData.Values[RoutingConstants.CONTROLLER] = RoutingConstants.EXTCONTROLLER;
                    context.RouteData.Values[RoutingConstants.ACTION] = RoutingConstants.TENANTSIGNIN;
                }
                else
                {
                    context.RouteData.Values[RoutingConstants.CONTROLLER] = RoutingConstants.EXTCONTROLLER;
                    context.RouteData.Values[RoutingConstants.ACTION] = RoutingConstants.USERSIGNIN2UC;
                }
            }

            await _routeHandler.RouteAsync(context);
        }

        private void RouteToCorrectPage(RouteContext context, bool isGoing2SignIn2UC)
        {
            var host = context.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(CharConstants.DOT);

            if (isGoing2SignIn2UC) // USER CONSOLE
            {
                if (hostParts[0] == RoutingConstants.MYACCOUNT)
                {
                    context.RouteData.Values[RoutingConstants.CONTROLLER] = RoutingConstants.EXTCONTROLLER;
                    context.RouteData.Values[RoutingConstants.ACTION] = RoutingConstants.TENANTSIGNIN;
                }
                else
                {
                    context.RouteData.Values[RoutingConstants.CONTROLLER] = RoutingConstants.EXTCONTROLLER;
                    context.RouteData.Values[RoutingConstants.ACTION] = RoutingConstants.USERSIGNIN2UC;
                }
            }
            else // TENANT CONSOLE
            {
                context.RouteData.Values[RoutingConstants.CONTROLLER] = RoutingConstants.EXTCONTROLLER;
                context.RouteData.Values[RoutingConstants.ACTION] = RoutingConstants.INDEX;
            }
        }
    }
}