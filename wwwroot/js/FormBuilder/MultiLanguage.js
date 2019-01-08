const MultiLanguageKeySelector = function (settings, curKey) {

    this.ContID = settings.ContainerId;
    this.ToggleBtnId = settings.ToggleBtnId;
    this.txtForPasteKey = settings.KeyTxtId;
    
    this.Offset = 0;
    this.resultCount = 0;
    this.currentPage = 1;
    this.dataWindow;
    this.currentWindow = 1;
    this.pageSize = 50;//const
    this.windowSize = 5;//const
    this.initKey = curKey;
    
    this.init = function () {
        this.createModal();
        this.initmodal();
        $('#ML_Modal_' + this.ContID + ' .imgup-bg').show(350);
        this.getKeySuggestion(true);
    };

    this.get = function () {
        //if (this.txtsearch.val().trim() === this.txtsearch.attr("data-value")) {
        //    return this.txtsearch.attr("data-value");
        //}
        //return null;
        return this.txtsearch.val().trim();
    }

    this.createModal = function () {
        var modalHTML = `
<div class="fup" id="ML_Modal_${this.ContID}">
    <div class="imgup-bg">
        <div class="imgup-Cont">
            <div class="modal-header">
                <button type="button" class="close" onclick="$('#ML_Modal_${this.ContID} .imgup-bg').hide(500);" >&times;</button>
                <div style="margin-left:10px ; display:inline-block"> <h4 class="modal-title">Multi Language Key Settings.</h4> </div>
            </div>
            <div class="modal-body" style="height: 420px;">
                <ul id="ultabs_${this.ContID}" class="nav nav-tabs">
                    <li class="active"><a data-toggle="tab" href="#menusearch_${this.ContID}">Search</a></li>
                    <li><a data-toggle="tab" href="#menuadd_${this.ContID}">Add/Update</a></li>
                </ul>
                <div class="tab-content">
                    <div id="menusearch_${this.ContID}" class="tab-pane fade in active">
                        <div class="row" style="margin-top:20px">
                            <div class="col-md-5">
                                <div class="input-group ">
                                    <input id="txtsearch_${this.ContID}" value ="${this.initKey || ""}"title="Type to Search" type="text" data-value="" data-id="" data-object="" class="form-control" placeholder="Search">
                                    <span class="input-group-btn">
                                        <button id="btnsearch_${this.ContID}" title="Click to Search" class="btn btn-secondary" type="button"><i class="fa fa-search" aria-hidden="true"></i></button>
                                    </span>
                                </div>
                                <div id="divPageNumberDisplay_${this.ContID}" style="margin-top:15px">
                                    <i>Key Suggestions</i>
                                </div>
                                <div id="lstkeysuggestion_${this.ContID}" class="list-group" style=" height:220px; overflow-y:auto; border:1px solid #ccc; margin-top:3px; margin-bottom:0px;">
                                    <div id="loader_${this.ContID}" style=" text-align: center; margin-top:80px ; display:none;"> <i class="fa fa-spinner fa-pulse fa-4x" aria-hidden="true"></i></div>
                                </div>
                                <div id="divMLPagination_${this.ContID}" style="margin-top:5px; float: right;">
                                    <ul id="ulMLPagination_${this.ContID}" class="pagination" style="margin:0px;">
                                        <li><a href="#" title="First">First</a></li>
                                        <li><a href="#" title="Previous">Prev</a></li>
                                        <li><a href="#" style="padding:0px;"> <input id="txtMLPageNumber_${this.ContID}" type="text" class="form-control" title="Type Page Number and Press Enter" style="width:60px;height: 28px; border: none; margin: 2px; display:inline; text-align:center;"></a> </li>
                                        <li><a href="#" title="Next">Next</a></li>
                                        <li><a href="#" title="Last">Last</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="col-md-7">
                                <div style=""><i>Language &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Meaning</i></div>
                                <div id="lstlangkeyval_${this.ContID}" class="list-group" style="height:270px; overflow-y:auto;border:1px solid #ccc">
                                </div>
                                <div id="lblsearchkeyresult_${this.ContID}" style="display:none; ">
                                    <b>Key Not Found! &nbsp;&nbsp; <a href="#" id="addnewkeylink_${this.ContID}"> Click Here</a>&nbsp;&nbsp; to add as new Key.</b>
                                </div>
                                <div id="lblsearchkeyresult2_${this.ContID}" style="display:none ; ">
                                    <b><a href="#" id="updatekeylink_${this.ContID}"> Click Here</a> &nbsp;&nbsp;to Update Key.</b>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="menuadd_${this.ContID}" class="tab-pane fade">
                        <div class="input-group" style="margin-top:20px">
                            <input id="txtaddkey_${this.ContID}" type="text" data-value="" data-id="" class="form-control" placeholder="Enter a Key">
                            <span class="input-group-btn">
                                <button id="btnaddgo_${this.ContID}" title="Click to Load stored Key Values" class="btn btn-secondary" type="button"><i class="fa fa-refresh" aria-hidden="true"></i></button>
                            </span>
                        </div>
                        <div id="lblloadkeyresult_${this.ContID}" align="right" style=" display:none; padding-right:10%;">
                            <i>Key Not Found!</i>
                        </div>
                        <div id="loader2_${this.ContID}" style="margin-left:45%; margin-top:10%"> <i class="fa fa-spinner fa-pulse fa-4x" aria-hidden="true"></i></div>
                        <div id="divtable_${this.ContID}" style="margin-top:10px; height:280px; overflow:auto">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th class="col-md-3">Language</th>
                                        <th class="col-md-9">Key Value</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody1_${this.ContID}" style="height:240px; overflow:auto; position:absolute"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <div class="modal-footer-body">
                    <button id="btnadd_${this.ContID}" type="button" class="btn btn-default" style="">Add</button>
                    <button id="btnupdate_${this.ContID}" type="button" class="btn btn-default" style="">Update</button>

                    <button type="button" name="CXE_OK" id="${this.ContID}_close" class="btn"  onclick="$('#ML_Modal_${this.ContID} .imgup-bg').hide(500);">OK</button>

                    <button type="button" class="btn btn-default" onclick="$('#ML_Modal_${this.ContID} .imgup-bg').hide(500);">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</div>`;

        $("#" + this.ContID).append(modalHTML);

        this.loader = $("#loader_" + this.ContID);
        this.loader2 = $("#loader2_" + this.ContID);
        this.txtsearch = $("#txtsearch_" + this.ContID);
        this.txtaddkey = $("#txtaddkey_" + this.ContID);
        this.divPageNumber = $("#divPageNumberDisplay_" + this.ContID);
        this.lstkeysuggestion = $("#lstkeysuggestion_" + this.ContID);
        this.lstlangkeyval = $("#lstlangkeyval_" + this.ContID);
        this.lblsearchkeyresult = $("#lblsearchkeyresult_" + this.ContID);
        this.lblsearchkeyresult2 = $("#lblsearchkeyresult2_" + this.ContID);
        this.lblloadkeyresult = $("#lblloadkeyresult_" + this.ContID);
        this.divtable = $("#divtable_" + this.ContID);
        this.searchtext = "";
        this.addnewkeylink = $("#addnewkeylink_" + this.ContID);
        this.updatekeylink = $("#updatekeylink_" + this.ContID);
        this.btnselect = $(`#${this.ContID}_close`);
        this.btnadd = $("#btnadd_" + this.ContID);
        this.btnupdate = $("#btnupdate_" + this.ContID);
        this.btnaddgo = $("#btnaddgo_" + this.ContID);
        this.ulLiPagination = $("#ulMLPagination_" + this.ContID + " li");
        this.txtPageNumber = $("#txtMLPageNumber_" + this.ContID);
        
        $('a[data-toggle="tab"]').on('shown.bs.tab', this.tabchanged.bind(this));
        this.txtsearch.on('keyup', this.keyupaction.bind(this));
        this.lstkeysuggestion.on('keyup', this.keyUpActionOnLstKeySuggestion.bind(this));
        this.txtPageNumber.on('keyup', this.keyUpActionOnTxtPageNumber.bind(this));
        this.addnewkeylink.on('click', this.onclickaddnewkeylink.bind(this));
        this.updatekeylink.on('click', this.onclickupdatekeylink.bind(this));
        this.btnselect.on('click', this.onclickbtnselect.bind(this));
        this.btnaddgo.on('click', this.onclickaddgo.bind(this));
        this.btnupdate.on('click', this.onclickbtnupdate.bind(this));
        this.btnadd.on('click', this.onclickbtnadd.bind(this));
        this.ulLiPagination.on('click', this.onclickUlLiPagination.bind(this));


    }
    
    this.initmodal = function () {
        this.lblsearchkeyresult.hide();
        this.lblsearchkeyresult2.hide();
        this.loader.hide();
        this.btnadd.hide();
        this.btnupdate.hide();
        $('.nav-tabs a[href="#menusearch_'+this.ContID+'"]').tab('show');
        this.txtsearch.focus();
        this.divtable.hide();
        this.loader2.show();
        this.loadlang();
    };

    this.tabchanged = function (e) {
        var target = $(e.target).text();
        if (target === "Search") {
            this.btnadd.hide();
            this.btnupdate.hide();
            this.btnselect.show();
            this.txtsearch.focus();
        }
        else if (target === "Add/Update") {
            this.btnselect.hide();
            if ((this.lblsearchkeyresult.css("display") === 'block' && this.txtsearch.val().trim() === this.txtaddkey.val()) || this.lblloadkeyresult.css("display") === 'block') {
                this.btnupdate.hide();
                this.btnadd.show();
            }
            else {
                this.btnadd.hide();
                this.btnupdate.show();
            }
            if (this.txtaddkey.attr('data-value') !== this.txtaddkey.val().trim() || this.txtaddkey.attr('data-id') === "")
                $.each(this.divtable.find("tbody tr"), function (j, obj) {
                    $($(obj).children()[1]).children().val("");
                });
            this.txtaddkey.focus();
        }
    };

    this.keyupaction = function (e) {
        
        clearTimeout($.data(this, 'timer'));
        if (e.keyCode === 13)
            this.getKeySuggestion(true);
        else
            $(this).data('timer', setTimeout(this.getKeySuggestion.bind(this, false), 500));
    };

    this.getKeySuggestion = function (force) {
        this.searchtext = this.txtsearch.val().trim();
        if (this.searchtext === this.txtsearch.attr("data-value"))
            return;
        this.lblsearchkeyresult.hide();
        this.lblsearchkeyresult2.hide();
        this.lstkeysuggestion.children("a").remove();
        this.loader.show();
        if (!force && this.searchtext.length < 2) {
            this.loader.hide();
            return;
        }
        this.currentPage = 1;
        this.Offset = 0;
        this.currentWindow = 1;
        this.txtPageNumber.val("");
        this.divPageNumber.children("i").text("Key Suggestions");
        this.getKeySuggestionAjaxCall();
    };

    this.getKeySuggestionAjaxCall = function () {
        this.lstkeysuggestion.children("a").remove();
        this.loader.show();
        $.ajax({
            type: "POST",
            url: "../MultiLanguage/GetKeySuggestion",
            data: { st: this.searchtext, off: this.Offset, lim: (this.windowSize * this.pageSize) },
            success: this.getkeysuccess.bind(this)
        });
    }

    this.getkeysuccess = function (data) {
        this.lstlangkeyval.children().remove();
        this.loader.hide();
        var parsedData = JSON.parse(data);
        this.resultCount = parsedData.Count;
        this.dataWindow = parsedData.D_member;
        var currentWinPage = (this.currentPage - 1) % this.windowSize + 1;
        this.drawSearchResult(currentWinPage);

        var item = this.lstkeysuggestion.find("a[data-value='" + this.searchtext + "']");
        if (item.length > 0) {
            this.drawLanguageAndValues(item[0]);
            this.txtsearch.focus();
        }
    };

    this.drawSearchResult = function (wPage) {
        var wPageStart = (wPage - 1) * this.pageSize;
        var dWindowLength = Object.keys(this.dataWindow).length;
        this.lblsearchkeyresult.hide();
        this.lblsearchkeyresult2.hide();
        if (dWindowLength < wPageStart || dWindowLength === 0) {
            this.txtsearch.attr("data-value", "");
            this.lblsearchkeyresult.show();
            return;
        }
        this.txtsearch.attr("data-value", this.txtsearch.val().trim());
        this.lstkeysuggestion.children("a").remove();
        for (var i = wPageStart; i < wPageStart + this.pageSize; i++) {
            var k = this.dataWindow[i];
            if (k != null)
                this.lstkeysuggestion.append(`<a href='#' style='padding:5px; border:none' class='list-group-item' data-id= '${k[0].KeyId}' data-value='${k[0].Key}' data-object='${JSON.stringify(k)}'>${k[0].Key}</a>`);
        }

        this.divPageNumber.children("i").text("Page " + this.currentPage + " of " + Math.ceil(this.resultCount / this.pageSize));
        this.txtPageNumber.val(this.currentPage);
        this.lstkeysuggestion.children("a").click(this.onclicklstitem.bind(this));

    }

    this.onclicklstitem = function (e) {
        this.drawLanguageAndValues(e.target);
    };

    this.drawLanguageAndValues = function (element) {
        var currentElement = element;
        this.lstkeysuggestion.children("a").removeClass("active");
        $(currentElement).addClass("active");
        $(currentElement).focus();
        this.lstlangkeyval.children().remove();
        var objarray = JSON.parse($(currentElement).attr('data-object'));
        for (var i = 0; i < objarray.length; i++)
            this.lstlangkeyval.append(`<div class="" style="padding:5px; cursor:pointer;"> 
                                            <div class='' style='display:inline-block ; width:30%'> ${objarray[i].Language} </div> 
                                            <div  style='display:inline-block; '> ${objarray[i].KeyValue} </div> 
                                        </div>`);
        this.txtsearch.val($(currentElement).text());
        this.txtsearch.attr("data-value", $(currentElement).attr("data-value"));
        this.txtsearch.attr("data-id", $(currentElement).attr("data-id"));
        this.txtsearch.attr("data-object", $(currentElement).attr("data-object"));
        this.lblsearchkeyresult2.show();

    }

    this.keyUpActionOnLstKeySuggestion = function (e) {
        var actElement = this.lstkeysuggestion.children(".active");
        var currentElement;
        if (e.keyCode === 38 || e.keyCode === 40) {
            if (e.keyCode === 38 && actElement.prev('a').length > 0)
                currentElement = actElement.prev();
            else if (e.keyCode === 40 && actElement.next('a').length > 0)
                currentElement = actElement.next();
            else
                return;
            this.drawLanguageAndValues(currentElement);
        }
    }

    this.onclickaddnewkeylink = function (data) {
        var t = this.txtsearch.val().trim();
        var v = this.txtsearch.attr("data-value");
        if (t === "" || v !== "") {
            EbMessage("show", { Message: 'Invalid Key Value !', AutoHide: true, Background: '#aa0000' });
            //alert("Invalid Key Value !");
            return;
        }
        this.txtaddkey.val(t);
        this.txtaddkey.attr("data-value", t);
        this.txtaddkey.attr("data-id", "");
        this.lblloadkeyresult.show();
        $('.nav-tabs a[href="#menuadd_' + this.ContID + '"]').tab('show');
    };

    this.onclickupdatekeylink = function () {
        var t = this.txtsearch.val().trim();
        var v = this.txtsearch.attr("data-value");
        if (t === "" || v === "") {
            EbMessage("show", { Message: 'Invalid Key Value !', AutoHide: true, Background: '#aa0000' });
            //alert("Invalid Key Value !");
            return;
        }
        this.txtaddkey.val(t);
        this.txtaddkey.attr("data-value", t);
        this.txtaddkey.attr("data-id", this.txtsearch.attr("data-id"));

        var data = JSON.parse(this.txtsearch.attr("data-object"));
        $.each(data, function (i, k) {    //i->serial index
            $.each($(this.divtable).find("tbody tr"), function (j, obj) {
                if ($(obj).attr("data-lid") === k.LangId.toString()) {
                    $(obj).attr("data-id", k.KeyValId.toString());
                    $($(obj).children()[1]).children().val(k.KeyValue);
                    $($(obj).children()[1]).children().attr("data-value", k.KeyValue);
                }
            });
        }.bind(this));
        $('.nav-tabs a[href="#menuadd_' + this.ContID + '"]').tab('show');
    };

    this.onclickbtnselect = function () {
        $("#" + this.txtForPasteKey).val(this.txtsearch.attr("data-value"));
    };

    this.loadlang = function () {
        this.divtable.find("tbody").children().remove();
        $.ajax({
            type: "POST",
            url: "../MultiLanguage/LoadLang",
            data: {},
            success: this.loadlangsuccess.bind(this)
        });
    };

    this.loadlangsuccess = function (data) {
        if (Object.keys(data).length === 0) {
            return;
        }
        $.each(data, function (i, k) {
            //i->language  k->language id
            this.divtable.find("tbody").append(`<tr data-lid='${k}' data-id='' style=''> 
                                                <td style='padding:12px; width:200px;'> <b> ${i} </b></td>
                                                <td style='width:751px'>  <input type='text' data-value="" style="width:100%; padding:5px; border:1px solid #ddd"> </td>
                                              </tr>`);
        }.bind(this));
        this.loader2.hide();
        this.divtable.show();
    };

    this.onclickaddgo = function () {
        var text = this.txtaddkey.val().trim();
        if (text === "" || this.txtaddkey.attr("data-value") === text)
            return;
        this.txtaddkey.attr("data-value", text);
        this.divtable.hide();
        this.lblloadkeyresult.hide();
        this.loader2.show();
        $.ajax({
            type: "POST",
            url: "../MultiLanguage/GetStoredKeyValue",
            data: { k: text },
            success: this.addgosuccess.bind(this)
        });
    };

    this.addgosuccess = function (data) {
        this.loader2.hide();
        this.lblloadkeyresult.hide();
        this.divtable.show();
        $.each(this.divtable.find("tbody tr"), function (j, obj) {
            $(obj).attr("data-id", "");
            $($(obj).children()[1]).children().val("");
            $($(obj).children()[1]).children().attr("data-value", "");
        });
        if (Object.keys(data).length === 0) {
            this.btnupdate.hide();
            this.btnadd.show();
            this.lblloadkeyresult.show();
            return;
        }
        this.btnupdate.show();
        this.btnadd.hide();
        this.txtaddkey.attr("data-id", data[0].key_Id);
        $.each(data, function (i, k) {    //i->serial index
            $.each(this.divtable.find("tbody tr"), function (j, obj) {
                if ($(obj).attr("data-lid") === k.lang_Id.toString()) {
                    $(obj).attr("data-id", k.keyVal_Id.toString());
                    $($(obj).children()[1]).children().val(k.keyVal_Value);
                    $($(obj).children()[1]).children().attr("data-value", k.keyVal_Value);
                }
            });
        }.bind(this));
    };

    this.onclickbtnupdate = function (data) {
        var t = this.txtaddkey.val().trim();
        var v = this.txtaddkey.attr("data-value");
        var i = this.txtaddkey.attr("data-id");
        var dict = new Array();
        if (t !== v) {
            EbMessage("show", { Message: 'First Load the key value !', AutoHide: true, Background: '#aa0000' });
            //alert("First Load the key value !");
            return;
        }
        $.each(this.divtable.find("tbody tr"), function (j, obj) {
            var dataid = $(obj).attr("data-id");
            var langid = $(obj).attr("data-lid");
            var dataval = $($(obj).children()[1]).children().attr("data-value");
            var newval = $($(obj).children()[1]).children().val().trim();
            if (dataval !== newval && newval !== "") {
                dict.push(new Object({ KeyVal_Id: dataid, Key: t, Key_Id: i, Lang_Id: langid, KeyVal_Value: newval }));
                $($(obj).children()[1]).children().attr("data-value", newval);
            }
        });
        if (dict.length === 0)
            return;
        this.divtable.hide();
        this.loader2.show();
        $.ajax({
            type: "POST",
            url: "../MultiLanguage/UpdateKeyValue",
            data: { d: JSON.stringify(dict) },
            success: this.updatekeyvaluesuccess.bind(this)
        });
    };

    this.updatekeyvaluesuccess = function (data) {
        this.loader2.hide();
        this.divtable.show();
        EbMessage("show", { Message: data + " Value(s) Successfully Updated ", AutoHide: true, Background: '#00aa00' });
        //alert(data + " Value(s) Successfully Updated ");
    };

    this.onclickbtnadd = function () {
        var key = this.txtaddkey.val().trim();
        if (key !== this.txtaddkey.attr("data-value")) {
            EbMessage("show", { Message: 'Load values then click Add', AutoHide: true, Background: '#aa0000' });
            //alert("Load values then click Add");
            return;
        }
        var dict = new Array();
        $.each(this.divtable.find("tbody tr"), function (j, obj) {
            var lid = $(obj).attr("data-lid");
            var newval = $($(obj).children()[1]).children().val().trim();
            if (newval !== "")
                dict.push(new Object({ Lang_Id: lid, Key_Value: newval }));
        });
        if (key === "" || dict.length === 0)
            return;
        this.divtable.hide();
        this.loader2.show();
        $.ajax({
            type: "POST",
            url: "../MultiLanguage/AddKeyValue",
            data: { k: key, d: JSON.stringify(dict) },
            success: this.addkeyvaluesuccess.bind(this)
        });
    }

    this.addkeyvaluesuccess = function (data) {
        this.loader2.hide();
        this.divtable.show();
        this.lblloadkeyresult.hide();
        this.btnadd.hide();
        this.btnupdate.show();
        EbMessage("show", { Message: 'Key Added Successfully', AutoHide: true, Background: '#00aa00' });
        //alert("Key Added Successfully");
    }
    //-----------------------------------------------------------------------------------------

    this.onclickUlLiPagination = function (e) {
        var title = $(e.target).attr("title");
        var totalPages = Math.ceil(this.resultCount / this.pageSize);
        var currentWinPage = (this.currentPage - 1) % this.windowSize + 1;
        var currentWindowStart = this.currentPage - currentWinPage + 1;
        if (title === "Previous" && this.currentPage > 1) {
            this.currentPage--;
            if (this.currentPage >= currentWindowStart) {
                this.drawSearchResult(currentWinPage - 1);
            }
            else {
                this.currentWindow--;
                this.Offset = this.pageSize * this.windowSize * (this.currentWindow - 1);
                this.getKeySuggestionAjaxCall();
            }
        }
        if (title === "Next" && totalPages != this.currentPage) {
            this.currentPage++;
            if (this.currentPage < (currentWindowStart + this.windowSize)) {
                this.drawSearchResult(currentWinPage + 1);
            }
            else {
                this.currentWindow++;
                this.Offset = this.pageSize * this.windowSize * (this.currentWindow - 1);
                this.getKeySuggestionAjaxCall();
            }
        }
        if (title === "First" && this.currentPage != 1) {
            this.currentPage = 1;
            if (currentWindowStart == 1) {
                this.drawSearchResult(1);
            }
            else {
                this.currentWindow = 1;
                this.Offset = 0;
                this.getKeySuggestionAjaxCall();
            }

        }
        if (title === "Last" && this.currentPage != totalPages) {
            this.currentPage = totalPages;
            var currentWinsize = (this.currentPage - 1) % this.windowSize + 1;
            if (currentWindowStart === (this.currentPage - currentWinsize + 1)) {
                this.drawSearchResult(currentWinsize);
            }
            else {
                this.currentWindow = Math.ceil(this.currentPage / this.windowSize);
                this.Offset = this.pageSize * this.windowSize * (this.currentWindow - 1);
                this.getKeySuggestionAjaxCall();
            }
        }
    }

    this.keyUpActionOnTxtPageNumber = function (e) {
        if (e.keyCode === 13) {
            var pageNo = this.txtPageNumber.val().trim();
            var totalPages = Math.ceil(this.resultCount / this.pageSize);
            if (pageNo > 0 && pageNo <= totalPages) {
                this.currentPage = pageNo;
                var newCurrentWindow = Math.ceil(this.currentPage / this.windowSize);
                if (this.currentWindow === newCurrentWindow) {
                    var currentWinPage = (this.currentPage - 1) % this.windowSize + 1;
                    this.drawSearchResult(currentWinPage);
                }
                else {
                    this.currentWindow = newCurrentWindow;
                    this.Offset = this.pageSize * this.windowSize * (this.currentWindow - 1);
                    this.getKeySuggestionAjaxCall();
                }

            }
        }
    }

    this.init();
};