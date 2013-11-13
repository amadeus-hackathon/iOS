/*
 * Aria Templates 1.4.12 - 07 Nov 2013
 *
 * Copyright 2009-2013 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Aria.classDefinition({
    $classpath : "aria.ext.BundleAnalyzer",
    $singleton : true,
    /**
     * Create the singleton instance
     */
    $constructor : function () {
        /**
         * Code used inside a closure to evaluate again every class definition. It is used to extract useful information
         * from the resources definition
         * @protected
         */
        this._evalContext = "var Aria={},p;Aria.resourcesDefinition=function(c){p={type:'res',path:c.$classpath}};";

        for (var fn in Aria) {
            if (Aria.hasOwnProperty(fn) && Aria[fn] && Aria[fn].call) {
                if (fn !== "resourcesDefinition") {
                    this._evalContext += "Aria." + fn + "=function(){};";
                }
            }
        }
    },
    $prototype : {
        /**
         * Generate the report.
         * @return {Object}
         *
         * <pre>
         * {
         *      downloaded : {Array} List of downloaded files
         *      useless : {Array} List of classes that are present in a bundle but not used by the framework.
         *          These classes can be safely removed from the bundle
         *      error : {Array} List of classes that failed to be downloaded
         * }
         * </pre>
         */
        getReport : function () {
            var cache = aria.core.Cache.content;

            var downloadedBundles = [];
            for (var name in cache.urls) {
                if (cache.urls.hasOwnProperty(name)) {
                    downloadedBundles.push(name);
                }
            }

            var loadedFiles = {}, uselessFiles = [], errorFiles = [];
            for (name in cache.classes) {
                if (cache.classes.hasOwnProperty(name)) {
                    loadedFiles[aria.core.Cache.getFilename(name)] = true;
                }
            }
            for (name in cache.files) {
                if (cache.files.hasOwnProperty(name)) {
                    if (cache.files[name].status !== aria.core.Cache.STATUS_AVAILABLE) {
                        errorFiles.push(name);
                    } else {
                        var description = this._getClassDescription(cache.files[name].value);
                        if (description) {
                            if (description.type === "res" && !cache.classes[description.path]) {
                                uselessFiles.push(name);
                            }
                        } else if (!loadedFiles[name]) {
                            uselessFiles.push(name);
                        }
                    }

                }
            }

            return {
                downloaded : downloadedBundles,
                useless : uselessFiles,
                error : errorFiles
            };
        },

        /**
         * Return more information on the class definition
         * @private
         * @param {String} classContent Content to be evaluated
         * @return {Object}
         *
         * <pre>
         * {
         *      type : {String} Class type, e.g. 'res'
         *      path : {String} Classpath
         * }
         * </pre>
         */
        _getClassDescription : function (classContent) {
            // The try is needed because for TPL files classContent is the template, not the class definition
            try {
                return eval("(function(){" + this._evalContext + classContent + ";return p})()");
            } catch (ex) {}
        }
    }
});