const EbRenderQuestionsControl = function (ctrl, options) {
    this.ctrl = ctrl;
    this.Questions = this.ctrl.Controls.$values;
    this.ctrl.formObject = options.formObject;
    this.formObject_Full = options.formObject_Full;
    this.formRenderer = options.formRenderer;
    this.formRefId = options.formRefId;
    this.ctrl.__userObject = options.userObject;
    this.initControls = new InitControls(this.formRenderer);
    this.Mode = options.Mode;
    this.RowDataModel_empty = this.formRenderer.formData.DGsRowDataModel[this.ctrl.TableName];
    this.DataMODEL = this.formRenderer.DataMODEL[this.ctrl.TableName];
    this.TableId = `tbl_${this.ctrl.EbSid_CtxId}`;

    this.initCtrls = function () {
        for (let i = 0; i < this.Questions.length; i++) {
            let Qstn = this.Questions[i]
            let ctrls = Qstn.ASec.Controls.$values.concat(Qstn.QSec.Controls.$values)
            for (let i = 0; i < ctrls.length; i++) {
                let Ctrl = ctrls[i];

                let opt = {};
                if (Ctrl.ObjType === "PowerSelect" && !Ctrl.RenderAsSimpleSelect)
                    opt.getAllCtrlValuesFn = this.formRenderer.getWebFormVals;
                else if (Ctrl.ObjType === "FileUploader") {
                    opt.FormDataExtdObj = this.formRenderer.FormDataExtdObj;
                    opt.DpControlsList = getFlatObjOfType(this.formRenderer.FormObj, "DisplayPicture");
                }
                else if (Ctrl.ObjType === "Date") {
                    opt.source = "webform";
                }
                else if ((Ctrl.ObjType === "ExportButton") || (Ctrl.ObjType === "Phone")) {
                    opt.formObj = this.FormObj;
                    opt.dataRowId = this.DataMODEL[this.FormObj.TableName][0].RowId;
                }

                else if (Ctrl.ObjType === "SubmitButton") {
                    opt.renderMode = this.renderMode;
                }
                this.initControls.init(Ctrl, opt);
            }
        }
    };

    this.init = function () {
        this.initCtrls();
    };

    this.init();
};