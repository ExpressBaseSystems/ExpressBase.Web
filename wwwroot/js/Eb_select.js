var selectedEntity = function (vmValue, dmValues) {
    this.vmValue = vmValue;
    this.dmValues = dmValues;
};

var z = 100;

var EbSelect = function (name, ds_id, dropdownHeight, vmName, dmNames, maxLimit, minLimit, required, servicestack_url, vmValues) {
    //parameters   
    this.name = name;
    this.dsid = ds_id;
    this.vmName = 'id'; //vmName;
    this.dmNames = ['acmaster1_xid', 'acmaster1_name', 'tdebit']; //dmNames;
    this.maxLimit = 3;//maxLimit;
    this.minLimit = minLimit;
    this.multiSelect = (this.maxLimit > 1);
    this.required = required;
    this.servicestack_url = servicestack_url;
    this.vmValues = (vmValues !== null) ? vmValues : [];
    this.dropdownHeight = dropdownHeight;

    //local variables
    this.container = this.name + "Container";
    this.DTSelector = '#' + this.name + 'tbl';
    this.NoOfFields = this.dmNames.length;
    this.Vobj = null;
    this.datatable = null;
    this.clmAdjst = 0;

    // TEMP
    this.currentEvent = null;

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
        //$('#' + this.container + ' [class=open-indicator]').hide();
        $('#' + this.container + ' [class=open-indicator]').off("click").on("click", this.toggleIndicatorBtn.bind(this)); //toggle indicator button
        $('#' + this.name + 'tbl').keydown(function (e) { if (e.which == 27) this.Vobj.hideDD(); }.bind(this));//hide DD on esc when focused in DD
        $('#' + this.container).on('click', '[class= close]', this.tagCloseBtnHand.bind(this));//remove ids when tagclose button clicked
    };

    // init datatable
    this.InitDT = function () {
        //$('#' + this.name + '_loading-image').show();
        //$('#' + this.name + '_loadingdiv').show();
        this.datatable = new EbDataTable({
            ds_id: this.dsid,
            tid: this.name + 'tbl',
            ss_url: "https://expressbaseservicestack.azurewebsites.net",
            directLoad: true,
            settings: {
                hideCheckbox: (this.multiSelect === false),
                scrollY: this.dropdownHeight,
            },
            initComplete: this.initDTpost.bind(this),
            fnDblclickCallbackFunc: this.dblClickOnOptDDEventHand.bind(this),
            //fnKeyUpCallback:
            //fnClickCallbackFunc:
        });
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
            this.localDMS[i] = [];
        //console.log("DISPLAY MEMBER 0 b =" + this.Vobj.displayMembers[0]);
        this.localDMS[i].push(this.datatable.Api.row($(this.currentEvent.target).parent()).data()[idx]);
        //console.log("DISPLAY MEMBER 0 a=" + this.Vobj.displayMembers[0]);
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
                id: this.name,
                DDstate: false
            },
            watch: {
                valueMembers: this.V_watchVMembers.bind(this),
            },
            methods: {
                toggleDD: this.V_toggleDD.bind(this),
                showDD: this.V_showDD,
                hideDD: function () { this.DDstate = false; },
                updateCk: this.V_updateCk
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
        if (!this.DtFlag) {
            this.InitDT();
            this.DtFlag = true;
        }
        this.Vobj.DDstate = !this.Vobj.DDstate;
        //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },500);
    };

    this.V_showDD = function () {
        if (this.DtFlag) { this.DtFlag = true; InitDT(); }
        this.Vobj.DDstate = true;
        //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },520);
        setTimeout(this.colAdjust, 520);
    };

    this.colAdjust = function () { $('#' + this.name + 'tbl').DataTable().columns.adjust().draw(); }

    this.V_updateCk = function () {// API..............
        var self = this;
        $(this.container + ' table:eq(1) tbody [type=checkbox]').each(function (i) {
            var row = $(this).closest('tr');
            var datas = $(this.DTselector).DataTable().row(row).data();
            if (self.Vobj.valueMembers.contains(datas[self.VMindex]))
                $(this).prop('checked', true);
            else
                $(this).prop('checked', false);
        });
        // raise error msg
        setTimeout(this.RaiseErrIf, 30);
    };

    this.RaiseErrIf = function () {
        if (this.Vobj.valueMember.length !== this.Vobj.displayMembers[0].length) {
            alert('valueMember and displayMembers length miss match found !!!!');
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
        this.Vobj.valueMembers.splice(delid(), 1);
        $.each(this.dmNames, function (i) {
            this.Vobj.displayMembers[i].splice(delid(), 1);
        }.bind(this));
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

    this.Renderselect();

}