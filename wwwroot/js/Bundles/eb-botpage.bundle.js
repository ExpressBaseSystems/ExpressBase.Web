var InitControls = function (option) {
    this.scrollableContSelectors = ['.tab-content', '.Dg_body'];

    if (option) {
        this.Renderer = option;
        this.Cid = option.Cid;
        this.Env = option.Env;
    }

    this.init = function (control, ctrlOpts) {
        if (this[control.ObjType] !== undefined) {
            return this[control.ObjType](control, ctrlOpts);
        }
    };

    this.FileUploader = function (ctrl, ctrlOpts) {
        let files = [];
        let catTitle = [];
        let customMenu = [{ name: "Delete", icon: "fa-trash" }];
        let fileType = this.getKeyByValue(EbEnums.FileClass, ctrl.FileType.toString());
        $.each(ctrl.Categories.$values, function (i, obj) {
            catTitle.push(obj.CategoryTitle);
        }.bind(catTitle));

        if (ctrlOpts.FormDataExtdObj.val !== null && ctrlOpts.FormDataExtdObj.val[ctrl.Name || ctrl.EbSid] !== undefined) {
            files = JSON.parse(ctrlOpts.FormDataExtdObj.val[ctrl.Name || ctrl.EbSid][0].Columns[0].Value);
        }

        if (fileType === 'image') {
            $.each(ctrlOpts.DpControlsList, function (i, obj) {
                customMenu.push({ name: "Set as " + obj.Label, icon: "fa-user" });
            });
        }

        let imgup = new FUPFormControl({
            Type: fileType,
            ShowGallery: true,
            Categories: catTitle,
            Files: files,
            TenantId: this.Cid,
            SolutionId: this.Cid,
            Container: ctrl.EbSid,
            Multiple: ctrl.IsMultipleUpload,
            ServerEventUrl: this.Env === "Production" ? 'https://se.expressbase.com' : 'https://se.eb-test.cloud',
            EnableTag: ctrl.EnableTag,
            EnableCrop: ctrl.EnableCrop,
            MaxSize: ctrl.MaxFileSize,
            CustomMenu: customMenu,
            DisableUpload: ctrl.DisableUpload,
            HideEmptyCategory: ctrl.HideEmptyCategory
        });

        uploadedFileRefList[ctrl.Name] = this.getInitFileIds(files);

        imgup.uploadSuccess = function (fileid) {
            if (uploadedFileRefList[ctrl.Name].indexOf(fileid) === -1)
                uploadedFileRefList[ctrl.Name].push(fileid);
        };

        imgup.windowClose = function () {
            if (uploadedFileRefList[ctrl.Name].length > 0)
                EbMessage("show", { Message: 'Changes Affect only if Form is Saved', AutoHide: true, Background: '#0000aa' });
        };

        imgup.customTrigger = function (DpControlsList, name, refids) {
            if (name === "Delete") {
                if (name === "Delete") {
                    EbDialog("show",
                        {
                            Message: "Are you sure? Changes Affect only if Form is Saved.",
                            Buttons: {
                                "Yes": {
                                    Background: "green",
                                    Align: "left",
                                    FontColor: "white;"
                                },
                                "No": {
                                    Background: "violet",
                                    Align: "right",
                                    FontColor: "white;"
                                }
                            },
                            CallBack: function (name) {
                                if (name === "Yes") {
                                    let initLen = uploadedFileRefList[ctrl.Name].length;
                                    for (let i = 0; i < refids.length; i++) {
                                        let index = uploadedFileRefList[ctrl.Name].indexOf(refids[i]);
                                        if (index !== -1) {
                                            uploadedFileRefList[ctrl.Name].splice(index, 1);
                                        }
                                    }
                                    if (initLen > uploadedFileRefList[ctrl.Name].length) {
                                        imgup.deleteFromGallery(refids);
                                        EbMessage("show", { Message: 'Changes Affect only if Form is Saved', AutoHide: true, Background: '#0000aa' });
                                    }
                                    imgup.customMenuCompleted("Delete", refids);
                                }
                            }
                        });
                }
            }
            else {
                $.each(DpControlsList, function (i, dpObj) {
                    if (name === 'Set as ' + dpObj.Label) {
                        EbDialog("show",
                            {
                                Message: "Are you sure? Changes Affect only if Form is Saved.",
                                Buttons: {
                                    "Yes": {
                                        Background: "green",
                                        Align: "left",
                                        FontColor: "white;"
                                    },
                                    "No": {
                                        Background: "violet",
                                        Align: "right",
                                        FontColor: "white;"
                                    }
                                },
                                CallBack: function (name) {
                                    if (name === "Yes") {
                                        if (refids.length > 0) {
                                            dpObj.setValue(refids[0].toString());/////////////need to handle when multiple images selected 
                                        }
                                    }
                                }.bind()
                            });
                    }
                });
            }

        }.bind(this, ctrlOpts.DpControlsList);

    };

    //edit by amal for signature pad
    this.SignaturePad = function (ctrl, ctrlOpts) {
        var sign_pad = new SignaturePad({
            Container: "#" + ctrl.EbSid + "Wraper"
        });

        sign_pad.getResult = function (b64, vendor) {
            //alert(b64);
        };
    };

    this.getInitFileIds = function (files) {
        let ids = [];
        for (let i = 0; i < files.length; i++)
            ids.push(files[i].FileRefId);
        return ids;
    };

    this.DGUserControlColumn = function (ctrl, ctrlOpts) {
        ctrl.__Col.__DGUCC.initForctrl(ctrl);
    };

    this.SetDateFormatter = function () {
        $.datetimepicker.setDateFormatter({
            parseDate: function (date, format) {
                var d = moment(date, format);
                return d.isValid() ? d.toDate() : false;
            },

            formatDate: function (date, format) {
                return moment(date).format(format);
            }
        });
    };

    this.SetDateFormatter();

    this.Date = function (ctrl, ctrlOpts) {
        //setTimeout(function () {
        let t0 = performance.now();
        let t1 = performance.now();
        let formObject = ctrlOpts.formObject;
        let userObject = ebcontext.user;
        let $input = $("#" + ctrl.EbSid_CtxId);
        if (ctrl.ShowDateAs_ === 1) {
            $input.MonthPicker({
                Button: $input.next().removeAttr("onclick"),
                OnAfterChooseMonth: function () { $input.trigger("change"); }
            });
            $input.MonthPicker('option', 'ShowOn', 'both');
            $input.MonthPicker('option', 'UseInputMask', true);

            //ctrl.setValue(moment(ebcontext.user.Preference.ShortDate, ebcontext.user.Preference.ShortDatePattern).format('MM/YYYY'));
        }
        else if (ctrl.ShowDateAs_ === 2) {
            $input.yearpicker({
                year: parseInt(ctrl.DataVals.Value),
                startYear: 1800,
                endYear: 2200
            });
        }
        else {
            let sdp = userObject.Preference.ShortDatePattern;//"DD-MM-YYYY";
            let stp = userObject.Preference.ShortTimePattern;//"HH mm"

            if (typeof ctrl === typeof "")
                ctrl = { name: ctrl, ebDateType: 5 };
            var settings = { timepicker: false };

            if (ctrl.EbDateType === 5) { //Date
                $input.datetimepicker({
                    format: sdp,
                    formatTime: stp,
                    formatDate: sdp,
                    timepicker: false,
                    datepicker: true,
                    mask: true
                });
                //$input.val(userObject.Preference.ShortDate);
            }
            else if (ctrl.EbDateType === 17) { //Time
                $input.datetimepicker({
                    format: stp,
                    formatTime: stp,
                    formatDate: sdp,
                    timepicker: true,
                    datepicker: false
                });
                //$input.val(userObject.Preference.ShortTime);
            }
            else {
                $input.datetimepicker({ //DateTime
                    format: sdp + " " + stp,
                    formatTime: stp,
                    formatDate: sdp,
                    timepicker: true,
                    datepicker: true
                });
                //$input.val(userObject.Preference.ShortDate + " " + userObject.Preference.ShortTime);
            }


            //settings.minDate = ctrl.Min;
            //settings.maxDate = ctrl.Max;

            //if (ctrlOpts.source === "webform") {
            //let maskPattern = "DD-MM-YYYY";
            //$input.attr("placeholder", maskPattern);
            //$input.inputmask(maskPattern);               

            //    if (!ctrl.IsNullable)
            //        $input.val(userObject.Preference.ShortDate);
            //}

            //$input.mask(ctrl.MaskPattern || '00/00/0000');
            $input.next(".input-group-addon").off('click').on('click', function () { $input.datetimepicker('show'); }.bind(this));
        }
        if (ctrl.IsNullable) {
            //if (!($('#' + ctrl.EbSid_CtxId).siblings('.nullable-check').find('input[type=checkbox]').prop('checked')))
            //    $input.val('');
            //else
            $('#' + ctrl.EbSid_CtxId).siblings('.nullable-check').find('input[type=checkbox]').attr('checked', false);
            $input.val("");
            $input.prev(".nullable-check").find("input[type='checkbox']").off('change').on('change', this.toggleNullableCheck.bind(this, ctrl));//created by amal
            $input.prop('disabled', true).next(".input-group-addon").css('pointer-events', 'none').css('color', '#999');
        }
        else if (ctrl.ShowDateAs_ !== 2)
            this.setCurrentDate(ctrl, $input);

        t1 = performance.now();
        //console.dev_log("date 2 init --- took " + (t1 - t0) + " milliseconds.");

        //}.bind(this), 0);
    };

    //created by amal
    this.toggleNullableCheck = function (ctrl) {
        let $ctrl = $(event.target).closest("input[type='checkbox']");
        if ($ctrl.is(":checked")) {
            if ($ctrl.closest(".input-group").find("input[type='text']").val() === "")
                //$ctrl.closest(".input-group").find("input[type='text']").val(ebcontext.user.Preference.ShortDate);
                this.setCurrentDate(ctrl, $ctrl.closest(".input-group").find("input[type='text']"));
            $ctrl.closest(".input-group").find("input[type='text']").prop('disabled', false).next(".input-group-addon").css('pointer-events', 'auto').css('color', 'inherit');
            //ctrl.DoNotPersist = false;
        }
        else {
            $ctrl.closest(".input-group").find("input[type='text']").val("").prop('disabled', true).next(".input-group-addon").css('pointer-events', 'none').css('color', '#999');;
            //ctrl.DoNotPersist = true;
        }
    };

    this.setCurrentDate = function (ctrl, $input) {
        let val;
        if (ctrl.ShowDateAs_ === 1) {
            val = moment(ebcontext.user.Preference.ShortDate, ebcontext.user.Preference.ShortDatePattern).format('MM/YYYY');
        }
        else if (ctrl.EbDateType === 5) { //Date
            val = moment(ebcontext.user.Preference.ShortDate, ebcontext.user.Preference.ShortDatePattern).format('YYYY-MM-DD');
        }
        else if (ctrl.EbDateType === 17) { //Time
            val = moment(ebcontext.user.Preference.ShortTime, ebcontext.user.Preference.ShortTimePattern).format('HH:mm:ss');
        }
        else {
            val = moment(ebcontext.user.Preference.ShortDate + " " + ebcontext.user.Preference.ShortTime, ebcontext.user.Preference.ShortDatePattern + " " + ebcontext.user.Preference.ShortTimePattern).format('YYYY-MM-DD HH:mm:ss');
        }
        if (ctrl.DataVals.Value !== null && ctrl.DataVals.Value !== "" && ctrl.DataVals.Value !== undefined)
            ctrl.setValue(ctrl.DataVals.Value);
        else
            ctrl.setValue(val);
    };

    this.SimpleSelect = function (ctrl) {
        let $input = $("#" + ctrl.EbSid_CtxId);

        $input.on('loaded.bs.select	', function (e, clickedIndex, isSelected, previousValue) {
            $(e.target).closest(".dropdown.bootstrap-select").attr("id", ctrl.EbSid_CtxId + "_dd"); // id added for test frame work
        });

        $input.selectpicker({
            //dropupAuto: false,
            container: "body [eb-root-obj-container]:first",
            virtualScroll: 500,
            size: ctrl.DropdownHeight === 0 ? 'auto' : (ctrl.DropdownHeight / 23),
            //DDheight: ctrl.DropdownHeight,// experimental should apply at selectpicker-line: 1783("maxHeight = menuHeight;")
        });


        let $DD = $input.siblings(".dropdown-menu[role='combobox']");
        //$DD.addClass("dd_of_" + ctrl.EbSid_CtxId);
        //$DD.find(".inner[role='listbox']").css({ "height": ctrl.DropdownHeight, "overflow-y": "scroll" });

        $("#" + ctrl.EbSid_CtxId).on("shown.bs.select", function (e) {
            let $el = $(e.target);
            let $DDbScont = $DD.closest(".bs-container");
            $DDbScont.css("left", ($el.closest(".ctrl-cover").offset().left));

            if ($DDbScont.hasClass("dropup")) {
                $DDbScont.css("top", parseFloat($DDbScont.css("top")) + 1);
                $DD.removeClass("eb-ss-dd").addClass("eb-ss-ddup");
            }
            else {
                $DDbScont.css("top", parseFloat($DDbScont.css("top")) - 1);
                $DD.removeClass("eb-ss-ddup").addClass("eb-ss-dd");
            }

            $DD.css("min-width", $el.closest(".ctrl-cover").css("width"));

            if ($el.attr("is-scrollbind") !== 'true') {
                for (let i = 0; i < this.scrollableContSelectors.length; i++) {
                    let contSelc = this.scrollableContSelectors[i];
                    let $ctrlCont = this.isDGps ? $(`#td_${ctrl.EbSid_CtxId}`) : $('#cont_' + ctrl.EbSid_CtxId);
                    $ctrlCont.parents(contSelc).scroll(function (event) {
                        if ($el.closest(".dropdown.bootstrap-select").length === 1 && $el.closest(".dropdown.bootstrap-select").hasClass("open"))
                            $el.siblings(".dropdown-toggle").trigger('click.bs.dropdown.data-api').focus();// triggers select-picker's event to hide dropdown
                    }.bind(this));
                }
                $el.attr("is-scrollbind", 'true');
            }
        }.bind(this));

        ////code review..... to set dropdown on body
        //$("#" + ctrl.EbSid_CtxId).on("shown.bs.select", function (e) {
        //    if (this.Renderer.rendererName !== "Bot") {
        //        let $el = $(e.target);
        //        if ($el[0].isOutside !== true) {
        //            let $drpdwn = $('.dd_of_' + ctrl.EbSid_CtxId);
        //            let initDDwidth = $drpdwn.width();
        //            let ofsetval = $drpdwn.offset();
        //            let $divclone = ($("#" + ctrl.EbSid_CtxId).parent().clone().empty()).addClass("detch_select").attr({ "detch_select": true, "par_ebsid": ctrl.EbSid_CtxId, "MultiSelect": ctrl.MultiSelect, "objtype": ctrl.ObjType });
        //            let $div_detached = $drpdwn.detach();
        //            let $form_div = $(e.target).closest("[eb-root-obj-container]");
        //            $div_detached.appendTo($form_div).wrap($divclone);
        //            $div_detached.width(initDDwidth);
        //            $el[0].isOutside = true;
        //            $div_detached.offset({ top: (ofsetval.top), left: ofsetval.left });
        //            $div_detached.css("min-width", "unset");// to override bootstarp min-width 100% only after -appendTo-

        //        }
        //        //to set position of dropdrown just below selectpicker btn
        //        else {
        //            let $outdrpdwn = $('.dd_of_' + ctrl.EbSid_CtxId);
        //            let ddOfset = ($(e.target)).offsetParent().offset();
        //            let tgHght = ($(e.target)).offsetParent().height();
        //            $outdrpdwn.parent().addClass('open');
        //            $outdrpdwn.offset({ top: (ddOfset.top + tgHght), left: ddOfset.left });
        //            $outdrpdwn.children("[role='listbox']").scrollTo($outdrpdwn.find("li.active"), { offset: ($outdrpdwn.children("[role='listbox']").height() / -2) + 11.5 });
        //        }
        //    }
        //}.bind(this));
        if (ctrl.DataVals.Value !== null || ctrl.DataVals.Value !== undefined)
            ctrl.setValue(ctrl.DataVals.Value);
    };

    this.BooleanSelect = function (ctrl) {
        this.SimpleSelect(ctrl);
    };

    // http://davidstutz.de/bootstrap-multiselect
    this.UserLocation = function (ctrl) {
        let $input = $("#" + ctrl.EbSid_CtxId);
        $input.multiselect({
            includeSelectAllOption: true
        });

        $("body").on("click", "#" + ctrl.EbSid_CtxId + "_checkbox", this.UserLocationCheckboxChanged.bind(this, ctrl));

        if (ebcontext.user.Roles.findIndex(x => (x === "SolutionOwner" || x === "SolutionDeveloper" || x === "SolutionAdmin")) > -1) {
            $('#' + ctrl.EbSid_CtxId + "_checkbox").trigger('click');
        }
        else {
            $('#' + ctrl.EbSid_CtxId + "_checkbox_div").hide();
            if (ebcontext.user.wc === "dc")
                $('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(1)').children().find("input").trigger('click');
            else if (ebcontext.user.wc === "uc") {
                if (ctrl.LoadCurrentLocation)
                    $('#' + ctrl.EbSid_CtxId).next('div').children().find('[value=' + ebcontext.locations.CurrentLocObj.LocId + ']').trigger('click');
                else
                    $('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(1)').children().find("input").trigger('click');
            }
        }

        ctrl.DataVals.Value = ctrl.getValueFromDOM();
    };

    this.UserLocationCheckboxChanged = function (ctrl) {
        if ($(event.target).prop("checked")) {
            $('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").trigger('click');
            $('#' + ctrl.EbSid_CtxId).next('div').find("*").attr("disabled", "disabled").off('click');
        }
        else {
            $('#' + ctrl.EbSid_CtxId).next('div').find("*").removeAttr('disabled').on('click');
            if ($('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").prop("checked"))
                $('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").trigger('click');

        }
    };

    this.LocationSelector = function (ctrl) {
        let $input = "#" + ctrl.EbSid_CtxId;
        ctrl.LocData.$values.map(e => delete e.$type);

        this.DDTreeApi = simTree({
            el: $input,
            data: ctrl.LocData.$values,
            check: true,
            //linkParent: true,
            onClick: this.ClickLocationSelector.bind(this, ctrl),
            //onChange: this.ChangeLocationSelector.bind(this)
        });

        $("body").on("click", "#" + ctrl.EbSid_CtxId + "_checkbox", this.LocationSelectorCheckboxChanged.bind(this, ctrl));
        $('#' + ctrl.EbSid_CtxId + "_button").off("click").on("click", function () {
            $('#' + ctrl.EbSid_CtxId).toggle();
        });
        this.DDTreeApi.data.map(el => (el.children) ? $(`#${ctrl.EbSid_CtxId} [data-id='${el.id}']`).addClass("parentNode") : $(`[data-id='${el.id}']`).addClass("childNode"));
        $.contextMenu({
            selector: ".parentNode",
            events: {
                show: function (options) {
                    if ($(event.target).closest("li").hasClass("childNode"))
                        return false;
                }
            },
            items: {
                //    "SelectGroup": { name: "Select Group", icon: "fa-check-square-o", callback: this.SelectGroup.bind(this) },
                //    "SelectChildren": { name: "Select Children", icon: "fa-check-square-o", callback: this.SelectChildren.bind(this) },
                "SelectAll": { name: "Select All", icon: "fa-check-square-o", callback: this.SelectAll.bind(this) },
                "DeSelectAll": { name: "DeSelect All", icon: "fa-square-o", callback: this.DeSelectAll.bind(this) }
            }
        });
        if (ebcontext.user.Roles.findIndex(x => (x === "SolutionOwner" || x === "SolutionDeveloper" || x === "SolutionAdmin")) > -1) {
            $('#' + ctrl.EbSid_CtxId + "_checkbox").trigger('click');
        }
        else {
            $('#' + ctrl.EbSid_CtxId + "_checkbox_div").hide();
            if (ebcontext.user.wc === "uc") {
                if (ctrl.LoadCurrentLocation)
                    $('#' + ctrl.EbSid_CtxId).find('[data-id=' + ebcontext.locations.CurrentLocObj.LocId + '] .sim-tree-checkbox').eq(0).trigger('click');
            }
        }
        ctrl.DataVals.Value = ctrl.getValueFromDOM();
    };

    this.LocationSelectorCheckboxChanged = function (ctrl) {
        if ($(event.target).prop("checked")) {
            $('#' + ctrl.EbSid_CtxId).hide();
            //$("[data-level='1']").each(function (i, obj) {
            //    if (!$(obj).find(".sim-tree-checkbox").eq(0).hasClass("checked"))
            //        $(obj).find(".sim-tree-checkbox").eq(0).trigger("click");
            //});
            $("#" + ctrl.EbSid_CtxId + " .sim-tree-checkbox").toArray()
                .map(el => $(el).hasClass("checked") ? console.log("checked") : $(el).trigger("click"));
            $('#' + ctrl.EbSid_CtxId + "_button").attr("disabled", "disabled");
        }
        else {
            $('#' + ctrl.EbSid_CtxId + "_button").removeAttr('disabled');
            $('#' + ctrl.EbSid_CtxId).show();
            //$("[data-level='1']").each(function (i, obj) {
            //    if ($(obj).find(".sim-tree-checkbox").eq(0).hasClass("checked"))
            //        $(obj).find(".sim-tree-checkbox").eq(0).trigger("click");
            //});
            $("#" + ctrl.EbSid_CtxId + " .sim-tree-checkbox").toArray()
                .map(el => $(el).hasClass("checked") ? $(el).trigger("click") : console.log("Unchecked"));
        }
    };

    this.ClickLocationSelector = function (ctrl, item, x, y) {
        if (this.DDTreeApi) {
            if (item.length === this.DDTreeApi.data.length)
                $("#" + ctrl.EbSid_CtxId + "_text").text(`All Selected (${item.length})`);
            else if (item.length === 1)
                $("#" + ctrl.EbSid_CtxId + "_text").text(`${item[0].name}`);
            else if (item.length === 0)
                $("#" + ctrl.EbSid_CtxId + "_text").text(`None Selected`);
            else
                $("#" + ctrl.EbSid_CtxId + "_text").text(`${item.length} Selected`);
            let value = item.map(obj => obj.id).join(",");
            $("#" + ctrl.EbSid_CtxId).val(value).trigger("cssClassChanged");
        }
    };

    this.SelectAll = function (key, opt, event) {
        opt.$trigger.find(".sim-tree-checkbox").toArray()
            .map(el => $(el).hasClass("checked") ? console.log("checked") : $(el).trigger("click"));
    };

    this.DeSelectAll = function (key, opt, event) {
        opt.$trigger.find(".sim-tree-checkbox").toArray()
            .map(el => $(el).hasClass("checked") ? $(el).trigger("click") : console.log("Unchecked"));
    };

    this.SelectGroup = function (key, opt, event) {

    };

    this.ChartControl = function (ctrl, ctrlOpts) {
        let o = new Object();
        o.tableId = "chart" + ctrl.EbSid_CtxId;
        o.dvObject = JSON.parse(ctrl.ChartVisualizationJson);
        this.chartApi = new EbBasicChart(o);
    };

    this.TVcontrol = function (ctrl, ctrlOpts) {
        let o = new Object();
        o.tableId = ctrl.EbSid_CtxId;
        o.showCheckboxColumn = false;
        o.showFilterRow = false;
        o.IsPaging = false;
        o.Source = this.Renderer.rendererName;
        o.scrollHeight = ctrl.Height - 34.62;
        o.dvObject = JSON.parse(ctrl.TableVisualizationJson);

        if (!ctrl.__filterValues)
            ctrl.__filterValues = [];
        if (ctrl.ParamsList) {
            paramsList = ctrl.ParamsList.$values.map(function (obj) { return "form." + obj.Name; });
            for (let i = 0; i < paramsList.length; i++) {
                let depCtrl_s = paramsList[i];
                let depCtrl = this.Renderer.formObject.__getCtrlByPath(depCtrl_s);
                if (!getObjByval(ctrl.__filterValues, "Name", depCtrl_s.replace("form.", ""))) { // bot related check
                    let val = '';
                    let ebDbType = 11;
                    let name = "";
                    if (depCtrl_s === "form.eb_loc_id") {
                        val = (ebcontext.locations) ? ebcontext.locations.getCurrent() : 1;
                        name = "eb_loc_id";
                    }
                    else if (depCtrl_s === "form.eb_currentuser_id") {
                        val = ebcontext.user.UserId;
                        name = "eb_currentuser_id";
                    }
                    else if (depCtrl_s === "form.id") {
                        val = this.Renderer.rowId;
                        name = "id";
                    }
                    else {
                        val = depCtrl.getValue();
                        name = depCtrl.Name;
                        ebDbType = depCtrl.EbDbType;
                    }

                    ctrl.__filterValues.push(new fltr_obj(ebDbType, name, val));
                }
            }
            o.filterValues = btoa(unescape(encodeURIComponent(JSON.stringify(ctrl.__filterValues))));
        }
        ctrl.initializer = new EbCommonDataTable(o);
        ctrl.initializer.reloadTV = ctrl.initializer.Api.ajax.reload;

        ctrl.reloadWithParam = function (depCtrl) {
            if (depCtrl) {
                let val = depCtrl.getValue();
                let filterObj = getObjByval(ctrl.__filterValues, "Name", depCtrl.Name);
                filterObj.Value = val;
            }

            ctrl.initializer.filterValues = ctrl.__filterValues;
            ctrl.initializer.Api.ajax.reload();
        };
    };

    this.CalendarControl = function (ctrl) {
        console.log("eached");
        let userObject = ebcontext.user;
        let sdp = userObject.Preference.ShortDatePattern;//"DD-MM-YYYY";
        let stp = userObject.Preference.ShortTimePattern;//"HH mm"
        let $input = $("#" + ctrl.EbSid_CtxId);

        $input.find("#date").datetimepicker({
            format: sdp,
            formatTime: stp,
            formatDate: sdp,
            timepicker: false,
            datepicker: true,
            mask: true
        });
        $input.find("#month").MonthPicker({ Button: $input.children().find("#month").next().removeAttr("onclick") });
        $input.find("#month").MonthPicker('option', 'ShowOn', 'both');
        $input.find("#month").MonthPicker('option', 'UseInputMask', true);
        $input.find("#month").MonthPicker({
            OnAfterChooseMonth: this.SetDateFromDateTo.bind(this, $input)
        });
        $input.find("#year").datetimepickers({
            format: "YYYY",
            viewMode: "years",
        });

        $input.find("#date").next(".input-group-addon").off('click').on('click', function () {
            $input.find("#date").datetimepicker('show');
        });

        $input.find("select").on('change', function (e) {
            $(e.target).siblings("button").find(" .filter-option").text(this.value);
            $input.find("select option:not([value='" + this.value + "'])").removeAttr("selected");
            if (this.value === "Hourly") {
                $input.children("[name=date]").show();
                $input.children("[name=month]").hide();
                $input.children("[name=year]").hide();
            }
            else if (this.value === "DayWise" || this.value === "Weekely" || this.value === "Fortnightly") {
                $input.children("[name=month]").show();
                $input.children("[name=date]").hide();
                $input.children("[name=year]").hide();
            }
            else if (this.value === "Monthly" || this.value === "Quarterly" || this.value === "HalfYearly") {
                $input.children("[name=year]").show();
                $input.children("[name=date]").hide();
                $input.children("[name=month]").hide();
            }
        });

        $input.find("#date").change(this.SetDateFromDateTo.bind(this, $input));

        $input.find("#year").on('dp.change', this.SetDateFromDateTo.bind(this, $input));

        $input.find("select option[value='Hourly']").attr("selected", "selected");
        $input.find("select").trigger("change");
    };

    this.SetDateFromDateTo = function ($input, e) {
        if ($input.find("select").val() === "Hourly") {
            let _date = $input.find("#date").val();
            _date = moment(_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
            $input.find("#datefrom").val(_date);
            $input.find("#dateto").val(_date).trigger("change");
        }
        else if ($input.find("select").val() === "Weekely" || $input.find("select").val() === "DayWise") {
            let _month_year = $input.find("#month").val();
            let month = _month_year.split("/")[0];
            let year = _month_year.split("/")[1];
            let startDate = moment([year, month - 1]);
            let endDate = moment(startDate).endOf('month');
            $input.find("#datefrom").val(startDate.format("YYYY-MM-DD"));
            $input.find("#dateto").val(endDate.format("YYYY-MM-DD")).trigger("change");
        }
        else if ($input.find("select").val() === "Monthly" || $input.find("select").val() === "Quarterly" || $input.find("select").val() === "HalfYearly") {
            let year = $input.find("#year").val();
            startDate = moment([year]);
            endDate = moment([year]).endOf('year');
            $input.find("#datefrom").val(startDate.format("YYYY-MM-DD"));
            $input.find("#dateto").val(endDate.format("YYYY-MM-DD")).trigger("change");
        }

    };

    this.InputGeoLocation = function (ctrl) {
        ebcontext.userLoc = { lat: 0, long: 0 };
        if (typeof _rowId === 'undefined' || _rowId === 0) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $('#' + ctrl.EbSid_CtxId).locationpicker('location', {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            }.bind(this));
        }
        this.InitMap4inpG(ctrl);
        $("#" + ctrl.EbSid_CtxId + "_Cont").find(".loc-close").on("click", (e) => $(event.target).closest('.locinp-cont').find('.locinp').val(''));
        $("#" + ctrl.EbSid_CtxId + "_Cont").find(".locinp").on("focus", (e) => { $(e.target).select(); });
    };

    this.InitMap4inpG = function (ctrl) {
        let $input = $("#" + ctrl.EbSid_CtxId);
        var name = ctrl.EbSid;
        $input.locationpicker({
            location: {
                latitude: ebcontext.userLoc.lat,
                longitude: ebcontext.userLoc.long
            },
            radius: 5,
            zoom: 18,
            inputBinding: {
                latitudeInput: $('#' + name + 'lat'),
                longitudeInput: $('#' + name + 'long'),
                locationNameInput: $('#' + name + 'address')
            },
            enableAutocomplete: true,
            autocompleteOptions: {
                types: ['(cities)'],
                componentRestrictions: { country: 'fr' }
            },
            onchanged: function (currentLocation, radius, isMarkerDropped) {
                let ctrl = this;
                if (!ctrl.__isJustSetValue) {
                    if (ctrl.__ebonchangeFns) {
                        for (let i = 0; i < ctrl.__ebonchangeFns.length; i++) {
                            ctrl.__ebonchangeFns[i]();
                        }
                    }
                }
                else
                    ctrl.__isJustSetValue = false;////////////////////////////////////////////????????????????????????????
            }.bind(ctrl)
        });
        //$(`#${name}_Cont .choose-btn`).click(this.Renderer.chooseClick);

        if (this.Renderer.rendererName === "Bot")
            this.bindMapResize(ctrl);

    };

    this.Locations = function (ctrl) {
        let EbSid = ctrl.EbSid;
        if (ctrl.ShowTabed) {
            $(`#${EbSid} .loc-opt-btn`).off("click").on("click", function (e) {
                let $optBtn = $(e.target);
                let loc = $optBtn.attr("for");
                let ctrlArr = $.grep(ctrl.LocationCollection, function (ctrl, i) { return ctrl.name === loc; });
                let ctrl = ctrlArr[0];
                let $locDiv = $(`#${ctrl.Name}`);
                $(`#${EbSid} .loc-opt-btn`).css("border-bottom", "solid 2px transparent").css("font-weight", "normal").css("color", "#868585");
                $optBtn.css("border-bottom", "solid 2px #31d031").css("font-weight", "bold").css("color", "#333");
                if ($locDiv.closest(".location-box").css("display") === "none") {
                    $(`#${EbSid} .location-box`).hide(10);
                    $locDiv.closest(".location-box").show(10,
                        function () {
                            if ($locDiv.children().length === 0)
                                this.initMap(ctrl);
                        }.bind(this));
                }

            }.bind(this));
            $(`#${EbSid} .loc-opt-btn`)[0].click();
        }
        else {
            $(`#${EbSid} .loc-opt-DD`).off("change").on("change", function (e) {
                let loc = $(e.target).children().filter(":selected").val();
                let ctrlArr = $.grep(ctrl.LocationCollection.$values, function (ctrl, i) { return ctrl.Name === loc; });
                let LocCtrl = ctrlArr[0];
                let $locDiv = $(`#${LocCtrl.Name}`);
                if ($locDiv.closest(".location-box").css("display") === "none") {
                    $(`#${EbSid} .location-box`).hide(10);
                    $locDiv.closest(".location-box").show(10,
                        function () {
                            if ($locDiv.children().length === 0)
                                this.initMap(LocCtrl);
                        }.bind(this));
                }
            }.bind(this));

            $(`#${EbSid} .location-box:eq(0)`).show();
            this.initMap(ctrl.LocationCollection.$values[0]);
        }
    };

    this.initMap = function (ctrl) {
        let uluru = { lat: ctrl.Position.Latitude, lng: ctrl.Position.Longitude };
        let map = new google.maps.Map(document.getElementById(ctrl.Name), {
            zoom: 15,
            center: uluru
        });
        let marker = new google.maps.Marker({
            position: uluru,
            map: map
        });
        if (this.Renderer.rendererName === "Bot")
            this.bindMapResize(ctrl);
    };

    this.bindMapResize = function (ctrl) {
        $(window).resize(function () {
            $("#" + ctrl.EbSid).css("height", parseInt(($("#" + ctrl.EbSid).width() / 100 * 60)) + "px");
        });
    };

    this.DataGrid = function (ctrl, ctrlOpts) {
        return new EbDataGrid(ctrl, ctrlOpts);
    };

    this.DataGrid_New = function (ctrl, ctrlOpts) {
        return new EbDataGrid_New(ctrl, ctrlOpts);
    };

    this.ExportButton = function (ctrl, ctrlOpts) {
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        $ctrl[0].onclick = function () {
            //if (!this.Renderer.FRC.AllRequired_valid_Check())
            //    return;
            let params = [];
            params.push(new fltr_obj(16, "srcRefId", ctrlOpts.formObj.RefId));
            params.push(new fltr_obj(11, "srcRowId", ctrlOpts.dataRowId));
            let url = `../WebForm/Index?refid=${ctrl.FormRefId}&_params=${btoa(unescape(encodeURIComponent(JSON.stringify(params))))}&_mode=7`;
            window.open(url, '_blank');
        }.bind(this);
    };

    this.Review = function (ctrl, ctrlOpts) {
        return new EbReview(ctrl, ctrlOpts);
    };

    this.MeetingPicker = function (ctrl, ctrlOpts) {
        return new meetingPicker(ctrl, ctrlOpts, this.Renderer.rendererName);
    };

    this.MeetingScheduler = function (ctrl, ctrlOpts) {
        return new meetingScheduler(ctrl, ctrlOpts, this.Renderer.rendererName);
    };

    this.PowerSelect = function (ctrl, ctrlOpts) {
        let t0 = performance.now();

        if (ctrl.RenderAsSimpleSelect) {
            this.SimpleSelect(ctrl);
            return;
        }
        else if (ctrl.IsInsertable) {
            ctrl.__AddButtonInit = this.Button;
        }

        Vue.component('v-select', VueSelect.VueSelect);
        Vue.config.devtools = true;

        $(`#${ctrl.EbSid_CtxId}_loading-image`).hide();
        $(`#cont_${ctrl.EbSid_CtxId} .ctrl-cover`).css("min-height", ctrl.Padding.Top + ctrl.Padding.Bottom + 20 + "px");

        let EbCombo = new EbPowerSelect(ctrl, {
            getFilterValuesFn: ctrlOpts.getAllCtrlValuesFn,
            rendererName: this.Renderer.rendererName,
            renderer: this.Renderer,
            scrollableContSelectors: this.scrollableContSelectors
        });

        if (this.Bot && this.Bot.curCtrl !== undefined)
            this.Bot.curCtrl.SelectedRows = EbCombo.getSelectedRow;
        let t1 = performance.now();
        // console.dev_log("PowerSelect init took " + (t1 - t0) + " milliseconds.");
    };

    this.Survey = function (ctrl) {
        new EbSurveyRender($('#' + ctrl.Name), this.Renderer);
    };

    this.StaticCardSet = function (ctrl) {
        new EbCardRender({
            $Ctrl: $('#' + ctrl.EbSid),
            Bot: this.Renderer,
            CtrlObj: ctrl
        });
    };

    this.DynamicCardSet = function (ctrl) {
        new EbCardRender({
            $Ctrl: $('#' + ctrl.EbSid),
            Bot: this.Renderer,
            CtrlObj: ctrl
        });
    };

    this.ImageUploader = function (ctrl) {
        $('#' + ctrl.Name).off("change").on("change", function (input) {
            $(input.target).closest(".ctrl-wraper").next("[name=ctrlsend]").click();
        }.bind(this));
    };

    this.RadioGroup = function (ctrl) {
        $('#' + ctrl.Name).find("input").on("change", function (e) {
            var val = $('#' + this.id + 'Lbl').text().trim();
            $('#' + ctrl.Name).val(val);
        });
        if (ctrl.OnChangeFn && ctrl.OnChangeFn.Code && ctrl.OnChangeFn.Code !== '') {
            if (ctrl.DefaultValue !== "")
                $("body input[name='" + ctrl.EbSid_CtxId + "'][value='" + ctrl.DefaultValue + "']").prop("checked", true).trigger("change");
            else
                $("body input[name='" + ctrl.EbSid_CtxId + "']:eq(0)").prop("checked", true).trigger("change");
        }
    };

    this.CheckBoxGroup = function (ctrl) {
        $('#' + ctrl.Name).find("input").on("change", function (e) {
            var $ctrlDiv = $('#' + ctrl.Name); var values = "";
            $ctrlDiv.find("input").each(function (i, el) {
                if (el.checked) {
                    val = $('#' + el.id + 'Lbl').text().trim();
                    values += "," + val;
                }
            });
            $ctrlDiv.val(values.substring(1));
        });
    };

    this.Button = function (ctrl) {//////////////////////////////////////
        $('#' + ctrl.EbSid_CtxId).removeAttr("disabled");
        $('#' + ctrl.EbSid_CtxId).on('click', this.iFrameOpen.bind(this, ctrl));
    }.bind(this);

    this.SubmitButton = function (ctrl, ctrlOpts) {
        //checksubmitbutton
        $('#webformsave-selbtn').hide();
        if (ctrlOpts.renderMode === 3 || ctrlOpts.renderMode === 5) {
            $('#webform_submit').parent().prepend(`<div class = "text-center" id = 'captcha'> </div>
                    <input type='text' class = "text-center" placeholder='Enter the captcha' id='cpatchaTextBox' />`);

            ctrlOpts.code = "";
            this.CreateCaptcha(ctrlOpts);
        }
        $('#webform_submit').off('click').on('click', function () {
            event.preventDefault();
            if (ctrlOpts.renderMode === 3 || ctrlOpts.renderMode === 5) {
                if (document.getElementById("cpatchaTextBox").value === ctrlOpts.code) {
                    $('#webformsave').trigger('click');
                } else {
                    EbMessage("show", { Message: "Invalid Captcha. try Again", AutoHide: true, Background: '#aa0000' });
                    this.CreateCaptcha(ctrlOpts);
                }
            } else {
                $('#webformsave').trigger('click');
            }
        }.bind(this));
    }.bind(this);

    this.CreateCaptcha = function (ctrlOpts) {
        //CAPTCHA
        //clear the contents of captcha div first 
        document.getElementById('captcha').innerHTML = "";
        var charsArray =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@!#$%&*";
        var lengthOtp = 6;
        var captcha = [];
        for (var i = 0; i < lengthOtp; i++) {
            //below code will not allow Repetition of Characters
            var index = Math.floor(Math.random() * charsArray.length + 1); //get the next character from the array
            if (captcha.indexOf(charsArray[index]) === -1)
                captcha.push(charsArray[index]);
            else i--;
        }
        var canv = document.createElement("canvas");
        canv.id = "captcha";
        canv.width = 100;
        canv.height = 50;
        var ctx = canv.getContext("2d");
        ctx.font = "25px Verdana";
        ctx.strokeText(captcha.join(""), 0, 30);
        ctx.moveTo(0, 0);
        ctx.lineTo(300, 150);
        ctx.stroke();
        //storing captcha so that can validate you can save it somewhere else according to your specific requirements
        ctrlOpts.code = captcha.join("");
        document.getElementById("captcha").appendChild(canv); // adds the canvas to the body element
    };

    this.iFrameOpen = function (ctrl) {//////////////////
        let url = "../WebForm/Index?refid=" + ctrl.FormRefId + "&_mode=12";
        $("#iFrameForm").attr("src", url);
        $("#iFrameFormModal").modal("show");
    };

    this.SysLocation = function (ctrl) {
        if (!ebcontext.locations.CurrentLocObj)
            return;
        if (ctrl.DataVals && (typeof this.Renderer.rowId === 'undefined' || this.Renderer.rowId === 0)) {
            ctrl.DataVals.Value = ebcontext.locations.CurrentLocObj.LocId;
            ctrl.DataVals.F = ebcontext.locations.CurrentLocObj.ShortName;
        }
        if (!(ctrl.IsDisable)) {
            $.each(ebcontext.locations.Locations, function (intex, obj) {
                $("#" + ctrl.EbSid_CtxId).append(`<option value="${obj.LocId}"> ${obj.ShortName}</option>`);
            });
            $("#" + ctrl.EbSid_CtxId).val(ebcontext.locations.CurrentLocObj.LocId);
        }
    };

    this.SysCreatedBy = function (ctrl) {
        let $input = $("#" + ctrl.EbSid_CtxId);
        let usrId = ebcontext.user.UserId;
        $input.attr('data-id', usrId);
        $input.text(ebcontext.user.FullName);
        let usrImg = '/images/dp/' + usrId + '.png';
        $(`#${ctrl.EbSid_CtxId}_usrimg`).attr('src', usrImg);

        if (ctrl.constructor.name === "DGCreatedByColumn") {
            let width = $(`#td_${ctrl.EbSid_CtxId}`).width() - 34;
            $input.css("width", width + "px");
        }
    };

    this.SysModifiedBy = function (ctrl) {
        let usrId = ebcontext.user.UserId;
        $("#" + ctrl.EbSid_CtxId).attr('data-id', usrId);
        $("#" + ctrl.EbSid_CtxId).text(ebcontext.user.FullName);
        let usrImg = '/images/dp/' + usrId + '.png';
        $(`#${ctrl.EbSid_CtxId}_usrimg`).attr('src', usrImg);
    };

    this.SysCreatedAt = function (ctrl) {
        this.setCurrentDate(ctrl, $("#" + ctrl.EbSid_CtxId));
    };

    this.SysModifiedAt = function (ctrl) {
        this.setCurrentDate(ctrl, $("#" + ctrl.EbSid_CtxId));
    };

    this.ProvisionUser = function (ctrl, ctrlopts) {
        console.log('init ProvisionUser');

        $.each(ctrl.Fields.$values, function (i, obj) {
            if (obj.ControlName !== '') {
                let c = getObjByval(ctrlopts.flatControls, "Name", obj.ControlName);
                if (c)
                    obj.Control = c;
            }
        }.bind(this));
    };

    this.ProvisionLocation = function (ctrl, ctrlopts) {
        console.log('init ProvisionLocation');

        $.each(ctrl.Fields.$values, function (i, obj) {
            if (obj.ControlName !== '') {
                let c = getObjByval(ctrlopts.flatControls, "Name", obj.ControlName);
                if (c)
                    obj.Control = c;
            }
        }.bind(this));
    };

    this.DisplayPicture = function (ctrl, ctrlopts) {
        new DisplayPictureControl(ctrl, {});
    };

    this.ButtonSelect = function (ctrl, ctrlopts) {
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        let $buttons = $ctrl.find(".bs-btn");
        $buttons.on("click", this.bs_btn_onclick);
    };

    this.bs_btn_onclick = function (e) {
        let $btn = $(e.target).closest(".bs-btn");
        $btn.siblings(".bs-btn").attr("active", "false");
        $btn.attr("active", "true");
        $btn.closest(".chat-ctrl-cont").find("[name='ctrlsend']").trigger("click");
    }.bind(this);

    //this.bs_btn_onclick = function (e) {
    //    let $btn = $(e.target).closest(".bs-btn");
    //    let $checkBox = $btn.find("input");
    //    if ($btn.attr("active") === "false") {
    //        $btn.attr("active", "true");
    //        $checkBox.prop("checked", true);

    //    }
    //    else if ($btn.attr("active") === "true") {
    //        $btn.attr("active", "false");
    //        $checkBox.prop("checked", false);
    //    }
    //};

    this.UserSelect = function (ctrl, ctrlopts) {
        let itemList = new EbItemListControl({
            contSelector: `#${ctrl.EbSid_CtxId}Wraper`,
            itemList: ctrl.UserList.$values,
            EbSid_CtxId: ctrl.EbSid_CtxId
        });
        itemList.ctrl = ctrl;
        ctrl._JsCtrlMng = itemList;// to refer ControlOperation fns from code in cs file - moving ctrlOps is critical
    };

    this.TextBox = function (ctrl, ctrlopts) {
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        if (ctrl.TextMode === 0) {
            if (ctrl.AutoSuggestion === true) {
                $ctrl.autocomplete({ source: ctrl.Suggestions.$values });
            }
            //if (ctrl.TextTransform === 1)
            //    $("#" + ctrl.EbSid_CtxId).css("text-transform", "lowercase");
            //else if (ctrl.TextTransform === 2)
            //    $("#" + ctrl.EbSid_CtxId).css("text-transform", "uppercase");

            //$ctrl.keydown(function (event) {
            //    textTransform(this, ctrl.TextTransform);
            //});

            $ctrl.on('paste keydown', function (event) {
                textTransform(this, ctrl.TextTransform);
            });

            $ctrl.on('change', function (event) {
                textTransform(this, ctrl.TextTransform, true);
            });
        }
        else if (ctrl.TextMode === 2) {
            $ctrl.on('input', this.checkEmail.bind(this, ctrl));
        }
    };

    this.EmailControl = function (ctrl) {
        $("#" + ctrl.EbSid_CtxId).on('input', this.checkEmail.bind(this, ctrl));
    };

    this.checkEmail = function (ctrl) {
        if (EbvalidateEmail(event.target.value))
            ctrl.removeInvalidStyle();
        else
            ctrl.addInvalidStyle("Invalid email");
    }

    this.initNumeric = function (ctrl, $input) {
        let initValue = "0";
        if ($input.val() === "") {
            if (ctrl.DecimalPlaces > 0)
                initValue = initValue + "." + "0".repeat(ctrl.DecimalPlaces);
            $input.val(initValue);
        }
        if (ctrl.HideInputIcon)
            $input.siblings(".input-group-addon").hide();

        $input.inputmask("currency", {
            radixPoint: ".",
            allowMinus: ctrl.AllowNegative,
            groupSeparator: "",
            digits: ctrl.DecimalPlaces,
            prefix: '',
            autoGroup: true
        });

        $input.focus(function () { $(this).select(); });

        //$input.focusout(function () {
        //    var val = $(this).val().toString();
        //    var l = 'SZZZZZZZZZZZ'.length - 1;
        //    var ndp = ctrl.DecimalPlaces;
        //    if (val === "0" || val === '' || val === '.')
        //        $(this).val('');
        //    else {
        //        if (ndp !== 0) {
        //            if ((!val.includes('.')) && (l !== val.length))
        //                val = val + '.';
        //            if ((val.includes('.'))) {
        //                var pi = val.indexOf('.');
        //                var lmt = pi + ndp;
        //                for (pi; pi <= l; pi++) {
        //                    if (val[pi] === null)
        //                        val += '0';
        //                    if (pi === lmt)
        //                        break;
        //                }
        //            }
        //        }
        //        if (val[0] === '.')
        //            val = '0' + val;
        //        $(this).val(val);
        //    }
        //});

        {// temp for hairo craft
            $input.blur(function () {
                var val = $input.val();
                let decLen = 2;

                if (val.trim() === "") {
                    $input.val("0.00");
                }
                else if (!val.trim().includes(".")) {
                    let newVal = val + ".00";
                    $input.val(newVal);
                }
                else {
                    let p1 = val.split(".")[0];
                    let p2 = val.split(".")[1];
                    zerolen = decLen - p2.length;
                    let newVal = p1 + "." + p2 + "0".repeat(zerolen > 0 ? zerolen : 0);
                    $input.val(newVal);
                }
            });
        }
        //$input.keypress(function (e) {

        //    var val = $input.val();
        //    var cs = document.getElementById(id).selectionStart;
        //    var ce = document.getElementById(id).selectionEnd;

        //    if (e.which === 46 && val.includes('.')) {
        //        setTimeout(function () {
        //            $input.val(val);
        //        }, 1);
        //    }

        //    //// containes '.' and no selection
        //    //if (val.includes('.') && cs === ce) {
        //    //    setTimeout(function () {
        //    //        var pi = val.indexOf('.');
        //    //        //prevents exceeding decimal part length when containes '.'
        //    //        if ((val.length - pi) === (ctrl.DecimalPlaces + 1) && (e.which >= 48) && (e.which <= 57) && ce > pi)
        //    //            $input.val(val);
        //    //        //prevents exceeding integer part length when containes '.'
        //    //        if (pi === (ctrl.MaxLength - ctrl.DecimalPlaces) && (e.which >= 48) && (e.which <= 57) && ce <= pi)
        //    //            $input.val(val);
        //    //    }, 1);
        //    //}
        //    ////prevents exceeding integer-part length when no '.'
        //    //if (!(val.includes('.')) && val.length === (ctrl.MaxLength - ctrl.DecimalPlaces) && (e.which >= 48) && (e.which <= 57)) {
        //    //    setTimeout(function () {
        //    //        $input.val(val + '.' + String.fromCharCode(e.which));

        //    //    }, 1);
        //    //}
        //    ////prevents del before '.'if it leads to exceed integerpart limit
        //    //if (val.includes('.') && (val.length - 1) > (ctrl.MaxLength - ctrl.DecimalPlaces) && cs === val.indexOf('.') && e.which === 0) {
        //    //    setTimeout(function () {
        //    //        $input.val(val);
        //    //    }, 1);
        //    //}
        //    ////prevents <- after '.' if it leads to exceed integerpart limit
        //    //if (val.includes('.') && (val.length - 1) > (ctrl.MaxLength - ctrl.DecimalPlaces) && cs === (val.indexOf('.') + 1) && e.which === 8) {
        //    //    setTimeout(function () {
        //    //        $input.val(val);
        //    //    }, 1);
        //    //}
        //    ////prevents deletion of selection when containes '.' if it leads to exceed integerpart limit
        //    //if ((val.includes('.') && val.length - (ce - cs)) > (ctrl.MaxLength - ctrl.DecimalPlaces) && cs <= val.indexOf('.') && ce > val.indexOf('.')) {
        //    //    setTimeout(function () {
        //    //        $input.val(val);
        //    //    }, 1);
        //    //}
        //});

        //let sPattern = /[0-9.]/;
        //if (!ctrl.AllowNegative)
        //    sPattern = /[0-9]/;

        //$input.mask('SZZZZZZZZZZZ', {
        //    //reverse: true,
        //    translation: {
        //        'S': {
        //            pattern: sPattern,
        //            optional: true
        //        },
        //        'Z': {
        //            pattern: /[0-9.]/,
        //            optional: true
        //        }
        //    }
        //});
        //}.bind(this), 0);
        var elm = $input[0];
        if (ctrl.MaxLimit !== 0 || ctrl.MinLimit !== 0)
            elm.onchange = createValidator.bind(ctrl)(elm);
    };

    this.Numeric = function (ctrl) {
        var id = ctrl.EbSid_CtxId;
        let $input = $("#" + ctrl.EbSid_CtxId);
        if (ctrl.InputMode === 0) {
            this.initNumeric(ctrl, $input);
        }
        else if (ctrl.InputMode === 1)// currency
            this.initNumeric(ctrl, $input);
        else if (ctrl.InputMode === 2) {// phone
            $input.inputmask("999-999-9999");
        }
    };

    this.getKeyByValue = function (Obj, value) {
        for (var prop in Obj) {
            if (Obj.hasOwnProperty(prop)) {
                if (Obj[prop] === value)
                    return prop;
            }
        }
    };

    this.BluePrint = function (ctrl, ctrlopts) {
        console.log("view mode bp");
        var bphtml = `<div id='bpdiv_${ctrl.EbSid}' >
                        <div id='toolbar_divBP' class='col-md-1 col-lg-1 col-sm-1 toolbarBP_cls_dev'>
                           <div class='vertical-align_tlbr' >
                                
                                    <div  id='addPolygon_BP' class='bp_toolbarproperties ' title="Mark">
                                        <i class="fa fa-object-ungroup "></i>   
                                    </div>

                                    <div  id='bg_image_BP' class='bp_toolbarproperties 'title="Image upload">
                                        <label for="bg_image">
                                           <i class='fa fa-picture-o'></i>
                                        </label>
                                         <input type='file' id='bg_image' accept='image/jpeg,image/png,image/jpg,svg' style=' display: none;' />
                                    </div> 

                                    <div id='removecircle_BP' class='bp_toolbarproperties 'title="Remove circles">
                                        <i class='fa fa-minus-circle'></i>
                                    </div>

                                     <div id='resetsvg_BP' class='bp_toolbarproperties 'title="Reset position">
                                        <i class='fa fa-refresh'></i>
                                    </div>

                                    <div id='clearsvg_BP' class='bp_toolbarproperties 'title="Clear layers">
                                        <i class='fa fa-eraser '></i>
                                    </div>

                                    <div id='mark_position' class='bp_toolbarproperties ' tabindex='1' title="Mark Positions">
                                        <i class='fa fa-stop-circle-o '></i>
                                    </div>

                                    <div id='zoomToggle_BP' class='bp_toolbarproperties 'title="Zoom">
                                        <i class='fa fa-search  '></i>
                                    </div>
                            </div>
                        </div>
                        <div class="col-md-11 col-lg-11 col-sm-11 svgcntnrBP_usr">

                            <div id="svgContainer"></div>
                        </div>
                    </div>`;
        $('#' + ctrl.EbSid + 'Wraper').find('#' + ctrl.EbSid).addClass('bpdiv_retrive').html(bphtml);
        $('#cont_' + ctrl.EbSid).css('height', '100%');
        $('#bpdiv_' + ctrl.EbSid).css('height', '100%');
        $('#' + ctrl.EbSid + 'Wraper').css('height', '100%');


        var drawBP = new drawBluePrintfn(ctrl);

        drawBP.redrawSVGelements_usr();

        ctrl.getValueFromDOM = drawBP.getvalueSelected;
        ctrl.setValue = drawBP.setvalueSelected;
        ctrl._onChangeFunctions = [];
        ctrl.bindOnChange = function (p1) {
            if (!this._onChangeFunctions.includes(p1))
                this._onChangeFunctions.push(p1);
        };
        ctrl.clear = drawBP.clear_ctrlAftrsave;
        //display
        //ctrl.setValue = dgbf;
        ////store
        // ctrl.getValueFromDOM = drawBP.getvalueSelected();
        ////call fn onchange
        //ctrl.bindOnChange = asgd;

    }

    this.Rating = function (ctrl) {
        if ((ebcontext.user.wc == 'uc') || this.Renderer.rendererName === "Bot") {
            $("#" + ctrl.EbSid).empty();
            $("#" + ctrl.EbSid).rateYo({

                numStars: ctrl.MaxVal,
                maxValue: ctrl.MaxVal,
                fullStar: !(ctrl.HalfStar),
                halfStar: ctrl.HalfStar,
                spacing: `${ctrl.Spacing}px`,
                starWidth: `${ctrl.StarWidth}px`,
                ratedFill: ctrl.RatingColor
            });
            if (ctrl.RemoveBorder == true) {
                if (this.Renderer.rendererName === "Bot") {
                    $(`#cont_${ctrl.EbSid}`).css({ 'border': 'none' });
                }
                else {
                    $(`#${ctrl.EbSid}Wraper`).css({ 'border': 'none' });
                }

            }
        }

    }

    this.TagInput = function (ctrl) {
        //$('#' + ctrl.EbSid).find('.bootstrap-tagsinput').find('.tag');
        //$('input[name = ' + ctrl.EbSid_CtxId + '_tags]').css("font-size", ctrl.FontSizes + 'px')
        //ctrl.clear = function (p1) {
        //    return $('input[name = ' + ctrl.EbSid_CtxId + '_tags]').va("");
        //}
    };

    this.RichText = function (ctrl) {
        $(`#${ctrl.EbSid}`).summernote({
            height: ctrl.TextBoxHeight,
            toolbar: [
                ['font', ['bold', 'underline', 'italic', 'strikethrough', 'subscript', 'superscript', 'clear']],
                ['fontname', ['fontname']],
                ['fontsize', ['fontsize', 'height']],
                ['color', ['color']],
                ['style', ['style']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link']],
                ['view', ['undo', 'redo', 'help']],
            ],
            disableResizeEditor: true,
            disableDragAndDrop: true,
            dialogsInBody: true
        });


        ctrl.clear = function (p1) {
            return $(`#${ctrl.EbSid}`).summernote('reset');
        };


    };

    this.SimpleFileUploader = function (ctrl) {
        let filePlugin = $("#" + ctrl.EbSid).fileUploader({
            fileCtrl: ctrl,
            renderer: this.Renderer.rendererName,
            maxSize: ctrl.MaxSize,
            fileTypes: ctrl.FileTypes,
            maxFiles: ctrl.MaxFiles

        });


        ctrl.getValueFromDOM = function (p1) {
            return filePlugin.refidListfn();
        };
        ctrl.bindOnChange = function (p1) {
            $("#" + ctrl.EbSid + "_bindfn").on("change", p1);
        };
        ctrl.setValue = function (p1) {
            filePlugin.createPreloaded(p1);
        };
        ctrl.clear = function () {
            return filePlugin.clearFiles();
        };
    };

    this.Phone = function (ctrl, ctrlOpts) {
        $('.phnContextBtn').hide();
        if (this.Renderer.mode === 'View Mode') {
            if (this.Renderer.rendererName === "WebForm") {
                if (ctrl.SendMessage) {
                    this.ctrlopts = ctrlOpts;
                    this.phonectrl = ctrl;
                    this.Contexmenu4SmsColumn(ctrl);
                }
            }
        }

        var phninput = document.querySelector(`#${ctrl.EbSid}`);



        var iti = window.intlTelInput(phninput, {
            allowDropdown: true,
            // autoHideDialCode: false,
            // autoPlaceholder: "off",
            // dropdownContainer: "body",
            //defaultCountry: "auto",
            formatOnDisplay: true,
            geoIpLookup: function (callback) {
                $.get("https://ipinfo.io", function () { }, "jsonp").always(function (resp) {
                    var countryCode = (resp && resp.country) ? resp.country : "";
                    callback(countryCode);
                });
            },
            initialCountry: "auto",
            // nationalMode: false,
            //onlyCountries: ['us', 'gb', 'ch', 'ca', 'do'],
            //placeholderNumberType: "MOBILE",
            preferredCountries: [],
            separateDialCode: true,
            dropdown_maxheight: (ctrl.DropdownHeight || '100') + "px",
            utilsScript: "../js/EbControls/EbPhoneControl_Utils.js"
        });
        ctrl.getValueFromDOM = function (p1) {
            //to get numer only without country code===>$((`#${ctrl.EbSid}`),val();           
            return iti.getNumber();;
        };
        ctrl.bindOnChange = function (p1) {
            $(phninput).on("change", p1);
            $(phninput).on('countrychange ', p1);
        };
        ctrl.setValue = function (p1) {
            iti.setNumber(p1);
        };


    };

    this.Contexmenu4SmsColumn = function (ctrl) {
        $.contextMenu({
            selector: ".phnContextBtn",
            trigger: 'left',
            build: function ($trigger, e) {
                return {
                    items: {
                        "SENDSMS": {
                            name: "Send SMS",
                            icon: "fa-mobile",
                            callback: this.OpenSMSModal.bind(this)
                        }
                    }
                };
            }.bind(this)
        });
    };

    this.OpenSMSModal = function (ctrl, opt) {
        //let colname = $(opt.$trigger).attr("data-colname");
        //this.phonecolumn = this.EbObject.Columns.$values.filter(obj => obj.name === colname)[0];       
        this.AppendSMSModal($(opt.$trigger));
        this.AppendSMSTemplates($(opt.$trigger));
        $("#smsmodal").modal("show");
    };

    this.AppendSMSModal = function ($elem) {
        $("#smsmodal").remove();
        let modal1 = `<div class="modal fade" tabindex="-1" role="dialog" id='smsmodal'>
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">SMS Template</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" id='sms-modal-body'>
        <table class='table'>
            <tbody>
                <tr><td><div class='smslabel'>Template :</div></td><td class='smstemplate-select-cont'></td>
                    <td><div class='smslabel'>To :</div></td>
                    <td class='sms-number-cont'>
                        <input class="form-control" type='text' id='sms-number' placeholder='phone number here..'>
                    </td>
                </tr>
                <tr><td colspan='4' class='sms-textarea-cont'><textarea id='sms-textarea'  rows='5' style='resize:none' class="form-control" placeholder='SMS text here..'></textarea></td></tr>
            </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id='sendbtn'><i class="fa fa-paper-plane" aria-hidden="true"></i><span id='sendbtn-text'>Send</span></button>
      </div>
    </div>
  </div>
</div>`;

        $("body").prepend(modal1);
        $("#sendbtn").prop("disabled", true);
        $("#sendbtn").off("click").on("click", this.SendSMS.bind(this, $elem));
    }.bind(this);

    this.AppendSMSTemplates = function ($elem) {
        let template = `<select class="selectpicker smstemplate-select">`;
        //template += `<option value=''>--- Select SMS Template ---</option>`;
        $.each(this.phonectrl.Templates.$values, function (i, obj) {
            template += `<option value='${obj.ObjRefId}'>${obj.ObjDisplayName}</option>`;
        });
        template += `<option value=''>Custom Template</option>`;
        template += `</select>`;
        $(".smstemplate-select-cont").append(template);
        $(".smstemplate-select").selectpicker();
        $('#sms-modal-body .selectpicker').on('changed.bs.select', this.ClickOnTemplate.bind(this, $elem));
        $('#sms-modal-body .selectpicker').val(this.phonectrl.Templates.$values[0].ObjRefId).change();
    };

    this.ClickOnTemplate = function ($elem, e, clickedIndex, isSelected, previousValue) {
        let refid = $(".smstemplate-select option:selected").val();
        //var idx = this.Api.row($elem.parents().closest("td")).index();
        //this.rowData = this.unformatedData[idx];
        //let filters = this.getFilterValues().concat(this.FilterfromRow());
        let filters = getValsFromForm(this.ctrlopts.formObj);
        filters.push(new fltr_obj(11, "id", this.Renderer.rowId));
        $("#sendbtn").prop("disabled", false);
        if (refid) {
            $.ajax({
                type: "POST",
                url: "../DV/GetSMSPreview",
                data: { RefId: refid, Params: filters },
                success: this.AppendSMSPreview.bind(this)
            });
        }
        else
            this.AppendSMSPreview();
    };

    this.AppendSMSPreview = function (result) {
        if (result) {
            result = JSON.parse(result);
            $("#sms-number").val(result.FilledSmsTemplate.SmsTo).prop("disabled", true);
            $("#sms-textarea").val(atob(result.FilledSmsTemplate.SmsTemplate.Body)).prop("disabled", true);
        }
        else {
            $("#sms-textarea").val("").prop("disabled", false);
        }
    };

    this.SendSMS = function ($elem) {
        if (this.MakeSMSValidation()) {
            $("#smsmodal").modal("hide");
            $("#eb_common_loader").EbLoader("show");
            let refid = $(".smstemplate-select option:selected").val();
            if (refid) {
                //var idx = this.Api.row($elem.parents().closest("td")).index();
                //this.rowData = this.unformatedData[idx];
                //let filters = this.getFilterValues().concat(this.FilterfromRow());
                let filters = getValsFromForm(this.ctrlopts.formObj);
                filters.push(new fltr_obj(11, "id", this.Renderer.rowId));
                $.ajax({
                    type: "POST",
                    url: "../DV/SendSMS",
                    data: { RefId: refid, Params: filters },
                    success: this.SendSMSSuccess.bind(this)
                });
            }
            else {
                $.ajax({
                    type: "POST",
                    url: "../DV/SendCustomSMS",
                    data: { To: $("#sms-number").val(), Body: $("#sms-textarea").val() },
                    success: this.SendSMSSuccess.bind(this)
                });
            }
        }
    };

    this.MakeSMSValidation = function () {
        if ($("#sms-number").val() && $("#sms-textarea").val())
            return true;
        else {
            EbMessage("show", { Message: "Phone number or text is Empty", Background: "#e40707" });
            return false;
        }
    };

    this.SendSMSSuccess = function () {
        $("#eb_common_loader").EbLoader("hide");
        EbPopBox("show", { Message: "Message sent", Title: "Success" });
    };

    //phonecontrol ends 

    this.PdfControl = function (ctrl) {
        //let m = `<iframe id="iFramePdf" style="width: 40%; height: 40vh; border: none;" src="/WebForm/GetPdfReport?refId=${ctrl.PdfRefid.$values[0].ObjRefId}"></iframe>`;
        //$("#cont_" + ctrl.EbSid).append(m);       
        if (ctrl.PdfRefid) {
            if (ctrl.ParamsList) {
                var paramArray = [];
                paramsList = ctrl.ParamsList.$values.map(function (obj) { return "form." + obj.Name; });
                for (let i = 0; i < paramsList.length; i++) {
                    let depCtrl_s = paramsList[i];
                    let depCtrl = this.Renderer.formObject.__getCtrlByPath(depCtrl_s);
                    if (!getObjByval(paramArray, "Name", depCtrl_s.replace("form.", ""))) { // bot related check
                        let val = '';
                        let ebDbType = 11;
                        let name = "";
                        if (depCtrl_s === "form.eb_loc_id") {
                            val = (ebcontext.locations) ? ebcontext.locations.getCurrent() : 1;
                            name = "eb_loc_id";
                        }
                        else if (depCtrl_s === "form.eb_currentuser_id") {
                            val = ebcontext.user.UserId;
                            name = "eb_currentuser_id";
                        }
                        else if (depCtrl_s === "form.id") {
                            val = this.Renderer.rowId;
                            name = "id";
                        }
                        else {
                            val = depCtrl.getValue();
                            name = depCtrl.Name;
                            ebDbType = depCtrl.EbDbType;
                        }

                        paramArray.push(new fltr_obj(ebDbType, name, val));
                    }
                }
                var paramString = btoa(unescape(encodeURIComponent(JSON.stringify(paramArray))));
            }
            $(`#icon_${ctrl.EbSid}`).click(function () {
                if (this.Renderer.rendererName === "WebForm") {
                    if (confirm(`Download ${ctrl.PdfRefid}.pdf?`)) {
                        let link = document.createElement('a');
                        link.download = this.Renderer.FormObj.DisplayName + "-" + ctrl.Label;
                        link.href = `/ReportRender/Renderlink?refId=${ctrl.PdfRefid}&_params=${paramString}`;
                        link.click();
                    }
                    
                }
                else if (this.Renderer.rendererName === "Bot") {
                    let link = document.createElement('a');
                    link.download = this.Renderer.curForm.DisplayName + "-" + ctrl.Label;
                    link.href = `/Boti/Renderlink?refId=${ctrl.PdfRefid}&_params=${paramString}`;
                    link.click();
                }
            }.bind(this));
        }


    }
};



function createValidator(element) {
    return function () {
        //if (!isPrintable(event))
        //    return;

        if (element.__latestValue === parseFloat(element.value))// to prevent recursion from trigger("change");
            return;
        let min = parseFloat(element.getAttribute("min")) || 0;
        let max = parseFloat(element.getAttribute("max")) || 0;

        let value = parseFloat(element.value) || min;
        element.value = value; // make sure we got an int

        if (value < min && min !== 0) element.value = min;
        if (value > max && max !== 0) element.value = max;
        element.__latestValue = parseFloat(element.value);
        $(element).trigger("change");
    }.bind(this);
}
//import { Array, Object } from "core-js/library/web/timers";

var Eb_chatBot = function (_solid, _appid, settings, cid, ssurl, _serverEventUrl) {
    console.log("chatbot.js loaded for bot " + _appid);
    this.EXPRESSbase_SOLUTION_ID = _solid;
    this.EXPRESSbase_APP_ID = _appid;
    this.EXPRESSbase_cid = cid;
    this.ebbotThemeColor = settings.ThemeColor || "#055c9b";
    this.welcomeMessage = settings.WelcomeMessage || "Hi, I am EBbot from EXPRESSbase!";
    this.ServerEventUrl = _serverEventUrl;
    this.botdpURL = 'url(' + (settings.DpUrl || ('../images/businessmantest.png')) + ')center center no-repeat';
    //this.botdpURL = 'url(' + window.atob(settings.DpUrl || window.btoa('../images/businessmantest.png')) + ')center center no-repeat';
    this.$chatCont = $(`<div class="eb-chat-cont" eb-form='true'  eb-root-obj-container isrendermode='true'></div>`);
    this.$chatBox = $('<div class="eb-chatBox"></div>');
    this.$frameHeader = $('<div class="eb-FrameHeader"></div>');
    this.$inputCont = $('<div class="eb-chat-inp-cont"><input type="text" class="msg-inp"/><button class="btn btn-info msg-send"><i class="fa fa-chevron-right" aria-hidden="true"></i></button></div>');
    this.$poweredby = $('<div class="poweredby-cont"><div class="poweredby"><i>powered by</i> <span>EXPRESSbase</span></div></div>');
    this.$msgCont = $('<div class="msg-cont"></div>');
    this.$renderAtBottom = $('<div class="renderAtBtm"></div>');
    this.$botMsgBox = this.$msgCont.clone().wrapInner($('<div class="msg-cont-bot"><div class="msg-wraper-bot"></div></div>'));
    this.$botMsgBox.prepend('<div class="bot-icon"></div>');
    this.$userMsgBox = this.$msgCont.clone().wrapInner($('<div class="msg-cont-user"><div class="msg-wraper-user"></div></div>'));
    this.$userMsgBox.append('<div class="bot-icon-user"></div>');
    this.ready = true;
    this.isAlreadylogined = true;
    //this.bearerToken = null;
    //this.refreshToken = null;
    this.initControls = new InitControls(this);
    this.rendererName = "Bot";
    this.typeDelay = 600;
    this.controlHideDelay = 300;
    this.breathingDelay = 200;
    this.ChartCounter = 0;
    this.formsList = {};
    this.formsDict = {};
    this.formNames = [];
    this.formIcons = [];
    this.curForm = {};
    this.formControls = [];
    this.formValues = {};
    this.formValuesWithType = {};
    this.formFunctions = {};
    this.formFunctions.visibleIfs = {};
    this.formFunctions.valueExpressions = {};
    this.nxtCtrlIdx = 0;
    this.IsDpndgCtrEdt = false;
    this.FB = null;
    this.FBResponse = {};
    this.userDtls = {};
    this.ssurl = ssurl;
    this.userLoc = {};
    this.botQueue = [];
    this.botflg = {};
    this.botflg.loadFormlist = false;
    this.botflg.singleBotApp = false;
    this.botflg.startover = false;
    this.botflg.otptype = "";
    this.botflg.uname_otp = "";
    this.formObject = {};// for passing to user defined functions
    this.CurFormflatControls = [];// for passing to user defined functions

    this.init = function () {
        $("body").append(this.$chatCont);
        this.$renderAtBottom.hide();
        this.$chatCont.append(this.$chatBox);
        this.$chatCont.append(this.$inputCont);
        this.$chatCont.append(this.$renderAtBottom);
        if (settings.BotProp.EbTag) {
            this.$chatCont.append(this.$poweredby);
        }
        this.$TypeAnim = $(`<div><svg class="lds-typing" width="30px" height="30px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                    <circle cx="27.5" cy="40.9532" r="5" fill="#999">
                        <animate attributeName="cy" calcMode="spline" keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5" repeatCount="indefinite" values="62.5;37.5;62.5;62.5" keyTimes="0;0.25;0.5;1" dur="1s" begin="-0.5s"></animate>
                    </circle>
                    <circle cx="42.5" cy="56.4907" r="5" fill="#aaa">
                        <animate attributeName="cy" calcMode="spline" keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5" repeatCount="indefinite" values="62.5;37.5;62.5;62.5" keyTimes="0;0.25;0.5;1" dur="1s" begin="-0.375s"></animate>
                    </circle>
                    <circle cx="57.5" cy="62.5" r="5" fill="#bbb">
                        <animate attributeName="cy" calcMode="spline" keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5" repeatCount="indefinite" values="62.5;37.5;62.5;62.5" keyTimes="0;0.25;0.5;1" dur="1s" begin="-0.25s"></animate>
                    </circle>
                </svg><div>`);

        let html = document.getElementsByTagName('html')[0];
        html.style.setProperty("--botdpURL", this.botdpURL);
        //html.style.setProperty("--botThemeColor", this.ebbotThemeColor);

        let $botMsgBox = this.$botMsgBox.clone();
        $botMsgBox.find('.msg-wraper-bot').html(this.$TypeAnim.clone()).css("width", "82px");
        this.$TypeAnimMsg = $botMsgBox;

        $("body").on("click", ".eb-chat-inp-cont .msg-send", this.send_btn);
        $("body").on("click", ".msg-cont [name=ctrlsend]", this.ctrlSend);
        $("body").on("click", ".msg-cont [name=ctrledit]", this.ctrlEdit);
        $("body").on("click", ".eb-chatBox [name=formsubmit]", this.formSubmit);
        $("body").on("click", ".eb-chatBox [name=formcancel]", this.formCancel);
        $("body").on("click", ".eb-chatBox [name=formsubmit_fm]", this.formSubmit_fm);
        $("body").on("click", ".eb-chatBox [name=formcancel_fm]", this.formCancel_fm);
        $("body").on("click", "[for=loginOptions]", this.loginSelectedOpn);
        $("body").on("click", "[name=contactSubmit]", this.contactSubmit);
        $("body").on("click", "[name=contactSubmitMail]", this.contactSubmitMail);
        $("body").on("click", "[name=contactSubmitPhn]", this.contactSubmitPhn);
        $("body").on("click", "[name=contactSubmitName]", this.contactSubmitName);
        $("body").on("click", "[name=passwordSubmitBtn]", this.passwordLoginFn);
        $("body").on("click", "[name=otpUserSubmitBtn]", this.otpLoginFn);
        $("body").on("click", "[name=otpvalidateBtn]", this.otpvalidate);
        $("body").on("click", "#resendOTP", this.otpResendFn);
        $("body").on("click", ".btn-box_botformlist [for=form-opt]", this.startFormInteraction);
        $("body").on("click", ".btn-box [for=continueAsFBUser]", this.continueAsFBUser);
        $("body").on("click", ".btn-box [for=fblogin]", this.FBlogin);
        //$("body").on("click", ".btn-box [for=emaillogin]", this.emailLoginFn);
        $("body").on("click", ".cards-btn-cont .btn", this.ctrlSend);
        $("body").on("click", ".survey-final-btn .btn", this.ctrlSend);
        $("body").on("click", "[ctrl-type='InputGeoLocation'] .ctrl-submit-btn", this.ctrlSend);
        $("body").on("click", ".poweredby", this.poweredbyClick);
        $("body").on("click", ".ctrlproceedBtn", this.proceedReadonlyCtrl.bind(this));
        $("body").on("click", "#eb_botStartover", this.botStartoverfn);
        $('.msg-inp').on("keyup", this.txtboxKeyup);
        $("body").on("keyup", ".chat-ctrl-cont [ui-inp]", this.inpkeyUp);
        $("body").on("keyup", ".chat-ctrl-cont [chat-inp]", this.chatInpkeyUp);
        this.initConnectionCheck();
        this.showDate();
        this.showTypingAnim();
        //$('body').confirmation({
        //    selector: '.eb-chatBox'
        //});
        this.botUserLogin();
    };

    this.poweredbyClick = function () {
        window.open('https://expressbase.com/Products/Bots/', '_blank');
    }.bind(this);

    //if anonimous user /not loggegin using fb
    this.contactSubmit = function (e) {
        let emailReg = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let phoneReg = /^([+]{0,1})([0-9]{10,})$/;
        let email = "";
        let phone = "";
        let username = "";
        if (settings.Authoptions.Fblogin) {
            email = $("#anon_mail").val().trim();
            phone = $("#anon_phno").val().trim();
            if (!((emailReg.test(email) || email === "") && (phoneReg.test(phone) || phone === "") && email !== phone)) {
                //EbMessage("show", { Message: "Please enter valid email/phone", AutoHide: true, Background: '#bf1e1e', Delay: 4000 });
                this.msgFromBot("Please enter valid email/phone");
                return;
            }
            this.msgFromBot("Thank you.");
            this.authenticateAnon(email, phone);
            $(e.target).closest('.msg-cont').remove();
        }


    }.bind(this);

    this.contactSubmitMail = function (e) {
        let emailReg = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let email = "";
        email = $("#anon_mail").val().trim();
        if (!(emailReg.test(email)) || email === "") {
            this.msgFromBot("Please enter a valid email address");
            return;
        }
        this.userDtls.email = email;
        this.postmenuClick(e, email);
        if (this.botQueue.length > 0) {
            (this.botQueue.shift())();
        }
        else {
            this.submitAnonymous();
        }

    }.bind(this);

    this.contactSubmitPhn = function (e) {
        let phoneReg = /^([+]{0,1})([0-9]{10,})$/;
        let phone = "";
        phone = $("#anon_phno").val().trim();
        if (!(phoneReg.test(phone)) || phone === "") {
            this.msgFromBot("Please enter valid phone number");
            return;
        }
        this.userDtls.phone = phone;
        this.postmenuClick(e, phone);
        if (this.botQueue.length > 0) {
            (this.botQueue.shift())();
        }
        else {
            this.submitAnonymous();
        }

    }.bind(this);

    this.contactSubmitName = function (e) {
        let nameReg = /^[a-zA-Z ]{2,30}$/;
        let username = "";
        username = $("#anon_name").val().trim();
        if (!(nameReg.test(username)) || username === "") {
            this.msgFromBot("Please enter valid name");
            return;
        }
        this.userDtls.name = username;
        this.postmenuClick(e, username);
        this.msgFromBot(`Welcome ${username}`);
        if ((getTokenFromCookie("bot_bToken") != "") && (getTokenFromCookie("bot_rToken") != "")) {
            this.getBotformList();
        }
        else {
            if (settings.Authoptions.LoginOpnCount > 1) {
                this.loginList();
            }
            else {
                this.LoginOpnDirectly();
            }
        }

    }.bind(this);

    this.submitAnonymous = function () {
        this.msgFromBot("Thank you.");
        //let mail = this.userDtls.email || "";
        //let phn = this.userDtls.phone || "";
        //let nme = this.userDtls.name || "";
        let mail = this.userDtls.email;
        let phn = this.userDtls.phone;
        let nme = this.userDtls.name;
        this.authenticateAnon(mail, phn, nme);
        //  $(e.target).closest('.msg-cont').remove();
    };

    //check user is valid / is user authenticated
    this.ajaxSetup4Future = function () {
        //$.ajaxSetup({
        //    //beforeSend: function (xhr) { xhr.setRequestHeader('bToken', this.bearerToken); xhr.setRequestHeader('rToken', this.refreshToken); }.bind(this),
        //    //complete: function (resp) { this.bearerToken = resp.getResponseHeader("btoken"); }.bind(this)

        //});
    };

    this.authenticateAnon = function (email, phno, name) {
        
        setTimeout(function () {
            this.showTypingAnim();
        }.bind(this), this.typeDelay);
        $.post("../bote/AuthAndGetformlist",
            {
                "cid": this.EXPRESSbase_SOLUTION_ID,
                "appid": this.EXPRESSbase_APP_ID,
                "socialId": null,
                "wc": "bc",
                "anon_email": email,
                "anon_phno": phno,
                "user_ip": this.userDtls.ip,
                "user_browser": this.userDtls.browser,
                "user_name": this.userDtls.name || null
            }, function (result) {
                this.hideTypingAnim();
                if (result.status === false) {
                    this.msgFromBot(result.errorMsg);
                }
                else {
                    //this.bearerToken = result.bearerToken;
                    //this.refreshToken = result.refreshToken;
                    this.formsDict = result.botFormDict;
                    window.ebcontext.user = JSON.parse(result.user);
                    //this.formNames = Object.values(this.formsDict);
                    this.formNames = Object.values(result.botFormNames);
                    this.formIcons = result.botFormIcons;
                    $('.eb-chatBox').empty();
                    this.showDate();
                    if (Object.keys(this.formsDict).length == 1) {
                        this.botflg.singleBotApp = true;
                        this.curRefid = Object.keys(this.formsDict)[0];
                        this.getForm(this.curRefid);
                    }
                    else {
                        this.AskWhatU();
                    }
                    // this.ajaxSetup4Future();

                }
                /////////////////////////////////////////////////

                setTimeout(function () {
                    //$(".btn-box .btn:last").click();
                    //$(".btn-box_botformlist button:eq(2)").click();// test auto
                }.bind(this), this.typeDelay * 4 + 100);

            }.bind(this));

    }.bind(this);

    this.getBotformList = function () {
        if (this.botflg.loadFormlist === false) {
            setTimeout(function () {
                this.showTypingAnim();
            }.bind(this), this.typeDelay);
            this.botflg.loadFormlist = true;
            $.ajax({
                type: "POST",
                url: "../Boti/GetBotformlist",
                data: {
                    cid: this.EXPRESSbase_SOLUTION_ID, appid: this.EXPRESSbase_APP_ID
                },
                success: function (result) {
                    this.botflg.loadFormlist = false;
                    this.hideTypingAnim();
                    if (result === null) {
                        this.authFailed();
                    }
                    else {
                        if (!$.isEmptyObject(result[2])) {
                            this.formsDict = result[0];
                            window.ebcontext.user = JSON.parse(result[1]);
                            this.formNames = Object.values(result[2]);
                            this.formIcons = result[3];
                            if (Object.keys(this.formsDict).length == 1) {
                                this.botflg.singleBotApp = true;
                                this.curRefid = Object.keys(this.formsDict)[0];
                                this.getForm(this.curRefid);
                            }
                            else {
                                this.AskWhatU();
                            }
                        }
                        else {
                            this.msgFromBot("Premission is not set for current user");
                        }
                    }
                }.bind(this)
            })
        }

    }.bind(this);






    this.postmenuClick = function (e, reply) {
        var $e = $(e.target);
        if (reply === undefined)
            reply = $e.text().trim();
        var idx = parseInt($e.attr("idx"));
        $e.closest('.msg-cont').remove();
        this.sendMsg(reply);
        $('.eb-chat-inp-cont').hide();
        this.CurFormIdx = idx;
    }.bind(this);




    this.startFormInteraction = function (e) {
        this.curRefid = $(e.target).closest(".btn").attr("refid");
        this.curObjType = $(e.target).attr("obj-type");
        this.postmenuClick(e);
        this.getForm(this.curRefid);///////////////////
    }.bind(this);

    //this.setDataModel = function (form) {
    //    for (let i = 0; i < form.Controls.$values.length; i++) {
    //        getSingleColumn(form.Controls.$values[i]);
    //    }
    //};

    this.getFormSuccess = function (RefId, res) {
        let result = JSON.parse(res);
        let form = JSON.parse(result.object);
        this.curFormObj = form;
        let DataRes = JSON.parse(result.data);
        if (DataRes.Status === 200) {

            this.CurDataMODEL = DataRes.FormData.MultipleTables;
            a___MT = DataRes.FormData.MultipleTables;
            this.CurRowId = this.CurDataMODEL[form.TableName][0].RowId;
            this.hideTypingAnim();
            //data = JSON.parse(data);

            attachModalCellRef_form(form, this.CurDataMODEL);

            //this.setDataModel(form);
            JsonToEbControls(form);
            this.formsList[RefId] = form;
            if (form.ObjType === "BotForm") {
                this.curForm = form;
                this.CurFormflatControls = this.curForm.Controls.$values;
                this.setFormObject();
                this.setFormControls();
            }
            else if (form.ObjType === "TableVisualization") {
                //form.BotCols = JSON.parse(form.BotCols);
                //form.BotData = JSON.parse(form.BotData);
                this.curTblViz = form;
                this.showTblViz();
            }
            else if (form.ObjType === "ChartVisualization") {
                this.curChartViz = form;
                this.showChartViz();
            }
        }
        else if (DataRes.Status === 403) {
            //EbMessage("show", { Message: "Access denied to update this data entry!", AutoHide: true, Background: '#aa0000' });
            this.msgFromBot("Access denied to update this data entry!");
            console.error(DataRes.MessageInt);
        }
        else {
            //EbMessage("show", { Message: DataRes.Message, AutoHide: true, Background: '#aa0000' });
            this.msgFromBot(DataRes.Message);
            console.error(DataRes.MessageInt);
        }
    }.bind(this);

    this.getForm = function (RefId) {
        this.showTypingAnim();
        if (!this.formsList[RefId]) {
            $.ajax({
                type: "POST",
                //url: "../Boti/GetCurForm",
                url: "../Boti/GetCurForm_New",
                data: { refid: RefId },

                success: this.getFormSuccess.bind(this, RefId)

            });
        }
        else {
            this.hideTypingAnim();
            this.curForm = this.formsList[RefId];
            this.setFormControls();
        }
    };

    this.txtboxKeyup = function (e) {
        if (e.which === 13)/////////////////////////////
            this.send_btn();
    }.bind(this);

    this.inpkeyUp = function (e) {
        if (e.which === 13)/////////////////////////////
            $(e.target).closest(".chat-ctrl-cont").find('[name="ctrlsend"]').trigger("click");
    }.bind(this);

    this.chatInpkeyUp = function (e) {
        if (e.which === 13)/////////////////////////////
            $(e.target).closest(".chat-ctrl-cont").find('.cntct_btn').trigger("click");
    }.bind(this);

    this.send_btn = function () {
        window.onmessage = function (e) {
            if (e.data === 'hello') {
                //alert('It works!8888888888888888888888');
            }
        };

        let $e = $('.msg-inp');
        let msg = $e.val().trim();
        if (!msg) {
            $e.val('');
            return;
        }
        this.sendMsg(msg);
        $e.val('');

    }.bind(this);

    this.greetings = function (name) {
        var time = new Date().getHours();
        var greeting = null;
        if (time < 12) {
            greeting = "Good morning!";
        }
        else if (time >= 12 && time < 16) {
            greeting = 'Good afternoon!';
        }
        else {
            greeting = 'Good evening!';
        }
        if (this.isAlreadylogined) {
            this.Query(`Hello ${this.FBResponse.name}, ${greeting}`, [`Continue as ${this.FBResponse.name} ?`, `Not ${this.FBResponse.name}?`], "continueAsFBUser");
            /////////////////////////////////////////////////
            setTimeout(function () {
                //$(".btn-box").find("[idx=0]").click();
            }.bind(this), this.typeDelay * 2 + 100);
        }
        else {
            this.msgFromBot(`Hello ${this.FBResponse.name}, ${greeting}`);
            setTimeout(function () {
                this.authenticate();
            }.bind(this), 901);
        }
    }.bind(this);

    this.Query = function (msg, OptArr, For, cls, ids) {
        this.msgFromBot(msg);
        var Options = this.getButtons(OptArr.map((item) => { return item.replace(/_/g, " ") }), For, ids, cls);
        this.msgFromBot($('<div class="btn-box" >' + Options + '</div>'));
    };

    this.getButtons = function (OptArr, For, ids, cls) {
        var Html = '';
        $.each(OptArr, function (i, opt) {
            Html += `<button for="${For}" class="btn formname-btn ${(cls !== undefined) ? cls[i] : ''}" idx="${i}" refid="${(ids !== undefined) ? ids[i] : i}">${opt} </button>`;
        });
        return Html;
    };

    this.Query_botformlist = function (msg, OptArr, For, ids, icns) {
        this.msgFromBot(msg);
        var Options = this.getButtons_botformlist(OptArr.map((item) => { return item.replace(/_/g, " ") }), For, ids, icns);
        this.msgFromBot($('<div class="btn-box_botformlist" >' + Options + '</div>'));
    };

    this.getButtons_botformlist = function (OptArr, For, ids, icns) {
        var Html = '';
        $.each(OptArr, function (i, opt) {
            Html += `<button for="${For}" class="btn formname-btn_botformlist" idx="${i}" refid="${(ids !== undefined) ? ids[i] : i}"><i style="display:block;font-size: 28px; margin-bottom: 5px;" class="fa ${icns[i]}"></i>${opt} </button>`;
        });
        return Html;
    };

    this.initFormCtrls_fm = function () {
        $.each(this.curForm.Controls.$values, function (i, control) {//////////////////////////////////////
            this.initControls.init(control);
            $("#" + control.Name).on("blur", this.makeReqFm.bind(this, control)).on("focus", this.removeReqFm.bind(this, control));
        }.bind(this));
    }.bind(this);

    this.makeReqFm = function (control) {
        var $ctrl = $("#" + control.Name);
        if ($ctrl.length !== 0 && control.required && $ctrl.val().trim() === "")
            EbMakeInvalid(`[for=${control.Name}]`, '.ctrl-wraper');
    };

    this.removeReqFm = function (control) {
        EbMakeValid(`[for=${control.Name}]`, '.ctrl-wraper');
    };

    this.RenderForm = function () {
        var Html = `<div class='form-wraper'>`;
        $.each(this.curForm.Controls.$values, function (i, control) {
            if (!control.hidden)
                Html += `<label>${control.Label}</label><div for='${control.Name}'><div class='ctrl-wraper'>${control.BareControlHtml4Bot}</div></div><br/>`;
        });
        this.msgFromBot($(Html + '<div class="btn-box"><button name="formsubmit_fm" class="btn formname-btn">Submit</button><button name="formcancel_fm" class="btn formname-btn">Cancel</button></div></div>'), this.initFormCtrls_fm);
    };

    this.setFormControls = function () {
        this.formControls = [];
        $.each(this.curForm.Controls.$values, function (i, control) {
            if (control.VisibleExpr && control.VisibleExpr.Code.trim())//if visibleIf is Not empty
                this.formFunctions.visibleIfs[control.Name] = new Function("form", atob(control.VisibleExpr.Code));
            if (control.ValueExpression && control.ValueExpression.trim())//if valueExpression is Not empty
                this.formFunctions.valueExpressions[control.Name] = new Function("form", "user", atob(control.ValueExpression));
            let $ctrl = $(`<div class='ctrl-wraper'  id='cont_${control.EbSid_CtxId}'>${control.BareControlHtml4Bot}</div>`);
            if (control.ObjType === "InputGeoLocation")
                $ctrl.find(".ctrl-submit-btn").attr("idx", i);
            this.formControls.push($ctrl);
        }.bind(this));

        if (this.curForm.RenderAsForm)
            this.RenderForm();
        else {

            this.getControl(0);
        }
    }.bind(this);

    this.chooseClick = function (e) {
        $(e.target).attr("idx", this.nxtCtrlIdx);
        this.ctrlSend(e);
    }.bind(this);

    this.getCardsetValue = function (cardCtrl) {
        var resObj = {};
        var isPersistAnyField = false;
        this.curDispValue = '';
        $.each(cardCtrl.CardFields.$values, function (h, fObj) {
            if (!fObj.DoNotPersist) {
                isPersistAnyField = true;
            }
        }.bind(this));

        if (!cardCtrl.MultiSelect && isPersistAnyField) {
            $(event.target).parents().find('.slick-current .card-btn-cont .btn').click();
        }
        if (isPersistAnyField) {
            $.each(cardCtrl.CardCollection.$values, function (k, cObj) {
                if (cardCtrl.SelectedCards.indexOf(cObj.CardId) !== -1) {
                    var tempArray = new Array();
                    $.each(cardCtrl.CardFields.$values, function (h, fObj) {
                        if (!fObj.DoNotPersist) {
                            tempArray.push(new Object({ Value: cObj.customFields[fObj.Name], Type: fObj.EbDbType, Name: fObj.Name }));
                        }
                        if (fObj.ObjType === 'CardTitleField') {//for display selected card names on submit
                            this.curDispValue += cObj.CustomFields[fObj.Name] + '<br/>';
                        }
                    }.bind(this));
                    resObj[cObj.CardId] = tempArray;
                }
            }.bind(this));
            if (cardCtrl.SelectedCards.length === 0 && cardCtrl.MultiSelect)
                this.curDispValue = 'Nothing Selected';
        }
        else {
            this.curDispValue = '';
        }
        //cardCtrl.selectedCards = [];
        return (JSON.stringify(resObj));
    };

    this.getValue = function ($input) {
        var inpVal;
        if ($input[0].tagName === "SELECT")
            inpVal = $input.find(":selected").text();
        else if ($input.attr("type") === "password")
            inpVal = $input.val().replace(/(^.)(.*)(.$)/, function (a, b, c, d) { return b + c.replace(/./g, '*') + d });
        else if ($input.attr("type") === "file") {
            inpVal = $input.val().split("\\");
            inpVal = inpVal[inpVal.length - 1];
        }
        else if ($input.attr("type") === "RadioGroup") {
            var $checkedCB = $(`input[name=${$input.attr("name")}]:checked`);
            inpVal = $checkedCB.val();
            this.curDispValue = $checkedCB.next().text();
        }
        else if (this.curCtrl.ObjType === "PowerSelect") {
            //inpVal = this.curCtrl.tempValue;
            //inpVal = this.curCtrl.selectedRow;
            inpVal = this.curCtrl.getValue();
            console.log("inp");
            console.log(inpVal);
            this.curDispValue = this.curCtrl._DisplayMembers[Object.keys(this.curCtrl._DisplayMembers)[0]].toString().replace(/,/g, ", ");
        }
        else if (this.curCtrl.ObjType === "InputGeoLocation") {
            inpVal = $("#" + $input[0].id + "lat").val() + ", " + $("#" + $input[0].id + "long").val();
        }
        else if (this.curCtrl.ObjType === "StaticCardSet" || this.curCtrl.ObjType === "DynamicCardSet") {
            inpVal = this.getCardsetValue(this.curCtrl);
        }
        else if (this.curCtrl.ObjType === "Survey") {
            inpVal = this.curCtrl.resultantJson;
        }
        else
            inpVal = $input.val();
        //return inpVal.trim();
        return inpVal;
    };

    this.checkRequired = function () {
        if (this.curCtrl.Required && !this.curVal) {
            EbMakeInvalid(`[for=${this.curCtrl.Name}]`, '.chat-ctrl-cont');
            return false;
        }
        else {
            EbMakeValid(`[for=${this.curCtrl.Name}]`, '.chat-ctrl-cont');
            return true;
        }
    };

    this.getDisplayHTML = function (ctrl) {
        let text = ctrl.getDisplayMemberFromDOM();
        if (ctrl.ObjType === "PowerSelect") {
            let res = "";
            let keys = Object.keys(text);
            for (let i = 0; i < keys.length; i++) {
                let itemVals = JSON.stringify(text[keys[i]]).slice(0, -2).slice(2).replace(/":"/g, " : ").replace(/","/g, ", ");
                res += itemVals + "</br>";
            }
            text = res.slice(0, -5);
        }
        else if (ctrl.ObjType === "SimpleFileUploader") {
            let tempCtrl = $("#" + ctrl.EbSid).clone();
            tempCtrl.find('input[type="file"]').remove();
            tempCtrl.find('input[type="text"]').remove();
            tempCtrl.attr('id', "");
            if (ctrl.DataVals.Value) {
                tempCtrl.find('.SFUPcontainer').attr('id', "");

            }
            else {
                tempCtrl.find(`#${ctrl.EbSid}_SFUP`).addClass('emtySFUP');
                tempCtrl.find('.SFUPcontainer').empty().append('<span>No file uploaded</span>');
            }
            text = tempCtrl[0].outerHTML;
        }
        else if (ctrl.ObjType === "Rating") {
            let tempCtrl = $("#" + ctrl.EbSid).clone();
            text = `<div style="display: inline-block;">${tempCtrl[0].outerHTML}</div>` ;
        }
        return text;
    };



    this.setFormObject = function () {
        this.formObject = {};
        $.each(this.CurFormflatControls, function (i, ctrl) {
            this.formObject[ctrl.Name] = ctrl;
        }.bind(this));
        this.formObject.__getCtrlByPath = this.getCtrlByPath;
    };

    this.getCtrlByPath = function (path) {
        try {
            let form = this.formObject;
            let ctrl = {};
            let pathArr = path.split(".");
            //if (pathArr.length === 3) {
            //    path = pathArr[0] + '.' + pathArr[1] + '.' + "currentRow" + '.' + pathArr[2];
            //    ctrl = eval(path);
            //    ctrl.IsDGCtrl = true;
            //} else
            {
                ctrl = eval(path);
            }
            return ctrl;
        }
        catch (e) {
            console.warn("could not find:" + path);
            return "not found";
        }
    }.bind(this);

    this.tryOnChangeDuties = function (curCtrl) {
        if (curCtrl.DependedValExp) {
            $.each(curCtrl.DependedValExp.$values, function (i, depCtrl_s) {
                let depCtrl = this.getCtrlByPath(depCtrl_s);
                if (depCtrl === "not found")
                    return;
                try {
                    if (depCtrl.ObjType === "TVcontrol") {
                        if (depCtrl.reloadWithParam) { // control comes after TVcontrol initialised - update cur control param and reload
                            depCtrl.reloadWithParam(curCtrl);
                        }
                        else {//  control comes before TVcontrol initialised - set cur control param
                            let val = curCtrl.getValue();

                            if (!depCtrl.__filterValues)
                                depCtrl.__filterValues = [];

                            let filterObj = getObjByval(depCtrl.__filterValues, "Name", curCtrl.Name);
                            if (filterObj)
                                filterObj.Value = val;
                            else
                                depCtrl.__filterValues.push(new fltr_obj(curCtrl.EbDbType, curCtrl.Name, val));
                        }
                    }
                    //else {
                    //    if (depCtrl.ValueExpr && depCtrl.ValueExpr.Lang === 0) {
                    //        let valExpFnStr = atob(depCtrl.ValueExpr.Code);
                    //        let ValueExpr_val = new Function("form", "user", `event`, valExpFnStr).bind(depCtrl_s, this.FO.formObject, this.FO.userObject)();
                    //        if (valExpFnStr) {
                    //            if (this.FO.formObject.__getCtrlByPath(curCtrl.__path).IsDGCtrl || !depCtrl.IsDGCtrl) {
                    //                if (!this.FO.Mode.isView || depCtrl.DoNotPersist)
                    //                    depCtrl.setValue(ValueExpr_val);
                    //            }
                    //            else {
                    //                $.each(depCtrl.__DG.AllRowCtrls, function (rowid, row) {
                    //                    row[depCtrl.Name].setValue(ValueExpr_val);
                    //                }.bind(this));
                    //            }
                    //        }
                    //    }
                    //    else if (depCtrl.ValueExpr && depCtrl.ValueExpr.Lang === 2) {
                    //        let params = [];

                    //        $.each(depCtrl.ValExpParams.$values, function (i, depCtrl_s) {// duplicate code in eb_utility.js
                    //            try {
                    //                let paramCtrl = this.FO.formObject.__getCtrlByPath(depCtrl_s);
                    //                let valExpFnStr = atob(paramCtrl.ValueExpr.Code);
                    //                let param = { Name: paramCtrl.Name, Value: paramCtrl.getValue(), Type: "11" };
                    //                params.push(param);
                    //            }
                    //            catch (e) {
                    //                console.eb_log("eb error :");
                    //                console.eb_log(e);
                    //                alert("error in 'Value Expression' of : " + curCtrl.Name + " - " + e.message);
                    //            }
                    //        }.bind(this));

                    //        ExecQuery(this.FO.FormObj.RefId, depCtrl.Name, params, depCtrl);
                    //    }
                    //}
                }
                catch (e) {
                    console.eb_log("eb error :");
                    console.eb_log(e);
                    alert("error in 'Value Expression' of : " + curCtrl.Name + " - " + e.message);
                }
            }.bind(this));
        }
    };

    this.ctrlSend = function (e) {
        this.curVal = null;
        //this.displayValue = null;
        var $btn = $(e.target).closest("button");
        var $msgDiv = $btn.closest('.msg-cont');
        this.sendBtnIdx = parseInt($btn.attr('idx'));
        this.curCtrl = this.curForm.Controls.$values[this.sendBtnIdx];
        var id = this.curCtrl.Name;
        var next_idx = this.sendBtnIdx + 1;
        this.nxtCtrlIdx = (next_idx > this.nxtCtrlIdx) ? next_idx : this.nxtCtrlIdx;
        var $input = $('#' + this.curCtrl.EbSid);
        //varghese
        //for cards  this.curDispValue  is used
        // this.sendCtrlAfter($msgDiv.hide(), this.curDispValue + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');

        //this.displayValue = this.getDisplayHTML(this.curCtrl);
        if (this.curCtrl.ObjType === 'StaticCardSet' || this.curCtrl.ObjType === 'DynamicCardSet') {
            if (!this.curCtrl.MultiSelect) {
                $('#' + this.curCtrl.EbSid_CtxId).find('.slick-current .card-btn-cont .btn').click();
            }
            var $msg = this.$userMsgBox.clone();
            $btn.parent().parent().remove();
            if ($btn.parent().prev().find('.table tbody').length === 1) {// if summary is present
                let $cartSummary = $btn.parent().prev();
                $cartSummary.find('table th').last().remove();
                $cartSummary.find('table td .remove-cart-item').parent().remove();
                let $sumTd = $cartSummary.find('table td[colspan]');
                if ($sumTd.length > 0) {// if sum is present
                    $sumTd.attr('colspan', parseInt($sumTd.attr('colspan')) - 1);
                }
                $msg.find('.msg-wraper-user').html($cartSummary.html()).append(this.getTime());
            }
            else {
                let disphtml = $btn.parent().prev().find('.slick-active').css('display', 'block');
                if ($(disphtml).find('.card-pls-mns').length > 0) {
                    $(disphtml).find('.card-pls-mns').remove();
                }
                $(disphtml).css('pointer-events', 'none');
                //var rmv = disphtml.find('.card-selbtn-cont').empty();
                $msg.find('.msg-wraper-user').html(disphtml.outerHTML()).append(this.getTime());
                //  $msg.find('.msg-wraper-user').html($btn.parent().prev().find('.slick-active').html()).append(this.getTime());
            }

            $msg.insertAfter($msgDiv);
            $msgDiv.remove();
            this.CurDataMODEL[this.curCtrl.TableName] = this.curCtrl.getDataModel();
        }
        else {
            if (this.curCtrl.IsNonDataInputControl === false) {
                this.curCtrl.DataVals.Value = this.curCtrl.getValueFromDOM();
                this.curCtrl.DataVals.F = this.getDisplayHTML(this.curCtrl);
                this.curVal = this.curCtrl.getValue();
                this.tryOnChangeDuties(this.curCtrl);
            }
            $msgDiv.fadeOut(200);
            let $prevMsg = $(".eb-chatBox").find('[lbl_for = "' + this.curCtrl.Name + '"]').last();
            this.sendCtrlAfter($prevMsg, this.curCtrl.DataVals.F + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');



            this.formValues[id] = this.curVal;
            this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        }
        this.callGetControl(this.controlHideDelay);

        if ($('[saveprompt]').length === 1) {
            this.showConfirm();
        }



        //old code


        ////$input.off("blur").on("blur", function () { $btn.click() });//when press Tab key send
        //this.curVal = this.getValue($input);
        //if (this.curCtrl.ObjType === "ImageUploader") {
        //    if (!this.checkRequired()) { return; }
        //    this.replyAsImage($msgDiv, $input[0], next_idx, id);
        //    //if()
        //    //this.formValues[id] = this.curVal;// last value set from outer fn
        //    //this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.ebDbType];
        //}
        //else if (this.curCtrl.ObjType === "RadioGroup" || $input.attr("type") === "RadioGroup" || this.curCtrl.ObjType === "PowerSelect") {
        //    if (!this.checkRequired()) { return; }
        //    this.sendCtrlAfter($msgDiv.hide(), this.curDispValue + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //    this.formValues[id] = this.curVal;
        //    if (this.curCtrl.ObjType === "PowerSelect")//////////////////////////-------////////////
        //        this.formValuesWithType[id] = [this.curCtrl.TempValue, this.curCtrl.EbDbType];
        //    else
        //        this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    this.callGetControl(this.nxtCtrlIdx);
        //}
        //else if (this.curCtrl.ObjType === "StaticCardSet" || this.curCtrl.ObjType === "DynamicCardSet") {
        //    if (!this.checkRequired()) { return; }
        //    if (this.curCtrl.IsDisable) {
        //        $btn.css('display', 'none');
        //        $('#' + this.curCtrl.Name).attr('id', '');
        //    }
        //    else {
        //        this.sendCtrlAfter($msgDiv.hide(), this.curDispValue + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //        this.formValues[id] = this.curVal;
        //        this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    }
        //    this.callGetControl(this.nxtCtrlIdx);
        //}
        //else if (this.curCtrl.ObjType === "Survey") {
        //    this.sendCtrlAfter($msgDiv.hide(), this.curDispValue + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //    this.formValues[id] = this.curVal;
        //    this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    this.callGetControl(this.nxtCtrlIdx);
        //}
        //else if (this.curCtrl.ObjType === "Date" || this.curCtrl.ObjType === "DateTime" || this.curCtrl.ObjType === "Time") {
        //    this.sendCtrlAfter($msgDiv.hide(), this.curVal + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //    if (this.curCtrl.ObjType === "Date")
        //        this.curVal = moment(this.curVal, ebcontext.user.Preference.ShortDatePattern).format('YYYY-MM-DD');
        //    else if (this.curCtrl.ObjType === "DateTime")
        //        this.curVal = moment(this.curVal, ebcontext.user.Preference.ShortDatePattern + ' ' + ebcontext.user.Preference.ShortTimePattern).format('YYYY-MM-DD HH:mm:ss');
        //    else if (this.curCtrl.ObjType === "Time")
        //        this.curVal = moment(this.curVal, ebcontext.user.Preference.ShortTimePattern).format('YYYY-MM-DD HH:mm:ss');
        //    this.formValues[id] = this.curVal;
        //    this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    this.callGetControl(this.nxtCtrlIdx);
        //}
        //else {
        //    this.curVal = this.curVal || $('#' + id).val();
        //    if (!this.checkRequired()) { return; }
        //    this.sendCtrlAfter($msgDiv.hide(), this.curVal + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //    this.formValues[id] = this.curVal;
        //    this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    this.callGetControl(this.nxtCtrlIdx);
        //}

        this.IsEdtMode = false;
        this.IsDpndgCtrEdt = false;
        this.curVal = null;
    }.bind(this);

    this.valueExpHandler = function (nxtCtrl) {
        //var nxtCtrl = this.curForm.Controls.$values[this.nxtCtrlIdx];
        var valExpFunc = this.formFunctions.valueExpressions[nxtCtrl.Name];
        if (valExpFunc !== undefined) {
            this.formValues[nxtCtrl.Name] = valExpFunc(this.formValues, this.userDtls);
            this.formValuesWithType[nxtCtrl.Name] = [this.formValues[nxtCtrl.Name], nxtCtrl.ebDbType];
        }
        else if (nxtCtrl.autoIncrement) {
            this.formValuesWithType[nxtCtrl.Name] = [0, nxtCtrl.ebDbType, true];
        }
        //console.log(this.curForm.Controls.$values[0].selectedRow);//  hardcoding
    };

    this.callGetControl = function (delay) {
        if (this.nxtCtrlIdx !== this.formControls.length) { // if not last control
            if (!this.IsEdtMode || this.IsDpndgCtrEdt) {   // (if not edit mode or IsDpndgCtr edit mode) if not skip calling getControl()
                var visibleIfFn = this.formFunctions.visibleIfs[this.curForm.Controls.$values[this.nxtCtrlIdx].Name];
                //if (this.curForm.Controls.$values[this.nxtCtrlIdx].hidden) {//////////////////////
                this.valueExpHandler(this.curForm.Controls.$values[this.nxtCtrlIdx]);
                //}
                if ((!visibleIfFn || visibleIfFn(this.formValues)) && !this.curForm.Controls.$values[this.nxtCtrlIdx].Hidden) {//checks isVisible or no isVisible defined                    
                    this.getControl(this.nxtCtrlIdx, delay);
                }
                else {
                    this.nxtCtrlIdx++;
                    this.callGetControl(delay);
                }
            }
        }
        else {  //if last control
            if (this.curForm.HaveInputControls && !this.curForm.IsReadOnly) {
                this.showSubmit();
            }
            else {
                //var $btn = $(event.target).closest(".btn");
                //this.sendMsg($btn.text());
                $('.msg-wraper-user [name=ctrledit]').remove();
                //$btn.closest(".msg-cont").remove();
                $('.eb-chatBox').empty();
                this.showDate();
                this.AskWhatU();
            }
        }
        this.enableCtrledit();
    };

    this.showSubmit = function () {
        if ($("[name=formsubmit]").length === 0) {
            setTimeout(function () {
                this.curCtrl = null;
                this.msgFromBot('Are you sure? Can I submit?');
                this.msgFromBot($('<div class="btn-box" saveprompt><button name="formsubmit" class="btn formname-btn">Sure</button><button name="formcancel" class="btn formname-btn">Cancel</button></div>'));
            }.bind(this), this.controlHideDelay);

        }
    };

    this.getControl = function (idx, delay = 0) {
        delay = delay !== 0 ? (delay + 200) : delay;
        setTimeout(function () {
            if (idx === this.formControls.length)
                return;
            var controlHTML = this.formControls[idx][0].outerHTML;
            var $ctrlCont = $(controlHTML);
            this.curCtrl = this.curForm.Controls.$values[idx];
            var name = this.curCtrl.Name;
            //if (!(this.curCtrl && (this.curCtrl.ObjType === "Cards" || this.curCtrl.ObjType === "Locations" || this.curCtrl.ObjType === "InputGeoLocation" || this.curCtrl.ObjType === "Image")))
            if (!(this.curCtrl && this.curCtrl.IsFullViewContol)) {
                if (this.curCtrl.IsReadOnly || this.curCtrl.IsDisable) {
                    $ctrlCont = $(this.wrapIn_chat_ctrl_readonly(controlHTML));
                }
                else {
                    $ctrlCont = $(this.wrapIn_chat_ctrl_cont(idx, controlHTML));
                }
            }
            else {
                if ((this.curCtrl.ObjType === "TVcontrol") || (this.curCtrl.ObjType === "Locations") || (this.curCtrl.ObjType === "Video") || (this.curCtrl.ObjType === "Image") || (this.curCtrl.ObjType === "PdfControl")) {
                    $ctrlCont = $(this.wrapIn_chat_ctrl_readonly(controlHTML));
                }
            }
            var label = this.curCtrl.Label;
            if (label) {
                if (this.curCtrl.HelpText)
                    label += ` (${this.curCtrl.HelpText})`;
                this.msgFromBot(label);
            }
            //if (this.curCtrl.ObjType === "Image") {
            //    let btnhtml = this.proceedBtnHtml('mrg_tp_10');
            //    let readonlywraperhtml = `<div class="chat-ctrl-readonly ctrl-cont-bot flxdirctn_col" ebreadonly="${this.curCtrl.IsDisable}">
            //                                  ${controlHTML}  ${btnhtml} 
            //                             </div>`;
            //    $ctrlCont = $(readonlywraperhtml);
            //    this.msgFromBot($ctrlCont, function () { $(`#${name}`).select(); }, name);
            //    //this.nxtCtrlIdx++;
            //    //this.callGetControl();
            //}
            //else
            if (this.curCtrl.ObjType === "Labels") {
                this.sendLabels(this.curCtrl);
            }
            else
                this.msgFromBot($ctrlCont, function () { $(`#${name}`).select(); }, name);

        }.bind(this), delay);
    }.bind(this);

    this.sendLabels = function (ctrl) {
        $.each(ctrl.LabelCollection.$values, function (idx, label) {
            var lbl = label.Label.trim();
            if (lbl === "")
                return true;
            this.msgFromBot(label.Label);
        }.bind(this));
    };

    this.wrapIn_chat_ctrl_cont = function (idx, controlHTML) {
        return `<div class="chat-ctrl-cont ctrl-cont-bot" ebreadonly="${this.curCtrl.IsDisable}">` + controlHTML + '<div class="ctrl-send-wraper"><button class="btn" idx=' + idx + ' name="ctrlsend"><i class="fa fa-chevron-right" aria-hidden="true"></i></button></div></div>';
    };
    this.wrapIn_chat_ctrl_readonly = function (controlHTML) {
        return `<div class="chat-ctrl-readonly ctrl-cont-bot" ebreadonly="${this.curCtrl.IsDisable}">` + controlHTML + '</div>';

    };

    this.replyAsImage = function ($prevMsg, input, idx, ctrlname) {
        console.log("replyAsImage()");
        var fname = input.files[0].Name;
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                this.sendImgAfter($prevMsg.hide(), e.target.result, ctrlname, fname);
                $(`[for=${ctrlname}] .img-loader:last`).show(100);
                this.uploadImage(e.target.result, ctrlname, idx);
            }.bind(this);
            reader.readAsDataURL(input.files[0]);
        }
    };

    this.sendImgAfter = function ($prevMsg, path, ctrlname, filename) {
        console.log("sendImgAfter()");
        var $msg = this.$userMsgBox.clone();
        $msg.find(".msg-wraper-user").css("padding", "5px");
        var $imgtag = $(`<div class="img-box" for="${ctrlname}"><div class="img-loader"></div><span class="img-edit"  idx="${this.curForm.Controls.$values.indexOf(this.curCtrl)}"  for="${ctrlname}" name="ctrledit"><i class="fa fa-pencil" aria-hidden="true"></i></span><img src="${path}" alt="amal face" width="100%"><div class="file-name">${filename}</div>${this.getTime()}</div>`);
        $msg.find('.msg-wraper-user').append($imgtag);
        $msg.insertAfter($prevMsg);
        //$('.eb-chatBox').scrollTop(99999999999);
    };

    this.uploadImage = function (url, id, idx) {
        console.log("uploadImage");
        var URL = url.substring(url.indexOf(",/") + 1);
        var EbSE = new EbServerEvents({
            ServerEventUrl: this.ServerEventUrl,
            Channels: ["file-upload"],
            Rtoken: this.refreshToken
        });
        EbSE.onUploadSuccess = function (obj, e) {
            $(`[for=${id}] .img-loader:last`).hide(100);
            this.callGetControl();

            this.formValues[id] = obj.objectId;
            this.formValuesWithType[id] = [this.formValues[id], 16];

        }.bind(this);

        $.post("../Boti/UploadFileAsync", {
            'base64': URL,
            "filename": id,
            "type": URL.trim(".")[URL.trim(".").length - 1]
        }).done(function (result) {
            //$(`[for=${id}] .img-loader:last`).hide(100);
            //this.callGetControl(this.nxtCtrlIdx);
            //this.curVal = result;
        }.bind(this));
    }.bind(this);

    this.ctrlEdit = function (e) {
        var $btn = $(e.target).closest("span");
        var idx = parseInt($btn.attr('idx'));
        this.curCtrl = this.curForm.Controls.$values[idx];
        if (this.curCtrl) {
            if (!(this.curCtrl.IsReadOnly || this.curCtrl.IsDisable)) {
                if (this.curCtrl.hasOwnProperty('IsBasicControl')) {
                    if (this.curCtrl.IsBasicControl) {
                        this.$renderAtBottom.show();
                    }
                }
            }

        }
        var NxtRDpndgCtrlName = this.getNxtRndrdDpndgCtrlName(this.curCtrl.Name);
        if (NxtRDpndgCtrlName) {
            this.__idx = idx; this.__NxtRDpndgCtrlName = NxtRDpndgCtrlName; this.__$btn = $btn;
            this.initEDCP();
        }
        else
            this.ctrlEHelper(idx, $btn);
        if ($('[saveprompt]').length === 1) {
            $('[saveprompt]').closest(".msg-cont").prev().remove();
            $('[saveprompt]').closest(".msg-cont").remove();
        }
    }.bind(this);

    this.initEDCP = function () {
        this.$DPEBtn = $(`[name=ctrledit]`).filter(`[idx=${this.__idx}]`).closest(".msg-wraper-user");
        this.$DPEBtn.confirmation({
            placement: 'bottom',
            title: "Edit this field and restart from related point !",
            btnOkLabel: " Edit ",
            btnOkClass: "btn btn-sm btn-warning",
            btnOkIcon: "glyphicon glyphicon-pencil",
            btnCancelIcon: "glyphicon glyphicon-remove-circle",
            onConfirm: this.editDpndCtrl
            //onCancel: function () {
            //    alert("cancel");
            //    //this.$DPEBtn.confirmation('destroy');
            //}.bind(this)
        }).confirmation('show');
    }.bind(this);

    this.ctrlEHelper = function (idx, $btn) {
        this.disableCtrledit();
        this.IsEdtMode = true;
        $('.msg-cont-bot [idx=' + idx + ']').closest('.msg-cont').show(200);
        $("#" + this.curCtrl.Name).click().select();
        ////
        if (this.curCtrl.hasOwnProperty('IsBasicControl')) {
            if (this.curCtrl.IsBasicControl) {
                $btn.closest('.msg-cont').addClass('editctrl_typing');
                $btn.closest('.msg-wraper-user').html(this.$TypeAnim.clone());
            }
        }
        else {
            $btn.closest('.msg-cont').remove();
        }


    };

    this.editDpndCtrl = function () {
        //this.$DPEBtn.confirmation('destroy');
        this.IsDpndgCtrEdt = true;
        this.nxtCtrlIdx = this.curForm.Controls.$values.indexOf(getObjByval(this.curForm.Controls.$values, "name", this.getNxtDpndgCtrlName(this.curCtrl.Name, this.formFunctions.visibleIfs)));
        this.curCtrl = this.curForm.Controls.$values[this.__idx];
        delKeyAndAfter(this.formValues, this.__NxtRDpndgCtrlName);
        delKeyAndAfter(this.formValuesWithType, this.__NxtRDpndgCtrlName);
        $('.eb-chatBox [for=' + this.__NxtRDpndgCtrlName + ']').prev().prev().nextAll().remove();
        this.ctrlEHelper(this.__idx, this.__$btn);
    }.bind(this);

    this.getNxtDpndgCtrlName = function (name, formFuncs) {
        var res = null;
        $.each(formFuncs, function (key, Fn) {
            Sfn = Fn.toString().replace(/ /g, '');
            if (RegExp("(form." + name + "\\b)|(form\\[" + name + "\\]\\b)").test(Sfn)) {
                res = key;
                return false;
            }
        }.bind(this));
        return res;
    }.bind(this);

    this.getNxtRndrdDpndgCtrlName = function (name) {
        var res = null;
        $.each(this.formFunctions.visibleIfs, function (key, Fn) {
            Sfn = Fn.toString().replace(/ /g, '');
            if (RegExp("(form." + name + "\\b)|(form\\[" + name + "\\]\\b)").test(Sfn) && $('.eb-chatBox [for=' + key + ']').length > 0) {
                res = key;
                return false;
            }
        }.bind(this));
        return res;
    }.bind(this);

    this.sendMsg = function (msg) {
        if (!msg)
            return;
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').text(msg).append(this.getTime());
        this.$chatBox.append($msg);
        //$('.eb-chatBox').scrollTop(99999999999);
    };

    this.sendCtrl = function (msg) {
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').append(msg).append(this.getTime());
        this.$chatBox.append($msg);
        //$('.eb-chatBox').scrollTop(99999999999);
    };

    this.sendCtrlAfter = function ($prevMsg, msg) {
        setTimeout(function () {
            var $msg = this.$userMsgBox.clone();
            $msg.find('.msg-wraper-user').html(msg).append(this.getTime());
            ////
            $('.editctrl_typing').remove();
            this.enableCtrledit();
            this.$renderAtBottom.hide();
            $msg.insertAfter($prevMsg);
            this.scrollToBottom();
        }.bind(this), this.controlHideDelay);
    };

    this.startTypingAnim = function ($msg) {
        $msg.find('.msg-wraper-bot').html(this.$TypeAnim.clone());
    }.bind(this);

    this.showTypingAnim = function () {
        this.$chatBox.append(this.$TypeAnimMsg);
    }.bind(this);

    this.hideTypingAnim = function () {
        this.$TypeAnimMsg.remove();
    }.bind(this);

    this.msgFromBot = function (msg, callbackFn, ctrlname) {
        this.hideTypingAnim();
        var $msg = this.$botMsgBox.clone();
        this.$chatBox.append($msg);
        this.startTypingAnim($msg);
        if (this.ready) {
            setTimeout(function () {
                if (msg instanceof jQuery) {
                    var flg = false;
                    if (ctrlname || typeof ctrlname === typeof "") {
                        $msg.attr("for", ctrlname);
                        $(".eb-chatBox").find('.msg-cont').last().prev().attr({ "lbl_for": ctrlname, "lbl_idx": this.formControls.length })
                    }

                    if (this.curCtrl) {
                        $msg.attr("ctrl-type", this.curCtrl.ObjType);
                        if (!(this.curCtrl.IsReadOnly || this.curCtrl.IsDisable)) {
                            if (this.curCtrl.hasOwnProperty('IsBasicControl')) {
                                //check isreadonly
                                if (this.curCtrl.IsBasicControl) {
                                    this.disableCtrledit();
                                    flg = true;
                                    $msg.remove();
                                    this.$renderAtBottom.append($msg);
                                    this.$renderAtBottom.show();
                                    $msg.find('.bot-icon').remove();
                                    $msg.find('.msg-cont-bot').addClass('msg-cont-w100');
                                    let $msgInner = $msg.find('.msg-wraper-bot').html(msg);
                                    $($msgInner.find('.ctrl-cont-bot')).removeClass('ctrl-cont-bot');
                                    //  $($msgInner.find('.ctrl-wraper')).css('width','100%');
                                    $($msgInner).removeClass('msg-wraper-bot');
                                    $($msgInner).addClass('msg-wraper-renderAtbottom');

                                }

                            }
                        }
                    }

                    if (flg === false) {
                        $msg.find('.bot-icon').remove();
                        $msg.find('.msg-wraper-bot').css("border", "none").css("background-color", "transparent").css("width", "99%").html(msg);
                        $msg.find(".msg-wraper-bot").css("padding-right", "3px");
                    }

                    if (this.curCtrl && this.curCtrl.IsFullViewContol) {
                        $msg.find(".ctrl-wraper").css("width", "100%").css("border", 'none');
                        $msg.find(".msg-wraper-bot").css("margin-left", "12px");
                    }

                    if (this.curCtrl && ($msg.find(".ctrl-wraper").length === 1)) {
                        if ($('#' + this.curCtrl.EbSid).length === 1)
                            this.loadcontrol();
                        else
                            console.error("loadcontrol() called before rendering 'id = " + this.curCtrl.Name + "' element");
                    }
                    if (this.curForm)
                        $msg.attr("form", this.curForm.Name);
                }
                else
                    $msg.find('.msg-wraper-bot').text(msg).append(this.getTime());
                this.ready = true;
                if (callbackFn && typeof callbackFn === typeof function () { })
                    callbackFn();
                this.scrollToBottom();
            }.bind(this), this.typeDelay);
            this.ready = false;
        }
        else {
            $msg.remove();
            setTimeout(function () {
                this.msgFromBot(msg, callbackFn, ctrlname);
            }.bind(this), this.typeDelay + 1);
        }
        //$('.eb-chatBox').scrollTop(99999999999);
        //$('.eb-chatBox').animate({ scrollTop: $('.eb-chatBox')[0].scrollHeight });

    }.bind(this);

    this.scrollToBottom = function () {
        setTimeout(function () {
            $(".eb-chatBox").scrollTo($(".eb-chatBox")[0].scrollHeight, 500, { easing: 'swing' });
        }.bind(this), this.controlHideDelay + this.breathingDelay);
    };

    //to initialise control
    this.loadcontrol = function () {
        if (!this.curCtrl)
            return;
        if (this.initControls[this.curCtrl.ObjType] !== undefined)
            this.initControls[this.curCtrl.ObjType](this.curCtrl, {});
        if (this.curCtrl.IsReadOnly || this.curCtrl.IsDisable) {
            // move code to getcontrol           
            if ($(".chat-ctrl-readonly").length === 0) {
                let btnhtml = this.proceedBtnHtml('mrg_10');
                $('#' + this.curCtrl.EbSid).append(btnhtml);
            }
            else {
                let btnhtml = this.proceedBtnHtml('mrg_tp_10');
                //remove from getcontrols itself
                $('#' + this.curCtrl.EbSid).closest('.chat-ctrl-readonly').find('.ctrl-wraper').addClass('w-100');
                $('#' + this.curCtrl.EbSid).closest('.chat-ctrl-readonly').addClass('flxdirctn_col');
                $('#' + this.curCtrl.EbSid).closest('.chat-ctrl-readonly').append(btnhtml);
            }
            if (!this.curCtrl.IsFullViewContol) {
                this.curCtrl.disable();
            }

            //this.nxtCtrlIdx++;
            //this.callGetControl();
        }
    };

    this.proceedReadonlyCtrl = function () {
        this.nxtCtrlIdx++;
        $('.ctrlproceedBtn-wrapper').remove();
        this.callGetControl();
    }

    this.proceedBtnHtml = function (margin) {
        let btntxt = this.curCtrl.ProceedBtnTxt || "ok";
        let btnhtml = `<div class="ctrlproceedBtn-wrapper ${margin}">
                                        <div class="ctrlproceedBtn">
                                            <div>${btntxt}</div>
                                        </div>
                                    </div>`;
        return btnhtml;
    }

    this.submitReqCheck = function () {
        var $firstCtrl = null;
        $.each(this.curForm.Controls.$values, function (i, control) {
            var $ctrl = $("#" + control.Name);
            if ($ctrl.length !== 0 && control.Required && $ctrl.val().trim() === "") {
                if (!$firstCtrl)
                    $firstCtrl = $ctrl;
                this.makeReqFm(control);
            }
        }.bind(this));

        if ($firstCtrl) {
            $firstCtrl.select();
            return false;
        }
        else
            return true;
    };

    this.formSubmit_fm = function (e) {
        if (!this.submitReqCheck())
            return;
        var $btn = $(e.target).closest(".btn");
        var html = "<div class='sum-box'><table style='font-size: inherit;'>";
        $.each(this.curForm.Controls.$values, function (i, control) {
            if (!control.Hidden) {
                this.curCtrl = control;
                var curval = this.getValue($('#' + control.Name));
                var name = control.Name;

                this.formValues[name] = curval;
                if (control.ObjType === "PowerSelect")
                    this.formValuesWithType[name] = [control.TempValue, control.EbDbType];
                else
                    this.formValuesWithType[name] = [curval, control.EbDbType];
                html += `<tr><td style='padding: 5px;'>${control.Label}</td> <td style='padding-left: 10px;'>${this.formValuesWithType[name][0]}</td></tr>`;
            }
            this.valueExpHandler(control);
        }.bind(this));
        this.sendCtrl($(html + "</table></div>"));
        this.sendMsg($btn.text());
        this.showConfirm();
    }.bind(this);

    this.formCancel_fm = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.sendMsg($btn.text());
        $('.msg-wraper-user [name=ctrledit]').remove();
        $btn.closest(".msg-cont").remove();
        this.AskWhatU();
    }.bind(this);

    this.formSubmit = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.sendMsg($btn.text());
        $('.msg-wraper-user [name=ctrledit]').remove();
        $btn.closest(".msg-cont").remove();
        this.showConfirm();
    }.bind(this);

    this.formCancel = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.sendMsg($btn.text());
        $('.msg-wraper-user [name=ctrledit]').remove();
        $btn.closest(".msg-cont").remove();
        this.ClearFormVariables();
        $('.eb-chatBox').empty();
        this.showDate();
        if (this.botflg.singleBotApp == true) {
            this.getForm(Object.keys(this.formsDict)[0])
        }
        else {
            this.AskWhatU();
        }
    }.bind(this);

    this.showConfirm = function () {
        this.ClearFormVariables();
        this.DataCollection();
    }.bind(this);

    this.ClearFormVariables = function () {
        this.formFunctions.visibleIfs = {};
        this.formFunctions.valueExpressions = {};
        this.nxtCtrlIdx = 0;
        $(`[form=${this.curForm.Name}]`).remove();
    };

    this.getFormValuesObjWithTypeColl = function () {
        let WebformData = {};

        WebformData.MultipleTables = formatData4webform(this.CurDataMODEL);
        WebformData.ExtendedTables = {};
        console.log("form data --");


        //console.log("old data --");
        console.log(JSON.stringify(WebformData.MultipleTables));

        console.log("new data --");
        console.log(JSON.stringify(formatData4webform(this.DataMODEL)));
        return JSON.stringify(WebformData);
    };


    //this.getFormValuesWithTypeColl = function () {
    //    var FVWTcoll = [];
    //    this.CurDataMODEL;
    //    $.each(this.formValuesWithType, function (key, val) {
    //        FVWTcoll.push({ Name: key, Value: val[0], Type: val[1], AutoIncrement: val[2] });
    //    });
    //    this.formValuesWithType = {};
    //    this.formValues = {};
    //    return FVWTcoll;
    //};
    //save botform
    this.DataCollection = function () {
        this.showTypingAnim();
        $.ajax({
            type: "POST",
            //url: this.ssurl + "/bots",
            url: "../Boti/UpdateFormData",
            data: {
                RefId: this.curRefid, rowid: this.CurRowId, data: this.getFormValuesObjWithTypeColl()
            },
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            //}.bind(this),
            success: this.ajaxsuccess.bind(this),
        });
        this.formValues = {};
    };

    this.ajaxsuccess = function (resp) {
        this.hideTypingAnim();
        let msg = '';
        let respObj = JSON.parse(resp);
        if (respObj.Status === 200) {
            //EbMessage("show", { Message: "DataCollection success", AutoHide: true, Background: '#1ebf1e', Delay: 4000 });
            msg = `Your ${this.curForm.DisplayName} submitted successfully 😊`;
        }
        else {
            //EbMessage("show", { Message: "Something went wrong", AutoHide: true, Background: '#bf1e1e', Delay: 4000 });
            this.msgFromBot("Something went wrong ☹️");
            msg = `Your ${this.curForm.DisplayName} submission failed`;
            console.log(respObj.MessageInt);
        }
        $('.eb-chatBox').empty();
        this.showDate();
        this.msgFromBot(msg);
        if (this.botflg.singleBotApp == false) {
            this.AskWhatU();
        }

        //EbMessage("show", { Message: 'DataCollection Success', AutoHide: false, Backgorund: '#bf1e1e' });
    };

    this.AskWhatU = function () {
        //this.Query("Click to explore", this.formNames, "form-opt", Object.keys(this.formsDict));
        this.Query_botformlist("Click to explore", this.formNames, "form-opt", Object.keys(this.formsDict), this.formIcons);
    };

    this.showDate = function () {
        var today = new Date();
        var dd = today.getDate();
        var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
        var mmm = m_names[today.getMonth()]; //January is 0!
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        today = dd + '-' + mmm + '-' + yyyy;
        this.$frameHeader.empty();
        this.$frameHeader.append(`<div class="chat-date"><span>${today}</span></div>`);
        this.setStartOver();
    };

    this.setStartOver = function () {
        this.$chatBox.append(this.$frameHeader.append(`<div class="startOvercont" style="" title="Start Over"> <button type="button" id="eb_botStartover"  class="btn btn-default btn-sm">
         <i class="fa fa-repeat"></i>
        </button></div>`));
    };

    this.getTime = function () {
        let hour = new Date().getHours();
        let am_pm = "am";
        let minuteStr = new Date().getMinutes();
        minuteStr = minuteStr < 10 ? ("0" + minuteStr) : minuteStr;
        if (hour > 12) {
            hourStr = hour % 12;
            am_pm = "pm";
        }
        else if (hour === 12) {
            hourStr = hour;
            am_pm = "pm";
        }

        let timeString = hour + ':' + minuteStr + am_pm;
        return `<div class='msg-time'>${timeString}</div>`;
    };

    this.loadCtrlScript = function () {
        $("head").append(this.CntrlHeads);
    };

    this.authFailed = function () {
        alert("auth failed");
    };

    this.enableCtrledit = function () {
        $('[name="ctrledit"]').show(200);
    };

    this.disableCtrledit = function () {
        $('[name="ctrledit"]').hide(200);
    };

    this.authenticate = function () {
        this.showTypingAnim();

        $.post("../bote/AuthAndGetformlist",
            {
                "cid": this.EXPRESSbase_SOLUTION_ID,
                "appid": this.EXPRESSbase_APP_ID,
                "socialId": this.FBResponse.id,
                "wc": "bc",
                "anon_email": this.userDtls.email,
                "anon_phno": null,
                "user_ip": this.userDtls.ip,
                "user_browser": this.userDtls.browser,
                "user_name": this.userDtls.name || null,
            }, function (result) {
                this.hideTypingAnim();
                if (result.status === false) {
                    this.msgFromBot(result.errorMsg);
                }
                else {
                    //this.bearerToken = result.bearerToken;
                    //this.refreshToken = result.refreshToken;
                    this.formsDict = result.botFormDict;
                    window.ebcontext.user = JSON.parse(result.user);
                    //this.formNames = Object.values(this.formsDict);
                    this.formNames = Object.values(result.botFormNames);
                    this.formIcons = result.botFormIcons;
                    $('.eb-chatBox').empty();
                    this.showDate();
                    if (Object.keys(this.formsDict).length == 1) {
                        this.botflg.singleBotApp = true;
                        this.curRefid = Object.keys(this.formsDict)[0];
                        this.getForm(this.curRefid);
                    }
                    else {
                        this.AskWhatU();
                    }

                    // this.ajaxSetup4Future();
                }

            }.bind(this));
    }.bind(this);

    this.FBlogin = function (e) {
        this.postmenuClick(e);
        if (this.CurFormIdx === 0)
            this.login2FB();
        else {
            this.collectContacts();

        }
    }.bind(this);

    this.login2FB = function () {
        this.FB.login(function (response) {
            if (response.authResponse) {
                // statusChangeCallback(response);
                if (response.status === 'connected') {
                    this.FBLogined();
                } else {
                    this.FBNotLogined();
                }
            } else {
                //change needed
                this.collectContacts();
            }
        }.bind(this), { scope: 'email' });
    };

    this.FBLogined = function () {
        this.FB.api('/me?fields=id,name,picture,email', function (response) {
            if (response.hasOwnProperty('email')) {
                this.FBResponse = response;
                this.userDtls.name = this.FBResponse.name;
                this.userDtls.email = this.FBResponse.email;
                this.$userMsgBox.find(".bot-icon-user").css('background', `url(${this.FBResponse.picture.data.url})center center no-repeat`);
                this.hideTypingAnim();
                this.greetings();
            }
            else {
                console.log("null response from fb");
                this.login2FB();
            }
        }.bind(this));
    }.bind(this);

    this.collectContacts = function () {
        //this.msgFromBot("OK, No issues. Can you Please provide your contact Details ? so that I can understand you better.");
        //this.msgFromBot($('<div class="contct-cont"><div class="contact-inp-wrap"><input id="anon_mail" type="email" placeholder="Email" class="plain-inp"></div><div class="contact-inp-wrap"><input id="anon_phno" type="tel" placeholder="Phone Number" class="plain-inp"></div><button name="contactSubmit" class="contactSubmit">Submit <i class="fa fa-chevron-right" aria-hidden="true"></i></button>'));
    };

    this.continueAsFBUser = function (e) {
        this.postmenuClick(e, "");
        if (this.CurFormIdx === 0) {
            this.sendCtrl("Continue as " + this.userDtls.name);
            this.authenticate();
        }
        else {
            //this.FB.logout(function (response) {
            //    //this.msgFromBot("You are successfully logout from our App");///////////////////////
            //    this.sendCtrl("Not " + this.userDtls.name);
            //    //this.collectContacts();
            //    this.FBNotLogined();
            //}.bind(this));
            this.FB.logout();
            this.sendCtrl("Not " + this.userDtls.name);
            this.login2FB();
        }
    }.bind(this);

    this.FBNotLogined = function () {
        this.hideTypingAnim();
        this.isAlreadylogined = false;
        // this.msgFromBot(this.welcomeMessage);
        //  this.Query("Would you login with your facebook, So I can remember you !", ["Login with facebook", "I don't have facebook account"], "fblogin");
        this.Query("Would you login with your facebook, So I can remember you !", ["Login with facebook"], "fblogin", ["fbbtnstyl"]);
    }.bind(this);

    ////need to be bootstrap... icon in css
    this.sendWrapedCtrl = function (msg, ctrlHtml, id, name) {
        this.msgFromBot(msg);
        let controlHTML = `<div class="" style="width: calc(100% - 57px)">
                                <div class="form-group bot_Login_input" style="margin-bottom: 0px;">
                                  ${ctrlHtml}
                               </div>
                        </div> `;
        let $ctrlCont = $(`<div class="chat-ctrl-cont ctrl-cont-bot">${controlHTML}<div class="ctrl-send-wraper">
                <button class="btn cntct_btn" name="${name}"><i class="fa fa-chevron-right" aria-hidden="true"></i></button></div></div>`);
        this.msgFromBot($ctrlCont, function () { $(`#${id}`).focus(); }, id);
    };

    this.userNameFn = function () {
        let msg = "May I know your name?";
        let ctrlHtml = `<div class="username_wrp"><input chat-inp type="text" class="form-control" id="anon_name" placeholder="Enter Name"></div>`;
        this.sendWrapedCtrl(msg, ctrlHtml, "anon_name", "contactSubmitName");
    }.bind(this);

    this.emailauthFn = function (e) {
        let msg = "Please share your email address so that I can get in touch with you 😊";
        let ctrlHtml = `<div class="emailIcon_wrp"><input chat-inp type="email" class="form-control" id="anon_mail" placeholder="Enter Email"></div>`;
        this.sendWrapedCtrl(msg, ctrlHtml, "anon_mail", "contactSubmitMail");

    }.bind(this);

    this.phoneauthFn = function (e) {
        let msg = "Please provide your phone number";
        let ctrlHtml = `<div class="phoneIcon_wrp"><input chat-inp type="tel" class="form-control" id="anon_phno" placeholder="Phone Number"></div>`;
        this.sendWrapedCtrl(msg, ctrlHtml, "anon_phno", "contactSubmitPhn");
    }.bind(this);

    this.OTP_BasedLogin = function () {
        this.msgFromBot("Please Login");
        let controlHTML = `<div class="" style='width: calc(100% - 57px)'>
                            <div class="form-group otp_Login_input">
                              <label for="username_id">Email or Mobile</label>
                                <div class="username_wrp">
                                <input type="text" class="form-control" id="otp_login_id" placeholder="Enter email or mobile" name="otp_login">
                                </div>
                            </div>
                        </div>`;


        let $ctrlCont = $(`<div class="chat-ctrl-cont ctrl-cont-bot">${controlHTML}<div class="ctrl-send-wraper">
                <button class="btn cntct_btn" name="otpUserSubmitBtn"><i class="fa fa-chevron-right" aria-hidden="true"></i></button></div></div>`);
        this.msgFromBot($ctrlCont, function () { $(`#otpUserLogin`).focus(); }, "otpUserLogin");
    }

    this.Password_basedLogin = function (e) {
        this.msgFromBot("Please provide your username and password");
        let controlHTML = `<div class="" style='width: calc(100% - 57px)'>
                            <div class="form-group bot_Login_input">
                              <label for="username_id">Email:</label>
                                <div class="username_wrp">
                                <input type="email" class="form-control" id="username_id" placeholder="Enter email" name="email">
                                </div>
                            </div>
                            <div class="form-group bot_Login_input">
                              <label for="password_id">Password:</label>
                                <div class="pswrd_wrp">
                                <input type="password" class="form-control" id="password_id" placeholder="Enter password" name="pwd">
                                </div>
                            </div>
                        </div>`;


        let $ctrlCont = $(`<div class="chat-ctrl-cont ctrl-cont-bot">${controlHTML}<div class="ctrl-send-wraper">
                <button class="btn cntct_btn" name="passwordSubmitBtn"><i class="fa fa-chevron-right" aria-hidden="true"></i></button></div></div>`);
        this.msgFromBot($ctrlCont, function () { $(`#pswdbasedLogin`).focus(); }, "pswdbasedLogin");


    }.bind(this);

    this.twoFactorAuthLogin = function (auth) {
        if (!this.resendOTP) {
            this.msgFromBot("Please enter the OTP to verify your account");
        }
        let controlHTML = `<div class="otp_cont">
                <div class="login-sec-image text-center">
                    <img src="/images/logo/${this.EXPRESSbase_cid}.png" data-src= "/images/logo/${this.EXPRESSbase_cid}.png" class="T_logo Eb_Image" />
                </div>
                <div class="otp_warnings"></div>                    
                    <div class="otp_wrp" >
                        <h5>An OTP has been sent to <span id="lastDigit"> ${auth.otpTo}</span> </h5>
                          <input id="partitioned" maxlength='6' value=''/>
                    </div>
                    <div class="timer_resend_wrp" ">
                        <div class="pull-right">
                            <span id="OTPtimer" style="font-weight:bold"></span>
                        </div>
                        <div class="pull-left ">
                            <button class="btn-link" id="resendOTP">Resend</button>
                        </div>
                     </div> 
                </div>`;


        //<h5 class="text-center">Please enter the OTP to verify your account</h5> <br>
        //<button id="otpvalidate" class="btn signin-btn eb_blue w-100">Verify</button>

        let $ctrlCont = $(`<div class="chat-ctrl-cont ctrl-cont-bot">${controlHTML}<div class="ctrl-send-wraper">
                <button class="btn cntct_btn" name="otpvalidateBtn"><i class="fa fa-chevron-right" aria-hidden="true"></i></button></div></div>`);

        setTimeout(function () {
            this.msgFromBot($ctrlCont, function () { $(`#otpvalidate`).focus(); }, "otpvalidate");
            setTimeout(function () {
                this.StartOtpTimer();
            }.bind(this), this.typeDelay);

        }.bind(this), this.typeDelay);


    }.bind(this);

    //otp timer
    this.resendOTP = false;
    this.StartOtpTimer = function () {
        setTimeout(function () {
            this.resendOTP = false;
            document.getElementById('OTPtimer').innerHTML = 003 + ":" + 00;
            this.startTimer();
        }.bind(this), this.typeDelay);

    }.bind(this);

    this.startTimer = function () {
        if (this.resendOTP)
            return;
        var presentTime = document.getElementById('OTPtimer').innerHTML;
        var timeArray = presentTime.split(/[:]+/);
        var m = timeArray[0];
        var s = this.checkSecond((timeArray[1] - 1));
        if (s == 59) { m = m - 1 }
        if (m < 0) {
            this.OtpTimeOut();
            return;
        }

        document.getElementById('OTPtimer').innerHTML = m + ":" + s;
        console.log(m);
        /////////////////////////////////////////////////////////54646546546546565465
        setTimeout(this.startTimer, 1000);
    }.bind(this);

    this.OtpTimeOut = function () {
        this.msgFromBot("Time out");
        // EbMessage("show", { Background: "red", Message: "Time out" });
        setTimeout(function () {
            this.botStartoverfn()
        }.bind(this), this.typeDelay * 2);

    }.bind(this);

    this.checkSecond = function (sec) {
        if (sec < 10 && sec >= 0) { sec = "0" + sec; } // add zero in front of numbers < 10
        if (sec < 0) { sec = "59"; }
        return sec;
    }

    this.otpvalidate = function (e) {
        $(e.target).closest('button').attr('disabled', true);
        this.showTypingAnim();
        if (this.botflg.otptype == "signinotp") {
            $.ajax({
                url: "../bote/PasswordAuthAndGetformlist",
                type: "POST",
                data: {
                    "uname": this.botflg.uname_otp,
                    "cid": this.EXPRESSbase_SOLUTION_ID,
                    "appid": this.EXPRESSbase_APP_ID,
                    "wc": "bc",
                    "user_ip": this.userDtls.ip,
                    "user_browser": this.userDtls.browser,
                    "otptype": this.botflg.otptype,
                    "otp": $("#partitioned").val(),
                },
                success: function (result) {
                    this.hideTypingAnim();
                    if (result.status === false) {
                        this.msgFromBot(result.errorMsg);
                    }
                    else {

                        //  document.cookie = "bot_bToken=" + result.bearerToken + "; path=/"; 
                        // document.cookie = "bot_rToken=" + result.refreshToken + "; path=/"; 
                        this.formsDict = result.botFormDict;
                        window.ebcontext.user = JSON.parse(result.user);
                        //this.formNames = Object.values(this.formsDict);
                        this.formNames = Object.values(result.botFormNames);
                        this.formIcons = result.botFormIcons;
                        $('.eb-chatBox').empty();
                        this.showDate();
                        if (Object.keys(this.formsDict).length == 1) {
                            this.botflg.singleBotApp = true;
                            this.curRefid = Object.keys(this.formsDict)[0];
                            this.getForm(this.curRefid);
                        }
                        else {
                            this.AskWhatU();
                        }
                    }

                }.bind(this)
            });
        }
        else {
            $.post("../bote/ValidateOtp",
                {
                    otp: $("#partitioned").val(),
                    appid: this.EXPRESSbase_APP_ID,
                    otptype: this.botflg.otptype
                },
                function (result) {
                    if (result.status) {
                        //this.bearerToken = result.bearerToken;
                        //this.refreshToken = result.refreshToken;
                        this.formsDict = result.botFormDict;
                        window.ebcontext.user = JSON.parse(result.user);
                        //this.formNames = Object.values(this.formsDict);
                        this.formNames = Object.values(result.botFormNames);
                        this.formIcons = result.botFormIcons;
                        $('.eb-chatBox').empty();
                        this.showDate();
                        if (Object.keys(this.formsDict).length == 1) {
                            this.botflg.singleBotApp = true;
                            this.curRefid = Object.keys(this.formsDict)[0];
                            this.getForm(this.curRefid);
                        }
                        else {
                            this.AskWhatU();
                        }
                    }
                    else {
                        $("[for=otpvalidate]").remove();
                        $("[lbl_for=otpvalidate]").remove();
                        this.msgFromBot(result.errorMsg);

                    }

                }.bind(this)
            );
        }

    }.bind(this);


    this.otpResendFn = function () {
        this.resendOTP = true;
        $.post("../bote/ResendOtp",
            { otptype: this.botflg.otptype },
            function (auth) {
                if (auth.authStatus) {
                    $("[for=otpvalidate]").remove();
                    $("[lbl_for=otpvalidate]").remove();
                    this.msgFromBot("OTP has been sent again");
                    this.twoFactorAuthLogin(auth)
                }
                else {
                    this.msgFromBot(auth.errorMessage);
                }
            }.bind(this));
    }.bind(this);


    this.validateEmail = function (email) {
        //  var re = /\S+@\S+\.\S+/;
        let emailReg = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return emailReg.test(email);
    }

    this.validateMobile = function (mobile) {
        // var phoneReg = /^(\+91-|\+91|0)?\d{10}$/;
        let phoneReg = /^([+]{0,1})([0-9]{10,})$/;
        return phoneReg.test(mobile);
    }

    this.otpLoginFn = function (e) {
        $(e.target).closest('button').attr('disabled', true);
        this.showTypingAnim();
        let uname = $("#otp_login_id").val();
        //let emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let is_email = this.validateEmail(uname);
        //let phoneRegex = /^(\+91-|\+91|0)?\d{10}$/;
        let is_mobile = this.validateMobile(uname);
        if (is_email || is_mobile) {
            $.ajax({
                url: "../bote/SendSignInOtp",
                type: "POST",
                data: {
                    "uname": uname,
                    "is_email": is_email,
                    "is_mobile": is_mobile
                },
                success: function (result) {
                    this.hideTypingAnim();

                    if (result.authStatus) {
                        $("[for=otpUserLogin]").remove();
                        $("[lbl_for=otpUserLogin]").remove();
                        this.botflg.otptype = "signinotp";
                        this.botflg.uname_otp = uname;
                        this.twoFactorAuthLogin(result)
                    }
                    else if (result.authStatus === false) {
                        this.msgFromBot(result.errorMessage);
                    }

                }.bind(this)
            });
        }

    }.bind(this);

    this.passwordLoginFn = function (e) {
        $(e.target).closest('button').attr('disabled', true);
        this.showTypingAnim();
        $.ajax({
            url: "../bote/PasswordAuthAndGetformlist",
            type: "POST",
            data: {
                "uname": $("#username_id").val().trim(),
                "pass": $("#password_id").val().trim(),
                "cid": this.EXPRESSbase_SOLUTION_ID,
                "appid": this.EXPRESSbase_APP_ID,
                "wc": "bc",
                "user_ip": this.userDtls.ip,
                "user_browser": this.userDtls.browser,
                "otptype": this.botflg.otptype
            },
            success: function (result) {
                this.hideTypingAnim();
                if (result.status === false) {
                    this.msgFromBot(result.errorMsg);
                }
                else {
                    if (result.is2Factor) {
                        $("[for=pswdbasedLogin]").remove();
                        $("[lbl_for=pswdbasedLogin]").remove();
                        this.botflg.otptype = "2faotp";
                        this.twoFactorAuthLogin(result);
                    }
                    else {

                        //  document.cookie = "bot_bToken=" + result.bearerToken + "; path=/"; 
                        // document.cookie = "bot_rToken=" + result.refreshToken + "; path=/"; 
                        this.formsDict = result.botFormDict;
                        window.ebcontext.user = JSON.parse(result.user);
                        //this.formNames = Object.values(this.formsDict);
                        this.formNames = Object.values(result.botFormNames);
                        this.formIcons = result.botFormIcons;
                        $('.eb-chatBox').empty();
                        this.showDate();
                        if (Object.keys(this.formsDict).length == 1) {
                            this.botflg.singleBotApp = true;
                            this.curRefid = Object.keys(this.formsDict)[0];
                            this.getForm(this.curRefid);
                        }
                        else {
                            this.AskWhatU();
                        }
                    }

                }

            }.bind(this)
        });
    }.bind(this);


    this.AnonymousLoginOptions = function () {
        this.hideTypingAnim();

        //ASK FOR USER NAME
        if (settings.Authoptions.UserName) {
            this.userNameFn();
        }
        //use seperate function for else part to replace collectContacts
        else {
            if (settings.Authoptions.LoginOpnCount > 1) {
                this.loginList();
            }
            else {
                this.LoginOpnDirectly();
            }

        }
        // this.isAlreadylogined = false;

    }.bind(this);

    this.loginList = function () {
        this.Query(`Please select a login method`, [`Guest login`, `Login with facebook`], "loginOptions");

        //// this.isAlreadylogined = false;
        //let btnhtml = `<div class="loginOptnCont">
        //                <div class="lgnBtnCont" >
        //                    <button class="ebbtn loginOptnBtn" name="loginOptions" optn="guestlogin" ><i class="fa fa-user" style="padding-right:10px"></i>Guest login</button>
        //                </div>`;

        //if (settings.Authoptions.Fblogin) {
        //    this.FB.getLoginStatus(function (response) {
        //        if (response.status === 'connected') {
        //            btnhtml += '<div class="lgnBtnCont" ><button class="ebbtn loginOptnBtn" name="loginOptions" optn="btnFacebook" ><i class="fa fa-facebook" style="padding-right:10px"></i>Login with facebook</button> </div>'
        //        } else {
        //            btnhtml += '<div class="lgnBtnCont" ><button class="ebbtn loginOptnBtn" name="loginOptions" optn="btnFacebook" ><i class="fa fa-facebook" style="padding-right:10px"></i>Login with facebook</button> </div>'
        //        }
        //    });

        //}

        //btnhtml += "</div>";
        //this.msgFromBot($(btnhtml));
    }.bind(this);

    this.loginSelectedOpn = function (e) {
        this.postmenuClick(e)
        if (this.CurFormIdx === 0)
            this.AnonymousUserLogin();
        else {
            this.login2FB();

        }

        //let optnTxt = $(e.target).closest('button').text();
        //this.postmenuClick(e, optnTxt);
        //let optn = $(e.target).closest('button').attr('optn');
        //if (optn === 'guestlogin') {
        //    this.AnonymousUserLogin();
        //}
        //else if (optn === 'btnFacebook') {
        //    this.login2FB();
        //}
    }.bind(this);

    this.AnonymousUserLogin = function () {
        this.hideTypingAnim();
        this.isAlreadylogined = false;
        if (settings.Authoptions.EmailAuth) {
            this.botQueue.push(this.emailauthFn);
        }
        if (settings.Authoptions.PhoneAuth) {
            this.botQueue.push(this.phoneauthFn);
        }
        if (this.botQueue.length > 0)
            (this.botQueue.shift())();

    }.bind(this);

    this.LoginOpnDirectly = function () {
        this.hideTypingAnim();
        // this.isAlreadylogined = false;

        if (settings.Authoptions.EmailAuth || settings.Authoptions.PhoneAuth) {
            this.AnonymousUserLogin()
        }

        else if (settings.Authoptions.Fblogin) {
            if (this.FB != null) {
                this.FB.getLoginStatus(function (response) {
                    if (response.status === 'connected') {
                        this.FBLogined();
                    } else {
                        this.FBNotLogined();
                    }
                }.bind(this));
            }
            else {
                this.FBLogined();
            }

        }

    }.bind(this);


    this.botStartoverfn = function () {

        if (this.botflg.loadFormlist === false) {
            this.botflg.startover = false;
            this.ClearFormVariables();
            this.botflg.otptype = "";//clear flags
            this.botflg.uname_otp = "";
            this.$renderAtBottom.empty();
            this.curCtrl = null;
            this.$renderAtBottom.hide();
            $('.eb-chatBox').empty();
            this.showDate();
            this.botUserLogin();
        }

    }.bind(this);

    this.botUserLogin = function () {
        this.msgFromBot(this.welcomeMessage);

        if (!settings.UserType_Internal) {
            if (settings.Authoptions.Fblogin) {
                // This is called with the results from from FB.getLoginStatus().

                window.fbAsyncInit = function () {
                    console.log("bot" + settings.Authoptions.FbAppVer);
                    FB.init({
                        appId: settings.Authoptions.FbAppID,
                        //appId: ('@ViewBag.Env' === 'Development' ? '141908109794829' : ('@ViewBag.Env' === 'Staging' ? '1525758114176201' : '2202041803145524')),//'141908109794829',//,'1525758114176201',//
                        cookie: true,  // enable cookies to allow the server to access
                        // the session
                        xfbml: true,  // parse social plugins on this page
                        version: settings.Authoptions.FbAppVer
                        //version: ('@ViewBag.Env' === 'Development' ? 'v2.11' : ('@ViewBag.Env' === 'Staging' ? 'v2.8' : 'v3.0')) // use graph api version 2.8
                    });

                    FB.getLoginStatus(function (response) {
                        statusChangeCallback(response);
                    });

                };

                // Load the SDK asynchronously
                (function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) return;
                    js = d.createElement(s); js.id = id;
                    js.src = "//connect.facebook.net/en_US/sdk.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));


                function statusChangeCallback(response) {
                    console.log('statusChangeCallback');
                    this.FB = FB;
                    //if (response.status === 'connected') {
                    //    this.FBLogined();
                    //} else {
                    //    this.FBNotLogined();
                    //}
                }

                // This function is called when someone finishes with the Login
                function checkLoginState() {
                    FB.getLoginStatus(function (response) {
                        statusChangeCallback(response);
                    });
                };
            }
        }
        if ((getTokenFromCookie("bot_bToken") != "") && (getTokenFromCookie("bot_rToken") != "")) {
            this.getBotformList();
        }
        else {
            if (settings.UserType_Internal) {
                if (settings.Authoptions.OTP_based) {
                    this.OTP_BasedLogin();
                } else if (settings.Authoptions.Password_based) {
                    this.Password_basedLogin();
                }
            } else {
                this.AnonymousLoginOptions();
            }
        }

    }.bind(this);



    this.initConnectionCheck = function () {
        Offline.options = { checkOnLoad: true, checks: { image: { url: 'https://expressbase.com/images/logos/EB_Logo.png?' + Date.now() }, active: 'image' } };
        setInterval(this.connectionPing, 500000);///////////////////////////////////////////////////////////////
    };

    this.connectionPing = function () {
        Offline.options.checks.image.url = 'https://expressbase.com/images/logos/EB_Logo.png?' + Date.now();
        if (Offline.state === 'up')
            Offline.check();
        console.log(Offline.state);
    };

    //==========================================



    this.showTblViz = function (e) {
        var $tableCont = $('<div class="table-cont">' + this.curTblViz.bareControlHtml + '</div>');
        this.$chatBox.append($tableCont);
        this.showTypingAnim();
        //$(`#${this.curTblViz.EbSid}`).DataTable({//change ebsid to name
        //    processing: true,
        //    serverSide: false,
        //    dom: 'rt',
        //    columns: this.curTblViz.BotCols,
        //    data: this.curTblViz.BotData,
        //    initComplete: function () {
        //        this.hideTypingAnim();
        //        this.AskWhatU();
        //        $tableCont.show(100);
        //    }.bind(this)
        //dom: "rt",
        //ajax: {
        //    url: 'http://localhost:8000/ds/data/' + this.curTblViz.DataSourceRefId,
        //    type: 'POST',
        //    timeout: 180000,
        //    data: function (dq) {
        //        delete dq.columns; delete dq.order; delete dq.search;
        //        dq.RefId = this.curTblViz.DataSourceRefId;
        //        return dq;
        //    }.bind(this),
        //    dataSrc: function (dd) {
        //        return dd.data;
        //    },
        //    beforeSend: function (xhr) {
        //        xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
        //    }.bind(this),
        //    crossDomain: true
        //}
        //});

        var o = new Object();
        o.containerId = this.curTblViz.name + "Container";
        o.dsid = this.curTblViz.dataSourceRefId;
        o.tableId = this.curTblViz.name + "tbl";
        o.showSerialColumn = true;
        o.showCheckboxColumn = false;
        o.showFilterRow = false;
        o.IsPaging = false;
        o.rendererName = 'Bot';
        //o.scrollHeight = this.scrollHeight + "px";
        //o.fnDblclickCallback = this.dblClickOnOptDDEventHand.bind(this);
        //o.fnKeyUpCallback = this.xxx.bind(this);
        //o.arrowFocusCallback = this.arrowSelectionStylingFcs;
        //o.arrowBlurCallback = this.arrowSelectionStylingBlr;
        //o.fninitComplete = this.initDTpost.bind(this);
        //o.hiddenFieldName = this.vmName;
        //o.showFilterRow = true;
        //o.keyPressCallbackFn = this.DDKeyPress.bind(this);
        o.columns = this.curTblViz.columns;//////////////////////////////////////////////////////
        this.datatable = new EbBasicDataTable(o);

        this.hideTypingAnim();
        this.AskWhatU();
    }.bind(this);

    this.showChartViz = function (e) {
        this.showTypingAnim();
        $.ajax({
            type: 'POST',
            url: '../boti/getData',
            data: { draw: 1, RefId: this.curChartViz.DataSourceRefId, Start: 0, Length: 50, TFilters: [] },
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            //}.bind(this),
            success: this.getDataSuccess.bind(this),
            error: function () { }
        });
    }.bind(this);

    this.getDataSuccess = function (result) {
        this.Gdata = result.data;
        $canvasDiv = $('<div class="chart-cont">' + this.curChartViz.BareControlHtml + '</div>');
        $canvasDiv.find("canvas").attr("id", $canvasDiv.find("canvas").attr("id") + ++this.ChartCounter);
        this.$chatBox.append($canvasDiv);
        this.drawGeneralGraph();
        this.hideTypingAnim();
        this.AskWhatU();
    };

    this.drawGeneralGraph = function () {
        this.getBarData();
        this.gdata = {
            labels: this.XLabel,
            datasets: this.dataset
        };
        this.animateOPtions = this.curChartViz.ShowValue ? new animateObj(0) : false;
        this.goptions = {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: (this.type !== "pie") ? true : false,
                        labelString: (this.curChartViz.YaxisTitle !== "") ? this.curChartViz.YaxisTitle : "YLabel",
                        fontColor: (this.curChartViz.YaxisTitleColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.YaxisTitleColor : "#000000"
                    },
                    stacked: false,
                    gridLines: {
                        display: (this.curChartViz.Type !== "pie") ? true : false
                    },
                    ticks: {
                        fontSize: 10,
                        fontColor: (this.curChartViz.YaxisLabelColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.YaxisLabelColor : "#000000"
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: (this.type !== "pie") ? true : false,
                        labelString: (this.curChartViz.XaxisTitle !== "") ? this.curChartViz.XaxisTitle : "XLabel",
                        fontColor: (this.curChartViz.XaxisTitleColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.XaxisTitleColor : "#000000"
                    },
                    gridLines: {
                        display: this.type !== "pie" ? true : false
                    },
                    ticks: {
                        fontSize: 10,
                        fontColor: (this.curChartViz.XaxisLabelColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.XaxisLabelColor : "#000000"
                    }
                }]
            },
            zoom: {
                // Boolean to enable zooming
                enabled: true,

                // Zooming directions. Remove the appropriate direction to disable 
                // Eg. 'y' would only allow zooming in the y direction
                mode: 'x'
            },
            pan: {
                enabled: true,
                mode: 'x'
            },
            legend: {
                //onClick: this.legendClick.bind(this)
            },

            tooltips: {
                enabled: this.curChartViz.ShowTooltip
            },
            animation: this.animateOPtions

        };
        if (this.curChartViz.Xaxis.$values.length > 0 && this.curChartViz.Xaxis.$values.length > 0)
            this.drawGraph();

    };

    this.getBarData = function () {
        this.Xindx = [];
        this.Yindx = [];
        this.dataset = [];
        this.XLabel = [];
        this.YLabel = [];
        var xdx = [], ydx = [];
        if (this.curChartViz.Xaxis.$values.length > 0 && this.curChartViz.Yaxis.$values.length > 0) {

            $.each(this.curChartViz.Xaxis.$values, function (i, obj) {
                xdx.push(obj.data);
            });

            $.each(this.curChartViz.Yaxis.$values, function (i, obj) {
                ydx.push(obj.data);
            });

            $.each(this.Gdata, this.getBarDataLabel.bind(this, xdx));

            for (k = 0; k < ydx.length; k++) {
                this.YLabel = [];
                for (j = 0; j < this.Gdata.length; j++)
                    this.YLabel.push(this.Gdata[j][ydx[k]]);
                if (this.curChartViz.Type !== "googlemap") {
                    if (this.curChartViz.Type !== "pie") {
                        this.piedataFlag = false;
                        this.dataset.push(new datasetObj(this.curChartViz.Yaxis.$values[k].name, this.YLabel, this.curChartViz.LegendColor.$values[k].color, this.curChartViz.LegendColor.$values[k].color, false));
                    }
                    else {
                        this.dataset.push(new datasetObj4Pie(this.curChartViz.Yaxis.$values[k].name, this.YLabel, this.curChartViz.LegendColor.$values[k].color, this.curChartViz.LegendColor.$values[k].color, false));
                        this.piedataFlag = true;
                    }
                }
            }
        }
    };

    this.getBarDataLabel = function (xdx, i, value) {
        for (k = 0; k < xdx.length; k++)
            this.XLabel.push(value[xdx[k]]);
    };

    this.drawGraph = function () {
        var canvas = document.getElementById(this.curChartViz.EbSid + this.ChartCounter);//change ebsid to name
        this.chartApi = new Chart(canvas, {
            type: this.curChartViz.Type,
            data: this.gdata,
            options: this.goptions,
        });
    };

    //==========================================
    this.init();
};

var datasetObj = function (label, data, backgroundColor, borderColor, fill) {
    this.label = label;
    this.data = data;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.fill = fill;
};

function getToken() {
    var b = document.cookie.match('(^|;)\\s*bToken\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

function getTokenFromCookie(name) {
    // var b = document.cookie.match('(^|;)\\s*bToken\\s*=\\s*([^;]+)');
    var b = document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`);
    return b ? b.pop() : '';
}
/** @license
 * eventsource.js
 * Available under MIT License (MIT)
 * https://github.com/Yaffle/EventSource/
 */
!function (a) { "use strict"; function b(a) { this.withCredentials = !1, this.responseType = "", this.readyState = 0, this.status = 0, this.statusText = "", this.responseText = "", this.onprogress = q, this.onreadystatechange = q, this._contentType = "", this._xhr = a, this._sendTimeout = 0, this._abort = q } function c(a) { this._xhr = new b(a) } function d() { this._listeners = Object.create(null) } function e(a) { k(function () { throw a }, 0) } function f(a) { this.type = a, this.target = void 0 } function g(a, b) { f.call(this, a), this.data = b.data, this.lastEventId = b.lastEventId } function h(a, b) { d.call(this), this.onopen = void 0, this.onmessage = void 0, this.onerror = void 0, this.url = void 0, this.readyState = void 0, this.withCredentials = void 0, this._close = void 0, j(this, a, b) } function i() { return m && "withCredentials" in m.prototype ? m : n } function j(a, b, d) { b = String(b); var h = void 0 != d && Boolean(d.withCredentials), j = E(1e3), m = void 0 != d && void 0 != d.heartbeatTimeout ? D(d.heartbeatTimeout, 45e3) : E(45e3), n = "", o = j, p = !1, q = void 0 != d && void 0 != d.headers ? JSON.parse(JSON.stringify(d.headers)) : void 0, B = void 0 != d && void 0 != d.Transport ? d.Transport : i(), C = new c(new B), G = 0, H = r, I = "", J = "", K = "", L = "", M = w, N = 0, O = 0, P = function (b, c, d) { if (H === s) if (200 === b && void 0 != d && A.test(d)) { H = t, p = !0, o = j, a.readyState = t; var g = new f("open"); a.dispatchEvent(g), F(a, a.onopen, g) } else { var h = ""; 200 !== b ? (c && (c = c.replace(/\s+/g, " ")), h = "EventSource's response has a status " + b + " " + c + " that is not 200. Aborting the connection.") : h = "EventSource's response has a Content-Type specifying an unsupported type: " + (void 0 == d ? "-" : d.replace(/\s+/g, " ")) + ". Aborting the connection.", e(new Error(h)), S(); var g = new f("error"); a.dispatchEvent(g), F(a, a.onerror, g) } }, Q = function (b) { if (H === t) { for (var c = -1, d = 0; d < b.length; d += 1) { var e = b.charCodeAt(d); (e === "\n".charCodeAt(0) || e === "\r".charCodeAt(0)) && (c = d) } var f = (-1 !== c ? L : "") + b.slice(0, c + 1); L = (-1 === c ? L : "") + b.slice(c + 1), "" !== f && (p = !0); for (var h = 0; h < f.length; h += 1) { var e = f.charCodeAt(h); if (M === v && e === "\n".charCodeAt(0)) M = w; else if (M === v && (M = w), e === "\r".charCodeAt(0) || e === "\n".charCodeAt(0)) { if (M !== w) { M === x && (O = h + 1); var i = f.slice(N, O - 1), q = f.slice(O + (h > O && f.charCodeAt(O) === " ".charCodeAt(0) ? 1 : 0), h); "data" === i ? (I += "\n", I += q) : "id" === i ? J = q : "event" === i ? K = q : "retry" === i ? (j = D(q, j), o = j) : "heartbeatTimeout" === i && (m = D(q, m), 0 !== G && (l(G), G = k(function () { T() }, m))) } if (M === w) { if ("" !== I) { n = J, "" === K && (K = "message"); var r = new g(K, { data: I.slice(1), lastEventId: J }); if (a.dispatchEvent(r), "message" === K && F(a, a.onmessage, r), H === u) return } I = "", K = "" } M = e === "\r".charCodeAt(0) ? v : w } else M === w && (N = h, M = x), M === x ? e === ":".charCodeAt(0) && (O = h + 1, M = y) : M === y && (M = z) } } }, R = function () { if (H === t || H === s) { H = r, 0 !== G && (l(G), G = 0), G = k(function () { T() }, o), o = E(Math.min(16 * j, 2 * o)), a.readyState = s; var b = new f("error"); a.dispatchEvent(b), F(a, a.onerror, b) } }, S = function () { H = u, C.cancel(), 0 !== G && (l(G), G = 0), a.readyState = u }, T = function () { if (G = 0, H !== r) return void (p ? (p = !1, G = k(function () { T() }, m)) : (e(new Error("No activity within " + m + " milliseconds. Reconnecting.")), C.cancel())); p = !1, G = k(function () { T() }, m), H = s, I = "", K = "", J = n, L = "", N = 0, O = 0, M = w; var a = b; "data:" !== b.slice(0, 5) && "blob:" !== b.slice(0, 5) && (a = b + (-1 === b.indexOf("?", 0) ? "?" : "&") + "lastEventId=" + encodeURIComponent(n)); var c = {}; if (c.Accept = "text/event-stream", void 0 != q) for (var d in q) Object.prototype.hasOwnProperty.call(q, d) && (c[d] = q[d]); try { C.open(P, Q, R, a, h, c) } catch (f) { throw S(), f } }; a.url = b, a.readyState = s, a.withCredentials = h, a._close = S, T() } var k = a.setTimeout, l = a.clearTimeout, m = a.XMLHttpRequest, n = a.XDomainRequest, o = a.EventSource, p = a.document; null == Object.create && (Object.create = function (a) { function b() { } return b.prototype = a, new b }); var q = function () { }; b.prototype.open = function (a, b) { this._abort(!0); var c = this, d = this._xhr, e = 1, f = 0; this._abort = function (a) { 0 !== c._sendTimeout && (l(c._sendTimeout), c._sendTimeout = 0), (1 === e || 2 === e || 3 === e) && (e = 4, d.onload = q, d.onerror = q, d.onabort = q, d.onprogress = q, d.onreadystatechange = q, d.abort(), 0 !== f && (l(f), f = 0), a || (c.readyState = 4, c.onreadystatechange())), e = 0 }; var g = function () { if (1 === e) { var a = 0, b = "", f = void 0; if ("contentType" in d) a = 200, b = "OK", f = d.contentType; else try { a = d.status, b = d.statusText, f = d.getResponseHeader("Content-Type") } catch (g) { a = 0, b = "", f = void 0 } 0 !== a && (e = 2, c.readyState = 2, c.status = a, c.statusText = b, c._contentType = f, c.onreadystatechange()) } }, h = function () { if (g(), 2 === e || 3 === e) { e = 3; var a = ""; try { a = d.responseText } catch (b) { } c.readyState = 3, c.responseText = a, c.onprogress() } }, i = function () { h(), (1 === e || 2 === e || 3 === e) && (e = 4, 0 !== f && (l(f), f = 0), c.readyState = 4, c.onreadystatechange()) }, j = function () { void 0 != d && (4 === d.readyState ? i() : 3 === d.readyState ? h() : 2 === d.readyState && g()) }, n = function () { f = k(function () { n() }, 500), 3 === d.readyState && h() }; d.onload = i, d.onerror = i, d.onabort = i, "sendAsBinary" in m.prototype || "mozAnon" in m.prototype || (d.onprogress = h), d.onreadystatechange = j, "contentType" in d && (b += (-1 === b.indexOf("?", 0) ? "?" : "&") + "padding=true"), d.open(a, b, !0), "readyState" in d && (f = k(function () { n() }, 0)) }, b.prototype.abort = function () { this._abort(!1) }, b.prototype.getResponseHeader = function (a) { return this._contentType }, b.prototype.setRequestHeader = function (a, b) { var c = this._xhr; "setRequestHeader" in c && c.setRequestHeader(a, b) }, b.prototype.send = function () { if (!("ontimeout" in m.prototype) && void 0 != p && void 0 != p.readyState && "complete" !== p.readyState) { var a = this; return void (a._sendTimeout = k(function () { a._sendTimeout = 0, a.send() }, 4)) } var b = this._xhr; b.withCredentials = this.withCredentials, b.responseType = this.responseType; try { b.send(void 0) } catch (c) { throw c } }, c.prototype.open = function (a, b, c, d, e, f) { var g = this._xhr; g.open("GET", d); var h = 0; g.onprogress = function () { var a = g.responseText, c = a.slice(h); h += c.length, b(c) }, g.onreadystatechange = function () { if (2 === g.readyState) { var b = g.status, d = g.statusText, e = g.getResponseHeader("Content-Type"); a(b, d, e) } else 4 === g.readyState && c() }, g.withCredentials = e, g.responseType = "text"; for (var i in f) Object.prototype.hasOwnProperty.call(f, i) && g.setRequestHeader(i, f[i]); g.send() }, c.prototype.cancel = function () { var a = this._xhr; a.abort() }, d.prototype.dispatchEvent = function (a) { a.target = this; var b = this._listeners[a.type]; if (void 0 != b) for (var c = b.length, d = 0; c > d; d += 1) { var f = b[d]; try { "function" == typeof f.handleEvent ? f.handleEvent(a) : f.call(this, a) } catch (g) { e(g) } } }, d.prototype.addEventListener = function (a, b) { a = String(a); var c = this._listeners, d = c[a]; void 0 == d && (d = [], c[a] = d); for (var e = !1, f = 0; f < d.length; f += 1)d[f] === b && (e = !0); e || d.push(b) }, d.prototype.removeEventListener = function (a, b) { a = String(a); var c = this._listeners, d = c[a]; if (void 0 != d) { for (var e = [], f = 0; f < d.length; f += 1)d[f] !== b && e.push(d[f]); 0 === e.length ? delete c[a] : c[a] = e } }, g.prototype = Object.create(f.prototype); var r = -1, s = 0, t = 1, u = 2, v = -1, w = 0, x = 1, y = 2, z = 3, A = /^text\/event\-stream;?(\s*charset\=utf\-8)?$/i, B = 1e3, C = 18e6, D = function (a, b) { var c = parseInt(a, 10); return c !== c && (c = b), E(c) }, E = function (a) { return Math.min(Math.max(a, B), C) }, F = function (a, b, c) { try { "function" == typeof b && b.call(a, c) } catch (d) { e(d) } }; h.prototype = Object.create(d.prototype), h.prototype.CONNECTING = s, h.prototype.OPEN = t, h.prototype.CLOSED = u, h.prototype.close = function () { this._close() }, h.CONNECTING = s, h.OPEN = t, h.CLOSED = u, h.prototype.withCredentials = void 0, a.EventSourcePolyfill = h, a.NativeEventSource = o, void 0 == m || void 0 != o && "withCredentials" in o.prototype || (a.EventSource = h) }("undefined" != typeof window ? window : this);
;(function (root, f) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], f);
    } else if (typeof exports === "object") {
        module.exports = f(require("jquery"));
    } else {
        f(root.jQuery);
    }
})(this, function ($) {

    if (!$.ss) $.ss = {};
    $.ss.handlers = {};
    $.ss.onSubmitDisable = "[type=submit]";
    $.ss.validation = {
        overrideMessages: false,
        messages: {
            NotEmpty: "Required",
            NotNull: "Required",
            Email: "Invalid email",
            AlreadyExists: "Already exists"
        },
        errorFilter: function (errorMsg, errorCode, type) {
            return this.overrideMessages
                ? this.messages[errorCode] || errorMsg || splitCase(errorCode)
                : errorMsg || splitCase(errorCode);
        }
    };
    $.ss.clearAdjacentError = function () {
        $(this).removeClass("error");
        $(this).prev(".help-inline,.help-block").removeClass("error").html("");
        $(this).next(".help-inline,.help-block").removeClass("error").html("");
    };
    $.ss.todate = function (s) { return new Date(parseFloat(/Date\(([^)]+)\)/.exec(s)[1])); };
    $.ss.todfmt = function (s) { return $.ss.dfmt($.ss.todate(s)); };
    function pad(d) { return d < 10 ? '0' + d : d; };
    $.ss.dfmt = function (d) { return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()); };
    $.ss.dfmthm = function (d) { return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ":" + pad(d.getMinutes()); };
    $.ss.tfmt12 = function (d) { return pad((d.getHours() + 24) % 12 || 12) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) + " " + (d.getHours() > 12 ? "PM" : "AM"); };
    $.ss.splitOnFirst = function (s, c) { if (!s) return [s]; var pos = s.indexOf(c); return pos >= 0 ? [s.substring(0, pos), s.substring(pos + 1)] : [s]; };
    $.ss.splitOnLast = function (s, c) { if (!s) return [s]; var pos = s.lastIndexOf(c); return pos >= 0 ? [s.substring(0, pos), s.substring(pos + 1)] : [s]; };
    $.ss.getSelection = function () {
        return window.getSelection
            ? window.getSelection().toString()
            : document.selection && document.selection.type != "Control"
                ? document.selection.createRange().text : "";
    };
    $.ss.combinePaths = function() {
        var parts = [], i, l;
        for (i = 0, l = arguments.length; i < l; i++) {
            var arg = arguments[i];
            parts = arg.indexOf("://") === -1
                ? parts.concat(arg.split("/"))
                : parts.concat(arg.lastIndexOf("/") === arg.length-1 ? arg.substring(0, arg.length-1) : arg);
        }
        var paths = [];
        for (i = 0, l = parts.length; i < l; i++) {
            var part = parts[i];
            if (!part || part === ".") continue;
            if (part === "..") paths.pop();
            else paths.push(part);
        }
        if (parts[0] === "") paths.unshift("");
        return paths.join("/") || (paths.length ? "/" : ".");
    };
    $.ss.queryString = function (url) {
        if (!url || url.indexOf('?') === -1) return {};
        var pairs = $.ss.splitOnFirst(url, '?')[1].split('&');
        var map = {};
        for (var i = 0; i < pairs.length; ++i) {
            var p = pairs[i].split('=');
            map[p[0]] = p.length > 1
                ? decodeURIComponent(p[1].replace(/\+/g, ' '))
                : null;
        }
        return map;
    };
    $.ss.bindAll = function (o) {
        for (var k in o) {
            if (typeof o[k] == 'function')
                o[k] = o[k].bind(o);
        }
        return o;
    };
    $.ss.createPath = function (route, args) {
        var argKeys = {};
        for (var k in args) {
            argKeys[k.toLowerCase()] = k;
        }
        var parts = route.split('/');
        var url = '';
        for (var i = 0; i < parts.length; i++) {
            var p = parts[i];
            if (p == null) p = '';
            if (p[0] == '{' && p[p.length - 1] == '}') {
                var key = argKeys[p.substring(1, p.length - 1).toLowerCase()];
                if (key) {
                    p = args[key];
                    delete args[key];
                }
            }
            if (url.length > 0) url += '/';
            url += p;
        }
        return url;
    };
    $.ss.createUrl = function(route, args) {
        var url = $.ss.createPath(route, args);
        for (var k in args) {
            url += url.indexOf('?') >= 0 ? '&' : '?';
            url += k + "=" + encodeURIComponent(args[k]);
        }
        return url;
    };
    function splitCase(t) {
        return typeof t != 'string' ? t : t.replace(/([A-Z]|[0-9]+)/g, ' $1').replace(/_/g, ' ');
    };
    $.ss.humanize = function (s) { return !s || s.indexOf(' ') >= 0 ? s : splitCase(s); };

    function toCamelCase(key) {
        return !key ? key : key.charAt(0).toLowerCase() + key.substring(1);
    }
    $.ss.normalizeKey = function (key) {
        return typeof key == "string" ? key.toLowerCase().replace(/_/g, '') : key;
    };
    $.ss.normalize = function (dto, deep) {
        if ($.isArray(dto)) {
            if (!deep) return dto;
            var to = [];
            for (var i = 0; i < dto.length; i++) {
                to[i] = $.ss.normalize(dto[i], deep);
            }
            return to;
        }
        if (typeof dto != "object") return dto;
        var o = {};
        for (var k in dto) {
            o[$.ss.normalizeKey(k)] = deep ? $.ss.normalize(dto[k], deep) : dto[k];
        }
        return o;
    };
    function sanitize(status) {
        if (status["errors"])
            return status;
        var to = {};
        for (var k in status)
            to[toCamelCase(k)] = status[k];
        to.errors = [];
        $.each(status.Errors || [], function (i, o) {
            var err = {};
            for (var k in o)
                err[toCamelCase(k)] = o[k];
            to.errors.push(err);
        });
        return to;
    }
    $.ss.parseResponseStatus = function (json, defaultMsg) {
        try {
            var err = JSON.parse(json);
            return sanitize(err.ResponseStatus || err.responseStatus);
        } catch (e) {
            return {
                message: defaultMsg,
                __error: { error: e, json: json }
            };
        }
    };
    $.ss.postJSON = function (url, data, success, error) {
        return $.ajax({
            type: "POST", url: url, dataType: "json", contentType: "application/json",
            data: typeof data == "string" ? data : JSON.stringify(data),
            success: success, error: error
        });
    };

    $.fn.setFieldError = function (name, msg) {
        $(this).applyErrors({
            errors: [{
                fieldName: name,
                message: msg
            }]
        });
    };
    $.fn.serializeMap = function () {
        var o = {};
        $.each($(this).serializeArray(), function (i, e) {
            o[e.name] = e.value;
        });
        return o;
    };
    $.fn.applyErrors = function (status, opt) {
        this.clearErrors();
        if (!status) return this;
        status = sanitize(status);

        this.addClass("has-errors");

        var o = $.extend({}, $.ss.validation, opt);
        if (opt && opt.messages) {
            o.overrideMessages = true;
            $.extend(o.messages, $.ss.validation.messages);
        }

        var filter = $.proxy(o.errorFilter, o),
            errors = status.errors;

        if (errors && errors.length) {
            var fieldMap = {}, fieldLabelMap = {};
            this.find("input,textarea,select,button").each(function () {
                var $el = $(this);
                var $prev = $el.prev(), $next = $el.next();
                var fieldId = this.id || $el.attr("name");
                if (!fieldId) return;

                var key = (fieldId).toLowerCase();

                fieldMap[key] = $el;
                if ($prev.hasClass("help-inline") || $prev.hasClass("help-block")) {
                    fieldLabelMap[key] = $prev;
                } else if ($next.hasClass("help-inline") || $next.hasClass("help-block")) {
                    fieldLabelMap[key] = $next;
                }
            });
            this.find(".help-inline[data-for],.help-block[data-for]").each(function () {
                var $el = $(this);
                var key = $el.data("for").toLowerCase();
                fieldLabelMap[key] = $el;
            });
            $.each(errors, function (i, error) {
                var key = (error.fieldName || "").toLowerCase();
                var $field = fieldMap[key];
                if ($field) {
                    $field.addClass("error");
                    $field.parent().addClass("has-error");
                }
                var $lblErr = fieldLabelMap[key];
                if (!$lblErr) return;

                $lblErr.addClass("error");
                $lblErr.html(filter(error.message, error.errorCode, "field"));
                $lblErr.show();
            });
        } else {
            this.find(".error-summary")
                .html(filter(status.message || splitCase(status.errorCode), status.errorCode, "summary"))
                .show();
        }
        return this;
    };
    $.fn.clearErrors = function () {
        this.removeClass("has-errors");
        this.find(".error-summary").html("").hide();
        this.find(".help-inline.error, .help-block.error").each(function () {
            $(this).html("");
        });
        this.find(".error").each(function () {
            $(this).removeClass("error");
        });
        return this.find(".has-error").each(function () {
            $(this).removeClass("has-error");
        });
    };
    $.fn.bindForm = function (orig) {
        return this.each(function () {
            var f = $(this);
            f.submit(function (e) {
                e.preventDefault();
                return $(f).ajaxSubmit(orig);
            });
        });
    };
    $.fn.ajaxSubmit = function (orig) {
        orig = orig || {};
        if (orig.validation) {
            $.extend($.ss.validation, orig.validation);
        }

        return this.each(function () {
            var f = $(this);
            f.clearErrors();
            try {
                if (orig.validate && orig.validate.call(f) === false)
                    return false;
            } catch (e) {
                return false;
            }
            f.addClass("loading");
            var $disable = $(orig.onSubmitDisable || $.ss.onSubmitDisable, f);
            $disable.attr("disabled", "disabled");
            var opt = $.extend({}, orig, {
                type: f.attr('method') || "POST",
                url: f.attr('action'),
                data: f.serialize(),
                accept: "application/json",
                error: function (jq, jqStatus, statusText) {
                    var err, errMsg = "The request failed with " + statusText;
                    try {
                        err = JSON.parse(jq.responseText);
                    } catch (e) {
                    }
                    if (!err) {
                        f.addClass("has-errors");
                        f.find(".error-summary").html(errMsg);
                    } else {
                        f.applyErrors(err.ResponseStatus || err.responseStatus);
                    }
                    if (orig.error) {
                        orig.error.apply(this, arguments);
                    }
                },
                complete: function (jq) {
                    f.removeClass("loading");
                    $disable.removeAttr("disabled");
                    if (orig.complete) {
                        orig.complete.apply(this, arguments);
                    }
                    var loc = jq.getResponseHeader("X-Location");
                    if (loc) {
                        location.href = loc;
                    }
                    var evt = jq.getResponseHeader("X-Trigger");
                    if (evt) {
                        var pos = attr.indexOf(':');
                        var cmd = pos >= 0 ? evt.substring(0, pos) : evt;
                        var data = pos >= 0 ? evt.substring(pos + 1) : null;
                        f.trigger(cmd, data ? [data] : []);
                    }
                },
                dataType: "json",
            });
            $.ajax(opt);
            return false;
        });
    };
    $.fn.applyValues = function (map) {
        return this.each(function () {
            var $el = $(this);
            $.each(map, function (k, v) {
                $el.find("#" + k + ",[name=" + k + "]").val(v);
            });
            $el.find("[data-html]").each(function () {
                $(this).html(map[$(this).data("html")] || "");
            });
            $el.find("[data-val]").each(function () {
                $(this).val(map[$(this).data("val")] || "");
            });
            $el.find("[data-src]").each(function () {
                $(this).attr("src", map[$(this).data("src")] || "");
            });
            $el.find("[data-href]").each(function () {
                $(this).attr("href", map[$(this).data("href")] || "");
            });
        });
    };
    $.ss.__call = $.ss.__call || function (e) {
        var $el = $(e.target);
        var attr = $el.data(e.type) || $el.closest("[data-" + e.type + "]").data(e.type);
        if (!attr) return;

        var pos = attr.indexOf(':'), fn;
        if (pos >= 0) {
            var cmd = attr.substring(0, pos);
            var data = attr.substring(pos + 1);
            if (cmd == 'trigger') {
                $el.trigger(data, [e.target]);
            } else {
                fn = $.ss.handlers[cmd];
                if (fn) {
                    fn.apply(e.target, data.split(','));
                }
            }
        } else {
            fn = $.ss.handlers[attr];
            if (fn) {
                fn.apply(e.target, [].splice(arguments));
            }
        }
    };
    $.ss.listenOn = 'click dblclick change focus blur focusin focusout select keydown keypress keyup hover toggle';
    $.fn.bindHandlers = function (handlers) {
        $.extend($.ss.handlers, handlers || {});
        return this.each(function () {
            var $el = $(this);
            $el.off($.ss.listenOn, $.ss.__call);
            $el.on($.ss.listenOn, $.ss.__call);
        });
    };

    $.fn.setActiveLinks = function () {
        var url = window.location.href;
        return this.each(function () {
            $(this).filter(function () {
                return this.href == url;
            })
            .addClass('active')
            .closest("li").addClass('active');
        });
    };

    $.ss.eventSourceStop = false;
    $.ss.eventOptions = {};
    $.ss.eventReceivers = {};
    $.ss.eventChannels = [];
    $.ss.eventSourceUrl = null;
    $.ss.updateSubscriberUrl = null;
    $.ss.updateChannels = function(channels) {
        $.ss.eventChannels = channels;
        if (!$.ss.eventSource) return;
        var url = $.ss.eventSource.url;
        $.ss.eventSourceUrl = url.substring(0, Math.min(url.indexOf('?'), url.length)) + "?channels=" + channels.join(',');
    };
    $.ss.updateSubscriberInfo = function (subscribe, unsubscribe) {
        var sub = typeof subscribe == "string" ? subscribe.split(',') : subscribe;
        var unsub = typeof unsubscribe == "string" ? unsubscribe.split(',') : unsubscribe;
        var channels = [];
        for (var i in $.ss.eventChannels) {
            var c = $.ss.eventChannels[i];
            if (unsub == null || $.inArray(c, unsub) === -1) {
                channels.push(c);
            }
        }
        if (sub) {
            for (var i in sub) {
                var c = sub[i];
                if ($.inArray(c, channels) === -1) {
                    channels.push(c);
                }
            }
        }
        $.ss.updateChannels(channels);
    };
    $.ss.subscribeToChannels = function (channels, cb, cbError) {
        return $.ss.updateSubscriber({ SubscribeChannels: channels.join(',') }, cb, cbError);
    };
    $.ss.unsubscribeFromChannels = function (channels, cb, cbError) {
        return $.ss.updateSubscriber({ UnsubscribeChannels: channels.join(',') }, cb, cbError);
    };
    $.ss.updateSubscriber = function (data, cb, cbError) {
        if (!$.ss.updateSubscriberUrl)
            throw new Error("updateSubscriberUrl was not populated");
        return $.ajax({
            type: "POST",
            url: $.ss.updateSubscriberUrl,
            data: data,
            dataType: "json",
            success: function (r) {
                $.ss.updateSubscriberInfo(data.SubscribeChannels, data.UnsubscribeChannels);
                r.channels = $.ss.eventChannels;
                if (cb != null)
                    cb(r);
            },
            error: function (e) {
                $.ss.reconnectServerEventsAuth({ errorArgs: arguments });
                if (cbError != null)
                    cbError(e);
            }
        });
    };
    $.ss.reconnectServerEvents = function (opt) {
        if ($.ss.eventSourceStop) return;
        opt = opt || {};
        var hold = $.ss.eventSource;
        var es = new EventSource(opt.url || $.ss.eventSourceUrl || hold.url);
        es.onerror = opt.onerror || hold.onerror;
        es.onmessage = opt.onmessage || hold.onmessage;
        var fn = $.ss.handlers["onReconnect"];
        if (fn != null)
            fn.apply(es, opt.errorArgs);
        hold.close();
        return $.ss.eventSource = es;
    };

    $.ss.reconnectServerEventsAuth = function (opt) {
        if ($.ss.eventSourceStop) return;
        opt = opt || {};
        var hold = $.ss.eventSource;
        var es = new EventSourcePolyfill(opt.url || $.ss.eventSourceUrl || hold.url, {
            headers: {
                'Authorization': 'Bearer ' + getrToken(),
            }
        });
        es.onerror = opt.onerror || hold.onerror;
        es.onmessage = opt.onmessage || hold.onmessage;
        var fn = $.ss.handlers["onReconnect"];
        if (fn != null)
            fn.apply(es, opt.errorArgs);
        hold.close();
        return $.ss.eventSource = es;
    };

    $.ss.invokeReceiver = function (r, cmd, el, msg, e, name) {
        if (r) {
            if (typeof (r[cmd]) == "function") {
                r[cmd].call(el || r[cmd], msg, e);
            } else {
                r[cmd] = msg;
            }
        }
    };
    $.fn.handleServerEvents = function (opt) {
        $.ss.eventSource = this[0];
        $.ss.eventOptions = opt = opt || {};
        if (opt.handlers) {
            $.extend($.ss.handlers, opt.handlers || {});
        }
        function onMessage(e) {
            var parts = $.ss.splitOnFirst(e.data, ' ');
            var selector = parts[0];
            var selParts = $.ss.splitOnFirst(selector, '@');
            if (selParts.length > 1) {
                e.channel = selParts[0];
                selector = selParts[1];
            }
            var json = parts[1];
            var msg = json ? JSON.parse(json) : null;

            parts = $.ss.splitOnFirst(selector, '.');
            if (parts.length <= 1)
                throw "invalid selector format: " + selector;

            var op = parts[0],
                target = parts[1].replace(new RegExp("%20", 'g'), " ");

            if (opt.validate && opt.validate(op, target, msg, json) === false)
                return;

            var tokens = $.ss.splitOnFirst(target, '$'),
                cmd = tokens[0], cssSel = tokens[1],
                $els = cssSel && $(cssSel), el = $els && $els[0];

            $.extend(e, { cmd: cmd, op: op, selector: selector, target: target, cssSelector: cssSel, json: json });
            if (op === "cmd") {
                if (cmd === "onConnect") {
                    $.extend(opt, msg);
                    if (opt.heartbeatUrl) {
                        if (opt.heartbeat) {
                            window.clearInterval(opt.heartbeat);
                        }
                        opt.heartbeat = window.setInterval(function () {
                            if ($.ss.eventSource.readyState === 2) //CLOSED
                            {
                                window.clearInterval(opt.heartbeat);
                                var stopFn = $.ss.handlers["onStop"];
                                if (stopFn != null)
                                    stopFn.apply($.ss.eventSource);
                                $.ss.reconnectServerEventsAuth({ errorArgs: { error:'CLOSED' } });
                                return;
                            }
                            $.ajax({
                                type: "POST",
                                url: opt.heartbeatUrl,
                                data: null,
                                dataType: "text",
                                success: function (r) { },
                                error: function () {
                                    $.ss.reconnectServerEventsAuth({ errorArgs: arguments });
                                }
                            });
                        }, parseInt(opt.heartbeatIntervalMs) || 10000);
                    }
                    if (opt.unRegisterUrl) {
                        $(window).on("unload", function () {
                            $.post(opt.unRegisterUrl, null, function (r) { });
                        });
                    }
                    $.ss.updateSubscriberUrl = opt.updateSubscriberUrl;
                    $.ss.updateChannels((opt.channels || "").split(','));
                }
                var fn = $.ss.handlers[cmd];
                if (fn) {
                    fn.call(el || document.body, msg, e);
                }
            }
            else if (op === "trigger") {
                $(el || document).trigger(cmd, [msg, e]);
            }
            else if (op === "css") {
                $($els || document.body).css(cmd, msg, e);
            }
            else {
                var r = opt.receivers && opt.receivers[op] || $.ss.eventReceivers[op];
                $.ss.invokeReceiver(r, cmd, el, msg, e, op);
            }

            var fn = $.ss.handlers["onMessage"];
            if (fn) fn.cal(el || document.body, msg, e);

            if (opt.success) opt.success(selector, msg, e); //deprecated
        }

        $.ss.eventSource.onmessage = onMessage;

        var hold = $.ss.eventSource.onerror;
        $.ss.eventSource.onerror = function () {
            var args = arguments;
            if (!$.ss.eventSourceStop) {
                window.setTimeout(function () {
                    $.ss.reconnectServerEventsAuth({ errorArgs: args });
                    if (hold)
                        hold.apply(args);
                }, 10000);
            }
        };
    };
});
var EbServerEvents = function (options) {
    this.rTok = options.Rtoken || getrToken();
    this.ServerEventUrl = options.ServerEventUrl;
    this.Channels = options.Channels.join();
    this.Url = this.ServerEventUrl + "/event-stream?channels=" + this.Channels + "&t=" + new Date().getTime();
    this.sEvent = $.ss;

    this.onUploadSuccess = function (m, e) { };
    this.onShowMsg = function (m, e) { };
    this.onLogOut = function (m, e) { };
    this.onNotification = function (m, e) { };
    this.onExcelExportSuccess = function (m, e) { };

    this.onConnect = function (sub) {
        //console.log("You've connected! welcome " + sub.displayName);
        if (sub) {
            window.ebcontext.subscription_id = sub.id;
        }
    };

    this.onJoin = function (user) {
        //console.log("Welcome, " + user.displayName);
    };

    this.onLeave = function (user) {
        //console.log(user.displayName + " has left the building");
    };

    this.onHeartbeat = function (msg, e) {
        //if (console) console.log("onHeartbeat", msg, e);
    };

    this.onUploaded = function (m, e) {
        this.onUploadSuccess(m,e);
    };

    this.onMsgSuccess = function (m, e) {
        //console.log(m);
        this.onShowMsg(m, e);
    };

    this.onLogOutMsg = function (m, e) {
        //console.log(m);
        location.href = "../Tenantuser/Logout";
        this.onLogOut(m, e);
    };

    this.onNotifyMsg = function (m, e) {
        //console.log("Notification");
        this.onNotification(m, e);
    };

    this.stopListening = function () {
        this.ES.close();
        this.sEvent.eventSourceStop = true;
        //console.log("stopped listening");
    };

    this.onExportToExcel = function (m, e) {
        this.onExcelExportSuccess(m);
    };

    this.ES = new EventSourcePolyfill(this.Url, {
        headers: {
            'Authorization': 'Bearer ' + this.rTok,
        }
    });   

    this.ES.addEventListener('error', function (e) {
        console.log("ERROR!", e);
    }, false);

    this.sEvent.eventReceivers = { "document": document }; 

    $(document).bindHandlers({
        announce: function (msg) {
            console.log("announce");
        },
        toggle: function () {
            console.log("toggle");
        },
        removeReceiver: function (name) {
            delete $.ss.eventReceivers[name];
        },
        addReceiver: function (name) {
            this.sEvent.eventReceivers[name] = window[name];
        },
        startListening: function () {
            this.sEvent.reconnectServerEventsAuth();
        }
    }).on('customEvent', function (e, msg, msgEvent) {
        console.log("custom");
    });

    $(this.ES).handleServerEvents({
        handlers: {
            onConnect: this.onConnect.bind(this),
            onJoin: this.onJoin.bind(this),
            onLeave: this.onLeave.bind(this),
            onHeartbeat: this.onHeartbeat.bind(this),
            onUploadSuccess: this.onUploaded.bind(this),
            stopListening: this.stopListening.bind(this),
            onExportToExcel: this.onExportToExcel.bind(this),
            onMsgSuccess: this.onMsgSuccess.bind(this),
            onLogOut: this.onLogOutMsg.bind(this),
            onNotification: this.onNotifyMsg.bind(this)
        }
    });
};
/*! offline-js 0.7.13 */
(function () { var a, b, c, d, e, f, g; d = function (a, b) { var c, d, e, f; e = []; for (d in b.prototype) try { f = b.prototype[d], null == a[d] && "function" != typeof f ? e.push(a[d] = f) : e.push(void 0) } catch (g) { c = g } return e }, a = {}, null == a.options && (a.options = {}), c = { checks: { xhr: { url: function () { return "/favicon.ico?_=" + Math.floor(1e9 * Math.random()) }, timeout: 5e3 }, image: { url: function () { return "/favicon.ico?_=" + Math.floor(1e9 * Math.random()) } }, active: "xhr" }, checkOnLoad: !1, interceptRequests: !0, reconnect: !0 }, e = function (a, b) { var c, d, e, f, g, h; for (c = a, h = b.split("."), d = e = 0, f = h.length; f > e && (g = h[d], c = c[g], "object" == typeof c); d = ++e); return d === h.length - 1 ? c : void 0 }, a.getOption = function (b) { var d, f; return f = null != (d = e(a.options, b)) ? d : e(c, b), "function" == typeof f ? f() : f }, "function" == typeof window.addEventListener && window.addEventListener("online", function () { return setTimeout(a.confirmUp, 100) }, !1), "function" == typeof window.addEventListener && window.addEventListener("offline", function () { return a.confirmDown() }, !1), a.state = "up", a.markUp = function () { return a.trigger("confirmed-up"), "up" !== a.state ? (a.state = "up", a.trigger("up")) : void 0 }, a.markDown = function () { return a.trigger("confirmed-down"), "down" !== a.state ? (a.state = "down", a.trigger("down")) : void 0 }, f = {}, a.on = function (b, c, d) { var e, g, h, i, j; if (g = b.split(" "), g.length > 1) { for (j = [], h = 0, i = g.length; i > h; h++)e = g[h], j.push(a.on(e, c, d)); return j } return null == f[b] && (f[b] = []), f[b].push([d, c]) }, a.off = function (a, b) { var c, d, e, g, h; if (null != f[a]) { if (b) { for (e = 0, h = []; e < f[a].length;)g = f[a][e], d = g[0], c = g[1], c === b ? h.push(f[a].splice(e, 1)) : h.push(e++); return h } return f[a] = [] } }, a.trigger = function (a) { var b, c, d, e, g, h, i; if (null != f[a]) { for (g = f[a], i = [], d = 0, e = g.length; e > d; d++)h = g[d], b = h[0], c = h[1], i.push(c.call(b)); return i } }, b = function (a, b, c) { var d, e, f, g, h; return h = function () { return a.status && a.status < 12e3 ? b() : c() }, null === a.onprogress ? (d = a.onerror, a.onerror = function () { return c(), "function" == typeof d ? d.apply(null, arguments) : void 0 }, g = a.ontimeout, a.ontimeout = function () { return c(), "function" == typeof g ? g.apply(null, arguments) : void 0 }, e = a.onload, a.onload = function () { return h(), "function" == typeof e ? e.apply(null, arguments) : void 0 }) : (f = a.onreadystatechange, a.onreadystatechange = function () { return 4 === a.readyState ? h() : 0 === a.readyState && c(), "function" == typeof f ? f.apply(null, arguments) : void 0 }) }, a.checks = {}, a.checks.xhr = function () { var c, d; d = new XMLHttpRequest, d.offline = !1, d.open("HEAD", a.getOption("checks.xhr.url"), !0), null != d.timeout && (d.timeout = a.getOption("checks.xhr.timeout")), b(d, a.markUp, a.markDown); try { d.send() } catch (e) { c = e, a.markDown() } return d }, a.checks.image = function () { var b; return b = document.createElement("img"), b.onerror = a.markDown, b.onload = a.markUp, void (b.src = a.getOption("checks.image.url")) }, a.checks.down = a.markDown, a.checks.up = a.markUp, a.check = function () { return a.trigger("checking"), a.checks[a.getOption("checks.active")]() }, a.confirmUp = a.confirmDown = a.check, a.onXHR = function (a) { var b, c, e; return e = function (b, c) { var d; return d = b.open, b.open = function (e, f, g, h, i) { return a({ type: e, url: f, async: g, flags: c, user: h, password: i, xhr: b }), d.apply(b, arguments) } }, c = window.XMLHttpRequest, window.XMLHttpRequest = function (a) { var b, d, f; return f = new c(a), e(f, a), d = f.setRequestHeader, f.headers = {}, f.setRequestHeader = function (a, b) { return f.headers[a] = b, d.call(f, a, b) }, b = f.overrideMimeType, f.overrideMimeType = function (a) { return f.mimeType = a, b.call(f, a) }, f }, d(window.XMLHttpRequest, c), null != window.XDomainRequest ? (b = window.XDomainRequest, window.XDomainRequest = function () { var a; return a = new b, e(a), a }, d(window.XDomainRequest, b)) : void 0 }, g = function () { return a.getOption("interceptRequests") && a.onXHR(function (c) { var d; return d = c.xhr, d.offline !== !1 ? b(d, a.markUp, a.confirmDown) : void 0 }), a.getOption("checkOnLoad") ? a.check() : void 0 }, setTimeout(g, 0), window.Offline = a }).call(this), function () { var a, b, c, d, e, f, g, h, i; if (!window.Offline) throw new Error("Offline Reconnect brought in without offline.js"); d = Offline.reconnect = {}, f = null, e = function () { var a; return null != d.state && "inactive" !== d.state && Offline.trigger("reconnect:stopped"), d.state = "inactive", d.remaining = d.delay = null != (a = Offline.getOption("reconnect.initialDelay")) ? a : 3 }, b = function () { var a, b; return a = null != (b = Offline.getOption("reconnect.delay")) ? b : Math.min(Math.ceil(1.5 * d.delay), 3600), d.remaining = d.delay = a }, g = function () { return "connecting" !== d.state ? (d.remaining -= 1, Offline.trigger("reconnect:tick"), 0 === d.remaining ? h() : void 0) : void 0 }, h = function () { return "waiting" === d.state ? (Offline.trigger("reconnect:connecting"), d.state = "connecting", Offline.check()) : void 0 }, a = function () { return Offline.getOption("reconnect") ? (e(), d.state = "waiting", Offline.trigger("reconnect:started"), f = setInterval(g, 1e3)) : void 0 }, i = function () { return null != f && clearInterval(f), e() }, c = function () { return Offline.getOption("reconnect") && "connecting" === d.state ? (Offline.trigger("reconnect:failure"), d.state = "waiting", b()) : void 0 }, d.tryNow = h, e(), Offline.on("down", a), Offline.on("confirmed-down", c), Offline.on("up", i) }.call(this), function () { var a, b, c, d, e, f; if (!window.Offline) throw new Error("Requests module brought in without offline.js"); c = [], f = !1, d = function (a) { return Offline.trigger("requests:capture"), "down" !== Offline.state && (f = !0), c.push(a) }, e = function (a) { var b, c, d, e, f, g, h, i, j; j = a.xhr, g = a.url, f = a.type, h = a.user, d = a.password, b = a.body, j.abort(), j.open(f, g, !0, h, d), e = j.headers; for (c in e) i = e[c], j.setRequestHeader(c, i); return j.mimeType && j.overrideMimeType(j.mimeType), j.send(b) }, a = function () { return c = [] }, b = function () { var b, d, f, g, h, i; for (Offline.trigger("requests:flush"), h = {}, b = 0, f = c.length; f > b; b++)g = c[b], i = g.url.replace(/(\?|&)_=[0-9]+/, function (a, b) { return "?" === b ? b : "" }), h[g.type.toUpperCase() + " - " + i] = g; for (d in h) g = h[d], e(g); return a() }, setTimeout(function () { return Offline.getOption("requests") !== !1 ? (Offline.on("confirmed-up", function () { return f ? (f = !1, a()) : void 0 }), Offline.on("up", b), Offline.on("down", function () { return f = !1 }), Offline.onXHR(function (a) { var b, c, e, f, g; return g = a.xhr, e = a.async, g.offline !== !1 && (f = function () { return d(a) }, c = g.send, g.send = function (b) { return a.body = b, c.apply(g, arguments) }, e) ? null === g.onprogress ? (g.addEventListener("error", f, !1), g.addEventListener("timeout", f, !1)) : (b = g.onreadystatechange, g.onreadystatechange = function () { return 0 === g.readyState ? f() : 4 === g.readyState && (0 === g.status || g.status >= 12e3) && f(), "function" == typeof b ? b.apply(null, arguments) : void 0 }) : void 0 }), Offline.requests = { flush: b, clear: a }) : void 0 }, 0) }.call(this), function () { var a, b, c, d, e; if (!Offline) throw new Error("Offline simulate brought in without offline.js"); for (d = ["up", "down"], b = 0, c = d.length; c > b; b++)e = d[b], (document.querySelector("script[data-simulate='" + e + "']") || localStorage.OFFLINE_SIMULATE === e) && (null == Offline.options && (Offline.options = {}), null == (a = Offline.options).checks && (a.checks = {}), Offline.options.checks.active = e) }.call(this), function () { var a, b, c, d, e, f, g, h, i, j, k, l, m; if (!window.Offline) throw new Error("Offline UI brought in without offline.js"); b = '<div class="offline-ui"><div class="offline-ui-content"></div></div>', a = '<a href class="offline-ui-retry"></a>', f = function (a) { var b; return b = document.createElement("div"), b.innerHTML = a, b.children[0] }, g = e = null, d = function (a) { return k(a), g.className += " " + a }, k = function (a) { return g.className = g.className.replace(new RegExp("(^| )" + a.split(" ").join("|") + "( |$)", "gi"), " ") }, i = {}, h = function (a, b) { return d(a), null != i[a] && clearTimeout(i[a]), i[a] = setTimeout(function () { return k(a), delete i[a] }, 1e3 * b) }, m = function (a) { var b, c, d, e; d = { day: 86400, hour: 3600, minute: 60, second: 1 }; for (c in d) if (b = d[c], a >= b) return e = Math.floor(a / b), [e, c]; return ["now", ""] }, l = function () { var c, h; return g = f(b), document.body.appendChild(g), null != Offline.reconnect && Offline.getOption("reconnect") && (g.appendChild(f(a)), c = g.querySelector(".offline-ui-retry"), h = function (a) { return a.preventDefault(), Offline.reconnect.tryNow() }, null != c.addEventListener ? c.addEventListener("click", h, !1) : c.attachEvent("click", h)), d("offline-ui-" + Offline.state), e = g.querySelector(".offline-ui-content") }, j = function () { return l(), Offline.on("up", function () { return k("offline-ui-down"), d("offline-ui-up"), h("offline-ui-up-2s", 2), h("offline-ui-up-5s", 5) }), Offline.on("down", function () { return k("offline-ui-up"), d("offline-ui-down"), h("offline-ui-down-2s", 2), h("offline-ui-down-5s", 5) }), Offline.on("reconnect:connecting", function () { return d("offline-ui-connecting"), k("offline-ui-waiting") }), Offline.on("reconnect:tick", function () { var a, b, c; return d("offline-ui-waiting"), k("offline-ui-connecting"), a = m(Offline.reconnect.remaining), b = a[0], c = a[1], e.setAttribute("data-retry-in-value", b), e.setAttribute("data-retry-in-unit", c) }), Offline.on("reconnect:stopped", function () { return k("offline-ui-connecting offline-ui-waiting"), e.setAttribute("data-retry-in-value", null), e.setAttribute("data-retry-in-unit", null) }), Offline.on("reconnect:failure", function () { return h("offline-ui-reconnect-failed-2s", 2), h("offline-ui-reconnect-failed-5s", 5) }), Offline.on("reconnect:success", function () { return h("offline-ui-reconnect-succeeded-2s", 2), h("offline-ui-reconnect-succeeded-5s", 5) }) }, "complete" === document.readyState ? j() : null != document.addEventListener ? document.addEventListener("DOMContentLoaded", j, !1) : (c = document.onreadystatechange, document.onreadystatechange = function () { return "complete" === document.readyState && j(), "function" == typeof c ? c.apply(null, arguments) : void 0 }) }.call(this);
(function ($) {
    if ($.fn.style) {
        return;
    }

    // Escape regex chars with \
    var escape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    // For those who need them (< IE 9), add support for CSS functions
    var isStyleFuncSupported = !!CSSStyleDeclaration.prototype.getPropertyValue;
    if (!isStyleFuncSupported) {
        CSSStyleDeclaration.prototype.getPropertyValue = function (a) {
            return this.getAttribute(a);
        };
        CSSStyleDeclaration.prototype.setProperty = function (styleName, value, priority) {
            this.setAttribute(styleName, value);
            var priority = typeof priority != 'undefined' ? priority : '';
            if (priority != '') {
                // Add priority manually
                var rule = new RegExp(escape(styleName) + '\\s*:\\s*' + escape(value) +
                    '(\\s*;)?', 'gmi');
                this.cssText =
                    this.cssText.replace(rule, styleName + ': ' + value + ' !' + priority + ';');
            }
        };
        CSSStyleDeclaration.prototype.removeProperty = function (a) {
            return this.removeAttribute(a);
        };
        CSSStyleDeclaration.prototype.getPropertyPriority = function (styleName) {
            var rule = new RegExp(escape(styleName) + '\\s*:\\s*[^\\s]*\\s*!important(\\s*;)?',
                'gmi');
            return rule.test(this.cssText) ? 'important' : '';
        }
    }

    // The style function
    $.fn.style = function (styleName, value, priority) {
        // DOM node
        var node = this.get(0);
        // Ensure we have a DOM node
        if (typeof node == 'undefined') {
            return this;
        }
        // CSSStyleDeclaration
        var style = this.get(0).style;
        // Getter/Setter
        if (typeof styleName != 'undefined') {
            if (typeof value != 'undefined') {
                // Set style property
                priority = typeof priority != 'undefined' ? priority : '';
                style.setProperty(styleName, value, priority);
                return this;
            } else {
                // Get style property
                return style.getPropertyValue(styleName);
            }
        } else {
            // Get CSSStyleDeclaration
            return style;
        }
    };
})(jQuery);

console.eb_log = function (msg, color = "rgb(19, 0, 78)", bgcolor) {
    console.log(`%c${msg}`, `color:${color};
            padding:1px 2px;
            border-radius:2px;
            text-shadow: 1px 1px 1px #eef;`);

};

console.dev_log = function (msg) {
    if (ebcontext.env === "Development")
        console.log(msg);
};

console.eb_error = function (msg, color = "rgb(222, 0, 0)", bgcolor) {
    console.log(`%c${msg}`, `color:${color};
            padding:1px 2px;
            border-radius:2px;
            text-shadow: 1px 1px 1px #eef;`);
};

console.eb_info = function (msg, color = "#0060de", bgcolor) {
    console.log(`%c${msg}`, `color:${color};
            padding:1px 2px;
            border-radius:2px;
            text-shadow: 1px 1px 1px #eef;`);
};

console.eb_warn = function (msg, color = "rgb(222, 112, 0)", bgcolor) {
    console.log(`%c${msg}`, `color:${color};
            padding:1px 2px;
            border-radius:2px;
            text-shadow: 1px 1px 1px #eef;`);
};

function GetObjectById(id) {
    if (id === 18)
        return { Name: "BotForm", Image: "chat1" };
    if (id === 17)
        return { Name: "ChartVisualization", Image: "fa fa-bar-chart" };
    if (id === 2)
        return { Name: "DataSource", Image: "fa fa-database.svg" };
    if (id === 3)
        return { Name: "Report", Image: "fa fa-file-pdf-o" };
    if (id === 16)
        return { Name: "TableVisualization", Image: "fa fa-table" };
    if (id === 14)
        return { Name: "UserControl", Image: "form1" };
    if (id === 0)
        return { Name: "WebForm", Image: "fa fa-wpforms" };
};

function beforeSendXhr(xhr) {
    var b = document.cookie.match('(^|;)\\s*bToken\\s*=\\s*([^;]+)');
    var tok = b ? b.pop() : '';
    if (isJwtTokExpired(tok)) {
        var x = new XMLHttpRequest();
        x.open("POST", "http://localhost:8000/access-token", false);
        x.send({ refreshtoken: getrToken() });
        if (x.status === 200)
            tok = JSON.parse(x.responseText).accessToken;
    }
    xhr.setRequestHeader("Authorization", "Bearer " + tok);
}

function getToken() {
    var b = document.cookie.match('(^|;)\\s*bToken\\s*=\\s*([^;]+)');
    var tok = b ? b.pop() : '';
    if (isJwtTokExpired(tok)) {
        $.ajax({
            type: "POST",
            url: "http://localhost:8000/access-token",
            data: { refreshtoken: getrToken() },
            success: function (d) {
                document.cookie = "bToken=" + d.accessToken
            }
        });
    }
    else
        return tok;
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}

function isJwtTokExpired(token) {
    return (parseJwt(token).exp < Date.now() / 1000);
}

function getrToken() {
    var b = document.cookie.match('(^|;)\\s*rToken\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

function getTok() {
    return getCookieVal("bToken");
}

function getCookieVal(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

var Agginfo = function (col, deci, index) {
    this.colname = col;
    this.deci_val = deci;
    this.data = index;
};

function fltr_obj(type, name, value) {
    this.Type = type;
    this.Name = name;
    this.Value = value;
};

var filter_obj = function (colu, oper, valu, typ) {
    this.Column = colu;
    this.Operator = oper;
    this.Value = valu;
    this.Type = typ;
};

var order_obj = function (colu, dir) {
    this.Column = colu;
    this.Direction = dir;
};


Array.prototype.contains = function (element) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === element) {
            return true;
        }
    }

    return false;
};

Array.prototype.moveToFirst = function (index) {
    var temp = this[index];
    this.splice(index, 1);
    this.unshift(temp);
};

Array.prototype.swap = function (x, y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
}
//Array.prototype.splice = function (startIdx, noOfEleRet) {
//    var arr = [];
//    for (var i = startIdx; i < (startIdx+noOfEleRet); i++) {
//        arr.push(this[i]);
//    }

//    return arr;
//};

function isPrintable(e) {
    var keycode = e.keyCode;

    var valid =
        (keycode > 47 && keycode < 58) || // number keys
        keycode === 32 || keycode === 13 || // spacebar & return key(s) (if you want to allow carriage returns)
        (keycode > 64 && keycode < 91) || // letter keys
        (keycode > 95 && keycode < 112) || // numpad keys
        (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
        (keycode > 218 && keycode < 223);   // [\]' (in order)

    return valid;
}

function getEbObjectTypes() {
    Eb_ObjectTypes = {
        WebForm: { Id: 0, ImgSrc: "fa fa-wpforms" },
        DisplayBlock: { Id: 1, ImgSrc: "form1.svg" },
        DataSource: { Id: 2, ImgSrc: "fa fa-database" },
        Report: { Id: 3, ImgSrc: "fa fa-file-pdf-o" },
        Table: { Id: 4, ImgSrc: "fa fa-table" },
        SqlFunction: { Id: 5, ImgSrc: "form1.svg" },
        SqlValidator: { Id: 6, ImgSrc: "form1.svg" },
        JavascriptFunction: { Id: 7, ImgSrc: "form1.svg" },
        JavascriptValidator: { Id: 8, ImgSrc: "form1.svg" },
        DataVisualization: { Id: 11, ImgSrc: "dv1.svg" },
        FilterDialog: { Id: 12, ImgSrc: "fa fa-filter" },
        MobileForm: { Id: 13, ImgSrc: "form1.svg" },
        UserControl: { Id: 14, ImgSrc: "form1.svg" },
        EmailBuilder: { Id: 15, ImgSrc: "fa fa-envelope-o" },
        TableVisualization: { Id: 16, ImgSrc: "fa fa-table" },
        ChartVisualization: { Id: 17, ImgSrc: "fa fa-bar-chart" },
        BotForm: { Id: 18, ImgSrc: "chat1.svg" },
    }
    return Eb_ObjectTypes;
}

function EbAddInvalidStyle(msg, type) {
    if (this.ObjType === "PowerSelect" && !this.RenderAsSimpleSelect)
        EbMakeInvalid(`#${this.EbSid_CtxId}Container`, `#${this.EbSid_CtxId}Wraper`, msg, type);
    else
        EbMakeInvalid(`#cont_${this.EbSid_CtxId}`, `.ctrl-cover`, msg, type);
}

function EbRemoveInvalidStyle() {
    EbMakeValid(`#cont_${this.EbSid_CtxId}`, `.ctrl-cover`);
}

function DGaddInvalidStyle(msg, type) {
    EbMakeInvalid(`#td_${this.EbSid_CtxId}`, `.ctrl-cover`, msg, type);
}

function DGremoveInvalidStyle() {
    EbMakeValid(`#td_${this.EbSid_CtxId}`, `.ctrl-cover`);
}


function EbMakeInvalid(contSel, _ctrlCont, msg = "This field is required", type = "danger") {
    let shadowColor = "#ee0000b8";
    if (type === "warning")
        shadowColor = "rgb(236, 151, 31)";
    if ($(`${contSel} .req-cont`).length !== 0)
        return;
    //var $ctrlCont = (this.curForm.renderAsForm) ? $(`${contSel}  .ctrl-wraper`) : $(`${contSel} .chat-ctrl-cont`);
    let $ctrlCont = $(`${contSel}  ${_ctrlCont}:first`);
    $ctrlCont.after(`<div class="req-cont"><label id='@name@errormsg' class='text-${type}'></label></div>`);
    $ctrlCont.css("box-shadow", `0 0 3px 1px ${shadowColor}`).siblings("[name=ctrlsend]").css('disabled', true);
    $(`${contSel}  .text-${type}`).text(msg).hide().slideDown(100);
}

function EbMakeValid(contSel, _ctrlCont) {
    //setTimeout(function () {
    $(`${contSel}  ${_ctrlCont}:first`).css("box-shadow", "inherit").siblings("[name=ctrlsend]").css('disabled', false);
    $(`${contSel} .req-cont:first`).animate({ opacity: "0" }, 300).remove();
    //},400);
}


function EbShowCtrlMsg(contSel, _ctrlCont, msg = "This field is required", type = "danger") {
    if ($(`${contSel} .ctrl-info-msg-cont`).length !== 0)
        return;
    //var $ctrlCont = (this.curForm.renderAsForm) ? $(`${contSel}  .ctrl-wraper`) : $(`${contSel} .chat-ctrl-cont`);
    let $ctrlCont = $(`${contSel}  ${_ctrlCont}:first`);
    $ctrlCont.after(`<div class="ctrl-info-msg-cont"><label id='@name@errormsg' class='text-${type}'></label></div>`);
    $(`${contSel}  .text-${type}`).text(msg).hide().slideDown(100);
}

function EbHideCtrlMsg(contSel, _ctrlCont) {
    //setTimeout(function () {
    $(`${contSel} .ctrl-info-msg-cont:first`).animate({ opacity: "0" }, 300).remove();
    //},400);
}

function sortByProp(arr, prop) {

    arr.sort(function (a, b) {
        if (a[prop] < b[prop])
            return -1;
        if (a[prop] > b[prop])
            return 1;
        return 0;
    });
    return arr;
};


var EbStickButton = function (option) {
    this.label = option.label;
    this.icon = option.icon || "fa-wrench";
    this.$stickBtn = $(`<div class='stickBtn'><i class='fa ${this.icon}' aria-hidden='true'></i> ${this.label} </div>`);
    this.$wraper = option.$wraper;
    this.$extCont = option.$extCont || this.$wraper.parent();
    this.delay = option.delay || 300;
    this.dir = option.dir || "right";
    this.$scope = option.$scope || $(document.body)
    this.pgtop = option.btnTop || (this.$wraper.offset().top - $(window).scrollTop());
    this.style = option.style;
    $(this.$scope).append(this.$stickBtn);

    this.toggleStickButton = function () {

        if (this.$stickBtn.css("display") === "none")
            this.maximise();
        else
            this.minimise();
    };

    this.maximise = function () {
        this.$stickBtn.hide(this.delay);
        this.$extCont.show(this.delay);
        //this.$extCont.show().animate({ width: this.extWidth, opacity: 1 }, this.delay);
    };

    this.minimise = function () {
        //this.extWidth = this.$extCont.width();
        this.$stickBtn.show(this.delay);
        this.$extCont.hide(this.delay);
        //this.$extCont.animate({ width: 0 , opacity:0}, this.delay, function () { $(this).hide() });


        setTimeout(function () {
            this.$stickBtn.css("top", (this.pgtop + (this.$stickBtn.width() / 2)) + "px");
            if (this.style)
                this.$stickBtn.css(this.style);
            this.$stickBtn.css(this.dir, (0 - (this.$stickBtn.width() / 2)) + "px");
        }.bind(this), this.delay + 1);
    }

    this.hide = function () {
        this.minimise();
        setTimeout(function () {
            this.$stickBtn.hide();
        }.bind(this), this.delay + 1);
    }
    this.$stickBtn.on("click", this.maximise.bind(this));
};

function getSum(_array) {
    return _array.reduce(function (a, b) {
        if (typeof a === 'string') {
            a = a.replace(/[^\d.-]/g, '') * 1;
        }
        if (typeof b === 'string') {
            b = b.replace(/[^\d.-]/g, '') * 1;
        }

        return parseInt(a) + parseInt(b);
    });
}

function getAverage(_array) {
    return getSum(_array) / _array.length;
}

function gettypefromNumber(num) {
    if (num == 16)
        return "String";
    else if (num == 6 || num == 5)
        return "DateTime";
    else if (num == 3)
        return "Boolean";
    else if (num == 8 || num == 7 || num == 11 || num == 12)
        return "Numeric";
}

function gettypefromString(str) {
    if (str == "String")
        return "16";
    else if (str == "DateTime")
        return "6";
    else if (str == "Boolean")
        return "3";
    else if (str == "Int32")
        return "11";
    else if (str == "Decimal")
        return "7";
    else if (str == "Double")
        return "8";
    else if (str == "Numeric")
        return "12";
    else if (str == "Date")
        return "5";
}

function JsonToEbControls(ctrlsContainer) {
    $.each(ctrlsContainer.Controls.$values, function (i, obj) {
        if (obj.IsContainer) {
            JsonToEbControls(obj);
        }
        else
            ctrlsContainer.Controls.$values[i] = new ControlOps[obj.ObjType](obj);
    });
};

function getControlsUnderTable(container, tableName) {
    let coll = [];
    RecurGetControlsUnderTable(container, coll, tableName);
    return coll;

}

function RecurGetControlsUnderTable(src_obj, dest_coll, tableName) {
    $.each(src_obj.Controls.$values, function (i, obj) {
        if (obj.IsContainer) {
            RecurGetControlsUnderTable(obj, dest_coll, tableName);

        }
        else if (src_obj.TableName === tableName && !src_obj.IsSpecialContainer)
            dest_coll.push(obj);
    });
}

//function getTableNames(container, dest_coll) {
//    let tableNames = [];
//    if (container.TableName)
//    dest_coll.push(container.TableName);
//    recurGetTableNames(container, tableNames);
//    return tableNames;
//}

//function recurGetTableNames(container, dest_coll) {
//    for (let i = 0; i < container.Controls.$values.length; i++) {
//        let ctrl = container.Controls[i];
//        if (ctrl.IsContainer) {
//            if (ctrl.IsSpecialContainer)
//                continue;
//            else {
//                dest_coll.push(container.TableName);
//                recurGetTableNames(container, dest_coll);
//            }
//        }
//        else
//            return;
//    }
//}

function getFlatContControls(formObj) {
    let coll = [];
    if (formObj.IsContainer)
        coll.push(formObj);

    RecurFlatContControls(formObj, coll);
    return coll;
}


function getInnerFlatContControls(formObj) {
    let coll = [];

    RecurFlatContControls(formObj, coll);
    return coll;
}

function RecurFlatContControls(src_obj, dest_coll) {
    $.each(src_obj.Controls.$values, function (i, obj) {
        if (obj.IsContainer) {
            dest_coll.push(obj);
            RecurFlatContControls(obj, dest_coll);
        }
    });
}


function getAllctrlsFrom(formObj) {
    let coll = [];
    coll.push(formObj);
    RecurgetAllctrlsFrom(formObj, coll);
    return coll;
}

function RecurgetAllctrlsFrom(src_obj, dest_coll) {
    $.each(src_obj.Controls.$values, function (i, obj) {
        dest_coll.push(obj);
        if (obj.IsContainer) {
            RecurgetAllctrlsFrom(obj, dest_coll);
        }
    });
}

function getFlatCtrlObjs(formObj) {
    let coll = [];
    RecurFlatCtrlObjs(formObj, coll);
    return coll;
}

function RecurFlatCtrlObjs(src_obj, dest_coll) {
    $.each(src_obj.Controls.$values, function (i, obj) {
        if (obj.IsSpecialContainer)
            return true;
        if (obj.IsContainer)
            RecurFlatCtrlObjs(obj, dest_coll);
        else
            dest_coll.push(obj);
    });
}


function getFlatControls(formObj) {
    let coll = [];
    RecurFlatControls(formObj, coll);
    return coll;
}

function RecurFlatControls(src_obj, dest_coll) {
    $.each(src_obj.Controls.$values, function (i, obj) {
        dest_coll.push(obj);
        if (obj.IsContainer) {
            RecurFlatControls(obj, dest_coll);
        }
    });
}

function getValsFromForm(formObj) {
    let fltr_collection = [];
    let flag = 1;
    $.each(getFlatCtrlObjs(formObj), function (i, obj) {
        if (obj.ObjType === "FileUploader")
            return;
        fltr_collection.push(new fltr_obj(obj.EbDbType, obj.Name, obj.getValue()));
        //if (obj.ObjType === "PowerSelect")
        //    flag++;
    });
    if (flag > 0) {
        var temp = $.grep(fltr_collection, function (obj) { return obj.Name === "eb_loc_id"; });
        if (temp.length === 0)
            fltr_collection.push(new fltr_obj(11, "eb_loc_id", store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId)));
        temp = $.grep(fltr_collection, function (obj) { return obj.Name === "eb_currentuser_id"; });
        if (temp.length === 0)
            fltr_collection.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
    }

    return fltr_collection;
}

function isNaNOrEmpty(val) {
    return (typeof val === "number" && isNaN(val)) || (typeof val === "string" && val.trim() === "");
};

function getFlatContObjsOfType(ContObj, type) {
    let ctrls = [];
    let flat = getFlatContControls(ContObj);
    $.each(flat, function (i, ctrl) {
        if (ctrl.ObjType === type)
            ctrls.push(ctrl);
    });
    return ctrls;
}

function getFlatObjOfTypes(ContObj, typesArr) {
    let ctrls = [];
    let flat = getFlatControls(ContObj);
    $.each(flat, function (i, ctrl) {
        if (typesArr.contains(ctrl.ObjType))
            ctrls.push(ctrl);
    });
    return ctrls;
}

function getFlatObjOfType(ContObj, type) {
    let ctrls = [];
    let flat = getFlatControls(ContObj);
    $.each(flat, function (i, ctrl) {
        if (ctrl.ObjType === type)
            ctrls.push(ctrl);
    });
    return ctrls;
}

function getValsForViz(formObj) {
    let fltr_collection = [];
    $.each(getFlatControls(formObj), function (i, obj) {
        var value = obj.getValue();
        if (value == "" || value == null) {
            if (obj.EbDbType === 7 || obj.EbDbType === 8)
                value = 0;
            else if (obj.EbDbType === 16)
                value = "0";
        }
        if (obj.ObjType === "CalendarControl") {
            fltr_collection.push(new fltr_obj(obj.EbDbType, "datefrom", value.split(",")[0]));
            fltr_collection.push(new fltr_obj(obj.EbDbType, "dateto", value.split(",")[1]));
        }
        else
            fltr_collection.push(new fltr_obj(obj.EbDbType, obj.Name, value));
    });
    return fltr_collection;
}


function getSingleColumn(obj) {
    let SingleColumn = {};
    SingleColumn.Name = obj.Name;
    SingleColumn.Type = obj.EbDbType;
    SingleColumn.Value = "";
    //SingleColumn.ObjType = obj.ObjType;
    SingleColumn.D = "";
    SingleColumn.C = undefined;
    SingleColumn.R = [];
    obj.DataVals = SingleColumn;
    obj.curRowDataVals = $.extend(true, {}, SingleColumn);

    //SingleColumn.AutoIncrement = obj.AutoIncrement || false;
    return SingleColumn;
}

//JQuery extends
(function ($) {
    $.fn.closestInner = function (filter) {
        var $found = $(),
            $currentSet = this; // Current place
        while ($currentSet.length) {
            $found = $currentSet.filter(filter);
            if ($found.length) break;  // At least one match: break loop
            // Get all children of the current set
            $currentSet = $currentSet.children();
        }
        return $found.first(); // Return first match of the collection
    }
})(jQuery);

//JQuery extends ends

//Object.defineProperty(window, "store", {
//    get: function () {
//        let t = fromConsole();
//        return true;
//    },
//    set: function (val) {
//        _z = val;
//    }
//});

function Test() {
    var b = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImlwNCJ9.eyJpc3MiOiJzc2p3dCIsInN1YiI6ImViZGJsbHoyM25rcWQ2MjAxODAyMjAxMjAwMzA6YmluaXZhcmdoZXNlQGdtYWlsLmNvbTpkYyIsImlhdCI6MTU1OTEwNzQ5NCwiZXhwIjoxNTU5MTA3NTg0LCJlbWFpbCI6ImJpbml2YXJnaGVzZUBnbWFpbC5jb20iLCJjaWQiOiJlYmRibGx6MjNua3FkNjIwMTgwMjIwMTIwMDMwIiwidWlkIjo1LCJ3YyI6ImRjIn0.aD8kZxYN8ZGmoAA2EyxVzxfAPMyZXmg1NSiNzHaG6_I1frKVGqrFmJZHt0dPERabvx-mM-N5wtXuwRyJ1y8nZRLqvyyazaR4DLJlxRvievs14qLpAe7z6X_gAkR_-6KruEA6HP_-rAn53ImaIMs9fUnRb37K9djjU-caNCdYpDk`
    var r = `eyJ0eXAiOiJKV1RSIiwiYWxnIjoiUlMyNTYiLCJraWQiOiJpcDQifQ.eyJzdWIiOiJlYmRibGx6MjNua3FkNjIwMTgwMjIwMTIwMDMwOmJpbml2YXJnaGVzZUBnbWFpbC5jb206ZGMiLCJpYXQiOjE1NTkxMDcyNTIsImV4cCI6MTU1OTE5MzY1Mn0.C4yc6D_M4pnjh1xbroqmmgzZHE8r3kdTP_EBne2HiM7HCVkCDtcHpYEdJIicopHeEFORtcdmvnIKFKtuSgmTHIhlSRiTh3dIpyq4c4AnsR1BJnEPSAXhy8eOjrniogEdG6zjLNwDiS_rpC5248oizzgkUWGw9hd2E4RPwCS-oh8`;
    $.ajax({
        url: "/api/api_get_followup_by_lead/1.0.0/json",
        type: "POST",
        cache: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("bToken", b);
            xhr.setRequestHeader("rToken", r);
        },
        data: {
            "lead_id": 1,
        },
        success: function (result) {
            console.log(result);
        }.bind(this)
    });
}

function string2EBType(val, type) {
    if (typeof val !== "string")
        return val;
    let formatedVal = val;
    if (type === 7 || type === 8) {
        formatedVal = parseFloat(val);
    }
    else if (type === 10 || type === 11 || type === 12) {
        formatedVal = parseInt(val);
    }
    return formatedVal;
}

function EbConvertValue(val, type) {
    if (type === 11) {
        val = val.replace(/,/g, "");//  temporary fix
        return parseInt(val);
    }
    return val;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var default_colors = ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#3B3EAC', '#0099C6', '#DD4477', '#66AA00', '#B82E2E', '#316395', '#994499', '#22AA99', '#AAAA11', '#6633CC', '#E67300', '#8B0707', '#329262', '#5574A6', '#3B3EAC']

var datasetObj = function (label, data, backgroundColor, borderColor, fill) {
    this.label = label;
    this.data = data;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.fill = fill;
};

var datasetObj4Pie = function (label, data, backgroundColor, borderColor, fill) {
    this.label = label;
    this.data = data;
    var color = [], width = [];
    $.each(this.data, function (i, obj) {
        color.push(randomColor());
        width.push(1);
    });
    this.backgroundColor = color;
    this.borderColor = color;
    this.borderWidth = width;
};

var ChartColor = function (name, color) {
    this.Name = name;
    this.Color = color;
};

var animateObj = function (duration) {
    this.duration = duration;
    this.onComplete = function () {
        var chartInstance = this.chart,
            ctx = chartInstance.ctx;

        ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        this.data.datasets.forEach(function (dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
                var data = dataset.data[index];
                ctx.fillText(data, bar._model.x, bar._model.y - 5);
            });
        });
    };
}

var EbTags = function (settings) {
    this.displayFilterDialogArr = (typeof settings.displayFilterDialogArr !== "undefined") ? settings.displayFilterDialogArr : [];
    this.displayColumnSearchArr = (typeof settings.displayColumnSearchArr !== "undefined") ? settings.displayColumnSearchArr : [];
    this.id = $(settings.id);

    this.show = function () {
        this.id.empty();
        var filter = "";
        $.each(this.displayFilterDialogArr, function (i, ctrl) {
            filter = ctrl.title + " " + ctrl.operator + " " + ctrl.value;
            this.id.append(`<div class="tagstyle priorfilter">${filter}</div>`);
            if (ctrl.logicOp !== "")
                this.id.append(`<div class="tagstyle priorfilter">${ctrl.logicOp}</div>`);
        }.bind(this));

        if (this.displayFilterDialogArr.length > 0 && this.displayColumnSearchArr.length > 0)
            this.id.append(`<div class="tagstyle op">AND</div>`);

        $.each(this.displayColumnSearchArr, function (i, search) {
            filter = search.title + " " + returnOperator(search.operator.trim());
            filter += " " + search.value;
            this.id.append(`<div class="tagstyle" data-col="${search.name}" data-val="${search.value}">${filter} <i class="fa fa-close"></i></div>`);
            if (search.logicOp !== "")
                this.id.append(`<div class="tagstyle op">${search.logicOp}</div>`);
        }.bind(this));

        if (this.id.children().length === 0)
            this.id.hide();
        else {
            this.id.children().find(".fa-close").off("click").on("click", this.removeTag.bind(this));
            this.id.show();
        }
    };

    this.removeTag = function (e) {
        var tempcol = $(e.target).parent().attr("data-col");
        var tempval = $(e.target).parent().attr("data-val");
        var temp = $.grep(this.displayColumnSearchArr, function (obj) {
            if (typeof obj.value === "number")
                return obj.name === tempcol && obj.value === parseInt(tempval);
            else
                return obj.name === tempcol && obj.value === tempval;
        });
        $(e.target).parent().prev().remove();
        $(e.target).parent().remove();
        settings.remove(e, temp[0]);
    };

    this.show();
};

function dgOnChangeBind() {
    $.each(this.Controls.$values, function (i, col) {
        if ((col.OnChangeFn && col.OnChangeFn.Code && col.OnChangeFn.Code.trim() !== '') || col.DependedValExp.$values.length > 0) {
            let FnString = atob(col.OnChangeFn.Code) + (col.DependedValExp.$values.length !== 0 ? `;
                let curCtrl = form.__getCtrlByPath(this.__path);
                if(!curCtrl.___isNotUpdateValExpDepCtrls){
                    form.updateDependentControls(curCtrl)
                }
                curCtrl.___isNotUpdateValExpDepCtrls = false;

` : '');
            let OnChangeFn = new Function('form', 'user', `event`, FnString).bind(col, this.formObject, this.__userObject);

            col.bindOnChange({ form: this.formObject, col: col, DG: this, user: this.__userObject }, OnChangeFn);
        }
    }.bind(this));
}

function dgEBOnChangeBind() {
    $.each(this.Controls.$values, function (i, col) {// need change
        //        let FnString = `
        //let __this = form.__getCtrlByPath(this.__path);
        //if (__this.DataVals !== undefined) {
        //    let v = __this.getValueFromDOM();
        //    let d = __this.getDisplayMemberFromDOM();
        //    if (__this.ObjType === 'Numeric')
        //        v = parseFloat(v);
        //debugger;
        //    if (__this.__isEditing) {
        //        __this.curRowDataVals.Value = v;
        //        __this.curRowDataVals.D = d;
        //    }
        //    else {
        //        __this.DataVals.Value = v;
        //        __this.DataVals.D = d;
        //    }
        //}`;
        let OnChangeFn = function (form, user, event) {
            //let __this = form.__getCtrlByPath(this.__path);
            let __this = $(event.target).data('ctrl_ref');// when trigger change from setValue(if the setValue called from inactive row control)
            if (__this === undefined)
                __this = form.__getCtrlByPath(this.__path);

            if (__this.DataVals !== undefined) {
                let v = __this.getValueFromDOM();
                let d = __this.getDisplayMemberFromDOM();
                if (__this.ObjType === 'Numeric')
                    v = parseFloat(v);
                if (__this.__isEditing) {
                    __this.curRowDataVals.Value = v;
                    __this.curRowDataVals.D = d;
                }
                else {
                    __this.DataVals.Value = v;
                    __this.DataVals.D = d;

                    if ($(event.target).data('ctrl_ref'))// when trigger change from setValue(if the setValue called from inactive row control) update DG table td
                        ebUpdateDGTD($('#td_' + __this.EbSid_CtxId));
                }
            }
        }.bind(col, this.formObject, this.__userObject);

        //let OnChangeFn = new Function('form', 'user', `event`, FnString).bind(col, this.formObject, this.__userObject);

        col.bindOnChange({ form: this.formObject, col: col, DG: this, user: this.__userObject }, OnChangeFn);
    }.bind(this));


}

function justSetDate_EB(p1, p2) {
    if (this.IsNullable && p1 !== null)
        $('#' + this.EbSid_CtxId).siblings('.nullable-check').find('input[type=checkbox]').prop('checked', true);
    if (p1 !== null && p1 !== undefined) {
        if (this.ShowDateAs_ === 1 || this.ShowDateAs_ === 2) //month picker or year picker
            $('#' + this.EbSid_CtxId).val(p1);
        else if (this.EbDateType === 5) //Date
            $('#' + this.EbSid_CtxId).val(moment(p1, 'YYYY-MM-DD').format(ebcontext.user.Preference.ShortDatePattern));
        else if (this.EbDateType === 6) //DateTime
            $('#' + this.EbSid_CtxId).val(moment(p1, 'YYYY-MM-DD HH:mm:ss').format(ebcontext.user.Preference.ShortDatePattern + ' ' + ebcontext.user.Preference.ShortTimePattern));
        else if (this.EbDateType === 17) //Time
            $('#' + this.EbSid_CtxId).val(moment(p1, 'HH:mm:ss').format(ebcontext.user.Preference.ShortTimePattern));
        $('#' + this.EbSid_CtxId).trigger('change');
    }
    else
        $('#' + this.EbSid_CtxId).val('');
}

function setDate_EB(p1, p2) {
    justSetDate_EB.bind(this)(p1, p2);
    if (p1 !== null && p1 !== undefined) {
        $('#' + this.EbSid_CtxId).trigger('change');
    }
}

function removePropsOfType(Obj, type = "function") {
    for (var Key in Obj) {
        if (typeof Obj[Key] === type) {
            delete Obj[Key];
        }
    }
    return Obj;
}

function REFF_attachModalCellRef(MultipleTables) {
    let keys = Object.keys(MultipleTables);
    for (var i = 0; i < keys.length; i++) {
        let tableName = keys[i];
        let table = MultipleTables[tableName];

        for (var j = 0; j < table.length; j++) {
            let row = table[j];
            for (var k = 0; k < row.Columns.length; k++) {
                let SingleColumn = row.Columns[k];
                obj.DataVals = SingleColumn;
            }
        }
    }
}


function attachModalCellRef_form(container, dataModel) {
    $.each(container.Controls.$values, function (i, obj) {
        if (obj.IsSpecialContainer)
            return true;
        if (obj.IsContainer) {
            obj.TableName = (typeof obj.TableName === "string") ? obj.TableName.trim() : false;
            obj.TableName = obj.TableName || container.TableName;
            attachModalCellRef_form(obj, dataModel);
        }
        else {
            setSingleColumnRef(container.TableName, obj.Name, dataModel, obj);
        }
    });
}

function setSingleColumnRef(TableName, ctrlName, MultipleTables, obj) {
    if (MultipleTables.hasOwnProperty(TableName)) {
        let table = MultipleTables[TableName];
        for (var i = 0; i < table.length; i++) {
            let row = table[i];
            let SingleColumn = getObjByval(row.Columns, "Name", ctrlName);
            if (SingleColumn) {
                obj.DataVals = SingleColumn;
                return;
            }
        }
    }
}



//code review ......to hide dropdown on click outside dropdown
document.addEventListener("click", function (e) {


    let par_ebSid = "";
    let ebSid_CtxId = "";
    let container = "";
    //to check select click is on datagrid
    if (($(e.target).closest("[ebsid]").attr("ctype") == "DataGrid") || ($(document.activeElement).closest('[ebsid]').attr("ctype") == "DataGrid") || ($(e.target).closest("[ebsid]").attr("ctype") == "DataGrid_New") || ($(document.activeElement).closest('[ebsid]').attr("ctype") == "DataGrid_New")) {
        //initial click of select
        if (($(e.target).closest("[ebsid]").attr("ctype") == "DataGrid") || ($(e.target).closest("[ebsid]").attr("ctype") == "DataGrid_New")) {
            par_ebSid = $(e.target).closest(".dropdown").find("select").attr("name");
            ebSid_CtxId = $(document.activeElement).closest('[ebsid]').attr("ebsid");
            container = $('.dd_of_' + par_ebSid);
        }
        //item selection click in select
        else {
            par_ebSid = $(e.target).closest(".dropdown").attr("par_ebsid");
            ebSid_CtxId = $(document.activeElement).closest('[ebsid]').attr("ebsid");
            container = $('.dd_of_' + par_ebSid);
        }
    }
    //if select is not in datagrid ...ie,outside datagrid
    else {
        par_ebSid = $(e.target).closest('[ebsid]').attr("ebsid");
        ebSid_CtxId = $(document.activeElement).closest('[ebsid]').attr("ebsid");
        container = $('.dd_of_' + ebSid_CtxId);
    }

    //to close opend select on click of another select
    if ((($(e.target).hasClass('filter-option-inner-inner')) || ($(e.target).closest('.filter-option').length == 1))) {
        //  container.closest('[detch_select=true]').removeClass("open");
        //if ($(".detch_select").hasClass("open")) {
        //    $(".detch_select").removeClass("open");
        //    $(`#${par_ebSid}`).selectpicker('toggle');
        //    $(`[par_ebsid=${par_ebSid}]`).addClass('open');
        //}
        //else {
        //    $(`#${par_ebSid}`).selectpicker('toggle');
        //    $(`[par_ebsid=${par_ebSid}]`).addClass('open');
        //}
        let $sss = $(`.detch_select:not([par_ebsid=${par_ebSid}])`);
        if ($sss.hasClass("open")) {
            $sss.removeClass("open");
        }
    }
    //to close dropdown on ouside click of dropdown
    if (!((($(e.target).closest('[detch_select=true]').attr('detch_select')) == "true") || ($(e.target).hasClass('filter-option-inner-inner')) || ($(e.target).closest('.filter-option').length == 1))) {
        $(".detch_select").removeClass("open");
    }

    if ((($(e.target).closest('[MultiSelect]').attr("MultiSelect")) == "false") || (($(e.target).closest('[objtype]').attr("objtype")) == 'SimpleSelect') || (($(e.target).closest('[objtype]').attr("objtype")) == 'BooleanSelect')) {
        if (!(($(e.target).hasClass('filter-option-inner-inner')) || ($(e.target).closest('.filter-option').length == 1))) {
            container.closest('[detch_select=true]').removeClass("open");

        }
    }
});


function textTransform(element, transform_type, IsNoDelay) {
    if (IsNoDelay) {
        textTransformHelper(element, transform_type);
    }
    else {
        setTimeout(function () {
            textTransformHelper(element, transform_type);
        }, 150);
    }
}

function textTransformHelper(element, transform_type) {
    let value = $(element).val().trim();
    if (transform_type === 1)
        $(element).val(value.toLowerCase());
    else if (transform_type === 2)
        $(element).val(value.toUpperCase());
}


function EBPSSetDisplayMember(p1, p2) {
    this.___isNotUpdateValExpDepCtrls = true;
    p1 = p1 + "";
    if (p1 === '')
        return;
    let VMs = this.initializer.Vobj.valueMembers || [];
    let DMs = this.initializer.Vobj.displayMembers || [];
    let columnVals = this.initializer.columnVals || {};

    if (VMs.length > 0)// clear if already values there
        this.initializer.clearValues();

    let valMsArr = p1.split(',');

    for (let i = 0; i < valMsArr.length; i++) {
        let vm = valMsArr[i];
        VMs.push(vm);
        for (let j = 0; j < this.initializer.dmNames.length; j++) {
            let dmName = this.initializer.dmNames[j];
            if (!DMs[dmName])
                DMs[dmName] = []; // dg edit mode call
            DMs[dmName].push(this.DataVals.D[vm][dmName]);
        }
    }

    if (this.initializer.datatable === null) {//for aftersave actions
        let colNames = Object.keys(this.DataVals.R);
        for (let i = 0; i < valMsArr.length; i++) {
            for (let j = 0; j < colNames.length; j++) {
                let colName = colNames[j];
                let val = this.DataVals.R[colName][i];
                if (columnVals[colName])
                    columnVals[colName].push(val);
                else
                    console.warn("Not found colName: " + colName);
            }
        }
    }

    $("#" + this.EbSid_CtxId).val(p1);
}

function copyObj(destObj, srcObj) {
    Object.keys(destObj).forEach(function (key) { delete destObj[key]; });
    let key;
    for (key in destObj, srcObj) {
        srcObj[key] = srcObj[key]; // copies each property to the objCopy object
    }
    return srcObj;
}

function GetFontCss(obj, jqueryObj) {
    if (obj) {
        let font = [];
        let fontobj = {};
        font.push(`font-size:${obj.Size}px ;`);
        font.push(`color:${obj.color} ;`);
        if (obj.FontName = 'Arapey') font.push(`font-family: "" ;`);
        else font.push(`font-family:${obj.FontName} ;`);
        if (font.Underline) { font.push(`text-decoration: underline ;`); }
        if (font.Strikethrough) { font.push(`text-decoration: line-through ;`); }
        if (font.Caps) { font.push(`text-transform: uppercase;`); }
        if (font.Style === 1) { font.push(`font: bold;`); }
        if (font.Style === 2) { font.push(`font: italic;`); }
        if (font.Style === 3) { font.push(`font: italic bold;`); }

        if (jqueryObj !== undefined) {
            jqueryObj.css(`font-size`, `${obj.Size}px`);
            jqueryObj.css(`color`, `${obj.color}`);
            if (obj.FontName = 'Arapey') jqueryObj.css(`font-family`, ``);
            else
                jqueryObj.css(`font-family`, `${obj.FontName}`);
            if (font.Underline) { jqueryObj.css(`text-decoration`, `underline`); }
            if (font.Strikethrough) { jqueryObj.css(`text-decoration`, `line-through`); }
            if (font.Caps) { jqueryObj.css(`text-transform`, `uppercase`); }
            if (font.Style === 0) { jqueryObj.css(`font`, `normal`); }
            if (font.Style === 1) { jqueryObj.css(`font`, `bold`); }
            if (font.Style === 2) { jqueryObj.css(`font`, `italic`); }
            if (font.Style === 3) { jqueryObj.css(`font`, ` italic bold`); }
        }
        else {
            return (font.join().replace(/\,/g, ''));
        }
    }
}


function setFontCss(obj, jqueryObj) {
    if (obj) {
        if (jqueryObj !== undefined) {
            jqueryObj.css(`font-size`, `${obj.Size}px`);
            jqueryObj.css(`color`, `${obj.color}`);
            jqueryObj.css(`font-family`, `${obj.FontName}`);

            if (obj.Underline) { jqueryObj.css(`text-decoration`, `underline`); }
            if (obj.Strikethrough) { jqueryObj.css(`text-decoration`, `line-through`); }
            if (obj.Caps) { jqueryObj.css(`text-transform`, `uppercase`); }

            if (obj.Style === 0) { jqueryObj.css(`font-weight`, `normal`); jqueryObj.css(`font-style`, `normal`); }
            if (obj.Style === 1) { jqueryObj.css(`font-weight`, `bold`); jqueryObj.css(`font-style`, `normal`); }
            if (obj.Style === 2) { jqueryObj.css(`font-style`, `italic`); jqueryObj.css(`font-weight`, `normal`); }
            if (obj.Style === 3) { jqueryObj.css(`font-weight`, `bold`); jqueryObj.css(`font-style`, `italic`); }
        }
    }
}

function blink(el, delay = 1000) {
    if (el.jquery) {

        $e = $(el);
        $e.addClass("blink");
        setTimeout(function () {
            $e.removeClass("blink");
        }, delay);
    }
    else
        blink($(el), delay);
}

const getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

const formatData4webform = function (_multipleTables) {
    let multipleTables = $.extend(true, {}, _multipleTables);
    let tableNames = Object.keys(multipleTables);
    for (let i = 0; i < tableNames.length; i++) {
        let tableName = tableNames[i];
        let table = multipleTables[tableName];
        for (let j = 0; j < table.length; j++) {
            let row = table[j];
            let columns = row.Columns;
            for (let k = 0; k < columns.length; k++) {
                let singleColumn = columns[k];
                delete singleColumn["D"];
                //delete singleColumn["F"];//provUser
                delete singleColumn["R"];
                delete singleColumn["ValueExpr_val"];
                delete singleColumn["DisplayMember"];
            }
        }
    }
    return multipleTables;
};

function EbIsEmailOK(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function EbvalidateEmail(email) {
    if (email === "")
        return true;
    return EbIsEmailOK(email);
}

function EbIsValidURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

//function EbfixTrailingZeros(val, decLen) {
//    //val = val.toString();
//    //if (decLen <= 0)
//    //    return val;
//    //let res;
//    ////dec
//    ////val.padEnd(2)

//    //if (!val.trim().includes(".")) {
//    //    res = val + "." + "0".repeat(decLen);
//    //}
//    //else {
//    //    let p1 = val.split(".")[0];
//    //    let p2 = val.split(".")[1];
//    //    zerolen = decLen - p2.length;
//    //    res = p1 + "." + p2 + "0".repeat(zerolen > 0 ? zerolen : 0);
//    //}
//    res = val.toFixed(decLen);

//    return res;
//}
var waitForFinalEvent = (function () {
    var timers = {};
    return function (callback, ms, uniqueId) {
        if (!uniqueId) {
            uniqueId = "Don't call this twice without a uniqueId";
        }
        if (timers[uniqueId]) {
            clearTimeout(timers[uniqueId]);
        }
        timers[uniqueId] = setTimeout(callback, ms);
    };
})();

//function getScrollParent(node) {
//    if (node == null) {
//        return null;
//    }

//    if (node.scrollHeight > node.clientHeight) {
//        return node;
//    } else {
//        return getScrollParent(node.parentNode);
//    }
//}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}
var DateFormatter; !function () { "use strict"; var e, t, a, r, n, o; n = 864e5, o = 3600, e = function (e, t) { return "string" == typeof e && "string" == typeof t && e.toLowerCase() === t.toLowerCase() }, t = function (e, a, r) { var n = r || "0", o = e.toString(); return o.length < a ? t(n + o, a) : o }, a = function (e) { var t, r; for (e = e || {}, t = 1; t < arguments.length; t++) if (r = arguments[t]) for (var n in r) r.hasOwnProperty(n) && ("object" == typeof r[n] ? a(e[n], r[n]) : e[n] = r[n]); return e }, r = { dateSettings: { days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], meridiem: ["AM", "PM"], ordinal: function (e) { var t = e % 10, a = { 1: "st", 2: "nd", 3: "rd" }; return 1 !== Math.floor(e % 100 / 10) && a[t] ? a[t] : "th" } }, separators: /[ \-+\/\.T:@]/g, validParts: /[dDjlNSwzWFmMntLoYyaABgGhHisueTIOPZcrU]/g, intParts: /[djwNzmnyYhHgGis]/g, tzParts: /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, tzClip: /[^-+\dA-Z]/g }, DateFormatter = function (e) { var t = this, n = a(r, e); t.dateSettings = n.dateSettings, t.separators = n.separators, t.validParts = n.validParts, t.intParts = n.intParts, t.tzParts = n.tzParts, t.tzClip = n.tzClip }, DateFormatter.prototype = { constructor: DateFormatter, parseDate: function (t, a) { var r, n, o, i, s, d, u, l, f, c, m = this, h = !1, g = !1, p = m.dateSettings, y = { date: null, year: null, month: null, day: null, hour: 0, min: 0, sec: 0 }; if (!t) return void 0; if (t instanceof Date) return t; if ("number" == typeof t) return new Date(t); if ("U" === a) return o = parseInt(t), o ? new Date(1e3 * o) : t; if ("string" != typeof t) return ""; if (r = a.match(m.validParts), !r || 0 === r.length) throw new Error("Invalid date format definition."); for (n = t.replace(m.separators, "\x00").split("\x00"), o = 0; o < n.length; o++) switch (i = n[o], s = parseInt(i), r[o]) { case "y": case "Y": f = i.length, 2 === f ? y.year = parseInt((70 > s ? "20" : "19") + i) : 4 === f && (y.year = s), h = !0; break; case "m": case "n": case "M": case "F": isNaN(i) ? (d = p.monthsShort.indexOf(i), d > -1 && (y.month = d + 1), d = p.months.indexOf(i), d > -1 && (y.month = d + 1)) : s >= 1 && 12 >= s && (y.month = s), h = !0; break; case "d": case "j": s >= 1 && 31 >= s && (y.day = s), h = !0; break; case "g": case "h": u = r.indexOf("a") > -1 ? r.indexOf("a") : r.indexOf("A") > -1 ? r.indexOf("A") : -1, c = n[u], u > -1 ? (l = e(c, p.meridiem[0]) ? 0 : e(c, p.meridiem[1]) ? 12 : -1, s >= 1 && 12 >= s && l > -1 ? y.hour = s + l : s >= 0 && 23 >= s && (y.hour = s)) : s >= 0 && 23 >= s && (y.hour = s), g = !0; break; case "G": case "H": s >= 0 && 23 >= s && (y.hour = s), g = !0; break; case "i": s >= 0 && 59 >= s && (y.min = s), g = !0; break; case "s": s >= 0 && 59 >= s && (y.sec = s), g = !0 } if (h === !0 && y.year && y.month && y.day) y.date = new Date(y.year, y.month - 1, y.day, y.hour, y.min, y.sec, 0); else { if (g !== !0) return !1; y.date = new Date(0, 0, 0, y.hour, y.min, y.sec, 0) } return y.date }, guessDate: function (e, t) { if ("string" != typeof e) return e; var a, r, n, o, i = this, s = e.replace(i.separators, "\x00").split("\x00"), d = /^[djmn]/g, u = t.match(i.validParts), l = new Date, f = 0; if (!d.test(u[0])) return e; for (r = 0; r < s.length; r++) { switch (f = 2, n = s[r], o = parseInt(n.substr(0, 2)), r) { case 0: "m" === u[0] || "n" === u[0] ? l.setMonth(o - 1) : l.setDate(o); break; case 1: "m" === u[0] || "n" === u[0] ? l.setDate(o) : l.setMonth(o - 1); break; case 2: a = l.getFullYear(), n.length < 4 ? (l.setFullYear(parseInt(a.toString().substr(0, 4 - n.length) + n)), f = n.length) : (l.setFullYear = parseInt(n.substr(0, 4)), f = 4); break; case 3: l.setHours(o); break; case 4: l.setMinutes(o); break; case 5: l.setSeconds(o) } n.substr(f).length > 0 && s.splice(r + 1, 0, n.substr(f)) } return l }, parseFormat: function (e, a) { var r, i = this, s = i.dateSettings, d = /\\?(.?)/gi, u = function (e, t) { return r[e] ? r[e]() : t }; return r = { d: function () { return t(r.j(), 2) }, D: function () { return s.daysShort[r.w()] }, j: function () { return a.getDate() }, l: function () { return s.days[r.w()] }, N: function () { return r.w() || 7 }, w: function () { return a.getDay() }, z: function () { var e = new Date(r.Y(), r.n() - 1, r.j()), t = new Date(r.Y(), 0, 1); return Math.round((e - t) / n) }, W: function () { var e = new Date(r.Y(), r.n() - 1, r.j() - r.N() + 3), a = new Date(e.getFullYear(), 0, 4); return t(1 + Math.round((e - a) / n / 7), 2) }, F: function () { return s.months[a.getMonth()] }, m: function () { return t(r.n(), 2) }, M: function () { return s.monthsShort[a.getMonth()] }, n: function () { return a.getMonth() + 1 }, t: function () { return new Date(r.Y(), r.n(), 0).getDate() }, L: function () { var e = r.Y(); return e % 4 === 0 && e % 100 !== 0 || e % 400 === 0 ? 1 : 0 }, o: function () { var e = r.n(), t = r.W(), a = r.Y(); return a + (12 === e && 9 > t ? 1 : 1 === e && t > 9 ? -1 : 0) }, Y: function () { return a.getFullYear() }, y: function () { return r.Y().toString().slice(-2) }, a: function () { return r.A().toLowerCase() }, A: function () { var e = r.G() < 12 ? 0 : 1; return s.meridiem[e] }, B: function () { var e = a.getUTCHours() * o, r = 60 * a.getUTCMinutes(), n = a.getUTCSeconds(); return t(Math.floor((e + r + n + o) / 86.4) % 1e3, 3) }, g: function () { return r.G() % 12 || 12 }, G: function () { return a.getHours() }, h: function () { return t(r.g(), 2) }, H: function () { return t(r.G(), 2) }, i: function () { return t(a.getMinutes(), 2) }, s: function () { return t(a.getSeconds(), 2) }, u: function () { return t(1e3 * a.getMilliseconds(), 6) }, e: function () { var e = /\((.*)\)/.exec(String(a))[1]; return e || "Coordinated Universal Time" }, T: function () { var e = (String(a).match(i.tzParts) || [""]).pop().replace(i.tzClip, ""); return e || "UTC" }, I: function () { var e = new Date(r.Y(), 0), t = Date.UTC(r.Y(), 0), a = new Date(r.Y(), 6), n = Date.UTC(r.Y(), 6); return e - t !== a - n ? 1 : 0 }, O: function () { var e = a.getTimezoneOffset(), r = Math.abs(e); return (e > 0 ? "-" : "+") + t(100 * Math.floor(r / 60) + r % 60, 4) }, P: function () { var e = r.O(); return e.substr(0, 3) + ":" + e.substr(3, 2) }, Z: function () { return 60 * -a.getTimezoneOffset() }, c: function () { return "Y-m-d\\TH:i:sP".replace(d, u) }, r: function () { return "D, d M Y H:i:s O".replace(d, u) }, U: function () { return a.getTime() / 1e3 || 0 } }, u(e, e) }, formatDate: function (e, t) { var a, r, n, o, i, s = this, d = ""; if ("string" == typeof e && (e = s.parseDate(e, t), e === !1)) return !1; if (e instanceof Date) { for (n = t.length, a = 0; n > a; a++) i = t.charAt(a), "S" !== i && (o = s.parseFormat(i, e), a !== n - 1 && s.intParts.test(i) && "S" === t.charAt(a + 1) && (r = parseInt(o), o += s.dateSettings.ordinal(r)), d += o); return d } return "" } } }(), function (e) { "function" == typeof define && define.amd ? define(["jquery", "jquery-mousewheel"], e) : "object" == typeof exports ? module.exports = e : e(jQuery) }(function (e) {
    "use strict"; function t(e, t, a) { this.date = e, this.desc = t, this.style = a } var a = { i18n: { ar: { months: ["كانون الثاني", "شباط", "آذار", "نيسان", "مايو", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"], dayOfWeekShort: ["ن", "ث", "ع", "خ", "ج", "س", "ح"], dayOfWeek: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"] }, ro: { months: ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"], dayOfWeekShort: ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sâ"], dayOfWeek: ["Duminică", "Luni", "Marţi", "Miercuri", "Joi", "Vineri", "Sâmbătă"] }, id: { months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"], dayOfWeekShort: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"], dayOfWeek: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] }, is: { months: ["Janúar", "Febrúar", "Mars", "Apríl", "Maí", "Júní", "Júlí", "Ágúst", "September", "Október", "Nóvember", "Desember"], dayOfWeekShort: ["Sun", "Mán", "Þrið", "Mið", "Fim", "Fös", "Lau"], dayOfWeek: ["Sunnudagur", "Mánudagur", "Þriðjudagur", "Miðvikudagur", "Fimmtudagur", "Föstudagur", "Laugardagur"] }, bg: { months: ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"], dayOfWeekShort: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"], dayOfWeek: ["Неделя", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота"] }, fa: { months: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"], dayOfWeekShort: ["یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"], dayOfWeek: ["یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه", "یک‌شنبه"] }, ru: { months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"], dayOfWeekShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"], dayOfWeek: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"] }, uk: { months: ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"], dayOfWeekShort: ["Ндл", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"], dayOfWeek: ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"] }, en: { months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], dayOfWeekShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] }, el: { months: ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"], dayOfWeekShort: ["Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"], dayOfWeek: ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"] }, de: { months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"], dayOfWeekShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], dayOfWeek: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"] }, nl: { months: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"], dayOfWeekShort: ["zo", "ma", "di", "wo", "do", "vr", "za"], dayOfWeek: ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"] }, tr: { months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"], dayOfWeekShort: ["Paz", "Pts", "Sal", "Çar", "Per", "Cum", "Cts"], dayOfWeek: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"] }, fr: { months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"], dayOfWeekShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"], dayOfWeek: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] }, es: { months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"], dayOfWeekShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"], dayOfWeek: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] }, th: { months: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"], dayOfWeekShort: ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."], dayOfWeek: ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"] }, pl: { months: ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"], dayOfWeekShort: ["nd", "pn", "wt", "śr", "cz", "pt", "sb"], dayOfWeek: ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"] }, pt: { months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"], dayOfWeekShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"], dayOfWeek: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] }, ch: { months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"], dayOfWeekShort: ["日", "一", "二", "三", "四", "五", "六"] }, se: { months: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"], dayOfWeekShort: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"] }, kr: { months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"], dayOfWeekShort: ["일", "월", "화", "수", "목", "금", "토"], dayOfWeek: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"] }, it: { months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"], dayOfWeekShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"], dayOfWeek: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"] }, da: { months: ["January", "Februar", "Marts", "April", "Maj", "Juni", "July", "August", "September", "Oktober", "November", "December"], dayOfWeekShort: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"], dayOfWeek: ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"] }, no: { months: ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"], dayOfWeekShort: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"], dayOfWeek: ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"] }, ja: { months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"], dayOfWeekShort: ["日", "月", "火", "水", "木", "金", "土"], dayOfWeek: ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜"] }, vi: { months: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"], dayOfWeekShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"], dayOfWeek: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"] }, sl: { months: ["Januar", "Februar", "Marec", "April", "Maj", "Junij", "Julij", "Avgust", "September", "Oktober", "November", "December"], dayOfWeekShort: ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"], dayOfWeek: ["Nedelja", "Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota"] }, cs: { months: ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"], dayOfWeekShort: ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"] }, hu: { months: ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"], dayOfWeekShort: ["Va", "Hé", "Ke", "Sze", "Cs", "Pé", "Szo"], dayOfWeek: ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"] }, az: { months: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"], dayOfWeekShort: ["B", "Be", "Ça", "Ç", "Ca", "C", "Ş"], dayOfWeek: ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"] }, bs: { months: ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"], dayOfWeekShort: ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"], dayOfWeek: ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"] }, ca: { months: ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"], dayOfWeekShort: ["Dg", "Dl", "Dt", "Dc", "Dj", "Dv", "Ds"], dayOfWeek: ["Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"] }, "en-GB": { months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], dayOfWeekShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] }, et: { months: ["Jaanuar", "Veebruar", "Märts", "Aprill", "Mai", "Juuni", "Juuli", "August", "September", "Oktoober", "November", "Detsember"], dayOfWeekShort: ["P", "E", "T", "K", "N", "R", "L"], dayOfWeek: ["Pühapäev", "Esmaspäev", "Teisipäev", "Kolmapäev", "Neljapäev", "Reede", "Laupäev"] }, eu: { months: ["Urtarrila", "Otsaila", "Martxoa", "Apirila", "Maiatza", "Ekaina", "Uztaila", "Abuztua", "Iraila", "Urria", "Azaroa", "Abendua"], dayOfWeekShort: ["Ig.", "Al.", "Ar.", "Az.", "Og.", "Or.", "La."], dayOfWeek: ["Igandea", "Astelehena", "Asteartea", "Asteazkena", "Osteguna", "Ostirala", "Larunbata"] }, fi: { months: ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"], dayOfWeekShort: ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"], dayOfWeek: ["sunnuntai", "maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai"] }, gl: { months: ["Xan", "Feb", "Maz", "Abr", "Mai", "Xun", "Xul", "Ago", "Set", "Out", "Nov", "Dec"], dayOfWeekShort: ["Dom", "Lun", "Mar", "Mer", "Xov", "Ven", "Sab"], dayOfWeek: ["Domingo", "Luns", "Martes", "Mércores", "Xoves", "Venres", "Sábado"] }, hr: { months: ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"], dayOfWeekShort: ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"], dayOfWeek: ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"] }, ko: { months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"], dayOfWeekShort: ["일", "월", "화", "수", "목", "금", "토"], dayOfWeek: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"] }, lt: { months: ["Sausio", "Vasario", "Kovo", "Balandžio", "Gegužės", "Birželio", "Liepos", "Rugpjūčio", "Rugsėjo", "Spalio", "Lapkričio", "Gruodžio"], dayOfWeekShort: ["Sek", "Pir", "Ant", "Tre", "Ket", "Pen", "Šeš"], dayOfWeek: ["Sekmadienis", "Pirmadienis", "Antradienis", "Trečiadienis", "Ketvirtadienis", "Penktadienis", "Šeštadienis"] }, lv: { months: ["Janvāris", "Februāris", "Marts", "Aprīlis ", "Maijs", "Jūnijs", "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"], dayOfWeekShort: ["Sv", "Pr", "Ot", "Tr", "Ct", "Pk", "St"], dayOfWeek: ["Svētdiena", "Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena", "Piektdiena", "Sestdiena"] }, mk: { months: ["јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"], dayOfWeekShort: ["нед", "пон", "вто", "сре", "чет", "пет", "саб"], dayOfWeek: ["Недела", "Понеделник", "Вторник", "Среда", "Четврток", "Петок", "Сабота"] }, mn: { months: ["1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар", "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"], dayOfWeekShort: ["Дав", "Мяг", "Лха", "Пүр", "Бсн", "Бям", "Ням"], dayOfWeek: ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"] }, "pt-BR": { months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"], dayOfWeekShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"], dayOfWeek: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] }, sk: { months: ["Január", "Február", "Marec", "Apríl", "Máj", "Jún", "Júl", "August", "September", "Október", "November", "December"], dayOfWeekShort: ["Ne", "Po", "Ut", "St", "Št", "Pi", "So"], dayOfWeek: ["Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"] }, sq: { months: ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"], dayOfWeekShort: ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Shtu"], dayOfWeek: ["E Diel", "E Hënë", "E Martē", "E Mërkurë", "E Enjte", "E Premte", "E Shtunë"] }, "sr-YU": { months: ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"], dayOfWeekShort: ["Ned", "Pon", "Uto", "Sre", "čet", "Pet", "Sub"], dayOfWeek: ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"] }, sr: { months: ["јануар", "фебруар", "март", "април", "мај", "јун", "јул", "август", "септембар", "октобар", "новембар", "децембар"], dayOfWeekShort: ["нед", "пон", "уто", "сре", "чет", "пет", "суб"], dayOfWeek: ["Недеља", "Понедељак", "Уторак", "Среда", "Четвртак", "Петак", "Субота"] }, sv: { months: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"], dayOfWeekShort: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"], dayOfWeek: ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"] }, "zh-TW": { months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"], dayOfWeekShort: ["日", "一", "二", "三", "四", "五", "六"], dayOfWeek: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"] }, zh: { months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"], dayOfWeekShort: ["日", "一", "二", "三", "四", "五", "六"], dayOfWeek: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"] }, he: { months: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"], dayOfWeekShort: ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "שבת"], dayOfWeek: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת", "ראשון"] }, hy: { months: ["Հունվար", "Փետրվար", "Մարտ", "Ապրիլ", "Մայիս", "Հունիս", "Հուլիս", "Օգոստոս", "Սեպտեմբեր", "Հոկտեմբեր", "Նոյեմբեր", "Դեկտեմբեր"], dayOfWeekShort: ["Կի", "Երկ", "Երք", "Չոր", "Հնգ", "Ուրբ", "Շբթ"], dayOfWeek: ["Կիրակի", "Երկուշաբթի", "Երեքշաբթի", "Չորեքշաբթի", "Հինգշաբթի", "Ուրբաթ", "Շաբաթ"] }, kg: { months: ["Үчтүн айы", "Бирдин айы", "Жалган Куран", "Чын Куран", "Бугу", "Кулжа", "Теке", "Баш Оона", "Аяк Оона", "Тогуздун айы", "Жетинин айы", "Бештин айы"], dayOfWeekShort: ["Жек", "Дүй", "Шей", "Шар", "Бей", "Жум", "Ише"], dayOfWeek: ["Жекшемб", "Дүйшөмб", "Шейшемб", "Шаршемб", "Бейшемби", "Жума", "Ишенб"] }, rm: { months: ["Schaner", "Favrer", "Mars", "Avrigl", "Matg", "Zercladur", "Fanadur", "Avust", "Settember", "October", "November", "December"], dayOfWeekShort: ["Du", "Gli", "Ma", "Me", "Gie", "Ve", "So"], dayOfWeek: ["Dumengia", "Glindesdi", "Mardi", "Mesemna", "Gievgia", "Venderdi", "Sonda"] }, ka: { months: ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"], dayOfWeekShort: ["კვ", "ორშ", "სამშ", "ოთხ", "ხუთ", "პარ", "შაბ"], dayOfWeek: ["კვირა", "ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი"] } }, value: "", rtl: !1, format: "Y/m/d H:i", formatTime: "H:i", formatDate: "Y/m/d", startDate: !1, step: 60, monthChangeSpinner: !0, closeOnDateSelect: !1, closeOnTimeSelect: !0, closeOnWithoutClick: !0, closeOnInputClick: !0, timepicker: !0, datepicker: !0, weeks: !1, defaultTime: !1, defaultDate: !1, minDate: !1, maxDate: !1, minTime: !1, maxTime: !1, disabledMinTime: !1, disabledMaxTime: !1, allowTimes: [], opened: !1, initTime: !0, inline: !1, theme: "", onSelectDate: function () { }, onSelectTime: function () { }, onChangeMonth: function () { }, onGetWeekOfYear: function () { }, onChangeYear: function () { }, onChangeDateTime: function () { }, onShow: function () { }, onClose: function () { }, onGenerate: function () { }, withoutCopyright: !0, inverseButton: !1, hours12: !1, next: "xdsoft_next", prev: "xdsoft_prev", dayOfWeekStart: 0, parentID: "body", timeHeightInTimePicker: 25, timepickerScrollbar: !0, todayButton: !0, prevButton: !0, nextButton: !0, defaultSelect: !0, scrollMonth: !0, scrollTime: !0, scrollInput: !0, lazyInit: !1, mask: !1, validateOnBlur: !0, allowBlank: !0, yearStart: 1950, yearEnd: 2050, monthStart: 0, monthEnd: 11, style: "", id: "", fixed: !1, roundTime: "round", className: "", weekends: [], highlightedDates: [], highlightedPeriods: [], allowDates: [], allowDateRe: null, disabledDates: [], disabledWeekDays: [], yearOffset: 0, beforeShowDay: null, enterLikeTab: !0, showApplyButton: !1 }, r = null, n = "en", o = "en", i = { meridiem: ["AM", "PM"] }, s = function () { var t = a.i18n[o], n = { days: t.dayOfWeek, daysShort: t.dayOfWeekShort, months: t.months, monthsShort: e.map(t.months, function (e) { return e.substring(0, 3) }) }; r = new DateFormatter({ dateSettings: e.extend({}, i, n) }) }; e.datetimepicker = { setLocale: function (e) { var t = a.i18n[e] ? e : n; o != t && (o = t, s()) }, setDateFormatter: function (e) { r = e }, RFC_2822: "D, d M Y H:i:s O", ATOM: "Y-m-dTH:i:sP", ISO_8601: "Y-m-dTH:i:sO", RFC_822: "D, d M y H:i:s O", RFC_850: "l, d-M-y H:i:s T", RFC_1036: "D, d M y H:i:s O", RFC_1123: "D, d M Y H:i:s O", RSS: "D, d M Y H:i:s O", W3C: "Y-m-dTH:i:sP" }, s(), window.getComputedStyle || (window.getComputedStyle = function (e) { return this.el = e, this.getPropertyValue = function (t) { var a = /(\-([a-z]){1})/g; return "float" === t && (t = "styleFloat"), a.test(t) && (t = t.replace(a, function (e, t, a) { return a.toUpperCase() })), e.currentStyle[t] || null }, this }), Array.prototype.indexOf || (Array.prototype.indexOf = function (e, t) { var a, r; for (a = t || 0, r = this.length; r > a; a += 1) if (this[a] === e) return a; return -1 }), Date.prototype.countDaysInMonth = function () { return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate() }, e.fn.xdsoftScroller = function (t) { return this.each(function () { var a, r, n, o, i, s = e(this), d = function (e) { var t, a = { x: 0, y: 0 }; return "touchstart" === e.type || "touchmove" === e.type || "touchend" === e.type || "touchcancel" === e.type ? (t = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0], a.x = t.clientX, a.y = t.clientY) : ("mousedown" === e.type || "mouseup" === e.type || "mousemove" === e.type || "mouseover" === e.type || "mouseout" === e.type || "mouseenter" === e.type || "mouseleave" === e.type) && (a.x = e.clientX, a.y = e.clientY), a }, u = 100, l = !1, f = 0, c = 0, m = 0, h = !1, g = 0, p = function () { }; return "hide" === t ? void s.find(".xdsoft_scrollbar").hide() : (e(this).hasClass("xdsoft_scroller_box") || (a = s.children().eq(0), r = s[0].clientHeight, n = a[0].offsetHeight, o = e('<div class="xdsoft_scrollbar"></div>'), i = e('<div class="xdsoft_scroller"></div>'), o.append(i), s.addClass("xdsoft_scroller_box").append(o), p = function (e) { var t = d(e).y - f + g; 0 > t && (t = 0), t + i[0].offsetHeight > m && (t = m - i[0].offsetHeight), s.trigger("scroll_element.xdsoft_scroller", [u ? t / u : 0]) }, i.on("touchstart.xdsoft_scroller mousedown.xdsoft_scroller", function (a) { r || s.trigger("resize_scroll.xdsoft_scroller", [t]), f = d(a).y, g = parseInt(i.css("margin-top"), 10), m = o[0].offsetHeight, "mousedown" === a.type || "touchstart" === a.type ? (document && e(document.body).addClass("xdsoft_noselect"), e([document.body, window]).on("touchend mouseup.xdsoft_scroller", function n() { e([document.body, window]).off("touchend mouseup.xdsoft_scroller", n).off("mousemove.xdsoft_scroller", p).removeClass("xdsoft_noselect") }), e(document.body).on("mousemove.xdsoft_scroller", p)) : (h = !0, a.stopPropagation(), a.preventDefault()) }).on("touchmove", function (e) { h && (e.preventDefault(), p(e)) }).on("touchend touchcancel", function () { h = !1, g = 0 }), s.on("scroll_element.xdsoft_scroller", function (e, t) { r || s.trigger("resize_scroll.xdsoft_scroller", [t, !0]), t = t > 1 ? 1 : 0 > t || isNaN(t) ? 0 : t, i.css("margin-top", u * t), setTimeout(function () { a.css("marginTop", -parseInt((a[0].offsetHeight - r) * t, 10)) }, 10) }).on("resize_scroll.xdsoft_scroller", function (e, t, d) { var l, f; r = s[0].clientHeight, n = a[0].offsetHeight, l = r / n, f = l * o[0].offsetHeight, l > 1 ? i.hide() : (i.show(), i.css("height", parseInt(f > 10 ? f : 10, 10)), u = o[0].offsetHeight - i[0].offsetHeight, d !== !0 && s.trigger("scroll_element.xdsoft_scroller", [t || Math.abs(parseInt(a.css("marginTop"), 10)) / (n - r)])) }), s.on("mousewheel", function (e) { var t = Math.abs(parseInt(a.css("marginTop"), 10)); return t -= 20 * e.deltaY, 0 > t && (t = 0), s.trigger("scroll_element.xdsoft_scroller", [t / (n - r)]), e.stopPropagation(), !1 }), s.on("touchstart", function (e) { l = d(e), c = Math.abs(parseInt(a.css("marginTop"), 10)) }), s.on("touchmove", function (e) { if (l) { e.preventDefault(); var t = d(e); s.trigger("scroll_element.xdsoft_scroller", [(c - (t.y - l.y)) / (n - r)]) } }), s.on("touchend touchcancel", function () { l = !1, c = 0 })), void s.trigger("resize_scroll.xdsoft_scroller", [t])) }) }, e.fn.datetimepicker = function (n, i) {
        var s, d, u = this, l = 48, f = 57, c = 96, m = 105, h = 17, g = 46, p = 13, y = 27, v = 8, b = 37, D = 38, k = 39, x = 40, T = 9, S = 116, w = 65, O = 67, M = 86, _ = 90, W = 89, F = !1, C = e.isPlainObject(n) || !n ? e.extend(!0, {}, a, n) : e.extend(!0, {}, a), P = 0, A = function (e) { e.on("open.xdsoft focusin.xdsoft mousedown.xdsoft touchstart", function t() { e.is(":disabled") || e.data("xdsoft_datetimepicker") || (clearTimeout(P), P = setTimeout(function () { e.data("xdsoft_datetimepicker") || s(e), e.off("open.xdsoft focusin.xdsoft mousedown.xdsoft touchstart", t).trigger("open.xdsoft") }, 100)) }) }; return s = function (a) {
            function i() { var e, t = !1; return C.startDate ? t = j.strToDate(C.startDate) : (t = C.value || (a && a.val && a.val() ? a.val() : ""), t ? t = j.strToDateTime(t) : C.defaultDate && (t = j.strToDateTime(C.defaultDate), C.defaultTime && (e = j.strtotime(C.defaultTime), t.setHours(e.getHours()), t.setMinutes(e.getMinutes())))), t && j.isValidDate(t) ? J.data("changed", !0) : t = "", t || 0 } function s(t) { var r = function (e, t) { var a = e.replace(/([\[\]\/\{\}\(\)\-\.\+]{1})/g, "\\$1").replace(/_/g, "{digit+}").replace(/([0-9]{1})/g, "{digit$1}").replace(/\{digit([0-9]{1})\}/g, "[0-$1_]{1}").replace(/\{digit[\+]\}/g, "[0-9_]{1}"); return new RegExp(a).test(t) }, n = function (e) { try { if (document.selection && document.selection.createRange) { var t = document.selection.createRange(); return t.getBookmark().charCodeAt(2) - 2 } if (e.setSelectionRange) return e.selectionStart } catch (a) { return 0 } }, o = function (e, t) { if (e = "string" == typeof e || e instanceof String ? document.getElementById(e) : e, !e) return !1; if (e.createTextRange) { var a = e.createTextRange(); return a.collapse(!0), a.moveEnd("character", t), a.moveStart("character", t), a.select(), !0 } return e.setSelectionRange ? (e.setSelectionRange(t, t), !0) : !1 }; t.mask && a.off("keydown.xdsoft"), t.mask === !0 && (t.mask = "undefined" != typeof moment ? t.format.replace(/Y{4}/g, "9999").replace(/Y{2}/g, "99").replace(/M{2}/g, "19").replace(/D{2}/g, "39").replace(/H{2}/g, "29").replace(/m{2}/g, "59").replace(/s{2}/g, "59") : t.format.replace(/Y/g, "9999").replace(/F/g, "9999").replace(/m/g, "19").replace(/d/g, "39").replace(/H/g, "29").replace(/i/g, "59").replace(/s/g, "59")), "string" === e.type(t.mask) && (r(t.mask, a.val()) || (a.val(t.mask.replace(/[0-9]/g, "_")), o(a[0], 0)), a.on("keydown.xdsoft", function (i) { var s, d, u = this.value, C = i.which; if (C >= l && f >= C || C >= c && m >= C || C === v || C === g) { for (s = n(this), d = C !== v && C !== g ? String.fromCharCode(C >= c && m >= C ? C - l : C) : "_", C !== v && C !== g || !s || (s -= 1, d = "_") ; /[^0-9_]/.test(t.mask.substr(s, 1)) && s < t.mask.length && s > 0;) s += C === v || C === g ? -1 : 1; if (u = u.substr(0, s) + d + u.substr(s + 1), "" === e.trim(u)) u = t.mask.replace(/[0-9]/g, "_"); else if (s === t.mask.length) return i.preventDefault(), !1; for (s += C === v || C === g ? 0 : 1; /[^0-9_]/.test(t.mask.substr(s, 1)) && s < t.mask.length && s > 0;) s += C === v || C === g ? -1 : 1; r(t.mask, u) ? (this.value = u, o(this, s)) : "" === e.trim(u) ? this.value = t.mask.replace(/[0-9]/g, "_") : a.trigger("error_input.xdsoft") } else if (-1 !== [w, O, M, _, W].indexOf(C) && F || -1 !== [y, D, x, b, k, S, h, T, p].indexOf(C)) return !0; return i.preventDefault(), !1 })) } var d, u, P, A, Y, j, H, J = e('<div class="xdsoft_datetimepicker xdsoft_noselect"></div>'), z = e('<div class="xdsoft_copyright"><a target="_blank" href="http://xdsoft.net/jqplugins/datetimepicker/">xdsoft.net</a></div>'), I = e('<div class="xdsoft_datepicker active"></div>'), N = e('<div class="xdsoft_monthpicker"><button type="button" class="xdsoft_prev"></button><button type="button" class="xdsoft_today_button"></button><div class="xdsoft_label xdsoft_month"><span></span><i></i></div><div class="xdsoft_label xdsoft_year"><span></span><i></i></div><button type="button" class="xdsoft_next"></button></div>'), L = e('<div class="xdsoft_calendar"></div>'), E = e('<div class="xdsoft_timepicker active"><button type="button" class="xdsoft_prev"></button><div class="xdsoft_time_box"></div><button type="button" class="xdsoft_next"></button></div>'), R = E.find(".xdsoft_time_box").eq(0), B = e('<div class="xdsoft_time_variant"></div>'), V = e('<button type="button" class="xdsoft_save_selected blue-gradient-button">Save Selected</button>'), G = e('<div class="xdsoft_select xdsoft_monthselect"><div></div></div>'), U = e('<div class="xdsoft_select xdsoft_yearselect"><div></div></div>'), q = !1, X = 0; C.id && J.attr("id", C.id), C.style && J.attr("style", C.style), C.weeks && J.addClass("xdsoft_showweeks"), C.rtl && J.addClass("xdsoft_rtl"), J.addClass("xdsoft_" + C.theme), J.addClass(C.className), N.find(".xdsoft_month span").after(G), N.find(".xdsoft_year span").after(U), N.find(".xdsoft_month,.xdsoft_year").on("touchstart mousedown.xdsoft", function (t) { var a, r, n = e(this).find(".xdsoft_select").eq(0), o = 0, i = 0, s = n.is(":visible"); for (N.find(".xdsoft_select").hide(), j.currentTime && (o = j.currentTime[e(this).hasClass("xdsoft_month") ? "getMonth" : "getFullYear"]()), n[s ? "hide" : "show"](), a = n.find("div.xdsoft_option"), r = 0; r < a.length && a.eq(r).data("value") !== o; r += 1) i += a[0].offsetHeight; return n.xdsoftScroller(i / (n.children()[0].offsetHeight - n[0].clientHeight)), t.stopPropagation(), !1 }), N.find(".xdsoft_select").xdsoftScroller().on("touchstart mousedown.xdsoft", function (e) { e.stopPropagation(), e.preventDefault() }).on("touchstart mousedown.xdsoft", ".xdsoft_option", function () { (void 0 === j.currentTime || null === j.currentTime) && (j.currentTime = j.now()); var t = j.currentTime.getFullYear(); j && j.currentTime && j.currentTime[e(this).parent().parent().hasClass("xdsoft_monthselect") ? "setMonth" : "setFullYear"](e(this).data("value")), e(this).parent().parent().hide(), J.trigger("xchange.xdsoft"), C.onChangeMonth && e.isFunction(C.onChangeMonth) && C.onChangeMonth.call(J, j.currentTime, J.data("input")), t !== j.currentTime.getFullYear() && e.isFunction(C.onChangeYear) && C.onChangeYear.call(J, j.currentTime, J.data("input")) }), J.getValue = function () { return j.getCurrentTime() }, J.setOptions = function (n) {
                var o = {}; C = e.extend(!0, {}, C, n), n.allowTimes && e.isArray(n.allowTimes) && n.allowTimes.length && (C.allowTimes = e.extend(!0, [], n.allowTimes)), n.weekends && e.isArray(n.weekends) && n.weekends.length && (C.weekends = e.extend(!0, [], n.weekends)), n.allowDates && e.isArray(n.allowDates) && n.allowDates.length && (C.allowDates = e.extend(!0, [], n.allowDates)), n.allowDateRe && "[object String]" === Object.prototype.toString.call(n.allowDateRe) && (C.allowDateRe = new RegExp(n.allowDateRe)), n.highlightedDates && e.isArray(n.highlightedDates) && n.highlightedDates.length && (e.each(n.highlightedDates, function (a, n) { var i, s = e.map(n.split(","), e.trim), d = new t(r.parseDate(s[0], C.formatDate), s[1], s[2]), u = r.formatDate(d.date, C.formatDate); void 0 !== o[u] ? (i = o[u].desc, i && i.length && d.desc && d.desc.length && (o[u].desc = i + "\n" + d.desc)) : o[u] = d }), C.highlightedDates = e.extend(!0, [], o)), n.highlightedPeriods && e.isArray(n.highlightedPeriods) && n.highlightedPeriods.length && (o = e.extend(!0, [], C.highlightedDates),
                e.each(n.highlightedPeriods, function (a, n) { var i, s, d, u, l, f, c; if (e.isArray(n)) i = n[0], s = n[1], d = n[2], c = n[3]; else { var m = e.map(n.split(","), e.trim); i = r.parseDate(m[0], C.formatDate), s = r.parseDate(m[1], C.formatDate), d = m[2], c = m[3] } for (; s >= i;) u = new t(i, d, c), l = r.formatDate(i, C.formatDate), i.setDate(i.getDate() + 1), void 0 !== o[l] ? (f = o[l].desc, f && f.length && u.desc && u.desc.length && (o[l].desc = f + "\n" + u.desc)) : o[l] = u }), C.highlightedDates = e.extend(!0, [], o)), n.disabledDates && e.isArray(n.disabledDates) && n.disabledDates.length && (C.disabledDates = e.extend(!0, [], n.disabledDates)), n.disabledWeekDays && e.isArray(n.disabledWeekDays) && n.disabledWeekDays.length && (C.disabledWeekDays = e.extend(!0, [], n.disabledWeekDays)), !C.open && !C.opened || C.inline || a.trigger("open.xdsoft"), C.inline && (q = !0, J.addClass("xdsoft_inline"), a.after(J).hide()), C.inverseButton && (C.next = "xdsoft_prev", C.prev = "xdsoft_next"), C.datepicker ? I.addClass("active") : I.removeClass("active"), C.timepicker ? E.addClass("active") : E.removeClass("active"), C.value && (j.setCurrentTime(C.value), a && a.val && a.val(j.str)), C.dayOfWeekStart = isNaN(C.dayOfWeekStart) ? 0 : parseInt(C.dayOfWeekStart, 10) % 7, C.timepickerScrollbar || R.xdsoftScroller("hide"), C.minDate && /^[\+\-](.*)$/.test(C.minDate) && (C.minDate = r.formatDate(j.strToDateTime(C.minDate), C.formatDate)), C.maxDate && /^[\+\-](.*)$/.test(C.maxDate) && (C.maxDate = r.formatDate(j.strToDateTime(C.maxDate), C.formatDate)), V.toggle(C.showApplyButton), N.find(".xdsoft_today_button").css("visibility", C.todayButton ? "visible" : "hidden"), N.find("." + C.prev).css("visibility", C.prevButton ? "visible" : "hidden"), N.find("." + C.next).css("visibility", C.nextButton ? "visible" : "hidden"), s(C), C.validateOnBlur && a.off("blur.xdsoft").on("blur.xdsoft", function () { if (C.allowBlank && (!e.trim(e(this).val()).length || "string" == typeof C.mask && e.trim(e(this).val()) === C.mask.replace(/[0-9]/g, "_"))) e(this).val(null), J.data("xdsoft_datetime").empty(); else { var t = r.parseDate(e(this).val(), C.format); if (t) e(this).val(r.formatDate(t, C.format)); else { var a = +[e(this).val()[0], e(this).val()[1]].join(""), n = +[e(this).val()[2], e(this).val()[3]].join(""); e(this).val(!C.datepicker && C.timepicker && a >= 0 && 24 > a && n >= 0 && 60 > n ? [a, n].map(function (e) { return e > 9 ? e : "0" + e }).join(":") : r.formatDate(j.now(), C.format)) } J.data("xdsoft_datetime").setCurrentTime(e(this).val()) } J.trigger("changedatetime.xdsoft"), J.trigger("close.xdsoft") }), C.dayOfWeekStartPrev = 0 === C.dayOfWeekStart ? 6 : C.dayOfWeekStart - 1, J.trigger("xchange.xdsoft").trigger("afterOpen.xdsoft")
            }, J.data("options", C).on("touchstart mousedown.xdsoft", function (e) { return e.stopPropagation(), e.preventDefault(), U.hide(), G.hide(), !1 }), R.append(B), R.xdsoftScroller(), J.on("afterOpen.xdsoft", function () { R.xdsoftScroller() }), J.append(I).append(E), C.withoutCopyright !== !0 && J.append(z), I.append(N).append(L).append(V), e(C.parentID).append(J), d = function () { var t = this; t.now = function (e) { var a, r, n = new Date; return !e && C.defaultDate && (a = t.strToDateTime(C.defaultDate), n.setFullYear(a.getFullYear()), n.setMonth(a.getMonth()), n.setDate(a.getDate())), C.yearOffset && n.setFullYear(n.getFullYear() + C.yearOffset), !e && C.defaultTime && (r = t.strtotime(C.defaultTime), n.setHours(r.getHours()), n.setMinutes(r.getMinutes())), n }, t.isValidDate = function (e) { return "[object Date]" !== Object.prototype.toString.call(e) ? !1 : !isNaN(e.getTime()) }, t.setCurrentTime = function (e, a) { t.currentTime = "string" == typeof e ? t.strToDateTime(e) : t.isValidDate(e) ? e : e || a || !C.allowBlank ? t.now() : null, J.trigger("xchange.xdsoft") }, t.empty = function () { t.currentTime = null }, t.getCurrentTime = function () { return t.currentTime }, t.nextMonth = function () { (void 0 === t.currentTime || null === t.currentTime) && (t.currentTime = t.now()); var a, r = t.currentTime.getMonth() + 1; return 12 === r && (t.currentTime.setFullYear(t.currentTime.getFullYear() + 1), r = 0), a = t.currentTime.getFullYear(), t.currentTime.setDate(Math.min(new Date(t.currentTime.getFullYear(), r + 1, 0).getDate(), t.currentTime.getDate())), t.currentTime.setMonth(r), C.onChangeMonth && e.isFunction(C.onChangeMonth) && C.onChangeMonth.call(J, j.currentTime, J.data("input")), a !== t.currentTime.getFullYear() && e.isFunction(C.onChangeYear) && C.onChangeYear.call(J, j.currentTime, J.data("input")), J.trigger("xchange.xdsoft"), r }, t.prevMonth = function () { (void 0 === t.currentTime || null === t.currentTime) && (t.currentTime = t.now()); var a = t.currentTime.getMonth() - 1; return -1 === a && (t.currentTime.setFullYear(t.currentTime.getFullYear() - 1), a = 11), t.currentTime.setDate(Math.min(new Date(t.currentTime.getFullYear(), a + 1, 0).getDate(), t.currentTime.getDate())), t.currentTime.setMonth(a), C.onChangeMonth && e.isFunction(C.onChangeMonth) && C.onChangeMonth.call(J, j.currentTime, J.data("input")), J.trigger("xchange.xdsoft"), a }, t.getWeekOfYear = function (t) { if (C.onGetWeekOfYear && e.isFunction(C.onGetWeekOfYear)) { var a = C.onGetWeekOfYear.call(J, t); if ("undefined" != typeof a) return a } var r = new Date(t.getFullYear(), 0, 1); return 4 != r.getDay() && r.setMonth(0, 1 + (4 - r.getDay() + 7) % 7), Math.ceil(((t - r) / 864e5 + r.getDay() + 1) / 7) }, t.strToDateTime = function (e) { var a, n, o = []; return e && e instanceof Date && t.isValidDate(e) ? e : (o = /^(\+|\-)(.*)$/.exec(e), o && (o[2] = r.parseDate(o[2], C.formatDate)), o && o[2] ? (a = o[2].getTime() - 6e4 * o[2].getTimezoneOffset(), n = new Date(t.now(!0).getTime() + parseInt(o[1] + "1", 10) * a)) : n = e ? r.parseDate(e, C.format) : t.now(), t.isValidDate(n) || (n = t.now()), n) }, t.strToDate = function (e) { if (e && e instanceof Date && t.isValidDate(e)) return e; var a = e ? r.parseDate(e, C.formatDate) : t.now(!0); return t.isValidDate(a) || (a = t.now(!0)), a }, t.strtotime = function (e) { if (e && e instanceof Date && t.isValidDate(e)) return e; var a = e ? r.parseDate(e, C.formatTime) : t.now(!0); return t.isValidDate(a) || (a = t.now(!0)), a }, t.str = function () { return r.formatDate(t.currentTime, C.format) }, t.currentTime = this.now() }, j = new d, V.on("touchend click", function (e) { e.preventDefault(), J.data("changed", !0), j.setCurrentTime(i()), a.val(j.str()), J.trigger("close.xdsoft") }), N.find(".xdsoft_today_button").on("touchend mousedown.xdsoft", function () { J.data("changed", !0), j.setCurrentTime(0, !0), J.trigger("afterOpen.xdsoft") }).on("dblclick.xdsoft", function () { var e, t, r = j.getCurrentTime(); r = new Date(r.getFullYear(), r.getMonth(), r.getDate()), e = j.strToDate(C.minDate), e = new Date(e.getFullYear(), e.getMonth(), e.getDate()), e > r || (t = j.strToDate(C.maxDate), t = new Date(t.getFullYear(), t.getMonth(), t.getDate()), r > t || (a.val(j.str()), a.trigger("change"), J.trigger("close.xdsoft"))) }), N.find(".xdsoft_prev,.xdsoft_next").on("touchend mousedown.xdsoft", function () { var t = e(this), a = 0, r = !1; !function n(e) { t.hasClass(C.next) ? j.nextMonth() : t.hasClass(C.prev) && j.prevMonth(), C.monthChangeSpinner && (r || (a = setTimeout(n, e || 100))) }(500), e([document.body, window]).on("touchend mouseup.xdsoft", function o() { clearTimeout(a), r = !0, e([document.body, window]).off("touchend mouseup.xdsoft", o) }) }), E.find(".xdsoft_prev,.xdsoft_next").on("touchend mousedown.xdsoft", function () { var t = e(this), a = 0, r = !1, n = 110; !function o(e) { var i = R[0].clientHeight, s = B[0].offsetHeight, d = Math.abs(parseInt(B.css("marginTop"), 10)); t.hasClass(C.next) && s - i - C.timeHeightInTimePicker >= d ? B.css("marginTop", "-" + (d + C.timeHeightInTimePicker) + "px") : t.hasClass(C.prev) && d - C.timeHeightInTimePicker >= 0 && B.css("marginTop", "-" + (d - C.timeHeightInTimePicker) + "px"), R.trigger("scroll_element.xdsoft_scroller", [Math.abs(parseInt(B[0].style.marginTop, 10) / (s - i))]), n = n > 10 ? 10 : n - 10, r || (a = setTimeout(o, e || n)) }(500), e([document.body, window]).on("touchend mouseup.xdsoft", function i() { clearTimeout(a), r = !0, e([document.body, window]).off("touchend mouseup.xdsoft", i) }) }), u = 0, J.on("xchange.xdsoft", function (t) { clearTimeout(u), u = setTimeout(function () { if (void 0 === j.currentTime || null === j.currentTime) { if (C.allowBlank) return; j.currentTime = j.now() } for (var t, i, s, d, u, l, f, c, m, h, g = "", p = new Date(j.currentTime.getFullYear(), j.currentTime.getMonth(), 1, 12, 0, 0), y = 0, v = j.now(), b = !1, D = !1, k = [], x = !0, T = "", S = ""; p.getDay() !== C.dayOfWeekStart;) p.setDate(p.getDate() - 1); for (g += "<table><thead><tr>", C.weeks && (g += "<th></th>"), t = 0; 7 > t; t += 1) g += "<th>" + C.i18n[o].dayOfWeekShort[(t + C.dayOfWeekStart) % 7] + "</th>"; for (g += "</tr></thead>", g += "<tbody>", C.maxDate !== !1 && (b = j.strToDate(C.maxDate), b = new Date(b.getFullYear(), b.getMonth(), b.getDate(), 23, 59, 59, 999)), C.minDate !== !1 && (D = j.strToDate(C.minDate), D = new Date(D.getFullYear(), D.getMonth(), D.getDate())) ; y < j.currentTime.countDaysInMonth() || p.getDay() !== C.dayOfWeekStart || j.currentTime.getMonth() === p.getMonth() ;) k = [], y += 1, s = p.getDay(), d = p.getDate(), u = p.getFullYear(), l = p.getMonth(), f = j.getWeekOfYear(p), h = "", k.push("xdsoft_date"), c = C.beforeShowDay && e.isFunction(C.beforeShowDay.call) ? C.beforeShowDay.call(J, p) : null, C.allowDateRe && "[object RegExp]" === Object.prototype.toString.call(C.allowDateRe) ? C.allowDateRe.test(r.formatDate(p, C.formatDate)) || k.push("xdsoft_disabled") : C.allowDates && C.allowDates.length > 0 ? -1 === C.allowDates.indexOf(r.formatDate(p, C.formatDate)) && k.push("xdsoft_disabled") : b !== !1 && p > b || D !== !1 && D > p || c && c[0] === !1 ? k.push("xdsoft_disabled") : -1 !== C.disabledDates.indexOf(r.formatDate(p, C.formatDate)) ? k.push("xdsoft_disabled") : -1 !== C.disabledWeekDays.indexOf(s) ? k.push("xdsoft_disabled") : a.is("[readonly]") && k.push("xdsoft_disabled"), c && "" !== c[1] && k.push(c[1]), j.currentTime.getMonth() !== l && k.push("xdsoft_other_month"), (C.defaultSelect || J.data("changed")) && r.formatDate(j.currentTime, C.formatDate) === r.formatDate(p, C.formatDate) && k.push("xdsoft_current"), r.formatDate(v, C.formatDate) === r.formatDate(p, C.formatDate) && k.push("xdsoft_today"), (0 === p.getDay() || 6 === p.getDay() || -1 !== C.weekends.indexOf(r.formatDate(p, C.formatDate))) && k.push("xdsoft_weekend"), void 0 !== C.highlightedDates[r.formatDate(p, C.formatDate)] && (i = C.highlightedDates[r.formatDate(p, C.formatDate)], k.push(void 0 === i.style ? "xdsoft_highlighted_default" : i.style), h = void 0 === i.desc ? "" : i.desc), C.beforeShowDay && e.isFunction(C.beforeShowDay) && k.push(C.beforeShowDay(p)), x && (g += "<tr>", x = !1, C.weeks && (g += "<th>" + f + "</th>")), g += '<td data-date="' + d + '" data-month="' + l + '" data-year="' + u + '" class="xdsoft_date xdsoft_day_of_week' + p.getDay() + " " + k.join(" ") + '" title="' + h + '"><div>' + d + "</div></td>", p.getDay() === C.dayOfWeekStartPrev && (g += "</tr>", x = !0), p.setDate(d + 1); if (g += "</tbody></table>", L.html(g), N.find(".xdsoft_label span").eq(0).text(C.i18n[o].months[j.currentTime.getMonth()]), N.find(".xdsoft_label span").eq(1).text(j.currentTime.getFullYear()), T = "", S = "", l = "", m = function (t, n) { var o, i, s = j.now(), d = C.allowTimes && e.isArray(C.allowTimes) && C.allowTimes.length; s.setHours(t), t = parseInt(s.getHours(), 10), s.setMinutes(n), n = parseInt(s.getMinutes(), 10), o = new Date(j.currentTime), o.setHours(t), o.setMinutes(n), k = [], C.minDateTime !== !1 && C.minDateTime > o || C.maxTime !== !1 && j.strtotime(C.maxTime).getTime() < s.getTime() || C.minTime !== !1 && j.strtotime(C.minTime).getTime() > s.getTime() ? k.push("xdsoft_disabled") : C.minDateTime !== !1 && C.minDateTime > o || C.disabledMinTime !== !1 && s.getTime() > j.strtotime(C.disabledMinTime).getTime() && C.disabledMaxTime !== !1 && s.getTime() < j.strtotime(C.disabledMaxTime).getTime() ? k.push("xdsoft_disabled") : a.is("[readonly]") && k.push("xdsoft_disabled"), i = new Date(j.currentTime), i.setHours(parseInt(j.currentTime.getHours(), 10)), d || i.setMinutes(Math[C.roundTime](j.currentTime.getMinutes() / C.step) * C.step), (C.initTime || C.defaultSelect || J.data("changed")) && i.getHours() === parseInt(t, 10) && (!d && C.step > 59 || i.getMinutes() === parseInt(n, 10)) && (C.defaultSelect || J.data("changed") ? k.push("xdsoft_current") : C.initTime && k.push("xdsoft_init_time")), parseInt(v.getHours(), 10) === parseInt(t, 10) && parseInt(v.getMinutes(), 10) === parseInt(n, 10) && k.push("xdsoft_today"), T += '<div class="xdsoft_time ' + k.join(" ") + '" data-hour="' + t + '" data-minute="' + n + '">' + r.formatDate(s, C.formatTime) + "</div>" }, C.allowTimes && e.isArray(C.allowTimes) && C.allowTimes.length) for (y = 0; y < C.allowTimes.length; y += 1) S = j.strtotime(C.allowTimes[y]).getHours(), l = j.strtotime(C.allowTimes[y]).getMinutes(), m(S, l); else for (y = 0, t = 0; y < (C.hours12 ? 12 : 24) ; y += 1) for (t = 0; 60 > t; t += C.step) S = (10 > y ? "0" : "") + y, l = (10 > t ? "0" : "") + t, m(S, l); for (B.html(T), n = "", y = 0, y = parseInt(C.yearStart, 10) + C.yearOffset; y <= parseInt(C.yearEnd, 10) + C.yearOffset; y += 1) n += '<div class="xdsoft_option ' + (j.currentTime.getFullYear() === y ? "xdsoft_current" : "") + '" data-value="' + y + '">' + y + "</div>"; for (U.children().eq(0).html(n), y = parseInt(C.monthStart, 10), n = ""; y <= parseInt(C.monthEnd, 10) ; y += 1) n += '<div class="xdsoft_option ' + (j.currentTime.getMonth() === y ? "xdsoft_current" : "") + '" data-value="' + y + '">' + C.i18n[o].months[y] + "</div>"; G.children().eq(0).html(n), e(J).trigger("generate.xdsoft") }, 10), t.stopPropagation() }).on("afterOpen.xdsoft", function () { if (C.timepicker) { var e, t, a, r; B.find(".xdsoft_current").length ? e = ".xdsoft_current" : B.find(".xdsoft_init_time").length && (e = ".xdsoft_init_time"), e ? (t = R[0].clientHeight, a = B[0].offsetHeight, r = B.find(e).index() * C.timeHeightInTimePicker + 1, r > a - t && (r = a - t), R.trigger("scroll_element.xdsoft_scroller", [parseInt(r, 10) / (a - t)])) : R.trigger("scroll_element.xdsoft_scroller", [0]) } }), P = 0, L.on("touchend click.xdsoft", "td", function (t) { t.stopPropagation(), P += 1; var r = e(this), n = j.currentTime; return (void 0 === n || null === n) && (j.currentTime = j.now(), n = j.currentTime), r.hasClass("xdsoft_disabled") ? !1 : (n.setDate(1), n.setFullYear(r.data("year")), n.setMonth(r.data("month")), n.setDate(r.data("date")), J.trigger("select.xdsoft", [n]), a.val(j.str()), C.onSelectDate && e.isFunction(C.onSelectDate) && C.onSelectDate.call(J, j.currentTime, J.data("input"), t), J.data("changed", !0), J.trigger("xchange.xdsoft"), J.trigger("changedatetime.xdsoft"), (P > 1 || C.closeOnDateSelect === !0 || C.closeOnDateSelect === !1 && !C.timepicker) && !C.inline && J.trigger("close.xdsoft"), void setTimeout(function () { P = 0 }, 200)) }), B.on("touchend click.xdsoft", "div", function (t) { t.stopPropagation(); var a = e(this), r = j.currentTime; return (void 0 === r || null === r) && (j.currentTime = j.now(), r = j.currentTime), a.hasClass("xdsoft_disabled") ? !1 : (r.setHours(a.data("hour")), r.setMinutes(a.data("minute")), J.trigger("select.xdsoft", [r]), J.data("input").val(j.str()), C.onSelectTime && e.isFunction(C.onSelectTime) && C.onSelectTime.call(J, j.currentTime, J.data("input"), t), J.data("changed", !0), J.trigger("xchange.xdsoft"), J.trigger("changedatetime.xdsoft"), void (C.inline !== !0 && C.closeOnTimeSelect === !0 && J.trigger("close.xdsoft"))) }), I.on("mousewheel.xdsoft", function (e) { return C.scrollMonth ? (e.deltaY < 0 ? j.nextMonth() : j.prevMonth(), !1) : !0 }), a.on("mousewheel.xdsoft", function (e) { return C.scrollInput ? !C.datepicker && C.timepicker ? (A = B.find(".xdsoft_current").length ? B.find(".xdsoft_current").eq(0).index() : 0, A + e.deltaY >= 0 && A + e.deltaY < B.children().length && (A += e.deltaY), B.children().eq(A).length && B.children().eq(A).trigger("mousedown"), !1) : C.datepicker && !C.timepicker ? (I.trigger(e, [e.deltaY, e.deltaX, e.deltaY]), a.val && a.val(j.str()), J.trigger("changedatetime.xdsoft"), !1) : void 0 : !0 }), J.on("changedatetime.xdsoft", function (t) { if (C.onChangeDateTime && e.isFunction(C.onChangeDateTime)) { var a = J.data("input"); C.onChangeDateTime.call(J, j.currentTime, a, t), delete C.value, a.trigger("change") } }).on("generate.xdsoft", function () { C.onGenerate && e.isFunction(C.onGenerate) && C.onGenerate.call(J, j.currentTime, J.data("input")), q && (J.trigger("afterOpen.xdsoft"), q = !1) }).on("click.xdsoft", function (e) { e.stopPropagation() }), A = 0, H = function (e, t) { do if (e = e.parentNode, t(e) === !1) break; while ("HTML" !== e.nodeName) }, Y = function () { var t, a, r, n, o, i, s, d, u, l, f, c, m; if (d = J.data("input"), t = d.offset(), a = d[0], l = "top", r = t.top + a.offsetHeight - 1, n = t.left, o = "absolute", u = e(window).width(), c = e(window).height(), m = e(window).scrollTop(), document.documentElement.clientWidth - t.left < I.parent().outerWidth(!0)) { var h = I.parent().outerWidth(!0) - a.offsetWidth; n -= h } "rtl" === d.parent().css("direction") && (n -= J.outerWidth() - d.outerWidth()), C.fixed ? (r -= m, n -= e(window).scrollLeft(), o = "fixed") : (s = !1, H(a, function (e) { return "fixed" === window.getComputedStyle(e).getPropertyValue("position") ? (s = !0, !1) : void 0 }), s ? (o = "fixed", r + J.outerHeight() > c + m ? (l = "bottom", r = c + m - t.top) : r -= m) : r + a.offsetHeight > c + m && (r = t.top - a.offsetHeight + 1), 0 > r && (r = 0), n + a.offsetWidth > u && (n = u - a.offsetWidth)), i = J[0], H(i, function (e) { var t; return t = window.getComputedStyle(e).getPropertyValue("position"), "relative" === t && u >= e.offsetWidth ? (n -= (u - e.offsetWidth) / 2, !1) : void 0 }), f = { position: o, left: n, top: "", bottom: "" }, f[l] = r, J.css(f) }, J.on("open.xdsoft", function (t) { var a = !0; C.onShow && e.isFunction(C.onShow) && (a = C.onShow.call(J, j.currentTime, J.data("input"), t)), a !== !1 && (J.show(), Y(), e(window).off("resize.xdsoft", Y).on("resize.xdsoft", Y), C.closeOnWithoutClick && e([document.body, window]).on("touchstart mousedown.xdsoft", function r() { J.trigger("close.xdsoft"), e([document.body, window]).off("touchstart mousedown.xdsoft", r) })) }).on("close.xdsoft", function (t) { var a = !0; N.find(".xdsoft_month,.xdsoft_year").find(".xdsoft_select").hide(), C.onClose && e.isFunction(C.onClose) && (a = C.onClose.call(J, j.currentTime, J.data("input"), t)), a === !1 || C.opened || C.inline || J.hide(), t.stopPropagation() }).on("toggle.xdsoft", function () { J.trigger(J.is(":visible") ? "close.xdsoft" : "open.xdsoft") }).data("input", a), X = 0, J.data("xdsoft_datetime", j), J.setOptions(C), j.setCurrentTime(i()), a.data("xdsoft_datetimepicker", J).on("open.xdsoft focusin.xdsoft mousedown.xdsoft touchstart", function () { a.is(":disabled") || a.data("xdsoft_datetimepicker").is(":visible") && C.closeOnInputClick || (clearTimeout(X), X = setTimeout(function () { a.is(":disabled") || (q = !0, j.setCurrentTime(i(), !0), C.mask && s(C), J.trigger("open.xdsoft")) }, 100)) }).on("keydown.xdsoft", function (t) { var a, r = t.which; return -1 !== [p].indexOf(r) && C.enterLikeTab ? (a = e("input:visible,textarea:visible,button:visible,a:visible"), J.trigger("close.xdsoft"), a.eq(a.index(this) + 1).focus(), !1) : -1 !== [T].indexOf(r) ? (J.trigger("close.xdsoft"), !0) : void 0 }).on("blur.xdsoft", function () { J.trigger("close.xdsoft") })
        }, d = function (t) { var a = t.data("xdsoft_datetimepicker"); a && (a.data("xdsoft_datetime", null), a.remove(), t.data("xdsoft_datetimepicker", null).off(".xdsoft"), e(window).off("resize.xdsoft"), e([window, document.body]).off("mousedown.xdsoft touchstart"), t.unmousewheel && t.unmousewheel()) }, e(document).off("keydown.xdsoftctrl keyup.xdsoftctrl").on("keydown.xdsoftctrl", function (e) { e.keyCode === h && (F = !0) }).on("keyup.xdsoftctrl", function (e) { e.keyCode === h && (F = !1) }), this.each(function () { var t, a = e(this).data("xdsoft_datetimepicker"); if (a) { if ("string" === e.type(n)) switch (n) { case "show": e(this).select().focus(), a.trigger("open.xdsoft"); break; case "hide": a.trigger("close.xdsoft"); break; case "toggle": a.trigger("toggle.xdsoft"); break; case "destroy": d(e(this)); break; case "reset": this.value = this.defaultValue, this.value && a.data("xdsoft_datetime").isValidDate(r.parseDate(this.value, C.format)) || a.data("changed", !1), a.data("xdsoft_datetime").setCurrentTime(this.value); break; case "validate": t = a.data("input"), t.trigger("blur.xdsoft"); break; default: a[n] && e.isFunction(a[n]) && (u = a[n](i)) } else a.setOptions(n); return 0 } "string" !== e.type(n) && (!C.lazyInit || C.open || C.inline ? s(e(this)) : A(e(this))) }), u
    }, e.fn.datetimepicker.defaults = a
}), function (e) { "function" == typeof define && define.amd ? define(["jquery"], e) : "object" == typeof exports ? module.exports = e : e(jQuery) }(function (e) { function t(t) { var i = t || window.event, s = d.call(arguments, 1), u = 0, f = 0, c = 0, m = 0, h = 0, g = 0; if (t = e.event.fix(i), t.type = "mousewheel", "detail" in i && (c = -1 * i.detail), "wheelDelta" in i && (c = i.wheelDelta), "wheelDeltaY" in i && (c = i.wheelDeltaY), "wheelDeltaX" in i && (f = -1 * i.wheelDeltaX), "axis" in i && i.axis === i.HORIZONTAL_AXIS && (f = -1 * c, c = 0), u = 0 === c ? f : c, "deltaY" in i && (c = -1 * i.deltaY, u = c), "deltaX" in i && (f = i.deltaX, 0 === c && (u = -1 * f)), 0 !== c || 0 !== f) { if (1 === i.deltaMode) { var p = e.data(this, "mousewheel-line-height"); u *= p, c *= p, f *= p } else if (2 === i.deltaMode) { var y = e.data(this, "mousewheel-page-height"); u *= y, c *= y, f *= y } if (m = Math.max(Math.abs(c), Math.abs(f)), (!o || o > m) && (o = m, r(i, m) && (o /= 40)), r(i, m) && (u /= 40, f /= 40, c /= 40), u = Math[u >= 1 ? "floor" : "ceil"](u / o), f = Math[f >= 1 ? "floor" : "ceil"](f / o), c = Math[c >= 1 ? "floor" : "ceil"](c / o), l.settings.normalizeOffset && this.getBoundingClientRect) { var v = this.getBoundingClientRect(); h = t.clientX - v.left, g = t.clientY - v.top } return t.deltaX = f, t.deltaY = c, t.deltaFactor = o, t.offsetX = h, t.offsetY = g, t.deltaMode = 0, s.unshift(t, u, f, c), n && clearTimeout(n), n = setTimeout(a, 200), (e.event.dispatch || e.event.handle).apply(this, s) } } function a() { o = null } function r(e, t) { return l.settings.adjustOldDeltas && "mousewheel" === e.type && t % 120 === 0 } var n, o, i = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"], s = "onwheel" in document || document.documentMode >= 9 ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"], d = Array.prototype.slice; if (e.event.fixHooks) for (var u = i.length; u;) e.event.fixHooks[i[--u]] = e.event.mouseHooks; var l = e.event.special.mousewheel = { version: "3.1.12", setup: function () { if (this.addEventListener) for (var a = s.length; a;) this.addEventListener(s[--a], t, !1); else this.onmousewheel = t; e.data(this, "mousewheel-line-height", l.getLineHeight(this)), e.data(this, "mousewheel-page-height", l.getPageHeight(this)) }, teardown: function () { if (this.removeEventListener) for (var a = s.length; a;) this.removeEventListener(s[--a], t, !1); else this.onmousewheel = null; e.removeData(this, "mousewheel-line-height"), e.removeData(this, "mousewheel-page-height") }, getLineHeight: function (t) { var a = e(t), r = a["offsetParent" in e.fn ? "offsetParent" : "parent"](); return r.length || (r = e("body")), parseInt(r.css("fontSize"), 10) || parseInt(a.css("fontSize"), 10) || 16 }, getPageHeight: function (t) { return e(t).height() }, settings: { adjustOldDeltas: !0, normalizeOffset: !0 } }; e.fn.extend({ mousewheel: function (e) { return e ? this.bind("mousewheel", e) : this.trigger("mousewheel") }, unmousewheel: function (e) { return this.unbind("mousewheel", e) } }) });

//added code
document.addEventListener('scroll', function (e) {
    $('.xdsoft_datetimepicker').css("display", "none");
    $('.month-picker').css("display", "none");
}, true);
+function ($) { "use strict"; var event_body = !1, Confirmation = function (t, n) { var o = this; this.init("confirmation", t, n), n.selector ? $(t).on("click.bs.confirmation", n.selector, function (t) { t.preventDefault() }) : $(t).on("show.bs.confirmation", function (t) { o.runCallback(o.options.onShow, t, o.$element), o.$element.addClass("open"), o.options.singleton && $(o.options.all_selector).not(o.$element).each(function () { $(this).hasClass("open") && $(this).confirmation("hide") }) }).on("hide.bs.confirmation", function (t) { o.runCallback(o.options.onHide, t, o.$element), o.$element.removeClass("open") }).on("shown.bs.confirmation", function (t) { (o.isPopout() || event_body) && (event_body = $("body").on("click", function (t) { o.$element.is(t.target) || o.$element.has(t.target).length || $(".popover").has(t.target).length || (o.hide(), o.inState.click = !1, $("body").unbind(t), event_body = !1) })) }).on("click.bs.confirmation", function (t) { t.preventDefault() }) }; if (!$.fn.popover || !$.fn.tooltip) throw new Error("Confirmation requires popover.js and tooltip.js"); Confirmation.VERSION = "1.0.7", Confirmation.DEFAULTS = $.extend({}, $.fn.popover.Constructor.DEFAULTS, { placement: "right", title: "Are you sure?", btnOkClass: "btn btn-sm btn-danger", btnOkLabel: "Delete", btnOkIcon: "glyphicon glyphicon-ok", btnCancelClass: "btn btn-sm btn-default", btnCancelLabel: "Cancel", btnCancelIcon: "glyphicon glyphicon-remove", href: "#", target: "_self", singleton: !0, popout: !0, onShow: function (t, n) { }, onHide: function (t, n) { }, onConfirm: function (t, n) { }, onCancel: function (t, n) { }, template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"> <a data-apply="confirmation">Yes</a> <a data-dismiss="confirmation">No</a></div></div>' }), Confirmation.prototype = $.extend({}, $.fn.popover.Constructor.prototype), Confirmation.prototype.constructor = Confirmation, Confirmation.prototype.getDefaults = function () { return Confirmation.DEFAULTS }, Confirmation.prototype.setContent = function () { var t = this, n = this.tip(), o = this.getTitle(), e = n.find('[data-apply="confirmation"]'), i = n.find('[data-dismiss="confirmation"]'); this.options; e.addClass(this.getBtnOkClass()).html(this.getBtnOkLabel()).prepend($("<i></i>").addClass(this.getBtnOkIcon()), " ").attr("href", this.getHref()).attr("target", this.getTarget()).off("click").on("click", function (n) { if (t.runCallback(t.options.onConfirm, n, t.$element), "submit" == t.$element.attr("type")) { var o = t.$element.closest("form"); (void 0 !== o.attr("novalidate") || o[0].checkValidity()) && o.submit() } t.hide(), t.inState.click = !1, t.$element.trigger($.Event("confirm.bs.confirmation")) }), i.addClass(this.getBtnCancelClass()).html(this.getBtnCancelLabel()).prepend($("<i></i>").addClass(this.getBtnCancelIcon()), " ").off("click").on("click", function (n) { t.runCallback(t.options.onCancel, n, t.$element), t.hide(), t.inState.click = !1, t.$element.trigger($.Event("cancel.bs.confirmation")) }), n.find(".popover-title")[this.options.html ? "html" : "text"](o), n.removeClass("fade top bottom left right in"), n.find(".popover-title").html() || n.find(".popover-title").hide() }, Confirmation.prototype.getBtnOkClass = function () { return this.$element.data("btnOkClass") || ("function" == typeof this.options.btnOkClass ? this.options.btnOkClass.call(this, this.$element) : this.options.btnOkClass) }, Confirmation.prototype.getBtnOkLabel = function () { return this.$element.data("btnOkLabel") || ("function" == typeof this.options.btnOkLabel ? this.options.btnOkLabel.call(this, this.$element) : this.options.btnOkLabel) }, Confirmation.prototype.getBtnOkIcon = function () { return this.$element.data("btnOkIcon") || ("function" == typeof this.options.btnOkIcon ? this.options.btnOkIcon.call(this, this.$element) : this.options.btnOkIcon) }, Confirmation.prototype.getBtnCancelClass = function () { return this.$element.data("btnCancelClass") || ("function" == typeof this.options.btnCancelClass ? this.options.btnCancelClass.call(this, this.$element) : this.options.btnCancelClass) }, Confirmation.prototype.getBtnCancelLabel = function () { return this.$element.data("btnCancelLabel") || ("function" == typeof this.options.btnCancelLabel ? this.options.btnCancelLabel.call(this, this.$element) : this.options.btnCancelLabel) }, Confirmation.prototype.getBtnCancelIcon = function () { return this.$element.data("btnCancelIcon") || ("function" == typeof this.options.btnCancelIcon ? this.options.btnCancelIcon.call(this, this.$element) : this.options.btnCancelIcon) }, Confirmation.prototype.getTitle = function () { return this.$element.data("confirmation-title") || this.$element.data("title") || this.$element.attr("title") || ("function" == typeof this.options.title ? this.options.title.call(this, this.$element) : this.options.title) }, Confirmation.prototype.getHref = function () { return this.$element.data("href") || this.$element.attr("href") || ("function" == typeof this.options.href ? this.options.href.call(this, this.$element) : this.options.href) }, Confirmation.prototype.getTarget = function () { return this.$element.data("target") || this.$element.attr("target") || ("function" == typeof this.options.target ? this.options.target.call(this, this.$element) : this.options.target) }, Confirmation.prototype.isPopout = function () { var t = this.$element.data("popout") || ("function" == typeof this.options.popout ? this.options.popout.call(this, this.$element) : this.options.popout); return "false" == t && (t = !1), t }, Confirmation.prototype.runCallback = function (callback, event, element) { "function" == typeof callback ? callback.call(this, event, element) : "string" == typeof callback && eval(callback) }; var old = $.fn.confirmation; $.fn.confirmation = function (t) { var n = this; return this.each(function () { var o = $(this), e = o.data("bs.confirmation"), i = "object" == typeof t && t; (i = i || {}).all_selector = n.selector, (e || "destroy" != t) && (e || o.data("bs.confirmation", e = new Confirmation(this, i)), "string" == typeof t && e[t]()) }) }, $.fn.confirmation.Constructor = Confirmation, $.fn.confirmation.noConflict = function () { return $.fn.confirmation = old, this } }(jQuery);
// jQuery Mask Plugin v1.14.9
// github.com/igorescobar/jQuery-Mask-Plugin
var $jscomp = { scope: {}, findInternal: function (a, f, c) { a instanceof String && (a = String(a)); for (var l = a.length, g = 0; g < l; g++) { var b = a[g]; if (f.call(c, b, g, a)) return { i: g, v: b } } return { i: -1, v: void 0 } } }; $jscomp.defineProperty = "function" == typeof Object.defineProperties ? Object.defineProperty : function (a, f, c) { if (c.get || c.set) throw new TypeError("ES3 does not support getters and setters."); a != Array.prototype && a != Object.prototype && (a[f] = c.value) };
$jscomp.getGlobal = function (a) { return "undefined" != typeof window && window === a ? a : "undefined" != typeof global && null != global ? global : a }; $jscomp.global = $jscomp.getGlobal(this); $jscomp.polyfill = function (a, f, c, l) { if (f) { c = $jscomp.global; a = a.split("."); for (l = 0; l < a.length - 1; l++) { var g = a[l]; g in c || (c[g] = {}); c = c[g] } a = a[a.length - 1]; l = c[a]; f = f(l); f != l && null != f && $jscomp.defineProperty(c, a, { configurable: !0, writable: !0, value: f }) } };
$jscomp.polyfill("Array.prototype.find", function (a) { return a ? a : function (a, c) { return $jscomp.findInternal(this, a, c).v } }, "es6-impl", "es3");
(function (a, f, c) { "function" === typeof define && define.amd ? define(["jquery"], a) : "object" === typeof exports ? module.exports = a(require("jquery")) : a(f || c) })(function (a) {
    var f = function (b, h, e) {
        var d = {
            invalid: [], getCaret: function () { try { var a, n = 0, h = b.get(0), e = document.selection, k = h.selectionStart; if (e && -1 === navigator.appVersion.indexOf("MSIE 10")) a = e.createRange(), a.moveStart("character", -d.val().length), n = a.text.length; else if (k || "0" === k) n = k; return n } catch (A) { } }, setCaret: function (a) {
                try {
                    if (b.is(":focus")) {
                        var p,
                        d = b.get(0); d.setSelectionRange ? d.setSelectionRange(a, a) : (p = d.createTextRange(), p.collapse(!0), p.moveEnd("character", a), p.moveStart("character", a), p.select())
                    }
                } catch (z) { }
            }, events: function () {
                b.on("keydown.mask", function (a) { b.data("mask-keycode", a.keyCode || a.which); b.data("mask-previus-value", b.val()) }).on(a.jMaskGlobals.useInput ? "input.mask" : "keyup.mask", d.behaviour).on("paste.mask drop.mask", function () { setTimeout(function () { b.keydown().keyup() }, 100) }).on("change.mask", function () { b.data("changed", !0) }).on("blur.mask",
                function () { c === d.val() || b.data("changed") || b.trigger("change"); b.data("changed", !1) }).on("blur.mask", function () { c = d.val() }).on("focus.mask", function (b) { !0 === e.selectOnFocus && a(b.target).select() }).on("focusout.mask", function () { e.clearIfNotMatch && !g.test(d.val()) && d.val("") })
            }, getRegexMask: function () {
                for (var a = [], b, d, e, k, c = 0; c < h.length; c++) (b = m.translation[h.charAt(c)]) ? (d = b.pattern.toString().replace(/.{1}$|^.{1}/g, ""), e = b.optional, (b = b.recursive) ? (a.push(h.charAt(c)), k = { digit: h.charAt(c), pattern: d }) :
                a.push(e || b ? d + "?" : d)) : a.push(h.charAt(c).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")); a = a.join(""); k && (a = a.replace(new RegExp("(" + k.digit + "(.*" + k.digit + ")?)"), "($1)?").replace(new RegExp(k.digit, "g"), k.pattern)); return new RegExp(a)
            }, destroyEvents: function () { b.off("input keydown keyup paste drop blur focusout ".split(" ").join(".mask ")) }, val: function (a) { var d = b.is("input") ? "val" : "text"; if (0 < arguments.length) { if (b[d]() !== a) b[d](a); d = b } else d = b[d](); return d }, calculateCaretPosition: function (a, d) {
                var h =
                d.length, e = b.data("mask-previus-value"), k = e.length; 8 === b.data("mask-keycode") && e !== d ? a -= d.slice(0, a).length - e.slice(0, a).length : e !== d && (a = a >= k ? h : a + (d.slice(0, a).length - e.slice(0, a).length)); return a
            }, behaviour: function (e) { e = e || window.event; d.invalid = []; var h = b.data("mask-keycode"); if (-1 === a.inArray(h, m.byPassKeys)) { var h = d.getMasked(), c = d.getCaret(); setTimeout(function (a, b) { d.setCaret(d.calculateCaretPosition(a, b)) }, 10, c, h); d.val(h); d.setCaret(c); return d.callbacks(e) } }, getMasked: function (a, b) {
                var c =
                [], p = void 0 === b ? d.val() : b + "", k = 0, g = h.length, f = 0, l = p.length, n = 1, v = "push", w = -1, r, u; e.reverse ? (v = "unshift", n = -1, r = 0, k = g - 1, f = l - 1, u = function () { return -1 < k && -1 < f }) : (r = g - 1, u = function () { return k < g && f < l }); for (var y; u() ;) {
                    var x = h.charAt(k), t = p.charAt(f), q = m.translation[x]; if (q) t.match(q.pattern) ? (c[v](t), q.recursive && (-1 === w ? w = k : k === r && (k = w - n), r === w && (k -= n)), k += n) : t === y ? y = void 0 : q.optional ? (k += n, f -= n) : q.fallback ? (c[v](q.fallback), k += n, f -= n) : d.invalid.push({ p: f, v: t, e: q.pattern }), f += n; else {
                        if (!a) c[v](x); t === x ?
                        f += n : y = x; k += n
                    }
                } p = h.charAt(r); g !== l + 1 || m.translation[p] || c.push(p); return c.join("")
            }, callbacks: function (a) { var f = d.val(), p = f !== c, g = [f, a, b, e], k = function (a, b, d) { "function" === typeof e[a] && b && e[a].apply(this, d) }; k("onChange", !0 === p, g); k("onKeyPress", !0 === p, g); k("onComplete", f.length === h.length, g); k("onInvalid", 0 < d.invalid.length, [f, a, b, d.invalid, e]) }
        }; b = a(b); var m = this, c = d.val(), g; h = "function" === typeof h ? h(d.val(), void 0, b, e) : h; m.mask = h; m.options = e; m.remove = function () {
            var a = d.getCaret(); d.destroyEvents();
            d.val(m.getCleanVal()); d.setCaret(a); return b
        }; m.getCleanVal = function () { return d.getMasked(!0) }; m.getMaskedVal = function (a) { return d.getMasked(!1, a) }; m.init = function (c) {
            c = c || !1; e = e || {}; m.clearIfNotMatch = a.jMaskGlobals.clearIfNotMatch; m.byPassKeys = a.jMaskGlobals.byPassKeys; m.translation = a.extend({}, a.jMaskGlobals.translation, e.translation); m = a.extend(!0, {}, m, e); g = d.getRegexMask(); if (c) d.events(), d.val(d.getMasked()); else {
                e.placeholder && b.attr("placeholder", e.placeholder); b.data("mask") && b.attr("autocomplete",
                "off"); c = 0; for (var f = !0; c < h.length; c++) { var l = m.translation[h.charAt(c)]; if (l && l.recursive) { f = !1; break } } f && b.attr("maxlength", h.length); d.destroyEvents(); d.events(); c = d.getCaret(); d.val(d.getMasked()); d.setCaret(c)
            }
        }; m.init(!b.is("input"))
    }; a.maskWatchers = {}; var c = function () {
        var b = a(this), c = {}, e = b.attr("data-mask"); b.attr("data-mask-reverse") && (c.reverse = !0); b.attr("data-mask-clearifnotmatch") && (c.clearIfNotMatch = !0); "true" === b.attr("data-mask-selectonfocus") && (c.selectOnFocus = !0); if (l(b, e, c)) return b.data("mask",
        new f(this, e, c))
    }, l = function (b, c, e) { e = e || {}; var d = a(b).data("mask"), h = JSON.stringify; b = a(b).val() || a(b).text(); try { return "function" === typeof c && (c = c(b)), "object" !== typeof d || h(d.options) !== h(e) || d.mask !== c } catch (u) { } }, g = function (a) { var b = document.createElement("div"), c; a = "on" + a; c = a in b; c || (b.setAttribute(a, "return;"), c = "function" === typeof b[a]); return c }; a.fn.mask = function (b, c) {
        c = c || {}; var e = this.selector, d = a.jMaskGlobals, h = d.watchInterval, d = c.watchInputs || d.watchInputs, g = function () {
            if (l(this, b,
            c)) return a(this).data("mask", new f(this, b, c))
        }; a(this).each(g); e && "" !== e && d && (clearInterval(a.maskWatchers[e]), a.maskWatchers[e] = setInterval(function () { a(document).find(e).each(g) }, h)); return this
    }; a.fn.masked = function (a) { return this.data("mask").getMaskedVal(a) }; a.fn.unmask = function () { clearInterval(a.maskWatchers[this.selector]); delete a.maskWatchers[this.selector]; return this.each(function () { var b = a(this).data("mask"); b && b.remove().removeData("mask") }) }; a.fn.cleanVal = function () { return this.data("mask").getCleanVal() };
    a.applyDataMask = function (b) { b = b || a.jMaskGlobals.maskElements; (b instanceof a ? b : a(b)).filter(a.jMaskGlobals.dataMaskAttr).each(c) }; g = {
        maskElements: "input,td,span,div", dataMaskAttr: "*[data-mask]", dataMask: !0, watchInterval: 300, watchInputs: !0, useInput: !/Chrome\/[2-4][0-9]|SamsungBrowser/.test(window.navigator.userAgent) && g("input"), watchDataMask: !1, byPassKeys: [9, 16, 17, 18, 36, 37, 38, 39, 40, 91], translation: {
            0: { pattern: /\d/ }, 9: { pattern: /\d/, optional: !0 }, "#": { pattern: /\d/, recursive: !0 }, A: { pattern: /[a-zA-Z0-9]/ },
            S: { pattern: /[a-zA-Z]/ }
        }
    }; a.jMaskGlobals = a.jMaskGlobals || {}; g = a.jMaskGlobals = a.extend(!0, {}, g, a.jMaskGlobals); g.dataMask && a.applyDataMask(); setInterval(function () { a.jMaskGlobals.watchDataMask && a.applyDataMask() }, g.watchInterval)
}, window.jQuery, window.Zepto);
(function ($) {
    /*register loader*/
    $.fn.EbLoader = function (action,options) {
        /*the target*/
        var el = $(this);
        var operation = action;
        var settings = $.extend({
            color:"#ec9351",
            bgColor: 'transparent', // Default background color 
            maskItem: {},
            maskLoader:true
        }, options);

        //maskItem:{
        //Id: "",
        //Style:{}   //jquery css
        //}

        //Apply styles
        el.css("background-color", settings.bgColor);

        maskItem = $(settings.maskItem.Id);

        if (!el.hasClass('eb-loader-prcbar')) {
            el.addClass('eb-loader-prcbar');
        }
        else {
            showPrc();
        }

        if (action === "show") {
            if (!$.isEmptyObject(settings.maskItem)) {
                maskItem.append(`<div class="loader_mask_EB" id="${el.attr("id")}loader_mask_item"></div>`);
                appendMaskStyle();
            }
            if (settings.maskLoader) {
                $(`#${el.attr("id")}loader_mask_item`).append(`<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div>
                                    <div></div><div></div><div></div><div></div><div>
                                    </div><div></div><div></div></div>`);
            }
        }

        function appendMaskStyle() {
            if (!$.isEmptyObject(settings.maskItem.Style)) {
                $(`#${el.attr("id")}loader_mask_item`).css(settings.maskItem.Style);
            }
        };
        
        //show function for processbar
        function showPrc() {
            el.show();
            if (!$.isEmptyObject(settings.maskItem))
                $(`#${el.attr("id")}loader_mask_item`).show();
        };
        
        //hide function for processbar
        function hidePrc() {
            el.hide();
            $(`#${el.attr("id")}loader_mask_item`).remove();
        };

        if (operation === "show")
            showPrc();
        else if (operation === "hide")
            hidePrc();
        else return null;    
    };
}(jQuery));
function EbMessage(action, options) {
        var operation = action;
        var settings = $.extend({
            Background: "#31d031",
            Message: "nothing to display",
            FontColor: "#fff",
            AutoHide: true,
            Delay: 8000
        }, options);       

        function onHide() {
            return options.onHide();
        }

        function onShow() {
            return options.onShow();
        }
    
        function div() {
            if ($('#eb_messageBox_container').length === 0)
                $('body').append(`<div class="eb_messageBox_container" id="eb_messageBox_container" style="background-color:${settings.Background};color:${settings.FontColor}">
                                  <span class="msg">${settings.Message}</span>
                                  <i class="fa fa-close pull-right" onclick="$(this).parent().hide();" id="close-msg"></i>
                                </div>`);
            else {
                $(`#eb_messageBox_container .msg`).text(settings.Message);
                $(`#eb_messageBox_container`).css({ "background-color": settings.Background, "color": settings.FontColor });
            }
        }

        function showMsg() {
            div();
            $(`#eb_messageBox_container`).fadeIn();
            settings.AutoHide ? setTimeout(function () { hideMsg(); }, settings.Delay) : null;
            if (options.onShow)
                onShow();
        };

        function hideMsg() {
            $(`#eb_messageBox_container`).fadeOut();
            if (options.onHide)
                onHide();
        };
    
        if (operation === "show")
            showMsg();
        else if (operation === "hide")
            hideMsg();
        else return null;
        
    };
function EbPopBox(op,o) {
    var event = op;
    var settings = $.extend({
        Message: "nothing to display",
        Callback: function () {

        },
        ButtonStyle: {
            Text:"Close",
            Color: "white",
            Background: "#508bf9",
            Callback: function () {}
        },
        Title: "Message",
        Html: function ($selector) {

        }
    }, o);

    function popBoxHtml() {
        if ($("#eb-popbox-fade").length <= 0) {
            $("body").append(`<div class="eb-popbox-fade" id="eb-popbox-fade" style="position:fixed;display:none;
                                    height:100%;left:0;top:0;width:100%;background:black;opacity:.5;z-index:500">
                            </div>`);
        }
        if ($("#eb-popbox-container").length <= 0) {
            $('body').append(`<div class="eb-popbox-container" id="eb-popbox-container" style="position: fixed;display:none;
                                width: 100%;height: 100%;z-index: 1000;top: 0;left: 0;">
                                    <div class="eb-popbox-container-flex" style="height:inherit;width:inherit;
                                    display:flex;justify-content:center;align-items:center;">
                                        <div class="eb-popbox-container-inner" style="background:white;min-height: 200px;
                                        max-width:60%;display: flex;flex-flow: column;border: none;border-radius: 8px;
                                        box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15);min-width: 320px;">
                                            <div class="eb-popbox-container-head" style="padding: 15px;font-size: 16px;">
                                                ${settings.Title}
                                            </div>
                                            <div class="eb-popbox-container-bdy" style="flex: 1;padding: 0 15px;display:flex;align-items:center">
                                                ${settings.Message}
                                            </div>
                                            <div class="eb-popbox-container-footer" style="padding: 15px;display: flex;flex-flow: row-reverse;">
                                                <button id="eb-popbox-close" style="background: ${settings.ButtonStyle.Background};
                                                    color: ${settings.ButtonStyle.Color};
                                                    border-style: none;
                                                    border-radius: 4px;
                                                    padding: 5px 10px;">${settings.ButtonStyle.Text}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>`);
            $("#eb-popbox-close").on("click", function () { settings.ButtonStyle.Callback(); hideBox(); })
        }
        else {
            $("#eb-popbox-container .eb-popbox-container-head").text(settings.Title);
            $("#eb-popbox-container .eb-popbox-container-bdy").text(settings.Message);
        }
        settings.Html($("#eb-popbox-container .eb-popbox-container-bdy"));
    }

    function showBox() {
        popBoxHtml();
        $(`#eb-popbox-fade`).show();
        $(`#eb-popbox-container`).fadeIn();
    };

    function hideBox() {
        $(`#eb-popbox-fade`).hide();
        $(`#eb-popbox-container`).hide();
    };

    if (event === "show") {
        showBox();
        return true;
    }
    else if (event === "hide") {
        hideBox();
        return false;
    }
    else return false;
}
/*! ========================================================================
 * Bootstrap Toggle: bootstrap-toggle.js v2.2.0
 * http://www.bootstraptoggle.com
 * ========================================================================
 * Copyright 2014 Min Hur, The New York Times Company
 * Licensed under MIT
 * ======================================================================== */
+function (a) { "use strict"; function b(b) { return this.each(function () { var d = a(this), e = d.data("bs.toggle"), f = "object" == typeof b && b; e || d.data("bs.toggle", e = new c(this, f)), "string" == typeof b && e[b] && e[b]() }) } var c = function (b, c) { this.$element = a(b), this.options = a.extend({}, this.defaults(), c), this.render() }; c.VERSION = "2.2.0", c.DEFAULTS = { on: "On", off: "Off", onstyle: "primary", offstyle: "default", size: "normal", style: "", width: null, height: null }, c.prototype.defaults = function () { return { on: this.$element.attr("data-on") || c.DEFAULTS.on, off: this.$element.attr("data-off") || c.DEFAULTS.off, onstyle: this.$element.attr("data-onstyle") || c.DEFAULTS.onstyle, offstyle: this.$element.attr("data-offstyle") || c.DEFAULTS.offstyle, size: this.$element.attr("data-size") || c.DEFAULTS.size, style: this.$element.attr("data-style") || c.DEFAULTS.style, width: this.$element.attr("data-width") || c.DEFAULTS.width, height: this.$element.attr("data-height") || c.DEFAULTS.height } }, c.prototype.render = function () { this._onstyle = "btn-" + this.options.onstyle, this._offstyle = "btn-" + this.options.offstyle; var b = "large" === this.options.size ? "btn-lg" : "small" === this.options.size ? "btn-sm" : "mini" === this.options.size ? "btn-xs" : "", c = a('<label class="btn">').html(this.options.on).addClass(this._onstyle + " " + b), d = a('<label class="btn">').html(this.options.off).addClass(this._offstyle + " " + b + " active"), e = a('<span class="toggle-handle btn btn-default">').addClass(b), f = a('<div class="toggle-group">').append(c, d, e), g = a('<div class="toggle btn" data-toggle="toggle">').addClass(this.$element.prop("checked") ? this._onstyle : this._offstyle + " off").addClass(b).addClass(this.options.style); this.$element.wrap(g), a.extend(this, { $toggle: this.$element.parent(), $toggleOn: c, $toggleOff: d, $toggleGroup: f }), this.$toggle.append(f); var h = this.options.width || Math.max(c.outerWidth(), d.outerWidth()) + e.outerWidth() / 2, i = this.options.height || Math.max(c.outerHeight(), d.outerHeight()); c.addClass("toggle-on"), d.addClass("toggle-off"), this.$toggle.css({ width: h, height: i }), this.options.height && (c.css("line-height", c.height() + "px"), d.css("line-height", d.height() + "px")), this.update(!0), this.trigger(!0) }, c.prototype.toggle = function () { this.$element.prop("checked") ? this.off() : this.on() }, c.prototype.on = function (a) { return this.$element.prop("disabled") ? !1 : (this.$toggle.removeClass(this._offstyle + " off").addClass(this._onstyle), this.$element.prop("checked", !0), void (a || this.trigger())) }, c.prototype.off = function (a) { return this.$element.prop("disabled") ? !1 : (this.$toggle.removeClass(this._onstyle).addClass(this._offstyle + " off"), this.$element.prop("checked", !1), void (a || this.trigger())) }, c.prototype.enable = function () { this.$toggle.removeAttr("disabled"), this.$element.prop("disabled", !1) }, c.prototype.disable = function () { this.$toggle.attr("disabled", "disabled"), this.$element.prop("disabled", !0) }, c.prototype.update = function (a) { this.$element.prop("disabled") ? this.disable() : this.enable(), this.$element.prop("checked") ? this.on(a) : this.off(a) }, c.prototype.trigger = function (b) { this.$element.off("change.bs.toggle"), b || this.$element.change(), this.$element.on("change.bs.toggle", a.proxy(function () { this.update() }, this)) }, c.prototype.destroy = function () { this.$element.off("change.bs.toggle"), this.$toggleGroup.remove(), this.$element.removeData("bs.toggle"), this.$element.unwrap() }; var d = a.fn.bootstrapToggle; a.fn.bootstrapToggle = b, a.fn.bootstrapToggle.Constructor = c, a.fn.toggle.noConflict = function () { return a.fn.bootstrapToggle = d, this }, a(function () { a("input[type=checkbox][data-toggle^=toggle]").bootstrapToggle() }), a(document).on("click.bs.toggle", "div[data-toggle^=toggle]", function (b) { var c = a(this).find("input[type=checkbox]"); c.bootstrapToggle("toggle"), b.preventDefault() }) }(jQuery);
//# sourceMappingURL=bootstrap-toggle.min.js.map
/*!
 * jQuery.scrollTo
 * Copyright (c) 2007-2015 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Licensed under MIT
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * @projectDescription Lightweight, cross-browser and highly customizable animated scrolling with jQuery
 * @author Ariel Flesler
 * @version 2.1.2
 */
;(function(factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof module !== 'undefined' && module.exports) {
		// CommonJS
		module.exports = factory(require('jquery'));
	} else {
		// Global
		factory(jQuery);
	}
})(function($) {
	'use strict';

	var $scrollTo = $.scrollTo = function(target, duration, settings) {
		return $(window).scrollTo(target, duration, settings);
	};

	$scrollTo.defaults = {
		axis:'xy',
		duration: 0,
		limit:true
	};

	function isWin(elem) {
		return !elem.nodeName ||
			$.inArray(elem.nodeName.toLowerCase(), ['iframe','#document','html','body']) !== -1;
	}		

	$.fn.scrollTo = function(target, duration, settings) {
		if (typeof duration === 'object') {
			settings = duration;
			duration = 0;
		}
		if (typeof settings === 'function') {
			settings = { onAfter:settings };
		}
		if (target === 'max') {
			target = 9e9;
		}

		settings = $.extend({}, $scrollTo.defaults, settings);
		// Speed is still recognized for backwards compatibility
		duration = duration || settings.duration;
		// Make sure the settings are given right
		var queue = settings.queue && settings.axis.length > 1;
		if (queue) {
			// Let's keep the overall duration
			duration /= 2;
		}
		settings.offset = both(settings.offset);
		settings.over = both(settings.over);

		return this.each(function() {
			// Null target yields nothing, just like jQuery does
			if (target === null) return;

			var win = isWin(this),
				elem = win ? this.contentWindow || window : this,
				$elem = $(elem),
				targ = target, 
				attr = {},
				toff;

			switch (typeof targ) {
				// A number will pass the regex
				case 'number':
				case 'string':
					if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
						targ = both(targ);
						// We are done
						break;
					}
					// Relative/Absolute selector
					targ = win ? $(targ) : $(targ, elem);
					/* falls through */
				case 'object':
					if (targ.length === 0) return;
					// DOMElement / jQuery
					if (targ.is || targ.style) {
						// Get the real position of the target
						toff = (targ = $(targ)).offset();
					}
			}

			var offset = $.isFunction(settings.offset) && settings.offset(elem, targ) || settings.offset;

			$.each(settings.axis.split(''), function(i, axis) {
				var Pos	= axis === 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					prev = $elem[key](),
					max = $scrollTo.max(elem, axis);

				if (toff) {// jQuery / DOMElement
					attr[key] = toff[pos] + (win ? 0 : prev - $elem.offset()[pos]);

					// If it's a dom element, reduce the margin
					if (settings.margin) {
						attr[key] -= parseInt(targ.css('margin'+Pos), 10) || 0;
						attr[key] -= parseInt(targ.css('border'+Pos+'Width'), 10) || 0;
					}

					attr[key] += offset[pos] || 0;

					if (settings.over[pos]) {
						// Scroll to a fraction of its width/height
						attr[key] += targ[axis === 'x'?'width':'height']() * settings.over[pos];
					}
				} else {
					var val = targ[pos];
					// Handle percentage values
					attr[key] = val.slice && val.slice(-1) === '%' ?
						parseFloat(val) / 100 * max
						: val;
				}

				// Number or 'number'
				if (settings.limit && /^\d+$/.test(attr[key])) {
					// Check the limits
					attr[key] = attr[key] <= 0 ? 0 : Math.min(attr[key], max);
				}

				// Don't waste time animating, if there's no need.
				if (!i && settings.axis.length > 1) {
					if (prev === attr[key]) {
						// No animation needed
						attr = {};
					} else if (queue) {
						// Intermediate animation
						animate(settings.onAfterFirst);
						// Don't animate this axis again in the next iteration.
						attr = {};
					}
				}
			});

			animate(settings.onAfter);

			function animate(callback) {
				var opts = $.extend({}, settings, {
					// The queue setting conflicts with animate()
					// Force it to always be true
					queue: true,
					duration: duration,
					complete: callback && function() {
						callback.call(elem, targ, settings);
					}
				});
				$elem.animate(attr, opts);
			}
		});
	};

	// Max scrolling position, works on quirks mode
	// It only fails (not too badly) on IE, quirks mode.
	$scrollTo.max = function(elem, axis) {
		var Dim = axis === 'x' ? 'Width' : 'Height',
			scroll = 'scroll'+Dim;

		if (!isWin(elem))
			return elem[scroll] - $(elem)[Dim.toLowerCase()]();

		var size = 'client' + Dim,
			doc = elem.ownerDocument || elem.document,
			html = doc.documentElement,
			body = doc.body;

		return Math.max(html[scroll], body[scroll]) - Math.min(html[size], body[size]);
	};

	function both(val) {
		return $.isFunction(val) || $.isPlainObject(val) ? val : { top:val, left:val };
	}

	// Add special hooks so that window scroll properties can be animated
	$.Tween.propHooks.scrollLeft = 
	$.Tween.propHooks.scrollTop = {
		get: function(t) {
			return $(t.elem)[t.prop]();
		},
		set: function(t) {
			var curr = this.get(t);
			// If interrupt is true and user scrolled, stop animating
			if (t.options.interrupt && t._last && t._last !== curr) {
				return $(t.elem).stop();
			}
			var next = Math.round(t.now);
			// Don't waste CPU
			// Browsers don't render floating point scroll
			if (curr !== next) {
				$(t.elem)[t.prop](next);
				t._last = this.get(t);
			}
		}
	};

	// AMD requirement
	return $scrollTo;
});
