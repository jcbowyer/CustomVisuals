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

	__webpack_require__(201);
	module.exports = __webpack_require__(201);


/***/ },

/***/ 201:
/***/ function(module, exports) {

	(function( window, undefined ) {
	    kendo.cultures["kk-KZ"] = {
	        name: "kk-KZ",
	        numberFormat: {
	            pattern: ["-n"],
	            decimals: 2,
	            ",": " ",
	            ".": ",",
	            groupSize: [3],
	            percent: {
	                pattern: ["-n%","n%"],
	                decimals: 2,
	                ",": " ",
	                ".": ",",
	                groupSize: [3],
	                symbol: "%"
	            },
	            currency: {
	                name: "Tenge",
	                abbr: "KZT",
	                pattern: ["-$n","$n"],
	                decimals: 2,
	                ",": " ",
	                ".": "-",
	                groupSize: [3],
	                symbol: "₸"
	            }
	        },
	        calendars: {
	            standard: {
	                days: {
	                    names: ["Жексенбі","Дүйсенбі","Сейсенбі","Сәрсенбі","Бейсенбі","Жұма","Сенбі"],
	                    namesAbbr: ["Жек","Дүй","Сей","Сәр","Бей","Жұм","Сен"],
	                    namesShort: ["Жк","Дс","Сс","Ср","Бс","Жм","Сн"]
	                },
	                months: {
	                    names: ["қаңтар","ақпан","наурыз","сәуір","мамыр","маусым","шілде","тамыз","қыркүйек","қазан","қараша","желтоқсан"],
	                    namesAbbr: ["қаң","ақп","нау","сәу","мам","мау","шіл","там","қыр","қаз","қар","жел"]
	                },
	                AM: [""],
	                PM: [""],
	                patterns: {
	                    d: "d-MMM-yy",
	                    D: "d MMMM yyyy 'ж.'",
	                    F: "d MMMM yyyy 'ж.' HH:mm:ss",
	                    g: "d-MMM-yy HH:mm",
	                    G: "d-MMM-yy HH:mm:ss",
	                    m: "d MMMM",
	                    M: "d MMMM",
	                    s: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
	                    t: "HH:mm",
	                    T: "HH:mm:ss",
	                    u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
	                    y: "MMMM yyyy",
	                    Y: "MMMM yyyy"
	                },
	                "/": "-",
	                ":": ":",
	                firstDay: 1
	            }
	        }
	    }
	})(this);


/***/ }

/******/ });