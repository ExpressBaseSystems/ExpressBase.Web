var imageUploader = function (mId,container) {  
    this.mId = mId;
    this.container = container;
    this.mWid = null;

    this.CreateMOdalW = function () {
        var modalW = $("<div class='modal fade modalstyle' id='" + this.mId + "' role='dialog'>"
            + "<div class='modal-dialog modal-lg'>"
            + "<div class='modal-content wstyle' style='border-radius:0;'>"
            + "<div class='modal-header'>"
            + "<h4 class='modal-title' id='exampleModalLabel' style='display: inline-block;'>Upload Image</h4>"
            + "<button type='button' class='close' data-dismiss='modal'>&times;</button>"
            + "</div>"
            + "<div class='modal-body' id='imgUBody' style='500px'>"
            +"<div class='input-group'><span class='input-group-addon'>Object Id</span>"
            +"<input type='text' class='form-control'>"
            +"</div></div>"
            + "<div class='modal-footer'></div>"
            + "</div></div></div>");
        $("#" + this.container).append(modalW);
        this.addTabToMbody("imgUBody");
    };
    this.addTabToMbody = function (imgUBody) {
        var tab = $("<ul class='nav nav-tabs' role='tablist'>"
            + "<li class='nav-item'><a class='nav-link active' data-toggle='tab' href='#Upload' role='tab'>Upload</a></li>"
            + "<li class='nav-item'><a class='nav-link' data-toggle='tab' href='#Selected' role='tab'>Selected</a> </li>"
            + "</ul>"
            + "<div class='tab-content' style='width:100%;'>"
            + "<div class='tab-pane active' id='Upload' role='tabpanel' style='width:100%;height:300px'></div>"
            + "<div class='tab-pane' id= 'Selected' role= 'tabpanel' style='width:100%;height:300px'></div></div>"
        );          
        $("#" + imgUBody).append(tab);
        this.addUploadDiv("Upload");
    };

    this.addUploadDiv = function (upload) {
        var UploadDiv = $("<div class='upload-toolbar-cont' style='width:100%;height:100%'>"
            + "<div class='col-md-4 imgUpload' id= 'imge-u-id' style='height:100%;border:1px solid #cccccc;'>"
            +"<label>Upload Image</label>"
            + "<div class='input-group'><input type='file' id='upld-img' style='display:none;'>"
            + "<span class='input-group-addon'><i class='glyphicon glyphicon-picture'></i></span><input type='text' id='file-name' class='form-control'>"
            +"<span class='input-group-btn'><button class='btn btn-primary input-md' id='browse'>Browse</button></span>"
            +"</div>"
            + "</div >"
            + "<div class='col-md-8 preview' id= 'preview-cont' style='height:100%;border:1px solid #cccccc;'></div>"
            + "</div>"
        );
        $("#" + upload).append(UploadDiv);
        $("#browse").on('click', this.browseImage.bind(this));
    };

    this.browseImage = function () {     
        $("#upld-img").click();
        $("#upld-img").on("change", function () {
            var files = !!this.files ? this.files : [];
            if (!files.length || !window.FileReader) return; 
            if (/^image/.test(files[0].type)) {
                var ReaderObj = new FileReader();
                ReaderObj.readAsDataURL(files[0]); 
                ReaderObj.onloadend = function () {
                    if ($("#preview-cont").children().length === 0){
                        $("#preview-cont").append("<img id='imgdiv' src='" + this.result + "' style='width:100%;height:100%;background-repeat: no-repeat;'/>");
                        $('#file-name').attr('value', files[0].name);
                        base64toByte(this.result, files[0].name);
                    }
                    else {
                        $('#imgdiv').attr('src', this.result);
                        $('#file-name').attr('value', files[0].name);
                        base64toByte(this.result, files[0].name);
                    }
                    //$("#preview-cont").css("background-image", "url(" + this.result + ")");
                }
            } else {
                alert("Upload an image");
            }
        });     
    };

    var base64toByte = function (base64String,fname) {
        //var BASE64_MARKER = ';base64,';       
        //var base64Index = base64String.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
        //var base64 = base64String.substring(base64Index);
        //    var raw = window.atob(base64);
        //    var rawLength = raw.length;
        //    var array = new Uint8Array(new ArrayBuffer(rawLength));

        //    for (i = 0; i < rawLength; i++) {
        //        array[i] = raw.charCodeAt(i);
        //    }
        
        $.post("../StaticFile/UploadFileAsync",
            {
                "byteArray": base64String,
                "fileName": fname
            }, function (result) {
            });        
    };

    this.init = function () {
        this.CreateMOdalW();
    };
    this.init();
}