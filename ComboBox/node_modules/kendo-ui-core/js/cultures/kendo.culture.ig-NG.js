module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(180);
	module.exports = __webpack_require__(180);


/***/ },

/***/ 180:
/***/ function(module, exports) {

	(function( window, undefined ) {
	    kendo.cultures["ig-NG"] = {
	        name: "ig-NG",
	        numberFormat: {
	            pattern: ["-n"],
	            decimals: 2,
	            ",": ",",
	            ".": ".",
	            groupSize: [3],
	            percent: {
	                pattern: ["-n %","n %"],
	                decimals: 2,
	                ",": ",",
	                ".": ".",
	                groupSize: [3],
	                symbol: "%"
	            },
	            currency: {
	                name: "Naira",
	                abbr: "NGN",
	                pattern: ["$-n","$ n"],
	                decimals: 2,
	                ",": ",",
	                ".": ".",
	                groupSize: [3],
	                symbol: "₦"
	            }
	        },
	        calendars: {
	            standard: {
	                days: {
	                    names: ["Sọnde","Mọnde","Tuzde","Wednesde","Tọsde","Fraịde","Satọde"],
	                    namesAbbr: ["Sọn","Mọn","Tuz","Ojo","Tọs","Fra","Sat"],
	                    namesShort: ["Sọ","Mọ","Tu","We","Tọs","Fra","Sa"]
	                },
	                months: {
	                    names: ["Jenụwarị","Febụwarị","Machị","Eprelu","Mey","Juun","Julaị","Ọgọst","Septemba","Ọcktọba","Nọvemba","Disemba"],
	                    namesAbbr: ["Jen","Feb","Mac","Epr","Mey","Jun","Jul","Ọgọ","Sep","Ọkt","Nọv","Dis"]
	                },
	                AM: ["Ụtụtụ","ụtụtụ","ỤTỤTỤ"],
	                PM: ["Ehihie","ehihie","EHIHIE"],
	                patterns: {
	                    d: "d/M/yyyy",
	                    D: "dddd, MMMM dd, yyyy",
	                    F: "dddd, MMMM dd, yyyy h.mm.ss tt",
	                    g: "d/M/yyyy h.mm tt",
	                    G: "d/M/yyyy h.mm.ss tt",
	                    m: "d MMMM",
	                    M: "d MMMM",
	                    s: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
	                    t: "h.mm tt",
	                    T: "h.mm.ss tt",
	                    u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
	                    y: "MMMM, yyyy",
	                    Y: "MMMM, yyyy"
	                },
	                "/": "/",
	                ":": ".",
	                firstDay: 0
	            }
	        }
	    }
	})(this);


/***/ }

/******/ });