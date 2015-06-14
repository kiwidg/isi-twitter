function prepare(elements, duration) {
    duration = duration || 300000;
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
    res = prepare(elements, duration);
    console.log(res);
    result = res[0];
    length = res[1];
    $('#wait').empty();
    var offset = 0;
    var nolocation = 0;
    var timer = setInterval(function() {
        valeur = Math.floor(offset * 100 / duration);
        date = new Date(result[0][0].time + offset * length / duration).toUTCString();
        $('.progress-bar').css('width', valeur + '%').attr('aria-valuenow', date).empty().append('<span>' + date + '</span>');
        if (offset == duration) {
            clearInterval(timer);
            return;
        }
        if (result[offset] != undefined) {
            result[offset].forEach(function(elem) {
                if (elem.coordinates != null) {
                    L.marker([elem.coordinates.coordinates[1], elem.coordinates.coordinates[0]]).addTo(map);
                    console.log(elem.coordinates.coordinates);
                } else {
                    nolocation++;
                    $('#wait').empty().append('<p>' + nolocation + ' tweets without location</p>');
                    L.marker([45, -44]).addTo(map);
                }
            });
        }
        offset++;
    }, 1000);
}

