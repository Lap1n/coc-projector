import { commands, CompleteResult, ExtensionContext, listManager, sources, workspace } from 'coc.nvim';
import ProjectList from './lists';
import ProjectManager from './projectManager';
import * as path from 'path';

export async function activate(context: ExtensionContext): Promise<void> {
  // workspace.showMessage(`projector work `);
  let config = workspace.getConfiguration('projector');
  let pluginEnabled = config.get('enabled', true);
  if (!pluginEnabled) {
    return;
  }

  const trace = config.get<'off' | 'message' | 'verbose'>('trace.server', 'off');
  const homedir = require('os').homedir();
  let cacheFolder = config.get('cacheFolderPath', path.join(homedir, '.cache/nvim/projector'));
  let projectManager = new ProjectManager(cacheFolder);
  listManager.registerList(new ProjectList(workspace.nvim, projectManager));

  context.subscriptions.push(
    commands.registerCommand('addProject', async () => {
      projectManager.addProject(workspace.rootPath);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('removeProject', async () => {
      projectManager.removeProject(workspace.rootPath);
    })
  );

  // workspace.registerKeymap(
  // ['n'],
  // 'projector-keymap',
  // async () => {
  // workspace.showMessage(`registerKeymap`);
  // },
  // { sync: false }
  // ),

  // sources.createSource({
  // name: 'projector completion source', // unique id
  // shortcut: '[CS]', // [CS] is custom source
  // priority: 1,
  // triggerPatterns: [], // RegExp pattern
  // doComplete: async () => {
  // const items = await getCompletionItems();
  // return items;
  // },
  // }),

  // workspace.registerAutocmd({
  // event: 'InsertLeave',
  // request: true,
  // callback: () => {
  // workspace.showMessage(`registerAutocmd on InsertLeave`);
  // },
  // })
  // );
}
