var LeadManagementObj = function (AccId, MC_Mode, C_Info, Center_Info, Doc_Info, Staff_Info, F_List, B_List, S_List, CCityList, CCountryList, CityList, SourceCategoryList, SubCategoryList) {
    //INCOMMING DATA
    //ManageCustomer_Mode=0 -> new customer
    this.AccId = AccId;
    this.Mode = MC_Mode;
    this.CustomerInfo = C_Info;
    this.CostCenterInfo = Center_Info;
    this.DoctorInfo = Doc_Info;
    this.StaffInfo = Staff_Info;
    this.CCityList = CCityList || [];
    this.CCountryList = CCountryList || [];
    this.CityList = CityList || [];
    this.SourceCategoryList = SourceCategoryList || [];
    this.SubCategoryList = SubCategoryList || [];

    this.FeedbackList = F_List || [];
    this.BillingList = B_List || [];
    this.SurgeryList = S_List || [];
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
    this.$Profession = $("#txtProfession");
    this.$Email = $("#txtEmail");
    this.$Nri = $("#selNri");
    this.$CrntCity = $("#txtCrntCity");
    this.$CrntCountry = $("#txtCrntCountry");
    this.$HomeCity = $("#txtHomeCity");
    this.$HomeDistrict = $("#txtHomeDistrict");
    this.$Service = $("#selService");
    this.$LeadOwner = $("#txtLeadOwner");
    this.$SourceCategory = $("#txtSourceCategory");
    this.$SubCategory = $("#txtSubCategory");
    this.$Consultation = $("#selConsultation");
    this.$PicReceived = $("#selPicReceived");

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
    this.$FlUpStatus = $("#txtFlUpStatus");
    this.$FlUpFolDate = $("#txtFlUpFolDate");
    this.$FlUpComnt = $("#txaFlUpComnt");
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
    this.$BlngClrDate = $("#txtBlngClrDate");
    this.$BlngNarr = $("#txtBlngNarr");
    this.$BlngSave = $("#btnBlngSave");
    //SURGERY
    this.divSrgy = "divSrgy";
    this.$btnNewSurgeryDtls = $("#btnNewSurgeryDtls");
    this.$MdlSurgery = $("#mdlSurgery");
    this.$SrgyDate = $("#txtSrgyDate");
    this.$SrgyBranch = $("#selSrgyBranch");
    this.$SrgyZone = $("#txtSrgyZone");
    this.$SrgyGrafts = $("#txtSrgyGrafts");
    this.$SrgyDensity = $("#txtSrgyDensity");
    this.$PatientInstr = $("#txaPatientInstr");
    this.$DoctorInstr = $("#txaDoctorInstr");
    this.$SrgySave = $("#btnSrgySave");        
    
    //DECLARED DATA
    this.OutDataList = [];

    this.init = function () {
        this.initMenuBarObj();
        this.initForm();

        this.$CrntCity.autocomplete({ source: this.CCityList });
        this.$CrntCountry.autocomplete({ source: this.CCountryList });
        this.$HomeCity.autocomplete({ source: this.CityList });
        this.$SourceCategory.autocomplete({ source: this.SourceCategoryList });
        this.$SubCategory.autocomplete({ source: this.SubCategoryList });
    }

   
        

    this.initMenuBarObj = function () {
        var menuBarObj = $("#layout_div").data("EbHeader");
        menuBarObj.setName("Lead Management");
        if (this.Mode === 0)
            menuBarObj.setName("Lead Management - New Customer");
        menuBarObj.insertButton(`
            <button id="btnSave" class='btn' title='Save'><i class="fa fa-floppy-o" aria-hidden="true"></i></button>
            <button id="btnNew" class='btn' title='New'><i class="fa fa-user-plus" aria-hidden="true"></i></button>`);

        $("#btnSave").on("click", this.onClickBtnSave.bind(this));
        $("#btnNew").on("click", function () {
            if (confirm("Unsaved data will be lost!\n\nClick OK to Continue"))
                window.location.search = '';
        }.bind(this));
    }

    this.initForm = function () {

        //BASIC DETAILS
        this.$EnDate.datetimepicker({ timepicker: false, format: "d-m-Y" });
        this.$Dob.datetimepicker({ timepicker: false, format: "d-m-Y" });

        this.$Dob.on("change", function (evt) {
            this.$Age.val(parseInt(moment.duration(moment().diff(moment($(evt.target).val(), "DD-MM-YYYY"))).asYears()));
        }.bind(this));

        this.$Age.on("focusout", function (evt) {
            if (parseInt(moment.duration(moment().diff(moment(this.$Dob.val(), "DD-MM-YYYY"))).asYears()) !== parseInt(this.$Age.val()))
                this.$Dob.val("01-01-" + (moment().year() - parseInt(this.$Age.val())));
        }.bind(this));

        this.$ConsultedDate.datetimepicker({ timepicker: false, format: "d-m-Y" });
        this.$ProbableMonth.MonthPicker({ Button: this.$ProbableMonth.next().removeAttr("onclick") });
        
        //FEEDBACK  BILLING  SURGERY
        this.initFeedBackModal();
        this.initBillingModal();
        this.initSurgeryModal();

        this.$CostCenter.children().remove();
        $.each(this.CostCenterInfo, function (key, val) {            
            this.$CostCenter.append(`<option value='${key}'">${val}</option>`);
        }.bind(this));

        this.$Doctor.children().remove();
        $.each(this.DoctorInfo, function (key, val) {
            this.$Doctor.append(`<option value='${val}'">${key}</option>`);
        }.bind(this));

        this.$Closing.children().remove();
        $.each(this.StaffInfo, function (key, val) {
            this.$Closing.append(`<option value='${val}'">${key}</option>`);
        }.bind(this));

        if (this.Mode === 1) {
            this.fillCustomerData();
        }
        else if (this.Mode === 0) {
            this.$EnDate.val(moment(new Date()).format("DD-MM-YYYY"));
            this.$Closing.val("");
            this.$Doctor.val("");
        }
    }

    this.initFeedBackModal = function () {
        this.$btnNewFeedBack.on("click", function () {
            if (this.AccId === 0) {
                EbMessage("show", { Message: 'Save Customer Information then try to add Followup', AutoHide: true, Backgorund: '#a40000' });
            }
            else {
                this.$MdlFeedBack.modal('show');
            }
        }.bind(this));

        this.$FlUpDate.datetimepicker({ timepicker: false, format: "d-m-Y" });
        this.$FlUpFolDate.datetimepicker({ timepicker: false, format: "d-m-Y" });

        this.$FlUpSave.on("click", function () {    
            if (this.$FlUpDate.val() === "" || this.$FlUpStatus.val() === "" || this.$FlUpFolDate.val() === "" || this.$FlUpComnt.val() === "") {
                EbMessage("show", { Message: 'Validation Faild. Check all Fields.', AutoHide: true, Backgorund: '#a40000' });
                return;
            }

            var id = 0;
            this.$FlUpSave.children().show();
            this.$FlUpSave.prop("disabled", true);
            if (this.$MdlFeedBack.attr("data-id") !== '')
                id = parseInt(this.$MdlFeedBack.attr("data-id"));
            var fdbkObj = { Id: id, Date: this.$FlUpDate.val(), Status: this.$FlUpStatus.val(), Followup_Date: this.$FlUpFolDate.val(), Comments: this.$FlUpComnt.val(), Account_Code: this.AccId };
            $.ajax({
                type: "POST",
                url: "../CustomPage/SaveFollowup",
                data: { FollowupInfo: JSON.stringify(fdbkObj) },
                success: function (result) {
                    this.$FlUpSave.prop("disabled", false);
                    this.$FlUpSave.children().hide();
                    if (result) {
                        EbMessage("show", { Message: 'Saved Successfully', AutoHide: true, Backgorund: '#0b851a' });
                        this.$MdlFeedBack.modal('hide');
                        location.reload();
                    }
                    else {
                        EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Backgorund: '#a40000' });
                    }
                }.bind(this)
            });
        }.bind(this));

        new ListViewCustom(this.divFeedback, this.FeedbackList, function (id, data) {
            this.$MdlFeedBack.attr("data-id", id);
            var tempObj = JSON.parse(window.atob(data));
            this.$FlUpDate.val(tempObj.Date);
            this.$FlUpStatus.val(tempObj.Status);
            this.$FlUpFolDate.val(tempObj.Followup_Date);
            this.$FlUpComnt.val(tempObj.Comments);
            this.$FlUpDate.prop("disabled", true);
            this.$MdlFeedBack.modal('show');
        }.bind(this));

        this.$MdlFeedBack.on('shown.bs.modal', function (e) {
            if (this.$MdlFeedBack.attr("data-id") === "") {
                this.$FlUpDate.val(moment(new Date()).format("DD-MM-YYYY"));
                this.$FlUpStatus.val("");
                this.$FlUpFolDate.val(moment(new Date()).format("DD-MM-YYYY"));
                this.$FlUpComnt.val("");
                this.$FlUpSave.children().hide();
                this.$FlUpSave.prop("disabled", false);
                this.$FlUpDate.prop("disabled", false);
            }
        }.bind(this));

        this.$MdlFeedBack.on('hidden.bs.modal', function (e) {
            this.$MdlFeedBack.attr("data-id", "");
        }.bind(this));
    }

    this.initBillingModal = function () {
        this.$btnNewBilling.on("click", function () {
            if (this.AccId === 0) {
                EbMessage("show", { Message: 'Save Customer Information then try to add Billing Details', AutoHide: true, Backgorund: '#a40000' });
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
        }.bind(this));

        this.$BlngSave.on("click", function () {
            if (this.$BlngDate.val() === "" || this.$BlngTotal.val() === "" || this.$BlngRcvd.val() === "" || this.$BlngBal.val() === "" || this.$BlngPaid.val() === "" || this.$BlngMode.val() === "" || this.$BlngClrDate.val() === "" || this.$BlngNarr.val() === "") {
                EbMessage("show", { Message: 'Validation Faild. Check all Fields.', AutoHide: true, Backgorund: '#a40000' });
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
                Amount_Received: this.$BlngRcvd.val(),
                Balance_Amount: this.$BlngBal.val(),
                Cash_Paid: this.$BlngPaid.val(),
                Payment_Mode: this.$BlngMode.val(),
                Bank: this.$BlngBank.val(),
                Clearence_Date: this.$BlngClrDate.val(),
                Narration: this.$BlngNarr.val(),
                Account_Code: this.AccId
            };
            $.ajax({
                type: "POST",
                url: "../CustomPage/SaveBilling",
                data: { BillingInfo: JSON.stringify(billingObj) },
                success: function (result) {
                    this.$BlngSave.prop("disabled", true);
                    this.$BlngSave.children().hide();
                    if (result) {
                        EbMessage("show", { Message: 'Saved Successfully', AutoHide: true, Backgorund: '#0b851a' });
                        this.$BlngSave.prop("disabled", false);
                        this.$MdlFeedBack.modal('hide');
                        location.reload();////////
                    }
                    else {
                        EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Backgorund: '#a40000' });
                    }
                }.bind(this)
            });
        }.bind(this));

        new ListViewCustom(this.divBilling, this.BillingList, function (id, data) {
            this.$MdlBilling.attr("data-id", id);
            var tempObj = JSON.parse(window.atob(data));
            this.$BlngDate.val(tempObj.Date);
            this.$BlngTotal.val(tempObj.Total_Amount);
            this.$BlngRcvd.val(tempObj.Amount_Received);
            this.$BlngBal.val(tempObj.Balance_Amount);
            this.$BlngPaid.val(tempObj.Cash_Paid);
            this.$BlngMode.val(tempObj.Payment_Mode);
            this.$BlngBank.val(tempObj.Bank);
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
                let received = parseInt(this.BillingList[0]["Amount_Received"]);
                let paid = parseInt(this.BillingList[0]["Cash_Paid"]);

                this.$BlngTotal.val(total);
                this.$BlngRcvd.val(received + paid);
                this.$BlngBal.val(total - (received + paid));
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
    }

    this.initSurgeryModal = function () {
        this.$btnNewSurgeryDtls.on("click", function () {
            if (this.AccId === 0) {
                EbMessage("show", { Message: 'Save Customer Information then try to add Surgery Details', AutoHide: true, Backgorund: '#a40000' });
            }
            else {
                this.$MdlSurgery.modal('show');
            }
        }.bind(this));

        this.$SrgyDate.datetimepicker({ timepicker: false, format: "d-m-Y" });

        this.$SrgySave.on("click", function () {
            EbMessage("show", { Message: 'Sorry, This feature is not Activated.', AutoHide: true, Backgorund: '#0b851a' });
            //var id = 0;
            //this.$SrgySave.children().show();
            //this.$SrgySave.prop("disabled", true);
            //if (this.$MdlSurgery.attr("data-id") !== '')
            //    id = parseInt(this.$MdlSurgery.attr("data-id"));
            //var SrgyObj = { Id: id, Date: this.$SrgyDate.val(), Branch: this.$SrgyBranch.val(), Account_Code: this.AccId };
            //$.ajax({
            //    type: "POST",
            //    url: "../CustomPage/SaveSurgeryDtls",
            //    data: { SurgeryInfo: JSON.stringify(SrgyObj) },
            //    success: function (result) {
            //        this.$SrgySave.prop("disabled", false);
            //        this.$SrgySave.children().hide();
            //        if (result) {
            //            EbMessage("show", { Message: 'Saved Successfully', AutoHide: true, Backgorund: '#0b851a' });
            //            this.$MdlSurgery.modal('hide');
            //        }
            //        else {
            //            EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Backgorund: '#a40000' });
            //        }
            //    }.bind(this)
            //});
        }.bind(this));

        new ListViewCustom(this.divSrgy, this.SurgeryList, function (id, data) {
            this.$MdlSurgery.attr("data-id", id);
            var tempObj = JSON.parse(window.atob(data));
            this.$SrgyDate.val(tempObj.Date);
            this.$SrgyBranch.val(tempObj.Branch);
            this.$MdlSurgery.modal('show');
        }.bind(this));

        this.$MdlSurgery.on('shown.bs.modal', function (e) {
            if (this.$MdlSurgery.attr("data-id") === "") {
                this.$SrgyDate.val(moment(new Date()).format("DD-MM-YYYY"));
                //this.$SrgyBranch.val("");
                this.$SrgySave.children().hide();
                this.$SrgySave.prop("disabled", false);
            }
        }.bind(this));

        this.$MdlSurgery.on('hidden.bs.modal', function (e) {
            this.$MdlSurgery.attr("data-id", "");
        }.bind(this));
    }

    this.fillCustomerData = function () {
        this.$CostCenter.val(this.CustomerInfo["firmcode"]);
        this.$EnDate.val(this.CustomerInfo["trdate"]);
        this.$Mobile.val(this.CustomerInfo["genurl"]);
        //this.$Id.val(this.CustomerInfo[""]);
        this.$Name.val(this.CustomerInfo["name"]);
        this.$Dob.val(this.CustomerInfo["dob"]);
        this.$Dob.trigger("change");
        //this.$Age.val(this.CustomerInfo["age"]);
        //this.$Sex.val(this.CustomerInfo[""]);
        this.$Phone.val(this.CustomerInfo["genphoffice"]);
        this.$Profession.val(this.CustomerInfo["profession"]);
        this.$Email.val(this.CustomerInfo["genemail"]);
        this.$Nri.val(this.CustomerInfo["customertype"]);
        this.$CrntCity.val(this.CustomerInfo["clcity"]);
        this.$CrntCountry.val(this.CustomerInfo["clcountry"]);
        this.$HomeCity.val(this.CustomerInfo["city"]);
        //this.$HomeDistrict.val(this.CustomerInfo[""]);
        this.$Service.val(this.CustomerInfo["typeofcustomer"]);
        //this.$LeadOwner.val(this.CustomerInfo[""]);
        this.$SourceCategory.val(this.CustomerInfo["sourcecategory"]);
        this.$SubCategory.val(this.CustomerInfo["subcategory"]);
        this.$Consultation.val(this.CustomerInfo["consultation"]);
        this.$PicReceived.val(this.CustomerInfo["picsrcvd"]);

        this.$ConsultedDate.val(this.CustomerInfo["consdate"]);
        this.$Doctor.val(this.CustomerInfo["consultingdoctor"]);
        //this.$ProbableMonth.val(this.CustomerInfo[""]);
        this.$TotalGrafts.val(this.CustomerInfo["noofgrafts"]);
        this.$TotalRate.val(this.CustomerInfo["totalrate"]);
        this.$NoOfPRP.val(this.CustomerInfo["prpsessions"]);
        this.$FeePaid.val(this.CustomerInfo["consultingfeepaid"]);
        this.$Closing.val(this.CustomerInfo["closing"]);
        this.$Nature.val(this.CustomerInfo["nature"]);

        this.$CostCenter.prop("disabled", true);
        this.$EnDate.prop("disabled", true);
        this.$Mobile.prop("disabled", true);

    }

    this.onClickBtnSave = function () {
        if (this.validateAndPrepareData()) {
            $("#btnSave").prop("disabled", true);
            $.ajax({
                type: "POST",
                url: "../CustomPage/SaveCustomer",
                data: { Mode: this.Mode, CustomerInfo: JSON.stringify(this.OutDataList) },
                success: function (result) {
                    if (result) {
                        EbMessage("show", { Message: 'Saved Successfully', AutoHide: true, Backgorund: '#1ebf1e' });
                        if (this.Mode === 0)
                            window.location.search = 'ac=' + result;
                    }
                    else {
                        EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Backgorund: '#bf1e1e' });
                    }
                }.bind(this)
            });
        }
        else {
            EbMessage("show", { Message: 'Validation Faild. Check all Fields.', AutoHide: true, Backgorund: '#a40000' });
        }
    }

    this.validateAndPrepareData = function () {
        if (this.$Name.val() === "" || this.$Mobile.val() === "")
            return false;

        this.OutDataList = [];
        this.OutDataList.push({ Key: "accountid", Value: this.AccId });
        //Data to customer vendor
        this.pushToList("firmcode", (this.$CostCenter.val() || "0"));
        this.pushToList("trdate", this.$EnDate.val());
        this.pushToList("genurl", this.$Mobile.val());
        //this.pushToList("", this.$Id.val());
        this.pushToList("name", this.$Name.val());
        this.pushToList("dob", this.$Dob.val());
        //this.pushToList("age", this.$Age.val());
        //this.pushToList("", this.$Sex.val());
        this.pushToList("genphoffice", this.$Phone.val());
        this.pushToList("profession", this.$Profession.val());
        this.pushToList("genemail", this.$Email.val());
        this.pushToList("customertype", this.$Nri.val());
        this.pushToList("clcity", this.$CrntCity.val());
        this.pushToList("clcountry", this.$CrntCountry.val());
        this.pushToList("city", this.$HomeCity.val());
        //this.pushToList("", this.$HomeDistrict.val());
        this.pushToList("typeofcustomer", this.$Service.val());
        //this.pushToList("", this.$LeadOwner.val());
        this.pushToList("sourcecategory", this.$SourceCategory.val());
        this.pushToList("subcategory", this.$SubCategory.val());
        this.pushToList("consultation", this.$Consultation.val());
        this.pushToList("picsrcvd", this.$PicReceived.val());

        this.pushToList("consdate", this.$ConsultedDate.val());
        this.pushToList("consultingdoctor", (this.$Doctor.val() || "0"));
        //this.pushToList("", this.$ProbableMonth.val());
        this.pushToList("noofgrafts", this.$TotalGrafts.val());
        this.pushToList("totalrate", this.$TotalRate.val());
        this.pushToList("prpsessions", this.$NoOfPRP.val());
        this.pushToList("consultingfeepaid", (this.$FeePaid.val() || "False"));
        this.pushToList("closing", (this.$Closing.val() || "0"));
        this.pushToList("nature", this.$Nature.val());
        
        return true;
    }

    this.pushToList = function (_key, _val) {
        _val = _val.trim();
        if (_val !== "")
            this.OutDataList.push({ Key: _key, Value: _val });
    }

    
    this.init();
}



var ListViewCustom = function (parentDiv, itemList, editFunc) {
    this.ParentDivId = parentDiv;
    this.TableId = "tbl" + this.ParentDivId;
    this.itemList = itemList;
    this.editFunction = editFunc;//executed when edit/view btn clicked
    this.metadata = [];

    this.init = function () {
        if (this.ParentDivId === "divFdbk") {
            this.metadata = ["6", "Id", "Date", "Status", "Followup_Date", "Comments", "Created_By", "_feedback"];
        }
        else if (this.ParentDivId === "divBilling") {
            this.metadata = ["9", "Id", "Date", "Total_Amount", "Amount_Received", "Balance_Amount", "Cash_Paid", "Payment_Mode", "Narration", "Created_By", "_billing"];
        }
        else if (this.ParentDivId === "divSrgy") {
            this.metadata = ["5", "Id", "Date", "Branch", "Created_By", "Created_Date", "_surgery"];
        }
        this.setTable();

        $("#"+this.ParentDivId).on("click", ".editclass" + this.ParentDivId, this.onClickEdit.bind(this));
    }

    this.setTable = function () {
        $("#" + this.ParentDivId).append(`<table id="${this.TableId}" class="table-striped" style="width: 100%;"></table>`);
        var tblcols = [];
        var tbldata = [];

        tblcols.push({ data: null, title: "Serial No", searchable: false, orderable: false, className: "text-center" });
        tblcols.push({ data: 1, title: this.metadata[1], visible: false });//for id
        for (var i = 2; i <= parseInt(this.metadata[0]); i++)
            tblcols.push({ data: i, title: this.metadata[i].replace("_", " "), orderable: true, className: "MyTempColStyle"});
        //tblcols.push({ data: null, title: "View/Edit", render: this.tblEditColumnRender, searchable: false, orderable: false, className: "text-center"});

        if (this.metadata.indexOf("_feedback") !== -1) {// to fill tbldata with appropriate data
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]], 4: this.itemList[i][this.metadata[4]], 5: this.itemList[i][this.metadata[5]], 6: this.itemList[i][this.metadata[6]] });
        }
        else if (this.metadata.indexOf("_billing") !== -1) {
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]], 4: this.itemList[i][this.metadata[4]], 5: this.itemList[i][this.metadata[5]], 6: this.itemList[i][this.metadata[6]], 7: this.itemList[i][this.metadata[7]], 8: this.itemList[i][this.metadata[8]], 9: this.itemList[i][this.metadata[9]] });
        }
        else if (this.metadata.indexOf("_surgery") !== -1) {
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]], 4: this.itemList[i][this.metadata[4]], 5: this.itemList[i][this.metadata[5]]});
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
        
    }

    this.tblEditColumnRender = function (data, type, row, meta) {
        var myObj = this.findObjectByKey(this.itemList, 'Id', data[1]);
        return `<i class="fa fa-pencil fa-2x editclass${this.ParentDivId}" aria-hidden="true" style="cursor:pointer;" data-id=${data[1]} data-json=${window.btoa(JSON.stringify(myObj))}></i>`;
    }.bind(this)

    this.findObjectByKey = function(array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return array[i];
            }
        }
        return null;
    }

    this.onClickEdit = function (e) {
        var id = $(e.target).attr("data-id");
        var data = $(e.target).attr("data-json");
        this.editFunction(id, data);
    }


    this.init();
}