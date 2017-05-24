var EbSelect = function (name, dataSourceId, dropdownHeight, valueMember, displayMember, maxLimit, minLimit, multiSelect, required, defaultSearchFor, DMembers, vueDMcode, servicestack_url) {
    this.clmAdjst = 0;
    this.VMindex = null;
    this.DMindex = null;
    this.DMindexes = [];
    this.displayMember1 = [];
    this.DtFlag = false;
    this.cellTr = null;
    this.Msearch_colName = '';

    this.name = name;
    this.dataSourceId = dataSourceId;
    this.dropdownHeight = dropdownHeight;
    this.valueMember = valueMember;
    this.displayMember = displayMember;
    this.maxLimit = maxLimit;
    this.minLimit = minLimit;
    this.multiSelect = multiSelect;
    this.required = required;
    this.defaultSearchFor = defaultSearchFor;
    this.DMembers = "['acmaster1_name', 'tdebit', 'tcredit']";//DMembers;
    this.vueDMcode = vueDMcode;
    this.servicestack_url = servicestack_url;
    this.Vobj = null;

    this.datatable = null;
    this.InitDT = function () {
        alert("hiiihi");
        $('#' + this.name + '_loading-image').show();
        $.post(this.servicestack_url + '/ds/columns/' + this.dataSourceId + '', { format: 'json', Token: getToken() }, this.initDTpost.bind(this));
    };

    this.initDTpost = function (data) {
        var searchTextCollection = [];
        var search_colnameCollection = [];
        var order_colname = '';
        var cols = [];
        if (data != null) {
            $.each(data.columns, this.dataColumIterFn.bind(this));
        }

        this.datatable = $('#' + this.name + 'tbl').DataTable(
        {
            keys: true,
            dom: 'rti',
            autoWidth: true,
            scrollX: true,
            scrollY: this.dropdownHeight,
            serverSide: true,
            columns: cols,
            deferRender: true,
            order: [],
            paging: false,
            select: true,
            keys: true,
            drawCallback: function (settings) {
                //setTimeout(function(){ $('#' + this.name + 'tbl').DataTable().columns.adjust(); },500);
                $('#' + this.name + 'container table:eq(0) thead th:eq(0)').removeClass('sorting');
            },
            ajax: {
                url: this.servicestack_url + '/ds/data/' + this.dataSourceId,
                type: 'POST',
                data: function (dq) {
                    delete dq.columns;
                    dq.Id = this.dataSourceId;
                    dq.Token = getToken();
                    if (search_colnameCollection.length !== 0) {
                        dq.search_col = '';
                        $.each(search_colnameCollection, function (i, value) {
                            if (dq.search_col == '')
                                dq.search_col = value;
                            else
                                dq.search_col = dq.search_col + ',' + value;
                        });
                    }
                    if (order_colname !== '')
                        dq.order_col = order_colname;
                    if (searchTextCollection.length != 0) {
                        dq.searchtext = '';
                        $.each(searchTextCollection, function (i, value) {
                            if (dq.searchtext == '')
                                dq.searchtext = value;
                            else
                                dq.searchtext = dq.searchtext + ',' + value;
                        });
                    }
                    if (this.Msearch_colName !== '')
                        dq.Msearch_colName = this.Msearch_colName;
                },
                dataSrc: this.ajaxDataSrcfn.bind(this)
            }
        });
        //delayed search on combo searchbox
        $('#' + this.name + 'container [type=search]').keyup($.debounce(500, this.delayedSearchEventHand.bind(this)));

        //double click  option in DD
        $('#' + this.name + 'tbl tbody').on('dblclick', 'tr', this.dblClickOnOptDDEventHand.bind(this));//^^

        //checkbox click event
        $('#' + this.name + 'tbl tbody').on('click', 'input[type=\'checkbox\']', this.checkBxClickEventHand.bind(this));

        //hiding v-select native DD
        $('#' + this.name + 'container [class=expand]').css('display', 'none');//^^

        //hide DD on esc when focused in DD
        $('#' + this.name + 'tbl').keydown(function (e) { if (e.which == 27) this.Vobj.hideDD(); });//^^

        //selection highlighting css on arrow keys
        this.datatable.on('key-focus', this.arrowSelectionStylingFcs);// no need to bind 'this'  ^^^

        this.datatable.on('key-blur', this.arrowSelectionStylingBlr);// no need to bind 'this'  ^^

        //space & enter on option in DD
        this.datatable.on('key', this.spaceEnterOnOpt.bind(this));

        //filter textbox adding
        $('#' + this.name + 'container table:eq(0) thead').append($('#' + this.name + 'container table:eq(0) thead tr').clone());
        $('#' + this.name + 'container table:eq(0) thead tr:eq(1) th').each(function (i) {
            $(this).removeClass('sorting');
            $(this).css('outline', 'none');
            $(this).css('padding', '2px 1px');
            //$(this).css('background-color', '#fafaff');
            var title = $(this).text();
            var idd = 'header_txt1' + title;
            var t = '<span hidden>' + title + '</span>';
            var idx = i;
            if (idx !== 0 || !this.multiSelect) {
                if (!this.multiSelect)
                    idx = i + 1;
                if (data.columns[idx].type == 'System.Int32, System.Private.CoreLib' || data.columns[idx].type == 'System.Int16, System.Private.CoreLib')
                    $(this).html(t + '<input type=\'number\' id=' + idd + ' style=\'width: 100%\'/>');
                else if (data.columns[idx].type == 'System.String, System.Private.CoreLib')
                    $(this).html(t + '<input type=\'text\' id=' + idd + '/>');
                else if (data.columns[idx].type == 'System.DateTime, System.Private.CoreLib')
                    $(this).html(t + '<input type=\'date\' id=' + idd + ' style=\'width: 100%\'>');
                else if (data.columns[idx].type == 'System.Decimal, System.Private.CoreLib')
                    $(this).html(t + '<input type=\'number\' id=' + idd + ' style=\'width: 100%\'/>');
                else
                    $(this).html(t + '');
            }
        });

        //searching  on filters
        $('#' + this.name + 'container table:eq(0) thead tr:eq(1) th').on('keyup', 'input', this.searchOnFilters.bind(this));

        //sorting when click on columnheader
        $('#' + this.name + 'container table:eq(0) thead tr:eq(0)').on('click', 'th', this.sortClickColHdr.bind(this));
    };

    this.dataColumIterFn = function (i, value) {
        _v = true;
        _c = 'dt-left';
        if (value.columnName == 'id')
            _v = false;
        if (value.columnName == this.valueMember)
            this.VMindex = value.columnIndex;

        $.each(DMembers, this.DMemberIterfn.bind(this));

        if (value.columnName == this.displayMember)
            this.DMindex = value.columnIndex;
        if (value.columnIndex == 0 && this.multiSelect)
            cols.push({ 'data': null, 'render': function (data, type, row) { return '<input type=\'checkbox\'>' } });
        switch (value.type) {
            case 'System.Int32, System.Private.CoreLib': _c = 'dt-right'; break;
            case 'System.Decimal, System.Private.CoreLib': _c = 'dt-right'; break;
            case 'System.Int16, System.Private.CoreLib': _c = 'dt-right'; break;
            case 'System.DateTime, System.Private.CoreLib': _c = 'dt-center'; break;
            case 'System.Boolean, System.Private.CoreLib': _c = 'dt-center'; break;
        }
        cols.push({ data: value.columnIndex, className: _c, title: value.columnName, visible: _v });
    };

    this.DMemberIterfn = function (j, v) {
        if (value.columnName == v) {
            alert("this.DMindexes:" + this.DMindexes);
            this.DMindexes.push(value.columnIndex);
        }
    };

    this.ajaxDataSrcfn = function (dd) {
        $('#' + this.name + '_loading-image').hide();
        this.clmAdjst = this.clmAdjst + 1;
        if (this.clmAdjst < 3)
            setTimeout(function () {
                $('#' + this.name + 'tbl').DataTable().columns.adjust().draw();
                console.log('le().columns.adjust()');
            }, 520);
        setTimeout(function () { this.Vobj.updateCk(); }.bind(this), 1);
        return dd.data;
    };

    this.searchOnFilters = function (e) {
        if (e.which === 13) {
            searchTextCollection = [];
            search_colnameCollection = [];
            $('#' + this.name + 'container table:eq(0) thead tr:eq(1) th input').each(function (idx) {
                if ($(e.target).val().toString().trim() !== '') {
                    if ($.inArray($(e.target).siblings().text(), search_colnameCollection) == -1) {
                        searchTextCollection.push($(e.target).val());
                        search_colnameCollection.push($(e.target).siblings().text());
                    }
                }
            });
            $('#' + this.name + 'tbl').DataTable().ajax.reload();
            setTimeout(function () { this.Vobj.updateCk(); }, 1);
        }
    };

    this.sortClickColHdr = function (e) {
        var txt = $(e.target).text();
        if (txt !== '')
            order_colname = txt;
        $('#' + this.name + 'tbl').DataTable().draw();
    };

    this.delayedSearchEventHand = function (e) {
        if (isPrintable(e.which)) {
            var search = $(e.target).val().toString();
            if (search.trim() !== '' && this.DtFlag) {
                if (!search.startsWith('*') && !search.endsWith('*')) {
                    if (this.defaultSearchFor === 'BeginingWithKeyword')
                        search = search + '%';
                    else if (this.defaultSearchFor === 'EndingWithKeyword')
                        search = '%' + search;
                    else if (this.defaultSearchFor === 'ExactMatch')
                        search = search;
                    else if (this.defaultSearchFor === 'Contains')
                        search = '%' + search + '%';
                }
                else if (search.startsWith('*') && !search.endsWith('*'))
                    search = '%' + search.slice(1);
                else if (!search.startsWith('*') && search.endsWith('*'))
                    search = search.slice(0, -1) + '%';
                else if (search.startsWith('*') && search.endsWith('*'))
                    search = '%' + search.slice(1, -1) + '%';
                //to update filter values   
                searchTextCollection = [];
                search_colnameCollection = [];
                $('#' + this.name + 'container table:eq(0) thead tr:eq(1) th input').each(function (idx) {
                    if ($(this).val().toString().trim() !== '') {
                        if ($.inArray($(this).siblings().text(), search_colnameCollection) == -1) {
                            searchTextCollection.push($(this).val());
                            search_colnameCollection.push($(this).siblings().text());
                        }
                    }
                });
                //
                this.Msearch_colName = DMembers[e.target.id.replace(this.name + 'srch', '')];// -1
                $('#' + this.name + 'tbl').DataTable().search(search).draw(); console.log('this.Msearch_colName');
                $('#' + this.name + '_loading-image').show();
            }
        }
    };

    this.spaceEnterOnOpt = function (e, datatable, cell, originalEvent) {
        if (e.which === 13 || e.which === 32) {
            alert("spaceEnterOnOpt : ");
            //alert("originalEvent.cellTr: " + originalEvent.cellTr);
            //var Vmember = $('#' + this.name + 'tbl').DataTable().row($(this.cellTr)).data()[this.VMindex];
            //var Dmember = $('#' + this.name + 'tbl').DataTable().row($(this.cellTr)).data()[this.DMindex];
            var _row = this.datatable.row(cell.index().row);
            alert(_row.data());
            var Vmember = _row.data()[this.VMindex];
            var Dmember = _row.data()[this.DMindex];
            if (!(this.Vobj.valueMember.contains(Vmember))) {
                this.Vobj.displayMember.push(Dmember);
                this.Vobj.valueMember.push(Vmember);
                $(_row).find('[type=checkbox]').prop('checked', true);
                $.each(this.DMindexes, function (i, v) {
                    eval('this.Vobj.displayMember' + (i + 1) + '.push( $(\'#' + this.name + 'tbl\').DataTable().row(self).data()[v] );');
                }.bind(this));
            }
        }
    }

    this.arrowSelectionStylingBlr = function (e, datatable, cell) {
        var row = datatable.row(cell.index().row);
        $(row.nodes()).css('color', '#333');
        $(row.nodes()).css('font-weight', 'normal');
        $(row.nodes()).removeClass('selected');
    };//^^

    this.arrowSelectionStylingFcs = function (e, datatable, cell, originalEvent) {

        alert("arrowSelectionStylingFcs");
        var row = datatable.row(cell.index().row);
        //this.cellTr = row.nodes();
        $(row.nodes()).css('color', '#000');
        $(row.nodes()).css('font-weight', 'bold');
        $(row.nodes()).find('.focus').removeClass('focus');
        $(row.nodes()).addClass('selected');
    };//^^

    this.tagCloseBtnHand = function (e) {
        this.Vobj.valueMember.splice(delid(), 1);
        $.each(this.DMindexes, function (i, v) {
            eval('this.Vobj.displayMember' + (i + 1) + '.splice( delid(), 1);');
        }.bind(this));
    };

    this.dblClickOnOptDDEventHand = function (e) {
        var Vmember = $('#' + this.name + 'tbl').DataTable().row($(e.target)).data()[this.VMindex];
        var Dmember = $('#' + this.name + 'tbl').DataTable().row($(e.target)).data()[this.DMindex];
        if (!(this.Vobj.valueMember.contains(Vmember))) {
            this.Vobj.displayMember.push(Dmember);
            this.Vobj.valueMember.push(Vmember);
            $(e.target).find('[type=checkbox]').prop('checked', true);
            $.each(this.DMindexes, this.dblClickOnOptIterfn.bind(this));
        }
    };
    //dblClickOnOptIterfn ^^^
    this.dblClickOnOptIterfn = function (i, v) {
        console.log("this.Vobj.displayMember:" + this.Vobj.displayMember);
        eval('this.Vobj.displayMember' + (i + 1) + '.push( $(\'#' + this.name + 'tbl\').DataTable().row(self).data()[v] );');
    };

    this.checkBxClickEventHand = function (e) {
        var indx;
        $.each(data.columns, function (j, value) {
            if (value.columnName == 'id')
                indx = value.columnIndex;
        });
        var $row = $(e.target).closest('tr');
        var datas = $('#' + this.name + 'tbl').DataTable().row($row).data();
        if (!(this.Vobj.valueMember.contains(datas[this.VMindex]))) {
            this.Vobj.displayMember.push(datas[this.DMindex]);
            this.Vobj.valueMember.push(datas[this.VMindex]);

            $.each(this.DMindexes, function (i, v) {
                eval('this.Vobj.displayMember' + (i + 1) + '.push(datas[v]);');
            }.bind(this));
        }
        else {
            this.Vobj.displayMember.splice(this.Vobj.displayMember.indexOf(datas[this.DMindex]), 1);
            this.Vobj.valueMember.splice(this.Vobj.valueMember.indexOf(datas[this.VMindex]), 1);
            $.each(this.DMindexes, function (i, v) {
                eval('this.Vobj.displayMember' + (i + 1) + '.splice(this.Vobj.displayMember' + (i + 1) + '.indexOf(datas[v]),1);');
            }.bind(this));
        }
    };

    this.hideDDclickOutside = function (e) {
        var container = $('#' + this.name + 'DDdiv');
        var container1 = $('#' + this.name);
        if ((!container.is(e.target) && container.has(e.target).length === 0) && (!container1.is(e.target) && container1.has(e.target).length === 0)) {
            this.Vobj.hideDD();
            if (this.Vobj.valueMember.length < this.minLimit && this.minLimit !== 0)
                document.getElementById(this.name + 'srch0').setCustomValidity('This field  require minimum ' + this.minLimit + ' values');
            else
                if (this.required && this.Vobj.valueMember.length === 0)
                    document.getElementById('' + this.name + 'srch0').setCustomValidity('This field  is required');
                else
                    document.getElementById('' + this.name + 'srch0').setCustomValidity('');
        }
    };

    this.selectRdr = function () {
        var _this = this;
        this.Vobj = new Vue({
            el: '#' + _this.name + 'container',
            data: {
                options: [],
                displayMember: [],
                displayMember1: [],
                displayMember2: [],
                //this.vueDMcode
                valueMember: [],
                id: _this.name,
                DDstate: false
            },
            watch: {
                valueMember: function (val) {
                    //single select
                    if (_this.maxLimit === 1 && !_this.multiSelect && val.length > 1) {
                        _this.valueMember = _this.valueMember.splice(1, 1);
                        $.each(_this.DMindexes, function (i, v) {
                            eval('_this.Vobj.displayMember' + (i + 1) + '= _this.Vobj.displayMember' + (i + 1) + '.splice( 1, 1);');
                        });
                    }
                        //max limit
                    else if (val.length > _this.maxLimit) {
                        _this.Vobj.valueMember = _this.Vobj.valueMember.splice(0, _this.maxLimit);
                        $.each(_this.DMindexes, function (i, v) {
                            eval('_this.Vobj.displayMember' + (i + 1) + '= _this.Vobj.displayMember' + (i + 1) + '.splice( 0, _this.maxLimit);');
                        });
                    }
                }
            },
            methods: {
                toggleDD: function () {
                    this.DDstate = !this.DDstate;
                    //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },500);
                },
                showDD: function () {
                    if (!_this.DtFlag) { _this.DtFlag = true; InitDT(); }
                    this.DDstate = true;
                    //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },520);
                    setTimeout(function () { $('#' + _this.name + 'tbl').DataTable().columns.adjust().draw(); }, 520);
                },
                hideDD: function () { this.DDstate = false; },
                updateCk: function () {
                    $('#' + _this.name + 'container table:eq(1) tbody [type=checkbox]').each(function (i) {
                        var row = $(this).closest('tr');
                        var datas = $('#' + _this.name + 'tbl').DataTable().row(row).data();
                        if (_this.Vobj.valueMember.contains(datas[VMindex]))
                            $(this).prop('checked', true);
                        else
                            $(this).prop('checked', false);
                    });
                    // raise error msg
                    setTimeout(function () {
                        if (_this.Vobj.valueMember.length !== _this.Vobj.displayMember1.length) {
                            alert('valueMember and displayMember length miss match found !!!!');
                            console.log('valueMember=' + _this.Vobj.valueMember);
                            console.log('displayMember1=' + _this.Vobj.displayMember1);
                        }
                    }, 30);
                }
            }
        });////////

        //set id for searchBox
        $('#' + _this.name + 'container [type=search]').each(function (i) {
            $(this).attr('id', '' + _this.name + 'srch' + i);
        });

        //enter-DDenabling & if'' showall, esc arrow space key based DD enabling , backspace del-valueMember updating
        $('#' + _this.name + 'container [type=search]').keydown(
            function (e) {
                var search = $(this).val().toString();
                if (e.which === 13) {
                    _this.Vobj.showDD();
                    if (search.trim() === '' && !_this.DtFlag) { // show all if txtbox empty
                        $('#' + _this.name + 'tbl').DataTable().search(search).draw();
                        $('#' + _this.name + '_loading-image').show();
                    }
                }
                if ((e.which === 8 || e.which === 46) && search === '' && _this.Vobj.valueMember.length > 0) {
                    _this.Vobj.valueMember.pop();
                    $.each(_this.DMindexes, function (i, v) {
                        eval('this.Vobj.displayMember' + (i + 1) + '.pop();');
                    });
                }
                if (e.which === 40) {
                    this.Vobj.showDD();
                    $(this).blur();
                    $('#' + _this.name + 'DDdiv table:eq(1) td:eq(0)').trigger('click');
                }
                if (e.which === 32)
                    _this.Vobj.showDD();
                if (e.which === 27)
                    _this.Vobj.hideDD();
            });

        //toggle indicator button
        $('#' + this.name + ' [class=open-indicator]').click(function () {
            if (!_this.DtFlag) {
                _this.DtFlag = true;
                _this.InitDT();
            }
            _this.Vobj.toggleDD();
        });

        //remove ids when tagclose button clicked
        $('#' + this.name + 'container').on('click', '[class= close]', this.tagCloseBtnHand.bind(this));

        //hide DD when click outside select or DD &  required ( if  not reach minLimit) 
        $(document).mouseup(this.hideDDclickOutside.bind(this));
    };

    this.InitDT();
    this.selectRdr();
}  