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
       // private string[] _allowedSubdomains = { "Vpn", "Password" };
        //These are actualy copies of same values from base class. Some of them are used later.
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

            string area = null;
            var host = context.HttpContext.Request.Host;
            var path = context.HttpContext.Request.Path;

            string[] subdomain = host.ToString().Split('.');
            string[] subpaths = path.ToString().Split('/');

            if (subpaths.Length <= 2)
            {
                if (subdomain.Length == 3) // DEV CONSOLE
                {
                    area = subdomain[1];
                    context.RouteData.Values["controller"] = "Ext"; //Goes to the relevant Controller  class
                    context.RouteData.Values["action"] = "DevSignIn";
                    // context.RouteData.Values["area"]= area;
                }
                else if (subdomain.Length == 2) // USER CONSOLE
                {
                    area = subdomain[0];
                    context.RouteData.Values["controller"] = "Ext"; //Goes to the relevant Controller  class
                    context.RouteData.Values["action"] = "UsrSignIn";
                    // context.RouteData.Values.Add("area", area);
                }
                else if (subdomain.Length == 1) // TENANT CONSOLE
                {
                    context.RouteData.Values["controller"] = "Ext"; //Goes to the relevant Controller  class
                    context.RouteData.Values["action"] = "Index";
                }
            }
            else
            {
                if (subdomain.Length == 3) // DEV CONSOLE
                    area = subdomain[1];
                else if (subdomain.Length == 2) // USER CONSOLE
                    area = subdomain[0];
                else if (subdomain.Length == 1) // TENANT CONSOLE
                    area = null;

                context.RouteData.Values["controller"] = subpaths[1]; //Goes to the relevant Controller  class
                context.RouteData.Values["action"]= subpaths[2];
                //context.RouteData.Values.Add("area", area);
            }

            await base.RouteAsync(context);
        }
    }
}