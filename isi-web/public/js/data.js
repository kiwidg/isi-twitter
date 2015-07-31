function prepare(elements, duration) {
    duration = duration || 300;
    duration = 10*duration; // every 0.1 ms, refresh
    min = elements[0].time;
    max = elements[elements.length - 1].time;
    now = new Date().getTime();
    length = max - min;
    var result = [];
    elements.forEach(function(elem) {
        newTime = Math.floor(duration * (elem.time - min) / (length));
        result[newTime] = result[newTime] || [];
        result[newTime].push(elem);
    });
    return [result, length];
}

function display(elements, duration, L, map) {
    $('#wait').append("<p>Please wait...</p>");
    var nb = elements.length;
        res = prepare(elements, duration);
    console.log(res);
    result = res[0];
    length = res[1];
    $('#wait').empty();
    var offset = 0;
        nolocation = 0;
        verifiedMarker = L.AwesomeMarkers.icon({
            icon: 'ion-checkmark',
            markerColor: 'green'
        }); 
        timer = setInterval(function() {
            var valeur = Math.floor(offset * 10 / duration);
                date = new Date(result[0][0].time + length*offset/(10*duration)).toUTCString();
            $('.progress-bar').css('width', valeur + '%').attr('aria-valuenow', date).empty().append('<span>' + date + '</span>');
            if (offset == duration*10) {
                clearInterval(timer);
                return;
            }
            if (result[offset] != undefined) {
                result[offset].forEach(function(elem) {
                    if (elem.coordinates != null) {
                        if (elem.verified) {
                            L.marker([elem.coordinates.coordinates[1], elem.coordinates.coordinates[0]], {icon: verifiedMarker}).addTo(map);
                        }
                        else {
                            L.marker([elem.coordinates.coordinates[1], elem.coordinates.coordinates[0]]).addTo(map);
                        }
                        console.log(elem.coordinates.coordinates);
                    } else {
                        nolocation++;
                        $('#wait').empty().append('<p>' + nolocation + ' tweets without location over a total of '+ nb + '</p>');
                        L.marker([45, -44]).addTo(map);
                    }
                });
            }
            offset++;
    }, 100);
}

