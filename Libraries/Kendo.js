//hack
htmlEncodeGlobal = function (value) {
    var ampRegExp = /&/g, ltRegExp = /</g, quoteRegExp = /"/g, aposRegExp = /'/g, gtRegExp = />/g;
    return ('' + value).replace(ampRegExp, '&amp;').replace(ltRegExp, '&lt;').replace(gtRegExp, '&gt;').replace(quoteRegExp, '&quot;').replace(aposRegExp, '&#39;');
};


/** 
 * Copyright 2016 Telerik AD                                                                                                                                                                            
 *                                                                                                                                                                                                      
 * Licensed under the Apache License, Version 2.0 (the "License");                                                                                                                                      
 * you may not use this file except in compliance with the License.                                                                                                                                     
 * You may obtain a copy of the License at                                                                                                                                                              
 *                                                                                                                                                                                                      
 *     http://www.apache.org/licenses/LICENSE-2.0                                                                                                                                                       
 *                                                                                                                                                                                                      
 * Unless required by applicable law or agreed to in writing, software                                                                                                                                  
 * distributed under the License is distributed on an "AS IS" BASIS,                                                                                                                                    
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.                                                                                                                             
 * See the License for the specific language governing permissions and                                                                                                                                  
 * limitations under the License.                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.core', f);
}(function () {
    var __meta__ = {
        id: 'core',
        name: 'Core',
        category: 'framework',
        description: 'The core of the Kendo framework.'
        };

    (function ($, window, undefined) {
        //hack to get kendo to work
        var $ = window.$; 
        var kendo = window.kendo;

        var kendo = window.kendo = window.kendo || { cultures: {} }, extend = $.extend, each = $.each, isArray = $.isArray, proxy = $.proxy, noop = $.noop, math = Math, Template, JSON = window.JSON || {}, support = {}, percentRegExp = /%/, formatRegExp = /\{(\d+)(:[^\}]+)?\}/g, boxShadowRegExp = /(\d+(?:\.?)\d*)px\s*(\d+(?:\.?)\d*)px\s*(\d+(?:\.?)\d*)px\s*(\d+)?/i, numberRegExp = /^(\+|-?)\d+(\.?)\d*$/, FUNCTION = 'function', STRING = 'string', NUMBER = 'number', OBJECT = 'object', NULL = 'null', BOOLEAN = 'boolean', UNDEFINED = 'undefined', getterCache = {}, setterCache = {}, slice = [].slice;
        kendo.version = '2016.2.504'.replace(/^\s+|\s+$/g, '');
        function Class() {
        }
        Class.extend = function (proto) {
            var base = function () {
            }, member, that = this, subclass = proto && proto.init ? proto.init : function () {
                that.apply(this, arguments);
            }, fn;
            base.prototype = that.prototype;
            fn = subclass.fn = subclass.prototype = new base();
            for (member in proto) {
                if (proto[member] != null && proto[member].constructor === Object) {
                    fn[member] = extend(true, {}, base.prototype[member], proto[member]);
                } else {
                    fn[member] = proto[member];
                }
            }
            fn.constructor = subclass;
            subclass.extend = that.extend;
            return subclass;
        };
        Class.prototype._initOptions = function (options) {
            this.options = deepExtend({}, this.options, options);
        };
        var isFunction = kendo.isFunction = function (fn) {
            return typeof fn === 'function';
        };
        var preventDefault = function () {
            this._defaultPrevented = true;
        };
        var isDefaultPrevented = function () {
            return this._defaultPrevented === true;
        };
        var Observable = Class.extend({
            init: function () {
                this._events = {};
            },
            bind: function (eventName, handlers, one) {
                var that = this, idx, eventNames = typeof eventName === STRING ? [eventName] : eventName, length, original, handler, handlersIsFunction = typeof handlers === FUNCTION, events;
                if (handlers === undefined) {
                    for (idx in eventName) {
                        that.bind(idx, eventName[idx]);
                    }
                    return that;
                }
                for (idx = 0, length = eventNames.length; idx < length; idx++) {
                    eventName = eventNames[idx];
                    handler = handlersIsFunction ? handlers : handlers[eventName];
                    if (handler) {
                        if (one) {
                            original = handler;
                            handler = function () {
                                that.unbind(eventName, handler);
                                original.apply(that, arguments);
                            };
                            handler.original = original;
                        }
                        events = that._events[eventName] = that._events[eventName] || [];
                        events.push(handler);
                    }
                }
                return that;
            },
            one: function (eventNames, handlers) {
                return this.bind(eventNames, handlers, true);
            },
            first: function (eventName, handlers) {
                var that = this, idx, eventNames = typeof eventName === STRING ? [eventName] : eventName, length, handler, handlersIsFunction = typeof handlers === FUNCTION, events;
                for (idx = 0, length = eventNames.length; idx < length; idx++) {
                    eventName = eventNames[idx];
                    handler = handlersIsFunction ? handlers : handlers[eventName];
                    if (handler) {
                        events = that._events[eventName] = that._events[eventName] || [];
                        events.unshift(handler);
                    }
                }
                return that;
            },
            trigger: function (eventName, e) {
                var that = this, events = that._events[eventName], idx, length;
                if (events) {
                    e = e || {};
                    e.sender = that;
                    e._defaultPrevented = false;
                    e.preventDefault = preventDefault;
                    e.isDefaultPrevented = isDefaultPrevented;
                    events = events.slice();
                    for (idx = 0, length = events.length; idx < length; idx++) {
                        events[idx].call(that, e);
                    }
                    return e._defaultPrevented === true;
                }
                return false;
            },
            unbind: function (eventName, handler) {
                var that = this, events = that._events[eventName], idx;
                if (eventName === undefined) {
                    that._events = {};
                } else if (events) {
                    if (handler) {
                        for (idx = events.length - 1; idx >= 0; idx--) {
                            if (events[idx] === handler || events[idx].original === handler) {
                                events.splice(idx, 1);
                            }
                        }
                    } else {
                        that._events[eventName] = [];
                    }
                }
                return that;
            }
        });
        function compilePart(part, stringPart) {
            if (stringPart) {
                return '\'' + part.split('\'').join('\\\'').split('\\"').join('\\\\\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '\'';
            } else {
                var first = part.charAt(0), rest = part.substring(1);
                if (first === '=') {
                    return '+(' + rest + ')+';
                } else if (first === ':') {
                    return '+$kendoHtmlEncode(' + rest + ')+';
                } else {
                    return ';' + part + ';$kendoOutput+=';
                }
            }
        }
        var argumentNameRegExp = /^\w+/, encodeRegExp = /\$\{([^}]*)\}/g, escapedCurlyRegExp = /\\\}/g, curlyRegExp = /__CURLY__/g, escapedSharpRegExp = /\\#/g, sharpRegExp = /__SHARP__/g, zeros = [
            '',
            '0',
            '00',
            '000',
            '0000'
        ];
        Template = {
            paramName: 'data',
            useWithBlock: true,
            render: function (template, data) {
                var idx, length, html = '';
                for (idx = 0, length = data.length; idx < length; idx++) {
                    html += template(data[idx]);
                }
                return html;
            },
            compile: function (template, options) {
                var settings = extend({}, this, options), paramName = settings.paramName, argumentName = paramName.match(argumentNameRegExp)[0], useWithBlock = settings.useWithBlock, functionBody = 'var $kendoOutput, $kendoHtmlEncode = window.htmlEncodeGlobal;', fn, parts, idx;
                if (isFunction(template)) {
                    return template;
                }
                functionBody += useWithBlock ? 'with(' + paramName + '){' : '';
                functionBody += '$kendoOutput=';
                parts = template.replace(escapedCurlyRegExp, '__CURLY__').replace(encodeRegExp, '#=window.htmlEncodeGlobal($1)#').replace(curlyRegExp, '}').replace(escapedSharpRegExp, '__SHARP__').split('#');
                for (idx = 0; idx < parts.length; idx++) {
                    functionBody += compilePart(parts[idx], idx % 2 === 0);
                }
                functionBody += useWithBlock ? ';}' : ';';
                functionBody += 'return $kendoOutput;';
                functionBody = functionBody.replace(sharpRegExp, '#');
                try {
                    fn = new Function(argumentName, functionBody);
                    fn._slotCount = Math.floor(parts.length / 2);
                    return fn;
                } catch (e) {
                    throw new Error(kendo.format('Invalid template:\'{0}\' Generated code:\'{1}\'', template, functionBody));
                }
            }
        };
        function pad(number, digits, end) {
            number = number + '';
            digits = digits || 2;
            end = digits - number.length;
            if (end) {
                return zeros[digits].substring(0, end) + number;
            }
            return number;
        }
        (function () {
            var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = {
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            }, rep, toString = {}.toString;
            if (typeof Date.prototype.toJSON !== FUNCTION) {
                Date.prototype.toJSON = function () {
                    var that = this;
                    return isFinite(that.valueOf()) ? pad(that.getUTCFullYear(), 4) + '-' + pad(that.getUTCMonth() + 1) + '-' + pad(that.getUTCDate()) + 'T' + pad(that.getUTCHours()) + ':' + pad(that.getUTCMinutes()) + ':' + pad(that.getUTCSeconds()) + 'Z' : null;
                };
                String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () {
                    return this.valueOf();
                };
            }
            function quote(string) {
                escapable.lastIndex = 0;
                return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                    var c = meta[a];
                    return typeof c === STRING ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                }) + '"' : '"' + string + '"';
            }
            function str(key, holder) {
                var i, k, v, length, mind = gap, partial, value = holder[key], type;
                if (value && typeof value === OBJECT && typeof value.toJSON === FUNCTION) {
                    value = value.toJSON(key);
                }
                if (typeof rep === FUNCTION) {
                    value = rep.call(holder, key, value);
                }
                type = typeof value;
                if (type === STRING) {
                    return quote(value);
                } else if (type === NUMBER) {
                    return isFinite(value) ? String(value) : NULL;
                } else if (type === BOOLEAN || type === NULL) {
                    return String(value);
                } else if (type === OBJECT) {
                    if (!value) {
                        return NULL;
                    }
                    gap += indent;
                    partial = [];
                    if (toString.apply(value) === '[object Array]') {
                        length = value.length;
                        for (i = 0; i < length; i++) {
                            partial[i] = str(i, value) || NULL;
                        }
                        v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                        gap = mind;
                        return v;
                    }
                    if (rep && typeof rep === OBJECT) {
                        length = rep.length;
                        for (i = 0; i < length; i++) {
                            if (typeof rep[i] === STRING) {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    } else {
                        for (k in value) {
                            if (Object.hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    }
                    v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
                    gap = mind;
                    return v;
                }
            }
            if (typeof JSON.stringify !== FUNCTION) {
                JSON.stringify = function (value, replacer, space) {
                    var i;
                    gap = '';
                    indent = '';
                    if (typeof space === NUMBER) {
                        for (i = 0; i < space; i += 1) {
                            indent += ' ';
                        }
                    } else if (typeof space === STRING) {
                        indent = space;
                    }
                    rep = replacer;
                    if (replacer && typeof replacer !== FUNCTION && (typeof replacer !== OBJECT || typeof replacer.length !== NUMBER)) {
                        throw new Error('JSON.stringify');
                    }
                    return str('', { '': value });
                };
            }
        }());
        (function () {
            var dateFormatRegExp = /dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|HH|H|hh|h|mm|m|fff|ff|f|tt|ss|s|zzz|zz|z|"[^"]*"|'[^']*'/g, standardFormatRegExp = /^(n|c|p|e)(\d*)$/i, literalRegExp = /(\\.)|(['][^']*[']?)|(["][^"]*["]?)/g, commaRegExp = /\,/g, EMPTY = '', POINT = '.', COMMA = ',', SHARP = '#', ZERO = '0', PLACEHOLDER = '??', EN = 'en-US', objectToString = {}.toString;
            kendo.cultures['en-US'] = {
                name: EN,
                numberFormat: {
                    pattern: ['-n'],
                    decimals: 2,
                    ',': ',',
                    '.': '.',
                    groupSize: [3],
                    percent: {
                        pattern: [
                            '-n %',
                            'n %'
                        ],
                        decimals: 2,
                        ',': ',',
                        '.': '.',
                        groupSize: [3],
                        symbol: '%'
                    },
                    currency: {
                        name: 'US Dollar',
                        abbr: 'USD',
                        pattern: [
                            '($n)',
                            '$n'
                        ],
                        decimals: 2,
                        ',': ',',
                        '.': '.',
                        groupSize: [3],
                        symbol: '$'
                    }
                },
                calendars: {
                    standard: {
                        days: {
                            names: [
                                'Sunday',
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday'
                            ],
                            namesAbbr: [
                                'Sun',
                                'Mon',
                                'Tue',
                                'Wed',
                                'Thu',
                                'Fri',
                                'Sat'
                            ],
                            namesShort: [
                                'Su',
                                'Mo',
                                'Tu',
                                'We',
                                'Th',
                                'Fr',
                                'Sa'
                            ]
                        },
                        months: {
                            names: [
                                'January',
                                'February',
                                'March',
                                'April',
                                'May',
                                'June',
                                'July',
                                'August',
                                'September',
                                'October',
                                'November',
                                'December'
                            ],
                            namesAbbr: [
                                'Jan',
                                'Feb',
                                'Mar',
                                'Apr',
                                'May',
                                'Jun',
                                'Jul',
                                'Aug',
                                'Sep',
                                'Oct',
                                'Nov',
                                'Dec'
                            ]
                        },
                        AM: [
                            'AM',
                            'am',
                            'AM'
                        ],
                        PM: [
                            'PM',
                            'pm',
                            'PM'
                        ],
                        patterns: {
                            d: 'M/d/yyyy',
                            D: 'dddd, MMMM dd, yyyy',
                            F: 'dddd, MMMM dd, yyyy h:mm:ss tt',
                            g: 'M/d/yyyy h:mm tt',
                            G: 'M/d/yyyy h:mm:ss tt',
                            m: 'MMMM dd',
                            M: 'MMMM dd',
                            s: 'yyyy\'-\'MM\'-\'ddTHH\':\'mm\':\'ss',
                            t: 'h:mm tt',
                            T: 'h:mm:ss tt',
                            u: 'yyyy\'-\'MM\'-\'dd HH\':\'mm\':\'ss\'Z\'',
                            y: 'MMMM, yyyy',
                            Y: 'MMMM, yyyy'
                        },
                        '/': '/',
                        ':': ':',
                        firstDay: 0,
                        twoDigitYearMax: 2029
                    }
                }
            };
            function findCulture(culture) {
                if (culture) {
                    if (culture.numberFormat) {
                        return culture;
                    }
                    if (typeof culture === STRING) {
                        var cultures = kendo.cultures;
                        return cultures[culture] || cultures[culture.split('-')[0]] || null;
                    }
                    return null;
                }
                return null;
            }
            function getCulture(culture) {
                if (culture) {
                    culture = findCulture(culture);
                }
                return culture || kendo.cultures.current;
            }
            kendo.culture = function (cultureName) {
                var cultures = kendo.cultures, culture;
                if (cultureName !== undefined) {
                    culture = findCulture(cultureName) || cultures[EN];
                    culture.calendar = culture.calendars.standard;
                    cultures.current = culture;
                } else {
                    return cultures.current;
                }
            };
            kendo.findCulture = findCulture;
            kendo.getCulture = getCulture;
            kendo.culture(EN);
            function formatDate(date, format, culture) {
                culture = getCulture(culture);
                var calendar = culture.calendars.standard, days = calendar.days, months = calendar.months;
                format = calendar.patterns[format] || format;
                return format.replace(dateFormatRegExp, function (match) {
                    var minutes;
                    var result;
                    var sign;
                    if (match === 'd') {
                        result = date.getDate();
                    } else if (match === 'dd') {
                        result = pad(date.getDate());
                    } else if (match === 'ddd') {
                        result = days.namesAbbr[date.getDay()];
                    } else if (match === 'dddd') {
                        result = days.names[date.getDay()];
                    } else if (match === 'M') {
                        result = date.getMonth() + 1;
                    } else if (match === 'MM') {
                        result = pad(date.getMonth() + 1);
                    } else if (match === 'MMM') {
                        result = months.namesAbbr[date.getMonth()];
                    } else if (match === 'MMMM') {
                        result = months.names[date.getMonth()];
                    } else if (match === 'yy') {
                        result = pad(date.getFullYear() % 100);
                    } else if (match === 'yyyy') {
                        result = pad(date.getFullYear(), 4);
                    } else if (match === 'h') {
                        result = date.getHours() % 12 || 12;
                    } else if (match === 'hh') {
                        result = pad(date.getHours() % 12 || 12);
                    } else if (match === 'H') {
                        result = date.getHours();
                    } else if (match === 'HH') {
                        result = pad(date.getHours());
                    } else if (match === 'm') {
                        result = date.getMinutes();
                    } else if (match === 'mm') {
                        result = pad(date.getMinutes());
                    } else if (match === 's') {
                        result = date.getSeconds();
                    } else if (match === 'ss') {
                        result = pad(date.getSeconds());
                    } else if (match === 'f') {
                        result = math.floor(date.getMilliseconds() / 100);
                    } else if (match === 'ff') {
                        result = date.getMilliseconds();
                        if (result > 99) {
                            result = math.floor(result / 10);
                        }
                        result = pad(result);
                    } else if (match === 'fff') {
                        result = pad(date.getMilliseconds(), 3);
                    } else if (match === 'tt') {
                        result = date.getHours() < 12 ? calendar.AM[0] : calendar.PM[0];
                    } else if (match === 'zzz') {
                        minutes = date.getTimezoneOffset();
                        sign = minutes < 0;
                        result = math.abs(minutes / 60).toString().split('.')[0];
                        minutes = math.abs(minutes) - result * 60;
                        result = (sign ? '+' : '-') + pad(result);
                        result += ':' + pad(minutes);
                    } else if (match === 'zz' || match === 'z') {
                        result = date.getTimezoneOffset() / 60;
                        sign = result < 0;
                        result = math.abs(result).toString().split('.')[0];
                        result = (sign ? '+' : '-') + (match === 'zz' ? pad(result) : result);
                    }
                    return result !== undefined ? result : match.slice(1, match.length - 1);
                });
            }
            function formatNumber(number, format, culture) {
                culture = getCulture(culture);
                var numberFormat = culture.numberFormat, decimal = numberFormat[POINT], precision = numberFormat.decimals, pattern = numberFormat.pattern[0], literals = [], symbol, isCurrency, isPercent, customPrecision, formatAndPrecision, negative = number < 0, integer, fraction, integerLength, fractionLength, replacement = EMPTY, value = EMPTY, idx, length, ch, hasGroup, hasNegativeFormat, decimalIndex, sharpIndex, zeroIndex, hasZero, hasSharp, percentIndex, currencyIndex, startZeroIndex, start = -1, end;
                if (number === undefined) {
                    return EMPTY;
                }
                if (!isFinite(number)) {
                    return number;
                }
                if (!format) {
                    return culture.name.length ? number.toLocaleString() : number.toString();
                }
                formatAndPrecision = standardFormatRegExp.exec(format);
                if (formatAndPrecision) {
                    format = formatAndPrecision[1].toLowerCase();
                    isCurrency = format === 'c';
                    isPercent = format === 'p';
                    if (isCurrency || isPercent) {
                        numberFormat = isCurrency ? numberFormat.currency : numberFormat.percent;
                        decimal = numberFormat[POINT];
                        precision = numberFormat.decimals;
                        symbol = numberFormat.symbol;
                        pattern = numberFormat.pattern[negative ? 0 : 1];
                    }
                    customPrecision = formatAndPrecision[2];
                    if (customPrecision) {
                        precision = +customPrecision;
                    }
                    if (format === 'e') {
                        return customPrecision ? number.toExponential(precision) : number.toExponential();
                    }
                    if (isPercent) {
                        number *= 100;
                    }
                    number = round(number, precision);
                    negative = number < 0;
                    number = number.split(POINT);
                    integer = number[0];
                    fraction = number[1];
                    if (negative) {
                        integer = integer.substring(1);
                    }
                    value = groupInteger(integer, 0, integer.length, numberFormat);
                    if (fraction) {
                        value += decimal + fraction;
                    }
                    if (format === 'n' && !negative) {
                        return value;
                    }
                    number = EMPTY;
                    for (idx = 0, length = pattern.length; idx < length; idx++) {
                        ch = pattern.charAt(idx);
                        if (ch === 'n') {
                            number += value;
                        } else if (ch === '$' || ch === '%') {
                            number += symbol;
                        } else {
                            number += ch;
                        }
                    }
                    return number;
                }
                if (negative) {
                    number = -number;
                }
                if (format.indexOf('\'') > -1 || format.indexOf('"') > -1 || format.indexOf('\\') > -1) {
                    format = format.replace(literalRegExp, function (match) {
                        var quoteChar = match.charAt(0).replace('\\', ''), literal = match.slice(1).replace(quoteChar, '');
                        literals.push(literal);
                        return PLACEHOLDER;
                    });
                }
                format = format.split(';');
                if (negative && format[1]) {
                    format = format[1];
                    hasNegativeFormat = true;
                } else if (number === 0) {
                    format = format[2] || format[0];
                    if (format.indexOf(SHARP) == -1 && format.indexOf(ZERO) == -1) {
                        return format;
                    }
                } else {
                    format = format[0];
                }
                percentIndex = format.indexOf('%');
                currencyIndex = format.indexOf('$');
                isPercent = percentIndex != -1;
                isCurrency = currencyIndex != -1;
                if (isPercent) {
                    number *= 100;
                }
                if (isCurrency && format[currencyIndex - 1] === '\\') {
                    format = format.split('\\').join('');
                    isCurrency = false;
                }
                if (isCurrency || isPercent) {
                    numberFormat = isCurrency ? numberFormat.currency : numberFormat.percent;
                    decimal = numberFormat[POINT];
                    precision = numberFormat.decimals;
                    symbol = numberFormat.symbol;
                }
                hasGroup = format.indexOf(COMMA) > -1;
                if (hasGroup) {
                    format = format.replace(commaRegExp, EMPTY);
                }
                decimalIndex = format.indexOf(POINT);
                length = format.length;
                if (decimalIndex != -1) {
                    fraction = number.toString().split('e');
                    if (fraction[1]) {
                        fraction = round(number, Math.abs(fraction[1]));
                    } else {
                        fraction = fraction[0];
                    }
                    fraction = fraction.split(POINT)[1] || EMPTY;
                    zeroIndex = format.lastIndexOf(ZERO) - decimalIndex;
                    sharpIndex = format.lastIndexOf(SHARP) - decimalIndex;
                    hasZero = zeroIndex > -1;
                    hasSharp = sharpIndex > -1;
                    idx = fraction.length;
                    if (!hasZero && !hasSharp) {
                        format = format.substring(0, decimalIndex) + format.substring(decimalIndex + 1);
                        length = format.length;
                        decimalIndex = -1;
                        idx = 0;
                    }
                    if (hasZero && zeroIndex > sharpIndex) {
                        idx = zeroIndex;
                    } else if (sharpIndex > zeroIndex) {
                        if (hasSharp && idx > sharpIndex) {
                            idx = sharpIndex;
                        } else if (hasZero && idx < zeroIndex) {
                            idx = zeroIndex;
                        }
                    }
                    if (idx > -1) {
                        number = round(number, idx);
                    }
                } else {
                    number = round(number);
                }
                sharpIndex = format.indexOf(SHARP);
                startZeroIndex = zeroIndex = format.indexOf(ZERO);
                if (sharpIndex == -1 && zeroIndex != -1) {
                    start = zeroIndex;
                } else if (sharpIndex != -1 && zeroIndex == -1) {
                    start = sharpIndex;
                } else {
                    start = sharpIndex > zeroIndex ? zeroIndex : sharpIndex;
                }
                sharpIndex = format.lastIndexOf(SHARP);
                zeroIndex = format.lastIndexOf(ZERO);
                if (sharpIndex == -1 && zeroIndex != -1) {
                    end = zeroIndex;
                } else if (sharpIndex != -1 && zeroIndex == -1) {
                    end = sharpIndex;
                } else {
                    end = sharpIndex > zeroIndex ? sharpIndex : zeroIndex;
                }
                if (start == length) {
                    end = start;
                }
                if (start != -1) {
                    value = number.toString().split(POINT);
                    integer = value[0];
                    fraction = value[1] || EMPTY;
                    integerLength = integer.length;
                    fractionLength = fraction.length;
                    if (negative && number * -1 >= 0) {
                        negative = false;
                    }
                    number = format.substring(0, start);
                    if (negative && !hasNegativeFormat) {
                        number += '-';
                    }
                    for (idx = start; idx < length; idx++) {
                        ch = format.charAt(idx);
                        if (decimalIndex == -1) {
                            if (end - idx < integerLength) {
                                number += integer;
                                break;
                            }
                        } else {
                            if (zeroIndex != -1 && zeroIndex < idx) {
                                replacement = EMPTY;
                            }
                            if (decimalIndex - idx <= integerLength && decimalIndex - idx > -1) {
                                number += integer;
                                idx = decimalIndex;
                            }
                            if (decimalIndex === idx) {
                                number += (fraction ? decimal : EMPTY) + fraction;
                                idx += end - decimalIndex + 1;
                                continue;
                            }
                        }
                        if (ch === ZERO) {
                            number += ch;
                            replacement = ch;
                        } else if (ch === SHARP) {
                            number += replacement;
                        }
                    }
                    if (hasGroup) {
                        number = groupInteger(number, start, Math.max(end, integerLength + start - 1), numberFormat);
                    }
                    if (end >= start) {
                        number += format.substring(end + 1);
                    }
                    if (isCurrency || isPercent) {
                        value = EMPTY;
                        for (idx = 0, length = number.length; idx < length; idx++) {
                            ch = number.charAt(idx);
                            value += ch === '$' || ch === '%' ? symbol : ch;
                        }
                        number = value;
                    }
                    length = literals.length;
                    if (length) {
                        for (idx = 0; idx < length; idx++) {
                            number = number.replace(PLACEHOLDER, literals[idx]);
                        }
                    }
                }
                return number;
            }
            var groupInteger = function (number, start, end, numberFormat) {
                var decimalIndex = number.indexOf(numberFormat[POINT]);
                var groupSizes = numberFormat.groupSize.slice();
                var groupSize = groupSizes.shift();
                var integer, integerLength;
                var idx, parts, value;
                var newGroupSize;
                end = decimalIndex !== -1 ? decimalIndex : end + 1;
                integer = number.substring(start, end);
                integerLength = integer.length;
                if (integerLength >= groupSize) {
                    idx = integerLength;
                    parts = [];
                    while (idx > -1) {
                        value = integer.substring(idx - groupSize, idx);
                        if (value) {
                            parts.push(value);
                        }
                        idx -= groupSize;
                        newGroupSize = groupSizes.shift();
                        groupSize = newGroupSize !== undefined ? newGroupSize : groupSize;
                        if (groupSize === 0) {
                            parts.push(integer.substring(0, idx));
                            break;
                        }
                    }
                    integer = parts.reverse().join(numberFormat[COMMA]);
                    number = number.substring(0, start) + integer + number.substring(end);
                }
                return number;
            };
            var round = function (value, precision) {
                precision = precision || 0;
                value = value.toString().split('e');
                value = Math.round(+(value[0] + 'e' + (value[1] ? +value[1] + precision : precision)));
                value = value.toString().split('e');
                value = +(value[0] + 'e' + (value[1] ? +value[1] - precision : -precision));
                return value.toFixed(precision);
            };
            var toString = function (value, fmt, culture) {
                if (fmt) {
                    if (objectToString.call(value) === '[object Date]') {
                        return formatDate(value, fmt, culture);
                    } else if (typeof value === NUMBER) {
                        return formatNumber(value, fmt, culture);
                    }
                }
                return value !== undefined ? value : '';
            };
            kendo.format = function (fmt) {
                var values = arguments;
                return fmt.replace(formatRegExp, function (match, index, placeholderFormat) {
                    var value = values[parseInt(index, 10) + 1];
                    return toString(value, placeholderFormat ? placeholderFormat.substring(1) : '');
                });
            };
            kendo._extractFormat = function (format) {
                if (format.slice(0, 3) === '{0:') {
                    format = format.slice(3, format.length - 1);
                }
                return format;
            };
            kendo._activeElement = function () {
                try {
                    return document.activeElement;
                } catch (e) {
                    return document.documentElement.activeElement;
                }
            };
            kendo._round = round;
            kendo.toString = toString;
        }());
        (function () {
            var nonBreakingSpaceRegExp = /\u00A0/g, exponentRegExp = /[eE][\-+]?[0-9]+/, shortTimeZoneRegExp = /[+|\-]\d{1,2}/, longTimeZoneRegExp = /[+|\-]\d{1,2}:?\d{2}/, dateRegExp = /^\/Date\((.*?)\)\/$/, offsetRegExp = /[+-]\d*/, formatsSequence = [
                'G',
                'g',
                'd',
                'F',
                'D',
                'y',
                'm',
                'T',
                't'
            ], numberRegExp = {
                2: /^\d{1,2}/,
                3: /^\d{1,3}/,
                4: /^\d{4}/
            }, objectToString = {}.toString;
            function outOfRange(value, start, end) {
                return !(value >= start && value <= end);
            }
            function designatorPredicate(designator) {
                return designator.charAt(0);
            }
            function mapDesignators(designators) {
                return $.map(designators, designatorPredicate);
            }
            function adjustDST(date, hours) {
                if (!hours && date.getHours() === 23) {
                    date.setHours(date.getHours() + 2);
                }
            }
            function lowerArray(data) {
                var idx = 0, length = data.length, array = [];
                for (; idx < length; idx++) {
                    array[idx] = (data[idx] + '').toLowerCase();
                }
                return array;
            }
            function lowerLocalInfo(localInfo) {
                var newLocalInfo = {}, property;
                for (property in localInfo) {
                    newLocalInfo[property] = lowerArray(localInfo[property]);
                }
                return newLocalInfo;
            }
            function parseExact(value, format, culture) {
                if (!value) {
                    return null;
                }
                var lookAhead = function (match) {
                    var i = 0;
                    while (format[idx] === match) {
                        i++;
                        idx++;
                    }
                    if (i > 0) {
                        idx -= 1;
                    }
                    return i;
                }, getNumber = function (size) {
                    var rg = numberRegExp[size] || new RegExp('^\\d{1,' + size + '}'), match = value.substr(valueIdx, size).match(rg);
                    if (match) {
                        match = match[0];
                        valueIdx += match.length;
                        return parseInt(match, 10);
                    }
                    return null;
                }, getIndexByName = function (names, lower) {
                    var i = 0, length = names.length, name, nameLength, matchLength = 0, matchIdx = 0, subValue;
                    for (; i < length; i++) {
                        name = names[i];
                        nameLength = name.length;
                        subValue = value.substr(valueIdx, nameLength);
                        if (lower) {
                            subValue = subValue.toLowerCase();
                        }
                        if (subValue == name && nameLength > matchLength) {
                            matchLength = nameLength;
                            matchIdx = i;
                        }
                    }
                    if (matchLength) {
                        valueIdx += matchLength;
                        return matchIdx + 1;
                    }
                    return null;
                }, checkLiteral = function () {
                    var result = false;
                    if (value.charAt(valueIdx) === format[idx]) {
                        valueIdx++;
                        result = true;
                    }
                    return result;
                }, calendar = culture.calendars.standard, year = null, month = null, day = null, hours = null, minutes = null, seconds = null, milliseconds = null, idx = 0, valueIdx = 0, literal = false, date = new Date(), twoDigitYearMax = calendar.twoDigitYearMax || 2029, defaultYear = date.getFullYear(), ch, count, length, pattern, pmHour, UTC, matches, amDesignators, pmDesignators, hoursOffset, minutesOffset, hasTime, match;
                if (!format) {
                    format = 'd';
                }
                pattern = calendar.patterns[format];
                if (pattern) {
                    format = pattern;
                }
                format = format.split('');
                length = format.length;
                for (; idx < length; idx++) {
                    ch = format[idx];
                    if (literal) {
                        if (ch === '\'') {
                            literal = false;
                        } else {
                            checkLiteral();
                        }
                    } else {
                        if (ch === 'd') {
                            count = lookAhead('d');
                            if (!calendar._lowerDays) {
                                calendar._lowerDays = lowerLocalInfo(calendar.days);
                            }
                            if (day !== null && count > 2) {
                                continue;
                            }
                            day = count < 3 ? getNumber(2) : getIndexByName(calendar._lowerDays[count == 3 ? 'namesAbbr' : 'names'], true);
                            if (day === null || outOfRange(day, 1, 31)) {
                                return null;
                            }
                        } else if (ch === 'M') {
                            count = lookAhead('M');
                            if (!calendar._lowerMonths) {
                                calendar._lowerMonths = lowerLocalInfo(calendar.months);
                            }
                            month = count < 3 ? getNumber(2) : getIndexByName(calendar._lowerMonths[count == 3 ? 'namesAbbr' : 'names'], true);
                            if (month === null || outOfRange(month, 1, 12)) {
                                return null;
                            }
                            month -= 1;
                        } else if (ch === 'y') {
                            count = lookAhead('y');
                            year = getNumber(count);
                            if (year === null) {
                                return null;
                            }
                            if (count == 2) {
                                if (typeof twoDigitYearMax === 'string') {
                                    twoDigitYearMax = defaultYear + parseInt(twoDigitYearMax, 10);
                                }
                                year = defaultYear - defaultYear % 100 + year;
                                if (year > twoDigitYearMax) {
                                    year -= 100;
                                }
                            }
                        } else if (ch === 'h') {
                            lookAhead('h');
                            hours = getNumber(2);
                            if (hours == 12) {
                                hours = 0;
                            }
                            if (hours === null || outOfRange(hours, 0, 11)) {
                                return null;
                            }
                        } else if (ch === 'H') {
                            lookAhead('H');
                            hours = getNumber(2);
                            if (hours === null || outOfRange(hours, 0, 23)) {
                                return null;
                            }
                        } else if (ch === 'm') {
                            lookAhead('m');
                            minutes = getNumber(2);
                            if (minutes === null || outOfRange(minutes, 0, 59)) {
                                return null;
                            }
                        } else if (ch === 's') {
                            lookAhead('s');
                            seconds = getNumber(2);
                            if (seconds === null || outOfRange(seconds, 0, 59)) {
                                return null;
                            }
                        } else if (ch === 'f') {
                            count = lookAhead('f');
                            match = value.substr(valueIdx, count).match(numberRegExp[3]);
                            milliseconds = getNumber(count);
                            if (milliseconds !== null) {
                                milliseconds = parseFloat('0.' + match[0], 10);
                                milliseconds = kendo._round(milliseconds, 3);
                                milliseconds *= 1000;
                            }
                            if (milliseconds === null || outOfRange(milliseconds, 0, 999)) {
                                return null;
                            }
                        } else if (ch === 't') {
                            count = lookAhead('t');
                            amDesignators = calendar.AM;
                            pmDesignators = calendar.PM;
                            if (count === 1) {
                                amDesignators = mapDesignators(amDesignators);
                                pmDesignators = mapDesignators(pmDesignators);
                            }
                            pmHour = getIndexByName(pmDesignators);
                            if (!pmHour && !getIndexByName(amDesignators)) {
                                return null;
                            }
                        } else if (ch === 'z') {
                            UTC = true;
                            count = lookAhead('z');
                            if (value.substr(valueIdx, 1) === 'Z') {
                                checkLiteral();
                                continue;
                            }
                            matches = value.substr(valueIdx, 6).match(count > 2 ? longTimeZoneRegExp : shortTimeZoneRegExp);
                            if (!matches) {
                                return null;
                            }
                            matches = matches[0].split(':');
                            hoursOffset = matches[0];
                            minutesOffset = matches[1];
                            if (!minutesOffset && hoursOffset.length > 3) {
                                valueIdx = hoursOffset.length - 2;
                                minutesOffset = hoursOffset.substring(valueIdx);
                                hoursOffset = hoursOffset.substring(0, valueIdx);
                            }
                            hoursOffset = parseInt(hoursOffset, 10);
                            if (outOfRange(hoursOffset, -12, 13)) {
                                return null;
                            }
                            if (count > 2) {
                                minutesOffset = parseInt(minutesOffset, 10);
                                if (isNaN(minutesOffset) || outOfRange(minutesOffset, 0, 59)) {
                                    return null;
                                }
                            }
                        } else if (ch === '\'') {
                            literal = true;
                            checkLiteral();
                        } else if (!checkLiteral()) {
                            return null;
                        }
                    }
                }
                hasTime = hours !== null || minutes !== null || seconds || null;
                if (year === null && month === null && day === null && hasTime) {
                    year = defaultYear;
                    month = date.getMonth();
                    day = date.getDate();
                } else {
                    if (year === null) {
                        year = defaultYear;
                    }
                    if (day === null) {
                        day = 1;
                    }
                }
                if (pmHour && hours < 12) {
                    hours += 12;
                }
                if (UTC) {
                    if (hoursOffset) {
                        hours += -hoursOffset;
                    }
                    if (minutesOffset) {
                        minutes += -minutesOffset;
                    }
                    value = new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds));
                } else {
                    value = new Date(year, month, day, hours, minutes, seconds, milliseconds);
                    adjustDST(value, hours);
                }
                if (year < 100) {
                    value.setFullYear(year);
                }
                if (value.getDate() !== day && UTC === undefined) {
                    return null;
                }
                return value;
            }
            function parseMicrosoftFormatOffset(offset) {
                var sign = offset.substr(0, 1) === '-' ? -1 : 1;
                offset = offset.substring(1);
                offset = parseInt(offset.substr(0, 2), 10) * 60 + parseInt(offset.substring(2), 10);
                return sign * offset;
            }
            kendo.parseDate = function (value, formats, culture) {
                if (objectToString.call(value) === '[object Date]') {
                    return value;
                }
                var idx = 0;
                var date = null;
                var length, patterns;
                var tzoffset;
                if (value && value.indexOf('/D') === 0) {
                    date = dateRegExp.exec(value);
                    if (date) {
                        date = date[1];
                        tzoffset = offsetRegExp.exec(date.substring(1));
                        date = new Date(parseInt(date, 10));
                        if (tzoffset) {
                            tzoffset = parseMicrosoftFormatOffset(tzoffset[0]);
                            date = kendo.timezone.apply(date, 0);
                            date = kendo.timezone.convert(date, 0, -1 * tzoffset);
                        }
                        return date;
                    }
                }
                culture = kendo.getCulture(culture);
                if (!formats) {
                    formats = [];
                    patterns = culture.calendar.patterns;
                    length = formatsSequence.length;
                    for (; idx < length; idx++) {
                        formats[idx] = patterns[formatsSequence[idx]];
                    }
                    idx = 0;
                    formats = [
                        'yyyy/MM/dd HH:mm:ss',
                        'yyyy/MM/dd HH:mm',
                        'yyyy/MM/dd',
                        'ddd MMM dd yyyy HH:mm:ss',
                        'yyyy-MM-ddTHH:mm:ss.fffffffzzz',
                        'yyyy-MM-ddTHH:mm:ss.fffzzz',
                        'yyyy-MM-ddTHH:mm:sszzz',
                        'yyyy-MM-ddTHH:mm:ss.fffffff',
                        'yyyy-MM-ddTHH:mm:ss.fff',
                        'yyyy-MM-ddTHH:mmzzz',
                        'yyyy-MM-ddTHH:mmzz',
                        'yyyy-MM-ddTHH:mm:ss',
                        'yyyy-MM-ddTHH:mm',
                        'yyyy-MM-dd HH:mm:ss',
                        'yyyy-MM-dd HH:mm',
                        'yyyy-MM-dd',
                        'HH:mm:ss',
                        'HH:mm'
                    ].concat(formats);
                }
                formats = isArray(formats) ? formats : [formats];
                length = formats.length;
                for (; idx < length; idx++) {
                    date = parseExact(value, formats[idx], culture);
                    if (date) {
                        return date;
                    }
                }
                return date;
            };
            kendo.parseInt = function (value, culture) {
                var result = kendo.parseFloat(value, culture);
                if (result) {
                    result = result | 0;
                }
                return result;
            };
            kendo.parseFloat = function (value, culture, format) {
                if (!value && value !== 0) {
                    return null;
                }
                if (typeof value === NUMBER) {
                    return value;
                }
                value = value.toString();
                culture = kendo.getCulture(culture);
                var number = culture.numberFormat, percent = number.percent, currency = number.currency, symbol = currency.symbol, percentSymbol = percent.symbol, negative = value.indexOf('-'), parts, isPercent;
                if (exponentRegExp.test(value)) {
                    value = parseFloat(value.replace(number['.'], '.'));
                    if (isNaN(value)) {
                        value = null;
                    }
                    return value;
                }
                if (negative > 0) {
                    return null;
                } else {
                    negative = negative > -1;
                }
                if (value.indexOf(symbol) > -1 || format && format.toLowerCase().indexOf('c') > -1) {
                    number = currency;
                    parts = number.pattern[0].replace('$', symbol).split('n');
                    if (value.indexOf(parts[0]) > -1 && value.indexOf(parts[1]) > -1) {
                        value = value.replace(parts[0], '').replace(parts[1], '');
                        negative = true;
                    }
                } else if (value.indexOf(percentSymbol) > -1) {
                    isPercent = true;
                    number = percent;
                    symbol = percentSymbol;
                }
                value = value.replace('-', '').replace(symbol, '').replace(nonBreakingSpaceRegExp, ' ').split(number[','].replace(nonBreakingSpaceRegExp, ' ')).join('').replace(number['.'], '.');
                value = parseFloat(value);
                if (isNaN(value)) {
                    value = null;
                } else if (negative) {
                    value *= -1;
                }
                if (value && isPercent) {
                    value /= 100;
                }
                return value;
            };
        }());
        function getShadows(element) {
            var shadow = element.css(kendo.support.transitions.css + 'box-shadow') || element.css('box-shadow'), radius = shadow ? shadow.match(boxShadowRegExp) || [
                0,
                0,
                0,
                0,
                0
            ] : [
                    0,
                    0,
                    0,
                    0,
                    0
                ], blur = math.max(+radius[3], +(radius[4] || 0));
            return {
                left: -radius[1] + blur,
                right: +radius[1] + blur,
                bottom: +radius[2] + blur
            };
        }
        function wrap(element, autosize) {
            var browser = support.browser, percentage, isRtl = element.css('direction') == 'rtl';
            if (!element.parent().hasClass('k-animation-container')) {
                var shadows = getShadows(element), width = element[0].style.width, height = element[0].style.height, percentWidth = percentRegExp.test(width), percentHeight = percentRegExp.test(height);
                if (browser.opera) {
                    shadows.left = shadows.right = shadows.bottom = 5;
                }
                percentage = percentWidth || percentHeight;
                if (!percentWidth && (!autosize || autosize && width)) {
                    width = element.outerWidth();
                }
                if (!percentHeight && (!autosize || autosize && height)) {
                    height = element.outerHeight();
                }
                element.wrap($('<div/>').addClass('k-animation-container').css({
                    width: width,
                    height: height,
                    marginLeft: shadows.left * (isRtl ? 1 : -1),
                    paddingLeft: shadows.left,
                    paddingRight: shadows.right,
                    paddingBottom: shadows.bottom
                }));
                if (percentage) {
                    element.css({
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                        mozBoxSizing: 'border-box',
                        webkitBoxSizing: 'border-box'
                    });
                }
            } else {
                var wrapper = element.parent('.k-animation-container'), wrapperStyle = wrapper[0].style;
                if (wrapper.is(':hidden')) {
                    wrapper.show();
                }
                percentage = percentRegExp.test(wrapperStyle.width) || percentRegExp.test(wrapperStyle.height);
                if (!percentage) {
                    wrapper.css({
                        width: element.outerWidth(),
                        height: element.outerHeight(),
                        boxSizing: 'content-box',
                        mozBoxSizing: 'content-box',
                        webkitBoxSizing: 'content-box'
                    });
                }
            }
            if (browser.msie && math.floor(browser.version) <= 7) {
                element.css({ zoom: 1 });
                element.children('.k-menu').width(element.width());
            }
            return element.parent();
        }
        function deepExtend(destination) {
            var i = 1, length = arguments.length;
            for (i = 1; i < length; i++) {
                deepExtendOne(destination, arguments[i]);
            }
            return destination;
        }
        function deepExtendOne(destination, source) {
            var ObservableArray = kendo.data.ObservableArray, LazyObservableArray = kendo.data.LazyObservableArray, DataSource = kendo.data.DataSource, HierarchicalDataSource = kendo.data.HierarchicalDataSource, property, propValue, propType, propInit, destProp;
            for (property in source) {
                propValue = source[property];
                propType = typeof propValue;
                if (propType === OBJECT && propValue !== null) {
                    propInit = propValue.constructor;
                } else {
                    propInit = null;
                }
                if (propInit && propInit !== Array && propInit !== ObservableArray && propInit !== LazyObservableArray && propInit !== DataSource && propInit !== HierarchicalDataSource) {
                    if (propValue instanceof Date) {
                        destination[property] = new Date(propValue.getTime());
                    } else if (isFunction(propValue.clone)) {
                        destination[property] = propValue.clone();
                    } else {
                        destProp = destination[property];
                        if (typeof destProp === OBJECT) {
                            destination[property] = destProp || {};
                        } else {
                            destination[property] = {};
                        }
                        deepExtendOne(destination[property], propValue);
                    }
                } else if (propType !== UNDEFINED) {
                    destination[property] = propValue;
                }
            }
            return destination;
        }
        function testRx(agent, rxs, dflt) {
            for (var rx in rxs) {
                if (rxs.hasOwnProperty(rx) && rxs[rx].test(agent)) {
                    return rx;
                }
            }
            return dflt !== undefined ? dflt : agent;
        }
        function toHyphens(str) {
            return str.replace(/([a-z][A-Z])/g, function (g) {
                return g.charAt(0) + '-' + g.charAt(1).toLowerCase();
            });
        }
        function toCamelCase(str) {
            return str.replace(/\-(\w)/g, function (strMatch, g1) {
                return g1.toUpperCase();
            });
        }
        function getComputedStyles(element, properties) {
            var styles = {}, computedStyle;
            if (document.defaultView && document.defaultView.getComputedStyle) {
                computedStyle = document.defaultView.getComputedStyle(element, '');
                if (properties) {
                    $.each(properties, function (idx, value) {
                        styles[value] = computedStyle.getPropertyValue(value);
                    });
                }
            } else {
                computedStyle = element.currentStyle;
                if (properties) {
                    $.each(properties, function (idx, value) {
                        styles[value] = computedStyle[toCamelCase(value)];
                    });
                }
            }
            if (!kendo.size(styles)) {
                styles = computedStyle;
            }
            return styles;
        }
        function isScrollable(element) {
            if (element && element.className && typeof element.className === 'string' && element.className.indexOf('k-auto-scrollable') > -1) {
                return true;
            }
            var overflow = getComputedStyles(element, ['overflow']).overflow;
            return overflow == 'auto' || overflow == 'scroll';
        }
        function scrollLeft(element, value) {
            var webkit = support.browser.webkit;
            var mozila = support.browser.mozilla;
            var el = element instanceof $ ? element[0] : element;
            var isRtl;
            if (!element) {
                return;
            }
            isRtl = support.isRtl(element);
            if (value !== undefined) {
                if (isRtl && webkit) {
                    el.scrollLeft = el.scrollWidth - el.clientWidth - value;
                } else if (isRtl && mozila) {
                    el.scrollLeft = -value;
                } else {
                    el.scrollLeft = value;
                }
            } else {
                if (isRtl && webkit) {
                    return el.scrollWidth - el.clientWidth - el.scrollLeft;
                } else {
                    return Math.abs(el.scrollLeft);
                }
            }
        }
        (function () {
            support._scrollbar = undefined;
            support.scrollbar = function (refresh) {
                if (!isNaN(support._scrollbar) && !refresh) {
                    return support._scrollbar;
                } else {
                    var div = document.createElement('div'), result;
                    div.style.cssText = 'overflow:scroll;overflow-x:hidden;zoom:1;clear:both;display:block';
                    div.innerHTML = '&nbsp;';
                    document.body.appendChild(div);
                    support._scrollbar = result = div.offsetWidth - div.scrollWidth;
                    document.body.removeChild(div);
                    return result;
                }
            };
            support.isRtl = function (element) {
                return $(element).closest('.k-rtl').length > 0;
            };
            var table = document.createElement('table');
            try {
                table.innerHTML = '<tr><td></td></tr>';
                support.tbodyInnerHtml = true;
            } catch (e) {
                support.tbodyInnerHtml = false;
            }
            support.touch = 'ontouchstart' in window;
            support.msPointers = window.MSPointerEvent;
            support.pointers = window.PointerEvent;
            var transitions = support.transitions = false, transforms = support.transforms = false, elementProto = 'HTMLElement' in window ? HTMLElement.prototype : [];
            support.hasHW3D = 'WebKitCSSMatrix' in window && 'm11' in new window.WebKitCSSMatrix() || 'MozPerspective' in document.documentElement.style || 'msPerspective' in document.documentElement.style;
            each([
                'Moz',
                'webkit',
                'O',
                'ms'
            ], function () {
                var prefix = this.toString(), hasTransitions = typeof table.style[prefix + 'Transition'] === STRING;
                if (hasTransitions || typeof table.style[prefix + 'Transform'] === STRING) {
                    var lowPrefix = prefix.toLowerCase();
                    transforms = {
                        css: lowPrefix != 'ms' ? '-' + lowPrefix + '-' : '',
                        prefix: prefix,
                        event: lowPrefix === 'o' || lowPrefix === 'webkit' ? lowPrefix : ''
                    };
                    if (hasTransitions) {
                        transitions = transforms;
                        transitions.event = transitions.event ? transitions.event + 'TransitionEnd' : 'transitionend';
                    }
                    return false;
                }
            });
            table = null;
            support.transforms = transforms;
            support.transitions = transitions;
            support.devicePixelRatio = window.devicePixelRatio === undefined ? 1 : window.devicePixelRatio;
            try {
                support.screenWidth = window.outerWidth || window.screen ? window.screen.availWidth : window.innerWidth;
                support.screenHeight = window.outerHeight || window.screen ? window.screen.availHeight : window.innerHeight;
            } catch (e) {
                support.screenWidth = window.screen.availWidth;
                support.screenHeight = window.screen.availHeight;
            }
            support.detectOS = function (ua) {
                var os = false, minorVersion, match = [], notAndroidPhone = !/mobile safari/i.test(ua), agentRxs = {
                    wp: /(Windows Phone(?: OS)?)\s(\d+)\.(\d+(\.\d+)?)/,
                    fire: /(Silk)\/(\d+)\.(\d+(\.\d+)?)/,
                    android: /(Android|Android.*(?:Opera|Firefox).*?\/)\s*(\d+)\.(\d+(\.\d+)?)/,
                    iphone: /(iPhone|iPod).*OS\s+(\d+)[\._]([\d\._]+)/,
                    ipad: /(iPad).*OS\s+(\d+)[\._]([\d_]+)/,
                    meego: /(MeeGo).+NokiaBrowser\/(\d+)\.([\d\._]+)/,
                    webos: /(webOS)\/(\d+)\.(\d+(\.\d+)?)/,
                    blackberry: /(BlackBerry|BB10).*?Version\/(\d+)\.(\d+(\.\d+)?)/,
                    playbook: /(PlayBook).*?Tablet\s*OS\s*(\d+)\.(\d+(\.\d+)?)/,
                    windows: /(MSIE)\s+(\d+)\.(\d+(\.\d+)?)/,
                    tizen: /(tizen).*?Version\/(\d+)\.(\d+(\.\d+)?)/i,
                    sailfish: /(sailfish).*rv:(\d+)\.(\d+(\.\d+)?).*firefox/i,
                    ffos: /(Mobile).*rv:(\d+)\.(\d+(\.\d+)?).*Firefox/
                }, osRxs = {
                    ios: /^i(phone|pad|pod)$/i,
                    android: /^android|fire$/i,
                    blackberry: /^blackberry|playbook/i,
                    windows: /windows/,
                    wp: /wp/,
                    flat: /sailfish|ffos|tizen/i,
                    meego: /meego/
                }, formFactorRxs = { tablet: /playbook|ipad|fire/i }, browserRxs = {
                    omini: /Opera\sMini/i,
                    omobile: /Opera\sMobi/i,
                    firefox: /Firefox|Fennec/i,
                    mobilesafari: /version\/.*safari/i,
                    ie: /MSIE|Windows\sPhone/i,
                    chrome: /chrome|crios/i,
                    webkit: /webkit/i
                };
                for (var agent in agentRxs) {
                    if (agentRxs.hasOwnProperty(agent)) {
                        match = ua.match(agentRxs[agent]);
                        if (match) {
                            if (agent == 'windows' && 'plugins' in navigator) {
                                return false;
                            }
                            os = {};
                            os.device = agent;
                            os.tablet = testRx(agent, formFactorRxs, false);
                            os.browser = testRx(ua, browserRxs, 'default');
                            os.name = testRx(agent, osRxs);
                            os[os.name] = true;
                            os.majorVersion = match[2];
                            os.minorVersion = match[3].replace('_', '.');
                            minorVersion = os.minorVersion.replace('.', '').substr(0, 2);
                            os.flatVersion = os.majorVersion + minorVersion + new Array(3 - (minorVersion.length < 3 ? minorVersion.length : 2)).join('0');
                            os.cordova = typeof window.PhoneGap !== UNDEFINED || typeof window.cordova !== UNDEFINED;
                            os.appMode = window.navigator.standalone || /file|local|wmapp/.test(window.location.protocol) || os.cordova;
                            if (os.android && (support.devicePixelRatio < 1.5 && os.flatVersion < 400 || notAndroidPhone) && (support.screenWidth > 800 || support.screenHeight > 800)) {
                                os.tablet = agent;
                            }
                            break;
                        }
                    }
                }
                return os;
            };
            var mobileOS = support.mobileOS = support.detectOS(navigator.userAgent);
            support.wpDevicePixelRatio = mobileOS.wp ? screen.width / 320 : 0;
            support.kineticScrollNeeded = mobileOS && (support.touch || support.msPointers || support.pointers);
            support.hasNativeScrolling = false;
            if (mobileOS.ios || mobileOS.android && mobileOS.majorVersion > 2 || mobileOS.wp) {
                support.hasNativeScrolling = mobileOS;
            }
            support.delayedClick = function () {
                if (support.touch) {
                    if (mobileOS.ios) {
                        return true;
                    }
                    if (mobileOS.android) {
                        if (!support.browser.chrome) {
                            return true;
                        }
                        if (support.browser.version < 32) {
                            return false;
                        }
                        return !($('meta[name=viewport]').attr('content') || '').match(/user-scalable=no/i);
                    }
                }
                return false;
            };
            support.mouseAndTouchPresent = support.touch && !(support.mobileOS.ios || support.mobileOS.android);
            support.detectBrowser = function (ua) {
                var browser = false, match = [], browserRxs = {
                    edge: /(edge)[ \/]([\w.]+)/i,
                    webkit: /(chrome)[ \/]([\w.]+)/i,
                    safari: /(webkit)[ \/]([\w.]+)/i,
                    opera: /(opera)(?:.*version|)[ \/]([\w.]+)/i,
                    msie: /(msie\s|trident.*? rv:)([\w.]+)/i,
                    mozilla: /(mozilla)(?:.*? rv:([\w.]+)|)/i
                };
                for (var agent in browserRxs) {
                    if (browserRxs.hasOwnProperty(agent)) {
                        match = ua.match(browserRxs[agent]);
                        if (match) {
                            browser = {};
                            browser[agent] = true;
                            browser[match[1].toLowerCase().split(' ')[0].split('/')[0]] = true;
                            browser.version = parseInt(document.documentMode || match[2], 10);
                            break;
                        }
                    }
                }
                return browser;
            };
            support.browser = support.detectBrowser(navigator.userAgent);
            support.detectClipboardAccess = function () {
                var commands = {
                    copy: document.queryCommandSupported ? document.queryCommandSupported('copy') : false,
                    cut: document.queryCommandSupported ? document.queryCommandSupported('cut') : false,
                    paste: document.queryCommandSupported ? document.queryCommandSupported('paste') : false
                };
                if (support.browser.chrome) {
                    commands.paste = false;
                    if (support.browser.version >= 43) {
                        commands.copy = true;
                        commands.cut = true;
                    }
                }
                return commands;
            };
            support.clipboard = support.detectClipboardAccess();
            support.zoomLevel = function () {
                try {
                    var browser = support.browser;
                    var ie11WidthCorrection = 0;
                    var docEl = document.documentElement;
                    if (browser.msie && browser.version == 11 && docEl.scrollHeight > docEl.clientHeight && !support.touch) {
                        ie11WidthCorrection = support.scrollbar();
                    }
                    return support.touch ? docEl.clientWidth / window.innerWidth : browser.msie && browser.version >= 10 ? ((top || window).document.documentElement.offsetWidth + ie11WidthCorrection) / (top || window).innerWidth : 1;
                } catch (e) {
                    return 1;
                }
            };
            support.cssBorderSpacing = typeof document.documentElement.style.borderSpacing != 'undefined' && !(support.browser.msie && support.browser.version < 8);
            (function (browser) {
                var cssClass = '', docElement = $(document.documentElement), majorVersion = parseInt(browser.version, 10);
                if (browser.msie) {
                    cssClass = 'ie';
                } else if (browser.mozilla) {
                    cssClass = 'ff';
                } else if (browser.safari) {
                    cssClass = 'safari';
                } else if (browser.webkit) {
                    cssClass = 'webkit';
                } else if (browser.opera) {
                    cssClass = 'opera';
                } else if (browser.edge) {
                    cssClass = 'edge';
                }
                if (cssClass) {
                    cssClass = 'k-' + cssClass + ' k-' + cssClass + majorVersion;
                }
                if (support.mobileOS) {
                    cssClass += ' k-mobile';
                }
                docElement.addClass(cssClass);
            }(support.browser));
            support.eventCapture = document.documentElement.addEventListener;
            var input = document.createElement('input');
            support.placeholder = 'placeholder' in input;
            support.propertyChangeEvent = 'onpropertychange' in input;
            support.input = function () {
                var types = [
                    'number',
                    'date',
                    'time',
                    'month',
                    'week',
                    'datetime',
                    'datetime-local'
                ];
                var length = types.length;
                var value = 'test';
                var result = {};
                var idx = 0;
                var type;
                for (; idx < length; idx++) {
                    type = types[idx];
                    input.setAttribute('type', type);
                    input.value = value;
                    result[type.replace('-', '')] = input.type !== 'text' && input.value !== value;
                }
                return result;
            }();
            input.style.cssText = 'float:left;';
            support.cssFloat = !!input.style.cssFloat;
            input = null;
            support.stableSort = function () {
                var threshold = 513;
                var sorted = [{
                    index: 0,
                    field: 'b'
                }];
                for (var i = 1; i < threshold; i++) {
                    sorted.push({
                        index: i,
                        field: 'a'
                    });
                }
                sorted.sort(function (a, b) {
                    return a.field > b.field ? 1 : a.field < b.field ? -1 : 0;
                });
                return sorted[0].index === 1;
            }();
            support.matchesSelector = elementProto.webkitMatchesSelector || elementProto.mozMatchesSelector || elementProto.msMatchesSelector || elementProto.oMatchesSelector || elementProto.matchesSelector || elementProto.matches || function (selector) {
                var nodeList = document.querySelectorAll ? (this.parentNode || document).querySelectorAll(selector) || [] : $(selector), i = nodeList.length;
                while (i--) {
                    if (nodeList[i] == this) {
                        return true;
                    }
                }
                return false;
            };
            support.pushState = window.history && window.history.pushState;
            var documentMode = document.documentMode;
            support.hashChange = 'onhashchange' in window && !(support.browser.msie && (!documentMode || documentMode <= 8));
            support.customElements = 'registerElement' in window.document;
        }());
        function size(obj) {
            var result = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key) && key != 'toJSON') {
                    result++;
                }
            }
            return result;
        }
        function getOffset(element, type, positioned) {
            if (!type) {
                type = 'offset';
            }
            var result = element[type]();
            if (support.browser.msie && (support.pointers || support.msPointers) && !positioned) {
                result.top -= window.pageYOffset - document.documentElement.scrollTop;
                result.left -= window.pageXOffset - document.documentElement.scrollLeft;
            }
            return result;
        }
        var directions = {
            left: { reverse: 'right' },
            right: { reverse: 'left' },
            down: { reverse: 'up' },
            up: { reverse: 'down' },
            top: { reverse: 'bottom' },
            bottom: { reverse: 'top' },
            'in': { reverse: 'out' },
            out: { reverse: 'in' }
        };
        function parseEffects(input) {
            var effects = {};
            each(typeof input === 'string' ? input.split(' ') : input, function (idx) {
                effects[idx] = this;
            });
            return effects;
        }
        function fx(element) {
            return new kendo.effects.Element(element);
        }
        var effects = {};
        $.extend(effects, {
            enabled: true,
            Element: function (element) {
                this.element = $(element);
            },
            promise: function (element, options) {
                if (!element.is(':visible')) {
                    element.css({ display: element.data('olddisplay') || 'block' }).css('display');
                }
                if (options.hide) {
                    element.data('olddisplay', element.css('display')).hide();
                }
                if (options.init) {
                    options.init();
                }
                if (options.completeCallback) {
                    options.completeCallback(element);
                }
                element.dequeue();
            },
            disable: function () {
                this.enabled = false;
                this.promise = this.promiseShim;
            },
            enable: function () {
                this.enabled = true;
                this.promise = this.animatedPromise;
            }
        });
        effects.promiseShim = effects.promise;
        function prepareAnimationOptions(options, duration, reverse, complete) {
            if (typeof options === STRING) {
                if (isFunction(duration)) {
                    complete = duration;
                    duration = 400;
                    reverse = false;
                }
                if (isFunction(reverse)) {
                    complete = reverse;
                    reverse = false;
                }
                if (typeof duration === BOOLEAN) {
                    reverse = duration;
                    duration = 400;
                }
                options = {
                    effects: options,
                    duration: duration,
                    reverse: reverse,
                    complete: complete
                };
            }
            return extend({
                effects: {},
                duration: 400,
                reverse: false,
                init: noop,
                teardown: noop,
                hide: false
            }, options, {
                    completeCallback: options.complete,
                    complete: noop
                });
        }
        function animate(element, options, duration, reverse, complete) {
            var idx = 0, length = element.length, instance;
            for (; idx < length; idx++) {
                instance = $(element[idx]);
                instance.queue(function () {
                    effects.promise(instance, prepareAnimationOptions(options, duration, reverse, complete));
                });
            }
            return element;
        }
        function toggleClass(element, classes, options, add) {
            if (classes) {
                classes = classes.split(' ');
                each(classes, function (idx, value) {
                    element.toggleClass(value, add);
                });
            }
            return element;
        }
        if (!('kendoAnimate' in $.fn)) {
            extend($.fn, {
                kendoStop: function (clearQueue, gotoEnd) {
                    return this.stop(clearQueue, gotoEnd);
                },
                kendoAnimate: function (options, duration, reverse, complete) {
                    return animate(this, options, duration, reverse, complete);
                },
                kendoAddClass: function (classes, options) {
                    return kendo.toggleClass(this, classes, options, true);
                },
                kendoRemoveClass: function (classes, options) {
                    return kendo.toggleClass(this, classes, options, false);
                },
                kendoToggleClass: function (classes, options, toggle) {
                    return kendo.toggleClass(this, classes, options, toggle);
                }
            });
        }
        var ampRegExp = /&/g, ltRegExp = /</g, quoteRegExp = /"/g, aposRegExp = /'/g, gtRegExp = />/g;
        function htmlEncode(value) {
            return ('' + value).replace(ampRegExp, '&amp;').replace(ltRegExp, '&lt;').replace(gtRegExp, '&gt;').replace(quoteRegExp, '&quot;').replace(aposRegExp, '&#39;');
        }
        var eventTarget = function (e) {
            return e.target;
        };
        if (support.touch) {
            eventTarget = function (e) {
                var touches = 'originalEvent' in e ? e.originalEvent.changedTouches : 'changedTouches' in e ? e.changedTouches : null;
                return touches ? document.elementFromPoint(touches[0].clientX, touches[0].clientY) : e.target;
            };
            each([
                'swipe',
                'swipeLeft',
                'swipeRight',
                'swipeUp',
                'swipeDown',
                'doubleTap',
                'tap'
            ], function (m, value) {
                $.fn[value] = function (callback) {
                    return this.bind(value, callback);
                };
            });
        }
        if (support.touch) {
            if (!support.mobileOS) {
                support.mousedown = 'mousedown touchstart';
                support.mouseup = 'mouseup touchend';
                support.mousemove = 'mousemove touchmove';
                support.mousecancel = 'mouseleave touchcancel';
                support.click = 'click';
                support.resize = 'resize';
            } else {
                support.mousedown = 'touchstart';
                support.mouseup = 'touchend';
                support.mousemove = 'touchmove';
                support.mousecancel = 'touchcancel';
                support.click = 'touchend';
                support.resize = 'orientationchange';
            }
        } else if (support.pointers) {
            support.mousemove = 'pointermove';
            support.mousedown = 'pointerdown';
            support.mouseup = 'pointerup';
            support.mousecancel = 'pointercancel';
            support.click = 'pointerup';
            support.resize = 'orientationchange resize';
        } else if (support.msPointers) {
            support.mousemove = 'MSPointerMove';
            support.mousedown = 'MSPointerDown';
            support.mouseup = 'MSPointerUp';
            support.mousecancel = 'MSPointerCancel';
            support.click = 'MSPointerUp';
            support.resize = 'orientationchange resize';
        } else {
            support.mousemove = 'mousemove';
            support.mousedown = 'mousedown';
            support.mouseup = 'mouseup';
            support.mousecancel = 'mouseleave';
            support.click = 'click';
            support.resize = 'resize';
        }
        var wrapExpression = function (members, paramName) {
            var result = paramName || 'd', index, idx, length, member, count = 1;
            for (idx = 0, length = members.length; idx < length; idx++) {
                member = members[idx];
                if (member !== '') {
                    index = member.indexOf('[');
                    if (index !== 0) {
                        if (index == -1) {
                            member = '.' + member;
                        } else {
                            count++;
                            member = '.' + member.substring(0, index) + ' || {})' + member.substring(index);
                        }
                    }
                    count++;
                    result += member + (idx < length - 1 ? ' || {})' : ')');
                }
            }
            return new Array(count).join('(') + result;
        }, localUrlRe = /^([a-z]+:)?\/\//i;
        extend(kendo, {
            widgets: [],
            _widgetRegisteredCallbacks: [],
            ui: kendo.ui || {},
            fx: kendo.fx || fx,
            effects: kendo.effects || effects,
            mobile: kendo.mobile || {},
            data: kendo.data || {},
            dataviz: kendo.dataviz || {},
            drawing: kendo.drawing || {},
            spreadsheet: { messages: {} },
            keys: {
                INSERT: 45,
                DELETE: 46,
                BACKSPACE: 8,
                TAB: 9,
                ENTER: 13,
                ESC: 27,
                LEFT: 37,
                UP: 38,
                RIGHT: 39,
                DOWN: 40,
                END: 35,
                HOME: 36,
                SPACEBAR: 32,
                PAGEUP: 33,
                PAGEDOWN: 34,
                F2: 113,
                F10: 121,
                F12: 123,
                NUMPAD_PLUS: 107,
                NUMPAD_MINUS: 109,
                NUMPAD_DOT: 110
            },
            support: kendo.support || support,
            animate: kendo.animate || animate,
            ns: '',
            attr: function (value) {
                return 'data-' + kendo.ns + value;
            },
            getShadows: getShadows,
            wrap: wrap,
            deepExtend: deepExtend,
            getComputedStyles: getComputedStyles,
            webComponents: kendo.webComponents || [],
            isScrollable: isScrollable,
            scrollLeft: scrollLeft,
            size: size,
            toCamelCase: toCamelCase,
            toHyphens: toHyphens,
            getOffset: kendo.getOffset || getOffset,
            parseEffects: kendo.parseEffects || parseEffects,
            toggleClass: kendo.toggleClass || toggleClass,
            directions: kendo.directions || directions,
            Observable: Observable,
            Class: Class,
            Template: Template,
            template: proxy(Template.compile, Template),
            render: proxy(Template.render, Template),
            stringify: proxy(JSON.stringify, JSON),
            eventTarget: eventTarget,
            htmlEncode: htmlEncode,
            isLocalUrl: function (url) {
                return url && !localUrlRe.test(url);
            },
            expr: function (expression, safe, paramName) {
                expression = expression || '';
                if (typeof safe == STRING) {
                    paramName = safe;
                    safe = false;
                }
                paramName = paramName || 'd';
                if (expression && expression.charAt(0) !== '[') {
                    expression = '.' + expression;
                }
                if (safe) {
                    expression = expression.replace(/"([^.]*)\.([^"]*)"/g, '"$1_$DOT$_$2"');
                    expression = expression.replace(/'([^.]*)\.([^']*)'/g, '\'$1_$DOT$_$2\'');
                    expression = wrapExpression(expression.split('.'), paramName);
                    expression = expression.replace(/_\$DOT\$_/g, '.');
                } else {
                    expression = paramName + expression;
                }
                return expression;
            },
            getter: function (expression, safe) {
                var key = expression + safe;
                return getterCache[key] = getterCache[key] || new Function('d', 'return ' + kendo.expr(expression, safe));
            },
            setter: function (expression) {
                return setterCache[expression] = setterCache[expression] || new Function('d,value', kendo.expr(expression) + '=value');
            },
            accessor: function (expression) {
                return {
                    get: kendo.getter(expression),
                    set: kendo.setter(expression)
                };
            },
            guid: function () {
                var id = '', i, random;
                for (i = 0; i < 32; i++) {
                    random = math.random() * 16 | 0;
                    if (i == 8 || i == 12 || i == 16 || i == 20) {
                        id += '-';
                    }
                    id += (i == 12 ? 4 : i == 16 ? random & 3 | 8 : random).toString(16);
                }
                return id;
            },
            roleSelector: function (role) {
                return role.replace(/(\S+)/g, '[' + kendo.attr('role') + '=$1],').slice(0, -1);
            },
            directiveSelector: function (directives) {
                var selectors = directives.split(' ');
                if (selectors) {
                    for (var i = 0; i < selectors.length; i++) {
                        if (selectors[i] != 'view') {
                            selectors[i] = selectors[i].replace(/(\w*)(view|bar|strip|over)$/, '$1-$2');
                        }
                    }
                }
                return selectors.join(' ').replace(/(\S+)/g, 'kendo-mobile-$1,').slice(0, -1);
            },
            triggeredByInput: function (e) {
                return /^(label|input|textarea|select)$/i.test(e.target.tagName);
            },
            onWidgetRegistered: function (callback) {
                for (var i = 0, len = kendo.widgets.length; i < len; i++) {
                    callback(kendo.widgets[i]);
                }
                kendo._widgetRegisteredCallbacks.push(callback);
            },
            logToConsole: function (message, type) {
                var console = window.console;
                if (!kendo.suppressLog && typeof console != 'undefined' && console.log) {
                    console[type || 'log'](message);
                }
            }
        });
        var Widget = Observable.extend({
            init: function (element, options) {
                var that = this;
                that.element = kendo.jQuery(element).handler(that);
                that.angular('init', options);
                Observable.fn.init.call(that);
                var dataSource = options ? options.dataSource : null;
                if (dataSource) {
                    options = extend({}, options, { dataSource: {} });
                }
                options = that.options = extend(true, {}, that.options, options);
                if (dataSource) {
                    options.dataSource = dataSource;
                }
                if (!that.element.attr(kendo.attr('role'))) {
                    that.element.attr(kendo.attr('role'), (options.name || '').toLowerCase());
                }
                that.element.data('kendo' + options.prefix + options.name, that);
                that.bind(that.events, options);
            },
            events: [],
            options: { prefix: '' },
            _hasBindingTarget: function () {
                return !!this.element[0].kendoBindingTarget;
            },
            _tabindex: function (target) {
                target = target || this.wrapper;
                var element = this.element, TABINDEX = 'tabindex', tabindex = target.attr(TABINDEX) || element.attr(TABINDEX);
                element.removeAttr(TABINDEX);
                target.attr(TABINDEX, !isNaN(tabindex) ? tabindex : 0);
            },
            setOptions: function (options) {
                this._setEvents(options);
                $.extend(this.options, options);
            },
            _setEvents: function (options) {
                var that = this, idx = 0, length = that.events.length, e;
                for (; idx < length; idx++) {
                    e = that.events[idx];
                    if (that.options[e] && options[e]) {
                        that.unbind(e, that.options[e]);
                    }
                }
                that.bind(that.events, options);
            },
            resize: function (force) {
                var size = this.getSize(), currentSize = this._size;
                if (force || (size.width > 0 || size.height > 0) && (!currentSize || size.width !== currentSize.width || size.height !== currentSize.height)) {
                    this._size = size;
                    this._resize(size, force);
                    this.trigger('resize', size);
                }
            },
            getSize: function () {
                return kendo.dimensions(this.element);
            },
            size: function (size) {
                if (!size) {
                    return this.getSize();
                } else {
                    this.setSize(size);
                }
            },
            setSize: $.noop,
            _resize: $.noop,
            destroy: function () {
                var that = this;
                that.element.removeData('kendo' + that.options.prefix + that.options.name);
                that.element.removeData('handler');
                that.unbind();
            },
            _destroy: function () {
                this.destroy();
            },
            angular: function () {
            },
            _muteAngularRebind: function (callback) {
                this._muteRebind = true;
                callback.call(this);
                this._muteRebind = false;
            }
        });
        var DataBoundWidget = Widget.extend({
            dataItems: function () {
                return this.dataSource.flatView();
            },
            _angularItems: function (cmd) {
                var that = this;
                that.angular(cmd, function () {
                    return {
                        elements: that.items(),
                        data: $.map(that.dataItems(), function (dataItem) {
                            return { dataItem: dataItem };
                        })
                    };
                });
            }
        });
        kendo.dimensions = function (element, dimensions) {
            var domElement = element[0];
            if (dimensions) {
                element.css(dimensions);
            }
            return {
                width: domElement.offsetWidth,
                height: domElement.offsetHeight
            };
        };
        kendo.notify = noop;
        var templateRegExp = /template$/i, jsonRegExp = /^\s*(?:\{(?:.|\r\n|\n)*\}|\[(?:.|\r\n|\n)*\])\s*$/, jsonFormatRegExp = /^\{(\d+)(:[^\}]+)?\}|^\[[A-Za-z_]*\]$/, dashRegExp = /([A-Z])/g;
        function parseOption(element, option) {
            var value;
            if (option.indexOf('data') === 0) {
                option = option.substring(4);
                option = option.charAt(0).toLowerCase() + option.substring(1);
            }
            option = option.replace(dashRegExp, '-$1');
            value = element.getAttribute('data-' + kendo.ns + option);
            if (value === null) {
                value = undefined;
            } else if (value === 'null') {
                value = null;
            } else if (value === 'true') {
                value = true;
            } else if (value === 'false') {
                value = false;
            } else if (numberRegExp.test(value)) {
                value = parseFloat(value);
            } else if (jsonRegExp.test(value) && !jsonFormatRegExp.test(value)) {
                value = new Function('return (' + value + ')')();
            }
            return value;
        }
        function parseOptions(element, options) {
            var result = {}, option, value;
            for (option in options) {
                value = parseOption(element, option);
                if (value !== undefined) {
                    if (templateRegExp.test(option)) {
                        value = kendo.template($('#' + value).html());
                    }
                    result[option] = value;
                }
            }
            return result;
        }
        kendo.initWidget = function (element, options, roles) {
            var result, option, widget, idx, length, role, value, dataSource, fullPath, widgetKeyRegExp;
            if (!roles) {
                roles = kendo.ui.roles;
            } else if (roles.roles) {
                roles = roles.roles;
            }
            element = element.nodeType ? element : element[0];
            role = element.getAttribute('data-' + kendo.ns + 'role');
            if (!role) {
                return;
            }
            fullPath = role.indexOf('.') === -1;
            if (fullPath) {
                widget = roles[role];
            } else {
                widget = kendo.getter(role)(window);
            }
            var data = $(element).data(), widgetKey = widget ? 'kendo' + widget.fn.options.prefix + widget.fn.options.name : '';
            if (fullPath) {
                widgetKeyRegExp = new RegExp('^kendo.*' + role + '$', 'i');
            } else {
                widgetKeyRegExp = new RegExp('^' + widgetKey + '$', 'i');
            }
            for (var key in data) {
                if (key.match(widgetKeyRegExp)) {
                    if (key === widgetKey) {
                        result = data[key];
                    } else {
                        return data[key];
                    }
                }
            }
            if (!widget) {
                return;
            }
            dataSource = parseOption(element, 'dataSource');
            options = $.extend({}, parseOptions(element, widget.fn.options), options);
            if (dataSource) {
                if (typeof dataSource === STRING) {
                    options.dataSource = kendo.getter(dataSource)(window);
                } else {
                    options.dataSource = dataSource;
                }
            }
            for (idx = 0, length = widget.fn.events.length; idx < length; idx++) {
                option = widget.fn.events[idx];
                value = parseOption(element, option);
                if (value !== undefined) {
                    options[option] = kendo.getter(value)(window);
                }
            }
            if (!result) {
                result = new widget(element, options);
            } else if (!$.isEmptyObject(options)) {
                result.setOptions(options);
            }
            return result;
        };
        kendo.rolesFromNamespaces = function (namespaces) {
            var roles = [], idx, length;
            if (!namespaces[0]) {
                namespaces = [
                    kendo.ui,
                    kendo.dataviz.ui
                ];
            }
            for (idx = 0, length = namespaces.length; idx < length; idx++) {
                roles[idx] = namespaces[idx].roles;
            }
            return extend.apply(null, [{}].concat(roles.reverse()));
        };
        kendo.init = function (element) {
            var roles = kendo.rolesFromNamespaces(slice.call(arguments, 1));
            $(element).find('[data-' + kendo.ns + 'role]').addBack().each(function () {
                kendo.initWidget(this, {}, roles);
            });
        };
        kendo.destroy = function (element) {
            $(element).find('[data-' + kendo.ns + 'role]').addBack().each(function () {
                var data = $(this).data();
                for (var key in data) {
                    if (key.indexOf('kendo') === 0 && typeof data[key].destroy === FUNCTION) {
                        data[key].destroy();
                    }
                }
            });
        };
        function containmentComparer(a, b) {
            return $.contains(a, b) ? -1 : 1;
        }
        function resizableWidget() {
            var widget = $(this);
            return $.inArray(widget.attr('data-' + kendo.ns + 'role'), [
                'slider',
                'rangeslider'
            ]) > -1 || widget.is(':visible');
        }
        kendo.resize = function (element, force) {
            var widgets = $(element).find('[data-' + kendo.ns + 'role]').addBack().filter(resizableWidget);
            if (!widgets.length) {
                return;
            }
            var widgetsArray = $.makeArray(widgets);
            widgetsArray.sort(containmentComparer);
            $.each(widgetsArray, function () {
                var widget = kendo.widgetInstance($(this));
                if (widget) {
                    widget.resize(force);
                }
            });
        };
        kendo.parseOptions = parseOptions;
        extend(kendo.ui, {
            Widget: Widget,
            DataBoundWidget: DataBoundWidget,
            roles: {},
            progress: function (container, toggle) {
                var mask = container.find('.k-loading-mask'), support = kendo.support, browser = support.browser, isRtl, leftRight, webkitCorrection, containerScrollLeft;
                if (toggle) {
                    if (!mask.length) {
                        isRtl = support.isRtl(container);
                        leftRight = isRtl ? 'right' : 'left';
                        containerScrollLeft = container.scrollLeft();
                        webkitCorrection = browser.webkit ? !isRtl ? 0 : container[0].scrollWidth - container.width() - 2 * containerScrollLeft : 0;
                        mask = $('<div class=\'k-loading-mask\'><span class=\'k-loading-text\'>Loading...</span><div class=\'k-loading-image\'/><div class=\'k-loading-color\'/></div>').width('100%').height('100%').css('top', container.scrollTop()).css(leftRight, Math.abs(containerScrollLeft) + webkitCorrection).prependTo(container);
                    }
                } else if (mask) {
                    mask.remove();
                }
            },
            plugin: function (widget, register, prefix) {
                var name = widget.fn.options.name, getter;
                register = register || kendo.ui;
                prefix = prefix || '';
                register[name] = widget;
                register.roles[name.toLowerCase()] = widget;
                getter = 'getKendo' + prefix + name;
                name = 'kendo' + prefix + name;
                var widgetEntry = {
                    name: name,
                    widget: widget,
                    prefix: prefix || ''
                };
                kendo.widgets.push(widgetEntry);
                for (var i = 0, len = kendo._widgetRegisteredCallbacks.length; i < len; i++) {
                    kendo._widgetRegisteredCallbacks[i](widgetEntry);
                }
                $.fn[name] = function (options) {
                    var value = this, args;
                    if (typeof options === STRING) {
                        args = slice.call(arguments, 1);
                        this.each(function () {
                            var widget = $.data(this, name), method, result;
                            if (!widget) {
                                throw new Error(kendo.format('Cannot call method \'{0}\' of {1} before it is initialized', options, name));
                            }
                            method = widget[options];
                            if (typeof method !== FUNCTION) {
                                throw new Error(kendo.format('Cannot find method \'{0}\' of {1}', options, name));
                            }
                            result = method.apply(widget, args);
                            if (result !== undefined) {
                                value = result;
                                return false;
                            }
                        });
                    } else {
                        this.each(function () {
                            return new widget(this, options);
                        });
                    }
                    return value;
                };
                $.fn[name].widget = widget;
                $.fn[getter] = function () {
                    return this.data(name);
                };
            }
        });
        var ContainerNullObject = {
            bind: function () {
                return this;
            },
            nullObject: true,
            options: {}
        };
        var MobileWidget = Widget.extend({
            init: function (element, options) {
                Widget.fn.init.call(this, element, options);
                this.element.autoApplyNS();
                this.wrapper = this.element;
                this.element.addClass('km-widget');
            },
            destroy: function () {
                Widget.fn.destroy.call(this);
                this.element.kendoDestroy();
            },
            options: { prefix: 'Mobile' },
            events: [],
            view: function () {
                var viewElement = this.element.closest(kendo.roleSelector('view splitview modalview drawer'));
                return kendo.widgetInstance(viewElement, kendo.mobile.ui) || ContainerNullObject;
            },
            viewHasNativeScrolling: function () {
                var view = this.view();
                return view && view.options.useNativeScrolling;
            },
            container: function () {
                var element = this.element.closest(kendo.roleSelector('view layout modalview drawer splitview'));
                return kendo.widgetInstance(element.eq(0), kendo.mobile.ui) || ContainerNullObject;
            }
        });
        extend(kendo.mobile, {
            init: function (element) {
                kendo.init(element, kendo.mobile.ui, kendo.ui, kendo.dataviz.ui);
            },
            appLevelNativeScrolling: function () {
                return kendo.mobile.application && kendo.mobile.application.options && kendo.mobile.application.options.useNativeScrolling;
            },
            roles: {},
            ui: {
                Widget: MobileWidget,
                DataBoundWidget: DataBoundWidget.extend(MobileWidget.prototype),
                roles: {},
                plugin: function (widget) {
                    kendo.ui.plugin(widget, kendo.mobile.ui, 'Mobile');
                }
            }
        });
        deepExtend(kendo.dataviz, {
            init: function (element) {
                kendo.init(element, kendo.dataviz.ui);
            },
            ui: {
                roles: {},
                themes: {},
                views: [],
                plugin: function (widget) {
                    kendo.ui.plugin(widget, kendo.dataviz.ui);
                }
            },
            roles: {}
        });
        kendo.touchScroller = function (elements, options) {
            if (!options) {
                options = {};
            }
            options.useNative = true;
            return $(elements).map(function (idx, element) {
                element = $(element);
                if (support.kineticScrollNeeded && kendo.mobile.ui.Scroller && !element.data('kendoMobileScroller')) {
                    element.kendoMobileScroller(options);
                    return element.data('kendoMobileScroller');
                } else {
                    return false;
                }
            })[0];
        };
        kendo.preventDefault = function (e) {
            e.preventDefault();
        };
        kendo.widgetInstance = function (element, suites) {
            var role = element.data(kendo.ns + 'role'), widgets = [], i, length;
            if (role) {
                if (role === 'content') {
                    role = 'scroller';
                }
                if (suites) {
                    if (suites[0]) {
                        for (i = 0, length = suites.length; i < length; i++) {
                            widgets.push(suites[i].roles[role]);
                        }
                    } else {
                        widgets.push(suites.roles[role]);
                    }
                } else {
                    widgets = [
                        kendo.ui.roles[role],
                        kendo.dataviz.ui.roles[role],
                        kendo.mobile.ui.roles[role]
                    ];
                }
                if (role.indexOf('.') >= 0) {
                    widgets = [kendo.getter(role)(window)];
                }
                for (i = 0, length = widgets.length; i < length; i++) {
                    var widget = widgets[i];
                    if (widget) {
                        var instance = element.data('kendo' + widget.fn.options.prefix + widget.fn.options.name);
                        if (instance) {
                            return instance;
                        }
                    }
                }
            }
        };
        kendo.onResize = function (callback) {
            var handler = callback;
            if (support.mobileOS.android) {
                handler = function () {
                    setTimeout(callback, 600);
                };
            }
            $(window).on(support.resize, handler);
            return handler;
        };
        kendo.unbindResize = function (callback) {
            $(window).off(support.resize, callback);
        };
        kendo.attrValue = function (element, key) {
            return element.data(kendo.ns + key);
        };
        kendo.days = {
            Sunday: 0,
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6
        };
        function focusable(element, isTabIndexNotNaN) {
            var nodeName = element.nodeName.toLowerCase();
            return (/input|select|textarea|button|object/.test(nodeName) ? !element.disabled : 'a' === nodeName ? element.href || isTabIndexNotNaN : isTabIndexNotNaN) && visible(element);
        }
        function visible(element) {
            return $.expr.filters.visible(element) && !$(element).parents().addBack().filter(function () {
                return $.css(this, 'visibility') === 'hidden';
            }).length;
        }
        $.extend($.expr[':'], {
            kendoFocusable: function (element) {
                var idx = $.attr(element, 'tabindex');
                return focusable(element, !isNaN(idx) && idx > -1);
            }
        });
        var MOUSE_EVENTS = [
            'mousedown',
            'mousemove',
            'mouseenter',
            'mouseleave',
            'mouseover',
            'mouseout',
            'mouseup',
            'click'
        ];
        var EXCLUDE_BUST_CLICK_SELECTOR = 'label, input, [data-rel=external]';
        var MouseEventNormalizer = {
            setupMouseMute: function () {
                var idx = 0, length = MOUSE_EVENTS.length, element = document.documentElement;
                if (MouseEventNormalizer.mouseTrap || !support.eventCapture) {
                    return;
                }
                MouseEventNormalizer.mouseTrap = true;
                MouseEventNormalizer.bustClick = false;
                MouseEventNormalizer.captureMouse = false;
                var handler = function (e) {
                    if (MouseEventNormalizer.captureMouse) {
                        if (e.type === 'click') {
                            if (MouseEventNormalizer.bustClick && !$(e.target).is(EXCLUDE_BUST_CLICK_SELECTOR)) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        } else {
                            e.stopPropagation();
                        }
                    }
                };
                for (; idx < length; idx++) {
                    element.addEventListener(MOUSE_EVENTS[idx], handler, true);
                }
            },
            muteMouse: function (e) {
                MouseEventNormalizer.captureMouse = true;
                if (e.data.bustClick) {
                    MouseEventNormalizer.bustClick = true;
                }
                clearTimeout(MouseEventNormalizer.mouseTrapTimeoutID);
            },
            unMuteMouse: function () {
                clearTimeout(MouseEventNormalizer.mouseTrapTimeoutID);
                MouseEventNormalizer.mouseTrapTimeoutID = setTimeout(function () {
                    MouseEventNormalizer.captureMouse = false;
                    MouseEventNormalizer.bustClick = false;
                }, 400);
            }
        };
        var eventMap = {
            down: 'touchstart mousedown',
            move: 'mousemove touchmove',
            up: 'mouseup touchend touchcancel',
            cancel: 'mouseleave touchcancel'
        };
        if (support.touch && (support.mobileOS.ios || support.mobileOS.android)) {
            eventMap = {
                down: 'touchstart',
                move: 'touchmove',
                up: 'touchend touchcancel',
                cancel: 'touchcancel'
            };
        } else if (support.pointers) {
            eventMap = {
                down: 'pointerdown',
                move: 'pointermove',
                up: 'pointerup',
                cancel: 'pointercancel pointerleave'
            };
        } else if (support.msPointers) {
            eventMap = {
                down: 'MSPointerDown',
                move: 'MSPointerMove',
                up: 'MSPointerUp',
                cancel: 'MSPointerCancel MSPointerLeave'
            };
        }
        if (support.msPointers && !('onmspointerenter' in window)) {
            $.each({
                MSPointerEnter: 'MSPointerOver',
                MSPointerLeave: 'MSPointerOut'
            }, function (orig, fix) {
                $.event.special[orig] = {
                    delegateType: fix,
                    bindType: fix,
                    handle: function (event) {
                        var ret, target = this, related = event.relatedTarget, handleObj = event.handleObj;
                        if (!related || related !== target && !$.contains(target, related)) {
                            event.type = handleObj.origType;
                            ret = handleObj.handler.apply(this, arguments);
                            event.type = fix;
                        }
                        return ret;
                    }
                };
            });
        }
        var getEventMap = function (e) {
            return eventMap[e] || e;
        }, eventRegEx = /([^ ]+)/g;
        kendo.applyEventMap = function (events, ns) {
            events = events.replace(eventRegEx, getEventMap);
            if (ns) {
                events = events.replace(eventRegEx, '$1.' + ns);
            }
            return events;
        };
        var on = $.fn.on;
        function kendoJQuery(selector, context) {
            return new kendoJQuery.fn.init(selector, context);
        }
        extend(true, kendoJQuery, $);
        kendoJQuery.fn = kendoJQuery.prototype = new $();
        kendoJQuery.fn.constructor = kendoJQuery;
        kendoJQuery.fn.init = function (selector, context) {
            if (context && context instanceof $ && !(context instanceof kendoJQuery)) {
                context = kendoJQuery(context);
            }
            return $.fn.init.call(this, selector, context, rootjQuery);
        };
        kendoJQuery.fn.init.prototype = kendoJQuery.fn;
        var rootjQuery = kendoJQuery(document);
        extend(kendoJQuery.fn, {
            handler: function (handler) {
                this.data('handler', handler);
                return this;
            },
            autoApplyNS: function (ns) {
                this.data('kendoNS', ns || kendo.guid());
                return this;
            },
            on: function () {
                var that = this, ns = that.data('kendoNS');
                if (arguments.length === 1) {
                    return on.call(that, arguments[0]);
                }
                var context = that, args = slice.call(arguments);
                if (typeof args[args.length - 1] === UNDEFINED) {
                    args.pop();
                }
                var callback = args[args.length - 1], events = kendo.applyEventMap(args[0], ns);
                if (support.mouseAndTouchPresent && events.search(/mouse|click/) > -1 && this[0] !== document.documentElement) {
                    MouseEventNormalizer.setupMouseMute();
                    var selector = args.length === 2 ? null : args[1], bustClick = events.indexOf('click') > -1 && events.indexOf('touchend') > -1;
                    on.call(this, {
                        touchstart: MouseEventNormalizer.muteMouse,
                        touchend: MouseEventNormalizer.unMuteMouse
                    }, selector, { bustClick: bustClick });
                }
                if (typeof callback === STRING) {
                    context = that.data('handler');
                    callback = context[callback];
                    args[args.length - 1] = function (e) {
                        callback.call(context, e);
                    };
                }
                args[0] = events;
                on.apply(that, args);
                return that;
            },
            kendoDestroy: function (ns) {
                ns = ns || this.data('kendoNS');
                if (ns) {
                    this.off('.' + ns);
                }
                return this;
            }
        });
        kendo.jQuery = kendoJQuery;
        kendo.eventMap = eventMap;
        kendo.timezone = function () {
            var months = {
                Jan: 0,
                Feb: 1,
                Mar: 2,
                Apr: 3,
                May: 4,
                Jun: 5,
                Jul: 6,
                Aug: 7,
                Sep: 8,
                Oct: 9,
                Nov: 10,
                Dec: 11
            };
            var days = {
                Sun: 0,
                Mon: 1,
                Tue: 2,
                Wed: 3,
                Thu: 4,
                Fri: 5,
                Sat: 6
            };
            function ruleToDate(year, rule) {
                var date;
                var targetDay;
                var ourDay;
                var month = rule[3];
                var on = rule[4];
                var time = rule[5];
                var cache = rule[8];
                if (!cache) {
                    rule[8] = cache = {};
                }
                if (cache[year]) {
                    return cache[year];
                }
                if (!isNaN(on)) {
                    date = new Date(Date.UTC(year, months[month], on, time[0], time[1], time[2], 0));
                } else if (on.indexOf('last') === 0) {
                    date = new Date(Date.UTC(year, months[month] + 1, 1, time[0] - 24, time[1], time[2], 0));
                    targetDay = days[on.substr(4, 3)];
                    ourDay = date.getUTCDay();
                    date.setUTCDate(date.getUTCDate() + targetDay - ourDay - (targetDay > ourDay ? 7 : 0));
                } else if (on.indexOf('>=') >= 0) {
                    date = new Date(Date.UTC(year, months[month], on.substr(5), time[0], time[1], time[2], 0));
                    targetDay = days[on.substr(0, 3)];
                    ourDay = date.getUTCDay();
                    date.setUTCDate(date.getUTCDate() + targetDay - ourDay + (targetDay < ourDay ? 7 : 0));
                }
                return cache[year] = date;
            }
            function findRule(utcTime, rules, zone) {
                rules = rules[zone];
                if (!rules) {
                    var time = zone.split(':');
                    var offset = 0;
                    if (time.length > 1) {
                        offset = time[0] * 60 + Number(time[1]);
                    }
                    return [
                        -1000000,
                        'max',
                        '-',
                        'Jan',
                        1,
                        [
                            0,
                            0,
                            0
                        ],
                        offset,
                        '-'
                    ];
                }
                var year = new Date(utcTime).getUTCFullYear();
                rules = jQuery.grep(rules, function (rule) {
                    var from = rule[0];
                    var to = rule[1];
                    return from <= year && (to >= year || from == year && to == 'only' || to == 'max');
                });
                rules.push(utcTime);
                rules.sort(function (a, b) {
                    if (typeof a != 'number') {
                        a = Number(ruleToDate(year, a));
                    }
                    if (typeof b != 'number') {
                        b = Number(ruleToDate(year, b));
                    }
                    return a - b;
                });
                var rule = rules[jQuery.inArray(utcTime, rules) - 1] || rules[rules.length - 1];
                return isNaN(rule) ? rule : null;
            }
            function findZone(utcTime, zones, timezone) {
                var zoneRules = zones[timezone];
                if (typeof zoneRules === 'string') {
                    zoneRules = zones[zoneRules];
                }
                if (!zoneRules) {
                    throw new Error('Timezone "' + timezone + '" is either incorrect, or kendo.timezones.min.js is not included.');
                }
                for (var idx = zoneRules.length - 1; idx >= 0; idx--) {
                    var until = zoneRules[idx][3];
                    if (until && utcTime > until) {
                        break;
                    }
                }
                var zone = zoneRules[idx + 1];
                if (!zone) {
                    throw new Error('Timezone "' + timezone + '" not found on ' + utcTime + '.');
                }
                return zone;
            }
            function zoneAndRule(utcTime, zones, rules, timezone) {
                if (typeof utcTime != NUMBER) {
                    utcTime = Date.UTC(utcTime.getFullYear(), utcTime.getMonth(), utcTime.getDate(), utcTime.getHours(), utcTime.getMinutes(), utcTime.getSeconds(), utcTime.getMilliseconds());
                }
                var zone = findZone(utcTime, zones, timezone);
                return {
                    zone: zone,
                    rule: findRule(utcTime, rules, zone[1])
                };
            }
            function offset(utcTime, timezone) {
                if (timezone == 'Etc/UTC' || timezone == 'Etc/GMT') {
                    return 0;
                }
                var info = zoneAndRule(utcTime, this.zones, this.rules, timezone);
                var zone = info.zone;
                var rule = info.rule;
                return kendo.parseFloat(rule ? zone[0] - rule[6] : zone[0]);
            }
            function abbr(utcTime, timezone) {
                var info = zoneAndRule(utcTime, this.zones, this.rules, timezone);
                var zone = info.zone;
                var rule = info.rule;
                var base = zone[2];
                if (base.indexOf('/') >= 0) {
                    return base.split('/')[rule && +rule[6] ? 1 : 0];
                } else if (base.indexOf('%s') >= 0) {
                    return base.replace('%s', !rule || rule[7] == '-' ? '' : rule[7]);
                }
                return base;
            }
            function convert(date, fromOffset, toOffset) {
                if (typeof fromOffset == STRING) {
                    fromOffset = this.offset(date, fromOffset);
                }
                if (typeof toOffset == STRING) {
                    toOffset = this.offset(date, toOffset);
                }
                var fromLocalOffset = date.getTimezoneOffset();
                date = new Date(date.getTime() + (fromOffset - toOffset) * 60000);
                var toLocalOffset = date.getTimezoneOffset();
                return new Date(date.getTime() + (toLocalOffset - fromLocalOffset) * 60000);
            }
            function apply(date, timezone) {
                return this.convert(date, date.getTimezoneOffset(), timezone);
            }
            function remove(date, timezone) {
                return this.convert(date, timezone, date.getTimezoneOffset());
            }
            function toLocalDate(time) {
                return this.apply(new Date(time), 'Etc/UTC');
            }
            return {
                zones: {},
                rules: {},
                offset: offset,
                convert: convert,
                apply: apply,
                remove: remove,
                abbr: abbr,
                toLocalDate: toLocalDate
            };
        }();
        kendo.date = function () {
            var MS_PER_MINUTE = 60000, MS_PER_DAY = 86400000;
            function adjustDST(date, hours) {
                if (hours === 0 && date.getHours() === 23) {
                    date.setHours(date.getHours() + 2);
                    return true;
                }
                return false;
            }
            function setDayOfWeek(date, day, dir) {
                var hours = date.getHours();
                dir = dir || 1;
                day = (day - date.getDay() + 7 * dir) % 7;
                date.setDate(date.getDate() + day);
                adjustDST(date, hours);
            }
            function dayOfWeek(date, day, dir) {
                date = new Date(date);
                setDayOfWeek(date, day, dir);
                return date;
            }
            function firstDayOfMonth(date) {
                return new Date(date.getFullYear(), date.getMonth(), 1);
            }
            function lastDayOfMonth(date) {
                var last = new Date(date.getFullYear(), date.getMonth() + 1, 0), first = firstDayOfMonth(date), timeOffset = Math.abs(last.getTimezoneOffset() - first.getTimezoneOffset());
                if (timeOffset) {
                    last.setHours(first.getHours() + timeOffset / 60);
                }
                return last;
            }
            function getDate(date) {
                date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
                adjustDST(date, 0);
                return date;
            }
            function toUtcTime(date) {
                return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
            }
            function getMilliseconds(date) {
                return date.getTime() - getDate(date);
            }
            function isInTimeRange(value, min, max) {
                var msMin = getMilliseconds(min), msMax = getMilliseconds(max), msValue;
                if (!value || msMin == msMax) {
                    return true;
                }
                if (min >= max) {
                    max += MS_PER_DAY;
                }
                msValue = getMilliseconds(value);
                if (msMin > msValue) {
                    msValue += MS_PER_DAY;
                }
                if (msMax < msMin) {
                    msMax += MS_PER_DAY;
                }
                return msValue >= msMin && msValue <= msMax;
            }
            function isInDateRange(value, min, max) {
                var msMin = min.getTime(), msMax = max.getTime(), msValue;
                if (msMin >= msMax) {
                    msMax += MS_PER_DAY;
                }
                msValue = value.getTime();
                return msValue >= msMin && msValue <= msMax;
            }
            function addDays(date, offset) {
                var hours = date.getHours();
                date = new Date(date);
                setTime(date, offset * MS_PER_DAY);
                adjustDST(date, hours);
                return date;
            }
            function setTime(date, milliseconds, ignoreDST) {
                var offset = date.getTimezoneOffset();
                var difference;
                date.setTime(date.getTime() + milliseconds);
                if (!ignoreDST) {
                    difference = date.getTimezoneOffset() - offset;
                    date.setTime(date.getTime() + difference * MS_PER_MINUTE);
                }
            }
            function setHours(date, time) {
                date = new Date(kendo.date.getDate(date).getTime() + kendo.date.getMilliseconds(time));
                adjustDST(date, time.getHours());
                return date;
            }
            function today() {
                return getDate(new Date());
            }
            function isToday(date) {
                return getDate(date).getTime() == today().getTime();
            }
            function toInvariantTime(date) {
                var staticDate = new Date(1980, 1, 1, 0, 0, 0);
                if (date) {
                    staticDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
                }
                return staticDate;
            }
            return {
                adjustDST: adjustDST,
                dayOfWeek: dayOfWeek,
                setDayOfWeek: setDayOfWeek,
                getDate: getDate,
                isInDateRange: isInDateRange,
                isInTimeRange: isInTimeRange,
                isToday: isToday,
                nextDay: function (date) {
                    return addDays(date, 1);
                },
                previousDay: function (date) {
                    return addDays(date, -1);
                },
                toUtcTime: toUtcTime,
                MS_PER_DAY: MS_PER_DAY,
                MS_PER_HOUR: 60 * MS_PER_MINUTE,
                MS_PER_MINUTE: MS_PER_MINUTE,
                setTime: setTime,
                setHours: setHours,
                addDays: addDays,
                today: today,
                toInvariantTime: toInvariantTime,
                firstDayOfMonth: firstDayOfMonth,
                lastDayOfMonth: lastDayOfMonth,
                getMilliseconds: getMilliseconds
            };
        }();
        kendo.stripWhitespace = function (element) {
            if (document.createNodeIterator) {
                var iterator = document.createNodeIterator(element, NodeFilter.SHOW_TEXT, function (node) {
                    return node.parentNode == element ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }, false);
                while (iterator.nextNode()) {
                    if (iterator.referenceNode && !iterator.referenceNode.textContent.trim()) {
                        iterator.referenceNode.parentNode.removeChild(iterator.referenceNode);
                    }
                }
            } else {
                for (var i = 0; i < element.childNodes.length; i++) {
                    var child = element.childNodes[i];
                    if (child.nodeType == 3 && !/\S/.test(child.nodeValue)) {
                        element.removeChild(child);
                        i--;
                    }
                    if (child.nodeType == 1) {
                        kendo.stripWhitespace(child);
                    }
                }
            }
        };
        var animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            setTimeout(callback, 1000 / 60);
        };
        kendo.animationFrame = function (callback) {
            animationFrame.call(window, callback);
        };
        var animationQueue = [];
        kendo.queueAnimation = function (callback) {
            animationQueue[animationQueue.length] = callback;
            if (animationQueue.length === 1) {
                kendo.runNextAnimation();
            }
        };
        kendo.runNextAnimation = function () {
            kendo.animationFrame(function () {
                if (animationQueue[0]) {
                    animationQueue.shift()();
                    if (animationQueue[0]) {
                        kendo.runNextAnimation();
                    }
                }
            });
        };
        kendo.parseQueryStringParams = function (url) {
            var queryString = url.split('?')[1] || '', params = {}, paramParts = queryString.split(/&|=/), length = paramParts.length, idx = 0;
            for (; idx < length; idx += 2) {
                if (paramParts[idx] !== '') {
                    params[decodeURIComponent(paramParts[idx])] = decodeURIComponent(paramParts[idx + 1]);
                }
            }
            return params;
        };
        kendo.elementUnderCursor = function (e) {
            if (typeof e.x.client != 'undefined') {
                return document.elementFromPoint(e.x.client, e.y.client);
            }
        };
        kendo.wheelDeltaY = function (jQueryEvent) {
            var e = jQueryEvent.originalEvent, deltaY = e.wheelDeltaY, delta;
            if (e.wheelDelta) {
                if (deltaY === undefined || deltaY) {
                    delta = e.wheelDelta;
                }
            } else if (e.detail && e.axis === e.VERTICAL_AXIS) {
                delta = -e.detail * 10;
            }
            return delta;
        };
        kendo.throttle = function (fn, delay) {
            var timeout;
            var lastExecTime = 0;
            if (!delay || delay <= 0) {
                return fn;
            }
            var throttled = function () {
                var that = this;
                var elapsed = +new Date() - lastExecTime;
                var args = arguments;
                function exec() {
                    fn.apply(that, args);
                    lastExecTime = +new Date();
                }
                if (!lastExecTime) {
                    return exec();
                }
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (elapsed > delay) {
                    exec();
                } else {
                    timeout = setTimeout(exec, delay - elapsed);
                }
            };
            throttled.cancel = function () {
                clearTimeout(timeout);
            };
            return throttled;
        };
        kendo.caret = function (element, start, end) {
            var rangeElement;
            var isPosition = start !== undefined;
            if (end === undefined) {
                end = start;
            }
            if (element[0]) {
                element = element[0];
            }
            if (isPosition && element.disabled) {
                return;
            }
            try {
                if (element.selectionStart !== undefined) {
                    if (isPosition) {
                        element.focus();
                        element.setSelectionRange(start, end);
                    } else {
                        start = [
                            element.selectionStart,
                            element.selectionEnd
                        ];
                    }
                } else if (document.selection) {
                    if ($(element).is(':visible')) {
                        element.focus();
                    }
                    rangeElement = element.createTextRange();
                    if (isPosition) {
                        rangeElement.collapse(true);
                        rangeElement.moveStart('character', start);
                        rangeElement.moveEnd('character', end - start);
                        rangeElement.select();
                    } else {
                        var rangeDuplicated = rangeElement.duplicate(), selectionStart, selectionEnd;
                        rangeElement.moveToBookmark(document.selection.createRange().getBookmark());
                        rangeDuplicated.setEndPoint('EndToStart', rangeElement);
                        selectionStart = rangeDuplicated.text.length;
                        selectionEnd = selectionStart + rangeElement.text.length;
                        start = [
                            selectionStart,
                            selectionEnd
                        ];
                    }
                }
            } catch (e) {
                start = [];
            }
            return start;
        };
        kendo.compileMobileDirective = function (element, scope) {
            var angular = window.angular;
            element.attr('data-' + kendo.ns + 'role', element[0].tagName.toLowerCase().replace('kendo-mobile-', '').replace('-', ''));
            angular.element(element).injector().invoke([
                '$compile',
                function ($compile) {
                    $compile(element)(scope);
                    if (!/^\$(digest|apply)$/.test(scope.$$phase)) {
                        scope.$digest();
                    }
                }
            ]);
            return kendo.widgetInstance(element, kendo.mobile.ui);
        };
        kendo.antiForgeryTokens = function () {
            var tokens = {}, csrf_token = $('meta[name=csrf-token],meta[name=_csrf]').attr('content'), csrf_param = $('meta[name=csrf-param],meta[name=_csrf_header]').attr('content');
            $('input[name^=\'__RequestVerificationToken\']').each(function () {
                tokens[this.name] = this.value;
            });
            if (csrf_param !== undefined && csrf_token !== undefined) {
                tokens[csrf_param] = csrf_token;
            }
            return tokens;
        };
        kendo.cycleForm = function (form) {
            var firstElement = form.find('input, .k-widget').first();
            var lastElement = form.find('button, .k-button').last();
            function focus(el) {
                var widget = kendo.widgetInstance(el);
                if (widget && widget.focus) {
                    widget.focus();
                } else {
                    el.focus();
                }
            }
            lastElement.on('keydown', function (e) {
                if (e.keyCode == kendo.keys.TAB && !e.shiftKey) {
                    e.preventDefault();
                    focus(firstElement);
                }
            });
            firstElement.on('keydown', function (e) {
                if (e.keyCode == kendo.keys.TAB && e.shiftKey) {
                    e.preventDefault();
                    focus(lastElement);
                }
            });
        };
        (function () {
            function postToProxy(dataURI, fileName, proxyURL, proxyTarget) {
                var form = $('<form>').attr({
                    action: proxyURL,
                    method: 'POST',
                    target: proxyTarget
                });
                var data = kendo.antiForgeryTokens();
                data.fileName = fileName;
                var parts = dataURI.split(';base64,');
                data.contentType = parts[0].replace('data:', '');
                data.base64 = parts[1];
                for (var name in data) {
                    if (data.hasOwnProperty(name)) {
                        $('<input>').attr({
                            value: data[name],
                            name: name,
                            type: 'hidden'
                        }).appendTo(form);
                    }
                }
                form.appendTo('body').submit().remove();
            }
            var fileSaver = document.createElement('a');
            var downloadAttribute = 'download' in fileSaver && !kendo.support.browser.edge;
            function saveAsBlob(dataURI, fileName) {
                var blob = dataURI;
                if (typeof dataURI == 'string') {
                    var parts = dataURI.split(';base64,');
                    var contentType = parts[0];
                    var base64 = atob(parts[1]);
                    var array = new Uint8Array(base64.length);
                    for (var idx = 0; idx < base64.length; idx++) {
                        array[idx] = base64.charCodeAt(idx);
                    }
                    blob = new Blob([array.buffer], { type: contentType });
                }
                navigator.msSaveBlob(blob, fileName);
            }
            function saveAsDataURI(dataURI, fileName) {
                if (window.Blob && dataURI instanceof Blob) {
                    dataURI = URL.createObjectURL(dataURI);
                }
                fileSaver.download = fileName;
                fileSaver.href = dataURI;
                var e = document.createEvent('MouseEvents');
                e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                fileSaver.dispatchEvent(e);
                URL.revokeObjectURL(dataURI);
            }
            kendo.saveAs = function (options) {
                var save = postToProxy;
                if (!options.forceProxy) {
                    if (downloadAttribute) {
                        save = saveAsDataURI;
                    } else if (navigator.msSaveBlob) {
                        save = saveAsBlob;
                    }
                }
                save(options.dataURI, options.fileName, options.proxyURL, options.proxyTarget);
            };
        }());
        kendo.proxyModelSetters = function proxyModelSetters(data) {
            var observable = {};
            Object.keys(data || {}).forEach(function (property) {
                Object.defineProperty(observable, property, {
                    get: function () {
                        return data[property];
                    },
                    set: function (value) {
                        data[property] = value;
                        data.dirty = true;
                    }
                });
            });
            return observable;
        };
    }(jQuery, window));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));

/** 
 * Copyright 2016 Telerik AD                                                                                                                                                                            
 *                                                                                                                                                                                                      
 * Licensed under the Apache License, Version 2.0 (the "License");                                                                                                                                      
 * you may not use this file except in compliance with the License.                                                                                                                                     
 * You may obtain a copy of the License at                                                                                                                                                              
 *                                                                                                                                                                                                      
 *     http://www.apache.org/licenses/LICENSE-2.0                                                                                                                                                       
 *                                                                                                                                                                                                      
 * Unless required by applicable law or agreed to in writing, software                                                                                                                                  
 * distributed under the License is distributed on an "AS IS" BASIS,                                                                                                                                    
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.                                                                                                                             
 * See the License for the specific language governing permissions and                                                                                                                                  
 * limitations under the License.                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.fx', ['kendo.core'], f);
}(function () {
    var __meta__ = {
        id: 'fx',
        name: 'Effects',
        category: 'framework',
        description: 'Required for animation effects in all Kendo UI widgets.',
        depends: ['core']
    };
    (function ($, undefined) {
        var kendo = window.kendo, fx = kendo.effects, each = $.each, extend = $.extend, proxy = $.proxy, support = kendo.support, browser = support.browser, transforms = support.transforms, transitions = support.transitions, scaleProperties = {
            scale: 0,
            scalex: 0,
            scaley: 0,
            scale3d: 0
        }, translateProperties = {
            translate: 0,
            translatex: 0,
            translatey: 0,
            translate3d: 0
        }, hasZoom = typeof document.documentElement.style.zoom !== 'undefined' && !transforms, matrix3dRegExp = /matrix3?d?\s*\(.*,\s*([\d\.\-]+)\w*?,\s*([\d\.\-]+)\w*?,\s*([\d\.\-]+)\w*?,\s*([\d\.\-]+)\w*?/i, cssParamsRegExp = /^(-?[\d\.\-]+)?[\w\s]*,?\s*(-?[\d\.\-]+)?[\w\s]*/i, translateXRegExp = /translatex?$/i, oldEffectsRegExp = /(zoom|fade|expand)(\w+)/, singleEffectRegExp = /(zoom|fade|expand)/, unitRegExp = /[xy]$/i, transformProps = [
            'perspective',
            'rotate',
            'rotatex',
            'rotatey',
            'rotatez',
            'rotate3d',
            'scale',
            'scalex',
            'scaley',
            'scalez',
            'scale3d',
            'skew',
            'skewx',
            'skewy',
            'translate',
            'translatex',
            'translatey',
            'translatez',
            'translate3d',
            'matrix',
            'matrix3d'
        ], transform2d = [
            'rotate',
            'scale',
            'scalex',
            'scaley',
            'skew',
            'skewx',
            'skewy',
            'translate',
            'translatex',
            'translatey',
            'matrix'
        ], transform2units = {
            'rotate': 'deg',
            scale: '',
            skew: 'px',
            translate: 'px'
        }, cssPrefix = transforms.css, round = Math.round, BLANK = '', PX = 'px', NONE = 'none', AUTO = 'auto', WIDTH = 'width', HEIGHT = 'height', HIDDEN = 'hidden', ORIGIN = 'origin', ABORT_ID = 'abortId', OVERFLOW = 'overflow', TRANSLATE = 'translate', POSITION = 'position', COMPLETE_CALLBACK = 'completeCallback', TRANSITION = cssPrefix + 'transition', TRANSFORM = cssPrefix + 'transform', BACKFACE = cssPrefix + 'backface-visibility', PERSPECTIVE = cssPrefix + 'perspective', DEFAULT_PERSPECTIVE = '1500px', TRANSFORM_PERSPECTIVE = 'perspective(' + DEFAULT_PERSPECTIVE + ')', directions = {
            left: {
                reverse: 'right',
                property: 'left',
                transition: 'translatex',
                vertical: false,
                modifier: -1
            },
            right: {
                reverse: 'left',
                property: 'left',
                transition: 'translatex',
                vertical: false,
                modifier: 1
            },
            down: {
                reverse: 'up',
                property: 'top',
                transition: 'translatey',
                vertical: true,
                modifier: 1
            },
            up: {
                reverse: 'down',
                property: 'top',
                transition: 'translatey',
                vertical: true,
                modifier: -1
            },
            top: { reverse: 'bottom' },
            bottom: { reverse: 'top' },
            'in': {
                reverse: 'out',
                modifier: -1
            },
            out: {
                reverse: 'in',
                modifier: 1
            },
            vertical: { reverse: 'vertical' },
            horizontal: { reverse: 'horizontal' }
        };
        kendo.directions = directions;
        extend($.fn, {
            kendoStop: function (clearQueue, gotoEnd) {
                if (transitions) {
                    return fx.stopQueue(this, clearQueue || false, gotoEnd || false);
                } else {
                    return this.stop(clearQueue, gotoEnd);
                }
            }
        });
        if (transforms && !transitions) {
            each(transform2d, function (idx, value) {
                $.fn[value] = function (val) {
                    if (typeof val == 'undefined') {
                        return animationProperty(this, value);
                    } else {
                        var that = $(this)[0], transformValue = value + '(' + val + transform2units[value.replace(unitRegExp, '')] + ')';
                        if (that.style.cssText.indexOf(TRANSFORM) == -1) {
                            $(this).css(TRANSFORM, transformValue);
                        } else {
                            that.style.cssText = that.style.cssText.replace(new RegExp(value + '\\(.*?\\)', 'i'), transformValue);
                        }
                    }
                    return this;
                };
                $.fx.step[value] = function (fx) {
                    $(fx.elem)[value](fx.now);
                };
            });
            var curProxy = $.fx.prototype.cur;
            $.fx.prototype.cur = function () {
                if (transform2d.indexOf(this.prop) != -1) {
                    return parseFloat($(this.elem)[this.prop]());
                }
                return curProxy.apply(this, arguments);
            };
        }
        kendo.toggleClass = function (element, classes, options, add) {
            if (classes) {
                classes = classes.split(' ');
                if (transitions) {
                    options = extend({
                        exclusive: 'all',
                        duration: 400,
                        ease: 'ease-out'
                    }, options);
                    element.css(TRANSITION, options.exclusive + ' ' + options.duration + 'ms ' + options.ease);
                    setTimeout(function () {
                        element.css(TRANSITION, '').css(HEIGHT);
                    }, options.duration);
                }
                each(classes, function (idx, value) {
                    element.toggleClass(value, add);
                });
            }
            return element;
        };
        kendo.parseEffects = function (input, mirror) {
            var effects = {};
            if (typeof input === 'string') {
                each(input.split(' '), function (idx, value) {
                    var redirectedEffect = !singleEffectRegExp.test(value), resolved = value.replace(oldEffectsRegExp, function (match, $1, $2) {
                        return $1 + ':' + $2.toLowerCase();
                    }), effect = resolved.split(':'), direction = effect[1], effectBody = {};
                    if (effect.length > 1) {
                        effectBody.direction = mirror && redirectedEffect ? directions[direction].reverse : direction;
                    }
                    effects[effect[0]] = effectBody;
                });
            } else {
                each(input, function (idx) {
                    var direction = this.direction;
                    if (direction && mirror && !singleEffectRegExp.test(idx)) {
                        this.direction = directions[direction].reverse;
                    }
                    effects[idx] = this;
                });
            }
            return effects;
        };
        function parseInteger(value) {
            return parseInt(value, 10);
        }
        function parseCSS(element, property) {
            return parseInteger(element.css(property));
        }
        function keys(obj) {
            var acc = [];
            for (var propertyName in obj) {
                acc.push(propertyName);
            }
            return acc;
        }
        function strip3DTransforms(properties) {
            for (var key in properties) {
                if (transformProps.indexOf(key) != -1 && transform2d.indexOf(key) == -1) {
                    delete properties[key];
                }
            }
            return properties;
        }
        function normalizeCSS(element, properties) {
            var transformation = [], cssValues = {}, lowerKey, key, value, isTransformed;
            for (key in properties) {
                lowerKey = key.toLowerCase();
                isTransformed = transforms && transformProps.indexOf(lowerKey) != -1;
                if (!support.hasHW3D && isTransformed && transform2d.indexOf(lowerKey) == -1) {
                    delete properties[key];
                } else {
                    value = properties[key];
                    if (isTransformed) {
                        transformation.push(key + '(' + value + ')');
                    } else {
                        cssValues[key] = value;
                    }
                }
            }
            if (transformation.length) {
                cssValues[TRANSFORM] = transformation.join(' ');
            }
            return cssValues;
        }
        if (transitions) {
            extend(fx, {
                transition: function (element, properties, options) {
                    var css, delay = 0, oldKeys = element.data('keys') || [], timeoutID;
                    options = extend({
                        duration: 200,
                        ease: 'ease-out',
                        complete: null,
                        exclusive: 'all'
                    }, options);
                    var stopTransitionCalled = false;
                    var stopTransition = function () {
                        if (!stopTransitionCalled) {
                            stopTransitionCalled = true;
                            if (timeoutID) {
                                clearTimeout(timeoutID);
                                timeoutID = null;
                            }
                            element.removeData(ABORT_ID).dequeue().css(TRANSITION, '').css(TRANSITION);
                            options.complete.call(element);
                        }
                    };
                    options.duration = $.fx ? $.fx.speeds[options.duration] || options.duration : options.duration;
                    css = normalizeCSS(element, properties);
                    $.merge(oldKeys, keys(css));
                    element.data('keys', $.unique(oldKeys)).height();
                    element.css(TRANSITION, options.exclusive + ' ' + options.duration + 'ms ' + options.ease).css(TRANSITION);
                    element.css(css).css(TRANSFORM);
                    if (transitions.event) {
                        element.one(transitions.event, stopTransition);
                        if (options.duration !== 0) {
                            delay = 500;
                        }
                    }
                    timeoutID = setTimeout(stopTransition, options.duration + delay);
                    element.data(ABORT_ID, timeoutID);
                    element.data(COMPLETE_CALLBACK, stopTransition);
                },
                stopQueue: function (element, clearQueue, gotoEnd) {
                    var cssValues, taskKeys = element.data('keys'), retainPosition = !gotoEnd && taskKeys, completeCallback = element.data(COMPLETE_CALLBACK);
                    if (retainPosition) {
                        cssValues = kendo.getComputedStyles(element[0], taskKeys);
                    }
                    if (completeCallback) {
                        completeCallback();
                    }
                    if (retainPosition) {
                        element.css(cssValues);
                    }
                    return element.removeData('keys').stop(clearQueue);
                }
            });
        }
        function animationProperty(element, property) {
            if (transforms) {
                var transform = element.css(TRANSFORM);
                if (transform == NONE) {
                    return property == 'scale' ? 1 : 0;
                }
                var match = transform.match(new RegExp(property + '\\s*\\(([\\d\\w\\.]+)')), computed = 0;
                if (match) {
                    computed = parseInteger(match[1]);
                } else {
                    match = transform.match(matrix3dRegExp) || [
                        0,
                        0,
                        0,
                        0,
                        0
                    ];
                    property = property.toLowerCase();
                    if (translateXRegExp.test(property)) {
                        computed = parseFloat(match[3] / match[2]);
                    } else if (property == 'translatey') {
                        computed = parseFloat(match[4] / match[2]);
                    } else if (property == 'scale') {
                        computed = parseFloat(match[2]);
                    } else if (property == 'rotate') {
                        computed = parseFloat(Math.atan2(match[2], match[1]));
                    }
                }
                return computed;
            } else {
                return parseFloat(element.css(property));
            }
        }
        var EffectSet = kendo.Class.extend({
            init: function (element, options) {
                var that = this;
                that.element = element;
                that.effects = [];
                that.options = options;
                that.restore = [];
            },
            run: function (effects) {
                var that = this, effect, idx, jdx, length = effects.length, element = that.element, options = that.options, deferred = $.Deferred(), start = {}, end = {}, target, children, childrenLength;
                that.effects = effects;
                deferred.then($.proxy(that, 'complete'));
                element.data('animating', true);
                for (idx = 0; idx < length; idx++) {
                    effect = effects[idx];
                    effect.setReverse(options.reverse);
                    effect.setOptions(options);
                    that.addRestoreProperties(effect.restore);
                    effect.prepare(start, end);
                    children = effect.children();
                    for (jdx = 0, childrenLength = children.length; jdx < childrenLength; jdx++) {
                        children[jdx].duration(options.duration).run();
                    }
                }
                for (var effectName in options.effects) {
                    extend(end, options.effects[effectName].properties);
                }
                if (!element.is(':visible')) {
                    extend(start, { display: element.data('olddisplay') || 'block' });
                }
                if (transforms && !options.reset) {
                    target = element.data('targetTransform');
                    if (target) {
                        start = extend(target, start);
                    }
                }
                start = normalizeCSS(element, start);
                if (transforms && !transitions) {
                    start = strip3DTransforms(start);
                }
                element.css(start).css(TRANSFORM);
                for (idx = 0; idx < length; idx++) {
                    effects[idx].setup();
                }
                if (options.init) {
                    options.init();
                }
                element.data('targetTransform', end);
                fx.animate(element, end, extend({}, options, { complete: deferred.resolve }));
                return deferred.promise();
            },
            stop: function () {
                $(this.element).kendoStop(true, true);
            },
            addRestoreProperties: function (restore) {
                var element = this.element, value, i = 0, length = restore.length;
                for (; i < length; i++) {
                    value = restore[i];
                    this.restore.push(value);
                    if (!element.data(value)) {
                        element.data(value, element.css(value));
                    }
                }
            },
            restoreCallback: function () {
                var element = this.element;
                for (var i = 0, length = this.restore.length; i < length; i++) {
                    var value = this.restore[i];
                    element.css(value, element.data(value));
                }
            },
            complete: function () {
                var that = this, idx = 0, element = that.element, options = that.options, effects = that.effects, length = effects.length;
                element.removeData('animating').dequeue();
                if (options.hide) {
                    element.data('olddisplay', element.css('display')).hide();
                }
                this.restoreCallback();
                if (hasZoom && !transforms) {
                    setTimeout($.proxy(this, 'restoreCallback'), 0);
                }
                for (; idx < length; idx++) {
                    effects[idx].teardown();
                }
                if (options.completeCallback) {
                    options.completeCallback(element);
                }
            }
        });
        fx.promise = function (element, options) {
            var effects = [], effectClass, effectSet = new EffectSet(element, options), parsedEffects = kendo.parseEffects(options.effects), effect;
            options.effects = parsedEffects;
            for (var effectName in parsedEffects) {
                effectClass = fx[capitalize(effectName)];
                if (effectClass) {
                    effect = new effectClass(element, parsedEffects[effectName].direction);
                    effects.push(effect);
                }
            }
            if (effects[0]) {
                effectSet.run(effects);
            } else {
                if (!element.is(':visible')) {
                    element.css({ display: element.data('olddisplay') || 'block' }).css('display');
                }
                if (options.init) {
                    options.init();
                }
                element.dequeue();
                effectSet.complete();
            }
        };
        extend(fx, {
            animate: function (elements, properties, options) {
                var useTransition = options.transition !== false;
                delete options.transition;
                if (transitions && 'transition' in fx && useTransition) {
                    fx.transition(elements, properties, options);
                } else {
                    if (transforms) {
                        elements.animate(strip3DTransforms(properties), {
                            queue: false,
                            show: false,
                            hide: false,
                            duration: options.duration,
                            complete: options.complete
                        });
                    } else {
                        elements.each(function () {
                            var element = $(this), multiple = {};
                            each(transformProps, function (idx, value) {
                                var params, currentValue = properties ? properties[value] + ' ' : null;
                                if (currentValue) {
                                    var single = properties;
                                    if (value in scaleProperties && properties[value] !== undefined) {
                                        params = currentValue.match(cssParamsRegExp);
                                        if (transforms) {
                                            extend(single, { scale: +params[0] });
                                        }
                                    } else {
                                        if (value in translateProperties && properties[value] !== undefined) {
                                            var position = element.css(POSITION), isFixed = position == 'absolute' || position == 'fixed';
                                            if (!element.data(TRANSLATE)) {
                                                if (isFixed) {
                                                    element.data(TRANSLATE, {
                                                        top: parseCSS(element, 'top') || 0,
                                                        left: parseCSS(element, 'left') || 0,
                                                        bottom: parseCSS(element, 'bottom'),
                                                        right: parseCSS(element, 'right')
                                                    });
                                                } else {
                                                    element.data(TRANSLATE, {
                                                        top: parseCSS(element, 'marginTop') || 0,
                                                        left: parseCSS(element, 'marginLeft') || 0
                                                    });
                                                }
                                            }
                                            var originalPosition = element.data(TRANSLATE);
                                            params = currentValue.match(cssParamsRegExp);
                                            if (params) {
                                                var dX = value == TRANSLATE + 'y' ? +null : +params[1], dY = value == TRANSLATE + 'y' ? +params[1] : +params[2];
                                                if (isFixed) {
                                                    if (!isNaN(originalPosition.right)) {
                                                        if (!isNaN(dX)) {
                                                            extend(single, { right: originalPosition.right - dX });
                                                        }
                                                    } else {
                                                        if (!isNaN(dX)) {
                                                            extend(single, { left: originalPosition.left + dX });
                                                        }
                                                    }
                                                    if (!isNaN(originalPosition.bottom)) {
                                                        if (!isNaN(dY)) {
                                                            extend(single, { bottom: originalPosition.bottom - dY });
                                                        }
                                                    } else {
                                                        if (!isNaN(dY)) {
                                                            extend(single, { top: originalPosition.top + dY });
                                                        }
                                                    }
                                                } else {
                                                    if (!isNaN(dX)) {
                                                        extend(single, { marginLeft: originalPosition.left + dX });
                                                    }
                                                    if (!isNaN(dY)) {
                                                        extend(single, { marginTop: originalPosition.top + dY });
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (!transforms && value != 'scale' && value in single) {
                                        delete single[value];
                                    }
                                    if (single) {
                                        extend(multiple, single);
                                    }
                                }
                            });
                            if (browser.msie) {
                                delete multiple.scale;
                            }
                            element.animate(multiple, {
                                queue: false,
                                show: false,
                                hide: false,
                                duration: options.duration,
                                complete: options.complete
                            });
                        });
                    }
                }
            }
        });
        fx.animatedPromise = fx.promise;
        var Effect = kendo.Class.extend({
            init: function (element, direction) {
                var that = this;
                that.element = element;
                that._direction = direction;
                that.options = {};
                that._additionalEffects = [];
                if (!that.restore) {
                    that.restore = [];
                }
            },
            reverse: function () {
                this._reverse = true;
                return this.run();
            },
            play: function () {
                this._reverse = false;
                return this.run();
            },
            add: function (additional) {
                this._additionalEffects.push(additional);
                return this;
            },
            direction: function (value) {
                this._direction = value;
                return this;
            },
            duration: function (duration) {
                this._duration = duration;
                return this;
            },
            compositeRun: function () {
                var that = this, effectSet = new EffectSet(that.element, {
                    reverse: that._reverse,
                    duration: that._duration
                }), effects = that._additionalEffects.concat([that]);
                return effectSet.run(effects);
            },
            run: function () {
                if (this._additionalEffects && this._additionalEffects[0]) {
                    return this.compositeRun();
                }
                var that = this, element = that.element, idx = 0, restore = that.restore, length = restore.length, value, deferred = $.Deferred(), start = {}, end = {}, target, children = that.children(), childrenLength = children.length;
                deferred.then($.proxy(that, '_complete'));
                element.data('animating', true);
                for (idx = 0; idx < length; idx++) {
                    value = restore[idx];
                    if (!element.data(value)) {
                        element.data(value, element.css(value));
                    }
                }
                for (idx = 0; idx < childrenLength; idx++) {
                    children[idx].duration(that._duration).run();
                }
                that.prepare(start, end);
                if (!element.is(':visible')) {
                    extend(start, { display: element.data('olddisplay') || 'block' });
                }
                if (transforms) {
                    target = element.data('targetTransform');
                    if (target) {
                        start = extend(target, start);
                    }
                }
                start = normalizeCSS(element, start);
                if (transforms && !transitions) {
                    start = strip3DTransforms(start);
                }
                element.css(start).css(TRANSFORM);
                that.setup();
                element.data('targetTransform', end);
                fx.animate(element, end, {
                    duration: that._duration,
                    complete: deferred.resolve
                });
                return deferred.promise();
            },
            stop: function () {
                var idx = 0, children = this.children(), childrenLength = children.length;
                for (idx = 0; idx < childrenLength; idx++) {
                    children[idx].stop();
                }
                $(this.element).kendoStop(true, true);
                return this;
            },
            restoreCallback: function () {
                var element = this.element;
                for (var i = 0, length = this.restore.length; i < length; i++) {
                    var value = this.restore[i];
                    element.css(value, element.data(value));
                }
            },
            _complete: function () {
                var that = this, element = that.element;
                element.removeData('animating').dequeue();
                that.restoreCallback();
                if (that.shouldHide()) {
                    element.data('olddisplay', element.css('display')).hide();
                }
                if (hasZoom && !transforms) {
                    setTimeout($.proxy(that, 'restoreCallback'), 0);
                }
                that.teardown();
            },
            setOptions: function (options) {
                extend(true, this.options, options);
            },
            children: function () {
                return [];
            },
            shouldHide: $.noop,
            setup: $.noop,
            prepare: $.noop,
            teardown: $.noop,
            directions: [],
            setReverse: function (reverse) {
                this._reverse = reverse;
                return this;
            }
        });
        function capitalize(word) {
            return word.charAt(0).toUpperCase() + word.substring(1);
        }
        function createEffect(name, definition) {
            var effectClass = Effect.extend(definition), directions = effectClass.prototype.directions;
            fx[capitalize(name)] = effectClass;
            fx.Element.prototype[name] = function (direction, opt1, opt2, opt3) {
                return new effectClass(this.element, direction, opt1, opt2, opt3);
            };
            each(directions, function (idx, theDirection) {
                fx.Element.prototype[name + capitalize(theDirection)] = function (opt1, opt2, opt3) {
                    return new effectClass(this.element, theDirection, opt1, opt2, opt3);
                };
            });
        }
        var FOUR_DIRECTIONS = [
            'left',
            'right',
            'up',
            'down'
        ], IN_OUT = [
            'in',
            'out'
        ];
        createEffect('slideIn', {
            directions: FOUR_DIRECTIONS,
            divisor: function (value) {
                this.options.divisor = value;
                return this;
            },
            prepare: function (start, end) {
                var that = this, tmp, element = that.element, direction = directions[that._direction], offset = -direction.modifier * (direction.vertical ? element.outerHeight() : element.outerWidth()), startValue = offset / (that.options && that.options.divisor || 1) + PX, endValue = '0px';
                if (that._reverse) {
                    tmp = start;
                    start = end;
                    end = tmp;
                }
                if (transforms) {
                    start[direction.transition] = startValue;
                    end[direction.transition] = endValue;
                } else {
                    start[direction.property] = startValue;
                    end[direction.property] = endValue;
                }
            }
        });
        createEffect('tile', {
            directions: FOUR_DIRECTIONS,
            init: function (element, direction, previous) {
                Effect.prototype.init.call(this, element, direction);
                this.options = { previous: previous };
            },
            previousDivisor: function (value) {
                this.options.previousDivisor = value;
                return this;
            },
            children: function () {
                var that = this, reverse = that._reverse, previous = that.options.previous, divisor = that.options.previousDivisor || 1, dir = that._direction;
                var children = [kendo.fx(that.element).slideIn(dir).setReverse(reverse)];
                if (previous) {
                    children.push(kendo.fx(previous).slideIn(directions[dir].reverse).divisor(divisor).setReverse(!reverse));
                }
                return children;
            }
        });
        function createToggleEffect(name, property, defaultStart, defaultEnd) {
            createEffect(name, {
                directions: IN_OUT,
                startValue: function (value) {
                    this._startValue = value;
                    return this;
                },
                endValue: function (value) {
                    this._endValue = value;
                    return this;
                },
                shouldHide: function () {
                    return this._shouldHide;
                },
                prepare: function (start, end) {
                    var that = this, startValue, endValue, out = this._direction === 'out', startDataValue = that.element.data(property), startDataValueIsSet = !(isNaN(startDataValue) || startDataValue == defaultStart);
                    if (startDataValueIsSet) {
                        startValue = startDataValue;
                    } else if (typeof this._startValue !== 'undefined') {
                        startValue = this._startValue;
                    } else {
                        startValue = out ? defaultStart : defaultEnd;
                    }
                    if (typeof this._endValue !== 'undefined') {
                        endValue = this._endValue;
                    } else {
                        endValue = out ? defaultEnd : defaultStart;
                    }
                    if (this._reverse) {
                        start[property] = endValue;
                        end[property] = startValue;
                    } else {
                        start[property] = startValue;
                        end[property] = endValue;
                    }
                    that._shouldHide = end[property] === defaultEnd;
                }
            });
        }
        createToggleEffect('fade', 'opacity', 1, 0);
        createToggleEffect('zoom', 'scale', 1, 0.01);
        createEffect('slideMargin', {
            prepare: function (start, end) {
                var that = this, element = that.element, options = that.options, origin = element.data(ORIGIN), offset = options.offset, margin, reverse = that._reverse;
                if (!reverse && origin === null) {
                    element.data(ORIGIN, parseFloat(element.css('margin-' + options.axis)));
                }
                margin = element.data(ORIGIN) || 0;
                end['margin-' + options.axis] = !reverse ? margin + offset : margin;
            }
        });
        createEffect('slideTo', {
            prepare: function (start, end) {
                var that = this, element = that.element, options = that.options, offset = options.offset.split(','), reverse = that._reverse;
                if (transforms) {
                    end.translatex = !reverse ? offset[0] : 0;
                    end.translatey = !reverse ? offset[1] : 0;
                } else {
                    end.left = !reverse ? offset[0] : 0;
                    end.top = !reverse ? offset[1] : 0;
                }
                element.css('left');
            }
        });
        createEffect('expand', {
            directions: [
                'horizontal',
                'vertical'
            ],
            restore: [OVERFLOW],
            prepare: function (start, end) {
                var that = this, element = that.element, options = that.options, reverse = that._reverse, property = that._direction === 'vertical' ? HEIGHT : WIDTH, setLength = element[0].style[property], oldLength = element.data(property), length = parseFloat(oldLength || setLength), realLength = round(element.css(property, AUTO)[property]());
                start.overflow = HIDDEN;
                length = options && options.reset ? realLength || length : length || realLength;
                end[property] = (reverse ? 0 : length) + PX;
                start[property] = (reverse ? length : 0) + PX;
                if (oldLength === undefined) {
                    element.data(property, setLength);
                }
            },
            shouldHide: function () {
                return this._reverse;
            },
            teardown: function () {
                var that = this, element = that.element, property = that._direction === 'vertical' ? HEIGHT : WIDTH, length = element.data(property);
                if (length == AUTO || length === BLANK) {
                    setTimeout(function () {
                        element.css(property, AUTO).css(property);
                    }, 0);
                }
            }
        });
        var TRANSFER_START_STATE = {
            position: 'absolute',
            marginLeft: 0,
            marginTop: 0,
            scale: 1
        };
        createEffect('transfer', {
            init: function (element, target) {
                this.element = element;
                this.options = { target: target };
                this.restore = [];
            },
            setup: function () {
                this.element.appendTo(document.body);
            },
            prepare: function (start, end) {
                var that = this, element = that.element, outerBox = fx.box(element), innerBox = fx.box(that.options.target), currentScale = animationProperty(element, 'scale'), scale = fx.fillScale(innerBox, outerBox), transformOrigin = fx.transformOrigin(innerBox, outerBox);
                extend(start, TRANSFER_START_STATE);
                end.scale = 1;
                element.css(TRANSFORM, 'scale(1)').css(TRANSFORM);
                element.css(TRANSFORM, 'scale(' + currentScale + ')');
                start.top = outerBox.top;
                start.left = outerBox.left;
                start.transformOrigin = transformOrigin.x + PX + ' ' + transformOrigin.y + PX;
                if (that._reverse) {
                    start.scale = scale;
                } else {
                    end.scale = scale;
                }
            }
        });
        var CLIPS = {
            top: 'rect(auto auto $size auto)',
            bottom: 'rect($size auto auto auto)',
            left: 'rect(auto $size auto auto)',
            right: 'rect(auto auto auto $size)'
        };
        var ROTATIONS = {
            top: {
                start: 'rotatex(0deg)',
                end: 'rotatex(180deg)'
            },
            bottom: {
                start: 'rotatex(-180deg)',
                end: 'rotatex(0deg)'
            },
            left: {
                start: 'rotatey(0deg)',
                end: 'rotatey(-180deg)'
            },
            right: {
                start: 'rotatey(180deg)',
                end: 'rotatey(0deg)'
            }
        };
        function clipInHalf(container, direction) {
            var vertical = kendo.directions[direction].vertical, size = container[vertical ? HEIGHT : WIDTH]() / 2 + 'px';
            return CLIPS[direction].replace('$size', size);
        }
        createEffect('turningPage', {
            directions: FOUR_DIRECTIONS,
            init: function (element, direction, container) {
                Effect.prototype.init.call(this, element, direction);
                this._container = container;
            },
            prepare: function (start, end) {
                var that = this, reverse = that._reverse, direction = reverse ? directions[that._direction].reverse : that._direction, rotation = ROTATIONS[direction];
                start.zIndex = 1;
                if (that._clipInHalf) {
                    start.clip = clipInHalf(that._container, kendo.directions[direction].reverse);
                }
                start[BACKFACE] = HIDDEN;
                end[TRANSFORM] = TRANSFORM_PERSPECTIVE + (reverse ? rotation.start : rotation.end);
                start[TRANSFORM] = TRANSFORM_PERSPECTIVE + (reverse ? rotation.end : rotation.start);
            },
            setup: function () {
                this._container.append(this.element);
            },
            face: function (value) {
                this._face = value;
                return this;
            },
            shouldHide: function () {
                var that = this, reverse = that._reverse, face = that._face;
                return reverse && !face || !reverse && face;
            },
            clipInHalf: function (value) {
                this._clipInHalf = value;
                return this;
            },
            temporary: function () {
                this.element.addClass('temp-page');
                return this;
            }
        });
        createEffect('staticPage', {
            directions: FOUR_DIRECTIONS,
            init: function (element, direction, container) {
                Effect.prototype.init.call(this, element, direction);
                this._container = container;
            },
            restore: ['clip'],
            prepare: function (start, end) {
                var that = this, direction = that._reverse ? directions[that._direction].reverse : that._direction;
                start.clip = clipInHalf(that._container, direction);
                start.opacity = 0.999;
                end.opacity = 1;
            },
            shouldHide: function () {
                var that = this, reverse = that._reverse, face = that._face;
                return reverse && !face || !reverse && face;
            },
            face: function (value) {
                this._face = value;
                return this;
            }
        });
        createEffect('pageturn', {
            directions: [
                'horizontal',
                'vertical'
            ],
            init: function (element, direction, face, back) {
                Effect.prototype.init.call(this, element, direction);
                this.options = {};
                this.options.face = face;
                this.options.back = back;
            },
            children: function () {
                var that = this, options = that.options, direction = that._direction === 'horizontal' ? 'left' : 'top', reverseDirection = kendo.directions[direction].reverse, reverse = that._reverse, temp, faceClone = options.face.clone(true).removeAttr('id'), backClone = options.back.clone(true).removeAttr('id'), element = that.element;
                if (reverse) {
                    temp = direction;
                    direction = reverseDirection;
                    reverseDirection = temp;
                }
                return [
                    kendo.fx(options.face).staticPage(direction, element).face(true).setReverse(reverse),
                    kendo.fx(options.back).staticPage(reverseDirection, element).setReverse(reverse),
                    kendo.fx(faceClone).turningPage(direction, element).face(true).clipInHalf(true).temporary().setReverse(reverse),
                    kendo.fx(backClone).turningPage(reverseDirection, element).clipInHalf(true).temporary().setReverse(reverse)
                ];
            },
            prepare: function (start, end) {
                start[PERSPECTIVE] = DEFAULT_PERSPECTIVE;
                start.transformStyle = 'preserve-3d';
                start.opacity = 0.999;
                end.opacity = 1;
            },
            teardown: function () {
                this.element.find('.temp-page').remove();
            }
        });
        createEffect('flip', {
            directions: [
                'horizontal',
                'vertical'
            ],
            init: function (element, direction, face, back) {
                Effect.prototype.init.call(this, element, direction);
                this.options = {};
                this.options.face = face;
                this.options.back = back;
            },
            children: function () {
                var that = this, options = that.options, direction = that._direction === 'horizontal' ? 'left' : 'top', reverseDirection = kendo.directions[direction].reverse, reverse = that._reverse, temp, element = that.element;
                if (reverse) {
                    temp = direction;
                    direction = reverseDirection;
                    reverseDirection = temp;
                }
                return [
                    kendo.fx(options.face).turningPage(direction, element).face(true).setReverse(reverse),
                    kendo.fx(options.back).turningPage(reverseDirection, element).setReverse(reverse)
                ];
            },
            prepare: function (start) {
                start[PERSPECTIVE] = DEFAULT_PERSPECTIVE;
                start.transformStyle = 'preserve-3d';
            }
        });
        var RESTORE_OVERFLOW = !support.mobileOS.android;
        var IGNORE_TRANSITION_EVENT_SELECTOR = '.km-touch-scrollbar, .km-actionsheet-wrapper';
        createEffect('replace', {
            _before: $.noop,
            _after: $.noop,
            init: function (element, previous, transitionClass) {
                Effect.prototype.init.call(this, element);
                this._previous = $(previous);
                this._transitionClass = transitionClass;
            },
            duration: function () {
                throw new Error('The replace effect does not support duration setting; the effect duration may be customized through the transition class rule');
            },
            beforeTransition: function (callback) {
                this._before = callback;
                return this;
            },
            afterTransition: function (callback) {
                this._after = callback;
                return this;
            },
            _both: function () {
                return $().add(this._element).add(this._previous);
            },
            _containerClass: function () {
                var direction = this._direction, containerClass = 'k-fx k-fx-start k-fx-' + this._transitionClass;
                if (direction) {
                    containerClass += ' k-fx-' + direction;
                }
                if (this._reverse) {
                    containerClass += ' k-fx-reverse';
                }
                return containerClass;
            },
            complete: function (e) {
                if (!this.deferred || e && $(e.target).is(IGNORE_TRANSITION_EVENT_SELECTOR)) {
                    return;
                }
                var container = this.container;
                container.removeClass('k-fx-end').removeClass(this._containerClass()).off(transitions.event, this.completeProxy);
                this._previous.hide().removeClass('k-fx-current');
                this.element.removeClass('k-fx-next');
                if (RESTORE_OVERFLOW) {
                    container.css(OVERFLOW, '');
                }
                if (!this.isAbsolute) {
                    this._both().css(POSITION, '');
                }
                this.deferred.resolve();
                delete this.deferred;
            },
            run: function () {
                if (this._additionalEffects && this._additionalEffects[0]) {
                    return this.compositeRun();
                }
                var that = this, element = that.element, previous = that._previous, container = element.parents().filter(previous.parents()).first(), both = that._both(), deferred = $.Deferred(), originalPosition = element.css(POSITION), originalOverflow;
                if (!container.length) {
                    container = element.parent();
                }
                this.container = container;
                this.deferred = deferred;
                this.isAbsolute = originalPosition == 'absolute';
                if (!this.isAbsolute) {
                    both.css(POSITION, 'absolute');
                }
                if (RESTORE_OVERFLOW) {
                    originalOverflow = container.css(OVERFLOW);
                    container.css(OVERFLOW, 'hidden');
                }
                if (!transitions) {
                    this.complete();
                } else {
                    element.addClass('k-fx-hidden');
                    container.addClass(this._containerClass());
                    this.completeProxy = $.proxy(this, 'complete');
                    container.on(transitions.event, this.completeProxy);
                    kendo.animationFrame(function () {
                        element.removeClass('k-fx-hidden').addClass('k-fx-next');
                        previous.css('display', '').addClass('k-fx-current');
                        that._before(previous, element);
                        kendo.animationFrame(function () {
                            container.removeClass('k-fx-start').addClass('k-fx-end');
                            that._after(previous, element);
                        });
                    });
                }
                return deferred.promise();
            },
            stop: function () {
                this.complete();
            }
        });
        var Animation = kendo.Class.extend({
            init: function () {
                var that = this;
                that._tickProxy = proxy(that._tick, that);
                that._started = false;
            },
            tick: $.noop,
            done: $.noop,
            onEnd: $.noop,
            onCancel: $.noop,
            start: function () {
                if (!this.enabled()) {
                    return;
                }
                if (!this.done()) {
                    this._started = true;
                    kendo.animationFrame(this._tickProxy);
                } else {
                    this.onEnd();
                }
            },
            enabled: function () {
                return true;
            },
            cancel: function () {
                this._started = false;
                this.onCancel();
            },
            _tick: function () {
                var that = this;
                if (!that._started) {
                    return;
                }
                that.tick();
                if (!that.done()) {
                    kendo.animationFrame(that._tickProxy);
                } else {
                    that._started = false;
                    that.onEnd();
                }
            }
        });
        var Transition = Animation.extend({
            init: function (options) {
                var that = this;
                extend(that, options);
                Animation.fn.init.call(that);
            },
            done: function () {
                return this.timePassed() >= this.duration;
            },
            timePassed: function () {
                return Math.min(this.duration, new Date() - this.startDate);
            },
            moveTo: function (options) {
                var that = this, movable = that.movable;
                that.initial = movable[that.axis];
                that.delta = options.location - that.initial;
                that.duration = typeof options.duration == 'number' ? options.duration : 300;
                that.tick = that._easeProxy(options.ease);
                that.startDate = new Date();
                that.start();
            },
            _easeProxy: function (ease) {
                var that = this;
                return function () {
                    that.movable.moveAxis(that.axis, ease(that.timePassed(), that.initial, that.delta, that.duration));
                };
            }
        });
        extend(Transition, {
            easeOutExpo: function (t, b, c, d) {
                return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
            },
            easeOutBack: function (t, b, c, d, s) {
                s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            }
        });
        fx.Animation = Animation;
        fx.Transition = Transition;
        fx.createEffect = createEffect;
        fx.box = function (element) {
            element = $(element);
            var result = element.offset();
            result.width = element.outerWidth();
            result.height = element.outerHeight();
            return result;
        };
        fx.transformOrigin = function (inner, outer) {
            var x = (inner.left - outer.left) * outer.width / (outer.width - inner.width), y = (inner.top - outer.top) * outer.height / (outer.height - inner.height);
            return {
                x: isNaN(x) ? 0 : x,
                y: isNaN(y) ? 0 : y
            };
        };
        fx.fillScale = function (inner, outer) {
            return Math.min(inner.width / outer.width, inner.height / outer.height);
        };
        fx.fitScale = function (inner, outer) {
            return Math.max(inner.width / outer.width, inner.height / outer.height);
        };
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));

/** 
 * Copyright 2016 Telerik AD                                                                                                                                                                            
 *                                                                                                                                                                                                      
 * Licensed under the Apache License, Version 2.0 (the "License");                                                                                                                                      
 * you may not use this file except in compliance with the License.                                                                                                                                     
 * You may obtain a copy of the License at                                                                                                                                                              
 *                                                                                                                                                                                                      
 *     http://www.apache.org/licenses/LICENSE-2.0                                                                                                                                                       
 *                                                                                                                                                                                                      
 * Unless required by applicable law or agreed to in writing, software                                                                                                                                  
 * distributed under the License is distributed on an "AS IS" BASIS,                                                                                                                                    
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.                                                                                                                             
 * See the License for the specific language governing permissions and                                                                                                                                  
 * limitations under the License.                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.userevents', ['kendo.core'], f);
}(function () {
    var __meta__ = {
        id: 'userevents',
        name: 'User Events',
        category: 'framework',
        depends: ['core'],
        hidden: true
    };
    (function ($, undefined) {
        var kendo = window.kendo, support = kendo.support, document = window.document, Class = kendo.Class, Observable = kendo.Observable, now = $.now, extend = $.extend, OS = support.mobileOS, invalidZeroEvents = OS && OS.android, DEFAULT_MIN_HOLD = 800, DEFAULT_THRESHOLD = support.browser.msie ? 5 : 0, PRESS = 'press', HOLD = 'hold', SELECT = 'select', START = 'start', MOVE = 'move', END = 'end', CANCEL = 'cancel', TAP = 'tap', RELEASE = 'release', GESTURESTART = 'gesturestart', GESTURECHANGE = 'gesturechange', GESTUREEND = 'gestureend', GESTURETAP = 'gesturetap';
        var THRESHOLD = {
            'api': 0,
            'touch': 0,
            'mouse': 9,
            'pointer': 9
        };
        var ENABLE_GLOBAL_SURFACE = !support.touch || support.mouseAndTouchPresent;
        function touchDelta(touch1, touch2) {
            var x1 = touch1.x.location, y1 = touch1.y.location, x2 = touch2.x.location, y2 = touch2.y.location, dx = x1 - x2, dy = y1 - y2;
            return {
                center: {
                    x: (x1 + x2) / 2,
                    y: (y1 + y2) / 2
                },
                distance: Math.sqrt(dx * dx + dy * dy)
            };
        }
        function getTouches(e) {
            var touches = [], originalEvent = e.originalEvent, currentTarget = e.currentTarget, idx = 0, length, changedTouches, touch;
            if (e.api) {
                touches.push({
                    id: 2,
                    event: e,
                    target: e.target,
                    currentTarget: e.target,
                    location: e,
                    type: 'api'
                });
            } else if (e.type.match(/touch/)) {
                changedTouches = originalEvent ? originalEvent.changedTouches : [];
                for (length = changedTouches.length; idx < length; idx++) {
                    touch = changedTouches[idx];
                    touches.push({
                        location: touch,
                        event: e,
                        target: touch.target,
                        currentTarget: currentTarget,
                        id: touch.identifier,
                        type: 'touch'
                    });
                }
            } else if (support.pointers || support.msPointers) {
                touches.push({
                    location: originalEvent,
                    event: e,
                    target: e.target,
                    currentTarget: currentTarget,
                    id: originalEvent.pointerId,
                    type: 'pointer'
                });
            } else {
                touches.push({
                    id: 1,
                    event: e,
                    target: e.target,
                    currentTarget: currentTarget,
                    location: e,
                    type: 'mouse'
                });
            }
            return touches;
        }
        var TouchAxis = Class.extend({
            init: function (axis, location) {
                var that = this;
                that.axis = axis;
                that._updateLocationData(location);
                that.startLocation = that.location;
                that.velocity = that.delta = 0;
                that.timeStamp = now();
            },
            move: function (location) {
                var that = this, offset = location['page' + that.axis], timeStamp = now(), timeDelta = timeStamp - that.timeStamp || 1;
                if (!offset && invalidZeroEvents) {
                    return;
                }
                that.delta = offset - that.location;
                that._updateLocationData(location);
                that.initialDelta = offset - that.startLocation;
                that.velocity = that.delta / timeDelta;
                that.timeStamp = timeStamp;
            },
            _updateLocationData: function (location) {
                var that = this, axis = that.axis;
                that.location = location['page' + axis];
                that.client = location['client' + axis];
                that.screen = location['screen' + axis];
            }
        });
        var Touch = Class.extend({
            init: function (userEvents, target, touchInfo) {
                extend(this, {
                    x: new TouchAxis('X', touchInfo.location),
                    y: new TouchAxis('Y', touchInfo.location),
                    type: touchInfo.type,
                    useClickAsTap: userEvents.useClickAsTap,
                    threshold: userEvents.threshold || THRESHOLD[touchInfo.type],
                    userEvents: userEvents,
                    target: target,
                    currentTarget: touchInfo.currentTarget,
                    initialTouch: touchInfo.target,
                    id: touchInfo.id,
                    pressEvent: touchInfo,
                    _moved: false,
                    _finished: false
                });
            },
            press: function () {
                this._holdTimeout = setTimeout($.proxy(this, '_hold'), this.userEvents.minHold);
                this._trigger(PRESS, this.pressEvent);
            },
            _hold: function () {
                this._trigger(HOLD, this.pressEvent);
            },
            move: function (touchInfo) {
                var that = this;
                if (that._finished) {
                    return;
                }
                that.x.move(touchInfo.location);
                that.y.move(touchInfo.location);
                if (!that._moved) {
                    if (that._withinIgnoreThreshold()) {
                        return;
                    }
                    if (!UserEvents.current || UserEvents.current === that.userEvents) {
                        that._start(touchInfo);
                    } else {
                        return that.dispose();
                    }
                }
                if (!that._finished) {
                    that._trigger(MOVE, touchInfo);
                }
            },
            end: function (touchInfo) {
                this.endTime = now();
                if (this._finished) {
                    return;
                }
                this._finished = true;
                this._trigger(RELEASE, touchInfo);
                if (this._moved) {
                    this._trigger(END, touchInfo);
                } else {
                    if (!this.useClickAsTap) {
                        this._trigger(TAP, touchInfo);
                    }
                }
                clearTimeout(this._holdTimeout);
                this.dispose();
            },
            dispose: function () {
                var userEvents = this.userEvents, activeTouches = userEvents.touches;
                this._finished = true;
                this.pressEvent = null;
                clearTimeout(this._holdTimeout);
                activeTouches.splice($.inArray(this, activeTouches), 1);
            },
            skip: function () {
                this.dispose();
            },
            cancel: function () {
                this.dispose();
            },
            isMoved: function () {
                return this._moved;
            },
            _start: function (touchInfo) {
                clearTimeout(this._holdTimeout);
                this.startTime = now();
                this._moved = true;
                this._trigger(START, touchInfo);
            },
            _trigger: function (name, touchInfo) {
                var that = this, jQueryEvent = touchInfo.event, data = {
                    touch: that,
                    x: that.x,
                    y: that.y,
                    target: that.target,
                    event: jQueryEvent
                };
                if (that.userEvents.notify(name, data)) {
                    jQueryEvent.preventDefault();
                }
            },
            _withinIgnoreThreshold: function () {
                var xDelta = this.x.initialDelta, yDelta = this.y.initialDelta;
                return Math.sqrt(xDelta * xDelta + yDelta * yDelta) <= this.threshold;
            }
        });
        function withEachUpEvent(callback) {
            var downEvents = kendo.eventMap.up.split(' '), idx = 0, length = downEvents.length;
            for (; idx < length; idx++) {
                callback(downEvents[idx]);
            }
        }
        var UserEvents = Observable.extend({
            init: function (element, options) {
                var that = this, filter, ns = kendo.guid();
                options = options || {};
                filter = that.filter = options.filter;
                that.threshold = options.threshold || DEFAULT_THRESHOLD;
                that.minHold = options.minHold || DEFAULT_MIN_HOLD;
                that.touches = [];
                that._maxTouches = options.multiTouch ? 2 : 1;
                that.allowSelection = options.allowSelection;
                that.captureUpIfMoved = options.captureUpIfMoved;
                that.useClickAsTap = !options.fastTap && !support.delayedClick();
                that.eventNS = ns;
                element = $(element).handler(that);
                Observable.fn.init.call(that);
                extend(that, {
                    element: element,
                    surface: options.global && ENABLE_GLOBAL_SURFACE ? $(document.documentElement) : $(options.surface || element),
                    stopPropagation: options.stopPropagation,
                    pressed: false
                });
                that.surface.handler(that).on(kendo.applyEventMap('move', ns), '_move').on(kendo.applyEventMap('up cancel', ns), '_end');
                element.on(kendo.applyEventMap('down', ns), filter, '_start');
                if (that.useClickAsTap) {
                    element.on(kendo.applyEventMap('click', ns), filter, '_click');
                }
                if (support.pointers || support.msPointers) {
                    if (support.browser.version < 11) {
                        element.css('-ms-touch-action', 'pinch-zoom double-tap-zoom');
                    } else {
                        element.css('touch-action', 'pan-y');
                    }
                }
                if (options.preventDragEvent) {
                    element.on(kendo.applyEventMap('dragstart', ns), kendo.preventDefault);
                }
                element.on(kendo.applyEventMap('mousedown', ns), filter, { root: element }, '_select');
                if (that.captureUpIfMoved && support.eventCapture) {
                    var surfaceElement = that.surface[0], preventIfMovingProxy = $.proxy(that.preventIfMoving, that);
                    withEachUpEvent(function (eventName) {
                        surfaceElement.addEventListener(eventName, preventIfMovingProxy, true);
                    });
                }
                that.bind([
                    PRESS,
                    HOLD,
                    TAP,
                    START,
                    MOVE,
                    END,
                    RELEASE,
                    CANCEL,
                    GESTURESTART,
                    GESTURECHANGE,
                    GESTUREEND,
                    GESTURETAP,
                    SELECT
                ], options);
            },
            preventIfMoving: function (e) {
                if (this._isMoved()) {
                    e.preventDefault();
                }
            },
            destroy: function () {
                var that = this;
                if (that._destroyed) {
                    return;
                }
                that._destroyed = true;
                if (that.captureUpIfMoved && support.eventCapture) {
                    var surfaceElement = that.surface[0];
                    withEachUpEvent(function (eventName) {
                        surfaceElement.removeEventListener(eventName, that.preventIfMoving);
                    });
                }
                that.element.kendoDestroy(that.eventNS);
                that.surface.kendoDestroy(that.eventNS);
                that.element.removeData('handler');
                that.surface.removeData('handler');
                that._disposeAll();
                that.unbind();
                delete that.surface;
                delete that.element;
                delete that.currentTarget;
            },
            capture: function () {
                UserEvents.current = this;
            },
            cancel: function () {
                this._disposeAll();
                this.trigger(CANCEL);
            },
            notify: function (eventName, data) {
                var that = this, touches = that.touches;
                if (this._isMultiTouch()) {
                    switch (eventName) {
                        case MOVE:
                            eventName = GESTURECHANGE;
                            break;
                        case END:
                            eventName = GESTUREEND;
                            break;
                        case TAP:
                            eventName = GESTURETAP;
                            break;
                    }
                    extend(data, { touches: touches }, touchDelta(touches[0], touches[1]));
                }
                return this.trigger(eventName, extend(data, { type: eventName }));
            },
            press: function (x, y, target) {
                this._apiCall('_start', x, y, target);
            },
            move: function (x, y) {
                this._apiCall('_move', x, y);
            },
            end: function (x, y) {
                this._apiCall('_end', x, y);
            },
            _isMultiTouch: function () {
                return this.touches.length > 1;
            },
            _maxTouchesReached: function () {
                return this.touches.length >= this._maxTouches;
            },
            _disposeAll: function () {
                var touches = this.touches;
                while (touches.length > 0) {
                    touches.pop().dispose();
                }
            },
            _isMoved: function () {
                return $.grep(this.touches, function (touch) {
                    return touch.isMoved();
                }).length;
            },
            _select: function (e) {
                if (!this.allowSelection || this.trigger(SELECT, { event: e })) {
                    e.preventDefault();
                }
            },
            _start: function (e) {
                var that = this, idx = 0, filter = that.filter, target, touches = getTouches(e), length = touches.length, touch, which = e.which;
                if (which && which > 1 || that._maxTouchesReached()) {
                    return;
                }
                UserEvents.current = null;
                that.currentTarget = e.currentTarget;
                if (that.stopPropagation) {
                    e.stopPropagation();
                }
                for (; idx < length; idx++) {
                    if (that._maxTouchesReached()) {
                        break;
                    }
                    touch = touches[idx];
                    if (filter) {
                        target = $(touch.currentTarget);
                    } else {
                        target = that.element;
                    }
                    if (!target.length) {
                        continue;
                    }
                    touch = new Touch(that, target, touch);
                    that.touches.push(touch);
                    touch.press();
                    if (that._isMultiTouch()) {
                        that.notify('gesturestart', {});
                    }
                }
            },
            _move: function (e) {
                this._eachTouch('move', e);
            },
            _end: function (e) {
                this._eachTouch('end', e);
            },
            _click: function (e) {
                var data = {
                    touch: {
                        initialTouch: e.target,
                        target: $(e.currentTarget),
                        endTime: now(),
                        x: {
                            location: e.pageX,
                            client: e.clientX
                        },
                        y: {
                            location: e.pageY,
                            client: e.clientY
                        }
                    },
                    x: e.pageX,
                    y: e.pageY,
                    target: $(e.currentTarget),
                    event: e,
                    type: 'tap'
                };
                if (this.trigger('tap', data)) {
                    e.preventDefault();
                }
            },
            _eachTouch: function (methodName, e) {
                var that = this, dict = {}, touches = getTouches(e), activeTouches = that.touches, idx, touch, touchInfo, matchingTouch;
                for (idx = 0; idx < activeTouches.length; idx++) {
                    touch = activeTouches[idx];
                    dict[touch.id] = touch;
                }
                for (idx = 0; idx < touches.length; idx++) {
                    touchInfo = touches[idx];
                    matchingTouch = dict[touchInfo.id];
                    if (matchingTouch) {
                        matchingTouch[methodName](touchInfo);
                    }
                }
            },
            _apiCall: function (type, x, y, target) {
                this[type]({
                    api: true,
                    pageX: x,
                    pageY: y,
                    clientX: x,
                    clientY: y,
                    target: $(target || this.element)[0],
                    stopPropagation: $.noop,
                    preventDefault: $.noop
                });
            }
        });
        UserEvents.defaultThreshold = function (value) {
            DEFAULT_THRESHOLD = value;
        };
        UserEvents.minHold = function (value) {
            DEFAULT_MIN_HOLD = value;
        };
        kendo.getTouches = getTouches;
        kendo.touchDelta = touchDelta;
        kendo.UserEvents = UserEvents;
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
/** 
 * Copyright 2016 Telerik AD                                                                                                                                                                            
 *                                                                                                                                                                                                      
 * Licensed under the Apache License, Version 2.0 (the "License");                                                                                                                                      
 * you may not use this file except in compliance with the License.                                                                                                                                     
 * You may obtain a copy of the License at                                                                                                                                                              
 *                                                                                                                                                                                                      
 *     http://www.apache.org/licenses/LICENSE-2.0                                                                                                                                                       
 *                                                                                                                                                                                                      
 * Unless required by applicable law or agreed to in writing, software                                                                                                                                  
 * distributed under the License is distributed on an "AS IS" BASIS,                                                                                                                                    
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.                                                                                                                             
 * See the License for the specific language governing permissions and                                                                                                                                  
 * limitations under the License.                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.draganddrop', [
        'kendo.core',
        'kendo.userevents'
    ], f);
}(function () {
    var __meta__ = {
        id: 'draganddrop',
        name: 'Drag & drop',
        category: 'framework',
        description: 'Drag & drop functionality for any DOM element.',
        depends: [
            'core',
            'userevents'
        ]
    };
    (function ($, undefined) {
        var kendo = window.kendo, support = kendo.support, document = window.document, $window = $(window), Class = kendo.Class, Widget = kendo.ui.Widget, Observable = kendo.Observable, UserEvents = kendo.UserEvents, proxy = $.proxy, extend = $.extend, getOffset = kendo.getOffset, draggables = {}, dropTargets = {}, dropAreas = {}, lastDropTarget, elementUnderCursor = kendo.elementUnderCursor, KEYUP = 'keyup', CHANGE = 'change', DRAGSTART = 'dragstart', HOLD = 'hold', DRAG = 'drag', DRAGEND = 'dragend', DRAGCANCEL = 'dragcancel', HINTDESTROYED = 'hintDestroyed', DRAGENTER = 'dragenter', DRAGLEAVE = 'dragleave', DROP = 'drop';
        function contains(parent, child) {
            try {
                return $.contains(parent, child) || parent == child;
            } catch (e) {
                return false;
            }
        }
        function numericCssPropery(element, property) {
            return parseInt(element.css(property), 10) || 0;
        }
        function within(value, range) {
            return Math.min(Math.max(value, range.min), range.max);
        }
        function containerBoundaries(container, element) {
            var offset = getOffset(container), minX = offset.left + numericCssPropery(container, 'borderLeftWidth') + numericCssPropery(container, 'paddingLeft'), minY = offset.top + numericCssPropery(container, 'borderTopWidth') + numericCssPropery(container, 'paddingTop'), maxX = minX + container.width() - element.outerWidth(true), maxY = minY + container.height() - element.outerHeight(true);
            return {
                x: {
                    min: minX,
                    max: maxX
                },
                y: {
                    min: minY,
                    max: maxY
                }
            };
        }
        function checkTarget(target, targets, areas) {
            var theTarget, theFilter, i = 0, targetLen = targets && targets.length, areaLen = areas && areas.length;
            while (target && target.parentNode) {
                for (i = 0; i < targetLen; i++) {
                    theTarget = targets[i];
                    if (theTarget.element[0] === target) {
                        return {
                            target: theTarget,
                            targetElement: target
                        };
                    }
                }
                for (i = 0; i < areaLen; i++) {
                    theFilter = areas[i];
                    if ($.contains(theFilter.element[0], target) && support.matchesSelector.call(target, theFilter.options.filter)) {
                        return {
                            target: theFilter,
                            targetElement: target
                        };
                    }
                }
                target = target.parentNode;
            }
            return undefined;
        }
        var TapCapture = Observable.extend({
            init: function (element, options) {
                var that = this, domElement = element[0];
                that.capture = false;
                if (domElement.addEventListener) {
                    $.each(kendo.eventMap.down.split(' '), function () {
                        domElement.addEventListener(this, proxy(that._press, that), true);
                    });
                    $.each(kendo.eventMap.up.split(' '), function () {
                        domElement.addEventListener(this, proxy(that._release, that), true);
                    });
                } else {
                    $.each(kendo.eventMap.down.split(' '), function () {
                        domElement.attachEvent(this, proxy(that._press, that));
                    });
                    $.each(kendo.eventMap.up.split(' '), function () {
                        domElement.attachEvent(this, proxy(that._release, that));
                    });
                }
                Observable.fn.init.call(that);
                that.bind([
                    'press',
                    'release'
                ], options || {});
            },
            captureNext: function () {
                this.capture = true;
            },
            cancelCapture: function () {
                this.capture = false;
            },
            _press: function (e) {
                var that = this;
                that.trigger('press');
                if (that.capture) {
                    e.preventDefault();
                }
            },
            _release: function (e) {
                var that = this;
                that.trigger('release');
                if (that.capture) {
                    e.preventDefault();
                    that.cancelCapture();
                }
            }
        });
        var PaneDimension = Observable.extend({
            init: function (options) {
                var that = this;
                Observable.fn.init.call(that);
                that.forcedEnabled = false;
                $.extend(that, options);
                that.scale = 1;
                if (that.horizontal) {
                    that.measure = 'offsetWidth';
                    that.scrollSize = 'scrollWidth';
                    that.axis = 'x';
                } else {
                    that.measure = 'offsetHeight';
                    that.scrollSize = 'scrollHeight';
                    that.axis = 'y';
                }
            },
            makeVirtual: function () {
                $.extend(this, {
                    virtual: true,
                    forcedEnabled: true,
                    _virtualMin: 0,
                    _virtualMax: 0
                });
            },
            virtualSize: function (min, max) {
                if (this._virtualMin !== min || this._virtualMax !== max) {
                    this._virtualMin = min;
                    this._virtualMax = max;
                    this.update();
                }
            },
            outOfBounds: function (offset) {
                return offset > this.max || offset < this.min;
            },
            forceEnabled: function () {
                this.forcedEnabled = true;
            },
            getSize: function () {
                return this.container[0][this.measure];
            },
            getTotal: function () {
                return this.element[0][this.scrollSize];
            },
            rescale: function (scale) {
                this.scale = scale;
            },
            update: function (silent) {
                var that = this, total = that.virtual ? that._virtualMax : that.getTotal(), scaledTotal = total * that.scale, size = that.getSize();
                if (total === 0 && !that.forcedEnabled) {
                    return;
                }
                that.max = that.virtual ? -that._virtualMin : 0;
                that.size = size;
                that.total = scaledTotal;
                that.min = Math.min(that.max, size - scaledTotal);
                that.minScale = size / total;
                that.centerOffset = (scaledTotal - size) / 2;
                that.enabled = that.forcedEnabled || scaledTotal > size;
                if (!silent) {
                    that.trigger(CHANGE, that);
                }
            }
        });
        var PaneDimensions = Observable.extend({
            init: function (options) {
                var that = this;
                Observable.fn.init.call(that);
                that.x = new PaneDimension(extend({ horizontal: true }, options));
                that.y = new PaneDimension(extend({ horizontal: false }, options));
                that.container = options.container;
                that.forcedMinScale = options.minScale;
                that.maxScale = options.maxScale || 100;
                that.bind(CHANGE, options);
            },
            rescale: function (newScale) {
                this.x.rescale(newScale);
                this.y.rescale(newScale);
                this.refresh();
            },
            centerCoordinates: function () {
                return {
                    x: Math.min(0, -this.x.centerOffset),
                    y: Math.min(0, -this.y.centerOffset)
                };
            },
            refresh: function () {
                var that = this;
                that.x.update();
                that.y.update();
                that.enabled = that.x.enabled || that.y.enabled;
                that.minScale = that.forcedMinScale || Math.min(that.x.minScale, that.y.minScale);
                that.fitScale = Math.max(that.x.minScale, that.y.minScale);
                that.trigger(CHANGE);
            }
        });
        var PaneAxis = Observable.extend({
            init: function (options) {
                var that = this;
                extend(that, options);
                Observable.fn.init.call(that);
            },
            outOfBounds: function () {
                return this.dimension.outOfBounds(this.movable[this.axis]);
            },
            dragMove: function (delta) {
                var that = this, dimension = that.dimension, axis = that.axis, movable = that.movable, position = movable[axis] + delta;
                if (!dimension.enabled) {
                    return;
                }
                if (position < dimension.min && delta < 0 || position > dimension.max && delta > 0) {
                    delta *= that.resistance;
                }
                movable.translateAxis(axis, delta);
                that.trigger(CHANGE, that);
            }
        });
        var Pane = Class.extend({
            init: function (options) {
                var that = this, x, y, resistance, movable;
                extend(that, { elastic: true }, options);
                resistance = that.elastic ? 0.5 : 0;
                movable = that.movable;
                that.x = x = new PaneAxis({
                    axis: 'x',
                    dimension: that.dimensions.x,
                    resistance: resistance,
                    movable: movable
                });
                that.y = y = new PaneAxis({
                    axis: 'y',
                    dimension: that.dimensions.y,
                    resistance: resistance,
                    movable: movable
                });
                that.userEvents.bind([
                    'press',
                    'move',
                    'end',
                    'gesturestart',
                    'gesturechange'
                ], {
                        gesturestart: function (e) {
                            that.gesture = e;
                            that.offset = that.dimensions.container.offset();
                        },
                        press: function (e) {
                            if ($(e.event.target).closest('a').is('[data-navigate-on-press=true]')) {
                                e.sender.cancel();
                            }
                        },
                        gesturechange: function (e) {
                            var previousGesture = that.gesture, previousCenter = previousGesture.center, center = e.center, scaleDelta = e.distance / previousGesture.distance, minScale = that.dimensions.minScale, maxScale = that.dimensions.maxScale, coordinates;
                            if (movable.scale <= minScale && scaleDelta < 1) {
                                scaleDelta += (1 - scaleDelta) * 0.8;
                            }
                            if (movable.scale * scaleDelta >= maxScale) {
                                scaleDelta = maxScale / movable.scale;
                            }
                            var offsetX = movable.x + that.offset.left, offsetY = movable.y + that.offset.top;
                            coordinates = {
                                x: (offsetX - previousCenter.x) * scaleDelta + center.x - offsetX,
                                y: (offsetY - previousCenter.y) * scaleDelta + center.y - offsetY
                            };
                            movable.scaleWith(scaleDelta);
                            x.dragMove(coordinates.x);
                            y.dragMove(coordinates.y);
                            that.dimensions.rescale(movable.scale);
                            that.gesture = e;
                            e.preventDefault();
                        },
                        move: function (e) {
                            if (e.event.target.tagName.match(/textarea|input/i)) {
                                return;
                            }
                            if (x.dimension.enabled || y.dimension.enabled) {
                                x.dragMove(e.x.delta);
                                y.dragMove(e.y.delta);
                                e.preventDefault();
                            } else {
                                e.touch.skip();
                            }
                        },
                        end: function (e) {
                            e.preventDefault();
                        }
                    });
            }
        });
        var TRANSFORM_STYLE = support.transitions.prefix + 'Transform', translate;
        if (support.hasHW3D) {
            translate = function (x, y, scale) {
                return 'translate3d(' + x + 'px,' + y + 'px,0) scale(' + scale + ')';
            };
        } else {
            translate = function (x, y, scale) {
                return 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
            };
        }
        var Movable = Observable.extend({
            init: function (element) {
                var that = this;
                Observable.fn.init.call(that);
                that.element = $(element);
                that.element[0].style.webkitTransformOrigin = 'left top';
                that.x = 0;
                that.y = 0;
                that.scale = 1;
                that._saveCoordinates(translate(that.x, that.y, that.scale));
            },
            translateAxis: function (axis, by) {
                this[axis] += by;
                this.refresh();
            },
            scaleTo: function (scale) {
                this.scale = scale;
                this.refresh();
            },
            scaleWith: function (scaleDelta) {
                this.scale *= scaleDelta;
                this.refresh();
            },
            translate: function (coordinates) {
                this.x += coordinates.x;
                this.y += coordinates.y;
                this.refresh();
            },
            moveAxis: function (axis, value) {
                this[axis] = value;
                this.refresh();
            },
            moveTo: function (coordinates) {
                extend(this, coordinates);
                this.refresh();
            },
            refresh: function () {
                var that = this, x = that.x, y = that.y, newCoordinates;
                if (that.round) {
                    x = Math.round(x);
                    y = Math.round(y);
                }
                newCoordinates = translate(x, y, that.scale);
                if (newCoordinates != that.coordinates) {
                    if (kendo.support.browser.msie && kendo.support.browser.version < 10) {
                        that.element[0].style.position = 'absolute';
                        that.element[0].style.left = that.x + 'px';
                        that.element[0].style.top = that.y + 'px';
                    } else {
                        that.element[0].style[TRANSFORM_STYLE] = newCoordinates;
                    }
                    that._saveCoordinates(newCoordinates);
                    that.trigger(CHANGE);
                }
            },
            _saveCoordinates: function (coordinates) {
                this.coordinates = coordinates;
            }
        });
        function destroyDroppable(collection, widget) {
            var groupName = widget.options.group, droppables = collection[groupName], i;
            Widget.fn.destroy.call(widget);
            if (droppables.length > 1) {
                for (i = 0; i < droppables.length; i++) {
                    if (droppables[i] == widget) {
                        droppables.splice(i, 1);
                        break;
                    }
                }
            } else {
                droppables.length = 0;
                delete collection[groupName];
            }
        }
        var DropTarget = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                var group = that.options.group;
                if (!(group in dropTargets)) {
                    dropTargets[group] = [that];
                } else {
                    dropTargets[group].push(that);
                }
            },
            events: [
                DRAGENTER,
                DRAGLEAVE,
                DROP
            ],
            options: {
                name: 'DropTarget',
                group: 'default'
            },
            destroy: function () {
                destroyDroppable(dropTargets, this);
            },
            _trigger: function (eventName, e) {
                var that = this, draggable = draggables[that.options.group];
                if (draggable) {
                    return that.trigger(eventName, extend({}, e.event, {
                        draggable: draggable,
                        dropTarget: e.dropTarget
                    }));
                }
            },
            _over: function (e) {
                this._trigger(DRAGENTER, e);
            },
            _out: function (e) {
                this._trigger(DRAGLEAVE, e);
            },
            _drop: function (e) {
                var that = this, draggable = draggables[that.options.group];
                if (draggable) {
                    draggable.dropped = !that._trigger(DROP, e);
                }
            }
        });
        DropTarget.destroyGroup = function (groupName) {
            var group = dropTargets[groupName] || dropAreas[groupName], i;
            if (group) {
                for (i = 0; i < group.length; i++) {
                    Widget.fn.destroy.call(group[i]);
                }
                group.length = 0;
                delete dropTargets[groupName];
                delete dropAreas[groupName];
            }
        };
        DropTarget._cache = dropTargets;
        var DropTargetArea = DropTarget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                var group = that.options.group;
                if (!(group in dropAreas)) {
                    dropAreas[group] = [that];
                } else {
                    dropAreas[group].push(that);
                }
            },
            destroy: function () {
                destroyDroppable(dropAreas, this);
            },
            options: {
                name: 'DropTargetArea',
                group: 'default',
                filter: null
            }
        });
        var Draggable = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                that._activated = false;
                that.userEvents = new UserEvents(that.element, {
                    global: true,
                    allowSelection: true,
                    filter: that.options.filter,
                    threshold: that.options.distance,
                    start: proxy(that._start, that),
                    hold: proxy(that._hold, that),
                    move: proxy(that._drag, that),
                    end: proxy(that._end, that),
                    cancel: proxy(that._cancel, that),
                    select: proxy(that._select, that)
                });
                that._afterEndHandler = proxy(that._afterEnd, that);
                that._captureEscape = proxy(that._captureEscape, that);
            },
            events: [
                HOLD,
                DRAGSTART,
                DRAG,
                DRAGEND,
                DRAGCANCEL,
                HINTDESTROYED
            ],
            options: {
                name: 'Draggable',
                distance: kendo.support.touch ? 0 : 5,
                group: 'default',
                cursorOffset: null,
                axis: null,
                container: null,
                filter: null,
                ignore: null,
                holdToDrag: false,
                autoScroll: false,
                dropped: false
            },
            cancelHold: function () {
                this._activated = false;
            },
            _captureEscape: function (e) {
                var that = this;
                if (e.keyCode === kendo.keys.ESC) {
                    that._trigger(DRAGCANCEL, { event: e });
                    that.userEvents.cancel();
                }
            },
            _updateHint: function (e) {
                var that = this, coordinates, options = that.options, boundaries = that.boundaries, axis = options.axis, cursorOffset = that.options.cursorOffset;
                if (cursorOffset) {
                    coordinates = {
                        left: e.x.location + cursorOffset.left,
                        top: e.y.location + cursorOffset.top
                    };
                } else {
                    that.hintOffset.left += e.x.delta;
                    that.hintOffset.top += e.y.delta;
                    coordinates = $.extend({}, that.hintOffset);
                }
                if (boundaries) {
                    coordinates.top = within(coordinates.top, boundaries.y);
                    coordinates.left = within(coordinates.left, boundaries.x);
                }
                if (axis === 'x') {
                    delete coordinates.top;
                } else if (axis === 'y') {
                    delete coordinates.left;
                }
                that.hint.css(coordinates);
            },
            _shouldIgnoreTarget: function (target) {
                var ignoreSelector = this.options.ignore;
                return ignoreSelector && $(target).is(ignoreSelector);
            },
            _select: function (e) {
                if (!this._shouldIgnoreTarget(e.event.target)) {
                    e.preventDefault();
                }
            },
            _start: function (e) {
                var that = this, options = that.options, container = options.container, hint = options.hint;
                if (this._shouldIgnoreTarget(e.touch.initialTouch) || options.holdToDrag && !that._activated) {
                    that.userEvents.cancel();
                    return;
                }
                that.currentTarget = e.target;
                that.currentTargetOffset = getOffset(that.currentTarget);
                if (hint) {
                    if (that.hint) {
                        that.hint.stop(true, true).remove();
                    }
                    that.hint = kendo.isFunction(hint) ? $(hint.call(that, that.currentTarget)) : hint;
                    var offset = getOffset(that.currentTarget);
                    that.hintOffset = offset;
                    that.hint.css({
                        position: 'absolute',
                        zIndex: 20000,
                        left: offset.left,
                        top: offset.top
                    }).appendTo(document.body);
                    that.angular('compile', function () {
                        that.hint.removeAttr('ng-repeat');
                        var scopeTarget = $(e.target);
                        while (!scopeTarget.data('$$kendoScope') && scopeTarget.length) {
                            scopeTarget = scopeTarget.parent();
                        }
                        return {
                            elements: that.hint.get(),
                            scopeFrom: scopeTarget.data('$$kendoScope')
                        };
                    });
                }
                draggables[options.group] = that;
                that.dropped = false;
                if (container) {
                    that.boundaries = containerBoundaries(container, that.hint);
                }
                $(document).on(KEYUP, that._captureEscape);
                if (that._trigger(DRAGSTART, e)) {
                    that.userEvents.cancel();
                    that._afterEnd();
                }
                that.userEvents.capture();
            },
            _hold: function (e) {
                this.currentTarget = e.target;
                if (this._trigger(HOLD, e)) {
                    this.userEvents.cancel();
                } else {
                    this._activated = true;
                }
            },
            _drag: function (e) {
                e.preventDefault();
                var cursorElement = this._elementUnderCursor(e);
                this._lastEvent = e;
                this._processMovement(e, cursorElement);
                if (this.options.autoScroll) {
                    if (this._cursorElement !== cursorElement) {
                        this._scrollableParent = findScrollableParent(cursorElement);
                        this._cursorElement = cursorElement;
                    }
                    if (this._scrollableParent[0]) {
                        var velocity = autoScrollVelocity(e.x.location, e.y.location, scrollableViewPort(this._scrollableParent));
                        this._scrollCompenstation = $.extend({}, this.hintOffset);
                        this._scrollVelocity = velocity;
                        if (velocity.y === 0 && velocity.x === 0) {
                            clearInterval(this._scrollInterval);
                            this._scrollInterval = null;
                        } else if (!this._scrollInterval) {
                            this._scrollInterval = setInterval($.proxy(this, '_autoScroll'), 50);
                        }
                    }
                }
                if (this.hint) {
                    this._updateHint(e);
                }
            },
            _processMovement: function (e, cursorElement) {
                this._withDropTarget(cursorElement, function (target, targetElement) {
                    if (!target) {
                        if (lastDropTarget) {
                            lastDropTarget._trigger(DRAGLEAVE, extend(e, { dropTarget: $(lastDropTarget.targetElement) }));
                            lastDropTarget = null;
                        }
                        return;
                    }
                    if (lastDropTarget) {
                        if (targetElement === lastDropTarget.targetElement) {
                            return;
                        }
                        lastDropTarget._trigger(DRAGLEAVE, extend(e, { dropTarget: $(lastDropTarget.targetElement) }));
                    }
                    target._trigger(DRAGENTER, extend(e, { dropTarget: $(targetElement) }));
                    lastDropTarget = extend(target, { targetElement: targetElement });
                });
                this._trigger(DRAG, extend(e, {
                    dropTarget: lastDropTarget,
                    elementUnderCursor: cursorElement
                }));
            },
            _autoScroll: function () {
                var parent = this._scrollableParent[0], velocity = this._scrollVelocity, compensation = this._scrollCompenstation;
                if (!parent) {
                    return;
                }
                var cursorElement = this._elementUnderCursor(this._lastEvent);
                this._processMovement(this._lastEvent, cursorElement);
                var yIsScrollable, xIsScrollable;
                var isRootNode = parent === scrollableRoot()[0];
                if (isRootNode) {
                    yIsScrollable = document.body.scrollHeight > $window.height();
                    xIsScrollable = document.body.scrollWidth > $window.width();
                } else {
                    yIsScrollable = parent.offsetHeight <= parent.scrollHeight;
                    xIsScrollable = parent.offsetWidth <= parent.scrollWidth;
                }
                var yDelta = parent.scrollTop + velocity.y;
                var yInBounds = yIsScrollable && yDelta > 0 && yDelta < parent.scrollHeight;
                var xDelta = parent.scrollLeft + velocity.x;
                var xInBounds = xIsScrollable && xDelta > 0 && xDelta < parent.scrollWidth;
                if (yInBounds) {
                    parent.scrollTop += velocity.y;
                }
                if (xInBounds) {
                    parent.scrollLeft += velocity.x;
                }
                if (isRootNode && (xInBounds || yInBounds)) {
                    if (yInBounds) {
                        compensation.top += velocity.y;
                    }
                    if (xInBounds) {
                        compensation.left += velocity.x;
                    }
                    this.hint.css(compensation);
                }
            },
            _end: function (e) {
                this._withDropTarget(this._elementUnderCursor(e), function (target, targetElement) {
                    if (target) {
                        target._drop(extend({}, e, { dropTarget: $(targetElement) }));
                        lastDropTarget = null;
                    }
                });
                this._cancel(this._trigger(DRAGEND, e));
            },
            _cancel: function (isDefaultPrevented) {
                var that = this;
                that._scrollableParent = null;
                this._cursorElement = null;
                clearInterval(this._scrollInterval);
                that._activated = false;
                if (that.hint && !that.dropped) {
                    setTimeout(function () {
                        that.hint.stop(true, true);
                        if (isDefaultPrevented) {
                            that._afterEndHandler();
                        } else {
                            that.hint.animate(that.currentTargetOffset, 'fast', that._afterEndHandler);
                        }
                    }, 0);
                } else {
                    that._afterEnd();
                }
            },
            _trigger: function (eventName, e) {
                var that = this;
                return that.trigger(eventName, extend({}, e.event, {
                    x: e.x,
                    y: e.y,
                    currentTarget: that.currentTarget,
                    initialTarget: e.touch ? e.touch.initialTouch : null,
                    dropTarget: e.dropTarget,
                    elementUnderCursor: e.elementUnderCursor
                }));
            },
            _elementUnderCursor: function (e) {
                var target = elementUnderCursor(e), hint = this.hint;
                if (hint && contains(hint[0], target)) {
                    hint.hide();
                    target = elementUnderCursor(e);
                    if (!target) {
                        target = elementUnderCursor(e);
                    }
                    hint.show();
                }
                return target;
            },
            _withDropTarget: function (element, callback) {
                var result, group = this.options.group, targets = dropTargets[group], areas = dropAreas[group];
                if (targets && targets.length || areas && areas.length) {
                    result = checkTarget(element, targets, areas);
                    if (result) {
                        callback(result.target, result.targetElement);
                    } else {
                        callback();
                    }
                }
            },
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._afterEnd();
                that.userEvents.destroy();
                this._scrollableParent = null;
                this._cursorElement = null;
                clearInterval(this._scrollInterval);
                that.currentTarget = null;
            },
            _afterEnd: function () {
                var that = this;
                if (that.hint) {
                    that.hint.remove();
                }
                delete draggables[that.options.group];
                that.trigger('destroy');
                that.trigger(HINTDESTROYED);
                $(document).off(KEYUP, that._captureEscape);
            }
        });
        kendo.ui.plugin(DropTarget);
        kendo.ui.plugin(DropTargetArea);
        kendo.ui.plugin(Draggable);
        kendo.TapCapture = TapCapture;
        kendo.containerBoundaries = containerBoundaries;
        extend(kendo.ui, {
            Pane: Pane,
            PaneDimensions: PaneDimensions,
            Movable: Movable
        });
        function scrollableViewPort(element) {
            var root = scrollableRoot()[0], offset, top, left;
            if (element[0] === root) {
                top = root.scrollTop;
                left = root.scrollLeft;
                return {
                    top: top,
                    left: left,
                    bottom: top + $window.height(),
                    right: left + $window.width()
                };
            } else {
                offset = element.offset();
                offset.bottom = offset.top + element.height();
                offset.right = offset.left + element.width();
                return offset;
            }
        }
        function scrollableRoot() {
            return $(kendo.support.browser.chrome ? document.body : document.documentElement);
        }
        function findScrollableParent(element) {
            var root = scrollableRoot();
            if (!element || element === document.body || element === document.documentElement) {
                return root;
            }
            var parent = $(element)[0];
            while (parent && !kendo.isScrollable(parent) && parent !== document.body) {
                parent = parent.parentNode;
            }
            if (parent === document.body) {
                return root;
            }
            return $(parent);
        }
        function autoScrollVelocity(mouseX, mouseY, rect) {
            var velocity = {
                x: 0,
                y: 0
            };
            var AUTO_SCROLL_AREA = 50;
            if (mouseX - rect.left < AUTO_SCROLL_AREA) {
                velocity.x = -(AUTO_SCROLL_AREA - (mouseX - rect.left));
            } else if (rect.right - mouseX < AUTO_SCROLL_AREA) {
                velocity.x = AUTO_SCROLL_AREA - (rect.right - mouseX);
            }
            if (mouseY - rect.top < AUTO_SCROLL_AREA) {
                velocity.y = -(AUTO_SCROLL_AREA - (mouseY - rect.top));
            } else if (rect.bottom - mouseY < AUTO_SCROLL_AREA) {
                velocity.y = AUTO_SCROLL_AREA - (rect.bottom - mouseY);
            }
            return velocity;
        }
        kendo.ui.Draggable.utils = {
            autoScrollVelocity: autoScrollVelocity,
            scrollableViewPort: scrollableViewPort,
            findScrollableParent: findScrollableParent
        };
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));

/** 
 * Copyright 2016 Telerik AD                                                                                                                                                                            
 *                                                                                                                                                                                                      
 * Licensed under the Apache License, Version 2.0 (the "License");                                                                                                                                      
 * you may not use this file except in compliance with the License.                                                                                                                                     
 * You may obtain a copy of the License at                                                                                                                                                              
 *                                                                                                                                                                                                      
 *     http://www.apache.org/licenses/LICENSE-2.0                                                                                                                                                       
 *                                                                                                                                                                                                      
 * Unless required by applicable law or agreed to in writing, software                                                                                                                                  
 * distributed under the License is distributed on an "AS IS" BASIS,                                                                                                                                    
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.                                                                                                                             
 * See the License for the specific language governing permissions and                                                                                                                                  
 * limitations under the License.                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.mobile.scroller', [
        'kendo.fx',
        'kendo.draganddrop'
    ], f);
}(function () {
    var __meta__ = {
        id: 'mobile.scroller',
        name: 'Scroller',
        category: 'mobile',
        description: 'The Kendo Mobile Scroller widget enables touch friendly kinetic scrolling for the contents of a given DOM element.',
        depends: [
            'fx',
            'draganddrop'
        ]
    };
    (function ($, undefined) {
        var kendo = window.kendo, mobile = kendo.mobile, fx = kendo.effects, ui = mobile.ui, proxy = $.proxy, extend = $.extend, Widget = ui.Widget, Class = kendo.Class, Movable = kendo.ui.Movable, Pane = kendo.ui.Pane, PaneDimensions = kendo.ui.PaneDimensions, Transition = fx.Transition, Animation = fx.Animation, abs = Math.abs, SNAPBACK_DURATION = 500, SCROLLBAR_OPACITY = 0.7, FRICTION = 0.96, VELOCITY_MULTIPLIER = 10, MAX_VELOCITY = 55, OUT_OF_BOUNDS_FRICTION = 0.5, ANIMATED_SCROLLER_PRECISION = 5, RELEASECLASS = 'km-scroller-release', REFRESHCLASS = 'km-scroller-refresh', PULL = 'pull', CHANGE = 'change', RESIZE = 'resize', SCROLL = 'scroll', MOUSE_WHEEL_ID = 2;
        var ZoomSnapBack = Animation.extend({
            init: function (options) {
                var that = this;
                Animation.fn.init.call(that);
                extend(that, options);
                that.userEvents.bind('gestureend', proxy(that.start, that));
                that.tapCapture.bind('press', proxy(that.cancel, that));
            },
            enabled: function () {
                return this.movable.scale < this.dimensions.minScale;
            },
            done: function () {
                return this.dimensions.minScale - this.movable.scale < 0.01;
            },
            tick: function () {
                var movable = this.movable;
                movable.scaleWith(1.1);
                this.dimensions.rescale(movable.scale);
            },
            onEnd: function () {
                var movable = this.movable;
                movable.scaleTo(this.dimensions.minScale);
                this.dimensions.rescale(movable.scale);
            }
        });
        var DragInertia = Animation.extend({
            init: function (options) {
                var that = this;
                Animation.fn.init.call(that);
                extend(that, options, {
                    transition: new Transition({
                        axis: options.axis,
                        movable: options.movable,
                        onEnd: function () {
                            that._end();
                        }
                    })
                });
                that.tapCapture.bind('press', function () {
                    that.cancel();
                });
                that.userEvents.bind('end', proxy(that.start, that));
                that.userEvents.bind('gestureend', proxy(that.start, that));
                that.userEvents.bind('tap', proxy(that.onEnd, that));
            },
            onCancel: function () {
                this.transition.cancel();
            },
            freeze: function (location) {
                var that = this;
                that.cancel();
                that._moveTo(location);
            },
            onEnd: function () {
                var that = this;
                if (that.paneAxis.outOfBounds()) {
                    that._snapBack();
                } else {
                    that._end();
                }
            },
            done: function () {
                return abs(this.velocity) < 1;
            },
            start: function (e) {
                var that = this, velocity;
                if (!that.dimension.enabled) {
                    return;
                }
                if (that.paneAxis.outOfBounds()) {
                    that._snapBack();
                } else {
                    velocity = e.touch.id === MOUSE_WHEEL_ID ? 0 : e.touch[that.axis].velocity;
                    that.velocity = Math.max(Math.min(velocity * that.velocityMultiplier, MAX_VELOCITY), -MAX_VELOCITY);
                    that.tapCapture.captureNext();
                    Animation.fn.start.call(that);
                }
            },
            tick: function () {
                var that = this, dimension = that.dimension, friction = that.paneAxis.outOfBounds() ? OUT_OF_BOUNDS_FRICTION : that.friction, delta = that.velocity *= friction, location = that.movable[that.axis] + delta;
                if (!that.elastic && dimension.outOfBounds(location)) {
                    location = Math.max(Math.min(location, dimension.max), dimension.min);
                    that.velocity = 0;
                }
                that.movable.moveAxis(that.axis, location);
            },
            _end: function () {
                this.tapCapture.cancelCapture();
                this.end();
            },
            _snapBack: function () {
                var that = this, dimension = that.dimension, snapBack = that.movable[that.axis] > dimension.max ? dimension.max : dimension.min;
                that._moveTo(snapBack);
            },
            _moveTo: function (location) {
                this.transition.moveTo({
                    location: location,
                    duration: SNAPBACK_DURATION,
                    ease: Transition.easeOutExpo
                });
            }
        });
        var AnimatedScroller = Animation.extend({
            init: function (options) {
                var that = this;
                kendo.effects.Animation.fn.init.call(this);
                extend(that, options, {
                    origin: {},
                    destination: {},
                    offset: {}
                });
            },
            tick: function () {
                this._updateCoordinates();
                this.moveTo(this.origin);
            },
            done: function () {
                return abs(this.offset.y) < ANIMATED_SCROLLER_PRECISION && abs(this.offset.x) < ANIMATED_SCROLLER_PRECISION;
            },
            onEnd: function () {
                this.moveTo(this.destination);
                if (this.callback) {
                    this.callback.call();
                }
            },
            setCoordinates: function (from, to) {
                this.offset = {};
                this.origin = from;
                this.destination = to;
            },
            setCallback: function (callback) {
                if (callback && kendo.isFunction(callback)) {
                    this.callback = callback;
                } else {
                    callback = undefined;
                }
            },
            _updateCoordinates: function () {
                this.offset = {
                    x: (this.destination.x - this.origin.x) / 4,
                    y: (this.destination.y - this.origin.y) / 4
                };
                this.origin = {
                    y: this.origin.y + this.offset.y,
                    x: this.origin.x + this.offset.x
                };
            }
        });
        var ScrollBar = Class.extend({
            init: function (options) {
                var that = this, horizontal = options.axis === 'x', element = $('<div class="km-touch-scrollbar km-' + (horizontal ? 'horizontal' : 'vertical') + '-scrollbar" />');
                extend(that, options, {
                    element: element,
                    elementSize: 0,
                    movable: new Movable(element),
                    scrollMovable: options.movable,
                    alwaysVisible: options.alwaysVisible,
                    size: horizontal ? 'width' : 'height'
                });
                that.scrollMovable.bind(CHANGE, proxy(that.refresh, that));
                that.container.append(element);
                if (options.alwaysVisible) {
                    that.show();
                }
            },
            refresh: function () {
                var that = this, axis = that.axis, dimension = that.dimension, paneSize = dimension.size, scrollMovable = that.scrollMovable, sizeRatio = paneSize / dimension.total, position = Math.round(-scrollMovable[axis] * sizeRatio), size = Math.round(paneSize * sizeRatio);
                if (sizeRatio >= 1) {
                    this.element.css('display', 'none');
                } else {
                    this.element.css('display', '');
                }
                if (position + size > paneSize) {
                    size = paneSize - position;
                } else if (position < 0) {
                    size += position;
                    position = 0;
                }
                if (that.elementSize != size) {
                    that.element.css(that.size, size + 'px');
                    that.elementSize = size;
                }
                that.movable.moveAxis(axis, position);
            },
            show: function () {
                this.element.css({
                    opacity: SCROLLBAR_OPACITY,
                    visibility: 'visible'
                });
            },
            hide: function () {
                if (!this.alwaysVisible) {
                    this.element.css({ opacity: 0 });
                }
            }
        });
        var Scroller = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                element = that.element;
                that._native = that.options.useNative && kendo.support.hasNativeScrolling;
                if (that._native) {
                    element.addClass('km-native-scroller').prepend('<div class="km-scroll-header"/>');
                    extend(that, {
                        scrollElement: element,
                        fixedContainer: element.children().first()
                    });
                    return;
                }
                element.css('overflow', 'hidden').addClass('km-scroll-wrapper').wrapInner('<div class="km-scroll-container"/>').prepend('<div class="km-scroll-header"/>');
                var inner = element.children().eq(1), tapCapture = new kendo.TapCapture(element), movable = new Movable(inner), dimensions = new PaneDimensions({
                    element: inner,
                    container: element,
                    forcedEnabled: that.options.zoom
                }), avoidScrolling = this.options.avoidScrolling, userEvents = new kendo.UserEvents(element, {
                    fastTap: true,
                    allowSelection: true,
                    preventDragEvent: true,
                    captureUpIfMoved: true,
                    multiTouch: that.options.zoom,
                    start: function (e) {
                        dimensions.refresh();
                        var velocityX = abs(e.x.velocity), velocityY = abs(e.y.velocity), horizontalSwipe = velocityX * 2 >= velocityY, originatedFromFixedContainer = $.contains(that.fixedContainer[0], e.event.target), verticalSwipe = velocityY * 2 >= velocityX;
                        if (!originatedFromFixedContainer && !avoidScrolling(e) && that.enabled && (dimensions.x.enabled && horizontalSwipe || dimensions.y.enabled && verticalSwipe)) {
                            userEvents.capture();
                        } else {
                            userEvents.cancel();
                        }
                    }
                }), pane = new Pane({
                    movable: movable,
                    dimensions: dimensions,
                    userEvents: userEvents,
                    elastic: that.options.elastic
                }), zoomSnapBack = new ZoomSnapBack({
                    movable: movable,
                    dimensions: dimensions,
                    userEvents: userEvents,
                    tapCapture: tapCapture
                }), animatedScroller = new AnimatedScroller({
                    moveTo: function (coordinates) {
                        that.scrollTo(coordinates.x, coordinates.y);
                    }
                });
                movable.bind(CHANGE, function () {
                    that.scrollTop = -movable.y;
                    that.scrollLeft = -movable.x;
                    that.trigger(SCROLL, {
                        scrollTop: that.scrollTop,
                        scrollLeft: that.scrollLeft
                    });
                });
                if (that.options.mousewheelScrolling) {
                    element.on('DOMMouseScroll mousewheel', proxy(this, '_wheelScroll'));
                }
                extend(that, {
                    movable: movable,
                    dimensions: dimensions,
                    zoomSnapBack: zoomSnapBack,
                    animatedScroller: animatedScroller,
                    userEvents: userEvents,
                    pane: pane,
                    tapCapture: tapCapture,
                    pulled: false,
                    enabled: true,
                    scrollElement: inner,
                    scrollTop: 0,
                    scrollLeft: 0,
                    fixedContainer: element.children().first()
                });
                that._initAxis('x');
                that._initAxis('y');
                that._wheelEnd = function () {
                    that._wheel = false;
                    that.userEvents.end(0, that._wheelY);
                };
                dimensions.refresh();
                if (that.options.pullToRefresh) {
                    that._initPullToRefresh();
                }
            },
            _wheelScroll: function (e) {
                if (!this._wheel) {
                    this._wheel = true;
                    this._wheelY = 0;
                    this.userEvents.press(0, this._wheelY);
                }
                clearTimeout(this._wheelTimeout);
                this._wheelTimeout = setTimeout(this._wheelEnd, 50);
                var delta = kendo.wheelDeltaY(e);
                if (delta) {
                    this._wheelY += delta;
                    this.userEvents.move(0, this._wheelY);
                }
                e.preventDefault();
            },
            makeVirtual: function () {
                this.dimensions.y.makeVirtual();
            },
            virtualSize: function (min, max) {
                this.dimensions.y.virtualSize(min, max);
            },
            height: function () {
                return this.dimensions.y.size;
            },
            scrollHeight: function () {
                return this.scrollElement[0].scrollHeight;
            },
            scrollWidth: function () {
                return this.scrollElement[0].scrollWidth;
            },
            options: {
                name: 'Scroller',
                zoom: false,
                pullOffset: 140,
                visibleScrollHints: false,
                elastic: true,
                useNative: false,
                mousewheelScrolling: true,
                avoidScrolling: function () {
                    return false;
                },
                pullToRefresh: false,
                messages: {
                    pullTemplate: 'Pull to refresh',
                    releaseTemplate: 'Release to refresh',
                    refreshTemplate: 'Refreshing'
                }
            },
            events: [
                PULL,
                SCROLL,
                RESIZE
            ],
            _resize: function () {
                if (!this._native) {
                    this.contentResized();
                }
            },
            setOptions: function (options) {
                var that = this;
                Widget.fn.setOptions.call(that, options);
                if (options.pullToRefresh) {
                    that._initPullToRefresh();
                }
            },
            reset: function () {
                if (this._native) {
                    this.scrollElement.scrollTop(0);
                } else {
                    this.movable.moveTo({
                        x: 0,
                        y: 0
                    });
                    this._scale(1);
                }
            },
            contentResized: function () {
                this.dimensions.refresh();
                if (this.pane.x.outOfBounds()) {
                    this.movable.moveAxis('x', this.dimensions.x.min);
                }
                if (this.pane.y.outOfBounds()) {
                    this.movable.moveAxis('y', this.dimensions.y.min);
                }
            },
            zoomOut: function () {
                var dimensions = this.dimensions;
                dimensions.refresh();
                this._scale(dimensions.fitScale);
                this.movable.moveTo(dimensions.centerCoordinates());
            },
            enable: function () {
                this.enabled = true;
            },
            disable: function () {
                this.enabled = false;
            },
            scrollTo: function (x, y) {
                if (this._native) {
                    this.scrollElement.scrollLeft(abs(x));
                    this.scrollElement.scrollTop(abs(y));
                } else {
                    this.dimensions.refresh();
                    this.movable.moveTo({
                        x: x,
                        y: y
                    });
                }
            },
            animatedScrollTo: function (x, y, callback) {
                var from, to;
                if (this._native) {
                    this.scrollTo(x, y);
                } else {
                    from = {
                        x: this.movable.x,
                        y: this.movable.y
                    };
                    to = {
                        x: x,
                        y: y
                    };
                    this.animatedScroller.setCoordinates(from, to);
                    this.animatedScroller.setCallback(callback);
                    this.animatedScroller.start();
                }
            },
            pullHandled: function () {
                var that = this;
                that.refreshHint.removeClass(REFRESHCLASS);
                that.hintContainer.html(that.pullTemplate({}));
                that.yinertia.onEnd();
                that.xinertia.onEnd();
                that.userEvents.cancel();
            },
            destroy: function () {
                Widget.fn.destroy.call(this);
                if (this.userEvents) {
                    this.userEvents.destroy();
                }
            },
            _scale: function (scale) {
                this.dimensions.rescale(scale);
                this.movable.scaleTo(scale);
            },
            _initPullToRefresh: function () {
                var that = this;
                that.dimensions.y.forceEnabled();
                that.pullTemplate = kendo.template(that.options.messages.pullTemplate);
                that.releaseTemplate = kendo.template(that.options.messages.releaseTemplate);
                that.refreshTemplate = kendo.template(that.options.messages.refreshTemplate);
                that.scrollElement.prepend('<span class="km-scroller-pull"><span class="km-icon"></span><span class="km-loading-left"></span><span class="km-loading-right"></span><span class="km-template">' + that.pullTemplate({}) + '</span></span>');
                that.refreshHint = that.scrollElement.children().first();
                that.hintContainer = that.refreshHint.children('.km-template');
                that.pane.y.bind('change', proxy(that._paneChange, that));
                that.userEvents.bind('end', proxy(that._dragEnd, that));
            },
            _dragEnd: function () {
                var that = this;
                if (!that.pulled) {
                    return;
                }
                that.pulled = false;
                that.refreshHint.removeClass(RELEASECLASS).addClass(REFRESHCLASS);
                that.hintContainer.html(that.refreshTemplate({}));
                that.yinertia.freeze(that.options.pullOffset / 2);
                that.trigger('pull');
            },
            _paneChange: function () {
                var that = this;
                if (that.movable.y / OUT_OF_BOUNDS_FRICTION > that.options.pullOffset) {
                    if (!that.pulled) {
                        that.pulled = true;
                        that.refreshHint.removeClass(REFRESHCLASS).addClass(RELEASECLASS);
                        that.hintContainer.html(that.releaseTemplate({}));
                    }
                } else if (that.pulled) {
                    that.pulled = false;
                    that.refreshHint.removeClass(RELEASECLASS);
                    that.hintContainer.html(that.pullTemplate({}));
                }
            },
            _initAxis: function (axis) {
                var that = this, movable = that.movable, dimension = that.dimensions[axis], tapCapture = that.tapCapture, paneAxis = that.pane[axis], scrollBar = new ScrollBar({
                    axis: axis,
                    movable: movable,
                    dimension: dimension,
                    container: that.element,
                    alwaysVisible: that.options.visibleScrollHints
                });
                dimension.bind(CHANGE, function () {
                    scrollBar.refresh();
                });
                paneAxis.bind(CHANGE, function () {
                    scrollBar.show();
                });
                that[axis + 'inertia'] = new DragInertia({
                    axis: axis,
                    paneAxis: paneAxis,
                    movable: movable,
                    tapCapture: tapCapture,
                    userEvents: that.userEvents,
                    dimension: dimension,
                    elastic: that.options.elastic,
                    friction: that.options.friction || FRICTION,
                    velocityMultiplier: that.options.velocityMultiplier || VELOCITY_MULTIPLIER,
                    end: function () {
                        scrollBar.hide();
                        that.trigger('scrollEnd', {
                            axis: axis,
                            scrollTop: that.scrollTop,
                            scrollLeft: that.scrollLeft
                        });
                    }
                });
            }
        });
        ui.plugin(Scroller);
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));


/** 
 * Copyright 2016 Telerik AD                                                                                                                                                                            
 *                                                                                                                                                                                                      
 * Licensed under the Apache License, Version 2.0 (the "License");                                                                                                                                      
 * you may not use this file except in compliance with the License.                                                                                                                                     
 * You may obtain a copy of the License at                                                                                                                                                              
 *                                                                                                                                                                                                      
 *     http://www.apache.org/licenses/LICENSE-2.0                                                                                                                                                       
 *                                                                                                                                                                                                      
 * Unless required by applicable law or agreed to in writing, software                                                                                                                                  
 * distributed under the License is distributed on an "AS IS" BASIS,                                                                                                                                    
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.                                                                                                                             
 * See the License for the specific language governing permissions and                                                                                                                                  
 * limitations under the License.                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.popup', ['kendo.core'], f);
}(function () {
    var __meta__ = {
        id: 'popup',
        name: 'Pop-up',
        category: 'framework',
        depends: ['core'],
        advanced: true
    };
    (function ($, undefined) {
        var kendo = window.kendo, ui = kendo.ui, Widget = ui.Widget, support = kendo.support, getOffset = kendo.getOffset, OPEN = 'open', CLOSE = 'close', DEACTIVATE = 'deactivate', ACTIVATE = 'activate', CENTER = 'center', LEFT = 'left', RIGHT = 'right', TOP = 'top', BOTTOM = 'bottom', ABSOLUTE = 'absolute', HIDDEN = 'hidden', BODY = 'body', LOCATION = 'location', POSITION = 'position', VISIBLE = 'visible', EFFECTS = 'effects', ACTIVE = 'k-state-active', ACTIVEBORDER = 'k-state-border', ACTIVEBORDERREGEXP = /k-state-border-(\w+)/, ACTIVECHILDREN = '.k-picker-wrap, .k-dropdown-wrap, .k-link', MOUSEDOWN = 'down', DOCUMENT_ELEMENT = $(document.documentElement), WINDOW = $(window), SCROLL = 'scroll', cssPrefix = support.transitions.css, TRANSFORM = cssPrefix + 'transform', extend = $.extend, NS = '.kendoPopup', styles = [
            'font-size',
            'font-family',
            'font-stretch',
            'font-style',
            'font-weight',
            'line-height'
        ];
        function contains(container, target) {
            return container === target || $.contains(container, target);
        }
        var Popup = Widget.extend({
            init: function (element, options) {
                var that = this, parentPopup;
                options = options || {};
                if (options.isRtl) {
                    options.origin = options.origin || BOTTOM + ' ' + RIGHT;
                    options.position = options.position || TOP + ' ' + RIGHT;
                }
                Widget.fn.init.call(that, element, options);
                element = that.element;
                options = that.options;
                that.collisions = options.collision ? options.collision.split(' ') : [];
                that.downEvent = kendo.applyEventMap(MOUSEDOWN, kendo.guid());
                if (that.collisions.length === 1) {
                    that.collisions.push(that.collisions[0]);
                }
                parentPopup = $(that.options.anchor).closest('.k-popup,.k-group').filter(':not([class^=km-])');
                options.appendTo = $($(options.appendTo)[0] || parentPopup[0] || BODY);
                that.element.hide().addClass('k-popup k-group k-reset').toggleClass('k-rtl', !!options.isRtl).css({ position: ABSOLUTE }).appendTo(options.appendTo).on('mouseenter' + NS, function () {
                    that._hovered = true;
                }).on('mouseleave' + NS, function () {
                    that._hovered = false;
                });
                that.wrapper = $();
                if (options.animation === false) {
                    options.animation = {
                        open: { effects: {} },
                        close: {
                            hide: true,
                            effects: {}
                        }
                    };
                }
                extend(options.animation.open, {
                    complete: function () {
                        that.wrapper.css({ overflow: VISIBLE });
                        that._activated = true;
                        that._trigger(ACTIVATE);
                    }
                });
                extend(options.animation.close, {
                    complete: function () {
                        that._animationClose();
                    }
                });
                that._mousedownProxy = function (e) {
                    that._mousedown(e);
                };
                if (support.mobileOS.android) {
                    that._resizeProxy = function (e) {
                        setTimeout(function () {
                            that._resize(e);
                        }, 600);
                    };
                } else {
                    that._resizeProxy = function (e) {
                        that._resize(e);
                    };
                }
                if (options.toggleTarget) {
                    $(options.toggleTarget).on(options.toggleEvent + NS, $.proxy(that.toggle, that));
                }
            },
            events: [
                OPEN,
                ACTIVATE,
                CLOSE,
                DEACTIVATE
            ],
            options: {
                name: 'Popup',
                toggleEvent: 'click',
                origin: BOTTOM + ' ' + LEFT,
                position: TOP + ' ' + LEFT,
                anchor: BODY,
                appendTo: null,
                collision: 'flip fit',
                viewport: window,
                copyAnchorStyles: true,
                autosize: false,
                modal: false,
                adjustSize: {
                    width: 0,
                    height: 0
                },
                animation: {
                    open: {
                        effects: 'slideIn:down',
                        transition: true,
                        duration: 200
                    },
                    close: {
                        duration: 100,
                        hide: true
                    }
                }
            },
            _animationClose: function () {
                var that = this;
                var location = that.wrapper.data(LOCATION);
                that.wrapper.hide();
                if (location) {
                    that.wrapper.css(location);
                }
                if (that.options.anchor != BODY) {
                    that._hideDirClass();
                }
                that._closing = false;
                that._trigger(DEACTIVATE);
            },
            destroy: function () {
                var that = this, options = that.options, element = that.element.off(NS), parent;
                Widget.fn.destroy.call(that);
                if (options.toggleTarget) {
                    $(options.toggleTarget).off(NS);
                }
                if (!options.modal) {
                    DOCUMENT_ELEMENT.unbind(that.downEvent, that._mousedownProxy);
                    that._toggleResize(false);
                }
                kendo.destroy(that.element.children());
                element.removeData();
                if (options.appendTo[0] === document.body) {
                    parent = element.parent('.k-animation-container');
                    if (parent[0]) {
                        parent.remove();
                    } else {
                        element.remove();
                    }
                }
            },
            open: function (x, y) {
                var that = this, fixed = {
                    isFixed: !isNaN(parseInt(y, 10)),
                    x: x,
                    y: y
                }, element = that.element, options = that.options, animation, wrapper, anchor = $(options.anchor), mobile = element[0] && element.hasClass('km-widget');
                if (!that.visible()) {
                    if (options.copyAnchorStyles) {
                        if (mobile && styles[0] == 'font-size') {
                            styles.shift();
                        }
                        element.css(kendo.getComputedStyles(anchor[0], styles));
                    }
                    if (element.data('animating') || that._trigger(OPEN)) {
                        return;
                    }
                    that._activated = false;
                    if (!options.modal) {
                        DOCUMENT_ELEMENT.unbind(that.downEvent, that._mousedownProxy).bind(that.downEvent, that._mousedownProxy);
                        that._toggleResize(false);
                        that._toggleResize(true);
                    }
                    that.wrapper = wrapper = kendo.wrap(element, options.autosize).css({
                        overflow: HIDDEN,
                        display: 'block',
                        position: ABSOLUTE
                    });
                    if (support.mobileOS.android) {
                        wrapper.css(TRANSFORM, 'translatez(0)');
                    }
                    wrapper.css(POSITION);
                    if ($(options.appendTo)[0] == document.body) {
                        wrapper.css(TOP, '-10000px');
                    }
                    that.flipped = that._position(fixed);
                    animation = that._openAnimation();
                    if (options.anchor != BODY) {
                        that._showDirClass(animation);
                    }
                    element.data(EFFECTS, animation.effects).kendoStop(true).kendoAnimate(animation);
                }
            },
            _openAnimation: function () {
                var animation = extend(true, {}, this.options.animation.open);
                animation.effects = kendo.parseEffects(animation.effects, this.flipped);
                return animation;
            },
            _hideDirClass: function () {
                var anchor = $(this.options.anchor);
                var direction = ((anchor.attr('class') || '').match(ACTIVEBORDERREGEXP) || [
                    '',
                    'down'
                ])[1];
                var dirClass = ACTIVEBORDER + '-' + direction;
                anchor.removeClass(dirClass).children(ACTIVECHILDREN).removeClass(ACTIVE).removeClass(dirClass);
                this.element.removeClass(ACTIVEBORDER + '-' + kendo.directions[direction].reverse);
            },
            _showDirClass: function (animation) {
                var direction = animation.effects.slideIn ? animation.effects.slideIn.direction : 'down';
                var dirClass = ACTIVEBORDER + '-' + direction;
                $(this.options.anchor).addClass(dirClass).children(ACTIVECHILDREN).addClass(ACTIVE).addClass(dirClass);
                this.element.addClass(ACTIVEBORDER + '-' + kendo.directions[direction].reverse);
            },
            position: function () {
                if (this.visible()) {
                    this.flipped = this._position();
                }
            },
            toggle: function () {
                var that = this;
                that[that.visible() ? CLOSE : OPEN]();
            },
            visible: function () {
                return this.element.is(':' + VISIBLE);
            },
            close: function (skipEffects) {
                var that = this, options = that.options, wrap, animation, openEffects, closeEffects;
                if (that.visible()) {
                    wrap = that.wrapper[0] ? that.wrapper : kendo.wrap(that.element).hide();
                    that._toggleResize(false);
                    if (that._closing || that._trigger(CLOSE)) {
                        that._toggleResize(true);
                        return;
                    }
                    that.element.find('.k-popup').each(function () {
                        var that = $(this), popup = that.data('kendoPopup');
                        if (popup) {
                            popup.close(skipEffects);
                        }
                    });
                    DOCUMENT_ELEMENT.unbind(that.downEvent, that._mousedownProxy);
                    if (skipEffects) {
                        animation = {
                            hide: true,
                            effects: {}
                        };
                    } else {
                        animation = extend(true, {}, options.animation.close);
                        openEffects = that.element.data(EFFECTS);
                        closeEffects = animation.effects;
                        if (!closeEffects && !kendo.size(closeEffects) && openEffects && kendo.size(openEffects)) {
                            animation.effects = openEffects;
                            animation.reverse = true;
                        }
                        that._closing = true;
                    }
                    that.element.kendoStop(true);
                    wrap.css({ overflow: HIDDEN });
                    that.element.kendoAnimate(animation);
                }
            },
            _trigger: function (ev) {
                return this.trigger(ev, { type: ev });
            },
            _resize: function (e) {
                var that = this;
                if (support.resize.indexOf(e.type) !== -1) {
                    clearTimeout(that._resizeTimeout);
                    that._resizeTimeout = setTimeout(function () {
                        that._position();
                        that._resizeTimeout = null;
                    }, 50);
                } else {
                    if (!that._hovered || that._activated && that.element.hasClass('k-list-container')) {
                        that.close();
                    }
                }
            },
            _toggleResize: function (toggle) {
                var method = toggle ? 'on' : 'off';
                var eventNames = support.resize;
                if (!(support.mobileOS.ios || support.mobileOS.android)) {
                    eventNames += ' ' + SCROLL;
                }
                this._scrollableParents()[method](SCROLL, this._resizeProxy);
                WINDOW[method](eventNames, this._resizeProxy);
            },
            _mousedown: function (e) {
                var that = this, container = that.element[0], options = that.options, anchor = $(options.anchor)[0], toggleTarget = options.toggleTarget, target = kendo.eventTarget(e), popup = $(target).closest('.k-popup'), mobile = popup.parent().parent('.km-shim').length;
                popup = popup[0];
                if (!mobile && popup && popup !== that.element[0]) {
                    return;
                }
                if ($(e.target).closest('a').data('rel') === 'popover') {
                    return;
                }
                if (!contains(container, target) && !contains(anchor, target) && !(toggleTarget && contains($(toggleTarget)[0], target))) {
                    that.close();
                }
            },
            _fit: function (position, size, viewPortSize) {
                var output = 0;
                if (position + size > viewPortSize) {
                    output = viewPortSize - (position + size);
                }
                if (position < 0) {
                    output = -position;
                }
                return output;
            },
            _flip: function (offset, size, anchorSize, viewPortSize, origin, position, boxSize) {
                var output = 0;
                boxSize = boxSize || size;
                if (position !== origin && position !== CENTER && origin !== CENTER) {
                    if (offset + boxSize > viewPortSize) {
                        output += -(anchorSize + size);
                    }
                    if (offset + output < 0) {
                        output += anchorSize + size;
                    }
                }
                return output;
            },
            _scrollableParents: function () {
                return $(this.options.anchor).parentsUntil('body').filter(function (index, element) {
                    return kendo.isScrollable(element);
                });
            },
            _position: function (fixed) {
                var that = this, element = that.element, wrapper = that.wrapper, options = that.options, viewport = $(options.viewport), viewportOffset = viewport.offset(), anchor = $(options.anchor), origins = options.origin.toLowerCase().split(' '), positions = options.position.toLowerCase().split(' '), collisions = that.collisions, zoomLevel = support.zoomLevel(), siblingContainer, parents, parentZIndex, zIndex = 10002, isWindow = !!(viewport[0] == window && window.innerWidth && zoomLevel <= 1.02), idx = 0, docEl = document.documentElement, length, viewportWidth, viewportHeight;
                viewportWidth = isWindow ? window.innerWidth : viewport.width();
                viewportHeight = isWindow ? window.innerHeight : viewport.height();
                if (isWindow && docEl.scrollHeight - docEl.clientHeight > 0) {
                    viewportWidth -= kendo.support.scrollbar();
                }
                siblingContainer = anchor.parents().filter(wrapper.siblings());
                if (siblingContainer[0]) {
                    parentZIndex = Math.max(Number(siblingContainer.css('zIndex')), 0);
                    if (parentZIndex) {
                        zIndex = parentZIndex + 10;
                    } else {
                        parents = anchor.parentsUntil(siblingContainer);
                        for (length = parents.length; idx < length; idx++) {
                            parentZIndex = Number($(parents[idx]).css('zIndex'));
                            if (parentZIndex && zIndex < parentZIndex) {
                                zIndex = parentZIndex + 10;
                            }
                        }
                    }
                }
                wrapper.css('zIndex', zIndex);
                if (fixed && fixed.isFixed) {
                    wrapper.css({
                        left: fixed.x,
                        top: fixed.y
                    });
                } else {
                    wrapper.css(that._align(origins, positions));
                }
                var pos = getOffset(wrapper, POSITION, anchor[0] === wrapper.offsetParent()[0]), offset = getOffset(wrapper), anchorParent = anchor.offsetParent().parent('.k-animation-container,.k-popup,.k-group');
                if (anchorParent.length) {
                    pos = getOffset(wrapper, POSITION, true);
                    offset = getOffset(wrapper);
                }
                if (viewport[0] === window) {
                    offset.top -= window.pageYOffset || document.documentElement.scrollTop || 0;
                    offset.left -= window.pageXOffset || document.documentElement.scrollLeft || 0;
                } else {//hack commented out
                   // offset.top -= viewportOffset.top;
                   // offset.left -= viewportOffset.left;
                    offset.top -= window.pageYOffset || document.documentElement.scrollTop || 0;
                    offset.left -= window.pageXOffset || document.documentElement.scrollLeft || 0;
                }
                if (!that.wrapper.data(LOCATION)) {
                    wrapper.data(LOCATION, extend({}, pos));
                }
                var offsets = extend({}, offset), location = extend({}, pos), adjustSize = options.adjustSize;
                if (collisions[0] === 'fit') {
                    location.top += that._fit(offsets.top, wrapper.outerHeight() + adjustSize.height, viewportHeight / zoomLevel);
                }
                if (collisions[1] === 'fit') {
                    location.left += that._fit(offsets.left, wrapper.outerWidth() + adjustSize.width, viewportWidth / zoomLevel);
                }
                var flipPos = extend({}, location);
                var elementHeight = element.outerHeight();
                var wrapperHeight = wrapper.outerHeight();
                if (!wrapper.height() && elementHeight) {
                    wrapperHeight = wrapperHeight + elementHeight;
                }
                if (collisions[0] === 'flip') {
                    location.top += that._flip(offsets.top, elementHeight, anchor.outerHeight(), viewportHeight / zoomLevel, origins[0], positions[0], wrapperHeight);
                }
                if (collisions[1] === 'flip') {
                    location.left += that._flip(offsets.left, element.outerWidth(), anchor.outerWidth(), viewportWidth / zoomLevel, origins[1], positions[1], wrapper.outerWidth());
                }
                element.css(POSITION, ABSOLUTE);
                wrapper.css(location);
                return location.left != flipPos.left || location.top != flipPos.top;
            },
            _align: function (origin, position) {
                var that = this, element = that.wrapper, anchor = $(that.options.anchor), verticalOrigin = origin[0], horizontalOrigin = origin[1], verticalPosition = position[0], horizontalPosition = position[1], anchorOffset = getOffset(anchor), appendTo = $(that.options.appendTo), appendToOffset, width = element.outerWidth(), height = element.outerHeight(), anchorWidth = anchor.outerWidth(), anchorHeight = anchor.outerHeight(), top = anchorOffset.top, left = anchorOffset.left, round = Math.round;
                if (appendTo[0] != document.body) {
                    appendToOffset = getOffset(appendTo);
                    top -= appendToOffset.top;
                    left -= appendToOffset.left;
                }
                if (verticalOrigin === BOTTOM) {
                    top += anchorHeight;
                }
                if (verticalOrigin === CENTER) {
                    top += round(anchorHeight / 2);
                }
                if (verticalPosition === BOTTOM) {
                    top -= height;
                }
                if (verticalPosition === CENTER) {
                    top -= round(height / 2);
                }
                if (horizontalOrigin === RIGHT) {
                    left += anchorWidth;
                }
                if (horizontalOrigin === CENTER) {
                    left += round(anchorWidth / 2);
                }
                if (horizontalPosition === RIGHT) {
                    left -= width;
                }
                if (horizontalPosition === CENTER) {
                    left -= round(width / 2);
                }
                return {
                    top: top,
                    left: left
                };
            }
        });
        ui.plugin(Popup);
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));


/** 
 * Copyright 2016 Telerik AD                                                                                                                                                                            
 *                                                                                                                                                                                                      
 * Licensed under the Apache License, Version 2.0 (the "License");                                                                                                                                      
 * you may not use this file except in compliance with the License.                                                                                                                                     
 * You may obtain a copy of the License at                                                                                                                                                              
 *                                                                                                                                                                                                      
 *     http://www.apache.org/licenses/LICENSE-2.0                                                                                                                                                       
 *                                                                                                                                                                                                      
 * Unless required by applicable law or agreed to in writing, software                                                                                                                                  
 * distributed under the License is distributed on an "AS IS" BASIS,                                                                                                                                    
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.                                                                                                                             
 * See the License for the specific language governing permissions and                                                                                                                                  
 * limitations under the License.                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.data.odata', ['kendo.core'], f);
}(function () {
    var __meta__ = {
        id: 'data.odata',
        name: 'OData',
        category: 'framework',
        depends: ['core'],
        hidden: true
    };
    (function ($, undefined) {
        var kendo = window.kendo, extend = $.extend, odataFilters = {
            eq: 'eq',
            neq: 'ne',
            gt: 'gt',
            gte: 'ge',
            lt: 'lt',
            lte: 'le',
            contains: 'substringof',
            doesnotcontain: 'substringof',
            endswith: 'endswith',
            startswith: 'startswith',
            isnull: 'eq',
            isnotnull: 'ne',
            isempty: 'eq',
            isnotempty: 'ne'
        }, odataFiltersVersionFour = extend({}, odataFilters, { contains: 'contains' }), mappers = {
            pageSize: $.noop,
            page: $.noop,
            filter: function (params, filter, useVersionFour) {
                if (filter) {
                    filter = toOdataFilter(filter, useVersionFour);
                    if (filter) {
                        params.$filter = filter;
                    }
                }
            },
            sort: function (params, orderby) {
                var expr = $.map(orderby, function (value) {
                    var order = value.field.replace(/\./g, '/');
                    if (value.dir === 'desc') {
                        order += ' desc';
                    }
                    return order;
                }).join(',');
                if (expr) {
                    params.$orderby = expr;
                }
            },
            skip: function (params, skip) {
                if (skip) {
                    params.$skip = skip;
                }
            },
            take: function (params, take) {
                if (take) {
                    params.$top = take;
                }
            }
        }, defaultDataType = { read: { dataType: 'jsonp' } };
        function toOdataFilter(filter, useOdataFour) {
            var result = [], logic = filter.logic || 'and', idx, length, field, type, format, operator, value, ignoreCase, filters = filter.filters;
            for (idx = 0, length = filters.length; idx < length; idx++) {
                filter = filters[idx];
                field = filter.field;
                value = filter.value;
                operator = filter.operator;
                if (filter.filters) {
                    filter = toOdataFilter(filter, useOdataFour);
                } else {
                    ignoreCase = filter.ignoreCase;
                    field = field.replace(/\./g, '/');
                    filter = odataFilters[operator];
                    if (useOdataFour) {
                        filter = odataFiltersVersionFour[operator];
                    }
                    if (operator === 'isnull' || operator === 'isnotnull') {
                        filter = kendo.format('{0} {1} null', field, filter);
                    } else if (operator === 'isempty' || operator === 'isnotempty') {
                        filter = kendo.format('{0} {1} \'\'', field, filter);
                    } else if (filter && value !== undefined) {
                        type = $.type(value);
                        if (type === 'string') {
                            format = '\'{1}\'';
                            value = value.replace(/'/g, '\'\'');
                            if (ignoreCase === true) {
                                field = 'tolower(' + field + ')';
                            }
                        } else if (type === 'date') {
                            if (useOdataFour) {
                                format = '{1:yyyy-MM-ddTHH:mm:ss+00:00}';
                            } else {
                                format = 'datetime\'{1:yyyy-MM-ddTHH:mm:ss}\'';
                            }
                        } else {
                            format = '{1}';
                        }
                        if (filter.length > 3) {
                            if (filter !== 'substringof') {
                                format = '{0}({2},' + format + ')';
                            } else {
                                format = '{0}(' + format + ',{2})';
                                if (operator === 'doesnotcontain') {
                                    if (useOdataFour) {
                                        format = '{0}({2},\'{1}\') eq -1';
                                        filter = 'indexof';
                                    } else {
                                        format += ' eq false';
                                    }
                                }
                            }
                        } else {
                            format = '{2} {0} ' + format;
                        }
                        filter = kendo.format(format, filter, value, field);
                    }
                }
                result.push(filter);
            }
            filter = result.join(' ' + logic + ' ');
            if (result.length > 1) {
                filter = '(' + filter + ')';
            }
            return filter;
        }
        function stripMetadata(obj) {
            for (var name in obj) {
                if (name.indexOf('@odata') === 0) {
                    delete obj[name];
                }
            }
        }
        extend(true, kendo.data, {
            schemas: {
                odata: {
                    type: 'json',
                    data: function (data) {
                        return data.d.results || [data.d];
                    },
                    total: 'd.__count'
                }
            },
            transports: {
                odata: {
                    read: {
                        cache: true,
                        dataType: 'jsonp',
                        jsonp: '$callback'
                    },
                    update: {
                        cache: true,
                        dataType: 'json',
                        contentType: 'application/json',
                        type: 'PUT'
                    },
                    create: {
                        cache: true,
                        dataType: 'json',
                        contentType: 'application/json',
                        type: 'POST'
                    },
                    destroy: {
                        cache: true,
                        dataType: 'json',
                        type: 'DELETE'
                    },
                    parameterMap: function (options, type, useVersionFour) {
                        var params, value, option, dataType;
                        options = options || {};
                        type = type || 'read';
                        dataType = (this.options || defaultDataType)[type];
                        dataType = dataType ? dataType.dataType : 'json';
                        if (type === 'read') {
                            params = { $inlinecount: 'allpages' };
                            if (dataType != 'json') {
                                params.$format = 'json';
                            }
                            for (option in options) {
                                if (mappers[option]) {
                                    mappers[option](params, options[option], useVersionFour);
                                } else {
                                    params[option] = options[option];
                                }
                            }
                        } else {
                            if (dataType !== 'json') {
                                throw new Error('Only json dataType can be used for ' + type + ' operation.');
                            }
                            if (type !== 'destroy') {
                                for (option in options) {
                                    value = options[option];
                                    if (typeof value === 'number') {
                                        options[option] = value + '';
                                    }
                                }
                                params = kendo.stringify(options);
                            }
                        }
                        return params;
                    }
                }
            }
        });
        extend(true, kendo.data, {
            schemas: {
                'odata-v4': {
                    type: 'json',
                    data: function (data) {
                        data = $.extend({}, data);
                        stripMetadata(data);
                        if (data.value) {
                            return data.value;
                        }
                        return [data];
                    },
                    total: function (data) {
                        return data['@odata.count'];
                    }
                }
            },
            transports: {
                'odata-v4': {
                    read: {
                        cache: true,
                        dataType: 'json'
                    },
                    update: {
                        cache: true,
                        dataType: 'json',
                        contentType: 'application/json;IEEE754Compatible=true',
                        type: 'PUT'
                    },
                    create: {
                        cache: true,
                        dataType: 'json',
                        contentType: 'application/json;IEEE754Compatible=true',
                        type: 'POST'
                    },
                    destroy: {
                        cache: true,
                        dataType: 'json',
                        type: 'DELETE'
                    },
                    parameterMap: function (options, type) {
                        var result = kendo.data.transports.odata.parameterMap(options, type, true);
                        if (type == 'read') {
                            result.$count = true;
                            delete result.$inlinecount;
                        }
                        return result;
                    }
                }
            }
        });
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));

/** 
 * Copyright 2016 Telerik AD                                                                                                                                                                            
 *                                                                                                                                                                                                      
 * Licensed under the Apache License, Version 2.0 (the "License");                                                                                                                                      
 * you may not use this file except in compliance with the License.                                                                                                                                     
 * You may obtain a copy of the License at                                                                                                                                                              
 *                                                                                                                                                                                                      
 *     http://www.apache.org/licenses/LICENSE-2.0                                                                                                                                                       
 *                                                                                                                                                                                                      
 * Unless required by applicable law or agreed to in writing, software                                                                                                                                  
 * distributed under the License is distributed on an "AS IS" BASIS,                                                                                                                                    
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.                                                                                                                             
 * See the License for the specific language governing permissions and                                                                                                                                  
 * limitations under the License.                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.data.xml', ['kendo.core'], f);
}(function () {
    var __meta__ = {
        id: 'data.xml',
        name: 'XML',
        category: 'framework',
        depends: ['core'],
        hidden: true
    };
    (function ($, undefined) {
        var kendo = window.kendo, isArray = $.isArray, isPlainObject = $.isPlainObject, map = $.map, each = $.each, extend = $.extend, getter = kendo.getter, Class = kendo.Class;
        var XmlDataReader = Class.extend({
            init: function (options) {
                var that = this, total = options.total, model = options.model, parse = options.parse, errors = options.errors, serialize = options.serialize, data = options.data;
                if (model) {
                    if (isPlainObject(model)) {
                        var base = options.modelBase || kendo.data.Model;
                        if (model.fields) {
                            each(model.fields, function (field, value) {
                                if (isPlainObject(value) && value.field) {
                                    if (!$.isFunction(value.field)) {
                                        value = extend(value, { field: that.getter(value.field) });
                                    }
                                } else {
                                    value = { field: that.getter(value) };
                                }
                                model.fields[field] = value;
                            });
                        }
                        var id = model.id;
                        if (id) {
                            var idField = {};
                            idField[that.xpathToMember(id, true)] = { field: that.getter(id) };
                            model.fields = extend(idField, model.fields);
                            model.id = that.xpathToMember(id);
                        }
                        model = base.define(model);
                    }
                    that.model = model;
                }
                if (total) {
                    if (typeof total == 'string') {
                        total = that.getter(total);
                        that.total = function (data) {
                            return parseInt(total(data), 10);
                        };
                    } else if (typeof total == 'function') {
                        that.total = total;
                    }
                }
                if (errors) {
                    if (typeof errors == 'string') {
                        errors = that.getter(errors);
                        that.errors = function (data) {
                            return errors(data) || null;
                        };
                    } else if (typeof errors == 'function') {
                        that.errors = errors;
                    }
                }
                if (data) {
                    if (typeof data == 'string') {
                        data = that.xpathToMember(data);
                        that.data = function (value) {
                            var result = that.evaluate(value, data), modelInstance;
                            result = isArray(result) ? result : [result];
                            if (that.model && model.fields) {
                                modelInstance = new that.model();
                                return map(result, function (value) {
                                    if (value) {
                                        var record = {}, field;
                                        for (field in model.fields) {
                                            record[field] = modelInstance._parse(field, model.fields[field].field(value));
                                        }
                                        return record;
                                    }
                                });
                            }
                            return result;
                        };
                    } else if (typeof data == 'function') {
                        that.data = data;
                    }
                }
                if (typeof parse == 'function') {
                    var xmlParse = that.parse;
                    that.parse = function (data) {
                        var xml = parse.call(that, data);
                        return xmlParse.call(that, xml);
                    };
                }
                if (typeof serialize == 'function') {
                    that.serialize = serialize;
                }
            },
            total: function (result) {
                return this.data(result).length;
            },
            errors: function (data) {
                return data ? data.errors : null;
            },
            serialize: function (data) {
                return data;
            },
            parseDOM: function (element) {
                var result = {}, parsedNode, node, nodeType, nodeName, member, attribute, attributes = element.attributes, attributeCount = attributes.length, idx;
                for (idx = 0; idx < attributeCount; idx++) {
                    attribute = attributes[idx];
                    result['@' + attribute.nodeName] = attribute.nodeValue;
                }
                for (node = element.firstChild; node; node = node.nextSibling) {
                    nodeType = node.nodeType;
                    if (nodeType === 3 || nodeType === 4) {
                        result['#text'] = node.nodeValue;
                    } else if (nodeType === 1) {
                        parsedNode = this.parseDOM(node);
                        nodeName = node.nodeName;
                        member = result[nodeName];
                        if (isArray(member)) {
                            member.push(parsedNode);
                        } else if (member !== undefined) {
                            member = [
                                member,
                                parsedNode
                            ];
                        } else {
                            member = parsedNode;
                        }
                        result[nodeName] = member;
                    }
                }
                return result;
            },
            evaluate: function (value, expression) {
                var members = expression.split('.'), member, result, length, intermediateResult, idx;
                while (member = members.shift()) {
                    value = value[member];
                    if (isArray(value)) {
                        result = [];
                        expression = members.join('.');
                        for (idx = 0, length = value.length; idx < length; idx++) {
                            intermediateResult = this.evaluate(value[idx], expression);
                            intermediateResult = isArray(intermediateResult) ? intermediateResult : [intermediateResult];
                            result.push.apply(result, intermediateResult);
                        }
                        return result;
                    }
                }
                return value;
            },
            parse: function (xml) {
                var documentElement, tree, result = {};
                documentElement = xml.documentElement || $.parseXML(xml).documentElement;
                tree = this.parseDOM(documentElement);
                result[documentElement.nodeName] = tree;
                return result;
            },
            xpathToMember: function (member, raw) {
                if (!member) {
                    return '';
                }
                member = member.replace(/^\//, '').replace(/\//g, '.');
                if (member.indexOf('@') >= 0) {
                    return member.replace(/\.?(@.*)/, raw ? '$1' : '["$1"]');
                }
                if (member.indexOf('text()') >= 0) {
                    return member.replace(/(\.?text\(\))/, raw ? '#text' : '["#text"]');
                }
                return member;
            },
            getter: function (member) {
                return getter(this.xpathToMember(member), true);
            }
        });
        $.extend(true, kendo.data, {
            XmlDataReader: XmlDataReader,
            readers: { xml: XmlDataReader }
        });
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));


/** 
 * Copyright 2016 Telerik AD                                                                                                                                                                            
 *                                                                                                                                                                                                      
 * Licensed under the Apache License, Version 2.0 (the "License");                                                                                                                                      
 * you may not use this file except in compliance with the License.                                                                                                                                     
 * You may obtain a copy of the License at                                                                                                                                                              
 *                                                                                                                                                                                                      
 *     http://www.apache.org/licenses/LICENSE-2.0                                                                                                                                                       
 *                                                                                                                                                                                                      
 * Unless required by applicable law or agreed to in writing, software                                                                                                                                  
 * distributed under the License is distributed on an "AS IS" BASIS,                                                                                                                                    
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.                                                                                                                             
 * See the License for the specific language governing permissions and                                                                                                                                  
 * limitations under the License.                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.data', [
        'kendo.core',
        'kendo.data.odata',
        'kendo.data.xml'
    ], f);
}(function () {
    var __meta__ = {
        id: 'data',
        name: 'Data source',
        category: 'framework',
        description: 'Powerful component for using local and remote data.Fully supports CRUD, Sorting, Paging, Filtering, Grouping, and Aggregates.',
        depends: ['core'],
        features: [
            {
                id: 'data-odata',
                name: 'OData',
                description: 'Support for accessing Open Data Protocol (OData) services.',
                depends: ['data.odata']
            },
            {
                id: 'data-signalr',
                name: 'SignalR',
                description: 'Support for binding to SignalR hubs.',
                depends: ['data.signalr']
            },
            {
                id: 'data-XML',
                name: 'XML',
                description: 'Support for binding to XML.',
                depends: ['data.xml']
            }
        ]
    };
    (function ($, undefined) {
        var extend = $.extend, proxy = $.proxy, isPlainObject = $.isPlainObject, isEmptyObject = $.isEmptyObject, isArray = $.isArray, grep = $.grep, ajax = $.ajax, map, each = $.each, noop = $.noop, kendo = window.kendo, isFunction = kendo.isFunction, Observable = kendo.Observable, Class = kendo.Class, STRING = 'string', FUNCTION = 'function', CREATE = 'create', READ = 'read', UPDATE = 'update', DESTROY = 'destroy', CHANGE = 'change', SYNC = 'sync', GET = 'get', ERROR = 'error', REQUESTSTART = 'requestStart', PROGRESS = 'progress', REQUESTEND = 'requestEnd', crud = [
            CREATE,
            READ,
            UPDATE,
            DESTROY
        ], identity = function (o) {
            return o;
        }, getter = kendo.getter, stringify = kendo.stringify, math = Math, push = [].push, join = [].join, pop = [].pop, splice = [].splice, shift = [].shift, slice = [].slice, unshift = [].unshift, toString = {}.toString, stableSort = kendo.support.stableSort, dateRegExp = /^\/Date\((.*?)\)\/$/, newLineRegExp = /(\r+|\n+)/g, quoteRegExp = /(?=['\\])/g;
        var ObservableArray = Observable.extend({
            init: function (array, type) {
                var that = this;
                that.type = type || ObservableObject;
                Observable.fn.init.call(that);
                that.length = array.length;
                that.wrapAll(array, that);
            },
            at: function (index) {
                return this[index];
            },
            toJSON: function () {
                var idx, length = this.length, value, json = new Array(length);
                for (idx = 0; idx < length; idx++) {
                    value = this[idx];
                    if (value instanceof ObservableObject) {
                        value = value.toJSON();
                    }
                    json[idx] = value;
                }
                return json;
            },
            parent: noop,
            wrapAll: function (source, target) {
                var that = this, idx, length, parent = function () {
                    return that;
                };
                target = target || [];
                for (idx = 0, length = source.length; idx < length; idx++) {
                    target[idx] = that.wrap(source[idx], parent);
                }
                return target;
            },
            wrap: function (object, parent) {
                var that = this, observable;
                if (object !== null && toString.call(object) === '[object Object]') {
                    observable = object instanceof that.type || object instanceof Model;
                    if (!observable) {
                        object = object instanceof ObservableObject ? object.toJSON() : object;
                        object = new that.type(object);
                    }
                    object.parent = parent;
                    object.bind(CHANGE, function (e) {
                        that.trigger(CHANGE, {
                            field: e.field,
                            node: e.node,
                            index: e.index,
                            items: e.items || [this],
                            action: e.node ? e.action || 'itemloaded' : 'itemchange'
                        });
                    });
                }
                return object;
            },
            push: function () {
                var index = this.length, items = this.wrapAll(arguments), result;
                result = push.apply(this, items);
                this.trigger(CHANGE, {
                    action: 'add',
                    index: index,
                    items: items
                });
                return result;
            },
            slice: slice,
            sort: [].sort,
            join: join,
            pop: function () {
                var length = this.length, result = pop.apply(this);
                if (length) {
                    this.trigger(CHANGE, {
                        action: 'remove',
                        index: length - 1,
                        items: [result]
                    });
                }
                return result;
            },
            splice: function (index, howMany, item) {
                var items = this.wrapAll(slice.call(arguments, 2)), result, i, len;
                result = splice.apply(this, [
                    index,
                    howMany
                ].concat(items));
                if (result.length) {
                    this.trigger(CHANGE, {
                        action: 'remove',
                        index: index,
                        items: result
                    });
                    for (i = 0, len = result.length; i < len; i++) {
                        if (result[i] && result[i].children) {
                            result[i].unbind(CHANGE);
                        }
                    }
                }
                if (item) {
                    this.trigger(CHANGE, {
                        action: 'add',
                        index: index,
                        items: items
                    });
                }
                return result;
            },
            shift: function () {
                var length = this.length, result = shift.apply(this);
                if (length) {
                    this.trigger(CHANGE, {
                        action: 'remove',
                        index: 0,
                        items: [result]
                    });
                }
                return result;
            },
            unshift: function () {
                var items = this.wrapAll(arguments), result;
                result = unshift.apply(this, items);
                this.trigger(CHANGE, {
                    action: 'add',
                    index: 0,
                    items: items
                });
                return result;
            },
            indexOf: function (item) {
                var that = this, idx, length;
                for (idx = 0, length = that.length; idx < length; idx++) {
                    if (that[idx] === item) {
                        return idx;
                    }
                }
                return -1;
            },
            forEach: function (callback) {
                var idx = 0, length = this.length;
                for (; idx < length; idx++) {
                    callback(this[idx], idx, this);
                }
            },
            map: function (callback) {
                var idx = 0, result = [], length = this.length;
                for (; idx < length; idx++) {
                    result[idx] = callback(this[idx], idx, this);
                }
                return result;
            },
            reduce: function (callback) {
                var idx = 0, result, length = this.length;
                if (arguments.length == 2) {
                    result = arguments[1];
                } else if (idx < length) {
                    result = this[idx++];
                }
                for (; idx < length; idx++) {
                    result = callback(result, this[idx], idx, this);
                }
                return result;
            },
            reduceRight: function (callback) {
                var idx = this.length - 1, result;
                if (arguments.length == 2) {
                    result = arguments[1];
                } else if (idx > 0) {
                    result = this[idx--];
                }
                for (; idx >= 0; idx--) {
                    result = callback(result, this[idx], idx, this);
                }
                return result;
            },
            filter: function (callback) {
                var idx = 0, result = [], item, length = this.length;
                for (; idx < length; idx++) {
                    item = this[idx];
                    if (callback(item, idx, this)) {
                        result[result.length] = item;
                    }
                }
                return result;
            },
            find: function (callback) {
                var idx = 0, item, length = this.length;
                for (; idx < length; idx++) {
                    item = this[idx];
                    if (callback(item, idx, this)) {
                        return item;
                    }
                }
            },
            every: function (callback) {
                var idx = 0, item, length = this.length;
                for (; idx < length; idx++) {
                    item = this[idx];
                    if (!callback(item, idx, this)) {
                        return false;
                    }
                }
                return true;
            },
            some: function (callback) {
                var idx = 0, item, length = this.length;
                for (; idx < length; idx++) {
                    item = this[idx];
                    if (callback(item, idx, this)) {
                        return true;
                    }
                }
                return false;
            },
            remove: function (item) {
                var idx = this.indexOf(item);
                if (idx !== -1) {
                    this.splice(idx, 1);
                }
            },
            empty: function () {
                this.splice(0, this.length);
            }
        });
        var LazyObservableArray = ObservableArray.extend({
            init: function (data, type) {
                Observable.fn.init.call(this);
                this.type = type || ObservableObject;
                for (var idx = 0; idx < data.length; idx++) {
                    this[idx] = data[idx];
                }
                this.length = idx;
                this._parent = proxy(function () {
                    return this;
                }, this);
            },
            at: function (index) {
                var item = this[index];
                if (!(item instanceof this.type)) {
                    item = this[index] = this.wrap(item, this._parent);
                } else {
                    item.parent = this._parent;
                }
                return item;
            }
        });
        function eventHandler(context, type, field, prefix) {
            return function (e) {
                var event = {}, key;
                for (key in e) {
                    event[key] = e[key];
                }
                if (prefix) {
                    event.field = field + '.' + e.field;
                } else {
                    event.field = field;
                }
                if (type == CHANGE && context._notifyChange) {
                    context._notifyChange(event);
                }
                context.trigger(type, event);
            };
        }
        var ObservableObject = Observable.extend({
            init: function (value) {
                var that = this, member, field, parent = function () {
                    return that;
                };
                Observable.fn.init.call(this);
                this._handlers = {};
                for (field in value) {
                    member = value[field];
                    if (typeof member === 'object' && member && !member.getTime && field.charAt(0) != '_') {
                        member = that.wrap(member, field, parent);
                    }
                    that[field] = member;
                }
                that.uid = kendo.guid();
            },
            shouldSerialize: function (field) {
                return this.hasOwnProperty(field) && field !== '_handlers' && field !== '_events' && typeof this[field] !== FUNCTION && field !== 'uid';
            },
            forEach: function (f) {
                for (var i in this) {
                    if (this.shouldSerialize(i)) {
                        f(this[i], i);
                    }
                }
            },
            toJSON: function () {
                var result = {}, value, field;
                for (field in this) {
                    if (this.shouldSerialize(field)) {
                        value = this[field];
                        if (value instanceof ObservableObject || value instanceof ObservableArray) {
                            value = value.toJSON();
                        }
                        result[field] = value;
                    }
                }
                return result;
            },
            get: function (field) {
                var that = this, result;
                that.trigger(GET, { field: field });
                if (field === 'this') {
                    result = that;
                } else {
                    result = kendo.getter(field, true)(that);
                }
                return result;
            },
            _set: function (field, value) {
                var that = this;
                var composite = field.indexOf('.') >= 0;
                if (composite) {
                    var paths = field.split('.'), path = '';
                    while (paths.length > 1) {
                        path += paths.shift();
                        var obj = kendo.getter(path, true)(that);
                        if (obj instanceof ObservableObject) {
                            obj.set(paths.join('.'), value);
                            return composite;
                        }
                        path += '.';
                    }
                }
                kendo.setter(field)(that, value);
                return composite;
            },
            set: function (field, value) {
                var that = this, isSetPrevented = false, composite = field.indexOf('.') >= 0, current = kendo.getter(field, true)(that);
                if (current !== value) {
                    if (current instanceof Observable && this._handlers[field]) {
                        if (this._handlers[field].get) {
                            current.unbind(GET, this._handlers[field].get);
                        }
                        current.unbind(CHANGE, this._handlers[field].change);
                    }
                    isSetPrevented = that.trigger('set', {
                        field: field,
                        value: value
                    });
                    if (!isSetPrevented) {
                        if (!composite) {
                            value = that.wrap(value, field, function () {
                                return that;
                            });
                        }
                        if (!that._set(field, value) || field.indexOf('(') >= 0 || field.indexOf('[') >= 0) {
                            that.trigger(CHANGE, { field: field });
                        }
                    }
                }
                return isSetPrevented;
            },
            parent: noop,
            wrap: function (object, field, parent) {
                var that = this;
                var get;
                var change;
                var type = toString.call(object);
                if (object != null && (type === '[object Object]' || type === '[object Array]')) {
                    var isObservableArray = object instanceof ObservableArray;
                    var isDataSource = object instanceof DataSource;
                    if (type === '[object Object]' && !isDataSource && !isObservableArray) {
                        if (!(object instanceof ObservableObject)) {
                            object = new ObservableObject(object);
                        }
                        get = eventHandler(that, GET, field, true);
                        object.bind(GET, get);
                        change = eventHandler(that, CHANGE, field, true);
                        object.bind(CHANGE, change);
                        that._handlers[field] = {
                            get: get,
                            change: change
                        };
                    } else if (type === '[object Array]' || isObservableArray || isDataSource) {
                        if (!isObservableArray && !isDataSource) {
                            object = new ObservableArray(object);
                        }
                        change = eventHandler(that, CHANGE, field, false);
                        object.bind(CHANGE, change);
                        that._handlers[field] = { change: change };
                    }
                    object.parent = parent;
                }
                return object;
            }
        });
        function equal(x, y) {
            if (x === y) {
                return true;
            }
            var xtype = $.type(x), ytype = $.type(y), field;
            if (xtype !== ytype) {
                return false;
            }
            if (xtype === 'date') {
                return x.getTime() === y.getTime();
            }
            if (xtype !== 'object' && xtype !== 'array') {
                return false;
            }
            for (field in x) {
                if (!equal(x[field], y[field])) {
                    return false;
                }
            }
            return true;
        }
        var parsers = {
            'number': function (value) {
                return kendo.parseFloat(value);
            },
            'date': function (value) {
                return kendo.parseDate(value);
            },
            'boolean': function (value) {
                if (typeof value === STRING) {
                    return value.toLowerCase() === 'true';
                }
                return value != null ? !!value : value;
            },
            'string': function (value) {
                return value != null ? value + '' : value;
            },
            'default': function (value) {
                return value;
            }
        };
        var defaultValues = {
            'string': '',
            'number': 0,
            'date': new Date(),
            'boolean': false,
            'default': ''
        };
        function getFieldByName(obj, name) {
            var field, fieldName;
            for (fieldName in obj) {
                field = obj[fieldName];
                if (isPlainObject(field) && field.field && field.field === name) {
                    return field;
                } else if (field === name) {
                    return field;
                }
            }
            return null;
        }
        var Model = ObservableObject.extend({
            init: function (data) {
                var that = this;
                if (!data || $.isEmptyObject(data)) {
                    data = $.extend({}, that.defaults, data);
                    if (that._initializers) {
                        for (var idx = 0; idx < that._initializers.length; idx++) {
                            var name = that._initializers[idx];
                            data[name] = that.defaults[name]();
                        }
                    }
                }
                ObservableObject.fn.init.call(that, data);
                that.dirty = false;
                if (that.idField) {
                    that.id = that.get(that.idField);
                    if (that.id === undefined) {
                        that.id = that._defaultId;
                    }
                }
            },
            shouldSerialize: function (field) {
                return ObservableObject.fn.shouldSerialize.call(this, field) && field !== 'uid' && !(this.idField !== 'id' && field === 'id') && field !== 'dirty' && field !== '_accessors';
            },
            _parse: function (field, value) {
                var that = this, fieldName = field, fields = that.fields || {}, parse;
                field = fields[field];
                if (!field) {
                    field = getFieldByName(fields, fieldName);
                }
                if (field) {
                    parse = field.parse;
                    if (!parse && field.type) {
                        parse = parsers[field.type.toLowerCase()];
                    }
                }
                return parse ? parse(value) : value;
            },
            _notifyChange: function (e) {
                var action = e.action;
                if (action == 'add' || action == 'remove') {
                    this.dirty = true;
                }
            },
            editable: function (field) {
                field = (this.fields || {})[field];
                return field ? field.editable !== false : true;
            },
            set: function (field, value, initiator) {
                var that = this;
                var dirty = that.dirty;
                if (that.editable(field)) {
                    value = that._parse(field, value);
                    if (!equal(value, that.get(field))) {
                        that.dirty = true;
                        if (ObservableObject.fn.set.call(that, field, value, initiator) && !dirty) {
                            that.dirty = dirty;
                        }
                    }
                }
            },
            accept: function (data) {
                var that = this, parent = function () {
                    return that;
                }, field;
                for (field in data) {
                    var value = data[field];
                    if (field.charAt(0) != '_') {
                        value = that.wrap(data[field], field, parent);
                    }
                    that._set(field, value);
                }
                if (that.idField) {
                    that.id = that.get(that.idField);
                }
                that.dirty = false;
            },
            isNew: function () {
                return this.id === this._defaultId;
            }
        });
        Model.define = function (base, options) {
            if (options === undefined) {
                options = base;
                base = Model;
            }
            var model, proto = extend({ defaults: {} }, options), name, field, type, value, idx, length, fields = {}, originalName, id = proto.id, functionFields = [];
            if (id) {
                proto.idField = id;
            }
            if (proto.id) {
                delete proto.id;
            }
            if (id) {
                proto.defaults[id] = proto._defaultId = '';
            }
            if (toString.call(proto.fields) === '[object Array]') {
                for (idx = 0, length = proto.fields.length; idx < length; idx++) {
                    field = proto.fields[idx];
                    if (typeof field === STRING) {
                        fields[field] = {};
                    } else if (field.field) {
                        fields[field.field] = field;
                    }
                }
                proto.fields = fields;
            }
            for (name in proto.fields) {
                field = proto.fields[name];
                type = field.type || 'default';
                value = null;
                originalName = name;
                name = typeof field.field === STRING ? field.field : name;
                if (!field.nullable) {
                    value = proto.defaults[originalName !== name ? originalName : name] = field.defaultValue !== undefined ? field.defaultValue : defaultValues[type.toLowerCase()];
                    if (typeof value === 'function') {
                        functionFields.push(name);
                    }
                }
                if (options.id === name) {
                    proto._defaultId = value;
                }
                proto.defaults[originalName !== name ? originalName : name] = value;
                field.parse = field.parse || parsers[type];
            }
            if (functionFields.length > 0) {
                proto._initializers = functionFields;
            }
            model = base.extend(proto);
            model.define = function (options) {
                return Model.define(model, options);
            };
            if (proto.fields) {
                model.fields = proto.fields;
                model.idField = proto.idField;
            }
            return model;
        };
        var Comparer = {
            selector: function (field) {
                return isFunction(field) ? field : getter(field);
            },
            compare: function (field) {
                var selector = this.selector(field);
                return function (a, b) {
                    a = selector(a);
                    b = selector(b);
                    if (a == null && b == null) {
                        return 0;
                    }
                    if (a == null) {
                        return -1;
                    }
                    if (b == null) {
                        return 1;
                    }
                    if (a.localeCompare) {
                        return a.localeCompare(b);
                    }
                    return a > b ? 1 : a < b ? -1 : 0;
                };
            },
            create: function (sort) {
                var compare = sort.compare || this.compare(sort.field);
                if (sort.dir == 'desc') {
                    return function (a, b) {
                        return compare(b, a, true);
                    };
                }
                return compare;
            },
            combine: function (comparers) {
                return function (a, b) {
                    var result = comparers[0](a, b), idx, length;
                    for (idx = 1, length = comparers.length; idx < length; idx++) {
                        result = result || comparers[idx](a, b);
                    }
                    return result;
                };
            }
        };
        var StableComparer = extend({}, Comparer, {
            asc: function (field) {
                var selector = this.selector(field);
                return function (a, b) {
                    var valueA = selector(a);
                    var valueB = selector(b);
                    if (valueA && valueA.getTime && valueB && valueB.getTime) {
                        valueA = valueA.getTime();
                        valueB = valueB.getTime();
                    }
                    if (valueA === valueB) {
                        return a.__position - b.__position;
                    }
                    if (valueA == null) {
                        return -1;
                    }
                    if (valueB == null) {
                        return 1;
                    }
                    if (valueA.localeCompare) {
                        return valueA.localeCompare(valueB);
                    }
                    return valueA > valueB ? 1 : -1;
                };
            },
            desc: function (field) {
                var selector = this.selector(field);
                return function (a, b) {
                    var valueA = selector(a);
                    var valueB = selector(b);
                    if (valueA && valueA.getTime && valueB && valueB.getTime) {
                        valueA = valueA.getTime();
                        valueB = valueB.getTime();
                    }
                    if (valueA === valueB) {
                        return a.__position - b.__position;
                    }
                    if (valueA == null) {
                        return 1;
                    }
                    if (valueB == null) {
                        return -1;
                    }
                    if (valueB.localeCompare) {
                        return valueB.localeCompare(valueA);
                    }
                    return valueA < valueB ? 1 : -1;
                };
            },
            create: function (sort) {
                return this[sort.dir](sort.field);
            }
        });
        map = function (array, callback) {
            var idx, length = array.length, result = new Array(length);
            for (idx = 0; idx < length; idx++) {
                result[idx] = callback(array[idx], idx, array);
            }
            return result;
        };
        var operators = function () {
            function quote(value) {
                return value.replace(quoteRegExp, '\\').replace(newLineRegExp, '');
            }
            function operator(op, a, b, ignore) {
                var date;
                if (b != null) {
                    if (typeof b === STRING) {
                        b = quote(b);
                        date = dateRegExp.exec(b);
                        if (date) {
                            b = new Date(+date[1]);
                        } else if (ignore) {
                            b = '\'' + b.toLowerCase() + '\'';
                            a = '((' + a + ' || \'\')+\'\').toLowerCase()';
                        } else {
                            b = '\'' + b + '\'';
                        }
                    }
                    if (b.getTime) {
                        a = '(' + a + '&&' + a + '.getTime?' + a + '.getTime():' + a + ')';
                        b = b.getTime();
                    }
                }
                return a + ' ' + op + ' ' + b;
            }
            return {
                quote: function (value) {
                    if (value && value.getTime) {
                        return 'new Date(' + value.getTime() + ')';
                    }
                    if (typeof value == 'string') {
                        return '\'' + quote(value) + '\'';
                    }
                    return '' + value;
                },
                eq: function (a, b, ignore) {
                    return operator('==', a, b, ignore);
                },
                neq: function (a, b, ignore) {
                    return operator('!=', a, b, ignore);
                },
                gt: function (a, b, ignore) {
                    return operator('>', a, b, ignore);
                },
                gte: function (a, b, ignore) {
                    return operator('>=', a, b, ignore);
                },
                lt: function (a, b, ignore) {
                    return operator('<', a, b, ignore);
                },
                lte: function (a, b, ignore) {
                    return operator('<=', a, b, ignore);
                },
                startswith: function (a, b, ignore) {
                    if (ignore) {
                        a = '(' + a + ' || \'\').toLowerCase()';
                        if (b) {
                            b = b.toLowerCase();
                        }
                    }
                    if (b) {
                        b = quote(b);
                    }
                    return a + '.lastIndexOf(\'' + b + '\', 0) == 0';
                },
                doesnotstartwith: function (a, b, ignore) {
                    if (ignore) {
                        a = '(' + a + ' || \'\').toLowerCase()';
                        if (b) {
                            b = b.toLowerCase();
                        }
                    }
                    if (b) {
                        b = quote(b);
                    }
                    return a + '.lastIndexOf(\'' + b + '\', 0) == -1';
                },
                endswith: function (a, b, ignore) {
                    if (ignore) {
                        a = '(' + a + ' || \'\').toLowerCase()';
                        if (b) {
                            b = b.toLowerCase();
                        }
                    }
                    if (b) {
                        b = quote(b);
                    }
                    return a + '.indexOf(\'' + b + '\', ' + a + '.length - ' + (b || '').length + ') >= 0';
                },
                doesnotendwith: function (a, b, ignore) {
                    if (ignore) {
                        a = '(' + a + ' || \'\').toLowerCase()';
                        if (b) {
                            b = b.toLowerCase();
                        }
                    }
                    if (b) {
                        b = quote(b);
                    }
                    return a + '.indexOf(\'' + b + '\', ' + a + '.length - ' + (b || '').length + ') < 0';
                },
                contains: function (a, b, ignore) {
                    if (ignore) {
                        a = '(' + a + ' || \'\').toLowerCase()';
                        if (b) {
                            b = b.toLowerCase();
                        }
                    }
                    if (b) {
                        b = quote(b);
                    }
                    return a + '.indexOf(\'' + b + '\') >= 0';
                },
                doesnotcontain: function (a, b, ignore) {
                    if (ignore) {
                        a = '(' + a + ' || \'\').toLowerCase()';
                        if (b) {
                            b = b.toLowerCase();
                        }
                    }
                    if (b) {
                        b = quote(b);
                    }
                    return a + '.indexOf(\'' + b + '\') == -1';
                },
                isempty: function (a) {
                    return a + ' === \'\'';
                },
                isnotempty: function (a) {
                    return a + ' !== \'\'';
                },
                isnull: function (a) {
                    return '(' + a + ' === null || ' + a + ' === undefined)';
                },
                isnotnull: function (a) {
                    return '(' + a + ' !== null && ' + a + ' !== undefined)';
                }
            };
        }();
        function Query(data) {
            this.data = data || [];
        }
        Query.filterExpr = function (expression) {
            var expressions = [], logic = {
                and: ' && ',
                or: ' || '
            }, idx, length, filter, expr, fieldFunctions = [], operatorFunctions = [], field, operator, filters = expression.filters;
            for (idx = 0, length = filters.length; idx < length; idx++) {
                filter = filters[idx];
                field = filter.field;
                operator = filter.operator;
                if (filter.filters) {
                    expr = Query.filterExpr(filter);
                    filter = expr.expression.replace(/__o\[(\d+)\]/g, function (match, index) {
                        index = +index;
                        return '__o[' + (operatorFunctions.length + index) + ']';
                    }).replace(/__f\[(\d+)\]/g, function (match, index) {
                        index = +index;
                        return '__f[' + (fieldFunctions.length + index) + ']';
                    });
                    operatorFunctions.push.apply(operatorFunctions, expr.operators);
                    fieldFunctions.push.apply(fieldFunctions, expr.fields);
                } else {
                    if (typeof field === FUNCTION) {
                        expr = '__f[' + fieldFunctions.length + '](d)';
                        fieldFunctions.push(field);
                    } else {
                        expr = kendo.expr(field);
                    }
                    if (typeof operator === FUNCTION) {
                        filter = '__o[' + operatorFunctions.length + '](' + expr + ', ' + operators.quote(filter.value) + ')';
                        operatorFunctions.push(operator);
                    } else {
                        filter = operators[(operator || 'eq').toLowerCase()](expr, filter.value, filter.ignoreCase !== undefined ? filter.ignoreCase : true);
                    }
                }
                expressions.push(filter);
            }
            return {
                expression: '(' + expressions.join(logic[expression.logic]) + ')',
                fields: fieldFunctions,
                operators: operatorFunctions
            };
        };
        function normalizeSort(field, dir) {
            if (field) {
                var descriptor = typeof field === STRING ? {
                    field: field,
                    dir: dir
                } : field, descriptors = isArray(descriptor) ? descriptor : descriptor !== undefined ? [descriptor] : [];
                return grep(descriptors, function (d) {
                    return !!d.dir;
                });
            }
        }
        var operatorMap = {
            '==': 'eq',
            equals: 'eq',
            isequalto: 'eq',
            equalto: 'eq',
            equal: 'eq',
            '!=': 'neq',
            ne: 'neq',
            notequals: 'neq',
            isnotequalto: 'neq',
            notequalto: 'neq',
            notequal: 'neq',
            '<': 'lt',
            islessthan: 'lt',
            lessthan: 'lt',
            less: 'lt',
            '<=': 'lte',
            le: 'lte',
            islessthanorequalto: 'lte',
            lessthanequal: 'lte',
            '>': 'gt',
            isgreaterthan: 'gt',
            greaterthan: 'gt',
            greater: 'gt',
            '>=': 'gte',
            isgreaterthanorequalto: 'gte',
            greaterthanequal: 'gte',
            ge: 'gte',
            notsubstringof: 'doesnotcontain',
            isnull: 'isnull',
            isempty: 'isempty',
            isnotempty: 'isnotempty'
        };
        function normalizeOperator(expression) {
            var idx, length, filter, operator, filters = expression.filters;
            if (filters) {
                for (idx = 0, length = filters.length; idx < length; idx++) {
                    filter = filters[idx];
                    operator = filter.operator;
                    if (operator && typeof operator === STRING) {
                        filter.operator = operatorMap[operator.toLowerCase()] || operator;
                    }
                    normalizeOperator(filter);
                }
            }
        }
        function normalizeFilter(expression) {
            if (expression && !isEmptyObject(expression)) {
                if (isArray(expression) || !expression.filters) {
                    expression = {
                        logic: 'and',
                        filters: isArray(expression) ? expression : [expression]
                    };
                }
                normalizeOperator(expression);
                return expression;
            }
        }
        Query.normalizeFilter = normalizeFilter;
        function compareDescriptor(f1, f2) {
            if (f1.logic || f2.logic) {
                return false;
            }
            return f1.field === f2.field && f1.value === f2.value && f1.operator === f2.operator;
        }
        function normalizeDescriptor(filter) {
            filter = filter || {};
            if (isEmptyObject(filter)) {
                return {
                    logic: 'and',
                    filters: []
                };
            }
            return normalizeFilter(filter);
        }
        function fieldComparer(a, b) {
            if (b.logic || a.field > b.field) {
                return 1;
            } else if (a.field < b.field) {
                return -1;
            } else {
                return 0;
            }
        }
        function compareFilters(expr1, expr2) {
            expr1 = normalizeDescriptor(expr1);
            expr2 = normalizeDescriptor(expr2);
            if (expr1.logic !== expr2.logic) {
                return false;
            }
            var f1, f2;
            var filters1 = (expr1.filters || []).slice();
            var filters2 = (expr2.filters || []).slice();
            if (filters1.length !== filters2.length) {
                return false;
            }
            filters1 = filters1.sort(fieldComparer);
            filters2 = filters2.sort(fieldComparer);
            for (var idx = 0; idx < filters1.length; idx++) {
                f1 = filters1[idx];
                f2 = filters2[idx];
                if (f1.logic && f2.logic) {
                    if (!compareFilters(f1, f2)) {
                        return false;
                    }
                } else if (!compareDescriptor(f1, f2)) {
                    return false;
                }
            }
            return true;
        }
        Query.compareFilters = compareFilters;
        function normalizeAggregate(expressions) {
            return isArray(expressions) ? expressions : [expressions];
        }
        function normalizeGroup(field, dir) {
            var descriptor = typeof field === STRING ? {
                field: field,
                dir: dir
            } : field, descriptors = isArray(descriptor) ? descriptor : descriptor !== undefined ? [descriptor] : [];
            return map(descriptors, function (d) {
                return {
                    field: d.field,
                    dir: d.dir || 'asc',
                    aggregates: d.aggregates
                };
            });
        }
        Query.prototype = {
            toArray: function () {
                return this.data;
            },
            range: function (index, count) {
                return new Query(this.data.slice(index, index + count));
            },
            skip: function (count) {
                return new Query(this.data.slice(count));
            },
            take: function (count) {
                return new Query(this.data.slice(0, count));
            },
            select: function (selector) {
                return new Query(map(this.data, selector));
            },
            order: function (selector, dir) {
                var sort = { dir: dir };
                if (selector) {
                    if (selector.compare) {
                        sort.compare = selector.compare;
                    } else {
                        sort.field = selector;
                    }
                }
                return new Query(this.data.slice(0).sort(Comparer.create(sort)));
            },
            orderBy: function (selector) {
                return this.order(selector, 'asc');
            },
            orderByDescending: function (selector) {
                return this.order(selector, 'desc');
            },
            sort: function (field, dir, comparer) {
                var idx, length, descriptors = normalizeSort(field, dir), comparers = [];
                comparer = comparer || Comparer;
                if (descriptors.length) {
                    for (idx = 0, length = descriptors.length; idx < length; idx++) {
                        comparers.push(comparer.create(descriptors[idx]));
                    }
                    return this.orderBy({ compare: comparer.combine(comparers) });
                }
                return this;
            },
            filter: function (expressions) {
                var idx, current, length, compiled, predicate, data = this.data, fields, operators, result = [], filter;
                expressions = normalizeFilter(expressions);
                if (!expressions || expressions.filters.length === 0) {
                    return this;
                }
                compiled = Query.filterExpr(expressions);
                fields = compiled.fields;
                operators = compiled.operators;
                predicate = filter = new Function('d, __f, __o', 'return ' + compiled.expression);
                if (fields.length || operators.length) {
                    filter = function (d) {
                        return predicate(d, fields, operators);
                    };
                }
                for (idx = 0, length = data.length; idx < length; idx++) {
                    current = data[idx];
                    if (filter(current)) {
                        result.push(current);
                    }
                }
                return new Query(result);
            },
            group: function (descriptors, allData) {
                descriptors = normalizeGroup(descriptors || []);
                allData = allData || this.data;
                var that = this, result = new Query(that.data), descriptor;
                if (descriptors.length > 0) {
                    descriptor = descriptors[0];
                    result = result.groupBy(descriptor).select(function (group) {
                        var data = new Query(allData).filter([{
                            field: group.field,
                            operator: 'eq',
                            value: group.value,
                            ignoreCase: false
                        }]);
                        return {
                            field: group.field,
                            value: group.value,
                            items: descriptors.length > 1 ? new Query(group.items).group(descriptors.slice(1), data.toArray()).toArray() : group.items,
                            hasSubgroups: descriptors.length > 1,
                            aggregates: data.aggregate(descriptor.aggregates)
                        };
                    });
                }
                return result;
            },
            groupBy: function (descriptor) {
                if (isEmptyObject(descriptor) || !this.data.length) {
                    return new Query([]);
                }
                var field = descriptor.field, sorted = this._sortForGrouping(field, descriptor.dir || 'asc'), accessor = kendo.accessor(field), item, groupValue = accessor.get(sorted[0], field), group = {
                    field: field,
                    value: groupValue,
                    items: []
                }, currentValue, idx, len, result = [group];
                for (idx = 0, len = sorted.length; idx < len; idx++) {
                    item = sorted[idx];
                    currentValue = accessor.get(item, field);
                    if (!groupValueComparer(groupValue, currentValue)) {
                        groupValue = currentValue;
                        group = {
                            field: field,
                            value: groupValue,
                            items: []
                        };
                        result.push(group);
                    }
                    group.items.push(item);
                }
                return new Query(result);
            },
            _sortForGrouping: function (field, dir) {
                var idx, length, data = this.data;
                if (!stableSort) {
                    for (idx = 0, length = data.length; idx < length; idx++) {
                        data[idx].__position = idx;
                    }
                    data = new Query(data).sort(field, dir, StableComparer).toArray();
                    for (idx = 0, length = data.length; idx < length; idx++) {
                        delete data[idx].__position;
                    }
                    return data;
                }
                return this.sort(field, dir).toArray();
            },
            aggregate: function (aggregates) {
                var idx, len, result = {}, state = {};
                if (aggregates && aggregates.length) {
                    for (idx = 0, len = this.data.length; idx < len; idx++) {
                        calculateAggregate(result, aggregates, this.data[idx], idx, len, state);
                    }
                }
                return result;
            }
        };
        function groupValueComparer(a, b) {
            if (a && a.getTime && b && b.getTime) {
                return a.getTime() === b.getTime();
            }
            return a === b;
        }
        function calculateAggregate(accumulator, aggregates, item, index, length, state) {
            aggregates = aggregates || [];
            var idx, aggr, functionName, len = aggregates.length;
            for (idx = 0; idx < len; idx++) {
                aggr = aggregates[idx];
                functionName = aggr.aggregate;
                var field = aggr.field;
                accumulator[field] = accumulator[field] || {};
                state[field] = state[field] || {};
                state[field][functionName] = state[field][functionName] || {};
                accumulator[field][functionName] = functions[functionName.toLowerCase()](accumulator[field][functionName], item, kendo.accessor(field), index, length, state[field][functionName]);
            }
        }
        var functions = {
            sum: function (accumulator, item, accessor) {
                var value = accessor.get(item);
                if (!isNumber(accumulator)) {
                    accumulator = value;
                } else if (isNumber(value)) {
                    accumulator += value;
                }
                return accumulator;
            },
            count: function (accumulator) {
                return (accumulator || 0) + 1;
            },
            average: function (accumulator, item, accessor, index, length, state) {
                var value = accessor.get(item);
                if (state.count === undefined) {
                    state.count = 0;
                }
                if (!isNumber(accumulator)) {
                    accumulator = value;
                } else if (isNumber(value)) {
                    accumulator += value;
                }
                if (isNumber(value)) {
                    state.count++;
                }
                if (index == length - 1 && isNumber(accumulator)) {
                    accumulator = accumulator / state.count;
                }
                return accumulator;
            },
            max: function (accumulator, item, accessor) {
                var value = accessor.get(item);
                if (!isNumber(accumulator) && !isDate(accumulator)) {
                    accumulator = value;
                }
                if (accumulator < value && (isNumber(value) || isDate(value))) {
                    accumulator = value;
                }
                return accumulator;
            },
            min: function (accumulator, item, accessor) {
                var value = accessor.get(item);
                if (!isNumber(accumulator) && !isDate(accumulator)) {
                    accumulator = value;
                }
                if (accumulator > value && (isNumber(value) || isDate(value))) {
                    accumulator = value;
                }
                return accumulator;
            }
        };
        function isNumber(val) {
            return typeof val === 'number' && !isNaN(val);
        }
        function isDate(val) {
            return val && val.getTime;
        }
        function toJSON(array) {
            var idx, length = array.length, result = new Array(length);
            for (idx = 0; idx < length; idx++) {
                result[idx] = array[idx].toJSON();
            }
            return result;
        }
        Query.process = function (data, options) {
            options = options || {};
            var query = new Query(data), group = options.group, sort = normalizeGroup(group || []).concat(normalizeSort(options.sort || [])), total, filterCallback = options.filterCallback, filter = options.filter, skip = options.skip, take = options.take;
            if (filter) {
                query = query.filter(filter);
                if (filterCallback) {
                    query = filterCallback(query);
                }
                total = query.toArray().length;
            }
            if (sort) {
                query = query.sort(sort);
                if (group) {
                    data = query.toArray();
                }
            }
            if (skip !== undefined && take !== undefined) {
                query = query.range(skip, take);
            }
            if (group) {
                query = query.group(group, data);
            }
            return {
                total: total,
                data: query.toArray()
            };
        };
        var LocalTransport = Class.extend({
            init: function (options) {
                this.data = options.data;
            },
            read: function (options) {
                options.success(this.data);
            },
            update: function (options) {
                options.success(options.data);
            },
            create: function (options) {
                options.success(options.data);
            },
            destroy: function (options) {
                options.success(options.data);
            }
        });
        var RemoteTransport = Class.extend({
            init: function (options) {
                var that = this, parameterMap;
                options = that.options = extend({}, that.options, options);
                each(crud, function (index, type) {
                    if (typeof options[type] === STRING) {
                        options[type] = { url: options[type] };
                    }
                });
                that.cache = options.cache ? Cache.create(options.cache) : {
                    find: noop,
                    add: noop
                };
                parameterMap = options.parameterMap;
                if (isFunction(options.push)) {
                    that.push = options.push;
                }
                if (!that.push) {
                    that.push = identity;
                }
                that.parameterMap = isFunction(parameterMap) ? parameterMap : function (options) {
                    var result = {};
                    each(options, function (option, value) {
                        if (option in parameterMap) {
                            option = parameterMap[option];
                            if (isPlainObject(option)) {
                                value = option.value(value);
                                option = option.key;
                            }
                        }
                        result[option] = value;
                    });
                    return result;
                };
            },
            options: { parameterMap: identity },
            create: function (options) {
                return ajax(this.setup(options, CREATE));
            },
            read: function (options) {
                var that = this, success, error, result, cache = that.cache;
                options = that.setup(options, READ);
                success = options.success || noop;
                error = options.error || noop;
                result = cache.find(options.data);
                if (result !== undefined) {
                    success(result);
                } else {
                    options.success = function (result) {
                        cache.add(options.data, result);
                        success(result);
                    };
                    $.ajax(options);
                }
            },
            update: function (options) {
                return ajax(this.setup(options, UPDATE));
            },
            destroy: function (options) {
                return ajax(this.setup(options, DESTROY));
            },
            setup: function (options, type) {
                options = options || {};
                var that = this, parameters, operation = that.options[type], data = isFunction(operation.data) ? operation.data(options.data) : operation.data;
                options = extend(true, {}, operation, options);
                parameters = extend(true, {}, data, options.data);
                options.data = that.parameterMap(parameters, type);
                if (isFunction(options.url)) {
                    options.url = options.url(parameters);
                }
                return options;
            }
        });
        var Cache = Class.extend({
            init: function () {
                this._store = {};
            },
            add: function (key, data) {
                if (key !== undefined) {
                    this._store[stringify(key)] = data;
                }
            },
            find: function (key) {
                return this._store[stringify(key)];
            },
            clear: function () {
                this._store = {};
            },
            remove: function (key) {
                delete this._store[stringify(key)];
            }
        });
        Cache.create = function (options) {
            var store = {
                'inmemory': function () {
                    return new Cache();
                }
            };
            if (isPlainObject(options) && isFunction(options.find)) {
                return options;
            }
            if (options === true) {
                return new Cache();
            }
            return store[options]();
        };
        function serializeRecords(data, getters, modelInstance, originalFieldNames, fieldNames) {
            var record, getter, originalName, idx, setters = {}, length;
            for (idx = 0, length = data.length; idx < length; idx++) {
                record = data[idx];
                for (getter in getters) {
                    originalName = fieldNames[getter];
                    if (originalName && originalName !== getter) {
                        if (!setters[originalName]) {
                            setters[originalName] = kendo.setter(originalName);
                        }
                        setters[originalName](record, getters[getter](record));
                        delete record[getter];
                    }
                }
            }
        }
        function convertRecords(data, getters, modelInstance, originalFieldNames, fieldNames) {
            var record, getter, originalName, idx, length;
            for (idx = 0, length = data.length; idx < length; idx++) {
                record = data[idx];
                for (getter in getters) {
                    record[getter] = modelInstance._parse(getter, getters[getter](record));
                    originalName = fieldNames[getter];
                    if (originalName && originalName !== getter) {
                        delete record[originalName];
                    }
                }
            }
        }
        function convertGroup(data, getters, modelInstance, originalFieldNames, fieldNames) {
            var record, idx, fieldName, length;
            for (idx = 0, length = data.length; idx < length; idx++) {
                record = data[idx];
                fieldName = originalFieldNames[record.field];
                if (fieldName && fieldName != record.field) {
                    record.field = fieldName;
                }
                record.value = modelInstance._parse(record.field, record.value);
                if (record.hasSubgroups) {
                    convertGroup(record.items, getters, modelInstance, originalFieldNames, fieldNames);
                } else {
                    convertRecords(record.items, getters, modelInstance, originalFieldNames, fieldNames);
                }
            }
        }
        function wrapDataAccess(originalFunction, model, converter, getters, originalFieldNames, fieldNames) {
            return function (data) {
                data = originalFunction(data);
                if (data && !isEmptyObject(getters)) {
                    if (toString.call(data) !== '[object Array]' && !(data instanceof ObservableArray)) {
                        data = [data];
                    }
                    converter(data, getters, new model(), originalFieldNames, fieldNames);
                }
                return data || [];
            };
        }
        var DataReader = Class.extend({
            init: function (schema) {
                var that = this, member, get, model, base;
                schema = schema || {};
                for (member in schema) {
                    get = schema[member];
                    that[member] = typeof get === STRING ? getter(get) : get;
                }
                base = schema.modelBase || Model;
                if (isPlainObject(that.model)) {
                    that.model = model = base.define(that.model);
                }
                var dataFunction = proxy(that.data, that);
                that._dataAccessFunction = dataFunction;
                if (that.model) {
                    var groupsFunction = proxy(that.groups, that), serializeFunction = proxy(that.serialize, that), originalFieldNames = {}, getters = {}, serializeGetters = {}, fieldNames = {}, shouldSerialize = false, fieldName;
                    model = that.model;
                    if (model.fields) {
                        each(model.fields, function (field, value) {
                            var fromName;
                            fieldName = field;
                            if (isPlainObject(value) && value.field) {
                                fieldName = value.field;
                            } else if (typeof value === STRING) {
                                fieldName = value;
                            }
                            if (isPlainObject(value) && value.from) {
                                fromName = value.from;
                            }
                            shouldSerialize = shouldSerialize || fromName && fromName !== field || fieldName !== field;
                            getters[field] = getter(fromName || fieldName);
                            serializeGetters[field] = getter(field);
                            originalFieldNames[fromName || fieldName] = field;
                            fieldNames[field] = fromName || fieldName;
                        });
                        if (!schema.serialize && shouldSerialize) {
                            that.serialize = wrapDataAccess(serializeFunction, model, serializeRecords, serializeGetters, originalFieldNames, fieldNames);
                        }
                    }
                    that._dataAccessFunction = dataFunction;
                    that.data = wrapDataAccess(dataFunction, model, convertRecords, getters, originalFieldNames, fieldNames);
                    that.groups = wrapDataAccess(groupsFunction, model, convertGroup, getters, originalFieldNames, fieldNames);
                }
            },
            errors: function (data) {
                return data ? data.errors : null;
            },
            parse: identity,
            data: identity,
            total: function (data) {
                return data.length;
            },
            groups: identity,
            aggregates: function () {
                return {};
            },
            serialize: function (data) {
                return data;
            }
        });
        function mergeGroups(target, dest, skip, take) {
            var group, idx = 0, items;
            while (dest.length && take) {
                group = dest[idx];
                items = group.items;
                var length = items.length;
                if (target && target.field === group.field && target.value === group.value) {
                    if (target.hasSubgroups && target.items.length) {
                        mergeGroups(target.items[target.items.length - 1], group.items, skip, take);
                    } else {
                        items = items.slice(skip, skip + take);
                        target.items = target.items.concat(items);
                    }
                    dest.splice(idx--, 1);
                } else if (group.hasSubgroups && items.length) {
                    mergeGroups(group, items, skip, take);
                    if (!group.items.length) {
                        dest.splice(idx--, 1);
                    }
                } else {
                    items = items.slice(skip, skip + take);
                    group.items = items;
                    if (!group.items.length) {
                        dest.splice(idx--, 1);
                    }
                }
                if (items.length === 0) {
                    skip -= length;
                } else {
                    skip = 0;
                    take -= items.length;
                }
                if (++idx >= dest.length) {
                    break;
                }
            }
            if (idx < dest.length) {
                dest.splice(idx, dest.length - idx);
            }
        }
        function flattenGroups(data) {
            var idx, result = [], length, items, itemIndex;
            for (idx = 0, length = data.length; idx < length; idx++) {
                var group = data.at(idx);
                if (group.hasSubgroups) {
                    result = result.concat(flattenGroups(group.items));
                } else {
                    items = group.items;
                    for (itemIndex = 0; itemIndex < items.length; itemIndex++) {
                        result.push(items.at(itemIndex));
                    }
                }
            }
            return result;
        }
        function wrapGroupItems(data, model) {
            var idx, length, group;
            if (model) {
                for (idx = 0, length = data.length; idx < length; idx++) {
                    group = data.at(idx);
                    if (group.hasSubgroups) {
                        wrapGroupItems(group.items, model);
                    } else {
                        group.items = new LazyObservableArray(group.items, model);
                    }
                }
            }
        }
        function eachGroupItems(data, func) {
            for (var idx = 0, length = data.length; idx < length; idx++) {
                if (data[idx].hasSubgroups) {
                    if (eachGroupItems(data[idx].items, func)) {
                        return true;
                    }
                } else if (func(data[idx].items, data[idx])) {
                    return true;
                }
            }
        }
        function replaceInRanges(ranges, data, item, observable) {
            for (var idx = 0; idx < ranges.length; idx++) {
                if (ranges[idx].data === data) {
                    break;
                }
                if (replaceInRange(ranges[idx].data, item, observable)) {
                    break;
                }
            }
        }
        function replaceInRange(items, item, observable) {
            for (var idx = 0, length = items.length; idx < length; idx++) {
                if (items[idx] && items[idx].hasSubgroups) {
                    return replaceInRange(items[idx].items, item, observable);
                } else if (items[idx] === item || items[idx] === observable) {
                    items[idx] = observable;
                    return true;
                }
            }
        }
        function replaceWithObservable(view, data, ranges, type, serverGrouping) {
            for (var viewIndex = 0, length = view.length; viewIndex < length; viewIndex++) {
                var item = view[viewIndex];
                if (!item || item instanceof type) {
                    continue;
                }
                if (item.hasSubgroups !== undefined && !serverGrouping) {
                    replaceWithObservable(item.items, data, ranges, type, serverGrouping);
                } else {
                    for (var idx = 0; idx < data.length; idx++) {
                        if (data[idx] === item) {
                            view[viewIndex] = data.at(idx);
                            replaceInRanges(ranges, data, item, view[viewIndex]);
                            break;
                        }
                    }
                }
            }
        }
        function removeModel(data, model) {
            var idx, length;
            for (idx = 0, length = data.length; idx < length; idx++) {
                var dataItem = data.at(idx);
                if (dataItem.uid == model.uid) {
                    data.splice(idx, 1);
                    return dataItem;
                }
            }
        }
        function indexOfPristineModel(data, model) {
            if (model) {
                return indexOf(data, function (item) {
                    return item.uid && item.uid == model.uid || item[model.idField] === model.id && model.id !== model._defaultId;
                });
            }
            return -1;
        }
        function indexOfModel(data, model) {
            if (model) {
                return indexOf(data, function (item) {
                    return item.uid == model.uid;
                });
            }
            return -1;
        }
        function indexOf(data, comparer) {
            var idx, length;
            for (idx = 0, length = data.length; idx < length; idx++) {
                if (comparer(data[idx])) {
                    return idx;
                }
            }
            return -1;
        }
        function fieldNameFromModel(fields, name) {
            if (fields && !isEmptyObject(fields)) {
                var descriptor = fields[name];
                var fieldName;
                if (isPlainObject(descriptor)) {
                    fieldName = descriptor.from || descriptor.field || name;
                } else {
                    fieldName = fields[name] || name;
                }
                if (isFunction(fieldName)) {
                    return name;
                }
                return fieldName;
            }
            return name;
        }
        function convertFilterDescriptorsField(descriptor, model) {
            var idx, length, target = {};
            for (var field in descriptor) {
                if (field !== 'filters') {
                    target[field] = descriptor[field];
                }
            }
            if (descriptor.filters) {
                target.filters = [];
                for (idx = 0, length = descriptor.filters.length; idx < length; idx++) {
                    target.filters[idx] = convertFilterDescriptorsField(descriptor.filters[idx], model);
                }
            } else {
                target.field = fieldNameFromModel(model.fields, target.field);
            }
            return target;
        }
        function convertDescriptorsField(descriptors, model) {
            var idx, length, result = [], target, descriptor;
            for (idx = 0, length = descriptors.length; idx < length; idx++) {
                target = {};
                descriptor = descriptors[idx];
                for (var field in descriptor) {
                    target[field] = descriptor[field];
                }
                target.field = fieldNameFromModel(model.fields, target.field);
                if (target.aggregates && isArray(target.aggregates)) {
                    target.aggregates = convertDescriptorsField(target.aggregates, model);
                }
                result.push(target);
            }
            return result;
        }
        var DataSource = Observable.extend({
            init: function (options) {
                var that = this, model, data;
                if (options) {
                    data = options.data;
                }
                options = that.options = extend({}, that.options, options);
                that._map = {};
                that._prefetch = {};
                that._data = [];
                that._pristineData = [];
                that._ranges = [];
                that._view = [];
                that._pristineTotal = 0;
                that._destroyed = [];
                that._pageSize = options.pageSize;
                that._page = options.page || (options.pageSize ? 1 : undefined);
                that._sort = normalizeSort(options.sort);
                that._filter = normalizeFilter(options.filter);
                that._group = normalizeGroup(options.group);
                that._aggregate = options.aggregate;
                that._total = options.total;
                that._shouldDetachObservableParents = true;
                Observable.fn.init.call(that);
                that.transport = Transport.create(options, data, that);
                if (isFunction(that.transport.push)) {
                    that.transport.push({
                        pushCreate: proxy(that._pushCreate, that),
                        pushUpdate: proxy(that._pushUpdate, that),
                        pushDestroy: proxy(that._pushDestroy, that)
                    });
                }
                if (options.offlineStorage != null) {
                    if (typeof options.offlineStorage == 'string') {
                        var key = options.offlineStorage;
                        that._storage = {
                            getItem: function () {
                                return JSON.parse(localStorage.getItem(key));
                            },
                            setItem: function (item) {
                                localStorage.setItem(key, stringify(that.reader.serialize(item)));
                            }
                        };
                    } else {
                        that._storage = options.offlineStorage;
                    }
                }
                that.reader = new kendo.data.readers[options.schema.type || 'json'](options.schema);
                model = that.reader.model || {};
                that._detachObservableParents();
                that._data = that._observe(that._data);
                that._online = true;
                that.bind([
                    'push',
                    ERROR,
                    CHANGE,
                    REQUESTSTART,
                    SYNC,
                    REQUESTEND,
                    PROGRESS
                ], options);
            },
            options: {
                data: null,
                schema: { modelBase: Model },
                offlineStorage: null,
                serverSorting: false,
                serverPaging: false,
                serverFiltering: false,
                serverGrouping: false,
                serverAggregates: false,
                batch: false
            },
            clone: function () {
                return this;
            },
            online: function (value) {
                if (value !== undefined) {
                    if (this._online != value) {
                        this._online = value;
                        if (value) {
                            return this.sync();
                        }
                    }
                    return $.Deferred().resolve().promise();
                } else {
                    return this._online;
                }
            },
            offlineData: function (state) {
                if (this.options.offlineStorage == null) {
                    return null;
                }
                if (state !== undefined) {
                    return this._storage.setItem(state);
                }
                return this._storage.getItem() || [];
            },
            _isServerGrouped: function () {
                var group = this.group() || [];
                return this.options.serverGrouping && group.length;
            },
            _pushCreate: function (result) {
                this._push(result, 'pushCreate');
            },
            _pushUpdate: function (result) {
                this._push(result, 'pushUpdate');
            },
            _pushDestroy: function (result) {
                this._push(result, 'pushDestroy');
            },
            _push: function (result, operation) {
                var data = this._readData(result);
                if (!data) {
                    data = result;
                }
                this[operation](data);
            },
            _flatData: function (data, skip) {
                if (data) {
                    if (this._isServerGrouped()) {
                        return flattenGroups(data);
                    }
                    if (!skip) {
                        for (var idx = 0; idx < data.length; idx++) {
                            data.at(idx);
                        }
                    }
                }
                return data;
            },
            parent: noop,
            get: function (id) {
                var idx, length, data = this._flatData(this._data);
                for (idx = 0, length = data.length; idx < length; idx++) {
                    if (data[idx].id == id) {
                        return data[idx];
                    }
                }
            },
            getByUid: function (id) {
                var idx, length, data = this._flatData(this._data);
                if (!data) {
                    return;
                }
                for (idx = 0, length = data.length; idx < length; idx++) {
                    if (data[idx].uid == id) {
                        return data[idx];
                    }
                }
            },
            indexOf: function (model) {
                return indexOfModel(this._data, model);
            },
            at: function (index) {
                return this._data.at(index);
            },
            data: function (value) {
                var that = this;
                if (value !== undefined) {
                    that._detachObservableParents();
                    that._data = this._observe(value);
                    that._pristineData = value.slice(0);
                    that._storeData();
                    that._ranges = [];
                    that.trigger('reset');
                    that._addRange(that._data);
                    that._total = that._data.length;
                    that._pristineTotal = that._total;
                    that._process(that._data);
                } else {
                    if (that._data) {
                        for (var idx = 0; idx < that._data.length; idx++) {
                            that._data.at(idx);
                        }
                    }
                    return that._data;
                }
            },
            view: function (value) {
                if (value === undefined) {
                    return this._view;
                } else {
                    this._view = this._observeView(value);
                }
            },
            _observeView: function (data) {
                var that = this;
                replaceWithObservable(data, that._data, that._ranges, that.reader.model || ObservableObject, that._isServerGrouped());
                var view = new LazyObservableArray(data, that.reader.model);
                view.parent = function () {
                    return that.parent();
                };
                return view;
            },
            flatView: function () {
                var groups = this.group() || [];
                if (groups.length) {
                    return flattenGroups(this._view);
                } else {
                    return this._view;
                }
            },
            add: function (model) {
                return this.insert(this._data.length, model);
            },
            _createNewModel: function (model) {
                if (this.reader.model) {
                    return new this.reader.model(model);
                }
                if (model instanceof ObservableObject) {
                    return model;
                }
                return new ObservableObject(model);
            },
            insert: function (index, model) {
                if (!model) {
                    model = index;
                    index = 0;
                }
                if (!(model instanceof Model)) {
                    model = this._createNewModel(model);
                }
                if (this._isServerGrouped()) {
                    this._data.splice(index, 0, this._wrapInEmptyGroup(model));
                } else {
                    this._data.splice(index, 0, model);
                }
                return model;
            },
            pushCreate: function (items) {
                if (!isArray(items)) {
                    items = [items];
                }
                var pushed = [];
                var autoSync = this.options.autoSync;
                this.options.autoSync = false;
                try {
                    for (var idx = 0; idx < items.length; idx++) {
                        var item = items[idx];
                        var result = this.add(item);
                        pushed.push(result);
                        var pristine = result.toJSON();
                        if (this._isServerGrouped()) {
                            pristine = this._wrapInEmptyGroup(pristine);
                        }
                        this._pristineData.push(pristine);
                    }
                } finally {
                    this.options.autoSync = autoSync;
                }
                if (pushed.length) {
                    this.trigger('push', {
                        type: 'create',
                        items: pushed
                    });
                }
            },
            pushUpdate: function (items) {
                if (!isArray(items)) {
                    items = [items];
                }
                var pushed = [];
                for (var idx = 0; idx < items.length; idx++) {
                    var item = items[idx];
                    var model = this._createNewModel(item);
                    var target = this.get(model.id);
                    if (target) {
                        pushed.push(target);
                        target.accept(item);
                        target.trigger(CHANGE);
                        this._updatePristineForModel(target, item);
                    } else {
                        this.pushCreate(item);
                    }
                }
                if (pushed.length) {
                    this.trigger('push', {
                        type: 'update',
                        items: pushed
                    });
                }
            },
            pushDestroy: function (items) {
                var pushed = this._removeItems(items);
                if (pushed.length) {
                    this.trigger('push', {
                        type: 'destroy',
                        items: pushed
                    });
                }
            },
            _removeItems: function (items) {
                if (!isArray(items)) {
                    items = [items];
                }
                var destroyed = [];
                var autoSync = this.options.autoSync;
                this.options.autoSync = false;
                try {
                    for (var idx = 0; idx < items.length; idx++) {
                        var item = items[idx];
                        var model = this._createNewModel(item);
                        var found = false;
                        this._eachItem(this._data, function (items) {
                            for (var idx = 0; idx < items.length; idx++) {
                                var item = items.at(idx);
                                if (item.id === model.id) {
                                    destroyed.push(item);
                                    items.splice(idx, 1);
                                    found = true;
                                    break;
                                }
                            }
                        });
                        if (found) {
                            this._removePristineForModel(model);
                            this._destroyed.pop();
                        }
                    }
                } finally {
                    this.options.autoSync = autoSync;
                }
                return destroyed;
            },
            remove: function (model) {
                var result, that = this, hasGroups = that._isServerGrouped();
                this._eachItem(that._data, function (items) {
                    result = removeModel(items, model);
                    if (result && hasGroups) {
                        if (!result.isNew || !result.isNew()) {
                            that._destroyed.push(result);
                        }
                        return true;
                    }
                });
                this._removeModelFromRanges(model);
                this._updateRangesLength();
                return model;
            },
            destroyed: function () {
                return this._destroyed;
            },
            created: function () {
                var idx, length, result = [], data = this._flatData(this._data);
                for (idx = 0, length = data.length; idx < length; idx++) {
                    if (data[idx].isNew && data[idx].isNew()) {
                        result.push(data[idx]);
                    }
                }
                return result;
            },
            updated: function () {
                var idx, length, result = [], data = this._flatData(this._data);
                for (idx = 0, length = data.length; idx < length; idx++) {
                    if (data[idx].isNew && !data[idx].isNew() && data[idx].dirty) {
                        result.push(data[idx]);
                    }
                }
                return result;
            },
            sync: function () {
                var that = this, created = [], updated = [], destroyed = that._destroyed;
                var promise = $.Deferred().resolve().promise();
                if (that.online()) {
                    if (!that.reader.model) {
                        return promise;
                    }
                    created = that.created();
                    updated = that.updated();
                    var promises = [];
                    if (that.options.batch && that.transport.submit) {
                        promises = that._sendSubmit(created, updated, destroyed);
                    } else {
                        promises.push.apply(promises, that._send('create', created));
                        promises.push.apply(promises, that._send('update', updated));
                        promises.push.apply(promises, that._send('destroy', destroyed));
                    }
                    promise = $.when.apply(null, promises).then(function () {
                        var idx, length;
                        for (idx = 0, length = arguments.length; idx < length; idx++) {
                            that._accept(arguments[idx]);
                        }
                        that._storeData(true);
                        that._change({ action: 'sync' });
                        that.trigger(SYNC);
                    });
                } else {
                    that._storeData(true);
                    that._change({ action: 'sync' });
                }
                return promise;
            },
            cancelChanges: function (model) {
                var that = this;
                if (model instanceof kendo.data.Model) {
                    that._cancelModel(model);
                } else {
                    that._destroyed = [];
                    that._detachObservableParents();
                    that._data = that._observe(that._pristineData);
                    if (that.options.serverPaging) {
                        that._total = that._pristineTotal;
                    }
                    that._ranges = [];
                    that._addRange(that._data);
                    that._change();
                    that._markOfflineUpdatesAsDirty();
                }
            },
            _markOfflineUpdatesAsDirty: function () {
                var that = this;
                if (that.options.offlineStorage != null) {
                    that._eachItem(that._data, function (items) {
                        for (var idx = 0; idx < items.length; idx++) {
                            var item = items.at(idx);
                            if (item.__state__ == 'update') {
                                item.dirty = true;
                            }
                        }
                    });
                }
            },
            hasChanges: function () {
                var idx, length, data = this._flatData(this._data);
                if (this._destroyed.length) {
                    return true;
                }
                for (idx = 0, length = data.length; idx < length; idx++) {
                    if (data[idx].isNew && data[idx].isNew() || data[idx].dirty) {
                        return true;
                    }
                }
                return false;
            },
            _accept: function (result) {
                var that = this, models = result.models, response = result.response, idx = 0, serverGroup = that._isServerGrouped(), pristine = that._pristineData, type = result.type, length;
                that.trigger(REQUESTEND, {
                    response: response,
                    type: type
                });
                if (response && !isEmptyObject(response)) {
                    response = that.reader.parse(response);
                    if (that._handleCustomErrors(response)) {
                        return;
                    }
                    response = that.reader.data(response);
                    if (!isArray(response)) {
                        response = [response];
                    }
                } else {
                    response = $.map(models, function (model) {
                        return model.toJSON();
                    });
                }
                if (type === 'destroy') {
                    that._destroyed = [];
                }
                for (idx = 0, length = models.length; idx < length; idx++) {
                    if (type !== 'destroy') {
                        models[idx].accept(response[idx]);
                        if (type === 'create') {
                            pristine.push(serverGroup ? that._wrapInEmptyGroup(models[idx]) : response[idx]);
                        } else if (type === 'update') {
                            that._updatePristineForModel(models[idx], response[idx]);
                        }
                    } else {
                        that._removePristineForModel(models[idx]);
                    }
                }
            },
            _updatePristineForModel: function (model, values) {
                this._executeOnPristineForModel(model, function (index, items) {
                    kendo.deepExtend(items[index], values);
                });
            },
            _executeOnPristineForModel: function (model, callback) {
                this._eachPristineItem(function (items) {
                    var index = indexOfPristineModel(items, model);
                    if (index > -1) {
                        callback(index, items);
                        return true;
                    }
                });
            },
            _removePristineForModel: function (model) {
                this._executeOnPristineForModel(model, function (index, items) {
                    items.splice(index, 1);
                });
            },
            _readData: function (data) {
                var read = !this._isServerGrouped() ? this.reader.data : this.reader.groups;
                return read.call(this.reader, data);
            },
            _eachPristineItem: function (callback) {
                this._eachItem(this._pristineData, callback);
            },
            _eachItem: function (data, callback) {
                if (data && data.length) {
                    if (this._isServerGrouped()) {
                        eachGroupItems(data, callback);
                    } else {
                        callback(data);
                    }
                }
            },
            _pristineForModel: function (model) {
                var pristine, idx, callback = function (items) {
                    idx = indexOfPristineModel(items, model);
                    if (idx > -1) {
                        pristine = items[idx];
                        return true;
                    }
                };
                this._eachPristineItem(callback);
                return pristine;
            },
            _cancelModel: function (model) {
                var pristine = this._pristineForModel(model);
                this._eachItem(this._data, function (items) {
                    var idx = indexOfModel(items, model);
                    if (idx >= 0) {
                        if (pristine && (!model.isNew() || pristine.__state__)) {
                            items[idx].accept(pristine);
                            if (pristine.__state__ == 'update') {
                                items[idx].dirty = true;
                            }
                        } else {
                            items.splice(idx, 1);
                        }
                    }
                });
            },
            _submit: function (promises, data) {
                var that = this;
                that.trigger(REQUESTSTART, { type: 'submit' });
                that.transport.submit(extend({
                    success: function (response, type) {
                        var promise = $.grep(promises, function (x) {
                            return x.type == type;
                        })[0];
                        if (promise) {
                            promise.resolve({
                                response: response,
                                models: promise.models,
                                type: type
                            });
                        }
                    },
                    error: function (response, status, error) {
                        for (var idx = 0; idx < promises.length; idx++) {
                            promises[idx].reject(response);
                        }
                        that.error(response, status, error);
                    }
                }, data));
            },
            _sendSubmit: function (created, updated, destroyed) {
                var that = this, promises = [];
                if (that.options.batch) {
                    if (created.length) {
                        promises.push($.Deferred(function (deferred) {
                            deferred.type = 'create';
                            deferred.models = created;
                        }));
                    }
                    if (updated.length) {
                        promises.push($.Deferred(function (deferred) {
                            deferred.type = 'update';
                            deferred.models = updated;
                        }));
                    }
                    if (destroyed.length) {
                        promises.push($.Deferred(function (deferred) {
                            deferred.type = 'destroy';
                            deferred.models = destroyed;
                        }));
                    }
                    that._submit(promises, {
                        data: {
                            created: that.reader.serialize(toJSON(created)),
                            updated: that.reader.serialize(toJSON(updated)),
                            destroyed: that.reader.serialize(toJSON(destroyed))
                        }
                    });
                }
                return promises;
            },
            _promise: function (data, models, type) {
                var that = this;
                return $.Deferred(function (deferred) {
                    that.trigger(REQUESTSTART, { type: type });
                    that.transport[type].call(that.transport, extend({
                        success: function (response) {
                            deferred.resolve({
                                response: response,
                                models: models,
                                type: type
                            });
                        },
                        error: function (response, status, error) {
                            deferred.reject(response);
                            that.error(response, status, error);
                        }
                    }, data));
                }).promise();
            },
            _send: function (method, data) {
                var that = this, idx, length, promises = [], converted = that.reader.serialize(toJSON(data));
                if (that.options.batch) {
                    if (data.length) {
                        promises.push(that._promise({ data: { models: converted } }, data, method));
                    }
                } else {
                    for (idx = 0, length = data.length; idx < length; idx++) {
                        promises.push(that._promise({ data: converted[idx] }, [data[idx]], method));
                    }
                }
                return promises;
            },
            read: function (data) {
                var that = this, params = that._params(data);
                var deferred = $.Deferred();
                that._queueRequest(params, function () {
                    var isPrevented = that.trigger(REQUESTSTART, { type: 'read' });
                    if (!isPrevented) {
                        that.trigger(PROGRESS);
                        that._ranges = [];
                        that.trigger('reset');
                        if (that.online()) {
                            that.transport.read({
                                data: params,
                                success: function (data) {
                                    that.success(data, params);
                                    deferred.resolve();
                                },
                                error: function () {
                                    var args = slice.call(arguments);
                                    that.error.apply(that, args);
                                    deferred.reject.apply(deferred, args);
                                }
                            });
                        } else if (that.options.offlineStorage != null) {
                            that.success(that.offlineData(), params);
                            deferred.resolve();
                        }
                    } else {
                        that._dequeueRequest();
                        deferred.resolve(isPrevented);
                    }
                });
                return deferred.promise();
            },
            _readAggregates: function (data) {
                return this.reader.aggregates(data);
            },
            success: function (data) {
                var that = this, options = that.options;
                that.trigger(REQUESTEND, {
                    response: data,
                    type: 'read'
                });
                if (that.online()) {
                    data = that.reader.parse(data);
                    if (that._handleCustomErrors(data)) {
                        that._dequeueRequest();
                        return;
                    }
                    that._total = that.reader.total(data);
                    if (that._aggregate && options.serverAggregates) {
                        that._aggregateResult = that._readAggregates(data);
                    }
                    data = that._readData(data);
                } else {
                    data = that._readData(data);
                    var items = [];
                    var itemIds = {};
                    var model = that.reader.model;
                    var idField = model ? model.idField : 'id';
                    var idx;
                    for (idx = 0; idx < this._destroyed.length; idx++) {
                        var id = this._destroyed[idx][idField];
                        itemIds[id] = id;
                    }
                    for (idx = 0; idx < data.length; idx++) {
                        var item = data[idx];
                        var state = item.__state__;
                        if (state == 'destroy') {
                            if (!itemIds[item[idField]]) {
                                this._destroyed.push(this._createNewModel(item));
                            }
                        } else {
                            items.push(item);
                        }
                    }
                    data = items;
                    that._total = data.length;
                }
                that._pristineTotal = that._total;
                that._pristineData = data.slice(0);
                that._detachObservableParents();
                that._data = that._observe(data);
                that._markOfflineUpdatesAsDirty();
                that._storeData();
                that._addRange(that._data);
                that._process(that._data);
                that._dequeueRequest();
            },
            _detachObservableParents: function () {
                if (this._data && this._shouldDetachObservableParents) {
                    for (var idx = 0; idx < this._data.length; idx++) {
                        if (this._data[idx].parent) {
                            this._data[idx].parent = noop;
                        }
                    }
                }
            },
            _storeData: function (updatePristine) {
                var serverGrouping = this._isServerGrouped();
                var model = this.reader.model;
                function items(data) {
                    var state = [];
                    for (var idx = 0; idx < data.length; idx++) {
                        var dataItem = data.at(idx);
                        var item = dataItem.toJSON();
                        if (serverGrouping && dataItem.items) {
                            item.items = items(dataItem.items);
                        } else {
                            item.uid = dataItem.uid;
                            if (model) {
                                if (dataItem.isNew()) {
                                    item.__state__ = 'create';
                                } else if (dataItem.dirty) {
                                    item.__state__ = 'update';
                                }
                            }
                        }
                        state.push(item);
                    }
                    return state;
                }
                if (this.options.offlineStorage != null) {
                    var state = items(this._data);
                    var destroyed = [];
                    for (var idx = 0; idx < this._destroyed.length; idx++) {
                        var item = this._destroyed[idx].toJSON();
                        item.__state__ = 'destroy';
                        destroyed.push(item);
                    }
                    this.offlineData(state.concat(destroyed));
                    if (updatePristine) {
                        this._pristineData = this._readData(state);
                    }
                }
            },
            _addRange: function (data) {
                var that = this, start = that._skip || 0, end = start + that._flatData(data, true).length;
                that._ranges.push({
                    start: start,
                    end: end,
                    data: data,
                    timestamp: new Date().getTime()
                });
                that._ranges.sort(function (x, y) {
                    return x.start - y.start;
                });
            },
            error: function (xhr, status, errorThrown) {
                this._dequeueRequest();
                this.trigger(REQUESTEND, {});
                this.trigger(ERROR, {
                    xhr: xhr,
                    status: status,
                    errorThrown: errorThrown
                });
            },
            _params: function (data) {
                var that = this, options = extend({
                    take: that.take(),
                    skip: that.skip(),
                    page: that.page(),
                    pageSize: that.pageSize(),
                    sort: that._sort,
                    filter: that._filter,
                    group: that._group,
                    aggregate: that._aggregate
                }, data);
                if (!that.options.serverPaging) {
                    delete options.take;
                    delete options.skip;
                    delete options.page;
                    delete options.pageSize;
                }
                if (!that.options.serverGrouping) {
                    delete options.group;
                } else if (that.reader.model && options.group) {
                    options.group = convertDescriptorsField(options.group, that.reader.model);
                }
                if (!that.options.serverFiltering) {
                    delete options.filter;
                } else if (that.reader.model && options.filter) {
                    options.filter = convertFilterDescriptorsField(options.filter, that.reader.model);
                }
                if (!that.options.serverSorting) {
                    delete options.sort;
                } else if (that.reader.model && options.sort) {
                    options.sort = convertDescriptorsField(options.sort, that.reader.model);
                }
                if (!that.options.serverAggregates) {
                    delete options.aggregate;
                } else if (that.reader.model && options.aggregate) {
                    options.aggregate = convertDescriptorsField(options.aggregate, that.reader.model);
                }
                return options;
            },
            _queueRequest: function (options, callback) {
                var that = this;
                if (!that._requestInProgress) {
                    that._requestInProgress = true;
                    that._pending = undefined;
                    callback();
                } else {
                    that._pending = {
                        callback: proxy(callback, that),
                        options: options
                    };
                }
            },
            _dequeueRequest: function () {
                var that = this;
                that._requestInProgress = false;
                if (that._pending) {
                    that._queueRequest(that._pending.options, that._pending.callback);
                }
            },
            _handleCustomErrors: function (response) {
                if (this.reader.errors) {
                    var errors = this.reader.errors(response);
                    if (errors) {
                        this.trigger(ERROR, {
                            xhr: null,
                            status: 'customerror',
                            errorThrown: 'custom error',
                            errors: errors
                        });
                        return true;
                    }
                }
                return false;
            },
            _shouldWrap: function (data) {
                var model = this.reader.model;
                if (model && data.length) {
                    return !(data[0] instanceof model);
                }
                return false;
            },
            _observe: function (data) {
                var that = this, model = that.reader.model;
                that._shouldDetachObservableParents = true;
                if (data instanceof ObservableArray) {
                    that._shouldDetachObservableParents = false;
                    if (that._shouldWrap(data)) {
                        data.type = that.reader.model;
                        data.wrapAll(data, data);
                    }
                } else {
                    var arrayType = that.pageSize() && !that.options.serverPaging ? LazyObservableArray : ObservableArray;
                    data = new arrayType(data, that.reader.model);
                    data.parent = function () {
                        return that.parent();
                    };
                }
                if (that._isServerGrouped()) {
                    wrapGroupItems(data, model);
                }
                if (that._changeHandler && that._data && that._data instanceof ObservableArray) {
                    that._data.unbind(CHANGE, that._changeHandler);
                } else {
                    that._changeHandler = proxy(that._change, that);
                }
                return data.bind(CHANGE, that._changeHandler);
            },
            _updateTotalForAction: function (action, items) {
                var that = this;
                var total = parseInt(that._total, 10);
                if (!isNumber(that._total)) {
                    total = parseInt(that._pristineTotal, 10);
                }
                if (action === 'add') {
                    total += items.length;
                } else if (action === 'remove') {
                    total -= items.length;
                } else if (action !== 'itemchange' && action !== 'sync' && !that.options.serverPaging) {
                    total = that._pristineTotal;
                } else if (action === 'sync') {
                    total = that._pristineTotal = parseInt(that._total, 10);
                }
                that._total = total;
            },
            _change: function (e) {
                var that = this, idx, length, action = e ? e.action : '';
                if (action === 'remove') {
                    for (idx = 0, length = e.items.length; idx < length; idx++) {
                        if (!e.items[idx].isNew || !e.items[idx].isNew()) {
                            that._destroyed.push(e.items[idx]);
                        }
                    }
                }
                if (that.options.autoSync && (action === 'add' || action === 'remove' || action === 'itemchange')) {
                    var handler = function (args) {
                        if (args.action === 'sync') {
                            that.unbind('change', handler);
                            that._updateTotalForAction(action, e.items);
                        }
                    };
                    that.first('change', handler);
                    that.sync();
                } else {
                    that._updateTotalForAction(action, e ? e.items : []);
                    that._process(that._data, e);
                }
            },
            _calculateAggregates: function (data, options) {
                options = options || {};
                var query = new Query(data), aggregates = options.aggregate, filter = options.filter;
                if (filter) {
                    query = query.filter(filter);
                }
                return query.aggregate(aggregates);
            },
            _process: function (data, e) {
                var that = this, options = {}, result;
                if (that.options.serverPaging !== true) {
                    options.skip = that._skip;
                    options.take = that._take || that._pageSize;
                    if (options.skip === undefined && that._page !== undefined && that._pageSize !== undefined) {
                        options.skip = (that._page - 1) * that._pageSize;
                    }
                }
                if (that.options.serverSorting !== true) {
                    options.sort = that._sort;
                }
                if (that.options.serverFiltering !== true) {
                    options.filter = that._filter;
                }
                if (that.options.serverGrouping !== true) {
                    options.group = that._group;
                }
                if (that.options.serverAggregates !== true) {
                    options.aggregate = that._aggregate;
                    that._aggregateResult = that._calculateAggregates(data, options);
                }
                result = that._queryProcess(data, options);
                that.view(result.data);
                if (result.total !== undefined && !that.options.serverFiltering) {
                    that._total = result.total;
                }
                e = e || {};
                e.items = e.items || that._view;
                that.trigger(CHANGE, e);
            },
            _queryProcess: function (data, options) {
                return Query.process(data, options);
            },
            _mergeState: function (options) {
                var that = this;
                if (options !== undefined) {
                    that._pageSize = options.pageSize;
                    that._page = options.page;
                    that._sort = options.sort;
                    that._filter = options.filter;
                    that._group = options.group;
                    that._aggregate = options.aggregate;
                    that._skip = that._currentRangeStart = options.skip;
                    that._take = options.take;
                    if (that._skip === undefined) {
                        that._skip = that._currentRangeStart = that.skip();
                        options.skip = that.skip();
                    }
                    if (that._take === undefined && that._pageSize !== undefined) {
                        that._take = that._pageSize;
                        options.take = that._take;
                    }
                    if (options.sort) {
                        that._sort = options.sort = normalizeSort(options.sort);
                    }
                    if (options.filter) {
                        that._filter = options.filter = normalizeFilter(options.filter);
                    }
                    if (options.group) {
                        that._group = options.group = normalizeGroup(options.group);
                    }
                    if (options.aggregate) {
                        that._aggregate = options.aggregate = normalizeAggregate(options.aggregate);
                    }
                }
                return options;
            },
            query: function (options) {
                var result;
                var remote = this.options.serverSorting || this.options.serverPaging || this.options.serverFiltering || this.options.serverGrouping || this.options.serverAggregates;
                if (remote || (this._data === undefined || this._data.length === 0) && !this._destroyed.length) {
                    return this.read(this._mergeState(options));
                }
                var isPrevented = this.trigger(REQUESTSTART, { type: 'read' });
                if (!isPrevented) {
                    this.trigger(PROGRESS);
                    result = this._queryProcess(this._data, this._mergeState(options));
                    if (!this.options.serverFiltering) {
                        if (result.total !== undefined) {
                            this._total = result.total;
                        } else {
                            this._total = this._data.length;
                        }
                    }
                    this._aggregateResult = this._calculateAggregates(this._data, options);
                    this.view(result.data);
                    this.trigger(REQUESTEND, { type: 'read' });
                    this.trigger(CHANGE, { items: result.data });
                }
                return $.Deferred().resolve(isPrevented).promise();
            },
            fetch: function (callback) {
                var that = this;
                var fn = function (isPrevented) {
                    if (isPrevented !== true && isFunction(callback)) {
                        callback.call(that);
                    }
                };
                return this._query().then(fn);
            },
            _query: function (options) {
                var that = this;
                return that.query(extend({}, {
                    page: that.page(),
                    pageSize: that.pageSize(),
                    sort: that.sort(),
                    filter: that.filter(),
                    group: that.group(),
                    aggregate: that.aggregate()
                }, options));
            },
            next: function (options) {
                var that = this, page = that.page(), total = that.total();
                options = options || {};
                if (!page || total && page + 1 > that.totalPages()) {
                    return;
                }
                that._skip = that._currentRangeStart = page * that.take();
                page += 1;
                options.page = page;
                that._query(options);
                return page;
            },
            prev: function (options) {
                var that = this, page = that.page();
                options = options || {};
                if (!page || page === 1) {
                    return;
                }
                that._skip = that._currentRangeStart = that._skip - that.take();
                page -= 1;
                options.page = page;
                that._query(options);
                return page;
            },
            page: function (val) {
                var that = this, skip;
                if (val !== undefined) {
                    val = math.max(math.min(math.max(val, 1), that.totalPages()), 1);
                    that._query({ page: val });
                    return;
                }
                skip = that.skip();
                return skip !== undefined ? math.round((skip || 0) / (that.take() || 1)) + 1 : undefined;
            },
            pageSize: function (val) {
                var that = this;
                if (val !== undefined) {
                    that._query({
                        pageSize: val,
                        page: 1
                    });
                    return;
                }
                return that.take();
            },
            sort: function (val) {
                var that = this;
                if (val !== undefined) {
                    that._query({ sort: val });
                    return;
                }
                return that._sort;
            },
            filter: function (val) {
                var that = this;
                if (val === undefined) {
                    return that._filter;
                }
                that.trigger('reset');
                that._query({
                    filter: val,
                    page: 1
                });
            },
            group: function (val) {
                var that = this;
                if (val !== undefined) {
                    that._query({ group: val });
                    return;
                }
                return that._group;
            },
            total: function () {
                return parseInt(this._total || 0, 10);
            },
            aggregate: function (val) {
                var that = this;
                if (val !== undefined) {
                    that._query({ aggregate: val });
                    return;
                }
                return that._aggregate;
            },
            aggregates: function () {
                var result = this._aggregateResult;
                if (isEmptyObject(result)) {
                    result = this._emptyAggregates(this.aggregate());
                }
                return result;
            },
            _emptyAggregates: function (aggregates) {
                var result = {};
                if (!isEmptyObject(aggregates)) {
                    var aggregate = {};
                    if (!isArray(aggregates)) {
                        aggregates = [aggregates];
                    }
                    for (var idx = 0; idx < aggregates.length; idx++) {
                        aggregate[aggregates[idx].aggregate] = 0;
                        result[aggregates[idx].field] = aggregate;
                    }
                }
                return result;
            },
            _wrapInEmptyGroup: function (model) {
                var groups = this.group(), parent, group, idx, length;
                for (idx = groups.length - 1, length = 0; idx >= length; idx--) {
                    group = groups[idx];
                    parent = {
                        value: model.get(group.field),
                        field: group.field,
                        items: parent ? [parent] : [model],
                        hasSubgroups: !!parent,
                        aggregates: this._emptyAggregates(group.aggregates)
                    };
                }
                return parent;
            },
            totalPages: function () {
                var that = this, pageSize = that.pageSize() || that.total();
                return math.ceil((that.total() || 0) / pageSize);
            },
            inRange: function (skip, take) {
                var that = this, end = math.min(skip + take, that.total());
                if (!that.options.serverPaging && that._data.length > 0) {
                    return true;
                }
                return that._findRange(skip, end).length > 0;
            },
            lastRange: function () {
                var ranges = this._ranges;
                return ranges[ranges.length - 1] || {
                    start: 0,
                    end: 0,
                    data: []
                };
            },
            firstItemUid: function () {
                var ranges = this._ranges;
                return ranges.length && ranges[0].data.length && ranges[0].data[0].uid;
            },
            enableRequestsInProgress: function () {
                this._skipRequestsInProgress = false;
            },
            _timeStamp: function () {
                return new Date().getTime();
            },
            range: function (skip, take) {
                this._currentRequestTimeStamp = this._timeStamp();
                this._skipRequestsInProgress = true;
                skip = math.min(skip || 0, this.total());
                var that = this, pageSkip = math.max(math.floor(skip / take), 0) * take, size = math.min(pageSkip + take, that.total()), data;
                data = that._findRange(skip, math.min(skip + take, that.total()));
                if (data.length) {
                    that._pending = undefined;
                    that._skip = skip > that.skip() ? math.min(size, (that.totalPages() - 1) * that.take()) : pageSkip;
                    that._currentRangeStart = skip;
                    that._take = take;
                    var paging = that.options.serverPaging;
                    var sorting = that.options.serverSorting;
                    var filtering = that.options.serverFiltering;
                    var aggregates = that.options.serverAggregates;
                    try {
                        that.options.serverPaging = true;
                        if (!that._isServerGrouped() && !(that.group() && that.group().length)) {
                            that.options.serverSorting = true;
                        }
                        that.options.serverFiltering = true;
                        that.options.serverPaging = true;
                        that.options.serverAggregates = true;
                        if (paging) {
                            that._detachObservableParents();
                            that._data = data = that._observe(data);
                        }
                        that._process(data);
                    } finally {
                        that.options.serverPaging = paging;
                        that.options.serverSorting = sorting;
                        that.options.serverFiltering = filtering;
                        that.options.serverAggregates = aggregates;
                    }
                    return;
                }
                if (take !== undefined) {
                    if (!that._rangeExists(pageSkip, size)) {
                        that.prefetch(pageSkip, take, function () {
                            if (skip > pageSkip && size < that.total() && !that._rangeExists(size, math.min(size + take, that.total()))) {
                                that.prefetch(size, take, function () {
                                    that.range(skip, take);
                                });
                            } else {
                                that.range(skip, take);
                            }
                        });
                    } else if (pageSkip < skip) {
                        that.prefetch(size, take, function () {
                            that.range(skip, take);
                        });
                    }
                }
            },
            _findRange: function (start, end) {
                var that = this, ranges = that._ranges, range, data = [], skipIdx, takeIdx, startIndex, endIndex, rangeData, rangeEnd, processed, options = that.options, remote = options.serverSorting || options.serverPaging || options.serverFiltering || options.serverGrouping || options.serverAggregates, flatData, count, length;
                for (skipIdx = 0, length = ranges.length; skipIdx < length; skipIdx++) {
                    range = ranges[skipIdx];
                    if (start >= range.start && start <= range.end) {
                        count = 0;
                        for (takeIdx = skipIdx; takeIdx < length; takeIdx++) {
                            range = ranges[takeIdx];
                            flatData = that._flatData(range.data, true);
                            if (flatData.length && start + count >= range.start) {
                                rangeData = range.data;
                                rangeEnd = range.end;
                                if (!remote) {
                                    var sort = normalizeGroup(that.group() || []).concat(normalizeSort(that.sort() || []));
                                    processed = that._queryProcess(range.data, {
                                        sort: sort,
                                        filter: that.filter()
                                    });
                                    flatData = rangeData = processed.data;
                                    if (processed.total !== undefined) {
                                        rangeEnd = processed.total;
                                    }
                                }
                                startIndex = 0;
                                if (start + count > range.start) {
                                    startIndex = start + count - range.start;
                                }
                                endIndex = flatData.length;
                                if (rangeEnd > end) {
                                    endIndex = endIndex - (rangeEnd - end);
                                }
                                count += endIndex - startIndex;
                                data = that._mergeGroups(data, rangeData, startIndex, endIndex);
                                if (end <= range.end && count == end - start) {
                                    return data;
                                }
                            }
                        }
                        break;
                    }
                }
                return [];
            },
            _mergeGroups: function (data, range, skip, take) {
                if (this._isServerGrouped()) {
                    var temp = range.toJSON(), prevGroup;
                    if (data.length) {
                        prevGroup = data[data.length - 1];
                    }
                    mergeGroups(prevGroup, temp, skip, take);
                    return data.concat(temp);
                }
                return data.concat(range.slice(skip, take));
            },
            skip: function () {
                var that = this;
                if (that._skip === undefined) {
                    return that._page !== undefined ? (that._page - 1) * (that.take() || 1) : undefined;
                }
                return that._skip;
            },
            currentRangeStart: function () {
                return this._currentRangeStart || 0;
            },
            take: function () {
                return this._take || this._pageSize;
            },
            _prefetchSuccessHandler: function (skip, size, callback, force) {
                var that = this;
                var timestamp = that._timeStamp();
                return function (data) {
                    var found = false, range = {
                        start: skip,
                        end: size,
                        data: [],
                        timestamp: that._timeStamp()
                    }, idx, length, temp;
                    that._dequeueRequest();
                    that.trigger(REQUESTEND, {
                        response: data,
                        type: 'read'
                    });
                    data = that.reader.parse(data);
                    temp = that._readData(data);
                    if (temp.length) {
                        for (idx = 0, length = that._ranges.length; idx < length; idx++) {
                            if (that._ranges[idx].start === skip) {
                                found = true;
                                range = that._ranges[idx];
                                break;
                            }
                        }
                        if (!found) {
                            that._ranges.push(range);
                        }
                    }
                    range.data = that._observe(temp);
                    range.end = range.start + that._flatData(range.data, true).length;
                    that._ranges.sort(function (x, y) {
                        return x.start - y.start;
                    });
                    that._total = that.reader.total(data);
                    if (force || (timestamp >= that._currentRequestTimeStamp || !that._skipRequestsInProgress)) {
                        if (callback && temp.length) {
                            callback();
                        } else {
                            that.trigger(CHANGE, {});
                        }
                    }
                };
            },
            prefetch: function (skip, take, callback) {
                var that = this, size = math.min(skip + take, that.total()), options = {
                    take: take,
                    skip: skip,
                    page: skip / take + 1,
                    pageSize: take,
                    sort: that._sort,
                    filter: that._filter,
                    group: that._group,
                    aggregate: that._aggregate
                };
                if (!that._rangeExists(skip, size)) {
                    clearTimeout(that._timeout);
                    that._timeout = setTimeout(function () {
                        that._queueRequest(options, function () {
                            if (!that.trigger(REQUESTSTART, { type: 'read' })) {
                                that.transport.read({
                                    data: that._params(options),
                                    success: that._prefetchSuccessHandler(skip, size, callback),
                                    error: function () {
                                        var args = slice.call(arguments);
                                        that.error.apply(that, args);
                                    }
                                });
                            } else {
                                that._dequeueRequest();
                            }
                        });
                    }, 100);
                } else if (callback) {
                    callback();
                }
            },
            _multiplePrefetch: function (skip, take, callback) {
                var that = this, size = math.min(skip + take, that.total()), options = {
                    take: take,
                    skip: skip,
                    page: skip / take + 1,
                    pageSize: take,
                    sort: that._sort,
                    filter: that._filter,
                    group: that._group,
                    aggregate: that._aggregate
                };
                if (!that._rangeExists(skip, size)) {
                    if (!that.trigger(REQUESTSTART, { type: 'read' })) {
                        that.transport.read({
                            data: that._params(options),
                            success: that._prefetchSuccessHandler(skip, size, callback, true)
                        });
                    }
                } else if (callback) {
                    callback();
                }
            },
            _rangeExists: function (start, end) {
                var that = this, ranges = that._ranges, idx, length;
                for (idx = 0, length = ranges.length; idx < length; idx++) {
                    if (ranges[idx].start <= start && ranges[idx].end >= end) {
                        return true;
                    }
                }
                return false;
            },
            _removeModelFromRanges: function (model) {
                var result, found, range;
                for (var idx = 0, length = this._ranges.length; idx < length; idx++) {
                    range = this._ranges[idx];
                    this._eachItem(range.data, function (items) {
                        result = removeModel(items, model);
                        if (result) {
                            found = true;
                        }
                    });
                    if (found) {
                        break;
                    }
                }
            },
            _updateRangesLength: function () {
                var startOffset = 0, range, rangeLength;
                for (var idx = 0, length = this._ranges.length; idx < length; idx++) {
                    range = this._ranges[idx];
                    range.start = range.start - startOffset;
                    rangeLength = this._flatData(range.data, true).length;
                    startOffset = range.end - rangeLength;
                    range.end = range.start + rangeLength;
                }
            }
        });
        var Transport = {};
        Transport.create = function (options, data, dataSource) {
            var transport, transportOptions = options.transport ? $.extend({}, options.transport) : null;
            if (transportOptions) {
                transportOptions.read = typeof transportOptions.read === STRING ? { url: transportOptions.read } : transportOptions.read;
                if (options.type === 'jsdo') {
                    transportOptions.dataSource = dataSource;
                }
                if (options.type) {
                    kendo.data.transports = kendo.data.transports || {};
                    kendo.data.schemas = kendo.data.schemas || {};
                    if (!kendo.data.transports[options.type]) {
                        kendo.logToConsole('Unknown DataSource transport type \'' + options.type + '\'.\nVerify that registration scripts for this type are included after Kendo UI on the page.', 'warn');
                    } else if (!isPlainObject(kendo.data.transports[options.type])) {
                        transport = new kendo.data.transports[options.type](extend(transportOptions, { data: data }));
                    } else {
                        transportOptions = extend(true, {}, kendo.data.transports[options.type], transportOptions);
                    }
                    options.schema = extend(true, {}, kendo.data.schemas[options.type], options.schema);
                }
                if (!transport) {
                    transport = isFunction(transportOptions.read) ? transportOptions : new RemoteTransport(transportOptions);
                }
            } else {
                transport = new LocalTransport({ data: options.data || [] });
            }
            return transport;
        };
        DataSource.create = function (options) {
            if (isArray(options) || options instanceof ObservableArray) {
                options = { data: options };
            }
            var dataSource = options || {}, data = dataSource.data, fields = dataSource.fields, table = dataSource.table, select = dataSource.select, idx, length, model = {}, field;
            if (!data && fields && !dataSource.transport) {
                if (table) {
                    data = inferTable(table, fields);
                } else if (select) {
                    data = inferSelect(select, fields);
                    if (dataSource.group === undefined && data[0] && data[0].optgroup !== undefined) {
                        dataSource.group = 'optgroup';
                    }
                }
            }
            if (kendo.data.Model && fields && (!dataSource.schema || !dataSource.schema.model)) {
                for (idx = 0, length = fields.length; idx < length; idx++) {
                    field = fields[idx];
                    if (field.type) {
                        model[field.field] = field;
                    }
                }
                if (!isEmptyObject(model)) {
                    dataSource.schema = extend(true, dataSource.schema, { model: { fields: model } });
                }
            }
            dataSource.data = data;
            select = null;
            dataSource.select = null;
            table = null;
            dataSource.table = null;
            return dataSource instanceof DataSource ? dataSource : new DataSource(dataSource);
        };
        function inferSelect(select, fields) {
            select = $(select)[0];
            var options = select.options;
            var firstField = fields[0];
            var secondField = fields[1];
            var data = [];
            var idx, length;
            var optgroup;
            var option;
            var record;
            var value;
            for (idx = 0, length = options.length; idx < length; idx++) {
                record = {};
                option = options[idx];
                optgroup = option.parentNode;
                if (optgroup === select) {
                    optgroup = null;
                }
                if (option.disabled || optgroup && optgroup.disabled) {
                    continue;
                }
                if (optgroup) {
                    record.optgroup = optgroup.label;
                }
                record[firstField.field] = option.text;
                value = option.attributes.value;
                if (value && value.specified) {
                    value = option.value;
                } else {
                    value = option.text;
                }
                record[secondField.field] = value;
                data.push(record);
            }
            return data;
        }
        function inferTable(table, fields) {
            var tbody = $(table)[0].tBodies[0], rows = tbody ? tbody.rows : [], idx, length, fieldIndex, fieldCount = fields.length, data = [], cells, record, cell, empty;
            for (idx = 0, length = rows.length; idx < length; idx++) {
                record = {};
                empty = true;
                cells = rows[idx].cells;
                for (fieldIndex = 0; fieldIndex < fieldCount; fieldIndex++) {
                    cell = cells[fieldIndex];
                    if (cell.nodeName.toLowerCase() !== 'th') {
                        empty = false;
                        record[fields[fieldIndex].field] = cell.innerHTML;
                    }
                }
                if (!empty) {
                    data.push(record);
                }
            }
            return data;
        }
        var Node = Model.define({
            idField: 'id',
            init: function (value) {
                var that = this, hasChildren = that.hasChildren || value && value.hasChildren, childrenField = 'items', childrenOptions = {};
                kendo.data.Model.fn.init.call(that, value);
                if (typeof that.children === STRING) {
                    childrenField = that.children;
                }
                childrenOptions = {
                    schema: {
                        data: childrenField,
                        model: {
                            hasChildren: hasChildren,
                            id: that.idField,
                            fields: that.fields
                        }
                    }
                };
                if (typeof that.children !== STRING) {
                    extend(childrenOptions, that.children);
                }
                childrenOptions.data = value;
                if (!hasChildren) {
                    hasChildren = childrenOptions.schema.data;
                }
                if (typeof hasChildren === STRING) {
                    hasChildren = kendo.getter(hasChildren);
                }
                if (isFunction(hasChildren)) {
                    that.hasChildren = !!hasChildren.call(that, that);
                }
                that._childrenOptions = childrenOptions;
                if (that.hasChildren) {
                    that._initChildren();
                }
                that._loaded = !!(value && value._loaded);
            },
            _initChildren: function () {
                var that = this;
                var children, transport, parameterMap;
                if (!(that.children instanceof HierarchicalDataSource)) {
                    children = that.children = new HierarchicalDataSource(that._childrenOptions);
                    transport = children.transport;
                    parameterMap = transport.parameterMap;
                    transport.parameterMap = function (data, type) {
                        data[that.idField || 'id'] = that.id;
                        if (parameterMap) {
                            data = parameterMap(data, type);
                        }
                        return data;
                    };
                    children.parent = function () {
                        return that;
                    };
                    children.bind(CHANGE, function (e) {
                        e.node = e.node || that;
                        that.trigger(CHANGE, e);
                    });
                    children.bind(ERROR, function (e) {
                        var collection = that.parent();
                        if (collection) {
                            e.node = e.node || that;
                            collection.trigger(ERROR, e);
                        }
                    });
                    that._updateChildrenField();
                }
            },
            append: function (model) {
                this._initChildren();
                this.loaded(true);
                this.children.add(model);
            },
            hasChildren: false,
            level: function () {
                var parentNode = this.parentNode(), level = 0;
                while (parentNode && parentNode.parentNode) {
                    level++;
                    parentNode = parentNode.parentNode ? parentNode.parentNode() : null;
                }
                return level;
            },
            _updateChildrenField: function () {
                var fieldName = this._childrenOptions.schema.data;
                this[fieldName || 'items'] = this.children.data();
            },
            _childrenLoaded: function () {
                this._loaded = true;
                this._updateChildrenField();
            },
            load: function () {
                var options = {};
                var method = '_query';
                var children, promise;
                if (this.hasChildren) {
                    this._initChildren();
                    children = this.children;
                    options[this.idField || 'id'] = this.id;
                    if (!this._loaded) {
                        children._data = undefined;
                        method = 'read';
                    }
                    children.one(CHANGE, proxy(this._childrenLoaded, this));
                    promise = children[method](options);
                } else {
                    this.loaded(true);
                }
                return promise || $.Deferred().resolve().promise();
            },
            parentNode: function () {
                var array = this.parent();
                return array.parent();
            },
            loaded: function (value) {
                if (value !== undefined) {
                    this._loaded = value;
                } else {
                    return this._loaded;
                }
            },
            shouldSerialize: function (field) {
                return Model.fn.shouldSerialize.call(this, field) && field !== 'children' && field !== '_loaded' && field !== 'hasChildren' && field !== '_childrenOptions';
            }
        });
        function dataMethod(name) {
            return function () {
                var data = this._data, result = DataSource.fn[name].apply(this, slice.call(arguments));
                if (this._data != data) {
                    this._attachBubbleHandlers();
                }
                return result;
            };
        }
        var HierarchicalDataSource = DataSource.extend({
            init: function (options) {
                var node = Node.define({ children: options });
                DataSource.fn.init.call(this, extend(true, {}, {
                    schema: {
                        modelBase: node,
                        model: node
                    }
                }, options));
                this._attachBubbleHandlers();
            },
            _attachBubbleHandlers: function () {
                var that = this;
                that._data.bind(ERROR, function (e) {
                    that.trigger(ERROR, e);
                });
            },
            remove: function (node) {
                var parentNode = node.parentNode(), dataSource = this, result;
                if (parentNode && parentNode._initChildren) {
                    dataSource = parentNode.children;
                }
                result = DataSource.fn.remove.call(dataSource, node);
                if (parentNode && !dataSource.data().length) {
                    parentNode.hasChildren = false;
                }
                return result;
            },
            success: dataMethod('success'),
            data: dataMethod('data'),
            insert: function (index, model) {
                var parentNode = this.parent();
                if (parentNode && parentNode._initChildren) {
                    parentNode.hasChildren = true;
                    parentNode._initChildren();
                }
                return DataSource.fn.insert.call(this, index, model);
            },
            _find: function (method, value) {
                var idx, length, node, children;
                var data = this._data;
                if (!data) {
                    return;
                }
                node = DataSource.fn[method].call(this, value);
                if (node) {
                    return node;
                }
                data = this._flatData(this._data);
                for (idx = 0, length = data.length; idx < length; idx++) {
                    children = data[idx].children;
                    if (!(children instanceof HierarchicalDataSource)) {
                        continue;
                    }
                    node = children[method](value);
                    if (node) {
                        return node;
                    }
                }
            },
            get: function (id) {
                return this._find('get', id);
            },
            getByUid: function (uid) {
                return this._find('getByUid', uid);
            }
        });
        function inferList(list, fields) {
            var items = $(list).children(), idx, length, data = [], record, textField = fields[0].field, urlField = fields[1] && fields[1].field, spriteCssClassField = fields[2] && fields[2].field, imageUrlField = fields[3] && fields[3].field, item, id, textChild, className, children;
            function elements(collection, tagName) {
                return collection.filter(tagName).add(collection.find(tagName));
            }
            for (idx = 0, length = items.length; idx < length; idx++) {
                record = { _loaded: true };
                item = items.eq(idx);
                textChild = item[0].firstChild;
                children = item.children();
                list = children.filter('ul');
                children = children.filter(':not(ul)');
                id = item.attr('data-id');
                if (id) {
                    record.id = id;
                }
                if (textChild) {
                    record[textField] = textChild.nodeType == 3 ? textChild.nodeValue : children.text();
                }
                if (urlField) {
                    record[urlField] = elements(children, 'a').attr('href');
                }
                if (imageUrlField) {
                    record[imageUrlField] = elements(children, 'img').attr('src');
                }
                if (spriteCssClassField) {
                    className = elements(children, '.k-sprite').prop('className');
                    record[spriteCssClassField] = className && $.trim(className.replace('k-sprite', ''));
                }
                if (list.length) {
                    record.items = inferList(list.eq(0), fields);
                }
                if (item.attr('data-hasChildren') == 'true') {
                    record.hasChildren = true;
                }
                data.push(record);
            }
            return data;
        }
        HierarchicalDataSource.create = function (options) {
            options = options && options.push ? { data: options } : options;
            var dataSource = options || {}, data = dataSource.data, fields = dataSource.fields, list = dataSource.list;
            if (data && data._dataSource) {
                return data._dataSource;
            }
            if (!data && fields && !dataSource.transport) {
                if (list) {
                    data = inferList(list, fields);
                }
            }
            dataSource.data = data;
            return dataSource instanceof HierarchicalDataSource ? dataSource : new HierarchicalDataSource(dataSource);
        };
        var Buffer = kendo.Observable.extend({
            init: function (dataSource, viewSize, disablePrefetch) {
                kendo.Observable.fn.init.call(this);
                this._prefetching = false;
                this.dataSource = dataSource;
                this.prefetch = !disablePrefetch;
                var buffer = this;
                dataSource.bind('change', function () {
                    buffer._change();
                });
                dataSource.bind('reset', function () {
                    buffer._reset();
                });
                this._syncWithDataSource();
                this.setViewSize(viewSize);
            },
            setViewSize: function (viewSize) {
                this.viewSize = viewSize;
                this._recalculate();
            },
            at: function (index) {
                var pageSize = this.pageSize, itemPresent = true;
                if (index >= this.total()) {
                    this.trigger('endreached', { index: index });
                    return null;
                }
                if (!this.useRanges) {
                    return this.dataSource.view()[index];
                }
                if (this.useRanges) {
                    if (index < this.dataOffset || index >= this.skip + pageSize) {
                        itemPresent = this.range(Math.floor(index / pageSize) * pageSize);
                    }
                    if (index === this.prefetchThreshold) {
                        this._prefetch();
                    }
                    if (index === this.midPageThreshold) {
                        this.range(this.nextMidRange, true);
                    } else if (index === this.nextPageThreshold) {
                        this.range(this.nextFullRange);
                    } else if (index === this.pullBackThreshold) {
                        if (this.offset === this.skip) {
                            this.range(this.previousMidRange);
                        } else {
                            this.range(this.previousFullRange);
                        }
                    }
                    if (itemPresent) {
                        return this.dataSource.at(index - this.dataOffset);
                    } else {
                        this.trigger('endreached', { index: index });
                        return null;
                    }
                }
            },
            indexOf: function (item) {
                return this.dataSource.data().indexOf(item) + this.dataOffset;
            },
            total: function () {
                return parseInt(this.dataSource.total(), 10);
            },
            next: function () {
                var buffer = this, pageSize = buffer.pageSize, offset = buffer.skip - buffer.viewSize + pageSize, pageSkip = math.max(math.floor(offset / pageSize), 0) * pageSize;
                this.offset = offset;
                this.dataSource.prefetch(pageSkip, pageSize, function () {
                    buffer._goToRange(offset, true);
                });
            },
            range: function (offset, nextRange) {
                if (this.offset === offset) {
                    return true;
                }
                var buffer = this, pageSize = this.pageSize, pageSkip = math.max(math.floor(offset / pageSize), 0) * pageSize, dataSource = this.dataSource;
                if (nextRange) {
                    pageSkip += pageSize;
                }
                if (dataSource.inRange(offset, pageSize)) {
                    this.offset = offset;
                    this._recalculate();
                    this._goToRange(offset);
                    return true;
                } else if (this.prefetch) {
                    dataSource.prefetch(pageSkip, pageSize, function () {
                        buffer.offset = offset;
                        buffer._recalculate();
                        buffer._goToRange(offset, true);
                    });
                    return false;
                }
                return true;
            },
            syncDataSource: function () {
                var offset = this.offset;
                this.offset = null;
                this.range(offset);
            },
            destroy: function () {
                this.unbind();
            },
            _prefetch: function () {
                var buffer = this, pageSize = this.pageSize, prefetchOffset = this.skip + pageSize, dataSource = this.dataSource;
                if (!dataSource.inRange(prefetchOffset, pageSize) && !this._prefetching && this.prefetch) {
                    this._prefetching = true;
                    this.trigger('prefetching', {
                        skip: prefetchOffset,
                        take: pageSize
                    });
                    dataSource.prefetch(prefetchOffset, pageSize, function () {
                        buffer._prefetching = false;
                        buffer.trigger('prefetched', {
                            skip: prefetchOffset,
                            take: pageSize
                        });
                    });
                }
            },
            _goToRange: function (offset, expanding) {
                if (this.offset !== offset) {
                    return;
                }
                this.dataOffset = offset;
                this._expanding = expanding;
                this.dataSource.range(offset, this.pageSize);
                this.dataSource.enableRequestsInProgress();
            },
            _reset: function () {
                this._syncPending = true;
            },
            _change: function () {
                var dataSource = this.dataSource;
                this.length = this.useRanges ? dataSource.lastRange().end : dataSource.view().length;
                if (this._syncPending) {
                    this._syncWithDataSource();
                    this._recalculate();
                    this._syncPending = false;
                    this.trigger('reset', { offset: this.offset });
                }
                this.trigger('resize');
                if (this._expanding) {
                    this.trigger('expand');
                }
                delete this._expanding;
            },
            _syncWithDataSource: function () {
                var dataSource = this.dataSource;
                this._firstItemUid = dataSource.firstItemUid();
                this.dataOffset = this.offset = dataSource.skip() || 0;
                this.pageSize = dataSource.pageSize();
                this.useRanges = dataSource.options.serverPaging;
            },
            _recalculate: function () {
                var pageSize = this.pageSize, offset = this.offset, viewSize = this.viewSize, skip = Math.ceil(offset / pageSize) * pageSize;
                this.skip = skip;
                this.midPageThreshold = skip + pageSize - 1;
                this.nextPageThreshold = skip + viewSize - 1;
                this.prefetchThreshold = skip + Math.floor(pageSize / 3 * 2);
                this.pullBackThreshold = this.offset - 1;
                this.nextMidRange = skip + pageSize - viewSize;
                this.nextFullRange = skip;
                this.previousMidRange = offset - viewSize;
                this.previousFullRange = skip - pageSize;
            }
        });
        var BatchBuffer = kendo.Observable.extend({
            init: function (dataSource, batchSize) {
                var batchBuffer = this;
                kendo.Observable.fn.init.call(batchBuffer);
                this.dataSource = dataSource;
                this.batchSize = batchSize;
                this._total = 0;
                this.buffer = new Buffer(dataSource, batchSize * 3);
                this.buffer.bind({
                    'endreached': function (e) {
                        batchBuffer.trigger('endreached', { index: e.index });
                    },
                    'prefetching': function (e) {
                        batchBuffer.trigger('prefetching', {
                            skip: e.skip,
                            take: e.take
                        });
                    },
                    'prefetched': function (e) {
                        batchBuffer.trigger('prefetched', {
                            skip: e.skip,
                            take: e.take
                        });
                    },
                    'reset': function () {
                        batchBuffer._total = 0;
                        batchBuffer.trigger('reset');
                    },
                    'resize': function () {
                        batchBuffer._total = Math.ceil(this.length / batchBuffer.batchSize);
                        batchBuffer.trigger('resize', {
                            total: batchBuffer.total(),
                            offset: this.offset
                        });
                    }
                });
            },
            syncDataSource: function () {
                this.buffer.syncDataSource();
            },
            at: function (index) {
                var buffer = this.buffer, skip = index * this.batchSize, take = this.batchSize, view = [], item;
                if (buffer.offset > skip) {
                    buffer.at(buffer.offset - 1);
                }
                for (var i = 0; i < take; i++) {
                    item = buffer.at(skip + i);
                    if (item === null) {
                        break;
                    }
                    view.push(item);
                }
                return view;
            },
            total: function () {
                return this._total;
            },
            destroy: function () {
                this.buffer.destroy();
                this.unbind();
            }
        });
        extend(true, kendo.data, {
            readers: { json: DataReader },
            Query: Query,
            DataSource: DataSource,
            HierarchicalDataSource: HierarchicalDataSource,
            Node: Node,
            ObservableObject: ObservableObject,
            ObservableArray: ObservableArray,
            LazyObservableArray: LazyObservableArray,
            LocalTransport: LocalTransport,
            RemoteTransport: RemoteTransport,
            Cache: Cache,
            DataReader: DataReader,
            Model: Model,
            Buffer: Buffer,
            BatchBuffer: BatchBuffer
        });
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));

/** 
 * Copyright 2016 Telerik AD                                                                                                                                                                            
 *                                                                                                                                                                                                      
 * Licensed under the Apache License, Version 2.0 (the "License");                                                                                                                                      
 * you may not use this file except in compliance with the License.                                                                                                                                     
 * You may obtain a copy of the License at                                                                                                                                                              
 *                                                                                                                                                                                                      
 *     http://www.apache.org/licenses/LICENSE-2.0                                                                                                                                                       
 *                                                                                                                                                                                                      
 * Unless required by applicable law or agreed to in writing, software                                                                                                                                  
 * distributed under the License is distributed on an "AS IS" BASIS,                                                                                                                                    
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.                                                                                                                             
 * See the License for the specific language governing permissions and                                                                                                                                  
 * limitations under the License.                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.list', [
        'kendo.data',
        'kendo.popup'
    ], f);
}(function () {
    var __meta__ = {
        id: 'list',
        name: 'List',
        category: 'framework',
        depends: [
            'data',
            'popup'
        ],
        hidden: true
    };
    (function ($, undefined) {
        var kendo = window.kendo, ui = kendo.ui, Widget = ui.Widget, keys = kendo.keys, support = kendo.support, htmlEncode = kendo.htmlEncode, activeElement = kendo._activeElement, ObservableArray = kendo.data.ObservableArray, ID = 'id', CHANGE = 'change', FOCUSED = 'k-state-focused', HOVER = 'k-state-hover', LOADING = 'k-loading', OPEN = 'open', CLOSE = 'close', CASCADE = 'cascade', SELECT = 'select', SELECTED = 'selected', REQUESTSTART = 'requestStart', REQUESTEND = 'requestEnd', WIDTH = 'width', extend = $.extend, proxy = $.proxy, isArray = $.isArray, browser = support.browser, isIE8 = browser.msie && browser.version < 9, quotRegExp = /"/g, alternativeNames = {
            'ComboBox': 'DropDownList',
            'DropDownList': 'ComboBox'
        };
        var List = kendo.ui.DataBoundWidget.extend({
            init: function (element, options) {
                var that = this, ns = that.ns, id;
                Widget.fn.init.call(that, element, options);
                element = that.element;
                options = that.options;
                that._isSelect = element.is(SELECT);
                if (that._isSelect && that.element[0].length) {
                    if (!options.dataSource) {
                        options.dataTextField = options.dataTextField || 'text';
                        options.dataValueField = options.dataValueField || 'value';
                    }
                }
                that.ul = $('<ul unselectable="on" class="k-list k-reset"/>').attr({
                    tabIndex: -1,
                    'aria-hidden': true
                });
                that.list = $('<div class=\'k-list-container\'/>').append(that.ul).on('mousedown' + ns, proxy(that._listMousedown, that));
                id = element.attr(ID);
                if (id) {
                    that.list.attr(ID, id + '-list');
                    that.ul.attr(ID, id + '_listbox');
                }
                that._header();
                that._accessors();
                that._initValue();
            },
            options: {
                valuePrimitive: false,
                headerTemplate: ''
            },
            setOptions: function (options) {
                Widget.fn.setOptions.call(this, options);
                if (options && options.enable !== undefined) {
                    options.enabled = options.enable;
                }
            },
            focus: function () {
                this._focused.focus();
            },
            readonly: function (readonly) {
                this._editable({
                    readonly: readonly === undefined ? true : readonly,
                    disable: false
                });
            },
            enable: function (enable) {
                this._editable({
                    readonly: false,
                    disable: !(enable = enable === undefined ? true : enable)
                });
            },
            _listOptions: function (options) {
                var that = this;
                var currentOptions = that.options;
                var virtual = currentOptions.virtual;
                var listBoundHandler = proxy(that._listBound, that);
                virtual = typeof virtual === 'object' ? virtual : {};
                options = $.extend({
                    autoBind: false,
                    selectable: true,
                    dataSource: that.dataSource,
                    click: proxy(that._click, that),
                    change: proxy(that._listChange, that),
                    activate: proxy(that._activateItem, that),
                    deactivate: proxy(that._deactivateItem, that),
                    dataBinding: function () {
                        that.trigger('dataBinding');
                        that._angularItems('cleanup');
                    },
                    dataBound: listBoundHandler,
                    listBound: listBoundHandler,
                    height: currentOptions.height,
                    dataValueField: currentOptions.dataValueField,
                    dataTextField: currentOptions.dataTextField,
                    groupTemplate: currentOptions.groupTemplate,
                    fixedGroupTemplate: currentOptions.fixedGroupTemplate,
                    template: currentOptions.template
                }, options, virtual);
                if (!options.template) {
                    options.template = '#:' + kendo.expr(options.dataTextField, 'data') + '#';
                }
                return options;
            },
            _initList: function () {
                var that = this;
                var listOptions = that._listOptions({ selectedItemChange: proxy(that._listChange, that) });
                if (!that.options.virtual) {
                    that.listView = new kendo.ui.StaticList(that.ul, listOptions);
                } else {
                    that.listView = new kendo.ui.VirtualList(that.ul, listOptions);
                }
                that._setListValue();
            },
            _setListValue: function (value) {
                value = value || this.options.value;
                if (value !== undefined) {
                    this.listView.value(value).done(proxy(this._updateSelectionState, this));
                }
            },
            _updateSelectionState: $.noop,
            _listMousedown: function (e) {
                if (!this.filterInput || this.filterInput[0] !== e.target) {
                    e.preventDefault();
                }
            },
            _isFilterEnabled: function () {
                var filter = this.options.filter;
                return filter && filter !== 'none';
            },
            _clearFilter: function () {
                if (!this.options.virtual) {
                    this.listView.bound(false);
                }
                this._filterSource();
            },
            _filterSource: function (filter, force) {
                var that = this;
                var options = that.options;
                var dataSource = that.dataSource;
                var expression = extend({}, dataSource.filter() || {});
                var removed = removeFiltersForField(expression, options.dataTextField);
                if ((filter || removed) && that.trigger('filtering', { filter: filter })) {
                    return;
                }
                expression = {
                    filters: expression.filters || [],
                    logic: 'and'
                };
                if (filter) {
                    expression.filters.push(filter);
                }
                if (that._cascading) {
                    this.listView.setDSFilter(expression);
                }
                if (!force) {
                    dataSource.filter(expression);
                } else {
                    dataSource.read({ filter: expression });
                }
            },
            _header: function () {
                var that = this;
                var template = that.options.headerTemplate;
                var header;
                if ($.isFunction(template)) {
                    template = template({});
                }
                if (template) {
                    that.list.prepend(template);
                    header = that.ul.prev();
                    that.header = header[0] ? header : null;
                    if (that.header) {
                        that.angular('compile', function () {
                            return { elements: that.header };
                        });
                    }
                }
            },
            _initValue: function () {
                var that = this, value = that.options.value;
                if (value !== null) {
                    that.element.val(value);
                } else {
                    value = that._accessor();
                    that.options.value = value;
                }
                that._old = value;
            },
            _ignoreCase: function () {
                var that = this, model = that.dataSource.reader.model, field;
                if (model && model.fields) {
                    field = model.fields[that.options.dataTextField];
                    if (field && field.type && field.type !== 'string') {
                        that.options.ignoreCase = false;
                    }
                }
            },
            _focus: function (candidate) {
                return this.listView.focus(candidate);
            },
            current: function (candidate) {
                return this._focus(candidate);
            },
            items: function () {
                return this.ul[0].children;
            },
            destroy: function () {
                var that = this;
                var ns = that.ns;
                Widget.fn.destroy.call(that);
                that._unbindDataSource();
                that.listView.destroy();
                that.list.off(ns);
                that.popup.destroy();
                if (that._form) {
                    that._form.off('reset', that._resetHandler);
                }
            },
            dataItem: function (index) {
                var that = this;
                if (index === undefined) {
                    return that.listView.selectedDataItems()[0];
                }
                if (typeof index !== 'number') {
                    if (that.options.virtual) {
                        return that.dataSource.getByUid($(index).data('uid'));
                    }
                    index = $(that.items()).index(index);
                }
                return that.dataSource.flatView()[index];
            },
            _activateItem: function () {
                var current = this.listView.focus();
                if (current) {
                    this._focused.add(this.filterInput).attr('aria-activedescendant', current.attr('id'));
                }
            },
            _deactivateItem: function () {
                this._focused.add(this.filterInput).removeAttr('aria-activedescendant');
            },
            _accessors: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                var getter = kendo.getter;
                var textField = element.attr(kendo.attr('text-field'));
                var valueField = element.attr(kendo.attr('value-field'));
                if (!options.dataTextField && textField) {
                    options.dataTextField = textField;
                }
                if (!options.dataValueField && valueField) {
                    options.dataValueField = valueField;
                }
                that._text = getter(options.dataTextField);
                that._value = getter(options.dataValueField);
            },
            _aria: function (id) {
                var that = this, options = that.options, element = that._focused.add(that.filterInput);
                if (options.suggest !== undefined) {
                    element.attr('aria-autocomplete', options.suggest ? 'both' : 'list');
                }
                id = id ? id + ' ' + that.ul[0].id : that.ul[0].id;
                element.attr('aria-owns', id);
                that.ul.attr('aria-live', !that._isFilterEnabled() ? 'off' : 'polite');
            },
            _blur: function () {
                var that = this;
                that._change();
                that.close();
            },
            _change: function () {
                var that = this;
                var index = that.selectedIndex;
                var optionValue = that.options.value;
                var value = that.value();
                var trigger;
                if (that._isSelect && !that.listView.bound() && optionValue) {
                    value = optionValue;
                }
                if (value !== unifyType(that._old, typeof value)) {
                    trigger = true;
                } else if (index !== undefined && index !== that._oldIndex) {
                    trigger = true;
                }
                if (trigger) {
                    that._old = value;
                    that._oldIndex = index;
                    if (!that._typing) {
                        that.element.trigger(CHANGE);
                    }
                    that.trigger(CHANGE);
                }
                that.typing = false;
            },
            _data: function () {
                return this.dataSource.view();
            },
            _enable: function () {
                var that = this, options = that.options, disabled = that.element.is('[disabled]');
                if (options.enable !== undefined) {
                    options.enabled = options.enable;
                }
                if (!options.enabled || disabled) {
                    that.enable(false);
                } else {
                    that.readonly(that.element.is('[readonly]'));
                }
            },
            _dataValue: function (dataItem) {
                var value = this._value(dataItem);
                if (value === undefined) {
                    value = this._text(dataItem);
                }
                return value;
            },
            _offsetHeight: function () {
                var offsetHeight = 0;
                var siblings = this.listView.content.prevAll(':visible');
                siblings.each(function () {
                    var element = $(this);
                    if (element.hasClass('k-list-filter')) {
                        offsetHeight += element.children().outerHeight();
                    } else {
                        offsetHeight += element.outerHeight();
                    }
                });
                return offsetHeight;
            },
            _height: function (length) {
                var that = this;
                var list = that.list;
                var height = that.options.height;
                var visible = that.popup.visible();
                var offsetTop;
                var popups;
                if (length) {
                    popups = list.add(list.parent('.k-animation-container')).show();
                    if (!list.is(':visible')) {
                        popups.hide();
                        return;
                    }
                    height = that.listView.content[0].scrollHeight > height ? height : 'auto';
                    popups.height(height);
                    if (height !== 'auto') {
                        offsetTop = that._offsetHeight();
                        if (offsetTop) {
                            height -= offsetTop;
                        }
                    }
                    that.listView.content.height(height);
                    if (!visible) {
                        popups.hide();
                    }
                }
                return height;
            },
            _adjustListWidth: function () {
                var list = this.list, width = list[0].style.width, wrapper = this.wrapper, computedStyle, computedWidth;
                if (!list.data(WIDTH) && width) {
                    return;
                }
                computedStyle = window.getComputedStyle ? window.getComputedStyle(wrapper[0], null) : 0;
                computedWidth = parseFloat(computedStyle && computedStyle.width) || wrapper.outerWidth();
                if (computedStyle && browser.msie) {
                    computedWidth += parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight) + parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth);
                }
                if (list.css('box-sizing') !== 'border-box') {
                    width = computedWidth - (list.outerWidth() - list.width());
                } else {
                    width = computedWidth;
                }
                list.css({
                    fontFamily: wrapper.css('font-family'),
                    width: width
                }).data(WIDTH, width);
                return true;
            },
            _openHandler: function (e) {
                this._adjustListWidth();
                if (this.trigger(OPEN)) {
                    e.preventDefault();
                } else {
                    this._focused.attr('aria-expanded', true);
                    this.ul.attr('aria-hidden', false);
                }
            },
            _closeHandler: function (e) {
                if (this.trigger(CLOSE)) {
                    e.preventDefault();
                } else {
                    this._focused.attr('aria-expanded', false);
                    this.ul.attr('aria-hidden', true);
                }
            },
            _focusItem: function () {
                var listView = this.listView;
                var focusedItem = listView.focus();
                var index = listView.select();
                index = index[index.length - 1];
                if (index === undefined && this.options.highlightFirst && !focusedItem) {
                    index = 0;
                }
                if (index !== undefined) {
                    listView.focus(index);
                } else {
                    listView.scrollToIndex(0);
                }
            },
            _calculateGroupPadding: function (height) {
                var li = this.ul.children('.k-first:first');
                var groupHeader = this.listView.content.prev('.k-group-header');
                var padding = 0;
                if (groupHeader[0] && groupHeader[0].style.display !== 'none') {
                    if (height !== 'auto') {
                        padding = kendo.support.scrollbar();
                    }
                    padding += parseFloat(li.css('border-right-width'), 10) + parseFloat(li.children('.k-group').css('padding-right'), 10);
                    groupHeader.css('padding-right', padding);
                }
            },
            _calculatePopupHeight: function (force) {
                var height = this._height(this.dataSource.flatView().length || force);
                this._calculateGroupPadding(height);
            },
            _resizePopup: function (force) {
                if (this.options.virtual) {
                    return;
                }
                if (!this.popup.element.is(':visible')) {
                    this.popup.one('open', function (force) {
                        return proxy(function () {
                            this._calculatePopupHeight(force);
                        }, this);
                    }.call(this, force));
                } else {
                    this._calculatePopupHeight(force);
                }
            },
            _popup: function () {
                var that = this;
                that.popup = new ui.Popup(that.list, extend({}, that.options.popup, {
                    anchor: that.wrapper,
                    open: proxy(that._openHandler, that),
                    close: proxy(that._closeHandler, that),
                    animation: that.options.animation,
                    isRtl: support.isRtl(that.wrapper)
                }));
            },
            _makeUnselectable: function () {
                if (isIE8) {
                    this.list.find('*').not('.k-textbox').attr('unselectable', 'on');
                }
            },
            _toggleHover: function (e) {
                $(e.currentTarget).toggleClass(HOVER, e.type === 'mouseenter');
            },
            _toggle: function (open, preventFocus) {
                var that = this;
                var touchEnabled = support.mobileOS && (support.touch || support.MSPointers || support.pointers);
                open = open !== undefined ? open : !that.popup.visible();
                if (!preventFocus && !touchEnabled && that._focused[0] !== activeElement()) {
                    that._prevent = true;
                    that._focused.focus();
                    that._prevent = false;
                }
                that[open ? OPEN : CLOSE]();
            },
            _triggerCascade: function () {
                var that = this;
                if (!that._cascadeTriggered || that._old !== that.value() || that._oldIndex !== that.selectedIndex) {
                    that._cascadeTriggered = true;
                    that.trigger(CASCADE, { userTriggered: that._userTriggered });
                }
            },
            _triggerChange: function () {
                if (this._valueBeforeCascade !== this.value()) {
                    this.trigger(CHANGE);
                }
            },
            _unbindDataSource: function () {
                var that = this;
                that.dataSource.unbind(REQUESTSTART, that._requestStartHandler).unbind(REQUESTEND, that._requestEndHandler).unbind('error', that._errorHandler);
            }
        });
        function unifyType(value, type) {
            if (value !== undefined && value !== '' && value !== null) {
                if (type === 'boolean') {
                    value = Boolean(value);
                } else if (type === 'number') {
                    value = Number(value);
                } else if (type === 'string') {
                    value = value.toString();
                }
            }
            return value;
        }
        extend(List, {
            inArray: function (node, parentNode) {
                var idx, length, siblings = parentNode.children;
                if (!node || node.parentNode !== parentNode) {
                    return -1;
                }
                for (idx = 0, length = siblings.length; idx < length; idx++) {
                    if (node === siblings[idx]) {
                        return idx;
                    }
                }
                return -1;
            },
            unifyType: unifyType
        });
        kendo.ui.List = List;
        ui.Select = List.extend({
            init: function (element, options) {
                List.fn.init.call(this, element, options);
                this._initial = this.element.val();
            },
            setDataSource: function (dataSource) {
                var that = this;
                var parent;
                that.options.dataSource = dataSource;
                that._dataSource();
                if (that.listView.bound()) {
                    that._initialIndex = null;
                }
                that.listView.setDataSource(that.dataSource);
                if (that.options.autoBind) {
                    that.dataSource.fetch();
                }
                parent = that._parentWidget();
                if (parent) {
                    that._cascadeSelect(parent);
                }
            },
            close: function () {
                this.popup.close();
            },
            select: function (candidate) {
                var that = this;
                if (candidate === undefined) {
                    return that.selectedIndex;
                } else {
                    that._select(candidate);
                    that._old = that._accessor();
                    that._oldIndex = that.selectedIndex;
                }
            },
            search: function (word) {
                word = typeof word === 'string' ? word : this.text();
                var that = this;
                var length = word.length;
                var options = that.options;
                var ignoreCase = options.ignoreCase;
                var field = options.dataTextField;
                clearTimeout(that._typingTimeout);
                if (!length || length >= options.minLength) {
                    that._state = 'filter';
                    if (!that._isFilterEnabled()) {
                        that._filter(word);
                    } else {
                        that._open = true;
                        that._filterSource({
                            value: ignoreCase ? word.toLowerCase() : word,
                            field: field,
                            operator: options.filter,
                            ignoreCase: ignoreCase
                        });
                    }
                }
            },
            _accessor: function (value, idx) {
                return this[this._isSelect ? '_accessorSelect' : '_accessorInput'](value, idx);
            },
            _accessorInput: function (value) {
                var element = this.element[0];
                if (value === undefined) {
                    return element.value;
                } else {
                    if (value === null) {
                        value = '';
                    }
                    element.value = value;
                }
            },
            _accessorSelect: function (value, idx) {
                var element = this.element[0];
                var selectedIndex = element.selectedIndex;
                var option;
                if (value === undefined) {
                    if (selectedIndex > -1) {
                        option = element.options[selectedIndex];
                    }
                    if (option) {
                        value = option.value;
                    }
                    return value || '';
                } else {
                    if (selectedIndex > -1) {
                        element.options[selectedIndex].removeAttribute(SELECTED);
                        element.options[selectedIndex].selected = false;
                    }
                    if (idx === undefined) {
                        idx = -1;
                    }
                    if (value !== null && value !== '' && idx == -1) {
                        this._custom(value);
                    } else {
                        if (value) {
                            element.value = value;
                        } else {
                            element.selectedIndex = idx;
                        }
                        if (element.selectedIndex > -1) {
                            option = element.options[element.selectedIndex];
                        }
                        if (option) {
                            option.setAttribute(SELECTED, SELECTED);
                        }
                    }
                }
            },
            _custom: function (value) {
                var that = this;
                var element = that.element;
                var custom = that._customOption;
                if (!custom) {
                    custom = $('<option/>');
                    that._customOption = custom;
                    element.append(custom);
                }
                custom.text(value);
                custom[0].setAttribute(SELECTED, SELECTED);
                custom[0].selected = true;
            },
            _hideBusy: function () {
                var that = this;
                clearTimeout(that._busy);
                that._arrow.removeClass(LOADING);
                that._focused.attr('aria-busy', false);
                that._busy = null;
            },
            _showBusy: function () {
                var that = this;
                that._request = true;
                if (that._busy) {
                    return;
                }
                that._busy = setTimeout(function () {
                    if (that._arrow) {
                        that._focused.attr('aria-busy', true);
                        that._arrow.addClass(LOADING);
                    }
                }, 100);
            },
            _requestEnd: function () {
                this._request = false;
                this._hideBusy();
            },
            _dataSource: function () {
                var that = this, element = that.element, options = that.options, dataSource = options.dataSource || {}, idx;
                dataSource = $.isArray(dataSource) ? { data: dataSource } : dataSource;
                if (that._isSelect) {
                    idx = element[0].selectedIndex;
                    if (idx > -1) {
                        options.index = idx;
                    }
                    dataSource.select = element;
                    dataSource.fields = [
                        { field: options.dataTextField },
                        { field: options.dataValueField }
                    ];
                }
                if (that.dataSource) {
                    that._unbindDataSource();
                } else {
                    that._requestStartHandler = proxy(that._showBusy, that);
                    that._requestEndHandler = proxy(that._requestEnd, that);
                    that._errorHandler = proxy(that._hideBusy, that);
                }
                that.dataSource = kendo.data.DataSource.create(dataSource).bind(REQUESTSTART, that._requestStartHandler).bind(REQUESTEND, that._requestEndHandler).bind('error', that._errorHandler);
            },
            _firstItem: function () {
                this.listView.focusFirst();
            },
            _lastItem: function () {
                this.listView.focusLast();
            },
            _nextItem: function () {
                this.listView.focusNext();
            },
            _prevItem: function () {
                this.listView.focusPrev();
            },
            _move: function (e) {
                var that = this;
                var key = e.keyCode;
                var down = key === keys.DOWN;
                var dataItem;
                var pressed;
                var current;
                if (key === keys.UP || down) {
                    if (e.altKey) {
                        that.toggle(down);
                    } else {
                        if (!that.listView.bound()) {
                            if (!that._fetch) {
                                that.dataSource.one(CHANGE, function () {
                                    that._fetch = false;
                                    that._move(e);
                                });
                                that._fetch = true;
                                that._filterSource();
                            }
                            e.preventDefault();
                            return true;
                        }
                        current = that._focus();
                        if (!that._fetch && (!current || current.hasClass('k-state-selected'))) {
                            if (down) {
                                that._nextItem();
                                if (!that._focus()) {
                                    that._lastItem();
                                }
                            } else {
                                that._prevItem();
                                if (!that._focus()) {
                                    that._firstItem();
                                }
                            }
                        }
                        if (that.trigger(SELECT, { item: that._focus() })) {
                            that._focus(current);
                            return;
                        }
                        that._select(that._focus(), true);
                        if (!that.popup.visible()) {
                            that._blur();
                        }
                    }
                    e.preventDefault();
                    pressed = true;
                } else if (key === keys.ENTER || key === keys.TAB) {
                    if (that.popup.visible()) {
                        e.preventDefault();
                    }
                    current = that._focus();
                    dataItem = that.dataItem();
                    if (!that.popup.visible() && (!dataItem || that.text() !== that._text(dataItem))) {
                        current = null;
                    }
                    var activeFilter = that.filterInput && that.filterInput[0] === activeElement();
                    if (current) {
                        if (that.trigger(SELECT, { item: current })) {
                            return;
                        }
                        that._select(current);
                    } else if (that.input) {
                        that._accessor(that.input.val());
                        that.listView.value(that.input.val());
                    }
                    if (that._focusElement) {
                        that._focusElement(that.wrapper);
                    }
                    if (activeFilter && key === keys.TAB) {
                        that.wrapper.focusout();
                    } else {
                        that._blur();
                    }
                    that.close();
                    pressed = true;
                } else if (key === keys.ESC) {
                    if (that.popup.visible()) {
                        e.preventDefault();
                    }
                    that.close();
                    pressed = true;
                }
                return pressed;
            },
            _fetchData: function () {
                var that = this;
                var hasItems = !!that.dataSource.view().length;
                if (that._request || that.options.cascadeFrom) {
                    return;
                }
                if (!that.listView.bound() && !that._fetch && !hasItems) {
                    that._fetch = true;
                    that.dataSource.fetch().done(function () {
                        that._fetch = false;
                    });
                }
            },
            _options: function (data, optionLabel, value) {
                var that = this, element = that.element, length = data.length, options = '', option, dataItem, dataText, dataValue, idx = 0;
                if (optionLabel) {
                    options = optionLabel;
                }
                for (; idx < length; idx++) {
                    option = '<option';
                    dataItem = data[idx];
                    dataText = that._text(dataItem);
                    dataValue = that._value(dataItem);
                    if (dataValue !== undefined) {
                        dataValue += '';
                        if (dataValue.indexOf('"') !== -1) {
                            dataValue = dataValue.replace(quotRegExp, '&quot;');
                        }
                        option += ' value="' + dataValue + '"';
                    }
                    option += '>';
                    if (dataText !== undefined) {
                        option += htmlEncode(dataText);
                    }
                    option += '</option>';
                    options += option;
                }
                element.html(options);
                if (value !== undefined) {
                    element[0].value = value;
                    if (element[0].value && !value) {
                        element[0].selectedIndex = -1;
                    }
                }
            },
            _reset: function () {
                var that = this, element = that.element, formId = element.attr('form'), form = formId ? $('#' + formId) : element.closest('form');
                if (form[0]) {
                    that._resetHandler = function () {
                        setTimeout(function () {
                            that.value(that._initial);
                        });
                    };
                    that._form = form.on('reset', that._resetHandler);
                }
            },
            _parentWidget: function () {
                var name = this.options.name;
                var parentElement = $('#' + this.options.cascadeFrom);
                var parent = parentElement.data('kendo' + name);
                if (!parent) {
                    parent = parentElement.data('kendo' + alternativeNames[name]);
                }
                return parent;
            },
            _cascade: function () {
                var that = this;
                var options = that.options;
                var cascade = options.cascadeFrom;
                var parent;
                if (cascade) {
                    parent = that._parentWidget();
                    that._cascadeHandlerProxy = proxy(that._cascadeHandler, that);
                    if (!parent) {
                        return;
                    }
                    options.autoBind = false;
                    parent.bind('set', function () {
                        that.one('set', function (e) {
                            that._selectedValue = e.value;
                        });
                    });
                    parent.first(CASCADE, that._cascadeHandlerProxy);
                    if (parent.listView.bound()) {
                        that._toggleCascadeOnFocus();
                        that._cascadeSelect(parent);
                    } else {
                        parent.one('dataBound', function () {
                            that._toggleCascadeOnFocus();
                        });
                        if (!parent.value()) {
                            that.enable(false);
                        }
                    }
                }
            },
            _toggleCascadeOnFocus: function () {
                var that = this;
                var parent = that._parentWidget();
                parent._focused.bind('focus', function () {
                    parent.unbind(CASCADE, that._cascadeHandlerProxy);
                    parent.first(CHANGE, that._cascadeHandlerProxy);
                });
                parent._focused.bind('focusout', function () {
                    parent.unbind(CHANGE, that._cascadeHandlerProxy);
                    parent.first(CASCADE, that._cascadeHandlerProxy);
                });
            },
            _cascadeHandler: function (e) {
                var parent = this._parentWidget();
                var valueBeforeCascade = this.value();
                this._userTriggered = e.userTriggered;
                if (this.listView.bound()) {
                    this._clearSelection(parent, true);
                }
                this._cascadeSelect(parent, valueBeforeCascade);
            },
            _cascadeChange: function (parent) {
                var that = this;
                var value = that._accessor() || that._selectedValue;
                that._selectedValue = null;
                if (that._userTriggered) {
                    that._clearSelection(parent, true);
                } else if (value) {
                    if (value !== that.listView.value()[0]) {
                        that.value(value);
                    }
                    if (!that.dataSource.view()[0] || that.selectedIndex === -1) {
                        that._clearSelection(parent, true);
                    }
                } else if (that.dataSource.flatView().length) {
                    that.select(that.options.index);
                }
                that.enable();
                that._triggerCascade();
                that._triggerChange();
                that._userTriggered = false;
            },
            _cascadeSelect: function (parent, valueBeforeCascade) {
                var that = this;
                var dataItem = parent.dataItem();
                var filterValue = dataItem ? parent._value(dataItem) : null;
                var valueField = that.options.cascadeFromField || parent.options.dataValueField;
                var expressions;
                that._valueBeforeCascade = valueBeforeCascade !== undefined ? valueBeforeCascade : that.value();
                if (filterValue || filterValue === 0) {
                    expressions = that.dataSource.filter() || {};
                    removeFiltersForField(expressions, valueField);
                    var handler = function () {
                        that.unbind('dataBound', handler);
                        that._cascadeChange(parent);
                    };
                    that.first('dataBound', handler);
                    that._cascading = true;
                    that._filterSource({
                        field: valueField,
                        operator: 'eq',
                        value: filterValue
                    });
                    that._cascading = false;
                } else {
                    that.enable(false);
                    that._clearSelection(parent);
                    that._triggerCascade();
                    that._triggerChange();
                    that._userTriggered = false;
                }
            }
        });
        var STATIC_LIST_NS = '.StaticList';
        var StaticList = kendo.ui.DataBoundWidget.extend({
            init: function (element, options) {
                Widget.fn.init.call(this, element, options);
                this.element.attr('role', 'listbox').on('click' + STATIC_LIST_NS, 'li', proxy(this._click, this)).on('mouseenter' + STATIC_LIST_NS, 'li', function () {
                    $(this).addClass(HOVER);
                }).on('mouseleave' + STATIC_LIST_NS, 'li', function () {
                    $(this).removeClass(HOVER);
                });
                this.content = this.element.wrap('<div class=\'k-list-scroller\' unselectable=\'on\'></div>').parent();
                this.header = this.content.before('<div class="k-group-header" style="display:none"></div>').prev();
                this.bound(false);
                this._optionID = kendo.guid();
                this._selectedIndices = [];
                this._view = [];
                this._dataItems = [];
                this._values = [];
                var value = this.options.value;
                if (value) {
                    this._values = $.isArray(value) ? value.slice(0) : [value];
                }
                this._getter();
                this._templates();
                this.setDataSource(this.options.dataSource);
                this._onScroll = proxy(function () {
                    var that = this;
                    clearTimeout(that._scrollId);
                    that._scrollId = setTimeout(function () {
                        that._renderHeader();
                    }, 50);
                }, this);
            },
            options: {
                name: 'StaticList',
                dataValueField: null,
                valuePrimitive: false,
                selectable: true,
                template: null,
                groupTemplate: null,
                fixedGroupTemplate: null
            },
            events: [
                'click',
                CHANGE,
                'activate',
                'deactivate',
                'dataBinding',
                'dataBound',
                'selectedItemChange'
            ],
            setDataSource: function (source) {
                var that = this;
                var dataSource = source || {};
                var value;
                dataSource = $.isArray(dataSource) ? { data: dataSource } : dataSource;
                dataSource = kendo.data.DataSource.create(dataSource);
                if (that.dataSource) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler);
                    value = that.value();
                    that.value([]);
                    that.bound(false);
                    that.value(value);
                } else {
                    that._refreshHandler = proxy(that.refresh, that);
                }
                that.setDSFilter(dataSource.filter());
                that.dataSource = dataSource.bind(CHANGE, that._refreshHandler);
                that._fixedHeader();
            },
            skip: function () {
                return this.dataSource.skip();
            },
            setOptions: function (options) {
                Widget.fn.setOptions.call(this, options);
                this._getter();
                this._templates();
                this._render();
            },
            destroy: function () {
                this.element.off(STATIC_LIST_NS);
                if (this._refreshHandler) {
                    this.dataSource.unbind(CHANGE, this._refreshHandler);
                }
                clearTimeout(this._scrollId);
                Widget.fn.destroy.call(this);
            },
            scrollToIndex: function (index) {
                var item = this.element[0].children[index];
                if (item) {
                    this.scroll(item);
                }
            },
            scroll: function (item) {
                if (!item) {
                    return;
                }
                if (item[0]) {
                    item = item[0];
                }
                var content = this.content[0], itemOffsetTop = item.offsetTop, itemOffsetHeight = item.offsetHeight, contentScrollTop = content.scrollTop, contentOffsetHeight = content.clientHeight, bottomDistance = itemOffsetTop + itemOffsetHeight;
                if (contentScrollTop > itemOffsetTop) {
                    contentScrollTop = itemOffsetTop;
                } else if (bottomDistance > contentScrollTop + contentOffsetHeight) {
                    contentScrollTop = bottomDistance - contentOffsetHeight;
                }
                content.scrollTop = contentScrollTop;
            },
            selectedDataItems: function (dataItems) {
                if (dataItems === undefined) {
                    return this._dataItems.slice();
                }
                this._dataItems = dataItems;
                this._values = this._getValues(dataItems);
            },
            _getValues: function (dataItems) {
                var getter = this._valueGetter;
                return $.map(dataItems, function (dataItem) {
                    return getter(dataItem);
                });
            },
            focusNext: function () {
                var current = this.focus();
                if (!current) {
                    current = 0;
                } else {
                    current = current.next();
                }
                this.focus(current);
            },
            focusPrev: function () {
                var current = this.focus();
                if (!current) {
                    current = this.element[0].children.length - 1;
                } else {
                    current = current.prev();
                }
                this.focus(current);
            },
            focusFirst: function () {
                this.focus(this.element[0].children[0]);
            },
            focusLast: function () {
                this.focus(this.element[0].children[this.element[0].children.length - 1]);
            },
            focus: function (candidate) {
                var that = this;
                var id = that._optionID;
                var hasCandidate;
                if (candidate === undefined) {
                    return that._current;
                }
                candidate = that._get(candidate);
                candidate = candidate[candidate.length - 1];
                candidate = $(this.element[0].children[candidate]);
                if (that._current) {
                    that._current.removeClass(FOCUSED).removeAttr('aria-selected').removeAttr(ID);
                    that.trigger('deactivate');
                }
                hasCandidate = !!candidate[0];
                if (hasCandidate) {
                    candidate.addClass(FOCUSED);
                    that.scroll(candidate);
                    candidate.attr('id', id);
                }
                that._current = hasCandidate ? candidate : null;
                that.trigger('activate');
            },
            focusIndex: function () {
                return this.focus() ? this.focus().index() : undefined;
            },
            skipUpdate: function (skipUpdate) {
                this._skipUpdate = skipUpdate;
            },
            select: function (indices) {
                var that = this;
                var selectable = that.options.selectable;
                var singleSelection = selectable !== 'multiple' && selectable !== false;
                var selectedIndices = that._selectedIndices;
                var added = [];
                var removed = [];
                var result;
                if (indices === undefined) {
                    return selectedIndices.slice();
                }
                indices = that._get(indices);
                if (indices.length === 1 && indices[0] === -1) {
                    indices = [];
                }
                var filtered = that.isFiltered();
                if (filtered && !singleSelection && that._deselectFiltered(indices)) {
                    return;
                }
                if (singleSelection && !filtered && $.inArray(indices[indices.length - 1], selectedIndices) !== -1) {
                    if (that._dataItems.length && that._view.length) {
                        that._dataItems = [that._view[selectedIndices[0]].item];
                    }
                    return;
                }
                result = that._deselect(indices);
                removed = result.removed;
                indices = result.indices;
                if (indices.length) {
                    if (singleSelection) {
                        indices = [indices[indices.length - 1]];
                    }
                    added = that._select(indices);
                }
                if (added.length || removed.length) {
                    that._valueComparer = null;
                    that.trigger(CHANGE, {
                        added: added,
                        removed: removed
                    });
                }
            },
            removeAt: function (position) {
                this._selectedIndices.splice(position, 1);
                this._values.splice(position, 1);
                this._valueComparer = null;
                return {
                    position: position,
                    dataItem: this._dataItems.splice(position, 1)[0]
                };
            },
            setValue: function (value) {
                value = $.isArray(value) || value instanceof ObservableArray ? value.slice(0) : [value];
                this._values = value;
                this._valueComparer = null;
            },
            value: function (value) {
                var that = this;
                var deferred = that._valueDeferred;
                var indices;
                if (value === undefined) {
                    return that._values.slice();
                }
                that.setValue(value);
                if (!deferred || deferred.state() === 'resolved') {
                    that._valueDeferred = deferred = $.Deferred();
                }
                if (that.bound()) {
                    indices = that._valueIndices(that._values);
                    if (that.options.selectable === 'multiple') {
                        that.select(-1);
                    }
                    that.select(indices);
                    deferred.resolve();
                }
                that._skipUpdate = false;
                return deferred;
            },
            items: function () {
                return this.element.children('.k-item');
            },
            _click: function (e) {
                if (!e.isDefaultPrevented()) {
                    if (!this.trigger('click', { item: $(e.currentTarget) })) {
                        this.select(e.currentTarget);
                    }
                }
            },
            _valueExpr: function (type, values) {
                var that = this;
                var idx = 0;
                var body;
                var comparer;
                var normalized = [];
                if (!that._valueComparer || that._valueType !== type) {
                    that._valueType = type;
                    for (; idx < values.length; idx++) {
                        normalized.push(unifyType(values[idx], type));
                    }
                    body = 'for (var idx = 0; idx < ' + normalized.length + '; idx++) {' + ' if (current === values[idx]) {' + '   return idx;' + ' }' + '} ' + 'return -1;';
                    comparer = new Function('current', 'values', body);
                    that._valueComparer = function (current) {
                        return comparer(current, normalized);
                    };
                }
                return that._valueComparer;
            },
            _dataItemPosition: function (dataItem, values) {
                var value = this._valueGetter(dataItem);
                var valueExpr = this._valueExpr(typeof value, values);
                return valueExpr(value);
            },
            _getter: function () {
                this._valueGetter = kendo.getter(this.options.dataValueField);
            },
            _deselect: function (indices) {
                var that = this;
                var children = that.element[0].children;
                var selectable = that.options.selectable;
                var selectedIndices = that._selectedIndices;
                var dataItems = that._dataItems;
                var values = that._values;
                var removed = [];
                var i = 0;
                var j;
                var index, selectedIndex;
                var removedIndices = 0;
                indices = indices.slice();
                if (selectable === true || !indices.length) {
                    for (; i < selectedIndices.length; i++) {
                        $(children[selectedIndices[i]]).removeClass('k-state-selected');
                        removed.push({
                            position: i,
                            dataItem: dataItems[i]
                        });
                    }
                    that._values = [];
                    that._dataItems = [];
                    that._selectedIndices = [];
                } else if (selectable === 'multiple') {
                    for (; i < indices.length; i++) {
                        index = indices[i];
                        if (!$(children[index]).hasClass('k-state-selected')) {
                            continue;
                        }
                        for (j = 0; j < selectedIndices.length; j++) {
                            selectedIndex = selectedIndices[j];
                            if (selectedIndex === index) {
                                $(children[selectedIndex]).removeClass('k-state-selected');
                                removed.push({
                                    position: j + removedIndices,
                                    dataItem: dataItems.splice(j, 1)[0]
                                });
                                selectedIndices.splice(j, 1);
                                indices.splice(i, 1);
                                values.splice(j, 1);
                                removedIndices += 1;
                                i -= 1;
                                j -= 1;
                                break;
                            }
                        }
                    }
                }
                return {
                    indices: indices,
                    removed: removed
                };
            },
            _deselectFiltered: function (indices) {
                var children = this.element[0].children;
                var dataItem, index, position;
                var removed = [];
                var idx = 0;
                for (; idx < indices.length; idx++) {
                    index = indices[idx];
                    dataItem = this._view[index].item;
                    position = this._dataItemPosition(dataItem, this._values);
                    if (position > -1) {
                        removed.push(this.removeAt(position));
                        $(children[index]).removeClass('k-state-selected');
                    }
                }
                if (removed.length) {
                    this.trigger(CHANGE, {
                        added: [],
                        removed: removed
                    });
                    return true;
                }
                return false;
            },
            _select: function (indices) {
                var that = this;
                var children = that.element[0].children;
                var data = that._view;
                var dataItem, index;
                var added = [];
                var idx = 0;
                if (indices[indices.length - 1] !== -1) {
                    that.focus(indices);
                }
                for (; idx < indices.length; idx++) {
                    index = indices[idx];
                    dataItem = data[index];
                    if (index === -1 || !dataItem) {
                        continue;
                    }
                    dataItem = dataItem.item;
                    that._selectedIndices.push(index);
                    that._dataItems.push(dataItem);
                    that._values.push(that._valueGetter(dataItem));
                    $(children[index]).addClass('k-state-selected').attr('aria-selected', true);
                    added.push({ dataItem: dataItem });
                }
                return added;
            },
            _get: function (candidate) {
                if (typeof candidate === 'number') {
                    candidate = [candidate];
                } else if (!isArray(candidate)) {
                    candidate = $(candidate).data('offset-index');
                    if (candidate === undefined) {
                        candidate = -1;
                    }
                    candidate = [candidate];
                }
                return candidate;
            },
            _template: function () {
                var that = this;
                var options = that.options;
                var template = options.template;
                if (!template) {
                    template = kendo.template('<li tabindex="-1" role="option" unselectable="on" class="k-item">${' + kendo.expr(options.dataTextField, 'data') + '}</li>', { useWithBlock: false });
                } else {
                    template = kendo.template(template);
                    template = function (data) {
                        return '<li tabindex="-1" role="option" unselectable="on" class="k-item">' + template(data) + '</li>';
                    };
                }
                return template;
            },
            _templates: function () {
                var template;
                var templates = {
                    template: this.options.template,
                    groupTemplate: this.options.groupTemplate,
                    fixedGroupTemplate: this.options.fixedGroupTemplate
                };
                for (var key in templates) {
                    template = templates[key];
                    if (template && typeof template !== 'function') {
                        templates[key] = kendo.template(template);
                    }
                }
                this.templates = templates;
            },
            _normalizeIndices: function (indices) {
                var newIndices = [];
                var idx = 0;
                for (; idx < indices.length; idx++) {
                    if (indices[idx] !== undefined) {
                        newIndices.push(indices[idx]);
                    }
                }
                return newIndices;
            },
            _valueIndices: function (values, indices) {
                var data = this._view;
                var idx = 0;
                var index;
                indices = indices ? indices.slice() : [];
                if (!values.length) {
                    return [];
                }
                for (; idx < data.length; idx++) {
                    index = this._dataItemPosition(data[idx].item, values);
                    if (index !== -1) {
                        indices[index] = idx;
                    }
                }
                return this._normalizeIndices(indices);
            },
            _firstVisibleItem: function () {
                var element = this.element[0];
                var content = this.content[0];
                var scrollTop = content.scrollTop;
                var itemHeight = $(element.children[0]).height();
                var itemIndex = Math.floor(scrollTop / itemHeight) || 0;
                var item = element.children[itemIndex] || element.lastChild;
                var forward = item.offsetTop < scrollTop;
                while (item) {
                    if (forward) {
                        if (item.offsetTop + itemHeight > scrollTop || !item.nextSibling) {
                            break;
                        }
                        item = item.nextSibling;
                    } else {
                        if (item.offsetTop <= scrollTop || !item.previousSibling) {
                            break;
                        }
                        item = item.previousSibling;
                    }
                }
                return this._view[$(item).data('offset-index')];
            },
            _fixedHeader: function () {
                if (this.isGrouped() && this.templates.fixedGroupTemplate) {
                    this.header.show();
                    this.content.scroll(this._onScroll);
                } else {
                    this.header.hide();
                    this.content.off('scroll', this._onScroll);
                }
            },
            _renderHeader: function () {
                var template = this.templates.fixedGroupTemplate;
                if (!template) {
                    return;
                }
                var visibleItem = this._firstVisibleItem();
                if (visibleItem) {
                    this.header.html(template(visibleItem.group));
                }
            },
            _renderItem: function (context) {
                var item = '<li tabindex="-1" role="option" unselectable="on" class="k-item';
                var dataItem = context.item;
                var notFirstItem = context.index !== 0;
                var selected = context.selected;
                if (notFirstItem && context.newGroup) {
                    item += ' k-first';
                }
                if (selected) {
                    item += ' k-state-selected';
                }
                item += '"' + (selected ? ' aria-selected="true"' : '') + ' data-offset-index="' + context.index + '">';
                item += this.templates.template(dataItem);
                if (notFirstItem && context.newGroup) {
                    item += '<div class="k-group">' + this.templates.groupTemplate(context.group) + '</div>';
                }
                return item + '</li>';
            },
            _render: function () {
                var html = '';
                var i = 0;
                var idx = 0;
                var context;
                var dataContext = [];
                var view = this.dataSource.view();
                var values = this.value();
                var group, newGroup, j;
                var isGrouped = this.isGrouped();
                if (isGrouped) {
                    for (i = 0; i < view.length; i++) {
                        group = view[i];
                        newGroup = true;
                        for (j = 0; j < group.items.length; j++) {
                            context = {
                                selected: this._selected(group.items[j], values),
                                item: group.items[j],
                                group: group.value,
                                newGroup: newGroup,
                                index: idx
                            };
                            dataContext[idx] = context;
                            idx += 1;
                            html += this._renderItem(context);
                            newGroup = false;
                        }
                    }
                } else {
                    for (i = 0; i < view.length; i++) {
                        context = {
                            selected: this._selected(view[i], values),
                            item: view[i],
                            index: i
                        };
                        dataContext[i] = context;
                        html += this._renderItem(context);
                    }
                }
                this._view = dataContext;
                this.element[0].innerHTML = html;
                if (isGrouped && dataContext.length) {
                    this._renderHeader();
                }
            },
            _selected: function (dataItem, values) {
                var select = !this.isFiltered() || this.options.selectable === 'multiple';
                return select && this._dataItemPosition(dataItem, values) !== -1;
            },
            setDSFilter: function (filter) {
                this._lastDSFilter = extend({}, filter);
            },
            isFiltered: function () {
                if (!this._lastDSFilter) {
                    this.setDSFilter(this.dataSource.filter());
                }
                return !kendo.data.Query.compareFilters(this.dataSource.filter(), this._lastDSFilter);
            },
            refresh: function (e) {
                var that = this;
                var action = e && e.action;
                var skipUpdateOnBind = that.options.skipUpdateOnBind;
                var isItemChange = action === 'itemchange';
                var result;
                that.trigger('dataBinding');
                that._fixedHeader();
                that._render();
                that.bound(true);
                if (isItemChange || action === 'remove') {
                    result = mapChangedItems(that._dataItems, e.items);
                    if (result.changed.length) {
                        if (isItemChange) {
                            that.trigger('selectedItemChange', { items: result.changed });
                        } else {
                            that.value(that._getValues(result.unchanged));
                        }
                    }
                } else if (that.isFiltered() || that._skipUpdate) {
                    that.focus(0);
                    if (that._skipUpdate) {
                        that._skipUpdate = false;
                        that._selectedIndices = that._valueIndices(that._values, that._selectedIndices);
                    }
                } else if (!skipUpdateOnBind && (!action || action === 'add')) {
                    that.value(that._values);
                }
                if (that._valueDeferred) {
                    that._valueDeferred.resolve();
                }
                that.trigger('dataBound');
            },
            bound: function (bound) {
                if (bound === undefined) {
                    return this._bound;
                }
                this._bound = bound;
            },
            isGrouped: function () {
                return (this.dataSource.group() || []).length;
            }
        });
        ui.plugin(StaticList);
        function mapChangedItems(selected, itemsToMatch) {
            var itemsLength = itemsToMatch.length;
            var selectedLength = selected.length;
            var dataItem;
            var found;
            var i, j;
            var changed = [];
            var unchanged = [];
            if (selectedLength) {
                for (i = 0; i < selectedLength; i++) {
                    dataItem = selected[i];
                    found = false;
                    for (j = 0; j < itemsLength; j++) {
                        if (dataItem === itemsToMatch[j]) {
                            found = true;
                            changed.push({
                                index: i,
                                item: dataItem
                            });
                            break;
                        }
                    }
                    if (!found) {
                        unchanged.push(dataItem);
                    }
                }
            }
            return {
                changed: changed,
                unchanged: unchanged
            };
        }
        function removeFiltersForField(expression, field) {
            var filters;
            var found = false;
            if (expression.filters) {
                filters = $.grep(expression.filters, function (filter) {
                    found = removeFiltersForField(filter, field);
                    if (filter.filters) {
                        return filter.filters.length;
                    } else {
                        return filter.field != field;
                    }
                });
                if (!found && expression.filters.length !== filters.length) {
                    found = true;
                }
                expression.filters = filters;
            }
            return found;
        }
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));

/** 
 * Copyright 2016 Telerik AD                                                                                                                                                                            
 *                                                                                                                                                                                                      
 * Licensed under the Apache License, Version 2.0 (the "License");                                                                                                                                      
 * you may not use this file except in compliance with the License.                                                                                                                                     
 * You may obtain a copy of the License at                                                                                                                                                              
 *                                                                                                                                                                                                      
 *     http://www.apache.org/licenses/LICENSE-2.0                                                                                                                                                       
 *                                                                                                                                                                                                      
 * Unless required by applicable law or agreed to in writing, software                                                                                                                                  
 * distributed under the License is distributed on an "AS IS" BASIS,                                                                                                                                    
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.                                                                                                                             
 * See the License for the specific language governing permissions and                                                                                                                                  
 * limitations under the License.                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.multiselect', [
        'kendo.list',
        'kendo.mobile.scroller'
    ], f);
}(function () {
    var __meta__ = {
        id: 'multiselect',
        name: 'MultiSelect',
        category: 'web',
        description: 'The MultiSelect widget allows the selection from pre-defined values.',
        depends: ['list'],
        features: [
            {
                id: 'mobile-scroller',
                name: 'Mobile scroller',
                description: 'Support for kinetic scrolling in mobile device',
                depends: ['mobile.scroller']
            },
            {
                id: 'virtualization',
                name: 'VirtualList',
                description: 'Support for virtualization',
                depends: ['virtuallist']
            }
        ]
    };
    (function ($, undefined) {
        var kendo = window.kendo, ui = kendo.ui, List = ui.List, keys = kendo.keys, activeElement = kendo._activeElement, ObservableArray = kendo.data.ObservableArray, proxy = $.proxy, ID = 'id', LI = 'li', ACCEPT = 'accept', FILTER = 'filter', REBIND = 'rebind', OPEN = 'open', CLOSE = 'close', CHANGE = 'change', PROGRESS = 'progress', SELECT = 'select', ARIA_DISABLED = 'aria-disabled', ARIA_READONLY = 'aria-readonly', FOCUSEDCLASS = 'k-state-focused', HIDDENCLASS = 'k-loading-hidden', HOVERCLASS = 'k-state-hover', STATEDISABLED = 'k-state-disabled', DISABLED = 'disabled', READONLY = 'readonly', ns = '.kendoMultiSelect', CLICK = 'click' + ns, KEYDOWN = 'keydown' + ns, MOUSEENTER = 'mouseenter' + ns, MOUSELEAVE = 'mouseleave' + ns, HOVEREVENTS = MOUSEENTER + ' ' + MOUSELEAVE, quotRegExp = /"/g, isArray = $.isArray, styles = [
            'font-family',
            'font-size',
            'font-stretch',
            'font-style',
            'font-weight',
            'letter-spacing',
            'text-transform',
            'line-height'
        ];
        var MultiSelect = List.extend({
            init: function (element, options) {
                var that = this, id, disabled;
                that.ns = ns;
                List.fn.init.call(that, element, options);
                that._optionsMap = {};
                that._customOptions = {};
                that._wrapper();
                that._tagList();
                that._input();
                that._textContainer();
                that._loader();
                that._tabindex(that.input);
                element = that.element.attr('multiple', 'multiple').hide();
                options = that.options;
                if (!options.placeholder) {
                    options.placeholder = element.data('placeholder');
                }
                id = element.attr(ID);
                if (id) {
                    that._tagID = id + '_tag_active';
                    id = id + '_taglist';
                    that.tagList.attr(ID, id);
                }
                that._aria(id);
                that._dataSource();
                that._ignoreCase();
                that._popup();
                that._tagTemplate();
                that._initList();
                that._reset();
                that._enable();
                that._placeholder();
                if (options.autoBind) {
                    that.dataSource.fetch();
                } else if (options.value) {
                    that._preselect(options.value);
                }
                disabled = $(that.element).parents('fieldset').is(':disabled');
                if (disabled) {
                    that.enable(false);
                }
                kendo.notify(that);
            },
            options: {
                name: 'MultiSelect',
                tagMode: 'multiple',
                enabled: true,
                autoBind: true,
                autoClose: true,
                highlightFirst: true,
                dataTextField: '',
                dataValueField: '',
                filter: 'startswith',
                ignoreCase: true,
                minLength: 0,
                delay: 100,
                value: null,
                maxSelectedItems: null,
                placeholder: '',
                height: 200,
                animation: {},
                virtual: false,
                itemTemplate: '',
                tagTemplate: '',
                groupTemplate: '#:data#',
                fixedGroupTemplate: '#:data#'
            },
            events: [
                OPEN,
                CLOSE,
                CHANGE,
                SELECT,
                'filtering',
                'dataBinding',
                'dataBound'
            ],
            setDataSource: function (dataSource) {
                this.options.dataSource = dataSource;
                this._state = '';
                this._dataSource();
                this.listView.setDataSource(this.dataSource);
                if (this.options.autoBind) {
                    this.dataSource.fetch();
                }
            },
            setOptions: function (options) {
                var listOptions = this._listOptions(options);
                List.fn.setOptions.call(this, options);
                this.listView.setOptions(listOptions);
                this._accessors();
                this._aria(this.tagList.attr(ID));
                this._tagTemplate();
            },
            currentTag: function (candidate) {
                var that = this;
                if (candidate !== undefined) {
                    if (that._currentTag) {
                        that._currentTag.removeClass(FOCUSEDCLASS).removeAttr(ID);
                        that.input.removeAttr('aria-activedescendant');
                    }
                    if (candidate) {
                        candidate.addClass(FOCUSEDCLASS).attr(ID, that._tagID);
                        that.input.attr('aria-activedescendant', that._tagID);
                    }
                    that._currentTag = candidate;
                } else {
                    return that._currentTag;
                }
            },
            dataItems: function () {
                return this.listView.selectedDataItems();
            },
            destroy: function () {
                var that = this, ns = that.ns;
                clearTimeout(that._busy);
                clearTimeout(that._typingTimeout);
                that.wrapper.off(ns);
                that.tagList.off(ns);
                that.input.off(ns);
                List.fn.destroy.call(that);
            },
            _activateItem: function () {
                List.fn._activateItem.call(this);
                this.currentTag(null);
            },
            _listOptions: function (options) {
                var that = this;
                var listOptions = List.fn._listOptions.call(that, $.extend(options, {
                    selectedItemChange: proxy(that._selectedItemChange, that),
                    selectable: 'multiple'
                }));
                var itemTemplate = this.options.itemTemplate || this.options.template;
                var template = listOptions.itemTemplate || itemTemplate || listOptions.template;
                if (!template) {
                    template = '#:' + kendo.expr(listOptions.dataTextField, 'data') + '#';
                }
                listOptions.template = template;
                return listOptions;
            },
            _setListValue: function () {
                List.fn._setListValue.call(this, this._initialValues.slice(0));
            },
            _listChange: function (e) {
                if (this._state === REBIND) {
                    this._state = '';
                    e.added = [];
                }
                this._selectValue(e.added, e.removed);
            },
            _selectedItemChange: function (e) {
                var items = e.items;
                var context;
                var idx;
                for (idx = 0; idx < items.length; idx++) {
                    context = items[idx];
                    this.tagList.children().eq(context.index).children('span:first').html(this.tagTextTemplate(context.item));
                }
            },
            _wrapperMousedown: function (e) {
                var that = this;
                var notInput = e.target.nodeName.toLowerCase() !== 'input';
                var target = $(e.target);
                var closeButton = target.hasClass('k-select') || target.hasClass('k-icon');
                if (closeButton) {
                    closeButton = !target.closest('.k-select').children('.k-i-arrow-s').length;
                }
                if (notInput && !(closeButton && kendo.support.mobileOS)) {
                    e.preventDefault();
                }
                if (!closeButton) {
                    if (that.input[0] !== activeElement() && notInput) {
                        that.input.focus();
                    }
                    if (that.options.minLength === 0) {
                        that.open();
                    }
                }
            },
            _inputFocus: function () {
                this._placeholder(false);
                this.wrapper.addClass(FOCUSEDCLASS);
            },
            _inputFocusout: function () {
                var that = this;
                clearTimeout(that._typingTimeout);
                that.wrapper.removeClass(FOCUSEDCLASS);
                that._placeholder(!that.listView.selectedDataItems()[0], true);
                that.close();
                if (that._state === FILTER) {
                    that._state = ACCEPT;
                    that.listView.skipUpdate(true);
                }
                that.element.blur();
            },
            _removeTag: function (tag) {
                var that = this;
                var state = that._state;
                var position = tag.index();
                var listView = that.listView;
                var value = listView.value()[position];
                var customIndex = that._customOptions[value];
                var option;
                if (customIndex === undefined && (state === ACCEPT || state === FILTER)) {
                    customIndex = that._optionsMap[value];
                }
                if (customIndex !== undefined) {
                    option = that.element[0].children[customIndex];
                    option.removeAttribute('selected');
                    option.selected = false;
                    listView.removeAt(position);
                    tag.remove();
                } else {
                    listView.select(listView.select()[position]);
                }
                that.currentTag(null);
                that._change();
                that._close();
            },
            _tagListClick: function (e) {
                var target = $(e.currentTarget);
                if (!target.children('.k-i-arrow-s').length) {
                    this._removeTag(target.closest(LI));
                }
            },
            _editable: function (options) {
                var that = this, disable = options.disable, readonly = options.readonly, wrapper = that.wrapper.off(ns), tagList = that.tagList.off(ns), input = that.element.add(that.input.off(ns));
                if (!readonly && !disable) {
                    wrapper.removeClass(STATEDISABLED).on(HOVEREVENTS, that._toggleHover).on('mousedown' + ns + ' touchend' + ns, proxy(that._wrapperMousedown, that));
                    that.input.on(KEYDOWN, proxy(that._keydown, that)).on('paste' + ns, proxy(that._search, that)).on('focus' + ns, proxy(that._inputFocus, that)).on('focusout' + ns, proxy(that._inputFocusout, that));
                    input.removeAttr(DISABLED).removeAttr(READONLY).attr(ARIA_DISABLED, false).attr(ARIA_READONLY, false);
                    tagList.on(MOUSEENTER, LI, function () {
                        $(this).addClass(HOVERCLASS);
                    }).on(MOUSELEAVE, LI, function () {
                        $(this).removeClass(HOVERCLASS);
                    }).on(CLICK, 'li.k-button .k-select', proxy(that._tagListClick, that));
                } else {
                    if (disable) {
                        wrapper.addClass(STATEDISABLED);
                    } else {
                        wrapper.removeClass(STATEDISABLED);
                    }
                    input.attr(DISABLED, disable).attr(READONLY, readonly).attr(ARIA_DISABLED, disable).attr(ARIA_READONLY, readonly);
                }
            },
            _close: function () {
                var that = this;
                if (that.options.autoClose) {
                    that.close();
                } else {
                    that.popup.position();
                }
            },
            _filterSource: function (filter, force) {
                if (!force) {
                    force = this._retrieveData;
                }
                this._retrieveData = false;
                List.fn._filterSource.call(this, filter, force);
            },
            close: function () {
                this.popup.close();
            },
            open: function () {
                var that = this;
                if (that._request) {
                    that._retrieveData = false;
                }
                if (that._retrieveData || !that.listView.bound() || that._state === ACCEPT) {
                    that._open = true;
                    that._state = REBIND;
                    that.listView.skipUpdate(true);
                    that._filterSource();
                } else if (that._allowSelection()) {
                    that.popup.open();
                    that._focusItem();
                }
            },
            toggle: function (toggle) {
                toggle = toggle !== undefined ? toggle : !this.popup.visible();
                this[toggle ? OPEN : CLOSE]();
            },
            refresh: function () {
                this.listView.refresh();
            },
            _angularItems: function (cmd) {
                var that = this;
                that.angular(cmd, function () {
                    return {
                        elements: that.items(),
                        data: $.map(that.dataSource.flatView(), function (dataItem) {
                            return { dataItem: dataItem };
                        })
                    };
                });
            },
            _listBound: function () {
                var that = this;
                var data = that.dataSource.flatView();
                var skip = that.listView.skip();
                var length = data.length;
                that._angularItems('compile');
                that._render(data);
                that._resizePopup();
                if (that._open) {
                    that._open = false;
                    that.toggle(length);
                }
                that.popup.position();
                if (that.options.highlightFirst && (skip === undefined || skip === 0)) {
                    that.listView.focusFirst();
                }
                if (that._touchScroller) {
                    that._touchScroller.reset();
                }
                that._hideBusy();
                that._makeUnselectable();
                that.trigger('dataBound');
            },
            search: function (word) {
                var that = this;
                var options = that.options;
                var ignoreCase = options.ignoreCase;
                var field = options.dataTextField;
                var inputValue = that.input.val();
                var expression;
                var length;
                if (options.placeholder === inputValue) {
                    inputValue = '';
                }
                clearTimeout(that._typingTimeout);
                word = typeof word === 'string' ? word : inputValue;
                length = word.length;
                if (!length || length >= options.minLength) {
                    that._state = FILTER;
                    that._open = true;
                    expression = {
                        value: ignoreCase ? word.toLowerCase() : word,
                        field: field,
                        operator: options.filter,
                        ignoreCase: ignoreCase
                    };
                    that._filterSource(expression);
                }
            },
            value: function (value) {
                var that = this;
                var listView = that.listView;
                var oldValue = listView.value().slice();
                var maxSelectedItems = that.options.maxSelectedItems;
                var clearFilters = listView.bound() && listView.isFiltered();
                if (value === undefined) {
                    return oldValue;
                }
                value = that._normalizeValues(value);
                if (maxSelectedItems !== null && value.length > maxSelectedItems) {
                    value = value.slice(0, maxSelectedItems);
                }
                if (clearFilters) {
                    that._clearFilter();
                }
                listView.value(value);
                that._old = value;
                if (!clearFilters) {
                    that._fetchData();
                }
            },
            _preselect: function (data, value) {
                var that = this;
                if (!isArray(data) && !(data instanceof kendo.data.ObservableArray)) {
                    data = [data];
                }
                if ($.isPlainObject(data[0]) || data[0] instanceof kendo.data.ObservableObject || !that.options.dataValueField) {
                    that.dataSource.data(data);
                    that.value(value || that._initialValues);
                    that._retrieveData = true;
                }
            },
            _setOption: function (value, selected) {
                var option = this.element[0].children[this._optionsMap[value]];
                if (option) {
                    if (selected) {
                        option.setAttribute('selected', 'selected');
                    } else {
                        option.removeAttribute('selected');
                    }
                    option.selected = selected;
                }
            },
            _fetchData: function () {
                var that = this;
                var hasItems = !!that.dataSource.view().length;
                var isEmptyArray = that.listView.value().length === 0;
                if (isEmptyArray || that._request) {
                    return;
                }
                if (that._retrieveData || !that._fetch && !hasItems) {
                    that._fetch = true;
                    that._retrieveData = false;
                    that.dataSource.read().done(function () {
                        that._fetch = false;
                    });
                }
            },
            _isBound: function () {
                return this.listView.bound() && !this._retrieveData;
            },
            _dataSource: function () {
                var that = this, element = that.element, options = that.options, dataSource = options.dataSource || {};
                dataSource = isArray(dataSource) ? { data: dataSource } : dataSource;
                dataSource.select = element;
                dataSource.fields = [
                    { field: options.dataTextField },
                    { field: options.dataValueField }
                ];
                if (that.dataSource && that._refreshHandler) {
                    that._unbindDataSource();
                } else {
                    that._progressHandler = proxy(that._showBusy, that);
                    that._errorHandler = proxy(that._hideBusy, that);
                }
                that.dataSource = kendo.data.DataSource.create(dataSource).bind(PROGRESS, that._progressHandler).bind('error', that._errorHandler);
            },
            _reset: function () {
                var that = this, element = that.element, formId = element.attr('form'), form = formId ? $('#' + formId) : element.closest('form');
                if (form[0]) {
                    that._resetHandler = function () {
                        setTimeout(function () {
                            that.value(that._initialValues);
                            that._placeholder();
                        });
                    };
                    that._form = form.on('reset', that._resetHandler);
                }
            },
            _initValue: function () {
                var value = this.options.value || this.element.val();
                this._old = this._initialValues = this._normalizeValues(value);
            },
            _normalizeValues: function (value) {
                var that = this;
                if (value === null) {
                    value = [];
                } else if (value && $.isPlainObject(value)) {
                    value = [that._value(value)];
                } else if (value && $.isPlainObject(value[0])) {
                    value = $.map(value, function (dataItem) {
                        return that._value(dataItem);
                    });
                } else if (!isArray(value) && !(value instanceof ObservableArray)) {
                    value = [value];
                }
                return value;
            },
            _change: function () {
                var that = this, value = that.value();
                if (!compare(value, that._old)) {
                    that._old = value.slice();
                    that.trigger(CHANGE);
                    that.element.trigger(CHANGE);
                }
            },
            _click: function (e) {
                var item = e.item;
                e.preventDefault();
                if (this.trigger(SELECT, { item: item })) {
                    this._close();
                    return;
                }
                this._select(item);
                this._change();
                this._close();
            },
            _keydown: function (e) {
                var that = this;
                var key = e.keyCode;
                var tag = that._currentTag;
                var current = that.listView.focus();
                var hasValue = that.input.val();
                var isRtl = kendo.support.isRtl(that.wrapper);
                var visible = that.popup.visible();
                if (key === keys.DOWN) {
                    e.preventDefault();
                    if (!visible) {
                        that.open();
                        if (!current) {
                            this.listView.focusFirst();
                        }
                        return;
                    }
                    if (current) {
                        this.listView.focusNext();
                        if (!this.listView.focus()) {
                            this.listView.focusLast();
                        }
                    } else {
                        this.listView.focusFirst();
                    }
                } else if (key === keys.UP) {
                    if (visible) {
                        if (current) {
                            this.listView.focusPrev();
                        }
                        if (!this.listView.focus()) {
                            that.close();
                        }
                    }
                    e.preventDefault();
                } else if (key === keys.LEFT && !isRtl || key === keys.RIGHT && isRtl) {
                    if (!hasValue) {
                        tag = tag ? tag.prev() : $(that.tagList[0].lastChild);
                        if (tag[0]) {
                            that.currentTag(tag);
                        }
                    }
                } else if (key === keys.RIGHT && !isRtl || key === keys.LEFT && isRtl) {
                    if (!hasValue && tag) {
                        tag = tag.next();
                        that.currentTag(tag[0] ? tag : null);
                    }
                } else if (key === keys.ENTER && visible) {
                    if (current) {
                        if (that.trigger(SELECT, { item: current })) {
                            that._close();
                            return;
                        }
                        that._select(current);
                    }
                    that._change();
                    that._close();
                    e.preventDefault();
                } else if (key === keys.ESC) {
                    if (visible) {
                        e.preventDefault();
                    } else {
                        that.currentTag(null);
                    }
                    that.close();
                } else if (key === keys.HOME) {
                    if (visible) {
                        this.listView.focusFirst();
                    } else if (!hasValue) {
                        tag = that.tagList[0].firstChild;
                        if (tag) {
                            that.currentTag($(tag));
                        }
                    }
                } else if (key === keys.END) {
                    if (visible) {
                        this.listView.focusLast();
                    } else if (!hasValue) {
                        tag = that.tagList[0].lastChild;
                        if (tag) {
                            that.currentTag($(tag));
                        }
                    }
                } else if ((key === keys.DELETE || key === keys.BACKSPACE) && !hasValue) {
                    if (key === keys.BACKSPACE && !tag) {
                        tag = $(that.tagList[0].lastChild);
                    }
                    if (tag && tag[0]) {
                        that._removeTag(tag);
                    }
                } else {
                    clearTimeout(that._typingTimeout);
                    setTimeout(function () {
                        that._scale();
                    });
                    that._search();
                }
            },
            _hideBusy: function () {
                var that = this;
                clearTimeout(that._busy);
                that.input.attr('aria-busy', false);
                that._loading.addClass(HIDDENCLASS);
                that._request = false;
                that._busy = null;
            },
            _showBusyHandler: function () {
                this.input.attr('aria-busy', true);
                this._loading.removeClass(HIDDENCLASS);
            },
            _showBusy: function () {
                var that = this;
                that._request = true;
                if (that._busy) {
                    return;
                }
                that._busy = setTimeout(proxy(that._showBusyHandler, that), 100);
            },
            _placeholder: function (show, skipCaret) {
                var that = this, input = that.input, active = activeElement();
                if (show === undefined) {
                    show = false;
                    if (input[0] !== active) {
                        show = !that.listView.selectedDataItems()[0];
                    }
                }
                that._prev = '';
                input.toggleClass('k-readonly', show).val(show ? that.options.placeholder : '');
                if (input[0] === active && !skipCaret) {
                    kendo.caret(input[0], 0, 0);
                }
                that._scale();
            },
            _scale: function () {
                var that = this, wrapper = that.wrapper, wrapperWidth = wrapper.width(), span = that._span.text(that.input.val()), textWidth;
                if (!wrapper.is(':visible')) {
                    span.appendTo(document.documentElement);
                    wrapperWidth = textWidth = span.width() + 25;
                    span.appendTo(wrapper);
                } else {
                    textWidth = span.width() + 25;
                }
                that.input.width(textWidth > wrapperWidth ? wrapperWidth : textWidth);
            },
            _option: function (dataValue, dataText, selected) {
                var option = '<option';
                if (dataValue !== undefined) {
                    dataValue += '';
                    if (dataValue.indexOf('"') !== -1) {
                        dataValue = dataValue.replace(quotRegExp, '&quot;');
                    }
                    option += ' value="' + dataValue + '"';
                }
                if (selected) {
                    option += ' selected';
                }
                option += '>';
                if (dataText !== undefined) {
                    option += kendo.htmlEncode(dataText);
                }
                return option += '</option>';
            },
            _render: function (data) {
                var selectedItems = this.listView.selectedDataItems();
                var values = this.listView.value();
                var length = data.length;
                var selectedIndex;
                var options = '';
                var dataItem;
                var value;
                var idx;
                if (values.length !== selectedItems.length) {
                    selectedItems = this._buildSelectedItems(values);
                }
                var custom = {};
                var optionsMap = {};
                for (idx = 0; idx < length; idx++) {
                    dataItem = data[idx];
                    value = this._value(dataItem);
                    selectedIndex = this._selectedItemIndex(value, selectedItems);
                    if (selectedIndex !== -1) {
                        selectedItems.splice(selectedIndex, 1);
                    }
                    optionsMap[value] = idx;
                    options += this._option(value, this._text(dataItem), selectedIndex !== -1);
                }
                if (selectedItems.length) {
                    for (idx = 0; idx < selectedItems.length; idx++) {
                        dataItem = selectedItems[idx];
                        value = this._value(dataItem);
                        custom[value] = length;
                        optionsMap[value] = length;
                        length += 1;
                        options += this._option(value, this._text(dataItem), true);
                    }
                }
                this._customOptions = custom;
                this._optionsMap = optionsMap;
                this.element.html(options);
            },
            _buildSelectedItems: function (values) {
                var valueField = this.options.dataValueField;
                var textField = this.options.dataTextField;
                var result = [];
                var item;
                for (var idx = 0; idx < values.length; idx++) {
                    item = {};
                    item[valueField] = values[idx];
                    item[textField] = values[idx];
                    result.push(item);
                }
                return result;
            },
            _selectedItemIndex: function (value, selectedItems) {
                var valueGetter = this._value;
                var idx = 0;
                for (; idx < selectedItems.length; idx++) {
                    if (value === valueGetter(selectedItems[idx])) {
                        return idx;
                    }
                }
                return -1;
            },
            _search: function () {
                var that = this;
                that._typingTimeout = setTimeout(function () {
                    var value = that.input.val();
                    if (that._prev !== value) {
                        that._prev = value;
                        that.search(value);
                    }
                }, that.options.delay);
            },
            _allowSelection: function () {
                var max = this.options.maxSelectedItems;
                return max === null || max > this.listView.value().length;
            },
            _angularTagItems: function (cmd) {
                var that = this;
                that.angular(cmd, function () {
                    return {
                        elements: that.tagList[0].children,
                        data: $.map(that.dataItems(), function (dataItem) {
                            return { dataItem: dataItem };
                        })
                    };
                });
            },
            _selectValue: function (added, removed) {
                var that = this;
                var values = that.value();
                var total = that.dataSource.total();
                var tagList = that.tagList;
                var getter = that._value;
                var removedItem;
                var addedItem;
                var idx;
                that._angularTagItems('cleanup');
                if (that.options.tagMode === 'multiple') {
                    for (idx = removed.length - 1; idx > -1; idx--) {
                        removedItem = removed[idx];
                        tagList[0].removeChild(tagList[0].children[removedItem.position]);
                        that._setOption(getter(removedItem.dataItem), false);
                    }
                    for (idx = 0; idx < added.length; idx++) {
                        addedItem = added[idx];
                        tagList.append(that.tagTemplate(addedItem.dataItem));
                        that._setOption(getter(addedItem.dataItem), true);
                    }
                } else {
                    if (!that._maxTotal || that._maxTotal < total) {
                        that._maxTotal = total;
                    }
                    tagList.html('');
                    if (values.length) {
                        tagList.append(that.tagTemplate({
                            values: values,
                            dataItems: that.dataItems(),
                            maxTotal: that._maxTotal,
                            currentTotal: total
                        }));
                    }
                    for (idx = removed.length - 1; idx > -1; idx--) {
                        that._setOption(getter(removed[idx].dataItem), false);
                    }
                    for (idx = 0; idx < added.length; idx++) {
                        that._setOption(getter(added[idx].dataItem), true);
                    }
                }
                that._angularTagItems('compile');
                that._placeholder();
            },
            _select: function (candidate) {
                var that = this;
                if (that._state === REBIND) {
                    that._state = '';
                }
                if (!that._allowSelection()) {
                    return;
                }
                this.listView.select(candidate);
                that._placeholder();
                if (that._state === FILTER) {
                    that._state = ACCEPT;
                    that.listView.skipUpdate(true);
                }
            },
            _input: function () {
                var that = this, accessKey = that.element[0].accessKey, input = that._innerWrapper.children('input.k-input');
                if (!input[0]) {
                    input = $('<input class="k-input" style="width: 25px" />').appendTo(that._innerWrapper);
                }
                that.element.removeAttr('accesskey');
                that._focused = that.input = input.attr({
                    'accesskey': accessKey,
                    'autocomplete': 'off',
                    'role': 'listbox',
                    'aria-expanded': false
                });
            },
            _tagList: function () {
                var that = this, tagList = that._innerWrapper.children('ul');
                if (!tagList[0]) {
                    tagList = $('<ul role="listbox" unselectable="on" class="k-reset"/>').appendTo(that._innerWrapper);
                }
                that.tagList = tagList;
            },
            _tagTemplate: function () {
                var that = this;
                var options = that.options;
                var tagTemplate = options.tagTemplate;
                var hasDataSource = options.dataSource;
                var isMultiple = options.tagMode === 'multiple';
                var defaultTemplate;
                if (that.element[0].length && !hasDataSource) {
                    options.dataTextField = options.dataTextField || 'text';
                    options.dataValueField = options.dataValueField || 'value';
                }
                defaultTemplate = isMultiple ? kendo.template('#:' + kendo.expr(options.dataTextField, 'data') + '#', { useWithBlock: false }) : kendo.template('#:values.length# item(s) selected');
                that.tagTextTemplate = tagTemplate = tagTemplate ? kendo.template(tagTemplate) : defaultTemplate;
                that.tagTemplate = function (data) {
                    return '<li class="k-button" unselectable="on"><span unselectable="on">' + tagTemplate(data) + '</span><span unselectable="on" class="k-select"><span unselectable="on" class="k-icon ' + (isMultiple ? 'k-i-close' : 'k-i-arrow-s') + '">' + (isMultiple ? 'delete' : 'open') + '</span></span></li>';
                };
            },
            _loader: function () {
                this._loading = $('<span class="k-icon k-loading ' + HIDDENCLASS + '"></span>').insertAfter(this.input);
            },
            _textContainer: function () {
                var computedStyles = kendo.getComputedStyles(this.input[0], styles);
                computedStyles.position = 'absolute';
                computedStyles.visibility = 'hidden';
                computedStyles.top = -3333;
                computedStyles.left = -3333;
                this._span = $('<span/>').css(computedStyles).appendTo(this.wrapper);
            },
            _wrapper: function () {
                var that = this, element = that.element, wrapper = element.parent('span.k-multiselect');
                if (!wrapper[0]) {
                    wrapper = element.wrap('<div class="k-widget k-multiselect k-header" unselectable="on" />').parent();
                    wrapper[0].style.cssText = element[0].style.cssText;
                    wrapper[0].title = element[0].title;
                    $('<div class="k-multiselect-wrap k-floatwrap" unselectable="on" />').insertBefore(element);
                }
                that.wrapper = wrapper.addClass(element[0].className).css('display', '');
                that._innerWrapper = $(wrapper[0].firstChild);
            }
        });
        function compare(a, b) {
            var length;
            if (a === null && b !== null || a !== null && b === null) {
                return false;
            }
            length = a.length;
            if (length !== b.length) {
                return false;
            }
            while (length--) {
                if (a[length] !== b[length]) {
                    return false;
                }
            }
            return true;
        }
        ui.plugin(MultiSelect);
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
    }));

// hack to set kendo var
var kendo = eval("window.kendo");



 

/** 
 * Kendo UI v2016.2.714 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2016 Telerik AD. All rights reserved.                                                                                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
!function (e, define) { define("kendo.dropdownlist.min", ["kendo.list.min", "kendo.mobile.scroller.min"], e) }(function () { return function (e, t) { function i(e, t, i) { for (var n, s = 0, o = t.length - 1; o > s; ++s)n = t[s], n in e || (e[n] = {}), e = e[n]; e[t[o]] = i } function n(e, t) { return e >= t && (e -= t), e } function s(e, t) { for (var i = 0; e.length > i; i++)if (e.charAt(i) !== t) return !1; return !0 } var o = window.kendo, a = o.ui, l = a.List, r = a.Select, p = o.support, u = o._activeElement, c = o.data.ObservableObject, d = o.keys, f = ".kendoDropDownList", _ = "disabled", h = "readonly", m = "change", b = "k-state-focused", v = "k-state-default", w = "k-state-disabled", g = "aria-disabled", x = "mouseenter" + f + " mouseleave" + f, L = "tabindex", I = "filter", k = "accept", y = "The `optionLabel` option is not valid due to missing fields. Define a custom optionLabel as shown here http://docs.telerik.com/kendo-ui/api/javascript/ui/dropdownlist#configuration-optionLabel", T = e.proxy, C = r.extend({ init: function (i, n) { var s, a, l, p = this, u = n && n.index; p.ns = f, n = e.isArray(n) ? { dataSource: n } : n, r.fn.init.call(p, i, n), n = p.options, i = p.element.on("focus" + f, T(p._focusHandler, p)), p._focusInputHandler = e.proxy(p._focusInput, p), p.optionLabel = e(), p._optionLabel(), p._inputTemplate(), p._reset(), p._prev = "", p._word = "", p._wrapper(), p._tabindex(), p.wrapper.data(L, p.wrapper.attr(L)), p._span(), p._popup(), p._mobile(), p._dataSource(), p._ignoreCase(), p._filterHeader(), p._aria(), p._enable(), p._oldIndex = p.selectedIndex = -1, u !== t && (n.index = u), p._initialIndex = n.index, p._initList(), p._cascade(), n.autoBind ? p.dataSource.fetch() : -1 === p.selectedIndex && (a = n.text || "", a || (s = n.optionLabel, s && 0 === n.index ? a = s : p._isSelect && (a = i.children(":selected").text())), p._textAccessor(a)), l = e(p.element).parents("fieldset").is(":disabled"), l && p.enable(!1), p.listView.bind("click", function (e) { e.preventDefault() }), o.notify(p) }, options: { name: "DropDownList", enabled: !0, autoBind: !0, index: 0, text: null, value: null, delay: 500, height: 200, dataTextField: "", dataValueField: "", optionLabel: "", cascadeFrom: "", cascadeFromField: "", ignoreCase: !0, animation: {}, filter: "none", minLength: 1, virtual: !1, template: null, valueTemplate: null, optionLabelTemplate: null, groupTemplate: "#:data#", fixedGroupTemplate: "#:data#" }, events: ["open", "close", m, "select", "filtering", "dataBinding", "dataBound", "cascade", "set"], setOptions: function (e) { r.fn.setOptions.call(this, e), this.listView.setOptions(this._listOptions(e)), this._optionLabel(), this._inputTemplate(), this._accessors(), this._filterHeader(), this._enable(), this._aria(), !this.value() && this.hasOptionLabel() && this.select(0) }, destroy: function () { var e = this; r.fn.destroy.call(e), e.wrapper.off(f), e.element.off(f), e._inputWrapper.off(f), e._arrow.off(), e._arrow = null, e.optionLabel.off() }, open: function () { var e = this; e.popup.visible() || (e.listView.bound() && e._state !== k ? e._allowOpening() && (e.popup.one("activate", e._focusInputHandler), e.popup.open(), e._focusItem()) : (e._open = !0, e._state = "rebind", e.filterInput && (e.filterInput.val(""), e._prev = ""), e._filterSource())) }, _focusInput: function () { this._focusElement(this.filterInput) }, _allowOpening: function () { return this.hasOptionLabel() || this.filterInput || this.dataSource.view().length }, toggle: function (e) { this._toggle(e, !0) }, current: function (e) { var i; return e === t ? (i = this.listView.focus(), !i && 0 === this.selectedIndex && this.hasOptionLabel() ? this.optionLabel : i) : (this._focus(e), t) }, dataItem: function (i) { var n = this, s = null; if (null === i) return i; if (i === t) s = n.listView.selectedDataItems()[0]; else { if ("number" != typeof i) { if (n.options.virtual) return n.dataSource.getByUid(e(i).data("uid")); i = i.hasClass("k-list-optionlabel") ? -1 : e(n.items()).index(i) } else n.hasOptionLabel() && (i -= 1); s = n.dataSource.flatView()[i] } return s || (s = n._optionLabelDataItem()), s }, refresh: function () { this.listView.refresh() }, text: function (e) { var i, n, s = this, o = s.options.ignoreCase; return e = null === e ? "" : e, e === t ? s._textAccessor() : ("string" == typeof e && (n = o ? e.toLowerCase() : e, s._select(function (e) { return e = s._text(e), o && (e = (e + "").toLowerCase()), e === n }), i = s.dataItem(), i && (e = i)), s._textAccessor(e), t) }, value: function (e) { var i = this, n = i.listView, s = i.dataSource; return e === t ? (e = i._accessor() || i.listView.value()[0], e === t || null === e ? "" : e) : ((e || !i.hasOptionLabel()) && (i._initialIndex = null), this.trigger("set", { value: e }), i._request && i.options.cascadeFrom && i.listView.bound() ? (i._valueSetter && s.unbind(m, i._valueSetter), i._valueSetter = T(function () { i.value(e) }, i), s.one(m, i._valueSetter), t) : (i._isFilterEnabled() && n.bound() && n.isFiltered() ? i._clearFilter() : i._fetchData(), n.value(e).done(function () { -1 === i.selectedIndex && i.text() && (i.text(""), i._accessor("", -1)), i._old = i._accessor(), i._oldIndex = i.selectedIndex }), t)) }, hasOptionLabel: function () { return this.optionLabel && !!this.optionLabel[0] }, _optionLabel: function () { var i = this, n = i.options, s = n.optionLabel, a = n.optionLabelTemplate; return s ? (a || (a = "#:", a += "string" == typeof s ? "data" : o.expr(n.dataTextField, "data"), a += "#"), "function" != typeof a && (a = o.template(a)), i.optionLabelTemplate = a, i.hasOptionLabel() || (i.optionLabel = e('<div class="k-list-optionlabel"></div>').prependTo(i.list)), i.optionLabel.html(a(s)).off().click(T(i._click, i)).on(x, i._toggleHover), i.angular("compile", function () { return { elements: i.optionLabel, data: [{ dataItem: i._optionLabelDataItem() }] } }), t) : (i.optionLabel.off().remove(), i.optionLabel = e(), t) }, _optionLabelText: function () { var e = this.options.optionLabel; return "string" == typeof e ? e : this._text(e) }, _optionLabelDataItem: function () { var t = this, i = t.options.optionLabel; return t.hasOptionLabel() ? e.isPlainObject(i) ? new c(i) : t._assignInstance(t._optionLabelText(), "") : null }, _buildOptions: function (e) { var i, n, s, o = this; o._isSelect && (i = o.listView.value()[0], n = o._optionLabelDataItem(), s = n && o._value(n), (i === t || null === i) && (i = ""), n && ((s === t || null === s) && (s = ""), n = '<option value="' + s + '">' + o._text(n) + "</option>"), o._options(e, n, i), i !== l.unifyType(o._accessor(), typeof i) && (o._customOption = null, o._custom(i))) }, _listBound: function () { var e, t = this, i = t._initialIndex, n = t._state === I, s = t.dataSource.flatView(); t._presetValue = !1, t._resizePopup(!0), t.popup.position(), t._buildOptions(s), t._makeUnselectable(), n || (t._open && t.toggle(t._allowOpening()), t._open = !1, t._fetch || (s.length ? (!t.listView.value().length && i > -1 && null !== i && t.select(i), t._initialIndex = null, e = t.listView.selectedDataItems()[0], e && t.text() !== t._text(e) && t._selectValue(e)) : t._textAccessor() !== t._optionLabelText() && (t.listView.value(""), t._selectValue(null), t._oldIndex = t.selectedIndex))), t._hideBusy(), t.trigger("dataBound") }, _listChange: function () { this._selectValue(this.listView.selectedDataItems()[0]), (this._presetValue || this._old && -1 === this._oldIndex) && (this._oldIndex = this.selectedIndex) }, _filterPaste: function () { this._search() }, _focusHandler: function () { this.wrapper.focus() }, _focusinHandler: function () { this._inputWrapper.addClass(b), this._prevent = !1 }, _focusoutHandler: function () { var e = this, t = e._state === I, i = window.self !== window.top, n = e._focus(); e._prevent || (clearTimeout(e._typingTimeout), t && n && !e.trigger("select", { item: n }) && e._select(n, !e.dataSource.view().length), p.mobileOS.ios && i ? e._change() : e._blur(), e._inputWrapper.removeClass(b), e._prevent = !0, e._open = !1, e.element.blur()) }, _wrapperMousedown: function () { this._prevent = !!this.filterInput }, _wrapperClick: function (e) { e.preventDefault(), this.popup.unbind("activate", this._focusInputHandler), this._focused = this.wrapper, this._toggle() }, _editable: function (e) { var t = this, i = t.element, n = e.disable, s = e.readonly, o = t.wrapper.add(t.filterInput).off(f), a = t._inputWrapper.off(x); s || n ? n ? (o.removeAttr(L), a.addClass(w).removeClass(v)) : (a.addClass(v).removeClass(w), o.on("focusin" + f, T(t._focusinHandler, t)).on("focusout" + f, T(t._focusoutHandler, t))) : (i.removeAttr(_).removeAttr(h), a.addClass(v).removeClass(w).on(x, t._toggleHover), o.attr(L, o.data(L)).attr(g, !1).on("keydown" + f, T(t._keydown, t)).on("focusin" + f, T(t._focusinHandler, t)).on("focusout" + f, T(t._focusoutHandler, t)).on("mousedown" + f, T(t._wrapperMousedown, t)).on("paste" + f, T(t._filterPaste, t)), t.wrapper.on("click" + f, T(t._wrapperClick, t)), t.filterInput || o.on("keypress" + f, T(t._keypress, t))), i.attr(_, n).attr(h, s), o.attr(g, n) }, _keydown: function (e) { var i, n, s, o = this, a = e.keyCode, l = e.altKey, r = o.popup.visible(); if (o.filterInput && (i = o.filterInput[0] === u()), a === d.LEFT ? (a = d.UP, n = !0) : a === d.RIGHT && (a = d.DOWN, n = !0), !n || !i) { if (e.keyCode = a, (l && a === d.UP || a === d.ESC) && o._focusElement(o.wrapper), a === d.ENTER && o._typingTimeout && o.filterInput && r) return e.preventDefault(), t; if (n = o._move(e), !n) { if ((!r || !o.filterInput) && (s = o._focus(), a === d.HOME ? (n = !0, o._firstItem()) : a === d.END && (n = !0, o._lastItem()), n)) { if (o.trigger("select", { item: o._focus() })) return o._focus(s), t; o._select(o._focus(), !0), r || o._blur() } l || n || !o.filterInput || o._search() } } }, _matchText: function (e, i) { var n = this.options.ignoreCase; return e === t || null === e ? !1 : (e += "", n && (e = e.toLowerCase()), 0 === e.indexOf(i)) }, _shuffleData: function (e, t) { var i = this._optionLabelDataItem(); return i && (e = [i].concat(e)), e.slice(t).concat(e.slice(0, t)) }, _selectNext: function () { var e, t, i, o = this, a = o.dataSource.flatView(), l = a.length + (o.hasOptionLabel() ? 1 : 0), r = s(o._word, o._last), p = o.selectedIndex; for (-1 === p ? p = 0 : (p += r ? 1 : 0, p = n(p, l)), a = a.toJSON ? a.toJSON() : a.slice(), a = o._shuffleData(a, p), i = 0; l > i && (t = o._text(a[i]), !r || !o._matchText(t, o._last)) && !o._matchText(t, o._word); i++); i !== l && (e = o._focus(), o._select(n(p + i, l)), o.trigger("select", { item: o._focus() }) && o._select(e), o.popup.visible() || o._change()) }, _keypress: function (e) { var t, i = this; 0 !== e.which && e.keyCode !== o.keys.ENTER && (t = String.fromCharCode(e.charCode || e.keyCode), i.options.ignoreCase && (t = t.toLowerCase()), " " === t && e.preventDefault(), i._word += t, i._last = t, i._search()) }, _popupOpen: function () { var e = this.popup; e.wrapper = o.wrap(e.element), e.element.closest(".km-root")[0] && (e.wrapper.addClass("km-popup km-widget"), this.wrapper.addClass("km-widget")) }, _popup: function () { r.fn._popup.call(this), this.popup.one("open", T(this._popupOpen, this)) }, _click: function (i) { var n = i.item || e(i.currentTarget); return i.preventDefault(), this.trigger("select", { item: n }) ? (this.close(), t) : (this._userTriggered = !0, this._select(n), this._focusElement(this.wrapper), this._blur(), t) }, _focusElement: function (e) { var t = u(), i = this.wrapper, n = this.filterInput, s = e === n ? i : n, o = p.mobileOS && (p.touch || p.MSPointers || p.pointers); n && n[0] === e[0] && o || n && s[0] === t && (this._prevent = !0, this._focused = e.focus()) }, _filter: function (e) { var t, i; e && (t = this, i = t.options.ignoreCase, i && (e = e.toLowerCase()), t._select(function (i) { return t._matchText(t._text(i), e) })) }, _search: function () { var e = this, i = e.dataSource; if (clearTimeout(e._typingTimeout), e._isFilterEnabled()) e._typingTimeout = setTimeout(function () { var t = e.filterInput.val(); e._prev !== t && (e._prev = t, e.search(t)), e._typingTimeout = null }, e.options.delay); else { if (e._typingTimeout = setTimeout(function () { e._word = "" }, e.options.delay), !e.listView.bound()) return i.fetch().done(function () { e._selectNext() }), t; e._selectNext() } }, _get: function (t) { var i, n, s, o = "function" == typeof t, a = o ? e() : e(t); if (this.hasOptionLabel() && ("number" == typeof t ? t > -1 && (t -= 1) : a.hasClass("k-list-optionlabel") && (t = -1)), o) { for (i = this.dataSource.flatView(), s = 0; i.length > s; s++)if (t(i[s])) { t = s, n = !0; break } n || (t = -1) } return t }, _firstItem: function () { this.hasOptionLabel() ? this._focus(this.optionLabel) : this.listView.focusFirst() }, _lastItem: function () { this._resetOptionLabel(), this.listView.focusLast() }, _nextItem: function () { this.optionLabel.hasClass("k-state-focused") ? (this._resetOptionLabel(), this.listView.focusFirst()) : this.listView.focusNext() }, _prevItem: function () { this.optionLabel.hasClass("k-state-focused") || (this.listView.focusPrev(), this.listView.focus() || this._focus(this.optionLabel)) }, _focusItem: function () { var e = this.listView, i = e.focus(), n = e.select(); n = n[n.length - 1], n === t && this.options.highlightFirst && !i && (n = 0), n !== t ? e.focus(n) : this.options.optionLabel ? (this._focus(this.optionLabel), this._select(this.optionLabel)) : e.scrollToIndex(0) }, _resetOptionLabel: function (e) { this.optionLabel.removeClass("k-state-focused" + (e || "")).removeAttr("id") }, _focus: function (e) { var i = this.listView, n = this.optionLabel; return e === t ? (e = i.focus(), !e && n.hasClass("k-state-focused") && (e = n), e) : (this._resetOptionLabel(), e = this._get(e), i.focus(e), -1 === e && (n.addClass("k-state-focused").attr("id", i._optionID), this._focused.add(this.filterInput).removeAttr("aria-activedescendant").attr("aria-activedescendant", i._optionID)), t) }, _select: function (e, t) { var i = this; e = i._get(e), i.listView.select(e), t || i._state !== I || (i._state = k), -1 === e && i._selectValue(null) }, _selectValue: function (e) { var i = this, n = i.options.optionLabel, s = i.listView.select(), o = "", a = ""; s = s[s.length - 1], s === t && (s = -1), this._resetOptionLabel(" k-state-selected"), e ? (a = e, o = i._dataValue(e), n && (s += 1)) : n && (i._focus(i.optionLabel.addClass("k-state-selected")), a = i._optionLabelText(), o = "string" == typeof n ? "" : i._value(n), s = 0), i.selectedIndex = s, null === o && (o = ""), i._textAccessor(a), i._accessor(o, s), i._triggerCascade() }, _mobile: function () { var e = this, t = e.popup, i = p.mobileOS, n = t.element.parents(".km-root").eq(0); n.length && i && (t.options.animation.open.effects = i.android || i.meego ? "fadeIn" : i.ios || i.wp ? "slideIn:up" : t.options.animation.open.effects) }, _filterHeader: function () { var t; this.filterInput && (this.filterInput.off(f).parent().remove(), this.filterInput = null), this._isFilterEnabled() && (t = '<span unselectable="on" class="k-icon k-i-search">select</span>', this.filterInput = e('<input class="k-textbox"/>').attr({ placeholder: this.element.attr("placeholder"), role: "listbox", "aria-haspopup": !0, "aria-expanded": !1 }), this.list.prepend(e('<span class="k-list-filter" />').append(this.filterInput.add(t)))) }, _span: function () { var t, i = this, n = i.wrapper, s = "span.k-input"; t = n.find(s), t[0] || (n.append('<span unselectable="on" class="k-dropdown-wrap k-state-default"><span unselectable="on" class="k-input">&nbsp;</span><span unselectable="on" class="k-select"><span unselectable="on" class="k-icon k-i-arrow-s">select</span></span></span>').append(i.element), t = n.find(s)), i.span = t, i._inputWrapper = e(n[0].firstChild), i._arrow = n.find(".k-icon") }, _wrapper: function () { var e, t = this, i = t.element, n = i[0]; e = i.parent(), e.is("span.k-widget") || (e = i.wrap("<span />").parent(), e[0].style.cssText = n.style.cssText, e[0].title = n.title), i.hide(), t._focused = t.wrapper = e.addClass("k-widget k-dropdown k-header").addClass(n.className).css("display", "").attr({ accesskey: i.attr("accesskey"), unselectable: "on", role: "listbox", "aria-haspopup": !0, "aria-expanded": !1 }) }, _clearSelection: function (e) { this.select(e.value() ? 0 : -1) }, _inputTemplate: function () { var t = this, i = t.options.valueTemplate; if (i = i ? o.template(i) : e.proxy(o.template("#:this._text(data)#", { useWithBlock: !1 }), t), t.valueTemplate = i, t.hasOptionLabel() && !t.options.optionLabelTemplate) try { t.valueTemplate(t._optionLabelDataItem()) } catch (n) { throw Error(y) } }, _textAccessor: function (i) { var n, s = null, o = this.valueTemplate, a = this._optionLabelText(), l = this.span; if (i === t) return l.text(); e.isPlainObject(i) || i instanceof c ? s = i : a && a === i && (s = this.options.optionLabel), s || (s = this._assignInstance(i, this._accessor())), (s === a || this._text(s) === a) && (o = this.optionLabelTemplate), n = function () { return { elements: l.get(), data: [{ dataItem: s }] } }, this.angular("cleanup", n); try { l.html(o(s)) } catch (r) { l.html("") } this.angular("compile", n) }, _preselect: function (e, t) { e || t || (t = this._optionLabelText()), this._accessor(e), this._textAccessor(t), this._old = this._accessor(), this._oldIndex = this.selectedIndex, this.listView.setValue(e), this._initialIndex = null, this._presetValue = !0 }, _assignInstance: function (e, t) { var n = this.options.dataTextField, s = {}; return n ? (i(s, n.split("."), e), i(s, this.options.dataValueField.split("."), t), s = new c(s)) : s = e, s } }); a.plugin(C) }(window.kendo.jQuery), window.kendo }, "function" == typeof define && define.amd ? define : function (e, t, i) { (i || t)() });
//# sourceMappingURL=kendo.dropdownlist.min.js.map


(function (f, define) {
    define(["./kendo.list", "./kendo.mobile.scroller"], f);
})(function () {

    var __meta__ = { // jshint ignore:line
        id: "combobox",
        name: "ComboBox",
        category: "web",
        description: "The ComboBox widget allows the selection from pre-defined values or entering a new value.",
        depends: ["list"],
        features: [{
            id: "mobile-scroller",
            name: "Mobile scroller",
            description: "Support for kinetic scrolling in mobile device",
            depends: ["mobile.scroller"]
        }, {
            id: "virtualization",
            name: "VirtualList",
            description: "Support for virtualization",
            depends: ["virtuallist"]
        }]
    };

    (function ($, undefined) {
        var kendo = window.kendo,
            ui = kendo.ui,
            List = ui.List,
            Select = ui.Select,
            caret = kendo.caret,
            support = kendo.support,
            placeholderSupported = support.placeholder,
            activeElement = kendo._activeElement,
            keys = kendo.keys,
            ns = ".kendoComboBox",
            CLICK = "click" + ns,
            MOUSEDOWN = "mousedown" + ns,
            DISABLED = "disabled",
            READONLY = "readonly",
            CHANGE = "change",
            DEFAULT = "k-state-default",
            FOCUSED = "k-state-focused",
            STATEDISABLED = "k-state-disabled",
            ARIA_DISABLED = "aria-disabled",
            ARIA_READONLY = "aria-readonly",
            STATE_FILTER = "filter",
            STATE_ACCEPT = "accept",
            STATE_REBIND = "rebind",
            HOVEREVENTS = "mouseenter" + ns + " mouseleave" + ns,
            proxy = $.proxy;

        var ComboBox = Select.extend({
            init: function (element, options) {
                var that = this, text, disabled;

                that.ns = ns;

                options = $.isArray(options) ? { dataSource: options } : options;

                Select.fn.init.call(that, element, options);

                options = that.options;
                element = that.element.on("focus" + ns, proxy(that._focusHandler, that));

                options.placeholder = options.placeholder || element.attr("placeholder");

                that._reset();

                that._wrapper();

                that._input();

                that._tabindex(that.input);

                that._popup();

                that._dataSource();
                that._ignoreCase();

                that._enable();

                that._oldIndex = that.selectedIndex = -1;

                that._aria();

                that._initialIndex = options.index;

                that._initList();

                that._cascade();

                if (options.autoBind) {
                    that._filterSource();
                } else {
                    text = options.text;

                    if (!text && that._isSelect) {
                        text = element.children(":selected").text();
                    }

                    if (text) {
                        that._setText(text);
                    }
                }

                if (!text) {
                    that._placeholder();
                }

                disabled = $(that.element).parents("fieldset").is(':disabled');

                if (disabled) {
                    that.enable(false);
                }

                kendo.notify(that);
            },

            options: {
                name: "ComboBox",
                enabled: true,
                index: -1,
                text: null,
                value: null,
                autoBind: true,
                delay: 200,
                dataTextField: "",
                dataValueField: "",
                minLength: 0,
                height: 200,
                highlightFirst: true,
                filter: "none",
                placeholder: "",
                suggest: false,
                cascadeFrom: "",
                cascadeFromField: "",
                ignoreCase: true,
                animation: {},
                virtual: false,
                template: null,
                groupTemplate: "#:data#",
                fixedGroupTemplate: "#:data#"
            },

            events: [
                "open",
                "close",
                CHANGE,
                "select",
                "filtering",
                "dataBinding",
                "dataBound",
                "cascade",
                "set"
            ],

            setOptions: function (options) {
                Select.fn.setOptions.call(this, options);

                this.listView.setOptions(options);

                this._accessors();
                this._aria();
            },

            destroy: function () {
                var that = this;

                that.input.off(ns);
                that.element.off(ns);
                that._inputWrapper.off(ns);

                that._arrow.parent().off(CLICK + " " + MOUSEDOWN);

                Select.fn.destroy.call(that);
            },

            _focusHandler: function () {
                this.input.focus();
            },

            _arrowClick: function () {
                this._toggle();
            },

            _inputFocus: function () {
                this._inputWrapper.addClass(FOCUSED);
                this._placeholder(false);
            },

            _inputFocusout: function () {
                var that = this;
                var value = that.value();

                that._inputWrapper.removeClass(FOCUSED);
                clearTimeout(that._typingTimeout);
                that._typingTimeout = null;

                that.text(that.text());

                if (value !== that.value() && that.trigger("select", { item: that._focus() })) {
                    that.value(value);
                    return;
                }

                that._placeholder();
                that._blur();

                that.element.blur();
            },

            _editable: function (options) {
                var that = this,
                    disable = options.disable,
                    readonly = options.readonly,
                    wrapper = that._inputWrapper.off(ns),
                    input = that.element.add(that.input.off(ns)),
                    arrow = that._arrow.parent().off(CLICK + " " + MOUSEDOWN);

                if (!readonly && !disable) {
                    wrapper
                        .addClass(DEFAULT)
                        .removeClass(STATEDISABLED)
                        .on(HOVEREVENTS, that._toggleHover);

                    input.removeAttr(DISABLED)
                        .removeAttr(READONLY)
                        .attr(ARIA_DISABLED, false)
                        .attr(ARIA_READONLY, false);

                    arrow.on(CLICK, proxy(that._arrowClick, that))
                        .on(MOUSEDOWN, function (e) { e.preventDefault(); });

                    that.input
                        .on("keydown" + ns, proxy(that._keydown, that))
                        .on("focus" + ns, proxy(that._inputFocus, that))
                        .on("focusout" + ns, proxy(that._inputFocusout, that));

                } else {
                    wrapper
                        .addClass(disable ? STATEDISABLED : DEFAULT)
                        .removeClass(disable ? DEFAULT : STATEDISABLED);

                    input.attr(DISABLED, disable)
                        .attr(READONLY, readonly)
                        .attr(ARIA_DISABLED, disable)
                        .attr(ARIA_READONLY, readonly);
                }
            },

            open: function () {
                var that = this;
                var state = that._state;

                if (that.popup.visible()) {
                    return;
                }

                if ((!that.listView.bound() && state !== STATE_FILTER) || state === STATE_ACCEPT) {
                    that._open = true;
                    that._state = STATE_REBIND;
                    that._filterSource();
                } else {
                    that.popup.open();
                    that._focusItem();
                }
            },

            _updateSelectionState: function () {
                var that = this;
                var text = that.options.text;
                var value = that.options.value;

                if (that.listView.isFiltered()) {
                    return;
                }

                if (that.selectedIndex === -1) {
                    if (text === undefined || text === null) {
                        text = value;
                    }

                    that._accessor(value);
                    that.input.val(text || that.input.val());
                    that._placeholder();
                } else if (that._oldIndex === -1) {
                    that._oldIndex = that.selectedIndex;
                }
            },

            _buildOptions: function (data) {
                var that = this;
                if (!that._isSelect) {
                    return;
                }

                var custom = that._customOption;

                if (that._state === STATE_REBIND) {
                    that._state = "";
                }

                that._customOption = undefined;
                that._options(data, "", that.value());

                if (custom && custom[0].selected) {
                    that._custom(custom.val());
                }
            },

            _updateSelection: function () {
                var that = this;
                var listView = that.listView;
                var initialIndex = that._initialIndex;
                var hasInitialIndex = initialIndex !== null && initialIndex > -1;
                var filtered = that._state === STATE_FILTER;

                if (filtered) {
                    $(listView.focus()).removeClass("k-state-selected");
                    return;
                }

                if (that._fetch) {
                    return;
                }

                if (!listView.value().length) {
                    if (hasInitialIndex) {
                        that.select(initialIndex);
                    } else if (that._accessor()) {
                        listView.value(that._accessor());
                    }
                }

                that._initialIndex = null;

                var dataItem = listView.selectedDataItems()[0];

                if (!dataItem) {
                    return;
                }

                if (that._value(dataItem) !== that.value()) {
                    that._custom(that._value(dataItem));
                }

                if (that.text() && that.text() !== that._text(dataItem)) {
                    that._selectValue(dataItem);
                }
            },

            _updateItemFocus: function () {
                var listView = this.listView;

                if (!this.options.highlightFirst) {
                    listView.focus(-1);
                } else if (!listView.focus() && !listView.focusIndex()) {
                    listView.focus(0);
                }
            },

            _listBound: function () {
                var that = this;
                var isActive = that.input[0] === activeElement();

                var data = that.dataSource.flatView();
                var skip = that.listView.skip();
                var isFirstPage = skip === undefined || skip === 0;

                that._angularItems("compile");

                that._presetValue = false;

                that._resizePopup();

                that.popup.position();

                that._buildOptions(data);

                that._makeUnselectable();

                that._updateSelection();

                if (data.length && isFirstPage) {
                    that._updateItemFocus();

                    if (that.options.suggest && isActive && that.input.val()) {
                        that.suggest(data[0]);
                    }
                }

                if (that._open) {
                    that._open = false;

                    if (that._typingTimeout && !isActive) {
                        that.popup.close();
                    } else {
                        that.toggle(!!data.length);
                    }

                    that._typingTimeout = null;
                }

                that._hideBusy();
                that.trigger("dataBound");
            },

            _listChange: function () {
                this._selectValue(this.listView.selectedDataItems()[0]);

                if (this._presetValue) {
                    this._oldIndex = this.selectedIndex;
                }
            },

            _get: function (candidate) {
                var data, found, idx;

                if (typeof candidate === "function") {
                    data = this.dataSource.flatView();

                    for (idx = 0; idx < data.length; idx++) {
                        if (candidate(data[idx])) {
                            candidate = idx;
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        candidate = -1;
                    }
                }

                return candidate;
            },

            _select: function (candidate, keepState) {
                candidate = this._get(candidate);

                if (candidate === -1) {
                    this.input[0].value = "";
                    this._accessor("");
                }

                this.listView.select(candidate);

                if (!keepState && this._state === STATE_FILTER) {
                    this._state = STATE_ACCEPT;
                }
            },

            _selectValue: function (dataItem) {
                var idx = this.listView.select();
                var value = "";
                var text = "";

                idx = idx[idx.length - 1];
                if (idx === undefined) {
                    idx = -1;
                }

                this.selectedIndex = idx;

                if (idx === -1) {
                    value = text = this.input[0].value;
                    this.listView.focus(-1);
                } else {
                    if (dataItem) {
                        value = this._dataValue(dataItem);
                        text = this._text(dataItem);
                    }

                    if (value === null) {
                        value = "";
                    }
                }

                this._prev = this.input[0].value = text;
                this._accessor(value !== undefined ? value : text, idx);

                this._placeholder();
                this._triggerCascade();
            },

            refresh: function () {
                this.listView.refresh();
            },

            suggest: function (word) {
                var that = this;
                var element = that.input[0];
                var value = that.text();
                var caretIdx = caret(element)[0];
                var key = that._last;
                var idx;

                if (key == keys.BACKSPACE || key == keys.DELETE) {
                    that._last = undefined;
                    return;
                }

                word = word || "";

                if (typeof word !== "string") {
                    if (word[0]) {
                        word = that.dataSource.view()[List.inArray(word[0], that.ul[0])];
                    }

                    word = word ? that._text(word) : "";
                }

                if (caretIdx <= 0) {
                    caretIdx = value.toLowerCase().indexOf(word.toLowerCase()) + 1;
                }

                if (word) {
                    word = word.toString();
                    idx = word.toLowerCase().indexOf(value.toLowerCase());
                    if (idx > -1) {
                        value += word.substring(idx + value.length);
                    }
                } else {
                    value = value.substring(0, caretIdx);
                }

                if (value.length !== caretIdx || !word) {
                    element.value = value;
                    if (element === activeElement()) {
                        caret(element, caretIdx, value.length);
                    }
                }
            },

            text: function (text) {
                text = text === null ? "" : text;

                var that = this;
                var input = that.input[0];
                var ignoreCase = that.options.ignoreCase;
                var loweredText = text;
                var dataItem;
                var value;

                if (text === undefined) {
                    return input.value;
                }

                if (that.options.autoBind === false && !that.listView.bound()) {
                    that._setText(text);
                    return;
                }

                dataItem = that.dataItem();

                if (dataItem && that._text(dataItem) === text) {
                    value = that._value(dataItem);

                    if (value === List.unifyType(that._old, typeof value)) {
                        that._triggerCascade();
                        return;
                    }
                }

                if (ignoreCase) {
                    loweredText = loweredText.toLowerCase();
                }

                that._select(function (data) {
                    data = that._text(data);

                    if (ignoreCase) {
                        data = (data + "").toLowerCase();
                    }

                    return data === loweredText;
                });

                if (that.selectedIndex < 0) {
                    that._accessor(text);
                    input.value = text;

                    that._triggerCascade();
                }

                that._prev = input.value;
            },

            toggle: function (toggle) {
                this._toggle(toggle, true);
            },

            value: function (value) {
                var that = this;
                var options = that.options;
                var listView = that.listView;

                if (value === undefined) {
                    value = that._accessor() || that.listView.value()[0];
                    return value === undefined || value === null ? "" : value;
                }

                that.trigger("set", { value: value });

                if (value === options.value && that.input.val() === options.text) {
                    return;
                }

                that._accessor(value);

                if (that._isFilterEnabled() && listView.bound() && listView.isFiltered()) {
                    that._clearFilter();
                } else {
                    that._fetchData();
                }

                listView
                    .value(value)
                    .done(function () {
                        if (that.selectedIndex === -1) {
                            that._accessor(value);
                            that.input.val(value);
                            that._placeholder(true);
                        }

                        that._old = that._accessor();
                        that._oldIndex = that.selectedIndex;

                        that._prev = that.input.val();

                        if (that._state === STATE_FILTER) {
                            that._state = STATE_ACCEPT;
                        }
                    });
            },

            _click: function (e) {
                var item = e.item;

                e.preventDefault();

                if (this.trigger("select", { item: item })) {
                    this.close();
                    return;
                }

                this._userTriggered = true;

                this._select(item);
                this._blur();
            },

            _filter: function (word) {
                var that = this;
                var options = that.options;
                var dataSource = that.dataSource;
                var ignoreCase = options.ignoreCase;
                var predicate = function (dataItem) {
                    var text = that._text(dataItem);
                    if (text !== undefined) {
                        text = text + "";
                        if (text !== "" && word === "") {
                            return false;
                        }

                        if (ignoreCase) {
                            text = text.toLowerCase();
                        }

                        return text.indexOf(word) === 0;
                    }
                };

                if (ignoreCase) {
                    word = word.toLowerCase();
                }

                if (!that.ul[0].firstChild) {
                    dataSource.one(CHANGE, function () {
                        if (dataSource.view()[0]) {
                            that.search(word);
                        }
                    }).fetch();
                    return;
                }

                this.listView.focus(this._get(predicate));

                var current = this.listView.focus();

                if (current) {
                    if (options.suggest) {
                        that.suggest(current);
                    }

                    this.open();
                }

                if (this.options.highlightFirst && !word) {
                    this.listView.focusFirst();
                }
            },

            _input: function () {
                var that = this,
                    element = that.element.removeClass("k-input")[0],
                    accessKey = element.accessKey,
                    wrapper = that.wrapper,
                    SELECTOR = "input.k-input",
                    name = element.name || "",
                    input;

                if (name) {
                    name = 'name="' + name + '_input" ';
                }

                input = wrapper.find(SELECTOR);

                if (!input[0]) {
                    wrapper.append('<span tabindex="-1" unselectable="on" class="k-dropdown-wrap k-state-default"><input ' + name + 'class="k-input" type="text" autocomplete="off"/><span tabindex="-1" unselectable="on" class="k-select"><span unselectable="on" class="k-icon k-i-arrow-s">select</span></span></span>')
                        .append(that.element);

                    input = wrapper.find(SELECTOR);
                }

                input[0].style.cssText = element.style.cssText;
                input[0].title = element.title;

                if (element.maxLength > -1) {
                    input[0].maxLength = element.maxLength;
                }

                input.addClass(element.className)
                    .val(this.options.text || element.value)
                    .css({
                        width: "100%",
                        height: element.style.height
                    })
                    .attr({
                        "role": "combobox",
                        "aria-expanded": false
                    })
                    .show();

                if (placeholderSupported) {
                    input.attr("placeholder", that.options.placeholder);
                }

                if (accessKey) {
                    element.accessKey = "";
                    input[0].accessKey = accessKey;
                }

                that._focused = that.input = input;
                that._inputWrapper = $(wrapper[0].firstChild);
                that._arrow = wrapper.find(".k-icon")
                    .attr({
                        "role": "button",
                        "tabIndex": -1
                    });

                if (element.id) {
                    that._arrow.attr("aria-controls", that.ul[0].id);
                }
            },

            _keydown: function (e) {
                var that = this,
                    key = e.keyCode;

                that._last = key;

                clearTimeout(that._typingTimeout);
                that._typingTimeout = null;

                if (key != keys.TAB && !that._move(e)) {
                    that._search();
                }
            },

            _placeholder: function (show) {
                if (placeholderSupported) {
                    return;
                }

                var that = this,
                    input = that.input,
                    placeholder = that.options.placeholder,
                    value;

                if (placeholder) {
                    value = that.value();

                    if (show === undefined) {
                        show = !value;
                    }

                    input.toggleClass("k-readonly", show);

                    if (!show) {
                        if (!value) {
                            placeholder = "";
                        } else {
                            return;
                        }
                    }

                    input.val(placeholder);

                    if (!placeholder && input[0] === activeElement()) {
                        caret(input[0], 0, 0);
                    }
                }
            },

            _search: function () {
                var that = this;

                that._typingTimeout = setTimeout(function () {
                    var value = that.text();

                    if (that._prev !== value) {
                        that._prev = value;

                        if (that.options.filter === "none") {
                            that.listView.select(-1);
                        }

                        that.search(value);
                    }

                    that._typingTimeout = null;
                }, that.options.delay);
            },

            _setText: function (text) {
                this.input.val(text);
                this._prev = text;
            },

            _wrapper: function () {
                var that = this,
                    element = that.element,
                    wrapper = element.parent();

                if (!wrapper.is("span.k-widget")) {
                    wrapper = element.hide().wrap("<span />").parent();
                    wrapper[0].style.cssText = element[0].style.cssText;
                }

                that.wrapper = wrapper.addClass("k-widget k-combobox k-header")
                    .addClass(element[0].className)
                    .css("display", "");
            },

            _clearSelection: function (parent, isFiltered) {
                var that = this;
                var hasValue = parent.value();
                var custom = hasValue && parent.selectedIndex === -1;

                if (this.selectedIndex == -1 && this.value()) {
                    return;
                }

                if (isFiltered || !hasValue || custom) {
                    that.options.value = "";
                    that.value("");
                }
            },

            _preselect: function (value, text) {
                this.input.val(text);
                this._accessor(value);

                this._old = this._accessor();
                this._oldIndex = this.selectedIndex;

                this.listView.setValue(value);
                this._placeholder();

                this._initialIndex = null;
                this._presetValue = true;
            }
        });

        ui.plugin(ComboBox);
    })(window.kendo.jQuery);

    return window.kendo;

}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) { (a3 || a2)(); });


