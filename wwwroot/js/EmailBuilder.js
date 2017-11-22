var EmailWrapper = function (refid, ver_num, type, dsobj, cur_status, tabNum) {
    this.propObj;
    this.Refid = refid;
    this.EbObject = dsobj;
    this.emailpropG = new Eb_PropertyGrid("PropertyG");


    this.Init = function () {
        $('#summernot_container' + tabNum + ' .note-editable').bind('paste', this.SetCode.bind(this));
       // $('#summernot_container' + tabNum + ' .note-editable').bind('append', this.SetCode.bind(this));
        $('#summernot_container' + tabNum + ' .note-editable').on('keyup',this.SetCode.bind(this));
        if (this.EbObject === null) {
            this.EbObject = new EbObjects["EbEmailTemplate"]("email");
            commonO.Current_obj = this.EbObject;
        }
        else {
            $('#summernote' + tabNum).append(this.EbObject.Body);
        }
        this.emailpropG.setObject(this.EbObject, AllMetas["EbEmailTemplate"]);
        this.Name = this.EbObject.Name;

        this.DrawDsTree();
    };

  

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
        alert("hiii");
        $.each(result.columns, function (i, columnCollection) {
            $('#data-table-list').append(" <li><a>Datatable" + ++i + "</a><ul id='t" + i + "'></ul></li>");
            $.each(columnCollection, function (j, obj) {
                $("#data-table-list ul[id='t" + i + "'").append("<li class='styl'>" + obj.columnName + "</li>");
            });
        });
        $('#data-table-list').treed();

        $('.styl').off('dblclick').on('dblclick',this.yyy.bind(this));
    };

    this.yyy = function (e) {
        var colVal = "Table" + $(e.target).parent().siblings("a").text().slice(-1) + "." + $(e.target).text().trim();

        this.insertselected("«" + colVal + "»");
    };

    this.insertselected = function (text) {
        var text = text;
        $(".note-editable").append(text);
        this.SetCode();
    };

    this.SetCode = function (e) {
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

        function insertAtCursor(text) {
        $(".note-editable").attr("tabindex", "1").attr("onclick", "$(this).focus();");
    var sel, range;
            var text = text;
            if (window.getSelection) {

        sel = window.getSelection();
    console.log(sel);
                if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
    range.deleteContents();

                    var lines = text.replace("\r\n", "\n").split("\n");
                    var frag = document.createDocumentFragment();
                    for (var i = 0, len = lines.length; i < len; ++i) {
                        if (i > 0) {
        frag.appendChild(document.createElement("br"));
    }
                        frag.appendChild(document.createTextNode(lines[i]));
                    }

                    range.insertNode(frag);
                }
            } else if (document.selection && document.selection.createRange) {
        document.selection.createRange().text = text;
    }
        }

        

     
