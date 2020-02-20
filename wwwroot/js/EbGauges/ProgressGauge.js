
var opts;
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var ProgressGaugeWrapper = function (option, ref) {
    this.EbSid = option.EbSid;
    this.GaugeValue = option.GaugeValue;
    this.GaugeContainer = option.GaugeContainer;
    this.Color = option.Color;
    this.Gradient = option.Gradient;
    this.Color2 = option.Color2;
    this.StartAngle = option.StartAngle == 0 ? -150 : option.StartAngle;
    this.EndAngle = option.EndAngle == 0 ? 150 : option.EndAngle;
    this.Hollow = option.Hollow;
    this.HollowMargin = option.HollowMargin
    this.HollowSize = option.HollowSize == 0 ? 72 + "%" : option.HollowSize + "%";
    this.HollowColor = option.HollowColor;
    this.DropShadow = option.DropShadow;
    this.TrackBgColor = option.TrackBgColor;
    this.Left = option.Left;
    this.Top = option.Top;
    this.Blur = option.Blur;
    this.Opacity = option.Opacity;
    this.LineCap = option.LineCap;
    this.GaugeName = option.GaugeName;
    this.NameOffsetY = option.NameOffsetY;
    this.NameColor = option.NameColor;
    this.NameFontSize = option.NameFontSize;
    this.ValueFontSize = option.ValueFontSize;
    this.ValueColor = option.ValueColor;
    this.ValueUnit = option.ValueUnit;
    $(`#${option.EbSid}`).empty();
    this.GaugeValue = option.GaugeValue ? option.GaugeValue : Math.floor(Math.random() * 10) * Math.floor(Math.random() * 10);
    var options = {
        chart: {
            height: $(`#${option.EbSid}`).height() +  10,
            type: "radialBar",
        },

        series: [this.GaugeValue],
        colors: [this.Color],
        plotOptions: {
            radialBar: {
                startAngle: this.StartAngle,
                endAngle: this.EndAngle,
                hollow: {
                    margin: 0,
                    size: this.HollowSize,
                    background: this.HollowColor 
                },
                track: {
                    background: this.TrackBgColor ,
                    dropShadow: {
                        enabled: true,
                        top: this.Top,
                        left: this.Left,
                        blur: this.Blur,
                        opacity: this.Opacity / 100
                    }
                },
                dataLabels: {
                    name: {
                        offsetY: -10,
                        color: "#fff",
                        fontSize: "14px"
                    },
                    value: {
                        color: "#fff",
                        fontSize: "30px",
                        show: true,
                        formatter: function (val) {
                            return val + '%'
                        }
                    }
                }
            }
        },
        fill: {
            type: "gradient",
            gradient: {
                shade: "dark",
                type: "vertical",
                gradientToColors: [this.Color2],
                stops: [0, 100]
            }
        },
        stroke: {
            lineCap: "round"
        },
        labels: [this.GaugeName]
    };

    var Progresschart = new ApexCharts(document.querySelector(`#${option.EbSid}`), options);

    var a = Progresschart.render();

}
