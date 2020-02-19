
var SpeedoMeterWrapper = function (option, ref) {
    this.GaugeValue = option.GaugeValue ? option.GaugeValue : Math.floor(Math.random() * 10) * Math.floor(Math.random() * 10);

    google.charts.load('current', { 'packages': ['gauge'] });
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {

        var data = google.visualization.arrayToDataTable([
            ['Label', 'Value'],
            ['Rank', this.GaugeValue]
        ]);
        var options = {
            width: $(`#${option.EbSid}`).height(),
            height: $(`#${option.EbSid}`).height(),
            redFrom: 0,
            redTo: 10,
            yellowFrom: 10,
            yellowTo: 15,
            greenFrom: 15,
            greenTo: 20,
            minorTicks: 20,
            max: 20,
            min: 0,
            majorTicks: ['20', '1']
        };

        var chart = new google.visualization.Gauge(document.getElementById(option.EbSid));
        chart.draw(data, options);

    }
}