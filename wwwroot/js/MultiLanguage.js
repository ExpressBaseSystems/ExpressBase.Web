﻿var MultiLanguageObj = function () {

    this.loader = $("#loader");
    this.loader2 = $("#loader2");
    this.txtsearch = $("#txtsearch");
    this.txtaddkey = $("#txtaddkey");
    this.lstkeysuggestion = $("#lstkeysuggestion");
    this.lstlangkeyval = $("#lstlangkeyval");
    this.lblsearchkeyresult = $("#lblsearchkeyresult");
    this.lblsearchkeyresult2 = $("#lblsearchkeyresult2");
    this.lblloadkeyresult = $("#lblloadkeyresult");
    this.divtable = $("#divtable");
    this.searchtext = "";
    this.addnewkeylink = $("#addnewkeylink");
    this.updatekeylink = $("#updatekeylink");
    this.btnselect = $("#btnselect");
    this.btnadd = $("#btnadd");
    this.btnupdate = $("#btnupdate");
    this.btnaddgo = $("#btnaddgo");
    this.ulLiPagination = $("#ulMLPagination li");
    this.txtPageNumber = $("#txtMLPageNumber");
    this.Offset = 0;
    this.resultCount = 0;
    this.currentPage = 1;
    this.dataWindow;
    this.currentWindow = 1;
    this.pageSize = 10;//const
    this.windowSize = 5;//const
    


    this.init = function () {
        $('#MLSettingsModal').on('shown.bs.modal', this.initmodal.bind(this));
        $('a[data-toggle="tab"]').on('shown.bs.tab', this.tabchanged.bind(this));
        this.txtsearch.on('keyup', this.keyupaction.bind(this));
        this.lstkeysuggestion.on('keyup', this.keyUpActionOnLstKeySuggestion.bind(this));
        this.txtPageNumber.on('keyup', this.keyUpActionOnTxtPageNumber.bind(this));
        this.addnewkeylink.on('click', this.onclickaddnewkeylink.bind(this));
        this.updatekeylink.on('click', this.onclickupdatekeylink.bind(this));
        this.btnaddgo.on('click', this.onclickaddgo.bind(this));
        this.btnupdate.on('click', this.onclickbtnupdate.bind(this));
        this.btnadd.on('click', this.onclickbtnadd.bind(this));
        this.ulLiPagination.on('click', this.onclickUlLiPagination.bind(this));
    };

    this.initmodal = function () {
        this.lblsearchkeyresult.hide();
        this.lblsearchkeyresult2.hide();
        this.loader.hide();
        this.btnadd.hide();
        this.btnupdate.hide();
        $('.nav-tabs a[href="#menusearch"]').tab('show');
        this.txtsearch.focus();
        this.divtable.hide();
        this.loader2.show();
        this.loadlang();
    };

    this.tabchanged = function (e) {
        var target = $(e.target).text();
        if (target === "Search") {
            $(btnadd).hide();
            $(btnupdate).hide();
            $(btnselect).show();
            $(txtsearch).focus();
        }
        else if (target === "Add/Update") {
            $(btnselect).hide();
            if (($(this.lblsearchkeyresult).css("display") === 'block' && $(this.txtsearch).val().trim() === $(this.txtaddkey).val()) || $(this.lblloadkeyresult).css("display")==='block') {
                $(btnupdate).hide();
                $(btnadd).show();
            }
            else {
                $(btnadd).hide();
                $(btnupdate).show();
            }
            if ($(txtaddkey).attr('data-value') !== $(txtaddkey).val().trim() || $(txtaddkey).attr('data-id') === "")
            $.each($(divtable).find("tbody tr"), function (j, obj) {
                $($(obj).children()[1]).children().val("");
            });
            $(txtaddkey).focus();
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
        searchtext = $(txtsearch).val().trim();
        if (searchtext === $(txtsearch).attr("data-value"))
            return;
        this.lblsearchkeyresult.hide();
        this.lblsearchkeyresult2.hide();
        $(lstkeysuggestion).children("a").remove();
        this.loader.show();
        if (!force && searchtext.length < 3) {
            this.loader.hide();
            return;
        }
        this.currentPage = 1;
        this.Offset = 0;
        this.currentWindow = 1;
        $(this.txtPageNumber).val("");
        this.getKeySuggestionAjaxCall();        
    };

    this.getKeySuggestionAjaxCall = function () {
        $(lstkeysuggestion).children("a").remove();
        this.loader.show();
        $.ajax({
            type: "POST",
            url: "../MultiLanguage/GetKeySuggestion",
            data: { st: searchtext, off: this.Offset, lim: (this.windowSize * this.pageSize) },
            success: this.getkeysuccess.bind(this)
        });
    }

    this.getkeysuccess = function (data) {
        $(lstlangkeyval).children().remove();
        this.loader.hide();
        var parsedData = JSON.parse(data);
        this.resultCount = parsedData.Count;
        this.dataWindow = parsedData.D_member;
        var currentWinPage = (this.currentPage - 1) % this.windowSize + 1;
        this.drawSearchResult(currentWinPage);
    };

    this.drawSearchResult = function (wPage) {
        var wPageStart = (wPage - 1) * this.pageSize;
        var dWindowLength = Object.keys(this.dataWindow).length;
        if (dWindowLength < wPageStart || dWindowLength === 0) {
            $(txtsearch).attr("data-value", "");
            $(lblsearchkeyresult).show();
            return;
        }
        $(txtsearch).attr("data-value", $(txtsearch).val().trim());
        $(lstkeysuggestion).children("a").remove();
        for (var i = wPageStart; i < wPageStart + this.pageSize; i++) {
            var k = this.dataWindow[i];
            if (k != null)
                $(lstkeysuggestion).append(`<a href='#' style='padding:5px; border:none' class='list-group-item' data-id= '${k[0].KeyId}' data-value='${k[0].Key}' data-object='${JSON.stringify(k)}'>${k[0].Key}</a>`);
        }

        $("#divPageNumberDisplay").children("i").text("Page " + this.currentPage + " of " + Math.ceil(this.resultCount / this.pageSize));
        $(this.txtPageNumber).val(this.currentPage);
        $(lstkeysuggestion).children("a").click(this.onclicklstitem.bind(this));
    }

    this.onclicklstitem = function (e) {
        this.drawLanguageAndValues(e.target);
    };

    this.drawLanguageAndValues = function (element) {
        var currentElement = element;
        $(lstkeysuggestion).children("a").removeClass("active");
        $(currentElement).addClass("active");
        $(lstlangkeyval).children().remove();
        var objarray = JSON.parse($(currentElement).attr('data-object'));
        for (var i = 0; i < objarray.length; i++)
            $(lstlangkeyval).append(`<div class="" style="padding:5px; cursor:pointer;"> 
                                            <div class='' style='display:inline-block ; width:30%'> ${objarray[i].Language} </div> 
                                            <div  style='display:inline-block; '> ${objarray[i].KeyValue} </div> 
                                        </div>`);
        $(txtsearch).val($(currentElement).text());
        $(txtsearch).attr("data-value", $(currentElement).attr("data-value"));
        $(txtsearch).attr("data-id", $(currentElement).attr("data-id"));
        $(txtsearch).attr("data-object", $(currentElement).attr("data-object"));
        $(lblsearchkeyresult2).show();
        
    }

    this.keyUpActionOnLstKeySuggestion = function (e) {
        var actElement = $(lstkeysuggestion).children(".active");
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
        var t = $(this.txtsearch).val().trim();
        var v = $(this.txtsearch).attr("data-value");
        if (t === "" || v !== "") {
            alert("Invalid Key Value !");
            return;
        }
        $(this.txtaddkey).val(t);
        $(this.txtaddkey).attr("data-value", t);
        $(this.txtaddkey).attr("data-id", "");
        $(this.lblloadkeyresult).show();
        $('.nav-tabs a[href="#menuadd"]').tab('show');
    };

    this.onclickupdatekeylink = function () {
        var t = $(this.txtsearch).val().trim();
        var v = $(this.txtsearch).attr("data-value");
        if (t === "" || v === "") {
            alert("Invalid Key Value !");
            return;
        }
        $(this.txtaddkey).val(t);
        $(this.txtaddkey).attr("data-value", t);
        $(this.txtaddkey).attr("data-id", $(this.txtsearch).attr("data-id"));
        
        var data =JSON.parse( $(txtsearch).attr("data-object"));
        $.each(data, function (i, k) {    //i->serial index
            $.each($(divtable).find("tbody tr"), function (j, obj) {
                if ($(obj).attr("data-lid") === k.langId.toString()) {
                    $(obj).attr("data-id", k.keyValId.toString());
                    $($(obj).children()[1]).children().val(k.keyValue);
                    $($(obj).children()[1]).children().attr("data-value", k.keyValue);
                }
            });
        });
        $('.nav-tabs a[href="#menuadd"]').tab('show');
    }

    this.loadlang = function () {
        $(divtable).find("tbody").children().remove();
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
            $(divtable).find("tbody").append(`<tr data-lid='${k}' data-id='' style=''> 
                                                <td style='padding:12px; width:200px;'> <b> ${i} </b></td>
                                                <td style='width:751px'>  <input type='text' data-value="" style="width:100%; padding:5px; border:1px solid #ddd"> </td>
                                              </tr>`);
        });
        this.loader2.hide();
        this.divtable.show();
    };

    this.onclickaddgo = function () {
        var text = $(this.txtaddkey).val().trim();
        if (text === "" || $(this.txtaddkey).attr("data-value") === text)
            return;
        $(this.txtaddkey).attr("data-value", text);
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
        $.each($(divtable).find("tbody tr"), function (j, obj) {
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
        $(this.txtaddkey).attr("data-id", data[0].key_Id);
        $.each(data, function (i, k) {    //i->serial index
            $.each($(divtable).find("tbody tr"), function (j, obj) {
                if ($(obj).attr("data-lid") === k.lang_Id.toString()) {
                    $(obj).attr("data-id", k.keyVal_Id.toString());
                    $($(obj).children()[1]).children().val(k.keyVal_Value);
                    $($(obj).children()[1]).children().attr("data-value", k.keyVal_Value);
                }
            });
        });
    };

    this.onclickbtnupdate = function (data) {
        var t = $(this.txtaddkey).val().trim();
        var v = $(this.txtaddkey).attr("data-value");
        var i = $(this.txtaddkey).attr("data-id");
        var dict = new Array();
        if (t !== v) {
            alert("First Load the key value !");
            return;
        }
        $.each($(divtable).find("tbody tr"), function (j, obj) {
            var dataid = $(obj).attr("data-id");
            var langid = $(obj).attr("data-lid");
            var dataval = $($(obj).children()[1]).children().attr("data-value");
            var newval = $($(obj).children()[1]).children().val().trim();
            if (dataval !== newval && newval !== "") {
                dict.push(new Object({ KeyVal_Id: dataid, Key:t, Key_Id:i, Lang_Id:langid, KeyVal_Value: newval }));
                $($(obj).children()[1]).children().attr("data-value", newval);
            }
        });
        if (dict.length === 0)
            return;
        $(this.divtable).hide();
        $(this.loader2).show();
        $.ajax({
            type: "POST",
            url: "../MultiLanguage/UpdateKeyValue",
            data: { d: JSON.stringify(dict) },
            success: this.updatekeyvaluesuccess.bind(this)
        });
    };

    this.updatekeyvaluesuccess = function (data) {
        $(this.loader2).hide();
        $(this.divtable).show();
        alert(data+" Value(s) Successfully Updated ");
    };

    this.onclickbtnadd = function () {
        var key = $(this.txtaddkey).val().trim();
        if (key !== $(this.txtaddkey).attr("data-value")) {
            alert("Load values then click Add");
            return;
        }
        var dict = new Array();
        $.each($(divtable).find("tbody tr"), function (j, obj) {
            var lid = $(obj).attr("data-lid");
            var newval = $($(obj).children()[1]).children().val().trim();
            if (newval !== "")
                dict.push(new Object({Lang_Id: lid, Key_Value: newval}));
        });
        if (key === "" || dict.length === 0)
            return;
        $(this.divtable).hide();
        $(this.loader2).show();
        $.ajax({
            type: "POST",
            url: "../MultiLanguage/AddKeyValue",
            data: { k:key, d: JSON.stringify(dict) },
            success: this.addkeyvaluesuccess.bind(this)
        });
    }

    this.addkeyvaluesuccess = function (data) {
        $(this.loader2).hide();
        $(this.divtable).show();
        alert("Key Added Successfully");
    }
    //-----------------------------------------------------------------------------------------

    this.onclickUlLiPagination = function (e){
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
        if (title === "Next" &&  totalPages != this.currentPage) {
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
            var pageNo = $(this.txtPageNumber).val().trim();
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


    //this.onclickaddnewkey = function () {
    //    var t = $(txtsearch).val;
    //    var v = $(txtsearch).attr("value");
    //    if (t === "" || v != "") {
    //        alert("Invalid Key Value !");
    //        return;
    //    }
    //    this.loader.show();
    //    $("#tbody1").children().remove();
    //    var st = [];
    //    $.ajax({
    //        type: "POST",
    //        url: "../MultiLanguage/getlanguage",
    //        data: { stat: 3, lstrcd: st },
    //        success: this.getlanguagesuccess.bind(this)
    //    });
    //}

    //this.getlanguagesuccess = function (data) {
    //    this.loader.hide();
    //    if (Object.keys(data).length === 0) {
    //        return;
    //    }
    //    $.each(data, function (i, k) {
    //        $("#tbody1").append(`<tr data='${k.dmembers[0]}'> <td> ${k.dmembers[1]} </td> <td> <input type='text' value='' style='border:none'> </td> </tr>`);
    //    });
    //    //$("#divtable").show();
    //}

    //function getlangandvalue(Element) {
    //    //console.log(Element);  
    //    $("#loader").show();
    //    $('#langlist a').remove();
    //    $("#langvalueresult").css("display", "none");
    //    $.ajax({
    //        type: "POST",
    //        url: "../MultiLanguage/getlangandvalue",
    //        data: { id: $(Element).attr("value") },
    //        success: function (data) {
    //            $("#loader").hide();
    //            if (Object.keys(data).length === 0) {
    //                $("#langvalueresult").css("display", "block");
    //                return;
    //            }
    //            $.each(data, function (i, obj) {
    //                $('#langlist').append(`<a href='#' class='list-group-item' value='${obj.id}' data-value='${obj.value}'> ${obj.lang}    ${obj.value} </a>`);
    //            });
    //            //$("#langlist a").click(function () {
    //            //    $("#langlist a").removeClass("active");
    //            //    $(this).addClass("active");
    //            //});
    //        }
    //    });
    //}

    //function selectaction() {
    //    var t = $("#txtsearch").val();
    //    var v = $("#txtsearch").attr("value");
    //    if (t === "" || v === "") {
    //        alert("Select a valid key !");
    //        return;
    //    }
    //    $("#txtfinalvalue").val(t);
    //    $("#txtfinalvalue").attr("value", v);
    //    //reset modal after successful selection of value
    //    $("#keylist a:not(.newkey)").remove();
    //    $("#txtsearch").val("");
    //    $("#txtsearch").attr("value", "");
    //    $("#langlist a").remove();
    //    $("#MLSettingsModal").modal("toggle");
    //}

    //function addnewkey() {
    //    //alert("new key link ");
    //    var t = $("#txtsearch").val();
    //    var v = $("#txtsearch").attr("value");
    //    if (t === "" || v != "") {
    //        alert("Invalid Key Value !");
    //        return;
    //    }
    //    $("#searchkeyresult").hide();
    //    $("#divtable").show();

    //    $.ajax({
    //        type: "POST",
    //        url: "../MultiLanguage/getlanguage",
    //        data: {},
    //        success: function (data) {
    //            $("#loader").hide();
    //            if (Object.keys(data).length === 0) {
    //                $("#langvalueresult").css("display", "block");
    //                return;
    //            }
    //            $.each(data, function (i, obj) {
    //                $('#langlist').append(`<a href='#' class='list-group-item' value='${obj.id}' data-value='${obj.value}'> ${obj.lang}    ${obj.value} </a>`);
    //            });
    //            //$("#langlist a").click(function () {
    //            //    $("#langlist a").removeClass("active");
    //            //    $(this).addClass("active");
    //            //});
    //        }
    //    });

    //}

    //function addkeyaction() {

    //    var key = $("#txtsearch").val();
    //    var value = $("#txtkeyvalue").val();
    //    var langid = $("#selectlang").val();

    //    if (key.length === 0 || value.length === 0) {
    //        alert("Enter a key/value");
    //        return;
    //    }
    //    if (langid === null) {
    //        alert("Select a Language!");
    //        return;
    //    }
    //    $.ajax({
    //        type: "POST",
    //        url: "../MultiLanguage/setkey",
    //        data: { k: key, v: value, lid: langid },
    //        success: function (data) {
    //            $("#txtfinalvalue").val(value);
    //            $("#txtfinalvalue").attr("value", data);

    //            //code for reset modal after successfull add key value
    //            $("#txtsearch").val("");
    //            $("#searchkeyresult").hide();
    //            $("#txtkeyvalue").val("");
    //            $("#selectlang option").remove();
    //            $('#selectlang').append(`<option disabled selected>Select a language</option>`);
    //            $("#myModal").modal("toggle");

    //        }
    //    });


    //}

    //function addvalaction() {
    //    alert("add val action");

    //}

    //function loadlang() {
    //    $("#selectlang option").remove();
    //    $('#selectlang').append(`<option disabled selected>Select a language</option>`);
    //    $.ajax({
    //        type: "POST",
    //        url: "../MultiLanguage/getlang",
    //        data: {},
    //        success: function (data) {
    //            if (Object.keys(data).length === 0) {
    //                alert("Language list not found!");
    //                return;
    //            }
    //            $.each(data, function (i, l) {
    //                $('#selectlang').append(`<option value='${i}' > ${l} </option>`);
    //            });
    //        }
    //    });
    //}



    this.init();

};