
var EbGaugeWrapper = function (option) {
    this.container = option.container;
    this.value = option.value;

    this.chart = bb.generate({
        data: {
            columns: [
                ["data", this.value]
            ],
            type: "gauge"
        },
        gauge: {
            max: 100,
            label: {
                format: function (value, ratio) { return value; }
            }
        },
        color: {
            pattern: [
                "#FF0000",
                "#F97600",
                "#F6C600",
                "#60B044"
            ],
            threshold: {
                values: [
                    30,
                    60,
                    90,
                    100
                ]
            }
        },
        size: {
            height: 180
        },
        bindto: "#" + this.container
    });
};


//setTimeout(function () {
//    chart.load({
//        columns: [["data", 10]]
//    });
//}, 1000);

//setTimeout(function () {
//    chart.load({
//        columns: [["data", 50]]
//    });
//}, 2000);

//setTimeout(function () {
//    chart.load({
//        columns: [["data", 70]]
//    });
//}, 3000);

//setTimeout(function () {
//    chart.load({
//        columns: [["data", 0]]
//    });
//}, 4000);

//setTimeout(function () {
//    chart.load({
//        columns: [["data", 100]]
//    });
//}, 5000);