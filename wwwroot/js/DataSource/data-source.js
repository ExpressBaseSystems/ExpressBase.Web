var BuilderMode = {
    NEW: "new",
    EDIT: "edit"
};

class DataSource {
    constructor(o) {
        this.Mode;
        const Default = {
            Object: null,
            Version: "",
            RefId: "",
            Status: "",
            TabNumber: 0,
            SSUrl: ""
        };

        this.BuilderType;
        this.Settings = $.extend(Default, o);
        this.EbObject = this.Settings.Object;
        if (this.EbObject === null)
            this.Mode = BuilderMode.NEW;
        else
            this.Mode = BuilderMode.EDIT
        this.initPg();
    }

    get uniqName() {
        return this.constructor.name + Date.now().toString(36);
    }

    initPg() {
        this.PropertyGrid = new Eb_PropertyGrid({
            id: "dspropgrid" + this.Settings.TabNumber,
            wc: "",
            cid: window.ebcontext.sid,
            $extCont: $(".ds-prop"),
            $scope: $(".adv-dsb-cont")
        });
    }

    closeParamDiv() {

    }
}

class DataReader extends DataSource {
    constructor(o) {
        super(o);
        this.BuilderType = 2;
        this.init();
    }

    init() {
        if (this.Mode === BuilderMode.NEW) {
            this.EbObject = new EbObjects.EbDataReader(this.uniqName);
            this.EbObject.DisplayName = this.EbObject.Name;
            commonO.Current_obj = this.EbObject;
        }
        else {
            if (this.EbObject.FilterDialogRefId !== "") {
                this.getFD();
            }
        }
    }

    getFD() { 
        try {
            $.post("../CE/GetFilterBody",
                {
                    dvobj: JSON.stringify(this.EbObject),
                    contextId: "paramdiv" + this.Settings.TabNumber
                },
                this.drawFD.bind(this));
        }
        catch (err) {
            console.error(err);
        }
    }

    drawFD(html) {
        $('#paramdiv' + this.Settings.TabNumber).remove();
        $('#ds-page' + this.Settings.TabNumber).prepend(`
                <div id='paramdiv-Cont${this.Settings.TabNumber}' class='param-div-cont'>
                    <div id='paramdiv${this.Settings.TabNumber}' class='param-div fd'>
                        <div class='pgHead'>
                            <h6 class='smallfont' style='font-size: 12px;display:inline'>Parameter Div</h6>
                            <div class="icon-cont  pull-right" id='close_paramdiv${tabNum}'>
                                <i class="fa fa-times" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>`);
        $('#paramdiv' + this.Settings.TabNumber).append(html);
        $('#close_paramdiv' + this.Settings.TabNumber).off('click').on('click', this.closeParamDiv.bind(this));
    }
}

class DataWriter extends DataSource {
    constructor(o) {
        super(o);
        this.BuilderType = 4;
        this.init();
    }

    init() {
        if (this.Mode === BuilderMode.NEW) {
            this.EbObject = new EbObjects.EbDataWriter(this.uniqName);
            this.EbObject.DisplayName = this.EbObject.Name;
            commonO.Current_obj = this.EbObject;
        }
    }
}

class SqlFunction extends DataSource {

    static get SqlSyntax() {
        return btoa(`CREATE OR REPLACE FUNCTION function_name(parameter_name...)
            RETURN return_datatype
            { IS | AS }
            BEGIN
                <function_body>
            END;`);
    }

    constructor(o) {
        super(o);
        this.BuilderType = 5;
        var Syntax =

        this.init();
    }

    init() {
        if (this.Mode === BuilderMode.NEW) {
            this.EbObject = new EbObjects.EbSqlFunction(this.uniqName);
            this.EbObject.DisplayName = this.EbObject.Name;
            commonO.Current_obj = this.EbObject;
            this.EbObject.Sql = this.SqlSyntax;
        }
    }
}