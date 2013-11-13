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
/**
 * This class contains utilities to manipulate Html elements.
 */
Aria.classDefinition({
    $classpath : "aria.utils.Html",
    $extends : "aria.core.JsObject",
    $dependencies : ["aria.templates.DomElementWrapper", "aria.utils.String", "aria.utils.Json"],
    $singleton : true,
    $statics : {
        datasetRegex : /^\w+$/, /* This is to mainly to forbid dashes. Actually uppercase chars are not allowed by the spec, but they're transparently lowercased by the browser */
        INVALID_CONFIGURATION : "Invalid attribute %1.",
        INVALID_DATASET_KEY : "Invalid dataset key %1. Dataset keys can contain only [a-zA-Z0-9_]"
    },
    $prototype : {
        /**
         * Build the HTML markup regarding the attributes provided.
         * @param {aria.templates.CfgBeans:HtmlAttribute} attributes Attributes to be parsed
         * @return {String} String which can be used directly in a html tag
         */
        buildAttributeList : function (attributes) {
            var result = [], whiteList = aria.templates.DomElementWrapper.attributesWhiteList;
            var jsonUtils = aria.utils.Json;

            /*
             * This assumes that white list is performed by config validation, but this is only available in debug mode :
             * FIXME!
             */
            var stringUtil = aria.utils.String;
            for (var key in attributes) {
                if (attributes.hasOwnProperty(key) && !jsonUtils.isMetadata(key)) {
                    var attribute = attributes[key];
                    if (key === "classList") {
                        result.push(" class=\"");
                        result.push(stringUtil.encodeForQuotedHTMLAttribute(attribute.join(" ")));
                        result.push("\"");
                    } else if (key === "dataset") {
                        for (var dataKey in attribute) {
                            if (attribute.hasOwnProperty(dataKey) && !jsonUtils.isMetadata(dataKey)) {
                                if (this.datasetRegex.test(dataKey)) {
                                    /* BACKWARD-COMPATIBILITY-BEGIN (GH-499): hyphenate it in the new version */
                                    // result.push(" data-", stringUtil.camelToDashed(dataKey), "=\"");
                                    result.push(" data-", dataKey, "=\"");
                                    /* BACKWARD-COMPATIBILITY-END */
                                    result.push(stringUtil.encodeForQuotedHTMLAttribute(attribute[dataKey]));
                                    result.push("\"");
                                } else {
                                    /* BACKWARD-COMPATIBILITY-BEGIN (GH-499): change to $logError and don't output */
                                    this.$logWarn(this.INVALID_DATASET_KEY, dataKey);
                                    result.push(" data-", dataKey, "=\"");
                                    result.push(stringUtil.encodeForQuotedHTMLAttribute(attribute[dataKey]));
                                    result.push("\"");
                                    /* BACKWARD-COMPATIBILITY-END */
                                }
                            }
                        }
                    } else if (whiteList.test(key)) {
                        attribute = (attribute != null) ? attribute + "" : "";
                        result.push(" ", key, "=\"");
                        result.push(stringUtil.encodeForQuotedHTMLAttribute(attribute));
                        result.push("\"");
                    } else {
                        this.$logError(this.INVALID_CONFIGURATION, key);
                    }
                }
            }
            return result.join('');
        }
    }
});
