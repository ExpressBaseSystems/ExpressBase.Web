var EbSelect = function (name, ds_id, vmName, dmNames, maxLimit, minLimit, required, servicestack_url, vmValues, dropdownHeight) {
    //parameters   
    this.name = name;
    this.dsid = ds_id;
    this.vmName = 'id'; //vmName;
    this.dmNames = ['acmaster1_xid', 'acmaster1_name']; //dmNames;
    this.maxLimit = maxLimit;
    this.minLimit = minLimit;
    this.required = required;
    this.servicestack_url = servicestack_url;
    this.vmValues = vmValues;
    this.dropdownHeight = dropdownHeight;

    //local variables
    this.container = this.name + "Container";
    this.DTSelector = '#' + this.name + 'tbl';
    this.NoOfFields = this.dmNames.length;
    this.Vobj = null;
    this.datatable = null;
    this.clmAdjst = 0;
    this.VMindex = null;
    this.DMindex = null;
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
    };

    // init datatable
    this.InitDT = function () {
        $('#' + this.name + '_loading-image').show();
        $('#' + this.name + '_loadingdiv').show();
        this.datatable = new EbDataTable({
            ds_id: this.dsid,
            tid: this.name + 'tbl',
            ss_url: "https://expressbaseservicestack.azurewebsites.net",
            directLoad: true,
            settings: {
                hideCheckbox: false,
                scrollY: this.dropdownHeight,
            },
            initComplete: this.initDTpost.bind(this),
            //fnDblclickCallbackFunc:            
            //fnKeyUpCallback:
            //fnClickCallbackFunc:
        });
        //double click  option in DD
        $('#' + this.name + 'tbl tbody').on('dblclick', 'tr', this.dblClickOnOptDDEventHand.bind(this));
    };

    this.initDTpost = function (data) {
        $.each(this.datatable.Api.settings().init().columns, this.dataColumIterFn.bind(this));

        //selection highlighting css on arrow keys
        //this.datatable.on('key-focus', this.arrowSelectionStylingFcs);// no need to bind 'this'
        //this.datatable.on('key-blur', this.arrowSelectionStylingBlr);// no need to bind 'this'
    };

    this.dataColumIterFn = function (i, value) {
        if (value.name === this.valueMember)
            this.VMindex = value.data;
        else if (value.name === this.displayMember)
            this.DMindex = value.data;

        $.each(this.DMembers, function (j, v) { if (value.name == v) { this.DMindexes.push(value.data); } }.bind(this));
    };

    this.dblClickOnOptDDEventHand = function (e) {
        var Vmember = this.datatable.row($(e.target)).data()[this.VMindex];
        var Dmember = this.datatable.row($(e.target)).data()[this.DMindex];
        if (!(this.Vobj.valueMembers.contains(Vmember))) {
            this.Vobj.displayMembers.push(Dmember);
            this.Vobj.valueMembers.push(Vmember);
            $(e.target).find('[type=checkbox]').prop('checked', true);
            this.dblClickOnOptIterfn.bind(this, e);
        }
    };

    this.dblClickOnOptIterfn = function (e) {/// now working
        $.each(this.DMindexes, function (i, v) {
            alert("i:" + i);
            alert("v:" + v);
            alert("e.target:" + e.target);
            alert("this.DMindexes:" + this.DMindexes);
            console.log("this.Vobj.displayMembers1:" + this.Vobj.displayMembers1);
            eval('this.Vobj.displayMembers' + (i + 1) + '.push( $(\'#' + this.name + 'tbl\').DataTable().row($(e.target)).data()[v] );');
        }.bind(this))
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
                displayMembers: [],
                valueMembers: [],
                //this.vueDMcode
                displayMembers1: [],
                displayMembers2: [],
                displayMembers3: [],
                id: this.name,
                DDstate: false
            },
            watch: {
                valueMembers: this.V_watchVMembers,
            },
            methods: {
                toggleDD: this.V_toggleDD.bind(this),
                showDD: this.V_showDD,
                hideDD: function () { this.DDstate = false; },
                updateCk: this.V_updateCk
            }
        });
    };

    //init Vselect
    this.initVselect = function () {
        this.Vobj.valueMembers = this.values;
        this.Vobj.displayMembers;//= find...
        //hiding v-select native DD
        $('#' + this.container + ' [class=expand]').css('display', 'none');
    };

    //single select & max limit
    this.V_watchVMembers = function (val) {
        //single select
        if (this.maxLimit === 1 && !this.multiSelect && val.length > 1) {
            this.Vobj.valueMembers = this.Vobj.valueMembers.splice(1, 1);////
            $.each(this.DMindexes, function (i, v) {
                eval('this.Vobj.displayMembers' + (i + 1) + '= this.Vobj.displayMembers' + (i + 1) + '.splice( 1, 1);');
            });
        }
            //max limit
        else if (val.length > this.maxLimit) {
            this.Vobj.valueMembers = this.Vobj.valueMembers.splice(0, this.maxLimit);
            $.each(this.DMindexes, function (i, v) {
                eval('this.Vobj.displayMembers' + (i + 1) + '= this.Vobj.displayMembers' + (i + 1) + '.splice( 0, this.maxLimit);');
            });
        }
    };

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

    this.V_updateCk = function () {
        var self = this;
        $('#' + this.name + 'container table:eq(1) tbody [type=checkbox]').each(function (i) {
            var row = $(this).closest('tr');
            var datas = $('#' + this.name + 'tbl').DataTable().row(row).data();
            if (self.Vobj.valueMembers.contains(datas[self.VMindex]))
                $(this).prop('checked', true);
            else
                $(this).prop('checked', false);
        });
        // raise error msg
        setTimeout(this.RaiseErr, 30);
    };

    this.RaiseErr = function () {
        if (this.Vobj.valueMember.length !== this.Vobj.displayMembers1.length) {
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

    this.Test = function () {
        alert("this.name:" + this.name);
        alert("this.dataSourceId: " + this.dsid);
        alert("this.dropdownHeight: " + this.dropdownHeight);
        alert("this.valueMember: " + this.valueMember);
        alert("this.displayMember: " + this.displayMember);
        alert("this.maxLimit: " + this.maxLimit);
        alert("this.minLimit: " + this.minLimit);
        alert("this.required: " + this.required);
        alert("this.defaultSearchFor:" + this.defaultSearchFor);
        alert("this.DMembers: " + this.DMembers);
        alert("this.vueDMcode: " + this.vueDMcode);
        alert("this.servicestack_url: " + this.servicestack_url);
    };

    //this.Test();

    this.Renderselect();

    this.init();

}