var TextBoxObj = function (id) {
    this.$type = "ExpressBase.Objects.EbTextBox, ExpressBase.Objects",
    this.Name = id,
    this.type = "EbTextBox",
    this.IsContainer = false,
    this.props = {
        Name: id,
        Parent: "",
        Sibling: "",
        Label: "",
        Value: "",
        Textmode: "",
        TextTransform: "Normal",
        Test: "Normal",
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
        LabelForeColor: { group: 'Layout', name: 'LabelForeColor', type: 'color', options: { preferredFormat: 'hex' } },
        fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
        LabelBackColor: { group: 'Layout', name: 'LabelBackColor', type: 'color', options: { preferredFormat: 'hex' } },
        TextForeColor: { group: 'Layout', name: 'TextForeColor', type: 'color', options: { preferredFormat: 'hex' } },
        TextBackColor: { group: 'Layout', name: 'TextBackColor', type: 'color', options: { preferredFormat: 'hex' } },
        TextTransform: { group: 'Behavior ', name: 'TextTransform', type: 'BootstrapDD', options: ['Normal', "lower case", "UPPER CASE"] },
        Test: { group: 'Behavior ', name: 'Test', type: 'BootstrapSelect', options: ['Normal', "lower case", "UPPER CASE"] },
    }
};

var GridViewObj = function (id) {
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
};

var GridViewTdObj = function (id) {
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
};

var DateObj = function (id) {
    this.$type = "ExpressBase.Objects.EbDate, ExpressBase.Objects",
    this.Name = id,
    this.IsContainer = false,
    this.props = {
        Name: id,
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
    this.meta = {
        MinDate: { group: 'Layout ', name: 'MinDate', type: 'date', options: { min: 21, max: 500, step: 1 } },
        MaxDate: { group: 'Layout ', name: 'MinDate', type: 'date', options: { min: 21, max: 500, step: 1 } },
        height: { group: 'Layout ', name: 'height', type: 'number', options: { min: 21, max: 500, step: 1 } },
        LabelForeColor: { group: 'Layout', name: 'LabelForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
        LabelBackColor: { group: 'Layout', name: 'LabelBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
        TextForeColor: { group: 'Layout', name: 'TextForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
        TextBackColor: { group: 'Layout', name: 'TextBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
    }
};

var NumericBoxObj = function (id) {
    this.$type = "ExpressBase.Objects.EbNumeric, ExpressBase.Objects",
    this.Name = id,
    this.props = {
        Name: id,
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
    this.meta = {
        MaxValue: { group: 'Layout ', name: 'MaxValue', type: 'number', options: { min: 21, max: 500, step: 1 } },
        MinValue: { group: 'Layout ', name: 'MinValue', type: 'number', options: { min: 21, max: 500, step: 1 } },
        height: { group: 'Layout ', name: 'height', type: 'number', options: { min: 21, max: 500, step: 1 } },
        LabelForeColor: { group: 'Layout', name: 'LabelForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
        LabelBackColor: { group: 'Layout', name: 'LabelBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
        TextForeColor: { group: 'Layout', name: 'TextForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
        TextBackColor: { group: 'Layout', name: 'TextBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
    }
};

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

    this.Pop = function (_name) {
        this.InnerCollection.pop();
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
            BootstrapSelect: {
                html: function (elemId, name, value, meta) { // custom renderer for type (required)
                    var txt = "";
                    var _html = "<select class='selectpicker' data-live-search='true'>"+
                                  "<option data-tokens='ketchup mustard'>Hot Dog, Fries and a Soda</option>"+
                                  "<option data-tokens='mustard'>Burger, Shake and a Smile</option>"+
                                  "<option data-tokens='frosting'>Sugar, Spice and all things nice</option>"+
                                "</select>"+
                                "<input type='hidden' value='############' id='" + elemId + "'>"
                    ;
                    return _html;
                },
                //valueFn: function () {
                //    return parseInt($('#' + LDDid).attr("data-dvid"));
                //}
            }
        };

        setTimeout(this.SetTimeOutFn.bind(this), 1);

        $('#propGrid').jqPropertyGrid(control.props, { meta: control.meta, customTypes: theCustomTypes });

        $('.selectpicker').on('change', function (e) {
            var selected = $(this).find("option:selected").val();
            $(this).parent().siblings("input").val(selected);
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
        this.updateHTML(e);
        this.saveObj();
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
            el.className = 'controlTile';
            var ctrl = $(el);
            var type = ctrl.text().trim();
            eval("var id = '" + type + "' + " + "this." + type + "Counter++");
            ctrl.attr("tabindex", "1").attr("onclick", "event.stopPropagation();$(this).focus()");
            ctrl.attr("onfocusout", "$(this).children('.ctrlHead').hide()").on("focus", this.controlOnFocus.bind(this));
            ctrl.attr("ebtype", type).attr("id", id);
            if ($(target).attr("id") === "form-buider-form")
                eval("this.Controls.Append(new " + type + "Obj(id))");
            else
                eval("this.Controls.GetByName( $(target).attr('id') ).Controls.Append(new " + type + "Obj(id))");
            ctrl.focus().html("<div class='ctrlHead' style='display:none;'><i class='fa fa-arrows moveBtn' aria-hidden='true'></i><a href='#' class='close' style='cursor:default' data-dismiss='alert' aria-label='close' title='close'>×</a></div>" + this.getHtml(el, id, type));
            $(".controls-dd-cont select").append("<option id='SelOpt" + id + "'>" + id + "</option>");
            $('.selectpicker').selectpicker('refresh');
            ctrl.find(".close").on("click", this.controlCloseOnClick.bind(this));
        }
        else
            console.log("ondrop else : removed");
        this.saveObj();
    };

    this.getHtml = function (el, id, type) {
        var _html = "";
        if (type === "TextBox")
            _html = "<input type='text' readonly style='width:100%' />";
        else if (type === "ComboBox") 
            _html = "<div role='form' data-toggle='validator' style=' width: inherit;'><input type='hidden' name='acmasteridHidden4val' data-ebtype='16' id='acmasterid'> <div id='acmasteridLbl' style='display: inline-block;'></div> <div id='acmasteridWraper' data-toggle='tooltip' title='' data-original-title=''><div style='display: inline-block; width: 33%; margin-right: -4px;'><div class='input-group'><div class='dropdown v-select searchable' id='acmasterid0'><div type='button' class='dropdown-toggle clearfix' style='border-top-left-radius: 5px; border-bottom-left-radius: 5px;'> <input debounce='0' type='search'  readonly  placeholder='label0' class='form-control' id='acmaster1_xid' style='width: 100%; background-color: #fff;'> <i role='presentation' class='open-indicator' style='display: none;'></i> <div class='spinner' style='display: none;'>Loading...</div></div> <!----></div> <span class='input-group-addon' style='border-radius: 0px;'><i id='acmasteridTglBtn' aria-hidden='true' class='fa  fa-search'></i></span></div></div> <div style='display: inline-block; width: 33%; margin-right: -4px;'><div class='input-group'><div class='dropdown v-select searchable' id='acmasterid1'><div type='button' class='dropdown-toggle clearfix'> <input debounce='0' type='search' placeholder='label1' readonly class='form-control' id='acmaster1_name' style='width: 100%; background-color: #fff;'> <i role='presentation' class='open-indicator' style='display: none;'></i> <div class='spinner' style='display: none;'>Loading...</div></div> <!----></div> <span class='input-group-addon' style='border-radius: 0px;'><i id='acmasteridTglBtn' aria-hidden='true' class='fa  fa-search'></i></span></div></div> <div style='display: inline-block; width: 33%; margin-right: -4px;'><div class='input-group'><div class='dropdown v-select searchable' id='acmasterid2'><div type='button' class='dropdown-toggle clearfix'> <input debounce='0' type='search' readonly placeholder='label2' class='form-control' id='tdebit' style='width: 100%; background-color: #fff;'> <i role='presentation' class='open-indicator' style='display: none;'></i> <div class='spinner' style='display: none;'>Loading...</div></div> <!----></div> <span class='input-group-addon'><i id='acmasteridTglBtn' aria-hidden='true' class='fa  fa-search'></i></span></div></div></div> <div id='acmasterid_loadingdiv' class='ebCombo-loader'><i id='acmasterid_loading-image' class='fa fa-spinner fa-pulse fa-2x fa-fw' style='display: none;'></i><span class='sr-only'>Loading...</span></div> <center><div id='acmasteridDDdiv' class='DDdiv expand-transition' style='width: 600px; display: none;'><table id='acmasteridtbl' class='table table-striped table-bordered' style='width: 100%;'></table></div></center></div>";
        else if (type === "NumericBox") 
            _html = "<div class='Eb-ctrlContainer'  style='width:100%; min-height: 12px;'><span id='nameLbl' >Amount</span><div  class='input-group'><span class='input-group-addon'>$</span><input type='text'  class='numinput' name='name'  data-toggle='tooltip' title='toolTipText' id='name' style='width:100%; display:inline-block;' /></div><span class='helpText'> helpText </span></div>";
        else if (type === "Date") 
            _html = "<div style='width:100%;' class='Eb-ctrlContainer'><span id='datefromLbl' style='background-color:#000000; color:#000000;'></span><div class='input-group' style='width:100%;'><input id='datefrom' data-ebtype='5' data-toggle='tooltip' title='' class='date' type='text' name='datefrom' autocomplete='on' value='01-01-0001 05:30:00 AM' readonly style='width:100%; height:21px; background-color:#FFFFFF; color:#000000; display:inline-block;  ' placeholder='' maxlength='10' data-original-title=''><span class='input-group-addon'> <i id='datefromTglBtn' class='fa  fa-calendar' aria-hidden='true'></i> </span></div><span class='helpText'>  </span></div>";
        else if (type === "Button") 
            _html = "<div class='btn btn-default'>Button</div>";
        else if (type === "GridView")
            _html = "<table style='width:100%'><tr><td id='" + id + "_Td0' class='tdDropable' ></td> <td id='" + id + "_Td1' class='tdDropable'></td style='min-height:20px;'> </tr></table>";
        return _html
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

    this.updateHTML = function (e) {
        if (this.curControl.attr("id").toString().substr(0, 8) === "GridView") {
            if (this.currentProperty.parent().prev().text() === "Columns") {
                this.ChangeGridColNo(e);
            }

        }

    };

    this.ChangeGridColNo = function (e) {
        var newVal = $("#propGrid td:contains(Columns)").next().children().val();
        console.log("this.CurColCount: " + this.CurColCount + ", newVal " + newVal);
        var noOfTds = this.curControl.children().children().children().children().length;

        if (this.CurColCount < newVal)
            for (var i = noOfTds; i < newVal; i++) {
                console.log("this.CurColCount < newVal  ")//
                console.log(">  " + i)
                this.addTd(e);
            }
        else if (this.CurColCount > newVal) {
            console.log("this.CurColCount > newVal  ")//
            for (var i = noOfTds; i > newVal; i--) {
                console.log(">  " + i)//
                this.removeTd(e);
            }
        }
    };

    this.addTd = function (e) {
        var id = this.curControl.attr("id");
        var curTr = this.curControl.children().children().children();
        var noOfTds = curTr.children().length;
        this.Controls.GetByName(id).Controls.Append(new GridViewTdObj(id + "_Td" + noOfTds));
        curTr.append("<td id='" + id + "_Td" + noOfTds + "' class='tdDropable'> </td>");
        this.makeTdsDropable.bind(this);
        this.CurColCount = $(e.target).val();//tmp
    };

    this.removeTd = function (e) {
        var id = this.curControl.attr("id");
        var noOfTds = this.curControl.children().children().children().children().length;
        this.Controls.GetByName(id).Controls.Pop();
        this.curControl.find("tr").find("td").last().remove();
        this.makeTdsDropable.bind(this);
        this.CurColCount = $(e.target).val();//tmp
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