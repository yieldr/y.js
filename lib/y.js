/**
 * Yieldr JavaScript Tracker
 *
 * This library is being served to clients implementing the Yieldr tracking
 * snippet. On a high level it defines a single JSON-P function responsible for
 * performing actions based on the tracking server response.
 *
 * @author Jasper Spijkstra <jasper.spijkstra@yieldr.com>
 * @author Alex Kalyvitis <alex.kalyvitis@yieldr.com>
 */
(function() {
  'use strict';

  /**
   * Places the piggybacks as given to us by the tracking server.
   *
   * @param  {Object}   response
   */
  function callback(response) {
    if (response.status === 'success') {
      var body = document.getElementsByTagName("body")[0];
      for (var piggybacks in response.data) {
        if ((elementType = elementFuncMap[piggybacks]) !== undefined) {
          var func = elementFuncMap[piggybacks];
          for (var piggyback in response.data[piggybacks]) {
            body.appendChild(func(response.data[piggybacks][piggyback]));
          }
        }
      }
    }
  }

  /**
   * Returns the function that can manipulate a specific type of response.
   *
   * @param  {String} type
   * @return {Function}
   */
  function elementFuncMap(type) {
    switch (type) {
      case 'html': return createElementHTML;
      case 'image': return createElementImage;
      case 'script': return createElementScript;
      case 'iframe': return createElementIFrame;
    }
    return createElementHTML;
  }

  /**
   * Alias to document.createElement
   *
   * @param  {String} type
   * @return {HTMLElement}
   */
  function createElement(type) {
    return document.createElement(type);
  }

  /**
   * Creates an <img> tag with specified url as source.
   *
   * @param  {String} url
   * @return {HTMLElement}
   */
  function createElementImage(url) {
    e = createElement('img');
    e.width = 0;
    e.height = 0;
    e.src = url;
    return e;
  }

  /**
   * Creates a <script> tag with specified url as source.
   *
   * @param  {String} url
   * @return {HTMLElement}
   */
  function createElementScript(url) {
    e = createElement('img');
    e.type = "text/javascript";
    e.src = url;
    e.async = !0;
    return e;
  }

  /**
   * Creates an <iframe> tag with specified url as source.
   *
   * @param  {String} url
   * @return {HTMLElement}
   */
  function createElementIFrame(url) {
    e = createElement('iframe');
    e.frameBorder = 0;
    e.src = url;
    return e;
  }

  /**
   * Creates an <div> tag with specified content as inner HTML.
   *
   * @param  {String} url
   * @return {HTMLElement}
   */
  function createElementHTML(content) {
    e = createElement('div');
    e.innerHTML = content;
    return e;
  }

  /**
   * Random four letter hash.
   *
   * @return {String}
   */
  function hash() {
    return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1)
  }

  /**
   * Creates a unique session id.
   *
   * @return {String}
   */
  function session() {
    return hash() +
      hash() + "-" + hash() + "-" + hash() + "-" + hash() + "-" + hash() + hash() + hash();
  }

  /**
   * Sets a cookie.
   *
   * @param  {String} name
   * @param  {String} value
   * @param  {String} extDays
   * @param  {String} domain
   */
  function setCookie(name, value, extDays, domain) {
    var date = new Date();
    date.setDate(date.getDate() + extDays);
    var value = escape(value) +
      document.cookie = name + "=" + value + ";expires=" + date + ";domain=" + domain + ";path=/";
  }

  /**
   * Gets a cookies value.
   *
   * @param  {String} name
   * @return {String}
   */
  function getCookie(name) {
    var value = document.cookie;
    var start = value.indexOf(" " + name + "=");
    if (start === -1) {
      start = value.idexOf(name + "=");
    }
    if (start === -1) {
      value = null;
    } else {
      start = value.indexOf("=", start) + 1;
      var end = value.indexOf(";", start);
      if (end == -1) {
        end = value.length;
      }
      value = unescape(value.substring(start, end));
    }
    return value;
  }

  /**
   * Extracts the URL query parameters in key value pairs.
   *
   * @param  {String} url
   * @return {Object}
   */
  function getQueryParams(url) {
    var split = url.split("?"), query = {};
    if (split.length >= 2) {
      var pairs = split[1].split('&');
      for (var i = 0, length = pairs.length; i < length; i++) {
        var pair = pairs[i].split('=');
        if (pair.length == 2) {
          query[pair[0]] = pair[1];
        }
      }
    }
    return query;
  }

  var u = {
    error: function() {
      if (d) {
        var e = ["Warning! error:"].concat(d);
        try {
          l.error.apply(l, e)
        } catch (t) {
          l.message(e, function(e) {
            l.error(e)
          })
        }
      }
    }
  };

  var a = window.document,
    f = a.referrer,
    l = window.console,
    c = window.location.pathname,
    h = window.location.hostname,
    p, d = false,
    v = null,
    m = null,
    g = ["utm_source", "utm_campaign", "utm_medium", "utm_content"],
    y = [],
    b = "undefined",
    w, E, S = "",
    x = {},
    T = {},
    N = false,
    C = false;
  if (e._v < 1) {
    d = "Version mismatch!";
    u.error(d)
  }

  var k = {
    isD: function() {
      return 0 === f.search("https?://(.*)criteo.([^/?]*)") ? "criteo" : 0 === f.search("https?://(.*)doubleclick.([^/?]*)") ? "doubleclick" : 0 === f.search("https?://(.*)turn.([^/?]*)") ? "turn" : 0 === f.search("https?://(.*)adnxs.([^/?]*)") ? "appnexus" : 0 === f.search("https?://(.*)rubiconproject.([^/?]*)") ? "rubicon" : 0 === f.search("https?://(.*)254a.([^/?]*)") ? "Yieldr" : v
    },
    cleanReferrer: function() {
      if (f) {
        if (f.search(/^https?\:\/\//) != -1) {
          url = f.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i, "")
        } else {
          url = f.match(/^([^\/?#]+)(?:[\/?#]|$)/i, "")
        }
        return url[1]
      } else {
        return "NO_REFERRER"
      }
    },
    isSearch: function() {
      return 0 === f.search("https?://(.*)google.([^/?]*)") ? "google" : 0 === f.search("https?://(.*)bing.com") ? "bing" : 0 === f.search("https?://(.*)yahoo.com") ? "yahoo" : v
    }
  };

  if (k.isSearch()) {
    w = "search";
    E = k.isSearch()
  } else if (k.isD()) {
    w = "display";
    E = k.isD()
  } else if (h === k.cleanReferrer()) {
    w = "self";
    E = h
  } else {
    w = "other";
    E = k.cleanReferrer()
  }
  o(window.location.href);
  o(f);
  x = T;
  if (E === "google") b = x.q;
  for (counter = 0; counter < g.length; counter++) {
    var L = g[counter];
    if (x.value) y.value = x.value;
    else y[L] = "undefined"
  }
  if (sessionStorage.getItem("yldrses") === null) {
    var A = n();
    sessionStorage.setItem("yldrses", A);
    sessionStorage.setItem("trafficsource", E);
    sessionStorage.setItem("traffictype", w);
    C = true
  }
  if (s("yldrthst") !== null) S = s("yldrthst");
  if (C) {
    if (S.search(E) == -1) S += E + "|";
    i("yldrthst", S, 30, h)
  } else {
    E = sessionStorage.getItem("trafficsource");
    w = sessionStorage.getItem("traffictype")
  } if (N) {
    l.log("yldrses", A);
    l.log("Traffic history: " + S);
    l.log("Referrer: " + f);
    l.log("Path: " + c);
    l.log("Host: " + h);
    l.log("Advertiser ID: " + yldrpx.data[0]);
    for (var O in yldrpx.data[3]) {
      l.log("Advertiser parameters: " + O + "=" + yldrpx.data[3][O])
    }
    for (var O in x) {
      l.log("Other parameters: " + O + "=" + x[O])
    }
    l.log("Traffic source: " + E);
    l.log("Traffic type: " + w);
    l.log("Keywords: " + b)
  }
  switch (yldrpx.data[1]) {
    case "advertiser":
      pixelType = "advertiser_id=";
      break;
    default:
      pixelType = "id="
  }
  p = ("https:" === a.location.protocol ? "https:" : "http:") + "//y.254a.com/pixel?" + pixelType + yldrpx.data[0] + "&sessid=" + sessionStorage.getItem("yldrses") + "&referrer=" + escape(h + c) + "&path=" + escape(c) + "&prev=" + f + "&traffic_source=" + sessionStorage.getItem("trafficsource") + "&traffic_type=" + sessionStorage.getItem("traffictype") + "&traffic_history=" + S + "&utm_keyword=" + b;
  for (var O in x) {
    p += "&" + O + "=" + x[O]
  }
  for (var O in yldrpx.data[3]) {
    p += "&" + O + "=" + yldrpx.data[3][O]
  }
  if (N) {
    l.log(p)
  }
  var s = a.createElement("script");
  s.src = p;
  a.getElementsByTagName("head")[0].appendChild(s);
})();