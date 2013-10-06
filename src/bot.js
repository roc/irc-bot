
var util = require('util'),
    events = require('events'),
    fs = require('fs');


function Bot(ircClient, ircNick, ircChannel, www) {

  events.EventEmitter.call(this);
 
  this.ircClient = ircClient;
  this.ircNick = ircNick;
  this.ircChannel = ircChannel;
  this.www = www;

  this.ircClient.on('message', this._listenForMe.bind(this));
  this.ircClient.on('pm', this.emit.bind(this, 'to-bot'));

  this.on('to-bot', this._matchMessageHandler.bind(this));

}

util.inherits(Bot, events.EventEmitter);

Bot.prototype.registerPlugins = function(pluginConfig) {

  var pluginNames = Object.keys(pluginConfig),
      bot = this;

  function registerPlugin(i) { 
    if (i >= pluginNames.length) return;
    else {
      var pluginName = pluginNames[i],
          plugin;

      console.log('Registering ' + pluginName + '...');

      plugin = Bot.PLUGINS[pluginName];
      plugin(pluginConfig[pluginName], bot, function() {
        console.log('Registered.');
        registerPlugin(++i);
      });
    }
  }

  registerPlugin(0);

};

Bot.prototype.say = function(message) {
  this.ircClient.say(this.ircChannel, message);
};


Bot.prototype._matchMessageHandler = function(nick, text, message) {
  this.say(nick + ', I heard that!');
};

Bot.prototype._listenForMe = function(nick, to, text, message) {
  if (text.indexOf(this.ircNick) >= 0) {
    this.emit('to-bot', nick, text, message);
  }
};

Bot.PLUGINS = fs.readdirSync(__dirname + '/plugins')
                .filter(function(path) { return /.*\.js$/.test(path); })
                .reduce(function(map, path) { 
                  map[path.substring(0, path.length - 3)] = 
                    require(__dirname + '/plugins/' + path);
                  return map;
                }, {});

module.exports = Bot;



