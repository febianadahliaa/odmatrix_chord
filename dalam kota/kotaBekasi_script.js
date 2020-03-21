////////////////////////////////////////////////////////////
//////////////////////// Set-Up ////////////////////////////
////////////////////////////////////////////////////////////

var margin = {left:50, top:50, right:50, bottom:50},
	width = Math.min(window.innerWidth, 700) - margin.left - margin.right,
    height = Math.min(window.innerWidth, 700) - margin.top - margin.bottom,
    innerRadius = Math.min(width, height) * .3,
    outerRadius = innerRadius * 1.1;

var Names = ['Bantar Gebang', 'Bekasi Barat', 'Bekasi Selatan', 'Bekasi Timur',
       'Bekasi Utara', 'Jatiasih', 'Jatisampurna', 'Medan Satria',
       'Mustika Jaya', 'Pondok Gede', 'Pondok Melati', 'Rawa Lumbu'],
	colors = ["#C71E1D","#FF5733","#FF8D1A","#FFC300","#EDDD53","#ADD45C","#57C785","#00BAAD","#2A7B9B","#3D3D6B","#511849","#900C3F"],
	opacityDefault = 0.8;

var matrix = [[187, 0, 4, 1, 2, 18, 1, 0, 23, 1, 0, 8],
 [1, 439, 52, 8, 21, 6, 0, 18, 5, 26, 4, 6],
 [4, 46, 284, 53, 43, 36, 10, 5, 7, 76, 6, 27],
 [2, 12, 49, 283, 62, 15, 0, 5, 18, 1, 1, 16],
 [1, 14, 56, 66, 563, 4, 20, 14, 6, 9, 0, 6],
 [23, 7, 31, 12, 8, 611, 29, 1, 5, 110, 67, 8],
 [1, 1, 11, 0, 16, 26, 253, 1, 1, 7, 31, 2],
 [0, 16, 2, 4, 17, 1, 0, 55, 0, 0, 0, 1],
 [14, 2, 8, 32, 8, 5, 0, 2, 444, 2, 1, 16],
 [3, 25, 58, 1, 9, 99, 2, 1, 7, 623, 27, 3],
 [0, 2, 11, 0, 1, 72, 38, 0, 1, 42, 491, 0],
 [7, 4, 28, 14, 11, 10, 4, 1, 18, 2, 1, 96]]

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