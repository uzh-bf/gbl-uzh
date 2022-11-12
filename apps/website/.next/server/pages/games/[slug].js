"use strict";
(() => {
var exports = {};
exports.id = 560;
exports.ids = [560];
exports.modules = {

/***/ 6438:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ charts_RadarChart)
});

// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
;// CONCATENATED MODULE: external "recharts"
const external_recharts_namespaceObject = require("recharts");
;// CONCATENATED MODULE: ./src/components/charts/RadarChart.tsx


function RadarChart({ data  }) {
    return /*#__PURE__*/ jsx_runtime_.jsx(external_recharts_namespaceObject.ResponsiveContainer, {
        width: "100%",
        height: 150,
        children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)(external_recharts_namespaceObject.RadarChart, {
            outerRadius: 50,
            data: data,
            margin: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            },
            children: [
                /*#__PURE__*/ jsx_runtime_.jsx(external_recharts_namespaceObject.PolarGrid, {}),
                /*#__PURE__*/ jsx_runtime_.jsx(external_recharts_namespaceObject.PolarAngleAxis, {
                    fontSize: "0.8rem",
                    dataKey: "subject"
                }),
                /*#__PURE__*/ jsx_runtime_.jsx(external_recharts_namespaceObject.PolarRadiusAxis, {
                    angle: 30,
                    domain: [
                        0,
                        10
                    ]
                }),
                /*#__PURE__*/ jsx_runtime_.jsx(external_recharts_namespaceObject.Radar, {
                    dataKey: "value",
                    stroke: "#dc6027",
                    fill: "#dc6027",
                    fillOpacity: 0.3
                })
            ]
        })
    });
}
/* harmony default export */ const charts_RadarChart = (RadarChart);


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

/***/ }),

/***/ 5385:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "getStaticPaths": () => (/* binding */ getStaticPaths),
/* harmony export */   "getStaticProps": () => (/* binding */ getStaticProps)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_mdx_remote__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9961);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_markdown__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3135);
/* harmony import */ var _components_charts_RadarChart__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6438);
/* harmony import */ var _components_common_Header__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(9917);
/* harmony import */ var _components_common_Tag__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(6410);
/* harmony import */ var _components_common_Title__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(3173);
/* harmony import */ var _components_common_TitleImage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(1569);
/* harmony import */ var _components_Content__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(4121);
/* harmony import */ var _components_PageWithHeader__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(5865);
/* harmony import */ var _lib_util__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(871);
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(7197);
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(6466);
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var _uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(3901);
/* harmony import */ var _uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(_uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var next_image__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(5675);
/* harmony import */ var next_image__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(next_image__WEBPACK_IMPORTED_MODULE_15__);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([next_mdx_remote__WEBPACK_IMPORTED_MODULE_1__, react_markdown__WEBPACK_IMPORTED_MODULE_3__, _components_common_Header__WEBPACK_IMPORTED_MODULE_5__, _components_common_Tag__WEBPACK_IMPORTED_MODULE_6__, _components_common_Title__WEBPACK_IMPORTED_MODULE_7__, _components_common_TitleImage__WEBPACK_IMPORTED_MODULE_8__, _components_PageWithHeader__WEBPACK_IMPORTED_MODULE_10__, _lib_util__WEBPACK_IMPORTED_MODULE_11__]);
([next_mdx_remote__WEBPACK_IMPORTED_MODULE_1__, react_markdown__WEBPACK_IMPORTED_MODULE_3__, _components_common_Header__WEBPACK_IMPORTED_MODULE_5__, _components_common_Tag__WEBPACK_IMPORTED_MODULE_6__, _components_common_Title__WEBPACK_IMPORTED_MODULE_7__, _components_common_TitleImage__WEBPACK_IMPORTED_MODULE_8__, _components_PageWithHeader__WEBPACK_IMPORTED_MODULE_10__, _lib_util__WEBPACK_IMPORTED_MODULE_11__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);
















const components = {};
function Game({ source , frontMatter  }) {
    const radarChartData = frontMatter.radarCharts?.map((singleChart)=>{
        const temp = singleChart.content.map((item)=>({
                subject: item.name,
                value: +item.value
            }));
        return temp;
    });
    const radarChartTexts = frontMatter.radarCharts?.map((singleChart)=>singleChart.text);
    const { 0: zoom , 1: setZoom  } = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
    const { 0: zoomedImage , 1: setZoomedImage  } = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)({
        imgSrc: "images/hero.jpg",
        alt: "demo image"
    });
    function previousImage() {
        setZoomedImage(frontMatter.gallery[frontMatter.gallery.indexOf(zoomedImage) - 1]);
    }
    function nextImage() {
        setZoomedImage(frontMatter.gallery[frontMatter.gallery.indexOf(zoomedImage) + 1]);
    }
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "absolute w-screen",
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_components_PageWithHeader__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {
                    title: frontMatter.title,
                    children: [
                        frontMatter.thumbnail && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_TitleImage__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
                            imgSrc: frontMatter.thumbnail,
                            children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Title__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z, {
                                title: frontMatter.title
                            })
                        }),
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_components_Content__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z, {
                            children: [
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Header__WEBPACK_IMPORTED_MODULE_5__/* ["default"].H2 */ .Z.H2, {
                                    className: "mb-2 md:mb-4",
                                    align: "left",
                                    children: frontMatter.subtitle
                                }),
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                    className: "flex flex-col items-start md:flex-row",
                                    children: [
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                            className: "flex-1 pb-4 md:pb-0 md:pr-8",
                                            children: [
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                    className: "prose max-w-none",
                                                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(next_mdx_remote__WEBPACK_IMPORTED_MODULE_1__.MDXRemote, {
                                                        ...source,
                                                        components: components
                                                    })
                                                }),
                                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                    children: [
                                                        radarChartTexts?.[0] && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                            className: "flex-1 mt-8",
                                                            children: [
                                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Header__WEBPACK_IMPORTED_MODULE_5__/* ["default"].H3 */ .Z.H3, {
                                                                    children: "Characteristics"
                                                                }),
                                                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                                    className: "inline lg:flex lg:flex-row",
                                                                    children: [
                                                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                                            className: "flex-1 prose-sm prose",
                                                                            children: radarChartTexts[0]
                                                                        }),
                                                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                                            className: "flex-1 mt-3 mb-6 lg:mt-0",
                                                                            children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_charts_RadarChart__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
                                                                                data: radarChartData[0]
                                                                            })
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        radarChartTexts?.[1] && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                            className: "flex-1 mt-4",
                                                            children: [
                                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Header__WEBPACK_IMPORTED_MODULE_5__/* ["default"].H3 */ .Z.H3, {
                                                                    children: "Gamification Elements"
                                                                }),
                                                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                                    className: "inline lg:flex lg:flex-row",
                                                                    children: [
                                                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                                            className: "flex-1 prose-sm prose",
                                                                            children: radarChartTexts[1]
                                                                        }),
                                                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                                            className: "flex-1 mt-3 mb-6 lg:mt-0",
                                                                            children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_charts_RadarChart__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
                                                                                data: radarChartData[1]
                                                                            })
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        frontMatter.gallery && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                            className: "justify-center flex-1 mt-8",
                                                            children: [
                                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Header__WEBPACK_IMPORTED_MODULE_5__/* ["default"].H3 */ .Z.H3, {
                                                                    children: "Gallery"
                                                                }),
                                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                                    className: "container grid grid-cols-3 gap-2 mx-auto sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4",
                                                                    children: frontMatter.gallery?.map((image)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                                            className: "m-auto rounded hover:opacity-70",
                                                                            children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                                                className: "inline-block bg-center bg-cover rounded shadow-md cursor-[zoom-in] w-[28vw] h-[28vw] sm:w-28 sm:h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:h-36 lg:h-36",
                                                                                style: {
                                                                                    backgroundImage: 'url("' + image.imgSrc + '")'
                                                                                },
                                                                                onClick: ()=>{
                                                                                    setZoomedImage(image);
                                                                                    setZoom(true);
                                                                                }
                                                                            })
                                                                        }, frontMatter.gallery.indexOf(image)))
                                                                })
                                                            ]
                                                        }),
                                                        frontMatter.resources && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                            className: "flex-1 mt-8",
                                                            children: [
                                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Header__WEBPACK_IMPORTED_MODULE_5__/* ["default"].H3 */ .Z.H3, {
                                                                    children: "Resources"
                                                                }),
                                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                                    className: "inline md:flex md:flex-row",
                                                                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("ul", {
                                                                        children: frontMatter.resources.map((item)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("li", {
                                                                                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("a", {
                                                                                    className: "flex flex-row items-center hover:text-uzh-red-100",
                                                                                    target: "_blank",
                                                                                    href: item.href,
                                                                                    rel: "noreferrer",
                                                                                    children: [
                                                                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_12__.FontAwesomeIcon, {
                                                                                            icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_13__.faBarChart,
                                                                                            className: "h-4 mr-1"
                                                                                        }),
                                                                                        item.name
                                                                                    ]
                                                                                })
                                                                            }, item.name))
                                                                    })
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                            className: "flex-1 p-4 border rounded md:flex-initial md:w-96 bg-uzh-grey-20 md:max-w-[33%] lg:max-w-full",
                                            children: [
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Header__WEBPACK_IMPORTED_MODULE_5__/* ["default"].H3 */ .Z.H3, {
                                                    className: "!text-gray-600",
                                                    children: "Learning Objectives"
                                                }),
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                    className: "prose-sm prose",
                                                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("ul", {
                                                        children: frontMatter.objectives?.map((item)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("li", {
                                                                children: item
                                                            }, item))
                                                    })
                                                }),
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Header__WEBPACK_IMPORTED_MODULE_5__/* ["default"].H3 */ .Z.H3, {
                                                    className: "mt-6 !text-gray-600",
                                                    children: "Keywords"
                                                }),
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                    className: "flex flex-row flex-wrap justify-center gap-1 md:justify-start",
                                                    children: frontMatter.keywords?.map((item)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Tag__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {
                                                            label: item
                                                        }, item))
                                                }),
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Header__WEBPACK_IMPORTED_MODULE_5__/* ["default"].H3 */ .Z.H3, {
                                                    className: "mt-6 !text-gray-600",
                                                    children: "Languages"
                                                }),
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                                    className: "flex flex-row flex-wrap justify-center gap-1 md:justify-start",
                                                    children: frontMatter.language?.map((item)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Tag__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {
                                                            label: item
                                                        }, item))
                                                }),
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Header__WEBPACK_IMPORTED_MODULE_5__/* ["default"].H3 */ .Z.H3, {
                                                    className: "mt-6 !text-gray-600",
                                                    children: "Imprint"
                                                }),
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(react_markdown__WEBPACK_IMPORTED_MODULE_3__["default"], {
                                                    className: "prose-sm prose text-center md:text-left",
                                                    children: frontMatter.imprint
                                                }),
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Header__WEBPACK_IMPORTED_MODULE_5__/* ["default"].H3 */ .Z.H3, {
                                                    className: "mt-6 !text-gray-600",
                                                    children: "Contact"
                                                }),
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(react_markdown__WEBPACK_IMPORTED_MODULE_3__["default"], {
                                                    className: "prose-sm prose text-center md:text-left",
                                                    children: frontMatter.contact
                                                }),
                                                frontMatter["usedIn"] && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
                                                    children: [
                                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_common_Header__WEBPACK_IMPORTED_MODULE_5__/* ["default"].H3 */ .Z.H3, {
                                                            className: "mt-6 !text-gray-600",
                                                            children: "Used In"
                                                        }),
                                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("ul", {
                                                            children: frontMatter["usedIn"].map((course)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("li", {
                                                                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                                        className: "prose-sm prose text-center md:text-left",
                                                                        children: course.name
                                                                    })
                                                                }, course.name))
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            }),
            frontMatter.gallery && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_uzh_bf_design_system__WEBPACK_IMPORTED_MODULE_14__.Modal, {
                open: zoom,
                onClose: ()=>setZoom(false),
                onNext: frontMatter.gallery.indexOf(zoomedImage) < frontMatter.gallery.length - 1 ? nextImage : undefined,
                onPrev: frontMatter.gallery.indexOf(zoomedImage) > 0 ? previousImage : undefined,
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                    className: "flex flex-col items-center justify-center w-full h-full",
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "relative w-full h-full max-h-[15rem]",
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_image__WEBPACK_IMPORTED_MODULE_15___default()), {
                            src: zoomedImage.imgSrc,
                            alt: "Magnified Image",
                            layout: "fill",
                            objectFit: "contain"
                        })
                    })
                })
            })
        ]
    });
}
const getStaticProps = _lib_util__WEBPACK_IMPORTED_MODULE_11__/* .getStaticProps */ .b1("games");
const getStaticPaths = _lib_util__WEBPACK_IMPORTED_MODULE_11__/* .getStaticPaths */ .Fe("games");
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Game);

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

/***/ 3135:
/***/ ((module) => {

module.exports = import("react-markdown");;

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
var __webpack_require__ = require("../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [952,61,33,764,871,569], () => (__webpack_exec__(5385)));
module.exports = __webpack_exports__;

})();