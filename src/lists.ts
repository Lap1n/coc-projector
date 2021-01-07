import { BasicList, ListAction, ListContext, ListItem, Neovim, workspace } from 'coc.nvim';
import ProjectManager from './projectManager';
import SessionManager from './sessionManager';

export default class ProjectList extends BasicList {
  public readonly name = 'projects';
  public readonly description = 'Project list';
  public readonly defaultAction = 'open';
  public actions: ListAction[] = [];

  constructor(nvim: Neovim, private projectManager: ProjectManager, sessionManager: SessionManager) {
    super(nvim);
    this.addAction('open', async (item: ListItem) => {
      let directory = item.data.path;
      let cwd = String(await workspace.nvim.eval('getcwd()'));
      if (directory == cwd) {
        return;
      }
      await workspace.nvim.command('bufdo bwipeout');
      await workspace.nvim.command(`cd ${directory}`);

      if (sessionManager.sessionExist(directory)) {
        await sessionManager.loadSession(directory);
      } else if (await workspace.nvim.eval('exists("*fzf#run")')) {
        //TODO: add support for other fuzzy finders
        let fzfParams = await workspace.nvim.call('fzf#wrap', {
          source: 'git ls-files',
          sink: 'e',
        });
        await workspace.nvim.call('fzf#run', fzfParams);
      } else {
        await workspace.nvim.command(`e ${directory}`);
      }
    });
  }

  public async loadItems(context: ListContext): Promise<ListItem[]> {
    let projects: ListItem[] = [];
    for (const line of this.projectManager.getProjectPaths()) {
      projects.push({ label: line, data: { path: line } });
    }
    return projects;
  }
}
