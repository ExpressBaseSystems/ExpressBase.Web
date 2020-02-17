(function ($) {
    $.fn.ebFileViewer = function (options, tlbar) {
        let defaults = [{
            FileName: "",
            FileSize: "",
            FileRefId: "",
            Meta: {},
            UploadTime: "",
            FileCategory: ""

        }];
        dftlbar = {
            info: 1,
            zoomIn: 1,
            zoomOut: 1,
            oneToOne: 1,
            reset: 1,
            prev: 1,
            play: {
                show: 1,
                size: 'large',
            },
            next: 1,
            rotateLeft: 1,
            rotateRight: 1,
            flipHorizontal: 1,
            flipVertical: 1,
            download: 1,
            print: 1
        }
        let _toolbar = tlbar || dftlbar;

        this.pgSettings = $.extend(defaults, options);

        this.init = function () {
            this.initViewer();
        }

        this.initViewer = function () {
            this.infono = 1;
            if (this.pgSettings.length) {
                let ulview = (`<div id='viewdiv' > <ul id='imageContainer'>`);
                ulview += `</ul> </div>`
                $("body").append(ulview);
                this.pgSettings.forEach(function (obj) {
                    if (obj.FileCategory == 1) {
                        let filethumbnail = `/images/small/${obj.FileRefId}.jpg`;
                        let filesrc = `/images/${obj.FileRefId}.jpg`;
                        let filename = obj.FileName || "image";
                        let lk = $(`<li class="fileviewerimg"><img id="tst" data-original='' data-src='${filesrc}' src='${filethumbnail}'  dtls='${obj.FileName}' alt='${filename}'></li>`);
                        var l = lk.find("img").data("details", obj.Meta);
                        $('#imageContainer').append(lk);

                    }
                });


                this.viewer = new Viewer($('#viewdiv')[0], {
                    url: 'data-src',
                    navbar: 1,
                    toolbar: _toolbar
                }
                );

                $('#viewdiv').remove();
            }
            else {
                EbMessage("show", { Message: "No image found", Background: 'red' });
            }
        }
        this.showimage = function (rfid) {
            if (!(!rfid || rfid.length === 0)) {
                let indx = this.pgSettings.findIndex(item => item.FileRefId == rfid);
                if (this.pgSettings[indx].FileCategory == 1) {
                    this.viewer.view(indx);
                }
                else if (this.pgSettings[indx].FileCategory == 0) {
                    //pdf viewer
                    console.log("need pdf viewer");
                }
            }
           
        }
        this.deleteimage = function (refidarr) {
            if (refidarr.length > 0) {
                let refids = "";
                for (i = refidarr.length; i >= 0; i--) {
                    refids = refidarr[i];
                    if (!(!refids || refids.length === 0)) {
                        let indx = this.pgSettings.findIndex(item => item.FileRefId == refids);
                        this.pgSettings.splice(indx, 1);
                    }
                }
                this.initViewer();
            }
        }

        this.init();
        return this;
    };





}(jQuery));