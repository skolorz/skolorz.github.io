var styles = {}; 
    styles["polska"] = {
    "color": "#777777",
    "weight": 3,
    "opacity": 1,
    "fillOpacity": 0
    },
    styles["wojewodztwa"] = {
    "color": "#999999",
    "weight": 2,
    "opacity": 0.8,
    "fillOpacity": 0
    },
    styles["powiaty"] = {
    "color": "#999999",
    "weight": 1,
    "opacity": 0.6,
    "fillOpacity": 0
    },
    styles["razem"] = {
    "color": "#500030",
    "weight": 2,
    "opacity": 0.5,
    "fillOpacity": 0
    },
    styles["razemKola"] = {
    "color": "#500030",
    "weight": 1,
    "opacity": 0.8,
    "fillOpacity": 0
    },
    razemHoverStyle = {};
    Object.assign(razemHoverStyle, styles["razem"]);
    razemHoverStyle.fillOpacity = 0.5;
    razemHoverSoftStyle = {};
    Object.assign(razemHoverSoftStyle, styles["razem"]);
    razemHoverSoftStyle.fillOpacity = 0.2;

    var daneAdresowe,
        selected,
        selectedParent,
        layers = {},
        map = L.map('map', {
        center: [52.093, 19.577],
        minZoom: 6,
        maxZoom: 6,
        zoom: 6,
        dragging: false,
        touchZoom: false,
        zoomControl: false
    });

    function resetHighlight(config) {
        return function (e) {
            layers[config.layer].resetStyle(e.target);
        }
    }
    function showOkreg($okreg, dane, feature) {
        var elem;

        $okreg.find("#nazwa").text(dane.name);
        if (dane.adres){
            $okreg.find("#adres").html(dane.adres.replace(/(?:\r\n|\r|\n)+/g, "<br />"));
        }

        if (dane.miasto){
            $okreg.find("#miasto").html(dane.miasto);
        }

        if (dane.mailto){
            elem = document.createElement("a");
            elem.href = "mailto:" + dane.mailto;
            elem.text = dane.mailto;
            $okreg.find("#mailto").append(elem);
        }

        if (dane.fb){
            elem = document.createElement("a");
            elem.href = dane.fb;
            elem.text = "fb";
            $okreg.find("#linki").append(elem);
        }
        if (dane.twitter){
            elem = document.createElement("a");
            elem.href = "https://twitter.com/" + dane.twitter;
            elem.text = "Twitter";
            $okreg.find("#linki").append(elem);
        }
        if (dane.www){
            elem = document.createElement("a");
            elem.href = dane.www;
            elem.text = "WWW";

            $okreg.find("#linki").append(elem);
        }
        if (dane.kontakt && dane.kontakt.length){
            dane.kontakt.forEach(k => {
                elem = document.createElement("span");
                elem.innerText = k.role +", ";
                $okreg.find("#kontakty").append(elem);

                elem = document.createElement("a");
                elem.href = k.tel;
                elem.text = k.tel;
                $okreg.find("#kontakty").append(elem);
                $okreg.find("#kontakty").append("<br/>");
            } );
        }
        if (feature && feature.properties.powiaty.length){
                $okreg.find("#powiaty").append("<small>powiaty: " + feature.properties.powiaty.join(", ") + "</small>");
        }
    }

	function highlightFeature(e) {
        var target = e.target, dane, $okreg;
        
        $("#okreg").hide();
        selected && layers["razem"].resetStyle(selected);
        selectedParent && layers["razem"].resetStyle(selectedParent);
        if (selected == target) {
            selected = null;
            return;
        }
        selected = target;
        selectedParent = null;

        target.setStyle(razemHoverStyle);
        if (selected.feature.properties["koło"]) {
            layers["razem"].eachLayer(f => {
                if (f.feature.properties.name === selected.feature.properties["okręg"]) {
                    selectedParent = f;
                    f.setStyle(razemHoverSoftStyle);
                }
            });
        }

        $okreg =  $("#okreg");
        $okreg.children().empty();

        dane = daneAdresowe["Okręg " + target.feature.properties.name] || daneAdresowe[target.feature.properties.name];
        if (dane){
            if (dane.sub && dane.sub.length) {
                var subElements = dane.sub
                    .map(s => { 
                        var el = $okreg.clone(true, true); 
                        el.attr("id", s);
                        return {
                            dane: daneAdresowe[s],
                            el: el
                        }
                    });
                subElements .forEach(s => {
                    showOkreg(s.el, s.dane);
                    $okreg.find("#sub").append(s.el)
                    s.el.show();
                });
            };
            showOkreg($okreg, dane, selected.feature);
        } else {
            $okreg.find("#nazwa").text(target.feature.properties.name);
        }
        $okreg.show();
    }

    function onEachFeature(feature, layer) {
        layer.on({
                click: highlightFeature
       });
    }

function addLayer(json, style, onEachFeature) {
      return L.geoJson(json, {
                  style: style,
                  onEachFeature: onEachFeature 
      }).addTo(map);
}

var razemJson = "razem.json", layersPromise;

if (window.location.href.match(/kola=true/)) {
    razemJson = "razem-kola.json"
}

layersPromise = $.when(
        $.getJSON("polska.json"),
        $.getJSON("wojewodztwa.json"),
        $.getJSON("powiaty.json"),
        $.getJSON("razem.json"),
        $.getJSON("razem-kola.json"),
        $.getJSON("dane-adresowe.json"),
    )
    .then(function(polskaJson, wojewodztwaJson, powiatyJson, razemJson, razemKolaJson, daneAdresoweJson) {
        daneAdresowe = daneAdresoweJson[0];
        layers["powiaty"] = addLayer(powiatyJson, styles["powiaty"] );
        layers["wojewodztwa"] = addLayer(wojewodztwaJson, styles["wojewodztwa"] );
        layers["polska"] = addLayer(polskaJson, styles["polska"] );
        layers["razem"] = addLayer(razemJson, styles["razem"], onEachFeature);
        layers["razemKola"] = addLayer(razemKolaJson, styles["razemKola"], onEachFeature);
});
