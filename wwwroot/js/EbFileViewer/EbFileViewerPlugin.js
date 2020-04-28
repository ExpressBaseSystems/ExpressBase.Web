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
                    let src = null;

                    src = `/files/${rfid}`;

                    var arr = this.pgSettings[indx].FileName.split('.');
                    var exten = arr[arr.length - 1];
                    if (exten == 'pdf') {
                        let html = $(`<div id='ebfileview_ContDiv' style=''>
                                    <button id='close-ebfileview_Cont' class="btn " style=''><i class="fa fa-close"></i>
                                    </button>
                                    </div>`);
                        //$("body").append(` <iframe id="display_file" src="${src}.${exten}" frameborder="0" style=" bottom: 0;direction: ltr; font-size: 0; left: 0; line-height: 0;  overflow: hidden;position: absolute;right: 0;"></iframe>`);
                        html.append(`<div id='ebfileview_Iframe-Cont' style=" ">
                                    <iframe id='ebfileview_Iframe' src="${src}.${exten}" class='' style=''></iframe>
                                    </div>`);
                        $("body").append(html[0]);
                        $('#close-ebfileview_Cont').on('click', this.CloseFileviewFn.bind(this));
                        console.log("need pdf viewer");
                    }
                }
                //pdf viewer


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
        this.CloseFileviewFn = function (e) {
            let target = $(e.target).closest('button').parent();
            if (target.attr("id") == "ebfileview_ContDiv") {
                target.remove();
            }
        }
        this.init();
        return this;
    };





}(jQuery));