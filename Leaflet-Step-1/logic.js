// Defining function to develop the URL for geoJson
function buildUrl(){
    return `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson`;
}

// Defining function to choose color optins based on Magnitude
function getColor(d) {
    return d > 5  ? '#f06b6b' :
    d > 4  ? '#f0a76b' :
    d > 3   ? '#f3ba4d' :
    d > 2   ? '#f3db4d' :
    d > 1   ? '#e1f34d' :
               '#b7f34d';
};

function createFeatures(earthquakeData) {

    // Defining a function to run once for each feature in the features array
    // Give each feature a popup describing the place, maginitude and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>Magnitude: "+ feature.properties.mag + "</p><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Creating a GeoJSON layer with the features array on the earthquakeData object
    const earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {
              radius: feature.properties.mag*5,
              color: "black",
              fillColor: getColor(feature.properties.mag),
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
            });
        },
        // Run the onEachFeature function once for each piece of data in the array
        onEachFeature: onEachFeature
    });

    // Sending earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Defining streetmap, greyscale and darkmap layers maps
    const streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v10", // Using Mapbox style: streets-v10
        accessToken: API_KEY
    });

    const greyScale = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10", // Using Mapbox style: light-v10
        accessToken: API_KEY
    });

    const darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/dark-v10", // Using Mapbox style: dark-v10
        accessToken: API_KEY
    });

    // Defiing a baseMaps object to hold base layers
    const baseMaps = {
            "Street Map": streetmap,
            "Dark Map": darkmap,
            "Grey Scale": greyScale
    };

    // Creating overlay object to hold overlay layer
    const overlayMaps = {
            Earthquakes: earthquakes
    };

    // Creating map, giving it the Grey Scale map and earthquakes layers to display on load
    const myMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 5,
            layers: [greyScale, earthquakes]
    });

    // Creating a layer control, Passing in our baseMaps and overlayMaps and Adding the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
    }).addTo(myMap);

    // Creating layer control for legends
    var legend = L.control({position: 'bottomright'});

    // Creating function to make legends depending on colors and maginitude divisions
    legend.onAdd = function (map) {

        // Adding legend for colors using Dom create
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5],
            labels = [];
            
        // loop through earthquake intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            //div.innerHTML = '<h1>hello</h1>'
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
}


// Creating async function to make process data for mapping
(async function(){
    const queryUrl = buildUrl();
    const data = await d3.json(queryUrl);
    // Sending the data.features object to the createFeatures function
    createFeatures(data.features);
})()
