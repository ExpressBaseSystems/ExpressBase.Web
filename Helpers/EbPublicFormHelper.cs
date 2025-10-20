using ExpressBase.Common;
using ExpressBase.Common.Helpers;
using ExpressBase.Objects.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;

namespace ExpressBase.Web.Helpers
{
    public static class EbPublicFormHelper
    {
        public static string GenerateUrl(HttpContext HttpContext, IUrlHelper UrlHelper, string RefId)
        {
            string base64Key = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_AES_ENC_KEY) ?? throw new Exception(EnvironmentConstants.EB_AES_ENC_KEY + " EnvironmentConstant not found");

            var dto = new PublicFormV2QueryParamsDto
            {
                PublicFormRefId = RefId
            };

            return
                HttpContext.Items[RoutingConstants.SCHEME].ToString() +
                                    HttpContext.Items[RoutingConstants.USER_CONSOLE_HOST].ToString() +
                                    UrlHelper.Action(
                                        action: "Index",
                                        controller: "PublicForm",
                                        values: new { publicFormQparams = QueryStringEncDecHelper.EncryptString(dto, base64Key) }
                                    );
        }
    }
}
