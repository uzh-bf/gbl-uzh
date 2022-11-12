"use strict";
exports.id = 871;
exports.ids = [871];
exports.modules = {

/***/ 871:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Ct": () => (/* binding */ getStaticPropsFolder),
/* harmony export */   "Fe": () => (/* binding */ getStaticPaths),
/* harmony export */   "YX": () => (/* binding */ getStaticPropsFolders),
/* harmony export */   "b1": () => (/* binding */ getStaticProps)
/* harmony export */ });
/* unused harmony export getStaticPropsSinglePage */
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7147);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var gray_matter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8076);
/* harmony import */ var gray_matter__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(gray_matter__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var next_mdx_remote_serialize__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4818);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1017);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_3__);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([next_mdx_remote_serialize__WEBPACK_IMPORTED_MODULE_2__]);
next_mdx_remote_serialize__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];




function getStaticProps(dir_name) {
    return async ({ params  })=>{
        // slugs come in like "portfolio-management-game"
        // but we want to read from files like "Portfolio Management Game.md"
        const filenameTitleCase = params.slug.trim().replace(/-/g, " ").toLowerCase()// all independent words should begin with a capital character
        .replace(/\w\S*/g, (w)=>w.replace(/^\w/, (c)=>c.toUpperCase()));
        const mdxPath = path__WEBPACK_IMPORTED_MODULE_3___default().join(process.cwd(), `../kb/${dir_name}/${filenameTitleCase}.md`);
        const source = fs__WEBPACK_IMPORTED_MODULE_0___default().readFileSync(mdxPath);
        const { content , data  } = gray_matter__WEBPACK_IMPORTED_MODULE_1___default()(source);
        const mdxSource = await (0,next_mdx_remote_serialize__WEBPACK_IMPORTED_MODULE_2__.serialize)(content);
        return {
            props: {
                source: mdxSource,
                frontMatter: data
            }
        };
    };
}
function getStaticPaths(dir_name) {
    return async ()=>{
        const paths = fs__WEBPACK_IMPORTED_MODULE_0___default().readdirSync(path__WEBPACK_IMPORTED_MODULE_3___default().join(process.cwd(), `../kb/${dir_name}/`)).filter((p)=>/\.md?$/.test(p)).map((p)=>p.replace(/\.md?$/, "").replace(/\s/g, "-").toLowerCase()).map((slug)=>({
                params: {
                    slug
                }
            }));
        return {
            paths,
            fallback: false
        };
    };
}
function getStaticPropsSinglePage(dir_name, slug) {
    return async ()=>{
        const mdxPath = path.join(process.cwd(), `../kb/${dir_name}/${slug}.md`);
        const source = fs.readFileSync(mdxPath);
        const { content , data  } = matter(source);
        const mdxSource = await serialize(content);
        return {
            props: {
                source: mdxSource,
                frontMatter: data
            }
        };
    };
}
// getStaticProps function to parse all files within one folder
function getStaticPropsFolder(folder, parentfile_dir, parentfile) {
    return async ()=>{
        let mdxSources = new Array();
        let dataHandles = new Array();
        let fileMissingArr = new Array();
        let slugArr = [];
        // get filenames directly from parent config list (including correct order)
        if (parentfile_dir && parentfile) {
            const mdxPathParent = path__WEBPACK_IMPORTED_MODULE_3___default().join(process.cwd(), `../kb/${parentfile_dir}/${parentfile}.md`);
            const sourceParent = fs__WEBPACK_IMPORTED_MODULE_0___default().readFileSync(mdxPathParent);
            slugArr = gray_matter__WEBPACK_IMPORTED_MODULE_1___default()(sourceParent).data.childrenFiles.map((filename)=>filename.name);
        } else {
            slugArr = fs__WEBPACK_IMPORTED_MODULE_0___default().readdirSync("../kb/" + folder).map((item)=>item.split(".")[0]);
        }
        for(let i = 0; i < slugArr.length; i++){
            const mdxPath = path__WEBPACK_IMPORTED_MODULE_3___default().join(process.cwd(), `../kb/${folder}/${slugArr[i]}.md`);
            let source;
            try {
                source = fs__WEBPACK_IMPORTED_MODULE_0___default().readFileSync(mdxPath);
                fileMissingArr.push(false);
            } catch (e) {
                source = Buffer.from("no data available");
                fileMissingArr.push(true);
            }
            const { content , data  } = gray_matter__WEBPACK_IMPORTED_MODULE_1___default()(source);
            dataHandles.push(data);
            let temp2 = await (0,next_mdx_remote_serialize__WEBPACK_IMPORTED_MODULE_2__.serialize)(content);
            mdxSources.push(temp2);
        }
        // order based on ordering attribute, if one is available
        let outputArr = new Array(dataHandles.length);
        if (dataHandles[0].order) {
            dataHandles.forEach((element)=>outputArr.splice(element.order, 1, element));
        } else {
            outputArr = [
                ...dataHandles
            ];
        }
        return {
            props: {
                sourceArr: mdxSources,
                frontMatterArr: parentfile_dir && parentfile ? dataHandles : outputArr,
                filenames: slugArr,
                fileMissingArr: fileMissingArr
            }
        };
    };
}
// getStaticPropsFunction to parse the content of multiple folders
function getStaticPropsFolders(folders) {
    return async ()=>{
        let mdxSources = new Array();
        let dataHandlesArr = new Array();
        let fileMissingArr = new Array();
        const slugArrs = folders.map((folder)=>fs__WEBPACK_IMPORTED_MODULE_0___default().readdirSync("../kb/" + folder).map((item)=>item.split(".")[0]));
        // attention: for loop is required in order to enable async functions such as 'serialize'
        for(let k = 0; k < slugArrs.length; k++){
            mdxSources[k] = new Array();
            dataHandlesArr[k] = new Array();
            fileMissingArr[k] = new Array();
            for(let i = 0; i < slugArrs[k].length; i++){
                const mdxPath = path__WEBPACK_IMPORTED_MODULE_3___default().join(process.cwd(), `../kb/${folders[k]}/${slugArrs[k][i]}.md`);
                let source;
                try {
                    source = fs__WEBPACK_IMPORTED_MODULE_0___default().readFileSync(mdxPath);
                    fileMissingArr[k].push(false);
                } catch (e) {
                    source = Buffer.from("no data available");
                    fileMissingArr[k].push(true);
                }
                const { content , data  } = gray_matter__WEBPACK_IMPORTED_MODULE_1___default()(source);
                dataHandlesArr[k].push(data);
                let temp2 = await (0,next_mdx_remote_serialize__WEBPACK_IMPORTED_MODULE_2__.serialize)(content);
                mdxSources[k].push(temp2);
            }
        }
        // order based on ordering attribute, if one is available (is decided separately for each folder)
        let outputArr = new Array();
        dataHandlesArr.forEach((dataHandles)=>{
            const index = dataHandlesArr.indexOf(dataHandles);
            outputArr[index] = new Array(dataHandles.length);
            if (dataHandles[0].order) {
                dataHandles.forEach((element)=>{
                    outputArr[index].splice(element.order, 1, element);
                });
            } else {
                outputArr[index] = [
                    ...dataHandlesArr[index]
                ];
            }
        });
        return {
            props: {
                sourceArr: mdxSources,
                frontMatterArr: outputArr,
                filenames: slugArrs,
                fileMissingArr: fileMissingArr
            }
        };
    };
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;