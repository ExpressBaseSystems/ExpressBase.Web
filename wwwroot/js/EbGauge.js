
var opts;
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var EbGaugeWrapper = function (option) {
    var back = ["#ff0000", "blue", "gray"];
    var rand = back[Math.floor(Math.random() * back.length)];
    $("#" + option.GaugeContainer).empty().append(`<canvas id="${option.GaugeContainer}_canvas" class="gauge_canvas"></canvas>`);
    this.container = option.GaugeContainer + "_canvas";
    this.value = option.GaugeValue ? option.GaugeValue : Math.floor(Math.random() * 10); 
    this.colorStart = option.ColorStart ? option.ColorStart : getRandomColor();
    this.colorStop = option.ColorStop ? option.ColorStop : getRandomColor();
    this.strokeColor = option.StrokeColor ? option.StrokeColor : getRandomColor();
    this.pointerLength = option.PointerLength;
    this.pointerStrokeWidth = option.PointerStrokeWidth;
    this.pointerColor = option.PointerColor ? option.PointerColor : getRandomColor();   
    this.angle = option.Angle;
    this.lineWidth = option.LineWidth;
    {
        //recogizer
        //let element = document.querySelector('#' + this.container);

        //// Properties of the gauge
        //let gaugeOptions = {
        //    hasNeedle: true,
        //    needleColor: 'gray',
        //    needleUpdateSpeed: 1000,
        //    arcColors: ['rgb(44, 151, 222)', 'lightgray'],
        //    arcDelimiters: [50],
        //    rangeLabel: ['0', '100'],
        //    centralLabel: this.value
        //};

        //// Drawing and updating the chart
        //GaugeChart.gaugeChart(element, 300, gaugeOptions).updateNeedle(this.value);
    }
    {
        //gauge.cofee
         opts = {
            angle: 0, // The span of the gauge arc
            lineWidth: 0.16, // The line thickness
            radiusScale: 1, // Relative radius
            pointer: {
                length: 0.41, // // Relative to gauge radius
                strokeWidth: 0.055, // The thickness
                color: this.pointerColor // Fill color
            },
            limitMax: false,     // If true, the pointer will not go past the end of the gauge
            colorStart: this.colorStart,   // Colors
            colorStop: this.colorStop ,    // just experiment with them
            strokeColor: this.strokeColor,
            // to see which ones work best for you
            generateGradient: true,
            highDpiSupport: true,   // High resolution support
            renderTicks: {
                divisions: 2,
                divWidth: 1.3,
                divLength: 1,
                divColor: '#331407',
                subDivisions: 5,
                subLength: 0.3,
                subWidth: 1.8,
                subColor: '#666666'
            },
            //staticLabels: {
            //    font: "10px sans-serif",  // Specifies font
            //    labels: [0,50,100,150,200,250,300],  // Print labels at these values
            //    color: "#000000",  // Optional: Label text color
            //    fractionDigits: 0  // Optional: Numerical precision. 0=round off.
            //},
            //staticZones: [      
            //    { strokeStyle: "#FFDD00", min: 0, max: 150 }, // Yellow
            //    { strokeStyle: "#30B32D", min: 150, max: 220 }, // Green
            //    { strokeStyle: "blue", min: 220, max: 260 }, // Yellow
            //    { strokeStyle: "#F03E3E", min: 260, max: 300 },  // Red
            //    { strokeStyle: "rgb(80,80,80)", min: 2470, max: 2530, height: 1.3 }
            //],
        };
        console.log(document.getElementById('maxVal').textContent);
        var target = document.getElementById(this.container); // your canvas element
        var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
        gauge.maxValue = 30; // set max gauge value
        gauge.animationSpeed = 28; // set animation speed (32 is default value)
        gauge.set(this.value);
        gauge.setTextField(document.getElementById("preview-textfield"));
        percentColors = [[0.0, "#a9d70b"], [0.50, "#f9c802"], [1.0, "#ff0000"]];
    }
    {
        //var myGauge = Gauge(document.getElementById(this.container), {
        //    dialRadius: 40,
        //    dialStartAngle: 135,
        //    dialEndAngle: 45,
        //    value: 50,
        //    max: 100,
        //    min: 0,
        //    valueDialClass: "value",
        //    valueClass: "value-text",
        //    dialClass: "dial",
        //    gaugeClass: "gauge",
        //    showValue: true,
        //    gaugeColor: null,
        //    label: function (val) { return Math.round(val); } // returns a string label that will be rendered in the center
        //});
    }
};