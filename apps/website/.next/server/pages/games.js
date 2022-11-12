"use strict";
(() => {
var exports = {};
exports.id = 451;
exports.ids = [451];
exports.modules = {

/***/ 1135:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_mdx_remote__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9961);
/* harmony import */ var _common_Tag__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6410);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([next_mdx_remote__WEBPACK_IMPORTED_MODULE_1__, _common_Tag__WEBPACK_IMPORTED_MODULE_2__]);
([next_mdx_remote__WEBPACK_IMPORTED_MODULE_1__, _common_Tag__WEBPACK_IMPORTED_MODULE_2__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);



function CourseEntry({ name , ects , level , semester , institution , href , description  }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("a", {
        className: "flex-1 mt-4 first:mt-0",
        href: href,
        target: "_blank",
        rel: "noreferrer",
        children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
            className: "px-2 py-2 bg-white border rounded cursor-pointer hover:shadow",
            children: [
                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                    className: "flex",
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h3", {
                        className: "text-base font-bold text-left text-gray-700 sm:text-lg lg:text-xl font-kollektif md:text-left",
                        children: name
                    })
                }),
                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                    className: "max-w-4xl prose-sm prose",
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(next_mdx_remote__WEBPACK_IMPORTED_MODULE_1__.MDXRemote, {
                        ...description
                    })
                }),
                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                    className: "flex flex-col gap-1 md:flex-row",
                    children: [
                        institution && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_common_Tag__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
                            label: institution
                        }),
                        semester && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_common_Tag__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
                            label: `${semester} Semester`
                        }),
                        level && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_common_Tag__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
                            label: level
                        }),
                        " ",
                        ects && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_common_Tag__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
                            label: `${ects} ECTS`
                        })
                    ]
                })
            ]
        })
    });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CourseEntry);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 168:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "getStaticProps": () => (/* binding */ getStaticProps)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_common_Header__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9917);
/* harmony import */ var _components_common_Title__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3173);
/* harmony import */ var _components_common_TitleBackground__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5833);
/* harmony import */ var _components_Content__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(4121);
/* harmony import */ var _components_courses_CourseEntry__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1135);
/* harmony import */ var _components_games_GameCard__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(9602);
/* harmony import */ var _components_PageWithHeader__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(5865);
/* harmony import */ var _lib_util__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(871);
/* harmony import */ var ramda__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(3991);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_components_common_Header__WEBPACK_IMPORTED_MODULE_1__, _components_common_Title__WEBPACK_IMPORTED_MODULE_2__, _components_common_TitleBackground__WEBPACK_IMPORTED_MODULE_3__, _components_courses_CourseEntry__WEBPACK_IMPORTED_MODULE_5__, _components_games_GameCard__WEBPACK_IMPORTED_MODULE_6__, _components_PageWithHeader__WEBPACK_IMPORTED_MODULE_7__, _lib_util__WEBPACK_IMPORTED_MODULE_8__, ramda__WEBPACK_IMPORTED_MODULE_9__]);
([_components_common_Header__WEBPACK_IMPORTED_MODULE_1__, _components_common_Title__WEBPACK_IMPORTED_MODULE_2__, _components_common_TitleBackground__WEBPACK_IMPORTED_MODULE_3__, _components_courses_CourseEntry__WEBPACK_IMPORTED_MODULE_5__, _components_games_GameCard__WEBPACK_IMPORTED_MODULE_6__, _components_PageWithHeader__WEBPACK_IMPORTED_MODULE_7__, _lib_util__WEBPACK_IMPORTED_MODULE_8__, ramda__WEBPACK_IMPORTED_MODULE_9__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);










function GBLinUse({ sourceArr , frontMatterArr , filenames , fileMissingArr  }) {
    console.log(frontMatterArr);
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_components_PageWithHeader__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z, {
        title: "GBL in Use",
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_TitleBackground__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Title__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
                    title: "GBL in Use"
                })
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_components_Content__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
                children: [
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Header__WEBPACK_IMPORTED_MODULE_1__/* ["default"].H2 */ .Z.H2, {
                                children: "Games"
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                className: "text-gray-600",
                                children: "Simulations and Serious Games that have been developed or are being developed at institutions of the University of Zurich."
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                className: "mt-4 sm:grid sm:grid-cols-3 sm:gap-2 md:gap-4",
                                children: (0,ramda__WEBPACK_IMPORTED_MODULE_9__.sortBy)((game)=>game.title, frontMatterArr[0]).map((game)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_games_GameCard__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {
                                        name: game.title,
                                        tags: game.tags,
                                        linkHref: game.href,
                                        imgSrc: game.imgSrc
                                    }, game.title))
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "mt-4 md:mt-8",
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Header__WEBPACK_IMPORTED_MODULE_1__/* ["default"].H2 */ .Z.H2, {
                                children: "Courses"
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                className: "text-gray-600",
                                children: "A selection of lectures and seminars at the University of Zurich that contain Game-Based Learning elements."
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                className: "flex flex-col mt-4",
                                children: frontMatterArr[1].map((course, ix)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_courses_CourseEntry__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {
                                        name: course.name,
                                        ects: course.ects,
                                        level: course.level,
                                        href: course.href,
                                        semester: course.semester,
                                        institution: course.institution,
                                        description: sourceArr[1][ix]
                                    }, course.name))
                            })
                        ]
                    })
                ]
            })
        ]
    });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GBLinUse);
const getStaticProps = _lib_util__WEBPACK_IMPORTED_MODULE_8__/* .getStaticPropsFolders */ .YX([
    "games",
    "courses"
]);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 6466:
/***/ ((module) => {

module.exports = require("@fortawesome/free-solid-svg-icons");

/***/ }),

/***/ 7197:
/***/ ((module) => {

module.exports = require("@fortawesome/react-fontawesome");

/***/ }),

/***/ 3901:
/***/ ((module) => {

module.exports = require("@uzh-bf/design-system");

/***/ }),

/***/ 8076:
/***/ ((module) => {

module.exports = require("gray-matter");

/***/ }),

/***/ 3280:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/app-router-context.js");

/***/ }),

/***/ 2796:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/head-manager-context.js");

/***/ }),

/***/ 4957:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/head.js");

/***/ }),

/***/ 4014:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/i18n/normalize-locale-path.js");

/***/ }),

/***/ 744:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/image-config-context.js");

/***/ }),

/***/ 5843:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/image-config.js");

/***/ }),

/***/ 8524:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/is-plain-object.js");

/***/ }),

/***/ 8020:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/mitt.js");

/***/ }),

/***/ 4406:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/page-path/denormalize-page-path.js");

/***/ }),

/***/ 4964:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router-context.js");

/***/ }),

/***/ 1751:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/add-path-prefix.js");

/***/ }),

/***/ 299:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/format-next-pathname-info.js");

/***/ }),

/***/ 3938:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/format-url.js");

/***/ }),

/***/ 9565:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/get-asset-path-from-route.js");

/***/ }),

/***/ 5789:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/get-next-pathname-info.js");

/***/ }),

/***/ 1428:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/is-dynamic.js");

/***/ }),

/***/ 8854:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/parse-path.js");

/***/ }),

/***/ 1292:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/parse-relative-url.js");

/***/ }),

/***/ 4567:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/path-has-prefix.js");

/***/ }),

/***/ 979:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/querystring.js");

/***/ }),

/***/ 3297:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/remove-trailing-slash.js");

/***/ }),

/***/ 6052:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/resolve-rewrites.js");

/***/ }),

/***/ 4226:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/route-matcher.js");

/***/ }),

/***/ 5052:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/route-regex.js");

/***/ }),

/***/ 9232:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/utils.js");

/***/ }),

/***/ 968:
/***/ ((module) => {

module.exports = require("next/head");

/***/ }),

/***/ 1853:
/***/ ((module) => {

module.exports = require("next/router");

/***/ }),

/***/ 6689:
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ 997:
/***/ ((module) => {

module.exports = require("react/jsx-runtime");

/***/ }),

/***/ 9961:
/***/ ((module) => {

module.exports = import("next-mdx-remote");;

/***/ }),

/***/ 4818:
/***/ ((module) => {

module.exports = import("next-mdx-remote/serialize");;

/***/ }),

/***/ 3991:
/***/ ((module) => {

module.exports = import("ramda");;

/***/ }),

/***/ 8097:
/***/ ((module) => {

module.exports = import("tailwind-merge");;

/***/ }),

/***/ 7147:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 1017:
/***/ ((module) => {

module.exports = require("path");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [952,61,33,764,871,296,602], () => (__webpack_exec__(168)));
module.exports = __webpack_exports__;

})();