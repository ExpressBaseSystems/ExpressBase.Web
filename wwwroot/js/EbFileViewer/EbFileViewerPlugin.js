(function ($) {
    $.fn.ebFileViewer = function (options,tlbar) {
        let defaults = [{
            file_src: "",
            file_name: "",
            file_type: "",
            file_info:""

        }];

        this.pgSettings = $.extend(defaults, options);

        this.init = function () {
            this.initViewer();
        }

        this.initViewer = function () {
            this.infono = 1;
            if (this.pgSettings.length) {
                let ulview = (`<div id='viewdiv' > <ul id='imageContainer'>`);

                this.pgSettings.forEach(function (obj) {
                    let filethumbnail = obj.file_src.replace("/images/", "/images/small/");
                    let filedtls = (typeof (obj.file_info) === 'undefined') ? "" : obj.file_info;
                    ulview += `<li><img data-original='' data-src='${obj.file_src}' src='${filethumbnail}' dtls='${filedtls}' alt='${obj.file_name}'></li>`
                });
                ulview += `</ul> </div>`
                $("body").append(ulview);
                if (typeof (tlbar) === 'undefined') {
                     tlbar = {
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
                }

                //remove once stable.......****************************************

                //this.viewer = new Viewer($('#imageContainer')[0], {
                //    toolbar: {
                //        //info: function () {
                //        //    if (this.infono) {
                //        //        $(".viewer-canvas").append(`<div class='imgDetail'><h4>${this.viewer.image.dtls}</h4</div>`);
                //        //        this.infono = 0;
                //        //    } else {
                //        //        $(".imgDetail").remove();
                //        //        this.infono = 1;
                //        //    }

                //        //}.bind(this),
                //        info:1,
                //        zoomIn: 1,
                //        zoomOut: 1,
                //        oneToOne: 1,
                //        reset: 1,
                //        //prev: 1,
                //        //play: {
                //        //    show: 1,
                //        //    size: 'large',
                //        //},
                //        //next: 1,
                //        rotateLeft: 1,
                //        rotateRight: 1,
                //        flipHorizontal: 1,
                //        flipVertical: 1,
                //        download: 1,
                //        print:1
                //        //download: function () {
                //        //    const a = $("<a>").attr("href", `${this.viewer.image.src}`)
                //        //        .attr("download", "")
                //        //        .appendTo("body");
                //        //    a[0].click();
                //        //    a.remove();
                //        //}.bind(this),
                //        //print: function () {
                //        //    let win = window.open('');
                //        //    win.document.write(`<img src=${this.viewer.image.src} onload="window.print();window.close()" />`);
                //        //    win.focus();
                //        //}.bind(this)
                //    }
                //}



                this.viewer = new Viewer($('#imageContainer')[0], {
                    url: 'data-src',
                    navbar:0,
                    toolbar: tlbar
                }
                );

                this.viewer.show();

                $('#viewdiv').remove();
            }
            else {
                EbMessage("show", { Message: "No image found", Background: 'red' });
            }


        }

        this.init();
        return this;
    };





}(jQuery));