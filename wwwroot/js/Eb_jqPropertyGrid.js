function CreatePropGrid(columnsext) {
    var setObj = {
        AggInfo: true,
        DecimalPlace: 2,
        buyColor: '#00ff00',
        RenderAs: "default",
        ebtype: 'I am ebtype'
    };

    // This is our settings object metadata
    var cpOptions = { preferredFormat: 'hex', showInput: true, showInitial: true };
    var metaObj = {
        AggInfo: { group: 'Behavior ', name: 'Aggragate', type: 'boolean' },
        DecimalPlace: { group: 'Behavior ', name: 'DecimalPlace', type: 'number', options: { min: 0, max: 500, step: 10 } },
        RenderAs: { group: 'Behavior ', name: 'RenderAs', type: 'options', options: [{ text: 'default', value: "default" }, { text: 'Progressbar', value: "Progressbar" }] },
        buyColor: { group: 'Appearance', name: 'Buy color', type: 'color', options: cpOptions },
        ebtype: { group: 'Misc ', name: 'Ebtype', type: 'options', options: ['Yes', 'No', { text: 'Not sure', value: 'Maybe' }] }
    };

// This is the metadata object that describes the target object properties (optional)
    var theCustomTypes = {
        icon: {
            html: function (elemId, name, value, meta) { // custom renderer for type (required)
                return '<i class="fa fa-' + value + '"></i>';
            },
            valueFn: function () { return 'Icon field value'; }
        },
        ebtype: {
            html: function (elemId, name, value, meta) { // custom renderer for type (required)
                return '<div style="background:pink" onclick = "f()"><i  class="fa fa-' + 'database' + '"></i></div>';
            },
            valueFn: function () { return JSON.stringify(JSON.parse('{ "name":"John", "age":30, "city":"New York"}')) }
        }
    };

    setTimeout(function () {
        $('#Table_Settings_wrapper').css("display", "inline-block");
        $("#settingsmodal [class=modal-content]").css("width", "1000px");
    }, 1);


    alert(JSON.stringify(columnsext));
    $('#propGrid').jqPropertyGrid(setObj, { meta: metaObj, customTypes: theCustomTypes });

    $('#btnGetValues').click(function () {

        var first = JSON.stringify($('#propGrid').jqPropertyGrid('get'), null, '\t');
        $('#txtValues').val(first + '\n\n');
    });
}
