var ReportExtended = function () {
    this.sideBar = $("#side-toolbar");
    this.pageContainer = $("#page-outer-cont");
    this.pGcontainer = $("#PGgrid-report");

    this.headerSecSplitter = function (array) {
        Split(array, {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [20, 20, 20, 20, 20],
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
                this.pageContainer.switchClass("col-md-10 col-lg-10 col-sm-10 col-sm-offset-2 col-lg-offset-2 col-md-offset-2", "col-md-11 col-lg-11 col-sm-11", 500, "easeInOutQuad");            
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
    this.minMaxToolbar();
}