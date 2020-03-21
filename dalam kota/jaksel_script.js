////////////////////////////////////////////////////////////
//////////////////////// Set-Up ////////////////////////////
////////////////////////////////////////////////////////////

var margin = {left:50, top:50, right:50, bottom:50},
	width = Math.min(window.innerWidth, 700) - margin.left - margin.right,
    height = Math.min(window.innerWidth, 700) - margin.top - margin.bottom,
    innerRadius = Math.min(width, height) * .3,
    outerRadius = innerRadius * 1.1;

var Names = ['Cilandak', 'Jagakarsa', 'Kebayoran Baru', 'Kebayoran Lama', 'Mampang Prapatan', 'Pancoran', 'Pasar Minggu', 'Pesanggrahan', 'Setia Budi', 'Tebet'],
	colors = ["#C71E1D","#FF5733","#FF8D1A","#FFC300","#ADD45C","#57C785","#00BAAD","#2A7B9B","#511849","#900C3F"],
	opacityDefault = 0.8;

var matrix = [[235, 35, 24, 23, 15, 13, 57, 11, 3, 7],
 [38, 1129, 19, 10, 29, 63, 146, 1, 23, 26],
 [31, 18, 570, 78, 109, 41, 41, 79, 27, 44],
 [31, 10, 91, 595, 8, 6, 12, 87, 18, 18],
 [17, 24, 120, 14, 817, 69, 51, 3, 44, 35],
 [8, 51, 32, 11, 73, 563, 170, 1, 33, 114],
 [61, 168, 39, 12, 59, 163, 1346, 6, 39, 62],
 [10, 2, 55, 104, 9, 6, 1, 562, 32, 5],
 [5, 27, 31, 11, 37, 27, 42, 30, 1428, 346],
 [12, 22, 55, 14, 51, 129, 53, 2, 314, 3243]]

////////////////////////////////////////////////////////////
/////////// Create scale and layout functions //////////////
////////////////////////////////////////////////////////////

var colors = d3.scale.ordinal()
    .domain(d3.range(Names.length))
	.range(colors);

var chord = customChordLayout()
    .padding(.05)
    .sortChords(d3.descending)
	.matrix(matrix);
		
var arc = d3.svg.arc()
    .innerRadius(innerRadius*1.01)
    .outerRadius(outerRadius);

var path = d3.svg.chord()
	.radius(innerRadius);
	
////////////////////////////////////////////////////////////
////////////////////// Create SVG //////////////////////////
////////////////////////////////////////////////////////////
	
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
	.append("g")
    .attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")");

////////////////////////////////////////////////////////////
/////////////// Create the gradient fills //////////////////
////////////////////////////////////////////////////////////

//Function to create the unique id for each chord gradient
function getGradID(d){ return "linkGrad-" + d.source.index + "-" + d.target.index; }

//Create the gradients definitions for each chord
var grads = svg.append("defs").selectAll("linearGradient")
	.data(chord.chords())
   .enter().append("linearGradient")
    //Create the unique ID for this specific source-target pairing
	.attr("id", getGradID)
	.attr("gradientUnits", "userSpaceOnUse")
	//Find the location where the source chord starts
	.attr("x1", function(d,i) { return innerRadius * Math.cos((d.source.endAngle-d.source.startAngle)/2 + d.source.startAngle - Math.PI/2); })
	.attr("y1", function(d,i) { return innerRadius * Math.sin((d.source.endAngle-d.source.startAngle)/2 + d.source.startAngle - Math.PI/2); })
	//Find the location where the target chord starts 
	.attr("x2", function(d,i) { return innerRadius * Math.cos((d.target.endAngle-d.target.startAngle)/2 + d.target.startAngle - Math.PI/2); })
	.attr("y2", function(d,i) { return innerRadius * Math.sin((d.target.endAngle-d.target.startAngle)/2 + d.target.startAngle - Math.PI/2); })

//Set the starting color (at 0%)
grads.append("stop")
	.attr("offset", "0%")
	.attr("stop-color", function(d){ return colors(d.source.index); });

//Set the ending color (at 100%)
grads.append("stop")
	.attr("offset", "100%")
	.attr("stop-color", function(d){ return colors(d.target.index); });
		
////////////////////////////////////////////////////////////
////////////////// Draw outer Arcs /////////////////////////
////////////////////////////////////////////////////////////

var outerArcs = svg.selectAll("g.group")
	.data(chord.groups)
	.enter().append("g")
	.attr("class", "group")
	.on("mouseover", fade(.1))
	.on("mouseout", fade(opacityDefault));

outerArcs.append("path")
	.style("fill", function(d) { return colors(d.index); })
	.attr("d", arc);
	
////////////////////////////////////////////////////////////
////////////////////// Append Names ////////////////////////
////////////////////////////////////////////////////////////

//Append the label names on the outside
outerArcs.append("text")
  .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
  .attr("dy", ".35em")
  .attr("class", "titles")
  .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
  .attr("transform", function(d) {
		return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
		+ "translate(" + (outerRadius + 10) + ")"
		+ (d.angle > Math.PI ? "rotate(180)" : "");
  })
  .text(function(d,i) { return Names[i]; });
	
////////////////////////////////////////////////////////////
////////////////// Draw inner chords ///////////////////////
////////////////////////////////////////////////////////////
  
svg.selectAll("path.chord")
	.data(chord.chords)
	.enter().append("path")
	.attr("class", "chord")
	.style("fill", function(d){ return "url(#" + getGradID(d) + ")"; })
	.style("opacity", opacityDefault)
	.attr("d", path);

////////////////////////////////////////////////////////////
////////////////// Extra Functions /////////////////////////
////////////////////////////////////////////////////////////

//Returns an event handler for fading a given chord group.
function fade(opacity) {
  return function(d,i) {
    svg.selectAll("path.chord")
        .filter(function(d) { return d.source.index != i && d.target.index != i; })
		.transition()
        .style("opacity", opacity);
  };
}//fade