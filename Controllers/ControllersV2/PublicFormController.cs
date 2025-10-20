using ExpressBase.Common;
using ExpressBase.Common.Extensions;
using ExpressBase.Common.Helpers;
using ExpressBase.Objects.Dtos;
using ExpressBase.Web.Filters;
using ExpressBase.Web.Helpers;
using Microsoft.AspNetCore.Mvc;
using System;

namespace ExpressBase.Web.Controllers.ControllersV2
{
    [ServiceFilter(typeof(SolutionContextFilter))]
    [ServiceFilter(typeof(PublicUserAuthenticationFilter))]
    public class PublicFormController : Controller
    {
        [HttpGet("v2/PublicForm")]
        public IActionResult Index(string publicFormQparams)
        {

            try
            {

                if(publicFormQparams == null)
                {
                    throw new ArgumentNullException(nameof(publicFormQparams), "publicFormQparams is required");
                }

                string base64Key = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_AES_ENC_KEY) ?? throw new Exception(EnvironmentConstants.EB_AES_ENC_KEY + " EnvironmentConstant not found");

                PublicFormV2QueryParamsDto dto =
                    QueryStringEncDecHelper.DecryptEncryptedString<PublicFormV2QueryParamsDto>(publicFormQparams, base64Key);

                string publicFormRefId = dto.PublicFormRefId;
                //string sourceFormRefId = publicFormV2QueryParamsDto.SourceFormRefId;
                //int formDataId = publicFormV2QueryParamsDto.FormDataId;


                if (StringHelper.HasValue(publicFormRefId) == false)
                {

                    throw new ArgumentNullException(nameof(publicFormRefId), "publicFormRefId is required");
                }

                string paramsToPrefillInPublicForm = String.Empty;

                if (dto.PrefillParams != null)
                {

                    paramsToPrefillInPublicForm = Newtonsoft.Json.JsonConvert.SerializeObject(dto.PrefillParams).ToBase64();
                }

                return RedirectToAction(
                        "Index",
                        "WebForm",
                        new
                        {
                            _r = publicFormRefId,
                            _p = paramsToPrefillInPublicForm,
                            _m = "2",
                            _l = "1",
                            _rm = "5"
                        }
                   );
            }
            catch (Exception ex)
            {
                return InternalExcepionHelper.Redirect(ex, this, TimeSpan.FromSeconds(120));
            }
     
        }

    }
}
