﻿using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Enums;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Internal;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace ExpressBase.Web.Filters
{
    public class AreaRouter : MvcRouteHandler, IRouter
    {
        private IActionContextAccessor _actionContextAccessor;
        private IActionInvokerFactory _actionInvokerFactory;
        private IActionSelector _actionSelector;
        private ILogger _logger;
        private DiagnosticSource _diagnosticSource;

        public AreaRouter(
            IActionInvokerFactory actionInvokerFactory,
            IActionSelector actionSelector,
            DiagnosticSource diagnosticSource,
            ILoggerFactory loggerFactory)
            : this(actionInvokerFactory, actionSelector, diagnosticSource, loggerFactory, actionContextAccessor: null)
        {
        }

        public AreaRouter(IActionInvokerFactory actionInvokerFactory, IActionSelector actionSelector, DiagnosticSource diagnosticSource,
            ILoggerFactory loggerFactory, IActionContextAccessor actionContextAccessor)
            : base(actionInvokerFactory, actionSelector, diagnosticSource,
            loggerFactory, actionContextAccessor)
        {
            _actionContextAccessor = actionContextAccessor;
            _actionInvokerFactory = actionInvokerFactory;
            _actionSelector = actionSelector;
            _diagnosticSource = diagnosticSource;
            _logger = loggerFactory.CreateLogger<MvcRouteHandler>();
        }

        public new async Task RouteAsync(RouteContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context));

            var host = context.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            var path = context.HttpContext.Request.Path;
            string[] hostParts = host.Split(CharConstants.DOT);

            //object _subDomain = null;
            //if (Enum.TryParse(typeof(SubDomains), hostParts[0], out _subDomain))
            //{
            //    context.RouteData.Values[RoutingConstants.CONTROLLER] = RoutingConstants.EB_PRODUCTS;
            //    context.RouteData.Values[RoutingConstants.ACTION] = ((SubDomains)_subDomain).ToString();
            //}

            /*else*/
            if (path.Value.Equals(CharConstants.BACKSLASH.ToString())) // '/'
            {
                if (Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT) == CoreConstants.PRODUCTION)
                    this.RouteToCorrectPage(context, (hostParts.Length == RoutingConstants.HOSTPARTSLEN_IS_3));

                else if (Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT) == CoreConstants.STAGING)
                    this.RouteToCorrectPage(context, (hostParts.Length == RoutingConstants.HOSTPARTSLEN_IS_3));

                else if (Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT) == CoreConstants.DEVELOPMENT)
                    this.RouteToCorrectPage(context, (hostParts.Length == RoutingConstants.HOSTPARTSLEN_IS_2));

                else
                {
                    context.RouteData.Values[RoutingConstants.CONTROLLER] = RoutingConstants.EXTCONTROLLER;
                    context.RouteData.Values[RoutingConstants.ACTION] = RoutingConstants.INDEX;
                }
            }

            await base.RouteAsync(context);
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