function CreatePropGrid(RowObj, colExt) {
    $('#propGrid').empty();
    $('#propHead').empty().html("<strong> " + RowObj.name + "</strong>");
    var NumProps = null;
    var metaObj = null;
    //alert("ji=" + JSON.stringify(RowObj));
    $.each(colExt, function (i, obj) {
        if (obj.name === RowObj.name) {
            alert("type= " + RowObj.type.toString());
            if (RowObj.type.toString().trim() === "System.Int32" || RowObj.type.toString().trim() === "System.Decimal") {
                NumProps = {
                    AggInfo: obj.AggInfo,
                    DecimalPlace: obj.DecimalPlace,
                    RenderAs: obj.RenderAs.toString()
                };
                metaObj = {
                    AggInfo: { group: 'Behavior ', name: 'Aggragate', type: 'boolean' },
                    DecimalPlace: { group: 'Behavior ', name: 'DecimalPlace', type: 'number', options: { min: 0, max: 500, step: 10 } },
                    RenderAs: { group: 'Behavior ', name: 'RenderAs', type: 'options', options: [{ text: 'default', value: "default" }, { text: 'Progressbar', value: "Progressbar" }] },
                };
            } else if (RowObj.type.toString().trim() === "System.Boolean") {
                NumProps = {
                    IsEditable: obj.IsEditable,
                    RenderAs: obj.RenderAs//(obj.RenderAs.type.toString() === "default") ? "default" : (obj.RenderAs.type.toString() === "text") ? "text" : "icon"
                };
                metaObj = {
                    IsEditable: { group: 'Behavior ', name: 'IsEditable', type: 'boolean' },
                    RenderAs: { group: 'Behavior ', name: 'RenderAs', type: 'BootstrapDD' },
                };
            } else if (RowObj.type.toString().trim() === "System.DateTime") {
                NumProps = {
                };
                metaObj = {
                };
            } else if (RowObj.type.toString().trim() === "System.String") {
                NumProps = {
                };
                metaObj = {
                };
            }
            else
                alert("No matching case found for " + obj.name + "!! \n type : '" + RowObj.type.toString().trim() + "'");
        }


    });

    // This is the metadata object that describes the target object properties (optional)
    var theCustomTypes = {
        icon: {
            html: function (elemId, name, value, meta) { // custom renderer for type (required)
                return '<i class="fa fa-' + value + '"></i>';
            },
            valueFn: function () { return 'Icon field value'; }
        },
        BootstrapDD: {
            html: function (elemId, name, value, meta) { // custom renderer for type (required)
                return "<div class='dropdown'>" +
    "<button class='btn btn-dafault dropdown-toggle' type='button' style='min-width: 100px; padding:0px;' data-toggle='dropdown'>" + value +
    " <span class='caret'></span></button>" +
                "<ul class='dropdown-menu'>" +
      "<li><a href='#'>Default</a></li>" +
      "<li><a href='#'>Text</a></li>" +
      "<li><a href='#'>Icon</a></li>" +
    "</ul>" +
  "</div>";
            },
            valueFn: function () { return $('.dropdown button').text().trim() }
        }
    };

    setTimeout(function () {
        $('#Table_Settings_wrapper').css("width", "822px").css("border", "solid 1px #dededf").css("border-top", "transparent");
        $('.prop-grid-cont').css("visibility", "visible");
        $('#propGrid table').removeClass("pgTable").addClass("table-bordered table-hover");
        $('.dropdown ul li').click(function () {
            $(this).parent().siblings('[data-toggle=dropdown]').text($(this).text());
            saveObj();
        });

        $('#propGrid table td').find("input").change(function () {
            alert("val:" + $(this).val());
            saveObj();
        });
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
        alert("colExt.AggInfo=" + JSON.stringify(colExt));
    });
}