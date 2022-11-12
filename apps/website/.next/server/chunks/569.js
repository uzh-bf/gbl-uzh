"use strict";
exports.id = 569;
exports.ids = [569];
exports.modules = {

/***/ 1569:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var tailwind_merge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8097);
/* harmony import */ var _TitleBackground__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5833);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([tailwind_merge__WEBPACK_IMPORTED_MODULE_1__, _TitleBackground__WEBPACK_IMPORTED_MODULE_2__]);
([tailwind_merge__WEBPACK_IMPORTED_MODULE_1__, _TitleBackground__WEBPACK_IMPORTED_MODULE_2__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);



function TitleImage({ imgSrc , children  }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
        className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)(imgSrc && "border-uzh-red-100 bg-uzh-grey-20"),
        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
            className: "flex justify-center",
            children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)("relative max-h-[25rem] overflow-hidden", !imgSrc && "min-h-[3rem] w-full"),
                children: [
                    imgSrc && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("img", {
                        className: "h-auto w-full min-h-[10rem] max-w-[100rem] saturate-50",
                        src: imgSrc,
                        alt: ""
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_TitleBackground__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
                        className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)("p-4 md:p-8", imgSrc && "p-4 absolute bottom-0 md:bottom-5 sm:top-auto bg-opacity-80"),
                        children: children
                    })
                ]
            })
        })
    });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TitleImage);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;