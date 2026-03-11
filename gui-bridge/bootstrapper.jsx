
        try {
            app.beginSuppressDialogs();
            var file = new File("C:/Users/David/GitHubProjects/nexrender/gui-bridge/uploads/6b8571f4c23164c7a09c7c7181222b03_scan.aep");
            if (file.exists) {
                app.open(file);
                // More robust wait for large projects
                $.sleep(10000); 
                $.evalFile(new File("C:/Users/David/GitHubProjects/nexrender/scanner.jsx"));
                $.sleep(3000);
                $.evalFile(new File("C:/Users/David/GitHubProjects/nexrender/prepare_template.jsx"));
            }
            app.endSuppressDialogs(false);
        } catch(e) {
            var f = new File("C:/Users/David/GitHubProjects/nexrender/scanner_debug.log");
            f.open("a");
            f.writeln("BOOTSTRAP ERROR: " + e.toString());
            f.close();
        }
    