var ReportExtended = function (Rpt_obj) {
    this.Rpt = Rpt_obj;
    this.sideBar = $("#side-toolbar");
    this.pageContainer = $("#page-outer-cont");
    this.pGcontainer = $("#PGgrid-report");
    this.dpiX = $(".get_ScreenDpi_div").height();
    this.GroupSelect = [];


    if (!this.Rpt.isNew) {
        ['Courier', 'Helvetica', 'Times', 'Times-Roman', 'ZapfDingbats'].forEach(function (item) {
            $("head").append($("<link rel='stylesheet' type='text/css' href='http://fonts.googleapis.com/css?family='" + item +"'/>"));
        });
    }

    this.minMaxPG = function () {
        $("#max-pg").on('click', this.minPgrid.bind(this));
    }

    this.minPgrid = function () {
        this.pGcontainer.animate({
            width: "toggle"
        }, "fast", function () {
            if (this.pGcontainer.css("display") === 'none')
                $("#max-pg").show();
            else
                $("#max-pg").hide();
            }.bind(this));
    };

    this.keyInteractions = function (event) {
        var eb_cntrol = this.Rpt.objCollection[event.target.id];
        var js_cntrol = event;
        if ([37, 38, 39, 40].indexOf(event.which) >= 0)
            this.moveCtrl(js_cntrol, eb_cntrol);
        else
            this.keyCtrolFn(js_cntrol, eb_cntrol);
    };

    this.keyCtrolFn = function (js_cntrol, eb_cntrol) {
        var jq_cntrol = $(js_cntrol.target);

        if (js_cntrol.which === 46) {
            delete this.Rpt.objCollection[js_cntrol.id];
            jq_cntrol.remove(); this.Rpt.pg.removeFromDD(eb_cntrol.EbSid);
        }
        else if (event.ctrlKey)
            this.markEbCntrol(js_cntrol, eb_cntrol);
    }

    this.moveCtrl = function (js_cntrol, eb_cntrol) {
        var jq_cntrol = $(js_cntrol.target);
        if (jq_cntrol.css("left") !== 0 || jq_cntrol.css("top") !== 0 ){
            if (js_cntrol.which === 37) {
                jq_cntrol.finish().animate({left: "-=1"});
            }
            else if (js_cntrol.which === 38) {
                jq_cntrol.finish().animate({top: "-=1"});
            }
            else if (js_cntrol.which === 39) {
                jq_cntrol.finish().animate({left: "+=1"});
            }
            else if (js_cntrol.which === 40) {
                jq_cntrol.finish().animate({top: "+=1"});
            }
            eb_cntrol.Left = jq_cntrol.position().left;
            eb_cntrol.Top = jq_cntrol.position().top;
        }
    };

    this.markEbCntrol = function (js_cntrol, eb_cntrol) {
        $(js_cntrol.target).toggleClass("marked"); 
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
        $(".page").css("background", "url('" + window.location.protocol + "//" + window.location.host + "/static/" + url + ".JPG" + "') center no-repeat");
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
                if (['Width', 'Height', 'Left', 'Top'].indexOf(objPropIndex) > -1) 
                    source[objPropIndex] = this.convertPointToPixel(destination[objPropIndex + "Pt"]);
                else
                    source[objPropIndex] = destination[objPropIndex];
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
        var point = (pixel * 72) / this.dpiX;
        return point;
    }
    this.convertPointToPixel = function (val) {
        var points = val;
        var pixel = (points * this.dpiX) / 72;
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
            if (typeof rptObj[objPropIndex] === "object" && objPropIndex !== "ReportObjects" && objPropIndex !== "$Control" && objPropIndex !== "Margin") 
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
    
    this.minMaxPG();
    $('body').off("keydown").on("keydown", ".dropped", this.keyInteractions.bind(this));
}
