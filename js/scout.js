function loadMap() {
	var map, csv;

	      require([
	        "esri/map",
	        "esri/layers/CSVLayer",
	        "esri/Color",
	        "esri/symbols/SimpleMarkerSymbol",
	        "esri/renderers/SimpleRenderer",
	        "esri/InfoTemplate",
	        "esri/urlUtils",
	        "dojo/domReady!"
	      ], function(
	        Map, CSVLayer, Color, SimpleMarkerSymbol, SimpleRenderer, InfoTemplate, urlUtils
	      ) {
	        urlUtils.addProxyRule({
	          proxyUrl: "/proxy/",
	          urlPrefix: "earthquake.usgs.gov"
	        });
	        map = new Map("mapDiv", {
	          basemap: "gray",
	          center: [ -60, -10 ],
	          zoom: 4
	        });
	        csv = new CSVLayer("http://earthquake.usgs.gov/2.5_week.csv", {
	          copyright: "USGS.gov"
	        });
	        var orangeRed = new Color([238, 69, 0, 0.5]); // hex is #ff4500
	        var marker = new SimpleMarkerSymbol("solid", 15, null, orangeRed);
	        var renderer = new SimpleRenderer(marker);
	        csv.setRenderer(renderer);
	        var template = new InfoTemplate("${type}","hello!!!! ${place}");
	        csv.setInfoTemplate(template);
	        map.addLayer(csv);
	      });
}

function scout(){

	ref.authWithOAuthPopup("facebook", function(error, authData) {
  		if (error) {
   			console.log("Merchant ID not recognized", error);
            alert("Merchant ID not recognized. Re-enter the merchant ID")
  		} else {
  			console.log("Merchant exists", authData.facebook.cachedUserProfile.first_name);
  		}
	}, {
  		remember: "sessionOnly"
	});
}
