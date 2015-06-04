(function() {
    // Look for YieldrTrackingObject in the window. It's value is the key under
    // which y exists.
    //
    // window.YieldrTrackingObject === 'yieldr' // true
    // typeof window.yieldr === 'object' // true
    var yieldr = window[window.YieldrTrackingObject];

    // If it exists it means the Yieldr tracking pixel was loaded in this window
    // therefore we can continue on with testing which cases evaluate.
    if (yieldr === undefined) {
        // Nothing to do here since the pixel was not found on this page.
        return;
    }

    // Keep a reference to the callback function so we can restore it when we're
    // finished.
    var callback = yieldr.callback;

    // Now we hijack the JSONP callback and make it send us the cases that were
    // evaluated on the server side.
    yieldr.callback = function (response) {

        // The server response contains the cases that evaluated given the pixel
        // call parameters.
        var cases = response.data.cases;

        // We go through all of these cases and make a call to the Yieldr API to
        // let it know that the case successfully evaluated so the UI can show
        // feedback.
        for (var i = 0; i < cases.length; i++) {
            // The case id
            var id = cases[i];
            // Make an asynchronous HTTP call to the Yieldr API informing it
            // about the verified pixel.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://my.yieldr.com/api/case-test/' + id, true);
            xhr.send();
        }

        // Restore the callback so tracking works as intended after we're done.
        this.callback = callback;
    };

    // Initiate a tracking request to the backend. The response will execute the
    // callback as we've defined it above.
    yieldr.track();

})();
