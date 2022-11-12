"use strict";
exports.id = 296;
exports.ids = [296];
exports.modules = {

/***/ 9296:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var tailwind_merge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8097);
/* harmony import */ var next_image__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5675);
/* harmony import */ var next_image__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_image__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _Tag__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6410);
/* harmony import */ var _uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(3901);
/* harmony import */ var _uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_4__);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([tailwind_merge__WEBPACK_IMPORTED_MODULE_1__, _Tag__WEBPACK_IMPORTED_MODULE_3__]);
([tailwind_merge__WEBPACK_IMPORTED_MODULE_1__, _Tag__WEBPACK_IMPORTED_MODULE_3__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);





function Card({ name , tags , className , imgSrc , onClick , minHeight , colored  }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_4__.Button, {
        fluid: true,
        disabled: !onClick,
        onClick: onClick,
        className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)("p-0 border-none outline outline-1 outline-uzh-grey-60 filter", !colored && "grayscale", className, onClick ? "hover:shadow-lg hover:outline-uzh-red-100 hover:filter-none" : "cursor-default"),
        children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
            className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)("w-full h-full relative", minHeight || "min-h-[200px]"),
            children: [
                tags && tags.length > 0 && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                    className: "absolute top-0 z-10 flex flex-row flex-wrap gap-1 p-2",
                    children: tags.map((tag)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_Tag__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
                            label: tag
                        }, tag))
                }),
                name && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                    className: "absolute left-0 right-0 z-10 py-1 text-lg font-bold prose text-center bg-white bg-opacity-80 bottom-3",
                    children: name
                }),
                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_image__WEBPACK_IMPORTED_MODULE_2___default()), {
                    className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)("z-0 w-full rounded opacity-90"),
                    src: imgSrc,
                    alt: `Image of ${name}`,
                    layout: "fill",
                    objectFit: "cover"
                })
            ]
        })
    });
}
Card.defaultProps = {
    name: undefined,
    className: undefined,
    tags: [],
    onClick: undefined,
    minHeight: undefined,
    colored: false
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Card);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 6410:
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


function Tag({ label , className  }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
        className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)("px-2 text-sm prose text-gray-600 border rounded shadow bg-opacity-95", label !== "Work in Progress" ? "bg-white" : "bg-yellow-200", className),
        children: label
    });
}
Tag.defaultProps = {
    className: undefined
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Tag);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;