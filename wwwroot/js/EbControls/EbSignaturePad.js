//options = {
//    Container: "#id/.classname",
//    Vendor: "value of enum SingaturePadVendor",
//}

class SignaturePad {

    constructor(options) {

        this.o = $.extend({
            Vendor: 1
        }, options);

        this.tmr = null;
        this.uniq = this.o.Container.replace("#", "").replace(".", "");
        this.b64Result = null;
        this.vendorResult = null;

        if (this.o.Vendor !== 1)
            return;

        this.buildHtml();
    }

    getResult(b64result, vendorFormat) {
        console.log(b64result);
        console.log(vendorFormat);
    }

    buildHtml() {
        $(this.o.Container).html(`<div class="ebsp-container" id="ebsp-container-${this.uniq}">
            <div class="ebsp-container-inner">
                <div class="ebsp-signature-pane">
                    <canvas class="ebsp-signature-canvas" id="ebsp-signature-canvas-${this.uniq}">

                    </canvas>
                </div>
                <div class="ebsp-btn-pane">
                    <button class="ebsp-btn" id="ebsp-clear-${this.uniq}">Reset</button>
                    <button class="ebsp-btn" id="ebsp-ok-${this.uniq}">Ok</button>
                </div>
            </div>
        </div>`);
        this.$c = $(`#ebsp-container-${this.uniq}`);
        this.canvas = $(`#ebsp-signature-canvas-${this.uniq}`);

        this.enableSign();//enable signature
        $(`#ebsp-clear-${this.uniq}`).off("click").on("click", this.clearSignature.bind(this));
        $(`#ebsp-ok-${this.uniq}`).off("click").on("click", this.saveSignature.bind(this));
    }

    enableSign() {
        var ctx = this.canvas[0].getContext('2d');
        SetDisplayXSize(500);
        SetDisplayYSize(100);
        SetTabletState(0, this.tmr);
        SetJustifyMode(0);
        ClearTablet();
        if (this.tmr === null) {
            this.tmr = SetTabletState(1, ctx, 50);//lib func
        }
        else {
            SetTabletState(0, this.tmr);
            this.tmr = null;
            this.tmr = SetTabletState(1, ctx, 50);
        }
    }

    clearSignature(evt) {
        this.b64Result = null;
        this.vendorResult = null;
        ClearTablet();
        this.enableSign();
    }

    saveSignature(evt) {
        if (NumberOfTabletPoints() === 0) {
            this.enableSign();
        }
        else {
            SetTabletState(0, this.tmr);
            //RETURN TOPAZ-FORMAT SIGSTRING
            SetSigCompressionMode(1);
            this.vendorResult = GetSigString();

            //RETURN BMP BYTE ARRAY CONVERTED TO BASE64 STRING
            SetImageXSize(500);
            SetImageYSize(100);
            SetImagePenWidth(5);
            GetSigImageB64(this.setB64Result.bind(this));
        }
    }

    setB64Result(b64str) {
        this.b64Result = b64str;
        return this.getResult(this.b64Result, this.vendorResult);
    }
};