///////////////////
//Initialise map //
///////////////////
map = L.map('map', {
    center: [51.505, -0.09],
    zoom: 2
});

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
}).addTo(map);
L.control.scale().addTo(map); //add a scale to the map
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? false : decodeURIComponent(results[1].replace(/\+/g, " "));
}
var dur = getParameterByName('dur') || 60;
display(tweets, dur, L, map);

