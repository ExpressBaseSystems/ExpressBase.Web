function RunDs(obj_id) {
    var res = true;
    var ObjString = CreateObjString(obj_id);
    DrawTable(ObjString, res, obj_id);
}
function CreateObjString(obj_id) {
    var ObjString = "[";
    var name; var value; var type;
    $('.filter_modal_body tbody tr').each(function () {
        $(this).find("td label, select, input").each(function () {
            $(this).removeClass('has-error');
            if ($(this).hasClass("param_val")) {
                if ($(this).hasClass("param_type")) {
                    //ObjString +='\"type\":\"'+  $(this).text()+'\",';
                    ObjString += '\"type\":\"5\",';
                }
                if ($(this).hasClass("param_name")) {
                    ObjString += '{\"name\":\"' + $(this).text() + '\",';
                }
                if ($(this).hasClass("param_value")) {
                    if (!$(this).val()) {
                        $(this).addClass('has-error');
                        res = false;
                    }
                    ObjString += '\"value\":\"' + $(this).val() + '\"},';
                }
            }
        });
    });
    ObjString = ObjString.slice(0, -1) + ']';
    alert(ObjString);
    return ObjString;
}
function DrawTable(ObjString, res, obj_id) {
    if (res == true) {
        $.post('GetColumns4Trial', { dsid: obj_id, parameter: ObjString }, function (result) {
            alert(result);
            if (result == "") {
                $('#filterDialog').modal('hide');
                alert('Error in Query');
            }
            else {
                console.log(cols);
                var cols = JSON.parse(result);
                $("#sample").dataTable({
                    columns: cols,
                    serverSide: true,
                    lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
                    scrollX: "100%",
                    scrollY: "300px",
                    ajax: {
                        url: "https://expressbaseservicestack.azurewebsites.net/ds/data/" + obj_id,
                        type: "POST",
                        data: function (dq) {
                            delete dq.columns; delete dq.order; delete dq.search;
                            dq.Id = obj_id;
                            dq.Token = getToken();
                            //dq.rToken = getrToken();
                            dq.TFilters = [];
                            dq.Params = ObjString;
                        },
                        dataSrc: function (dd) { return dd.data; },
                    }
                });
                $('#filterDialog').modal('hide');
                $('#filterRun').modal('show');
            }
        });
    }
    else {
        alert('not valid');
    }
}
function SaveFilter(obj_id) {
    $(".eb-loader").show();
    var AllInputs = $('.filter_modal_body').find("input, select");
    var ObjString = "[";
    $.each(AllInputs, function (i, inp) {
        if ($(inp).hasClass("param_val")) {
            //ObjString += '{"' + $(inp).attr("id") + '"' + ':"' + $("#" + $(inp).attr("id")).val() + '"},';
            ObjString += '{\"name\":\"' + $(inp).attr("id") + '\",\"type\":\"' + $("#" + $(inp).attr("id")).val() + '\"},';
        }
    })
    ObjString = ObjString.slice(0, -1) + ']';

    $.post("http://dev.eb_roby_dev.localhost:53431/Tenant/SaveFilterDialog", {
        "Id": "0",
        "DsId": obj_id,
        "FilterDialogJson": ObjString,
        "Name": $('#fdname').val(),
        "Description": $('#fddesc').val(),
        "Token": getToken(),
        "isSave": "false",
        "VersionNumber": "1"
    },
                function (result) {
                    $(".eb-loader").hide();
                    success_alert();
                    //$('.fdlist select option:last-child').append("<option value="+@ViewBag.CurrSaveId+" data-tokens="+@ViewBag.CurrSaveId+">"+@ViewBag.CurrSaveId+"</option>");
                });

}
function Execute() {
    //alert("paramsCount" + paramsCount);
    //if (paramsCount == 0) {
    //    ObjString = "";
    //    res = true;
    //    DrawTable(ObjString, res);
    //}
    //else {
        if ($('#fd option:selected').text() === "Select Filter Dialog") {
            alert("Please select a filter dialog");
        }
        else {
            if ($('#fd option:selected').text() !== "Auto Generate Filter Dialog") {
                var objid = $('#fd option:selected').val();
                alert("open selected fd:" + objid);
                $.post("http://dev.eb_roby_dev.localhost:53431/Tenant/GetByteaEbObjects_json", { "ObjId": $('#fd option:selected').val(), "Ebobjtype": "FilterDialog" },
                function (result) {

                    $('#fdtbody').children().remove();
                    $('.fdthead').children().remove();
                    $('.fdthead').append(" <tr>" +
                                                   "<th>Parameter Name</th>" +
                                                   "<th>Parameter Type</th>" +
                                                  "<th>Parameter Value</th>" +
                           " </tr>");

                    for (var key in result) {
                        $('#fdname').val(result[key].name);
                        $('#fddesc').val(result[key].description);
                        var fdjson = result[key].filterDialogJson;
                        $.each(JSON.parse(fdjson), function (i, fdj) {
                            $('#fdtbody').append("<tr><td><label class='param_val align_singleLine param_name'>" + fdj.name + "</label>" +
                                                  "  </td>" +
                                                  "<td><label class='param_val align_singleLine param_type'>" + fdj.type + "</label>" +
                                                " </td>" +
                                                   " <td> <input type='text' name=" + fdj.name + " class='param_val param_value align_singleLine form-control' required/> </td>" +
                                               " </tr>");
                        });
                    }
                    $('#filterDialog').modal('show');
                    $('#saveFilter').hide();
                });
            }
        }
    //}
}
function SelectFD(filterCode) {
    var selectVal = $('#fd option:selected').text();
    if (selectVal === "Auto Generate Filter Dialog") {

        // var filterCode = window.editor.getValue();
        var result = filterCode.match(/\@\w+/g);
        paramsCount = result.length;
        var filterparams = [];
        if (paramsCount > 0) {
            for (var i = 0; i < result.length; i++) {
                result[i] = result[i].substr(1);
                if (result[i] == "search" || result[i] == "and_search" || result[i] == "search_and" || result[i] == "where_search" || result[i] == "limit" || result[i] == "offset" || result[i] == "orderby") {

                }
                else {
                    if ($.inArray(result[i], filterparams) === -1)
                        filterparams.push(result[i]);
                }
            }
            if (filterparams.length != 0) {
                filterparams.sort();
                alert(filterparams);
                $('.fdthead').children().remove();
                $('.fdthead').append(" <tr>" +
                        "<th>Parameter Name</th>" +
                        "<th>Parameter Type</th>" +
                " </tr>");
                $('#fdtbody').children().remove();
                $.each(filterparams, function (i, obj) {
                    $('#fdtbody').append("<tr><td><label class='align_singleLine'>" + obj + "</label>" +
                                          "  </td>" +
                                           " <td>" +
                                            "    <select id=" + obj + " name='fdtype' class='param_val selectpicker show-tick align_singleLine' data-live-search='true' style='display:inline-block !important'>" +
                                             "       <option value='text' data-tokens='text'>text</option>' " +
                                             "       <option value='integer' data-tokens='integer'>integer</option>" +
                                               "     <option value='datetime' data-tokens='datetime'>datetime</option>" +
                                                 "   <option value='boolean' data-tokens='boolean'>boolean</option>" +
                                                "</select>" +
                                           " </td>" +
                                       " </tr>");
                });
                $('#filterDialog').modal('show');
                $('#run').hide();
            }
            else {
                alert("no filters ");
            }
        }
        else {


        }
    }
}
function Save(is_new, obj_id, ver_num) {
    if (is_new === true) {
        $(".commit").trigger("click");
    }
    else {
        $(".eb-loader").show();
        $.post("http://dev.eb_roby_dev.localhost:53431/Tenant/SaveEbDataSource",
            {
                "Id": obj_id,
                "Code": window.editor.getValue(),
                "Name": $('#obj_name').val(),
                "Description": $('#obj_desc').val(),
                "Token": getToken(),
                "isSave": "true",
                "VersionNumber": ver_num
            },
                function (result) {
                    success_alert();
                });
    };
}
function Commit(obj_id, ver_num, cid) {
    $(".eb-loader").show();
    if (obj_id === 0) {
        $.post("http://dev.eb_roby_dev.localhost:53431/Tenant/CommitEbDataSource",
               {
                   "Id": obj_id,
                   "Code": window.editor.getValue(),
                   "Name": $('#obj_name').val(),
                   "Description": $('#obj_desc').val(),
                   "Token": getToken(),
                   "isSave": "true",
                   "VersionNumber": ver_num
               },
                   function (result) {
                       success_alert();
                   });
    }
    var Dswzd = new EbWizard("http://dev.eb_roby_dev.localhost:53431/Tenant/ds_save", "http://dev.eb_roby_dev.localhost:53431/Tenant/CommitEbDataSource", 400, 400, "Commit", "fa-database", "'" + cid + "'");
    Dswzd.CustomWizFunc = new CustomCodeEditorFuncs("'" + cid + "'", obj_id, $('#obj_name').val(), $('#obj_desc').val(), window.editor.getValue(), ver_num).DataSource;
}
function success_alert() {
    $(".eb-loader").hide();
    $('.alert').remove();
    $('.help').append("<div class='alert alert-success alert-dismissable'>" +
"<a class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
"<strong>Success!</strong>" +
"</div>");
}
