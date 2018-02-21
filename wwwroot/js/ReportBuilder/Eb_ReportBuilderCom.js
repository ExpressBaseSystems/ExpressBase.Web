var RbCommon = function (RbMailObj) {
    this.RbObj = RbMailObj;
    this.EbidCounter = {
        EbDataFieldTextCounter: 0,
        EbDataFieldDateTimeCounter: 0,
        EbDataFieldBooleanCounter: 0,
        EbDataFieldNumericCounter: 0,
        EbDataFieldNumericSummaryCounter: 0,
        EbDataFieldTextSummaryCounter: 0,
        EbDataFieldBooleanSummaryCounter: 0,
        EbDataFieldDateTimeSummaryCounter: 0,
        EbTableCounter: 0,
        EbImgCounter: 0,
        EbDateTimeCounter: 0,
        EbPageXYCounter: 0,
        EbPageNoCounter: 0,
        EbTextCounter: 0,
        EbBarcodeCounter: 0,
        EbQRcodeCounter: 0,
        EbWaterMarkCounter: 0,
        EbCircleCounter: 0,
        EbRectCounter: 0,
        EbArrRCounter: 0,
        EbArrLCounter: 0,
        EbArrUCounter: 0,
        EbArrDCounter: 0,
        EbByArrHCounter: 0,
        EbByArrVCounter: 0,
        EbHlCounter: 0,
        EbVlCounter: 0,
        EbSerialNumberCounter: 0,
        EbCalcFieldCounter: 0
    };

    this.subSecCounter = {
        Countrpthead: 1,
        Countpghead: 1,
        Countdetail: 1,
        Countpgfooter: 1,
        Countrptfooter: 1
    };

    this.EbObjectSections = {
        ReportHeader: 'rpthead',
        PageHeader: 'pghead',
        ReportDetail: 'detail',
        PageFooter: 'pgfooter',
        ReportFooter: 'rptfooter'
    };
    this.msBoxSubNotation = {
        rpthead: 'Rh',
        pghead: 'Ph',
        detail: 'Dt',
        pgfooter: 'Pf',
        rptfooter: 'Rf'
    };

    this.pages = {
        0: {
            width: '612pt',
            height: '792pt'
        },//A2
        1: {
            width: '841.8898pt',
            height: '1190.55pt'
        },//A3
        2: {
            width: '595.276pt',
            height: '841.8898pt'
        },//A4      
        3: {
            width: '419.5276',
            height: '595.276pt'
        },//A5 
        4: {
            width: '612pt',
            height: '792pt'
        },//letter
    };    
    this.EbRuler = {
        px: {
            minor: "tickMinor",
            major: "tickMajor",
            label: "tickLabel",
            len: 5
        },
        cm: {
            minor: "tickMinor-cm",
            major: "tickMajor-cm",
            label: "tickLabel-cm",
            len: 3.77
        },
        inch: {
            minor: "tickMinor-inch",
            major: "tickMajor-inch",
            label: "tickLabel-inch",
            len: 9.6
        }
    }


    this.start = function () {

    };

    this.start();
}