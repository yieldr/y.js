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
    yieldr.callback = window.ydResponse = function (response) {

        // The server response contains the cases that evaluated given the pixel
        // call parameters.
        var cases = response.data.cases || response.data.case_id;

        // Create a notification element near the top right edge of the screen,
        // displaying the cases that got evaluated.
        var notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.zIndex = 99999;
        notification.style.right = '20px';
        notification.style.top = '20px';
        notification.style.opacity = 1;
        notification.style.background = '#52ac59 url(http://yieldr.com/images/logo.svg) 16px 50% no-repeat ';
        notification.style.padding = '8px 18px 8px 124px';
        notification.style.border = '1px solid #d1d1d1';
        notification.style.borderRadius = '6px';
        notification.style.boxShadow = '0px 1px 8px 1px #a2a2a2';
        notification.style.fontFamily = 'IdealSans-Book-Pro, sans-serif';
        notification.style.fontSize = '16px';
        notification.style.color = '#f2f2f2';
        notification.innerHTML = '<p>' + cases.length > 0 ? + cases : 'No cases' + '</p>';
        document.body.appendChild(notification);

        // Display the notification for 3 seconds, then fade away and eventually
        // remove the element from the page.
        window.setTimeout(function () {
            var animation = window.setInterval(function () {
                if (notification.style.opacity > 0) {
                    notification.style.opacity -= 0.01;
                } else {
                    notification.remove();
                    window.clearInterval(animation);
                }
            }, 10);
        }, 3000);

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
        this.callback = window.ydResponse = callback;
    };

    // Initiate a tracking request to the backend. The response will execute the
    // callback as we've defined it above.
    yieldr.track();

})();

