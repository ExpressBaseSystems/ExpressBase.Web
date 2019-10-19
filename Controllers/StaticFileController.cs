using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.EbServiceStack.ReqNRes;
using ExpressBase.Common.Enums;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ExpressBase.Web.Controllers
{
    public class StaticFileExtController : EbBaseExtController
    {
        public StaticFileExtController(IEbStaticFileClient _sfc) : base(_sfc) { }

        [HttpGet("images/logo/{solnid}")]
        public IActionResult GetLogo(string solnid)
        {
            solnid = solnid.SplitOnLast(CharConstants.DOT).First() + StaticFileConstants.DOTPNG;
            DownloadFileResponse dfs = null;
            ActionResult resp = new EmptyResult();

            try
            {

                HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=2628000";

                dfs = this.FileClient.Get<DownloadFileResponse>
                        (new DownloadLogoExtRequest
                        {
                            SolnId = solnid.Split(CharConstants.DOT)[0],
                        });
                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, GetMime(solnid));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }
            return resp;
        }

        [HttpGet("/wiki/images/{quality}/{refid}")]
        public IActionResult GetWikiImage(string refid, string quality)
        {
            DownloadFileResponse dfs = null;

            ActionResult resp = new EmptyResult();

            try
            {
                this.FileClient.Timeout = new TimeSpan(0, 5, 0);

                dfs = this.FileClient.Get<DownloadFileResponse>
                        (new DownloadWikiImgRequest
                        {
                            ImageInfo = new ImageMeta { FileRefId = Convert.ToInt32(refid.SplitOnLast(CharConstants.DOT).First()), FileCategory = EbFileCategory.Images, ImageQuality = Enum.Parse<ImageQuality>(quality) },

                            RefId = refid.Split(CharConstants.DOT)[0]
                        });
                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, GetMime(refid));
                }

            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }
            return resp;
        }

        [HttpGet("/eb/images/{quality}/{refid}")]
        public IActionResult GetInfraImages(string refid, string quality)
        {
            DownloadFileResponse dfs = null;

            ActionResult resp = new EmptyResult();

            try
            {
                this.FileClient.Timeout = new TimeSpan(0, 5, 0);

                dfs = this.FileClient.Get<DownloadFileResponse>
                        (new DownloadInfraImgRequest
                        {
                            ImageInfo = new ImageMeta { FileRefId = Convert.ToInt32(refid.SplitOnLast(CharConstants.DOT).First()), FileCategory = EbFileCategory.Images, ImageQuality = Enum.Parse<ImageQuality>(quality) },

                            RefId = refid.Split(CharConstants.DOT)[0]
                        });
                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, GetMime(refid));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }
            return resp;
        }

        private string GetMime(string fname)
        {
            return StaticFileConstants.GetMime[fname.SplitOnLast(CharConstants.DOT).Last().ToLower()];
        }
    }

    public class StaticFileController : EbBaseIntCommonController
    {
        public StaticFileController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _sfc) { }

        private const string UnderScore = "_";

        private const string RejexPattern = " *[\\~#%&*{}/:<>?|\"-]+ *";

        [HttpGet("images/dp/{userid}")]
        public IActionResult GetDP(string userid)
        {
            string uid = userid.Split(CharConstants.DOT).First();
            string fname = userid.SplitOnLast(CharConstants.DOT).First() + StaticFileConstants.DOTPNG;

            DownloadFileResponse dfs = null;
            ActionResult resp = new EmptyResult();

            try
            {
                dfs = this.FileClient.Get<DownloadFileResponse>
                        (new DownloadDpRequest
                        {
                            ImageInfo = new ImageMeta
                            {
                                FileName = uid,
                                FileType = StaticFileConstants.PNG,
                                FileCategory = EbFileCategory.Dp
                            }
                        });

                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=2628000";
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, GetMime(fname));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
                resp = new EmptyResult();
            }
            return resp;
        }

        [HttpGet("files/loc/{filename}")]
        public IActionResult GetLocFiles(string filename)
        {
            filename = filename.SplitOnLast(CharConstants.DOT).First() + StaticFileConstants.DOTPNG;

            DownloadFileResponse dfs = null;
            ActionResult resp = new EmptyResult();

            try
            {
                if (filename.StartsWith(StaticFileConstants.LOC))
                {
                    HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";

                    dfs = this.FileClient.Get<DownloadFileResponse>
                            (new DownloadFileRequest
                            {
                                FileDetails = new FileMeta
                                {
                                    FileName = filename,
                                    FileType = StaticFileConstants.PNG,
                                    FileCategory = EbFileCategory.LocationFile
                                }
                            });
                }

                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, GetMime(filename));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
                resp = new EmptyResult();
            }
            return resp;
        }

        [HttpGet("files/{filename}")]
        public IActionResult GetFile(string filename)
        {
            DownloadFileResponse dfs = null;
            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            ActionResult resp = new EmptyResult();

            try
            {
                dfs = this.FileClient.Get<DownloadFileResponse>
                        (new DownloadFileByIdRequest
                        {
                            FileDetails = new FileMeta { FileRefId = Convert.ToInt32(filename.SplitOnLast(CharConstants.DOT).First()), FileCategory = EbFileCategory.File }
                        });
                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, GetMime(filename));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }
            return resp;
        }

        [HttpGet("files/ref/{filename}")]
        public IActionResult GetFileByRefId(string filename)
        {
            DownloadFileResponse dfs = null;
            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            ActionResult resp = new EmptyResult();
            try
            {
                dfs = this.FileClient.Get<DownloadFileResponse>
                        (new DownloadFileByRefIdRequest
                        {
                            FileDetails = new FileMeta { FileRefId = Convert.ToInt32(filename.SplitOnLast(CharConstants.DOT).First()), FileCategory = EbFileCategory.File }
                        });
                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, GetMime(filename));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }
            return resp;
        }

        [HttpGet("images/{filename}")]
        public IActionResult GetImageById(string filename, string qlty)
        {
            DownloadFileResponse dfs = null;
            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            ActionResult resp = new EmptyResult();

            DownloadImageByIdRequest dfq = new DownloadImageByIdRequest();

            try
            {
                dfq.ImageInfo = new ImageMeta { FileRefId = Convert.ToInt32(filename.SplitOnLast(CharConstants.DOT).First()), FileCategory = EbFileCategory.Images, ImageQuality = ImageQuality.original };

                dfs = this.FileClient.Get<DownloadFileResponse>(dfq);

                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, GetMime(filename));
                }

            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }
            return resp;
        }

        [HttpGet("images/{qlty}/{filename}")]
        public IActionResult GetImageQualById(string filename, string qlty)
        {
            DownloadFileResponse dfs = null;
            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            ActionResult resp = new EmptyResult();

            DownloadImageByIdRequest dfq = new DownloadImageByIdRequest();

            try
            {
                dfq.ImageInfo = new ImageMeta { FileRefId = Convert.ToInt32(filename.SplitOnLast(CharConstants.DOT).First()), FileCategory = EbFileCategory.Images, ImageQuality = Enum.Parse<ImageQuality>(qlty) };

                this.FileClient.Timeout = new TimeSpan(0, 5, 0);

                dfs = this.FileClient.Get<DownloadFileResponse>(dfq);

                if (dfs.StreamWrapper != null)
                {
                    dfs.StreamWrapper.Memorystream.Position = 0;
                    resp = new FileStreamResult(dfs.StreamWrapper.Memorystream, GetMime(filename));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message.ToString());
            }
            return resp;

        }

        [HttpPost]
        public async Task<int> UploadFileAsync(int i)
        {
            UploadAsyncResponse res = new UploadAsyncResponse();
            try
            {
                var req = this.HttpContext.Request.Form;

                List<string> tags = string.IsNullOrEmpty(req["Tags"]) ? new List<string>() : req["Tags"].ToList<string>();
                List<string> catogory = string.IsNullOrEmpty(req["Category"]) ? new List<string>() : req["Category"].ToList<string>();
                string context = (req.ContainsKey("Context")) ? context = req["Context"] : StaticFileConstants.CONTEXT_DEFAULT;
                
                UploadFileAsyncRequest uploadFileRequest = new UploadFileAsyncRequest();
                uploadFileRequest.FileDetails = new FileMeta();

                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0)
                    {
                        byte[] myFileContent;

                        using (var memoryStream = new MemoryStream())
                        {
                            await formFile.CopyToAsync(memoryStream);
                            memoryStream.Seek(0, SeekOrigin.Begin);
                            myFileContent = new byte[memoryStream.Length];
                            await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);

                            uploadFileRequest.FileByte = myFileContent;
                        }

                        uploadFileRequest.FileDetails.FileName = formFile.FileName.ToLower();
                        uploadFileRequest.FileDetails.FileType = formFile.FileName.SplitOnLast(CharConstants.DOT).Last().ToLower();
                        uploadFileRequest.FileDetails.Length = uploadFileRequest.FileByte.Length;
                        uploadFileRequest.FileDetails.FileCategory = EbFileCategory.File;

                        uploadFileRequest.FileDetails.MetaDataDictionary = new Dictionary<String, List<string>>();
                        uploadFileRequest.FileDetails.MetaDataDictionary.Add("Tags", tags);
                        uploadFileRequest.FileDetails.MetaDataDictionary.Add("Category", catogory);
                        uploadFileRequest.FileDetails.Context = context;

                        res = this.FileClient.Post<UploadAsyncResponse>(uploadFileRequest);

                        if (res.FileRefId > 0)
                            Console.WriteLine(String.Format("file Upload Success [RefId:{0}]", res.FileRefId));
                        else
                            Console.WriteLine("Exception: file Upload Failure");
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString() + "\nResponse: " + res.ResponseStatus.Message);
            }
            return res.FileRefId;
        }

        [HttpPost]
        public async Task<int> UploadImageAsync(int i)
        {
            UploadAsyncResponse res = new UploadAsyncResponse();
            try
            {
                var req = this.HttpContext.Request.Form;
                List<string> tags = string.IsNullOrEmpty(req["Tags"]) ? new List<string>() : req["Tags"].ToList<string>();
                List<string> catogory = string.IsNullOrEmpty(req["Category"]) ? new List<string>() : req["Category"].ToList<string>();
                string context = (req.ContainsKey("Context")) ? context = req["Context"] : StaticFileConstants.CONTEXT_DEFAULT;

                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new ImageMeta();
                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0 && Enum.IsDefined(typeof(ImageTypes), formFile.FileName.SplitOnLast(CharConstants.DOT).Last().ToLower()))
                    {
                        byte[] myFileContent;
                        using (var memoryStream = new MemoryStream())
                        {
                            await formFile.CopyToAsync(memoryStream);
                            memoryStream.Seek(0, SeekOrigin.Begin);
                            myFileContent = new byte[memoryStream.Length];
                            await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);
                            uploadImageRequest.ImageByte = myFileContent;
                        }
                        uploadImageRequest.ImageInfo.MetaDataDictionary = new Dictionary<String, List<string>>();
                        uploadImageRequest.ImageInfo.MetaDataDictionary.Add("Tags", tags);
                        uploadImageRequest.ImageInfo.MetaDataDictionary.Add("Category", catogory);
                        uploadImageRequest.ImageInfo.Context = context;

                        uploadImageRequest.ImageInfo.FileName = formFile.FileName.ToLower();
                        uploadImageRequest.ImageInfo.FileType = formFile.FileName.SplitOnLast(CharConstants.DOT).Last().ToLower();
                        uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                        uploadImageRequest.ImageInfo.FileCategory = EbFileCategory.Images;
                        uploadImageRequest.ImageInfo.ImageQuality = ImageQuality.original;

                        res = this.FileClient.Post<UploadAsyncResponse>(uploadImageRequest);

                        if (res.FileRefId > 0)
                            Console.WriteLine(String.Format("Img Upload Success [RefId:{0}]", res.FileRefId));
                        else
                            Console.WriteLine("Exception: Img Upload Failure");
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString() + "\nResponse: " + res.ResponseStatus.Message);
            }
            return res.FileRefId;
        }

        [HttpPost]
        public async Task<int> UploadImageAsyncFromForm(int i)
        {
            UploadAsyncResponse res = new UploadAsyncResponse();
            try
            {
                var req = this.HttpContext.Request.Form;
                List<string> tags = req["Tags"].ToList<string>();
                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new ImageMeta();
                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0 && Enum.IsDefined(typeof(ImageTypes), formFile.FileName.SplitOnLast(CharConstants.DOT).Last().ToLower()))
                    {
                        byte[] myFileContent;
                        using (var memoryStream = new MemoryStream())
                        {
                            await formFile.CopyToAsync(memoryStream);
                            memoryStream.Seek(0, SeekOrigin.Begin);
                            myFileContent = new byte[memoryStream.Length];
                            await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);
                            uploadImageRequest.ImageByte = myFileContent;
                        }
                        uploadImageRequest.ImageInfo.MetaDataDictionary = new Dictionary<String, List<string>>();
                        uploadImageRequest.ImageInfo.MetaDataDictionary.Add("Tags", tags);

                        uploadImageRequest.ImageInfo.FileName = formFile.FileName.ToLower();
                        uploadImageRequest.ImageInfo.FileType = formFile.FileName.SplitOnLast(CharConstants.DOT).Last().ToLower();
                        uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                        uploadImageRequest.ImageInfo.FileCategory = EbFileCategory.Images;
                        uploadImageRequest.ImageInfo.ImageQuality = ImageQuality.original;

                        res = this.FileClient.Post<UploadAsyncResponse>(uploadImageRequest);

                        if (res.FileRefId > 0)
                            Console.WriteLine(String.Format("Img Upload Success [RefId:{0}]", res.FileRefId));
                        else
                            Console.WriteLine("Exception: Img Upload Failure");
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString() + "\nResponse: " + res.ResponseStatus.Message);
            }
            return res.FileRefId;
        }

        [HttpPost]
        public async Task<int> UploadImageToInfra(int i)
        {
            UploadAsyncResponse res = new UploadAsyncResponse();
            try
            {
                var req = this.HttpContext.Request.Form;
                List<string> tags = string.IsNullOrEmpty(req["Tags"]) ? new List<string>() : req["Tags"].ToList<string>();
                List<string> catogory = string.IsNullOrEmpty(req["Category"]) ? new List<string>() : req["Category"].ToList<string>();
                string context = (req.ContainsKey("Context")) ? context = req["Context"] : StaticFileConstants.CONTEXT_DEFAULT;

                UploadImageInfraRequest uploadImageRequest = new UploadImageInfraRequest
                {
                    ImageInfo = new ImageMeta()
                };

                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0 && Enum.IsDefined(typeof(ImageTypes), formFile.FileName.SplitOnLast(CharConstants.DOT).Last().ToLower()))
                    {
                        byte[] myFileContent;
                        using (var memoryStream = new MemoryStream())
                        {
                            await formFile.CopyToAsync(memoryStream);
                            memoryStream.Seek(0, SeekOrigin.Begin);
                            myFileContent = new byte[memoryStream.Length];
                            await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);
                            uploadImageRequest.ImageByte = myFileContent;
                        }
                        uploadImageRequest.ImageInfo.MetaDataDictionary = new Dictionary<String, List<string>>
                        {
                            { "Tags", tags },
                            { "Category", catogory }
                        };

                        uploadImageRequest.ImageInfo.Context = context;
                        uploadImageRequest.ImageInfo.FileName = formFile.FileName.ToLower();
                        uploadImageRequest.ImageInfo.FileType = formFile.FileName.SplitOnLast(CharConstants.DOT).Last().ToLower();
                        uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                        uploadImageRequest.ImageInfo.FileCategory = EbFileCategory.Images;
                        uploadImageRequest.ImageInfo.ImageQuality = ImageQuality.original;

                        res = this.FileClient.Post<UploadAsyncResponse>(uploadImageRequest);

                        if (res.FileRefId > 0)
                            Console.WriteLine(String.Format("Img Upload Success [RefId:{0}]", res.FileRefId));
                        else
                            Console.WriteLine("Exception: Img Upload Failure");
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString() + "\nResponse: " + res.ResponseStatus.Message);
            }
            return res.FileRefId;
        }


        [HttpPost]
        public async Task<int> UploadDPAsync(int i)
        {
            UploadAsyncResponse res = new UploadAsyncResponse();
            try
            {
                var req = this.HttpContext.Request.Form;
                if (!req.ContainsKey("UserId"))
                    throw new Exception("Userid must be set");

                int _userid = Convert.ToInt32(req["UserId"]);

                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest { UserIntId=_userid};
                uploadImageRequest.ImageInfo = new ImageMeta();
                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0 && Enum.IsDefined(typeof(ImageTypes), formFile.FileName.SplitOnLast(CharConstants.DOT).Last().ToLower()))
                    {
                        byte[] myFileContent;
                        using (var memoryStream = new MemoryStream())
                        {
                            await formFile.CopyToAsync(memoryStream);
                            memoryStream.Seek(0, SeekOrigin.Begin);
                            myFileContent = new byte[memoryStream.Length];
                            await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);
                            uploadImageRequest.ImageByte = myFileContent;
                        }
                        uploadImageRequest.ImageInfo.FileName = formFile.FileName.ToLower();
                        uploadImageRequest.ImageInfo.FileType = StaticFileConstants.PNG;
                        uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                        uploadImageRequest.ImageInfo.FileCategory = EbFileCategory.Dp;
                        uploadImageRequest.ImageInfo.ImageQuality = ImageQuality.original;
                        uploadImageRequest.ImageInfo.Context = StaticFileConstants.CONTEXT_DP;

                        res = this.FileClient.Post<UploadAsyncResponse>(uploadImageRequest);

                        if (res.FileRefId > 0)
                            Console.WriteLine(String.Format("Img Upload Success [RefId:{0}]", res.FileRefId));
                        else
                            Console.WriteLine("Exception: Img Upload Failure");
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString() + "\nResponse: " + res.ResponseStatus.Message);
            }

            return res.FileRefId;
        }

        [HttpPost]
        public async Task<int> UploadLogoAsync(int i)
        {
            UploadAsyncResponse res = new UploadAsyncResponse();
            try
            {
                var req = this.HttpContext.Request.Form;
                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new ImageMeta();
                uploadImageRequest.SolutionId = req["SolnId"];
                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0 && Enum.IsDefined(typeof(ImageTypes), formFile.FileName.SplitOnLast(CharConstants.DOT).Last().ToLower()))
                    {
                        byte[] myFileContent;
                        using (var memoryStream = new MemoryStream())
                        {
                            await formFile.CopyToAsync(memoryStream);
                            memoryStream.Seek(0, SeekOrigin.Begin);
                            myFileContent = new byte[memoryStream.Length];
                            await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);
                            uploadImageRequest.ImageByte = myFileContent;
                        }
                        uploadImageRequest.ImageInfo.FileName = formFile.FileName.ToLower();
                        uploadImageRequest.ImageInfo.FileType = StaticFileConstants.PNG;
                        uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                        uploadImageRequest.ImageInfo.FileCategory = EbFileCategory.SolLogo;
                        uploadImageRequest.ImageInfo.ImageQuality = ImageQuality.original;
                        uploadImageRequest.ImageInfo.Context = StaticFileConstants.CONTEXT_LOGO;

                        res = this.FileClient.Post<UploadAsyncResponse>(uploadImageRequest);

                        if (res.FileRefId > 0)
                            Console.WriteLine(String.Format("Img Upload Success [RefId:{0}]", res.FileRefId));
                        else
                            Console.WriteLine("Exception: Img Upload Failure");
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString() + "\nResponse: " + res.ResponseStatus.Message);
            }

            return res.FileRefId;
        }

        [HttpPost]
        public async Task<string> UploadLocAsync(string base64, string extra)
        {

            var dict = extra.IsEmpty() ? null : JsonConvert.DeserializeObject<Dictionary<string, string>>(extra);

            UploadAsyncResponse res = new UploadAsyncResponse();
            string Id = string.Empty;
            string url = string.Empty;
            byte[] myFileContent;
            try
            {
                UploadImageAsyncRequest uploadImageRequest = new UploadImageAsyncRequest();
                uploadImageRequest.ImageInfo = new ImageMeta();
                string base64Norm = base64.Replace("data:image/png;base64,", "");
                myFileContent = System.Convert.FromBase64String(base64Norm);
                uploadImageRequest.ImageByte = myFileContent;
                uploadImageRequest.ImageInfo.FileType = StaticFileConstants.JPG;
                uploadImageRequest.ImageInfo.FileName = String.Format("loc_{0}.{1}", dict["FileName"].ToLower(), uploadImageRequest.ImageInfo.FileType);
                uploadImageRequest.ImageInfo.Length = uploadImageRequest.ImageByte.Length;
                uploadImageRequest.ImageInfo.FileCategory = EbFileCategory.LocationFile;
                uploadImageRequest.ImageInfo.ImageQuality = ImageQuality.original;


                res = this.FileClient.Post<UploadAsyncResponse>(uploadImageRequest);

                if (res.FileRefId > 0)
                    Console.WriteLine(String.Format("Img Upload Success [RefId:{0}]", res.FileRefId));
                else
                    Console.WriteLine("Exception: Img Upload Failure");
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.ToString() + "\n Response:" + res.ResponseStatus.Message);
                return "upload failed";
            }

            return url;
        }

        public List<FileMeta> FindFilesByTags(int i, string tags, string bucketname)
        {
            FindFilesByTagRequest findFilesByTagRequest = new FindFilesByTagRequest();
            //tags = (string.IsNullOrEmpty(tags)) ? string.Empty : tags;
            if (string.IsNullOrEmpty(tags))
                return null;
            findFilesByTagRequest.Tags = new List<string>(tags.Split(','));

            List<FileMeta> FileInfoList = new List<FileMeta>();

            FileInfoList = this.FileClient.Post(findFilesByTagRequest);

            return FileInfoList;
        }

        [HttpPost]
        public List<FileMeta> FindFilesByTenant(int type)
        {
            List<FileMeta> resp = this.FileClient.Post(new InitialFileReq { Type = (FileClass)type });
            return resp;
        }

        private string GetMime(string fname)
        {
            return StaticFileConstants.GetMime[fname.SplitOnLast(CharConstants.DOT).Last().ToLower()];
        }

        [HttpPost]
        public bool ChangeCategory(string Category, string FileRefs)
        {
            FileCategoryChangeResponse resp = this.ServiceClient.Post(new FileCategoryChangeRequest
            {
                Category = Category,
                FileRefId = FileRefs.Split(CharConstants.COMMA).Select(n => int.Parse(n)).ToArray()
            });
            return resp.Status;
        }
    }
}