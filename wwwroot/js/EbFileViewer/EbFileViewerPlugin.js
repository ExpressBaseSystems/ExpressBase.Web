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
            this.createViewer('1');
            this.createViewer('2');

        }

        this.createViewer = function (cxt = '1') {
            this.infono = 1;
            if (this.pgSettings.length) {
                let ulview = (`<div id='ebviewdiv_tmp-f${cxt}' > <ul id='imageContainer${cxt}'>`);
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
                        let lk = $(`<li class="fileviewerimg"><img id="tst" data-original='' data-src='${filesrc}' dtls='${obj.FileName}' alt='${filename}'></li>`);
                        var l = lk.find("img").data("details", obj.Meta);
                        $('#imageContainer' + cxt).append(lk);
                    }
                });

                this.imagelist = $('#ebviewdiv_tmp-f' + cxt);
                $('#ebviewdiv_tmp-f' + cxt).remove();
                if (cxt == '2') {
                    this.viewer2 = new Viewer(this.imagelist[0], {
                        url: 'data-src',
                        navbar: 0,
                        toolbar: _toolbar
                    }
                    );
                }
                else {
                    this.viewer = new Viewer(this.imagelist[0], {
                        url: 'data-src',
                        navbar: 0,
                        toolbar: _toolbar
                    }
                    );
                }
            }
            else {
                ////commented because in fup control incase of single image after delete it shows this dailoguebox
                // EbMessage("show", { Message: "No image found", Background: 'red' });
            }
        }



        this.showimage = function (rfid, ViewerPosition) {
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
                    if (!this.viewer.isShown) {
                        this.viewer.eb_adjust_postion = this.viewer.ready ? 0 : ViewerPosition;
                        this.viewer.view(j);
                    }
                    else {
                        this.viewer2.eb_adjust_postion = this.viewer2.ready ? 0 : (ViewerPosition == 1 ? 2 : (ViewerPosition == 2 ? 1 : 0));
                        this.viewer2.view(j);
                    }
                }
                else if (this.pgSettings[indx].FileCategory == 0) {
                    let src = null;
                    let html = '';
                    src = `/files/${rfid}`;

                    var arr = this.pgSettings[indx].FileName.split('.');
                    var exten = arr[arr.length - 1];
                    let url = (this.pgSettings[indx].hasOwnProperty('Recent')) ? this.pgSettings[indx].FileB64 : `${src}.${exten}`;
                    if (exten == 'pdf') {

                        let $html = $(`
<div class='eb_fileview-Cont' style=''>
  <button class="btn close-ebfileview_Cont ebclx_fileview-Cont" style=''><i class="fa fa-close"></i></button>
  <div class="dropdown more-ebfileview_Cont">
    <button class="btn resize-ebfileview_Cont" data-toggle="dropdown" style=''><i class="fa fa-caret-square-o-down"></i></button> 
    <ul class="dropdown-menu">
      <li><a class="dropdown-item"><i class="fa fa-arrow-left"></i> Move Left</a></li>
      <li><a class="dropdown-item"><i class="fa fa-arrow-right"></i> Move Right</a></li>
      <li><a class="dropdown-item"><i class="fa fa-window-maximize"></i> Full Screen</a></li>
    </ul>
  </div>
</div>`);
                        //$("body").append(` <iframe id="display_file" src="${src}.${exten}" frameborder="0" style=" bottom: 0;direction: ltr; font-size: 0; left: 0; line-height: 0;  overflow: hidden;position: absolute;right: 0;"></iframe>`);
                        $html.append(`<div class='eb_iframe-Cont' style=" ">
                                    <iframe class='ebfileview_Iframe' src="${url}" class='' style=''></iframe>
                                    </div>`);
                        if (ViewerPosition == 1) {//left
                            $html.css('width', '50%').css('left', '0%');
                            $($html.find('li')[0]).hide();
                        }
                        else if (ViewerPosition == 2) {//right
                            $html.css('width', '50%').css('left', '50%');
                            $($html.find('li')[1]).hide();
                        }
                        else {
                            $($html.find('li')[2]).hide();
                        }

                        $("body").append($html[0]);
                        $html.on('click', '.close-ebfileview_Cont', this.CloseFileviewFn.bind(this, $html));
                        $html.on('click', '.more-ebfileview_Cont li', this.ResizeFileviewFn.bind(this, $html));
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

        this.CloseFileviewFn = function ($ele, e) {
            let target = $(e.target).closest('button').parent();
            if (target.hasClass("eb_fileview-Cont")) {
                target.remove();
            }
        }

        this.ResizeFileviewFn = function ($ele, e) {
            let $c = $ele;
            let $li = $(e.currentTarget);
            let $i = $li.find('i');
            if ($i.hasClass('fa-arrow-left')) {
                $c.css('width', '50%').css('left', '0%');
            }
            else if ($i.hasClass('fa-arrow-right')) {
                $c.css('width', '50%').css('left', '50%');
            }
            else {
                $c.css('width', '100%').css('left', '0%');
            }
            $li.siblings('li').show();
            $li.hide();
        }

        this.addToImagelist = function (file, cxt = '1') {
            if (file.hasOwnProperty('Recent')) {
                if (file.FileCategory == 1) {
                    let filethumbnail = file.FileB64;
                    let filesrc = file.FileB64;
                    let filename = file.FileName || "image";
                    let li = $(`<li class="fileviewerimg"><img id="tst" data-original='' data-src='${filesrc}' src='${filethumbnail}'  dtls='${file.FileName}' alt='${filename}'></li>`);
                    var l = li.find("img").data("details", file.Meta);
                    this.imagelist.find('#imageContainer' + cxt).append(li);
                    this.imagelist.find('#imageContainer2').append(li);
                    this.pgSettings.push(file);
                    this.viewer.update();
                    this.viewer2.update();
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
                    this.imagelist.find('#imageContainer' + cxt).append(li);
                    this.imagelist.find('#imageContainer2').append(li);
                    this.pgSettings.push(file);
                    this.viewer.update();
                    this.viewer2.update();
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