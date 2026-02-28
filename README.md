# dzmba-vsc-open

Adds additional context menu entries to files & folders.  
Especially useful if you have a workspace & just want to open one from it. 

- Open with default application
- Open in Dev Container (no longer have to first open in vscode then reopen in container & close your Windows VSCode instance)
  - Note: This doesn't build the container. If the newly launched instance has no files, do Ctrl+Shift+P -> Rebuild
- Open with VSCode (no longer have to open a terminal, navigate to the folder and type `code .`)

## TODO

- Show Directory in FilePilot
- Show Directory in Voidtools Everything

## Install

I haven't got around to figuring out how to put this on the marketplace. So:
 
 - Download from the Github releases page
 - In VSCode navigate to the extensions tab, click the three dots in the top right, and select "Install from VSIX"  
 - Select the downloaded file
  
## Settings

```jsonc
  "dzmba-open.contextMenu.openWith": {
    "file": {
      "default": true,
      "vscode": false,
      "filepilot": true, // Show in filepilot
      "voidtools-everything": true, // Show in voidtools-everything
    },
    "folder": {
      "default": true,
      "vscode": true,
      "devContainer": true,
      "filepilot": true,
      "voidtools-everything": true
    }
  },
```

## Images

![contextMenu](https://github.com/DerekZiemba/dzmba-vsc-open/blob/master/img/contextMenu.png)

![taskbar workspace pin](https://github.com/DerekZiemba/dzmba-vsc-open/blob/master/img/pinned-workspace.jpg)
