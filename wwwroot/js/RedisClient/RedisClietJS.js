var EbPrettyJson = function (option) {
    this.Option = $.extend({
        ContetEditable: [],
        HideFields: []
    }, option);

    this.build = function (_jsobj) {
        this.JsonHtml = [];

        this.JsonHtml.push(`<div class="prety_jsonWrpr">`);
        if (Array.isArray(_jsobj)) {
            this.Arrayflow(_jsobj);
        }
        else if (_jsobj === null) {

        }
        else if (typeof _jsobj === 'object') {
            this.objectFlow(_jsobj);
        }
        else {
            this.PropFlow(_jsobj);
        }

        this.JsonHtml.push(`</div>`);
        return this.JsonHtml.join("");
    }

    this.objectFlow = function (o) {
        let last = Object.keys(o)[Object.keys(o).length - 1];
        this.JsonHtml.push(`<div class="a_ob_o">{</div><ol class="a_o">`);
        for (let key in o) {
            if (Array.isArray(o[key])) {
                this.JsonHtml.push(`<li><a lass="propkey"><span class="property">"${key}"</span> : <span class="array">[</span> </a><ul>`);
                this.dArray(o[key]);
                this.JsonHtml.push(`</ul> <span class="array">]</span></li>`);
            }
            else if (o[key] === null) {

            }
            else if (typeof o[key] === "object") {
                this.JsonHtml.push(`<li><a class="propkey"><span class="property">"${key}"</span> : <span class="object">{</span> </a><ul>`);
                this.dObject(o[key]);;
                this.JsonHtml.push(`</ul><span class="object">}</span></li>`);
            }
            else {
                this.JsonHtml.push(this.dProp(key, o[key], (key === last)));
            }
        }
        this.JsonHtml.push(`</ol><div class="a_ob_o">}</div>`);
    };

    this.Arrayflow = function (a) {
        this.JsonHtml.push(`<div class="a_ob_o">[</div><ol class="a_o">`);
        let cm = "";
        for (let i = 0; i < a.length; i++) {
            cm = (i === a.length - 1) ? "" : ",";
            if (Array.isArray(a[i])) {
                this.JsonHtml.push(`<li>
                                        <a lass="propkey"><span class="array">[</span> </a>
                                            <ul>`);
                this.dArray(a[i]);
                this.JsonHtml.push(`</ul><span class="array">]${cm}</span></li>`);
            }
            else if (a[i] === null) {

            }
            else if (typeof a[i] === "object") {
                this.JsonHtml.push(`<li><a class="propkey"><span class="object">{</span></a><ul>`);
                this.dObject(a[i]);
                this.JsonHtml.push(`</ul><span class="object">}${cm}</span></li>`);
            }
            else {
                this.JsonHtml.push(this.Propitem(a[i], (i === a.length - 1)));
            }
        }
        this.JsonHtml.push(`</ol><div class="a_ob_o">]</div>`);
    }

    this.dArray = function (ai) {
        let cm = "";
        for (let i = 0; i < ai.length; i++) {
            cm = (i === ai.length - 1) ? "" : ",";

            if (Array.isArray(ai[i])) {
                this.JsonHtml.push(`<li><a><span class="array">[</span></a><ul>`);
                this.dArray(ai[i]);
                this.JsonHtml.push(`</ul><span class="array">]${cm}</span></li>`);
            }
            else if (ai[i] === null) {

            }
            else if (typeof ai[i] === "object") {
                this.JsonHtml.push(`<li><a><span class="object">{</span></a><ul>`);
                this.dObject(ai[i]);
                this.JsonHtml.push(`</ul><span class="object">}${cm}</span></li>`);
            }
            else {
                this.JsonHtml.push(this.Propitem(ai[i], (i === ai.length - 1)));
            }
        }
    };

    this.dObject = function (o) {
        let last = Object.keys(o)[Object.keys(o).length - 1];
        let cm = "";
        for (let key in o) {
            cm = (key === last) ? "" : ",";
            if (Array.isArray(o[key])) {
                this.JsonHtml.push(`<li><a class="propkey"><span class="property">"${key}"</span> : <span class="array">[</span> </a><ul>`);
                this.dArray(o[key]);
                this.JsonHtml.push(`</ul><span class="array">]${cm}</span></li>`);
            }
            else if (o[key] === null) {
                this.JsonHtml.push(this.dProp(key, o[key], (key === last)));
            }
            else if (typeof o[key] === "object") {
                this.JsonHtml.push(`<li><a class="propkey"><span class="property">"${key}"</span> : <span class="object">{</span></a><ul>`);
                this.dObject(o[key]);
                this.JsonHtml.push(`</ul><span class="object">}${cm}</span></li>`);
            }
            else {
                this.JsonHtml.push(this.dProp(key, o[key], (key === last)));
            }
        }
    };

    this.Propitem = function (p, isLast) {
        let cm = isLast ? "" : ",";
        if (p === null)
            p = null;
        else if (typeof p === "string")
            p = `"${p}"`;
        else if (typeof p === "number")
            p = p;
        return `<li class="ar_item">${p} ${cm}</li>`;
    }

    this.dProp = function (k, val, isLast) {
        let ce = (this.Option.ContetEditable.indexOf(k) >= 0) ? true : false;
        let hf = (this.Option.HideFields.indexOf(k) >= 0) ? "hide" : "show";
        let cm = isLast ? "" : ",";
        if (val === null)
            val = null;
        else if (typeof val === "string")
            val = `"${val}"`;
        else if (typeof val === "number")
            val = val;

        return `<li class="wraper_line ${hf}">
                        <span class="objkey">"${k}"</span>
                        <span class="colon">:</span>
                        <span class="objval" contenteditable="${ce}">${val}</span>
                        ${cm}
                    </li>`;
    }
};






var RedisClientJS = function () {
    this.currentGrpLink = null;
    this.subnm = null;
    this.temp = null;
    this.indx = null;
    this.listeditval = null;
    this.incr = null;
    window.tp = null;
    this.keynm = null;
    

    this.init = function () {

        this.pjson = new EbPrettyJson();
        $("#keyslist").off("click").on("click",".grp_link", this.groupClick.bind(this));
        $("#btninset").off("click").on("click", this.Keyinsertfn.bind(this));
        $("#btngrpinsert").off('click').on("click", this.GroupPatternfn.bind(this));
        $("#Btnsrch").off('click').on('click', this.Keysearchfn.bind(this));
        $("#btnregex").off('click').on('click', this.Regxfn.bind(this));
        $("#btnkeys").off('click').on('click', this.Allkeysfn.bind(this));
        $("#btnlpush").off('click').on('click', this.ListInsertLpushfn.bind(this));
        $("#btnrpush").off('click').on('click', this.ListInsertRpushfn.bind(this));
        $("#btnlistcancel").off('click').on('click', this.listCancel.bind(this));
        $("#btnhashinsert").off('click').on('click', this.HashInsertfn.bind(this));
        $("#btnhashcancel").off('click').on('click', this.HashCancel.bind(this));
        $("#btnsetinsert").off('click').on('click', this.SetInsertfn.bind(this));
        $("#btnsetcancel").off('click').on('click', this.SetCancel.bind(this));
        $("#btnsortedsetinsert").off('click').on('click', this.SortedsetInsertfn.bind(this));
        $("#btnsortedsetcancel").off('click').on('click', this.SortedsetCancel.bind(this));
        $(`#subkeydiv`).off("click").on("click",".sub_link", this.subClick.bind(this));
        $("#btnkeydel").off('click').on('click', this.KeyPressDeletefn.bind(this));
        $("#btnrenamekey").off('click').on('click', this.KeyRenamefn.bind(this));
        $("#btnedit").off("click").on("click", this.Editfn.bind(this));
        $("#btnjsonview").off("click").on("click", this.Jsonviewfn.bind(this));
        $("#divterminal").on("keypress", ".terminalcls", this.Terminalfn.bind(this));
        $("#tablog").off("clicl").on("click", this.LogViewfn.bind(this));
        $(".tablelog").off("click").on("click",".logrow", this.LogChangesfn.bind(this));
        
    };

    this.groupClick = function (ev) {
        this.currentGrpLink = ev.target;
        $('#smallbtn').hide();
        $(`#outerdisp`).hide();
        $('#btnkeys a[href="#dispvalue"]').tab('show');
        this.GroupName = $(ev.target).closest(".grp_link").attr("data-ptn");
        let data = [];
        //  var p = "^" + this.GroupName;
        var p = this.GroupName;
        for (let i = 0; i < _temp.length; i++) {
            var k = _temp[i];
            var match = (k.match(p));
            if (match != null) {
                data.push(k);
            }
        }
        let h = [];
        for (let i = 0; i < data.length; i++) {
            h.push(`<li class="sub_link list-group-item" ><a>${data[i]}</a></li>`);
        }
        $(`#subkeydiv`).empty().append(h.join(""));

        $(`#savediv`).hide();
        //$(`#smallbtn`).hide();
        $(`#dispval`).hide();

    };

    this.subClick = function (ev) {
        $(`#outerdisp`).show();
        $(`#savediv`).show();
        $(`#dispval`).show();
        $("#dispval").attr('contenteditable', false);
        this.SubName = $(ev.target).closest(".sub_link").text();
        this.subnm = this.SubName;
        this.keynm = this.SubName;
        $('#smallbtn').show();
        if ((this.SubName != "")) {
            $.ajax(
                {
                    url: "../RedisManager/FindVal",
                    data: { "key_name": this.SubName },
                    cache: false,
                    type: "POST",
                    success: function (ob) {
                        window.tp = ob.type;
                       
                        if (ob.type === "string") {
                            var html = `<div> 
                                            <div  height=10%> <strong>KEY :</strong>${ob.key}  &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<strong>TYPE :</strong>${ob.type} 
                                              <input type="button" id="btnstringedit" class="btn btn-xs btn-info col-md-offset-7"  value="Save"/>
                                                 </div>
                                        </div>`;
                            $("#savediv").empty().append(html);
                            $(`#btnstringedit`).hide();
                            $("#dispval").empty().append(ob.obj);
                        }
                        //<div style=" display: inline-block;  float: right; "  >  /div> 
                        else
                            if ((ob.type === "list") || (ob.type === "set")) {
                                var html = `<div>
                                                <div  height=10%> <strong>KEY :</strong>${ob.key}&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<strong> TYPE :</strong> ${ob.type}
                                                <input type="button" id="btnlistedit" rediskey="${ob.key}" class="btn btn-xs btn-info col-md-offset-7" value="Save" />
                                                  </div >
                                           </div >`

                                let html1 = `<table class="listtable table table-striped table table-bordered table-hover table-responsive" id="table_${ob.key}" contenteditable="false">
                                             <thead><tr><th>#</th> <th>MEMBERS</th></tr></thead><tbody>`;

                                //this.SubName = $(ev.target).closest(".listtable").text();
                                $.each(ob.obj, function (i) {
                                    var k = "lst" + i;
                                    html1 += `<tr id="${i}" tabindex="${i}" class="listlink"><td class="tdlistid"   style="width:5%" contenteditable="false">${i}</td> <td class="tdlistval">${ob.obj[i]}</td>
                                   </tr>`;

                                });
                                html1 += `</tbody></table><input type="button" class="btn btn-default btnl_add" value="+" id="btnl+" />`;


                                // $("#dispval").empty().append(JSON.stringify(ob.obj));

                                $("#savediv").empty().append(html);
                                $(`#btnlistedit`).hide();
                                $("#dispval").empty().append(html1);
                                $(".btnl_add").hide();
                                $(".btnl_add").click(function () {
                                    this.incr += 1;

                                    // let html = `<tr  class="listlink"><td>${ob.obj.length} </td><td></td></tr>`;
                                    let html = `<tr id="${ob.obj.length}" tabindex="${ob.obj.length}" class="listlink"><td class="tdlistid"   style="width:5%" contenteditable="false">${ob.obj.length}</td> <td class="tdlistval"></td>
                                   </tr>`;

                                    $("table tbody").append(html);
                                    ob.obj.length++;
                                    // $(`#table_${this.subnm}`).append(html);

                                }.bind(this));
                                //$(".listsave").hide();
                            }
                            else
                                if ((ob.type === "hash")|| (ob.type === "zset")) {
                                    var html2 = `<div>
                                                <div  height=10%> <strong>KEY :</strong>${ob.key}&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<strong> TYPE :</strong> ${ob.type}
                                                <input type="button" id="btnhashedit" rediskey="${ob.key}" class="btn btn-xs btn-info col-md-offset-7" value="Save" />
                                                  </div >
                                           </div >`
                                    //border = "1" width = "100" style = "width:100%"
                                    var html = `<table  class="hashtable table table-striped table table-bordered table-hover table-responsive" id="table_${ob.key}" contenteditable="false" >
                                           <thead><tr><th>#</th> <th> FIELD</th><th>VALUE</th></tr></thead><tbody>`;
                                    let c = 0;
                                    $.each(ob.obj, function (i, k) {

                                        html += `<tr  id="${c}" tabindex="${c}" class="hashlink"> <td style="width:5%" contenteditable="false"> ${c++} </td><td style="width:40%" class="tdhashfield">${i}</td><td class="tdhashval">${k}</td></tr>`;
                                    });
                                    html += `</tbody></table><input type="button" class="btn btn-default btnh_add" value="+" id="btnh+" />`
                                    // $("#dispval").empty().append(JSON.stringify(html));
                                    $("#savediv").empty().append(html2);
                                    $(`#btnhashedit`).hide();
                                    $("#dispval").empty().append(html);
                                    $(".btnh_add").hide();
                                    $(".btnh_add").click(function () {
                                        this.incr += 1;
                                        let html = `<tr  id="${c}"class="hashlink"> <td style="width:5%" contenteditable="false"> ${c++} </td><td style="width:40%" class="tdhashfield"></td><td class="tdhashval"></td></tr>`;


                                        $("table tbody").append(html);
                                        ob.obj.length++;
                                        // $(`#table_${this.subnm}`).append(html);

                                    }.bind(this));
                                }

                    }
                });
        }
    }

    this.Keyinsertfn = function () {
        if ((($("#txtkey").val() != "")) && ($("#txtval").val())) {
            $.ajax({
                url: "../RedisManager/Keyvalueinput",
                data: { textkey: $("#txtkey").val(), textvalue: $("#txtval").val() },
                cache: false,
                type: "POST",
                success: function (status) {
                    if (status) {
                        alert("Success");

                        this.insertKeyToArr($("#txtkey").val());
                        if (this.currentGrpLink !== null)
                            $(this.currentGrpLink).click();
                        else
                            this.Allkeysfn();
                        $("#txtkey").val('');
                        $("#txtval").val('');
                    }
                    else {
                        alert("Key Already Exists");
                        $("#txtkey").val('');
                        $("#txtval").val('');
                    }
                }.bind(this)
            });
        }
        else {
            alert("Please Specify Key and Value");
        }
    };

    this.insertKeyToArr = function (newKey) {
        _temp.push(newKey);
    };
    this.deleteKeyFromArr = function (oldKey) {
        var index = _temp.indexOf(oldKey);
        if (index > -1) {
            _temp.splice(index, 1);
        }
    };

    this.KeyPressDeletefn = function () {
        var retVal = confirm("Delete Key ?");
        if (retVal === true) {
            $.ajax({
                url: "../RedisManager/Keydeletes",
                data: { textdel: this.subnm },
                cache: false,
                type: "POST",
                success: function (status) {
                    if (status) {
                        alert(this.subnm + " Deleted");
                        this.deleteKeyFromArr(this.subnm);
                        $(this.currentGrpLink).click();
                        $("#dispval").empty();
                        $('#smallbtn').hide();
                        $("#dispval").hide();
                        $(`#outerdisp`).hide();
                        this.Allkeysfn();
                        var str = this.subnm;
                        if (str.indexOf("Grp_") == 0) {
                            $(".keyslist li:has('grp_name'):contains('dfg')").remove();
                        }
                    }
                    else {
                        alert("Key not found");
                        $("#dispval").empty();
                        $("#dispval").hide();
                        $(`#outerdisp`).hide();
                    }
                }.bind(this)
            });
           
        }
    };

    this.KeyRenamefn = function () {
        if (($("#txtrename").val() != "")) {
            $.ajax({
                url: "../RedisManager/Renamekey",
                data: { oldkey: this.subnm, newkey: $("#txtrename").val() },
                cache: false,
                type: "POST",
                success: function (status) {
                    if (status) {
                        alert(this.subnm + " Reanmed to " + $("#txtrename").val());
                        $("#smallbtn").hide();
                        $("#txtrename").val('');
                        this.Allkeysfn();
                        $("#dispval").empty();
                    }
                    else {
                        alert("Key with same name found");
                        $("#txtrename").val('');
                    }
                }.bind(this)
            });
        }
        else {
            alert("Key cannot be empty");
        }
    };

    this.GroupPatternfn = function () {
        if (($("#txtnm").val() != "") && ($("#txtptn").val() != "")) {
            var regptn = btoa($("#txtptn").val());
            $.ajax({

                url: "../RedisManager/GroupPattern",
                data: { textgroup: $("#txtnm").val(), textpattern: regptn },
                cache: false,
                type: "POST",
                success: function () {
                    var ad = `<li>    <a class="grp_link list-group-item" role="tab" href="#dispvalue" data-toggle="tab" data-ptn="${$("#txtptn").val()}" grp_name="${$("#txtnm").val()}">${$("#txtnm").val()}</a></li>`
                    alert("success");
                    $("#txtnm").val('');
                    $("#txtptn").val('');
                    $("#keyslist").append(ad);
                }
            });
        }
        else {
            alert("Please Specify Group Name and pattern");
            $("#txtnm").val('');
            $("#txtptn").val('');
        }
    };

    this.Terminalfn = function (e) {
        
        var tar = e.target;
        var keycode = e.which;
        auto_arr = auto_arr.sort();
      
        $(tar).autocomplete({
            source: auto_arr,
            //classes: {

            //    //"ui-autocomplete": "highlight",
            //    //"ui-autocomplete": "height",
            //    //"ui-autocomplete": "width"

            //},
            autoFocus: true,
            minLength: 2,
           
        });

        if (keycode === 13)
        {
            $.ajax({
                url: "../RedisManager/Terminal",
                data: { cmd: tar.value },
                cache: false,
                type: "POST",
                success: function (val) {
                    var t = typeof (val);
                    $(tar).prop('disabled', true);
                    if (t === "string") {
                        var html = `<div class="divanswer"> 
                                  &nbsp &nbsp &nbsp &nbsp &nbsp${val}
                                   </div>`;
                        $(tar).next(".tresponse").empty().append(html);
                    }
                    else if (t === "object") {
                        var html2 = `< table >`;
                       
                        $.each(val, function (i) {
                           
                            html2 += `<tr id="${i}"  class="tblterinal"><td class="tdlistid"   style="width:5%" contenteditable="false"> &nbsp &nbsp &nbsp &nbsp &nbsp${val[i]}</td> 
                                   </tr>`;
                        });

                        html2 += `</table>`;
                        $(tar).next(".tresponse").empty().append(html2);
                    }
                    $("#divterminal").append(` >> <input type="text" class="active terminalcls txtboxwidth "  style=" background-color: #0f1315; color: #6ce890;" autofocus>
                    <div  class="tresponse"  style=" background-color: #0f1315; color: #2795ee;">
                   </div>`);
                               
                }.bind(this)

            });
          

        }
    };

    this.Editfn = function () {
        if (window.tp === "string") {
            $("#savediv").attr('contenteditable', false);
            $("#dispval").attr('contenteditable', true);
            $("#btnstringedit").show();
            $("#btnstringedit").off("click").on("click", this.StringValEditfn.bind(this));
        }
        if (window.tp === "list") {
            $("#btnlistedit").show();
            $(`#table_${this.subnm}`).attr('contenteditable', true);
            $(".btnl_add").show();
            $("#savediv").attr('contenteditable', false);
            $(".btnl_add").show();
            
            $("#btnlistedit").off("click").on("click", this.savelistfn.bind(this));
        }
        if (window.tp === "set") {
            $("#btnlistedit").show();
            $(`#table_${this.subnm}`).attr('contenteditable', true);
            $(".btnl_add").show();
            $("#savediv").attr('contenteditable', false);
            $(".btnl_add").show();

            $("#btnlistedit").off("click").on("click", this.savesetfn.bind(this));
        }
        if ((window.tp === "hash") || (window.tp === "zset")) {
            $("#btnhashedit").show();
            $(`#table_${this.subnm}`).attr('contenteditable', true);
            $(".btnh_add").show();
            $("#savediv").attr('contenteditable', false);
            $(".btnh_add").show();

            $("#btnhashedit").off("click").on("click", this.savehashfn.bind(this));
        }
    };

    this.savelistfn = function (ev) {
        var ob = {};
        $(`#table_${this.subnm}`).find(".listlink").each(function (i, o) {
            ob[eval($(o).attr("id"))] = $(o).find(".tdlistval").text().trim();
        });

        if (!$.isEmptyObject(ob)) {
            $.ajax({
                url: "../RedisManager/ListValEdit",
                data: { l_keyid: this.subnm, dict: JSON.stringify(ob) },
                cache: false,
                type: "POST",
                success: function () {
                    alert("success");
                    $("#btnlistedit").hide();
                    $(".btnl_add").hide();

                }
            });
         
            $("#dispval").attr('contenteditable', false);
        }
        else {
            alert("Value not Specified");
        }
    };

    this.savehashfn = function (ev) {
        var ob1 = {};
        $(`#table_${this.subnm}`).find(".hashlink").each(function (i, o) {
           
            ob1[$(o).find(".tdhashfield").text().trim()] = $(o).find(".tdhashval").text().trim();
        });

        if (!$.isEmptyObject(ob1)) {
            $.ajax({
                url: "../RedisManager/HashValEdit",
                data: { h_keyid: this.subnm, dict: JSON.stringify(ob1) },
                cache: false,
                type: "POST",
                success: function () {
                    alert("success");
                    $("#btnhashedit").hide();
                    $(".btnh_add").hide();

                }
            });

            $("#dispval").attr('contenteditable', false );
        }
        else {
            alert("Value not Specified");
        }
    };

    this.savesetfn = function (ev) {
        var ob2 = {};
        $(`#table_${this.subnm}`).find(".listlink").each(function (i, o) {
            ob2[eval($(o).attr("id"))] = $(o).find(".tdlistval").text().trim();
        });

        if (!$.isEmptyObject(ob2)) {
            $.ajax({
                url: "../RedisManager/SetValEdit",
                data: { l_keyid: this.subnm, dict: JSON.stringify(ob2) },
                cache: false,
                type: "POST",
                success: function () {
                    alert("success");
                    $("#btnlistedit").hide();
                    $(".btnl_add").hide();

                }
            });

            $("#dispval").attr('contenteditable', false);
        }
        else {
            alert("Value not Specified");
        }
    };

    this.StringValEditfn = function () {
        window.stringval = $("#dispval").html();
        if (stringval != "") {
            $.ajax({
                url: "../RedisManager/StringvalEdit",
                data: { key1: this.subnm, value1: stringval },
                cache: false,
                type: "POST",
                success: function (status) {
                    if (status) {
                        alert("Success");
                        $("#btnstringedit").hide();
                        $("#dispval").attr('contenteditable', false);
                    }
                    else {
                        alert("Not Successful");
                    }
                }
            });
        }
        else {
            alert("Please Specify Value Properly");
        }
    };

    this.Regxfn = function () {

        if ($("#txtregex").val() != "") {
            var ptn;
            ptn = $("#txtregex").val();
            var regptn = btoa(ptn);
            $.ajax({
                url: "../RedisManager/FindRegexMatch",
                //data: { text :$("#t1").val() },
                data: { textregex: regptn },
                //$("#t1").val(),
                cache: false,
                type: "POST",
                success: this.Showkeys.bind(this)
            });
            $('#smallbtn').hide();
            $(`#outerdisp`).hide();
        }
        else { alert("Please Specify the regular expresion"); }
    };

    this.Keysearchfn = function () {
        var ptn;
        var objptn = $("#ptns").val();
        if (objptn == 1)
            ptn = $("#t1").val() + "*";
        if (objptn == 2)
            ptn = "*" + $("#t1").val();
        if (objptn == 3)
            ptn = "*" + $("#t1").val() + "*";
        $.ajax({
            url: "../RedisManager/FindMatch",
            data: { text: ptn },
            cache: false,
            type: "POST",
            success: this.Showkeys.bind(this)
        });
        $('#smallbtn').hide();
        $(`#outerdisp`).hide();
    };
    
    this.ListInsertLpushfn = function () {
        if (($("#txtlistkey").val() != "") && ($("#txtlistval").val() != "")) {
            $.ajax({
                url: "../RedisManager/ListInsert",
                //data: { text :$("#t1").val() },
                data: { txtlistkey: $("#txtlistkey").val(), txtlistval: $("#txtlistval").val(), flag: 1 },
                //$("#t1").val(),
                cache: false,
                type: "POST",
                success: function () {
                    alert("Value Inserted to List");
                    $("#txtlistval").val('');
                    this.Allkeysfn();
                }.bind(this)
            });
        }
    };

    this.ListInsertRpushfn = function () {
        if (($("#txtlistkey").val() != "") && ($("#txtlistval").val() != "")) {
            $.ajax({
                url: "../RedisManager/ListInsert",
                //data: { text :$("#t1").val() },
                data: { txtlistkey: $("#txtlistkey").val(), txtlistval: $("#txtlistval").val(), flag: 2 },
                //$("#t1").val(),
                cache: false,
                type: "POST",
                success: function () {
                    alert("Value Inserted to List");
                    $("#txtlistval").val('');
                    this.Allkeysfn();
                }.bind(this)
            });

        }

    };
    
    this.listCancel = function () {

        $("#txtlistkey").val('');

    };

    this.HashInsertfn = function () {
        if (($("#txthashfield").val() != "") && ($("#txthashval").val() != "")) {
            $.ajax({
                url: "../RedisManager/HashInsert",
                //data: { text :$("#t1").val() },
                data: { txthashkey: $("#txthashkey").val(), txthashfield: $("#txthashfield").val(), txthashval: $("#txthashval").val() },
                //$("#t1").val(),
                cache: false,
                type: "POST",
                success: function () {
                    alert("Value Inserted to Hash");
                    $("#txthashval").val('');
                    $("#txthashfield").val('');
                    this.Allkeysfn();
                }.bind(this)
            });

        }

    };

    this.HashCancel = function () {

        $("#txthashkey").val('');
        $("#txthashval").val('');
        $("#txthashfield").val('');

    };
   
    this.SetInsertfn = function () {
        if ($("#txtsetval").val() != "")  {
            $.ajax({
                url: "../RedisManager/SetInsert",
                data: { txtsetkey: $("#txtsetkey").val(), txtsetval: $("#txtsetval").val() },
                cache: false,
                type: "POST",
                success: function () {
                    alert("Value inserted to set");
                    $("#txtsetval").val('');
                    this.Allkeysfn();
                }.bind(this)
            });
        }
    };
    
    this.SetCancel = function () {
        $("#txtsetkey").val('');
        $("#txtsetval").val('');
    };

    this.SortedsetInsertfn = function () {
        if (($("#txtsortedsetscr").val() != "") && ($("#txtsortedsetval").val() != "")) {
            $.ajax({
                url: "../RedisManager/SortedsetInsert",
                data: { txtzsetkey: $("#txtsortedsetkey").val(), txtzsetscr: $("#txtsortedsetscr").val(), txtzsetval: $("#txtsortedsetval").val() },
                cache: false,
                type: "POST",
                success: function () {
                    alert("Value inserted to set");
                    $("#txtsortedsetscr").val('');
                    $("#txtsortedsetval").val('');
                    this.Allkeysfn();
                }.bind(this)
            });
        }
    };

    this.SortedsetCancel = function () {
        $("#txtsortedsetkey").val('');
        $("#txtsortedsetscr").val('');
        $("#txtsortedsetval").val('');
    };
    
    this.Allkeysfn = function () {
       
        
        //$('#dispvalue').split({
        // orientation: 'vertical'
        //});


        $("#dispval").hide();
        $("#savediv").hide();
        $("#smallbtn").hide();
        $(`#savediv`).hide();
        var ptn ="*"+sln_name + "*";
        $.ajax({
            url: "../RedisManager/FindMatch",
            data: { text: ptn },
            cache: false,
            type: "POST",
            success: this.Showkeys.bind(this)
        });
    };

    this.Showkeys = function (list1) {

        $('#btnkeys a[href="#dispvalue"]').tab('show');
        this.currentGrpLink = null;
        $('#subkeydiv').empty()
        let html = [];
         list1 = list1.sort();
        $.each(list1, function (i) {
            html.push(`<li class="sub_link list-group-item  " ><a>${list1[i]}</a></li>`);
          
        });
        //html += `</table>`;
        //$("#subkeydiv").append(html);
        $(`#subkeydiv`).empty().append(html.join(""));

    };

    this.Jsonviewfn = function () {

        //$(`#dispval`).empty();
        $("#dispval").attr('contenteditable', false);
        if ((this.keynm != "")) {
            $.ajax(
                {
                    url: "../RedisManager/FindVal",
                    data: { "key_name": this.keynm },
                    cache: false,
                    type: "POST",
                    success: function (ob) {

                        $("#dispval").empty().append(this.pjson.build(ob));
                    }.bind(this)
                });
        }
    };

    this.LogViewfn = function () {
        $(".logrow").empty();
        $.ajax({
            url: "../RedisManager/SetActivityLog",
            data: {},
            cache: false,
            type: "POST",
            success: function (ob2) {
                var html3 = null;
                $.each(ob2, function (i) {
                    html3 += `<tr class="logrow" logid="${ob2[i].logId}"> <td>${ob2[i].changedBy}</td>  <td>${ob2[i].changedAt}</td>  <td>${ob2[i].operation}</td>  <td>${ob2[i].key}</td>  </tr>`;

                });
                $(".tablelog").append(html3);
            }.bind(this)
        });
    };



    this.LogChangesfn = function (ev) {
        var lgrow = ev.target.parentElement.getAttribute("logid");
        $.ajax({
            url: "../RedisManager/ViewLogChanges",
            data: { logid: lgrow},
            cache: false,
            type: "POST",
            success: function (ob3) {
                var html4 = ob3.new_val;
                var html5 = ob3.prev_val;

                $(".currentval").empty().append(html4);
                $(".previousval").empty().append(html5);
            }.bind(this)
        });
    };


    this.init();
};