import { OutputChannel, workspace } from 'coc.nvim';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export default class SessionManager {
  private readonly SESSION_FILE_NAME = 'Session.vim';

  public sessionExist(rootDir: string): boolean {
    let sessionFilePath = this.getSessionFilePath(rootDir);
    return existsSync(sessionFilePath);
  }

  public loadCurrentSession = async () => {
    workspace.showMessage('asdfasdfasdfasdfa');
    let cwd = String(await workspace.nvim.eval('getcwd()'));
    this.loadSession(cwd);
  };

  public loadSession = async (rootDir: string) => {
    let sessionFilePath = this.getSessionFilePath(rootDir);
    if (!existsSync(sessionFilePath)) {
      return;
    }
    await workspace.nvim.command(`source ${sessionFilePath}`);
  };

  public saveSession = async (rootDir: string) => {
    this.createCocDirIfNotExist(rootDir);
    let session_file_path = this.getSessionFilePath(rootDir);
    await workspace.nvim.command(`mks! ${session_file_path}`);
    workspace.showMessage(`Saving session to ${session_file_path}`);
  };

  public onQuit = async () => {
    this.closeReadOnlyBuffers();
    this.saveCurrentSession();
  };
  public saveCurrentSession = async () => {
    let cwd = String(await workspace.nvim.eval('getcwd()'));
    this.saveSession(cwd);
  };

  private closeReadOnlyBuffers = async () => {
    await workspace.nvim.command("exe 'bd '.join(filter(range(1, bufnr('$')), {i,v -> getbufvar(v, '&l:ro') == 1}))");
  };

  private getSessionFilePath(rootDir: string): string {
    return join(rootDir, '.vim', this.SESSION_FILE_NAME);
  }
  private createCocDirIfNotExist(rootDir: string) {
    let cocLocalFolderPath = join(rootDir, '.vim');
    // We make sure the local coc config path exists
    mkdirSync(cocLocalFolderPath, { recursive: true });
  }
}
