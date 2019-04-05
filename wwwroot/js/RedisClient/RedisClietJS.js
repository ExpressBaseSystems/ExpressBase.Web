





var RedisClientJS = function () {
    this.currentGrpLink = null;
    this.subnm = null;
    this.temp = null;
    this.ptnarray = [];
    this.indx = null;
    this.listeditval = null;
    this.incr = null;
    window.tp = null;
    this.keynm = null;
    this.objsn = null;
    this.logjsn = null;
    this.history = [];
    this.pos = null;

    this.init = function () {

        this.pjson = new EbPrettyJson();
        $("#keyslist").off("click").on("click", ".grp_link", this.groupClick.bind(this));
        $("#btninset").off("click").on("click", this.Keyinsertfn.bind(this));
        $("#btngrpinsert").off('click').on("click", this.GroupPatternfn.bind(this));
        $("#Bsrch").off('click').on('click', this.Keysearchfn.bind(this));
        $("#btnregex").off('click').on('click', this.Regxfn.bind(this));
        $("#btnkeys").off('click').on('click', this.Allkeysfn.bind(this));
        $("body").on('click', "#totkeys", this.Allkeysfn.bind(this));

        $("#btnlpush").off('click').on('click', this.ListInsertLpushfn.bind(this));
        $("#btnrpush").off('click').on('click', this.ListInsertRpushfn.bind(this));
        $("#btnlistcancel").off('click').on('click', this.listCancel.bind(this));
        $("#btnhashinsert").off('click').on('click', this.HashInsertfn.bind(this));
        $("#btnhashcancel").off('click').on('click', this.HashCancel.bind(this));
        $("#btnsetinsert").off('click').on('click', this.SetInsertfn.bind(this));
        $("#btnsetcancel").off('click').on('click', this.SetCancel.bind(this));
        $("#btnsortedsetinsert").off('click').on('click', this.SortedsetInsertfn.bind(this));
        $("#btnsortedsetcancel").off('click').on('click', this.SortedsetCancel.bind(this));
        $(`#subkeydiv`).off("click").on("click", ".sub_link", this.subClick.bind(this));
        $("#btnkeydel").off('click').on('click', this.KeyPressDeletefn.bind(this));
        $("#btnrenamekey").off('click').on('click', this.KeyRenamefn.bind(this));
        $("#btnedit").off("click").on("click", this.Editfn.bind(this));
        $("#btnjsonview").off("click").on("click", this.Jsonviewfn.bind(this));
        $("#divterminal").on("keypress", ".terminalcls", this.Terminalfn.bind(this));
        $("#tablog").off("clicl").on("click", this.LogViewfn.bind(this));
        $(".tablelog").off("click").on("click", ".logrow", this.LogChangesfn.bind(this));
        $("#btnsave1").off("click").on("click", this.PatternSavefn.bind(this));
        $("#grplists").off("click").on("click", ".cstmgrp_link", this.CustomGroupClick.bind(this));
        $("#btnkeydiff").off('click').on('click', this.Keydifferencefn.bind(this));
        $("#infocol1").on('click', "#ophnkeys", function () { $("#btnkeydiff").click(); }.bind(this));
        $("#objexplorer").off('click').on('click', this.ViewObjectfn.bind(this));

        $("#txtgrp_name").on("keypress", this.EditGrpfn.bind(this));
        $("#btnsave_newptn").off("click").on("click", this.AddPatternfn.bind(this));
        $("#btngrp_save").off('click').on("click", this.EditGroupPatternfn.bind(this));
        $("#btngrpcancel1").off('click').on("click", this.CancelGrpCreatefn.bind(this));
        $("#btngrpcancel2").off('click').on("click", this.CancelGrpEditfn.bind(this));
        $("#edit_grp_list").off('click').on("click", ".remove_item", this.RemoveItemfn.bind(this));
        $("#btninfo").off('click').on("click", this.Infofn.bind(this));
        $("#divterminal").on("keydown", ".terminalcls", this.ArrowClickfn.bind(this));
        $('.previousval').on('scroll', this.Logdiffscrollfn.bind(this));
        $("#sqlview").off('click').on("click", this.Sqlviewfn.bind(this));
        $("#dfltgrp").on("click", function (e) {
            if ($("#cstmgrp").attr("aria-expanded") === 'true') {
                $("#cstmgrp").click();
            }
        });
        $("#cstmgrp").on("click", function () {
            if ($('#dfltgrp').attr("aria-expanded") === 'true') {
                $('#dfltgrp').click();
            }
        });

    };

    this.Logdiffscrollfn = function (e) {
        $('.scrol_2').scroll(function (e) {
            $('.scrol_2').scrollTop(e.target.scrollTop);
        });
    }.bind(this);
    this.Infofn = function () {

        $("#infocol1").empty();
        $('.nav-pills  li').removeClass('active');
        var totkey = _temp.length;
        var opndkey = 0;
        var p = new RegExp("(^solution_\+)");
        var q = new RegExp("(?:(?:.*):(?:.*):)(uc+$|dc+$)");
        var t = new RegExp("EbSolutionConnections*");
        var u = new RegExp("Group_*");
        for (let j = 0; j < _temp.length; j++) {
            let flg = 0;


            if (p.test(_temp[j])) {
                flg = 1;
            }
            if (q.test(_temp[j])) {
                flg = 1;
            }
            if (t.test(_temp[j])) {
                flg = 1;
            }
            if (u.test(_temp[j])) {
                flg = 1;
            }

            $.each(dgrpnames, function (i, k) {

                $.each(k, function (m) {
                    if ((k[m].refid) === _temp[j]) {
                        flg = 1;

                    }
                });

            });
            if (flg === 0) {

                opndkey = opndkey + 1;
            }
        }

        $("#infocol1").append(`<div class="infodiv"><a ><h3 id="totkeys">Total keys :${totkey} </h3></a> </div><div class="infodiv"><a><h3 id="ophnkeys"> Orphaned keys:${opndkey}  </h3></a></div>`)

        $("#infocol2").empty().append(this.pjson.build(slnkey));

        $(".prety_jsonWrpr").css("background-color", "#f2f2f2");


    }

    this.groupClick = function (ev) {
        this.currentGrpLink = ev.target;
        $('.nav-pills  li').removeClass('active');
        $("#eb_common_loader").EbLoader("show");
        $('#smallbtn').hide();
        $(`#outerdisp`).hide();
        $('#btnkeys a[href="#dispvalue"]').tab('show');
        this.GroupName = $(ev.target).closest(".grp_link").attr("grp_name");

        let data = [];
        let rfid = [];
        //  var p = "^" + this.GroupName;
        var p = this.GroupName;
        $.each(dgrpnames, function (i, k) {
            //$.each(m, function (i, k) {
            var match = (i.match(p));
            if (match != null) {

                $.each(k, function (j) {
                    var va = k[j].disp_Name + "                  " + k[j].version;
                    data.push(va);
                    rfid.push(k[j].refid);
                });

            }
            //});
        });

        let h = [];
        for (let i = 0; i < data.length; i++) {
            h.push(`<li class="sub_link list-group-item "refid=${rfid[i]} >${data[i]}</li>`);
        }
        $(`#subkeydiv`).empty().append(h.join(""));
        if (data.length === 0) {

            $("#keyslist").notify("No keys found", { className: "info", autoHideDelay: 750, position: "right top" });
        }
        $(`#savediv`).hide();
        //$(`#smallbtn`).hide();
        $(`#dispval`).hide();
        $("#eb_common_loader").EbLoader("hide");
    };

    this.CustomGroupClick = function (ev) {
        this.currentGrpLink = ev.target;
        $('.nav-pills  li').removeClass('active');
        $("#eb_common_loader").EbLoader("show");
        $("#subkeydiv").empty();
        $('#smallbtn').hide();
        $(`#outerdisp`).hide();
        $('#btnkeys a[href="#dispvalue"]').tab('show');
        this.GroupName = $(ev.target).closest(".cstmgrp_link").attr("data-name");
        this.ptnlst = JSON.parse($(ev.target).closest(".cstmgrp_link").attr("grp-ptns"));
        try {
            let data = [];
            let rfid = [];
            for (let j = 0; j < this.ptnlst.length; j++) {

                var p = new RegExp(this.ptnlst[j]);

                $.each(dgrpnames, function (i, k) {
                    $.each(k, function (j) {
                        if (p.test((k[j].refid))) {
                            data.push(k[j].disp_Name + "                  " + k[j].version);
                            rfid.push(k[j].refid);
                        }

                    });
                });

            }


            let h = [];
            for (let i = 0; i < data.length; i++) {
                h.push(`<li class="sub_link list-group-item" refid="${rfid[i]}" >${data[i]}</li>`);

            }
            $(`#subkeydiv`).empty().append(h.join(""));
        }
        catch (e) {
            $("#grplists").notify(e.message, { className: "info", autoHideDelay: 1200, position: "right top" });
        }
        $(`#savediv`).hide();
        $(`#dispval`).hide();
        $("#eb_common_loader").EbLoader("hide");
    };


    this.subClick = function (ev) {
        $("#eb_common_loader").EbLoader("show");
        $(`#outerdisp`).show();
        $(`#dispval`).empty();
        $(`#savediv`).empty();

        $("#dispval").attr('contenteditable', false);
        $("#subkeydiv > li").removeClass('li_select');
        $(ev.target).addClass('li_select');
        this.SubName = $(ev.target).closest(".sub_link").attr("refid");
        this.subnm = this.SubName;
        this.keynm = this.SubName;
        if ((this.SubName != "")) {
            $.ajax(
                {

                    url: "../RedisManager/FindVal",
                    data: { "key_name": this.SubName },
                    cache: false,
                    type: "POST",
                    success: function (ob) {
                        window.tp = ob.type;
                        this.objsn = ob;
                        if (ob.type === "string") {
                            var html = `<div class="KeyInfo_OK">
                                            <div class="KeyInfo_OK_lines"><b>Key: </b> ${ob.key}</div>
                                            <div class="KeyInfo_OK_lines"><b>Type: </b> ${ob.type}</div>
                                            <div class="KeyInfo_OK_lines"><b>Last Modified: </b> ${ob.idltm} sec</div>
                                            <div class="KeyInfo_OK_btnWrpr">
                                                <input type="button"  id="btnstringedit" class="btn btn-xs btnbackground pull-right"  value="Save"/>
                                            </div>
                                        </div>`;

                            $("#savediv").empty().append(html);
                            $(`#sqlview`).hide();
                            if (ob.obj.hasOwnProperty("sql")) {
                                $("#sqlview").show();
                            }
                            $(`#btnstringedit`).hide();
                            $("#dispval").empty().append(" <br />" + JSON.stringify(ob.obj))

                        }


                        //<div style=" display: inline-block;  float: right; "  >  /div>
                        else
                            if ((ob.type === "list") || (ob.type === "set")) {
                                var html = `<div class="KeyInfo_OK">
                                            <div class="KeyInfo_OK_lines"><b>Key: </b> ${ob.key}</div>
                                            <div class="KeyInfo_OK_lines"><b>Type: </b> ${ob.type}</div>
                                            <div class="KeyInfo_OK_lines"><b>Last Modified: </b> ${ob.idltm} sec</div>
                                            <div class="KeyInfo_OK_btnWrpr">
                                                <input type="button"  id="btnlistedit" class="btn btn-xs  btnbackground pull-right"  value="Save"/>
                                            </div>
                                        </div>`;

                                let html1 = `<table class="listtable table table-striped table table-bordered table-hover table-responsive" id="table_${ob.key}" contenteditable="false">
                                             <thead><tr><th>#</th> <th>MEMBERS</th></tr></thead><tbody>`;

                                //this.SubName = $(ev.target).closest(".listtable").text();
                                $.each(ob.obj, function (i) {
                                    var k = "lst" + i;
                                    html1 += `<tr id="${i}" tabindex="${i}" class="listlink"><td class="tdlistid"   style="width:5%" contenteditable="false">${i}</td> <td class="tdlistval">${ob.obj[i]}</td>
                                   </tr>`;

                                });
                                $(".closeitem1").children().click(function () {
                                    this.parentElement.style.display = 'none';


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
                                if ((ob.type === "hash") || (ob.type === "zset")) {
                                    var html2 = `<div class="KeyInfo_OK">
                                           <div class="KeyInfo_OK_lines"><b>Key: </b> ${ob.key}</div>
                                            <div class="KeyInfo_OK_lines"><b>Type: </b> ${ob.type}</div>
                                            <div class="KeyInfo_OK_lines"><b>Last Modified: </b> ${ob.idltm}</div>
                                            <div class="KeyInfo_OK_btnWrpr">
                                                <input type="button"  id="btnhashedit" class="btn btn-xs btnbackground pull-right"  value="Save"/>
                                            </div>
                                        </div>`;

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
                                    $(`#sqlview`).hide();
                                    $("#dispval").empty().append(JSON.stringify(ob.obj))
                                    $(".btnh_add").hide();
                                    $(".btnh_add").click(function () {
                                        this.incr += 1;
                                        let html = `<tr  id="${c}"class="hashlink"> <td style="width:5%" contenteditable="false"> ${c++} </td><td style="width:40%" class="tdhashfield"></td><td class="tdhashval"></td></tr>`;


                                        $("table tbody").append(html);
                                        ob.obj.length++;
                                        // $(`#table_${this.subnm}`).append(html);

                                    }.bind(this));
                                }
                                else if (ob.type === "none") {
                                    //alert("Key not set in redis")
                                    $.notify("Key not set in redis", { className: "info", autoHideDelay: 1000, position: "top center" });
                                }
                        $("#eb_common_loader").EbLoader("hide");
                        $('#smallbtn').show();
                        $(`#savediv`).show();
                        $(`#dispval`).show();
                    }.bind(this)

                });


        }

    }.bind(this);

    this.ViewObjectfn = function () {
        let temp_arr = [];
        //var ref = this.subnm;
        temp_arr = this.subnm.split('-');
        // window.location.href = "../Eb_Object/Index?objid=" + temp_arr[3] + "&objtype=" + temp_arr[2] + "";
        window.open("../Eb_Object/Index?objid=" + temp_arr[3] + "&objtype=" + temp_arr[2] + "");
        temp_arr = [];


    };


    this.Keyinsertfn = function () {
        if ((($("#txtkey").val() != "")) && ($("#txtval").val())) {
            $.ajax({
                url: "../RedisManager/Keyvalueinput",
                data: { textkey: $("#txtkey").val(), textvalue: $("#txtval").val() },
                cache: false,
                type: "POST",
                success: function (status) {
                    if (status) {
                        $.notify("Success", { className: "success", autoHideDelay: 1000, position: "top center" });
                        this.insertKeyToArr($("#txtkey").val());
                        if (this.currentGrpLink !== null)
                            $(this.currentGrpLink).click();
                        else
                            this.Allkeysfn();
                        $("#txtkey").val('');
                        $("#txtval").val('');
                    }
                    else {
                        $.notify("Key Already Exists", { className: "info", autoHideDelay: 1000, position: "top center" });
                        $("#txtkey").val('');
                        $("#txtval").val('');
                    }
                }.bind(this)
            });
        }
        else {
            $.notify("Please Specify Key and Value", { className: "info", autoHideDelay: 1000, position: "top center" });
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
                        //alert(this.subnm + " Deleted");
                        $.notify(this.subnm + " Deleted", { className: "success", autoHideDelay: 1000, position: "top center" });
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
                        //alert("Key not found");
                        $.notify("Key not found", { className: "warn", autoHideDelay: 1000, position: "top center" });
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
                        //alert(this.subnm + " Reanmed to " + $("#txtrename").val());
                        $.notify(this.subnm + " Reanmed to " + $("#txtrename").val(), { className: "success", autoHideDelay: 1000, position: "top center" });
                        $("#smallbtn").hide();
                        $("#txtrename").val('');
                        this.Allkeysfn();
                        $("#dispval").empty();
                    }
                    else {
                        //alert("Key with same name found");
                        $.notify("Key with same name found", { className: "info", autoHideDelay: 1000, position: "top center" });
                        $("#txtrename").val('');
                    }
                }.bind(this)
            });
        }
        else {
            //alert("Key cannot be empty");
            $.notify("Key cannot be empty", { className: "warn", autoHideDelay: 1000, position: "top center" });

        }
    };

    this.PatternSavefn = function () {
        if (($(".txtadnlptn").val() != "") && ($("#txtnm").val() != "")) {


            $("#ptnslist").append(`<li class=" list-group-item  " ><a>${$(".txtadnlptn").val()}</a>
            <span class="close closeitem">&times</span></li>`);
            var regptn = new RegExp($(".txtadnlptn").val());
            var c = 0;
            $.each(dgrpnames, function (i, k) {

                $.each(k, function (m) {
                    if ((k[m].refid).match(regptn)) {
                        c = c + 1;

                    }
                });

            });
            if (c === 0)
                $(".modal-header").notify("No Match Found", { position: "right", arrowShow: false });
            if (c > 0)
                $("#btnclosegc").notify(c + "Match Found", "success", { arrowShow: false });


            $(".txtadnlptn").val("");
            $(".closeitem").click(function () {
                this.parentElement.style.display = 'none';


            });
        }


    }.bind(this);

    this.GroupPatternfn = function () {
        if (($("#txtnm").val() != "")) {
            var list = document.getElementById('ptnslist').childNodes;
            var s = $("#txtnm").val();
            if (list.length != 0) {
                var theArray = [];
                var ary = [];
                for (var i = 0; i < list.length; i++) {
                    var arrValue = list[i].children[0].innerText;
                    theArray.push(btoa(arrValue));

                    ary.push(arrValue);
                }
            }
            var x = JSON.stringify(ary);
            var k = `<li>  <a class="cstmgrp_link list-group-item " role="tab" href="#dispvalue" data-toggle="tab" cgrpkey="kname" data-name="${$("#txtnm").val()}" grp-ptns='${x}'>${$("#txtnm").val()}</a>    </li>`
            $("#grplists").append(k);
            //s = s;
            //var cgdict = { s: ary };
            //custom_grps.push(cgdict);
            $.ajax({

                url: "../RedisManager/GroupPattern",
                data: { textgroup: $("#txtnm").val(), ptnlst: theArray },
                cache: false,
                type: "POST",
                success: function () {
                    //alert("success");
                    $.notify("Success", { className: "success", autoHideDelay: 1000, position: "top center" });
                    $("#txtnm").val("");
                    $("#txtptn1").val("");
                    $("#ptnslist").empty();


                }
            });
        }
        else {
            //alert("Please Specify Group Name and pattern");
            $.notify("Please Specify Group Name and pattern", { className: "info", autoHideDelay: 1000, position: "top center" });
            $("#txtnm").val('');
            $("#txtptn").val('');
        }
    }.bind(this);

    this.EditGroupPatternfn = function () {
        if (($("#txtgrp_name").val() != "")) {
            var list = document.getElementById('edgrp_lst').children;
            if (list.length != 0) {
                var theArray = [];
                for (var i = 0; i < list.length; i++) {
                    var arrValue = list[i].children[0].innerText;

                    theArray.push(btoa(arrValue));
                }
            }
        }
        if (($("#txtgrp_name").val() != "") && (theArray.length != 0)) {

            $.ajax({

                url: "../RedisManager/GroupPattern",
                data: { textgroup: $("#txtgrp_name").val(), ptnlst: theArray },
                cache: false,
                type: "POST",
                success: function () {
                    //alert("success");
                    $.notify("Success", { className: "success", autoHideDelay: 1000, position: "top center" });
                    $("#txtgrp_name").val("");
                    $("#txtnewptn").val("");
                    $("#edgrp_lst").empty();
                }
            });
        }
        else {
            //alert("Please Specify Group Name and pattern");
            $.notify("Please Specify Group Name and pattern", { className: "info", autoHideDelay: 1000, position: "top center" });
            $("#txtgrp_name").val('');
            $("#txtnewptn").val('');
        }


    };

    this.EditGrpfn = function (e) {

        var cg_arr = [];
        $.each(custom_grps, function (i) {
            cg_arr.push(i);
        });
        var keycode = e.which;
        $("#txtgrp_name").autocomplete({
            source: cg_arr,

            //autoFocus: true,
            //minLength: 1,
            class: 'ui-autocomplete2'
        });
        if (keycode == 13) {
            $("#edit_grp_list").empty();
            if (cg_arr.Contains($("#txtgrp_name").val())) {
                var c = $("#txtgrp_name").val();
                var cg_val = custom_grps[c];
                //let htm = `<table class="table table-striped table table-bordered table-hover table-responsive" id="grp_lst" contenteditable="true">`;

                let htm = `<ul id="edgrp_lst">`;
                for (var i = 0; i < cg_val.length; i++) {
                    // htm += `<tr id="${i}" ><td  class="ptn_row"><a>${cg_val[i]}</a><span class="close closeitem">&times</span></td></tr>`;
                    this.row_id = i;
                    htm += `<li class="editGrp list-group-item " contenteditable="true"><a>${cg_val[i]}</a>
                        <span class="close btn remove_item">&times</span></li > `;
                }
                htm += `</table>`;


                $("#edit_grp_list").append(htm);
                $("#txtnewptn").removeAttr('disabled');
                $("#btnsave_newptn").removeAttr('disabled');
                $("#btngrp_save").removeAttr('disabled');


            }
            else {
                //alert("Group Not Found..");
                $.notify("Group Not Found..", { className: "warn", autoHideDelay: 1000, position: "top center" });
            }
        }
    };

    this.CancelGrpEditfn = function () {
        $("#txtgrp_name").val("");
        $("#txtnewptn").val("");
        $("#edgrp_lst").empty();
    }.bind(this);

    this.CancelGrpCreatefn = function () {
        $("#txtnm").val("");
        $(".txtadnlptn").val("");
        $("#ptnslist").empty();
    }.bind(this);

    this.RemoveItemfn = function (ev) {
        var li = ev.currentTarget.parentElement;
        var ul = document.getElementById('edgrp_lst');
        ul.removeChild(li);
        ev.target.parentElement.style.display = 'none';
    }.bind(this);

    this.AddPatternfn = function () {

        if (($("#txtnewptn").val() != "")) {
            let html = `<li class="list-group-item " contenteditable="true"><a>${$("#txtnewptn").val()}</a>
                        <span class="close closeitem">&times</span></li > `;

            $("#edgrp_lst").append(html);
            $("#txtnewptn").val("");
        }
    }.bind(this);

    this.Terminalfn = function (e) {
        $('.nav-pills  li').removeClass('active');

        this.pos = this.history.length
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

        if (keycode === 13) {
            this.history.push(tar.value);
            $("#eb_common_loader").EbLoader("show");
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
                    $(".terminalcls").focus();
                    $("#eb_common_loader").EbLoader("hide");
                }.bind(this)

            });


        }

    };

    this.ArrowClickfn = function (e) {
        var tar = e.target;
        var keycode = e.which;

        if (keycode === 38) {
            if (this.pos < 0) this.pos = this.history.length;
            $(tar).val(this.history[this.pos--]);

        }

        if (keycode === 40) {
            if (this.pos === this.history.length) this.pos = 0;
            $(tar).val(this.history[this.pos++]);

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
                    //alert("success");
                    $.notify("Success", { className: "success", autoHideDelay: 1000, position: "top center" });
                    $("#btnlistedit").hide();
                    $(".btnl_add").hide();

                }
            });

            $("#dispval").attr('contenteditable', false);
        }
        else {
            //alert("Value not Specified");
            $.notify("Value not Specified", { className: "warn", autoHideDelay: 1000, position: "top center" });
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
                    //alert("success");
                    $.notify("Success", { className: "success", autoHideDelay: 1000, position: "top center" });
                    $("#btnhashedit").hide();
                    $(".btnh_add").hide();

                }
            });

            $("#dispval").attr('contenteditable', false);
        }
        else {
            //alert("Value not Specified");
            $.notify("Value not Specified", { className: "warn", autoHideDelay: 1000, position: "top center" });
            $("#btnhashedit").hide();
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
                    //alert("success");
                    $.notify("Success", { className: "success", autoHideDelay: 1000, position: "top center" });
                    $("#btnlistedit").hide();
                    $(".btnl_add").hide();

                }
            });

            $("#dispval").attr('contenteditable', false);
        }
        else {
            //alert("Value not Specified");
            $.notify("Value not Specified", { className: "warn", autoHideDelay: 1000, position: "top center" });
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
                        //alert("Success");
                        $.notify("Success", { className: "success", autoHideDelay: 1000, position: "top center" });
                        $("#btnstringedit").hide();
                        $("#dispval").attr('contenteditable', false);
                    }
                    else {
                        //alert("Not Successful");
                        $.notify("Not Successful", { className: "warn", autoHideDelay: 1000, position: "top center" });
                    }
                }
            });
        }
        else {
            //alert("Please Specify Value Properly");
            $.notify("Please Specify Value Properly", { className: "info", autoHideDelay: 1000, position: "top center" });

        }
    };

    this.Regxfn = function () {
        $('.nav-pills  li').removeClass('active');
        $('#dispvalue').split({
            orientation: 'vertical',
            position: '25%',
            invisible: true
        });


    };


    this.dispnamesrch = function () {

    }
    this.Keysearchfn = function (ev) {
        var objptn = parseInt($(ev.target).attr("lival"));
        $('.nav-pills  li').removeClass('active');
        $('#dispvalue').split({
            orientation: 'vertical',
            position: '25%',
            invisible: true
        });
        var ptn;
        //var objptn = $("#ptns").val();
        if ((objptn == 1) || (objptn == 2) || (objptn == 3)) {
            if (objptn == 1)
                ptn = $("#txtsrch").val() + "*";
            if (objptn == 2)
                ptn = "*" + $("#txtsrch").val();
            if (objptn == 3)
                ptn = "*" + $("#txtsrch").val() + "*";
            $.ajax({
                url: "../RedisManager/FindMatch",
                data: { text: ptn },
                cache: false,
                type: "POST",
                success: this.Showkeys.bind(this)
            });
        }
        else if (objptn == 4) {
            $('#btnkeys a[href="#dispvalue"]').tab('show');
            var data = [];
            var rfid = [];
            var ptn = $("#txtsrch").val();
            var p = new RegExp(ptn);
            $.each(dgrpnames, function (i, k) {
                $.each(k, function (j) {
                    var pos = (k[j].disp_Name).search(ptn);
                    if (pos > -1) {
                        var va = k[j].disp_Name + "                  " + k[j].version;
                        data.push(va);
                        rfid.push(k[j].refid);
                    }
                });
            });

            let h = [];
            for (let i = 0; i < data.length; i++) {
                h.push(`<li class="sub_link list-group-item "refid=${rfid[i]} >${data[i]}</li>`);
            }
            $(`#subkeydiv`).empty().append(h.join(""));

        }
        else if (objptn == 5) {
            if ($("#txtsrch").val() != "") {
                if ($("#txtsrch").val() != "\\") {
                    var pt;
                    pt = $("#txtsrch").val();
                    var regptn = btoa(pt);
                    $("#txtsrch").val('');
                    $.ajax({
                        url: "../RedisManager/FindRegexMatch",
                        //data: { text :$("#t1").val() },
                        data: { textregex: regptn },
                        //$("#t1").val(),
                        cache: false,
                        type: "POST",
                        success: function (reslt) {
                            if (reslt.hasOwnProperty(1)) {
                                this.Showkeys(reslt[1]);
                            }
                            else if (reslt.hasOwnProperty(2)) {
                                //alert(reslt[2]);
                                $.notify(reslt[2], { className: "warn", autoHideDelay: 1000, position: "top center" });
                            }
                        }.bind(this)
                    });

                }

            }
            else {
                //alert("Please Specify the regular expresion");
                $.notify("Please Specify the regular expresion", { className: "info", autoHideDelay: 1000, position: "top center" });
            }
        }

        $('#smallbtn').hide();
        $("#txtsrch").val('');
        $(`#outerdisp`).hide();
    }.bind(this);


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
                    //alert("Value Inserted to List");
                    $.notify("Value Inserted to List", { className: "success", autoHideDelay: 1000, position: "top center" });
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
                    //alert("Value Inserted to List");
                    $.notify("Value Inserted to List", { className: "success", autoHideDelay: 1000, position: "top center" });
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
                    //alert("Value Inserted to Hash");
                    $.notify("Value Inserted to Hash", { className: "success", autoHideDelay: 1000, position: "top center" });
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
        if ($("#txtsetval").val() != "") {
            $.ajax({
                url: "../RedisManager/SetInsert",
                data: { txtsetkey: $("#txtsetkey").val(), txtsetval: $("#txtsetval").val() },
                cache: false,
                type: "POST",
                success: function () {
                    //alert("Value inserted to set");
                    $.notify("Value inserted to set", { className: "success", autoHideDelay: 1000, position: "top center" });
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
                    //alert("Value inserted to set");
                    $.notify("Value inserted to set", { className: "success", autoHideDelay: 1000, position: "top center" });
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
        $('.nav-pills  li').removeClass('active');
        $('#subkeydiv').empty()
        $("#eb_common_loader").EbLoader("show");
        $('#dispvalue').split({
            orientation: 'vertical',
            position: '25%',
            invisible: true
        });
        $("#dispval").hide();
        $("#savediv").hide();
        $("#smallbtn").hide();
        $(`#savediv`).hide();
        var ptn = "*" + sln_name + "*";
        $.ajax({
            url: "../RedisManager/FindMatch",
            data: { text: ptn },
            cache: false,
            type: "POST",
            success: this.Showkeys.bind(this)
        });
    };

    this.Showkeys = function (list1) {
        $("#eb_common_loader").EbLoader("show");
        $('#btnkeys a[href="#dispvalue"]').tab('show');
        this.currentGrpLink = null;
        $('#subkeydiv').empty();
        var fl = 0;
        let html = [];
        list1 = list1.sort();
        let arr2 = [];
        for (let i = 0; i < list1.length; i++) {
            let arr1 = [];
            let refid = [];
            let flg = 0;
            $.each(dgrpnames, function (j, k) {

                $.each(k, function (m) {
                    if ((k[m].refid) === list1[i]) {
                        flg = 1;
                        var va = k[m].disp_Name + "                  " + k[m].version;
                        arr1.push(va);
                        refid.push(k[m].refid);
                    }
                });

            });
            if (flg === 1) {
                html.push(`<li class="sub_link list-group-item  " refid="${refid[0]}" >${arr1[0]}</li>`);
                fl = 1;
            }
            else {
                arr2.push(list1[i]);
            }


        }

        $.each(arr2, function (i) {

            html.push(`<li class="sub_link list-group-item  " refid="${arr2[i]}" >${arr2[i]} </li>`);
            fl = 1;
        });

        //html += `</table>`;
        //$("#subkeydiv").append(html);
        $(`#subkeydiv`).empty().append(html.join(""));
        if (fl === 0) {
            $.notify("No Keys Found", { className: "info", autoHideDelay: 1000, position: "top center" });
        }
        $("#eb_common_loader").EbLoader("hide");
    };

    this.Jsonviewfn = function () {
        $("#eb_common_loader").EbLoader("show");
        //$(`#dispval`).empty();
        $("#dispval").attr('contenteditable', false);
        if ((this.keynm != "")) {


            $("#dispval").empty().append(this.pjson.build(this.objsn.obj));

            $(".prety_jsonWrpr").css("background-color", "#f2f2f2");


            //$.ajax(
            //    {
            //        url: "../RedisManager/FindVal",
            //        data: { "key_name": this.keynm },
            //        cache: false,
            //        type: "POST",
            //        success: function (ob) {


            //            $("#dispval").empty().append(this.pjson.build(ob));
            //        }.bind(this)
            //    });
        }
        $("#eb_common_loader").EbLoader("hide");

    }.bind(this);

    this.Sqlviewfn = function () {
        $("#popup1").empty();
        var sqltxt = atob(this.objsn.obj.sql);
        $("#popup1").append(sqltxt);
        $("#popup1").dialog({
            autoOpen: true,
            hide: "puff",
            show: "slide",
            title: "Sql View",
            closeText: "close"
        });
        //$("#sqlcontent").empty().append(sqltxt);
    }.bind(this);

    this.LogViewfn = function () {

        $('.nav-pills  li').removeClass('active');
        $("#eb_common_loader").EbLoader("show");
        $(".logrow").empty();
        $("#tbllogs").empty();
        $("#nav").empty();
        $("#logshowvalues").hide();
        $.ajax({
            url: "../RedisManager/SetActivityLog",
            data: {},
            cache: false,
            type: "POST",
            success: function (ob2) {
                var html3 = null;
                $("#tbllogs").append(`  <tr> <th>User</th> <th>Time</th> <th>Command</th> <th>Key</th></tr>`);
                $.each(ob2, function (i) {
                    html3 += `<tr class="logrow" logid="${ob2[i].logId}"> <td>${ob2[i].changedBy}</td>  <td>${ob2[i].changedAt}</td>  <td>${ob2[i].operation}</td>  <td>${ob2[i].key}</td>  </tr>`;

                });
                $("#tbllogs").append(html3);
                $("#eb_common_loader").EbLoader("hide");


                $('#tbllogs').after('<div id="nav"></div>');
                var rowsShown = 7;
                var rowsTotal = $('#tbllogs  tr').length;
                var numPages = rowsTotal / rowsShown;
                for (i = 0; i < numPages; i++) {
                    var pageNum = i + 1;
                    $('#nav').append('<a href="#" rel="' + i + '"><b>' + pageNum + '</b></a> ');
                }
                $('#tbllogs tbody tr').hide();
                $('#tbllogs tbody tr').slice(0, rowsShown).show();
                $('#nav a:first').addClass('active');
                $('#nav a').bind('click', function () {

                    $('#nav a').removeClass('active');
                    $(this).addClass('active');
                    var currPage = $(this).attr('rel');
                    var startItem = currPage * rowsShown;
                    var endItem = startItem + rowsShown;
                    $('#tbllogs tbody tr').css('opacity', '0.0').hide().slice(startItem, endItem).
                        css('display', 'table-row').animate({ opacity: 1 }, 300);
                });


            }
        });




    };

    this.LogChangesfn = function (ev) {


        $("#eb_common_loader").EbLoader("show");
        $(".logrow").removeClass('li_select');
        $(ev.target).closest('tr').addClass('li_select');
        $("#logshowvalues").show();
        var lgrow = ev.target.parentElement.getAttribute("logid");
        $.ajax({
            url: "../RedisManager/ViewLogChanges",
            data: { logid: lgrow },
            cache: false,
            type: "POST",
            success: function (ob3) {
                this.logjsn = ob3;
                $(".currentval").empty().append(ob3[1]);
                $(".previousval").empty().append(ob3[0]);
                $("#eb_common_loader").EbLoader("hide");
            }.bind(this)

        });

    };

    this.Keydifferencefn = function () {

        $('.nav-pills  li').removeClass('active');
        $("#eb_common_loader").EbLoader("show");
        $('#dispvalue').split({
            orientation: 'vertical',
            position: '25%',
            invisible: true
        });

        $("#dispval").hide();
        $("#savediv").hide();
        $("#smallbtn").hide();
        $(`#savediv`).hide();
        let diff = [];
        let rfid = [];
        //var p = new RegExp(this.ptnlst[j]);
        var p = new RegExp("(^solution_\+)");
        var q = new RegExp("(?:(?:.*):(?:.*):)(uc+$|dc+$)");
        var t = new RegExp("EbSolutionConnections*");
        var u = new RegExp("Group_*");
        for (let j = 0; j < _temp.length; j++) {
            let flg = 0;


            if (p.test(_temp[j])) {
                flg = 1;
            }
            if (q.test(_temp[j])) {
                flg = 1;
            }
            if (t.test(_temp[j])) {
                flg = 1;
            }
            if (u.test(_temp[j])) {
                flg = 1;
            }

            $.each(dgrpnames, function (i, k) {

                $.each(k, function (m) {
                    if ((k[m].refid) === _temp[j]) {
                        flg = 1;

                    }
                });

            });
            if (flg === 0) {
                diff.push(_temp[j]);

            }
        }


        let h = [];
        for (let i = 0; i < diff.length; i++) {
            h.push(`<li class="sub_link list-group-item"refid=${diff[i]}>${diff[i]}</li>`);
        }
        $(`#subkeydiv`).empty().append(h.join(""));
        $('#subkeydiv').show();
        $("#eb_common_loader").EbLoader("hide");
    };
    this.init();
};