var LeadManagementObj = function (AccId, MC_Mode, C_Info, Center_Info, F_List) {
    //INCOMMING DATA
    //ManageCustomer_Mode=0 -> new customer
    this.AccId = AccId;
    this.Mode = MC_Mode;
    this.CustomerInfo = C_Info;
    this.CostCenterInfo = Center_Info;
    this.FeedbackList = F_List || [];
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
    //FOLLOWUP
    this.divFeedback = "divFdbk";
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
        this.initFeedBackModal();

        this.$CostCenter.children().remove();
        $.each(this.CostCenterInfo, function (key, val) {            
            this.$CostCenter.append(`<option value='${key}'">${val}</option>`);
        }.bind(this));

        if (this.Mode === 1) {            
            this.fillCustomerData();
        }
    }

    this.initFeedBackModal = function () {
        this.$FlUpDate.datetimepicker({ timepicker: false, format: "d-m-Y" });
        this.$FlUpFolDate.datetimepicker({ timepicker: false, format: "d-m-Y" });

        this.$FlUpSave.on("click", function () {            
            var id = 0;
            this.$FlUpSave.children().show();
            if (this.$MdlFeedBack.attr("data-id") !== '')
                id = parseInt(this.$MdlFeedBack.attr("data-id"));
            var fdbkObj = { Id: id, Date: this.$FlUpDate.val(), Status: this.$FlUpStatus.val(), Followup_Date: this.$FlUpFolDate.val(), Comments: this.$FlUpComnt.val(), Account_Code: this.AccId };
            $.ajax({
                type: "POST",
                url: "../CustomPage/SaveFollowup",
                data: { FollowupInfo: JSON.stringify(fdbkObj) },
                success: function (result) {
                    this.$FlUpSave.children().hide();
                    if (result) {
                        EbMessage("show", { Message: 'Saved Successfully', AutoHide: true, Backgorund: '#1ebf1e' });
                        this.$MdlFeedBack.modal('hide');
                    }
                    else {
                        EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Backgorund: '#bf1e1e' });
                    }
                }.bind(this)
            });
        }.bind(this));

        new ListViewCustom(this.divFeedback, this.FeedbackList, function (id, data) {
            this.$MdlFeedBack.attr("data-id", id);
            var tempObj = JSON.parse(window.atob(data));
            this.$FlUpDate.val(tempObj[2]);
            this.$FlUpStatus.val(tempObj[3]);
            this.$FlUpFolDate.val(tempObj[4]);
            this.$FlUpComnt.val(tempObj[5]);
            this.$MdlFeedBack.modal('show');
        }.bind(this));

        this.$MdlFeedBack.on('shown.bs.modal', function (e) {
            if (this.$MdlFeedBack.attr("data-id") === "") {
                this.$FlUpDate.val("");
                this.$FlUpStatus.val("");
                this.$FlUpFolDate.val("");
                this.$FlUpComnt.val("");
            }
        }.bind(this));

        this.$MdlFeedBack.on('hidden.bs.modal', function (e) {
            this.$MdlFeedBack.attr("data-id", "");
        }.bind(this));
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



var ListViewCustom = function (parentDiv, itemList, editFunc) {
    this.ParentDivId = parentDiv;
    this.TableId = "tbl" + this.ParentDivId;
    this.itemList = itemList;
    this.editFunction = editFunc;
    this.metadata = [];

    this.init = function () {
        if (this.ParentDivId === "divFdbk") {
            this.metadata = ["5", "Id", "Date", "Status", "Followup_Date", "Comments", "_feedback"];
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
        tblcols.push({ data: null, title: "View/Edit", render: this.tblEditColumnRender, searchable: false, orderable: false, className: "text-center"});

        if (this.metadata.indexOf("_feedback") !== -1) {// to fill tbldata with appropriate data
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]], 4: this.itemList[i][this.metadata[4]], 5: this.itemList[i][this.metadata[5]] });
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
        return `<i class="fa fa-pencil fa-2x editclass${this.ParentDivId}" aria-hidden="true" style="cursor:pointer;" data-id=${data[1]} data-json=${window.btoa(JSON.stringify(data))}></i>`;
    }.bind(this)

    this.onClickEdit = function (e) {
        var id = $(e.target).attr("data-id");
        var data = $(e.target).attr("data-json");
        this.editFunction(id, data);
    }


    this.init();
}