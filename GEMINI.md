# AI Video Factory Project

## Overview
A web-based system to automate the conversion of After Effects templates (.aet/.aep) into fully prepared MOGRTs for MoDeck, followed by AI-driven video design.

## Current Progress
- **UI Bridge**: Node.js server running on `localhost:5000` with a drag-and-drop upload interface.
- **Auto-Conversion**: Automated conversion of `.aet` files to `.aep` for processing.
- **AI Scanning**: `scanner.jsx` extracts composition and layer data (Text, Footage) into `template_manifest.json`.
- **AI Preparation**: `prepare_template.jsx` identifies main compositions and automatically exposes layers to the Essential Graphics panel.
- **MOGRT Export**: Pipeline established to export processed templates as `.mogrt` files.

## Workflow Status
1. **Upload**: User drops .aet/.aep into the web app.
2. **Scan & Prepare**: AE opens, saves as .aep, scans layers, and populates Essential Graphics.
3. **Keep AE Open**: (In Progress) AE must remain open after AEP save to allow further dynamic adjustments by the AI agent.
4. **MOGRT Sync**: Exported MOGRTs should go to: `C:\Users\David\MoDeck Sync\Automated mogrts`.

## Next Steps
- Implement specific MoDeck template creation logic via another AI agent.
- Integrate a "Description to Video" agent that uses `nexrender` to design final videos based on user prompts.
- Ensure the Essential Graphics panel is fully populated with all dynamic options intended for the template.

## Environment Config
- **After Effects Version**: 2026
- **OS**: Windows 11
- **Critical Setting**: Preferences > Scripting & Expressions > "Allow Scripts to Write Files and Access Network" must be **ENABLED**.
