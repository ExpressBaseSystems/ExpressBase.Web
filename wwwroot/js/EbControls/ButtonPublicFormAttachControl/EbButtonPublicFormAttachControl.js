class ButtonPublicFormAttachControl {
    static CONTROL = "ButtonPublicFormAttach";

    ctrl;
    options;
    mode;
    apiClient;
    ctrlEl;
    formDataId;

    _onClick;

    constructor(ctrl, options, mode, formDataId, formRefId, publicFormId) {
        this.ctrl = ctrl;
        this.options = options;
        this.mode = mode;
        this.apiClient = new EbApiClientHelper();
        this.formDataId = formDataId;
        this.formRefId = formRefId;
        this.publicFormId = publicFormId;

        this.ctrlEl = document.getElementById(ctrl.EbSid_CtxId);

        //this.ctrl.justSetValue = this.ctrl.setValue?.bind(this.ctrl);

        this.ctrl.disable = this.disable.bind(this, this.ctrl);
        this.ctrl.enable = this.enable.bind(this, this.ctrl);

        this._onClick = this._handleClick.bind(this);
        this.initEvents();
    }


    initEvents() {
        if (!this.ctrlEl) {
            EbDebugHelper?.warn?.(`ButtonPublicFormAttach: element not found for id ${this.ctrl?.EbSid_CtxId}`);
            return;
        }


        this.ctrlEl.removeEventListener('click', this._onClick);
        this.ctrlEl.addEventListener('click', this._onClick);
    }

    async _handleClick(e) {

        e.preventDefault();

        if (this.isBusy() || this.isDisabled()) return;

        this.makeBusy();

        const endpoint = '/api/form/control/button_public_form_attach/public_form_url';

        try {

            const payload = {
                publicFormRefId: this.publicFormId,
                sourceFormRefId: this.formRefId,
                formDataId: this.formDataId
            };

            let result = await this.apiClient.request(endpoint, {
                method: "GET",
                query: payload
            });


            let copyText;

            if (typeof result === 'object' && result !== null && 'url' in result) {

                const url = result.url;

                if (typeof url !== 'string' || url.trim().length === 0) {

                    throw new Error("URL must be a non-empty string");
                }

                try {

                    new URL(url);
                    copyText = url;

                } catch {

                    throw new Error("invalid URL format");
                }

            } else {

                throw new Error("result must be an object containing a 'url' property");
            }

            const success = await EbClipboardHelper.copy(copyText);

            if (success) {

                EbMessage("show", {Message: 'Copied to clipboard', AutoHide: true, Background: '#1faa00', Delay: 4000});

            } else {

                EbMessage("show", {Message: 'Unable to Copy to clipboard', AutoHide: true, Background: '#aa0000', Delay: 4000});
            }

        } catch (err) {

            EbDebugHelper?.error?.(`call to endpoint ${endpoint} failed`, err);

            EbMessage("show", {
                Message: 'We are unable to process your request',
                AutoHide: true,
                Background: '#aa0000',
                Delay: 6000
            });

        } finally {

            this.unBusy();
        }
    }


    disable() {
        this.ctrlEl.dataset.ebControlDisabled = "true";
        this.#disableElement();
    }

    enable() {
        this.ctrlEl.dataset.ebControlDisabled = "false";
        this.#enableElement();
    }

    #disableElement() {
        const selector = `#cont_${this.ctrl.EbSid_CtxId} .ctrl-cover div`;
        const nodes = document.querySelectorAll(selector);
        nodes.forEach(node => node.setAttribute('disabled', 'disabled'));
    }

    #enableElement() {
        const selector = `#cont_${this.ctrl.EbSid_CtxId} .ctrl-cover div`;
        const nodes = document.querySelectorAll(selector);
        nodes.forEach(node => node.removeAttribute('disabled'));
    }

    makeBusy() {
        if (!this.ctrlEl) return;
        this.ctrlEl.dataset.ebControlBusy = "true";
        this.ctrlEl.classList.add('is-busy');
        window.jQuery ? $("#eb_common_loader").EbLoader?.("show") : undefined


    }

    unBusy() {
        if (!this.ctrlEl) return;
        delete this.ctrlEl.dataset.ebControlBusy;
        this.ctrlEl.classList.remove('is-busy');
        window.jQuery ? $("#eb_common_loader").EbLoader?.("hide") : undefined

    }

    isBusy() {
        return !!(this.ctrlEl && this.ctrlEl.dataset && this.ctrlEl.dataset.ebControlBusy === "true");
    }

    isDisabled() {
        return !!(this.ctrlEl && this.ctrlEl.dataset && this.ctrlEl.dataset.ebControlDisabled === "true");
    }
}
