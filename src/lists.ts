import { BasicList, ListAction, ListContext, ListItem, Neovim, workspace } from 'coc.nvim';
import * as fs from 'fs';
import * as path from 'path';

export default class ProjectList extends BasicList {
  public readonly name = 'projects';
  public readonly description = 'Project list';
  public readonly defaultAction = 'open';
  public actions: ListAction[] = [];

  private readonly SESSION_FILE_NAME = "Session.vim"

  constructor(nvim: Neovim) {
    super(nvim);
    this.addAction('open', (item: ListItem) => {
      let directory = item.data.path
      workspace.nvim.command("bufdo! bwipeout")
      workspace.nvim.command(`cd ${directory}`)
      let session_full_path = path.join(directory,this.SESSION_FILE_NAME)
      workspace.showMessage(session_full_path)
      if (fs.existsSync(session_full_path)){
        workspace.nvim.command(`source ${session_full_path}`)
      }
      // workspace.showMessage("failedddd")
      // else{
        // workspace.nvim.command(`e ${directory}`)
      // }

      // workspace.nvim.command("FZF")
      // local session_path = get_project_session_path(directory)
      // if file_exists(session_path.filename) then
        // vim.cmd("bufdo! bwipeout")
        // vim.cmd("source "..session_path.filename)
      // else
        // vim.cmd("FZF")
      // end
    });
  }

  public async loadItems(context: ListContext): Promise<ListItem[]> {
    let projects:ListItem[] =[];
    fs.readFile('/home/lapin/.cache/nvim/project/projects.cache', 'utf8', (error, data) => {
          for (const line of data.split(/[\r\n]+/)){
            projects.push({label:line,data:{path:line}})
          }
        })
    return projects;
  }
}

