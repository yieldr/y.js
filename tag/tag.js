(function(y, l, d, r) {
  // We store the name of the Yieldr tracking object here so we can let users
  // choose a different one in case of conflict.
  y.YieldrTrackingObject = r;

  // Now we'll create a queue where all the actions will be stored until the
  // library is loaded and executes those actions.
  var yieldr = y.r = y.r || [];

  // This script should not be executed more than once.
  if (yieldr.loaded) {
    if (y.console && y.console.warn) {
      y.console.warn('Cannot load tracking script more than once.');
    }
    return;
  }

  // It was the first time the script run so we'll mark it as loaded so any
  // subsequent executions fail.
  yieldr.loaded = true;

  // The names of methods that are to be stubbed as they don't exist yet.
  yieldr.methods = [
    'track',
    'group',
    'event'
  ];

  // This method creates a stub with a given name so that it can be queued and
  // called later on.
  yieldr.factory = function (method) {
    return function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(method);
      yieldr.push(args);
      return yieldr;
    };
  };

  // Create stubs out for each of the methods we specified above.
  for (var i = 0; i < yieldr.methods.length; i++) {
    var key = yieldr.methods[i];
    yieldr[key] = yieldr.factory(key);
  }

  // Loads y.js from the location specified by d. The default location will be
  // our CDN hosted library found at cdn.254a.com/static/v3/y.js.
  yieldr.load = function(key){
    var script = l.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = d;
    l.getElementsByTagName("head")[0].appendChild(s);
  };

  // Specify the version used to load y.js. This is used to keep track of which
  // tags are used in the wild.
  yieldr.tagVersion = '3.0.0';

})(window, document, "../lib/y.js", "yldr");
