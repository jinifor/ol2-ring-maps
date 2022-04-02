/**
 * CreateRingMap for OpenLayers2 (Based on 2.13.1)
 * reference document
 *     - http://www.onspatial.com/2014/01/qgis-create-ring-maps-using-pyqgis.html
 *     - http://www.esri.com/esri-news/arcuser/fall-2013/looking-at-temporal-changes
 *
 * reference library
 *     - OpenLayers (http://www.openlayers.org) : 2-clause BSD License
 *     - geostats (https://github.com/simogeo/geostats) : MIT license
 */


/**
 * Class: OpenLayers.Layer.CreateRingMap
 *
 * Example:
 * The following example shows how to add many of the common layer
 * to a map.
 *
 * > var map = new OpenLayers.Map('map', { ... });
 * >
 * > var sourceLayer = new OpenLayers.Vector.Layer('layer name', ... );
 * >
 * > var ringLayer = new OpenLayers.Layer.CreateRingMap(
 * > 	'RingMap Layer', //layer name {String}
 * > 	sourceLayer, //reference vector layer {OpenLayers.Layer.Vector}
 * > 	fieldNames,  //sourceLayer numeric fields {Array}
 * > 	{
 * > 		labelDisplay: false, //common label (default false) {Boolean}
 * > 		labelField: 'sgg_nm', //label field {String}
 * > 		valueDisplay: false, //display cell value (default false) {Boolean}
 * > 		anchorDisplay: true,  //display anchor (default false) {Boolean}
 * > 		colors: ['#8ec1dd', '#5aa2cf', '#3181bd'] //classify colors {Array}
 * > 	}
 * > );
 * > map.addLayer(ringLayer);
 *
 */
OpenLayers.Layer.CreateRingMap = OpenLayers.Class(OpenLayers.Layer.Vector, {

	/**
	 * Property: options
	 * {Object}
	 */
	options: null,

	/**
	 * Property: sourceLayer
	 * {<OpenLayers.Feature.Vector>}
	 */
	sourceLayer: null,

	/**
	 * Property: originCenter
	 * {<OpenLayers.LonLat>}
	 */
	originCenter: null,

	/**
	 * Property: radius
	 * {Float}
	 */
	radius: 0.0,

	/**
	 * Property: cells
	 * {Integer}
	 */
	cells: 0,

	/**
	 * Property: stepAngle
	 * {Float}
	 */
	stepAngle: 0.0,

	/**
	 * Property: buffer
	 * {Float}
	 */
	buffer: 1.0,

	/**
	 * Property: buffer
	 * {Float}
	 */
	bufferPlus: 0.2,

	/**
	 * Property: sides
	 * {Integer}
	 */
	sides: 12,

	/**
	 * Property: fid
	 * {Integer}
	 */
	fid: 0,


	/**
	 * Property: fieldNames
	 * {Array(String)}
	 *
	 * example
	 *    ['a3_2000','a3_2001','a3_2002','a3_2003','a3_2004','a3_2004']
	 *    ['pop2007', 'pop2008', 'pop2010']
	 */
	fieldNames: [],

	/**
	 * Property: labelDisplay
	 * {boolean}
	 */
	labelDisplay: false,

	/**
	 * Property: labelField
	 * {String}
	 */
	labelField: null,

	/**
	 * Property: valueDisplay
	 * {boolean}
	 */
	valueDisplay: false,

	/**
	 * Property: anchorDisplay
	 * {boolean}
	 */
	anchorDisplay: false,

	/**
	 * Property: defaultColors
	 * example:
	 *		['#dbe9f6', '#bed7ec', '#8ec1dd', '#5aa2cf', '#3181bd', '#105ca4', '#08306b']
	 * 		['#ffffcc', '#ccff99', '#66cc66', '#339966', '#006633']
	 *      ['#fef9cc', '#fdf399', '#fded66', '#fce733', '#fce200']
	 * {Array(String)}
	 */
	colors: null,

	/**
	 * Property: ringValues
	 * {Array(Integer)}
	 */
	ringValues: [],

	/**
	 * Property: classify
	 * {Array(String)}
	 */
	classify: [],


	/**
	 * Method: drawCellFeatures:
	 *
	 * Parameters:
	 *   name - {String}
	 *   options - {Object}
	 */
	initialize: function( name, sourceLayer, fieldNames, options ) {
		OpenLayers.Layer.Vector.prototype.initialize.apply(this, [name, options]);

		//backup original options
		this.options = OpenLayers.Util.extend({}, options);

		//override default options
		OpenLayers.Util.extend(this, options);
		this.sourceLayer = sourceLayer;
		this.fieldNames = fieldNames;

		//setting source data options
		this.setSourceOptions(this.sourceLayer);

		//default style color
		if (this.colors == null) {
			this.colors = ['#fef9cc', '#fdf399', '#fded66', '#fce733', '#fce200'];
		}

		//drawing cells
		var fieldLength = this.fieldNames.length;
		for(var i=0; i<fieldLength; i++) {
			for(var j=0; j<this.cells; j++) {
				this.drawCellFeatures( i, j, (this.stepAngle*j), false);
			}
			this.buffer += this.bufferPlus;
		}

		//setting cell style
		this.setStyleMap(this.ringValues, 'ring_value', this.colors, this.labelDisplay);

		//display label
		if (this.labelDisplay) {
			for(var j=0; j<this.cells; j++) {
				this.drawCellFeatures( fieldLength-1, j, (this.stepAngle*j), true);
			}
			this.buffer += this.bufferPlus;
		}

		//display anchor
		if (this.anchorDisplay) {
			this.drawAnchor(this.sourceLayer, 'fid_orgin');
		}

		//zoom to data extent
		map.zoomToExtent(this.getDataExtent());
	},

	/**
	 * Method: setSourceOptions
	 *
	 * Parameters:
	 *   layer - {<OpenLayers.Layer.Vector>}
	 */
	setSourceOptions: function(layer) {
		var minx = layer.getDataExtent().left;
		var miny = layer.getDataExtent().bottom;
		var maxx = layer.getDataExtent().right;
		var maxy = layer.getDataExtent().top;
		var x = (maxx + minx) / 2;
		var y = (maxy + miny) / 2;

		this.originCenter = new OpenLayers.LonLat(x, y);
		this.radius = Math.pow((Math.pow((maxx - minx), 2) + Math.pow((maxy - miny), 2)), 0.5) / 2.0;

		this.cells = layer.features.length;
		this.stepAngle = 360.0 / this.cells;
	},

	/**
	 * Method: drawCellFeatures:
	 *
	 * Parameters:
	 *   fieldCount - {Integer}
	 *   cellCount - {Integer}
	 *   rotation - {Float}
	 *   labelDisplay - {Boolean}
	 */
	drawCellFeatures: function(fieldCount, cellCount, rotation, labelDisplay) {
		var angle = Math.PI * ((1/this.cells) - (1/2));
		if(rotation) {
			angle += ( (rotation/180) * Math.PI );
		}

		var rotatedAngle, x, y;
		var points = [];

		//interior points
		for(var j=1; j<=this.sides; j++) {
			rotatedAngle = angle + (j * 2 * Math.PI / this.sides) / this.cells;
			x = this.originCenter.lon + (this.radius * Math.cos(rotatedAngle)) * this.buffer;
			y = this.originCenter.lat + (this.radius * Math.sin(rotatedAngle)) * this.buffer;
			points.push(new OpenLayers.Geometry.Point(x, y));
		}

		//outer points
		for(var k=this.sides; k>0; k--) {
			rotatedAngle = angle + (k * 2 * Math.PI / this.sides) / this.cells;
			x = this.originCenter.lon + (this.radius * Math.cos(rotatedAngle)) * (this.buffer + this.bufferPlus);
			y = this.originCenter.lat + (this.radius * Math.sin(rotatedAngle)) * (this.buffer + this.bufferPlus);
			points.push(new OpenLayers.Geometry.Point(x, y));
		}

		//add cell feature
		var ring = new OpenLayers.Geometry.LinearRing(points);

		if (!labelDisplay) {
			this.addFeatures([
				new OpenLayers.Feature.Vector(
					new OpenLayers.Geometry.Polygon([ring]),
					this.setAttr(fieldCount, cellCount)
				)
			]);
		} else {
			var attr = this.sourceLayer.features[cellCount].attributes;
			var labelValue = eval('attr.'+ this.labelField );

			if (labelValue != undefined) {
				this.addFeatures([
					new OpenLayers.Feature.Vector(
						new OpenLayers.Geometry.Polygon([ring]),
						{'ring_value': 'LABEL_CELL', 'label_field': labelValue}
					)
				]);
			}
		}
	},

	/**
	 * Method: setAttr
	 *
	 * Parameters:
	 *   fieldCount - {Integer}
	 *   cellCount - {Integer}
	 */
	setAttr: function(fieldCount, cellCount) {
		var obj = this.sourceLayer.features[cellCount].clone();
		var attr = obj.attributes;

		if (fieldCount==0) {
			attr.fid_orgin = this.sourceLayer.features[cellCount].fid;
		}

		attr.fid = this.fid += 1;
		attr.ring_num = cellCount;

		var temp_fcnt = this.fieldNames[fieldCount];
		attr.ring_value = eval('attr.' + temp_fcnt) == undefined ? 0.0 : eval('attr.' + temp_fcnt);
		this.ringValues.push( eval(attr.ring_value) );

		return attr;
	},


	/**
	 * Method: setStyleMap
	 *
	 * Parameters:
	 * 	 ringValues - {Array(Float)}
	 *	 property - {Integer}
	 *	 colors - {Integer}
	 *   labelDisplay - {Boolean}
	 */
	setStyleMap: function(ringValues, property, colors, labelDisplay) {
		var geostatsObj = new geostats(ringValues);
		this.classify = geostatsObj.getEqInterval(colors.length);

		var style = new OpenLayers.Style();

		if (this.classify.length > 0) {
			var len = this.classify.length-1;
			for (var i=0; i<len; i++) {
				//add style rule
				style.addRules([
					new OpenLayers.Rule({
						filter: new OpenLayers.Filter.Comparison({
							type: OpenLayers.Filter.Comparison.BETWEEN,
							property: property,
							lowerBoundary: this.classify[i], upperBoundary: this.classify[i+1]
						}),
						symbolizer: {
							fillColor: this.colors[i], fillOpacity: 1, strokeColor: '#fff'
						}
					})
				]);

				//display cell value
				if (this.valueDisplay) {
					style.rules[i].symbolizer.label = '${ring_value}';
				}
			}

			if (labelDisplay) {
				style.addRules([
					new OpenLayers.Rule({
						filter: new OpenLayers.Filter.Comparison({
							type: OpenLayers.Filter.Comparison.EQUAL_TO,
							property: 'ring_value',
							value: 'LABEL_CELL'
						}),
						symbolizer: {
							fillOpacity: 0, strokeOpacity: 0,
							label: '${label_field}'
						}
					})
				]);
			}

			//setting empty value or other value rule
			style.addRules([
				new OpenLayers.Rule({
					elseFilter: true,
					symbolizer: {
						fillColor: 'green', fillOpacity: 1.5, pointRadius: 3,
						strokeColor: 'yellow', strokeOpacity: 1.5, strokeWidth: 2
					}
				})
			]);

			//add style default
			this.styleMap.styles.default = style;
		}
	},


	/**
	 * Method: drawAnchor
	 *
	 * Parameters:
	 *   layer - {<OpenLayers.Layer.Vector>}
	 *	 property - {Integer}
	 */
	drawAnchor: function(layer, property) {
		for (var i=0; i<layer.features.length; i++) {
			for (var j=0; j<this.features.length; j++) {
				if (layer.features[i].fid == eval('this.features[j].attributes.'+property)) {
					//add anchor line
					this.addFeatures([
						new OpenLayers.Feature.Vector(
							new OpenLayers.Geometry.LineString([
								layer.features[i].geometry.getCentroid(),
								this.features[j].geometry.getCentroid()
							])
						)
					])

					//add sorceLayer location
					this.addFeatures([
						new OpenLayers.Feature.Vector(
							new OpenLayers.Geometry.MultiPoint(
								layer.features[i].geometry.getCentroid()
							)
						)
					])
					break;
				}
			}
		}
	},

	CLASS_NAME: "OpenLayers.Layer.CreateRingMap"
});
