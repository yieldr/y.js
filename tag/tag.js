(function(y, i, e, l, d, r) {
  y.YieldrTrackingObject = l;
  y[l] = y[l] || {
    data: {},
    set: function(name, value) {
      this.data[name] = value;
    }
  };
  if (!y[l].loaded) {
    var t = "script";
    d = i.createElement(t);
    d.src = i.location.protocol + e;
    d.async = true;
    r = i.getElementsByTagName(t)[0];
    r.parentNode.insertBefore(d, r);
    y[l].loaded = true;
  }
})(window, document, "//cdn.254a.com/static/n.js", "y");