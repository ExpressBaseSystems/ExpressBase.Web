﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;

namespace ExpressBase.Web2
{
	public class Program
	{
		public static void Main(string[] args)
		{
			var host = new WebHostBuilder()
				.UseKestrel(options => {
					options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(5);
					options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(5);
					options.Limits.MinResponseDataRate = null;
				})
				.UseContentRoot(Directory.GetCurrentDirectory())
				//.UseUrls("http://*:41500/", "https://*:41502/")
				.UseUrls(urls: "http://*:41500/")
				.UseStartup<Startup>()
				.Build();
			host.Run();
		}
	}
}
