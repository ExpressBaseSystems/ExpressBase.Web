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
        this.imagelist = "";
        this.pgSettings = $.extend(defaults, options);

        this.init = function () {
            this.createViewer();

        }

        this.createViewer = function () {
            this.infono = 1;
            if (this.pgSettings.length) {
                let ulview = (`<div id='ebviewdiv_tmp-f' > <ul id='imageContainer'>`);
                ulview += `</ul> </div>`
                $("body").append(ulview);
                this.pgSettings.forEach(function (obj) {
                    if (obj.FileCategory == 1) {
                        let filethumbnail = "";
                        let filesrc = "";
                        if (obj.hasOwnProperty('Recent')) {
                            filethumbnail = obj.FileB64;
                            filesrc = obj.FileB64;
                        }
                        else {
                             filethumbnail = `/images/small/${obj.FileRefId}.jpg`;
                             filesrc = `/images/${obj.FileRefId}.jpg`;
                        }


                        let filename = obj.FileName || "image";
                        let lk = $(`<li class="fileviewerimg"><img id="tst" data-original='' data-src='${filesrc}' src='${filethumbnail}'  dtls='${obj.FileName}' alt='${filename}'></li>`);
                        var l = lk.find("img").data("details", obj.Meta);
                        $('#imageContainer').append(lk);
                    }
                });

                this.imagelist = $('#ebviewdiv_tmp-f');
                $('#ebviewdiv_tmp-f').remove();
                this.viewer = new Viewer(this.imagelist[0], {
                    url: 'data-src',
                    navbar: 1,
                    toolbar: _toolbar
                }
                );

            }
            else {
                ////commented because in fup control incase of single image after delete it shows this dailoguebox
               // EbMessage("show", { Message: "No image found", Background: 'red' });
            }
        }



        this.showimage = function (rfid) {
            if (!(!rfid || rfid.length === 0)) {
                let indx = this.pgSettings.findIndex(item => item.FileRefId == rfid);
                if (this.pgSettings[indx].FileCategory == 1) {
                    let temparr = [];
                    for (let i = 0; i < this.pgSettings.length; i++) {
                        if (this.pgSettings[i].FileCategory == 1) {
                            temparr.push(this.pgSettings[i]);
                        }
                    }
                    let j = temparr.findIndex(x => x.FileRefId == rfid);
                    this.viewer.view(j);
                }
                else if (this.pgSettings[indx].FileCategory == 0) {
                    let src = null;
                    let html = '';
                    src = `/files/${rfid}`;

                    var arr = this.pgSettings[indx].FileName.split('.');
                    var exten = arr[arr.length - 1];
                    let url = (this.pgSettings[indx].hasOwnProperty('Recent')) ? this.pgSettings[indx].FileB64 : `${src}.${exten}`;
                    if (exten == 'pdf') {

                        let html = $(`<div id='ebfileview_ContDiv' class='eb_fileview-Cont' style=''>
                                    <button id='' class="btn close-ebfileview_Cont ebclx_fileview-Cont" style=''><i class="fa fa-close"></i>
                                    </button>
                                    </div>`);
                        //$("body").append(` <iframe id="display_file" src="${src}.${exten}" frameborder="0" style=" bottom: 0;direction: ltr; font-size: 0; left: 0; line-height: 0;  overflow: hidden;position: absolute;right: 0;"></iframe>`);
                        html.append(`<div id='ebfileview_Iframe-Cont' class='eb_iframe-Cont' style=" ">
                                    <iframe id='ebfileview_Iframe' class='ebfileview_Iframe' src="${url}" class='' style=''></iframe>
                                    </div>`);
                        $("body").append(html[0]);
                        $('.close-ebfileview_Cont').on('click', this.CloseFileviewFn.bind(this));
                        console.log("need pdf viewer");
                    }
                    else {
                        if (confirm(`Download ${this.pgSettings[indx].FileName} ?`)) {
                            let link = document.createElement('a');
                            link.download = this.pgSettings[indx].FileName;
                            link.href = `${url}`;
                            link.click();
                        }

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
                this.createViewer();
            }
        }

        this.CloseFileviewFn = function (e) {
            let target = $(e.target).closest('button').parent();
            if (target.attr("id") == "ebfileview_ContDiv") {
                target.remove();
            }
        }
        this.addToImagelist = function (file) {
            if (file.hasOwnProperty('Recent')) {
                if (file.FileCategory == 1) {
                    let filethumbnail = file.FileB64;
                    let filesrc = file.FileB64;
                    let filename = file.FileName || "image";
                    let li = $(`<li class="fileviewerimg"><img id="tst" data-original='' data-src='${filesrc}' src='${filethumbnail}'  dtls='${file.FileName}' alt='${filename}'></li>`);
                    var l = li.find("img").data("details", file.Meta);
                    this.imagelist.find('#imageContainer').append(li);
                    this.pgSettings.push(file);
                    this.viewer.update();
                }
                else {
                    this.pgSettings.push(file);
                }
            }
            else {
                if (file.FileCategory == 1) {
                    let filethumbnail = `/images/small/${file.FileRefId}.jpg`;
                    let filesrc = `/images/${file.FileRefId}.jpg`;
                    let filename = file.FileName || "image";
                    let li = $(`<li class="fileviewerimg"><img id="tst" data-original='' data-src='${filesrc}' src='${filethumbnail}'  dtls='${file.FileName}' alt='${filename}'></li>`);
                    var l = li.find("img").data("details", file.Meta);
                    this.imagelist.find('#imageContainer').append(li);
                    this.pgSettings.push(file);
                    this.viewer.update();
                }
                else {
                    this.pgSettings.push(file);
                }
            }

        }
        this.init();
        return this;
    };





}(jQuery));