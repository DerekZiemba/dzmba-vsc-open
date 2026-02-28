import * as VSCode from 'vscode';
import { default as Open } from 'open';
import * as cp from 'child_process';
import * as path from 'path';
import type * as TF from 'type-fest';
import type { TabInputCustom, TabInputNotebook, TabInputNotebookDiff, TabInputTerminal, TabInputText, TabInputTextDiff, TabInputWebview } from 'vscode';

/**
 * Activates the extension.
 */
export function activate(context: VSCode.ExtensionContext): void {
  const controller = new OpenController(context.extensionPath);
  context.subscriptions.push(controller);
}

/**
 * Controller for handling file opens.
 */
class OpenController implements VSCode.Disposable {
  #disposable: VSCode.Disposable;
  #extensionPath: string;

  constructor(extensionPath: string) {
    this.#extensionPath = extensionPath;
    this.#disposable = VSCode.Disposable.from(
      VSCode.commands.registerCommand(
        'dzmba-vsc-open.openWithDefaultApplication', (uri: VSCode.Uri | undefined) => {
        this.openWithDefault(uri);
      }),
      VSCode.commands.registerCommand(
        'dzmba-vsc-open.openWithVSCode', (uri: VSCode.Uri | undefined) => {
        uri && this.openWithVSCode(uri);
      }),
      VSCode.commands.registerCommand(
        'dzmba-vsc-open.openInDevContainer', (uri: VSCode.Uri | undefined) => {
        uri && this.openInDevContainer(uri);
      })
    );
    this.setContext();
    VSCode.workspace.onDidChangeConfiguration(this.setContext, this);
  }
  dispose(): void {
    this.#disposable.dispose();
  }
  registerCommands() {
    return [
      VSCode.commands.registerCommand(
        'dzmba-vsc-open.openWithDefaultApplication', (uri: VSCode.Uri | undefined) => {
        this.openWithDefault(uri);
      }),
      VSCode.commands.registerCommand(
        'dzmba-vsc-open.openWithVSCode', (uri: VSCode.Uri | undefined) => {
        uri && this.openWithVSCode(uri);
      }),
      VSCode.commands.registerCommand(
        'dzmba-vsc-open.openInDevContainer', (uri: VSCode.Uri | undefined) => {
        uri && this.openInDevContainer(uri);
      }),
    ]
  }
  setContext() {
    const cfg = VSCode.workspace.getConfiguration('dzmba-vsc-open').get('contextMenu.openWith') as any;
    VSCode.commands.executeCommand(
      'setContext',
      'dzmba-vsc-open:fileWithDefault',
      cfg?.file?.default ?? true
    );
    VSCode.commands.executeCommand(
      'setContext',
      'dzmba-vsc-open:fileWithVSCode',
      cfg?.file?.vscode ?? false
    );
    VSCode.commands.executeCommand(
      'setContext',
      'dzmba-vsc-open:folderWithDefault',
      cfg?.folder?.default ?? false
    );
    VSCode.commands.executeCommand(
      'setContext',
      'dzmba-vsc-open:folderWithVSCode',
      cfg?.folder?.vscode ?? true
    );
    VSCode.commands.executeCommand(
      'setContext',
      'dzmba-vsc-open:folderWithDevContainer',
      cfg?.folder?.devContainer ?? true
    );
  }
  async showInFiles(uri: VSCode.Uri) {
    // https://github.com/files-community/Files
    // TODO: Figure out how to do this in nodejs
    /**powershell
    # It could be installed anywhere.
    # Get the path from the shell

    $ShellNS = (New-Object -ComObject Shell.Application).NameSpace('shell:::{4234d49b-0245-4df3-b780-3893943456e1}')
    $path = ($ShellNS.Items() | where { $_.Name -eq 'Files' }  | select -first 1).Path;
    $proc = Start-Process "shell:AppsFolder\$path" -EA Ignore;
    */
  }
  async showInFilePilot(uri: VSCode.Uri) {
    // TODO: Figure out how to do this in nodejs
    /**powershell
    # It could be installed anywhere.
    # Get the path from the shell

    $ShellNS = (New-Object -ComObject Shell.Application).NameSpace('shell:::{4234d49b-0245-4df3-b780-3893943456e1}')
    $path = ($ShellNS.Items() | where { $_.Name -eq 'File Pilot' }  | select -first 1).Path;
    $proc = Start-Process "shell:AppsFolder\$path" -EA Ignore;
    */
  }
  async showInVoidtoolsEverything(uri: VSCode.Uri) {
    // TODO: Figure out how to do this in nodejs
    /**powershell
    # It could be installed anywhere.
    # Get the path from the shell

    $ShellNS = (New-Object -ComObject Shell.Application).NameSpace('shell:::{4234d49b-0245-4df3-b780-3893943456e1}')
    $path = ($ShellNS.Items() | where { $_.Name -eq 'Everything 1.5a' }  | select -first 1).Path;
    if ($path) {
      $path = ($ShellNS.Items() | where { $_.Name -eq 'Everything' }  | select -first 1).Path;
    }
    $proc = Start-Process "shell:AppsFolder\$path" -EA Ignore;
    */
  }
  async openWithNotepadPlusPlus(uri: VSCode.Uri) {
    // TODO: Figure out how to do this in nodejs
    /**powershell
    # It could be installed anywhere.
    # Get the path from the shell

    $ShellNS = (New-Object -ComObject Shell.Application).NameSpace('shell:::{4234d49b-0245-4df3-b780-3893943456e1}')
    $path = ($ShellNS.Items() | where { $_.Name -eq 'Notepad++' }  | select -first 1).Path;
    $proc = Start-Process "shell:AppsFolder\$path" -EA Ignore;
    */
  }
  async openWithVSCode(uri: VSCode.Uri) {
    try {
      const terminal = VSCode.window.createTerminal({
        cwd: uri.fsPath,
        hideFromUser: true,
        isTransient: true,
      });
      terminal.sendText('code -n . & exit');
      terminal.dispose();
    } catch (error) {
      VSCode.window.showInformationMessage(`Couldn't open Folder with VSCode ${uri.toString()}`);
      console.error(uri, error);
    }
  }
  async openInDevContainer(uri: VSCode.Uri) {
    const ext = VSCode.extensions.getExtension('ms-vscode-remote.remote-containers');
    if (!ext) {
      const action = await VSCode.window.showWarningMessage(
        'The Dev Containers extension is not installed.',
        'Install'
      );
      if (action === 'Install') {
        VSCode.commands.executeCommand('workbench.extensions.installExtension', 'ms-vscode-remote.remote-containers');
      }
      return;
    }

    // Use VS Code's bundled Node.js (process.execPath in the extension host) to run
    // the devcontainer CLI so no system Node.js installation is required.
    const nodePath = process.execPath;
    const cliScript = path.join(this.#extensionPath, 'node_modules', '@devcontainers', 'cli', 'dist', 'spec-node', 'devContainersSpecCLI.js');
    const folderPath = uri.fsPath;

    const opts = {
      location: VSCode.ProgressLocation.Notification,
      title: 'Launch folder in Dev Container',
      cancellable: false
    };
    VSCode.window.withProgress(opts, (progress) => {
      const wr = Promise.withResolvers();
      progress.report({ message: `Starting container for ${path.basename(folderPath)}...` });

      let output = '';
      let hasError = false;
      const proc = cp.spawn(nodePath, [cliScript, 'up', '--workspace-folder', folderPath], {
        env: { ...process.env },
      });

      proc.stdout.on('data', (d: Buffer) => { output += d.toString(); });
      proc.stderr.on('data', (d: Buffer) => { output += d.toString(); hasError = true; });

      proc.on('close', (code) => {
        output = output.trim();
        if (code !== 0) {
          VSCode.window.showErrorMessage(`devcontainer up failed (exit ${code}): ${output}`);
          return wr.reject();
        }
        // The CLI outputs a JSON result line as the last stdout line.
        try {
          const result = JSON.parse(output.split('\n').pop()!) as {
            outcome: string;
            remoteWorkspaceFolder: string;
          };

          if (result.outcome !== 'success') {
            VSCode.window.showErrorMessage(`devcontainer up outcome: ${result.outcome}`);
            return wr.reject();
          }

          // Construct the vscode-remote URI and open in a new window.
          const authority = Buffer.from(JSON.stringify({ hostPath: folderPath })).toString('hex');
          const remoteUri = VSCode.Uri.parse(`vscode-remote://dev-container+${authority}${result.remoteWorkspaceFolder}`);
          VSCode.commands.executeCommand('vscode.openFolder', remoteUri, { forceNewWindow: true });
          wr.resolve(undefined);
        } catch {
          VSCode.window.showErrorMessage('devcontainer up succeeded but could not parse output.');
          console.error('devcontainer output:', output);
          wr.reject();
        }
      });

      proc.on('error', (err) => {
        VSCode.window.showErrorMessage(`Failed to launch devcontainer CLI: ${err.message}`);
        wr.reject();
      });

      return wr.promise;
    }).then(console.log, console.error);
  }
  async openWithDefault(uri: VSCode.Uri | undefined): Promise<void> {
    let path = uri?.toString();
    if (uri?.scheme) {
      console.log("Opening from uri", uri.toString());
    } else {
      path = VSCode.window.activeTextEditor?.document?.uri?.toString();
      if (path) {
        console.log("Opening from editor", path);
      } else {
        type Input = TF.ExclusifyUnion<TabInputText & TabInputTextDiff & TabInputCustom & TabInputWebview &TabInputNotebook & TabInputNotebookDiff & TabInputTerminal>;
        const input = VSCode.window.tabGroups.activeTabGroup.activeTab?.input as Input;
        path = input?.uri?.toString();
        if (!path) path = input?.original?.fsPath;
        if (!path) path = input?.modified?.fsPath;
        if (!path) {
          console.error('No editor is active. Select an editor or a file in the Explorer view.', input);
        } else {
          console.log("Opening from tab", path);
        }
      }
    }
    if (path) {
      const decodedPath = decodeURIComponent(path);
      try {
        const p = await Open(decodedPath);
        p.on("exit", (n) => {
          if (n != 0) {
            VSCode.window.showInformationMessage("Couldn't open file.");
          }
        });
      } catch (error) {
        console.error('Failed to open file', { path, decodedPath, error });
      }
    }
  }
}
