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

    this.init = function () {

    };

    this.init();
};