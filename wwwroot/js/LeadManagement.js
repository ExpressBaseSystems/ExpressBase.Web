var LeadManagementObj = function (AccId, MC_Mode, C_Info, Center_Info) {
    //INCOMMING DATA
    //ManageCustomer_Mode=0 -> new customer
    this.AccId = AccId;
    this.Mode = MC_Mode;
    this.CustomerInfo = C_Info;
    this.CostCenterInfo = Center_Info;
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
    this.$Service = $("#txtService");
    this.$LeadOwner = $("#txtLeadOwner");
    this.$SourceCategory = $("#txtSourceCategory");
    this.$SubCategory = $("#txtSubCategory");
    this.$Consultation = $("#selConsultation");
    this.$PicReceived = $("#selPicReceived");
    //FOLLOUP
    this.$MdlFeedBack = $("#mdlFeedBack");
    this.$FlUpDate = $("#txtFlUpDate");
    this.$FlUpStatus = $("#txtFlUpStatus");
    this.$FlUpFolDate = $("#txtFlUpFolDate");
    this.$FlUpComnt = $("#txaFlUpComnt");
    this.$FlUpSave = $("#btnFlUpSave");
    //DECLARED DATA
    this.OutDataList = [];

    this.init = function () {
        this.initMenuBarObj();
        this.initForm();
    }

    this.initMenuBarObj = function () {
        var menuBarObj = $("#layout_div").data("EbHeader");
        menuBarObj.setName("Lead Management");
        if (this.Mode === 0)
            menuBarObj.setName("Lead Management - New Customer");
        menuBarObj.insertButton(`
            <button id="btnSave" class='btn' title='Save'><i class="fa fa-floppy-o" aria-hidden="true"></i></button>
            <button id="btnNew" class='btn' title='New'><i class="fa fa-plus" aria-hidden="true"></i></button>`);

        $("#btnSave").on("click", this.onClickBtnSave.bind(this));
    }

    this.initForm = function () {
        this.$EnDate.datetimepicker({ timepicker: false, format: "d-m-Y" });
        this.$Dob.datetimepicker({ timepicker: false, format: "d-m-Y" });

        //FEEDBACK
        this.$FlUpDate.datetimepicker({ timepicker: false, format: "d-m-Y" });
        this.$FlUpFolDate.datetimepicker({ timepicker: false, format: "d-m-Y" });


        this.$CostCenter.children().remove();
        $.each(this.CostCenterInfo, function (key, val) {            
            this.$CostCenter.append(`<option value='${key}'">${val}</option>`);
        }.bind(this));

        if (this.Mode === 1) {            
            this.fillCustomerData();
        }
    }
    
    this.fillCustomerData = function () {
        this.$CostCenter.val(this.CustomerInfo["firmcode"]);
        this.$EnDate.val(this.CustomerInfo["trdate"]);
        this.$Mobile.val(this.CustomerInfo["genurl"]);
        //this.$Id.val(this.CustomerInfo[""]);
        this.$Name.val(this.CustomerInfo["name"]);
        this.$Dob.val(this.CustomerInfo["dob"]);
        this.$Age.val(this.CustomerInfo["age"]);
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
    }

    this.onClickBtnSave = function () {
        if (this.validateAndPrepareData()) {
            $.ajax({
                type: "POST",
                url: "../CustomPage/SaveCustomer",
                data: { Mode : this.Mode, CustomerInfo: JSON.stringify(this.OutDataList) },
                success: function (result) {
                    if (result) {
                        EbMessage("show", { Message: 'Saved Successfully', AutoHide: true, Backgorund: '#1ebf1e' });
                    }
                    else {
                        EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Backgorund: '#bf1e1e' });
                    }
                }
            });
        }
    }

    this.validateAndPrepareData = function () {
        this.OutDataList = [];
        //Data to customer vendor
        this.pushToList("firmcode", this.$CostCenter.val());
        this.pushToList("trdate", this.$EnDate.val());
        this.pushToList("genurl", this.$Mobile.val());
        //this.pushToList("", this.$Id.val());
        this.pushToList("name", this.$Name.val());
        this.pushToList("dob", this.$Dob.val());
        this.pushToList("age", this.$Age.val());
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

        return true;
    }

    this.pushToList = function (_key, _val) {
        _val = _val.trim();
        if (_val !== "")
            this.OutDataList.push({ Key: _key, Value: _val });
    }

    this.init();
}