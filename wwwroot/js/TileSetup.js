var TileSetupJs = function (parentDiv, title, initObjList, searchObjList, objMetadata, searchAjax, chkUnChkItemCustomFunc, parentThis) {
    
    this.parentDiv = parentDiv;
    this.title = title;
    this.resultObject = [];
    this.initObjectList = initObjList;
    this.objectList = searchObjList;
    this.objectMetadata = objMetadata;
    this.searchAjaxUrl = searchAjax;
    
    this.txtDemoSearch = null;
    this.btnClearDemoSearch = null;
    this.btnAddModal = null;
    this.txtSearch = null;
    this.btnSearch = null;
    this.loader = null;
    this.divMessage = null;
    this.btnModalOk = null;
    this.addModal = null;
    this.divSelectedDisplay = null;
    this.divSearchResults = null;
    this.doChkUnChkItemCustomFunc = chkUnChkItemCustomFunc;
    this.parentthis = parentThis;
    this.profilePicStatus = null;
    
    this.init = function () {
        this.createBody.bind(this)(this.parentDiv, this.title);
        
        
        
    }

    this.createBody = function (parent, title) {
        var t = title.replace(/\s/g, "_");
        $(parent).append(`
        <div class="row" style="padding:6px 0px">
            <div class="col-md-5"></div>
            <div class="col-md-4">
                <input id="txtDemoSearch${t}" type="search" class="form-control" placeholder="Search" title="Type to Search" style="padding-right:30px; display:inline-block; width:80%" />
                <span class="glyphicon glyphicon-search form-control-feedback" style="top: 0px; right: 86px;"></span>
                <button id="btnClearDemoSearch${t}" type="button" class="btn btn-default" style="float:right; display:inline-block">Clear</button>
            </div>
            <div class="col-md-2">
                <button type="button" class="btn" id="btnAddModal${t}" style="float:right"><i class="fa fa-plus" aria-hidden="true"></i>&nbsp${title}</button>
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
                                    <button id="btnSearch${t}" title="Click to Search" class="btn btn-secondary" type="button"><i class="fa fa-search" aria-hidden="true"></i></button>
                                </span>
                            </div>
                            <div id="message${t}" style=" margin-left: 32%; margin-top: 25% ;font-size: 24px; color: #bbb; display:none;">Type Few Characters</div>
                            <div id="loader${t}" style=" margin-left:45%; margin-top:25% ; display:none;"> <i class="fa fa-spinner fa-pulse fa-4x" aria-hidden="true"></i></div>
                            <div id="divSearchResults${t}" style="height:338px; overflow-y:auto"></div>
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
        this.btnAddModal = $('#btnAddModal' + t );
        this.txtSearch = $('#txtSearch' + t);
        this.btnSearch = $('#btnSearch' + t);
        this.loader = $('#loader' + t);
        this.divMessage = $('#message' + t);
        this.btnModalOk = $('#btnModalOk' + t);
        this.addModal = $('#addModal' + t);
        this.divSelectedDisplay = $('#divSelectedDisplay' + t);
        this.divSearchResults = $('#divSearchResults' + t);

        $(this.parentDiv).on('keyup', '#txtDemoSearch' + t, this.keyUpTxtDemoSearch.bind(this));
        $(this.parentDiv).on('click', '#btnClearDemoSearch' + t, this.onClickbtnClearDemoSearch.bind(this));
        $(this.parentDiv).on('keyup', '#txtSearch' + t, this.keyUptxtSearch.bind(this));
        $(this.parentDiv).on('click', '#btnSearch' + t, this.keyUptxtSearch.bind(this));
        $(this.parentDiv).on('click', '#btnModalOk' + t, this.clickbtnModalOkAction.bind(this));
        $(this.parentDiv).on('shown.bs.modal', '#addModal' + t, this.initModal.bind(this));
        $(this.parentDiv).on('hidden.bs.modal', '#addModal' + t, this.finalizeModal.bind(this));

        $(this.parentDiv).on('click', '#btnAddModal' + t, this.onClickBtnAddModal.bind(this));
        $(this.divSearchResults).on('change', ".SearchCheckbox", this.OnChangeSearchCheckbox.bind(this));
        $(this.divSelectedDisplay).on('click', ".dropDownRemoveClass", this.onClickRemoveFromSelected.bind(this));

        if (this.objectMetadata.indexOf('ProfilePicture') > -1)
            this.profilePicStatus = true;

        if (this.initObjectList != null){
            for (var i = 0; i < this.initObjectList.length; i++) {
                this.appendToSelected(this.divSelectedDisplay, { Id: this.initObjectList[i][this.objectMetadata[0]], Name: this.initObjectList[i][this.objectMetadata[1]], Data1: this.initObjectList[i][this.objectMetadata[2]] });
            }
        }
    }


    this.setObjectList = function (obj) {
        this.objectList = obj;
    }

    this.getItemIds = function () {
        var itemid= '';
        for (i = 0; i < this.resultObject.length; i++)
            itemid += this.resultObject[i].Id + ',';
        itemid = itemid.substring(0, itemid.length - 1);
        return itemid;
    }

    this.onClickBtnAddModal = function () {
        $(this.addModal).modal('show');
    }

    this.keyUpTxtDemoSearch = function () {
        var f = 1;
        var divSelectedDisplay = this.divSelectedDisplay;
        var txt = $(this.txtDemoSearch).val().trim();
        $($(divSelectedDisplay).children("div.col-md-4")).each(function () {
            $(this).children().css('box-shadow', '1px 1px 2px 1px #fff');
            if ($(this).attr('data-name').toLowerCase().substring(0, txt.length) === txt.toLowerCase() && txt !== "") {
                $(this).children().css('box-shadow', '1px 1px 2px 1px #5bc0de');
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
        this.keyUpTxtDemoSearch();
    }

    

    this.initModal = function () {
        this.divMessage.show();
        this.txtSearch.focus();
        this.getSearchResult(false);
    }
    this.finalizeModal = function () {
        $(this.txtSearch).val("");
        $(this.divSearchResults).children().remove();
    }
    this.keyUptxtSearch = function (e) {
        $(this.divSearchResults).children().remove();
        this.divMessage.hide();
        this.loader.show();
        clearTimeout($.data(this, 'timer'));
        if (e.keyCode === 13 || this.searchAjaxUrl === null)
            this.getSearchResult(true);
        else
            $(this).data('timer', setTimeout(this.getSearchResult.bind(this, false), 500));
    }
    
    this.getSearchResult = function (force) {
        var searchtext = $(this.txtSearch).val().trim();
        var Url = this.searchAjaxUrl;
        if (Url === null) {
            this.loader.hide();
            if (this.objectList !== null) {
                this.divMessage.hide();
                this.drawSearchResults(this.objectList, searchtext);
            }
            else {
                this.divMessage.text("... Nothing Found ...");
                this.divMessage.show();
            } 
        }
        else if (!force && searchtext.length < 2) {
            this.loader.hide();
            this.divMessage.text("Type Few Characters");
            this.divMessage.show();
            return;
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
        if (data.length === 0) {
            this.divMessage.text("... Nothing Found ...");
            this.divMessage.show();
            return;
        }
        this.drawSearchResults(data, "");
    };
    
    this.drawSearchResults = function (objList, srchTxt) {
        var txt = srchTxt;
        var divSelectedDisplay = this.divSelectedDisplay;
        var divSearchResults = this.divSearchResults;
        $(divSearchResults).children().remove();
        for (var i = 0; i < objList.length; i++) {
            var st = null;
            if (objList[i][this.objectMetadata[1]].substr(0, txt.length).toLowerCase() === txt.toLowerCase() ) {
                if ($(divSelectedDisplay).find(`[data-id='${objList[i][this.objectMetadata[0]]}']`).length > 0) {
                    st = 'checked disabled';
                }
                this.appendToSearchResult(divSearchResults, st, { Id: objList[i][this.objectMetadata[0]], Name: objList[i][this.objectMetadata[1]], Data1: objList[i][this.objectMetadata[2]] });            
            }
        }
        if ($(this.divSearchResults).children().length === 0) {
            this.divMessage.text("... Nothing Found ...");
            this.divMessage.show();
        }
    }
    
    this.OnChangeSearchCheckbox = function (e) {
        if (this.doChkUnChkItemCustomFunc !== null) {
            this.doChkUnChkItemCustomFunc(parentThis, e);
        }
    }

    this.appendToSearchResult = function (divSearchResults, st, obj) {
        var temp= `<div class='row searchRsulsItemsDiv' style='margin-left:5px; margin-right:5px' data-id=${obj.Id}>
                        <div class='col-md-1' style="padding:10px">
                            <input type ='checkbox' class='SearchCheckbox' ${st} data-name = '${obj.Name}' data-id = '${obj.Id}' data-d1 = '${obj.Data1}' aria-label='...'>
                        </div>`;

        if (this.profilePicStatus === true)
            temp += `   <div class='col-md-2'>
                            <img class='img-thumbnail pull-right' src='../static/dp/dp_${obj.Id}_micro.jpg' />
                        </div>`;
        temp+=`         <div class='col-md-8'>
                            <h5 name = 'head5' style='color:black;'>${obj.Name}</h5>
                            ${obj.Data1}
                        </div>
                    </div>`;
        $(divSearchResults).append(temp);
    }
    this.clickbtnModalOkAction = function () {
        this.drawSelected();
        $(this.addModal).modal('toggle');
        this.SortDiv(this.divSelectedDisplay);
    }
    this.SortDiv = function (mylist) {
        var listitems = mylist.children('div').get();
        listitems.sort(function (a, b) {
            return $(a).attr("data-name").toUpperCase().localeCompare($(b).attr("data-name").toUpperCase());
        });
        $.each(listitems, function (index, item) {
            mylist.append(item);
        });
    }
    this.drawSelected = function () {
        var checkedBoxList = $('.SearchCheckbox:checked');
        var _this = this;
        $(checkedBoxList).each(function () {
            _this.appendToSelected(_this.divSelectedDisplay, { Id: $(this).attr('data-id'), Name: $(this).attr('data-name'), Data1: $(this).attr('data-d1')});
        });
    }
    this.appendToSelected = function (divSelected, obj) {
        if ($(divSelected).find(`[data-id='${obj.Id}']`).length > 0) {
            return;
        }
        var itempresent = $.grep(this.resultObject, function (a) {
            if (a.Id === obj.Id)
                return true;
        });
        if (itempresent.length === 0)
            this.resultObject.push(obj);
        var temp = `<div class="col-md-4 container-md-4" data-id=${obj.Id} data-name=${obj.Name}>
                        <div class="mydiv1" style="overflow:visible;">
                            <div class="icondiv1">`;
        if (this.profilePicStatus === true)
            temp += `<img style = "width:52px" class='img-thumbnail pull-right' src='../static/dp/dp_${obj.Id}_micro.jpg' />`;
        else
            temp += `<b>${obj.Name.substring(0, 1).toUpperCase()}</b>`;
        temp+=`     </div>
                    <div class="textdiv1">
                        <b>${obj.Name}</b>
                        <div style="font-size: smaller;">&nbsp${obj.Data1}</div>
                    </div>
                    <div class="closediv1">
                        <div class="dropdown">
                            <i class="fa fa-ellipsis-v dropdown-toggle" aria-hidden="true" data-toggle="dropdown" style="padding:0px 5px"></i>
                            <ul class="dropdown-menu" style="left:-140px; width:160px;">
                                <li><a href="#" class='dropDownRemoveClass'>Remove</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>`
        $(divSelected).append(temp);
        
    }
    this.onClickRemoveFromSelected = function (e) {
        if (confirm("Click OK to Remove")) {
            var parent = $(e.target).parents("div.col-md-4");
            for (var i = 0; i < this.resultObject.length; i++) {
                if (this.resultObject[i].Id == parent.attr('data-id')) {
                    this.resultObject.splice(i, 1);
                    parent.remove();
                    return;
                }
            }
        }
    }

    this.init();
}
