var imageUploader = function (mId,container) {
    alert();
    this.mId = mId;
    this.container = container;
    this.mWid = null;

    this.CreateMOdalW = function () {
        var modalW = $("<div class='modal fade modalstyle' id='" + this.mId + "' role='dialog'>"
            + "<div class='modal-dialog modal-lg'>"
            + "<div class='modal-content wstyle'>"
            + "<div class='modal-header'>"
            + "<h5 class='modal-title' id='exampleModalLabel'>Modal title</h5>"
            + "<button type='button' class='close' data-dismiss='modal'>&times;</button>"
            + "</div>"
            + "<div class='modal-body' id='imgUBody'></div>"
            + "<div class='modal-footer'></div>"
            + "</div></div></div>");
        $("#" + this.container).append(modalW);
        this.addTabToMbody("imgUBody");
    };
    this.addTabToMbody = function (imgUBody) {
        var tab = $("<ul class='nav nav-tabs' role=;'tablist'>"
            + "<li class='nav-item'><a class='nav-link active' data-toggle='tab' href='#Upload' role='tab'>Upload</a></li>"
            + "<li class='nav-item'><a class='nav-link' data-toggle='tab' href='#Selected' role='tab'>Selected</a> </li>"
            + "</ul>"
            + "<div class='tab-content'>"
            + "<div class='tab-pane active' id='Upload' role='tabpanel'></div>"
            + "<div class='tab-pane' id= 'Selected' role= 'tabpanel' ></div >"
        );          
        $("#" + imgUBody).append(tab);
        this.addUploadDiv("Upload");
    };

    this.addUploadDiv = function (upload) {
        $("#" + imgUBody).append("<div class='upload-toolbar-cont' style= 'width:100%'>"
            + "<div class='imgUpload' id= 'imge-u-id' style= 'width:50%;height:100%;border:1px solid black;background-color:green;'></div>"
            + "<div class='preview' id= 'preview-cont' style= 'width:50%;height:100%;border:1px solid black;background-color:red;'></div>"
            +"</div>"
        );
    };

    this.init = function () {
        this.CreateMOdalW();
    };
    this.init();
}