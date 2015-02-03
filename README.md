# Yieldr JavaScript Tracker

This library is being served to clients implementing the Yieldr tracking snippet. On a high level it defines a single JSON-P function responsible for performing actions based on the tracking server response.

Before triggering a request to the remote tracking server, it collects information from the current document, using referrer, query parameters, cookies, sessions and so on.

## Usage

Place the following HTML snippet at the end of your documents body.

```html
<script type="text/javascript">
(function(y, l, d, r) {
  y['YieldrTrackingObject'] = r;
  y[r] = y[r] || {
    data: {},
    set: function(name, value) {
      this.data[name] = value;
    }
  };
  if (!y[r].loaded) {
    var s = l.createElement("script");
    s.async = true;
    s.src = d;
    l.getElementsByTagName("head")[0].appendChild(s);
    y[r].loaded = true;
  }
})(window, document, "//cdn.254a.com/static/y.js", "y");

y.set("foo", "bar");
y.set("bar", "baz");
</script>
```

A valid implementation should should include an `id` or `advertiser_id` parameter for a network or advertiser pixel respectively. Any additional parameters will be forwared to the server and will be used agains evaluating cases.

## API

Depending on how you've set up the tag in your site a global object (by default `y`) is available inside the `window`. This can be configured to another name if you run into conflicts.

### `y.set("foo", "bar")`

Set property `foo` with value `"bar"`. This is used to specify properties which you want to transmit to the server when initiating tracking calls.

### `y.track()`

Makes a request to the remote server, passing along any parameters discovered by parsing the current window context.

### `y.fire({foo: "bar"})`

Similar to `y.track()` but it will only use the supplied paramaters.

### `y.callback(data)`

This function is usually triggered by a JSON-P response so it's not particularly useful to users. This function is responsible for placing any piggyback pixels from the servers response.

### `y.version`

The version of the library.

### `y.debug`

If set to true, it will output some additional information to the console.

## Data Layer

As of `v0.7.0` it is possible to use values from a tag managers [data layer](http://tealium.com/what-is-a-data-layer) in a flexible way. To use this functionality you must set the `'_dl'` property.

```
var data = {a: {b: {c: "x"}}},
    mapping = {foo: "a.b.c"};

y.set("_dl", [data, mapping]); // will extract "x" from data and make it available as "foo".
```

The values extracted are then "flattened" as best possible so they can be used in query parameters. For example if our mapping was `{foo: "a.b"}` then the result would be the object `{c: "x"}` instead of the string `"x"`. This will be flattened to the key `foo_c` with value `"x"`.

## Events

As of `v0.7.0` you can initiate tracking calls when an event triggers, for example a button was clicked.

```
y.set("_elem", ["a#submit", "click"]);
- `y.track()` Makes a request to the remote server, passing along any parameters discovered by parsing the current window context.
- `y.fire(data)` Similar to `y.track()` but it will only use the supplied paramaters.
```
- `y.version` Defines the version of the library.
- `y.debug` If true, it will output some additional information to the console.

## Referrer

The URL which was visited before triggering a pixel load is saved to the current users session. It will be augmented to any previous referrers and also stored in a cookie. If the referrer URL matches a list of known referrers, the name is normalised.

## Query Parameters

Any query parameters set on the parent document will be merged with all other data and sent to the remote tracking server. If there are conflicts between query parameters and parameters set using `y.set()`, the latter will be preferred.

## Session

While a user is browsing and triggering various events with this pixel, a session ID is used to group several events which happened in a single session. Sessions are invalidated once the user closes the browser tab, window or browser. The session properties being set defined below.

- `ysess` A random hex string used to identify a particular session. E.g. `7a3239f3-7c25-5d2d-ebaa-8b64ce99ddd6`.
- `ytsrc` The traffic source or referrer. E.g. `NO_REFERRER`, `example.com`, `google`.
- `ytt` The traffic type. E.g. `search`, `display`, `self` or `other`.

## Cookie

The users browsing history in terms of referrer is stored as a pipe (`|`) delimited string of urls. E.g. `NO_REFERRER|google|criteo|www.volotea.com`. The cookie is set as first party.
