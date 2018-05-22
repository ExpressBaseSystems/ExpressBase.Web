var EbTableVisualization = function EbTableVisualization(id, jsonObj) {
    this.$type = 'ExpressBase.Objects.EbTableVisualization, ExpressBase.Objects';
    this.EbSid = id;
    this.ObjType = 'TableVisualization';
    this.rowGrouping = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.Objects.DVRelated.DVBaseColumn, ExpressBase.Objects]], System.Private.CoreLib", "$values": [] }; this.LeftFixedColumn = 0; this.RightFixedColumn = 0; this.PageLength = 0; this.DataSourceRefId = ''; this.Description = ''; this.Columns = { "$type": "ExpressBase.Objects.Objects.DVRelated.DVColumnCollection, ExpressBase.Objects", "$values": [] }; this.DSColumns = { "$type": "ExpressBase.Objects.Objects.DVRelated.DVColumnCollection, ExpressBase.Objects", "$values": [] }; this.data = { "$type": "System.Object, System.Private.CoreLib" }; this.Pippedfrom = ''; this.IsPaged = ''; this.IsPaging = false; this.Name = id;


    this.$Control = $("            <div id='cont_@name@' Ctype='TableVisualization' class='Eb-ctrlContainer'>                <table style='width:100%' class='table table-striped' eb-type='Table' id='@name@'></table>            </div>".replace(/@id/g, this.EbSid));
    this.BareControlHtml = `<table style='width:100%' class='table table-striped' eb-type='Table' id='@name@'></table>`.replace(/@id/g, this.EbSid);
    this.DesignHtml = "            <div id='cont_@name@' Ctype='TableVisualization' class='Eb-ctrlContainer'>                <table style='width:100%' class='table table-striped' eb-type='Table' id='@name@'></table>            </div>";
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

var selectedEntity = function (vmValue, dmValues) {
    this.vmValue = vmValue;
    this.dmValues = dmValues;
};

var z = 100;

//var EbSelect = function (name, ds_id, dropdownHeight, vmName, dmNames, maxLimit, minLimit, required, servicestack_url, vmValues, ctrl) {
var EbSelect = function (ctrl) {
    //parameters   
    this.name = ctrl.name;
    this.dsid = ctrl.dataSourceId;
    this.idField = "name";
    if (!(Object.keys(ctrl.valueMember).includes("name")))//////////////////
        this.idField = "columnName";////////////////////////
    this.vmName = ctrl.valueMember[this.idField]; //ctrl.vmName;
    this.dmNames = ctrl.displayMembers.map(function (obj) { return obj[this.idField]; }.bind(this));//['acmaster1_xid', 'acmaster1_name', 'tdebit']; //ctrl.dmNames;
    this.maxLimit = ctrl.maxLimit;//ctrl.maxLimit;
    this.minLimit = ctrl.minLimit;//ctrl.minLimit;
    this.multiSelect = (ctrl.maxLimit > 1);
    this.required = ctrl.required;//ctrl.required;
    this.servicestack_url = "";//ctrl.servicestack_url;
    //this.vmValues = (ctrl.vmValues !== null) ? ctrl.vmValues : [];
    this.dropdownHeight = (ctrl.dropdownHeight === 0) ? "400" : ctrl.dropdownHeight;


    //local variables
    this.container = this.name + "Container";
    this.DTSelector = '#' + this.name + 'tbl';
    this.NoOfFields = this.dmNames.length;
    this.Vobj = null;
    this.datatable = null;
    this.clmAdjst = 0;

    this.currentEvent = null;
    this.IsDatatableInit = false;
    this.localDMS = [];
    for (i = 0; i < this.NoOfFields; i++) { this.localDMS.push([]) }
    this.VMindex = null;
    this.DMindexes = [];
    this.cellTr = null;
    this.Msearch_colName = '';
    this.cols = [];
    // functions

    //init() for event binding....
    this.init = function () {
        $('#' + this.name + 'Wraper [class=open-indicator]').hide();
        $(document).mouseup(this.hideDDclickOutside.bind(this));//hide DD when click outside select or DD &  required ( if  not reach minLimit) 
        $('#' + this.name + 'Wraper  [class=input-group-addon]').off("click").on("click", this.toggleIndicatorBtn.bind(this)); //search button toggle DD
        $('#' + this.name + 'tbl').keydown(function (e) { if (e.which === 27) this.Vobj.hideDD(); }.bind(this));//hide DD on esc when focused in DD
        $('#' + this.name + 'Wraper').on('click', '[class= close]', this.tagCloseBtnHand.bind(this));//remove ids when tagclose button clicked
        $('#' + this.name + 'Wraper [type=search]').keydown(this.SearchBoxEveHandler.bind(this));//enter-DDenabling & if'' showall, esc arrow space key based DD enabling , backspace del-valueMember updating

        //set id for searchBox
        $('#' + this.name + 'Wraper  [type=search]').each(this.srchBoxIdSetter.bind(this));


        //styles
        $('#' + this.name + 0).children().css("border-top-left-radius", "5px");
        $('#' + this.name + 0).children().css("border-bottom-left-radius", "5px");
    };

    this.srchBoxIdSetter = function (i) {
        $('#' + this.name + 'Wraper  [type=search]:eq(' + i + ')').attr('id', this.dmNames[i]);
    };

    //enter-DDenabling & if'' showall, esc arrow space key based DD enabling , backspace del-valueMember updating
    this.SearchBoxEveHandler = function (e) {
        var search = $(e.target).val().toString();
        if (e.which === 13)
            this.Vobj.showDD();
        if ((e.which === 8 || e.which === 46) && search === '' && this.Vobj.valueMembers.length > 0) {
            this.Vobj.valueMembers.pop();
            $.each(this.dmNames, this.popDmValues.bind(this));
        }
        if (e.which === 40)
            this.Vobj.showDD();
        if (e.which === 32)
            this.Vobj.showDD();
        if (e.which === 27)
            this.Vobj.hideDD();
    };

    this.popDmValues = function (i) {
        this.Vobj.displayMembers[i].pop(); //= this.Vobj.displayMembers[i].splice(0, this.maxLimit);
    };

    // init datatable
    this.InitDT = function () {
        this.IsDatatableInit = true;
        //this.EbObject = new EbObjects["EbTableVisualization"]("Container");
        //this.EbObject.DataSourceRefId = this.dsid;
        this.datatable = new EbBasicDataTable(this.dsid, "ComboBox0tbl");
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
        //    hideCheckbox: (this.multiSelect === false) ? true : false,
        //    scrollY: "200px",//this.dropdownHeight,
        //},
        //filterParams: { colName: "id", FilterValue: "ac" }, //{ id : "ac", }
        //initComplete: this.initDTpost.bind(this),
        //fnDblclickCallbackFunc: this.dblClickOnOptDDEventHand.bind(this),
        //fnKeyUpCallback:
        //fnClickCallbackFunc:
        //});
    };

    this.initDTpost = function (data) {
        $.each(this.datatable.Api.settings().init().columns, this.dataColumIterFn.bind(this));
        $(this.DTSelector + ' tbody').on('click', "input[type='checkbox']", this.checkBxClickEventHand.bind(this));//checkbox click event 
        //$('#' + this.name + '_loading-image').hide();
    };

    this.dataColumIterFn = function (i, value) {
        if (value.name === this.vmName)
            this.VMindex = value.data;

        $.each(this.dmNames, function (j, dmName) { if (value.name === dmName) { this.DMindexes.push(value.data); } }.bind(this));
    };

    //double click on option in DD
    this.dblClickOnOptDDEventHand = function (e) {
        this.currentEvent = e;
        var idx = this.datatable.Api.columns(this.vmName + ':name').indexes()[0] - 2;
        var vmValue = this.datatable.Api.row($(e.target).parent()).data()[idx];
        if (!(this.Vobj.valueMembers.contains(vmValue))) {
            if (this.maxLimit === 1) {
                this.Vobj.valueMembers = [vmValue];
                this.Vobj.hideDD();
                $.each(this.dmNames, this.setDmValues.bind(this));
            }
            else if (this.Vobj.valueMembers.length !== this.maxLimit) {
                this.Vobj.valueMembers.push(vmValue);
                $.each(this.dmNames, this.setDmValues.bind(this));
                $($(e.target).parent()).find('[type=checkbox]').prop('checked', true);
            }
        }
    };

    this.setDmValues = function (i, dmName) {
        var idx = this.datatable.Api.columns(dmName + ':name').indexes()[0] - 2;
        if (this.maxLimit === 1)
            this.localDMS[i].shift();
        this.localDMS[i].push(this.datatable.Api.row($(this.currentEvent.target).parent()).data()[idx]);
        console.log("DISPLAY MEMBER 0 a=" + this.Vobj.displayMembers[0]);
    };

    this.ajaxDataSrcfn = function (dd) {
        $('#' + this.name + '_loadingdiv').hide();
        this.clmAdjst = this.clmAdjst + 1;
        if (this.clmAdjst < 3)
            setTimeout(function () {
                $('#' + this.name + 'tbl').DataTable().columns.adjust().draw();
                console.log('le().columns.adjust()');
            }, 520);
        setTimeout(function () { this.Vobj.updateCk(); }.bind(this), 1);
        return dd.data;
    };

    this.toggleIndicatorBtn = function (e) {
        this.Vobj.toggleDD();
    };

    this.Renderselect = function () {
        this.Vobj = new Vue({
            el: '#' + this.name + 'Container',
            data: {
                options: [],
                displayMembers: this.localDMS,
                valueMembers: [],
                DDstate: false
            },
            watch: {
                valueMembers: this.V_watchVMembers.bind(this),
            },
            methods: {
                toggleDD: this.V_toggleDD.bind(this),
                showDD: this.V_showDD.bind(this),
                hideDD: function () { this.DDstate = false; },
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
        $("#" + this.name).val(this.Vobj.valueMembers);
        ////single select
        //if (this.maxLimit === 1 && VMs.length > 1) {
        //    this.Vobj.valueMembers = this.Vobj.valueMembers.splice(1, 1);////
        //    $.each(this.dmNames, this.trimDmValues.bind(this));
        //}
        ////max limit
        //else if (VMs.length > this.maxLimit) {
        //    this.Vobj.valueMembers = this.Vobj.valueMembers.splice(0, this.maxLimit);
        //    $.each(this.dmNames, this.trimDmValues.bind(this));
        //}
        console.log("VALUE MEMBERS =" + this.Vobj.valueMembers);
        console.log("DISPLAY MEMBER 0 =" + this.Vobj.displayMembers[0]);
        console.log("DISPLAY MEMBER 1 =" + this.Vobj.displayMembers[1]);
        console.log("DISPLAY MEMBER 3 =" + this.Vobj.displayMembers[2]);
    };

    //this.trimDmValues = function (i) {
    //    if (this.maxLimit === 1) {   //single select
    //        this.Vobj.displayMembers[i].shift(); //= this.Vobj.displayMembers[i].splice(1, 1);
    //    }
    //    else {                        //max limit
    //        this.Vobj.displayMembers[i].pop(); //= this.Vobj.displayMembers[i].splice(0, this.maxLimit);
    //    }
    //};

    this.V_toggleDD = function (e) {
        if (!this.IsDatatableInit)
            this.InitDT();
        this.Vobj.DDstate = !this.Vobj.DDstate;
        //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },500);
    };

    this.V_showDD = function () {
        if (!this.IsDatatableInit)
            this.InitDT();
        this.Vobj.DDstate = true;
        //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },520);
        //setTimeout(this.colAdjust, 520);
    };

    //this.colAdjust = function () { $('#' + this.name + 'tbl').DataTable().columns.adjust().draw(); }

    this.V_updateCk = function () {// API..............
        console.log("colAdjust---------- ");
        //$(this.container + ' table:eq(1) tbody [type=checkbox]').each(function (i) {
        //    var row = $(this).closest('tr');
        //    var datas = $(this.DTselector).DataTable().row(row).data();
        //    if (this.Vobj.valueMembers.contains(datas[this.VMindex]))
        //        $(this).prop('checked', true);
        //    else
        //        $(this).prop('checked', false);
        //});
        // raise error msg
        setTimeout(this.RaiseErrIf.bind(this), 30);
    };

    this.RaiseErrIf = function () {
        if (this.Vobj.valueMembers.length !== this.Vobj.displayMembers[0].length) {
            alert('valueMember and displayMembers length miss match found !!!!');
            console.error('valueMember and displayMembers length miss match found !!!!');
            console.log('valueMembers=' + this.Vobj.valueMember);
            console.log('displayMembers1=' + this.Vobj.displayMembers1);
        }
    };

    this.arrowSelectionStylingBlr = function (e, datatable, cell) {
        var row = datatable.row(cell.index().row);
        $(row.nodes()).css('color', '#333');
        $(row.nodes()).css('font-weight', 'normal');
        $(row.nodes()).removeClass('selected');
    };

    this.arrowSelectionStylingFcs = function (e, datatable, cell, originalEvent) {
        var row = datatable.row(cell.index().row);
        //this.cellTr = row.nodes();
        $(row.nodes()).css('color', '#000');
        $(row.nodes()).css('font-weight', 'bold');
        $(row.nodes()).find('.focus').removeClass('focus');
        $(row.nodes()).addClass('selected');
    };

    this.tagCloseBtnHand = function (e) {
        $(this.DTSelector + ' [type=checkbox][value=' + this.Vobj.valueMembers.splice(delid(), 1) + ']').prop("checked", false);
        $.each(this.dmNames, function (i) { this.Vobj.displayMembers[i].splice(delid(), 1); }.bind(this));
    };

    this.checkBxClickEventHand = function (e) {
        var indx; this.currentEvent = e; var $row = $(e.target).closest('tr');
        $.each(this.datatable.Api.settings().init().columns, function (j, value) { if (value.columnName === 'id') { indx = value.columnIndex; return false; } });
        var datas = $(this.DTSelector).DataTable().row($row).data();
        if (!(this.Vobj.valueMembers.contains(datas[this.VMindex]))) {
            if (!(this.Vobj.valueMembers.length === this.maxLimit)) {
                this.Vobj.valueMembers.push(datas[this.VMindex]);
                $.each(this.dmNames, this.setDmValues.bind(this));
                $(this.currentEvent.target).prop('checked', true);
            }
            else
                $(this.currentEvent.target).prop('checked', false);
        }
        else {
            var vmIdx2del = this.Vobj.valueMembers.indexOf(datas[this.VMindex]);
            this.Vobj.valueMembers.splice(vmIdx2del, 1);
            $.each(this.dmNames, function (i) { this.Vobj.displayMembers[i].splice(vmIdx2del, 1); }.bind(this));
            $(this.currentEvent.target).prop('checked', false);
        }
    };

    this.hideDDclickOutside = function (e) {
        var container = $('#' + this.name + 'DDdiv');
        var container1 = $('#' + this.name);
        if ((!container.is(e.target) && container.has(e.target).length === 0) && (!container1.is(e.target) && container1.has(e.target).length === 0)) {
            this.Vobj.hideDD();/////
            if (this.Vobj.valueMembers.length < this.minLimit && this.minLimit !== 0) {
                document.getElementById(this.dmNames[0]).setCustomValidity('This field  require minimum ' + this.minLimit + ' values');

            }
            else {
                if (this.required && this.Vobj.valueMembers.length === 0) {
                    document.getElementById(this.dmNames[0]).setCustomValidity('This field  is required');
                }
                else
                    document.getElementById(this.dmNames[0]).setCustomValidity('');

            }
        }
    };

    this.Renderselect();
};