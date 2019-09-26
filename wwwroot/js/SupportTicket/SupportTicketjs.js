var BugReport = function () {

    this.init2 = function () {
        this.AppendBugsfn();

        $(".edttkt").on("click", this.EditTicketfn.bind(this));
        $(".cloissue").on("click", this.CloseTicketfn.bind(this));
        $("#newticket").on("click", this.NewTicketfn.bind(this));



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
                    <button class="btn btn-default btn-xs edttkt" style="color:blue" tktno="${obj.ticketid}" id="edt${obj.ticketid}">Edit <i class="fa fa-fw fa-edit  fa-lg fa-fw"></i></button>
                    <button class="btn btn-default btn-xs cloissue" style="color:red" tktno="${obj.ticketid}" id="cl${obj.ticketid}">Close issue  <i class="fa fa-fw fa-close fa-lg fa-fw"></i></button>

              </td>
         </tr>`;
        });
        $("#bugtblbody").empty().append(html1);
    }



    this.EditTicketfn = function (ev) {

        let tktno = $(ev.target).closest('button').attr("tktno");
        $("#eb_common_loader").EbLoader("show");
        location.href = `/SupportTicket/EditTicket?tktno=${tktno}`;

    }

    this.CloseTicketfn = function (ev) {
        let tktno = $(ev.target).attr("tktno");
        $("#eb_common_loader").EbLoader("show");
        $.ajax({
            url: "../SupportTicket/ChangeStatus",
            data: { tktno: tktno, },
            cache: false,
            type: "POST",
            success: function () {
                $("#eb_common_loader").EbLoader("hide");
            }
        });

        location.href = '/SupportTicket/bugsupport';
    }

    this.NewTicketfn = function () {
        $("#eb_common_loader").EbLoader("show");
        let tktno = "newticket";
        location.href = `/SupportTicket/EditTicket?tktno=${tktno}`;
    }


    this.init2();
};





//for editticket.cshtml






var EditTicket = function () {

    this.init1 = function () {
        this.AppendTicketfn();
        $("#btnupdate").on("click", this.Updateticketfn.bind(this));
        $("#btnupdateadmin").on("click", this.UpdateAdminTicketfn.bind(this));
        $("#savebugid").on("click", this.Savebug.bind(this));

    };

    this.AppendTicketfn = function () {
        if (ckecktkt == "True") {

        }
        else {
            $.each(tktdtl.supporttkt, function (i, obj) {
                $("#tktid").val(obj.ticketid);
                if (ebcontext.sid == "admin") {
                    $("#stsid").append(` <option selected="selected" hidden >${obj.status}</option>`);
                }
                else {
                    $("#stsid").val(obj.status);
                }
                $("#asgnid").val(obj.assignedto);
                $("#bugtitle").val(obj.title);
                if (ebcontext.user.wc == "tc") {
                    $("#soluid").append(` <option selected="selected" hidden >${obj.solutionid}</option>`);
                }
                else {
                    $("#soluid").val(obj.solutionid);
                }
                if (ebcontext.sid == "admin") {
                    $("#bugpriority").val(obj.priority);
                }
                else {
                    $("#bugpriority").append(` <option selected="selected" hidden >${obj.priority}</option>`);
                }

              
                $("#dtecrtd").val(obj.createdat);
                $("#dtemdfyd").val(obj.lstmodified);
                $("#descriptionid").val(obj.description);
                $("#remarkid").val(obj.remarks);
                $("#type_b_f").val(obj.type_b_f);
                document.getElementById('Bug').checked = false;
                if (obj.type_b_f == "Bug") {
                    document.getElementById("Bug").checked = true;
                }
                else {
                    document.getElementById("FeatureRequest").checked = true;
                }

            });
        }
    }


    this.Savebug = function () {
        let bfr = null
        let fill = this.validatefn();
        if (fill) {
            var data = new FormData();
            $("#eb_common_loader").EbLoader("show");
            var totalFiles = window.filearray.length;
            for (var i = 0; i < totalFiles; i++) {
                var file = window.filearray[i];
                data.append("imageUploadForm" + i, file);
            }
            var tlt = $("#bugtitle").val().trim();
            var sts = $("#stsid").val().trim();
            var desc = $("#descriptionid").val().trim();
            var priori = $("#bugpriority option:selected").text().trim();
            var solu = $("#soluid option:selected").attr('value');
            var typ = $('input[name=optradio]:checked').val();
            data.append("title", tlt);
            data.append("descp", desc);
            data.append("priority", priori);
            data.append("stats", sts);
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
                    $("#eb_common_loader").EbLoader("hide");
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

    this.Updateticketfn = function () {
        let fill = this.validatefn();
        if (fill) {
            var data = new FormData();
            $("#eb_common_loader").EbLoader("show");
            var totalFiles = window.filearray.length;
            for (var i = 0; i < totalFiles; i++) {
                var file = window.filearray[i];
                data.append("imageUploadForm" + i, file);
            }
            var tlt = $("#bugtitle").val().trim();
            var desc = $("#descriptionid").val().trim();
            var priori = $("#bugpriority option:selected").text().trim();
            var solu = $("#soluid").val();
            var tktid = $("#tktid").val();
            var typ = $('input[name=optradio]:checked').val();
            data.append("title", tlt);
            data.append("descp", desc);
            data.append("priority", priori);
            data.append("solid", solu);
            data.append("tktid", tktid);
            data.append("filedelet", JSON.stringify(window.filedel));
            data.append("type_f_b", typ);



            $.ajax({
                url: "../SupportTicket/UpdateTicket",
                type: 'POST',
                data: data,
                processData: false,
                contentType: false,
                success: function () {
                    location.href = '/SupportTicket/bugsupport';
                    $("#eb_common_loader").EbLoader("hide");
                }
            });
        }

    }


    this.UpdateAdminTicketfn = function () {
        let fill = this.validatefn();
        if (fill) {
            var data = new FormData();
            $("#eb_common_loader").EbLoader("show");
            //var totalFiles = window.filearray.length;
            //for (var i = 0; i < totalFiles; i++) {
            //    var file = window.filearray[i];
            //    data.append("imageUploadForm" + i, file);
            //}
            //var tlt = $("#bugtitle").val().trim();
            //var desc = $("#descriptionid").val().trim();
            //var priori = $("#bugpriority option:selected").text().trim();
            var solu = $("#soluid").val();
            var tktid = $("#tktid").val();
            var typ = $('input[name=optradio]:checked').val();
            var sts = $("#stsid option:selected").text().trim();
            var asgned = $("#asgnid option:selected").text().trim();
            var rmrk = $("#remarkid").val();
            //data.append("title", tlt);
            //data.append("descp", desc);
            //data.append("priority", priori);
            data.append("solid", solu);
            data.append("tktid", tktid);
           // data.append("filedelet", JSON.stringify(window.filedel));
            data.append("type_f_b", typ);
            data.append("stats", sts);
            data.append("asgnedto", asgned);
            data.append("remark", rmrk);



            $.ajax({
                url: "../SupportTicket/UpdateTicketAdmin",
                type: 'POST',
                data: data,
                processData: false,
                contentType: false,
                success: function () {
                    location.href = '/SupportTicket/bugsupport';
                    $("#eb_common_loader").EbLoader("hide");
                }
            });
        }

    }


    this.init1();
};






/*! Image Uploader - v1.0.0 - 15/07/2019
 * Copyright (c) 2019 Christian Bayer; Licensed MIT */

(function ($) {
    window.filearray = [];
    window.filedel = [];
    var preloadedfile = 0;
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
                        $uploadedContainer.append(createImg(plugin.settings.preloaded[i].src, plugin.settings.preloaded[i].id, plugin.settings.preloaded[i].cntype, plugin.settings.preloaded[i].fileno, true));
                    }

                }

            });

        };


        let dataTransfer = new DataTransfer();

        let createContainer = function () {

            // Create the image uploader container
            let $container = $('<div>', { class: 'image-uploader bdrrds4' }),

                // Create the input type file and append it to the container
                $input = $('<input>', {
                    type: 'file',
                    id: plugin.settings.imagesInputName,
                    accept: 'image/jpeg,image/png,image/jpg,application/pdf',
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

            var src1 = $(e.target).closest('img').attr('src');
            
            //e.preventDefault();
          //  e.stopPropagation();

        };

        let createImg = function (src, id, cntype, fileno) {

            // Create the upladed image container
            let $container = $('<div>', { class: 'uploaded-image' });

            // Create the img tag

            if (cntype == 'application/pdf') {

                src = '/images/pdf-image.png';
                $img = $('<img>', { src: src, cntype: cntype }).appendTo($container);
               // $img = $('<iframe>', { src: src }).appendTo($container);
            }
            else {
                $img = $('<img>', { src: src, cntype: cntype}).appendTo($container);
            }



            // Create the delete button
            $button = $('<button>', { class: 'delete-image' }).appendTo($container),

                // Create the delete icon
                $i = $('<i>', { class: 'material-icons', text: 'clear' }).appendTo($button);

            // If the images are preloaded
            if (plugin.settings.preloaded.length) {

                // Set a identifier
                $container.attr('data-preloaded', true);
                $container.attr('data-index', id);
                $container.attr('data-fileno', fileno);
                $container.attr('data-cntype', cntype);

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


                let flno = parseInt($container.data('fileno'));

                // If is not a preloaded image
                if (($container.data('index')) >= 0) {

                    // Get the image index
                    let index = parseInt($container.data('index'));

                    // Update other indexes
                    $container.parent().find('.uploaded-image[data-index]').each(function (i, cont) {
                        if (i > index) {
                            $(cont).attr('data-index', i - 1);
                        }
                    });

                    //remove from file array
                    window.filearray.splice(index, 1);

                    // Remove the file from input
                    dataTransfer.items.remove(index);
                }
                if (flno > 0) {
                    window.filedel.push(flno);
                }

                // Remove this image from the container
                $container.remove();

                var nm = (((preloadedfile - window.filedel.length) + filearray.length) < 10);

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

            if (typeof (tktdtl) !== 'undefined') {
                for (var p = 0; p < tktdtl.supporttkt.length; p++) {

                    preloadedfile = tktdtl.supporttkt[p].Fileuploadlst.length;
                }
            }


            // Run through the files
            $(files).each(function (i, file) {
                if ((files[i].type == "image/jpeg") || (files[i].type == "image/jpg") || (files[i].type == "application/pdf") || (files[i].type == "image/png")) {
                    if ((files[i].size) < 2097152) {
                        if (((preloadedfile - window.filedel.length) + filearray.length) < 10) {

                            //add it to file array
                            filearray.push(file);

                            // Add it to data transfer
                            dataTransfer.items.add(file);

                            // Set preview

                            //if (files[i].type == "application/pdf") {

                            //    $uploadedContainer.append(createImg('/images/pdf-image.png', dataTransfer.items.length - 1));
                            //}
                            //else
                            {
                                $uploadedContainer.append(createImg(URL.createObjectURL(file), dataTransfer.items.length - 1, files[i].type));
                            }

                        }
                        else {
                            EbMessage("show", { Message: "Maximum number of files reached ", Background: 'red' });
                        }
                    }
                    else {
                        EbMessage("show", { Message: "Maximum file size is 2MB", Background: 'red' });
                    }
                }
                else {
                    EbMessage("show", { Message: "Only image and pdf are allowed", Background: 'red' });
                }




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

