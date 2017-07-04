
function createPropGrid(control) {
    //control objects
    {
        var TextBoxObj = {
            props: {
                id: "ID",
                Name: control.attr("id"),
                Label: "",
                Value: "",
                Textmode: "",
                TextTransform: "Normal",
                Font: "consolace",
                LabelForeColor: "a3ac03",
                LabelBackColor: "ffac03",
                TextForeColor: "a3aff3",
                TextBackColor: "f3acff",
                Height: "100",
                AutoCompleteOff: false
            },
            meta: {
                id: { browsable: false },
                AutoCompleteOff: { group: 'Behavior ', name: 'AutoCompleteOff', type: 'boolean' },
                height: { group: 'Layout ', name: 'height', type: 'number', options: { min: 21, max: 500, step: 1 } },
                LabelForeColor: { group: 'Layout', name: 'LabelForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                LabelBackColor: { group: 'Layout', name: 'LabelBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                TextForeColor: { group: 'Layout', name: 'TextForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                TextBackColor: { group: 'Layout', name: 'TextBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                TextTransform: { group: 'Behavior ', name: 'TextTransform', type: 'BootstrapDD', options: ['Normal', "lower case", "UPPER CASE"] },
            }

        }

        var DateObj = {
            props: {
                Name: control.attr("id"),
                Label: "",
                Value: "",
                Font: "consolace",
                LabelForeColor: "a3ac03",
                LabelBackColor: "ffac03",
                TextForeColor: "a3aff3",
                TextBackColor: "f3acff",
                Height: "100",
                MinDate: "",
                MaxDate: "",
            },
            meta: {
                MinDate: { group: 'Layout ', name: 'MinDate', type: 'date', options: { min: 21, max: 500, step: 1 } },
                MaxDate: { group: 'Layout ', name: 'MinDate', type: 'date', options: { min: 21, max: 500, step: 1 } },
                height: { group: 'Layout ', name: 'height', type: 'number', options: { min: 21, max: 500, step: 1 } },
                LabelForeColor: { group: 'Layout', name: 'LabelForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                LabelBackColor: { group: 'Layout', name: 'LabelBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                TextForeColor: { group: 'Layout', name: 'TextForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                TextBackColor: { group: 'Layout', name: 'TextBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
            }
        };

        var NumericBoxObj = {
            props: {
                Name: control.attr("id"),
                Label: "",
                Value: "",
                Font: "consolace",
                LabelForeColor: "a3ac03",
                LabelBackColor: "ffac03",
                TextForeColor: "a3aff3",
                TextBackColor: "f3acff",
                Height: "100",
                MaxValue: 0,
                MinValue: 0,
            },
            meta: {
                MaxValue: { group: 'Layout ', name: 'MaxValue', type: 'number', options: { min: 21, max: 500, step: 1 } },
                MinValue: { group: 'Layout ', name: 'MinValue', type: 'number', options: { min: 21, max: 500, step: 1 } },
                height: { group: 'Layout ', name: 'height', type: 'number', options: { min: 21, max: 500, step: 1 } },
                LabelForeColor: { group: 'Layout', name: 'LabelForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                LabelBackColor: { group: 'Layout', name: 'LabelBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                TextForeColor: { group: 'Layout', name: 'TextForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                TextBackColor: { group: 'Layout', name: 'TextBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
            }
        };
    }

    $('#propGrid').empty();
    $('#propHead').empty().html("<strong> " + control.attr("id") + "</strong>");
    var Props = null;
    var Props = null;

    //$.each(colExt, function (i, obj) {
    if (control.attr("ebtype").trim() === "TextBox") {
        Props = control.data("propsObj") || TextBoxObj.props
        metaObj = TextBoxObj.meta;
    }
    else if (control.attr("ebtype").trim() === "Date") {
        Props = control.data("propsObj") || DateObj.props,
        metaObj = DateObj.meta;
    }
    else if (control.attr("ebtype").trim() === "NumericBox") {
        Props = control.data("propsObj") || NumericBoxObj.props;
        metaObj = NumericBoxObj.meta;
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
            saveObj();
        });
        $('#propGrid table td').find("input").change(function () { saveObj(); });
    }, 1);

    $('#propGrid').jqPropertyGrid(Props, { meta: metaObj, customTypes: theCustomTypes });
    var fObj
    function saveObj() {
        fObj = $('#propGrid').jqPropertyGrid('get');
        fObj["type"] = control.attr("ebtype");
        var first = JSON.stringify(fObj, null, '\t');
        $('#txtValues').val(first + '\n\n');
        control.data("propsObj", fObj);

        FormControls[control.attr("id")] = control.data("propsObj");

    };
    //}

    //$('#btnGetValues').click(function () {
    //    saveObj();
    //});

    $('.selectpicker').on('change', function () {
        var selected = $(this).find("option:selected").val();
        $("#" + selected).focus();
    });
};