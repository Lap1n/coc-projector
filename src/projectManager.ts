import * as fs from 'fs';
import { workspace } from 'coc.nvim';
import * as path from 'path';
import low, { LowdbSync } from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

interface DatabaseSchema {
  projects: ProjectSchema[];
}

interface ProjectSchema {
  path: string;
}

export default class ProjectManager {
  public readonly CACHE_FILE_NAME = 'projector.json';
  private projectDatabasePath: string;
  private db: LowdbSync<DatabaseSchema>;

  public constructor(databaseFolderPath: string) {
    this.createDatabaseFolder(databaseFolderPath);
    this.projectDatabasePath = path.join(databaseFolderPath, this.CACHE_FILE_NAME);
    const adapter = new FileSync<DatabaseSchema>(this.projectDatabasePath);
    this.db = low(adapter);
    if (!this.db.has('projects').value()) {
      this.db.defaults({ projects: [] }).write();
    }
  }

  public getProjectPaths(): Array<string> {
    let projectPaths = this.db.get('projects').map('path').value();
    return projectPaths;
  }

  public addProject(projectRootPath: string): void {
    let projects = this.db.get('projects');
    if (projects.find({ path: projectRootPath }).value()) {
      return;
    }
    projects.push({ path: projectRootPath }).write();
  }

  public removeProject(projectRootPath: string): void {
    let projects = this.db.get('projects');
    if (!projects.find({ path: projectRootPath }).value()) {
      return;
    }
    projects.remove({ path: projectRootPath }).write();
  }

  public openDatabaseFile(): void {
    workspace.nvim.command(`e ${this.projectDatabasePath}`);
  }
  private createDatabaseFolder(databaseFolderPath: string): void {
    fs.mkdirSync(databaseFolderPath, { recursive: true });
  }
}
