import { BasicList, ListAction, ListContext, ListItem, Neovim, workspace } from 'coc.nvim';
import * as fs from 'fs';
import * as path from 'path';
import ProjectManager from './projectManager';

export default class ProjectList extends BasicList {
  public readonly name = 'projects';
  public readonly description = 'Project list';
  public readonly defaultAction = 'open';
  public actions: ListAction[] = [];

  private readonly SESSION_FILE_NAME = 'Session.vim';

  constructor(nvim: Neovim, private projectManager: ProjectManager) {
    super(nvim);
    this.addAction('open', async (item: ListItem) => {
      let directory = item.data.path;
      await workspace.nvim.command('bufdo bwipeout');
      await workspace.nvim.command(`cd ${directory}`);
      //     let session_full_path = path.join(directory, this.SESSION_FILE_NAME);
      // if (fs.existsSync(session_full_path)) {
      //        workspace.nvim.command(`source ${session_full_path}`);
      // }

      if (await workspace.nvim.eval('exists("*fzf#run")')) {
        let fzfParams = await workspace.nvim.call('fzf#wrap', {
          source: 'git ls-files',
          sink: 'e',
        });
        await workspace.nvim.call('fzf#run', fzfParams);
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
