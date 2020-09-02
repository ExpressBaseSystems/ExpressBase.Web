const EbTableVisualization = function EbTableVisualization(id, jsonObj) {
    this.$type = 'ExpressBase.Objects.EbTableVisualization, ExpressBase.Objects';
    this.EbSid = id;
    this.RowGroupCollection = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.RowGroupParent,  ExpressBase.Objects]], System.Private.CoreLib", "$values": [] };
    this.CurrentRowGroup = { "$type": "ExpressBase.Objects.RowGroupParent, ExpressBase.Objects", "Name": null, "DisplayName": null, "RowGrouping": { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.Objects.DVRelated.DVBaseColumn, ExpressBase.Objects]], System.Private.CoreLib", "$values": [] }, "OrderBy": { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.Objects.DVRelated.DVBaseColumn, ExpressBase.Objects]], System.Private.CoreLib", "$values": [] } };
    this.LeftFixedColumn = 0; this.RightFixedColumn = 0; this.PageLength = 100; this.DisableRowGrouping = false; this.SecondaryTableMapField = '';
    this.DisableCopy = false; this.AllowMultilineHeader = false;
    this.OrderBy = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.Objects.DVRelated.DVBaseColumn,  ExpressBase.Objects]], System.Private.CoreLib", "$values": [] };
    this.FormLinks = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.FormLink,  ExpressBase.Objects]], System.Private.CoreLib", "$values": [] };
    this.RowHeight = 15; this.AllowLocalSearch = false; this.BackColor = '#FFFFFF'; this.IsGradient = true; this.GradientColor1 = '#3d3d5a'; this.GradientColor2 = '#3b7273';
    this.Direction = 0; this.BorderColor = '#3d3d5a'; this.BorderRadius = 4; this.FontColor = '#FFFFFF'; this.LinkColor = '#26b3f7'; this.RefId = ''; this.DisplayName = '';
    this.Name = id; this.Description = ''; this.VersionNumber = ''; this.Status = ''; this.DataSourceRefId = ''; this.IsDataFromApi = false; this.Url = ''; this.Method = 0;
    this.Headers = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.ApiRequestHeader,  ExpressBase.Objects]], System.Private.CoreLib", "$values": [] };
    this.Parameters = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.ApiRequestParam,  ExpressBase.Objects]], System.Private.CoreLib", "$values": [] };
    this.FilterDialogRefId = ''; this.Sql = ''; this.EbSid = id; this.Columns = { "$type": "ExpressBase.Objects.Objects.DVRelated.DVColumnCollection, ExpressBase.Objects", "$values": [] };
    this.DSColumns = { "$type": "ExpressBase.Objects.Objects.DVRelated.DVColumnCollection, ExpressBase.Objects", "$values": [] };
    this.ColumnsCollection = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.Objects.DVRelated.DVColumnCollection,  ExpressBase.Objects]], System.Private.CoreLib", "$values": [] };
    this.ParamsList = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Common.Data.Param,  ExpressBase.Common]], System.Private.CoreLib", "$values": [] };
    this.NotVisibleColumns = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.Objects.DVRelated.DVBaseColumn,  ExpressBase.Objects]], System.Private.CoreLib", "$values": [] };
    this.data = { "$type": "System.Object, System.Private.CoreLib" }; this.Pippedfrom = ''; this.AutoGen = false; this.IsPaging = true;
    this.EbSid_CtxId = id;


    this.$Control = $("<div class='btn btn-default'> GetDesignHtml() not implemented </div>".replace(/@id/g, this.EbSid));
    this.BareControlHtml = `<div class='btn btn-default'> GetBareHtml() not implemented </div>`.replace(/@id/g, this.EbSid);
    this.DesignHtml = "<div class='btn btn-default'> GetDesignHtml() not implemented </div>";
    var MyName = this.constructor.name;
    this.RenderMe = function () {
        var NewHtml = this.$BareControl.outerHTML(), me = this, metas = AllMetas[MyName];
        $.each(metas, function (i, meta) {
            var name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', me[name]);
            }
        });
        if (!this.IsContainer)
            $('#' + id).html($(NewHtml).html());
    };
    if (jsonObj) {
        jsonObj.RenderMe = this.RenderMe;
        jsonObj.Html = this.Html;
        jsonObj.Init = this.Init;
        $.extend(this, jsonObj);
        //_.mergeWith(
        // {}, this, jsonObj,
        //  (a, b) => b === null ? a : undefined
        //)
        if (jsonObj.IsContainer)
            this.Controls = new EbControlCollection({});
        //if(this.Init)
        //    jsonObj.Init(id);
    }
    else {
        if (this.Init)
            this.Init(id);
    }
};

const EbPowerSelect = function (ctrl, options) {
    //parameters 
    this.getFilterValuesFn = options.getFilterValuesFn;
    this.ComboObj = ctrl;
    //this.ComboObj.__isDGv2Ctrl = true;// hardcoding
    this.renderer = options.renderer;
    this.ComboObj.initializer = this;
    this.name = ctrl.EbSid_CtxId;
    this.containerId = this.name + "DDdiv";
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

    this.scrollableContSelectors = options.scrollableContSelectors;

    ctrl._DisplayMembers = [];
    ctrl._ValueMembers = [];
    this.valueMembers = ctrl._ValueMembers;
    this.localDMS = ctrl._DisplayMembers;
    this.columnVals = {};
    this.DMlastSearchVal = {};
    $.each(this.ColNames, function (i, name) { this.columnVals[name] = []; }.bind(this));

    this.curRowUnformattedData = null;
    this.IsDatatableInit = false;
    this.IsSearchBoxFocused = false;

    $.each(this.dmNames, function (i, name) { this.localDMS[name] = []; }.bind(this));
    $.each(this.dmNames, function (i, name) { this.DMlastSearchVal[name] = ""; }.bind(this));

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
            this.lastFocusedDMsearchBox = $(this.$searchBoxes[0]);
            this.$searchBoxes.on("click", function () { $(this).focus(); });
            this.$searchBoxes.keyup(this.searchboxKeyup);
            this.$inp = $("#" + this.ComboObj.EbSid_CtxId);
            this.$progressBar = $("#" + this.ComboObj.EbSid_CtxId + "_pb");
            this.$DDdiv = $('#' + this.name + 'DDdiv');
            this.isDGps = this.ComboObj.constructor.name === "DGPowerSelectColumn" || this.ComboObj.isDGCtrl;

            $(document).mouseup(this.hideDDclickOutside.bind(this));//hide DD when click outside select or DD &  required ( if  not reach minLimit)
            $('#' + this.name + 'Wraper .ps-srch').off("click").on("click", this.toggleIndicatorBtn.bind(this)); //search button toggle DD
            $('#' + this.name + 'Wraper .DDclose').off("click").on("click", this.DDclose.bind(this)); // dd close button
            $('#' + this.name + 'tbl').keydown(function (e) {
                if (e.which === 27) {
                    this.lastFocusedDMsearchBox.focus();
                    this.Vobj.hideDD();
                }
            }.bind(this));//hide DD on esc when focused in DD
            $('#' + this.name + 'Wraper').on('click', '[class= close]', this.tagCloseBtnHand.bind(this));//remove ids when tagclose button clicked
            this.$searchBoxes.keydown(this.SearchBoxEveHandler.bind(this));//enter-DDenabling & if'' showall, esc arrow space key based DD enabling , backspace del-valueMember updating
            $('#' + this.name + 'Wraper' + " .dropdown.v-select.searchable").dblclick(this.V_showDD.bind(this));//search box double click -DDenabling
            this.$searchBoxes.keyup(debounce(this.delayedSearchFN.bind(this), 600)); //delayed search on combo searchbox
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
                this.ComboObj.__AddButtonInit({
                    EbSid_CtxId: this.ComboObj.EbSid_CtxId + "_addbtn",
                    FormRefId: this.ComboObj.FormRefId,
                    OpenInNewTab: this.ComboObj.OpenInNewTab
                });
            }

            //set id for searchBox
            $('#' + this.name + 'Wraper  [type=search]').each(this.srchBoxIdSetter.bind(this));


            if (!this.ComboObj.MultiSelect)
                $('#' + this.name + 'Wraper').attr("singleselect", "true");

            this.$searchBoxes.attr("autocomplete", "off");

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

    this.searchBoxFocus = function (e) {
        this.IsSearchBoxFocused = true;
        this.lastFocusedDMsearchBox = $(e.target);
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
        EbShowCtrlMsg(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`, `Enter minimum ${this.ComboObj.MinSearchLength} characters to search`, "info");
    }.bind(this);

    this.hideCtrlMsg = function () {
        EbHideCtrlMsg(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`);
    }.bind(this);

    //delayed search on combo searchbox
    this.delayedSearchFN = function (e) {
        let $e = $(e.target);
        let searchVal = $e.val().trim();
        let MaxSearchVal = this.getMaxLenVal();

        if (!isPrintable(e) && e.which !== 8)
            return;

        if (this.ComboObj.MinSearchLength > MaxSearchVal.length) {
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
        let searchByExp = "*x*";//this.getSearchByExp(colObj.DefaultOperator, mapedFieldType);// 4 roby
        if (mapedFieldType !== "string")
            searchByExp = " = ";
        if (!this.IsDatatableInit) {
            if (this.ComboObj.MinSearchLength > searchVal.length)
                return;
            let filterObj = new filter_obj(mapedField, searchByExp, searchVal, mapedFieldType);
            this.filterArray.push(filterObj);
            this.V_showDD();
            if (!this.ComboObj.IsPreload)
                this.DMlastSearchVal[mapedField] = searchVal;
        }
        else {
            this.V_showDD();
            if (this.ComboObj.IsPreload) {
                $filterInp.val($e.val());
                this.Vobj.DDstate = true;
                EbMakeValid(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`);
                if (this.ComboObj.MinSearchLength > searchVal.length)
                    return;

                if (searchVal === "" && this.ComboObj.MinSearchLength === 0) {
                    if (this.datatable) {
                        this.datatable.Api.column(mapedField + ":name").search("").draw();
                    }
                    return;
                }

                if (this.datatable) {
                    this.datatable.Api.column(mapedField + ":name").search(searchVal).draw();
                }
            }
            else {
                if (this.DMlastSearchVal[mapedField] === searchVal)
                    return;
                this.UpdateFilter(mapedField, searchByExp, searchVal, mapedFieldType);
                //if (this.filterArray.length > 0)
                this.getData();
                this.DMlastSearchVal[mapedField] = searchVal;
            }
        }
    };

    this.UpdateFilter = function (mapedField, searchByExp, searchVal, mapedFieldType) {
        let index = this.filterArray.findIndex(ft => ft.Column === mapedField);
        if (index !== -1) {
            if (searchVal === "")
                this.filterArray.splice(index, 1);
            else
                this.filterArray[index].Value = searchVal;
        }
        else if (searchVal !== "") {
            let filterObj = new filter_obj(mapedField, searchByExp, searchVal, mapedFieldType);
            this.filterArray.push(filterObj);
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

        if (this.ComboObj.IsPreload) { // if preLoad
            if (this.data === undefined) {// if preLoad No data
                this.IsFromSetValues = true;
                this.getData();
            }
            else
                this.setValues2PSFromData(this.setvaluesColl);
        }
        else {// get data with particular rows
            this.filterArray.clear();
            this.filterArray.push(new filter_obj(this.ComboObj.ValueMember.name, "=", this.setvaluesColl.join("|"), this.ComboObj.ValueMember.Type));
            this.IsFromSetValues = true;
            this.getData();
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

    this.initComplete4SetVal = function (callBFn, StrValues) {/////////????????????
        this.clearValues();
        if (this.setvaluesColl) {
            this.datatable.Api.column(this.ComboObj.ValueMember.name + ":name").search(this.setvaluesColl.join("|"), true, false).draw();
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
                let $row = $(this.DTSelector + ` tbody tr[role="row"][data-uid=${StrValues}]`);
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
        if (e.which === 40) {
            this.Vobj.showDD();
            this.focus1stRow();
        }
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

    //this.attachParams2Url = function () {
    //    let url = new URL(this.ComboObj.Url);

    //    //this.ComboObj.para
    //    for (let i = 0; i < this.ComboObj.ParamsList.$values.length; i++) {
    //        let ctrl = this.ComboObj.ParamsList.$values[i];
    //        url.searchParams.append(ctrl.Name, getObjByval(this.renderer.flatControls, "Name", ctrl.Name).getValue());
    //    }
    //    this.URLwithParams = url.toString();
    //};

    this.reloadWithParams = function () {
        this.clearValues();
        this.fromReloadWithParams = true;
        //if (this.ComboObj.IsDataFromApi)
        //    this.attachParams2Url();
        this.getData();
    };

    this.getData = function () {
        this.showLoader();
        if (this.ComboObj.__isDGv2Ctrl && this.ComboObj.__bkpData) {
            this.getDataSuccess(this.ComboObj.__bkpData);
        }

        //$("#PowerSelect1_pb").EbLoader("show", { maskItem: { Id: `#${this.container}` }, maskLoader: false });
        this.filterValues = [];
        let params = this.ajaxData();
        let url = "../dv/getData4PowerSelect";
        $.ajax({
            url: url,
            type: 'POST',
            data: params,
            success: this.getDataSuccess.bind(this),
            error: function (xhr, ajaxOptions, thrownError) {
                this.hideLoader();
                this.V_hideDD();
                console.warn("PS: getData4PowerSelect ajax call failed");
            }.bind(this)
        });
    };

    this.getDataSuccess = function (result) {
        if (result === undefined) {
            this.hideLoader();
            this.V_hideDD();
            console.warn("PS: getData4PowerSelect ajax call returned undefined");
            return;
        }
        this.data = result;
        this.unformattedData = result.data;
        this.formattedData = result.formattedData;
        this.VMindex = this.ComboObj.Columns.$values.filter(o => o.name === this.vmName)[0].data;

        if (this.ComboObj.__isDGv2Ctrl && !this.ComboObj.__bkpData) {
            this.ComboObj.__bkpData = JSON.parse(JSON.stringify(this.data));
            this.unformattedData = this.ComboObj.__bkpData.data;
            this.formattedData = this.ComboObj.__bkpData.formattedData;
        }

        if (this.IsFromSetValues) {// from set value
            if (this.setvaluesColl && this.setvaluesColl.length > 0) {
                this.setValues2PSFromData(this.setvaluesColl);
                this.filterArray.clear();
            }
            this.IsFromSetValues = false;
        }
        else {// not from setValue (search,...)
            if (!this.isDMSearchEmpty() && this.ComboObj.IsPreload === false && this.unformattedData.length === 1) {
                let VMidx = this.ComboObj.Columns.$values.filter(o => o.name === this.vmName)[0].data;
                let value = this.unformattedData[0][VMidx];
                this.setValues2PSFromData([value]);
                this.filterArray.clear();
                this.hideLoader();
                this.V_hideDD();
                return;
            }
            if (this.datatable === null) {
                this.initDataTable();
            }
            else {
                this.datatable.Api.clear();
                this.datatable.Api.rows.add(this.formattedData); // Add new data
                this.datatable.Api.columns.adjust().draw();
            }
            this.focus1stRow();
        }
        this.hideLoader();
    };

    this.isDMSearchEmpty = function () {
        for (let i = 0; i < this.$searchBoxes.length; i++) {
            if ($(this.$searchBoxes[i]).val() !== "")
                return false;
        }
        return true;
    };

    this.showLoader = function () {
        this.hideLoader();
        this.$progressBar.EbLoader("show", { maskItem: { Id: "#" + this.containerId }, maskLoader: false });
        //this.$DDdiv.append('<div class="loader_mask_EB"></div>');
        //this.$lastFocusedEl = $(":focus").blur();
    };

    this.hideLoader = function () {
        //if (this.$lastFocusedEl && this.$lastFocusedEl.length === 1)
        //    this.$lastFocusedEl.focus();
        this.$progressBar.EbLoader("hide");
        //this.$DDdiv.find(".loader_mask_EB").remove();
    };

    this.ModifyToRequestParams = function () {
        //this.EbObject.Parameters.$values = this.filterValues.map(function (row) {
        //    return { ParamName: row.Name, Value: row.Value, Type: row.Type }
        //});
        //----------------
        $.each(this.ComboObj.ParamsList.$values, function (i, param) {
            let isStaticParam = false;
            if (this.ComboObj.ImportApiParams) {
                let sp_obj = this.ComboObj.ImportApiParams.$values.find(function (obj) { return obj.IsStaticParam === true && obj.Name === param.Name; });
                if (sp_obj)
                    isStaticParam = true;
            }
            if (!isStaticParam) {
                let filterobj = this.filterValues.find(function (obj) { return obj.Name === param.Name; });
                if (filterobj) {
                    param.Value = filterobj.Value;
                }
            }
        }.bind(this));
        this.EbObject.ParamsList = this.ComboObj.ParamsList;
    };

    this.ajaxData = function () {
        this.EbObject = new EbObjects["EbTableVisualization"]("Container");
        this.filterValues = this.getFilterValuesFn();
        this.AddUserAndLcation();

        if (this.ComboObj.IsDataFromApi) {
            this.ModifyToRequestParams();
            this.EbObject.IsDataFromApi = true;
            this.EbObject.Url = this.ComboObj.Url;
            this.EbObject.Method = this.ComboObj.Method;
            this.EbObject.Headers = this.ComboObj.Headers;
        }
        else
            this.EbObject.DataSourceRefId = this.dsid;
        this.EbObject.Columns.$values = this.ComboObj.Columns.$values;
        let dq = new Object();
        dq.RefId = this.dsid;
        dq.Params = this.filterValues || [];
        dq.Start = 0;
        dq.Length = this.ComboObj.IsPreload ? 0 : this.ComboObj.SearchLimit;
        //dq.Length = this.ComboObj.DropDownItemLimit || 5000;
        dq.DataVizObjString = JSON.stringify(this.EbObject);
        dq.TableId = this.name + "tbl";

        if (this.ComboObj.IsPreload)
            dq.TFilters = [];
        else
            dq.TFilters = this.filterArray;

        dq.Ispaging = false;
        return dq;
    };

    this.AddUserAndLcation = function () {
        this.filterValues.push(new fltr_obj(11, "eb_loc_id", store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId)));
        this.filterValues.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
    };

    this.getColumnIdx = function (arr, colName) {
        return arr.filter(o => o.name === colName)[0].data;
    };

    this.setValues2PSFromData = function (setvaluesColl) {
        let VMs = this.Vobj.valueMembers || [];
        let DMs = this.Vobj.displayMembers || [];

        if (setvaluesColl.length > 0)// clear if already values there
            this.clearValues();
        
        let valMsArr = setvaluesColl;
        let VMidx = this.ComboObj.Columns.$values.filter(o => o.name === this.vmName)[0].data;

        for (let i = 0; i < valMsArr.length; i++) {
            let vm = valMsArr[i].trim();
            VMs.push(vm);
            this.addColVals(vm);

            let unformattedDataARR = this.unformattedData.filter(obj => obj[VMidx] === vm);

            if (unformattedDataARR.length === 0) {
                console.log(`>> eb message : none available value '${vm}' set for  powerSelect '${this.ComboObj.Name}'`);
                return;
            }

            let unFormattedRowIdx = this.unformattedData.indexOf(unformattedDataARR[0]);

            for (let j = 0; j < this.dmNames.length; j++) {
                let dmName = this.dmNames[j];
                if (!DMs[dmName])
                    DMs[dmName] = []; // dg edit mode call
                let DMidx = this.getColumnIdx(this.ComboObj.Columns.$values, dmName);
                DMs[dmName].push(this.formattedData[unFormattedRowIdx][DMidx]);
            }
        }
    };

    this.addColVals = function (val = this.lastAddedOrDeletedVal) {
        let VMidx = this.ComboObj.Columns.$values.filter(o => o.name === this.vmName)[0].data;

        let RowUnformattedDataARR = this.unformattedData.filter(obj => obj[VMidx] === val);

        if (RowUnformattedDataARR.length === 0) {
            console.log(`>> eb message : none available value '${val}' set for  powerSelect '${this.ComboObj.Name}'`);
            return;
        }
        let RowUnformattedData = RowUnformattedDataARR[0];
        let unFormattedRowIdx = this.unformattedData.indexOf(RowUnformattedData);


        for (let j = 0; j < this.ColNames.length; j++) {
            let colName = this.ColNames[j];
            let obj = getObjByval(this.ComboObj.Columns.$values, "name", colName);
            let type = obj.Type;
            if (!this.columnVals[colName])
                this.columnVals[colName] = []; // dg edit mode call
            let ColIdx = this.getColumnIdx(this.ComboObj.Columns.$values, colName);

            let cellData;
            if (type === 5 || type === 11)
                cellData = this.formattedData[unFormattedRowIdx][ColIdx];// unformatted data for date or integer
            else
                cellData = RowUnformattedData[ColIdx];//this.datatable.Api.row($rowEl).data()[idx];//   formatted data
            if (type === 11 && cellData === null)///////////
                cellData = "0";
            let fval = EbConvertValue(cellData, type);
            this.columnVals[colName].push(fval);
        }
    };



    //this.addColVals = function (val = this.lastAddedOrDeletedVal) {
    //    $.each(this.ColNames, function (i, name) {
    //        let obj = getObjByval(this.datatable.ebSettings.Columns.$values, "name", name);
    //        let type = obj.Type;
    //        let $rowEl = $(`${this.DT_tbodySelector} [data-uid=${val}]`);
    //        let idx = getObjByval(this.datatable.ebSettings.Columns.$values, "name", name).data;
    //        let vmindex = $.grep(this.datatable.ebSettings.Columns.$values, function (obj) { return obj.name === this.vmName; }.bind(this))[0].data;
    //        let cellData;
    //        if (type === 5 || type === 11)
    //            cellData = this.datatable.data.filter(ro => ro[vmindex] === val)[0][idx];// unformatted data for date or integer
    //        else
    //            cellData = this.datatable.Api.row($rowEl).data()[idx];//this.datatable.Api.row($rowEl).data()[idx];//   formatted data
    //        if (type === 11 && cellData === null)///////////
    //            cellData = "0";
    //        let fval = EbConvertValue(cellData, type);
    //        this.columnVals[name].push(fval);
    //    }.bind(this));
    //};

    this.initDataTable = function () {
        this.scrollHeight = this.ComboObj.DropdownHeight === 0 ? "500px" : this.ComboObj.DropdownHeight + "px";
        let o = {};
        o.containerId = this.containerId;
        o.dsid = this.dsid;
        o.tableId = this.name + "tbl";
        o.showSerialColumn = false;
        o.showCheckboxColumn = this.ComboObj.MultiSelect;
        o.showFilterRow = true;
        o.fnDblclickCallback = this.dblClickOnOptDDEventHand.bind(this);
        //o.fnKeyUpCallback = this.xxx.bind(this);
        o.arrowFocusCallback = this.arrowSelectionStylingFcs;
        o.arrowBlurCallback = this.arrowSelectionStylingBlr;
        o.fninitComplete = this.initDTpost.bind(this);
        //o.columnSearch = this.filterArray;
        o.headerDisplay = (this.ComboObj.Columns.$values.filter((obj) => obj.bVisible === true && obj.name !== "id").length === 1) ? false : true;// (this.ComboObj.Columns.$values.length > 2) ? true : false;
        o.dom = "rti<p>";
        o.IsPaging = true;
        o.nextHTML = '<i class="fa fa-chevron-right" aria-hidden="true"></i>';
        o.previousHTML = '<i class="fa fa-chevron-left" aria-hidden="true"></i>';
        o.pageLength = this.ComboObj.DropDownItemLimit;
        o.source = "powerselect";
        o.drawCallback = this.drawCallback;
        o.hiddenFieldName = this.vmName || "id";
        o.keys = true;
        o.scrollHeight = this.scrollHeight;
        //o.hiddenFieldName = this.vmName;
        o.keyPressCallbackFn = this.DDKeyPress.bind(this);
        o.columns = this.ComboObj.Columns.$values;//////////////////////////////////////////////////////
        if (options)
            o.rendererName = options.rendererName;
        //o.getFilterValuesFn = this.getFilterValuesFn;
        o.fninitComplete4SetVal = this.fninitComplete4SetVal;
        o.fns4PSonLoad = this.onDataLoadCallBackFns;
        //o.fninitComplete = this.DTinitComplete;
        o.searchCallBack = this.searchCallBack;
        o.rowclick = this.DTrowclick;
        o.data = this.data;
        //$(document).on('preInit.dt', this.preInit);// should off in preInit after max-height set
        this.datatable = new EbBasicDataTable(o);
        this.IsDatatableInit = true;
        if (this.ComboObj.IsPreload)
            this.Applyfilter();
        this.focus1stRow();
    };

    //this.preInit = function (e, settings) {
    //    $(`#${this.name}tbl_wrapper > div.dataTables_scroll > div.dataTables_scrollBody`).css("max-height", this.scrollHeight);
    //    $(document).off('preInit.dt');
    //}.bind(this);

    this.Applyfilter = function () {
        if (this.filterArray.length > 0)
            this.datatable.Api.column(this.filterArray[0].Column + ":name").search(this.filterArray[0].Value).draw();
    };

    // init datatable
    this.DDopenInitDT = function () {
        let searchVal = this.getMaxLenVal();
        let _name = this.ComboObj.EbSid_CtxId;
        if (this.ComboObj.MinSearchLength > searchVal.length) {
            //alert(`enter minimum ${this.ComboObj.MinSearchLength} charecter in searchBox`);
            EbShowCtrlMsg(`#${_name}Container`, `#${_name}Wraper`, `Enter minimum ${this.ComboObj.MinSearchLength} characters to search`, "info");
            return;
        }
        this.getData();
    };

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
        if (this.isDestroyedDT)
            return;
        let row = datatable.row(cell.index().row);
        let $tr = $(row.nodes());
        $tr.dblclick();
    };

    this.DDEnterKeyPress = function (e, datatable, key, cell, originalEvent) {
        let row = datatable.row(cell.index().row);
        this.$curEventTargetTr = $(row.nodes()).closest("tr");
        this.SelectRow(this.$curEventTargetTr);
        this.Vobj.hideDD();
    };

    this.initDTpost = function (data) {
        $.each(this.datatable.Api.settings().init().columns, this.dataColumIterFn.bind(this));
        $(this.DTSelector + ' tbody').on('click', "input[type='checkbox']", this.checkBxClickEventHand.bind(this));//checkbox click event
    };

    this.dataColumIterFn = function (i, value) {
        if (value.name === this.vmName)
            this.VMindex = value.data;
        $.each(this.dmNames, function (j, dmName) { if (value.name === dmName) { this.DMindexes.push(value.data); } }.bind(this));
    };

    this.SelectRow = function ($tr) {
        this.curRowUnformattedData = this.getRowUnformattedData($tr);
        let vmValue = this.curRowUnformattedData[this.VMindex];

        if (this.Vobj.valueMembers.contains(vmValue))
            return;

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
            if (this.unformattedData.length === 1)
                this.Vobj.hideDD();
        }
    };

    this.clearSearchBox = function () {
        setTimeout(function () {
            this.$searchBoxes.val('');
        }.bind(this), 10);
    };

    //this.reSetColumnvals = function () {
    //    if (!event)
    //        return;
    //    let vmValue = this.lastAddedOrDeletedVal;
    //    if (event.target.nodeName === "SPAN")// if clicked tagclose
    //        vmValue = this.ClosedItem;
    //    //if (!this.ComboObj.MultiSelect)

    //    if (this.curAction == "remove") {
    //        this.removeColVals();
    //    }
    //    else {
    //        this.addColVals();
    //    }
    //};

    this.reSetColumnvals_ = function () {
        $.each(this.ColNames, function (i, name) {
            this.columnVals[name].clear();
        }.bind(this));
        for (let i = 0; i < this.Vobj.valueMembers.length; i++) {
            this.addColVals(this.Vobj.valueMembers[i]);
        }
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
        let obj = getObjByval(this.datatable.ebSettings.Columns.$values, "name", name);
        let cellData = this.datatable.Api.row(this.$curEventTargetTr).data()[obj.data];//this.datatable.Api.row($rowEl).data()[idx];//   formatted data

        if (this.maxLimit === 1)
            this.localDMS[name].shift();
        this.localDMS[name].push(cellData);
    };

    this.DTrowclick = function (e, dt, type, indexes) {
        if (!this.ComboObj.MultiSelect) {
            this.$curEventTargetTr = $(e.target).closest("tr");
            this.curRowUnformattedData = this.getRowUnformattedData(this.$curEventTargetTr);
            let vmValue = this.curRowUnformattedData[this.VMindex];
            if (!(this.Vobj.valueMembers.contains(vmValue))) {
                this.SelectRow(this.$curEventTargetTr);
            }
        }
    }.bind(this);

    //double click on option in DD
    this.dblClickOnOptDDEventHand = function (e) {
        this.$curEventTargetTr = $(e.target).closest("tr");
        this.curRowUnformattedData = this.getRowUnformattedData(this.$curEventTargetTr);
        let vmValue = this.curRowUnformattedData[this.VMindex];
        if (!(this.Vobj.valueMembers.contains(vmValue))) {
            this.SelectRow(this.$curEventTargetTr);
        }
        else {
            this.delDMs($(e.target));
            this.$curEventTargetTr.find("." + this.name + "tbl_select").prop('checked', false);
        }
    }.bind(this);

    this.toggleIndicatorBtn = function (e) {
        this.Vobj.toggleDD();
    };

    this.DDclose = function (e) {
        this.Vobj.hideDD();
    };

    //this.getSelectedRow = function () {
    //    if (!this.IsDatatableInit)
    //        return;
    //    let res = [];
    //    $.each(this.ComboObj.TempValue, function (idx, item) {
    //        let obj = {};
    //        let rowData = this.datatable.getRowDataByUid(item);
    //        let temp = this.datatable.sortedColumns;
    //        let colNames = temp.map((obj, i) => { return obj.name; });
    //        $.grep(temp, function (obj, i) {
    //            return obj.name;
    //        });
    //        $.each(rowData, function (i, cellData) {
    //            obj[colNames[i]] = cellData;
    //        });
    //        res.push(obj);
    //    }.bind(this));
    //    this.ComboObj.SelectedRow = res;
    //    return res;
    //}.bind(this);

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
        if (JSON.stringify(this.Vobj.valueMembers) === JSON.stringify(this.Values)) {
            this.Changed = false;
        }
        else
            this.Changed = true;

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
        //this.getSelectedRow();

        //setTimeout(function () {// to adjust search-block
        //    let maxHeight = Math.max.apply(null, $(".search-block .searchable").map(function () { return $(this).height(); }).get());
        //    $(".search-block .input-group").css("height", maxHeight + "px");
        //    $('#' + this.name + 'Wraper [type=search]').val("");
        //}.bind(this), 10);

        if (this.datatable === null) {
            if (this.Vobj.valueMembers.length < this.columnVals[this.dmNames[0]].length)// to manage tag close before dataTable initialization
                this.reSetColumnvals_();

        }
        else
            this.reSetColumnvals_();

        if (this.Changed)
            this.$inp.val(this.Vobj.valueMembers).trigger("change");

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
        //this.scrollIf();
        this.adjustDDposition();
        this.adjust$searchBoxAppearance(VMs);
    };

    this.adjust$searchBoxAppearance = function myfunction(VMs) {
        if (VMs.length === 0)
            this.$searchBoxes.css("min-width", "100%");
        else
            this.$searchBoxes.css("min-width", "inherit");

        if (this.maxLimit === VMs.length)
            this.$searchBoxes.hide();
        else
            this.$searchBoxes.show();
    }

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
        //if (!this.IsDatatableInit)
        //    this.DDopenInitDT();
        if (this.Vobj.DDstate)
            this.V_hideDD();
        else {
            searchVal = this.getMaxLenVal();
            //if (searchVal === "" || this.ComboObj.MinSearchLength > searchVal.length)
            //    return;
            //else
            this.V_showDD();
            this.focus1stRow();
        }

        //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },500);
    };

    this.V_hideDD = function () {
        this.RemoveRowFocusStyle();
        this.clearfilterInputs();
        this.Vobj.DDstate = false;
        this.$DDdiv.hide();
    };

    this.clearfilterInputs = function () {
        if (!this.IsDatatableInit || !this.datatable)
            return;
        this.$DDdiv.find(".eb_finput").val('');
        this.datatable.Api.columns().search("").draw(false);
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
        if (this.ComboObj.MinSearchLength > searchVal.length) {
            this.showCtrlMsg();
            return;
        }
        else
            this.hideCtrlMsg();

        if (this.$DDdiv.attr("detch_select") !== "true")
            this.appendDD2Body();
        else
            this.adjustDDposition();

        this.Vobj.DDstate = true;

        if (!this.IsDatatableInit)
            this.DDopenInitDT();
        else {
            EbMakeValid(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`);
        }

        this.V_updateCk();
        //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },520);
        this.colAdjust();
    };

    this.focus1stRow = function () {
        setTimeout(function () {
            this.RemoveRowFocusStyle();
            let $cell = $(this.DTSelector + ' tbody tr:eq(0) td:eq(0)');
            if (this.datatable && this.formattedData.length > 0) {
                this.datatable.Api.cell($cell).focus();
                this.ApplyRowFocusStyle($cell.closest("tr"));
            }
        }.bind(this), 5);
    };

    this.drawCallback = function () {
        if (this.isDestroyedDT)
            return;
        if (this.datatable)
            $('#' + this.name + 'tbl').DataTable().columns.adjust();
        if (this.formattedData.length <= this.ComboObj.DropDownItemLimit)
            this.$DDdiv.find(".dataTables_paginate.paging_simple").hide(50);
        else
            this.$DDdiv.find(".dataTables_paginate.paging_simple").show(50);
    }.bind(this);

    this.colAdjust = function () {
        setTimeout(function () {
            if (this.datatable)
                $('#' + this.name + 'tbl').DataTable().columns.adjust();
        }.bind(this), 10);
    }.bind(this);

    this.V_updateCk = function () {// API..............
        $("#" + this.ComboObj.EbSid_CtxId + 'DDdiv table:eq(1) tbody [type=checkbox]').each(function (i, chkbx) {
            let $row = $(chkbx).closest('tr');
            let datas = this.getRowUnformattedData($row);
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
        //setTimeout(function () {
        $tr.addClass('selected');
        //}, 10);
    };

    this.RemoveRowFocusStyle = function ($tr) {
        let tr = ($tr && $tr[0]) || document.querySelector(this.DTSelector + " tr.selected");
        if (tr)
            tr.classList.remove('selected');
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
        this.datatable.Api.draw(false);
    }.bind(this);

    this.getRowUnformattedData = function ($tr) {
        return this.unformattedData.filter(obj => obj[this.VMindex] == this.datatable.Api.row($tr).data()[this.VMindex].replace(/[^\d.-]/g, '') * 1)[0];
    };

    this.checkBxClickEventHand = function (e) {
        let $e = $(e.target);
        this.$curEventTargetTr = $e.closest("tr");

        this.curRowUnformattedData = this.getRowUnformattedData(this.$curEventTargetTr);
        let VMval = this.curRowUnformattedData[this.VMindex];

        if (!(this.Vobj.valueMembers.contains(VMval))) {
            if (this.maxLimit === 0 || this.Vobj.valueMembers.length !== this.maxLimit) {
                this.Vobj.valueMembers.push(VMval);
                $.each(this.dmNames, this.setDmValues.bind(this));
                $e.prop('checked', true);
                this.clearSearchBox();
            }
            else
                $e.prop('checked', false);
        }
        else {
            this.delDMs($e);
            $e.prop('checked', false);
        }
    };

    this.delDMs = function ($e) {
        let $row = $e.closest('tr');
        let datas = this.getRowUnformattedData($row);
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
        let contId = this.isDGps ? `#td_${this.ComboObj.EbSid_CtxId}` : `#cont_${this.ComboObj.EbSid_CtxId}`;// to handle special case of DG powerselect
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

    //this.bindUpdatePositionOnContScroll = function () {
    //    this.lastScrollOffset = 0;
    //    for (let i = 0; i < this.scrollableContSelectors.length; i++) {
    //        let contSelc = this.scrollableContSelectors[i];
    //        let $ctrlCont = this.isDGps ? $(`#td_${this.ComboObj.EbSid_CtxId}`) : $('#cont_' + this.name);
    //        $ctrlCont.parents(contSelc).scroll(function (event) {

    //            if (this.Vobj.DDstate)
    //                this.Vobj.hideDD();

    //            //let DDcurTop = parseFloat(this.$DDdiv.css("top"));
    //            //let curScrollOffset = $(event.target).scrollTop();
    //            ////let scrollOffsetDiff = this.lastScrollOffset - curScrollOffset;
    //            //let scrollOffsetDiff = (this.lastScrollOffset !== 0) ? (this.lastScrollOffset - curScrollOffset) : 0;
    //            //let TOP = DDcurTop + scrollOffsetDiff;
    //            //console.log("TOP: " + TOP);
    //            //this.$DDdiv.css("top", TOP);
    //            //this.lastScrollOffset = curScrollOffset;
    //        }.bind(this));
    //    }
    //};

    this.bindHideDDonScroll = function () {
        //this.lastScrollOffset = 0;
        for (let i = 0; i < this.scrollableContSelectors.length; i++) {
            let contSelc = this.scrollableContSelectors[i];
            let $ctrlCont = this.isDGps ? $(`#td_${this.ComboObj.EbSid_CtxId}`) : $('#cont_' + this.name);
            $ctrlCont.parents(contSelc).scroll(function (event) {
                if (this.Vobj.DDstate)
                    this.Vobj.hideDD();
            }.bind(this));
        }
    };

    //this.scrollIf = function () {
    //    let $ctrlCont = this.isDGps ? $(`#${this.ComboObj.EbSid_CtxId}Wraper`) : $('#cont_' + this.name);
    //    let ctrlHeight = $ctrlCont.outerHeight();
    //    if (this.lastCtrlHeight && this.lastCtrlHeight !== ctrlHeight) {
    //        let scrollParent = getScrollParent($ctrlCont[0]);
    //        if (scrollParent) {
    //            let Hdiff = this.lastCtrlHeight - ctrlHeight;
    //            $ctrlCont.scrollParent()[0].scrollTop = Hdiff;
    //        }

    //    }
    //    this.lastCtrlHeight = ctrlHeight;
    //};

    this.adjustDDposition = function () {
        let $ctrl = $('#' + this.name + 'Container');
        //let $ctrlCont = this.isDGps ? $(`#td_${this.ComboObj.EbSid_CtxId}`) : $('#cont_' + this.name);
        let $ctrlCont = this.isDGps ? $(`#${this.ComboObj.EbSid_CtxId}Wraper`) : $('#cont_' + this.name);
        let $form_div = $(document).find("[eb-root-obj-container]:first");
        let DD_height = (this.ComboObj.DropdownHeight === 0 ? 500 : this.ComboObj.DropdownHeight) + 100;

        let ctrlContOffset = $ctrlCont.offset();
        let ctrlHeight = $ctrlCont.outerHeight();
        let ctrlWidth = $ctrl.width();
        let ctrlBottom = ctrlHeight + ctrlContOffset.top;
        let formScrollTop = $form_div.scrollTop();
        let formTopOffset = $form_div.offset().top;
        let TOP = ctrlContOffset.top + formScrollTop - formTopOffset + ctrlHeight;

        let LEFT = $ctrl.offset().left - $form_div.offset().left;
        let WIDTH = (this.ComboObj.DropdownWidth === 0) ? ctrlWidth : (this.ComboObj.DropdownWidth / 100) * ctrlWidth;
        let windowWidth = $(window).width();
        let windowHeight = $(window).height();

        //if (WIDTH !== ctrlWidth)
        //    LEFT = DDoffset.left - ((WIDTH - ctrlWidth) / 2);

        if (WIDTH > windowWidth) {
            WIDTH = windowWidth - 20;
            LEFT = 10;
        }
        else if ((WIDTH + LEFT) > windowWidth)
            LEFT = ($ctrl.offset().left + ctrlWidth) - WIDTH;
        else if (LEFT < 10)
            LEFT = 10;



        if (ctrlBottom + DD_height > windowHeight) {
            this.$DDdiv.addClass("dd-ctrl-top");

            let pageHeight = $form_div.outerHeight() + formTopOffset;
            let cotrolTop = $ctrl.offset().top + formScrollTop;
            let BOTTOM = (pageHeight - cotrolTop) + 1;
            console.log("scrollTop :" + formScrollTop);
            console.log("cotrolTop :" + cotrolTop);
            this.$DDdiv.css("top", "unset");
            this.$DDdiv.css("bottom", BOTTOM);
            console.log("dd offset top :" + this.$DDdiv.offset().top);

        }
        else {
            //let Hdiff = $ctrl.offset().bottom - ctrlHeight - formTopOffset;
            //if (Hdiff >)
            //    this.$DDdiv.find("dataTables_scrollBody").css("height", this.$DDdiv.height() - )


            this.$DDdiv.css("bottom", "unset");
            this.$DDdiv.css("top", TOP);
            this.$DDdiv.removeClass("dd-ctrl-top");
        }

        this.$DDdiv.css("left", LEFT);
        this.$DDdiv.width(WIDTH);
    };

    this.appendDD2Body = function () {
        if (this.fromReloadWithParams)
            this.$DDdiv.hide();
        let $div_detach = this.$DDdiv.detach();
        $div_detach.attr({ "detch_select": true, "par_ebsid": this.name, "MultiSelect": this.ComboObj.MultiSelect, "objtype": this.ComboObj.ObjType });
        let $form_div = $(document).find("[eb-root-obj-container]:first");
        $div_detach.appendTo($form_div);
        this.adjustDDposition();
        this.bindHideDDonScroll();
        $(window).resize(function () {
            waitForFinalEvent(function () {
                if (this.Vobj.DDstate)
                    this.adjustDDposition();
            }.bind(this), 300, this.name);
        }.bind(this));
    };

    this.destroy = function (callbackFn) {

        //let t0 = performance.now();

        if (this.datatable) {
            this.datatable.Api.rows().invalidate(true);
            this.$DDdiv.remove();
            this.datatable.$dtLoaderCont.remove();
            this.isDestroyedDT = true;
            this.datatable.Api.clear(true).destroy(true);
        }
        this.Vobj.$destroy();

        //console.dev_log("PS destroy took :" + (performance.now() - t0) + " milliseconds.");
        if (callbackFn)
            callbackFn();
    };

    this.Renderselect();
};