'use strict';
(function define$jh(global, factory) {
    var $jh = {};
    factory(global, $jh);
    if (typeof exports === 'object' && exports && typeof exports.nodeName !== 'string') {
        global.$jh = $jh;
        module.exports = $jh
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], $jh)
    } else {
        global.$jh = $jh
    }
})(window, function (global, $jh, undefined) {
    var router;
    (function () {
        var dloc = document.location;

        function dlocHashEmpty() {
            return dloc.hash === '' || dloc.hash === '#'
        }

        var listener = {
            mode: 'modern', hash: dloc.hash, history: false, check: function () {
                var h = dloc.hash;
                if (h != this.hash) {
                    this.hash = h;
                    this.onHashChanged()
                }
            }, fire: function () {
                if (this.mode === 'modern') {
                    this.history === true ? window.onpopstate() : window.onhashchange()
                } else {
                    this.onHashChanged()
                }
            }, init: function (fn, history) {
                var self = this;
                this.history = history;
                if (!Router.listeners) {
                    Router.listeners = []
                }
                function onchange(onChangeEvent) {
                    for (var i = 0, l = Router.listeners.length; i < l; i++) {
                        Router.listeners[i](onChangeEvent)
                    }
                }

                if ('onhashchange' in window && (document.documentMode === undefined || document.documentMode > 7)) {
                    if (this.history === true) {
                        setTimeout(function () {
                            window.onpopstate = onchange
                        }, 500)
                    } else {
                        window.onhashchange = onchange
                    }
                    this.mode = 'modern'
                } else {
                    var frame = document.createElement('iframe');
                    frame.id = 'state-frame';
                    frame.style.display = 'none';
                    document.body.appendChild(frame);
                    this.writeFrame('');
                    if ('onpropertychange' in document && 'attachEvent' in document) {
                        document.attachEvent('onpropertychange', function () {
                            if (event.propertyName === 'location') {
                                self.check()
                            }
                        })
                    }
                    window.setInterval(function () {
                        self.check()
                    }, 50);
                    this.onHashChanged = onchange;
                    this.mode = 'legacy'
                }
                Router.listeners.push(fn);
                return this.mode
            }, destroy: function (fn) {
                if (!Router || !Router.listeners) {
                    return
                }
                var listeners = Router.listeners;
                for (var i = listeners.length - 1; i >= 0; i--) {
                    if (listeners[i] === fn) {
                        listeners.splice(i, 1)
                    }
                }
            }, setHash: function (s) {
                if (this.mode === 'legacy') {
                    this.writeFrame(s)
                }
                if (this.history === true) {
                    window.history.pushState({}, document.title, s);
                    this.fire()
                } else {
                    dloc.hash = (s[0] === '/') ? s : '/' + s
                }
                return this
            }, writeFrame: function (s) {
                var f = document.getElementById('state-frame');
                var d = f.contentDocument || f.contentWindow.document;
                d.open();
                d.write("<script>_hash = '" + s + "'; onload = parent.listener.syncHash;<script>");
                d.close()
            }, syncHash: function () {
                var s = this._hash;
                if (s != dloc.hash) {
                    dloc.hash = s
                }
                return this
            }, onHashChanged: function () {
            }
        };
        var Router = router = function (routes) {
            if (!(this instanceof Router))return new Router(routes);
            this.params = {};
            this.routes = {};
            this.methods = ['on', 'once', 'after', 'before'];
            this.scope = [];
            this._methods = {};
            this._insert = this.insert;
            this.insert = this.insertEx;
            this.historySupport = (window.history != null ? window.history.pushState : null) != null
            this.configure();
            this.mount(routes || {})
        };
        Router.prototype.init = function (r) {
            var self = this, routeTo;
            this.handler = function (onChangeEvent) {
                var newURL = onChangeEvent && onChangeEvent.newURL || window.location.hash;
                var url = self.history === true ? self.getPath() : newURL.replace(/.*#/, '');
                self.dispatch('on', url.charAt(0) === '/' ? url : '/' + url)
            };
            listener.init(this.handler, this.history);
            if (this.history === false) {
                if (dlocHashEmpty() && r) {
                    dloc.hash = r
                } else if (!dlocHashEmpty()) {
                    self.dispatch('on', '/' + dloc.hash.replace(/^(#\/|#|\/)/, ''))
                }
            } else {
                if (this.convert_hash_in_init) {
                    routeTo = dlocHashEmpty() && r ? r : !dlocHashEmpty() ? dloc.hash.replace(/^#/, '') : null;
                    if (routeTo) {
                        window.history.replaceState({}, document.title, routeTo)
                    }
                } else {
                    routeTo = this.getPath()
                }
                if (routeTo || this.run_in_init === true) {
                    this.handler()
                }
            }
            return this
        };
        Router.prototype.explode = function () {
            var v = this.history === true ? this.getPath() : dloc.hash;
            if (v.charAt(1) === '/') {
                v = v.slice(1)
            }
            return v.slice(1, v.length).split("/")
        };
        Router.prototype.setRoute = function (i, v, val) {
            var url = this.explode();
            if (typeof i === 'number' && typeof v === 'string') {
                url[i] = v
            } else if (typeof val === 'string') {
                url.splice(i, v, s)
            } else {
                url = [i]
            }
            listener.setHash(url.join('/'));
            return url
        };
        Router.prototype.insertEx = function (method, path, route, parent) {
            if (method === "once") {
                method = "on";
                route = function (route) {
                    var once = false;
                    return function () {
                        if (once)return;
                        once = true;
                        return route.apply(this, arguments)
                    }
                }(route)
            }
            return this._insert(method, path, route, parent)
        };
        Router.prototype.getRoute = function (v) {
            var ret = v;
            if (typeof v === "number") {
                ret = this.explode()[v]
            } else if (typeof v === "string") {
                var h = this.explode();
                ret = h.indexOf(v)
            } else {
                ret = this.explode()
            }
            return ret
        };
        Router.prototype.destroy = function () {
            listener.destroy(this.handler);
            return this
        };
        Router.prototype.getPath = function () {
            var path = window.location.pathname;
            if (path.substr(0, 1) !== '/') {
                path = '/' + path
            }
            return path
        };
        function _every(arr, iterator) {
            for (var i = 0; i < arr.length; i += 1) {
                if (iterator(arr[i], i, arr) === false) {
                    return
                }
            }
        }

        function _flatten(arr) {
            var flat = [];
            for (var i = 0, n = arr.length; i < n; i++) {
                flat = flat.concat(arr[i])
            }
            return flat
        }

        function _asyncEverySeries(arr, iterator, callback) {
            if (!arr.length) {
                return callback()
            }
            var completed = 0;
            (function iterate() {
                iterator(arr[completed], function (err) {
                    if (err || err === false) {
                        callback(err);
                        callback = function () {
                        }
                    } else {
                        completed += 1;
                        if (completed === arr.length) {
                            callback()
                        } else {
                            iterate()
                        }
                    }
                })
            })()
        }

        function paramifyString(str, params, mod) {
            mod = str;
            for (var param in params) {
                if (params.hasOwnProperty(param)) {
                    mod = params[param](str);
                    if (mod !== str) {
                        break
                    }
                }
            }
            return mod === str ? "([._a-zA-Z0-9-%()]+)" : mod
        }

        function regifyString(str, params) {
            var matches, last = 0, out = "";
            while (matches = str.substr(last).match(/[^\w\d\- %@&]*\*[^\w\d\- %@&]*/)) {
                last = matches.index + matches[0].length;
                matches[0] = matches[0].replace(/^\*/, "([_.()!\\ %@&a-zA-Z0-9-]+)");
                out += str.substr(0, matches.index) + matches[0]
            }
            str = out += str.substr(last);
            var captures = str.match(/:([^\/]+)/ig), capture, length;
            if (captures) {
                length = captures.length;
                for (var i = 0; i < length; i++) {
                    capture = captures[i];
                    if (capture.slice(0, 2) === "::") {
                        str = capture.slice(1)
                    } else {
                        str = str.replace(capture, paramifyString(capture, params))
                    }
                }
            }
            return str
        }

        function terminator(routes, delimiter, start, stop) {
            var last = 0, left = 0, right = 0, start = (start || "(").toString(), stop = (stop || ")").toString(), i;
            for (i = 0; i < routes.length; i++) {
                var chunk = routes[i];
                if (chunk.indexOf(start, last) > chunk.indexOf(stop, last) || ~chunk.indexOf(start, last) && !~chunk.indexOf(stop, last) || !~chunk.indexOf(start, last) && ~chunk.indexOf(stop, last)) {
                    left = chunk.indexOf(start, last);
                    right = chunk.indexOf(stop, last);
                    if (~left && !~right || !~left && ~right) {
                        var tmp = routes.slice(0, (i || 1) + 1).join(delimiter);
                        routes = [tmp].concat(routes.slice((i || 1) + 1))
                    }
                    last = (right > left ? right : left) + 1;
                    i = 0
                } else {
                    last = 0
                }
            }
            return routes
        }

        var QUERY_SEPARATOR = /\?.*/;
        Router.prototype.configure = function (options) {
            options = options || {};
            for (var i = 0; i < this.methods.length; i++) {
                this._methods[this.methods[i]] = true
            }
            this.recurse = options.recurse || this.recurse || false;
            this.async = options.async || false;
            this.delimiter = options.delimiter || "/";
            this.strict = typeof options.strict === "undefined" ? true : options.strict;
            this.notfound = options.notfound;
            this.resource = options.resource;
            this.history = options.html5history && this.historySupport || false;
            this.run_in_init = this.history === true && options.run_handler_in_init !== false;
            this.convert_hash_in_init = this.history === true && options.convert_hash_in_init !== false;
            this.every = {after: options.after || null, before: options.before || null, on: options.on || null};
            return this
        };
        Router.prototype.param = function (token, matcher) {
            if (token[0] !== ":") {
                token = ":" + token
            }
            var compiled = new RegExp(token, "g");
            this.params[token] = function (str) {
                return str.replace(compiled, matcher.source || matcher)
            };
            return this
        };
        Router.prototype.on = Router.prototype.route = function (method, path, route) {
            var self = this;
            if (!route && typeof path == "function") {
                route = path;
                path = method;
                method = "on"
            }
            if (Array.isArray(path)) {
                return path.forEach(function (p) {
                    self.on(method, p, route)
                })
            }
            if (path.source) {
                path = path.source.replace(/\\\//ig, "/")
            }
            if (Array.isArray(method)) {
                return method.forEach(function (m) {
                    self.on(m.toLowerCase(), path, route)
                })
            }
            path = path.split(new RegExp(this.delimiter));
            path = terminator(path, this.delimiter);
            this.insert(method, this.scope.concat(path), route)
        };
        Router.prototype.path = function (path, routesFn) {
            var self = this, length = this.scope.length;
            if (path.source) {
                path = path.source.replace(/\\\//ig, "/")
            }
            path = path.split(new RegExp(this.delimiter));
            path = terminator(path, this.delimiter);
            this.scope = this.scope.concat(path);
            routesFn.call(this, this);
            this.scope.splice(length, path.length)
        };
        Router.prototype.dispatch = function (method, path, callback) {
            var self = this, fns = this.traverse(method, path.replace(QUERY_SEPARATOR, ""), this.routes, ""),
                invoked = this._invoked, after;
            this._invoked = true;
            if (!fns || fns.length === 0) {
                this.last = [];
                if (typeof this.notfound === "function") {
                    this.invoke([this.notfound], {method: method, path: path}, callback)
                }
                return false
            }
            if (this.recurse === "forward") {
                fns = fns.reverse()
            }
            function updateAndInvoke() {
                self.last = fns.after;
                self.invoke(self.runlist(fns), self, callback)
            }

            after = this.every && this.every.after ? [this.every.after].concat(this.last) : [this.last];
            if (after && after.length > 0 && invoked) {
                if (this.async) {
                    this.invoke(after, this, updateAndInvoke)
                } else {
                    this.invoke(after, this);
                    updateAndInvoke()
                }
                return true
            }
            updateAndInvoke();
            return true
        };
        Router.prototype.invoke = function (fns, thisArg, callback) {
            var self = this;
            var apply;
            if (this.async) {
                apply = function (fn, next) {
                    if (Array.isArray(fn)) {
                        return _asyncEverySeries(fn, apply, next)
                    } else if (typeof fn == "function") {
                        fn.apply(thisArg, (fns.captures || []).concat(next))
                    }
                };
                _asyncEverySeries(fns, apply, function () {
                    if (callback) {
                        callback.apply(thisArg, arguments)
                    }
                })
            } else {
                apply = function (fn) {
                    if (Array.isArray(fn)) {
                        return _every(fn, apply)
                    } else if (typeof fn === "function") {
                        return fn.apply(thisArg, fns.captures || [])
                    } else if (typeof fn === "string" && self.resource) {
                        self.resource[fn].apply(thisArg, fns.captures || [])
                    }
                };
                _every(fns, apply)
            }
        };
        Router.prototype.traverse = function (method, path, routes, regexp, filter) {
            var fns = [], current, exact, match, next, that;

            function filterRoutes(routes) {
                if (!filter) {
                    return routes
                }
                function deepCopy(source) {
                    var result = [];
                    for (var i = 0; i < source.length; i++) {
                        result[i] = Array.isArray(source[i]) ? deepCopy(source[i]) : source[i]
                    }
                    return result
                }

                function applyFilter(fns) {
                    for (var i = fns.length - 1; i >= 0; i--) {
                        if (Array.isArray(fns[i])) {
                            applyFilter(fns[i]);
                            if (fns[i].length === 0) {
                                fns.splice(i, 1)
                            }
                        } else {
                            if (!filter(fns[i])) {
                                fns.splice(i, 1)
                            }
                        }
                    }
                }

                var newRoutes = deepCopy(routes);
                newRoutes.matched = routes.matched;
                newRoutes.captures = routes.captures;
                newRoutes.after = routes.after.filter(filter);
                applyFilter(newRoutes);
                return newRoutes
            }

            if (path === this.delimiter && routes[method]) {
                next = [[routes.before, routes[method]].filter(Boolean)];
                next.after = [routes.after].filter(Boolean);
                next.matched = true;
                next.captures = [];
                return filterRoutes(next)
            }
            for (var r in routes) {
                if (routes.hasOwnProperty(r) && (!this._methods[r] || this._methods[r] && typeof routes[r] === "object" && !Array.isArray(routes[r]))) {
                    current = exact = regexp + this.delimiter + r;
                    if (!this.strict) {
                        exact += "[" + this.delimiter + "]?"
                    }
                    match = path.match(new RegExp("^" + exact));
                    if (!match) {
                        continue
                    }
                    if (match[0] && match[0] == path && routes[r][method]) {
                        next = [[routes[r].before, routes[r][method]].filter(Boolean)];
                        next.after = [routes[r].after].filter(Boolean);
                        next.matched = true;
                        next.captures = match.slice(1);
                        if (this.recurse && routes === this.routes) {
                            next.push([routes.before, routes.on].filter(Boolean));
                            next.after = next.after.concat([routes.after].filter(Boolean))
                        }
                        return filterRoutes(next)
                    }
                    next = this.traverse(method, path, routes[r], current);
                    if (next.matched) {
                        if (next.length > 0) {
                            fns = fns.concat(next)
                        }
                        if (this.recurse) {
                            fns.push([routes[r].before, routes[r].on].filter(Boolean));
                            next.after = next.after.concat([routes[r].after].filter(Boolean));
                            if (routes === this.routes) {
                                fns.push([routes["before"], routes["on"]].filter(Boolean));
                                next.after = next.after.concat([routes["after"]].filter(Boolean))
                            }
                        }
                        fns.matched = true;
                        fns.captures = next.captures;
                        fns.after = next.after;
                        return filterRoutes(fns)
                    }
                }
            }
            return false
        };
        Router.prototype.insert = function (method, path, route, parent) {
            var methodType, parentType, isArray, nested, part;
            path = path.filter(function (p) {
                return p && p.length > 0
            });
            parent = parent || this.routes;
            part = path.shift();
            if (/\:|\*/.test(part) && !/\\d|\\w/.test(part)) {
                part = regifyString(part, this.params)
            }
            if (path.length > 0) {
                parent[part] = parent[part] || {};
                return this.insert(method, path, route, parent[part])
            }
            if (!part && !path.length && parent === this.routes) {
                methodType = typeof parent[method];
                switch (methodType) {
                    case"function":
                        parent[method] = [parent[method], route];
                        return;
                    case"object":
                        parent[method].push(route);
                        return;
                    case"undefined":
                        parent[method] = route;
                        return
                }
                return
            }
            parentType = typeof parent[part];
            isArray = Array.isArray(parent[part]);
            if (parent[part] && !isArray && parentType == "object") {
                methodType = typeof parent[part][method];
                switch (methodType) {
                    case"function":
                        parent[part][method] = [parent[part][method], route];
                        return;
                    case"object":
                        parent[part][method].push(route);
                        return;
                    case"undefined":
                        parent[part][method] = route;
                        return
                }
            } else if (parentType == "undefined") {
                nested = {};
                nested[method] = route;
                parent[part] = nested;
                return
            }
            throw new Error("Invalid route context: " + parentType);
        };
        Router.prototype.extend = function (methods) {
            var self = this, len = methods.length, i;

            function extend(method) {
                self._methods[method] = true;
                self[method] = function () {
                    var extra = arguments.length === 1 ? [method, ""] : [method];
                    self.on.apply(self, extra.concat(Array.prototype.slice.call(arguments)))
                }
            }

            for (i = 0; i < len; i++) {
                extend(methods[i])
            }
        };
        Router.prototype.runlist = function (fns) {
            var runlist = this.every && this.every.before ? [this.every.before].concat(_flatten(fns)) : _flatten(fns);
            if (this.every && this.every.on) {
                runlist.push(this.every.on)
            }
            runlist.captures = fns.captures;
            runlist.source = fns.source;
            return runlist
        };
        Router.prototype.mount = function (routes, path) {
            if (!routes || typeof routes !== "object" || Array.isArray(routes)) {
                return
            }
            var self = this;
            path = path || [];
            if (!Array.isArray(path)) {
                path = path.split(self.delimiter)
            }
            function insertOrMount(route, local) {
                var rename = route, parts = route.split(self.delimiter), routeType = typeof routes[route],
                    isRoute = parts[0] === "" || !self._methods[parts[0]], event = isRoute ? "on" : rename;
                if (isRoute) {
                    rename = rename.slice((rename.match(new RegExp("^" + self.delimiter)) || [""])[0].length);
                    parts.shift()
                }
                if (isRoute && routeType === "object" && !Array.isArray(routes[route])) {
                    local = local.concat(parts);
                    self.mount(routes[route], local);
                    return
                }
                if (isRoute) {
                    local = local.concat(rename.split(self.delimiter));
                    local = terminator(local, self.delimiter)
                }
                self.insert(event, local, routes[route])
            }

            for (var route in routes) {
                if (routes.hasOwnProperty(route)) {
                    insertOrMount(route, path.slice(0))
                }
            }
        }
    }());
    function mustacheFactory(mustache) {
        var objectToString = Object.prototype.toString;
        var isArray = Array.isArray || function isArrayPolyfill(object) {
                return objectToString.call(object) === '[object Array]'
            };

        function isFunction(object) {
            return typeof object === 'function'
        }

        function typeStr(obj) {
            return isArray(obj) ? 'array' : typeof obj
        }

        function escapeRegExp(string) {
            return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
        }

        function hasProperty(obj, propName) {
            return obj != null && typeof obj === 'object' && (propName in obj)
        }

        var regExpTest = RegExp.prototype.test;

        function testRegExp(re, string) {
            return regExpTest.call(re, string)
        }

        var nonspaceRe = /\S/;

        function isWhitespace(string) {
            return !testRegExp(nonspaceRe, string)
        }

        var entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };

        function escapeHtml(string) {
            return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
                return entityMap[s]
            })
        }

        var whiteRe = /\s*/;
        var spaceRe = /\s+/;
        var equalsRe = /\s*=/;
        var curlyRe = /\s*\}/;
        var tagRe = /#|\^|\/|>|\{|&|=|!/;

        function parseTemplate(template, tags) {
            if (!template)return [];
            var sections = [];
            var tokens = [];
            var spaces = [];
            var hasTag = false;
            var nonspace = false;

            function stripspace() {
                if (hasTag && !nonspace) {
                    while (spaces.length)delete tokens[spaces.pop()]
                } else {
                    spaces = []
                }
                hasTag = false;
                nonspace = false
            }

            var openingTagRe, closingTagRe, closingCurlyRe;

            function compileTags(tagsToCompile) {
                if (typeof tagsToCompile === 'string') tagsToCompile = tagsToCompile.split(spaceRe, 2);
                if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)throw new Error('Invalid tags: ' + tagsToCompile);
                openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
                closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
                closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]))
            }

            compileTags(tags || mustache.tags);
            var scanner = new Scanner(template);
            var start, type, value, chr, token, openSection;
            while (!scanner.eos()) {
                start = scanner.pos;
                value = scanner.scanUntil(openingTagRe);
                if (value) {
                    for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
                        chr = value.charAt(i);
                        if (isWhitespace(chr)) {
                            spaces.push(tokens.length)
                        } else {
                            nonspace = true
                        }
                        tokens.push(['text', chr, start, start + 1]);
                        start += 1;
                        if (chr === '\n') stripspace()
                    }
                }
                if (!scanner.scan(openingTagRe))break;
                hasTag = true;
                type = scanner.scan(tagRe) || 'name';
                scanner.scan(whiteRe);
                if (type === '=') {
                    value = scanner.scanUntil(equalsRe);
                    scanner.scan(equalsRe);
                    scanner.scanUntil(closingTagRe)
                } else if (type === '{') {
                    value = scanner.scanUntil(closingCurlyRe);
                    scanner.scan(curlyRe);
                    scanner.scanUntil(closingTagRe);
                    type = '&'
                } else {
                    value = scanner.scanUntil(closingTagRe)
                }
                if (!scanner.scan(closingTagRe))throw new Error('Unclosed tag at ' + scanner.pos);
                token = [type, value, start, scanner.pos];
                tokens.push(token);
                if (type === '#' || type === '^') {
                    sections.push(token)
                } else if (type === '/') {
                    openSection = sections.pop();
                    if (!openSection)throw new Error('Unopened section "' + value + '" at ' + start);
                    if (openSection[1] !== value)throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
                } else if (type === 'name' || type === '{' || type === '&') {
                    nonspace = true
                } else if (type === '=') {
                    compileTags(value)
                }
            }
            openSection = sections.pop();
            if (openSection)throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
            return nestTokens(squashTokens(tokens))
        }

        function squashTokens(tokens) {
            var squashedTokens = [];
            var token, lastToken;
            for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
                token = tokens[i];
                if (token) {
                    if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
                        lastToken[1] += token[1];
                        lastToken[3] = token[3]
                    } else {
                        squashedTokens.push(token);
                        lastToken = token
                    }
                }
            }
            return squashedTokens
        }

        function nestTokens(tokens) {
            var nestedTokens = [];
            var collector = nestedTokens;
            var sections = [];
            var token, section;
            for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
                token = tokens[i];
                switch (token[0]) {
                    case'#':
                    case'^':
                        collector.push(token);
                        sections.push(token);
                        collector = token[4] = [];
                        break;
                    case'/':
                        section = sections.pop();
                        section[5] = token[2];
                        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
                        break;
                    default:
                        collector.push(token)
                }
            }
            return nestedTokens
        }

        function Scanner(string) {
            this.string = string;
            this.tail = string;
            this.pos = 0
        }

        Scanner.prototype.eos = function eos() {
            return this.tail === ''
        };
        Scanner.prototype.scan = function scan(re) {
            var match = this.tail.match(re);
            if (!match || match.index !== 0)return '';
            var string = match[0];
            this.tail = this.tail.substring(string.length);
            this.pos += string.length;
            return string
        };
        Scanner.prototype.scanUntil = function scanUntil(re) {
            var index = this.tail.search(re), match;
            switch (index) {
                case-1:
                    match = this.tail;
                    this.tail = '';
                    break;
                case 0:
                    match = '';
                    break;
                default:
                    match = this.tail.substring(0, index);
                    this.tail = this.tail.substring(index)
            }
            this.pos += match.length;
            return match
        };
        function Context(view, parentContext) {
            this.view = view;
            this.cache = {'.': this.view};
            this.parent = parentContext
        }

        Context.prototype.push = function push(view) {
            return new Context(view, this)
        };
        Context.prototype.lookup = function lookup(name) {
            var cache = this.cache;
            var value;
            if (cache.hasOwnProperty(name)) {
                value = cache[name]
            } else {
                var context = this, names, index, lookupHit = false;
                while (context) {
                    if (name.indexOf('.') > 0) {
                        value = context.view;
                        names = name.split('.');
                        index = 0;
                        while (value != null && index < names.length) {
                            if (index === names.length - 1) lookupHit = hasProperty(value, names[index]);
                            value = value[names[index++]]
                        }
                    } else {
                        value = context.view[name];
                        lookupHit = hasProperty(context.view, name)
                    }
                    if (lookupHit)break;
                    context = context.parent
                }
                cache[name] = value
            }
            if (isFunction(value)) value = value.call(this.view);
            return value
        };
        function Writer() {
            this.cache = {}
        }

        Writer.prototype.clearCache = function clearCache() {
            this.cache = {}
        };
        Writer.prototype.parse = function parse(template, tags) {
            var cache = this.cache;
            var tokens = cache[template];
            if (tokens == null) tokens = cache[template + ':' + (tags || mustache.tags).join(':')] = parseTemplate(template, tags);
            return tokens
        };
        Writer.prototype.render = function render(template, view, partials) {
            var tokens = this.parse(template);
            var context = (view instanceof Context) ? view : new Context(view);
            return this.renderTokens(tokens, context, partials, template)
        };
        Writer.prototype.renderTokens = function renderTokens(tokens, context, partials, originalTemplate) {
            var buffer = '';
            var token, symbol, value;
            for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
                value = undefined;
                token = tokens[i];
                symbol = token[0];
                if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate); else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate); else if (symbol === '>') value = this.renderPartial(token, context, partials, originalTemplate); else if (symbol === '&') value = this.unescapedValue(token, context); else if (symbol === 'name') value = this.escapedValue(token, context); else if (symbol === 'text') value = this.rawValue(token);
                if (value !== undefined) buffer += value
            }
            return buffer
        };
        Writer.prototype.renderSection = function renderSection(token, context, partials, originalTemplate) {
            var self = this;
            var buffer = '';
            var value = context.lookup(token[1]);

            function subRender(template) {
                return self.render(template, context, partials)
            }

            if (!value)return;
            if (isArray(value)) {
                for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
                    buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate)
                }
            } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
                buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate)
            } else if (isFunction(value)) {
                if (typeof originalTemplate !== 'string')throw new Error('Cannot use higher-order sections without the original template');
                value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);
                if (value != null) buffer += value
            } else {
                buffer += this.renderTokens(token[4], context, partials, originalTemplate)
            }
            return buffer
        };
        Writer.prototype.renderInverted = function renderInverted(token, context, partials, originalTemplate) {
            var value = context.lookup(token[1]);
            if (!value || (isArray(value) && value.length === 0))return this.renderTokens(token[4], context, partials, originalTemplate)
        };
        Writer.prototype.renderPartial = function renderPartial(token, context, partials) {
            if (!partials)return;
            var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
            if (value != null)return this.renderTokens(this.parse(value), context, partials, value)
        };
        Writer.prototype.unescapedValue = function unescapedValue(token, context) {
            var value = context.lookup(token[1]);
            if (value != null)return value
        };
        Writer.prototype.escapedValue = function escapedValue(token, context) {
            var value = context.lookup(token[1]);
            if (value != null)return mustache.escape(value)
        };
        Writer.prototype.rawValue = function rawValue(token) {
            return token[1]
        };
        mustache.name = 'mustache.js';
        mustache.version = '2.3.0';
        mustache.tags = ['{{', '}}'];
        var defaultWriter = new Writer();
        mustache.clearCache = function clearCache() {
            return defaultWriter.clearCache()
        };
        mustache.parse = function parse(template, tags) {
            return defaultWriter.parse(template, tags)
        };
        mustache.render = function render(template, view, partials) {
            if (typeof template !== 'string') {
                throw new TypeError('Invalid template! Template should be a "string" ' + 'but "' + typeStr(template) + '" was given as the first ' + 'argument for mustache#render(template, view, partials)');
            }
            return defaultWriter.render(template, view, partials)
        };
        mustache.to_html = function to_html(template, view, partials, send) {
            var result = mustache.render(template, view, partials);
            if (isFunction(send)) {
                send(result)
            } else {
                return result
            }
        };
        mustache.escape = escapeHtml;
        mustache.Scanner = Scanner;
        mustache.Context = Context;
        mustache.Writer = Writer;
        return mustache
    }

    var Mustache = {};
    mustacheFactory(Mustache);
    var doc = document, data = {}, storage = {}, controller = {};
    $jh.prop = {version: '1.0.0'};
    global.webGotoPage = function () {
        $jh.backHandle()
    };
    function _getUrlParam(name) {
        if (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                return unescape(r[2])
            } else {
                return null
            }
        } else {
            var hash = window.location.href.split("?");
            return hash[1] ? hash[1] : "dom"
        }
    }

    function createDom(tag, cfgs) {
        var dom = doc.createElement(tag), forObj = function (items, el) {
            for (var key in items) {
                if (isType(items[key], '[object Object]')) {
                    forObj(items[key], el[key])
                } else {
                    el[key] = items[key]
                }
            }
        };
        cfgs = cfgs || {};
        forObj(cfgs, dom);
        return dom
    }

    function isType(item, type) {
        return data.toString.call(item) == type
    }

    function isWindow(obj) {
        return obj != null && obj === obj.window
    }

    function isPlainObject(obj) {
        if (!isType(obj, '[object Object]') || obj.nodeType || isWindow(obj)) {
            return false
        }
        try {
            if (obj.constructor && !data.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false
            }
        } catch (e) {
            return false
        }
        return true
    }

    $jh.extend = function () {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length,
            deep = false;
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            i = 2
        }
        if (typeof target !== "object" && !isType(target, '[object Function]')) {
            target = {}
        }
        if (length === i) {
            target = this;
            --i
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue
                    }
                    if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : []
                        } else {
                            clone = src && isPlainObject(src) ? src : {}
                        }
                        target[name] = $jh.extend(deep, clone, copy)
                    } else if (copy !== undefined) {
                        target[name] = copy
                    }
                }
            }
        }
        return target
    };
    $jh.extend({
        setStorage: function (key, value) {
            var save = {};
            save[key] = value;
            $jh.delStorage(key);
            $jh.extend.call(storage, true, save)
        }, getStorage: function (key) {
            return storage[key]
        }, delStorage: function (key) {
            if ($jh.getStorage(key)) {
                try {
                    delete storage[key]
                } catch (e) {
                }
            }
        }, addController: function (routeName, controllerClass) {
            controller[routeName + ''] = controllerClass
        }
    });
    $jh.extend({
        urlparams2obj: function (urlparams) {
            var obj = {};
            if (urlparams.indexOf('?') != -1) {
                urlparams = urlparams.split('?')[1]
            }
            var params = urlparams.split('&');
            if (params.length > 1) {
                for (var i = 0; i < params.length; i++) {
                    var value = params[i].split('=');
                    if (value.length > 1) {
                        obj[value[0]] = value[1]
                    } else {
                        return {}
                    }
                }
            } else {
                var value = params[0].split('=');
                if (value.length > 1) {
                    obj[value[0]] = value[1]
                }
            }
            return obj
        }, obj2urlparams: function (obj) {
            var urlparams = '';
            if (typeof(obj) == 'undefined' || obj == null || typeof(obj) != 'object') {
                return ''
            }
            for (var key in obj) {
                urlparams += ((urlparams.indexOf("=") != -1) ? "&" : "") + key + "=" + obj[key]
            }
            return urlparams
        }
    });
    data.currentRoute = "";
    data.routes = {};
    data.args = {};
    data.pageKey = '';
    data.pageType = '';
    data.pageId = '';
    data.animation = '';
    function SpaController() {
    };
    SpaController.prototype = {
        constructor: SpaController, onCreate: function (nowPage, lastPage) {
        }, onResume: function (nowPage, lastPage) {
        }, onDestroy: function () {
        }, onBack: function () {
            $jh.goBack()
        }
    };
    $jh.SpaController = SpaController;
    function Page(initData) {
        this.routeName = initData.routeName || '';
        this.args = this.deepcopy(data.args);
        this.params = initData.params || 'dom';
        this.pageKey = data.pageKey || '';
        this.pageType = data.pageType || 'normal';
        this.dom;
        this.pageId = this.routeName + new Date().getTime();
        this.controller = undefined
    };
    Page.prototype = {
        constructor: Page, destroy: function () {
        }, deepcopy: function (data) {
            if (data) {
                return $jh.extend(true, {}, data)
            } else {
                return {}
            }
        }
    };
    var Stacks = {page: {}, pageFlag: [], firstPage: {}};
    Stacks.push = function (page) {
        Stacks.pageFlag.push(page.pageId);
        Stacks.page[page.pageId] = page
    };
    Stacks.pop = function () {
        return Stacks.page[Stacks.pageFlag.pop()]
    };
    Stacks.pageExist = function (page) {
        for (var i = 0; i < Stacks.pageFlag.length; i++) {
            if (Stacks.pageFlag[i] == page.pageId) {
                return i
            }
        }
        return -1
    };
    Stacks.findPageId = function (obj) {
        if (obj.routeName) {
            for (var n = Stacks.pageFlag.length - 2; n >= 0; n--) {
                var pg = Stacks.getPage(n);
                if (pg.routeName === obj.routeName && (!obj.key || pg.pageKey === obj.key)) {
                    return pg.pageId
                }
            }
            return false
        } else {
            var topPage = Stacks.getPage(-1);
            if (topPage.pageType === 'normal') {
                for (var n = Stacks.pageFlag.length - 2; n >= 0; n--) {
                    var pg = Stacks.getPage(n);
                    if (pg.pageType === 'normal') {
                        return pg.pageId
                    }
                }
                return false
            } else if (topPage.pageType === 'temp') {
                return Stacks.getPage(-2).pageId
            }
        }
    };
    Stacks.getPage = function (index) {
        if (Stacks.pageFlag.length === 0) {
            return false
        }
        index = index % Stacks.pageFlag.length;
        if (index < 0) {
            return Stacks.page[Stacks.pageFlag[Stacks.pageFlag.length + index]]
        } else {
            return Stacks.page[Stacks.pageFlag[index]]
        }
    };
    Stacks.getInstackPage = function () {
        var lastFlag = Stacks.pageFlag.length - 2;
        var lastInstackPage = null;
        for (lastFlag; lastFlag >= 0; lastFlag--) {
            var ss = Stacks.page[Stacks.pageFlag[lastFlag]];
            if (ss.notinstack === false) {
                lastInstackPage = ss;
                break
            }
        }
        return lastInstackPage
    };
    var backFlag = true;
    $jh.backHandle = function () {
        if (backFlag) {
            backFlag = false;
            setTimeout(function () {
                backFlag = true
            }, 300);
            if (Stacks.getPage(-1).controller && Stacks.getPage(-1).controller.onBack) {
                Stacks.getPage(-1).controller.onBack()
            } else {
                $jh.goBack()
            }
        }
    };
    $jh.parseDom = function (htmlstr, data, type) {
        var templateStr;
        if (type == 'string') {
            if (data) {
                Mustache.parse(htmlstr);
                templateStr = Mustache.render(htmlstr, data)
            } else {
                templateStr = htmlstr
            }
            return templateStr
        } else {
            var objE = document.createElement("div");
            if (data) {
                Mustache.parse(htmlstr);
                templateStr = Mustache.render(htmlstr, data)
            } else {
                templateStr = htmlstr
            }
            objE.innerHTML = templateStr;
            return objE.childNodes
        }
    };
    function newPage(page) {
        if (!page.dom) {
            page.dom = createDom('div', {className: 'jhAppView',});
            page.dom.style.display = 'none'
        }
        if (controller[page.routeName]) {
            page.controller = new controller[page.routeName]();
            var lastPage = Stacks.getPage(-1);
            page.controller.onCreate(page, lastPage);
            showPage(page, lastPage)
        } else {
            console.error('请检查config.js中是否引入控制器')
        }
    };
    function showPage(nowPage, lastPage) {
        var index = Stacks.pageExist(nowPage), len = Stacks.pageFlag.length;
        if (index != -1) {
            for (index; index < Stacks.pageFlag.length - 1;) {
                var page = Stacks.pop();
                (function (page) {
                    page.controller.onDestroy && page.controller.onDestroy();
                    setTimeout(function () {
                        page.destroy();
                        try {
                            Stacks.page[page.pageId] = '';
                            delete Stacks.page[page.pageId]
                        } catch (e) {
                            console.error('移除堆区page对象失败')
                        }
                    }, 500)
                })(page)
            }
            nowPage.controller.onResume && nowPage.controller.onResume(nowPage, lastPage)
        } else {
            Stacks.push(nowPage)
        }
        if (len === 0) {
            Stacks.firstPage = nowPage;
            pageAnimation(nowPage, lastPage, 'one')
        } else {
            pageAnimation(nowPage, lastPage, data.animation)
        }
    };
    function pageAnimation(nowPage, lastPage, animation) {
        var showDom = nowPage.dom, upPageDom = lastPage && lastPage.dom;
        if (animation === 'one') {
            data.parent.appendChild(showDom);
            showDom.style.display = 'block'
        } else if (animation === 'baseIn' || animation === 'baseOut') {
            data.parent.appendChild(showDom);
            showDom.style.display = 'block';
            upPageDom.style.display = 'none';
            data.parent.removeChild(upPageDom)
        } else if (animation === 'easeIn') {
            showDom.style.display = 'none';
            showDom.style.left = '100%';
            showDom.style.zIndex = '99';
            showDom.style.display = 'block';
            data.parent.appendChild(showDom);
            setTimeout(function () {
                showDom.style.transition = 'left 0.2s ease';
                showDom.style.left = '0'
            }, 20);
            setTimeout(function () {
                showDom.style.transition = 'none';
                showDom.style.zIndex = 'none';
                upPageDom.style.display = 'none';
                data.parent.removeChild(upPageDom)
            }, 400)
        } else if (animation === 'easeOut') {
            showDom.style.display = 'none';
            showDom.style.left = '-100%';
            showDom.style.zIndex = '99';
            showDom.style.display = 'block';
            data.parent.appendChild(showDom);
            setTimeout(function () {
                showDom.style.transition = 'left 0.2s ease';
                showDom.style.left = '0'
            }, 20);
            setTimeout(function () {
                showDom.style.transition = 'none';
                showDom.style.zIndex = 'none';
                upPageDom.style.display = 'none';
                data.parent.removeChild(upPageDom)
            }, 400)
        }
        data.animation = ''
    };
    function _initPage(page) {
        if (data.pageId) {
            var backPage = Stacks.page[data.pageId];
            data.pageId = '';
            backPage.args = data.args;
            backPage.params = page.params;
            showPage(backPage, Stacks.getPage(-1))
        } else {
            newPage(page)
        }
    }

    $jh.extend({
        loading: {
            template: {
                base: '<div class="pub_loading"><div class="pub_loading_img"></div></div>',
                test: '<div class="simple_verify_loading" style="display:block;">' + '    <div class="loading_box">' + '        <div class="loading_img"></div>' + '        <p class="loading_text">{{title}}</p>' + '    </div>' + '</div>'
            }, dom: null, status: 0, clickClose: true, _getDom: function (name, data) {
                var _this = this;
                _this.dom = $jh.parseDom(_this.template[name], data)[0];
                _this.dom.style.display = 'none';
                window.document.body.insertBefore(_this.dom, data.parent);
                _this.dom.addEventListener('click', function (e) {
                    if (_this.clickClose) {
                        _this.close()
                    }
                });
                return this.dom
            }, show: function (obj) {
                var _this = this, obj = obj || {};
                if (obj && obj.unclose) {
                    _this.clickClose = false
                } else {
                    _this.clickClose = true
                }
                if (!_this.status++) {
                    var loadDom = _this._getDom(obj.name || 'base', obj.data || {});
                    loadDom.style.display = 'block'
                }
                if (obj && obj.duration) {
                    setTimeout(function () {
                        _this.close()
                    }, obj.duration)
                }
            }, close: function () {
                var _this = this;
                if (_this.status > 0 && --_this.status === 0) {
                    window.document.body.removeChild(_this.dom);
                    _this.dom = null
                }
            }
        }
    });
    var goHandle = true;
    $jh.extend({
        go: function (obj) {
            if (!obj.routeName) {
                console.error('go方法缺少参数');
                return
            }
            if (goHandle || obj.douTap) {
                goHandle = false;
                setTimeout(function () {
                    goHandle = true
                }, 300);
                data.args = obj.args || {};
                data.pageKey = obj.key || '';
                data.pageType = obj.type || '';
                data.animation = obj.animation || 'baseIn';
                global.location.hash = '#' + obj.routeName + (obj.params ? ('?' + obj.params) : '')
            }
        }, goBack: function (obj) {
            if (Stacks.pageFlag.length === 1) {
                console.log('关闭webview');
                return
            }
            if (goHandle || obj.douTap) {
                goHandle = false;
                setTimeout(function () {
                    goHandle = true
                }, 300);
                var pageId = Stacks.findPageId(obj || {});
                if (pageId) {
                    data.pageId = pageId;
                    data.args = (obj && obj.args) ? obj.args : {};
                    data.animation = (obj && obj.animation) ? obj.animation : 'baseOut';
                    global.location.hash = '#' + Stacks.page[pageId].routeName + ((obj && obj.params) ? ('?' + obj.params) : '')
                } else {
                    console.error('未找到goBack指定返回页');
                    return
                }
            }
        }, switchPage: function (obj) {
            if (!(obj && obj.routeName)) {
                console.error('change必须要有routeName');
                return
            }
            if (goHandle || obj.douTap) {
                goHandle = false;
                setTimeout(function () {
                    goHandle = true
                }, 300);
                var pageId = Stacks.findPageId(obj);
                if (pageId) {
                    data.pageId = pageId;
                    data.args = (obj && obj.args) ? obj.args : {};
                    data.animation = (obj && obj.animation) ? obj.animation : 'baseOut';
                    global.location.hash = '#' + Stacks.page[pageId].routeName + ((obj && obj.params) ? ('?' + obj.params) : '')
                } else {
                    obj.douTap = true;
                    $jh.go(obj)
                }
            }
        }, init: function (config) {
            data.parent = config.container ? doc.querySelector(config.container) : window.document.body;
            for (var key in controller) {
                (function (index, item) {
                    data.routes[index] = {
                        before: function () {
                            data.currentRoute = index;
                            item.before && item.before()
                        }, on: function () {
                            var urlParams = _getUrlParam();
                            var initData = {routeName: index, params: urlParams};
                            _initPage(new Page(initData))
                        }, after: function () {
                            item.after && item.after()
                        }
                    }
                })(key, controller[key])
            }
            router(data.routes).configure({
                notfound: function () {
                    $jh.go({routeName: config.errRoute || '/error', douTap: true})
                }
            }).init(config.home || '/')
        }
    })
});