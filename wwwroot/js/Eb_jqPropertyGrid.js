var LinkDvObj = function (txt, val) {
    this.text = txt;
    this.value = val;
};

function CreatePropGrid(RowObj, colExt, dvList) {
    var dvListArr = [];
    $.each(dvList, function (key, val) {
        dvListArr.push(new LinkDvObj(val, key));
    });
    $('#propGrid').empty();
    $('#propHead').empty().html("<strong> " + RowObj.name + "</strong>");
    var NumProps = null;
    var metaObj = null;
    $.each(colExt, function (i, obj) {
        if (obj.name === RowObj.name) {
            if (RowObj.type.toString().trim() === "System.Int32" || RowObj.type.toString().trim() === "System.Decimal" || RowObj.type.toString().trim() === "System.Int16" || RowObj.type.toString().trim() === "System.Int64" || RowObj.type.toString().trim() === "System.Double") {
                NumProps = {
                    AggInfo: obj.AggInfo,
                    DecimalPlace: obj.DecimalPlace.toString(),
                    RenderAs: obj.RenderAs.toString(),
                    linkDv: obj.linkDv
                };
                metaObj = {
                    AggInfo: { group: 'Behavior ', name: 'Aggrigate', type: 'boolean' },
                    DecimalPlace: { group: 'Behavior ', name: 'DecimalPlace' },
                    RenderAs: { group: 'Behavior ', name: 'RenderAs', type: 'BootstrapDD', options: ['Default', "Progressbar", 'Link'] },
                    linkDv: { group: 'Behavior ', name: 'linkDv', type: 'linkDD', options: dvListArr },
                };
            } else if (RowObj.type.toString().trim() === "System.Boolean") {
                NumProps = {
                    IsEditable: obj.IsEditable,
                    RenderAs: obj.RenderAs//(obj.RenderAs.type.toString() === "default") ? "default" : (obj.RenderAs.type.toString() === "text") ? "text" : "icon"
                };
                metaObj = {
                    IsEditable: { group: 'Behavior ', name: 'IsEditable', type: 'boolean' },
                    RenderAs: { group: 'Behavior ', name: 'RenderAs', type: 'BootstrapDD', options: ['Default', "Icon"] },
                };
            } else if (RowObj.type.toString().trim() === "System.DateTime") {
                NumProps = {
                    Format: obj.Format
                };
                metaObj = {
                    Format: { group: 'Behavior ', name: 'Format', type: 'BootstrapDD', options: ['Date', 'Time', "DateTime"] },
                };
            } else if (RowObj.type.toString().trim() === "System.String") {
                NumProps = {
                    RenderAs: obj.RenderAs,
                    linkDv: obj.linkDv
                };
                metaObj = {
                    RenderAs: { group: 'Behavior ', name: 'RenderAs', type: 'BootstrapDD', options: ['Default', 'Graph', 'Link'] },
                    linkDv: { group: 'Behavior ', name: 'linkDv', type: 'linkDD', options: dvListArr },
                };
            }
            else
                alert("No matching case found for " + obj.name + "!! \n type : '" + RowObj.type.toString().trim() + "'");
        }
    });

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
    "<button id=" + elemId + " name=" + name + " class='btn btn-dafault dropdown-toggle' type='button' style='min-width: 100px; padding:0px;' data-toggle='dropdown'>" + value +
    " <span class='caret'></span></button>" +
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
                    if (value !== null && value !== undefined) {
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
        //$('#Table_Settings_wrapper table:eq(0)').css("min-width", "813px");
        $('#Table_Settings_wrapper table:eq(1)').css("min-width", "805px");
        $('.prop-grid-cont').css("visibility", "visible");
        $('#propGrid table').removeClass("pgTable").addClass("table-bordered table-hover");
        $('.dropdown ul li').click(function () {
            $(this).parent().siblings('[data-toggle=dropdown]').text($(this).text());
            $(this).parent().siblings('[data-toggle=dropdown]').attr("data-dvid", $(this).children().attr("data-dvid"));
            saveObj();
        });
        $('#propGrid table td').find("input").change(function () { saveObj(); });
        //$('#propGrid table td input').change(function (e) {  saveObj(); });
    }, 1);

    $('#propGrid').jqPropertyGrid(NumProps, { meta: metaObj, customTypes: theCustomTypes });

    function saveObj() {
        var fObj = $('#propGrid').jqPropertyGrid('get');
        fObj["name"] = RowObj.name;
        $.each(colExt, function (i, obj) {
            if (obj.name === RowObj.name) {
                colExt[i] = fObj;
            }

        });
        var first = JSON.stringify(fObj, null, '\t');
        $('#txtValues').val(first + '\n\n');
    }

    $('#btnGetValues').click(function () {
        saveObj();
    });
}