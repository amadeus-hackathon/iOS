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
/*
 * Copyright 2012 Amadeus s.a.s.
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

// Do not remove @class and @singleton annotations, they're required for Aria singleton to appear in API docs.
/**
 * Global Aria object defining the base methods to manage objects, logs and file dependencies.
 * @class Aria
 * @singleton
 */
(function () {

    // If Aria object does not exist, create it
    if (typeof Aria == 'undefined') {
        Aria = {};
    }

    // Will be updated at the build time. This is a magic string, keep in sync with build file.
    Aria.version = '1.4.12';

    // start timestamp
    Aria._start = (new Date()).getTime();

    /**
     * Global object, root of all classpaths. It is defined even when Aria Templates is run in a non-browser environment
     * (for example: Node.js or Rhino).
     * @type Object
     */
    Aria.$global = (function () {
        return this;
    })();

    if (!Aria.$frameworkWindow && Aria.$global.window) {

        /**
         * Window object where the framework is loaded. It is defined only when Aria Templates is run in a browser (as
         * opposed to Aria.$global). It has to be equal to window and not to window.window because the two objects are
         * not equal in IE
         * @type Object
         */

        Aria.$frameworkWindow = Aria.$global;
    }

    /**
     * Window object where templates should be displayed and user interaction should be done. This variable can be set
     * directly before loading the framework (through <code>Aria = {$window: ...};</code>). However, once the
     * framework is loaded, it must be changed only through <code>aria.utils.AriaWindow.setWindow</code>.
     * @type Object
     */
    Aria.$window = Aria.$window || Aria.$frameworkWindow;

    /**
     * List of Js reserved words used to check namespace (some browsers do not accept these words in JSON keys)
     * @type Map
     * @private
     */
    var __JS_RESERVED_WORDS = {
        "_abstract" : 1,
        "_boolean" : 1,
        "_break" : 1,
        "_byte" : 1,
        "_case" : 1,
        "_catch" : 1,
        "_char" : 1,
        "_class" : 1,
        "_const" : 1,
        "_continue" : 1,
        "_debugger" : 1,
        "_default" : 1,
        "_delete" : 1,
        "_do" : 1,
        "_double" : 1,
        "_else" : 1,
        "_enum" : 1,
        "_export" : 1,
        "_extends" : 1,
        "_false" : 1,
        "_final" : 1,
        "_finally" : 1,
        "_float" : 1,
        "_for" : 1,
        "_function" : 1,
        "_goto" : 1,
        "_if" : 1,
        "_implements" : 1,
        "_import" : 1,
        "_in" : 1,
        "_instanceof" : 1,
        "_int" : 1,
        "_interface" : 1,
        "_long" : 1,
        "_native" : 1,
        "_new" : 1,
        "_null" : 1,
        "_package" : 1,
        "_private" : 1,
        "_protected" : 1,
        "_public" : 1,
        "_return" : 1,
        "_short" : 1,
        "_static" : 1,
        "_super" : 1,
        "_switch" : 1,
        "_synchronized" : 1,
        "_this" : 1,
        "_throw" : 1,
        "_throws" : 1,
        "_transient" : 1,
        "_true" : 1,
        "_try" : 1,
        "_typeof" : 1,
        "_var" : 1,
        "_void" : 1,
        "_volatile" : 1,
        "_while" : 1,
        "_with" : 1,
        "_constructor" : 1, // Addition to ECMA list
        "_prototype" : 1
        // Addition to ECMA list
    };

    // ERROR MESSAGES:
    Aria.NULL_CLASSPATH = "$classpath argument (or both $class and $package arguments) is mandatory and must be a string.";
    Aria.INVALID_NAMESPACE = "Invalid namespace: %1";
    Aria.INVALID_DEFCLASSPATH = "Invalid definition classpath: %1";
    Aria.INVALID_CLASSNAME_FORMAT = "%2Invalid class name : '%1'. Class name must be a string and start with a capital case.";
    Aria.INVALID_CLASSNAME_RESERVED = "%2Invalid class name: '%1'. Class name must be a string cannot be a reserved word.";
    Aria.INVALID_PACKAGENAME_FORMAT = "%2Invalid package name : '%1'. Package name must be a string must start with a small case.";
    Aria.INVALID_PACKAGENAME_RESERVED = "%2Invalid package name: '%1'. Package name must be a string cannot be a reserved word.";
    Aria.INSTANCE_OF_UNKNOWN_CLASS = "Cannot create instance of class '%1'";
    Aria.DUPLICATE_CLASSNAME = "class names in a class hierarchy must be different: %1";
    Aria.WRONG_BASE_CLASS = "super class for %1 is not properly defined: base classes (%2) must be defined through Aria.classDefinition()";
    Aria.BASE_CLASS_UNDEFINED = "super class for %1 is undefined (%2)";
    Aria.INCOHERENT_CLASSPATH = "$class or $package is incoherent with $classpath";
    Aria.INVALID_INTERFACES = "Invalid interface definition in Class %1";
    // for constructors or destructors
    Aria.PARENT_NOTCALLED = "Error: the %1 of %2 was not called in %3.";
    // for constructors or destructors
    Aria.WRONGPARENT_CALLED = "Error: the %1 of %2 was called instead of %3 in %4.";
    Aria.REDECLARED_EVENT = "Redeclared event name: %1 in %2";
    Aria.INVALID_EXTENDSTYPE = "Invalid $extendsType property for class %1.";
    Aria.TEXT_TEMPLATE_HANDLE_CONFLICT = "Template error: can't load text template '%1' defined in '%2'. A macro, a library, a resource, a variable or another text template has already been declared with the same name.";
    Aria.RESOURCES_HANDLE_CONFLICT = "Template error: can't load resources '%1' defined in '%2'. A macro, a library, a text template, a variable or another resource has already been declared with the same name.";
    Aria.CANNOT_EXTEND_SINGLETON = "Class %1 cannot extend singleton class %2";
    Aria.FUNCTION_PROTOTYPE_RETURN_NULL = "Prototype function of %1 cannot returns null";
    Aria.TPLSCRIPT_INSTANTIATED_DIRECTLY = "Template scripts can not be instantiated directly";

    Aria.$classpath = "Aria";
    /**
     * Log a debug message to the logger
     * @param {String} msg the message text
     * @param {Array} msgArgs An array of arguments to be used for string replacement in the message text
     * @param {Object} obj An optional object to be inspected in the logged message
     */
    Aria.$logDebug = function () {
        // replaced by the true logging function when aria.core.Log is loaded
    };

    /**
     * Log an info message to the logger
     * @param {String} msg the message text
     * @param {Array} msgArgs An array of arguments to be used for string replacement in the message text
     * @param {Object} obj An optional object to be inspected in the logged message
     */
    Aria.$logInfo = function () {
        // replaced by the true logging function when aria.core.Log is loaded
    };

    /**
     * Log a warning message to the logger
     * @param {String} msg the message text
     * @param {Array} msgArgs An array of arguments to be used for string replacement in the message text
     * @param {Object} obj An optional object to be inspected in the logged message
     */
    Aria.$logWarn = function () {
        // replaced by the true logging function when aria.core.Log is loaded
    };

    /**
     * Log an error message to the logger
     * @param {String} msg the message text
     * @param {Array} msgArgs An array of arguments to be used for string replacement in the message text
     * @param {Object} err The actual JS error object that was created or an object to be inspected in the logged
     * message
     */
    Aria.$logError = function () {
        // replaced by the true logging function when aria.core.Log is loaded
    };

    /**
     * Classpath validation method
     * @param {String} path class path to validate - e.g. 'aria.jsunit.TestSuite'
     * @param {String} context additional context information
     * @return {Boolean} true if class path is OK
     */
    var __checkClasspath = function (path, context) {
        if (!path || typeof(path) != 'string') {
            Aria.$logError(Aria.NULL_CLASSPATH);
            return false;
        }
        var classpathParts = path.split('.'), nbParts = classpathParts.length;
        for (var index = 0; index < nbParts - 1; index++) {
            if (!__checkPackageName(classpathParts[index], context)) {
                return false;
            }
        }
        if (!__checkClassName(classpathParts[nbParts - 1], context)) {
            return false;
        }
        return true;
    };

    /**
     * Class name validation method
     * @param {String} className class name to validate - e.g. 'TestSuite'
     * @param {String} context additional context information
     * @return {Boolean} true if class path is OK
     */
    var __checkClassName = function (className, context) {
        context = context || '';
        if (!className || !className.match(/^[_A-Z]\w*$/)) {
            Aria.$logError(Aria.INVALID_CLASSNAME_FORMAT, [className, context]);
            return false;
        }
        if (Aria.isJsReservedWord(className)) {
            Aria.$logError(Aria.INVALID_CLASSNAME_RESERVED, [className, context]);
            return false;
        }
        return true;
    };

    /**
     * Package name validation method
     * @param {String} packageName package name to validate - e.g. 'TestSuite'
     * @param {String} context additional context information
     * @return {Boolean} true if class path is OK
     */
    var __checkPackageName = function (packageName, context) {
        context = context || '';
        if (!packageName) {
            Aria.$logError(Aria.INVALID_PACKAGENAME_FORMAT, [packageName, context]);
            return false;
        }
        if (Aria.isJsReservedWord(packageName)) {
            Aria.$logError(Aria.INVALID_PACKAGENAME_RESERVED, [packageName, context]);
            return false;
        }
        if (!packageName.match(/^[a-z]\w*$/)) {
            Aria.$logInfo(Aria.INVALID_PACKAGENAME_FORMAT, [packageName, context]);
        }
        return true;
    };

    /**
     * Shortcut to the class manager
     * @private
     * @type aria.core.ClassMgr
     */
    var __clsMgr = null; // TODO: delete on dispose

    /**
     * Number of object creations (used only when Aria.memCheckMode==true).
     * @private
     * @type Number
     */
    var __nbConstructions = 0;

    /**
     * Number of object destructions (used only when Aria.memCheckMode==true).
     * @private
     * @type Number
     */
    var __nbDestructions = 0;

    /**
     * List of objects that were created but not disposed (used only when Aria.memCheckMode==true).
     * @private
     * @type Object
     */
    var __objects = {};

    /**
     * Temporary cache of classes which have declared providers which have not have been loaded yet.
     * @private
     * @type Object
     */
    var __classMemo = {};

    /**
     * TODOC
     * @type Array
     */
    var syncProviders = [];

    /**
     * Wrapper function for constructors or destructors on an object. It is used only when Aria.memCheckMode==true. When
     * the constructor or destructor of an object is called, this function is called, and this function calls the
     * corresponding constructor or destructor in the object definition and check that it calls its parent constructor
     * or destructor.
     * @private
     * @param {Object} object
     * @param {Object} definition object definition whose constructor should be called
     * @param {Object} superclass superclass
     * @param {String} fn May be "$constructor" or "$destructor".
     * @param {Array} params Array of parameters to be given to the $constructor; should be empty when fn=="$destructor"
     * return true if it was the first call
     */
    var __checkInheritanceCalls = function (obj, def, superclass, fn, params) {
        var newcall = (!obj["aria:nextCall"]);
        if (!newcall && obj["aria:nextCall"] != def.$classpath) {
            Aria.$logError(Aria.WRONGPARENT_CALLED, [fn, def.$classpath, obj["aria:nextCall"], obj.$classpath]);
        }
        obj["aria:nextCall"] = (superclass ? superclass.classDefinition.$classpath : null);
        if (def[fn]) {
            def[fn].apply(obj, params);
        } else if (superclass && fn == "$destructor") {
            // no destructor: must call the parent destructor, by default
            superclass.prototype.$destructor.apply(obj, params);
        }
        if (obj["aria:nextCall"] && obj["aria:nextCall"] != "aria.core.JsObject") {
            Aria.$logError(Aria.PARENT_NOTCALLED, [fn, obj["aria:nextCall"], def.$classpath]);
        }
        if (newcall) {
            obj["aria:nextCall"] = undefined;
        }
        return newcall;
    };

    /**
     * Returns the constructor of the given class definition. When Aria.memCheckMode==true, it returns a wrapper.
     * Otherwise, it directly returns the $constructor defined in the class definition.
     * @private
     * @param {Object} def
     * @param {Object} superclass
     */
    var __createConstructor = function (def, superclass) {
        if (!Aria.memCheckMode) {
            return def.$constructor;
        }
        return function () {
            try {
                if (!this['aria:objnumber']) {
                    __nbConstructions++;
                    this['aria:objnumber'] = __nbConstructions;
                    __objects[__nbConstructions] = this;
                }
                // check that parent constructors are correctly called
                __checkInheritanceCalls(this, def, superclass, "$constructor", arguments);
            } catch (e) {
                // if an exception occurs while creating the object,
                // we do not need to call dispose on it and we don't want to decrease the counter
                // more than once (in case the exception is in a grandchild constructor)
                if (this['aria:objnumber']) {
                    __nbDestructions++;
                    __objects[this['aria:objnumber']] = null;
                    delete __objects[this['aria:objnumber']];
                    this['aria:objnumber'] = null;
                }
                throw e;
            }
        };
    };

    /**
     * Returns the destructor of the given class definition. When Aria.memCheckMode==true, it returns a wrapper.
     * Otherwise, it directly returns the $destructor defined in the class definition.
     * @private
     * @param {Object} def
     * @param {Object} superclass
     */
    var __createDestructor = function (def, superclass) {
        if (!Aria.memCheckMode) {
            return def.$destructor;
        }
        return function () {
            // check that parent destructors are correctly called
            if (__checkInheritanceCalls(this, def, superclass, "$destructor", arguments)) {
                // Erase everything in the object, so that it is possible
                // to see when it is no longer used
                /*
                 * for (var i in this) { this[i] = null; }
                 */
            }
            if (this['aria:objnumber']) {
                __nbDestructions++;
                __objects[this['aria:objnumber']] = null;
                delete __objects[this['aria:objnumber']];
                this['aria:objnumber'] = null;
            }
        };
    };

    /**
     * TODOC
     * @private
     */
    var __setRootDim = function (dim) {
        aria.templates.Layout.setRootDim(dim);
    };

    /**
     * TODOC
     * @private
     */
    var __classLoadError = function (classPath, errorID, errorArgs) {
        if (errorID) {
            Aria.$logError(errorID, errorArgs);
        }
        if (__clsMgr) {
            __clsMgr.notifyClassLoadError(classPath);
        }
    };

    /**
     * Copies the content of mergeFrom into mergeTo. mergeFrom and mergeTo are maps of event definitions. If an event
     * declared in mergeFrom already exists in mergeTo, the error is logged and the event is not overriden.
     * @name Aria.__mergeEvents
     * @private
     * @method
     * @param {Object} mergeTo Destrination object (map of events).
     * @param {Object} mergeFrom Source object (map of events).
     * @param {String} Classpath of the object to which events are copied. Used in case of error.
     * @return {Boolean} false if mergeFrom is empty. True otherwise.
     */
    var __mergeEvents = function (mergeTo, mergeFrom, classpathTo) {
        var hasEvents = false;
        for (var k in mergeFrom) {
            if (mergeFrom.hasOwnProperty(k)) {
                if (!hasEvents) {
                    hasEvents = true;
                }
                // The comparison with null below is important, as an empty string is a valid event description.
                if (mergeTo[k] != null) {
                    Aria.$logError(Aria.REDECLARED_EVENT, [k, classpathTo]);
                } else {
                    mergeTo[k] = mergeFrom[k];
                }
            }
        }
        return hasEvents;
    };

    // Make that function available for aria.core.Interfaces. Is not intended for the use by application developers.
    Aria.__mergeEvents = __mergeEvents;
    /**
     * When minSizeMode=true, templates and widgets use their minimum size, to help defining correct sizes for $hdim and
     * $vdim.
     * @type Boolean
     * @name Aria.minSizeMode
     */
    Aria.minSizeMode = Aria.minSizeMode === true;

    /**
     * Debug mode indicator
     * @name Aria.debug
     * @type Boolean
     */
    Aria.debug = Aria.debug === true;

    /**
     * If true, profiling is enabled, and profile data is added to Aria.profilingData.
     * @name Aria.enableProfiling
     * @type Boolean
     */
    Aria.enableProfiling = Aria.enableProfiling === true;

    /**
     * The memCheckMode variable enables or disables the check of the match between creation and destruction of objects,
     * so that there is no memory leak.
     * @type Boolean
     * @name Aria.memCheckMode
     */
    Aria.memCheckMode = Aria.memCheckMode === true;

    /**
     * The domain variable has to be set only when you explicitly set the value of document.domain. It is needed by
     * classes using iframes (like aria.utils.HashManager) in order to overcome the limitations imposed by IE6/7 on the
     * access of the iframe contents. It is desirable to set it at the very beginning, even before loading the bootstrap
     * file of the framework.
     * @type String
     * @name Aria.domain
     */
    Aria.domain = Aria.domain || null;

    /**
     * Prefix used for all parameters added in objects by the framework for internal requirements
     * @type String
     * @name Aria.FRAMEWORK_PREFIX
     */
    Aria.FRAMEWORK_PREFIX = Aria.FRAMEWORK_PREFIX || "aria:";

    /**
     * Relative path for the aria resources location
     * @type String
     * @name Aria.FRAMEWORK_RESOURCES
     */
    Aria.FRAMEWORK_RESOURCES = Aria.FRAMEWORK_RESOURCES || "aria/resources/";

    /**
     * List of all class definitions that have been defined through Aria.classDefinition Some definitions may not
     * published though - cf. loadClass and class override (unit tests)
     * @private
     * @type Map
     * @see loadClass()
     * @name Aria.$classDefinitions
     */
    Aria.$classDefinitions = {};

    /**
     * List of all classes in the order of their loading
     * @type Array
     * @name Aria.$classes
     */
    Aria.$classes = [];

    /**
     * Access for undisposed objects from within test cases.
     * @type Object
     * @name Aria.__undisposedObjects
     * @private
     */
    Aria.__undisposedObjects = __objects;

    /**
     * Activate the test mode in order to generate specific ids inside the widgets.
     */
    Aria.activateTestMode = function () {
        Aria.testMode = true;
        var rootTemplates = Aria.rootTemplates;
        if (rootTemplates) {
            for (var i = 0, l = rootTemplates.length; i < l; i++) {
                var rootTemplate = rootTemplates[i];
                rootTemplate.$refresh();
            }
        }
    };

    /**
     * Unload Aria cleanly, so that there is no memory leak. In memCheckMode, for debug purposes, return an object with
     * information about not properly disposed objects.
     * @param {String|Object} classpath optional parameters to dispose only a target classpath
     */
    Aria.dispose = function (classpathOrRef) {
        if (classpathOrRef) {
            var classpath;
            var classRef;
            var def;
            if (typeof classpathOrRef == "string") {
                classpath = classpathOrRef;
                classRef = Aria.getClassRef(classpath);
                if (!classRef) {
                    return;
                }
                def = classRef.classDefinition || classRef.interfaceDefinition;
                if (!def) {
                    return;
                }
            } else {
                classRef = classpathOrRef;
                def = classRef.classDefinition || classRef.interfaceDefinition;
                if (!def) {
                    return;
                }
                classpath = def.$classpath;
                if (!classpath) {
                    return;
                }
            }
            // remove from object
            var parent = classpath.split('.');
            var child = parent[parent.length - 1];
            parent.splice(parent.length - 1, 1);
            parent = Aria.nspace(parent.join("."));

            // check if the class is the same as the one loaded at the specified classpath
            // before removing it
            if (classRef == parent[child]) {
                if (def.$singleton) {
                    classRef.$dispose();
                }
                if (def.$onunload) {
                    def.$onunload.call(def.$noargConstructor.prototype, classRef);
                }
                // Remove resources providers instances
                var defResources = def.$resources;
                var p = def.$singleton ? classRef : classRef.prototype;
                if (defResources) {
                    for (var k in defResources) {
                        if (defResources.hasOwnProperty(k) && (defResources[k].provider != null)) {
                            p[k].$dispose();
                            p[k] = null;
                        }
                    }
                }

                delete parent[child];

                // clean Aria object
                delete this.$classDefinitions[classpath];
                for (var i = 0, className; className = this.$classes[i]; i++) {
                    if (className == classRef) {
                        this.$classes.splice(i, 1);
                        break;
                    }
                }
            }
        } else {
            // disposing and/or unloading classes:
            var classes = Aria.$classes.slice(0);
            for (var i = classes.length - 1; i >= 0; i--) {
                var elt = classes[i];
                Aria.dispose(elt);
            }
            classes = null;
            var memcheck = Aria.memCheckMode;
            Aria = null;
            // aria = null; // must not be done, as we still need to be able to log errors through
            // aria.core.Log.error
            // delete window.Aria; // not supported under IE
            if (memcheck) {
                return {
                    nbConstructions : __nbConstructions,
                    nbDestructions : __nbDestructions,
                    nbNotDisposed : __nbConstructions - __nbDestructions,
                    notDisposed : __objects
                };
            }
        }
    };

    /**
     * Make sure the JavaScript namespace object exists and create it if necessary. Does not check for syntax.
     * @param {String} nspace the namespace string - e.g. 'abc.x.y.z'
     * @param {Boolean} createIfNull [optional, default: true] if false, the namespace is not created if it does not
     * exist (in this case the function returns null)
     * @param {Object} parent [optional, default: Aria.$global] parent object in which to search for the namespace
     * @return {Object}
     */
    Aria.nspace = function (nspace, createIfNull, parent) {
        // normalize parent
        if (parent == null) {
            parent = Aria.$global;
        }

        // normalize createIfNull
        createIfNull = createIfNull !== false;

        // edge case
        if (nspace === "") {
            return parent;
        }

        if (!nspace || typeof(nspace) != 'string') {
            Aria.$logError(Aria.INVALID_NAMESPACE, [nspace]);
            return null;
        }

        var parts = nspace.split('.'), nbParts = parts.length, current;
        for (var i = 0; i < nbParts; i++) {
            current = parts[i];
            if (!current || Aria.isJsReservedWord(current)) {
                Aria.$logError(Aria.INVALID_NAMESPACE, [nspace]);
                return null;
            }
            if (!parent[current]) {
                if (!createIfNull) {
                    return null;
                }
                parent[current] = {};
            }
            parent = parent[current];
        }
        return parent;
    };

    /**
     * Internal cache for getClassRef method
     * @see Aria.getClassRef()
     */
    var _getClassRefCache = {};
    /**
     * Return a reference to the class given by its name.
     * @param {String} className the string - e.g. 'abc.x.y.z.ClassName'
     * @return {Object}
     */
    Aria.getClassRef = function (className) {
        return _getClassRefCache[className] || (_getClassRefCache[className] = Aria.nspace(className, false));
    };

    /**
     * Clean the internal cache of Aria.getClassRef
     * @param {String} className the string - e.g. 'abc.x.y.z.ClassName'. If false cleans the whole cache
     */
    Aria.cleanGetClassRefCache = function (className) {
        if (!className) {
            _getClassRefCache = {};
        } else {
            delete _getClassRefCache[className];
        }
    };

    /**
     * Return an instance of the given class, initialized with the parameter given as argument
     * @param {String} className the string - e.g. 'abc.x.y.z'
     * @param {Array} args, optional arguments given as an object to the constructor
     * @return {Object}
     */
    Aria.getClassInstance = function (className, args) {
        var ClassRef = Aria.getClassRef(className);
        if (ClassRef) {
            return new ClassRef(args);
        } else {
            Aria.$logError(Aria.INSTANCE_OF_UNKNOWN_CLASS, [className]);
        }
    };

    /**
     * Tell if a string is a reserved JavaScript keyword
     * @param {String} str the string to check
     * @return {Boolean} true if s is a javascript reserved keyword
     */
    Aria.isJsReservedWord = function (str) {
        if (__JS_RESERVED_WORDS["_" + str]) {
            return true;
        }
        return false;
    };

    /**
     * Tell is a string is acceptable as a JavaScript variable name (must not start with some specific chars and must
     * not be a reserved keyword)
     * @param {String} s the string to check
     * @return {Boolean} true if s is a valid variable name
     */
    Aria.checkJsVarName = function (str) {
        if (!str.match(/^[a-zA-Z_\$][\w\$]*$/)) {
            return false;
        }
        if (Aria.isJsReservedWord(str)) {
            return false;
        }
        return true;
    };

    /**
     * Base methods used to declare template scripts
     * @param {aria.templates.CfgBeans:TplScriptDefinitionCfg} def The definition object describing the class.
     * Definition is the same as for classDefinition, excluding 'extends'
     */
    Aria.tplScriptDefinition = function (def) {
        // WRITING WITH BRACKETS ON PURPOSE (for documentation)
        Aria['classDefinition']({
            $classpath : def.$classpath,
            $dependencies : def.$dependencies,
            $resources : def.$resources,
            $statics : def.$statics,
            $texts : def.$texts,
            $prototype : def.$prototype,
            $onload : function (constructor) {
                constructor.tplScriptDefinition = def;
            },
            $constructor : function () {
                // This is to prevent direct instantiation of template scripts.
                // Yet it is still possible do define $constructor and $destructor on template scripts, as they will be
                // imported later on in TplClassLoader._importScriptPrototype()
                this.$logError(Aria.TPLSCRIPT_INSTANTIATED_DIRECTLY);
            }
        });
    };

    /**
     * Base methods used to declare classes
     * @param {aria.core.CfgBeans:ClassDefinitionCfg} def def The definition object describing the class - must have the
     * following properties: All objects create through this method will automatically have the following properties:
     *
     * <pre>
     * {
     *     $CLASSNAME // reference to the class prototype (useful for subclasses)
     *     $destructor // destructor method
     *     $classpath // fully qualified classpath
     *     $class // class name (i.e. last part of the class path)
     * }
     * </pre>
     */
    Aria.classDefinition = function (def) {

        if (!def) {
            return Aria.$logError(Aria.NULL_CLASSPATH);
        }

        // There are two ways to define the classpath: either by $classpath
        // or by both $class and $package
        // if both ways are used, check that they define the same classpath
        var defClasspath = def.$classpath, defClassname = def.$class, defPackage = def.$package, defExtends = def.$extends;
        // check if classpath is correct
        if (!defClasspath && !(defClassname != null && defPackage != null)) {
            return Aria.$logError(Aria.NULL_CLASSPATH);
        }

        var clsNs;
        var clsName;
        var clsPath;
        if (defClasspath) {
            clsPath = defClasspath;
            var idx = clsPath.lastIndexOf('.');
            if (idx > -1) {
                clsNs = clsPath.slice(0, idx);
                clsName = clsPath.slice(idx + 1);
            } else {
                clsNs = '';
                clsName = clsPath;
            }
            if ((defClassname && defClassname != clsName) || (defPackage && defPackage != clsNs)) {
                return Aria.$logError(Aria.INCOHERENT_CLASSPATH);
            }

            def.$class = clsName;
            def.$package = clsNs;
        } else {
            clsName = defClassname;
            clsNs = def.$package;
            clsPath = clsNs + '.' + clsName;
            def.$classpath = clsPath;
        }
        if (!__checkClasspath(clsPath, "classDefinition: ")) {
            return;
        }

        // initialize class definition: create $events, $noargConstructor,
        // $destructor... variables
        if (!def.$events) {
            def.$events = {}; // to make sure it is always defined
        }
        def.$noargConstructor = new Function();

        // check superclass: if none, we use aria.core.JsObject
        if (!defExtends || defExtends.match(/^\s*$/)) {
            if (clsPath != 'aria.core.JsObject') {
                defExtends = def.$extends = 'aria.core.JsObject';
            }
        }

        if (!def.$constructor) {
            def.$constructor = new Function(def.$extends + ".prototype.constructor.apply(this, arguments);");
            // return Aria.$logError("10007_MISSING_CONSTRUCTOR", [clsPath]);
        }

        // register definition - note that previous definition will be
        // overridden
        this.$classDefinitions[clsPath] = def;

        // check dependencies
        var doLoad = true;
        if (__clsMgr) {
            // load missing dependencies - js classes and resource files
            var dpMap = {
                'TPL' : def.$templates,
                'CSS' : def.$css,
                'TML' : def.$macrolibs,
                'CML' : def.$csslibs
            };
            var rs = [];
            var dp = def.$dependencies || [];

            // add implemented interfaces to dependencies map
            if (def.$implements && def.$implements.length > 0) {
                dp = dp.concat(def.$implements);
            }

            // add resources file to dependencies map
            if (aria.utils.Type.isObject(def.$resources)) {
                for (var itm in def.$resources) {
                    if (def.$resources.hasOwnProperty(itm)) {
                        if (def.$resources[itm].hasOwnProperty("provider")) {
                            // it's a resource provider
                            dp.push(def.$resources[itm].provider);
                        } else {
                            // it's a resource
                            rs.push(def.$resources[itm]);
                        }
                    }
                }
            }
            // add text template files to dependencies map
            if (aria.utils.Type.isObject(def.$texts)) {
                dpMap.TXT = aria.utils.Array.extractValuesFromMap(def.$texts);
            }

            dpMap.RES = rs;
            dpMap.JS = dp;

            if (defExtends != 'aria.core.JsObject') {
                var extendsType = def.$extendsType || "JS";
                if (extendsType !== "JS" && extendsType !== "TPL" && extendsType !== "TML" && extendsType !== "CSS"
                        && extendsType !== "CML" && extendsType !== "TXT") {
                    return Aria.$logError(Aria.INVALID_EXTENDSTYPE, [clsName]);
                }
                if (dpMap[extendsType]) {
                    dpMap[extendsType].push(defExtends);
                } else {
                    dpMap[extendsType] = [defExtends];
                }
            }

            // always use the class manager (even if there is no dependency) to notify the loader that the
            // classDefinition was called
            doLoad = __clsMgr.loadClassDependencies(clsPath, dpMap, {
                fn : Aria.loadClass,
                scope : Aria,
                args : clsPath
            });
        }

        // load definition
        if (doLoad) {
            this.loadClass(clsPath, clsPath);
        }
    };

    /**
     * Base method used to declare interfaces.
     * @param {Object} def Interface definition. The interface definition can contain the following properties:
     *
     * <pre>
     * {
     *     $extends // {String} contain the classpath of the interface this interface inherits from,
     *     $events // {Object} contain event definitions, same syntax as for classDefinition,
     *     $interface // {Object} map of empty methods and properties to be included in the interface
     * }
     * </pre>
     */
    Aria.interfaceDefinition = function (def) {
        // TODO: add some checks on the parameter
        var clsPath = def.$classpath;
        if (!__checkClasspath(clsPath, "interfaceDefinition")) {
            return;
        }
        if (def.$events == null) {
            def.$events = {}; // to make sure it is always defined
        }
        var doLoad = true;
        if (__clsMgr) {
            // always use the class manager (even if there is no dependency) to notify the loader that the
            // interfaceDefinition was called
            doLoad = __clsMgr.loadClassDependencies(clsPath, {
                "JS" : def.$extends ? [def.$extends] : []
            }, {
                fn : aria.core.Interfaces.loadInterface,
                scope : aria.core.Interfaces,
                args : def
            });
        }
        // load definition if no dependency is missing
        if (doLoad) {
            aria.core.Interfaces.loadInterface(def);
        }
    };

    /**
     * Copy members of object src into dst.
     * @param {Object} src
     * @param {Object} dst
     */
    Aria.copyObject = function (src, dst) {
        for (var k in src) {
            if (src.hasOwnProperty(k)) {
                dst[k] = src[k];
            }
        }
    };

    var navigator = Aria.$global.navigator;

    /**
     * @private There is a IE only check in the loadClass function aria.core.Browser is not available at this stage, so
     * we have to manually check for IE here. The logic is used is however the same as in aria.core.Browser
     */
    var __temporaryIsIE = navigator ? navigator.userAgent.toLowerCase().indexOf("msie") != -1 : false;

    /**
     * Load a class definition and expose it on a public path. These 2 paths may be different to support class
     * overloading (for unit testing for intance).<br/> Note: this method is automatically called by classDefinition() -
     * with the 2 same arguments in this case
     * @param {String} definitionClassPath the internal classpath associated to the class definition - e.g.
     * 'mypkg.MyClass2'
     * @param {String} publicClassPath the public class path to give to this definition - e.g. 'mypkg.MyClass'
     */
    Aria.loadClass = function (definitionClassPath, publicClassPath) {

        if (!publicClassPath) {
            publicClassPath = definitionClassPath;
        }
        if (!__checkClasspath(publicClassPath, "loadClass")) {
            return;
        }

        // retrieve definition
        var def = this.$classDefinitions[definitionClassPath];
        if (!def) {
            return Aria.$logError(Aria.INVALID_DEFCLASSPATH, [definitionClassPath]);
        }

        var defPrototype = def.$prototype, defStatics = def.$statics, defEvents = def.$events, defBeans = def.$beans, defResources = def.$resources, defTexts = def.$texts;
        var defImplements = def.$implements;

        // Create public ns
        var clsNs = '';
        var clsName = publicClassPath;
        var idx = publicClassPath.lastIndexOf('.');
        if (idx > -1) {
            clsNs = publicClassPath.slice(0, idx);
            clsName = publicClassPath.slice(idx + 1);
        }

        // get namespace object
        var ns = Aria.nspace(clsNs);

        // manage inheritance
        var superclass = null;
        if (def.$extends) {
            if (!__checkClasspath(def.$extends, "parentClass")) {
                return __classLoadError(def.$classpath);
            }
            superclass = Aria.getClassRef(def.$extends);

            if (!superclass) {
                return __classLoadError(def.$classpath, Aria.BASE_CLASS_UNDEFINED, [def.$classpath, def.$extends]);
            } else {
                // check that superclass has been properly loaded
                if (!superclass.classDefinition) {
                    return __classLoadError(def.$classpath, Aria.WRONG_BASE_CLASS, [def.$classpath, def.$extends]);
                }
                // check that superclass is not singleton
                if (superclass.classDefinition.$singleton) {
                    return __classLoadError(def.$classpath, Aria.CANNOT_EXTEND_SINGLETON, [def.$classpath, def.$extends]);
                }

            }
        }

        // define class prototype
        var p; // new prototype
        if (superclass) {
            p = new superclass.classDefinition.$noargConstructor();
            // won't work, something else needs to be provided
            // p.$super = superclass.prototype;
        } else {
            p = {};
        }

        p.$classpath = def.$classpath;
        p.$class = def.$class;
        p.$package = def.$package;
        var parentResources = {};
        if (p.$resources) {
            parentResources = p.$resources;
            p.$resources = {};
            Aria.copyObject(parentResources, p.$resources);
            Aria.copyObject(defResources, p.$resources);
        } else {
            p.$resources = def.$resources;
        }
        var parentTexts = {};
        if (p.$texts) {
            parentTexts = p.$texts;
            p.$texts = {};
            Aria.copyObject(parentTexts, p.$texts);
            Aria.copyObject(defTexts, p.$texts);
        } else {
            p.$texts = def.$texts;
        }

        // css templates
        if (def.$css) {
            p.$css = def.$css;
        }
        if (defPrototype) {
            if (typeof defPrototype === "function") {
                defPrototype = defPrototype.apply({});
                if (!defPrototype) {
                    Aria.$logError(Aria.FUNCTION_PROTOTYPE_RETURN_NULL, [publicClassPath]);
                    defPrototype = {};
                }
                Aria.copyObject(defPrototype, def.$prototype);
            }
            for (var k in defPrototype) {
                if (defPrototype.hasOwnProperty(k) && k != '$init') {
                    if (typeof defPrototype[k] === "function") {
                        // enable naming of anonymous functions in the stack trace in Firebug and Safari
                        defPrototype[k].displayName = "#" + k;
                    }
                    // TODO: check method names?
                    p[k] = defPrototype[k];
                }
            }
            // Internet Explorer fix only for toString and valueOf properties
            // cannot use aria.core.Browser at this stage,
            // __temporaryIsIE is defined right before loadClass and is only accessible inside the closure
            if (__temporaryIsIE) {
                if (defPrototype.hasOwnProperty("toString")) {
                    p.toString = defPrototype.toString;
                }
                if (defPrototype.hasOwnProperty("valueOf")) {
                    p.valueOf = defPrototype.valueOf;
                }
            }
        }

        // store providers in a special variable
        var defProviders = {};

        // if resources (and/or providers) were defined for a class add them to the prototype
        if (defResources) {
            for (var k in defResources) {
                if (defResources.hasOwnProperty(k)) {
                    if (p[k] && !parentResources[k]) {
                        Aria.$logError(Aria.RESOURCES_HANDLE_CONFLICT, [k, publicClassPath]);
                    } else {
                        if (defResources[k].provider != null) {
                            // it's a provider
                            defProviders[k] = defResources[k];

                            p[k] = Aria.getClassInstance(defResources[k].provider);
                            p[k].getData = (function (original) {
                                return function () { // ok if providers are not singletons
                                    return original.__getData(clsName);
                                };
                            })(p[k]);

                            p[k].__refName = k;
                        } else {
                            // it's a resource
                            p[k] = Aria.getClassRef(defResources[k]);
                        }
                    }
                }
            }
        }
        /*
         * if text templates were defined for a class add them to the prototype make sure that the handle provided does
         * not already exist. If it refers to a parent text template, tghen we still want to override it
         */
        if (defTexts) {
            for (var k in defTexts) {
                if (defTexts.hasOwnProperty(k)) {
                    if (p[k] && !parentTexts[k]) {
                        Aria.$logError(Aria.TEXT_TEMPLATE_HANDLE_CONFLICT, [k, publicClassPath]);
                    } else {
                        p[k] = Aria.getClassRef(defTexts[k]);
                    }
                }
            }
        }

        if (defStatics) {
            // publish statics on the prototype so that they are available
            // as object properties
            Aria.copyObject(defStatics, p);
        }
        if (defBeans) {
            // FIXME: WHAT TO DO ? WHAT. TO. DO !!
        }

        // Inclusion of events:
        // 1: the events of the super class (including those from its interfaces and its superclass)
        // 2: the events from the interfaces of the current class (added through applyInterface)
        // 3: the events of the current class (in the class definition)
        // In this second step, there is a check that an interface is not applied twice
        // Events cannot be redefined. If they are, an error is raised.

        p.$events = {};
        if (superclass) {
            __mergeEvents(p.$events, superclass.prototype.$events, p.$classpath);
        }
        if (defImplements) {
            if (aria.utils.Type.isArray(defImplements)) {
                for (var k = 0, l = defImplements.length; k < l; k++) {
                    if (!aria.core.Interfaces.applyInterface(defImplements[k], p)) {
                        // the error has already been logged from applyInterface
                        return __clsMgr.notifyClassLoadError(p.$classpath); // notify that class load failed
                    }
                }
            } else {
                __classLoadError(def.$classpath, Aria.INVALID_INTERFACES, [def.$classpath]);
            }
        }
        if (!p.$interfaces) {
            p.$interfaces = {};
        }
        __mergeEvents(p.$events, defEvents, p.$classpath);

        var dstrctr = __createDestructor(def, superclass);
        if (dstrctr) {
            // only create the destructor if needed
            p.$destructor = dstrctr;
        }

        // create ref to current prototype (usefull for subclasses)
        var protoRef = '$' + def.$class;
        // if base class ref already exists, log error
        if (p[protoRef] != null) {
            return __classLoadError(def.$classpath, Aria.DUPLICATE_CLASSNAME, def.$class);
        } else {
            p[protoRef] = p;
        }

        var cnstrctr = __createConstructor(def, superclass);

        cnstrctr.prototype = p;
        if (superclass) {
            cnstrctr.superclass = superclass.prototype;
        }
        p.$constructor = p.constructor = cnstrctr;
        def.$noargConstructor.prototype = p;

        // expose class constructor through public ns
        if (def.$singleton) {
            ns[clsName] = new cnstrctr();
        } else {
            if (defStatics) {
                // publish statics reference on the contstructor
                // note: already the case for singleton as statics are also
                // available in the prototype
                Aria.copyObject(defStatics, cnstrctr);
            }
            ns[clsName] = cnstrctr;
        }

        ns[clsName].classDefinition = def;
        Aria.$classes.push(ns[clsName]);

        // check if we need to initialize providers synchronously
        for (var k in defProviders) {
            if (defProviders.hasOwnProperty(k)) {
                var provider = defProviders[k];
                // set handlers and resources, if defined.

                if (provider.hasOwnProperty("handler")) {
                    p[k].setHandler(provider.handler);
                }
                if (provider.hasOwnProperty("resources")) {
                    p[k].setResources(provider.resources);
                }

                // fetch data
                if (provider.hasOwnProperty("onLoad")) {
                    p[k].fetchData({
                        fn : provider.onLoad,
                        scope : p
                    }, clsName); // we pass the name of the "caller class" i.e. the one with the provider declaration

                    // asynchronous load
                } else {
                    // synchronous load
                    syncProviders.push({
                        ref : k,
                        prot : p[k]
                    });
                }
            }
        }

        // remember this class so we can initialized when all providers have been loaded
        __classMemo[clsName] = {
            def : def,
            p : p,
            ns : ns
        };

        this.loadSyncProviders(clsName);
    };

    Aria.loadSyncProviders = function (caller) {
        if (syncProviders.length > 0) {
            // load next provider
            var nextProvider = syncProviders.pop();
            nextProvider.prot.fetchData({
                fn : this.loadSyncProviders,
                scope : this,
                args : {
                    calledback : true
                }
            }, caller);
        } else {
            // all providers have been loaded : init class

            // retrieve temporarily stored information
            var clsName = caller;
            var def = __classMemo[clsName].def;
            var p = __classMemo[clsName].p;
            var ns = __classMemo[clsName].ns;

            var defPrototype = def.$prototype;

            // if prototype init exist
            if (defPrototype && defPrototype.$init) {
                defPrototype.$init(p, def);
            }

            if (def.$onload) {
                // call the onload method
                // TODO: try/catch
                def.$onload.call(p, ns[clsName]);
            }

            // notify class manager
            if (__clsMgr) {
                __clsMgr.notifyClassLoad(def.$classpath);
            } else if (def.$classpath == 'aria.core.ClassMgr') {
                // we just loaded the class manager
                __clsMgr = aria.core.ClassMgr;
            }

            __classMemo[clsName] = null; // class succesfully loaded: clear the memo
        }
    };

    /**
     * Dynamically load some dependencies and calls the callback function when ready (Shortcut to
     * aria.core.MultiLoader.load) Note: this method may be synchronous if all dependencies are already in cache
     * @param {Object} desc the description of the files to load and the callback [loadDesc]
     *
     * <pre>
     * { classes:[] {Array} list of classpaths to be loaded
     *         oncomplete:{
     *             fn: {Function} the callback function - may be called synchronously if
     * all dependencies are already available
     *             scope: {Object} [optional] scope object (i.e. 'this') to associate to fn - if not provided, the Aria object will be used args: {Object} [optional] callback arguments (passed back
     * as argument when the callback is called)
     *         }
     *         onerror:{
     *             fn: ...
     *             ...,
     *             override:true // used to disable error warnings
     *         }
     * }
     * </pre>
     *
     * Alternatively, if there is no need to specify a scope and args, the callback property can contain directly the
     * callback function oncomplete: function () {...} instead of: oncomplete: {fn: function () {...}}
     */
    Aria.load = function (desc) {
        var ml = new aria.core.MultiLoader(desc);
        ml.load();
    };

    /**
     * Base method used to declare beans.
     * @param {aria.core.BaseTypes:BeansDefinition} beans Beans to declare
     */
    Aria.beanDefinitions = function (beans) {
        aria.core.JsonValidator.beanDefinitions(beans);
    };

    /**
     * Set root dimensions.
     * @param {aria.core.Beans:RootDimCfg} rootDim
     */
    Aria.setRootDim = function (rootDim) {
        Aria.load({
            classes : ['aria.templates.Layout'],
            oncomplete : {
                fn : __setRootDim,
                args : rootDim
            }
        });
    };

    /**
     * Load a template in a div. If a customized template has been defined for the given classpath, the substitute will
     * be loaded instead.
     * @param {aria.templates.CfgBeans:LoadTemplateCfg} cfg configuration object
     * @param {aria.core.CfgBeans:Callback} callback which will be called when the template is loaded or if there is an
     * error. The first parameter of the callback is a JSON object with the following properties: { success : {Boolean}
     * true if the template was displayed, false otherwise } Note that the callback is called when the template is
     * loaded, but sub-templates may still be waiting to be loaded (showing a loading indicator). Note that
     * success==true means that the template was displayed, but there may be errors inside some widgets or
     * sub-templates.
     */
    Aria.loadTemplate = function (cfg, cb) {
        aria.core.TplClassLoader.loadTemplate(cfg, cb);
    };

    /**
     * Unload a template loaded with Aria.loadTemplate.
     * @param {aria.templates.CfgBeans:Div} div The div given to Aria.loadTemplate.
     */
    Aria.disposeTemplate = function (div) {
        return aria.core.TplClassLoader.disposeTemplate(div);
    };

    /**
     * Load a resource definition.
     */
    Aria.resourcesDefinition = function (res) {
        var resClassRef = Aria.getClassRef(res.$classpath);

        // if resource class has been already instantiated do json injection only
        if (resClassRef) {
            // inject resources for new locale
            var proto = resClassRef.classDefinition.$prototype;
            aria.utils.Json.inject(res.$resources, proto, true);
            // injecting in $prototype is not sufficient because simple values
            // are not updated on the singleton instance. That's why we are doing the
            // following loop:
            for (var i in proto) {
                if (proto.hasOwnProperty(i)) {
                    resClassRef[i] = proto[i];
                }
            }
            // store info about resource files (per locale) loaded
            // aria.core.ResMgr.addResFile(resClassRef.$classpath);
            if (__clsMgr) {
                __clsMgr.notifyClassLoad(res.$classpath);
            }
        } else {
            // WRITING WITH BRACKETS ON PURPOSE (for documentation)
            Aria['classDefinition']({
                $classpath : res.$classpath,
                $singleton : true,
                $constructor : function () {},
                $prototype : res.$resources
            });
        }
    };

    /**
     * Copy globals corresponding to all loaded classes.
     * @param {Object} object on which all globals corresponding to loaded classes will be copied.
     */
    Aria.copyGlobals = function (object) {
        object.Aria = Aria;
        var global = Aria.$global;
        var classes = Aria.$classes;
        for (var i = 0, l = classes.length; i < l; i++) {
            var classRef = classes[i];
            if (classRef) {
                var classpath = classRef.$classpath;
                if (!classpath) {
                    var classDef = classRef.classDefinition || classRef.interfaceDefinition;
                    if (classDef) {
                        classpath = classDef.$classpath;
                    }
                }
                if (classpath) {
                    var dotPosition = classpath.indexOf(".");
                    var startName = dotPosition > -1 ? classpath.substring(0, dotPosition) : classpath;
                    object[startName] = global[startName];
                }
            }
        }
    };

    /**
     * This method executes the callback once the DOM is in ready state.
     * @param {aria.core.CfgBeans:Callback} cb a callback function
     */
    Aria.onDomReady = function (cb) {
        aria.dom.DomReady.onReady(cb);
    };

    if (Aria.$frameworkWindow) {
        if (Aria.rootFolderPath == null) { // Aria.rootFolderPath can be an empty string; it is a correct value.

            // Finding Aria.rootFolderPath
            var me, scripts, myUrl;

            // First we retrieve the url of Aria.js (me) in the page.
            // As browsers ensure that all file are executed in the good order, at this stage the script tag that loaded
            // me can only be the last script tag of this page.
            scripts = Aria.$frameworkWindow.document.getElementsByTagName("script");
            me = scripts[scripts.length - 1];
            scripts = null;
            myUrl = me.src; // In all the browsers it's an absolute path, in IE6,7 is relative

            // rootFolderPath is just the folder above the folder of Aria.js
            var removeJsFile = myUrl.replace(/aria\/[^\/]*$/, ""); // when it is not packaged
            if (removeJsFile == myUrl) {
                removeJsFile = removeJsFile.substring(0, removeJsFile.lastIndexOf("/")) + "/";
            }

            // When the path is relative, this can become empty, take the current location
            if (!removeJsFile) {
                var currentLocation = Aria.$frameworkWindow.location;
                removeJsFile = currentLocation.protocol + "//" + currentLocation.host + "/";
                var pathname = currentLocation.pathname;
                // remove everything after the last / on pathname
                pathname = pathname.match(/[\/\w\.\-]+\//gi);
                if (pathname) {
                    pathname = pathname[0];
                } else {
                    pathname = "";
                }
                removeJsFile += pathname;

            }

            /**
             * Path from the current page to the Aria.js script Possible values could be "" or "../" or "../xyz"
             * @name Aria.rootFolderPath
             * @type String
             */
            Aria.rootFolderPath = removeJsFile;

        }

        if (Aria.rootFolderPath == "/") { // this will happen with IE (04204517)
            var currentURL = Aria.$frameworkWindow.location;
            Aria.rootFolderPath = currentURL.protocol + "//" + currentURL.host + "/";
        }
    }

    /**
     * Empty function. To be used whenever an empty function is needed in order to avoid closures
     * @type Function
     */
    Aria.empty = function () {};

    /**
     * Return true. To be used in order to avoid closures
     * @type Function
     */
    Aria.returnTrue = function () {
        return true;
    };

    /**
     * Return false. To be used in order to avoid closures
     * @type Function
     */
    Aria.returnFalse = function () {
        return false;
    };

    /**
     * Return null. To be used in order to avoid closures
     * @type Function
     */
    Aria.returnNull = function () {
        return null;
    };

    /*
     * We need __temporaryIsIE outside of the closure to define the correct version of Aria["eval"]. In IE with Selenium,
     * adding the sourceURL raises an error. (PTR 05647136)
     */
    Aria.__tempIE = __temporaryIsIE;

})();

/**
 * Call eval and enable better debugging support with source URL. There is a bug in firebug which prevents the source
 * code loaded by an eval which comes from code loaded by an eval to be shown properly (with comments and correct
 * indentation). Aria.js is not loaded through an eval, so that there is no problem here.
 * @param {String} srcJS string to be evaluated
 * @param {String} srcURL path to the file containing the string (useful when debugging)
 * @param {Object} evalContext An object to be available from the javascript code being evaluated. The object is named
 * evalContext.
 */
Aria["eval"] = Aria.__tempIE ? function (srcJS, srcURL, evalContext) {
    // PTR 05647136: on IE with Selenium, adding the sourceURL raises an error.
    // Moreover, the debugger in IE does not make any use of sourceURL.
    return eval(srcJS);
} : function (srcJS, srcURL, evalContext) {
    // PTR 05051375: this eval method must be put outside of the closure because, in packaged mode, variables in the
    // closure are renamed and it is possible that loading a file through eval changes the value of those variables
    // resulting in very strange JS exceptions

    // changed by assignment inside the eval
    if (srcURL) {
        // To have better debugging support:
        srcJS = [srcJS, '\n//@ sourceURL=', Aria.rootFolderPath, srcURL, '\n'].join('');
    }
    return eval(srcJS);
};

delete Aria.__tempIE;
(function () {

    var disposeTag = Aria.FRAMEWORK_PREFIX + 'isDisposed';

    /**
     * Private method to remove interceptors.
     * @param {Object} allInterceptors obj.__$interceptors
     * @param {String} name [mandatory] name interface name
     * @param {Object} scope [optional] if specified, only interceptors with that scope will be removed
     * @param {Function} fn [optional] if specified, only interceptors with that function will be removed
     */
    var __removeInterceptorCallback = function (allInterceptors, name, scope, fn) {
        for (var i in allInterceptors[name]) {
            if (allInterceptors[name].hasOwnProperty(i)) {
                __removeCallback(allInterceptors[name], i, scope, fn);
            }
        }
    };

    /**
     * Private method used to remove callbacks from a map of callbacks associated to a given scope and function
     * @param {Object} callbacksMap map of callbacks, which can be currently: obj._listeners
     * @param {String} name [mandatory] name in the map, may be the event name (if callbacksMap == _listeners)
     * @param {Object} scope [optional] if specified, only callbacks with that scope will be removed
     * @param {Function} fn [optional] if specified, only callbacks with that function will be removed
     * @param {Object} src [optional] if the method is called from an interface wrapper, must be the reference of the
     * interface wrapper. It is used to restrict the callbacks which can be removed from the map.
     * @param {Boolean} firstOnly. if true, remove only first occurence.
     * @private
     */
    var __removeCallback = function (callbacksMap, name, scope, fn, src, firstOnly) {
        if (callbacksMap == null) {
            return; // nothing to remove
        }

        var arr = callbacksMap[name];

        if (arr) {
            var length = arr.length, removeThis = false, cb;
            for (var i = 0; i < length; i++) {
                cb = arr[i];

                // determine if callback should be removed, start with
                // removeThis = true and then set to false if
                // conditions are not met

                // check the interface from which we remove the listener
                removeThis = (!src || cb.src == src)
                        // scope does not match
                        && (!scope || scope == cb.scope)
                        // fn does not match
                        && (!fn || fn == cb.fn);

                if (removeThis) {
                    // mark the callback as being removed, so that it can either
                    // still be called (in case of CallEnd in
                    // interceptors, if CallBegin has been called) or not called
                    // at all (in other cases)
                    cb.removed = true;
                    arr.splice(i, 1);
                    if (firstOnly) {
                        break;
                    } else {
                        i--;
                        length--;
                    }
                }
            }
            if (arr.length === 0) {
                // no listener anymore for this event/interface
                callbacksMap[name] = null;
                delete callbacksMap[name];
            }
        }
    };

    /**
     * Interceptor dispatch function.
     * @param {Object} interc interceptor instance
     * @param {Object} info interceptor parameters
     */
    var __callInterceptorMethod = function (info) {
        var methodName = aria.utils.String.capitalize(info.method);
        var fctRef = this["on" + methodName + info.step];
        if (fctRef) {
            return fctRef.call(this, info);
        }
        fctRef = this["on" + info.method + info.step];
        if (fctRef) {
            return fctRef.call(this, info);
        }
    };

    /**
     * Recursive method to call wrappers. This method should be called with "this" refering to the object whose method
     * is called.
     */
    var __callWrapper = function (args, commonInfo, interceptorIndex) {
        if (interceptorIndex >= commonInfo.nbInterceptors) {
            // end of recursion: call the real method:
            return this[commonInfo.method].apply(this, args);
        }
        var interc = commonInfo.interceptors[interceptorIndex];
        if (interc.removed) {
            // interceptor was removed in the mean time, skip it.
            return __callWrapper.call(this, info.args, commonInfo, interceptorIndex + 1);
        }
        var info = {
            step : "CallBegin",
            method : commonInfo.method,
            args : args,
            cancelDefault : false,
            returnValue : null
        };
        var asyncCbParam = commonInfo.asyncCbParam;
        if (asyncCbParam != null) {
            var callback = {
                fn : __callbackWrapper,
                scope : this,
                args : {
                    info : info,
                    interc : interc,
                    // save previous callback:
                    origCb : args[asyncCbParam]
                }
            };
            args[asyncCbParam] = callback;
            if (args.length <= asyncCbParam) {
                // We do this check and set the length property because the
                // "args" object comes
                // from the JavaScript arguments object, which is not a real
                // array so that the
                // length property is not updated automatically by the previous
                // assignation: args[asyncCbParam] = callback;
                args.length = asyncCbParam + 1;
            }
            info.callback = callback;
        }
        this.$callback(interc, info);
        if (!info.cancelDefault) {
            // call next wrapper or real method:
            try {
                info.returnValue = __callWrapper.call(this, info.args, commonInfo, interceptorIndex + 1);
            } catch (e) {
                info.exception = e;
            }
            info.step = "CallEnd";
            delete info.cancelDefault; // no longer useful in CallEnd
            // call the interceptor, even if it was removed in the mean time (so
            // that CallEnd is always called when
            // CallBegin has been called):
            this.$callback(interc, info);
            if ("exception" in info) {
                throw info.exception;
            }
        }
        return info.returnValue;
    };

    /**
     * Callback wrapper.
     */
    var __callbackWrapper = function (res, args) {
        var interc = args.interc;
        if (interc.removed) {
            // the interceptor was removed in the mean time, call the original callback directly
            return this.$callback(args.origCb, res);
        }
        var info = args.info;
        info.step = "Callback";
        info.callback = args.origCb;
        info.callbackResult = res;
        info.cancelDefault = false;
        info.returnValue = null;
        this.$callback(interc, info);
        if (info.cancelDefault) {
            return info.returnValue;
        }
        return this.$callback(args.origCb, info.callbackResult);
    };

    /**
     * Determines if a method has been intercepted: the interceptor contains on[methodName]CallBegin,
     * on[methodName]Callback, on[methodName]CallEnd.
     * @param {String} methodName the method name that could be intercepted.
     * @param {Object} interceptor contains an intercepting method for the methodName.
     * @return {Boolean} true if method has been intercepted
     */
    var __hasBeenIntercepted = function (methodName, interceptor) {
        var capitalizedMethodName = "on" + aria.utils.String.capitalize(methodName);
        if ((interceptor[capitalizedMethodName + "CallBegin"] || interceptor[capitalizedMethodName + "Callback"] || interceptor[capitalizedMethodName
                + "CallEnd"])
                || (interceptor["on" + methodName + "CallBegin"] || interceptor["on" + methodName + "Callback"] || interceptor["on"
                        + methodName + "CallEnd"])) {
            return true;
        }
        return false;
    };

    /**
     * Adds an interceptor to all methods.
     * @param {Object} interfaceMethods all methods for the interface
     * @param {aria.core.CfgBeans:Callback} interceptor a callback which will receive notifications
     * @return {Object} interceptedMethods
     */
    var __interceptCallback = function (interfaceMethods, interceptor, allInterceptors) {
        var interceptedMethods = allInterceptors || {};
        // for a callback, intercept all methods of an interface
        for (var i in interfaceMethods) {
            if (interfaceMethods.hasOwnProperty(i)) {
                (interceptedMethods[i] || (interceptedMethods[i] = [])).push(interceptor);
            }
        }
        return interceptedMethods;
    };

    /**
     * Targets specific methods to be intercepted.
     * @param {Object} interfaceMethods all methods for the interface
     * @param {Object} interceptor an object/class which will receive notifications
     * @return {Object} interceptedMethods
     */
    var __interceptObject = function (interfaceMethods, interceptor, allInterceptors) {
        var interceptedMethods = allInterceptors || {};
        // for a class object, intercept specific methods
        for (var m in interfaceMethods) {
            if (interfaceMethods.hasOwnProperty(m) && __hasBeenIntercepted(m, interceptor)) {
                (interceptedMethods[m] || (interceptedMethods[m] = [])).push({
                    fn : __callInterceptorMethod,
                    scope : interceptor
                });
            }
        }
        return interceptedMethods;
    };

    /**
     * Base class from which derive all JS classes defined through Aria.classDefinition()
     */
    Aria.classDefinition({
        $classpath : "aria.core.JsObject",
        // JsObject is an exception regarding $constructor and $destructor:
        // it is not necessary to call these methods when extending JsObject
        $constructor : function () {},
        $destructor : function () {
            // tag this instance as disposed.
            this[disposeTag] = true;
        },
        $statics : {
            // ERROR MESSAGES:
            UNDECLARED_EVENT : "undeclared event name: %1",
            MISSING_SCOPE : "scope property is mandatory when adding or removing a listener (event: %1)",
            INTERFACE_NOT_SUPPORTED : "The '%1' interface is not supported on this object (of type '%2').",
            ASSERT_FAILURE : "Assert #%1 failed in %2",
            CALLBACK_ERROR : "An error occurred while processing a callback function: \ncalling class: %1\ncalled class: %2"
        },
        $prototype : {
            /**
             * Prototype init method called at prototype creation time Allows to store class-level objects that are
             * shared by all instances
             * @param {Object} p the prototype object being built
             * @param {Object} def the class definition
             * @param {Object} sdef the superclass class definition
             */
            $init : function (p, def, sdef) {
                p.$on = p.$addListeners; // shortcut
            },

            /**
             * Check that a statement is true - if not an error is raised sample: this.@assert(12,myvar=='XYZ')
             * @param {Integer} id unique id that must be created and passed by the developer to easily track the assert
             * in case of failure
             * @param {Boolean} value value to assert - if not true an error is raised note: doesn't need to be a
             * boolean - as for an if() statement: e.g. this.$assert(1,{}) will return true
             * @return {Boolean} true if assert is OK
             */
            $assert : function (id, value) {
                if (value) {
                    return true;
                }
                this.$logError(this.ASSERT_FAILURE, [id, this.$classpath]);
                return false;
            },

            /**
             * Method to call on any object prior to deletion
             */
            $dispose : function () {
                this.$destructor(); // call $destructor
                // TODO - cleanup object
                if (this._listeners) {
                    this._listeners = null;
                    delete this._listeners;
                }
                if (this.__$interceptors) {
                    this.__$interceptors = null;
                    delete this.__$interceptors;
                }
                if (this.__$interfaces) {
                    aria.core.Interfaces.disposeInterfaces(this);
                }
            },

            /**
             * If profiling util is loaded, save the current timestamp associated to the given message in the
             * Aria.profilingData array. The classpath of this class will also be included in the record.
             * @param {String} message associated to the timestamp
             */
            $logTimestamp : Aria.empty,

            /**
             * Starts a time measure. Returns the id used to stop the measure.
             * @param {String} msg
             * @return {Number} profilingId
             */
            $startMeasure : Aria.empty,

            /**
             * Stops a time measure. If the id is not specified, stop the last measure with this classpath.
             * @param {String} classpath
             * @param {String} id
             */
            $stopMeasure : Aria.empty,

            /**
             * Log a debug message to the logger
             * @param {String} msg the message text
             * @param {Array} msgArgs An array of arguments to be used for string replacement in the message text
             * @param {Object} obj An optional object to be inspected in the logged message
             */
            $logDebug : function (msg, msgArgs, obj) {
                // replaced by the true logging function when aria.core.Log is loaded
                return "";
            },

            /**
             * Log an info message to the logger
             * @param {String} msg the message text
             * @param {Array} msgArgs An array of arguments to be used for string replacement in the message text
             * @param {Object} obj An optional object to be inspected in the logged message
             */
            $logInfo : function (msg, msgArgs, obj) {
                // replaced by the true logging function when aria.core.Log is loaded
                return "";
            },

            /**
             * Log a warning message to the logger
             * @param {String} msg the message text
             * @param {Array} msgArgs An array of arguments to be used for string replacement in the message text
             * @param {Object} obj An optional object to be inspected in the logged message
             */
            $logWarn : function (msg, msgArgs, obj) {
                // replaced by the true logging function when aria.core.Log is loaded
                return "";
            },

            /**
             * Log an error message to the logger
             * @param {String} msg the message text
             * @param {Array} msgArgs An array of arguments to be used for string replacement in the message text
             * @param {Object} err The actual JS error object that was created or an object to be inspected in the
             * logged message
             */
            $logError : function (msg, msgArgs, err) {
                // replaced by the true logging function when
                // aria.core.Log is loaded
                // If it's not replaced because the log is never
                // downloaded, at least there will be errors in the
                // console.
                if (Aria.$global.console) {
                    if (typeof msgArgs === "string")
                        msgArgs = [msgArgs];
                    Aria.$global.console.error(msg.replace(/%[0-9]+/g, function (token) {
                        return msgArgs[parseInt(token.substring(1), 10) - 1];
                    }), err);
                }
                return "";
            },

            /**
             * Generic method allowing to call-back a caller in asynchronous processes
             * @param {aria.core.CfgBeans:Callback} cb callback description
             * @param {MultiTypes} res first result argument to pass to cb.fn (second argument will be cb.args)
             * @param {String} errorId error raised if an exception occurs in the callback
             * @return {MultiTypes} the value returned by the callback, or undefined if the callback could not be
             * called.
             */
            $callback : function (cb, res, errorId) {
                try {
                    if (!cb) {
                        return; // callback is sometimes not used
                    }

                    if (cb.$Callback) {
                        return cb.call(res);
                    }

                    // perf optimisation : duplicated code on purpose
                    var scope = cb.scope, callback;
                    scope = scope ? scope : this;
                    if (!cb.fn) {
                        callback = cb;
                    } else {
                        callback = cb.fn;
                    }

                    if (typeof(callback) == 'string') {
                        callback = scope[callback];
                    }

                    var args = (cb.apply === true && cb.args && Object.prototype.toString.apply(cb.args) === "[object Array]")
                            ? cb.args.slice()
                            : [cb.args];
                    var resIndex = (cb.resIndex === undefined) ? 0 : cb.resIndex;

                    if (resIndex > -1) {
                        args.splice(resIndex, 0, res);
                    }

                    return Function.prototype.apply.call(callback, scope, args);
                } catch (ex) {
                    this.$logError(errorId || this.CALLBACK_ERROR, [this.$classpath, (scope) ? scope.$classpath : ""], ex);
                }
            },

            /**
             * Gets a proper signature callback from description given in argument
             * @param {Object | String} cn callback signature
             * @return {Object} callback object with fn and scope
             */
            $normCallback : function (cb) {
                var scope = cb.scope, callback;
                scope = scope ? scope : this;
                if (!cb.fn) {
                    callback = cb;
                } else {
                    callback = cb.fn;
                }

                if (typeof(callback) == 'string') {
                    callback = scope[callback];
                }
                return {
                    fn : callback,
                    scope : scope,
                    args : cb.args,
                    resIndex : cb.resIndex,
                    apply : cb.apply
                };
            },

            /**
             * Display all internal values in a message box (debug and test purpose - usefull on low-end browsers)
             */
            $alert : function () {
                var msg = [], tp;
                msg.push('## ' + this.$classpath + ' ## ');
                for (var k in this) {
                    if (this.hasOwnProperty(k)) {
                        tp = typeof(this[k]);
                        if (tp == 'object' || tp == 'function')
                            msg.push(k += ':[' + tp + ']');
                        else if (tp == 'string')
                            msg.push(k += ':"' + this[k] + '"');
                        else
                            msg.push(k += ':' + this[k]);
                    }
                }
                Aria.$window.alert(msg.join('\n'));
                msg = null;
            },

            /**
             * toString override to ease debugging
             */
            toString : function () {
                return "[" + this.$classpath + "]";
            },

            /**
             * Returns a wrapper containing only the methods of the given interface.
             * @param {String|Function} itf Classpath of the interface or reference to the interface constructor.
             */
            $interface : function (itf) {
                return aria.core.Interfaces.getInterface(this, itf);
            },

            /**
             * Add an interceptor callback on an interface specified by its classpath.
             * @param {String} itf [mandatory] interface which will be intercepted
             * @param {Object|aria.core.CfgBeans:Callback} interceptor either a callback or an object/class which will
             * receive notifications
             */
            $addInterceptor : function (itf, interceptor) {
                // get the interface constructor:
                var itfCstr = this.$interfaces[itf];
                if (!itfCstr) {
                    this.$logError(this.INTERFACE_NOT_SUPPORTED, [itf, this.$classpath]);
                    return;
                }
                var allInterceptors = this.__$interceptors;
                if (allInterceptors == null) {
                    allInterceptors = {};
                    this.__$interceptors = allInterceptors;
                }
                var interceptMethods = (aria.utils.Type.isCallback(interceptor))
                        ? __interceptCallback
                        : __interceptObject;

                var itfs = itfCstr.prototype.$interfaces;
                for (var i in itfs) {
                    if (itfs.hasOwnProperty(i)) {
                        var interceptedMethods = interceptMethods(itfs[i].interfaceDefinition.$interface, interceptor, allInterceptors[i]);
                        allInterceptors[i] = interceptedMethods;
                    }
                }
            },

            /**
             * Remove interceptor callbacks or interceptor objects on an interface.
             * @param {String} itf [mandatory] interface which is intercepted
             * @param {Object} scope [optional] scope of the callbacks/objects to remove
             * @param {Function} fn [optional] function in the callbacks to remove
             */
            $removeInterceptors : function (itf, scope, fn) {
                var itfCstr = this.$interfaces[itf];
                var allInterceptors = this.__$interceptors;
                if (!itfCstr || !allInterceptors) {
                    return;
                }
                var itfs = itfCstr.prototype.$interfaces;
                // also remove the interceptor on all base interfaces of the interface
                for (var i in itfs) {
                    if (itfs.hasOwnProperty(i)) {
                        __removeInterceptorCallback(allInterceptors, i, scope, fn);
                    }
                }
            },

            /**
             * Call a method from this class, taking into account any registered interceptor.
             * @param {String} interfaceName Classpath of the interface in which the method is declared (directly). The
             * actual interface from which this method is called maybe an interface which extends this one.
             * @param {String} methodName Method name.
             * @param {Array} args Array of parameters to send to the method.
             * @param {Number} asyncCbParam [optional] if the method is asynchronous, must contain the index in args of
             * the callback parameter. Should be null if the method is not asynchronous.
             */
            $call : function (interfaceName, methodName, args, asyncCbParam) {
                var interceptors;
                if (this.__$interceptors == null || this.__$interceptors[interfaceName] == null
                        || (interceptors = this.__$interceptors[interfaceName][methodName]) == null) {
                    // no interceptor for that interface: call the method directly:
                    return this[methodName].apply(this, args);
                }
                return __callWrapper.call(this, args, {
                    interceptors : interceptors,
                    nbInterceptors : interceptors.length,
                    method : methodName,
                    asyncCbParam : asyncCbParam
                }, 0);
            },

            /**
             * Adds a listener to the current object
             * @param {Object} lstCfg list of events that are listen to. For each event a config object with the
             * following arguments should be provided:<br/>
             *
             * <pre>
             * fn: {Function} [mandatory] callback function
             * scope: {Object} [mandatory] object on wich the callback will be called
             * args: {Object} [optional] argument object that will be passed to the callback as 2nd argument (1st argument is the event object)
             *      Note: as a shortcut, the function only can be provided (in this case, the scope property has to be used - as in the example below for the 'error' event
             *      Note: if a scope property is defined in the map, it will be used as default for all events. A '*' event name can also be used to listen to all events.
             * </pre>
             *
             * @example
             * Sample call:
             * <pre>
             * <code>
             * o.$addListeners({
             *     'start' : {
             *         fn : this.onStart
             *     },
             *     'end' : {
             *         fn : this.onEnd,
             *         args : {
             *             description : &quot;Sample Callback Argument&quot;
             *         }
             *     },
             *     'error' : this.onError,
             *     scope : this
             * })
             * </code>
             * </pre>
             */
            $addListeners : function (lstCfg, itfWrap) {

                var defaultScope = (lstCfg.scope) ? lstCfg.scope : null;
                var src = itfWrap ? itfWrap : this;
                var lsn;
                for (var evt in lstCfg) {
                    if (!lstCfg.hasOwnProperty(evt)) {
                        continue;
                    }
                    lsn = lstCfg[evt];
                    if (evt == 'scope') {
                        continue;
                    }
                    // The comparison with null below is important, as
                    // an empty string is a valid event description.
                    if (evt != '*' && src.$events[evt] == null) {
                        // invalid event
                        this.$logError(this.UNDECLARED_EVENT, evt, src.$classpath);
                        continue;
                    }
                    if (lsn.$Callback) {
                        lsn = {
                            fn : function (evt, cb) {
                                cb.call(evt);
                            },
                            scope : this,
                            args : lsn
                        };
                    } else if (!lsn.fn) {
                        // shortcut as in 'error' sample
                        if (!defaultScope) {
                            this.$logError(this.MISSING_SCOPE, evt);
                            continue;
                        }
                        lsn = {
                            fn : lsn,
                            scope : defaultScope,
                            once : lstCfg[evt].listenOnce
                            // we keep track of listeners which are meant to be called just once
                        };
                    } else {
                        // make a copy of lsn before changing it
                        lsn = {
                            fn : lsn.fn,
                            scope : lsn.scope,
                            args : lsn.args,
                            once : lstCfg[evt].listenOnce,
                            apply : lsn.apply,
                            resIndex : lsn.resIndex
                            // we keep track of listeners which are meant to be called just once
                        };
                        // lsn is an object as in 'start' or 'end' samples set default scope
                        if (!lsn.scope) {
                            lsn.scope = defaultScope;
                        }
                        if (!lsn.scope) {
                            this.$logError(this.MISSING_SCOPE, evt);
                            continue;
                        }
                    }

                    // add listener to _listeners
                    if (this._listeners == null) {
                        this._listeners = {};
                        this._listeners[evt] = [];
                    } else {
                        if (this._listeners[evt] == null) {
                            this._listeners[evt] = [];
                        }
                    }
                    // keep the interface under which the listener was registered:
                    lsn.src = src;
                    this._listeners[evt].push(lsn);
                }
                defaultScope = lsn = evt = null;
            },

            /**
             * Remove a listener from the listener list
             * @param {Object} lstCfg list of events to disconnect - same as for addListener(), except that scope is
             * mandatory Note: if fn is not provided, all listeners associated to the scope will be removed
             * @param {Object} itfWrap
             */
            $removeListeners : function (lstCfg, itfWrap) {
                if (this._listeners == null) {
                    return;
                }
                var defaultScope = (lstCfg.scope) ? lstCfg.scope : null;
                var lsn;
                for (var evt in lstCfg) {
                    if (!lstCfg.hasOwnProperty(evt)) {
                        continue;
                    }
                    if (evt == 'scope') {
                        continue;
                    }
                    if (this._listeners[evt]) {
                        var lsnRm = lstCfg[evt];
                        if (typeof(lsnRm) == 'function') {
                            if (defaultScope == null) {
                                this.$logError(this.MISSING_SCOPE, evt);
                                continue;
                            }
                            __removeCallback(this._listeners, evt, defaultScope, lsnRm, itfWrap);
                        } else {
                            if (lsnRm.scope == null) {
                                lsnRm.scope = defaultScope;
                            }
                            if (lsnRm.scope == null) {
                                this.$logError(this.MISSING_SCOPE, evt);
                                continue;
                            }
                            __removeCallback(this._listeners, evt, lsnRm.scope, lsnRm.fn, itfWrap, lsnRm.firstOnly);
                        }

                    }
                }
                defaultScope = lsn = lsnRm = null;
            },

            /**
             * Remove all listeners associated to a given scope - if no scope is provided all listeneres will be removed
             * @param {Object} scope the scope of the listeners to remove
             */
            $unregisterListeners : function (scope, itfWrap) {
                if (this._listeners == null) {
                    return;
                }
                // We must check itfWrap == null, so that it is not possible to unregister all the events of an object
                // from its interface, if they have not been registered through that interface
                if (scope == null && itfWrap == null) {
                    // remove all events
                    for (var evt in this._listeners) {
                        if (!this._listeners.hasOwnProperty(evt)) {
                            continue;
                        }
                        this._listeners[evt] = null; // remove array
                        delete this._listeners[evt];
                    }
                } else {
                    // note that here, scope can be null (if itfWrap != null) we need to filter all events in this case
                    for (var evt in this._listeners) {
                        if (!this._listeners.hasOwnProperty(evt)) {
                            continue;
                        }
                        __removeCallback(this._listeners, evt, scope, null, itfWrap);
                    }
                }
                evt = null;
            },

            /**
             * Adds a listener to an event, and removes it right after the event has been raised. Please refer to
             * $addListeners() for parameters description
             */
            $onOnce : function (lstCfg, itfWrap) {
                for (var evt in lstCfg) {
                    if (lstCfg.hasOwnProperty(evt)) {
                        lstCfg[evt].listenOnce = true;
                    }
                }
                this.$addListeners(lstCfg, itfWrap);
            },

            /**
             * Internal method used by sub-classes to raise an event to the object listeners. The event object that will
             * be passed to the listener function will have the following structure:
             *
             * <pre>
             * {
             *      name: evtName,
             *      src: observableObject[someArg1:'xx', ...]
             * }
             * </pre>
             *
             * NOTE: All properties except name and src are specific to the event.
             * @param {String|Object} evtDesc The event description.
             * <p>
             * If provided as a String - evtDesc is the name of the event as specified by the object in
             * <code>$events</code>
             * </p>
             * <p>
             * If provided as a Map - evtDesc is expected to have a name property (for the event name) - all other
             * properties will be considered as event arguments
             * </p>
             * Sample calls:
             *
             * <pre>
             * this.$raiseEvent('load');
             * this.$raiseEvent({
             *     name : 'load',
             *     someProperty : 123
             * });
             * </pre>
             */
            $raiseEvent : function (evtDesc) {
                if (this._listeners == null) {
                    return;
                }
                var nm = '', hasArgs = false;
                if (typeof(evtDesc) == 'string') {
                    nm = evtDesc;
                } else {
                    nm = evtDesc.name;
                    hasArgs = true;
                }
                // The comparison with null below is important, as an empty string is a valid event description.
                if (nm == null || this.$events[nm] == null) {
                    this.$logError(this.UNDECLARED_EVENT, [nm, this.$classpath]);
                } else {
                    // loop on evtName + '*'
                    var evtNames = [nm, '*'], evt = null;
                    var listeners = this._listeners;
                    for (var idx = 0; idx < 2; idx++) {
                        // warning this can be disposed during this call as some events (like 'complete') may be caught
                        // for this purpose also make a copy because a callback could modify this list
                        var lsnList = listeners[evtNames[idx]];
                        if (lsnList) {
                            if (!evt) {
                                // create the event object if we have an event description object, we use it directly to
                                // be able to pass back parameters to the function which called $raiseEvent
                                evt = (hasArgs ? evtDesc : {});
                                evt.name = nm;
                                // the src property of the event is now set differently for each listener, because when
                                // interfaces have events, we do not want the event object to be used to access the
                                // whole object instead of only the interface
                            }
                            // also make a copy because a callback could modify this list
                            lsnList = lsnList.slice(0);

                            var sz = lsnList.length, lsn, src;
                            for (var i = 0; sz > i; i++) {
                                // call listener
                                lsn = lsnList[i];
                                src = lsn.src;
                                // Check lsn.removed because it is possible that the listener is removed while
                                // $raiseEvent is running.
                                // In this case, lsnList still contains the listener, but __removeListeners sets lsn.src
                                // to null
                                // Also check that the event is in src.$events in case idx == 1 because when registering
                                // a listener on '*' from an interface wrapper, the listener must only be called for
                                // events of the interface (not for all the events of the object).
                                // The comparison with null below is important, as an empty string is a valid event
                                // description.
                                if (!lsn.removed && (idx === 0 || src.$events[nm] != null)) {
                                    // update the source of the event (useful if registering an event from an interface)
                                    evt.src = src;

                                    if (lsn.once) {
                                        delete lsn.once;
                                        var rmvCfg = {};
                                        rmvCfg[evt.name] = lsn;

                                        // we must remove the listener before calling it (otherwise there can be
                                        // infinite loops in the framework...)
                                        this.$removeListeners(rmvCfg);
                                    }
                                    this.$callback(lsn, evt);
                                }
                            }
                            // set src to null so that storing the evt object does not grant access to the whole object
                            evt.src = null;
                        }
                    }
                    listeners = lsnList = sz = null;
                }
            }
        }
    });
})();
/**
 * @class aria.utils.Type Utilities for comparing types
 * @extends aria.core.JsObject
 * @singleton
 */
Aria.classDefinition({
    $classpath : 'aria.utils.Type',
    $singleton : true,
    $prototype : {

        /**
         * Check if the value is an array
         * @param {Object} value
         * @return {Boolean} isArray
         */
        isArray : function (value) {
            return Object.prototype.toString.apply(value) === "[object Array]";
        },

        /**
         * Check if the value is a string (for example, typeof(new String("my String")) is "object")
         * @param {Object} value
         * @return {Boolean} isString
         */
        isString : function (value) {
            if (typeof(value) === 'string') {
                return true;
            }
            return Object.prototype.toString.apply(value) === "[object String]";
        },

        /**
         * Check if the value is a RegularExpression
         * @param {Object} value
         * @return {Boolean} isRegExp
         */
        isRegExp : function (value) {
            return Object.prototype.toString.apply(value) === "[object RegExp]";
        },

        /**
         * Check if the value is a number
         * @param {Object} value
         * @return {Boolean} isNumber
         */
        isNumber : function (value) {
            if (typeof(value) === 'number') {
                return true;
            }
            return Object.prototype.toString.apply(value) === "[object Number]";
        },

        /**
         * Check if the value is a js Date
         * @param {Object} value
         * @return {Boolean} isDate
         */
        isDate : function (value) {
            return Object.prototype.toString.apply(value) === "[object Date]";
        },

        /**
         * Check if the value is a boolean
         * @param {Object} value
         * @return {Boolean} isBoolean
         */
        isBoolean : function (value) {
            return (value === true || value === false);
        },

        /**
         * Check if the value is a HTML element
         * @param {Object} object
         * @return {Boolean} isHTMLElement
         */
        isHTMLElement : function (object) {
            // http://www.quirksmode.org/dom/w3c_core.html#nodeinformation
            if (object) {
                var nodeName = object.nodeName;
                return object === Aria.$window || aria.utils.Type.isString(nodeName)
                        || object === Aria.$frameworkWindow;
            } else {
                return false;
            }
        },

        /**
         * Check if the value is an object
         * @param {Object} value
         * @return {Boolean} isObject return false if value is null or undefined.
         */
        isObject : function (value) {
            // check that the value is not null or undefined, because otherwise,
            // in IE, if value is undefined or null, the toString method returns Object anyway
            if (value) {
                return Object.prototype.toString.apply(value) === "[object Object]";
            } else {
                return false;
            }
        },

        /**
         * Check if the value is an instance object of the given classpath.
         * @param {Object} value
         * @param {String} classpath
         * @return {Boolean} true is value is an instance of the given classpath, false otherwise
         */
        isInstanceOf : function (value, classpath) {
            var myClass = Aria.getClassRef(classpath);
            if (myClass == null) {
                /* if the classpath is not loaded, the value cannot be an instance of it */
                return false;
            }
            return value instanceof myClass;
        },

        /**
         * Check if the object is a function
         * @param {Object} value
         * @return {Boolean} isFunction
         */
        isFunction : function (value) {
            return Object.prototype.toString.apply(value) === "[object Function]";
        },

        /**
         * Return true if value is an Object or an Array. It will however return false if the value is an instance of
         * aria.core.JsObject
         * @param {Object} value
         * @return {Boolean} isContainer
         */
        isContainer : function (value) {
            return (this.isObject(value) || this.isArray(value)) && !(value instanceof aria.core.JsObject);
        },

        /**
         * Check if the object is a callback
         * @param {Object} value
         * @return {Boolean}
         */
        isCallback : function (value) {
            if (value == null) {
                return false;
            }
            if (value.$Callback) {
                return true;
            }
            if (value.$classpath) {
                return false;
            }
            var normCb = this.$normCallback(value);
            return typeof(normCb.fn) == "function";
        }
    }
});
/**
 * Utilities for String manipulation
 */
Aria.classDefinition({
    $classpath : "aria.utils.String",
    $singleton : true,
    $dependencies : ["aria.utils.Type"],
    $prototype : {
        /**
         * Substitute %n parameters in a string
         * @param {String} string The source string to substitue %n occurences in
         * @param {Array|String} params The parameters to use for the substitution. Index 0 will replace %1, index 1, %2
         * and so on. If a string is passed, only %1 will be replaced
         * @return {String} The final string, with %n occurences replaced with their equivalent
         */
        substitute : function (string, params) {
            if (!aria.utils.Type.isArray(params)) {
                params = [params];
            }

            string = string.replace(/%[0-9]+/g, function (token) {
                var replacement = params[parseInt(token.substring(1), 10) - 1];
                return typeof replacement !== "undefined" ? replacement : token;
            });

            return string;
        },

        /**
         * Trim a String (remove trailing and leading white spaces)
         * @param {String} string
         * @return {String}
         */
        trim : String.trim ? String.trim : function (string) {
            return string.replace(/^\s+|\s+$/g, '');
        },

        /**
         * Return true if the character at index in str is escaped with backslashes.
         * @param {String} str
         * @param {Integer} index
         * @return {Boolean} true if the character is escaped, false otherwise
         */
        isEscaped : function (str, index) {
            var res = false;
            for (var i = index - 1; i >= 0; i--) {
                if (str.charAt(i) == "\\") {
                    res = !res;
                } else {
                    return res;
                }
            }
            return res;
        },

        /**
         * Find the next not escaped character findChar, after start in str.
         * @param {String} str
         * @param {String} findChar character to find in str
         * @param {Integer} start position in str (default value: 0)
         */
        indexOfNotEscaped : function (str, findChar, start) {
            var index = str.indexOf(findChar, start);
            while (index != -1) {
                if (!this.isEscaped(str, index)) {
                    return index;
                }
                // continue search after escaped character
                index = str.indexOf(findChar, index + 1);
            }
            return -1;
        },

        /**
         * Escape < and > and & in the given string
         * @param {String} str
         * @return {String}
         */
        escapeHTML : function (str) {
            return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        },

        /**
         * Escape " and ' the given string.
         * @param {String} str
         * @return {String} the escaped string
         */
        escapeHTMLAttr : function (str) {
            return str.replace(/'/g, "&#x27;").replace(/"/g, "&quot;");
        },

        /**
         * Escape the given string depending on the options. The string can be escaped for different contexts: - safe
         * insertion inside an HTML text node - safe insertion inside an attribute value
         * @param {String} str input string
         * @param {Object|Boolean} options when it is a boolean, if it is true the input string is escaped for all the
         * contexts, otherwise it is left unmodified. When it is an object, the string is escaped only for the specified
         * contexts. Here is the format of the object:
         *
         * <pre>
         * {
         *   attr: true, // will escape the string for safe insertion inside the value of an attribute
         *   text: false // will NOT escape the string for safe insertion inside an HTML text node
         * }
         * </pre>
         *
         * When the value is nor a boolean neither an object (null, undefined, number...) the string is escaped for all
         * the contexts (equivalent to passing true).
         * @return {String} processed string
         */
        escapeForHTML : function (str, options) {
            var escapeForHTMLText = false;
            var escapeForHTMLAttr = false;

            if (aria.utils.Type.isObject(options)) {
                escapeForHTMLText = options.text === true;
                escapeForHTMLAttr = options.attr === true;
            } else if (!aria.utils.Type.isBoolean(options) || options) {
                escapeForHTMLText = true;
                escapeForHTMLAttr = true;
            }

            if (escapeForHTMLText) {
                str = this.escapeHTML(str).replace(/\//g, "&#x2F;");
            }

            if (escapeForHTMLAttr) {
                str = this.escapeHTMLAttr(str);
            }

            return str;
        },

        /**
         * Remove accents from a string
         * @param {String} stringToStrip the string from which you want to remove accentuation
         * @return {String} The string, stripped from any accent
         */
        stripAccents : function (stringToStrip) {
            var s = stringToStrip;
            s = s.replace(/[\u00E0\u00E2\u00E4]/gi, "a");
            s = s.replace(/[\u00E9\u00E8\u00EA\u00EB]/gi, "e");
            s = s.replace(/[\u00EE\u00EF]/gi, "i");
            s = s.replace(/[\u00F4\u00F6]/gi, "o");
            s = s.replace(/[\u00F9\u00FB\u00FC]/gi, "u");
            return s;
        },

        /**
         * Find next white space in the given string after start position and before end position
         * @param {String} str The string into which we search
         * @param {Integer} start The position in str at which we should begin the search (included)
         * @param {Integer} end The position in str at which we should end the search (excluded)
         * @param {RegExp} regexp The regular expression used to recognize a white space. If not provided, /\s/ is used.
         * @return {Integer} the position of the whitespace in str (between start and end), or -1 if it was not found
         */
        nextWhiteSpace : function (str, start, end, regexp) {
            var currentCharPos = start, whiteRegexp = regexp || /\s/, currentChar;
            while (currentCharPos < end) {
                currentChar = str.charAt(currentCharPos);
                if (whiteRegexp.test(currentChar)) {
                    return currentCharPos;
                }
                currentCharPos++;
            }
            return -1;
        },

        /**
         * Transform a string into a string that will evaluate to its original value
         * @param {String} param
         * @return {String}
         */
        stringify : function (param) {
            return '"' + param.replace(/([\\\"])/g, "\\$1").replace(/(\r)?\n/g, "\\n") + '"';
        },

        /**
         * Tell if a string ends exactly with a certain token
         * @param {String} str Where to search
         * @param {String} suffix Ending part
         * @return {Boolean}
         */
        endsWith : function (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        },

        /**
         * Encode untrusted data for attribute values like value, name, class... This shouldn't be used for complex
         * attributes like style, href... It assumes that the attribute is inside double quotes
         * @param {String} str String to encode
         * @return {String} Encoded string
         */
        encodeForQuotedHTMLAttribute : function (str) {
            return (str) ? str.replace(/"/g, "&quot;") : "";
        },

        /**
         * Puts the first character of each word in uppercase, other characters are unaffected.
         * @param {String} str
         * @return {String}
         */
        capitalize : function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        /**
         * Add some padding to a string in order to have a minimu length. If the minimum length is smaller than the
         * string length, nothing is done.
         * @param {String} string The string that requires padding
         * @param {Number} size Minimum length
         * @param {String} character Character to add.
         * @param {Boolean} begin Add character at the beginning or at the end of the string. If true at the beginning.
         * Default false.
         * @return {String} Padded string
         */
        pad : function (string, size, character, begin) {
            string = "" + string;
            var length = string.length;
            if (length < size) {
                var padding = [];
                for (var difference = size - length; difference > 0; difference -= 1) {
                    padding.push(character);
                }

                if (begin === true) {
                    string = padding.join("") + string;
                } else {
                    string = string + padding.join("");
                }
            }
            return string;
        },

        /**
         * Remove all consecutive occurrences of a character from the beginning or end of a string. It's like trim but
         * instead of removing white spaces removes the specified character. Unlike trim it works on one direction only.
         * @param {String} string String to be cropped
         * @param {Number} size Minimum size of the resulting string
         * @param {String} character Character to be removed
         * @param {Boolean} begin Crop from the beginning or the end of the string. If true crops from the beginning.
         * Default false.
         */
        crop : function (string, size, character, begin) {
            var start, length;
            if (begin === true) {
                for (start = 0, length = string.length - size; start < length; start += 1) {
                    if (string.charAt(start) !== character) {
                        break;
                    }
                }

                return string.substring(start);
            } else {
                for (start = string.length - 1; start >= size; start -= 1) {
                    if (string.charAt(start) !== character) {
                        break;
                    }
                }

                return string.substring(0, start + 1);
            }
        },

        /**
         * Split a string into an array of chunks. The length of the chunks is given by size that can be either
         * <ul>
         * <li> a number, all chunks will have the same size, except the last one if shorter than size</li>
         * <li> an array of numbers, chunks will respectively have same length as the number in the array. If the string
         * is longer than the sum of array numbers, the last chunk will contain the remaining part of the string.</li>
         * </ul>
         * @param {String} string String to splitted
         * @param {Number|Array} size Length of chunks. If an array, the element at position 0 is the length of the
         * first chunk.
         * @param {Boolean} begin If true chunks are created from right to left. Default false
         * @return {Array} List of chunks. Calling join('') on this array always returns the initial string.
         * @example
         *
         * <pre>
         * chunk('abcdefg', 3, true);
         * ['abc', 'def', 'g']
         *
         * chunk('abcdefg', 3, false);
         * ['a', 'bcd', 'efg']
         *
         * chunk('abcdefg', [1, 2], true);
         * ['ab', 'c', 'defg']
         *
         * chunk('abcdefg', [1, 2], false);
         * ['abcd', 'e', 'fg']
         * </pre>
         */
        chunk : function (string, size, begin) {
            if (!aria.utils.Type.isString(string)) {
                return null;
            } else if (!string) {
                return [string];
            }

            if (aria.utils.Type.isArray(size)) {
                return this._chunkArray(string, size, begin);
            } else {
                return this._chunkNumber(string, size, begin);
            }
        },

        /**
         * Internal method to chunk on numbers
         * @param {String} string Original string
         * @param {Number} size Chunk's length
         * @param {Boolean} begin True to chunk from the beginning
         * @return {Array} List of chunks
         * @private
         */
        _chunkNumber : function (string, size, begin) {
            var result = [], start, strLen = string.length;

            if (size < 1 || size >= strLen) {
                return [string];
            } else if (size === 1) {
                // split is faster than what I want to do
                return string.split('');
            }

            if (begin === true) {
                start = 0;
                while (start < strLen) {
                    result.push(string.substr(start, size));
                    start += size;
                }

                return result;
            } else {
                start = strLen;
                while (start > 0) {
                    result.push(string.substring(Math.max(0, start - size), start));
                    start -= size;
                }

                return result.reverse();
            }
        },

        /**
         * Internal method to chunk on numbers
         * @param {String} string Original string
         * @param {Array} size List of chunk's length
         * @param {Boolean} begin True to chunk from the beginning
         * @return {Array} List of chunks
         * @private
         */
        _chunkArray : function (string, size, begin) {
            var result = [], start, strLen = string.length, i, len;

            if (begin === true) {
                start = 0;

                for (i = 0, len = size.length; i < len; i += 1) {
                    result.push(string.substr(start, size[i]));
                    start += size[i];

                    if (start >= strLen) {
                        break;
                    }
                }

                if (start < strLen) {
                    // string was not consumed completely
                    result.push(string.substring(start));
                }

                return result;
            } else {
                start = strLen;

                for (i = 0, len = size.length; i < len; i += 1) {
                    result.push(string.substring(Math.max(0, start - size[i]), start));
                    start -= size[i];

                    if (start <= 0) {
                        break;
                    }
                }

                if (start > 0) {
                    // string was not consumed completely
                    result.push(string.substring(0, start));
                }

                return result.reverse();
            }
        },

        /**
         * Convert from camel case to hyphenated version.
         * @param {String} str camel cased string e.g. "fooBarABC"
         * @return {String} hyphenated string e.g. "foo-bar-a-b-c"
         */
        camelToDashed : function (str) {
            return str.replace(/[A-Z]/g, function (letter) {
                return "-" + letter.toLowerCase();
            }).replace(/^-/, ""); // strip leading dash if first char was uppercase
        },

        /**
         * Convert from hyphenated string to camel case.
         * @param {String} str hyphenated string e.g. "foo-bar-a-b-c"
         * @return {String} camel cased equivalent e.g. "fooBarABC"
         */
        dashedToCamel : function (str) {
            return str.replace(/-([a-z])/ig, function (match, letter) {
                return letter.toUpperCase();
            });
        }
    }
});
(function () {
    var console = Aria.$global.console;
    /**
     * Default appender used by the logger to output log lines. The default appender is using Firebug/Firebug lite to
     * log (or in fact, any console that defines the window.console object). Other appenders can be written by extending
     * this default class in order to output elsewhere.
     */
    Aria.classDefinition({
        $classpath : "aria.core.log.DefaultAppender",
        $prototype : console ? {
            /**
             * Output the first part of the string corresponding to the classname in the log
             * @param {String} className
             * @return {String} The formatted classname
             * @private
             */
            _formatClassName : function (className) {
                return "[" + className + "] ";
            },

            /**
             * Inspect an object in a log
             * @param {Object} o the object to inspect
             * @private
             */
            _inspectObject : function (o) {
                if (o && typeof o == "object" && console.dir) {
                    console.dir(o);
                }
            },

            /**
             * Debug
             * @param {String} className
             * @param {String} msg The message text (including arguments)
             * @param {String} msgText The message text (before arguments were replaced)
             * @param {Object} o An optional object to be inspected
             */
            debug : function (className, msg, msgText, o) {
                if (console.debug) {
                    console.debug(this._formatClassName(className) + msg);
                } else if (console.log) {
                    console.log(this._formatClassName(className) + msg);
                }
                this._inspectObject(o);
            },

            /**
             * Info
             * @param {String} className
             * @param {String} msg The message text (including arguments)
             * @param {String} msgText The message text (before arguments were replaced)
             * @param {Object} o An optional object to be inspected
             */
            info : function (className, msg, msgText, o) {
                if (console.info) {
                    console.info(this._formatClassName(className) + msg);
                } else if (console.log) {
                    console.log(this._formatClassName(className) + msg);
                }
                this._inspectObject(o);
            },

            /**
             * Warn
             * @param {String} className
             * @param {String} msg The message text (including arguments)
             * @param {String} msgText The message text (before arguments were replaced)
             * @param {Object} o An optional object to be inspected
             */
            warn : function (className, msg, msgText, o) {
                if (console.warn) {
                    console.warn(this._formatClassName(className) + msg);
                } else if (console.log) {
                    console.log(this._formatClassName(className) + msg);
                }
                this._inspectObject(o);
            },

            /**
             * Error
             * @param {String} className
             * @param {String} msg The message text (including arguments)
             * @param {String} msgText The message text (before arguments were replaced)
             * @param {Object} e The exception to format
             */
            error : function (className, msg, msgText, e) {
                var message = this._formatClassName(className) + msg;
                var extraInfo = "";
                if (e) {
                    var extraInfo = (e.name && e.message) ? (e.name + ": " + e.message) : e.toString();
                    var stack = e.stack;
                    if (stack) {
                        // sometimes the stack starts with the name and message, sometimes not
                        if (extraInfo === stack.substring(0, extraInfo.length)) {
                            extraInfo = stack;
                        } else {
                            extraInfo += "\n" + stack;
                        }
                    }
                    extraInfo = "\n" + extraInfo;
                }
                console.error(message + extraInfo);
            }
        } : {
            debug : function () {},
            info : function () {},
            warn : function () {},
            error : function () {}
        }
    });
})();
/**
 * Singleton to be used to log messages from any class. This object should probably not be used
 * directly since any class in AriaTemplates inherits from JsObject and as such has the $log() method. Using the $log()
 * method makes it easier because it doesn't require you to pass your current classname.
 *
 * <pre>
 * aria.core.Log.warn('my.class.Name', 'Warning!!');
 * aria.core.Log.info('my.class.Name', 'Something was processed ...');
 * </pre>
 *
 * Additionally, this object can be used when debugging, to set the level of log you want to see per package/class. By
 * default, levels are already set, but you may use your own custom levels for debugging purposes
 *
 * <pre>
 * aria.core.Log.resetLoggingLevels();
 * aria.core.Log.setLoggingLevel('modules.*', aria.core.Log.LEVEL_DEBUG);
 * aria.core.Log.setLoggingLevel('my.class.Name', aria.core.Log.LEVEL_WARN);
 * </pre>
 *
 * When logging messages to the logger, appenders are used to actually print out the messages. By default, the only
 * appender used is the one printing results in the window.console object (Firebug, FirebugLite). It is however possible
 * to add appenders for debugging purposes:
 *
 * <pre>
 * aria.core.Log.clearAppenders();
 * aria.core.Log.addAppender(new aria.core.log.WindowAppender());
 * </pre>
 *
 * @singleton
 */
Aria.classDefinition({
    $classpath : "aria.core.Log",
    $singleton : true,
    $dependencies : ["aria.core.log.DefaultAppender", "aria.utils.String"],
    $statics : {
        /**
         * Debug log level
         * @type Number
         */
        LEVEL_DEBUG : 1,

        /**
         * Info log level
         * @type Number
         */
        LEVEL_INFO : 2,

        /**
         * Warning log level
         * @type Number
         */
        LEVEL_WARN : 3,

        /**
         * Error log level
         * @type Number
         */
        LEVEL_ERROR : 4
    },
    $constructor : function () {
        /**
         * The list of loggers already created so far, per className
         * @type Array
         * @private
         */
        this._loggers = [];

        /**
         * The logging configuration telling the logger which messages will make it to the console for each className
         * @type Array
         * @private
         */
        this._loggingLevels = {};

        /**
         * List of all the appenders configured in the logging system. By default, only one is present, the
         * DefaultAppender (outputting in the firebug console)
         * @private
         * @type Array
         */
        this._appenders = [];

        var oSelf = this;
        var jsObjectProto = aria.core.JsObject.prototype;
        // map function on JsObject prototype and Aria

        jsObjectProto.$logDebug = function (msg, msgArgs, obj) {
            oSelf.debug(this.$classpath, msg, msgArgs, obj);
            // return empty string to be used easily in templates
            return "";
        };
        Aria.$logDebug = jsObjectProto.$logDebug;

        jsObjectProto.$logInfo = function (msg, msgArgs, obj) {
            oSelf.info(this.$classpath, msg, msgArgs, obj);
            // return empty string to be used easily in templates
            return "";
        };
        Aria.$logInfo = jsObjectProto.$logInfo;

        jsObjectProto.$logWarn = function (msg, msgArgs, obj) {
            oSelf.warn(this.$classpath, msg, msgArgs, obj);
            // return empty string to be used easily in templates
            return "";
        };
        Aria.$logWarn = jsObjectProto.$logWarn;

        jsObjectProto.$logError = function (msg, msgArgs, err) {
            oSelf.error(this.$classpath, msg, msgArgs, err);
            // return empty string to be used easily in templates
            return "";
        };
        Aria.$logError = jsObjectProto.$logError;

        this.resetLoggingLevels();
        this.setLoggingLevel("*", Aria.debug ? this.LEVEL_DEBUG : this.LEVEL_ERROR);
        this.addAppender(new aria.core.log.DefaultAppender());
    },
    $destructor : function () {
        this.resetLoggingLevels();
        this.clearAppenders();

        // remove functions on JsObject and Aria (added in the constructor):

        var jsObjectProto = aria.core.JsObject.prototype;
        var alert = Aria.$window.alert;
        jsObjectProto.$logError = function (msg, msgArgs, err) {
            alert(["Error after aria.core.Log is disposed:\nin:", this.$classpath, "\nmsg:", msg].join(''));
        };
        Aria.$logError = jsObjectProto.$logError;

        var emptyFunction = function () {};
        jsObjectProto.$logDebug = emptyFunction;
        Aria.$logDebug = emptyFunction;
        jsObjectProto.$logInfo = emptyFunction;
        Aria.$logInfo = emptyFunction;
        jsObjectProto.$logWarn = emptyFunction;
        Aria.$logWarn = emptyFunction;
    },
    $prototype : {
        /**
         * Used to verify if a given level is within the known list of levels
         * @param {Number} level The level to test
         * @return {Boolean}
         */
        isValidLevel : function (level) {
            return (level == this.LEVEL_DEBUG || level == this.LEVEL_INFO || level == this.LEVEL_WARN || level == this.LEVEL_ERROR);
        },

        /**
         * Static method that is used to set the logging configuration for a specific className or part of a className.
         * By default, the Aria logger is already set with default values. This method is intended to be used during
         * debugging only to filter what you want to see printed in the console.
         *
         * <pre>
         * aria.core.Log.setLoggingLevel(&quot;a.*&quot;, aria.core.Log.LEVEL_ERROR);
         * aria.core.Log.setLoggingLevel(&quot;util.*&quot;, aria.core.Log.LEVEL_INFO);
         * aria.core.Log.setLoggingLevel(&quot;util.layouts.CardLayout&quot;, aria.core.Log.LEVEL_DEBUG);
         * </pre>
         *
         * @param {String} className The className to assign the level to
         * @param {Number} level The level of logging to allow
         */
        setLoggingLevel : function (className, level) {
            if (!this.isValidLevel(level)) {
                this.error(this.$classpath, "Invalid level passed to setLoggingLevel");
            } else {
                // TODO: Add here a check for the validity of a className:
                // possible values are a.b.c, or a.b.*
                this._loggingLevels[className] = level;
            }
        },

        /**
         * Reset all logging level configuration
         */
        resetLoggingLevels : function () {
            this._loggingLevels = [];
        },

        /**
         * Get the currently allowed logging level for a particular className
         * @param {String} className
         * @return {Number} level or false if no logging level is defined
         */
        getLoggingLevel : function (className) {
            var loggingLevel = this._loggingLevels[className];
            if (!!loggingLevel) {
                // If there is a logging level stored for the exact classname passed in parameter
                return loggingLevel;
            } else {
                // Else, look for package names
                var str = className;

                while (str.indexOf(".") != -1) {
                    str = str.substring(0, str.lastIndexOf("."));
                    if (this._loggingLevels[str]) {
                        return this._loggingLevels[str];
                    } else if (this._loggingLevels[str + ".*"]) {
                        return this._loggingLevels[str + ".*"];
                    }
                }

                return this._loggingLevels["*"] || false;
            }
        },

        /**
         * Is a specific level loggable for a given classname. Depending on the configuration of the logger sub-system,
         * we need to check if our current className supports at least this level of logging.
         * @param {String} level The level to test
         * @param {String} className The className to check
         * @return {Boolean}
         */
        isLogEnabled : function (level, className) {
            var minimumLevel = this.getLoggingLevel(className);

            // If we could find a minimum level authorized for this className
            // (or a best match)
            if (minimumLevel) {
                return level >= minimumLevel;
            } else {
                // If nothing was found in the conf for this class, no logging
                // is possible
                return false;
            }
        },

        /**
         * Add a new appender to the logging system
         * @param {aria.core.log.DefaultAppender} appender An instance of appender (must implement the same methods as
         * aria.core.log.DefaultAppender)
         */
        addAppender : function (appender) {
            this._appenders.push(appender);
        },

        /**
         * Remove all appenders in the logging system
         */
        clearAppenders : function () {
            var apps = this.getAppenders();
            for (var i = 0, l = apps.length; i < l; i++) {
                apps[i].$dispose();
            }
            this._appenders = [];
        },

        /**
         * Get the list of current appenders
         * @param {String} classpath Optional argument, if passed, only the appenders of the given classpath will be
         * returned
         * @return {Array} The list of appenders
         */
        getAppenders : function (classpath) {
            var apps = this._appenders;

            if (classpath) {
                apps = [];
                for (var i = 0; i < this._appenders.length; i++) {
                    if (this._appenders[i].$classpath == classpath) {
                        apps.push(this._appenders[i]);
                    }
                }
            }

            return apps;
        },

        /**
         * Prepare a message to be logged from a message text and an optional array of arguments
         * @param {String} msg Message text (which may contain %n)
         * @param {Array} msgArgs optional list of arguments to be replaced in the message with %n
         * @param {Object} errorContext Optional object passed in case of template parsing error only
         * @return {String} The message
         */
        prepareLoggedMessage : function (msg, msgArgs, errorContext) {
            if (msgArgs) {
                msg = aria.utils.String.substitute(msg, msgArgs);
            }
            for (var error in errorContext) {
                if (errorContext.hasOwnProperty(error)) {
                    msg += "\n" + error + " : " + errorContext[error] + "\n";
                }
            }
            return msg;
        },

        /**
         * Log a debug message.
         * @param {String} className The classname for which the log is to be done
         * @param {String} msg the message text
         * @param {Array} msgArgs An array of arguments to be used for string replacement in the message text
         * @param {Object} o An optional object to inspect
         */
        debug : function (className, msg, msgArgs, o) {
            this.log(className, this.LEVEL_DEBUG, msgArgs, msg, o);
        },

        /**
         * Log an info message
         * @param {String} className The classname for which the log is to be done
         * @param {String} msg the message text
         * @param {Array} msgArgs An array of arguments to be used for string replacement in the message text
         * @param {Object} o An optional object to inspect
         */
        info : function (className, msg, msgArgs, o) {
            this.log(className, this.LEVEL_INFO, msgArgs, msg, o);
        },

        /**
         * Log a warning message
         * @param {String} className The classname for which the log is to be done
         * @param {String} msg the message text
         * @param {Array} msgArgs An array of arguments to be used for string replacement in the message text
         * @param {Object} o An optional object to inspect
         */
        warn : function (className, msg, msgArgs, o) {
            this.log(className, this.LEVEL_WARN, msgArgs, msg, o);
        },

        /**
         * Log an error message
         * @param {String} className The classname for which the log is to be done
         * @param {String} msg the message text
         * @param {Array} msgArgs An array of arguments to be used for string replacement in the message text
         * @param {Object} e A JavaScript exception object or a object to inspect
         */
        error : function (className, msg, msgArgs, e) {
            this.log(className, this.LEVEL_ERROR, msgArgs, msg, e);
        },

        /**
         * Actually do the logging to the current appenders
         * @param {String} className The className that is logging
         * @param {String} level The level to log the message
         * @param {Array} msgArgs An array of arguments to be used for string replacement in the message text
         * @param {String} msg The message text
         * @param {Object} objOrErr Either an option object to be logged or an error message in case of error or fatal
         * levels
         */
        log : function (className, level, msgArgs, msgText, objOrErr) {
            if (!this.isValidLevel(level)) {
                this.error(this.$classpath, "Invalid level passed for logging the message");
            } else {
                if (this.isLogEnabled(level, className)) {
                    var msg = this.prepareLoggedMessage(msgText, msgArgs);
                    var apps = this.getAppenders();
                    for (var i = 0; i < apps.length; i++) {
                        if (level == this.LEVEL_DEBUG) {
                            apps[i].debug(className, msg, msgText, objOrErr);
                        }
                        if (level == this.LEVEL_INFO) {
                            apps[i].info(className, msg, msgText, objOrErr);
                        }
                        if (level == this.LEVEL_WARN) {
                            apps[i].warn(className, msg, msgText, objOrErr);
                        }
                        if (level == this.LEVEL_ERROR) {
                            apps[i].error(className, msg, msgText, objOrErr);
                        }
                    }
                }
            }
        }
    }
});(function () {
    var arrayPrototype = Array.prototype;
    var arrayUtils;

    /**
     * @class aria.utils.Array Utilities for manipulating javascript arrays
     * @extends aria.core.JsObject
     * @singleton
     */
    Aria.classDefinition({
        $classpath : 'aria.utils.Array',
        $singleton : true,
        $constructor : function () {
            arrayUtils = this;
        },
        $destructor : function () {
            arrayPrototype = null;
            arrayUtils = null;
        },
        $prototype : {

            /**
             * Returns the first (least) index of an element within the array equal to the specified value, or -1 if
             * none is found.
             * @param {Array} array Array to be searched.
             * @param {Object} element Element for which we are searching.
             * @return {Number} Index of the first matching array element.
             */
            indexOf : (!arrayPrototype.indexOf) ? (function (array, element) {
                var length = array.length;
                for (var i = 0; i < length; i++) {
                    if (i in array && array[i] === element) {
                        return i;
                    }
                }

                return -1;
            }) : function (array, element) {
                return array.indexOf(element);
            },

            /**
             * Test if the array contains the given object.
             * @param {Array} array Array to test for the presence of the element
             * @param {Object} element Element for which to test
             * @return {Boolean} true if element is present.
             */
            contains : function (array, element) {
                return arrayUtils.indexOf(array, element) != -1;
            },

            /**
             * Returns a copy of the given array. The cloned array can be modified without impacting the original array.
             * @param {Array} array The array to clone
             * @return {Array} The cloned array
             */
            clone : function (array) {
                var clonedArray = array.slice(0);
                return clonedArray;
            },

            /**
             * Removes the first occurrence of a particular value from an array.
             * @param {Array} array : Array from which to remove element
             * @param {Object} element : Element to remove
             * @return {Boolean} True if an element was removed.
             */
            remove : function (array, element) {
                var index = arrayUtils.indexOf(array, element);
                if (index > -1) {
                    arrayUtils.removeAt(array, index);
                    return true;
                }
                return false;
            },

            /**
             * Removes from an array the element at index i
             * @param {Array} array Array from which to remove element.
             * @param {Number} i The index to remove.
             * @return {Boolean} True if an element was removed.
             */
            removeAt : function (array, index) {
                return array.splice(index, 1).length == 1;
            },

            /**
             * Wether the array is empty of not
             * @param {Array} array Array from which to test
             * @return {Boolean} True if the array is empty
             */
            isEmpty : function (array) {
                return array.length === 0;
            },

            /**
             * Filter elements of an array according to the result of callback
             * @param {Array} array Array to filter.
             * @param {Function} Function to test each element of the array. This function receive as arguments the
             * value, the index and the array.
             * @param {Object} thisObject Object to use as this when executing callback.
             * @return {Array} array
             */
            filter : (!arrayPrototype.filter) ? function (array, callback, thisObject) {

                // clone array to avoid mutation when executing the callback
                var workArray = arrayUtils.clone(array);

                var res = [];
                thisObject = thisObject || array;
                var len = workArray.length;
                for (var i = 0; i < len; i++) {
                    var val = workArray[i];
                    if (callback.call(thisObject, val, i, array)) {
                        res.push(val);
                    }
                }
                return res;
            } : function (array, callback, thisObject) {
                return array.filter(callback, thisObject);
            },

            /**
             * Call a function on each element of the array
             * @param {Array} array Array to filter.
             * @param {Function} Function to test each element of the array. This function receive as arguments the
             * value, the index and the array.
             * @param {Object} thisObject Object to use as this when executing callback.
             */
            forEach : (!arrayPrototype.forEach) ? function (array, callback, thisObject) {

                // clone array to avoid mutation when executing the callback
                var workArray = arrayUtils.clone(array);

                var res = [];
                thisObject = thisObject || array;
                var len = workArray.length;
                for (var i = 0; i < len; i++) {
                    callback.call(thisObject, workArray[i], i, array);
                }
                return res;
            } : function (array, callback, thisObject) {
                return array.forEach(callback, thisObject);
            },

            /**
             * Return an array with the values contained in the given map.
             * @param {Object} map
             * @return {Array}
             */
            extractValuesFromMap : function (map) {
                var output = [];
                for (var k in map) {
                    if (map.hasOwnProperty(k)) {
                        output.push(map[k]);
                    }
                }
                return output;
            }
        }
    });

})();/**
 * Utils for javascript query strings
 * @singleton
 */
Aria.classDefinition({
    $classpath : "aria.utils.QueryString",
    $singleton : true,
    $constructor : function () {
        /**
         * Map query string key to their corresponding value
         * @type Object
         */
        this.keyValues = null;
    },
    $prototype : {
        /**
         * Parses current query string (from the window where the framework is loaded) and extracts the key values
         */
        _init : function () {
            var window = Aria.$frameworkWindow;
            if (window != null) {
                this.keyValues = this.parseQueryString(window.location.search);
            } else {
                this.keyValues = {};
            }
        },

        /**
         * Parses a query string and returns a map of parameter/values.
         * @param {String} queryString Query string. Can either be empty, or start with a "?" character.
         * @return {Object}
         */
        parseQueryString : function (queryString) {
            var res = {};
            if (queryString == null || queryString.length === 0) {
                return res;
            }
            queryString = queryString.substr(1, queryString.length); // remove "?" sign

            var pairs = queryString.split("&");
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split('=');
                var key = decodeURIComponent(pair[0]);
                var value = (pair.length == 2) ? decodeURIComponent(pair[1]) : key;
                res[key] = value;
            }
            return res;
        },

        /**
         * Gets the value of specific query string key (from the window where the framework is loaded,
         * Aria.$frameworkWindow)
         * @param {String} key
         * @return {String}
         */
        getKeyValue : function (key) {
            if (!this.keyValues) {
                this._init();
            }
            return this.keyValues[key];
        }
    }
});/**
 * Utility to convert data to a JSON string
 */
Aria.classDefinition({
    $classpath : "aria.utils.json.JsonSerializer",
    $dependencies : ["aria.utils.Type"],
    /**
     * @param {Boolean} optimized If true, an optimized version of the serializer will be used whwnever the options
     * allow to do so
     */
    $constructor : function (optimized) {
        this._optimized = optimized || false;
    },
    $prototype : function () {
        var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, meta = {
            // table of character substitutions
            '\b' : '\\b',
            '\t' : '\\t',
            '\n' : '\\n',
            '\f' : '\\f',
            '\r' : '\\r',
            '"' : '\\"',
            '\\' : '\\\\'
        };

        var specialCharRegexp = /\W/;
        var numberFirstRegexp = /^[0-9]/;

        var quote = function (string) {

            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can safely slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe escape
            // sequences.

            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        };

        var fastSerializer = (function () {
            var JSON = Aria.$global.JSON || {};
            if (JSON.stringify) {
                return JSON.stringify;
            } else {
                // This part was taken from https://github.com/douglascrockford/JSON-js/blob/master/json2.js

                String.prototype.toJSON = Number.prototype.toJSON = Aria.$global.Boolean.prototype.toJSON = function (
                        key) {
                    return this.valueOf();
                };

                var gap, indent;
                var str = function (key, holder) {

                    // Produce a string from holder[key].

                    var i, // The loop counter.
                    k, // The member key.
                    v, // The member value.
                    length, mind = gap, partial, value = holder[key];

                    // If the value has a toJSON method, call it to obtain a replacement value.

                    if (value && typeof value.toJSON === 'function') {
                        value = value.toJSON(key);
                    }

                    // What happens next depends on the value's type.

                    switch (typeof value) {
                        case 'string' :
                            return quote(value);

                        case 'number' :

                            // JSON numbers must be finite. Encode non-finite numbers as null.

                            return isFinite(value) ? String(value) : 'null';

                        case 'boolean' :
                        case 'null' :

                            // If the value is a boolean or null, convert it to a string. Note:
                            // typeof null does not produce 'null'. The case is included here in
                            // the remote chance that this gets fixed someday.

                            return String(value);

                            // If the type is 'object', we might be dealing with an object or an array or
                            // null.

                        case 'object' :

                            // Due to a specification blunder in ECMAScript, typeof null is 'object',
                            // so watch out for that case.

                            if (!value) {
                                return 'null';
                            }

                            // Make an array to hold the partial results of stringifying this object value.

                            gap += indent;
                            partial = [];

                            // Is the value an array?

                            if (Object.prototype.toString.apply(value) === '[object Array]') {

                                // The value is an array. Stringify every element. Use null as a placeholder
                                // for non-JSON values.

                                length = value.length;
                                if (indent) {
                                    for (i = 0; i < length; i += 1) {
                                        partial[i] = str(i, value) || 'null';
                                    }

                                    // Join all of the elements together, separated with commas, and wrap them in
                                    // brackets.

                                    v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap)
                                            + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                                    gap = mind;
                                } else {
                                    // optimized code that avoids the + string concatenation operator
                                    partial.push('[');
                                    for (i = 0; i < length; i += 1) {
                                        if (i !== 0) {
                                            partial.push(',');
                                        }
                                        partial.push(str(i, value) || 'null');
                                    }
                                    partial.push(']');
                                    v = partial.join('');
                                }
                                return v;
                            }

                            // Otherwise, iterate through all of the keys in the object.

                            if (indent) {
                                for (k in value) {
                                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                                        v = str(k, value);
                                        if (v) {
                                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                        }
                                    }
                                }

                                // Join all of the member texts together, separated with commas,
                                // and wrap them in braces.

                                v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n'
                                        + mind + '}' : '{' + partial.join(',') + '}';
                                gap = mind;
                            } else {
                                // optimized code that avoids the + string concatenation operator and minimizes the
                                // number of calls to Array.push method
                                var b = false;
                                partial.push('{');
                                for (k in value) {
                                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                                        v = str(k, value);
                                        if (v) {
                                            if (b) {
                                                partial[partial.length] = ",";
                                            }
                                            partial.push(quote(k), ':', v);
                                            b = true;
                                        }
                                    }
                                }
                                partial.push('}');
                                v = partial.join('');
                            }
                            return v;
                    }
                };

                return function (value, replacer, space) {

                    // The stringify method takes a value and an optional replacer, and an optional
                    // space parameter, and returns a JSON text. The replacer can be a function
                    // that can replace values, or an array of strings that will select the keys.
                    // A default replacer method can be provided. Use of the space parameter can
                    // produce text that is more easily readable.

                    var i;
                    gap = '';
                    indent = '';

                    // If the space parameter is a number, make an indent string containing that
                    // many spaces.

                    if (typeof space === 'number') {
                        for (i = 0; i < space; i += 1) {
                            indent += ' ';
                        }

                        // If the space parameter is a string, it will be used as the indent string.

                    } else if (typeof space === 'string') {
                        indent = space;
                    }

                    // Make a fake root object containing our value under the key of ''.
                    // Return the result of stringifying the value.

                    return str('', {
                        '' : value
                    });
                };
            }
        })();

        var typeUtil = aria.utils.Type;

        var defaults = {
            indent : "",
            maxDepth : 100,
            escapeKeyNames : true,
            encodeParameters : false,
            reversible : false,
            serializedDatePattern : "yyyy/MM/dd HH:mm:ss",
            keepMetadata : true
        };

        return {
            /**
             * Normalize the options by calling the protected method _normalizeOptions and call the protected method
             * _serialize
             * @public
             * @param {Object|Array|String|Number|Boolean|Date|RegExp|Function} item item to serialize
             * @param {aria.utils.json.JsonSerializerBeans:JsonSerializeOptions} options options for the serialization
             * @return {String} the serialized item. It is set to null if there is an error during the serialization
             */
            serialize : function (item, options) {
                options = (options) ? options : {};
                this._normalizeOptions(options);
                if (this._optimized && options.indent.length <= 10 && options.escapeKeyNames
                        && !options.encodeParameters && options.keepMetadata && options.maxDepth >= 100
                        && !options.reversible) {
                    var dateToJSON = Date.prototype.toJSON;
                    var regexpToJSON = RegExp.prototype.toJSON;
                    var functionToJSON = Function.prototype.toJSON;
                    try {
                        Date.prototype.toJSON = function () {
                            return aria.utils.Date.format(this, options.serializedDatePattern);
                        };
                        RegExp.prototype.toJSON = function () {
                            return this + '';
                        };
                        Function.prototype.toJSON = function () {
                            return "[function]";
                        };
                        return fastSerializer(item, null, options.indent);
                    } catch (e) {
                        return null;
                    } finally {
                        Date.prototype.toJSON = dateToJSON;
                        RegExp.prototype.toJSON = regexpToJSON;
                        Function.prototype.toJSON = functionToJSON;
                    }
                }
                return this._serialize(item, options);
            },

            /**
             * Normalize the options given to serialize
             * @protected
             * @param {aria.utils.json.JsonSerializerBeans:JsonSerializeOptions} options
             */
            _normalizeOptions : function (options) {
                for (var key in defaults) {
                    if (defaults.hasOwnProperty(key) && !(key in options)) {
                        options[key] = defaults[key];
                    }
                }
            },

            /**
             * Internal method to be called recursively in order to serialize an item. I does not perform options
             * normalization
             * @protected
             * @param {Object|Array|String|Number|Boolean|Date|RegExp} item item to serialize
             * @param {aria.utils.json.JsonSerializerBeans:JsonSerializeAdvancedOptions} options options for the
             * serialization
             * @return {String} the serialized item. It is set to null if there is an error during the serialization
             */
            _serialize : function (item, options) {

                if (item === null) {
                    return this._serializeNull(options);
                }
                if (typeUtil.isBoolean(item)) {
                    return this._serializeBoolean(item, options);
                }
                if (typeUtil.isNumber(item)) {
                    return this._serializeNumber(item, options);
                }
                if (typeUtil.isString(item)) {
                    return this._serializeString(item, options);
                }
                if (typeUtil.isDate(item)) {
                    return this._serializeDate(item, options);
                }
                if (typeUtil.isRegExp(item)) {
                    return this._serializeRegExp(item, options);
                }
                if (typeUtil.isArray(item)) {
                    return this._serializeArray(item, options);
                }
                if (typeUtil.isObject(item)) {
                    return this._serializeObject(item, options);
                }
                if (typeUtil.isFunction(item)) {
                    return this._serializeFunction(item, options);
                }

                return '"[' + typeof(item) + ']"';
            },

            /**
             * Protected method that is called whenever an object has to be serialized
             * @protected
             * @param {Object} item object to serialize
             * @param {aria.utils.json.JsonSerializerBeans:JsonSerializeAdvancedOptions} options options for the
             * serialization
             * @return {String} the serialized item. It is set to null if there is an error during the serialization
             */
            _serializeObject : function (item, options) {
                var indent = options.indent, output, baseIndent = (options.baseIndent) ? options.baseIndent : "";
                var subIndent = (indent) ? baseIndent + indent : null;

                if (options.maxDepth < 1) {
                    if (options.reversible) {
                        return null;
                    }
                    return '{...}';
                }
                var res = ["{"];
                if (indent) {
                    res.push("\n");
                }
                var isEmpty = true;

                for (var key in item) {
                    if (item.hasOwnProperty(key) && this.__preserveObjectKey(key, options)) {
                        isEmpty = false;
                        if (indent) {
                            res.push(subIndent);
                        }

                        if (options.escapeKeyNames || specialCharRegexp.test(key) || numberFirstRegexp.test(key)) {
                            res.push(quote(key) + ':');
                        } else {
                            res.push(key + ':');
                        }
                        if (indent) {
                            // to be compatible with JSON.stringify
                            res.push(' ');
                        }
                        var newOptions = aria.utils.Json.copy(options, true);
                        newOptions.baseIndent = subIndent;
                        newOptions.maxDepth = options.maxDepth - 1;
                        output = this._serialize(item[key], newOptions);
                        if (output === null) {
                            return null;
                        }
                        res.push(output);
                        if (indent) {
                            res.push(",\n");
                        } else {
                            res.push(',');
                        }

                    }
                }
                if (!isEmpty) {
                    res[res.length - 1] = ""; // remove last ','
                }
                if (indent) {
                    res.push("\n" + baseIndent + "}");
                } else {
                    res.push("}");
                }
                return res.join('');

            },

            /**
             * Wheter a key should be serialized in the result object or not. Metadata might be excluded depending on
             * the options.
             * @param {String} key Key name
             * @param {aria.utils.json.JsonSerializerBeans:JsonSerializeAdvancedOptions} options options for the
             * serialization
             * @return {Boolean}
             * @private
             */
            __preserveObjectKey : function (key, options) {
                if (!options.keepMetadata) {
                    return !aria.utils.Json.isMetadata(key);
                }
                return true;
            },

            /**
             * Protected method that is called whenever an array has to be serialized
             * @protected
             * @param {Array} item array to serialize
             * @param {aria.utils.json.JsonSerializerBeans:JsonSerializeAdvancedOptions} options options for the
             * serialization
             * @return {String} the serialized item. It is set to null if there is an error during the serialization
             */
            _serializeArray : function (item, options) {
                var indent = options.indent, output, baseIndent = (options.baseIndent) ? options.baseIndent : "";
                var subIndent = (indent) ? baseIndent + indent : null;

                if (options.maxDepth < 1) {
                    if (options.reversible) {
                        return null;
                    }
                    return '[...]';
                }
                var sz = item.length;
                if (sz === 0) {
                    return "[]";
                } else {
                    var res = ["["];
                    if (indent) {
                        res.push("\n");
                    }
                    for (var i = 0; sz > i; i++) {
                        if (indent) {
                            res.push(subIndent);
                        }
                        var newOptions = aria.utils.Json.copy(options, true);
                        newOptions.baseIndent = subIndent;
                        newOptions.maxDepth = options.maxDepth - 1;
                        output = this._serialize(item[i], newOptions);
                        if (output === null) {
                            return null;
                        }
                        res.push(output);
                        if (i != sz - 1) {
                            res.push(",");
                            if (indent) {
                                res.push("\n");
                            }
                        }
                    }
                    if (indent) {
                        res.push("\n" + baseIndent + "]");
                    } else {
                        res.push("]");
                    }
                }
                return res.join('');

            },

            /**
             * Protected method that is called whenever a string has to be serialized
             * @protected
             * @param {String} item string to serialize
             * @param {aria.utils.json.JsonSerializerBeans:JsonSerializeAdvancedOptions} options options for the
             * serialization
             * @return {String} the serialized item. It is set to null if there is an error during the serialization
             */
            _serializeString : function (item, options) {
                var stringContent;
                item = item.replace(/([\\\"])/g, "\\$1").replace(/(\r)?\n/g, "\\n");
                if (options.encodeParameters === true) {
                    stringContent = encodeURIComponent(item);
                } else {
                    stringContent = item;
                }

                return '"' + stringContent + '"';
            },

            /**
             * Protected method that is called whenever a number has to be serialized
             * @protected
             * @param {Number} item number to serialize
             * @param {aria.utils.json.JsonSerializerBeans:JsonSerializeAdvancedOptions} options options for the
             * serialization
             * @return {String} the serialized item. It is set to null if there is an error during the serialization
             */
            _serializeNumber : function (item, options) {
                return item + '';
            },

            /**
             * Protected method that is called whenever a boolean has to be serialized
             * @protected
             * @param {Boolean} item boolean to serialize
             * @param {aria.utils.json.JsonSerializerBeans:JsonSerializeAdvancedOptions} options options for the
             * serialization
             * @return {String} the serialized item. It is set to null if there is an error during the serialization
             */
            _serializeBoolean : function (item, options) {
                return (item) ? 'true' : 'false';
            },

            /**
             * Protected method that is called whenever a date has to be serialized
             * @protected
             * @param {Date} item date to serialize
             * @param {aria.utils.json.JsonSerializerBeans:JsonSerializeAdvancedOptions} options options for the
             * serialization
             * @return {String} the serialized item. It is set to null if there is an error during the serialization
             */
            _serializeDate : function (item, options) {
                if (options.reversible || !aria.utils.Date) {
                    return 'new Date(' + item.getTime() + ')';
                } else {
                    return '"' + aria.utils.Date.format(item, options.serializedDatePattern) + '"';
                }
            },

            /**
             * Protected method that is called whenever a regexp has to be serialized
             * @protected
             * @param {RegExp} item regexp to serialize
             * @param {aria.utils.json.JsonSerializerBeans:JsonSerializeAdvancedOptions} options options for the
             * serialization
             * @return {String} the serialized item. It is set to null if there is an error during the serialization
             */
            _serializeRegExp : function (item, options) {
                if (options.reversible) {
                    return item + "";
                } else {
                    return this._serializeString(item + "", options);
                }
            },

            /**
             * Protected method that is called whenever a function has to be serialized
             * @protected
             * @param {Function} item function to serialize
             * @param {aria.utils.json.JsonSerializerBeans:JsonSerializeAdvancedOptions} options options for the
             * serialization
             * @return {String} the serialized item. It is set to null if there is an error during the serialization
             */
            _serializeFunction : function (item, options) {
                return '"[function]"';
            },

            /**
             * Protected method that is called whenever null has to be serialized
             * @protected
             * @param {aria.utils.json.JsonSerializerBeans:JsonSerializeAdvancedOptions} options options for the
             * serialization
             * @return {String} the serialized item. It is set to null if there is an error during the serialization
             */
            _serializeNull : function () {
                return 'null';
            },

            /**
             * Parse a string as JSON. This uses a partial implementation of <a
             * href="https://github.com/douglascrockford/JSON-js/blob/master/json.js">Douglas Crockford's algorithm</a>
             * to parse JSON strings.<br />
             * It provides some security around the eval and resembles what was done in aria.utils.json.load()
             * @param {String} string The string to parse as JSON
             * @return {Object} JSON object
             * @throws SyntaxError
             */
            parse : function (string) {
                var text = String(string);

                // Run the text against regular expressions that look
                // for non-JSON patterns. We are especially concerned with '()' and 'new'
                // because they can cause invocation, and '=' because it can cause mutation.
                // But just to be safe, we want to reject all unexpected forms.

                // We split the stage into 4 regexp operations in order to work around
                // crippling inefficiencies in IE's and Safari's regexp engines. First we
                // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
                // replace all simple value tokens with ']' characters. Third, we delete all
                // open brackets that follow a colon or comma or that begin the text. Finally,
                // we look to see that the remaining characters are only whitespace or ']' or
                // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
                if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                    // this might throw a SyntaxError
                    return eval('(' + text + ')');
                } else {
                    throw new Error('aria.utils.json.JsonSerializer.parse');
                }
            }
        };
    }
});
(function () {

    // shortcut to array & type utils
    var arrayUtils, typeUtils, jsonUtils, parProp, res = [];

    /**
     * Returns the container for listener for an optional target property. Returns a different container for recursive
     * listeners.
     * @private
     * @param {String} property can be null
     * @param {Boolean} recursive
     * @return {String} the property name of the container
     */
    var __getListenerMetaName = function (property, recursive) {
        var metaName = recursive ? jsonUtils.META_FOR_RECLISTENERS : jsonUtils.META_FOR_LISTENERS;
        if (property != null) {// the comparison with null is important, as 0 or "" must be considered as valid
            // property names
            metaName += "_" + property;
        }
        return metaName;
    };

    /**
     * Returns whether the given object can be used as a container for addListener and setValue.
     * @param {Object} container Object
     * @return {Boolean}
     * @private
     */
    var __isValidContainer = function (container) {
        return typeUtils.isContainer(container) &&
                // not HTML element
                !typeUtils.isHTMLElement(container) &&
                // not on class instances
                !container.$JsObject;
    };

    /**
     * Remove back-reference link from oldChild to parent (previous link was: parent[property] = oldChild).
     * @param {Object} oldChild old child. (this method does nothing if the child is null or does not have any back
     * references)
     * @param {Object} parent
     * @param {String} property
     * @private
     */
    var __removeLinkToParent = function (oldChild, parent, property) {
        var oldChildParents = oldChild ? oldChild[parProp] : null;
        if (oldChildParents) {
            for (var index = 0, parentDescription; parentDescription = oldChildParents[index]; index++) {
                if (parentDescription.parent == parent && parentDescription.property == property) {
                    oldChildParents.splice(index, 1);
                    // there should be only one.
                    break;
                }
            }
        }
    };

    /**
     * Update back-references when the property name under which a parent was referencing a child changed.
     * @param {Object} child child. This method does nothing if the child is null or does not have any back references)
     * @param {Object} parent
     * @param {String} oldProperty
     * @param {String} newProperty
     * @private
     */
    var __changeLinkToParent = function (child, parent, oldProperty, newProperty) {
        var childParents = child ? child[parProp] : null;
        if (childParents) {
            for (var index = 0, parentDescription; parentDescription = childParents[index]; index++) {
                if (parentDescription.parent == parent && parentDescription.property == oldProperty) {
                    parentDescription.property = newProperty;
                    // there should be only one.
                    break;
                }
            }
        }
    };

    /**
     * Add a back-reference link from child to parent (knowing parent[property] = child). Recursively add
     * back-references in child if not already done.
     * @param {Object} child Child. (this method does nothing if the child is not a container)
     * @param {Object} parent
     * @param {String} property
     * @private
     */
    var __addLinkToParent = function (child, parent, property) {
        if (__isValidContainer(child)) {
            __checkBackRefs(child);
            // add a reference to the parent in the new property
            child[parProp].push({
                parent : parent,
                property : property
            });
        }
    };

    /**
     * Returns whether back references recursive methods will go down through links with that name.
     * @param {String} propertyName Property name.
     * @return {Boolean}
     * @private
     */
    var __includePropForBackRef = function (propertyName) {
        // which property names are included for back references
        return (propertyName != jsonUtils.OBJECT_PARENT_PROPERTY && propertyName != jsonUtils.META_FOR_LISTENERS && propertyName != jsonUtils.META_FOR_RECLISTENERS);
    };

    /**
     * This method checks that back references up to container are present in the data model. If not, they are added
     * recursively.
     * @param {Object} container Must already be checked as a container according to __isValidContainer.
     * @private
     */
    var __checkBackRefs = function (container) {
        if (container[parProp]) {
            // back references already present, nothing to do
            return;
        }
        // back references are not present yet
        container[parProp] = [];
        for (var childName in container) {
            if (container.hasOwnProperty(childName) && __includePropForBackRef(childName)) {
                var childValue = container[childName];
                if (__isValidContainer(childValue)) {
                    __checkBackRefs(childValue);
                    // Add the container reference and property name to the child 'aria:parent' array
                    childValue[parProp].push({
                        parent : container,
                        property : childName
                    });
                }
            }
        }
    };

    /**
     * Clean temporary markers pushed in the structure by exploring parents
     * @private
     * @param {Object} node to start with
     */
    var __cleanUpRecMarkers = function (node) {
        var recMarker = jsonUtils.TEMP_REC_MARKER;
        if (node[recMarker]) {
            node[recMarker] = false;
            delete node[recMarker];
            var parents = node[jsonUtils.OBJECT_PARENT_PROPERTY];
            if (parents) {
                for (var index = 0, l = parents.length; index < l; index++) {
                    __cleanUpRecMarkers(parents[index].parent);
                }
            }
        }
    };

    /**
     * Append the given new array of listeners to the existing array of listeners. It is used when retrieving the array
     * of listeners to call. The resulting array of listeners can be modified without changing newListeners. If both
     * element are null, will return null
     * @param {Array} newListeners listeners to add, can be null
     * @param {Array} existingListeners existing listeners, can be null
     * @return {Array}
     * @private
     */
    var __appendListeners = function (newListeners, existingListeners) {
        if (newListeners != null) {
            if (!existingListeners) {
                existingListeners = [];
            }
            existingListeners.push.apply(existingListeners, newListeners);
        }
        return existingListeners;
    };

    /**
     * Retrieve listeners in node and its parents
     * @private
     * @param {Object} node
     * @param {String} property (may be null, for changes which are not related to a specific property, e.g. splice on
     * an array)
     * @param {Boolean} retrieve recursive listeners only, default is false
     * @param {Array} listeners
     */
    var __retrieveListeners = function (node, property, recursive, listeners) {
        if (property != null) {
            // add property specific listeners
            listeners = __retrievePropertySpecificListeners(node, property, recursive, listeners);
        }

        // recursive check
        if (node[jsonUtils.TEMP_REC_MARKER]) {
            return listeners;
        }

        // add general listeners
        listeners = __retrievePropertySpecificListeners(node, null, recursive, listeners);

        // case parent property is defined: look for "recursive" listener in parent nodes
        var parents = node[jsonUtils.OBJECT_PARENT_PROPERTY];
        if (parents) {
            // mark this node has being visited
            node[jsonUtils.TEMP_REC_MARKER] = true;

            for (var index = 0, parentDesc; parentDesc = parents[index]; index++) {
                listeners = __retrieveListeners(parentDesc.parent, parentDesc.property, true, listeners);
            }
            // at the end, clean recursive markup (only first call will have recursive set to null)
            if (!recursive) {
                __cleanUpRecMarkers(node);
            }
        }

        return listeners;
    };

    /**
     * Retrieve property-specific listeners (both recursive and non recursive) on this node.
     * @private
     * @param {Object} node
     * @param {String} property
     * @param {Boolean} recursive
     * @param {Array} listeners
     */
    var __retrievePropertySpecificListeners = function (node, property, recursive, listeners) {
        // add property specific recursive listeners
        listeners = __appendListeners(node[__getListenerMetaName(property, true)], listeners);
        if (!recursive) {
            // add property specific non-recursive listeners
            listeners = __appendListeners(node[__getListenerMetaName(property)], listeners);
        }
        return listeners;
    };

    /**
     * Call the given listeners with the given parameter.
     * @param {Array} listeners array of listeners to call (can be retrieved with __retrieveListeners)
     * @param {Object} change object describing the change
     * @param {Object} listenerToExclude (optional) potential listener callback belonging to the object that raised the
     * change and which doesn't want to be notified
     */
    var __callListeners = function (listeners, change, listenerToExclude) {
        for (var idx = 0, length = listeners.length; idx < length; idx++) {
            var lsn = listeners[idx];
            if (lsn == listenerToExclude || !lsn) {
                continue;
            }
            var fn = lsn.fn;
            if (fn) {
                // note that calling $callback has an impact on performances (x2)
                // that's why we don't do it here
                fn.call(lsn.scope, change, lsn.args);
            }
        }
    };

    /**
     * Notifies JSON listeners that a value on the object they listen to has changed
     * @private
     * @param {Object} container reference to the data holder object - e.g. data.search.preferedCity
     * @param {String} property name of the property - e.g. '$value'
     * @param {Object} change object describing the change made to the property (containing oldValue/newValue if the
     * change was made with setValue)
     * @param {Array} listenerToExclude (optional) potential listener callback belonging to the object that raised the
     * change and which doesn't want to be notified
     */
    var __notifyListeners = function (container, property, change, listenerToExclude) {
        // retrieve listeners for this node and its parents
        // arguments given to the callback
        var listeners = __retrieveListeners(container, property);
        if (listeners) {
            change.dataHolder = container;
            change.dataName = property;
            __callListeners(listeners, change, listenerToExclude);
        }
    };

    /**
     * Json utility class
     * @singleton
     */
    Aria.classDefinition({
        $classpath : "aria.utils.Json",
        $dependencies : ["aria.utils.json.JsonSerializer"],
        $singleton : true,
        $constructor : function () {
            jsonUtils = this;
            arrayUtils = aria.utils.Array;
            typeUtils = aria.utils.Type;
            parProp = this.OBJECT_PARENT_PROPERTY;

            /**
             * Default JSON serializer used inside the convertToJsonString method
             * @private
             * @type aria.utils.json.JsonSerializer
             */
            this.__defaultJsonSerializer = new aria.utils.json.JsonSerializer(true);
        },
        $destructor : function () {
            jsonUtils = null;
            arrayUtils = null;
            typeUtils = null;
            parProp = null;
            res = null;
            this.__defaultJsonSerializer.$dispose();
            this.__defaultJsonSerializer = null;
        },
        $statics : {

            /**
             * Meta used in json to store listeners
             * @type String
             */
            META_FOR_LISTENERS : Aria.FRAMEWORK_PREFIX + 'listener',

            /**
             * Meta used in json to store recursive listeners
             * @type String
             */
            META_FOR_RECLISTENERS : Aria.FRAMEWORK_PREFIX + 'reclistener',

            /**
             * Property name for the parent information container
             * @type String
             */
            OBJECT_PARENT_PROPERTY : Aria.FRAMEWORK_PREFIX + 'parent',

            /**
             * Property name for recursive temporary markers
             * @type String
             */
            TEMP_REC_MARKER : Aria.FRAMEWORK_PREFIX + 'tempRecMarker',

            /**
             * Possible value for the change property when calling listeners. It is used when the key in the object
             * existed before and the value was changed.
             * @type Number
             */
            VALUE_CHANGED : 0,

            /**
             * Possible value for the change property when calling listeners. It is used when the key in the object did
             * not exist before and was added.
             * @type Number
             */
            KEY_ADDED : 1,

            /**
             * Possible value for the change property when calling listeners. It is used when a key was removed in an
             * object.
             * @type Number
             */
            KEY_REMOVED : 2,

            /**
             * Possible value for the change property when calling listeners. It is used for global listeners on arrays,
             * and their parent listener, when an operation which changes the length of the array is done.
             * @type Number
             */
            SPLICE : 3,

            // ERROR MESSAGES:
            INVALID_JSON_CONTENT : "An error occured while loading an invalid JSON content:\ncontext: %1\nJSON content:\n%2",
            NOT_OF_SPECIFIED_DH_TYPE : "Invalid data holder type: expected to be an object or an array. Data holder provided: ",
            INVALID_SPLICE_PARAMETERS : "Invalid splice parameters.",
            INVALID_JSON_SERIALIZER_INSTANCE : "The provided instance of JSON serializer does not have a serialize method."
        },
        $prototype : {
            /**
             * Converts an object to a JSON string
             * @param {Object|Array|String|Number|Boolean|Date|RegExp|Function} item item to serialize
             * @param {Object} options options for the serialize method of the serializer - optional
             * @param {Object} serializerInstance instance of a serializer - optional. If not provided, an instance of
             * the default serializer (aria.utils.json.JsonSerializer) is used. If the provided instance does not have a
             * serialize method, an error is raised
             * @return {String} the JSON string. null if the JSON serialization failed
             */
            convertToJsonString : function (item, options, serializerInstance) {
                if (serializerInstance) {
                    if ("serialize" in serializerInstance) {
                        return serializerInstance.serialize(item, options);
                    } else {
                        this.$logError(this.INVALID_JSON_SERIALIZER_INSTANCE);
                        return null;
                    }
                }

                return this.__defaultJsonSerializer.serialize(item, options);
            },

            /**
             * Changes the content of an array, adding new elements while removing old elements.
             * @param {Array} container Array to be modified.
             * @param {Number} index Index at which to start changing the array. If negative, will begin that many
             * elements from the end.
             * @param {Number} howManyRemoved An integer indicating the number of old array elements to remove. If
             * howMany is 0, no elements are removed.
             * @param {...*} var_args The elements to add to the array. If you don't specify any elements, the method
             * simply removes elements from the array.
             * @return {Array} an array containing the items removed from the original array, or null if an error
             * occurred (bad parameters).
             */
            splice : function (container, index, howManyRemoved) {
                var howManyAdded = arguments.length - 3;

                if (!(typeUtils.isArray(container) && typeUtils.isNumber(index) && typeUtils.isNumber(howManyRemoved)
                        && howManyAdded >= 0 && howManyRemoved >= 0)) {
                    this.$logError(this.INVALID_SPLICE_PARAMETERS, [], arguments);
                    return null;
                }

                // Adapt parameters:
                var oldLength = container.length;
                if (index < 0) {
                    // adapt the index value
                    index = oldLength + index;
                    if (index < 0) {
                        index = 0;
                    }
                }
                if (index > oldLength) {
                    index = oldLength;
                }
                if (index + howManyRemoved > oldLength) {
                    howManyRemoved = oldLength - index;
                }
                if (howManyAdded === 0 && howManyRemoved === 0) {
                    // no change
                    return [];
                }

                // call the splice method from JavaScript:
                var arrayPrototype = Array.prototype;
                var removed = arrayPrototype.splice.apply(container, arrayPrototype.slice.call(arguments, 1));

                // do some integrity checks:
                var newLength = container.length;
                this.$assert(526, howManyRemoved == removed.length);
                this.$assert(527, oldLength + howManyAdded - howManyRemoved == newLength);

                // Update back-references:
                if (container[parProp]) {
                    if (howManyRemoved > 0) {
                        // remove the parent info from the removed items
                        for (var i = howManyRemoved - 1; i >= 0; i--) {
                            __removeLinkToParent(removed[i], container, index + i);
                        }
                    }
                    if (howManyAdded > 0) {
                        // add the parent info to the added items:
                        for (var i = index + howManyAdded - 1; i >= index; i--) {
                            __addLinkToParent(container[i], container, i);
                        }
                    }
                    if (howManyAdded != howManyRemoved) {
                        // change the parent info of the moved items
                        for (var newIndex = index + howManyAdded, oldIndex = index + howManyRemoved; newIndex < newLength; newIndex++, oldIndex++) {
                            __changeLinkToParent(container[newIndex], container, oldIndex, newIndex);
                        }
                    }
                }

                // notify listeners, in two steps:
                // - first, property-specific listeners, for each index that changed
                // - then global listeners, to notify about splice change

                var listeners = null;
                var length = (howManyAdded == howManyRemoved) ? index + howManyAdded : Math.max(oldLength, newLength);
                for (var i = index; i < length; i++) {
                    listeners = __retrievePropertySpecificListeners(container, i);
                    if (listeners) {
                        var args = {
                            dataHolder : container,
                            dataName : i
                        };
                        if (i >= newLength) {
                            args.change = this.KEY_REMOVED;
                        } else {
                            args.change = this.VALUE_CHANGED;
                            args.newValue = container[i];
                        }
                        if (i < index + howManyRemoved) {
                            // removed value
                            args.oldValue = removed[i - index];
                        } else {
                            // either a moved item, or an item which was beyond the end of the original array
                            args.oldValue = container[i - howManyRemoved + howManyAdded];
                        }
                        __callListeners(listeners, args);
                    }
                }

                listeners = __retrieveListeners(container); // global listeners (not property-specific)
                if (listeners) {
                    __callListeners(listeners, {
                        change : this.SPLICE,
                        dataHolder : container,
                        index : index,
                        removed : removed,
                        added : arrayPrototype.slice.call(arguments, 3)
                    });
                }

                return removed;
            },

            /**
             * Delete a key in Json object (<code>delete container[property]</code>) and make sure all JSON
             * listeners are called.
             * @param {Object} container reference to the data holder object - e.g. data.search.preferedCity
             * @param {String} property name of the key to delete - e.g. '$value'
             * @param {String} listenerToExclude (optional) potential listener callback belonging to the object that
             * raised the change and which doesn't want to be notified
             * @param {Boolean} throwError, default is false
             */
            deleteKey : function (container, property, listenerToExclude, throwError) {
                if (!__isValidContainer(container)) {
                    if (throwError) {
                        throw {
                            code : this.NOT_OF_SPECIFIED_DH_TYPE
                        };
                    } else {
                        this.$logError(this.NOT_OF_SPECIFIED_DH_TYPE, null, container);
                    }
                    return;
                }
                if (container.hasOwnProperty(property)) {
                    var oldVal = container[property];
                    delete container[property];

                    // If the "aria:parent" meta-data is not present, we do not add or remove back-references
                    // to this object. This is only needed when manipulating listeners.
                    if (container[parProp] && __includePropForBackRef(property)) {
                        // if present, remove the reference to the parent from the parent description list of the old
                        // value
                        __removeLinkToParent(oldVal, container, property);
                    }

                    __notifyListeners(container, property, {
                        change : this.KEY_REMOVED,
                        oldValue : oldVal
                    }, listenerToExclude);
                }
            },

            /**
             * Set value in Json object (container[property]) and make sure all JSON listeners are called
             * @param {Object} container reference to the data holder object - e.g. data.search.preferedCity
             * @param {String} property name of the property to set - e.g. '$value'
             * @param {MultiTypes} val the value to set to the property
             * @param {String} listenerToExclude (optional) potential listener callback belonging to the object that
             * raised the change and which doesn't want to be notified
             * @param {Boolean} throwError, default is false
             * @return {MultiTypes} the new value
             */
            setValue : function (container, property, val, listenerToExclude, throwError) {
                // check for interface
                if (!__isValidContainer(container)) {
                    if (throwError) {
                        throw {
                            code : this.NOT_OF_SPECIFIED_DH_TYPE
                        };
                    } else {
                        this.$logError(this.NOT_OF_SPECIFIED_DH_TYPE, null, container);
                    }
                    return;
                }

                var exists = container.hasOwnProperty(property);
                var oldVal = container[property];
                container[property] = val;

                // do nothing if the value did not change or was not created:
                if (oldVal !== val || !exists) {
                    // If the "aria:parent" meta-data is not present, we do not add or remove back-references
                    // to this object. This is only needed when manipulating listeners.
                    if (container[parProp] && __includePropForBackRef(property)) {
                        // if present, remove the reference to the parent from the parent description list of the old
                        // value
                        __removeLinkToParent(oldVal, container, property);

                        // if the new child is a container, add the reference back to container in the child after
                        // checking the child has back-references in its sub-tree
                        __addLinkToParent(val, container, property);
                    }

                    __notifyListeners(container, property, {
                        change : exists ? this.VALUE_CHANGED : this.KEY_ADDED,
                        newValue : val,
                        oldValue : oldVal
                    }, listenerToExclude);
                }
                return val;
            },

            /**
             * Get value in Json object (container[property]) and return a default value if no value is defined
             * @param {Array} container reference to the data holder object - e.g. data.search.preferedCity
             * @param {String} property name of the property to set - e.g. '$value'
             * @param {String} defaultValue the default value to set dh property if not found
             * @return {MultiTypes} the value
             */
            getValue : function (container, property, defaultValue) {
                if (!container || !property || !(property in container)) {
                    return defaultValue;
                }
                return container[property];
            },

            /**
             * Adds a listener to an object. The listener is a standard callback which is called when data are modified
             * through setValue.
             * @param {Object} container reference to the data holder object - e.g. data.search.preferedCity
             * @param {String} property name of a given property in the targeted container. If specified, the callback
             * will be called only if this property is changed.
             * @param {aria.core.CfgBeans:Callback} callback listener callback to add. Note that JsObject.$callback is
             * not used for performance reasons, so that only the form { fn : {Function}, scope: {Object}, args :
             * {MultiTypes}} is supported for this callback.
             * @param {Boolean} throwError if true, throws errors instead of logging it.
             * @param {Boolean} recursive If true, the listener will also be called for changes in the whole sub-tree of
             * the container. If false, it will be called only for changes in the container itself.
             */
            addListener : function (container, property, callback, throwError, recursive) {

                // backward compatibility support -> new parameter has been introduced after container.
                if (typeUtils.isObject(property)) {
                    return this.addListener(container, null, property, callback, throwError);
                }

                // choose the appropriate meta name depending on the type
                var meta = __getListenerMetaName(property, recursive);
                if (!__isValidContainer(container)) {
                    if (throwError) {
                        throw {
                            code : this.NOT_OF_SPECIFIED_DH_TYPE
                        };
                    } else {
                        this.$logError(this.NOT_OF_SPECIFIED_DH_TYPE, null, container);
                    }
                    return;
                }

                if (!container[meta]) {
                    container[meta] = [callback];
                } else {
                    // check if not already in the list
                    var listeners = container[meta];
                    if (arrayUtils.indexOf(listeners, callback) > -1) {
                        return; // already in the array
                    }
                    listeners.push(callback);
                }
                if (recursive) {
                    __checkBackRefs(container);
                }
            },

            /**
             * Remove a Json listener from a Json object (dh)
             * @param {Object} container reference to the data holder object - e.g. data.search.preferedCity
             * @param {String} property name of a given property in the targeted container. If specified, the callback
             * will be called only if this property is changed.
             * @param {aria.core.CfgBeans:Callback} callback listener callback to remove (must be exactly the same
             * object as the one used in addListener)
             * @param {Boolean} recursive must has the same value as the one used for recursive in addListener
             */
            removeListener : function (container, property, callback, recursive) {

                // backward compatibility support -> new parameter has been introduced after container.
                if (typeUtils.isObject(property)) {
                    return this.removeListener(container, null, property, callback);
                }

                // choose the appropriate meta name depending on the type
                var meta = __getListenerMetaName(property, recursive);
                if (!container || container[meta] == null) {
                    return;
                }
                // retrieve meta object, and index of callback in this container
                var listeners = container[meta], idx = arrayUtils.indexOf(listeners, callback);
                if (idx > -1) {
                    if (listeners.length == 1) {
                        container[meta] = null;
                        delete container[meta];
                    } else {
                        listeners.splice(idx, 1);
                    }
                }
            },

            /**
             * Recursively copy a JSON object into another JSON object
             * @param {Object} obj a json object
             * @param {Boolean} rec recursive copy - default true
             * @param {Array} filters if obj is an Object, will copy only keys in new object at first level.
             * @param {Boolean} keepMeta keeps meta data not inserted by aria
             *
             * <pre>
             * copy({
             *     a : 1,
             *     b : 2,
             *     c : 3
             * }, true, ['a', 'b']) = {
             *     a : 1,
             *     b : 2
             * }
             * </pre>
             */
            copy : function (obj, rec, filters, keepMeta) {
                rec = (rec !== false);
                var container = false, res;
                if (typeUtils.isArray(obj)) {
                    res = [];
                    container = true;
                } else if (typeUtils.isObject(obj)) {
                    res = {};
                    container = true;
                }
                if (container) {
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            if (key.indexOf(":") != -1) {
                                if (!keepMeta) {
                                    continue;
                                } else {
                                    // meta-data from aria : we never copy them
                                    if (this.isMetadata(key)) {
                                        continue;
                                    }
                                }
                            }

                            if (filters && !arrayUtils.contains(filters, key)) {
                                continue; // filter elements
                            }

                            if (rec) {
                                res[key] = this.copy(obj[key], rec, null, keepMeta);
                            } else {
                                res[key] = obj[key];
                            }
                        }
                    }
                } else if (typeUtils.isDate(obj)) {
                    res = new Date(obj.getTime());
                } else {
                    res = obj;
                }
                return res;
            },

            /**
             * Load a JSON string and return the corresponding object
             * @param {String} str the JSON string
             * @param {Object} ctxt caller object - optional - used to retrieve the caller classpath in case of error
             * @param {String} errMsg the error message to use in case of problem - optional - default:
             * aria.utils.Json.INVALID_JSON_CONTENT
             * @return {Object}
             */
            load : function (str, ctxt, errMsg) {
                // TODO setup complete sandbox variables - e.g. through closure
                var res = null;
                try {
                    str = ('' + str).replace(/^\s/, ''); // remove first spaces
                    res = eval('(' + str + ')');
                } catch (ex) {
                    res = null;
                    if (!errMsg) {
                        errMsg = this.INVALID_JSON_CONTENT;
                    }
                    if (ctxt && ctxt.$classpath) {
                        ctxt = ctxt.$classpath;
                    }
                    this.$logError(errMsg, [ctxt, str], ex);
                }
                return res;
            },

            /**
             * Injects child elements of a JSON object (src) into another JSON object (target). The elements of the
             * target object that are not present in the src object will remain unchanged. For elements already present,
             * 2 strategies are possible: 1. if merge=true, injection will be recursive so that only new elements of the
             * src object will be added 2. if merge=false (default) elements already present in target will be replaced
             * by elements from the src object
             * @param {Object|Array} src the source JSON structure
             * @param {Object|Array} target the target JSON structure
             * @param {Boolean} merge tells if the injection must be recursive - default: false
             * @return {Boolean} true if the injection was handled correctly
             */
            inject : function (src, target, merge) {

                merge = merge === true;

                var allArray = (typeUtils.isArray(src) && typeUtils.isArray(target));
                var allObject = (typeUtils.isObject(src) && typeUtils.isObject(target));
                var elem;

                if (!allArray && !allObject) {
                    return false;
                }

                if (allArray) {
                    if (!merge) {
                        for (var i = 0, l = src.length; i < l; i++) {
                            target.push(src[i]);
                        }
                    } else {
                        for (var i = 0, l = src.length; i < l; i++) {
                            elem = src[i];
                            if (!target[i]) {
                                target[i] = elem;
                            } else {
                                if (typeUtils.isContainer(elem)) {
                                    // recursive merge
                                    if (!this.inject(elem, target[i], true)) {
                                        // recursive injection is not possible
                                        target[i] = elem;
                                    }
                                } else if (typeUtils.isDate(elem)) {
                                    target[i] = new Date(elem.getTime());
                                } else {
                                    // may be a string, number, boolean, or something else: function ...
                                    target[i] = elem;
                                }
                            }
                        }
                    }
                } else if (allObject) {
                    for (var key in src) {
                        if (src.hasOwnProperty(key)) {
                            elem = src[key];
                            if (!target[key] || !merge) {
                                this.setValue(target, key, elem);
                            } else {
                                if (typeUtils.isContainer(elem)) {
                                    // recursive merge
                                    if (!this.inject(elem, target[key], true)) {
                                        // recursive injection is not possible
                                        this.setValue(target, key, elem);
                                    }
                                } else if (typeUtils.isDate(elem)) {
                                    this.setValue(target, key, new Date(elem.getTime()));
                                } else {
                                    // may be a string, number, boolean, or something else: function ...
                                    this.setValue(target, key, elem);
                                }
                            }
                        }
                    }
                }
                return true;
            },

            /**
             * Checks whether a JSON object is fully contained in another.
             * @param {Object} big the container JSON structure
             * @param {Object} small the contained JSON structure
             * @return {Boolean} true if <i>small</i> is contained in <i>big</i>
             */
            contains : function (big, small) {
                var isBigArray = typeUtils.isArray(big), isBigObject = typeUtils.isObject(big), isSmallArray = typeUtils.isArray(small), isSmallObject = typeUtils.isObject(small);

                if (isBigArray && isSmallArray) {
                    for (var i = 0, l = small.length; i < l; i++) {
                        if (!this.contains(big[i], small[i])) {
                            return false;
                        }
                    }
                } else if (isBigObject && isSmallObject) {
                    for (var key in small) {
                        if (small.hasOwnProperty(key)) {
                            if (key.match(/:/)) {
                                continue; // meta-data: we don't copy them
                            }
                            if (small.hasOwnProperty(key)) {
                                if (!this.contains(big[key], small[key])) {
                                    return false;
                                }
                            }
                        }
                    }
                } else {
                    var allTime = (typeUtils.isDate(big) && typeUtils.isDate(small));
                    if (allTime) {
                        return (small.getTime() === big.getTime());
                    } else {
                        return small === big;
                    }
                }
                return true;
            },

            /**
             * Add an item to an array, optionally giving the index, and notify listeners. If the index is not provided,
             * the item is added at the end of the array.
             * @param {Array} array array to be modified
             * @param {Object} item item to be added
             * @param {Number} index index where to add the item
             */
            add : function (array, item, index) {
                if (index == null) {
                    index = array.length;
                }
                this.splice(array, index, 0, item);
            },

            /**
             * Remove an item from an array at the specified index and notify listeners.
             * @param {Array} array array to be modified
             * @param {Number} index index where to remove the item
             */
            removeAt : function (array, index) {
                this.splice(array, index, 1);
            },

            /**
             * Checks whether a JSON object is equal to another.
             * @param {Object} obj1 the first JSON structure
             * @param {Object} obj2 the other JSON structure
             * @return {Boolean} true if <i>obj1</i> is equal to <i>obj2</i>
             */
            equals : function (obj1, obj2) {
                return this.contains(obj1, obj2) && this.contains(obj2, obj1);
            },

            /**
             * Checks if a property of a JSON object is used as metadata in the framework
             * @param {String} property The property to check (String, Integer or Object)
             * @returns {Boolean} True if the property is a String and it's used as metadata, false otherwise
             */
            isMetadata : function (property) {
                if (!aria.utils.Type.isString(property)) {
                    return false;
                }
                return (property.indexOf(Aria.FRAMEWORK_PREFIX) === 0);
            },

            /**
             * Creates a copy of the object without metadata inside
             * @param {Object} object the object to copy
             * @return {Object}
             */
            removeMetadata : function (object) {
                if (!object || !__isValidContainer(object)) {
                    return object;
                }
                var clone = typeUtils.isArray(object) ? [] : {};
                for (var key in object) {
                    if (!this.isMetadata(key)) {
                        clone[key] = this.removeMetadata(object[key]);
                    }
                }
                return clone;
            }
        }
    });

})();
/**
 * Utils for general Objects/Map
 * @singleton
 */
Aria.classDefinition({
    $classpath : "aria.utils.Object",
    $singleton : true,
    $prototype : {
        /**
         * Returns an array of all own enumerable properties found upon a given object, in the same order as that provided by a for-in loop.
         * @public
         * @param {Object} object
         * @return {Array}
         */
        keys : (Object.keys) ? function (object) {
            if (!aria.utils.Type.isObject(object)) {
                return [];
            }

            return Object.keys(object);
        } : function (object) {
            if (!aria.utils.Type.isObject(object)) {
                return [];
            }
            var enumKeys = [];
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    enumKeys.push(key);
                }
            }
            return enumKeys;
        },

        /**
         * Returns true if the object has no own enumerable properties
         * @public
         * @param {Object} object
         * @return {Boolean}
         */
        isEmpty : function (object) {
            var keys = this.keys(object);
            return keys.length === 0;
        }
    }
});/**
 * @singleton Global class gathering information about current browser type and version A list of user agent string for
 * mobile phones could be find here: http://www.useragentstring.com/pages/Mobile%20Browserlist/
 */
Aria.classDefinition({
    $classpath : 'aria.core.Browser',
    $singleton : true,
    $constructor : function () {
        var navigator = Aria.$global.navigator;
        var ua = navigator ? navigator.userAgent.toLowerCase() : "";

        /**
         * The user agent string.
         * @type String
         */
        this.ua = ua;

        /**
         * True if the browser is any version of Internet Explorer.
         * @type Boolean
         */
        this.isIE = false;

        /**
         * True if the browser is Internet Explorer 6.
         * @type Boolean
         */
        this.isIE6 = false;

        /**
         * True if the browser is Internet Explorer 7.
         * @type Boolean
         */
        this.isIE7 = false;

        /**
         * True if the browser is Internet Explorer 8.
         * @type Boolean
         */
        this.isIE8 = false;

        /**
         * True if the browser is Internet Explorer 9.
         * @type Boolean
         */
        this.isIE9 = false;

        /**
         * True if the browser is Internet Explorer 10.
         * @type Boolean
         */
        this.isIE10 = false;

        /**
         * True if the browser is any version of Opera.
         * @type Boolean
         */
        this.isOpera = false;

        /**
         * True if the browser is any version of Chrome.
         * @type Boolean
         */
        this.isChrome = false;

        /**
         * True if the browser is any version of Safari.
         * @type Boolean
         */
        this.isSafari = false;

        /**
         * True if the browser is any version of Chrome or Safari.
         * @type Boolean
         */
        this.isWebkit = false;

        /**
         * True if the browser uses the Gecko engine.
         * @type Boolean
         */
        this.isGecko = false;

        /**
         * True if the browser is any version of Firefox.
         * @type Boolean
         */
        this.isFirefox = false;

        /**
         * Browser version.
         * @type String
         */
        this.version = "";

        /**
         * True if the operating systems is Windows.
         * @type Boolean
         */
        this.isWindows = false;

        /**
         * True if the operating systems is Mac.
         * @type Boolean
         */
        this.isMac = false;

        /**
         * Browser name.
         * @type String
         */
        this.name = "";

        /**
         * MacOS or Windows
         * @type String
         */
        this.environment = "";

        /**
         * Major version.
         * @type Integer
         */
        this.majorVersion = "";

        // For Mobile Browsers
        /**
         * True if the device is of type phone
         * @type Boolean
         */
        this.isPhone = false;

        /**
         * True if the device is of type tablet
         * @type Boolean
         */
        this.isTablet = false;

        /**
         * True if OS is iOS
         * @type Boolean
         */
        this.isIOS = false;

        /**
         * True if OS is Android
         * @type Boolean
         */
        this.isAndroid = false;

        /**
         * True if OS is Windows
         * @type Boolean
         */
        this.isWindowsPhone = false;

        /**
         * True if OS is BlackBerry
         * @type Boolean
         */
        this.isBlackBerry = false;

        /**
         * True if OS is Symbian
         * @type Boolean
         */
        this.isSymbian = false;

        /**
         * True if OS is some mobile OS
         * @type Boolean
         */
        this.isOtherMobile = false;

        // Only for Window Phone with IE+9
        /**
         * True if view type if Mobile
         * @type Boolean
         */
        this.isMobileView = false;

        /**
         * True if view type if Desktop
         * @type Boolean
         */
        this.DesktopView = false;

        // Check for browser Type

        /**
         * True if browser is of type FF http://hacks.mozilla.org/2010/09/final-user-agent-string-for-firefox-4/
         * @type Boolean
         */
        this.isFF = false;

        /**
         * True if browser type is blackberry
         * @type Boolean
         */
        this.isBlackBerryBrowser = false;

        /**
         * True if browser type is Android
         * @type Boolean
         */
        this.isAndroidBrowser = false;

        /**
         * True if browser type is Safari Mobile
         * @type Boolean
         */
        this.isSafariMobile = false;

        /**
         * True if browser type is Safari
         * @type Boolean
         */
        this.isSafari = false;

        /**
         * True if browser type is Chrome
         * @type Boolean
         */
        this.isChrome = false;

        /**
         * True if browser type is IE Mobile
         * @type Boolean
         */
        this.isIEMobile = false;

        /**
         * True if browser type is Opera Mobile
         * @type Boolean
         */
        this.isOperaMobile = false;

        /**
         * True if browser type is Opera Mini
         * @type Boolean
         */
        this.isOperaMini = false;

        /**
         * True if browser type is S60
         * @type Boolean
         */
        this.isS60 = false;

        /**
         * True if browser type is Phantomjs
         * @type Boolean
         */
        this.isPhantomJS = false;

        /**
         * True if browser type is S60
         * @type Boolean
         */
        this.isOtherBrowser = false;

        /**
         * OS running in Device
         * @type String
         */
        this.osName = "";

        /**
         * OS Version in Device
         * @type String
         */
        this.osVersion = "";

        /**
         * Browser Name
         * @type String
         */
        this.browserType = "";

        /**
         * Browser Version
         * @type String
         */
        this.browserVersion = "";

        /**
         * Device Name
         * @type String
         */
        this.deviceName = "";

        this._init();
    },
    $prototype : {
        /**
         * Returns browser name and version - ease debugging
         */
        toString : function () {
            return this.name + " " + this.version;
        },
        /**
         * Internal initialization function - automatically called when the object is created
         * @private
         */
        _init : function () {
            // browser determination
            var ua = this.ua;
            if (ua.indexOf('msie') > -1) {
                this.isIE = true;
                this.name = "IE";
                if (/msie[\/\s]((?:\d+\.?)+)/.test(ua)) {
                    this.version = RegExp.$1;
                    var ieVersion = parseInt(this.version, 10);

                    if (ieVersion == 6) {
                        this.isIE6 = true;
                    } else if (ieVersion >= 7) {
                        // PTR 05207453
                        // With compatibility view, it can become tricky to
                        // detect the version.
                        // What is important to detect here is the document mode
                        // (which defines how the browser really
                        // reacts), NOT the browser mode (how the browser says
                        // it reacts, through conditional comments
                        // and ua string).
                        //
                        // In IE7 document.documentMode is undefined. For IE8+
                        // (also in document modes emulating IE7) it is defined
                        // and readonly.

                        var document = Aria.$frameworkWindow.document;
                        var detectedIEVersion = document.documentMode || 7;
                        this["isIE" + detectedIEVersion] = true;
                        if (detectedIEVersion != ieVersion) {
                            // the browser is not what it claims to be!
                            // make sure this.version is consistent with isIE...
                            // variables
                            this.version = detectedIEVersion + ".0";
                        }
                    }
                }
            } else if (ua.indexOf('opera') > -1) {
                this.isOpera = true;
                this.name = "Opera";
            } else if (ua.indexOf('chrome') > -1) {
                this.isChrome = true;
                this.name = "Chrome";
            } else if (ua.indexOf('phantomjs') > -1) {
                this.isPhantomJS = true;
                this.name = "PhantomJS";
            } else if (ua.indexOf('webkit') > -1) {
                this.isSafari = true;
                this.name = "Safari";
            } else {
                if (ua.indexOf('gecko') > -1) {
                    this.isGecko = true;
                }
                if (ua.indexOf('firefox') > -1) {
                    this.name = "Firefox";
                    this.isFirefox = true;
                }
            }


            // common group for webkit-based browsers
            this.isWebkit = this.isSafari || this.isChrome || this.isPhantomJS;

            if (ua.indexOf("windows") != -1 || ua.indexOf("win32") != -1) {
                this.isWindows = true;
                this.environment = "Windows";
            } else if (ua.indexOf("macintosh") != -1) {
                this.isMac = true;
                this.environment = "MacOS";
            }

            // version determination
            if (this.isIE) {
                // already determined
            } else if (this.isFirefox) {
                if (/firefox[\/\s]((?:\d+\.?)+)/.test(ua)) {
                    this.version = RegExp.$1;
                }
            } else if (this.isSafari) {
                if (/version[\/\s]((?:\d+\.?)+)/.test(ua)) {
                    this.version = RegExp.$1;
                }
            } else if (this.isChrome) {
                if (/chrome[\/\s]((?:\d+\.?)+)/.test(ua)) {
                    this.version = RegExp.$1;
                }
            } else if (this.isPhantomJS) {
                if (/phantomjs[\/\s]((?:\d+\.?)+)/.test(ua)) {
                    this.version = RegExp.$1;
                }
            } else if (this.isOpera) {
                if (/version[\/\s]((?:\d+\.?)+)/.test(ua)) {
                    this.version = RegExp.$1;
                }
            }
            if (this.version) {
                if (/(\d+)\./.test(this.version)) {
                    this.majorVersion = parseInt(RegExp.$1, 10);
                }
            }

            // for Mobile browsers check
            if (this.ua) {

                // To Match OS and its Version
                var osPattern = [{
                            pattern : /(android)[\/\s-]?([\w\.]+)*/i
                        }, {
                            pattern : /(ip[honead]+).*os\s*([\w]+)*\slike\smac/i
                        }, {
                            pattern : /(blackberry).+version\/([\w\.]+)/i
                        }, {
                            pattern : /(rim\stablet+).*os\s*([\w\.]+)*/i
                        }, {
                            pattern : /(windows\sphone\sos|windows\s?[mobile]*)[\s\/\;]?([ntwce\d\.\s]+\w)/i
                        }, {
                            pattern : /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i
                        }, {
                            pattern : /(webos|palm\sos|bada|rim\sos|meego)[\/\s-]?([\w\.]+)*/i
                        }];
                // To Match Browser and its Version
                var browserPattern = [{
                            pattern : /(chrome|crios)\/((\d+)?[\w\.]+)/i
                        }, {
                            pattern : /(mobile\ssafari)\/((\d+)?[\w\.]+)/i
                        }, {
                            pattern : /(mobile)\/\w+\s(safari)\/([\w\.]+)/i
                        }, {
                            pattern : /(iemobile)[\/\s]?((\d+)?[\w\.]*)/i
                        }, {
                            pattern : /(safari)\/((\d+)?[\w\.]+)/i
                        }, {
                            pattern : /(series60.+(browserng))\/((\d+)?[\w\.]+)/i
                        }, {
                            pattern : /(firefox)\/([\w\.]+).+(fennec)\/\d+/i
                        }, {
                            pattern : /(opera\smobi)\/((\d+)?[\w\.-]+)/i
                        }, {
                            pattern : /(opera\smini)\/((\d+)?[\w\.-]+)/i
                        }, {
                            pattern : /(dolfin|Blazer|S40OviBrowser)\/((\d+)?[\w\.]+)/i
                        }];
                // To Match Device Name
                var devicerPattern = [{
                            pattern : /\(((ipad|playbook));/i
                        }, {
                            pattern : /\(((ip[honed]+));/i
                        }, {
                            pattern : /(blackberry[\s-]?\w+)/i
                        }, {
                            pattern : /(hp)\s([\w\s]+\w)/i
                        }, {
                            pattern : /(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i
                        }, {
                            pattern : /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i
                        }, {
                            pattern : /((s[cgp]h-\w+|gt-\w+|galaxy\snexus))/i
                        }, {
                            pattern : /sec-((sgh\w+))/i
                        }, {
                            pattern : /(maemo|nokia).*(\w|n900|lumia\s\d+)/i
                        }, {
                            pattern : /(lg)[e;\s\-\/]+(\w+)*/i
                        }, {
                            pattern : /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola)[\s_-]?([\w-]+)*/i
                        }];

                // for getting OS and Version
                this.__testUaMatch(osPattern, "OS");
                // for getting Browser and Version
                this.__testUaMatch(browserPattern, "BROWSER");
                // for getting the device
                this.__testUaMatch(devicerPattern, "DEVICE");
            }
        },
        /**
         * private function - To take the User Agents and match the patterns
         * @param {Array} pattern Array of User Agents
         * @param {String} type to match from user agents
         * @private
         */
        __testUaMatch : function (pattern, type) {
            var patternMatch;
            for (var i = 0, len = pattern.length; i < len; i++) {
                if (type === "OS") {
                    patternMatch = this.__checkNavigator(pattern[i].pattern, this.ua);
                    if (patternMatch) {
                        this.__setOs(patternMatch, i);
                        break;
                    }
                }
                if (type === "BROWSER") {
                    patternMatch = this.__checkNavigator(pattern[i].pattern, this.ua);
                    if (patternMatch) {
                        this.__setBrowser(patternMatch, i);
                        break;
                    }
                }

                if (type === "DEVICE") {
                    patternMatch = this.__checkNavigator(pattern[i].pattern, this.ua);
                    if (patternMatch) {
                        this.__setDevice(patternMatch);
                        break;
                    }
                }
            }

        },
        /**
         * private function - Returns the matched user agent
         * @param {String} pattern string
         * @param {String} userAgent user agent string
         * @return {Array} array of matched string for given pattern
         * @private
         */
        __checkNavigator : function (pattern, userAgent) {
            return pattern.exec(userAgent);
        },
        /**
         * private function - To set the Device Name
         * @param {Array} Array of matched string for given pattern
         * @private
         */
        __setDevice : function (patternMatch) {

            this.deviceName = patternMatch[1] || "";
        },
        /**
         * private function - To set the Browser Name and Version
         * @param {Array} Array of matched string for given pattern
         * @param {Integer} index of the matched pattern
         * @private
         */
        __setBrowser : function (patternMatch, index) {
            var browserName = ["Mobile Safari", "Chrome", "Other"];
            switch (index) {
                case 0 :
                    this.browserType = browserName[1];
                    this.browserVersion = patternMatch[2] || "";
                    this.isChrome = true;
                    break;
                case 1 :
                    this.browserType = patternMatch[1] || "";
                    this.browserVersion = patternMatch[2] || "";
                    if (this.isAndroid) {
                        this.isAndroidBrowser = true;
                    }
                    if (this.isBlackBerry) {
                        this.isBlackBerryBrowser = true;
                    }
                    break;
                case 2 :
                    this.browserType = browserName[0];
                    this.browserVersion = patternMatch[3] || "";
                    this.isSafariMobile = true;
                    break;
                case 3 :
                    this.browserType = patternMatch[1] || "";
                    this.browserVersion = patternMatch[2] || "";
                    if (patternMatch[0]
                            && (patternMatch[0].indexOf('XBLWP7') > -1 || patternMatch[0].indexOf('ZuneWP7') > -1)) {
                        this.DesktopView = true;

                    } else {
                        this.isMobileView = true;
                    }
                    this.isIEMobile = true;
                    break;
                case 4 :
                    this.browserType = patternMatch[1] || "";
                    this.browserVersion = patternMatch[2] || "";
                    this.isSafari = true;
                    break;
                case 5 :
                    this.browserType = patternMatch[2] || "";
                    this.browserVersion = patternMatch[3] || "";
                    this.isS60 = true;
                    break;
                case 6 :
                    this.browserType = patternMatch[1] || "";
                    this.browserVersion = patternMatch[2] || "";
                    this.isFF = true;
                    break;
                case 7 :
                    this.browserType = patternMatch[1] || "";
                    this.browserVersion = patternMatch[2] || "";
                    this.isFF = true;
                    break;
                case 8 :
                    this.browserType = patternMatch[1] || "";
                    this.browserVersion = patternMatch[2] || "";
                    this.isFF = true;
                    break;
                case 9 :
                    this.browserType = browserName[2];
                    this.browserVersion = patternMatch[2] || "";
                    this.isOtherBrowser = true;
                    break;

            }

        },
        /**
         * private function - To set the Device OS Name and Version
         * @param {Array} Array of matched string for given pattern
         * @param {Integer} index of the matched pattern
         * @private
         */
        __setOs : function (patternMatch, index) {
            var osName = ["Android", "IOS", "BlackBerry", "BlackBerry Tablet OS", "Windows", "Symbian", "Other"];
            switch (index) {
                case 0 :
                    this.isAndroid = true;
                    this.osName = osName[0];
                    this.osVersion = patternMatch[2] || "";
                    // since android version 3 specifically for tablet checking screen resolution make no sense
                    if (patternMatch[2] && patternMatch[2].match(/\d/) + "" == "3") {
                        this.isTablet = true;
                    } else {
                        this.isPhone = true;
                    }
                    break;
                case 1 :
                    this.isIOS = true;
                    this.osName = osName[1];
                    var osVer = patternMatch[2] || "";
                    this.osVersion = osVer.replace(/\_/g, ".");
                    if (patternMatch[1] == "iPad") {
                        this.isTablet = true;
                    } else {
                        this.isPhone = true;
                    }
                    break;
                case 2 :
                    this.isBlackBerry = true;
                    this.osName = osName[2];
                    this.osVersion = patternMatch[2] || "";
                    this.isPhone = true;
                    break;
                case 3 :
                    this.isBlackBerry = true;
                    this.osName = osName[3];
                    this.osVersion = patternMatch[2] || "";
                    this.isTablet = true;
                    break;
                case 4 :
                    this.isWindowsPhone = true;
                    this.osName = osName[4];
                    this.osVersion = patternMatch[2] || "";
                    this.isPhone = true;
                    break;
                case 5 :
                    this.isSymbian = true;
                    this.osName = osName[5];
                    this.osVersion = patternMatch[2] || "";
                    this.isPhone = true;
                    break;
                case 6 :
                    this.isOtherMobile = true;
                    this.osName = osName[6];
                    this.osVersion = patternMatch[2] || "";
                    this.isPhone = true;
                    break;

            }
            this.osVersion = this.osVersion.replace(/\s*/g, "");
        }
    }
});
/**
 * Global class it checks DOM is in Ready state and executes the callback function
 */
Aria.classDefinition({
    $classpath : "aria.dom.DomReady",
    $singleton : true,
    $events : {
        "ready" : "Raised when the DOM is in ready state."
    },
    $constructor : function () {

        /**
         * True if the DOM is in Ready state.
         * @type Boolean
         */
        this.isReady = false;

        /**
         * @type Boolean
         * @private
         */
        this._isListening = false;

        /**
         * List of added listeners that have to be removed
         * @type Array
         * @private
         */
        this._listenersToRemove = [];

    },
    $prototype : {
        /**
         * This method executes the callback once the DOM is in ready state.
         * @param {aria.core.CfgBeans:Callback} a callback function
         */
        onReady : function (callback) {
            if (this.isReady) {
                this.$callback(callback);
            } else {
                this.$on({
                    "ready" : callback,
                    scope : this
                });
            }
            if (!this._isListening) {
                this._isListening = true;
                this._listen();
            }
        },

        /**
         * This method to listen to the native Events to execute the callback.
         */
        _listen : function () {
            var windowObj = Aria.$frameworkWindow;
            if (windowObj == null) {
                // not a browser
                this._raiseReadyEvent();
                return;
            }
            this._checkReadyState(false);
            if (this.isReady) {
                return;
            }
            var docRef = windowObj.document, browser = aria.core.Browser, that = this, handler;
            if (windowObj.addEventListener) {
                if (!browser.isOpera) {
                    handler = function () {
                        that._raiseReadyEvent();
                    };
                    docRef.addEventListener("DOMContentLoaded", handler, false);
                    this._listenersToRemove.push([docRef, "removeEventListener", "DOMContentLoaded", handler]);

                }
                // since for opera the DOMContentLoaded fires before all CSS are loaded check if all CSS are loaded
                else {
                    handler = function () {
                        that._checkCSSLoaded();
                    };
                    docRef.addEventListener("DOMContentLoaded", handler, false);
                    this._listenersToRemove.push([docRef, "removeEventListener", "DOMContentLoaded", handler]);
                }
                var loadHandler = function () {
                    that._raiseReadyEvent();
                };
                this._listenersToRemove.push([windowObj, "removeEventListener", "load", loadHandler]);

                // a fallback to window.load
                windowObj.addEventListener("load", loadHandler, false);

            } else if (windowObj.attachEvent) {

                if (windowObj === windowObj.top) {
                    this._checkScroll();

                } else {
                    that._checkReadyState(true);
                }

                handler = function () {
                    that._raiseReadyEvent();
                };
                this._listenersToRemove.push([windowObj, "detachEvent", "onload", handler]);
                // a fallback to window.onload
                windowObj.attachEvent("onload", handler);
            }

        },
        /**
         * This method is to check if DOM is already in Ready State else wait until its loaded completly.
         * @param {Boolean} wait
         */
        _checkReadyState : function (wait) {
            var docRef = Aria.$frameworkWindow.document;
            var that = this;
            if (docRef.readyState === "complete") {
                this._raiseReadyEvent();
            } else if (wait) {
                setTimeout(function () {
                    that._checkReadyState();
                }, 16);
            }

        },
        /**
         * Method to check for any disabled Style sheets wait until its loaded completly.
         */
        _checkCSSLoaded : function () {
            var that = this;
            var docRef = Aria.$frameworkWindow.document;
            for (var i = 0; i < docRef.styleSheets.length; i++) {
                if (docRef.styleSheets[i].disabled) {
                    setTimeout(function () {
                        that._checkCSSLoaded();
                    }, 16);
                    return;
                }
            }
            // and execute any waiting functions
            this._raiseReadyEvent();
        },

        /**
         * Method to check the DOM is ready of IE versions < 9 and window is not a iframe. returns if the DOM goes to
         * ready State.
         */
        _checkScroll : function () {
            var that = this;
            try {
                Aria.$frameworkWindow.document.documentElement.doScroll("left");

            } catch (e) {
                // above the default timer resolution
                setTimeout(function () {
                    that._checkScroll();
                }, 16);
                return;
            }

            // DOM Loaded
            this._raiseReadyEvent();
        },

        /**
         * The method is to execute the callback once the DOM is Ready
         */
        _raiseReadyEvent : function () {
            // check the ready state
            if (this.isReady) {
                return;
            }
            this.isReady = true;
            this._removeListeners();
            this.$raiseEvent('ready');
        },

        /**
         * Removes listeners added for dom ready detection
         * @private
         */
        _removeListeners : function () {
            var listeners = this._listenersToRemove, list;
            for (var i = 0, length = listeners.length; i < length; i++) {
                list = listeners[i];
                list[0][list[1]](list[2], list[3], false);
            }
            this._listenersToRemove = [];
        }

    }
});
/**
 * Cache object used to synchronize data retrieved from the server and avoid reloading the same resource several times
 * @singleton
 */
Aria.classDefinition({
    $classpath : "aria.core.Cache",
    $singleton : true,
    $statics : {
        /**
         * Map the content type to the file name extension.
         * @type Object
         */
        EXTENSION_MAP : {
            "JS" : ".js",
            "TPL" : ".tpl",
            "CSS" : ".tpl.css",
            "TML" : ".tml",
            "CML" : ".cml",
            "TXT" : ".tpl.txt",
            "RES" : ".js"
        }
    },
    $prototype : {
        /**
         * Cache content Note: stored at prototype level as Cache is a singleton
         * @type Map
         */
        content : {},

        /**
         * Cache item status when just created
         * @type Number
         */
        STATUS_NEW : 1,

        /**
         * Cache item status when being (down)loaded
         * @type Number
         */
        STATUS_LOADING : 2,

        /**
         * Cache item status when item has been succesfully downloaded
         * @type Number
         */
        STATUS_AVAILABLE : 3,

        /**
         * Cache item status when item cannot be loaded
         * @type Number
         */
        STATUS_ERROR : 4,

        /**
         * Get (and optionally create) a cache entry
         * @param {String} cat item category (first key used in content Map to create a sub-map)
         * @param {String} key item key in the category Map
         * @param {Boolean} createIfNull [default:false] create an item if none is already defined
         * @return {Object} a cache item structure:
         *
         * <pre>
         * {
         *      status: {Integer} indicates the item status [STATUS_NEW | STATUS_LOADING | STATUS_AVAILABLE | STATUS_ERROR]
         *      value: {Object} value associated to the item
         *      loader: {Object} loader object associated to this item when status = STATUS_LOADING
         * }
         * </pre>
         */
        getItem : function (cat, key, createIfNull) {
            if (createIfNull !== true) {
                createIfNull = false;
            }
            var res = null;
            if (createIfNull) {
                if (this.content[cat] == null) {
                    this.content[cat] = {};
                }
                var res = this.content[cat][key];
                if (res == null) {
                    res = {
                        status : this.STATUS_NEW,
                        value : null
                        // loader:null - don't need to be created if not used
                    };
                    this.content[cat][key] = res;
                }
            } else {
                if (this.content[cat] != null) {
                    res = this.content[cat][key];
                }
            }
            return res;
        },

        /**
         * Get the logical filename from the classpath. Returns null if the classpath is not inside the cache.
         * @param {String} classpath e.g x.y.MyClass
         * @return {String} logical path e.g x/y/MyClass.tpl
         */
        getFilename : function (classpath) {
            var classContent = this.getItem("classes", classpath, false);

            if (classContent) {
                return classpath.replace(/\./g, "/") + this.EXTENSION_MAP[classContent.content];
            }
        }

    }
});/**
 * Base class from which all class loaders inherit. <br />
 * Each class loader must override the <code>_loadClass</code> method to define the action when receiving a class
 * definition. Manage the load of the class files and the synchronization of the class load when all declared
 * dependencies are ready
 */
Aria.classDefinition({
    $classpath : "aria.core.ClassLoader",
    $events : {
        "classReady" : {
            description : "notifies that all class dependencies (and the ref class if any) have been loaded and are ready to use",
            properties : {
                refClasspath : "{String} classpath of the reference class if any"
            }
        },
        "classError" : {
            description : "notifies that the class loading process has failed",
            properties : {
                refClasspath : "{String} classpath of the reference class if any"
            }
        },
        "complete" : {
            description : "notifies that the class loader process is done and that it can be disposed (thus classReady listeners have already been called when this event is raised)",
            properties : {
                refClasspath : "{String} classpath of the reference class if any"
            }
        }
    },

    /**
     * Class loader constructor
     * @param {String} refClasspath reference classpath which this loader is associated to (may be null)
     */
    $constructor : function (refClasspath, classType) {
        /**
         * Reference classpath. It's the classpath of the expected class
         * @type String
         */
        this._refClasspath = refClasspath;
        if (refClasspath) {
            /**
             * Reference logical path. It's the logical path corresponding to the reference classpath
             * @type String
             */
            this._refLogicalPath = aria.core.ClassMgr.getBaseLogicalPath(refClasspath, classType);
        }

        /**
         * Name of the generator class (in aria.templates package). To be defined by subclasses.
         * @type String
         */
        this._classGeneratorClassName = null;

        /**
         * Full logical classpath. It's the complete logical path. It might differ from the reference logical path for
         * the presence of additional information like locale/language in resources
         * @type String
         */
        this._fullLogicalPath = null;

        /**
         * Callback to be executed when tha class is loaded. At this time, we don't know which function to call back to
         * load the class, after all its dependencies are loaded (it can be loadClass or loadBean..., depending on the
         * content of the js file). This should be set by extending classes
         * @type aria.core.CfgBeans:Callback
         */
        this.callback = null;

        /**
         * Array of missing dependencies - items have the following structure:
         *
         * <pre>
         * {
         *    classpath : '',
         *    isReady : true/false,
         *    loader : {Object}
         * }
         * </pre>
         *
         * Can either be null (meaning no dependency is missing) or a non-empty array (meaning we are waiting for these
         * dependencies to be ready)
         * @protected
         * @type Array
         */
        this._mdp = null;

        /**
         * Is true if there were errors while retrieving missing dependencies. It becomes true when you call
         * <code>addDependencies</code> with wrong parameters or when one of the missing dependencies raises a class
         * error event
         * @protected
         * @type Boolean
         */
        this._mdpErrors = false;

        /**
         * Each class has its own instance of the class loader. This flag marks the class loader as busy in case the
         * class is required more than once
         * @protected
         * @type Boolean
         */
        this._isLoadingRefDefinition = false;

        /**
         * Whether the class definition was called after an Aria.eval. If this is still false after evaluating the file,
         * it means that an error occurred
         * @protected
         * @type Boolean
         */
        this._classDefinitionCalled = false;

        /**
         * Whether error should be logged or not
         * @type Boolean
         */
        this.handleError = true;
    },
    $statics : {
        // ERROR MESSAGES:
        CLASS_LOAD_FAILURE : "Class definition for %1 cannot be loaded.",
        CLASS_LOAD_ERROR : "Load of class %1 failed",
        CLASS_LOAD_MISSING_REF : "ClassLoader.loadClassDefinition() cannot be called if no reference classpath is defined.",
        MISSING_CLASS_DEFINITION : "Error: the definition of class '%2' was not found in logical path '%1' - please check the classpath defined in this file."
        // note: MISSING_CLASS_DEFINITION is used only in sub-classes (not in this class)
    },
    $prototype : {

        /**
         * Load the class definition associated to the ref class path
         */
        loadClassDefinition : function () {
            if (this._isLoadingRefDefinition) {
                return;
            }
            this._isLoadingRefDefinition = true;

            if (this._refClasspath == null) {
                this.$logError(this.CLASS_LOAD_MISSING_REF);
                return;
            }

            // warning: may be synchronous if the file has already been downloaded
            aria.core.DownloadMgr.loadFile(this.getRefLogicalPath(), {
                fn : this._onClassDefinitionReceive,
                scope : this
            }, {
                fullLogicalPath : this._fullLogicalPath
            });
        },

        /**
         * Get the logical file path associated to the reference class path
         * @return {String}
         */
        getRefLogicalPath : function () {
            return this._refLogicalPath;
        },

        /**
         * Internal callback called when the class definition file has been downloaded
         * @param {aria.core.FileLoader:fileReady:event} evt
         * @return {Boolean} Whether there was an error or not
         * @protected
         */
        _onClassDefinitionReceive : function (evt) {

            var lp = this.getRefLogicalPath(), classdef = aria.core.DownloadMgr.getFileContent(lp), error = false;
            if (!classdef) {
                // a problem occured..
                if (this.handleError) {
                    this.$logError(this.CLASS_LOAD_FAILURE, this._refClasspath);
                }
                error = true;
            } else {
                try {
                    // Load the class definition file, depending on its type
                    this._loadClass(classdef, lp);
                } catch (ex) {
                    if (this.handleError) {
                        this.$logError(this.CLASS_LOAD_ERROR, [this._refClasspath], ex);
                    }
                    error = true;
                }
            }
            if (error) {
                aria.core.ClassMgr.notifyClassLoadError(this._refClasspath);
            }
            lp = classdef = null;
            return error;
        },

        /**
         * abstract function to be replaced in inherited classes
         * @private
         */
        _loadClass : function (classDef, logicalPath) {
            this.$assert(204, false);
        },

        /**
         * Add classpaths as dependencies associated to the main class. <br />
         * After calling this method (maybe several times), you should immediately call the
         * <code>loadDependencies</code> method to effectively load the added dependencies. This supposes that the
         * reference class definition has already been loaded
         * @param {Array} mdp list of missing dependency classpaths, or false to specify that some dependencies cannot
         * be loaded
         * @param {String} depType type of dependency
         */
        addDependencies : function (mdp, depType) {
            if (mdp === false) {
                // some dependencies could not be loaded
                this._mdpErrors = true;
                return;
            }
            var sz = mdp.length, loader, cp, cm = aria.core.ClassMgr;
            for (var i = 0; sz > i; i++) {
                cp = mdp[i];
                loader = cm.getClassLoader(cp, depType);
                if (loader) {
                    // forward error policy
                    loader.handleError = this.handleError;

                    // class not already loaded: create an entry in _mdp
                    if (!this._mdp) {
                        this._mdp = [];
                    }
                    this._mdp.push({
                        loader : loader,
                        classpath : cp,
                        isReady : false
                    });
                    // register to know when it is loaded
                    // (we must register here, to be notified on all loaded dependencies;
                    // if we do it only in the loadDependencies method, some dependencies may be loaded
                    // before we register on this event and we loose the info)
                    loader.$on({
                        "classReady" : this._onMdpLoad,
                        "classError" : this._onMdpLoad,
                        scope : this
                    });
                }
            }
            loader = cm = null;
        },

        /**
         * Load the dependencies added through the addDependencies method. This method should be called immediately
         * after the addDependencies method.
         */
        loadDependencies : function () {
            var dependencies = this._mdp;
            if (dependencies) {
                var length = dependencies.length;
                for (var i = 0; i < length; i += 1) {
                    var waiting = dependencies[i];
                    if (!waiting.isReady) {
                        waiting.loader.loadClassDefinition();
                    }

                    // if everything is in cache, previous call may load everything, instanciate classes and nullify
                    // this._mdp
                    if (!this._mdp) {
                        break;
                    }
                }
            } else if (this._mdpErrors) {
                this._handleError();
            }
            // else simply there's nothing to do, no dependencies
        },

        /**
         * Check if given classpath is already a dependency.
         * @param {String} classpath Circular classpath to check, or nothing if initial call
         * @return {String|Boolean} classpath of circular dependency found, or true if one is found but is himself
         */
        getCircular : function (classpath) {
            if (!classpath) {
                classpath = this._refClasspath;
            } else {
                if (this._refClasspath == classpath) {
                    return true;
                }
            }
            var circular;

            if (this._mdp) {
                for (var index = 0, l = this._mdp.length; index < l; index++) {
                    circular = this._mdp[index].loader.getCircular(classpath);
                    if (circular) {
                        if (circular === true) {
                            return this._refClasspath;
                        } else {
                            return circular;
                        }
                    }
                }
            }
            return false;
        },

        /**
         * Callback called when a missing dependency class is loaded, either correctly or in error
         * @param {Object} evt classReady or classError event
         * @private
         */
        _onMdpLoad : function (evt) {
            if (evt.name === "classError") {
                this._mdpErrors = true;
            }

            var cp = evt.refClasspath;
            this.$assert(283, !!cp);
            this.$assert(284, this._mdp != null); // check that this was not disposed already
            var sz = this._mdp.length, itm, isReady = true, found = false;
            for (var i = 0; sz > i; i++) {
                itm = this._mdp[i];
                if (!found && !itm.isReady && itm.classpath == cp) {
                    // in case there is twice the same classpath in this._mdp, we mark it only once if it was not marked
                    // already because we know _onMdpClassReady will be called as many times as there are items in
                    // this._mdp
                    found = true;
                    itm.isReady = true;
                } else if (isReady) {
                    isReady = itm.isReady;
                } else if (found) {
                    // isReady is false, and the classpath which is ready is already found,
                    // it is useless to continue the loop
                    break;
                }
            }
            this.$assert(301, found === true); // make sure we always find the classpath in this._mdp

            if (!isReady) {
                return; // current loader not ready yet
            } else {
                // all dependencies are now ready
                if (this._mdpErrors) {
                    this._handleError();
                } else {
                    if (this._refClasspath != null) {
                        this.$assert(286, this.callback != null);
                        this.callback.fn.call(this.callback.scope, this.callback.args);
                    } else {
                        this._mdp = null;
                        // class loader is used to load dependencies
                        this.notifyLoadComplete();
                    }
                }
            }
        },

        /**
         * Notify the class loader error
         * @protected
         */
        _handleError : function () {
            if (this._refClasspath != null) {
                aria.core.ClassMgr.notifyClassLoadError(this._refClasspath);
            } else {
                this.notifyLoadError();
            }
        },

        /**
         * Method called by the Class Manager if the reference class could not be loaded. So we raise the classError and
         * complete events
         */
        notifyLoadError : function () {
            this.$raiseEvent({
                name : "classError",
                refClasspath : this._refClasspath
            });

            this.$raiseEvent({
                name : "complete",
                refClasspath : this._refClasspath
            });
        },

        /**
         * Method called by the Class Manager when the reference class associated to this loader is ready So we raise
         * the classReady and complete events
         */
        notifyLoadComplete : function () {
            this.$raiseEvent({
                name : "classReady",
                refClasspath : this._refClasspath
            });

            this.$raiseEvent({
                name : "complete",
                refClasspath : this._refClasspath
            });
        },

        /**
         * Method called by the Class Manager when the class definition has been called for this class. It is useful to
         * know it, so that it is possible to detect errors in the classpath declared in a the class definition.
         */
        notifyClassDefinitionCalled : function () {
            this._classDefinitionCalled = true;
        },

        /**
         * Load the class definition file after generating the class if needed.
         * @param {String} classDef File content, can be either the generated class definition or the source file itself
         * @param {String} logicalPath class' logical classpath
         * @param {String} additionalDependencyClassPath additional class to be added to $dependencies when generating
         * the class
         */
        _loadClassAndGenerate : function (classDef, logicalPath, additionalDependencyClassPath) {
            var firstComment = /^\s*\/\*[\s\S]*?\*\//;
            var withoutFirstComment = classDef.replace(firstComment, '');
            var __alreadyGeneratedRegExp = /^\s*Aria\.classDefinition\(/;

            if (__alreadyGeneratedRegExp.test(withoutFirstComment)) {
                this.__evalGeneratedClass({
                    classDef : classDef,
                    scope : this
                }, {
                    logicalPath : logicalPath
                });
            } else {
                var generatorClassPath = "aria.templates." + this._classGeneratorClassName;
                var classesToLoad = [generatorClassPath];
                if (additionalDependencyClassPath) {
                    classesToLoad.push(additionalDependencyClassPath);
                }
                Aria.load({
                    classes : classesToLoad,
                    oncomplete : {
                        fn : this.__generateClass,
                        scope : this,
                        args : {
                            classDef : classDef,
                            logicalPath : logicalPath,
                            classpath : this._refClasspath
                        }
                    }
                });
            }
        },

        /**
         * Parse the class and generate the Tree
         * @param {Object} args Class configuration, given from _loadClass
         * @private
         */
        __generateClass : function (args) {
            var classGenerator = aria.templates[this._classGeneratorClassName];
            try {
                classGenerator.parseTemplate(args.classDef, false, {
                    fn : this.__evalGeneratedClass,
                    scope : this,
                    args : {
                        logicalPath : args.logicalPath,
                        classGenerator : classGenerator
                    }
                }, {
                    "file_classpath" : args.logicalPath
                });
            } catch (ex) {
                this.$logError(this.CLASS_LOAD_ERROR, [this._refClasspath], ex);
            }
        },

        /**
         * Wrap the class generation in a try catch block. This generation is not done in debug mode
         * @param {Object} args Class configuration, given from _loadClass
         * @param {Object} tree Generated tree
         * @private
         */
        __fallbackGenerateClass : function (args, tree) {
            this.$logWarn(this.TEMPLATE_DEBUG_EVAL_ERROR, [this._refClasspath]);
            var classGenerator = args.classGenerator;
            classGenerator.parseTemplateFromTree(tree, false, {
                fn : this.__evalGeneratedClass,
                scope : this,
                args : {
                    logicalPath : args.logicalPath,
                    classGenerator : classGenerator
                }
            }, {
                "file_classpath" : args.logicalPath
            }, true);
        },

        /**
         * Evaluate the class definition built by __generateClass. <br />
         * The class definition might be null in case of error, in this case it has already been reported.<br />
         * In debug mode if the eval throws an error, we try to parse the template again in order to log more
         * information on the syntax error. <br />
         * The generated class is an object containing
         *
         * <pre>
         * {
         *     classDef : {String} the class definition,
         *     tree : {Object} syntax tree,
         *     debug : {Boolean} whether the class was generated in debug mode or not
         * }
         * </pre>
         *
         * @param {String} generatedClass Generated class
         * @param {Object} args Class configuration, given from _loadClass
         * @private
         */
        __evalGeneratedClass : function (generatedClass, args) {
            var classDef = generatedClass.classDef;
            try {
                Aria["eval"](classDef, args.logicalPath);
                if (!this._classDefinitionCalled) {
                    this.$logError(this.MISSING_CLASS_DEFINITION, [this.getRefLogicalPath(), this._refClasspath]);
                    aria.core.ClassMgr.notifyClassLoadError(this._refClasspath);
                }
            } catch (ex) {
                if (!generatedClass.debug && Aria.debug) {
                    try {
                        this.__fallbackGenerateClass(args, generatedClass.tree);
                    } catch (exc) {
                        this.$logError(this.TEMPLATE_DEBUG_EVAL_ERROR, [this._refClasspath], exc);
                    }
                } else {
                    this.$logError(this.TEMPLATE_EVAL_ERROR, [this._refClasspath], ex);
                }
            }
        }
    }
});
/**
 * ClassLoader for js files.
 */
Aria.classDefinition({
    $classpath : 'aria.core.JsClassLoader',
    $extends : 'aria.core.ClassLoader',
    $constructor : function () {
        this.$ClassLoader.constructor.apply(this, arguments);
        this._refLogicalPath += ".js";
    },
    $prototype : {
        /**
         * Called when the .js file is received. This method simply do an eval of the .js file.
         * @param {String} classdef Content of the .js file
         * @param {String} lp Logical path of the .js file
         * @protected
         */
        _loadClass : function (classdef, lp) {
            Aria["eval"](classdef, lp);
            if (!this._classDefinitionCalled) {
                this.$logError(this.MISSING_CLASS_DEFINITION, [this.getRefLogicalPath(), this._refClasspath]);
                aria.core.ClassMgr.notifyClassLoadError(this._refClasspath);
            }
        }
    }
});
/**
 * ClassLoader for resource files.
 */
Aria.classDefinition({
    $classpath : "aria.core.ResClassLoader",
    $extends : "aria.core.ClassLoader",
    $constructor : function (classpath, classtype) {
        this.$ClassLoader.constructor.apply(this, arguments);
        this.serverResource = false;

        // store info about resource files loaded
        if (this._refClasspath) {
            aria.core.ResMgr.addResFile(this._refClasspath);
        }
    },
    $statics : {
        REGEXP : /Aria\.resourcesDefinition\(/,

        /* BACKWARD-COMPATIBILITY-BEGIN GH-669 */
        DEPRECATED_LOCALES : {
            "sp_AR" : "ar_SA",
            "ko_KO" : "ko_KR",
            "cn_CN" : "zh_CN",
            "tw_TW" : "zh_TW"
        },
        DEPRECATED_LOCALES_WARNING : "The locale %1 is deprecated and will be removed soon, please use %2 locale instead.",
        /* BACKWARD-COMPATIBILITY-END GH-669 */

        // ERROR MESSAGES:
        RESOURCE_NOT_FOUND : "Error: the resource file '%1' for '%2' locale was not found",
        RESOURCE_NOT_RESOLVED : "Error: No resource file for '%1' could be found"
    },
    $destructor : function () {
        this.serverResource = null;
        this.$ClassLoader.$destructor.call(this);
    },
    $prototype : {
        /**
         * Called when the .js resource file is received. This method simply does an eval of the .js file.
         * @param {String} classdef Content of the .js file
         * @param {String} lp Logical path of the .js file
         * @protected
         */
        _loadClass : function (classdef, lp) {
            var resClassRef = Aria.getClassRef(this._refClasspath);
            // load the class only once, on reload the resources will be injected
            if (!this._classDefinitionCalled) {
                Aria["eval"](classdef, lp);
                if (!resClassRef && !this._classDefinitionCalled) {
                    this.$logError(this.MISSING_CLASS_DEFINITION, [this.getRefLogicalPath(), this._refClasspath]);
                    aria.core.ClassMgr.notifyClassLoadError(this._refClasspath);
                }
            }
        },
        /**
         * Internal callback called when the class definition file has been downloaded
         * @param {aria.core.FileLoader:fileReady:event} evt
         * @protected
         */
        _onClassDefinitionReceive : function (evt) {
            var lp = this.getRefLogicalPath(), classdef = aria.core.DownloadMgr.getFileContent(lp), error = false;

            if (!classdef || !this.REGEXP.test(classdef)) {
                // a problem occured..
                // get replacement locale for resource file
                var res = aria.core.ResMgr.getFallbackLocale(this._refClasspath);

                if (this.handleError) {
                    this.$logWarn(this.RESOURCE_NOT_FOUND, [this._refClasspath, res.currResLocale]);
                }

                if (!this.serverResource) {
                    var regex = new RegExp("(_[a-z][a-z](_[A-Z][A-Z])??)?.js");
                    var newRefLogicalPath = this._refLogicalPath.replace(regex, (res.newResLocale !== "" ? "_" : "")
                            + res.newResLocale)
                            + ".js";

                    if (this._refLogicalPath !== newRefLogicalPath) {
                        this._refLogicalPath = newRefLogicalPath;

                        this._isLoadingRefDefinition = false;
                        this.$ClassLoader.loadClassDefinition.call(this);
                    } else {
                        error = true;
                    }
                } else {
                    error = true;
                }

                if (error) {
                    this.$logError(this.RESOURCE_NOT_RESOLVED, [this._refClasspath]);
                    aria.core.ClassMgr.notifyClassLoadError(this._refClasspath);
                }

                regex = newRefLogicalPath = null;
            } else {
                this.$ClassLoader._onClassDefinitionReceive.call(this, evt);
            }

            lp = classdef = null;
        },

        /**
         * Load the class definition associated to the ref class path. However the full logical path is not yet defined,
         * build it with an asynchronous call
         */
        loadClassDefinition : function () {
            // If this class is already loading, don't do it twice
            if (this._isLoadingRefDefinition) {
                return;
            }

            // Check for dev mode
            var devMode = aria.core.environment.Environment.isDevMode();
            // Get the locale
            var resLocale = aria.core.ResMgr.currentLocale;

            /* BACKWARD-COMPATIBILITY-BEGIN GH-669 */
            if (resLocale in this.DEPRECATED_LOCALES) {
                var newLocale = this.DEPRECATED_LOCALES[resLocale];
                this.$logWarn(this.DEPRECATED_LOCALES_WARNING, [resLocale, newLocale]);
            }
            /* BACKWARD-COMPATIBILITY-END GH-669 */

            // Build the callback for the asynchronous method
            var callback = {
                fn : this.__loadParentDefinition,
                scope : this
            };

            // This method is asynchronous
            this.__buildLogicalPath(this._refClasspath, this._refLogicalPath, callback, resLocale, devMode);
        },

        /**
         * Build the complete logical path given the reference classpath and the initial logical path If a locale is
         * specified it is appended to the logical path unless we are in dev mode. If devMode is true the full path is
         * built by aria.modules.RequestMgr.createI18nUrl that is asynchronous. This method calls the callback passing
         * as arguments an object containing
         *
         * <pre>
         * {
         * logical : logical path,
         * serverResource : Boolean if the full logical path was created by aria.modules.RequestMgr,
         * full : full logical path, different from null if serverResource is true
         * }
         * </pre>
         *
         * @param {String} refClasspath Reference classpath
         * @param {String} logicalPath Logical file path
         * @param {aria.core.CfgBeans:Callback} callback Callback called when the full path is ready
         * @param {Boolean} devMode Development mode
         * @param {String} resLocale Current locale
         * @private
         */
        __buildLogicalPath : function (refClasspath, logicalPath, callback, locale, devMode) {
            var result = {
                logical : logicalPath,
                serverResource : false,
                full : null
            };

            // process server resource set
            if (refClasspath.match(/\.Res$/)) {
                // if not in dev mode call the server for a resource file
                // otherwise use static resource definition file with no specific locale
                if (!devMode) {
                    var s = refClasspath.split(".");
                    var moduleName;
                    if (s && s.length > 1) {
                        moduleName = s[s.length - 2];
                    } else {
                        // TODO: Log module name could not be resolved
                    }
                    logicalPath += (!locale ? "" : "_") + locale + ".js";

                    result.serverResource = true;

                    // This call is asynchronous
                    result.logical = logicalPath;
                    callback.args = result;
                    // It will add callback.args.full
                    if (aria.modules && aria.modules.RequestMgr) {
                        aria.modules.RequestMgr.createI18nUrl(moduleName, locale, callback);
                    } else {
                        Aria.load({
                            classes : ['aria.modules.RequestMgr'],
                            oncomplete : function () {
                                aria.modules.RequestMgr.createI18nUrl(moduleName, locale, callback);
                            }
                        });
                    }
                    return;
                } else {
                    logicalPath += ".js";
                }
            } else {
                logicalPath += (!locale ? "" : "_") + locale + ".js";
            }

            result.logical = logicalPath;
            callback.args = result;

            this.$callback(callback);
        },

        /**
         * Callback for __buildLogicalPath. It is called when the full url is ready and is part of the overridden
         * loadClassDefinition
         * @param {Object} args Objects containing the logical paths of the resource
         */
        __loadParentDefinition : function (evt, args) {
            this._refLogicalPath = args.logical;
            this.serverResource = args.serverResource;
            this._fullLogicalPath = args.full;

            // Go on with the parent loadClassDefinition
            this.$ClassLoader.loadClassDefinition.call(this);
        }

    }
});
(function () {

    /**
     * Display an error in the template container and call the callback notifying the error.
     * @param {Object} args
     * @private
     */
    var errorInTemplateDiv = function (args) {
        var div = args.cfg.tplDiv;

        if (div) {
            aria.utils.Dom.replaceHTML(div, "#TEMPLATE ERROR#");
        }
        this.$callback(args.cb, {
            success : false
        });
    };

    var __loadTemplate4 = function (evt, args) {
        var tplCtxt = args.tplCtxt, cfg = args.cfg;
        tplCtxt.viewReady(); // view successfully rendered: signal to template through TemplateContext

        this.$callback(args.cb, {
            success : true,
            tplCtxt : cfg.provideContext ? tplCtxt : null
        }); // TODO: add an error ID
    };

    var __loadTemplate3 = function (res, args) {
        // Step 3: init the template context and show the template
        var cfg = args.cfg;

        var tplCtxt = new aria.templates.TemplateCtxt();
        if (res.moduleCtrlPrivate && cfg.moduleCtrl.autoDispose) {
            // the module controller has just been initialized and needs to be disposed when the template is unloaded
            if (!cfg.toDispose) {
                cfg.toDispose = [res.moduleCtrlPrivate];
            } else {
                cfg.toDispose.push(res.moduleCtrlPrivate);
            }
        }

        cfg.moduleCtrl = res.moduleCtrl;
        cfg.isRootTemplate = true;

        // note that there is no need to clean cfg, this will be done by the template context
        var result = tplCtxt.initTemplate(cfg);

        if (result) {
            // Fire data ready before we start working with the view
            tplCtxt.dataReady();
        }

        var tplDiv = cfg.tplDiv;

        // On IE, the CSS engine keeps rendering and calculating the position of the background image
        if (aria.core.Browser.isIE) {
            tplDiv.style.background = "";
        }

        // Load the CSS dependencies, the style should be added before the html
        tplDiv.className = tplCtxt.getCSSClassNames(); // remove the loading indicator
        if (result) {
            args.tplCtxt = tplCtxt;
            tplCtxt.$onOnce({
                "SectionRefreshed" : {
                    fn : __loadTemplate4,
                    scope : this,
                    args : args
                }
            });
            tplCtxt.$refresh();
        } else {
            tplCtxt.$dispose();
            errorInTemplateDiv.call(this, args);
        }
    };

    var __loadTemplate2 = function (args) {
        // Step 2: initialize the module controller if needed
        var cfg = args.cfg;
        var moduleCtrl = cfg.moduleCtrl;
        if (moduleCtrl && !moduleCtrl.getData) {
            // simply call the ModuleCtrlFactory to do that for us
            aria.templates.ModuleCtrlFactory.createModuleCtrl(moduleCtrl, {
                fn : __loadTemplate3,
                args : args,
                scope : this
            });
        } else {
            // case where an existing module controller is provided "the old way"
            if (moduleCtrl && !cfg.moduleCtrlPrivate && moduleCtrl.$publicInterface) {
                cfg.moduleCtrl = moduleCtrl.$publicInterface();
            }
            // no module controller to initialize, directly load the template:
            __loadTemplate3.call(this, {
                moduleCtrl : cfg.moduleCtrl
            }, args);
        }
    };

    var __loadTemplate1 = function (args) {
        // Step 1: Check config, show the loading indicator and load needed classes

        var cfg = args.cfg;
        var cb = args.cb;
        // Check cfg:
        if (!aria.core.JsonValidator.normalize({
            json : cfg,
            beanName : "aria.templates.CfgBeans.LoadTemplateCfg"
        })) {
            // error should have already been reported
            this.$callback(cb, {
                success : false
            }); // TODO: add an error ID
            return;
        }
        var classes = ['aria.templates.TemplateCtxt', 'aria.templates.CSSMgr']; // classes to load in addition to the
        // template
        var moduleCtrl = cfg.moduleCtrl;
        if (moduleCtrl && !moduleCtrl.getData) {
            // the module controller is not yet initialized (description of how to create it is present in a json
            // object)
            if (!aria.core.JsonValidator.normalize({
                json : moduleCtrl,
                beanName : "aria.templates.CfgBeans.InitModuleCtrl"
            })) {
                // error should have already been reported
                this.$callback(cb, {
                    success : false
                }); // TODO: add an error ID
                return;
            }
            classes.push("aria.templates.ModuleCtrlFactory", moduleCtrl.classpath);
        }

        var cssToReload = ['aria.templates.GlobalStyle'];
        if (aria.widgets && aria.widgets.AriaSkin) {
            cssToReload.push('aria.templates.LegacyGeneralStyle');
        }
        if (cfg.reload) {
            aria.templates.TemplateManager.unloadTemplate(cfg.classpath, cfg.reloadByPassCache);
            if (aria.templates.CSSMgr) {
                cssToReload = cssToReload.concat(aria.templates.CSSMgr.getInvalidClasspaths(true));
            }
        }

        // Set the correct size for the div:
        var layout = aria.templates.Layout;
        if (cfg.rootDim) {
            layout.setRootDim(cfg.rootDim);
        }
        var div = cfg.div;
        div = aria.utils.Dom.replaceHTML(div, "");
        if (!div) {
            // error should have already been reported
            this.$callback(cb, {
                success : false
            }); // TODO: add an error ID
            return;
        }
        if (Aria.minSizeMode) {
            div.style.border = "2px solid red";
        }
        cfg.div = div; // keep the DOM object instead of the id for the rest of the process
        div.className = this.addPrintOptions(div.className, cfg.printOptions);
        if (cfg.width != null || cfg.height != null) {
            layout.setDivSize(div, cfg.width, cfg.height);
            if (typeof(cfg.width) == "object" || typeof(cfg.height) == "object") {
                layout.registerAutoresize(div, cfg.width, cfg.height);
            }
        }

        // Because of css-related positioning problems, it is safer to set a relative positioning on the div here
        // This is actually an IE6/7 only problem that can cause scrolling problems
        if (aria.core.Browser.isIE6 || aria.core.Browser.isIE7) {
            var curPosition = div.style.position;
            if (curPosition != "absolute" && curPosition != "relative") {
                div.style.position = "relative";
            }
        }

        // Creates the div for the template content and show the loading indicator
        var tplDiv = Aria.$window.document.createElement('div');
        tplDiv.className = "xLDI";
        div.appendChild(tplDiv);
        cfg.tplDiv = tplDiv;
        Aria.load({
            classes : classes,
            templates : [cfg.classpath],
            css : cssToReload,
            oncomplete : {
                scope : this,
                args : args,
                fn : __loadTemplate2
            },
            onerror : {
                scope : this,
                args : args,
                fn : errorInTemplateDiv
            }
        });
        div = null;
        tplDiv = null;
    };

    /**
     * ClassLoader for .tpl files.
     */
    Aria.classDefinition({
        $classpath : "aria.core.TplClassLoader",
        $extends : "aria.core.ClassLoader",
        $constructor : function () {
            this.$ClassLoader.constructor.apply(this, arguments);
            this._refLogicalPath += ".tpl";
            this._classGeneratorClassName = 'TplClassGenerator';
        },
        $onload : function () {
            var cstr = aria.core.TplClassLoader;
            // TODO: think to something more elegant here:
            // To be able to call the $callback function from a static method
            cstr.$callback = aria.core.JsObject.prototype.$callback;
            cstr.$logError = aria.core.JsObject.prototype.$logError;
            cstr.$normCallback = aria.core.JsObject.prototype.$normCallback;
            cstr.$classpath = 'aria.core.TplClassLoader';// in case of error in the $callback method
        },
        $statics : {
            // ERROR MESSAGES:
            TEMPLATE_EVAL_ERROR : "Error while evaluating the class generated from template '%1'",
            TEMPLATE_DEBUG_EVAL_ERROR : "Error while evaluating the class generated from template '%1'",
            MISSING_TPLSCRIPTDEFINITION : "The template script associated to template %1 must be defined using Aria.tplScriptDefinition.",

            /**
             * Method called from templates to import their template script prototype. This method should not be called
             * from anywhere else than the $init method in the generated templates.
             * @param {Object} scriptClass script class (e.g.: x.y.MyTemplateScript)
             * @param {Object} tplPrototype template prototype (parameter given to the $init method)
             * @private
             */
            _importScriptPrototype : function (scriptClass, tplPrototype) {
                var scriptDef = scriptClass.tplScriptDefinition;
                if (!scriptDef) {
                    return this.$logError(this.MISSING_TPLSCRIPTDEFINITION, [tplPrototype.$classpath]);
                }
                var classpathParts = scriptDef.$classpath.split('.');
                var className = classpathParts[classpathParts.length - 1];
                var refScriptProto = '$' + className;
                var proto = {};
                if (tplPrototype[refScriptProto]) {
                    return this.$logError(Aria.DUPLICATE_CLASSNAME, [scriptDef.$classpath]);
                }
                Aria.copyObject(scriptDef.$prototype, proto);
                Aria.copyObject(scriptDef.$statics, proto);

                var scriptResources = scriptClass.classDefinition.$resources;
                if (scriptResources) {
                    if (!tplPrototype.$resources) {
                        tplPrototype.$resources = {};
                    }
                    var scriptTransformedProto = scriptClass.prototype;
                    for (var member in scriptResources) {
                        if (scriptResources.hasOwnProperty(member)) {
                            if (tplPrototype[member] && !tplPrototype.$resources[member]) {
                                this.$logError(Aria.RESOURCES_HANDLE_CONFLICT, [member, scriptDef.$classpath]);
                            } else {
                                proto[member] = scriptTransformedProto[member];
                                tplPrototype.$resources[member] = scriptResources[member];
                            }
                        }
                    }
                }

                var scriptTexts = scriptClass.classDefinition.$texts;
                if (scriptTexts) {
                    if (!tplPrototype.$texts) {
                        tplPrototype.$texts = {};
                    }
                    for (var member in scriptTexts) {
                        if (scriptTexts.hasOwnProperty(member)) {
                            if (tplPrototype[member] && !tplPrototype.$texts[member]) {
                                this.$logError(Aria.TEXT_TEMPLATE_HANDLE_CONFLICT, [member, scriptDef.$classpath]);
                            } else {
                                proto[member] = scriptClass.prototype[member];
                                tplPrototype.$texts[member] = scriptTexts[member];
                            }
                        }
                    }
                }

                // copy script prototype to template prototype
                Aria.copyObject(proto, tplPrototype);
                proto.constructor = scriptDef.$constructor || Aria.empty;
                proto.$destructor = scriptDef.$destructor || Aria.empty;
                tplPrototype[refScriptProto] = proto;
            },

            /**
             * Convert print options into a set of CSS classes and add them to the provided set of classes.
             * @param {String} classes Set of classes separated by a space (e.g. className property). If print options
             * CSS classes are already present in this string, they will be removed.
             * @param {aria.templates.CfgBeans:PrintOptions} printOptions print options
             * @return {String} the updated set of classes.
             */
            addPrintOptions : function (classes, printOptions) {
                classes = classes.replace(/(\s|^)\s*xPrint\w*/g, '');
                if (printOptions == "adaptX") {
                    classes += " xPrintAdaptX";
                } else if (printOptions == "adaptY") {
                    classes += " xPrintAdaptY";
                } else if (printOptions == "adaptXY") {
                    classes += " xPrintAdaptX xPrintAdaptY";
                } else if (printOptions == "hidden") {
                    classes += " xPrintHide";
                }
                return classes;
            },

            /**
             * Load a template in a div. You should call Aria.loadTemplate, instead of this method.
             * @param {aria.templates.CfgBeans:LoadTemplateCfg} cfg configuration object
             * @param {aria.core.CfgBeans:Callback} callback which will be called when the template is loaded or if
             * there is an error. The first parameter of the callback is a JSON object with the following properties: {
             * success : {Boolean} true if the template was displayed, false otherwise } Note that the callback is
             * called when the template is loaded, but sub-templates may still be waiting to be loaded (showing a
             * loading indicator). Note that success==true means that the template was displayed, but there may be
             * errors inside some widgets or sub-templates.
             */
            loadTemplate : function (cfg, cb) {
                var appE = Aria.getClassRef("aria.core.environment.Customizations");
                if (appE && appE.isCustomized() && !appE.descriptorLoaded()) {
                    // the application is customized but the descriptor hasn't been loaded yet: register to the event
                    appE.$onOnce({
                        'descriptorLoaded' : {
                            fn : this._startLoad,
                            scope : this,
                            args : {
                                cfg : cfg,
                                cb : cb
                            }
                        }
                    });
                } else {
                    // no descriptor was specified, or it has already been loaded: go ahead
                    this._startLoad(null, {
                        cfg : cfg,
                        cb : cb
                    });
                }
            },

            /**
             * Internal callback from loadTemplate, resumes template loading after the customization descriptor has been
             * succesfully loaded (if necessary)
             */
            _startLoad : function (evt, args) {
                var cfg = args.cfg; // little redundant? (see below)
                var cb = args.cb;
                var appE = Aria.getClassRef("aria.core.environment.Customizations");

                var oldCP = cfg.origClasspath || cfg.classpath;

                // substitute CP (see method doc)
                cfg.classpath = appE ? appE.getTemplateCP(oldCP) : oldCP;
                cfg.origClasspath = oldCP;

                // resume normal template loading
                // PROFILING // this.prototype.$startMeasure("Tpl display", cfg.classpath);
                Aria.load({
                    classes : ['aria.templates.Layout', 'aria.templates.CfgBeans', 'aria.utils.Dom',
                            'aria.templates.TemplateManager'],
                    oncomplete : {
                        fn : __loadTemplate1,
                        args : {
                            cfg : cfg,
                            cb : cb
                        },
                        scope : this
                    }
                });
            },
            /**
             * Unload a template loaded with Aria.loadTemplate. You should call Aria.disposeTemplate, instead of this
             * method.
             * @param {aria.templates.CfgBeans:Div} div The div given to Aria.loadTemplate.
             */
            disposeTemplate : function (div) {
                if (typeof(div) == "string") {
                    div = aria.utils.Dom.getElementById(div);
                }
                if (aria && aria.utils && aria.utils.Dom) {
                    return aria.templates.TemplateCtxtManager.disposeFromDom(div);
                }
            }
        },
        $prototype : {
            /**
             * Load the class definition file.
             * @param {String} classDef File content, can be either the generated class definition or the source
             * template itself
             * @param {String} logicalPath template's logical classpath
             * @override
             */
            _loadClass : function (classDef, logicalPath) {
                this._loadClassAndGenerate(classDef, logicalPath);
            }
        }
    });
})();
/**
 * ClassLoader for CSS files.
 */
Aria.classDefinition({
    $classpath : "aria.core.CSSClassLoader",
    $extends : "aria.core.ClassLoader",
    $constructor : function () {
        this.$ClassLoader.constructor.apply(this, arguments);
        this._refLogicalPath += ".tpl.css";
        this._classGeneratorClassName = "CSSClassGenerator";
    },
    $statics : {
        // ERROR MESSAGES:
        TEMPLATE_EVAL_ERROR : "Error while evaluating the class generated from CSS template '%1'",
        TEMPLATE_DEBUG_EVAL_ERROR : "Error while evaluating the class generated from CSS template '%1'"
    },
    $prototype : {
        /**
         * Called when the .css file is received.
         * @param {String} classDef Content of the .tpl.css file
         * @param {String} logicalPath Logical path of the .tpl.css file
         * @protected
         */
        _loadClass : function (classDef, logicalPath) {
            this._loadClassAndGenerate(classDef, logicalPath, "aria.templates.CSSMgr");
        }
    }
});
/**
 * ClassLoader for template macro lib files.
 */
Aria.classDefinition({
    $classpath : 'aria.core.TmlClassLoader',
    $extends : 'aria.core.ClassLoader',
    $constructor : function () {
        this.$ClassLoader.constructor.apply(this, arguments);
        this._refLogicalPath += ".tml";
        this._classGeneratorClassName = 'TmlClassGenerator';
    },
    $statics : {
        // ERROR MESSAGES:
        TEMPLATE_EVAL_ERROR : "Error while evaluating the class generated from template macro library '%1'",
        TEMPLATE_DEBUG_EVAL_ERROR : "Error while evaluating the class generated from template macro library '%1'"
    },
    $prototype : {
        /**
         * Called when the .tml file is received.
         * @param {String} classDef Content of the .tml file
         * @param {String} logicalpath Logical path of the .tml file
         * @protected
         */
        _loadClass : function (classDef, logicalPath) {
            this._loadClassAndGenerate(classDef, logicalPath);
        }
    }
});
/**
 * ClassLoader for css macro lib files.
 */
Aria.classDefinition({
    $classpath : 'aria.core.CmlClassLoader',
    $extends : 'aria.core.ClassLoader',
    $constructor : function () {
        this.$ClassLoader.constructor.apply(this, arguments);
        this._refLogicalPath += ".cml";
        this._classGeneratorClassName = 'CmlClassGenerator';
    },
    $statics : {
        // ERROR MESSAGES:
        TEMPLATE_EVAL_ERROR : "Error while evaluating the class generated from CSS macro library '%1'",
        TEMPLATE_DEBUG_EVAL_ERROR : "Error while evaluating the class generated from CSS macro library '%1'"
    },
    $prototype : {
        /**
         * Called when the .cml file is received.
         * @param {String} classDef Content of the .cml file
         * @param {String} logicalPath Logical path of the .cml file
         * @protected
         */
        _loadClass : function (classDef, logicalPath) {
            this._loadClassAndGenerate(classDef, logicalPath);
        }
    }
});
/**
 * ClassLoader for text templates.
 */
Aria.classDefinition({
    $classpath : 'aria.core.TxtClassLoader',
    $extends : 'aria.core.ClassLoader',
    $constructor : function () {
        this.$ClassLoader.constructor.apply(this, arguments);
        this._refLogicalPath += ".tpl.txt";
        this._classGeneratorClassName = "TxtClassGenerator";
    },
    $statics : {
        // ERROR MESSAGES:
        TEMPLATE_EVAL_ERROR : "Error while evaluating the class generated from text template '%1'",
        TEMPLATE_DEBUG_EVAL_ERROR : "Error while evaluating the class generated from text template '%1'"
    },
    $prototype : {
        /**
         * Called when the .tpl.txt file is received.
         * @param {String} classDef Content of the .tpl.txt file
         * @param {String} logicalPath Logical path of the .tpl.txt file
         * @protected
         */
        _loadClass : function (classDef, logicalPath) {
            this._loadClassAndGenerate(classDef, logicalPath);
        }
    }
});
/**
 * Manage the class dependency load thanks to ClassLoaders. Classes can be of different types
 * (currently six: "JS", "TPL", "RES", "CSS", "TML" and "TXT"). Before loading a class, it is necessary to know its type
 * (there is no naming convention). This class uses the Cache object to store class definitions (through the
 * DownloadMgr) and indicators telling that a class is being downloaded.
 */
Aria.classDefinition({
    $classpath : "aria.core.ClassMgr",
    $singleton : true,
    $events : {
        /**
         * Raised in the listener of the 'complete' event raised by the appropriate classLoader.
         * @event classComplete
         */
        "classComplete" : {
            description : "notifies that the class loader process is done.",
            properties : {
                refClasspath : "{String} classpath of the reference class if any"
            }
        }
    },
    $constructor : function () {

        // TODO implement destructor
        /**
         * Internal reference to aria.core.Cache singleton
         * @private
         * @type aria.core.Cache
         */
        this._cache = null;

        /**
         * Map between extension and handler
         * @private
         * @type Object
         */
        this._classTypes = {
            "JS" : "aria.core.JsClassLoader",
            "TPL" : "aria.core.TplClassLoader",
            "RES" : "aria.core.ResClassLoader",
            "CSS" : "aria.core.CSSClassLoader",
            "TML" : "aria.core.TmlClassLoader",
            "CML" : "aria.core.CmlClassLoader",
            "TXT" : "aria.core.TxtClassLoader"
        };

    },
    $statics : {
        // ERROR MESSAGE:
        CIRCULAR_DEPENDENCY : "Class %1 and %2 have circular dependency",
        MISSING_CLASSLOADER : "The class loader of type %1 needed to load class %2 is missing. Make sure it is packaged."
    },
    $prototype : {
        /**
         * Convert a classpath into the corresponding logical path (without file extension). It simply replaces '.' by
         * '/' in the classpath. It does not add the extension at the end of the classpath.
         * @param {String} classpath Classpath to convert.
         */
        getBaseLogicalPath : function (classpath, classType) {
            // classType is curently ignored
            var parts = classpath.split('.');
            return parts.join("/");
        },

        /**
         * Method called when a class has been loaded completely (e.g. through Aria.loadClass or
         * JsonValidator.__loadBeans)
         * @param {String} classpath
         */
        notifyClassLoad : function (classpath) {
            if (!this._cache) {
                this._cache = aria.core.Cache;
            }
            this.$assert(1, this._cache);

            // get cache item, mark it as loaded and notify loader
            var itm = this._cache.getItem("classes", classpath, true);
            itm.status = this._cache.STATUS_AVAILABLE;
            if (itm.loader) {
                itm.loader.notifyLoadComplete();
            }

            // handle css dependencies registration after load
            // handle css dependency invalidation
            var classRef = Aria.getClassRef(classpath);
            // no class ref for beans
            if (classRef) {
                var classDef = Aria.getClassRef(classpath).classDefinition;
                if (classDef && classDef.$css) {
                    aria.templates.CSSMgr.registerDependencies(classpath, classDef.$css);
                }
            }
        },

        /**
         * Method called when a class could not be loaded completely (e.g. through Aria.loadClass or
         * JsonValidator.__loadBeans)
         * @param {String} classpath
         */
        notifyClassLoadError : function (classpath) {
            if (!this._cache) {
                this._cache = aria.core.Cache;
            }
            this.$assert(1, this._cache);

            // get cache item, mark it as error and notify loader
            var itm = this._cache.getItem("classes", classpath, true);
            itm.status = this._cache.STATUS_ERROR;
            if (itm.loader) {
                itm.loader.notifyLoadError();
            }
        },

        /**
         * Filter out classes which are already loaded from a list of classpaths
         * @param {Array} clsList the list of classpaths
         * @return {Array} the list of missing classes (or null if none is missing)
         */
        filterMissingDependencies : function (clsList, classType) { // TODO: remove classType - temp fix for resources
            // reloading and json injection
            if (!clsList) {
                return null;
            }
            var cache = this._cache, cls, itm, mdp = null, // missing dependency list
            status;
            for (var index = 0, l = clsList.length; index < l; index++) {
                cls = clsList[index];
                itm = cache.getItem("classes", cls, true);
                status = itm.status;
                if (status != cache.STATUS_AVAILABLE) {
                    if (status == cache.STATUS_ERROR) {
                        // dependency unavailable
                        return false; // dependencies not (never!?) ready
                    } else {
                        if (status == cache.STATUS_NEW && Aria.getClassRef(cls) && classType != "RES") {
                            itm.status = cache.STATUS_AVAILABLE;
                        } else {
                            if (!mdp) {
                                mdp = [];
                            }
                            mdp.push(cls);
                        }
                    }
                }
            }
            return mdp;
        },

        /**
         * Load the class dependencies associated to a class.
         * @param {String} classpath class path of the main class for which dependencies have to be loaded (will be used
         * to load the class when all dependencies are ready) The class loader for this class is supposed to exist
         * already, otherwise, an error is logged if this class loader is needed.
         * @param {Object} dpMap Map of the list of classpaths for each file type(js,res,tpl) that have to be loaded
         * prior to main classpath (can be null)
         * @param {Object} callback describes the callback function to call when the class and all its dependencies are
         * loaded: [callback] { fn: Aria.loadClass // mandatory scope: Aria // mandatory args: classpath // optional,
         * parameter to pass to the fn function } The callback function is only called if this function returns false.
         * @return {Boolean} return true if all dependencies are already loaded
         */
        loadClassDependencies : function (classpath, dpMap, callback) {
            if (!this._cache) {
                this._cache = aria.core.Cache;
            }
            this.$assert(2, this._cache);
            this.$assert(72, callback && callback.fn && callback.scope);
            var cache = this._cache,
            // we suppose the class loader already exists, so we don't use a type name for getClassLoader
            loader = this.getClassLoader(classpath);
            if (!loader) {
                // This can happen if an already loaded class (or a class which
                // failed to load) is reloaded with Aria.classDefinition,
                // or Aria.beansDefinition ...
                // in this case, reinit the status, and get a new class loader
                var itm = cache.getItem("classes", classpath, true);
                itm.status = cache.STATUS_LOADING;
                itm = null;
                loader = this.getClassLoader(classpath);
            }
            loader.notifyClassDefinitionCalled();
            if (!dpMap) {
                return true;
            }
            loader.callback = callback;

            var noMissingDep = true;
            for (var ext in dpMap) {
                if (dpMap.hasOwnProperty(ext)) {
                    var missingDep = this.filterMissingDependencies(dpMap[ext]);
                    if (missingDep != null) {
                        noMissingDep = false;
                        // add dependencies of type ext
                        loader.addDependencies(missingDep, ext);
                    }
                }
            }

            if (noMissingDep) {
                // no dependency - but class not completly loaded
                // so we set the status as loading
                var itm = cache.getItem("classes", classpath, true);
                itm.status = cache.STATUS_LOADING;
                return true; // all dependencies are ready
            }

            var circular = loader.getCircular();
            if (circular) {
                this.$logError(this.CIRCULAR_DEPENDENCY, [classpath, circular]);
                return this.notifyClassLoadError(classpath);
            }

            loader.loadDependencies();
            return false; // some dependencies are missing
        },

        /**
         * Create and return a classloader for the specified class (if not already loaded) and store it in the aria
         * Cache to share it with other listeners that would need the same resource
         * @param {String} classpath the classpath of the class for which the loader is requested
         * @param {String} typeName [optional] type of class loader to be created if needed if this parameter is omitted
         * and a new class loader is needed, an error is logged
         * @return {aria.core.ClassLoader} the class loader or null if the class is already loaded
         */
        getClassLoader : function (classpath, typeName, original) {
            var cache = this._cache, itm = cache.getItem("classes", classpath, true), status = itm.status;
            // don't return loader if class already loaded
            if (status == cache.STATUS_AVAILABLE || status == cache.STATUS_ERROR) {
                return null;
            }

            var loader = itm.loader;
            if (!loader) {
                var loaderConstr = (typeName != null ? this._classTypes[typeName] : aria.core.ClassLoader);
                if (typeof loaderConstr === "string") {
                    loaderConstr = Aria.getClassRef(loaderConstr);
                }
                if (!loaderConstr) {
                    this.$logError(this.MISSING_CLASSLOADER, [typeName, classpath]);
                } else {
                    loader = new loaderConstr(classpath, typeName);
                    itm.loader = loader;
                    itm.content = typeName;
                    loader.$on({
                        'complete' : this._onClassLoaderComplete,
                        scope : this
                    });
                }
            }

            // even if we didn't start the loader the class is in its load phase
            itm.status = cache.STATUS_LOADING;
            return loader;
        },

        /**
         * Unload a class (cache/files/urls associated)
         * @param {String} classpath the classpath of the class to be removed
         * @param {Boolean} timestampNextTime if true, the next time the class is loaded, browser and server cache will
         * be bypassed by adding a timestamp to the url
         */
        unloadClass : function (classpath, timestampNextTime) {

            // handle css dependency invalidation
            var classRef = Aria.getClassRef(classpath);
            // no class ref for beans
            if (classRef) {
                var classDef = Aria.getClassRef(classpath).classDefinition;
                if (classDef && classDef.$css) {
                    aria.templates.CSSMgr.unregisterDependencies(classpath, classDef.$css, true, timestampNextTime);
                }
            }

            // clean the class
            Aria.dispose(classpath);
            Aria.cleanGetClassRefCache(classpath);
            var logicalPath = aria.core.Cache.getFilename(classpath);
            if (logicalPath) {
                aria.core.DownloadMgr.clearFile(logicalPath, timestampNextTime);
            }
            var classesInCache = this._cache.content.classes;
            delete classesInCache[classpath];
        },

        /**
         * Unload class from the cache and destroy it's reference based on class type
         * @param {String} classType class type (RES,JS,TPL)
         * @param {Boolean} dispose True to dispose also the classdefinition. Default false
         */
        unloadClassesByType : function (classType, dispose) {
            var classes = this._cache.content.classes;
            for (var itm in classes) {
                if (classes.hasOwnProperty(itm) && classes[itm].content === classType) {
                    if (dispose) {
                        Aria.dispose(itm);
                        Aria.cleanGetClassRefCache(itm);
                        var logicalPath = aria.core.Cache.getFilename(itm);
                        aria.core.DownloadMgr.clearFile(logicalPath, true);
                    }

                    delete classes[itm];
                }
            }
        },

        /**
         * Internal method called when a class loader can be disposed
         * @param {aria.core.ClassLoader:complete:event} evt
         * @private
         */
        _onClassLoaderComplete : function (evt) {
            var clspath = evt.refClasspath;
            this.$assert(4, clspath); // could change in the future
            var loader = evt.src;

            loader.$dispose();
            var itm = aria.core.Cache.getItem("classes", clspath);
            if (itm) {
                itm.loader = null; // remove ref to class loader
                delete itm.loader;
            }
            this.$raiseEvent({
                name : "classComplete",
                refClasspath : clspath
            });
        }
    }
});
/**
 * Download Manager manages file download synchronization thanks to the FileLoader and Cache. When multiple files are
 * associated to the same physical URL, makes sure listeneres are associated to the same loader Manage logical path /
 * physical URL mapping (the same physical URL can be used for multiple logical paths in case of multipart (packaged)
 * files) thanks to the Url Map.
 */
Aria.classDefinition({
    $classpath : "aria.core.DownloadMgr",
    $singleton : true,
    $dependencies : ["aria.utils.Type", "aria.utils.Json"],
    $constructor : function () {

        /**
         * Download Manager Cache
         * @protected
         * @type aria.core.Cache
         */
        this._cache = null;

        /**
         * Map between path/packages and a given file to load. <br />
         * '*' as a key will allow to match any class of a package <br />
         * '**' as a key will allow to match any class and subpackages in a package
         * @protected
         * @type Object
         */
        this._urlMap = {};

        /**
         * Map between a package and a rootUrl where to find this package '*' as a key will allow to match any
         * subPackage of a package
         * @protected
         * @type Object
         */
        this._rootMap = {};

        /**
         * Json utils shortcut
         * @protected
         * @type aria.utils.Json
         */
        this._jsonUtils = aria.utils.Json;

        /**
         * Type utils shortcut
         * @protected
         * @type aria.utils.Type
         */
        this._typeUtils = aria.utils.Type;

        /**
         * Map of URLs for which it is desired to bypass the browser cache.
         * @protected
         * @type Object
         */
        this._timestampURL = {};
    },
    $destructor : function () {
        this._cache = null;
        this._urlMap = null;
        this._rootMap = null;
        this._jsonUtils = null;
        this._timestampURL = null;
    },
    $prototype : {

        /**
         * Update the url map with the given structure
         * @param {Object} map
         */
        updateUrlMap : function (map) {
            this._jsonUtils.inject(map, this._urlMap, true);
        },

        /**
         * Update the url map with the given structure
         * @param {Object} map
         */
        updateRootMap : function (map) {
            this._jsonUtils.inject(map, this._rootMap, true);
        },

        /**
         * Mark the url as needing (or not) a timestamp when loading it next time (to bypass browser and server cache)
         * @param {String} url URL for which the timestamp setting will change
         * @param {Boolean} activate [optional, default true] if false, the timestamp will be disabled for the url,
         * otherwise it will be enabled
         */
        enableURLTimestamp : function (url, activate) {
            if (activate !== false) {
                this._timestampURL[url] = true;
            } else {
                delete this._timestampURL[url];
            }
        },

        /**
         * Add a timestamp to the given URL if it should bypass browser cache.
         * @param {String} url URL for which a timestamp should be added if necessary
         * @param {Boolean} force if true, the timestamp will always be added
         * @return {String} URL with the added timestamp if this is required
         */
        getURLWithTimestamp : function (url, force) {
            if (force || this._timestampURL[url]) {
                var timestamp = (new Date()).getTime();
                if (url.indexOf("?") != -1) {
                    return url + "&timestamp=" + timestamp;
                } else {
                    return url + "?timestamp=" + timestamp;
                }
            } else {
                return url;
            }
        },

        /**
         * Return an url list from an array containing the starting url, this function is usefull to retrieve package
         * name with md5 from the name without it
         * @param {String|Array} urls starting url string
         * @return {Array} array of full url
         */
        getPackages : function (urls) {

            if (this._typeUtils.isString(urls)) {
                urls = [urls];
            }

            var _getPackages = function (urls, urlMap, packages) {
                if (urls.length === 0) {
                    // everything has been found, leave back the recursive loop
                    return;
                }
                for (var key in urlMap) {
                    var value = urlMap[key];
                    if (typeof(value) == 'string') {
                        value = "/" + value;
                        // Check if something match
                        for (var i = 0, ii = urls.length; i < ii; i++) {
                            var file = urls[i];
                            if (value.substr(0, file.length) == file) {
                                packages[value] = true;
                                // remove found item from the url list, for performance reason
                                urls.slice(i, i);
                                break;
                            }
                        }
                    } else {
                        _getPackages(urls, urlMap[key], packages);
                    }
                }
            };

            // Clone urls array
            var urlClone = [];
            for (var i = 0, ii = urls.length; i < ii; i++) {
                urlClone.push(urls[i]);
            }

            var packages = {};
            _getPackages(urls, this._urlMap, packages);

            // return the keys only
            var keys = [];
            for (var key in packages) {
                keys.push(key);
            }
            return keys;
        },

        /**
         * Get a file from its logical path
         * @param {String} logicalPath file logical path e.g. aria/core/Sequencer.js
         * @param {aria.core.CfgBeans:Callback} cb callback description - warning callback may be called synchronously
         * if the file is already available
         *
         * <pre>
         *     {
         *         fn: // {Function} callback function
         *         scope: // {Object} object context associated to the callback function (i.e. 'this' object)
         *         args: // {Object} optional argument object passed to the callback function when called
         *     }
         * </pre>
         *
         * When called the callback will be called with the following arguments: fn(evt,args) where evt corresponds to
         * aria.core.FileLoader.$events.fileReady
         * @param {Object} args Additional arguments for the file loader
         *
         * <pre>
         *     {
         *         fullLogicalPath: // {String} Full logical path of the file to be loaded.
         *                       // If not specified the root url will be resolved to the framework root
         *  }
         * </pre>
         */
        loadFile : function (logicalPath, cb, args) {
            // get the file item in the cache
            if (!this._cache) {
                this._cache = aria.core.Cache;
            }
            this.$assert(34, this._cache);
            this.$assert(35, cb.scope);
            this.$assert(36, cb.fn);

            var cache = this._cache, itm = cache.getItem("files", logicalPath, true), status = itm.status;

            // if file already loaded, directly call callback
            if (status == cache.STATUS_AVAILABLE || status == cache.STATUS_ERROR) {
                var evt = {
                    name : "fileReady",
                    src : this,
                    logicalPaths : [logicalPath],
                    url : null
                };
                return this.$callback(cb, evt);
            }

            // file is not loaded: create a file loader if not already done
            var loader = itm.loader;
            if (!loader) {
                this.$assert(63, aria.core.FileLoader);

                var url;
                if (args && args.fullLogicalPath) {
                    url = args.fullLogicalPath;
                } else {
                    url = this.resolveURL(logicalPath);
                }

                // register the loader in a Cache 'urls' category
                // we do so as multiple logical path can be associated to the same url
                // (packaged files served as multipart responses)
                var urlItm = cache.getItem("urls", url, true);

                if (urlItm.status == this._cache.STATUS_AVAILABLE) {
                    // this url has already been fetch, but file was not retrieved in it
                    var evt = {
                        name : "fileReady",
                        src : this,
                        logicalPaths : [logicalPath],
                        url : url,
                        downloadFailed : true
                    };
                    return this.$callback(cb, evt);
                }

                if (urlItm.loader) {
                    // this loader should be processing as 'files' entry in cache is empty
                    this.$assert(72, urlItm.status == cache.STATUS_LOADING);
                } else {
                    urlItm.loader = new aria.core.FileLoader(url);
                    urlItm.status = cache.STATUS_LOADING;

                    // register on complete to delete the object when not necessary anymore
                    urlItm.loader.$on({
                        'complete' : this._onFileLoaderComplete,
                        scope : this
                    });
                }
                loader = urlItm.loader;
                // double-reference loader in the 'files' category
                itm.loader = loader;
                url = urlItm = null;
            }

            // add caller as listener to the FileLoader
            loader.addLogicalPath(logicalPath);
            var cbArgs = (cb.args) ? cb.args : null;
            loader.$on({
                'fileReady' : {
                    fn : cb.fn,
                    args : cbArgs,
                    scope : cb.scope
                }
            });
            loader.loadFile();
            cbArgs = loader = null;
        },

        /**
         * Find node associated to a path in a map. May be a string, an object, a function or a instance of callback, or
         * null.
         * @protected
         * @param {Object} map
         * @param {Array} pathparts
         * @param {Boolean} doubleStar support double star ** notation
         * @return {Object} node and index in path
         */
        _extractTarget : function (map, pathparts, doubleStar) {
            for (var i = 0, l = pathparts.length; i < l; i++) {
                var part = pathparts[i];
                if (!this._typeUtils.isObject(map) || this._typeUtils.isInstanceOf(map, 'aria.core.JsObject')) {
                    break;
                }
                if (!map[part]) {
                    if (doubleStar) {
                        if (map['*'] && i == l - 1) {
                            map = map['*'];
                        } else {
                            map = map['**'];
                        }
                    } else {
                        map = map['*'];
                    }
                    break;
                }

                map = map[part];
            }
            return {
                node : map,
                index : i
            };
        },

        /**
         * Method transforming a logical path into a physical url (uses the _urlMap generated by the packager to
         * determine packaged files and MD5 extensions)
         * @param {String} logicalPath logical path of the file - e.g. aria/jsunit/TestCase.js
         * @param {Boolean} rootOnly Only apply the root map, if true it won't consider packaging and md5. Default false
         * @return {String} the absolute URL - e.g. http://host:port/yy/aria/jsunit/Package-123456789.txt
         */
        resolveURL : function (logicalPath, rootOnly) {
            var res = logicalPath, // default response: logical path
            rootPath = Aria.rootFolderPath, // default root path
            // Some files have multiple extensions, .tpl.txt, .tpl.css, strip only the last one
            lastIndex = logicalPath.lastIndexOf("."), extensionFreePath = logicalPath.substring(0, lastIndex), //
            urlMap = this._urlMap, rootMap = this._rootMap, pathparts = extensionFreePath.split('/'), extract;

            // extract target from urlMap
            if (rootOnly !== true) {
                extract = this._extractTarget(urlMap, pathparts, true);
                urlMap = extract.node;

                if (this._typeUtils.isString(urlMap)) {
                    res = urlMap;
                } else if (this._typeUtils.isInstanceOf(urlMap, 'aria.utils.Callback')) {
                    res = urlMap.call(logicalPath);
                } else if (this._typeUtils.isFunction(urlMap)) {
                    res = urlMap.call(null, logicalPath);
                }
            }

            // extract target from rootMap
            rootMap = this._extractTarget(rootMap, pathparts).node;

            if (this._typeUtils.isString(rootMap)) {
                rootPath = rootMap;
            } else if (this._typeUtils.isInstanceOf(rootMap, 'aria.utils.Callback')) {
                rootPath = rootMap.call(logicalPath);
            } else if (this._typeUtils.isFunction(rootMap)) {
                rootPath = rootMap.call(null, logicalPath);
            }

            return rootPath + res;
        },

        /**
         * Internal method called when a file loader can be disposed
         * @param {aria.core.FileLoader:complete:event} evt
         * @private
         */
        _onFileLoaderComplete : function (evt) {
            var loader = evt.src, cache = this._cache, itm, lps = loader.getLogicalPaths();
            if (lps) {
                // remove loader ref from all 'files' entries
                var sz = lps.length;
                for (var i = 0; sz > i; i++) {
                    itm = cache.getItem("files", lps[i], false);
                    if (itm) {
                        this.$assert(120, itm.loader == loader);
                        itm.loader = null;
                    }
                }
            }
            // remove entry from "urls" category
            itm = cache.getItem("urls", loader.getURL(), false);
            if (itm) {
                this.$assert(128, itm.loader == loader);
                itm.loader = null;
                itm.status = this._cache.STATUS_AVAILABLE;
            }
            // dispose
            loader.$dispose();
            loader = cache = itm = lps = null;
        },

        /**
         * Function called by a file loader when a file content has been retrieved
         * @param {String} logicalPath the logical path of the file
         * @param {String} content the file content
         */
        loadFileContent : function (logicalPath, content, hasErrors) {
            if (!this._cache) {
                this._cache = aria.core.Cache;
            }
            var itm = this._cache.getItem("files", logicalPath, true);
            if (hasErrors) {
                itm.status = this._cache.STATUS_ERROR;
            } else {
                itm.value = content;
                itm.status = this._cache.STATUS_AVAILABLE;
            }
            itm = null;
        },

        /**
         * Get the file content from its logical path Return null if file is in error
         * @param {String} logicalPath
         * @return {String}
         */
        getFileContent : function (logicalPath) {
            var itm = this._cache.getItem("files", logicalPath, false);
            if (itm && itm.status == this._cache.STATUS_AVAILABLE) {
                return itm.value;
            }
            return null;
        },

        /**
         * Gets tpl file content based on its classpath or retrieves it from the cache if it has been already loaded
         * @param {String} classpath Classpath of the template
         * @param {aria.core.CfgBeans:Callback} cb Callback to be called after tpl content is downloaded
         */
        loadTplFileContent : function (classpath, cb) {
            var logicalPath = aria.core.ClassMgr.getBaseLogicalPath(classpath) + ".tpl";
            this.loadFile(logicalPath, {
                fn : this._onTplFileContentReceive,
                scope : this,
                args : {
                    origCb : cb
                }
            }, null);
        },

        /**
         * Internal method called when tpl content is loaded
         * @param {aria.core.FileLoader:complete:event} evt
         * @param {Object} args Additonal arguments for the callback {origCb: {JSON callback} orignal callback to be
         * called after file load is complete}
         * @protected
         */
        _onTplFileContentReceive : function (evt, args) {
            var res = {
                content : null
            };
            if (evt.downloadFailed) {
                res.downloadFailed = evt.downloadFailed;
            }
            if (evt.logicalPaths.length > 0) {
                res.content = this.getFileContent(evt.logicalPaths[0]);
            }
            this.$callback(args.origCb, res);
        },

        /**
         * Remove the file content associated with logical path
         * @param {String} classpath
         * @param {Boolean} timestampNextTime if true, the next time the logical path is loaded, browser and server
         * cache will be bypassed by adding a timestamp to the url
         */
        clearFile : function (logicalPath, timestampNextTime) {
            var content = this._cache.content;
            delete content.files[logicalPath];
            var url = this.resolveURL(logicalPath);
            delete content.urls[url];
            if (timestampNextTime) {
                this.enableURLTimestamp(url, true); // browser cache will be bypassed next time the file is loaded
            }
        }
    }
});
Aria.classDefinition({
    $classpath : "aria.core.FileLoader",

    $events : {
        /**
         * @event fileReady
         */
        "fileReady" : {
            description : "notifies that the file associated to the loader is ready for use or that an error occured",
            properties : {
                logicalPaths : "{Array} expected logical paths associated to the file (a multipart file may contain extra files, which were not asked for)",
                url : "{String} URL used to retrieve the file (may be the URL of a multipart file)",
                downloadFailed : "{boolean} if true, no path in logicalPaths could be retrieved successfully (maybe other logical paths)"
            }
        },
        /**
         * @event complete
         */
        "complete" : {
            description : "notifies that the file loader process is done and that it can be disposed (i.e. fileReady listeners have already been called when this event is raised)"
        }
    },

    $constructor : function (fileURL) {
        /**
         * Loader url
         * @type String
         */
        this._url = fileURL;

        /**
         * Loader url item in cache
         * @type Object
         */
        this._urlItm = aria.core.Cache.getItem("urls", fileURL, true);

        this._logicalPaths = [];
        this._isProcessing = false;

        /**
         * Status of the file loader. Value are available in aria.core.Cache
         * @type Number
         */
        this.status = aria.core.Cache.STATUS_NEW;

    },
    $statics : {
        // ERROR MESSAGES:
        INVALID_MULTIPART : "Error in multipart structure of %1, part %2",
        LPNOTFOUND_MULTIPART : "The expected logical path %1 was not found in multipart %2",
        EXPECTED_MULTIPART : "The expected multipart structure was not found in %1."
    },
    $prototype : {

        _multiPartHeader : /^(\/\*[\s\S]*?\*\/\s*\r?\n)?\/\/\*\*\*MULTI-PART(\r?\n[^\n]+\n)/,
        _logicalPathHeader : /^\/\/LOGICAL-PATH:([^\s]+)$/,

        /**
         * Start the dowload of the file associated to the loader url
         */
        loadFile : function () {
            if (this._isProcessing) {
                return;
            }
            this.$assert(33, this._logicalPaths.length > 0);
            this._isProcessing = true;
            aria.core.IO.asyncRequest({
                sender : {
                    classpath : this.$classpath,
                    logicalPaths : this._logicalPaths
                },
                url : aria.core.DownloadMgr.getURLWithTimestamp(this._url), // add a timestamp to the URL if required
                callback : {
                    fn : this._onFileReceive,
                    onerror : this._onFileReceive,
                    scope : this
                },
                expectedResponseType : "text"
            });
        },

        /**
         * Associate a new logical path to the loader Note: as multiple files can be packaged into a same file, a loader
         * can be associated to multiple logical paths. Return true if the logicalPath was not already registered.
         * @param {String} lp
         * @return {Boolean}
         */
        addLogicalPath : function (lp) {
            var logicalPaths = this._logicalPaths;
            for (var index = 0, l = logicalPaths.length; index < l; index++) {
                if (logicalPaths[index] === lp) {
                    return false;
                }
            }
            this._logicalPaths.push(lp);
            return true;
        },

        /**
         * Get the list of logical paths associated to the loader
         * @return {Array}
         */
        getLogicalPaths : function () {
            return this._logicalPaths;
        },

        /**
         * Get the url associated to this loader
         * @return {String}
         */
        getURL : function () {
            return this._url;
        },

        /**
         * Internal callback called by the IO object when the file has been succesfully received
         * @param {Object} ioRes IO result object
         * @private
         */
        _onFileReceive : function (ioRes) {
            var multipart;
            // store file in cache
            var downloadFailed = (ioRes.status != '200');
            this.$assert(79, this._logicalPaths.length > 0);

            if (!downloadFailed) {
                // check if the file received is multipart
                multipart = this._multiPartHeader.exec(ioRes.responseText);
                if (multipart != null) {
                    // it is multipart, we split it; separator is multipart[2]
                    var parts = ioRes.responseText.split(multipart[2]), partsLength = parts.length;
                    var lpReceived = {}; // hash table to know which logical paths were received
                    var logicalpath; // current logical path
                    for (var i = 1; i < partsLength; i += 2) {
                        logicalpath = this._logicalPathHeader.exec(parts[i]);
                        if (logicalpath != null) {
                            logicalpath = logicalpath[1];
                        }
                        var content = parts[i + 1];
                        if (logicalpath == null || content == null) {
                            this.$logError(this.INVALID_MULTIPART, [ioRes.url, (i + 1) / 2]);
                            continue;
                        }
                        // for last element, set this loader as finished (available status)
                        if (i + 3 > partsLength) {
                            this._urlItm.status = aria.core.Cache.STATUS_AVAILABLE;
                        }
                        lpReceived[logicalpath] = 1;
                        aria.core.DownloadMgr.loadFileContent(logicalpath, content, content == null);
                    }
                    var nbFilesMissing = 0;
                    // check that all expected logical paths were returned, or otherwise report an error for that
                    // logical path:
                    for (var i = 0; i < this._logicalPaths.length; i++) {
                        logicalpath = this._logicalPaths[i];
                        if (lpReceived[logicalpath] != 1) {
                            this.$logError(this.LPNOTFOUND_MULTIPART, [logicalpath, ioRes.url]);
                            aria.core.DownloadMgr.loadFileContent(logicalpath, null, true);
                            nbFilesMissing++;
                        }
                    }
                    if (nbFilesMissing == this._logicalPaths.length) {
                        downloadFailed = true;
                    }
                } else {
                    this._urlItm.status = aria.core.Cache.STATUS_AVAILABLE;
                    // we did not receive a multipart, we should have only one logical path
                    if (this._logicalPaths.length == 1) {
                        aria.core.DownloadMgr.loadFileContent(this._logicalPaths[0], ioRes.responseText, false);
                    } else {
                        this.$logError(this.EXPECTED_MULTIPART, ioRes.url);
                        downloadFailed = true;
                    }
                }
            }

            if (downloadFailed && multipart == null) {
                // if an error occured, and we have not yet done it,
                // we put the error in the cache for every expected logical path
                for (var i = 0; i < this._logicalPaths.length; i++) {
                    aria.core.DownloadMgr.loadFileContent(this._logicalPaths[i], ioRes.responseText, true);
                }
            }

            // notify listeners
            this.$raiseEvent({
                name : "fileReady",
                logicalPaths : this._logicalPaths,
                url : this._url,
                downloadFailed : downloadFailed
            });

            this._isProcessing = false;

            // send complete (ready for dispose)
            this.$raiseEvent({
                name : "complete"
            });
        }
    }
});
/**
 * This class handles asynchronous callbacks and gives the possibility to associate an object
 * (scope) to the callback function - which is not possible with setTimeout(...) It also creates a unique id that
 * can be used to cancel the callback
 */
Aria.classDefinition({
    $classpath : "aria.core.Timer",
    $singleton : true,
    $constructor : function () {
        /**
         * List or callbacks currently defined (indexed by callback id) Items have the following form:
         *
         * <pre>
         * '456' : { // callback internal id
         *    fn : cb.fn,
         *    scope : cb.scope,
         *    delay : delay,
         *    args : args,
         *    cancelId : 123456413
         * }
         * </pre>
         *
         * @type Map
         * @private
         */
        this._callbacks = {};

        /**
         * Association map between interval/timeout ids and internal ids Items have the following form:
         *
         * <pre>
         * '4578912156'
         * : '456' // key=timeout id, value=internal callback id
         * </pre>
         *
         * @type Map
         * @private
         */
        this._cancelIds = {};

        /**
         * Callback counter - automatically reset to 0 when reaches _MAX_COUNT
         * @type Integer
         * @private
         */
        this._cbCount = 0;

        /**
         * Running total of callbacks as they are added and removed.
         * @type Integer
         * @private
         */
        this._numberOfCallbacks = 0;
    },
    $destructor : function () {
        this.callbacksRemaining();
    },
    $statics : {
        // ERROR MESSAGES:
        TIMER_CB_ERROR : "Uncaught exception in Timer callback (%1)",
        TIMER_CB_ERROR_ERROR : "Uncaught exception in Timer callback error handler (%1)"
    },
    $prototype : {
        _MAX_COUNT : 100000,

        /**
         * Checks if any callbacks are remaining, if there are then logs an error and cancels the callback.
         * @public
         */
        callbacksRemaining : function () {
            var callbacks = this._callbacks;
            if (this._numberOfCallbacks > 0) {
                var item;
                for (var i in callbacks) {
                    item = callbacks[i];
                    /*
                     * this.$logError("10013_TIMER_CB_ERROR", [ "A callback exists after the test has been destroyed: " +
                     * item.scope.$classpath, this.$classpath]);
                     */
                    this.cancelCallback(i + '-' + item.cancelId);
                }
            }
        },

        /**
         * Create a new callback and return a callback id note: callbacks are automatically removed from the list once
         * executed. <code>
         * aria.core.Timer.addCallback({
         *     fn : obj.method, // mandatory
         *     scope : obj, // mandatory
         *     onerror : obj2.method2 // callback error handler - optional - default: Timer error log
         *     onerrorScope : obj2 // optional - default: Timer or scope if onError is provided
         *     delay : 100, // optional - default: 1ms
         *     args : {x:123} // optional - default: null
         * });
         * </code>
         * @param {Object} cb the callback description
         * @return {String} cancel id
         */
        addCallback : function (cb) {
            // TODO: check mandatory attributes and log error if pb
            this.$assert(74, cb && cb.scope && cb.fn); // temporary solution
            var onerror = (cb.onerror) ? cb.onerror : null;
            var onerrorScope = (cb.onerrorScope) ? cb.onerrorScope : null;
            // create new cb
            this._cbCount++;
            this._numberOfCallbacks++;
            var delay = (cb.delay > 0) ? cb.delay : 1;
            var args = (cb.args) ? cb.args : null;
            this._callbacks["" + this._cbCount] = {
                fn : cb.fn,
                scope : cb.scope,
                delay : delay,
                args : args,
                onerror : onerror,
                onerrorScope : onerrorScope
            };
            var cbCount = this._cbCount;
            var cancelId = setTimeout(function () {
                aria.core.Timer._execCallback(cbCount);
            }, delay);
            this._cancelIds["" + cancelId] = this._cbCount;
            this._callbacks["" + this._cbCount].cancelId = cancelId;

            // we return a combination of internal id + cancelId to check that we are
            // not given an old id when cancelCallback is called
            var returnId = this._cbCount + "-" + cancelId;

            // reset count to avoid large nbr pb
            if (this._cbCount > this._MAX_COUNT) {
                this._cbCount = 0;
            }
            return returnId;
        },

        /**
         * Function called by the setTimeout callback when the delay time has expired
         * @param {Integer} cbId the internal callback id
         * @protected
         */
        _execCallback : function (cbId) {
            var id = "" + cbId;
            var cb = this._callbacks[id];
            if (cb) {
                // delete callback
                this._deleteCallback(id, true); // must be done before calling the callback so that callbacksRemaining
                // can be called in the callback

                try {
                    // execute callback
                    cb.fn.call(cb.scope, cb.args);
                } catch (ex) {
                    if (cb.onerror != null && typeof(cb.onerror == 'function')) {

                        try {
                            var scope = (cb.onerrorScope != null) ? cb.onerrorScope : cb.scope;
                            cb.onerror.call(scope, ex, cb);
                        } catch (ex2) {
                            this.$logError(this.TIMER_CB_ERROR_ERROR, [id], ex2);
                        }

                    } else {
                        this.$logError(this.TIMER_CB_ERROR, [id], ex);
                    }
                }
                cb.fn = null;
                cb.scope = null;
                cb.onerror = null;
                cb.onerrorScope = null;
            }

        },

        /**
         * Cancel a callback if not already executed
         * @param {String} cancelId returned by the addCallback() method
         */
        cancelCallback : function (cancelId) {
            var arr = cancelId.split('-');
            var idx = arr[0];
            var winCancelId = parseInt(arr[1], 10);
            clearTimeout(winCancelId);
            this._deleteCallback(idx);
        },

        /**
         * Internal method to cleanup and delete a callback from the stack
         * @param {String} cbIdx
         * @protected
         */
        _deleteCallback : function (cbIdx, skipNullify) {
            var cb = this._callbacks['' + cbIdx];
            if (cb) {
                // delete cancel id entry
                delete this._cancelIds["" + cb.cancelId];
                this._numberOfCallbacks--;
                delete this._callbacks['' + cbIdx];
                if (!skipNullify) {
                    cb.fn = null;
                    cb.scope = null;
                    cb.onerror = null;
                    cb.onerrorScope = null;
                }
            }
        }
    }
});
(function () {

    var typeUtils = aria.utils.Type;
    var __mergeEvents = Aria.__mergeEvents;
    var __clsMgr = aria.core.ClassMgr;
    var __cpt = -1; // last used number to store the key inside the interface
    var __getNextCpt = function () {
        __cpt++;
        return __cpt;
    };

    /**
     * Generate a key that does not exist in the given object.
     * @param {Object} instances Object for which a non-existent key must be generated.
     * @return {String|Number} key which does not exist in instances.
     * @private
     */
    var __generateKey = function (instances) {
        var r = 10000000 * Math.random(); // todo: could be replaced with algo generating keys with numbers and
        // letters
        var key = '' + (r | r); // r|r = equivalent to Math.floor - but faster in old browsers
        while (instances[key]) {
            key += 'x';
        }
        return key;
    };

    /**
     * Map of accepted types for interface members.
     * @type Object
     * @private
     */
    var __acceptedMemberTypes = {
        // When changing a type here, remember to also change aria.core.CfgBeans.ItfMemberXXXCfg
        "Function" : 1,
        "Object" : 1,
        "Interface" : 1
    };

    /**
     * Contains the definition for a function defined in the interface by: function(){}
     * @type Object
     * @private
     */
    var __simpleFunctionDefinition = {
        $type : "Function"
    };

    /**
     * Contains the definition for an array defined in the interface by: []
     * @type Object
     * @private
     */
    var __simpleArrayDefinition = {
        $type : "Object"
    };

    /**
     * Normalize interface member definition in the interface.
     * @param {String|Function|Object|Array} Interface member definition.
     * @return {Object} json object containing at least the $type property.
     * @private
     */
    var __normalizeMember = function (def, classpath, member) {
        var res;
        if (typeUtils.isFunction(def)) {
            // should already be normalized:
            return __simpleFunctionDefinition;
        } else if (typeUtils.isString(def)) {
            res = {
                $type : def
            };
        } else if (typeUtils.isArray(def)) {
            return __simpleArrayDefinition;
        } else if (typeUtils.isObject(def)) {
            res = def;
        } else {
            return null;
        }
        var memberType = res.$type;
        if (!__acceptedMemberTypes[memberType]) {
            // the error is logged later
            return null;
        }
        if (!aria.core.JsonValidator.normalize({
            json : res,
            beanName : "aria.core.CfgBeans.ItfMember" + memberType + "Cfg"
        })) {
            return null;
        }
        return res;
    };

    /**
     * Simple 1 level copy of a map.
     * @param {Object}
     * @return {Object}
     */
    var __copyMap = function (src) {
        var res = {};
        for (var k in src) {
            if (src.hasOwnProperty(k)) {
                res[k] = src[k];
            }
        }
        return res;
    };

    /**
     * Prototype inherited by all interface wrappers.
     * @private
     */
    var __superInterfacePrototype = {
        // To be automatically overriden in sub-interfaces:
        $interface : function () {},
        $destructor : function () {},

        // Event handling functions are implemented (overriden in sub-interfaces) only if events are declared in the
        // interface. Otherwise, calling one of these methods is simply ignored.
        $addListeners : function () {},
        $removeListeners : function () {},
        $unregisterListeners : function () {},
        $on : function () {},

        // Function to automatically show the classpath of the interface (useful when debugging with Firebug):
        toString : function () {
            return "[" + this.$classpath + "]";
        }
    };

    /**
     * Base constructor for interface wrappers.
     * @private
     */
    var __superInterfaceConstructor = function () {};
    __superInterfaceConstructor.prototype = __superInterfacePrototype;

    /*
     * Test whether the __proto__ property is supported, and depending on the result, choose the right implementation of
     * interface wrapper links.
     */
    var __testProtoParent = {
        protoProperty : true
    };
    var __testProtoChild = {};
    __testProtoChild.__proto__ = __testProtoParent;
    var __linkItfWrappers = (__testProtoChild.protoProperty) ? function (pointFrom, pointTo) {
        // pointFrom becomes transparent: set its prototype to be pointTo and remove all properties
        pointFrom.__proto__ = pointTo;
        for (var i in pointFrom) {
            if (pointFrom.hasOwnProperty(i)) {
                delete pointFrom[i];
            }
        }
    } : function (pointFrom, pointTo) {
        // browser does not have __proto__
        // we manually have to implement the same
        var pointFromLinkItfWrappers = pointFrom.__$linkItfWrappers;
        if (pointFromLinkItfWrappers && pointFrom.hasOwnProperty("__$linkItfWrappers")) {
            for (var i = 0, l = pointFromLinkItfWrappers.length; i < l; i++) {
                // make each object directly point to the last object
                __linkItfWrappers.call(this, pointFromLinkItfWrappers[i], pointTo);
            }
        }

        // copy the whole object
        for (var i in pointFrom) {
            if (pointFrom.hasOwnProperty(i)) {
                delete pointFrom[i];
            }
            // if the property is still there (inherited from the parent), override it to be equal to the
            // corresponding property in pointTo:
            if (i in pointFrom) {
                // it is on purpose that there is no hasOwnProperty here, we want to copy
                // the whole prototype
                pointFrom[i] = pointTo[i];
            }
        }
        for (var i in pointTo) {
            // it is on purpose that there is no hasOwnProperty here, we want to copy
            // the whole prototype
            pointFrom[i] = pointTo[i];
        }

        delete pointFrom.__$linkItfWrappers;

        // save inside pointTo that pointFrom is a link to it
        if (!pointTo.hasOwnProperty("__$linkItfWrappers")) {
            pointTo.__$linkItfWrappers = [pointFrom];
        } else {
            pointTo.__$linkItfWrappers.push(pointFrom);
        }
    };
    __testProtoParent = null;
    __testProtoChild = null;

    /**
     * Singleton in charge of interface-related operations. It contains internal methods of the framework which should
     * not be called directly by the application developer.
     * @private
     */
    Aria.classDefinition({
        $classpath : "aria.core.Interfaces",
        $singleton : true,
        $statics : {
            // ERROR MESSAGES:
            INVALID_INTERFACE_MEMBER : "The '%1' interface has a '%2' member, which does not respect the constraints on interface member names. This member will be ignored.",
            INVALID_INTERFACE_MEMBER_DEF : "Invalid definition for the '%2' member on the '%1' interface. This member will be ignored.",
            BASE_INTERFACE_UNDEFINED : "Super interface for %1 is undefined (%2)",
            WRONG_BASE_INTERFACE : "Super interface for %1 is not properly defined: base interfaces (%2) must be defined through Aria.interfaceDefinition.",
            METHOD_NOT_IMPLEMENTED : "Class '%1' has no implementation of method '%2', required by interface '%3'.",
            WRONG_INTERFACE : "Interface '%1' declared in the $implements section of class '%2' was not properly defined through Aria.interfaceDefinition."
        },
        $prototype : {
            /**
             * Utility function which generates a key that does not exist in the given object.
             * @param {Object} instances Object for which a non-existent key must be generated.
             * @return {String|Number} key which does not exist in instances.
             */
            generateKey : __generateKey,

            /**
             * Links an object to an interface wrapper. Transform the pointFrom object so that calling methods on it is
             * equivalent to calling methods on pointTo. Note that it is possible to call linkItfWrappers in chain, and
             * links are preserved, for example:
             *
             * <pre>
             * linkItfWrappers(objA, objB); // this changes objA to be like objB
             * linkItfWrappers(objB, objC); // this changes both objB and objA so that they are like objC
             * linkItfWrappers(objC, objD); // this changes objC, objB and objA so that they are like objD
             * </pre>
             *
             * It is implemented by changing the __proto__ property on browsers that support it. Otherwise, it is
             * implemented by copying the prototype and keeping a link on the pointFrom object in pointTo.
             * @param {Object} pointFrom object that will be modified to look like pointTo
             * @param {Object} pointTo interface wrapper
             */
            linkItfWrappers : __linkItfWrappers,

            /**
             * Load an interface after its dependencies have been loaded. This method is intended to be called only from
             * Aria.interfaceDefinition. Use Aria.interfaceDefinition to declare an interface.
             * @param {Object} def definition of the interface
             */
            loadInterface : function (def) {
                var classpath = def.$classpath;
                // Initialize the prototype
                var proto; // prototype being created
                var superInterface = null;
                if (def.$extends) {
                    // the prototype must be created from the super interface
                    superInterface = Aria.getClassRef(def.$extends);
                    if (!superInterface) {
                        this.$logError(this.BASE_INTERFACE_UNDEFINED, [classpath, def.$extends]);
                        __clsMgr.notifyClassLoadError(classpath);
                        return;
                    }
                    var parentCstr = superInterface ? superInterface.interfaceDefinition : null;
                    parentCstr = parentCstr ? parentCstr.$noargConstructor : null;
                    if (!parentCstr) {
                        this.$logError(this.WRONG_BASE_INTERFACE, [classpath, def.$extends]);
                        __clsMgr.notifyClassLoadError(classpath);
                        return;
                    }
                    proto = new parentCstr();
                    proto.$interfaces = __copyMap(superInterface.prototype.$interfaces);
                } else {
                    proto = new __superInterfaceConstructor();
                    proto.$interfaces = {};
                }
                proto.$classpath = classpath; // classpath of the interface
                var keyProperty = "__iid" + __getNextCpt();
                // Look into the members of the interface, and divide them into functions or properties
                var itf = def.$interface;
                var methods = []; // builds the string containing the methods of the interface
                var initProperties = []; // builds the string to initialize properties of the interface (objects and
                // arrays)
                var deleteProperties = []; // builds the string to delete properties of the interface (in $destructor)
                for (var member in itf) {
                    if (itf.hasOwnProperty(member)) {
                        if (!Aria.checkJsVarName(member) || __superInterfacePrototype[member]) {
                            this.$logError(this.INVALID_INTERFACE_MEMBER, [classpath, member]);
                            // remove and ignore that member:
                            itf[member] = null;
                            delete itf[member];
                            continue;
                        }
                        var memberValue = __normalizeMember.call(this, itf[member], classpath, member);
                        itf[member] = memberValue;
                        if (memberValue != null) {
                            if (memberValue.$type == "Function") {
                                var asyncParam = memberValue.$callbackParam;
                                if (asyncParam == null) {
                                    asyncParam = "null";
                                }
                                methods.push("p.", member, "=function(){\nreturn i[this.", keyProperty, "].$call('", classpath, "','", member, "',arguments,", asyncParam, ");\n}\n");
                            } else if (memberValue.$type == "Interface") {
                                initProperties.push("this.", member, "=obj.", member, "?obj.", member, ".$interface('", memberValue.$classpath, "'):null;\n");
                                deleteProperties.push("this.", member, "=null;\n");
                            } else if (memberValue.$type == "Object") {
                                initProperties.push("this.", member, "=obj.", member, ";\n");
                                deleteProperties.push("this.", member, "=null;\n");
                            }
                        } else {
                            this.$logError(this.INVALID_INTERFACE_MEMBER_DEF, [classpath, member]);
                            delete itf[member];
                        }
                    }
                }
                // management of events
                // events in the prototype of the interface
                proto.$events = {};
                var parentEvents = false;
                if (superInterface) {
                    parentEvents = __mergeEvents(proto.$events, superInterface.prototype.$events, classpath);
                } else {
                    methods.push("p.$interface=function(a){\nreturn aria.core.Interfaces.getInterface(i[this.", keyProperty, "],a,this);\n};\n");
                }
                if (__mergeEvents(proto.$events, def.$events, classpath) && !parentEvents) {
                    // The parent interface has no event but this interface has events!
                    // We have to add special wrappers for event handling
                    methods.push("p.$addListeners=function(a){\nreturn i[this.", keyProperty, "].$addListeners(a,this);\n};\n");
                    methods.push("p.$onOnce=function(a){\nreturn i[this.", keyProperty, "].$onOnce(a,this);\n};\n");
                    methods.push("p.$removeListeners=function(a){\nreturn i[this.", keyProperty, "].$removeListeners(a,this);\n};\n");
                    methods.push("p.$unregisterListeners=function(a){\nreturn i[this.", keyProperty, "].$unregisterListeners(a,this);\n};\n");
                    methods.push("p.$on=p.$addListeners;\n");
                }
                methods.push("p.$destructor=function(){\n", deleteProperties.join(''), "i[this.", keyProperty, "]=null;\ndelete i[this.", keyProperty, "];\nthis.", keyProperty, "=null;\n", superInterface
                        ? "e.prototype.$destructor.call(this);\n" /* call super interface at the end of the destructor */
                        : "", "};\n");
                var out = [];
                var evalContext = {
                    g : __generateKey,
                    p : proto, // prototype
                    c : null, // constructor (will be set by the evaluated code)
                    e : superInterface
                };
                Aria.nspace(classpath, true);
                out.push("var i={};\nvar evalContext=arguments[2];\nvar g=evalContext.g;\nvar p=evalContext.p;\nvar e=evalContext.e;\nevalContext.c=function(obj){\n", (superInterface
                        ? 'e.call(this,obj);\n'
                        : ''), 'var k=g(i);\ni[k]=obj;\nthis.', keyProperty, '=k;\n', initProperties.join(''), '};\n', methods.join(''), 'Aria.$global.', classpath, '=evalContext.c;\n', 'p=null;\nevalContext=null;\n');
                out = out.join('');
                // alert(out);
                Aria["eval"](out, classpath.replace(/\./g, "/") + "-wrapper.js", evalContext);
                var constructor = evalContext.c;
                proto.$interfaces[classpath] = constructor;
                constructor.prototype = proto;
                constructor.interfaceDefinition = def;
                constructor.superInterface = superInterface;
                def.$noargConstructor = new Function();
                def.$noargConstructor.prototype = proto;
                Aria.$classes.push(constructor);
                __clsMgr.notifyClassLoad(classpath);
            },

            /**
             * This method is intended to be called only from Aria.loadClass for each interface declared in $implements.
             * @param {String} interfaceClasspath Classpath of the interface to apply to the class definition. This
             * interface must already be completely loaded.
             * @param {Object} classPrototype Prototype of the class being loaded.
             * @return {Boolean} false if a fatal error occured, true otherwise
             */
            applyInterface : function (interfaceClasspath, classPrototype) {
                var interfaces = classPrototype.$interfaces;
                if (interfaces && interfaces[interfaceClasspath]) {
                    // the interface was already applied
                    return true;
                }
                var itf = Aria.getClassRef(interfaceClasspath);
                if (!itf.interfaceDefinition) {
                    this.$logError(this.WRONG_INTERFACE, [interfaceClasspath, classPrototype.$classpath]);
                    return false;
                }
                if (itf.superInterface) {
                    // apply the parent interface before this interface
                    if (!this.applyInterface(itf.interfaceDefinition.$extends, classPrototype)) {
                        return false;
                    }
                    // by calling this function, interfaces may have changed, update the variable:
                    interfaces = classPrototype.$interfaces;
                }
                if (!classPrototype.hasOwnProperty("$interfaces")) {
                    // copies the parent map of interfaces before adding this one
                    interfaces = __copyMap(interfaces);
                    classPrototype.$interfaces = interfaces;
                }
                // set on the prototype that the interface is supported:
                interfaces[interfaceClasspath] = itf;
                // copies the events:
                __mergeEvents(classPrototype.$events, itf.interfaceDefinition.$events, classPrototype.$classpath);
                // check that methods of the interface are correctly implemented in the class prototype:
                var itfMembers = itf.interfaceDefinition.$interface;
                for (var member in itfMembers) {
                    if (itfMembers.hasOwnProperty(member) && itfMembers[member].$type == "Function"
                            && !typeUtils.isFunction(classPrototype[member])) {
                        this.$logError(this.METHOD_NOT_IMPLEMENTED, [classPrototype.$classpath, member,
                                interfaceClasspath]);
                        return false;
                    }
                }
                return true;
            },

            /**
             * This method is intended to be called only from $interface (either in aria.core.JsObject or in interface
             * wrappers) Use the $interface method instead of this method. This method retrieves a wrapper object on the
             * given object which only contains the methods and properties defined in the interface.
             * @param {aria.core.JsObject} object Object on which an interface wrapper should be returned.
             * @param {String|Function} itf Classpath of the interface, or constructor of the interface whose wrapper is
             * requested.
             * @param {Object} object Interface wrapper from which the $interface method is called, or null if the
             * method is called from the whole object.
             * @return {Object} interface wrapper on the given object or null if an error occurred. In this case, the
             * error is logged. Especially an error can occur if the object does not support the interface.
             */
            getInterface : function (object, itf, itfWrapper) {
                var classpath;
                var itfConstructor;
                if (typeUtils.isFunction(itf)) {
                    // interface given by its constructor
                    itfConstructor = itf;
                    classpath = itf.interfaceDefinition.$classpath;
                } else if (typeUtils.isString(itf)) {
                    // interface given by its classpath (constructor retrieved later if needed)
                    classpath = itf;
                }
                var interfaces = object.__$interfaces;
                var res;
                // first check if the interface is supported by the interface wrapper, if any:
                if (itfWrapper != null && !itfWrapper.$interfaces[classpath]) {
                    this.$logError(this.INTERFACE_NOT_SUPPORTED, [classpath, itfWrapper.$classpath]);
                    return null;
                }
                // first check if an instance of the interface already exists
                if (interfaces) {
                    res = interfaces[classpath];
                    if (res) {
                        return res;
                    }
                }
                // check if the interface is supported:
                if (!object.$interfaces[classpath]) {
                    this.$logError(this.INTERFACE_NOT_SUPPORTED, [classpath, object.$classpath]);
                    return null;
                }
                if (!itfConstructor) {
                    itfConstructor = Aria.getClassRef(classpath);
                    if (!itfConstructor) {
                        // error is already logged in Aria.getClassRef
                        return null;
                    }
                }
                if (!interfaces) {
                    interfaces = {};
                    object.__$interfaces = interfaces;
                }
                res = new itfConstructor(object);
                interfaces[classpath] = res;
                return res;
            },

            /**
             * This method is intended to be called only from aria.core.JsObject.$dispose. It disposes all the interface
             * wrapper instances created on the given object through getInterface.
             * @param {aria.core.JsObject} object object whose interfaces must be disposed of.
             */
            disposeInterfaces : function (object) {
                // dispose all the interfaces of the given object
                var interfaces = object.__$interfaces;
                if (!interfaces) {
                    // no interface to destroy
                    return;
                }
                for (var i in interfaces) {
                    if (interfaces.hasOwnProperty(i) && interfaces[i].$destructor) {
                        interfaces[i].$destructor();
                        interfaces[i] = null;
                    }
                }
                object.__$interfaces = null;
            }
        }
    });
})();
/**
 * Interface exposed from the IO to the application. It is used by IO when using a transport.
 */
Aria.interfaceDefinition({
    $classpath : "aria.core.transport.ITransports",
    $interface : {
        /**
         * Initialization function.
         * @param {String} reqId request Id.
         */
        init : function (reqId) {},

        /**
         * Perform a request.
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request Request object
         * @param {aria.core.CfgBeans:Callback} callback This callback is generated by IO so it's already normalized
         * @throws
         */
        request : function (request, callback) {}
    }
});/**
 * Transport class for XHR requests. This is the base implementation and is shared between all transports that use
 * XMLHttpRequest
 */
Aria.classDefinition({
    $classpath : "aria.core.transport.BaseXHR",
    $implements : ["aria.core.transport.ITransports"],
    $prototype : {
        /**
         * Polling interval for the handle ready state in milliseconds.
         * @type Number
         * @protected
         */
        _pollingInterval : 50,

        /**
         * Tells if the transport object is ready or requires an initialization phase
         * @type Boolean
         */
        isReady : true,

        /**
         * Initialization function. Not needed because this transport is ready at creation time
         */
        init : Aria.empty,

        /**
         * Perform a request.
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request Request object
         * @param {aria.core.CfgBeans:Callback} callback This callback is generated by IO so it's already normalized
         * @throws
         */
        request : function (request, callback) {
            var connection = this._getConnection();

            connection.open(request.method, request.url, true);

            for (var header in request.headers) {
                if (request.headers.hasOwnProperty(header)) {
                    connection.setRequestHeader(header, request.headers[header]);
                }
            }

            // Timer for aborting the request after a timeout
            aria.core.IO.setTimeout(request.id, request.timeout, {
                fn : this.onAbort,
                scope : this,
                args : [request.id, connection]
            });

            this._handleReadyState(request.id, connection, callback);

            // This might throw an error, propagate it and let the IO know that there was an exception
            connection.send(request.data || null);
        },

        /**
         * Get a connection object.
         * @return {Object} connection object
         * @protected
         */
        _getConnection : function () {
            return this._standardXHR() || this._activeX();
        },

        /**
         * Get a standard XMLHttpRequest connection object
         * @return {XMLHttpRequest} connection object
         * @protected
         */
        _standardXHR : function () {
            try {
                var XMLHttpRequest = Aria.$global.XMLHttpRequest;
                return new XMLHttpRequest();
            } catch (ex) {}
        },

        /**
         * Get an ActiveXObject connection object
         * @return {ActiveXObject} connection object
         * @protected
         */
        _activeX : function () {
            try {
                var ActiveXObject = Aria.$global.ActiveXObject;
                return new ActiveXObject("Microsoft.XMLHTTP");
            } catch (ex) {}
        },

        /**
         * A timer that polls the XHR object's readyState property during a transaction, instead of binding a callback
         * to the onreadystatechange event. Upon readyState 4, handleTransactionResponse will process the response, and
         * the timer will be cleared.
         * @param {Number} reqId Requst identifier
         * @param {Object} connection The connection object (XHR or ActiveX)
         * @param {aria.core.CfgBeans:Callback} callback Callback from aria.core.IO
         * @private
         */
        _handleReadyState : function (reqId, connection, callback) {
            var ariaIO = aria.core.IO;

            // Interval for processing the response from the server
            var scope = this;
            ariaIO._poll[reqId] = setInterval(function () {
                if (connection && connection.readyState === 4) {
                    aria.core.IO.clearTimeout(reqId);

                    clearInterval(ariaIO._poll[reqId]);
                    delete ariaIO._poll[reqId];

                    scope._handleTransactionResponse(reqId, connection, callback);
                }
            }, this._pollingInterval);
        },

        /**
         * Attempts to interpret the server response and determine whether the transaction was successful, or if an
         * error or exception was encountered.
         * @private
         * @param {Number} reqId Requst identifier
         * @param {Object} connection The connection object (XHR or ActiveX)
         * @param {aria.core.CfgBeans:Callback} callback Callback from aria.core.IO
         */
        _handleTransactionResponse : function (reqId, connection, callback) {
            var httpStatus, responseObject;

            try {
                var connectionStatus = connection.status;
                if (connectionStatus) {
                    httpStatus = connectionStatus || 200;
                } else if (!connectionStatus && connection.responseText) {
                    // Local requests done with ActiveX have undefined state
                    // consider it successfull if it has a response text
                    httpStatus = 200;
                } else if (connectionStatus == 1223) {
                    // Sometimes IE returns 1223 instead of 204
                    httpStatus = 204;
                } else {
                    httpStatus = 13030;
                }
            } catch (e) {
                // 13030 is a custom code to indicate the condition -- in Mozilla/FF --
                // when the XHR object's status and statusText properties are
                // unavailable, and a query attempt throws an exception.
                httpStatus = 13030;
            }

            var error = false;
            if (httpStatus >= 200 && httpStatus < 300) {
                responseObject = this._createResponse(connection);
            } else {
                responseObject = {
                    error : [httpStatus, connection.statusText].join(" "),
                    responseText : connection.responseText,
                    responseXML : connection.responseXML
                };

                error = true;
            }

            responseObject.status = httpStatus;

            callback.fn.call(callback.scope, error, callback.args, responseObject);

            connection = null;
            responseObject = null;
        },

        /**
         * Generate a valid server response.
         * @protected
         * @param {Object} connection Connection status
         * @return {aria.core.CfgBeans:IOAsyncRequestResponseCfg}
         */
        _createResponse : function (connection) {
            var headerStr = connection.getAllResponseHeaders(), headers = {};

            if (headerStr) {
                var headerLines = headerStr.split("\n");
                for (var i = 0; i < headerLines.length; i++) {
                    var delimitPos = headerLines[i].indexOf(":");
                    if (delimitPos != -1) {
                        // Trime headers
                        headers[headerLines[i].substring(0, delimitPos)] = headerLines[i].substring(delimitPos + 2).replace(/^\s+|\s+$/g, "");
                    }
                }
            }

            var response = {
                statusText : (connection.status == 1223) ? "No Content" : connection.statusText,
                getResponseHeader : headers,
                getAllResponseHeaders : headerLines,
                responseText : connection.responseText,
                responseXML : connection.responseXML
            };

            return response;
        },

        /**
         * Abort method. Called after the request timeout
         * @param {Number} reqId Request identifier
         * @param {Object} connection
         * @return {Boolean} Whether the connection was aborted or not
         */
        onAbort : function (reqId, connection) {
            clearInterval(aria.core.IO._poll[reqId]);
            delete aria.core.IO._poll[reqId];

            if (this._inProgress(connection)) {
                connection.abort();
                return true;
            } // else the request completed but after the abort timeout (it happens in IE)

            return false;
        },

        /**
         * Determines if the transaction is still being processed by checking the readyState of the connection
         * @param {Object} connection Connection object
         * @return {Boolean}
         * @private
         */
        _inProgress : function (connection) {
            return connection.readyState !== 4 && connection.readyState !== 0;
        }
    }
});/**
 * Transport class for XHR requests.
 * @singleton
 */
Aria.classDefinition({
    $classpath : "aria.core.transport.XHR",
    $extends : "aria.core.transport.BaseXHR",
    $singleton : true
});/**
 * Transport class for XDR requests.
 * @singleton
 */
Aria.classDefinition({
    $classpath : "aria.core.transport.XDR",
    $singleton : true,
    $constructor : function () {
        /**
         * Tells if the transport object is ready or requires an initialization phase
         * @type Boolean
         */
        this.isReady = false;

        /**
         * Flash transport object
         * @type HTMLElement
         * @protected
         */
        this._transport = null;

        /**
         * Element container for Flash transport object
         * @type HTMLElement
         * @protected
         */
        this._transportContainer = null;

        /**
         * Map of pending requests to be reissued once the transport is ready. Key is the request id, value is the swf
         * timeout
         * @type Object
         * @protected
         */
        this._pending = {};

        /**
         * Map of ongoing xdr requests. Filled by the XDR transport, not the best design but it's needed by
         * handleXdrResponse, a public method accessed by Flash
         * @type Object
         */
        this.xdrRequests = {};

        /**
         * Number of XDR requests.
         * @type Number
         */
        this.nbXdrRequests = 0;

        /**
         * Timeout after which the transport initialization is considered as failed.
         * @type Number
         */
        this.swfTimeout = 60000;
    },
    $destructor : function () {
        if (this._transportContainer) {
            this._transport = null;
            this._transportContainer.parentNode.removeChild(this._transportContainer);
            this._transportContainer = null;
        }
    },
    $statics : {
        // ERROR MESSAGE:
        IO_MISSING_FLASH_PLUGIN : "Flash player 9+ is required to execute Cross Domain Requests (XDR).",
        LOAD_PLUGIN : "Unable to load flash plugin."
    },
    $prototype : {
        /**
         * Inizialization function.
         * @param {String} reqId Request identifier
         * @param {aria.core.CfgBeans:Callback} callback This callback is generated by IO so it's already normalized
         */
        init : function (reqId, callback) {
            // PROFILING // this.$stopMeasure(req.profilingId);

            // Check if Flash plugin is available
            var navigator = Aria.$global.navigator;
            if (navigator.plugins && navigator.plugins.length > 0) {
                var mime = navigator.mimeTypes, type = "application/x-shockwave-flash";
                if (!mime || !mime[type] || !mime[type].enabledPlugin) {
                    return this.$logError(this.IO_MISSING_FLASH_PLUGIN);
                }
            } else if (navigator.appVersion.indexOf("Mac") == -1 && Aria.$frameworkWindow.execScript) {
                try {
                    var ActiveXObject = Aria.$global.ActiveXObject;
                    var obj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");

                    if (obj.activeXError) {
                        throw "ActiveXError";
                    }
                } catch (er) {
                    return this.$logError(this.IO_MISSING_FLASH_PLUGIN);
                }
            }

            // We're not ready, wait for the ready event to reissue the request, but cancel this request on timeout
            this._pending[reqId] = aria.core.Timer.addCallback({
                fn : this._swfTimeout,
                scope : this,
                args : {
                    reqId : reqId,
                    cb : callback
                },
                delay : this.swfTimeout
            });

            if (!this._transport) {
                var swfUri = aria.core.DownloadMgr.resolveURL('aria/resources/handlers/IO.swf');
                // note that the flash transport does not work with Safari if the following line is present in
                // parameters:
                // '<param name="wmode" value="transparent"/>'
                var obj = [
                        '<object id="xATIOSwf" type="application/x-shockwave-flash" data="',
                        swfUri,
                        '" width="1" height="1">',
                        '<param name="movie" value="' + swfUri + '" />',
                        '<param name="allowScriptAccess" value="always" />',
                        '<param name="FlashVars" value="readyCallback=' + this.$classpath + '.onXdrReady&handler='
                                + this.$classpath + '.handleXdrResponse" />', '</object>'].join("");

                var document = Aria.$frameworkWindow.document;
                var container = document.createElement('div');
                container.style.cssText = "position:fixed;top:-12000px;left:-12000px";
                document.body.appendChild(container);
                container.innerHTML = obj;

                this._transport = document.getElementById("xATIOSwf");
                this._transportContainer = container;
            }
        },

        /**
         * Callback called by flash transport once initialized, causes a reissue of the requests that were queued while
         * the transport was initializing
         */
        onXdrReady : function () {
            this.isReady = true;

            for (var id in this._pending) {
                if (this._pending.hasOwnProperty(id)) {
                    aria.core.Timer.cancelCallback(this._pending[id]);
                    aria.core.IO.reissue(id);
                }
            }
            this._pending = {};
        },

        /**
         * Timeout called when flash transport initialized fails, causes an abort of the request.
         * @protected
         * @param {Object} args Object containing request and callback objects
         */
        _swfTimeout : function (args) {
            var reqId = args.reqId;
            var callback = args.cb;

            delete this._pending[reqId];

            var response = {
                error : this.LOAD_PLUGIN,
                status : 0
            };

            callback.fn.call(callback.scope, true, callback.args, response);
        },

        /**
         * Perform a request.
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request Request object
         * @param {aria.core.CfgBeans:Callback} callback Internal callback description
         * @throws
         */
        request : function (request, callback) {
            this.nbXdrRequests += 1;

            this.xdrRequests[request.id] = {
                callback : callback,
                transaction : request.id
            };

            var args = {
                xdr : true,
                method : request.method,
                data : request.data
            };

            // This might throw an error, propagate it and let the IO know that there was an exception
            this._transport.send(request.url, args, request.id);
        },

        /**
         * Initial response handler for XDR transactions. The Flash transport calls this function and sends the response
         * payload. This method is called twice per request, first with a xdr:start and then with a xdr:success or
         * xdr:fail
         * @param {Object} res The response object sent from the Flash transport.
         */
        handleXdrResponse : function (res) {
            var reqId = res.tId;
            var conf = this.xdrRequests[reqId];

            var xhrObject = this._transport, callback = conf.callback;

            if (res.statusText === "xdr:start") {
                return this._xdrStart(xhrObject, callback);
            } else {
                // Delete the request only if we're not in xdr:start
                delete this.xdrRequests[reqId];
            }

            res.responseText = decodeURI(res.responseText);
            res.reqId = reqId;

            this._handleTransactionResponse(reqId, res, callback);
        },

        /**
         * Raises the global and transaction start events.
         * @protected
         * @param {Object} connection The transaction object.
         */
        _xdrStart : function (connection) {
            if (connection) {
                // raise global custom event -- startEvent
                aria.core.IO.$raiseEvent({
                    name : "startEvent",
                    o : connection
                });

                if (connection.startEvent) {
                    // raise transaction custom event -- startEvent
                    aria.core.IO.$raiseEvent({
                        name : connection.startEvent,
                        o : connection
                    });
                }
            }
        },

        /**
         * Attempts to interpret the flash response and determine whether the transaction was successful, or if an error
         * or exception was encountered.
         * @private
         * @param {Number} reqId Requst identifier
         * @param {Object} connection The connection object (XHR or ActiveX)
         * @param {aria.core.CfgBeans:Callback} callback Callback from aria.core.IO
         */
        _handleTransactionResponse : function (reqId, connection, callback) {
            var success = connection && connection.statusText === "xdr:success";

            if (success) {
                connection.status = 200;
            } else {
                connection.status = 0;
            }

            callback.fn.call(callback.scope, !success, callback.args, connection);
        }
    }
});
/**
 * Transport class for JSON-P requests.
 * @singleton
 */
Aria.classDefinition({
    $classpath : "aria.core.transport.JsonP",
    $singleton : true,
    $constructor : function () {
        /**
         * Tells if the transport object is ready or requires an initialization phase
         * @type Boolean
         */
        this.isReady = true;

        /**
         * Html Head. Script tags will be injected in here. This variable is initialized on first use rather than in the
         * constructor so that there is no error in case Aria Templates is loaded in a non-browser environment (Rhino or
         * Node.js)
         * @type HTMLElement
         * @protected
         */
        this._head = null;
    },
    $destructor : function () {
        this._head = null;
    },
    $prototype : {

        /**
         * Initialize the reference to the element that will hold script tags to be created.
         * @return {HTMLElement}
         */
        _initHead : function () {
            var document = Aria.$frameworkWindow.document;
            this._head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
            return this._head;
        },

        /**
         * Inizialization function. Not needed because this transport is ready at creation time
         */
        init : Aria.empty,

        /**
         * Perform a request.
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request
         * @param {aria.core.CfgBeans:Callback} callback
         * @throws
         */
        request : function (request, callback) {
            var head = this._head || this._initHead();
            var reqId = request.id;
            var insertScript = function () {
                var script = Aria.$frameworkWindow.document.createElement("script");
                script.src = request.url;
                script.id = "xJsonP" + reqId;
                script.async = "async";
                script.type = "text/javascript";

                script.onload = script.onreadystatechange = function (event, isAbort) {
                    if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
                        // Memory leak
                        script.onload = script.onreadystatechange = null;

                        // Remove the script
                        if (script.parentNode) {
                            head.removeChild(script);
                        }

                        script = undefined;
                        head = undefined;
                    }
                };

                head.appendChild(script);
            };

            // Generate a callback in this namespace
            var serverCallback = "_jsonp" + reqId;
            this[serverCallback] = function (json) {
                this._onJsonPLoad(request, callback, json);
            };
            request.url += (/\?/.test(request.url) ? "&" : "?") + request.jsonp + "=aria.core.transport.JsonP."
                    + serverCallback;
            request.evalCb = serverCallback;

            // handle abort timeout
            aria.core.IO.setTimeout(reqId, request.timeout, {
                fn : aria.core.IO.abort,
                scope : aria.core.IO,
                args : [reqId, callback]
            });

            // This makes sure the the request is asynchronous also in IE, that in some cases (local requests)
            // will block the normal execution while loading the script synchronously
            setTimeout(insertScript, 10);
        },

        /**
         * Callback of the JSON-P request.
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request Request object
         * @param {aria.core.CfgBeans:Callback} callback
         * @param {Object} json Json response coming from the server
         * @protected
         */
        _onJsonPLoad : function (request, callback, json) {
            // var reqId = request.id;

            delete this[request.evalCb];

            var response = {
                status : 200,
                responseJSON : json,
                responseText : ""
            };

            callback.fn.call(callback.scope, false, callback.args, response);
        }
    }
});
/**
 * Transport class for Local requests. It's a XHR transport but redefines some methods to work with file:// protocol.
 * @singleton
 */
Aria.classDefinition({
    $classpath : "aria.core.transport.Local",
    $singleton : true,
    $extends : "aria.core.transport.BaseXHR",
    $prototype : {
        /**
         * Perform a request.
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request Request object
         * @param {aria.core.CfgBeans:Callback} callback
         * @throws
         */
        request : function (request, callback) {
            if (aria.core.Browser.isOpera) {
                // Opera doesn't work with file protocol but the iFrameHack seems to work
                return this._iFrameHack(request, callback);
            }

            this.$BaseXHR.request.call(this, request, callback);
        },

        /**
         * Use an iFrame to load the content of a request. This raises a security error on most of the browsers except
         * Opera (desktop and mobile). It's ugly but it works.
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request Request object
         * @param {aria.core.CfgBeans:Callback} callback Internal callback description
         */
        _iFrameHack : function (request, callback) {

            var document = Aria.$frameworkWindow.document;
            var iFrame = document.createElement("iframe");
            iFrame.src = request.url;
            iFrame.id = "xIFrame" + request.id;
            iFrame.style.cssText = "display:none";

            // Event handlers
            iFrame.onload = iFrame.onreadystatechange = function (event, isAbort) {
                if (isAbort || !iFrame.readyState || /loaded|complete/.test(iFrame.readyState)) {
                    // Memory leak
                    iFrame.onload = iFrame.onreadystatechange = null;

                    var text;
                    if (iFrame.contentDocument) {
                        text = iFrame.contentDocument.getElementsByTagName('body')[0].innerText;
                    } else if (iFrame.contentWindow) {
                        text = iFrame.contentWindow.document.getElementsByTagName('body')[0].innerText;
                    }

                    // Remove the iframe
                    if (iFrame.parentNode) {
                        document.body.removeChild(iFrame);
                    }

                    iFrame = undefined;

                    // Callback if not abort
                    var response = {
                        status : isAbort ? 0 : 200,
                        responseText : text
                    };
                    callback.fn.call(callback.scope, isAbort, callback.args, response);
                }
            };

            document.body.appendChild(iFrame);
        },

        /**
         * Get a connection object. For the local transport we prefer to get ActiveXObject because it allows to make
         * requests on IE.
         * @return {Object} connection object
         * @protected
         * @override
         */
        _getConnection : function () {
            return this._activeX() || this._standardXHR();
        }
    }
});/**
 * Transport class for IFrame.
 */
Aria.classDefinition({
    $classpath : "aria.core.transport.IFrame",
    $singleton : true,
    $statics : {
        ERROR_DURING_SUBMIT : "An error occurred while submitting the form (form.submit() raised an exception)."
    },
    $prototype : {
        /**
         * Tells if the transport object is ready or requires an initialization phase
         * @type Boolean
         */
        isReady : true,

        /**
         * Map request ids to their original requests
         * @type Object
         */
        _requests : {},

        /**
         * Initialization function. Not needed because this transport is ready at creation time
         */
        init : Aria.empty,

        /**
         * Perform a request.
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request Request object
         * @param {aria.core.CfgBeans:Callback} callback Internal callback description
         */
        request : function (request, callback) {
            this._requests[request.id] = {
                request : request,
                cb : callback
            };

            // handle timeout
            aria.core.IO.setTimeout(request.id, request.timeout, {
                fn : this.onAbort,
                scope : this,
                args : [request]
            });

            this._createIFrame(request);
            this._submitForm(request, callback);
        },

        /**
         * Creates an iFrame to load the response of the request.
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request
         * @protected
         */
        _createIFrame : function (request) {
            var iFrame;
            var browser = aria.core.Browser;
            var document = Aria.$frameworkWindow.document;

            // Issue when using document.createElement("iframe") in IE7
            if (browser.isIE7 || browser.isIE6) {
                var container = document.createElement("div");
                container.innerHTML = ['<iframe style="display:none" src="',
                        aria.core.DownloadMgr.resolveURL("aria/core/transport/iframeSource.txt"), '" id="xIFrame',
                        request.id, '" name="xIFrame', request.id, '"></iframe>'].join('');
                document.body.appendChild(container);
                iFrame = document.getElementById("xIFrame" + request.id);
                request.iFrameContainer = container;
            } else {
                iFrame = document.createElement("iframe");
                iFrame.src = aria.core.DownloadMgr.resolveURL("aria/core/transport/iframeSource.txt");
                iFrame.id = iFrame.name = "xIFrame" + request.id;
                iFrame.style.cssText = "display:none";
                document.body.appendChild(iFrame);
            }
            request.iFrame = iFrame;

            // Event handlers
            iFrame.onload = iFrame.onreadystatechange = this._iFrameReady;
        },

        /**
         * Updates the form to target the iframe then calls the forms submit method.
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request
         * @param {Object} callback Internal callback description
         * @protected
         */
        _submitForm : function (request, callback) {
            var form = request.form;
            form.target = "xIFrame" + request.id;
            form.action = request.url;
            form.method = request.method;
            if (request.headers["Content-Type"]) {
                try {
                    // in IE 8, setting form.enctype directly does not work
                    // form.setAttribute works better (check PTR 07049566)
                    form.setAttribute("enctype", request.headers["Content-Type"]);
                } catch (ex) {
                    // This might throw an exception in IE if the content type is invalid.
                }
            }
            try {
                form.submit();
            } catch (er) {
                this.$logError(this.ERROR_DURING_SUBMIT, null, er);
                this._deleteRequest(request);
                aria.core.IO._handleTransactionResponse({
                    conn : {
                        status : 0,
                        responseText : null,
                        getAllResponseHeaders : function () {}
                    },
                    transaction : request.id
                }, callback, true);
            }
        },

        /**
         * load and readystatechange event handler on the iFrame.
         * @param {DOMEvent} event
         */
        _iFrameReady : function (event) {
            // This method cannot use 'this' because the scope is not aria.core.transport.IFrame when this method is
            // called. It uses oSelf instead.
            var event = event || Aria.$frameworkWindow.event;
            var iFrame = event.target || event.srcElement;
            if (!iFrame.readyState || /loaded|complete/.test(iFrame.readyState)) {
                var reqId = /^xIFrame(\d+)$/.exec(iFrame.id)[1];
                // Make sure things are async
                setTimeout(function () {
                    aria.core.transport.IFrame._sendBackResult(reqId);
                }, 4);
            }
        },

        /**
         * Sends back the results of the request
         * @param {String} id Request id
         * @protected
         */
        _sendBackResult : function (id) {
            var description = this._requests[id];
            if (!description) {
                // The request was aborted
                return;
            }
            var request = description.request;
            var callback = description.cb;

            var iFrame = request.iFrame;
            var responseText, contentDocument = iFrame.contentDocument, contentWindow;

            if (contentDocument == null) {
                var contentWindow = iFrame.contentWindow;
                if (contentWindow) {
                    contentDocument = contentWindow.document;
                }
            }
            if (contentDocument) {
                var body = contentDocument.body || contentDocument.documentElement;
                if (body) {
                    // this is for content displayed as text:
                    responseText = body.textContent || body.outerText;
                }
                var xmlDoc = contentDocument.XMLDocument;
                // In IE, contentDocument contains a transformation of the document
                // see: http://www.aspnet-answers.com/microsoft/JScript/29847637/javascript-ie-xml.aspx
                if (xmlDoc) {
                    contentDocument = xmlDoc;
                }
            }

            this._deleteRequest(request);

            var response = {
                status : 200,
                responseText : responseText,
                responseXML : contentDocument
            };

            callback.fn.call(callback.scope, false, callback.args, response);
        },

        /**
         * Delete a request freing up memory
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request
         */
        _deleteRequest : function (request) {
            var iFrame = request.iFrame;
            if (iFrame) {
                var domEltToRemove = request.iFrameContainer || iFrame;
                domEltToRemove.parentNode.removeChild(domEltToRemove);
                // avoid leaks:
                request.iFrameContainer = null;
                request.iFrame = null;
                iFrame.onload = null;
                iFrame.onreadystatechange = null;
            }
            delete this._requests[request.id];
        },

        /**
         * Abort method. Called after the request timeout
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request
         * @return {Boolean} Whether the connection was aborted or not
         */
        onAbort : function (request) {
            this._deleteRequest(request);
            return true;
        }

    }
});(function () {
    var typeUtils = aria.utils.Type;
    var arrayUtils = aria.utils.Array;

    // Mechanism to find filters.
    /**
     * Filter found. Is an item of the _filters array.
     * @type MultiTypes
     * @private
     */
    var findFilterRes;
    /**
     * Filter to be found. Can be of any type accepted for the parameter of isFilterPresent.
     * @type Object
     * @private
     */
    var findFilterSearch;
    /**
     * Return false if the given value matches the search (and no other value matched it before), supposing
     * findFilterSearch is a classpath.
     * @param {Object} value An item in the _filters array.
     * @return {Boolean} false if the value matches the search, true otherwise
     * @private
     */
    var findByClasspath = function (value) {
        if (!findFilterRes && value.filterClasspath === findFilterSearch) {
            findFilterRes = value;
            return false;
        }
        return true;
    };
    /**
     * Return false if the given value matches the search (and no other value matched it before), supposing
     * findFilterSearch is a filter instance.
     * @param {Object} value An item in the _filters array.
     * @return {Boolean} false if the value matches the search, true otherwise
     * @private
     */
    var findByInstance = function (value) {
        if (!findFilterRes && value.obj === findFilterSearch) {
            findFilterRes = value;
            return false;
        }
        return true;
    };
    /**
     * Return false if the given value matches the search (and no other value matched it before), supposing
     * findFilterSearch is an object with the classpath and initArgs properties.
     * @param {Object} value An item in the _filters array.
     * @return {Boolean} false if the value matches the search, true otherwise
     * @private
     */
    var findByClasspathAndInitArgs = function (value) {
        if (!findFilterRes && value.filterClasspath === findFilterSearch.classpath && value.hasOwnProperty("initArgs")
                && value.initArgs === findFilterSearch.initArgs) {
            findFilterRes = value;
            return false;
        }
        return true;
    };
    /**
     * Initialize the search and return one of the findByClasspath, findByInstance or findByClasspathAndInitArgs
     * functions depending on the type of the search parameter.
     * @param {MultiTypes} search Filter to be found. Can be of any type accepted for the parameter of isFilterPresent.
     * @return {Function} either null (if the search parameter has an unexpected type), or a reference to one of the
     * findByClasspath, findByInstance or findByClasspathAndInitArgs functions.
     * @private
     */
    var getFindFilterFunction = function (search) {
        findFilterRes = null;
        findFilterSearch = search;
        if (typeUtils.isString(search)) {
            return findByClasspath;
        } else if (typeUtils.isInstanceOf(search, "aria.core.IOFilter")) {
            return findByInstance;
        } else if (typeUtils.isObject(search)) {
            return findByClasspathAndInitArgs;
        } else {
            return null;
        }
    };
    /**
     * Remove closure reference to filter search. This method should be called when getFindFilterFunction has done its
     * job.
     */
    var clean = function () {
        findFilterSearch = null;
    };

    /**
     * Manages filters for IO.
     */
    Aria.classDefinition({
        $classpath : "aria.core.IOFiltersMgr",
        $singleton : true,
        $constructor : function () {
            /**
             * Array of filter descriptors, each containing three properties: filterClasspath, initArgs and obj.
             * @type Array
             * @private
             */
            this._filters = null;

            /**
             * Number of filters which were specified by their classpath and were not yet loaded.
             * @type Number
             * @private
             */
            this._filtersToBeLoaded = 0;
        },
        $destructor : function () {
            var filters = this._filters, itm;
            if (filters) {
                for (var index = 0, l = filters.length; index < l; index++) {
                    itm = filters[index];
                    if (itm.obj) {
                        itm.obj.$dispose();
                        itm.obj = null;
                    }
                    itm.initArgs = null;
                }
                this._filters = null;
            }
        },
        $statics : {
            INVALID_PARAMETER_FOR_ADDFILTER : "Invalid parameter for addFilter.",
            INVALID_PARAMETER_FOR_ISFILTERPRESENT : "Invalid parameter for isFilterPresent.",
            INVALID_PARAMETER_FOR_REMOVEFILTER : "Invalid parameter for removeFilter.",
            FILTER_INSTANCE_ALREADY_PRESENT : "The same instance of the filter was already added to the list of filters."
        },
        $prototype : {
            /**
             * Add an IO filter.
             * @param {MultiTypes} newFilter It can be one of the following possibilities:
             * <ul>
             * <li>An instance of a filter class.</li>
             * <li>An object containing two properties: classpath and initArgs. In this case, the filter class with the
             * given classpath will be instantiated when needed. Its constructor will be called with the given initArgs
             * parameter.</li>
             * <li>The classpath of a filter class (equivalent to the previous case, but with a null initArgs
             * parameter).</li>
             * </ul>
             * Note that a filter class must extend aria.core.IOFilter. Two different instances of the same filter class
             * can be added at the same time. However, the same instance cannot be added twice (in that case, an error
             * is logged and this method returns false).
             * @return {Boolean} Return true if the filter was successfully added and false if there was an error (in
             * this case, an error is logged).
             */
            addFilter : function (newFilter) {
                var filterInfo = {};
                if (typeUtils.isString(newFilter)) {
                    filterInfo.filterClasspath = newFilter;
                    filterInfo.initArgs = null;
                    this._filtersToBeLoaded++;
                } else if (typeUtils.isInstanceOf(newFilter, "aria.core.IOFilter")) {
                    if (this.isFilterPresent(newFilter)) {
                        this.$logError(this.FILTER_INSTANCE_ALREADY_PRESENT);
                        return false;
                    }
                    filterInfo.filterClasspath = newFilter.$classpath;
                    filterInfo.obj = newFilter;
                } else if (typeUtils.isObject(newFilter)) {
                    filterInfo.filterClasspath = newFilter.classpath;
                    filterInfo.initArgs = newFilter.initArgs;
                    this._filtersToBeLoaded++;
                } else {
                    this.$logError(this.INVALID_PARAMETER_FOR_ADDFILTER);
                    return false;
                }
                if (!this._filters) {
                    this._filters = [];
                }
                this._filters[this._filters.length] = filterInfo;
                return true;
            },

            /**
             * Find if a filter is present in the list of filters.
             * @param {MultiTypes} filter It can be one of the following possibilities:
             * <ul>
             * <li>An instance of a filter class.</li>
             * <li>An object containing two properties: classpath and initArgs.</li>
             * <li>The classpath of a filter class.</li>
             * </ul>
             * @return {Boolean} return true if the filter was found, false if no filter matching the conditions was
             * found.
             */
            isFilterPresent : function (filterDef) {
                var filters = this._filters;
                // stop here if there are no filters
                if (!filters) {
                    return false;
                }
                var isWrongFilter = getFindFilterFunction(filterDef);
                if (isWrongFilter == null) {
                    this.$logError(this.INVALID_PARAMETER_FOR_ISFILTERPRESENT);
                    clean();
                    return false;
                }
                for (var i = 0, l = filters.length; i < l; i++) {
                    if (!isWrongFilter(filters[i])) {
                        clean();
                        return true;
                    }
                }
                clean();
                return false;
            },

            /**
             * Remove a filter added with addFilter, and dispose it.
             * @param {MultiTypes} oldFilter It can be one of the following possibilities:
             * <ul>
             * <li>An instance of a filter class.</li>
             * <li>An object containing two properties: classpath and initArgs.</li>
             * <li>The classpath of a filter class.</li>
             * </ul>
             * @return {Boolean} return true if a filter was removed, false if no filter matching the conditions was
             * found.
             */
            removeFilter : function (oldFilter) {
                var filters = this._filters;
                // stop here if there are no filters
                if (!filters) {
                    return false;
                }
                var selectionCallback = getFindFilterFunction(oldFilter);
                if (selectionCallback == null) {
                    this.$logError(this.INVALID_PARAMETER_FOR_REMOVEFILTER);
                    clean();
                    return false;
                }
                var newFiltersArray = arrayUtils.filter(filters, selectionCallback, this);
                clean();
                var filterToRemove = findFilterRes;
                if (filterToRemove) {
                    if (filterToRemove.obj) {
                        // already loaded, dispose it
                        filterToRemove.obj.$dispose();
                        filterToRemove.obj = null;
                    } else {
                        // not yet loaded, prevent it to be loaded
                        this._filtersToBeLoaded--;
                    }
                    filterToRemove.filterClasspath = null;
                    filterToRemove.initArgs = null;
                    if (newFiltersArray.length === 0) {
                        this._filters = null;
                    } else {
                        this._filters = newFiltersArray;
                    }
                    return true;
                }
                return false;
            },

            /**
             * Call the onRequest method on all the registered filters (and load the ones which are not yet loaded if
             * necessary, and the sender is not the FileLoader).
             * @param {aria.core.CfgBeans:IOAsyncRequestCfg} req request object
             * @param {aria.core.CfgBeans:Callback} cb callback
             */
            callFiltersOnRequest : function (req, cb) {
                this._callFilters(false, req, cb);
            },

            /**
             * Call the onResponse method on all the registered filters (and load the ones which are not yet loaded if
             * necessary, and the sender is not the FileLoader).
             * @param {aria.core.CfgBeans:IOAsyncRequestCfg} req request object
             * @param {aria.core.CfgBeans:Callback} cb callback
             */
            callFiltersOnResponse : function (req, cb) {
                this._callFilters(true, req, cb);
            },

            /**
             * If there are filters to be loaded, load them, then call all the filters.
             * @param {Boolean} isResponse
             * @param {aria.core.CfgBeans:IOAsyncRequestCfg} req request object
             * @param {aria.core.CfgBeans:Callback} cb callback
             * @private
             */
            _callFilters : function (isResponse, request, cb) {
                if (!this._filters) {
                    this.$callback(cb);
                    return;
                }
                var args = {
                    isResponse : isResponse,
                    request : request,
                    cb : cb,
                    filters : this._filters,
                    nbFilters : this._filters.length
                    // store the number of filters so that we do not call filters which were added after the call
                    // to _callFilters
                };
                if (this._filtersToBeLoaded > 0
                        && (request.sender == null || request.sender.classpath != "aria.core.FileLoader")) {
                    this._loadMissingFilters({
                        fn : this._continueCallingFilters,
                        args : args,
                        scope : this
                    });
                } else {
                    this._continueCallingFilters(null, args);
                }
            },

            /**
             * Effectively call filters in the right order.
             * @param {MultiTypes} unused
             * @param {Object} args object containing the following properties: isResponse, request, cb, filters and
             * nbFilters
             * @private
             */
            _continueCallingFilters : function (unused, args) {
                var filters = args.filters;
                var request = args.request;
                var curFilter;
                // initialize the delay
                request.delay = 0;
                if (args.isResponse) {
                    for (var i = args.nbFilters - 1; i >= 0; i--) {
                        curFilter = filters[i].obj;
                        if (curFilter) {
                            curFilter.__onResponse(request);
                        }
                    }
                } else {
                    for (var i = 0, l = args.nbFilters; i < l; i++) {
                        curFilter = filters[i].obj;
                        if (curFilter) {
                            curFilter.__onRequest(request);
                        }
                    }
                }
                if (request.delay > 0) {
                    // wait for the specified delay
                    aria.core.Timer.addCallback({
                        fn : this._afterDelay,
                        args : args,
                        scope : this,
                        delay : request.delay
                    });
                } else {
                    this._afterDelay(args);
                }
            },

            /**
             * Call the callback after the delay.
             * @param {Object} args object containing the following properties: isResponse, request, cb, filters and
             * nbFilters
             * @private
             */
            _afterDelay : function (args) {
                var request = args.request;
                delete request.delay;
                this.$callback(args.cb);
            },

            /**
             * Load the filters which were added but not yet loaded.
             * @param {aria.core.CfgBeans:Callback} cb callback to be called when the load of filters is finished
             * @private
             */
            _loadMissingFilters : function (cb) {
                var filters = this._filters;
                var curFilter;
                var classpathsToLoad = [];
                for (var i = 0, l = filters.length; i < l; i++) {
                    curFilter = filters[i];
                    if (curFilter.obj == null) {
                        classpathsToLoad.push(curFilter.filterClasspath);
                    }
                }
                Aria.load({
                    classes : classpathsToLoad,
                    oncomplete : {
                        fn : this._continueLoadingMissingFilters,
                        scope : this,
                        args : {
                            cb : cb,
                            filters : filters,
                            nbFilters : filters.length
                        }
                    }
                });
            },

            /**
             * Create instances of each filter once they are loaded.
             * @param {Object} args object containing the following properties: cb, filters, nbFilters
             * @private
             */
            _continueLoadingMissingFilters : function (args) {
                var filters = args.filters;
                for (var i = 0, l = args.nbFilters; i < l; i++) {
                    var curFilter = filters[i];
                    // not that filterClasspath can be null if the filter was removed in the meantime.
                    if (curFilter.filterClasspath != null && curFilter.obj == null) {
                        curFilter.obj = Aria.getClassInstance(curFilter.filterClasspath, curFilter.initArgs);
                        this._filtersToBeLoaded--;
                    }
                }
                this.$callback(args.cb);
            }
        }
    });
})();/**
 * Connection manager class. Provides a way to make requests for different URI (file, XHR, XDR) and keeps a list of all
 * pending requests.
 * @singleton
 */
Aria.classDefinition({
    $classpath : "aria.core.IO",
    $singleton : true,
    $events : {
        "request" : {
            description : "raised when a request is sent to the server",
            properties : {
                req : "{aria.core.CfgBeans.IOAsyncRequestCfg} Request object."
            }
        },
        "response" : {
            description : "raised when a request process is done (can be an error)",
            properties : {
                req : "{aria.core.CfgBeans.IOAsyncRequestCfg} Request object."
            }
        },
        "startEvent" : {
            description : "raised when an XDR transaction starts",
            properties : {
                o : "{Object} The connection object"
            }
        },
        "abortEvent" : {
            description : "Raised when an XDR transaction is aborted (after a timeout)",
            properties : {
                o : "[DEPRECATED]{Object} The connection object",
                req : "{aria.core.CfgBeans.IOAsyncRequestCfg} Request object that is being aborted."
            }
        }
    },
    $statics : {
        /**
         * Status code for communication errors.
         * @type Number
         */
        COMM_CODE : 0,

        /**
         * Status code for aborted requests.
         * @type Number
         */
        ABORT_CODE : -1,

        /**
         * Response text for aborted requests.
         * @type String
         */
        ABORT_ERROR : "transaction aborted",

        /**
         * Response text for timed-out requests.
         * @type String
         */
        TIMEOUT_ERROR : "timeout expired",

        // ERROR MESSAGES:
        MISSING_IO_CALLBACK : "Missing callback in IO call - Please check\nurl: %1",
        IO_CALLBACK_ERROR : "Error in IO callback handling on url: %1",
        IO_REQUEST_FAILED : "Invalid Request: \nurl: %1\nerror: %2",
        JSON_PARSING_ERROR : "Response text could not be evaluated as JSON.\nurl: %1\nresponse: %2",
        MISSING_FORM : "Missing form id or form object in asyncFormSubmit call - Please check the bean: aria.core.CfgBeans.IOAsyncRequestCfg."
    },
    $constructor : function () {
        /**
         * Map of pending requests. It maps an unique request ID to a request object (@see aria.core.IO.request)
         * @type Object
         */
        this.pendingRequests = {};

        /**
         * Number of requests. ID generator
         * @type Number
         */
        this.nbRequests = 0;

        /**
         * Number of successful requests
         * @type Number
         */
        this.nbOKResponses = 0;

        /**
         * Number of failed requests.
         * @type Number
         */
        this.nbKOResponses = 0;

        /**
         * Amount of traffic in the uplink direction. Measured as the number of characters of the POST request
         * @type Number
         */
        this.trafficUp = 0;

        /**
         * Amount of traffic in the downlink direction. Measured as the number of characters of the response text. Sum
         * of success and failures.
         * @type Number
         */
        this.trafficDown = 0;

        /**
         * Default XHR timeout in ms
         * @type Number
         */
        this.defaultTimeout = 60000;

        /**
         * Regular expression to extract the URI scheme from the URI.
         * @type RegExp
         * @protected
         */
        this._uriScheme = /^([\w\+\.\-]+:)(?:\/\/)?(.*)/;

        /**
         * Regular expression to extract the URI scheme that should be handled as a local request
         * @type RegExp
         * @protected
         */
        this._uriLocal = /^(?:file):$/;

        /* Backward Compatibility begins here */
        /**
         * Identify any request as Ajax through the header X-Requested-With.
         * @type Boolean
         */
        this.useXHRHeader = true;

        /**
         * Default value for X-Requested-With header
         * @type String
         */
        this.defaultXHRHeader = "XMLHttpRequest";
        /* Backward Compatibility ends here */

        /**
         * Map of headers sent with every request.
         * @type Object
         */
        this.headers = {
            "X-Requested-With" : "XMLHttpRequest"
        };

        /**
         * Set the header "Content-type" to a default value in case of POST requests (@see defaultPostHeader)
         * @type Boolean
         */
        /* Backward Compatibility begins here */
        this.useDefaultPostHeader = true;

        /**
         * Default value for header "Content-type". Used only for POST requests
         * @type String
         */
        this.defaultPostHeader = 'application/x-www-form-urlencoded; charset=UTF-8';

        /**
         * Set the header "Content-type" to a default value (@see defaultContentTypeHeader)
         * @type Boolean
         */
        this.useDefaultContentTypeHeader = true;

        /**
         * Default value for header "Content-type".
         * @type String
         */
        this.defaultContentTypeHeader = 'application/x-www-form-urlencoded; charset=UTF-8';
        /* Backward Compatibility ends here */

        /**
         * Map each request to the polling timeout added while handling the ready state.
         * @type Object
         * @protected
         */
        this._poll = {};

        /**
         * Map each request to the abort timeout added while handling the ready state.
         * @type Object
         * @protected
         */
        this._timeOut = {};

        /**
         * Contains the transport to be used for same domain requests.
         * @type String class name and path.
         * @private
         */
        this.__sameDomain = "aria.core.transport.XHR";

        /**
         * Contains the transport to be used for cross domain requests.
         * @type String class name and path.
         * @private
         */
        this.__crossDomain = "aria.core.transport.XDR";

        /**
         * Contains the transport to be used for JsonP requests.
         * @type String class name and path.
         * @private
         */
        this.__jsonp = "aria.core.transport.JsonP";

        /**
         * Contains the transport to be used for local file requests.
         * @type String class name and path.
         * @private
         */
        this.__local = "aria.core.transport.Local";

        /**
         * Contains the transport to be used for IFrame requests.
         * @type String class name and path.
         * @private
         */
        this.__iframe = "aria.core.transport.IFrame";

        /**
         * Default Json serializer used to serialize response texts into json
         * @type aria.utils.json.JsonSerializer
         * @private
         */
        this.__serializer = new aria.utils.json.JsonSerializer();
    },

    $destructor : function () {
        // Clear any pending timeout
        var timeout;
        for (timeout in this._poll) {
            if (this._poll.hasOwnProperty(timeout)) {
                clearInterval(this._poll[timeout]);
            }
        }
        for (timeout in this._timeOut) {
            if (this._timeOut.hasOwnProperty(timeout)) {
                clearInterval(this._timeOut[timeout]);
            }
        }
        if (this.__serializer) {
            this.__serializer.$dispose();
            this.__serializer = null;
        }

        this._poll = null;
        this._timeOut = null;
    },
    $prototype : {
        /**
         * Perform an asynchronous request to the server <br />
         * Note: callback is always called in an asynchronous way (even in case of errors)
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} req the request description
         *
         * <pre>
         * [req] {
         *    url: 'myfile.txt',     // absolute or relative URL
         *    method: 'POST',        // POST, PUT, DELETE, OPTIONS, HEAD, TRACE, OPTIONS, CONNECT, PATCH or GET (default)
         *    data: '',              // {String} null by default
         *    contentTypeHeader:'',  // {String} application/x-www-form-urlencoded; charset=UTF-8 by default
         *    timeout: 1000,         // {Integer} timeout in ms - default: defaultTimeout
         *    callback: {
         *      fn: obj.method,        // mandatory
         *      scope: obj,            // mandatory
         *      onerror: obj2.method2  // callback error handler - optional
         *      onerrorScope: obj2     // optional
         *      args: {x:123}          // optional - default: null
         *    }
         * }
         * When a response is received, the callback function is called with the following arguments:
         * <code>
         * cb(asyncRes, cbArgs)
         * </code>
         * where:
         * the structure of asyncRes is described in aria.core.CfgBeans.IOAsyncRequestResponseCfg
         * [asyncRes] {
         *    url: '',
         *    status: '',
         *    responseText: '',
         *    responseXML: xmlObj,
         *    responseJSON: JSON Object,
         *    error: ''
         * }
         * [cbArgs] == args object in the req object
         * </pre>
         *
         * @return {Integer} a request id
         */
        asyncRequest : function (req) {
            this.__normalizeRequest(req);
            // Don't validate the bean to avoid having a dependency on aria.core.JsonValidator

            this.pendingRequests[req.id] = req;

            // IOFiltersMgr is not a mandatory feature, if it's not there, let's just go to the next phase
            if (aria.core.IOFiltersMgr) {
                aria.core.IOFiltersMgr.callFiltersOnRequest(req, {
                    fn : this._afterRequestFilters,
                    scope : this,
                    args : req
                });
            } else {
                this._afterRequestFilters(null, req);
            }

            return req.id;
        },

        /**
         * Make a pseudo asynchronous form submission.
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request Request description
         *
         * <pre>
         * [request] {
         *    formId: &quot;callback&quot;,  // ID of the form that is to be submitted
         *    form: //the html form element
         *    url:&quot;myfile.txt&quot;, // absolute or relative URL
         *    method: &quot;POST&quot;,   // POST or GET (default)
         *    timeout: 1000,    // {Integer} timeout in ms - default: defaultTimeout
         *    callback: {
         *      fn: obj.method,     // mandatory
         *      scope: obj,         // mandatory
         *      onerror: obj2.method2 // callback error handler - optional - default: Timer error log
         *      onerrorScope: obj2    // optional - default: Timer or scope if onError is provided
         *      args: {x:123}       // optional - default: null
         *    }
         * }
         * When a response is received, the callback function is called with the following arguments:
         * callback(response, callbackArgs)
         * where:
         * [response] { // the structure of response is described in aria.core.CfgBeans.IOAsyncRequestResponseCfg
         *    url: &quot;&quot;,
         *    status: &quot;&quot;,
         *    responseText: &quot;&quot;,
         *    responseXML: XML Object,
         *    error: &quot;&quot; // error description
         * }
         * and callbackArgs == args object in the request callback object
         * </pre>
         *
         * @return {Integer} Request identifier
         */
        asyncFormSubmit : function (request) {
            var form;
            if (aria.utils.Type.isHTMLElement(request.form)) {
                form = request.form;
            } else if (aria.utils.Type.isString(request.formId)) {
                form = Aria.$window.document.getElementById(request.formId);
            }

            if (!form) {
                this.$logError(this.MISSING_FORM);
                return request.callback.onerror.call(request.callback.scope, request);
            }

            if (!request.url) {
                request.url = form.action;
            }

            if (!request.method) {
                request.method = form.method;
            }

            if (form.enctype && !request.headers) {
                request.headers = {
                    "Content-Type" : form.enctype
                };
            } else if (form.enctype && request.headers && !request.headers["Content-Type"]) {
                request.headers["Content-Type"] = form.enctype;
            }

            request.form = form;
            request.formId = form.id;
            return this.asyncRequest(request);
        },

        /**
         * Continue the request started in asyncRequest, after request filters have been called.
         * @param {Object} unused Unused parameter
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} req request (may have been modified by filters)
         * @private
         */
        _afterRequestFilters : function (unused, req) {
            this.$raiseEvent({
                name : "request",
                req : req
            });

            req.beginDownload = (new Date()).getTime();

            // as postData can possibly be changed by filters, we compute the requestSize only after filters have been
            // called:
            /* Backward Compatibility begins here */
            if (req.method == "POST" && req.postData) {
                req.requestSize = req.postData.length;
            }
            /* Backward Compatibility ends here */
            else {
                req.requestSize = ((req.method == "POST" || req.method == "PUT") && req.data) ? req.data.length : 0;
            }

            // PROFILING // req.profilingId = this.$startMeasure(req.url);

            try {
                this._prepareTransport(req);
            } catch (ex) {
                // There was an error in this method - let's create a callback to notify
                // the caller in the same way as for other errors
                aria.core.Timer.addCallback({
                    fn : this._handleResponse,
                    scope : this,
                    delay : 10,
                    args : {
                        isInternalError : true,
                        reqId : req.id,
                        errDescription : ex.description || ex.message || (ex.name + ex.number)
                    }
                });
            }

            return req.id;
        },

        /**
         * Normalize the Request object adding default values and additional parameters like a unique ID
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} req Request object as the input parameter of asyncRequest
         * @private
         */
        __normalizeRequest : function (req) {
            // increment before assigning to avoid setting request id 0 (which does not work well with abort)
            this.nbRequests++;
            req.id = this.nbRequests;

            var reqMethods = ["GET", "POST", "PUT", "DELETE", "HEAD", "TRACE", "OPTIONS", "CONNECT", "PATCH", "COPY",
                    "PROPFIND", "MKCOL", "PROPPATCH", "MOVE", "LOCK", "UNLOCK", "BIND", "UNBIND", "REBIND"];
            // Assign a request timeout in order of importance:
            // # req.timeout - User specified timeout
            // # req.callback.timeout - Timeout of the callback function (might be set by filters)
            // # this.defaultTimeout - Default IO timeout
            if (req.timeout == null) {
                req.timeout = (req.callback == null || req.callback.timeout == null)
                        ? this.defaultTimeout
                        : req.callback.timeout;
            }

            if (!req.method) {
                req.method = "GET";
            } else {
                req.method = req.method.toUpperCase();
            }

            if (!aria.utils.Array.contains(reqMethods, req.method)) {
                return this.$logWarn("The request method %1 is invalid", [req.method]);
            }

            var headers = {};
            // First take the default IO headers
            for (var key in this.headers) {
                if (this.headers.hasOwnProperty(key)) {
                    headers[key] = this.headers[key];
                }
            }
            // Then the headers from the request object
            for (var key in req.headers) {
                if (req.headers.hasOwnProperty(key)) {
                    headers[key] = req.headers[key];
                }
            }

            if (req.method === "POST" || req.method === "PUT") {

                /* Backward Compatibility begins here */
                // Fist the one specified in the request
                var contentType = headers["Content-Type"] || req.contentTypeHeader || req.postHeader;

                if (!contentType && this.useDefaultPostHeader) {
                    contentType = this.defaultPostHeader;
                }
                if (!contentType && this.useDefaultContentTypeHeader) {
                    contentType = this.defaultContentTypeHeader;
                }

                if (contentType) {
                    headers["Content-Type"] = contentType;
                }
                /* Backward Compatibility ends here */
                // When compatibility is removed, we should only have
                // if (!headers["Content-Type"] && this.useDefaultContentTypeHeader) {
                // headers["Content-Type"] = this.defaultContentTypeHeader
                // }
            }

            /* Backward Compatibility begins here */
            if (this.useXHRHeader) {
                headers["X-Requested-With"] = this.defaultXHRHeader;
            } else {
                delete headers["X-Requested-With"];
            }
            /* Backward Compatibility ends here */

            req.headers = headers;

            /* Backward Compatibility begins here */
            // This one makes sure that we always use data, not post data
            if (!req.data) {
                req.data = req.postData;
            }
            /* Backward Compatibility ends here */
        },

        /**
         * Prepare the transport class before going on with the request (make sure it is loaded, through Aria.load).
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request Request object
         * @private
         */
        _prepareTransport : function (request) {
            var transport;
            if (request.jsonp) {
                transport = this.__jsonp;
            } else if (aria.utils.Type.isHTMLElement(request.form)) {
                transport = this.__iframe;
            } else {
                transport = this._getTransport(request.url, Aria.$frameworkWindow
                        ? Aria.$frameworkWindow.location
                        : null);
            }

            var instance = Aria.getClassRef(transport);
            var args = {
                req : request,
                transport : {
                    classpath : transport,
                    instance : instance
                }
            };

            if (!instance) {
                Aria.load({
                    classes : [transport],
                    oncomplete : {
                        fn : this._asyncRequest,
                        args : args,
                        scope : this
                    }
                });
            } else {
                this._asyncRequest(args);
            }
        },

        /**
         * Get the correct transport for the uri. It uses the Location argument to distinguish between XHR and XDR
         * @param {String} uri URI of the request
         * @param {Object} location Location object as in window.location or null if not run in a browser
         *
         * <pre>
         * {
         *    protocol: the protocol of the URL
         *    host: the hostname and port number
         * }
         * </pre>
         *
         * @return {String} Transport class classpath
         * @protected
         */
        _getTransport : function (uri, location) {
            var uriCheck = this._uriScheme.exec(uri.toLowerCase());

            if (uriCheck && location) {
                var scheme = uriCheck[1], authority = uriCheck[2];

                if (this._uriLocal.test(scheme)) {
                    return this.__local;
                } else if (scheme != location.protocol || (authority.indexOf(location.host) !== 0)) {
                    // Having different protocol or host we must use XDR
                    return this.__crossDomain;
                }
            }

            // For any other request go for XHR
            return this.__sameDomain;
        },

        /**
         * Initiates an asynchronous request via the chosen transport.
         * @protected
         * @param {Object} arg Object containing the properties:
         *
         * <pre>
         *      req (aria.core.CfgBeans:IOAsyncRequestCfg) Request object,
         *      transport {Object} containing 'classpath' and 'instance'
         * </pre>
         */
        _asyncRequest : function (arg) {
            var request = arg.req;
            var reqId = request.id;
            // var method = request.method;
            var transport = arg.transport.instance || Aria.getClassRef(arg.transport.classpath);

            var transportCallback = {
                fn : this._handleResponse,
                scope : this,
                args : request
            };

            if (!transport.isReady) {
                // Wait for it to be ready
                return transport.init(reqId, transportCallback);
            }

            // Here we're going to make a request
            this.trafficUp += request.requestSize;

            transport.request(request, transportCallback);
        },

        /**
         * Handle a transport response. This is the callback function passed to a transport request
         * @param {Boolean|Object} error Whether there was an error or not
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request
         * @param {aria.core.CfgBeans:IOAsyncRequestResponseCfg} response
         */
        _handleResponse : function (error, request, response) {
            if (!response) {
                response = {};
            }

            if (!request && error) {
                request = this.pendingRequests[error.reqId];
            }

            this.clearTimeout(request.id);
            this._normalizeResponse(error, request, response);

            // Extra info for the request object
            request.res = response;
            request.endDownload = (new Date()).getTime();
            request.downloadTime = request.endDownload - request.beginDownload;
            request.responseSize = response.responseText.length;

            this.trafficDown += request.responseSize;

            this.$raiseEvent({
                name : "response",
                req : request
            });

            delete this.pendingRequests[request.id];

            if (aria.core.IOFiltersMgr) {
                aria.core.IOFiltersMgr.callFiltersOnResponse(request, {
                    fn : this._afterResponseFilters,
                    scope : this,
                    args : request
                });
            } else {
                this._afterResponseFilters(null, request);
            }
        },

        /**
         * Normalize the Response object adding error messages (if any) and converting the response in the expected
         * format
         * @param {Boolean} error Whether there was an error or not
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request
         * @param {aria.core.CfgBeans:IOAsyncRequestResponseCfg} response
         */
        _normalizeResponse : function (error, request, response) {
            response.reqId = request.id;
            response.url = request.url;

            var expectedResponseType = request.expectedResponseType;

            if (error) {
                this.nbKOResponses++;

                if (!response.responseText) {
                    response.responseText = "";
                }

                if (response.responseText && expectedResponseType === "json") {
                    try {
                        response.responseJSON = this.__serializer.parse(response.responseText);
                    } catch (ex) {
                        this.$logWarn(this.JSON_PARSING_ERROR, [request.url, response.responseText]);
                    }
                }

                if (!response.error) {
                    response.error = error === true ? error.statusText || "error" : error.errDescription;
                }

            } else {
                this.nbOKResponses++;

                if (expectedResponseType) {
                    this._jsonTextConverter(response, expectedResponseType);
                }

                response.error = null;
            }
        },

        /**
         * Continue to process a response, after response filters have been called.
         * @param {Object} unused Unused parameter
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} req request (may have been modified by filters)
         * @private
         */
        _afterResponseFilters : function (unused, req) {
            var res = req.res, cb = req.callback;
            if (!cb) {
                this.$logError(this.MISSING_IO_CALLBACK, [res.url]);
            } else if (res.error != null) {
                // an error occured
                // call the error callback
                if (cb.onerror == null) {
                    // Generic IO error mgt
                    this.$logError(this.IO_REQUEST_FAILED, [res.url, res.error]);
                } else {
                    var scope = cb.onerrorScope;
                    if (!scope) {
                        scope = cb.scope;
                    }
                    try {
                        cb.onerror.call(scope, res, cb.args);
                    } catch (ex) {
                        this.$logError(this.IO_CALLBACK_ERROR, [res.url], ex);
                    }
                }
            } else {

                // check the response type to adapt it to the request
                if (req.expectedResponseType) {

                    this._jsonTextConverter(res, req.expectedResponseType);
                }

                cb.fn.call(cb.scope, res, cb.args);
            }
            req = cb = null;
        },

        /**
         * Updates the transport to be used for same domain, cross domain, and jsonp requests. Currently transports must
         * be singletons.
         * @param {Object} transports class name and path
         *
         * <pre>
         * aria.core.IO.updateTransport({
         *     'sameDomain' : 'myApplication.transports.SameDomainCustomTransport',
         *     'crossDomain' : 'myApplication.transports.CrossDomainCustomTransport',
         *     'jsonp' : 'myApplication.transports.JsonP',
         *     'local' : 'myApplication.transports.Local',
         *     'iframe' : 'myApplication.transports.IFrame'
         * });
         * </pre>
         *
         * @public
         */
        updateTransports : function (transports) {
            if (transports.sameDomain) {
                this.__sameDomain = transports.sameDomain;
            }

            if (transports.crossDomain) {
                this.__crossDomain = transports.crossDomain;
            }

            if (transports.jsonp) {
                this.__jsonp = transports.jsonp;
            }

            if (transports.local) {
                this.__local = transports.local;
            }

            if (transports.iframe) {
                this.__iframe = transports.iframe;
            }
        },

        /**
         * Gets the class name and path of the current transports used for same domain, cross domain, jsonp, and local
         * requests.
         * @return {Object}
         * @public
         */
        getTransports : function () {
            return {
                "sameDomain" : this.__sameDomain,
                "crossDomain" : this.__crossDomain,
                "jsonp" : this.__jsonp,
                "local" : this.__local,
                "iframe" : this.__iframe
            };
        },

        /**
         * Set a timeout for a given request. If not canceled this method calls the abort function and the callback
         * after 'timeout' milliseconds
         * @param {Number} id Request id
         * @param {Number} timeout Timer in milliseconds
         * @param {aria.core.CfgBeans:Callback} callback Should be already normalized
         */
        setTimeout : function (id, timeout, callback) {
            if (timeout > 0) {
                this._timeOut[id] = setTimeout(function () {
                    // You won't believe this, but sometimes IE forgets to remove the timeout even if
                    // we explicitely called a clearTimeout. Double check that the timeout is valid
                    if (aria.core.IO._timeOut[id]) {
                        aria.core.IO.abort({
                            redId : id,
                            getStatus : callback
                        }, null, true);
                    }
                }, timeout);
            }
        },

        /**
         * Clear a request timeout. It removes the poll timeout as well
         * @param {Number} id Request id
         */
        clearTimeout : function (id) {
            clearInterval(this._poll[id]);
            delete this._poll[id];
            clearTimeout(this._timeOut[id]);
            delete this._timeOut[id];
        },

        /**
         * Method to terminate a transaction, if it has not reached readyState 4.
         * @param {Object|String} xhrObject The connection object returned by asyncRequest or the Request identifier.
         * @param {Object} callback User-defined callback object.
         * @param {String} isTimeout boolean to indicate if abort resulted from a callback timeout.
         * @return {Boolean}
         */
        abort : function (xhrObject, callback, isTimeout) {
            if (!xhrObject) {
                return false;
            }

            var transaction = xhrObject.redId || xhrObject;
            var request = this.pendingRequests[transaction];

            this.clearTimeout(transaction);

            var abortStatus = false;
            if (xhrObject.getStatus) {
                var statusCallback = xhrObject.getStatus;
                abortStatus = statusCallback.fn.apply(statusCallback.scope, statusCallback.args);
            }

            if (request) {
                abortStatus = true;

                if (xhrObject === transaction) {
                    xhrObject = {
                        transaction : transaction
                    };
                } else {
                    xhrObject.transaction = transaction;
                }
            }

            if (abortStatus === true) {
                // Fire global custom event -- abortEvent
                this.$raiseEvent({
                    name : "abortEvent",
                    o : xhrObject,
                    req : request
                });

                var response = {
                    transaction : request.id,
                    req : request,
                    status : isTimeout ? this.COMM_CODE : this.ABORT_CODE,
                    statusText : isTimeout ? this.TIMEOUT_ERROR : this.ABORT_ERROR
                };

                this._handleResponse(true, request, response);
            }

            return abortStatus;
        },

        /**
         * Make a JSON-P request.
         * @param {aria.core.CfgBeans:IOAsyncRequestCfg} request Request description
         *
         * <pre>
         * [request] {
         *    url: &quot;myfile.txt&quot;,  // absolute or relative URL
         *    timeout: 1000,    // {Integer} timeout in ms - default: defaultTimeout
         *    jsonp: &quot;callback&quot;,  // Name of the parameters that specifies the callback to be executed, default callback
         *    callback: {
         *      fn: obj.method,     // mandatory
         *      scope: obj,         // mandatory
         *      onerror: obj2.method2 // callback error handler - optional - default: Timer error log
         *      onerrorScope: obj2    // optional - default: Timer or scope if onError is provided
         *      args: {x:123}       // optional - default: null
         *    }
         * }
         * Url generated will be:
         * [request.url]?[request.jsonp]=[request.callback]
         * When a response is received, the callback function is called with the following arguments:
         * callback(response, callbackArgs)
         * where:
         * [response] { // the structure of response is described in aria.core.CfgBeans.IOAsyncRequestResponseCfg
         *    url: &quot;&quot;,
         *    status: &quot;&quot;,
         *    responseText: &quot;&quot;,
         *    responseXML: null,
         *    responseJSON: JSON Object,
         *    error: &quot;&quot; // error description
         * }
         * and callbackArgs == args object in the request callback object
         * </pre>
         *
         * @return {Integer} Request identifier
         */
        jsonp : function (request) {
            if (!request.jsonp) {
                request.jsonp = "callback";
            }
            if (!request.expectedResponseType) {
                request.expectedResponseType = "json";
            }
            return this.asyncRequest(request);
        },

        /**
         * Convert the response text into Json or response Json into text
         * @param {aria.core.CfgBeans:IOAsyncRequestResponseCfg} response Response object
         * @param {String} expectedResponseType The expected response type
         * @protected
         */
        _jsonTextConverter : function (response, expectedResponseType) {
            if (expectedResponseType == "text") {
                if (!response.responseText && response.responseJSON != null) {
                    // convert JSON to text
                    if (aria.utils.Type.isString(response.responseJSON)) {
                        // this case is important for JSON-P services which return a simple string
                        // we simply use that string as text
                        // (could be useful to load templates through JSON-P, for example)
                        response.responseText = response.responseJSON;
                    } else {
                        // really convert the JSON structure to a string
                        response.responseText = aria.utils.Json.convertToJsonString(response.responseJSON);
                    }
                }
            } else if (expectedResponseType == "json") {
                if (response.responseJSON == null && response.responseText != null) {
                    // convert text to JSON
                    var errorMsg = aria.utils.String.substitute(this.JSON_PARSING_ERROR, [response.url,
                            response.responseText]);
                    response.responseJSON = aria.utils.Json.load(response.responseText, this, errorMsg);
                }
            }

        },

        /**
         * Reiusse a pending request. A request might need to be reissued because the transport was not ready (it's the
         * case of XDR).
         * @param {String} reqId ID of the pending request.
         */
        reissue : function (reqId) {
            var req = this.pendingRequests[reqId];

            if (req) {
                delete this.pendingRequests[reqId];
                return this.asyncRequest(req);
            }
        }

    }
});
/**
 * This class allows to sequence several tasks in an asynchronous way. This is particularly useful for long-running
 * processes that need to notify HTML-based UIs of process progression (HTML UIs are only refreshed when the main thread
 * pauses)
 */
Aria.classDefinition({
    $classpath : "aria.core.Sequencer",
    $events : {
        "start" : "raised when the sequencer starts",
        "end" : "raised when all taks have been completed",
        "taskStart" : {
            description : "raised when a task starts: note task processors will automatically receive such events but will not be registered as listeners, so that they only receive the event for their own task",
            properties : {
                taskId : "{Number} task id (position in task list: first is 0)",
                taskName : "{String} name of the task",
                taskArgs : "{Object} arguments associated to the task"
            }
        },
        "taskError" : {
            description : "raised when an exception is caught during a task execution",
            properties : {
                taskId : "{Number} task id (position in task list: first is 0)",
                taskName : "{String} name of the task",
                taskArgs : "{Object} arguments associated to the task",
                exception : "{Error} the exception object",
                continueProcessing : "{Boolean} tells if processing should stop or not: can be changed by the listener - default:true"
            }
        }
    },
    $constructor : function () {
        /**
         * State of the Sequencer, either STATE_IDLE or STATE_PROCESSING
         * @type Integer
         * @protected
         */
        this._state = this.STATE_IDLE;

        /**
         * List of task to be performed
         * @type Array
         * @protected
         */
        this._tasks = [];
    },
    $destructor : function () {
        this._tasks = null;
        this._state = null;
    },
    $statics : {
        /**
         * Enum to qualify the sequencer state. No tasks running
         * @type Number
         */
        STATE_IDLE : 0,

        /**
         * Enum to qualify the sequencer state. Pending task completion
         * @type Number
         */
        STATE_PROCESSING : 1,

        // ERROR MESSAGE:
        INVALID_TASKDESC : "Invalid task description",
        ALREADY_PROCESSING : "Sequencer is in state PROCESSING, cannot start() again"
    },
    $prototype : {
        /**
         * Append a task to the task list. Tasks will be triggered through events - as such task processors are
         * considered as special listeners for the Sequencer object <br />
         * Note: asynchronous tasks should call the notifyTaskEnd() method of the sequencer
         * @example
         *
         * <pre>
         * addTask({
         *      name: 'task name'
         *      fn: obj.doTask,
         *      scope: obj,
         *      args: {x:'Sample Argument&quot;,y:123}
         *      asynchronous: true
         * });
         * </pre>
         *
         * @param {Object} taskDesc the task description object
         *
         * <pre>
         * {
         *      name: {String} task name - mandatory,
         *      fn: {Function} function to be executed - mandatory,
         *      scope: {Object} scope for the task object - mandatory,
         *      args: {Object} arguments passed to the task function - optional,
         *      asynchronous: {Boolean} Whether or not the task is asynchronous
         * });
         * </pre>
         */
        addTask : function (taskDesc) {
            if (!taskDesc || typeof(taskDesc.name) != 'string' || !taskDesc.name || typeof(taskDesc.fn) != 'function'
                    || typeof(taskDesc.scope) != 'object') {
                return this.$logError(this.INVALID_TASKDESC);
            }

            this._tasks.push(taskDesc);
        },

        /**
         * Start the task sequence
         */
        start : function () {
            if (this._state == this.STATE_PROCESSING) {
                return this.$logWarn(this.ALREADY_PROCESSING);
            }

            this._state = this.STATE_PROCESSING;
            this.$raiseEvent("start");

            if (this._tasks.length > 0) {
                aria.core.Timer.addCallback({
                    fn : this._execTask,
                    scope : this,
                    delay : 12,
                    args : {
                        taskId : 0
                    }
                });
            } else {
                // raises the end event and ends the process
                this._end();
                // It may be found that it is better to call it
                // asynchronously so that it is always true that
                // immediately after calling the start method
                // the end event has not yet been called (which could
                // be a problem sometimes)
                /*
                 * aria.core.Timer.addCallback({ fn:this._end, scope:this, delay:1 })
                 */
            }
        },

        /**
         * Internal method called through the Time callback to execute a specific task
         * @param {Integer} taskId
         * @protected
         */
        _execTask : function (args) {
            var taskId = args.taskId;
            var sz = this._tasks.length;
            if (taskId == null || taskId > sz - 1) {
                return;
            }
            var task = this._tasks[taskId];
            var continueProcessing = true;
            var evt = {
                name : "taskStart",
                src : this,
                taskId : taskId,
                taskName : task.name,
                taskArgs : task.args
            };

            try {
                // raise event (for object listeners)
                this.$raiseEvent(evt);

                // call task processor (note: task processor are not registered as listeners)
                task.id = taskId;
                task.taskMgr = this;
                task.fn.call(task.scope, task, task.args);

            } catch (ex) {
                evt.name = "taskError";
                evt.exception = ex;
                evt.continueProcessing = true;

                this.$raiseEvent(evt);
                if (!evt.continueProcessing) {
                    continueProcessing = false;
                }
            }

            if (task.asynchronous !== true) {
                this.notifyTaskEnd(taskId, !continueProcessing);
            }
        },

        /**
         * Notifies the sequencer of the end of a task. This is automatically called for synchronous task - but must be
         * called by asynchronous tasks
         * @param {Integer} taskId the task id passed when the task processor is called
         * @param {Boolean} terminate force the sequencer termination [optional - default: false]
         */
        notifyTaskEnd : function (taskId, terminate) {
            // note: we have to check if object has not already been disposed as end task
            // may call the dispose method - however this should be done on the sequencer
            // 'end' event and not in the last task
            if (this._tasks == null) {
                return;
            }

            var sz = this._tasks.length;
            if (terminate !== true) {
                if (taskId < sz - 1) {
                    // this is not the last task
                    aria.core.Timer.addCallback({
                        fn : this._execTask,
                        scope : this,
                        delay : 1,
                        args : {
                            taskId : taskId + 1
                        }
                    });
                } else {
                    // last task
                    terminate = true;
                }
            }
            if (terminate === true) {
                this._end();
            }
        },

        /**
         * Internal function called to notify of the end of the process
         * @protected
         */
        _end : function () {
            // end task processing
            this.$raiseEvent("end");
            this._state = this.STATE_IDLE;
        }
    }
});/**
 * This class ensures the asynchronous load of multiple types of resources (e.g. classes, files, templates, etc...) and
 * calls back the user when resources are available
 */
Aria.classDefinition({
    $classpath : "aria.core.MultiLoader",
    /**
     * Multi Loader constructor
     * @param {Object} loadDescription description of the content to load + callback
     *
     * <pre>
     * {
     *      classes : {Array} list of JS classpaths to be loaded
     *      templates : {Array} list of TPL classpaths to be loaded
     *      resources : {Array} list of RES classpaths to be loaded
     *      css : {Array} list of TPL.CSS classpaths to be loaded
     *      tml : {Array} list of TML classpaths to be loaded
     *      cml : {Array} list of CML classpaths to be loaded
     *      txt : {Array} list of TXT classpaths to be loaded
     *      oncomplete : {
     *          fn : {Function} the callback function - may be called synchronously if all dependencies are already available
     *          scope : {Object} [optional] scope object (i.e. 'this') to associate to fn - if not provided, the Aria object will be used
     *          args: {Object} [optional] callback arguments (passed back as argument when the callback is called)
     *      },
     *      onerror : {
     *          fn : {Function} the callback function called in case of load error
     *          scope : {Object} [optional] scope object
     *          args: {Object} [optional] callback arguments
     *      }
     * }
     * </pre>
     *
     * Alternatively, if there is no need to specify a scope and args, the callback property can contain directly the
     * callback function
     *
     * <pre>
     * oncomplete: function () {...}
     * </pre>.
     * @param {Boolean} autoDispose if true (default) the instance of multiloader will be automatically disposed when
     * the callback is called
     */
    $constructor : function (loadDescription, autoDispose) {
        this._autoDispose = (autoDispose !== false);
        this._loadDesc = loadDescription;
        this._clsLoader = null;
    },
    $statics : {
        // ERROR MESSAGES:
        MULTILOADER_CB1_ERROR : "Error detected while executing synchronous callback on MultiLoader.",
        MULTILOADER_CB2_ERROR : "Error detected while executing callback on MultiLoader."
    },
    $prototype : {
        /**
         * Start the load of the resources passed to the constructor Warning: this mehod may be synchronous if all
         * resources are already available As such, the caller should not make any processing but the callback after
         * this method call
         */
        load : function () {
            var cm = aria.core.ClassMgr, descriptor = this._loadDesc, hasError = false, allLoaded = true;

            var dependencies = {
                "JS" : cm.filterMissingDependencies(descriptor.classes),
                "TPL" : cm.filterMissingDependencies(descriptor.templates),
                // TODO: remove classType - temp fix for resources reloading and json injection
                "RES" : cm.filterMissingDependencies(descriptor.resources, "RES"),
                "CSS" : cm.filterMissingDependencies(descriptor.css),
                "TML" : cm.filterMissingDependencies(descriptor.tml),
                "TXT" : cm.filterMissingDependencies(descriptor.txt),
                "CML" : cm.filterMissingDependencies(descriptor.cml)
            };

            // This first loop only detects whether there are error or missing dependencies
            for (var type in dependencies) {
                if (dependencies.hasOwnProperty(type)) {
                    var missing = dependencies[type];

                    hasError = hasError || missing === false;
                    allLoaded = allLoaded && missing === null;
                }
            }

            if (hasError || allLoaded) {
                this._execCallback(true, hasError);
            } else {
                var loader = new aria.core.ClassLoader();

                // multiloader has a onerror function -> it will handle errors
                if (this._loadDesc['onerror'] && this._loadDesc['onerror'].override) {
                    loader.handleError = false;
                }
                this._clsLoader = loader; // usefull reference for debugging

                loader.$on({
                    "classReady" : this._onClassesReady,
                    "classError" : this._onClassesError,
                    "complete" : this._onClassLoaderComplete,
                    scope : this
                });

                // This second loop adds dependencies on the loader
                for (type in dependencies) {
                    if (dependencies.hasOwnProperty(type)) {
                        missing = dependencies[type];

                        if (missing) {
                            loader.addDependencies(missing, type);
                        }
                    }
                }
                loader.loadDependencies();
            }
        },

        /**
         * Internal method used to callback the class user
         * @param {Boolean} syncCall true if the callback is called synchronously (i.e. in the load() call stack)
         * @private
         */
        _execCallback : function (syncCall, error) {
            var cb = this._loadDesc[error ? "onerror" : "oncomplete"];
            if (cb) {
                if (typeof(cb) == 'function') {
                    cb = {
                        fn : cb
                    };
                }
                var scope = (cb.scope) ? cb.scope : Aria;
                try {
                    cb.fn.call(scope, cb.args);
                } catch (ex) {
                    var errId = (syncCall) ? this.MULTILOADER_CB1_ERROR : this.MULTILOADER_CB2_ERROR;
                    this.$logError(errId, null, ex);
                }
            }
            // in case of asynchronous call the dispose is done in the complete event
            if (syncCall && this._autoDispose) {
                this.$dispose();
            }
        },

        /**
         * Internal callback called when the class dependencies are ready
         * @param {aria.core.ClassLoader:classReady:event} evt
         * @private
         */
        _onClassesReady : function (evt) {
            this._execCallback(false, false);
        },

        /**
         * Internal callback called if there is an error while loading classes
         * @param {aria.core.ClassLoader:classError:event} evt
         * @private
         */
        _onClassesError : function (evt) {
            this._execCallback(false, true);
        },

        /**
         * Internal method called when the class loader can be disposed
         * @param {aria.core.ClassLoader:complete:event} evt
         * @private
         */
        _onClassLoaderComplete : function (evt) {
            var loader = evt.src;
            this.$assert(90, this._clsLoader === loader);
            this._clsLoader = null;
            loader.$dispose();
            if (this._autoDispose) {
                this.$dispose();
            }
        }
    }
});(function () {

    var jsonUtils = aria.utils.Json;
    var typeUtils = aria.utils.Type;

    /**
     * The JSON Validator does two main operations:
     * <ul>
     * <li> a preprocessing operation is done when loading a bean package (BP) definition. <br />
     * During this operation, every bean definition in the package is annotated, so that it contains a reference to the
     * bean definition of its immediate super bean and its base built-in type, and bean inheritance is processed
     * (propagation of object properties of a bean to the beans which extend it). After the preprocessing of a bean, its
     * default value, if provided, is checked so that it matches the definition.</li>
     * <li> the processing is done when validating an instance of a JSON object against the bean definition it is
     * supposed to comply with. </li>
     * </ul>
     * Note: this class is tightly linked with JsonTypesCheck, to keep files with a reasonable size. Be carefull if
     * changing something: any protected method in this class (method whose name starts with one underscore) may be
     * called from JsonTypesCheck. Private methods (starting with two underscores) are not called from JsonTypesCheck.
     */
    Aria.classDefinition({
        $classpath : "aria.core.JsonValidator",
        $dependencies : ["aria.utils.Json", "aria.utils.Type"],
        $singleton : true,

        $constructor : function () {
            /**
             * Map of bean packages whose dependencies are not yet loaded. The key in the map is the package name
             * @type Object
             * @private
             */
            this.__waitingBeans = {};

            /**
             * Map of all loaded bean packages (already preprocessed). The key in the map is the package name
             * @type Object
             * @private
             */
            this.__loadedBeans = {};

            /**
             * Map of processed beans, for direct access
             * @type Object
             * @private
             */
            this.__processedBeans = {};

            /**
             * Map of all base types. The key in the map is the short type name (e.g.: String, does not include package
             * name).
             * @type Object
             * @private
             */
            this.__baseTypes = {};

            /**
             * Options for current preprocessing and/or processing. All these options are boolean values.
             * @type Object
             * @protected
             */
            this._options = {
                /**
                 * addDefaults: When processing, if true, add default values when they are missing.
                 */
                addDefaults : true, // Be aware that this will be changed when calling check or normalize
                /**
                 * checkEnabled: When false, check is disabled, so that calls to check are ignored and normalizing do
                 * only minimal checking to add default values.
                 */
                checkEnabled : Aria.debug,
                /**
                 * checkDefaults: When preprocessing, if true, also do processing to check that default values are
                 * valid.
                 */
                checkDefaults : true,
                /**
                 * checkMultiTypes: when processing, if false, does not check validity of instances of multitypes
                 * (multitypes can be ambiguous to validate)
                 */
                checkMultiTypes : false,
                /**
                 * checkInheritance: when preprocessing, if true, when a bean inherits from another bean, its properties
                 * (if the bean's type is an object) or its content type (if the bean's type is a map or array) must
                 * inherit (either directly or through several beans) from the corresponding parent properties or
                 * content type
                 */
                checkInheritance : true,
                /**
                 * checkBeans: when true, use aria.core.BaseTypes to validate bean definitions when they are
                 * preprocessed.
                 */
                checkBeans : true,
                /**
                 * Throws errors instead of logging them
                 * @type Boolean
                 */
                throwsErrors : false
            };

            /**
             * Array of error objects. This array of errors may be sent to this.$log at the end of the processing if
             * they are not discarded (they may be discarded, for example, in the case of the MultiTypes which may fail
             * for several types before succeeding, so errors are discarded) Error objects structure:
             * @type Array
             * @protected
             *
             * <pre>
             *  {
             *    msgId: {String} the message key in the resource file
             *    msgArgs: {Array} the arguments provided with the message
             *  }
             * </pre>
             */
            this._errors = [];

            /**
             * Name of the Bean being preprocessed. Used in error reporting.
             * @protected
             * @type String
             */
            this._currentBeanName = "JSON root";

            // reference object to tag the type being computed
            this._typeBeingComputed = {
                typeName : 'typeBeingComputed'
            };

            /**
             * Fake typeRef used as a generic error typeRed
             * @protected
             * @type Object
             */
            this._typeError = {
                typeName : 'typeError'
            };

            this._typeRefError = {};
            this._typeRefError[this._MD_BUILTIN] = true;
            this._typeRefError[this._MD_BASETYPE] = this._typeError;

        },
        $destructor : function () {
            this.__waitingBeans = null;
            this.__loadedBeans = null;
        },
        $statics : {
            // ERROR MESSAGES:

            /* Pre-processing errors (errors in bean definition): */
            INVALID_TYPE_NAME : "Invalid or missing $type in %1: %2",
            INVALID_TYPE_REF : "Type %1, found in %2, is not defined in package %3",
            UNDEFINED_PREFIX : "Prefix %1, found in %2, is not defined",
            MISSING_BEANSPACKAGE : "Beans package %1, referenced in %2, was not found",
            RECURSIVE_BEAN : "Recursive bean definition in %1",
            BOTH_MANDATORY_DEFAULT : "$mandatory=true and $default should not be specified at the same time in %1",
            INHERITANCE_EXPECTED : "Type %1 should inherit from %2",
            MISSING_CONTENTTYPE : "Missing $contentType in the %1 definition in %2",
            ENUM_DUPLICATED_VALUE : "Duplicated value '%1' in enum definition %2",
            ENUM_INVALID_INHERITANCE : "Value '%1', from %2, is not present in parent enum definition %3",
            INVALID_DEFAULTVALUE : "Default value %1 in %2 is invalid: %3",
            BEANCHECK_FAILED : "Checking bean definition %1 with beans schema failed: %2",
            MISSING_ENUMVALUES : "$enumValues must be defined and non-empty in the Enum definition in %1",
            INVALID_NAME : "Invalid name for a bean: %1 in %2",
            NUMBER_INVALID_INHERITANCE : "Invalid inheritance: %1 in %2 should respect its parent range",
            NUMBER_INVALID_RANGE : "Invalid range in %1: %2-%3",

            /* Processing errors (errors in the JSON checked) */
            BEAN_NOT_FOUND : "Bean %1 was not found",
            INVALID_CONFIGURATION : "%1 configuration is not valid.",
            INVALID_TYPE_VALUE : "Invalid type: expected type %1 (from %2), found incorrect value '%3' in %4",
            INVALID_MULTITYPES_VALUE : "The value found in %1 is not valid for all the types defined in %2: %3",
            ENUM_UNKNOWN_VALUE : "Value '%1' in %2 is not in the enum definition %3",
            UNDEFINED_PROPERTY : "Property '%1', used in %2, is not defined in %3",
            MISSING_MANDATORY : "Missing mandatory attribute in %1 for definition %2",
            REGEXP_FAILED : "Value '%1' in %2 does not comply with RegExp %3 in %4",
            NUMBER_RANGE : "Number '%1' in %2 is not in the accepted range (%3=%4)",
            NOT_OF_SPECIFIED_CLASSPATH : "Invalid class instance: expected instance of class %1 (from %2), found incorrect value '%3' in %4"
        },
        $prototype : {

            // Meta-data names used to annotate beans definitions for preprocessing and processing:
            _MD_TYPENAME : Aria.FRAMEWORK_PREFIX + 'typeName', // the complete string path to the current bean
            _MD_BASETYPE : Aria.FRAMEWORK_PREFIX + 'baseType', // an object reference to one of the base types
            _MD_PARENTDEF : Aria.FRAMEWORK_PREFIX + 'parentType', // an object reference to the parent bean definition
            _MD_BUILTIN : Aria.FRAMEWORK_PREFIX + 'builtIn', // true if the bean is a base bean
            _MD_ENUMVALUESMAP : Aria.FRAMEWORK_PREFIX + 'enumValuesMap', // for a bean of type Array, a map with the
            // accepted values

            _MD_STRDEFAULT : Aria.FRAMEWORK_PREFIX + 'strDefault', // string that evaluates to default value

            _BASE_TYPES_PACKAGE : 'aria.core.JsonTypes', // the beans package which contains base types
            // (this special package does not completely respect the general grammar,
            // because base types do not have a parent type)
            _BEANS_SCHEMA_PACKAGE : 'aria.core.BaseTypes', // the beans package used to check beans during
            // preprocessing

            /**
             * Add an error to the local logs array, which may be sent later to this.$log or discarded.
             * @param {String} msgId
             * @param {Object} msgArgs
             */
            _logError : function (msgId, msgArgs) {
                this._errors.push({
                    msgId : msgId,
                    msgArgs : msgArgs
                });
            },

            /**
             * Log all errors.
             * @param {Array} array of errors
             * @param {Boolean} throwsErrors (default false)
             * @return {Boolean} True if there were no error, false otherwise.
             */
            __logAllErrors : function (errors, throwsErrors) {
                if (errors.length === 0) {
                    return true;
                }
                if (!throwsErrors) {
                    for (var i = 0; i < errors.length; i++) {
                        this.$logError(errors[i].msgId, errors[i].msgArgs);
                    }
                } else {
                    var error = new Error();
                    error.errors = errors;
                    throw error;
                }
                return false;
            },

            /**
             * Find the given type in the given bean package.
             * @param {aria.core.BaseTypes:Package} packageDef bean package
             * @param {String} typeName type name. May not contain ':'. Contains the path to the bean inside the package
             * bp.
             * @return {aria.core.BaseTypes:Bean} definition of the requested bean, or this._typeRefError if it could
             * not be found
             */
            __findTypeInBP : function (packageDef, typeName) {
                var path = {
                    '$properties' : packageDef.$beans
                };
                var typeParts = typeName.split('.');
                for (var i = 0; i < typeParts.length; i++) {
                    var elt = typeParts[i];
                    if (elt == '$contentType' && path.$contentType) {
                        // the content type of an Array or a Map can be used
                        // as a type elsewhere
                        path = path.$contentType;
                    } else if (typeof(path.$properties) == 'object' && path.$properties != null) {
                        path = path.$properties[elt];
                    } else {
                        path = null;
                    }
                    if (typeof(path) != 'object' || path == null) {
                        this._logError(this.INVALID_TYPE_REF, [typeName, this._currentBeanName, packageDef.$package]);
                        return this._typeRefError;
                    }
                }
                return path;
            },

            /**
             * Find a bean definition by its type name. It relies on the bean package currently being processed.
             * @param {String} typeName A string composed of two parts: 'namespace:value' where the namespace is
             * optional if the value refers a type defined in the package currently being processed.
             * @param {aria.core.BaseTypes:Package} packageDef reference package
             * @return {aria.core.BaseTypes:Bean} definition of the requested bean, or this._typeRefError if it could
             * not be found
             */
            __getTypeRef : function (typeName, packageDef) {
                var packageName, otherBP;
                var i = typeName.indexOf(':');
                // if no semicolumn, type is defined inside this package
                if (i == -1) {
                    packageName = packageDef.$package;
                    otherBP = packageDef;
                } else {
                    var ns = typeName.substr(0, i);
                    typeName = typeName.substr(i + 1);
                    packageName = (packageDef.$namespaces == null ? null : packageDef.$namespaces[ns]);
                    if (!packageName) {
                        this._logError(this.UNDEFINED_PREFIX, [ns, this._currentBeanName]);
                        return this._typeRefError;
                    }
                }

                var fullName = packageName + "." + typeName;
                var typeRef = this.__processedBeans[fullName];
                if (typeRef) {
                    return typeRef;
                }

                if (!otherBP) {
                    otherBP = this.__loadedBeans[packageName];
                    if (!otherBP) {
                        this._logError(this.MISSING_BEANSPACKAGE, [packageName, this._currentBeanName]);
                        return this._typeRefError;
                    }
                }

                typeRef = this.__findTypeInBP(otherBP, typeName);

                // update this type name with fully qualified name
                if (typeRef != this._typeError && !typeRef[this._MD_TYPENAME]) {
                    typeRef[this._MD_TYPENAME] = fullName;
                }

                return typeRef;
            },

            /**
             * Preprocess the given bean definition (if not already done) and return its base type.
             * @param {aria.core.BaseTypes:Bean} beanDef bean to be preprocessed
             * @param {String} beanName fully qualified name for this bean
             * @param {aria.core.BaseTypes:Package} packageDef reference package
             */
            _preprocessBean : function (beanDef, beanName, packageDef) {

                // used for error reporting
                this._currentBeanName = beanName;

                var baseType = beanDef[this._MD_BASETYPE];

                // check if base type is already defined for this bean definition (already preprocessed)
                if (baseType) {
                    return baseType;
                }

                beanDef[this._MD_TYPENAME] = beanName;

                // temporary value to avoid an infinite loop in case of a recursive type definition:
                beanDef[this._MD_BASETYPE] = this._typeBeingComputed;

                var typeName = beanDef.$type;
                var typeRef = this._typeRefError;

                // check if this is valid declared type
                if (typeof(typeName) != "string" || !typeName) {
                    this._logError(this.INVALID_TYPE_NAME, [beanDef[this._MD_TYPENAME], typeName]);
                    return this._typeError;
                } else {
                    // retrieve type reference
                    typeRef = this.__getTypeRef(typeName, packageDef);
                }

                // store parent type
                beanDef[this._MD_PARENTDEF] = typeRef;
                // update typeName with fully qualified typeName
                typeName = typeRef[this._MD_TYPENAME];

                // preprocess reference type if not done yet
                baseType = this._preprocessBean(typeRef, typeName, packageDef);
                if (baseType == this._typeBeingComputed) {
                    // a recursive definition is normal for base types
                    if (packageDef.$package == this._BASE_TYPES_PACKAGE) {
                        return this._getBuiltInBaseType(beanDef);
                    }
                    // there was a recursive type definition
                    this._logError(this.RECURSIVE_BEAN, beanDef[this._MD_TYPENAME]);
                    return this._typeError;
                }

                beanDef[this._MD_BASETYPE] = baseType;

                // check this bean definition with given base type
                if (!this.__checkBean(beanDef)) {
                    beanDef[this._MD_BASETYPE] = this._typeError;
                }

                // description inheritance
                if (!beanDef.$description && !typeRef[this._MD_BUILTIN]) {
                    beanDef.$description = typeRef.$description;
                }

                var hasNoDefault = !("$default" in beanDef), hasNoMandatory = !("$mandatory" in beanDef);

                // mandatory and default value inheritance
                if (hasNoDefault && hasNoMandatory) {
                    beanDef.$mandatory = false;
                    hasNoMandatory = false;
                }
                if (hasNoMandatory) {
                    beanDef.$mandatory = typeRef.$mandatory;
                }
                if (hasNoDefault && ("$default" in typeRef) && !beanDef.$mandatory) {
                    beanDef.$default = jsonUtils.copy(typeRef.$default);
                    // Even if the child does not redefine the default value, the child default value may end up being
                    // different from the parent default value
                    // e.g. if the child defines more sub-properties with default values
                    // so it's important to compute $strDefault again for each bean, and NOT to uncomment the following
                    // WRONG shortcut:
                    // beanDef.$simpleCopyType = typeRef.$simpleCopyType;
                    // beanDef.$strDefault = typeRef.$strDefault;
                }

                // apply baseType preprocessing if any
                if (baseType && baseType.preprocess) {
                    baseType.preprocess(beanDef, beanName, packageDef);
                }

                // if an error occur during preprocessing, return error type
                if (beanDef[this._MD_BASETYPE] == this._typeError) {
                    return this._typeError;
                }

                if (baseType && baseType.makeFastNorm && !beanDef.$fastNorm) {

                    // prepare with empty getDefault function
                    beanDef.$getDefault = Aria.returnNull;

                    // generate fast normalizer, if not provided
                    baseType.makeFastNorm(beanDef);
                }

                // apply default configuration.
                if ("$default" in beanDef) {

                    // there cannot be default and mandatory at the same time
                    if (beanDef.$mandatory === true) {
                        this._logError(this.BOTH_MANDATORY_DEFAULT, beanDef[this._MD_TYPENAME]);
                        return this._typeError;
                    }

                    // normalize default values in needed
                    if (this._options.checkDefaults) {

                        // save error state as normalization will erase it
                        var currentErrors = this._errors;
                        this._errors = [];

                        var errors = this._processJsonValidation({
                            beanDef : beanDef,
                            json : beanDef.$default
                        });

                        // restaure errors
                        this._errors = currentErrors;

                        if (errors.length > 0) {
                            this._logError(this.INVALID_DEFAULTVALUE, [beanDef.$default, beanDef[this._MD_TYPENAME],
                                    errors]);

                            return this._typeError;
                        }
                    }

                    var defaultValue = beanDef.$default;

                    // simpleCopyType help to fasten copy of element
                    if (!("$simpleCopyType" in beanDef)) {
                        beanDef.$simpleCopyType = !defaultValue || typeUtils.isString(defaultValue)
                                || typeUtils.isNumber(defaultValue) || defaultValue === true;
                    }

                    // strDefault is a string representation of the default value, used in fast normalization
                    if (!beanDef.$strDefault) {
                        // make a string with "reversible" set to true, or null if cannot convert
                        beanDef.$strDefault = jsonUtils.convertToJsonString(defaultValue, {
                            reversible : true
                        });
                        // getDefault is only used for types providing fast normalization
                        if (beanDef.$fastNorm) {
                            beanDef.$getDefault = new Function("return " + beanDef.$strDefault + ";");
                        }
                    }
                }

                // store processed bean definition
                this.__processedBeans[beanName] = beanDef;

                return baseType;
            },

            /**
             * Main function to preprocess a bean package definition. All dependencies should have already bean loaded.
             * @param {aria.core.BaseTypes:Package} def
             */
            __preprocessBP : function (def) {

                // prepare error stack
                this._errors = [];

                var beans = def.$beans;
                for (var beanName in beans) {
                    if (!beans.hasOwnProperty(beanName) || beanName.indexOf(':') != -1) {
                        continue;
                    }
                    // check that keys for beans are valid
                    if (!Aria.checkJsVarName(beanName)) {
                        this._logError(this.INVALID_NAME, [beanName, this._currentBeanName]);
                    }
                    this._preprocessBean(beans[beanName], def.$package + "." + beanName, def);
                }

                return this._errors;
            },

            /**
             * Preprocessing function for base types of package aria.core.JsonTypes
             * @param {aria.core.BaseTypes:Bean} beanDef
             */
            _getBuiltInBaseType : function (beanDef) {
                var typeDef = this.__baseTypes[beanDef.$type];
                this.$assert(298, typeDef != null);
                beanDef[this._MD_BUILTIN] = true;
                beanDef[this._MD_BASETYPE] = typeDef;
                beanDef[this._MD_TYPENAME] = [this._BASE_TYPES_PACKAGE, typeDef.typeName].join('.');
            },

            /**
             * Add the given base type to the list of errors. It is called from JsonTypesCheck.js.
             * @param {Object} typeDef [typeDef] { typeName: {String} name of the base type preprocess(beanDef):
             * (Function) executed during preprocessing process(args): (Function) executed during processing dontSkip:
             * {Boolean} if true, preprocess and process will still be called even when check is disabled
             */
            _addBaseType : function (typeDef) {
                this.__baseTypes[typeDef.typeName] = typeDef;
                if (!(typeDef.dontSkip || this._options.checkEnabled)) {
                    typeDef.process = null;
                    typeDef.preprocess = null;
                }
            },

            /**
             * Check that the given json complies with the given bean (recursive function).
             * @param {Object} args
             *
             * <pre>
             *  {
             *    dataHolder: //, container
             *    dataName: //, name of the property in the container
             *    value: //, current value
             *    beanDef: // bean definition used to check the value
             *    path : // Path in the current object being check
             *  }
             * </pre>
             */
            _checkType : function (args) {
                var beanDef = args.beanDef;
                var baseType = beanDef[this._MD_BASETYPE];
                if (args.value == null) {
                    if (beanDef.$mandatory) {
                        this._logError(this.MISSING_MANDATORY, [args.path, beanDef[this._MD_TYPENAME]]);
                    } else if ("$default" in beanDef && this._options.addDefaults) {
                        if (beanDef.$simpleCopyType) {
                            args.value = beanDef.$default;
                        } else {
                            args.value = jsonUtils.copy(beanDef.$default);
                        }
                        args.dataHolder[args.dataName] = args.value;
                    }
                    // if there is no value originally provided, we do not check it
                    // the default value should already have been checked in preprocessing
                    return;
                }
                if (baseType.process) {
                    baseType.process(args);
                }
            },

            /**
             * Get a bean from its string reference.
             * @param {String} The fully qualified bean name, ex: aria.widgets.calendar.CfgBeans.CalendarSettings
             * @return {aria.core.BaseTypes:Bean} The bean definition if strType is valid, or null otherwise.
             */
            _getBean : function (strType) {
                return this.__processedBeans[strType] || null;
            },

            /**
             * Process the validation of a Json object with the given bean definition.
             * @param args [args] { beanName/beanDef: beanName or beanDef json: structure to validate } Return the array
             * of errors.
             */
            _processJsonValidation : function (args) {
                var beanDef = (args.beanDef ? args.beanDef : this._getBean(args.beanName));
                if (!beanDef) {
                    this._errors = [];
                    this._logError(this.BEAN_NOT_FOUND, args.beanName);
                    return this._errors;
                }

                // default slow behaviour
                if (this._options.checkEnabled) {
                    this._errors = [];
                    // launching the validation process
                    this._checkType({
                        dataHolder : args,
                        dataName : 'json',
                        path : 'ROOT',
                        value : args.json,
                        beanDef : beanDef
                    });
                    var res = this._errors;
                    return res;
                } else {
                    if (beanDef.$fastNorm) {
                        args.json = beanDef.$fastNorm(args.json);
                    }
                    return [];
                }
            },

            /**
             * Called when preprocessing, just after having determined the type of bean. If beans check is enabled and
             * multitypes check is disabled, it checks that the bean is valid according to the corresponding schema in
             * aria.core.BaseTypes
             * @param {aria.core.BaseTypes:Bean} bean to check
             */
            __checkBean : function (beanDef) {
                if (this._options.checkBeans && (!this._options.checkMultiTypes)
                        && this.__loadedBeans[this._BEANS_SCHEMA_PACKAGE]) {
                    var baseType = beanDef[this._MD_BASETYPE];
                    if (baseType == this._typeError) {
                        return false;
                    }
                    var beanChecker = this._getBean(this._BEANS_SCHEMA_PACKAGE + '.' + baseType.typeName);
                    this.$assert(402, beanChecker != null); // every type must be defined in the schema

                    // make a copy of current errors as normalization will erase them
                    var currentErrors = this._errors;
                    var errors = this._processJsonValidation({
                        beanDef : beanChecker,
                        json : beanDef
                    });
                    // restaure errors
                    this._errors = currentErrors;

                    if (errors.length > 0) {
                        this._logError(this.BEANCHECK_FAILED, [this._currentBeanName, errors]);
                        return false;
                    }

                }
                return true;
            },

            /**
             * Load the specified beans package.
             * @param {String} bp beans package
             */
            __loadBeans : function (bp) {
                var noerrors = true;

                // bean definition will be available in the waiting beans
                var def = this.__waitingBeans[bp];
                delete this.__waitingBeans[bp];

                this.$assert(58, def);

                // validate incoming definition
                if (this._options.checkBeans && this.__loadedBeans[this._BEANS_SCHEMA_PACKAGE]) {
                    var bean = this._getBean(this._BEANS_SCHEMA_PACKAGE + '.Package');
                    this.$assert(428, bean != null);
                    noerrors = noerrors && this.__logAllErrors(this._processJsonValidation({
                        beanDef : bean,
                        json : def
                    }));
                }

                this._options.addDefaults = true;
                noerrors = noerrors && this.__logAllErrors(this.__preprocessBP(def));
                if (noerrors) {
                    this.__loadedBeans[bp] = def;
                    aria.core.ClassMgr.notifyClassLoad(bp);
                } else {
                    aria.core.ClassMgr.notifyClassLoadError(bp);
                }
            },

            // PUBLIC API

            /**
             * Base method used to declare beans. You should use Aria. beanDefinitions instead of this method.
             * @param {aria.core.BaseTypes:Package} beans beans package to declare
             */
            beanDefinitions : function (def) {
                var bp = def.$package; // beans package
                Aria.$classes.push({
                    $classpath : bp
                });
                this.__waitingBeans[bp] = def;
                var dep = [];

                // load missing dependencies
                if (this._options.checkBeans && !this.__loadedBeans[this._BEANS_SCHEMA_PACKAGE]
                        && bp != this._BEANS_SCHEMA_PACKAGE && bp != this._BASE_TYPES_PACKAGE) {
                    // if checking beans is required, add the corresponding schema for that
                    dep.push(this._BEANS_SCHEMA_PACKAGE);
                }

                // add $dependencies
                var dependencies = def.$dependencies || [];
                if (dependencies.length) {
                    dep = dep.concat(dependencies);
                }

                // add bean definition from namespaces
                for (var key in def.$namespaces) {
                    if (def.$namespaces.hasOwnProperty(key)) {
                        dep.push(def.$namespaces[key]);
                    }
                }

                var dpMap = {
                    "JS" : dep
                };

                var doLoad = aria.core.ClassMgr.loadClassDependencies(bp, dpMap, {
                    fn : this.__loadBeans,
                    scope : this,
                    args : bp
                });

                // load definition
                if (doLoad) {
                    this.__loadBeans(bp);
                }
            },

            /**
             * Check that the json structure complies with the given bean and add default values. All errors are logged.
             * @param {Object} args
             *
             * <pre>
             *  {
             *    json: json to check.
             *    beanName: bean to use
             *  }
             * </pre>
             *
             * @param {Boolean} throwsErrors (default false)
             * @return {Boolean} true if the json structure complies with the given bean, false otherwise
             */
            normalize : function (args, throwsErrors) {
                this._options.addDefaults = true;
                // publicly allowing the user to give the bean definition without it
                // being loaded is not supported:
                args.beanDef = null;
                return this.__logAllErrors(this._processJsonValidation(args), throwsErrors);
            },

            /**
             * Check that the json structure complies with the given bean. All errors are logged.
             * @param {Object} json json to check;
             * @param {String} bean bean to use
             * @param {Boolean} throwsErrors (default false)
             * @return {Boolean} true if the json structure complies with the given bean, false otherwise
             */
            check : function (json, beanName, throwsErrors) {
                if (!this._options.checkEnabled) {
                    return true;
                }
                this._options.addDefaults = false;
                return this.__logAllErrors(this._processJsonValidation({
                    json : json,
                    beanName : beanName
                }), throwsErrors);
            },

            /**
             * Validate a configuration object compared to its definition. All errors are logged.
             * @param {String} cfgBeanName The configuration classpath;
             * @param {Object} cfg The configuration bean to validate
             * @param {Object} errorToLog Optional json. By default, the INVALID_CONFIGURATION message is used with the conrfiguration bean name.
             * <pre>
             * {
             *      msg : {String} log message used with $logError,
             *      params : {Array} parameters used with $logError,
             * }
             * </pre>
             * @return {Boolean} true if the configuration is valid.
             */
            validateCfg : function (cfgBeanName, cfg, errorToLog) {
                var cfgOk = false;
                try {
                    cfgOk = this.normalize({
                        json : cfg,
                        beanName : cfgBeanName
                    }, true);
                } catch (e) {
                    // aria.core.Log may not be available
                    var logs = aria.core.Log;
                    if (logs) {
                        var error, errors = e.errors;
                        for (var index = 0, l = errors.length; index < l; index++) {
                            error = errors[index];
                            error.message = logs.prepareLoggedMessage(error.msgId, error.msgArgs);
                        }

                        errorToLog = errorToLog || {msg: this.INVALID_CONFIGURATION, params : [cfgBeanName]};
                        this.$logError(errorToLog.msg, errorToLog.params, e);
                    }
                }
                return cfgOk;
            },

            /**
             * Get a bean from its string reference.
             * @param {String} The fully qualified bean name, ex: aria.widgets.calendar.CfgBeans.CalendarSettings
             * @return {MultiTypes} The bean definition if it exists and is loaded, or null otherwise.
             */
            getBean : function (beanName) {
                return this._getBean(beanName);
            }
        }
    });
})();
(function () {
    /*
     * Note: this class is tightly linked with JsonValidator, to keep files with a reasonnable size It is normal for
     * this class to call protected methods in JsonValidator (method whose name starts with only one underscore)
     */

    // shortcuts
    var jv;
    var typeUtils;

    /**
     * Utility function which logs a bad type error.
     * @private
     * @param {Object} baseType
     * @param {Object} args
     */
    var __badTypeError = function (baseType, args) {
        jv._logError(jv.INVALID_TYPE_VALUE, [baseType.typeName, args.beanDef[jv._MD_TYPENAME], args.value, args.path]);
    };

    /**
     * Check that childType inherits from parentType and log any error.
     * @private
     */
    var __checkInheritance = function (parentType, childType) {
        if (!jv._options.checkInheritance) {
            return true;
        }
        var typeRef = childType;
        while (!typeRef[jv._MD_BUILTIN]) {
            if (parentType == typeRef) {
                return true;
            }
            typeRef = typeRef[jv._MD_PARENTDEF];
        }
        jv._logError(jv.INHERITANCE_EXPECTED, [childType[jv._MD_TYPENAME], parentType[jv._MD_TYPENAME]]);
        return false;
    };

    /**
     * Preprocess the content type of the given bean definition
     * @private
     * @param {aria.core.BaseTypes:Bean} beanDef bean to be preprocessed
     * @param {String} beanName fully qualified name for this bean
     * @param {aria.core.BaseTypes:Package} packageDef reference package
     */
    var __checkContentType = function (beanDef, beanName, packageDef) {
        var contentType = beanDef.$contentType;
        var parentContentType = null;
        var parent = beanDef[jv._MD_PARENTDEF];
        if (!parent[jv._MD_BUILTIN]) {
            parentContentType = parent.$contentType;
            if (contentType == null) {
                beanDef.$contentType = parentContentType;
                return;
            }
        } else if (contentType == null) {
            jv._logError(jv.MISSING_CONTENTTYPE, [beanDef[jv._MD_BASETYPE].typeName, beanDef[jv._MD_TYPENAME]]);
            beanDef[jv._MD_BASETYPE] = jv._typeError;
            return;
        }
        jv._preprocessBean(contentType, beanName + ".$contentType", packageDef);
        if (parentContentType != null) {
            __checkInheritance(parentContentType, contentType);
        }
    };

    /**
     * Preprocess the key type of the given bean definition
     * @private
     * @param {aria.core.BaseTypes:Bean} beanDef bean to be preprocessed
     * @param {String} beanName fully qualified name for this bean
     * @param {aria.core.BaseTypes:Package} packageDef reference package
     */
    var __checkKeyType = function (beanDef, beanName, packageDef) {
        var keyType = beanDef.$keyType;
        var parentKeyType = null;
        var parent = beanDef[jv._MD_PARENTDEF];
        if (!parent[jv._MD_BUILTIN]) {
            parentKeyType = parent.$keyType;
            if (keyType == null) {
                beanDef.$keyType = parentKeyType;
                return;
            }
        } else if (keyType == null) {
            // keyType not specified
            return;
        }
        jv._preprocessBean(keyType, beanName + ".$keyType", packageDef);
        if (parentKeyType != null) {
            __checkInheritance(parentKeyType, keyType);
        }
        // in all cases, keyType must be a sub-type of aria.core.JsonTypes.String
        if (keyType[jv._MD_BASETYPE].typeName != "String") {
            jv._logError(jv.INHERITANCE_EXPECTED, [keyType[jv._MD_TYPENAME], jv._BASE_TYPES_PACKAGE + ".String"]);
            return;
        }
    };

    /**
     * Processing function for regular expressions
     * @private
     */
    var __checkRegExp = function (args) {
        if (typeof(args.value) != 'string') {
            return __badTypeError(this, args); // this refers to the correct object (a base type)
        }
        var beanDef = args.beanDef;
        while (!beanDef[jv._MD_BUILTIN]) {
            var regexp = beanDef.$regExp;
            if (regexp != null) {
                if (!regexp.test(args.value)) {
                    return jv._logError(jv.REGEXP_FAILED, [args.value, args.path, regexp, beanDef[jv._MD_TYPENAME]]);
                }
            }
            beanDef = beanDef[jv._MD_PARENTDEF];
        }
    };

    /**
     * Common preprocessing function for floats and integers.
     * @private
     * @param {aria.core.BaseTypes:Bean} beanDef
     */
    var __numberPreprocess = function (beanDef) {
        var parent = beanDef[jv._MD_PARENTDEF];
        if (typeof(parent.$minValue) != "undefined") {
            if (typeof(beanDef.$minValue) == "undefined") {
                beanDef.$minValue = parent.$minValue;
            } else if (beanDef.$minValue < parent.$minValue) {
                jv._logError(jv.NUMBER_INVALID_INHERITANCE, ["$minValue", beanDef[jv._MD_TYPENAME]]);
            }
        }
        if (typeof(parent.$maxValue) != "undefined") {
            if (typeof(beanDef.$maxValue) == "undefined") {
                beanDef.$maxValue = parent.$maxValue;
            } else if (beanDef.$maxValue > parent.$maxValue) {
                jv._logError(jv.NUMBER_INVALID_INHERITANCE, ["$maxValue", beanDef[jv._MD_TYPENAME]]);
            }
        }
        if (typeof(beanDef.$minValue) != "undefined" && typeof(beanDef.$maxValue) != "undefined"
                && beanDef.$minValue > beanDef.$maxValue) {
            jv._logError(jv.NUMBER_INVALID_RANGE, [beanDef[jv._MD_TYPENAME], beanDef.$minValue, beanDef.$maxValue]);
        }
    };

    /**
     * Common processing function for floats and integers.
     * @private
     * @param {Object} args
     */
    var __numberProcess = function (args) {
        var v = args.value;
        var beanDef = args.beanDef;
        if (typeof(v) != 'number') {
            return __badTypeError(this, args);
        }
        if (typeof(beanDef.$minValue) != "undefined" && v < beanDef.$minValue) {
            return jv._logError(jv.NUMBER_RANGE, [args.value, args.path, "$minValue", beanDef.$minValue]);
        }
        if (typeof(beanDef.$maxValue) != "undefined" && v > beanDef.$maxValue) {
            return jv._logError(jv.NUMBER_RANGE, [args.value, args.path, "$maxValue", beanDef.$maxValue]);
        }
    };

    /**
     * List of base types. Contains object like
     * @type Array
     * @private
     *
     * <pre>
     *     {
     *         typeName : // base type name
     *      process : // processing method for value checking and normalization
     *      dontSkip : // specifies that this bean have to be preprocessed in any case
     *      preprocess : // prepocessing function, used during bean preprocessing
     *     }
     * </pre>
     */
    var baseTypes = [{
                typeName : "String",
                process : __checkRegExp
            }, {
                typeName : "Boolean",
                process : function (args) {
                    if (typeof(args.value) != 'boolean') {
                        return __badTypeError(this, args);
                    }
                }
            }, {
                typeName : "JsonProperty",
                process : function (args) {
                    if (typeof(args.value) == 'string') {
                        if (Aria.isJsReservedWord(args.value)
                                || !/^([a-zA-Z_\$][\w\$]*(:[\w\$]*)?)|(\d+)$/.test(args.value)) {
                            return __badTypeError(this, args);
                        }
                    } else if (typeof(args.value) != 'number' || parseInt(args.value, 10) != args.value) {
                        return __badTypeError(this, args);
                    }
                }
            }, {
                typeName : "FunctionRef",
                process : function (args) {
                    if (typeof(args.value) != 'function') {
                        return __badTypeError(this, args);
                    }
                }
            }, {
                typeName : "Date",
                process : function (args) {
                    if (isNaN(Date.parse(args.value))) {
                        return __badTypeError(this, args);
                    }

                }
            }, {
                typeName : "RegExp",
                process : function (args) {
                    var v = args.value;
                    // In FireFox and IE: typeof(regexp)=='object'
                    // whereas with Safari, typeof(regexp)=='function'
                    if ((typeof(v) != 'object' && typeof(v) != 'function') || v == null || v.constructor != RegExp) {
                        return __badTypeError(this, args);
                    }
                }
            }, {
                typeName : "ObjectRef",
                process : function (args) {
                    if (typeof(args.value) != 'object' || args.value == null) {
                        return __badTypeError(this, args);
                    }
                    var classpath = args.beanDef.$classpath;
                    if (classpath && !typeUtils.isInstanceOf(args.value, classpath)) {
                        jv._logError(jv.NOT_OF_SPECIFIED_CLASSPATH, [classpath, args.beanDef[jv._MD_TYPENAME],
                                args.value, args.path]);
                        return;
                    }
                }
            },

            // base type with preprocessing

            {
                typeName : "Integer",
                preprocess : __numberPreprocess,
                process : function (args) {
                    if (parseInt(args.value, 10) !== args.value) {
                        return __badTypeError(this, args);
                    }
                    __numberProcess.call(this, args);
                }
            }, {
                typeName : "Float",
                preprocess : __numberPreprocess,
                process : __numberProcess
            }, {
                typeName : "Enum",
                preprocess : function (beanDef) {
                    var ev = beanDef.$enumValues;
                    var parent = beanDef[jv._MD_PARENTDEF];
                    var pmap = null;
                    if (!parent[jv._MD_BUILTIN]) {
                        pmap = parent[jv._MD_ENUMVALUESMAP];
                        if (ev == null) {
                            beanDef[jv._MD_ENUMVALUESMAP] = pmap;
                            return;
                        }
                    } else if (ev == null || ev.length === 0) {
                        ev = [];
                        jv._logError(jv.MISSING_ENUMVALUES, [beanDef[jv._MD_TYPENAME]]);
                    }
                    var map = {};
                    for (var i = 0; i < ev.length; i++) {
                        var v = ev[i];
                        if (map[v] == 1) {
                            jv._logError(jv.ENUM_DUPLICATED_VALUE, [v, beanDef[jv._MD_TYPENAME]]);
                        } else if (pmap && pmap[v] != 1) {
                            jv._logError(jv.ENUM_INVALID_INHERITANCE, [v, beanDef[jv._MD_TYPENAME],
                                    parent[jv._MD_TYPENAME]]);
                        } else {
                            map[v] = 1;
                        }
                    }
                    beanDef[jv._MD_ENUMVALUESMAP] = map;
                },
                process : function (args) {
                    if (typeof(args.value) != 'string') {
                        return __badTypeError(this, args);
                    }
                    var map = args.beanDef[jv._MD_ENUMVALUESMAP];
                    if (map[args.value] != 1) {
                        jv._logError(jv.ENUM_UNKNOWN_VALUE, [args.value, args.path, args.beanDef[jv._MD_TYPENAME]]);
                    }
                }
            }, {
                typeName : "Object",
                dontSkip : true,
                preprocess : function (beanDef, beanName, packageDef) {
                    /* this function is used for the inheritance of properties */
                    /* at this stage, the parent has already bean processed */
                    var prop = beanDef.$properties;
                    if (!prop) {
                        prop = {};
                        beanDef.$properties = prop;
                    }
                    var parentBean = beanDef[jv._MD_PARENTDEF];

                    // normalize properties based on parent properties
                    beanDef.$restricted = (beanDef.$restricted === false) ? false : (parentBean.$restricted !== false);
                    var parentProp = parentBean.$properties;

                    // apply parent properties on this child properties
                    for (var i in parentProp) {
                        if (!parentProp.hasOwnProperty(i) || i.indexOf(':') != -1 || i.charAt(0) == '_') {
                            continue;
                        }
                        var propDef = parentProp[i];
                        var newDef = prop[i];

                        if (!newDef) {
                            // copy inherited bean definition (no override)
                            prop[i] = propDef;
                        } else {
                            // override
                            jv._preprocessBean(newDef, beanName + ".$properties." + i, packageDef);
                            // if override ans parentDef, check inheritance
                            if (propDef) {
                                __checkInheritance(propDef, newDef);
                            }
                        }
                    }

                    // process all childs of object
                    for (var key in prop) {
                        if (!prop.hasOwnProperty(key) || key.indexOf(':') != -1 || key.charAt(0) == '_') {
                            continue;
                        }
                        // check that keys for beans are valid
                        if (!Aria.checkJsVarName(key)) {
                            jv._logError(jv.INVALID_NAME, [key, jv._currentBeanName]);
                        }
                        jv._preprocessBean(prop[key], beanName + ".$properties." + key, packageDef);
                    }

                },
                process : function (args) {
                    var value = args.value, beanDef = args.beanDef;
                    if (typeof(value) != 'object' || value == null) {
                        return __badTypeError(this, args);
                    }
                    var propdef = beanDef.$properties;
                    // copying property names (ignoring meta-data):
                    var propnames = {};
                    if (jv._options.checkEnabled && beanDef.$restricted) {
                        for (var i in value) {
                            if (!value.hasOwnProperty(i) || i.indexOf(':') != -1 || i.charAt(0) == '_') {
                                continue;
                            }
                            propnames[i] = 1;
                        }
                    }
                    for (var i in propdef) {
                        if (!propdef.hasOwnProperty(i) || i.indexOf(':') != -1 || i.charAt(0) == '_') {
                            continue;
                        }
                        var subBeanDef = propdef[i];
                        delete propnames[i];
                        jv._checkType({
                            dataHolder : value,
                            dataName : i,
                            value : value[i],
                            beanDef : subBeanDef,
                            path : args.path + '["' + i + '"]'
                        });
                    }
                    if (jv._options.checkEnabled && beanDef.$restricted) {
                        for (var i in propnames) {
                            if (value.hasOwnProperty(i) && propnames[i] == 1) {
                                // properties which stay in propnames after removing all that are in propdef
                                // are invalid
                                jv._logError(jv.UNDEFINED_PROPERTY, [i, args.path, beanDef[jv._MD_TYPENAME]]);
                            }
                        }
                    }
                },
                makeFastNorm : function (beanDef) {
                    var strBuffer = ["var beanProperties = this.$properties;"];
                    strBuffer.push("if (!obj) { return this.$getDefault(); }");

                    var properties = beanDef.$properties;

                    // loop over properties to generate normalizers
                    var hasProperties = false;
                    for (var propertyName in properties) {
                        if (!properties.hasOwnProperty(propertyName) || propertyName.indexOf(':') != -1
                                || propertyName.charAt(0) == '_') {
                            continue;
                        }
                        var property = properties[propertyName];
                        if ("$strDefault" in property) {
                            hasProperties = true;
                            strBuffer.push("if (obj['" + propertyName + "'] == null) { obj['" + propertyName + "']  = "
                                    + property.$strDefault + "}");
                            if (property.$fastNorm) {
                                strBuffer.push("else { beanProperties['" + propertyName + "'].$fastNorm(obj['"
                                        + propertyName + "']); }");
                            }
                        } else if (property.$fastNorm) {
                            hasProperties = true;
                            // PTR 04546401 : Even if they have no default values, Objects might have subproperties with
                            // default values
                            // These properties should be normalized as well
                            strBuffer.push("if (obj['" + propertyName + "'] != null) { beanProperties['" + propertyName
                                    + "'].$fastNorm(obj['" + propertyName + "']);}");
                        }
                    }
                    strBuffer.push("return obj;");

                    if (hasProperties) {
                        beanDef.$fastNorm = new Function("obj", strBuffer.join("\n"));
                    } else {
                        beanDef.$fastNorm = fastNormalizers.emptyObject;
                    }
                }
            }, {
                typeName : "Array",
                dontSkip : true,
                preprocess : __checkContentType,
                process : function (args) {
                    var v = args.value;
                    if (typeof(v) != 'object' || v == null || v.constructor != Array) {
                        return __badTypeError(this, args);
                    }
                    var ct = args.beanDef.$contentType;
                    for (var i = 0; i < v.length; i++) {
                        jv._checkType({
                            dataHolder : v,
                            dataName : i,
                            value : v[i],
                            beanDef : ct,
                            path : args.path + '["' + i + '"]'
                        });
                    }
                },
                makeFastNorm : function (beanDef) {
                    // if content type is simple, no fast normalization is required
                    if (!beanDef.$contentType.$fastNorm) {
                        return;
                    }
                    beanDef.$fastNorm = fastNormalizers.array;
                }
            }, {
                typeName : "Map",
                dontSkip : true,
                preprocess : function (beanDef, beanName, packageDef) {
                    __checkContentType(beanDef, beanName, packageDef);
                    __checkKeyType(beanDef, beanName, packageDef);
                },
                process : function (args) {
                    var v = args.value;
                    if (typeof(v) != 'object' || v == null) {
                        return __badTypeError(this, args);
                    }
                    var ct = args.beanDef.$contentType;
                    var keyType = args.beanDef.$keyType;
                    for (var i in v) {
                        if (!v.hasOwnProperty(i)) {
                            continue;
                        }
                        if (keyType) {
                            jv._checkType({
                                dataHolder : v,
                                dataName : null,
                                value : i,
                                beanDef : keyType,
                                path : args.path
                            });
                        }
                        jv._checkType({
                            dataHolder : v,
                            dataName : i,
                            value : v[i],
                            beanDef : ct,
                            path : args.path + '["' + i + '"]'
                        });
                    }
                },
                makeFastNorm : function (beanDef) {
                    // if content type is simple, no fast normalization is required
                    if (!beanDef.$contentType.$fastNorm) {
                        return;
                    }
                    beanDef.$fastNorm = fastNormalizers.map;
                }
            }, {
                typeName : "MultiTypes",
                preprocess : function (beanDef, beanName, packageDef) {
                    /* A MultiTypes does not check inheritance */
                    var contentTypes = beanDef.$contentTypes;
                    var parent = beanDef[jv._MD_PARENTDEF];
                    if (!parent[jv._MD_BUILTIN]) {
                        if (contentTypes == null) {
                            beanDef.$contentTypes = parent.$contentTypes;
                            return;
                        }
                    }
                    if (contentTypes == null) {
                        // no content type: no check should be done in this case
                        return;
                    }
                    for (var i = 0; i < contentTypes.length; i++) {
                        jv._preprocessBean(contentTypes[i], beanName + ".$contentTypes[" + i + "]", packageDef);
                    }
                },
                process : function (args) {
                    if (!jv._options.checkMultiTypes) {
                        return;
                    }
                    var contentTypes = args.beanDef.$contentTypes;
                    if (contentTypes == null) {
                        // no content types: no check should be done in this case
                        return;
                    }
                    var saveErrors = jv._errors;
                    var errors = []; // array of {beanDef: /* one of the content types */, errors: [ /* array of
                    // errors */]}
                    for (var i = 0; i < contentTypes.length; i++) {
                        var beanDef = contentTypes[i];
                        // save current stack of error
                        jv._errors = [];
                        jv._checkType({
                            dataHolder : args.dataHolder,
                            dataName : args.dataName,
                            value : args.value,
                            beanDef : beanDef,
                            path : args.path
                        });
                        if (jv._errors.length === 0) {
                            // no error for this type, we forget about any error for other types
                            jv._errors = saveErrors;
                            return;
                        }
                        errors.push({
                            beanDef : beanDef,
                            errors : jv._errors
                        });
                    }
                    jv._errors = saveErrors;
                    jv._logError(jv.INVALID_MULTITYPES_VALUE, [args.path, args.beanDef[jv._MD_TYPENAME], errors]);
                }
            }];

    /**
     * List of fast normalizers functions used by makeFastNorm functions. These are the common functions for simple
     * beans. Having them once here reduces the memory needed to create a new Function for every bean property
     * @type Object
     * @private
     */
    var fastNormalizers = {
        emptyObject : function (obj) {
            if (!obj) {
                return this.$getDefault();
            }

            return obj;
        },

        array : function (obj) {
            if (!obj) {
                return this.$getDefault();
            }
            for (var i = 0, l = obj.length; i < l; i++) {
                this.$contentType.$fastNorm(obj[i]);
            }
            return obj;
        },

        map : function (obj) {
            if (!obj) {
                return this.$getDefault();
            }
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    this.$contentType.$fastNorm(obj[key]);
                }
            }
            return obj;
        }
    };

    /**
     * Contains the definition of base types used by the JsonValidator.
     */
    Aria.classDefinition({
        $classpath : "aria.core.JsonTypesCheck",
        $singleton : true,
        $constructor : function () {
            // define shortcuts
            jv = aria.core.JsonValidator;
            typeUtils = aria.utils.Type;

            // add base types to json validator
            for (var index = 0, length = baseTypes.length; index < length; index++) {
                jv._addBaseType(baseTypes[index]);
            }
        },
        $destructor : function () {
            jv = null;
            typeUtils = null;
        },
        $prototype : {}
    });
})();
/**
 * Definition of all base types used in JSON schemas
 */
Aria.beanDefinitions({
    $package : "aria.core.JsonTypes",
    $description : "Definition of all base types used in JSON schemas",
    $beans : {
        /* In this file, recursive types are considered as built-in types. */
        /**
         * Simple types
         */
        "String" : {
            $type : "String",
            $description : "Correspond to any possible JavaScript string or characters. Its acceptable values can be restricted by the use of a $regExp property in the schema.",
            $sample : "Some text\non 2 lines!"
        },
        "Boolean" : {
            $type : "Boolean",
            $description : "Correspond to a JavaScript boolean: true or false",
            $sample : true
        },
        "Integer" : {
            $type : "Integer",
            $description : "Correspond to an integer. Its acceptable range can be restricted by the use of the $minValue and $maxValue properties in the schema.",
            $sample : 186
        },
        "Float" : {
            $type : "Float",
            $description : "Correspond to a floating point number. Its acceptable range can be restricted by the use of the $minValue and $maxValue properties in the schema.",
            $sample : 18.6
        },
        "Date" : {
            $type : "Date",
            $description : "Correspond to a date string that can be converted to a JavaScript date",
            $sample : "12/13/2009"
        },
        "RegExp" : {
            $type : "RegExp",
            $description : "Correspond to a JavaScript regular expression",
            $sample : /^\w([\w\.]*\w)?$/
        },
        "ObjectRef" : {
            $type : "ObjectRef",
            $description : "Reference to a JavaScript object located outside the JSON structure"
        },
        "FunctionRef" : {
            $type : "FunctionRef",
            $description : "Reference to a JavaScript function."
        },
        "JsonProperty" : {
            $type : "JsonProperty",
            $description : "Any string or integer that can be used as JSON property - must not be a JavaScript reserved word to avoid potential issues with some browsers",
            $sample : "name"
        },
        "Enum" : {
            $type : "Enum",
            $description : "String that can only take a limited number of values - which must be described in the $enumValues Array associated to the element description"
        },
        /**
         * Complex types
         */
        "Object" : {
            $type : "Object",
            $description : "Correspond a structure to with defined parameters : unlike maps, property names are clearly defined. However properties may not be present if not mandatory, and if object is not restricted, other properties might be available. Object description, property name and types must be described in the $properties map of the object schema."
        },
        "Array" : {
            $type : "Array",
            $description : "Correspond to variable-length structure where items are indexed with an integer (first = 0). An array contains items of the same type (which can be a MultiTypes), which is described in the $contentType object of the schema description."
        },
        "Map" : {
            $type : "Map",
            $description : "Like Arrays, Maps correspond to variable-length structure - but contrary to Arrays, Map items are indexed with strings. A map contains items of the same type (which can be a MultiTypes), which is described in the $contentType object of the schema description."
        },
        "MultiTypes" : {
            $type : "MultiTypes",
            $description : "A multi type element is an element that can reference items of different types. As such, its possible types should be described in the $contentTypes array of the schema description."
        },
        /**
         * Commonly used types (not built-in)
         */
        "PackageName" : {
            $type : "String",
            $description : "A string which contains a complete path to a package or a class.",
            $sample : "aria.core.JsonTypes",
            $regExp : /^([a-zA-Z_\$][\w\$]*($|\.(?=.)))+$/
        }
    }
});
/**
 * Definition of all base beans used in all JSON schemas
 */
Aria.beanDefinitions({
    $package : "aria.core.BaseTypes",
    $description : "Definition of all base beans used in all JSON schemas",
    $namespaces : {
        "json" : "aria.core.JsonTypes"
    },
    $beans : {
        "Package" : {
            $type : "json:Object",
            $description : "Definition of a bean package, which is the root element of a JSON schema. A bean package groups together a set of bean definitions with a common purpose.",
            $properties : {
                "$package" : {
                    $type : "json:PackageName",
                    $description : "Complete path of the bean package which is being defined.",
                    $mandatory : true
                },
                "$description" : {
                    $type : "json:String",
                    $description : "A literal description of the package and its purpose."
                },

                "$dependencies" : {
                    $type : "json:Array",
                    $description : "Contains an array of dependencies to be loaded for the bean package.",
                    $contentType : {
                        $type : "json:String",
                        $description : "The class path for the dependency to be loaded."
                    }
                },

                "$namespaces" : {
                    $type : "json:Map",
                    $description : "A map containing all the external bean packages referenced in this package. The key in the map is the prefix used in this package to refer to the imported package. The value is the complete path of the imported package.",
                    $contentType : {
                        $type : "json:PackageName",
                        $mandatory : true,
                        $description : "Complete path of the bean package to be imported."
                    }
                },
                "$beans" : {
                    $type : "json:Map",
                    $description : "Map of beans. The key in the map is the name of the bean, which must be a valid variable name in the JavaScript language.",
                    $mandatory : true,
                    $contentType : {
                        $type : "Bean",
                        $mandatory : true
                    }
                }
            }
        },
        "ElementType" : {
            $type : "json:String",
            $description : "A string composed of two parts: 'namespace:value' where the namespace is optional if the value refers a type defined in the same package. The type value must correspond to a type structure defined in a JSON schema",
            $mandatory : true,
            $regExp : /^([a-zA-Z_\$][\w\$]*:)?([a-zA-Z_\$][\w\$]*($|\.))+$/,
            $sample : "json:Boolean"
        },
        "Bean" : {
            $type : "json:MultiTypes",
            $description : "Any schema element. Schema elements are represented as JSON objects, which describe the element schema. Depending on its $type an element can correspond to a JSON value (simple type) or to a JSON object or array (complex type)",
            $contentTypes : [{
                        $type : "String"
                    }, {
                        $type : "Boolean"
                    }, {
                        $type : "Integer"
                    }, {
                        $type : "Float"
                    }, {
                        $type : "Date"
                    }, {
                        $type : "RegExp"
                    }, {
                        $type : "ObjectRef"
                    }, {
                        $type : "FunctionRef"
                    }, {
                        $type : "Enum"
                    }, {
                        $type : "Object"
                    }, {
                        $type : "Array"
                    }, {
                        $type : "Map"
                    }, {
                        $type : "MultiTypes"
                    }]
        },
        // Root type - from which all other element inherits
        "Element" : {
            $type : "json:Object",
            $description : "Base JSON schema element from which all other schema element inherits. Schema elements are represented as JSON objects, the element name being the property name referencing the object whereas the object content is used to describe the element schema. Depending on its $type an element can correspond to a JSON value (simple type) or to a JSON object or array (complex type)",
            $properties : {
                "$description" : {
                    $type : "json:String",
                    $description : "A literal description of the element - its purpose and possible constraints",
                    $mandatory : false
                },
                "$type" : {
                    $type : "ElementType",
                    $mandatory : true
                },
                "$sample" : {
                    $type : "json:MultiTypes",
                    $description : "Example of what such an element can look like - can be any possible JSON value, object or array",
                    $mandatory : false
                },
                "$default" : {
                    $type : "json:MultiTypes",
                    $description : "Default value associated to this type - if provided, the $mandatory attribute is considered as false",
                    $mandatory : false
                },
                "$mandatory" : {
                    $type : "json:Boolean",
                    $description : "Tells if the element must be provided for the JSON object to be valid",
                    $mandatory : false
                }
            }
        },

        // Simple Types (don't contain sub-elements)
        "String" : {
            $type : "Element",
            $description : "Correspond to any possible JavaScript string or characters. Its acceptable values can be restricted by the use of a $regExp property in the schema.",
            $properties : {
                "$regExp" : {
                    $type : "json:RegExp",
                    $description : "Regular expression that the string must match"
                }
            }
        },
        "Boolean" : {
            $type : "Element",
            $description : "Correspond to a JavaScript boolean: true or false"
        },
        "Integer" : {
            $type : "Element",
            $description : "Correspond to an integer. Its acceptable range can be restricted by the use of the $minValue and $maxValue properties in the schema.",
            $properties : {
                $minValue : {
                    $type : "json:Integer",
                    $description : "The minimum value of the integer. Must be inferior to $maxValue, if both are provided."
                },
                $maxValue : {
                    $type : "json:Integer",
                    $description : "The maximum value of the integer. Must be superior to $minValue, if both are provided."
                }
            }
        },
        "Float" : {
            $type : "Element",
            $description : "Correspond to a floating point number. Its acceptable range can be restricted by the use of the $minValue and $maxValue properties in the schema.",
            $properties : {
                $minValue : {
                    $type : "json:Float",
                    $description : "The minimum value of the floating point number. Must be inferior to $maxValue, if both are provided."
                },
                $maxValue : {
                    $type : "json:Float",
                    $description : "The maximum value of the floating point number. Must be inferior to $maxValue, if both are provided."
                }
            }
        },
        "Date" : {
            $type : "Element",
            $description : "Correspond to a date string that can be converted to a JavaScript date"
        },
        "RegExp" : {
            $type : "Element",
            $description : "Correspond to a JavaScript regular expression."
        },
        "ObjectRef" : {
            $type : "Element",
            $description : "Correspond to any JavaScript object, but whose properties will not be checked with the schema.",
            $properties : {
                "$classpath" : {
                    $type : "json:PackageName",
                    $description : "If defined, the object will be checked that it is an instance of a class with that classpath."
                }
            }
        },
        "FunctionRef" : {
            $type : "Element",
            $description : "Correspond to a JavaScript function."
        },
        "JsonProperty" : {
            $type : "Element",
            $description : "Any string or integer that can be used as JSON property - must not be a JavaScript reserved word to avoid potential issues with some browsers"
        },
        "Enum" : {
            $type : "Element",
            $description : "String that can only take a limited number of values - which must be described in the $enumValues Array associated to the element description",
            $properties : {
                "$enumValues" : {
                    $type : "json:Array",
                    $description : "Array of accepted string values for the enum.",
                    $contentType : {
                        $type : "json:String",
                        $mandatory : true,
                        $description : "A possible value for the enum."
                    }
                }
            }
        },

        // Complex Types (contain sub elements)
        "Object" : {
            $type : "Element",
            $description : "Correspond a structure to with defined parameters : unlike maps, property names are clearly defined. However properties may not be present if not mandatory, and if object is not restricted, other properties might be available. Object description, property name and types must be described in the $properties map of the object schema.",
            $properties : {
                "$properties" : {
                    $type : "json:Map",
                    $description : "The list of all properties associated to the object. These properties will complement or override the properties defined in the object's parent (cf. $type value).",
                    $contentType : {
                        $type : "Bean",
                        $mandatory : true,
                        $description : "Type of the property."
                    }
                },
                "$restricted" : {
                    $type : "json:Boolean",
                    $description : "Specifies if the object may or may not accept properties not defined in its definition. Default is restricted.",
                    $default : true
                },
                "$fastNorm" : {
                    $type : "json:FunctionRef",
                    $description : "Fast normalization function for this type. Automatically added by the framework."
                },
                "$getDefault" : {
                    $type : "json:FunctionRef",
                    $description : "Return default value. Automatically added by the framework."
                }
            }
        },
        "Array" : {
            $type : "Element",
            $description : "Correspond to variable-length structure where items are indexed with an integer (first = 0). An array contains items of the same type (which can be a MultiTypes), which is described in the $contentType object of the schema description.",
            $properties : {
                "$contentType" : {
                    $type : "Bean",
                    $description : "Type of each element in the array."
                },
                "$fastNorm" : {
                    $type : "json:FunctionRef",
                    $description : "Fast normalization function for this type. Automatically added by the framework."
                },
                "$getDefault" : {
                    $type : "json:FunctionRef",
                    $description : "Return default value. Automatically added by the framework."
                }
            }
        },
        "Map" : {
            $type : "Element",
            $description : "Like Arrays, Maps correspond to variable-length structure - but contrary to Arrays, Map items are indexed with strings. A map contains items of the same type (which can be a MultiTypes), which is described in the $contentType object of the schema description.",
            $properties : {
                "$contentType" : {
                    $type : "Bean",
                    $description : "Type of each element in the map."
                },
                "$keyType" : {
                    $type : "Bean",
                    $description : "Type of each key in the map (this type must be a subtype of String)."
                },
                "$fastNorm" : {
                    $type : "json:FunctionRef",
                    $description : "Fast normalization function for this type. Automatically added by the framework."
                },
                "$getDefault" : {
                    $type : "json:FunctionRef",
                    $description : "Return default value. Automatically added by the framework."
                }
            }
        },
        "MultiTypes" : {
            $type : "Element",
            $description : "A multi type element is an element that can reference items of different types. As such, its possible types should be described in the $contentTypes array of the schema description.",
            $properties : {
                "$contentTypes" : {
                    $type : "json:Array",
                    $description : "Array of the different accepted types.",
                    $contentType : {
                        $type : "Bean",
                        $mandatory : true
                    }
                }
            }
        }
    }
});
/**
 * Beans to describe Aria Templates base structures (like parameters accepted for interface definitions). To be
 * completed with, maybe, class definitions, resource definitions...
 */
Aria.beanDefinitions({
    $package : "aria.core.CfgBeans",
    $description : "Definition of Aria Templates base structures.",
    $namespaces : {
        "json" : "aria.core.JsonTypes"
    },
    $beans : {
        "ClassDefinitionCfg" : {
            $type : "json:Object",
            $description : "Parameter to pass to Aria.classDefinition method.",
            $properties : {
                "$classpath" : {
                    $type : "json:PackageName",
                    $description : "The fully qualified class path.",
                    $mandatory : true,
                    $sample : 'aria.jsunit.TestSuite'
                },
                "$singleton" : {
                    $type : "json:Boolean",
                    $description : "Whether the class can be instanciated through the new statement or if it should only contain static (global) properties and methods.",
                    $default : false
                },
                "$extends" : {
                    $type : "json:PackageName",
                    $description : "Classpath of the parent class, if any.",
                    $default : "aria.core.JsObject"
                },
                "$implements" : {
                    $type : "json:Array",
                    $description : "Interfaces that the class implements.",
                    $default : [],
                    $contentType : {
                        $type : "json:PackageName",
                        $description : "Classpath of the interface"
                    }
                },
                "$dependencies" : {
                    $type : "json:Array",
                    $description : "Additional dependencies",
                    $default : [],
                    $contentType : {
                        $type : "json:PackageName",
                        $description : "Any class that the class is dependent of."
                    }
                },
                "$resources" : {
                    $type : "json:Map",
                    $description : "Resource class to be accessible inside the class.",
                    $contentType : {
                        $type : "json:MultiTypes",
                        $description : "Any resource class that the class is dependent of.",
                        $sample : "aria.widgets.WidgetsRes",
                        $contentTypes : [{
                                    $type : "json:Object",
                                    $description : "Resource provider."
                                }, {
                                    $type : "json:String",
                                    $description : "Classpath of the resource class."
                                }]
                    }
                },
                "$templates" : {
                    $type : "json:Array",
                    $description : "Template dependencies",
                    $contentType : {
                        $type : "json:PackageName",
                        $description : "Any template that should be loaded before the class is loaded."
                    }
                },
                "$css" : {
                    $type : "json:Array",
                    $description : "CSS dependencies",
                    $contentType : {
                        $type : "json:PackageName",
                        $description : "Any CSS template that should be loaded along with the class."
                    }
                },
                "$macrolibs" : {
                    $type : "json:Array",
                    $description : "Static macro libraries",
                    $contentType : {
                        $type : "json:PackageName",
                        $description : "Classpath of the macro library to load as a dependency of the class.",
                        $mandatory : true
                    }
                },
                "$csslibs" : {
                    $type : "json:Array",
                    $description : "Static CSS macro libraries",
                    $contentType : {
                        $type : "json:PackageName",
                        $description : "Classpath of the CSS macro library to load as a dependency of the class.",
                        $mandatory : true
                    }
                },
                "$texts" : {
                    $type : "json:Map",
                    $description : "Text templates used inside the class.",
                    $contentType : {
                        $type : "json:PackageName",
                        $description : "Classpath of the text template.",
                        $mandatory : true
                    }
                },
                "$statics" : {
                    $type : "json:Map",
                    $description : "Methods and properties that are common to all instances of the class.",
                    $contentType : {
                        $type : "json:MultiTypes",
                        $description : "Property or method."
                    }
                },
                "$prototype" : {
                    $type : "json:MultiTypes",
                    $description : "Either a function or a map",
                    $contentTypes : [{
                                $type : "json:Map",
                                $description : "Methods and properties in the prototype of the class.",
                                $contentType : {
                                    $type : "json:MultiTypes",
                                    $description : "Property or method."
                                }
                            }, {
                                $type : "json:FunctionRef",
                                $description : "Reference to a JavaScript function, the function should return an object that will be the prototype."
                            }]
                },
                "$constructor" : {
                    $type : "json:FunctionRef",
                    $description : "Constructor function to run when the object is created through the new statement.",
                    $mandatory : true
                },
                "$destructor" : {
                    $type : "json:FunctionRef",
                    $description : "Destructor function to run when the object has to be deleted - must be called through the '$destructor()' method that will be automatically added to the object."
                },
                "$onload" : {
                    $type : "json:FunctionRef",
                    $description : "Function that is called after the class is loaded from the framework"
                },
                "$events" : {
                    $type : "json:Map",
                    $description : "Events that the class can raise.",
                    $contentType : {
                        $type : "json:MultiTypes",
                        $description : "Event description.",
                        $contentTypes : [{
                            $type : "json:Object",
                            $description : "Event description containing name, properties and description of the event."
                        }, {
                            $type : "json:String",
                            $description : "Name of the event."
                        }]
                    }
                },
                "$beans" : {
                    $type : "json:Map",
                    $description : "Beans to be defined in the class.",
                    $contentType : {
                        $type : "json:MultiTypes",
                        $description : "Beans"
                    }
                }
            }
        },
        "ItfBaseMemberCfg" : {
            $type : "json:Object",
            $description : "Base definition common for all interface member types.",
            $properties : {
                "$type" : {
                    $type : "json:Enum",
                    $enumValues : ['Function', 'Object', 'Interface'],
                    $description : "Type of the interface member."
                }
            }
        },
        "ItfMemberFunctionCfg" : {
            $type : "ItfBaseMemberCfg",
            $description : "Definition for interface methods. Methods can either be synchronous, or asynchronous with a callback parameter.",
            $properties : {
                "$callbackParam" : {
                    $type : "json:Integer",
                    $description : "Must be null (or undefined) if the method is synchronous. If the method is asynchronous, must contain the index of the parameter which contains the callback (0 = first parameter)."
                }
            }
        },
        "ItfMemberObjectCfg" : {
            $type : "ItfBaseMemberCfg",
            $description : "Definition for interface objects. Objects are not checked and simply copied in the interface wrapper.",
            $properties : {}
        },
        "ItfMemberInterfaceCfg" : {
            $type : "ItfBaseMemberCfg",
            $description : "Definition for members of interface which are other interfaces. When creating the interface wrapper, the element generated by such a member will always be an interface wrapper with the classpath specified in the $classpath property, whether it was an interface wrapper or a whole object in the whole object.",
            $properties : {
                "$classpath" : {
                    $type : "json:PackageName",
                    $description : "Classpath of the interface which describes the interface member.",
                    $mandatory : true
                }
            }
        },
        "IOAsyncRequestCfg" : {
            $type : "json:Object",
            $description : "Parameter of aria.core.IO.asyncRequest and aria.core.IO.jsonp. It is completed by the framework and passed to filters, which should change only the properties marked as changeable by filters.",
            $properties : {
                "sender" : {
                    $type : "json:Object",
                    $description : "Optional object containing information about the sender of this request. This is especially intended to be used by IO filters. In addition to its classpath, the sender should set in this object any property that could be useful for IO filters.",
                    $restricted : false,
                    $mandatory : false,
                    $properties : {
                        "classpath" : {
                            $type : "json:PackageName",
                            $description : "Classpath of the sender of the request. Depending on this value, IO filters may react differently.",
                            $mandatory : true
                        }
                    }
                },
                "url" : {
                    $type : "json:String",
                    $description : "URL to be requested. In case of a JSON-P request, the callback parameter is appended to this url. This property can be changed by filters."
                },
                "jsonp" : {
                    $type : "json:String",
                    $description : "Contains the name of the parameter that specifies the callback to be executed. If this property is specified, the request will be done through JSON-P. This property can be changed by filters.",
                    $sample : "callback"
                },
                "method" : {
                    $type : "json:Enum",
                    $description : "HTTP method used in the request. Ignored for JSON-P requests. This property can be changed by filters.",
                    $default : "GET",
                    $enumValues : ["GET", "POST", "PUT", "DELETE", "HEAD", "TRACE", "OPTIONS", "CONNECT", "PATCH", "COPY", "PROPFIND", "MKCOL", "PROPPATCH", "MOVE", "LOCK", "UNLOCK", "BIND", "UNBIND", "REBIND"],
                    $sample : "POST"
                },
                /* Backward Compatibility begins here, use data property instead */
                "postData" : {
                    $type : "json:String",
                    $description : "[DEPRECATED] Data to be sent in the body of the POST method. Ignored for GET requests. This property can be changed by filters."
                },
                /* Backward Compatibility ends here */
                "data" : {
                    $type : "json:String",
                    $description : "Data to be sent in the body of the request methods. Ignored for GET requests. This property can be changed by filters."
                },
                /* Backward Compatibility begins here, use contentTypeHeader property instead */
                "postHeader" : {
                    $type : "json:String",
                    $description : "[DEPRECATED] Header 'Content-type' to be used for POST requests.",
                    $default : "application/x-www-form-urlencoded; charset=UTF-8"
                },
                /* Backward Compatibility ends here */
                "contentTypeHeader" : {
                    $type : "json:String",
                    $description : "Header 'Content-type' to be used for requests.",
                    $default : "application/x-www-form-urlencoded; charset=UTF-8"
                },
                "headers" : {
                    $type : "json:Object",
                    $description : "HTTP message headers",
                    $sample : "{'Content-Type' : 'text/plain', 'Connection' : 'keep-alive'}",
                    $restricted : false
                },
                "timeout" : {
                    $type : "json:Integer",
                    $description : "Timeout in milliseconds (after which the request is canceled if no answer was received before). If this parameter is not set, the default timeout applies (specified in aria.core.IO.defaultTimeout). This property can be changed by filters."
                },
                "expectedResponseType" : {
                    $type : "json:Enum",
                    $description : "Expected type of the response. This is only a hint, currently used to automatically convert responses between text and json formats, if the expected type is not available. If not defined, no automatic conversion occurs. This property can be changed by filters.",
                    $enumValues : ["text", "json", "xml"]
                },
                "callback" : {
                    $type : "json:Object",
                    $description : "Callback functions.",
                    $properties : {
                        "fn" : {
                            $type : "json:FunctionRef",
                            $description : "Function called after the request completes successfully (after all filters have been called)."
                        },
                        "scope" : {
                            $type : "json:ObjectRef",
                            $description : "Object which should be available as 'this' in the 'fn' function called on success."
                        },
                        "onerror" : {
                            $type : "json:FunctionRef",
                            $description : "Function called if the request failed (after all filters have been called)."
                        },
                        "onerrorScope" : {
                            $type : "json:ObjectRef",
                            $description : "Object which should be available as 'this' in the 'onerror' function called on failure."
                        },
                        "args" : {
                            $type : "json:MultiTypes",
                            $description : "Object to be passed as the second parameter to the 'fn' or the 'onerror' method (the first parameter is the object described in IOAsyncRequestResponseCfg)."
                        },
                        "timeout" : {
                            $type : "json:Integer",
                            $description : "Used internally in the framework. Should not be specified directly."
                        }
                    }
                },
                // only used for asyncFormSubmit not to be used with asyncRequest directly
                "formId" : {
                    $type : "json:String",
                    $description : "Only used for asyncFormSubmit not to be used with asyncRequest directly.  Used when processing pseudo asynchronous form requests.  Needs to be passed within the request object by the user."
                },
                // only used for asyncFormSubmit not to be used with asyncRequest directly
                "form" : {
                    $type : "json:ObjectRef",
                    $description : "Only used for asyncFormSubmit not to be used with asyncRequest directly.  Contains the html form object retreived using the formId alternatively a user can pass the form object instead of the form id."
                },
                // response to be given to the caller
                "res" : {
                    $type : "IOAsyncRequestResponseCfg",
                    $description : "Response object sent as the first parameter to the callback specified in the parameter of asyncRequest or jsonp (either callback.fn or callback.onerror). It is automatically set by the framework and it is only available to filters on response. This property can be changed by filters on response."
                },
                // only targeted at filters:
                "delay" : {
                    $type : "json:Integer",
                    $description : "Delay (in ms) to add when all the filters have been called, before going on with the request or the response. (Only works when set from the onRequest or onResponse method of a filter)."
                },
                // Automatically managed by the framework (and must not be modified by filters):
                "id" : {
                    $type : "json:Integer",
                    $description : "Id of the request. It is automatically set by the framework to identify each request in a unique way (any value set in this property before calling asyncRequest is lost). This property can be used by filters but must not be changed."
                },
                "beginDownload" : {
                    $type : "json:Integer",
                    $description : "Time at which the download began. It is automatically set by the framework and it is only available to filters on response. This property should not be changed by filters."
                },
                "endDownload" : {
                    $type : "json:Integer",
                    $description : "Time at which the download ended. It is automatically set by the framework and it is only available to filters on response. This property should not be changed by filters."
                },
                "downloadTime" : {
                    $type : "json:Integer",
                    $description : "Duration of the download in milliseconds (equal to endDownload - beginDownload). It is automatically set by the framework and it is only available to filters on response. This property should not be changed by filters."
                },
                "requestSize" : {
                    $type : "json:Integer",
                    $description : "Approximate size of the request. It is automatically set by the framework and it is only available to filters on response. This property should not be changed by filters."
                },
                "responseSize" : {
                    $type : "json:Integer",
                    $description : "Approximate size of the response. It is automatically set by the framework and it is only available to filters on response. This is currently not set for JSON-P. This property should not be changed by filters."
                },
                "evalCb" : {
                    $type : "json:String",
                    $description : "Used internally by the framework to store the name of the callback function for JSON-P requests. It is not available to filters."
                }
            }
        },
        "IOAsyncRequestResponseCfg" : {
            $type : "json:Object",
            $description : "Response object sent as the first parameter to the callback specified in the parameter of asyncRequest or jsonp (either callback.fn or callback.onerror).",
            $properties : {
                url : {
                    $type : "json:String",
                    $description : "URL used in the request. Should not be changed by filters."
                },
                status : {
                    $type : "json:MultiTypes",
                    $description : "HTTP status (e.g.: 404). Can be changed by filters."
                },
                responseText : {
                    $type : "json:String",
                    $description : "If available, response from the server as a string. Can be changed by filters."
                },
                responseXML : {
                    $type : "json:ObjectRef",
                    $description : "If available, response from the server as an XML tree. Can be changed by filters."
                },
                responseJSON : {
                    $type : "json:MultiTypes",
                    $description : "If available, response from the server as a javascript object. Can be changed by filters."
                },
                error : {
                    $type : "json:String",
                    $description : "Null if no error occured. Otherwise, contains the error message. Can be changed by filters."
                }
            }
        },
        "Callback" : {
            $type : "json:Object",
            $description : "Object that describes a callback.",
            $properties : {
                "fn" : {
                    $type : "json:FunctionRef",
                    $description : "Function that has to be called.",
                    $mandatory : true
                },
                "scope" : {
                    $type : "json:ObjectRef",
                    $description : "Scope of execution of the function."
                },
                "args" : {
                    $type : "json:MultiTypes",
                    $description : "Optional argument passed to the function."
                },
                "resIndex" : {
                    $type : "json:Integer",
                    $description : "Optional param to specify the index of the result or event object in the arguments passed to the callback function.",
                    $default : 0
                },
                "apply" : {
                    $type : "json:Boolean",
                    $description : "Whether we should use Function.call or Function.apply for args. Used only if args is an array",
                    $default : false
                }
            }
        }
    }
});
/**
 * Store for application variables.
 * @singleton
 */
Aria.classDefinition({
    $classpath : "aria.core.AppEnvironment",
    $dependencies : ["aria.utils.Object"],
    $singleton : true,
    $events : {
        "changingEnvironment" : {
            description : "Notifies that the environment has changed and should be normalized (immediately) and applied (perhaps asynchronously) by listeners.",
            properties : {
                changedProperties : "If null, it means the environment is reset. Otherwise, it contains the list of properties which changed in the environment. This allows listeners to react only when needed.",
                asyncCalls : "This number should be incremented by listeners which need to do something asynchronous to apply the environment.",
                callback : "This is is the callback to be called by listeners which need to do something asynchronous to apply the environment (and have incremented asyncCalls)."
            }
        },
        "environmentChanged" : {
            description : "Notifies that the environment has changed. This event is raised just after changingEnvironment, so that the environment has been normalized by all loaded specific environment classes. Note that asynchronous operations to apply the environment are not done yet when this event is raised.",
            properties : {
                changedProperties : "If null, it means the environment is reset. Otherwise, it contains the list of properties which changed in the environment. This allows listeners to react only when needed."
            }
        }
    },
    $prototype : {
        /**
         * Stores the application settings.
         * @type Object
         */
        applicationSettings : {},

        /**
         * Stores the application variables. Please refer to documentation for parameter types.
         * @public
         * @param {Object} cfg Configuration object
         * @param {aria.core.CfgBeans:Callback} cb Method to be called after the setting is done
         * @param {Boolean} update flag to update existing application settings, when false will overwrite existing with
         * new settings.
         */
        setEnvironment : function (cfg, callback, update) {
            update = !!update;
            var keys = aria.utils.Object.keys(cfg);
            if (update) {
                aria.utils.Json.inject(cfg, this.applicationSettings, true);
            } else {
                if (keys.length === 0) {
                    // reset stored application settings
                    this.applicationSettings = {};
                    keys = null;
                } else {
                    for (var i = 0; i < keys.length; i++) {
                        var keyName = keys[i];
                        this.applicationSettings[keyName] = cfg[keyName];
                    }
                }
            }
            var evt = {
                name : "changingEnvironment",
                changedProperties : keys,
                asyncCalls : 1
            };
            evt.callback = {
                fn : function () {
                    evt.asyncCalls--;
                    if (evt.asyncCalls <= 0) {
                        evt.callback.fn = null;
                        evt = null;
                        keys = null;
                        this.$callback(callback);
                    }
                },
                scope : this
            };
            this.$raiseEvent(evt);
            this.$raiseEvent({
                name : "environmentChanged",
                changedProperties : keys
            });
            this.$callback(evt.callback);
        },

        /**
         * Added for backward compatibility, this should be handled by the setEnvironment method.
         * @param {Object} cfg
         * @param {Function} callback
         */
        updateEnvironment : function (cfg, callback) {
            this.setEnvironment(cfg, callback, true);
        }
    }
});
/**
 * Bean definitions that are either common to multiple areas of the framework, or are needed before dependencies are
 * loaded by the framework.
 */
Aria.beanDefinitions({
    $package : "aria.core.environment.EnvironmentBaseCfgBeans",
    $description : "A definition of the JSON beans used to set the environment settings.",
    $namespaces : {
        "json" : "aria.core.JsonTypes"
    },
    $beans : {
        "AppCfg" : {
            $type : "json:Object",
            $description : "Application environment variables",
            $restricted : false,
            $properties : {
                "appSettings" : {
                    $type : "AppSettingsCfg",
                    $description : "Default application settings for the application",
                    $default : {}
                },

                "language" : {
                    $type : "LanguageCfg",
                    $description : "Default language for the application",
                    $default : {
                        "primaryLanguage" : "en",
                        "region" : "US"
                    }
                }
            }
        },

        "AppSettingsCfg" : {
            $type : "json:Object",
            $description : "",
            $properties : {
                "devMode" : {
                    $type : "json:Boolean",
                    $description : "Indicates if the application is in development mode. Useful i.e. for resource manager - if set to true static RES files will be used instead of requesting them from the server",
                    $default : false
                },
                "debug" : {
                    $type : "json:Boolean",
                    $description : "Indicates if the application is in debug state (strong validation, more error reporting).",
                    $default : Aria.debug
                }
            }

        },

        "LanguageCfg" : {
            $type : "json:Object",
            $description : "",
            $properties : {
                "primaryLanguage" : {
                    $type : "json:String",
                    $description : "Primary language (i.e 'en' in 'en_US')",
                    $mandatory : true,
                    $regExp : /^[a-z]{2}$/
                },
                "region" : {
                    $type : "json:String",
                    $description : "Region (i.e US in en_US)",
                    $mandatory : true,
                    $regExp : /^[A-Z]{2}$/
                }
            }

        },

        "FormatTypes" : {
            $type : "json:MultiTypes",
            $description : "",
            $contentTypes : [{
                        $type : "json:String",
                        $description : "..."
                    }, {
                        $type : "json:FunctionRef",
                        $description : "..."
                    }]

        },
        "inputFormatTypes" : {
            $type : "json:MultiTypes",
            $description : "",
            $contentTypes : [{
                $type : "json:String",
                $description : "A pattern to be used for user input matching. For instance yyyy*MM*dd, * represents the separator, it can be any character except numeric"
            }, {
                $type : "json:FunctionRef",
                $description : "A user-defined function used to parse the input in a JavaScript date."
            }, {
                $type : "json:Array",
                $description : "Contains an array of patterns and/of funtions",
                $contentType : {
                    $type : "json:MultiTypes",
                    $description : "",
                    $contentTypes : [{
                                $type : "json:String",
                                $description : "..."
                            }, {
                                $type : "json:FunctionRef",
                                $description : "..."
                            }]
                }
            }]
        }

    }
});/**
 * Base class containing shared methods for all environment classes.
 */
Aria.classDefinition({
    $classpath : "aria.core.environment.EnvironmentBase",
    $dependencies : ["aria.utils.Object"],
    $constructor : function () {
        this.$assert(9, this._cfgPackage != null);
        /**
         * Contains the default configuration for the part of the environment managed by this class. This is used to
         * know which are the environment properties managed by this class.
         * @type Object
         */
        this._localDefCfg = {};
        var validCfg = aria.core.JsonValidator.normalize({
            json : this._localDefCfg,
            beanName : this._cfgPackage
        });
        this.$assert(15, validCfg);

        this._changingEnvironment({
            changedProperties : null,
            asyncCalls : 0,
            callback : null
        });
        aria.core.AppEnvironment.$on({
            "changingEnvironment" : this._changingEnvironment,
            scope : this
        });
    },
    $destructor : function () {
        aria.core.AppEnvironment.$unregisterListeners(this);
        this._localDefCfg = null;
    },
    $events : {
        "environmentChanged" : {
            description : "Notifies that the application environment has changed."
        }
    },
    $prototype : {
        /**
         * Classpath of the bean which allows to validate the part of the environment managed by this class. It is meant
         * to be overriden by sub-classes.
         * @type String
         */
        _cfgPackage : null,

        /**
         * Listener for the changingEnvironment event from the aria.core.AppEnvironment. It checks if the changes in the
         * environment are managed by this class and calls _normAndApplyEnv if it is the case.
         * @param {Object} evt event object
         */
        _changingEnvironment : function (evt) {
            var changedProperties = evt.changedProperties;
            var localCfg = this._localDefCfg;
            var doUpdate = (changedProperties == null); // always do an update on reset
            if (changedProperties) {
                // look if the changed keys are part of this local environment
                for (var i = 0, l = changedProperties.length; i < l; i++) {
                    var propName = changedProperties[i];
                    if (propName in localCfg) {
                        doUpdate = true;
                        break;
                    }
                }
            }
            if (doUpdate) {
                evt.asyncCalls++;
                this._normAndApplyEnv(evt.callback);
            }
        },

        /**
         * Normalize the part of the environment managed by this class, then calls _applyEnvironment to apply it if the
         * environment is valid. Normalization is immediate. Applying the environment can be asynchronous. The callback
         * is called either synchronously or asynchronously.
         * @param {aria.core.CfgBeans:Callback} callback Will be called when the environment is applied.
         */
        _normAndApplyEnv : function (callback) {
            var validConfig = aria.core.JsonValidator.normalize({
                json : aria.core.AppEnvironment.applicationSettings,
                beanName : this._cfgPackage
            });
            if (validConfig) {
                this._applyEnvironment(callback);
                this.$raiseEvent("environmentChanged");
            } else {
                this.$callback(callback);
            }
        },

        /**
         * Apply the current environment.
         * @param {aria.core.CfgBeans:Callback} callback Will be called after the environment is applied.
         * @protected
         */
        _applyEnvironment : function (callback) {
            this.$callback(callback);
        },

        /**
         * Compares user defined settings, if a setting doesn't exist then the default bean definition is used.
         * @pubic
         * @param {String} name
         * @return {Object} can be a string or an object containing user defined settings or the default bean
         * definitions.
         */
        checkApplicationSettings : function (name) {
            return aria.core.AppEnvironment.applicationSettings[name];
        }

    }
});
/**
 * Public API for retrieving, applying application variables.
 */
Aria.classDefinition({
    $classpath : "aria.core.environment.Environment",
    $singleton : true,
    $dependencies : ["aria.core.environment.EnvironmentBaseCfgBeans", "aria.core.AppEnvironment"],
    $extends : "aria.core.environment.EnvironmentBase",
    $statics : {
        // ERROR MESSAGES:
        INVALID_LOCALE : "Error: the locale '%1' is not in correct format"
    },
    $constructor : function () {
        this.$EnvironmentBase.constructor.call(this);
        // hook for JsonValidator and logs, which were loaded before
        this.$on({
            "debugChanged" : function () {
                aria.core.JsonValidator._options.checkEnabled = this.isDebug();
                var logs = aria.core.Log;
                // PTR 05038013: aria.core.Log may not be available
                if (logs) {
                    logs.setLoggingLevel("*", this.isDebug() ? logs.LEVEL_DEBUG : logs.LEVEL_ERROR);
                }
            },
            scope : this
        });
    },
    $events : {
        "debugChanged" : {
            description : "Notifies that debug mode has changed."
        }
    },
    $prototype : {
        /**
         * Classpath of the bean which allows to validate the part of the environment managed by this class.
         * @type String
         */
        _cfgPackage : "aria.core.environment.EnvironmentBaseCfgBeans.AppCfg",

        /**
         * Apply the current environment.
         * @protected
         * @param {aria.core.CfgBeans:Callback} callback Will be called after the environment variables are applied
         */
        _applyEnvironment : function (callback) {
            var debug = this.isDebug();
            if (debug != Aria.debug) {
                // always usefull as a shortcut
                Aria.debug = debug;
                this.$raiseEvent("debugChanged");
            }
            if (aria.core.ResMgr) { // the resource manager may not be already loaded
                aria.core.ResMgr.changeLocale(this.getLanguage(), callback);
            } else {
                this.$callback(callback);
            }
        },

        /**
         * Get language
         * @public
         * @return {String} language (lower case) and region (upper case) separated by an underscore.
         */
        getLanguage : function () {
            var language = this.checkApplicationSettings("language");
            return language.primaryLanguage.toLowerCase() + "_" + language.region.toUpperCase();
        },

        /**
         * Get region (ex: US)
         * @public
         * @return {String} The region
         */
        getRegion : function () {
            var region = this.checkApplicationSettings("language");
            return region.region;
        },

        /**
         * Sets the current application locale (ex: en_US)
         * @public
         * @param {String} locale New locale
         * @param {aria.core.CfgBeans:Callback} cb Method to be called after the locale is changed. The callback is called with
         * a boolean (true: errors, false: no errors)
         */
        setLanguage : function (locale, cb) {
            var err = false;
            if (locale == null) {
                err = true;
            } else {
                var s = locale.split("_");
                if (locale === "" || (locale.length === 5 && s !== null && s.length === 2) || locale.length == 2) {
                    aria.core.AppEnvironment.setEnvironment({
                        "language" : {
                            "primaryLanguage" : s[0],
                            "region" : s[1]
                        }
                    }, cb);
                    // setEnvironment will automatically call ResMgr.changeLocale, so there is no need to do it here
                    // aria.core.ResMgr.changeLocale(locale, cb);
                } else {
                    err = true;
                }
            }
            if (err) {
                this.$logError(this.INVALID_LOCALE, [locale]);
                this.$callback(cb, true);
            }
        },

        /**
         * Enable debug mode, and notify listeners.
         * @public
         * @param {Boolean} mode
         */
        setDebug : function (mode) {
            var debug = this.isDebug();
            if (debug !== mode && (mode === true || mode === false)) {
                aria.core.AppEnvironment.setEnvironment({
                    "appSettings" : {
                        "debug" : mode
                    }
                }, null, true);
            }
        },

        /**
         * Enable dev mode, and notify listeners.
         * @public
         * @param {Boolean} mode
         */
        setDevMode : function (mode) {
            var dev = this.isDevMode();
            if (dev !== mode && (mode === true || mode === false)) {
                aria.core.AppEnvironment.setEnvironment({
                    "appSettings" : {
                        "devMode" : mode
                    }
                }, null, true);
            }
        },

        /**
         * Get the value indicating if app is in dev mode
         * @public
         * @return {Boolean} devMode flag value
         */
        isDevMode : function () {
            var settings = this.checkApplicationSettings("appSettings");
            if (settings && settings.devMode) {
                return true;
            }
            return false;
        },

        /**
         * Return true if debug mode is on.
         * @public
         * @return {Boolean}
         */
        isDebug : function () {
            var settings = this.checkApplicationSettings("appSettings");
            if (settings && settings.debug) {
                return true;
            }
            return false;
        }
    }
});
/**
 * Resources Manager. It keeps the list of loaded resources in order to reload them in case of locale change.
 */
Aria.classDefinition({
    $classpath : "aria.core.ResMgr",
    $dependencies : ["aria.core.environment.Environment"],
    $singleton : true,
    $constructor : function () {
        this.devMode = true;
        this.currentLocale = aria.core.environment.Environment.getLanguage();
        this.loadedResources = {};
    },
    $destructor : function () {
        this.currentLocale = null;
        this.loadedResources = null;
    },
    $prototype : {

        /**
         * Resource Manager initialization method.
         * @param {Object} arg single config argument - to be defined by the sub-class
         */
        $init : function (arg) {},

        /**
         * Private method for loading multiple resource files
         * @param {Object} resources The list of resource sets to be loaded
         * @param {aria.core.CfgBeans:Callback} callback the callback description
         * @private
         */
        __loadResourceFiles : function (resources, cb) {
            var clsPaths = [];

            for (var itm in resources) {
                if (resources.hasOwnProperty(itm)) {
                    clsPaths.push(itm);
                }
            }

            Aria.load({
                resources : clsPaths,
                oncomplete : {
                    fn : this.__resourceFileLoaded,
                    scope : this,
                    args : {
                        cb : cb
                    }
                },
                onerror : {
                    fn : this.__resourceFileLoadError,
                    scope : this,
                    args : {
                        cb : cb
                    }
                }
            });

            clsPaths = null;

        },

        /**
         * Internal method for switching the resource sets locale (should be only called from Environment)
         * To switch the language call the aria.core.environment.Environment.setLanguage method
         * @param {String} newLocale The new locale i.e. "en-US"
         * @param {aria.core.CfgBeans:Callback} callback Callback to be called when resource files are loaded and locale changed
         */
        changeLocale : function (newLocale, cb) {
            this.currentLocale = newLocale;
            aria.core.ClassMgr.unloadClassesByType("RES");
            this.__loadResourceFiles(this.loadedResources, cb);
        },

        /**
         * Public method for storing the classpaths/locales of resource files that has been loaded
         * @param {String} resClassPath The classpath of the resource file than has loaded
         */
        addResFile : function (resClassPath) {
            this.loadedResources[resClassPath] = this.currentLocale;
        },

        /**
         * Gets the current locale of a resource set
         * @param {String} resClassPath Classpath of the resource set
         * @return {String} Resource locale
         */
        getResourceLocale : function (resClassPath) {
            return this.loadedResources[resClassPath];
        },

        /**
         * Gets the fallback locale for a specific locale
         * @param {String} resClassPath Classpath of the resource set
         * @return {String} Resource fallback locale
         */
        getFallbackLocale : function (resClassPath) {
            var currResLocale = this.loadedResources[resClassPath];

            var res;

            if (currResLocale == null) {
                currResLocale = this.currentLocale;
            }

            var x = currResLocale.split("_");
            if (x.length == 2) {
                res = x[0];
            } else {
                res = "";
            }

            this.loadedResources[resClassPath] = res;

            return {
                currResLocale : currResLocale,
                newResLocale : res
            };
        },

        /**
         * Callback method called after resource files had been reloaded on locale change
         * @param {Object} args Arguments passed to the callback
         * [args] {
         *         cb: {aria.core.CfgBeans:Callback} The callback method to be called  // optional
         * }
         * @private
         */
        __resourceFileLoaded : function (args) {
            this.$callback(args.cb);
        },

        /**
         * Callback method called when an error in the process of reloading resource files occurres
         * @param {Object} args Arguments passed to the callback
         * [args] {
         *         cb: {aria.core.CfgBeans:Callback} The callback method to be called after the error is processed  // optional
         * }
         * @private
         */
        __resourceFileLoadError : function (args) {
            //TODO: implement fallback mechanism, log error
            this.$callback(args.cb);
        }
    }
});