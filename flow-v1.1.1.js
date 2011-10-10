

/*
Namespace: The Flow Namespace
	The Flow namespace, Array Extras, Plugin support, and other goodies.
	
About: Version
	1.1.1

License:
	- Flow is licensed under a Creative Commons Attribution-Share Alike 3.0 License <http://creativecommons.org/licenses/by-sa/3.0/us/>. You are free to share, modify and remix our code as long as you share alike.

Notes:
	- Some documentation assumes familiarity with the Firebug API <http://getfirebug.com/console.html>. Because if you're not, you probably should go there. Now.
*/
var Flow = {
	
	Utils : {
		
		stripWhitespace : function(element) {
			// Private variables
			var i = 0, kids = element.childNodes;
			
			var preTest = function(element) {
				if (element) {
					if ((/pre|code/).test(element.nodeName.toLowerCase()) || ((element.style) && (element.style.whiteSpace))) {
						return true;
					}
				}
				return false;
			};
			
			// Break if '<pre>' or 'white-space: pre;' is detected
			var parent = element;
			
			while (parent) {
				if (preTest(parent)) {
					return;
				}
				
				parent = parent.parentNode;
			}
			
			// Loop
			while (i < kids.length) {
				// If nodeType is 3 (TEXT_NODE) and does not include text
				if ((kids[i].nodeType == 3) && !(/\S/.test(kids[i].nodeValue))) {
					// Remove child
					element.removeChild(kids[i]);
				}
				i++;
			}
		},
		
		match : function(attribute) {
			return new RegExp("(^|\\s)" + attribute.replace(/\-/g, "\\-") + "(\\s|$)");
		},
		
		xpath : {
			
			snapshot : (window.XPathResult) ? XPathResult.ORDERED_NODE_SNAPSHOT_TYPE : null,
			
			contains : function(attribute, value, that) {
				return document.evaluate(".//*[contains(concat(' ', @" + attribute + ", ' '), ' " + value + " ')]", that, null, this.snapshot, null);
			}
		},
		
		liveNodeList : function(nodes) {
			var F = Flow,
			    B = F.Browser;
			
			// Firefox && Safari 3 handle this perfectly
			if (B.GK || B.S3) {
				return [].slice.call(nodes, 0, nodes.length);
			} else {
				var i = 0, node, clones = [];
				if (nodes && nodes.length) {
					while (i < nodes.length) {
						node = nodes[i];
						if (node) {
							clones.push(node);
						}
						i++;
					}
				}
				return clones;
			}
		},
		
		toCamelCase : function(cssProp) {
			var hyphen = /(-[a-z])/ig;
			while (hyphen.exec(cssProp)) {
				cssProp = cssProp.replace(RegExp.$1, RegExp.$1.substr(1).toUpperCase());
			}
			return cssProp;
		},
				
		RGBtoHex : function(r, g, b) {
			var hexify = function(n) {
				if (n === null) {
					return "00";
				}

				n = parseInt(n);

				if ((n === 0) || isNaN(n)) {
					return "00";
				}

				n = Math.max(0, n);
				n = Math.min(n, 255);
				n = Math.round(n);

				return "0123456789ABCDEF".charAt((n - n % 16) / 16) + "0123456789ABCDEF".charAt(n % 16);
			};
			
			return "#" + hexify(r) + hexify(g) + hexify(b);
		}
	},
	
	Augment : function(subclass, superclass) {
		subclass = subclass[0] ? subclass : [subclass];
		
		for (var i = 0, j = subclass.length; i < j; i++) {
			for (var key in superclass) {
				if (!subclass[i][key] && superclass.hasOwnProperty(key)) {
					subclass[i][key] = superclass[key];
				}
			}
		}
	},
	
	/*
	Class: Browser
		Sets a few Browser/DOM flags.

	Note:
		These are more for internal use than external.
		The entire goal of Flow Core is that you don't need to worry about browser detection.

	Properties:
		Flow.Browser.IE - Internet Explorer.
		Flow.Browser.IE6 - Internet Explorer 6
		Flow.Browser.IE7 - Internet Explorer 7
		Flow.Browser.IE8 - Internet Explorer 8
		Flow.Browser.GK - Gecko-based
		Flow.Browser.WK - Webkit
		Flow.Browser.S3 - Safari 3
		Flow.Browser.Chrome - Chrome
		Flow.Browser.OP - Opera
	*/
	Browser : {
		IEWhich : function() {
			var e = this;

			e.IE = {};
			e.IE.jscript/*@cc_on =@_jscript_version@*/;

			switch (e.IE.jscript) {
				case 5.8 :
				e.IE8 = true;
				break;

				case 5.7 :
				e.IE7 = true;
				break;

				case 5.6 :
				e.IE6 = true;
				break;
			}
		},
		init : function() {
			var B = Flow.Browser,
			    A = Array,
			    proto = A.prototype;
			
			var ua = function(browser) {
				return (browser).test(navigator.userAgent.toLowerCase());
			};
			
			Flow.Augment(B, {
				W3 : !!(document.getElementById && document.createElement), // W3C
				IE : /*@cc_on !@*/false, // IE
				GK : !!(ua(/gecko/)), // Gecko
				WK : !!(ua(/webkit/)), // Webkit
				S3 : !!(ua(/webkit/) && window.devicePixelRatio), // Safari 3
				Chrome : !!(ua(/chrome/)), // Chrome
				KHTML : !!(ua(/khtml|webkit|icab/i)), // KHTML
				OP : !!(ua(/opera/)) // Opera
			});
			
			/*
				Class: Array
				A collection of Array Extras.
			*/
			Flow.Augment([proto, A], {
				/*
				Property: every
					<http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:every>

				Parameters:
					element - the element to test against
					index - _(optional)_ A.K.A. "i", the current index in loop
					array - _(optional)_ element's parent

				Example:
					>var isBigEnough = function(element, index, array) {
					>  return (element >= 10);
					>};
					>var passed = [12, 5, 8, 130, 44].every(isBigEnough); // passed is false
					>passed = [12, 54, 18, 130, 44].every(isBigEnough); // passed is true
				*/
				every : function(fun /*, caller*/) {
					var that = this;

					var len = this.length, i = 0;
					var caller = arguments[1];
					
					while (i < len) {
						if (i in this && !fun.call(caller, this[i], i, this)) {
							return false;
						}
						i++;
					}

					return true;
				},

				/*
				Property: some
					<http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:some>

				Parameters:
					element - the element to test against
					index - _(optional)_ A.K.A. "i", the current index in loop
					array - _(optional)_ element's parent

				Example:
					>var isBigEnough = function(element, index, array) {
					>  return (element >= 10);
					>};
					>var passed = [2, 5, 8, 1, 4].some(isBigEnough); // passed is false
					>passed = [12, 5, 8, 1, 4].some(isBigEnough); // passed is true
				*/
				some : function(fun /*, caller*/) {
					var that = this;

					var len = this.length, i = 0;
					var caller = arguments[1];
					
					while (i < len) {
						if (i in this && fun.call(caller, this[i], i, this)) {
							return true;
						}
						i++;
					}

					return false;
					
				},

				/*
				Property: filter
					<http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:filter>

				Parameters:
					element - the element to test against
					index - _(optional)_ A.K.A. "i", the current index in loop
					array - _(optional)_ element's parent

				Example:
					>var isBigEnough = function(element, index, array) {
					>  return (element >= 10);
					>};
					>var filtered = [12, 5, 8, 130, 44].filter(isBigEnough); // returns [12, 130, 44]
				*/
				filter : function(fun /*, caller*/) {
					var that = this;

					var res = [],
					    caller = arguments[1];
					
					var i = 0;
					while (i < that.length) {
						if (i in that) {
							var val = that[i]; // in case fun mutates this
							if (fun.call(caller, val, i, that)) {
								res.push(val);
							}
						}
						i++;
					}
					return res;
				},

				/*
				Property: map
					<http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:map>

				Parameters:
					element - the element to test against
					index - _(optional)_ A.K.A. "i", the current index in loop
					array - _(optional)_ element's parent

				Example:
					>var numbers = [1, 4, 9];
					>var roots = numbers.map(Math.sqrt); // roots is now [1, 2, 3]
					>// numbers is still [1, 4, 9]
				*/
				map : function(fun /*, caller*/) {
					var that = this,
					     len = this.length;

					var res = [len], i = 0;
					var caller = arguments[1];
					
					while (i < len) {
						if (i in this) {
							res[i] = fun.call(caller, this[i], i, this);
						}
						i++;
					}

					return res;
				},

				/*
				Property: indexOf
					<http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:indexOf>

				Parameters:
					element - the element to test against
					index - _(optional)_ A.K.A. "i", the current index in loop
					array - _(optional)_ element's parent

				Example:
					>var array = [2, 5, 9];
					>var index = array.indexOf(2); // index is 0
					>index = array.indexOf(7); // index is -1
				*/
				indexOf : function(fun, start) {
					var that = this;

					var i = start || 0;
					
					while (i < that.length) {
						if (j === fun) {
							return i;
						}
						i++;
					}
				},
				
				/*
				Property: lastIndexOf
					<http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:lastIndexOf>

				Parameters:
					element - the element to test against
					index - _(optional)_ A.K.A. "i", the current index in loop
					array - _(optional)_ element's parent

				Example:
					(start code)
					var array = [2, 5, 9, 2];
					var index = array.lastIndexOf(2); // index is 3
					index = array.lastIndexOf(7); // index is -1
					index = array.lastIndexOf(2, 3); // index is 3
					index = array.lastIndexOf(2, 2); // index is 0
					index = array.lastIndexOf(2, -2); // index is 0
					index = array.lastIndexOf(2, -1); // index is 3
					(end code)
				*/
				lastIndexOf : function(elt, from) {
					var that = this,
					    length = that.length;
					
					from = from || length;
					if (from >= length) {
						from = length;
					}
					if (from < 0) {
						from = length + from;
					}
					var i = from;
					while (i >= 0) {
						if (that[i] === elt) {
							return i;
						}
						i--;
					}
					return -1;
				},
				
				/*
				Property: forEach
					<http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:filter>

				Parameters:
					element - the element to test against
					index - _(optional)_ A.K.A. "i", the current index in loop
					array - _(optional)_ element's parent

				Example:
					(start code)
					var lis = document.getElementsByTagName("li");
					lis.forEach(function(element, index, array) {
						console.log(element.nodeName.toLowerCase == "li") // alerts true
						console.log(i) // Alerts current index
						console.log(array) // alerts the elements container array
					});
					(end code)
				*/
				forEach : function(fun /*, caller*/) {
					var that = this;
					
					var caller = arguments[1],
					    i = 0;
					
					while (i < that.length) {
						if (i in that) {
							fun.call(caller, that[i], i, that);
						}
						i++;
					}
				},
				
				/*
				Property: reduce
					<http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:reduce>

				Parameters:
					element - the element to test against
					index - _(optional)_ A.K.A. "i", the current index in loop
					array - _(optional)_ element's parent

				Example:
					Flatten an array of arrays:
					(start code)
					var flattened = [[0,1], [2,3], [4,5]].reduce(function(a,b) {
					  return a.concat(b);
					}, []);
					// flattened is [0, 1, 2, 3, 4, 5]
					(end code)
				*/
				reduce : function(fun /*, initial*/) {
					var that = this;
					
					var len = that.length, i = 0;
					
					if (arguments.length >= 2) {
						var rv = arguments[1];
					} else {
						do {
							if (i in that) {
								rv = that[i++];
								break;
							}
						} while (true);
					}
					for (; i < len; i++) {
						if (i in that) {
							rv = fun.call(null, rv, that[i], i, that);
						}
					}
					return rv;
				},
				
				/*
				Property: reduceRight
					<http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:reduceRight>

				Parameters:
					element - the element to test against
					index - _(optional)_ A.K.A. "i", the current index in loop
					array - _(optional)_ element's parent

				Example:
					Flatten an array of arrays:
					(start code)
					var flattened = [[0, 1], [2, 3], [4, 5]].reduceRight(function(a, b) {
					  return a.concat(b);
					}, []);
					// flattened is [4, 5, 2, 3, 0, 1]
					(end code)
				*/
				reduceRight : function(fun /*, initial*/) {
					var that = this;
					
					var len = that.length,
					    i = len - 1;
					
					if (arguments.length >= 2) {
						var rv = arguments[1];
					} else {
						do {
							if (i in that) {
								rv = that[i--];
								break;
							}
						} while (true);
					}
					for (; i >= 0; i--) {
						if (i in that) {
							rv = fun.call(null, rv, that[i], i, that);
						}
					}
					return rv;
				},
				
				/*
				Property: exit
					Provides a way to break out of a forEach loop

				Parameters:
					index - A.K.A. "i", the current index in loop

				Example:
					Break a forEach loop:
					(start code)
					var array = [1, 2, 0, 3, 4, 5];
					array.forEach(function(item, i) {
					  if (item === 0) {
					    array = array.exit(i); // Break!
					  } else {
					    console.log(item);
					  }
					});
					console.log(array); // returns [1, 2, 0, 3, 4, 5];
					(end code)
				*/
				exit : function(index) {
					var that = this;
					return that.concat(that.splice(index, that.length - index));
				}
			});
			
			// Turn off background image caching for IE 
			if (B.IE) {
				B.IEWhich();
				try {
					document.execCommand("BackgroundImageCache", false, true);
				} catch (e) {}
			}
		}
	},
	
	/*
	Class: Apply
		Used to extend Flow to elements.

	Note:
		Flow auto-extends every element.
		getInnerHTML / setInnerHTML take care of adding Flow to elements using innerHTML
		However if you insist on using native innerHTML, you need to re-bind Flow to injected elements using Flow.Apply
	*/
	Apply : function(element) {
		return Flow.Bind.extend(element);
	},
	
	Bind : {
		// Each DOM element is flagged with a unique ID
		UNIQUE : 1,
	
		methods : {
			// We know DOM will be on every node
			DOM : "DOM"
		},

		apply : function(object) {
			var that = this;
		
			that.objects = that.objects || [];
			that.objects.push(object);
		
			that.document(document);
		},

		// Binds functions to elements
		extend : function(nodes) {
			var that = this,
			    F = Flow;

			// Sanity check
			if (!nodes) {
				return;
			}
			var one, i, node;

			// Parameter is not an array. Flag it, make it so
			if (nodes.nodeName) {
				one = true;
				nodes = [nodes];
			}

			// Reverse while loop (faster than a straight for)
			i = nodes.length;

			while (i >= 0) {
				node = nodes[i];
			
				// This is how I check if it's bound.
				// If it hasn't, it has no DOM reference
				if ((node && !node.DOM) || (node && node.nodeType === 9)) {
				
					// Bind events to element
					that.bind(node);

					// Strip whitespace from element
					F.Utils.stripWhitespace(node);

					// Assign DOM reference
					node.DOM = node.DOM || ("SCH_" + that.UNIQUE++);
				
				}

				// Reverse while loop
				i--;
			}
		
			return one ? nodes[0] : nodes;
		},

		// Custom document events
		document : function(node) {
			var that = this;

			// Private variables
			var i = 0, doc, F = Flow;
		
			// Assign DOM reference
			node.DOM = node.DOM || ("SCH_" + that.UNIQUE++);
		
			while (i < that.objects.length) {
				doc = that.objects[i];
				doc.boundElements = doc.boundElements || {};
			
				if (!doc.boundElements[node.DOM]) {
					that.iterate(doc.document, node);
				
					node._defaultView = node.defaultView;
				
					if (typeof node.defaultView === "undefined") {
						node.defaultView = window;
					}
				
					that.iterate(doc.computed, node.defaultView);
				
					doc.boundElements[node.DOM] = node.DOM;
				}
				i++;
			}
			that.extend(node);
		},

		iterate : function(object, node) {
			var that = this;
		
			for (var key in object) {
				if (object.hasOwnProperty(key)) {
					if (!node.DOM || !node[key] || !that.methods[key]) {
						// ARCHIVED NATIVE METHODS
					
						try {
							if (node == Array.prototype) {
								node[key] = function() {
									var i = 0, array = this, call,
									    args = arguments, combo = [];
								
									var singleProps = ["getFirstChild", "getLastChild"],
									    curr = args.callee.key;
									while (i < singleProps.length) {
										if (curr == singleProps[i]) {
											throw curr + " property can only be called on single element.";
										}
										i++;
									}
								
									i = 0;
									while (i < array.length) {
										// Yay, a useful purpose for arguments.callee!
										call = array[i][curr].apply(array[i], args);
										if (call) {
											var j = 0;
											while (j < call.length) {
												if (call[j]) {
													combo.push(call[j]);
												}
												j++;
											}
										}
										i++;
									}
									return combo[0] ? combo : array;
								};
								node[key].key = key;
							} else {

								if (node[key]) {
									var orig = "_" + key;
									node[orig] = node[key];
									that.methods[orig] = that.methods[orig] || orig;
								}
								node[key] = object[key];
							}
							that.methods[key] = that.methods[key] || key;
							that.shortcut(node, key);
						} catch (e) {}
					}
				}
			}
		},

		shortcut : function(node, key) {
			var that = this;
		
			var reg = /(get|query)(Element[s]?|Selector)?(By(Class|Tag|Id|Attr)|All)?(Name|ibute)?/;
			if (reg.test(key)) {
				var shorthand = key.replace(reg, "$1$3");
				node[shorthand] = node[key];
				that.methods[shorthand] = that.methods[shorthand] || shorthand;
			}
		},

		bind : function(node) {
			var that = this;

			if (!node.DOM || (node && node.nodeType === 9)) {
				var i = 0, j, k,
				    obj = that.objects;
			
				while (i < obj.length) {
					j = obj[i];
				
					if (j.nodes && j.nodes.limit) {
						k = 0;
						while (k < j.nodes.limit.length) {
							var type = j.nodes.limit[k];
							if (node.nodeName.toLowerCase() == type) {
								that.iterate(j.nodes, node);
							}
							k++;
						}
					} else {
						that.iterate(j.nodes, node);
					}
				
					// IE fixes for botched API
					if (Flow.Browser.IE) {
						that.iterate(j.ie, node);
					}
					i++;
				}
			}
		}
	},
	
	/*
		Class: Plugin
		Allows you to extend the Flow namespace

		Example:
			(start code)
			// define closure
			new Flow.Plugin({
				name : "Foo", // You've defined "Flow.Foo"
				version : "1.0.2 (fixes conflict with 'Soda.Grape')", // Versioning info
				description : "Foo integrates Flow with 'Soda.Orange'.", // Brief description

				constructor : { // The meat n' potatoes. Your Function/Object goes here
					init : function(e) {
						e = e.toUpperCase();
						this.orange(e);
					},
					orange : function(e) {
						this.flavor = e;
						this.fizz();
					},
					fizz : function() {
						alert("soda");
					}
				}.init("orange") // call constructor.init
			}); // closure
			(end code)
	*/
	Plugin : function(plugin) {
		// if no plugin.name, assume anonymous
		if (plugin.name) {
			if (Flow[plugin.name]) {
				throw "Flow." + plugin.name + " already exists";
			}
			Flow[plugin.name] = plugin.constructor;

			if (plugin.bind) {
				Flow.Bind.apply(plugin.constructor);
			}
		} else {
			plugin.constructor();
		}
	}
	
};

Flow.Browser.init();


/*
Namespace: The Dom Namespace
	Extends the native JS DOM API across all grade-A browsers.

About: Version
	1.1.1

Requires:
	Flow.js.

License:
	- Flow is licensed under a Creative Commons Attribution-Share Alike 3.0 License <http://creativecommons.org/licenses/by-sa/3.0/us/>. You are free to share, modify and remix our code as long as you share alike.

Notes:
	- Some documentation assumes familiarity with the Firebug API <http://getfirebug.com/console.html>. Because if you're not, you probably should go there. Now.
*/

new Flow.Plugin({
	name : "Dom",
	version : "1.1.1",
	bind : true,
	constructor : function() {

		var F = Flow,
		    D = F.Dom,
		    X = F.Bind,
		    B = F.Browser,
		    U = F.Utils,
		    E = F.Event;
		
		var className = "className",
		    firstChild = "firstChild",
		    lastChild = "lastChild",
		    evalString = "evaluate",
		    doc = document,
		    zero = null,
		    that;

		return {
			/*
			Interface: Element
				These functions are bound to _elements_.
			*/
			nodes : {

				/*
				Property: getElementsByClassName
					http://developer.mozilla.org/en/docs/DOM:document.getElementsByClassName

				Shorthand:
					getByClass

				Parameters:
					className - the class to retrieve.

				Example:
					>var foo = document.getElementsByClassName("foo");
					>var foo = document.getByClass("foo"); // shortcut
				*/
				getElementsByClassName : function() {
					var format = function(className) {
						if (!(className instanceof Array)) {
							className = className.replace(/^\s?|\s?$/g, "");
							if (/ /.test(className)) {
								className = className.split(" ");
							}
							className = (typeof className == "string") ? [className] : className;
						}
						return className;
					};
					
					var hasClass = function(elClass, element) {
						return new RegExp("(?:^|\\s+)" + elClass + "(?:\\s+|$)").test(element[className]);
					};
					var match = function(reg, element) {
						var i = 0, ex;
						while (ex = reg[i++]) {
							if (!ex.test(element[className])) {
								element = zero;
								break;
							}
						}
						return element;
					};
					var evaluate = function(className, that) {
						var evals = [], reg = [],
						    i = 0, Class;
						while (Class = className[i++]) {
							if (doc[evalString] && that) {
								evals.push(U.xpath.contains("class", Class, that));
							}
							reg.push(U.match(Class));
						}
						return {
							evals : evals,
							reg : reg
						};
					};
					var empty = function(className) {
						return (typeof className == "object" && !className[0]) || (className === "");
					};

					// native
					if (doc._getElementsByClassName) {
						return function(className) {

							var that = this;

							var nodes = new U.liveNodeList(that._getElementsByClassName(className));
							return X.extend(nodes);
						};
					}

					// xpath
					if (doc[evalString]) {
						return function(className) {
					
							var that = this;
					
							if (empty(className)) {
								// Paranoid
								return [];
							}
					
							// Clean className
							className = format(className);
							var nodes = [], element, i = 0, x = 0,
							    regEx = evaluate(className, that),
							    evals = regEx.evals, xpath,
							    reg = regEx.reg, _match;
					
							while (xpath = evals[i++]) {
								while (element = xpath.snapshotItem(x++)) {
									_match = match(reg, element);
									if (_match) {
										nodes.push(_match);
									}
								}
							}
							return X.extend(new U.liveNodeList(nodes));
						};
					}
					
					// generic
					return function(className) {
					
						var that = this;
					
						if (empty(className)) {
							// Paranoid
							return [];
						}
					
						className = format(className);
						// Private variables
						var nodes, elArray = [], element, i = 0, _match;
						nodes = that._getElementsByTagName("*");
						var regEx = evaluate(className),
						    reg = regEx.reg;
					
						while (element = nodes[i++]) {
							_match = match(reg, element);
							if (_match) {
								elArray.push(_match);
							}
						}
						
						return X.extend(elArray);
					};
				}(),

				/*
				Property: getElementsByTagName
					http://developer.mozilla.org/en/docs/DOM:document.getElementsByTagName

				Shorthand:
					getByTag

				Parameters:
					tagName - the tag to retrieve.

				Example:
					>var foo = document.getElementsByTagName("li");
					>var foo = document.getByTag("li"); // shortcut
				*/
				getElementsByTagName : function() {
					
					if (doc[evalString]) {
						return function(tagName) {
							tagName = tagName.toLowerCase();
							
							switch (tagName) {
								case "applet" :
								case "embed" :
								return document._getElementsByTagName(tagName);
								
								default:
								var i = 0, element, that = this;

								var xpath = doc[evalString](".//" + tagName, that, zero, U.xpath.snapshot, zero),
								    nodes = [];

								while (element = xpath.snapshotItem(i++)) {
									nodes.push(element);
								}

								nodes = X.extend(nodes);

								return nodes;
							}
						};
					}
					return function(tagName) {
						tagName = tagName.toLowerCase();

						var that = this;

						switch (tagName) {
							case "applet" :
							case "embed" :
							return document._getElementsByTagName(tagName);
							
							default:
							var nodes = X.extend(that._getElementsByTagName(tagName));
							
							var clones = [];
							for (var i = 0, j = nodes.length; i < j; i++) {
								clones.push(nodes[i]);
							}
							
							return clones;
						}
					};
				}(),

				// cloneNode wrapper
				cloneNode : function(deep) {
					var clone = this._cloneNode(deep);

					// DOM elements should not have the same ID
					if (deep) {
						var i = 0,
						    children = clone.getElementsByTagName("*");
						while (i < children.length) {
							X.extend(children[i]);
							children[i].DOM = "SCH_" + X.UNIQUE++;
							i++;
						}
					}
					clone = X.extend(clone);
					
					// Assign new DOM ID
					clone.DOM = "SCH_" + X.UNIQUE++;
					
					return clone;
				},

				// removeChild wrapper
				removeChild : function(childNode) {
					E = E || F.Event;
					if (E && childNode && childNode.DOM && childNode.nodeType == 1) {
						E.cache.flush(childNode);
					}
					
					if (typeof this._removeChild !== "undefined") {
						this._removeChild(childNode);
					}
				},

				// replaceChild wrapper
				replaceChild : function(newNode, referenceNode) {
					E = E || F.Event;
					if (E && referenceNode && referenceNode.DOM && referenceNode.nodeType == 1) {
						E.cache.flush(referenceNode);
					}
					
					if (this.replaceNode) {
						referenceNode.replaceNode(newNode);
					} else {
						this._replaceChild(newNode, referenceNode);
					}
				}
			},

			/*
			Interface: Document
				These functions are bound to _document_.
			*/
			document : {

				/*
				Property: getElementById
					http://developer.mozilla.org/en/docs/DOM:document.getElementById

				Shorthand:
					getById

				Parameters:
					idName - the id to retrieve.

				Example:
					>var foo = document.getElementById("foo");
					>var foo = document.getById("foo"); // shortcut
				*/
				getElementById : function(idName) {
					D = D || F.Dom;
					
					var element = doc._getElementById(idName);
					
					if (element) {
						//make sure that it is a valid match on id
						var attr = element.attributes["id"];
						if (attr && attr.value && (attr.value == idName)) {
							return X.extend(element);
						} else {
							if (B.WK) {
								// Safari 2 chokes on attributes["id"]
								// But we know it returns an id regardless, so we give it a pass
								return X.extend(element);
							} else {
								//otherwise find the correct element
								for (var i = 1; i < document.all[idName].length; i++) {
									if(document.all[idName][i].id == idName) {
										return X.extend(document.all[idName][i]);
									}
								}
							}
						}
					}
				},

				/*
				Property: getElementsByName
					http://developer.mozilla.org/en/docs/DOM:document.getElementsByName

				Shorthand:
					getByName

				Parameters:
					name - the name to retrieve.

				Example:
					>var foo = document.getElementsByName("foo");
					>var foo = document.getByName("foo"); // shortcut
				*/
				getElementsByName : function(name) {
					D = D || F.Dom;

					var element = X.extend(doc._getElementsByName(name));
					element = new U.liveNodeList(element);
					return element;
				},

				// Binds custom events to newly created elements
				createElement : function(element) {
					var newElement = this._createElement(element);
					return X.extend(newElement);
				}
			},

			/*
			Interface: IE Fixes
				These functions are fixed for Internet Explorer.
			*/
			ie : {

				/*
				Property: getAttribute
					http://developer.mozilla.org/en/docs/DOM:element.getAttribute

				Parameters:
					attribute - the attribute to retrieve.

				Example:
					>var foo = document.getElementById("foo");
					>var attr = foo.getAttribute("class");
					>// returns class (yes, even in IE)
				*/
				getAttribute : function(attribute) {
					that = this;

					switch (attribute) {
						case "style" :
						var style = that.style.cssText.toLowerCase();
						
						// Perfectionist's addition of semicolon ;)
						if (!(/;$/.test(style))) {
							style += ";";
						}
						return style;

						case "class" :
						return that[className];

						case "for" :
						return that.htmlFor;
						
						case "type" :
						return that.type;

						case "href" :
						case "src" :
						case "value" :
						return that._getAttribute(attribute, 2);

						default :
						return that._getAttribute(attribute);
					}
				},

				/*
				Property: setAttribute
					http://developer.mozilla.org/en/docs/DOM:element.setAttribute

				Parameters:
					attribute - the attribute to set.
					value - the value to set.

				Example:
					>var foo = document.getElementById("foo");
					>foo.setAttribute("class", "bar");
					>// sets class (yes, even in IE)
				*/
				setAttribute : function(attribute, value) {
					that = this;

					switch (attribute) {
						case "style" :
						that.style.cssText = value;
						return;

						case "class" :
						that[className] = value;
						return;

						case "for" :
						that.htmlFor = value;
						return;

						case "title" :
						that.title = value;
						return;
						
						case "type" :
						that.type = value;
						return;

						default :
						that._setAttribute(attribute, value);
						return;
					}
				},

				/*
				Property: hasAttribute
					http://developer.mozilla.org/en/docs/DOM:element.hasAttribute

				Parameters:
					attribute - the attribute to set.
					value - the value to set.

				Example:
					>var foo = document.getElementById("foo");
					>if (foo.hasAttribute("class")) {
					>	foo.removeAttribute("class");
					>}
					>// (yes, even in IE)
				*/
				hasAttribute : function(attribute) {
					return this.getAttribute(attribute) !== zero;
				}
			},

			/*
			Interface: Window
				These functions are bound to _document.defaultView_.
			*/
			computed : {

				/*
				Property: getComputedStyle
					http://developer.mozilla.org/en/docs/DOM:window.getComputedStyle

				Parameters:
					element - the computed element to retrieve.
					pseudoElt - _(optional)_ the computed pseudo-element to retrieve.

				Example:
					>var foo = document.getElementById("foo");
					>var computedStyle = document.defaultView.getComputedStyle(foo, null);
				*/
				getComputedStyle : function(element, pseudoElt) {

					/*
					Property: getPropertyValue
						Grabs individual property values from an element's computed style

					Parameters:
						property - the property to retrieve.

					Example:
						>var foo = document.getElementById("foo");
						>var width = document.defaultView.getComputedStyle(foo, null).getPropertyValue("width");
					*/
					var RGBtoHex = U.RGBtoHex;
					
					if (document.defaultView._getComputedStyle) {
						
						var computedStyle = document.defaultView._getComputedStyle(element, pseudoElt);
						
						if (!B.Chrome) {
							computedStyle.getPropertyValue = function(property) {
							
								var value = document.defaultView._getComputedStyle(element, pseudoElt).getPropertyValue(property);
								switch (/color|background/.test(property)) {
									case true :
									if (/rgb/.test(value)) {
										// Switch to Hex
										var rgb = (/rgb\(([^\)]+)\)/).exec(value);
										if (rgb && rgb[1]) {
											rgb = rgb[1].split(/\, ?/);
											return RGBtoHex(rgb[0], rgb[1], rgb[2]).toLowerCase();
										}
									} else {
										// Make sure hex is lowercase
										var hexcode = (/\#[a-zA-Z0-9]+/).exec(value);
										if (hexcode && hexcode[0]) {
											value = value.replace(hexcode[0], hexcode[0].toLowerCase());
										}
										return value;
									}
									break;
								
									default :
									return value;
								}
							};
						}
						
						return computedStyle;
					} else {
						element.getPropertyValue = function(property) {
							property = U.toCamelCase(property);

							var unAuto = function(prop) {

								var calcPx = function(props, dir) {
									var value;
									dir = dir.replace(dir.charAt(0), dir.charAt(0).toUpperCase());

									var globalProps = {
										visibility : "hidden",
										position : "absolute",
										left : "-9999px",
										top : "-9999px"
									};

									var dummy = element.cloneNode(true);

									for (var i = 0, j = props.length; i < j; i++) {
										dummy.style[props[i]] = "0";
									}
									for (var key in globalProps) {
										dummy.style[key] = globalProps[key];
									}

									document.body.appendChild(dummy);
									value = dummy["offset" + dir];
									document.body.removeChild(dummy);

									return value;
								};

								switch (prop) {
									case "width" :
									props = ["paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"];
									prop = calcPx(props, prop);
									break;

									case "height" :
									props = ["paddingTop", "paddingBottom", "borderTopWidth", "borderBottomWidth"];
									prop = calcPx(props, prop);
									break;

									default :
									prop = style[prop];
									break;
								}

								return prop;
							};


							var PIXEL = /^\d+(px)?$/i;
							var COLOR = /color|backgroundColor/i;
							var SIZES = /width|height|top|bottom|left|right|margin|padding|border(.*)?Width/;
							
							// Limited to HTML 4.01 defined names
							// http://www.w3.org/TR/REC-html40/types.html#h-6.5
							var getHexColor = {
								aqua : "00FFFF",
								black : "000000",
								blue : "0000FF",
								fuchsia : "FF00FF",
								green : "008000",
								grey : "808080",
								lime : "00FF00",
								maroon : "800000",
								navy : "000080",
								olive : "808000",
								purple : "800080",
								red : "FF0000",
								silver : "C0C0C0",
								teal : "008080",
								white : "FFFFFF",
								yellow : "FFFF00"
							};
							
							var getPixelValue = function(prop, name) {
								if (PIXEL.test(prop)) {
									return prop;
								}
								
								// if property is auto, do some messy appending
								if (prop === "auto") {
									prop = unAuto(name);
								} else {
									var style = this.style.left,
									    runtimeStyle = this.runtimeStyle.left;

									this.runtimeStyle.left = this.currentStyle.left;
									this.style.left = prop || 0;
									prop = this.style.pixelLeft;
									this.style.left = style;
									this.runtimeStyle.left = runtimeStyle;
								}
								
								return prop + "px";
							};
							
							var getColorValue = function(value) {
								// Hex must be 7 chars in length, including octothorpe.
								if (/#/.test(value) && value.length !== 7) {
									var hex = (/[a-zA-Z0-9]+/).exec(value)[0].split("");
									value = "#" + [hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]].join("").toLowerCase();
								} else if (/rgb/.test(value)) {
									// Switch to Hex
									value = (/rgb\(([^\)]+)\)/).exec(value)[1].split(/\, ?/);
									return RGBtoHex(value[0], value[1], value[2]).toLowerCase();
								} else if (getHexColor[value]) {
									value = "#" + getHexColor[value].toLowerCase();
								}
								
								return value;
							};
							
							if (COLOR.test(property)) {
								property = getColorValue(this.currentStyle[property]);
							} else if (SIZES.test(property)) {
								property = getPixelValue.call(this, this.currentStyle[property], property);
							} else {
								property = this.currentStyle[property];
							}

							/**
							 * @returns property (or empty string if none)
							*/
							return property || "";
						};

						/*
						Property: removeProperty
							Removes individual property values from an element's computed style

						Parameters:
							property - the property to remove.

						Example:
							>var foo = document.getElementById("foo");
							>var width = document.defaultView.getComputedStyle(foo, null).removeProperty("width");
						*/
						element.removeProperty = function(property) {
							property = U.toCamelCase(property);
							this.currentStyle[property] = "";
						};

						/*
						Property: setProperty
							Sets individual property values on an element's computed style

						Parameters:
							property - the property to modify.
							value - the value to set

						Example:
							>var foo = document.getElementById("foo");
							>var width = document.defaultView.getComputedStyle(foo, null).setProperty("width", "200");
						*/
						element.setProperty = function(property, value) {
							property = U.toCamelCase(property);
							this.currentStyle[property] = value;
						};

						return element;
					}
				}
			},

			init : function() {
				doc.getByTag("*");
			}
		};

	}()
});

/*
Namespace: The Event Namespace
	Never again worry about memory leaks. Event automagically garbage-collects any node you remove/replace, and flushes event listeners on unload. In addition, Event brings native event handling API support.

About: Version
	1.1.1

License:
	- Some parts of _addEventListener_ based on Dean Edwards' event methods <http://dean.edwards.name/weblog/2005/10/add-event/>
	  and Tino Zijdel's subsequent modifications <crisp@xs4all.nl>
	
	- Some parts of _cache_ based on Mark Wubben's EventCache Version 1.0 <http://novemberborn.net/javascript/event-cache>.
	  Licensed under the CC-GNU LGPL <http://creativecommons.org/licenses/LGPL/2.1/>.
	
	- Flow is licensed under a Creative Commons Attribution-Share Alike 3.0 License <http://creativecommons.org/licenses/by-sa/3.0/us/>. You are free to share, modify and remix our code as long as you share alike.

Requires:
	Flow.js.
*/
new Flow.Plugin({
	name : "Event",
	version : "1.1.1",
	bind : true,
	constructor : function() {
		var F = Flow,
		    B = F.Browser,
		    E = F.Event,
		    U = F.Utils,
		    C = F.CustomEvent,
		    that,
		    UNIQUE = 1,
		    doc = document,
		    readyState = "readyState",
		    ContentLoaded = /ContentLoaded/;
		
		var isFB = function() {
			return !!(window.console && window.console.firebug);
		}();
		
		return {

			/*
			Interface: Element
				These functions are bound to _elements_.
			*/
			nodes : {
				/*
				Property: addEventListener
					http://developer.mozilla.org/en/docs/DOM:element.addEventListener

				Parameters:
					type - the type of event to bind.
					handler - the event to bind.
					useCapture - turn event bubbling on/off.

				Example:
					(start code)
					var foo = document.getElementsByClassName("foo");
					var ZOMG = function(e) {
						console.log("zomg");
						e.preventDefault();
					};
					foo.addEventListener("click", ZOMG, false);
					(end code)
				*/
				addEventListener : function (type, handler, useCapture) {
					E = E || F.Event;

					// Add event to cache (avoid memory leaks)
					E.cache.add(this, type, handler, useCapture);
					
					if ((type == "DOMContentLoaded") && (B.IE || B.WK)) {
						if (B.WK) {
							E.stack.push(handler);
							var timer = setInterval(function() {
								if (/loaded|complete/.test(doc[readyState])) {
									clearInterval(timer);
									E.fire();
								}
							}, 10);
						} else if (B.IE) {
							E.stack.push(handler);
							
							// Write in a trigger for IE.
							// IE supports the defer attribute, which allows this to load when the DOM is ready.
							// aka: onDOMContentLoaded
							doc.write("<script id=_ready defer src=//:><\/script>");

							// Target the trigger.
							doc.all._ready.onreadystatechange = function() {
								// Access IE's readyState property.
								// Once complete, remove trigger, compile and fire our list of events.
								if (this.readyState == "complete") {
									this.removeNode();
									Flow.Event.fire();
								}
							};
						}
					} else {
						// Handle the event
						var handleEvent = function(event) {

							// Handle the event
							// Fix event if not handled properly
							event = event || function(event) {
								// The Magix

								// Now supporting preventDefault
								event.preventDefault = function() {
									this.returnValue = false;
								};

								// Now supporting stopPropagation
								event.stopPropagation = function() {
									this.cancelBubble = true;
								};
								
								// Now supporting relatedTarget
								event.relatedTarget = event.toElement;

								// Now supporting target
								event.target = event.srcElement || document;
								
								// Now supporting page X/Y
								var element = doc.documentElement, body = doc.body;
								event.pageX = event.clientX + (element && element.scrollLeft || body && body.scrollLeft || 0) - (element.clientLeft || 0);
								event.pageY = event.clientY + (element && element.scrollTop || body && body.scrollTop || 0) - (element.clientTop || 0);
								
								// Now supporting which
								event.which = (event.charCode || event.keyCode);
								
								// Now supporting metaKey
								event.metaKey = event.ctrlKey;

								return event;
							}(window.event);

							var handlers = this.events[event.type],
							    returnValue, key;
							for (key in handlers) {
								if (handlers.hasOwnProperty(key) && handlers[key].call(this, event) === false) {
									returnValue = false;
								}
							}

							return returnValue;
						};
						
						var attachEvent = function(type, handler) {
							var node = this;
							handler.SCH = handler.SCH || UNIQUE++;

							node.events = node.events || {};

							if (!node.events[type]) {

								node.events[type] = {};

								if (node["on" + type]) {
									node.events[type][0] = node["on" + type];
								}
								
								if (B.IE && (typeof(this.event) !== "undefined")) {
									node = window;
								}
								
								// If "DOM" event, these don't support "on" attachments
								if (/DOM/.test(type)) {
									node._addEventListener(type, handler, false);
								} else {
									node["on" + type] = handleEvent;
								}
							}
							
							node.events[type][handler.SCH] = handler;
							
						};
						
						// Firebug does not like Flow's overriding of addEventListener
						// We'll give it the default implementation.
						if ((/firebug/).test(type)) {
							this._addEventListener(type, handler, false);
						} else {
							attachEvent.call(this, type, handler);
						}
					}

					return that;
				},

				/*
				Property: removeEventListener
					http://developer.mozilla.org/en/docs/DOM:element.removeEventListener

				Parameters:
					type - the type of event to unbind.
					handler - the event to unbind.
					useCapture - turn event bubbling on/off.

				Example:
					>var foo = document.getElementsByClassName("foo");
					>foo.removeEventListener("click", ZOMG, false);
				*/
				removeEventListener : function (type, handler, useCapture) {
					that = this;
					
					var key, i;
					if (that.events) {
						if (!type) {
							for (key in that.events) {
								for (i in that.events[key]) {
									delete that.events[key][i];
								}
							}
						} else if (type && !handler) {
							for (key in that.events[type]) {
								delete that.events[type][key];
							}
						} else if (handler.SCH) {
							delete that.events[type][handler.SCH];
						}
					}
				},
				
				/*
				Property: dispatchEvent
					http://developer.mozilla.org/en/docs/DOM:element.dispatchEvent
					(differs slightly from implementation)

				Parameters:
					type - the type of event to fire.

				Example:
					(start code)
					var foo = document.getElementById("foo");
					foo.addEventListener("click", ZOMG, false);
					
					document.getById("trigger").addEventListener("click", function() {
						foo.dispatchEvent("click"); // Triggers foo's click event handler
					}, false);
					(end code)
				*/
				dispatchEvent : function(type) {
					that = this;
					
					var key;
					
					var fireEvents = function() {
						if ((typeof type === "string") && that.events && that.events[type]) {
							for (key in that.events[type]) {
								that.events[type][key].call(that);
							}
						}
					};
					
					// Firebug no likee
					if (isFB) {
						try {
							that._dispatchEvent(type);
						} catch (e) {
							fireEvents();
						}
					} else {
						fireEvents();
					}
					
					return that;
				}
				
			},

			stack : [],

			cache : function() {
				var eventCache = {};

				return {
					add : function(element, type, handler, useCapture) {
						// Let's create a cache of events
						var key = element.DOM;
						eventCache[key] = eventCache[key] || [];
						eventCache[key].push(arguments);
					},
					list : function(element) {
						return element ? (eventCache[element.DOM] || null) : eventCache;
					},
					flush : function(element) {
						var that = F.Event.cache,
						    key;

						// Time to flush
						var methods = F.Bind.methods;
						
						if (element && element.DOM) {
							key = element.DOM;
							that.iterate(eventCache[key], key);
							that.nullify(element, methods);
						} else {
							
							for (key in eventCache) {
								that.iterate(eventCache[key], key);
							}

							var all = document._getElementsByTagName("*"),
							    node, i = 0;

							while (node = all[i++]) {
								if (node && node.DOM) {
									that.nullify(node, methods);
								}
							}
						}
					},

					// Loop through each array and remove each event
					iterate : function(array, key) {
						if (array && key) {
							var i, item;
							for (i = array.length - 1; i >= 0; i = i - 1) {
								item = array[i];
								item[0].removeEventListener(item[1], item[2], item[3]);
							}
							eventCache[key] = null;
						}
					},

					// Augmenting DOM nodes can lead to memory leaks
					// Here I'm removing all custom methods from each node
					nullify : function(node, methods) {
						var key;
						
						// Problems with other libraries accessing node properties onunload
						// caused undefined errors. This will merely revert the element
						// back to its unaltered state.
						try {
							for (key in methods) {
								if (!(/^\_/).test(key)) {
									node[key] = node["_" + key] || null;
								}
							}
							
							for (key in methods) {
								if ((/^\_/).test(key)) {
									node[key] = null;
								}
							}
						} catch(e) {}
					}
				};
			}(),

			// Load objects when the DOM loads
			// @author Dean Edwards / Matthias Miller / John Resig / Mark Wubben / Paul Sowden
			fire : function() {
				if (arguments.callee.done) {
					return;
				}
				arguments.callee.done = true;
				var i = 0,
				    that = this;

				while (i < that.stack.length) {
					that.stack[i]();
					i++;
				}
			},

			init : function() {
				// Needed to support DOMContentLoaded
				var globals = [window, document],
				    onload = globals[0].onload,
				    i = 0, node, nodes, key, fire;

				if (!doc._addEventListener || B.WK) {
					while (i < globals.length) {
						node = globals[i];
						nodes = Flow.Event.nodes;
						for (key in nodes) {
							// ARCHIVED NATIVE METHODS
							if (node[key]) {
								node["_" + key] = node[key];
							}
							node[key] = nodes[key];
						}
						i++;
					}
				}

				if (Flow.Dom) {
					globals[0].addEventListener("DOMContentLoaded", Flow.Dom.init, false);
				}
			}
		};
	}()
});

(function() {
	var E = Flow.Event;
	E.init();
	// Flush the cache onunload
	window.addEventListener("unload", E.cache.flush, false);
})();


/*
Namespace: The Query Namespace
	Cross-browser implementation of querySelector/querySelectorAll.

About: Version
	1.1.1
	
License:
	- Huge ups to Robert Nyman <http://robertnyman.com> for saving us the undertaking of RegExing to match the selectors API: <http://www.w3.org/TR/selectors-api/>.
	- Flow.Query is a direct port of Robert Nyman's DOMAssistant's selectors engine <http://code.google.com/p/domassistant/>
	- Licensed under The MIT License <http://www.opensource.org/licenses/mit-license.php>
	- All glory upon the Nyman (& team)
	
	- Flow is licensed under a Creative Commons Attribution-Share Alike 3.0 License <http://creativecommons.org/licenses/by-sa/3.0/us/>. You are free to share, modify and remix our code as long as you share alike.

Requires:
	Flow.js.
*/

/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false;

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	var origContext = context = context || document;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, check, mode, extra, prune = true, contextXML = isXML(context);
	
	// Reset the position of the chunker regexp (start from head)
	chunker.lastIndex = 0;
	
	while ( (m = chunker.exec(selector)) !== null ) {
		parts.push( m[1] );
		
		if ( m[2] ) {
			extra = RegExp.rightContext;
			break;
		}
	}

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] )
					selector += parts.shift();

				set = posProcess( selector, set );
			}
		}
	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			var ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			var ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				var cur = parts.pop(), pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		throw "Syntax error, unrecognized expression: " + (cur || selector);
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = false;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set, match;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;
		
		if ( (match = Expr.match[ type ].exec( expr )) ) {
			var left = RegExp.leftContext;

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.match[ type ].exec( expr )) != null ) {
				var filter = Expr.filter[ type ], found, item;
				anyFound = false;

				if ( curLoop == result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr == old ) {
			if ( anyFound == null ) {
				throw "Syntax error, unrecognized expression: " + expr;
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/
	},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag && !isXML ) {
				part = part.toUpperCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string";

			if ( isPartStr && !/\W/.test(part) ) {
				part = isXML ? part : part.toUpperCase();

				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName === part ? parent : false;
					}
				}
			} else {
				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( !part.match(/\W/) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( typeof part === "string" && !part.match(/\W/) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context, isXML){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").indexOf(match) >= 0) ) {
						if ( !inplace )
							result.push( elem );
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			for ( var i = 0; curLoop[i] === false; i++ ){}
			return curLoop[i] && isXML(curLoop[i]) ? match[1] : match[1].toUpperCase();
		},
		CHILD: function(match){
			if ( match[1] == "nth" ) {
				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] == "even" && "2n" || match[2] == "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( match[3].match(chunker).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return /h\d/i.test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toUpperCase() === "BUTTON";
		},
		input: function(elem){
			return /input|select|textarea|button/i.test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 == i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 == i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( i = 0, l = not.length; i < l; i++ ) {
					if ( not[i] === elem ) {
						return false;
					}
				}

				return true;
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while ( (node = node.previousSibling) )  {
						if ( node.nodeType === 1 ) return false;
					}
					if ( type == 'first') return true;
					node = elem;
				case 'last':
					while ( (node = node.nextSibling) )  {
						if ( node.nodeType === 1 ) return false;
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first == 1 && last == 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 
						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;
					if ( first == 0 ) {
						return diff == 0;
					} else {
						return ( diff % first == 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value != check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS;

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + /(?![^\[]*\])(?![^\(]*\))/.source );
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
try {
	Array.prototype.slice.call( document.documentElement.childNodes );

// Provide a fallback method if it does not work
} catch(e){
	makeArray = function(array, results) {
		var ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var i = 0, l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( var i = 0; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( "sourceIndex" in document.documentElement ) {
	sortOrder = function( a, b ) {
		var ret = a.sourceIndex - b.sourceIndex;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( document.createRange ) {
	sortOrder = function( a, b ) {
		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.selectNode(a);
		aRange.collapse(true);
		bRange.selectNode(b);
		bRange.collapse(true);
		var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( !!document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
	root = form = null; // release memory in IE
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}

	div = null; // release memory in IE
})();

if ( document.querySelectorAll ) (function(){
	var oldSizzle = Sizzle, div = document.createElement("div");
	div.innerHTML = "<p class='TEST'></p>";

	// Safari can't handle uppercase or unicode characters when
	// in quirks mode.
	if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
		return;
	}
	
	Sizzle = function(query, context, extra, seed){
		context = context || document;
		
		// Flow compatibility tweak
		// In Flow, every browser gets document.querySelectorAll support
		// So we need to tweak the Sizzle qSA check a bit to bypass this conflict
		var QSA = function() {
			return (document._querySelectorAll) ? "_querySelectorAll" : "querySelectorAll";
		}();

		// Only use querySelectorAll on non-XML documents
		// (ID selectors don't work in non-HTML documents)
		if ( !seed && context.nodeType === 9 && !isXML(context) ) {
			try {
				
				// Flow compatibility tweak
				// Here we replace the standard querySelectoAll call with our QSA check
				return makeArray( context[QSA](query), extra );
				
			} catch(e){}
		}
		
		return oldSizzle(query, context, extra, seed);
	};

	for ( var prop in oldSizzle ) {
		Sizzle[ prop ] = oldSizzle[ prop ];
	}

	div = null; // release memory in IE
})();

if ( document.getElementsByClassName && document.documentElement.getElementsByClassName ) (function(){
	var div = document.createElement("div");
	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	if ( div.getElementsByClassName("e").length === 0 )
		return;

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 )
		return;

	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ){
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ) {
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

var contains = document.compareDocumentPosition ?  function(a, b){
	return a.compareDocumentPosition(b) & 16;
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

var isXML = function(elem){
	return elem.nodeType === 9 && elem.documentElement.nodeName !== "HTML" ||
		!!elem.ownerDocument && elem.ownerDocument.documentElement.nodeName !== "HTML";
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE

window.Sizzle = Sizzle;

})();


new Flow.Plugin({
	name : "Query",
	version : "1.1.1",
	bind : true,
	
	constructor : function() {

		var F = Flow,
		    B = F.Browser,
		    X = F.Bind,
		    U = F.Utils;

		var doc = document,
		    that;

		return {

			/*
			Interface: Element
				These functions are bound to _elements_.
			*/
			nodes : {

				/*
				Property: querySelectorAll
					Match elements by CSS query

				Shorthand:
					queryAll

				Parameters:
					query - the query to match.

				Example:
					>var foo = document.querySelectorAll("div ul.foo"); // Matches all ul's with a class of "foo"
					>foo = document.queryAll("div ul.foo li"); // Shortcut. Returns all "li"s in foo.
				*/
				querySelectorAll : function() {
					
					return function(query, single) {
						
						// Sizzle!
						var siz = window.Sizzle(query, this);
						return single ? siz[0] : siz;
						
					};
				}(),

				/*
				Property: querySelector
					Match a single element by CSS query

				Shorthand:
					query

				Parameters:
					query - the query to match.

				Example:
					>var foo = document.querySelector("div ul.foo"); // Returns the first ul.foo.
					>foo = document.query("div ul.foo li"); // Shortcut. Returns the first "li" in foo.
				*/
				querySelector : function() {

					if (doc.querySelector) {
						return function(query) {
							return X.extend(this._querySelector(query));
						};
					}

					return function(query) {
						return this.querySelectorAll(query, true);
					};
				}()

			}
		};
	}()
});
