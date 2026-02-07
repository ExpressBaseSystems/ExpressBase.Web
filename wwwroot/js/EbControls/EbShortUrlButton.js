let EbShortUrlButtonJs = function (ctrl, options, renderer) {
    this.ctrl = ctrl;
    this.options = options || {};
    this.$ctrl = $("#" + ctrl.EbSid_CtxId);
    this.Renderer = renderer;

    this.init = function () {
        this.initCtrlOperationFns();
        $('#cont_' + this.ctrl.EbSid_CtxId + ' .ctrl-cover div').attr('disabled', 'disabled');
        this.$ctrl.off('click').on('click', this.ClickedOnButton.bind(this));
    };

    this.ClickedOnButton = function () {
        if ($('#cont_' + this.ctrl.EbSid_CtxId + ' .ctrl-cover div').attr('disabled'))
            return;
        if (this._lockProcessing)
            return;
        this._lockProcessing = true;

        try {

            let paramsStr = btoa(JSON.stringify(this.getParameters()));

            this.buttonHtml = this.$ctrl.html();
            this.$ctrl.html('<span>Generating URL </span><i class="fa fa-spinner fa-pulse"></i>');

            $.ajax({
                type: "GET",
                url: "/WebForm/GenerateShortUrl",
                data: {
                    refid: this.Renderer.formRefId,
                    ctrlname: this.ctrl.Name,
                    parameters: paramsStr
                },
                error: function (request, error) {
                    this.$ctrl.html(this.buttonHtml);
                    this._lockProcessing = false;
                }.bind(this),
                success: this.generateUrlAjaxSuccess.bind(this)
            });
        }
        catch (ex) {
            this.$ctrl.html(this.buttonHtml);
            this._lockProcessing = false;
        }
    };

    this.generateUrlAjaxSuccess = function (resp) {
        let respObj = JSON.parse(resp);
        if (respObj.status == 200) {

            let shortUrl = window.location.origin + respObj.shortUrl;

            EbDialog("show",
                {
                    Message: "Generated URL",
                    Buttons: {
                        "Copy to Clipboard": { Background: "green", Align: "left", FontColor: "white;" },
                        "Close": { Background: "gray", Align: "right", FontColor: "white;" }
                    },
                    IsPrompt: true,
                    PromptLines: 3,
                    DefaultText: shortUrl,
                    ReadOnlyPrompt: true,
                    CallBack: function (name, prompt) {
                        if (name === "Copy to Clipboard") {
                            navigator.clipboard.writeText(shortUrl).then(function () {
                                EbMessage("show", { Message: 'URL copied to clipboard', AutoHide: true, Background: '#0000aa', Delay: 2000 });
                            }, function (err) { });
                        }
                    }.bind(this)
                });
        }
        else {
            EbMessage("show", { Message: 'Short URL generation failed. ' + respObj.message, AutoHide: true, Background: '#aa0000', Delay: 8000 });
            console.log(respObj);
        }
        this.$ctrl.html(this.buttonHtml);
        this._lockProcessing = false;
    };

    this.getParameters = function () {
        let params = [];

        if (this.ctrl.DataFlowMap && this.ctrl.DataFlowMap.$values.length > 0) {
            var pMap = this.ctrl.DataFlowMap.$values;
            for (let i = 0; i < pMap.length; i++) {
                let srcCtrl = this.Renderer.formObject[pMap[i].SrcCtrlName];
                if (!srcCtrl) {
                    if (pMap[i].SrcCtrlName == 'id') {
                        params.push({
                            Name: pMap[i].DestCtrlName,
                            Type: 7,
                            Value: this.Renderer.rowId
                        });
                    }
                    continue;
                }
                params.push({
                    Name: pMap[i].DestCtrlName,
                    Type: srcCtrl.EbDbType,
                    Value: srcCtrl.getValue()
                });
            }
        }
        return params;
    };

    this.initCtrlOperationFns = function () {
        this.ctrl.setValue = function (p1) {
            let $lbl = $("#" + this.EbSid_CtxId + ' span');
            $lbl.text(p1 + ' ');
        }.bind(this.ctrl);

        this.ctrl.justSetValue = this.ctrl.setValue;

        this.ctrl.enable = function (ctrl) {
            if (this.Renderer.Mode.isView) {
                ctrl.__IsDisable = false;
                $('#cont_' + ctrl.EbSid_CtxId + ' .ctrl-cover div').removeAttr('disabled');
            }
            else {
                ctrl.__IsDisable = true;
                $('#cont_' + ctrl.EbSid_CtxId + ' .ctrl-cover div').attr('disabled', 'disabled');
            }
        }.bind(this, this.ctrl);

        this.ctrl.disable = this.ctrl.enable;
    };

    this.init();
}