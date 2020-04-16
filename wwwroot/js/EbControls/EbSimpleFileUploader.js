/*! Image Uploader - v1.0.0 - 15/07/2019
 * Copyright (c) 2019 Christian Bayer; Licensed MIT */

(function ($) {

    $.fn.fileUploader = function (options) {

        // Default settings
        let defaults = {
            preloaded: [],
            maxSize: 2,
            maxFiles: 1,
            fileTypes: 'image/jpeg,image/png,image/jpg'
        };

        // Get instance
        let plugin = this;
        let $inrContainer;
        let filearray = [];
        let filedel = [];
        let preloadedfile = 0;
        let refidArr = [];
        // Set empty settings
        plugin.settings = {};

        // Plugin constructor
        plugin.init = function () {

            // Define settings
            plugin.settings = $.extend(plugin.settings, defaults, options);

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

        this.createPreloaded = function (prelod) {
            plugin.settings.preloaded = prelod;
            let $container = $(`#${plugin.settings.fileCtrl.EbSid}_SFUP`);
            $container.addClass('has-files');
            let $uploadedContainer = $container.find('.uploaded');
            for (let i = 0; i < plugin.settings.preloaded.length; i++) {
                $uploadedContainer.append(createImg(plugin.settings.preloaded[i], plugin.settings.preloaded[i].id, plugin.settings.preloaded[i].cntype, true, plugin.settings.preloaded[i].fileno, plugin.settings.preloaded[i].refid));
                setRefid(plugin.settings.preloaded[i].refid, $inrContainer);
                preloadedfile++;
            }
        }

        this.clearFiles = function () {
            refidArr = [];
            $(`#${plugin.settings.fileCtrl.EbSid}_bindfn`).val("");
            let $container = $(`#${plugin.settings.fileCtrl.EbSid}_SFUP`).find('.uploaded').empty();
            $container.removeClass('has-files');
            return;

        }



        //   let dataTransfer = new DataTransfer();

        let createContainer = function () {

            // Create the image uploader container
            let $container = $("#" + plugin.settings.fileCtrl.EbSid + "_SFUP"),

                // Create the input type file and append it to the container
                $input = $('<input>', {
                    type: 'file',
                    id: "fileinputID",
                    accept: plugin.settings.fileTypes,
                    name: "fileInputnm",
                    multiple: plugin.settings.maxFiles
                }).appendTo($container),

                // Create the uploaded images container and append it to the container
                $uploadedContainer = $('<div>', { class: 'uploaded' }).appendTo($container);
            $container.append(`<input type="text" id='${plugin.settings.fileCtrl.EbSid}_bindfn' hidden >`)



            // Listen to container click and trigger input file click
            $container.on('click', function (e) {
                // Prevent browser default event and stop propagation
                //prevent(e);
                e.preventDefault();
                e.stopPropagation();

                // Trigger input click
                $input.trigger('click');
            });

            // Stop propagation on input click
            $input.on("click", function (e) {
                e.stopPropagation();
            });

            // Listen to input files changed
            $input.on('change', fileSelectHandler.bind($container));

            return $container;
        };


        let prevent = function (e) {
            // Prevent browser default event and stop propagation
            e.preventDefault();
            e.stopPropagation();

        };


        let createImg = function (file, id, cntype, prelod, fileno,refid) {
            var filelurl;
            if (prelod) {
                filelurl = file.src;//for pdf
                file.name = refid;
            } else {
                filelurl = URL.createObjectURL(file);//for pdf

            }
            let src = filelurl;
            if (plugin.settings.botCtrl) {
                $filethumb = $('<div>', { class: 'botfilethumb' });
                $inrContainer = $('<div>', { class: 'botuploaded-image', exact: file.name }).appendTo($filethumb);

                if (cntype == 'application/pdf') {

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
                //$button = $('<span>', { class: 'delete-image' }).appendTo($inrContainer),
                //$i = $('<i>', { class: 'fa fa-times-circle  ' }).appendTo($button);
            }
            else {
                $filethumb = $('<div>', { class: 'filethumb' });
                $filethumb.append("<div id='file_disp'></div>");

                // Create the upladed image container
                $inrContainer = $('<div>', { class: 'uploaded-image', exact: file.name }).appendTo($filethumb);
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
                //$button = $('<span>', { class: 'delete-image' }).appendTo($inrContainer),
                //    $i = $('<i>', { class: 'fa fa-times-circle  ' }).appendTo($button);
            }


            // If the images are preloaded
            if (plugin.settings.preloaded.length) {

                // Set a identifier
                $inrContainer.attr('data-preloaded', true);
                $inrContainer.attr('data-index', id);
                $inrContainer.attr('data-fileno', fileno);
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

            // Set delete action
            //$button.on("click", function (e) {
            //    // Prevent browser default event and stop propagation
            //    prevent(e);


            //    let flno = parseInt($inrContainer.data('fileno'));

            //    // If is not a preloaded image
            //    if (($inrContainer.data('index')) >= 0) {

            //        // Get the image index
            //        let index = parseInt($inrContainer.data('index'));

            //        // Update other indexes
            //        $inrContainer.parent().find('.uploaded-image[data-index]').each(function (i, cont) {
            //            if (i > index) {
            //                $(cont).attr('data-index', i - 1);
            //            }
            //        });

            //        //remove from file array
            //    filearray.splice(index, 1);

            //        // Remove the file from input
            //        //  dataTransfer.items.remove(index);
            //    }
            //    if (flno > 0) {
            //        filedel.push(flno);
            //    }

            //    let $contParent = $inrContainer.parent().parent();
            //    // Remove this image from the container
            //    $inrContainer.parent().remove();
            //    //$inrContainer.remove();

            //    var nm = (((preloadedfile - filedel.length) + filearray.length) < 10);

            //    // If there is no more uploaded files
            //    if (!$contParent.find('.uploaded-image').length) {

            //        // Remove the 'has-files' class
            //        $contParent.parent().removeClass('has-files');

            //    }

            //});

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
            fileArr = []
            $.each(files, function (i, n) {
                fileArr.push(n);
            });
            if (fileArr.length > plugin.settings.maxFiles) {
                fileArr=fileArr.slice(0, plugin.settings.maxFiles);
            }
            // Makes the upload
            setPreview($container, fileArr);
        };

        let setPreview = function ($container, files) {

            // Add the 'has-files' class
            $container.addClass('has-files');

            // Get the upload images container
            let $uploadedContainer = $container.find('.uploaded'),

                // Get the files input
                $input = $container.find('input[type="file"]');

            // Run through the files
            $(files).each(function (i, file) {
                let url = "";
                if ((files[i].type == "image/jpeg") || (files[i].type == "image/jpg") || (files[i].type == "application/pdf") || (files[i].type == "image/png")) {
                    if ((files[i].size) < (plugin.settings.maxSize * 1024 * 1024)) {
                        if (((preloadedfile - filedel.length) + filearray.length) < plugin.settings.maxFiles) {



                            // Add it to data transfer
                            //   dataTransfer.items.add(file);

                            // Set preview

                            //if (files[i].type == "application/pdf") {

                            //    $uploadedContainer.append(createImg('/images/pdf-image.png', dataTransfer.items.length - 1));
                            //}
                            //else
                            {
                                $uploadedContainer.append(createImg(file, filearray.length - 1, files[i].type), false);
                            }

                            let type = getFileType(file);
                            if (type === "image")
                                url = "../StaticFile/UploadImageAsync";
                            else
                                url = "../StaticFile/UploadFileAsync";

                            uploadItem(url, file);


                        }
                        else {
                            EbMessage("show", { Message: "Maximum number of files reached ", Background: 'red' });
                        }
                    }
                    else {
                        EbMessage("show", { Message: `Maximum file size is ${plugin.settings.MaxSize}MB`, Background: 'red' });
                    }
                }
                else {
                    EbMessage("show", { Message: "Only image and pdf are allowed", Background: 'red' });
                }




            });


        };

        //get file type
        let getFileType = function (file) {
            if (file.type.match('image.*'))
                return "image";
            else
                return "file";
        }


        let uploadItem = function (_url, file) {
            let thumb = null;
            let formData = new FormData();
            formData.append("File", file);

            $.ajax({
                url: _url,
                type: "POST",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                beforeSend: function (evt) {

                    thumb = $inrContainer;
                    //thumb.find(".eb-upl-loader").show();
                }.bind(this)
            }).done(function (refid) {
                successOper(thumb, refid, file);
            }.bind(this));
        }

        let successOper = function (thumb, refid, file) {
            // thumb.find(".eb-upl-loader").hide();
            if (refid > 0) {
                //add it to file array
                filearray.push(file);
                setRefid(refid, thumb);
            }
            else {
                thumb.find(".error").show()
                thumb.find(".success").hide();
            }
        }
        let setRefid = function (refid, thumb) {
            refidArr.push(refid);
            thumb.find(".success").show();
            thumb.find(".error").hide();
            thumb.attr("fRefid", refid)
            $(`#${plugin.settings.fileCtrl.EbSid}_bindfn`).val(refidArr.join(","));
            $(`#${plugin.settings.fileCtrl.EbSid}_bindfn`).trigger('change');
        }
        this.refidListfn = function () {
            return refidArr.join(",");
        }

        this.init();

        return this;
    };

}(jQuery));