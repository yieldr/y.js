# Yieldr JavaScript Tracker

This library is being served to clients implementing the Yieldr tracking snippet. On a high level it defines a single JSON-P function responsible for performing actions based on the tracking server response.

## Usage

Place the following HTML snippet at the end of your documents body.

```html
<script type="text/javascript">
(function (window, document, src) {
  window.y = window.y || {
    data: {},
    set: function (name, value) {
      this.data[name] = value;
    }
  };
  if (!y.loaded) {
    var elem = document.createElement("script");
    elem.async = true;
    elem.src = src;
    document.head.appendChild(elem);
    y.loaded = true;
  }
})(window, document, "//cdn.254a.com/static/y.js");

y.set("foo", "bar");
y.set("bar", "baz");
</script>
```

A proper implementation should should include an `id` or `advertiser_id` parameter for a network or advertiser pixel respectively. Any additional parameters will be forwared to the server and will be used agains evaluating cases.