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

        // hide popover on scroll
        let scrollableContSelectors = this.scrollableContSelectors.concat('[eb-root-obj-container]');
        for (let i = 0; i < scrollableContSelectors.length; i++) {
            let $containers = $(el).parents(scrollableContSelectors[i]).filter(':not([onscroll-hide-info="true"])');
            $containers.scroll(function (event) {
                $(event.target).find('.label-infoCont:focus').blur();
            }.bind(this));
            $containers.attr('onscroll-hide-info', 'true');
        }
    };

    this.PopoverPlacement = function (context, source) {
        let left = $(source).offset().left, dwidth = document.body.clientWidth, pos;

        if (left < (dwidth - 700) || (dwidth / 2) > left)
            pos = "right";
        else if (left > 700 || (dwidth / 2) < left)
            pos = "left";
        else
            pos = "right";

        return pos;

        //if (($(source).offset().left + 700) > document.body.clientWidth)
        //    return "left";
        //else {
        //    return "right";
        //}
    };

    this.FileUploader = function (ctrl, ctrlOpts) {
        let files = [];
        let catTitle = [];
        let customMenu = [{ name: "Delete", icon: "fa-trash" }];
        let fileType = this.getKeyByValue(EbEnums_w.FileClass, ctrl.FileType.toString());
        $.each(ctrl.Categories.$values, function (i, obj) {
            catTitle.push(obj.CategoryTitle);
        }.bind(catTitle));

        if (ctrlOpts.FormDataExtdObj.val !== null && ctrlOpts.FormDataExtdObj.val[ctrl.Name || ctrl.EbSid] !== undefined) {
            files = JSON.parse(ctrlOpts.FormDataExtdObj.val[ctrl.Name || ctrl.EbSid][0].Columns[0].Value);
        }

        //if (fileType === 'image') {
        $.each(ctrlOpts.DpControlsList, function (i, obj) {
            customMenu.push({ name: "Set as " + obj.Label, icon: "fa-user" });
        });
        //}

        let imgup = new FUPFormControl({
            Type: fileType,
            ShowGallery: true,
            Categories: catTitle,
            Files: files,
            TenantId: this.Cid,
            SolutionId: this.Cid,
            Container: ctrl.EbSid,
            Multiple: ctrl.IsMultipleUpload,
            ServerEventUrl: this.Env === "Production" ? 'https://se.expressbase.com' : 'https://se.eb-test.xyz',
            EnableTag: ctrl.EnableTag,
            EnableCrop: ctrl.EnableCrop,
            MaxSize: ctrl.MaxFileSize,
            MaxSizeInKB: ctrl.MaxSizeInKB,
            CustomMenu: customMenu,
            DisableUpload: ctrl.DisableUpload,
            HideEmptyCategory: ctrl.HideEmptyCategory,
            ShowUploadDate: ctrl.ShowUploadDate,
            ShowFileName: ctrl.ShowFileName,
            ViewByCategory: ctrl.ViewByCategory,
            Renderer: this.Renderer,
            ViewerPosition: ctrl.ViewerPosition
        });

        //uploadedFileRefList[ctrl.Name] = this.getInitFileIds(files);
        this.Renderer.uploadedFileRefList[ctrl.Name + '_add'] = [];
        this.Renderer.uploadedFileRefList[ctrl.Name + '_del'] = [];

        imgup.uploadSuccess = function (fileid) {
            if (this.Renderer.uploadedFileRefList[ctrl.Name + '_add'].indexOf(fileid) === -1)
                this.Renderer.uploadedFileRefList[ctrl.Name + '_add'].push(fileid);
        }.bind(this);

        imgup.windowClose = function () {
            if (this.Renderer.uploadedFileRefList[ctrl.Name + '_add'].length > 0)
                EbMessage("show", { Message: 'Changes affect only if form is saved', AutoHide: true, Background: '#0000aa', Delay: 3000 });
        }.bind(this);

        ctrl.isRequiredOK = function (ctrl, files) {
            if (this.Renderer.uploadedFileRefList[ctrl.Name + '_add'].length > 0)
                return true;

            let f = files.filter(function (i) { return !i.Recent; });

            if (f.length > 0)
                return true;

            return false;
        }.bind(this, ctrl, files);

        imgup.customTrigger = function (DpControlsList, name, refids) {
            if (name === "Delete") {
                if (name === "Delete") {
                    EbDialog("show",
                        {
                            Message: "Are you sure? Changes Affect only if Form is Saved.",
                            Buttons: {
                                "Yes": { Background: "green", Align: "left", FontColor: "white;" },
                                "No": { Background: "violet", Align: "right", FontColor: "white;" }
                            },
                            CallBack: function (name) {
                                if (name === "Yes" && refids.length > 0) {
                                    let initLen = this.Renderer.uploadedFileRefList[ctrl.Name + '_del'].length;

                                    for (let i = 0; i < refids.length; i++) {
                                        let index = this.Renderer.uploadedFileRefList[ctrl.Name + '_add'].indexOf(refids[i]);
                                        if (index !== -1) {
                                            this.Renderer.uploadedFileRefList[ctrl.Name + '_add'].splice(index, 1);
                                        }
                                        else if (!this.Renderer.uploadedFileRefList[ctrl.Name + '_del'].includes(refids[i])) {
                                            this.Renderer.uploadedFileRefList[ctrl.Name + '_del'].push(refids[i]);
                                        }
                                    }
                                    if (initLen < this.Renderer.uploadedFileRefList[ctrl.Name + '_del'].length) {
                                        EbMessage("show", { Message: 'Changes affect only if form is saved', AutoHide: true, Background: '#0000aa', Delay: 3000 });
                                    }
                                    imgup.deleteFromGallery(refids);
                                    imgup.customMenuCompleted("Delete", refids);
                                }
                            }.bind(this)
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
                                    "Yes": { Background: "green", Align: "left", FontColor: "white;" },
                                    "No": { Background: "violet", Align: "right", FontColor: "white;" }
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

    //this.getInitFileIds = function (files) {
    //    let ids = [];
    //    for (let i = 0; i < files.length; i++)
    //        ids.push(files[i].FileRefId);
    //    return ids;
    //};

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
                    mask: true,
                    scrollInput: false
                });
                //$input.val(userObject.Preference.ShortDate);
                //if (ctrl.RestrictionRule == 1)
                //    ebcontext.finyears.setFinacialYear("#" + ctrl.EbSid_CtxId);
                //if (ctrl.RestrictionRule == 2)
                if (ctrl.RestrictionRule == 1 || ctrl.RestrictionRule == 2)
                    ebcontext.finyears.setFinacialYear({ ctrl: ctrl, formRenderer: this.Renderer });
            }
            else if (ctrl.EbDateType === 17) { //Time

                if (ctrl.ShowTimeAs === 4)
                    stp = "HH:mm";

                $input.datetimepicker({
                    format: stp,
                    formatTime: stp,
                    formatDate: sdp,
                    timepicker: true,
                    datepicker: false,
                    scrollInput: false
                });
                //$input.val(userObject.Preference.ShortTime);
            }
            else {
                $input.datetimepicker({ //DateTime
                    format: sdp + " " + stp,
                    formatTime: stp,
                    formatDate: sdp,
                    timepicker: true,
                    datepicker: true,
                    scrollInput: false
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
            $('#' + ctrl.EbSid_CtxId).siblings('.nullable-check').find('input[type=checkbox]').prop('checked', false);
            $input.val("");
            $input.prev(".nullable-check").find("input[type='checkbox']").off('change').on('change', this.toggleNullableCheck.bind(this, ctrl));//created by amal
            $input.prop('disabled', true).next(".input-group-addon").css('pointer-events', 'none').css('color', '#999');
        }
        else if (ctrl.ShowDateAs_ !== 2 && this.Renderer.rendererName !== "WebForm")
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

    this.SimpleSelect = function (ctrl, ctrlOpts) {
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
                container: (ctrlOpts.parentCont ? `#${ctrlOpts.parentCont}` : `body [eb-root-obj-container]:first`),
                virtualScroll: 500,
                size: ctrl.DropdownHeight === 0 ? 'auto' : (ctrl.DropdownHeight / 23),
                //DDheight: ctrl.DropdownHeight,// experimental should apply at selectpicker-line: 1783("maxHeight = menuHeight;")
            });

            if (this.Renderer.updateCtrlUI)
                this.Renderer.updateCtrlUI(ctrl);

            let $DD = $input.siblings(".dropdown-menu[role='combobox']");
            //$DD.addClass("dd_of_" + ctrl.EbSid_CtxId);
            //$DD.find(".inner[role='listbox']").css({ "height": ctrl.DropdownHeight, "overflow-y": "scroll" });

            $("#" + ctrl.EbSid_CtxId).on("shown.bs.select", function (e) {
                let $el = $(e.target);
                let $DDbScont = $DD.closest(".bs-container");
                if ($DDbScont.length === 0)
                    return;
                //$DDbScont.css("left", ($el.closest(".ctrl-cover").offset().left));
                $DDbScont.offset({ left: $el.closest(".ctrl-cover").offset().left });

                if ($DDbScont.hasClass("dropup")) {
                    //$DDbScont.css("top", parseFloat($DDbScont.css("top")) + 1);
                    $DDbScont.offset({ top: $DDbScont.offset().top + 1 });
                    $DD.removeClass("eb-ss-dd").addClass("eb-ss-ddup");
                }
                else {
                    //$DDbScont.css("top", parseFloat($DDbScont.css("top")) - 1);
                    $DDbScont.offset({ top: $DDbScont.offset().top - 1 });
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

    this.BooleanSelect = function (ctrl, ctrlOpts) {
        this.SimpleSelect(ctrl, ctrlOpts);
    };

    // http://davidstutz.de/bootstrap-multiselect
    this.UserLocation = function (ctrl) {
        let $input = $("#" + ctrl.EbSid_CtxId);
        $input.multiselect({
            includeSelectAllOption: true
        });
        if (this.Renderer.rendererName != 'WebForm') {
            if (ebcontext.user.wc === "uc") {
                if (ctrl.TryToLoadGlobal && $input.attr('isglobal') === 'y')
                    ctrl.setValue('-1');
                else if (ctrl.LoadCurrentLocation) {
                    let curLoc = false;
                    if (ebcontext.locations.getCurrent)
                        curLoc = ebcontext.locations.getCurrent();
                    else if (ebcontext.sid && ebcontext.user.UserId)
                        curLoc = store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId);

                    if (curLoc)
                        $('#' + ctrl.EbSid_CtxId).val([curLoc]).multiselect('refresh');
                }
            }
            else if (ebcontext.user.wc === "dc")
                ctrl.setValue('-1');

            ctrl.DataVals.Value = ctrl.getValueFromDOM();
        }
        //$("body").on("click", "#" + ctrl.EbSid_CtxId + "_checkbox", this.UserLocationCheckboxChanged.bind(this, ctrl));
        //ebcontext.locations.getCurrent();
        //if (ebcontext.user.Roles.findIndex(x => (x === "SolutionOwner" || x === "SolutionDeveloper" || x === "SolutionAdmin")) > -1) {
        //    $('#' + ctrl.EbSid_CtxId + "_checkbox").trigger('click');
        //}
        //else {
        //    $('#' + ctrl.EbSid_CtxId + "_checkbox_div").hide();
        //    if (ebcontext.user.wc === "dc")
        //        $('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(1)').children().find("input").trigger('click');
        //    else if (ebcontext.user.wc === "uc") {
        //        if (ctrl.LoadCurrentLocation)
        //            $('#' + ctrl.EbSid_CtxId).next('div').children().find('[value=' + ebcontext.locations.getCurrent() + ']').trigger('click');
        //        else
        //            $('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(1)').children().find("input").trigger('click');
        //    }
        //}
    };

    //this.UserLocationCheckboxChanged = function (ctrl) {
    //    if ($(event.target).prop("checked")) {
    //        $('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").trigger('click');
    //        $('#' + ctrl.EbSid_CtxId).next('div').find("*").attr("disabled", "disabled").off('click');
    //    }
    //    else {
    //        $('#' + ctrl.EbSid_CtxId).next('div').find("*").removeAttr('disabled').on('click');
    //        if ($('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").prop("checked"))
    //            $('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").trigger('click');

    //    }
    //};

    this.LocationSelector = function (ctrl) {
        let $input = "#" + ctrl.EbSid_CtxId;
        ctrl.LocData.$values.map(e => delete e.$type);

        this.DDTreeApi = simTree({
            el: $input,
            data: ctrl.LocData.$values,
            check: true,
            //linkParent: true,
            onClick: this.ClickLocationSelector.bind(this, ctrl),
            //onChange: this.ChangeStyle.bind(this),
            //done: this.ChangeStyle.bind(this),
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
                    $('#' + ctrl.EbSid_CtxId).find('[data-id=' + ebcontext.locations.getCurrent() + '] .sim-tree-checkbox').eq(0).trigger('click');
            }
        }
        ctrl.DataVals.Value = ctrl.getValueFromDOM();
    };

    this.ChangeStyle = function () {
        $.each($(".sim-tree-checkbox").parent(), function (obj, i) {
            if ($(i).children().hasClass("checked")) {
                $(".sim-tree-checkbox").parent().css("background-color", "blue");
            }
            else {
                $(".sim-tree-checkbox").parent().css("background-color", "none");
            }
        });
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
        $(".sim-tree-checkbox").parent().removeClass("filterDgLoc");
        $(".checked").parent().addClass("filterDgLoc");
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
        o.Source = this.Renderer.rendererName;
        ////code review ...code duplicate with TV
        if (!ctrl.__filtervalues)
            ctrl.__filtervalues = [];
        if (ctrl.ParamsList) {
            paramsList = ctrl.ParamsList.$values.map(function (obj) { return "form." + obj.Name; });
            for (let i = 0; i < paramsList.length; i++) {
                let depCtrl_s = paramsList[i];
                let depCtrl = this.Renderer.formObject.__getCtrlByPath(depCtrl_s);
                if (!getObjByval(ctrl.__filtervalues, "Name", depCtrl_s.replace("form.", ""))) { // bot related check
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
                    else if (depCtrl_s === "form.eb_current_language_id") {
                        val = ebcontext.languages.getCurrentLanguage();
                        name = "eb_current_language_id";
                    }
                    else if (depCtrl_s === "form.eb_current_locale") {
                        val = ebcontext.languages.getCurrentLocale();
                        name = "eb_current_locale";
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

                    ctrl.__filtervalues.push(new fltr_obj(ebDbType, name, val));
                }
            }
            o.filtervalues = btoa(unescape(encodeURIComponent(JSON.stringify(ctrl.__filtervalues))));
        }
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
        o.refid = o.dvObject.RefId;
        o.drawCallBack = function (ctrl) {
            ctrl.___isNotUpdateValExpDepCtrls = false;
            let DepHandleObj = this.Renderer.FRC.GetDepHandleObj(ctrl);
            this.Renderer.FRC.ctrlChangeListener_inner0(DepHandleObj);
        }.bind(this, ctrl);
        o.SelfRefreshLimit = ctrl.SelfRefreshLimit;

        let initFilterValues = function (ctrl) {
            if (!ctrl.__filterValues)
                ctrl.__filterValues = [];
            if (!ctrl.ParamsList)
                return false;
            let paramsList = ctrl.ParamsList.$values.map(function (obj) { return "form." + obj.Name; });
            for (let i = 0; i < paramsList.length; i++) {
                let depCtrl_s = paramsList[i];
                let depCtrl = this.Renderer.formObject.__getCtrlByPath(depCtrl_s);
                if (!getObjByval(ctrl.__filterValues, "Name", depCtrl_s.replace("form.", ""))) { // bot related check
                    let val = '';
                    let ebDbType = 11;
                    let name = "";
                    if (depCtrl && depCtrl != 'not found') {
                        val = depCtrl.getValue();
                        name = depCtrl.Name;
                        ebDbType = depCtrl.EbDbType;
                    }
                    else if (depCtrl_s === "form.eb_loc_id") {
                        if (this.Renderer.rendererName === 'WebForm')
                            val = this.Renderer.getLocId(true);
                        else
                            val = (ebcontext.locations) ? ebcontext.locations.getCurrent() : 0;
                        name = "eb_loc_id";
                    }
                    else if (depCtrl_s === "form.eb_currentuser_id") {
                        val = ebcontext.user.UserId;
                        name = "eb_currentuser_id";
                    }
                    else if (depCtrl_s === "form.eb_current_language_id") {
                        val = ebcontext.languages.getCurrentLanguage();
                        name = "eb_current_language_id";
                    }
                    else if (depCtrl_s === "form.eb_current_locale") {
                        val = ebcontext.languages.getCurrentLocale();
                        name = "eb_current_locale";
                    }
                    else if (depCtrl_s === "form.id") {
                        val = this.Renderer.rowId;
                        name = "id";
                    }
                    else if (this.Renderer.FormObj && depCtrl_s == `form.${this.Renderer.FormObj.TableName}_id`) {// in bot FormObj=undefined
                        val = this.Renderer.rowId;
                        name = this.Renderer.FormObj.TableName + "_id";
                    }

                    ctrl.__filterValues.push(new fltr_obj(ebDbType, name, val));
                }
            }
            return true;
        }.bind(this, ctrl);
        if (initFilterValues())
            o.filterValues = btoa(unescape(encodeURIComponent(JSON.stringify(ctrl.__filterValues))));

        //ctrl.initializer = new EbCommonDataTable(o);
        ////ctrl.initializer.reloadTV = ctrl.initializer.Api.ajax.reload;

        ctrl.reloadWithParam = function (depCtrl) {
            if (depCtrl) {
                let val = depCtrl.getValue();
                let filterObj = getObjByval(ctrl.__filterValues, "Name", depCtrl.Name);
                filterObj.Value = val;
            }

            if (ctrl.initializer) {
                ctrl.initializer.filterValues = ctrl.__filterValues;
                //ctrl.initializer.Api.ajax.reload();
                ctrl.initializer.getColumnsSuccess();
            }
            else {
                o.filterValues = btoa(unescape(encodeURIComponent(JSON.stringify(ctrl.__filterValues))));
                ctrl.initializer = new EbCommonDataTable(o);
            }
        };

        ctrl.reloadWithParamAll = function () {
            let a = ctrl.__filterControls;
            if (a) {
                for (let i = 0; i < a.length; i++) {
                    let val = a[i].getValue();
                    let filterObj = getObjByval(ctrl.__filterValues, "Name", a[i].Name);
                    filterObj.Value = val;
                }
            }

            if (ctrl.initializer) {
                ctrl.initializer.filterValues = ctrl.__filterValues;
                //ctrl.initializer.Api.ajax.reload();
                ctrl.initializer.getColumnsSuccess();// this will produce double footer: experiment
            }
            else {
                o.filterValues = btoa(unescape(encodeURIComponent(JSON.stringify(ctrl.__filterValues))));
                ctrl.initializer = new EbCommonDataTable(o);
            }
        };

        ctrl.sum = function (ctrl, colName) {
            try {
                let data = ctrl.initializer.Api.column(colName + ':name').data();
                if (data)
                    return data.sum();
            }
            catch (e) {
                console.error(e);
            }
            return 0;
        }.bind(this, ctrl);

        $("#cont_" + ctrl.EbSid_CtxId).closest('.tab-content').prev('.tab-btn-cont').find('.nav-tabs a').on('shown.bs.tab', function (ctrl, event) {
            if ($("#cont_" + ctrl.EbSid_CtxId).closest(`.tab-pane`).hasClass("active")) {
                if (ctrl.__reloadWithParamAll) {
                    ctrl.reloadWithParamAll();
                    ctrl.__reloadWithParamAll = false;
                }
                else if (ctrl.__reloadWithParam) {
                    ctrl.reloadWithParam();
                    ctrl.__reloadWithParam = true;
                }
                else {
                    if (ctrl.initializer && !ctrl.initializer.__ColAdjusted && ctrl.initializer.isSecondTime) {
                        ctrl.initializer.Api.columns.adjust();
                        ctrl.initializer.__ColAdjusted = true;
                    }
                }
            }
        }.bind(this, ctrl));
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
        $input.find("#fromyear").datepicker({
            format: "yyyy",
            viewMode: "years",
            minViewMode: "years",
            autoclose: true
        });
        $input.find("#toyear").datepicker({
            format: "yyyy",
            viewMode: "years",
            minViewMode: "years",
            autoclose: true
        });

        $input.find("#date").next(".input-group-addon").off('click').on('click', function () {
            $input.find("#date").datetimepicker('show');
        });

        $input.find("#month").val(moment().format('MM/YYYY'));
        $input.find("#fromyear").val(moment().format('YYYY'));
        $input.find("#toyear").val(moment().format('YYYY'));

        $input.find("select").off('change').on('change', this.calendarCtrlSelectChanged.bind(this, $input));
        $input.find("#date").off('change').on('change', this.SetDateFromDateTo.bind(this, $input));
        $input.find("#fromyear").off('change').on('change', this.SetDateFromDateTo.bind(this, $input));
        $input.find("#toyear").off('change').on('change', this.SetDateFromDateTo.bind(this, $input));

        $input.find("select").selectpicker({///////////////////////////////////////////////////////////
            dropupAuto: false,
        });

        //this.SetDateFromDateTo($input);
        this.calendarCtrlSelectChanged($input);

        //$input.find("select option[value='Hourly']").attr("selected", "selected");
        //$input.find("select").trigger("change");

        //$input.find("select").selectpicker("val", "Hourly");

    };

    this.calendarCtrlSelectChanged = function ($input, e) {

        let _this = $input.find("select")[0];
        $input.find("select").siblings("button").find(".filter-option").text(_this.value);

        //$(e.target).siblings("button").find(" .filter-option").text(_this.value);

        $input.find("select option:not([value='" + _this.value + "'])").removeAttr("selected");
        if (_this.value === "Hourly") {
            $input.children("[name=date]").show();
            $input.children("[name=month]").hide();
            $input.children("[name=fromyear]").hide();
            $input.children("[name=toyear]").hide();
        }
        else if (_this.value === "DayWise" || _this.value === "Weekely" || _this.value === "Fortnightly") {
            $input.children("[name=month]").show();
            $input.children("[name=date]").hide();
            $input.children("[name=fromyear]").hide();
            $input.children("[name=toyear]").hide();
        }
        else if (_this.value === "Monthly" || _this.value === "Quarterly" || _this.value === "HalfYearly" || _this.value === "Yearly") {
            $input.children("[name=fromyear]").show();
            $input.children("[name=toyear]").show();
            $input.children("[name=date]").hide();
            $input.children("[name=month]").hide();
        }

        let obj = $(_this).data('data-calndr-obj');
        if (obj) {
            let newval = EbEnums.AttendanceType[_this.value];
            obj.CalendarType = parseInt(newval);
        }
        this.SetDateFromDateTo($input);

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
        else if ($input.find("select").val() === "Monthly" || $input.find("select").val() === "Quarterly" || $input.find("select").val() === "HalfYearly" || $input.find("select").val() === "Yearly") {
            let year = $input.find("#fromyear").val();
            startDate = moment([year]);
            $input.find("#datefrom").val(startDate.format("YYYY-MM-DD"));
            year = $input.find("#toyear").val();
            endDate = moment([year]).endOf('year');
            $input.find("#dateto").val(endDate.format("YYYY-MM-DD")).trigger("change");
        }

    };

    this.InputGeoLocation = function (ctrl) {
        if (!ctrl.DefaultApikey && this.Renderer.rendererName === 'WebForm')// WebForm - restricted other renderers for testing purpose.
            this.initOSM(ctrl);
        else {
            ebcontext.userLoc = { lat: 0, long: 0 };
            this.InitMap4inpG(ctrl);
            if (typeof this.Renderer.rowId === 'undefined' || this.Renderer.rowId === 0) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    $('#' + ctrl.EbSid_CtxId).locationpicker('location', {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    if (ctrl.DataVals)
                        ctrl.DataVals.Value = position.coords.latitude + ',' + position.coords.longitude;
                }.bind(this));
            }
            $("#" + ctrl.EbSid_CtxId + "_Cont").find(".loc-close").on("click", (e) => $(event.target).closest('.locinp-cont').find('.locinp').val(''));
            $("#" + ctrl.EbSid_CtxId + "_Cont").find(".locinp").on("focus", (e) => { $(e.target).select(); });
        }
    };

    this.initOSM = function (ctrl) {
        $(`#${ctrl.EbSid_CtxId}_Cont`).find('.locinp-wraper-address').hide();//temp
        ctrl.__mapVendor = "osm";//
        let lat = 0, lon = 0;
        let map, marker;

        try {
            map = new L.Map(ctrl.EbSid_CtxId);
        }
        catch (e) {
            console.log(e);
        }

        var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var osmAttrib = 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
        var osm = new L.TileLayer(osmUrl, { minZoom: 1, maxZoom: 18, attribution: osmAttrib });
        map.setView([lat, lon], 14);
        map.addLayer(osm);
        if (!marker)
            marker = new L.marker([lat, lon], { draggable: 'true' });
        else
            marker.setLatLng([lat, lon]);
        ctrl.__map = map;//
        ctrl.__mapMarker = marker;//

        marker.on('dragend', function (e) {
            map.setView(e.target.getLatLng());
            $(`#${ctrl.EbSid_CtxId}lat`).val(e.target.getLatLng().lat);
            $(`#${ctrl.EbSid_CtxId}long`).val(e.target.getLatLng().lng);
            this.OSM_Call_OnChangeFns(ctrl);
        }.bind(this));

        map.addLayer(marker);

        $(`#${ctrl.EbSid_CtxId}lat`).on('change', function () {
            let val = parseFloat($(`#${ctrl.EbSid_CtxId}lat`).val());
            if (isNaN(val)) {
                let Value = ctrl.DataVals.Value;
                let tmp = Value.includes(',') ? Value.split(',') : Value.split('/');
                val = tmp[0];
                $(`#${ctrl.EbSid_CtxId}lat`).val(val);
                return;
            }
            marker.setLatLng([val, marker.getLatLng().lng]);
            map.setView(marker.getLatLng());
            this.OSM_Call_OnChangeFns(ctrl);
        }.bind(this));

        $(`#${ctrl.EbSid_CtxId}long`).on('change', function () {
            let val = parseFloat($(`#${ctrl.EbSid_CtxId}long`).val());
            if (isNaN(val)) {
                let Value = ctrl.DataVals.Value;
                let tmp = Value.includes(',') ? Value.split(',') : Value.split('/');
                val = tmp[1];
                $(`#${ctrl.EbSid_CtxId}long`).val(val);
                return;
            }
            marker.setLatLng([marker.getLatLng().lat, val]);
            map.setView(marker.getLatLng());
            this.OSM_Call_OnChangeFns(ctrl);
        }.bind(this));

        //$(`#${ctrl.EbSid_CtxId}address`).on('change', function () {
        //    let text = $(this).val();
        //    var requestUrl = "http://nominatim.openstreetmap.org/search?format=json&q=" + text;
        //    $.ajax({
        //        url: requestUrl,
        //        type: "GET",
        //        dataType: 'json',
        //        error: function (err) {
        //            console.log(err);
        //        },
        //        success: function (data) {
        //            console.log(data);
        //            var item = data[0];
        //            $(`#${ctrl.EbSid_CtxId}lat`).val(item.lat);
        //            $(`#${ctrl.EbSid_CtxId}long`).val(item.lon);
        //            marker.setLatLng([item.lat, item.lon]);
        //            map.setView([item.lat, item.lon]);
        //        }
        //    });
        //});

        if ((typeof this.Renderer.rowId === 'undefined' || this.Renderer.rowId === 0) && !this.Renderer.__fromImport) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $("#" + ctrl.EbSid_CtxId + "lat").val(position.coords.latitude);
                $("#" + ctrl.EbSid_CtxId + "long").val(position.coords.longitude);
                marker.setLatLng([position.coords.latitude, position.coords.longitude]);
                map.setView({ lat: position.coords.latitude, lng: position.coords.longitude });
                if (ctrl.DataVals)
                    ctrl.DataVals.Value = position.coords.latitude + ',' + position.coords.longitude;
            }.bind(this));
        }

        $("#cont_" + ctrl.EbSid_CtxId).closest('.tab-content').prev('.tab-btn-cont').find('.nav-tabs a').on('shown.bs.tab', function (event) {
            if ($("#cont_" + ctrl.EbSid_CtxId).closest(`.tab-pane`).hasClass("active")) {
                map.invalidateSize();
            }
        });
    };

    this.OSM_Call_OnChangeFns = function (ctrl) {
        if (!ctrl.__isJustSetValue) {
            if (ctrl.__ebonchangeFns) {
                for (let i = 0; i < ctrl.__ebonchangeFns.length; i++) {
                    ctrl.__ebonchangeFns[i]();
                }
            }
        }
        else
            ctrl.__isJustSetValue = false;
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

    this.RenderQuestionsControl = function (ctrl, ctrlOpts) {
        return new EbRenderQuestionsControl(ctrl, ctrlOpts);
    };

    this.DataGrid = function (ctrl, ctrlOpts) {
        return new EbDataGrid(ctrl, ctrlOpts);
    };

    this.DataGrid_New = function (ctrl, ctrlOpts) {
        return new EbDataGrid_New(ctrl, ctrlOpts);
    };

    this.ExportButton = function (ctrl, ctrlOpts) {
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        $ctrl.off('click').on('click', function (ctrl, ctrlOpts) {
            if ($('#cont_' + ctrl.EbSid_CtxId + ' .ctrl-cover div').attr('disabled'))
                return;
            let params = [];
            params.push(new fltr_obj(16, "srcRefId", ctrlOpts.formObj.RefId));
            params.push(new fltr_obj(11, "srcRowId", ctrlOpts.dataRowId));
            params.push(new fltr_obj(16, "srcCtrl", ctrl.Name));
            let _p = btoa(unescape(encodeURIComponent(JSON.stringify(params))));
            if (ctrl.OpenInNewTab) {
                let _l = ebcontext.languages.getCurrentLanguageCode();
                let url = `../WebForm/Index?_r=${ctrl.FormRefId}&_p=${_p}&_m=7&_l=${this.Renderer.getLocId()}&_lg=${_l}`;
                window.open(url, '_blank');
            }
            else {
                ebcontext.webform.PopupForm(ctrl.FormRefId, _p, 7, { srcCxt: this.Renderer.__MultiRenderCxt, initiator: ctrl, locId: this.Renderer.getLocId() });
            }
        }.bind(this, ctrl, ctrlOpts));

        $ctrl.off('mouseenter').on('mouseenter', function (ctrl, e) {
            if (this.Renderer.Mode.isNew)
                ctrl.attr('title', 'Not available in New Mode');
            else if (this.Renderer.Mode.isEdit && ctrl.DisableInEditMode)
                ctrl.attr('title', 'Not available in Edit Mode');
            else
                ctrl.removeAttr('title');
        }.bind(this, $ctrl));

        ctrl.reverseUpdateData = this.reverseUpdateData.bind(this, ctrl);

        ctrl.setValue = function (p1) {
            let $lbl = $("#" + this.EbSid_CtxId + ' span');
            $lbl.text(p1 + ' ');
        }.bind(ctrl);
        ctrl.justSetValue = ctrl.setValue;
        ctrl.disable = function (ctrl) {
            if (this.Renderer.Mode.isView || this.Renderer.Mode.isEdit) {
                ctrl.__IsDisable = true;
                $('#cont_' + ctrl.EbSid_CtxId + ' .ctrl-cover div').attr('disabled', 'disabled');
            }
        }.bind(this, ctrl);
        ctrl.enable = function (ctrl) {
            if (this.Renderer.Mode.isView || (this.Renderer.Mode.isEdit && !ctrl.DisableInEditMode)) {
                ctrl.__IsDisable = false;
                $('#cont_' + ctrl.EbSid_CtxId + ' .ctrl-cover div').removeAttr('disabled');
            }
        }.bind(this, ctrl);
        if (this.Renderer.Mode.isView)
            ctrl.enable();
    };

    this.ShortUrlButton = function (ctrl, ctrlOpts) {
        new EbShortUrlButtonJs(ctrl, ctrlOpts, this.Renderer);
    };

    this.Label = function (ctrl, ctrlOpts) {
        if (ctrl.IsDGCtrl) {

        }
        else {
            ctrl.setValue = function (renderer, p1) {
                if (!renderer.isInitiallyPopulating) {
                    let $lbl = $("#" + this.EbSid_CtxId + 'Lbl');
                    if (this.RenderAs == 1 || this.RenderAs == 2)//Link or Html
                        $lbl.html(p1 || '');
                    else
                        $lbl.text(p1 || '');
                }
            }.bind(ctrl, this.Renderer);

            ctrl.justSetValue = ctrl.setValue;

            if (ctrl.RenderAs != 1)
                return;

            let $lbl = $("#" + ctrl.EbSid_CtxId + 'Lbl');

            if (!(ctrl.LinkedObjects && ctrl.LinkedObjects.$values.length > 0)) {
                return;
            }
            let linkObj = ctrl.LinkedObjects.$values[0];

            if (!linkObj.ObjRefId) {
                console.warn('LabelLink - invalid obj refid');
                return;
            }
            if (linkObj.LinkType !== 3) {
                console.warn('LabelLink - only popup supported');
                return;
            }

            $lbl.css('pointer-events', 'all');
            $lbl.addClass('eb-label-link');

            $lbl.on('click', this.clickedOnLabelLink.bind(this, ctrl, linkObj));
        }
    };

    this.clickedOnLabelLink = function (ctrl, linkObj) {
        let _params = this.getLabelLinkParameters(linkObj);
        let _mode = 1;//view
        if (linkObj.FormMode && linkObj.FormMode == 3)
            _mode = 3;//edit

        if (_params.findIndex(e => e.Name === 'id') === -1) //prefill
            _mode = 2;

        ctrl.reverseUpdateData = this.reverseUpdateData.bind(this, linkObj);

        ebcontext.webform.PopupForm(linkObj.ObjRefId, btoa(JSON.stringify(_params)), _mode,
            {
                srcCxt: this.Renderer.__MultiRenderCxt,
                initiator: ctrl,
                locId: this.Renderer.getLocId()
            });
    };

    this.getLabelLinkParameters = function (linkObj) {
        let destid = 0;
        let params = [];
        let pushMasterId = true;

        if (linkObj.DataFlowMap && linkObj.DataFlowMap.$values.length > 0) {
            let pMap = linkObj.DataFlowMap.$values;
            for (let i = 0; i < pMap.length; i++) {
                if (!pMap[i].$type.includes('DataFlowForwardMap'))
                    continue;

                if (pMap[i].SrcCtrlName === 'id') {//source table id
                    params.push({ Name: pMap[i].DestCtrlName, Type: 7, Value: this.Renderer.rowId });
                    pushMasterId = false;
                    continue;
                }
                if (pMap[i].DestCtrlName === 'id') {
                    let outCtrl = this.Renderer.formObject[pMap[i].SrcCtrlName];
                    if (outCtrl) {
                        if (outCtrl.getValue() > 0) {
                            destid = outCtrl.getValue();
                            params = [{ Name: 'id', Type: 7, Value: destid }];
                            pushMasterId = false;
                            break;
                        }
                    }
                }
                else {
                    let outCtrl = this.Renderer.formObject[pMap[i].SrcCtrlName];
                    if (outCtrl) {
                        params.push({
                            Name: pMap[i].DestCtrlName,
                            Type: outCtrl.EbDbType,
                            Value: outCtrl.getValue()
                        });
                    }
                }
            }
        }
        if (pushMasterId) {
            params.push({ Name: this.Renderer.MasterTable + '_id', Type: 7, Value: this.Renderer.rowId });
        }

        return params;
    };

    this.reverseUpdateData = function (linkObj, destRender) {
        if (linkObj.DataFlowMap && linkObj.DataFlowMap.$values.length > 0) {
            let pMap = linkObj.DataFlowMap.$values;
            for (let i = 0; i < pMap.length; i++) {
                if (!pMap[i].$type.includes('DataFlowReverseMap'))
                    continue;
                let destCtrl = this.Renderer.formObject[pMap[i].DestCtrlName];
                if (!destCtrl)
                    continue;
                if (pMap[i].SrcCtrlName === 'id') {
                    if (destCtrl.ObjType == 'PowerSelect') {
                        destCtrl.initializer.data = undefined;
                        destCtrl.initializer.DDrefresh();
                    }
                    destCtrl.setValue(destRender.rowId);
                }
                else {
                    let srcCtrl = destRender.formObject[pMap[i].SrcCtrlName];
                    if (srcCtrl)
                        destCtrl.setValue(srcCtrl.getValue());
                }
            }
        }
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
            this.SimpleSelect(ctrl, ctrlOpts);
            return;
        }
        else if (ctrl.IsInsertable) {
            if (this.Renderer.rendererName === "WebForm" && ctrl.IsDGCtrl)
                ctrl.__AddButtonInit = this.Renderer.InitPsAddButton;
            else
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
            scrollableContSelectors: this.Renderer.rendererName === "WebForm" ? this.scrollableContSelectors : []
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
        //commented on 2023-02-20// due to undetected code flow
        //$('#' + ctrl.Name).find("input").on("change", function (e) {
        //    var $ctrlDiv = $('#' + ctrl.Name); var values = "";
        //    $ctrlDiv.find("input").each(function (i, el) {
        //        if (el.checked) {
        //            val = $('#' + el.id + 'Lbl').text().trim();
        //            values += "," + val;
        //        }
        //    });
        //    $ctrlDiv.val(values.substring(1));
        //});
    };

    this.Button = function (ctrl) {//////////////////////////////////////
        $('#' + ctrl.EbSid_CtxId).removeAttr("disabled");
        $('#' + ctrl.EbSid_CtxId).off('click').on('click', function () {
            let clBkFn = null;
            if (ctrl.PsJsObj) {
                clBkFn = function (id) {
                    this.data = undefined;
                    this.DDrefresh();
                    this.ComboObj.setValue(id);
                }.bind(ctrl.PsJsObj);
            }
            ebcontext.webform.PopupForm(ctrl.FormRefId, null, 0, { srcCxt: this.Renderer.__MultiRenderCxt, initiator: ctrl, locId: this.Renderer.getLocId(), Callback: clBkFn });
        }.bind(this, ctrl));
    }.bind(this);

    this.SubmitButton = function (ctrl, ctrlOpts) {
        //checksubmitbutton
        this.Renderer.$saveSelBtn.hide();
        //$('#webformsave-selbtn').hide();
        if (ctrlOpts.renderMode === 3 || ctrlOpts.renderMode === 5) {
            $(`#webform_submit_${ctrl.EbSid_CtxId}`).parent().prepend(`<div class = "text-center" id = '${ctrl.EbSid_CtxId}_captcha'> </div>
                    <input type='text' class = "text-center" placeholder='${(ebcontext.languages.getCurrentLanguageCode() == 'ml' ? 'മുകളിൽ കൊടുത്തിരിക്കുന്ന കോഡ് എഴുതുക' : 'Enter the captcha')}' id='${ctrl.EbSid_CtxId}_cpatchaTextBox' style='border: 1px solid #ccc; margin-bottom: 10px;' />`);

            ctrlOpts.code = "";
            this.CreateCaptcha(ctrl.EbSid_CtxId, ctrlOpts);
            $(`#${ctrl.EbSid_CtxId}_captcha`).on('click', 'i.fa-refresh', this.CreateCaptcha.bind(this, ctrl.EbSid_CtxId, ctrlOpts));
        }
        $(`#webform_submit_${ctrl.EbSid_CtxId}`).off('click').on('click', function () {
            event.preventDefault();
            if (ctrlOpts.renderMode === 3 || ctrlOpts.renderMode === 5) {
                if ($(`#${ctrl.EbSid_CtxId}_cpatchaTextBox`).val() === ctrlOpts.code) {
                    //$('#webformsave').trigger('click');
                    this.Renderer.saveForm();
                } else {
                    EbMessage("show", { Message: "Invalid Captcha. try Again", AutoHide: true, Background: '#aa0000' });
                    this.CreateCaptcha(ctrl.EbSid_CtxId, ctrlOpts);
                }
            } else {
                //$('#webformsave').trigger('click');
                this.Renderer.saveForm();
            }
        }.bind(this));
    }.bind(this);

    this.CreateCaptcha = function (EbSid, ctrlOpts) {
        //CAPTCHA
        //clear the contents of captcha div first 
        let $cond = $(`#${EbSid}_captcha`);
        $cond.empty();
        var charsArray =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@!#$%&*";
        var lengthOtp = 6;
        var captcha = [];
        for (var i = 0; i < lengthOtp; i++) {
            //below code will not allow Repetition of Characters
            var index = Math.floor(Math.random() * charsArray.length + 1); //get the next character from the array
            if (captcha.indexOf(charsArray[index]) === -1)
                captcha.push(charsArray[index]);
            else
                i--;
        }
        var canv = document.createElement("canvas");
        canv.id = "captcha";
        canv.width = 150;
        canv.height = 50;
        var ctx = canv.getContext("2d");
        ctx.font = "25px Verdana";
        ctx.strokeText(captcha.join(""), 0, 30);
        ctx.strokeStyle = "#336699";
        let p1 = Math.floor(Math.random() * 25);
        let p2 = Math.floor(Math.random() * 25);
        ctx.moveTo(0, p1);
        ctx.lineTo(150, p2);
        ctx.moveTo(0, p1 + 15);
        ctx.lineTo(150, p2 + 15);
        ctx.stroke();
        //storing captcha so that can validate you can save it somewhere else according to your specific requirements
        ctrlOpts.code = captcha.join("");
        $cond.append(canv); // adds the canvas to the body element
        $cond.append(`<span style='display:inline-block; vertical-align:bottom; color:#336699;'><i class="fa fa-refresh" title='Refresh' style='margin:10px; font-size:20px; cursor:pointer;'></i></span>`);
    };

    this.iFrameOpen = function (ctrl) {//////////////////
        //let url = "../WebForm/Index?_r=" + ctrl.FormRefId + "&_m=12";
        //if (ctrl.OpenInNewTab) {
        //    window.open(url, '_blank');
        //    return;
        //}
        //$("#iFrameForm").attr("src", url);

        ebcontext.webform.PopupForm(ctrl.FormRefId, null, 0, { srcCxt: this.Renderer.__MultiRenderCxt, initiator: ctrl, locId: this.Renderer.getLocId() });
    };

    this.SysLocation = function (ctrl) {
        let locObj = this.Renderer.getLocObj();
        let valPropName = ctrl.ShowLongName ? 'LongName' : 'ShortName';
        if (!locObj)
            return;
        //if (ctrl.DataVals && !ctrl.DataVals.Value && (typeof this.Renderer.rowId === 'undefined' || this.Renderer.rowId === 0)) {
        if (ctrl.DataVals && (typeof this.Renderer.rowId === 'undefined' || this.Renderer.rowId === 0)) {
            ctrl.DataVals.Value = locObj.LocId
            ctrl.DataVals.F = locObj[valPropName];
        }
        if (!(ctrl.IsDisable)) {
            let temp = [];
            $.each(ebcontext.locations.Locations, function (intex, obj) {
                temp.push({ k: obj.LocId, v: obj[valPropName] || '' });
            });
            temp.sort(function (a, b) {
                let v1 = a.v.toLowerCase();
                let v2 = b.v.toLowerCase();
                return ((v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0));
            });
            $.each(temp, function (i, obj) {
                $("#" + ctrl.EbSid_CtxId).append(`<option value="${obj.k}"> ${obj.v}</option>`);
            });

            $("#" + ctrl.EbSid_CtxId).val(locObj.LocId);

            //$("#" + ctrl.EbSid_CtxId).on('change', function (e) {
            //    let newLocId = ctrl.getValueFromDOM();
            //    if (newLocId === 0)
            //        return;
            //    let nl = ebcontext.locations.Locations.find(e => e.LocId == newLocId);
            //    let ol = this.Renderer.getLocObj();

            //    if (nl.LocId !== ol.LocId) {
            //        EbMessage("show", { Message: `Switching from ${ol.LongName} to ${nl.LongName}`, AutoHide: true, Background: '#0000aa', Delay: 3000 });
            //        ebcontext.locations.SwitchLocation(nl.LocId);
            //    }
            //}.bind(this));
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
        new EbProvUserJs(ctrl, { Renderer: this.Renderer, ctrlopts: ctrlopts });
        //$('#' + ctrl.EbSid_CtxId + '_usrimg').popover({
        //    trigger: 'hover',
        //    html: true,
        //    container: "body",
        //    placement: "right",
        //    content: "<div style='font-weight: 500;; color: #656565; border-bottom: 1px solid #ccc; margin-bottom: 5px;'>Created/Linked user</div>- Not assigned yet -",
        //    delay: { "show": 500, "hide": 100 }
        //});

        //ctrl.setValue = function () {
        //    if (!this.DataVals)
        //        return;
        //    this._finalObj = JSON.parse(this.DataVals.F);
        //    let _d = this._finalObj;
        //    let $img = $('#' + this.EbSid_CtxId + '_usrimg');
        //    if (_d['map_id']) {
        //        $img.off('error').on('error', function () { $(this).attr('src', '/images/nulldp.png'); }).attr('src', '/images/dp/' + _d['map_id'] + '.png');
        //        let dispText = _d['map_fullname'] ? _d['map_fullname'] : (_d['map_email'] ? _d['map_email'] : (_d['map_phprimary'] ? _d['map_phprimary'] : ''));
        //        $('#' + this.EbSid_CtxId).text(dispText);
        //        let popoverText = 'Name: ' + (_d['map_fullname'] ? _d['map_fullname'] : '---') + '<br/>';
        //        popoverText += 'Email: ' + (_d['map_email'] ? _d['map_email'] : '---') + '<br/>';
        //        popoverText += 'Phone: ' + (_d['map_phprimary'] ? _d['map_phprimary'] : '---');
        //        let title = `<div style='font-weight: 500;; color: #656565; border-bottom: 1px solid #ccc; margin-bottom: 5px;'>${(_d['id'] ? 'Created user' : 'Linked user')}</div>`;
        //        popoverText = title + popoverText;
        //        $img.attr('data-content', popoverText);
        //    }
        //    else {
        //        $img.attr('src', '/images/nulldp.png');
        //        $('#' + this.EbSid_CtxId).text('---');
        //    }
        //}.bind(ctrl);

        //$.each(ctrl.Fields.$values, function (i, obj) {
        //    if (obj.ControlName !== '') {
        //        let c = getObjByval(ctrlopts.flatControls, "Name", obj.ControlName);
        //        if (c)
        //            obj.Control = c;
        //    }
        //}.bind(this));
    };

    this.ProvisionLocation = function (ctrl, ctrlopts) {
        console.log('init ProvisionLocation');

        //$.each(ctrl.Fields.$values, function (i, obj) {
        //    if (obj.ControlName !== '') {
        //        let c = getObjByval(ctrlopts.flatControls, "Name", obj.ControlName);
        //        if (c)
        //            obj.Control = c;
        //    }
        //}.bind(this));
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
            itemList: this.Renderer.relatedData[ctrl.EbSid_CtxId],
            EbSid_CtxId: ctrl.EbSid_CtxId
        });
        itemList.ctrl = ctrl;
        ctrl._JsCtrlMng = itemList;// to refer ControlOperation fns from code in cs file - moving ctrlOps is critical
    };

    this.TextBox = function (ctrl, ctrlopts) {
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        ctrl.__EbAlert = this.Renderer.EbAlert;
        if (ctrl.MaskPattern !== null && ctrl.MaskPattern !== "" && ctrl.TextMode == 0) {
            $ctrl.inputmask({ mask: ctrl.MaskPattern });
        }
        else if (ctrl.TextMode === 0) {
            if (ctrl.AutoSuggestion === true) {
                $ctrl.autocomplete({ source: this.Renderer.relatedData[ctrl.EbSid_CtxId] });
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
    this.AudioInput = function (ctrl, ctrlopts) {
        AudioInput(ctrl, ctrlopts);
    };

    this.EmailControl = function (ctrl) {
        $("#" + ctrl.EbSid_CtxId).on('input', this.checkEmail.bind(this, ctrl));
    };

    this.checkEmail = function (ctrl) {
        if (EbvalidateEmail(event.target.value))
            if (this.Renderer.rendererName === "Bot") {
                $(`#${ctrl.EbSid}`).removeClass("emailCtrl_invalid");
            }
            else {
                ctrl.removeInvalidStyle();
            }

        else
            if (this.Renderer.rendererName === "Bot") {
                $(`#${ctrl.EbSid}`).addClass("emailCtrl_invalid");
            }
            else {
                ctrl.addInvalidStyle("Invalid email");
            }

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



        if (ctrl.InputMode == 1) { //Currency
            $input.inputmask({
                alias: "numeric",
                _mask: function _mask(opts) {
                    return ebcontext.user.Preference.CurrencyPattern;
                },
                groupSeparator: ebcontext.user.Preference.CurrencyGroupSeperator,
                radixPoint: ebcontext.user.Preference.CurrencyDecimalSeperator,
                placeholder: "0",
                digits: ebcontext.user.Preference.CurrencyDecimalDigits,
                digitsOptional: !1
            });
        }
        else {
            $input.inputmask("currency", {
                radixPoint: ebcontext.user.Preference.CurrencyDecimalSeperator,
                allowMinus: ctrl.AllowNegative,
                groupSeparator: "",
                digits: ctrl.DecimalPlaces,
                prefix: '',
                autoGroup: true
            });
        }

        if (ctrl.ShowAddInput) {
            let $btn, $inp;
            if (ctrl.IsDGCtrl) {
                $btn = $(`#td_${ctrl.EbSid_CtxId} .numplus-btn`);
                $inp = $(`#td_${ctrl.EbSid_CtxId} .numplus-inp`);
            }
            else {
                $btn = $(`#cont_${ctrl.EbSid_CtxId} .numplus-btn`);
                $inp = $(`#cont_${ctrl.EbSid_CtxId} .numplus-inp`);
            }
            $inp.val('0');

            $inp.inputmask("currency", {
                radixPoint: ebcontext.user.Preference.CurrencyDecimalSeperator,
                allowMinus: true,
                groupSeparator: "",
                digits: 0,
                prefix: '',
                autoGroup: true
            });

            $inp.off('focus').on('focus', function () {
                $(this).select();
            });

            $inp.off('keypress').on('keypress', function ($btn, e) {
                if (e.keyCode == 13) {
                    $btn.click();
                    return false;
                }
            }.bind(this, $btn));


            $btn.off('click').on('click', function (ctrl, $inp) {
                let val = ctrl.getValue() + parseInt($inp.val());
                ctrl.setValue(val);
                $inp.val('0');
            }.bind(this, ctrl, $inp));
        }

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

        //{// temp for hairo craft
        //    $input.blur(function () {
        //        var val = $input.val();
        //        let decLen = 2;

        //        if (val.trim() === "") {
        //            $input.val("0.00");
        //        }
        //        else if (!val.trim().includes(".")) {
        //            let newVal = val + ".00";
        //            $input.val(newVal);
        //        }
        //        else {
        //            let p1 = val.split(".")[0];
        //            let p2 = val.split(".")[1];
        //            zerolen = decLen - p2.length;
        //            let newVal = p1 + "." + p2 + "0".repeat(zerolen > 0 ? zerolen : 0);
        //            $input.val(newVal);
        //        }
        //    });
        //}
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

    this.DataLabel = function (ctrl) {
        let Refid = ctrl.DataSourceId;
        //this.GetFilterValuesForDataSource();
        this.Rowdata = null;
        //this.GetFilterValuesForDataSource();
        $(`#${ctrl.EbSid}_icon i`).addClass("fa " + ctrl.Icon);
        $(`#${ctrl.EbSid}_icon`).css("color", ctrl.IconColor);
        if (ctrl.StaticLabelFont !== null)
            GetFontCss(Label.StaticLabelFont, $(`#cont_${ctrl.EbSid} .eb-ctrl-label`));
        if (ctrl.DynamicLabelFont !== null)
            GetFontCss(ctrl.DynamicLabelFont, $(`#cont_${ctrl.EbSid} .data-dynamic-label`));
        this.DataLabelRefresh(ctrl);
    };

    this.DataLabelRefresh = function (ctrl) {
        this.filtervalues = [];
        let ebDbType = 11;
        let Refid = ctrl.DataSourceId;
        this.filtervalues.push(new fltr_obj(ebDbType, "eb_loc_id", (ebcontext.locations) ? ebcontext.locations.getCurrent() : 1));
        this.filtervalues.push(new fltr_obj(ebDbType, "eb_currentuser_id", ebcontext.user.UserId));
        this.filtervalues.push(new fltr_obj(11, "eb_current_language_id", ebcontext.languages.getCurrentLanguage()));
        this.filtervalues.push(new fltr_obj(16, "eb_current_locale", ebcontext.languages.getCurrentLocale()));
        this.filtervalues.push(new fltr_obj(ebDbType, "id", this.Renderer.rowId));
        this.filtervalues.push(new fltr_obj(ebDbType, this.Renderer.FormObj.TableName + "_id", this.Renderer.rowId));

        $.ajax({
            type: "POST",
            url: "../DS/GetData4DashboardControl",
            data: { DataSourceRefId: Refid, param: this.filtervalues },
            async: false,
            error: function (request, error) {
                EbPopBox("show", {
                    Message: "Failed to get data from DataSourse",
                    ButtonStyle: {
                        Text: "Ok",
                        Color: "white",
                        Background: "#508bf9",
                        Callback: function () {
                            //$(".dash-loader").hide();
                        }
                    }
                });
            },
            success: function (resp) {
                ctrl["Columns"] = JSON.parse(resp.columns);
                this.Rowdata = resp.row;
                $(`#cont_${ctrl.EbSid} .data-dynamic-label`).empty().append(this.Rowdata[ctrl.ValueMember.data]);
                setTimeout(this.DataLabelRefresh.bind(this, ctrl), ctrl.RefreshTime > 1000 ? ctrl.RefreshTime : 3000);
            }.bind(this)
        });
    }
    //this.BluePrint = function (ctrl, ctrlopts) {
    //    console.log("view mode bp");
    //    var bphtml = `<div id='bpdiv_${ctrl.EbSid}' >
    //                    <div id='toolbar_divBP' class='col-md-1 col-lg-1 col-sm-1 toolbarBP_cls_dev'>
    //                       <div class='vertical-align_tlbr' >

    //                                <div  id='addPolygon_BP' class='bp_toolbarproperties ' title="Mark">
    //                                    <i class="fa fa-object-ungroup "></i>   
    //                                </div>

    //                                <div  id='bg_image_BP' class='bp_toolbarproperties 'title="Image upload">
    //                                    <label for="bg_image">
    //                                       <i class='fa fa-picture-o'></i>
    //                                    </label>
    //                                     <input type='file' id='bg_image' accept='image/jpeg,image/png,image/jpg,svg' style=' display: none;' />
    //                                </div> 

    //                                <div id='removecircle_BP' class='bp_toolbarproperties 'title="Remove circles">
    //                                    <i class='fa fa-minus-circle'></i>
    //                                </div>

    //                                 <div id='resetsvg_BP' class='bp_toolbarproperties 'title="Reset position">
    //                                    <i class='fa fa-refresh'></i>
    //                                </div>

    //                                <div id='clearsvg_BP' class='bp_toolbarproperties 'title="Clear layers">
    //                                    <i class='fa fa-eraser '></i>
    //                                </div>

    //                                <div id='mark_position' class='bp_toolbarproperties ' tabindex='1' title="Mark Positions">
    //                                    <i class='fa fa-stop-circle-o '></i>
    //                                </div>

    //                                <div id='zoomToggle_BP' class='bp_toolbarproperties 'title="Zoom">
    //                                    <i class='fa fa-search  '></i>
    //                                </div>
    //                        </div>
    //                    </div>
    //                    <div class="col-md-11 col-lg-11 col-sm-11 svgcntnrBP_usr">

    //                        <div id="svgContainer"></div>
    //                    </div>
    //                </div>`;
    //    $('#' + ctrl.EbSid + 'Wraper').find('#' + ctrl.EbSid).addClass('bpdiv_retrive').html(bphtml);
    //    $('#cont_' + ctrl.EbSid).css('height', '100%');
    //    $('#bpdiv_' + ctrl.EbSid).css('height', '100%');
    //    $('#' + ctrl.EbSid + 'Wraper').css('height', '100%');


    //    var drawBP = new drawBluePrintfn(ctrl);

    //    drawBP.redrawSVGelements_usr();

    //    ctrl.getValueFromDOM = drawBP.getvalueSelected;
    //    ctrl.setValue = drawBP.setvalueSelected;
    //    ctrl._onChangeFunctions = [];
    //    ctrl.bindOnChange = function (p1) {
    //        if (!this._onChangeFunctions.includes(p1))
    //            this._onChangeFunctions.push(p1);
    //    };
    //    ctrl.clear = drawBP.clear_ctrlAftrsave;
    //    //display
    //    //ctrl.setValue = dgbf;
    //    ////store
    //    // ctrl.getValueFromDOM = drawBP.getvalueSelected();
    //    ////call fn onchange
    //    //ctrl.bindOnChange = asgd;

    //}

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
        var $ctrl = $("#" + ctrl.EbSid_CtxId + '_tagId');
        if (ctrl.AutoSuggestion === true) {
            var BloodhoundEngine = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.whitespace,
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: this.Renderer.relatedData[ctrl.EbSid_CtxId]
            });
            BloodhoundEngine.initialize();
            $ctrl.tagsinput({
                typeaheadjs: {
                    source: BloodhoundEngine.ttAdapter()
                }
            });

        }
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
        let fileType = this.getKeyByValue(EbEnums_w.FileClass, ctrl.FileType.toString());
        let filePlugin = $("#" + ctrl.EbSid).fileUploader({
            fileCtrl: ctrl,
            renderer: this.Renderer.rendererName,
            maxSize: ctrl.MaxSize,
            fileTypes: fileType,
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
        $(`#${ctrl.EbSid}`).attr("oninput", `this.value = this.value.replace(/[^0-9]/g, '');`);
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

        let onlyCtrs = (ctrl.CountriesList && ctrl.CountriesList.length > 0) ? ctrl.CountriesList.split(",") : [];
        let preferredCtrs = (ctrl.PreferredCountries && ctrl.PreferredCountries.length > 0) ? ctrl.PreferredCountries.split(",") : [];
        let initCtry = preferredCtrs.length > 0 ? preferredCtrs[0] : (onlyCtrs.length > 0 ? onlyCtrs[0] : 'in');

        var iti = window.intlTelInput(phninput, {
            allowDropdown: true,
            // autoHideDialCode: false,
            // autoPlaceholder: "off",
            // dropdownContainer: "body",
            //defaultCountry: "auto",
            formatOnDisplay: true,
            //geoIpLookup: function (callback) {
            //    $.get("https://ipinfo.io", function () { }, "jsonp").always(function (resp) {
            //        var countryCode = (resp && resp.country) ? resp.country : "";
            //        callback(countryCode);
            //    });
            //},
            //initialCountry: "auto",
            initialCountry: initCtry,
            // nationalMode: false,
            //onlyCountries: ['us', 'gb', 'ch', 'ca', 'do'],
            onlyCountries: onlyCtrs,
            //placeholderNumberType: "MOBILE",
            preferredCountries: preferredCtrs,
            separateDialCode: true,
            dropdown_maxheight: (ctrl.DropdownHeight || '100') + "px"//,
            //utilsScript: "../js/EbControls/EbPhoneControl_Utils.js"
        });

        if (ctrl.Sendotp) {
            var btnHtml = `<div style="display: flex;"> <button type="button" id="${ctrl.EbSid}_sendOTP" class="ebbtn eb_btn-sm eb_btnblue pull-left" style="margin-top:10px;display:none" >Send OTP</button>
                            <p id="${ctrl.EbSid}_OTPverified" style="font-size:14px;margin-top:10px;display:none">Verified <i style="font-size:16px;color:green" class="fa fa-check-circle"></i> </p></div>`;
            $('#cont_' + ctrl.EbSid).append(btnHtml);
            $(`#${ctrl.EbSid}_sendOTP`).off("click").on("click", this.SendOTP_modal.bind(this, ctrl));
            var vtemp = JSON.parse(ctrl.DataVals.M);
            if (vtemp.is_verified === 'true') {
                $(`#${ctrl.EbSid}_OTPverified`).show();
                $(`#${ctrl.EbSid}_OTPverified`).attr('varifiedNum', vtemp.phone_no);
            }
            else {
                $(`#${ctrl.EbSid}_sendOTP`).show();
            }
        }

        ctrl.getValueFromDOM = function (p1) {
            //to get numer only without country code===>$((`#${ctrl.EbSid}`),val();   

            if (ctrl.DisableCountryCode) {
                let num = $(`#${ctrl.EbSid}`).val();
                if (ctrl.Sendotp) {
                    checkNumChange(num);
                }
                return num;
            }
            else {
                let num = iti.getNumber();
                if (ctrl.Sendotp) {
                    checkNumChange(num);
                }
                return num;
            }

            function checkNumChange(num) {
                var vNum = $(`#${ctrl.EbSid}_OTPverified`).attr('varifiedNum');
                if (num !== vNum) {
                    $(`#${ctrl.EbSid}_sendOTP`).show();
                    $(`#${ctrl.EbSid}_OTPverified`).hide();
                    ctrl.DataVals.M = {};
                }
            }

        };
        ctrl.bindOnChange = function (p1) {
            $(phninput).on("change", p1);
            $(phninput).on('countrychange ', p1);
        };
        ctrl.setValue = function (p1) {
            iti.setNumber(p1);
        };

        $(`#${ctrl.EbSid}`).attr("maxlength", "18");


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

    //Send OTP...for phone,email control

    this.SendOTP_modal = function (ctrl) {
        $("#eb_common_loader").EbLoader("show");
        $(`#${ctrl.EbSid}_otpModal`).remove();
        var otpRecever = $(`#${ctrl.EbSid}`).val();
        $.ajax({
            url: "../WebForm/SendOTP_Contol",
            data: { formRefid: this.Renderer.formRefId, ctrlId: ctrl.EbSid, sendOTPto: otpRecever },
            cache: false,
            type: "POST",
            success: function (verifyKey) {
                console.log(verifyKey);
                var html = `<div id="${ctrl.EbSid}_otpModal" class="modal fade" role="dialog">
                      <div class="modal-dialog modal-dialog-centered" style="margin-top:15%;width:30%;">
                        <div class="modal-content">
                          <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                            <h4 class="modal-title" style="text-align: center;">Please enter the OTP to verify your phone number</h4>
                          </div>
                          <div class="modal-body">
                            <p style="text-align: center;">An OTP has been sent to ${otpRecever}</p>
                            <div style="justify-content: center;display: flex;">
                                <div id="phnOTPdivOuter" class="col-md-12">
                                    <div id="phnOTPdivInner">
                                        <input id="${ctrl.EbSid}_otpValue" class="phoneOTPinput" tabindex="1" type="text" maxlength="6" />
                                    </div>
                                <div style="text-align: center;margin-top: 20px;">
                                    <span id="OTPtimer" style="font-weight:bold"></span>
                                </div>
                                </div>
                            </div>
                          </div>
                           <div class="modal-footer">
                                <div tabindex="2" id="${ctrl.EbSid}_verifyotp" verifyKey="${verifyKey}" class="ebbtn eb_btn-sm eb_btnblue pull-left">
                                  Verify OTP
                                </div>
                                <div class="pull-right ">
                                     <button class="btn-link" hidden id="${ctrl.EbSid}_resendOTP">Resend</button>
                                </div>
                         </div>
                        </div>

                      </div>
                    </div>`;

                // $("#"+this.Renderer.FormObj.EbSid).append(html);
                $('body').append(html);
                $(`#${ctrl.EbSid}_otpModal`).modal("show");
                this.ShowOtpTimer(ctrl);
                $(`#${ctrl.EbSid}_verifyotp`).on('click', this.VerifyOTP_control.bind(this, ctrl));
                $(`#${ctrl.EbSid}_resendOTP`).on('click', this.ResendOTP_control.bind(this, ctrl));
                $("#eb_common_loader").EbLoader("hide");


            }.bind(this)
        });
    }

    var resend_otp = false;

    this.ShowOtpTimer = function (ctrl) {
        resend_otp = false;
        document.getElementById('OTPtimer').innerHTML = 03 + ":" + 00;
        this.startTimer_otp(ctrl);
    }.bind(this);

    this.startTimer_otp = function (ctrl) {
        if (resend_otp)
            return;
        var presentTime = document.getElementById('OTPtimer').innerHTML;
        var timeArray = presentTime.split(/[:]+/);
        var m = timeArray[0];
        var s = this.checkSecond_otp((timeArray[1] - 1));
        if (s == 59) { m = m - 1 }
        if (m < 0) {
            this.OtpTimeOut(ctrl);
            return;
        }
        document.getElementById('OTPtimer').innerHTML =
            m + ":" + s;
        setTimeout(this.startTimer_otp, 1000);
    }.bind(this);

    this.OtpTimeOut = function (ctrl) {
        EbMessage("show", { Background: "red", Message: "Time out" });
        $(`#${ctrl.EbSid}_resendOTP`).show();
    }.bind(this);

    this.checkSecond_otp = function (sec) {
        if (sec < 10 && sec >= 0) { sec = "0" + sec; } // add zero in front of numbers < 10
        if (sec < 0) { sec = "59"; }
        return sec;
    }.bind(this);

    this.VerifyOTP_control = function (ctrl) {

        $("#eb_common_loader").EbLoader("show");
        var otpval = $(`#${ctrl.EbSid}_otpValue`).val();
        var tstamp = $(`#${ctrl.EbSid}_verifyotp`).attr('verifyKey');
        $.ajax({
            url: "../WebForm/VerifyOTP_control",
            data: {
                formRefid: this.Renderer.formRefId,
                ctrlId: ctrl.EbSid,
                otpValue: otpval,
                tstamp: tstamp
            },
            cache: false,
            type: "POST",
            success: function (data) {
                if (data) {
                    ctrl.DataVals.M = JSON.stringify({ otp: otpval, timestamp: tstamp });
                    $("#eb_common_loader").EbLoader("hide");
                    $(`#${ctrl.EbSid}_sendOTP`).hide();
                    $(`#${ctrl.EbSid}_OTPverified`).show();
                    $(`#${ctrl.EbSid}_otpModal`).modal('hide');
                }
            }
        });
    }

    this.ResendOTP_control = function (ctrl) {
        $.ajax({
            url: "../WebForm/ResendOTP_control",
            data: {
                formRefid: this.Renderer.formRefId,
                ctrlId: ctrl.EbSid,
                sendOTPto: $(`#${ctrl.EbSid}`).val(),
                tstamp: $(`#${ctrl.EbSid}_verifyotp`).attr('verifyKey')
            },
            cache: false,
            type: "POST",
            success: function (data) {
                if (data) {
                    $("#eb_common_loader").EbLoader("hide");
                    this.ShowOtpTimer(ctrl);
                }
            }.bind(this)
        });
    }
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
                        else if (depCtrl_s === "form.eb_current_language_id") {
                            val = ebcontext.languages.getCurrentLanguage();
                            name = "eb_current_language_id";
                        }
                        else if (depCtrl_s === "form.eb_current_locale") {
                            val = ebcontext.languages.getCurrentLocale();
                            name = "eb_current_locale";
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
            $(`#img_${ctrl.EbSid}, #spn_${ctrl.EbSid} `).click(function () {
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


    this.QuestionnaireConfigurator = function (ctrl) {
        //debugger;
        let Ques_Confi = {};
        let que_SaveObj = [];
        // let ext_props = { "required": false, "unique": false, "validator": [] };
        let queSelCollection = {};

        $(`#${this.Renderer.FormObj.EbSid_CtxId}`).append(`<div  class='queConf_PGrid ' style='right: 0;top: 50px; position: fixed; width: 325px;'>
	                            <div  id='queConf_PGrid_wrp'>
	
	                            </div>
                        </div>`);

        let $input = $("#" + ctrl.EbSid_CtxId);

        var PGobj = new Eb_PropertyGrid({
            id: "queConf_PGrid_wrp",
            wc: ebcontext.user.wc,
            // cid: this.cid,
            $extCont: $(".queConf_PGrid"),
            isDraggable: true,
            root: 'webform'
        });
        //  PGobj.css("visibility", "hidden");




        if (this.Renderer.rendererName == "Bot") {
            $input.selectpicker({
                dropupAuto: false,
            });
        }
        else {
            $input.selectpicker({
                //dropupAuto: false,
                container: "body [eb-root-obj-container]:first",
                virtualScroll: 100,
                size: ctrl.DropdownHeight === 0 ? 'auto' : (ctrl.DropdownHeight / 23),

            });


            let $DD = $input.siblings(".dropdown-menu[role='combobox']");
            ////show dropdown ,adjust scroll etc related
            $("#" + ctrl.EbSid_CtxId).on("shown.bs.select", function (e) {
                let $el = $(e.target);
                let $DDbScont = $DD.closest(".bs-container");
                if ($DDbScont.length === 0)
                    return;
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


        }
        $(`#${ctrl.EbSid}_queBtn`).click(function () {

            let QueIds = $('#' + ctrl.EbSid_CtxId).selectpicker('val');
            QueIds.forEach(function (item, index) {////to add new item to collection and save object
                if (!(item in queSelCollection)) {
                    setObjectValue_Html(item, false, {});
                }

                //  CreatePG(control);
            });
            arr2 = Object.keys(queSelCollection)
            let removedElem = arr2.filter(x => !QueIds.includes(x));
            if (removedElem.length > 0) {////to delete removed item from collection and save object
                removedElem.forEach(function (item, index) {
                    $(`#EbQuestionnaire${item}`).remove();
                    let indx = que_SaveObj.findIndex(x => x.ques_id == item);
                    if (indx >= 0)
                        que_SaveObj.splice(indx, 1);
                    delete queSelCollection[item];
                });
            }


        });

        var setObjectValue_Html = function (item, setvalueTrue, _ext_prpty) {
            let ext_props = new EbObjects_w["Ques_ext_props"]("Question_properties" + Date.now());
            Ques_Confi = {};
            Ques_Confi.id = 0;
            Ques_Confi.ques_id = item;
            if (setvalueTrue) {

                $.extend(ext_props, _ext_prpty);
                ext_props.EbSid_CtxId = ext_props.EbSid = _ext_prpty.Name;
                Ques_Confi.ext_props = ext_props;
                queSelCollection[`${item}`] = ext_props;
            }
            else {

                Ques_Confi.ext_props = ext_props;
                queSelCollection[`${item}`] = ext_props;
            }
            que_SaveObj.push(Ques_Confi);
            $(`#${ctrl.EbSid}_queRender`).append(`<div class="queOuterDiv" id="EbQuestionnaire${item}" qid="${item}" style="border-style: ridge;padding:10px;margin:10px;">${(ctrl.QuestionBankCtlHtmlList[item])}</div>`);
            var control = ctrl.QuestionBankList[item];
            $(`.queOuterDiv`).find('*').attr('disabled', 'disabled').css('background-color', 'var(--eb-disablegray)');
            $('.queOuterDiv').off("click").on("click", CreatePG.bind(this, control));
        }

        var CreatePG = function (control, e) {
            let qId = $(e.target).closest('.queOuterDiv').attr('qid');
            console.log("CreatePG called for:" + control.Name);
            let propObj = queSelCollection[`${qId}`];
            //  this.$propGrid.css("visibility", "visible");
            ////PGobj.setObject(control, AllMetas_w["EbQuestionnaireConfigurator"]);
            PGobj.setObject(propObj, AllMetas_w["Ques_ext_props"]);////
        };

        ctrl.bindOnChange = function (p1) {

            // alert("bind change");
            //debugger;
            $(`#${ctrl.EbSid}_queBtn`).on("click", p1);
            $('#queConf_PGrid_wrp').on('input', p1);
        };
        ctrl.getValueFromDOM = function (p1) {

            return JSON.stringify(que_SaveObj);
        };

        ctrl.setValue = function (p1) {
            //debugger;
            var qArray = [];
            // alert("setvalue");
            if (p1 != null) {
                qObj = JSON.parse(p1);
                if (qObj.length > 0) {
                    qObj.forEach(function (item) {
                        item.id;
                        setObjectValue_Html(item.ques_id, true, item.ext_props);
                        qArray.push(item.ques_id);
                        // $(`#${ctrl.EbSid}_queRender`).append(ctrl.QuestionBankCtlHtmlList[item.ques_id]);
                    });
                }
            }
            $('#' + this.EbSid_CtxId).selectpicker('val', qArray);
        };
        ctrl.clear = function () {

            // alert("clear");
            if (ebcontext.renderContext === 'WebForm')
                this.setValue(null);
            else
                this.setValue(-1);
        };
    };

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
