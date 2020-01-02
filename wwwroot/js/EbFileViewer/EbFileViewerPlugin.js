(function ($) {
    $.fn.ebFileViewer = function (options) {
        let defaults = [{
            file_src: "",
            file_name: "",
            file_type: ""

        }];

        this.pgSettings = $.extend(defaults, options);

        this.init = function () {
            this.initViewer();
            //$("li.viewer-info").on("mouseenter", this.printImagefn2.bind(this));
            //$("li.viewer-info").on("mouseleave", this.printImagefn3.bind(this));
        }

        this.initViewer = function () {
            this.infono = 1;
            if (this.pgSettings.length) {
                let ulview = (`<div id='viewdiv' > <ul id='imageContainer'>`);

                this.pgSettings.forEach(function (obj) {
                    ulview += `<li><img data-original='' src='${obj.file_src}' dtls='${obj.file_name}' alt='${obj.file_name}'></li>`
                });
                ulview += `</ul> </div>`
                $("body").append(ulview);
                this.viewer = new Viewer($('#imageContainer')[0], {
                    toolbar: {
                        info: function () {
                            if (this.infono) {
                                $(".viewer-canvas").append(`<div class='imgDetail'><h4>${this.viewer.image.dtls}</h4</div>`);
                                this.infono = 0;
                            } else {
                                $(".imgDetail").remove();
                                this.infono = 1;
                            }

                        }.bind(this),
                        zoomIn: 1,
                        zoomOut: 1,
                        oneToOne: 1,
                        reset: 1,
                        prev: 1,
                        //play: {
                        //    show: 1,
                        //    size: 'large',
                        //},
                        next: 1,
                        rotateLeft: 1,
                        rotateRight: 1,
                        flipHorizontal: 1,
                        flipVertical: 1,
                        download: function () {
                            const a = $("<a>").attr("href", `${this.viewer.image.src}`)
                                .attr("download", "")
                                .appendTo("body");
                            a[0].click();
                            a.remove();
                        }.bind(this),
                        print: function () {
                            let win = window.open('');
                            win.document.write(`<img src=${this.viewer.image.src} onload="window.print();window.close()" />`);
                            win.focus();
                        }.bind(this)
                    }
                }
                );

                this.viewer.show();

                $('#viewdiv').remove();
            }
            else {
                EbMessage("show", { Message: "No image found", Background: 'red' });
            }


        }
        //this.printImagefn2 = function () {
        //    $(".viewer-canvas").append("<div class='imgDetail'><h4> Nature</h4><h3>What a beautiful sunrise</h3></div>");
        //}
        //this.printImagefn3 = function () {
        //    $(".imgDetail").remove();
        //}

        this.init();
        return this;
    };





}(jQuery));