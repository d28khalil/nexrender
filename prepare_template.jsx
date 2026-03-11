function log(msg) {
    try {
        var logFile = new File("C:/Users/David/GitHubProjects/nexrender/scanner_debug.log");
        logFile.open("a");
        logFile.writeln(new Date().toSource() + ": [PREPARE] " + msg);
        logFile.close();
    } catch(e) {}
}

function prepare() {
    log("--- STARTING TEMPLATE PREPARATION ---");
    var project = app.project;
    if (!project) return false;

    // 1. Identify Main Composition
    var mainComp = null;
    for (var i = 1; i <= project.numItems; i++) {
        var item = project.item(i);
        if (item instanceof CompItem && (item.name.toLowerCase().indexOf("final") !== -1 || item.name.toLowerCase().indexOf("main") !== -1)) {
            mainComp = item;
            break;
        }
    }
    
    if (!mainComp) {
        for (var i = 1; i <= project.numItems; i++) {
            if (project.item(i) instanceof CompItem) {
                mainComp = project.item(i);
                break;
            }
        }
    }

    if (!mainComp) {
        log("ERROR: No compositions found to prepare.");
        return false;
    }

    log("MAIN COMP SELECTED: " + mainComp.name);

    // 2. Open Essential Graphics Panel
    // Note: addToEssentialGraphics works on a specific composition
    try {
        mainComp.openInEssentialGraphics();
        $.sleep(2000); 
    } catch(e) {
        log("ERROR Opening EG: " + e.toString());
    }

    // 3. Scan ALL compositions for potential "Essential" properties
    // We add them to the mainComp's Essential Graphics panel
    for (var i = 1; i <= project.numItems; i++) {
        var item = project.item(i);
        if (item instanceof CompItem) {
            log("Processing Comp: " + item.name);
            for (var j = 1; j <= item.numLayers; j++) {
                try {
                    var layer = item.layer(j);
                    
                    if (layer instanceof TextLayer) {
                        var prop = layer.text.sourceText;
                        if (prop.canAddToEssentialGraphics(mainComp)) {
                            var egProp = prop.addToEssentialGraphics(mainComp);
                            egProp.name = item.name + " - " + layer.name;
                            log("Added Text: " + egProp.name);
                        }
                    }
                    
                    if (layer instanceof AVLayer && layer.source instanceof FootageItem) {
                        if (layer.canAddToEssentialGraphics(mainComp)) {
                            var egProp = layer.addToEssentialGraphics(mainComp);
                            egProp.name = item.name + " - " + layer.name;
                            log("Added Media: " + egProp.name);
                        }
                    }
                } catch(e) {
                    // This is expected for layers that can't be added
                }
            }
        }
    }

    log("--- PREPARATION COMPLETE ---");
    return true;
}

if (prepare()) {
    app.project.save();
    
    // Export MOGRT
    try {
        var mogrtFile = new File(app.project.file.fsName.replace(".aep", ".mogrt"));
        log("EXPORTING MOGRT for: " + app.project.activeItem.name);
        // We use activeItem which should be the mainComp we just opened
        app.project.activeItem.exportAsMotionGraphicsTemplate(true, mogrtFile.fsName);
        log("MOGRT EXPORTED TO: " + mogrtFile.fsName);
    } catch(e) {
        log("MOGRT EXPORT ERROR: " + e.toString());
    }

    log("DONE. Quitting in 5 seconds to allow file write...");
    $.sleep(5000);
    app.quit();
} else {
    log("Failed to prepare template.");
    app.quit();
}
