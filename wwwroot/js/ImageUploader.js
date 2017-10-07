var imageUploader = function (container) {    
    this.container = container;
    this.mWid = null;

    this.CreateMOdalW = function () {
        var modalW = $("<div class='modal fade modalstyle' id='up-modal' role='dialog'>"
            + "<div class='modal-dialog modal-lg'>"
            + "<div class='modal-content wstyle' style='border-radius:0;'>"
            + "<div class='modal-header'>"
            + "<h4 class='modal-title' id='exampleModalLabel' style='display: inline-block;'>Upload Image</h4>"
            + "<button type='button' class='close' data-dismiss='modal'>&times;</button>"
            + "</div>"
            + "<div class='modal-body' id='imgUBody' style=''>"
            +"<div class='input-group'><span class='input-group-addon'>Image Id</span>"
            +"<input type='text' id='obj-id' class='form-control'>"
            + "</div>"
            + "<div id-'img-upload-body' style='margin-top:15px;'><input id='input-id' type='file' class='file' data-preview-file-type='text' multiple></div>"
            +"</div>"
            + "<div class='modal-footer' id='mdfooter' style='display:none;height:100px;border:none'></div>"
            + "</div></div></div>");
        $("#" + this.container).append(modalW);

        $("#input-id").fileinput({
            uploadUrl: "../StaticFile/UploadFileAsync",
            maxFileCount: 5,
            initialPreview:[]
        }).on('fileuploaded', function (event, data, previewId, index) {
            var objId = data.response.objId;
            $('#obj-id').attr('value', objId);
            }).on('fileloaded', this.addtagButton.bind(this));
    }; 
    this.addtagButton = function (event, file, previewId, index, reader) {        
        $("#" + previewId).children().find(".file-footer-buttons").append("<button type='button' id='tagbtn" + previewId + "'"
            + "class='kv-file-upload btn btn-kv btn-default btn-outline-secondary' title= 'Tag' > Tag</button > ");
        $("#tagbtn" + previewId).on("click", this.tagimageOnClick.bind(this));
    };

    this.tagimageOnClick = function () {
        $("#mdfooter").show();
        $("#mdfooter").append("<div class='col-md-4'>"
            + "<div class='form-group'>"
            + "<label>Tag</label>"
            + "<div class='input-group'>"
            + "<input type= 'text' id= 'tagval' class='form-control'>"
            + "<span class='input-group-btn'><button class='btn btn-secondary' id='tagbtn'><i class='fa fa-plus fa-lg'></i></button>"
            +"</span>"
            + "</div></div></div>"
            + "<div class='col-md-8' id='tagprevContainer' style='border:1px solid #ccc;height:100%'></div>");
        $("#tagbtn").on("click", this.addtagAndPrev.bind(this));
    };
    this.addtagAndPrev = function () {       
            var tagname = $("#tagval").val();
            if (tagname !== " ") {
                $("#tagprevContainer").append("<div class='tag-body' style='height:25px;text-align:left;margin:5px;border-radius:4px;min-width:80px;float:left;border:1px solid #ccc;background-color:#fafafa;'>"
                    + "" + tagname +" <i class='fa fa-close pull-right' style='margin-left:5px;' onclick='$(this).parent().remove();'></i></div>");
            }       
    };

    this.init = function () {
        this.CreateMOdalW();        
    };
    this.init();
}