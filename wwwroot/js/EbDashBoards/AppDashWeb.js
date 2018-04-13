var AppDashWeb = function (obtypes,objcoll) {
    this.ObjTypes = obtypes;
    this.ObjCollection = objcoll;
    this.objectTab = $("#Objects");
    this.objTypesImages = getEbObjectTypes();

    this.apndObTypeClpsCont = function () {
        for (var otype in this.ObjTypes) {
            this.objectTab.append(`<div class="connectons-container col-md-6" style="width:33.3%;">
                        <div class="s-dash-headComm form-inline app-dash-clps-head" obj_container="obtype_container${otype}" 
                            data-toggle="collapse" data-target="#obtype_container${otype}" style="cursor:pointer;">
                            <img src="/images/svg/${this.objTypesImages[otype].ImgSrc}" class="obtype_img">
                            ${otype} <div class="ob_count" id="ob_count${otype}"></div>
                            <button class="btn btn-sm table-btn pull-right newob_create"><i class="fa fa-plus"></i></button>
                            <button class="btn btn-sm table-btn pull-right ob_search"><i class="fa fa-search"></i></i></button>   
                            <input type="text" search_body="obtype_container${otype}" class="form-control obj_search_input pull-right" placeholder="Search" style="display:none;">
                        </div>
                        <div class="s-dash-bodyComm appdash-extra-style collapse" id="obtype_container${otype}">
                        <div class="not-found" style="display:none;"></div>
                        </div>
                    </div>`);            
            this.appendObjectList($("#obtype_container" + otype), this.ObjTypes[otype], otype);
        }
        $(".s-dash-headComm").on("click", this.actionCollapse.bind(this));
    };

    this.appendObjectList = function ($listContaner, otypeInt,otypeText) {
        if (!$.isEmptyObject(this.ObjCollection[otypeInt])){
            for (var i = 0; i < this.ObjCollection[otypeInt].Objects.length; i++) {
                $listContaner.append(`<div class="col-md-6 col-lg-6 col-sm-6 col-xs-12 pd-b-15">
                                <div class="appdash-obj-container pd-0">                                   
                                    <div class="col-md-10"><div class="obj_name">${this.ObjCollection[otypeInt].Objects[i].ObjName}</div>
                                        <div class="obj-desc">${this.ObjCollection[otypeInt].Objects[i].Description}</div></div>
                                    <div class="col-md-2 center_align_flex"><i obj-id="${this.ObjCollection[otypeInt].Objects[i].Id}" class="fa fa-edit"></i></div>
                                </div>
                            </div>`);
            }
            $("#ob_count" + otypeText).text("(" + this.getObjCount($("#obtype_container" + otypeText)) + ")");
        }    
    };

    this.getObjCount = function (objCont) {
        var count = objCont.children().length;
        return count;
    };

    this.actionCollapse = function (e) {
        var $div = $(e.target).closest(".s-dash-headComm");
        if ($div.attr("aria-expanded") !== "true") {
            $div.parent().animate({ width: '100%' });
            $div.addClass("change_bg_onchange").children(".obj_search_input").show();
            $div.children(".ob_search").hide();
            if (this.getObjCount($("#" + $div.attr("obj_container"))) <= 1)
                $("#" + $div.attr("obj_container")).children(".not-found").show().text("empty.");
            else
                $("#" + $div.attr("obj_container")).children(".not-found").hide().text(" ");
        }
        else {
            $div.parent().animate({ width: '33.3%' });
            $div.removeClass("change_bg_onchange");
            $div.children(".obj_search_input").hide();
            $div.children(".ob_search").show();
        }
    };

    this.createNewObject = function (e) {
        e.stopPropagation();
    };

    this.searchObjectClick = function (e) {
        e.stopPropagation();
        $(e.target).parent().click();
        if ($(e.target).parent().attr("aria-expanded") === "true") {
            $(e.target).siblings(".obj_search_input").show();
            $(e.target).hide();
        }
        else {
            $(e.target).siblings(".obj_search_input").hide();           
        }
    }

    this.searchObjects = function (e) {
        var srchBody = $(e.target).attr("search_body");
        var srch = $(e.target).val().toLowerCase();
        var count = 0;
        $.each($("#"+srchBody).children(), function (i, obj) {
            var cmpstr = $(obj).children().find(".obj_name").text().toLowerCase();
            if (cmpstr.indexOf(srch) !== -1) {
                $(obj).show();
                count++;
            }
            else
                $(obj).hide();
        });
        if (count === 0)
            $("#" + srchBody + " .not-found").show().text("Item not found....");
        else
            $("#" + srchBody + " .not-found").hide().text("");
    };

    this.start_exe = function () {
        this.apndObTypeClpsCont();
        $(".newob_create").on("click", this.createNewObject.bind(this));
        $(".ob_search").on("click", this.searchObjectClick.bind(this));
        $(".obj_search_input").on("click", function (e) { e.stopPropagation(); });
        $(".obj_search_input").off("keyup").on("keyup", this.searchObjects.bind(this));
    }

    this.start_exe();
}