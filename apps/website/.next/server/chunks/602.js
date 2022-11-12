"use strict";
exports.id = 602;
exports.ids = [602];
exports.modules = {

/***/ 9602:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1853);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _common_Card__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9296);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_common_Card__WEBPACK_IMPORTED_MODULE_2__]);
_common_Card__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];



function GameCard({ name , tags , linkHref , imgSrc  }) {
    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_1__.useRouter)();
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_common_Card__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
        name: name,
        tags: tags,
        imgSrc: imgSrc,
        onClick: linkHref ? ()=>router.push(linkHref) : undefined
    });
}
GameCard.defaultProps = {
    linkHref: undefined,
    tags: []
};
GameCard.ProcessSignifier = function ProcessSignifier() {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
        className: "flex flex-col items-center p-2 mb-2 border rounded md:mb-0 md:mr-2 md:last:mr-0",
        children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
            className: "flex flex-row",
            children: [
                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("svg", {
                    height: "35",
                    width: "35",
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("circle", {
                        cx: "15",
                        cy: "15",
                        r: "15",
                        stroke: "black",
                        strokeWidth: "1",
                        fill: "grey"
                    })
                }),
                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("svg", {
                    height: "35",
                    width: "35",
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("circle", {
                        cx: "15",
                        cy: "15",
                        r: "15",
                        stroke: "black",
                        strokeWidth: "1",
                        fill: "none"
                    })
                }),
                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("svg", {
                    height: "35",
                    width: "35",
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("circle", {
                        cx: "15",
                        cy: "15",
                        r: "15",
                        stroke: "black",
                        strokeWidth: "1",
                        fill: "none"
                    })
                })
            ]
        })
    });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GameCard);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;