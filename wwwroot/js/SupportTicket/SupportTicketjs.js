var BugReport = function () {

    this.init2 = function () {
        this.AppendBugsfn();
        $("#savebugid").on("click", this.Savebug.bind(this));
        $(".edttkt").on("click", this.EditTicketfn.bind(this));



    };

    this.AppendBugsfn = function () {
        let html1 = null;
        $.each(tktob.supporttkt, function (i, obj) {
            let p = "tkt" + i;
            html1 += `<tr id="${p}" tabindex="${i}" class="tbltkt"> 
            <td>${obj.ticketid}</td> 
            <td>${obj.title}</td> 
            <td>${obj.solutionid}</td> 
            <td>${obj.priority}</td> 
            <td>${obj.lstmodified}</td> 
            <td>${obj.status}</td> 
            <td>${obj.assignedto}</td> 
             <td> 
                    <button class="btn btn-default btn-xs edttkt" style="color:blue"  id="${obj.ticketid}">Edit <i class="fa fa-fw fa-edit  fa-lg fa-fw"></i></button>
                    <button class="btn btn-default btn-xs" style="color:red">Close issue  <i class="fa fa-fw fa-close fa-lg fa-fw"></i></button>

              </td>
         </tr>`;
        });
        $("#bugtblbody").empty().append(html1);
    }

    this.Savebug = function () {
        let bfr = null
        let fill = this.validatefn();
        if (fill) {
            //if ($("#check1").is(':checked')) {
            //    bfr = "featurerequest";
            //}
            //else {
            //    bfr = "bug";
            //}


            //$(".btn-mdlclose").click();

           

            var data = new FormData();
            var totalFiles = window.filearray.length;
            for (var i = 0; i < totalFiles; i++) {
                var file = window.filearray[i];
                data.append("imageUploadForm" + i, file);
            }
            var tlt = $("#bugtitle").val().trim();
            var desc = $("#descriptionid").val().trim();
            var priori = $("#bugpriority option:selected").text().trim();
            var solu = $("#soluid option:selected").attr('solu');
            var typ = $('input[name=optradio]:checked').val();
            data.append("title", tlt);
            data.append("descp", $("#descriptionid").val().trim());
            data.append("priority", priori);
            data.append("solid", solu);
            data.append("type_f_b", typ);

            $.ajax({
                url: "../SupportTicket/SaveBugDetails",
                type: 'POST',
                data: data,
                processData: false,
                contentType: false,
                success: function () {
                    location.href = '/SupportTicket/bugsupport';
                    alert("page reload");
                }
            });

            
        }
    }

    this.validatefn = function () {
        let sts = true

        let de = $("#descriptionid").val();
        if (de.length == 0) {
            $("#descrlbl").css("visibility", "visible");
            $("#descrlbl").show();
            $("#descriptionid").focus();
            //$('#name').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }
        else {
            //$('#name').removeClass('txthighlightred').addClass('txthighlight');
            $("#descrlbl").css("visibility", "hidden");
        }

        let bgt = $("#bugtitle").val();
        if (bgt.length == 0) {
            $("#titlelbl").css("visibility", "visible");
            $("#titlelbl").show();
            $("#bugtitle").focus();
            //$('#name').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }
        else {
            //$('#name').removeClass('txthighlightred').addClass('txthighlight');
            $("#titlelbl").css("visibility", "hidden");
        }

        return sts;
    }

    this.EditTicketfn = function (ev) {
        let idk = $(ev.target).attr("id");
        location.href = `/SupportTicket/EditTicket?tktno=${idk}`;

    }


    this.init2();
};





//for editticket.cshtml






var EditTicket = function () {

    this.init1 = function () {
        this.AppendTicketfn();
        $("#btnupdate").on("click", this.Updateticketfn.bind(this));

    };

    this.AppendTicketfn = function () {

        $.each(tktdtl.supporttkt, function (i, obj) {
            $("#tktid").text(obj.ticketid);
            $("#stsid").text(obj.status);
            $("#asgnid").text(obj.assignedto);
            $("#bugtitle").val(obj.title);
            $("#soluid").val(obj.solutionid);
            $("#bugpriority").append(` <option selected="selected" hidden >${obj.priority}</option>`);
            $("#dtecrtd").val(obj.createdat);
            $("#dtemdfyd").val(obj.lstmodified);
            $("#descriptionid").val(obj.description);
            $("#remarkid").val(obj.remarks);
            $("#type_b_f").val(obj.type_b_f);

        });
    }

    this.Updateticketfn = function () {
        let fil = this.validatefn();

        $.ajax({
            url: "../SupportTicket/UpdateTicket",
            data: {
                title: $("#bugtitle").val().trim(),
                descp: $("#descriptionid").val().trim(),
                priority: $("#bugpriority option:selected").text().trim(),
                tktid: $("#tktid").val(),
            },
            cache: false,
            type: "POST",
            success: function () {
                location.reload();
            }

        });
    }




    this.init1();
};






/*! Image Uploader - v1.0.0 - 15/07/2019
 * Copyright (c) 2019 Christian Bayer; Licensed MIT */

(function ($) {
    window.filearray = [];
    $.fn.imageUploader = function (options) {

        // Default settings
        let defaults = {
            preloaded: [],
            imagesInputName: 'images',
            preloadedInputName: 'preloaded',
            label: 'Drag & Drop files here or click to browse'
        };

        // Get instance
        let plugin = this;

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

                // If there are preloaded images
                if (plugin.settings.preloaded.length) {

                    // Change style
                    $container.addClass('has-files');

                    // Get the upload images container
                    let $uploadedContainer = $container.find('.uploaded');

                    // Set preloaded images preview
                    for (let i = 0; i < plugin.settings.preloaded.length; i++) {
                        $uploadedContainer.append(createImg(plugin.settings.preloaded[i].src, plugin.settings.preloaded[i].id, true));
                    }

                }

            });

        };


        let dataTransfer = new DataTransfer();

        let createContainer = function () {

            // Create the image uploader container
            let $container = $('<div>', { class: 'image-uploader' }),

                // Create the input type file and append it to the container
                $input = $('<input>', {
                    type: 'file',
                    id: plugin.settings.imagesInputName,
                    accept: 'image/*',
                    name: plugin.settings.imagesInputName + '[]',
                    multiple: ''
                }).appendTo($container),

                // Create the uploaded images container and append it to the container
                $uploadedContainer = $('<div>', { class: 'uploaded', id: 'upld' }).appendTo($container),

                // Create the text container and append it to the container
                $textContainer = $('<div>', {
                    class: 'upload-text'
                }).appendTo($container),

                // Create the icon and append it to the text container
                $i = $('<i>', { class: 'material-icons', text: 'cloud_upload' }).appendTo($textContainer),

                // Create the text and append it to the text container
                $span = $('<span>', { text: plugin.settings.label }).appendTo($textContainer);


            // Listen to container click and trigger input file click
            $container.on('click', function (e) {
                // Prevent browser default event and stop propagation
                prevent(e);

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

        let createImg = function (src, id) {

            // Create the upladed image container
            let $container = $('<div>', { class: 'uploaded-image' }),

                // Create the img tag
                $img = $('<img>', { src: src }).appendTo($container),

                // Create the delete button
                $button = $('<button>', { class: 'delete-image', indx: filearray.length }).appendTo($container),

                // Create the delete icon
                $i = $('<i>', { class: 'material-icons', text: 'clear' }).appendTo($button);

            // If the images are preloaded
            if (plugin.settings.preloaded.length) {

                // Set a identifier
                $container.attr('data-preloaded', true);

                // Create the preloaded input and append it to the container
                let $preloaded = $('<input>', {
                    type: 'hidden',
                    name: plugin.settings.preloadedInputName + '[]',
                    value: id
                }).appendTo($container)

            } else {

                // Set the identifier
                $container.attr('data-index', id);

            }

            // Stop propagation on click
            $container.on("click", function (e) {
                // Prevent browser default event and stop propagation
                prevent(e);
            });

            // Set delete action
            $button.on("click", function (e) {
                // Prevent browser default event and stop propagation
                prevent(e);


                //var g = document.getElementById('upld');
                //for (var i = 0; i < g.children.length; i++) {
                //    button[i].addEventListener('click', ((j) => {
                //        return function () {
                //            alert(j)
                //        }
                //    })(i)
                //    )
                //}

                $(".uploaded-image").click(function () {
                    alert($(this).index());
                });


                // If is not a preloaded image
                if ($container.data('indx')) {

                    // Get the image index
                    let index = parseInt($container.data('indx'));

                    // Update other indexes
                    $container.find('.uploaded-image[data-index]').each(function (i, cont) {
                        if (i > index) {
                            $(cont).attr('data-index', i - 1);
                        }
                    });

                    if (index > -1) {
                        filearray.splice(index, 1);
                    }
                    alert(filearray.length)

                    // Remove the file from input
                    dataTransfer.items.remove(index);

                }

                // Remove this image from the container
                $container.remove();

                // If there is no more uploaded files
                if (!$container.find('.uploaded-image').length) {

                    // Remove the 'has-files' class
                    $container.removeClass('has-files');

                }

            });

            return $container;
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


            // Makes the upload
            setPreview($container, files);
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

                filearray.push(file);
                //alert(filearray.length);
                // Add it to data transfer
                dataTransfer.items.add(file);

                // Set preview
                $uploadedContainer.append(createImg(URL.createObjectURL(file), dataTransfer.items.length - 1));

            });

            // Update input files
            $input.prop('files', dataTransfer.files);

        };

        // Generate a random id
        let random = function () {
            return Date.now() + Math.floor((Math.random() * 100) + 1);
        };

        this.init();

        // Return the instance
        return this;
    };

}(jQuery));

