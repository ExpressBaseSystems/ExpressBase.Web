﻿function ShadowPickerJs(option) {
    var current_id = option.Id;
    var current_value = option.Value;
    this.Horizontal =  0;
    this.Vertical = 0;
    this.Blur = 0;
    this.Spread = 0;
    var colorcode = "#000000";
    this.opacity = 20;
    var Obj = {};
    if (current_value) {
        var extracted_val = current_value.split("px");
        this.Horizontal = extracted_val[0];
        this.Vertical = extracted_val[1];
        this.Blur = extracted_val[2];
        this.Spread = extracted_val[3];
        var extract_Color = extracted_val[4].split(",");
        this.Red = extract_Color[0].split("(")[1];
        this.Green = extract_Color[1];
        this.Blue = extract_Color[2];
        this.opacity = extract_Color[3].split(")")[0] * 100;
        colorcode = "rgba(" + this.Red + "," + this.Green + "," + this.Blue + ",0)";
        let hexTemp = rgba2hex(colorcode);
        this.Color = "#" + hexTemp.substring(0, hexTemp.length - 2);
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
    }

    $(`#${current_id}`).append(`
        <div class="shadow-picker-outer">
        <div class="ctrl-side">
        <div class="color-selector"><label> Shadow Color : </label><input id="${current_id}_shadow-color" type="color" class="color_input_id"  /></div>
        <div class="slider-outer"> <div class="slider-text">Horizontal</div><div id="${current_id}_horizontal-slider" class='slider'>
        <div id="${current_id}_horizontal-handle" class="ui-slider-handle custom-handle"></div></div></div>
        <div class="slider-outer"> <div class="slider-text">vertical</div> <div id="${current_id}_vertical-slider" class='slider'>
        <div id="${current_id}_vertical-handle" class="ui-slider-handle"></div></div></div>
        <div class="slider-outer"><div class="slider-text">Blur Radius</div> <div id="${current_id}_blur-slider" class='slider'>
        <div id="${current_id}_blur-handle" class="ui-slider-handle"></div></div></div>
        <div class="slider-outer"><div class="slider-text">Opacity</div> <div id="${current_id}_opacity-slider" class='slider'>
        <div id="${current_id}_opacity-handle" class="ui-slider-handle"></div></div></div>
        <div class="slider-outer"> <div class="slider-text">Spread Radius</div> <div id="${current_id}_spread-slider" class='slider'>
        <div id="${current_id}_spread-handle" class="ui-slider-handle"></div></div></div>
        </div>
        <div class="shadow-bg"> 
        <div class="shadow-div"  id="${current_id}_shadow_div" >  <input id="${current_id}_val" class="shadowVal" value="${this.Color}" placeholder="box-shadow"></div>
        </div> 
    </div>
    `);

    this.Color = $(`#${current_id}_shadow-color`).val(this.Color);

    $(`#${current_id}_horizontal-slider`).slider({
        range: "max",
        min: -50,
        max: 50,
        value: this.Horizontal,
        create: function () { $(`#${current_id}_horizontal-handle`).text($(this).slider("value")); },
        slide: function (event, ui) {
            $(`#${current_id}_horizontal-handle`).text(ui.value);
            this.Horizontal = ui.value;
            this.ShadowGenerate();
        }.bind(this),
        change: function (event, ui) { this.Horizontal = ui.value; this.ShadowGenerate(); }.bind(this)
    });

    $(`#${current_id}_vertical-slider`).slider({
        range: "max",
        min: -50,
        max: 50,
        value: this.Vertical,
        create: function () {
            $(`#${current_id}_vertical-handle`).text($(this).slider("value"));
        },
        slide: function (event, ui) {
            $(`#${current_id}_vertical-handle`).text(ui.value);
            this.Vertical = ui.value;
            this.ShadowGenerate()
        }.bind(this),
        change: function (event, ui) { this.vertical = ui.value; this.ShadowGenerate(); }.bind(this)
    });

    $(`#${current_id}_blur-slider`).slider({
        range: "max",
        min: -50,
        max: 50,
        value: this.Blur,
        create: function () {
            $(`#${current_id}_blur-handle`).text($(this).slider("value"));
        },
        slide: function (event, ui) {
            $(`#${current_id}_blur-handle`).text(ui.value);
            this.Blur = ui.value;
            this.ShadowGenerate()
        }.bind(this),
        change: function (event, ui) { this.Blur = ui.value; this.ShadowGenerate(); }.bind(this)
    });

    $(`#${current_id}_spread-slider`).slider({
        range: "max",
        min: -50,
        max: 50,
        value: this.Spread,
        create: function () {
            $(`#${current_id}_spread-handle`).text($(this).slider("value"));
        },
        slide: function (event, ui) {
            $(`#${current_id}_spread-handle`).text(ui.value);
            this.Spread = ui.value;
            this.ShadowGenerate();
        }.bind(this),
        change: function (event, ui) { this.Spread = ui.value; this.ShadowGenerate(); }.bind(this)
    });

    $(`#${current_id}_opacity-slider`).slider({
        range: "max",
        min: 0,
        max: 100,
        value: this.opacity,
        create: function () {
            $(`#${current_id}_opacity-handle`).text($(this).slider("value"));
        },
        slide: function (event, ui) {
            $(`#${current_id}_opacity-handle`).text(ui.value);
            this.opacity = ui.value;
            this.ShadowGenerate();
        }.bind(this),
        change: function (event, ui) { this.opacity = ui.value; this.ShadowGenerate(); }.bind(this)
    });

    this.ShadowGenerate = function () {
        this.Color = $(`#${current_id}_shadow-color`).val();
        var opacity = this.opacity / 100;
        var rgbaCol = 'rgba(' + parseInt(this.Color.slice(-6, -4), 16) + ',' + parseInt(this.Color.slice(-4, -2), 16) + ',' + parseInt(this.Color.slice(-2), 16) + ',' + opacity + ')';
        $(`#${current_id}_shadow-color`).css("background", rgbaCol);
        Obj.boxshadow = `${this.Horizontal}px ${this.Vertical}px ${this.Blur}px ${this.Spread}px ${rgbaCol}`;
        $(`#${current_id}_val`).val(Obj.boxshadow);
        $(`#${current_id}_shadow_div`).css("-webkit-box-shadow", `${Obj.boxshadow}`);
        $(`#${current_id}_shadow_div`).css("-moz-box-shadow", `${Obj.boxshadow}`);
        $(`#${current_id}_shadow_div`).css("box-shadow", `${Obj.boxshadow}`);
    };


    this.init = function () {
        $(`#${current_id}_shadow-color`).off("change").on("change", this.ShadowGenerate.bind(this));
        this.ShadowGenerate();
    };
    this.init();
}



//// Simple example, see optional options for more configuration.
//const pickr = Pickr.create({
//    el: '.color-picker',
//    theme: 'classic', // or 'monolith', or 'nano'

//    swatches: [
//        'rgba(244, 67, 54, 1)',
//        'rgba(233, 30, 99, 0.95)',
//        'rgba(156, 39, 176, 0.9)',
//        'rgba(103, 58, 183, 0.85)',
//        'rgba(63, 81, 181, 0.8)',
//        'rgba(33, 150, 243, 0.75)',
//        'rgba(3, 169, 244, 0.7)',
//        'rgba(0, 188, 212, 0.7)',
//        'rgba(0, 150, 136, 0.75)',
//        'rgba(76, 175, 80, 0.8)',
//        'rgba(139, 195, 74, 0.85)',
//        'rgba(205, 220, 57, 0.9)',
//        'rgba(255, 235, 59, 0.95)',
//        'rgba(255, 193, 7, 1)'
//    ],

//    components: {

//        // Main components
//        preview: true,
//        opacity: true,
//        hue: true,

//        // Input / output Options
//        interaction: {
//            hex: true,
//            rgba: true,
//            hsla: true,
//            hsva: true,
//            cmyk: true,
//            input: true,
//            clear: true,
//            save: true
//        }
//    }
//})