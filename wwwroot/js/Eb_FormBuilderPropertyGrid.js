var txtBox = {
    Name: "",
    Label: "",
    Value: "",
    Textmode: "",
    TextTransform: "LowerCase",
    Height: 0,
    AutoCompleteOff:false
}
function CreatePropGrid(control) {//
    $('#propGrid').empty();
    $('#propHead').empty().html("<strong> " + control.attr("id") + "</strong>");
    var NumProps = null;
    var metaObj = null;
    //$.each(colExt, function (i, obj) {
        if (control.attr("ebtype").trim() === "TextBox") {
            NumProps = txtBox
            metaObj = {
                AutoCompleteOff: { group: 'Behavior ', name: 'Aggragate', type: 'boolean' },
                height: { group: 'Behavior ', name: 'height', type: 'number', options: { min: 21, max: 500, step: 1 } },
                TextTransform: { group: 'Behavior ', name: 'LowerCase', type: 'BootstrapDD', options: ['Normal', "LowerCase", "UpperCase"] },
            };
        }
        //else
           // alert("No matching case found for " + obj.name + "!! \n type : '" + RowObj.type.toString().trim() + "'");
    //});

    // This is the metadata object that describes the target object properties (optional)
    var DDid = null;
    var LDDid = null;
    var theCustomTypes = {
        icon: {
            html: function (elemId, name, value, meta) { // custom renderer for type (required)
                return '<i class="fa fa-' + value + '"></i>';
            },
            valueFn: function () { return 'Icon field value'; }
        },
        BootstrapDD: {
            html: function (elemId, name, value, meta) { // custom renderer for type (required)
                var _html = "<div class='dropdown'>" +
    "<button id=" + elemId + " name=" + name + " class='btn btn-dafault dropdown-toggle' type='button' style='min-width: 100px; padding:0px;' data-toggle='dropdown'><div style='display: inline-block; overflow: hidden; text-overflow: ellipsis; '>" + value +
    " </div><span class='caret' style='vertical-align: super'></span></button>" +
                "<ul class='dropdown-menu'>"
                $.each(meta.options, function (i, val) { _html += "<li><a href='#'>" + val + "</a></li>"; })
                _html += "</ul></div>";
                DDid = elemId;
                return _html.toString();
            },
            valueFn: function () {
                return $('#' + DDid).text().trim();
            }
        },
        linkDD: {
            html: function (elemId, name, value, meta) { // custom renderer for type (required)
                var txt = "";
                var _html = "<div class='dropdown'>" +
    "<button id=" + elemId + " name='Select dv' class='btn btn-dafault dropdown-toggle' type='button' style='min-width: 100px; padding:0px;' data-toggle='dropdown'>" +
    "$$text" +
    " <span class='caret'></span></button>" +
                "<ul class='dropdown-menu'>"
                $.each(meta.options, function (i, val) {
                    _html += "<li><a  id=" + elemId + i + "  href='#' data-dvid='" + val.value + "'>" + val.text + "</a></li>"
                    if (value !== null) {
                        if (val.value.toString() === value.toString())
                            txt = val.text;
                    }
                })
                _html += "</ul></div>";
                LDDid = elemId;
                return _html.toString().replace("$$text", txt);
            },
            valueFn: function () {
                return parseInt($('#' + LDDid).attr("data-dvid"));
            }
        }
    };

    setTimeout(function () {
        $('#Table_Settings_wrapper').css("width", "813px");
        $('#Table_Settings_wrapper table:eq(0)').css("min-width", "813px");
        $('#Table_Settings_wrapper table:eq(1)').css("min-width", "805px");
        $('#form-buider-propGrid').css("visibility", "visible");
        $('#propGrid table').removeClass("pgTable").addClass("table-bordered table-hover");
        $('.dropdown ul li').click(function () {
            $(this).parent().siblings('[data-toggle=dropdown]').text($(this).text());
            $(this).parent().siblings('[data-toggle=dropdown]').attr("data-dvid", $(this).children().attr("data-dvid"));
            //saveObj();
        });
        //$('#propGrid table td').find("input").change(function () { saveObj(); });
    }, 1);

    $('#propGrid').jqPropertyGrid(NumProps, { meta: metaObj, customTypes: theCustomTypes });

    //function saveObj() {
    //    var fObj = $('#propGrid').jqPropertyGrid('get');
    //    fObj["name"] = RowObj.name;
    //    $.each(colExt, function (i, obj) {
    //        if (obj.name === RowObj.name) {
    //            colExt[i] = fObj;
    //        }

    //    });
    //    var first = JSON.stringify(fObj, null, '\t');
    //    $('#txtValues').val(first + '\n\n');
    //}

    //$('#btnGetValues').click(function () {
    //    saveObj();
    //});
}