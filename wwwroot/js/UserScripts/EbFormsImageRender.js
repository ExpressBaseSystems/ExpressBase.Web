class ImageRender {

    constructor(options) {
        $.extend(this.options, options);
        //this.getImages();
    }

    drawThumbNails = function (collection) {
        for (var i = 0; i < collection.length; i++) {
            var im = collection[i];
            $("#image_down_cont_body").prepend(`
                <div class="img_wrapper">
                <div class="img_wrapper_img">
                    <img src="http://${ this.options.TenantId}-dev.localhost:41500/static/${im.objectId}.jpg" class="img-responsive" />
                </div>
                <div class="img_wrapper_text">
                    <h5 class="f text-center">amal.jpg (<span class="kb">${im.length / 1000}Kb</span>)</h5>
                    <p class="f_s text-center" data-toggle="tooltip" title="${im.uploadDateTime}"><i class="fa fa-upload"></i> ${im.uploadDateTime}</p>
                </div>
                <div class="btn_container form-inline">
                    <div class="dropdown" style="float:left;margin-right:5px">
                        <button type='button' data-toggle="dropdown" class='kv-file-upload btn btn-kv btn-default btn-outline-secondary dropdown-toggle' title='Download'><i class="fa fa-download"></i></button>
                        <ul class="dropdown-menu">
                            <li><a href="http://${ this.options.TenantId}-dev.localhost:41500/static/${im.objectId}.jpg" download="${this.options.TenantId}">Orgninal</a></li>
                            <li><a href="http://${ thisoptions.TenantId}-dev.localhost:41500/static/${im.objectId}.jpg" download="${this.options.TenantId}">Medium</a></li>
                            <li><a href="http://${ this.options.TenantId}-dev.localhost:41500/static/${im.objectId}.jpg" download="${this.options..TenantId}">small</a></li>
                        </ul>
                    </div>
                    <button type='button' class='kv-file-upload btn btn-kv btn-default btn-outline-secondary' title='Tag'>Tag</button>
                </div>
                    </div>`);
        }
    };

    getImages() {
        $.post("../StaticFile/FindFilesByTenant", {
            "userid": this.options.UserId
        }, function (result) {
            this.drawThumbNails(result);
        }.bind(this));
    }
}