﻿using ExpressBase.Data;
using Microsoft.AspNetCore.Http;
using ServiceStack;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web2.Models
{
    public class Displaydata
    {
        public int id { get; set; }
        
        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string MiddleName { get; set; }

       

   


    }
}
