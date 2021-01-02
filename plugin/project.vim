" in plugin/whid.vim
if exists('g:loaded_project') | finish | endif " prevent loading file twice

let s:save_cpo = &cpo " save user coptions
set cpo&vim " reset them to defaults


" command to run our plugin
lua require'project'.init()
command! PSearch lua require'project'.select_project()
command! PAdd lua require'project'.add_project()
command! PCache lua require'project'.open_cache_file()
command! PClear lua require'project'.clear_projects()
command! PSaveSession lua require'project'.save_session()
let &cpo = s:save_cpo " and restore after
unlet s:save_cpo

let g:loaded_project = 1
set sessionoptions-=globals
set sessionoptions-=localoptions
set sessionoptions-=options
