'use strict';

/*global window: false */

var Yieldr = require('yieldr');

var w = window, n = w.YieldrTrackingObject = w.YieldrTrackingObject || 'y';

w[n] = new Yieldr(w, w[n] || []);
w.ydResponse = w[n].callback;
