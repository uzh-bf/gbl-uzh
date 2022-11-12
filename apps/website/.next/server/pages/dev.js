"use strict";
(() => {
var exports = {};
exports.id = 775;
exports.ids = [775];
exports.modules = {

/***/ 2906:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6466);
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7197);
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3901);
/* harmony import */ var _uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var tailwind_merge__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(8097);
/* harmony import */ var _Header__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(9917);
/* harmony import */ var _VideoWithSummary__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(9920);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([tailwind_merge__WEBPACK_IMPORTED_MODULE_4__, _Header__WEBPACK_IMPORTED_MODULE_5__, _VideoWithSummary__WEBPACK_IMPORTED_MODULE_6__]);
([tailwind_merge__WEBPACK_IMPORTED_MODULE_4__, _Header__WEBPACK_IMPORTED_MODULE_5__, _VideoWithSummary__WEBPACK_IMPORTED_MODULE_6__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);







const defaultProps = {
    isOpen: false,
    onNext: undefined,
    onPrevious: undefined,
    resources: undefined,
    videoSrc: undefined,
    duration: undefined,
    keyTakeaways: undefined
};
function Panel({ title , videoSrc , duration , keyTakeaways , resources , isOpen , isCompleted , onNext , onPrevious , onActivate , children  }) {
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        className: "mt-4",
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                className: "w-full p-4 border rounded bg-uzh-grey-20 hover:shadow",
                onClick: onActivate,
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                    className: "flex flex-row items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_Header__WEBPACK_IMPORTED_MODULE_5__/* ["default"].H2 */ .Z.H2, {
                                    className: "flex-1 !mb-0 !text-left",
                                    children: title
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                    className: "text-left text-gray-700",
                                    children: duration
                                })
                            ]
                        }),
                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                            className: "flex-initial w-6",
                            children: isCompleted && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2__.FontAwesomeIcon, {
                                icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_1__.faCheck
                            })
                        })
                    ]
                })
            }),
            isOpen && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: "p-4 border border-t-0",
                children: [
                    videoSrc && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_VideoWithSummary__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {
                        title: title,
                        videoSrc: videoSrc,
                        keyTakeaways: keyTakeaways,
                        children: children
                    }),
                    !videoSrc && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                        className: "block prose text-justify max-w-none",
                        children: children
                    }),
                    Array.isArray(resources) && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_4__.twMerge)("mt-4", videoSrc && "pt-4 border-t"),
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                            className: "flex flex-col md:flex-row",
                            children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "flex-1",
                                children: [
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                        className: "font-bold",
                                        children: "Resources"
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("ul", {
                                        children: resources.map((item)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("li", {
                                                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("a", {
                                                    className: "flex flex-row items-center gap-1 hover:text-uzh-red-100",
                                                    target: "_blank",
                                                    href: item.href,
                                                    rel: "noreferrer",
                                                    children: [
                                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2__.FontAwesomeIcon, {
                                                            icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_1__.faBarChart,
                                                            className: "h-4 mr-1"
                                                        }),
                                                        item.name
                                                    ]
                                                })
                                            }, item.name))
                                    })
                                ]
                            })
                        })
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "flex justify-between pt-4 mt-4 border-t",
                        children: [
                            onPrevious && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_3__.Button, {
                                onClick: onPrevious,
                                children: [
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_3__.Button.Icon, {
                                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2__.FontAwesomeIcon, {
                                            icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_1__.faArrowLeft
                                        })
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_3__.Button.Label, {
                                        children: "Previous Module"
                                    })
                                ]
                            }),
                            onNext && !onPrevious && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
                                children: [
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                        className: "flex-1"
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_3__.Button, {
                                        onClick: onNext,
                                        children: [
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_3__.Button.Label, {
                                                children: "Next Module"
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_3__.Button.Icon, {
                                                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2__.FontAwesomeIcon, {
                                                    icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_1__.faArrowRight
                                                })
                                            })
                                        ]
                                    })
                                ]
                            }),
                            onNext && !!onPrevious && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_3__.Button, {
                                onClick: onNext,
                                children: [
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_3__.Button.Label, {
                                        children: "Next Module"
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_3__.Button.Icon, {
                                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2__.FontAwesomeIcon, {
                                            icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_1__.faArrowRight
                                        })
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
}
Panel.defaultProps = defaultProps;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Panel);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 9920:
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


function VideoWithSummary({ title , videoSrc , children , keyTakeaways  }) {
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                className: "hidden prose text-justify max-w-none md:block",
                children: children
            }),
            videoSrc && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: "flex flex-col justify-between mt-4 md:flex-row",
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "flex-initial w-full border rounded shadow h-80 md:flex-1",
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("iframe", {
                            title: title,
                            width: "100%",
                            height: "100%",
                            src: videoSrc,
                            frameBorder: "0",
                            allow: "fullscreen",
                            allowFullScreen: true
                        })
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "flex-1 mt-4 md:mt-0 md:pl-6",
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                className: "prose text-justify max-w-none md:hidden mb-5",
                                children: children
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                className: "prose",
                                children: Array.isArray(keyTakeaways) ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("ul", {
                                    className: "!mt-0",
                                    children: keyTakeaways.map((item, ix)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("li", {
                                            className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)(ix === 0 && "!mt-0"),
                                            children: item
                                        }, item))
                                }) : /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                    className: "relative",
                                    children: keyTakeaways
                                })
                            })
                        ]
                    })
                ]
            })
        ]
    });
}
VideoWithSummary.defaultProps = {
    videoSrc: undefined,
    keyTakeaways: undefined
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VideoWithSummary);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 6584:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "getStaticProps": () => (/* binding */ getStaticProps)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _socialgouv_matomo_next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3215);
/* harmony import */ var _socialgouv_matomo_next__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_socialgouv_matomo_next__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var next_image__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5675);
/* harmony import */ var next_image__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_image__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_common_Panel__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2906);
/* harmony import */ var _components_common_Title__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(3173);
/* harmony import */ var _components_common_TitleBackground__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(5833);
/* harmony import */ var _components_Content__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(4121);
/* harmony import */ var _components_PageWithHeader__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(5865);
/* harmony import */ var _lib_loader__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(4800);
/* harmony import */ var _lib_util__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(871);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_components_common_Panel__WEBPACK_IMPORTED_MODULE_4__, _components_common_Title__WEBPACK_IMPORTED_MODULE_5__, _components_common_TitleBackground__WEBPACK_IMPORTED_MODULE_6__, _components_PageWithHeader__WEBPACK_IMPORTED_MODULE_8__, _lib_util__WEBPACK_IMPORTED_MODULE_9__]);
([_components_common_Panel__WEBPACK_IMPORTED_MODULE_4__, _components_common_Title__WEBPACK_IMPORTED_MODULE_5__, _components_common_TitleBackground__WEBPACK_IMPORTED_MODULE_6__, _components_PageWithHeader__WEBPACK_IMPORTED_MODULE_8__, _lib_util__WEBPACK_IMPORTED_MODULE_9__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);











function DevelopmentWorkflow({ sourceArr , frontMatterArr , filenames , fileMissingArr  }) {
    const { 0: activePanel , 1: setActivePanel  } = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(0);
    (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(()=>{
        (0,_socialgouv_matomo_next__WEBPACK_IMPORTED_MODULE_1__.push)([
            "trackEvent",
            "GBL Workflow",
            "Panel Activated",
            activePanel
        ]);
    }, [
        activePanel
    ]);
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_components_PageWithHeader__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
        title: "Game Development",
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_TitleBackground__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Title__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {
                    title: "Game Development"
                })
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_Content__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z, {
                children: frontMatterArr.map((module)=>{
                    const keyTakeaways = ()=>{
                        if (module.keyTakeawayList) {
                            return module.keyTakeawayList;
                        } else {
                            return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_image__WEBPACK_IMPORTED_MODULE_2___default()), {
                                // placeholder="blur"
                                loader: _lib_loader__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z,
                                src: module.keyTakeawayImage.src,
                                alt: module.title,
                                width: module.keyTakeawayImage.width,
                                height: module.keyTakeawayImage.height
                            });
                        }
                    };
                    const index = frontMatterArr.indexOf(module);
                    if (index < 1) {
                        return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Panel__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
                            duration: module.duration,
                            isOpen: activePanel === index,
                            isCompleted: activePanel > index,
                            title: module.title,
                            videoSrc: module.videoSrc,
                            keyTakeaways: keyTakeaways(),
                            resources: module.resources.map((resource)=>({
                                    name: resource.name,
                                    href: resource.href
                                })),
                            onNext: ()=>setActivePanel(index + 1),
                            onActivate: ()=>setActivePanel(index),
                            children: module.description
                        }, index);
                    } else if (index == frontMatterArr.length - 1) {
                        return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Panel__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
                            duration: module.duration,
                            isOpen: activePanel === index,
                            isCompleted: activePanel > index,
                            title: module.title,
                            videoSrc: module.videoSrc,
                            keyTakeaways: keyTakeaways(),
                            resources: module.resources.map((resource)=>({
                                    name: resource.name,
                                    href: resource.href
                                })),
                            onPrevious: ()=>setActivePanel(index - 1),
                            onActivate: ()=>setActivePanel(index),
                            children: module.description
                        }, index);
                    } else {
                        return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Panel__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
                            duration: module.duration,
                            isOpen: activePanel === index,
                            isCompleted: activePanel > index,
                            title: module.title,
                            videoSrc: module.videoSrc,
                            keyTakeaways: keyTakeaways(),
                            resources: module.resources.map((resource)=>({
                                    name: resource.name,
                                    href: resource.href
                                })),
                            onNext: ()=>setActivePanel(index + 1),
                            onPrevious: ()=>setActivePanel(index - 1),
                            onActivate: ()=>setActivePanel(index),
                            children: module.description
                        }, index);
                    }
                })
            })
        ]
    });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DevelopmentWorkflow);
const getStaticProps = _lib_util__WEBPACK_IMPORTED_MODULE_9__/* .getStaticPropsFolder */ .Ct("workflow", "resources", "GBL Toolbox");

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

/***/ 3215:
/***/ ((module) => {

module.exports = require("@socialgouv/matomo-next");

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

/***/ 4818:
/***/ ((module) => {

module.exports = import("next-mdx-remote/serialize");;

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
var __webpack_exports__ = __webpack_require__.X(0, [952,61,33,764,871], () => (__webpack_exec__(6584)));
module.exports = __webpack_exports__;

})();