(function() {
    var yieldr = window[window.YieldrTrackingObject] || null;

    yieldr.callback = function (response) {

        var cases = response.data.cases;

        for (var i = 0; i < cases.length; i++) {
            var id = cases[i];

            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://my.yieldr.com/api/case-test/' + id, true);
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa('chucknorris:dontneedone'));
            xhr.send();
        }
    };

    yieldr.track();

})();
