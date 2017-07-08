var TextBoxObj = function (id) {
    this.id= id
    this.Name = id,
    this.__type = "ExpressBase.Objects.EbTextBox",
    this.IsContainer = false,
    this.props = {
        Name: id,
        Parent: "",
        Sibling: "",
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
    this.meta = {
        Parent: { group: 'meta ', name: 'Parent', type: 'label' },
        Sibling: { group: 'meta ', name: 'Sibling', type: 'label' },
        AutoCompleteOff: { group: 'Behavior ', name: 'AutoCompleteOff', type: 'boolean' },
        height: { group: 'Layout ', name: 'height', type: 'number', options: { min: 21, max: 500, step: 1 } },
        LabelForeColor: { group: 'Layout', name: 'LabelForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
        LabelBackColor: { group: 'Layout', name: 'LabelBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
        TextForeColor: { group: 'Layout', name: 'TextForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
        TextBackColor: { group: 'Layout', name: 'TextBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
        TextTransform: { group: 'Behavior ', name: 'TextTransform', type: 'BootstrapDD', options: ['Normal', "lower case", "UPPER CASE"] },
    }
}

var GridViewObj = function (id) {
    this.id = id
    this.Name = id,
    this.__type = "ExpressBase.Objects.EbTextBox",
    this.IsContainer = true,
    this.Controls = new EbControlCollection();
    this.Controls.Append(new GridViewTdObj(id + "_Td0"));
    this.Controls.Append(new GridViewTdObj(id + "_Td1"));
    this.props = {
        Name: id,
        Parent: "",
        Sibling: "",
        Rows: 2,
        Columns: 2,
    },
    this.meta = {
        Parent: { group: 'meta ', name: 'Parent', type: 'label' },
        Sibling: { group: 'meta ', name: 'Sibling', type: 'label' },
        height: { group: 'Layout ', name: 'height', type: 'number', options: { min: 21, max: 500, step: 1 } },
    }
}

var GridViewTdObj = function (id) {
    this.id = id
    this.Name = id,
    this.__type = "ExpressBase.Objects.EbTextBox",
    this.Controls = new EbControlCollection(),
    this.IsContainer = true,
    this.props = {
        Name: id,
        Parent: "",
        Sibling: "",
    },
    this.meta = {
        Parent: { group: 'meta ', name: 'Parent', type: 'label' },
        Sibling: { group: 'meta ', name: 'Sibling', type: 'label' },
    }
}

//var DateObj = {
//    props: {
//        Name: control.attr("id"),
//        Label: "",
//        Value: "",
//        Font: "consolace",
//        LabelForeColor: "a3ac03",
//        LabelBackColor: "ffac03",
//        TextForeColor: "a3aff3",
//        TextBackColor: "f3acff",
//        Height: "100",
//        MinDate: "",
//        MaxDate: "",
//    },
//    meta: {
//        MinDate: { group: 'Layout ', name: 'MinDate', type: 'date', options: { min: 21, max: 500, step: 1 } },
//        MaxDate: { group: 'Layout ', name: 'MinDate', type: 'date', options: { min: 21, max: 500, step: 1 } },
//        height: { group: 'Layout ', name: 'height', type: 'number', options: { min: 21, max: 500, step: 1 } },
//        LabelForeColor: { group: 'Layout', name: 'LabelForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
//        LabelBackColor: { group: 'Layout', name: 'LabelBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
//        TextForeColor: { group: 'Layout', name: 'TextForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
//        TextBackColor: { group: 'Layout', name: 'TextBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
//    }
//};

//var NumericBoxObj = {
//    props: {
//        Name: control.attr("id"),
//        Label: "",
//        Value: "",
//        Font: "consolace",
//        LabelForeColor: "a3ac03",
//        LabelBackColor: "ffac03",
//        TextForeColor: "a3aff3",
//        TextBackColor: "f3acff",
//        Height: "100",
//        MaxValue: 0,
//        MinValue: 0,
//    },
//    meta: {
//        MaxValue: { group: 'Layout ', name: 'MaxValue', type: 'number', options: { min: 21, max: 500, step: 1 } },
//        MinValue: { group: 'Layout ', name: 'MinValue', type: 'number', options: { min: 21, max: 500, step: 1 } },
//        height: { group: 'Layout ', name: 'height', type: 'number', options: { min: 21, max: 500, step: 1 } },
//        LabelForeColor: { group: 'Layout', name: 'LabelForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
//        LabelBackColor: { group: 'Layout', name: 'LabelBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
//        TextForeColor: { group: 'Layout', name: 'TextForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
//        TextBackColor: { group: 'Layout', name: 'TextBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
//    }
//};

var EbControlCollection = function () {
    this.InnerCollection = [];

    this.ToArray = function () {
        return this.InnerCollection;
    };
    this.PopByName = function (_name) {
        var parentId = $("#" + _name).parent().attr("id");
        var ele = this.GetByName(_name);

        if (parentId === "form-buider-form")
            return this.InnerCollection.pop(this.InnerCollection.indexOf(ele));

        var parent = this.GetByName(parentId);
        return parent.Controls.InnerCollection.pop(parent.Controls.InnerCollection.indexOf(ele));
    };

    this.AppendIn = function (newObject) {
        var parentId = $("#" + newObject.Name).parent().attr("id");
        var parent = this.GetByName(parentId);
        return parent.Controls.InnerCollection.push(newObject);
    };

    this.Append = function (newObject) {
        this.InnerCollection.push(newObject);
    };

    this.PopByindex = function () {

    };

    this.InsertAt = function (index, newObject) {
        var parentId = $("#" + newObject.Name).parent().attr("id");
        var parent = this.GetByName(parentId);
        parent.Controls.InnerCollection.splice(index, 0, newObject);
        return parent.Controls.InnerCollection.length;
    };

    this.InsertBefore = function (beforeObj, newObject) {
        this.InnerCollection.splice(this.InnerCollection.indexOf(beforeObj), 0, newObject);
    };

    this.GetByIndex = function (_index) {
        return this.InnerCollection[_index];
    };


    this.GetByName = function (_name) {
        var retObject = new Object();
        this.GetByNameInner(_name, this.InnerCollection, retObject);
        return (retObject.Value) ? retObject.Value : null;
    };


    this.GetByNameInner = function (_name, _collection, retObject) {
        for (var i = 0; i < _collection.length; i++) {
            if (_collection[i].Name === _name) {
                retObject.Value = _collection[i];
                break;
            }
            else {
                if (_collection[i].IsContainer && _collection[i].Controls.ToArray().length > 0) {
                    this.GetByNameInner(_name, _collection[i].Controls.InnerCollection, retObject);
                }
            }
        }
    };

    this.DelByName = function (_name) {
        var retObject = new Object();
        this.DelByNameInner(_name, this.InnerCollection, retObject);
        return retObject.Value;
    };

    this.DelByNameInner = function (_name, _collection, retObject) {
        for (var i = 0; i < _collection.length; i++) {
            if (_collection[i].Name === _name) {
                _collection.splice(i, 1);
                break;
            }
            else {
                if (_collection[i].IsContainer && _collection[i].Controls.ToArray().length > 0)
                    this.DelByNameInner(_name, _collection[i].Controls.InnerCollection, retObject);
            }
        }
    };

};

var formBuilder = function (toolBoxid, formid) {
    this.Name = "form-buider-form";
    this.toolBoxid = toolBoxid;
    this.formid = formid;
    this.ComboBoxCounter = 0;
    this.NumericBoxCounter = 0;
    this.DateCounter = 0;
    this.ButtonCounter = 0;
    this.GridViewCounter = 0;
    this.TextBoxCounter = 0;
    this.curControl = null;
    this.currentProperty = null;
    this.Controls = new EbControlCollection();
    this.drake = null;
    // need to change
    this.CurRowCount = 2;
    this.CurColCount = 2;
    this.movingObj = {};

    this.save = function () {
        //alert("save:" + JSON.stringify(this.Controls));
        $(".eb-loader").show();

        $.post("SaveFilterDialog", {
            "Id": 0,
            "FilterDialogJson": JSON.stringify(this.Controls.ToArray()),
            "Name": $('#save_txtBox').val(),
            "Description": "",
            "isSave": "false",
            "VersionNumber": "1"
        }, this.Save_Success.bind(this));
    };

    this.Save_Success = function (result) {
        alert("Saved");
        $(".eb-loader").hide();
        $('.alert').remove();
        $('.help').append("<div class='alert alert-success alert-dismissable'>" +
    "<a class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
    "<strong>Success!</strong>" +
    "</div>");
    };

    $("#saveformBtn").on("click", this.save.bind(this));

    this.CreatePG = function (control) {
        $('#propGrid').empty();
        $('#propHead').empty().html("<strong> " + control.props.Name + "</strong>");

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

        setTimeout(this.SetTimeOutFn.bind(this), 1);

        $('#propGrid').jqPropertyGrid(control.props, { meta: control.meta, customTypes: theCustomTypes });

        $('.selectpicker').on('change', function () {
            var selected = $(this).find("option:selected").val();
            $("#" + selected).focus();
        });


        //$("#propGrid td:contains(Columns)").next().children().on("focus click", this.RFocus.bind());
    };

    this.saveObj = function () {
        $('#propGrid').jqPropertyGrid('get');
        $('#txtValues').val(JSON.stringify(this.Controls) + '\n\n');
    };

    this.SetTimeOutFn = function () {
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
        $('#propGrid table td').find("input").change(this.PGinputChange.bind(this));
    };

    this.PGinputChange = function (e) {
        this.currentProperty = $(e.target);
        this.updateHTML();
        this.saveObj();

        this.CurColCount = $(e.target).val();//tmp
    };

    this.movesfn = function (el, source, handle, sibling) {
        this.makeTdsDropable();
        return true;
    };

    this.acceptFn = function (el, target, source, sibling) {
        // prevent tool box copy
        if ($(source).attr("id") === "form-buider-toolBox" && $(target).attr("id") === "form-buider-toolBox") {
            return false;
        }
        // allow copy except toolbox
        if ($(source).attr("id") === "form-buider-toolBox" && $(target).attr("id") !== "form-buider-toolBox") {
            return true;
        }
        // sortable with in the container
        if ($(source).attr("id") !== "form-buider-toolBox" && source === target) {
            return true;
        }
        else {
            return true;
        }

    };

    this.controlOnFocus = function (e) {
        this.curControl = $(e.target).closest(".controlTile");
        e.stopPropagation();
        this.curControl.children('.ctrlHead').show();
        this.CreatePG(this.Controls.GetByName(this.curControl.attr("id")));
        this.CurColCount = $(e.target).val();
    };

    this.makeTdsDropable = function () {
        $.each($(".tdDropable"), this.tdIterFn.bind(this));
    };

    this.tdIterFn = function (i) {
        if (this.drake) {
            if (!this.drake.containers.contains(document.getElementsByClassName("tdDropable")[i])) {
                this.drake.containers.push(document.getElementsByClassName("tdDropable")[i]);
            }
        }
    }

    this.onDragFn = function (el, source) {
        console.log("onDragFn");
        //if drag start within the form
        if (!($(source).attr("id") === "form-buider-toolBox")) {
            console.log("el poped");
            this.movingObj = this.Controls.PopByName($(el).attr("id"));
        }
        else
            this.movingObj = null;
    }// start

    this.onDragendFn = function (el) {
        console.log("onDragendFn");
        var sibling = $(el).next();
        console.log("sibling: " + sibling.attr("id"));
        var target = $(el).parent();
        if (this.movingObj) {

            //Drag end with in the form
            if (target.attr("id") !== "form-buider-toolBox") {
                console.log("elObj : " + JSON.stringify(this.movingObj));
                console.log("sibling : " + sibling.attr("id"));
                if (sibling.attr("id")) {
                    console.log("sibling : " + sibling.id);
                    var idx = sibling.index() - 1;
                    this.Controls.InsertAt(idx, this.movingObj);
                }
                else {
                    console.log("no sibling ");
                    this.Controls.AppendIn(this.movingObj)
                }
                this.saveObj();
            }

        }
    }

    this.onDropFn = function (el, target, source, sibling) {
        //drop from toolbox to form
        if ($(source).attr("id") === "form-buider-toolBox") {
            //if ( $(source).parentsUntil("div", "[id=form-buider-toolBox]") ) {
            var _html = "";

            el.className = 'controlTile';
            $(el).attr("tabindex", "1");
            $(el).attr("onclick", "event.stopPropagation();$(this).focus()");
            $(el).attr("onfocusout", "$(this).children('.ctrlHead').hide()");

            $(el).on("focus", this.controlOnFocus.bind(this))

            $(el).attr("ebtype", $(el).text().trim());
            if ($(el).text().trim() === "TextBox") {
                var id = "TextBox" + this.TextBoxCounter++;
                $(el).attr("id", id);
                _html = "<input type='text' readonly style='width:100%' />";
                if ($(target).attr("id") === "form-buider-form")
                    this.Controls.Append(new TextBoxObj(id));
                else
                    this.Controls.GetByName($(target).attr("id")).Controls.Append(new TextBoxObj(id));
            }
            else if ($(el).text().trim() === "ComboBox") {
                $(el).attr("id", "ComboBox" + this.ComboBoxCounter++);
                _html = "<div role='form' data-toggle='validator' style=' width: inherit;'><input type='hidden' name='acmasteridHidden4val' data-ebtype='16' id='acmasterid'> <div id='acmasteridLbl' style='display: inline-block;'></div> <div id='acmasteridWraper' data-toggle='tooltip' title='' data-original-title=''><div style='display: inline-block; width: 33%; margin-right: -4px;'><div class='input-group'><div class='dropdown v-select searchable' id='acmasterid0'><div type='button' class='dropdown-toggle clearfix' style='border-top-left-radius: 5px; border-bottom-left-radius: 5px;'> <input debounce='0' type='search'  readonly  placeholder='label0' class='form-control' id='acmaster1_xid' style='width: 100%; background-color: #fff;'> <i role='presentation' class='open-indicator' style='display: none;'></i> <div class='spinner' style='display: none;'>Loading...</div></div> <!----></div> <span class='input-group-addon' style='border-radius: 0px;'><i id='acmasteridTglBtn' aria-hidden='true' class='fa  fa-search'></i></span></div></div> <div style='display: inline-block; width: 33%; margin-right: -4px;'><div class='input-group'><div class='dropdown v-select searchable' id='acmasterid1'><div type='button' class='dropdown-toggle clearfix'> <input debounce='0' type='search' placeholder='label1' readonly class='form-control' id='acmaster1_name' style='width: 100%; background-color: #fff;'> <i role='presentation' class='open-indicator' style='display: none;'></i> <div class='spinner' style='display: none;'>Loading...</div></div> <!----></div> <span class='input-group-addon' style='border-radius: 0px;'><i id='acmasteridTglBtn' aria-hidden='true' class='fa  fa-search'></i></span></div></div> <div style='display: inline-block; width: 33%; margin-right: -4px;'><div class='input-group'><div class='dropdown v-select searchable' id='acmasterid2'><div type='button' class='dropdown-toggle clearfix'> <input debounce='0' type='search' readonly placeholder='label2' class='form-control' id='tdebit' style='width: 100%; background-color: #fff;'> <i role='presentation' class='open-indicator' style='display: none;'></i> <div class='spinner' style='display: none;'>Loading...</div></div> <!----></div> <span class='input-group-addon'><i id='acmasteridTglBtn' aria-hidden='true' class='fa  fa-search'></i></span></div></div></div> <div id='acmasterid_loadingdiv' class='ebCombo-loader'><i id='acmasterid_loading-image' class='fa fa-spinner fa-pulse fa-2x fa-fw' style='display: none;'></i><span class='sr-only'>Loading...</span></div> <center><div id='acmasteridDDdiv' class='DDdiv expand-transition' style='width: 600px; display: none;'><table id='acmasteridtbl' class='table table-striped table-bordered' style='width: 100%;'></table></div></center></div>";
            }
            else if ($(el).text().trim() === "NumericBox") {
                $(el).attr("id", "NumericBox" + this.NumericBoxCounter++);
                _html = "<div class='Eb-ctrlContainer'  style='width:100%; min-height: 12px;'><span id='nameLbl' >Amount</span><div  class='input-group'><span class='input-group-addon'>$</span><input type='text'  class='numinput' name='name'  data-toggle='tooltip' title='toolTipText' id='name' style='width:100%; display:inline-block;' /></div><span class='helpText'> helpText </span></div>";
            }
            else if ($(el).text().trim() === "Date") {
                $(el).attr("id", "Date" + this.DateCounter++);
                _html = "<div style='width:100%;' class='Eb-ctrlContainer'><span id='datefromLbl' style='background-color:#000000; color:#000000;'></span><div class='input-group' style='width:100%;'><input id='datefrom' data-ebtype='5' data-toggle='tooltip' title='' class='date' type='text' name='datefrom' autocomplete='on' value='01-01-0001 05:30:00 AM' readonly style='width:100%; height:21px; background-color:#FFFFFF; color:#000000; display:inline-block;  ' placeholder='' maxlength='10' data-original-title=''><span class='input-group-addon'> <i id='datefromTglBtn' class='fa  fa-calendar' aria-hidden='true'></i> </span></div><span class='helpText'>  </span></div>";
            }
            else if ($(el).text().trim() === "Button") {
                $(el).attr("id", "Button" + this.ButtonCounter++);
                _html = "<div class='btn btn-default'>Button</div>";
            }
            else if ($(el).text().trim() === "GridView") {
                var id = "GridView" + this.GridViewCounter++;
                $(el).attr("id", id);
                //el.className = 'gridCont';
                _html = "<table style='width:100%'><tr><td id='" + id + "_Td0' class='tdDropable' ></td> <td id='" + id + "_Td1' class='tdDropable'></td style='min-height:20px;'> </tr></table>";
                if ($(target).attr("id") === "form-buider-form")
                    this.Controls.Append(new GridViewObj(id));
                else
                    this.Controls.GetByName($(target).attr("id")).Controls.Append(new GridViewObj(id));
            }
            $(el).focus();

            $(el).html("<div class='ctrlHead' style='display:none;'><i class='fa fa-arrows moveBtn' aria-hidden='true'></i><a href='#' class='close' style='cursor:default' data-dismiss='alert' aria-label='close' title='close'>×</a></div>" + _html);
            $(".controls-dd-cont select").append("<option id='SelOpt" + $(el).attr("id") + "'>" + $(el).attr("id") + "</option>");
            $('.selectpicker').selectpicker('refresh');
            $(el).find(".close").on("click", this.controlCloseOnClick.bind(this));
        }
        else
            console.log("ondrop else : removed");
        this.saveObj();
    };

    this.controlCloseOnClick = function (e) {
        var ControlTile = $(e.target).parent().parent();
        var id = ControlTile.attr("id");
        $("#SelOpt" + id).remove();
        $('.selectpicker').selectpicker('refresh');
        ControlTile.remove();
        this.Controls.DelByName(id);
        e.preventDefault();
        this.saveObj();
    };

    this.updateHTML = function () {
        if (this.curControl.attr("id").toString().substr(0, 8) === "GridView") {
            if (this.currentProperty.parent().prev().text() === "Columns") {
                this.ChangeGridColNo();
            }

        }

    };

    this.ChangeGridColNo = function () {
        var newVal = $("#propGrid td:contains(Columns)").next().children().val();
        console.log("this.CurColCount: " + this.CurColCount + ", newVal " + newVal);
        var noOfTds = this.curControl.children().children().children().children().length;

        if (this.CurColCount < newVal)
            for (var i = noOfTds; i < newVal; i++) {
                console.log(">  " + i)
                this.addTd();
            }
        else if (this.CurColCount > newVal)
            for (var i = noOfTds; i > newVal; i--) {
                console.log(">  " + i)//
                this.removeTd();
            }
    };

    this.addTd = function () {
        var id = this.curControl.attr("id");
        var curTr = this.curControl.children().children().children();
        alert("this.curControl: " + id);
        var noOfTds = curTr.children().length;
        this.Controls.GetByName(id).Controls.Append(new GridViewTdObj(id + "_Td" + noOfTds));
        curTr.append("<td id='" + id + "_Td" + noOfTds + "' class='tdDropable'>" + (noOfTds + 1) + "</td>");
        curTr.css("background", "yellow");
        this.makeTdsDropable.bind(this);
    };

    this.removeTd = function () {
        var id = this.curControl.attr("id");
        var noOfTds = this.curControl.children().children().children().children().length;
        this.Controls.GetByName(id).Controls.Pop();
        this.curControl.find("tr").find("td").last().remove();
        this.makeTdsDropable.bind(this);
    };

    this.onChangeGridRowNo = function () {

    };

    this.Init = function () {
        this.drake = new dragula([document.getElementById(this.toolBoxid), document.getElementById(this.formid)], {
            removeOnSpill: false,
            copy: function (el, source) { return (source.className !== 'tdDropable' && source.className !== 'form-buider-form'); },
            copySortSource: true,
            mirrorContainer: document.body,
            moves: this.movesfn.bind(this),
            accepts: this.acceptFn.bind(this)
        });

        this.drake.on("drop", this.onDropFn.bind(this));
        this.drake.on("drag", this.onDragFn.bind(this));
        this.drake.on("dragend", this.onDragendFn.bind(this));
    };

    this.Init();
};