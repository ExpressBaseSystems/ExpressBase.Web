
var coldef4Setting = function (d, t, cls, rnd, wid) {
    this.data = d;
    this.title = t;
    this.className = cls;
    this.render = rnd;
    this.width = wid;
};

var DVObj = function (dsid, settings, login) {
    this.TVPrefObj = settings;
    this.dsid = dsid;
    this.settings_tbl = null;
    this.columnsdel = [];
    this.columnsextdel = [];

    this.init = function () {
        if (Object.keys(this.TVPrefObj).length > 0) {
            $("#dvName_txt").val(this.TVPrefObj.dvName);
            $("#serial_check").prop("checked", this.TVPrefObj.hideSerial);
            $("#select_check").prop("checked", this.TVPrefObj.hideCheckbox);
            $("#pageLength_text").val(this.TVPrefObj.lengthMenu[0][0]);
            $("#scrollY_text").val(this.TVPrefObj.scrollY);
            $("#rowGrouping_text").val(this.TVPrefObj.rowGrouping);
            $("#leftFixedColumns_text").val(this.TVPrefObj.leftFixedColumns);
            $("#rightFixedColumns_text").val(this.TVPrefObj.rightFixedColumns);
            this.callPost4SettingsTable();
            this.getcolumn4dropdown();
        }
        $(".dropdown-menu li a").off("click").on("click", this.setDropdownDatasource.bind(this));
        $("#Save_btn").off("click").on("click", this.saveSettings.bind(this));
        $(".eb_delete_btn").off("click").on("click", this.deleteRow.bind(this));
        $('#columnDropdown .dropdown-menu a').off("click").on("click", this.clickDropdownfunc.bind(this));
    };

    this.setDropdownDatasource = function (e) {
        $("#loader").show();
        this.dsid = $(e.target).parent().attr("data-dsid");
        alert("dsid" +this.dsid);
        $("#datatSourceDropdown .btn:first-child").text($(e.target).text());
        $("#datatSourceDropdown .btn:first-child").val($(e.target).text());
        $.post('../Tenant/GetColumns', { dsid: this.dsid },this.getColumnsSuccess.bind(this));
        
    };

    this.getColumnsSuccess = function (data) {
        $("#loader").hide();
        alert("hhhh----");
        this.TVPrefObj = JSON.parse(data);
        alert(JSON.stringify(this.TVPrefObj));
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
        CreatePropGrid(this.settings_tbl.row(0).data(), this.TVPrefObj.columnsext);
        $('#Table_Settings tbody').on('click', 'tr', this.showPropertyGrid.bind(this));
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
            if (col.name !== "serial" && col.name !== "id" && col.name !== "checkbox") {
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
        if (data.length > 8 ) {
            var fontName = data.replace("tdheight", " ");
            fontName = fontName.substring(5).replace(/_/g, " ");
            index = fontName.lastIndexOf(" ");
            fontName = fontName.substring(0, index);
                return "<input type='text' value=" + fontName + " class='font' style='width: 100px;' name='font' >";
        }
        else
            return "<input type='text' class='font' style='width: 100px;' name='font'>";
    };

    this.initComplete4Settingstbl = function (settings, json) {
        $('#Table_Settings').DataTable().columns.adjust();
        $('.font').fontselect();
        $("#loader").hide();
        //this.addEventListner4Settingstbl();
    };

    this.showPropertyGrid = function (e) {
        var idx = this.settings_tbl.row(e.target).index();
        CreatePropGrid(this.settings_tbl.row(idx).data(), this.TVPrefObj.columnsext);
        this.settings_tbl.columns.adjust();
    };

    this.saveSettings = function (e) {
        $("#loader").show();
        var objId= $(e.target).attr("data-objId");
        this.isSettingsSaved = true;
        var ct = 0; var objcols = [];
        var api = $('#Table_Settings').DataTable();
        var n, d, t, v, w, ty, cls;
        objcols.push(this.getColobj("id"));
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
                    cls = 'font_' + replacedName + ' tdheight';
                }
                else
                    cls = 'tdheight';
            }
            
            if (ct === api.columns().count() - 2) { ct = 0; objcols.push(new coldef(d, t, v, w, n, ty, cls)); n = ''; d = ''; t = ''; v = ''; w = ''; ty = ''; cls = ''; }
        });
        this.TVPrefObj.hideSerial = $("#serial_check").prop("checked");
        this.TVPrefObj.hideCheckbox = $("#select_check").prop("checked");
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
        $.post('../Tenant/SaveSettings', { dsid: this.dsid, json: JSON.stringify(this.TVPrefObj), dvid: objId }, this.saveSuccess.bind(this));
        
    };

    this.saveSuccess = function () {
        $(".alert").show();
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
        if (!tx.hideCheckbox) {
            var chkObj = new Object();
            chkObj.data = null;
            chkObj.title = "<input id='{0}_select-all' type='checkbox' class='eb_selall' data-table='{0}'/>".replace("{0}", this.tableId);
            chkObj.width = 10;
            chkObj.orderable = false;
            chkObj.visible = true;
            chkObj.name = "checkbox";
            var idpos = $.grep(tx, function (e) { return e.name === "id"; })[0].data;
            // chkObj.render = function (data2, type, row, meta) { return renderCheckBoxCol($('#' + tableId).DataTable(), idpos, tableId, row, meta); };
            chkObj.render = this.renderCheckBoxCol.bind(this);
            tx.unshift(chkObj);
        }

        if (!tx.hideSerial)
            tx.unshift(JSON.parse('{"width":10, "searchable": false, "orderable": false, "visible":true, "name":"serial", "title":"#"}'));
    };

    this.renderCheckBoxCol = function (data2, type, row, meta) {
        var idpos = $.grep(this.TVPrefObj.columns, function (e) { return e.name === "id"; })[0].data;
        this.rowId = meta.row; //do not remove - for updateAlSlct
        return "<input type='checkbox' class='" + this.tableId + "_select' name='" + this.tableId + "_id' value='" + row[idpos].toString() + "'/>";
    };

    this.deleteRow = function (e) {
        alert(JSON.stringify(this.TVPrefObj.columnsdel));
        alert(JSON.stringify(this.TVPrefObj.columnsextdel));
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
        
        alert(JSON.stringify(this.TVPrefObj.columnsdel));
        alert(JSON.stringify(this.TVPrefObj.columnsextdel));
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
            $.each(this.TVPrefObj.columnsdel, this.adddelColsandColsext2dropdown.bind(this));
        }

    };

    this.adddelColsandColsext2dropdown = function (i, obj) {
        var liId = "li_" + obj.name;
        $("#columnDropdown ul").append("<li id=" + liId + "><a data-data=\"" + JSON.stringify(obj).replace(/\"/g, "'") + "\" data-colext=\"" + JSON.stringify(this.TVPrefObj.columnsextdel[i]).replace(/\"/g, "'") + "\" href='#'>" + obj.name + "</a></li>");
    };

    this.init();

    
};



