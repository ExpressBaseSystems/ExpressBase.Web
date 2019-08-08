using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Models
{
    public class EbAuthResponse
    {
        public string Console { set; get; }

        public string RedirectUrl { set; get; }

        public string ErrorMessage { get; set; }

        public string CaptchaError { set; get; }

        public bool AuthStatus { set; get; }
    }
}
