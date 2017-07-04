using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Internal;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
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

            var host = context.HttpContext.Request.Host.Host.Replace("www.", string.Empty);
            var path = context.HttpContext.Request.Path;
            string[] subdomain = host.Split('.');

            if (path == "/")
            {
                if (host.EndsWith("expressbase.com") || host.EndsWith("expressbase.org"))
                {
                    if (subdomain.Length == 3) // USER CONSOLE
                    {
                        context.RouteData.Values["controller"] = "Ext"; //Goes to the relevant Controller  class
                        context.RouteData.Values["action"] = "UsrSignIn";
                    }
                    else // TENANT CONSOLE
                    {
                        context.RouteData.Values["controller"] = "Ext"; //Goes to the relevant Controller  class
                        context.RouteData.Values["action"] = "Index";
                    }
                }
                else if (host.EndsWith("localhost"))
                {
                    if (subdomain.Length == 2) // USER CONSOLE
                    {
                        context.RouteData.Values["controller"] = "Ext"; //Goes to the relevant Controller  class
                        context.RouteData.Values["action"] = "UsrSignIn";
                    }
                    else // TENANT CONSOLE
                    {
                        context.RouteData.Values["controller"] = "Ext"; //Goes to the relevant Controller  class
                        context.RouteData.Values["action"] = "Index";
                    }
                }
            }
            await base.RouteAsync(context);
        }
    }
}