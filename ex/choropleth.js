//From: http://www.hunlock.com/blogs/Totally_Pwn_CSS_with_Javascript#quickIDX1
function getCSSRule(ruleName, deleteFlag) {               // Return requested style obejct
   if (document.styleSheets) {                            // If browser can play with stylesheets
      for (var i=0; i<document.styleSheets.length; i++) { // For each stylesheet
         var styleSheet=document.styleSheets[i];          // Get the current Stylesheet
         var ii=0;                                        // Initialize subCounter.
         var cssRule=false;                               // Initialize cssRule. 
         do {                                             // For each rule in stylesheet
            if (styleSheet.cssRules) {                    // Browser uses cssRules?
               cssRule = styleSheet.cssRules[ii];         // Yes --Mozilla Style
            } else {                                      // Browser usses rules?
               cssRule = styleSheet.rules[ii];            // Yes IE style. 
            }                                             // End IE check.
            if (cssRule)  {                               // If we found a rule...
               if (cssRule.selectorText==ruleName) {      //  match ruleName?
                  if (deleteFlag=='delete') {             // Yes.  Are we deleteing?
                     if (styleSheet.cssRules) {           // Yes, deleting...
                        styleSheet.deleteRule(ii);        // Delete rule, Moz Style
                     } else {                             // Still deleting.
                        styleSheet.removeRule(ii);        // Delete rule IE style.
                     }                                    // End IE check.
                     return true;                         // return true, class deleted.
                  } else {                                // found and not deleting.
                     return cssRule;                      // return the style object.
                  }                                       // End delete Check
               }                                          // End found rule name
            }                                             // end found cssRule
            ii++;                                         // Increment sub-counter
         } while (cssRule)                                // end While loop
      }                                                   // end For loop
   }                                                      // end styleSheet ability check
   return false;                                          // we found NOTHING!
}                                                         // end getCSSRule 

Raphael.st.addClass = function(addClass, parentSelector) {
    //Simple set Attribute class if SVG
    if (Raphael.svg) {
        for (var i = 0; i < this.length; i++) {
            this[i].addClass(addClass)
        };
    }
    //For IE
    else {
        var sel = '.' + addClass;
        sel = parentSelector ? parentSelector + ' ' + sel : sel;
        var attributes = getCSSAttributes(sel);
        for (var i = 0; i < this.length; i++) {
            this[i].attr(attributes);
        }
    }
}

Raphael.el.addClass = function(addClass, parentSelector) {
    //easily add class
    if (Raphael.svg) {
        var cssClass = this.node.getAttribute('class') !== null ? this.node.getAttribute('class') + ' ' + addClass : addClass;
        this.node.setAttribute('class', cssClass);
    }
    //must extract CSS requirements
    else {
        var sel = '.' + addClass;
        sel = parentSelector ? parentSelector + ' ' + sel : sel;

        var attributes = getCSSAttributes(sel);
        this.attr(attributes);
    }
}

function getCSSAttributes(selector) {
    var rules = getCSSRule(selector),
    attributes = {};
    if (!rules) return false;
    rules = rules.style.cssText.split(';');
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i].split(':');
        if (rule[0] !== undefined && rule[1] !== undefined)
            var key = rule[0].replace(' ',''),
                value = rule[1].replace(' ','');
            attributes[key] = value;
    }
    return attributes;
}



var data; // loaded asynchronously
var path = d3.geo.path();

// var svg = d3.select("#chart")
//   .append("svg:svg");

var type = Raphael.svg ? "svg" : "xml";
var paper;

var svg = d3.select("#chart")
    .selectAll(type)
    .data([1]) //how can I insert/append it otherwise?
    .enter().select(function(data ,i) {
        paper = Raphael(this, 960, 500);
        return paper.canvas;
});


// var counties = svg.append("svg:g")
//     .attr("id", "counties")
//     .attr("class", "Blues");

var counties = svg.append(Raphael.svg ? 'svg:g' : 'v:group')
	.attr("id", "counties")
    .attr("class", "Blues");

// var states = svg.append("svg:g")
//     .attr("id", "states");

var states = svg.append(Raphael.svg ? 'svg:g' : 'v:group')
	.attr("id", "states");
		
// d3.json("../data/us-counties.json", function(json) {
//   counties.selectAll("path")
//       .data(json.features)
//     .enter().append("svg:path")
//       .attr("class", data ? quantize : null)
//       .attr("d", path);
// });

d3.json("../data/us-counties.json", function(json) {
	counties.selectAll(Raphael.svg ? 'path' : 'v:path')
    	.data(json.features)
   		.enter().select(function(d, i) {
        	var shape = paper.path(path(d));
           	shape.addClass(random(), '.Blues');
           	return shape.node;
   		});
});

// d3.json("../data/us-states.json", function(json) {
//   states.selectAll("path")
//       .data(json.features)
//     .enter().append("svg:path")
//       .attr("d", path);
// });

d3.json("../data/us-states.json", function(json) {
 	states.selectAll(Raphael.svg ? 'path' : 'v:path')
       	.data(json.features)
        .enter().select(function(d, i) {
        	var shape = paper.path(path(d));
            return shape.node;
    });
});

// d3.json("unemployment.json", function(json) {
//   data = json;
//   counties.selectAll("path")
//       .attr("class", quantize);
// });

// d3.json("unemployment.json", function(json) {
// 	data = json;
//   	svg.selectAll(Raphael.svg ? 'path' : 'v:path')
//     	.attr("class", quantize);
// });

function quantize(d) {
  return "q" + Math.min(8, ~~(data[d.id] * 9 / 12)) + "-9";
}

function random(){
    return "q" + Math.floor((Math.random() * 100 % 12)) + "-9";
}
