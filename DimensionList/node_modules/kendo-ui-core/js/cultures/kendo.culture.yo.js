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

	__webpack_require__(402);
	module.exports = __webpack_require__(402);


/***/ },

/***/ 402:
/***/ function(module, exports) {

	(function( window, undefined ) {
	    kendo.cultures["yo"] = {
	        name: "yo",
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
	                name: "",
	                abbr: "",
	                pattern: ["-$ n","$ n"],
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
	                    names: ["Àìkú","Ajé","Ìṣẹ́gun","Ọjọ́\u0027rú","Ọjọ́\u0027bọ̀","Ẹtì","Àbámẹ́ta"],
	                    namesAbbr: ["Àìk","Ajé","Ìṣg","Ọjr","Ọjb","Ẹti","Àbá"],
	                    namesShort: ["Àì","Aj","Ìṣ","Ọj","Ọb","Ẹt","Àb"]
	                },
	                months: {
	                    names: ["Oṣu Muharram","Oṣu Safar","Oṣu R Awwal","Oṣu R Aakhir","Oṣu J Awwal","Oṣu J Aakhira","Oṣu Rajab","Oṣu Sha\u0027baan","Oṣu Ramadhan","Oṣu Shawwal","Oṣu Dhul Qa\u0027dah","Oṣu Dhul Hijjah"],
	                    namesAbbr: ["Oṣu Muharram","Oṣu Safar","Oṣu R Awwal","Oṣu R Aakhir","Oṣu J Awwal","Oṣu J Aakhira","Oṣu Rajab","Oṣu Sha\u0027baan","Oṣu Ramadhan","Oṣu Shawwal","Oṣu Dhul Qa\u0027dah","Oṣu Dhul Hijjah"]
	                },
	                AM: ["Òwúrọ́","òwúrọ́","ÒWÚRỌ́"],
	                PM: ["Alẹ̀","alẹ̀","ALẸ̀"],
	                patterns: {
	                    d: "d/M/yyyy",
	                    D: "dddd, dd MMMM, yyyy",
	                    F: "dddd, dd MMMM, yyyy h:mm:ss tt",
	                    g: "d/M/yyyy h:mm tt",
	                    G: "d/M/yyyy h:mm:ss tt",
	                    m: "dd MMMM",
	                    M: "dd MMMM",
	                    s: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
	                    t: "h:mm tt",
	                    T: "h:mm:ss tt",
	                    u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
	                    y: "MMMM,yyyy",
	                    Y: "MMMM,yyyy"
	                },
	                "/": "/",
	                ":": ":",
	                firstDay: 0
	            }
	        }
	    }
	})(this);


/***/ }

/******/ });