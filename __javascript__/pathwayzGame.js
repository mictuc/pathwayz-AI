"use strict";
// Transcrypt'ed from Python, 2017-12-05 09:13:38
function pathwayzGame () {
   var __symbols__ = ['__py3.6__', '__esv5__'];
    var __all__ = {};
    var __world__ = __all__;
    
    // Nested object creator, part of the nesting may already exist and have attributes
    var __nest__ = function (headObject, tailNames, value) {
        // In some cases this will be a global object, e.g. 'window'
        var current = headObject;
        
        if (tailNames != '') {  // Split on empty string doesn't give empty list
            // Find the last already created object in tailNames
            var tailChain = tailNames.split ('.');
            var firstNewIndex = tailChain.length;
            for (var index = 0; index < tailChain.length; index++) {
                if (!current.hasOwnProperty (tailChain [index])) {
                    firstNewIndex = index;
                    break;
                }
                current = current [tailChain [index]];
            }
            
            // Create the rest of the objects, if any
            for (var index = firstNewIndex; index < tailChain.length; index++) {
                current [tailChain [index]] = {};
                current = current [tailChain [index]];
            }
        }
        
        // Insert it new attributes, it may have been created earlier and have other attributes
        for (var attrib in value) {
            current [attrib] = value [attrib];          
        }       
    };
    __all__.__nest__ = __nest__;
    
    // Initialize module if not yet done and return its globals
    var __init__ = function (module) {
        if (!module.__inited__) {
            module.__all__.__init__ (module.__all__);
            module.__inited__ = true;
        }
        return module.__all__;
    };
    __all__.__init__ = __init__;
    
    
    
    
    // Since we want to assign functions, a = b.f should make b.f produce a bound function
    // So __get__ should be called by a property rather then a function
    // Factory __get__ creates one of three curried functions for func
    // Which one is produced depends on what's to the left of the dot of the corresponding JavaScript property
    var __get__ = function (self, func, quotedFuncName) {
        if (self) {
            if (self.hasOwnProperty ('__class__') || typeof self == 'string' || self instanceof String) {           // Object before the dot
                if (quotedFuncName) {                                   // Memoize call since fcall is on, by installing bound function in instance
                    Object.defineProperty (self, quotedFuncName, {      // Will override the non-own property, next time it will be called directly
                        value: function () {                            // So next time just call curry function that calls function
                            var args = [] .slice.apply (arguments);
                            return func.apply (null, [self] .concat (args));
                        },              
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                }
                return function () {                                    // Return bound function, code dupplication for efficiency if no memoizing
                    var args = [] .slice.apply (arguments);             // So multilayer search prototype, apply __get__, call curry func that calls func
                    return func.apply (null, [self] .concat (args));
                };
            }
            else {                                                      // Class before the dot
                return func;                                            // Return static method
            }
        }
        else {                                                          // Nothing before the dot
            return func;                                                // Return free function
        }
    }
    __all__.__get__ = __get__;

    var __getcm__ = function (self, func, quotedFuncName) {
        if (self.hasOwnProperty ('__class__')) {
            return function () {
                var args = [] .slice.apply (arguments);
                return func.apply (null, [self.__class__] .concat (args));
            };
        }
        else {
            return function () {
                var args = [] .slice.apply (arguments);
                return func.apply (null, [self] .concat (args));
            };
        }
    }
    __all__.__getcm__ = __getcm__;
    
    var __getsm__ = function (self, func, quotedFuncName) {
        return func;
    }
    __all__.__getsm__ = __getsm__;
        
    // Mother of all metaclasses        
    var py_metatype = {
        __name__: 'type',
        __bases__: [],
        
        // Overridable class creation worker
        __new__: function (meta, name, bases, attribs) {
            // Create the class cls, a functor, which the class creator function will return
            var cls = function () {                     // If cls is called with arg0, arg1, etc, it calls its __new__ method with [arg0, arg1, etc]
                var args = [] .slice.apply (arguments); // It has a __new__ method, not yet but at call time, since it is copied from the parent in the loop below
                return cls.__new__ (args);              // Each Python class directly or indirectly derives from object, which has the __new__ method
            };                                          // If there are no bases in the Python source, the compiler generates [object] for this parameter
            
            // Copy all methods, including __new__, properties and static attributes from base classes to new cls object
            // The new class object will simply be the prototype of its instances
            // JavaScript prototypical single inheritance will do here, since any object has only one class
            // This has nothing to do with Python multiple inheritance, that is implemented explictly in the copy loop below
            for (var index = bases.length - 1; index >= 0; index--) {   // Reversed order, since class vars of first base should win
                var base = bases [index];
                for (var attrib in base) {
                    var descrip = Object.getOwnPropertyDescriptor (base, attrib);
                    Object.defineProperty (cls, attrib, descrip);
                }           
            }
            
            // Add class specific attributes to the created cls object
            cls.__metaclass__ = meta;
            cls.__name__ = name;
            cls.__bases__ = bases;
            
            // Add own methods, properties and own static attributes to the created cls object
            for (var attrib in attribs) {
                var descrip = Object.getOwnPropertyDescriptor (attribs, attrib);
                Object.defineProperty (cls, attrib, descrip);
            }
            // Return created cls object
            return cls;
        }
    };
    py_metatype.__metaclass__ = py_metatype;
    __all__.py_metatype = py_metatype;
    
    // Mother of all classes
    var object = {
        __init__: function (self) {},
        
        __metaclass__: py_metatype, // By default, all classes have metaclass type, since they derive from object
        __name__: 'object',
        __bases__: [],
            
        // Object creator function, is inherited by all classes (so could be global)
        __new__: function (args) {  // Args are just the constructor args       
            // In JavaScript the Python class is the prototype of the Python object
            // In this way methods and static attributes will be available both with a class and an object before the dot
            // The descriptor produced by __get__ will return the right method flavor
            var instance = Object.create (this, {__class__: {value: this, enumerable: true}});
            

            // Call constructor
            this.__init__.apply (null, [instance] .concat (args));

            // Return constructed instance
            return instance;
        }   
    };
    __all__.object = object;
    
    // Class creator facade function, calls class creation worker
    var __class__ = function (name, bases, attribs, meta) {         // Parameter meta is optional
        if (meta == undefined) {
            meta = bases [0] .__metaclass__;
        }
                
        return meta.__new__ (meta, name, bases, attribs);
    }
    __all__.__class__ = __class__;
    
    // Define __pragma__ to preserve '<all>' and '</all>', since it's never generated as a function, must be done early, so here
    var __pragma__ = function () {};
    __all__.__pragma__ = __pragma__;
    
    	__nest__ (
		__all__,
		'org.transcrypt.__base__', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var __Envir__ = __class__ ('__Envir__', [object], {
						get __init__ () {return __get__ (this, function (self) {
							self.interpreter_name = 'python';
							self.transpiler_name = 'transcrypt';
							self.transpiler_version = '3.6.54';
							self.target_subdir = '__javascript__';
						});}
					});
					var __envir__ = __Envir__ ();
					__pragma__ ('<all>')
						__all__.__Envir__ = __Envir__;
						__all__.__envir__ = __envir__;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'org.transcrypt.__standard__', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var Exception = __class__ ('Exception', [object], {
						get __init__ () {return __get__ (this, function (self) {
							var kwargs = dict ();
							if (arguments.length) {
								var __ilastarg0__ = arguments.length - 1;
								if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
									var __allkwargs0__ = arguments [__ilastarg0__--];
									for (var __attrib0__ in __allkwargs0__) {
										switch (__attrib0__) {
											case 'self': var self = __allkwargs0__ [__attrib0__]; break;
											default: kwargs [__attrib0__] = __allkwargs0__ [__attrib0__];
										}
									}
									delete kwargs.__kwargtrans__;
								}
								var args = tuple ([].slice.apply (arguments).slice (1, __ilastarg0__ + 1));
							}
							else {
								var args = tuple ();
							}
							self.__args__ = args;
							try {
								self.stack = kwargs.error.stack;
							}
							catch (__except0__) {
								self.stack = 'No stack trace available';
							}
						});},
						get __repr__ () {return __get__ (this, function (self) {
							if (len (self.__args__)) {
								return '{}{}'.format (self.__class__.__name__, repr (tuple (self.__args__)));
							}
							else {
								return '{}()'.format (self.__class__.__name__);
							}
						});},
						get __str__ () {return __get__ (this, function (self) {
							if (len (self.__args__) > 1) {
								return str (tuple (self.__args__));
							}
							else if (len (self.__args__)) {
								return str (self.__args__ [0]);
							}
							else {
								return '';
							}
						});}
					});
					var IterableError = __class__ ('IterableError', [Exception], {
						get __init__ () {return __get__ (this, function (self, error) {
							Exception.__init__ (self, "Can't iterate over non-iterable", __kwargtrans__ ({error: error}));
						});}
					});
					var StopIteration = __class__ ('StopIteration', [Exception], {
						get __init__ () {return __get__ (this, function (self, error) {
							Exception.__init__ (self, 'Iterator exhausted', __kwargtrans__ ({error: error}));
						});}
					});
					var ValueError = __class__ ('ValueError', [Exception], {
						get __init__ () {return __get__ (this, function (self, error) {
							Exception.__init__ (self, 'Erroneous value', __kwargtrans__ ({error: error}));
						});}
					});
					var KeyError = __class__ ('KeyError', [Exception], {
						get __init__ () {return __get__ (this, function (self, error) {
							Exception.__init__ (self, 'Invalid key', __kwargtrans__ ({error: error}));
						});}
					});
					var AssertionError = __class__ ('AssertionError', [Exception], {
						get __init__ () {return __get__ (this, function (self, message, error) {
							if (message) {
								Exception.__init__ (self, message, __kwargtrans__ ({error: error}));
							}
							else {
								Exception.__init__ (self, __kwargtrans__ ({error: error}));
							}
						});}
					});
					var NotImplementedError = __class__ ('NotImplementedError', [Exception], {
						get __init__ () {return __get__ (this, function (self, message, error) {
							Exception.__init__ (self, message, __kwargtrans__ ({error: error}));
						});}
					});
					var IndexError = __class__ ('IndexError', [Exception], {
						get __init__ () {return __get__ (this, function (self, message, error) {
							Exception.__init__ (self, message, __kwargtrans__ ({error: error}));
						});}
					});
					var AttributeError = __class__ ('AttributeError', [Exception], {
						get __init__ () {return __get__ (this, function (self, message, error) {
							Exception.__init__ (self, message, __kwargtrans__ ({error: error}));
						});}
					});
					var Warning = __class__ ('Warning', [Exception], {
					});
					var UserWarning = __class__ ('UserWarning', [Warning], {
					});
					var DeprecationWarning = __class__ ('DeprecationWarning', [Warning], {
					});
					var RuntimeWarning = __class__ ('RuntimeWarning', [Warning], {
					});
					var __sort__ = function (iterable, key, reverse) {
						if (typeof key == 'undefined' || (key != null && key .hasOwnProperty ("__kwargtrans__"))) {;
							var key = null;
						};
						if (typeof reverse == 'undefined' || (reverse != null && reverse .hasOwnProperty ("__kwargtrans__"))) {;
							var reverse = false;
						};
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'iterable': var iterable = __allkwargs0__ [__attrib0__]; break;
										case 'key': var key = __allkwargs0__ [__attrib0__]; break;
										case 'reverse': var reverse = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						if (key) {
							iterable.sort ((function __lambda__ (a, b) {
								if (arguments.length) {
									var __ilastarg0__ = arguments.length - 1;
									if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
										var __allkwargs0__ = arguments [__ilastarg0__--];
										for (var __attrib0__ in __allkwargs0__) {
											switch (__attrib0__) {
												case 'a': var a = __allkwargs0__ [__attrib0__]; break;
												case 'b': var b = __allkwargs0__ [__attrib0__]; break;
											}
										}
									}
								}
								else {
								}
								return (key (a) > key (b) ? 1 : -(1));
							}));
						}
						else {
							iterable.sort ();
						}
						if (reverse) {
							iterable.reverse ();
						}
					};
					var sorted = function (iterable, key, reverse) {
						if (typeof key == 'undefined' || (key != null && key .hasOwnProperty ("__kwargtrans__"))) {;
							var key = null;
						};
						if (typeof reverse == 'undefined' || (reverse != null && reverse .hasOwnProperty ("__kwargtrans__"))) {;
							var reverse = false;
						};
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'iterable': var iterable = __allkwargs0__ [__attrib0__]; break;
										case 'key': var key = __allkwargs0__ [__attrib0__]; break;
										case 'reverse': var reverse = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						if (py_typeof (iterable) == dict) {
							var result = copy (iterable.py_keys ());
						}
						else {
							var result = copy (iterable);
						}
						__sort__ (result, key, reverse);
						return result;
					};
					var map = function (func, iterable) {
						return function () {
							var __accu0__ = [];
							for (var item of iterable) {
								__accu0__.append (func (item));
							}
							return __accu0__;
						} ();
					};
					var filter = function (func, iterable) {
						if (func == null) {
							var func = bool;
						}
						return function () {
							var __accu0__ = [];
							for (var item of iterable) {
								if (func (item)) {
									__accu0__.append (item);
								}
							}
							return __accu0__;
						} ();
					};
					var __Terminal__ = __class__ ('__Terminal__', [object], {
						get __init__ () {return __get__ (this, function (self) {
							self.buffer = '';
							try {
								self.element = document.getElementById ('__terminal__');
							}
							catch (__except0__) {
								self.element = null;
							}
							if (self.element) {
								self.element.style.overflowX = 'auto';
								self.element.style.boxSizing = 'border-box';
								self.element.style.padding = '5px';
								self.element.innerHTML = '_';
							}
						});},
						get print () {return __get__ (this, function (self) {
							var sep = ' ';
							var end = '\n';
							if (arguments.length) {
								var __ilastarg0__ = arguments.length - 1;
								if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
									var __allkwargs0__ = arguments [__ilastarg0__--];
									for (var __attrib0__ in __allkwargs0__) {
										switch (__attrib0__) {
											case 'self': var self = __allkwargs0__ [__attrib0__]; break;
											case 'sep': var sep = __allkwargs0__ [__attrib0__]; break;
											case 'end': var end = __allkwargs0__ [__attrib0__]; break;
										}
									}
								}
								var args = tuple ([].slice.apply (arguments).slice (1, __ilastarg0__ + 1));
							}
							else {
								var args = tuple ();
							}
							self.buffer = '{}{}{}'.format (self.buffer, sep.join (function () {
								var __accu0__ = [];
								for (var arg of args) {
									__accu0__.append (str (arg));
								}
								return __accu0__;
							} ()), end).__getslice__ (-(4096), null, 1);
							if (self.element) {
								self.element.innerHTML = self.buffer.py_replace ('\n', '<br>');
								self.element.scrollTop = self.element.scrollHeight;
							}
							else {
								console.log (sep.join (function () {
									var __accu0__ = [];
									for (var arg of args) {
										__accu0__.append (str (arg));
									}
									return __accu0__;
								} ()));
							}
						});},
						get input () {return __get__ (this, function (self, question) {
							if (arguments.length) {
								var __ilastarg0__ = arguments.length - 1;
								if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
									var __allkwargs0__ = arguments [__ilastarg0__--];
									for (var __attrib0__ in __allkwargs0__) {
										switch (__attrib0__) {
											case 'self': var self = __allkwargs0__ [__attrib0__]; break;
											case 'question': var question = __allkwargs0__ [__attrib0__]; break;
										}
									}
								}
							}
							else {
							}
							self.print ('{}'.format (question), __kwargtrans__ ({end: ''}));
							var answer = window.prompt ('\n'.join (self.buffer.py_split ('\n').__getslice__ (-(16), null, 1)));
							self.print (answer);
							return answer;
						});}
					});
					var __terminal__ = __Terminal__ ();
					__pragma__ ('<all>')
						__all__.AssertionError = AssertionError;
						__all__.AttributeError = AttributeError;
						__all__.DeprecationWarning = DeprecationWarning;
						__all__.Exception = Exception;
						__all__.IndexError = IndexError;
						__all__.IterableError = IterableError;
						__all__.KeyError = KeyError;
						__all__.NotImplementedError = NotImplementedError;
						__all__.RuntimeWarning = RuntimeWarning;
						__all__.StopIteration = StopIteration;
						__all__.UserWarning = UserWarning;
						__all__.ValueError = ValueError;
						__all__.Warning = Warning;
						__all__.__Terminal__ = __Terminal__;
						__all__.__sort__ = __sort__;
						__all__.__terminal__ = __terminal__;
						__all__.filter = filter;
						__all__.map = map;
						__all__.sorted = sorted;
					__pragma__ ('</all>')
				}
			}
		}
	);
    var __call__ = function (/* <callee>, <this>, <params>* */) {   // Needed for __base__ and __standard__ if global 'opov' switch is on
        var args = [] .slice.apply (arguments);
        if (typeof args [0] == 'object' && '__call__' in args [0]) {        // Overloaded
            return args [0] .__call__ .apply (args [1], args.slice (2));
        }
        else {                                                              // Native
            return args [0] .apply (args [1], args.slice (2));
        }
    };
    __all__.__call__ = __call__;

    // Initialize non-nested modules __base__ and __standard__ and make its names available directly and via __all__
    // They can't do that itself, because they're regular Python modules
    // The compiler recognizes their names and generates them inline rather than nesting them
    // In this way it isn't needed to import them everywhere

    // __base__

    __nest__ (__all__, '', __init__ (__all__.org.transcrypt.__base__));
    var __envir__ = __all__.__envir__;

    // __standard__

    __nest__ (__all__, '', __init__ (__all__.org.transcrypt.__standard__));

    var Exception = __all__.Exception;
    var IterableError = __all__.IterableError;
    var StopIteration = __all__.StopIteration;
    var ValueError = __all__.ValueError;
    var KeyError = __all__.KeyError;
    var AssertionError = __all__.AssertionError;
    var NotImplementedError = __all__.NotImplementedError;
    var IndexError = __all__.IndexError;
    var AttributeError = __all__.AttributeError;

    // Warnings Exceptions
    var Warning = __all__.Warning;
    var UserWarning = __all__.UserWarning;
    var DeprecationWarning = __all__.DeprecationWarning;
    var RuntimeWarning = __all__.RuntimeWarning;

    var __sort__ = __all__.__sort__;
    var sorted = __all__.sorted;

    var map = __all__.map;
    var filter = __all__.filter;

    __all__.print = __all__.__terminal__.print;
    __all__.input = __all__.__terminal__.input;

    var __terminal__ = __all__.__terminal__;
    var print = __all__.print;
    var input = __all__.input;

    // Complete __envir__, that was created in __base__, for non-stub mode
    __envir__.executor_name = __envir__.transpiler_name;

    // Make make __main__ available in browser
    var __main__ = {__file__: ''};
    __all__.main = __main__;

    // Define current exception, there's at most one exception in the air at any time
    var __except__ = null;
    __all__.__except__ = __except__;
    
     // Creator of a marked dictionary, used to pass **kwargs parameter
    var __kwargtrans__ = function (anObject) {
        anObject.__kwargtrans__ = null; // Removable marker
        anObject.constructor = Object;
        return anObject;
    }
    __all__.__kwargtrans__ = __kwargtrans__;

    // 'Oneshot' dict promotor, used to enrich __all__ and help globals () return a true dict
    var __globals__ = function (anObject) {
        if (isinstance (anObject, dict)) {  // Don't attempt to promote (enrich) again, since it will make a copy
            return anObject;
        }
        else {
            return dict (anObject)
        }
    }
    __all__.__globals__ = __globals__
    
    // Partial implementation of super () .<methodName> (<params>)
    var __super__ = function (aClass, methodName) {
        // Lean and fast, no C3 linearization, only call first implementation encountered
        // Will allow __super__ ('<methodName>') (self, <params>) rather than only <className>.<methodName> (self, <params>)
        
        for (var index = 0; index < aClass.__bases__.length; index++) {
            var base = aClass.__bases__ [index];
            if (methodName in base) {
               return base [methodName];
            }
        }

        throw new Exception ('Superclass method not found');    // !!! Improve!
    }
    __all__.__super__ = __super__
        
    // Python property installer function, no member since that would bloat classes
    var property = function (getter, setter) {  // Returns a property descriptor rather than a property
        if (!setter) {  // ??? Make setter optional instead of dummy?
            setter = function () {};
        }
        return {get: function () {return getter (this)}, set: function (value) {setter (this, value)}, enumerable: true};
    }
    __all__.property = property;
    
    // Conditional JavaScript property installer function, prevents redefinition of properties if multiple Transcrypt apps are on one page
    var __setProperty__ = function (anObject, name, descriptor) {
        if (!anObject.hasOwnProperty (name)) {
            Object.defineProperty (anObject, name, descriptor);
        }
    }
    __all__.__setProperty__ = __setProperty__
    
    // Assert function, call to it only generated when compiling with --dassert option
    function assert (condition, message) {  // Message may be undefined
        if (!condition) {
            throw AssertionError (message, new Error ());
        }
    }

    __all__.assert = assert;

    var __merge__ = function (object0, object1) {
        var result = {};
        for (var attrib in object0) {
            result [attrib] = object0 [attrib];
        }
        for (var attrib in object1) {
            result [attrib] = object1 [attrib];
        }
        return result;
    };
    __all__.__merge__ = __merge__;

    // Manipulating attributes by name
    
    var dir = function (obj) {
        var aList = [];
        for (var aKey in obj) {
            aList.push (aKey);
        }
        aList.sort ();
        return aList;
    };
    __all__.dir = dir;

    var setattr = function (obj, name, value) {
        obj [name] = value;
    };
    __all__.setattr = setattr;

    var getattr = function (obj, name) {
        return obj [name];
    };
    __all__.getattr= getattr;

    var hasattr = function (obj, name) {
        try {
            return name in obj;
        }
        catch (exception) {
            return false;
        }
    };
    __all__.hasattr = hasattr;

    var delattr = function (obj, name) {
        delete obj [name];
    };
    __all__.delattr = (delattr);

    // The __in__ function, used to mimic Python's 'in' operator
    // In addition to CPython's semantics, the 'in' operator is also allowed to work on objects, avoiding a counterintuitive separation between Python dicts and JavaScript objects
    // In general many Transcrypt compound types feature a deliberate blend of Python and JavaScript facilities, facilitating efficient integration with JavaScript libraries
    // If only Python objects and Python dicts are dealt with in a certain context, the more pythonic 'hasattr' is preferred for the objects as opposed to 'in' for the dicts
    var __in__ = function (element, container) {
        if (py_typeof (container) == dict) {        // Currently only implemented as an augmented JavaScript object
            return container.hasOwnProperty (element);
        }
        else {                                      // Parameter 'element' itself is an array, string or a plain, non-dict JavaScript object
            return (
                container.indexOf ?                 // If it has an indexOf
                container.indexOf (element) > -1 :  // it's an array or a string,
                container.hasOwnProperty (element)  // else it's a plain, non-dict JavaScript object
            );
        }
    };
    __all__.__in__ = __in__;

    // Find out if an attribute is special
    var __specialattrib__ = function (attrib) {
        return (attrib.startswith ('__') && attrib.endswith ('__')) || attrib == 'constructor' || attrib.startswith ('py_');
    };
    __all__.__specialattrib__ = __specialattrib__;

    // Compute length of any object
    var len = function (anObject) {
        if (anObject === undefined || anObject === null) {
            return 0;
        }

        if (anObject.__len__ instanceof Function) {
            return anObject.__len__ ();
        }

        if (anObject.length !== undefined) {
            return anObject.length;
        }

        var length = 0;
        for (var attr in anObject) {
            if (!__specialattrib__ (attr)) {
                length++;
            }
        }

        return length;
    };
    __all__.len = len;

    // General conversions

    function __i__ (any) {  //  Conversion to iterable
        return py_typeof (any) == dict ? any.py_keys () : any;
    }

    // If the target object is somewhat true, return it. Otherwise return false.
    // Try to follow Python conventions of truthyness
    function __t__ (target) { 
        return (
            // Avoid invalid checks
            target === undefined || target === null ? false :
            
            // Take a quick shortcut if target is a simple type
            ['boolean', 'number'] .indexOf (typeof target) >= 0 ? target :
            
            // Use __bool__ (if present) to decide if target is true
            target.__bool__ instanceof Function ? (target.__bool__ () ? target : false) :
            
            // There is no __bool__, use __len__ (if present) instead
            target.__len__ instanceof Function ?  (target.__len__ () !== 0 ? target : false) :
            
            // There is no __bool__ and no __len__, declare Functions true.
            // Python objects are transpiled into instances of Function and if
            // there is no __bool__ or __len__, the object in Python is true.
            target instanceof Function ? target :
            
            // Target is something else, compute its len to decide
            len (target) !== 0 ? target :
            
            // When all else fails, declare target as false
            false
        );
    }
    __all__.__t__ = __t__;

    var bool = function (any) {     // Always truly returns a bool, rather than something truthy or falsy
        return !!__t__ (any);
    };
    bool.__name__ = 'bool';         // So it can be used as a type with a name
    __all__.bool = bool;

    var float = function (any) {
        if (any == 'inf') {
            return Infinity;
        }
        else if (any == '-inf') {
            return -Infinity;
        }
        else if (isNaN (parseFloat (any))) {    // Call to parseFloat needed to exclude '', ' ' etc.
            if (any === false) {
                return 0;
            }
            else if (any === true) {
                return 1;
            }
            else {  // Needed e.g. in autoTester.check, so "return any ? true : false" won't do
                throw ValueError (new Error ());
            }
        }
        else {
            return +any;
        }
    };
    float.__name__ = 'float';
    __all__.float = float;

    var int = function (any) {
        return float (any) | 0
    };
    int.__name__ = 'int';
    __all__.int = int;

    var py_typeof = function (anObject) {
        var aType = typeof anObject;
        if (aType == 'object') {    // Directly trying '__class__ in anObject' turns out to wreck anObject in Chrome if its a primitive
            try {
                return anObject.__class__;
            }
            catch (exception) {
                return aType;
            }
        }
        else {
            return (    // Odly, the braces are required here
                aType == 'boolean' ? bool :
                aType == 'string' ? str :
                aType == 'number' ? (anObject % 1 == 0 ? int : float) :
                null
            );
        }
    };
    __all__.py_typeof = py_typeof;

    var isinstance = function (anObject, classinfo) {
        function isA (queryClass) {
            if (queryClass == classinfo) {
                return true;
            }
            for (var index = 0; index < queryClass.__bases__.length; index++) {
                if (isA (queryClass.__bases__ [index], classinfo)) {
                    return true;
                }
            }
            return false;
        }

        if (classinfo instanceof Array) {   // Assume in most cases it isn't, then making it recursive rather than two functions saves a call
            for (var index = 0; index < classinfo.length; index++) {
                var aClass = classinfo [index];
                if (isinstance (anObject, aClass)) {
                    return true;
                }
            }
            return false;
        }

        try {                   // Most frequent use case first
            return '__class__' in anObject ? isA (anObject.__class__) : anObject instanceof classinfo;
        }
        catch (exception) {     // Using isinstance on primitives assumed rare
            var aType = py_typeof (anObject);
            return aType == classinfo || (aType == bool && classinfo == int);
        }
    };
    __all__.isinstance = isinstance;

    var callable = function (anObject) {
        if ( typeof anObject == 'object' && '__call__' in anObject ) {
            return true;
        }
        else {
            return typeof anObject === 'function';
        }
    };
    __all__.callable = callable;

    // Repr function uses __repr__ method, then __str__, then toString
    var repr = function (anObject) {
        try {
            return anObject.__repr__ ();
        }
        catch (exception) {
            try {
                return anObject.__str__ ();
            }
            catch (exception) { // anObject has no __repr__ and no __str__
                try {
                    if (anObject == null) {
                        return 'None';
                    }
                    else if (anObject.constructor == Object) {
                        var result = '{';
                        var comma = false;
                        for (var attrib in anObject) {
                            if (!__specialattrib__ (attrib)) {
                                if (attrib.isnumeric ()) {
                                    var attribRepr = attrib;                // If key can be interpreted as numerical, we make it numerical
                                }                                           // So we accept that '1' is misrepresented as 1
                                else {
                                    var attribRepr = '\'' + attrib + '\'';  // Alpha key in dict
                                }

                                if (comma) {
                                    result += ', ';
                                }
                                else {
                                    comma = true;
                                }
                                result += attribRepr + ': ' + repr (anObject [attrib]);
                            }
                        }
                        result += '}';
                        return result;
                    }
                    else {
                        return typeof anObject == 'boolean' ? anObject.toString () .capitalize () : anObject.toString ();
                    }
                }
                catch (exception) {
                    return '<object of type: ' + typeof anObject + '>';
                }
            }
        }
    };
    __all__.repr = repr;

    // Char from Unicode or ASCII
    var chr = function (charCode) {
        return String.fromCharCode (charCode);
    };
    __all__.chr = chr;

    // Unicode or ASCII from char
    var ord = function (aChar) {
        return aChar.charCodeAt (0);
    };
    __all__.ord = ord;

    // Maximum of n numbers
    var max = Math.max;
    __all__.max = max;

    // Minimum of n numbers
    var min = Math.min;
    __all__.min = min;

    // Absolute value
    var abs = Math.abs;
    __all__.abs = abs;

    // Bankers rounding
    var round = function (number, ndigits) {
        if (ndigits) {
            var scale = Math.pow (10, ndigits);
            number *= scale;
        }

        var rounded = Math.round (number);
        if (rounded - number == 0.5 && rounded % 2) {   // Has rounded up to odd, should have rounded down to even
            rounded -= 1;
        }

        if (ndigits) {
            rounded /= scale;
        }

        return rounded;
    };
    __all__.round = round;

    // BEGIN unified iterator model

    function __jsUsePyNext__ () {       // Add as 'next' method to make Python iterator JavaScript compatible
        try {
            var result = this.__next__ ();
            return {value: result, done: false};
        }
        catch (exception) {
            return {value: undefined, done: true};
        }
    }

    function __pyUseJsNext__ () {       // Add as '__next__' method to make JavaScript iterator Python compatible
        var result = this.next ();
        if (result.done) {
            throw StopIteration (new Error ());
        }
        else {
            return result.value;
        }
    }

    function py_iter (iterable) {                   // Alias for Python's iter function, produces a universal iterator / iterable, usable in Python and JavaScript
        if (typeof iterable == 'string' || '__iter__' in iterable) {    // JavaScript Array or string or Python iterable (string has no 'in')
            var result = iterable.__iter__ ();                          // Iterator has a __next__
            result.next = __jsUsePyNext__;                              // Give it a next
        }
        else if ('selector' in iterable) {                              // Assume it's a JQuery iterator
            var result = list (iterable) .__iter__ ();                  // Has a __next__
            result.next = __jsUsePyNext__;                              // Give it a next
        }
        else if ('next' in iterable) {                                  // It's a JavaScript iterator already,  maybe a generator, has a next and may have a __next__
            var result = iterable
            if (! ('__next__' in result)) {                             // If there's no danger of recursion
                result.__next__ = __pyUseJsNext__;                      // Give it a __next__
            }
        }
        else if (Symbol.iterator in iterable) {                         // It's a JavaScript iterable such as a typed array, but not an iterator
            var result = iterable [Symbol.iterator] ();                 // Has a next
            result.__next__ = __pyUseJsNext__;                          // Give it a __next__
        }
        else {
            throw IterableError (new Error ()); // No iterator at all
        }
        result [Symbol.iterator] = function () {return result;};
        return result;
    }

    function py_next (iterator) {               // Called only in a Python context, could receive Python or JavaScript iterator
        try {                                   // Primarily assume Python iterator, for max speed
            var result = iterator.__next__ ();
        }
        catch (exception) {                     // JavaScript iterators are the exception here
            var result = iterator.next ();
            if (result.done) {
                throw StopIteration (new Error ());
            }
            else {
                return result.value;
            }
        }
        if (result == undefined) {
            throw StopIteration (new Error ());
        }
        else {
            return result;
        }
    }

    function __PyIterator__ (iterable) {
        this.iterable = iterable;
        this.index = 0;
    }

    __PyIterator__.prototype.__next__ = function () {
        if (this.index < this.iterable.length) {
            return this.iterable [this.index++];
        }
        else {
            throw StopIteration (new Error ());
        }
    };

    function __JsIterator__ (iterable) {
        this.iterable = iterable;
        this.index = 0;
    }

    __JsIterator__.prototype.next = function () {
        if (this.index < this.iterable.py_keys.length) {
            return {value: this.index++, done: false};
        }
        else {
            return {value: undefined, done: true};
        }
    };

    // END unified iterator model

    // Reversed function for arrays
    var py_reversed = function (iterable) {
        iterable = iterable.slice ();
        iterable.reverse ();
        return iterable;
    };
    __all__.py_reversed = py_reversed;

    // Zip method for arrays and strings
    var zip = function () {
        var args = [] .slice.call (arguments);
        for (var i = 0; i < args.length; i++) {
            if (typeof args [i] == 'string') {
                args [i] = args [i] .split ('');
            }
            else if (!Array.isArray (args [i])) {
                args [i] = Array.from (args [i]);
            }
        }
        var shortest = args.length == 0 ? [] : args.reduce (    // Find shortest array in arguments
            function (array0, array1) {
                return array0.length < array1.length ? array0 : array1;
            }
        );
        return shortest.map (                   // Map each element of shortest array
            function (current, index) {         // To the result of this function
                return args.map (               // Map each array in arguments
                    function (current) {        // To the result of this function
                        return current [index]; // Namely it's index't entry
                    }
                );
            }
        );
    };
    __all__.zip = zip;

    // Range method, returning an array
    function range (start, stop, step) {
        if (stop == undefined) {
            // one param defined
            stop = start;
            start = 0;
        }
        if (step == undefined) {
            step = 1;
        }
        if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
            return [];
        }
        var result = [];
        for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
            result.push(i);
        }
        return result;
    };
    __all__.range = range;

    // Any, all and sum

    function any (iterable) {
        for (var index = 0; index < iterable.length; index++) {
            if (bool (iterable [index])) {
                return true;
            }
        }
        return false;
    }
    function all (iterable) {
        for (var index = 0; index < iterable.length; index++) {
            if (! bool (iterable [index])) {
                return false;
            }
        }
        return true;
    }
    function sum (iterable) {
        var result = 0;
        for (var index = 0; index < iterable.length; index++) {
            result += iterable [index];
        }
        return result;
    }

    __all__.any = any;
    __all__.all = all;
    __all__.sum = sum;

    // Enumerate method, returning a zipped list
    function enumerate (iterable) {
        return zip (range (len (iterable)), iterable);
    }
    __all__.enumerate = enumerate;

    // Shallow and deepcopy

    function copy (anObject) {
        if (anObject == null || typeof anObject == "object") {
            return anObject;
        }
        else {
            var result = {};
            for (var attrib in obj) {
                if (anObject.hasOwnProperty (attrib)) {
                    result [attrib] = anObject [attrib];
                }
            }
            return result;
        }
    }
    __all__.copy = copy;

    function deepcopy (anObject) {
        if (anObject == null || typeof anObject == "object") {
            return anObject;
        }
        else {
            var result = {};
            for (var attrib in obj) {
                if (anObject.hasOwnProperty (attrib)) {
                    result [attrib] = deepcopy (anObject [attrib]);
                }
            }
            return result;
        }
    }
    __all__.deepcopy = deepcopy;

    // List extensions to Array

    function list (iterable) {                                      // All such creators should be callable without new
        var instance = iterable ? [] .slice.apply (iterable) : [];  // Spread iterable, n.b. array.slice (), so array before dot
        // Sort is the normal JavaScript sort, Python sort is a non-member function
        return instance;
    }
    __all__.list = list;
    Array.prototype.__class__ = list;   // All arrays are lists (not only if constructed by the list ctor), unless constructed otherwise
    list.__name__ = 'list';

    /*
    Array.from = function (iterator) { // !!! remove
        result = [];
        for (item of iterator) {
            result.push (item);
        }
        return result;
    }
    */

    Array.prototype.__iter__ = function () {return new __PyIterator__ (this);};

    Array.prototype.__getslice__ = function (start, stop, step) {
        if (start < 0) {
            start = this.length + start;
        }

        if (stop == null) {
            stop = this.length;
        }
        else if (stop < 0) {
            stop = this.length + stop;
        }
        else if (stop > this.length) {
            stop = this.length;
        }

        var result = list ([]);
        for (var index = start; index < stop; index += step) {
            result.push (this [index]);
        }

        return result;
    };

    Array.prototype.__setslice__ = function (start, stop, step, source) {
        if (start < 0) {
            start = this.length + start;
        }

        if (stop == null) {
            stop = this.length;
        }
        else if (stop < 0) {
            stop = this.length + stop;
        }

        if (step == null) { // Assign to 'ordinary' slice, replace subsequence
            Array.prototype.splice.apply (this, [start, stop - start] .concat (source));
        }
        else {              // Assign to extended slice, replace designated items one by one
            var sourceIndex = 0;
            for (var targetIndex = start; targetIndex < stop; targetIndex += step) {
                this [targetIndex] = source [sourceIndex++];
            }
        }
    };

    Array.prototype.__repr__ = function () {
        if (this.__class__ == set && !this.length) {
            return 'set()';
        }

        var result = !this.__class__ || this.__class__ == list ? '[' : this.__class__ == tuple ? '(' : '{';

        for (var index = 0; index < this.length; index++) {
            if (index) {
                result += ', ';
            }
            result += repr (this [index]);
        }

        if (this.__class__ == tuple && this.length == 1) {
            result += ',';
        }

        result += !this.__class__ || this.__class__ == list ? ']' : this.__class__ == tuple ? ')' : '}';;
        return result;
    };

    Array.prototype.__str__ = Array.prototype.__repr__;

    Array.prototype.append = function (element) {
        this.push (element);
    };

    Array.prototype.clear = function () {
        this.length = 0;
    };

    Array.prototype.extend = function (aList) {
        this.push.apply (this, aList);
    };

    Array.prototype.insert = function (index, element) {
        this.splice (index, 0, element);
    };

    Array.prototype.remove = function (element) {
        var index = this.indexOf (element);
        if (index == -1) {
            throw ValueError (new Error ());
        }
        this.splice (index, 1);
    };

    Array.prototype.index = function (element) {
        return this.indexOf (element);
    };

    Array.prototype.py_pop = function (index) {
        if (index == undefined) {
            return this.pop ();  // Remove last element
        }
        else {
            return this.splice (index, 1) [0];
        }
    };

    Array.prototype.py_sort = function () {
        __sort__.apply  (null, [this].concat ([] .slice.apply (arguments)));    // Can't work directly with arguments
        // Python params: (iterable, key = None, reverse = False)
        // py_sort is called with the Transcrypt kwargs mechanism, and just passes the params on to __sort__
        // __sort__ is def'ed with the Transcrypt kwargs mechanism
    };

    Array.prototype.__add__ = function (aList) {
        return list (this.concat (aList));
    };

    Array.prototype.__mul__ = function (scalar) {
        var result = this;
        for (var i = 1; i < scalar; i++) {
            result = result.concat (this);
        }
        return result;
    };

    Array.prototype.__rmul__ = Array.prototype.__mul__;

    // Tuple extensions to Array

    function tuple (iterable) {
        var instance = iterable ? [] .slice.apply (iterable) : [];
        instance.__class__ = tuple; // Not all arrays are tuples
        return instance;
    }
    __all__.tuple = tuple;
    tuple.__name__ = 'tuple';

    // Set extensions to Array
    // N.B. Since sets are unordered, set operations will occasionally alter the 'this' array by sorting it

    function set (iterable) {
        var instance = [];
        if (iterable) {
            for (var index = 0; index < iterable.length; index++) {
                instance.add (iterable [index]);
            }


        }
        instance.__class__ = set;   // Not all arrays are sets
        return instance;
    }
    __all__.set = set;
    set.__name__ = 'set';

    Array.prototype.__bindexOf__ = function (element) { // Used to turn O (n^2) into O (n log n)
    // Since sorting is lex, compare has to be lex. This also allows for mixed lists

        element += '';

        var mindex = 0;
        var maxdex = this.length - 1;

        while (mindex <= maxdex) {
            var index = (mindex + maxdex) / 2 | 0;
            var middle = this [index] + '';

            if (middle < element) {
                mindex = index + 1;
            }
            else if (middle > element) {
                maxdex = index - 1;
            }
            else {
                return index;
            }
        }

        return -1;
    };

    Array.prototype.add = function (element) {
        if (this.indexOf (element) == -1) { // Avoid duplicates in set
            this.push (element);
        }
    };

    Array.prototype.discard = function (element) {
        var index = this.indexOf (element);
        if (index != -1) {
            this.splice (index, 1);
        }
    };

    Array.prototype.isdisjoint = function (other) {
        this.sort ();
        for (var i = 0; i < other.length; i++) {
            if (this.__bindexOf__ (other [i]) != -1) {
                return false;
            }
        }
        return true;
    };

    Array.prototype.issuperset = function (other) {
        this.sort ();
        for (var i = 0; i < other.length; i++) {
            if (this.__bindexOf__ (other [i]) == -1) {
                return false;
            }
        }
        return true;
    };

    Array.prototype.issubset = function (other) {
        return set (other.slice ()) .issuperset (this); // Sort copy of 'other', not 'other' itself, since it may be an ordered sequence
    };

    Array.prototype.union = function (other) {
        var result = set (this.slice () .sort ());
        for (var i = 0; i < other.length; i++) {
            if (result.__bindexOf__ (other [i]) == -1) {
                result.push (other [i]);
            }
        }
        return result;
    };

    Array.prototype.intersection = function (other) {
        this.sort ();
        var result = set ();
        for (var i = 0; i < other.length; i++) {
            if (this.__bindexOf__ (other [i]) != -1) {
                result.push (other [i]);
            }
        }
        return result;
    };

    Array.prototype.difference = function (other) {
        var sother = set (other.slice () .sort ());
        var result = set ();
        for (var i = 0; i < this.length; i++) {
            if (sother.__bindexOf__ (this [i]) == -1) {
                result.push (this [i]);
            }
        }
        return result;
    };

    Array.prototype.symmetric_difference = function (other) {
        return this.union (other) .difference (this.intersection (other));
    };

    Array.prototype.py_update = function () {   // O (n)
        var updated = [] .concat.apply (this.slice (), arguments) .sort ();
        this.clear ();
        for (var i = 0; i < updated.length; i++) {
            if (updated [i] != updated [i - 1]) {
                this.push (updated [i]);
            }
        }
    };

    Array.prototype.__eq__ = function (other) { // Also used for list
        if (this.length != other.length) {
            return false;
        }
        if (this.__class__ == set) {
            this.sort ();
            other.sort ();
        }
        for (var i = 0; i < this.length; i++) {
            if (this [i] != other [i]) {
                return false;
            }
        }
        return true;
    };

    Array.prototype.__ne__ = function (other) { // Also used for list
        return !this.__eq__ (other);
    };

    Array.prototype.__le__ = function (other) {
        return this.issubset (other);
    };

    Array.prototype.__ge__ = function (other) {
        return this.issuperset (other);
    };

    Array.prototype.__lt__ = function (other) {
        return this.issubset (other) && !this.issuperset (other);
    };

    Array.prototype.__gt__ = function (other) {
        return this.issuperset (other) && !this.issubset (other);
    };

    // String extensions

    function str (stringable) {
        try {
            return stringable.__str__ ();
        }
        catch (exception) {
            try {
                return repr (stringable);
            }
            catch (exception) {
                return String (stringable); // No new, so no permanent String object but a primitive in a temporary 'just in time' wrapper
            }
        }
    };
    __all__.str = str;

    String.prototype.__class__ = str;   // All strings are str
    str.__name__ = 'str';

    String.prototype.__iter__ = function () {new __PyIterator__ (this);};

    String.prototype.__repr__ = function () {
        return (this.indexOf ('\'') == -1 ? '\'' + this + '\'' : '"' + this + '"') .py_replace ('\t', '\\t') .py_replace ('\n', '\\n');
    };

    String.prototype.__str__ = function () {
        return this;
    };

    String.prototype.capitalize = function () {
        return this.charAt (0).toUpperCase () + this.slice (1);
    };

    String.prototype.endswith = function (suffix) {
        return suffix == '' || this.slice (-suffix.length) == suffix;
    };

    String.prototype.find  = function (sub, start) {
        return this.indexOf (sub, start);
    };

    String.prototype.__getslice__ = function (start, stop, step) {
        if (start < 0) {
            start = this.length + start;
        }

        if (stop == null) {
            stop = this.length;
        }
        else if (stop < 0) {
            stop = this.length + stop;
        }

        var result = '';
        if (step == 1) {
            result = this.substring (start, stop);
        }
        else {
            for (var index = start; index < stop; index += step) {
                result = result.concat (this.charAt(index));
            }
        }
        return result;
    }

    // Since it's worthwhile for the 'format' function to be able to deal with *args, it is defined as a property
    // __get__ will produce a bound function if there's something before the dot
    // Since a call using *args is compiled to e.g. <object>.<function>.apply (null, args), the function has to be bound already
    // Otherwise it will never be, because of the null argument
    // Using 'this' rather than 'null' contradicts the requirement to be able to pass bound functions around
    // The object 'before the dot' won't be available at call time in that case, unless implicitly via the function bound to it
    // While for Python methods this mechanism is generated by the compiler, for JavaScript methods it has to be provided manually
    // Call memoizing is unattractive here, since every string would then have to hold a reference to a bound format method
    __setProperty__ (String.prototype, 'format', {
        get: function () {return __get__ (this, function (self) {
            var args = tuple ([] .slice.apply (arguments).slice (1));
            var autoIndex = 0;
            return self.replace (/\{(\w*)\}/g, function (match, key) {
                if (key == '') {
                    key = autoIndex++;
                }
                if (key == +key) {  // So key is numerical
                    return args [key] == undefined ? match : str (args [key]);
                }
                else {              // Key is a string
                    for (var index = 0; index < args.length; index++) {
                        // Find first 'dict' that has that key and the right field
                        if (typeof args [index] == 'object' && args [index][key] != undefined) {
                            return str (args [index][key]); // Return that field field
                        }
                    }
                    return match;
                }
            });
        });},
        enumerable: true
    });

    String.prototype.isalnum = function () {
        return /^[0-9a-zA-Z]{1,}$/.test(this)
    }

    String.prototype.isalpha = function () {
        return /^[a-zA-Z]{1,}$/.test(this)
    }

    String.prototype.isdecimal = function () {
        return /^[0-9]{1,}$/.test(this)
    }

    String.prototype.isdigit = function () {
        return this.isdecimal()
    }

    String.prototype.islower = function () {
        return /^[a-z]{1,}$/.test(this)
    }

    String.prototype.isupper = function () {
        return /^[A-Z]{1,}$/.test(this)
    }

    String.prototype.isspace = function () {
        return /^[\s]{1,}$/.test(this)
    }

    String.prototype.isnumeric = function () {
        return !isNaN (parseFloat (this)) && isFinite (this);
    };

    String.prototype.join = function (strings) {
        return strings.join (this);
    };

    String.prototype.lower = function () {
        return this.toLowerCase ();
    };

    String.prototype.py_replace = function (old, aNew, maxreplace) {
        return this.split (old, maxreplace) .join (aNew);
    };

    String.prototype.lstrip = function () {
        return this.replace (/^\s*/g, '');
    };

    String.prototype.rfind = function (sub, start) {
        return this.lastIndexOf (sub, start);
    };

    String.prototype.rsplit = function (sep, maxsplit) {    // Combination of general whitespace sep and positive maxsplit neither supported nor checked, expensive and rare
        if (sep == undefined || sep == null) {
            sep = /\s+/;
            var stripped = this.strip ();
        }
        else {
            var stripped = this;
        }

        if (maxsplit == undefined || maxsplit == -1) {
            return stripped.split (sep);
        }
        else {
            var result = stripped.split (sep);
            if (maxsplit < result.length) {
                var maxrsplit = result.length - maxsplit;
                return [result.slice (0, maxrsplit) .join (sep)] .concat (result.slice (maxrsplit));
            }
            else {
                return result;
            }
        }
    };

    String.prototype.rstrip = function () {
        return this.replace (/\s*$/g, '');
    };

    String.prototype.py_split = function (sep, maxsplit) {  // Combination of general whitespace sep and positive maxsplit neither supported nor checked, expensive and rare
        if (sep == undefined || sep == null) {
            sep = /\s+/;
            var stripped = this.strip ();
        }
        else {
            var stripped = this;
        }

        if (maxsplit == undefined || maxsplit == -1) {
            return stripped.split (sep);
        }
        else {
            var result = stripped.split (sep);
            if (maxsplit < result.length) {
                return result.slice (0, maxsplit).concat ([result.slice (maxsplit).join (sep)]);
            }
            else {
                return result;
            }
        }
    };

    String.prototype.startswith = function (prefix) {
        return this.indexOf (prefix) == 0;
    };

    String.prototype.strip = function () {
        return this.trim ();
    };

    String.prototype.upper = function () {
        return this.toUpperCase ();
    };

    String.prototype.__mul__ = function (scalar) {
        var result = this;
        for (var i = 1; i < scalar; i++) {
            result = result + this;
        }
        return result;
    };

    String.prototype.__rmul__ = String.prototype.__mul__;

    // Dict extensions to object

    function __keys__ () {
        var keys = [];
        for (var attrib in this) {
            if (!__specialattrib__ (attrib)) {
                keys.push (attrib);
            }
        }
        return keys;
    }

    function __items__ () {
        var items = [];
        for (var attrib in this) {
            if (!__specialattrib__ (attrib)) {
                items.push ([attrib, this [attrib]]);
            }
        }
        return items;
    }

    function __del__ (key) {
        delete this [key];
    }

    function __clear__ () {
        for (var attrib in this) {
            delete this [attrib];
        }
    }

    function __getdefault__ (aKey, aDefault) {  // Each Python object already has a function called __get__, so we call this one __getdefault__
        var result = this [aKey];
        return result == undefined ? (aDefault == undefined ? null : aDefault) : result;
    }

    function __setdefault__ (aKey, aDefault) {
        var result = this [aKey];
        if (result != undefined) {
            return result;
        }
        var val = aDefault == undefined ? null : aDefault;
        this [aKey] = val;
        return val;
    }

    function __pop__ (aKey, aDefault) {
        var result = this [aKey];
        if (result != undefined) {
            delete this [aKey];
            return result;
        } else {
            // Identify check because user could pass None
            if ( aDefault === undefined ) {
                throw KeyError (aKey, new Error());
            }
        }
        return aDefault;
    }
    
    function __popitem__ () {
        var aKey = Object.keys (this) [0];
        if (aKey == null) {
            throw KeyError (aKey, new Error ());
        }
        var result = tuple ([aKey, this [aKey]]);
        delete this [aKey];
        return result;
    }
    
    function __update__ (aDict) {
        for (var aKey in aDict) {
            this [aKey] = aDict [aKey];
        }
    }
    
    function __values__ () {
        var values = [];
        for (var attrib in this) {
            if (!__specialattrib__ (attrib)) {
                values.push (this [attrib]);
            }
        }
        return values;

    }
    
    function __dgetitem__ (aKey) {
        return this [aKey];
    }
    
    function __dsetitem__ (aKey, aValue) {
        this [aKey] = aValue;
    }

    function dict (objectOrPairs) {
        var instance = {};
        if (!objectOrPairs || objectOrPairs instanceof Array) { // It's undefined or an array of pairs
            if (objectOrPairs) {
                for (var index = 0; index < objectOrPairs.length; index++) {
                    var pair = objectOrPairs [index];
                    if ( !(pair instanceof Array) || pair.length != 2) {
                        throw ValueError(
                            "dict update sequence element #" + index +
                            " has length " + pair.length +
                            "; 2 is required", new Error());
                    }
                    var key = pair [0];
                    var val = pair [1];
                    if (!(objectOrPairs instanceof Array) && objectOrPairs instanceof Object) {
                         // User can potentially pass in an object
                         // that has a hierarchy of objects. This
                         // checks to make sure that these objects
                         // get converted to dict objects instead of
                         // leaving them as js objects.
                         
                         if (!isinstance (objectOrPairs, dict)) {
                             val = dict (val);
                         }
                    }
                    instance [key] = val;
                }
            }
        }
        else {
            if (isinstance (objectOrPairs, dict)) {
                // Passed object is a dict already so we need to be a little careful
                // N.B. - this is a shallow copy per python std - so
                // it is assumed that children have already become
                // python objects at some point.
                
                var aKeys = objectOrPairs.py_keys ();
                for (var index = 0; index < aKeys.length; index++ ) {
                    var key = aKeys [index];
                    instance [key] = objectOrPairs [key];
                }
            } else if (objectOrPairs instanceof Object) {
                // Passed object is a JavaScript object but not yet a dict, don't copy it
                instance = objectOrPairs;
            } else {
                // We have already covered Array so this indicates
                // that the passed object is not a js object - i.e.
                // it is an int or a string, which is invalid.
                
                throw ValueError ("Invalid type of object for dict creation", new Error ());
            }
        }

        // Trancrypt interprets e.g. {aKey: 'aValue'} as a Python dict literal rather than a JavaScript object literal
        // So dict literals rather than bare Object literals will be passed to JavaScript libraries
        // Some JavaScript libraries call all enumerable callable properties of an object that's passed to them
        // So the properties of a dict should be non-enumerable
        __setProperty__ (instance, '__class__', {value: dict, enumerable: false, writable: true});
        __setProperty__ (instance, 'py_keys', {value: __keys__, enumerable: false});
        __setProperty__ (instance, '__iter__', {value: function () {new __PyIterator__ (this.py_keys ());}, enumerable: false});
        __setProperty__ (instance, Symbol.iterator, {value: function () {new __JsIterator__ (this.py_keys ());}, enumerable: false});
        __setProperty__ (instance, 'py_items', {value: __items__, enumerable: false});
        __setProperty__ (instance, 'py_del', {value: __del__, enumerable: false});
        __setProperty__ (instance, 'py_clear', {value: __clear__, enumerable: false});
        __setProperty__ (instance, 'py_get', {value: __getdefault__, enumerable: false});
        __setProperty__ (instance, 'py_setdefault', {value: __setdefault__, enumerable: false});
        __setProperty__ (instance, 'py_pop', {value: __pop__, enumerable: false});
        __setProperty__ (instance, 'py_popitem', {value: __popitem__, enumerable: false});
        __setProperty__ (instance, 'py_update', {value: __update__, enumerable: false});
        __setProperty__ (instance, 'py_values', {value: __values__, enumerable: false});
        __setProperty__ (instance, '__getitem__', {value: __dgetitem__, enumerable: false});    // Needed since compound keys necessarily
        __setProperty__ (instance, '__setitem__', {value: __dsetitem__, enumerable: false});    // trigger overloading to deal with slices
        return instance;
    }

    __all__.dict = dict;
    dict.__name__ = 'dict';
    
    // Docstring setter

    function __setdoc__ (docString) {
        this.__doc__ = docString;
        return this;
    }

    // Python classes, methods and functions are all translated to JavaScript functions
    __setProperty__ (Function.prototype, '__setdoc__', {value: __setdoc__, enumerable: false});

    // General operator overloading, only the ones that make most sense in matrix and complex operations

    var __neg__ = function (a) {
        if (typeof a == 'object' && '__neg__' in a) {
            return a.__neg__ ();
        }
        else {
            return -a;
        }
    };
    __all__.__neg__ = __neg__;

    var __matmul__ = function (a, b) {
        return a.__matmul__ (b);
    };
    __all__.__matmul__ = __matmul__;

    var __pow__ = function (a, b) {
        if (typeof a == 'object' && '__pow__' in a) {
            return a.__pow__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rpow__ (a);
        }
        else {
            return Math.pow (a, b);
        }
    };
    __all__.pow = __pow__;

    var __jsmod__ = function (a, b) {
        if (typeof a == 'object' && '__mod__' in a) {
            return a.__mod__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rmod__ (a);
        }
        else {
            return a % b;
        }
    };
    __all__.__jsmod__ = __jsmod__;
    
    var __mod__ = function (a, b) {
        if (typeof a == 'object' && '__mod__' in a) {
            return a.__mod__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rmod__ (a);
        }
        else {
            return ((a % b) + b) % b;
        }
    };
    __all__.mod = __mod__;

    // Overloaded binary arithmetic
    
    var __mul__ = function (a, b) {
        if (typeof a == 'object' && '__mul__' in a) {
            return a.__mul__ (b);
        }
        else if (typeof b == 'object' && '__rmul__' in b) {
            return b.__rmul__ (a);
        }
        else if (typeof a == 'string') {
            return a.__mul__ (b);
        }
        else if (typeof b == 'string') {
            return b.__rmul__ (a);
        }
        else {
            return a * b;
        }
    };
    __all__.__mul__ = __mul__;

    var __truediv__ = function (a, b) {
        if (typeof a == 'object' && '__truediv__' in a) {
            return a.__truediv__ (b);
        }
        else if (typeof b == 'object' && '__rtruediv__' in b) {
            return b.__rtruediv__ (a);
        }
        else if (typeof a == 'object' && '__div__' in a) {
            return a.__div__ (b);
        }
        else if (typeof b == 'object' && '__rdiv__' in b) {
            return b.__rdiv__ (a);
        }
        else {
            return a / b;
        }
    };
    __all__.__truediv__ = __truediv__;

    var __floordiv__ = function (a, b) {
        if (typeof a == 'object' && '__floordiv__' in a) {
            return a.__floordiv__ (b);
        }
        else if (typeof b == 'object' && '__rfloordiv__' in b) {
            return b.__rfloordiv__ (a);
        }
        else if (typeof a == 'object' && '__div__' in a) {
            return a.__div__ (b);
        }
        else if (typeof b == 'object' && '__rdiv__' in b) {
            return b.__rdiv__ (a);
        }
        else {
            return Math.floor (a / b);
        }
    };
    __all__.__floordiv__ = __floordiv__;

    var __add__ = function (a, b) {
        if (typeof a == 'object' && '__add__' in a) {
            return a.__add__ (b);
        }
        else if (typeof b == 'object' && '__radd__' in b) {
            return b.__radd__ (a);
        }
        else {
            return a + b;
        }
    };
    __all__.__add__ = __add__;

    var __sub__ = function (a, b) {
        if (typeof a == 'object' && '__sub__' in a) {
            return a.__sub__ (b);
        }
        else if (typeof b == 'object' && '__rsub__' in b) {
            return b.__rsub__ (a);
        }
        else {
            return a - b;
        }
    };
    __all__.__sub__ = __sub__;

    // Overloaded binary bitwise
    
    var __lshift__ = function (a, b) {
        if (typeof a == 'object' && '__lshift__' in a) {
            return a.__lshift__ (b);
        }
        else if (typeof b == 'object' && '__rlshift__' in b) {
            return b.__rlshift__ (a);
        }
        else {
            return a << b;
        }
    };
    __all__.__lshift__ = __lshift__;

    var __rshift__ = function (a, b) {
        if (typeof a == 'object' && '__rshift__' in a) {
            return a.__rshift__ (b);
        }
        else if (typeof b == 'object' && '__rrshift__' in b) {
            return b.__rrshift__ (a);
        }
        else {
            return a >> b;
        }
    };
    __all__.__rshift__ = __rshift__;

    var __or__ = function (a, b) {
        if (typeof a == 'object' && '__or__' in a) {
            return a.__or__ (b);
        }
        else if (typeof b == 'object' && '__ror__' in b) {
            return b.__ror__ (a);
        }
        else {
            return a | b;
        }
    };
    __all__.__or__ = __or__;

    var __xor__ = function (a, b) {
        if (typeof a == 'object' && '__xor__' in a) {
            return a.__xor__ (b);
        }
        else if (typeof b == 'object' && '__rxor__' in b) {
            return b.__rxor__ (a);
        }
        else {
            return a ^ b;
        }
    };
    __all__.__xor__ = __xor__;

    var __and__ = function (a, b) {
        if (typeof a == 'object' && '__and__' in a) {
            return a.__and__ (b);
        }
        else if (typeof b == 'object' && '__rand__' in b) {
            return b.__rand__ (a);
        }
        else {
            return a & b;
        }
    };
    __all__.__and__ = __and__;

    // Overloaded binary compare
    
    var __eq__ = function (a, b) {
        if (typeof a == 'object' && '__eq__' in a) {
            return a.__eq__ (b);
        }
        else {
            return a == b;
        }
    };
    __all__.__eq__ = __eq__;

    var __ne__ = function (a, b) {
        if (typeof a == 'object' && '__ne__' in a) {
            return a.__ne__ (b);
        }
        else {
            return a != b
        }
    };
    __all__.__ne__ = __ne__;

    var __lt__ = function (a, b) {
        if (typeof a == 'object' && '__lt__' in a) {
            return a.__lt__ (b);
        }
        else {
            return a < b;
        }
    };
    __all__.__lt__ = __lt__;

    var __le__ = function (a, b) {
        if (typeof a == 'object' && '__le__' in a) {
            return a.__le__ (b);
        }
        else {
            return a <= b;
        }
    };
    __all__.__le__ = __le__;

    var __gt__ = function (a, b) {
        if (typeof a == 'object' && '__gt__' in a) {
            return a.__gt__ (b);
        }
        else {
            return a > b;
        }
    };
    __all__.__gt__ = __gt__;

    var __ge__ = function (a, b) {
        if (typeof a == 'object' && '__ge__' in a) {
            return a.__ge__ (b);
        }
        else {
            return a >= b;
        }
    };
    __all__.__ge__ = __ge__;
    
    // Overloaded augmented general
    
    var __imatmul__ = function (a, b) {
        if ('__imatmul__' in a) {
            return a.__imatmul__ (b);
        }
        else {
            return a.__matmul__ (b);
        }
    };
    __all__.__imatmul__ = __imatmul__;

    var __ipow__ = function (a, b) {
        if (typeof a == 'object' && '__pow__' in a) {
            return a.__ipow__ (b);
        }
        else if (typeof a == 'object' && '__ipow__' in a) {
            return a.__pow__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rpow__ (a);
        }
        else {
            return Math.pow (a, b);
        }
    };
    __all__.ipow = __ipow__;

    var __ijsmod__ = function (a, b) {
        if (typeof a == 'object' && '__imod__' in a) {
            return a.__ismod__ (b);
        }
        else if (typeof a == 'object' && '__mod__' in a) {
            return a.__mod__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rmod__ (a);
        }
        else {
            return a % b;
        }
    };
    __all__.ijsmod__ = __ijsmod__;
    
    var __imod__ = function (a, b) {
        if (typeof a == 'object' && '__imod__' in a) {
            return a.__imod__ (b);
        }
        else if (typeof a == 'object' && '__mod__' in a) {
            return a.__mod__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rmod__ (a);
        }
        else {
            return ((a % b) + b) % b;
        }
    };
    __all__.imod = __imod__;
    
    // Overloaded augmented arithmetic
    
    var __imul__ = function (a, b) {
        if (typeof a == 'object' && '__imul__' in a) {
            return a.__imul__ (b);
        }
        else if (typeof a == 'object' && '__mul__' in a) {
            return a = a.__mul__ (b);
        }
        else if (typeof b == 'object' && '__rmul__' in b) {
            return a = b.__rmul__ (a);
        }
        else if (typeof a == 'string') {
            return a = a.__mul__ (b);
        }
        else if (typeof b == 'string') {
            return a = b.__rmul__ (a);
        }
        else {
            return a *= b;
        }
    };
    __all__.__imul__ = __imul__;

    var __idiv__ = function (a, b) {
        if (typeof a == 'object' && '__idiv__' in a) {
            return a.__idiv__ (b);
        }
        else if (typeof a == 'object' && '__div__' in a) {
            return a = a.__div__ (b);
        }
        else if (typeof b == 'object' && '__rdiv__' in b) {
            return a = b.__rdiv__ (a);
        }
        else {
            return a /= b;
        }
    };
    __all__.__idiv__ = __idiv__;

    var __iadd__ = function (a, b) {
        if (typeof a == 'object' && '__iadd__' in a) {
            return a.__iadd__ (b);
        }
        else if (typeof a == 'object' && '__add__' in a) {
            return a = a.__add__ (b);
        }
        else if (typeof b == 'object' && '__radd__' in b) {
            return a = b.__radd__ (a);
        }
        else {
            return a += b;
        }
    };
    __all__.__iadd__ = __iadd__;

    var __isub__ = function (a, b) {
        if (typeof a == 'object' && '__isub__' in a) {
            return a.__isub__ (b);
        }
        else if (typeof a == 'object' && '__sub__' in a) {
            return a = a.__sub__ (b);
        }
        else if (typeof b == 'object' && '__rsub__' in b) {
            return a = b.__rsub__ (a);
        }
        else {
            return a -= b;
        }
    };
    __all__.__isub__ = __isub__;

    // Overloaded augmented bitwise
    
    var __ilshift__ = function (a, b) {
        if (typeof a == 'object' && '__ilshift__' in a) {
            return a.__ilshift__ (b);
        }
        else if (typeof a == 'object' && '__lshift__' in a) {
            return a = a.__lshift__ (b);
        }
        else if (typeof b == 'object' && '__rlshift__' in b) {
            return a = b.__rlshift__ (a);
        }
        else {
            return a <<= b;
        }
    };
    __all__.__ilshift__ = __ilshift__;

    var __irshift__ = function (a, b) {
        if (typeof a == 'object' && '__irshift__' in a) {
            return a.__irshift__ (b);
        }
        else if (typeof a == 'object' && '__rshift__' in a) {
            return a = a.__rshift__ (b);
        }
        else if (typeof b == 'object' && '__rrshift__' in b) {
            return a = b.__rrshift__ (a);
        }
        else {
            return a >>= b;
        }
    };
    __all__.__irshift__ = __irshift__;

    var __ior__ = function (a, b) {
        if (typeof a == 'object' && '__ior__' in a) {
            return a.__ior__ (b);
        }
        else if (typeof a == 'object' && '__or__' in a) {
            return a = a.__or__ (b);
        }
        else if (typeof b == 'object' && '__ror__' in b) {
            return a = b.__ror__ (a);
        }
        else {
            return a |= b;
        }
    };
    __all__.__ior__ = __ior__;

    var __ixor__ = function (a, b) {
        if (typeof a == 'object' && '__ixor__' in a) {
            return a.__ixor__ (b);
        }
        else if (typeof a == 'object' && '__xor__' in a) {
            return a = a.__xor__ (b);
        }
        else if (typeof b == 'object' && '__rxor__' in b) {
            return a = b.__rxor__ (a);
        }
        else {
            return a ^= b;
        }
    };
    __all__.__ixor__ = __ixor__;

    var __iand__ = function (a, b) {
        if (typeof a == 'object' && '__iand__' in a) {
            return a.__iand__ (b);
        }
        else if (typeof a == 'object' && '__and__' in a) {
            return a = a.__and__ (b);
        }
        else if (typeof b == 'object' && '__rand__' in b) {
            return a = b.__rand__ (a);
        }
        else {
            return a &= b;
        }
    };
    __all__.__iand__ = __iand__;
    
    // Indices and slices

    var __getitem__ = function (container, key) {                           // Slice c.q. index, direct generated call to runtime switch
        if (typeof container == 'object' && '__getitem__' in container) {
            return container.__getitem__ (key);                             // Overloaded on container
        }
        else {
            return container [key];                                         // Container must support bare JavaScript brackets
        }
    };
    __all__.__getitem__ = __getitem__;

    var __setitem__ = function (container, key, value) {                    // Slice c.q. index, direct generated call to runtime switch
        if (typeof container == 'object' && '__setitem__' in container) {
            container.__setitem__ (key, value);                             // Overloaded on container
        }
        else {
            container [key] = value;                                        // Container must support bare JavaScript brackets
        }
    };
    __all__.__setitem__ = __setitem__;

    var __getslice__ = function (container, lower, upper, step) {           // Slice only, no index, direct generated call to runtime switch
        if (typeof container == 'object' && '__getitem__' in container) {
            return container.__getitem__ ([lower, upper, step]);            // Container supports overloaded slicing c.q. indexing
        }
        else {
            return container.__getslice__ (lower, upper, step);             // Container only supports slicing injected natively in prototype
        }
    };
    __all__.__getslice__ = __getslice__;

    var __setslice__ = function (container, lower, upper, step, value) {    // Slice, no index, direct generated call to runtime switch
        if (typeof container == 'object' && '__setitem__' in container) {
            container.__setitem__ ([lower, upper, step], value);            // Container supports overloaded slicing c.q. indexing
        }
        else {
            container.__setslice__ (lower, upper, step, value);             // Container only supports slicing injected natively in prototype
        }
    };
    __all__.__setslice__ = __setslice__;
	__nest__ (
		__all__,
		'math', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var pi = Math.PI;
					var e = Math.E;
					var exp = Math.exp;
					var expm1 = function (x) {
						return Math.exp (x) - 1;
					};
					var log = function (x, base) {
						return (base === undefined ? Math.log (x) : Math.log (x) / Math.log (base));
					};
					var log1p = function (x) {
						return Math.log (x + 1);
					};
					var log2 = function (x) {
						return Math.log (x) / Math.LN2;
					};
					var log10 = function (x) {
						return Math.log (x) / Math.LN10;
					};
					var pow = Math.pow;
					var sqrt = Math.sqrt;
					var sin = Math.sin;
					var cos = Math.cos;
					var tan = Math.tan;
					var asin = Math.asin;
					var acos = Math.acos;
					var atan = Math.atan;
					var atan2 = Math.atan2;
					var hypot = Math.hypot;
					var degrees = function (x) {
						return (x * 180) / Math.PI;
					};
					var radians = function (x) {
						return (x * Math.PI) / 180;
					};
					var sinh = Math.sinh;
					var cosh = Math.cosh;
					var tanh = Math.tanh;
					var asinh = Math.asinh;
					var acosh = Math.acosh;
					var atanh = Math.atanh;
					var floor = Math.floor;
					var ceil = Math.ceil;
					var trunc = Math.trunc;
					var isnan = isNaN;
					var inf = Infinity;
					var nan = NaN;
					__pragma__ ('<all>')
						__all__.acos = acos;
						__all__.acosh = acosh;
						__all__.asin = asin;
						__all__.asinh = asinh;
						__all__.atan = atan;
						__all__.atan2 = atan2;
						__all__.atanh = atanh;
						__all__.ceil = ceil;
						__all__.cos = cos;
						__all__.cosh = cosh;
						__all__.degrees = degrees;
						__all__.e = e;
						__all__.exp = exp;
						__all__.expm1 = expm1;
						__all__.floor = floor;
						__all__.hypot = hypot;
						__all__.inf = inf;
						__all__.isnan = isnan;
						__all__.log = log;
						__all__.log10 = log10;
						__all__.log1p = log1p;
						__all__.log2 = log2;
						__all__.nan = nan;
						__all__.pi = pi;
						__all__.pow = pow;
						__all__.radians = radians;
						__all__.sin = sin;
						__all__.sinh = sinh;
						__all__.sqrt = sqrt;
						__all__.tan = tan;
						__all__.tanh = tanh;
						__all__.trunc = trunc;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'random', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var _array = function () {
						var __accu0__ = [];
						for (var i = 0; i < 624; i++) {
							__accu0__.append (0);
						}
						return __accu0__;
					} ();
					var _index = 0;
					var _bitmask1 = Math.pow (2, 32) - 1;
					var _bitmask2 = Math.pow (2, 31);
					var _bitmask3 = Math.pow (2, 31) - 1;
					var _fill_array = function () {
						for (var i = 0; i < 624; i++) {
							var y = (_array [i] & _bitmask2) + (_array [__mod__ (i + 1, 624)] & _bitmask3);
							_array [i] = _array [__mod__ (i + 397, 624)] ^ y >> 1;
							if (__mod__ (y, 2) != 0) {
								_array [i] ^= 2567483615;
							}
						}
					};
					var _random_integer = function () {
						if (_index == 0) {
							_fill_array ();
						}
						var y = _array [_index];
						y ^= y >> 11;
						y ^= y << 7 & 2636928640;
						y ^= y << 15 & 4022730752;
						y ^= y >> 18;
						_index = __mod__ (_index + 1, 624);
						return y;
					};
					var seed = function (x) {
						if (typeof x == 'undefined' || (x != null && x .hasOwnProperty ("__kwargtrans__"))) {;
							var x = int (_bitmask3 * Math.random ());
						};
						_array [0] = x;
						for (var i = 1; i < 624; i++) {
							_array [i] = (1812433253 * _array [i - 1] ^ (_array [i - 1] >> 30) + i) & _bitmask1;
						}
					};
					var randint = function (a, b) {
						return a + __mod__ (_random_integer (), (b - a) + 1);
					};
					var choice = function (seq) {
						return seq [randint (0, len (seq) - 1)];
					};
					var random = function () {
						return _random_integer () / _bitmask3;
					};
					seed ();
					__pragma__ ('<all>')
						__all__._array = _array;
						__all__._bitmask1 = _bitmask1;
						__all__._bitmask2 = _bitmask2;
						__all__._bitmask3 = _bitmask3;
						__all__._fill_array = _fill_array;
						__all__._index = _index;
						__all__._random_integer = _random_integer;
						__all__.choice = choice;
						__all__.randint = randint;
						__all__.random = random;
						__all__.seed = seed;
					__pragma__ ('</all>')
				}
			}
		}
	);
	(function () {
		var math = {};
		var random = {};
		__nest__ (random, '', __init__ (__world__.random));
		__nest__ (math, '', __init__ (__world__.math));
		var Node = __class__ ('Node', [object], {
			get __init__ () {return __get__ (this, function (self, curState, children, utility, visits, parent, action) {
				self.action = action;
				self.state = curState;
				self.children = children;
				self.utility = utility;
				self.visits = visits;
				self.parent = parent;
			});}
		});
		var select = function (node) {
			if (node.visits == 0 || len (node.children) == 0) {
				return node;
			}
			for (var i = 0; i < len (node.children); i++) {
				if (node.children [i].visits == 0) {
					return node.children [i];
				}
			}
			var result = random.choice (node.children);
			var score = selectfn (result);
			for (var i = 0; i < len (node.children); i++) {
				var newNode = node.children [i];
				if (newNode != result) {
					var newScore = selectfn (newNode);
					if (newScore > score) {
						var score = newScore;
						var result = newNode;
					}
				}
			}
			return select (result);
		};
		var expand = function (game, node) {
			var state = node.state;
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			var sortedChildren = list ([]);
			var __iterable0__ = game.actions (state);
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var move = __iterable0__ [__index0__];
				var newState = game.simulatedMove (state, move);
				var __left0__ = newState;
				var newBoard = __left0__ [0];
				var newPlayer = __left0__ [1];
				var newNode = Node (newState, list ([]), evaluationFunction (game, newBoard, player), 0, node, move);
				sortedChildren.append (newNode);
			}
			var sortedChildren = sorted (sortedChildren, __kwargtrans__ ({key: (function __lambda__ (score) {
				return score.utility;
			}), reverse: true}));
			node.children = sortedChildren.__getslice__ (0, 10, 1);
			return node;
		};
		var selectfn = function (node) {
			return node.utility / node.visits + math.sqrt ((2 * math.log (node.parent.visits)) / node.visits);
		};
		var backpropagate = function (node, score) {
			node.visits++;
			node.utility = node.utility + score;
			if (node.parent) {
				backpropagate (node.parent, score);
			}
		};
		var MCTSdepthCharge = function (game, node, originalPlayer) {
			var state = node.state;
			if (game.isEnd (state)) {
				if (game.isWinner (state, state [1])) {
					if (originalPlayer) {
						backpropagate (node, 1);
						return ;
					}
					else {
						backpropagate (node, 0);
						return ;
					}
				}
				else if (game.isWinner (state, game.otherPlayer (state [1]))) {
					if (originalPlayer) {
						backpropagate (node, 0);
						return ;
					}
					else {
						backpropagate (node, 1);
						return ;
					}
				}
			}
			var moves = game.actions (state);
			var rand = random.choice (moves);
			var newState = game.simulatedMove (state, rand);
			var __iterable0__ = node.children;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var child = __iterable0__ [__index0__];
				if (child.state == newState) {
					MCTSdepthCharge (game, child, !(originalPlayer));
					return ;
				}
			}
			var newNode = Node (newState, list ([]), 0.0, 0.0, node, rand);
			node.children.append (newNode);
			MCTSdepthCharge (game, newNode, !(originalPlayer));
		};
		var monteCarloTreeSearch = function (game, state) {
			var rootNode = Node (state, list ([]), 0.0, 0.0, null, null);
			var count = 200000;
			var node = rootNode;
			var __iterable0__ = game.actions (state);
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				if (game.isWinner (game.simulatedMove (state, action), state [1])) {
					return action;
				}
			}
			for (var i = 0; i < count; i++) {
				var node = select (node);
				var node = expand (game, node);
				var __iterable0__ = node.children;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var child = __iterable0__ [__index0__];
					MCTSdepthCharge (game, child, false);
				}
			}
			var move = sorted (rootNode.children, __kwargtrans__ ({key: (function __lambda__ (c) {
				return c.utility / c.visits;
			}), reverse: true})) [0].action;
			return move;
		};
		var monteCarloSearch = function (game, state) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			var scoredMoves = list ([]);
			var moves = shuffle (game.actions (state));
			var __iterable0__ = moves;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var move = __iterable0__ [__index0__];
				var __left0__ = game.simulatedMove (state, move);
				var newBoard = __left0__ [0];
				var newPlayer = __left0__ [1];
				var score = evaluationFunction (game, newBoard, player);
				scoredMoves.append (tuple ([move, score]));
			}
			var scoredMoves = sorted (scoredMoves, __kwargtrans__ ({key: (function __lambda__ (scoredMove) {
				return scoredMove [1];
			}), reverse: true}));
			var children = scoredMoves.__getslice__ (0, 5, 1);
			var count = 100;
			var childrenScores = list ([]);
			for (var i = 0; i < len (children); i++) {
				var move = children [i];
				var monteScore = 0;
				var newState = game.simulatedMove (state, move [0]);
				for (var j = 0; j < count; j++) {
					monteScore += depthCharge (game, newState, false);
				}
				var monteScore = float (monteScore) / count;
				childrenScores.append (tuple ([move, monteScore]));
			}
			var childrenScores = sorted (childrenScores, __kwargtrans__ ({key: (function __lambda__ (child) {
				return child [1];
			}), reverse: true}));
			var __left0__ = childrenScores [0];
			var bestMove = __left0__ [0];
			var _ = __left0__ [1];
			return bestMove [0];
		};
		var depthCharge = function (game, state, originalPlayer) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (game.isEnd (state)) {
				if (originalPlayer) {
					return evaluationFunction (game, board, player);
				}
				else {
					return -(evaluationFunction (game, board, game.otherPlayer (player)));
				}
			}
			var moves = game.actions (state);
			var nextMove = random.choice (moves);
			var newState = game.simulatedMove (state, nextMove);
			return depthCharge (game, newState, !(originalPlayer));
		};
		var randomMove = function (game, state) {
			return random.choice (game.actions (state));
		};
		var baselineMove = function (game, state) {
			var __left0__ = state;
			var _ = __left0__ [0];
			var player = __left0__ [1];
			var bestPath = 0;
			var options = list ([]);
			var actions = game.actions (state);
			var __iterable0__ = actions;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				var newState = game.simulatedMove (state, action);
				var __left0__ = newState;
				var newBoard = __left0__ [0];
				var _ = __left0__ [1];
				var newPathLength = game.longestPath (newBoard, player);
				if (newPathLength > bestPath) {
					var bestPath = newPathLength;
					var options = list ([action]);
				}
				else if (newPathLength == bestPath) {
					options.append (action);
				}
			}
			if (len (options) == 0) {
				return randomMove (game, state);
			}
			return random.choice (options);
		};
		var advancedBaselineMove = function (game, state) {
			var __left0__ = state;
			var _ = __left0__ [0];
			var player = __left0__ [1];
			var bestScore = 0;
			var options = list ([]);
			var actions = game.actions (state);
			var __iterable0__ = actions;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				var newState = game.simulatedMove (state, action);
				var __left0__ = newState;
				var newBoard = __left0__ [0];
				var _ = __left0__ [1];
				var newScore = game.longestPath (newBoard, player) - 0.4 * game.longestPath (newBoard, game.otherPlayer (player));
				if (newScore > bestScore) {
					var bestScore = newScore;
					var options = list ([action]);
				}
				else if (newScore == bestScore) {
					options.append (action);
				}
			}
			if (len (options) == 0) {
				return randomMove (game, state);
			}
			return random.choice (options);
		};
		var featuresMove = function (game, state) {
			var __left0__ = state;
			var _ = __left0__ [0];
			var player = __left0__ [1];
			var bestScore = 0;
			var options = list ([]);
			var actions = game.actions (state);
			var __iterable0__ = actions;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				var newState = game.simulatedMove (state, action);
				var __left0__ = newState;
				var newBoard = __left0__ [0];
				var _ = __left0__ [1];
				var newScore = evaluationFunction (game, newBoard, player);
				if (newScore > bestScore) {
					var bestScore = newScore;
					var options = list ([action]);
				}
				else if (newScore == bestScore) {
					options.append (action);
				}
			}
			if (len (options) == 0) {
				return randomMove (game, state);
			}
			return random.choice (options);
		};
		var smartFeaturesMove = function (game, state) {
			var __left0__ = state;
			var _ = __left0__ [0];
			var player = __left0__ [1];
			var bestScore = 0;
			var options = list ([]);
			var actions = game.actions (state);
			var __iterable0__ = actions;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				var newState = game.simulatedMove (state, action);
				var __left0__ = newState;
				var newBoard = __left0__ [0];
				var _ = __left0__ [1];
				var newScore = smartEvaluationFunction (game, newBoard, player);
				if (newScore > bestScore) {
					var bestScore = newScore;
					var options = list ([action]);
				}
				else if (newScore == bestScore) {
					options.append (action);
				}
			}
			if (len (options) == 0) {
				return randomMove (game, state);
			}
			return random.choice (options);
		};
		var TDLfeaturesMove = function (game, state) {
			var __left0__ = state;
			var _ = __left0__ [0];
			var player = __left0__ [1];
			var bestScore = -(float ('inf'));
			var options = list ([]);
			var actions = game.actions (state);
			var __iterable0__ = actions;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				var newState = game.simulatedMove (state, action);
				var __left0__ = newState;
				var newBoard = __left0__ [0];
				var _ = __left0__ [1];
				var newScore = TDLevaluationFunction (game, newBoard, player);
				if (newScore > bestScore) {
					var bestScore = newScore;
					var options = list ([action]);
				}
				else if (newScore == bestScore) {
					options.append (action);
				}
			}
			if (len (options) == 0) {
				print ('hello...');
				return randomMove (game, state);
			}
			return random.choice (options);
		};
		var value = function (game, state, depth, alpha, beta, originalPlayer) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (game.isEnd (state) || depth == 0) {
				if (originalPlayer) {
					return evaluationFunction (game, board, player);
				}
				else {
					return evaluationFunction (game, board, game.otherPlayer (player));
				}
			}
			else if (originalPlayer) {
				var highestScore = -(float ('inf'));
				var __iterable0__ = game.actions (state);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					var score = value (game, game.simulatedMove (state, action), depth - 1, alpha, beta, false);
					var highestScore = MAX (list ([highestScore, score]));
					var alpha = MAX (list ([alpha, highestScore]));
					if (beta <= alpha) {
						break;
					}
				}
				return highestScore;
			}
			else {
				var lowestScore = float ('inf');
				var __iterable0__ = game.actions (state);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					var score = value (game, game.simulatedMove (state, action), depth - 1, alpha, beta, true);
					var lowestScore = MIN (list ([lowestScore, score]));
					var beta = MIN (list ([beta, lowestScore]));
					if (beta <= alpha) {
						break;
					}
				}
				return lowestScore;
			}
		};
		var MAX = function (array) {
			var currMax = -(float ('inf'));
			var __iterable0__ = array;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var x = __iterable0__ [__index0__];
				if (x > currMax) {
					var currMax = x;
				}
			}
			return currMax;
		};
		var MIN = function (array) {
			var currMin = float ('inf');
			var __iterable0__ = array;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var x = __iterable0__ [__index0__];
				if (x < currMin) {
					var currMin = x;
				}
			}
			return currMin;
		};
		var minimax = function (game, state) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			var tempBoard = function () {
				var __accu0__ = [];
				var __iterable0__ = board;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var row = __iterable0__ [__index0__];
					__accu0__.append (row.__getslice__ (0, null, 1));
				}
				return __accu0__;
			} ();
			var legalMoves = game.actions (state);
			var scores = function () {
				var __accu0__ = [];
				var __iterable0__ = legalMoves;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					__accu0__.append (value (game, game.simulatedMove (tuple ([tempBoard, player]), action), 1, -(float ('inf')), float ('inf'), false));
				}
				return __accu0__;
			} ();
			var bestScore = MAX (scores);
			var bestIndices = function () {
				var __accu0__ = [];
				for (var index = 0; index < len (scores); index++) {
					if (scores [index] == bestScore) {
						__accu0__.append (index);
					}
				}
				return __accu0__;
			} ();
			var chosenIndex = random.choice (bestIndices);
			return legalMoves [chosenIndex];
		};
		var advancedMinimax = function (game, state) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			var tempBoard = function () {
				var __accu0__ = [];
				var __iterable0__ = board;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var row = __iterable0__ [__index0__];
					__accu0__.append (row.__getslice__ (0, null, 1));
				}
				return __accu0__;
			} ();
			var legalMoves = game.actions (state);
			var piecesPlayed = 96 - 0.5 * len (legalMoves);
			var depth = int (piecesPlayed / 30);
			print (depth);
			var scores = function () {
				var __accu0__ = [];
				var __iterable0__ = legalMoves;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					__accu0__.append (value (game, game.simulatedMove (tuple ([tempBoard, player]), action), depth, -(float ('inf')), float ('inf'), false));
				}
				return __accu0__;
			} ();
			var bestScore = MAX (scores);
			var bestIndices = function () {
				var __accu0__ = [];
				for (var index = 0; index < len (scores); index++) {
					if (scores [index] == bestScore) {
						__accu0__.append (index);
					}
				}
				return __accu0__;
			} ();
			var chosenIndex = random.choice (bestIndices);
			return legalMoves [chosenIndex];
		};
		var shuffle = function (array) {
			var currentIndex = len (array);
			while (0 != currentIndex) {
				var randomIndex = int (random.random () * currentIndex);
				currentIndex--;
				var tempValue = array [currentIndex];
				array [currentIndex] = array [randomIndex];
				array [randomIndex] = tempValue;
			}
			return array;
		};
		var oneMoveAway = function (game, board, player) {
			var actions = game.actions (tuple ([board, player]));
			var winningActions = list ([]);
			var __iterable0__ = actions;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				if (game.isWinner (game.simulatedMove (tuple ([board, player]), action), player)) {
					return true;
				}
			}
			return false;
		};
		var beamScores = function (game, state, depth, beamWidth, evalFunction) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (game.isEnd (state) || depth == 0) {
				return list ([tuple ([evalFunction (game, board, player), null, state])]);
			}
			var actions = shuffle (game.actions (state));
			var numTopScores = beamWidth [depth - 1];
			if (numTopScores == null) {
				var numTopScores = len (actions);
			}
			var topScores = function () {
				var __accu0__ = [];
				for (var i = 0; i < numTopScores; i++) {
					__accu0__.append (tuple ([-(float ('inf')), null, null]));
				}
				return __accu0__;
			} ();
			var newStates = list ([]);
			var __iterable0__ = actions;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				var __left0__ = game.simulatedMove (state, action);
				var newBoard = __left0__ [0];
				var newPlayer = __left0__ [1];
				var newScore = evalFunction (game, newBoard, player);
				var minScore = sorted (topScores, __kwargtrans__ ({key: (function __lambda__ (score) {
					return score [0];
				})})) [0];
				if (newScore > minScore [0]) {
					topScores.remove (minScore);
					topScores.append (tuple ([newScore, action, tuple ([newBoard, newPlayer])]));
				}
			}
			var newTopScores = list ([]);
			var __iterable0__ = topScores;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var __left0__ = __iterable0__ [__index0__];
				var score = __left0__ [0];
				var action = __left0__ [1];
				var newState = __left0__ [2];
				var __left0__ = sorted (beamScores (game, newState, depth - 1, beamWidth, evalFunction), __kwargtrans__ ({key: (function __lambda__ (score) {
					return score [0];
				}), reverse: true})) [0];
				var _ = __left0__ [0];
				var _ = __left0__ [1];
				var lastState = __left0__ [2];
				newTopScores.append (tuple ([evalFunction (game, lastState [0], player), action, lastState]));
			}
			return newTopScores;
		};
		var beamMinimax = function (game, state) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (oneMoveAway (game, board, game.otherPlayer (player))) {
				var depth = 2;
				var beamWidth = list ([null, null]);
			}
			else {
				var depth = 3;
				var beamWidth = list ([1, 5, 10]);
			}
			var scores = beamScores (game, state, depth, beamWidth, evaluationFunction);
			var __left0__ = sorted (scores, __kwargtrans__ ({key: (function __lambda__ (score) {
				return score [0];
			}), reverse: true})) [0];
			var _ = __left0__ [0];
			var bestMove = __left0__ [1];
			var _ = __left0__ [2];
			return bestMove;
		};
		var beamMinimaxMoreFeatures = function (game, state) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (oneMoveAway (game, board, game.otherPlayer (player))) {
				var depth = 2;
				var beamWidth = list ([null, null]);
			}
			else {
				var depth = 3;
				var beamWidth = list ([1, 5, 10]);
			}
			var scores = beamScores (game, state, depth, beamWidth, smartEvaluationFunction);
			var __left0__ = sorted (scores, __kwargtrans__ ({key: (function __lambda__ (score) {
				return score [0];
			}), reverse: true})) [0];
			var _ = __left0__ [0];
			var bestMove = __left0__ [1];
			var _ = __left0__ [2];
			return bestMove;
		};
		var beamMinimaxTDL = function (game, state) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (oneMoveAway (game, board, game.otherPlayer (player))) {
				var depth = 2;
				var beamWidth = list ([null, null]);
			}
			else {
				var depth = 3;
				var beamWidth = list ([1, 5, 10]);
			}
			var scores = beamScores (game, state, depth, beamWidth, TDLevaluationFunction);
			var __left0__ = sorted (scores, __kwargtrans__ ({key: (function __lambda__ (score) {
				return score [0];
			}), reverse: true})) [0];
			var _ = __left0__ [0];
			var bestMove = __left0__ [1];
			var _ = __left0__ [2];
			return bestMove;
		};
		var AVG = function (scores) {
			var scores = sorted (scores);
			var weightedTotal = 0;
			for (var i = 0; i < min (5, len (scores)); i++) {
				weightedTotal += scores [i] / (2 ^ i + 1);
			}
			return weightedTotal;
		};
		var valueExpectimax = function (game, state, depth, originalPlayer) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (game.isEnd (state) || depth == 0) {
				if (originalPlayer) {
					return TDLevaluationFunction (game, board, player);
				}
				else {
					return TDLevaluationFunction (game, board, game.otherPlayer (player));
				}
			}
			else if (originalPlayer) {
				var highestScore = -(float ('inf'));
				var __iterable0__ = game.actions (state);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					var score = valueExpectimax (game, game.simulatedMove (state, action), depth - 1, false);
					var highestScore = MAX (list ([highestScore, score]));
				}
				return highestScore;
			}
			else {
				var scores = list ([]);
				var __iterable0__ = game.actions (state);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					var score = valueExpectimax (game, game.simulatedMove (state, action), depth - 1, true);
					scores.append (score);
				}
				var sortedScores = sorted (scores, __kwargtrans__ ({reverse: true}));
				var expectedScore = 0;
				for (var i = 0; i < min (5, len (sortedScores)); i++) {
					expectedScore += sortedScores [i];
				}
				var expectedScore = expectedScore / 5.0;
				return expectedScore;
			}
		};
		var advancedExpectimax = function (game, state) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (oneMoveAway (game, board, game.otherPlayer (player))) {
				return beamMinimax (game, state);
			}
			var tempBoard = function () {
				var __accu0__ = [];
				var __iterable0__ = board;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var row = __iterable0__ [__index0__];
					__accu0__.append (row.__getslice__ (0, null, 1));
				}
				return __accu0__;
			} ();
			var legalMoves = game.actions (state);
			var piecesPlayed = 96 - 0.5 * len (legalMoves);
			var depth = int (piecesPlayed / 20);
			var scores = function () {
				var __accu0__ = [];
				var __iterable0__ = legalMoves;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					__accu0__.append (valueExpectimax (game, game.simulatedMove (tuple ([tempBoard, player]), action), depth, false));
				}
				return __accu0__;
			} ();
			var bestScore = MAX (scores);
			var bestIndices = function () {
				var __accu0__ = [];
				for (var index = 0; index < len (scores); index++) {
					if (scores [index] == bestScore) {
						__accu0__.append (index);
					}
				}
				return __accu0__;
			} ();
			var chosenIndex = random.choice (bestIndices);
			return legalMoves [chosenIndex];
		};
		var featureExtractor = function (game, board, player) {
			var myLongestPath = game.longestPath (board, player);
			var yourLongestPath = game.longestPath (board, game.otherPlayer (player));
			var __left0__ = game.countPieces (board, player);
			var myNumPermanents = __left0__ [0];
			var yourNumPermanents = __left0__ [1];
			var myNum1EmptyNeighbor = __left0__ [2];
			var yourNum1EmptyNeighbor = __left0__ [3];
			var myNum2EmptyNeighbor = __left0__ [4];
			var yourNum2EmptyNeighbor = __left0__ [5];
			var differenceNumPieces = __left0__ [6];
			return list ([myLongestPath, yourLongestPath, myNumPermanents, yourNumPermanents, myNum1EmptyNeighbor, yourNum1EmptyNeighbor, myNum2EmptyNeighbor, yourNum2EmptyNeighbor, differenceNumPieces]);
		};
		var evaluationFunction = function (game, board, player) {
			var features = featureExtractor (game, board, player);
			var weights = list ([20, -(8), 3, -(6), -(0.2), 0.2, 0.1, -(0.1), 1]);
			var results = function () {
				var __accu0__ = [];
				var __iterable0__ = zip (features, weights);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					__accu0__.append (i * j);
				}
				return __accu0__;
			} ();
			if (game.isEnd (tuple ([board, player]))) {
				return game.utility (tuple ([board, player])) + sum (results);
			}
			return sum (results);
		};
		var initSmartFeatureWeights = function () {
			var weights = dict (float);
			weights ['myLongestPath'] = 20;
			weights ['yourLongestPath'] = -(8);
			weights ['myCols'] = 2;
			weights ['yourCols'] = -(2);
			weights ['myPerm'] = 3;
			weights ['yourPerm'] = -(6);
			weights ['myTotal'] = 0.5;
			weights ['yourTotal'] = -(0.5);
			weights ['my1Empty'] = -(0.1);
			weights ['your1Empty'] = 0.1;
			weights ['my2Empty'] = 0.2;
			weights ['your2Empty'] = -(0.2);
			weights ['my3Empty'] = 0;
			weights ['your3Empty'] = 0;
			weights ['my4Empty'] = 0;
			weights ['your4Empty'] = 0;
			weights ['my5Empty'] = 0;
			weights ['your5Empty'] = 0;
			weights ['my6Empty'] = 0;
			weights ['your6Empty'] = 0;
			weights ['my7Empty'] = 0;
			weights ['your7Empty'] = 0;
			weights ['my8Empty'] = 0;
			weights ['your8Empty'] = 0;
			weights ['my1Flip'] = 0;
			weights ['your1Flip'] = 0;
			weights ['my2Flip'] = 0;
			weights ['your2Flip'] = 0;
			weights ['my3Flip'] = 0.01;
			weights ['your3Flip'] = -(0.01);
			weights ['my4Flip'] = 0.01;
			weights ['your4Flip'] = -(0.01);
			weights ['my5Flip'] = 0.01;
			weights ['your5Flip'] = -(0.01);
			weights ['my6Flip'] = 0.01;
			weights ['your6Flip'] = -(0.01);
			weights ['my7Flip'] = 0.01;
			weights ['your7Flip'] = -(0.01);
			weights ['my8Flip'] = 0.01;
			weights ['your8Flip'] = -(0.01);
			return weights;
		};
		var initOpponentWeights = function () {
			var weights = dict ({'your2Flip': 0.7822916666666648, 'myPerm': 6.375000000000007, 'diffPerm': 5.657291666666555, 'my2Flip': -(0.43645833333333245), 'your1Flip': 0.5760416666666688, 'your2Empty': -(0.8906250000000077), 'my8Empty': -(0.047916666666666705), 'your4Flip': -(0.09791666666666667), 'my3Flip': 0.0500000000000001, 'your8Flip': -(0.1), 'your5Empty': 0.220833333333333, 'your8Empty': 0.09479166666666669, 'yourCols': -(4.266666666666366), 'your3Empty': -(0.13125), 'diffLongestPath': 91.69166666666835, 'yourPerm': -(4.282291666666636), 'my8Flip': 0.1, 'my5Empty': -(0.005208333333333049), 'myTotal': 6.836458333333379, 'diffTotal': 9.201041666666528, 'my4Empty': 0.8666666666666678, 'yourLongestPath': -(34.5416666666668), 'my4Flip': 0.09895833333333334, 'your6Flip': -(0.1), 'your1Empty': -(0.03229166666666664), 'your7Empty': 0.06979166666666668, 'my3Empty': 0.596875000000004, 'my1Flip': -(1.504166666666667), 'my6Flip': 0.1, 'myLongestPath': 57.150000000000546, 'myCols': 26.93333333333583, 'your6Empty': 0.055208333333333366, 'your5Flip': -(0.09687500000000002), 'my6Empty': 0.0697916666666667, 'my7Flip': 0.1, 'my7Empty': -(0.05000000000000005), 'your4Empty': -(0.06874999999999995), 'your7Flip': -(0.1), 'my5Flip': 0.1, 'yourTotal': -(2.364583333333319), 'your3Flip': -(0.07708333333333331), 'my1Empty': 0.35937499999999944, 'my2Empty': 1.27187500000002});
			return weights;
		};
		var initSmartOpponentWeights = function () {
			var weights = dict ({'your2Flip': 1.0495833333333353, 'myPerm': 6.816041666666664, 'your4Flip': -(0.08072916666666671), 'your6Empty': 0, 'your1Flip': 1.4491666666666643, 'myLongestPermPath': 23.74083333333318, 'my8Empty': 0, 'diffPerm': 4.216770833333327, 'myOneTurnAway': 73.14000000000013, 'onlyTurnAway': 72.76000000000022, 'your5Empty': 0, 'your8Empty': 0, 'your2Empty': -(0.2548958333333335), 'myLongestFuturePath': 34.98666666666767, 'yourCols': -(0.9458333333333613), 'blockedMe': -(18.720000000000006), 'your3Empty': 0, 'diffLongestPath': 54.54749999999867, 'yourPathFlex': 0, 'yourPerm': -(2.4007291666666766), 'myPathFlex': 0, 'blockedYou': 24.70000000000009, 'my5Empty': 0, 'myTotal': 6.449583333333361, 'diffTotal': 5.901354166666625, 'yourLongestPermPath': -(8.06666666666665), 'yourLongestPath': -(16.090833333333034), 'my4Flip': 0.09114583333333334, 'futureAhead': 70.76000000000032, 'your1Empty': 0.001, 'yourLongestPathSquared': -(32.91201388888965), 'your7Empty': 0, 'my3Empty': -(0.007187499999999994), 'my1Flip': 0.913333333333336, 'myLongestPath': 46.45666666666782, 'myCols': 23.67250000000069, 'my2Flip': -(0.19406249999999978), 'my6Empty': 0, 'my2Empty': 0.7627083333333332, 'my7Empty': 0, 'ahead': 105.5099999999984, 'your3Flip': -(0.01), 'diffLongestFuturePath': 30.42083333333315, 'myLongestFuturePathSquared': 37.61263888888979, 'my4Empty': 0, 'yourTotal': 0, 'your4Empty': -(0.004687499999999997), 'yourOneTurnAway': -(1000.0), 'myLongestPathSquared': 56.155833333334826, 'yourLongestFuturePath': -(2.4341666666666524), 'my1Empty': -(0.02208333333333334), 'yourLongestFuturePathSquared': -(12.705347222222025), 'my3Flip': 0.08260416666666671});
			return weights;
		};
		var smartEvaluationFunction = function (game, board, player) {
			var features = game.smartFeatures (board, player);
			var weights = initSmartFeatureWeights ();
			var value = sum (function () {
				var __accu0__ = [];
				var __iterable0__ = features.py_keys ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var k = __iterable0__ [__index0__];
					__accu0__.append (features [k] * weights [k]);
				}
				return __accu0__;
			} ());
			if (game.isEnd (tuple ([board, player]))) {
				return game.utility (tuple ([board, player])) + value;
			}
			return value;
		};
		var TDLevaluationFunction = function (game, board, player) {
			var features = game.smartFeaturesTDL (board, player);
			var weights = initSmartOpponentWeights ();
			var value = sum (function () {
				var __accu0__ = [];
				var __iterable0__ = features.py_keys ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var k = __iterable0__ [__index0__];
					__accu0__.append (features [k] * weights [k]);
				}
				return __accu0__;
			} ());
			if (game.isEnd (tuple ([board, player]))) {
				return game.utility (tuple ([board, player])) + value;
			}
			return value;
		};
		var PathwayzGame = __class__ ('PathwayzGame', [object], {
			get __init__ () {return __get__ (this, function (self) {
				// pass;
			});},
			get startState () {return __get__ (this, function (self) {
				var board = function () {
					var __accu0__ = [];
					for (var j = 0; j < 8; j++) {
						__accu0__.append (function () {
							var __accu1__ = [];
							for (var i = 0; i < 12; i++) {
								__accu1__.append ('-');
							}
							return __accu1__;
						} ());
					}
					return __accu0__;
				} ();
				var startingPlayer = 'w';
				return tuple ([board, startingPlayer]);
			});},
			get isEnd () {return __get__ (this, function (self, state) {
				var __left0__ = state;
				var _ = __left0__ [0];
				var player = __left0__ [1];
				return self.isWinner (state, player) || self.isWinner (state, self.otherPlayer (player)) || self.fullBoard (state);
			});},
			get fullBoard () {return __get__ (this, function (self, state) {
				var __left0__ = state;
				var board = __left0__ [0];
				var player = __left0__ [1];
				for (var i = 0; i < 8; i++) {
					for (var j = 0; j < 12; j++) {
						if (board [i] [j] == '-') {
							return false;
						}
					}
				}
				return true;
			});},
			get isWinner () {return __get__ (this, function (self, state, player) {
				var __left0__ = state;
				var board = __left0__ [0];
				var _ = __left0__ [1];
				return self.longestPath (board, player, __kwargtrans__ ({checkWinner: true})) == 12;
			});},
			get utility () {return __get__ (this, function (self, state) {
				var __left0__ = state;
				var _ = __left0__ [0];
				var player = __left0__ [1];
				if (self.isWinner (state, player)) {
					return 1000000.0;
				}
				else if (self.isWinner (state, self.otherPlayer (player))) {
					return -(1000000.0);
				}
				else {
					return 0;
				}
			});},
			get actions () {return __get__ (this, function (self, state) {
				var actions = list ([]);
				var __iterable0__ = function () {
					var __accu0__ = [];
					for (var j = 0; j < 12; j++) {
						for (var i = 0; i < 8; i++) {
							__accu0__.append (tuple ([i, j]));
						}
					}
					return __accu0__;
				} ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (self.emptyPlace (state, i, j)) {
						actions.append (tuple ([i, j, true]));
						actions.append (tuple ([i, j, false]));
					}
				}
				return actions;
			});},
			get succ () {return __get__ (this, function (self, state, action) {
				var __left0__ = state;
				var board = __left0__ [0];
				var player = __left0__ [1];
				var __left0__ = action;
				var row = __left0__ [0];
				var col = __left0__ [1];
				var permanent = __left0__ [2];
				if (!(row < 8 && row >= 0 && col < 12 && col >= 0)) {
					var __except0__ = Exception ('Row, column out of bounds.');
					__except0__.__cause__ = null;
					throw __except0__;
				}
				else if (!(self.emptyPlace (state, row, col))) {
					var __except0__ = Exception ('Position is already played.');
					__except0__.__cause__ = null;
					throw __except0__;
				}
				else if (permanent) {
					board [row] [col] = self.otherPlayer (player).upper ();
					self.flipPieces (board, row, col);
					return tuple ([board, self.otherPlayer (player)]);
				}
				else {
					board [row] [col] = player;
					return tuple ([board, self.otherPlayer (player)]);
				}
			});},
			get emptyPlace () {return __get__ (this, function (self, state, row, col) {
				var __left0__ = state;
				var board = __left0__ [0];
				var _ = __left0__ [1];
				return board [row] [col] == '-';
			});},
			get player () {return __get__ (this, function (self, state) {
				return state [1];
			});},
			get otherPlayer () {return __get__ (this, function (self, player) {
				if (player == 'w') {
					return 'b';
				}
				else if (player == 'b') {
					return 'w';
				}
				else {
					var __except0__ = Exception ('Not valid player');
					__except0__.__cause__ = null;
					throw __except0__;
				}
			});},
			get flipPieces () {return __get__ (this, function (self, board, row, col) {
				var __iterable0__ = self.surroundingPlaces (row, col);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j] == 'b' || board [i] [j] == 'w') {
						board [i] [j] = self.otherPlayer (board [i] [j]);
					}
				}
			});},
			get surroundingPlaces () {return __get__ (this, function (self, row, col) {
				var rows = function () {
					var __accu0__ = [];
					for (var i = row - 1; i < row + 2; i++) {
						if (i >= 0 && i < 8) {
							__accu0__.append (i);
						}
					}
					return __accu0__;
				} ();
				var cols = function () {
					var __accu0__ = [];
					for (var j = col - 1; j < col + 2; j++) {
						if (j >= 0 && j < 12) {
							__accu0__.append (j);
						}
					}
					return __accu0__;
				} ();
				return function () {
					var __accu0__ = [];
					var __iterable0__ = rows;
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var i = __iterable0__ [__index0__];
						var __iterable1__ = cols;
						for (var __index1__ = 0; __index1__ < __iterable1__.length; __index1__++) {
							var j = __iterable1__ [__index1__];
							__accu0__.append (tuple ([i, j]));
						}
					}
					return __accu0__;
				} ();
			});},
			get findPathLength () {return __get__ (this, function (self, board, player, row, col) {
				var farthestCol = -(1);
				var __iterable0__ = self.surroundingPlaces (row, col);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j].lower () == player) {
						if (j > farthestCol) {
							var farthestCol = j;
						}
						if (j == 11) {
							return 11;
						}
						else if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var maxCol = self.findPathLength (board, player, i, j);
							if (maxCol > farthestCol) {
								var farthestCol = maxCol;
							}
						}
					}
				}
				return farthestCol;
			});},
			get longestPath () {return __get__ (this, function (self, board, player, checkWinner) {
				if (typeof checkWinner == 'undefined' || (checkWinner != null && checkWinner .hasOwnProperty ("__kwargtrans__"))) {;
					var checkWinner = false;
				};
				self.alreadyChecked = function () {
					var __accu0__ = [];
					for (var j = 0; j < 8; j++) {
						__accu0__.append (function () {
							var __accu1__ = [];
							for (var i = 0; i < 12; i++) {
								__accu1__.append (false);
							}
							return __accu1__;
						} ());
					}
					return __accu0__;
				} ();
				var longestPath = -(1);
				var __iterable0__ = function () {
					var __accu0__ = [];
					var __iterable1__ = (!(checkWinner) ? range (12) : range (0));
					for (var __index0__ = 0; __index0__ < __iterable1__.length; __index0__++) {
						var j = __iterable1__ [__index0__];
						for (var i = 0; i < 8; i++) {
							__accu0__.append (tuple ([i, j]));
						}
					}
					return __accu0__;
				} ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j].lower () == player) {
						if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var newPath = self.findPathLength (board, player, i, j) - j;
							if (newPath > longestPath) {
								var longestPath = newPath;
							}
						}
					}
					if (longestPath == 11) {
						return 12;
					}
				}
				return longestPath + 1;
			});},
			get simulatedMove () {return __get__ (this, function (self, state, action) {
				var __left0__ = state;
				var board = __left0__ [0];
				var player = __left0__ [1];
				var tempBoard = function () {
					var __accu0__ = [];
					var __iterable0__ = board;
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var row = __iterable0__ [__index0__];
						__accu0__.append (row.__getslice__ (0, null, 1));
					}
					return __accu0__;
				} ();
				return self.succ (tuple ([tempBoard, player]), action);
			});},
			get countPieces () {return __get__ (this, function (self, board, player) {
				var myNumPermanents = 0;
				var yourNumPermanents = 0;
				var myNum1EmptyNeighbor = 0;
				var yourNum1EmptyNeighbor = 0;
				var myNum2EmptyNeighbor = 0;
				var yourNum2EmptyNeighbor = 0;
				var myNumPieces = 0;
				var yourNumPieces = 0;
				var __iterable0__ = function () {
					var __accu0__ = [];
					for (var j = 0; j < 12; j++) {
						for (var i = 0; i < 8; i++) {
							__accu0__.append (tuple ([i, j]));
						}
					}
					return __accu0__;
				} ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j] == player.upper ()) {
						myNumPermanents++;
						myNumPieces++;
					}
					else if (board [i] [j] == self.otherPlayer (player).upper ()) {
						yourNumPermanents++;
						yourNumPieces++;
					}
					else if (board [i] [j] == player) {
						myNumPieces++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							myNumPermanents++;
						}
						else if (numEmptyNeighbors == 1) {
							myNum1EmptyNeighbor++;
						}
						else if (numEmptyNeighbors == 2) {
							myNum2EmptyNeighbor++;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player)) {
						yourNumPieces++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							yourNumPermanents++;
						}
						else if (numEmptyNeighbors == 1) {
							yourNum1EmptyNeighbor++;
						}
						else if (numEmptyNeighbors == 2) {
							yourNum2EmptyNeighbor++;
						}
					}
				}
				return tuple ([myNumPermanents, yourNumPermanents, myNum1EmptyNeighbor, yourNum1EmptyNeighbor, myNum2EmptyNeighbor, yourNum2EmptyNeighbor, myNumPieces - yourNumPieces]);
			});},
			get getNumEmptyNeighbors () {return __get__ (this, function (self, row, col, board) {
				var neighbors = self.surroundingPlaces (row, col);
				var numEmptyNeighbors = 0;
				var __iterable0__ = neighbors;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var neighbor = __iterable0__ [__index0__];
					var __left0__ = neighbor;
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j] == '-') {
						numEmptyNeighbors++;
					}
				}
				return numEmptyNeighbors;
			});},
			get getFlipPotential () {return __get__ (this, function (self, row, col, board, player) {
				var neighbors = self.surroundingPlaces (row, col);
				var flipPotential = 0;
				var otherPlayer = self.otherPlayer (player);
				var __iterable0__ = neighbors;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var neighbor = __iterable0__ [__index0__];
					var __left0__ = neighbor;
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j] == otherPlayer) {
						flipPotential++;
					}
					else if (board [i] [j] == player) {
						flipPotential--;
					}
				}
				return flipPotential;
			});},
			get smartFeatures () {return __get__ (this, function (self, board, player) {
				var featureNames = list (['myLongestPath', 'yourLongestPath', 'myCols', 'yourCols', 'myPerm', 'yourPerm', 'myTotal', 'yourTotal', 'my1Empty', 'your1Empty', 'my2Empty', 'your2Empty', 'my3Empty', 'your3Empty', 'my4Empty', 'your4Empty', 'my5Empty', 'your5Empty', 'my6Empty', 'your6Empty', 'my7Empty', 'your7Empty', 'my8Empty', 'your8Empty', 'my1Flip', 'your1Flip', 'my2Flip', 'your2Flip', 'my3Flip', 'your3Flip', 'my4Flip', 'your4Flip', 'my5Flip', 'your5Flip', 'my6Flip', 'your6Flip', 'my7Flip', 'your7Flip', 'my8Flip', 'your8Flip']);
				var features = function () {
					var __accu0__ = [];
					var __iterable0__ = featureNames;
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var feature = __iterable0__ [__index0__];
						__accu0__.append (list ([feature, 0]));
					}
					return dict (__accu0__);
				} ();
				var myCols = function () {
					var __accu0__ = [];
					for (var _ = 0; _ < 12; _++) {
						__accu0__.append (0);
					}
					return __accu0__;
				} ();
				var yourCols = function () {
					var __accu0__ = [];
					for (var _ = 0; _ < 12; _++) {
						__accu0__.append (0);
					}
					return __accu0__;
				} ();
				var __iterable0__ = function () {
					var __accu0__ = [];
					for (var j = 0; j < 12; j++) {
						for (var i = 0; i < 8; i++) {
							__accu0__.append (tuple ([i, j]));
						}
					}
					return __accu0__;
				} ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j] == player.upper ()) {
						features ['myPerm']++;
						features ['myTotal']++;
						if (myCols [j] == 0) {
							myCols [j] = 1;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player).upper ()) {
						features ['yourPerm']++;
						features ['yourTotal']++;
						if (yourCols [j] == 0) {
							yourCols [j] = 1;
						}
					}
					else if (board [i] [j] == player) {
						features ['myTotal']++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							features ['myPerm']++;
						}
						else if (numEmptyNeighbors == 1) {
							features ['my1Empty']++;
						}
						else if (numEmptyNeighbors == 2) {
							features ['my2Empty']++;
						}
						else if (numEmptyNeighbors == 3) {
							features ['my3Empty']++;
						}
						else if (numEmptyNeighbors == 4) {
							features ['my4Empty']++;
						}
						else if (numEmptyNeighbors == 5) {
							features ['my5Empty']++;
						}
						else if (numEmptyNeighbors == 6) {
							features ['my5Empty']++;
						}
						else if (numEmptyNeighbors == 7) {
							features ['my7Empty']++;
						}
						else if (numEmptyNeighbors == 8) {
							features ['my8Empty']++;
						}
						if (myCols [j] == 0) {
							myCols [j] = 1;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player)) {
						features ['yourTotal']++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							features ['yourPerm']++;
						}
						else if (numEmptyNeighbors == 1) {
							features ['your1Empty']++;
						}
						else if (numEmptyNeighbors == 2) {
							features ['your2Empty']++;
						}
						else if (numEmptyNeighbors == 3) {
							features ['your3Empty']++;
						}
						else if (numEmptyNeighbors == 4) {
							features ['your4Empty']++;
						}
						else if (numEmptyNeighbors == 5) {
							features ['your5Empty']++;
						}
						else if (numEmptyNeighbors == 6) {
							features ['your6Empty']++;
						}
						else if (numEmptyNeighbors == 7) {
							features ['your7Empty']++;
						}
						else if (numEmptyNeighbors == 8) {
							features ['your8Empty']++;
						}
						if (yourCols [j] == 0) {
							yourCols [j] = 1;
						}
					}
				}
				var features = function () {
					var __accu0__ = [];
					var __iterable0__ = features.py_items ();
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var __left0__ = __iterable0__ [__index0__];
						var k = __left0__ [0];
						var v = __left0__ [1];
						__accu0__.append (list ([k, v / 96.0]));
					}
					return dict (__accu0__);
				} ();
				features ['myCols'] = sum (myCols) / 12.0;
				features ['yourCols'] = sum (yourCols) / 12.0;
				features ['myLongestPath'] = game.longestPath (board, player) / 12.0;
				features ['yourLongestPath'] = game.longestPath (board, game.otherPlayer (player)) / 12.0;
				return features;
			});},
			get TDLfeatures () {return __get__ (this, function (self, board, player) {
				var featureNames = list (['myLongestPath', 'yourLongestPath', 'diffLongestPath', 'myCols', 'yourCols', 'myPerm', 'yourPerm', 'diffPerm', 'myTotal', 'yourTotal', 'diffTotal', 'my1Empty', 'your1Empty', 'my2Empty', 'your2Empty', 'my3Empty', 'your3Empty', 'my4Empty', 'your4Empty', 'my5Empty', 'your5Empty', 'my6Empty', 'your6Empty', 'my7Empty', 'your7Empty', 'my8Empty', 'your8Empty', 'my1Flip', 'your1Flip', 'my2Flip', 'your2Flip', 'my3Flip', 'your3Flip', 'my4Flip', 'your4Flip', 'my5Flip', 'your5Flip', 'my6Flip', 'your6Flip', 'my7Flip', 'your7Flip', 'my8Flip', 'your8Flip']);
				var features = function () {
					var __accu0__ = [];
					var __iterable0__ = featureNames;
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var feature = __iterable0__ [__index0__];
						__accu0__.append (list ([feature, 0]));
					}
					return dict (__accu0__);
				} ();
				var myCols = function () {
					var __accu0__ = [];
					for (var _ = 0; _ < 12; _++) {
						__accu0__.append (0);
					}
					return __accu0__;
				} ();
				var yourCols = function () {
					var __accu0__ = [];
					for (var _ = 0; _ < 12; _++) {
						__accu0__.append (0);
					}
					return __accu0__;
				} ();
				var __iterable0__ = function () {
					var __accu0__ = [];
					for (var j = 0; j < 12; j++) {
						for (var i = 0; i < 8; i++) {
							__accu0__.append (tuple ([i, j]));
						}
					}
					return __accu0__;
				} ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j] == player.upper ()) {
						features ['myPerm']++;
						features ['myTotal']++;
						if (myCols [j] == 0) {
							myCols [j] = 1;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player).upper ()) {
						features ['yourPerm']++;
						features ['yourTotal']++;
						if (yourCols [j] == 0) {
							yourCols [j] = 1;
						}
					}
					else if (board [i] [j] == player) {
						features ['myTotal']++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							features ['myPerm']++;
						}
						else if (numEmptyNeighbors == 1) {
							features ['my1Empty']++;
						}
						else if (numEmptyNeighbors == 2) {
							features ['my2Empty']++;
						}
						else if (numEmptyNeighbors == 3) {
							features ['my3Empty']++;
						}
						else if (numEmptyNeighbors == 4) {
							features ['my4Empty']++;
						}
						else if (numEmptyNeighbors == 5) {
							features ['my5Empty']++;
						}
						else if (numEmptyNeighbors == 6) {
							features ['my6Empty']++;
						}
						else if (numEmptyNeighbors == 7) {
							features ['my7Empty']++;
						}
						else if (numEmptyNeighbors == 8) {
							features ['my8Empty']++;
						}
						if (myCols [j] == 0) {
							myCols [j] = 1;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player)) {
						features ['yourTotal']++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							features ['yourPerm']++;
						}
						else if (numEmptyNeighbors == 1) {
							features ['your1Empty']++;
						}
						else if (numEmptyNeighbors == 2) {
							features ['your2Empty']++;
						}
						else if (numEmptyNeighbors == 3) {
							features ['your3Empty']++;
						}
						else if (numEmptyNeighbors == 4) {
							features ['your4Empty']++;
						}
						else if (numEmptyNeighbors == 5) {
							features ['your5Empty']++;
						}
						else if (numEmptyNeighbors == 6) {
							features ['your6Empty']++;
						}
						else if (numEmptyNeighbors == 7) {
							features ['your7Empty']++;
						}
						else if (numEmptyNeighbors == 8) {
							features ['your8Empty']++;
						}
						if (yourCols [j] == 0) {
							yourCols [j] = 1;
						}
					}
					else if (board [i] [j] == '-') {
						var flipPotential = self.getFlipPotential (i, j, board, player);
						if (flipPotential > 0) {
							if (flipPotential == 1) {
								features ['my1Flip']++;
							}
							else if (flipPotential == 2) {
								features ['my2Flip']++;
							}
							else if (flipPotential == 3) {
								features ['my3Flip']++;
							}
							else if (flipPotential == 4) {
								features ['my4Flip']++;
							}
							else if (flipPotential == 5) {
								features ['my5Flip']++;
							}
							else if (flipPotential == 6) {
								features ['my6Flip']++;
							}
							else if (flipPotential == 7) {
								features ['my7Flip']++;
							}
							else if (flipPotential == 8) {
								features ['my8Flip']++;
							}
						}
						else if (flipPotential < 0) {
							if (flipPotential == -(1)) {
								features ['your1Flip']++;
							}
							else if (flipPotential == -(2)) {
								features ['your2Flip']++;
							}
							else if (flipPotential == -(3)) {
								features ['your3Flip']++;
							}
							else if (flipPotential == -(4)) {
								features ['your4Flip']++;
							}
							else if (flipPotential == -(5)) {
								features ['your5Flip']++;
							}
							else if (flipPotential == -(6)) {
								features ['your6Flip']++;
							}
							else if (flipPotential == -(7)) {
								features ['your7Flip']++;
							}
							else if (flipPotential == -(8)) {
								features ['your8Flip']++;
							}
						}
					}
				}
				features ['diffPerm'] = features ['myPerm'] - features ['yourPerm'];
				features ['diffTotal'] = features ['myTotal'] - features ['yourTotal'];
				var features = function () {
					var __accu0__ = [];
					var __iterable0__ = features.py_items ();
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var __left0__ = __iterable0__ [__index0__];
						var k = __left0__ [0];
						var v = __left0__ [1];
						__accu0__.append (list ([k, v / 96.0]));
					}
					return dict (__accu0__);
				} ();
				features ['myCols'] = sum (myCols) / 12.0;
				features ['yourCols'] = sum (yourCols) / 12.0;
				var myLongestPath = game.longestPath (board, player);
				var yourLongestPath = game.longestPath (board, game.otherPlayer (player));
				features ['myLongestPath'] = myLongestPath / 12.0;
				features ['yourLongestPath'] = yourLongestPath / 12.0;
				features ['diffLongestPath'] = (myLongestPath - yourLongestPath) / 12.0;
				return features;
			});},
			get findPermPathLength () {return __get__ (this, function (self, board, player, row, col) {
				var farthestCol = -(1);
				var __iterable0__ = self.surroundingPlaces (row, col);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (self.permSpaces [i] [j] == player) {
						if (j > farthestCol) {
							var farthestCol = j;
						}
						if (j == 11) {
							return 11;
						}
						else if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var maxCol = self.findPermPathLength (board, player, i, j);
							if (maxCol > farthestCol) {
								var farthestCol = maxCol;
							}
						}
					}
				}
				return farthestCol;
			});},
			get findLongestPermPath () {return __get__ (this, function (self, board, player) {
				self.alreadyChecked = function () {
					var __accu0__ = [];
					for (var j = 0; j < 8; j++) {
						__accu0__.append (function () {
							var __accu1__ = [];
							for (var i = 0; i < 12; i++) {
								__accu1__.append (false);
							}
							return __accu1__;
						} ());
					}
					return __accu0__;
				} ();
				var longestPath = -(1);
				var __iterable0__ = function () {
					var __accu0__ = [];
					for (var j = 0; j < 12; j++) {
						for (var i = 0; i < 8; i++) {
							__accu0__.append (tuple ([i, j]));
						}
					}
					return __accu0__;
				} ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (self.permSpaces [i] [j] == player) {
						if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var newPath = self.findPermPathLength (board, player, i, j) - j;
							if (newPath > longestPath) {
								var longestPath = newPath;
							}
						}
					}
					if (longestPath == 11) {
						return 12;
					}
				}
				return longestPath + 1;
			});},
			get findPathLengthEdges () {return __get__ (this, function (self, board, player, row, col, leftEdge, leftEdges, rightEdges) {
				var farthestCol = -(1);
				var __iterable0__ = self.surroundingPlaces (row, col);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j].lower () == player) {
						if (j < leftEdge) {
							var leftEdge = j;
							leftEdges.append (tuple ([i, j]));
						}
						else if (j == leftEdge) {
							leftEdges.append (tuple ([i, j]));
						}
						if (j == farthestCol) {
							rightEdges.append (tuple ([i, j]));
						}
						else if (j > farthestCol) {
							var farthestCol = j;
							var rightEdges = list ([tuple ([i, j])]);
						}
						if (j == 11) {
							return tuple ([11, leftEdges, rightEdges]);
						}
						else if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var __left0__ = self.findPathLengthEdges (board, player, i, j, leftEdge, leftEdges, rightEdges);
							var maxCol = __left0__ [0];
							var newLeftEdges = __left0__ [1];
							var newRightEdges = __left0__ [2];
							if (maxCol >= farthestCol) {
								var farthestCol = maxCol;
								var leftEdges = newLeftEdges;
								var rightEdges = newRightEdges;
							}
						}
					}
				}
				return tuple ([farthestCol, leftEdges, rightEdges]);
			});},
			get findLongestPathEdges () {return __get__ (this, function (self, board, player) {
				self.alreadyChecked = function () {
					var __accu0__ = [];
					for (var j = 0; j < 8; j++) {
						__accu0__.append (function () {
							var __accu1__ = [];
							for (var i = 0; i < 12; i++) {
								__accu1__.append (false);
							}
							return __accu1__;
						} ());
					}
					return __accu0__;
				} ();
				self.leftEdges = list ([]);
				self.rightEdges = list ([]);
				var longestPath = -(1);
				var __iterable0__ = function () {
					var __accu0__ = [];
					for (var j = 0; j < 12; j++) {
						for (var i = 0; i < 8; i++) {
							__accu0__.append (tuple ([i, j]));
						}
					}
					return __accu0__;
				} ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j].lower () == player) {
						if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var leftEdge = j;
							var leftEdges = list ([tuple ([i, j])]);
							var rightEdges = list ([tuple ([i, j])]);
							var __left0__ = self.findPathLengthEdges (board, player, i, j, leftEdge, leftEdges, rightEdges);
							var rightEdge = __left0__ [0];
							var leftEdges = __left0__ [1];
							var rightEdges = __left0__ [2];
							if (rightEdge - leftEdge > longestPath) {
								var longestPath = rightEdge - leftEdge;
								self.leftEdges = leftEdges;
								self.rightEdges = rightEdges;
							}
							else if (rightEdge - leftEdge == longestPath) {
								for (var k = 0; k < len (leftEdges); k++) {
									self.leftEdges.append (leftEdges [k]);
								}
								for (var k = 0; k < len (rightEdges); k++) {
									self.rightEdges.append (rightEdges [k]);
								}
							}
						}
					}
					if (longestPath == 11) {
						return 12;
					}
				}
				return longestPath + 1;
			});},
			get findFrontierMoves () {return __get__ (this, function (self, board, player) {
				var frontierSpacesChecked = function () {
					var __accu0__ = [];
					for (var j = 0; j < 8; j++) {
						__accu0__.append (function () {
							var __accu1__ = [];
							for (var i = 0; i < 12; i++) {
								__accu1__.append (false);
							}
							return __accu1__;
						} ());
					}
					return __accu0__;
				} ();
				var leftFrontierPlaces = list ([]);
				var rightFrontierPlaces = list ([]);
				var leftFrontierFlips = list ([]);
				var rightFrontierFlips = list ([]);
				var __iterable0__ = self.leftEdges;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					var __iterable1__ = self.surroundingPlaces (i, j);
					for (var __index1__ = 0; __index1__ < __iterable1__.length; __index1__++) {
						var __left0__ = __iterable1__ [__index1__];
						var row = __left0__ [0];
						var col = __left0__ [1];
						if (!(frontierSpacesChecked [row] [col])) {
							frontierSpacesChecked [row] [col] = true;
							if (board [row] [col] == '-') {
								leftFrontierPlaces.append (tuple ([row, col]));
							}
							else if (board [row] [col] == self.otherPlayer (player)) {
								leftFrontierFlips.append (tuple ([row, col]));
							}
						}
					}
				}
				var __iterable0__ = self.rightEdges;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					var __iterable1__ = self.surroundingPlaces (i, j);
					for (var __index1__ = 0; __index1__ < __iterable1__.length; __index1__++) {
						var __left0__ = __iterable1__ [__index1__];
						var row = __left0__ [0];
						var col = __left0__ [1];
						if (!(frontierSpacesChecked [row] [col])) {
							frontierSpacesChecked [row] [col] = true;
							if (board [row] [col] == '-') {
								rightFrontierPlaces.append (tuple ([row, col]));
							}
							else if (board [row] [col] == self.otherPlayer (player)) {
								rightFrontierFlips.append (tuple ([row, col]));
							}
						}
					}
				}
				return tuple ([leftFrontierPlaces, rightFrontierPlaces, leftFrontierFlips, rightFrontierFlips]);
			});},
			get findPathFromSquare () {return __get__ (this, function (self, board, player, row, col) {
				var __iterable0__ = self.surroundingPlaces (row, col);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (!(self.alreadyChecked [i] [j])) {
						self.alreadyChecked [i] [j] = true;
						if (board [i] [j].lower () == player) {
							if (j > self.rightCol) {
								self.rightCol = j;
							}
							if (j < self.leftCol) {
								self.leftCol = j;
							}
							self.findPathFromSquare (board, player, i, j);
						}
					}
				}
			});},
			get findLongestFuturePath () {return __get__ (this, function (self, board, player, longestPath) {
				var longestFuturePath = longestPath;
				var leftFrontierMoves = 0;
				var rightFrontierMoves = 0;
				var __left0__ = self.findFrontierMoves (board, player);
				var leftFrontierPlaces = __left0__ [0];
				var rightFrontierPlaces = __left0__ [1];
				var leftFrontierFlips = __left0__ [2];
				var rightFrontierFlips = __left0__ [3];
				var __iterable0__ = leftFrontierPlaces;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var frontier = __iterable0__ [__index0__];
					self.alreadyChecked = function () {
						var __accu0__ = [];
						for (var y = 0; y < 8; y++) {
							__accu0__.append (function () {
								var __accu1__ = [];
								for (var x = 0; x < 12; x++) {
									__accu1__.append (false);
								}
								return __accu1__;
							} ());
						}
						return __accu0__;
					} ();
					var __left0__ = frontier;
					var i = __left0__ [0];
					var j = __left0__ [1];
					self.leftCol = j;
					self.rightCol = j;
					self.findPathFromSquare (board, player, i, j);
					var futurePath = (self.rightCol - self.leftCol) + 1;
					if (futurePath > longestPath) {
						leftFrontierMoves++;
						if (futurePath > longestFuturePath) {
							var longestFuturePath = futurePath;
						}
					}
				}
				var __iterable0__ = rightFrontierPlaces;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var frontier = __iterable0__ [__index0__];
					self.alreadyChecked = function () {
						var __accu0__ = [];
						for (var y = 0; y < 8; y++) {
							__accu0__.append (function () {
								var __accu1__ = [];
								for (var x = 0; x < 12; x++) {
									__accu1__.append (false);
								}
								return __accu1__;
							} ());
						}
						return __accu0__;
					} ();
					var __left0__ = frontier;
					var i = __left0__ [0];
					var j = __left0__ [1];
					self.leftCol = j;
					self.rightCol = j;
					self.findPathFromSquare (board, player, i, j);
					var futurePath = (self.rightCol - self.leftCol) + 1;
					if (futurePath > longestPath) {
						rightFrontierMoves++;
						if (futurePath > longestFuturePath) {
							var longestFuturePath = futurePath;
						}
					}
				}
				var alreadyFlipped = function () {
					var __accu0__ = [];
					for (var y = 0; y < 8; y++) {
						__accu0__.append (function () {
							var __accu1__ = [];
							for (var x = 0; x < 12; x++) {
								__accu1__.append (false);
							}
							return __accu1__;
						} ());
					}
					return __accu0__;
				} ();
				var __iterable0__ = leftFrontierFlips;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var frontier = __iterable0__ [__index0__];
					var __left0__ = frontier;
					var i = __left0__ [0];
					var j = __left0__ [1];
					var __iterable1__ = self.surroundingPlaces (i, j);
					for (var __index1__ = 0; __index1__ < __iterable1__.length; __index1__++) {
						var __left0__ = __iterable1__ [__index1__];
						var row = __left0__ [0];
						var col = __left0__ [1];
						if (board [row] [col] == '-' && !(alreadyFlipped [row] [col])) {
							alreadyFlipped [row] [col] = true;
							var action = tuple ([row, col, true]);
							var newState = game.simulatedMove (tuple ([board, player]), action);
							var __left0__ = newState;
							var newBoard = __left0__ [0];
							var otherPlayer = __left0__ [1];
							self.alreadyChecked = function () {
								var __accu0__ = [];
								for (var y = 0; y < 8; y++) {
									__accu0__.append (function () {
										var __accu1__ = [];
										for (var x = 0; x < 12; x++) {
											__accu1__.append (false);
										}
										return __accu1__;
									} ());
								}
								return __accu0__;
							} ();
							self.leftCol = j;
							self.rightCol = j;
							self.findPathFromSquare (newBoard, player, i, j);
							var futurePath = (self.rightCol - self.leftCol) + 1;
							if (futurePath > longestPath) {
								leftFrontierMoves++;
								if (futurePath > longestFuturePath) {
									var longestFuturePath = futurePath;
								}
							}
						}
					}
				}
				var __iterable0__ = rightFrontierFlips;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var frontier = __iterable0__ [__index0__];
					var __left0__ = frontier;
					var i = __left0__ [0];
					var j = __left0__ [1];
					var __iterable1__ = self.surroundingPlaces (i, j);
					for (var __index1__ = 0; __index1__ < __iterable1__.length; __index1__++) {
						var __left0__ = __iterable1__ [__index1__];
						var row = __left0__ [0];
						var col = __left0__ [1];
						if (board [row] [col] == '-' && !(alreadyFlipped [row] [col])) {
							alreadyFlipped [row] [col] = true;
							var action = tuple ([row, col, true]);
							var newState = game.simulatedMove (tuple ([board, player]), action);
							var __left0__ = newState;
							var newBoard = __left0__ [0];
							var otherPlayer = __left0__ [1];
							self.alreadyChecked = function () {
								var __accu0__ = [];
								for (var y = 0; y < 8; y++) {
									__accu0__.append (function () {
										var __accu1__ = [];
										for (var x = 0; x < 12; x++) {
											__accu1__.append (false);
										}
										return __accu1__;
									} ());
								}
								return __accu0__;
							} ();
							self.leftCol = j;
							self.rightCol = j;
							self.findPathFromSquare (newBoard, player, i, j);
							var futurePath = (self.rightCol - self.leftCol) + 1;
							if (futurePath > longestPath) {
								rightFrontierMoves++;
								if (futurePath > longestFuturePath) {
									var longestFuturePath = futurePath;
								}
							}
						}
					}
				}
				return tuple ([longestFuturePath, leftFrontierMoves, rightFrontierMoves]);
			});},
			get smartFeaturesTDL () {return __get__ (this, function (self, board, player) {
				var featureNames = list (['myLongestPath', 'yourLongestPath', 'ahead', 'futureAhead', 'onlyTurnAway', 'myOneTurnAway', 'yourOneTurnAway', 'myLongestPathSquared', 'yourLongestPathSquared', 'myLongestFuturePath', 'yourLongestFuturePath', 'myLongestFuturePathSquared', 'yourLongestFuturePathSquared', 'diffLongestPath', 'diffLongestFuturePath', 'myLongestPermPath', 'yourLongestPermPath', 'blockedYou', 'blockedMe', 'yourPathFlex', 'myPathFlex', 'myCols', 'yourCols', 'myPerm', 'yourPerm', 'myTotal', 'yourTotal', 'my1Empty', 'your1Empty', 'my2Empty', 'your2Empty', 'my3Empty', 'your3Empty', 'my4Empty', 'your4Empty', 'my5Empty', 'your5Empty', 'my6Empty', 'your6Empty', 'my7Empty', 'your7Empty', 'my8Empty', 'your8Empty', 'my1Flip', 'your1Flip', 'my2Flip', 'your2Flip', 'my3Flip', 'your3Flip', 'my4Flip', 'your4Flip']);
				var features = function () {
					var __accu0__ = [];
					var __iterable0__ = featureNames;
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var feature = __iterable0__ [__index0__];
						__accu0__.append (list ([feature, 0]));
					}
					return dict (__accu0__);
				} ();
				var myCols = function () {
					var __accu0__ = [];
					for (var _ = 0; _ < 12; _++) {
						__accu0__.append (0);
					}
					return __accu0__;
				} ();
				var yourCols = function () {
					var __accu0__ = [];
					for (var _ = 0; _ < 12; _++) {
						__accu0__.append (0);
					}
					return __accu0__;
				} ();
				self.permSpaces = function () {
					var __accu0__ = [];
					for (var j = 0; j < 8; j++) {
						__accu0__.append (function () {
							var __accu1__ = [];
							for (var i = 0; i < 12; i++) {
								__accu1__.append ('-');
							}
							return __accu1__;
						} ());
					}
					return __accu0__;
				} ();
				var __iterable0__ = function () {
					var __accu0__ = [];
					for (var j = 0; j < 12; j++) {
						for (var i = 0; i < 8; i++) {
							__accu0__.append (tuple ([i, j]));
						}
					}
					return __accu0__;
				} ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j] == player.upper ()) {
						features ['myPerm']++;
						features ['myTotal']++;
						self.permSpaces [i] [j] = player;
						if (myCols [j] == 0) {
							myCols [j] = 1;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player).upper ()) {
						features ['yourPerm']++;
						features ['yourTotal']++;
						self.permSpaces [i] [j] = self.otherPlayer (player);
						if (yourCols [j] == 0) {
							yourCols [j] = 1;
						}
					}
					else if (board [i] [j] == player) {
						features ['myTotal']++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							features ['myPerm']++;
							self.permSpaces [i] [j] = player;
						}
						else if (numEmptyNeighbors == 1) {
							features ['my1Empty']++;
						}
						else if (numEmptyNeighbors == 2) {
							features ['my2Empty']++;
						}
						else if (numEmptyNeighbors == 3) {
							features ['my3Empty']++;
						}
						else if (numEmptyNeighbors == 4) {
							features ['my4Empty']++;
						}
						else if (numEmptyNeighbors == 5) {
							features ['my5Empty']++;
						}
						else if (numEmptyNeighbors == 6) {
							features ['my6Empty']++;
						}
						else if (numEmptyNeighbors == 7) {
							features ['my7Empty']++;
						}
						else if (numEmptyNeighbors == 8) {
							features ['my8Empty']++;
						}
						if (myCols [j] == 0) {
							myCols [j] = 1;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player)) {
						features ['yourTotal']++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							features ['yourPerm']++;
							self.permSpaces [i] [j] = self.otherPlayer (player);
						}
						else if (numEmptyNeighbors == 1) {
							features ['your1Empty']++;
						}
						else if (numEmptyNeighbors == 2) {
							features ['your2Empty']++;
						}
						else if (numEmptyNeighbors == 3) {
							features ['your3Empty']++;
						}
						else if (numEmptyNeighbors == 4) {
							features ['your4Empty']++;
						}
						else if (numEmptyNeighbors == 5) {
							features ['your5Empty']++;
						}
						else if (numEmptyNeighbors == 6) {
							features ['your6Empty']++;
						}
						else if (numEmptyNeighbors == 7) {
							features ['your7Empty']++;
						}
						else if (numEmptyNeighbors == 8) {
							features ['your8Empty']++;
						}
						if (yourCols [j] == 0) {
							yourCols [j] = 1;
						}
					}
					else if (board [i] [j] == '-') {
						var __left0__ = self.getFlipPotential (i, j, board, player);
						var myFlip = __left0__ [0];
						var yourFlip = __left0__ [1];
						var flipPotential = myFlip - yourFlip;
						if (flipPotential > 0) {
							if (flipPotential == 1) {
								features ['my1Flip']++;
							}
							else if (flipPotential == 2) {
								features ['my2Flip']++;
							}
							else if (flipPotential == 3) {
								features ['my3Flip']++;
							}
							else if (flipPotential >= 4) {
								features ['my4Flip']++;
							}
						}
						else if (flipPotential < 0) {
							if (flipPotential == -(1)) {
								features ['your1Flip']++;
							}
							else if (flipPotential == -(2)) {
								features ['your2Flip']++;
							}
							else if (flipPotential == -(3)) {
								features ['your3Flip']++;
							}
							else if (flipPotential <= -(4)) {
								features ['your4Flip']++;
							}
						}
					}
				}
				features ['diffPerm'] = features ['myPerm'] - features ['yourPerm'];
				features ['diffTotal'] = features ['myTotal'] - features ['yourTotal'];
				var features = function () {
					var __accu0__ = [];
					var __iterable0__ = features.py_items ();
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var __left0__ = __iterable0__ [__index0__];
						var k = __left0__ [0];
						var v = __left0__ [1];
						__accu0__.append (list ([k, v / 96.0]));
					}
					return dict (__accu0__);
				} ();
				features ['myCols'] = sum (myCols) / 12.0;
				features ['yourCols'] = sum (yourCols) / 12.0;
				features ['myLongestPermPath'] = self.findLongestPermPath (board, player) / 12.0;
				features ['yourLongestPermPath'] = self.findLongestPermPath (board, self.otherPlayer (player)) / 12.0;
				var myLongestPath = self.findLongestPathEdges (board, player);
				features ['myLongestPath'] = myLongestPath / 12.0;
				features ['myLongestPathSquared'] = Math.pow (myLongestPath, 2) / 144.0;
				var __left0__ = self.findLongestFuturePath (board, player, myLongestPath);
				var myLongestFuturePath = __left0__ [0];
				var myLeftFrontierFlex = __left0__ [1];
				var myRightFrontierFlex = __left0__ [2];
				var myPathFlex = myLeftFrontierFlex + myRightFrontierFlex;
				features ['myLongestFuturePath'] = myLongestFuturePath / 12.0;
				features ['myLongestFuturePathSquared'] = Math.pow (myLongestFuturePath, 2) / 144.0;
				var myOneTurnAway = myLongestFuturePath == 12;
				features ['myOneTurnAway'] = myOneTurnAway;
				if (myLongestPath <= 1 || myLongestPath == 12) {
					var blockedMe = false;
				}
				else if (myLeftFrontierFlex == 0 && len (self.leftEdges) > 0 && self.leftEdges [0] [1] != 0) {
					var blockedMe = true;
				}
				else if (myRightFrontierFlex == 0 && len (self.rightEdges) > 0 && self.rightEdges [0] [1] != 11) {
					var blockedMe = true;
				}
				else {
					var blockedMe = false;
				}
				features ['blockedMe'] = blockedMe;
				features ['myPathFlex'] = myPathFlex / 96.0;
				var yourLongestPath = self.findLongestPathEdges (board, self.otherPlayer (player));
				features ['yourLongestPath'] = yourLongestPath / 12.0;
				features ['yourLongestPathSquared'] = Math.pow (yourLongestPath, 2) / 144.0;
				var __left0__ = self.findLongestFuturePath (board, self.otherPlayer (player), yourLongestPath);
				var yourLongestFuturePath = __left0__ [0];
				var yourLeftFrontierFlex = __left0__ [1];
				var yourRightFrontierFlex = __left0__ [2];
				var yourPathFlex = yourLeftFrontierFlex + yourRightFrontierFlex;
				features ['yourLongestFuturePath'] = yourLongestFuturePath / 12.0;
				features ['yourLongestFuturePathSquared'] = Math.pow (yourLongestFuturePath, 2) / 144.0;
				var yourOneTurnAway = yourLongestFuturePath == 12;
				features ['yourOneTurnAway'] = yourOneTurnAway;
				if (yourLongestPath <= 1 || yourLongestPath == 12) {
					var blockedYou = false;
				}
				else if (yourLeftFrontierFlex == 0 && len (self.leftEdges) > 0 && self.leftEdges [0] [1] != 0) {
					var blockedYou = true;
				}
				else if (yourRightFrontierFlex == 0 && len (self.rightEdges) > 0 && self.rightEdges [0] [1] != 11) {
					var blockedYou = true;
				}
				else {
					var blockedYou = false;
				}
				features ['blockedYou'] = blockedYou;
				features ['yourPathFlex'] = yourPathFlex / 96.0;
				features ['diffLongestPath'] = (myLongestPath - yourLongestPath) / 12.0;
				features ['diffLongestFuturePath'] = (myLongestFuturePath - yourLongestFuturePath) / 12.0;
				features ['ahead'] = myLongestPath > yourLongestPath;
				features ['futureAhead'] = myLongestFuturePath > yourLongestFuturePath;
				features ['onlyTurnAway'] = myOneTurnAway && !(yourOneTurnAway);
				return features;
			});}
		});
		var GameManager = __class__ ('GameManager', [object], {
			get __init__ () {return __get__ (this, function (self) {
				self.game = PathwayzGame ();
				self.state = game.startState ();
				self.policies = dict ({'Human': null, 'PAI Random': randomMove, 'PAI Baseline': baselineMove, 'PAI Advanced Baseline': advancedBaselineMove, 'PAI Features': featuresMove, 'PAI Advanced Features': smartFeaturesMove, 'PAI TDL': TDLfeaturesMove, 'PAI Minimax': advancedMinimax, 'PAI Beam Minimax': beamMinimax, 'PAI Advanced Beam Minimax': beamMinimaxMoreFeatures, 'PAI TDL Beam Minimax': beamMinimaxTDL, 'PAI Expectimax': advancedExpectimax, 'PAI MCS': monteCarloSearch, 'PAI MCTS': monteCarloTreeSearch});
				self.displayBoard ();
				self.isAI = dict ({'w': false, 'b': false});
			});},
			get setPlayers () {return __get__ (this, function (self) {
				var player1Policy = document.getElementById ('player1').value;
				var player1Name = document.getElementById ('player1name').value;
				var player2Policy = document.getElementById ('player2').value;
				var player2Name = document.getElementById ('player2name').value;
				self.playerNames = dict ({'w': player1Name, 'b': player2Name});
				self.isAI = dict ({'w': player1Policy != 'Human', 'b': player2Policy != 'Human'});
				self.policy = dict ({'w': self.policies [player1Policy], 'b': self.policies [player2Policy]});
			});},
			get isAITurn () {return __get__ (this, function (self) {
				return self.isAI [self.game.player (self.state)];
			});},
			get AITurn () {return __get__ (this, function (self) {
				if (!(self.isAITurn ()) || self.game.isEnd (self.state)) {
					return ;
				}
				var player = self.game.player (self.state);
				var policy = self.policy [player];
				var action = policy (self.game, self.state);
				self.state = game.succ (self.state, action);
				self.displayBoard (self.coordinatesToSqNo (action));
				var __left0__ = self.state;
				var curBoard = __left0__ [0];
				var curPlayer = __left0__ [1];
				var curFeatures = game.smartFeaturesTDL (curBoard, game.otherPlayer (curPlayer));
				print (curFeatures);
				if (self.game.isEnd (self.state)) {
					if (self.game.isWinner (self.state, player)) {
						self.displayWinner (player);
					}
					else if (self.game.isWinner (self.state, self.game.otherPlayer (player))) {
						self.displayWinner (self.game.otherPlayer (player));
					}
					else {
						self.displayDraw ();
					}
				}
			});},
			get humanMove () {return __get__ (this, function (self, sqNo) {
				if (self.game.isEnd (self.state)) {
					print ('Game is over.');
					return ;
				}
				if (self.isAITurn ()) {
					print ('Wait your turn.');
					return ;
				}
				var __left0__ = self.sqNoToCoordinates (sqNo);
				var row = __left0__ [0];
				var col = __left0__ [1];
				if (!(self.game.emptyPlace (self.state, row, col))) {
					print ('Place is already taken.');
					return ;
				}
				var player = self.game.player (self.state);
				var permanent = document.getElementById ('switch_perm').checked;
				self.state = game.succ (self.state, tuple ([row, col, permanent]));
				self.displayBoard (sqNo);
				if (self.game.isEnd (self.state)) {
					if (self.game.isWinner (self.state, player)) {
						self.displayWinner (player);
					}
					else if (self.game.isWinner (self.state, self.game.otherPlayer (player))) {
						self.displayWinner (self.game.otherPlayer (player));
					}
					else {
						self.displayDraw ();
					}
				}
			});},
			get coordinatesToSqNo () {return __get__ (this, function (self, action) {
				var __left0__ = action;
				var row = __left0__ [0];
				var col = __left0__ [1];
				var _ = __left0__ [2];
				return 12 * row + col;
			});},
			get sqNoToCoordinates () {return __get__ (this, function (self, sqNo) {
				var row = int (sqNo / 12);
				var col = __mod__ (sqNo, 12);
				return tuple ([row, col]);
			});},
			get displayBoard () {return __get__ (this, function (self, fadeIn) {
				if (typeof fadeIn == 'undefined' || (fadeIn != null && fadeIn .hasOwnProperty ("__kwargtrans__"))) {;
					var fadeIn = -(1);
				};
				var __left0__ = self.state;
				var board = __left0__ [0];
				var _ = __left0__ [1];
				var squares = document.getElementsByClassName ('square');
				var __iterable0__ = squares;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var square = __iterable0__ [__index0__];
					self.refreshSquare (square, board, fadeIn == square.getAttribute ('sqid'));
				}
			});},
			get refreshSquare () {return __get__ (this, function (self, square, board, fadeIn) {
				var sqNo = square.getAttribute ('sqid');
				var __left0__ = self.sqNoToCoordinates (sqNo);
				var row = __left0__ [0];
				var col = __left0__ [1];
				var pieceType = board [row] [col];
				while (square.firstChild) {
					square.removeChild (square.firstChild);
				}
				if (pieceType == '-') {
					return ;
				}
				var piece = document.createElement ('div');
				square.appendChild (piece);
				var dot = document.createElement ('div');
				if (pieceType == 'W' || pieceType == 'B') {
					dot.classList.add ('cdot');
					piece.appendChild (dot);
				}
				if (pieceType == 'w' || pieceType == 'W') {
					piece.classList.add ('whitepiece');
				}
				else if (pieceType == 'b' || pieceType == 'B') {
					piece.classList.add ('blackpiece');
				}
				if (fadeIn) {
					piece.classList.add ('animated');
					piece.classList.add ('justPlayed');
					piece.classList.add ('fadeIn');
				}
			});},
			get resetGame () {return __get__ (this, function (self) {
				self.isAI = dict ({'w': false, 'b': false});
				self.game = PathwayzGame ();
				self.state = game.startState ();
				self.displayBoard ();
				self.displayStartMenu ();
			});},
			get showModal () {return __get__ (this, function (self) {
				document.getElementById ('modal').style.visibility = 'visible';
				document.getElementById ('modal').style.opacity = '1';
				document.getElementById ('modal').style.top = '50%';
			});},
			get displayStartMenu () {return __get__ (this, function (self) {
				self.setStartMenuText ();
				self.showModal ();
			});},
			get setStartMenuText () {return __get__ (this, function (self) {
				document.getElementById ('modaltitle').innerHTML = 'Setup Game';
				document.getElementById ('modalInformation').innerHTML = '<h2>Player 1</h2><br><select class="soflow" id="player1"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option><option>PAI Features</option><option>PAI Advanced Features</option><option>PAI TDL</option><option>PAI Minimax</option><option>PAI Beam Minimax</option><option>PAI Advanced Beam Minimax</option><option>PAI TDL Beam Minimax</option><option>PAI Expectimax</option><option>PAI MCS</option><option>PAI MCTS</option></select><input type="text" style="display: inline;" id="player1name" value="Player 1"><br><h2>Player 2</h2><br><select class="soflow" id="player2"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option><option>PAI Features</option><option>PAI Advanced Features</option><option>PAI TDL</option><option>PAI Minimax</option><option>PAI Beam Minimax</option><option>PAI Advanced Beam Minimax</option><option>PAI TDL Beam Minimax</option><option>PAI Expectimax</option><option>PAI MCS</option><option>PAI MCTS</option></select><input type="text" style="display: inline;" id="player2name" value="Player 2"><br><a href="#" onclick="closeModal(); pathwayzGame.gameManager.setPlayers();">Start Game</a></div>';
			});},
			get displayWinner () {return __get__ (this, function (self, player) {
				self.setWinText (player);
				self.showModal ();
			});},
			get setWinText () {return __get__ (this, function (self, player) {
				document.getElementById ('modaltitle').innerHTML = 'Game Over!';
				document.getElementById ('modalInformation').innerHTML = '<p>{} wins!!</p><a href="#" onclick="closeModal();">Close</a></div>'.format (self.playerNames [player]);
			});},
			get displayDraw () {return __get__ (this, function (self) {
				self.setDrawText ();
				self.showModal ();
			});},
			get setDrawText () {return __get__ (this, function (self) {
				document.getElementById ('modaltitle').innerHTML = 'Game Over!';
				document.getElementById ('modalInformation').innerHTML = '<p>Draw! No one wins!</p><a href="#" onclick="closeModal();">Close</a></div>';
			});}
		});
		var game = PathwayzGame ();
		var gameManager = GameManager ();
		__pragma__ ('<use>' +
			'math' +
			'random' +
		'</use>')
		__pragma__ ('<all>')
			__all__.AVG = AVG;
			__all__.GameManager = GameManager;
			__all__.MAX = MAX;
			__all__.MCTSdepthCharge = MCTSdepthCharge;
			__all__.MIN = MIN;
			__all__.Node = Node;
			__all__.PathwayzGame = PathwayzGame;
			__all__.TDLevaluationFunction = TDLevaluationFunction;
			__all__.TDLfeaturesMove = TDLfeaturesMove;
			__all__.advancedBaselineMove = advancedBaselineMove;
			__all__.advancedExpectimax = advancedExpectimax;
			__all__.advancedMinimax = advancedMinimax;
			__all__.backpropagate = backpropagate;
			__all__.baselineMove = baselineMove;
			__all__.beamMinimax = beamMinimax;
			__all__.beamMinimaxMoreFeatures = beamMinimaxMoreFeatures;
			__all__.beamMinimaxTDL = beamMinimaxTDL;
			__all__.beamScores = beamScores;
			__all__.depthCharge = depthCharge;
			__all__.evaluationFunction = evaluationFunction;
			__all__.expand = expand;
			__all__.featureExtractor = featureExtractor;
			__all__.featuresMove = featuresMove;
			__all__.game = game;
			__all__.gameManager = gameManager;
			__all__.initOpponentWeights = initOpponentWeights;
			__all__.initSmartFeatureWeights = initSmartFeatureWeights;
			__all__.initSmartOpponentWeights = initSmartOpponentWeights;
			__all__.minimax = minimax;
			__all__.monteCarloSearch = monteCarloSearch;
			__all__.monteCarloTreeSearch = monteCarloTreeSearch;
			__all__.oneMoveAway = oneMoveAway;
			__all__.randomMove = randomMove;
			__all__.select = select;
			__all__.selectfn = selectfn;
			__all__.shuffle = shuffle;
			__all__.smartEvaluationFunction = smartEvaluationFunction;
			__all__.smartFeaturesMove = smartFeaturesMove;
			__all__.value = value;
			__all__.valueExpectimax = valueExpectimax;
		__pragma__ ('</all>')
	}) ();
   return __all__;
}
window ['pathwayzGame'] = pathwayzGame ();
