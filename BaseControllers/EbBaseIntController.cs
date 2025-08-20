﻿using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Common.ServiceStack.Auth;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack;
using ServiceStack.Messaging;
using ServiceStack.Redis;
using System;
using System.IdentityModel.Tokens.Jwt;

namespace ExpressBase.Web.Controllers
{
    public class EbBaseIntController : EbBaseController
    {
        protected RedisMessageQueueClient RedisMessageQueueClient { get; set; }

        protected RedisMessageProducer RedisMessageProducer { get; set; }

        public EbBaseIntController(IServiceClient _ssclient) : base(_ssclient) { }

        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis, PooledRedisClientManager pooledRedisManager) : base(_ssclient, _redis, pooledRedisManager) { }

        public EbBaseIntController(IServiceClient _ssclient, IEbMqClient _mqc) : base(_ssclient, _mqc) { }

        public EbBaseIntController(IServiceClient _ssclient, IEbStaticFileClient _sfc) : base(_ssclient, _sfc) { }

        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc) : base(_ssclient, _redis, _mqc) { }

        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _sfc) { }
        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc, EbStaticFileClient2 _sfc2) : base(_ssclient, _redis, _sfc, _sfc2) { }

        public EbBaseIntController(IServiceClient _ssclient, IEbMqClient _mqc, IEbStaticFileClient _sfc) : base(_ssclient, _mqc, _sfc) { }

        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _mqc, _sfc) { }

        public EbBaseIntController(IServiceClient _client, IRedisClient _redis, IEbStaticFileClient _sfc, IEbAuthClient _auth) : base(_client, _redis, _sfc, _auth) { }

        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis, IEbServerEventClient _sec) : base(_ssclient, _redis, _sec) { }

        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis, IEbServerEventClient _sec, PooledRedisClientManager pooledRedisManager) : base(_ssclient, _redis, _sec, pooledRedisManager) { }

        public EbBaseIntController(IServiceClient _ssclient, IRedisClient _redis, IMessageQueueClient _mqFactory, IMessageProducer _mqProducer)
            : base(_ssclient, _redis)
        {
            this.RedisMessageQueueClient = _mqFactory as RedisMessageQueueClient;
            this.RedisMessageProducer = _mqProducer as RedisMessageProducer;
        }

    }
}
