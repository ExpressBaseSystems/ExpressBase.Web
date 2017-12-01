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
        $('#summernot_container' + tabNum + ' .note-editable').bind('paste', this.SetCode.bind(this));
       // $('#summernot_container' + tabNum + ' .note-editable').bind('append', this.SetCode.bind(this));
        $('#summernot_container' + tabNum + ' .note-editable').on('keyup',this.SetCode.bind(this));
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
        $(".note-editable").on('click', this.onclickFn.bind(this));

    };

   

    this.onclickFn=function (e) {
        this.PosLeft = e.pageX - $(".note-editable").offset().left;
        this.PosRight = e.pageY - $(".note-editable").offset().top;
           
    };
    this.onDropFn = function (event, ui) {
        //this.posLeft = event.pageX;
        //this.posTop = event.pageY;
        this.dropLoc = $(event.target);
        this.col = $(ui.draggable);

        var id = this.ObjId++;
        var obj = new EbObjects["DsColumns"](id);

        this.dropLoc.append(obj.$Control.outerHTML());
        obj.Title = this.col.text();
        obj.Left = this.PosLeft;
        obj.Right = this.PosRight;
        alert(obj.Left);
        this.ObjCollect[id] = obj;
        this.RefreshControl(obj);
        //$(".note-editable").append(text);
        this.SetCode();

    };

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
        this.EbObject = obj;
        commonO.Current_obj = obj;
        if (obj.DataSourceRefId) {
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
                success: this.xxx.bind(this)
            });
    };
    this.xxx = function (result) {
        $("#get-col-loader").hide();
        this.DrawColumnTree(result)
        $('.nav-tabs a[href="#data"]').tab('show');
    };

    this.DrawColumnTree = function (result) {
        var ctype;
        $.each(result.columns, function (i, columnCollection) {
            $('#data-table-list').append(" <li><a>Datatable" + ++i + "</a><ul id='t" + i + "'></ul></li>");
            $.each(columnCollection, function (j, obj) {               
                $("#data-table-list ul[id='t" + i + "'").append("<li value ='" + obj.type + "'  class='coloums draggable'>" + obj.columnName + "</li>");
               
            });
        });
        
        $('#data-table-list').treed();

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
            //start: getMousePositonOnDraggable.bind(this)
        });
       // $('.styl').off('dblclick').on('dblclick',this.yyy.bind(this));
    };

    getMousePositonOnDraggable = function (event, ui) {
        //PosOBjOFdrag['left'] = event.pageX - $(event.target).offset().left;
        //PosOBjOFdrag['top'] = event.pageY - $(event.target).offset().top;
    }
    this.yyy = function (e) {
        var dict = new Array();
        
        var obj = new Object({ Name: $(e.target).text().trim(), Type: $(e.target).attr("value") });
        dict.push($(e.target).text().trim());
        //dict.push({
        //    key: $(e.target).text().trim(),
        //    value: obj
        //});
        var colVal = "Table" + $(e.target).parent().siblings("a").text().slice(-1) + "." + $(e.target).text().trim();
        this.EbObject.Parameters = dict;
        console.log(this.EbObject.Parameters);
        e.preventDefault();
        this.insertselected("{{" + colVal + "}}");
    };

    this.insertselected = function (text) {
        var text = text;
        var id = this.ObjId++;
        var obj = new EbObjects["DsColumns"](id);

        $(".note-editable").append(obj.$Control.outerHTML());
        obj.Title = text;        
        this.ObjCollect[id] = obj;
        this.RefreshControl(obj);
        //$(".note-editable").append(text);
        this.SetCode();
    };

    this.SetCode = function (e) {
      //  console.log($('#summernote' + tabNum).summernote('code'));
        this.EbObject.Body = window.btoa($('#summernote' + tabNum).summernote('code'));       
        commonO.Current_obj = this.EbObject;
    }

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

function pasteHtmlAtCaret(html) {
    var sel, range;
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // non-standard and not supported in all browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
    }
}

        

     
