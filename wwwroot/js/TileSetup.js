var TileSetupJs = function (parentDiv, title, initObjList, searchObjList, searchAjax) {
    
    this.parentDiv = parentDiv;
    this.title = title;
    this.searchResultObject = [];
    this.finalResultObject = initObjList;
    this.objectList = searchObjList;
    this.searchAjaxUrl = searchAjax;
    this.txtDemoSearch = null;
    this.btnClearDemoSearch = null;
    this.txtSearch = null;
    this.loader = null;
    this.btnModalOk = null;
    this.addModal = null;
    this.divSelectedDisplay = null;
    this.divSearchResults = null;
    
    this.init = function () {
        this.createBody.bind(this)(this.parentDiv, this.title);


    }
    this.createBody = function (parent, title) {
        var t = title.replace(" ", "_")
        $(parent).append(`
        <div class="row" style="padding:6px 0px">
            <div class="col-md-5"></div>
            <div class="col-md-4">
                <input id="txtDemoSearch${t}" type="search" class="form-control" placeholder="Search" style="padding-right:30px; display:inline-block; width:80%" />
                <span class="glyphicon glyphicon-search form-control-feedback" style="top: 0px; right: 86px;"></span>
                <button id="btnClearDemoSearch${t}" type="button" class="btn btn-default" style="float:right; display:inline-block">Clear</button>
            </div>
            <div class="col-md-2">
                <button type="button" class="btn" data-toggle="modal" data-target="#addModal${t}" style="float:right"><i class="fa fa-plus" aria-hidden="true"></i>&nbsp${title}</button>
            </div>
        </div>
        <div class="container">
            <div class="modal fade" id="addModal${t}" role="dialog">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                            <h4 class="modal-title">${title}</h4>
                        </div>
                        <div class="modal-body" style="height:400px">
                            <div class="input-group ">
                                <input id="txtSearch${t}" title="Type to Search" type="text" class="form-control" placeholder="Search">
                                <span class="input-group-btn">
                                    <button id="" title="Click to Search" class="btn btn-secondary" type="button"><i class="fa fa-search" aria-hidden="true"></i></button>
                                </span>
                            </div>
                            <div id="loader${t}" style=" margin-left:45%; margin-top:25% ; display:none;"> <i class="fa fa-spinner fa-pulse fa-4x" aria-hidden="true"></i></div>
                            <div id="divSearchResults${t}" style="height:300px; overflow-y:auto"></div>
                        </div>
                        <div class="modal-footer">
                            <button id="btnModalOk${t}" type="button" class="btn btn-default">OK</button>
                            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="divSelectedDisplay${t}" class="row tilediv1"></div>`);

        this.txtDemoSearch = $('#txtDemoSearch' + t);
        this.btnClearDemoSearch = $('#btnClearDemoSearch' + t);
        this.txtSearch = $('#txtSearch' + t);
        this.loader = $('#loader' + t);
        this.btnModalOk = $('#btnModalOk' + t);
        this.addModal = $('#addModal' + t);
        this.divSelectedDisplay = $('#divSelectedDisplay' + t);
        this.divSearchResults = $('#divSearchResults' + t);

        $(this.txtDemoSearch).on('keyup', this.keyUpTxtDemoSearch.bind(this));
        $(this.btnClearDemoSearch).on('click', this.onClickbtnClearDemoSearch.bind(this));
        $(this.txtSearch).on('keyup', this.keyUptxtSearch.bind(this));
        $(this.btnModalOk).on('click', this.clickbtnModalOkAction.bind(this));
        $(this.addModal).on('shown.bs.modal', this.initModal.bind(this));
    }
    this.keyUpTxtDemoSearch = function () {
        var f = 1;
        var divSelectedDisplay = this.divSelectedDisplay;
        var txt = $(this.txtDemoSearch).val().trim();
        $($(divSelectedDisplay).children("div.col-md-4")).each(function () {
            $(this).children().css('box-shadow', '1px 1px 2px 1px #fff');
            if ($(this).attr('data-name').toLowerCase().substring(0, txt.length) === txt.toLowerCase() && txt !== "") {
                $(this).children().css('box-shadow', '1px 1px 2px 1px red');
                //scroll to search result
                if (f) {
                    var elem = $(this);
                    if (elem) {
                        var main = $(divSelectedDisplay);
                        var t = main.offset().top;
                        main.scrollTop(elem.offset().top - t);
                    }
                    f = 0;
                }
            }
        });
    }
    this.onClickbtnClearDemoSearch = function () {
        $(this.txtDemoSearch).val("");
        this.keyUptxtDemoSearch();
    }

    this.initModal = function () {
        this.txtSearch.focus();
        //this.KeyUptxtSearchRole();
    }

    this.keyUptxtSearch = function (e) {
        //this.dependentList = [];
        //this.drawSearchResults();
        $(this.divSearchResults).children().remove();
        this.loader.show();
        clearTimeout($.data(this, 'timer'));
        if (e.keyCode === 13)
            this.getSuggestion(true);
        else
            $(this).data('timer', setTimeout(this.getSearchResult.bind(this, false), 500));
    }


    this.getSearchResult = function (force) {
        var searchtext = $(this.txtSearch).val().trim();
        var Url = this.searchAjaxUrl;
        if ((!force && searchtext.length < 2) || searchtext === "") {
            this.loader.hide();
            return;
        }
        if (Url === null) {
            this.loader.hide();
            this.drawSearchResults(this.objectList, searchtext);

        }
        else {
            $.ajax({
                type: "POST",
                url: Url,
                data: { srchTxt: searchtext },
                success: this.getItemdetailsSuccess.bind(this)
            });
        }
    }

    this.getItemdetailsSuccess = function (data) {
        this.loader.hide();
        //console.log(data);
        //this.drawSearchResults2(1, data);
    };


    this.drawSearchResults = function (objList, srchTxt) {
        var st = null;
        var txt = srchTxt;
        var divSelectedDisplay = this.divSelectedDisplay;
        var divSearchResults = this.divSearchResults;
        $(divSearchResults).children().remove();
        for (var i = 0; i < objList.length; i++) {
            if (objList[i].Name.substr(0, txt.length).toLowerCase() === txt.toLowerCase()) {
                if ($(divSelectedDisplay).find(`[data-id='${objList[i].Id}']`).length > 0) {
                    st = "checked disabled";
                }
                //else if (this.dependentList.indexOf(obj[i].Id) !== -1)
                //    st = "disabled";
                else
                    st = null;
                this.appendToSearchResult(divSearchResults, st, objList[i]);
            }
        }
        //$(".SearchCheckbox").on('change', this.OnChangeSearchCheckbox.bind(this));
    }




    this.OnChangeSearchCheckbox = function (e) {
        this.dependentList = [];
        $.each($("#divSelectedRoleDisplay").children(), function (i, ob) {
            this.dependentList.push(parseInt($(ob).attr('data-id')));
            this.findDependentRoles($(ob).attr('data-id'));
        }.bind(this));
        if ($(e.target).is(':checked'))
            this.findDependentRoles($(e.target).attr("data-id"));

        $.each($("#divRoleSearchResults").find('input'), function (i, ob) {
            if (this.dependentList.indexOf(parseInt($(ob).attr('data-id'))) !== -1) {
                $(ob).removeAttr("checked");
                $(ob).attr("disabled", "true");
            }
            else
                $(ob).removeAttr("disabled");
        }.bind(this));
    }

    this.appendToSearchResult = function (divSearchResults, st, obj) {
        $(divSearchResults).append(`<div class='row searchRsulsItemsDiv' style='margin-left:5px; margin-right:5px' data-id=${obj.Id}>
                                        <div class='col-md-1' style="padding:10px">
                                            <input type ='checkbox' class='SearchCheckbox' ${st} data-name = '${obj.Name}' data-id = '${obj.Id}' data-d = '${obj.Description}' aria-label='...'>
                                        </div>
                                        <div class='col-md-10'>
                                            <h5 name = 'head5' style='color:black;'>${obj.Name}</h5>
                                            ${obj.Data1}
                                        </div>
                                    </div>`);
    }


    this.clickbtnModalOkAction = function () {
        this.drawSelected();
        $('#addRolesModal').modal('toggle');
        //this.SortDiv(1);
    }

    this.drawSelected = function () {
        var checkedBoxList = $('.SearchCheckbox:checked');
        var _this = this;
        $(checkedBoxList).each(function () {
            //_this.appendToSelected(this.divSelected, {Id: this.Id, Name: this.Name, Data1: this.Data1});
        });
    }

    this.appendToSelected = function (divSelected, obj) {
        //var finalResult = finalResultObj;
        //var divSelectedDisplay = $(this.divSelectedDisplay);
        //$(finalResult).each(function () {
                $(divSelected).append(` <div class="col-md-4 container-md-4" data-id=${obj.Id} data-name=${obj.Name}>
                                            <div class="mydiv1" style="overflow:visible;">
                                                <div class="icondiv1">
                                                    <b>${obj.Name.substring(0, 1).toUpperCase()}</b>
                                                </div>
                                                <div class="textdiv1">
                                                    <b>${obj.Name}</b>
                                                    <div style="font-size: smaller;">&nbsp${obj.Data1}</div>
                                                </div>
                                                <div class="closediv1">
                                                    <div class="dropdown">
                                                        <i class="fa fa-ellipsis-v dropdown-toggle" aria-hidden="true" data-toggle="dropdown" style="padding:0px 5px"></i>
                                                        <ul class="dropdown-menu" style="left:-140px; width:160px;">
                                                            <li><a href="#" onclick="OnClickRemove(this);">Remove</a></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`);
        //});
    }

    this.init();
}
