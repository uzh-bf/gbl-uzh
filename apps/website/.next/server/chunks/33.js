"use strict";
exports.id = 33;
exports.ids = [33];
exports.modules = {

/***/ 5407:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"src":"/_next/static/media/GBLUZH.15afae0e.png","height":115,"width":373,"blurDataURL":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAIAAADq9gq6AAAAN0lEQVR42gVAMQoAIAjs/y/zA06eikO4uFU0SBCjqpi5uwGYWURAJOcc4UZEa293V1WBVua75wMk3SqF8BNYvwAAAABJRU5ErkJggg=="});

/***/ }),

/***/ 6670:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ components_Footer)
});

// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
// EXTERNAL MODULE: external "@fortawesome/free-solid-svg-icons"
var free_solid_svg_icons_ = __webpack_require__(6466);
// EXTERNAL MODULE: external "@fortawesome/react-fontawesome"
var react_fontawesome_ = __webpack_require__(7197);
// EXTERNAL MODULE: ./node_modules/next/image.js
var next_image = __webpack_require__(5675);
var image_default = /*#__PURE__*/__webpack_require__.n(next_image);
// EXTERNAL MODULE: ./node_modules/next/link.js
var next_link = __webpack_require__(1664);
var link_default = /*#__PURE__*/__webpack_require__.n(next_link);
;// CONCATENATED MODULE: ./public/images/logo_swissuniversities.png
/* harmony default export */ const logo_swissuniversities = ({"src":"/_next/static/media/logo_swissuniversities.052790c4.png","height":177,"width":899,"blurDataURL":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAAN0lEQVR4nB2JwQ0AIAwCocb9t/Tr21SLKARIOK4xpCrQRgRUB1/vaw3MOaW9AYZj4KK3MhG94wJcyRWbtk1AxgAAAABJRU5ErkJggg=="});
;// CONCATENATED MODULE: ./public/images/logo_uzh.jpeg
/* harmony default export */ const logo_uzh = ({"src":"/_next/static/media/logo_uzh.2ff52b56.jpeg","height":266,"width":777,"blurDataURL":"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoKCgoKCgsMDAsPEA4QDxYUExMUFiIYGhgaGCIzICUgICUgMy03LCksNy1RQDg4QFFeT0pPXnFlZXGPiI+7u/sBCgoKCgoKCwwMCw8QDhAPFhQTExQWIhgaGBoYIjMgJSAgJSAzLTcsKSw3LVFAODhAUV5PSk9ecWVlcY+Ij7u7+//CABEIAAMACAMBIgACEQEDEQH/xAAnAAEBAAAAAAAAAAAAAAAAAAAABwEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAArIP/xAAbEAEAAAcAAAAAAAAAAAAAAAACAAEEERJBQv/aAAgBAQABPwCmEmjlfrcf/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwB//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwB//9k="});
// EXTERNAL MODULE: ./src/lib/loader.ts
var loader = __webpack_require__(4800);
;// CONCATENATED MODULE: ./src/components/Footer.tsx








function Footer() {
    return /*#__PURE__*/ jsx_runtime_.jsx("footer", {
        className: "z-10 mt-8 text-sm text-gray-600 border-t-2 bg-uzh-grey-20 border-uzh-red-100 border-top md:text-base",
        children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
            className: "flex flex-col justify-between flex-initial max-w-6xl px-4 py-16 m-auto md:px-8 md:flex-row",
            children: [
                /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                    className: "flex flex-col items-center order-1 mb-4 md:order-2 md:flex-row md:mb-0",
                    children: [
                        /*#__PURE__*/ jsx_runtime_.jsx("a", {
                            href: "https://www.uzh.ch",
                            target: "_blank",
                            rel: "noreferrer",
                            children: /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: "relative w-40 h-20 p-4 mb-3 bg-white border md:mb-0 md:mr-8",
                                children: /*#__PURE__*/ jsx_runtime_.jsx((image_default()), {
                                    placeholder: "blur",
                                    loader: loader/* default */.Z,
                                    layout: "intrinsic",
                                    src: logo_uzh,
                                    alt: "UZH Logo"
                                })
                            })
                        }),
                        /*#__PURE__*/ jsx_runtime_.jsx("a", {
                            href: "https://www.swissuniversities.ch",
                            target: "_blank",
                            rel: "noreferrer",
                            children: /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: "flex items-center w-40 h-20 p-4 bg-white border",
                                children: /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                    className: "relative w-full",
                                    children: /*#__PURE__*/ jsx_runtime_.jsx((image_default()), {
                                        placeholder: "blur",
                                        loader: loader/* default */.Z,
                                        layout: "intrinsic",
                                        src: logo_swissuniversities,
                                        alt: "Swissuniversities Logo"
                                    })
                                })
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                    className: "order-2 prose-sm prose text-center text-gray-600 md:order-1 md:text-left",
                    children: [
                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "flex flex-row items-center",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx(react_fontawesome_.FontAwesomeIcon, {
                                    icon: free_solid_svg_icons_.faBook,
                                    className: "w-6 text-gray-500"
                                }),
                                /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                    className: "ml-4",
                                    children: [
                                        /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                            className: "font-bold",
                                            children: "GBL @ UZH"
                                        }),
                                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ jsx_runtime_.jsx("a", {
                                                    href: "https://www.bf.uzh.ch",
                                                    target: "_blank",
                                                    rel: "noreferrer",
                                                    children: "Department of Banking and Finance"
                                                }),
                                                ", University of Zurich"
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "flex flex-row items-center mt-4",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx(react_fontawesome_.FontAwesomeIcon, {
                                    icon: free_solid_svg_icons_.faCode,
                                    className: "w-6 text-gray-500"
                                }),
                                /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                    className: "ml-4",
                                    children: [
                                        "The GBL Website and Knowledge Base are being developed in public.",
                                        /*#__PURE__*/ jsx_runtime_.jsx("br", {}),
                                        "Have a look at our source code on",
                                        " ",
                                        /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                                            href: "https://github.com/uzh-bf/gbl-uzh",
                                            passHref: true,
                                            children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                                                target: "_blank",
                                                children: "Github"
                                            })
                                        }),
                                        "."
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "flex flex-row items-center mt-4",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx(react_fontawesome_.FontAwesomeIcon, {
                                    icon: free_solid_svg_icons_.faMailBulk,
                                    className: "w-6 text-gray-500"
                                }),
                                /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                    className: "ml-4",
                                    children: [
                                        /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                                            href: "/about",
                                            passHref: true,
                                            children: "Contact Us"
                                        }),
                                        " ",
                                        "or provide feedback on our",
                                        " ",
                                        /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                                            href: "https://gbl-uzh.feedbear.com/roadmap",
                                            passHref: true,
                                            children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                                                target: "_blank",
                                                children: "Public Roadmap"
                                            })
                                        }),
                                        "."
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    });
}
/* harmony default export */ const components_Footer = (Footer);


/***/ }),

/***/ 3614:
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
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1664);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1853);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _public_images_GBLUZH_png__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(5407);
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(7197);
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(6466);
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_8__);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([tailwind_merge__WEBPACK_IMPORTED_MODULE_1__]);
tailwind_merge__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];









const NAVIGATION_ITEMS = [
    {
        href: "/games",
        label: "GBL in Use"
    },
    {
        href: "/kb",
        label: "Knowledge Base"
    },
    {
        href: "/dev",
        label: "Development"
    },
    {
        href: "/roadmap",
        label: "Roadmap"
    },
    // { href: '/resources', label: 'Resources' },
    {
        href: "/about",
        label: "About"
    }, 
];
function NavigationItem({ isActive , children , href  }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_3___default()), {
        href: href,
        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("a", {
            className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)("flex-1 p-1 mb-1 ml-3 mr-3 text-left text-sm text-gray-500 hover:text-uzh-blue-80 hover:cursor-pointer md:flex-initial md:ml-0 md:mb-0 md:mr-2 md:p-2 md:last:mr-0 last:mb-0 border-b-2 md:border-b-0 md:border-t-4", isActive && "border-uzh-red-100 text-gray-800 font-bold"),
            children: children
        })
    });
}
NavigationItem.defaultProps = {
    isActive: false
};
function Navigation({ isOpen  }) {
    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_4__.useRouter)();
    const mobileMenu = /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("nav", {
        className: "flex flex-col order-1 mt-8 md:hidden",
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(NavigationItem, {
                isActive: router.pathname === "/",
                href: "/",
                children: "Home"
            }),
            NAVIGATION_ITEMS.map(({ href , label  })=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(NavigationItem, {
                    isActive: router.pathname.includes(href),
                    href: href,
                    children: label
                }, href))
        ]
    });
    const mobileMenuDrawer = (isOpen)=>{
        if (isOpen) {
            return mobileMenu;
        } else {
            return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {});
        }
    };
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("nav", {
                className: "flex-col order-1 hidden mt-8 md:order-2 md:flex-row md:flex",
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(NavigationItem, {
                        isActive: router.pathname === "/",
                        href: "/",
                        children: "Home"
                    }),
                    NAVIGATION_ITEMS.map(({ href , label  })=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(NavigationItem, {
                            isActive: router.pathname.includes(href),
                            href: href,
                            children: label
                        }, href))
                ]
            }),
            mobileMenuDrawer(isOpen)
        ]
    });
}
Navigation.defaultProps = {
    isOpen: false
};
function Logo() {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_3___default()), {
        href: "/",
        passHref: true,
        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("a", {
            className: "flex-1 md:pl-8",
            children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "relative w-full h-20 md:w-56 md:h-full",
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_image__WEBPACK_IMPORTED_MODULE_2___default()), {
                    src: _public_images_GBLUZH_png__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z,
                    alt: "Logo",
                    layout: "fill",
                    objectFit: "contain",
                    priority: true
                })
            })
        })
    });
}
function PageHead() {
    const { 0: isOpen , 1: setOpen  } = (0,react__WEBPACK_IMPORTED_MODULE_5__.useState)(false);
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("header", {
        className: "flex flex-col justify-between max-w-6xl pt-4 m-auto md:flex-row",
        children: [
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: "relative flex items-center md:items-stretch",
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Logo, {}),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_7__.FontAwesomeIcon, {
                        icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_8__.faHamburger,
                        className: "absolute right-0 w-10 mr-4 hover:cursor-pointer md:hidden",
                        onClick: ()=>setOpen(!isOpen)
                    })
                ]
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "flex flex-col justify-between flex-initial md:items-end md:border-none md:pr-8",
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Navigation, {
                    isOpen: isOpen
                })
            })
        ]
    });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PageHead);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 5865:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(968);
/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Footer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6670);
/* harmony import */ var _PageHead__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3614);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_PageHead__WEBPACK_IMPORTED_MODULE_3__]);
_PageHead__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];




const defaultProps = {
    withFooter: true
};
function PageWithHeader({ title , children , withFooter  }) {
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_head__WEBPACK_IMPORTED_MODULE_1___default()), {
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("title", {
                    children: [
                        "GBL@UZH - ",
                        title
                    ]
                })
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: "flex-1 w-full",
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_PageHead__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {}),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "h-full md:border-t-2 border-uzh-red-100",
                        children: children
                    })
                ]
            }),
            withFooter && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_Footer__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {})
        ]
    });
}
PageWithHeader.defaultProps = defaultProps;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PageWithHeader);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 3173:
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


function Title({ title , isCentered , className , size  }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
        className: "max-w-6xl m-auto",
        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h1", {
            className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)("font-kollektif font-bold  lg:pl-8", isCentered ? "text-center" : "text-left", size === "medium" && "text-2xl sm:text-3xl lg:text-4xl", size === "large" && "text-3xl sm:text-4xl lg:text-5xl", className),
            children: title
        })
    });
}
Title.defaultProps = {
    isCentered: false,
    size: "medium"
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Title);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 5833:
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


function TitleBackground({ children , className  }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
        className: (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)("w-full shadow bg-uzh-grey-20", className || "p-8"),
        children: children
    });
}
TitleBackground.defaultProps = {
    className: undefined
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TitleBackground);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 4800:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function loader({ src , width  }) {
    return src;
    // TODO: fix loader
    const sizes = [
        32,
        64,
        128,
        256,
        384,
        640,
        828,
        1200,
        1920,
        3840
    ].reverse();
    const pathSegments = src.split("/");
    const basePath = pathSegments.slice(0, -1).join("/");
    const fileName = pathSegments.slice(-1).join("");
    if (fileName.includes(".svg")) {
        return src;
    }
    // check whether there is a compatible responsive version of the image
    // if so, return the responsive variant as a new source
    let matchingImagePath = src;
    sizes.forEach((size)=>{
        if (width <= size) {
            matchingImagePath = `${basePath}/responsive_${size}/${fileName}`;
        }
    });
    // fallback to the original image source
    return matchingImagePath;
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (loader);


/***/ })

};
;