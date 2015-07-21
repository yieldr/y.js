/**
 * Creates an asynchronous queue and loads the yieldr tracker.
 *
 * @param  {Window}   y
 * @param  {Document} i
 * @param  {String}   e
 * @param  {String}   l
 * @param  {String}   d
 * @param  {String}   r
 */
(function(y, i, e, l, d, r) {
  // Stores the name of the tracking object. This is used when the tracking
  // object is renamed due to conflicts.
  y.YieldrTrackingObject = l;
  // Create an array to act as a queue. This array will hold all the tracking
  // commands set by the users until y.js loads replaces the queue with the
  // actual object after it executes it.
  y[l] = y[l] || [];
  // Load this tag only once.
  if (!y[l].loaded) {
    // These methods will be available to the queue. Calling _yldr.method(arg)
    // will behave as if _yldr.push(['method', arg]) was called instead.
    d = ['set', 'map', 'fire', 'track', 'remote'];
    r = function(method) {
      return function() {
        var a = Array.prototype.slice.call(arguments);
        a.unshift(method)
        y[l].push(a);
      };
    };
    for (var c = 0; c < d.length; c++) {
      y[l][d[c]] = r(d[c]);
    }
    // Create the element that will load y.js and place it as the last child of
    // the document.
    var elem = i.createElement("script");
    elem.async = true;
    elem.src = e;
    i.getElementsByTagName('body')[0].appendChild(elem);
    // Mark the object as loaded so we don't load it again.
    y[l].loaded = true;
    // Save the tag version to be able to keep backward compatibility among
    // upgraded versions.
    y[l].version = 'v2';
  }
})(window, document, '//cdn.254a.com/static/y.js', '_yldr');
