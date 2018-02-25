var PortList = [{ "name": "Antalya", "city": "Antalya", "country": "Turkey", "timezone": "Europe/Istanbul", "lat": 36.898731, "lng": 30.800461, "terminal": null, "gate": null, "iatacode": "AYT", "icaocode": "LTAI" },
{ "name": "Adana", "city": "Adana", "country": "Turkey", "timezone": "Europe/Istanbul", "lat": 36.982166, "lng": 35.280388, "terminal": null, "gate": null, "iatacode": "ADA", "icaocode": "LTAF" },
{ "name": "Sabiha Gokcen", "city": "Istanbul", "country": "Turkey", "timezone": "Europe/Istanbul", "lat": 40.898553, "lng": 29.309219, "terminal": null, "gate": null, "iatacode": "SAW", "icaocode": "LTFJ" },
{ "name": "Adnan Menderes", "city": "Izmir", "country": "Turkey", "timezone": "Europe/Istanbul", "lat": 38.292392, "lng": 27.156953, "terminal": null, "gate": null, "iatacode": "ADB", "icaocode": "LTBJ" },
{ "name": "Van", "city": "Van", "country": "Turkey", "timezone": "Europe/Istanbul", "lat": 38.468219, "lng": 43.3323, "terminal": null, "gate": null, "iatacode": "VAN", "icaocode": "LTCI" },
{ "name": "Frankfurt Main", "city": "Frankfurt", "country": "Germany", "timezone": "Europe/Berlin", "lat": 50.026421, "lng": 8.543125, "terminal": null, "gate": null, "iatacode": "FRA", "icaocode": "EDDF" },
{ "name": "Franz Josef Strauss", "city": "Munich", "country": "Germany", "timezone": "Europe/Berlin", "lat": 48.353783, "lng": 11.786086, "terminal": null, "gate": null, "iatacode": "MUC", "icaocode": "EDDM" },
{ "name": "Zurich", "city": "Zurich", "country": "Switzerland", "timezone": "Europe/Zurich", "lat": 47.464722, "lng": 8.549167, "terminal": null, "gate": null, "iatacode": "ZRH", "icaocode": "LSZH" }]

PortList.sort(sortfunc);


function sortfunc(a, b) {
    if (a.name < b.name)
        return -1;
    if (a.name > b.name)
        return 1;
    return 0;
}
