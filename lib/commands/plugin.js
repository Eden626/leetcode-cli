var fs = require('fs');

var h = require('../helper');
var config = require('../config');
var log = require('../log');
var Plugin = require('../plugin');
var session = require('../session');

var cmd = {
  command: 'plugin [name]',
  aliases: ['extension', 'ext'],
  desc:    'show plugins',
  builder: {
    install: {
      alias:    'i',
      type:     'boolean',
      describe: 'Install plugin',
      default:  false
    },
    enable: {
      alias:    'e',
      type:     'boolean',
      describe: 'Enable plugin',
      default:  false
    },
    disable: {
      alias:    'd',
      type:     'boolean',
      describe: 'Disable plugin',
      default:  false
    },
    delete: {
      alias:    'D',
      type:     'boolean',
      describe: 'Delete plugin',
      default:  false
    },
    config: {
      alias:    'c',
      type:     'boolean',
      describe: 'Show config',
      default:  false
    }
  }
};

cmd.handler = function(argv) {
  session.argv = argv;

  var name = argv.name;
  if (argv.install) {
    Plugin.install(name, function(e, plugin) {
      if (e) return log.error(e);
      plugin.help();
    });
    return;
  }

  var plugins = Plugin.plugins;
  if (name) {
    plugins = plugins.filter(function(p) {
      return p.name === name;
    });
  }
  if (plugins.length === 0) return log.error('Plugin not found!');

  var plugin = plugins[0];
  var oldname = Plugin.fullpath(plugin.file);
  var newname;

  if (argv.enable) {
    if (plugin.file[0] !== '.') return;
    newname = Plugin.fullpath(plugin.file.substr(1));

    fs.rename(oldname, newname, function(e) {
      if (e) log.error(e.message);
    });
  } else if (argv.disable) {
    if (plugin.file[0] === '.') return;
    newname = Plugin.fullpath('.' + plugin.file);

    fs.rename(oldname, newname, function(e) {
      if (e) log.error(e.message);
    });
  } else if (argv.delete) {
    fs.unlink(oldname, function(e) {
      if (e) log.error(e.message);
    });
  } else if (argv.config) {
    log.info(JSON.stringify(config.plugins[name] || {}, null, 2));
  } else {
    plugins.forEach(function(p) {
      log.printf('%s %-18s %-15s %s', h.prettyText('', p.enabled), p.name, p.ver, p.desc);
    });
  }
};

module.exports = cmd;
