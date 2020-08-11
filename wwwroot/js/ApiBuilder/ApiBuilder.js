function EB_Api_entry(option) {
    this.Config = $.extend({}, option);
    this.validate = function () {
        return true;
    };

    if (this.validate()) {
        if (window.Api === null || window.Api === undefined)
            window.Api = {};
        window.Api["Tab" + this.Config.TabNum] = {};
        window.Api["Tab" + this.Config.TabNum].Constants = {};
        window.Api["Tab" + this.Config.TabNum].Creator = new EbApiBuild(this.Config);
        window.Api["Tab" + this.Config.TabNum].JsonWindow = new EbPrettyJson({
            ContetEditable: ["Value"],
            HideFields: ["ValueTo"]
        });
        return window.Api["Tab" + this.Config.TabNum].Creator;
    }
    else {
        console.log("initialization error");
        return null;
    }
}

function EbApiBuild(config) {
    this.Conf = config;
    this.TabNumber = this.Conf.TabNum;
    this.EditObj = $.isEmptyObject(this.Conf.DsObj) ? null : this.Conf.DsObj;
    this.EbObject = null;
    this.Lines = {};
    this.Procs = {};
    this.dropArea = "tb" + this.TabNumber + "_resource_Body_drparea";
    this.FlagRun = false;
    this.ComponentRun = false;
    this.Component = null;
    this.ResultData = {};
    this.Request = { Default: [], Custom: [] };
    this.Customparams = {};

    //jquery selectors
    var $paramWLabel = $(`#tb${this.TabNumber}_Json_reqOrRespWrp .reqLabel`);
    var $paramWindow = $(`#tb${this.TabNumber}_Json_reqOrRespWrp #tb${this.TabNumber}_JsonReq_CMW .table tbody`);

    this.pg = new Eb_PropertyGrid({
        id: `tb${this.TabNumber}_pgContainer_wrpr`,
        wc: this.Conf.Wc,
        cid: this.Conf.TenantId,
        $extCont: $(`#tb${this.TabNumber}_pgContainer`)
    });

    this.DragDrop_Items = function () {
        let dritem = `tb${this.TabNumber}_draggable`;
        var drg = dragula([document.getElementById(dritem), document.getElementById(`tb${this.TabNumber}_resource_Body_drparea`)],
            {
                copy: function (el, source) {
                    return source === document.getElementById(dritem);
                },
                accepts: function (el, target) {
                    return target !== document.getElementById(dritem);
                }
            });
        drg.on("drop", this.onDropFn.bind(this));
    };//drag drop starting func

    this.onDropFn = function (el, target, source, yy) {
        if (!$(el).hasClass("dropped")) {
            let o = this.makeElement(el);
            $(el).replaceWith(o.$Control.outerHTML());
            this.RefreshControl(o);
        }
        this.resetLinks();
    };

    this.makeElement = function (el) {
        let ebtype = $(el).attr("eb-type");
        var id = "tb" + this.TabNumber + ebtype + CtrlCounters[$(el).attr("eb-type") + "Counter"]++;
        this.Procs[id] = new EbObjects["Eb" + ebtype](id);
        this.Procs[id].Label = $(el).attr("ctrname");
        return this.Procs[id];
    };

    this.setLine = function (startid, endid) {
        let name = startid + endid;
        this.Lines[name] = new LeaderLine(
            document.getElementById(startid),
            document.getElementById(endid), {
            color: "#316396"
        }
        );
        this.Lines[name].position();
    };

    this.resetLinks = function () {
        this.rmLines();
        let n = 0;
        let process = $(`#${this.dropArea}`).find(".apiPrcItem");
        while (n < process.length - 1) {
            this.setLine(process[n].id, process[n + 1].id);
            n = n + 1;
        }
    };

    this.rmLines = function () {
        try {
            for (var line in this.Lines) {
                this.Lines[line].remove();
            }
            this.Lines = {};
        }
        catch (exp) {
            this.Lines = {};
        }
    };

    this.RefreshControl = function (obj) {
        var NewHtml = obj.$Control.outerHTML();
        var metas = AllMetas["Eb" + $("#" + obj.EbSid).attr("eb-type")];
        $.each(metas, function (i, meta) {
            var name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', obj[name]);
            }
        });
        $("#" + obj.EbSid).replaceWith(NewHtml);
        $("#" + obj.EbSid + " .drpbox").off("focus").on("focus", this.elementOnFocus.bind(this));
    };//render after pgchange

    this.elementOnFocus = function (event) {
        event.stopPropagation();
        var curControl = $(event.target).closest(".apiPrcItem");
        var curObject = this.Procs[curControl.attr("id")];
        var type = curControl.attr('eb-type');
        this.pg.setObject(curObject, AllMetas["Eb" + type]);
    };

    this.BeforeSave = function () {
        this.reidStat = true;
        this.EbObject.Resources.$values.length = 0;
        this.prepareApiobject();

        if (this.reidStat)
            commonO.Current_obj = this.EbObject;
        else
            EbMessage("show", { Message: "Reference must be set!", Background: "red" });
        return this.reidStat;
    };//save

    this.prepareApiobject = function () {
        $(`#${this.dropArea}`).find(".apiPrcItem").each(this.loopProcess.bind(this));
    };

    this.loopProcess = function (i, o) {
        if ([`tb${this.TabNumber}_start_item`, `tb${this.TabNumber}_end_item`, `tb${this.TabNumber}_api_request`].indexOf(o.id) < 0) {

            if (this.validateRefid(o.id)) {
                this.Procs[o.id].RouteIndex = $(o).index();
                this.EbObject.Resources.$values.push(this.Procs[o.id]);
            }
            else {
                this.reidStat = false;
                $(o).children(".drpbox").toggleClass("refIdMsetNotfy");
            }
        }
    };

    this.validateRefid = function (id) {
        if ('Reference' in this.Procs[id]) {
            if (this.Procs[id].Reference === "" || this.Procs[id].Reference === null)
                return false;
            else
                return true;
        }
        else 
            return true;
    };

    this.pg.PropertyChanged = function (obj, pname) {
        if (pname === "Reference" && obj.Reference !== "" && obj.Reference !== null) {
            $("#" + obj.EbSid).children(".drpbox").removeClass("refIdMsetNotfy");
            this.getComponent(obj);
        }
    }.bind(this);

    this.getComponent = function (obj) {
        if (obj.Reference) {
            $.ajax({
                url: "../Dev/GetComponent",
                type: "GET",
                cache: false,
                beforeSend: function () {
                },
                data: { "refid": obj.Reference },
                success: function (component) {
                    obj.RefName = component.name;
                    obj.Version = component.version;
                    this.RefreshControl(obj);
                    this.setApiRequest(JSON.parse(component.parameters));
                }.bind(this)
            });
        }
    };

    this.setApiRequest = function (p) {

        let defaultP = this.EbObject.Request.Default.$values;
        let reqColl = [];

        for (i = 0; i < p.length; i++) {

            let param = p[i];

            if (!defaultP.some(e => e.Name == param.Name)) {
                this.EbObject.Request.Default.$values.push(param);
                reqColl.push(param);
            }
        }
        this.setRequestW(reqColl);
    };

    this.setRequestW = function (o, type) {

        for (let i = 0, n = o.length; i < n; i++) {
            let edit = type === "custom" ? "<span class='fa fa-trash-o deleteCustom_p'></span><span class='fa fa-pencil editCustom_p'></span>" : "";
            let ptype = type || "def";

            let param = o[i];

            let checked = ("Required" in param && param.Required) ? "checked" : "";

            $paramWindow.append(`<tr p-name='${param.Name}' p-type="${ptype}">
                                    <td>${param.Name}</td>
                                    <td>${Object.keys(EbEnums.EbDbTypes).find(key => EbEnums.EbDbTypes[key] === param.Type)}</td>
                                    <td><input type='text' style='width:100%;' Json-prop='${param.Name}' value='${param.Value || ""}'></input></td>
                                    <td><input type="checkbox" id="api-check-${param.Name}" Json-req="${param.Name}" p-name="${param.Name}" p-type="${ptype}" ${checked}/></td>
                                    <td style='text-align: right;'>${edit}</td>
                                   </tr>`);

            $(`#api-check-${param.Name}`).off("change").on("change", this.paramRequiredChange.bind(this));
        }
    };

    this.paramRequiredChange = function (e) {

        let $checkbox = $(e.target).closest("input[type='checkbox']");
        let type = $checkbox.attr("p-type");
        let pname = $checkbox.attr("p-name");
        let checked = $checkbox.is(":checked");

        let collection = null;
        if (type == "def") {
            collection = this.Request.Default || [];
        }
        else {
            collection = this.Request.Custom || [];
        }

        let param = collection.find(item => item.Name === pname);
        if (param) {
            param.Required = checked;
        }
    }

    this.drawProcsEmode = function () {
        var o = this.EditObj.Resources.$values;
        for (let i = 0; i < o.length; i++) {
            var ebtype = o[i].$type.split(",")[0].split(".").pop().substring(2);
            var id = "tb" + this.TabNumber + ebtype + CtrlCounters[ebtype + "Counter"]++;
            var obj = new EbObjects["Eb" + ebtype](id);
            $.extend(obj, o[i]);
            $(`#${this.dropArea} #tb${this.TabNumber}_end_item`).before(obj.$Control.outerHTML());
            this.Procs[id] = obj;
            this.RefreshControl(this.Procs[id]);
        }
    };

    this.toggleReqWindow = function (name, resp) {
        $paramWLabel.text(` (${name}) `);
        $paramWindow.empty();
        this.Request.Default = resp;
        this.setRequestW(resp);
    };

    this.newApi = function () {
        this.EbObject = new EbObjects["EbApi"]("tb" + this.TabNumber + "Api");
        this.pg.setObject(this.EbObject, AllMetas["EbApi"]);
        //this.setLine('start', 'stop');
        this.resetLinks();
    };

    this.editApi = function () {
        this.EbObject = new EbObjects["EbApi"](this.EditObj.Name);
        {
            var _o = $.extend(true, {}, this.EditObj);
            $.extend(this.EbObject, _o);
        }
        this.pg.setObject(this.EbObject, AllMetas["EbApi"]);
        this.EbObject.Resources.$values.length = 0;
        this.drawProcsEmode();
        this.resetLinks();
        this.setRequestW(this.EbObject.Request.Default.$values);
        this.setRequestW(this.EbObject.Request.Custom.$values, 'custom');
        this.Request.Default = this.EbObject.Request.Default.$values;
        this.Request.Custom = this.EbObject.Request.Custom.$values;
    };

    this.setBtns = function () {
        $("#obj_icons").empty().append(`<button class='btn run' id='tb${this.TabNumber}_api_run' data-toggle='tooltip' data-placement='bottom' title= 'Run'>
                                            <i class='fa fa-play' aria-hidden='true'></i>
                                        </button>`);
        $(`#tb${this.TabNumber}_api_run`).off("click").on("click", this.getApiResponse.bind(this));
    };

    commonO.saveOrCommitSuccess = function (ref) {
        this.setBtns();
    }.bind(this);

    this.GenerateButtons = function () {
        this.setBtns();
    };

    this.getRequest = function () {
        for (let i = 0, n = this.Request.Default.length; i < n; i++) {
            let p = this.Request.Default[i];
            p.Value = $(`#tb${this.TabNumber}_JsonReq_CMW input[Json-prop='${p.Name}']`).val();
        }

        if (!this.ComponentRun) {
            for (let i = 0, n = this.Request.Custom.length; i < n; i++) {
                let p = this.Request.Custom[i];
                p.Value = $(`#tb${this.TabNumber}_JsonReq_CMW input[Json-prop='${p.Name}']`).val();
            }
        }
        return JSON.stringify(this.Request);
    };

    this.getApiResponse = function (ev) {
        let _data = null;
        let param = this.getRequest();
        if (!this.ComponentRun) {
            _data = { "name": this.EbObject.Name, "vers": commonO.getVersion(), "param": param };
        }
        else {
            _data = { "param": param, "component": JSON.stringify(this.Component) };
        }
        $.ajax({
            url: "../Dev/GetApiResponse",
            type: "GET",
            cache: false,
            beforeSend: function () {
                $("#eb_common_loader").EbLoader("show", { maskItem: { Id: '#tb' + this.TabNumber + '_JsonResp_CMW', Style: { "top": "0", "left": "0" } } });
            }.bind(this),
            data: _data,
            success: function (result) {
                this.ComponentRun ? this.toggleRespWindow(JSON.parse(result), this.Component) : this.toggleRespWindow(JSON.parse(result), this.EbObject);
                $("#eb_common_loader").EbLoader("hide");
            }.bind(this)
        });
    };

    this.toggleRespWindow = function (result, o) {
        this.ResultData = result;
        let _html = window.Api["Tab" + this.TabNumber].JsonWindow.build(result);
        $(`#tb${this.TabNumber}_Json_reqOrRespWrp`).show();
        $(`#tb${this.TabNumber}_Json_reqOrRespWrp #tb${this.TabNumber}_JsonResp_CMW`).html(_html);
        $(`#tb${this.TabNumber}_api_RqFullSwrapr .FS_bdy`).html(_html);
        $(`#tb${this.TabNumber}_api_RqFullSwrapr .FS_head .Comp_Name`).text(`${o.RefName || o.Name} (${o.Version || o.VersionNumber})`);
    };

    this.foramatChange = function (ev) {
        let o = null;
        let html = "";
        if (this.ComponentRun)
            o = this.Component;
        else
            o = this.EbObject;

        if ($(ev.target).val() === 'xml') {
            html = window.Api["Tab" + this.TabNumber].JsonWindow.json2xml(this.ResultData);
        }
        else if ($(ev.target).val() === 'json')
            html = window.Api["Tab" + this.TabNumber].JsonWindow.build(this.ResultData);
        else if ($(ev.target).val() === 'raw')
            html = window.Api["Tab" + this.TabNumber].JsonWindow.rawData(this.ResultData);

        $(`#tb${this.TabNumber}_Json_reqOrRespWrp #tb${this.TabNumber}_JsonResp_CMW`).html(html);
        $(`#tb${this.TabNumber}_api_RqFullSwrapr .FS_bdy`).html(html);
        $(`#tb${this.TabNumber}_api_RqFullSwrapr .FS_head .Comp_Name`).text(`${o.RefName || o.Name} (${o.Version || o.VersionNumber})`);
    };

    this.saveCustomParam = function () {
        let pname = $(`#tb${this.TabNumber}_api_scodeMd input[name="param_name"]`).val();
        let type = $(`#tb${this.TabNumber}_api_scodeMd select[name="param_type"]`).val();
        let val = this.CustomPval.getValue();
        if (!pname)
            EbMessage('show', { Message: "parameter name cannot be empty", Background: 'red' });
        else {
            var o = {};
            o.Name = pname;
            o.Type = type;
            o.Value = val;
            o.ValueTo = val;
            o.Required = true;

            if (this.Request.Custom.filter(e => e.Name === o.Name).length > 0) {
                EbMessage('show', { Message: "parameter " + o.Name + " already exist", Background: 'red' });
            }
            else {
                this.EbObject.Request.Custom.$values.push(o);
                var formated_val = o.Type === "13" ? o.Value : o.Value;
                $(`#tb${this.TabNumber}_Json_reqOrRespWrp #tb${this.TabNumber}_JsonReq_CMW .table tbody`).append(`<tr p-name='${o.Name}' p-type="custom">
                        <td>${o.Name}</td>
                        <td>${Object.keys(EbEnums.EbDbTypes).find(key => EbEnums.EbDbTypes[key] === o.Type)}</td>
                        <td><input type='text' style='width:100%;' Json-prop='${o.Name}' value='${formated_val || ""}'></input></td>
                        <td><input type="checkbox" id="api-check-${o.Name}" Json-req="${o.Name}" p-name="${param.Name}" p-type="custom" checked/></td>
                        <td style='text-align: right;'><span class='fa fa-trash-o deleteCustom_p'></span><span class='fa fa-pencil editCustom_p'></span></td>
                       </tr>`);
                $('#tb' + this.TabNumber + '_api_scodeMd').modal('hide');
                $(`#api-check-${o.Name}`).off("change").on("change", this.paramRequiredChange.bind(this));
            }
        }
    };

    this.RmCustParam = function () {
        let el = $(event.target).closest('tr');
        this.EbObject.Request.Custom.$values = this.EbObject.Request.Custom.$values.filter(e => e.Name !== el.attr("p-name"));
        this.Request.Custom = this.EbObject.Request.Custom.$values.filter(e => e.Name !== el.attr("p-name"));
        el.remove();
    };

    this.start = function () {
        this.setBtns();
        if (this.EditObj === null || this.EditObj === undefined)
            this.newApi();
        else
            this.editApi();
        this.DragDrop_Items();
        this.ApiMenu = new ApiMenu(this);

        $(`#tb${this.TabNumber}_Json_reqOrRespWrp`).resizable({
            handles: "n",
            minHeight: 50
        });

        $(`#apiversion-body${this.TabNumber} .format_type`).off("change").on("change", this.foramatChange.bind(this));
        this.CustomPval = CodeMirror(document.getElementById('tb' + this.TabNumber + '_CpVcdMIrror'), { mode: 'javascript' });
        $('#tb' + this.TabNumber + '_adCpToObj').off('click').on('click', this.saveCustomParam.bind(this));
        $(`#apiversion-body${this.TabNumber}`).on("click", ".deleteCustom_p", this.RmCustParam.bind(this));
    };

    this.start();
}