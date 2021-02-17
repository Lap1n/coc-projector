import { commands, ExtensionContext, listManager, workspace } from 'coc.nvim';
import ProjectList from './lists';
import ProjectManager from './projectManager';
import * as path from 'path';
import SessionManager from './sessionManager';

export async function activate(context: ExtensionContext): Promise<void> {
  let config = workspace.getConfiguration('projector');
  let pluginEnabled = config.get('enabled', true);
  if (!pluginEnabled) {
    return;
  }

  const homedir = require('os').homedir();
  let cacheFolder = config.get('cacheFolderPath', path.join(homedir, '.cache/nvim/projector'));
  let projectManager = new ProjectManager(cacheFolder);
  let sessionManager = new SessionManager();

  listManager.registerList(new ProjectList(workspace.nvim, projectManager, sessionManager));

  context.subscriptions.push(
    commands.registerCommand('addProject', async () => {
      let cwd = String(await workspace.nvim.eval('getcwd()'));
      projectManager.addProject(cwd);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('removeProject', async () => {
      let cwd = String(await workspace.nvim.eval('getcwd()'));
      projectManager.removeProject(cwd);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('openProjectDatabase', async () => {
      projectManager.openDatabaseFile();
    })
  );
  context.subscriptions.push(
    commands.registerCommand('saveSession', async () => {
      let cwd = String(await workspace.nvim.eval('getcwd()'));
      sessionManager.saveSession(cwd);
    })
  );

  context.subscriptions.push(
    workspace.registerAutocmd({
      event: ['BufWritePost'],
      request: false,
      callback: sessionManager.saveCurrentSession,
    })
  );
  context.subscriptions.push(
    workspace.registerAutocmd({
      event: ['QuitPre'],
      request: false,
      callback: sessionManager.onQuit,
    })
  );

  // TODO: support automatic session loading
  // context.subscriptions.push(
  // workspace.registerAutocmd({
  // event: ['TermOpen'],
  // request: false,
  // callback: sessionManager.loadCurrentSession,
  // })
  // );
}
