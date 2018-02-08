var AppDashWeb = function (obtypes,objcoll) {
    this.ObjTypes = obtypes;
    this.ObjCollection = objcoll;
    this.objectTab = $("#Objects");
    this.objTypesImages = getEbObjectTypes();

    this.apndObTypeClpsCont = function () {
        for (var otype in this.ObjTypes) {
            this.objectTab.append(`<div class="connectons-container col-md-6" style="width:50%;">
                        <div class="s-dash-headComm form-inline app-dash-clps-head" data-toggle="collapse" data-target="#obtype_container${otype}" style="cursor:pointer;">
                            <img src="/images/svg/${this.objTypesImages[otype].ImgSrc}" class="obtype_img">
                            ${otype} <div class="ob_count" id="ob_count${otype}"></div>
                            <button class="btn btn-sm table-btn pull-right newob_create"><i class="fa fa-plus"></i></button>
                            <button class="btn btn-sm table-btn pull-right ob_search"><i class="fa fa-search"></i></i></button>   
                            <input type="text" class="form-control obj_search_input pull-right" placeholder="Search" style="display:none;">
                        </div>
                        <div class="s-dash-bodyComm appdash-extra-style collapse" id="obtype_container${otype}">
                            <div class="col-md-4 col-lg-4 col-sm-4 col-xs-12 pd-b-15">
                                <div class="appdash-obj-container pd-0">
                                    <div class="col-md-2"><img src="~/images/svg/chat1.svg" /></div>
                                    <div class="col-md-8">Bot Forms</div>
                                    <div class="col-md-2"><i class="fa fa-plus"></i></div>
                                </div>
                            </div>                            
                        </div>
                    </div>`);
            $("#ob_count" + otype).text("(" + this.getObjCount($("#obtype_container" + otype)) + ")");
        }
        $(".s-dash-headComm").on("click", this.actionCollapse.bind(this));
    };

    this.getObjCount = function (objCont) {
        var count = objCont.children().length;
        return count;
    };

    this.actionCollapse = function (e) {
        if ($(e.target).attr("aria-expanded") !== "true") {
            $(e.target).parent().animate({ width: '100%' });
            $(e.target).children(".obj_search_input").show();
            $(e.target).children(".ob_search").hide();
        }
        else {
            $(e.target).parent().animate({ width: '50%' });
            $(e.target).children(".obj_search_input").hide();
            $(e.target).children(".ob_search").show();
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

    this.start_exe = function () {
        this.apndObTypeClpsCont();
        $(".newob_create").on("click", this.createNewObject.bind(this));
        $(".ob_search").on("click", this.searchObjectClick.bind(this));
        $(".obj_search_input").on("click", function (e) { e.stopPropagation(); });
    }

    this.start_exe();
}