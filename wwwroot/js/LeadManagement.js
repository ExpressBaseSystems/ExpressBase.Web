var LeadManagementObj = function () {


    this.init = function () {
        this.initMenuBarObj();
    }

    this.initMenuBarObj = function () {
        var menuBarObj = $("#layout_div").data("EbHeader");
        menuBarObj.setName("Lead Management");
        menuBarObj.insertButton(`
            <button id="btnSave" class='btn' title='Save'><i class="fa fa-floppy-o" aria-hidden="true"></i></button>
            <button id="btnNew" class='btn' title='New'><i class="fa fa-plus" aria-hidden="true"></i></button>`);
    }
    this.init();
}