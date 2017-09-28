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
            + "<div class='modal-body' id='imgUBody' style=''>"
            +"<div class='input-group'><span class='input-group-addon'>Image Id</span>"
            +"<input type='text' class='form-control'>"
            + "</div>"
            + "<div id-'img-upload-body' style='margin-top:15px;'><input id='input-id' type='file' class='file' data-preview-file-type='text' multiple></div>"
            +"</div>"
            + "<div class='modal-footer'></div>"
            + "</div></div></div>");
        $("#" + this.container).append(modalW);

        $("#input-id").fileinput({
            uploadUrl: "../StaticFile/UploadFileAsync",
            maxFileCount: 5
        }); 
    };   

    this.init = function () {
        this.CreateMOdalW();
    };
    this.init();
}