﻿const EbTableVisualization = function EbTableVisualization(id, jsonObj) {
    this.$type = 'ExpressBase.Objects.EbTableVisualization, ExpressBase.Objects';
    this.EbSid = id;
    this.ObjType = 'TableVisualization';
    this.rowGrouping = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.Objects.DVRelated.DVBaseColumn, ExpressBase.Objects]], System.Private.CoreLib", "$values": [] }; this.LeftFixedColumn = 0; this.RightFixedColumn = 0; this.PageLength = 0; this.DataSourceRefId = ''; this.Description = ''; this.Columns = { "$type": "ExpressBase.Objects.Objects.DVRelated.DVColumnCollection, ExpressBase.Objects", "$values": [] }; this.DSColumns = { "$type": "ExpressBase.Objects.Objects.DVRelated.DVColumnCollection, ExpressBase.Objects", "$values": [] }; this.data = { "$type": "System.Object, System.Private.CoreLib" }; this.Pippedfrom = ''; this.IsPaged = ''; this.IsPaging = false; this.Name = id;


    this.$Control = $("            <div id='cont_@name@' Ctype='TableVisualization' class='Eb-ctrlContainer'>                <table style='width:100%' class='table table-striped' eb-type='Table' id='@name@'></table>            </div>".replace(/@id/g, this.EbSid));
    this.BareControlHtml = `<table style='width:100%' class='table table-striped' eb-type='Table' id='@name@'></table>`.replace(/@id/g, this.EbSid);
    this.DesignHtml = "            <div id='cont_@name@' Ctype='TableVisualization' class='Eb-ctrlContainer'>                <table style='width:100%' class='table table-striped' eb-type='Table' id='@name@'></table>            </div>";
    let MyName = this.constructor.name;
    this.RenderMe = function () {
        let NewHtml = this.$BareControl.outerHTML(), me = this, metas = AllMetas[MyName];
        $.each(metas, function (i, meta) {
            let name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', me[name]);
            }
        });
        if (!this.IsContainer)
            $('#' + id).html($(NewHtml).html());
    };
    if (jsonObj) {
        if (jsonObj.IsContainer)
            jsonObj.Controls = new EbControlCollection({});
        jsonObj.RenderMe = this.RenderMe;
        jsonObj.Html = this.Html;
        jsonObj.Init = this.Init;
        $.extend(this, jsonObj);
        //if(this.Init)
        //    jsonObj.Init(id);
    }
    else {
        if (this.Init)
            this.Init(id);
    }
};

//let EbSelect = function (name, ds_id, dropdownHeight, vmName, dmNames, maxLimit, minLimit, required, servicestack_url, vmValues, ctrl) {
const EbSelect = function (ctrl, options) {
    //parameters   
    this.getFilterValuesFn = options.getFilterValuesFn;
    this.ComboObj = ctrl;
    this.ComboObj.initializer = this;
    this.name = ctrl.EbSid_CtxId;
    this.dsid = ctrl.DataSourceId;
    this.idField = "name";
    if (!(Object.keys(ctrl.ValueMember).includes("name")))//////////////////
        this.idField = "columnName";////////////////////////
    this.vmName = ctrl.ValueMember[this.idField]; //ctrl.vmName;

    this.dmNames = ctrl.DisplayMembers.$values.map(function (obj) { return obj[this.idField]; }.bind(this));//['acmaster1_xid', 'acmaster1_name', 'tdebit']; //ctrl.dmNames;
    this.ColNames = ctrl.Columns.$values.map(function (obj) { return obj[this.idField]; }.bind(this));//['acmaster1_xid', 'acmaster1_name', 'tdebit']; //ctrl.dmNames;

    this.maxLimit = (ctrl.MaxLimit === 0) ? 9999999999999999999999 : ctrl.MaxLimit;
    this.minLimit = ctrl.MinLimit;//ctrl.minLimit;
    this.ComboObj.MultiSelect = (ctrl.MaxLimit !== 1);
    this.required = ctrl.Required;//ctrl.required;
    this.servicestack_url = "";//ctrl.servicestack_url;
    //this.vmValues = (ctrl.vmValues !== null) ? ctrl.vmValues : [];
    this.dropdownHeight = (ctrl.DropdownHeight === 0) ? "400" : ctrl.DropdownHeight;


    //local variables
    this.container = this.name + "Container";
    this.DTSelector = '#' + this.name + 'tbl';
    this.NoOfFields = this.dmNames.length;
    this.Vobj = null;
    this.datatable = null;
    this.clmAdjst = 0;


    ctrl._DisplayMembers = [];
    ctrl._ValueMembers = [];
    this.valueMembers = ctrl._ValueMembers;
    this.localDMS = ctrl._DisplayMembers;
    this.columnVals = {};
    $.each(this.ColNames, function (i, name) { this.columnVals[name] = []; }.bind(this));

    this.$curEventTarget = null;
    this.IsDatatableInit = false;
    this.IsSearchBoxFocused = false;

    $.each(this.dmNames, function (i, name) { this.localDMS[name] = [] }.bind(this));

    this.VMindex = null;
    this.DMindexes = [];
    this.cellTr = null;
    this.Msearch_colName = '';
    this.cols = [];
    this.filterArray = [];
    // functions

    //init() for event binding....
    this.init = function () {
        try {
            $('#' + this.name + 'Wraper [class=open-indicator]').hide();
            this.$searchBoxes = $('#' + this.name + 'Wraper [type=search]').on("click", function () { $(this).focus(); });
            this.$searchBoxes.keyup(this.searchboxKeyup);
            this.$inp = $("#" + this.ComboObj.EbSid_CtxId);
            $(document).mouseup(this.hideDDclickOutside.bind(this));//hide DD when click outside select or DD &  required ( if  not reach minLimit) 
            $('#' + this.name + 'Wraper .ps-srch').off("click").on("click", this.toggleIndicatorBtn.bind(this)); //search button toggle DD
            $('#' + this.name + 'tbl').keydown(function (e) { if (e.which === 27) this.Vobj.hideDD(); }.bind(this));//hide DD on esc when focused in DD
            $('#' + this.name + 'Wraper').on('click', '[class= close]', this.tagCloseBtnHand.bind(this));//remove ids when tagclose button clicked
            this.$searchBoxes.keydown(this.SearchBoxEveHandler.bind(this));//enter-DDenabling & if'' showall, esc arrow space key based DD enabling , backspace del-valueMember updating
            this.$searchBoxes.dblclick(this.V_showDD.bind(this));//serch box double click -DDenabling
            this.$searchBoxes.keyup(debounce(this.delayedSearchFN.bind(this), 300)); //delayed search on combo searchbox
            this.$searchBoxes.on("focus", this.searchBoxFocus); // onfocus  searchbox

            //set id for searchBox
            $('#' + this.name + 'Wraper  [type=search]').each(this.srchBoxIdSetter.bind(this));


            if (!this.ComboObj.MultiSelect)
                $('#' + this.name + 'Wraper').attr("singleselect", "true");


            //styles
            $('#' + this.name + 0).children().css("border-top-left-radius", "5px");
            $('#' + this.name + 0).children().css("border-bottom-left-radius", "5px");
            this.ComboObj.getColumn = this.getColumn;
        }
        catch (err) {
            console.error(err.message);
        }
    };

    this.searchboxKeyup = function (e) {
        let $e = $(event.target);
        if (this.valueMembers.length === 0)
            $e.css("width", "100%");
        else {
            let count = $e.val().length;
            $e.css("width", (count * 7.2 + 12) + "px");
        }
    }.bind(this);

    this.getColumn = function (colName) { return this.columnVals[colName]; }.bind(this);

    this.searchBoxFocus = function () {
        this.IsSearchBoxFocused = true;
        this.RemoveRowFocusStyle();
    }.bind(this);

    //delayed search on combo searchbox
    this.delayedSearchFN = function (e) {
        let $e = $(e.target);
        let searchVal = $e.val();
        let MaxSearchVal = this.getMaxLenVal();

        if (!isPrintable(e) && e.which !== 8)
            return;

        if (this.ComboObj.MinSeachLength > MaxSearchVal.length) {
            EbMakeInvalid(`#${_name}Container`, `#${_name}Wraper`, `Enter minimum ${this.ComboObj.MinSeachLength} character(s) to search`);
            return;
        }
        else {
            EbMakeValid(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`);
        }

        let mapedField = $e.closest(".searchable").attr("maped-column");
        let mapedFieldType = this.getTypeForDT($e.closest(".searchable").attr("column-type"));
        let $filterInp = $(`#${this.name}tbl_${mapedField}_hdr_txt1`);
        let searchBy = " = ";
        if (mapedFieldType === "string")
            searchBy = "x*";
        if (!this.IsDatatableInit) {
            if (this.ComboObj.MinSeachLength > searchVal.length)
                return;
            let filterObj = new filter_obj(mapedField, searchBy, searchVal, mapedFieldType);
            this.filterArray.push(filterObj);
            this.InitDT();
            this.V_showDD();
        }
        else {
            $filterInp.val($e.val());
            this.Vobj.DDstate = true;
            EbMakeValid(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`);
            if (searchVal.trim() === "" || this.ComboObj.MinSeachLength > searchVal.length)
                return;
            this.datatable.columnSearch = [];
            this.datatable.columnSearch.push(new filter_obj(mapedField, searchBy, searchVal, mapedFieldType));
            this.datatable.Api.ajax.reload();
        }
    };

    this.setValues = function (StrValues, callBFn) {
        this.clearValues();
        this.setvaluesColl = (StrValues + "").split(",");// cast

        if (this.datatable) {
            this.datatable.columnSearch = [];
            //$.each(this.setvaluesColl, function (i, val) {
            this.datatable.columnSearch.push(new filter_obj(this.ComboObj.ValueMember.name, "=", this.setvaluesColl.join("|"), this.ComboObj.ValueMember.Type));
            //}.bind(this));
            this.datatable.Api.ajax.reload(this.initComplete4SetVal.bind(this, callBFn, StrValues));
        }
        else {
            this.filterArray = [];
            //$.each(this.setvaluesColl, function (i, val) {
            this.filterArray.push(new filter_obj(this.ComboObj.ValueMember.name, "=", this.setvaluesColl.join("|"), this.ComboObj.ValueMember.Type));
            //}.bind(this));
            if (this.setvaluesColl.length > 0) {
                this.fninitComplete4SetVal = this.initComplete4SetVal.bind(this, callBFn, StrValues);
                this.InitDT();
                this.V_showDD();
            }
        }

    }.bind(this);

    this.getValues = function () {

    };

    this.clearValues = function () {
        $.each(this.Vobj.valueMembers, function (i, val) {
            if (val.trim() !== "")// prevent Jq selector error
                $(this.DTSelector + ` [type=checkbox][value=${val}]`).prop("checked", false);
        }.bind(this));
        this.Vobj.valueMembers.splice(0, this.Vobj.valueMembers.length);// clears array without modifying array Object (watch)
        $.each(this.dmNames, this.popAllDmValues.bind(this));
        $.each(this.ColNames, function (i, name) { this.columnVals[name] = []; }.bind(this));

    }.bind(this);

    this.initComplete4SetVal = function (callBFn, StrValues) {
        if (this.setvaluesColl) {
            if (this.ComboObj.MultiSelect) {
                $.each(this.setvaluesColl, function (i, val) {
                    let $row = $(this.DTSelector + ` [type=checkbox][value=${parseInt(val)}]`);
                    if ($row.length === 0) {
                        console.eb_warn(`>> eb message : none available value '${val}' set for  powerSelect '${this.ComboObj.Name}'`, "rgb(222, 112, 0)");
                        this.$inp.val(StrValues).trigger("change");
                    }
                    else
                        $row.click();
                }.bind(this));
            }
            else {
                let $row = $(this.DTSelector + ` tbody tr[role="row"]`);
                if ($row.length === 0) {//
                    console.log(`>> eb message : none available value '${StrValues}' set for  powerSelect '${this.ComboObj.Name}'`);
                    this.$inp.val(StrValues).trigger("change");
                }
                else
                    $row.trigger("dblclick");
            }
        }
        if (callBFn)
            callBFn();
    };



    this.popAllDmValues = function (i) {
        this.Vobj.displayMembers[this.dmNames[i]].splice(0, this.Vobj.displayMembers[this.dmNames[i]].length); //// clears array without modifying array Object (watch)
    };


    this.getTypeForDT = function (type) {
        type = parseInt(type);
        let res = "";
        if (type === 16)
            res = "string";
        else if ([7, 8, 9, 10, 11, 12, 21].contains(type))
            res = "number";
        else if (type === 3)
            res = "boolean";
        else if ([5, 6, 17, 26].contains(type))
            res = "date";

        return res;
    };

    this.srchBoxIdSetter = function (i) {
        $('#' + this.name + 'Wraper  [type=search]:eq(' + i + ')').attr('id', this.dmNames[i]);
    };

    //enter-DDenabling & if'' showall, esc arrow space key based DD enabling , backspace del-valueMember updating
    this.SearchBoxEveHandler = function (e) {
        let $e = $(e.target);
        let search = $e.val().toString();
        if (e.which === 13)
            this.Vobj.showDD();
        if ((e.which === 8 || e.which === 46) && search === '' && this.Vobj.valueMembers.length > 0) {
            this.Vobj.valueMembers.pop();
            $.each(this.dmNames, this.popDmValues.bind(this));
        }
        if (e.which === 40)
            this.Vobj.showDD();
        if (e.which === 32) {
            if (this.Vobj.DDstate)
                return;
            this.Vobj.showDD();
        }
        if (e.which === 27)
            this.Vobj.hideDD();
    };

    this.popDmValues = function (i) {
        this.Vobj.displayMembers[this.dmNames[i]].pop(); //= this.Vobj.displayMembers[this.dmNames[i]].splice(0, this.maxLimit);
    };

    // init datatable
    this.InitDT = function () {
        let searchVal = this.getMaxLenVal();
        let _name = this.ComboObj.EbSid_CtxId;
        if (this.ComboObj.MinSeachLength > searchVal.length) {
            //alert(`enter minimum ${this.ComboObj.MinSeachLength} charecter in searchBox`);
            EbMakeInvalid(`#${_name}Container`, `#${_name}Wraper`, `Enter minimum ${this.ComboObj.MinSeachLength} character(s) to search`);
            return;
        }

        this.IsDatatableInit = true;
        //this.EbObject = new EbObjects["EbTableVisualization"]("Container");
        //this.EbObject.DataSourceRefId = this.dsid;
        let o = new Object();
        o.containerId = this.name + "DDdiv";
        o.dsid = this.dsid;
        o.tableId = this.name + "tbl";
        o.showSerialColumn = false;
        o.showCheckboxColumn = this.ComboObj.MultiSelect;
        o.showFilterRow = true;
        o.scrollHeight = this.ComboObj.DropdownHeight === 0 ? "500px" : this.ComboObj.DropdownHeight + "px";
        o.fnDblclickCallback = this.dblClickOnOptDDEventHand.bind(this);
        //o.fnKeyUpCallback = this.xxx.bind(this);
        o.arrowFocusCallback = this.arrowSelectionStylingFcs;
        o.arrowBlurCallback = this.arrowSelectionStylingBlr;
        o.fninitComplete = this.initDTpost.bind(this);
        o.columnSearch = this.filterArray;
        o.headerDisplay = (this.ComboObj.Columns.$values.filter((obj) => obj.bVisible === true && obj.name !== "id").length === 1) ? false : true;// (this.ComboObj.Columns.$values.length > 2) ? true : false;
        o.dom = "rt";
        o.source = "powerselect";
        o.keys = true;
        //o.hiddenFieldName = this.vmName;
        o.keyPressCallbackFn = this.DDKeyPress.bind(this);
        o.columns = this.ComboObj.Columns;//////////////////////////////////////////////////////
        if (options)
            o.wc = options.wc;
        o.getFilterValuesFn = this.getFilterValuesFn;
        o.fninitComplete4SetVal = this.fninitComplete4SetVal;
        this.datatable = new EbBasicDataTable(o);
        //this.datatable.Api.on('key-focus', this.arrowSelectionStylingFcs);
        //this.datatable.Api.on('key-blur', this.arrowSelectionStylingBlr);
        //$.ajax({
        //    type: "POST",
        //    url: "../DS/GetColumns",
        //    data: { DataSourceRefId: this.dsid },
        //    success: function (Columns) {
        //        this.DTColumns = JSON.parse(Columns).$values;
        //        //$.LoadingOverlay('hide');
        //    }.bind(this)
        //});
        //this.datatable = $(this.DTSelector).DataTable({//change ebsid to name
        //    processing: true,
        //    serverSide: true,
        //    dom: 'rt',
        //    columns: this.DTColumns,
        //    ajax: {
        //        url: "../dv/getData",
        //        type: 'POST',
        //        data: function (dq) {
        //            delete dq.columns; delete dq.order; delete dq.search;
        //            dq.RefId = this.dsid;
        //            dq.Params = { Name: "id", Value: "ac", Type: "11" };
        //        }.bind(this),
        //        dataSrc: function (dd) {
        //            return dd.data;
        //        },
        //    },
        //    initComplete: function () {
        //        this.hideTypingAnim();
        //        this.AskWhatU();
        //        $tableCont.show(100);
        //    }.bind(this)

        //});
        //settings: {
        //    hideCheckbox: (this.ComboObj.MultiSelect === false) ? true : false,
        //    scrollY: "200px",//this.dropdownHeight,
        //},
        //filterParams: { colName: "id", FilterValue: "ac" }, //{ id : "ac", }
        //initComplete: this.initDTpost.bind(this),
        //fnDblclickCallbackFunc: this.dblClickOnOptDDEventHand.bind(this),
        //fnKeyUpCallback:
        //fnClickCallbackFunc:
        //});
    };


    //this.xxx = function (e, dt, type, indexes) {
    //    console.log("keysssss");
    //};

    this.DDKeyPress = function (e, datatable, key, cell, originalEvent) {
        if (key === 13)
            this.DDEnterKeyPress(e, datatable, key, cell, originalEvent);
        else if (key === 32) {
            originalEvent.preventDefault();
            if (originalEvent.target.type !== "checkbox")
                this.DDSpaceKeyPress(e, datatable, key, cell, originalEvent);
        }
    };

    this.DDSpaceKeyPress = function (e, datatable, key, cell, originalEvent) {
        let row = datatable.row(cell.index().row);
        let $tr = $(row.nodes());
        $tr.dblclick();
    };

    this.DDEnterKeyPress = function (e, datatable, key, cell, originalEvent) {
        let row = datatable.row(cell.index().row);
        let $tr = $(row.nodes());
        //let idx = this.datatable.ebSettings.Columns.$values.indexOf(getObjByval(this.datatable.ebSettings.Columns.$values, "name", this.vmName));
        let idx = $.grep(this.datatable.ebSettings.Columns.$values, function (obj) { return obj.name === this.vmName; }.bind(this))[0].data;
        let vmValue = this.datatable.Api.row($tr.index()).data()[idx];
        this.$curEventTarget = $tr;
        this.SelectRow(idx, vmValue);
        this.Vobj.hideDD();
    };

    this.initDTpost = function (data) {
        $.each(this.datatable.Api.settings().init().columns, this.dataColumIterFn.bind(this));
        $(this.DTSelector + ' tbody').on('click', "input[type='checkbox']", this.checkBxClickEventHand.bind(this));//checkbox click event 
        this.datatable.Api.cell($(this.DTSelector + ' tbody tr:eq(0) td:eq(0)')).focus();
    };

    this.dataColumIterFn = function (i, value) {
        if (value.name === this.vmName)
            this.VMindex = value.data;
        $.each(this.dmNames, function (j, dmName) { if (value.name === dmName) { this.DMindexes.push(value.data); } }.bind(this));
    };

    this.SelectRow = function (idx, vmValue) {
        if (!this.Vobj.valueMembers.contains(vmValue)) {
            if (this.maxLimit === 1) {
                this.Vobj.valueMembers = [vmValue];
                this.Vobj.hideDD();
                $.each(this.dmNames, this.setDmValues.bind(this));
            }
            else if (this.Vobj.valueMembers.length !== this.maxLimit) {
                this.Vobj.valueMembers.push(vmValue);
                $.each(this.dmNames, this.setDmValues.bind(this));
                $(this.DTSelector + " tr.selected").find('[type=checkbox]').prop('checked', true);
            }
        }
    };

    this.setColumnvals = function () {
        if (!this.$curEventTarget)
            return;
        let vmValue = this.datatable.Api.row(this.$curEventTarget.closest("tr")).data()[getObjByval(this.datatable.ebSettings.Columns.$values, "name", this.vmName).data];
        if (event.target.nodeName === "SPAN")
            vmValue = this.ClosedItem;

        if (!this.columnVals[this.vmName].contains(vmValue)) {
            this.addColVals();
        }
        else {
            this.removeColVals(vmValue);
        }

    };

    this.addColVals = function () {
        $.each(this.ColNames, function (i, name) {
            let cellData = this.datatable.Api.row(this.$curEventTarget.closest("tr")).data()[getObjByval(this.datatable.ebSettings.Columns.$values, "name", name).data];
            //if (this.maxLimit === 1)
            //    this.columnVals[name] = cellData;
            this.columnVals[name].push(cellData);
        }.bind(this));
    };

    this.removeColVals = function (vmValue) {
        let idx = this.columnVals[this.vmName].indexOf(vmValue);
        $.each(this.ColNames, function (i, name) {
            this.columnVals[name].splice(idx, 1);
        }.bind(this));
    };

    this.setDmValues = function (i, name) {
        let cellData = this.datatable.Api.row(this.$curEventTarget.closest("tr")).data()[getObjByval(this.datatable.ebSettings.Columns.$values, "name", name).data];
        if (this.maxLimit === 1)
            this.localDMS[name].shift();
        this.localDMS[name].push(cellData);
    };

    //double click on option in DD
    this.dblClickOnOptDDEventHand = function (e) {
        this.$curEventTarget = $(e.target);
        //let idx = this.datatable.ebSettings.Columns.$values[getObjByval(this.datatable.ebSettings.Columns.$values, "name", this.vmName).data];
        let idx = $.grep(this.datatable.ebSettings.Columns.$values, function (obj) { return obj.name === this.vmName; }.bind(this))[0].data;
        let vmValue = this.datatable.Api.row($(e.target).closest("tr")).data()[idx];
        if (!(this.Vobj.valueMembers.contains(vmValue))) {
            this.SelectRow(idx, vmValue);
        }
        else {
            this.delDMs($(e.target));
            $(e.target).closest("tr").find("." + this.name + "tbl_select").prop('checked', false);
        }
    };

    //this.ajaxDataSrcfn = function (dd) {
    //    $('#' + this.name + '_loadingdiv').hide();
    //    this.clmAdjst = this.clmAdjst + 1;
    //    if (this.clmAdjst < 3)
    //        setTimeout(function () {
    //            $('#' + this.name + 'tbl').DataTable().columns.adjust().draw();
    //            console.log('le().columns.adjust()');
    //        }, 520);
    //    setTimeout(function () { this.Vobj.updateCk(); }.bind(this), 1);
    //    return dd.data;
    //};

    this.toggleIndicatorBtn = function (e) {
        this.Vobj.toggleDD();
    };

    this.getSelectedRow = function () {
        if (!this.IsDatatableInit)
            return;
        let res = [];
        $.each(this.ComboObj.TempValue, function (idx, item) {
            let obj = {};
            let rowData = this.datatable.getRowDataByUid(item);
            let temp = this.datatable.sortedColumns;
            let colNames = temp.map((obj, i) => { return obj.name; });
            $.grep(temp, function (obj, i) {
                return obj.name;
            });
            $.each(rowData, function (i, cellData) {
                obj[colNames[i]] = cellData;
            });
            res.push(obj);
        }.bind(this));
        this.ComboObj.SelectedRow = res;
        return res;
    }.bind(this);

    this.Renderselect = function () {
        this.Vobj = new Vue({
            el: '#' + this.name + 'Container',
            data: {
                options: [],
                displayMembers: this.localDMS,
                valueMembers: this.valueMembers,
                DDstate: false
            },
            watch: {
                valueMembers: this.V_watchVMembers.bind(this)
            },
            methods: {
                toggleDD: this.V_toggleDD.bind(this),
                showDD: this.V_showDD.bind(this),
                hideDD: this.V_hideDD.bind(this),
                updateCk: this.V_updateCk.bind(this)
            }
        });
        this.init();
    };

    //init Vselect
    this.initVselect = function () {
        //hiding v-select native DD
        $('#' + this.container + ' [class=expand]').css('display', 'none');
        this.Vobj.valueMembers = this.values;
        this.Vobj.displayMembers;
    };

    //single select & max limit
    this.V_watchVMembers = function (VMs) {
        this.ComboObj.TempValue = [...this.Vobj.valueMembers];
        //single select
        if (this.maxLimit === 1 && VMs.length > 1) {
            this.Vobj.valueMembers.shift();////
            $.each(this.dmNames, this.trimDmValues.bind(this));
        }
        //max limit
        else if (VMs.length > this.maxLimit) {
            this.Vobj.valueMembers = this.Vobj.valueMembers.splice(0, this.maxLimit);
            $.each(this.dmNames, this.trimDmValues.bind(this));
        }

        this.$inp.attr("display-members", this.Vobj.displayMembers[this.dmNames[0]]);
        this.getSelectedRow();

        if (VMs.length === 0)
            this.$searchBoxes.css("min-width", "100%");
        else
            this.$searchBoxes.css("min-width", "inherit");

        if (this.maxLimit === VMs.length)
            this.$searchBoxes.hide();
        else
            this.$searchBoxes.show();
        //setTimeout(function () {// to adjust search-block
        //    let maxHeight = Math.max.apply(null, $(".search-block .searchable").map(function () { return $(this).height(); }).get());
        //    $(".search-block .input-group").css("height", maxHeight + "px");
        //    $('#' + this.name + 'Wraper [type=search]').val("");
        //}.bind(this), 10);

        this.setColumnvals();
        this.$inp.val(this.Vobj.valueMembers).trigger("change");

        //console.log("VALUE MEMBERS =" + this.Vobj.valueMembers);
        //console.log("DISPLAY MEMBER 0 =" + this.Vobj.displayMembers[this.dmNames[0]]);
        //console.log("DISPLAY MEMBER 1 =" + this.Vobj.displayMembers[this.dmNames[1]]);
        //console.log("DISPLAY MEMBER 3 =" + this.Vobj.displayMembers[this.dmNames[3]]);
    };

    this.trimDmValues = function (i) {
        let DMs = this.Vobj.displayMembers[this.dmNames[i]];
        if (this.maxLimit === 1) {   //single select
            DMs.shift(); //= this.Vobj.displayMembers[this.dmNames[i]].splice(1, 1);
        }
        else {                        //max limit
            DMs.pop(); //= this.Vobj.displayMembers[this.dmNames[i]].splice(0, this.maxLimit);
        }
    };

    this.V_toggleDD = function (e) {
        if (!this.IsDatatableInit)
            this.InitDT();
        if (this.Vobj.DDstate)
            this.V_hideDD();
        else {
            searchVal = this.getMaxLenVal();
            //if (searchVal === "" || this.ComboObj.MinSeachLength > searchVal.length)
            //    return;
            //else
            this.V_showDD();
        }

        //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },500);
    };

    this.V_hideDD = function () {
        this.Vobj.DDstate = false;
        this.RemoveRowFocusStyle();
    };
    this.getMaxLenVal = function () {
        let val = "";
        $.each(this.$searchBoxes, function (i, el) {
            if ($(el).val().trim().length > val.length)
                val = $(el).val().trim();
        });
        return val;
    };

    this.V_showDD = function () {
        this.Vobj.DDstate = true;
        if (!this.IsDatatableInit)
            this.InitDT();
        else {
            EbMakeValid(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`);
            setTimeout(function () {
                this.RemoveRowFocusStyle();
                let $cell = $(this.DTSelector + ' tbody tr:eq(0) td:eq(0)');
                this.datatable.Api.cell($cell).focus();
                this.ApplyRowFocusStyle($cell.closest("tr"));
            }.bind(this), 1);
        }

        this.V_updateCk();
        //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },520);
        //setTimeout(this.colAdjust, 520);
    };

    //this.colAdjust = function () { $('#' + this.name + 'tbl').DataTable().columns.adjust().draw(); }

    this.V_updateCk = function () {// API..............
        $("#" + this.container + ' table:eq(1) tbody [type=checkbox]').each(function (i, chkbx) {
            let $row = $(chkbx).closest('tr');
            let datas = $(this.DTSelector).DataTable().row($row).data();
            if (this.Vobj.valueMembers.contains(datas[this.VMindex]))
                $(chkbx).prop('checked', true);
            else
                $(chkbx).prop('checked', false);
        }.bind(this));
        // raise error msg
        setTimeout(this.RaiseErrIf.bind(this), 30);
    };

    this.RaiseErrIf = function () {
        if (this.Vobj.valueMembers.length !== this.Vobj.displayMembers[this.dmNames[0]].length) {
            //alert('valueMember and displayMembers length miss match found !!!!');
            //console.error('Ebselect error : valueMember and displayMembers length miss match found !!!!');
            console.eb_warn('valueMember and displayMembers length miss match found !!!!');
            console.log('valueMembers=' + this.Vobj.valueMember);
            console.log('displayMember[0] = ' + this.Vobj.displayMember[this.dmNames[0]]);
        }
    };

    this.arrowSelectionStylingFcs = function (e, datatable, cell, originalEvent) {
        $(this.DTSelector + " ." + this.name + "tbl_select").blur();
        $(":focus").blur();
        let row = datatable.row(cell.index().row);
        let $tr = $(row.nodes());
        this.ApplyRowFocusStyle($tr);
    }.bind(this);

    this.arrowSelectionStylingBlr = function (e, datatable, cell) {
        let row = datatable.row(cell.index().row);
        let $tr = $(row.nodes());
        this.RemoveRowFocusStyle($tr);
    }.bind(this);

    this.ApplyRowFocusStyle = function ($tr) {
        $tr.find('.focus').removeClass('focus');
        setTimeout(function () {
            $tr.addClass('selected');
        }, 10);
    };

    this.RemoveRowFocusStyle = function ($tr) {
        $tr = $tr || $(this.DTSelector + " tr.selected");
        if ($tr.length === 0)
            return;
        //$tr.removeClass('selected');
    };

    this.tagCloseBtnHand = function (e) {
        this.ClosedItem = this.Vobj.valueMembers.splice(delid(), 1)[0];
        if (this.ComboObj.MultiSelect)
            $(this.DTSelector + ' [type=checkbox][value=' + this.ClosedItem + ']').prop("checked", false);
        //else
        //    var _v = this.Vobj.valueMembers.splice(delid(), 1);
        $.each(this.dmNames, function (i, name) {
            this.Vobj.displayMembers[name].splice(delid(), 1);
        }.bind(this));
    };

    this.checkBxClickEventHand = function (e) {
        this.$curEventTarget = $(e.target);
        let $row = $(e.target).closest('tr');
        let datas = $(this.DTSelector).DataTable().row($row).data();
        if (!(this.Vobj.valueMembers.contains(datas[this.VMindex]))) {
            if (this.maxLimit === 0 || this.Vobj.valueMembers.length !== this.maxLimit) {
                this.Vobj.valueMembers.push(datas[this.VMindex]);
                $.each(this.dmNames, this.setDmValues.bind(this));
                $(e.target).prop('checked', true);
            }
            else
                $(e.target).prop('checked', false);
        }
        else {
            this.delDMs($(e.target));
            $(e.target).prop('checked', false);
        }
    };

    this.delDMs = function ($e) {
        let $row = $e.closest('tr');
        let datas = $(this.DTSelector).DataTable().row($row).data();
        let vmIdx2del = this.Vobj.valueMembers.indexOf(datas[this.VMindex]);
        this.Vobj.valueMembers.splice(vmIdx2del, 1);
        $.each(this.dmNames, function (i) { this.Vobj.displayMembers[this.dmNames[i]].splice(vmIdx2del, 1); }.bind(this));
    };

    this.hideDDclickOutside = function (e) {
        let container = $('#' + this.name + 'DDdiv');
        let container1 = $('#' + this.name + 'Container');
        let _name = this.ComboObj.EbSid_CtxId;
        if (this.Vobj.DDstate === true && (!container.is(e.target) && container.has(e.target).length === 0) && (!container1.is(e.target) && container1.has(e.target).length === 0)) {
            this.Vobj.hideDD();/////
            if (this.Vobj.valueMembers.length < this.minLimit && this.minLimit !== 0) {
                if (this.IsSearchBoxFocused || this.IsDatatableInit)// if countrol is touched
                    EbMakeInvalid(`#${_name}Container`, `#${_name}Wraper`, 'This field  require minimum ' + this.minLimit + ' values');
            }
            else {
                if (this.required && this.Vobj.valueMembers.length === 0) {
                    if (this.IsSearchBoxFocused || this.IsDatatableInit)// if countrol is touched
                        EbMakeInvalid(`#${_name}Container`, `#${_name}Wraper`);
                }
                else {
                    EbMakeValid(`#${_name}Container`, `#${_name}Wraper`);
                }

            }
        }
    };

    this.Renderselect();
};