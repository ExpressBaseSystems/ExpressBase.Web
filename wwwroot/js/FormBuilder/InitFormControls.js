var InitControls = function (option) {
    this.scrollableContSelectors = ['.tab-content', '.Dg_body'];

    if (option) {
        this.Renderer = option;
        this.Cid = option.Cid;
        this.Env = option.Env;
    }

    this.init = function (control, ctrlOpts) {
        this.initInfo(control);
        if (this[control.ObjType] !== undefined) {
            return this[control.ObjType](control, ctrlOpts);
        }
    };

    this.initInfo = function (ctrl) {
        let el = document.getElementById(ctrl.EbSid_CtxId + "Lblic");
        if (!el)
            return;
        if (ctrl.Info && ctrl.Info.trim() !== "") {
            el.innerHTML = ('<i class="fa ' + ctrl.InfoIcon + '" aria-hidden="true"></i>');
            $(el).popover({
                trigger: 'focus',
                html: true,
                container: "body",
                placement: this.PopoverPlacement,
                content: decodeURIComponent(escape(window.atob(ctrl.Info)))
            });
        }
        else {
            el.remove();
        }
    };

    this.PopoverPlacement = function (context, source) {
        if (($(source).offset().left + 700) > document.body.clientWidth)
            return "left";
        else {
            return "right";
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
        if (this.Renderer.rendererName == "Bot") {
            $input.selectpicker({
                dropupAuto: false,               
            });
        }
        else {
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

        }
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
        if (ctrl.OpenInNewTab) {
            window.open(url, '_blank');
            return;
        }
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

            $("#" + ctrl.EbSid_CtxId).on('change', function (e) {
                let newLocId = ctrl.getValueFromDOM();    
                if (newLocId === 0)
                    return;
                let newLocObj = ebcontext.locations.Locations.find(e => e.LocId == newLocId);
                let oldLocObj = ebcontext.locations.CurrentLocObj;

                if (newLocObj.LocId !== oldLocObj.LocId) {
                    EbMessage("show", { Message: `Switching from ${oldLocObj.LongName} to ${newLocObj.LongName}`, AutoHide: true, Background: '#0000aa', Delay: 3000 });
                    ebcontext.locations.SwitchLocation(newLocObj.LocId);
                }                
            });
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
    this.Image = function (ctrl) {
        if (ctrl.ImageId > 0) {
            if (this.Renderer.rendererName === "WebForm") {
                $(`#${ctrl.EbSid}`).attr("src", `../images/${ctrl.ImageId}.jpg`);
            }
            if (this.Renderer.rendererName === "Bot") {
                $(`#${ctrl.EbSid}`).attr("src", `../bot/images/${ctrl.ImageId}.jpg`);
            }
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