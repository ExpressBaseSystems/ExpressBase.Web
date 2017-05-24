var EbSelect = function (name, dataSourceId, dropdownHeight, valueMember, displayMember, maxLimit, minLimit,
                        multiSelect, required, defaultSearchFor, DMembers, vueDMcode, servicestack_url, values) {
    //parameters   
    this.name = name;
    this.dataSourceId = dataSourceId;
    this.dropdownHeight = dropdownHeight;
    this.values = values;
    this.valueMember = valueMember;
    this.displayMember = displayMember;
    this.maxLimit = maxLimit;
    this.minLimit = minLimit;
    this.multiSelect = multiSelect;
    this.required = required;
    this.defaultSearchFor = defaultSearchFor;
    this.DMembers = ['acmaster1_name', 'tdebit', 'tcredit'];//DMembers;
    this.vueDMcode = vueDMcode;
    this.servicestack_url = servicestack_url;
    this.extSettings = null;

    //local variables
    this.container = this.name + "Container";
    this.DTSelector = '#' + this.name + 'tbl';
    this.Vobj = null;
    this.datatable = null;
    this.clmAdjst = 0;
    this.VMindex = null;
    this.DMindex = null;
    this.DMindexes = [];
    this.DtFlag = false;
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
       // $.post(this.servicestack_url + '/ds/columns/' + this.dataSourceId + '', { format: 'json', Token: getToken() }, this.initDTpost.bind(this));
        $.post('GetTVPref4User', { dsid: this.dsid }, this.initDTpost.bind(this));
    };

    this.dataColumIterFn = function (i, value) {
        if (value.columnName == this.valueMember)
            this.VMindex = value.columnIndex;

        $.each(this.DMembers, function (j, v) { if (value.columnName == v) { this.DMindexes.push(value.columnIndex); } }.bind(this));

        if (value.columnName == this.displayMember)
            this.DMindex = value.columnIndex;
        //this.cols.push({ data: value.columnIndex, title: value.columnName, visible: true, name: value.columnName, type: value.Type });
    };

    this.init44 = function () {
        alert(this.extSettings.columns);
        this.cols = this.extSettings.columns;
        this.datatable = new EbDataTable({
            ds_id: this.dataSourceId,
            tid: this.name + 'tbl',
            ss_url: "https://expressbaseservicestack.azurewebsites.net",
            directLoad: true,
            settings: {
                hideCheckbox: false,
                scrollY: 456, //this.dropdownHeight,
                columns: this.cols
            },
            //fnKeyUpCallback:
            //fnClickCallbackFunc:
            //fnDblclickCallbackFunc:
        });

        //double click  option in DD
        $('#' + this.name + 'tbl tbody').on('dblclick', 'tr', this.dblClickOnOptDDEventHand.bind(this));
    };

    this.initDTpost = function (data) {
        //alert(data);
        this.extSettings = JSON.parse(data);
        var searchTextCollection = [];
        var search_colnameCollection = [];
        var order_colname = '';
        if (data != null) {
            $.each(this.extSettings.columns, this.dataColumIterFn.bind(this));
            setTimeout(this.init44.bind(this), 100);
        }

        //this.datatable =  $('#' + this.name + 'tbl').DataTable({
        //    keys: true,
        //    dom: 'rti',
        //    autoWidth: true,
        //    scrollX: true,
        //    scrollY: this.dropdownHeight,
        //    serverSide: true,
        //    columns: this.cols,
        //    deferRender: true,
        //    order: [],
        //    paging: false,
        //    select: true,
        //    keys: true,
        //    drawCallback: function (settings) {
        //        //setTimeout(function(){ $('#' + this.name + 'tbl').DataTable().columns.adjust(); },500);
        //        $('#' + this.name + 'container table:eq(0) thead th:eq(0)').removeClass('sorting');
        //    },
        //    ajax: {
        //        url: this.servicestack_url + '/ds/data/' + this.dataSourceId,
        //        type: 'POST',
        //        data: function (dq) {
        //            delete dq.columns;
        //            dq.Id = this.dataSourceId;
        //            dq.Token = getToken();
        //            if (search_colnameCollection.length !== 0) {
        //                dq.search_col = '';
        //                $.each(search_colnameCollection, function (i, value) {
        //                    if (dq.search_col == '')
        //                        dq.search_col = value;
        //                    else
        //                        dq.search_col = dq.search_col + ',' + value;
        //                });
        //            }
        //            if (order_colname !== '')
        //                dq.order_col = order_colname;
        //            if (searchTextCollection.length != 0) {
        //                dq.searchtext = '';
        //                $.each(searchTextCollection, function (i, value) {
        //                    if (dq.searchtext == '')
        //                        dq.searchtext = value;
        //                    else
        //                        dq.searchtext = dq.searchtext + ',' + value;
        //                });
        //            }
        //            if (this.Msearch_colName !== '')
        //                dq.Msearch_colName = this.Msearch_colName;
        //        },
        //        dataSrc: this.ajaxDataSrcfn.bind(this)
        //    }
        //});


        //selection highlighting css on arrow keys
        //this.datatable.on('key-focus', this.arrowSelectionStylingFcs);// no need to bind 'this'
        //this.datatable.on('key-blur', this.arrowSelectionStylingBlr);// no need to bind 'this'
    };

    this.dblClickOnOptDDEventHand = function (e) {
        var Vmember = $('#' + this.name + 'tbl').DataTable().row($(e.target)).data()[this.VMindex];
        var Dmember = $('#' + this.name + 'tbl').DataTable().row($(e.target)).data()[this.DMindex];
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
        //if (!this.DtFlag) {
        //    this.DtFlag = true;
        //    this.InitDT();
        //}
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
        alert("this.dataSourceId: " + this.dataSourceId);
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