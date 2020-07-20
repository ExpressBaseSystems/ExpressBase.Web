const EbPowerSelect = function (ctrl, options) {
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
    this.$wraper = $('#' + this.name + 'Wraper');
    this.DTSelector = '#' + this.name + 'tbl';
    this.DT_tbodySelector = "#" + this.ComboObj.EbSid_CtxId + 'DDdiv table:eq(1) tbody';
    this.NoOfFields = this.dmNames.length;
    this.Vobj = null;
    this.datatable = null;
    this.clmAdjst = 0;
    this.onDataLoadCallBackFns = [];


    ctrl._DisplayMembers = [];
    ctrl._ValueMembers = [];
    this.valueMembers = ctrl._ValueMembers;
    this.localDMS = ctrl._DisplayMembers;
    this.columnVals = {};
    $.each(this.ColNames, function (i, name) { this.columnVals[name] = []; }.bind(this));

    this.$curEventTarget = null;
    this.IsDatatableInit = false;
    this.IsSearchBoxFocused = false;

    $.each(this.dmNames, function (i, name) { this.localDMS[name] = []; }.bind(this));

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
            this.$searchBoxes = $('#' + this.name + 'Wraper [type=search]');
            this.$searchBoxes.on("click", function () { $(this).focus(); });
            this.$searchBoxes.keyup(this.searchboxKeyup);
            this.$inp = $("#" + this.ComboObj.EbSid_CtxId);
            $(document).mouseup(this.hideDDclickOutside.bind(this));//hide DD when click outside select or DD &  required ( if  not reach minLimit) 
            $('#' + this.name + 'Wraper .ps-srch').off("click").on("click", this.toggleIndicatorBtn.bind(this)); //search button toggle DD
            $('#' + this.name + 'tbl').keydown(function (e) { if (e.which === 27) this.Vobj.hideDD(); }.bind(this));//hide DD on esc when focused in DD
            $('#' + this.name + 'Wraper').on('click', '[class= close]', this.tagCloseBtnHand.bind(this));//remove ids when tagclose button clicked
            this.$searchBoxes.keydown(this.SearchBoxEveHandler.bind(this));//enter-DDenabling & if'' showall, esc arrow space key based DD enabling , backspace del-valueMember updating
            $('#' + this.name + 'Wraper' + " .dropdown.v-select.searchable").dblclick(this.V_showDD.bind(this));//search box double click -DDenabling
            this.$searchBoxes.keyup(debounce(this.delayedSearchFN.bind(this), 300)); //delayed search on combo searchbox
            this.$searchBoxes.on("focus", this.searchBoxFocus); // onfocus  searchbox
            this.$searchBoxes.on("blur", this.searchBoxBlur); // onblur  searchbox
            this.Values = [];

            {// temporary code
                if (!this.ComboObj.Padding)
                    this.ComboObj.Padding = { $type: "ExpressBase.Common.Objects.UISides, ExpressBase.Common", Top: 7, Right: 10, Bottom: 7, Left: 10 }
            }

            if (this.ComboObj.Padding)
                this.$searchBoxes.css("padding", `${this.ComboObj.Padding.Top}px ${this.ComboObj.Padding.Right}px ${this.ComboObj.Padding.Bottom}px ${this.ComboObj.Padding.Left}px`);

            if (this.ComboObj.IsInsertable) {
                this.ComboObj.__AddButtonInit(this.ComboObj.AddButton);
            }

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

    this.getColumn = function (colName) { return this.ComboObj.MultiSelect ? this.columnVals[colName] : this.columnVals[colName][0]; }.bind(this);

    //this.getColumn = function (colName) {
    //    let columnVals = getEbFormatedPSRows(this.ComboObj);
    //    return this.ComboObj.MultiSelect ? columnVals[colName] : columnVals[colName][0];
    //}.bind(this);

    this.searchBoxFocus = function () {
        this.IsSearchBoxFocused = true;
        this.RemoveRowFocusStyle();
    }.bind(this);

    this.searchBoxBlur = function () {
        this.IsSearchBoxFocused = false;
        let _name = this.ComboObj.EbSid_CtxId;
        EbHideCtrlMsg(`#${_name}Container`, `#${_name}Wraper`);
    }.bind(this);

    this.getSearchByExp = function (DefOp, mapedFieldType) {
        let op = String.empty;
        if (mapedFieldType === "string") {
            if (DefOp === 0)// Equals
                op = " = ";
            else if (DefOp === 1)// Startwith
                op = "x*";
            else if (DefOp === 2)//EndsWith
                op = "*x";
            else if (DefOp === 3)// Between
                op = "*x*";
            else if (DefOp === 3)// Contains
                op = "*x*";
        }
        else if (mapedField === "numeric") {
            switch (DefOp.toString()) {
                case EbEnums.NumericOperators.Equals: op = '='; break;
                case EbEnums.NumericOperators.LessThan: op = '<'; break;
                case EbEnums.NumericOperators.GreaterThan: op = '>'; break;
                case EbEnums.NumericOperators.LessThanOrEqual: op = '<='; break;
                case EbEnums.NumericOperators.GreaterThanOrEqual: op = '>='; break;
                case EbEnums.NumericOperators.Between: op = 'B'; break;
                default: op = '=';
            }
        }
        else if (mapedField === "date") {
            switch (DefOp.toString()) {
                case EbEnums.NumericOperators.Equals: op = '='; break;
                case EbEnums.NumericOperators.LessThan: op = '<'; break;
                case EbEnums.NumericOperators.GreaterThan: op = '>'; break;
                case EbEnums.NumericOperators.LessThanOrEqual: op = '<='; break;
                case EbEnums.NumericOperators.GreaterThanOrEqual: op = '>='; break;
                case EbEnums.NumericOperators.Between: op = 'B'; break;
                default: op = '=';
            }
        }
        return op;
    }

    this.showCtrlMsg = function () {
        EbShowCtrlMsg(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`, `Enter minimum ${this.ComboObj.MinSeachLength} characters to search`, "info");
    }.bind(this);

    this.hideCtrlMsg = function () {
        EbHideCtrlMsg(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`);
    }.bind(this);

    //delayed search on combo searchbox
    this.delayedSearchFN = function (e) {
        let $e = $(e.target);
        let searchVal = $e.val();
        let MaxSearchVal = this.getMaxLenVal();

        if (!isPrintable(e) && e.which !== 8)
            return;

        if (this.ComboObj.MinSeachLength > MaxSearchVal.length) {
            this.showCtrlMsg();
            this.V_hideDD();
            return;
        }
        else {
            this.hideCtrlMsg();
        }

        let mapedField = $e.closest(".searchable").attr("maped-column");
        let mapedFieldType = this.getTypeForDT($e.closest(".searchable").attr("column-type"));
        let $filterInp = $(`#${this.name}tbl_${mapedField}_hdr_txt1`);
        let colObj = getObjByval(this.ComboObj.DisplayMembers.$values, "name", mapedField);
        let searchByExp = "x*";//this.getSearchByExp(colObj.DefaultOperator, mapedFieldType);// 4 roby
        if (mapedFieldType !== "string")
            searchByExp = " = ";
        if (!this.IsDatatableInit) {
            if (this.ComboObj.MinSeachLength > searchVal.length)
                return;
            let filterObj = new filter_obj(mapedField, searchByExp, searchVal, mapedFieldType);
            this.filterArray.push(filterObj);
            this.InitDT();
            this.V_showDD();
        }
        else {
            $filterInp.val($e.val());
            this.Vobj.DDstate = true;
            EbMakeValid(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`);
            if (this.ComboObj.MinSeachLength > searchVal.length)
                return;

            if (searchVal.trim() === "" && this.ComboObj.MinSeachLength === 0) {

                if (this.datatable) {
                    //this.datatable.columnSearch = [];
                    this.datatable.Api.column(mapedField + ":name").search("").draw();
                }
                return;
            }

            if (this.datatable) {
                //this.datatable.columnSearch = [];
                //this.datatable.columnSearch.push(new filter_obj(mapedField, searchByExp, searchVal, mapedFieldType));
                //this.datatable.Api.draw();
                this.datatable.Api.column(mapedField + ":name").search(searchVal).draw();
            }
        }
    };

    this.defaultDTcallBFn = function () {
        this.V_hideDD();
    };

    this.setValues = function (StrValues, callBFn = this.defaultDTcallBFn) {
        this.clearValues();
        if (StrValues === "" || StrValues === null)
            return;
        this.setvaluesColl = (StrValues + "").split(",");// cast

        if (this.datatable) {
            this.datatable.columnSearch = [];
            //$.each(this.setvaluesColl, function (i, val) {
            this.datatable.columnSearch.push(new filter_obj(this.ComboObj.ValueMember.name, "=", this.setvaluesColl.join("|"), this.ComboObj.ValueMember.Type));
            //}.bind(this));
            this.datatable.Api.draw(this.initComplete4SetVal.bind(this, callBFn.bind(this, this.ComboObj), StrValues));
        }
        else {
            this.filterArray = [];
            //$.each(this.setvaluesColl, function (i, val) {
            this.filterArray.push(new filter_obj(this.ComboObj.ValueMember.name, "=", this.setvaluesColl.join("|"), this.ComboObj.ValueMember.Type));
            //}.bind(this));
            if (this.setvaluesColl.length > 0) {
                this.fninitComplete4SetVal = this.initComplete4SetVal.bind(this, callBFn.bind(this, this.ComboObj), StrValues);
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
        this.clearValues();
        if (this.setvaluesColl) {
            if (this.ComboObj.MultiSelect) {
                $.each(this.setvaluesColl, function (i, val) {
                    let $checkBox = $(this.DTSelector + ` [type=checkbox][value=${parseInt(val)}]`);
                    if ($checkBox.length === 0) {
                        console.eb_warn(`>> eb message : none available value '${val}' set for  powerSelect '${this.ComboObj.Name}'`, "rgb(222, 112, 0)");
                        this.$inp.val(StrValues).trigger("change");
                    }
                    else
                        $checkBox.click();
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
            //this.afterInitComplete4SetVal = true;
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

    this.getData = function () {
        this.filterValues = [];
        let params = this.ajaxData();
        let url = "../dv/getData4PowerSelect";
        $.ajax({
            url: url,
            type: 'POST',
            data: params,
            success: this.receiveAjaxData.bind(this),
        });
    };
    this.ajaxData = function () {
        var dq = new Object();
        dq.RefId = this.dsid;
        this.filterValues = this.getFilterValuesFn();
        this.AddUserAndLcation();
        dq.Params = this.filterValues || [];
        dq.Start = 0;
        dq.Length = 100;
        dq.DataVizObjString = JSON.stringify(this.EbObject);
        dq.TableId = this.name + "tbl";
        dq.TFilters = this.filterArray;
        return dq;
    };

    this.AddUserAndLcation = function () {
        this.filterValues.push(new fltr_obj(11, "eb_loc_id", store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId)));
        this.filterValues.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
    };

    this.receiveAjaxData = function (result) {
        let o = {};
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
        //o.columnSearch = this.filterArray;
        o.headerDisplay = (this.ComboObj.Columns.$values.filter((obj) => obj.bVisible === true && obj.name !== "id").length === 1) ? false : true;// (this.ComboObj.Columns.$values.length > 2) ? true : false;
        o.dom = "rt";
        o.source = "powerselect";
        o.hiddenFieldName = this.vmName || "id";
        o.keys = true;
        //o.hiddenFieldName = this.vmName;
        o.keyPressCallbackFn = this.DDKeyPress.bind(this);
        o.columns = this.ComboObj.Columns.$values;//////////////////////////////////////////////////////
        if (options)
            o.rendererName = options.rendererName;
        //o.getFilterValuesFn = this.getFilterValuesFn;
        o.fninitComplete4SetVal = this.fninitComplete4SetVal;
        o.fns4PSonLoad = this.onDataLoadCallBackFns;
        o.searchCallBack = this.searchCallBack;
        o.data = result;
        this.datatable = new EbBasicDataTable(o);

        setTimeout(function () {
            let contWidth = $('#' + this.name + 'Container').width();
            contWidth = (this.ComboObj.DropdownWidth === 0) ? contWidth : (this.ComboObj.DropdownWidth / 100) * contWidth;
            let div_tble = $("#" + o.containerId);
            let parentCont = div_tble.parentsUntil('form').last();
            if (parentCont.attr('ctype') === "TabControl") {
                div_tble.attr('drp_parent', 'TabControl');
            }
            let tbl_cod = div_tble.offset();
            let tbl_height = div_tble.height();
            let div_detach = div_tble.detach();
            div_detach.attr({ "detch_select": true, "par_ebsid": this.name, "MultiSelect": this.ComboObj.MultiSelect, "objtype": this.ComboObj.ObjType });
            let xtra_wdth = tbl_cod.left;
            let brow_wdth = $(window).width();
            if ((contWidth + tbl_cod.left) > brow_wdth)
                xtra_wdth = tbl_cod.left + (brow_wdth - (contWidth + tbl_cod.left));
            let $form_div = $('#' + this.name).closest("[eb-root-obj-container]");

            let top = tbl_cod.top;
            let scrollTop = $form_div.scrollTop();
            let scrollH = $form_div.prop("scrollHeight");
            if (scrollTop + tbl_cod.top + tbl_height > scrollH && scrollTop + tbl_cod.top - 60 > tbl_height) {
                top = tbl_cod.top - tbl_height - 60;
                div_tble.css("box-shadow", "0 -6px 12px rgba(0,0,0,.175), 0 0 0 1px rgba(204, 204, 204, 0.41)");
                if (ebcontext.renderContext !== "WebForm")
                    top += 38;
            }
            div_detach.appendTo($form_div).offset({ top: top, left: xtra_wdth }).width(contWidth);
            scrollDropDown();
        }.bind(this), 30);
    };

    // init datatable
    this.InitDT = function () {
        let searchVal = this.getMaxLenVal();
        let _name = this.ComboObj.EbSid_CtxId;
        if (this.ComboObj.MinSeachLength > searchVal.length) {
            //alert(`enter minimum ${this.ComboObj.MinSeachLength} charecter in searchBox`);
            EbShowCtrlMsg(`#${_name}Container`, `#${_name}Wraper`, `Enter minimum ${this.ComboObj.MinSeachLength} characters to search`, "info");
            return;
        }

        this.IsDatatableInit = true;
        this.EbObject = new EbObjects["EbTableVisualization"]("Container");
        this.EbObject.DataSourceRefId = this.dsid;
        this.EbObject.Columns.$values = this.ComboObj.Columns.$values;
        this.getData();
    };

    //this.xxx = function (e, dt, type, indexes) {
    //    console.log("keysssss");
    //};

    this.DDKeyPress = function (e, datatable, key, cell, originalEvent) {
        if ($(":focus").hasClass("eb_finput"))
            return;
        if (key === 13)
            this.DDEnterKeyPress(e, datatable, key, cell, originalEvent);
        else if (key === 32) {
            originalEvent.preventDefault();
            if (originalEvent.target.type !== "checkbox")
                this.DDSpaceKeyPress(e, datatable, key, cell, originalEvent);
        }
    };
    this.searchCallBack = function () {
        setTimeout(function () {
            this.V_updateCk();
        }.bind(this), 30);
    }.bind(this);

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
        let vmValue = this.datatable.data[$tr.index()][idx];
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
            if (this.maxLimit === 1) {// single select
                this.Vobj.valueMembers = [vmValue];
                this.Vobj.hideDD();
                $.each(this.dmNames, this.setDmValues.bind(this));
            }
            else if (this.Vobj.valueMembers.length !== this.maxLimit) {
                this.Vobj.valueMembers.push(vmValue);
                $.each(this.dmNames, this.setDmValues.bind(this));
                $(this.DTSelector + " tr.selected").find('[type=checkbox]').prop('checked', true);
                this.clearSearchBox();
            }
        }
    };

    this.clearSearchBox = function () {
        setTimeout(function () {
            this.$searchBoxes.val('');
        }.bind(this), 10);
    };

    this.reSetColumnvals = function () {
        if (!event)
            return;
        let vmValue = this.lastAddedOrDeletedVal;
        if (event.target.nodeName === "SPAN")// if clicked tagclose
            vmValue = this.ClosedItem;
        //if (!this.ComboObj.MultiSelect)
        vmValue = parseInt(vmValue);

        if (this.curAction = "remove") {
            this.removeColVals(vmValue);
        }
        else {
            this.addColVals();
        }
    };

    this.reSetColumnvals_ = function () {
        $.each(this.ColNames, function (i, name) {
            this.columnVals[name].clear();
        }.bind(this));
        for (let i = 0; i < this.Vobj.valueMembers.length; i++) {
            this.addColVals(this.Vobj.valueMembers[i]);
        }
    };

    this.addColVals = function (val = this.lastAddedOrDeletedVal) {
        $.each(this.ColNames, function (i, name) {
            let obj = getObjByval(this.datatable.ebSettings.Columns.$values, "name", name);
            let type = obj.Type;
            let $rowEl = $(`${this.DT_tbodySelector} [data-uid=${val}]`);
            let idx = getObjByval(this.datatable.ebSettings.Columns.$values, "name", name).data;
            let cellData;
            if (type === 5 || type === 11)
                cellData = this.datatable.data[$rowEl.index()][idx];// unformatted data for date or integer
            else
                cellData = this.datatable.formatteddata[$rowEl.index()][idx];//this.datatable.Api.row($rowEl).data()[idx];//   formatted data

            let fval = EbConvertValue(cellData, type);
            this.columnVals[name].push(fval);
        }.bind(this));
    };

    this.removeColVals = function (vmValue) {
        let idx = this.columnVals[this.vmName].indexOf(vmValue);
        if (idx < 0)// to handle special case of setting values which are not in DV
            return;
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
        let vmValue = this.datatable.data[$(e.target).closest("tr").index()][idx];
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
        if ($('#' + this.name + 'Container').length === 0)
            console.eb_warn("no dom element with id " + this.name + 'Container');
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
    };

    this.setLastmodfiedVal = function () {
        if (this.Vobj.valueMembers.length > this.Values.length) {
            this.lastAddedOrDeletedVal = this.Vobj.valueMembers.filter(x => !this.Values.includes(x))[0];
            this.curAction = "add";
        }
        else {
            this.lastAddedOrDeletedVal = this.Values.filter(x => !this.Vobj.valueMembers.includes(x))[0];
            this.curAction = "remove";
        }
    };

    //single select & max limit
    this.V_watchVMembers = function (VMs, a, b, c) {
        this.setLastmodfiedVal();
        this.Values = [...this.Vobj.valueMembers];

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

        if (this.datatable === null) {
            if (this.Vobj.valueMembers.length < this.columnVals[this.dmNames[0]].length)// to manage tag close before dataTable initialization
                this.reSetColumnvals();
            if (this.ComboObj.justInit) { // temp from DG.setRowValues_E
                this.$inp.val(this.Vobj.valueMembers);
                this.ComboObj.justInit = undefined;
            }
            else
                this.$inp.val(this.Vobj.valueMembers).trigger("change");

        }
        else {
            this.reSetColumnvals_();
            if (this.justInit) {
                this.$inp.val(this.Vobj.valueMembers);
                //if (this.afterInitComplete4SetVal)
                this.justInit = undefined;
            }
            else
                this.$inp.val(this.Vobj.valueMembers).trigger("change");
        }


        this.required_min_Check();

        this.ComboObj.DataVals.R = JSON.parse(JSON.stringify(this.columnVals));

        //console.log("VALUE MEMBERS =" + this.Vobj.valueMembers);
        //console.log("DISPLAY MEMBER 0 =" + this.Vobj.displayMembers[this.dmNames[0]]);
        //console.log("DISPLAY MEMBER 1 =" + this.Vobj.displayMembers[this.dmNames[1]]);
        //console.log("DISPLAY MEMBER 3 =" + this.Vobj.displayMembers[this.dmNames[3]]);
        setTimeout(function () {
            this.adjustTag_closeHeight();
            this.$wraper.find(".selected-tag:contains(--)").css("color", "rgba(255, 255, 255, 0.71) !important");
        }.bind(this), 5);
    };

    this.adjustTag_closeHeight = function () {
        if (this.ComboObj.Padding && this.$wraper.find(".selected-tag").length > 0) {
            if (this.ComboObj.Padding.Top >= 7) {
                this.$wraper.find(".selected-tag").css("padding-top", `${(this.ComboObj.Padding.Top - 5)}px`);
                this.$wraper.find(".v-select input[type=search]").css("padding-top", `${(this.ComboObj.Padding.Top - 2)}px`);
                this.$wraper.find(".v-select .selected-tag .close").css("padding-top", `${(this.ComboObj.Padding.Top - 3.5)}px`);
            }
            if (this.ComboObj.Padding.Bottom >= 7) {
                this.$wraper.find(".selected-tag").css("padding-bottom", `${(this.ComboObj.Padding.Bottom - 5)}px`);
                this.$wraper.find(".v-select input[type=search]").css("padding-bottom", `${(this.ComboObj.Padding.Bottom - 2)}px`);
            }
        }
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

    //this.clearColumnVals = function () {
    //    for (colName in this.columnVals)
    //        this.columnVals[colName].clear();
    //}.bind(this);

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

    this.V_showDD = function (e) {
        if (this.Vobj.DDstate)
            return;
        let searchVal = this.getMaxLenVal();
        if (this.ComboObj.MinSeachLength > searchVal.length) {
            this.showCtrlMsg();
            return;
        }
        else
            this.hideCtrlMsg();

        this.Vobj.DDstate = true;
        if (!this.IsDatatableInit)
            this.InitDT();
        else {
            EbMakeValid(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`);
            //if ($(e.target).val() !== "") {
            //    this.delayedSearchFN(e);
            //}
            //else {
            //    this.datatable.columnSearch = [];
            //    this.datatable.Api.ajax.reload();
            //}
            setTimeout(function () {
                this.RemoveRowFocusStyle();
                let $cell = $(this.DTSelector + ' tbody tr:eq(0) td:eq(0)');
                if (this.datatable)
                    this.datatable.Api.cell($cell).focus();
                this.ApplyRowFocusStyle($cell.closest("tr"));
            }.bind(this), 1);
        }

        this.V_updateCk();
        //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },520);
        this.colAdjust();
    };

    this.colAdjust = function () {
        if (this.datatable)
            $('#' + this.name + 'tbl').DataTable().columns.adjust().draw();
    }.bind(this);

    this.V_updateCk = function () {// API..............
        $("#" + this.ComboObj.EbSid_CtxId + 'DDdiv table:eq(1) tbody [type=checkbox]').each(function (i, chkbx) {
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
            if (this.Vobj.valueMember)
                console.log('valueMembers=' + this.Vobj.valueMember);
            if (this.Vobj.displayMembers && this.Vobj.displayMembers[this.dmNames[0]])
                console.log('displayMember[0] = ' + this.Vobj.displayMembers[this.dmNames[0]]);
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
            $(this.DTSelector + " [type=checkbox][value='" + this.ClosedItem + "']").prop("checked", false);
        //else
        //    var _v = this.Vobj.valueMembers.splice(delid(), 1);
        $.each(this.dmNames, function (i, name) {
            this.Vobj.displayMembers[name].splice(delid(), 1);
        }.bind(this));
        this.clearSearchBox();
        this.filterArray = [];
        if (this.datatable) {
            this.datatable.columnSearch = [];
            //this.datatable.Api.ajax.reload();
            this.reloadDT();
        }
    };

    this.reloadDT = function () {
        this.datatable.Api.draw(this.colAdjust);
    }.bind(this);

    this.checkBxClickEventHand = function (e) {
        this.$curEventTarget = $(e.target);
        let $row = $(e.target).closest('tr');
        //let datas = $(this.DTSelector).DataTable().row($row).data();
        let datas = this.datatable.data[$row.index()];


        if (!(this.Vobj.valueMembers.contains(datas[this.VMindex]))) {
            if (this.maxLimit === 0 || this.Vobj.valueMembers.length !== this.maxLimit) {
                this.Vobj.valueMembers.push(datas[this.VMindex]);
                $.each(this.dmNames, this.setDmValues.bind(this));
                $(e.target).prop('checked', true);
                this.clearSearchBox();
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
            this.required_min_Check();
        }
    };

    this.required_min_Check = function () {
        let reqNotOK = false;
        let minLimitNotOk = false;

        let contId = (this.ComboObj.constructor.name === "DGPowerSelectColumn") ? `#td_${this.ComboObj.EbSid_CtxId}` : `#${this.ComboObj.EbSid_CtxId}Container`;// to handle special case of DG powerselect 
        let wraperId = `#${this.ComboObj.EbSid_CtxId}Wraper`;
        let msg = "This field is required";

        if (this.required && this.Vobj.valueMembers.length === 0) {
            reqNotOK = true;
        }
        else if (this.Vobj.valueMembers.length < this.minLimit && this.minLimit !== 0) {
            minLimitNotOk = true;
            msg = 'This field  require minimum ' + this.minLimit + ' values';
        }

        if (reqNotOK || minLimitNotOk) {
            //if (this.IsSearchBoxFocused || this.IsDatatableInit)// if countrol is touched
            EbMakeInvalid(contId, wraperId, msg);
        }
        else {
            EbMakeValid(contId, wraperId);
        }
    }.bind(this);

    this.getDisplayMemberModel = function () {
        let newDMs = {};
        let DmClone = removePropsOfType($.extend(true, {}, this.Vobj.displayMembers), 'function');
        let ValueMembers = this.Vobj.valueMembers.toString().split(",");
        for (var i = 0; i < ValueMembers.length; i++) {
            let vm = ValueMembers[i];
            newDMs[vm] = {};
            for (let j = 0; j < this.dmNames.length; j++) {
                let dmName = this.dmNames[j];
                newDMs[vm][dmName] = DmClone[dmName][i];
            }

        }

        return newDMs;
    };

    this.Renderselect();
};
