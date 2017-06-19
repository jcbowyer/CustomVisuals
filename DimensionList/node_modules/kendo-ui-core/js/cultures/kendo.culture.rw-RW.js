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

	__webpack_require__(300);
	module.exports = __webpack_require__(300);


/***/ },

/***/ 300:
/***/ function(module, exports) {

	(function( window, undefined ) {
	    kendo.cultures["rw-RW"] = {
	        name: "rw-RW",
	        numberFormat: {
	            pattern: ["-n"],
	            decimals: 2,
	            ",": " ",
	            ".": ",",
	            groupSize: [3],
	            percent: {
	                pattern: ["-n %","n %"],
	                decimals: 2,
	                ",": " ",
	                ".": ",",
	                groupSize: [3],
	                symbol: "%"
	            },
	            currency: {
	                name: "Rwandan Franc",
	                abbr: "RWF",
	                pattern: ["-n $","n $"],
	                decimals: 2,
	                ",": " ",
	                ".": ",",
	                groupSize: [3],
	                symbol: "RWF"
	            }
	        },
	        calendars: {
	            standard: {
	                days: {
	                    names: ["Ku cyumweru","Ku wa mbere","Ku wa kabiri","Ku wa gatatu","Ku wa kane","Ku wa gatanu","Ku wa gatandatu"],
	                    namesAbbr: ["cyu.","mbe.","kab.","gat.","kan.","gat.","gat."],
	                    namesShort: ["cy","mb","ka","ga","ka","ga","ga"]
	                },
	                months: {
	                    names: ["Mutarama","Gashyantare","Werurwe","Mata","Gicurasi","Kamena","Nyakanga","Kanama","Nzeli","Ukwakira","Ugushyingo","Ukuboza"],
	                    namesAbbr: ["Mut","Gas","Wer","Mat","Gic","Kam","Nyak","Kan","Nze","Ukwak","Ugus","Ukub"]
	                },
	                AM: ["z.m","z.m","Z.M"],
	                PM: ["z.n","z.n","Z.N"],
	                patterns: {
	                    d: "d/MM/yyyy",
	                    D: "d ' ' MMMM ' ' yyyy",
	                    F: "d ' ' MMMM ' ' yyyy H:mm:ss",
	                    g: "d/MM/yyyy H:mm",
	                    G: "d/MM/yyyy H:mm:ss",
	                    m: "MMMM dd",
	                    M: "MMMM dd",
	                    s: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
	                    t: "H:mm",
	                    T: "H:mm:ss",
	                    u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
	                    y: "MMMM yyyy",
	                    Y: "MMMM yyyy"
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