local M = {}
local path = require("plenary.path")


--TODO: make this path configurable
local default_cache_folder = path.new("/home/lapin/.cache/nvim/project")

local default_project_list_path = default_cache_folder:joinpath("projects.cache")

local function fzf_picker(name,items,on_select_callback)
  local fzf_run = vim.fn["fzf#run"]
  local fzf_wrap = vim.fn["fzf#wrap"]
  local options = {
    "--prompt","Projects: "
  } local wrapped = fzf_wrap(name, {
      source = items,
      options = options,
  })
  -- I can't use sink unfortunately due to a bug when loading a file with the callback
  wrapped["sink*"]=on_select_callback
  wrapped["sink"] = nil
  fzf_run(wrapped)
end


local function read_file(file_path, mode)
  local file, err = io.open(file_path,mode)
  if file == nil then
    print("Coundn't open the file: "..err)
  end
  return file
end

local function file_exists(file_path)
  local f = io.open(file_path, "rb")
  if f then f:close() end
  return f ~= nil
end

local function lines_from_file(file_path)
  if not file_exists(file_path) then return {} end
  local lines = {}
  for line in io.lines(file_path) do
    lines[#lines + 1] = line
  end
  return lines
end

local function get_projects()
  local projects = lines_from_file(default_project_list_path.filename)
  return projects
  end

local function get_directory_path(full_path)
    return full_path:match("(.*[/\\])")
end

local function get_root_project_path()
  return vim.api.nvim_eval("finddir('.git/..', expand('%:p:h').';')")
end

local function get_project_session_path(directory)
  local session_file_name= string.gsub(directory,"([.\\//])","_")..".vim"
  local file_path = default_cache_folder:joinpath(session_file_name)
  return file_path
end


local function project_already_exist(project_root_path)
    for line  in io.lines(default_project_list_path.filename) do
        if project_root_path == line then
          return true
        end
    end
    return false
end

local function is_currently_in_a_project()
  return project_already_exist(get_root_project_path())
end

function M.init()
  vim.cmd([[
  augroup AutoSaveSession
  autocmd QuitPre,BufWritePost * execute "PSaveSession"
  augroup END 
  ]])
end

function M.save_session()
  local session_path = get_project_session_path(get_root_project_path())
  vim.cmd("mks! "..session_path.filename)
end


function M.select_project()
  local project_list = get_projects()
  local callback = function(selection)
    local directory = ""
    for _, value in pairs(selection) do
      if value ~= "" then
        directory = value
        break
      end
    end
    if is_currently_in_a_project()then
      M.save_session()
    end
    vim.cmd("cd "..directory)
    local session_path = get_project_session_path(directory)
    if file_exists(session_path.filename) then
      vim.cmd("bufdo! bwipeout")
      vim.cmd("source "..session_path.filename)
    else
      vim.cmd("FZF")
    end
  end
  fzf_picker("Select Project", project_list,callback)
end

function M.clear_projects()
  if not file_exists(default_project_list_path.filename) then return {} end
  os.remove(default_project_list_path.filename)
end


function M.add_project()
  local project_root_path = get_root_project_path()
  if project_root_path == "" then return end
  if  file_exists(default_project_list_path.filename) then
      if project_already_exist(project_root_path) then
        print("Project already registered.")
        return
      end
  else
    --If the cache does not exist, we make sure that the folders exist before creating the file
    --TODO: make this check recusirve when plenary's path module supports the parents=true option
    local cache_path = path.new(get_directory_path(default_project_list_path.filename))
    local opts = {exists_ok=true}
    if cache_path:exists()==false then
      cache_path:mkdir(opts)
    end
  end

  local file = read_file(default_project_list_path.filename,"a")
  file:write(project_root_path, "\n")
  file:close()
  print("Successfully added project "..project_root_path)
end

function M.open_cache_file()
  vim.cmd("edit "..default_project_list_path.filename)
end

return M
