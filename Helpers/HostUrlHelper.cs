using ExpressBase.Common;
using System;

namespace ExpressBase.Web.Helpers
{
    public static class HostUrlHelper
    {
        /// <summary>
        /// Returns the host URL based on ASPNETCORE_ENVIRONMENT.
        /// Development => http://{subdomain}.localhost[:port]
        /// Staging/Production => https://{subdomain}.{domain}
        /// </summary>
        public static string GePublictHostUrl(string subdomain, int devPort = 41500)
        {
            string env = Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT)
                          ?? "Development";

            string baseDomain;
            string scheme;

            switch (env.ToLowerInvariant())
            {
                case "development":
                    baseDomain = RoutingConstants.LOCALHOSTADDRESS;
                    scheme = "http";

                    if (devPort > 0)
                        return $"{scheme}://{subdomain}{baseDomain}:{devPort}";
                    else
                        return $"{scheme}://{subdomain}{baseDomain}";

                case "staging":
                    baseDomain = RoutingConstants.STAGEHOSTADDRESS;
                    scheme = "https";
                    break;

                case "production":
                    baseDomain = RoutingConstants.LIVEHOSTADDRESS;
                    scheme = "https";
                    break;

                default:
                    baseDomain = RoutingConstants.LOCALHOSTADDRESS; 
                    scheme = "http";

                    if (devPort > 0)
                        return $"{scheme}://{subdomain}{baseDomain}:{devPort}";
                    else
                        return $"{scheme}://{subdomain}{baseDomain}";
            }

            
            return $"{scheme}://{subdomain}{baseDomain}";
        }
    }
}
