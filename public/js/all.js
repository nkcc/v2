/*
    http://www.JSON.org/json2.js
    2011-02-23

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

/*! jQuery v1.9.1 | (c) 2005, 2012 jQuery Foundation, Inc. | jquery.org/license
*/(function(e,t){var n,r,i=typeof t,o=e.document,a=e.location,s=e.jQuery,u=e.$,l={},c=[],p="1.9.1",f=c.concat,d=c.push,h=c.slice,g=c.indexOf,m=l.toString,y=l.hasOwnProperty,v=p.trim,b=function(e,t){return new b.fn.init(e,t,r)},x=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,w=/\S+/g,T=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,N=/^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,C=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,k=/^[\],:{}\s]*$/,E=/(?:^|:|,)(?:\s*\[)+/g,S=/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,A=/"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,j=/^-ms-/,D=/-([\da-z])/gi,L=function(e,t){return t.toUpperCase()},H=function(e){(o.addEventListener||"load"===e.type||"complete"===o.readyState)&&(q(),b.ready())},q=function(){o.addEventListener?(o.removeEventListener("DOMContentLoaded",H,!1),e.removeEventListener("load",H,!1)):(o.detachEvent("onreadystatechange",H),e.detachEvent("onload",H))};b.fn=b.prototype={jquery:p,constructor:b,init:function(e,n,r){var i,a;if(!e)return this;if("string"==typeof e){if(i="<"===e.charAt(0)&&">"===e.charAt(e.length-1)&&e.length>=3?[null,e,null]:N.exec(e),!i||!i[1]&&n)return!n||n.jquery?(n||r).find(e):this.constructor(n).find(e);if(i[1]){if(n=n instanceof b?n[0]:n,b.merge(this,b.parseHTML(i[1],n&&n.nodeType?n.ownerDocument||n:o,!0)),C.test(i[1])&&b.isPlainObject(n))for(i in n)b.isFunction(this[i])?this[i](n[i]):this.attr(i,n[i]);return this}if(a=o.getElementById(i[2]),a&&a.parentNode){if(a.id!==i[2])return r.find(e);this.length=1,this[0]=a}return this.context=o,this.selector=e,this}return e.nodeType?(this.context=this[0]=e,this.length=1,this):b.isFunction(e)?r.ready(e):(e.selector!==t&&(this.selector=e.selector,this.context=e.context),b.makeArray(e,this))},selector:"",length:0,size:function(){return this.length},toArray:function(){return h.call(this)},get:function(e){return null==e?this.toArray():0>e?this[this.length+e]:this[e]},pushStack:function(e){var t=b.merge(this.constructor(),e);return t.prevObject=this,t.context=this.context,t},each:function(e,t){return b.each(this,e,t)},ready:function(e){return b.ready.promise().done(e),this},slice:function(){return this.pushStack(h.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(e){var t=this.length,n=+e+(0>e?t:0);return this.pushStack(n>=0&&t>n?[this[n]]:[])},map:function(e){return this.pushStack(b.map(this,function(t,n){return e.call(t,n,t)}))},end:function(){return this.prevObject||this.constructor(null)},push:d,sort:[].sort,splice:[].splice},b.fn.init.prototype=b.fn,b.extend=b.fn.extend=function(){var e,n,r,i,o,a,s=arguments[0]||{},u=1,l=arguments.length,c=!1;for("boolean"==typeof s&&(c=s,s=arguments[1]||{},u=2),"object"==typeof s||b.isFunction(s)||(s={}),l===u&&(s=this,--u);l>u;u++)if(null!=(o=arguments[u]))for(i in o)e=s[i],r=o[i],s!==r&&(c&&r&&(b.isPlainObject(r)||(n=b.isArray(r)))?(n?(n=!1,a=e&&b.isArray(e)?e:[]):a=e&&b.isPlainObject(e)?e:{},s[i]=b.extend(c,a,r)):r!==t&&(s[i]=r));return s},b.extend({noConflict:function(t){return e.$===b&&(e.$=u),t&&e.jQuery===b&&(e.jQuery=s),b},isReady:!1,readyWait:1,holdReady:function(e){e?b.readyWait++:b.ready(!0)},ready:function(e){if(e===!0?!--b.readyWait:!b.isReady){if(!o.body)return setTimeout(b.ready);b.isReady=!0,e!==!0&&--b.readyWait>0||(n.resolveWith(o,[b]),b.fn.trigger&&b(o).trigger("ready").off("ready"))}},isFunction:function(e){return"function"===b.type(e)},isArray:Array.isArray||function(e){return"array"===b.type(e)},isWindow:function(e){return null!=e&&e==e.window},isNumeric:function(e){return!isNaN(parseFloat(e))&&isFinite(e)},type:function(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?l[m.call(e)]||"object":typeof e},isPlainObject:function(e){if(!e||"object"!==b.type(e)||e.nodeType||b.isWindow(e))return!1;try{if(e.constructor&&!y.call(e,"constructor")&&!y.call(e.constructor.prototype,"isPrototypeOf"))return!1}catch(n){return!1}var r;for(r in e);return r===t||y.call(e,r)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},error:function(e){throw Error(e)},parseHTML:function(e,t,n){if(!e||"string"!=typeof e)return null;"boolean"==typeof t&&(n=t,t=!1),t=t||o;var r=C.exec(e),i=!n&&[];return r?[t.createElement(r[1])]:(r=b.buildFragment([e],t,i),i&&b(i).remove(),b.merge([],r.childNodes))},parseJSON:function(n){return e.JSON&&e.JSON.parse?e.JSON.parse(n):null===n?n:"string"==typeof n&&(n=b.trim(n),n&&k.test(n.replace(S,"@").replace(A,"]").replace(E,"")))?Function("return "+n)():(b.error("Invalid JSON: "+n),t)},parseXML:function(n){var r,i;if(!n||"string"!=typeof n)return null;try{e.DOMParser?(i=new DOMParser,r=i.parseFromString(n,"text/xml")):(r=new ActiveXObject("Microsoft.XMLDOM"),r.async="false",r.loadXML(n))}catch(o){r=t}return r&&r.documentElement&&!r.getElementsByTagName("parsererror").length||b.error("Invalid XML: "+n),r},noop:function(){},globalEval:function(t){t&&b.trim(t)&&(e.execScript||function(t){e.eval.call(e,t)})(t)},camelCase:function(e){return e.replace(j,"ms-").replace(D,L)},nodeName:function(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()},each:function(e,t,n){var r,i=0,o=e.length,a=M(e);if(n){if(a){for(;o>i;i++)if(r=t.apply(e[i],n),r===!1)break}else for(i in e)if(r=t.apply(e[i],n),r===!1)break}else if(a){for(;o>i;i++)if(r=t.call(e[i],i,e[i]),r===!1)break}else for(i in e)if(r=t.call(e[i],i,e[i]),r===!1)break;return e},trim:v&&!v.call("\ufeff\u00a0")?function(e){return null==e?"":v.call(e)}:function(e){return null==e?"":(e+"").replace(T,"")},makeArray:function(e,t){var n=t||[];return null!=e&&(M(Object(e))?b.merge(n,"string"==typeof e?[e]:e):d.call(n,e)),n},inArray:function(e,t,n){var r;if(t){if(g)return g.call(t,e,n);for(r=t.length,n=n?0>n?Math.max(0,r+n):n:0;r>n;n++)if(n in t&&t[n]===e)return n}return-1},merge:function(e,n){var r=n.length,i=e.length,o=0;if("number"==typeof r)for(;r>o;o++)e[i++]=n[o];else while(n[o]!==t)e[i++]=n[o++];return e.length=i,e},grep:function(e,t,n){var r,i=[],o=0,a=e.length;for(n=!!n;a>o;o++)r=!!t(e[o],o),n!==r&&i.push(e[o]);return i},map:function(e,t,n){var r,i=0,o=e.length,a=M(e),s=[];if(a)for(;o>i;i++)r=t(e[i],i,n),null!=r&&(s[s.length]=r);else for(i in e)r=t(e[i],i,n),null!=r&&(s[s.length]=r);return f.apply([],s)},guid:1,proxy:function(e,n){var r,i,o;return"string"==typeof n&&(o=e[n],n=e,e=o),b.isFunction(e)?(r=h.call(arguments,2),i=function(){return e.apply(n||this,r.concat(h.call(arguments)))},i.guid=e.guid=e.guid||b.guid++,i):t},access:function(e,n,r,i,o,a,s){var u=0,l=e.length,c=null==r;if("object"===b.type(r)){o=!0;for(u in r)b.access(e,n,u,r[u],!0,a,s)}else if(i!==t&&(o=!0,b.isFunction(i)||(s=!0),c&&(s?(n.call(e,i),n=null):(c=n,n=function(e,t,n){return c.call(b(e),n)})),n))for(;l>u;u++)n(e[u],r,s?i:i.call(e[u],u,n(e[u],r)));return o?e:c?n.call(e):l?n(e[0],r):a},now:function(){return(new Date).getTime()}}),b.ready.promise=function(t){if(!n)if(n=b.Deferred(),"complete"===o.readyState)setTimeout(b.ready);else if(o.addEventListener)o.addEventListener("DOMContentLoaded",H,!1),e.addEventListener("load",H,!1);else{o.attachEvent("onreadystatechange",H),e.attachEvent("onload",H);var r=!1;try{r=null==e.frameElement&&o.documentElement}catch(i){}r&&r.doScroll&&function a(){if(!b.isReady){try{r.doScroll("left")}catch(e){return setTimeout(a,50)}q(),b.ready()}}()}return n.promise(t)},b.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(e,t){l["[object "+t+"]"]=t.toLowerCase()});function M(e){var t=e.length,n=b.type(e);return b.isWindow(e)?!1:1===e.nodeType&&t?!0:"array"===n||"function"!==n&&(0===t||"number"==typeof t&&t>0&&t-1 in e)}r=b(o);var _={};function F(e){var t=_[e]={};return b.each(e.match(w)||[],function(e,n){t[n]=!0}),t}b.Callbacks=function(e){e="string"==typeof e?_[e]||F(e):b.extend({},e);var n,r,i,o,a,s,u=[],l=!e.once&&[],c=function(t){for(r=e.memory&&t,i=!0,a=s||0,s=0,o=u.length,n=!0;u&&o>a;a++)if(u[a].apply(t[0],t[1])===!1&&e.stopOnFalse){r=!1;break}n=!1,u&&(l?l.length&&c(l.shift()):r?u=[]:p.disable())},p={add:function(){if(u){var t=u.length;(function i(t){b.each(t,function(t,n){var r=b.type(n);"function"===r?e.unique&&p.has(n)||u.push(n):n&&n.length&&"string"!==r&&i(n)})})(arguments),n?o=u.length:r&&(s=t,c(r))}return this},remove:function(){return u&&b.each(arguments,function(e,t){var r;while((r=b.inArray(t,u,r))>-1)u.splice(r,1),n&&(o>=r&&o--,a>=r&&a--)}),this},has:function(e){return e?b.inArray(e,u)>-1:!(!u||!u.length)},empty:function(){return u=[],this},disable:function(){return u=l=r=t,this},disabled:function(){return!u},lock:function(){return l=t,r||p.disable(),this},locked:function(){return!l},fireWith:function(e,t){return t=t||[],t=[e,t.slice?t.slice():t],!u||i&&!l||(n?l.push(t):c(t)),this},fire:function(){return p.fireWith(this,arguments),this},fired:function(){return!!i}};return p},b.extend({Deferred:function(e){var t=[["resolve","done",b.Callbacks("once memory"),"resolved"],["reject","fail",b.Callbacks("once memory"),"rejected"],["notify","progress",b.Callbacks("memory")]],n="pending",r={state:function(){return n},always:function(){return i.done(arguments).fail(arguments),this},then:function(){var e=arguments;return b.Deferred(function(n){b.each(t,function(t,o){var a=o[0],s=b.isFunction(e[t])&&e[t];i[o[1]](function(){var e=s&&s.apply(this,arguments);e&&b.isFunction(e.promise)?e.promise().done(n.resolve).fail(n.reject).progress(n.notify):n[a+"With"](this===r?n.promise():this,s?[e]:arguments)})}),e=null}).promise()},promise:function(e){return null!=e?b.extend(e,r):r}},i={};return r.pipe=r.then,b.each(t,function(e,o){var a=o[2],s=o[3];r[o[1]]=a.add,s&&a.add(function(){n=s},t[1^e][2].disable,t[2][2].lock),i[o[0]]=function(){return i[o[0]+"With"](this===i?r:this,arguments),this},i[o[0]+"With"]=a.fireWith}),r.promise(i),e&&e.call(i,i),i},when:function(e){var t=0,n=h.call(arguments),r=n.length,i=1!==r||e&&b.isFunction(e.promise)?r:0,o=1===i?e:b.Deferred(),a=function(e,t,n){return function(r){t[e]=this,n[e]=arguments.length>1?h.call(arguments):r,n===s?o.notifyWith(t,n):--i||o.resolveWith(t,n)}},s,u,l;if(r>1)for(s=Array(r),u=Array(r),l=Array(r);r>t;t++)n[t]&&b.isFunction(n[t].promise)?n[t].promise().done(a(t,l,n)).fail(o.reject).progress(a(t,u,s)):--i;return i||o.resolveWith(l,n),o.promise()}}),b.support=function(){var t,n,r,a,s,u,l,c,p,f,d=o.createElement("div");if(d.setAttribute("className","t"),d.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",n=d.getElementsByTagName("*"),r=d.getElementsByTagName("a")[0],!n||!r||!n.length)return{};s=o.createElement("select"),l=s.appendChild(o.createElement("option")),a=d.getElementsByTagName("input")[0],r.style.cssText="top:1px;float:left;opacity:.5",t={getSetAttribute:"t"!==d.className,leadingWhitespace:3===d.firstChild.nodeType,tbody:!d.getElementsByTagName("tbody").length,htmlSerialize:!!d.getElementsByTagName("link").length,style:/top/.test(r.getAttribute("style")),hrefNormalized:"/a"===r.getAttribute("href"),opacity:/^0.5/.test(r.style.opacity),cssFloat:!!r.style.cssFloat,checkOn:!!a.value,optSelected:l.selected,enctype:!!o.createElement("form").enctype,html5Clone:"<:nav></:nav>"!==o.createElement("nav").cloneNode(!0).outerHTML,boxModel:"CSS1Compat"===o.compatMode,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0,boxSizingReliable:!0,pixelPosition:!1},a.checked=!0,t.noCloneChecked=a.cloneNode(!0).checked,s.disabled=!0,t.optDisabled=!l.disabled;try{delete d.test}catch(h){t.deleteExpando=!1}a=o.createElement("input"),a.setAttribute("value",""),t.input=""===a.getAttribute("value"),a.value="t",a.setAttribute("type","radio"),t.radioValue="t"===a.value,a.setAttribute("checked","t"),a.setAttribute("name","t"),u=o.createDocumentFragment(),u.appendChild(a),t.appendChecked=a.checked,t.checkClone=u.cloneNode(!0).cloneNode(!0).lastChild.checked,d.attachEvent&&(d.attachEvent("onclick",function(){t.noCloneEvent=!1}),d.cloneNode(!0).click());for(f in{submit:!0,change:!0,focusin:!0})d.setAttribute(c="on"+f,"t"),t[f+"Bubbles"]=c in e||d.attributes[c].expando===!1;return d.style.backgroundClip="content-box",d.cloneNode(!0).style.backgroundClip="",t.clearCloneStyle="content-box"===d.style.backgroundClip,b(function(){var n,r,a,s="padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",u=o.getElementsByTagName("body")[0];u&&(n=o.createElement("div"),n.style.cssText="border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px",u.appendChild(n).appendChild(d),d.innerHTML="<table><tr><td></td><td>t</td></tr></table>",a=d.getElementsByTagName("td"),a[0].style.cssText="padding:0;margin:0;border:0;display:none",p=0===a[0].offsetHeight,a[0].style.display="",a[1].style.display="none",t.reliableHiddenOffsets=p&&0===a[0].offsetHeight,d.innerHTML="",d.style.cssText="box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;",t.boxSizing=4===d.offsetWidth,t.doesNotIncludeMarginInBodyOffset=1!==u.offsetTop,e.getComputedStyle&&(t.pixelPosition="1%"!==(e.getComputedStyle(d,null)||{}).top,t.boxSizingReliable="4px"===(e.getComputedStyle(d,null)||{width:"4px"}).width,r=d.appendChild(o.createElement("div")),r.style.cssText=d.style.cssText=s,r.style.marginRight=r.style.width="0",d.style.width="1px",t.reliableMarginRight=!parseFloat((e.getComputedStyle(r,null)||{}).marginRight)),typeof d.style.zoom!==i&&(d.innerHTML="",d.style.cssText=s+"width:1px;padding:1px;display:inline;zoom:1",t.inlineBlockNeedsLayout=3===d.offsetWidth,d.style.display="block",d.innerHTML="<div></div>",d.firstChild.style.width="5px",t.shrinkWrapBlocks=3!==d.offsetWidth,t.inlineBlockNeedsLayout&&(u.style.zoom=1)),u.removeChild(n),n=d=a=r=null)}),n=s=u=l=r=a=null,t}();var O=/(?:\{[\s\S]*\}|\[[\s\S]*\])$/,B=/([A-Z])/g;function P(e,n,r,i){if(b.acceptData(e)){var o,a,s=b.expando,u="string"==typeof n,l=e.nodeType,p=l?b.cache:e,f=l?e[s]:e[s]&&s;if(f&&p[f]&&(i||p[f].data)||!u||r!==t)return f||(l?e[s]=f=c.pop()||b.guid++:f=s),p[f]||(p[f]={},l||(p[f].toJSON=b.noop)),("object"==typeof n||"function"==typeof n)&&(i?p[f]=b.extend(p[f],n):p[f].data=b.extend(p[f].data,n)),o=p[f],i||(o.data||(o.data={}),o=o.data),r!==t&&(o[b.camelCase(n)]=r),u?(a=o[n],null==a&&(a=o[b.camelCase(n)])):a=o,a}}function R(e,t,n){if(b.acceptData(e)){var r,i,o,a=e.nodeType,s=a?b.cache:e,u=a?e[b.expando]:b.expando;if(s[u]){if(t&&(o=n?s[u]:s[u].data)){b.isArray(t)?t=t.concat(b.map(t,b.camelCase)):t in o?t=[t]:(t=b.camelCase(t),t=t in o?[t]:t.split(" "));for(r=0,i=t.length;i>r;r++)delete o[t[r]];if(!(n?$:b.isEmptyObject)(o))return}(n||(delete s[u].data,$(s[u])))&&(a?b.cleanData([e],!0):b.support.deleteExpando||s!=s.window?delete s[u]:s[u]=null)}}}b.extend({cache:{},expando:"jQuery"+(p+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(e){return e=e.nodeType?b.cache[e[b.expando]]:e[b.expando],!!e&&!$(e)},data:function(e,t,n){return P(e,t,n)},removeData:function(e,t){return R(e,t)},_data:function(e,t,n){return P(e,t,n,!0)},_removeData:function(e,t){return R(e,t,!0)},acceptData:function(e){if(e.nodeType&&1!==e.nodeType&&9!==e.nodeType)return!1;var t=e.nodeName&&b.noData[e.nodeName.toLowerCase()];return!t||t!==!0&&e.getAttribute("classid")===t}}),b.fn.extend({data:function(e,n){var r,i,o=this[0],a=0,s=null;if(e===t){if(this.length&&(s=b.data(o),1===o.nodeType&&!b._data(o,"parsedAttrs"))){for(r=o.attributes;r.length>a;a++)i=r[a].name,i.indexOf("data-")||(i=b.camelCase(i.slice(5)),W(o,i,s[i]));b._data(o,"parsedAttrs",!0)}return s}return"object"==typeof e?this.each(function(){b.data(this,e)}):b.access(this,function(n){return n===t?o?W(o,e,b.data(o,e)):null:(this.each(function(){b.data(this,e,n)}),t)},null,n,arguments.length>1,null,!0)},removeData:function(e){return this.each(function(){b.removeData(this,e)})}});function W(e,n,r){if(r===t&&1===e.nodeType){var i="data-"+n.replace(B,"-$1").toLowerCase();if(r=e.getAttribute(i),"string"==typeof r){try{r="true"===r?!0:"false"===r?!1:"null"===r?null:+r+""===r?+r:O.test(r)?b.parseJSON(r):r}catch(o){}b.data(e,n,r)}else r=t}return r}function $(e){var t;for(t in e)if(("data"!==t||!b.isEmptyObject(e[t]))&&"toJSON"!==t)return!1;return!0}b.extend({queue:function(e,n,r){var i;return e?(n=(n||"fx")+"queue",i=b._data(e,n),r&&(!i||b.isArray(r)?i=b._data(e,n,b.makeArray(r)):i.push(r)),i||[]):t},dequeue:function(e,t){t=t||"fx";var n=b.queue(e,t),r=n.length,i=n.shift(),o=b._queueHooks(e,t),a=function(){b.dequeue(e,t)};"inprogress"===i&&(i=n.shift(),r--),o.cur=i,i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,a,o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return b._data(e,n)||b._data(e,n,{empty:b.Callbacks("once memory").add(function(){b._removeData(e,t+"queue"),b._removeData(e,n)})})}}),b.fn.extend({queue:function(e,n){var r=2;return"string"!=typeof e&&(n=e,e="fx",r--),r>arguments.length?b.queue(this[0],e):n===t?this:this.each(function(){var t=b.queue(this,e,n);b._queueHooks(this,e),"fx"===e&&"inprogress"!==t[0]&&b.dequeue(this,e)})},dequeue:function(e){return this.each(function(){b.dequeue(this,e)})},delay:function(e,t){return e=b.fx?b.fx.speeds[e]||e:e,t=t||"fx",this.queue(t,function(t,n){var r=setTimeout(t,e);n.stop=function(){clearTimeout(r)}})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,n){var r,i=1,o=b.Deferred(),a=this,s=this.length,u=function(){--i||o.resolveWith(a,[a])};"string"!=typeof e&&(n=e,e=t),e=e||"fx";while(s--)r=b._data(a[s],e+"queueHooks"),r&&r.empty&&(i++,r.empty.add(u));return u(),o.promise(n)}});var I,z,X=/[\t\r\n]/g,U=/\r/g,V=/^(?:input|select|textarea|button|object)$/i,Y=/^(?:a|area)$/i,J=/^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i,G=/^(?:checked|selected)$/i,Q=b.support.getSetAttribute,K=b.support.input;b.fn.extend({attr:function(e,t){return b.access(this,b.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each(function(){b.removeAttr(this,e)})},prop:function(e,t){return b.access(this,b.prop,e,t,arguments.length>1)},removeProp:function(e){return e=b.propFix[e]||e,this.each(function(){try{this[e]=t,delete this[e]}catch(n){}})},addClass:function(e){var t,n,r,i,o,a=0,s=this.length,u="string"==typeof e&&e;if(b.isFunction(e))return this.each(function(t){b(this).addClass(e.call(this,t,this.className))});if(u)for(t=(e||"").match(w)||[];s>a;a++)if(n=this[a],r=1===n.nodeType&&(n.className?(" "+n.className+" ").replace(X," "):" ")){o=0;while(i=t[o++])0>r.indexOf(" "+i+" ")&&(r+=i+" ");n.className=b.trim(r)}return this},removeClass:function(e){var t,n,r,i,o,a=0,s=this.length,u=0===arguments.length||"string"==typeof e&&e;if(b.isFunction(e))return this.each(function(t){b(this).removeClass(e.call(this,t,this.className))});if(u)for(t=(e||"").match(w)||[];s>a;a++)if(n=this[a],r=1===n.nodeType&&(n.className?(" "+n.className+" ").replace(X," "):"")){o=0;while(i=t[o++])while(r.indexOf(" "+i+" ")>=0)r=r.replace(" "+i+" "," ");n.className=e?b.trim(r):""}return this},toggleClass:function(e,t){var n=typeof e,r="boolean"==typeof t;return b.isFunction(e)?this.each(function(n){b(this).toggleClass(e.call(this,n,this.className,t),t)}):this.each(function(){if("string"===n){var o,a=0,s=b(this),u=t,l=e.match(w)||[];while(o=l[a++])u=r?u:!s.hasClass(o),s[u?"addClass":"removeClass"](o)}else(n===i||"boolean"===n)&&(this.className&&b._data(this,"__className__",this.className),this.className=this.className||e===!1?"":b._data(this,"__className__")||"")})},hasClass:function(e){var t=" "+e+" ",n=0,r=this.length;for(;r>n;n++)if(1===this[n].nodeType&&(" "+this[n].className+" ").replace(X," ").indexOf(t)>=0)return!0;return!1},val:function(e){var n,r,i,o=this[0];{if(arguments.length)return i=b.isFunction(e),this.each(function(n){var o,a=b(this);1===this.nodeType&&(o=i?e.call(this,n,a.val()):e,null==o?o="":"number"==typeof o?o+="":b.isArray(o)&&(o=b.map(o,function(e){return null==e?"":e+""})),r=b.valHooks[this.type]||b.valHooks[this.nodeName.toLowerCase()],r&&"set"in r&&r.set(this,o,"value")!==t||(this.value=o))});if(o)return r=b.valHooks[o.type]||b.valHooks[o.nodeName.toLowerCase()],r&&"get"in r&&(n=r.get(o,"value"))!==t?n:(n=o.value,"string"==typeof n?n.replace(U,""):null==n?"":n)}}}),b.extend({valHooks:{option:{get:function(e){var t=e.attributes.value;return!t||t.specified?e.value:e.text}},select:{get:function(e){var t,n,r=e.options,i=e.selectedIndex,o="select-one"===e.type||0>i,a=o?null:[],s=o?i+1:r.length,u=0>i?s:o?i:0;for(;s>u;u++)if(n=r[u],!(!n.selected&&u!==i||(b.support.optDisabled?n.disabled:null!==n.getAttribute("disabled"))||n.parentNode.disabled&&b.nodeName(n.parentNode,"optgroup"))){if(t=b(n).val(),o)return t;a.push(t)}return a},set:function(e,t){var n=b.makeArray(t);return b(e).find("option").each(function(){this.selected=b.inArray(b(this).val(),n)>=0}),n.length||(e.selectedIndex=-1),n}}},attr:function(e,n,r){var o,a,s,u=e.nodeType;if(e&&3!==u&&8!==u&&2!==u)return typeof e.getAttribute===i?b.prop(e,n,r):(a=1!==u||!b.isXMLDoc(e),a&&(n=n.toLowerCase(),o=b.attrHooks[n]||(J.test(n)?z:I)),r===t?o&&a&&"get"in o&&null!==(s=o.get(e,n))?s:(typeof e.getAttribute!==i&&(s=e.getAttribute(n)),null==s?t:s):null!==r?o&&a&&"set"in o&&(s=o.set(e,r,n))!==t?s:(e.setAttribute(n,r+""),r):(b.removeAttr(e,n),t))},removeAttr:function(e,t){var n,r,i=0,o=t&&t.match(w);if(o&&1===e.nodeType)while(n=o[i++])r=b.propFix[n]||n,J.test(n)?!Q&&G.test(n)?e[b.camelCase("default-"+n)]=e[r]=!1:e[r]=!1:b.attr(e,n,""),e.removeAttribute(Q?n:r)},attrHooks:{type:{set:function(e,t){if(!b.support.radioValue&&"radio"===t&&b.nodeName(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(e,n,r){var i,o,a,s=e.nodeType;if(e&&3!==s&&8!==s&&2!==s)return a=1!==s||!b.isXMLDoc(e),a&&(n=b.propFix[n]||n,o=b.propHooks[n]),r!==t?o&&"set"in o&&(i=o.set(e,r,n))!==t?i:e[n]=r:o&&"get"in o&&null!==(i=o.get(e,n))?i:e[n]},propHooks:{tabIndex:{get:function(e){var n=e.getAttributeNode("tabindex");return n&&n.specified?parseInt(n.value,10):V.test(e.nodeName)||Y.test(e.nodeName)&&e.href?0:t}}}}),z={get:function(e,n){var r=b.prop(e,n),i="boolean"==typeof r&&e.getAttribute(n),o="boolean"==typeof r?K&&Q?null!=i:G.test(n)?e[b.camelCase("default-"+n)]:!!i:e.getAttributeNode(n);return o&&o.value!==!1?n.toLowerCase():t},set:function(e,t,n){return t===!1?b.removeAttr(e,n):K&&Q||!G.test(n)?e.setAttribute(!Q&&b.propFix[n]||n,n):e[b.camelCase("default-"+n)]=e[n]=!0,n}},K&&Q||(b.attrHooks.value={get:function(e,n){var r=e.getAttributeNode(n);return b.nodeName(e,"input")?e.defaultValue:r&&r.specified?r.value:t},set:function(e,n,r){return b.nodeName(e,"input")?(e.defaultValue=n,t):I&&I.set(e,n,r)}}),Q||(I=b.valHooks.button={get:function(e,n){var r=e.getAttributeNode(n);return r&&("id"===n||"name"===n||"coords"===n?""!==r.value:r.specified)?r.value:t},set:function(e,n,r){var i=e.getAttributeNode(r);return i||e.setAttributeNode(i=e.ownerDocument.createAttribute(r)),i.value=n+="","value"===r||n===e.getAttribute(r)?n:t}},b.attrHooks.contenteditable={get:I.get,set:function(e,t,n){I.set(e,""===t?!1:t,n)}},b.each(["width","height"],function(e,n){b.attrHooks[n]=b.extend(b.attrHooks[n],{set:function(e,r){return""===r?(e.setAttribute(n,"auto"),r):t}})})),b.support.hrefNormalized||(b.each(["href","src","width","height"],function(e,n){b.attrHooks[n]=b.extend(b.attrHooks[n],{get:function(e){var r=e.getAttribute(n,2);return null==r?t:r}})}),b.each(["href","src"],function(e,t){b.propHooks[t]={get:function(e){return e.getAttribute(t,4)}}})),b.support.style||(b.attrHooks.style={get:function(e){return e.style.cssText||t},set:function(e,t){return e.style.cssText=t+""}}),b.support.optSelected||(b.propHooks.selected=b.extend(b.propHooks.selected,{get:function(e){var t=e.parentNode;return t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex),null}})),b.support.enctype||(b.propFix.enctype="encoding"),b.support.checkOn||b.each(["radio","checkbox"],function(){b.valHooks[this]={get:function(e){return null===e.getAttribute("value")?"on":e.value}}}),b.each(["radio","checkbox"],function(){b.valHooks[this]=b.extend(b.valHooks[this],{set:function(e,n){return b.isArray(n)?e.checked=b.inArray(b(e).val(),n)>=0:t}})});var Z=/^(?:input|select|textarea)$/i,et=/^key/,tt=/^(?:mouse|contextmenu)|click/,nt=/^(?:focusinfocus|focusoutblur)$/,rt=/^([^.]*)(?:\.(.+)|)$/;function it(){return!0}function ot(){return!1}b.event={global:{},add:function(e,n,r,o,a){var s,u,l,c,p,f,d,h,g,m,y,v=b._data(e);if(v){r.handler&&(c=r,r=c.handler,a=c.selector),r.guid||(r.guid=b.guid++),(u=v.events)||(u=v.events={}),(f=v.handle)||(f=v.handle=function(e){return typeof b===i||e&&b.event.triggered===e.type?t:b.event.dispatch.apply(f.elem,arguments)},f.elem=e),n=(n||"").match(w)||[""],l=n.length;while(l--)s=rt.exec(n[l])||[],g=y=s[1],m=(s[2]||"").split(".").sort(),p=b.event.special[g]||{},g=(a?p.delegateType:p.bindType)||g,p=b.event.special[g]||{},d=b.extend({type:g,origType:y,data:o,handler:r,guid:r.guid,selector:a,needsContext:a&&b.expr.match.needsContext.test(a),namespace:m.join(".")},c),(h=u[g])||(h=u[g]=[],h.delegateCount=0,p.setup&&p.setup.call(e,o,m,f)!==!1||(e.addEventListener?e.addEventListener(g,f,!1):e.attachEvent&&e.attachEvent("on"+g,f))),p.add&&(p.add.call(e,d),d.handler.guid||(d.handler.guid=r.guid)),a?h.splice(h.delegateCount++,0,d):h.push(d),b.event.global[g]=!0;e=null}},remove:function(e,t,n,r,i){var o,a,s,u,l,c,p,f,d,h,g,m=b.hasData(e)&&b._data(e);if(m&&(c=m.events)){t=(t||"").match(w)||[""],l=t.length;while(l--)if(s=rt.exec(t[l])||[],d=g=s[1],h=(s[2]||"").split(".").sort(),d){p=b.event.special[d]||{},d=(r?p.delegateType:p.bindType)||d,f=c[d]||[],s=s[2]&&RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"),u=o=f.length;while(o--)a=f[o],!i&&g!==a.origType||n&&n.guid!==a.guid||s&&!s.test(a.namespace)||r&&r!==a.selector&&("**"!==r||!a.selector)||(f.splice(o,1),a.selector&&f.delegateCount--,p.remove&&p.remove.call(e,a));u&&!f.length&&(p.teardown&&p.teardown.call(e,h,m.handle)!==!1||b.removeEvent(e,d,m.handle),delete c[d])}else for(d in c)b.event.remove(e,d+t[l],n,r,!0);b.isEmptyObject(c)&&(delete m.handle,b._removeData(e,"events"))}},trigger:function(n,r,i,a){var s,u,l,c,p,f,d,h=[i||o],g=y.call(n,"type")?n.type:n,m=y.call(n,"namespace")?n.namespace.split("."):[];if(l=f=i=i||o,3!==i.nodeType&&8!==i.nodeType&&!nt.test(g+b.event.triggered)&&(g.indexOf(".")>=0&&(m=g.split("."),g=m.shift(),m.sort()),u=0>g.indexOf(":")&&"on"+g,n=n[b.expando]?n:new b.Event(g,"object"==typeof n&&n),n.isTrigger=!0,n.namespace=m.join("."),n.namespace_re=n.namespace?RegExp("(^|\\.)"+m.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,n.result=t,n.target||(n.target=i),r=null==r?[n]:b.makeArray(r,[n]),p=b.event.special[g]||{},a||!p.trigger||p.trigger.apply(i,r)!==!1)){if(!a&&!p.noBubble&&!b.isWindow(i)){for(c=p.delegateType||g,nt.test(c+g)||(l=l.parentNode);l;l=l.parentNode)h.push(l),f=l;f===(i.ownerDocument||o)&&h.push(f.defaultView||f.parentWindow||e)}d=0;while((l=h[d++])&&!n.isPropagationStopped())n.type=d>1?c:p.bindType||g,s=(b._data(l,"events")||{})[n.type]&&b._data(l,"handle"),s&&s.apply(l,r),s=u&&l[u],s&&b.acceptData(l)&&s.apply&&s.apply(l,r)===!1&&n.preventDefault();if(n.type=g,!(a||n.isDefaultPrevented()||p._default&&p._default.apply(i.ownerDocument,r)!==!1||"click"===g&&b.nodeName(i,"a")||!b.acceptData(i)||!u||!i[g]||b.isWindow(i))){f=i[u],f&&(i[u]=null),b.event.triggered=g;try{i[g]()}catch(v){}b.event.triggered=t,f&&(i[u]=f)}return n.result}},dispatch:function(e){e=b.event.fix(e);var n,r,i,o,a,s=[],u=h.call(arguments),l=(b._data(this,"events")||{})[e.type]||[],c=b.event.special[e.type]||{};if(u[0]=e,e.delegateTarget=this,!c.preDispatch||c.preDispatch.call(this,e)!==!1){s=b.event.handlers.call(this,e,l),n=0;while((o=s[n++])&&!e.isPropagationStopped()){e.currentTarget=o.elem,a=0;while((i=o.handlers[a++])&&!e.isImmediatePropagationStopped())(!e.namespace_re||e.namespace_re.test(i.namespace))&&(e.handleObj=i,e.data=i.data,r=((b.event.special[i.origType]||{}).handle||i.handler).apply(o.elem,u),r!==t&&(e.result=r)===!1&&(e.preventDefault(),e.stopPropagation()))}return c.postDispatch&&c.postDispatch.call(this,e),e.result}},handlers:function(e,n){var r,i,o,a,s=[],u=n.delegateCount,l=e.target;if(u&&l.nodeType&&(!e.button||"click"!==e.type))for(;l!=this;l=l.parentNode||this)if(1===l.nodeType&&(l.disabled!==!0||"click"!==e.type)){for(o=[],a=0;u>a;a++)i=n[a],r=i.selector+" ",o[r]===t&&(o[r]=i.needsContext?b(r,this).index(l)>=0:b.find(r,this,null,[l]).length),o[r]&&o.push(i);o.length&&s.push({elem:l,handlers:o})}return n.length>u&&s.push({elem:this,handlers:n.slice(u)}),s},fix:function(e){if(e[b.expando])return e;var t,n,r,i=e.type,a=e,s=this.fixHooks[i];s||(this.fixHooks[i]=s=tt.test(i)?this.mouseHooks:et.test(i)?this.keyHooks:{}),r=s.props?this.props.concat(s.props):this.props,e=new b.Event(a),t=r.length;while(t--)n=r[t],e[n]=a[n];return e.target||(e.target=a.srcElement||o),3===e.target.nodeType&&(e.target=e.target.parentNode),e.metaKey=!!e.metaKey,s.filter?s.filter(e,a):e},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(e,t){return null==e.which&&(e.which=null!=t.charCode?t.charCode:t.keyCode),e}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(e,n){var r,i,a,s=n.button,u=n.fromElement;return null==e.pageX&&null!=n.clientX&&(i=e.target.ownerDocument||o,a=i.documentElement,r=i.body,e.pageX=n.clientX+(a&&a.scrollLeft||r&&r.scrollLeft||0)-(a&&a.clientLeft||r&&r.clientLeft||0),e.pageY=n.clientY+(a&&a.scrollTop||r&&r.scrollTop||0)-(a&&a.clientTop||r&&r.clientTop||0)),!e.relatedTarget&&u&&(e.relatedTarget=u===e.target?n.toElement:u),e.which||s===t||(e.which=1&s?1:2&s?3:4&s?2:0),e}},special:{load:{noBubble:!0},click:{trigger:function(){return b.nodeName(this,"input")&&"checkbox"===this.type&&this.click?(this.click(),!1):t}},focus:{trigger:function(){if(this!==o.activeElement&&this.focus)try{return this.focus(),!1}catch(e){}},delegateType:"focusin"},blur:{trigger:function(){return this===o.activeElement&&this.blur?(this.blur(),!1):t},delegateType:"focusout"},beforeunload:{postDispatch:function(e){e.result!==t&&(e.originalEvent.returnValue=e.result)}}},simulate:function(e,t,n,r){var i=b.extend(new b.Event,n,{type:e,isSimulated:!0,originalEvent:{}});r?b.event.trigger(i,null,t):b.event.dispatch.call(t,i),i.isDefaultPrevented()&&n.preventDefault()}},b.removeEvent=o.removeEventListener?function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n,!1)}:function(e,t,n){var r="on"+t;e.detachEvent&&(typeof e[r]===i&&(e[r]=null),e.detachEvent(r,n))},b.Event=function(e,n){return this instanceof b.Event?(e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||e.returnValue===!1||e.getPreventDefault&&e.getPreventDefault()?it:ot):this.type=e,n&&b.extend(this,n),this.timeStamp=e&&e.timeStamp||b.now(),this[b.expando]=!0,t):new b.Event(e,n)},b.Event.prototype={isDefaultPrevented:ot,isPropagationStopped:ot,isImmediatePropagationStopped:ot,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=it,e&&(e.preventDefault?e.preventDefault():e.returnValue=!1)},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=it,e&&(e.stopPropagation&&e.stopPropagation(),e.cancelBubble=!0)},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=it,this.stopPropagation()}},b.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(e,t){b.event.special[e]={delegateType:t,bindType:t,handle:function(e){var n,r=this,i=e.relatedTarget,o=e.handleObj;
return(!i||i!==r&&!b.contains(r,i))&&(e.type=o.origType,n=o.handler.apply(this,arguments),e.type=t),n}}}),b.support.submitBubbles||(b.event.special.submit={setup:function(){return b.nodeName(this,"form")?!1:(b.event.add(this,"click._submit keypress._submit",function(e){var n=e.target,r=b.nodeName(n,"input")||b.nodeName(n,"button")?n.form:t;r&&!b._data(r,"submitBubbles")&&(b.event.add(r,"submit._submit",function(e){e._submit_bubble=!0}),b._data(r,"submitBubbles",!0))}),t)},postDispatch:function(e){e._submit_bubble&&(delete e._submit_bubble,this.parentNode&&!e.isTrigger&&b.event.simulate("submit",this.parentNode,e,!0))},teardown:function(){return b.nodeName(this,"form")?!1:(b.event.remove(this,"._submit"),t)}}),b.support.changeBubbles||(b.event.special.change={setup:function(){return Z.test(this.nodeName)?(("checkbox"===this.type||"radio"===this.type)&&(b.event.add(this,"propertychange._change",function(e){"checked"===e.originalEvent.propertyName&&(this._just_changed=!0)}),b.event.add(this,"click._change",function(e){this._just_changed&&!e.isTrigger&&(this._just_changed=!1),b.event.simulate("change",this,e,!0)})),!1):(b.event.add(this,"beforeactivate._change",function(e){var t=e.target;Z.test(t.nodeName)&&!b._data(t,"changeBubbles")&&(b.event.add(t,"change._change",function(e){!this.parentNode||e.isSimulated||e.isTrigger||b.event.simulate("change",this.parentNode,e,!0)}),b._data(t,"changeBubbles",!0))}),t)},handle:function(e){var n=e.target;return this!==n||e.isSimulated||e.isTrigger||"radio"!==n.type&&"checkbox"!==n.type?e.handleObj.handler.apply(this,arguments):t},teardown:function(){return b.event.remove(this,"._change"),!Z.test(this.nodeName)}}),b.support.focusinBubbles||b.each({focus:"focusin",blur:"focusout"},function(e,t){var n=0,r=function(e){b.event.simulate(t,e.target,b.event.fix(e),!0)};b.event.special[t]={setup:function(){0===n++&&o.addEventListener(e,r,!0)},teardown:function(){0===--n&&o.removeEventListener(e,r,!0)}}}),b.fn.extend({on:function(e,n,r,i,o){var a,s;if("object"==typeof e){"string"!=typeof n&&(r=r||n,n=t);for(a in e)this.on(a,n,r,e[a],o);return this}if(null==r&&null==i?(i=n,r=n=t):null==i&&("string"==typeof n?(i=r,r=t):(i=r,r=n,n=t)),i===!1)i=ot;else if(!i)return this;return 1===o&&(s=i,i=function(e){return b().off(e),s.apply(this,arguments)},i.guid=s.guid||(s.guid=b.guid++)),this.each(function(){b.event.add(this,e,i,r,n)})},one:function(e,t,n,r){return this.on(e,t,n,r,1)},off:function(e,n,r){var i,o;if(e&&e.preventDefault&&e.handleObj)return i=e.handleObj,b(e.delegateTarget).off(i.namespace?i.origType+"."+i.namespace:i.origType,i.selector,i.handler),this;if("object"==typeof e){for(o in e)this.off(o,n,e[o]);return this}return(n===!1||"function"==typeof n)&&(r=n,n=t),r===!1&&(r=ot),this.each(function(){b.event.remove(this,e,r,n)})},bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)},trigger:function(e,t){return this.each(function(){b.event.trigger(e,t,this)})},triggerHandler:function(e,n){var r=this[0];return r?b.event.trigger(e,n,r,!0):t}}),function(e,t){var n,r,i,o,a,s,u,l,c,p,f,d,h,g,m,y,v,x="sizzle"+-new Date,w=e.document,T={},N=0,C=0,k=it(),E=it(),S=it(),A=typeof t,j=1<<31,D=[],L=D.pop,H=D.push,q=D.slice,M=D.indexOf||function(e){var t=0,n=this.length;for(;n>t;t++)if(this[t]===e)return t;return-1},_="[\\x20\\t\\r\\n\\f]",F="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",O=F.replace("w","w#"),B="([*^$|!~]?=)",P="\\["+_+"*("+F+")"+_+"*(?:"+B+_+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+O+")|)|)"+_+"*\\]",R=":("+F+")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|"+P.replace(3,8)+")*)|.*)\\)|)",W=RegExp("^"+_+"+|((?:^|[^\\\\])(?:\\\\.)*)"+_+"+$","g"),$=RegExp("^"+_+"*,"+_+"*"),I=RegExp("^"+_+"*([\\x20\\t\\r\\n\\f>+~])"+_+"*"),z=RegExp(R),X=RegExp("^"+O+"$"),U={ID:RegExp("^#("+F+")"),CLASS:RegExp("^\\.("+F+")"),NAME:RegExp("^\\[name=['\"]?("+F+")['\"]?\\]"),TAG:RegExp("^("+F.replace("w","w*")+")"),ATTR:RegExp("^"+P),PSEUDO:RegExp("^"+R),CHILD:RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+_+"*(even|odd|(([+-]|)(\\d*)n|)"+_+"*(?:([+-]|)"+_+"*(\\d+)|))"+_+"*\\)|)","i"),needsContext:RegExp("^"+_+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+_+"*((?:-\\d)?\\d*)"+_+"*\\)|)(?=[^-]|$)","i")},V=/[\x20\t\r\n\f]*[+~]/,Y=/^[^{]+\{\s*\[native code/,J=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,G=/^(?:input|select|textarea|button)$/i,Q=/^h\d$/i,K=/'|\\/g,Z=/\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,et=/\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,tt=function(e,t){var n="0x"+t-65536;return n!==n?t:0>n?String.fromCharCode(n+65536):String.fromCharCode(55296|n>>10,56320|1023&n)};try{q.call(w.documentElement.childNodes,0)[0].nodeType}catch(nt){q=function(e){var t,n=[];while(t=this[e++])n.push(t);return n}}function rt(e){return Y.test(e+"")}function it(){var e,t=[];return e=function(n,r){return t.push(n+=" ")>i.cacheLength&&delete e[t.shift()],e[n]=r}}function ot(e){return e[x]=!0,e}function at(e){var t=p.createElement("div");try{return e(t)}catch(n){return!1}finally{t=null}}function st(e,t,n,r){var i,o,a,s,u,l,f,g,m,v;if((t?t.ownerDocument||t:w)!==p&&c(t),t=t||p,n=n||[],!e||"string"!=typeof e)return n;if(1!==(s=t.nodeType)&&9!==s)return[];if(!d&&!r){if(i=J.exec(e))if(a=i[1]){if(9===s){if(o=t.getElementById(a),!o||!o.parentNode)return n;if(o.id===a)return n.push(o),n}else if(t.ownerDocument&&(o=t.ownerDocument.getElementById(a))&&y(t,o)&&o.id===a)return n.push(o),n}else{if(i[2])return H.apply(n,q.call(t.getElementsByTagName(e),0)),n;if((a=i[3])&&T.getByClassName&&t.getElementsByClassName)return H.apply(n,q.call(t.getElementsByClassName(a),0)),n}if(T.qsa&&!h.test(e)){if(f=!0,g=x,m=t,v=9===s&&e,1===s&&"object"!==t.nodeName.toLowerCase()){l=ft(e),(f=t.getAttribute("id"))?g=f.replace(K,"\\$&"):t.setAttribute("id",g),g="[id='"+g+"'] ",u=l.length;while(u--)l[u]=g+dt(l[u]);m=V.test(e)&&t.parentNode||t,v=l.join(",")}if(v)try{return H.apply(n,q.call(m.querySelectorAll(v),0)),n}catch(b){}finally{f||t.removeAttribute("id")}}}return wt(e.replace(W,"$1"),t,n,r)}a=st.isXML=function(e){var t=e&&(e.ownerDocument||e).documentElement;return t?"HTML"!==t.nodeName:!1},c=st.setDocument=function(e){var n=e?e.ownerDocument||e:w;return n!==p&&9===n.nodeType&&n.documentElement?(p=n,f=n.documentElement,d=a(n),T.tagNameNoComments=at(function(e){return e.appendChild(n.createComment("")),!e.getElementsByTagName("*").length}),T.attributes=at(function(e){e.innerHTML="<select></select>";var t=typeof e.lastChild.getAttribute("multiple");return"boolean"!==t&&"string"!==t}),T.getByClassName=at(function(e){return e.innerHTML="<div class='hidden e'></div><div class='hidden'></div>",e.getElementsByClassName&&e.getElementsByClassName("e").length?(e.lastChild.className="e",2===e.getElementsByClassName("e").length):!1}),T.getByName=at(function(e){e.id=x+0,e.innerHTML="<a name='"+x+"'></a><div name='"+x+"'></div>",f.insertBefore(e,f.firstChild);var t=n.getElementsByName&&n.getElementsByName(x).length===2+n.getElementsByName(x+0).length;return T.getIdNotName=!n.getElementById(x),f.removeChild(e),t}),i.attrHandle=at(function(e){return e.innerHTML="<a href='#'></a>",e.firstChild&&typeof e.firstChild.getAttribute!==A&&"#"===e.firstChild.getAttribute("href")})?{}:{href:function(e){return e.getAttribute("href",2)},type:function(e){return e.getAttribute("type")}},T.getIdNotName?(i.find.ID=function(e,t){if(typeof t.getElementById!==A&&!d){var n=t.getElementById(e);return n&&n.parentNode?[n]:[]}},i.filter.ID=function(e){var t=e.replace(et,tt);return function(e){return e.getAttribute("id")===t}}):(i.find.ID=function(e,n){if(typeof n.getElementById!==A&&!d){var r=n.getElementById(e);return r?r.id===e||typeof r.getAttributeNode!==A&&r.getAttributeNode("id").value===e?[r]:t:[]}},i.filter.ID=function(e){var t=e.replace(et,tt);return function(e){var n=typeof e.getAttributeNode!==A&&e.getAttributeNode("id");return n&&n.value===t}}),i.find.TAG=T.tagNameNoComments?function(e,n){return typeof n.getElementsByTagName!==A?n.getElementsByTagName(e):t}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){while(n=o[i++])1===n.nodeType&&r.push(n);return r}return o},i.find.NAME=T.getByName&&function(e,n){return typeof n.getElementsByName!==A?n.getElementsByName(name):t},i.find.CLASS=T.getByClassName&&function(e,n){return typeof n.getElementsByClassName===A||d?t:n.getElementsByClassName(e)},g=[],h=[":focus"],(T.qsa=rt(n.querySelectorAll))&&(at(function(e){e.innerHTML="<select><option selected=''></option></select>",e.querySelectorAll("[selected]").length||h.push("\\["+_+"*(?:checked|disabled|ismap|multiple|readonly|selected|value)"),e.querySelectorAll(":checked").length||h.push(":checked")}),at(function(e){e.innerHTML="<input type='hidden' i=''/>",e.querySelectorAll("[i^='']").length&&h.push("[*^$]="+_+"*(?:\"\"|'')"),e.querySelectorAll(":enabled").length||h.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),h.push(",.*:")})),(T.matchesSelector=rt(m=f.matchesSelector||f.mozMatchesSelector||f.webkitMatchesSelector||f.oMatchesSelector||f.msMatchesSelector))&&at(function(e){T.disconnectedMatch=m.call(e,"div"),m.call(e,"[s!='']:x"),g.push("!=",R)}),h=RegExp(h.join("|")),g=RegExp(g.join("|")),y=rt(f.contains)||f.compareDocumentPosition?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return!0;return!1},v=f.compareDocumentPosition?function(e,t){var r;return e===t?(u=!0,0):(r=t.compareDocumentPosition&&e.compareDocumentPosition&&e.compareDocumentPosition(t))?1&r||e.parentNode&&11===e.parentNode.nodeType?e===n||y(w,e)?-1:t===n||y(w,t)?1:0:4&r?-1:1:e.compareDocumentPosition?-1:1}:function(e,t){var r,i=0,o=e.parentNode,a=t.parentNode,s=[e],l=[t];if(e===t)return u=!0,0;if(!o||!a)return e===n?-1:t===n?1:o?-1:a?1:0;if(o===a)return ut(e,t);r=e;while(r=r.parentNode)s.unshift(r);r=t;while(r=r.parentNode)l.unshift(r);while(s[i]===l[i])i++;return i?ut(s[i],l[i]):s[i]===w?-1:l[i]===w?1:0},u=!1,[0,0].sort(v),T.detectDuplicates=u,p):p},st.matches=function(e,t){return st(e,null,null,t)},st.matchesSelector=function(e,t){if((e.ownerDocument||e)!==p&&c(e),t=t.replace(Z,"='$1']"),!(!T.matchesSelector||d||g&&g.test(t)||h.test(t)))try{var n=m.call(e,t);if(n||T.disconnectedMatch||e.document&&11!==e.document.nodeType)return n}catch(r){}return st(t,p,null,[e]).length>0},st.contains=function(e,t){return(e.ownerDocument||e)!==p&&c(e),y(e,t)},st.attr=function(e,t){var n;return(e.ownerDocument||e)!==p&&c(e),d||(t=t.toLowerCase()),(n=i.attrHandle[t])?n(e):d||T.attributes?e.getAttribute(t):((n=e.getAttributeNode(t))||e.getAttribute(t))&&e[t]===!0?t:n&&n.specified?n.value:null},st.error=function(e){throw Error("Syntax error, unrecognized expression: "+e)},st.uniqueSort=function(e){var t,n=[],r=1,i=0;if(u=!T.detectDuplicates,e.sort(v),u){for(;t=e[r];r++)t===e[r-1]&&(i=n.push(r));while(i--)e.splice(n[i],1)}return e};function ut(e,t){var n=t&&e,r=n&&(~t.sourceIndex||j)-(~e.sourceIndex||j);if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return-1;return e?1:-1}function lt(e){return function(t){var n=t.nodeName.toLowerCase();return"input"===n&&t.type===e}}function ct(e){return function(t){var n=t.nodeName.toLowerCase();return("input"===n||"button"===n)&&t.type===e}}function pt(e){return ot(function(t){return t=+t,ot(function(n,r){var i,o=e([],n.length,t),a=o.length;while(a--)n[i=o[a]]&&(n[i]=!(r[i]=n[i]))})})}o=st.getText=function(e){var t,n="",r=0,i=e.nodeType;if(i){if(1===i||9===i||11===i){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=o(e)}else if(3===i||4===i)return e.nodeValue}else for(;t=e[r];r++)n+=o(t);return n},i=st.selectors={cacheLength:50,createPseudo:ot,match:U,find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(et,tt),e[3]=(e[4]||e[5]||"").replace(et,tt),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||st.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&st.error(e[0]),e},PSEUDO:function(e){var t,n=!e[5]&&e[2];return U.CHILD.test(e[0])?null:(e[4]?e[2]=e[4]:n&&z.test(n)&&(t=ft(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){return"*"===e?function(){return!0}:(e=e.replace(et,tt).toLowerCase(),function(t){return t.nodeName&&t.nodeName.toLowerCase()===e})},CLASS:function(e){var t=k[e+" "];return t||(t=RegExp("(^|"+_+")"+e+"("+_+"|$)"))&&k(e,function(e){return t.test(e.className||typeof e.getAttribute!==A&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r){var i=st.attr(r,e);return null==i?"!="===t:t?(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i+" ").indexOf(n)>-1:"|="===t?i===n||i.slice(0,n.length+1)===n+"-":!1):!0}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),a="last"!==e.slice(-4),s="of-type"===t;return 1===r&&0===i?function(e){return!!e.parentNode}:function(t,n,u){var l,c,p,f,d,h,g=o!==a?"nextSibling":"previousSibling",m=t.parentNode,y=s&&t.nodeName.toLowerCase(),v=!u&&!s;if(m){if(o){while(g){p=t;while(p=p[g])if(s?p.nodeName.toLowerCase()===y:1===p.nodeType)return!1;h=g="only"===e&&!h&&"nextSibling"}return!0}if(h=[a?m.firstChild:m.lastChild],a&&v){c=m[x]||(m[x]={}),l=c[e]||[],d=l[0]===N&&l[1],f=l[0]===N&&l[2],p=d&&m.childNodes[d];while(p=++d&&p&&p[g]||(f=d=0)||h.pop())if(1===p.nodeType&&++f&&p===t){c[e]=[N,d,f];break}}else if(v&&(l=(t[x]||(t[x]={}))[e])&&l[0]===N)f=l[1];else while(p=++d&&p&&p[g]||(f=d=0)||h.pop())if((s?p.nodeName.toLowerCase()===y:1===p.nodeType)&&++f&&(v&&((p[x]||(p[x]={}))[e]=[N,f]),p===t))break;return f-=i,f===r||0===f%r&&f/r>=0}}},PSEUDO:function(e,t){var n,r=i.pseudos[e]||i.setFilters[e.toLowerCase()]||st.error("unsupported pseudo: "+e);return r[x]?r(t):r.length>1?(n=[e,e,"",t],i.setFilters.hasOwnProperty(e.toLowerCase())?ot(function(e,n){var i,o=r(e,t),a=o.length;while(a--)i=M.call(e,o[a]),e[i]=!(n[i]=o[a])}):function(e){return r(e,0,n)}):r}},pseudos:{not:ot(function(e){var t=[],n=[],r=s(e.replace(W,"$1"));return r[x]?ot(function(e,t,n,i){var o,a=r(e,null,i,[]),s=e.length;while(s--)(o=a[s])&&(e[s]=!(t[s]=o))}):function(e,i,o){return t[0]=e,r(t,null,o,n),!n.pop()}}),has:ot(function(e){return function(t){return st(e,t).length>0}}),contains:ot(function(e){return function(t){return(t.textContent||t.innerText||o(t)).indexOf(e)>-1}}),lang:ot(function(e){return X.test(e||"")||st.error("unsupported lang: "+e),e=e.replace(et,tt).toLowerCase(),function(t){var n;do if(n=d?t.getAttribute("xml:lang")||t.getAttribute("lang"):t.lang)return n=n.toLowerCase(),n===e||0===n.indexOf(e+"-");while((t=t.parentNode)&&1===t.nodeType);return!1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===f},focus:function(e){return e===p.activeElement&&(!p.hasFocus||p.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:function(e){return e.disabled===!1},disabled:function(e){return e.disabled===!0},checked:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,e.selected===!0},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeName>"@"||3===e.nodeType||4===e.nodeType)return!1;return!0},parent:function(e){return!i.pseudos.empty(e)},header:function(e){return Q.test(e.nodeName)},input:function(e){return G.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return"input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||t.toLowerCase()===e.type)},first:pt(function(){return[0]}),last:pt(function(e,t){return[t-1]}),eq:pt(function(e,t,n){return[0>n?n+t:n]}),even:pt(function(e,t){var n=0;for(;t>n;n+=2)e.push(n);return e}),odd:pt(function(e,t){var n=1;for(;t>n;n+=2)e.push(n);return e}),lt:pt(function(e,t,n){var r=0>n?n+t:n;for(;--r>=0;)e.push(r);return e}),gt:pt(function(e,t,n){var r=0>n?n+t:n;for(;t>++r;)e.push(r);return e})}};for(n in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})i.pseudos[n]=lt(n);for(n in{submit:!0,reset:!0})i.pseudos[n]=ct(n);function ft(e,t){var n,r,o,a,s,u,l,c=E[e+" "];if(c)return t?0:c.slice(0);s=e,u=[],l=i.preFilter;while(s){(!n||(r=$.exec(s)))&&(r&&(s=s.slice(r[0].length)||s),u.push(o=[])),n=!1,(r=I.exec(s))&&(n=r.shift(),o.push({value:n,type:r[0].replace(W," ")}),s=s.slice(n.length));for(a in i.filter)!(r=U[a].exec(s))||l[a]&&!(r=l[a](r))||(n=r.shift(),o.push({value:n,type:a,matches:r}),s=s.slice(n.length));if(!n)break}return t?s.length:s?st.error(e):E(e,u).slice(0)}function dt(e){var t=0,n=e.length,r="";for(;n>t;t++)r+=e[t].value;return r}function ht(e,t,n){var i=t.dir,o=n&&"parentNode"===i,a=C++;return t.first?function(t,n,r){while(t=t[i])if(1===t.nodeType||o)return e(t,n,r)}:function(t,n,s){var u,l,c,p=N+" "+a;if(s){while(t=t[i])if((1===t.nodeType||o)&&e(t,n,s))return!0}else while(t=t[i])if(1===t.nodeType||o)if(c=t[x]||(t[x]={}),(l=c[i])&&l[0]===p){if((u=l[1])===!0||u===r)return u===!0}else if(l=c[i]=[p],l[1]=e(t,n,s)||r,l[1]===!0)return!0}}function gt(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return!1;return!0}:e[0]}function mt(e,t,n,r,i){var o,a=[],s=0,u=e.length,l=null!=t;for(;u>s;s++)(o=e[s])&&(!n||n(o,r,i))&&(a.push(o),l&&t.push(s));return a}function yt(e,t,n,r,i,o){return r&&!r[x]&&(r=yt(r)),i&&!i[x]&&(i=yt(i,o)),ot(function(o,a,s,u){var l,c,p,f=[],d=[],h=a.length,g=o||xt(t||"*",s.nodeType?[s]:s,[]),m=!e||!o&&t?g:mt(g,f,e,s,u),y=n?i||(o?e:h||r)?[]:a:m;if(n&&n(m,y,s,u),r){l=mt(y,d),r(l,[],s,u),c=l.length;while(c--)(p=l[c])&&(y[d[c]]=!(m[d[c]]=p))}if(o){if(i||e){if(i){l=[],c=y.length;while(c--)(p=y[c])&&l.push(m[c]=p);i(null,y=[],l,u)}c=y.length;while(c--)(p=y[c])&&(l=i?M.call(o,p):f[c])>-1&&(o[l]=!(a[l]=p))}}else y=mt(y===a?y.splice(h,y.length):y),i?i(null,a,y,u):H.apply(a,y)})}function vt(e){var t,n,r,o=e.length,a=i.relative[e[0].type],s=a||i.relative[" "],u=a?1:0,c=ht(function(e){return e===t},s,!0),p=ht(function(e){return M.call(t,e)>-1},s,!0),f=[function(e,n,r){return!a&&(r||n!==l)||((t=n).nodeType?c(e,n,r):p(e,n,r))}];for(;o>u;u++)if(n=i.relative[e[u].type])f=[ht(gt(f),n)];else{if(n=i.filter[e[u].type].apply(null,e[u].matches),n[x]){for(r=++u;o>r;r++)if(i.relative[e[r].type])break;return yt(u>1&&gt(f),u>1&&dt(e.slice(0,u-1)).replace(W,"$1"),n,r>u&&vt(e.slice(u,r)),o>r&&vt(e=e.slice(r)),o>r&&dt(e))}f.push(n)}return gt(f)}function bt(e,t){var n=0,o=t.length>0,a=e.length>0,s=function(s,u,c,f,d){var h,g,m,y=[],v=0,b="0",x=s&&[],w=null!=d,T=l,C=s||a&&i.find.TAG("*",d&&u.parentNode||u),k=N+=null==T?1:Math.random()||.1;for(w&&(l=u!==p&&u,r=n);null!=(h=C[b]);b++){if(a&&h){g=0;while(m=e[g++])if(m(h,u,c)){f.push(h);break}w&&(N=k,r=++n)}o&&((h=!m&&h)&&v--,s&&x.push(h))}if(v+=b,o&&b!==v){g=0;while(m=t[g++])m(x,y,u,c);if(s){if(v>0)while(b--)x[b]||y[b]||(y[b]=L.call(f));y=mt(y)}H.apply(f,y),w&&!s&&y.length>0&&v+t.length>1&&st.uniqueSort(f)}return w&&(N=k,l=T),x};return o?ot(s):s}s=st.compile=function(e,t){var n,r=[],i=[],o=S[e+" "];if(!o){t||(t=ft(e)),n=t.length;while(n--)o=vt(t[n]),o[x]?r.push(o):i.push(o);o=S(e,bt(i,r))}return o};function xt(e,t,n){var r=0,i=t.length;for(;i>r;r++)st(e,t[r],n);return n}function wt(e,t,n,r){var o,a,u,l,c,p=ft(e);if(!r&&1===p.length){if(a=p[0]=p[0].slice(0),a.length>2&&"ID"===(u=a[0]).type&&9===t.nodeType&&!d&&i.relative[a[1].type]){if(t=i.find.ID(u.matches[0].replace(et,tt),t)[0],!t)return n;e=e.slice(a.shift().value.length)}o=U.needsContext.test(e)?0:a.length;while(o--){if(u=a[o],i.relative[l=u.type])break;if((c=i.find[l])&&(r=c(u.matches[0].replace(et,tt),V.test(a[0].type)&&t.parentNode||t))){if(a.splice(o,1),e=r.length&&dt(a),!e)return H.apply(n,q.call(r,0)),n;break}}}return s(e,p)(r,t,d,n,V.test(e)),n}i.pseudos.nth=i.pseudos.eq;function Tt(){}i.filters=Tt.prototype=i.pseudos,i.setFilters=new Tt,c(),st.attr=b.attr,b.find=st,b.expr=st.selectors,b.expr[":"]=b.expr.pseudos,b.unique=st.uniqueSort,b.text=st.getText,b.isXMLDoc=st.isXML,b.contains=st.contains}(e);var at=/Until$/,st=/^(?:parents|prev(?:Until|All))/,ut=/^.[^:#\[\.,]*$/,lt=b.expr.match.needsContext,ct={children:!0,contents:!0,next:!0,prev:!0};b.fn.extend({find:function(e){var t,n,r,i=this.length;if("string"!=typeof e)return r=this,this.pushStack(b(e).filter(function(){for(t=0;i>t;t++)if(b.contains(r[t],this))return!0}));for(n=[],t=0;i>t;t++)b.find(e,this[t],n);return n=this.pushStack(i>1?b.unique(n):n),n.selector=(this.selector?this.selector+" ":"")+e,n},has:function(e){var t,n=b(e,this),r=n.length;return this.filter(function(){for(t=0;r>t;t++)if(b.contains(this,n[t]))return!0})},not:function(e){return this.pushStack(ft(this,e,!1))},filter:function(e){return this.pushStack(ft(this,e,!0))},is:function(e){return!!e&&("string"==typeof e?lt.test(e)?b(e,this.context).index(this[0])>=0:b.filter(e,this).length>0:this.filter(e).length>0)},closest:function(e,t){var n,r=0,i=this.length,o=[],a=lt.test(e)||"string"!=typeof e?b(e,t||this.context):0;for(;i>r;r++){n=this[r];while(n&&n.ownerDocument&&n!==t&&11!==n.nodeType){if(a?a.index(n)>-1:b.find.matchesSelector(n,e)){o.push(n);break}n=n.parentNode}}return this.pushStack(o.length>1?b.unique(o):o)},index:function(e){return e?"string"==typeof e?b.inArray(this[0],b(e)):b.inArray(e.jquery?e[0]:e,this):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){var n="string"==typeof e?b(e,t):b.makeArray(e&&e.nodeType?[e]:e),r=b.merge(this.get(),n);return this.pushStack(b.unique(r))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}}),b.fn.andSelf=b.fn.addBack;function pt(e,t){do e=e[t];while(e&&1!==e.nodeType);return e}b.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return b.dir(e,"parentNode")},parentsUntil:function(e,t,n){return b.dir(e,"parentNode",n)},next:function(e){return pt(e,"nextSibling")},prev:function(e){return pt(e,"previousSibling")},nextAll:function(e){return b.dir(e,"nextSibling")},prevAll:function(e){return b.dir(e,"previousSibling")},nextUntil:function(e,t,n){return b.dir(e,"nextSibling",n)},prevUntil:function(e,t,n){return b.dir(e,"previousSibling",n)},siblings:function(e){return b.sibling((e.parentNode||{}).firstChild,e)},children:function(e){return b.sibling(e.firstChild)},contents:function(e){return b.nodeName(e,"iframe")?e.contentDocument||e.contentWindow.document:b.merge([],e.childNodes)}},function(e,t){b.fn[e]=function(n,r){var i=b.map(this,t,n);return at.test(e)||(r=n),r&&"string"==typeof r&&(i=b.filter(r,i)),i=this.length>1&&!ct[e]?b.unique(i):i,this.length>1&&st.test(e)&&(i=i.reverse()),this.pushStack(i)}}),b.extend({filter:function(e,t,n){return n&&(e=":not("+e+")"),1===t.length?b.find.matchesSelector(t[0],e)?[t[0]]:[]:b.find.matches(e,t)},dir:function(e,n,r){var i=[],o=e[n];while(o&&9!==o.nodeType&&(r===t||1!==o.nodeType||!b(o).is(r)))1===o.nodeType&&i.push(o),o=o[n];return i},sibling:function(e,t){var n=[];for(;e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n}});function ft(e,t,n){if(t=t||0,b.isFunction(t))return b.grep(e,function(e,r){var i=!!t.call(e,r,e);return i===n});if(t.nodeType)return b.grep(e,function(e){return e===t===n});if("string"==typeof t){var r=b.grep(e,function(e){return 1===e.nodeType});if(ut.test(t))return b.filter(t,r,!n);t=b.filter(t,r)}return b.grep(e,function(e){return b.inArray(e,t)>=0===n})}function dt(e){var t=ht.split("|"),n=e.createDocumentFragment();if(n.createElement)while(t.length)n.createElement(t.pop());return n}var ht="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",gt=/ jQuery\d+="(?:null|\d+)"/g,mt=RegExp("<(?:"+ht+")[\\s/>]","i"),yt=/^\s+/,vt=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,bt=/<([\w:]+)/,xt=/<tbody/i,wt=/<|&#?\w+;/,Tt=/<(?:script|style|link)/i,Nt=/^(?:checkbox|radio)$/i,Ct=/checked\s*(?:[^=]|=\s*.checked.)/i,kt=/^$|\/(?:java|ecma)script/i,Et=/^true\/(.*)/,St=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,At={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],area:[1,"<map>","</map>"],param:[1,"<object>","</object>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:b.support.htmlSerialize?[0,"",""]:[1,"X<div>","</div>"]},jt=dt(o),Dt=jt.appendChild(o.createElement("div"));At.optgroup=At.option,At.tbody=At.tfoot=At.colgroup=At.caption=At.thead,At.th=At.td,b.fn.extend({text:function(e){return b.access(this,function(e){return e===t?b.text(this):this.empty().append((this[0]&&this[0].ownerDocument||o).createTextNode(e))},null,e,arguments.length)},wrapAll:function(e){if(b.isFunction(e))return this.each(function(t){b(this).wrapAll(e.call(this,t))});if(this[0]){var t=b(e,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstChild&&1===e.firstChild.nodeType)e=e.firstChild;return e}).append(this)}return this},wrapInner:function(e){return b.isFunction(e)?this.each(function(t){b(this).wrapInner(e.call(this,t))}):this.each(function(){var t=b(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)})},wrap:function(e){var t=b.isFunction(e);return this.each(function(n){b(this).wrapAll(t?e.call(this,n):e)})},unwrap:function(){return this.parent().each(function(){b.nodeName(this,"body")||b(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(e){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&this.appendChild(e)})},prepend:function(){return this.domManip(arguments,!0,function(e){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&this.insertBefore(e,this.firstChild)})},before:function(){return this.domManip(arguments,!1,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return this.domManip(arguments,!1,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},remove:function(e,t){var n,r=0;for(;null!=(n=this[r]);r++)(!e||b.filter(e,[n]).length>0)&&(t||1!==n.nodeType||b.cleanData(Ot(n)),n.parentNode&&(t&&b.contains(n.ownerDocument,n)&&Mt(Ot(n,"script")),n.parentNode.removeChild(n)));return this},empty:function(){var e,t=0;for(;null!=(e=this[t]);t++){1===e.nodeType&&b.cleanData(Ot(e,!1));while(e.firstChild)e.removeChild(e.firstChild);e.options&&b.nodeName(e,"select")&&(e.options.length=0)}return this},clone:function(e,t){return e=null==e?!1:e,t=null==t?e:t,this.map(function(){return b.clone(this,e,t)})},html:function(e){return b.access(this,function(e){var n=this[0]||{},r=0,i=this.length;if(e===t)return 1===n.nodeType?n.innerHTML.replace(gt,""):t;if(!("string"!=typeof e||Tt.test(e)||!b.support.htmlSerialize&&mt.test(e)||!b.support.leadingWhitespace&&yt.test(e)||At[(bt.exec(e)||["",""])[1].toLowerCase()])){e=e.replace(vt,"<$1></$2>");try{for(;i>r;r++)n=this[r]||{},1===n.nodeType&&(b.cleanData(Ot(n,!1)),n.innerHTML=e);n=0}catch(o){}}n&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(e){var t=b.isFunction(e);return t||"string"==typeof e||(e=b(e).not(this).detach()),this.domManip([e],!0,function(e){var t=this.nextSibling,n=this.parentNode;n&&(b(this).remove(),n.insertBefore(e,t))})},detach:function(e){return this.remove(e,!0)},domManip:function(e,n,r){e=f.apply([],e);var i,o,a,s,u,l,c=0,p=this.length,d=this,h=p-1,g=e[0],m=b.isFunction(g);if(m||!(1>=p||"string"!=typeof g||b.support.checkClone)&&Ct.test(g))return this.each(function(i){var o=d.eq(i);m&&(e[0]=g.call(this,i,n?o.html():t)),o.domManip(e,n,r)});if(p&&(l=b.buildFragment(e,this[0].ownerDocument,!1,this),i=l.firstChild,1===l.childNodes.length&&(l=i),i)){for(n=n&&b.nodeName(i,"tr"),s=b.map(Ot(l,"script"),Ht),a=s.length;p>c;c++)o=l,c!==h&&(o=b.clone(o,!0,!0),a&&b.merge(s,Ot(o,"script"))),r.call(n&&b.nodeName(this[c],"table")?Lt(this[c],"tbody"):this[c],o,c);if(a)for(u=s[s.length-1].ownerDocument,b.map(s,qt),c=0;a>c;c++)o=s[c],kt.test(o.type||"")&&!b._data(o,"globalEval")&&b.contains(u,o)&&(o.src?b.ajax({url:o.src,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0}):b.globalEval((o.text||o.textContent||o.innerHTML||"").replace(St,"")));l=i=null}return this}});function Lt(e,t){return e.getElementsByTagName(t)[0]||e.appendChild(e.ownerDocument.createElement(t))}function Ht(e){var t=e.getAttributeNode("type");return e.type=(t&&t.specified)+"/"+e.type,e}function qt(e){var t=Et.exec(e.type);return t?e.type=t[1]:e.removeAttribute("type"),e}function Mt(e,t){var n,r=0;for(;null!=(n=e[r]);r++)b._data(n,"globalEval",!t||b._data(t[r],"globalEval"))}function _t(e,t){if(1===t.nodeType&&b.hasData(e)){var n,r,i,o=b._data(e),a=b._data(t,o),s=o.events;if(s){delete a.handle,a.events={};for(n in s)for(r=0,i=s[n].length;i>r;r++)b.event.add(t,n,s[n][r])}a.data&&(a.data=b.extend({},a.data))}}function Ft(e,t){var n,r,i;if(1===t.nodeType){if(n=t.nodeName.toLowerCase(),!b.support.noCloneEvent&&t[b.expando]){i=b._data(t);for(r in i.events)b.removeEvent(t,r,i.handle);t.removeAttribute(b.expando)}"script"===n&&t.text!==e.text?(Ht(t).text=e.text,qt(t)):"object"===n?(t.parentNode&&(t.outerHTML=e.outerHTML),b.support.html5Clone&&e.innerHTML&&!b.trim(t.innerHTML)&&(t.innerHTML=e.innerHTML)):"input"===n&&Nt.test(e.type)?(t.defaultChecked=t.checked=e.checked,t.value!==e.value&&(t.value=e.value)):"option"===n?t.defaultSelected=t.selected=e.defaultSelected:("input"===n||"textarea"===n)&&(t.defaultValue=e.defaultValue)}}b.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){b.fn[e]=function(e){var n,r=0,i=[],o=b(e),a=o.length-1;for(;a>=r;r++)n=r===a?this:this.clone(!0),b(o[r])[t](n),d.apply(i,n.get());return this.pushStack(i)}});function Ot(e,n){var r,o,a=0,s=typeof e.getElementsByTagName!==i?e.getElementsByTagName(n||"*"):typeof e.querySelectorAll!==i?e.querySelectorAll(n||"*"):t;if(!s)for(s=[],r=e.childNodes||e;null!=(o=r[a]);a++)!n||b.nodeName(o,n)?s.push(o):b.merge(s,Ot(o,n));return n===t||n&&b.nodeName(e,n)?b.merge([e],s):s}function Bt(e){Nt.test(e.type)&&(e.defaultChecked=e.checked)}b.extend({clone:function(e,t,n){var r,i,o,a,s,u=b.contains(e.ownerDocument,e);if(b.support.html5Clone||b.isXMLDoc(e)||!mt.test("<"+e.nodeName+">")?o=e.cloneNode(!0):(Dt.innerHTML=e.outerHTML,Dt.removeChild(o=Dt.firstChild)),!(b.support.noCloneEvent&&b.support.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||b.isXMLDoc(e)))for(r=Ot(o),s=Ot(e),a=0;null!=(i=s[a]);++a)r[a]&&Ft(i,r[a]);if(t)if(n)for(s=s||Ot(e),r=r||Ot(o),a=0;null!=(i=s[a]);a++)_t(i,r[a]);else _t(e,o);return r=Ot(o,"script"),r.length>0&&Mt(r,!u&&Ot(e,"script")),r=s=i=null,o},buildFragment:function(e,t,n,r){var i,o,a,s,u,l,c,p=e.length,f=dt(t),d=[],h=0;for(;p>h;h++)if(o=e[h],o||0===o)if("object"===b.type(o))b.merge(d,o.nodeType?[o]:o);else if(wt.test(o)){s=s||f.appendChild(t.createElement("div")),u=(bt.exec(o)||["",""])[1].toLowerCase(),c=At[u]||At._default,s.innerHTML=c[1]+o.replace(vt,"<$1></$2>")+c[2],i=c[0];while(i--)s=s.lastChild;if(!b.support.leadingWhitespace&&yt.test(o)&&d.push(t.createTextNode(yt.exec(o)[0])),!b.support.tbody){o="table"!==u||xt.test(o)?"<table>"!==c[1]||xt.test(o)?0:s:s.firstChild,i=o&&o.childNodes.length;while(i--)b.nodeName(l=o.childNodes[i],"tbody")&&!l.childNodes.length&&o.removeChild(l)
}b.merge(d,s.childNodes),s.textContent="";while(s.firstChild)s.removeChild(s.firstChild);s=f.lastChild}else d.push(t.createTextNode(o));s&&f.removeChild(s),b.support.appendChecked||b.grep(Ot(d,"input"),Bt),h=0;while(o=d[h++])if((!r||-1===b.inArray(o,r))&&(a=b.contains(o.ownerDocument,o),s=Ot(f.appendChild(o),"script"),a&&Mt(s),n)){i=0;while(o=s[i++])kt.test(o.type||"")&&n.push(o)}return s=null,f},cleanData:function(e,t){var n,r,o,a,s=0,u=b.expando,l=b.cache,p=b.support.deleteExpando,f=b.event.special;for(;null!=(n=e[s]);s++)if((t||b.acceptData(n))&&(o=n[u],a=o&&l[o])){if(a.events)for(r in a.events)f[r]?b.event.remove(n,r):b.removeEvent(n,r,a.handle);l[o]&&(delete l[o],p?delete n[u]:typeof n.removeAttribute!==i?n.removeAttribute(u):n[u]=null,c.push(o))}}});var Pt,Rt,Wt,$t=/alpha\([^)]*\)/i,It=/opacity\s*=\s*([^)]*)/,zt=/^(top|right|bottom|left)$/,Xt=/^(none|table(?!-c[ea]).+)/,Ut=/^margin/,Vt=RegExp("^("+x+")(.*)$","i"),Yt=RegExp("^("+x+")(?!px)[a-z%]+$","i"),Jt=RegExp("^([+-])=("+x+")","i"),Gt={BODY:"block"},Qt={position:"absolute",visibility:"hidden",display:"block"},Kt={letterSpacing:0,fontWeight:400},Zt=["Top","Right","Bottom","Left"],en=["Webkit","O","Moz","ms"];function tn(e,t){if(t in e)return t;var n=t.charAt(0).toUpperCase()+t.slice(1),r=t,i=en.length;while(i--)if(t=en[i]+n,t in e)return t;return r}function nn(e,t){return e=t||e,"none"===b.css(e,"display")||!b.contains(e.ownerDocument,e)}function rn(e,t){var n,r,i,o=[],a=0,s=e.length;for(;s>a;a++)r=e[a],r.style&&(o[a]=b._data(r,"olddisplay"),n=r.style.display,t?(o[a]||"none"!==n||(r.style.display=""),""===r.style.display&&nn(r)&&(o[a]=b._data(r,"olddisplay",un(r.nodeName)))):o[a]||(i=nn(r),(n&&"none"!==n||!i)&&b._data(r,"olddisplay",i?n:b.css(r,"display"))));for(a=0;s>a;a++)r=e[a],r.style&&(t&&"none"!==r.style.display&&""!==r.style.display||(r.style.display=t?o[a]||"":"none"));return e}b.fn.extend({css:function(e,n){return b.access(this,function(e,n,r){var i,o,a={},s=0;if(b.isArray(n)){for(o=Rt(e),i=n.length;i>s;s++)a[n[s]]=b.css(e,n[s],!1,o);return a}return r!==t?b.style(e,n,r):b.css(e,n)},e,n,arguments.length>1)},show:function(){return rn(this,!0)},hide:function(){return rn(this)},toggle:function(e){var t="boolean"==typeof e;return this.each(function(){(t?e:nn(this))?b(this).show():b(this).hide()})}}),b.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Wt(e,"opacity");return""===n?"1":n}}}},cssNumber:{columnCount:!0,fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":b.support.cssFloat?"cssFloat":"styleFloat"},style:function(e,n,r,i){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var o,a,s,u=b.camelCase(n),l=e.style;if(n=b.cssProps[u]||(b.cssProps[u]=tn(l,u)),s=b.cssHooks[n]||b.cssHooks[u],r===t)return s&&"get"in s&&(o=s.get(e,!1,i))!==t?o:l[n];if(a=typeof r,"string"===a&&(o=Jt.exec(r))&&(r=(o[1]+1)*o[2]+parseFloat(b.css(e,n)),a="number"),!(null==r||"number"===a&&isNaN(r)||("number"!==a||b.cssNumber[u]||(r+="px"),b.support.clearCloneStyle||""!==r||0!==n.indexOf("background")||(l[n]="inherit"),s&&"set"in s&&(r=s.set(e,r,i))===t)))try{l[n]=r}catch(c){}}},css:function(e,n,r,i){var o,a,s,u=b.camelCase(n);return n=b.cssProps[u]||(b.cssProps[u]=tn(e.style,u)),s=b.cssHooks[n]||b.cssHooks[u],s&&"get"in s&&(a=s.get(e,!0,r)),a===t&&(a=Wt(e,n,i)),"normal"===a&&n in Kt&&(a=Kt[n]),""===r||r?(o=parseFloat(a),r===!0||b.isNumeric(o)?o||0:a):a},swap:function(e,t,n,r){var i,o,a={};for(o in t)a[o]=e.style[o],e.style[o]=t[o];i=n.apply(e,r||[]);for(o in t)e.style[o]=a[o];return i}}),e.getComputedStyle?(Rt=function(t){return e.getComputedStyle(t,null)},Wt=function(e,n,r){var i,o,a,s=r||Rt(e),u=s?s.getPropertyValue(n)||s[n]:t,l=e.style;return s&&(""!==u||b.contains(e.ownerDocument,e)||(u=b.style(e,n)),Yt.test(u)&&Ut.test(n)&&(i=l.width,o=l.minWidth,a=l.maxWidth,l.minWidth=l.maxWidth=l.width=u,u=s.width,l.width=i,l.minWidth=o,l.maxWidth=a)),u}):o.documentElement.currentStyle&&(Rt=function(e){return e.currentStyle},Wt=function(e,n,r){var i,o,a,s=r||Rt(e),u=s?s[n]:t,l=e.style;return null==u&&l&&l[n]&&(u=l[n]),Yt.test(u)&&!zt.test(n)&&(i=l.left,o=e.runtimeStyle,a=o&&o.left,a&&(o.left=e.currentStyle.left),l.left="fontSize"===n?"1em":u,u=l.pixelLeft+"px",l.left=i,a&&(o.left=a)),""===u?"auto":u});function on(e,t,n){var r=Vt.exec(t);return r?Math.max(0,r[1]-(n||0))+(r[2]||"px"):t}function an(e,t,n,r,i){var o=n===(r?"border":"content")?4:"width"===t?1:0,a=0;for(;4>o;o+=2)"margin"===n&&(a+=b.css(e,n+Zt[o],!0,i)),r?("content"===n&&(a-=b.css(e,"padding"+Zt[o],!0,i)),"margin"!==n&&(a-=b.css(e,"border"+Zt[o]+"Width",!0,i))):(a+=b.css(e,"padding"+Zt[o],!0,i),"padding"!==n&&(a+=b.css(e,"border"+Zt[o]+"Width",!0,i)));return a}function sn(e,t,n){var r=!0,i="width"===t?e.offsetWidth:e.offsetHeight,o=Rt(e),a=b.support.boxSizing&&"border-box"===b.css(e,"boxSizing",!1,o);if(0>=i||null==i){if(i=Wt(e,t,o),(0>i||null==i)&&(i=e.style[t]),Yt.test(i))return i;r=a&&(b.support.boxSizingReliable||i===e.style[t]),i=parseFloat(i)||0}return i+an(e,t,n||(a?"border":"content"),r,o)+"px"}function un(e){var t=o,n=Gt[e];return n||(n=ln(e,t),"none"!==n&&n||(Pt=(Pt||b("<iframe frameborder='0' width='0' height='0'/>").css("cssText","display:block !important")).appendTo(t.documentElement),t=(Pt[0].contentWindow||Pt[0].contentDocument).document,t.write("<!doctype html><html><body>"),t.close(),n=ln(e,t),Pt.detach()),Gt[e]=n),n}function ln(e,t){var n=b(t.createElement(e)).appendTo(t.body),r=b.css(n[0],"display");return n.remove(),r}b.each(["height","width"],function(e,n){b.cssHooks[n]={get:function(e,r,i){return r?0===e.offsetWidth&&Xt.test(b.css(e,"display"))?b.swap(e,Qt,function(){return sn(e,n,i)}):sn(e,n,i):t},set:function(e,t,r){var i=r&&Rt(e);return on(e,t,r?an(e,n,r,b.support.boxSizing&&"border-box"===b.css(e,"boxSizing",!1,i),i):0)}}}),b.support.opacity||(b.cssHooks.opacity={get:function(e,t){return It.test((t&&e.currentStyle?e.currentStyle.filter:e.style.filter)||"")?.01*parseFloat(RegExp.$1)+"":t?"1":""},set:function(e,t){var n=e.style,r=e.currentStyle,i=b.isNumeric(t)?"alpha(opacity="+100*t+")":"",o=r&&r.filter||n.filter||"";n.zoom=1,(t>=1||""===t)&&""===b.trim(o.replace($t,""))&&n.removeAttribute&&(n.removeAttribute("filter"),""===t||r&&!r.filter)||(n.filter=$t.test(o)?o.replace($t,i):o+" "+i)}}),b(function(){b.support.reliableMarginRight||(b.cssHooks.marginRight={get:function(e,n){return n?b.swap(e,{display:"inline-block"},Wt,[e,"marginRight"]):t}}),!b.support.pixelPosition&&b.fn.position&&b.each(["top","left"],function(e,n){b.cssHooks[n]={get:function(e,r){return r?(r=Wt(e,n),Yt.test(r)?b(e).position()[n]+"px":r):t}}})}),b.expr&&b.expr.filters&&(b.expr.filters.hidden=function(e){return 0>=e.offsetWidth&&0>=e.offsetHeight||!b.support.reliableHiddenOffsets&&"none"===(e.style&&e.style.display||b.css(e,"display"))},b.expr.filters.visible=function(e){return!b.expr.filters.hidden(e)}),b.each({margin:"",padding:"",border:"Width"},function(e,t){b.cssHooks[e+t]={expand:function(n){var r=0,i={},o="string"==typeof n?n.split(" "):[n];for(;4>r;r++)i[e+Zt[r]+t]=o[r]||o[r-2]||o[0];return i}},Ut.test(e)||(b.cssHooks[e+t].set=on)});var cn=/%20/g,pn=/\[\]$/,fn=/\r?\n/g,dn=/^(?:submit|button|image|reset|file)$/i,hn=/^(?:input|select|textarea|keygen)/i;b.fn.extend({serialize:function(){return b.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=b.prop(this,"elements");return e?b.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!b(this).is(":disabled")&&hn.test(this.nodeName)&&!dn.test(e)&&(this.checked||!Nt.test(e))}).map(function(e,t){var n=b(this).val();return null==n?null:b.isArray(n)?b.map(n,function(e){return{name:t.name,value:e.replace(fn,"\r\n")}}):{name:t.name,value:n.replace(fn,"\r\n")}}).get()}}),b.param=function(e,n){var r,i=[],o=function(e,t){t=b.isFunction(t)?t():null==t?"":t,i[i.length]=encodeURIComponent(e)+"="+encodeURIComponent(t)};if(n===t&&(n=b.ajaxSettings&&b.ajaxSettings.traditional),b.isArray(e)||e.jquery&&!b.isPlainObject(e))b.each(e,function(){o(this.name,this.value)});else for(r in e)gn(r,e[r],n,o);return i.join("&").replace(cn,"+")};function gn(e,t,n,r){var i;if(b.isArray(t))b.each(t,function(t,i){n||pn.test(e)?r(e,i):gn(e+"["+("object"==typeof i?t:"")+"]",i,n,r)});else if(n||"object"!==b.type(t))r(e,t);else for(i in t)gn(e+"["+i+"]",t[i],n,r)}b.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(e,t){b.fn[t]=function(e,n){return arguments.length>0?this.on(t,null,e,n):this.trigger(t)}}),b.fn.hover=function(e,t){return this.mouseenter(e).mouseleave(t||e)};var mn,yn,vn=b.now(),bn=/\?/,xn=/#.*$/,wn=/([?&])_=[^&]*/,Tn=/^(.*?):[ \t]*([^\r\n]*)\r?$/gm,Nn=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Cn=/^(?:GET|HEAD)$/,kn=/^\/\//,En=/^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,Sn=b.fn.load,An={},jn={},Dn="*/".concat("*");try{yn=a.href}catch(Ln){yn=o.createElement("a"),yn.href="",yn=yn.href}mn=En.exec(yn.toLowerCase())||[];function Hn(e){return function(t,n){"string"!=typeof t&&(n=t,t="*");var r,i=0,o=t.toLowerCase().match(w)||[];if(b.isFunction(n))while(r=o[i++])"+"===r[0]?(r=r.slice(1)||"*",(e[r]=e[r]||[]).unshift(n)):(e[r]=e[r]||[]).push(n)}}function qn(e,n,r,i){var o={},a=e===jn;function s(u){var l;return o[u]=!0,b.each(e[u]||[],function(e,u){var c=u(n,r,i);return"string"!=typeof c||a||o[c]?a?!(l=c):t:(n.dataTypes.unshift(c),s(c),!1)}),l}return s(n.dataTypes[0])||!o["*"]&&s("*")}function Mn(e,n){var r,i,o=b.ajaxSettings.flatOptions||{};for(i in n)n[i]!==t&&((o[i]?e:r||(r={}))[i]=n[i]);return r&&b.extend(!0,e,r),e}b.fn.load=function(e,n,r){if("string"!=typeof e&&Sn)return Sn.apply(this,arguments);var i,o,a,s=this,u=e.indexOf(" ");return u>=0&&(i=e.slice(u,e.length),e=e.slice(0,u)),b.isFunction(n)?(r=n,n=t):n&&"object"==typeof n&&(a="POST"),s.length>0&&b.ajax({url:e,type:a,dataType:"html",data:n}).done(function(e){o=arguments,s.html(i?b("<div>").append(b.parseHTML(e)).find(i):e)}).complete(r&&function(e,t){s.each(r,o||[e.responseText,t,e])}),this},b.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){b.fn[t]=function(e){return this.on(t,e)}}),b.each(["get","post"],function(e,n){b[n]=function(e,r,i,o){return b.isFunction(r)&&(o=o||i,i=r,r=t),b.ajax({url:e,type:n,dataType:o,data:r,success:i})}}),b.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:yn,type:"GET",isLocal:Nn.test(mn[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":Dn,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":e.String,"text html":!0,"text json":b.parseJSON,"text xml":b.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?Mn(Mn(e,b.ajaxSettings),t):Mn(b.ajaxSettings,e)},ajaxPrefilter:Hn(An),ajaxTransport:Hn(jn),ajax:function(e,n){"object"==typeof e&&(n=e,e=t),n=n||{};var r,i,o,a,s,u,l,c,p=b.ajaxSetup({},n),f=p.context||p,d=p.context&&(f.nodeType||f.jquery)?b(f):b.event,h=b.Deferred(),g=b.Callbacks("once memory"),m=p.statusCode||{},y={},v={},x=0,T="canceled",N={readyState:0,getResponseHeader:function(e){var t;if(2===x){if(!c){c={};while(t=Tn.exec(a))c[t[1].toLowerCase()]=t[2]}t=c[e.toLowerCase()]}return null==t?null:t},getAllResponseHeaders:function(){return 2===x?a:null},setRequestHeader:function(e,t){var n=e.toLowerCase();return x||(e=v[n]=v[n]||e,y[e]=t),this},overrideMimeType:function(e){return x||(p.mimeType=e),this},statusCode:function(e){var t;if(e)if(2>x)for(t in e)m[t]=[m[t],e[t]];else N.always(e[N.status]);return this},abort:function(e){var t=e||T;return l&&l.abort(t),k(0,t),this}};if(h.promise(N).complete=g.add,N.success=N.done,N.error=N.fail,p.url=((e||p.url||yn)+"").replace(xn,"").replace(kn,mn[1]+"//"),p.type=n.method||n.type||p.method||p.type,p.dataTypes=b.trim(p.dataType||"*").toLowerCase().match(w)||[""],null==p.crossDomain&&(r=En.exec(p.url.toLowerCase()),p.crossDomain=!(!r||r[1]===mn[1]&&r[2]===mn[2]&&(r[3]||("http:"===r[1]?80:443))==(mn[3]||("http:"===mn[1]?80:443)))),p.data&&p.processData&&"string"!=typeof p.data&&(p.data=b.param(p.data,p.traditional)),qn(An,p,n,N),2===x)return N;u=p.global,u&&0===b.active++&&b.event.trigger("ajaxStart"),p.type=p.type.toUpperCase(),p.hasContent=!Cn.test(p.type),o=p.url,p.hasContent||(p.data&&(o=p.url+=(bn.test(o)?"&":"?")+p.data,delete p.data),p.cache===!1&&(p.url=wn.test(o)?o.replace(wn,"$1_="+vn++):o+(bn.test(o)?"&":"?")+"_="+vn++)),p.ifModified&&(b.lastModified[o]&&N.setRequestHeader("If-Modified-Since",b.lastModified[o]),b.etag[o]&&N.setRequestHeader("If-None-Match",b.etag[o])),(p.data&&p.hasContent&&p.contentType!==!1||n.contentType)&&N.setRequestHeader("Content-Type",p.contentType),N.setRequestHeader("Accept",p.dataTypes[0]&&p.accepts[p.dataTypes[0]]?p.accepts[p.dataTypes[0]]+("*"!==p.dataTypes[0]?", "+Dn+"; q=0.01":""):p.accepts["*"]);for(i in p.headers)N.setRequestHeader(i,p.headers[i]);if(p.beforeSend&&(p.beforeSend.call(f,N,p)===!1||2===x))return N.abort();T="abort";for(i in{success:1,error:1,complete:1})N[i](p[i]);if(l=qn(jn,p,n,N)){N.readyState=1,u&&d.trigger("ajaxSend",[N,p]),p.async&&p.timeout>0&&(s=setTimeout(function(){N.abort("timeout")},p.timeout));try{x=1,l.send(y,k)}catch(C){if(!(2>x))throw C;k(-1,C)}}else k(-1,"No Transport");function k(e,n,r,i){var c,y,v,w,T,C=n;2!==x&&(x=2,s&&clearTimeout(s),l=t,a=i||"",N.readyState=e>0?4:0,r&&(w=_n(p,N,r)),e>=200&&300>e||304===e?(p.ifModified&&(T=N.getResponseHeader("Last-Modified"),T&&(b.lastModified[o]=T),T=N.getResponseHeader("etag"),T&&(b.etag[o]=T)),204===e?(c=!0,C="nocontent"):304===e?(c=!0,C="notmodified"):(c=Fn(p,w),C=c.state,y=c.data,v=c.error,c=!v)):(v=C,(e||!C)&&(C="error",0>e&&(e=0))),N.status=e,N.statusText=(n||C)+"",c?h.resolveWith(f,[y,C,N]):h.rejectWith(f,[N,C,v]),N.statusCode(m),m=t,u&&d.trigger(c?"ajaxSuccess":"ajaxError",[N,p,c?y:v]),g.fireWith(f,[N,C]),u&&(d.trigger("ajaxComplete",[N,p]),--b.active||b.event.trigger("ajaxStop")))}return N},getScript:function(e,n){return b.get(e,t,n,"script")},getJSON:function(e,t,n){return b.get(e,t,n,"json")}});function _n(e,n,r){var i,o,a,s,u=e.contents,l=e.dataTypes,c=e.responseFields;for(s in c)s in r&&(n[c[s]]=r[s]);while("*"===l[0])l.shift(),o===t&&(o=e.mimeType||n.getResponseHeader("Content-Type"));if(o)for(s in u)if(u[s]&&u[s].test(o)){l.unshift(s);break}if(l[0]in r)a=l[0];else{for(s in r){if(!l[0]||e.converters[s+" "+l[0]]){a=s;break}i||(i=s)}a=a||i}return a?(a!==l[0]&&l.unshift(a),r[a]):t}function Fn(e,t){var n,r,i,o,a={},s=0,u=e.dataTypes.slice(),l=u[0];if(e.dataFilter&&(t=e.dataFilter(t,e.dataType)),u[1])for(i in e.converters)a[i.toLowerCase()]=e.converters[i];for(;r=u[++s];)if("*"!==r){if("*"!==l&&l!==r){if(i=a[l+" "+r]||a["* "+r],!i)for(n in a)if(o=n.split(" "),o[1]===r&&(i=a[l+" "+o[0]]||a["* "+o[0]])){i===!0?i=a[n]:a[n]!==!0&&(r=o[0],u.splice(s--,0,r));break}if(i!==!0)if(i&&e["throws"])t=i(t);else try{t=i(t)}catch(c){return{state:"parsererror",error:i?c:"No conversion from "+l+" to "+r}}}l=r}return{state:"success",data:t}}b.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(e){return b.globalEval(e),e}}}),b.ajaxPrefilter("script",function(e){e.cache===t&&(e.cache=!1),e.crossDomain&&(e.type="GET",e.global=!1)}),b.ajaxTransport("script",function(e){if(e.crossDomain){var n,r=o.head||b("head")[0]||o.documentElement;return{send:function(t,i){n=o.createElement("script"),n.async=!0,e.scriptCharset&&(n.charset=e.scriptCharset),n.src=e.url,n.onload=n.onreadystatechange=function(e,t){(t||!n.readyState||/loaded|complete/.test(n.readyState))&&(n.onload=n.onreadystatechange=null,n.parentNode&&n.parentNode.removeChild(n),n=null,t||i(200,"success"))},r.insertBefore(n,r.firstChild)},abort:function(){n&&n.onload(t,!0)}}}});var On=[],Bn=/(=)\?(?=&|$)|\?\?/;b.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=On.pop()||b.expando+"_"+vn++;return this[e]=!0,e}}),b.ajaxPrefilter("json jsonp",function(n,r,i){var o,a,s,u=n.jsonp!==!1&&(Bn.test(n.url)?"url":"string"==typeof n.data&&!(n.contentType||"").indexOf("application/x-www-form-urlencoded")&&Bn.test(n.data)&&"data");return u||"jsonp"===n.dataTypes[0]?(o=n.jsonpCallback=b.isFunction(n.jsonpCallback)?n.jsonpCallback():n.jsonpCallback,u?n[u]=n[u].replace(Bn,"$1"+o):n.jsonp!==!1&&(n.url+=(bn.test(n.url)?"&":"?")+n.jsonp+"="+o),n.converters["script json"]=function(){return s||b.error(o+" was not called"),s[0]},n.dataTypes[0]="json",a=e[o],e[o]=function(){s=arguments},i.always(function(){e[o]=a,n[o]&&(n.jsonpCallback=r.jsonpCallback,On.push(o)),s&&b.isFunction(a)&&a(s[0]),s=a=t}),"script"):t});var Pn,Rn,Wn=0,$n=e.ActiveXObject&&function(){var e;for(e in Pn)Pn[e](t,!0)};function In(){try{return new e.XMLHttpRequest}catch(t){}}function zn(){try{return new e.ActiveXObject("Microsoft.XMLHTTP")}catch(t){}}b.ajaxSettings.xhr=e.ActiveXObject?function(){return!this.isLocal&&In()||zn()}:In,Rn=b.ajaxSettings.xhr(),b.support.cors=!!Rn&&"withCredentials"in Rn,Rn=b.support.ajax=!!Rn,Rn&&b.ajaxTransport(function(n){if(!n.crossDomain||b.support.cors){var r;return{send:function(i,o){var a,s,u=n.xhr();if(n.username?u.open(n.type,n.url,n.async,n.username,n.password):u.open(n.type,n.url,n.async),n.xhrFields)for(s in n.xhrFields)u[s]=n.xhrFields[s];n.mimeType&&u.overrideMimeType&&u.overrideMimeType(n.mimeType),n.crossDomain||i["X-Requested-With"]||(i["X-Requested-With"]="XMLHttpRequest");try{for(s in i)u.setRequestHeader(s,i[s])}catch(l){}u.send(n.hasContent&&n.data||null),r=function(e,i){var s,l,c,p;try{if(r&&(i||4===u.readyState))if(r=t,a&&(u.onreadystatechange=b.noop,$n&&delete Pn[a]),i)4!==u.readyState&&u.abort();else{p={},s=u.status,l=u.getAllResponseHeaders(),"string"==typeof u.responseText&&(p.text=u.responseText);try{c=u.statusText}catch(f){c=""}s||!n.isLocal||n.crossDomain?1223===s&&(s=204):s=p.text?200:404}}catch(d){i||o(-1,d)}p&&o(s,c,p,l)},n.async?4===u.readyState?setTimeout(r):(a=++Wn,$n&&(Pn||(Pn={},b(e).unload($n)),Pn[a]=r),u.onreadystatechange=r):r()},abort:function(){r&&r(t,!0)}}}});var Xn,Un,Vn=/^(?:toggle|show|hide)$/,Yn=RegExp("^(?:([+-])=|)("+x+")([a-z%]*)$","i"),Jn=/queueHooks$/,Gn=[nr],Qn={"*":[function(e,t){var n,r,i=this.createTween(e,t),o=Yn.exec(t),a=i.cur(),s=+a||0,u=1,l=20;if(o){if(n=+o[2],r=o[3]||(b.cssNumber[e]?"":"px"),"px"!==r&&s){s=b.css(i.elem,e,!0)||n||1;do u=u||".5",s/=u,b.style(i.elem,e,s+r);while(u!==(u=i.cur()/a)&&1!==u&&--l)}i.unit=r,i.start=s,i.end=o[1]?s+(o[1]+1)*n:n}return i}]};function Kn(){return setTimeout(function(){Xn=t}),Xn=b.now()}function Zn(e,t){b.each(t,function(t,n){var r=(Qn[t]||[]).concat(Qn["*"]),i=0,o=r.length;for(;o>i;i++)if(r[i].call(e,t,n))return})}function er(e,t,n){var r,i,o=0,a=Gn.length,s=b.Deferred().always(function(){delete u.elem}),u=function(){if(i)return!1;var t=Xn||Kn(),n=Math.max(0,l.startTime+l.duration-t),r=n/l.duration||0,o=1-r,a=0,u=l.tweens.length;for(;u>a;a++)l.tweens[a].run(o);return s.notifyWith(e,[l,o,n]),1>o&&u?n:(s.resolveWith(e,[l]),!1)},l=s.promise({elem:e,props:b.extend({},t),opts:b.extend(!0,{specialEasing:{}},n),originalProperties:t,originalOptions:n,startTime:Xn||Kn(),duration:n.duration,tweens:[],createTween:function(t,n){var r=b.Tween(e,l.opts,t,n,l.opts.specialEasing[t]||l.opts.easing);return l.tweens.push(r),r},stop:function(t){var n=0,r=t?l.tweens.length:0;if(i)return this;for(i=!0;r>n;n++)l.tweens[n].run(1);return t?s.resolveWith(e,[l,t]):s.rejectWith(e,[l,t]),this}}),c=l.props;for(tr(c,l.opts.specialEasing);a>o;o++)if(r=Gn[o].call(l,e,c,l.opts))return r;return Zn(l,c),b.isFunction(l.opts.start)&&l.opts.start.call(e,l),b.fx.timer(b.extend(u,{elem:e,anim:l,queue:l.opts.queue})),l.progress(l.opts.progress).done(l.opts.done,l.opts.complete).fail(l.opts.fail).always(l.opts.always)}function tr(e,t){var n,r,i,o,a;for(i in e)if(r=b.camelCase(i),o=t[r],n=e[i],b.isArray(n)&&(o=n[1],n=e[i]=n[0]),i!==r&&(e[r]=n,delete e[i]),a=b.cssHooks[r],a&&"expand"in a){n=a.expand(n),delete e[r];for(i in n)i in e||(e[i]=n[i],t[i]=o)}else t[r]=o}b.Animation=b.extend(er,{tweener:function(e,t){b.isFunction(e)?(t=e,e=["*"]):e=e.split(" ");var n,r=0,i=e.length;for(;i>r;r++)n=e[r],Qn[n]=Qn[n]||[],Qn[n].unshift(t)},prefilter:function(e,t){t?Gn.unshift(e):Gn.push(e)}});function nr(e,t,n){var r,i,o,a,s,u,l,c,p,f=this,d=e.style,h={},g=[],m=e.nodeType&&nn(e);n.queue||(c=b._queueHooks(e,"fx"),null==c.unqueued&&(c.unqueued=0,p=c.empty.fire,c.empty.fire=function(){c.unqueued||p()}),c.unqueued++,f.always(function(){f.always(function(){c.unqueued--,b.queue(e,"fx").length||c.empty.fire()})})),1===e.nodeType&&("height"in t||"width"in t)&&(n.overflow=[d.overflow,d.overflowX,d.overflowY],"inline"===b.css(e,"display")&&"none"===b.css(e,"float")&&(b.support.inlineBlockNeedsLayout&&"inline"!==un(e.nodeName)?d.zoom=1:d.display="inline-block")),n.overflow&&(d.overflow="hidden",b.support.shrinkWrapBlocks||f.always(function(){d.overflow=n.overflow[0],d.overflowX=n.overflow[1],d.overflowY=n.overflow[2]}));for(i in t)if(a=t[i],Vn.exec(a)){if(delete t[i],u=u||"toggle"===a,a===(m?"hide":"show"))continue;g.push(i)}if(o=g.length){s=b._data(e,"fxshow")||b._data(e,"fxshow",{}),"hidden"in s&&(m=s.hidden),u&&(s.hidden=!m),m?b(e).show():f.done(function(){b(e).hide()}),f.done(function(){var t;b._removeData(e,"fxshow");for(t in h)b.style(e,t,h[t])});for(i=0;o>i;i++)r=g[i],l=f.createTween(r,m?s[r]:0),h[r]=s[r]||b.style(e,r),r in s||(s[r]=l.start,m&&(l.end=l.start,l.start="width"===r||"height"===r?1:0))}}function rr(e,t,n,r,i){return new rr.prototype.init(e,t,n,r,i)}b.Tween=rr,rr.prototype={constructor:rr,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||"swing",this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(b.cssNumber[n]?"":"px")},cur:function(){var e=rr.propHooks[this.prop];return e&&e.get?e.get(this):rr.propHooks._default.get(this)},run:function(e){var t,n=rr.propHooks[this.prop];return this.pos=t=this.options.duration?b.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):rr.propHooks._default.set(this),this}},rr.prototype.init.prototype=rr.prototype,rr.propHooks={_default:{get:function(e){var t;return null==e.elem[e.prop]||e.elem.style&&null!=e.elem.style[e.prop]?(t=b.css(e.elem,e.prop,""),t&&"auto"!==t?t:0):e.elem[e.prop]},set:function(e){b.fx.step[e.prop]?b.fx.step[e.prop](e):e.elem.style&&(null!=e.elem.style[b.cssProps[e.prop]]||b.cssHooks[e.prop])?b.style(e.elem,e.prop,e.now+e.unit):e.elem[e.prop]=e.now}}},rr.propHooks.scrollTop=rr.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},b.each(["toggle","show","hide"],function(e,t){var n=b.fn[t];b.fn[t]=function(e,r,i){return null==e||"boolean"==typeof e?n.apply(this,arguments):this.animate(ir(t,!0),e,r,i)}}),b.fn.extend({fadeTo:function(e,t,n,r){return this.filter(nn).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(e,t,n,r){var i=b.isEmptyObject(e),o=b.speed(t,n,r),a=function(){var t=er(this,b.extend({},e),o);a.finish=function(){t.stop(!0)},(i||b._data(this,"finish"))&&t.stop(!0)};return a.finish=a,i||o.queue===!1?this.each(a):this.queue(o.queue,a)},stop:function(e,n,r){var i=function(e){var t=e.stop;delete e.stop,t(r)};return"string"!=typeof e&&(r=n,n=e,e=t),n&&e!==!1&&this.queue(e||"fx",[]),this.each(function(){var t=!0,n=null!=e&&e+"queueHooks",o=b.timers,a=b._data(this);if(n)a[n]&&a[n].stop&&i(a[n]);else for(n in a)a[n]&&a[n].stop&&Jn.test(n)&&i(a[n]);for(n=o.length;n--;)o[n].elem!==this||null!=e&&o[n].queue!==e||(o[n].anim.stop(r),t=!1,o.splice(n,1));(t||!r)&&b.dequeue(this,e)})},finish:function(e){return e!==!1&&(e=e||"fx"),this.each(function(){var t,n=b._data(this),r=n[e+"queue"],i=n[e+"queueHooks"],o=b.timers,a=r?r.length:0;for(n.finish=!0,b.queue(this,e,[]),i&&i.cur&&i.cur.finish&&i.cur.finish.call(this),t=o.length;t--;)o[t].elem===this&&o[t].queue===e&&(o[t].anim.stop(!0),o.splice(t,1));for(t=0;a>t;t++)r[t]&&r[t].finish&&r[t].finish.call(this);delete n.finish})}});function ir(e,t){var n,r={height:e},i=0;for(t=t?1:0;4>i;i+=2-t)n=Zt[i],r["margin"+n]=r["padding"+n]=e;return t&&(r.opacity=r.width=e),r}b.each({slideDown:ir("show"),slideUp:ir("hide"),slideToggle:ir("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){b.fn[e]=function(e,n,r){return this.animate(t,e,n,r)}}),b.speed=function(e,t,n){var r=e&&"object"==typeof e?b.extend({},e):{complete:n||!n&&t||b.isFunction(e)&&e,duration:e,easing:n&&t||t&&!b.isFunction(t)&&t};return r.duration=b.fx.off?0:"number"==typeof r.duration?r.duration:r.duration in b.fx.speeds?b.fx.speeds[r.duration]:b.fx.speeds._default,(null==r.queue||r.queue===!0)&&(r.queue="fx"),r.old=r.complete,r.complete=function(){b.isFunction(r.old)&&r.old.call(this),r.queue&&b.dequeue(this,r.queue)},r},b.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2}},b.timers=[],b.fx=rr.prototype.init,b.fx.tick=function(){var e,n=b.timers,r=0;for(Xn=b.now();n.length>r;r++)e=n[r],e()||n[r]!==e||n.splice(r--,1);n.length||b.fx.stop(),Xn=t},b.fx.timer=function(e){e()&&b.timers.push(e)&&b.fx.start()},b.fx.interval=13,b.fx.start=function(){Un||(Un=setInterval(b.fx.tick,b.fx.interval))},b.fx.stop=function(){clearInterval(Un),Un=null},b.fx.speeds={slow:600,fast:200,_default:400},b.fx.step={},b.expr&&b.expr.filters&&(b.expr.filters.animated=function(e){return b.grep(b.timers,function(t){return e===t.elem}).length}),b.fn.offset=function(e){if(arguments.length)return e===t?this:this.each(function(t){b.offset.setOffset(this,e,t)});var n,r,o={top:0,left:0},a=this[0],s=a&&a.ownerDocument;if(s)return n=s.documentElement,b.contains(n,a)?(typeof a.getBoundingClientRect!==i&&(o=a.getBoundingClientRect()),r=or(s),{top:o.top+(r.pageYOffset||n.scrollTop)-(n.clientTop||0),left:o.left+(r.pageXOffset||n.scrollLeft)-(n.clientLeft||0)}):o},b.offset={setOffset:function(e,t,n){var r=b.css(e,"position");"static"===r&&(e.style.position="relative");var i=b(e),o=i.offset(),a=b.css(e,"top"),s=b.css(e,"left"),u=("absolute"===r||"fixed"===r)&&b.inArray("auto",[a,s])>-1,l={},c={},p,f;u?(c=i.position(),p=c.top,f=c.left):(p=parseFloat(a)||0,f=parseFloat(s)||0),b.isFunction(t)&&(t=t.call(e,n,o)),null!=t.top&&(l.top=t.top-o.top+p),null!=t.left&&(l.left=t.left-o.left+f),"using"in t?t.using.call(e,l):i.css(l)}},b.fn.extend({position:function(){if(this[0]){var e,t,n={top:0,left:0},r=this[0];return"fixed"===b.css(r,"position")?t=r.getBoundingClientRect():(e=this.offsetParent(),t=this.offset(),b.nodeName(e[0],"html")||(n=e.offset()),n.top+=b.css(e[0],"borderTopWidth",!0),n.left+=b.css(e[0],"borderLeftWidth",!0)),{top:t.top-n.top-b.css(r,"marginTop",!0),left:t.left-n.left-b.css(r,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var e=this.offsetParent||o.documentElement;while(e&&!b.nodeName(e,"html")&&"static"===b.css(e,"position"))e=e.offsetParent;return e||o.documentElement})}}),b.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(e,n){var r=/Y/.test(n);b.fn[e]=function(i){return b.access(this,function(e,i,o){var a=or(e);return o===t?a?n in a?a[n]:a.document.documentElement[i]:e[i]:(a?a.scrollTo(r?b(a).scrollLeft():o,r?o:b(a).scrollTop()):e[i]=o,t)},e,i,arguments.length,null)}});function or(e){return b.isWindow(e)?e:9===e.nodeType?e.defaultView||e.parentWindow:!1}b.each({Height:"height",Width:"width"},function(e,n){b.each({padding:"inner"+e,content:n,"":"outer"+e},function(r,i){b.fn[i]=function(i,o){var a=arguments.length&&(r||"boolean"!=typeof i),s=r||(i===!0||o===!0?"margin":"border");return b.access(this,function(n,r,i){var o;return b.isWindow(n)?n.document.documentElement["client"+e]:9===n.nodeType?(o=n.documentElement,Math.max(n.body["scroll"+e],o["scroll"+e],n.body["offset"+e],o["offset"+e],o["client"+e])):i===t?b.css(n,r,s):b.style(n,r,i,s)},n,a?i:t,a,null)}})}),e.jQuery=e.$=b,"function"==typeof define&&define.amd&&define.amd.jQuery&&define("jquery",[],function(){return b})})(window);
/*! jQuery UI - v1.10.3 - 2013-05-07
* http://jqueryui.com
* Includes: jquery.ui.core.js, jquery.ui.widget.js, jquery.ui.mouse.js, jquery.ui.position.js, jquery.ui.draggable.js, jquery.ui.droppable.js, jquery.ui.resizable.js, jquery.ui.slider.js, jquery.ui.tabs.js
* Copyright 2013 jQuery Foundation and other contributors Licensed MIT */

(function(e,t){function i(t,i){var a,n,r,o=t.nodeName.toLowerCase();return"area"===o?(a=t.parentNode,n=a.name,t.href&&n&&"map"===a.nodeName.toLowerCase()?(r=e("img[usemap=#"+n+"]")[0],!!r&&s(r)):!1):(/input|select|textarea|button|object/.test(o)?!t.disabled:"a"===o?t.href||i:i)&&s(t)}function s(t){return e.expr.filters.visible(t)&&!e(t).parents().addBack().filter(function(){return"hidden"===e.css(this,"visibility")}).length}var a=0,n=/^ui-id-\d+$/;e.ui=e.ui||{},e.extend(e.ui,{version:"1.10.3",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}}),e.fn.extend({focus:function(t){return function(i,s){return"number"==typeof i?this.each(function(){var t=this;setTimeout(function(){e(t).focus(),s&&s.call(t)},i)}):t.apply(this,arguments)}}(e.fn.focus),scrollParent:function(){var t;return t=e.ui.ie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(e.css(this,"position"))&&/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0),/fixed/.test(this.css("position"))||!t.length?e(document):t},zIndex:function(i){if(i!==t)return this.css("zIndex",i);if(this.length)for(var s,a,n=e(this[0]);n.length&&n[0]!==document;){if(s=n.css("position"),("absolute"===s||"relative"===s||"fixed"===s)&&(a=parseInt(n.css("zIndex"),10),!isNaN(a)&&0!==a))return a;n=n.parent()}return 0},uniqueId:function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++a)})},removeUniqueId:function(){return this.each(function(){n.test(this.id)&&e(this).removeAttr("id")})}}),e.extend(e.expr[":"],{data:e.expr.createPseudo?e.expr.createPseudo(function(t){return function(i){return!!e.data(i,t)}}):function(t,i,s){return!!e.data(t,s[3])},focusable:function(t){return i(t,!isNaN(e.attr(t,"tabindex")))},tabbable:function(t){var s=e.attr(t,"tabindex"),a=isNaN(s);return(a||s>=0)&&i(t,!a)}}),e("<a>").outerWidth(1).jquery||e.each(["Width","Height"],function(i,s){function a(t,i,s,a){return e.each(n,function(){i-=parseFloat(e.css(t,"padding"+this))||0,s&&(i-=parseFloat(e.css(t,"border"+this+"Width"))||0),a&&(i-=parseFloat(e.css(t,"margin"+this))||0)}),i}var n="Width"===s?["Left","Right"]:["Top","Bottom"],r=s.toLowerCase(),o={innerWidth:e.fn.innerWidth,innerHeight:e.fn.innerHeight,outerWidth:e.fn.outerWidth,outerHeight:e.fn.outerHeight};e.fn["inner"+s]=function(i){return i===t?o["inner"+s].call(this):this.each(function(){e(this).css(r,a(this,i)+"px")})},e.fn["outer"+s]=function(t,i){return"number"!=typeof t?o["outer"+s].call(this,t):this.each(function(){e(this).css(r,a(this,t,!0,i)+"px")})}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e("<a>").data("a-b","a").removeData("a-b").data("a-b")&&(e.fn.removeData=function(t){return function(i){return arguments.length?t.call(this,e.camelCase(i)):t.call(this)}}(e.fn.removeData)),e.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()),e.support.selectstart="onselectstart"in document.createElement("div"),e.fn.extend({disableSelection:function(){return this.bind((e.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(e){e.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),e.extend(e.ui,{plugin:{add:function(t,i,s){var a,n=e.ui[t].prototype;for(a in s)n.plugins[a]=n.plugins[a]||[],n.plugins[a].push([i,s[a]])},call:function(e,t,i){var s,a=e.plugins[t];if(a&&e.element[0].parentNode&&11!==e.element[0].parentNode.nodeType)for(s=0;a.length>s;s++)e.options[a[s][0]]&&a[s][1].apply(e.element,i)}},hasScroll:function(t,i){if("hidden"===e(t).css("overflow"))return!1;var s=i&&"left"===i?"scrollLeft":"scrollTop",a=!1;return t[s]>0?!0:(t[s]=1,a=t[s]>0,t[s]=0,a)}})})(jQuery);(function(e,t){var i=0,s=Array.prototype.slice,n=e.cleanData;e.cleanData=function(t){for(var i,s=0;null!=(i=t[s]);s++)try{e(i).triggerHandler("remove")}catch(a){}n(t)},e.widget=function(i,s,n){var a,r,o,h,l={},u=i.split(".")[0];i=i.split(".")[1],a=u+"-"+i,n||(n=s,s=e.Widget),e.expr[":"][a.toLowerCase()]=function(t){return!!e.data(t,a)},e[u]=e[u]||{},r=e[u][i],o=e[u][i]=function(e,i){return this._createWidget?(arguments.length&&this._createWidget(e,i),t):new o(e,i)},e.extend(o,r,{version:n.version,_proto:e.extend({},n),_childConstructors:[]}),h=new s,h.options=e.widget.extend({},h.options),e.each(n,function(i,n){return e.isFunction(n)?(l[i]=function(){var e=function(){return s.prototype[i].apply(this,arguments)},t=function(e){return s.prototype[i].apply(this,e)};return function(){var i,s=this._super,a=this._superApply;return this._super=e,this._superApply=t,i=n.apply(this,arguments),this._super=s,this._superApply=a,i}}(),t):(l[i]=n,t)}),o.prototype=e.widget.extend(h,{widgetEventPrefix:r?h.widgetEventPrefix:i},l,{constructor:o,namespace:u,widgetName:i,widgetFullName:a}),r?(e.each(r._childConstructors,function(t,i){var s=i.prototype;e.widget(s.namespace+"."+s.widgetName,o,i._proto)}),delete r._childConstructors):s._childConstructors.push(o),e.widget.bridge(i,o)},e.widget.extend=function(i){for(var n,a,r=s.call(arguments,1),o=0,h=r.length;h>o;o++)for(n in r[o])a=r[o][n],r[o].hasOwnProperty(n)&&a!==t&&(i[n]=e.isPlainObject(a)?e.isPlainObject(i[n])?e.widget.extend({},i[n],a):e.widget.extend({},a):a);return i},e.widget.bridge=function(i,n){var a=n.prototype.widgetFullName||i;e.fn[i]=function(r){var o="string"==typeof r,h=s.call(arguments,1),l=this;return r=!o&&h.length?e.widget.extend.apply(null,[r].concat(h)):r,o?this.each(function(){var s,n=e.data(this,a);return n?e.isFunction(n[r])&&"_"!==r.charAt(0)?(s=n[r].apply(n,h),s!==n&&s!==t?(l=s&&s.jquery?l.pushStack(s.get()):s,!1):t):e.error("no such method '"+r+"' for "+i+" widget instance"):e.error("cannot call methods on "+i+" prior to initialization; "+"attempted to call method '"+r+"'")}):this.each(function(){var t=e.data(this,a);t?t.option(r||{})._init():e.data(this,a,new n(r,this))}),l}},e.Widget=function(){},e.Widget._childConstructors=[],e.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(t,s){s=e(s||this.defaultElement||this)[0],this.element=e(s),this.uuid=i++,this.eventNamespace="."+this.widgetName+this.uuid,this.options=e.widget.extend({},this.options,this._getCreateOptions(),t),this.bindings=e(),this.hoverable=e(),this.focusable=e(),s!==this&&(e.data(s,this.widgetFullName,this),this._on(!0,this.element,{remove:function(e){e.target===s&&this.destroy()}}),this.document=e(s.style?s.ownerDocument:s.document||s),this.window=e(this.document[0].defaultView||this.document[0].parentWindow)),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:e.noop,_getCreateEventData:e.noop,_create:e.noop,_init:e.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled "+"ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:e.noop,widget:function(){return this.element},option:function(i,s){var n,a,r,o=i;if(0===arguments.length)return e.widget.extend({},this.options);if("string"==typeof i)if(o={},n=i.split("."),i=n.shift(),n.length){for(a=o[i]=e.widget.extend({},this.options[i]),r=0;n.length-1>r;r++)a[n[r]]=a[n[r]]||{},a=a[n[r]];if(i=n.pop(),s===t)return a[i]===t?null:a[i];a[i]=s}else{if(s===t)return this.options[i]===t?null:this.options[i];o[i]=s}return this._setOptions(o),this},_setOptions:function(e){var t;for(t in e)this._setOption(t,e[t]);return this},_setOption:function(e,t){return this.options[e]=t,"disabled"===e&&(this.widget().toggleClass(this.widgetFullName+"-disabled ui-state-disabled",!!t).attr("aria-disabled",t),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_on:function(i,s,n){var a,r=this;"boolean"!=typeof i&&(n=s,s=i,i=!1),n?(s=a=e(s),this.bindings=this.bindings.add(s)):(n=s,s=this.element,a=this.widget()),e.each(n,function(n,o){function h(){return i||r.options.disabled!==!0&&!e(this).hasClass("ui-state-disabled")?("string"==typeof o?r[o]:o).apply(r,arguments):t}"string"!=typeof o&&(h.guid=o.guid=o.guid||h.guid||e.guid++);var l=n.match(/^(\w+)\s*(.*)$/),u=l[1]+r.eventNamespace,c=l[2];c?a.delegate(c,u,h):s.bind(u,h)})},_off:function(e,t){t=(t||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.unbind(t).undelegate(t)},_delay:function(e,t){function i(){return("string"==typeof e?s[e]:e).apply(s,arguments)}var s=this;return setTimeout(i,t||0)},_hoverable:function(t){this.hoverable=this.hoverable.add(t),this._on(t,{mouseenter:function(t){e(t.currentTarget).addClass("ui-state-hover")},mouseleave:function(t){e(t.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(t){this.focusable=this.focusable.add(t),this._on(t,{focusin:function(t){e(t.currentTarget).addClass("ui-state-focus")},focusout:function(t){e(t.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(t,i,s){var n,a,r=this.options[t];if(s=s||{},i=e.Event(i),i.type=(t===this.widgetEventPrefix?t:this.widgetEventPrefix+t).toLowerCase(),i.target=this.element[0],a=i.originalEvent)for(n in a)n in i||(i[n]=a[n]);return this.element.trigger(i,s),!(e.isFunction(r)&&r.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},e.each({show:"fadeIn",hide:"fadeOut"},function(t,i){e.Widget.prototype["_"+t]=function(s,n,a){"string"==typeof n&&(n={effect:n});var r,o=n?n===!0||"number"==typeof n?i:n.effect||i:t;n=n||{},"number"==typeof n&&(n={duration:n}),r=!e.isEmptyObject(n),n.complete=a,n.delay&&s.delay(n.delay),r&&e.effects&&e.effects.effect[o]?s[t](n):o!==t&&s[o]?s[o](n.duration,n.easing,a):s.queue(function(i){e(this)[t](),a&&a.call(s[0]),i()})}})})(jQuery);(function(e){var t=!1;e(document).mouseup(function(){t=!1}),e.widget("ui.mouse",{version:"1.10.3",options:{cancel:"input,textarea,button,select,option",distance:1,delay:0},_mouseInit:function(){var t=this;this.element.bind("mousedown."+this.widgetName,function(e){return t._mouseDown(e)}).bind("click."+this.widgetName,function(i){return!0===e.data(i.target,t.widgetName+".preventClickEvent")?(e.removeData(i.target,t.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):undefined}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&e(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(i){if(!t){this._mouseStarted&&this._mouseUp(i),this._mouseDownEvent=i;var s=this,n=1===i.which,a="string"==typeof this.options.cancel&&i.target.nodeName?e(i.target).closest(this.options.cancel).length:!1;return n&&!a&&this._mouseCapture(i)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){s.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(i)&&this._mouseDelayMet(i)&&(this._mouseStarted=this._mouseStart(i)!==!1,!this._mouseStarted)?(i.preventDefault(),!0):(!0===e.data(i.target,this.widgetName+".preventClickEvent")&&e.removeData(i.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(e){return s._mouseMove(e)},this._mouseUpDelegate=function(e){return s._mouseUp(e)},e(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),i.preventDefault(),t=!0,!0)):!0}},_mouseMove:function(t){return e.ui.ie&&(!document.documentMode||9>document.documentMode)&&!t.button?this._mouseUp(t):this._mouseStarted?(this._mouseDrag(t),t.preventDefault()):(this._mouseDistanceMet(t)&&this._mouseDelayMet(t)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,t)!==!1,this._mouseStarted?this._mouseDrag(t):this._mouseUp(t)),!this._mouseStarted)},_mouseUp:function(t){return e(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,t.target===this._mouseDownEvent.target&&e.data(t.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(t)),!1},_mouseDistanceMet:function(e){return Math.max(Math.abs(this._mouseDownEvent.pageX-e.pageX),Math.abs(this._mouseDownEvent.pageY-e.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}})})(jQuery);(function(t,e){function i(t,e,i){return[parseFloat(t[0])*(p.test(t[0])?e/100:1),parseFloat(t[1])*(p.test(t[1])?i/100:1)]}function s(e,i){return parseInt(t.css(e,i),10)||0}function n(e){var i=e[0];return 9===i.nodeType?{width:e.width(),height:e.height(),offset:{top:0,left:0}}:t.isWindow(i)?{width:e.width(),height:e.height(),offset:{top:e.scrollTop(),left:e.scrollLeft()}}:i.preventDefault?{width:0,height:0,offset:{top:i.pageY,left:i.pageX}}:{width:e.outerWidth(),height:e.outerHeight(),offset:e.offset()}}t.ui=t.ui||{};var a,o=Math.max,r=Math.abs,h=Math.round,l=/left|center|right/,c=/top|center|bottom/,u=/[\+\-]\d+(\.[\d]+)?%?/,d=/^\w+/,p=/%$/,f=t.fn.position;t.position={scrollbarWidth:function(){if(a!==e)return a;var i,s,n=t("<div style='display:block;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),o=n.children()[0];return t("body").append(n),i=o.offsetWidth,n.css("overflow","scroll"),s=o.offsetWidth,i===s&&(s=n[0].clientWidth),n.remove(),a=i-s},getScrollInfo:function(e){var i=e.isWindow?"":e.element.css("overflow-x"),s=e.isWindow?"":e.element.css("overflow-y"),n="scroll"===i||"auto"===i&&e.width<e.element[0].scrollWidth,a="scroll"===s||"auto"===s&&e.height<e.element[0].scrollHeight;return{width:a?t.position.scrollbarWidth():0,height:n?t.position.scrollbarWidth():0}},getWithinInfo:function(e){var i=t(e||window),s=t.isWindow(i[0]);return{element:i,isWindow:s,offset:i.offset()||{left:0,top:0},scrollLeft:i.scrollLeft(),scrollTop:i.scrollTop(),width:s?i.width():i.outerWidth(),height:s?i.height():i.outerHeight()}}},t.fn.position=function(e){if(!e||!e.of)return f.apply(this,arguments);e=t.extend({},e);var a,p,m,g,v,b,_=t(e.of),y=t.position.getWithinInfo(e.within),w=t.position.getScrollInfo(y),x=(e.collision||"flip").split(" "),k={};return b=n(_),_[0].preventDefault&&(e.at="left top"),p=b.width,m=b.height,g=b.offset,v=t.extend({},g),t.each(["my","at"],function(){var t,i,s=(e[this]||"").split(" ");1===s.length&&(s=l.test(s[0])?s.concat(["center"]):c.test(s[0])?["center"].concat(s):["center","center"]),s[0]=l.test(s[0])?s[0]:"center",s[1]=c.test(s[1])?s[1]:"center",t=u.exec(s[0]),i=u.exec(s[1]),k[this]=[t?t[0]:0,i?i[0]:0],e[this]=[d.exec(s[0])[0],d.exec(s[1])[0]]}),1===x.length&&(x[1]=x[0]),"right"===e.at[0]?v.left+=p:"center"===e.at[0]&&(v.left+=p/2),"bottom"===e.at[1]?v.top+=m:"center"===e.at[1]&&(v.top+=m/2),a=i(k.at,p,m),v.left+=a[0],v.top+=a[1],this.each(function(){var n,l,c=t(this),u=c.outerWidth(),d=c.outerHeight(),f=s(this,"marginLeft"),b=s(this,"marginTop"),D=u+f+s(this,"marginRight")+w.width,T=d+b+s(this,"marginBottom")+w.height,C=t.extend({},v),M=i(k.my,c.outerWidth(),c.outerHeight());"right"===e.my[0]?C.left-=u:"center"===e.my[0]&&(C.left-=u/2),"bottom"===e.my[1]?C.top-=d:"center"===e.my[1]&&(C.top-=d/2),C.left+=M[0],C.top+=M[1],t.support.offsetFractions||(C.left=h(C.left),C.top=h(C.top)),n={marginLeft:f,marginTop:b},t.each(["left","top"],function(i,s){t.ui.position[x[i]]&&t.ui.position[x[i]][s](C,{targetWidth:p,targetHeight:m,elemWidth:u,elemHeight:d,collisionPosition:n,collisionWidth:D,collisionHeight:T,offset:[a[0]+M[0],a[1]+M[1]],my:e.my,at:e.at,within:y,elem:c})}),e.using&&(l=function(t){var i=g.left-C.left,s=i+p-u,n=g.top-C.top,a=n+m-d,h={target:{element:_,left:g.left,top:g.top,width:p,height:m},element:{element:c,left:C.left,top:C.top,width:u,height:d},horizontal:0>s?"left":i>0?"right":"center",vertical:0>a?"top":n>0?"bottom":"middle"};u>p&&p>r(i+s)&&(h.horizontal="center"),d>m&&m>r(n+a)&&(h.vertical="middle"),h.important=o(r(i),r(s))>o(r(n),r(a))?"horizontal":"vertical",e.using.call(this,t,h)}),c.offset(t.extend(C,{using:l}))})},t.ui.position={fit:{left:function(t,e){var i,s=e.within,n=s.isWindow?s.scrollLeft:s.offset.left,a=s.width,r=t.left-e.collisionPosition.marginLeft,h=n-r,l=r+e.collisionWidth-a-n;e.collisionWidth>a?h>0&&0>=l?(i=t.left+h+e.collisionWidth-a-n,t.left+=h-i):t.left=l>0&&0>=h?n:h>l?n+a-e.collisionWidth:n:h>0?t.left+=h:l>0?t.left-=l:t.left=o(t.left-r,t.left)},top:function(t,e){var i,s=e.within,n=s.isWindow?s.scrollTop:s.offset.top,a=e.within.height,r=t.top-e.collisionPosition.marginTop,h=n-r,l=r+e.collisionHeight-a-n;e.collisionHeight>a?h>0&&0>=l?(i=t.top+h+e.collisionHeight-a-n,t.top+=h-i):t.top=l>0&&0>=h?n:h>l?n+a-e.collisionHeight:n:h>0?t.top+=h:l>0?t.top-=l:t.top=o(t.top-r,t.top)}},flip:{left:function(t,e){var i,s,n=e.within,a=n.offset.left+n.scrollLeft,o=n.width,h=n.isWindow?n.scrollLeft:n.offset.left,l=t.left-e.collisionPosition.marginLeft,c=l-h,u=l+e.collisionWidth-o-h,d="left"===e.my[0]?-e.elemWidth:"right"===e.my[0]?e.elemWidth:0,p="left"===e.at[0]?e.targetWidth:"right"===e.at[0]?-e.targetWidth:0,f=-2*e.offset[0];0>c?(i=t.left+d+p+f+e.collisionWidth-o-a,(0>i||r(c)>i)&&(t.left+=d+p+f)):u>0&&(s=t.left-e.collisionPosition.marginLeft+d+p+f-h,(s>0||u>r(s))&&(t.left+=d+p+f))},top:function(t,e){var i,s,n=e.within,a=n.offset.top+n.scrollTop,o=n.height,h=n.isWindow?n.scrollTop:n.offset.top,l=t.top-e.collisionPosition.marginTop,c=l-h,u=l+e.collisionHeight-o-h,d="top"===e.my[1],p=d?-e.elemHeight:"bottom"===e.my[1]?e.elemHeight:0,f="top"===e.at[1]?e.targetHeight:"bottom"===e.at[1]?-e.targetHeight:0,m=-2*e.offset[1];0>c?(s=t.top+p+f+m+e.collisionHeight-o-a,t.top+p+f+m>c&&(0>s||r(c)>s)&&(t.top+=p+f+m)):u>0&&(i=t.top-e.collisionPosition.marginTop+p+f+m-h,t.top+p+f+m>u&&(i>0||u>r(i))&&(t.top+=p+f+m))}},flipfit:{left:function(){t.ui.position.flip.left.apply(this,arguments),t.ui.position.fit.left.apply(this,arguments)},top:function(){t.ui.position.flip.top.apply(this,arguments),t.ui.position.fit.top.apply(this,arguments)}}},function(){var e,i,s,n,a,o=document.getElementsByTagName("body")[0],r=document.createElement("div");e=document.createElement(o?"div":"body"),s={visibility:"hidden",width:0,height:0,border:0,margin:0,background:"none"},o&&t.extend(s,{position:"absolute",left:"-1000px",top:"-1000px"});for(a in s)e.style[a]=s[a];e.appendChild(r),i=o||document.documentElement,i.insertBefore(e,i.firstChild),r.style.cssText="position: absolute; left: 10.7432222px;",n=t(r).offset().left,t.support.offsetFractions=n>10&&11>n,e.innerHTML="",i.removeChild(e)}()})(jQuery);(function(e){e.widget("ui.draggable",e.ui.mouse,{version:"1.10.3",widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1,drag:null,start:null,stop:null},_create:function(){"original"!==this.options.helper||/^(?:r|a|f)/.test(this.element.css("position"))||(this.element[0].style.position="relative"),this.options.addClasses&&this.element.addClass("ui-draggable"),this.options.disabled&&this.element.addClass("ui-draggable-disabled"),this._mouseInit()},_destroy:function(){this.element.removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"),this._mouseDestroy()},_mouseCapture:function(t){var i=this.options;return this.helper||i.disabled||e(t.target).closest(".ui-resizable-handle").length>0?!1:(this.handle=this._getHandle(t),this.handle?(e(i.iframeFix===!0?"iframe":i.iframeFix).each(function(){e("<div class='ui-draggable-iframeFix' style='background: #fff;'></div>").css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1e3}).css(e(this).offset()).appendTo("body")}),!0):!1)},_mouseStart:function(t){var i=this.options;return this.helper=this._createHelper(t),this.helper.addClass("ui-draggable-dragging"),this._cacheHelperProportions(),e.ui.ddmanager&&(e.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(),this.offsetParent=this.helper.offsetParent(),this.offsetParentCssPosition=this.offsetParent.css("position"),this.offset=this.positionAbs=this.element.offset(),this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left},this.offset.scroll=!1,e.extend(this.offset,{click:{left:t.pageX-this.offset.left,top:t.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()}),this.originalPosition=this.position=this._generatePosition(t),this.originalPageX=t.pageX,this.originalPageY=t.pageY,i.cursorAt&&this._adjustOffsetFromHelper(i.cursorAt),this._setContainment(),this._trigger("start",t)===!1?(this._clear(),!1):(this._cacheHelperProportions(),e.ui.ddmanager&&!i.dropBehaviour&&e.ui.ddmanager.prepareOffsets(this,t),this._mouseDrag(t,!0),e.ui.ddmanager&&e.ui.ddmanager.dragStart(this,t),!0)},_mouseDrag:function(t,i){if("fixed"===this.offsetParentCssPosition&&(this.offset.parent=this._getParentOffset()),this.position=this._generatePosition(t),this.positionAbs=this._convertPositionTo("absolute"),!i){var s=this._uiHash();if(this._trigger("drag",t,s)===!1)return this._mouseUp({}),!1;this.position=s.position}return this.options.axis&&"y"===this.options.axis||(this.helper[0].style.left=this.position.left+"px"),this.options.axis&&"x"===this.options.axis||(this.helper[0].style.top=this.position.top+"px"),e.ui.ddmanager&&e.ui.ddmanager.drag(this,t),!1},_mouseStop:function(t){var i=this,s=!1;return e.ui.ddmanager&&!this.options.dropBehaviour&&(s=e.ui.ddmanager.drop(this,t)),this.dropped&&(s=this.dropped,this.dropped=!1),"original"!==this.options.helper||e.contains(this.element[0].ownerDocument,this.element[0])?("invalid"===this.options.revert&&!s||"valid"===this.options.revert&&s||this.options.revert===!0||e.isFunction(this.options.revert)&&this.options.revert.call(this.element,s)?e(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){i._trigger("stop",t)!==!1&&i._clear()}):this._trigger("stop",t)!==!1&&this._clear(),!1):!1},_mouseUp:function(t){return e("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)}),e.ui.ddmanager&&e.ui.ddmanager.dragStop(this,t),e.ui.mouse.prototype._mouseUp.call(this,t)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear(),this},_getHandle:function(t){return this.options.handle?!!e(t.target).closest(this.element.find(this.options.handle)).length:!0},_createHelper:function(t){var i=this.options,s=e.isFunction(i.helper)?e(i.helper.apply(this.element[0],[t])):"clone"===i.helper?this.element.clone().removeAttr("id"):this.element;return s.parents("body").length||s.appendTo("parent"===i.appendTo?this.element[0].parentNode:i.appendTo),s[0]===this.element[0]||/(fixed|absolute)/.test(s.css("position"))||s.css("position","absolute"),s},_adjustOffsetFromHelper:function(t){"string"==typeof t&&(t=t.split(" ")),e.isArray(t)&&(t={left:+t[0],top:+t[1]||0}),"left"in t&&(this.offset.click.left=t.left+this.margins.left),"right"in t&&(this.offset.click.left=this.helperProportions.width-t.right+this.margins.left),"top"in t&&(this.offset.click.top=t.top+this.margins.top),"bottom"in t&&(this.offset.click.top=this.helperProportions.height-t.bottom+this.margins.top)},_getParentOffset:function(){var t=this.offsetParent.offset();return"absolute"===this.cssPosition&&this.scrollParent[0]!==document&&e.contains(this.scrollParent[0],this.offsetParent[0])&&(t.left+=this.scrollParent.scrollLeft(),t.top+=this.scrollParent.scrollTop()),(this.offsetParent[0]===document.body||this.offsetParent[0].tagName&&"html"===this.offsetParent[0].tagName.toLowerCase()&&e.ui.ie)&&(t={top:0,left:0}),{top:t.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:t.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"===this.cssPosition){var e=this.element.position();return{top:e.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:e.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var t,i,s,n=this.options;return n.containment?"window"===n.containment?(this.containment=[e(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,e(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,e(window).scrollLeft()+e(window).width()-this.helperProportions.width-this.margins.left,e(window).scrollTop()+(e(window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],undefined):"document"===n.containment?(this.containment=[0,0,e(document).width()-this.helperProportions.width-this.margins.left,(e(document).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],undefined):n.containment.constructor===Array?(this.containment=n.containment,undefined):("parent"===n.containment&&(n.containment=this.helper[0].parentNode),i=e(n.containment),s=i[0],s&&(t="hidden"!==i.css("overflow"),this.containment=[(parseInt(i.css("borderLeftWidth"),10)||0)+(parseInt(i.css("paddingLeft"),10)||0),(parseInt(i.css("borderTopWidth"),10)||0)+(parseInt(i.css("paddingTop"),10)||0),(t?Math.max(s.scrollWidth,s.offsetWidth):s.offsetWidth)-(parseInt(i.css("borderRightWidth"),10)||0)-(parseInt(i.css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(t?Math.max(s.scrollHeight,s.offsetHeight):s.offsetHeight)-(parseInt(i.css("borderBottomWidth"),10)||0)-(parseInt(i.css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relative_container=i),undefined):(this.containment=null,undefined)},_convertPositionTo:function(t,i){i||(i=this.position);var s="absolute"===t?1:-1,n="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&e.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent;return this.offset.scroll||(this.offset.scroll={top:n.scrollTop(),left:n.scrollLeft()}),{top:i.top+this.offset.relative.top*s+this.offset.parent.top*s-("fixed"===this.cssPosition?-this.scrollParent.scrollTop():this.offset.scroll.top)*s,left:i.left+this.offset.relative.left*s+this.offset.parent.left*s-("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():this.offset.scroll.left)*s}},_generatePosition:function(t){var i,s,n,a,o=this.options,r="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&e.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,h=t.pageX,l=t.pageY;return this.offset.scroll||(this.offset.scroll={top:r.scrollTop(),left:r.scrollLeft()}),this.originalPosition&&(this.containment&&(this.relative_container?(s=this.relative_container.offset(),i=[this.containment[0]+s.left,this.containment[1]+s.top,this.containment[2]+s.left,this.containment[3]+s.top]):i=this.containment,t.pageX-this.offset.click.left<i[0]&&(h=i[0]+this.offset.click.left),t.pageY-this.offset.click.top<i[1]&&(l=i[1]+this.offset.click.top),t.pageX-this.offset.click.left>i[2]&&(h=i[2]+this.offset.click.left),t.pageY-this.offset.click.top>i[3]&&(l=i[3]+this.offset.click.top)),o.grid&&(n=o.grid[1]?this.originalPageY+Math.round((l-this.originalPageY)/o.grid[1])*o.grid[1]:this.originalPageY,l=i?n-this.offset.click.top>=i[1]||n-this.offset.click.top>i[3]?n:n-this.offset.click.top>=i[1]?n-o.grid[1]:n+o.grid[1]:n,a=o.grid[0]?this.originalPageX+Math.round((h-this.originalPageX)/o.grid[0])*o.grid[0]:this.originalPageX,h=i?a-this.offset.click.left>=i[0]||a-this.offset.click.left>i[2]?a:a-this.offset.click.left>=i[0]?a-o.grid[0]:a+o.grid[0]:a)),{top:l-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.scrollParent.scrollTop():this.offset.scroll.top),left:h-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():this.offset.scroll.left)}},_clear:function(){this.helper.removeClass("ui-draggable-dragging"),this.helper[0]===this.element[0]||this.cancelHelperRemoval||this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1},_trigger:function(t,i,s){return s=s||this._uiHash(),e.ui.plugin.call(this,t,[i,s]),"drag"===t&&(this.positionAbs=this._convertPositionTo("absolute")),e.Widget.prototype._trigger.call(this,t,i,s)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),e.ui.plugin.add("draggable","connectToSortable",{start:function(t,i){var s=e(this).data("ui-draggable"),n=s.options,a=e.extend({},i,{item:s.element});s.sortables=[],e(n.connectToSortable).each(function(){var i=e.data(this,"ui-sortable");i&&!i.options.disabled&&(s.sortables.push({instance:i,shouldRevert:i.options.revert}),i.refreshPositions(),i._trigger("activate",t,a))})},stop:function(t,i){var s=e(this).data("ui-draggable"),n=e.extend({},i,{item:s.element});e.each(s.sortables,function(){this.instance.isOver?(this.instance.isOver=0,s.cancelHelperRemoval=!0,this.instance.cancelHelperRemoval=!1,this.shouldRevert&&(this.instance.options.revert=this.shouldRevert),this.instance._mouseStop(t),this.instance.options.helper=this.instance.options._helper,"original"===s.options.helper&&this.instance.currentItem.css({top:"auto",left:"auto"})):(this.instance.cancelHelperRemoval=!1,this.instance._trigger("deactivate",t,n))})},drag:function(t,i){var s=e(this).data("ui-draggable"),n=this;e.each(s.sortables,function(){var a=!1,o=this;this.instance.positionAbs=s.positionAbs,this.instance.helperProportions=s.helperProportions,this.instance.offset.click=s.offset.click,this.instance._intersectsWith(this.instance.containerCache)&&(a=!0,e.each(s.sortables,function(){return this.instance.positionAbs=s.positionAbs,this.instance.helperProportions=s.helperProportions,this.instance.offset.click=s.offset.click,this!==o&&this.instance._intersectsWith(this.instance.containerCache)&&e.contains(o.instance.element[0],this.instance.element[0])&&(a=!1),a})),a?(this.instance.isOver||(this.instance.isOver=1,this.instance.currentItem=e(n).clone().removeAttr("id").appendTo(this.instance.element).data("ui-sortable-item",!0),this.instance.options._helper=this.instance.options.helper,this.instance.options.helper=function(){return i.helper[0]},t.target=this.instance.currentItem[0],this.instance._mouseCapture(t,!0),this.instance._mouseStart(t,!0,!0),this.instance.offset.click.top=s.offset.click.top,this.instance.offset.click.left=s.offset.click.left,this.instance.offset.parent.left-=s.offset.parent.left-this.instance.offset.parent.left,this.instance.offset.parent.top-=s.offset.parent.top-this.instance.offset.parent.top,s._trigger("toSortable",t),s.dropped=this.instance.element,s.currentItem=s.element,this.instance.fromOutside=s),this.instance.currentItem&&this.instance._mouseDrag(t)):this.instance.isOver&&(this.instance.isOver=0,this.instance.cancelHelperRemoval=!0,this.instance.options.revert=!1,this.instance._trigger("out",t,this.instance._uiHash(this.instance)),this.instance._mouseStop(t,!0),this.instance.options.helper=this.instance.options._helper,this.instance.currentItem.remove(),this.instance.placeholder&&this.instance.placeholder.remove(),s._trigger("fromSortable",t),s.dropped=!1)})}}),e.ui.plugin.add("draggable","cursor",{start:function(){var t=e("body"),i=e(this).data("ui-draggable").options;t.css("cursor")&&(i._cursor=t.css("cursor")),t.css("cursor",i.cursor)},stop:function(){var t=e(this).data("ui-draggable").options;t._cursor&&e("body").css("cursor",t._cursor)}}),e.ui.plugin.add("draggable","opacity",{start:function(t,i){var s=e(i.helper),n=e(this).data("ui-draggable").options;s.css("opacity")&&(n._opacity=s.css("opacity")),s.css("opacity",n.opacity)},stop:function(t,i){var s=e(this).data("ui-draggable").options;s._opacity&&e(i.helper).css("opacity",s._opacity)}}),e.ui.plugin.add("draggable","scroll",{start:function(){var t=e(this).data("ui-draggable");t.scrollParent[0]!==document&&"HTML"!==t.scrollParent[0].tagName&&(t.overflowOffset=t.scrollParent.offset())},drag:function(t){var i=e(this).data("ui-draggable"),s=i.options,n=!1;i.scrollParent[0]!==document&&"HTML"!==i.scrollParent[0].tagName?(s.axis&&"x"===s.axis||(i.overflowOffset.top+i.scrollParent[0].offsetHeight-t.pageY<s.scrollSensitivity?i.scrollParent[0].scrollTop=n=i.scrollParent[0].scrollTop+s.scrollSpeed:t.pageY-i.overflowOffset.top<s.scrollSensitivity&&(i.scrollParent[0].scrollTop=n=i.scrollParent[0].scrollTop-s.scrollSpeed)),s.axis&&"y"===s.axis||(i.overflowOffset.left+i.scrollParent[0].offsetWidth-t.pageX<s.scrollSensitivity?i.scrollParent[0].scrollLeft=n=i.scrollParent[0].scrollLeft+s.scrollSpeed:t.pageX-i.overflowOffset.left<s.scrollSensitivity&&(i.scrollParent[0].scrollLeft=n=i.scrollParent[0].scrollLeft-s.scrollSpeed))):(s.axis&&"x"===s.axis||(t.pageY-e(document).scrollTop()<s.scrollSensitivity?n=e(document).scrollTop(e(document).scrollTop()-s.scrollSpeed):e(window).height()-(t.pageY-e(document).scrollTop())<s.scrollSensitivity&&(n=e(document).scrollTop(e(document).scrollTop()+s.scrollSpeed))),s.axis&&"y"===s.axis||(t.pageX-e(document).scrollLeft()<s.scrollSensitivity?n=e(document).scrollLeft(e(document).scrollLeft()-s.scrollSpeed):e(window).width()-(t.pageX-e(document).scrollLeft())<s.scrollSensitivity&&(n=e(document).scrollLeft(e(document).scrollLeft()+s.scrollSpeed)))),n!==!1&&e.ui.ddmanager&&!s.dropBehaviour&&e.ui.ddmanager.prepareOffsets(i,t)}}),e.ui.plugin.add("draggable","snap",{start:function(){var t=e(this).data("ui-draggable"),i=t.options;t.snapElements=[],e(i.snap.constructor!==String?i.snap.items||":data(ui-draggable)":i.snap).each(function(){var i=e(this),s=i.offset();this!==t.element[0]&&t.snapElements.push({item:this,width:i.outerWidth(),height:i.outerHeight(),top:s.top,left:s.left})})},drag:function(t,i){var s,n,a,o,r,h,l,u,c,d,p=e(this).data("ui-draggable"),f=p.options,m=f.snapTolerance,g=i.offset.left,v=g+p.helperProportions.width,b=i.offset.top,y=b+p.helperProportions.height;for(c=p.snapElements.length-1;c>=0;c--)r=p.snapElements[c].left,h=r+p.snapElements[c].width,l=p.snapElements[c].top,u=l+p.snapElements[c].height,r-m>v||g>h+m||l-m>y||b>u+m||!e.contains(p.snapElements[c].item.ownerDocument,p.snapElements[c].item)?(p.snapElements[c].snapping&&p.options.snap.release&&p.options.snap.release.call(p.element,t,e.extend(p._uiHash(),{snapItem:p.snapElements[c].item})),p.snapElements[c].snapping=!1):("inner"!==f.snapMode&&(s=m>=Math.abs(l-y),n=m>=Math.abs(u-b),a=m>=Math.abs(r-v),o=m>=Math.abs(h-g),s&&(i.position.top=p._convertPositionTo("relative",{top:l-p.helperProportions.height,left:0}).top-p.margins.top),n&&(i.position.top=p._convertPositionTo("relative",{top:u,left:0}).top-p.margins.top),a&&(i.position.left=p._convertPositionTo("relative",{top:0,left:r-p.helperProportions.width}).left-p.margins.left),o&&(i.position.left=p._convertPositionTo("relative",{top:0,left:h}).left-p.margins.left)),d=s||n||a||o,"outer"!==f.snapMode&&(s=m>=Math.abs(l-b),n=m>=Math.abs(u-y),a=m>=Math.abs(r-g),o=m>=Math.abs(h-v),s&&(i.position.top=p._convertPositionTo("relative",{top:l,left:0}).top-p.margins.top),n&&(i.position.top=p._convertPositionTo("relative",{top:u-p.helperProportions.height,left:0}).top-p.margins.top),a&&(i.position.left=p._convertPositionTo("relative",{top:0,left:r}).left-p.margins.left),o&&(i.position.left=p._convertPositionTo("relative",{top:0,left:h-p.helperProportions.width}).left-p.margins.left)),!p.snapElements[c].snapping&&(s||n||a||o||d)&&p.options.snap.snap&&p.options.snap.snap.call(p.element,t,e.extend(p._uiHash(),{snapItem:p.snapElements[c].item})),p.snapElements[c].snapping=s||n||a||o||d)}}),e.ui.plugin.add("draggable","stack",{start:function(){var t,i=this.data("ui-draggable").options,s=e.makeArray(e(i.stack)).sort(function(t,i){return(parseInt(e(t).css("zIndex"),10)||0)-(parseInt(e(i).css("zIndex"),10)||0)});s.length&&(t=parseInt(e(s[0]).css("zIndex"),10)||0,e(s).each(function(i){e(this).css("zIndex",t+i)}),this.css("zIndex",t+s.length))}}),e.ui.plugin.add("draggable","zIndex",{start:function(t,i){var s=e(i.helper),n=e(this).data("ui-draggable").options;s.css("zIndex")&&(n._zIndex=s.css("zIndex")),s.css("zIndex",n.zIndex)},stop:function(t,i){var s=e(this).data("ui-draggable").options;s._zIndex&&e(i.helper).css("zIndex",s._zIndex)}})})(jQuery);(function(e){function t(e,t,i){return e>t&&t+i>e}e.widget("ui.droppable",{version:"1.10.3",widgetEventPrefix:"drop",options:{accept:"*",activeClass:!1,addClasses:!0,greedy:!1,hoverClass:!1,scope:"default",tolerance:"intersect",activate:null,deactivate:null,drop:null,out:null,over:null},_create:function(){var t=this.options,i=t.accept;this.isover=!1,this.isout=!0,this.accept=e.isFunction(i)?i:function(e){return e.is(i)},this.proportions={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight},e.ui.ddmanager.droppables[t.scope]=e.ui.ddmanager.droppables[t.scope]||[],e.ui.ddmanager.droppables[t.scope].push(this),t.addClasses&&this.element.addClass("ui-droppable")},_destroy:function(){for(var t=0,i=e.ui.ddmanager.droppables[this.options.scope];i.length>t;t++)i[t]===this&&i.splice(t,1);this.element.removeClass("ui-droppable ui-droppable-disabled")},_setOption:function(t,i){"accept"===t&&(this.accept=e.isFunction(i)?i:function(e){return e.is(i)}),e.Widget.prototype._setOption.apply(this,arguments)},_activate:function(t){var i=e.ui.ddmanager.current;this.options.activeClass&&this.element.addClass(this.options.activeClass),i&&this._trigger("activate",t,this.ui(i))},_deactivate:function(t){var i=e.ui.ddmanager.current;this.options.activeClass&&this.element.removeClass(this.options.activeClass),i&&this._trigger("deactivate",t,this.ui(i))},_over:function(t){var i=e.ui.ddmanager.current;i&&(i.currentItem||i.element)[0]!==this.element[0]&&this.accept.call(this.element[0],i.currentItem||i.element)&&(this.options.hoverClass&&this.element.addClass(this.options.hoverClass),this._trigger("over",t,this.ui(i)))},_out:function(t){var i=e.ui.ddmanager.current;i&&(i.currentItem||i.element)[0]!==this.element[0]&&this.accept.call(this.element[0],i.currentItem||i.element)&&(this.options.hoverClass&&this.element.removeClass(this.options.hoverClass),this._trigger("out",t,this.ui(i)))},_drop:function(t,i){var s=i||e.ui.ddmanager.current,n=!1;return s&&(s.currentItem||s.element)[0]!==this.element[0]?(this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function(){var t=e.data(this,"ui-droppable");return t.options.greedy&&!t.options.disabled&&t.options.scope===s.options.scope&&t.accept.call(t.element[0],s.currentItem||s.element)&&e.ui.intersect(s,e.extend(t,{offset:t.element.offset()}),t.options.tolerance)?(n=!0,!1):undefined}),n?!1:this.accept.call(this.element[0],s.currentItem||s.element)?(this.options.activeClass&&this.element.removeClass(this.options.activeClass),this.options.hoverClass&&this.element.removeClass(this.options.hoverClass),this._trigger("drop",t,this.ui(s)),this.element):!1):!1},ui:function(e){return{draggable:e.currentItem||e.element,helper:e.helper,position:e.position,offset:e.positionAbs}}}),e.ui.intersect=function(e,i,s){if(!i.offset)return!1;var n,a,o=(e.positionAbs||e.position.absolute).left,r=o+e.helperProportions.width,h=(e.positionAbs||e.position.absolute).top,l=h+e.helperProportions.height,u=i.offset.left,c=u+i.proportions.width,d=i.offset.top,p=d+i.proportions.height;switch(s){case"fit":return o>=u&&c>=r&&h>=d&&p>=l;case"intersect":return o+e.helperProportions.width/2>u&&c>r-e.helperProportions.width/2&&h+e.helperProportions.height/2>d&&p>l-e.helperProportions.height/2;case"pointer":return n=(e.positionAbs||e.position.absolute).left+(e.clickOffset||e.offset.click).left,a=(e.positionAbs||e.position.absolute).top+(e.clickOffset||e.offset.click).top,t(a,d,i.proportions.height)&&t(n,u,i.proportions.width);case"touch":return(h>=d&&p>=h||l>=d&&p>=l||d>h&&l>p)&&(o>=u&&c>=o||r>=u&&c>=r||u>o&&r>c);default:return!1}},e.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(t,i){var s,n,a=e.ui.ddmanager.droppables[t.options.scope]||[],o=i?i.type:null,r=(t.currentItem||t.element).find(":data(ui-droppable)").addBack();e:for(s=0;a.length>s;s++)if(!(a[s].options.disabled||t&&!a[s].accept.call(a[s].element[0],t.currentItem||t.element))){for(n=0;r.length>n;n++)if(r[n]===a[s].element[0]){a[s].proportions.height=0;continue e}a[s].visible="none"!==a[s].element.css("display"),a[s].visible&&("mousedown"===o&&a[s]._activate.call(a[s],i),a[s].offset=a[s].element.offset(),a[s].proportions={width:a[s].element[0].offsetWidth,height:a[s].element[0].offsetHeight})}},drop:function(t,i){var s=!1;return e.each((e.ui.ddmanager.droppables[t.options.scope]||[]).slice(),function(){this.options&&(!this.options.disabled&&this.visible&&e.ui.intersect(t,this,this.options.tolerance)&&(s=this._drop.call(this,i)||s),!this.options.disabled&&this.visible&&this.accept.call(this.element[0],t.currentItem||t.element)&&(this.isout=!0,this.isover=!1,this._deactivate.call(this,i)))}),s},dragStart:function(t,i){t.element.parentsUntil("body").bind("scroll.droppable",function(){t.options.refreshPositions||e.ui.ddmanager.prepareOffsets(t,i)})},drag:function(t,i){t.options.refreshPositions&&e.ui.ddmanager.prepareOffsets(t,i),e.each(e.ui.ddmanager.droppables[t.options.scope]||[],function(){if(!this.options.disabled&&!this.greedyChild&&this.visible){var s,n,a,o=e.ui.intersect(t,this,this.options.tolerance),r=!o&&this.isover?"isout":o&&!this.isover?"isover":null;r&&(this.options.greedy&&(n=this.options.scope,a=this.element.parents(":data(ui-droppable)").filter(function(){return e.data(this,"ui-droppable").options.scope===n}),a.length&&(s=e.data(a[0],"ui-droppable"),s.greedyChild="isover"===r)),s&&"isover"===r&&(s.isover=!1,s.isout=!0,s._out.call(s,i)),this[r]=!0,this["isout"===r?"isover":"isout"]=!1,this["isover"===r?"_over":"_out"].call(this,i),s&&"isout"===r&&(s.isout=!1,s.isover=!0,s._over.call(s,i)))}})},dragStop:function(t,i){t.element.parentsUntil("body").unbind("scroll.droppable"),t.options.refreshPositions||e.ui.ddmanager.prepareOffsets(t,i)}}})(jQuery);(function(e){function t(e){return parseInt(e,10)||0}function i(e){return!isNaN(parseInt(e,10))}e.widget("ui.resizable",e.ui.mouse,{version:"1.10.3",widgetEventPrefix:"resize",options:{alsoResize:!1,animate:!1,animateDuration:"slow",animateEasing:"swing",aspectRatio:!1,autoHide:!1,containment:!1,ghost:!1,grid:!1,handles:"e,s,se",helper:!1,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:90,resize:null,start:null,stop:null},_create:function(){var t,i,s,n,a,o=this,r=this.options;if(this.element.addClass("ui-resizable"),e.extend(this,{_aspectRatio:!!r.aspectRatio,aspectRatio:r.aspectRatio,originalElement:this.element,_proportionallyResizeElements:[],_helper:r.helper||r.ghost||r.animate?r.helper||"ui-resizable-helper":null}),this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)&&(this.element.wrap(e("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),top:this.element.css("top"),left:this.element.css("left")})),this.element=this.element.parent().data("ui-resizable",this.element.data("ui-resizable")),this.elementIsWrapper=!0,this.element.css({marginLeft:this.originalElement.css("marginLeft"),marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom")}),this.originalElement.css({marginLeft:0,marginTop:0,marginRight:0,marginBottom:0}),this.originalResizeStyle=this.originalElement.css("resize"),this.originalElement.css("resize","none"),this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"})),this.originalElement.css({margin:this.originalElement.css("margin")}),this._proportionallyResize()),this.handles=r.handles||(e(".ui-resizable-handle",this.element).length?{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",nw:".ui-resizable-nw"}:"e,s,se"),this.handles.constructor===String)for("all"===this.handles&&(this.handles="n,e,s,w,se,sw,ne,nw"),t=this.handles.split(","),this.handles={},i=0;t.length>i;i++)s=e.trim(t[i]),a="ui-resizable-"+s,n=e("<div class='ui-resizable-handle "+a+"'></div>"),n.css({zIndex:r.zIndex}),"se"===s&&n.addClass("ui-icon ui-icon-gripsmall-diagonal-se"),this.handles[s]=".ui-resizable-"+s,this.element.append(n);this._renderAxis=function(t){var i,s,n,a;t=t||this.element;for(i in this.handles)this.handles[i].constructor===String&&(this.handles[i]=e(this.handles[i],this.element).show()),this.elementIsWrapper&&this.originalElement[0].nodeName.match(/textarea|input|select|button/i)&&(s=e(this.handles[i],this.element),a=/sw|ne|nw|se|n|s/.test(i)?s.outerHeight():s.outerWidth(),n=["padding",/ne|nw|n/.test(i)?"Top":/se|sw|s/.test(i)?"Bottom":/^e$/.test(i)?"Right":"Left"].join(""),t.css(n,a),this._proportionallyResize()),e(this.handles[i]).length},this._renderAxis(this.element),this._handles=e(".ui-resizable-handle",this.element).disableSelection(),this._handles.mouseover(function(){o.resizing||(this.className&&(n=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i)),o.axis=n&&n[1]?n[1]:"se")}),r.autoHide&&(this._handles.hide(),e(this.element).addClass("ui-resizable-autohide").mouseenter(function(){r.disabled||(e(this).removeClass("ui-resizable-autohide"),o._handles.show())}).mouseleave(function(){r.disabled||o.resizing||(e(this).addClass("ui-resizable-autohide"),o._handles.hide())})),this._mouseInit()},_destroy:function(){this._mouseDestroy();var t,i=function(t){e(t).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").removeData("ui-resizable").unbind(".resizable").find(".ui-resizable-handle").remove()};return this.elementIsWrapper&&(i(this.element),t=this.element,this.originalElement.css({position:t.css("position"),width:t.outerWidth(),height:t.outerHeight(),top:t.css("top"),left:t.css("left")}).insertAfter(t),t.remove()),this.originalElement.css("resize",this.originalResizeStyle),i(this.originalElement),this},_mouseCapture:function(t){var i,s,n=!1;for(i in this.handles)s=e(this.handles[i])[0],(s===t.target||e.contains(s,t.target))&&(n=!0);return!this.options.disabled&&n},_mouseStart:function(i){var s,n,a,o=this.options,r=this.element.position(),h=this.element;return this.resizing=!0,/absolute/.test(h.css("position"))?h.css({position:"absolute",top:h.css("top"),left:h.css("left")}):h.is(".ui-draggable")&&h.css({position:"absolute",top:r.top,left:r.left}),this._renderProxy(),s=t(this.helper.css("left")),n=t(this.helper.css("top")),o.containment&&(s+=e(o.containment).scrollLeft()||0,n+=e(o.containment).scrollTop()||0),this.offset=this.helper.offset(),this.position={left:s,top:n},this.size=this._helper?{width:h.outerWidth(),height:h.outerHeight()}:{width:h.width(),height:h.height()},this.originalSize=this._helper?{width:h.outerWidth(),height:h.outerHeight()}:{width:h.width(),height:h.height()},this.originalPosition={left:s,top:n},this.sizeDiff={width:h.outerWidth()-h.width(),height:h.outerHeight()-h.height()},this.originalMousePosition={left:i.pageX,top:i.pageY},this.aspectRatio="number"==typeof o.aspectRatio?o.aspectRatio:this.originalSize.width/this.originalSize.height||1,a=e(".ui-resizable-"+this.axis).css("cursor"),e("body").css("cursor","auto"===a?this.axis+"-resize":a),h.addClass("ui-resizable-resizing"),this._propagate("start",i),!0},_mouseDrag:function(t){var i,s=this.helper,n={},a=this.originalMousePosition,o=this.axis,r=this.position.top,h=this.position.left,l=this.size.width,u=this.size.height,c=t.pageX-a.left||0,d=t.pageY-a.top||0,p=this._change[o];return p?(i=p.apply(this,[t,c,d]),this._updateVirtualBoundaries(t.shiftKey),(this._aspectRatio||t.shiftKey)&&(i=this._updateRatio(i,t)),i=this._respectSize(i,t),this._updateCache(i),this._propagate("resize",t),this.position.top!==r&&(n.top=this.position.top+"px"),this.position.left!==h&&(n.left=this.position.left+"px"),this.size.width!==l&&(n.width=this.size.width+"px"),this.size.height!==u&&(n.height=this.size.height+"px"),s.css(n),!this._helper&&this._proportionallyResizeElements.length&&this._proportionallyResize(),e.isEmptyObject(n)||this._trigger("resize",t,this.ui()),!1):!1},_mouseStop:function(t){this.resizing=!1;var i,s,n,a,o,r,h,l=this.options,u=this;return this._helper&&(i=this._proportionallyResizeElements,s=i.length&&/textarea/i.test(i[0].nodeName),n=s&&e.ui.hasScroll(i[0],"left")?0:u.sizeDiff.height,a=s?0:u.sizeDiff.width,o={width:u.helper.width()-a,height:u.helper.height()-n},r=parseInt(u.element.css("left"),10)+(u.position.left-u.originalPosition.left)||null,h=parseInt(u.element.css("top"),10)+(u.position.top-u.originalPosition.top)||null,l.animate||this.element.css(e.extend(o,{top:h,left:r})),u.helper.height(u.size.height),u.helper.width(u.size.width),this._helper&&!l.animate&&this._proportionallyResize()),e("body").css("cursor","auto"),this.element.removeClass("ui-resizable-resizing"),this._propagate("stop",t),this._helper&&this.helper.remove(),!1},_updateVirtualBoundaries:function(e){var t,s,n,a,o,r=this.options;o={minWidth:i(r.minWidth)?r.minWidth:0,maxWidth:i(r.maxWidth)?r.maxWidth:1/0,minHeight:i(r.minHeight)?r.minHeight:0,maxHeight:i(r.maxHeight)?r.maxHeight:1/0},(this._aspectRatio||e)&&(t=o.minHeight*this.aspectRatio,n=o.minWidth/this.aspectRatio,s=o.maxHeight*this.aspectRatio,a=o.maxWidth/this.aspectRatio,t>o.minWidth&&(o.minWidth=t),n>o.minHeight&&(o.minHeight=n),o.maxWidth>s&&(o.maxWidth=s),o.maxHeight>a&&(o.maxHeight=a)),this._vBoundaries=o},_updateCache:function(e){this.offset=this.helper.offset(),i(e.left)&&(this.position.left=e.left),i(e.top)&&(this.position.top=e.top),i(e.height)&&(this.size.height=e.height),i(e.width)&&(this.size.width=e.width)},_updateRatio:function(e){var t=this.position,s=this.size,n=this.axis;return i(e.height)?e.width=e.height*this.aspectRatio:i(e.width)&&(e.height=e.width/this.aspectRatio),"sw"===n&&(e.left=t.left+(s.width-e.width),e.top=null),"nw"===n&&(e.top=t.top+(s.height-e.height),e.left=t.left+(s.width-e.width)),e},_respectSize:function(e){var t=this._vBoundaries,s=this.axis,n=i(e.width)&&t.maxWidth&&t.maxWidth<e.width,a=i(e.height)&&t.maxHeight&&t.maxHeight<e.height,o=i(e.width)&&t.minWidth&&t.minWidth>e.width,r=i(e.height)&&t.minHeight&&t.minHeight>e.height,h=this.originalPosition.left+this.originalSize.width,l=this.position.top+this.size.height,u=/sw|nw|w/.test(s),c=/nw|ne|n/.test(s);return o&&(e.width=t.minWidth),r&&(e.height=t.minHeight),n&&(e.width=t.maxWidth),a&&(e.height=t.maxHeight),o&&u&&(e.left=h-t.minWidth),n&&u&&(e.left=h-t.maxWidth),r&&c&&(e.top=l-t.minHeight),a&&c&&(e.top=l-t.maxHeight),e.width||e.height||e.left||!e.top?e.width||e.height||e.top||!e.left||(e.left=null):e.top=null,e},_proportionallyResize:function(){if(this._proportionallyResizeElements.length){var e,t,i,s,n,a=this.helper||this.element;for(e=0;this._proportionallyResizeElements.length>e;e++){if(n=this._proportionallyResizeElements[e],!this.borderDif)for(this.borderDif=[],i=[n.css("borderTopWidth"),n.css("borderRightWidth"),n.css("borderBottomWidth"),n.css("borderLeftWidth")],s=[n.css("paddingTop"),n.css("paddingRight"),n.css("paddingBottom"),n.css("paddingLeft")],t=0;i.length>t;t++)this.borderDif[t]=(parseInt(i[t],10)||0)+(parseInt(s[t],10)||0);n.css({height:a.height()-this.borderDif[0]-this.borderDif[2]||0,width:a.width()-this.borderDif[1]-this.borderDif[3]||0})}}},_renderProxy:function(){var t=this.element,i=this.options;this.elementOffset=t.offset(),this._helper?(this.helper=this.helper||e("<div style='overflow:hidden;'></div>"),this.helper.addClass(this._helper).css({width:this.element.outerWidth()-1,height:this.element.outerHeight()-1,position:"absolute",left:this.elementOffset.left+"px",top:this.elementOffset.top+"px",zIndex:++i.zIndex}),this.helper.appendTo("body").disableSelection()):this.helper=this.element},_change:{e:function(e,t){return{width:this.originalSize.width+t}},w:function(e,t){var i=this.originalSize,s=this.originalPosition;return{left:s.left+t,width:i.width-t}},n:function(e,t,i){var s=this.originalSize,n=this.originalPosition;return{top:n.top+i,height:s.height-i}},s:function(e,t,i){return{height:this.originalSize.height+i}},se:function(t,i,s){return e.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[t,i,s]))},sw:function(t,i,s){return e.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[t,i,s]))},ne:function(t,i,s){return e.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[t,i,s]))},nw:function(t,i,s){return e.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[t,i,s]))}},_propagate:function(t,i){e.ui.plugin.call(this,t,[i,this.ui()]),"resize"!==t&&this._trigger(t,i,this.ui())},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition}}}),e.ui.plugin.add("resizable","animate",{stop:function(t){var i=e(this).data("ui-resizable"),s=i.options,n=i._proportionallyResizeElements,a=n.length&&/textarea/i.test(n[0].nodeName),o=a&&e.ui.hasScroll(n[0],"left")?0:i.sizeDiff.height,r=a?0:i.sizeDiff.width,h={width:i.size.width-r,height:i.size.height-o},l=parseInt(i.element.css("left"),10)+(i.position.left-i.originalPosition.left)||null,u=parseInt(i.element.css("top"),10)+(i.position.top-i.originalPosition.top)||null;i.element.animate(e.extend(h,u&&l?{top:u,left:l}:{}),{duration:s.animateDuration,easing:s.animateEasing,step:function(){var s={width:parseInt(i.element.css("width"),10),height:parseInt(i.element.css("height"),10),top:parseInt(i.element.css("top"),10),left:parseInt(i.element.css("left"),10)};n&&n.length&&e(n[0]).css({width:s.width,height:s.height}),i._updateCache(s),i._propagate("resize",t)}})}}),e.ui.plugin.add("resizable","containment",{start:function(){var i,s,n,a,o,r,h,l=e(this).data("ui-resizable"),u=l.options,c=l.element,d=u.containment,p=d instanceof e?d.get(0):/parent/.test(d)?c.parent().get(0):d;p&&(l.containerElement=e(p),/document/.test(d)||d===document?(l.containerOffset={left:0,top:0},l.containerPosition={left:0,top:0},l.parentData={element:e(document),left:0,top:0,width:e(document).width(),height:e(document).height()||document.body.parentNode.scrollHeight}):(i=e(p),s=[],e(["Top","Right","Left","Bottom"]).each(function(e,n){s[e]=t(i.css("padding"+n))}),l.containerOffset=i.offset(),l.containerPosition=i.position(),l.containerSize={height:i.innerHeight()-s[3],width:i.innerWidth()-s[1]},n=l.containerOffset,a=l.containerSize.height,o=l.containerSize.width,r=e.ui.hasScroll(p,"left")?p.scrollWidth:o,h=e.ui.hasScroll(p)?p.scrollHeight:a,l.parentData={element:p,left:n.left,top:n.top,width:r,height:h}))},resize:function(t){var i,s,n,a,o=e(this).data("ui-resizable"),r=o.options,h=o.containerOffset,l=o.position,u=o._aspectRatio||t.shiftKey,c={top:0,left:0},d=o.containerElement;d[0]!==document&&/static/.test(d.css("position"))&&(c=h),l.left<(o._helper?h.left:0)&&(o.size.width=o.size.width+(o._helper?o.position.left-h.left:o.position.left-c.left),u&&(o.size.height=o.size.width/o.aspectRatio),o.position.left=r.helper?h.left:0),l.top<(o._helper?h.top:0)&&(o.size.height=o.size.height+(o._helper?o.position.top-h.top:o.position.top),u&&(o.size.width=o.size.height*o.aspectRatio),o.position.top=o._helper?h.top:0),o.offset.left=o.parentData.left+o.position.left,o.offset.top=o.parentData.top+o.position.top,i=Math.abs((o._helper?o.offset.left-c.left:o.offset.left-c.left)+o.sizeDiff.width),s=Math.abs((o._helper?o.offset.top-c.top:o.offset.top-h.top)+o.sizeDiff.height),n=o.containerElement.get(0)===o.element.parent().get(0),a=/relative|absolute/.test(o.containerElement.css("position")),n&&a&&(i-=o.parentData.left),i+o.size.width>=o.parentData.width&&(o.size.width=o.parentData.width-i,u&&(o.size.height=o.size.width/o.aspectRatio)),s+o.size.height>=o.parentData.height&&(o.size.height=o.parentData.height-s,u&&(o.size.width=o.size.height*o.aspectRatio))},stop:function(){var t=e(this).data("ui-resizable"),i=t.options,s=t.containerOffset,n=t.containerPosition,a=t.containerElement,o=e(t.helper),r=o.offset(),h=o.outerWidth()-t.sizeDiff.width,l=o.outerHeight()-t.sizeDiff.height;t._helper&&!i.animate&&/relative/.test(a.css("position"))&&e(this).css({left:r.left-n.left-s.left,width:h,height:l}),t._helper&&!i.animate&&/static/.test(a.css("position"))&&e(this).css({left:r.left-n.left-s.left,width:h,height:l})}}),e.ui.plugin.add("resizable","alsoResize",{start:function(){var t=e(this).data("ui-resizable"),i=t.options,s=function(t){e(t).each(function(){var t=e(this);t.data("ui-resizable-alsoresize",{width:parseInt(t.width(),10),height:parseInt(t.height(),10),left:parseInt(t.css("left"),10),top:parseInt(t.css("top"),10)})})};"object"!=typeof i.alsoResize||i.alsoResize.parentNode?s(i.alsoResize):i.alsoResize.length?(i.alsoResize=i.alsoResize[0],s(i.alsoResize)):e.each(i.alsoResize,function(e){s(e)})},resize:function(t,i){var s=e(this).data("ui-resizable"),n=s.options,a=s.originalSize,o=s.originalPosition,r={height:s.size.height-a.height||0,width:s.size.width-a.width||0,top:s.position.top-o.top||0,left:s.position.left-o.left||0},h=function(t,s){e(t).each(function(){var t=e(this),n=e(this).data("ui-resizable-alsoresize"),a={},o=s&&s.length?s:t.parents(i.originalElement[0]).length?["width","height"]:["width","height","top","left"];e.each(o,function(e,t){var i=(n[t]||0)+(r[t]||0);i&&i>=0&&(a[t]=i||null)}),t.css(a)})};"object"!=typeof n.alsoResize||n.alsoResize.nodeType?h(n.alsoResize):e.each(n.alsoResize,function(e,t){h(e,t)})},stop:function(){e(this).removeData("resizable-alsoresize")}}),e.ui.plugin.add("resizable","ghost",{start:function(){var t=e(this).data("ui-resizable"),i=t.options,s=t.size;t.ghost=t.originalElement.clone(),t.ghost.css({opacity:.25,display:"block",position:"relative",height:s.height,width:s.width,margin:0,left:0,top:0}).addClass("ui-resizable-ghost").addClass("string"==typeof i.ghost?i.ghost:""),t.ghost.appendTo(t.helper)},resize:function(){var t=e(this).data("ui-resizable");t.ghost&&t.ghost.css({position:"relative",height:t.size.height,width:t.size.width})},stop:function(){var t=e(this).data("ui-resizable");t.ghost&&t.helper&&t.helper.get(0).removeChild(t.ghost.get(0))}}),e.ui.plugin.add("resizable","grid",{resize:function(){var t=e(this).data("ui-resizable"),i=t.options,s=t.size,n=t.originalSize,a=t.originalPosition,o=t.axis,r="number"==typeof i.grid?[i.grid,i.grid]:i.grid,h=r[0]||1,l=r[1]||1,u=Math.round((s.width-n.width)/h)*h,c=Math.round((s.height-n.height)/l)*l,d=n.width+u,p=n.height+c,f=i.maxWidth&&d>i.maxWidth,m=i.maxHeight&&p>i.maxHeight,g=i.minWidth&&i.minWidth>d,v=i.minHeight&&i.minHeight>p;i.grid=r,g&&(d+=h),v&&(p+=l),f&&(d-=h),m&&(p-=l),/^(se|s|e)$/.test(o)?(t.size.width=d,t.size.height=p):/^(ne)$/.test(o)?(t.size.width=d,t.size.height=p,t.position.top=a.top-c):/^(sw)$/.test(o)?(t.size.width=d,t.size.height=p,t.position.left=a.left-u):(t.size.width=d,t.size.height=p,t.position.top=a.top-c,t.position.left=a.left-u)}})})(jQuery);(function(t){var e=5;t.widget("ui.slider",t.ui.mouse,{version:"1.10.3",widgetEventPrefix:"slide",options:{animate:!1,distance:0,max:100,min:0,orientation:"horizontal",range:!1,step:1,value:0,values:null,change:null,slide:null,start:null,stop:null},_create:function(){this._keySliding=!1,this._mouseSliding=!1,this._animateOff=!0,this._handleIndex=null,this._detectOrientation(),this._mouseInit(),this.element.addClass("ui-slider ui-slider-"+this.orientation+" ui-widget"+" ui-widget-content"+" ui-corner-all"),this._refresh(),this._setOption("disabled",this.options.disabled),this._animateOff=!1},_refresh:function(){this._createRange(),this._createHandles(),this._setupEvents(),this._refreshValue()},_createHandles:function(){var e,i,s=this.options,n=this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),a="<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>",o=[];for(i=s.values&&s.values.length||1,n.length>i&&(n.slice(i).remove(),n=n.slice(0,i)),e=n.length;i>e;e++)o.push(a);this.handles=n.add(t(o.join("")).appendTo(this.element)),this.handle=this.handles.eq(0),this.handles.each(function(e){t(this).data("ui-slider-handle-index",e)})},_createRange:function(){var e=this.options,i="";e.range?(e.range===!0&&(e.values?e.values.length&&2!==e.values.length?e.values=[e.values[0],e.values[0]]:t.isArray(e.values)&&(e.values=e.values.slice(0)):e.values=[this._valueMin(),this._valueMin()]),this.range&&this.range.length?this.range.removeClass("ui-slider-range-min ui-slider-range-max").css({left:"",bottom:""}):(this.range=t("<div></div>").appendTo(this.element),i="ui-slider-range ui-widget-header ui-corner-all"),this.range.addClass(i+("min"===e.range||"max"===e.range?" ui-slider-range-"+e.range:""))):this.range=t([])},_setupEvents:function(){var t=this.handles.add(this.range).filter("a");this._off(t),this._on(t,this._handleEvents),this._hoverable(t),this._focusable(t)},_destroy:function(){this.handles.remove(),this.range.remove(),this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-widget ui-widget-content ui-corner-all"),this._mouseDestroy()},_mouseCapture:function(e){var i,s,n,a,o,r,h,l,u=this,c=this.options;return c.disabled?!1:(this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()},this.elementOffset=this.element.offset(),i={x:e.pageX,y:e.pageY},s=this._normValueFromMouse(i),n=this._valueMax()-this._valueMin()+1,this.handles.each(function(e){var i=Math.abs(s-u.values(e));(n>i||n===i&&(e===u._lastChangedValue||u.values(e)===c.min))&&(n=i,a=t(this),o=e)}),r=this._start(e,o),r===!1?!1:(this._mouseSliding=!0,this._handleIndex=o,a.addClass("ui-state-active").focus(),h=a.offset(),l=!t(e.target).parents().addBack().is(".ui-slider-handle"),this._clickOffset=l?{left:0,top:0}:{left:e.pageX-h.left-a.width()/2,top:e.pageY-h.top-a.height()/2-(parseInt(a.css("borderTopWidth"),10)||0)-(parseInt(a.css("borderBottomWidth"),10)||0)+(parseInt(a.css("marginTop"),10)||0)},this.handles.hasClass("ui-state-hover")||this._slide(e,o,s),this._animateOff=!0,!0))},_mouseStart:function(){return!0},_mouseDrag:function(t){var e={x:t.pageX,y:t.pageY},i=this._normValueFromMouse(e);return this._slide(t,this._handleIndex,i),!1},_mouseStop:function(t){return this.handles.removeClass("ui-state-active"),this._mouseSliding=!1,this._stop(t,this._handleIndex),this._change(t,this._handleIndex),this._handleIndex=null,this._clickOffset=null,this._animateOff=!1,!1},_detectOrientation:function(){this.orientation="vertical"===this.options.orientation?"vertical":"horizontal"},_normValueFromMouse:function(t){var e,i,s,n,a;return"horizontal"===this.orientation?(e=this.elementSize.width,i=t.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)):(e=this.elementSize.height,i=t.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)),s=i/e,s>1&&(s=1),0>s&&(s=0),"vertical"===this.orientation&&(s=1-s),n=this._valueMax()-this._valueMin(),a=this._valueMin()+s*n,this._trimAlignValue(a)},_start:function(t,e){var i={handle:this.handles[e],value:this.value()};return this.options.values&&this.options.values.length&&(i.value=this.values(e),i.values=this.values()),this._trigger("start",t,i)},_slide:function(t,e,i){var s,n,a;this.options.values&&this.options.values.length?(s=this.values(e?0:1),2===this.options.values.length&&this.options.range===!0&&(0===e&&i>s||1===e&&s>i)&&(i=s),i!==this.values(e)&&(n=this.values(),n[e]=i,a=this._trigger("slide",t,{handle:this.handles[e],value:i,values:n}),s=this.values(e?0:1),a!==!1&&this.values(e,i,!0))):i!==this.value()&&(a=this._trigger("slide",t,{handle:this.handles[e],value:i}),a!==!1&&this.value(i))},_stop:function(t,e){var i={handle:this.handles[e],value:this.value()};this.options.values&&this.options.values.length&&(i.value=this.values(e),i.values=this.values()),this._trigger("stop",t,i)},_change:function(t,e){if(!this._keySliding&&!this._mouseSliding){var i={handle:this.handles[e],value:this.value()};this.options.values&&this.options.values.length&&(i.value=this.values(e),i.values=this.values()),this._lastChangedValue=e,this._trigger("change",t,i)}},value:function(t){return arguments.length?(this.options.value=this._trimAlignValue(t),this._refreshValue(),this._change(null,0),undefined):this._value()},values:function(e,i){var s,n,a;if(arguments.length>1)return this.options.values[e]=this._trimAlignValue(i),this._refreshValue(),this._change(null,e),undefined;if(!arguments.length)return this._values();if(!t.isArray(arguments[0]))return this.options.values&&this.options.values.length?this._values(e):this.value();for(s=this.options.values,n=arguments[0],a=0;s.length>a;a+=1)s[a]=this._trimAlignValue(n[a]),this._change(null,a);this._refreshValue()},_setOption:function(e,i){var s,n=0;switch("range"===e&&this.options.range===!0&&("min"===i?(this.options.value=this._values(0),this.options.values=null):"max"===i&&(this.options.value=this._values(this.options.values.length-1),this.options.values=null)),t.isArray(this.options.values)&&(n=this.options.values.length),t.Widget.prototype._setOption.apply(this,arguments),e){case"orientation":this._detectOrientation(),this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation),this._refreshValue();break;case"value":this._animateOff=!0,this._refreshValue(),this._change(null,0),this._animateOff=!1;break;case"values":for(this._animateOff=!0,this._refreshValue(),s=0;n>s;s+=1)this._change(null,s);this._animateOff=!1;break;case"min":case"max":this._animateOff=!0,this._refreshValue(),this._animateOff=!1;break;case"range":this._animateOff=!0,this._refresh(),this._animateOff=!1}},_value:function(){var t=this.options.value;return t=this._trimAlignValue(t)},_values:function(t){var e,i,s;if(arguments.length)return e=this.options.values[t],e=this._trimAlignValue(e);if(this.options.values&&this.options.values.length){for(i=this.options.values.slice(),s=0;i.length>s;s+=1)i[s]=this._trimAlignValue(i[s]);return i}return[]},_trimAlignValue:function(t){if(this._valueMin()>=t)return this._valueMin();if(t>=this._valueMax())return this._valueMax();var e=this.options.step>0?this.options.step:1,i=(t-this._valueMin())%e,s=t-i;return 2*Math.abs(i)>=e&&(s+=i>0?e:-e),parseFloat(s.toFixed(5))},_valueMin:function(){return this.options.min},_valueMax:function(){return this.options.max},_refreshValue:function(){var e,i,s,n,a,o=this.options.range,r=this.options,h=this,l=this._animateOff?!1:r.animate,u={};this.options.values&&this.options.values.length?this.handles.each(function(s){i=100*((h.values(s)-h._valueMin())/(h._valueMax()-h._valueMin())),u["horizontal"===h.orientation?"left":"bottom"]=i+"%",t(this).stop(1,1)[l?"animate":"css"](u,r.animate),h.options.range===!0&&("horizontal"===h.orientation?(0===s&&h.range.stop(1,1)[l?"animate":"css"]({left:i+"%"},r.animate),1===s&&h.range[l?"animate":"css"]({width:i-e+"%"},{queue:!1,duration:r.animate})):(0===s&&h.range.stop(1,1)[l?"animate":"css"]({bottom:i+"%"},r.animate),1===s&&h.range[l?"animate":"css"]({height:i-e+"%"},{queue:!1,duration:r.animate}))),e=i}):(s=this.value(),n=this._valueMin(),a=this._valueMax(),i=a!==n?100*((s-n)/(a-n)):0,u["horizontal"===this.orientation?"left":"bottom"]=i+"%",this.handle.stop(1,1)[l?"animate":"css"](u,r.animate),"min"===o&&"horizontal"===this.orientation&&this.range.stop(1,1)[l?"animate":"css"]({width:i+"%"},r.animate),"max"===o&&"horizontal"===this.orientation&&this.range[l?"animate":"css"]({width:100-i+"%"},{queue:!1,duration:r.animate}),"min"===o&&"vertical"===this.orientation&&this.range.stop(1,1)[l?"animate":"css"]({height:i+"%"},r.animate),"max"===o&&"vertical"===this.orientation&&this.range[l?"animate":"css"]({height:100-i+"%"},{queue:!1,duration:r.animate}))},_handleEvents:{keydown:function(i){var s,n,a,o,r=t(i.target).data("ui-slider-handle-index");switch(i.keyCode){case t.ui.keyCode.HOME:case t.ui.keyCode.END:case t.ui.keyCode.PAGE_UP:case t.ui.keyCode.PAGE_DOWN:case t.ui.keyCode.UP:case t.ui.keyCode.RIGHT:case t.ui.keyCode.DOWN:case t.ui.keyCode.LEFT:if(i.preventDefault(),!this._keySliding&&(this._keySliding=!0,t(i.target).addClass("ui-state-active"),s=this._start(i,r),s===!1))return}switch(o=this.options.step,n=a=this.options.values&&this.options.values.length?this.values(r):this.value(),i.keyCode){case t.ui.keyCode.HOME:a=this._valueMin();break;case t.ui.keyCode.END:a=this._valueMax();break;case t.ui.keyCode.PAGE_UP:a=this._trimAlignValue(n+(this._valueMax()-this._valueMin())/e);break;case t.ui.keyCode.PAGE_DOWN:a=this._trimAlignValue(n-(this._valueMax()-this._valueMin())/e);break;case t.ui.keyCode.UP:case t.ui.keyCode.RIGHT:if(n===this._valueMax())return;a=this._trimAlignValue(n+o);break;case t.ui.keyCode.DOWN:case t.ui.keyCode.LEFT:if(n===this._valueMin())return;a=this._trimAlignValue(n-o)}this._slide(i,r,a)},click:function(t){t.preventDefault()},keyup:function(e){var i=t(e.target).data("ui-slider-handle-index");this._keySliding&&(this._keySliding=!1,this._stop(e,i),this._change(e,i),t(e.target).removeClass("ui-state-active"))}}})})(jQuery);(function(t,e){function i(){return++n}function s(t){return t.hash.length>1&&decodeURIComponent(t.href.replace(a,""))===decodeURIComponent(location.href.replace(a,""))}var n=0,a=/#.*$/;t.widget("ui.tabs",{version:"1.10.3",delay:300,options:{active:null,collapsible:!1,event:"click",heightStyle:"content",hide:null,show:null,activate:null,beforeActivate:null,beforeLoad:null,load:null},_create:function(){var e=this,i=this.options;this.running=!1,this.element.addClass("ui-tabs ui-widget ui-widget-content ui-corner-all").toggleClass("ui-tabs-collapsible",i.collapsible).delegate(".ui-tabs-nav > li","mousedown"+this.eventNamespace,function(e){t(this).is(".ui-state-disabled")&&e.preventDefault()}).delegate(".ui-tabs-anchor","focus"+this.eventNamespace,function(){t(this).closest("li").is(".ui-state-disabled")&&this.blur()}),this._processTabs(),i.active=this._initialActive(),t.isArray(i.disabled)&&(i.disabled=t.unique(i.disabled.concat(t.map(this.tabs.filter(".ui-state-disabled"),function(t){return e.tabs.index(t)}))).sort()),this.active=this.options.active!==!1&&this.anchors.length?this._findActive(i.active):t(),this._refresh(),this.active.length&&this.load(i.active)},_initialActive:function(){var i=this.options.active,s=this.options.collapsible,n=location.hash.substring(1);return null===i&&(n&&this.tabs.each(function(s,a){return t(a).attr("aria-controls")===n?(i=s,!1):e}),null===i&&(i=this.tabs.index(this.tabs.filter(".ui-tabs-active"))),(null===i||-1===i)&&(i=this.tabs.length?0:!1)),i!==!1&&(i=this.tabs.index(this.tabs.eq(i)),-1===i&&(i=s?!1:0)),!s&&i===!1&&this.anchors.length&&(i=0),i},_getCreateEventData:function(){return{tab:this.active,panel:this.active.length?this._getPanelForTab(this.active):t()}},_tabKeydown:function(i){var s=t(this.document[0].activeElement).closest("li"),n=this.tabs.index(s),a=!0;if(!this._handlePageNav(i)){switch(i.keyCode){case t.ui.keyCode.RIGHT:case t.ui.keyCode.DOWN:n++;break;case t.ui.keyCode.UP:case t.ui.keyCode.LEFT:a=!1,n--;break;case t.ui.keyCode.END:n=this.anchors.length-1;break;case t.ui.keyCode.HOME:n=0;break;case t.ui.keyCode.SPACE:return i.preventDefault(),clearTimeout(this.activating),this._activate(n),e;case t.ui.keyCode.ENTER:return i.preventDefault(),clearTimeout(this.activating),this._activate(n===this.options.active?!1:n),e;default:return}i.preventDefault(),clearTimeout(this.activating),n=this._focusNextTab(n,a),i.ctrlKey||(s.attr("aria-selected","false"),this.tabs.eq(n).attr("aria-selected","true"),this.activating=this._delay(function(){this.option("active",n)},this.delay))}},_panelKeydown:function(e){this._handlePageNav(e)||e.ctrlKey&&e.keyCode===t.ui.keyCode.UP&&(e.preventDefault(),this.active.focus())},_handlePageNav:function(i){return i.altKey&&i.keyCode===t.ui.keyCode.PAGE_UP?(this._activate(this._focusNextTab(this.options.active-1,!1)),!0):i.altKey&&i.keyCode===t.ui.keyCode.PAGE_DOWN?(this._activate(this._focusNextTab(this.options.active+1,!0)),!0):e},_findNextTab:function(e,i){function s(){return e>n&&(e=0),0>e&&(e=n),e}for(var n=this.tabs.length-1;-1!==t.inArray(s(),this.options.disabled);)e=i?e+1:e-1;return e},_focusNextTab:function(t,e){return t=this._findNextTab(t,e),this.tabs.eq(t).focus(),t},_setOption:function(t,i){return"active"===t?(this._activate(i),e):"disabled"===t?(this._setupDisabled(i),e):(this._super(t,i),"collapsible"===t&&(this.element.toggleClass("ui-tabs-collapsible",i),i||this.options.active!==!1||this._activate(0)),"event"===t&&this._setupEvents(i),"heightStyle"===t&&this._setupHeightStyle(i),e)},_tabId:function(t){return t.attr("aria-controls")||"ui-tabs-"+i()},_sanitizeSelector:function(t){return t?t.replace(/[!"$%&'()*+,.\/:;<=>?@\[\]\^`{|}~]/g,"\\$&"):""},refresh:function(){var e=this.options,i=this.tablist.children(":has(a[href])");e.disabled=t.map(i.filter(".ui-state-disabled"),function(t){return i.index(t)}),this._processTabs(),e.active!==!1&&this.anchors.length?this.active.length&&!t.contains(this.tablist[0],this.active[0])?this.tabs.length===e.disabled.length?(e.active=!1,this.active=t()):this._activate(this._findNextTab(Math.max(0,e.active-1),!1)):e.active=this.tabs.index(this.active):(e.active=!1,this.active=t()),this._refresh()},_refresh:function(){this._setupDisabled(this.options.disabled),this._setupEvents(this.options.event),this._setupHeightStyle(this.options.heightStyle),this.tabs.not(this.active).attr({"aria-selected":"false",tabIndex:-1}),this.panels.not(this._getPanelForTab(this.active)).hide().attr({"aria-expanded":"false","aria-hidden":"true"}),this.active.length?(this.active.addClass("ui-tabs-active ui-state-active").attr({"aria-selected":"true",tabIndex:0}),this._getPanelForTab(this.active).show().attr({"aria-expanded":"true","aria-hidden":"false"})):this.tabs.eq(0).attr("tabIndex",0)},_processTabs:function(){var e=this;this.tablist=this._getList().addClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all").attr("role","tablist"),this.tabs=this.tablist.find("> li:has(a[href])").addClass("ui-state-default ui-corner-top").attr({role:"tab",tabIndex:-1}),this.anchors=this.tabs.map(function(){return t("a",this)[0]}).addClass("ui-tabs-anchor").attr({role:"presentation",tabIndex:-1}),this.panels=t(),this.anchors.each(function(i,n){var a,o,r,h=t(n).uniqueId().attr("id"),l=t(n).closest("li"),u=l.attr("aria-controls");s(n)?(a=n.hash,o=e.element.find(e._sanitizeSelector(a))):(r=e._tabId(l),a="#"+r,o=e.element.find(a),o.length||(o=e._createPanel(r),o.insertAfter(e.panels[i-1]||e.tablist)),o.attr("aria-live","polite")),o.length&&(e.panels=e.panels.add(o)),u&&l.data("ui-tabs-aria-controls",u),l.attr({"aria-controls":a.substring(1),"aria-labelledby":h}),o.attr("aria-labelledby",h)}),this.panels.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").attr("role","tabpanel")},_getList:function(){return this.element.find("ol,ul").eq(0)},_createPanel:function(e){return t("<div>").attr("id",e).addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").data("ui-tabs-destroy",!0)},_setupDisabled:function(e){t.isArray(e)&&(e.length?e.length===this.anchors.length&&(e=!0):e=!1);for(var i,s=0;i=this.tabs[s];s++)e===!0||-1!==t.inArray(s,e)?t(i).addClass("ui-state-disabled").attr("aria-disabled","true"):t(i).removeClass("ui-state-disabled").removeAttr("aria-disabled");this.options.disabled=e},_setupEvents:function(e){var i={click:function(t){t.preventDefault()}};e&&t.each(e.split(" "),function(t,e){i[e]="_eventHandler"}),this._off(this.anchors.add(this.tabs).add(this.panels)),this._on(this.anchors,i),this._on(this.tabs,{keydown:"_tabKeydown"}),this._on(this.panels,{keydown:"_panelKeydown"}),this._focusable(this.tabs),this._hoverable(this.tabs)},_setupHeightStyle:function(e){var i,s=this.element.parent();"fill"===e?(i=s.height(),i-=this.element.outerHeight()-this.element.height(),this.element.siblings(":visible").each(function(){var e=t(this),s=e.css("position");"absolute"!==s&&"fixed"!==s&&(i-=e.outerHeight(!0))}),this.element.children().not(this.panels).each(function(){i-=t(this).outerHeight(!0)}),this.panels.each(function(){t(this).height(Math.max(0,i-t(this).innerHeight()+t(this).height()))}).css("overflow","auto")):"auto"===e&&(i=0,this.panels.each(function(){i=Math.max(i,t(this).height("").height())}).height(i))},_eventHandler:function(e){var i=this.options,s=this.active,n=t(e.currentTarget),a=n.closest("li"),o=a[0]===s[0],r=o&&i.collapsible,h=r?t():this._getPanelForTab(a),l=s.length?this._getPanelForTab(s):t(),u={oldTab:s,oldPanel:l,newTab:r?t():a,newPanel:h};e.preventDefault(),a.hasClass("ui-state-disabled")||a.hasClass("ui-tabs-loading")||this.running||o&&!i.collapsible||this._trigger("beforeActivate",e,u)===!1||(i.active=r?!1:this.tabs.index(a),this.active=o?t():a,this.xhr&&this.xhr.abort(),l.length||h.length||t.error("jQuery UI Tabs: Mismatching fragment identifier."),h.length&&this.load(this.tabs.index(a),e),this._toggle(e,u))},_toggle:function(e,i){function s(){a.running=!1,a._trigger("activate",e,i)}function n(){i.newTab.closest("li").addClass("ui-tabs-active ui-state-active"),o.length&&a.options.show?a._show(o,a.options.show,s):(o.show(),s())}var a=this,o=i.newPanel,r=i.oldPanel;this.running=!0,r.length&&this.options.hide?this._hide(r,this.options.hide,function(){i.oldTab.closest("li").removeClass("ui-tabs-active ui-state-active"),n()}):(i.oldTab.closest("li").removeClass("ui-tabs-active ui-state-active"),r.hide(),n()),r.attr({"aria-expanded":"false","aria-hidden":"true"}),i.oldTab.attr("aria-selected","false"),o.length&&r.length?i.oldTab.attr("tabIndex",-1):o.length&&this.tabs.filter(function(){return 0===t(this).attr("tabIndex")}).attr("tabIndex",-1),o.attr({"aria-expanded":"true","aria-hidden":"false"}),i.newTab.attr({"aria-selected":"true",tabIndex:0})},_activate:function(e){var i,s=this._findActive(e);s[0]!==this.active[0]&&(s.length||(s=this.active),i=s.find(".ui-tabs-anchor")[0],this._eventHandler({target:i,currentTarget:i,preventDefault:t.noop}))},_findActive:function(e){return e===!1?t():this.tabs.eq(e)},_getIndex:function(t){return"string"==typeof t&&(t=this.anchors.index(this.anchors.filter("[href$='"+t+"']"))),t},_destroy:function(){this.xhr&&this.xhr.abort(),this.element.removeClass("ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible"),this.tablist.removeClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all").removeAttr("role"),this.anchors.removeClass("ui-tabs-anchor").removeAttr("role").removeAttr("tabIndex").removeUniqueId(),this.tabs.add(this.panels).each(function(){t.data(this,"ui-tabs-destroy")?t(this).remove():t(this).removeClass("ui-state-default ui-state-active ui-state-disabled ui-corner-top ui-corner-bottom ui-widget-content ui-tabs-active ui-tabs-panel").removeAttr("tabIndex").removeAttr("aria-live").removeAttr("aria-busy").removeAttr("aria-selected").removeAttr("aria-labelledby").removeAttr("aria-hidden").removeAttr("aria-expanded").removeAttr("role")}),this.tabs.each(function(){var e=t(this),i=e.data("ui-tabs-aria-controls");i?e.attr("aria-controls",i).removeData("ui-tabs-aria-controls"):e.removeAttr("aria-controls")}),this.panels.show(),"content"!==this.options.heightStyle&&this.panels.css("height","")},enable:function(i){var s=this.options.disabled;s!==!1&&(i===e?s=!1:(i=this._getIndex(i),s=t.isArray(s)?t.map(s,function(t){return t!==i?t:null}):t.map(this.tabs,function(t,e){return e!==i?e:null})),this._setupDisabled(s))},disable:function(i){var s=this.options.disabled;if(s!==!0){if(i===e)s=!0;else{if(i=this._getIndex(i),-1!==t.inArray(i,s))return;s=t.isArray(s)?t.merge([i],s).sort():[i]}this._setupDisabled(s)}},load:function(e,i){e=this._getIndex(e);var n=this,a=this.tabs.eq(e),o=a.find(".ui-tabs-anchor"),r=this._getPanelForTab(a),h={tab:a,panel:r};s(o[0])||(this.xhr=t.ajax(this._ajaxSettings(o,i,h)),this.xhr&&"canceled"!==this.xhr.statusText&&(a.addClass("ui-tabs-loading"),r.attr("aria-busy","true"),this.xhr.success(function(t){setTimeout(function(){r.html(t),n._trigger("load",i,h)},1)}).complete(function(t,e){setTimeout(function(){"abort"===e&&n.panels.stop(!1,!0),a.removeClass("ui-tabs-loading"),r.removeAttr("aria-busy"),t===n.xhr&&delete n.xhr},1)})))},_ajaxSettings:function(e,i,s){var n=this;return{url:e.attr("href"),beforeSend:function(e,a){return n._trigger("beforeLoad",i,t.extend({jqXHR:e,ajaxSettings:a},s))}}},_getPanelForTab:function(e){var i=t(e).attr("aria-controls");return this.element.find(this._sanitizeSelector("#"+i))}})})(jQuery);
/**
 * @preserve
// Underscore.js 1.1.7
// (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
*/
(function(){var p=this,C=p._,m={},i=Array.prototype,n=Object.prototype,f=i.slice,D=i.unshift,E=n.toString,l=n.hasOwnProperty,s=i.forEach,t=i.map,u=i.reduce,v=i.reduceRight,w=i.filter,x=i.every,y=i.some,o=i.indexOf,z=i.lastIndexOf;n=Array.isArray;var F=Object.keys,q=Function.prototype.bind,b=function(a){return new j(a)};typeof module!=="undefined"&&module.exports?(module.exports=b,b._=b):p._=b;b.VERSION="1.1.7";var h=b.each=b.forEach=function(a,c,b){if(a!=null)if(s&&a.forEach===s)a.forEach(c,b);else if(a.length===
+a.length)for(var e=0,k=a.length;e<k;e++){if(e in a&&c.call(b,a[e],e,a)===m)break}else for(e in a)if(l.call(a,e)&&c.call(b,a[e],e,a)===m)break};b.map=function(a,c,b){var e=[];if(a==null)return e;if(t&&a.map===t)return a.map(c,b);h(a,function(a,g,G){e[e.length]=c.call(b,a,g,G)});return e};b.reduce=b.foldl=b.inject=function(a,c,d,e){var k=d!==void 0;a==null&&(a=[]);if(u&&a.reduce===u)return e&&(c=b.bind(c,e)),k?a.reduce(c,d):a.reduce(c);h(a,function(a,b,f){k?d=c.call(e,d,a,b,f):(d=a,k=!0)});if(!k)throw new TypeError("Reduce of empty array with no initial value");
return d};b.reduceRight=b.foldr=function(a,c,d,e){a==null&&(a=[]);if(v&&a.reduceRight===v)return e&&(c=b.bind(c,e)),d!==void 0?a.reduceRight(c,d):a.reduceRight(c);a=(b.isArray(a)?a.slice():b.toArray(a)).reverse();return b.reduce(a,c,d,e)};b.find=b.detect=function(a,c,b){var e;A(a,function(a,g,f){if(c.call(b,a,g,f))return e=a,!0});return e};b.filter=b.select=function(a,c,b){var e=[];if(a==null)return e;if(w&&a.filter===w)return a.filter(c,b);h(a,function(a,g,f){c.call(b,a,g,f)&&(e[e.length]=a)});return e};
b.reject=function(a,c,b){var e=[];if(a==null)return e;h(a,function(a,g,f){c.call(b,a,g,f)||(e[e.length]=a)});return e};b.every=b.all=function(a,c,b){var e=!0;if(a==null)return e;if(x&&a.every===x)return a.every(c,b);h(a,function(a,g,f){if(!(e=e&&c.call(b,a,g,f)))return m});return e};var A=b.some=b.any=function(a,c,d){c=c||b.identity;var e=!1;if(a==null)return e;if(y&&a.some===y)return a.some(c,d);h(a,function(a,b,f){if(e|=c.call(d,a,b,f))return m});return!!e};b.include=b.contains=function(a,c){var b=
!1;if(a==null)return b;if(o&&a.indexOf===o)return a.indexOf(c)!=-1;A(a,function(a){if(b=a===c)return!0});return b};b.invoke=function(a,c){var d=f.call(arguments,2);return b.map(a,function(a){return(c.call?c||a:a[c]).apply(a,d)})};b.pluck=function(a,c){return b.map(a,function(a){return a[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a))return Math.max.apply(Math,a);var e={computed:-Infinity};h(a,function(a,b,f){b=c?c.call(d,a,b,f):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,
c,d){if(!c&&b.isArray(a))return Math.min.apply(Math,a);var e={computed:Infinity};h(a,function(a,b,f){b=c?c.call(d,a,b,f):a;b<e.computed&&(e={value:a,computed:b})});return e.value};b.sortBy=function(a,c,d){return b.pluck(b.map(a,function(a,b,f){return{value:a,criteria:c.call(d,a,b,f)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c<d?-1:c>d?1:0}),"value")};b.groupBy=function(a,b){var d={};h(a,function(a,f){var g=b(a,f);(d[g]||(d[g]=[])).push(a)});return d};b.sortedIndex=function(a,c,d){d||
(d=b.identity);for(var e=0,f=a.length;e<f;){var g=e+f>>1;d(a[g])<d(c)?e=g+1:f=g}return e};b.toArray=function(a){if(!a)return[];if(a.toArray)return a.toArray();if(b.isArray(a))return f.call(a);if(b.isArguments(a))return f.call(a);return b.values(a)};b.size=function(a){return b.toArray(a).length};b.first=b.head=function(a,b,d){return b!=null&&!d?f.call(a,0,b):a[0]};b.rest=b.tail=function(a,b,d){return f.call(a,b==null||d?1:b)};b.last=function(a){return a[a.length-1]};b.compact=function(a){return b.filter(a,
function(a){return!!a})};b.flatten=function(a){return b.reduce(a,function(a,d){if(b.isArray(d))return a.concat(b.flatten(d));a[a.length]=d;return a},[])};b.without=function(a){return b.difference(a,f.call(arguments,1))};b.uniq=b.unique=function(a,c){return b.reduce(a,function(a,e,f){if(0==f||(c===!0?b.last(a)!=e:!b.include(a,e)))a[a.length]=e;return a},[])};b.union=function(){return b.uniq(b.flatten(arguments))};b.intersection=b.intersect=function(a){var c=f.call(arguments,1);return b.filter(b.uniq(a),
function(a){return b.every(c,function(c){return b.indexOf(c,a)>=0})})};b.difference=function(a,c){return b.filter(a,function(a){return!b.include(c,a)})};b.zip=function(){for(var a=f.call(arguments),c=b.max(b.pluck(a,"length")),d=Array(c),e=0;e<c;e++)d[e]=b.pluck(a,""+e);return d};b.indexOf=function(a,c,d){if(a==null)return-1;var e;if(d)return d=b.sortedIndex(a,c),a[d]===c?d:-1;if(o&&a.indexOf===o)return a.indexOf(c);d=0;for(e=a.length;d<e;d++)if(a[d]===c)return d;return-1};b.lastIndexOf=function(a,
b){if(a==null)return-1;if(z&&a.lastIndexOf===z)return a.lastIndexOf(b);for(var d=a.length;d--;)if(a[d]===b)return d;return-1};b.range=function(a,b,d){arguments.length<=1&&(b=a||0,a=0);d=arguments[2]||1;for(var e=Math.max(Math.ceil((b-a)/d),0),f=0,g=Array(e);f<e;)g[f++]=a,a+=d;return g};b.bind=function(a,b){if(a.bind===q&&q)return q.apply(a,f.call(arguments,1));var d=f.call(arguments,2);return function(){return a.apply(b,d.concat(f.call(arguments)))}};b.bindAll=function(a){var c=f.call(arguments,1);
c.length==0&&(c=b.functions(a));h(c,function(c){a[c]=b.bind(a[c],a)});return a};b.memoize=function(a,c){var d={};c||(c=b.identity);return function(){var b=c.apply(this,arguments);return l.call(d,b)?d[b]:d[b]=a.apply(this,arguments)}};b.delay=function(a,b){var d=f.call(arguments,2);return setTimeout(function(){return a.apply(a,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(f.call(arguments,1)))};var B=function(a,b,d){var e;return function(){var f=this,g=arguments,h=function(){e=null;
a.apply(f,g)};d&&clearTimeout(e);if(d||!e)e=setTimeout(h,b)}};b.throttle=function(a,b){return B(a,b,!1)};b.debounce=function(a,b){return B(a,b,!0)};b.once=function(a){var b=!1,d;return function(){if(b)return d;b=!0;return d=a.apply(this,arguments)}};b.wrap=function(a,b){return function(){var d=[a].concat(f.call(arguments));return b.apply(this,d)}};b.compose=function(){var a=f.call(arguments);return function(){for(var b=f.call(arguments),d=a.length-1;d>=0;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=
function(a,b){return function(){if(--a<1)return b.apply(this,arguments)}};b.keys=F||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var b=[],d;for(d in a)l.call(a,d)&&(b[b.length]=d);return b};b.values=function(a){return b.map(a,b.identity)};b.functions=b.methods=function(a){var c=[],d;for(d in a)b.isFunction(a[d])&&c.push(d);return c.sort()};b.extend=function(a){h(f.call(arguments,1),function(b){for(var d in b)b[d]!==void 0&&(a[d]=b[d])});return a};b.defaults=function(a){h(f.call(arguments,
1),function(b){for(var d in b)a[d]==null&&(a[d]=b[d])});return a};b.clone=function(a){return b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};b.isEqual=function(a,c){if(a===c)return!0;var d=typeof a;if(d!=typeof c)return!1;if(a==c)return!0;if(!a&&c||a&&!c)return!1;if(a._chain)a=a._wrapped;if(c._chain)c=c._wrapped;if(a.isEqual)return a.isEqual(c);if(c.isEqual)return c.isEqual(a);if(b.isDate(a)&&b.isDate(c))return a.getTime()===c.getTime();if(b.isNaN(a)&&b.isNaN(c))return!1;
if(b.isRegExp(a)&&b.isRegExp(c))return a.source===c.source&&a.global===c.global&&a.ignoreCase===c.ignoreCase&&a.multiline===c.multiline;if(d!=="object")return!1;if(a.length&&a.length!==c.length)return!1;d=b.keys(a);var e=b.keys(c);if(d.length!=e.length)return!1;for(var f in a)if(!(f in c)||!b.isEqual(a[f],c[f]))return!1;return!0};b.isEmpty=function(a){if(b.isArray(a)||b.isString(a))return a.length===0;for(var c in a)if(l.call(a,c))return!1;return!0};b.isElement=function(a){return!!(a&&a.nodeType==
1)};b.isArray=n||function(a){return E.call(a)==="[object Array]"};b.isObject=function(a){return a===Object(a)};b.isArguments=function(a){return!(!a||!l.call(a,"callee"))};b.isFunction=function(a){return!(!a||!a.constructor||!a.call||!a.apply)};b.isString=function(a){return!!(a===""||a&&a.charCodeAt&&a.substr)};b.isNumber=function(a){return!!(a===0||a&&a.toExponential&&a.toFixed)};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return a===!0||a===!1};b.isDate=function(a){return!(!a||!a.getTimezoneOffset||
!a.setUTCFullYear)};b.isRegExp=function(a){return!(!a||!a.test||!a.exec||!(a.ignoreCase||a.ignoreCase===!1))};b.isNull=function(a){return a===null};b.isUndefined=function(a){return a===void 0};b.noConflict=function(){p._=C;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var e=0;e<a;e++)b.call(d,e)};b.mixin=function(a){h(b.functions(a),function(c){H(c,b[c]=a[c])})};var I=0;b.uniqueId=function(a){var b=I++;return a?a+b:b};b.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g};
b.template=function(a,c){var d=b.templateSettings;d="var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('"+a.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(d.interpolate,function(a,b){return"',"+b.replace(/\\'/g,"'")+",'"}).replace(d.evaluate||null,function(a,b){return"');"+b.replace(/\\'/g,"'").replace(/[\r\n\t]/g," ")+"__p.push('"}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');}return __p.join('');";d=new Function("obj",d);return c?d(c):d};
var j=function(a){this._wrapped=a};b.prototype=j.prototype;var r=function(a,c){return c?b(a).chain():a},H=function(a,c){j.prototype[a]=function(){var a=f.call(arguments);D.call(a,this._wrapped);return r(c.apply(b,a),this._chain)}};b.mixin(b);h(["pop","push","reverse","shift","sort","splice","unshift"],function(a){var b=i[a];j.prototype[a]=function(){b.apply(this._wrapped,arguments);return r(this._wrapped,this._chain)}});h(["concat","join","slice"],function(a){var b=i[a];j.prototype[a]=function(){return r(b.apply(this._wrapped,
arguments),this._chain)}});j.prototype.chain=function(){this._chain=!0;return this};j.prototype.value=function(){return this._wrapped}})();

/**
 * @preserve
 // Backbone.js 0.5.3
// (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
// Backbone may be freely distributed under the MIT license.
// For all details and documentation:
// http://documentcloud.github.com/backbone
*/
(function(){var h=this,p=h.Backbone,e;e=typeof exports!=="undefined"?exports:h.Backbone={};e.VERSION="0.5.3";var f=h._;if(!f&&typeof require!=="undefined")f=require("underscore")._;var g=h.jQuery||h.Zepto;e.noConflict=function(){h.Backbone=p;return this};e.emulateHTTP=!1;e.emulateJSON=!1;e.Events={bind:function(a,b,c){var d=this._callbacks||(this._callbacks={});(d[a]||(d[a]=[])).push([b,c]);return this},unbind:function(a,b){var c;if(a){if(c=this._callbacks)if(b){c=c[a];if(!c)return this;for(var d=
0,e=c.length;d<e;d++)if(c[d]&&b===c[d][0]){c[d]=null;break}}else c[a]=[]}else this._callbacks={};return this},trigger:function(a){var b,c,d,e,f=2;if(!(c=this._callbacks))return this;for(;f--;)if(b=f?a:"all",b=c[b])for(var g=0,h=b.length;g<h;g++)(d=b[g])?(e=f?Array.prototype.slice.call(arguments,1):arguments,d[0].apply(d[1]||this,e)):(b.splice(g,1),g--,h--);return this}};e.Model=function(a,b){var c;a||(a={});if(c=this.defaults)f.isFunction(c)&&(c=c.call(this)),a=f.extend({},c,a);this.attributes={};
this._escapedAttributes={};this.cid=f.uniqueId("c");this.set(a,{silent:!0});this._changed=!1;this._previousAttributes=f.clone(this.attributes);if(b&&b.collection)this.collection=b.collection;this.initialize(a,b)};f.extend(e.Model.prototype,e.Events,{_previousAttributes:null,_changed:!1,idAttribute:"id",initialize:function(){},toJSON:function(){return f.clone(this.attributes)},get:function(a){return this.attributes[a]},escape:function(a){var b;if(b=this._escapedAttributes[a])return b;b=this.attributes[a];
return this._escapedAttributes[a]=(b==null?"":""+b).replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")},has:function(a){return this.attributes[a]!=null},set:function(a,b){b||(b={});if(!a)return this;if(a.attributes)a=a.attributes;var c=this.attributes,d=this._escapedAttributes;if(!b.silent&&this.validate&&!this._performValidation(a,b))return!1;if(this.idAttribute in a)this.id=a[this.idAttribute];
var e=this._changing;this._changing=!0;for(var g in a){var h=a[g];if(!f.isEqual(c[g],h))c[g]=h,delete d[g],this._changed=!0,b.silent||this.trigger("change:"+g,this,h,b)}!e&&!b.silent&&this._changed&&this.change(b);this._changing=!1;return this},unset:function(a,b){if(!(a in this.attributes))return this;b||(b={});var c={};c[a]=void 0;if(!b.silent&&this.validate&&!this._performValidation(c,b))return!1;delete this.attributes[a];delete this._escapedAttributes[a];a==this.idAttribute&&delete this.id;this._changed=
!0;b.silent||(this.trigger("change:"+a,this,void 0,b),this.change(b));return this},clear:function(a){a||(a={});var b,c=this.attributes,d={};for(b in c)d[b]=void 0;if(!a.silent&&this.validate&&!this._performValidation(d,a))return!1;this.attributes={};this._escapedAttributes={};this._changed=!0;if(!a.silent){for(b in c)this.trigger("change:"+b,this,void 0,a);this.change(a)}return this},fetch:function(a){a||(a={});var b=this,c=a.success;a.success=function(d,e,f){if(!b.set(b.parse(d,f),a))return!1;c&&
c(b,d)};a.error=i(a.error,b,a);return(this.sync||e.sync).call(this,"read",this,a)},save:function(a,b){b||(b={});if(a&&!this.set(a,b))return!1;var c=this,d=b.success;b.success=function(a,e,f){if(!c.set(c.parse(a,f),b))return!1;d&&d(c,a,f)};b.error=i(b.error,c,b);var f=this.isNew()?"create":"update";return(this.sync||e.sync).call(this,f,this,b)},destroy:function(a){a||(a={});if(this.isNew())return this.trigger("destroy",this,this.collection,a);var b=this,c=a.success;a.success=function(d){b.trigger("destroy",
b,b.collection,a);c&&c(b,d)};a.error=i(a.error,b,a);return(this.sync||e.sync).call(this,"delete",this,a)},url:function(){var a=k(this.collection)||this.urlRoot||l();if(this.isNew())return a;return a+(a.charAt(a.length-1)=="/"?"":"/")+encodeURIComponent(this.id)},parse:function(a){return a},clone:function(){return new this.constructor(this)},isNew:function(){return this.id==null},change:function(a){this.trigger("change",this,a);this._previousAttributes=f.clone(this.attributes);this._changed=!1},hasChanged:function(a){if(a)return this._previousAttributes[a]!=
this.attributes[a];return this._changed},changedAttributes:function(a){a||(a=this.attributes);var b=this._previousAttributes,c=!1,d;for(d in a)f.isEqual(b[d],a[d])||(c=c||{},c[d]=a[d]);return c},previous:function(a){if(!a||!this._previousAttributes)return null;return this._previousAttributes[a]},previousAttributes:function(){return f.clone(this._previousAttributes)},_performValidation:function(a,b){var c=this.validate(a);if(c)return b.error?b.error(this,c,b):this.trigger("error",this,c,b),!1;return!0}});
e.Collection=function(a,b){b||(b={});if(b.comparator)this.comparator=b.comparator;f.bindAll(this,"_onModelEvent","_removeReference");this._reset();a&&this.reset(a,{silent:!0});this.initialize.apply(this,arguments)};f.extend(e.Collection.prototype,e.Events,{model:e.Model,initialize:function(){},toJSON:function(){return this.map(function(a){return a.toJSON()})},add:function(a,b){if(f.isArray(a))for(var c=0,d=a.length;c<d;c++)this._add(a[c],b);else this._add(a,b);return this},remove:function(a,b){if(f.isArray(a))for(var c=
0,d=a.length;c<d;c++)this._remove(a[c],b);else this._remove(a,b);return this},get:function(a){if(a==null)return null;return this._byId[a.id!=null?a.id:a]},getByCid:function(a){return a&&this._byCid[a.cid||a]},at:function(a){return this.models[a]},sort:function(a){a||(a={});if(!this.comparator)throw Error("Cannot sort a set without a comparator");this.models=this.sortBy(this.comparator);a.silent||this.trigger("reset",this,a);return this},pluck:function(a){return f.map(this.models,function(b){return b.get(a)})},
reset:function(a,b){a||(a=[]);b||(b={});this.each(this._removeReference);this._reset();this.add(a,{silent:!0});b.silent||this.trigger("reset",this,b);return this},fetch:function(a){a||(a={});var b=this,c=a.success;a.success=function(d,f,e){b[a.add?"add":"reset"](b.parse(d,e),a);c&&c(b,d)};a.error=i(a.error,b,a);return(this.sync||e.sync).call(this,"read",this,a)},create:function(a,b){var c=this;b||(b={});a=this._prepareModel(a,b);if(!a)return!1;var d=b.success;b.success=function(a,e,f){c.add(a,b);
d&&d(a,e,f)};a.save(null,b);return a},parse:function(a){return a},chain:function(){return f(this.models).chain()},_reset:function(){this.length=0;this.models=[];this._byId={};this._byCid={}},_prepareModel:function(a,b){if(a instanceof e.Model){if(!a.collection)a.collection=this}else{var c=a;a=new this.model(c,{collection:this});a.validate&&!a._performValidation(c,b)&&(a=!1)}return a},_add:function(a,b){b||(b={});a=this._prepareModel(a,b);if(!a)return!1;var c=this.getByCid(a);if(c)throw Error(["Can't add the same model to a set twice",
c.id]);this._byId[a.id]=a;this._byCid[a.cid]=a;this.models.splice(b.at!=null?b.at:this.comparator?this.sortedIndex(a,this.comparator):this.length,0,a);a.bind("all",this._onModelEvent);this.length++;b.silent||a.trigger("add",a,this,b);return a},_remove:function(a,b){b||(b={});a=this.getByCid(a)||this.get(a);if(!a)return null;delete this._byId[a.id];delete this._byCid[a.cid];this.models.splice(this.indexOf(a),1);this.length--;b.silent||a.trigger("remove",a,this,b);this._removeReference(a);return a},
_removeReference:function(a){this==a.collection&&delete a.collection;a.unbind("all",this._onModelEvent)},_onModelEvent:function(a,b,c,d){(a=="add"||a=="remove")&&c!=this||(a=="destroy"&&this._remove(b,d),b&&a==="change:"+b.idAttribute&&(delete this._byId[b.previous(b.idAttribute)],this._byId[b.id]=b),this.trigger.apply(this,arguments))}});f.each(["forEach","each","map","reduce","reduceRight","find","detect","filter","select","reject","every","all","some","any","include","contains","invoke","max",
"min","sortBy","sortedIndex","toArray","size","first","rest","last","without","indexOf","lastIndexOf","isEmpty","groupBy"],function(a){e.Collection.prototype[a]=function(){return f[a].apply(f,[this.models].concat(f.toArray(arguments)))}});e.Router=function(a){a||(a={});if(a.routes)this.routes=a.routes;this._bindRoutes();this.initialize.apply(this,arguments)};var q=/:([\w\d]+)/g,r=/\*([\w\d]+)/g,s=/[-[\]{}()+?.,\\^$|#\s]/g;f.extend(e.Router.prototype,e.Events,{initialize:function(){},route:function(a,
b,c){e.history||(e.history=new e.History);f.isRegExp(a)||(a=this._routeToRegExp(a));e.history.route(a,f.bind(function(d){d=this._extractParameters(a,d);c.apply(this,d);this.trigger.apply(this,["route:"+b].concat(d))},this))},navigate:function(a,b){e.history.navigate(a,b)},_bindRoutes:function(){if(this.routes){var a=[],b;for(b in this.routes)a.unshift([b,this.routes[b]]);b=0;for(var c=a.length;b<c;b++)this.route(a[b][0],a[b][1],this[a[b][1]])}},_routeToRegExp:function(a){a=a.replace(s,"\\$&").replace(q,
"([^/]*)").replace(r,"(.*?)");return RegExp("^"+a+"$")},_extractParameters:function(a,b){return a.exec(b).slice(1)}});e.History=function(){this.handlers=[];f.bindAll(this,"checkUrl")};var j=/^#*/,t=/msie [\w.]+/,m=!1;f.extend(e.History.prototype,{interval:50,getFragment:function(a,b){if(a==null)if(this._hasPushState||b){a=window.location.pathname;var c=window.location.search;c&&(a+=c);a.indexOf(this.options.root)==0&&(a=a.substr(this.options.root.length))}else a=window.location.hash;return decodeURIComponent(a.replace(j,
""))},start:function(a){if(m)throw Error("Backbone.history has already been started");this.options=f.extend({},{root:"/"},this.options,a);this._wantsPushState=!!this.options.pushState;this._hasPushState=!(!this.options.pushState||!window.history||!window.history.pushState);a=this.getFragment();var b=document.documentMode;if(b=t.exec(navigator.userAgent.toLowerCase())&&(!b||b<=7))this.iframe=g('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow,this.navigate(a);
this._hasPushState?g(window).bind("popstate",this.checkUrl):"onhashchange"in window&&!b?g(window).bind("hashchange",this.checkUrl):setInterval(this.checkUrl,this.interval);this.fragment=a;m=!0;a=window.location;b=a.pathname==this.options.root;if(this._wantsPushState&&!this._hasPushState&&!b)return this.fragment=this.getFragment(null,!0),window.location.replace(this.options.root+"#"+this.fragment),!0;else if(this._wantsPushState&&this._hasPushState&&b&&a.hash)this.fragment=a.hash.replace(j,""),window.history.replaceState({},
document.title,a.protocol+"//"+a.host+this.options.root+this.fragment);if(!this.options.silent)return this.loadUrl()},route:function(a,b){this.handlers.unshift({route:a,callback:b})},checkUrl:function(){var a=this.getFragment();a==this.fragment&&this.iframe&&(a=this.getFragment(this.iframe.location.hash));if(a==this.fragment||a==decodeURIComponent(this.fragment))return!1;this.iframe&&this.navigate(a);this.loadUrl()||this.loadUrl(window.location.hash)},loadUrl:function(a){var b=this.fragment=this.getFragment(a);
return f.any(this.handlers,function(a){if(a.route.test(b))return a.callback(b),!0})},navigate:function(a,b){var c=(a||"").replace(j,"");if(!(this.fragment==c||this.fragment==decodeURIComponent(c))){if(this._hasPushState){var d=window.location;c.indexOf(this.options.root)!=0&&(c=this.options.root+c);this.fragment=c;window.history.pushState({},document.title,d.protocol+"//"+d.host+c)}else if(window.location.hash=this.fragment=c,this.iframe&&c!=this.getFragment(this.iframe.location.hash))this.iframe.document.open().close(),
this.iframe.location.hash=c;b&&this.loadUrl(a)}}});e.View=function(a){this.cid=f.uniqueId("view");this._configure(a||{});this._ensureElement();this.delegateEvents();this.initialize.apply(this,arguments)};var u=/^(\S+)\s*(.*)$/,n=["model","collection","el","id","attributes","className","tagName"];f.extend(e.View.prototype,e.Events,{tagName:"div",$:function(a){return g(a,this.el)},initialize:function(){},render:function(){return this},remove:function(){g(this.el).remove();return this},make:function(a,
b,c){a=document.createElement(a);b&&g(a).attr(b);c&&g(a).html(c);return a},delegateEvents:function(a){if(a||(a=this.events))for(var b in f.isFunction(a)&&(a=a.call(this)),g(this.el).unbind(".delegateEvents"+this.cid),a){var c=this[a[b]];if(!c)throw Error('Event "'+a[b]+'" does not exist');var d=b.match(u),e=d[1];d=d[2];c=f.bind(c,this);e+=".delegateEvents"+this.cid;d===""?g(this.el).bind(e,c):g(this.el).delegate(d,e,c)}},_configure:function(a){this.options&&(a=f.extend({},this.options,a));for(var b=
0,c=n.length;b<c;b++){var d=n[b];a[d]&&(this[d]=a[d])}this.options=a},_ensureElement:function(){if(this.el){if(f.isString(this.el))this.el=g(this.el).get(0)}else{var a=this.attributes||{};if(this.id)a.id=this.id;if(this.className)a["class"]=this.className;this.el=this.make(this.tagName,a)}}});e.Model.extend=e.Collection.extend=e.Router.extend=e.View.extend=function(a,b){var c=v(this,a,b);c.extend=this.extend;return c};var w={create:"POST",update:"PUT","delete":"DELETE",read:"GET"};e.sync=function(a,
b,c){var d=w[a];c=f.extend({type:d,dataType:"json"},c);if(!c.url)c.url=k(b)||l();if(!c.data&&b&&(a=="create"||a=="update"))c.contentType="application/json",c.data=JSON.stringify(b.toJSON());if(e.emulateJSON)c.contentType="application/x-www-form-urlencoded",c.data=c.data?{model:c.data}:{};if(e.emulateHTTP&&(d==="PUT"||d==="DELETE")){if(e.emulateJSON)c.data._method=d;c.type="POST";c.beforeSend=function(a){a.setRequestHeader("X-HTTP-Method-Override",d)}}if(c.type!=="GET"&&!e.emulateJSON)c.processData=
!1;return g.ajax(c)};var o=function(){},v=function(a,b,c){var d;d=b&&b.hasOwnProperty("constructor")?b.constructor:function(){return a.apply(this,arguments)};f.extend(d,a);o.prototype=a.prototype;d.prototype=new o;b&&f.extend(d.prototype,b);c&&f.extend(d,c);d.prototype.constructor=d;d.__super__=a.prototype;return d},k=function(a){if(!a||!a.url)return null;return f.isFunction(a.url)?a.url():a.url},l=function(){throw Error('A "url" property or function must be specified');},i=function(a,b,c){return function(d){a?
a(b,d,c):b.trigger("error",b,d,c)}}}).call(this);

/**
 * @preserve
 * jQuery Templates Plugin 1.0.0pre
 * http://github.com/jquery/jquery-tmpl
 * Requires jQuery 1.4.2
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */
(function( jQuery, undefined ){
	var oldManip = jQuery.fn.domManip, tmplItmAtt = "_tmplitem", htmlExpr = /^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,
		newTmplItems = {}, wrappedItems = {}, appendToTmplItems, topTmplItem = { key: 0, data: {} }, itemKey = 0, cloneIndex = 0, stack = [];

	function newTmplItem( options, parentItem, fn, data ) {
		// Returns a template item data structure for a new rendered instance of a template (a 'template item').
		// The content field is a hierarchical array of strings and nested items (to be
		// removed and replaced by nodes field of dom elements, once inserted in DOM).
		var newItem = {
			data: data || (data === 0 || data === false) ? data : (parentItem ? parentItem.data : {}),
			_wrap: parentItem ? parentItem._wrap : null,
			tmpl: null,
			parent: parentItem || null,
			nodes: [],
			calls: tiCalls,
			nest: tiNest,
			wrap: tiWrap,
			html: tiHtml,
			update: tiUpdate
		};
		if ( options ) {
			jQuery.extend( newItem, options, { nodes: [], parent: parentItem });
		}
		if ( fn ) {
			// Build the hierarchical content to be used during insertion into DOM
			newItem.tmpl = fn;
			newItem._ctnt = newItem._ctnt || newItem.tmpl( jQuery, newItem );
			newItem.key = ++itemKey;
			// Keep track of new template item, until it is stored as jQuery Data on DOM element
			(stack.length ? wrappedItems : newTmplItems)[itemKey] = newItem;
		}
		return newItem;
	}

	// Override appendTo etc., in order to provide support for targeting multiple elements. (This code would disappear if integrated in jquery core).
	jQuery.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var ret = [], insert = jQuery( selector ), elems, i, l, tmplItems,
				parent = this.length === 1 && this[0].parentNode;

			appendToTmplItems = newTmplItems || {};
			if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
				insert[ original ]( this[0] );
				ret = this;
			} else {
				for ( i = 0, l = insert.length; i < l; i++ ) {
					cloneIndex = i;
					elems = (i > 0 ? this.clone(true) : this).get();
					jQuery( insert[i] )[ original ]( elems );
					ret = ret.concat( elems );
				}
				cloneIndex = 0;
				ret = this.pushStack( ret, name, insert.selector );
			}
			tmplItems = appendToTmplItems;
			appendToTmplItems = null;
			jQuery.tmpl.complete( tmplItems );
			return ret;
		};
	});

	jQuery.fn.extend({
		// Use first wrapped element as template markup.
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( data, options, parentItem ) {
			return jQuery.tmpl( this[0], data, options, parentItem );
		},

		// Find which rendered template item the first wrapped DOM element belongs to
		tmplItem: function() {
			return jQuery.tmplItem( this[0] );
		},

		// Consider the first wrapped element as a template declaration, and get the compiled template or store it as a named template.
		template: function( name ) {
			return jQuery.template( name, this[0] );
		},

		domManip: function( args, table, callback, options ) {
			if ( args[0] && jQuery.isArray( args[0] )) {
				var dmArgs = jQuery.makeArray( arguments ), elems = args[0], elemsLength = elems.length, i = 0, tmplItem;
				while ( i < elemsLength && !(tmplItem = jQuery.data( elems[i++], "tmplItem" ))) {}
				if ( tmplItem && cloneIndex ) {
					dmArgs[2] = function( fragClone ) {
						// Handler called by oldManip when rendered template has been inserted into DOM.
						jQuery.tmpl.afterManip( this, fragClone, callback );
					};
				}
				oldManip.apply( this, dmArgs );
			} else {
				oldManip.apply( this, arguments );
			}
			cloneIndex = 0;
			if ( !appendToTmplItems ) {
				jQuery.tmpl.complete( newTmplItems );
			}
			return this;
		}
	});

	jQuery.extend({
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( tmpl, data, options, parentItem ) {
			var ret, topLevel = !parentItem;
			if ( topLevel ) {
				// This is a top-level tmpl call (not from a nested template using {{tmpl}})
				parentItem = topTmplItem;
				tmpl = jQuery.template[tmpl] || jQuery.template( null, tmpl );
				wrappedItems = {}; // Any wrapped items will be rebuilt, since this is top level
			} else if ( !tmpl ) {
				// The template item is already associated with DOM - this is a refresh.
				// Re-evaluate rendered template for the parentItem
				tmpl = parentItem.tmpl;
				newTmplItems[parentItem.key] = parentItem;
				parentItem.nodes = [];
				if ( parentItem.wrapped ) {
					updateWrapped( parentItem, parentItem.wrapped );
				}
				// Rebuild, without creating a new template item
				return jQuery( build( parentItem, null, parentItem.tmpl( jQuery, parentItem ) ));
			}
			if ( !tmpl ) {
				return []; // Could throw...
			}
			if ( typeof data === "function" ) {
				data = data.call( parentItem || {} );
			}
			if ( options && options.wrapped ) {
				updateWrapped( options, options.wrapped );
			}
			ret = jQuery.isArray( data ) ? 
				jQuery.map( data, function( dataItem ) {
					return dataItem ? newTmplItem( options, parentItem, tmpl, dataItem ) : null;
				}) :
				[ newTmplItem( options, parentItem, tmpl, data ) ];
			return topLevel ? jQuery( build( parentItem, null, ret ) ) : ret;
		},

		// Return rendered template item for an element.
		tmplItem: function( elem ) {
			var tmplItem;
			if ( elem instanceof jQuery ) {
				elem = elem[0];
			}
			while ( elem && elem.nodeType === 1 && !(tmplItem = jQuery.data( elem, "tmplItem" )) && (elem = elem.parentNode) ) {}
			return tmplItem || topTmplItem;
		},

		// Set:
		// Use $.template( name, tmpl ) to cache a named template,
		// where tmpl is a template string, a script element or a jQuery instance wrapping a script element, etc.
		// Use $( "selector" ).template( name ) to provide access by name to a script block template declaration.

		// Get:
		// Use $.template( name ) to access a cached template.
		// Also $( selectorToScriptBlock ).template(), or $.template( null, templateString )
		// will return the compiled template, without adding a name reference.
		// If templateString includes at least one HTML tag, $.template( templateString ) is equivalent
		// to $.template( null, templateString )
		template: function( name, tmpl ) {
			if (tmpl) {
				// Compile template and associate with name
				if ( typeof tmpl === "string" ) {
					// This is an HTML string being passed directly in.
					tmpl = buildTmplFn( tmpl )
				} else if ( tmpl instanceof jQuery ) {
					tmpl = tmpl[0] || {};
				}
				if ( tmpl.nodeType ) {
					// If this is a template block, use cached copy, or generate tmpl function and cache.
					tmpl = jQuery.data( tmpl, "tmpl" ) || jQuery.data( tmpl, "tmpl", buildTmplFn( tmpl.innerHTML )); 
					// Issue: In IE, if the container element is not a script block, the innerHTML will remove quotes from attribute values whenever the value does not include white space. 
					// This means that foo="${x}" will not work if the value of x includes white space: foo="${x}" -> foo=value of x. 
					// To correct this, include space in tag: foo="${ x }" -> foo="value of x"
				}
				return typeof name === "string" ? (jQuery.template[name] = tmpl) : tmpl;
			}
			// Return named compiled template
			return name ? (typeof name !== "string" ? jQuery.template( null, name ): 
				(jQuery.template[name] || 
					// If not in map, treat as a selector. (If integrated with core, use quickExpr.exec) 
					jQuery.template( null, htmlExpr.test( name ) ? name : jQuery( name )))) : null; 
		},

		encode: function( text ) {
			// Do HTML encoding replacing < > & and ' and " by corresponding entities.
			return ("" + text).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;");
		}
	});

	jQuery.extend( jQuery.tmpl, {
		tag: {
			"tmpl": {
				_default: { $2: "null" },
				open: "if($notnull_1){__=__.concat($item.nest($1,$2));}"
				// tmpl target parameter can be of type function, so use $1, not $1a (so not auto detection of functions)
				// This means that {{tmpl foo}} treats foo as a template (which IS a function). 
				// Explicit parens can be used if foo is a function that returns a template: {{tmpl foo()}}.
			},
			"wrap": {
				_default: { $2: "null" },
				open: "$item.calls(__,$1,$2);__=[];",
				close: "call=$item.calls();__=call._.concat($item.wrap(call,__));"
			},
			"each": {
				_default: { $2: "$index, $value" },
				open: "if($notnull_1){$.each($1a,function($2){with(this){",
				close: "}});}"
			},
			"if": {
				open: "if(($notnull_1) && $1a){",
				close: "}"
			},
			"else": {
				_default: { $1: "true" },
				open: "}else if(($notnull_1) && $1a){"
			},
			"html": {
				// Unecoded expression evaluation. 
				open: "if($notnull_1){__.push($1a);}"
			},
			"=": {
				// Encoded expression evaluation. Abbreviated form is ${}.
				_default: { $1: "$data" },
				open: "if($notnull_1){__.push($.encode($1a));}"
			},
			"!": {
				// Comment tag. Skipped by parser
				open: ""
			}
		},

		// This stub can be overridden, e.g. in jquery.tmplPlus for providing rendered events
		complete: function( items ) {
			newTmplItems = {};
		},

		// Call this from code which overrides domManip, or equivalent
		// Manage cloning/storing template items etc.
		afterManip: function afterManip( elem, fragClone, callback ) {
			// Provides cloned fragment ready for fixup prior to and after insertion into DOM
			var content = fragClone.nodeType === 11 ?
				jQuery.makeArray(fragClone.childNodes) :
				fragClone.nodeType === 1 ? [fragClone] : [];

			// Return fragment to original caller (e.g. append) for DOM insertion
			callback.call( elem, fragClone );

			// Fragment has been inserted:- Add inserted nodes to tmplItem data structure. Replace inserted element annotations by jQuery.data.
			storeTmplItems( content );
			cloneIndex++;
		}
	});

	//========================== Private helper functions, used by code above ==========================

	function build( tmplItem, nested, content ) {
		// Convert hierarchical content into flat string array 
		// and finally return array of fragments ready for DOM insertion
		var frag, ret = content ? jQuery.map( content, function( item ) {
			return (typeof item === "string") ? 
				// Insert template item annotations, to be converted to jQuery.data( "tmplItem" ) when elems are inserted into DOM.
				(tmplItem.key ? item.replace( /(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g, "$1 " + tmplItmAtt + "=\"" + tmplItem.key + "\" $2" ) : item) :
				// This is a child template item. Build nested template.
				build( item, tmplItem, item._ctnt );
		}) : 
		// If content is not defined, insert tmplItem directly. Not a template item. May be a string, or a string array, e.g. from {{html $item.html()}}. 
		tmplItem;
		if ( nested ) {
			return ret;
		}

		// top-level template
		ret = ret.join("");

		// Support templates which have initial or final text nodes, or consist only of text
		// Also support HTML entities within the HTML markup.
		ret.replace( /^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/, function( all, before, middle, after) {
			frag = jQuery( middle ).get();

			storeTmplItems( frag );
			if ( before ) {
				frag = unencode( before ).concat(frag);
			}
			if ( after ) {
				frag = frag.concat(unencode( after ));
			}
		});
		return frag ? frag : unencode( ret );
	}

	function unencode( text ) {
		// Use createElement, since createTextNode will not render HTML entities correctly
		var el = document.createElement( "div" );
		el.innerHTML = text;
		return jQuery.makeArray(el.childNodes);
	}

	// Generate a reusable function that will serve to render a template against data
	function buildTmplFn( markup ) {
		return new Function("jQuery","$item",
			// Use the variable __ to hold a string array while building the compiled template. (See https://github.com/jquery/jquery-tmpl/issues#issue/10).
			"var $=jQuery,call,__=[],$data=$item.data;" +

			// Introduce the data as local variables using with(){}
			"with($data){__.push('" +

			// Convert the template into pure JavaScript
			jQuery.trim(markup)
				.replace( /([\\'])/g, "\\$1" )
				.replace( /[\r\t\n]/g, " " )
				.replace( /\$\{([^\}]*)\}/g, "{{= $1}}" )
				.replace( /\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,
				function( all, slash, type, fnargs, target, parens, args ) {
					var tag = jQuery.tmpl.tag[ type ], def, expr, exprAutoFnDetect;
					if ( !tag ) {
						throw "Unknown template tag: " + type;
					}
					def = tag._default || [];
					if ( parens && !/\w$/.test(target)) {
						target += parens;
						parens = "";
					}
					if ( target ) {
						target = unescape( target ); 
						args = args ? ("," + unescape( args ) + ")") : (parens ? ")" : "");
						// Support for target being things like a.toLowerCase();
						// In that case don't call with template item as 'this' pointer. Just evaluate...
						expr = parens ? (target.indexOf(".") > -1 ? target + unescape( parens ) : ("(" + target + ").call($item" + args)) : target;
						exprAutoFnDetect = parens ? expr : "(typeof(" + target + ")==='function'?(" + target + ").call($item):(" + target + "))";
					} else {
						exprAutoFnDetect = expr = def.$1 || "null";
					}
					fnargs = unescape( fnargs );
					return "');" + 
						tag[ slash ? "close" : "open" ]
							.split( "$notnull_1" ).join( target ? "typeof(" + target + ")!=='undefined' && (" + target + ")!=null" : "true" )
							.split( "$1a" ).join( exprAutoFnDetect )
							.split( "$1" ).join( expr )
							.split( "$2" ).join( fnargs || def.$2 || "" ) +
						"__.push('";
				}) +
			"');}return __;"
		);
	}
	function updateWrapped( options, wrapped ) {
		// Build the wrapped content. 
		options._wrap = build( options, true, 
			// Suport imperative scenario in which options.wrapped can be set to a selector or an HTML string.
			jQuery.isArray( wrapped ) ? wrapped : [htmlExpr.test( wrapped ) ? wrapped : jQuery( wrapped ).html()]
		).join("");
	}

	function unescape( args ) {
		return args ? args.replace( /\\'/g, "'").replace(/\\\\/g, "\\" ) : null;
	}
	function outerHtml( elem ) {
		var div = document.createElement("div");
		div.appendChild( elem.cloneNode(true) );
		return div.innerHTML;
	}

	// Store template items in jQuery.data(), ensuring a unique tmplItem data data structure for each rendered template instance.
	function storeTmplItems( content ) {
		var keySuffix = "_" + cloneIndex, elem, elems, newClonedItems = {}, i, l, m;
		for ( i = 0, l = content.length; i < l; i++ ) {
			if ( (elem = content[i]).nodeType !== 1 ) {
				continue;
			}
			elems = elem.getElementsByTagName("*");
			for ( m = elems.length - 1; m >= 0; m-- ) {
				processItemKey( elems[m] );
			}
			processItemKey( elem );
		}
		function processItemKey( el ) {
			var pntKey, pntNode = el, pntItem, tmplItem, key;
			// Ensure that each rendered template inserted into the DOM has its own template item,
			if ( (key = el.getAttribute( tmplItmAtt ))) {
				while ( pntNode.parentNode && (pntNode = pntNode.parentNode).nodeType === 1 && !(pntKey = pntNode.getAttribute( tmplItmAtt ))) { }
				if ( pntKey !== key ) {
					// The next ancestor with a _tmplitem expando is on a different key than this one.
					// So this is a top-level element within this template item
					// Set pntNode to the key of the parentNode, or to 0 if pntNode.parentNode is null, or pntNode is a fragment.
					pntNode = pntNode.parentNode ? (pntNode.nodeType === 11 ? 0 : (pntNode.getAttribute( tmplItmAtt ) || 0)) : 0;
					if ( !(tmplItem = newTmplItems[key]) ) {
						// The item is for wrapped content, and was copied from the temporary parent wrappedItem.
						tmplItem = wrappedItems[key];
						tmplItem = newTmplItem( tmplItem, newTmplItems[pntNode]||wrappedItems[pntNode] );
						tmplItem.key = ++itemKey;
						newTmplItems[itemKey] = tmplItem;
					}
					if ( cloneIndex ) {
						cloneTmplItem( key );
					}
				}
				el.removeAttribute( tmplItmAtt );
			} else if ( cloneIndex && (tmplItem = jQuery.data( el, "tmplItem" )) ) {
				// This was a rendered element, cloned during append or appendTo etc.
				// TmplItem stored in jQuery data has already been cloned in cloneCopyEvent. We must replace it with a fresh cloned tmplItem.
				cloneTmplItem( tmplItem.key );
				newTmplItems[tmplItem.key] = tmplItem;
				pntNode = jQuery.data( el.parentNode, "tmplItem" );
				pntNode = pntNode ? pntNode.key : 0;
			}
			if ( tmplItem ) {
				pntItem = tmplItem;
				// Find the template item of the parent element. 
				// (Using !=, not !==, since pntItem.key is number, and pntNode may be a string)
				while ( pntItem && pntItem.key != pntNode ) { 
					// Add this element as a top-level node for this rendered template item, as well as for any
					// ancestor items between this item and the item of its parent element
					pntItem.nodes.push( el );
					pntItem = pntItem.parent;
				}
				// Delete content built during rendering - reduce API surface area and memory use, and avoid exposing of stale data after rendering...
				delete tmplItem._ctnt;
				delete tmplItem._wrap;
				// Store template item as jQuery data on the element
				jQuery.data( el, "tmplItem", tmplItem );
			}
			function cloneTmplItem( key ) {
				key = key + keySuffix;
				tmplItem = newClonedItems[key] = 
					(newClonedItems[key] || newTmplItem( tmplItem, newTmplItems[tmplItem.parent.key + keySuffix] || tmplItem.parent ));
			}
		}
	}

	//---- Helper functions for template item ----

	function tiCalls( content, tmpl, data, options ) {
		if ( !content ) {
			return stack.pop();
		}
		stack.push({ _: content, tmpl: tmpl, item:this, data: data, options: options });
	}

	function tiNest( tmpl, data, options ) {
		// nested template, using {{tmpl}} tag
		return jQuery.tmpl( jQuery.template( tmpl ), data, options, this );
	}

	function tiWrap( call, wrapped ) {
		// nested template, using {{wrap}} tag
		var options = call.options || {};
		options.wrapped = wrapped;
		// Apply the template, which may incorporate wrapped content, 
		return jQuery.tmpl( jQuery.template( call.tmpl ), call.data, options, call.item );
	}

	function tiHtml( filter, textOnly ) {
		var wrapped = this._wrap;
		return jQuery.map(
			jQuery( jQuery.isArray( wrapped ) ? wrapped.join("") : wrapped ).filter( filter || "*" ),
			function(e) {
				return textOnly ?
					e.innerText || e.textContent :
					e.outerHTML || outerHtml(e);
			});
	}

	function tiUpdate() {
		var coll = this.nodes;
		jQuery.tmpl( null, null, null, this).insertBefore( coll[0] );
		jQuery( coll ).remove();
	}
})( jQuery );

/**
 * @license 
 * JavaScript Debug - v0.4 - 6/22/2010
 * http://benalman.com/projects/javascript-debug-console-log/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 * 
 * With lots of help from Paul Irish!
 * http://paulirish.com/
 */
window.debug=(
  function(){
    var i=this,b=Array.prototype.slice,d=i.console,h={},f,g,m=9,
    c=["error","warn","info","debug","log"],
    l="assert clear count dir dirxml exception group groupCollapsed groupEnd profile profileEnd table time timeEnd trace".split(" "),
    j=l.length,a=[];
    
    while(--j>=0){
      (function(n){
        h[n]=function(){
          m!==0&&d&&d[n]&&d[n].apply(d,arguments)}})(l[j])}j=c.length;
          while(--j>=0){(function(n,o){h[o]=function(){var q=b.call(arguments),p=[o].concat(q);
            a.push(p);e(p);
            if(!d||!k(n)){return}
            d.firebug?d[o].apply(i,q):d[o]?d[o](q):d.log(q)}})(j,c[j])}
            function e(n){if(f&&(g||!d||!d.log)){f.apply(i,n)}}
            h.setLevel=function(n){m=typeof n==="number"?n:9};
            function k(n){return m>0?m>n:c.length+m<=n}
            h.setCallback=function(){
              var o=b.call(arguments),n=a.length,p=n;
              f=o.shift()||null;
              g=typeof o[0]==="boolean"?o.shift():false;p-=typeof o[0]==="number"?o.shift():n;
              while(p<n){e(a[p++])}};
              return h})();

/*!
 * jQuery Tiny Pub/Sub - v0.6 - 1/10/2011
 * http://benalman.com/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

(function($){

  // Create a "dummy" jQuery object on which to bind, unbind and trigger event
  // handlers. Note that $({}) works in jQuery 1.4.3+, but because .unbind on
  // a "plain object" throws errors in older versions of jQuery, an element is
  // used here.
  var o = $('<b/>');

  // Subscribe to a topic. Works just like bind, except the passed handler
  // is wrapped in a function so that the event object can be stripped out.
  // Even though the event object might be useful, it is unnecessary and
  // will only complicate things in the future should the user decide to move
  // to a non-$.event-based pub/sub implementation.
  $.subscribe = function( topic, fn ) {

    // Call fn, stripping out the 1st argument (the event object).
    function wrapper() {
      return fn.apply( this, Array.prototype.slice.call( arguments, 1 ) );
    }

    // Add .guid property to function to allow it to be easily unbound. Note
    // that $.guid is new in jQuery 1.4+, and $.event.guid was used before.
    wrapper.guid = fn.guid = fn.guid || ( $.guid ? $.guid++ : $.event.guid++ );

    // Bind the handler.
    o.bind( topic, wrapper );
  };

  // Unsubscribe from a topic. Works exactly like unbind.
  $.unsubscribe = function() {
    o.unbind.apply( o, arguments );
  };

  // Publish a topic. Works exactly like trigger.
  $.publish = function() {
    o.trigger.apply( o, arguments );
  };

})(jQuery);
/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */

(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

if ($.event.fixHooks) {
    for ( var i=types.length; i; ) {
        $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
}

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
    
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});


function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
    if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
        
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return ($.event.dispatch || $.event.handle).apply(this, args);
}

})(jQuery);

/**
* @preserve
* jQuery.UI.iPad plugin
* Copyright (c) 2010 Stephen von Takach
* licensed under MIT.
* Date: 27/8/2010
*
* Project Home: 
* http://code.google.com/p/jquery-ui-for-ipad-and-iphone/
*/


$(function() {
	//
	// Extend jQuery feature detection
	//
	$.extend($.support, {
		touch: "ontouchend" in document
	});
	
	//
	// Hook up touch events
	//
	$.fn.addTouch = function() {
        if ($.support.touch) {
                this.each(function(i,el){
                        el.addEventListener("touchstart", iPadTouchHandler, false);
                        el.addEventListener("touchmove", iPadTouchHandler, false);
                        el.addEventListener("touchend", iPadTouchHandler, false);
                        el.addEventListener("touchcancel", iPadTouchHandler, false);
                });
        }
	};

});


var lastTap = null;			// Holds last tapped element (so we can compare for double tap)
var tapValid = false;			// Are we still in the .6 second window where a double tap can occur
var tapTimeout = null;			// The timeout reference

function cancelTap() {
	tapValid = false;
}


var rightClickPending = false;	// Is a right click still feasible
var rightClickEvent = null;		// the original event
var holdTimeout = null;			// timeout reference
var cancelMouseUp = false;		// prevents a click from occuring as we want the context menu


function cancelHold() {
	if (rightClickPending) {
		window.clearTimeout(holdTimeout);
		rightClickPending = false;
		rightClickEvent = null;
	}
}

function startHold(event) {
	if (rightClickPending)
		return;

	rightClickPending = true; // We could be performing a right click
	rightClickEvent = (event.changedTouches)[0];
	holdTimeout = window.setTimeout("doRightClick();", 800);
}


function doRightClick() {
	rightClickPending = false;

	//
	// We need to mouse up (as we were down)
	//
	var first = rightClickEvent,
		simulatedEvent = document.createEvent("MouseEvent");
	simulatedEvent.initMouseEvent("mouseup", true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY,
			false, false, false, false, 0, null);
	first.target.dispatchEvent(simulatedEvent);

	//
	// emulate a right click
	//
	simulatedEvent = document.createEvent("MouseEvent");
	simulatedEvent.initMouseEvent("mousedown", true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY,
			false, false, false, false, 2, null);
	first.target.dispatchEvent(simulatedEvent);

	//
	// Show a context menu
	//
	simulatedEvent = document.createEvent("MouseEvent");
	simulatedEvent.initMouseEvent("contextmenu", true, true, window, 1, first.screenX + 50, first.screenY + 5, first.clientX + 50, first.clientY + 5,
                                  false, false, false, false, 2, null);
	first.target.dispatchEvent(simulatedEvent);


	//
	// Note:: I don't mouse up the right click here however feel free to add if required
	//


	cancelMouseUp = true;
	rightClickEvent = null; // Release memory
}


//
// mouse over event then mouse down
//
function iPadTouchStart(event) {
	var touches = event.changedTouches,
		first = touches[0],
		type = "mouseover",
		simulatedEvent = document.createEvent("MouseEvent");
	//
	// Mouse over first - I have live events attached on mouse over
	//
	simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY,
                            false, false, false, false, 0, null);
	first.target.dispatchEvent(simulatedEvent);

	type = "mousedown";
	simulatedEvent = document.createEvent("MouseEvent");

	simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY,
                            false, false, false, false, 0, null);
	first.target.dispatchEvent(simulatedEvent);


	if (!tapValid) {
		lastTap = first.target;
		tapValid = true;
		tapTimeout = window.setTimeout("cancelTap();", 600);
		startHold(event);
	}
	else {
		window.clearTimeout(tapTimeout);

		//
		// If a double tap is still a possibility and the elements are the same
		//	Then perform a double click
		//
		if (first.target == lastTap) {
			lastTap = null;
			tapValid = false;

			type = "click";
			simulatedEvent = document.createEvent("MouseEvent");

			simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY,
                         	false, false, false, false, 0/*left*/, null);
			first.target.dispatchEvent(simulatedEvent);

			type = "dblclick";
			simulatedEvent = document.createEvent("MouseEvent");

			simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY,
                         	false, false, false, false, 0/*left*/, null);
			first.target.dispatchEvent(simulatedEvent);
		}
		else {
			lastTap = first.target;
			tapValid = true;
			tapTimeout = window.setTimeout("cancelTap();", 600);
			startHold(event);
		}
	}
}

function iPadTouchHandler(event) {
	var type = "",
		button = 0; /*left*/

	if (event.touches.length > 1)
		return;

	switch (event.type) {
		case "touchstart":
			if ($(event.changedTouches[0].target).is("select")) {
				return;
			}
			iPadTouchStart(event); /*We need to trigger two events here to support one touch drag and drop*/
			event.preventDefault();
			return false;
			break;

		case "touchmove":
			cancelHold();
			type = "mousemove";
			event.preventDefault();
			break;

		case "touchend":
			if (cancelMouseUp) {
				cancelMouseUp = false;
				event.preventDefault();
				return false;
			}
			cancelHold();
			type = "mouseup";
			break;

		default:
			return;
	}

	var touches = event.changedTouches,
		first = touches[0],
		simulatedEvent = document.createEvent("MouseEvent");

	simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY,
                            false, false, false, false, button, null);

	first.target.dispatchEvent(simulatedEvent);

	if (type == "mouseup" && tapValid && first.target == lastTap) {	// This actually emulates the ipads default behaviour (which we prevented)
		simulatedEvent = document.createEvent("MouseEvent");		// This check avoids click being emulated on a double tap

		simulatedEvent.initMouseEvent("click", true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY,
                            false, false, false, false, button, null);

		first.target.dispatchEvent(simulatedEvent);
	}
}



(function(window, undefined) {
    var Globalize, regexHex, regexInfinity, regexParseFloat, regexTrim, arrayIndexOf, endsWith, extend, isArray, isFunction, isObject, startsWith, trim, truncate, zeroPad, appendPreOrPostMatch, expandFormat, formatDate, formatNumber, getTokenRegExp, getEra, getEraYear, parseExact, parseNegativePattern;
    Globalize = function(cultureSelector) { return new Globalize.prototype.init(cultureSelector) };
    if (typeof require !== "undefined" && typeof exports !== "undefined" && typeof module !== "undefined") { module.exports = Globalize } else { window.Globalize = Globalize }
    Globalize.cultures = {};
    Globalize.prototype = {
        constructor: Globalize,
        init: function(cultureSelector) {
            this.cultures = Globalize.cultures;
            this.cultureSelector = cultureSelector;
            return this
        }
    };
    Globalize.prototype.init.prototype = Globalize.prototype;
    Globalize.cultures["default"] = { name: "en", englishName: "English", nativeName: "English", isRTL: false, language: "en", numberFormat: { pattern: ["-n"], decimals: 2, ",": ",", ".": ".", groupSizes: [3], "+": "+", "-": "-", "NaN": "NaN", negativeInfinity: "-Infinity", positiveInfinity: "Infinity", percent: { pattern: ["-n %", "n %"], decimals: 2, groupSizes: [3], ",": ",", ".": ".", symbol: "%" }, currency: { pattern: ["($n)", "$n"], decimals: 2, groupSizes: [3], ",": ",", ".": ".", symbol: "$" } }, calendars: { standard: { name: "Gregorian_USEnglish", "/": "/", ":": ":", firstDay: 0, days: { names: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"], namesAbbr: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"], namesShort: ["日", "一", "二", "三", "四", "五", "六"] }, months: { names: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", ""], namesAbbr: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", ""] }, AM: ["AM", "am", "AM"], PM: ["PM", "pm", "PM"], eras: [{ "name": "公元", "start": null, "offset": 0 }], twoDigitYearMax: 2029, patterns: { d: "yyyy/M/d", D: "dddd, MMMM dd, yyyy", t: "h:mm tt", T: "h:mm:ss tt", f: "dddd, MMMM dd, yyyy h:mm tt", F: "dddd, MMMM dd, yyyy h:mm:ss tt", M: "MMMM dd", Y: "yyyy MMMM", S: "yyyy\u0027-\u0027MM\u0027-\u0027dd\u0027T\u0027HH\u0027:\u0027mm\u0027:\u0027ss" } } }, messages: {} };
    Globalize.cultures["default"].calendar = Globalize.cultures["default"].calendars.standard;
    Globalize.cultures.en = Globalize.cultures["default"];
    Globalize.cultureSelector = "en";
    regexHex = /^0x[a-f0-9]+$/i;
    regexInfinity = /^[+\-]?infinity$/i;
    regexParseFloat = /^[+\-]?\d*\.?\d*(e[+\-]?\d+)?$/;
    regexTrim = /^\s+|\s+$/g;
    arrayIndexOf = function(array, item) { if (array.indexOf) { return array.indexOf(item) } for (var i = 0, length = array.length; i < length; i++) { if (array[i] === item) { return i } } return -1 };
    endsWith = function(value, pattern) { return value.substr(value.length - pattern.length) === pattern };
    extend = function() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            i = 2
        }
        if (typeof target !== "object" && !isFunction(target)) { target = {} }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) { continue }
                    if (deep && copy && (isObject(copy) || (copyIsArray = isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : []
                        } else { clone = src && isObject(src) ? src : {} }
                        target[name] = extend(deep, clone, copy)
                    } else if (copy !== undefined) { target[name] = copy }
                }
            }
        }
        return target
    };
    isArray = Array.isArray || function(obj) { return Object.prototype.toString.call(obj) === "[object Array]" };
    isFunction = function(obj) { return Object.prototype.toString.call(obj) === "[object Function]" };
    isObject = function(obj) { return Object.prototype.toString.call(obj) === "[object Object]" };
    startsWith = function(value, pattern) { return value.indexOf(pattern) === 0 };
    trim = function(value) { return (value + "").replace(regexTrim, "") };
    truncate = function(value) { if (isNaN(value)) { return NaN } return Math[value < 0 ? "ceil" : "floor"](value) };
    zeroPad = function(str, count, left) { var l; for (l = str.length; l < count; l += 1) { str = (left ? ("0" + str) : (str + "0")) } return str };
    appendPreOrPostMatch = function(preMatch, strings) {
        var quoteCount = 0,
            escaped = false;
        for (var i = 0, il = preMatch.length; i < il; i++) {
            var c = preMatch.charAt(i);
            switch (c) {
                case "\'":
                    if (escaped) { strings.push("\'") } else { quoteCount++ }
                    escaped = false;
                    break;
                case "\\":
                    if (escaped) { strings.push("\\") }
                    escaped = !escaped;
                    break;
                default:
                    strings.push(c);
                    escaped = false;
                    break
            }
        }
        return quoteCount
    };
    expandFormat = function(cal, format) {
        format = format || "F";
        var pattern, patterns = cal.patterns,
            len = format.length;
        if (len === 1) {
            pattern = patterns[format];
            if (!pattern) { throw "Invalid date format string \'" + format + "\'."; }
            format = pattern
        } else if (len === 2 && format.charAt(0) === "%") { format = format.charAt(1) }
        return format
    };
    formatDate = function(value, format, culture) {
        var cal = culture.calendar,
            convert = cal.convert,
            ret;
        if (!format || !format.length || format === "i") {
            if (culture && culture.name.length) {
                if (convert) { ret = formatDate(value, cal.patterns.F, culture) } else {
                    var eraDate = new Date(value.getTime()),
                        era = getEra(value, cal.eras);
                    eraDate.setFullYear(getEraYear(value, cal, era));
                    ret = eraDate.toLocaleString()
                }
            } else { ret = value.toString() }
            return ret
        }
        var eras = cal.eras,
            sortable = format === "s";
        format = expandFormat(cal, format);
        ret = [];
        var hour, zeros = ["0", "00", "000"],
            foundDay, checkedDay, dayPartRegExp = /([^d]|^)(d|dd)([^d]|$)/g,
            quoteCount = 0,
            tokenRegExp = getTokenRegExp(),
            converted;

        function padZeros(num, c) { var r, s = num + ""; if (c > 1 && s.length < c) { r = (zeros[c - 2] + s); return r.substr(r.length - c, c) } else { r = s } return r }

        function hasDay() {
            if (foundDay || checkedDay) { return foundDay }
            foundDay = dayPartRegExp.test(format);
            checkedDay = true;
            return foundDay
        }

        function getPart(date, part) {
            if (converted) { return converted[part] }
            switch (part) {
                case 0:
                    return date.getFullYear();
                case 1:
                    return date.getMonth();
                case 2:
                    return date.getDate();
                default:
                    throw "Invalid part value " + part;
            }
        }
        if (!sortable && convert) { converted = convert.fromGregorian(value) }
        for (;;) {
            var index = tokenRegExp.lastIndex,
                ar = tokenRegExp.exec(format);
            var preMatch = format.slice(index, ar ? ar.index : format.length);
            quoteCount += appendPreOrPostMatch(preMatch, ret);
            if (!ar) { break }
            if (quoteCount % 2) { ret.push(ar[0]); continue }
            var current = ar[0],
                clength = current.length;
            switch (current) {
                case "ddd":
                case "dddd":
                    var names = (clength === 3) ? cal.days.namesAbbr : cal.days.names;
                    ret.push(names[value.getDay()]);
                    break;
                case "d":
                case "dd":
                    foundDay = true;
                    ret.push(padZeros(getPart(value, 2), clength));
                    break;
                case "MMM":
                case "MMMM":
                    var part = getPart(value, 1);
                    ret.push((cal.monthsGenitive && hasDay()) ? (cal.monthsGenitive[clength === 3 ? "namesAbbr" : "names"][part]) : (cal.months[clength === 3 ? "namesAbbr" : "names"][part]));
                    break;
                case "M":
                case "MM":
                    ret.push(padZeros(getPart(value, 1) + 1, clength));
                    break;
                case "y":
                case "yy":
                case "yyyy":
                    part = converted ? converted[0] : getEraYear(value, cal, getEra(value, eras), sortable);
                    if (clength < 4) { part = part % 100 }
                    ret.push(padZeros(part, clength));
                    break;
                case "h":
                case "hh":
                    hour = value.getHours() % 12;
                    if (hour === 0) hour = 12;
                    ret.push(padZeros(hour, clength));
                    break;
                case "H":
                case "HH":
                    ret.push(padZeros(value.getHours(), clength));
                    break;
                case "m":
                case "mm":
                    ret.push(padZeros(value.getMinutes(), clength));
                    break;
                case "s":
                case "ss":
                    ret.push(padZeros(value.getSeconds(), clength));
                    break;
                case "t":
                case "tt":
                    part = value.getHours() < 12 ? (cal.AM ? cal.AM[0] : " ") : (cal.PM ? cal.PM[0] : " ");
                    ret.push(clength === 1 ? part.charAt(0) : part);
                    break;
                case "f":
                case "ff":
                case "fff":
                    ret.push(padZeros(value.getMilliseconds(), 3).substr(0, clength));
                    break;
                case "z":
                case "zz":
                    hour = value.getTimezoneOffset() / 60;
                    ret.push((hour <= 0 ? "+" : "-") + padZeros(Math.floor(Math.abs(hour)), clength));
                    break;
                case "zzz":
                    hour = value.getTimezoneOffset() / 60;
                    ret.push((hour <= 0 ? "+" : "-") + padZeros(Math.floor(Math.abs(hour)), 2) + ":" + padZeros(Math.abs(value.getTimezoneOffset() % 60), 2));
                    break;
                case "g":
                case "gg":
                    if (cal.eras) { ret.push(cal.eras[getEra(value, eras)].name) }
                    break;
                case "/":
                    ret.push(cal["/"]);
                    break;
                default:
                    throw "Invalid date format pattern \'" + current + "\'.";
            }
        }
        return ret.join("")
    };
    (function() {
        var expandNumber;
        expandNumber = function(number, precision, formatInfo) {
            var groupSizes = formatInfo.groupSizes,
                curSize = groupSizes[0],
                curGroupIndex = 1,
                factor = Math.pow(10, precision),
                rounded = Math.round(number * factor) / factor;
            if (!isFinite(rounded)) { rounded = number }
            number = rounded;
            var numberString = number + "",
                right = "",
                split = numberString.split(/e/i),
                exponent = split.length > 1 ? parseInt(split[1], 10) : 0;
            numberString = split[0];
            split = numberString.split(".");
            numberString = split[0];
            right = split.length > 1 ? split[1] : "";
            var l;
            if (exponent > 0) {
                right = zeroPad(right, exponent, false);
                numberString += right.slice(0, exponent);
                right = right.substr(exponent)
            } else if (exponent < 0) {
                exponent = -exponent;
                numberString = zeroPad(numberString, exponent + 1, true);
                right = numberString.slice(-exponent, numberString.length) + right;
                numberString = numberString.slice(0, -exponent)
            }
            if (precision > 0) { right = formatInfo["."] + ((right.length > precision) ? right.slice(0, precision) : zeroPad(right, precision)) } else { right = "" }
            var stringIndex = numberString.length - 1,
                sep = formatInfo[","],
                ret = "";
            while (stringIndex >= 0) {
                if (curSize === 0 || curSize > stringIndex) { return numberString.slice(0, stringIndex + 1) + (ret.length ? (sep + ret + right) : right) }
                ret = numberString.slice(stringIndex - curSize + 1, stringIndex + 1) + (ret.length ? (sep + ret) : "");
                stringIndex -= curSize;
                if (curGroupIndex < groupSizes.length) {
                    curSize = groupSizes[curGroupIndex];
                    curGroupIndex++
                }
            }
            return numberString.slice(0, stringIndex + 1) + sep + ret + right
        };
        formatNumber = function(value, format, culture) {
            if (!isFinite(value)) { if (value === Infinity) { return culture.numberFormat.positiveInfinity } if (value === -Infinity) { return culture.numberFormat.negativeInfinity } return culture.numberFormat["NaN"] }
            if (!format || format === "i") { return culture.name.length ? value.toLocaleString() : value.toString() }
            format = format || "D";
            var nf = culture.numberFormat,
                number = Math.abs(value),
                precision = -1,
                pattern;
            if (format.length > 1) precision = parseInt(format.slice(1), 10);
            var current = format.charAt(0).toUpperCase(),
                formatInfo;
            switch (current) {
                case "D":
                    pattern = "n";
                    number = truncate(number);
                    if (precision !== -1) { number = zeroPad("" + number, precision, true) }
                    if (value < 0) number = "-" + number;
                    break;
                case "N":
                    formatInfo = nf;
                case "C":
                    formatInfo = formatInfo || nf.currency;
                case "P":
                    formatInfo = formatInfo || nf.percent;
                    pattern = value < 0 ? formatInfo.pattern[0] : (formatInfo.pattern[1] || "n");
                    if (precision === -1) precision = formatInfo.decimals;
                    number = expandNumber(number * (current === "P" ? 100 : 1), precision, formatInfo);
                    break;
                default:
                    throw "Bad number format specifier: " + current;
            }
            var patternParts = /n|\$|-|%/g,
                ret = "";
            for (;;) {
                var index = patternParts.lastIndex,
                    ar = patternParts.exec(pattern);
                ret += pattern.slice(index, ar ? ar.index : pattern.length);
                if (!ar) { break }
                switch (ar[0]) {
                    case "n":
                        ret += number;
                        break;
                    case "$":
                        ret += nf.currency.symbol;
                        break;
                    case "-":
                        if (/[1-9]/.test(number)) { ret += nf["-"] }
                        break;
                    case "%":
                        ret += nf.percent.symbol;
                        break
                }
            }
            return ret
        }
    }());
    getTokenRegExp = function() { return (/\/|dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|fff|ff|f|zzz|zz|z|gg|g/g) };
    getEra = function(date, eras) { if (!eras) return 0; var start, ticks = date.getTime(); for (var i = 0, l = eras.length; i < l; i++) { start = eras[i].start; if (start === null || ticks >= start) { return i } } return 0 };
    getEraYear = function(date, cal, era, sortable) { var year = date.getFullYear(); if (!sortable && cal.eras) { year -= cal.eras[era].offset } return year };
    (function() {
        var expandYear, getDayIndex, getMonthIndex, getParseRegExp, outOfRange, toUpper, toUpperArray;
        expandYear = function(cal, year) {
            if (year < 100) {
                var now = new Date(),
                    era = getEra(now),
                    curr = getEraYear(now, cal, era),
                    twoDigitYearMax = cal.twoDigitYearMax;
                twoDigitYearMax = typeof twoDigitYearMax === "string" ? new Date().getFullYear() % 100 + parseInt(twoDigitYearMax, 10) : twoDigitYearMax;
                year += curr - (curr % 100);
                if (year > twoDigitYearMax) { year -= 100 }
            }
            return year
        };
        getDayIndex = function(cal, value, abbr) {
            var ret, days = cal.days,
                upperDays = cal._upperDays;
            if (!upperDays) { cal._upperDays = upperDays = [toUpperArray(days.names), toUpperArray(days.namesAbbr), toUpperArray(days.namesShort)] }
            value = toUpper(value);
            if (abbr) { ret = arrayIndexOf(upperDays[1], value); if (ret === -1) { ret = arrayIndexOf(upperDays[2], value) } } else { ret = arrayIndexOf(upperDays[0], value) }
            return ret
        };
        getMonthIndex = function(cal, value, abbr) {
            var months = cal.months,
                monthsGen = cal.monthsGenitive || cal.months,
                upperMonths = cal._upperMonths,
                upperMonthsGen = cal._upperMonthsGen;
            if (!upperMonths) {
                cal._upperMonths = upperMonths = [toUpperArray(months.names), toUpperArray(months.namesAbbr)];
                cal._upperMonthsGen = upperMonthsGen = [toUpperArray(monthsGen.names), toUpperArray(monthsGen.namesAbbr)]
            }
            value = toUpper(value);
            var i = arrayIndexOf(abbr ? upperMonths[1] : upperMonths[0], value);
            if (i < 0) { i = arrayIndexOf(abbr ? upperMonthsGen[1] : upperMonthsGen[0], value) }
            return i
        };
        getParseRegExp = function(cal, format) {
            var re = cal._parseRegExp;
            if (!re) { cal._parseRegExp = re = {} } else { var reFormat = re[format]; if (reFormat) { return reFormat } }
            var expFormat = expandFormat(cal, format).replace(/([\^\$\.\*\+\?\|\[\]\(\)\{\}])/g, "\\\\$1"),
                regexp = ["^"],
                groups = [],
                index = 0,
                quoteCount = 0,
                tokenRegExp = getTokenRegExp(),
                match;
            while ((match = tokenRegExp.exec(expFormat)) !== null) {
                var preMatch = expFormat.slice(index, match.index);
                index = tokenRegExp.lastIndex;
                quoteCount += appendPreOrPostMatch(preMatch, regexp);
                if (quoteCount % 2) { regexp.push(match[0]); continue }
                var m = match[0],
                    len = m.length,
                    add;
                switch (m) {
                    case "dddd":
                    case "ddd":
                    case "MMMM":
                    case "MMM":
                    case "gg":
                    case "g":
                        add = "(\\D+)";
                        break;
                    case "tt":
                    case "t":
                        add = "(\\D*)";
                        break;
                    case "yyyy":
                    case "fff":
                    case "ff":
                    case "f":
                        add = "(\\d{" + len + "})";
                        break;
                    case "dd":
                    case "d":
                    case "MM":
                    case "M":
                    case "yy":
                    case "y":
                    case "HH":
                    case "H":
                    case "hh":
                    case "h":
                    case "mm":
                    case "m":
                    case "ss":
                    case "s":
                        add = "(\\d\\d?)";
                        break;
                    case "zzz":
                        add = "([+-]?\\d\\d?:\\d{2})";
                        break;
                    case "zz":
                    case "z":
                        add = "([+-]?\\d\\d?)";
                        break;
                    case "/":
                        add = "(\\/)";
                        break;
                    default:
                        throw "Invalid date format pattern \'" + m + "\'.";
                }
                if (add) { regexp.push(add) }
                groups.push(match[0])
            }
            appendPreOrPostMatch(expFormat.slice(index), regexp);
            regexp.push("$");
            var regexpStr = regexp.join("").replace(/\s+/g, "\\s+"),
                parseRegExp = { "regExp": regexpStr, "groups": groups };
            return re[format] = parseRegExp
        };
        outOfRange = function(value, low, high) { return value < low || value > high };
        toUpper = function(value) { return value.split("\u00A0").join(" ").toUpperCase() };
        toUpperArray = function(arr) { var results = []; for (var i = 0, l = arr.length; i < l; i++) { results[i] = toUpper(arr[i]) } return results };
        parseExact = function(value, format, culture) {
            value = trim(value);
            var cal = culture.calendar,
                parseInfo = getParseRegExp(cal, format),
                match = new RegExp(parseInfo.regExp).exec(value);
            if (match === null) { return null }
            var groups = parseInfo.groups,
                era = null,
                year = null,
                month = null,
                date = null,
                weekDay = null,
                hour = 0,
                hourOffset, min = 0,
                sec = 0,
                msec = 0,
                tzMinOffset = null,
                pmHour = false;
            for (var j = 0, jl = groups.length; j < jl; j++) {
                var matchGroup = match[j + 1];
                if (matchGroup) {
                    var current = groups[j],
                        clength = current.length,
                        matchInt = parseInt(matchGroup, 10);
                    switch (current) {
                        case "dd":
                        case "d":
                            date = matchInt;
                            if (outOfRange(date, 1, 31)) return null;
                            break;
                        case "MMM":
                        case "MMMM":
                            month = getMonthIndex(cal, matchGroup, clength === 3);
                            if (outOfRange(month, 0, 11)) return null;
                            break;
                        case "M":
                        case "MM":
                            month = matchInt - 1;
                            if (outOfRange(month, 0, 11)) return null;
                            break;
                        case "y":
                        case "yy":
                        case "yyyy":
                            year = clength < 4 ? expandYear(cal, matchInt) : matchInt;
                            if (outOfRange(year, 0, 9999)) return null;
                            break;
                        case "h":
                        case "hh":
                            hour = matchInt;
                            if (hour === 12) hour = 0;
                            if (outOfRange(hour, 0, 11)) return null;
                            break;
                        case "H":
                        case "HH":
                            hour = matchInt;
                            if (outOfRange(hour, 0, 23)) return null;
                            break;
                        case "m":
                        case "mm":
                            min = matchInt;
                            if (outOfRange(min, 0, 59)) return null;
                            break;
                        case "s":
                        case "ss":
                            sec = matchInt;
                            if (outOfRange(sec, 0, 59)) return null;
                            break;
                        case "tt":
                        case "t":
                            pmHour = cal.PM && (matchGroup === cal.PM[0] || matchGroup === cal.PM[1] || matchGroup === cal.PM[2]);
                            if (!pmHour && (!cal.AM || (matchGroup !== cal.AM[0] && matchGroup !== cal.AM[1] && matchGroup !== cal.AM[2]))) return null;
                            break;
                        case "f":
                        case "ff":
                        case "fff":
                            msec = matchInt * Math.pow(10, 3 - clength);
                            if (outOfRange(msec, 0, 999)) return null;
                            break;
                        case "ddd":
                        case "dddd":
                            weekDay = getDayIndex(cal, matchGroup, clength === 3);
                            if (outOfRange(weekDay, 0, 6)) return null;
                            break;
                        case "zzz":
                            var offsets = matchGroup.split(/:/);
                            if (offsets.length !== 2) return null;
                            hourOffset = parseInt(offsets[0], 10);
                            if (outOfRange(hourOffset, -12, 13)) return null;
                            var minOffset = parseInt(offsets[1], 10);
                            if (outOfRange(minOffset, 0, 59)) return null;
                            tzMinOffset = (hourOffset * 60) + (startsWith(matchGroup, "-") ? -minOffset : minOffset);
                            break;
                        case "z":
                        case "zz":
                            hourOffset = matchInt;
                            if (outOfRange(hourOffset, -12, 13)) return null;
                            tzMinOffset = hourOffset * 60;
                            break;
                        case "g":
                        case "gg":
                            var eraName = matchGroup;
                            if (!eraName || !cal.eras) return null;
                            eraName = trim(eraName.toLowerCase());
                            for (var i = 0, l = cal.eras.length; i < l; i++) { if (eraName === cal.eras[i].name.toLowerCase()) { era = i; break } }
                            if (era === null) return null;
                            break
                    }
                }
            }
            var result = new Date(),
                defaultYear, convert = cal.convert;
            defaultYear = convert ? convert.fromGregorian(result)[0] : result.getFullYear();
            if (year === null) { year = defaultYear } else if (cal.eras) { year += cal.eras[(era || 0)].offset }
            if (month === null) { month = 0 }
            if (date === null) { date = 1 }
            if (convert) { result = convert.toGregorian(year, month, date); if (result === null) return null } else { result.setFullYear(year, month, date); if (result.getDate() !== date) return null; if (weekDay !== null && result.getDay() !== weekDay) { return null } }
            if (pmHour && hour < 12) { hour += 12 }
            result.setHours(hour, min, sec, msec);
            if (tzMinOffset !== null) {
                var adjustedMin = result.getMinutes() - (tzMinOffset + result.getTimezoneOffset());
                result.setHours(result.getHours() + parseInt(adjustedMin / 60, 10), adjustedMin % 60)
            }
            return result
        }
    }());
    parseNegativePattern = function(value, nf, negativePattern) {
        var neg = nf["-"],
            pos = nf["+"],
            ret;
        switch (negativePattern) {
            case "n -":
                neg = " " + neg;
                pos = " " + pos;
            case "n-":
                if (endsWith(value, neg)) { ret = ["-", value.substr(0, value.length - neg.length)] } else if (endsWith(value, pos)) { ret = ["+", value.substr(0, value.length - pos.length)] }
                break;
            case "- n":
                neg += " ";
                pos += " ";
            case "-n":
                if (startsWith(value, neg)) { ret = ["-", value.substr(neg.length)] } else if (startsWith(value, pos)) { ret = ["+", value.substr(pos.length)] }
                break;
            case "(n)":
                if (startsWith(value, "(") && endsWith(value, ")")) { ret = ["-", value.substr(1, value.length - 2)] }
                break
        }
        return ret || ["", value]
    };
    Globalize.prototype.findClosestCulture = function(cultureSelector) { return Globalize.findClosestCulture.call(this, cultureSelector) };
    Globalize.prototype.format = function(value, format, cultureSelector) { return Globalize.format.call(this, value, format, cultureSelector) };
    Globalize.prototype.localize = function(key, cultureSelector) { return Globalize.localize.call(this, key, cultureSelector) };
    Globalize.prototype.parseInt = function(value, radix, cultureSelector) { return Globalize.parseInt.call(this, value, radix, cultureSelector) };
    Globalize.prototype.parseFloat = function(value, radix, cultureSelector) { return Globalize.parseFloat.call(this, value, radix, cultureSelector) };
    Globalize.prototype.culture = function(cultureSelector) { return Globalize.culture.call(this, cultureSelector) };
    Globalize.addCultureInfo = function(cultureName, baseCultureName, info) {
        var base = {},
            isNew = false;
        if (typeof cultureName !== "string") {
            info = cultureName;
            cultureName = this.culture().name;
            base = this.cultures[cultureName]
        } else if (typeof baseCultureName !== "string") {
            info = baseCultureName;
            isNew = (this.cultures[cultureName] == null);
            base = this.cultures[cultureName] || this.cultures["default"]
        } else {
            isNew = true;
            base = this.cultures[baseCultureName]
        }
        this.cultures[cultureName] = extend(true, {}, base, info);
        if (isNew) { this.cultures[cultureName].calendar = this.cultures[cultureName].calendars.standard }
    };
    Globalize.findClosestCulture = function(name) {
        var match;
        if (!name) { return this.findClosestCulture(this.cultureSelector) || this.cultures["default"] }
        if (typeof name === "string") { name = name.split(",") }
        if (isArray(name)) {
            var lang, cultures = this.cultures,
                list = name,
                i, l = list.length,
                prioritized = [];
            for (i = 0; i < l; i++) {
                name = trim(list[i]);
                var pri, parts = name.split(";");
                lang = trim(parts[0]);
                if (parts.length === 1) { pri = 1 } else {
                    name = trim(parts[1]);
                    if (name.indexOf("q=") === 0) {
                        name = name.substr(2);
                        pri = parseFloat(name);
                        pri = isNaN(pri) ? 0 : pri
                    } else { pri = 1 }
                }
                prioritized.push({ lang: lang, pri: pri })
            }
            prioritized.sort(function(a, b) { if (a.pri < b.pri) { return 1 } else if (a.pri > b.pri) { return -1 } return 0 });
            for (i = 0; i < l; i++) {
                lang = prioritized[i].lang;
                match = cultures[lang];
                if (match) { return match }
            }
            for (i = 0; i < l; i++) {
                lang = prioritized[i].lang;
                do {
                    var index = lang.lastIndexOf("-");
                    if (index === -1) { break }
                    lang = lang.substr(0, index);
                    match = cultures[lang];
                    if (match) { return match }
                } while (1)
            }
            for (i = 0; i < l; i++) { lang = prioritized[i].lang; for (var cultureKey in cultures) { var culture = cultures[cultureKey]; if (culture.language == lang) { return culture } } }
        } else if (typeof name === "object") { return name }
        return match || null
    };
    Globalize.format = function(value, format, cultureSelector) { var culture = this.findClosestCulture(cultureSelector); if (value instanceof Date) { value = formatDate(value, format, culture) } else if (typeof value === "number") { value = formatNumber(value, format, culture) } return value };
    Globalize.localize = function(key, cultureSelector) { return this.findClosestCulture(cultureSelector).messages[key] || this.cultures["default"].messages[key] };
    Globalize.parseDate = function(value, formats, culture) { culture = this.findClosestCulture(culture); var date, prop, patterns; if (formats) { if (typeof formats === "string") { formats = [formats] } if (formats.length) { for (var i = 0, l = formats.length; i < l; i++) { var format = formats[i]; if (format) { date = parseExact(value, format, culture); if (date) { break } } } } } else { patterns = culture.calendar.patterns; for (prop in patterns) { date = parseExact(value, patterns[prop], culture); if (date) { break } } } return date || null };
    Globalize.parseInt = function(value, radix, cultureSelector) { return truncate(Globalize.parseFloat(value, radix, cultureSelector)) };
    Globalize.parseFloat = function(value, radix, cultureSelector) {
        if (typeof radix !== "number") {
            cultureSelector = radix;
            radix = 10
        }
        var culture = this.findClosestCulture(cultureSelector);
        var ret = NaN,
            nf = culture.numberFormat;
        if (value.indexOf(culture.numberFormat.currency.symbol) > -1) {
            value = value.replace(culture.numberFormat.currency.symbol, "");
            value = value.replace(culture.numberFormat.currency["."], culture.numberFormat["."])
        }
        if (value.indexOf(culture.numberFormat.percent.symbol) > -1) { value = value.replace(culture.numberFormat.percent.symbol, "") }
        value = value.replace(/ /g, "");
        if (regexInfinity.test(value)) { ret = parseFloat(value) } else if (!radix && regexHex.test(value)) { ret = parseInt(value, 16) } else {
            var signInfo = parseNegativePattern(value, nf, nf.pattern[0]),
                sign = signInfo[0],
                num = signInfo[1];
            if (sign === "" && nf.pattern[0] !== "(n)") {
                signInfo = parseNegativePattern(value, nf, "(n)");
                sign = signInfo[0];
                num = signInfo[1]
            }
            if (sign === "" && nf.pattern[0] !== "-n") {
                signInfo = parseNegativePattern(value, nf, "-n");
                sign = signInfo[0];
                num = signInfo[1]
            }
            sign = sign || "+";
            var exponent, intAndFraction, exponentPos = num.indexOf("e");
            if (exponentPos < 0) exponentPos = num.indexOf("E");
            if (exponentPos < 0) {
                intAndFraction = num;
                exponent = null
            } else {
                intAndFraction = num.substr(0, exponentPos);
                exponent = num.substr(exponentPos + 1)
            }
            var integer, fraction, decSep = nf["."],
                decimalPos = intAndFraction.indexOf(decSep);
            if (decimalPos < 0) {
                integer = intAndFraction;
                fraction = null
            } else {
                integer = intAndFraction.substr(0, decimalPos);
                fraction = intAndFraction.substr(decimalPos + decSep.length)
            }
            var groupSep = nf[","];
            integer = integer.split(groupSep).join("");
            var altGroupSep = groupSep.replace(/\u00A0/g, " ");
            if (groupSep !== altGroupSep) { integer = integer.split(altGroupSep).join("") }
            var p = sign + integer;
            if (fraction !== null) { p += "." + fraction }
            if (exponent !== null) {
                var expSignInfo = parseNegativePattern(exponent, nf, "-n");
                p += "e" + (expSignInfo[0] || "+") + expSignInfo[1]
            }
            if (regexParseFloat.test(p)) { ret = parseFloat(p) }
        }
        return ret
    };
    Globalize.culture = function(cultureSelector) { if (typeof cultureSelector !== "undefined") { this.cultureSelector = cultureSelector } return this.findClosestCulture(cultureSelector) || this.cultures["default"] }
}(this));
/*
 * Timeglider for Javascript / jQuery 
 * http://timeglider.com/jquery
 *
 * Copyright 2011, Mnemograph LLC
 * Licensed under Timeglider Dual License
 * http://timeglider.com/jquery/?p=license
 *
 */

// initial declaration of timeglider object for widget
// authoring app will declare a different object, so
// this will defer to window.timeglider
timeglider = window.timeglider || {mode:"publish", version:"0.1.0", ui:{touchtesting:false}};


/*
*  TG_Date
* 
*  dependencies: jQuery, Globalize
*
* You might be wondering why we're not extending JS Date().
* That might be a good idea some day. There are some
* major issues with Date(): the "year zero" (or millisecond)
* in JS and other date APIs is 1970, so timestamps are negative
* prior to that; JS's Date() can't handle years prior to
* -271820, so some extension needs to be created to deal with
* times (on the order of billions of years) existing before that.
*
* This TG_Date object also has functionality which  goes hand-in-hand
* with the date hashing system: each event on the timeline is hashed
* according to day, year, decade, century, millenia, etc
*
*/

/*

IMPORTED DATE STANDARD

http://www.w3.org/TR/NOTE-datetime
"a profile of" ISO 8601 date format

Complete date plus hours, minutes and seconds:
YYYY-MM-DDThh:mm:ssTZD (eg 1997-07-16T19:20:30+01:00)

Acceptable:
YYYY
YYYY-MM
YYYY-MM-DD
YYYY-MM-DDT13
YYYY-MM-DD 08:15 (strlen 16)
YYYY-MM-DD 08:15:30 (strlen 19)
(above would assume either a timeline-level timezone, or UTC)

containing its own timezone, this would ignore timeline timezone
YYYY-MM-DD 08:15:30-07:00
   
*/

timeglider.TG_Date = {};


(function(tg){
  
  	
	var tg = timeglider, $ = jQuery;
  
	// caches speed up costly calculations
	var getRataDieCache = {},
		getDaysInYearSpanCache = {},
		getBCRataDieCache = {},
		getDateFromRDCache = {},
		getDateFromSecCache = {};
		
	var VALID_DATE_PATTERN = /^(\-?\d+)?(\-\d{1,2})?(\-\d{1,2})?(?:T| )?(\d{1,2})?(?::)?(\d{1,2})?(?::)?(\d{1,2})?(\+|\-)?(\d{1,2})?(?::)?(\d{1,2})?/;
  
  
   // MAIN CONSTRUCTOR
        
	tg.TG_Date = function (strOrNum, date_display, offSec) {

		var dateStr, isoStr, gotSec,
    		offsetSeconds = offSec || 0;

		if (typeof(strOrNum) == "number") {
      	  // SERIAL SECONDS	
			dateStr = isoStr = TG_Date.getDateFromSec(strOrNum);
			gotSec = (strOrNum + offsetSeconds);
		
		} else if (typeof(strOrNum) === "object") {
			// TODO: JS Date object?
			// dateStr = strOrNum.ye + "-" + strOrNum.mo + "-" + strOrNum.da 
		
			
		} else {
		// STRING
			if (strOrNum == "today") {
				strOrNum = TG_Date.getToday();
			}
			
			dateStr = isoStr = strOrNum;
		}
  
  
  		if (VALID_DATE_PATTERN.test(dateStr)) {

			// !TODO: translate strings like "today" and "now"
			// "next week", "a week from thursday", "christmas"
	       		
      		var parsed =  TG_Date.parse8601(dateStr);
      		
      		
      		if (parsed.tz_ho) {
      			// this is working ------ timezones in the string translate correctly
      			// OK: transforms date properly to UTC since it should have been there
      			parsed = TG_Date.toFromUTC(parsed, {hours:parsed.tz_ho, minutes:parsed.tz_mi}, "to");
      		}
      		
      		
      		// ye, mo, da, ho, mi, se arrive in parsed (with tz_)
      					
			$.extend(this,parsed);

      		// SERIAL day from year zero
      		this.rd  = TG_Date.getRataDie(this);
    
      		// SERIAL month from year 0
      		this.mo_num = getMoNum(this);
      		
      		// SERIAL second from year 0
      		this.sec = gotSec || getSec(this);
      		
      		this.date_display = (date_display) ? (date_display.toLowerCase()).substr(0,2) : "da";
			
			// TODO: get good str from parse8601  
      		this.dateStr = isoStr;
  		
  		} else {
  			return {error:"invalid date"};
  		}
		        
        return this;

  } // end TG_Date Function



  var TG_Date = tg.TG_Date;

  /*
  *  getTimeUnitSerial
  *  gets the serial number of specified time unit, using a ye-mo-da date object
  *  used in addToTicksArray() in Mediator
  *
  *  @param fd {object} i.e. the focus date: {ye:1968, mo:8, da:20}
  *  @param unit {string} scale-unit (da, mo, ye, etc)
  *
  *  @return {number} a non-zero serial for the specified time unit
  */
  TG_Date.getTimeUnitSerial = function (fd, unit) {
      var ret = 0;
      var floorCeil;
      
      if (fd.ye < 0) {
      	floorCeil = Math.ceil;
      } else {
      	floorCeil = Math.floor;
      }
      
  		switch (unit) {
  			case "da": ret =  fd.rd; break;
  			// set up mo_num inside TG_Date constructor
  			case "mo": ret =  fd.mo_num; break;
  			case "ye": ret = fd.ye; break;
  			case "de": ret =  floorCeil(fd.ye / 10); break;
  			case "ce": ret =  floorCeil(fd.ye / 100); break;
  			case "thou": ret =  floorCeil(fd.ye / 1000); break;
  			case "tenthou": ret =  floorCeil(fd.ye / 10000); break;
  			case "hundredthou": ret =  floorCeil(fd.ye / 100000); break;
  			case "mill": ret =  floorCeil(fd.ye / 1000000); break;
  			case "tenmill": ret =  floorCeil(fd.ye / 10000000); break;
  			case "hundredmill": ret =  floorCeil(fd.ye / 100000000); break;
  			case "bill": ret =  floorCeil(fd.ye / 1000000000); break;
  		}
  		return ret;
  };



	TG_Date.getMonthDays = function(mo,ye) {
  		if ((TG_Date.isLeapYear(ye) == true) && (mo==2)) {
  			return 29;
  		} else  {
  			return TG_Date.monthsDayNums[mo];
		}
	};


	TG_Date.twentyFourToTwelve = function (e) {
	
		var dob = {};
		dob.ye = e.ye;
		dob.mo = e.mo || 1;
		dob.da = e.da || 1;
		dob.ho = e.ho || 0;
		dob.mi = e.mi || 0;
		dob.ampm = "am";
	
		
		if (e.ho >= 12) {
			dob.ampm = "pm";
			if (e.ho > 12) {
				dob.ho = e.ho - 12;
			} else {
				dob.ho = 12;
			}
		} else if (e.ho == 0) {
			dob.ho = 12;
			dob.ampm = "am";
		} else {
			dob.ho = e.ho;
		}
		
		
		if (dob.mi < 9) {
			dob.mi = "0" + dob.mi;
		} 
	
		return dob;
	};
	
	
	/*
	* RELATES TO TICK WIDTH: SPECIFIC TO TIMELINE VIEW
	*/
	TG_Date.getMonthAdj = function (serial, tw) {
		var d = TG_Date.getDateFromMonthNum(serial);
		var w;
		switch (d.mo) {
		
			// 31 days
			case 1: case 3: case 5: case 7: case 8: case 10: case 12:
				var w = Math.floor(tw + ((tw/28) * 3));
				return {"width":w, "days":31};
			break;
	
			// Blasted February!
			case 2:
			if (TG_Date.isLeapYear(d.ye) == true) {
				w = Math.floor(tw + (tw/28));
				return {"width":w, "days":29};
			} else {
				return {"width":tw, "days":28};
			}
			break;
		
			default: 
			// 30 days
			w = Math.floor(tw + ((tw/28) * 2));
			return {"width":w, "days":30};
		}
	
	
	};


	/*
	* getDateFromMonthNum
	* Gets a month (1-12) and year from a serial month number
	* @param mn {number} serial month number
	* @return {object} ye, mo (numbers)
	*/
	TG_Date.getDateFromMonthNum = function(mn) {
	
		var rem = 0;
		var ye, mo;
	
		if (mn > 0) {
			rem = mn % 12;
	
			if (rem == 0) { rem = 12 };
	
			mo = rem;
			ye = Math.ceil(mn / 12);
	
		} else {
			// BCE!
			rem = Math.abs(mn) % 12;
			mo = (12 - rem) + 1;
			if (mo == 13) mo = 1;
			// NOYEARZERO problem: here we would subtract
			// a year from the results to eliminate the year 0
			ye =  -1 * Math.ceil(Math.abs(mn) / 12); // -1
	
			}
		
		return {ye:ye, mo:mo};
	};



	/*
	* getMonthWidth
	* Starting with a base-width for a 28-day month, calculate
	* the width for any month with the possibility that it might
	* be a leap-year February.
	*
	* @param mo {number} month i.e. 1 = January, 12 = December
	* @param ye {number} year
	*
	* RELATES TO TICK WIDTH: SPECIFIC TO TIMELINE VIEW
	*/
	TG_Date.getMonthWidth = function(mo,ye,tickWidth) {
	
		var dayWidth = tickWidth / 28;
		var ad;
		var nd = 28;
	
		switch (mo) {
			case 1: case 3: case 5: case 7: case 8: case 10: case 12: ad = 3; break;
			case 4: case 6: case 9: case 11: ad = 2; break;
			// leap year
			case 2: if (TG_Date.isLeapYear(ye) == true) { ad = 1; } else { ad=0; }; break;
		
		}
	
		var width = Math.floor(tickWidth + (dayWidth * ad));
		var days = nd + ad;
	
		return {width:width, numDays:days};
	};




	TG_Date.getToday = function () {
		var d = new Date(); 
		return d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate() + " " + d.getUTCHours() + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds();
	}


  /*
   * Helps calculate the position of a modulo remainder in getRataDie()
   */
  	TG_Date.getMonthFromRemDays = function (dnum, yr) {

	  	var tack = 0;
	  	var rem = 0;
	  	var m = 0;
	
	  	if (TG_Date.isLeapYear(yr)){ tack = 1; } else { tack=0; }
		
	  	if (dnum <= 31) { m = 1; rem = dnum; }
	  	else if ((dnum >31) && (dnum <= 59 + tack)) { m = 2; rem = dnum - (31 + tack); }
	  	else if ((dnum > 59 + tack) && (dnum <= 90 + tack)) { m = 3; rem = dnum - (59 + tack); }
	  	else if ((dnum > 90 + tack) && (dnum <= 120 + tack)) { m = 4; rem = dnum - (90 + tack); }
	  	else if ((dnum > 120 + tack) && (dnum <= 151 + tack)) { m = 5; rem = dnum - (120 + tack); }
	  	else if ((dnum > 151 + tack) && (dnum <= 181 + tack)) { m = 6; rem = dnum - (151 + tack); }
	  	else if ((dnum > 181 + tack) && (dnum <= 212 + tack)) { m = 7; rem = dnum - (181 + tack); }
	  	else if ((dnum > 212 + tack) && (dnum <= 243 + tack)) { m = 8; rem = dnum - (212 + tack); }
	  	else if ((dnum > 243 + tack) && (dnum <= 273 + tack)) { m = 9; rem = dnum - (243 + tack); }
	  	else if ((dnum > 273 + tack) && (dnum <= 304 + tack)) { m = 10; rem = dnum - (273 + tack); }
	  	else if ((dnum > 304 + tack) && (dnum <= 334 + tack)) { m = 11; rem = dnum - (304 + tack); }
	  	else { m = 12; rem = dnum - (334 + tack);  }
	
	  	return {mo:m, da:rem};

  	};





  /*
   GET YYYY.MM.DD FROM (serial) rata die 
  @param snum is the rata die or day serial number
  */
  TG_Date.getDateFromRD = function (snum) {
    
    if (getDateFromRDCache[snum]) {
      return getDateFromRDCache[snum]
    }
    // in case it arrives as an RD-decimal
    var snumAb = Math.floor(snum);

    var bigP = 146097; // constant days in big cal cycle
    var chunk1 = Math.floor(snumAb / bigP);
    var chunk1days = chunk1 * bigP;
    var chunk1yrs = Math.floor(snumAb / bigP) * 400;
    var chunk2days = snumAb - chunk1days;
    var dechunker = chunk2days; 
    var ct = 1;

    var ia = chunk1yrs + 1;
    var iz = ia + 400;

    for (var i = ia; i <= iz; i++) {
    	if (dechunker > 365) {
    		dechunker -= 365;
    		if (TG_Date.isLeapYear(i)) { dechunker -= 1; }
    		ct++;
    	}  else { i = iz; }
    }

  	var yt = chunk1yrs + ct;
	
  	if (dechunker == 0) dechunker = 1;
  	var inf = TG_Date.getMonthFromRemDays(dechunker,yt);
  	// in case...
  	var miLong = (snum - snumAb) * 1440;
  	var mi = Math.floor(miLong % 60);
  	var ho = Math.floor(miLong / 60);
	
  	if ((TG_Date.isLeapYear(yt)) && (inf['mo'] == 2)) {
  		inf['da'] += 1;
  	}

  	var ret = yt + "-" + inf['mo'] + "-" + inf['da'] + " " + ho + ":" + mi + ":00";
	  getDateFromRDCache[snum] = ret;
	  
	  return ret;
	
  }, // end getDateFromRD


  TG_Date.getDateFromSec = function (sec) {
  	// FIRST GET Rata die
  	if (getDateFromSecCache[sec]) {
  	  return getDateFromSecCache[sec]
	  }
	  
	  // the sec/86400 represents a "rd-decimal form"
	  // that will allow extraction of hour, minute, second
  	var ret = TG_Date.getDateFromRD(sec / 86400);
  	
  	getDateFromSecCache[sec] = ret;
  	
  	return ret;
  };


  TG_Date.isLeapYear =  function(y) {
    if (y % 400 == 0) {
      return true;
    } else if (y % 100  == 0){
      return false;
    } else if (y % 4 == 0) {
      return true;
    } else {
      return false;
    }
  };


  /*
  * getRataDie
  * Core "normalizing" function for dates, the serial number day for
  * any date, starting with year 1 (well, zero...), wraps a getBCRataDie()
  * for getting negative year serial days
  *
  * @param dat {object} date object with {ye, mo, da}
  * @return {number} the serial day
  */
  TG_Date.getRataDie = function (dat) {
	  
  	var ye = dat.ye;
  	var mo = dat.mo;
  	var da = dat.da;
  	var ret = 0;
  	
  	if (getRataDieCache[ye + "-" + mo + "-" + da]) {
  	  return getRataDieCache[ye + "-" + mo + "-" + da];
	  }

  if (ye >= 0) { 
  	// THERE IS NO YEAR ZERO!!!
  	if (ye == 0) ye = 1;

  	var fat =  (Math.floor(ye / 400)) * 146097,
  	    remStart = (ye - (ye % 400)),
  	    moreDays = parseInt(getDaysInYearSpan(remStart, ye)),
  	    daysSoFar = parseInt(getDaysSoFar(mo,ye));
	    
  	ret = (fat + moreDays + daysSoFar + da) - 366;
	
  } else if (ye < 0) {
    
  	ret = TG_Date.getBCRataDie({ye:ye, mo:mo, da:da});
  } 

  getRataDieCache[ye + "-" + mo + "-" + da] = ret;
  
  return ret;

  ////// internal RataDie functions
      	/*
      	*  getDaysInYearSpan
      	*  helps calculate chunks of whole years
      	
      	*  @param a {number} initial year in span
      	*  @param z {number} last year in span
      	* 
      	*  @return {number} days in span of arg. years
      	*/
        function getDaysInYearSpan (a, z) {
  
          if (getDaysInYearSpanCache[a + "-" + z]) {
            return getDaysInYearSpanCache[a + "-" + z];
          }
        	var t = 0;

        	for (var i = a; i < z; i++){
        		if (TG_Date.isLeapYear(i)) { t += 366; } else { t += 365; }
        	}
      	
          getDaysInYearSpanCache[a + "-" + z] = t;
        
        	return t;

        };


        function getDaysSoFar (mo,ye) {
        	
        	var d;
	
        	switch (mo) {
        		case 1: d=0;   break; // 31
        		case 2: d=31;  break; // 29
        		case 3: d=59;  break; // 31
        		case 4: d=90;  break; // 30
        		case 5: d=120; break; // 31
        		case 6: d=151; break; // 30
        		case 7: d=181; break; // 31
        		case 8: d=212; break; // 31
        		case 9: d=243; break; // 30
        		case 10: d=273;break; // 31
        		case 11: d=304;break; // 30
        		case 12: d=334;break; // 31
        	}
	
        	if (mo > 2) {
        	   if (TG_Date.isLeapYear(ye)) { d += 1; }
        	}

        	return d;
        };


  };

	TG_Date.monthNamesLet = ["","1","2","3","4","5","6","7","8","9","10","11","12"];

    TG_Date.monthsDayNums = [0,31,28,31,30,31,30,31,31,30,31,30,31,29];
  
    // NON-CULTURE
    TG_Date.units = ["da", "mo", "ye", "de", "ce", "thou", "tenthou", "hundredthou", "mill", "tenmill", "hundredmill", "bill"];
    
    
  /*
  Counts serial days starting with -1 in year -1. Visualize a number counting 
  from "right to left" on top of the other calendrical pieces chunking away
  from "left to right".  But since there's no origin farther back before 0
  we have no choice. 

  @param dat  object with .ye, .mo, .da
  */
  TG_Date.getBCRataDie = function (dat) {

  	var ye = dat.ye,
  	    mo = dat.mo,
  	    da = dat.da;
  	
  	if (getBCRataDieCache[ye + "-" + mo + "-" + da]) {
    	  return getBCRataDieCache[ye + "-" + mo + "-" + da];
  	}

  	if (mo == 0) mo = 1;
  	if (da == 0) da = 1;

  	var absYe = Math.abs(ye);
  	var chunks = [0,335,306,275,245,214,184,153,122,92,61,31,0];
  	var mdays = TG_Date.monthsDayNums[mo];
  	var rawYeDays = (absYe - 1) * 366;
  	var rawMoDays = chunks[mo];
  	var rawDaDays = (mdays - da) + 1;
  	var ret = -1 * (rawYeDays + rawMoDays + rawDaDays);
  	
  	getBCRataDieCache[ye + "-" + mo + "-" + da] = ret;
  	return ret;
  };



  TG_Date.setCulture = function(culture_str) {
    
    var cult = tg.culture = Globalize.culture(culture_str || "default");
     
  	// ["","January", "February", "March", etc];
    TG_Date.monthNames = $.merge([""], cult.calendar.months.names);
    
    // ["","Jan", "Feb", "Mar", etc];
    TG_Date.monthNamesAbbr = $.merge([""], cult.calendar.months.namesAbbr);

    // ["Sunday", "Monday", "Tuesday", etc];
    TG_Date.dayNames = cult.calendar.days.names;
  
    // ["Sun", "Mon", "Tue", etc];
    TG_Date.dayNamesAbbr = cult.calendar.days.namesAbbr;
  
    TG_Date.dayNamesShort = cult.calendar.days.namesShort;
  
    TG_Date.patterns = cult.calendar.patterns;
    
  };



  /*
  *  INSTANCE METHODS  
  *
  */
  TG_Date.prototype = {
      
		format : function (sig, useLimit, tz_off) {
		
			var offset = tz_off || {"hours":0, "minutes":0};
			
			var jsDate, ddlim = "da", fromUTC; // jsDate

			var tgFormatDate = function(fromUTC, display) {
				
				var tgd = timeglider.TG_Date,
					f = "", d = fromUTC, ampm, hopack = {},
					disp = display || "da",
					
					bceYe = function(ye) {
						var  y = parseInt(ye,10);
					
						if (y < 0) {
							return "公元前"+Math.abs(y) +"年" ;
						} else {
							return "公元"+y+"年";
						}
					};
		
				switch (disp) {
				 	
				 	case "no":  return ""; break;
					case "ye": f = bceYe(d.ye); break;
					case "mo": f =  bceYe(d.ye)+tgd.monthNamesAbbr[d.mo] ; break;
					case "da": f = bceYe(d.ye)+tgd.monthNamesAbbr[d.mo] + d.da + "日"; break;
					case "ho": 
						ampm  = "AM";
						hoPack = tgd.twentyFourToTwelve(d);
						
						f = tgd.monthNamesAbbr[d.mo] 
							+ " " + d.da + ", " 
							+ bceYe(d.ye) + " " 
							+ hoPack.ho + ":" + hoPack.mi + " " + hoPack.ampm; 
						break;
				} // end switch
				
				return f;
		
			};
	
			if (useLimit == true) {
			  // reduce to 2 chars for consistency
			  ddlim = this.date_display.substr(0,2);
			  	  
			  switch (ddlim) {
			    case "no": return ""; break;
			    case "ye": sig = "yyyy"; break;
			    case "mo": sig = "MMM yyyy"; break;
			    case "da": sig = "MMM d, yyyy"; break;
			    case "ho": sig = "MMM d, yyyy h:mm tt"; break;
			    
			    default: sig = "f";
			  }
			}
			
			
			var cloner = _.clone(this),
			
				fromUTC = TG_Date.toFromUTC(cloner, offset, "from");  
          	
          		          		
      		if (timeglider.i18n) {
      			// make use of possible other culture via i18n
      			return timeglider.i18n.formatDate(fromUTC, ddlim);
      			
      		} else {
      			// dates before roughly this time do not work in JS
      			if (fromUTC.ye < -270000){
      				return this.ye;
      			} else {
      				
      				// jsDate = new Date(fromUTC.ye, (fromUTC.mo-1), fromUTC.da, fromUTC.ho, fromUTC.mi, fromUTC.se, 0);
      				
      				// return Globalize.format(jsDate, sig);
      				return tgFormatDate(fromUTC, ddlim);
      				
      			}
      		}

		}
		
  	} // end .prototype
  	
  	
  
	TG_Date.getTimeOffset = function(offsetString) {
		
		// remove all but numbers, minus, colon
		var oss = offsetString.replace(/[^-\d:]/gi, ""),
			osA = oss.split(":"),
			ho = parseInt(osA[0], 10),
			mi = parseInt(osA[1], 10),
		
			// minutes negative if hours are 
			sw = (ho < 0) ? -1 : 1,
		
			miDec = sw * ( mi / 60 ),
			dec = (ho + miDec),
			se = dec * 3600;
			
			var ob = {"decimal":dec, "hours":ho, "minutes":mi, "seconds":se, "string":oss};
	
			return ob; 
		
	};	
	
	
	TG_Date.tzOffsetStr = function (datestr, offsetStr) {
		if (datestr) {
		if (datestr.length == 19) {
			datestr += offsetStr;
		} else if (datestr.length == 16) {
			datestr += ":00" + offsetStr;
		}
		return datestr;
		}
	};
	
		
	/*
	* TG_parse8601
	* transforms string into TG Date object
	*/
	TG_Date.parse8601 = function(str){
		
		/*
		len   str
    	4     YyYyYyY
		7     YyYyYyY-MM
		10    YyYyYyY-MM-DD
		13    YyYyYyY-MM-DDTHH (T is optional between day and hour)
		16    YyYyYyY-MM-DD HH:MM
		19    YyYyYyY-MM-DDTHH:MM:SS
		25    YyYyYyY-MM-DD HH:MM:SS-ZH:ZM
		*/
		
		var ye, mo, da, ho, mi, se, bce, bce_ye, tz_pm, tz_ho, tz_mi,
			mo_default = 1,
			da_default = 1,
			ho_default = 0,
			mi_default = 0,
			se_default = 0,
			
			dedash = function (n){
				if (n) {
			 		return parseInt(n.replace("-", ""), 10);
			 	} else {
			 		return 0;
			 	}
			},
			//       YyYyYyY    MM          DD
			reg = VALID_DATE_PATTERN;
			var rx = str.match(reg);

    	// picks up positive OR negative (bce)	
		ye = parseInt(rx[1]);
		
		if (!ye) return {"error":"invalid date; no year provided"};

		mo = dedash(rx[2]) || mo_default;
		da = dedash(rx[3]) || da_default;
		// rx[4] is the "T" or " "
		ho = dedash(rx[4]) || ho_default;
		// rx[6] is ":"
		mi = dedash(rx[5]) || mi_default;
		// rx[8] is ":"
		se = dedash(rx[6]) || se_default;
				
		// if year is < 1 or > 9999, override
		// tz offset, set it to 0/UTC no matter what
		
		// If the offset is negative, we want to make
		// sure that minutes are considered negative along
		// with the hours"-07:00" > {tz_ho:-7; tz_mi:-30}
		tz_pm = rx[7] || "+";
   		tz_ho = parseInt(rx[8], 10) || 0;
		if (tz_pm == "-") {tz_ho = tz_ho * -1;}
		tz_mi = parseInt(rx[9], 10) || 0;
		if (tz_pm == "-") {tz_mi = tz_mi * -1;}
		
	
		return {"ye":ye, "mo":mo, "da":da, "ho":ho, "mi":mi, "se":se, "tz_ho":tz_ho, "tz_mi":tz_mi};
		

	}; // parse8601
	
	
	TG_Date.getLastDayOfMonth = function(ye, mo) {
		var lastDays = [0,31,28,31,30,31,30,31,31,30,31,30,31],
			da = 0;
		if (mo == 2 && TG_Date.isLeapYear(ye) == true) {
			da = 29;
		} else {
			da = lastDays[mo];
		}
		return da;
		
	}; 
	
	/* 
	* getDateTimeStrings
	*
	* @param str {String} ISO8601 date string
	* @return {Object} date, time as strings with am or pm
	*/
	TG_Date.getDateTimeStrings = function (str) {
		
		var obj = TG_Date.parse8601(str);
	
		if (str == "today" || str == "now") {
			return {"date": str, "time":""}
		} else {
			var date_val = obj.ye + "-" + unboil(obj.mo) + "-" + unboil(obj.da);
		}
				
		var ampm = "pm";
		
		if (obj.ho >= 12) {
			if (obj.ho > 12) obj.ho -= 12;
			ampm = "pm";
		} else {
			if (obj.ho == 0) { obj.ho = "12"; }
			ampm = "am";
		}
	
		var time_val = boil(obj.ho) + ":" + unboil(obj.mi) + " " + ampm;
		
		return {"date": date_val, "time":time_val}
	};
	
	
	// This is for a separate date input field --- YYYY-MM-DD (DATE ONLY)
	// field needs to be restricted by the $.alphanumeric plugin
	TG_Date.transValidateDateString = function (date_str) {
		
		if (date_str == "today" || date_str == "now"){
			return date_str;
		}
		
		if (!date_str) return false; // date needs some value
		
		var reg = /^(\-?\d+|today|now) ?(bce?)?-?(\d{1,2})?-?(\d{1,2})?/,
			valid = "",
			match = date_str.match(reg),
			zb = TG_Date.zeroButt;
			
		if (match) {
			// now: 9999-09-09
			// today: get today
			
			// translate
			var ye = match[1],
				bc = match[2] || "",
				mo = match[3] || "07",
				da = match[4] || "1";
			
			if (parseInt(ye, 10) < 0 || bc.substr(0,1) == "b") {
				ye = -1 * (Math.abs(ye));
			}
			
			if (TG_Date.validateDate(ye, mo, da)) {
				return ye + "-" + zb(mo) + "-" + zb(da);
			} else {
				return false;
			}
		
			
		} else {
			return false;
		}
	};
	
	// This is for a separate TIME input field: 12:30 pm
	// field needs to be restricted by the $.alphanumeric plugin
	TG_Date.transValidateTimeString = function (time_str) {
		
		if (!time_str) return "12:00:00";
		
		var reg = /^(\d{1,2}|noon):?(\d{1,2})?:?(\d{1,2})? ?(am|pm)?/i,
			match = time_str.toLowerCase().match(reg),
			valid = "",
			zb = TG_Date.zeroButt;
		
		if (match[1]) {

			// translate
			if (match[0] == "noon") {
				valid = "12:00:00"
			} else {
				// HH MM
				var ho = parseInt(match[1], 10) || 12;
				var mi = parseInt(match[2], 10) || 0;
				var se = parseInt(match[3], 10) || 0;
				var ampm = match[4] || "am";
				
				if (TG_Date.validateTime(ho, mi, se) == false) return false;
				
				if (ampm == "pm" && ho < 12) {
					ho += 12;
				} else if (ampm == "am" && ho ==12){
					ho = 0;
				} 
				
				valid = zb(ho) + ":" + zb(mi) + ":" + zb(se);
			}
		} else {
			valid = false;
		}
		
		return valid;
	};
	
	
	// make sure hours and minutes are valid numbers
	TG_Date.validateTime = function (ho, mi, se) {
		if ((ho < 0 || ho > 23) || (mi < 0 || mi > 59) || (se < 0 || se > 59)) { return false; }
		return true;
	};
	
	
  	/*
  	* validateDate
  	* Rejects dates like "2001-13-32" and such
  	*
  	*/
  	TG_Date.validateDate = function (ye, mo, da) {
  		
  		// this takes care of leap year
  		var ld = TG_Date.getMonthDays(mo, ye);

  		if ((da > ld) || (da <= 0)) { return false; } 
  		// invalid month numbers
  		if ((mo > 12) || (mo < 0)) { return false; }
  		// there's no year "0"
  		if (ye == 0) { return false; }
  		
  		return true;
  	};
      	
      	
	// make sure hours and minutes are valid numbers
	TG_Date.zeroButt = function (n) {
		
		var num = parseInt(n, 10);
		if (num > 9) {
			return String(num);
		} else {
			return "0" + num;
		}
	}
		

	/*
	* toFromUTC
	* transforms TG_Date object to be either in UTC (GMT!) or in non-UTC
	*
	* @param ob: {Object} date object including ye, mo, da, etc
	* @param offset: {Object} eg: hours, minutes {Number} x 2
	* @param toFrom: either "to" UTC or "from"
	*
	* with offsets made clear. Used for formatting dates at all times
	* since all event dates are stored in UTC
	*
	* @ return {Object} returns SIMPLE DATE OBJECT: not a full TG_Date instance
	*                   since we don't want the overhead of calculating .rd etc.
	*/		
	TG_Date.toFromUTC = function (ob, offset, toFrom) {
				
		var nh_dec = 0,
			lastDays = [0,31,28,31,30,31,30,31,31,30,31,30,31,29],
			
			deltaFloatToHM = function (flt){
				var fl = Math.abs(flt),
					h = Math.floor(fl),
					dec = fl - h,
					m = Math.round(dec * 60);
				
				return {"ho":h, "mi":m, "se":0};
			},
			delta = {};
						
		// Offset is the "timezone setting" on the timeline,
		// or the timezone to which to translate from UTC
		if (toFrom == "from") {
			delta.ho = -1 * offset.hours;
			delta.mi = -1 * offset.minutes;
		} else if (toFrom == "to"){
			delta.ho = offset.hours;
			delta.mi = offset.minutes;
		} else {
			delta.ho = -1 * ob.tz_ho;
			delta.mi = -1 * ob.tz_mi;
		}
	
		
		// no change, man!
		if (delta.ho == 0 && delta.mi ==0) {
			return ob; 
		}	
		
		// decimal overage or underage after adding offset
		var ho_delta = (ob.ho + (ob.mi / 60)) + ((-1 * delta.ho) + ((delta.mi * -1) / 60));
				
		// FWD OR BACK ?
		if (ho_delta < 0) {
			// go back a day
			nh_dec = 24 + ho_delta;
		
			if (ob.da > 1) {
				ob.da = ob.da - 1;
			} else { 
				// day is 1....
				if (ob.mo == 1) {
					// & month is JAN, go back to DEC
					ob.ye = ob.ye - 1; ob.mo = 12; ob.da = 31;
				} else { 
					ob.mo = ob.mo-1;
					// now that we know month, what is the last day number?
					ob.da = TG_Date.getLastDayOfMonth(ob.ye, ob.mo)
				}
			}
			
		} else if (ho_delta >= 24) {
			// going fwd a day
			nh_dec = ho_delta - 24;			

			if (TG_Date.isLeapYear(ob.ye) && ob.mo == 2 && ob.da==28){
				ob.da = 29;
			} else if (ob.da == lastDays[ob.mo]) {
				if (ob.mo == 12) {
					ob.ye = ob.ye + 1;
					ob.mo = 1;
				} else {
					ob.mo = ob.mo + 1;
				}
				ob.da = 1;
			} else {
				ob.da = ob.da + 1;
			}

		} else {
			nh_dec = ho_delta;
		}
		// delta did not take us from one day to another
		// only adjust the hour and minute
		var hm = deltaFloatToHM(nh_dec);
			ob.ho = hm.ho;
			ob.mi = hm.mi; 
			
		if (!offset) {
			ob.tz_ho = 0;
			ob.tz_mi = 0;
		} else {
			ob.tz_ho = offset.tz_ho;
			ob.tz_mi = offset.tz_mi;
		}
		
				
		////// 
		// return ob;
		var retob = {ye:ob.ye, mo:ob.mo, da:ob.da, ho:ob.ho, mi:ob.mi, se:ob.se};
		
		return retob;
		
		
	}; // toFromUTC
	
	
	/*
	 * TGSecToUnixSec
	 * translates Timeglider seconds to unix-usable
	 * SECONDS. Multiply by 1000 to get unix milliseconds
	 * for JS dates, etc.
	 *
	 * @return {Number} SECONDS (not milliseconds)
	 *
	 */
	TG_Date.TGSecToUnixSec = function(tg_sec) {
		// 62135686740
		return tg_sec - (62135686740 - 24867);
	};
	
	
	TG_Date.JSDateToISODateString = function (d){  
  		var pad = function(n){return n<10 ? '0'+n : n}  
  		return d.getUTCFullYear()+'-'  
	      + pad(d.getUTCMonth()+1)+'-'  
	      + pad(d.getUTCDate())+' '  
	      + pad(d.getUTCHours())+':'  
	      + pad(d.getUTCMinutes())+':'  
	      + pad(d.getUTCSeconds());  
	};
	
	
	
	TG_Date.timezones = [
	    {"offset": "-12:00", "name": "Int'l Date Line West"},
	    {"offset": "-11:00", "name": "Bering & Nome"},
	    {"offset": "-10:00", "name": "Alaska-Hawaii Standard Time"},
	    {"offset": "-10:00", "name": "U.S. Hawaiian Standard Time"},
	    {"offset": "-10:00", "name": "U.S. Central Alaska Time"},
	    {"offset": "-09:00", "name": "U.S. Yukon Standard Time"},
	    {"offset": "-08:00", "name": "U.S. Pacific Standard Time"},
	    {"offset": "-07:00", "name": "U.S. Mountain Standard Time"},
	    {"offset": "-07:00", "name": "U.S. Pacific Daylight Time"},
	    {"offset": "-06:00", "name": "U.S. Central Standard Time"},
	    {"offset": "-06:00", "name": "U.S. Mountain Daylight Time"},
	    {"offset": "-05:00", "name": "U.S. Eastern Standard Time"},
	    {"offset": "-05:00", "name": "U.S. Central Daylight Time"},
	    {"offset": "-04:00", "name": "U.S. Atlantic Standard Time"},
	    {"offset": "-04:00", "name": "U.S. Eastern Daylight Time"},
	    {"offset": "-03:30", "name": "Newfoundland Standard Time"},
	    {"offset": "-03:00", "name": "Brazil Standard Time"},
	    {"offset": "-03:00", "name": "Atlantic Daylight Time"},
	    {"offset": "-03:00", "name": "Greenland Standard Time"},
	    {"offset": "-02:00", "name": "Azores Time"},
	    {"offset": "-01:00", "name": "West Africa Time"},
	    {"offset": "00:00", "name": "Greenwich Mean Time/UTC"},
	    {"offset": "00:00", "name": "Western European Time"},
	    {"offset": "01:00", "name": "Central European Time"},
	    {"offset": "01:00", "name": "Middle European Time"},
	    {"offset": "01:00", "name": "British Summer Time"},
	    {"offset": "01:00", "name": "Middle European Winter Time"},
	    {"offset": "01:00", "name": "Swedish Winter Time"},
	    {"offset": "01:00", "name": "French Winter Time"},
	    {"offset": "02:00", "name": "Eastean EU"},
	    {"offset": "02:00", "name": "USSR-zone1"},
	    {"offset": "02:00", "name": "Middle European Summer Time"},
	    {"offset": "02:00", "name": "French Summer Time"},
	    {"offset": "03:00", "name": "Baghdad Time"},
	    {"offset": "03:00", "name": "USSR-zone2"},
	    {"offset": "03:30", "name": "Iran"},
	    {"offset": "04:00", "name": "USSR-zone3"},
	    {"offset": "05:00", "name": "USSR-zone4"},
	    {"offset": "05:30", "name": "Indian Standard Time"},
	    {"offset": "06:00", "name": "USSR-zone5"},
	    {"offset": "06:30", "name": "North Sumatra Time"},
	    {"offset": "07:00", "name": "USSR-zone6"},
	    {"offset": "07:00", "name": "West Australian Standard Time"},
	    {"offset": "07:30", "name": "Java"},
	    {"offset": "08:00", "name": "China & Hong Kong"},
	    {"offset": "08:00", "name": "USSR-zone7"},
	    {"offset": "08:00", "name": "West Australian Daylight Time"},
	    {"offset": "09:00", "name": "Japan"},
	    {"offset": "09:00", "name": "Korea"},
	    {"offset": "09:00", "name": "USSR-zone8"},
	    {"offset": "09:30", "name": "South Australian Standard Time"},
	    {"offset": "09:30", "name": "Central Australian Standard Time"},
	    {"offset": "10:00", "name": "Guam Standard Time"},
	    {"offset": "10:00", "name": "USSR-zone9"},
	    {"offset": "10:00", "name": "East Australian Standard Time"},
	    {"offset": "10:30", "name": "Central Australian Daylight Time"},
	    {"offset": "10:30", "name": "South Australian Daylight Time"},
	    {"offset": "11:00", "name": "USSR-zone10"},
	    {"offset": "11:00", "name": "East Australian Daylight Time"},
	    {"offset": "12:00", "name": "New Zealand Standard Time"},
	    {"offset": "12:00", "name": "Int'l Date Line East"},
	    {"offset": "13:00", "name": "New Zealand Daylight Time"}
	];



        /*
        * boil
        * basic wrapper for parseInt to clean leading zeros,
        * as in dates
        */
      	function boil (n) {
      		return parseInt(n, 10);
      	}; TG_Date.boil = boil;
      	
      	function unboil (n) {
      		var no = parseInt(n, 10);
      		if (no > 9 || no < 0) {
      			return String(n);
      		} else {
      			return "0" + no;
      		}
      	}; TG_Date.unboil = unboil;


      	function getSec (fd) {
      		      		
      		var daSec = Math.abs(fd.rd) * 86400;
      		var hoSec = (fd.ho) * 3600;
      		var miSec = (fd.mi - 1) * 60;
      		var bc = (fd.rd > 0) ? 1 : -1;
      		var ret = bc * (daSec + hoSec + miSec);
      		
      		return ret;
      	};


  
        /* getMoNum
        *
        * @param mo {Number} month from 1 to 12
        * @param ye {Number} straight year
        *
        */ 
        function getMoNum (ob) {
        	    if (ob.ye > 0) {
        			return  ((ob.ye -1) * 12) + ob.mo;
        		} else {
        			return getMoNumBC(ob.mo, ob.ye);
        		}
        };




        /*
        * getMoNumBC
        * In BC time, serial numbers for months are going backward
        * starting with December of 1 bce. So, a month that is actually
        * "month 12 of year -1" is actually just -1, and November of 
        * year 1 bce is -2. Capiche!?
        *
        * @param {object} ob ---> .ye (year)  .mo (month)
        * @return {number} serial month number (negative in this case)
        */
        function getMoNumBC (mo, ye) {
        	var absYe = Math.abs(ye);
        	var n = ((absYe - 1) * 12) + (12-(mo -1));
        	return -1 * n;
        };
        


		function show(ob){
			return ob.ye + "-" + ob.mo + "-" + ob.da + " " + ob.ho + ":" + ob.mi;
		}
		

  
})(timeglider);


/*
 * Timeglider for Javascript / jQuery 
 * http://timeglider.com/jquery
 *
 * Copyright 2011, Mnemograph LLC
 * Licensed under Timeglider Dual License
 * http://timeglider.com/jquery/?p=license
 *
 */
 
 /*
  * Version 2 of TG_Org has a "global" check of
  * event-block position, rather than checking
  * against a tree of levels... 
  
  THIS IS THE LAST VERSION OF BOTTOM-UP LAYOUTS
  BY DEFAULT
   
  */

(function(tg){

  // standard "brick" height for placement grid
  var lev_ht = tg.levelHeight = 12,
      // number of available levels for events
      $ = jQuery,
      ceiling_padding = 30,
      topdown_pad = 30,
      bottomup_pad = -8;
      

	  /*
	  *  @constructor
	  */
	  tg.TG_Org = function() {
	  
	  	var me = this;
	    var icon_f = tg.icon_folder;
	
	    this.blocks = [];
	    this.ids = [];
	    this.vis = [];
	    this.pol = -1;
	    this.placedBlocks = [];
	    this.freshBlocks = [];
	       
	   
		/*
		* ******** PUBLIC METHODS **********
		*/
	  
	    
	    /*
	    * TG_Org.addBlock
	    * Adds a 2D geometric block object, corresponding to an event
	    * into the "borg" layout.
	    * 
	    * @param {object} evob Event object including position values: left, width, top, height
	                           -- no need for right and bottom
	    * @param {string/number} tickScope This either "sweep" or the serial of a single tick (Number)
	    * 
	    */
	    this.addBlock = function (evob, tickScope) {
			evob.right = evob.left + evob.width;
			evob.bottom = evob.top + evob.height;
			evob.tickScope = tickScope;
			me.freshBlocks.push(evob);
			me.blocks.push(evob);
	    };
	    
	    
	    /*
	     *
	     */
	    this.clearFresh = function () {
	    	me.freshBlocks = [];
	    }
	    
	    
	    /*
	    * TG_Org.getBorg
	    *
	    * @return {object} This particular "borg" object with its blocks, etc
	    * 
	    */
	    this.getBorg = function () {
	      return this;
	    };
	
	
	    /*
	    * TG_Org.getBlocks
	    * 
	    * @return {array} An array of placement blocks (objects), each corresponding
	    *                 to an event on the timeline.
	    * 
	    */
	    this.getBlocks = function () {
	      return this.blocks;
	    };
	
	
	    /*
	    * TG_Org.getHTML
	    * inside of args (args.tickScope, etc)
	    * 	@param tickScope {string|number} This either "sweep" or the serial of a single tick (Number)
	    * 	@param ceiling {number} The max height of the timeline display, after which a "+" appears
	    * 	@param onZoom {boolean} is the timeline at its preferred/initial zoom?
	    *
	    * @return {string} HTML with events passed back to view for actual layout of timeline
	    */
	    this.getHTML = function (args) {
	    	
	    	var tickScope = args.tickScope;
	    	var ceiling = args.ceiling;
	    	var laneTops = args.laneTops;
	      	this.onIZoom = args.onIZoom;
	      	      
			if (tickScope == "sweep") { 
				this.vis = [];
			}
			
			if (args.inverted) {
				// top down
				this.pol = 1;
			} else {
				// bottom up
				this.pol = -1;
			}
		
			this.freshBlocks.sort(sortBlocksByImportance);
			// cycle through events and move overlapping event up
		
			var positioned = [], 
				blHeight, 
				lastPos, 
				span_selector_class, 
				span_div, 
				img = '', 
				icon = '',
				html = '', 
				top_or_bottom_padding_from_title = 0,
				b = {},
				blength = this.freshBlocks.length,
				b_span_color = "",
				title_adj = 0,
				highest = 0,
				img_scale = 100,
				img_style = "",
				css_class = "",
				p_icon = "",
				p_overf = "",
				image_class = "lane",
				selected_class = "",
				lane_class = "",
				polarity_cond = "",
				in_lane = false,
				lane_sp_title = "";
			
		
			for (var i=0; i<blength; i++) {
			
		  		b = this.freshBlocks[i];
				title_adj = 0;
				img_scale = 100;
				img_style = "";
				selected_class = "";
				lane_class = "";
				in_lane = false;
				
				
		    	// full sweep or just a tick added left or right
				if (b.tickScope == tickScope) {
					
					// is it not yet visible?
					if (_.indexOf(this.vis, b.id) == -1) {
		
						// it's not in the "visible" array, so add it
						this.vis.push(b.id);
						
						// if it's got static HTML in it
						if (b.html && b.html.substr(0,4) == "<div") {
			            	// only positions interior html at proper left position!
							html += ("<div style='position:relative; left:" + b.left + "px' " +
			                      "id='" + b.id + "'>" + b.html + "</div>");
			              
						} else {      
			            	
			            	// if it has an image, it's either in "layout" mode (out on timeline full size)
			            	// or it's going to be thumbnailed into the "bar"
							if (b.image) {
							
							
								image_class = b.image.display_class;
								
								
								if (b.shape && image_class == "inline") {
									img_style = " style='width:" + b.shape.img_wi + "px;height:auto;top:-" + b.shape.img_ht + "px'";
								} else {
									img_style = "";
								}
	
															 
									
								title_adj = 0; // b.shape.img_ht + 4;
								
								
								// different image classes ("bar", "above") are positioned
								// using a separate $.each routine in TimelineView rather than
								// being given absolute positioning here.
								img = "<div data-max_height='" + b.image.max_height + "' class='timeglider-event-image-" + image_class + "'><img src='" + b.image.src + "' " + img_style + "></div>";
								
								
							} else {
								// no image
								img = "";
							} 

			      		    highest = ceiling - ceiling_padding;
			      		   
				           	// debug.log("laneTops:", laneTops);
				           	
				           	
							if (this.onIZoom && b.y_position > 0) {
								// absolute positioning
								b.top = me.pol * b.y_position;
	
							} else if ( typeof laneTops[b.lane] == "number" && typeof b.lane == "string") {						
								try {
								// debug.log("b.lane in org:", b.lane, laneTops[b.lane]);
								b.top = me.pol * laneTops[b.lane];
								// debug.log("btop:", b.top);
								in_lane = true;
								lane_class = " lane-event";
								} catch (err) {
									debug.log("err:", err);
								}
								
							} else {
								// starts out checking block against the bottom layer
								//!RECURSIVE
								// *** alters the `b` block object
								b.attempts = 0;
								checkAgainstPlaced(b, highest);
								
							}
							
													
							// note: divs that are higher have lower "top" values
							// `ceiling` being set at 0 (event_overflow set to "scroll") 
							// may require/allow for event scrolling possibilities...
							
							if (me.pol == -1) {
								polarity_cond = (ceiling && (Math.abs(b.top) > highest));
							} else {
								polarity_cond = (ceiling && (Math.abs(b.top + 30) > highest));
							}
							
							
							if (polarity_cond){
								
								p_overf = (me.pol == -1) ? "top:-" + (ceiling-10) + "px": "top:" + ceiling + "px"
								
								var white_cir = "<img src='" + icon_f + "shapes/circle_white.png'>";
								p_icon = (b.icon) ? "<img src='" + icon_f + b.icon + "'>": white_cir;
								
							 	// + + + symbols in place of events just under ceiling
							 	// if things are higher than the ceiling, show plus signs instead,
							 	// and we'll zoom in with these.
								html += "<div id='" + b.id + "' class='timeglider-timeline-event tg-event-overflow' style='left:" + b.left  + "px;" + p_overf + "'>" + p_icon + "</div>";
							        
							} else {
							
								
								
								if (b.fontsize > 2) {
								
									b_span_color = (b.span_color) ? ";background-color:" + b.span_color: "";
								
									b.fontsize < 10 ? b.opacity = b.fontsize / 10 : b.opacity=1;
									
									if (b.selected) {
										selected_class = "selected";
									}
								
									if (b.span == true) {
										span_selector_class = "timeglider-event-spanning";
										// add seconds into span data in case calculations
										// are in demand in DOM
										// if it's a lane span... 
										lane_sp_title = in_lane ? "<span>" + b.title + "</span>": "";
										
										span_div = "<div data-starts='" + b.startdateObj.sec + "' data-ends='" + b.enddateObj.sec + "' class='timeglider-event-spanner' style='top:" + "px;height:" + b.fontsize + "px;width:" + b.spanwidth + "px" + b_span_color + "'>" + lane_sp_title + "</div>";
										
									} else {
										span_selector_class = ""; 
										span_div = "";
									}
				
									if (b.icon) {
									  icon = "<img class='timeglider-event-icon' src='" + icon_f + b.icon + "' style='height:" + b.fontsize + "px;left:-" + (b.fontsize + 2) + "px; top:" + title_adj + "px'>";
									} else {
									  icon = '';
									}
								 
									// pad inverted (polarity 1) events to exceed the height
									// of the timeline title bar; pad "normal" top-up events
									// to have some space between them and the title bar
									if(!in_lane) {
									top_or_bottom_padding_from_title = (me.pol === 1) ?
										topdown_pad : bottomup_pad;
									}
									
									// possible customized class
									css_class = b.css_class || '';
								 
									// TODO: function for getting "standard" event shit
									html += "<div class='timeglider-timeline-event " 
										+ css_class + " " + span_selector_class + lane_class
										+ " " + selected_class 
										+ "' id='" + b.id + "' "
										+ "style='width:" + b.width  + "px;"
										+ "height:" + b.height + "px;"
										+ "left:" + b.left  + "px;" 
										+ "opacity:" + b.opacity + ";"
										+ "top:" + (b.top + top_or_bottom_padding_from_title) + "px;"
										+ "font-size:" + b.fontsize  + "px;'>"
										+ icon + img + span_div;
										
										if (!lane_sp_title) {
											html += "<div class='timeglider-event-title' style='top:" + title_adj + "px'>" + b.title + "</div>";
										}
										html += "</div>";
								
								} // endif fontsize is > 2
							
							} // end if/else :: height > ceiling
		
						} // end if it's got valid HTML
		
					} // end check for visible... EXPENSIVE!!!!
					
				} // end tickScope check
				
			} // end for()
	
		
		return {"html":html};
	
	
		}; /// end getHTML
	
	
	
	
	
	  /// PRIVATE STUFF ///
	     
	   /**
	   * sortBlocksByImportance
	   * Sorter helper for sorting events by importance
	   * @param a {Number} 1st sort number
	   * @param b {Number} 2nd sort number
	   */
	   var sortBlocksByImportance = function (a, b) {
	      var x = b.importance, 
	      	  y = a.importance;
	      
	      if (a.image && b.image){
	      	return -1;
	      }
	      
	      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	  };
	  
	  
	  
	
		/**
		* isOverlapping
		* Takes two objects and sees if the prospect overlaps with
		* an existing object [part of loop in checkAgainstPlaced()]
		*
		* @param {object} b1 Timeline-event object IN PLACE
		* @param {object} b2 Timeline-event object BEING ADDED
		*/       
		var isOverlapping = function (b1, b2) {
	      
	      //!TODO ******* POLARITY IS NOT WORKED INTO THIS YET
	      
	      	if (b2.shape) {
	      		var io = isOverlapping(b1, b2.shape);
	      		if (io == true) {
	      			return true;
	      		}
	      	}
			
			var vPadding = -6,
				lPadding = -16;
			
			if ((b2.left + lPadding > b1.right) || (b2.right < b1.left + lPadding) || (b2.bottom < b1.top + vPadding)) {
				// clear to left or right.
				return false;
			
			} else {
			
				if (  
					((b2.left >= b1.left) && (b2.left <= b1.right)) ||
					((b2.right >= b1.left) && (b2.right <= b1.right)) ||
					((b2.right >= b1.right) && (b2.left <= b1.left)) ||
					((b2.right <= b1.right) && (b2.left >= b1.left))
			    ) {
			
				  	// OK, some kind of left-right overlap is happening, but
				  	// there also has to be top-bottom overlap for collision
					if (
		          		// 
		          		((b2.bottom <= b1.bottom) && (b2.bottom >= b1.top)) || 
		          		((b2.top <= b1.bottom) && (b2.top >= b1.top)) || 
		          		((b2.bottom == b1.bottom) && (b2.top == b1.top))
		          	  ) {
			    		// passes 2nd test -- it's overlapping!
			    		return true;
			
			  		} else {
			    		return false;
					}
					
			  	// end first big if: fails initial test
				}  
			return false;
			}
	
	      // return false;
	
	    };
	
	
		// private function
		var checkAgainstPlaced = function (block, ceil) {
	       	
			var ol = false, 
	
				placed = me.placedBlocks,
				placed_len = me.placedBlocks.length,
				
				collision = false;
			
			if ((placed_len == 0) || (Math.abs(block.top) > ceil)) {
	        	// just place it!
	        	collision = false;
	        	
	        } else {
			
				// Go through all the placed blocks
				for (var e=0; e < placed_len; e++) {
					
					sh = false;
					ol = isOverlapping(placed[e],block);
					
					if (block.shape) {
						sh = isOverlapping(placed[e],block.shape);
					}
					
					if (ol == true || sh == true) {
						// BUMP UP
						if (me.pol === -1) {
							// DEFAULT, bottom up
							block.top -= lev_ht; 
							block.bottom -= lev_ht;
							if (block.shape) {
								block.shape.top -= lev_ht; 
								block.shape.bottom -= lev_ht;
							}
						} else {
							// "SOUTH" side, top town
							block.top += lev_ht; 
							block.bottom += lev_ht;
							if (block.shape) {
								block.shape.top += lev_ht; 
								block.shape.bottom += lev_ht;
							} 
						}
						
											
						// *** RECURSIVE ***
						block.attempts++;
						
						
						// ......aaaaaand then check again
						checkAgainstPlaced(block, ceil);
				
						collision = true;
						
						// STOP LOOP -- there's a collision
						break;
					} // end if overlap is true
					
				} // end for
			}
	
			if (collision == false) {
	            
	            me.placedBlocks.push(block);               	
				
				if (block.shape) {
					me.placedBlocks.push(block.shape);   
				}
			} // end if collision is false
	        
		}; // end checkAgainstPlaced()
	 
	 
	}; ///// END TG_Org


	
	/* TG_OrgList is a mobile-friendly list-style layout 
	   to run in lieu of the typical timeline layout;
	   still in development!
	*/
	  tg.TG_OrgList = function(events, med) {
	  
	  	var me = this;
	    var icon_f = tg.icon_folder;
	
	    this.blocks = events;
	    this.ids = [];
	    
	    this.mediator = med;
	       
	   
		/*
		* ******** PUBLIC METHODS **********
		*/

	    /*
	    * TG_OrgList.getHTML
	    * no args: just straight list of all events in a timeline...
	    *
	    * @return {string} HTML with events passed back to view for actual layout of timeline
	    */
	    this.getHTML = function () {
	    
			var positioned = [], 
				span_selector_class, 
				span_div, 
				img = '', 
				icon = '',
				html = '', 
				more = '',
				desc = '',
				datef = '',
				elip = '',
				b = {},
				stripdesc = '',
				blength = this.blocks.length,
	
				img_scale = 100,
				css_class = "",
				p_icon = "";
			
		
			for (var i=0; i<blength; i++) {
			
		  		b = this.blocks[i];
	
				img_scale = 100;
	
				if (b.image) {
				
					// different image classes ("bar", "above") are positioned
					// using a separate $.each routine in TimelineView rather than
					// being given absolute positioning here.
					img = "<div class='tg-event-list-img'><img src='" + b.image.src + "'></div>";
					
					
				} else {
					// no image
					img = "";
				} 
					
				b_span_color = (b.span_color) ? ";background-color:" + b.span_color: "";
			
				b.fontsize < 10 ? b.opacity = b.fontsize / 10 : b.opacity=1;
			
				if (b.span == true) {
					span_selector_class = "timeglider-event-spanning";
					// add seconds into span data in case calculations
					// are in demand in DOM
					
				} else {
					span_selector_class = ""; 
					
				}
	
				if (b.icon) {
				  icon_img = "<img src='" + icon_f + b.icon + "'>";
				} else {
				  icon_img = '';
				}
				
				icon = "<div class='tg-event-list-icon'>" + icon_img + "&nbsp;</div>"
				
				// possible customized class
				css_class = b.css_class || '';
				
				if (b.description || img) {
					more = "<img src='timeglider/img/mobile_more.png'>";
				} else {
					more = "";
				}
				
				if (b.description) {
					// strip tags to we have no half baked html in blurb
					stripdesc = b.description.replace(/(<([^>]+)>)/ig,"");
					elip = (stripdesc.length>110) ? "...":"";
					desc = "<div class='tg-list-blurb'>" + stripdesc.substr(0,110) + elip + "</div>";
				} else {
					desc = "";
				}
				
				
				datef = b.startdateObj.format('', true, this.mediator.timeOffset);
			 
				// TODO: function for getting "standard" event shit
				html += "<li class='tg-list-li timeglider-timeline-event clearfix" 
					+ css_class + " " + span_selector_class 
					+ "' id='" + b.id + "'>"
					+ "<div class='tg-list-dateline timeglider-dateline-startdate'>" + datef + "</div>"
					+ img + icon 
					+ "<div class='timeglider-event-title'>" 
					+ b.title
					
					+ "</div>"
					+ desc + "</li>";
								
	
				
			} // end for()
	
		
		return {"html":html};
	
	
		}; /// end getHTML
	
	
	 
	 
	}; ///// END TG_OrgList



      
      
	
})(timeglider);	
/*
 * Timeglider for Javascript / jQuery 
 * http://timeglider.com/jquery
 *
 * Copyright 2011, Mnemograph LLC
 * Licensed under Timeglider Dual License
 * http://timeglider.com/jquery/?p=license
 *
 */



/*
*
* Timeline
* Backbone Model
*
*/

(function(tg){

	
	var TG_Date = tg.TG_Date,
		$ = jQuery,
		widget_options = {},
		tg_units = TG_Date.units,
		MED,
		
		non_id = 0;


	tg.TG_EventCollection = Backbone.Collection.extend({
			
		eventHash:{},
		
		comparator: function(ev) {
			return ev.get("startdateObj").sec;
		},

		setTimelineHash: function(timeline_id, hash) {
			this.eventHash[timeline_id] = hash;
		},
		
		getTimelineHash: function(timeline_id, hash) {
			return this.eventHash[timeline_id];
		},
		
		model: tg.TG_Event
	});
	
	
	
	tg.adjustAllTitleWidths = function (collection) {
		
		_.each(collection.models, function(ev) {
			var nw = tg.getStringWidth(ev.get("title"));
			ev.set({"titleWidth":nw})
		})
	};
  
	
	
	
	// map model onto larger timeglider namespace
	/////////////////////////////////////////////
	tg.TG_Event = Backbone.Model.extend({
	
		urlRoot : '/event',
	
		defaults: {
			"title":  "Untitled",
			"selected":false,
			"css_class":''
		},
		
		initialize: function(ev) {
			// Images start out being given a default width and height
			// of 0, so that we can "find out for ourselves" what the
			// size is.... pretty costly, though...
			// can this be done better with PHP?
			
			if (!ev.id) {
				
				ev.id = "ev_" + non_id++;
			}
			if (ev.image) {
				var img = ev.image;
				
				if (typeof img == "string") {
				
					var display_class = ev.image_class || "lane";
					var image_scale = ev.image_scale || 100;
					var image_width = ev.image_width || 0;
					var image_height = ev.image_height || 0;

					ev.image = {id: ev.id, scale:image_scale, src:ev.image, display_class:display_class, width:image_width, height:image_height};
					
					
				} else {
					// id, src etc already set
					ev.image.display_class = ev.image.display_class || "lane";
					ev.image.width = 0;
					ev.image.height = 0;
					ev.image.scale = ev.image.scale || 100;
					
					
				}

				// this will follow up with reporting size in separate "thread"
				this.getEventImageSize(ev.image, ev);
			
				// MED.imagesToSize++;
				
	
			} else {
				ev.image = '';
			}
			
			// further urldecoding?
			// by replacing the &amp; with & we actually
			// preserve HTML entities 	
			ev.title = ev.title.replace(/&amp;/g, "&");
			ev.description = ev.description || "";
			ev.titleWidth = tg.getStringWidth(ev.title);
			
			ev.y_position = ev.y_position || 0;
			
			
			
			

			this.set(ev);
			
		},
	
				
		
		getEventImageSize:function(img, ev) { 
			
			var that = this,
				imgTesting = new Image(),
				img_src = imgTesting.src = img.src;
		
			imgTesting.onerror= delegatr(imgTesting, function () {
				if (tg.app && typeof tg.app.reportMissingImage == "function") {
					tg.app.reportMissingImage(img.src, ev);
				}
				that.set({"image":{src:img.src,status:"missing"}});
			});
			
			imgTesting.onload = delegatr(imgTesting, function () {
				that.get("image").height = this.height;
				that.get("image").width = this.width;
				that.get("image").max_height = this.height;
			});
		
			function delegatr(contextObject, delegateMethod) {
				return function() {
					return delegateMethod.apply(contextObject, arguments);
				}
			};
	
		}, // end getEventImageSize
		
		
		reIndex: function(do_delete) {
		
		  	var model = this,
		  		deleting = do_delete || false,
		  		cache = model.get("cache"),
		  		event_id = model.get("id"),
		  		new_start = model.get("startdateObj"),
		  		new_end = model.get("enddateObj"),
		  		ev_timelines = model.get("timelines"),
		  		ev_timeline_cache = cache.timelines,
		  		cache_start = cache.startdateObj || new_start,
		  		span = cache.span,
		  		timeline = {}, 
		  		hash = {},
		  		ser = 0, new_ser = 0,		
		  		arr = [],
		  		tl_union = _.union(ev_timeline_cache, ev_timelines),
		  		TG_Date = tg.TG_Date,
		  		MED = model.get("mediator"),
		  		TIMELINES = MED.timelineCollection,
		  		EVENTS = MED.eventCollection;
		  	
		 
		  	// cycle through all event's past/present timelines
		  	// OUTER .each
		  	_.each(tl_union, function(timeline_id){ 
				
		  		timeline = TIMELINES.get(timeline_id);
		  		
		  		hash = EVENTS.getTimelineHash(timeline_id); 
					
		  		// remove from "all" array (used for bounds)
				hash["all"] = _.reject(hash["all"], function(eid){ 
					// truthy is rejected!!
					return eid == event_id;
				});
			
		  		
		  		// UNITS: "da", "mo", "ye", "de", "ce", "thou", "tenthou", 
		  		//        "hundredthou", "mill", "tenmill", "hundredmill", "bill"
		  		// INNER .each
		  		_.each(TG_Date.units, function(unit) {
		  		
					ser = TG_Date.getTimeUnitSerial(cache_start, unit);
					
					// REMOVE CACHED DATE INDICES FROM HASH 	
					// ALL TIMELINES ARE CLEARED		
					if (hash[unit][ser] !== undefined) {
						hash[unit][ser] = _.reject(hash[unit][ser], function(eid){ 
							// truthy is rejected!
							return eid == event_id;
						});
					} 
					
					// RE-INDEX IN EVENT'S CURRENT TIMELINES ARRAY!!
					if (deleting != true) {
						if ($.inArray(timeline_id, ev_timelines) != -1) {
							new_ser = TG_Date.getTimeUnitSerial(new_start, unit);
							if (hash[unit][new_ser] !== undefined) {
								hash[unit][new_ser].push(event_id);
							} else {
								// create the array
								hash[unit][new_ser] = [event_id];
							}
						}
					} // end if not deleting
								
		  		}); // end inner _.each
		  		
		  		
		  		if (deleting != true) {
			  		if ($.inArray(timeline_id, ev_timelines) != -1) {
			  			hash["all"].push(event_id);
			  		}
		  		}
		  		
		  		
		  		// REFRESH BOUNDS: CYCLE THROUGH HASH'S "all" INDEX
		  		// INCLUDE ALL IN UNIONED TIMELINES
		  		var bounds = timeline.get("bounds");
		  		
		  		var spill = [];
		  		
		  		_.each(hash["all"], function (id) {
		  			var ev = EVENTS.get(id);
		  			spill.push(ev.get("startdateObj").sec);
		  			spill.push(ev.get("enddateObj").sec);
		  		});
		  		
		  		// does it have any events
					
				// totally new set of bounds!
		   		timeline.set({bounds:{first:_.min(spill), last:_.max(spill)}});
		
		  		var timeline_spans = timeline.get("spans");
				
				// WIPE OUT OLD SPAN REF NO MATTER WHAT
		  		if (cache.span) {
		  			delete timeline_spans["s_" + event_id];
		  		} 
		  		
		  		// RE/LIST SPAN
		  		if (deleting != true) {
			  		if (model.get("span") == true) {
			  			timeline_spans["s_" + event_id] = {id:event_id, start:new_start.sec, end:new_end.sec};
			  		}
			  			
			  	} 
			  	
			  	// make sure timeline "has_events" is accurate
			  	timeline.set({has_events:hash["all"].length});
		  	
		  	}); // end outer/first _.each, cycling across timelines cached/new
  	  	
  		
		}	

	
	});

	
	
	
	// map model onto larger timeglider namespace
	/////////////////////////////////////////////
	tg.TG_Timeline = Backbone.Model.extend({
	
		urlRoot : '/timeline',
		
		defaults: {
			// no other defaults?
			"initial_zoom":25,
			"timezone":"00:00",
			"title":  "Untitled",
			"with_events":true,
			"events": [],
			"legend": [],
			"tags":{}
		},
		
		// processes init model data, adds certain calculated values
		_chewTimeline : function (tdata) {
					
			// TODO ==> add additional units
			MED = tdata.mediator;
			tdata.timeline_id = tdata.id;		
			widget_options = MED.options;
			
			this.anonEventId = 0;
						
			var dhash = {
				"all":[],
				"da":[], 
				"mo":[], 
				"ye":[], 
				"de":[], 
				"ce":[], 
				"thou":[],
				"tenthou":[],
				"hundredthou":[],
				"mill":[],
				"tenmill":[],
				"hundredmill":[],
				"bill":[]
			};
			
			tdata.spans = {};
			tdata.hasImageLane = false;
			tdata.startSeconds = [];
			tdata.endSeconds = [];
			tdata.initial_zoom = parseInt(tdata.initial_zoom, 10) || 25;
			tdata.inverted = tdata.inverted || false;
	
			// render possible adjective/numeral strings to numeral
			tdata.size_importance = (tdata.size_importance == "false" || tdata.size_importance == "0")? 0 : 1;
			tdata.is_public = (tdata.is_public == "false" || tdata.is_public == "0")? 0 : 1;
			
			// widget options timezone default is "00:00";
			var tzoff = tdata.timezone || "00:00";
			
			tdata.timeOffset = TG_Date.getTimeOffset(tzoff);
						
			// TODO: VALIDATE COLOR, centralize default color(options?)
			if (!tdata.color) { tdata.color = "#333333"; }			

			if (tdata.events.length>0 && !tdata.preload) {
				
				var date, ddisp, ev, id, unit, ser, tWidth;
				var l = tdata.events.length;
	
				for(var ei=0; ei< l; ei++) {
				
					ev=tdata.events[ei];
					
					ev.css_class = ev.css_class || "";
					
					// make sure it has an id!
					if (ev.id) { 
						id = ev.id 
					} else { 
						// if lacking an id, we'll make one...
						ev.id = id = "anon" + this.anonEventId++; 
					}

					ev.importance = parseInt(ev.importance, 10) + widget_options.boost;
					ev.low_threshold = ev.low_threshold || 1;
					ev.high_threshold = ev.high_threshold || 100;
					
					/*
				 		We do some pre-processing ** INCLUDING HASHING THE EVENT *
				 		BEFORE putting the event into it's Model&Collection because some 
				 		(processed) event attributes are needed at the timeline level
					*/
			
					if (ev.map) {
						if (MED.main_map) {
							
							if (timeglider.mapping.ready){
								ev.map.marker_instance = timeglider.mapping.addAddMarkerToMap(ev, MED.main_map);
								// debug.log("marker_instance", ev.map.marker_instance);
							}
							// requires TG_Mapping.js component
							
						} else {
							// debug.log("NO MAIN MAP... BUT LOAD MAPS FOR MODAL");
							// load instance of maps for modal viewing
							// requires: TG_Mapping.js
							tg.googleMapsLoad();
						}
					}
					
					
					ev.callbacks = ev.callbacks || {};
					
					
					if (typeof ev.date_display == "object") {
						ddisp = "da";
					} else {
						// date_limit is allowed old JSON prop name,
						// replaced by date_display
						ddisp = ev.date_display || ev.date_limit || "da";
					}

					ev.date_display = ddisp.toLowerCase().substr(0,2);

					if (ev.link) {
						if (typeof ev.link == "string" && ev.link.substr(0,4) == "http") {
							// make an array
							ev.link = [{"url":ev.link, "label":"link"}]
						}
					} else {
						ev.link = "";
					}

					ev.date_display = ddisp.toLowerCase().substr(0,2);

					// if a timezone offset is set on the timeline, adjust
					// any events that do not have the timezone set on them
					ev.keepCurrent = 0; // not a perpetual now startdate
					
					if (ev.startdate.substr(0,10) == "7777-12-31" 
						|| ev.startdate.substr(0,10)  == "8888-12-31"
						|| ev.startdate == "now" 
						|| ev.startdate == "today") {
						// PERPETUAL NOW EVENT
						ev.startdate = TG_Date.getToday();
						
						// 7777-12-31 and "now" behave the same
						if (ev.startdate == "now" || ev.startdate == "8888-12-31") {
							ev.keepCurrent += 1;
							ev.css_class += " ongoing";
						}
					}
					
					ev.zPerp = "0"; // not a perpetual now enddate
					if (typeof ev.enddate == "string" && (ev.enddate.substr(0,10) == "7777-12-31"
						|| ev.enddate.substr(0,10) == "8888-12-31" 
						|| ev.enddate == "now" 
						|| ev.enddate == "today")) {			
						ev.enddate = TG_Date.getToday();
						
						// 7777-12-31 and "now" behave the same
						if (ev.enddate == "now" || ev.enddate == "8888-12-31") {
							ev.keepCurrent += 2;
							ev.css_class += " ongoing";
						}
					}
					// if keepCurrent == 1 only start
					// if keepCurrent == 2 only end
					// if keepCurrent == 3  both start and end are "now"
					
					if (tdata.timeOffset.seconds) {
						ev.startdate = TG_Date.tzOffsetStr(ev.startdate, tdata.timeOffset.string);
						
						if (ev.enddate) {
						ev.enddate = TG_Date.tzOffsetStr(ev.enddate, tdata.timeOffset.string);
						}
					}
					
					ev.startdateObj = new TG_Date(ev.startdate, ev.date_display);
					
					// !TODO: only if they're valid!
					if ((ev.enddate) && (ev.enddate !== ev.startdate)){
						ev.enddateObj = new TG_Date(ev.enddate, ev.date_display);
						ev.span=true;
						// index it rather than push to stack
						
						tdata.spans["s_" + ev.id] = {id:ev.id, start:ev.startdateObj.sec, end:ev.enddateObj.sec};
						
					} else {
						ev.enddateObj = ev.startdateObj;
						ev.span = false;
					}
					
					
					// haven't parsed the image/image_class business...
					if (ev.image) {
						if (ev.image.display_class != "inline") { 
							tdata.hasImageLane = true; 
						}
					}
										
					tdata.startSeconds.push(ev.startdateObj.sec);
					tdata.endSeconds.push(ev.enddateObj.sec);

					// cache the initial date for updating hash later
					// important for edit/delete operations
					ev.cache = {timelines:[tdata.timeline_id], span:ev.span, startdateObj:_.clone(ev.startdateObj), enddateObj:_.clone(ev.enddateObj)}
										
					if (!ev.icon || ev.icon === "none") {
						ev.icon = "";
					}  else {
						ev.icon = ev.icon;
					}
					
					
					if ((!isNaN(ev.startdateObj.sec))&&(!isNaN(ev.enddateObj.sec))){
									
						dhash["all"].push(id);
						
						var uxl = tg_units.length;
						for (var ux = 0; ux < uxl; ux++) {
							unit = tg_units[ux];
							///// DATE HASHING in action 
							ser = TG_Date.getTimeUnitSerial(ev.startdateObj, unit);
							if (dhash[unit][ser] !== undefined) {
								var shash = dhash[unit][ser];
								if (_.indexOf(shash, id) === -1) {
									dhash[unit][ser].push(id);
								}
							} else {
								// create the array
								dhash[unit][ser] = [id];
							}
							/////////////////////////////
						} 
						
						ev.mediator = MED;
			
						/////////////////////////////////
						
						if (!MED.eventCollection.get(id)) {
						
							ev.timelines = [tdata.timeline_id];
						
							var new_model = new tg.TG_Event(ev);
							// model is defined in the eventCollection
							// we just need to add the raw object here and it
							// is "vivified", properties set, etc
							MED.eventCollection.add(new_model);
						
						} else {
							
							// trusting here that this is a true duplicate!
							// just needs to be associated with the timeline
							var existing_model = MED.eventCollection.get(id);
							existing_model.get("timelines").push(tdata.timeline_id);
	
						}
						
						
					
					} // end if !NaN
					
					
			
				} // end for: cycling through timeline's events
							
				// cycle through timeline, collecting start, end arrays
				// sort start, select first
				// sor last select last
				// set bounds
								
				var merged = $.merge(tdata.startSeconds,tdata.endSeconds);
				var sorted = _.sortBy(merged, function(g){ return parseInt(g); });

				/// bounds of timeline
				tdata.bounds = {"first": _.first(sorted), "last":_.last(sorted) };
				
				var date_from_sec = TG_Date.getDateFromSec(tdata.bounds.first);
				tdata.focus_date = tdata.focus_date || date_from_sec;
				tdata.focusDateObj = new TG_Date(tdata.focus_date);
				tdata.has_events = 1;
				
			} else {
			
				tdata.tags = tdata.tags || {"test":1};
				tdata.focus_date = tdata.focus_date || "today";				
				tdata.focusDateObj = new TG_Date(tdata.focus_date);
				tdata.bounds = {"first": tdata.focusDateObj.sec, "last":tdata.focusDateObj.sec + 86400};
				tdata.has_events = 0;
				
			}
			
			/* !TODO: necessary to parse this now, or just leave as is? */
			if (tdata.legend.length > 0) {
				//var legend = tdata.legend;
				//for (var i=0; i<legend.length; i++) {
				//	var legend_item = legend[i];
					// debug.log("leg. title:" + legend_item['title'])
				//}
				tdata.hasLegend = true;
			} else {
				tdata.hasLegend = false;
			}
			
			if (tdata.lanes && tdata.lanes.length > 0) {
				tdata.hasLanes = true;
				tdata.useLanes = true;
			} else {
				tdata.hasLanes = false;
				tdata.useLanes = false;
			}
			
			
			
			/// i.e. expanded or compressed...
			/// ought to be attribute at the timeline level
			/// TODO: create a $.merge for defaults for a timeline
			tdata.display = "expanded";
			
			
			MED.eventCollection.setTimelineHash(tdata.timeline_id, dhash);
			
			// keeping events in eventCollection
			// hashing references to evnet IDs inside the date hash
			delete tdata.events;

			return tdata;
		
		},
		
		
		initialize: function(attrs) { 
			var processed = this._chewTimeline(attrs);
			
			this.set(processed);
			
			this.bind("change", function() {
  				// debug.log("changola");
			});
		}
	
	});
	

})(timeglider);
















/*
 * Timeglider for Javascript / jQuery
 * http://timeglider.com/jquery
 *
 * Copyright 2013, Mnemograph LLC
 * Licensed under Timeglider Dual License
 * http://timeglider.com/jquery/?p=license
 *
 */


/*
****************************************
timeglider.TimelineView
****************************************
*/
(function(tg) {

    // MED below is a reference to the mediator reference
    // that will be passed into the main Constructor below

    var TG_Date = tg.TG_Date,
        PL = "",
        MED = "",
        options = {},
        ticksSpeed = 0,
        t1Left = 0,
        t2Left = 0,
        ticksSpeedIv,
        container_name = '',
        $ = jQuery,
        intervals = {},
        WIDGET_ID = "",
        CONTAINER, TICKS, DATE, FOCUS_DATE,
        CLICKORTOUCH = $.support.touch ? "touchstart" : "click";

    var stripPx = function(somethingPx) {
        if (typeof somethingPx == "number") return somethingPx;
        if (!somethingPx) return 0;
        return parseInt(somethingPx.replace("px", ""), 10);
    }

    /*
     *  timeglider.TG_TimelineView
     *  This is _not_ a backbone view, though
     *  other elements inside of it are.
     *
     *
     */
    tg.TG_TimelinePlayer = function(widget, mediator) {

        var me = this;

        // this.MED = mediator;

        // vars declared in closure above
        MED = mediator;

        // timeline | list
        MED.viewMode = "timeline";

        options = mediator.options;

        // core identifier to "uniquify" the container
        PL = "#" + widget._id;

        WIDGET_ID = widget._id;
        container_name = options.base_namespace + "#" + WIDGET_ID;

        this.titleBar = true;
        this.singleTitleHeight = 0;

        MED.setImageLaneHeight(options.image_lane_height, false, true);


        /*  references specific to the instance (rather than timeglider) so
        	one can have more than one instance of the widget on a page */
        this._views = {
            PLACE: PL,
            CONTAINER: PL + " .timeglider-container",
            SCRIM: PL + " .tg-scrim",
            DATE: PL + " .tg-footer-center",
            HEADER: PL + " .tg-widget-header",
            FOCUS_DATE: PL + " .tg-date-display",
            TIMELINE_MENU: PL + " .timeglider-timeline-menu",
            TIMELINE_MENU_UL: PL + " .timeglider-timeline-menu ul",
            TIMELINE_LIST_BT: PL + " .timeglider-list-bt",
            SLIDER_CONTAINER: PL + " .timeglider-slider-container",
            SLIDER: PL + " .timeglider-slider",
            ZOOM_DISPLAY: PL + " .timeglider-zoomlevel-display",
            TRUCK: PL + " .timeglider-truck",
            CENTERLINE: PL + " .timeglider-centerline",
            TICKS: PL + " .timeglider-ticks",
            HANDLE: PL + " .timeglider-handle",
            FOOTER: PL + " .timeglider-footer",
            FILTER_BT: PL + " .timeglider-filter-bt",
            FILTER_BOX: PL + " .timeglider-filter-box",
            SETTINGS_BT: PL + " .timeglider-settings-bt"
        }

        // shorthand for common elements
        CONTAINER = this._views.CONTAINER;
        TICKS = this._views.TICKS;

        this.dragSpeed = 0;
        this.tickNum = 0;
        this.leftside = 0;
        this.rightside = 0;
        this.ticksHandleOffset = 0;
        this.timeoout_id = 1;
        this.sliderActive = false;
        this.ztop = 1000;
        this.filterBoxActivated = false;


        // this needs to be less than or equal to
        // timeglider.css value for .timeglider-tick
        // height property
        this.tick_height = 32;


        // a state var for the left-right position of the timeline
        // to help track whether the timeline is too far left/right
        // DEPRECATED 12 March 2013
        // in favor of draggable containment array
        //this.dragScopeState = {state:"okay",pos:0};


        /*  TEMPLATES FOR THINGS LIKE MODAL WINDOWS
         *   events themselves are non-templated and rendered in TG_Org.js
         *   as there are too many on-the-fly style attributes etc, and
         *   the current theory is that templating would create lag
         *
         *
         */
        // in case custom event_modal fails, we need this object to exist
        this._templates = {}

        this._templates = {
            // allows for customized templates imported
            test: "testola",

            event_modal_small: "<div class='tg-modal timeglider-ev-modal ui-widget-content ${extra_class}' id='${id}_modal'>" +
                "<div class='tg-close-button tg-close-button-remove'></div>" +
                "<div class='dateline'>{{html dateline}}</div>" +
                "<h4 id='title'>${title}</h4>" +
                "<div class='tg-ev-modal-description jscroll'><p>{{html image}}{{html description}}</p></div>" +
                "<ul class='timeglider-ev-modal-links'>{{html links}}</ul>" +
                "</div>",

            // For displaying an exterior page directly in the modal
            event_modal_iframe: "<div class='tg-modal timeglider-ev-modal ui-widget-content tg-iframe-modal' id='${id}_modal'>" +
                "<div class='tg-close-button tg-close-button-remove'></div>" +
                "<div class='dateline'>{{html dateline}}</div>" +
                "<h4 id='title'>{{html title}}</h4>" +
                "<iframe frameborder='none' src='${link}'></iframe>" +
                "</div>",

            // generated, appended on the fly, then removed
            event_modal_full: $.template(null,
                ////////
                "<div class='tg-modal tg-full_modal' id='ev_${id}_modal'>" +
                "<div class='tg-full_modal_scrim'></div>" +
                "<div class='tg-full_modal_panel'>" +
                "<div class='tg-close-button tg-full_modal_close'></div>" +
                "<div class='tg-full_modal_content'>"

                +
                "<div class='dateline'>{{html dateline}}</div>" +
                "<h4>${title}</h4><div class='tg-full_modal-vidimg'>{{html image}}</div>" +
                "<div class='tg-full_modal-body'>" +
                "{{html description}}"
                // + "<div id='insert'></div>"
                +
                "</div>" +
                "<div class='tg-full_modal-links'><ul>{{html links}}</ul></div>"
                // end of modal
                +
                "</div>"),


            // generated, appended on the fly, then removed
            filter_modal: $.template(null,
                "<div class='tg-modal timeglider-filter-box'>" +
                "<div class='tg-close-button'></div>" +
                "<h3 style='font-weight:bold;font-family:serif;height: 25px;'>关键字查找:</h3>" +
                "<div class='timeglider-menu-modal-content'>" +
                "<div class='timeglider-formline'>" +
                "<input placeholder='请输入关键字' type='text' class='timeglider-filter-search' style='margin-bottom: auto;'></div>" +
                "<div class='tg-filter-cbs' style='text-align: center;'>" +
                "<label for='filter_t' class='checkbox inline' >标题<input type='checkbox' id='filter_t' checked></label>" +
                "&nbsp;&nbsp;&nbsp;<label for='filter_d' class='checkbox inline'>简介<input type='checkbox' id='filter_d'></label>" +
                "</div>" +
                // "<div class='timeglider-formline filter-tags'>"+
                // "<input type='text' id='filter-tags' class='timeglider-filter-tags'>"+
                // "</div>"+
                // "<div class='timeglider-formline'>hide: "+
                // "<input type='text' class='timeglider-filter-exclude'></div>"+
                "<ul class='buttons unstyled' style='text-align: justify;margin-top:4px;display:flex;justify-content:center;align-items:center'>" +
                "&nbsp;<li class='timeglider-filter-apply btn btn-primary' style='color: white; text-align: center;width: 40px;background-color: #357ebd;'>确定</li>" +
                "&nbsp;&nbsp;&nbsp;<li class='timeglider-filter-clear btn' style='color: white; text-align: center;width: 40px;background-color: #357ebd;'>清除</li>" +
                "</ul></div>" +
                "<div class='tg-modal-corner tg-modal-corner-south'>" +
                "</div>"),

            timeline_list_modal: $.template(null,
                "<div class='tg-modal timeglider-timeline-menu'>" +
                "<div class='tg-close-button'></div>" +
                "<h3>历史事件类型：</h3>" +
                "<div class='timeglider-menu-modal-content'><ul></ul></div>" +
                "<div class='tg-modal-corner tg-modal-corner-south'>" +
                "</div>"),

            settings_modal: $.template(null,
                "<div class='tg-modal timeglider-settings-modal'>" +
                "<div class='tg-close-button'></div>" +
                // "<h3>设置</h3>"+
                "<div class='timeglider-menu-modal-content'>" +
                "<div class='timeglider-settings-timezone'></div></div>" +
                "<div class='tg-modal-corner tg-modal-corner-south'>" +
                "</div>"),

            legend_modal: $.template(null,
                "<div class='timeglider-menu-modal tg-legend tg-display-none'  id='${id}'>" +
                "<div class='tg-close-button-small tg-legend-close'></div>" +
                "<div class='timeglider-menu-modal-content'><ul id='${id}'>{{html legend_list}}</ul>" +

                "<div class='tg-legend-controls'><span class='tg-legend-all'>all</span><span class='tg-legend-none'> | none</span></div>" +
                "</div>" +
                "</div>")

        };



        this.timelineInfoModal = Backbone.View.extend({

            tagName: "div",

            model: tg.TG_Timeline,

            className: 'tg-modal tg-timeline-modal ui-widget-content hidden-phone',

            events: {
                "click .tg-close": "remove",
                "click .tg-timeline-start": "timelineStart",
                "click .tg-modal-tags": "openTagsInfo"
            },
            // "tags":{"mardigras":2,"chris":2,"arizona":2,"netscape":2,"flop":1},
            template: function() {

                var tags1 = "",
                    tags_intro = "",
                    tags2 = "",
                    thtm = [];

                var tl_tags = this.model.get("tags");
                // if tags
                if (_.size(tl_tags) > 0) {
                    tags1 = "<li class='tg-modal-tags'></li>";

                    _.each(tl_tags, function(val, key) {
                        thtm.push(key + " (" + val + ")");
                    });

                    tags_intro = "<p class='tags-intro'>使用查找工具（右下角）根据标题和简介中关键字来查找事件</p>";

                    tags2 = "<div class='tg-modal-tags-info'>" + tags_intro + thtm.join(", ") + "</div>"
                }
                return "<h4>${title}</h4>" +
                    "<div class='tg-close tg-close-button'></div>" +
                    "<div class='tg-timeline-description jscroll'>{{html description}}</div>" +
                    "<ul>" + tags1 + "<li data-timeline_id='" + this.model.get("id") + "' class='tg-timeline-start'>开始</li></ul>" + tags2 +
                    "<div class='tg-modal-corner tg-modal-corner-north'></div>";

            },

            openTagsInfo: function() {
                var $ti = $(this.el).find(".tg-modal-tags-info");

                if (!$ti.is(":visible")) {
                    $(this.el).find(".tg-modal-tags-info").slideDown();
                } else {
                    $(this.el).find(".tg-modal-tags-info").slideUp();
                }
            },

            timelineStart: function() {

                MED.focusTimeline(this.model.get("id"));
                this.remove();
            },

            initialize: function() {
                // this.model.bind('change', this.render, this);
            },

            render: function() {
                $(this.el).html($.tmpl(this.template(), this.model.attributes)).attr("id", this.model.get("id") + "_timelineInfoModal");
                return this;
            },

            remove: function() {
                $(this.el).fadeOut();
            }
        });




        this.presInfoModal = Backbone.View.extend({

            tagName: "div",

            model: tg.TG_Timeline,

            className: 'tg-modal tg-timeline-modal tg-pres-modal ui-widget-content hidden-phone',

            events: {
                "click .tg-close": "remove",
                "click .tg-pres-start": "presStart"
            },

            template: function() {

                return "<div class='tg-timeline-description jscroll'>{{html description}}</div>" +
                    "<ul><li class='tg-close'><span style='color:#fff'>关闭</sapn></li><li class='tg-pres-start'>开始</li></ul>" +
                    "<div class='tg-modal-corner tg-modal-corner-north'></div>";

            },

            presStart: function() {
                var pres = MED.presentation;
                MED.gotoDateZoom(pres.focus_date.dateStr, pres.initial_zoom);
            },

            render: function() {
                $(this.el).html($.tmpl(this.template(), this.model)).attr("id", "presInfoModal");
                return this;
            },

            remove: function() {
                $(this.el).remove();
            }
        });




        this.datepicker = Backbone.View.extend({

            tagName: "div",

            className: 'tg-modal tg-datepicker',

            events: {
                "click .tg-close-button": "remove",
                "click .goto-save": "gotoDate",
                "keydown .dateinput": "doKeydown"
            },

            template: function() {

                var focus = MED.getFocusDate();
                var val = focus.dateStr.split(" ")[0];

                return "<div class='tg-close-button'></div>" +
                    "<h3>请输入日期:</h3>" +
                    "<div class='timeglider-menu-modal-content'>" +
                    "<div class='tg-dtinput-wrap' id='goto-wrap' style='display: flex;justify-content: center;align-items: center;'> " +
                    "<input class='mousetrap dateinput ' type='text' id='goto' style='border-radius:3px ;' value='" + val + "'>" +
                    "<div class='cal_icon'></div>" +
                    "<div class='goto-save save button' id='goto-go'>确定</div>" +
                    "</div>" +
                    "</div>";

            },

            doKeydown: function(e) {
                switch (e.which) {
                    case 0:
                    case 9:
                    case 13:
                        this.gotoDate();
                        break;
                }
            },

            gotoDate: function() {
                var date_str = $(this.el).find("input.dateinput").val();
                MED.gotoDateZoom(date_str);
                this.remove();
            },

            render: function() {
                $(this.el).html($.tmpl(this.template(), this.model)).attr("id", "datepickerModal");

                $(this.el).find("#goto-wrap").timegliderDatePicker({
                    is_touch_device: false,
                    position: {
                        my: "left bottom",
                        at: "left top",
                        // skip instance; it will be defined by datePicker
                        collision: "none"
                    }
                });

                return this;
            },

            remove: function() {
                // $(this.el).fadeOut();
                $(this.el).remove();
                me.datepickerOpen = false;
            }
        });



        $(CONTAINER)
            .delegate(".timeline-info-bt", CLICKORTOUCH, function() {
                var id = $(this).data("timeline_id");
                me.timelineModal(id);
            })
            .delegate(".tg-expcol-bt", CLICKORTOUCH, function() {
                var id = $(this).data("timeline_id");
                me.expandCollapseTimeline(id);
            })
            .delegate(".tg-invert-bt", CLICKORTOUCH, function() {
                var id = $(this).data("timeline_id");
                me.invertTimeline(id);
            })
            .delegate(".tg-legend-bt", CLICKORTOUCH, function() {
                var id = $(this).data("timeline_id");
                me.legendModal(id);
            })
            .delegate(".tg-close-button-remove", CLICKORTOUCH, function() {
                $(this).parent().remove()
            })
            .delegate(".tg-full_modal_scrim, .tg-full_modal_close", CLICKORTOUCH, function() {
                $(".tg-full_modal").remove();
            })
            .delegate(".tg-event-overflow", CLICKORTOUCH, function() {
                MED.zoom(-1);
            })
            .delegate(".tg-event-overflow", "hover", function(e) {

                // var evid = $(this).data("event_id");


                //!TODO
                // take id and focus to it, then zoom in until it's
                // visible: then highlight and fade out highlight
            })


        .delegate(".tg-legend-close", CLICKORTOUCH, function() {
            var $legend = $(CONTAINER + " .tg-legend");
            $legend.fadeOut(300, function() { $legend.remove(); });

            MED.setFilters({ origin: "legend", icon: "all" }, []);
        })


        .delegate(".tg-legend-all", CLICKORTOUCH, function() {

            var $panel = $(this).closest(".tg-legend");

            var panel_id = $panel.attr("id");
            var icons = [];

            if (panel_id == "pres" || timeglider.mode == "presentation") {
                var pres_legend = MED.presentation.legend;
                icons = _.pluck(pres_legend, "icon");

            } else {
                var tl = MED.timelineCollection.get(panel_id);
                icons = _.pluck(tl.get("legend"), "icon");
            }

            if (options.legend.type === "checkboxes") {
                MED.setFilters({ origin: "legend", icon: "provided" }, icons);

                $(CONTAINER + " .tg-legend li").each(function() {
                    $(this).addClass("tg-legend-icon-selected");
                });

            } else {
                MED.setFilters({ origin: "legend", icon: "all" });

                $(CONTAINER + " .tg-legend li").each(function() {
                    $(this).removeClass("tg-legend-icon-selected");
                });
            }
        })


        // optional none button
        .delegate(".tg-legend-none", CLICKORTOUCH, function() {
            $(CONTAINER + " .tg-legend li").each(function() {
                $(this).removeClass("tg-legend-icon-selected");
            });

            MED.setFilters({ origin: "legend", icon: "none" });
        })


        .delegate(".tg-timeline-start", CLICKORTOUCH, function() {
                var tid = $(this).data("timeline_id");
                MED.focusTimeline(tid);
            })
            .delegate(".tg-prev", CLICKORTOUCH, function() {
                MED.gotoPreviousEvent(true);
            })
            .delegate(".tg-next", CLICKORTOUCH, function() {
                MED.gotoNextEvent(true);
            })
            .delegate(".timeglider-tick", CLICKORTOUCH, function(e) {
                var loc = MED.getDateFromOffset(e.pageX);
                MED.gotoDateZoom(loc.dateStr);
            })
            .delegate(".tg-pres-start", CLICKORTOUCH, function() {
                me.startPresentation();
            })
            .delegate(".pres-info-bt", CLICKORTOUCH, function() {
                me.presentationModal();
            })
            .delegate(".tg-pres-header h2", CLICKORTOUCH, function() {
                var tid = $(this).data("timeline_id");
                if (tid == "primary") {
                    me.startPresentation();
                    me.presentationModal();
                } else {
                    alert("Drill baby, drill!");
                }
            })
            .delegate(".tg-title-prev-events", CLICKORTOUCH, function() {
                MED.gotoPreviousEvent(true);
            })
            .delegate(".tg-title-next-events", CLICKORTOUCH, function() {
                MED.gotoNextEvent(true);
            })



        .css("height", $(PL).height());
        // END CONTAINER CHAIN


        $(".tg-zoom-in").bind(CLICKORTOUCH, function() {
            MED.zoom(-1);
        });


        $(".tg-zoom-out").bind(CLICKORTOUCH, function() {
            MED.zoom(1);
        });

        $(this._views.FOCUS_DATE).bind(CLICKORTOUCH, function() {
            me.datepickerModal();

        });



        $(window).resize(_.throttle(function() {
            MED.resize();
        }, 700));

        // if we have a loading icon, for intermediate data loads, inject
        if (options.loading_icon) {
            $(CONTAINER).find(".tg-loading-icon").html(options.loading_icon);
        }


        MED.base_font_size = options.base_font_size;

        if (options.show_footer == false) {
            $(this._views.FOOTER).css("display", "none");
        }

        this.dimensions = MED.dimensions = this.getWidgetDimensions();


        // distance from bottom of container (not vertically from ticks)
        // for timelines to be by default; but if a timeline has a "top" value,
        // it's position will be set according to that
        this.initTimelineVOffset = this.dimensions.container.height - (this.dimensions.footer.height + this.dimensions.tick.height + 18);


        // INITIAL CONSTRUCTION
        this.buildSlider();

        this.setupScroller();

        this.setPanButton($(".timeglider-pan-right"), -30);
        this.setPanButton($(".timeglider-pan-left"), 30);

        $(this._views.TRUCK)

        // doubleclicking will be used by authoring mode
        .bind('dblclick', function(e) {
            MED.registerUIEvent({ name: "dblclick", event: e });
        })


        .bind('mousewheel', function(event, delta) {

            var vec = (delta < 0) ? Math.floor(delta) : Math.ceil(delta);
            var dir = -1 * vec;
            MED.mousewheelChange(dir);

            if (options.mousewheel !== "none") {
                // prevent default browser scrolling
                return false;
            }
        }); // end TRUCK EVENTS


        function registerTicksSpeed() {
            //!TODO: for gliding
        }



        $(TICKS)
            .draggable({
                axis: 'x',

                start: function(event, ui) {
                    me.eventUnHover();
                },

                // will be overridden later
                containment: [-20000, 0, 20000, 0],

                cancel: ".tg-modal",

                drag: function(event, ui) {

                    t1Left = Math.floor($(this).position().left);

                    MED.setTicksOffset(t1Left);

                    ticksSpeed = t1Left - t2Left;

                    t2Left = t1Left;

                    return true;

                },

                stop: function(event, ui) {

                    me.resetTicksHandle();
                    me.registerDragging();
                    me.registerTitles();

                }

            })

        .delegate(".timeglider-timeline-event", CLICKORTOUCH, function() {

            var $ev = $(this);

            me.eventUnHover($ev);

            var eid = $ev.attr("id");
            var ev = MED.eventCollection.get(eid).attributes;

            if (timeglider.mode == "authoring") {
                // authoring will have its own handler


                // "presentation" mode or
                // "basic" mode
            } else {
                // custom callback for an event

                if (ev.drilldown) {

                    MED.drilldown(ev);

                } else if (ev.click_callback) {

                    try {

                        var ccarr = ev.click_callback.split(".");
                        var cclen = ccarr.length;
                        var ret_val = true;

                        if (cclen == 1) {
                            // window.fn
                            ret_val = window[ccarr[0]](ev);
                        } else if (cclen == 2) {
                            // namespace.fn
                            ret_val = window[ccarr[0]][ccarr[1]](ev);
                        } else if (cclen == 3) {
                            // namespace.name.fn
                            ret_val = window[ccarr[0]][ccarr[1]][ccarr[2]](ev);
                        }

                        if (ret_val !== false) {
                            me.eventModal(eid, $ev);
                        }

                    } catch (e) {
                        debug.log(ev.click_callback + " method cannot be found", e);
                    }

                    // no custom callback just regular old modal
                } else {

                    var follow = true;

                    if (typeof MED.options.eventClick == "function") {
                        follow = MED.options.eventClick($ev, ev, this);
                    }

                    if (follow) me.eventModal(eid, $ev);
                }

            } // end if/else for authoring

        })

        .delegate(".timeglider-timeline-event", "mouseover", function() {
                me.eventUnHover();
                var ev = MED.eventCollection.get($(this).attr("id")).attributes;
                me.eventHover($(this), ev);
            })
            .delegate(".timeglider-timeline-event", "mouseout", function() {

                var ev = MED.eventCollection.get($(this).attr("id")).attributes;
                me.eventUnHover($(this));
            })

        .delegate(".tg-event-collapsed", "hover", function() {

            // var title = MED.eventCollection.get($(this).attr("id")).attributes.title;
            // debug.trace("collapsed, title:" + title, "note");

        });
        // END TICKS CHAIN!!


        // TODO: make function displayCenterline()
        // TODO: simply append a centerline template rather than .css'ing it!
        me.resizeElements();


        /* PUB-SUB "LISTENERS" SUBSCRIBERS */

        $.subscribe(container_name + ".mediator.ticksOffsetChange", function() {

            me.tickHangies();
            me.registerDragging();
            me.registerTitles();

        });

        $.subscribe(container_name + ".viewer.rendered", function() {

            // change scroller

        });


        $.subscribe(container_name + ".mediator.waiting", function() {
            $(CONTAINER).find(".tg-loading-scrim").fadeIn();
        });

        $.subscribe(container_name + ".mediator.doneWaiting", function() {
            // bring loading scrim into place
            $(CONTAINER).find(".tg-loading-scrim").fadeOut();

        });


        $.subscribe(container_name + ".mediator.mousewheelChange", function(info) {

            if (info.action === "pan") {
                me.pan(info.dir * 10);
                me.throttledResetTicksHandle();
            }
        });


        $.subscribe(container_name + ".mediator.focusToEvent", function() {
            // mediator takes care of focusing date
            var ev = MED.focusedEvent;
        });


        $.subscribe(container_name + ".mediator.imageLaneHeightSetUi", function() {
            me.setImageLaneHandle();
        });


        $.subscribe(container_name + ".mediator.zoomLevelChange", function() {

            me.tickNum = 0;
            me.leftside = 0;

            var zl = MED.getZoomLevel();

            // if the slider isn't already at the given value change in
            $(me._views.SLIDER).slider("value", me.invSliderVal(zl));

            me.displayZoomLevel(zl);

            me.castTicks("zoomLevelChange");

        });



        $.subscribe(container_name + ".mediator.initialScope", function() {

            var iscope = MED.getInitialScope(),

                ls = iscope.left_sec,
                rs = iscope.right_sec,

                spp = iscope.spp,
                c_pos = $(CONTAINER).offset(),

                c_width = $(CONTAINER).width(),

                lshift = ls - iscope.timelineBounds.first,
                rshift = iscope.timelineBounds.last - rs,

                // how far to drag right??
                r_extreme = (Math.floor(lshift / spp) + c_pos.left) + (c_width / 2),
                // how far to drag left??;
                l_extreme = ((-1 * Math.ceil(rshift / spp)) + c_pos.left) - (c_width / 2);

            if (options.constrain_to_data && MED.activeTimelines.length > 0) {
                $(TICKS).draggable("option", "containment", [l_extreme, 0, r_extreme, 0]);
            }

        });



        /// This happens on a TOTAL REFRESH of
        /// ticks, as when zooming; panning will load
        /// events of active timelines per tick
        $.subscribe(container_name + ".mediator.ticksReadySignal", function(b) {
            if (MED.ticksReady === true) {
                me.freshTimelines();
            }
        });


        /*
    	Renews the timeline at current focus/zoom, but with
    	possibly different timeline/legend/etc parameters
    	! The only view method that responds directly to a model refresh()
	*/
        $.subscribe(container_name + ".mediator.refreshSignal", function() {

            me.tickNum = 0;
            me.leftside = 0;

            me.castTicks("refreshSignal");
        });


        // adding to or removing from ticksArray
        // DORMANT: necessary?
        $.subscribe(container_name + ".mediator.ticksArrayChange", function() {
            // empty for now
        });


        $.subscribe(container_name + ".mediator.scopeChange", function() {

            var scope = MED.getScope();
            var tbounds = scope.timelineBounds;
            var focus = scope.focusDateSec;

            /*
            // DEPRECATED 12 March 2013
            // in favor of draggable containment array
            if (focus > tbounds.last) {
            	// past right end of timeline(s): stop leftward drag
            	me.dragScopeState = {state:"over-right"};
            } else if (focus < tbounds.first) {
            	// over left end of timeline(s): stop rightward drag
            	me.dragScopeState = {state:"over-left"};
            } else {
            	me.dragScopeState = {state:"okay"};
            }
            */

            if (MED.scopeChanges == 1) {
                // first scope change after initial load
                me.initiateNavigation();
            }

            MED.scopeChanges++;
        });



        // listen for focus date change
        // mainly if date is zipped-to rather than dragged
        $.subscribe(container_name + ".mediator.focusDateChange", function() {
            me.displayFocusDate();
        });


        // CREATE TIMELINES MENU
        $.subscribe(container_name + ".mediator.timelineDataLoaded", function(arg) {

            if (MED.singleTimelineID) {
                me.setupSingleTimeline();
            } else {

                me.buildTimelineMenu(MED.timelineCollection);

                if (timeglider.mode == "presentation") {
                    me.setupPresentation();
                }
            }

            me.buildSettingsMenu();

            me.setupFilter();

            $(".timeglider-loading").fadeOut(500);

        });


        $.subscribe(container_name + ".mediator.activeTimelinesChange", function() {

            $(me._views.TIMELINE_MENU_UL + " li").each(function() {

                var id = $(this).data("timeline_id");
                if (_.indexOf(MED.activeTimelines, id) != -1) {
                    $(this).addClass("activeTimeline");
                } else {
                    $(this).removeClass("activeTimeline");
                }
            }); // end each
        });


        $.subscribe(container_name + ".mediator.filterChange", function() {
            // refresh is done inside MED -- no need to refresh here
        });
        /* END PUB-SUB SUBSCRIBERS */



        $.subscribe(container_name + ".mediator.resize", function() {
            me.resize();
        });


        //// GESTURES  ////
        /* !!TODO    Still a FAIL in iPad ----
        PRIVATE/SCOPED IN CLOSURE, THESE ARE UN-TESTABLE
        */
        function gestureChange(e) {
            e.preventDefault();
            if (MED.gesturing === false) {
                MED.gesturing = true;
                MED.gestureStartZoom = MED.getZoomLevel();
            }
            var target = e.target;
            // constant spatial converter value
            //$("#output").append("<br>start zoom:" + MED.gestureStartZoom);

            // This basically works, but it's funky still....
            var g = Math.ceil(MED.gestureStartZoom / (e.scale / 2));

            //$("#output").append("<br>new gest zoom:" + g);

            MED.setZoomLevel(g);
        }


        function gestureEnd(e) {
            MED.gesturing = false;
        }

        if ($.support.touch) {
            // alert("widget:" + WIDGET_ID);
            $("#" + WIDGET_ID).addTouch();

            var tgcompnt = document.getElementById(WIDGET_ID);

            tgcompnt.addEventListener("gesturestart", function(e) {
                e.preventDefault();
                $("#output").append("<br>gesture zoom:" + MED.getZoomLevel());
            }, false);

            tgcompnt.addEventListener("gestureend", function(e) {
                e.preventDefault();
                $("#output").append("<br>gesture end:" + MED.getZoomLevel());
            }, false);


            tgcompnt.addEventListener("gesturechange", function(e) {
                e.preventDefault();

                gestureChange(e);
                //var gLeft = e.touches.item(0).pageX;
                //var gRight = e.touches.item(1).pageX;

                // var gLeft = "l", gRight = "r";
                // $("#output").append("[" + gLeft + ":" + gRight + "]");

            }, false);

        } // end if ($.support.touch)

    }



    tg.TG_TimelinePlayer.prototype = {


            resize: function() {

                var new_height = $(PL).height();
                $(CONTAINER).height(new_height);

                // measure stuff
                this.dimensions = this.getWidgetDimensions();


                // use measurements to resize various things
                this.resizeElements();
                MED.refresh();

            },


            getWidgetDimensions: function() {

                var c = $(CONTAINER),
                    w = c.width(),
                    wc = Math.floor(w / 2) + 1,
                    h = c.height(),
                    hc = Math.floor(h / 2),
                    t_height = this.tick_height,
                    lft = c.position().left,
                    offset = c.offset(),
                    f_height = (options.show_footer == true) ? $(this._views.FOOTER).outerHeight() : 0,
                    t_top = h - f_height - t_height,
                    // objects to return
                    ticks_ht = h - (f_height + t_height),
                    ticks_rule_ht =
                    h_height = $(this._views.HEADER).outerHeight() || 0,

                    // available space for timelines
                    tlspace = h - (f_height + h_height + t_height),

                    container = { "width": w, "height": h, "centerx": wc, "centery": hc, "left": lft, "offset": offset },
                    ticks = { "height": ticks_ht },
                    tick = { "top": t_top, "height": t_height },
                    header = { "height": h_height },
                    footer = { "height": f_height };

                var ret = { container: container, ticks: ticks, tick: tick, header: header, footer: footer, timeline_space: tlspace };

                MED.setDimensions(ret);

                return ret;

            },



            initiateNavigation: function() {
                var me = this;

                $(".tg-single-timeline-header .tg-timeline-start").fadeIn();
                $(CONTAINER).delegate(".tg-single-timeline-header h2", CLICKORTOUCH, function() {
                    var tid = $(this).data("timeline_id");
                    me.timelineModal(tid);
                    MED.focusTimeline(tid);

                });
            },


            displayZoomLevel: function() {

                var me = this,
                    zl = MED.getZoomLevel();

                if (zl > 0) {
                    if (options.display_zoom_level == true) {
                        $(me._views.ZOOM_DISPLAY).text(zl);
                    }
                }
            },


            displayFocusDate: _.throttle(function() {
                // this is expensive for real-time dragging...
                // without throttle, leads to crashing in Firefox
                var fd = MED.getFocusDate();
                var str = fd.format("d MMM yyyy", true);

                $(this._views.FOCUS_DATE).find("span").text(str);



            }, 300),



            displayOutOfFrameEvents: _.throttle(function() {

                var leftOfFrame = MED.getPastEvents(true, true);
                var rightOfFrame = MED.getFutureEvents(true, true);

            }, 900),




            /**
             * setPanButton
             * @param $sel {jquery dom selector} the button to be assigned
             * @parm vel {Number} positive for moving to the right, negative for moving left
             *
             *
             */
            setPanButton: function($sel, vel) {
                var me = this,
                    _int = 33; // 33/1000 second interval
                $($sel).bind("mousedown", function() {
                        me.intervalMachine("pan", { type: "set", fn: me.pan, args: [vel], intvl: _int });
                    })
                    .bind("mouseup", function() {
                        me.intervalMachine("pan", { type: "clear", fn: me.pan, callback: "resetTicksHandle" });
                    })
                    .bind("mouseout", function() {
                        me.intervalMachine("pan", { type: "clear", fn: me.pan, callback: "resetTicksHandle" });
                    });
            },



            /*
            * intervalMachine
            * param name {String} JS interval ref. name
            * @param info {Object}
            *     type: clear | set
            *     fn: function to call on interval
            *     callback: function to invoke upon clearing
            *     eg: {type:"clear", fn: me.pan, callback: "resetTicksHandle"}
            *
            *
            *  PLUGIN CANDIDATE!

            */
            intervalMachine: function(name, info) {
                var me = this;
                if (info.type === "clear") {
                    clearInterval(intervals[name]);

                    if (info.callback) {
                        me[info.callback]();
                    }

                } else {
                    // run it
                    intervals[name] = setInterval(function() {
                        info.fn.apply(me, info.args);
                    }, info.intvl);
                }
            },


            invSliderVal: function(v) {
                return Math.abs(v - 101);
            },



            /*
             * pan
             * @param dir {Number}
             * simply moves the ticks one way or another
             * To work properly, it needs a resetTicksHandle() callback;
             * Using this with intervalMachine()
             */
            pan: function(dir) {

                var d = dir || 20,
                    $t = $(TICKS),
                    newPos = $t.position().left + d;

                $t.css({ left: newPos });

                MED.setTicksOffset(newPos);

            },


            registerTitles: function() {

                var toff, w, tw, sw, pos, titx,
                    $elem, $env, env, $tb, $ti, relPos, tbWidth,
                    mo = $(CONTAINER).offset().left,
                    trackTB = true;


                var tks = $(this._views.TICKS).position().left;
                $(".tg-lane").css("left", (-1 * tks));


                $(CONTAINER + " .timeglider-event-spanning").each(
                    function() {
                        // !TODO  needs optimizing of DOM "touching"
                        var $spev = $(this);
                        toff = $spev.offset().left - mo;

                        $elem = $spev.find(".timeglider-event-title");
                        $laneTitle = $spev.find(".timeglider-event-spanner span");

                        tw = $elem.outerWidth() || $laneTitle.outerWidth();
                        sw = $spev.find(".timeglider-event-spanner").outerWidth();

                        // if the span is wider than the title element
                        if (sw > tw && tw) {
                            // if the offset is to the left of the frame
                            if (toff < 0) {
                                var dif = sw - tw;
                                if (Math.abs(toff) < dif) {
                                    $elem.css({ marginLeft: (-1 * toff) + 5 });
                                    $laneTitle.css({ marginLeft: (-1 * toff) + 5 });
                                } else {
                                    // keep it aligned right if the right side is poking in
                                    $elem.css({ marginLeft: (sw - tw) - 5 });
                                    $laneTitle.css({ marginLeft: (sw - tw) - 5 });
                                }
                                // otherwise just keep it aligned on the left side of the span
                            } else {
                                $elem.css({ marginLeft: 5 });
                            }
                        }
                        // is offscreen == false: $(this).removeClass('timeglider-event-offscreen')
                    }
                );

                // IE 7,8 not able to find the .titleBar element below
                // while this .each is happening. Performance in .find()?
                // This hack just turns off the titleBar tracking... :(

                /*
                if ($.browser.msie && parseInt($.browser.version) <9) {
                	trackTB = false;
                }
                */

                // if (trackTB === true) {
                $(CONTAINER + " .tg-timeline-envelope").each(
                    function() {
                        // !TODO  needs optimizing of DOM "touching"
                        $env = $(this);
                        env = $env.offset().left - mo;
                        $tb = $env.find(".titleBar");

                        // `pos` is a pre-cached $tb.position().left;
                        // rather than calculating position here, it's
                        // grabbing a cached value stored in element data()
                        pos = $tb.data("lef");

                        relPos = -1 * (pos + env);

                        $ti = $tb.find(".timeline-title");
                        // if it's pushed left of the window


                        if ((relPos > 0)) {
                            var dif = $tb.width() - $ti.width();
                            if (relPos < dif) {
                                $ti.css({ marginLeft: relPos + 5 });
                            } else {
                                $ti.css({ marginLeft: dif - 5 });
                            }
                        } else {
                            $ti.css({ marginLeft: 5 });
                        }

                    }
                );

            }, // end register titles


            registerDragging: function() {
                /*
		startSec --> the seconds-value of the
	    initial focus date on landing @ zoom level
		*/
                //!TODO: See if we can throttle this to be only
                // once every 100ms....
                var startSec = MED.startSec,
                    tickPos = $(TICKS).position().left,
                    secPerPx = MED.getZoomInfo().spp;

                var newSec = startSec - (tickPos * secPerPx);

                var newD = new TG_Date(newSec);

                MED.setFocusDate(newD);

                // remove this???
                this.displayFocusDate();

                this.displayOutOfFrameEvents();

            },



            getTimelinesTagsArray: function() {

                var me = this,
                    tl, tags = [],
                    tags_obj;
                _.each(MED.timelineCollection.models, function(tl) {
                    tags_obj = tl.get("tags");
                    _.each(tags_obj, function(val, key) {
                        tags.push(key);
                    });
                });

                return tags;
            },



            /* FILTER BOX SETUP */
            setupFilter: function() {

                var me = this,
                    $bt = $(me._views.FILTER_BT),
                    $filter = $.tmpl(me._templates.filter_modal, {}).appendTo(me._views.CONTAINER),
                    use_title = false,
                    use_desc = false,
                    fbox = me._views.FILTER_BOX;

                var clearFilterFront = function() {
                    MED.setFilters({ origin: "title_andor_desc", title: '', tags: '', description: '' });
                    $(fbox + " .timeglider-filter-search").val('');
                    $(fbox + " .timeglider-filter-tags").val('');
                    $("#filter-tags").val("").trigger("change");
                }

                var clearFilters = function() {
                    MED.clearFilters({ "legend": false, "custom": false });
                }

                // get tags array from active timelines
                var activeTags = me.getTimelinesTagsArray();

                if (activeTags.length > 0) {

                    if ($.fn.select2) {
                        $("#filter-tags").select2({
                            tags: activeTags,
                            placeholder: "Click to select",
                            allowClear: true
                        });
                    }

                } else {
                    // no tags -- hide tags element
                    $(".filter-tags").hide();
                }


                $filter.position({
                    my: "right+32 bottom-16",
                    at: "right top",
                    of: $(me._views.FILTER_BT)
                }).css("z-index", me.ztop++).hide();


                $(CONTAINER)
                    .delegate(".timeglider-filter-box .tg-close-button", "click", function() {
                        clearFilterFront();
                        $filter.fadeOut();
                    })


                $(me._views.FILTER_BT).bind("click", function() {

                    $filter.fadeIn();

                    var $bt = $(this);

                    // If it's never been opened, apply actions to the buttons, etc
                    if (me.filterBoxActivated == false) {

                        me.filterBoxActivated = true;

                        var $filter_apply = $(fbox + " .timeglider-filter-apply"),
                            $filter_clear = $(fbox + " .timeglider-filter-clear"),
                            incl = "",
                            tags = "",
                            excl = "",
                            title_txt = "",
                            desc_txt = "";

                        var $filter_input = $(fbox + " .timeglider-filter-search");

                        $filter_input.on("keydown", function(e) {
                            switch (e.which) {
                                case 0:
                                case 9:
                                case 13:
                                    $filter_apply.trigger("click");
                                    break;
                            }
                        });


                        // set up listeners
                        $filter_apply.bind("click", function() {

                            clearFilters();

                            tags = $("#filter-tags").val();

                            incl = $(fbox + " .timeglider-filter-search").val();
                            excl = ""; // $(fbox + " .timeglider-filter-exclude").val();

                            use_title = $(fbox + " input#filter_t").is(":checked");
                            use_desc = $(fbox + " input#filter_d").is(":checked");

                            if ((use_title && incl) || (use_desc && incl) || tags) {
                                title_txt = use_title ? incl : "";
                                desc_txt = use_desc ? incl : "";

                                if (use_title && use_desc && incl) {
                                    // EITHER title OR description match
                                    MED.setFilters({ origin: "clude", include: title_txt, exclude: "", tags: tags });
                                } else {
                                    // just title, or just description match
                                    MED.setFilters({ origin: "title_andor_desc", title: title_txt, description: desc_txt, tags: tags });
                                }

                            } else {
                                // clear
                                clearFilters();
                                clearFilterFront();
                            }


                        });


                        $filter_clear.bind("click", function() {
                            clearFilters();
                            clearFilterFront();
                        });

                    } // end if filterBoxActivated

                }); // end FILTER_BT click





            }, // end setupFilter




            buildTimelineMenu: function() {

                var me = this;
                var $menu;
                var $bts = $(me._views.FOOTER).find(".tg-footer-buttons");
                var $menu_bt = {};

                if (!$(me._views.TIMELINE_LIST_BT)[0]) {
                    $menu_bt = $("<div class='timeglider-footer-button timeglider-list-bt'></div>").appendTo($bts);
                } else {
                    $menu_bt = $(me._views.TIMELINE_LIST_BT);
                }

                if ($(me._views.TIMELINE_MENU)[0]) {
                    $(me._views.TIMELINE_MENU).remove()
                }

                var $menu = $.tmpl(me._templates.timeline_list_modal, {}).appendTo(me._views.CONTAINER);
                // each timeline's <li> item in menu
                var menuItem = Backbone.View.extend({

                    initialize: function() {
                        this.model.bind('change', this.render, this);
                    },

                    tagName: "li",
                    template: "${title}",

                    events: {
                        "click": "toggleTimeline"
                    },

                    toggleTimeline: function() {
                        MED.toggleTimeline(this.model.get("id"));
                    },

                    render: function() {
                        var tid = this.model.get("id"),
                            activeClass = "";
                        if (MED.isActive(tid)) activeClass = "activeTimeline";

                        $(this.el).html($.tmpl(this.template, this.model.attributes)).data("timeline_id", tid).addClass(activeClass);
                        return this;
                    }

                });


                $(me._views.TIMELINE_MENU_UL).html("");

                _.each(MED.timelineCollection.models, function(model) {
                    $(me._views.TIMELINE_MENU_UL).append(new menuItem({ model: model }).render().el);
                });


                $menu.position({
                    my: "right+50 bottom-12",
                    at: "left top",
                    of: $menu_bt
                }).hide();

                $menu.find(".tg-close-button").bind(CLICKORTOUCH, function() {
                    $menu.fadeOut();
                });


                $menu_bt.bind(CLICKORTOUCH, function() {
                    $menu.fadeIn();
                })


            },



            getTimezonePulldown: function(id, sel) {

                var html = "<select name='timezone' id='" + id + "'>",
                    seld = false,
                    selstr = "selected";

                $.map(TG_Date.timezones, function(tz) {

                    if (sel == tz.offset && seld == false) {
                        selstr = "selected";
                        seld = true;

                    } else {
                        selstr = "";
                    }

                    html += "<option value='" + tz.offset + "' " + selstr + ">" + tz.name + "</option>";

                });

                html += "</select>";
                return html;

            },




            buildSettingsMenu: function() {

                var me = this;

                var $s = $.tmpl(me._templates.settings_modal, {}).appendTo(me._views.CONTAINER);

                var tz_menu = this.getTimezonePulldown("timeglider-settings-timezone", MED.timeOffset.string);

                $s.find(".timeglider-settings-timezone")
                    .append('<span class="settings-label">时区: </span> ' + tz_menu + '<br><a class="btn btn-small btn-primary pull-right" style="color: white; text-align: center;width: 40px;" id="timeglider-settings-save">保存</a>');


                $s.position({
                    my: "right+32 bottom-16",
                    at: "right top",
                    of: $(me._views.SETTINGS_BT)
                }).hide();


                $(CONTAINER)
                    .delegate(".timeglider-settings-modal .tg-close-button", "click", function() {
                        $s.fadeOut();
                    });

                $(me._views.SETTINGS_BT).bind(CLICKORTOUCH, function() {
                    $s.fadeIn();
                });

                $s.find("#timeglider-settings-save").bind(CLICKORTOUCH, function() {
                    // get timezone

                    var tz_off = $(CONTAINER + " #timeglider-settings-timezone").val();
                    MED.setTimeoffset(tz_off);

                    $(".timeglider-settings-modal").fadeOut();
                });

            },



            setupSingleTimeline: function() {

                var me = this,
                    dims = {},
                    tid = MED.singleTimelineID,
                    timeline = MED.timelineCollection.get(tid);



                if (MED.options.display_single_timeline_info != false) {

                    var title = "<h2 data-timeline_id='" + tid + "'>" + timeline.get("title") + "</h2>";

                    inf = (timeline.get("description")) ? "<li id='info' class='timeline-info-bt' data-timeline_id='" + tid + "'>信息</li>" : "",

                        leg = (timeline.get("hasLegend")) ? "<li id='legend' class='tg-legend-bt' data-timeline_id='" + tid + "'>图例</li>" : "",

                        tools = ""; // "<a id='tools' class='tools-bt noselect'>tools</a>",

                    tmpl = "<div class='tg-widget-header tg-single-timeline-header' style='z-index: 500; '>" + title + "<ul>" + inf + leg + "<li class='tg-timeline-start' data-timeline_id='" + tid + "'>开始</li></ul>" + tools + "</div>";

                    $st = $(tmpl).appendTo(CONTAINER);

                    me.singleTitleHeight = $st.outerHeight();

                } else {

                    me.singleTitleHeight = 0;
                }


                me.dimensions = dims = me.getWidgetDimensions();


                if (timeline.get("hasImageLane")) {
                    me.buildImageLane();
                }


                // adjusts the zoom slider away from the timeline bar at top
                if (options.inverted == true) {

                    //
                    $(me._views.SLIDER_CONTAINER).css({ "bottom": "16px", "top": "auto" });
                    $(me._views.FOOTER).css({ "top": dims.header.height + "px" });
                    timeline.set({ "bottom": (dims.timeline_space - 70), "inverted": true });
                    options.tick_top = dims.container.height - (dims.timeline_space + me.tick_height);

                } else {
                    $(me._views.SLIDER_CONTAINER).css("top", me.singleTitleHeight + 4);

                }


                if (options.initial_timeline_modal != false) {
                    me.timelineModal(tid);
                }


                if (timeline.get("hasLegend")) {
                    if (options.legend.show_on_load) {
                        setTimeout(function() {
                            me.legendModal(tid);
                        }, 500);
                    }
                }


            },

            //////// MODALS
            presentationModal: function() {

                var me = this;

                var pmodal = $(CONTAINER).find("#presInfoModal");

                if (!pmodal[0]) {

                    if (MED.presentation.description) {

                        var ch = me.dimensions.container.height,
                            modal = new this.presInfoModal({ model: MED.presentation });
                        var $header = $(CONTAINER).find(".tg-pres-header");

                        $(modal.render().el)
                            .appendTo($(".timeglider-container"))
                            .position({
                                my: "left top",
                                at: "left+12 bottom+12",
                                of: $header,
                                collision: "flip fit"
                            })
                            .css({ "z-index": me.ztop++, "max-height": ch - 64 });

                        if ($.jScrollPane) {
                            $(".jscroll").jScrollPane();
                        }

                    }
                }

            },




            //////// MODALS
            datePickerOpen: false,
            datepickerModal: function() {

                var me = this;
                var $modal = {};

                if (!me.datepickerOpen) {
                    var me = this,
                        ch = me.dimensions.container.height,
                        modal = new this.datepicker({ model: {} }),

                        $modal = $(modal.render().el)
                        .appendTo($(".timeglider-container"))
                        .position({
                            my: "center bottom-39",
                            at: "center bottom",
                            of: $(".timeglider-container"),
                            collision: "fit fit"
                        })
                        .css({ "z-index": me.ztop++, "max-height": ch - 64 });

                    me.datepickerOpen = true;

                } else {

                }
            },






            startPresentation: function() {

                var me = this,
                    pres = MED.presentation;

                MED.gotoDateZoom(pres.focus_date.dateStr, pres.initial_zoom);

            },


            setupPresentation: function() {

                var me = this,
                    pres = MED.presentation;

                var title = "<h2 id='pres_title' class='no-select' data-timeline_id='primary'>" + pres.title + "</h2>",

                    inf = (pres.description) ? "<li id='info' class='pres-info-bt'>信息</li>" : "",

                    leg = (pres.legend) ? "<li id='legend' data-timeline_id='pres' class='tg-legend-bt'>图例</li>" : "",

                    tools = "", // "<a id='tools' class='tools-bt noselect'>tools</a>",

                    tmpl = "<div class='tg-widget-header tg-pres-header'>" + title + "<ul>" + inf + leg + "<li class='tg-pres-start'>开始</li></ul>" + tools + "</div>",

                    $st = $(tmpl).appendTo(CONTAINER);

                // end vars
                me.getWidgetDimensions();


                me.singleTitleHeight = $st.outerHeight();


                if (pres.image_lane_height) {
                    me.buildImageLane();
                } // end if has imagelane

                // adjusts the zoom slider away from the timeline bar at top
                $(me._views.SLIDER_CONTAINER).css("top", me.singleTitleHeight + 4);

                me.startPresentation();

                if (pres.open_modal && pres.description) {
                    me.presentationModal();
                }
            },




            buildImageLane: function() {

                var me = this;

                var $existing = $(CONTAINER).find(".tg-image-lane-pull");

                if ($existing.length == 0) {

                    var $imageLane = $("<div class='tg-image-lane-pull'><div title='这是图像栏!' class='tg-image-lane-bg'></div></div>").appendTo(CONTAINER);

                    $imageLane.draggable({

                        axis: "y",
                        containment: "parent",
                        drag: function() {
                            var $pull = $(this);
                            var ypos = $pull.position().top;

                            if (ypos > 400) {
                                $pull.css("top", 400);
                                return false;
                            } else if (ypos < 5) {
                                $pull.css("top", 5);
                                return false;
                            }
                        },
                        stop: function() {
                            MED.setImageLaneHeight($(this).position().top - me.singleTitleHeight, true, false);
                        }
                    });

                    me.setImageLaneHandle();

                }

            },



            /*
             * setImageLaneHandle
             * gets image_lane_height from MED and sets image lane
             * UI remotely (not from dragging, but from timeline/pres props)
             */
            setImageLaneHandle: function() {

                var me = this;
                var newHt = parseInt(MED.image_lane_height, 10) + parseInt(me.singleTitleHeight, 10);

                $(".tg-image-lane-pull").css("top", newHt + "px");
            },



            /*
            	Zoom slider is inverted value-wise from the normal jQuery UI slider
              so we need to feed in and take out inverse values with invSliderVal()
            */

            buildSlider: function() {

                var me = this,
                    iz = MED.getZoomLevel();

                if (options.min_zoom == options.max_zoom) {
                    // With a single zoom level, hide the zoom controller
                    $(this._views.SLIDER_CONTAINER).css("display", "none");

                } else {

                    if (options.display_zoom_level == true) {
                        var $zl = $("<div>").appendTo(this._views.SLIDER_CONTAINER).addClass("timeglider-zoomlevel-display");
                        $zl.html('&nbsp;');

                    }

                    var me = this,
                        init_zoom = me.invSliderVal(iz),
                        hZoom = MED.max_zoom,
                        lZoom = MED.min_zoom,
                        sHeight = (1 + hZoom - lZoom) * 3;

                    $(this._views.SLIDER)
                        .css({ "height": sHeight })
                        .slider({
                            steps: 100,
                            handle: $('.knob'),
                            animate: 300,
                            orientation: 'vertical',

                            // "min" here is really the _highest_ zoom value @ upside down
                            min: me.invSliderVal(hZoom),

                            // "max" actually takes (i  nverse value of) low zoom level
                            max: me.invSliderVal(lZoom),

                            value: init_zoom,

                            start: function(e, ui) {
                                // show zoom level legend
                                me.sliderActive = true;
                            },

                            stop: function(e, ui) {
                                // hide zoom level legend
                                me.sliderActive = false;
                            },

                            change: function(e, ui) {
                                // i.e. on-release handler
                                // possibly load throttled back events
                            },

                            slide: function(e, ui) {
                                // sets model zoom level to INVERSE of slider value
                                MED.setZoomLevel(me.invSliderVal(ui.value));
                            }
                        }); // end .slider()



                } // end--if min_zoom == max_zoom
            },


            setupScroller: function() {

                if (options.event_overflow == "scroll") {

                    $(".timeglider-slider-container").css("right", "22px");

                    $(CONTAINER + " .tg-scroller-handle").draggable({
                        containment: "parent",
                        drag: function() {
                            // move content vertically
                        }
                    });

                }
            },

            adjustScroller: function(low, high) {
                var me = this;
                if (options.event_overflow == "scroll") {
                    var $scr = $(CONTAINER + " .tg-scroller");
                    var $handle = $(CONTAINER + " .tg-scroller-handle");
                    var scr_ht = me.dimensions.scroller_height;
                    var evts_ht = high + (Math.abs(low));

                    var overage = evts_ht / scr_ht;

                    if (overage > 1) {

                    } else {
                        $scr.hide();
                    }

                }
            },


            /*
             * usage: timeline event hovering, modal display
             *
             */
            getEventDateLine: function(ev) {

                var startDateF = "<span class='timeglider-dateline-startdate'>" + ev.startdateObj.format('', true, MED.timeOffset) + "</span>",

                    endDateF = "";

                if (ev.span == true) {
                    endDateF = " <span style='color:#E5D4CA'>&ndash;</span> <span class='timeglider-dateline-enddate'>" + ev.enddateObj.format('', true, MED.timeOffset) + "</span>";
                }

                var ret = startDateF + endDateF;

                return ret;

            },



            eventHover: function($ev, ev) {

                var follow = true;

                if (typeof MED.options.eventHover == "function") {

                    follow = MED.options.eventHover($ev, ev, this);

                }

                if (follow) {

                    var me = this,
                        $hov = $(".timeglider-event-hover-info"),
                        title = "",
                        date_line = "";

                    $ev.append("<div class='tg-event-hoverline'></div>").addClass("tg-event-hovered");

                    if (ev.date_display == "no") {
                        date_line = "";
                    } else {
                        date_line = me.getEventDateLine(ev);
                    }

                    if ($ev.hasClass("tg-event-collapsed") || $ev.hasClass("tg-event-overflow")) {
                        title = "<div>" + ev.title + "</div>";
                    } else {
                        title = "";
                    }

                    if (title || date_line) {
                        $hov.position({
                                my: "left+1 top+4",
                                at: "left bottom",
                                of: $ev,
                                collision: "flip flip"
                            })
                            .html(title + date_line)
                    }
                }
            },


            eventUnHover: function($ev) {
                var $ev = $ev || "";

                if (typeof MED.options.eventUnHover == "function") {
                    MED.options.eventUnHover($ev, this);
                } else {
                    $(".timeglider-event-hover-info").css("left", "-1000px");
                    $(".timeglider-timeline-event").removeClass("tg-event-hovered");
                    if ($ev) {
                        $ev.find(".tg-event-hoverline").remove();
                    }
                }
            },



            clearTicks: function() {
                this.leftside = 0;
                this.tickNum = 0;

                $(TICKS)
                    .css("left", 0);
                // .html("<div class='timeglider-handle'></div>");

                // remove everything but HANDLE, which
                // needs to stay so that gesturing (pinching to zoom)
                // doesn't lose its target
                $(CONTAINER + " .tg-timeline-envelope").remove();
                $(CONTAINER + " .timeglider-tick").remove();


            },


            /*
              The initial drawing of a full set of ticks, starting in the
              middle with a single, date-focused div with type:"init", after which
              a left-right alternating loop fills out the width of the current frame
            */
            castTicks: function(orig) {

                if (MED.viewMode == "timeline") {

                    this.clearTicks();

                    var zLevel = MED.getZoomLevel(),
                        fDate = MED.getFocusDate(),
                        zInfo = MED.getZoomInfo(),
                        tickWidth = zInfo.width,
                        twTotal = 0,
                        ctr = this.dimensions.container.centerx,
                        // determine how many are necessary to fill (overfill) container
                        nTicks = Math.ceil(this.dimensions.container.width / tickWidth) + 4,
                        leftright = 'l';

                    if (typeof zInfo.width == "number") {

                        MED.setTicksReady(false);

                        // INITIAL TICK added  in center according to focus date provided

                        this.addTick({ "type": "init", "focus_date": fDate });

                        // ALTERNATING L & R ticks
                        for (var i = 1; i <= nTicks; i += 1) {
                            this.addTick({ "type": leftright });
                            // switch l and r for alternating layout action
                            leftright = (leftright == "l") ? "r" : "l";
                        }

                        MED.setTicksReady(true);

                        this.displayFocusDate();

                    }

                } else {
                    // i.e. viewMode == list
                    this.clearTicks();
                    this.freshTimelines();
                }


            },


            getTickTop: function() {

                var tttype = typeof MED.options.tick_top;

                if (tttype == "number") {
                    // default number, zero for ticks at top
                    return MED.options.tick_top;
                } else if (tttype == "function") {
                    // could be a custom setter function
                    return MED.options.tick_top(me.dimensions);
                } else {
                    // at the bottom
                    return parseInt(this.dimensions.tick.top);
                }

            },



            /*
             * @param info {object} --object-->
             *                     type: init|l|r
             *                     focusDate: date object for init type
             */
            addTick: function(info) {

                var me = this,
                    mDays = 0,
                    dist = 0,
                    pos = 0,
                    tperu = 0,
                    serial = 0,
                    shiftLeft = 0,
                    ctr = 0,
                    tid = "",
                    tickHtml = "",
                    sub_label = "",
                    label = {},
                    $tickDiv = {},
                    tInfo = {},
                    pack = {},
                    mInfo = {},
                    sub_labels = "",
                    sub_labels_arr = [],
                    oeClass = '',

                    tickUnit = MED.getZoomInfo().unit,
                    tickWidth = MED.getZoomInfo().width,
                    focusDate = MED.getFocusDate(),
                    tick_top = me.getTickTop(),
                    serial = MED.addToTicksArray({ type: info.type, unit: tickUnit }, focusDate);
                // end vars comma list

                // adjust tick-width for months (mo)
                if (tickUnit == "mo") {
                    // starts with default tickWidth set for 28 days: How many px, days to add?
                    mInfo = TG_Date.getMonthAdj(serial, tickWidth);
                    tickWidth = mInfo.width;
                    mDays = mInfo.days;

                }

                // tickNum has been reset to zero by refresh/zoom
                this.tickNum++;

                if (info.type == "init") {

                    shiftLeft = this.tickOffsetFromDate(MED.getZoomInfo(), MED.getFocusDate(), tickWidth);

                    pos = Math.ceil(this.dimensions.container.centerx + shiftLeft);
                    $(TICKS).data("init-left", pos);
                    // both and left and right sides are defined
                    // here because it is the first tick on screen
                    this.leftside = pos;
                    this.rightside = (pos + tickWidth);


                } else if (info.type == "l") {
                    pos = Math.floor(this.leftside - tickWidth);
                    this.leftside = pos;
                } else if (info.type == "r") {
                    pos = Math.floor(this.rightside);
                    this.rightside += tickWidth;
                }

                // turn this into a function...
                MED.getTickBySerial(serial).width = tickWidth;
                MED.getTickBySerial(serial).left = pos;

                oeClass = (serial % 2 == 0) ? "tg-even-tick" : "tg-odd-tick";

                tid = this._views.PLACE + "_" + tickUnit + "_" + serial + "-" + this.tickNum;

                $tickDiv = $("<div class='timeglider-tick " + oeClass + "' id='" + tid + "'><div class='tg-tick-body'><div class='tg-tick-leftline'></div><div class='timeglider-tick-label' ></div><div class='tg-tick-label-bottom'></div></div>")
                    .appendTo(TICKS);


                $tickDiv.css({ width: tickWidth, left: pos, top: tick_top, zIndex: 55 });

                // GET TICK DIVS FOR unit AND width
                tInfo = this.getTickMarksInfo({ unit: tickUnit, width: tickWidth });
                // if there's a value for month-days, us it, or use
                // tperu = (mDays > 0) ? mDays : tInfo.tperu;
                tperu = mDays || tInfo.tperu;

                dist = tickWidth / tperu;

                // Add tick-lines or times when divisions are spaced wider than 5

                if (dist > 8) {

                    // As of Jan 29, 2012, no more Raphael!

                    var c, l, xd, stk = '',
                        sl4hd = 0,
                        ht = 10,
                        downset = 20,
                        hr_info = {},
                        ampm = '',
                        lpos = 0;

                    for (l = 0; l < tperu; l++) {

                        sub_label = "&nbsp;";


                        if (dist > 16) {

                            if (tickUnit == "da") {
                                // hours starting with 0
                                sub_label = me.getHourLabelFromHour(l, dist);

                            } else if (tickUnit == "mo") {
                                // days starting with 1
                                sub_label = l + 1;
                            } else if (tickUnit == "ye") {
                                if (dist > 30) {
                                    // Jan, Feb, Mar...
                                    sub_label = "&nbsp;" + TG_Date.monthNamesAbbr[l + 1];
                                } else {
                                    // month abbrevs: J, F, M...
                                    sub_label = "&nbsp;" + TG_Date.monthNamesLet[l + 1];
                                }
                            } else if (tickUnit == "de") {
                                if (dist > 54) {
                                    sub_label = (serial * 10) + l;
                                }
                            } else if (tickUnit == "ce") {
                                if (dist > 38) {
                                    sub_label = ((serial * 10) + l) * 10;
                                }
                            }


                        } else {
                            // less than 16
                            sub_label = "";
                        }


                        sub_labels_arr.push("<div class='timeglider-tick-sub-label " + tickUnit + "' style='left:" + lpos + "px;width:" + dist + "px'>" + sub_label + "</div>");




                        lpos += dist;
                    }

                    if (serial < 0) {
                        sub_labels_arr.reverse();
                    }

                    sub_labels = sub_labels_arr.join("");

                } else {
                    sub_labels = "";
                } // end dist > 5  if there's enough space between tickmarks

                // add hours gathered in loop above
                if (sub_labels) {
                    $tickDiv.append("<div class='tg-tick-sublabel-group' style='width:" + (tickWidth + 10) + "px;'>" + sub_labels + "</div>");
                }

                pack = { "unit": tickUnit, "width": tickWidth, "serial": serial };

                label = this.getDateLabelForTick(pack);

                // In order to gather whether an outlier span is
                // occuring on drag-right (the right side of a span)
                // we need some seconds...

                pack.seconds = this.getTickSeconds[tickUnit](pack.serial);

                // DO OTHER STUFF TO THE TICK, MAKE THE LABEL AN ACTIONABLE ELEMENT
                // SHOULD APPEND WHOLE LABEL + TICKLINES HERE

                $tickDiv.find(".timeglider-tick-label").text(label);

                var lb_offset = (MED.options.show_footer) ? 46 : 14;
                var ht = this.dimensions.container.height - lb_offset;

                $tickDiv.find(".tg-tick-label-bottom").text(label).css("top", ht);

                return pack;

                /* end addTick */
            },


            resizeElements: function() {

                var me = this,

                    // measurements have just been taken...
                    cx = me.dimensions.container.centerx,
                    ch = me.dimensions.container.height,
                    cw = me.dimensions.container.width,
                    fh = me.dimensions.footer.height,
                    th = me.dimensions.tick.height,
                    $C = $(this._views.CENTERLINE),
                    $D = $(this._views.DATE),
                    dleft = cx - ($D.width() / 2);

                if (MED.options.show_centerline === true) {
                    $C.css({ "height": ch, "left": cx });
                } else {
                    $C.css({ "display": "none" });
                }

                var ticks_ht = ch - (fh + th);
                $(this._views.TICKS).css("height", ticks_ht);

                var scroller_ht = ticks_ht - 4;
                if (options.event_overflow == "scroll") {
                    me.dimensions.scroller_height = scroller_ht;
                    $(this._views.CONTAINER).find(".tg-scroller").css({
                        height: scroller_ht + "px"
                    });
                } else {
                    me.dimensions.scroller_height = 0;
                    $(this._views.CONTAINER).find(".tg-scroller").remove();
                }


                if (ch < 500 || cw < 500) {
                    $(".timeglider-slider").css("display", "none");
                } else {
                    $(".timeglider-slider").css("display", "block");
                }

                $D.css({ "left": dleft });

            },

            /*
             * @param pack {Object} `unit` and `serial`
             */
            getTickSeconds: {
                da: function(ser) {
                    var s = ser * 86400,
                        e = s + 86400;
                    return { start: s, end: e };
                },
                mo: function(ser) {
                    var s = ser * 2629800,
                        e = s + 2629800;
                    return { start: s, end: e };
                },
                ye: function(ser) {
                    var s = ser * 31540000,
                        e = s + 31540000;
                    return { start: s, end: e };
                },
                de: function(ser) {
                    var s = ser * 315400000,
                        e = s + 315400000;
                    return { start: s, end: e };
                },
                ce: function(ser) {
                    var s = ser * 3154000000,
                        e = s + 3154000000;
                    return { start: s, end: e };
                },
                thou: function(ser) {
                    var s = ser * 3154000000,
                        e = s + 3154000000;
                    return { start: s, end: e };
                },
                tenthou: function(ser) {
                    var s = ser * 3154000000,
                        e = s + 3154000000;
                    return { start: s, end: e };
                },
                hundredthou: function(ser) {
                    var s = ser * 3154000000,
                        e = s + 3154000000;
                    return { start: s, end: e };
                },
                mill: function(ser) {
                    var s = ser * 3154000000,
                        e = s + 3154000000;
                    return { start: s, end: e };
                },
                tenmill: function(ser) {
                    var s = ser * 3154000000,
                        e = s + 3154000000;
                    return { start: s, end: e };
                },
                hundredmill: function(ser) {
                    var s = ser * 31540000000,
                        e = s + 31540000000;
                    return { start: s, end: e };
                },
                bill: function(ser) {
                    var s = ser * 315400000000,
                        e = s + 315400000000;
                    return { start: s, end: e };
                }

            },


            getHourLabelFromHour: function(h24, width) {

                var ampm = "",
                    htxt = h24,
                    bagels = "",
                    sublabel = "",
                    sl4hd = 0;

                if (width < 16) {
                    // no room for anything; will just be ticks
                    return '';
                } else {

                    if (h24 > 12) {
                        htxt = h24 - 12;
                    } else if (h24 == 0) {
                        htxt = 12;
                    }

                    if (width > 30) {
                        ampm = (h24 > 11) ? " pm" : " am";
                    }

                    if (width > 200) {
                        sl4hd = width / 4 - 4;

                        return "<div class='minutes' style='width:" + sl4hd + "px'>" + htxt + ":00 " + ampm + "</div>" +
                            "<div class='minutes' style='width:" + sl4hd + "px'>" + htxt + ":15 " + ampm + "</div>" +
                            "<div class='minutes' style='width:" + sl4hd + "px'>" + htxt + ":30 " + ampm + "</div>" +
                            "<div class='minutes' style='width:" + sl4hd + "px'>" + htxt + ":45 " + ampm + "</div>";

                    } else {
                        bagels = (width > 60) ? ":00" : "";
                        return htxt + bagels + ampm;
                    }
                }

            },


            /* provides addTick() info for marks and for adj width for month or year */
            getTickMarksInfo: function(obj) {
                var tperu;
                switch (obj.unit) {
                    case "da":
                        tperu = 24;
                        break;
                    case "mo":
                        // this is adjusted for different months later
                        tperu = 30;
                        break;
                    case "ye":
                        tperu = 12;
                        break;
                    default:
                        tperu = 10;
                }

                return { "tperu": tperu };
            },

            /*
            *  getDateLabelForTick
            *  determines label for date unit in "ruler"
            *  @param obj {object} carries these values:
                                   {"unit":tickUnit, "width":tickWidth, "serial":serial}
            *
            */
            getDateLabelForTick: function(obj) {

                var i, me = this,
                    ser = obj.serial,
                    tw = obj.width;

                switch (obj.unit) {

                    case "bill":
                        if (ser == 0) {
                            return "1";
                        } else if (ser > 0) {
                            return (ser) + "十亿年";
                        } else {
                            return "" + (ser) + " 十亿年";
                        }
                        break;


                    case "hundredmill":
                        if (ser == 0) {
                            return "1";
                        } else if (ser > 0) {
                            return (ser) + "00 百万年";
                        } else {
                            return "" + (ser) + "00 百万年";
                        }
                        break;


                    case "tenmill":
                        if (ser == 0) {
                            return "1";
                        } else if (ser > 0) {
                            return (ser) + "0 百万年";
                        } else {
                            return "" + (ser) + "0 百万年";
                        }
                        break;


                    case "mill":
                        if (ser == 0) {
                            return "1";
                        } else if (ser > 0) {
                            return "" + (ser) + " 百万年";
                        } else {
                            return "" + (ser) + " 百万年";
                        }
                        break;


                    case "hundredthou":
                        if (ser == 0) {
                            return "1";
                        } else if (ser > 0) {
                            return (ser) + "00,000 年";
                        } else {
                            return "" + (ser) + "00,000 年";
                        }
                        break;


                    case "tenthou":
                        if (ser == 0) {
                            return "1";
                        } else if (ser > 0) {
                            return (ser) + "0,000 年";
                        } else {
                            return "" + (ser) + "0,000 年";
                        }
                        break;

                    case "thou":
                        if (ser == 0) {
                            return "1" + "(" + ser + ")";
                        } else if (ser > 0) {
                            return (ser) + "000 年";
                        } else {
                            return "" + (ser) + "000 年";
                        }
                        break;

                    case "ce":
                        if (ser == 0) {
                            return "1" + "(" + ser + ")";
                        } else if (ser > 0) {
                            return (ser) + "00 年";
                        } else {
                            return "" + (ser) + "00 年";
                        }
                        break;


                    case "de":
                        if (ser > 120) {
                            return (ser * 10) + " 年代";
                        } else {
                            return (ser * 10) + " 年";
                        }
                        break;

                    case "ye":
                        return ser + " 年";
                        break;

                    case "mo":

                        i = TG_Date.getDateFromMonthNum(ser);

                        if (tw < 120) {
                            return i.ye + " 年 " + TG_Date.monthNamesAbbr[i.mo];
                        } else {
                            return i.ye + " 年 " + TG_Date.monthNames[i.mo];
                        }
                        break;


                    case "da":

                        // COSTLY: test performance here on dragging
                        i = new TG_Date(TG_Date.getDateFromRD(ser));

                        if (tw < 120) {
                            return i.ye + " 年 " + TG_Date.monthNamesAbbr[i.mo] + " " + i.da + " 日";
                        } else {
                            return i.ye + " 年 " + TG_Date.monthNames[i.mo] + " " + i.da + " 日";
                        }
                        break;

                    default:
                        return obj.unit + ":" + ser + ":" + tw;
                }

            },

            /*
             *	tickHangies
             *  When dragging the interface, we detect when to add a new
             *  tick on left or right side: whether the outer tick has
             *  come within a 100px margin of the left or right of the frame
             *
             */
            tickHangies: function() {
                var tPos = $(TICKS).position().left,
                    lHangie = this.leftside + tPos,
                    rHangie = this.rightside + tPos - this.dimensions.container.width,
                    tickPack, added = false,
                    me = this;

                if (lHangie > -100) {
                    tickPack = this.addTick({ "type": "l" });
                    me.appendTimelines(tickPack, "left");
                } else if (rHangie < 100) {
                    tickPack = this.addTick({ "type": "r" });
                    me.appendTimelines(tickPack, "right");
                }
            },


            /* tickUnit, fd */
            tickOffsetFromDate: function(zoominfo, fdate, tickwidth) {

                // switch unit, calculate width gain or loss.... or just loss!
                var w = tickwidth,
                    u = zoominfo.unit,
                    p, prop;

                switch (u) {
                    case "da":
                        // @4:30        4/24                30 / 1440
                        //              .1666                .0201
                        prop = ((fdate.ho) / 24) + ((fdate.mi) / 1440);
                        p = w * prop;
                        break;

                    case "mo":

                        var mdn = TG_Date.getMonthDays(fdate.mo, fdate.ye);

                        prop = ((fdate.da - 1) / mdn) + (fdate.ho / (24 * mdn)) + (fdate.mi / (1440 * mdn));
                        p = w * prop;
                        break;

                    case "ye":
                        prop = (((fdate.mo - 1) * 30) + fdate.da) / 365;
                        p = w * prop;
                        break;

                    case "de":
                        //
                        // 1995
                        prop = ((fdate.ye % 10) / 10) + (fdate.mo / 120);
                        p = w * prop;
                        break;

                    case "ce":
                        prop = ((fdate.ye % 100) / 100) + (fdate.mo / 1200);
                        p = w * prop;
                        break;

                    case "thou":
                        prop = ((fdate.ye % 1000) / 1000);
                        p = w * prop;
                        break;

                    case "tenthou":

                        prop = ((fdate.ye % 10000) / 10000);
                        p = w * prop;
                        break;

                    case "hundredthou":

                        prop = ((fdate.ye % 100000) / 100000);
                        p = w * prop;
                        break;

                    case "mill":

                        prop = ((fdate.ye % 1000000) / 1000000);
                        p = w * prop;
                        break;

                    case "tenmill":

                        prop = ((fdate.ye % 10000000) / 10000000);
                        p = w * prop;
                        break;

                    case "hundredmill":

                        prop = ((fdate.ye % 100000000) / 100000000);
                        p = w * prop;
                        break;

                    case "bill":

                        prop = ((fdate.ye % 1000000000) / 1000000000);
                        p = w * prop;
                        break;

                    default:
                        p = 0;

                }

                return -1 * p;
            },


            resetTicksHandle: function() {
                var me = this;
                $(me._views.HANDLE).offset({ "left": $(CONTAINER).offset().left });
            },


            throttledResetTicksHandle: _.throttle(function() {
                this.resetTicksHandle();
            }, 500),


            easeOutTicks: function() {

                if (Math.abs(ticksSpeed) > 5) {
                    // This works, but isn't great:offset fails to register
                    // for new tim as it ends animation...

                    $(TICKS).animate({ left: '+=' + (3 * ticksSpeed) }, 1000, "easeOutQuad", function() {
                        //debug.trace("stopping easing", "note")
                    });
                }

            },



            /*
            @param    obj with { tick  |  timeline }
            @return   array of event ids
            This is per-timeline...
            */
            getTimelineEventsByTick: function(obj) {

                var unit = obj.tick.unit,
                    serial = obj.tick.serial,
                    hash = MED.eventCollection.getTimelineHash(obj.timeline.timeline_id);

                if (hash[unit][serial] && hash[unit][serial].length > 0) {
                    // looking for an array of events...
                    return hash[unit][serial];
                } else {
                    return [];
                }

            },


            passesFilters: function(ev, zoomLevel) {
                var ret = true,
                    ev_icon = "",
                    ei = "",
                    ea = [],
                    e, titl, desc,
                    ii = "",
                    ia = [],
                    da = [],
                    i;

                // MASTER FILTER BY THRESHOLD
                if ((zoomLevel < ev.low_threshold) || (zoomLevel > ev.high_threshold)) {
                    return false;
                }

                if (MED.filters.imp_min && MED.filters.imp_min > 1) {
                    if (ev.importance < MED.filters.imp_min) { return false; }
                }

                if (MED.filters.imp_max && MED.filters.imp_max < 100) {
                    if (ev.importance > MED.filters.imp_max) { return false; }
                }


                if (MED.filters.custom && typeof MED.filters.custom == "function") {
                    ret = MED.filters.custom(ev, zoomLevel);

                } else {


                    if (MED.filters.include) {
                        // title OR description
                        ret = false;
                        var incl = MED.filters.include;
                        ea = incl.split(",");
                        for (e = 0; e < ea.length; e++) {
                            ei = new RegExp($.trim(ea[e]), "i");
                            if (ev.title.match(ei) || ev.description.match(ei)) { ret = true; }
                        }

                    } else {

                        // KEYWORDS FOR SHOWING THIS EVENT
                        if (MED.filters.title) {

                            titl = MED.filters.title;
                            ia = titl.split(",");
                            ret = false;
                            // cycle through comma separated include keywords
                            for (i = 0; i < ia.length; i++) {
                                ii = new RegExp($.trim(ia[i]), "i");
                                if (ev.title.match(ii)) { ret = true; }
                            }
                        }

                        // KEYWORDS FOR SHOWING THIS EVENT
                        if (MED.filters.description) {

                            desr = MED.filters.description;
                            da = desr.split(",");
                            ret = false;
                            // cycle through comma separated include keywords
                            for (i = 0; i < da.length; i++) {
                                ii = new RegExp($.trim(da[i]), "i");
                                if (ev.description.match(ii)) { ret = true; }
                            }
                        }

                    }

                    if (MED.filters.exclude) {
                        var excl = MED.filters.exclude;
                        ea = excl.split(",");
                        for (e = 0; e < ea.length; e++) {
                            ei = new RegExp($.trim(ea[e]), "i");
                            if (ev.title.match(ei) || ev.description.match(ei)) { ret = false; }
                        }
                    }



                    // TAGS FILTER
                    if (MED.filters.tags.length > 0) {
                        if (ev.tags) {
                            // we'll assume it's not going to match first
                            ret = false;
                            ev_tags = ev.tags.split(",");
                            _.each(ev_tags, function(tag) {
                                tag = $.trim(tag);
                                if (_.indexOf(MED.filters.tags, tag) !== -1) {
                                    ret = true;
                                }
                            });
                        } else {
                            // event has no tags at all..
                            ret = false;
                        }
                    }



                    // LEGEND FILTER
                    if (MED.filters.legend.length > 0) {
                        ev_icon = ev.icon;
                        if (_.indexOf(MED.filters.legend, ev_icon) == -1) {
                            // if it's not in the legend list
                            ret = false;
                        }
                    }

                } // end if/else for custom filter function

                /////////////

                return ret;
            },



            /*
            ADDING EVENTS ON INITIAL SWEEP!
            invoked upon a fresh sweep of entire container, having added a set of ticks
            	--- occurs on expand/collapse
            	--- ticks are created afresh
            */
            freshTimelines: function() {

                var me = this,
                    t, i, tl, tlView, tlModel, tu, ts, tick, tE, tl_ht, t_f, t_l,
                    active = MED.activeTimelines,
                    ticks = MED.ticksArray,
                    borg = '',
                    $title, $ev, $tl,
                    evid, ev,
                    stuff = '',
                    cx = me.dimensions.container.centerx,
                    cw = me.dimensions.container.width,
                    foSec = MED.getFocusDate().sec,
                    zi = MED.getZoomInfo(),
                    spp = zi.spp,
                    zl = zi.level,
                    tickUnit = zi.unit,
                    tArr = [],
                    idArr = [],
                    // left and right scope
                    half = Math.floor(spp * (cw / 2)),
                    lsec = foSec - half,
                    rsec = foSec + half,
                    tz_offset = 0,
                    tbwidth = 0,
                    spanin,
                    legend_label = "",
                    spanins = [],
                    expCol, tl_top = 0,
                    cht = me.dimensions.container.height,
                    ceiling = 0,
                    tl_min_bottom = MED.options.minimum_timeline_bottom,
                    ticks_ht = me.dimensions.ticks.height;


                /////////////////////////////////////////

                /*
                var testDate = MED.getFocusDate();

                var tdFocus = Math.floor(testDate.sec);

                var tickSec = me.getTickSeconds['da'](testDate.rd);
                */

                //////////////////////////////////////////
                $.publish(container_name + ".viewer.rendering");

                for (var a = 0; a < active.length; a++) {

                    idArr = [];

                    // FOR EACH _ACTIVE_ TIMELINE...
                    tlModel = MED.timelineCollection.get(active[a]);



                    tl = tlModel.attributes;

                    tl.visibleEvents = [];

                    if (MED.viewMode == "timeline") {



                        expCol = tl.display;

                        // TODO establish the 120 below in some kind of constant!
                        // meanwhile: tl_top is the starting height of a loaded timeline
                        tl_bottom = (tl.bottom) ? stripPx(tl.bottom) : tl_min_bottom;
                        if (tl_bottom < tl_min_bottom) tl_bottom = tl_min_bottom;

                        tl_top = ticks_ht - tl_bottom;

                        tl_min_bottom = MED.options.minimum_timeline_bottom;

                        tlView = new tg.TG_TimelineView({ model: tlModel });

                        tz_offset = MED.timeOffset.seconds / spp;

                        $tl = $(tlView.render().el).appendTo(TICKS);

                        var laneTops = {};


                        if (tlModel.get('hasLanes') && tlModel.get('useLanes')) {
                            // clear existing lanes
                            $(".tg-lane").remove();
                            var $lane, lane_top = 32,
                                ltop;

                            _.each(tlModel.get('lanes'), function(lane) {

                                ltop = lane.top || (lane_top += 30);
                                $lane = $("<div class='tg-lane'>" + lane.title + "<div class='arrow-right'></div></div>");

                                $lane.appendTo($tl)
                                    .draggable({
                                        axis: "y",
                                        stop: function(event, ui) {
                                            lane.top = Math.abs($(event.target).position().top);
                                            MED.refresh()
                                        }
                                    })
                                    .css({ "top": -1 * ltop, "border-left": "4px solid " + lane.color })
                                    .find(".arrow-right").css({ "border-left": "10px solid " + lane.color })

                                lane.top = laneTops[lane.id] = Math.abs(ltop);

                            });

                        }


                        $title = $tl.find(".titleBar");
                        // this is the individual (named) timeline, not the entire interface


                        // if a single timeline, set images to the bottom
                        var tbh = $title.outerHeight();

                        me.room = tl_top; // (cht - (Math.abs(tl_top) + tbh)) - (me.dimensions.footer.height + me.dimensions.tick.height);


                        $tl.draggable({
                                axis: "y",
                                handle: ".titleBar",

                                stop: function() {


                                    var posi = $(this).position();

                                    // chrome doesn't allow access the new bottom
                                    var new_bottom = (ticks_ht - stripPx($(this).css("top"))) - 1;

                                    if (new_bottom < tl_min_bottom) {
                                        $(this).css("bottom", tl_min_bottom);
                                        new_bottom = tl_min_bottom;
                                    }

                                    var tid = $(this).attr("id");

                                    // if we've dragged the timeline up or down
                                    // reset its .top value and refresh, mainly
                                    // to reset ceiling (+/visible) properties
                                    var tl = MED.timelineCollection.get(tid);
                                    tl.set({ bottom: new_bottom });

                                    // if a single timeline, set images to the bottom
                                    var tbh = $title.outerHeight();

                                    me.room = me.dimensions.ticks.height - new_bottom;

                                    MED.refresh();
                                }
                            })
                            .css({ "bottom": tl_bottom, "left": tz_offset });



                        if (typeof tl.bounds != "undefined") {

                            t_f = cx + ((tl.bounds.first - foSec) / spp);
                            t_l = cx + ((tl.bounds.last - foSec) / spp);
                        } else {
                            // if no events, we have to make this up
                            t_f = cx;
                            t_l = cx + 300;
                        }

                        tbwidth = Math.floor(t_l - t_f);

                        var tmax = 1000000;
                        var farl = -1 * (tmax - 2000);

                        // browsers have a maximum width for divs before
                        // they konk out... if we get to a high point, we
                        // can truncate the div, but have to make sure to
                        // equally adjust the left position if the right
                        // end of the div is needing to be placed in-screen
                        // whew.
                        if (tbwidth > tmax) {
                            var dif = tbwidth - tmax;
                            tbwidth = tmax;
                            if (t_f < farl) {
                                t_f = t_f + dif;
                            }
                        }

                        $title.css({ "top": tl_ht, "left": t_f, "width": tbwidth }).data({ "lef": t_f, "wid": tbwidth });

                        /// for initial sweep display, setup fresh borg for organizing events
                        if (expCol == "expanded") { tl.borg = borg = new timeglider.TG_Org(); }


                        var tick;
                        //cycle through ticks for hashed events
                        for (var tx = 0; tx < ticks.length; tx++) {
                            tick = ticks[tx];
                            tArr = this.getTimelineEventsByTick({ tick: tick, timeline: tl });
                            idArr = _.union(idArr, tArr);
                        }

                        tl.visibleEvents = idArr;

                        // detect if there are boundless spans (bridging, no start/end points)

                        _.each(tl.spans, function(spanin) {

                            if (_.indexOf(idArr, spanin.id) === -1) {

                                if ((spanin.start < lsec && spanin.end > rsec) ||
                                    (spanin.end < rsec && spanin.end > lsec)) {

                                    // adds to beginning to prioritize
                                    idArr.unshift(spanin.id);
                                    tl.visibleEvents.push(spanin.id);

                                }

                            }

                        });


                        // clean out dupes with _.uniq
                        stuff = this.compileTickEventsAsHtml(tl, _.uniq(idArr), 0, "sweep", tickUnit);


                        // future planning for scrollable overflow
                        if (options.event_overflow == "scroll") {

                            ceiling = 10000;

                        } else {

                            //!TODO: does ANY timeline have an image lane??
                            if (tl.inverted) {
                                ceiling = tl_bottom - 16;

                            } else {
                                ceiling = (tl.hasImageLane || tg.mode == "authoring") ? (tl_top - MED.image_lane_height) - me.singleTitleHeight : tl_top - me.singleTitleHeight;

                            }


                        }


                        var onIZoom = (tl.initial_zoom == MED.getZoomLevel());


                        if (expCol == "expanded") {
                            stuff = borg.getHTML({ tickScope: "sweep", ceiling: ceiling, onIZoom: onIZoom, inverted: tl.inverted, laneTops: laneTops });
                            tl.borg = borg.getBorg();
                        }

                        if (stuff != "undefined") {
                            $tl.append(stuff.html);
                            me.adjustScroller(stuff.high, stuff.low);
                        }

                        setTimeout(function() {
                            me.registerEventImages($tl);
                        }, 100);



                        ////////////
                        /////////////////////
                        // MOBILE LIST MODE
                        /////////////////////
                        ////////////
                    } else if (MED.viewMode == "list") {

                        // CREATE "hideTimelineControls"

                        /*
                        $(".tg-footer-center").hide();
                        $(".timeglider-slider-container").hide();
                        $(".tg-image-lane-pull").hide();
                        $(".timeglider-truck").hide();
                        $(".timeglider-centerline").hide();
                        */

                        // WIPE OUT ENTIRE ELEMENT EACH TIME
                        $("#tg-list-wrapper").remove();

                        // AND RECREATE
                        var $tg_list_container = $("<div id='tg-list-wrapper'><div id='tg-list' class='tg-list-events'><ul id='list-events-ul' class='list-ul'></ul></div></div>").prependTo(CONTAINER);


                        // remember, this is inside a or loop!
                        var hash = MED.eventCollection.getTimelineHash(tlModel.get("id"));
                        var evts = [];

                        _.each(hash.all, function(evid) {
                            ev = MED.eventCollection.get(evid).attributes;
                            // with list, ignore zoom level

                            if (me.passesFilters(ev, 0) === true) {
                                evts.push(ev);
                            }
                        });

                        // change this to TG_OrgList
                        var borg = new timeglider.TG_OrgList(evts, MED);


                        stuff = borg.getHTML();
                        // EVERYTHING ADDED HERE


                        if (stuff != "undefined") { $(".tg-list-events ul").append(stuff.html); }


                        var testing_touch = true;


                        if (CLICKORTOUCH == "touchstart" || testing_touch) {
                            tg.listIScroll = new iScroll('tg-list-wrapper');
                        } else {
                            // apply jscrollpane to list ?
                            if ($.fn.jScrollPane) {
                                $(".tg-list-events").jScrollPane();
                            }

                            tg.listIScroll = { animating: false };
                        }

                        setTimeout(function() {
                            $(".tg-legend .tg-legend-close").trigger(CLICKORTOUCH);
                        }, 300);

                        // use click even with mobile view
                        $(".tg-list-li").bind("click", function() {
                            if (tg.listIScroll.distance > 20 || tg.listIScroll.moved) return false;
                            var $ev = $(this);
                            var evid = $ev.attr("id");
                            me.eventModal(evid, $ev);
                        });

                    } // end list/timeline if




                } // end for each timeline


                // initial title shift since it's not on-drag
                me.registerTitles();


                setTimeout(function() {
                    me.applyFilterActions();
                    MED.setInitialScope();
                }, 300);


                $.publish(container_name + ".viewer.rendered");

            }, // ends freshTimelines()



            /*
             * appendTimelines
             * @param tick {Object} contains serial, time-unit, and more info
             */
            appendTimelines: function(tick, side) {

                var active = MED.activeTimelines,
                    idArr = [],
                    tModel, $tl, tl, f,
                    stuff = "",
                    diff = 0,
                    ceiling = 0,
                    me = this;

                $.publish(container_name + ".viewer.rendering");

                for (var a = 0; a < active.length; a++) {

                    tModel = MED.timelineCollection.get(active[a]);
                    tl = tModel.attributes;

                    // get the events from timeline model hash
                    idArr = this.getTimelineEventsByTick({ tick: tick, timeline: tl });

                    tl.visibleEvents = _.union(tl.visibleEvents, idArr);

                    tl_top = (tl.top) ? stripPx(tl.top) : (me.initTimelineVOffset);

                    // we need to see if the right end of a long span
                    // is present in the newly added tick
                    if (side == "left") {

                        _.each(tl.spans, function(spanin) {

                            //var diff = tick.seconds.start - spanin.end;
                            if (spanin.end < tick.seconds.end && spanin.end > tick.seconds.start) {


                                //not already in array
                                if (_.indexOf(tl.visibleEvents, spanin.id) === -1) {
                                    // add to beginning to prioritize
                                    idArr.unshift(spanin.id);
                                    tl.visibleEvents.push(spanin.id);
                                }
                            }

                        });

                    }


                    var laneTops = {};

                    if (tModel.get('hasLanes') && tModel.get('useLanes')) {

                        _.each(tModel.get('lanes'), function(lane) {
                            laneTops[lane.id] = Math.abs(lane.top);
                        });

                    }


                    // this either puts it into the timeline's borg object
                    // or, if compressed, creates HTML for compressed version.
                    // stuff here would be null if expanded...
                    stuff = this.compileTickEventsAsHtml(tl, idArr, tick.serial, "append", tick.unit);

                    // TODO: make 56 below part of layout constants collection
                    if (options.event_overflow == "scroll") {
                        ceiling = 10000;
                    } else {
                        ceiling = (tl.hasImageLane) ? (tl_top - MED.image_lane_height) - me.singleTitleHeight : tl_top;
                    }


                    var onIZoom = (tl.initial_zoom == MED.getZoomLevel());

                    // borg it if it's expanded.
                    if (tl.display == "expanded") {
                        // tl.top is the ceiling
                        stuff = tl.borg.getHTML({ tickScope: tick.serial, ceiling: ceiling, onIZoom: onIZoom, inverted: tl.inverted, laneTops: laneTops });
                    }

                    var $vu = $(CONTAINER + " .tg-timeline-envelope#" + tl.id);

                    $vu.append(stuff.html);

                    me.adjustScroller(stuff.low, stuff.high);

                    this.registerEventImages($tl);

                } // end for() in active timelines

                // this needs to be delayed because the append usually
                // happens while dragging, which already brings the
                // browser to the processor limits; make timeout time
                // below larger if things are crashing : )
                setTimeout(function() { me.applyFilterActions(); }, 500);

                $.publish(container_name + ".viewer.rendered");

            }, // end appendTimelines()





            // events array, MED, tl, borg,
            // "sweep" vs tick.serial  (or fresh/append)
            /*
             *
             * @param btype {String} "sweep" || "append"
             *
             *
             */
            compileTickEventsAsHtml: function(tl, idArr, tick_serial, btype, tickUnit) {


                var me = this,
                    posx = 0,
                    cx = this.dimensions.container.centerx,
                    expCol = tl.display,
                    ht = 0,
                    stuff = "",
                    foSec = MED.startSec,
                    zi = MED.getZoomInfo(),
                    spp = zi.spp,
                    zl = zi.level,
                    buffer = 16,
                    img_ht = 0,
                    img_wi = 0,
                    borg = tl.borg || "",
                    ev = {},
                    font_ht = 0,
                    shape = {},
                    colTop = 0,
                    impq,
                    block_arg = "sweep"; // default for initial load


                if (borg) tl.borg.clearFresh();


                var isBig = function(tu) {
                    if (tu == "da" || tu == "mo" || tu == "ye" || tu == "de" || tu == "ce" || tu == "thou") {
                        return false;
                    } else {
                        return true;
                    }
                };

                if (btype == "append") {
                    block_arg = tick_serial;
                }

                for (var i = 0; i < idArr.length; i++) {

                    // BBONE
                    ev = MED.eventCollection.get(idArr[i]).attributes;

                    if (this.passesFilters(ev, zl) === true) {

                        // the larger units (>=thou) have have an error
                        // in their placement from long calculations;
                        // we can compensate for them here...
                        var adjust = (isBig(tickUnit)) ? .99795 : 1;
                        var ev_sds = ev.startdateObj.sec * adjust;

                        posx = cx + ((ev_sds - foSec) / spp);


                        if (expCol == "expanded") {

                            impq = (tl.size_importance === true || tl.size_importance === 1) ? tg.scaleToImportance(ev.importance, zl) : 1;

                            ev.width = (ev.titleWidth * impq) + buffer;
                            ev.fontsize = MED.base_font_size * impq;
                            ev.left = posx;
                            ev.spanwidth = 0;

                            if (ev.span == true) {
                                ev.spanwidth = ((ev.enddateObj.sec - ev.startdateObj.sec) / spp);
                                if (ev.spanwidth > ev.width) { ev.width = ev.spanwidth + buffer; }
                            }

                            img_ht = 0;

                            font_ht = Math.ceil(ev.fontsize);

                            ev.height = ev.fixed_height || (font_ht + 4);
                            ev.top = ht - ev.height;
                            ev.bottom = 0;

                            if (ev.image && ev.image.display_class == "inline") {

                                var img_scale = (ev.image.scale || 100) / 100;
                                img_ht = (img_scale * ev.image.height) + 2;
                                img_wi = (img_scale * ev.image.width) + 2;

                                // !TODO
                                // THIS NEEDS TO BE REVERSABLE WITH POLARITY
                                // WORKS ONLY WITH BOTTOM-UP CURRENTLY

                                ev.shape = {
                                    "img_ht": img_ht,
                                    "img_wi": img_wi,
                                    "title": "shape",
                                    "top": (ev.top - (img_ht + 8)),
                                    "bottom": ev.bottom,
                                    "left": ev.left,
                                    "right": ev.left + (img_wi + 8)
                                };


                            } else {
                                ev.shape = "";
                            }


                            // block_arg is either "sweep" for existing ticks
                            // or the serial number of the tick being added by dragging
                            borg.addBlock(ev, block_arg);

                            // end expanded state

                        } else if (expCol == "collapsed") {
                            if (tl.inverted) {
                                colTop = 4;
                            } else {
                                colTop = ht - 20;
                            }

                            colIcon = (ev.icon) ? tg.icon_folder + ev.icon : tg.icon_folder + "shapes/circle_white.png";

                            stuff += "<div id='" + ev.id +
                                "' class='timeglider-timeline-event tg-event-collapsed' style='top:" +
                                colTop + "px;left:" + posx + "px'><img src='" + colIcon + "'></div>";
                        }
                    } // end if it passes filters

                }

                if (expCol == "collapsed") {
                    return { html: stuff };
                } else {
                    // if expanded, "stuff" is
                    // being built into the borg
                    return "";
                }

            },


            /*
             *  registerEventImages
             *  Events can have classes applied to their images; these routines
             *  take care of doing non-css-driven positioning after the layout
             *  has finished placing events in the tick sphere.
             *
             *
             */
            registerEventImages: function($timeline) {
                var me = this,
                    laneHt = MED.image_lane_height,
                    padding = 4,
                    laneMax = 400,
                    stht = this.singleTitleHeight;

                if (laneHt > laneMax) { laneHt = laneMax; }


                $(CONTAINER + " .timeglider-event-image-lane").each(

                    function() {

                        var $div = $(this),
                            imgHt = laneHt - (padding / 2),
                            $img = $(this).find("img"),
                            imax = parseInt($div.data("max_height"), 10) || laneMax;

                        if (imax < imgHt) {
                            imgHt = imax;
                        }

                        if (imgHt > 10) {
                            $div.css({ "display": "block" })
                                .position({
                                    my: "center top+" + (stht + padding),
                                    at: "center top",
                                    of: $(CONTAINER)
                                })
                                .css({ left: 0 });

                            $img.css("height", imgHt - (padding));

                        } else {
                            $div.css({ "display": "none" });
                        }
                    }
                );


            },

            applyFilterActions: function() {

                var fa = MED.filterActions,
                    collection = MED.eventCollection.models,
                    ev_id;

                if (!_.isEmpty(fa)) {

                    // For performance reasons, having just
                    // one filter function is probably smart : )
                    _.each(fa, function(f) {
                        // filter:actionFilter, fn:actionFunction

                        _.each(collection, function(ev) {
                            if (f.filter(ev)) {
                                ev_id = ev.get("id");
                                // it's passed the filter, so run it through
                                // the action function
                                f.fn($(".timeglider-timeline-event#" + ev_id));
                            }
                        });

                    })
                }

            },


            expandCollapseTimeline: function(id) {
                var tl = MED.timelineCollection.get(id).attributes;
                if (tl.display == "expanded") {
                    tl.display = "collapsed";
                } else {
                    tl.display = "expanded";
                }
                MED.refresh();
            },


            invertTimeline: function(id) {
                var tl = MED.timelineCollection.get(id).attributes;
                if (tl.inverted == false) {
                    tl.inverted = true;
                } else {
                    tl.inverted = false;
                }
                MED.refresh();
            },



            //////// MODALS
            timelineModal: function(id) {

                $(".tg-timeline-modal").remove();

                var me = this,
                    tl = MED.timelineCollection.get(id),
                    $modal;

                if (tl.get("description")) {

                    var ch = me.dimensions.container.height,
                        modal = new this.timelineInfoModal({ model: tl });

                    var hh = $(".tg-widget-header").outerHeight() + 32;


                    var tgcht = $(".timeglider-container").position();


                    $modal = $(modal.render().el)
                        .appendTo("body")
                        .position({
                            my: "left+16 top+39",
                            at: "left top",
                            of: $(".timeglider-container"),
                            collision: "none none"
                        })
                        .css({ "z-index": me.ztop++, "max-height": ch - 64 });

                    if (MED.singleTimelineID) {
                        $modal.find("h4").hide();
                    }



                    if ($.fn.jScrollPane) {
                        $(".jscroll").jScrollPane();
                    }

                }

            },


            /*
             * Generates a horizontal menu of all links
             * in the event's link_json array
             */
            createEventLinksMenu: function(linkage) {
                if (!linkage) return "";

                var html = '',
                    l = 0,
                    lUrl = "",
                    lLab = "";

                if (typeof(linkage) == "string") {
                    // single url string for link: use "link"
                    html = "<li><a href='" + linkage + "' target='_blank'>链接</a></li>"
                } else if (typeof(linkage) == "object") {
                    // array of links with labels and urls
                    for (l = 0; l < linkage.length; l++) {
                        lUrl = linkage[l].url;
                        lLab = linkage[l].label;
                        html += "<li><a href='" + lUrl + "' target='_blank'>" + lLab + "</a></li>"
                    }
                }
                return html;
            },



            eventModal: function(eid, $event) {

                // remove if same event already has modal opened
                $.publish(container_name + ".viewer.eventModal");

                // this removes a duplicate modal
                $(CONTAINER + " #" + eid + "_modal").remove();

                var me = this,
                    map_view = false,
                    video_view = false,
                    map = "",
                    map_options = {},
                    $modal, llar = [],
                    mapZoom = 0,

                    ev = MED.eventCollection.get(eid).attributes,

                    // modal type: first check event, then timeline-wide option
                    modal_type = ev.modal_type || options.event_modal.type;

                var ev_img = (ev.image && ev.image.src) ? "<img src='" + ev.image.src + "'>" : "",

                    links = this.createEventLinksMenu(ev.link),

                    templ_obj = {
                        id: ev.id,
                        title: ev.title,
                        description: ev.description,
                        link: ev.link,
                        dateline: me.getEventDateLine(ev),
                        links: links,
                        image: ev_img
                    }

                if (ev.video) {
                    templ_obj.video = ev.video;
                    modal_type = "full";
                    video_view = true;
                    templ_obj.video = ev.video;
                } else if (ev.map && ev.map.latlong) {
                    map_view = true;
                    modal_type = "full";

                    // if the embed size is small
                } else if ((ev.description.length > 1200) || (me.dimensions.container.width < 500)) {
                    modal_type = "full";
                }
                // return false;

                switch (modal_type) {

                    case "full":

                        $modal = $.tmpl(me._templates.event_modal_full, templ_obj);
                        // full modal with scrim, etc
                        var pad = 32;

                        $modal
                            .appendTo(CONTAINER)
                            .position({
                                my: "left top",
                                at: "left top",
                                of: (CONTAINER),
                                collision: "none none"
                            });

                        var ch = me.dimensions.container.height;
                        var cw = me.dimensions.container.width;
                        var $panel = $modal.find(".tg-full_modal_panel");
                        var pw = cw - 64;
                        var ph = ch - 64;
                        var iw = 0;

                        $panel.css({
                            "width": pw,
                            "height": ph,
                            "top": "32px",
                            "left": "32px"
                        });

                        var $pp = $(".tg-full_modal-body");
                        var pph = ph - 120;


                        if (map_view == true) {

                            // REPLACE WITH OPEN STREET MAPS / LEAFLET
                            //////////////////////////////////////////
                            $map = $("<div id='map_modal_map' class='tg-modal_map'></div>").prependTo($pp);

                            mapZoom = ev.map.zoom || 12;
                            var llarr = String(ev.map.latlong).split(",");

                            var map_ll = new google.maps.LatLng(parseFloat(llarr[0]), parseFloat(llarr[1]));
                            map_options = {
                                zoom: mapZoom,
                                center: map_ll,
                                mapTypeId: google.maps.MapTypeId.ROADMAP
                            }
                            map = new google.maps.Map($("#map_modal_map")[0], map_options);

                            // if there are markers provided in the map:

                            if (ev.map.markers) {

                                for (var i = 0; i < ev.map.markers.length; i++) {
                                    var marker = ev.map.markers[i];
                                    var image = new google.maps.MarkerImage(marker.image,
                                        new google.maps.Size(24, 32),
                                        new google.maps.Point(0, 0),
                                        new google.maps.Point(0, 32)); // "plant" origin is lower left

                                    var loc = marker.latlong.split(",");

                                    var llobj = new google.maps.LatLng(loc[0], loc[1]);

                                    var marker = new google.maps.Marker({
                                        position: llobj,
                                        map: map,
                                        icon: marker.icon,
                                        title: marker.title,
                                        zIndex: marker.zIndex
                                    });
                                }
                            }


                        } else if (video_view == true) {

                            $vid = $("<div class='tg-modal-video'><iframe frameborder='0' src='" + ev.video + "'></iframe></div>").appendTo(".tg-full_modal-vidimg");

                            if (ph > 450) {
                                $vid.find("iframe").css("height", $vid.width() * .66);

                            } else {
                                var mini_h = ph - 80;
                                var mini_w = mini_h * 1.5;
                                $vid.find("iframe").css({ "float": "left", "height": mini_h, "width": mini_w });
                            }


                        }



                        if (ev.image) {
                            var $img = $(".tg-full_modal-body img");
                            var img_max_ht = ph - 110;

                            if (ev.image.height > img_max_ht) {

                                $img.css("height", img_max_ht);

                            } else if (ev.image.width < pw / 3) {
                                // small image
                                iw = ev.image.width;
                                $img.css("width", iw);
                            }


                        }

                        if ($pp.height() > pph - 16) {
                            $pp.css({ "height": pph - 16, "overflow-y": "scroll" });

                        }


                        break;



                    case "link-iframe":
                        // show the link (i.e. Wikipedia, etc) in an iframe

                        $modal = $.tmpl(me._templates.event_modal_iframe, templ_obj);
                        $modal
                            .appendTo(TICKS)
                            .css("z-index", me.ztop++)
                            .position({
                                my: "center top+32",
                                at: "center top",
                                of: $(CONTAINER),
                                collision: "flip fit"
                            })
                            .hover(function() { $(this).css("z-index", me.ztop++); });


                        break;

                    case "custom":


                        break;


                    default:

                        templ_obj.extra_class = (templ_obj.image) ? "has-image" : "no-image";

                        // .appendTo(CONTAINER);
                        // works, but modal does not follow drag

                        $modal = $.tmpl(me._templates.event_modal_small, templ_obj).appendTo(me._views.TICKS);

                        var pad = 8,
                            arrow_class = "",
                            tb_class = "",
                            lr_class = "",
                            ev_left = "",
                            ev_top = $event.position().top,
                            ev_off = $event.offset();

                        var co_ht = me.dimensions.container.height;
                        var co_wi = me.dimensions.container.width;
                        var co_off = me.dimensions.container.offset;

                        var modal_ht = $modal.outerHeight();
                        var modal_wi = $modal.outerWidth();
                        // compensate for height of timeline envelope
                        var env_top = $event.closest(".tg-timeline-envelope").position().top;
                        var space_above = (env_top + ev_top) - 28;

                        var space_below = Math.abs(ev_top);
                        var pos_my = "",
                            pos_at = "";

                        var ev_rel = ev_off.left - co_off.left;
                        var farthest = me.dimensions.container.width - (modal_wi + pad);

                        if (ev_rel < pad) {
                            // shift to the left
                            ev_left = "+" + String(pad + (ev_rel * -1));
                        } else if (ev_rel > farthest) {
                            // it's too far off to the right
                            // find amount that $modal width
                            // plus event offset_left exceeds
                            // container width!
                            var leftward = co_wi - ev_rel;
                            var exc = modal_wi - leftward;
                            ev_left = "-" + (pad * 4 + exc);
                        }

                        if (space_above > modal_ht + 12) {
                            // position above
                            pos_my = "left" + ev_left + " bottom-12";
                            pos_at = "left top";
                        } else if (space_below > modal_ht) {
                            // position modal below the event
                            pos_my = "left" + ev_left + " top+8";
                            pos_at = "left bottom";
                        } else {
                            pos_my = "center" + ev_left + " center";
                            pos_at = "center center";
                        }

                        $modal
                            .css({ "z-index": me.ztop++ })
                            .position({
                                my: pos_my,
                                at: pos_at,
                                of: $event,
                                collision: "flip flip"
                            });

                } // eof switch


                if ($.fn.jScrollPane) {
                    $(".jscroll").jScrollPane();
                }

            }, // eof eventModal



            legendModal: function(id) {

                var me = this;

                var leg = [];

                if (id == "pres" || timeglider.mode == "presentation") {

                    if (typeof MED.presentation.legend == "object") {
                        leg = MED.presentation.legend;
                    }
                } else {
                    leg = MED.timelineCollection.get(id).attributes.legend;
                }

                var html = "",
                    i_sel = "",
                    initClass = "";

                if (options.legend.type === "checkboxes") {
                    initClass = "tg-legend-item tg-legend-icon-selected";
                } else {
                    initClass = "tg-legend-item";

                }

                _.each(leg, function(l) {
                    html += "<li class='" + initClass + "'><img class='tg-legend-icon' src='" + options.icon_folder + l.icon + "'><span class='legend-info'>" + l.title + "</span></li>";
                });

                var templ_obj = { id: id, legend_list: html };

                // remove existing legend
                $(CONTAINER + " .tg-legend").remove();

                $.tmpl(me._templates.legend_modal, templ_obj)
                    .appendTo(CONTAINER)
                    .css("z-index", me.ztop++)
                    .toggleClass("tg-display-none")
                    .position({
                        my: "right-64 top+38",
                        at: "right top",
                        of: $(CONTAINER),
                        collision: "none"
                    });

                i_sel = CONTAINER + " .legend-info, " + CONTAINER + " .tg-legend-item";

                $(CONTAINER).delegate(".tg-legend-item", "mouseup", function(e) {
                    var $legend_item = $(this);

                    var icon = ($legend_item.children("img").attr("src"));
                    $legend_item.toggleClass("tg-legend-icon-selected");
                    MED.setFilters({ origin: "legend", icon: icon });
                });


                // selects all legend items so that
                // only legend-related items are showing on
                // the stage
                if (options.legend.type === "checkboxes") {
                    setTimeout(function() {
                        $(".tg-legend-all").trigger("click");
                    }, 200);
                }
            },



            parseHTMLTable: function(table_id) {
                var obj = {},
                    now = +new Date(),
                    keys = [];

                $('#' + table_id).find('tr').each(function(i) {
                    ////////// each..
                    var children = $(this).children(),
                        row_obj;

                    if (i === 0) {
                        keys = children.map(function() {
                            return $(this).attr('class').replace(/^.*?\btg-(\S+)\b.*?$/, '$1');
                        }).get();

                    } else {
                        row_obj = {};

                        children.each(function(i) {
                            row_obj[keys[i]] = $(this).text();
                        });

                        obj['prefix' + now++] = row_obj;
                    }
                    /////////
                });
                return obj;

            }

        } // end VIEW prototype



    tg.TG_TimelineView = Backbone.View.extend({

        initialize: function(t) {

            var me = this;

            this.mediator = t.model.get("mediator");

            this.model.bind('change:title', function() {
                $(me.el).find(".timeline-title-span").text(me.model.get("title"));
            });

            if (this.mediator.timelineCollection.length > 1 || tg.mode == "authoring") {
                this.titleBar = "fullBar";
            } else {
                this.titleBar = "hiddenBar";
            }

            this.model.bind('destroy', this.remove, this);
        },


        tagName: "div",

        events: {
            "click .timeline-title-span": "titleClick"
        },

        className: "tg-timeline-envelope clearfix",


        getTemplate: function() {

            var tmpl = "",
                env_bts = "",
                env_b = "",
                inverted = "";


            if (this.model.get("inverted")) {
                inverted = " timeline-inverted";

            } else {
                inverted = "";
            }

            if (this.titleBar == "fullBar") {

                tmpl = "<div class='titleBar'>" +
                    "<div class='timeline-title" + inverted + "'>" +
                    "<span class='timeline-title-span'>";
                env_bts = "<div class='tg-env-buttons'>";

                // INFO BUTTON
                if (this.model.get("description")) {
                    env_bts += "<div class='tg-env-button tg-env-info timeline-info-bt' data-timeline_id='${id}'></div>";
                }

                // LEGEND BUTTON
                if (this.model.get("hasLegend")) {
                    env_bts += "<div class='tg-env-button tg-env-legend tg-legend-bt' data-timeline_id='${id}'></div>";
                }

                // INVERT BUTTON
                env_bts += "<div class='tg-env-button tg-env-invert tg-invert-bt' data-timeline_id='${id}'></div>";

                // EXPAND BUTTON
                env_bts += "<div class='tg-env-button tg-env-expcol tg-expcol-bt' data-timeline_id='${id}'></div>";

                env_bts += "</div>";


                // env_b = (timeglider.mode == "preview" || timeglider.mode == "publish") ? env_bts : "";

                tmpl += env_bts + "${title}</span></div></div>";


            } else if (this.titleBar == "imageBar") {
                tmpl = "<div class='titleBar imageBar'></div>";
            } else {
                tmpl = "<div class='titleBar tg-display-none'></div>";
            }

            return tmpl;
        },

        render: function() {

            var me = this;
            var id = me.model.get("id");
            var title = me.model.get("title");

            var _template = me.getTemplate();

            var state_class = this.model.get("inverted") ? "inverted" : "straight-up";

            $(this.el)
                .html($.tmpl(_template, this.model.attributes))
                .attr("id", this.model.get("id"))
                .addClass(state_class);



            return this;
        },


        setText: function() {
            /*
            var text = this.model.get('text');
            this.$('.todo-text').text(text);
            this.input = this.$('.todo-input');
            */
        },


        titleClick: function() {
            MED.timelineTitleClick(this.model.get("id"));
        },


        remove: function() {
            $(this.el).remove();
        }


        //clear: function() {
        //  this.model.destroy();
        //}

    });

    /*
          zoomTree
          ****************
          there's no zoom level of 0, so we create an empty element @ 0

          This could eventually be a more flexible system so that a 1-100
          value-scale could apply not to "5 hours to 10 billion years", but
          rather to 1 month to 10 years. For now, it's static according to
          a "universal" system.
    */

    tg.zoomTree = [
        {},
        { unit: "da", width: 35000, level: 1, label: "30 minutes" },
        { unit: "da", width: 17600, level: 2, label: "1 hour" },
        { unit: "da", width: 8800, level: 3, label: "2 hours" },
        { unit: "da", width: 4400, level: 4, label: "5 hours" },
        { unit: "da", width: 2200, level: 5, label: "10 hours" },
        { unit: "da", width: 1100, level: 6, label: "1 DAY" },
        { unit: "da", width: 550, level: 7, label: "40 hours" },
        { unit: "da", width: 432, level: 8, label: "2 days" },
        { unit: "da", width: 343, level: 9, label: "2.5 days" },
        { unit: "da", width: 272, level: 10, label: "3 days" },
        { unit: "da", width: 216, level: 11, label: "4 days" },
        { unit: "da", width: 171, level: 12, label: "5 days" },
        { unit: "da", width: 136, level: 13, label: "1 WEEK" },
        { unit: "da", width: 108, level: 14, label: "8 days" },
        /* 108 * 30 = equiv to a 3240 month */
        { unit: "mo", width: 2509, level: 15, label: "10 days" },
        { unit: "mo", width: 1945, level: 16, label: "2 WEEKS" },
        { unit: "mo", width: 1508, level: 17, label: "18 days" },
        { unit: "mo", width: 1169, level: 18, label: "3 weeks" },
        { unit: "mo", width: 913, level: 19, label: "1 MONTH" },
        { unit: "mo", width: 719, level: 20, label: "5 weeks" },
        { unit: "mo", width: 566, level: 21, label: "6 weeks" },
        { unit: "mo", width: 453, level: 22, label: "2 MONTHS" },
        { unit: "mo", width: 362, level: 23, label: "10 weeks" },
        { unit: "mo", width: 290, level: 24, label: "3 MONTHS" },
        { unit: "mo", width: 232, level: 25, label: "4 months" },
        { unit: "mo", width: 186, level: 26, label: "5 months" },
        { unit: "mo", width: 148, level: 27, label: "6 MONTHS" },
        { unit: "mo", width: 119, level: 28, label: "7 months" },
        { unit: "mo", width: 95, level: 29, label: "9 months" },
        { unit: "mo", width: 76, level: 30, label: "1 YEAR" },
        /* 76 * 12 = equiv to a 912 year */
        { unit: "ye", width: 723, level: 31, label: "15 months" },
        { unit: "ye", width: 573, level: 32, label: "18 months" },
        { unit: "ye", width: 455, level: 33, label: "2 YEARS" },
        { unit: "ye", width: 361, level: 34, label: "2.5 years" },
        { unit: "ye", width: 286, level: 35, label: "3 years" },
        { unit: "ye", width: 227, level: 36, label: "4 years" },
        { unit: "ye", width: 179, level: 37, label: "5 years" },
        { unit: "ye", width: 142, level: 38, label: "6 years" },
        { unit: "ye", width: 113, level: 39, label: "8 years" },
        { unit: "ye", width: 89, level: 40, label: "10 years" },
        { unit: "de", width: 705, level: 41, label: "13 years" },
        { unit: "de", width: 559, level: 42, label: "16 years" },
        { unit: "de", width: 443, level: 43, label: "20 years" },
        { unit: "de", width: 302, level: 44, label: "25 years" },
        { unit: "de", width: 240, level: 45, label: "30 years" },
        { unit: "de", width: 190, level: 46, label: "40 years" },
        { unit: "de", width: 150, level: 47, label: "50 years" },
        { unit: "de", width: 120, level: 48, label: "65 years" },
        { unit: "de", width: 95, level: 49, label: "80 years" },
        { unit: "de", width: 76, level: 50, label: "100 YEARS" },
        { unit: "ce", width: 600, level: 51, label: "130 years" },
        { unit: "ce", width: 480, level: 52, label: "160 years" },
        { unit: "ce", width: 381, level: 53, label: "200 YEARS" },
        { unit: "ce", width: 302, level: 54, label: "250 years" },
        { unit: "ce", width: 240, level: 55, label: "300 years" },
        { unit: "ce", width: 190, level: 56, label: "400 years" },
        { unit: "ce", width: 150, level: 57, label: "500 YEARS" },
        { unit: "ce", width: 120, level: 58, label: "600 years" },
        { unit: "ce", width: 95, level: 59, label: "1000 YEARS" },
        { unit: "ce", width: 76, level: 60, label: "1100 years" },
        { unit: "thou", width: 603, level: 61, label: "1500 years" },
        { unit: "thou", width: 478, level: 62, label: "2000 years" },
        { unit: "thou", width: 379, level: 63, label: "2500 years" },
        { unit: "thou", width: 301, level: 64, label: "3000 years" },
        { unit: "thou", width: 239, level: 65, label: "4000 years" },
        { unit: "thou", width: 190, level: 66, label: "5000 YEARS" },
        { unit: "thou", width: 150, level: 67, label: "6000 years" },
        { unit: "thou", width: 120, level: 68, label: "7500 years" },
        { unit: "thou", width: 95, level: 69, label: "10,000 YEARS" },
        { unit: "thou", width: 76, level: 70, label: "12,000 years" },
        { unit: "tenthou", width: 603, level: 71, label: "15,000 years" },
        { unit: "tenthou", width: 358, level: 72, label: "25,000 years" },
        { unit: "tenthou", width: 213, level: 73, label: "40,000 years" },
        { unit: "tenthou", width: 126, level: 74, label: "70,000 years" },
        { unit: "tenthou", width: 76, level: 75, label: "100,000 YEARS" },
        { unit: "hundredthou", width: 603, level: 76, label: "150,000 years" },
        { unit: "hundredthou", width: 358, level: 77, label: "250,000 years" },
        { unit: "hundredthou", width: 213, level: 78, label: "400,000 years" },
        { unit: "hundredthou", width: 126, level: 79, label: "700,000 years" },
        { unit: "hundredthou", width: 76, level: 80, label: "1 百万 years" },
        { unit: "mill", width: 603, level: 81, label: "1.5 百万 years" },
        { unit: "mill", width: 358, level: 82, label: "3 百万 years" },
        { unit: "mill", width: 213, level: 83, label: "4 百万 years" },
        { unit: "mill", width: 126, level: 84, label: "6 百万 years" },
        { unit: "mill", width: 76, level: 85, label: "10 百万 years" },
        { unit: "tenmill", width: 603, level: 86, label: "15 百万 years" },
        { unit: "tenmill", width: 358, level: 87, label: "25 百万 years" },
        { unit: "tenmill", width: 213, level: 88, label: "40 百万 years" },
        { unit: "tenmill", width: 126, level: 89, label: "70 百万 years" },
        { unit: "tenmill", width: 76, level: 90, label: "100 百万 years" },
        { unit: "hundredmill", width: 603, level: 91, label: "120 百万 years" },
        { unit: "hundredmill", width: 358, level: 92, label: "200 百万 years" },
        { unit: "hundredmill", width: 213, level: 93, label: "300 百万 years" },
        { unit: "hundredmill", width: 126, level: 94, label: "500 百万 years" },
        { unit: "hundredmill", width: 76, level: 95, label: "1 billion years" },
        { unit: "bill", width: 603, level: 96, label: "15 百万 years" },
        { unit: "bill", width: 358, level: 97, label: "30 百万 years" },
        { unit: "bill", width: 213, level: 98, label: "50 百万 years" },
        { unit: "bill", width: 126, level: 99, label: "80 百万 years" },
        { unit: "bill", width: 76, level: 100, label: "100 billion years" }
    ];

    // immediately invokes to create extra information in zoom tree
    //
    tg.calculateSecPerPx = function(zt) {
        for (var z = 1; z < zt.length; z++) {
            var zl = zt[z];
            var sec = 0;
            switch (zl.unit) {
                case "da":
                    sec = 86400;
                    break;
                case "mo":
                    sec = 2419200;
                    break; // assumes only 28 days per
                case "ye":
                    sec = 31536000;
                    break;
                case "de":
                    sec = 315360000;
                    break;
                case "ce":
                    sec = 3153600000;
                    break;
                case "thou":
                    sec = 31536000000;
                    break;
                case "tenthou":
                    sec = 315360000000;
                    break;
                case "hundredthou":
                    sec = 3153600000000;
                    break;
                case "mill":
                    sec = 31536000000000;
                    break;
                case "tenmill":
                    sec = 315360000000000;
                    break;
                case "hundredmill":
                    sec = 3153600000000000;
                    break;
                case "bill":
                    sec = 31536000000000000;
                    break;
            }
            // generate hash for seconds per pixel
            zl.spp = Math.round(sec / parseInt(zl.width));

        }

        // call it right away to establish values
    }(tg.zoomTree); // end of zoomTree


    /* a div with id of "hiddenDiv" has to be pre-loaded */
    tg.getStringWidth = function(str) {

        var $ms = $("#timeglider-measure-span");
        $ms.css("font-size", MED.base_font_size);

        if (str) {
            // for good measure, make it a touch larger
            return $ms.html(str).width() + MED.base_font_size;
        } else {
            return false;
        }
    };



    tg.scaleToImportance = function(imp, zoom_level) {
            // flash version: return ((importance - zoomLev) * 4.5) + 100;
            // 100 being 1:1 or 12 px

            // first basic version: return imp / zoo;

            return (((imp - zoom_level) * 4.5) + 100) / 100;
        },




        String.prototype.removeWhitespace = function() {
            var rg = new RegExp("\\n", "g")
            return this.replace(rg, "");
        }



    if (debug) {
        // adding a screen display for anything needed
        debug.trace = function(stuff, goes) {
            $("#" + goes).text(stuff);
        }
    }


    tg.googleMapsInit = function() {
        // debug.log("initializing google maps...")
    }

    tg.googleMapsLoaded = false;
    tg.googleMapsLoad = function() {


        // if (tg.googleMapsLoaded == false) {

        // 	var script = document.createElement('script');
        //     script.type = 'text/javascript';
        //     script.src = 'http://maps.googleapis.com/maps/api/js?sensor=false&' +
        //         'callback=timeglider.googleMapsInit';
        //     document.body.appendChild(script);

        //     tg.googleMapsLoaded = true;
        // }

    }



})(timeglider);
/*
 * Timeglider for Javascript / jQuery 
 * http://timeglider.com/jquery
 *
 * Copyright 2013, Mnemograph LLC
 * Licensed under Timeglider Dual License
 * http://timeglider.com/jquery/?p=license
 *
 */

/*******************************
	TIMELINE MEDIATOR
	¥ handles timeline behavior, 
	¥ reflects state back to view
	¥ owns the timeline and event data models

********************************/
(function(tg) {


    var MED = {},
        TG_Date = tg.TG_Date,
        options = {},
        $ = jQuery,
        $container = {},
        container_name = '';


    tg.TG_Mediator = function(wopts, $el) {

            this.options = options = wopts;

            $container = $el;

            container_name = wopts.base_namespace + "#" + $container.attr("id");

            this.viewMode = "timeline";

            // these relate to the display ------ not individual timeline attributes
            this._focusDate = {};
            this._zoomInfo = {};
            this._zoomLevel = 0;


            this.ticksReady = false;
            this.ticksArray = [];
            this.startSec = 0;
            this.activeTimelines = [];
            this.max_zoom = options.max_zoom;
            this.min_zoom = options.min_zoom;

            this.icon_folder = tg.icon_folder = options.icon_folder || "js/timeglider/icons/";

            // setting this without setTimeoffset to avoid refresh();
            this.timeOffset = TG_Date.getTimeOffset(options.timezone);

            this.base_font_size = 14;

            this.fixed_zoom = (this.max_zoom == this.min_zoom) ? true : false;
            this.gesturing = false;
            this.gestureStartZoom = 0;
            this.gestureStartScale = 0; // .999 etc reduced to 1 to 100
            this.filters = { include: "", exclude: "", legend: [], tags: [] };

            this.filterActions = {};

            this.loadedSources = [];
            this.timelineCollection = new Backbone.Collection();

            this.eventCollection = new tg.TG_EventCollection();

            this.imagesSized = 0;
            this.imagesToSize = 0;
            this.timelineDataLoaded = false,

                this.image_lane_height = 0;

            // this.setZoomLevel(options.initial_zoom);
            this.initial_timelines = [];
            this.initial_timeline_id = options.initial_timeline_id || "";
            this.sole_timeline_id = "";

            this.dimensions = {};

            this.focusedEvent = '';

            this.singleTimelineID = 0;
            this.scopeChanges = 0;


            this.freshData = true;
            this.boundsCache = {};

            this.initialScope = {};
            this.scopeCache = {};

            this.drillMap = [];


            if (options.max_zoom === options.min_zoom) {
                this.fixed_zoom = options.min_zoom;
            }

            if (options.main_map) {
                this.main_map = options.main_map;
                timeglider.mapping.setMap(this.main_map, this);
            }

            MED = this;

        } // end mediator head



    tg.TG_Mediator.prototype = {

        // clears the events and timelines collections
        emptyData: function() {

            this.eventCollection.reset();
            this.timelineCollection.reset();

            this.eventCollection = new tg.TG_EventCollection();
            this.timelineCollection = new Backbone.Collection();
            this.activeTimelines = [];

            this.freshData = true;
        },


        focusToEvent: function(ev, callback) {
            // !TODO open event, bring to zoom
            this.focusedEvent = ev;
            this.gotoDateZoom(ev.startdateObj.dateStr)
            $.publish(container_name + ".mediator.focusToEvent");

            if (typeof callback == "function") {
                callback(ev);
            }
        },

        /*
         * filterBy
         * @param type {String} tags|include|exclude|legend
         * @param content {String} content to be filtered, i.e. keyword, etc
         *
         */
        filterBy: function(type, content) {
            // !TODO open event, bring to zoom
            var fObj = { origin: type };
            fObj[type] = content;
            this.setFilters(fObj);
        },


        setImageLaneHeight: function(new_height, ref, set_ui) {
            this.image_lane_height = new_height;

            if (set_ui) {
                $.publish(container_name + ".mediator.imageLaneHeightSetUi");
            }

            if (ref) {
                this.refresh();
            }


        },


        setInitialScope: function() {
            this.initialScope = this.scopeCache;
            $.publish(container_name + ".mediator.initialScope");
        },

        getInitialScope: function() {
            return this.initialScope;
        },

        isActive: function(timeline_id) {
            return _.contains(this.activeTimelines, timeline_id)
        },


        /* PUBLIC METHODS MEDIATED BY $.widget front */
        gotoDateZoom: function(fdStr, zoom) {

            var fd = new TG_Date(fdStr),
                zl = false;
            this.setFocusDate(fd);

            // setting zoom _does_ refresh automatically
            if (zoom) {
                var zl = this.setZoomLevel(zoom);
            };

            if (!zoom || zl == false) {
                this.refresh();
            }

            $.publish(container_name + ".mediator.scopeChange");
        },


        zoom: function(n) {
            var new_zoom = this.getZoomLevel() + parseInt(n);
            this.setZoomLevel(new_zoom);
        },


        focusTimeline: function(timeline_id) {
            var tl = this.timelineCollection.get(timeline_id);
            var fd = tl.get("focus_date");
            var zl = tl.get("initial_zoom");

            this.gotoDateZoom(fd, zl);

        },



        loadPresentation: function(presentation_object) {

            var me = this,
                po = presentation_object,
                tls = po.timelines,
                tid = "",
                active = [],
                inverted = 0,
                bottom = 0,
                display = "expanded",
                real_tl = {};

            if (po.timelines.length > 0) {

                _.each(tls, function(tl) {
                    if (tl.open == 1) {
                        tid = tl.timeline_id;
                        active.push(tid);
                        bottom = tl.bottom || 30;
                        display = tl.display || "expanded";
                        inverted = tl.inverted || 0;

                        real_tl = me.timelineCollection.get(tid);
                        real_tl.set({ "inverted": inverted, "display": display, "bottom": bottom });
                    }
                });

                me.setFocusDate(new tg.TG_Date(po.focus_date));
                me.activeTimelines = active;
                me.setZoomLevel(po.initial_zoom);

                me.setImageLaneHeight(po.image_lane_height || 0, false, true);


                me.refresh();



            } else {
                // WTF no timelines	
                alert("There are no timelines in this presentation...");
                return false;
            }
        },


        /* reloadTimeline
         * wipes out and re-loads a timeline according to already-loaded ID
         * @param id {String} timeline id of already-loaded timeline
         * @param source {String} path to JSON for updated timeline data
         * @param call_this {Function} function to call after data loaded
         *
         */
        reloadTimeline: function(args) {

            var id = args.id;
            var source = args.source;
            var call_this = (typeof args.call_this == "function") ? args.call_this : "";

            var tl_model = this.timelineCollection.get(id);
            var evts = this.eventCollection;
            var me = this;

            // events in that timeline need to be wiped out
            // from event collection...
            var eventHash = this.eventCollection.getTimelineHash(id)["all"];
            _.each(eventHash, function(ev_id) {
                evts.remove(ev_id);
            });

            this.timelineCollection.remove(tl_model);
            this.eventCollection.setTimelineHash(id, {});

            var callback = {
                fn: call_this
                    // toggle: true
            }

            this.loadTimelineData(source, callback, true);

            this.freshData = true;

        },


        drilldown: function(ev) {
            // record current active timelines
            // zoom level
            // zooming up will be to child focus
            var me = this;

            me.drillMap.push({ trigger: ev, active: me.activeTimelines, focus: me.getFocusDate() });

            var on_load_dd = function() {
                // do stuff with view
                // just publish with 
                // data?
            }

            var cb = {
                fn: on_load_dd,
                toggle: true,
                load_as_only_timeline: true
            }

            me.loadTimelineData(ev.drilldown.data_source, cb);
        },

        drillup: function() {
            // record current active timelines
            // zoom level
            // zooming up will be to child focus
            // use splice to remove ends of array

        },

        getScope: function() {

            var zi = this.getZoomInfo(),
                fd = this.getFocusDate(),
                tBounds = this.getActiveTimelinesBounds(),
                focusDateSec = Math.round(fd.sec),
                focus_unix_seconds = tg.TG_Date.TGSecToUnixSec(focusDateSec),
                width = this.dimensions.container.width,
                half_width = width / 2,
                spp = Math.round(zi.spp),

                // calculate milliseconds from focus date seconds
                // and dimensions of the timeline frame
                left_ms = (focus_unix_seconds - (half_width * spp)) * 1000,
                focus_ms = focus_unix_seconds * 1000,
                right_ms = (focus_unix_seconds + (half_width * spp)) * 1000,

                left_sec = focusDateSec - (half_width * spp),
                right_sec = focusDateSec + (half_width * spp);

            var s = {
                "spp": spp,
                "width": width,
                "focusDateSec": focusDateSec,
                "timelines": this.activeTimelines,
                "timelineBounds": tBounds,
                "container": $container,
                "left_sec": left_sec,
                "right_sec": right_sec,
                // unix milliseconds!
                "leftMS": left_ms,
                "rightMS": right_ms,
                "focusMS": focus_ms
            }

            this.scopeCache = s;

            return s;

        },


        /*
         * fitToContainer
         * Considers the time-width of the current timeline(s) and
         * finds the best zoom level to fit all events in one view
         */
        fitToContainer: function() {

            var bds = this.getActiveTimelinesBounds();
            var seconds_wide = bds.last - bds.first;
            var middle_sec = (bds.first + bds.last) / 2;
            var width = this.dimensions.container.width;

            var z = _.find(tg.zoomTree, function(zl) {
                return seconds_wide / zl.spp < width;
            });

            this.gotoDateZoom(middle_sec, z.level);

        },


        resize: function() {
            $.publish(container_name + ".mediator.resize");
        },


        startWaiting: function() {
            $.publish(container_name + ".mediator.waiting");
        },

        stopWaiting: function() {
            $.publish(container_name + ".mediator.doneWaiting");
        },



        addFilterAction: function(actionName, actionFilter, actionFunction) {
            this.filterActions[actionName] = { filter: actionFilter, fn: actionFunction };
            this.refresh();
        },

        removeFilterAction: function(actionName) {
            delete this.filterActions[actionName];
            this.refresh();
        },


        getEventByID: function(id, prop) {
            var evob = this.eventCollection.get(id).attributes;

            if (prop && evob.hasOwnProperty(prop)) {
                return evob[prop];
            } else {
                return evob;
            }
        },



        /*
	   	 * getPastEvents
	   	 * Get an array of all events prior to focus date
	   	 * @param visible_only {boolean} if true, only get events
	   	          with thresholds matching current zoom level
	   	 * @param out_of_frame {boolean} if true, only get events
	   	          to right of widget frame
	   	 *
	   	*/
        getPastEvents: function(visible_only, out_of_frame) {
            var me = this,
                scope = this.getScope(),
                getit = false;

            if (scope.timelineBounds.first < scope.focusDateSec) {

                // send back all events prior to focus
                var flred = _.filter(this.eventCollection.models, function(ev) {

                    if (out_of_frame) {
                        // only getting list of past events to left of frame
                        if (ev.get("startdateObj").sec < scope.left_sec) {
                            getit = true;
                        }
                    } else {
                        getit = true;
                    }

                    var visf = (visible_only) ? me.isEventVisible(ev) : true;
                    var intx = _.intersection(me.activeTimelines, ev.get("timelines"));

                    return (getit && intx.length > 0 && visf && ev.get("startdateObj").sec < scope.focusDateSec);
                });


                return flred;

            } else {
                return false;
            }
        },


        /*
         * navigate to the next event that is to the left of the centerline/focus date
         * TODO move $() stuff to TimelineView
         */
        gotoPreviousEvent: function() {

            if (this.activeTimelines.length == 0) {
                alert("No timelines are loaded.");
                return false;
            }

            var me = this,
                backEvents = this.getPastEvents(true, false);

            if (backEvents.length > 0) {
                var cb = function(ev) {
                    $(".timeglider-timeline-event").removeClass("tg-event-selected");
                    $(".timeglider-timeline-event#" + ev.id).addClass("tg-event-selected");
                }
                this.focusToEvent(_.last(backEvents).attributes, cb);
            } else {
                alert("在此时间节点前无历史事件！");

                return false;
            }
        },




        /*
         * getFutureEvents
         * Get an array of all events forward of focus date
         * @param visible_only {boolean} if true, only get events
                  with thresholds matching current zoom level
         * @param out_of_frame {boolean} if true, only get events
                  to right of widget frame
         *
        */
        getFutureEvents: function(visible_only, out_of_frame) {
            var me = this,
                scope = this.getScope(),
                getit = false;


            if (scope.timelineBounds.last > scope.focusDateSec) {

                return _.filter(this.eventCollection.models, function(ev) {

                    if (out_of_frame) {
                        // only getting list of past events to left of frame
                        if (ev.get("startdateObj").sec > scope.right_sec) {
                            getit = true;
                        }
                    } else {
                        getit = true;
                    }

                    var visf = (visible_only) ? me.isEventVisible(ev) : true;
                    var intx = _.intersection(me.activeTimelines, ev.get("timelines"));
                    return (getit && intx.length > 0 && visf && ev.get("startdateObj").sec > scope.focusDateSec);

                });

            } else {
                return false;
            }
        },



        gotoNextEvent: function() {


            if (this.activeTimelines.length == 0) {
                alert("No timelines are loaded.");
                return false;
            }

            var me = this,
                fwdEvents = this.getFutureEvents(true, false);


            if (fwdEvents.length > 0) {
                var cb = function(ev) {
                    $(".timeglider-timeline-event").removeClass("tg-event-selected");
                    $(".timeglider-timeline-event#" + ev.id).addClass("tg-event-selected");
                }
                this.focusToEvent(_.first(fwdEvents).attributes, cb);
            } else {

                alert("在此时间节点后无历史事件！");
                return false;

            }
        },



        isEventVisible: function(ev) {

            var z = this._zoomLevel;

            if (z <= ev.get("high_threshold") && z >= ev.get("low_threshold")) {
                return true;
            } else {
                return false;
            }

        },




        /* 
         * adjustNowEvents
         * Keeps events with "keepCurrent" set to "start" or "end" up to
         * date with current time, useful for real-time timelines with
         * sensitive auto-adjusting event times. Automatically searches
         * all events in the collection.
         * NO PARAMS
         *
         */
        adjustNowEvents: function() {

            var refresh = false,
                kC = "",
                dd = "";

            _.each(this.eventCollection.models, function(ev) {
                if (ev.get("keepCurrent")) {

                    kC = ev.get("keepCurrent"),
                        dd = ev.get("date_display");

                    // start or both?
                    if (kC == 1 || kC == 3) {
                        ev.set({ "startdateObj": new TG_Date("today", dd) });
                    }

                    // end or both?
                    if (kC == 2 || kC == 3) {
                        ev.set({ "enddateObj": new TG_Date("today", dd) });
                    }

                    ev.reIndex();

                    refresh = true;

                }
            });

            this.freshData = true;

            if (refresh) {
                this.refresh();
            }
        },



        /*
         * addEvent
         * @param new_event {Object} is a simple tg event object
         *        with .startdate and .enddate as ISO8601 strings,
         *        and would accept other TG_Event attribs
         * @param refresh {Boolean} true to refresh the timeline
         *        view; false in case a batch of events is being
         *        loaded to prevent pointless refreshes
         * @param to_timelines {Array} array of timeline ids to which
         *        event will be added
         * @return the new (Backbone) Model for the event
         *
         */
        addEvent: function(new_event, refresh, to_timelines) {

            refresh = refresh || false;

            new_event.startdateObj = new tg.TG_Date(new_event.startdate);

            var enddate = new_event.enddate || new_event.startdate;

            new_event.enddateObj = new tg.TG_Date(enddate);

            new_event.mediator = this;

            new_event.timelines = to_timelines || new_event.timelines;

            if (!new_event.timelines) return false;

            new_event.cache = {
                timelines: new_event.timelines,
                startdateObj: new_event.startdateObj,
                enddateObj: new_event.enddateObj,
                span: true
            }

            var new_model = new tg.TG_Event(new_event);

            this.eventCollection.add(new_model);

            // incorporates TG_Event into hashes, re-evaluates
            // timeline start/end points
            new_model.reIndex();


            if (refresh) {
                this.refresh();
            }

            $.publish(container_name + ".mediator.addEvent");

            this.freshData = true;

            return new_model;

        },





        /*
         * updateEvent
         * @param event_edits {Object} is a 
         *	
         * @return the new (Backbone) Model for the event
         *
         */
        updateEvent: function(event_edits) {

            if (!event_edits.id) {
                alert("error: you need a valid id set on the object in updateEvent()");
                return false;
            }

            var ev = this.eventCollection.get(event_edits.id);

            ev.set(event_edits);

            // re-index if dates have changed
            if (event_edits.startdateObject || event_edits.enddateObject) {
                ev.reIndex();
            }

            this.freshData = true;

            this.refresh();

            $.publish(container_name + ".mediator.updateEvent");

            return ev;

        },


        /*
         * Gets the bounds for 1+ timelines in view
         */
        getActiveTimelinesBounds: function() {

            if (this.freshData == true) {

                var active = this.activeTimelines,
                    tl = {},
                    startSec = 99999999999,
                    endSec = 0;

                for (var t = 0; t < active.length; t++) {
                    tl = this.timelineCollection.get(active[t]);
                    startSec = (tl.get("bounds").first < startSec) ? tl.get("bounds").first : startSec;
                    endSec = (tl.get("bounds").last > endSec) ? tl.get("bounds").last : endSec;
                }

                var bnds = { "first": startSec, "last": endSec };

                this.boundsCache = bnds;
                this.freshData = false;

                return bnds;
            } else {

                return this.boundsCache;
            }


        },




        removeFromActive: function(timeline_id) {
            var active = _.indexOf(this.activeTimelines, timeline_id);

            // if it's in the active array
            if (active != -1) {
                this.activeTimelines.splice(active, 1);
                return true;
            } else {
                return false;
            }

        },


        /* 
	*  loadMoreEvents
	*  @param to_timeline_id (string) the ID of the timeline to add events to
	*  @param src (string||object) json source url OR object reference
		         src should be an array of just 1 timeline
	*  @param lme_callback callback function for once data is loaded
	*/
        loadMoreEvents: function(to_timeline_id, src, lme_callback, wait) {

            var me = this;
            var wait = wait || 500;
            var tl = {};

            // OBJECT
            if (typeof src === "object") {

                tl = src[0];

                // make sure initial timeline is loaded
                setTimeout(function() {

                    _.each(tl.events, function(ev) {
                        // debug.log("ev:", ev.title);
                        me.addEvent(ev, false, [to_timeline_id]);
                    });

                    lme_callback.call();

                }, wait);

            } else {
                // VS STRING
                $.ajax({
                    url: src,
                    type: "GET",
                    cache: false,
                    dataType: "json",

                    error: function(jqXHR, textStatus, errorThrown) {
                        debug.log("loadMoreEvents error:", JSON.stringify(jqXHR), JSON.stringify(textStatus), errorThrown);
                    },

                    success: function(data) {

                        if (data.error) {
                            debug.log("data.error: " + data.error);
                        } else {
                            // make sure initial timeline is loaded
                            setTimeout(function() {
                                // data here ought to be an array 
                                // with a single timeline in it.
                                tl = data[0];
                                _.each(tl.events, function(ev) {
                                    // debug.log("ev:", ev.title);
                                    me.addEvent(ev, false, [to_timeline_id]);
                                });

                                lme_callback.call();

                            }, wait);

                        }
                    }
                }); // end ajax
            } // end object vs. string


        },



        /*
         * loadTimelineData
         * @param src {object} object OR json data to be parsed for loading
         * !TODO: create option for XML?
         */
        loadTimelineData: function(src, callback, reload) {

            var reload = reload || false;

            var M = this; // model ref
            // Allow to pass in either the url for the data or the data itself.

            if (src) {

                // if we've not loaded it already!
                if (_.indexOf(M.loadedSources, src) == -1 || reload == true) {

                    if (typeof src === "object") {

                        // OBJECT (already loaded, created)
                        M.parseTimelineData(src, callback);

                    } else if (src.substr(0, 1) == "#") {
                        // TABLE
                        var tableData = [M.getTableTimelineData(src)];
                        M.parseTimelineData(tableData);

                    } else {

                        $.ajax({
                            url: src,
                            type: "GET",
                            cache: false,
                            dataType: "json",

                            error: function(jqXHR, textStatus, errorThrown) {
                                debug.log("loadTimelineData json error:", JSON.stringify(jqXHR), JSON.stringify(textStatus), errorThrown);
                            },

                            success: function(data) {

                                if (data.error) {
                                    if (data.password_required == 1) {
                                        // set up a password field!

                                    } else {
                                        // some other kind of error
                                        alert(data.error);
                                    }
                                    return false;
                                } else {

                                    M.parseTimelineData(data, callback);

                                }
                            }
                        });

                    } // end [obj vs #/table vs remote]


                    M.loadedSources.push(src);

                }


            } else {


                // NO INITIAL DATA:
                // That's cool. We still build the timeline
                // focusdate has been set to today
                // !AUTH: USED IN AUTHORING MODE
                this.timelineDataLoaded = true;
                this.setZoomLevel(Math.floor((this.max_zoom + this.min_zoom) / 2));
                this.tryLoading();


            }
            this.freshData = true;

        },


        // click coming from marker on Google map
        mapMarkerClick: function(ev) {
            this.focusToEvent(ev);
        },

        getTimelineCollection: function() {
            return this.timelineCollection;
        },

        timelineTitleClick: function(timeline_id) {
            $.publish(container_name + ".mediator.timelineTitleClick", { timeline_id: timeline_id });
        },


        /*
         *  getTableTimelineData
         *  @param table_id {string} the html/DOM id of the table
         *  @return timeline data object ready for parsing
         *
         */
        getTableTimelineData: function(table_id) {

            var tl = {},
                now = 0,
                keys = [],
                field, value,
                event_id = '',
                $table = $(table_id);

            // timeline head
            tl.id = table_id.substr(1);
            tl.title = $table.attr("title") || "untitled";
            tl.description = $table.attr("description") || "";
            tl.focus_date = $table.attr("focus_date") || TG_Date.getToday();
            tl.initial_zoom = $table.attr("initial_zoom") || 20;
            tl.events = [];

            $table.find('tr').each(function(i) {

                var children = $(this).children(),
                    row_obj;

                // first row -- <th> or <td>, gather the field names
                if (i === 0) {

                    keys = children.map(function() {
                        // using "tg-*" map each column to the corresponding data
                        return $(this).attr('class').replace(/^.*?\btg-(\S+)\b.*?$/, '$1');
                    }).get();

                } else {
                    // i.e. an event
                    row_obj = {};

                    children.each(function(i) {
                        field = keys[i];

                        if (field == "description") {
                            value = $(this).html();
                        } else {
                            value = $(this).text();
                        }

                        // TODO: VALIDATE EVENT STUFF HERE

                        row_obj[field] = value;
                    });
                    event_id = 'ev_' + now++;
                    row_obj.id = event_id;
                    tl.events.push(row_obj);

                } // end if-else i===0
            }); // end .each()

            $table.css("display", "none");
            return tl;
        },


        runLoadedTimelineCallback: function(callback, data, mediator) {

            callback.fn(data, mediator);

            if (callback.load_as_only_timeline) {
                this.activeTimelines = [];
                this.toggleTimeline(data[0].id);

            } else if (callback.toggle || callback.load_into_context) {
                // add it without changing 
                this.activeTimelines = [data[0].id];
                this.refresh();
                // this.toggleTimeline(data[0].id);
            }

        },


        /*
         * parseTimelineData
         * @param data {object} Multiple (1+) timelines object 
         * derived from data in loadTimelineData
         */
        parseTimelineData: function(json, callback) {

            var data = "",
                me = this;


            if (typeof json.presentation == "string") {

                timeglider.mode = "presentation";

                data = json.timelines;

                // get presentation info
                me.initial_timelines = json.initial_timelines;

                // required
                me.presentation = {
                    title: json.title,
                    description: json.description,
                    focus_date: new tg.TG_Date(json.focus_date),
                    initial_zoom: json.initial_zoom
                }

                if (typeof json.description == "string") {
                    me.presentation.description = json.description;
                    if (typeof json.open_modal == "boolean") {
                        me.presentation.open_modal = json.open_modal;
                    } else {
                        me.presentation.open_modal = true;
                    }
                }

                // optional
                if (typeof json.legend == "object") {
                    me.presentation.legend = json.legend;
                }

                // or merge timeline legends?


            } else {
                data = json;
            }

            var M = this,
                ct = 0,
                dl = data.length,
                ti = {},
                ondeck = {};

            for (var i = 0; i < dl; i++) {

                ondeck = data[i];
                ondeck.mediator = M;

                ti = new tg.TG_Timeline(ondeck).toJSON(); // the timeline

                if (ti.id.length > 0) {
                    ct++;
                    M.swallowTimeline(ti);
                }


            }

            // TYPICALLY A SECONDARY (user-called from page) LOAD
            // WHICH MIGHT HAVE CUSTOMIZD CALLBACK ACTIONS...

            if (callback && (typeof callback.fn == "function" || typeof callback == "function")) {

                // normalize callback to fn property
                if (typeof callback == "function") {
                    callback = { fn: callback };
                }

                setTimeout(function() {
                    M.runLoadedTimelineCallback(callback, data, M);
                }, 100);


                if (timeglider.mode != "presentation" && (callback.display || callback.toggle)) {
                    return false;
                }

            }


            if (ct === 0) {
                alert("ERROR loading data: Check JSON with jsonLint");

            } else {

                if (typeof callback == "undefined") {
                    callback = { display: true };
                } else if (typeof callback.display == "undefined") {
                    callback.display = true;
                }


                this.timelineDataLoaded = true;
                if (callback.display || callback.toggle) {
                    this.tryLoading();
                }
            }

        },




        /*
         *  tryLoading
         *  Sees if all criteria for proceeding to display the loaded data
         *  are complete: data, image sizeing and others
         *
         */
        tryLoading: function() {

            var a = (this.imagesSized == this.imagesToSize),
                b = (this.timelineDataLoaded == true);


            if (a && b) {

                this.setInitialTimelines();

                if (this.timelineCollection.length == 1) {

                    // IF SINGLE TIMELINE
                    tl = MED.timelineCollection.at(0);
                    this.singleTimelineID = tl.get("id");

                    this.setImageLaneHeight(tl.get("image_lane_height") || 0, false, true);
                }


                $.publish(container_name + ".mediator.timelineDataLoaded");


            }


        },




        /* Makes an indexed array of timelines */
        swallowTimeline: function(obj) {

            this.sole_timeline_id = obj.id;

            var exists = this.timelineCollection.get(obj.id);

            // if the object exists already...
            if (exists) {
                exists.set(obj);

            } else {
                // UPDATE!!
                this.timelineCollection.add(obj);
            }

        },


        /* 
        now loads multiple initial timelines: make sure
        to set the "top" attributes of timelines to make sure
        they don't overlap when initially loaded
        */
        setInitialTimelines: function() {

            var me = this;

            // PART I
            // What are the initially loaded timelines (ids) ?

            if (me.initial_timelines.length > 0) {

                me.activeTimelines = me.initial_timelines;

            } else {
                // initial timelines set by widget settings
                var initial_timelines = me.initial_timeline_id,
                    first_focus_id = "";

                // i.e. it's an array
                if (typeof initial_timelines == "object") {
                    // set first timeline in array as one to focus on
                    first_focus_id = this.initial_timeline_id[0];
                    // make all specified ids active
                    _.each(initial_timelines, function(id) {
                        me.activeTimelines.push(id);
                    });

                } else if (initial_timelines.length > 0) {
                    // not an array: a string would be single id or ""
                    first_focus_id = this.initial_timeline_id || this.sole_timeline_id;
                    me.activeTimelines = [first_focus_id];
                } else if (this.timelineCollection.length > 0) {
                    // in case there is no initial id
                    first_focus_id = this.timelineCollection.pluck("id")[0];
                    me.activeTimelines = [first_focus_id];
                }
            }

            // PART II
            // Set the timeline up according to initial_timeline
            // or single timeline or presentation


            if (timeglider.mode == "presentation") {

                // do nothing??

            } else if (timeglider.mode == "authoring") {
                // no timelines loaded right away
                me.setZoomLevel(40);

            } else if (first_focus_id) {

                // we need to wait just a bit...
                setTimeout(function() {

                    // timeline on which to focus is first/only
                    var tl = me.timelineCollection.get(first_focus_id);
                    var tl_fd = tl.get("focusDateObj");

                    me.setFocusDate(tl_fd);

                    // resetting zoomLevel will refresh
                    me.setZoomLevel(tl.get("initial_zoom"));

                }, 500);

            } else {
                // could be no timelines to load
                me.setZoomLevel(40);
            }

        },


        refresh: function() {
            $.publish(container_name + ".mediator.refreshSignal");
        },



        setTicksReady: function(bool) {
            this.ticksReady = bool;

            this.startSec = this._focusDate.sec;

            if (bool === true) {
                $.publish(container_name + ".mediator.ticksReadySignal");
            }
        },



        /*
         *  setTimeoffset
         *  @param offset [String] eg: "-07:00"
         *      
         */
        setTimeoffset: function(offsetStr) {

            this.timeOffset = TG_Date.getTimeOffset(offsetStr);
            this.refresh();
        },


        // timezone hours/minutes ofset
        getTimeoffset: function() {
            return this.timeOffset;
        },


        /*
         *  setTimeoffset
         *  @param offset [String] eg: "-07:00"
         *      
         */
        setDimensions: function(d) {
            this.dimensions = d;
        },

        /*
         *  setFocusDate
         *  @param fd [TG_Date instance]
         *      
         */
        setFocusDate: function(fd) {
            if (fd != this._focusDate) {
                this._focusDate = fd;
            }
        },

        getFocusDate: function() {
            return this._focusDate;
        },



        /*
         * getZoomLevel
         * @return {Number} zoom level number from 1 to 100
         *
         *
         *
         */
        getZoomLevel: function() {
            return parseInt(this._zoomLevel);
        },



        mousewheelChange: function(dir) {

            var opt = this.options.mousewheel;

            if (opt === "zoom") {
                if (this.viewMode == "timeline") {
                    var zl = this.getZoomLevel();
                    this.setZoomLevel(zl += dir);
                }

            } else if (opt === "pan") {
                $.publish(container_name + ".mediator.mousewheelChange", { "dir": dir, "action": "pan" });
            }



        },


        /*
         * getAllTags
         * Creates an array of tags with numbers indicating
         * the frequency of the tag usage across timeline(s)
         * from all timelines in the timelines collection
         * @returns a sorted array of tags as {name:"tagname", number:num}
         */
        getTagList: function() {

            var list = {},
                tgs = [],
                tg_name = "";

            _.each(this.timelineCollection.models, function(tl) {
                var evts = tl.get("events");
                _.each(evts, function(ev) {
                    if (ev.tags) {
                        tgs = ev.tags.split(",");
                        _.each(tgs, function(tg) {
                            tg_name = $.trim(tg);
                            if (list[tg_name]) {
                                list[tg_name].count++;
                            } else {
                                list[tg_name] = { name: tg_name, count: 1 };
                            }
                        })
                    }
                });
            });
            list = _.sortBy(list, function(obj) { return obj.name; });

            return list;

        },


        /* 
         *  setZoomLevel
         *  This in turn sets other zoomInfo attributes : width, label, tickWidth
         *  Other zoom info comes from the zoomTree array
         *  @param z ==> integer from 1-100
         *  
         */
        setZoomLevel: function(z) {

            if (z < 1) { z = 1; }


            if (z == 1 || (z <= this.max_zoom && z >= this.min_zoom)) {

                // focusdate has to come first for combined zoom+focusdate switch
                this.startSec = this._focusDate.sec;

                if (z != this._zoomLevel) {

                    this._zoomLevel = z;
                    this._zoomInfo = tg.zoomTree[z];

                    $.publish(container_name + ".mediator.zoomLevelChange");

                    $.publish(container_name + ".mediator.scopeChange");


                    return true;

                } else {
                    return false;
                }
                // end min/max check
            } else { return false; }

        },


        /*
         *  getZoomInfo
         *  @return obj {Object} with 
         *          zoomLevel (Number), label (String), tickWidth (Number), unit (String)
         *
         */
        getZoomInfo: function() {
            return this._zoomInfo;
        },



        /* 
         * from click etc. on page, what is the date?
         */
        getDateFromOffset: function(dp_x) {

            var me = this,
                ctnr = me.dimensions.container,
                Cw = ctnr.width,
                Cx = dp_x - (ctnr.offset.left),
                offMid = Cx - Cw / 2,
                secPerPx = me.getZoomInfo().spp,
                fdSec = me.getFocusDate().sec,
                dcSec = Math.floor(fdSec + (-1 * this.timeOffset.seconds) + (offMid * secPerPx));

            return new TG_Date(dcSec);
        },



        // incoming: {name:"dblclick", event:e, dimensions:me.dimensions}
        registerUIEvent: function(info) {
            var me = this;

            switch (info.name) {
                case "dblclick":
                case "dbltap":
                    // info comes with 

                    var clickDate = me.getDateFromOffset(info.event.pageX);
                    var ui_event = info.event;

                    $.publish(container_name + ".mediator.dblclick", { date: clickDate, event: ui_event });

                    break;
            }
        },



        /*
        *  setFilters
        *  @param obj {Object} containing: 
        *         	required: origin ("clude", "legend", "tags"), 
        			possible: include (string), 
        			possible: exclude (string), 
        			possible: legend (object)
        			possible: title_andor_desc (string)
        			possible: tags (array)
        *  @param extra {Mixed} would be the specific array to add to the legend filter array
        *         for example for all legend icons
        */
        setFilters: function(obj, extra) {

            var me = this;

            switch (obj.origin) {

                case "clude":
                    this.filters.include = obj.include;
                    this.filters.exclude = obj.exclude;
                    break;

                case "title_andor_desc":
                    this.filters.description = obj.description;
                    this.filters.title = obj.title;

                    if (obj.tags) {
                        this.filters.tags = obj.tags.split(",");
                    } else {
                        this.filters.tags = [];
                    }

                    break;


                case "tags":
                    if (obj.tags) {
                        this.filters.tags = obj.tags.split(",");
                    } else {
                        this.filters.tags = [];
                    }
                    break;


                case "legend":

                    // subtract the icons folder URL...
                    // starting icon with "shapes/" etc.
                    var icon = obj.icon.replace(me.options.icon_folder, "");

                    if (icon == "all") {
                        this.filters.legend = []; // nothing to filter against, all will show
                        $.publish(container_name + ".mediator.legendAll");

                    } else if (icon == "none") {

                        this.filters.legend = ["_none_.png"]; // no events will match this
                        $.publish(container_name + ".mediator.legendAll");

                    } else if (icon == "provided") {
                        this.filters.legend = extra;

                    } else {

                        // if it's not in filter, add it			
                        if (_.indexOf(this.filters.legend, icon) == -1) {
                            this.filters.legend.push(icon);

                            // otherwise remove it
                        } else {

                            var fol = this.filters.legend,
                                fr = [];

                            fr = $.grep(fol, function(a) { return a != icon; });

                            if (options.legend.type == "checkboxes" && fr.length == 0) {
                                // false empty to create "get no events"
                                fr = ["___"];
                            }

                            this.filters.legend = fr;
                        }

                    } // end if/else for "clear"

                    break;


                case "custom":
                    if (obj.action == "add") {
                        this.filters.custom = obj.fn;
                    } else {
                        delete this.filters.custom;
                    }
                    break;

            } // end switch


            $.publish(container_name + ".mediator.filtersChange");


            this.refresh();
        },


        clearFilters: function(clear) {

            clear_legend = clear.legend || false;
            clear_custom = clear.custom || false;

            this.filters.exclude = "";
            this.filters.include = "";
            this.filters.title = "";
            this.filters.description = "";

            if (clear_legend) {
                this.filters.legend = [];
            }

            if (clear_custom) {
                this.filters.custom = "";
            }

        },


        getTicksOffset: function() {
            return this._ticksOffset;
        },


        setTicksOffset: function(newOffset) {
            // This triggers changing the focus date
            // main listener hub for date focus and tick-appending
            this._ticksOffset = newOffset;

            // In other words, ticks are being dragged!
            $.publish(container_name + ".mediator.ticksOffsetChange");
            $.publish(container_name + ".mediator.scopeChange");
        },



        /*
         *  getTickBySerial
         *  @param serial {Number} serial date unit number (rata die, monthnum, year, etc)
         *
         *  @return {Object} info about _existing_ displayed tick
         *
         */
        getTickBySerial: function(serial) {
            var ta = this.ticksArray,
                tal = ta.length;
            for (var t = 0; t < tal; t++) {
                var tick = ta[t];
                if (tick.serial == serial) { return tick; }
            }
            return false;
        },



        /*
         *  addToTicksArray
         *	 @param obj {Object} 
         *		  serial: #initial tick
         *		  type:init|l|r
         *		  unit:ye | mo | da | etc
         *		  width: #px
         *		  left: #px
         *	 @param focusDate {TG_Date}
         *		 used for initial tick; others set off init
         */
        addToTicksArray: function(obj, focusDate) {

            // var ser = 0;

            if (obj.type == "init") {
                // CENTER
                obj.serial = TG_Date.getTimeUnitSerial(focusDate, obj.unit);
                this.ticksArray = [obj];
            } else if (obj.type == "l") {
                // LEFT
                obj.serial = this.ticksArray[0].serial - 1;
                this.ticksArray.unshift(obj);
            } else {
                // RIGHT SIDE
                obj.serial = this.ticksArray[this.ticksArray.length - 1].serial + 1;
                this.ticksArray.push(obj);
            }

            // this.ticksArrayChange.broadcast();
            $.publish(container_name + ".mediator.ticksArrayChange");

            return obj.serial;
        },

        toggleTimeline: function(id, keep_focus) {

            // patch until we have better multi-timeline support
            // this is a true "toggle" in that it clears visible
            // timelines and loads the new timeline by id

            var keep = keep_focus || false;

            var tl = this.timelineCollection.get(id).attributes;

            var refresh = false;

            var active = _.indexOf(this.activeTimelines, id);

            if (active == -1) {
                // timeline not active ---- bring it on
                this.activeTimelines.push(id);

                // set to timeline's 
                if (!keep) {

                    // timeline focus_date is ISO-8601 basic;
                    // interface focusdate needs a TG_Date()
                    var tl_fd = new TG_Date(tl.focus_date);

                    // setting FD does NOT refresh
                    this.setFocusDate(tl_fd);

                    // resetting zoomLevel will refresh
                    this.setZoomLevel(tl.initial_zoom);

                    if (tl.initial_zoom == this.getZoomLevel()) {
                        refresh = true;
                    }

                } else {
                    // just added timeline to list, refreshing
                    refresh = true;
                }


            } else {
                // it's active, remove it
                this.activeTimelines.splice(active, 1);
                refresh = true;
            }



            if (refresh) {
                this.refresh();
            }

            $.publish(container_name + ".mediator.activeTimelinesChange");

            this.freshData = true;

        },



        /*
         *  reportImageSize
         *  @param img {Object} has "id" of event, "src", "width" and "height" at least
         *  
         *  This information is reported from TG_Timeline as data is loading. Since image
         *  size gathering sidetracks from data loading, there's a 
         */
        reportImageSize: function(img) {

            var ev = MED.eventCollection.get(img.id);

            if (ev.has("image")) {
                if (!img.error) {
                    ev.attributes.image.width = img.width;
                    ev.attributes.image.height = img.height;
                } else {
                    ev.attributes.image = {};
                    debug.log("WHOOPS: MISSING IMAGE: " + img.src);
                }

                this.imagesSized++;

                if (this.imagesSized == this.imagesToSize) {
                    // if there are images, this would usually be
                    // the last step before proceeding
                    this.tryLoading();
                }
            }
        }



        ///// end model prototype object
    };


    tg.getLowHigh = function(arr) {

        var sorted = _.sortBy(arr, function(g) { return parseInt(g); });

        return { "low": _.first(sorted), "high": _.last(sorted) }

    };





    tg.validateOptions = function(widget_settings) {

        this.optionsMaster = {
            initial_focus: { type: "date" },
            timezone: { type: "timezone" },
            editor: { type: "string" },
            backgroundColor: { type: "color" },
            backgroundImage: { type: "color" },
            min_zoom: { type: "number", min: 1, max: 100 },
            max_zoom: { type: "number", min: 1, max: 100 },
            initial_zoom: { type: "number", min: 1, max: 100 },
            show_centerline: { type: "boolean" },
            display_single_timeline_info: { type: "boolean" },
            minimum_timeline_bottom: { type: "number", min: 0, max: 1000 },
            display_zoom_level: { type: "boolean" },
            data_source: { type: "url" },
            basic_fontsize: { type: "number", min: 9, max: 100 },
            mousewheel: { type: "string", possible: ["zoom", "pan", "none"] },
            initial_timeline_id: { type: "mixed" },
            icon_folder: { type: "string" },
            show_footer: { type: "boolean" },
            display_zoom_level: { type: "boolean" },
            constrain_to_data: { type: "boolean" },
            boost: { type: "number", min: 0, max: 99 },
            event_modal: { type: "object" },
            event_overflow: { type: "string" },
            legend: { type: "object" }
        }

        // msg: will be return value: validates when empty 
        // change lb to <br> if the error is returned in HTML (vs alert())
        var me = this,
            msg = "",
            lb = "\n";

        $.each(widget_settings, function(key, value) {

            if (me.optionsMaster[key]) {

                switch (me.optionsMaster[key].type) {
                    case "string":
                        if (typeof value != "string") { msg += (key + " needs to be a string." + lb); }
                        if (me.optionsMaster[key].possible) {
                            if (_.indexOf(me.optionsMaster[key].possible, value) == -1) {
                                msg += (key + " must be: " + me.optionsMaster[key].possible.join(" or "));
                            }
                        }
                        break;

                    case "number":
                        if (typeof value != "number") { msg += (value + " needs to be a number." + lb); }
                        if (me.optionsMaster[key].min) {
                            if (value < me.optionsMaster[key].min) {
                                msg += (key + " must be greater than or equal to " + me.optionsMaster[key].min + lb);
                            }
                        }

                        if (me.optionsMaster[key].max) {
                            if (value > me.optionsMaster[key].max) {
                                msg += (key + " must be less than or equal to " + me.optionsMaster[key].max + lb);
                            }
                        }
                        break;

                    case "date":
                        // TODO validate a date string using TG_Date...
                        break;

                    case "timezone":

                        var cities = ["New York", "Denver", "Chicago", "Los Angeles"];
                        var pattern = /[+|-]?[0-9]+:[0-9]+/;
                        if ((_.indexOf(cities, value) == -1) && (value.match(pattern) == -1)) {
                            msg += ("The timezone is not formatted properly");
                        }

                        break;

                    case "boolean":
                        if (typeof value != "boolean") msg += (value + " needs to be a number." + lb);
                        break;

                    case "url":
                        // TODO test for pattern for url....
                        break;

                    case "color":
                        /// TODO test for pattern for color, including "red", "orange", etc
                        break;

                    case "mixed":
                        /// TODO test for pattern for color, including "red", "orange", etc
                        break;

                    case "object":
                        // switch with object types....
                        break;
                }
            }
        }); // end each

        return msg;

    };



})(timeglider);
/*
 * Timeglider for Javascript / jQuery
 * http://timeglider.com/jquery
 *
 * Copyright 2011, Mnemograph LLC
 * Licensed under Timeglider Dual License
 * http://timeglider.com/jquery/?p=license
 *
/*

*         DEPENDENCIES:
                        rafael.js
                        ba-tinyPubSub
                        jquery
                        jquery ui (and css)
                        jquery.mousewheel
                        jquery.ui.ipad

                        TG_Date.js
                        TG_Timeline.js
                        TG_TimelineView.js
                        TG_Mediator.js
                        TG_Org.js
                        Timeglider.css
*
*/


(function($){
	/**
	* The main jQuery widget factory for Timeglider
	*/

	var timelinePlayer,
		tg = timeglider,
		MED,
		TG_Date = timeglider.TG_Date;

	$.widget( "timeglider.timeline", {

		// defaults!
		options : {
			base_namespace:"tg",
			timezone:"00:00",
			initial_focus:tg.TG_Date.getToday(),
			editor:"none",
			min_zoom : 1,
			max_zoom : 100,
			show_centerline:true,
			data_source:"",
			culture:"en",
			base_font_size:12,
			mousewheel: "zoom", // !TODO | pan | none
			initial_timeline_id:'',
			icon_folder:"js/timeglider/icons/",
			image_lane_height: 32,
			show_footer:true,
			use_scroller: false,
			minimum_timeline_bottom: 24,
			display_zoom_level:false,
			display_single_timeline_info:true,
			initial_timeline_modal:true,
			constrain_to_data:true,
			boost:0,
			tick_top:"",
			loading_icon:"",
			event_modal:{type:"default"},
			event_overflow:"plus",  // plus | scroll
			legend:{show_on_load:true,type:"default"},
			loaded:{display:true}
		},

		_create : function () {

			this._id = $(this.element).attr("id");
			/*
			Anatomy:
			*
			*  -container: main frame of entire timeline
			*  -centerline
			*  -truck: entire movable (left-right) container
			*  -ticks: includes "ruler" as well as events
			*  -handle: the grabbable part of the truck which
			*           self-adjusts to center
			*  -slider-container: wrapper for zoom slider
			*  -slider: jQuery UI vertical slider
			*  -timeline-menu
			*
			*  -measure-span: utility div for measuring text lengths
			*
			*  -footer: (not shown) gets added dynamically unless
			*           options indicate otherwise
			*/
			// no need for template here as no data being passed
			var MAIN_TEMPLATE = "<div id='tg-container' class='timeglider-container'>"
				+ "<div class='timeglider-loading'><div class='sk-fading-circle'><div class='sk-circle1 sk-circle'></div><div class='sk-circle2 sk-circle'></div><div class='sk-circle3 sk-circle'></div><div class='sk-circle4 sk-circle'></div><div class='sk-circle5 sk-circle'></div><div class='sk-circle6 sk-circle'></div><div class='sk-circle7 sk-circle'></div><div class='sk-circle8 sk-circle'></div><div class='sk-circle9 sk-circle'></div><div class='sk-circle10 sk-circle'></div><div class='sk-circle11 sk-circle'></div><div class='sk-circle12 sk-circle'></div></div></div>"
				+ "<div class='timeglider-centerline'></div>"
				+ "<div class='tg-oof-count tg-oof-left'></div>"
				+ "<div class='tg-oof-count tg-oof-right'></div>"

				+ "<div class='timeglider-truck' id='tg-truck'>"
				+ "<div class='timeglider-ticks noselect'>"
				+ "<div class='timeglider-handle'></div>"

				+ "</div>"
				+ "</div>"

				+ "<div class='timeglider-slider-container noselect'>"
				+ "	<div class='tg-slider-plusminus tg-slider-plus tg-zoom-in'></div>"
				+ "	<div class='timeglider-slider'></div>"
				+ "	<div class='tg-slider-plusminus tg-slider-minus tg-zoom-out'></div>"
				+ "	<div class='timeglider-pan-buttons'>"
				+ "	<div class='timeglider-pan-left'></div><div class='timeglider-pan-right'></div>"
				+ "</div>"
				+ "</div>"
				// loading scrim
				+ "<div class='tg-loading-scrim' style='display:none'><div class='tg-loading-icon'></div></div>"

				// modal scrim
				+ "<div class='tg-scrim'></div>"

				+ "<div class='tg-scroller'><div class='tg-scroller-handle'></div></div>"

				+ "<div class='timeglider-footer' id='tg-footer'>"
				+ "	<div class='timeglider-logo hidden-phone'></div>"

				+ "	<div class='tg-footer-center'>"
				+ "		<div class='tg-prev tg-prevnext' ><a style='font-weight: bold;color: #ffffff;' style='text-decoration: none;'>上一个</a></div>"
				+ "		<div class='tg-date-display noselect'><div class='tg-date-display-arrow'></div><span style='    font-size:small;'></span></div>"
				+ "		<div class='tg-next tg-prevnext' ><a style='font-weight: bold;color: #ffffff;' style='text-decoration: none;'>下一个</a></div>"
				+ "	</div>"

				+ "	<div class='tg-footer-buttons' style='margin-right:20px'>"
				+ "		<div class='timeglider-footer-button timeglider-filter-bt pull-right hidden-phone' style='margin:0 1rem 0 0'></div>"
				+ "		<div class='timeglider-footer-button timeglider-settings-bt hidden'></div>"

				+ "	</div>"
				+ "</div>"
				+ "<div class='timeglider-event-hover-info'></div>"
				+ "</div><span id='timeglider-measure-span'></span>";

			this.element.html(MAIN_TEMPLATE);

		}, // eof _create()

		/**
		* takes the created template and inserts functionality
		*  from Mediator and View constructors
		*
		*
		*/
		_init : function () {

			// validateOptions should come out as empty string
			var optionsCheck = timeglider.validateOptions(this.options);

			if (optionsCheck == "") {

				tg.TG_Date.setCulture(this.options.culture);

				MED = new tg.TG_Mediator(this.options, this.element);
				timelinePlayer = new tg.TG_TimelinePlayer(this, MED);

				this.player = timelinePlayer;

				// after timelinePlayer is created this stuff can be done
				MED.setFocusDate(new TG_Date(this.options.initial_focus));

				MED.loadTimelineData(this.options.data_source, this.options.loaded);

			} else {
				alert("Rats. There's a problem with your widget settings:" + optionsCheck);
			}

			this.element.data("timeline", this.element.data("timegliderTimeline"));


		},


		/**
		*********  PUBLIC METHODS ***************
		*
		*/


		/*
		* goTo
		* sends timeline to a specific date and, optionally, zoom
		* @param d {String} ISO8601 date: 'YYYY-MM-DD HH:MM:SS'
		* @param z {Number} zoom level to change to; optional
		*/
		goTo : function (d, z) {

			if (d == "next") {
				MED.gotoNextEvent();
			} else if (d == "previous") {
				MED.gotoPreviousEvent();
			} else {
				MED.gotoDateZoom(d,z);
			}

			return this;
		},

		refresh : function () {
			MED.refresh();
			return this;
		},

		resize : function () {
			timelinePlayer.resize();
			return this;
		},

		filterBy : function (type, content) {
			MED.filterBy(type, content);
			return this;
		},

		addFilterAction: function (name, filterFunction, actionFunction) {
			MED.addFilterAction(name, filterFunction, actionFunction);
			return this;
		},

		removeFilterAction: function (name) {
			MED.removeFilterAction(name);
			return this;
		},

		getMediator : function () {
			return MED;
		},



		/*
		 * getEventByID
		 * By passing just an id, this returns the whole event object
		 * (or the attributes of the Backbone model)
		 * By adding a property such as "title", you can just get one property
		 * @param id {String} The event id, as it was passed in JSON data
		 * @param prop {String} optional property name string in case you
		 *        only want that one property
		*/
		getEventByID : function (id, prop) {
			return MED.getEventByID(id, prop);
		},


		updateEvent: function (model_object) {
			return MED.updateEvent(model_object);
		},


		/*
		 * focusToEvent
		 * By passing just an id, this returns the whole event object
		 * (or the attributes of the Backbone model)
		 * By adding a property such as "title", you can just get one property
		 * @param id {String} The event id, as it was passed in JSON data
		 * @param prop {String} optional property name string in case you
		 *        only want that one property
		*/
		focusToEvent : function (event_id) {
			var ev = MED.getEventByID(event_id);
			MED.focusToEvent(ev);

			return this;
		},


		getScope : function () {
			return MED.getScope();
		},



		fitToContainer : function () {
			MED.fitToContainer();

			return this;
		},



		/*
		 * adjustNowEvents
		 * keeps ongoing events current to the latest time
		 * For this to work, events need a property in them
		 * that looks like this:
		 *    "keepCurrent": "start"
		 *    OR
		 *    "keepCurrent": "end"
		 * The "start" value would update the startdate to be the
		 * current time and if start & end are the same, it would
		 * update both;  the "end" value would update the enddate
		 * only, creating a "leading edge" event with a continuous
		 * "still happening" state
		 */
		adjustNowEvents : function () {
			return MED.adjustNowEvents();
		},



		/*
		 * addEvent
		 * adds and event to any of the existing, loaded timelines
		 * @param new_event {Object} simple TG event
		          including: .id, .title, .startdate (simple ISO8601 string)
		          AND .timelines (array with timeline ids)
		 * @param refresh {Bool} Do we want to refresh the display
		 *        after the event is loaded? use false is loading a
		 *        group of events
		 *
		 */
		addEvent : function (new_event, refresh) {
			return MED.addEvent(new_event, refresh);
		},




		/**
		* zoom
		* zooms the timeline in or out, adding an amount, often 1 or -1
		*
		* @param n {number|string}
		*          numerical: -1 (or less) for zooming in, 1 (or more) for zooming out
		*          string:    "in" is the same as -1, "out" the same as 1
		*/
		zoom : function (n) {

			switch(n) {
				case "in": n = -1; break;
				case "out": n = 1; break;
			}
			// non-valid zoom levels
			if (n > 99 || n < -99) { return false; }

			MED.zoom(n);

			return this;
		},


		/**
		* loadTimeline
		* basic wrapper for Mediator loadTimeline
		*
		* @param src {String} JSON source for timeline
		*
		* @param callback_object {Function} simple function to run
		*         after data is loaded, toggles timeline to view by default
		*****
		*  OR
		*****
		*     callback_object includes
		*     .fn = function that will be called
		*     .args = arguments Object to be passed in fn (above)
		*     .display = boolean, set to true to swap in just
		                 the first timeline loaded; otherwise
		                 it will load but won't immediately display
		*     (fn will also have timeline(s) available as "data" in 2nd arg)
		*
		* @param reload {Boolean} replace an existing timeline with the
		         same id as the one to be loaded in src
		*
		*
		*/
		loadTimeline : function (src, callback_object, reload) {

			MED.loadTimelineData(src, callback_object, reload);

			return this;
		},


		/**
		* reloadTimelime
		* reloads already loaded timeline from json
		*
		* @param id {String} timeline id
		* @param source {string url} url at which JSON will be fetched
		*/
		reloadTimeline : function (id, source) {
			MED.reloadTimeline(id, source);
			return this;
		},


		/**
		*  panButton
		*  sets a pan action on an element for mousedown and mouseup|mouseover
		*
		*
		*/
		panButton : function (jquery_sel, vel) {
			var _vel = 0;
			switch(vel) {
				case "left": _vel = 30; break;
				case "right": _vel = -30; break;
				default: _vel = vel; break;
			}
			timelinePlayer.setPanButton(jquery_sel, _vel);
		},


		/**
		* destroy
		* wipes out everything
		*/
		destroy : function () {
			MED.emptyData();
			$.Widget.prototype.destroy.apply(this, arguments);
			$(this.element).html("");
		}

	}); // end widget process

})(jQuery);

/// DATEPICKER
/*
* dependencies: timeglider.datepicker.css, tg.TG_Date
*/

(function($, timeglider){

	var instances = {};
	var $instance = {};
	var ymd = {};
	var restore = '';
	var $picker;
	var touch_device;
	var tg = timeglider;


	// params could include month abbreviations
	$.fn.timegliderDatePicker = function(options) {

	  	var clickortouch = "click",
	  		touch_device = false,

	  		$wrap = $(this); // class, not instance

	  		var id = $wrap.attr("id");
	  		var $input = $(this).find("input"); // class, not instance
	  		var $cal_icon = $(this).find(".cal_icon");
	  		// hash the instances!
	  		instances[id] = $input;

	  		if (  (typeof Modernizr != "undefined" && Modernizr.touch) || ((/iphone|ipad|ipod/i).test(navigator.userAgent))  ) {
			touch_device = true;
			}

	  		//Set the default values
            var defaults = { },
        	options =  $.extend(defaults, options),
        	TG_Date = timeglider.TG_Date,
  			mo3 = ["一月","二月","三月","四月","五月", "六月", "七月", "八月", "九月", "十月", "十一", "十二"],
  			monthsDayNums = [0,31,28,31,30,31,30,31,31,30,31,30,31,29],

  			datepicker_html = "<div id='tg-datepicker' class='tg-datepicker panel' style='width: 350px;display: block;top: 461px;left: 525px;height: 280px;    overflow: hidden;'>"

				+ "<div class='yearfield'>"
				+ "<span class='plusminus minus' id='yearfield-minus'></span>"
				+ "<input id='yearfield-input' type='text' style='margin-bottom:6px;    padding: 0px 0px;'>"
				+ "<span class='plusminus plus' id='yearfield-plus'></span>"
				+ "</div>"
				+ "<div class='tg-datepicker-month-col'>"
				+ "<ul>"
				+ "<li data-mo='1'>一月</li>"
				+ "<li data-mo='2'>二月</li>"
				+ "<li data-mo='3'>三月</li>"
				+ "<li data-mo='4'>四月</li>"
				+ "<li data-mo='5'>五月</li>"
				+ "<li data-mo='6'>六月</li>"

				+ "</ul>"
				+ "</div>"

				+ "<div class='tg-datepicker-month-col'>"
				+ "<ul>"
				+ "<li data-mo='7'>七月</li>"
				+ "<li data-mo='8'>八月</li>"
				+ "<li data-mo='9'>九月</li>"
				+ "<li data-mo='10'>十月</li>"
				+ "<li data-mo='11'>十一</li>"
				+ "<li data-mo='12'>十二</li>"
				+ "</ul>"
				+ "</div>"


				+ "<div class='tg-datepicker-month-block'>"
				+ "<table style='background-color:#bbbbbb'>"
				+ "<tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr>"
				+ "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
				+ "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
				+ "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
				+ "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
				+ "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
				+ "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
				+ "</table>"
				+ "</div>"

				+ "<div class='panel-footer'>"
				+ "<div class='button-group'>"
				+ "<div class='save button'>确认</div><div class='cancel button'>取消</div>"
				+ "</div>"
				+ "</div>"
				+ "</div>";



		if (touch_device === true || tg.ui.touchtesting == true) {


		    clickortouch = "touchstart";

            $tc = $("<div class='tg-touchcover'>&nbsp;</div>")
            	.appendTo($wrap);


            $tc.css({
            	width:"100%",
            	height:"28px"
            }).bind(clickortouch, function (e) {
				e.stopPropagation();
				var clicked_id = $(e.target).parent().find("input").attr("id");

				$instance = $(e.target); // .closest(".tg-dtinput-wrap").find(".dateinput");
				init();

			});

            // !TODO: build touchcover from scratch rather
            //        than relying on existing HTML/CSS
            $wrap.bind(clickortouch, function (e) {
            	e.preventDefault();
				e.stopPropagation();
			});

			$("#yearfield-input").bind("touchstart", function() {
				$(this).trigger("focus");

			});


			$input.bind("blur focus touchmove click touchstart gesturestart", function (e) {
				e.preventDefault();
			});


		// not a touch device...
        } else {

       		clickortouch = "click";

        	// trigger click from button beside the input field
			$input.bind("focus", function (e) {
				// e.stopPropagation();
			});

			$cal_icon.bind(clickortouch, function (e) {

				e.stopPropagation();

				$instance =  $(e.target).closest(".tg-dtinput-wrap").find("input");
				init();
			});

			$input.on("keydown", function(e) {

				detectKeydown(e);
			});


        }

		/* single instance of this */
		var $picker = {};


		if ($(".tg-datepicker").length > 0) {
			$picker = $(".tg-datepicker");

		} else {

			$picker = $(datepicker_html).appendTo("body").hide();

			$picker.find(".save").bind(clickortouch, function(e) {
					e.preventDefault();
					returnDate(); })
				.end()
				.find(".cancel").bind(clickortouch, function(e) {
					e.preventDefault();
					restoreDate(); })
				.end()
				.find("#yearfield-minus").bind(clickortouch, function(e) {
					e.preventDefault();
					setYear(-1);
				})
				.end()
				.find("#yearfield-plus").bind(clickortouch, function(e) {
					e.preventDefault();
					setYear(1);
				})
				.end();

			$picker.delegate("td", clickortouch, function (e) {
					e.preventDefault();
					e.stopPropagation();

					var dtxt = $(this).text();
					setDay(dtxt);
				})
				.delegate(".tg-datepicker-month-col li", clickortouch, function (e) {

					e.preventDefault();
					setMonth($(this).data("mo"));
				})
				.bind(clickortouch, function(e) {
					e.preventDefault();
					e.stopPropagation();
				});



			$("#yearfield-input").change(function() { setYear(); });

			$("#yearfield-input").keyup(function() { setYear(); });

		}


		function init() {
			// OK

			var posopt = options.position || {
				my: "left top",
			    at: "left bottom",
			    offset: "0, 0",
			    collision:"none"
	         };

	         posopt.of = $instance;

			$picker.fadeIn().position(posopt).css("z-index", timeglider.ui.superTop++)


	        // get the starting date
	        var chosenStr = restore = $instance.val();

	        // make sure it's valid!!

	        $(document).bind(clickortouch, close);

	      	// at least pass the ye, mo, da

	       	buildCalendar(new TG_Date(chosenStr));
		}



		function detectKeydown (e) {


			switch(e.which) {
				case 0: case 9: case 13:
					close();
				break;
			}
		}

		function setDay (num) {
			ymd.da = num;
			buildCalendar(ymd);
		}

		function setMonth (num) {
			ymd.mo = num;
			buildCalendar(ymd);
		}

		function setYear(ch){

			if (!ch || ch == 0) {
				var ye=0;
				ye = Number($("#yearfield-input").val());

				if (!isNaN(ye) && (ye > 0 || ye < 0)) {
					ymd.ye = ye;
					buildCalendar(ymd);
				}
			} else {
				ymd.ye += ch;
				buildCalendar(ymd);
			}

		}

		function close(r) {
			$(document).unbind(clickortouch, close);
			$picker.css("left", -1000);
		}

		function returnDate() {
			var val = ymd.ye + "-" + TG_Date.unboil(ymd.mo) + "-" + TG_Date.unboil(ymd.da);
			$instance.val(val);

			$.publish("tg.datepicker.picked", val);

			close("return date");
		}


		function restoreDate() {
			$instance.val(restore);

			close("restore date");
		}


		// TG_Date.;
		function buildCalendar(dobj) {

			$picker.find(".yearfield input").val(dobj.ye);

			var first_rd = timeglider.TG_Date.getRataDie({ye:dobj.ye, mo:dobj.mo, da:1}),
				last_da_num = TG_Date.getLastDayOfMonth(dobj.ye, dobj.mo),
				start_weekday = (first_rd % 7), // 0 - 6
				li_ct = 0, mo_num = 1;	td_ct = 0, da_num = 1;

			// clear month selection then loop down months
			$picker.find('.tg-datepicker-month-col li').removeClass("tg-datepicker-month-on");
			$picker.find('.tg-datepicker-month-col li').each(function(index) {
       				if (dobj.mo == (li_ct+1)){
    					$(this).addClass('tg-datepicker-month-on');
    				}
    				li_ct++;
  			});

			// clear day selection, then loop through days
			$picker.find('.tg-datepicker-month-block td').removeClass("tg-datepicker-day-on");
			$picker.find('.tg-datepicker-month-block td').each(function(index) {

    			if ((td_ct >= start_weekday) && (da_num <= last_da_num)) {

    				$(this).text(da_num);

    				if (dobj.da == (da_num)){
    					$(this).addClass('tg-datepicker-day-on');
    				}

    				da_num++;
    			} else {
    				$(this).text("");
    			}
    			td_ct++;
  			});

  			// set YMD
  			ymd = dobj;



		} // end buildCalendar


		return this;


	/////////////////////
	}
})(jQuery, timeglider);
// END DATEPICKER