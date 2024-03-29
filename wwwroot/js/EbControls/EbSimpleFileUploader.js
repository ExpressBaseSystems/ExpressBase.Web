﻿
(function ($) {

    $.fn.fileUploader = function (options) {

        // Default settings
        let defaults = {
            preloaded: [],
            maxSize: 2,
            maxFiles: 1,
            fileTypes: 'image/*'
        };

        // Get instance
        let plugin = this;
        let $inrContainer;
        let newfilearray = [];
        let filedel = [];
        let preloadedfile = 0;
        let refidArr = [];
        let filesView = [];

        // Set empty settings
        plugin.settings = {};

        // Plugin constructor
        plugin.init = function () {

            // Define settings
            plugin.settings = $.extend(plugin.settings, defaults, options);
            filesView = JSON.parse(plugin.settings.fileCtrl.DataVals.F);
            createFileviewer();
            // Run through the elements
            plugin.each(function (i, wrapper) {

                // Create the container
                let $container = createContainer();

                // Append the container to the wrapper
                $(wrapper).append($container);

                // Set some bindings
                $container.on("dragover", fileDragHover.bind($container));
                $container.on("dragleave", fileDragHover.bind($container));
                $container.on("drop", fileSelectHandler.bind($container));
            });

        };

        this.createPreloaded = function (p1) {
            this.clearFiles();
            if (p1 !== null && p1 !== "") {
                //let preloaded = [];
                let refidArr = p1.split(',');
                for (let j = 0; j < refidArr.length; j++) {
                    let indx = filesView.findIndex(x => x.FileRefId == refidArr[j]);
                    plugin.settings.preloaded.push({ id: refidArr[j], cntype: filesView[indx].FileCategory, name: filesView[indx].FileName, refid: refidArr[j] });
                }

            }
            // plugin.settings.preloaded = prelod;
            let $filecont = $(`#${plugin.settings.fileCtrl.EbSid}_SFUP`);
            let $uploadedContainer = $filecont.find('.uploaded');

            if (plugin.settings.preloaded.length > 0)
                $filecont.addClass('has-files');

            for (let i = 0; i < plugin.settings.preloaded.length; i++) {
                $uploadedContainer.append(createImg(plugin.settings.preloaded[i], plugin.settings.preloaded[i].id, plugin.settings.preloaded[i].cntype, true, plugin.settings.preloaded[i].refid));
                setRefid(plugin.settings.preloaded[i].refid, $inrContainer);
                preloadedfile++;
                //$(".trggrpreview").on("click", viewFilesFn);
            }
        };

        this.clearFiles = function () {
            preloadedfile = 0;
            refidArr = [];
            plugin.settings.preloaded = [];
            $(`#${plugin.settings.fileCtrl.EbSid}_bindfn`).val("");
            let $contdiv = $(`#${plugin.settings.fileCtrl.EbSid}_SFUP`).find('.uploaded').empty();
            $contdiv.removeClass('has-files');
            return;

        };



        //   let dataTransfer = new DataTransfer();

        let createContainer = function () {
            let fileType = (plugin.settings.fileTypes == "image") ? "image/*" : "";
            // Create the image uploader container
            let $flcontainer = $("#" + plugin.settings.fileCtrl.EbSid + "_SFUP"),

                // Create the input type file and append it to the container
                $input = $('<input>', {
                    type: 'file',
                    id: `${plugin.settings.fileCtrl.EbSid}_inputID`,
                    accept: fileType,
                    name: "fileInputnm",
                    multiple: plugin.settings.maxFiles
                }).appendTo($flcontainer),

                // Create the uploaded images container and append it to the container
                $uploadedContainer = $('<div>', { class: 'uploaded' }).appendTo($flcontainer);
            $flcontainer.append(`<input type="text" id='${plugin.settings.fileCtrl.EbSid}_bindfn' hidden >`)



            ////Listen to container click and trigger input file click
            $flcontainer.on('click', function (e) {
                // Prevent browser default event and stop propagation
                prevent(e);
                e.preventDefault();
                e.stopPropagation();

                //// Trigger input click
                $input.trigger('click');
            });

            // Stop propagation on input click
            $input.on("click", function (e) {
                e.stopPropagation();
            });

            // Listen to input files changed
            $input.on('change', fileSelectHandler.bind($flcontainer));
            return $flcontainer;
        };


        let prevent = function (e) {
            // Prevent browser default event and stop propagation
            e.preventDefault();
            e.stopPropagation();

        };


        let createImg = function (file, id, cntype, prelod, refid) {
            var filelurl;
            if (prelod) {

                if (cntype == 1) {
                    filelurl = `/images/${refid}.jpg`;
                } else {
                    let arr = file.name.split('.');
                    let exten = arr[arr.length - 1];
                    if (exten === 'pdf') {
                        filelurl = '/images/pdf-image.png';
                    } else {
                        filelurl = '/images/file-image.png';
                    }

                }
                file.name = file.name;
            } else {
                if (cntype == 1) {
                    filelurl = URL.createObjectURL(file);
                } else {
                    let arr = file.name.split('.');
                    let exten = arr[arr.length - 1];
                    if (exten === 'pdf') {
                        filelurl = '/images/pdf-image.png';
                    } else {
                        filelurl = '/images/file-image.png';
                    }

                }


            }
            let src = filelurl;
            if (plugin.settings.renderer === "Bot") {
                $filethumb = $('<div>', { class: 'botfilethumb' });
                $inrContainer = $('<div>', { class: 'botuploaded-file ', exact: file.name }).appendTo($filethumb);

                if (cntype == 0) {

                    src = '/images/pdf-image.png';

                    $img = $('<img>', { src: src, cntype: cntype, pd64: filelurl }).appendTo($inrContainer);
                }
                else {
                    $img = $('<img>', { src: src, cntype: cntype }).appendTo($inrContainer);
                }


                //create div for file name
                $filedtls = $('<div>', { class: 'botfiledtls' }).appendTo($inrContainer);
                //$filedtls.append(`<p class='botfilename'>${file.name}</p>`);
                $filedtls.append(`<span class="fa fa-check-circle-o success"></span><span class="fa fa-exclamation-circle error"></span>`);

                ///// Create the delete button
                $button = $('<span>', { class: 'delete-image' }).appendTo($inrContainer),
                    $i = $('<i>', { class: 'fa fa-times-circle  ' }).appendTo($button);
                $spinner = $('<div>', { class: 'load_spinner' }).appendTo($inrContainer),
                    $i = $('<i>', { class: 'fa fa-spinner fa-spin ' }).appendTo($spinner);
            }
            else {
                $filethumb = $('<div>', { class: 'filethumb trggrpreview' });

                // Create the upladed image container
                $inrContainer = $('<div>', { class: 'uploaded-file', exact: file.name }).appendTo($filethumb);
                // Create the img tag

                if (cntype == 'application/pdf') {

                    src = '/images/pdf-image.png';

                    $img = $('<img>', { src: src, cntype: cntype, pd64: filelurl }).appendTo($inrContainer);

                }
                else {
                    $img = $('<img>', { src: src, cntype: cntype }).appendTo($inrContainer);
                }

                //create div for file name
                $filedtls = $('<div>', { class: 'filedtls' }).appendTo($inrContainer);
                $filedtls.append(`<p class='filename'>${file.name}</p>`);
                $filedtls.append(`<span class="fa fa-check-circle-o success"></span><span class="fa fa-exclamation-circle error"></span>`);

                //// Create the delete button
                $button = $('<span>', { class: 'delete-image' }).appendTo($inrContainer),
                    $i = $('<i>', { class: 'fa fa-times-circle  ' }).appendTo($button);

                $spinner = $('<div>', { class: 'load_spinner' }).appendTo($inrContainer),
                    $i = $('<i>', { class: 'fa fa-spinner fa-spin ' }).appendTo($spinner);
            }


            // If the images are preloaded
            if (plugin.settings.preloaded.length) {

                // Set a identifier
                $inrContainer.attr('data-preloaded', true);
                $inrContainer.attr('data-index', id);
                $inrContainer.attr('data-cntype', cntype);

            } else {

                // Set the identifier
                $inrContainer.attr('data-index', id);

            }

            //// Stop propagation on click
            //$inrContainer.on("click", function (e) {

            //    // Prevent browser default event and stop propagation
            //    prevent(e);

            //});

            //// Set delete action
            $button.on("click", function (e) {
                // Prevent browser default event and stop propagation
                prevent(e);
                let f_refid = "";
                if (plugin.settings.renderer === "Bot") {
                    f_refid = $(e.target).closest('.botfilethumb').attr('filrefid');
                    $(e.target).closest('.botfilethumb').remove();
                }
                else {
                    f_refid = $(e.target).closest('.filethumb').attr('filrefid');
                    $(e.target).closest('.filethumb').remove();

                }


                filedel.push(f_refid);
                let del_indx = refidArr.indexOf(f_refid);
                refidArr.splice(del_indx, 1);
                filesView.splice(del_indx, 1);
                $(`#${plugin.settings.fileCtrl.EbSid}_bindfn`).change();

            });

            return $filethumb;
        };

        let fileDragHover = function (e) {

            // Prevent browser default event and stop propagation
            prevent(e);

            // Change the container style
            if (e.type === "dragover") {
                $(this).addClass('drag-over');
            } else {
                $(this).removeClass('drag-over');
            }
        };

        let fileSelectHandler = function (e) {

            // Prevent browser default event and stop propagation
            prevent(e);

            // Get the jQuery element instance
            let $container = $(this);

            // Change the container style
            $container.removeClass('drag-over');

            // Get the files
            let files = e.target.files || e.originalEvent.dataTransfer.files;
            let fileArr = []
            $.each(files, function (i, n) {
                fileArr.push(n);
            });
            let totfile = ((preloadedfile + newfilearray.length) - filedel.length);
            if (totfile + fileArr.length > plugin.settings.maxFiles) {

                fileArr = fileArr.slice(0, (plugin.settings.maxFiles - totfile));
            }
            if (totfile === plugin.settings.maxFiles) {
                EbMessage("show", { Message: "Maximum number of files reached ", Background: 'red' });
            }
            else {
                // Makes the upload
                setPreview($container, fileArr);
            }

        };

        let setPreview = function ($container, files) {

            // Add the 'has-files' class
            $container.addClass('has-files');

            // Get the upload images container
            let $uploadedContainer = $container.find('.uploaded'),

                // Get the files input
                $input = $container.find('input[type="file"]');

            // Run through the files
            var t = (plugin.settings.fileTypes == 'image') ? 1 : 0;
            $(files).each(function (i, file) {
                let url = "";
                let filetype = (t == 1) ? getFileType(files[i]) : 1;
                if (filetype == 1) {
                    if ((files[i].size) < (plugin.settings.maxSize * 1024 * 1024)) {
                        //if (((preloadedfile - filedel.length) + newfilearray.length) < plugin.settings.maxFiles) {
                        if (((preloadedfile + newfilearray.length) - filedel.length) < plugin.settings.maxFiles) {
                            //  if (newfilearray.length< plugin.settings.maxFiles) {



                            // Add it to data transfer
                            //   dataTransfer.items.add(file);

                            // Set preview

                            //if (files[i].type == "application/pdf") {

                            //    $uploadedContainer.append(createImg('/images/pdf-image.png', dataTransfer.items.length - 1));
                            //}
                            //else
                            let type = getFileType(file);
                            {
                                $uploadedContainer.append(createImg(file, newfilearray.length, type), false);
                                // $(".trggrpreview").on("click", viewFilesFn);
                                // let createImg = function (file, id, cntype, prelod, fileno, refid) {
                            }


                            if (plugin.settings.renderer === "Bot") {
                                if (type === 1)
                                    url = "../Boti/UploadImageAsync";
                                else
                                    url = "../Boti/UploadFileAsync";
                            }
                            else {

                                if (type === 1)
                                    url = "../StaticFile/UploadImageAsync";
                                else
                                    url = "../StaticFile/UploadFileAsync";
                            }


                            uploadItem(url, file);


                        }
                        else {
                            EbMessage("show", { Message: "Maximum number of files reached ", Background: 'red' });
                        }
                    }
                    else {
                        EbMessage("show", { Message: `Maximum file size is ${plugin.settings.maxSize}MB`, Background: 'red' });
                    }
                }
                else {
                    EbMessage("show", { Message: "Only images are allowed", Background: 'red' });
                }




            });


        };

        //get file type
        let getFileType = function (file) {
            if (file.type.match('image.*'))
                return 1;
            else
                return 0;
        };


        let uploadItem = function (_url, file) {
            let thumb = null;
            let formData = new FormData();
            formData.append("File", file);

            $.ajax({
                type: "POST",
                url: _url,
                data: formData,
                //cache: false,
                contentType: false,
                processData: false
            }).done(function (refid) {
                thumb = $inrContainer;
                successOper(thumb, refid, file);
            }.bind(this));
        };

        let successOper = function (thumb, refid, file) {
            // thumb.find(".eb-upl-loader").hide();
            if (refid > 0) {
                //add it to file array
                let fileobj = {};
                fileobj["FileName"] = file.name;
                fileobj["FileSize"] = file.size;
                fileobj["FileRefId"] = refid;
                fileobj["Meta"] = {};
                fileobj["UploadTime"] = "";
                fileobj["FileCategory"] = getFileType(file);
                filesView.push(fileobj);
                newfilearray.push(file);
                plugin.ebFilesview.addToImagelist(fileobj);
                setRefid(refid, thumb);
            }
            else {
                thumb.find(".error").show();
                thumb.find(".success").hide();
            }
        };

        let setRefid = function (refid, thumb) {
            refidArr.push(refid);
            thumb.find(".success").show();
            thumb.find(".load_spinner").remove();
            thumb.find(".error").hide();
            thumb.attr("filref", refid);
            thumb.parent().attr('filrefid', refid);
            let $hiddenInput = $(`#${plugin.settings.fileCtrl.EbSid}_bindfn`);
            $hiddenInput.val(refidArr.join(","));
            $hiddenInput.trigger('change');
            $(`#${plugin.settings.fileCtrl.EbSid}`).attr("fileCount", refidArr.length)
            $(`trggrpreview, [filrefid=${refid}]`).on("click", viewFilesFn);
        };

        this.refidListfn = function () {
            return refidArr.join(",");
        };

        let createFileviewer = function () {
            $("#ebfileviewdiv").remove();
            $("body").append("<div id='ebfileviewdiv'></div>");
            plugin.ebFilesview = $("#ebfileviewdiv").ebFileViewer(filesView);
        }.bind(this);

        let viewFilesFn = function (e) {
            prevent(e);
            let fileref = $(e.target).closest(".uploaded-file").attr("filref");

            //ebfileviewer 
            plugin.ebFilesview.showimage(fileref, plugin.settings.fileCtrl.ViewerPosition);
        }


        this.init();

        return this;
    };

}(jQuery));