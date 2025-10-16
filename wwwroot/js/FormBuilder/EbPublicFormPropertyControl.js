class EbPublicFormPropertyControl {

    static checkbox = null;
    static container = null;
    static btn = null;
    static modal = null;
    static publicFormUrl = null;
    static refId = null;
    static _boundToggle = null;

    static handleFromSave() {

    }


    static handlePGControlStateChange(checkboxEl = null) {
        try {
            this.checkbox = checkboxEl;

            if (!this.checkbox) throw new Error("Checkbox element not found");

            this.container = document.querySelector('#publicFormActions');

            if (!this.container) throw new Error("#publicFormActions not found");

            this.initDataSetFromContainer();

            if (this.checkbox.checked) {
                return this.handleCheck();
            } else {
                return this.handleUncheck();
            }
        } catch (error) {
            EbDebugHelper?.error?.("Unable to init EbPublicFormPropertyControl (static)", error);
        }
    }

    static initDataSetFromContainer() {
        const {refid, publicformurl} = this.container.dataset ?? {};

        this.refId = null;
        this.publicFormUrl = null;

        if (refid) {
            this.refId = refid;
        }

        if (publicformurl) {
            this.publicFormUrl = publicformurl;
        }
    }


    static generateCopyUrlButton(forceRegenerate = false) {

        if (!this.container || forceRegenerate === true) {

            this.container = document.querySelector('#publicFormActions');

            if (!this.container) {
                EbDebugHelper.error("#publicFormActions not found while generating button");
                return;
            }

            this.container.replaceChildren();
            this.btn = null;
            this.initDataSetFromContainer();
        }

        this.modal ??= new EbShareModal({title: "Public Form Link"});

        this.btn = document.getElementById('copy_url') || document.createElement('button');
        this.btn.className = 'btn';
        this.btn.id = 'copy_url';
        this.btn.title = 'Copy public form Link';
        this.btn.style.display = 'none';


        if (!this.btn.querySelector('i')) {
            const icon = document.createElement('i');
            icon.className = 'fa fa-clipboard';
            icon.setAttribute('aria-hidden', 'true');
            this.btn.appendChild(icon);
        }

        if (this.publicFormUrl) {
            this.btn.onclick = () => this.modal.open(this.publicFormUrl);
            this.btn.style.display = 'inline-block';
            this.btn.removeAttribute("aria-disabled");
        } else {
            this.btn.style.display = "none";
            this.btn.onclick = null;
            this.btn.setAttribute("aria-disabled", "true");
        }


        if (!this.btn.parentElement || forceRegenerate === true) {
            this.container.appendChild(this.btn);
        }
    }


    static async handleCheck() {
        window.jQuery ? $("#eb_common_loader").EbLoader?.("show") : undefined;

        try {
            if (!this.refId) {
                EbToast?.info?.("Save the form to generate a public form link");
                return;
            }

            if (!this.publicFormUrl) {

                const response = await new EbApiClientHelper().request(
                    '/internal/api/v2/BuilderApi/GetPublicFormUrl',
                    {
                        method: 'GET',
                        query: {RefId: this.refId},
                        credentials: 'include'
                    }
                );


                if (!response?.publicFormUrl) throw new Error("Unable to fetch the public form from XHR");
                this.publicFormUrl = response.publicFormUrl;
            }

            this.generateCopyUrlButton();

            EbToast.info("Public form link generated successfully. Save this form to make it public.")

        } catch (err) {
            EbDebugHelper?.error?.("An exception occurred while changing the form state", err);
            EbToast?.error?.("Unable to change the state of the form");
            if (this.btn) {
                this.btn.style.display = "none";
                this.btn.onclick = null;
                this.btn.setAttribute("aria-disabled", "true");
            }
        } finally {
            window.jQuery ? $("#eb_common_loader").EbLoader?.("hide") : undefined;
        }
    }


    static handleUncheck() {
        window.jQuery ? $("#eb_common_loader").EbLoader?.("show") : undefined;
        try {
            if (!this.refId) {
                EbToast?.info?.("Save the form to ensure the state change");
                return;
            }

            this.publicFormUrl = null;

            this.generateCopyUrlButton();
            EbToast.info("Save this form to make it private.")
        } catch (err) {
            EbToast?.error?.("Unable to change the state of the form");
        } finally {
            window.jQuery ? $("#eb_common_loader").EbLoader?.("hide") : undefined;
        }
    }


    static retarget(checkboxEl = null, containerEl = null) {
        if (checkboxEl && this.checkbox !== checkboxEl) {
            if (this._boundToggle && this.checkbox) {
                this.checkbox.removeEventListener('change', this._boundToggle);
            }
            this.checkbox = checkboxEl;
            this._attachChangeHandler();
        }
        if (containerEl && this.container !== containerEl) {
            this.container = containerEl;
        }
    }
}
