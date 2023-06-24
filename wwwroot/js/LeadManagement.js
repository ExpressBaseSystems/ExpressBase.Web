﻿var LeadManagementObj = function (AccId, MC_Mode, C_Info, Center_Info, Doc_Info, Staff_Info, Nurse_Info, F_List, B_List, S_List, GP_List, CCityList, CCountryList, CityList, SubCategoryList) {
    //INCOMMING DATA
    //ManageCustomer_Mode=0 -> new customer
    this.AccId = AccId;
    this.Mode = MC_Mode;
    this.CustomerInfo = C_Info;
    this.CostCenterInfo = Center_Info;
    this.DoctorInfo = Doc_Info;
    this.StaffInfo = Staff_Info;
    this.NurseInfo = Nurse_Info;
    this.CCityList = CCityList || [];
    this.CCountryList = CCountryList || [];
    this.CityList = CityList || [];
    this.SubCategoryList = SubCategoryList || [];

    //this.ImageIdList = ImageIdList || [];
    this.FeedbackList = F_List || [];
    this.BillingList = B_List || [];
    this.SurgeryList = S_List || [];
    this.GfcPrpList = GP_List || [];
    //DOM ELEMENTS
    this.$CostCenter = $("#selCostCenter");
    this.$EnDate = $("#txtEnDate");
    this.$Mobile = $("#txtMobile");
    this.$Id = $("#txtId");
    this.$Name = $("#txtName");
    this.$Dob = $("#txtDob");
    this.$Age = $("#txtAge");
    this.$Sex = $("#selSex");
    this.$Phone = $("#txtPhone");
    this.$WhatsApp = $("#txtWhatsApp");
    this.$Profession = $("#txtProfession");
    this.$Email = $("#txtEmail");
    this.$Nri = $("#selNri");
    this.$CrntCity = $("#txtCrntCity");
    this.$CrntCountry = $("#txtCrntCountry");
    this.$HomeCity = $("#txtHomeCity");
    this.$HomeDistrict = $("#selHomeDistrict");
    this.$Service = $("#selService");
    this.$LeadOwner = $("#selLeadOwner");
    this.$SourceCategory = $("#selSourceCategory");
    this.$SubCategory = $("#txtSubCategory");
    this.$Consultation = $("#selConsultation");
    this.$OnlineConsultation = $("#selOnlineConsultation");
    this.$PicReceived = $("#selPicReceived");
    this.$BaldnessGrade = $("#selBaldnessGrade");
    this.$DiffusePattern = $("#selDiffusePattern");
    this.$HfCurrently = $("#selHfCurrently");
    this.$HtPreviously = $("#selHtPreviously");
    this.$CountryCode = $("#selCountryCode");
    this.$CustomerCategory = $("#selCustomerCategory");
    this.$LastModifiedBy = $("#txtLastModifiedBy");
    this.$GoogleReview = $("#selGoogleReview");
    this.$Stars = $("#selStars");
    this.$CustomerLanguage = $("#selCustomerLanguage");
    this.$ProcedureDate = $("#txtProcedureDate");
    this.$Comments = $("#txtComments");
    this.$btnNewPatient = $("#btnNewPatient");
    this.$btnNewHtEvaluation = $("#btnNewHtEvaluation");

    this.$ConsultedDate = $("#txtConsultedDate");
    this.$Doctor = $("#selDoctor");
    this.$ProbableMonth = $("#txtProbableMonth");
    this.$TotalGrafts = $("#txtTotalGrafts");
    this.$TotalRate = $("#txtTotalRate");
    this.$NoOfPRP = $("#txtNoOfPRP");
    this.$FeePaid = $("#selFeePaid");
    this.$Closing = $("#selClosing");
    this.$Nature = $("#selNature");

    //FOLLOWUP
    this.divFeedback = "divFdbk";
    this.$btnNewFeedBack = $("#btnNewFeedBack");
    this.$MdlFeedBack = $("#mdlFeedBack");
    this.$FlUpDate = $("#txtFlUpDate");
    this.$FlUpStatus = $("#selFlUpStatus");
    this.$FlUpFolDate = $("#txtFlUpFolDate");
    this.$FlUpComnt = $("#txaFlUpComnt");
    this.$FlUpNotPicked = $("#chkFlUpNotPicked");
    this.$FlUpSave = $("#btnFlUpSave");
    //BILLING
    this.divBilling = "divBilling";
    this.$btnNewBilling = $("#btnNewBilling");
    this.$MdlBilling = $("#mdlBilling");
    this.$BlngDate = $("#txtBlngDate");
    this.$BlngTotal = $("#txtBlngTotal");
    this.$BlngRcvd = $("#txtBlngRcvd");
    this.$BlngBal = $("#txtBlngBal");
    this.$BlngPaid = $("#txtBlngPaid");
    this.$BlngMode = $("#selBlngMode");
    this.$BlngBank = $("#txtBlngBank");
    this.$BlngPDC = $("#selBlngPDC");
    this.$BlngClrDate = $("#txtBlngClrDate");
    this.$BlngNarr = $("#txtBlngNarr");
    this.$BlngSave = $("#btnBlngSave");
    //SURGERY
    this.divSrgy = "divSrgy";
    this.$btnNewSurgeryDtls = $("#btnNewSurgeryDtls");
    this.$MdlSurgery = $("#mdlSurgery");
    this.$SrgyDate = $("#txtSrgyDate");
    this.$SrgyBranch = $("#selSrgyBranch");
    this.$SrgyExtrDnBy = $("#selSrgyExtrDnBy");
    this.$SrgyImplantBy = $("#selSrgyImplantBy");
    this.$SrgyConsentBy = $("#selSrgyConsentBy");
    this.$SrgyAnasthBy = $("#selSrgyAnasthBy");
    this.$SrgyPostBrfBy = $("#selSrgyPostBrfBy");
    this.$SrgyNurse = $("#selSrgyNurse");
    this.$SrgyCmpltry = $("#selSrgyCmpltry");
    this.$SrgyMethod = $("#selSrgyMethod");
    this.$SrgyComnt = $("#txaSrgyComnt");
    this.$SrgySave = $("#btnSrgySave");
    //GFC/PRP
    this.divGfcPrp = "divGfcPrp";
    this.$btnNewGfcPrpDtls = $("#btnNewGfcPrpDtls");
    this.$MdlGfcPrp = $("#mdlGfcPrp");
    this.$GfcPrpDate = $("#txtGfcPrpDate");
    this.$GfcPrpBranch = $("#selGfcPrpBranch");
    this.$GfcOrPrp = $("#selGfcOrPrp");
    this.$GfcPrpCmpltry = $("#selGfcPrpCmpltry");
    this.$GfcPrpSession = $("#selGfcPrpSession");
    this.$GfcPrpDnBy = $("#selGfcPrpDnBy");
    this.$GfcPrpComnt = $("#txaGfcPrpComnt");
    this.$GfcPrpSave = $("#btnGfcPrpSave");
    //ATTACH
    //this.$FirstImgPage = $("#btnFirstImgPage");
    //this.$PrevImgPage = $("#btnPrevImgPage");
    //this.$ImgPageNo = $("#lblImgPage");
    //this.$NextImgPage = $("#btnNextImgPage");
    //this.$LastImgPage = $("#btnLastImgPage");

    //DECLARED DATA
    this.OutDataList = [];
    //this.drake = null;
    //this.imgCrntPage = 0;//current page
    //this.imgPageSize = 10;//page size const
    this.isMobileUnique = null;
    this.isPhoneUnique = null;
    this.isWhatsAppUnique = null;
    //this.isSlickInit = false;

    this.init = function () {
        $("#eb_common_loader").EbLoader("show");
        this.initMenuBarObj();
        this.initForm();

        this.$CrntCity.autocomplete({ source: this.CCityList });
        this.$CrntCountry.autocomplete({ source: this.CCountryList });
        this.$HomeCity.autocomplete({ source: this.CityList });
        this.$SubCategory.autocomplete({ source: this.SubCategoryList });

        $(document).bind('keypress', function (event) {
            if (event.which === 19 && event.ctrlKey && event.shiftKey) {
                if (!($("#btnSave").prop("disabled")))
                    this.onClickBtnSave();
            }
        }.bind(this));

        $("#eb_common_loader").EbLoader("hide");
    };

    this.initMenuBarObj = function () {
        //$("#layout_div").data("EbHeader")
        var menuBarObj = new EbHeader();
        let nametxt = this.CustomerInfo["name"] || "New Customer";
        menuBarObj.setName("Lead Management - " + nametxt);
        document.title = "Lead Management - " + nametxt;

        if (intSpecialPermission === "True" && this.AccId > 0) {
            menuBarObj.insertButton(`
            <button id="btnSave" class='btn' title='Save (Ctrl+Shift+S)'><i class="fa fa-floppy-o" aria-hidden="true"></i></button>
            <button id="btnNew" class='btn' title='New'><i class="fa fa-user-plus" aria-hidden="true"></i></button>
            <button id="btnDel" class='btn' title='Delete'><i class="fa fa-trash" aria-hidden="true"></i></button>`);
        }
        else {
            menuBarObj.insertButton(`
            <button id="btnSave" class='btn' title='Save (Ctrl+Shift+S)'><i class="fa fa-floppy-o" aria-hidden="true"></i></button>
            <button id="btnNew" class='btn' title='New'><i class="fa fa-user-plus" aria-hidden="true"></i></button>`);
        }

        $("#btnSave").on("click", this.onClickBtnSave.bind(this));
        $("#btnNew").on("click", function () {
            if (confirm("Unsaved data will be lost!\n\nClick OK to Continue"))
                window.location = window.origin + "/leadmanagement";
        }.bind(this));
        $("#btnDel").on("click", function () {
            if (intSpecialPermission === "True" && this.AccId > 0) {
                if (confirm("Are you sure!\n\nClick OK to Continue"))
                    $.ajax({
                        type: "POST",
                        url: "../CustomPage/DeleteCustomer",
                        data: { CustId: this.AccId },
                        success: function (status) {
                            if (status) {
                                alert("Deleted Successfully");
                                window.close();
                            }
                            else
                                EbMessage("show", { Message: 'Failed', AutoHide: true, Background: '#aa0000' });
                        }.bind(this)
                    });
            }
        }.bind(this));
    };

    this.initForm = function () {

        //BASIC DETAILS
        this.$EnDate.datetimepicker({ timepicker: false, format: "d-m-Y" });
        this.$Dob.datetimepicker({ timepicker: false, format: "d-m-Y" });

        this.$Dob.on("change", function (evt) {
            this.$Age.val(parseInt(moment.duration(moment().diff(moment($(evt.target).val(), "DD-MM-YYYY"))).asYears()));
        }.bind(this));

        this.$Age.on("focusout", function (evt) {
            let age = parseInt(this.$Age.val());
            if (!isNaN(age) && (parseInt(moment.duration(moment().diff(moment(this.$Dob.val(), "DD-MM-YYYY"))).asYears()) !== age))
                this.$Dob.val("01-01-" + (moment().year() - age));
        }.bind(this));

        this.$btnNewPatient.on("click", function () {
            let pid = this.$btnNewPatient.data('patient_master_id');
            if (pid) {
                let params = [];
                params.push(new fltr_obj(11, "id", pid));
                let _p = btoa(unescape(encodeURIComponent(JSON.stringify(params))));
                let url = `../WebForm/Index?_r=hairocraft-hairocraft-0-855-1537-855-1537&_p=${_p}&_m=1&_l=${this.CustomerInfo["eb_loc_id"]}`;
                window.open(url, '_blank');
            }
            else {
                let params = [];
                params.push(new fltr_obj(11, "patient_name_id", this.AccId));
                let _p = btoa(unescape(encodeURIComponent(JSON.stringify(params))));
                let url = `../WebForm/Index?_r=hairocraft-hairocraft-0-855-1537-855-1537&_p=${_p}&_m=2&_l=${this.CustomerInfo["eb_loc_id"]}`;
                window.open(url, '_blank');
            }
        }.bind(this));

        this.$btnNewHtEvaluation.on("click", function () {
            let pid = this.$btnNewHtEvaluation.data('ht_evaluation_id');
            if (pid) {
                let params = [];
                params.push(new fltr_obj(11, "id", pid));
                let _p = btoa(unescape(encodeURIComponent(JSON.stringify(params))));
                let url = `../WebForm/Index?_r=hairocraft-hairocraft-0-945-1627-945-1627&_p=${_p}&_m=1&_l=${this.CustomerInfo["eb_loc_id"]}`;
                window.open(url, '_blank');
            }
            else {
                let params = [];
                params.push(new fltr_obj(11, "patient_name_id", this.AccId));
                let _p = btoa(unescape(encodeURIComponent(JSON.stringify(params))));
                let url = `../WebForm/Index?_r=hairocraft-hairocraft-0-945-1627-945-1627&_p=${_p}&_m=2&_l=${this.CustomerInfo["eb_loc_id"]}`;
                window.open(url, '_blank');
            }
        }.bind(this));

        this.$ConsultedDate.datetimepicker({ timepicker: false, format: "d-m-Y" });
        this.$ProbableMonth.MonthPicker({ Button: this.$ProbableMonth.next().removeAttr("onclick") });
        this.$ProcedureDate.datetimepicker({ timepicker: false, format: "d-m-Y" });

        //FEEDBACK  BILLING  SURGERY GFC/PRP
        this.initFeedBackModal();
        this.initBillingModal();
        this.initSurgeryModal();
        this.initGfcPrpModal();
        //this.initAttachTab();
        //this.initDrake();

        this.$CostCenter.children().remove();
        this.$SrgyBranch.children().remove();
        this.$GfcPrpBranch.children().remove();
        $.each(this.CostCenterInfo, function (key, val) {
            this.$CostCenter.append(`<option value='${key}'>${val}</option>`);
            this.$SrgyBranch.append(`<option value='${key}'>${val}</option>`);
            this.$GfcPrpBranch.append(`<option value='${key}'>${val}</option>`);
        }.bind(this));

        this.$Doctor.children().remove();
        this.$SrgyExtrDnBy.children().remove();
        this.$SrgyImplantBy.children().remove();
        this.$SrgyConsentBy.children().remove();
        this.$SrgyAnasthBy.children().remove();
        this.$SrgyPostBrfBy.children().remove();
        this.$GfcPrpDnBy.children().remove();
        this.$SrgyExtrDnBy.append(`<option value='0'>- Select -</option>`);
        this.$SrgyImplantBy.append(`<option value='0'>- Select -</option>`);
        this.$SrgyConsentBy.append(`<option value='0'>- Select -</option>`);
        this.$SrgyAnasthBy.append(`<option value='0'>- Select -</option>`);
        this.$SrgyPostBrfBy.append(`<option value='0'>- Select -</option>`);
        this.$GfcPrpDnBy.append(`<option value='0'>- Select -</option>`);
        $.each(this.DoctorInfo, function (key, val) {
            this.$Doctor.append(`<option value='${val}'>${key}</option>`);
            this.$SrgyExtrDnBy.append(`<option value='${val}'>${key}</option>`);
            this.$SrgyImplantBy.append(`<option value='${val}'>${key}</option>`);
            this.$SrgyConsentBy.append(`<option value='${val}'>${key}</option>`);
            this.$SrgyAnasthBy.append(`<option value='${val}'>${key}</option>`);
            this.$SrgyPostBrfBy.append(`<option value='${val}'>${key}</option>`);
            this.$GfcPrpDnBy.append(`<option value='${val}'>${key}</option>`);
        }.bind(this));

        //this.$SrgyExtrDnBy.multiselect({
        //    maxHeight: 200,
        //    numberDisplayed: 2
        //});////////////////////////////

        this.$LeadOwner.children().remove();
        this.$Closing.children().remove();
        $.each(this.StaffInfo, function (key, val) {
            this.$LeadOwner.append(`<option value='${val}'>${key}</option>`);
            this.$Closing.append(`<option value='${val}'>${key}</option>`);
        }.bind(this));

        this.$SrgyNurse.children().remove();
        this.$SrgyNurse.append(`<option value='0'>- Select -</option>`);
        $.each(this.NurseInfo, function (key, val) {
            this.$SrgyPostBrfBy.append(`<option value='${val}'>${key}</option>`);
            this.$SrgyNurse.append(`<option value='${val}'>${key}</option>`);
            //this.$SrgyConsentBy.append(`<option value='${val + 1000}'>${key}</option>`);//
            //this.$SrgyAnasthBy.append(`<option value='${val + 1000}'>${key}</option>`);//
            this.$SrgyConsentBy.append(`<option value='${val}'>${key}</option>`);//
            this.$SrgyAnasthBy.append(`<option value='${val}'>${key}</option>`);//
            this.$GfcPrpDnBy.append(`<option value='${val}'>${key}</option>`);
        }.bind(this));

        this.$Mobile.on("change", function (e) {
            let newMob = $(e.target).val().trim();
            if (this.Mode === 1 && (this.CustomerInfo["genurl"] === newMob || this.CustomerInfo["watsapp_phno"] === newMob)) {
                this.isMobileUnique = true;
            }
            else {
                this.isMobileUnique = false;
                $.ajax({
                    type: "POST",
                    url: "../CustomPage/UniqueCheck",
                    data: { Key: "genurl", Value: newMob },
                    success: function (result) {
                        if (!result) {
                            EbMessage("show", { Message: 'Entered Mobile Number is Already Exists', AutoHide: true, Background: '#aa0000' });
                            this.isMobileUnique = false;
                        }
                        else
                            this.isMobileUnique = true;
                    }.bind(this)
                });
            }
        }.bind(this));

        this.$Phone.on("change", function (e) {
            let newMob = $(e.target).val().trim();
            if (this.Mode === 1 && (this.CustomerInfo["genphoffice"] === newMob || this.CustomerInfo["watsapp_phno"] === newMob)) {
                this.isPhoneUnique = true;
            }
            else {
                this.isPhoneUnique = false;
                $.ajax({
                    type: "POST",
                    url: "../CustomPage/UniqueCheck",
                    data: { Key: "genurl", Value: newMob },
                    success: function (result) {
                        if (!result) {
                            EbMessage("show", { Message: 'Entered Phone Number is Already Exists', AutoHide: true, Background: '#aa0000' });
                            this.isPhoneUnique = false;
                        }
                        else
                            this.isPhoneUnique = true;
                    }.bind(this)
                });
            }
        }.bind(this));

        this.$WhatsApp.on("change", function (e) {
            let newMob = $(e.target).val().trim();
            if (this.Mode === 1 && (this.CustomerInfo["genphoffice"] === newMob || this.CustomerInfo["genurl"] === newMob)) {
                this.isWhatsAppUnique = true;
            }
            else {
                this.isWhatsAppUnique = false;
                $.ajax({
                    type: "POST",
                    url: "../CustomPage/UniqueCheck",
                    data: { Key: "watsapp_phno", Value: newMob },
                    success: function (result) {
                        if (!result) {
                            EbMessage("show", { Message: 'Entered WhatsApp Number is Already Exists', AutoHide: true, Background: '#aa0000' });
                            this.isWhatsAppUnique = false;
                        }
                        else
                            this.isWhatsAppUnique = true;
                    }.bind(this)
                });
            }
        }.bind(this));

        if (this.Mode === 1) {
            this.fillCustomerData();
            this.isMobileUnique = true;
            this.isPhoneUnique = true;
            this.isWhatsAppUnique = true;
        }
        else if (this.Mode === 0) {
            this.$EnDate.val(moment(new Date()).format("DD-MM-YYYY"));
            this.$Closing.val("");
            this.$Doctor.val("");
            this.$LeadOwner.val("");
            this.$Service.val("");
            this.$SourceCategory.val("");
            this.isMobileUnique = false;
            this.isPhoneUnique = false;
            this.isWhatsAppUnique = false;
        }
    };

    //this.onClickSmallImage = function (evt) {
    //    $("#mdlViewImage").modal('show');
    //    if (!this.isSlickInit) {
    //        this.isSlickInit = true;
    //        $('#modal-imgs-cont').slick({
    //            lazyLoad: 'ondemand',//progressive
    //            //dots: true,
    //            prevArrow: "<button class='img-prevArrow'><i class='fa fa-angle-left fa-4x' aria-hidden='true'></i></button>",
    //            nextArrow: "<button class='img-nextArrow'><i class='fa fa-angle-right fa-4x' aria-hidden='true'></i></button>"
    //        });

    //        $('#modal-imgs-cont').on('lazyLoadError', function (event, slick, currentSlide, nextSlide) {
    //            $(currentSlide).attr('src', '/images/imagenotfound.svg');
    //        });
    //    }
    //    let idx = parseInt($(evt.target).attr("data-idx"));
    //    $('#modal-imgs-cont').slick('slickGoTo', idx);
    //}.bind(this);

    //this.initAttachTab = function () {
    //    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    //        var target = $(e.target).attr("href"); // activated tab
    //        if (target === "#menuAttach" && this.ImageIdList.length !== 0) {
    //            //this.drawImagePage();
    //        }
    //    }.bind(this));

    //    this.$FirstImgPage.on("click", function (evt) {
    //        if (this.imgCrntPage !== 0) {
    //            this.imgCrntPage = 0;
    //            //this.drawImagePage();
    //        }
    //    }.bind(this));

    //    this.$PrevImgPage.on("click", function (evt) {
    //        if (this.imgCrntPage !== 0) {
    //            this.imgCrntPage--;
    //            //this.drawImagePage();
    //        }
    //    }.bind(this));

    //    this.$NextImgPage.on("click", function (evt) {
    //        if (this.imgCrntPage !== parseInt((this.ImageIdList.length - 1) / this.imgPageSize)) {
    //            this.imgCrntPage++;
    //            //this.drawImagePage();
    //        }
    //    }.bind(this));

    //    this.$LastImgPage.on("click", function (evt) {
    //        if (this.imgCrntPage !== parseInt((this.ImageIdList.length - 1) / this.imgPageSize)) {
    //            this.imgCrntPage = parseInt((this.ImageIdList.length - 1) / this.imgPageSize);
    //            //this.drawImagePage();
    //        }
    //    }.bind(this));
    //};

    //this.drawImagePage = function () {
    //    $("#divAllImg").children().remove();
    //    for (let i = this.imgCrntPage * this.imgPageSize; i < this.ImageIdList.length && i < (this.imgCrntPage + 1) * this.imgPageSize; i++) {
    //        this.appendSmallImage(i, this.ImageIdList[i]);
    //    }
    //    $("#divAllImg").children().find('.Eb_Image').Lazy();
    //    this.$ImgPageNo.text("Page " + (this.imgCrntPage + 1) + " of " + (parseInt((this.ImageIdList.length - 1) / this.imgPageSize) + 1));
    //    $(".list-item-img").on("click", this.onClickSmallImage);

    //    $(".list-item-img").Lazy({
    //        // your configuration goes here
    //        scrollDirection: 'vertical',
    //        effect: 'fadeIn',
    //        visibleOnly: true,
    //        onError: function (element) {
    //            element.attr('src', '/images/imagenotfound.svg');
    //        }
    //    });

    //};

    //this.appendSmallImage = function (indx, imgid) {
    //    $("#divAllImg").append(`
    //        <div class="img_wrapper">
    //            <div class="img_wrapper_img">
    //                <img src="/images/spin.gif" data-src="/images/small/${imgid}.jpg" data-idx="${indx}" data-id="${imgid}" class="img-responsive list-item-img" />
    //            </div>
    //        </div>`);
    //};

    //this.initDrake = function () {
    //    this.drake = new dragula([document.getElementById("divAllImg"), document.getElementById("divCustomerDp")], {

    //        accepts: function (el, target, source, sibling) {
    //            if ($(target)[0] === $("#divCustomerDp")[0] && $(source)[0] === $("#divAllImg")[0]) {
    //                $("#divCustomerDp").children().hide();
    //                return true;
    //            }
    //            else {
    //                $("#divCustomerDp").children().show();
    //                return false;
    //            }
    //        },
    //        copy: true
    //    });

    //    this.drake.on("drop", function (el, target, source, sibling) {
    //        if ($(target)[0] === $("#divCustomerDp")[0] && $(source)[0] === $("#divAllImg")[0]) {
    //            let id = $(el).find("img").attr('data-id');
    //            $("#divCustomerDp").children().remove();
    //            $("#divCustomerDp").append(`
    //                <div style="width:100%; height:100%; display:flex; align-items: center; justify-content: center;">
    //                    <img src="/images/small/${id}.jpg" data-id="${id}" style="max-height: 135px; max-width: 130px;" />
    //                </div>`);
    //        }
    //    });
    //};

    this.initFeedBackModal = function () {
        this.tempStatusObject = null;

        this.$btnNewFeedBack.on("click", function () {
            if (this.AccId === 0) {
                EbMessage("show", { Message: 'Save Customer Information then try to add Followup', AutoHide: true, Background: '#aa0000' });
            }
            else {
                this.$MdlFeedBack.modal('show');
            }
        }.bind(this));

        this.$FlUpDate.datetimepicker({ timepicker: false, format: "d-m-Y" });
        this.$FlUpFolDate.datetimepicker({ timepicker: false, format: "d-m-Y" });

        this.$FlUpSave.on("click", function () {
            if (this.AccId === 0) {
                EbMessage("show", { Message: 'Save Customer Information then try to add Followup', AutoHide: true, Background: '#aa0000' });
                return;
            }
            if (this.$FlUpDate.val().trim() === "" || this.$FlUpStatus.val().trim() === "" || this.$FlUpFolDate.val().trim() === "" || this.$FlUpComnt.val().trim() === "") {
                EbMessage("show", { Message: 'Validation Faild. Fill all Fields.', AutoHide: true, Background: '#aa0000' });
                return;
            }

            var id = 0;
            this.$FlUpSave.children().show();
            this.$FlUpSave.prop("disabled", true);
            if (this.$MdlFeedBack.attr("data-id") !== '')
                id = parseInt(this.$MdlFeedBack.attr("data-id"));
            var fdbkObj = {
                Id: id,
                Date: this.$FlUpDate.val(),
                Status: this.$FlUpStatus.val(),
                Fup_Date: this.$FlUpFolDate.val(),
                Comments: this.$FlUpComnt.val(),
                Account_Code: this.AccId,
                Is_Picked_Up: this.$FlUpNotPicked.prop("checked") ? "No" : "Yes"
            };
            $.ajax({
                type: "POST",
                url: "../CustomPage/SaveFollowup",
                data: { FollowupInfo: JSON.stringify(fdbkObj) },
                error: function (xhr, ajaxOptions, thrownError) {
                    this.$FlUpSave.prop("disabled", false);
                    this.$FlUpSave.children().hide();
                    EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                }.bind(this),
                success: function (result) {
                    this.$FlUpSave.prop("disabled", false);
                    this.$FlUpSave.children().hide();
                    if (result) {
                        EbMessage("show", { Message: 'Saved Successfully', AutoHide: true, Background: '#00aa00' });
                        this.$MdlFeedBack.modal('hide');
                        location.reload();
                    }
                    else {
                        EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#aa0000' });
                    }
                }.bind(this)
            });
        }.bind(this));

        new ListViewCustom(this.divFeedback, this.FeedbackList, function (id, tempObj) {
            this.$MdlFeedBack.attr("data-id", id);

            this.setFollowupStatus(tempObj.Status);

            this.$FlUpDate.val(tempObj.Date);
            //this.$FlUpStatus.val(tempObj.Status);
            this.$FlUpFolDate.val(tempObj.Fup_Date);
            this.$FlUpComnt.val(tempObj.Comments);
            this.$FlUpNotPicked.prop("checked", tempObj.Is_Picked_Up === "Yes" ? false : true);
            //this.$FlUpDate.prop("disabled", true);

            this.$MdlFeedBack.modal('show');
        }.bind(this));

        this.$MdlFeedBack.on('shown.bs.modal', function (e) {
            if (this.$MdlFeedBack.attr("data-id") === "") {
                this.$FlUpDate.val(moment(new Date()).format("DD-MM-YYYY"));
                this.$FlUpFolDate.val(moment(new Date()).format("DD-MM-YYYY"));
                this.$FlUpComnt.val("");
                this.$FlUpNotPicked.prop("checked", false);
                this.$FlUpSave.children().hide();
                this.$FlUpSave.prop("disabled", false);
                //this.$FlUpDate.prop("disabled", false);

                if (this.FeedbackList.length === 0)
                    this.setFollowupStatus("To Consult");
                else
                    this.setFollowupStatus(this.FeedbackList[0]["Status"]);
            }

        }.bind(this));

        this.$MdlFeedBack.on('hidden.bs.modal', function (e) {
            this.$MdlFeedBack.attr("data-id", "");
        }.bind(this));
    };

    this.setFollowupStatus = function (_oldStatus) {
        let isClosed = false;
        $.each(this.FeedbackList, function (i, obj) {
            if (obj["Status"] === "Closed")
                isClosed = true;
        });
        $.each(this.$FlUpStatus.children(), function (i, ob) {
            let tt = $(ob).attr("value");
            if (!isClosed && (tt === "HT Done"))
                $(ob).prop("disabled", true);
            else
                $(ob).prop("disabled", false);
        }.bind(this));

        this.$FlUpStatus.val(_oldStatus);

        //if (this.tempStatusObject === null) {
        //    this.tempStatusObject = {};
        //    $.each(this.$FlUpStatus.children(), function (i, ob) {
        //        let nextStatus = $(ob).attr("data-ns");
        //        let _next = [];
        //        if (nextStatus !== "") {
        //            _next = nextStatus.split(",");
        //        }
        //        this.tempStatusObject[$(ob).attr("value")] = _next;
        //    }.bind(this));
        //}
        //if (this.tempStatusObject[_oldStatus].length === 0) {
        //    $.each(this.$FlUpStatus.children(), function (i, ob) {
        //        $(ob).prop("disabled", false);
        //    });
        //}
        //else {
        //    $.each(this.$FlUpStatus.children(), function (i, ob) {
        //        if (this.tempStatusObject[_oldStatus].indexOf($(ob).attr("value")) === -1)
        //            $(ob).prop("disabled", true);
        //        else {
        //            $(ob).prop("disabled", false);
        //            this.$FlUpStatus.val($(ob).attr("value"));
        //        }
        //    }.bind(this));
        //}
        //this.$FlUpStatus.val(_oldStatus);
    };

    this.initBillingModal = function () {
        this.$btnNewBilling.on("click", function () {
            if (this.AccId === 0) {
                EbMessage("show", { Message: 'Save Customer Information then try to add Billing Details', AutoHide: true, Background: '#aa0000' });
            }
            else {
                this.$MdlBilling.modal('show');
            }
        }.bind(this));

        this.$BlngDate.datetimepicker({ timepicker: false, format: "d-m-Y" });
        this.$BlngClrDate.datetimepicker({ timepicker: false, format: "d-m-Y" });

        this.$BlngMode.on("change", function (evt) {
            if ($(evt.target).val() === "Cash") {
                this.$BlngBank.val("");
                this.$BlngBank.prop("disabled", true);
            }
            else {
                this.$BlngBank.prop("disabled", false);
            }
            if ($(evt.target).val() === "Cheque") {
                this.$BlngPDC.prop("disabled", false);
            }
            else {
                this.$BlngPDC.val('false');
                this.$BlngPDC.prop("disabled", true);
            }
        }.bind(this));

        this.$BlngSave.on("click", function () {
            if (this.AccId === 0) {
                EbMessage("show", { Message: 'Save Customer Information then try to add Billing Details', AutoHide: true, Background: '#aa0000' });
                return;
            }
            if (this.$BlngDate.val() === "" || this.$BlngTotal.val() === "" || this.$BlngRcvd.val() === "" || this.$BlngBal.val() === "" || this.$BlngPaid.val() === "" || this.$BlngMode.val() === "" || this.$BlngClrDate.val() === "" || this.$BlngNarr.val() === "") {
                EbMessage("show", { Message: 'Validation Faild. Check all Fields.', AutoHide: true, Background: '#aa0000' });
                return;
            }

            var id = 0;
            this.$BlngSave.children().show();
            this.$BlngSave.prop("disabled", true);
            if (this.$MdlBilling.attr("data-id") !== '')
                id = parseInt(this.$MdlBilling.attr("data-id"));

            var billingObj = {
                Id: id,
                Date: this.$BlngDate.val(),
                Total_Amount: this.$BlngTotal.val(),
                Total_Received: this.$BlngRcvd.val(),
                Balance_Amount: this.$BlngBal.val(),
                Cash_Paid: this.$BlngPaid.val(),
                Payment_Mode: this.$BlngMode.val(),
                Bank: this.$BlngBank.val(),
                PDC: this.$BlngPDC.val(),
                Clearence_Date: this.$BlngClrDate.val(),
                Narration: this.$BlngNarr.val(),
                Account_Code: this.AccId
            };
            $.ajax({
                type: "POST",
                url: "../CustomPage/SaveBilling",
                data: { BillingInfo: JSON.stringify(billingObj) },
                error: function (xhr, ajaxOptions, thrownError) {
                    this.$BlngSave.prop("disabled", false);
                    this.$BlngSave.children().hide();
                    EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                }.bind(this),
                success: function (result) {
                    this.$BlngSave.prop("disabled", false);
                    this.$BlngSave.children().hide();
                    if (result) {
                        EbMessage("show", { Message: 'Saved Successfully', AutoHide: true, Background: '#00aa00' });
                        this.$MdlFeedBack.modal('hide');
                        location.reload();////////
                    }
                    else {
                        EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#aa0000' });
                    }
                }.bind(this)
            });
        }.bind(this));

        new ListViewCustom(this.divBilling, this.BillingList, function (id, tempObj) {
            this.$MdlBilling.attr("data-id", id);
            this.$BlngDate.val(tempObj.Date);
            this.$BlngTotal.val(tempObj.Total_Amount);
            this.$BlngRcvd.val((parseInt(tempObj.Total_Received) - parseInt(tempObj.Cash_Paid)));
            this.$BlngBal.val((parseInt(tempObj.Balance_Amount) + parseInt(tempObj.Cash_Paid)));
            this.$BlngPaid.val(tempObj.Cash_Paid);
            this.$BlngMode.val(tempObj.Payment_Mode);
            this.$BlngBank.val(tempObj.Bank);
            this.$BlngPDC.val(tempObj.PDC);
            this.$BlngClrDate.val(tempObj.Clearence_Date);
            this.$BlngNarr.val(tempObj.Narration);
            this.$MdlBilling.modal('show');
        }.bind(this));

        this.$MdlBilling.on('shown.bs.modal', function (e) {
            if (this.$MdlBilling.attr("data-id") === "") {
                this.$BlngDate.val(moment(new Date()).format("DD-MM-YYYY"));
                this.$BlngTotal.val("");
                this.$BlngRcvd.val("0");
                this.$BlngBal.val("");
                this.$BlngPaid.val("");
                //this.$BlngMode.val("");
                this.$BlngBank.val("");
                this.$BlngPDC.val("false");
                this.$BlngClrDate.val(moment(new Date()).format("DD-MM-YYYY"));
                this.$BlngNarr.val("");
                this.$BlngSave.prop("disabled", false);
                this.$BlngSave.children().hide();
                this.$BlngTotal.prop("disabled", false);
                this.$BlngRcvd.prop("disabled", true);
                this.$BlngBal.prop("disabled", true);
            }
            if (this.BillingList.length !== 0) {
                let total = parseInt(this.BillingList[0]["Total_Amount"]);
                let received = parseInt(this.BillingList[0]["Total_Received"]);
                //let paid = parseInt(this.BillingList[0]["Cash_Paid"]);

                this.$BlngTotal.val(total);
                this.$BlngRcvd.val(received);
                this.$BlngBal.val(total - received);
                this.$BlngTotal.prop("disabled", true);
                this.$BlngRcvd.prop("disabled", true);
                this.$BlngBal.prop("disabled", true);
            }
            else {
                this.$BlngTotal.off("keyup").on("keyup", function (evt) {
                    this.$BlngBal.val($(evt.target).val());
                }.bind(this));
            }
        }.bind(this));

        this.$MdlBilling.on('hidden.bs.modal', function (e) {
            this.$MdlBilling.attr("data-id", "");
        }.bind(this));
    };

    this.initSurgeryModal = function () {
        this.$btnNewSurgeryDtls.on("click", function () {
            //EbMessage("show", { Message: 'Sorry, This feature is not Activated.', AutoHide: true, Background: '#0000aa' });
            if (this.AccId === 0) {
                EbMessage("show", { Message: 'Save Customer Information then try to add Surgery Details', AutoHide: true, Background: '#aa0000' });
            }
            else {
                this.$MdlSurgery.modal('show');
            }
        }.bind(this));

        this.$SrgyDate.datetimepicker({ timepicker: false, format: "d-m-Y" });

        this.$SrgySave.on("click", function () {
            //EbMessage("show", { Message: 'Sorry, This feature is not Activated.', AutoHide: true, Background: '#0000aa' });
            var id = 0;
            this.$SrgySave.children().show();
            this.$SrgySave.prop("disabled", true);
            if (this.$MdlSurgery.attr("data-id") !== '')
                id = parseInt(this.$MdlSurgery.attr("data-id"));
            var SrgyObj = {
                Id: id,
                Date: this.$SrgyDate.val(),
                Branch: this.$SrgyBranch.val(),
                Extract_By: this.$SrgyExtrDnBy.val(),
                Implant_By: this.$SrgyImplantBy.val(),
                Consent_By: this.$SrgyConsentBy.val(),
                Anaesthesia_By: this.$SrgyAnasthBy.val(),
                Post_Brief_By: this.$SrgyPostBrfBy.val(),
                Nurse: this.$SrgyNurse.val(),
                Complimentary: this.$SrgyCmpltry.val(),
                Method: this.$SrgyMethod.val(),
                Comment: this.$SrgyComnt.val(),
                Account_Code: this.AccId
            };
            $.ajax({
                type: "POST",
                url: "../CustomPage/SaveSurgeryDtls",
                data: { SurgeryInfo: JSON.stringify(SrgyObj) },
                error: function (xhr, ajaxOptions, thrownError) {
                    this.$SrgySave.prop("disabled", false);
                    this.$SrgySave.children().hide();
                    EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                }.bind(this),
                success: function (result) {
                    this.$SrgySave.prop("disabled", false);
                    this.$SrgySave.children().hide();
                    if (result) {
                        EbMessage("show", { Message: 'Saved Successfully', AutoHide: true, Backgorund: '#0b851a' });
                        this.$MdlSurgery.modal('hide');
                        location.reload();////////
                    }
                    else {
                        EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Backgorund: '#a40000' });
                    }
                }.bind(this)
            });
        }.bind(this));

        $.each(this.SurgeryList, function (i, obj) {
            obj["Extract_By"] = this.getKeyByValue(this.DoctorInfo, obj["Extract_By"]);
            obj["Implant_By"] = this.getKeyByValue(this.DoctorInfo, obj["Implant_By"]);
            //obj["Consent_By"] = this.getKeyByValue(this.DoctorInfo, obj["Consent_By"]) || this.getKeyByValue(this.NurseInfo, obj["Consent_By"] - 1000);
            //obj["Anaesthesia_By"] = this.getKeyByValue(this.DoctorInfo, obj["Anaesthesia_By"]) || this.getKeyByValue(this.NurseInfo, obj["Anaesthesia_By"] - 1000);
            obj["Consent_By"] = this.getKeyByValue(this.DoctorInfo, obj["Consent_By"]) || this.getKeyByValue(this.NurseInfo, obj["Consent_By"]);
            obj["Anaesthesia_By"] = this.getKeyByValue(this.DoctorInfo, obj["Anaesthesia_By"]) || this.getKeyByValue(this.NurseInfo, obj["Anaesthesia_By"]);
            obj["Post_Brief_By"] = this.getKeyByValue(this.DoctorInfo, obj["Post_Brief_By"]) || this.getKeyByValue(this.NurseInfo, obj["Post_Brief_By"]);
            obj["Nurse"] = this.getKeyByValue(this.NurseInfo, obj["Nurse"]);
        }.bind(this));

        new ListViewCustom(this.divSrgy, this.SurgeryList, function (id, tempObj) {
            this.$MdlSurgery.attr("data-id", id);
            this.$SrgyDate.val(tempObj.Date);
            $('#selSrgyBranch option').filter(function () { return $(this).html() === tempObj.Branch; }).prop("selected", true);
            $('#selSrgyExtrDnBy option').filter(function () { return $(this).html() === tempObj.Extract_By; }).prop("selected", true);
            $('#selSrgyImplantBy option').filter(function () { return $(this).html() === tempObj.Implant_By; }).prop("selected", true);
            $('#selSrgyConsentBy option').filter(function () { return $(this).html() === tempObj.Consent_By; }).prop("selected", true);
            $('#selSrgyAnasthBy option').filter(function () { return $(this).html() === tempObj.Anaesthesia_By; }).prop("selected", true);
            $('#selSrgyPostBrfBy option').filter(function () { return $(this).html() === tempObj.Post_Brief_By; }).prop("selected", true);
            $('#selSrgyNurse option').filter(function () { return $(this).html() === tempObj.Nurse; }).prop("selected", true);
            this.$SrgyCmpltry.val(tempObj.Complimentary);
            this.$SrgyMethod.val(tempObj.Method);
            this.$SrgyComnt.val(tempObj.Comment);

            this.$MdlSurgery.modal('show');
        }.bind(this));

        this.$MdlSurgery.on('shown.bs.modal', function (e) {
            if (this.$MdlSurgery.attr("data-id") === "") {
                this.$SrgyDate.val(moment(new Date()).format("DD-MM-YYYY"));
                this.$SrgyBranch.val("1");
                this.$SrgyExtrDnBy.val("0");
                this.$SrgyImplantBy.val("0");
                this.$SrgyConsentBy.val("0");
                this.$SrgyAnasthBy.val("0");
                this.$SrgyPostBrfBy.val("0");
                this.$SrgyNurse.val("0");
                this.$SrgyCmpltry.val("No");
                this.$SrgyMethod.val("Pen");
                this.$SrgyComnt.val("");
                this.$SrgySave.children().hide();
                this.$SrgySave.prop("disabled", false);
            }
        }.bind(this));

        this.$MdlSurgery.on('hidden.bs.modal', function (e) {
            this.$MdlSurgery.attr("data-id", "");
        }.bind(this));
    };

    this.initGfcPrpModal = function () {
        this.$btnNewGfcPrpDtls.on("click", function () {
            if (this.AccId === 0) {
                EbMessage("show", { Message: 'Save Customer Information then try to add GFC/PRP Details', AutoHide: true, Background: '#aa0000' });
            }
            else {
                this.$MdlGfcPrp.modal('show');
            }
        }.bind(this));

        this.$GfcPrpDate.datetimepicker({ timepicker: false, format: "d-m-Y" });

        this.$GfcPrpSave.on("click", function () {
            var id = 0;
            this.$GfcPrpSave.children().show();
            this.$GfcPrpSave.prop("disabled", true);
            if (this.$MdlGfcPrp.attr("data-id") !== '')
                id = parseInt(this.$MdlGfcPrp.attr("data-id"));
            var GfcPrpObj = {
                Id: id,
                Date: this.$GfcPrpDate.val(),
                Branch: this.$GfcPrpBranch.val(),
                GfcOrPrp: this.$GfcOrPrp.val(),
                Done_By: this.$GfcPrpDnBy.val(),
                Service_Type: this.$GfcPrpCmpltry.val(),
                GfcPrpSession: this.$GfcPrpSession.val(),
                Comment: this.$GfcPrpComnt.val(),
                Account_Code: this.AccId
            };
            $.ajax({
                type: "POST",
                url: "../CustomPage/SaveGfcPrpDtls",
                data: { GfcPrpInfo: JSON.stringify(GfcPrpObj) },
                error: function (xhr, ajaxOptions, thrownError) {
                    this.$GfcPrpSave.prop("disabled", false);
                    this.$GfcPrpSave.children().hide();
                    EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                }.bind(this),
                success: function (result) {
                    this.$GfcPrpSave.prop("disabled", false);
                    this.$GfcPrpSave.children().hide();
                    if (result) {
                        EbMessage("show", { Message: 'Saved Successfully', AutoHide: true, Backgorund: '#0b851a' });
                        this.$MdlGfcPrp.modal('hide');
                        location.reload();////////
                    }
                    else {
                        EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Backgorund: '#a40000' });
                    }
                }.bind(this)
            });
        }.bind(this));
                
        $.each(this.GfcPrpList, function (i, obj) {
            obj["Done_By"] = this.getKeyByValue(this.DoctorInfo, obj["Done_By"]) || this.getKeyByValue(this.NurseInfo, obj["Done_By"]);
        }.bind(this));

        new ListViewCustom(this.divGfcPrp, this.GfcPrpList, function (id, tempObj) {
            this.$MdlGfcPrp.attr("data-id", id);
            this.$GfcPrpDate.val(tempObj.Date);
            $('#selGfcPrpBranch option').filter(function () { return $(this).html() === tempObj.Branch; }).prop("selected", true);
            $('#selGfcPrpDnBy option').filter(function () { return $(this).html() === tempObj.Done_By; }).prop("selected", true);
            this.$GfcOrPrp.val(tempObj.GfcOrPrp);
            this.$GfcPrpCmpltry.val(tempObj.Service_Type);
            this.$GfcPrpSession.val(tempObj.GfcPrpSession);
            this.$GfcPrpComnt.val(tempObj.Comment);

            this.$MdlGfcPrp.modal('show');
        }.bind(this));

        this.$MdlGfcPrp.on('shown.bs.modal', function (e) {
            if (this.$MdlGfcPrp.attr("data-id") === "") {
                this.$GfcPrpDate.val(moment(new Date()).format("DD-MM-YYYY"));
                this.$GfcPrpBranch.val("1");
                this.$GfcOrPrp.val("GFC");
                this.$GfcPrpCmpltry.val("Complimentary");
                this.$GfcPrpSession.val("1");
                this.$GfcPrpDnBy.val("0");
                this.$GfcPrpComnt.val("");
                this.$GfcPrpSave.children().hide();
                this.$GfcPrpSave.prop("disabled", false);
            }
        }.bind(this));

        this.$MdlGfcPrp.on('hidden.bs.modal', function (e) {
            this.$MdlGfcPrp.attr("data-id", "");
        }.bind(this));
        
    };

    this.fillCustomerData = function () {
        this.$CostCenter.val(this.CustomerInfo["eb_loc_id"]);
        this.$EnDate.val(this.CustomerInfo["trdate"]);
        this.$Mobile.val(this.CustomerInfo["genurl"]);
        this.$Name.val(this.CustomerInfo["name"]);
        this.$Dob.val(this.CustomerInfo["dob"]);
        this.$Dob.trigger("change");
        this.$Sex.val(this.CustomerInfo["sex"]);///////////
        this.$Phone.val(this.CustomerInfo["genphoffice"]);
        this.$WhatsApp.val(this.CustomerInfo["watsapp_phno"]);
        this.$Profession.val(this.CustomerInfo["profession"]);
        this.$Email.val(this.CustomerInfo["genemail"]);
        this.$Nri.val(this.CustomerInfo["customertype"]);
        this.$CrntCity.val(this.CustomerInfo["clcity"]);
        this.$CrntCountry.val(this.CustomerInfo["clcountry"]);
        this.$HomeCity.val(this.CustomerInfo["city"]);
        this.$HomeDistrict.val(this.CustomerInfo["district"]);///////
        this.$Service.val(this.CustomerInfo["typeofcustomer"].trim().toLowerCase());
        this.$LeadOwner.val(this.CustomerInfo["leadowner"]);/////////
        this.$SourceCategory.val(this.CustomerInfo["sourcecategory"]);
        this.$SubCategory.val(this.CustomerInfo["subcategory"]);
        this.$Consultation.val(this.CustomerInfo["consultation"]);
        this.$OnlineConsultation.val(this.CustomerInfo["online_consultation"]);
        this.$PicReceived.val(this.CustomerInfo["picsrcvd"]);
        this.$BaldnessGrade.val(this.CustomerInfo["baldnessgrade"]);
        this.$DiffusePattern.val(this.CustomerInfo["diffusepattern"]);
        this.$HfCurrently.val(this.CustomerInfo["hfcurrently"]);
        this.$HtPreviously.val(this.CustomerInfo["htpreviously"]);
        this.$CountryCode.val(this.CustomerInfo["country_code"]);
        this.$CustomerCategory.val(this.CustomerInfo["cust_category"]);
        this.$LastModifiedBy.val(this.CustomerInfo["eb_modifiedby"]);
        this.$GoogleReview.val(this.CustomerInfo["google_review"]);
        this.$Stars.val(this.CustomerInfo["stars"]);
        this.$CustomerLanguage.val(this.CustomerInfo["cust_language"]);
        this.$ProcedureDate.val(this.CustomerInfo["procedure_date"]);
        this.$Comments.val(this.CustomerInfo["comment"]);
        if (this.CustomerInfo["dprefid"] !== "0") {
            let id = this.CustomerInfo["dprefid"];
            $("#divCustomerDp").children().remove();
            $("#divCustomerDp").append(`
                    <div style="width:100%; height:100%; display:flex; align-items: center; justify-content: center;">
                        <img src="/images/small/${id}.jpg" data-id="${id}" class="img-responsive" style="max-height: 135px; max-width: 130px;" onerror="this.src = '/images/imagenotfound.svg';" />
                    </div>`);
        }

        if (this.CustomerInfo["patient_master_id"] != "0") {
            this.$btnNewPatient.data('patient_master_id', this.CustomerInfo["patient_master_id"]);
            this.$btnNewPatient.html(this.$btnNewPatient.html().replace('New Patient Record', 'View Patient Record'));
        }
        this.$btnNewPatient.closest('.col-md-1').show();

        if (this.CustomerInfo["ht_evaluation_id"] != "0") {
            this.$btnNewHtEvaluation.data('ht_evaluation_id', this.CustomerInfo["ht_evaluation_id"]);
            this.$btnNewHtEvaluation.html(this.$btnNewHtEvaluation.html().replace('New HT Evaluation Record', 'View HT Evaluation Record'));
        }
        this.$btnNewHtEvaluation.closest('.col-md-1').show();

        this.$ConsultedDate.val(this.CustomerInfo["consdate"]);
        this.$Doctor.val(this.CustomerInfo["consultingdoctor"]);
        this.$ProbableMonth.val(this.CustomerInfo["probmonth"]);/////////
        this.$TotalGrafts.val(this.CustomerInfo["noofgrafts"]);
        this.$TotalRate.val(this.CustomerInfo["totalrate"]);
        this.$NoOfPRP.val(this.CustomerInfo["prpsessions"]);
        this.$FeePaid.val(this.CustomerInfo["consultingfeepaid"]);
        this.$Closing.val(this.CustomerInfo["eb_closing"]);
        this.$Nature.val(this.CustomerInfo["nature"]);
    };

    this.onClickBtnSave = function () {
        if (this.validateAndPrepareData()) {
            $("#btnSave").prop("disabled", true);
            $("#eb_common_loader").EbLoader("show");
            $.ajax({
                type: "POST",
                url: "../CustomPage/SaveCustomer",
                data: { Mode: this.Mode, CustomerInfo: JSON.stringify(this.OutDataList), ImgRefId: JSON.stringify(uploadedFileRefList) },
                error: function (xhr, ajaxOptions, thrownError) {
                    EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                    $("#btnSave").prop("disabled", false);
                    $("#eb_common_loader").EbLoader("hide");
                },
                success: function (result) {
                    if (result) {
                        //uploadedImgRefList = [];//cleared Image ref id list
                        if (result.includes('This')) {
                            EbMessage("show", { Message: result, AutoHide: false, Background: '#aa0000' });
                        }
                        else {
                            EbMessage("show", { Message: 'Saved Successfully', AutoHide: true, Background: '#00aa00' });
                            if (this.Mode === 0)
                                window.location = window.origin + "/leadmanagement/" + result;
                            else
                                location.reload();
                        }
                    }
                    else {
                        EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#aa0000' });
                    }
                    $("#btnSave").prop("disabled", false);
                    $("#eb_common_loader").EbLoader("hide");
                }.bind(this)
            });
        }
    };

    this.validateAndPrepareData = function () {
        if (this.$Name.val() === "" || this.$Mobile.val() === "") {
            EbMessage("show", { Message: 'Name and Mobile are Required Fields', AutoHide: true, Background: '#aa0000' });
            return false;
        }
        if (!this.isMobileUnique) {
            EbMessage("show", { Message: 'Entered Mobile Number is Already Exists', AutoHide: true, Background: '#aa0000' });
            return false;
        }
        if (!this.isPhoneUnique && this.$Phone.val().trim() !== "") {
            EbMessage("show", { Message: 'Entered Phone Number is Already Exists', AutoHide: true, Background: '#aa0000' });
            return false;
        }
        if (!this.isWhatsAppUnique && this.$WhatsApp.val().trim() !== "") {
            EbMessage("show", { Message: 'Entered WhatsApp Number is Already Exists', AutoHide: true, Background: '#aa0000' });
            return false;
        }

        this.OutDataList = [];
        this.OutDataList.push({ Key: "accountid", Value: this.AccId });
        //Data to customer vendor
        this.pushToList("eb_loc_id", this.$CostCenter.val() || "0");
        this.pushToList("trdate", this.$EnDate.val());
        this.pushToList("genurl", this.$Mobile.val());
        this.pushToList("name", this.$Name.val());
        this.pushToList("dob", this.$Dob.val());
        this.pushToList("sex", this.$Sex.val());////////////
        this.pushToList("genphoffice", this.$Phone.val());
        this.pushToList("watsapp_phno", this.$WhatsApp.val());
        this.pushToList("profession", this.$Profession.val());
        this.pushToList("genemail", this.$Email.val());
        this.pushToList("customertype", this.$Nri.val());
        this.pushToList("clcity", this.$CrntCity.val());
        this.pushToList("clcountry", this.$CrntCountry.val());
        this.pushToList("city", this.$HomeCity.val());
        this.pushToList("district", this.$HomeDistrict.val());/////////////
        this.pushToList("typeofcustomer", $("#selService option:selected").text());
        this.pushToList("leadowner", this.$LeadOwner.val());////////////
        this.pushToList("sourcecategory", this.$SourceCategory.val());
        this.pushToList("subcategory", this.$SubCategory.val());
        this.pushToList("consultation", this.$Consultation.val());
        this.pushToList("online_consultation", this.$OnlineConsultation.val());
        this.pushToList("picsrcvd", this.$PicReceived.val());
        this.pushToList("baldnessgrade", this.$BaldnessGrade.val());
        this.pushToList("diffusepattern", this.$DiffusePattern.val());
        this.pushToList("hfcurrently", this.$HfCurrently.val());
        this.pushToList("htpreviously", this.$HtPreviously.val());
        this.pushToList("country_code", this.$CountryCode.val());
        this.pushToList("cust_category", this.$CustomerCategory.val());
        this.pushToList("google_review", this.$GoogleReview.val());
        this.pushToList("stars", this.$Stars.val());
        this.pushToList("cust_language", this.$CustomerLanguage.val());
        this.pushToList("procedure_date", this.$ProcedureDate.val());
        this.pushToList("comment", this.$Comments.val());
        this.pushToList("eb_modifiedat", this.CustomerInfo["eb_modifiedat"]);

        this.pushToList("consdate", this.$ConsultedDate.val());
        this.pushToList("consultingdoctor", this.$Doctor.val());
        this.pushToList("probmonth", this.$ProbableMonth.val());/////////
        this.pushToList("noofgrafts", this.$TotalGrafts.val());
        this.pushToList("totalrate", this.$TotalRate.val());
        this.pushToList("prpsessions", this.$NoOfPRP.val());
        this.pushToList("consultingfeepaid", this.$FeePaid.val());
        this.pushToList("eb_closing", this.$Closing.val());
        this.pushToList("nature", $("#selNature option:selected").text());

        //this.OutDataList.push({ Key: "imagerefids", Value: JSON.stringify(imgup.ImageRefIds) });  

        let dprefid = $("#divCustomerDp").find("img").attr('data-id');
        if (dprefid !== "0")
            this.pushToList("dprefid", dprefid);
        return true;
    };

    this.pushToList = function (_key, _val) {
        if (_val === null || _val === undefined)
            return;
        if (typeof _val === "string")
            _val = _val.trim();
        if (_val !== "")
            this.OutDataList.push({ Key: _key, Value: _val });
    };

    this.getKeyByValue = function (object, value) {
        return Object.keys(object).find(key => object[key] === value) || "";
    };

    this.init();
};



var ListViewCustom = function (parentDiv, itemList, editFunc) {
    this.ParentDivId = parentDiv;
    this.TableId = "tbl" + this.ParentDivId;
    this.itemList = itemList;
    this.editFunction = editFunc;//executed when edit/view btn clicked
    this.metadata = [];

    this.init = function () {
        if (this.ParentDivId === "divFdbk") {
            this.metadata = ["8", "Id", "Created_Date", "Date", "Status", "Fup_Date", "Is_Picked_Up", "Comments", "Created_By", "_feedback"];
        }
        else if (this.ParentDivId === "divBilling") {
            this.metadata = ["9", "Id", "Date", "Total_Amount", "Cash_Paid", "Total_Received", "Balance_Amount", "Payment_Mode", "Narration", "Created_By", "_billing"];
        }
        else if (this.ParentDivId === "divSrgy") {
            this.metadata = ["13", "Id", "Date", "Branch", "Extract_By", "Implant_By", "Consent_By", "Anaesthesia_By", "Post_Brief_By", "Nurse", "Complimentary", "Method", "Comment", "Created_By", "_surgery"];
        }
        else if (this.ParentDivId === "divGfcPrp") {
            this.metadata = ["9", "Id", "Date", "Branch", "GfcOrPrp", "Done_By", "Service_Type", "GfcPrpSession", "Comment", "Created_By", "_gfcprp"];
        }
        this.setTable();

        $("#" + this.ParentDivId).on("click", ".editclass" + this.ParentDivId, this.onClickEdit.bind(this));
    };

    this.setTable = function () {
        $("#" + this.ParentDivId).append(`<table id="${this.TableId}" class="table-striped" style="width: 100%;"></table>`);
        var tblcols = [];
        var tbldata = [];

        tblcols.push({ data: null, title: "Serial No", searchable: false, orderable: false, className: "text-center" });
        tblcols.push({ data: 1, title: this.metadata[1], visible: false });//for id
        for (var i = 2; i <= parseInt(this.metadata[0]); i++)
            tblcols.push({ data: i, title: this.metadata[i].replace("_", " ").replace("_", " "), orderable: true, className: "MyTempColStyle" });
        if (intSpecialPermission === "True" && (this.metadata.indexOf("_feedback") !== -1 || this.metadata.indexOf("_surgery") !== -1 || this.metadata.indexOf("_gfcprp") !== -1))
            tblcols.push({ data: null, title: "View/Edit", render: this.tblEditColumnRender, searchable: false, orderable: false, className: "text-center" });

        if (this.metadata.indexOf("_feedback") !== -1) {// to fill tbldata with appropriate data
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]], 4: this.itemList[i][this.metadata[4]], 5: this.itemList[i][this.metadata[5]], 6: this.itemList[i][this.metadata[6]], 7: this.itemList[i][this.metadata[7]], 8: this.itemList[i][this.metadata[8]] });
        }
        else if (this.metadata.indexOf("_billing") !== -1) {
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]], 4: this.itemList[i][this.metadata[4]], 5: this.itemList[i][this.metadata[5]], 6: this.itemList[i][this.metadata[6]], 7: this.itemList[i][this.metadata[7]], 8: this.itemList[i][this.metadata[8]], 9: this.itemList[i][this.metadata[9]] });
        }
        else if (this.metadata.indexOf("_surgery") !== -1) {
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]], 4: this.itemList[i][this.metadata[4]], 5: this.itemList[i][this.metadata[5]], 6: this.itemList[i][this.metadata[6]], 7: this.itemList[i][this.metadata[7]], 8: this.itemList[i][this.metadata[8]], 9: this.itemList[i][this.metadata[9]], 10: this.itemList[i][this.metadata[10]], 11: this.itemList[i][this.metadata[11]], 12: this.itemList[i][this.metadata[12]], 13: this.itemList[i][this.metadata[13]] });
        }
        else if (this.metadata.indexOf("_gfcprp") !== -1) {
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]], 4: this.itemList[i][this.metadata[4]], 5: this.itemList[i][this.metadata[5]], 6: this.itemList[i][this.metadata[6]], 7: this.itemList[i][this.metadata[7]], 8: this.itemList[i][this.metadata[8]], 9: this.itemList[i][this.metadata[9]] });
        }

        this.table = $("#" + this.TableId).DataTable({
            //scrollY: "96%",
            //scrollX: true,
            paging: false,
            autoWidth: false,
            //dom: 'frt',
            dom: 't',
            ordering: true,
            columns: tblcols,
            data: tbldata
        });
        this.table.on('order.dt search.dt', function () {
            this.table.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        }.bind(this)).draw();

    };

    this.tblEditColumnRender = function (data, type, row, meta) {
        var myObj = this.findObjectByKey(this.itemList, 'Id', data[1]);
        return `<i class="fa fa-pencil fa-2x editclass${this.ParentDivId}" aria-hidden="true" style="cursor:pointer;" data-id=${data[1]} data-json=${window.btoa(unescape(encodeURIComponent(JSON.stringify(myObj))))}></i>`;
    }.bind(this);

    this.findObjectByKey = function (array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return array[i];
            }
        }
        return null;
    };

    this.onClickEdit = function (e) {
        var id = $(e.target).attr("data-id");
        var tempObj = JSON.parse(decodeURIComponent(escape(window.atob($(e.target).attr("data-json")))));
        this.editFunction(id, tempObj);
    };

    this.init();
};