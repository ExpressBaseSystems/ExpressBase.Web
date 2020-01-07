let EbUserCtrlHelper = function (options) {
    this.options = options;
    this.UcObject = null;

    this.init = function () {

        this.getUserControl();



    }
    this.getUserControl = function () {
        $.ajax({
            url: '../DashBoard/UserControlGetObj',
            type: 'POST',
            data: { refid: this.options.refId, param : this.options.params },
            success: this.getUserControlSuccess.bind(this)
        });
    }

    this.getUserControlSuccess = function (resp) {
        let respObj = JSON.parse(resp);

        $(this.options.parentDiv).append(respObj.UcHtml);

        if (respObj.UcHtml.includes("table")) {
            $(this.options.parentDiv).addClass("user-ctrl-row");
        }
        else {
            $(this.options.parentDiv).addClass("user-ctrl-col");
            
            let height = 90 / $(`.user-ctrl-col [ctype="DataLabel"]`).length
            $(`.user-ctrl-col [ctype="DataLabel"]`).css("height", height +"%");
        }
        $(`[ctype="DataObject"]`).remove();

        this.UcObject = JSON.parse(respObj.UcObjJson);

        JsonToEbControls(this.UcObject);

        this.flatControls = getFlatCtrlObjs(this.UcObject);
        //this.visibleExprFns = {};
        let ucObj = this.setUCObject();

        $.each(this.flatControls, function (i, ctrl) {
            if (ctrl.ObjType === 'DataLabel') {
                if (ctrl.VisibleExpr && ctrl.VisibleExpr.Code) {
                    //let _this = $("#cont_" + ctrl.EbSid);
                    $.extend(ctrl, this.getLabelControlOps.bind(ctrl)());
                    try {
                        //new Function(atob(ctrl.VisibleExpr.Code)).bind(_this)();
                        var abc = new Function("uc", "user", `event`, atob(ctrl.VisibleExpr.Code)).bind(ctrl, ucObj, ebcontext.user)();
                    }
                    catch (e) {
                        console.log('Exception in VisibleExpr. ' + e);
                    }
                }
            }
        }.bind(this));

    };

    this.setUCObject = function () {
        let ucObj = {};
        $.each(this.flatControls, function (i, ctrl) {
            ucObj[ctrl.Name] = ctrl;
        }.bind(this));
        return ucObj;
    };



    this.getLabelControlOps = function () {
        let funs = {};
        funs.setValueColor = function (p1) {
            $("#cont_" + this.EbSid).find('.data-dynamic-label').css('color', p1);
        }.bind(this);
        funs.setBgColor = function (p1) {
            $("#cont_" + this.EbSid).find(".ctrl-cover").css('background-color', p1);
        }.bind(this);
        funs.setTitleColor = function (p1) {
            $("#cont_" + this.EbSid).find('.data-static-label').css('color', p1);
        }.bind(this);
        funs.setBgGradient = function (color1, color2, position) {
            this.pos = position ? position : "right";
            let bg = "linear-gradient(to " + this.pos + "," + color1 + "," + color2 + ")";
            $("#cont_" + this.EbSid).find(".ctrl-cover").css('background-image', bg);
            $("#cont_" + this.EbSid).find(".ctrl-cover").css('border',"0px");
        }.bind(this);
        funs.Style = function (p1 , p2) {
            $("#cont_" + this.EbSid).find(".ctrl-cover").css(p1, p2);
        }

        return funs;
    };

    this.init();
}