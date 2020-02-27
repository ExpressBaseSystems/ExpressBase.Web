
var opts;
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var EbGaugeWrapper = function (option, ref) {
    var back = ["#ff0000", "blue", "gray"];
    var rand = back[Math.floor(Math.random() * back.length)];
    var LabelFont = option.LabelFont ? GetFontCss(option.LabelFont) : "";
    var ValueFont = option.ValueFont ? GetFontCss(option.ValueFont) : "";
    $("#" + option.EbSid).empty().append(`<canvas id="${option.EbSid}_canvas" class="gauge_canvas"></canvas>
            <div class="label_value" style="${ValueFont} left:${option.ValuePosition.Left}%; top:${option.ValuePosition.Top}%">
            <span  class="gauge_text" id="${option.EbSid}_text"></span>
            <span>${option.ValueText}</span>
            </div>
            <span  class="gauge_Name" id="${option.EbSid}_Name" style=" position:absolute ; ${LabelFont} left:${option.LabelPosition.Left}%; top:${option.LabelPosition.Top}%">
                ${option.LabelName}</span>
            `);
    let Config = option.GaugeConfig;
    let Pointer = option.Pointer;
    let Ticks = option.TicksConfig;
    this.container = Config.GaugeContainer ? Config.GaugeContainer + "_canvas" : option.EbSid + "_canvas";
    this.value = Config.GaugeValue ? Config.GaugeValue : Math.floor(Math.random() * 10);
    this.colorStart = Config.ColorStart ? Config.ColorStart : getRandomColor();
    this.colorStop = Config.ColorStop ? Config.ColorStop : getRandomColor();
    this.strokeColor = Config.StrokeColor ? Config.StrokeColor : getRandomColor();

    this.RenderTicks = option.RenderTicks;
    this.PointerConfig = option.PointerConfig;
    this.LimitMax = option.LimitMax;
    this.LimitMin = option.LimitMin;

    this.angle = Config.Angle ? Config.Angle / 100 : 0;
    this.RadiusScale = Config.RadiusScale ? Config.RadiusScale / 100 : 1;
    this.lineWidth = Config.LineWidth ? Config.LineWidth / 100 : 0.16;


    if (!ref.isEdit) {
        opts = {
            angle: 0, // The span of the gauge arc
            lineWidth: 0.33, // The line thickness
            radiusScale: 0.99, // Relative radius
            pointer: {
                length: 0.48, // // Relative to gauge radius
                strokeWidth: 0.053, // The thickness
                color: '#000000' // Fill color
            },
            limitMax: false,     // If false, max value increases automatically if value > maxValue
            limitMin: false,     // If true, the min value of the gauge will be fixed
            colorStart: '#6FADCF',   // Colors
            colorStop: '#8FC0DA',    // just experiment with them
            strokeColor: '#E0E0E0',  // to see which ones work best for you
            generateGradient: true,
            highDpiSupport: true,     // High resolution support

        };
        var target = document.getElementById(`${option.EbSid}_canvas`); // your canvas element
        var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
        gauge.maxValue = 3000; // set max gauge value
        gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
        gauge.animationSpeed = 32; // set animation speed (32 is default value)
        gauge.set(1250);
    }
    else {
        opts = {
            angle: this.angle, // The span of the gauge arc
            lineWidth: this.lineWidth, // The line thickness
            radiusScale: this.RadiusScale, // Relative radius
            limitMax: false, // If true, the pointer will not go past the end of the gauge
            limitMin: false,  // If true, the min value of the gauge will be fixed
            colorStart: this.colorStart,   // Colors
            colorStop: this.colorStop,    // just experiment with them
            strokeColor: this.strokeColor, // to see which ones work best for you
            generateGradient: true,
            highDpiSupport: true,

            //staticZones: [
            //    { strokeStyle: "#d30000", min: 1, max: 5 },
            //    { strokeStyle: "#f6db2d", min: 5, max: 10 },
            //    { strokeStyle: "#f6db2d", min: 10, max: 15 },
            //    { strokeStyle: "#f6db2d", min: 15, max: 20 },
            //    { strokeStyle: "#f6db2d", min: 20, max: 25 },
            //    { strokeStyle: "#f6db2d", min: 25, max: 40 },
            //    { strokeStyle: "#3eea34", min: 40, max: 45 },
            //    { strokeStyle: "#3eea34", min: 45, max: 50 },
            //    { strokeStyle: "#3eea34", min: 50, max: 55 },
            //    { strokeStyle: "#3eea34", min: 55, max: 60 },
            //    { strokeStyle: "#45caff", min: 60, max: 65 },
            //    { strokeStyle: "#45caff", min: 65, max: 70 }
            //],
        };

        //Pointer
        if (option.PointerConfig) {
            opts.pointer = {
                length: Pointer.PointerLength / 100,
                strokeWidth: Pointer.PointerStrokeWidth / 100,
                color: Pointer.PointerColor
            }
        }
        else {
            opts.pointer = {
                length: 0,
                strokeWidth: 0,
                color: "#fff"
            }
        }

        //Digit COnfig
        if (option.DigitPointConfig) {
            let labelArr = [option.MinValue];
            let abc = (option.MaxValue - option.MinValue) / option.DigitPointConfig.DigitCount;
            for (let i = 1; i < option.DigitPointConfig.DigitCount; i++) {
                labelArr.push(i * abc);
            }
            labelArr.push(option.MaxValue);
            if (option.RenderDigitPoints) {
                opts.staticLabels = {
                    font: `${option.DigitPointConfig.DigitFontSize}px sans-serif`,
                    labels: labelArr,
                    color: `${option.DigitPointConfig.DigitFontColor}`,
                    fractionDigits: option.DigitPointConfig.FractionalDigit
                }
            }
            else {
                opts.staticLabels = {
                    font: "0px sans-serif",
                    labels: [],
                    color: "#000000",
                    fractionDigits: 0
                }
            }
        }

        if (option.RenderTicks) {
            opts.renderTicks = {
                divisions: Ticks.Divisions,
                divWidth: Ticks.DivWidth / 10,
                divLength: Ticks.DivLength / 100,
                divColor: Ticks.DivColor,
                subDivisions: Ticks.SubDivisions,
                subLength: Ticks.SubLength / 100,
                subWidth: Ticks.SubWidth / 10,
                subColor: Ticks.SubColor,
            }
        }
        var target = document.getElementById(`${option.EbSid}_canvas`);
        //var target = $("#" + this.container);
        //target.gauge(opts);

        // your canvas element
        var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
        gauge.maxValue = option.MaxValue; // set max gauge value
        gauge.setMinValue(option.MinValue);  // Prefer setter over gauge.minValue = 0
        gauge.animationSpeed = 32; // set animation speed (32 is default value)
        gauge.set(this.value);
        gauge.setTextField(document.getElementById(`${option.EbSid}_text`));

    }
}

//$.fn.gauge = function (opts) {
//    this.each(function () {
//        var $this = $(this),
//            data_gauge = $this.data();

//        if (data_gauge.gauge) {
//            data_gauge.gauge.stop();
//            delete data.gauge;
//        }
//        if (opts !== false) {
//            data_gauge.gauge = new Gauge(this).setOptions(opts);
//            data_gauge.gauge.maxValue = 70; // set max gauge value
//            data_gauge.gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
//            data_gauge.gauge.animationSpeed = 32; // set animation speed (32 is default value)
//            data_gauge.gauge.set(this.value);
//            //data.gauge.setTextField(document.getElementById(`${option.GaugeContainer}_text`));
//        }
//    });
//    return this;
//};