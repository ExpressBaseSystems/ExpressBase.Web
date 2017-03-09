using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.ServiceStack.Models
{
    public class GoogleUser
    { 
        public string email { get; set; }
        
        public string name { get; set; }

        public string given_name { get; set; }

        public string family_name { get; set; }

        public string picture { get; set; }

        public string gender { get; set; }

        public string locale { get; set; }

        public string id { get; set; }
    }
}
