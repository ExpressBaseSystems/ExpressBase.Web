using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Helpers;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;

namespace ExpressBase.Web.Helpers
{
    public static class UserAuthenticationHelper
    {
        public static bool IsTokensValid(
            string refreshToken,
            string bearerToken,
            string internalSolutionId,
            string clientIp,
            string currentConsole
        )
        {
            if (StringHelper.HasValue(refreshToken) == false || StringHelper.HasValue(bearerToken) == false)
            {
                return false;
            }

            try
            {

                if (VerifySignature(refreshToken) && VerifySignature(bearerToken))
                {
                    var refreshTokenData = new JwtSecurityToken(refreshToken);
                    var bearerTokenData = new JwtSecurityToken(bearerToken);

                    if (bearerTokenData.Payload[TokenConstants.CID].ToString() == internalSolutionId)
                    {
                        string rSub = refreshTokenData.Payload[TokenConstants.SUB].ToString();
                        string bSub = bearerTokenData.Payload[TokenConstants.SUB].ToString();
                        string ipFromToken = bearerTokenData.Payload[TokenConstants.IP].ToString();
                        

                        var tokenExpiry = Convert.ToInt64(refreshTokenData.Payload[TokenConstants.EXP]);
                        DateTime tokenExpiryDateTime = DateTimeOffset.FromUnixTimeSeconds(tokenExpiry).UtcDateTime;

                        if(tokenExpiryDateTime < DateTime.UtcNow)
                        {
                            return false;
                        }

                        if(StringHelper.HasValue(ipFromToken) != false && clientIp != ipFromToken)
                        {
                            return false;
                        }

                        if (rSub == bSub)
                        {

                            string[] subParts = rSub.Split(CharConstants.COLON);

                            if (rSub.EndsWith(TokenConstants.TC))
                            {
                                return true;
                            }

                            else if (currentConsole == RoutingConstants.DC)
                            {
                                if (subParts[0] == internalSolutionId && rSub.EndsWith(TokenConstants.DC))
                                {
                                    return true;
                                }

                            }
                            else if (rSub.EndsWith(TokenConstants.UC) || rSub.EndsWith(TokenConstants.BC) || rSub.EndsWith(TokenConstants.MC) || rSub.EndsWith(TokenConstants.PC))
                            {
                                return true;
                            }
                        } 
                    }
                }
            }
            catch (Exception)
            {

                return false;
            }

            return false;
        }

        public static bool VerifySignature(string token)
        {
            string PublicKey = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_JWT_PUBLIC_KEY_XML);
            int pos1 = PublicKey.IndexOf("<Modulus>");
            int pos2 = PublicKey.IndexOf("</Modulus>");
            int pos3 = PublicKey.IndexOf("<Exponent>");
            int pos4 = PublicKey.IndexOf("</Exponent>");
            string modkeypub = PublicKey.Substring(pos1 + 9, pos2 - pos1 - 9);
            string expkeypub = PublicKey.Substring(pos3 + 10, pos4 - pos3 - 10);

            try
            {
                string[] tokenParts = token.Split('.');
                RSACryptoServiceProvider rsa = new RSACryptoServiceProvider();
                rsa.ImportParameters(
                  new RSAParameters()
                  {
                      Modulus = FromBase64Url(modkeypub),
                      Exponent = FromBase64Url(expkeypub)
                  });

                SHA256 sha256 = SHA256.Create();
                byte[] hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(tokenParts[0] + '.' + tokenParts[1]));

                RSAPKCS1SignatureDeformatter rsaDeformatter = new RSAPKCS1SignatureDeformatter(rsa);
                rsaDeformatter.SetHashAlgorithm("SHA256");
                if (rsaDeformatter.VerifySignature(hash, FromBase64Url(tokenParts[2])))
                {
                    return true;
                }
            }
            catch (Exception e) { Console.WriteLine("Exception from VerifySignature:" + e.ToString()); }
            return false;
        }

        public static byte[] FromBase64Url(string base64Url)
        {
            string padded = base64Url.Length % 4 == 0 ? base64Url : base64Url + "====".Substring(base64Url.Length % 4);

            string base64 = padded.Replace("_", "/").Replace("-", "+");

            return Convert.FromBase64String(base64);
        }

        public static User GetUserObject(
            PooledRedisClientManager pooledRedisManager, 
            IServiceClient serviceClient,
            string userId,
            string userAuthId,
            string currentConsole,
            string internalSolutionId
            )
        {

            if (RedisCacheHelper.Exists(pooledRedisManager, userAuthId)) 
            { 
                return RedisCacheHelper.Get<User>(pooledRedisManager, userAuthId);

            } else
            {
                serviceClient.Post(
                    new UpdateUserObjectRequest() 
                    { 
                        SolnId = internalSolutionId, 
                        UserId = Convert.ToInt32(userId), 
                        UserAuthId = userAuthId, 
                        WC = currentConsole, 
                        IsApiUser = false 
                    }
                );

                return RedisCacheHelper.Get<User>(pooledRedisManager, userAuthId);
            }

            
        }
    }
}
