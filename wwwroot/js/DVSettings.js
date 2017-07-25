
var coldef4Setting = function (d, t, cls, rnd, wid) {
    this.data = d;
    this.title = t;
    this.className = cls;
    this.render = rnd;
    this.width = wid;
};

var axis = function (indx, name) {
    this.index = indx;
    this.name = name;
};

var DVObj = function (dsid, settings, login, dvlist) {
    this.TVPrefObj = settings;
    this.dsid = dsid;
    this.settings_tbl = null;
    this.columnsdel = [];
    this.columnsextdel = [];
    this.XLength = 0;
    this.XLength = 0;
    this.ddClicked = false;
    this.dvList = dvlist;

    this.init = function () {
        //$(".nav-item a[href='3a']").tab('hide');
        $("input[name=renderAs]").off("click").on("click", this.graphSettings.bind(this));
        if (Object.keys(this.TVPrefObj).length > 0) {
            $("#dvName_txt").val(this.TVPrefObj.dvName);
            //$("#serial_check").prop("checked", this.TVPrefObj.hideSerial);
            //$("#select_check").prop("checked", this.TVPrefObj.hideCheckbox);
            $("input[name=renderAs][value=" + this.TVPrefObj.renderAs + "]").prop("checked", true).trigger("click");
            $("#pageLength_text").val(this.TVPrefObj.lengthMenu[0][0]);
            $("#scrollY_text").val(this.TVPrefObj.scrollY);
            $("#rowGrouping_text").val(this.TVPrefObj.rowGrouping);
            $("#leftFixedColumns_text").val(this.TVPrefObj.leftFixedColumns);
            $("#rightFixedColumns_text").val(this.TVPrefObj.rightFixedColumns);
            this.callPost4SettingsTable();
            this.getcolumn4dropdown();
            if (this.TVPrefObj.options !== null && this.TVPrefObj.options !== undefined)
                $("#graphtypeDD .btn:first-child").text(this.TVPrefObj.options.type.trim());
        }
        $("#datatSourceDropdown .dropdown-menu li a").off("click").on("click", this.setDropdownDatasource.bind(this));
        $("#graphtypeDD .dropdown-menu li a").off("click").on("click", this.setDropdownGraphType.bind(this));
        $("#Save_btn").off("click").on("click", this.saveSettings.bind(this));
        $(".eb_delete_btn").off("click").on("click", this.deleteRow.bind(this));
        $("#columnDropdown .dropdown-menu a").off("click").on("click", this.clickDropdownfunc.bind(this));
        
        $("#btnMovetoX").off("click").on("click", this.Moveto_X_List.bind(this));
        $("#btnMovetoY").off("click").on("click", this.Moveto_Y_List.bind(this));
    };

    this.setDropdownDatasource = function (e) {
        this.ddClicked = true;
        if (this.settings_tbl !== null) {
            $('#Table_Settings').DataTable().destroy();
            $("#2a").children("#Table_Settings_wrapper").remove();
            $("#Table_Settings").remove();
            var table = $(document.createElement('table')).addClass('table table-striped table-bordered').attr('id', "Table_Settings");
            $("#2a").children("#columnDropdown").after(table);
            //$("input[name=renderAs][value=" + this.TVPrefObj.renderAs + "]").prop("checked", true).trigger("click");
            
            $("input[name=renderAs][value=" + this.TVPrefObj.renderAs + "]").prop("checked", true).trigger("click");
        }
        $("#loader").show();
        this.dsid = $(e.target).parent().attr("data-dsid");
        $("#datatSourceDropdown .btn:first-child").text($(e.target).text());
        $("#datatSourceDropdown .btn:first-child").val($(e.target).text());
        $.post('../Dev/GetColumns', { dsid: this.dsid }, this.getColumnsSuccess.bind(this));

    };

    this.getColumnsSuccess = function (data) {
        $("#loader").hide();
        this.TVPrefObj = JSON.parse(data);
        //this.TVPrefObjCopy = JSON.parse(data);
        this.callPost4SettingsTable();
    };

    this.callPost4SettingsTable = function () {
        $("#loader").show();
        this.settings_tbl = $('#Table_Settings').DataTable(
        {
            columns: this.column4SettingsTbl(),
            data: this.getData4SettingsTbl(),
            paging: false,
            ordering: false,
            searching: false,
            info: false,
            scrollY: '300',
            //select: true,
            //rowReorder: { selector: 'tr' },
            initComplete: this.initComplete4Settingstbl.bind(this),
        });
        CreatePropGrid(this.settings_tbl.row(0).data(), this.TVPrefObj.columnsext, this.dvList);
        $('#Table_Settings tbody').on('click', 'tr', this.showPropertyGrid.bind(this));
        //setTimeout(function (){
        //    $("#Table_Settings_wrapper table:eq(0)").css("min-width", "");
        //}, 500);
        //$(".modal-content").on("click", function (e) {
        //    if ($(e.target).closest(".font-select").length === 0) {
        //        $(".font-select").removeClass('font-select-active');
        //        $(".fs-drop").hide();
        //    }
        //});
    };

    this.column4SettingsTbl = function () {
        var colArr = [];
        colArr.push(new coldef4Setting('', '#', "", function (data, type, row, meta) { return (meta.row) + 1 }));
        colArr.push(new coldef4Setting('data', 'Column Index', 'hideme', function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='index'>" : data; }));
        colArr.push(new coldef4Setting('name', 'Name', 'hideme', function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='name' style='border: 0;width: 100px;' readonly>" : data; }, ""));
        colArr.push(new coldef4Setting('type', ' Column Type', 'hideme', function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='type'>" : data; }));
        colArr.push(new coldef4Setting('title', 'Title', "", function (data, type, row, meta) { return (data !== "") ? "<input type='hidden' value=" + data + " name='title' style='width: 100px;'>" + data : data; }, ""));
        colArr.push(new coldef4Setting('visible', 'Visible?', "", function (data, type, row, meta) { return (data === 'true') ? "<input type='checkbox'  name='visibile' checked>" : "<input type='checkbox'  name='visibile'>"; }, ""));
        colArr.push(new coldef4Setting('width', 'Width', "", function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='width' style='width: 40px;'>" : data; }, ""));
        colArr.push(new coldef4Setting('className', 'Font', "", this.renderFontSelect, "30"));
        colArr.push(new coldef4Setting('', '', "", function (data, type, row, meta) { return "<a href='#' class ='eb_delete_btn'><i class='fa fa-times' aria-hidden='true' style='color:red' ></i></a>" }, "30"));
        return colArr;
    };

    this.getData4SettingsTbl = function () {
        var colarr = [];
        var n, d, t, v, w, ty, cls;
        $.each(this.TVPrefObj.columns, function (i, col) {
            if (col.name !== "serial" && col.name !== "checkbox") {
                n = col.name;
                d = col.data;
                t = col.title.substr(0, col.title.indexOf('<'));
                v = (col.visible).toString().toLowerCase();
                w = col.width.toString();
                if (col.type) ty = col.type.toString();
                cls = col.className;
                if (cls === undefined)
                    cls = "";
                colarr.push(new coldef(d, t, v, w, n, ty, cls));
            }
        });
        return colarr;
    };

    this.renderFontSelect = function (data, type, row, meta) {
        var fontName = data.replace("tdheight", " ").replace("dt-right", " ");
        if (fontName === "") {
            fontName = fontName.substring(5).replace(/_/g, " ");
            index = fontName.lastIndexOf(" ");
            fontName = fontName.substring(0, index);
            return "<input type='text' value=" + fontName + " class='font' style='width: 100px;' name='font' >";
        }
        else
            return "<input type='text' class='font' style='width: 100px;' name='font'>";
    };

    this.initComplete4Settingstbl = function (settings, json) {
        $('.font').fontselect();
        $("#loader").hide();
        $('#Table_Settings').DataTable().columns.adjust();
        //this.addEventListner4Settingstbl();
    };

    this.showPropertyGrid = function (e) {
        var idx = this.settings_tbl.row(e.target).index();
        CreatePropGrid(this.settings_tbl.row(idx).data(), this.TVPrefObj.columnsext, this.dvList);
        this.settings_tbl.columns.adjust();
    };

    this.saveSettings = function (e) {
        $("#loader").show();
        var objId = $(e.target).attr("data-objId");
        this.isSettingsSaved = true;
        var ct = 0; var objcols = [];
        var api = $('#Table_Settings').DataTable();
        var n, d, t, v, w, ty, cls;
        //objcols.push(this.getColobj("id"));
        $.each(api.$('input[name!=font],div[class=font-select]'), function (i, obj) {
            ct++;
            if (obj.type === 'text' && obj.name === 'name')
                n = obj.value;
            else if (obj.type === 'text' && obj.name === 'index')
                d = obj.value;
            else if (obj.type === 'hidden' && obj.name === 'title')
                t = obj.value + '<span hidden>' + n + '</span>';
            else if (obj.type === 'checkbox')
                v = obj.checked;
            else if (obj.type === 'text' && obj.name === 'width')
                w = obj.value;
            else if (obj.type === 'text' && obj.name === 'type')
                ty = obj.value;
            else if (obj.className === 'font-select') {
                if (!($(this).children('a').children('span').attr('style') === undefined)) {
                    var style = document.createElement('style');
                    style.type = 'text/css';
                    var fontName = $(this).children('a').children('span').css('font-family');
                    var replacedName = fontName.replace(/ /g, "_");
                    style.innerHTML = '.font_' + replacedName + ' {font-family: ' + fontName + '; }';
                    document.getElementsByTagName('head')[0].appendChild(style);
                    if (ty == "System.Int32" || ty == "System.Decimal" || ty == "System.Int64")
                        cls = 'font_' + replacedName + ' tdheight dt-right';
                    else
                        cls = 'font_' + replacedName + ' tdheight';
                }
                else {
                    if (ty == "System.Int32" || ty == "System.Decimal" || ty == "System.Int64")
                        cls = 'tdheight dt-right';
                    else
                        cls = 'tdheight';
                }
            }

            if (ct === api.columns().count() - 2) { ct = 0; objcols.push(new coldef(d, t, v, w, n, ty, cls)); n = ''; d = ''; t = ''; v = ''; w = ''; ty = ''; cls = ''; }
        });
        //this.TVPrefObj.hideSerial = $("#serial_check").prop("checked");
        //this.TVPrefObj.hideCheckbox = $("#select_check").prop("checked");$("input[name=rate]:checked").val()
        this.TVPrefObj.renderAs = $("input[name=renderAs]:checked").val();
        if (this.TVPrefObj.renderAs != "table") {
            var Xax = [];
            var opt = new Object();
            var xaxis = $("#list_Xcolumns li");
            $.each(xaxis, function (i, obj) {
                Xax.push(new axis($(obj).attr("data-id"), $(obj).text().substring(0, $(obj).text().length - 1).trim()));
            });
            opt.Xaxis = Xax;
            var yaxis = $("#list_Ycolumns li");
            Xax = [];
            $.each(yaxis, function (i, obj) {
                Xax.push(new axis($(obj).attr("data-id"), $(obj).text().substring(0, $(obj).text().length - 1).trim()));
            });
            opt.Yaxis = Xax;
            opt.type = $("#graphtypeDD .btn:first-child").text();
            this.TVPrefObj["options"] = opt;
        }
        this.TVPrefObj.lengthMenu = this.GetLengthOption($("#pageLength_text").val());
        this.TVPrefObj.scrollY = $("#scrollY_text").val();
        this.TVPrefObj.rowGrouping = $("#rowGrouping_text").val();
        this.TVPrefObj.leftFixedColumns = $("#leftFixedColumns_text").val();
        this.TVPrefObj.rightFixedColumns = $("#rightFixedColumns_text").val();
        this.TVPrefObj.dvName = $("#dvName_txt").val();
        this.TVPrefObj.dsId = this.dsid;
        this.TVPrefObj.columns = objcols;

        //this.TVPrefObj.columnsext = this.TVPrefObj.columnsext;
        //this.ebSettingsCopy.columnsdel = this.columnsdel;
        //this.ebSettingsCopy.columnsextdel = this.columnsextdel;
        this.AddSerialAndOrCheckBoxColumns(this.TVPrefObj.columns);
        //this.updateRenderFunc();
        if (this.TVPrefObj.rowGrouping.length > 0) {
            var groupcols = $.grep(this.TVPrefObj.columns, function (e) { return e.name === this.TVPrefObj.rowGrouping });
            groupcols[0].visible = false;
        }
        //console.log(JSON.stringify(this.TVPrefObj));
        $.post('../Dev/SaveSettings', { dsid: this.dsid, json: JSON.stringify(this.TVPrefObj), dvid: objId }, this.saveSuccess.bind(this));

    };

    this.saveSuccess = function () {//var d = new EbDataTable();d.isSettingsSaved=true;
        $(".alert").show(); isSettingsSaved = true;
        if (login == "uc") {
            $("#settingsmodal").modal('hide');
            //var ebdt = new EbDataTable({cols : settings})
        }
        $("#loader").hide();
    };

    this.getColobj = function (col_name) {
        var selcol = null;
        $.each(this.TVPrefObj.columns, function (i, col) {
            if (col.name.trim() === col_name.trim()) {
                selcol = col;
                return false;
            }
        });
        return selcol;
    };

    this.GetLengthOption = function (len) {
        var ia = [];
        for (var i = 0; i < 10; i++)
            ia[i] = (len * (i + 1));
        return JSON.parse("[ [{0},-1], [{0},\"All\"] ]".replace(/\{0\}/g, ia.join(',')));
    };

    this.AddSerialAndOrCheckBoxColumns = function (tx) {
        // if (!tx.hideCheckbox) {
        var chkObj = new Object();
        chkObj.data = null;
        chkObj.title = "<input id='{0}_select-all' type='checkbox' class='eb_selall' data-table='{0}'/>".replace("{0}", this.tableId);
        chkObj.width = 10;
        chkObj.orderable = false;
        chkObj.visible = true;
        chkObj.name = "checkbox";
        chkObj.type = "System.Boolean";
        //var idpos = $.grep(tx, function (e) { return e.name === "id"; })[0].data;
        // chkObj.render = function (data2, type, row, meta) { return renderCheckBoxCol($('#' + tableId).DataTable(), idpos, tableId, row, meta); };
        chkObj.render = this.renderCheckBoxCol.bind(this);
        tx.unshift(chkObj);
        // }

        //if (!tx.hideSerial)
        tx.unshift(JSON.parse('{"width":10, "searchable": false, "orderable": false, "visible":true, "name":"serial", "title":"#", "type":"System.Int32"}'));
    };

    this.renderCheckBoxCol = function (data2, type, row, meta) {
        var idpos = $.grep(this.TVPrefObj.columns, function (e) { return e.name === "id"; })[0].data;
        this.rowId = meta.row; //do not remove - for updateAlSlct
        return "<input type='checkbox' class='" + this.tableId + "_select' name='" + this.tableId + "_id' value='" + row[idpos].toString() + "'/>";
    };

    this.deleteRow = function (e) {
        var idx = this.settings_tbl.row($(e.target).parent().parent()).index();
        var deletedRow = $.extend(true, {}, this.settings_tbl.row(idx).data());
        this.deleted_colname = deletedRow.name;
        if (this.TVPrefObj.columnsdel == undefined || this.TVPrefObj.columnsdel == null) {
            this.columnsdel.push(deletedRow);
            this.TVPrefObj.columnsdel = this.columnsdel;
        }
        else
            this.TVPrefObj.columnsdel.push(deletedRow);
        this.settings_tbl.rows(idx).remove().draw();
        this.TVPrefObj.columns = $.grep(this.TVPrefObj.columns, function (obj) { return obj.name !== this.deleted_colname; }.bind(this));
        var del_obj = $.grep(this.TVPrefObj.columnsext, function (obj) { return obj.name === this.deleted_colname; }.bind(this));
        if (this.TVPrefObj.columnsextdel == undefined || this.TVPrefObj.columnsextdel == null) {
            this.columnsextdel.push(del_obj[0]);
            this.TVPrefObj.columnsextdel = this.columnsextdel;
        }
        else
            this.TVPrefObj.columnsextdel.push(del_obj[0]);
        this.TVPrefObj.columnsext = $.grep(this.TVPrefObj.columnsext, function (obj) { return obj.name !== this.deleted_colname; }.bind(this));

        var liId = "li_" + deletedRow.name;
        $("#columnDropdown ul").append($("<li id=" + liId + "><a data-data=\"" + JSON.stringify(deletedRow).replace(/\"/g, "'") + "\" data-colext=\"" + JSON.stringify(this.TVPrefObj.columnsextdel[this.TVPrefObj.columnsextdel.length - 1]).replace(/\"/g, "'") + "\" href='#'>" + deletedRow.name + "</a></li>"));

    };

    this.clickDropdownfunc = function (e) {
        this.dropdown_colname = $(e.target).text();
        var col = JSON.parse($(e.target).attr("data-data").replace(/\'/g, "\""));
        this.settings_tbl.row.add(col).draw();
        var colext = JSON.parse($(e.target).attr("data-colext").replace(/\'/g, "\""));
        this.TVPrefObj.columnsext.push(colext);
        this.TVPrefObj.columnsdel = $.grep(this.TVPrefObj.columnsdel, function (obj) { return obj.name !== this.dropdown_colname; }.bind(this));
        this.TVPrefObj.columnsextdel = $.grep(this.TVPrefObj.columnsextdel, function (obj) { return obj.name !== this.dropdown_colname; }.bind(this));
        $.each(this.settings_tbl.$('input[name=font]'), function (i, obj) {
            if ($(obj).siblings().size() === 0) {
                $(obj).fontselect();
            }
        });
        $("#columnDropdown ul #" + $(e.target).parent().attr("id")).remove();
    };

    this.getcolumn4dropdown = function () {
        if (this.TVPrefObj.columnsdel !== undefined && this.TVPrefObj.columnsdel !== null) {
            this.TVPrefObj.columnsdel = this.TVPrefObj.columnsdel.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            this.TVPrefObj.columnsextdel = this.TVPrefObj.columnsextdel.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            $.each(this.TVPrefObj.columnsdel, this.addColsandColsext2dropdown.bind(this));
        }

    };

    this.addColsandColsext2dropdown = function (i, obj) {
        var liId = "li_" + obj.name;
        $("#columnDropdown ul").append("<li id=" + liId + "><a data-data=\"" + JSON.stringify(obj).replace(/\"/g, "'") + "\" data-colext=\"" + JSON.stringify(this.TVPrefObj.columnsextdel[i]).replace(/\"/g, "'") + "\" href='#'>" + obj.name + "</a></li>");
    };

    this.setDropdownGraphType = function (e) {
        $("#graphtypeDD .btn:first-child").html($(e.target).text() + "&nbsp;<span class = 'caret'></span>");
        $("#graphtypeDD .btn:first-child").val($(e.target).text());
    };

    this.graphSettings = function (e) {
        if (Object.keys(this.TVPrefObj).length > 0) {
            if ($(e.target).attr("value") !== "table") {
                $(".nav-link").eq(2).show();
                
            }
            else {
                $(".nav-link").eq(2).hide();
            }
        }
    };


    
    this.graphTabEvent = function () {
        if (this.ddClicked) {
            $("#list_allcolumns").empty();
            $("#list_Xcolumns").empty();
            $("#list_Ycolumns").empty();
            this.ddClicked = false;
        }
        if (this.TVPrefObj.options !== null && this.TVPrefObj.options !== undefined) {
            var colsX = [], colsAll_X = [];
            $.each(this.TVPrefObj.options.Xaxis, function (i, obj) {
                colsX.push(obj.name);
            });
            $.each(this.TVPrefObj.columns, function (i, obj) {
                if (!colsX.contains(obj.name))
                    colsAll_X.push(obj);
            });
            var colsY = [], colsAll_XY = [];
            $.each(this.TVPrefObj.options.Yaxis, function (i, obj) {
                colsY.push(obj.name);
            });
            $.each(colsAll_X, function (i, obj) {
                if (!colsY.contains(obj.name))
                    colsAll_XY.push(obj);
            });
            //cols = $.grep(this.TVPrefObj.columns, function (i, obj) { return obj.name !== this.TVPrefObj.options.Xaxis.name; });
            //cols = $.grep(cols, function (i, obj) { return obj.name !== this.TVPrefObj.options.Yaxis.name; });
            $.each(colsAll_XY, function (i, obj) {
                if (obj.data != undefined) {
                    $("#list_allcolumns").append("<li class='list-group-item' data-id='" + obj.data + "'>" + obj.name + "</li>");
                }
            });
            $.each(this.TVPrefObj.options.Xaxis, function (i, obj) {
                $("#list_Xcolumns").append("<li class='list-group-item' data-id='" + obj.index + "'>" + obj.name + "&nbsp;&nbsp;<button class='close' type='button' style='font-size: 20px;margin: -2px 0 0 10px;' >x</button></li>");
            });
            $.each(this.TVPrefObj.options.Yaxis, function (i, obj) {
                $("#list_Ycolumns").append("<li class='list-group-item' data-id='" + obj.index + "'>" + obj.name + "&nbsp;&nbsp;<button class='close' type='button' style='font-size: 20px;margin: -2px 0 0 10px;' >x</button></li>");
            });
            $("#list_Xcolumns button[class=close]").off("click").on("click", this.RemoveLi.bind(this));
            $("#list_Ycolumns button[class=close]").off("click").on("click", this.RemoveLi.bind(this));
        }
        else {
            $.each(this.TVPrefObj.columns, function (i, obj) {
                if (obj.data != undefined) {
                    $("#list_allcolumns").append("<li class='list-group-item' data-id='" + obj.data + "'>" + obj.name + "</li>");
                }
            });
        }
        $(".list-group-item").off("click").on("click", this.AddCsstoLi.bind(this));
    };


    $('a[href="#3a"]').on('shown.bs.tab', this.graphTabEvent.bind(this));

    this.AddCsstoLi = function (e) {
        if ($(e.target).hasClass("active"))
            $(e.target).removeClass("active");
        else {
            if ($("#list_allcolumns li").hasClass("active")) {
                $("#list_allcolumns li.active").removeClass("active");
                $(e.target).addClass("active");
            }
            else
                $(e.target).addClass("active");
        }
    };

    this.Moveto_X_List = function (e) {
        if ($("#list_allcolumns li").hasClass("active")) {
                var element = $("#list_allcolumns li.active");
                $("#list_Xcolumns").append("<li class='list-group-item' data-id='" + element.attr("data-id") + "'>" + element.text() + "&nbsp;&nbsp;<button class='close' type='button' style='font-size: 20px;margin: -2px 0 0 10px;' >x</button></li>");
                element.remove();
                this.XLength++;
        }
        $("#list_Xcolumns button[class=close]").off("click").on("click", this.RemoveLi.bind(this));
    };

    this.Moveto_Y_List = function (e) {
        if ($("#list_allcolumns li").hasClass("active")) {
                var element = $("#list_allcolumns li.active");
                $("#list_Ycolumns").append("<li class='list-group-item' data-id='" + element.attr("data-id") + "'>" + element.text() + "&nbsp;&nbsp;<button class='close' type='button' style='font-size: 20px;margin: -2px 0 0 10px;' >x</button></li>");
                element.remove();
                this.YLength++;
        }
        $("#list_Ycolumns button[class=close]").off("click").on("click", this.RemoveLi.bind(this));
    };

    this.RemoveLi = function (e) {
        var str = $(e.target).parent().text();
        alert(str.substring(0,str.length-1).trim());
        $("#list_allcolumns").append("<li class='list-group-item' data-id='" + $(e.target).parent().attr("data-id") + "'>" + str.substring(0, str.length - 1).trim() + "</li>");
        $(e.target).parent().remove();
        $(".list-group-item").off("click").on("click", this.AddCsstoLi.bind(this));
    };
    
    this.init();
};



