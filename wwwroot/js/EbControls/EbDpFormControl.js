class DPFormControl {
    constructor(ctrl) {
        this.control = ctrl;
        this.$ctrlCont = $(`#cont_${ctrl.EbSid_CtxId}`);
        this.$btnChange = $(`#cont_${ctrl.EbSid_CtxId} .dpctrl-options-cont .dpctrl-change`);
        this.ctrlCont = `cont_${ctrl.EbSid_CtxId}`;
        this.Toggle = `#cont_${ctrl.EbSid_CtxId} .dpctrl-options-cont .dpctrl-change`;
        this.setupImgUploader();
        this.initImages($(`#cont_${ctrl.EbSid_CtxId} .ebimg-cont img`));
        
        $.extend(ctrl, { getValue: this.GetValue.bind(ctrl), setValue: this.SetValue.bind(ctrl) });
    }

    initImages($img) {
        $img.attr('onerror', "this.style.opacity='0.5'; this.src='/images/image.png';");
        $img.css('height', $img.css('height'));
        this.$ctrlCont.hover(function (e) { $img.parent().next().show(); }, function (e) { $img.parent().next().hide(); });
    }

    setupImgUploader() {
        let resizeViewPort = this.control.CropAspectRatio === 4 ? true : false;
        let cxt = 'logo';
        if (this.control.CropAspectRatio === 1)
            cxt = 'dp';
        else if (this.control.CropAspectRatio === 2)
            cxt = 'doc';
        else if (this.control.CropAspectRatio === 3)
            cxt = 'location';

        this.fileUpload = new EbFileUpload({
            Type: "image",
            Toggle: this.Toggle,
            TenantId: ebcontext.sid,
            UserId: ebcontext.user.UserId,
            SolutionId: ebcontext.sid,
            Container: this.ctrlCont,
            Multiple: false,
            ServerEventUrl: 'https://se.eb-test.xyz',
            EnableTag: false,
            EnableCrop: true,
            ExtraData: {},//extra data for location optional for other
            Context: cxt,//if single and crop
            ResizeViewPort: resizeViewPort //if single and crop
        });

        this.fileUpload.uploadSuccess = function (fileid) {
            EbMessage("show", { Message: "Uploaded Successfully" });
            setTimeout(function () {
                this.control.SetValue(fileid.toString());
            }.bind(this), 2000);
        };
        this.fileUpload.windowClose = function () {
            EbMessage("show", { Message: "window closed", Background: "red" });
        };
    }

    GetValue(p1) {
        if (this.hasOwnProperty('_fileRefids'))
            this._fileRefids.join(',');
        else
            return '';            
    }

    SetValue(p1) {
        this._fileRefids = p1.split(',');
        $(`#cont_${this.EbSid_CtxId} .ebimg-cont img`).attr('src', `../images/${this._fileRefids[0]}.jpg`);
        $(`#cont_${this.EbSid_CtxId} .ebimg-cont img`).css('opacity', `1`);
    }


}