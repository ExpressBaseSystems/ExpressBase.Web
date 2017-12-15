var EmailWrapper = function (refid, ver_num, type, dsobj, cur_status, tabNum) {
    this.propObj;
    this.Refid = refid;
    this.EbObject = dsobj;
    this.emailpropG = new Eb_PropertyGrid("PropertyG");
    this.ObjId = 0;
    this.ObjCollect = {};
    this.PosLeft;
    this.PosRight;

    this.Init = function () {
       // $('#summernot_container' + tabNum + ' .note-editable').bind('paste', this.SetCode.bind(this));
       //// $('#summernot_container' + tabNum + ' .note-editable').bind('append', this.SetCode.bind(this));
       // $('#summernot_container' + tabNum + ' .note-editable').on('keyup', this.SetCode.bind(this));

        if (this.EbObject === null) {
            this.EbObject = new EbObjects["EbEmailTemplate"]("email");
            commonO.Current_obj = this.EbObject;
        }
        else {
            //console.log(this.EbObject);
            //alert(this.EbObject.Body);
            //$('#summernote' + tabNum).append(this.EbObject.Body);
        }
        this.emailpropG.setObject(this.EbObject, AllMetas["EbEmailTemplate"]);
        this.Name = this.EbObject.Name;
        this.DrawDsTree();
        $(".note-editable").droppable({ accept: ".coloums", drop: this.onDropFn.bind(this) });       
    };

    this.onDropFn = function (event, ui) {          
        $('#summernot_container' + tabNum + ' .note-editable').focus();
        this.dropLoc = $(event.target);
        this.col = $(ui.draggable);
        var id = "DataField" + this.ObjId++;
        var obj = new EbObjects["DsColumns"](id);
        this.pasteHtmlAtCaret(obj.$Control.outerHTML());
        var tbl = $('#' + this.col.text()).data('mytbl');
        obj.Title = "{{" + tbl + this.col.text() + "}}";       
        this.ObjCollect[id] = obj;
        this.RefreshControl(obj); 
        this.EbObject.DsColumnsCollection.push(obj);
        this.placeCaretAtEnd(document.getElementById(id));
        $('#' + id).attr('contenteditable', 'false');
       // this.SetCode();
        $('#summernot_container' + tabNum + ' .note-editable').focus();
    };
    this.placeCaretAtEnd = function (el) {
        el.focus();
        if (typeof window.getSelection !== "undefined"
            && typeof document.createRange !== "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange !== "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }

    this.RefreshControl = function (obj) {
        var NewHtml = obj.$Control.outerHTML();
        var metas = AllMetas["DsColumns"];
        $.each(metas, function (i, meta) {
            var name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', obj[name]);
            }
        });
        $("#" + obj.EbSid).replaceWith(NewHtml);
        $("#" + obj.EbSid).attr("tabindex", "1").off("focus").on("focus", this.elementOnFocus.bind(this));;
        
    };//render after pgchange


    this.elementOnFocus = function (event)
    {
        event.stopPropagation();
        var curControl = $(event.target);
        var id = curControl.attr("id");
        var curObject = this.ObjCollect[id];
        this.emailpropG.setObject(curObject, AllMetas["DsColumns"]);      
    }

    this.emailpropG.PropertyChanged = function (obj, Pname) {              
        if (Pname === 'DataSourceRefId') {
            this.getDataSourceColoumns();
        }
    }.bind(this);

    this.getDataSourceColoumns = function () {
            $('#data-table-list').empty();
            $("#get-col-loader").show();
            $.ajax({
                url: "../RB/GetColumns",
                type: "POST",
                cache: false,
                data: { refID: this.EbObject.DataSourceRefId },
                success: this.AjaxSuccess.bind(this)
            });
    };

    this.AjaxSuccess = function (result) {
        $("#get-col-loader").hide();
        this.DrawColumnTree(result)
        $('.nav-tabs a[href="#data"]').tab('show');
    };

    this.DrawColumnTree = function (result) {
        var ctype;
        $.each(result.columns, function (i, columnCollection) {
            $('#data-table-list').append(" <li><a>Datatable" + ++i + "</a><ul id='t" + i + "'></ul></li>");
            $.each(columnCollection, function (j, obj) {               
                $("#data-table-list ul[id='t" + i + "'").append("<li id = " + obj.columnName + " data-mytbl = 'Table" + i + ".'  class='coloums draggable'>" + obj.columnName + "</li>");              
            });
        });      
        $('#data-table-list').treed();
        $('#summernot_container' + tabNum + ' .note-editable').focus();
        $('.coloums').draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            appendTo: ".note-editable",
            stack: ".draggable",
            drag: function (event, ui) {
                $(ui.helper).css({ "background": "white", "border": "1px dotted black", "width": "200px" });
                $(ui.helper).children(".shape-text").remove();
                $(ui.helper).children().find('i').css({ "font-size": "50px", "background-color": "transparent" });
            },           
        });     
    };

    this.BeforeSave = function () {

        $('.note-editable').children().find('span').each(function (i, obj) {
            var text = $(obj).text();
            $(obj).replaceWith(text);
        });

        $('.note-editable').children('span').each(function (i, obj) {
            var text = $(obj).text();
            $(obj).replaceWith(text);
        });


        //console.log($('.note-editable').html());
        //alert($('.note-editable').html());
        this.EbObject.Body = window.btoa($('.note-editable').html());
        commonO.Current_obj = this.EbObject;
    }

    //this.SetCode = function (e) {
    //   // console.log($('#summernote' + tabNum).summernote('code'));
       
       
    //    this.EbObject.Body = window.btoa($('#summernote' + tabNum).summernote('code'));       
    //    commonO.Current_obj = this.EbObject;
    //}

    this.pasteHtmlAtCaret = function (html) {
        var sel, range;
        if (window.getSelection) {           
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();               
                var el = document.createElement("div");
                el.innerHTML = html;
                var frag = document.createDocumentFragment(),
                    node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if (document.selection && document.selection.type !== "Control") {          
            document.selection.createRange().pasteHTML(html);
        }
    };
    this.DrawDsTree = function () {
        $.fn.extend({
            treed: function (o) {

                var openedClass = 'glyphicon-minus-sign';
                var closedClass = 'glyphicon-plus-sign';

                if (typeof o !== 'undefined') {
                    if (typeof o.openedClass !== 'undefined') {
                        openedClass = o.openedClass;
                    }
                    if (typeof o.closedClass !== 'undefined') {
                        closedClass = o.closedClass;
                    }
                }
                var tree = $(this);
                tree.addClass("tree");
                tree.find('li').has("ul").each(function () {
                    var branch = $(this);
                    branch.prepend("<i class='indicator glyphicon " + closedClass + "'></i>");
                    branch.addClass('branch');
                    branch.on('click', function (e) {
                        if (this === e.target) {
                            var icon = $(this).children('i:first');
                            icon.toggleClass(openedClass + " " + closedClass);
                            $(this).children().children().toggle();
                        }
                    });
                    branch.children().children().toggle();
                });
                tree.find('.branch .indicator').each(function () {
                    $(this).on('click', function () {
                        $(this).closest('li').click();
                    });
                });
                tree.find('.branch>a').each(function () {
                    $(this).on('click', function (e) {
                        $(this).closest('li').click();
                        e.preventDefault();
                    });
                });
                tree.find('.branch>button').each(function () {
                    $(this).on('click', function (e) {
                        $(this).closest('li').click();
                        e.preventDefault();
                    });
                });
            }
        });
    }
    this.Init();
}



        

     
