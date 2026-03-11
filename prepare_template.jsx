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
    return mainComp;
}

var mainComp = prepare();
if (mainComp) {
    // Create the palette BEFORE the heavy operations to serve as a keep-alive
    var win = new Window("palette", "AI Video Factory", undefined);
    var statusText = win.add("statictext", undefined, "Preparing for Export...");
    win.show();
    app.activate();

    // Export MOGRT
    try {
        var mogrtDir = new Folder("C:/Users/David/MoDeck Sync/Automated mogrts");
        if (!mogrtDir.exists) mogrtDir.create();

        // FIX: Handle cases where app.project.file is null (unsaved templates)
        var baseName = "Template";
        if (app.project.file) {
            baseName = app.project.file.name.replace(".aep", "").replace(".aet", "");
        } else {
            // Try to use the mainComp name if project isn't saved yet
            baseName = mainComp.name.replace(/\s+/g, "_");
        }
        
        var mogrtName = baseName + ".mogrt";
        var mogrtFile = new File(mogrtDir.fsName + "/" + mogrtName);
        
        log("MOGRT DESTINATION: " + mogrtFile.fsName);

        // Refocus the comp right before export
        mainComp.openInViewer();
        log("EXPORTING MOGRT for: " + mainComp.name);
        statusText.text = "Exporting MOGRT... Please wait.";
        win.update();

        // AE will handle its own internal save-before-export here
        // Note: If project has never been saved, this might prompt or fail
        // To be safe, let's force a save if it's never been saved
        if (!app.project.file) {
             log("Project never saved. Export might fail. You should save manually once or we can try to force it.");
        }

        mainComp.exportAsMotionGraphicsTemplate(true, mogrtFile.fsName);

        // ACTIVE VERIFICATION LOOP: Keep AE open until the file exists
        var exportWait = 0;
        var maxExportWait = 30; // 30 * 2s = 60s max wait
        while (!mogrtFile.exists && exportWait < maxExportWait) {
            $.sleep(2000);
            exportWait++;
            statusText.text = "Exporting... " + (exportWait * 2) + "s / 60s";
            win.update();
        }

        if (mogrtFile.exists) {
            log("MOGRT EXPORT SUCCESS: Verified on disk.");
            statusText.text = "MOGRT Exported. AE Ready.";
        } else {
            log("MOGRT EXPORT TIMEOUT: File not found after 60s.");
            statusText.text = "Export Timeout. Check logs.";
        }
        win.update();
    } catch(e) {
        log("MOGRT EXPORT ERROR: " + e.toString());
        statusText.text = "Export Error: " + e.toString();
        win.update();
    }

    log("DONE. AE will remain open for AI agent interaction.");
} else {
    log("Failed to prepare template.");
}
