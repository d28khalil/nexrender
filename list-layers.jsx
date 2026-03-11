var project = app.project;
var report = "--- AE PROJECT REPORT ---\n";

for (var i = 1; i <= project.numItems; i++) {
    var item = project.item(i);
    if (item instanceof CompItem) {
        report += "\nCOMPOSITION: " + item.name + "\n";
        for (var j = 1; j <= item.numLayers; j++) {
            var layer = item.layer(j);
            report += "  - LAYER: " + layer.name + " (Index: " + j + ")\n";
        }
    }
}

var file = new File(Folder.temp.fsName + "/ae_report.txt");
file.open("w");
file.write(report);
file.close();
