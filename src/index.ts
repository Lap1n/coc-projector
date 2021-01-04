import { commands, CompleteResult, ExtensionContext, listManager, sources, workspace } from 'coc.nvim';
import ProjectList from './lists';

export async function activate(context: ExtensionContext): Promise<void> {
  // workspace.showMessage(`projector work `);

  context.subscriptions.push(
    commands.registerCommand('', async () => {
      // workspace.showMessage(`projector Commands works!`);
    }),

    listManager.registerList(new ProjectList(workspace.nvim)),



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
  );
}

