"use strict";
exports.id = 764;
exports.ids = [764];
exports.modules = {

/***/ 4121:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);

function Content({ children  }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
        className: "max-w-6xl p-4 m-auto md:p-8",
        children: children
    });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Content);


/***/ }),

/***/ 9917:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var tailwind_merge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8097);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([tailwind_merge__WEBPACK_IMPORTED_MODULE_1__]);
tailwind_merge__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];


const defaultProps = {
    className: undefined,
    align: undefined
};
function H1({ children , className  }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h1", {
        className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)("mb-2 text-2xl sm:text-3xl lg:text-4xl font-kollektif font-bold md:mb-4 text-center md:text-left", className),
        children: children
    });
}
function H2({ children , className , align  }) {
    let styles = "";
    if (align === "left") {
        styles = "mb-2 text-xl sm:text-2xl lg:text-3xl md:mb-4 text-left font-kollektif font-bold md:text-left";
    } else if (align === "right") {
        styles = "mb-2 text-xl sm:text-2xl lg:text-3xl md:mb-4 text-left font-kollektif font-bold md:text-right";
    } else {
        styles = "mb-2 text-xl sm:text-2xl lg:text-3xl md:mb-4 font-kollektif font-bold text-center md:text-left";
    }
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h2", {
        className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)(styles, className),
        children: children
    });
}
function H3({ children , className  }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h3", {
        className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)("mb-2 text-base sm:text-lg lg:text-xl text-gray-700 font-kollektif font-bold text-center md:text-left", className),
        children: children
    });
}
function H4({ children , className  }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h4", {
        className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)("mb-2 text-sm sm:text-base lg:text-lg text-gray-600 font-kollektif text-center md:text-left", className),
        children: children
    });
}
H1.defaultProps = defaultProps;
H2.defaultProps = defaultProps;
H3.defaultProps = defaultProps;
H4.defaultProps = defaultProps;
const elements = {
    H1,
    H2,
    H3,
    H4
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (elements);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;