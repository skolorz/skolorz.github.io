var template =`
    <div>
        <hr style="width: 100%"/>
        <div id="ctrl">
            <form id="template" >
                <div class="form-container">
                    <p>
                    <h2></h2>
                    <div class="opacity">
                        <label>nieprzezroczystość</label>
                        </br>
                        <input type="range" min="0" max="10" value="0" class="slider"/>
                    </div>
                    <div class="weight">
                        <label>waga</label>
                        </br>
                        <input type="range" min="1" max="10" value="0" class="slider"/>
                    </div>
                    <div class="color">
                        <label>kolor</label>
                        </br>
                        <input type="text" />
                    </div>
                    </p>
                </div>
            </form>
        </div>
    </div>`;

$("#map-container").append(template);

layersPromise.then(function () {
    function attachCtrls(id){
        var form, opacity, opacityLbl,weight, weightLbl, 
            layer = layers[id],
            style = styles[id];

        form = $("#template").clone(true, true);
        form.attr("id", id);
        form.appendTo("#ctrl");
        form = $("#"+id);
        form.attr("display", "block");
        form.find("h2")[0].innerText = id;

        opacity = form.find("div.opacity input");
        opacity.attr("id", id + "-opacity");
        opacityLbl = form.find("div.opacity label")[0];
        opacity.val(style.opacity * 10);
        opacityLbl.innerText = "nieprzezroczystość: " + style.opacity;
        opacity.on("input", e => { 
            style.opacity = opacity.val()/10; 
            layer.setStyle(style);
            opacityLbl.innerText = "nieprzezroczystość: " + style.opacity;
        });

        weight = form.find("div.weight input");
        weightLbl = form.find("div.weight label")[0];
        weight.val(style.weight * 2);
        weightLbl.innerText = "waga: " + style.weight;
        weight.on("input", e => { 
            style.weight = weight.val() / 2; 
            layer.setStyle(style);
            weightLbl.innerText = "waga: " + style.weight;
        });


        color = form.find("div.color input");
        color.val(style.color);
        color.on("input", e => { 
            style.color = color.val(); 
            layer.setStyle(style);
        });
    }

    attachCtrls("polska");
    attachCtrls("wojewodztwa");
    attachCtrls("powiaty");
    attachCtrls("razem");
    $("#template").hide();
});


