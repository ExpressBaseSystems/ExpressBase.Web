
var EbGaugeWrapper = function (option) {
    this.container = option.container;
    this.value = option.value;
    {
        //billiboards.......
        //this.chart = bb.generate({
        //    data: {
        //        columns: [
        //            ["data", this.value]
        //        ],
        //        type: "gauge"
        //    },
        //    gauge: {
        //        max: 100,
        //        label: {
        //            format: function (value, ratio) { return value; }
        //        }
        //    },
        //    color: {
        //        pattern: [
        //            "#FF0000",
        //            "#F97600",
        //            "#F6C600",
        //            "#60B044"
        //        ],
        //        threshold: {
        //            values: [
        //                30,
        //                60,
        //                90,
        //                100
        //            ]
        //        }
        //    },
        //    size: {
        //        height: 180
        //    },
        //    bindto: "#" + this.container
        //});
    }
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
        var opts = {
            angle: -0.19, // The span of the gauge arc
            lineWidth: 0.11, // The line thickness
            radiusScale: 0.5, // Relative radius
            pointer: {
                length: 0.01, // // Relative to gauge radius
                strokeWidth: 0.035, // The thickness
                color: '#FFFCFA' // Fill color
            },
            staticLabels: {
                font: "10px sans-serif",  // Specifies font
                labels: [0, 3000],  // Print labels at these values
                color: "#000000",  // Optional: Label text color
                fractionDigits: 0  // Optional: Numerical precision. 0=round off.
            },
            limitMax: false,     // If false, max value increases automatically if value > maxValue
            limitMin: false,     // If true, the min value of the gauge will be fixed
            colorStart: '#18eaff',   // Colors
            colorStop: '#8FC0DA',    // just experiment with them
            strokeColor: '#E0E0E0',  // to see which ones work best for you
            generateGradient: true,
            highDpiSupport: true,     // High resolution support

        };
        var target = document.getElementById(this.container); // your canvas element
        var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
        gauge.maxValue = 100; // set max gauge value
        gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
        gauge.animationSpeed = 32; // set animation speed (32 is default value)
        gauge.set(this.value); // set actual value
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