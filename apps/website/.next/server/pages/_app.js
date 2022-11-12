(() => {
var exports = {};
exports.id = 888;
exports.ids = [888];
exports.modules = {

/***/ 5645:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ _app)
});

// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
// EXTERNAL MODULE: external "@socialgouv/matomo-next"
var matomo_next_ = __webpack_require__(3215);
// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(6689);
;// CONCATENATED MODULE: external "@fortawesome/fontawesome-svg-core"
const fontawesome_svg_core_namespaceObject = require("@fortawesome/fontawesome-svg-core");
// EXTERNAL MODULE: external "@uzh-bf/design-system"
var design_system_ = __webpack_require__(3901);
// EXTERNAL MODULE: ./node_modules/@fortawesome/fontawesome-svg-core/styles.css
var styles = __webpack_require__(5800);
;// CONCATENATED MODULE: ./src/pages/_app.tsx






fontawesome_svg_core_namespaceObject.config.autoAddCss = false;

const MATOMO_URL = "https://webstats.uzh.ch/";
const MATOMO_SITE_ID = "419";
function App({ Component , pageProps  }) {
    (0,external_react_.useEffect)(()=>{
        if (MATOMO_URL && MATOMO_SITE_ID) {
            (0,matomo_next_.init)({
                url: MATOMO_URL,
                siteId: MATOMO_SITE_ID
            });
        }
    }, []);
    return /*#__PURE__*/ jsx_runtime_.jsx(design_system_.ThemeProvider, {
        theme: {},
        children: /*#__PURE__*/ jsx_runtime_.jsx(Component, {
            ...pageProps
        })
    });
}
/* harmony default export */ const _app = (App);


/***/ }),

/***/ 5800:
/***/ (() => {



/***/ }),

/***/ 3215:
/***/ ((module) => {

"use strict";
module.exports = require("@socialgouv/matomo-next");

/***/ }),

/***/ 3901:
/***/ ((module) => {

"use strict";
module.exports = require("@uzh-bf/design-system");

/***/ }),

/***/ 6689:
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ 997:
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(5645));
module.exports = __webpack_exports__;

})();