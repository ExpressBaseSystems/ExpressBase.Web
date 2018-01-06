using ExpressBase.Common;
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

            var host = context.HttpContext.Request.Host.Host.Replace(DomainConstants.WWWDOT, string.Empty);
            var path = context.HttpContext.Request.Path;
            string[] hostParts = host.Split(DomainConstants.DOT);

            object _subDomain = null;
            if (Enum.TryParse(typeof(SubDomains), hostParts[0], out _subDomain))
            {
                context.RouteData.Values[DomainConstants.CONTROLLER] = DomainConstants.EB_PRODUCTS;
                context.RouteData.Values[DomainConstants.ACTION] = ((SubDomains)_subDomain).ToString();
            }
            
            else if (path.Value.Equals(DomainConstants.BACKSLASH.ToString())) // '/'
            {
                if (host.EndsWith(DomainConstants.EXPRESSBASEDOTCOM))
                    this.RouteToCorrectPage(context, (hostParts.Length == DomainConstants.HOSTPARTSLEN_IS_3));

                else if (host.EndsWith(DomainConstants.EBTESTINFO))
                    this.RouteToCorrectPage(context, (hostParts.Length == DomainConstants.HOSTPARTSLEN_IS_3));

                else if (host.EndsWith(DomainConstants.LOCALHOST))
                    this.RouteToCorrectPage(context, (hostParts.Length == DomainConstants.HOSTPARTSLEN_IS_2));

                else
                {
                    context.RouteData.Values[DomainConstants.CONTROLLER] = DomainConstants.EXTCONTROLLER;
                    context.RouteData.Values[DomainConstants.ACTION] = DomainConstants.INDEX;
                }
            }

            await base.RouteAsync(context);
        }

        private void RouteToCorrectPage(RouteContext context, bool isGoing2SignIn2UC)
        {
            if (isGoing2SignIn2UC) // USER CONSOLE
            {
                context.RouteData.Values[DomainConstants.CONTROLLER] = DomainConstants.EXTCONTROLLER; 
                context.RouteData.Values[DomainConstants.ACTION] = DomainConstants.USERSIGNIN2UC;
            }
            else // TENANT CONSOLE
            {
                context.RouteData.Values[DomainConstants.CONTROLLER] = DomainConstants.EXTCONTROLLER;
                context.RouteData.Values[DomainConstants.ACTION] = DomainConstants.INDEX;
            }
        }
    }
}