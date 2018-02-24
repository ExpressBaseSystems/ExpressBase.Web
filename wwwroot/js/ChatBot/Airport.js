var Airport = function () {
    this.CurLoc = null;
    this.nearest5Airports = [];
    this.nearestAirport = [];
    this.airports = [];

    this.SetCurLoc = function (loc) {
        this.CurLoc = loc;

        this.NearestCity(this.CurLoc.latitude, this.CurLoc.longitude);
        this.FiveNearestCity(this.CurLoc.latitude, this.CurLoc.longitude);
    };

    this.FiveNearestCity = function (latitude, longitude) {
        var mindif = 99999;
        var myArray = [];
        for (index = 0; index < this.airports.length; ++index) {
            var dif = this.PythagorasEquirectangular(latitude, longitude, this.airports[index].lat, this.airports[index].lng);
            myArray.push({ i: index, d: dif });
        }
        myArray.sort(this.compare);
        for (k = 1; k < 6; k++)
            this.nearest5Airports.push(this.airports[myArray[k].i].name);

    }

    this.compare = function(a, b) {
        if (a.d < b.d)
            return -1;
        if (a.d > b.d)
            return 1;
        return 0;
    }

    // Callback function for asynchronous call to HTML5 geolocation
    // Convert Degress to Radians
    this.Deg2Rad = function(deg) {
        return deg * Math.PI / 180;
    }

    this.PythagorasEquirectangular = function(lat1, lon1, lat2, lon2) {
        lat1 = this.Deg2Rad(lat1);
        lat2 = this.Deg2Rad(lat2);
        lon1 = this.Deg2Rad(lon1);
        lon2 = this.Deg2Rad(lon2);
        var R = 6371; // km
        var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
        var y = (lat2 - lat1);
        var d = Math.sqrt(x * x + y * y) * R;
        return d;
    }

    this.NearestCity = function(latitude, longitude) {
        var mindif = 99999;
        var closest;
        for (index = 0; index < this.airports.length; ++index) {
            var dif = this.PythagorasEquirectangular(latitude, longitude, this.airports[index].lat, this.airports[index].lng);
            if (dif < mindif) {
                closest = index;
                mindif = dif;
            }
        }
        // echo the nearest city
        this.nearestAirport = (this.airports[closest].name);
    }
};






