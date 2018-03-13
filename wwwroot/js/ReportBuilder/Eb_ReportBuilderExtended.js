var ReportExtended = function (collection) {
    this.objCollection = collection;
    this.sideBar = $("#side-toolbar");
    this.pageContainer = $("#page-outer-cont");
    this.pGcontainer = $("#PGgrid-report");
    this.GroupSelect = [];

    this.headerSecSplitter = function (array, Harr) {
        var HR = Harr.length > 0 ? Harr : [20, 20, 20, 20, 20];        
        Split(array, {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: HR,
            minSize: 33,
            snapOffset: 20,
            gutterSize: 5,
            onDrag: this.OndragOfSections.bind(this)
        });
    };

    this.OndragOfSections = function () {
        $('#box0,#rptheadHbox').css("height", $('#rpthead').height());
        $('#box1,#pgheadHbox').css("height", $('#pghead').height());
        $('#box2,#detailHbox').css("height", $('#detail').height());
        $('#box3,#pgfooterHbox').css("height", $('#pgfooter').height());
        $('#box4,#rptfooterHbox').css("height", $('#rptfooter').height());
        this.splitterOndragFn();
    };

    this.multisplit = function () {
        Split(['#rptheadHbox', '#pgheadHbox', '#detailHbox', '#pgfooterHbox', '#rptfooterHbox'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [20, 20, 20, 20, 20],
            minSize: 33,
            gutterSize: 5,
            onDrag: this.onDragMultiSplit.bind(this) 
        });
    }

    this.onDragMultiSplit = function () {
        $('#box0,#rpthead').css("height", $('#rptheadHbox').height());
        $('#box1,#pghead').css("height", $('#pgheadHbox').height());
        $('#box2,#detail').css("height", $('#detailHbox').height());
        $('#box3,#pgfooter').css("height", $('#pgfooterHbox').height());
        $('#box4,#rptfooter').css("height", $('#rptfooterHbox').height());
        this.splitterOndragFn();
    };

    this.box = function () {
        Split(['#box0', '#box1', '#box2', '#box3', '#box4'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [20, 20, 20, 20, 20],
            minSize: 33,
            gutterSize: 5,
            onDrag: this.ondragOfBox.bind(this)
        });
    }
    this.ondragOfBox = function () {
        $('#rptheadHbox,#rpthead').css("height", $('#box0').height());
        $('#pgheadHbox,#pghead').css("height", $('#box1').height());
        $('#detailHbox,#detail').css("height", $('#box2').height());
        $('#pgfooterHbox,#pgfooter').css("height", $('#box3').height());
        $('#rptfooterHbox,#rptfooter').css("height", $('#box4').height());
        this.splitterOndragFn();
    };

    this.splitterOndragFn = function () {
        $('.multiSplit').children().not(".gutter").children().not(".gutter").each(function (i, obj1) {
            $('.page').children().not(".gutter").children().not(".gutter").each(function (j, obj2) {
                if ($(obj1).parent().attr("data_val") === $(obj2).parent().attr("data_val")) {
                    if ($(obj1).index() === $(obj2).index()) {
                        $(obj1).css("height", $(obj2).height());
                    }
                }
            });
        });
    };//spliter ondrag func

    this.splitGeneric = function (array, sizeArray) {
        Split(array, {
            direction: 'vertical',
            sizes: sizeArray,
            cursor: 'row-resize',
            minSize: 30,
            gutterSize: 5,
            onDrag: this.splitterOndragFn.bind(this)
        });
    }

    this.minMaxToolbar = function () {
        $("#eb-toolBoxReport-min").on('click', this.toggleSideToolbar.bind(this));
        $("#max-sidebar").on('click', this.toggleSideToolbar.bind(this));
        $("#max-pg").on('click', this.minPgrid.bind(this));
    }

    this.toggleSideToolbar = function (e) {              
        this.sideBar.animate({
                    width: "toggle"
        }, "fast",this.onsideBarToggle.bind(this));
    };
   
    this.onsideBarToggle = function (e) {
        if (this.sideBar.css("display") === 'none') {
            $("#max-sidebar").show();
            if (this.pGcontainer.css("display") === 'none') 
                this.pageContainer.switchClass("col-md-10 col-lg-10 col-sm-10 col-sm-offset-2 col-lg-offset-2 col-md-offset-2", "col-md-11 col-lg-11 col-sm-11 pd-left-60px", 500, "easeInOutQuad");            
            else
                this.pageContainer.switchClass("col-md-8 col-lg-8 col-sm-8 col-sm-offset-2 col-lg-offset-2 col-md-offset-2", "col-md-10 col-lg-10 col-sm-10 pd-left-60px", 1000, "easeInOutQuad");            
        }
        else {
            $("#max-sidebar").hide();
            if (this.sideBar.css("display") === 'none')
                this.pageContainer.switchClass("col-md-11 col-lg-11 col-sm-11", "col-md-10 col-lg-10 col-sm-10 pd-left-60px", 500, "easeInOutQuad");
            else
                this.pageContainer.switchClass("col-md-10 col-lg-10 col-sm-10 pd-left-60px", "col-md-8 col-lg-8 col-sm-8 col-sm-offset-2 col-lg-offset-2 col-md-offset-2", 1000, "easeInOutQuad");        
        }    
    };

    this.minPgrid = function () {
        this.pGcontainer.animate({
            width: "toggle"
        }, "fast", this.onPgToggle.bind(this));
    };

    this.onPgToggle = function () {
        if (this.pGcontainer.css("display") === 'none') {
            $("#max-pg").show();
            if (this.sideBar.css("display") === 'none')
                this.pageContainer.switchClass("col-md-10 col-lg-10 col-sm-10", "col-md-11 col-lg-11 col-sm-11", 1000, "easeInOutQuad");
            else            
                this.pageContainer.switchClass("col-md-8 col-lg-8 col-sm-8", "col-md-10 col-lg-10 col-sm-10", 1000, "easeInOutQuad");
        }
        else {
            $("#max-pg").hide();
            if (this.sideBar.css("display") === 'none')
                this.pageContainer.switchClass("col-md-11 col-lg-11 col-sm-11", "col-md-10 col-lg-10 col-sm-10 pd-left-60px", 1000, "easeInOutQuad");
            else
                this.pageContainer.switchClass("col-md-10 col-lg-10 col-sm-10 pd-left-60px", "col-md-8 col-lg-8 col-sm-8 col-sm-offset-2 col-lg-offset-2 col-md-offset-2", 1000, "easeInOutQuad");
        }
    };

    this.keyboardevents = function (event, control, obj) {
        this.obj = obj;
        this.control = control;
        if (this.control.css("left") !== 0 || this.control.css("top") !== 0 ){
            switch (event.which) {
                case 46:    //delete key
                    this.control.remove();
                    break;
                case 37:    //left arrow key
                    this.control.finish().animate({
                        left: "-=1"
                    });
                    this.obj.Left -= 1;
                    break;
                case 38:    //up arrow key
                    this.control.finish().animate({
                        top: "-=1"
                    });
                    this.obj.Top -= 1;
                    break;
                case 39:    //right arrow key
                    this.control.finish().animate({
                        left: "+=1"
                    });
                    this.obj.Left += 1;
                    break;
                case 40:    //bottom arrow key
                    this.control.finish().animate({
                        top: "+=1"
                    });
                    this.obj.Top += 1;
                    break;
            }
        }
    };
    this.keyClickDoc = function () {
        $(document).on("keydown", this.keydownDocument.bind(this));
    };
    this.keydownDocument = function (e) {
        this.ctrl = e.which;
        switch (e.which) {
            case 17:    //ctrl key
                this.ctrlClickForMulSel();
                this.ctrl = null;
                break;           
        }
    };

    this.ctrlClickForMulSel = function () {
        if (this.ctrl === 17)
            $('.dropped').on("click", this.mark.bind(this)); 
    };
    this.mark = function (event) {
        $(event.target).addClass("marked");        
    };

    this.alignGroup = function (eType, selector, action, originalEvent) {
        
        var top = $(selector.selector).css("top");
        var left = $(selector.selector).css("left");  
        var parent = $(selector.selector).parent();
        switch (eType) {
            case "Top":
                this.applyToGroupSelect(parent,"top",top);
                break;
            case "Left":   
                this.applyToGroupSelect(parent,"left", left);
                break;
            case "Bottom":
                
                break;
            case "Right":
                this.applyToGroupSelect(parent,"left", left);
                break;
        }
    }.bind(this);

    this.applyToGroupSelect = function (parent,item,val) {
        $.each(parent.children(".marked"), function (i, obj) {
            $(obj).css(item, val);
            $(obj).removeClass("marked");
        });
    };

    this.setBackgroud = function (url) {
        $(".page").css("background", "url(http://eb_roby_dev.localhost:5000/static/" + url + ".jpg) no-repeat");
    };

    this.mapCollectionToSection = function (sec) {
        var collection = "";
        if (sec === "ReportHeader")
            collection = "ReportHeaders";
        else if (sec === "PageHeader")
            collection = "PageHeaders";
        else if (sec === "ReportDetail")
            collection = "Detail";
        else if (sec === "PageFooter")
            collection = "PageFooters";
        else if (sec === "ReportFooter")
            collection = "ReportFooters";
        return collection;
    };

    this.replaceProp = function (source, destination) {
        for (var objPropIndex in source) {
            if (typeof source[objPropIndex] !== "object" || objPropIndex === "Font") {
                source[objPropIndex] = ['Width', 'Height', 'Left', 'Top'].indexOf(objPropIndex) > -1  ? this.convertPointToPixel(destination[objPropIndex]) :destination[objPropIndex];
            }
        }
    }

    this.replaceWOPtConvProp = function (source, destination) {
        for (var objPropIndex in source) {
            if (typeof source[objPropIndex] !== "object") {
                source[objPropIndex] = destination[objPropIndex];
            }
        }
    }

    this.convertTopoints = function (val) {
        var pixel = val;
        var point = (pixel * 72) / 96;
        return point;
    }
    this.convertPointToPixel = function (val) {
        var points = val;
        var pixel = (points * 96) / 72;
        return pixel;
    }

    this.convertPixelToPercent = function (SubsecHArr) {
        var tot = SubsecHArr.reduce((x, y) => x + y);
        for (var i = 0 ; i < SubsecHArr.length; i++) {
            SubsecHArr[i] = (SubsecHArr[i] / tot) * 100;
        }
        return SubsecHArr;
    }

    this.emptyControlCollection = function (rptObj) {
        for (var objPropIndex in rptObj) {
            if (typeof rptObj[objPropIndex] === "object" && objPropIndex !== "ReportObjects" && objPropIndex !== "$Control" ) 
                this.emptyCConESec(rptObj[objPropIndex]);
            else if (objPropIndex === "ReportObjects")
                rptObj[objPropIndex].$values.length = 0
        }
    };
    this.emptyCConESec = function (rptObjsubsec) {
        for (var i = 0; i < rptObjsubsec.$values.length; i++) {
            rptObjsubsec.$values[i].Fields.$values.length = 0;
        }
    }

    this.setFontProp = function (fobj) {
        var _font = fobj.Font;

        if (_font !== null) {
            var caps = (_font.Caps) ? "uppercase" : "lowercase";
            var decor = "";
            var style = "";
            var weight = "";
            var font = _font.Font === null ? "Times-Roman" : _font.Font;
            var size = _font.Size === 0 ? "14px" : _font.Size + "px";

            if (_font.Strikethrough)
                decor = "line-through";
            else if (_font.Underline)
                decor = "underline";
            else
                decor = "none";

            if (_font.Style === 0) {
                style = "normal";
                weight = "normal";
            }
            else if (_font.Style === 2) {
                style = "italic";
                weight = "normal";
            }
            else if (_font.Style === 1) {
                style = "normal";
                weight = "bold";
            }
            else {
                style = "italic";
                weight = "bold";
            }
            $("#" + fobj.EbSid).css({
                "font-family": font,
                "font-size": size,
                "text-decoration": decor,
                "font-style": style,
                "font-weight": weight,
                "text-transform": caps,
                "color": _font.color
            });
        }
    };

    this.RefreshFontControl = function (_object) {

    };

    this.minMaxToolbar();
    this.keyClickDoc();
}
