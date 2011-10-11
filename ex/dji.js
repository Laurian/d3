var w = 960,
    pw = 14,
    z = ~~((w - pw * 2) / 53),
    ph = z >> 1,//padding height
    h = z * 7,
    type = Raphael.svg ? "svg" : "xml";

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

Raphael.st.addClass = function(selector) {
    //Simple set Attribute class if SVG
    if (Raphael.svg) {
        for (var i = 0; i < this.length; i++) {
            this[i].addClass(selector)
        };
    }
    //For IE
    else {
        var attributes = getCSSAttributes('.' + selector);
        for (var i = 0; i < this.length; i++) {
            this[i].attr(attributes);
        }
    }
}

Raphael.el.addClass = function(selector) {
    //easily add class
    if (Raphael.svg) {
        var cssClass = this.node.getAttribute('class') !== null ? this.node.getAttribute('class') + ' ' + selector : selector;
        this.node.setAttribute('class', cssClass);
    }
    //must extract CSS requirements
    else {
        var attributes = getCSSAttributes('.' + selector);
        this.attr(attributes);
    }
}

function getCSSAttributes(selector) {
    var rules = getCSSRule(selector).style.cssText.split(';'),
    attributes = {};
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i].split(':');
        if (rule[0] !== undefined && rule[1] !== undefined)
            attributes[rule[0].replace(' ','')] = rule[1].replace(' ','');
    }
    return attributes;
}
      

var papers = [],
boxes = []
paper_i = -1;
vis = d3.select("#chart")
    .selectAll("div")
    .data(d3.range(1990, 1992))
    .enter().append("div")
        .each(generate);

    function generate(data, i) {
        var paper;

        //initial create
        paper = Raphael(this, w, h + ph *2);
        papers.push(paper);//accessible array for later

        //year text
        paper.text(6, (h/2+ph), data)
            .attr('text-anchor', 'middle')
            .rotate(-90);
        return true;
    }

//Days Rectangles
vis.selectAll(Raphael.svg ? 'rect' : 'v:rect')
    .data(calendar.dates, function(data, i) {
        //setup for each year: Raphael sets
        if (i === 0) {
            paper_i++;
            boxes.push(papers[paper_i].set());
            if(paper_i > 0) boxes[paper_i-1].addClass('day');
        }
        
        boxes[paper_i].push( 
            papers[paper_i].rect(data.week * z + pw, data.day * z, z, z)
        );
});//end data, last one
boxes[paper_i].addClass('day');
paper_i = -1;


//Months Path
var months = [];
vis.selectAll(Raphael.svg ? 'path' : 'v:path')
    .data(calendar.months, function(d, i) {
        //set paper & add month class to sets
        if (i === 0) {
            paper_i++;
            months.push(papers[paper_i].set());
            if(paper_i > 0) months[paper_i].addClass('month');
        }

        //draw month path
        papers[paper_i].path(
            "M" + (d.firstWeek + 1) * z + "," + d.firstDay * z
            + "H" + d.firstWeek * z
            + "V" + 7 * z
            + "H" + d.lastWeek * z
            + "V" + (d.lastDay + 1) * z
            + "H" + (d.lastWeek + 1) * z
            + "V" + 0
            + "H" + (d.firstWeek + 1) * z
            + "Z"
        ).translate(pw,0);
});//end data, last month set
months[paper_i].addClass('month');
paper_i = -1;

//Final Safari forced-rendering
for (var i = 0; i < papers.length; i++) {
    papers[i].safari();
}

/*
initial svg
  .enter().append("svg:svg")
    .attr("width", w)
    .attr("height", h + ph * 2)
    .attr("class", "RdYlGn")
  .append("svg:g")
    .attr("transform", "translate(" + pw + "," + ph + ")");
    */

/*
year text
vis.append("svg:text")
    .attr("transform", "translate(-6," + h / 2 + ")rotate(-90)")
    .attr("text-anchor", "middle")
    .text(function(d) { return d; });

day boxes
vis.selectAll("rect.day")
    .data(calendar.dates)
  .enter().append("svg:rect")
    .attr("x", function(d) { return d.week * z; })
    .attr("y", function(d) { return d.day * z; })
    .attr("class", "day")
    .attr("width", z)
    .attr("height", z);

month box
vis.selectAll("path.month")
    .data(calendar.months)
  .enter().append("svg:path")
    .attr("class", "month")
    .attr("d", function(d) {
      return "M" + (d.firstWeek + 1) * z + "," + d.firstDay * z
          + "H" + d.firstWeek * z
          + "V" + 7 * z
          + "H" + d.lastWeek * z
          + "V" + (d.lastDay + 1) * z
          + "H" + (d.lastWeek + 1) * z
          + "V" + 0
          + "H" + (d.firstWeek + 1) * z
          + "Z";
    });
*/

d3.csv("dji.csv", function(csv) {
  var data = d3.nest()
      .key(function(d) { return d.Date; })
      .rollup(function(d) { return (d[0].Close - d[0].Open) / d[0].Open; })
      .map(csv);

  var color = d3.scale.quantize()
      .domain([-.05, .05])
      .range(d3.range(9));

  vis.selectAll("rect.day")
      .attr("class", function(d) { return "day q" + color(data[d.Date]) + "-9"; })
    .append("svg:title")
      .text(function(d) { return d.Date + ": " + (data[d.Date] * 100).toFixed(1) + "%"; });
});
