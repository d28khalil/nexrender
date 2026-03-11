function stringify(obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        if (t == "string") obj = '"' + obj.replace(/"/g, '\\"') + '"';
        return String(obj);
    } else {
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n]; t = typeof (v);
            if (t == "string") v = '"' + v.replace(/"/g, '\\"') + '"';
            else if (t == "object" && v !== null) v = stringify(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
}

function log(msg) {
    try {
        var logFile = new File("C:/Users/David/GitHubProjects/nexrender/scanner_debug.log");
        logFile.open("a");
        logFile.writeln(new Date().toSource() + ": " + msg);
        logFile.close();
    } catch(e) {}
}

function scan() {
    log("--- ATTEMPTING SCAN ---");
    // app.activate(); // Can be annoying if user is doing something else
    var project = app.project;
    
    if (!project) {
        log("WAITING: No project object found.");
        return false;
    }

    log("PROJECT INFO: items=" + project.numItems + (project.file ? ", file=" + project.file.name : ", no file"));

    var projectName = project.file ? project.file.name : "Untitled_Template";
    
    var manifest = {
        projectName: projectName,
        compositions: []
    };

    if (project.numItems === 0) {
        log("WAITING: Project is still empty.");
        return false;
    }

    for (var i = 1; i <= project.numItems; i++) {
        var item = project.item(i);
        if (item instanceof CompItem) {
            var comp = { name: item.name, layers: [] };
            for (var j = 1; j <= item.numLayers; j++) {
                var layer = item.layer(j);
                var layerData = { name: layer.name, type: "other", index: j };
                if (layer instanceof TextLayer) {
                    layerData.type = "text";
                    layerData.value = layer.text.sourceText.value.toString();
                } else if (layer instanceof AVLayer && layer.source instanceof FootageItem) {
                    layerData.type = "footage";
                    layerData.sourceFile = layer.source.file ? layer.source.file.name : "none";
                }
                comp.layers.push(layerData);
            }
            manifest.compositions.push(comp);
        }
    }

    if (manifest.compositions.length === 0) {
        log("WAITING: No compositions found yet.");
        return false;
    }

    var file = new File("C:/Users/David/GitHubProjects/nexrender/template_manifest.json");
    file.open("w");
    file.write(stringify(manifest));
    file.close();
    log("SCAN COMPLETE SUCCESS");
    return true;
}

// Lazy Man's Retry Loop
var success = false;
for (var i = 0; i < 15; i++) {
    if (scan()) {
        success = true;
        break;
    }
    log("RETRYING IN 3 SECONDS... (Attempt " + (i+1) + "/15)");
    $.sleep(3000); 
}

if (!success) {
    log("FATAL: Scan failed after 15 attempts.");
    // alert("Project took too long to load or has no compositions.");
} else {
    log("ALREADY DONE.");
    // alert("Scan Complete! Manifest created.");
}
