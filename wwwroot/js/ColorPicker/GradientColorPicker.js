
var GradientColorPicker = function (option) {
    var current_id = option.Id;
    var current_value = option.Value ? option.Value : "linear-gradient(90deg, rgba(0, 64, 0, 0.97), rgba(0, 128, 64, 0.98))";
    this.opacity1 = 100;
    this.opacity2 = 100;
    this.Color1 = "#ffffff";
    this.Color2 = "#000000";
    this.degree = "90";
    this.Rgb1 = current_value.split("(")[2].split(")")[0];
    this.Rgb2 = current_value.split("(")[3].split(")")[0];
    this.Rgb1Obj = {};
    this.Rgb2Obj = {};
    rgbvalue2hex1();
    rgbvalue2hex2();
    function rgbvalue2hex1() {
        var extract_Color1 = this.Rgb1.split(",");
        this.Red1 = extract_Color1[0];
        this.Green1 = extract_Color1[1];
        this.Blue1 = extract_Color1[2];
        this.opacity1 = extract_Color1[3] * 100;
        let colorcode1 = "rgba(" + this.Red1 + "," + this.Green1 + "," + this.Blue1 + ",0)";
        let hexTemp1 = rgba2hex(colorcode1);
        this.Color1 = "#" + hexTemp1.substring(0, hexTemp1.length - 2);
    }
    function rgbvalue2hex2() {
        var extract_Color2 = this.Rgb2.split(",");
        this.Red2 = extract_Color2[0];
        this.Green2 = extract_Color2[1];
        this.Blue2 = extract_Color2[2];
        this.opacity2 = extract_Color2[3] * 100;
        let colorcode2 = "rgba(" + this.Red2 + "," + this.Green2 + "," + this.Blue2 + ",0)";
        let hexTemp2 = rgba2hex(colorcode2);
        this.Color2 = "#" + hexTemp2.substring(0, hexTemp2.length - 2);
    }

    function rgba2hex(orig) {
        var a, isPercent,
            rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
            alpha = (rgb && rgb[4] || "").trim(),
            hex = rgb ?
                (rgb[1] | 1 << 8).toString(16).slice(1) +
                (rgb[2] | 1 << 8).toString(16).slice(1) +
                (rgb[3] | 1 << 8).toString(16).slice(1) : orig;
        if (alpha !== "") {
            a = alpha;
        } else {
            a = 01;
        }

        a = Math.round(a * 100) / 100;
        var alpha = Math.round(a * 255);
        var hexAlpha = (alpha + 0x10000).toString(16).substr(-2).toUpperCase();
        hex = hex + hexAlpha;
        return hex;
    }

    $(`#${current_id}`).append(`
        <div class="gradient-picker-outer">
    <div class="gd-display" id="${current_id}_gd_dis"> </div>
    <div class="colors-gradient">
        <div class="gd-clr-inner">
            <div class="clr-outer"><input class="color-pick" type="color" id="${current_id}_color1" value="${this.Color1}" /> <input class="display-clr-txt" type="text" id="${current_id}_clr1"></div>
            <div id="${current_id}_color1_opacity" class="color-div-outer">
                <div class="slider-outer">
                    <div class="slider-text">Opacity</div> <div id="${current_id}_opacity1" class='slider'>
                        <div id="${current_id}_opacity1-handle" class="ui-slider-handle"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="gd-clr-inner">
            <div class="clr-outer"><input class="color-pick" type="color" id="${current_id}_color2" value="${this.Color2}"/> <input class="display-clr-txt" type="text" id="${current_id}_clr2"></div>
            <div id="${current_id}_color2_opacity" class="color-div-outer">
                <div class="slider-outer">
                    <div class="slider-text">Opacity</div> <div id="${current_id}_opacity2" class='slider'>
                        <div id="${current_id}_opacity2-handle" class="ui-slider-handle"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
<div class="gd_val_dis"> <div> Gradient : </div><input type="text" id="${current_id}_val"/> </div>
    <div class="gd-degree">
        <div class="slider-outer">
                    <div class="slider-text">degree</div> <div id="${current_id}_deg" class='slider'>
                        <div id="${current_id}_deg-handle" class="ui-slider-handle"></div>
                    </div>
                </div>
    </div>
</div>
    `);

    this.applySlider1Bg = function () {
        this.Color1 = $(`#${current_id}_color1`).val();
        var rgba1 = 'rgba(' + parseInt(this.Color1.slice(-6, -4), 16) + ',' + parseInt(this.Color1.slice(-4, -2), 16) + ',' + parseInt(this.Color1.slice(-2), 16) + ',' + "1" + ')';
        var rgba2 = 'rgba(' + parseInt(this.Color1.slice(-6, -4), 16) + ',' + parseInt(this.Color1.slice(-4, -2), 16) + ',' + parseInt(this.Color1.slice(-2), 16) + ',' + "0" + ')';
        let bg = "linear-gradient(" + "-90" + "deg," + rgba1 + "," + rgba2 + ")";
        $(`#${current_id}_opacity1`).css("background-image", bg);
    };
    this.applySlider2Bg = function () {
        this.Color2 = $(`#${current_id}_color2`).val();
        var rgbaCol1 = 'rgba(' + parseInt(this.Color2.slice(-6, -4), 16) + ',' + parseInt(this.Color2.slice(-4, -2), 16) + ',' + parseInt(this.Color2.slice(-2), 16) + ',' + "1" + ')';
        var rgbaCol2 = 'rgba(' + parseInt(this.Color2.slice(-6, -4), 16) + ',' + parseInt(this.Color2.slice(-4, -2), 16) + ',' + parseInt(this.Color2.slice(-2), 16) + ',' + "0" + ')';
        let bg = "linear-gradient(" + "-90" + "deg," + rgbaCol1 + "," + rgbaCol2 + ")";
        $(`#${current_id}_opacity2`).css("background-image", bg);
    };
    $(`#${current_id}_opacity1`).slider({
        range: "max",
        min: 0,
        max: 100,
        value: this.opacity1,
        create: function () {
            $(`#${current_id}_opacity1-handle`).text($(this).slider("value"));
        },
        slide: function (event, ui) {
            $(`#${current_id}_opacity1-handle`).text(ui.value);
            this.opacity1 = ui.value;
            this.gradient();
        }.bind(this),
        change: function (event, ui) { this.opacity1 = ui.value; this.gradient(); }.bind(this)
    });

    $(`#${current_id}_opacity2`).slider({
        range: "max",
        min: 0,
        max: 100,
        value: this.opacity2,
        create: function () {
            $(`#${current_id}_opacity2-handle`).text($(this).slider("value"));
        },
        slide: function (event, ui) {
            $(`#${current_id}_opacity2-handle`).text(ui.value);
            this.opacity2 = ui.value;
            this.gradient();
        }.bind(this),
        change: function (event, ui) { this.opacity2 = ui.value; this.gradient(); }.bind(this)
    });

    $(`#${current_id}_deg`).slider({
        range: "max",
        min: -180,
        max: 180,
        value: 90,
        create: function () {
            $(`#${current_id}_deg-handle`).text($(this).slider("value"));
        },
        slide: function (event, ui) {
            $(`#${current_id}_deg-handle`).text(ui.value);
            this.degree = ui.value;
            this.gradient()
        }.bind(this),
        change: function (event, ui) { this.degree = ui.value; this.gradient() }.bind(this)
    });

    this.gradient = function () {
        this.Color1 = $(`#${current_id}_color1`).val();
        var opacity1 = this.opacity1 / 100;
        var rgbaCol1 = 'rgba(' + parseInt(this.Color1.slice(-6, -4), 16) + ',' + parseInt(this.Color1.slice(-4, -2), 16) + ',' + parseInt(this.Color1.slice(-2), 16) + ',' + opacity1 + ')';
        this.Color2 = $(`#${current_id}_color2`).val();
        var opacity2 = this.opacity2 / 100;
        var rgbaCol2 = 'rgba(' + parseInt(this.Color2.slice(-6, -4), 16) + ',' + parseInt(this.Color2.slice(-4, -2), 16) + ',' + parseInt(this.Color2.slice(-2), 16) + ',' + opacity2 + ')';
        let bg = "linear-gradient(" + this.degree + "deg," + rgbaCol1 + "," + rgbaCol2 + ")";
        $(`#${current_id}_gd_dis`).css("background-image", bg);
        this.applySlider1Bg();
        this.applySlider2Bg();
        $(`#${current_id}_val`).val(bg);
        $(`#${current_id}_clr1`).val(rgbaCol1);
        $(`#${current_id}_clr2`).val(rgbaCol2);
    }
    this.gradient();
    this.init = function () {
        $(".color-pick").on("change", this.gradient.bind(this));
    };
    this.init();
}
