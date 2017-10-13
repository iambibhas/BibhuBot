var Bot = require('node-telegram-bot'),
    path = require('path'),
    fs = require('fs'),
    _ = require('underscore');

function get_last_video() {
    var vidPath = '/var/lib/motion';

    if (!fs.existsSync(vidPath)){
        console.log("no dir ", vidPath);
        return '';
    }

    var files = fs.readdirSync(vidPath);
    files = files.filter(function (val) {
        return val.indexOf('mp4') > -1;
    })
    if (files.length === 0) {
        return '';
    }
    console.log(files);

    // use underscore for max()
    return path.join(vidPath, _.max(files, function (f) {
        var fullpath = path.join(vidPath, f);

        // ctime = creation time is used
        // replace with mtime for modification time
        return fs.statSync(fullpath).ctime;
    }));
}

var send_message = function(bot, message, text) {
    // sends a text message
    bot.sendMessage({
        chat_id: message.chat.id,
        reply_to_message_id: message.message_id,
        text: text
    });
}

var send_photo = function(bot, message, file_location) {
    // sends a photo, with the chat action "Sending photo >>>"
    bot.sendChatAction({
        chat_id: message.chat.id,
        action: 'upload_photo'
    });

    bot.sendPhoto({
        chat_id: message.chat.id,
        reply_to_message_id: message.message_id,
        files: {
            photo: file_location
        }
    }, function (err, msg) {
        console.log("error:", err);
        console.log(msg);
    });
}

var send_video = function(bot, message, file_location) {
    // sends a photo, with the chat action "Sending photo >>>"
    console.log(file_location);
    bot.sendChatAction({
        chat_id: message.chat.id,
        action: 'upload_video'
    });

    bot.sendVideo({
        chat_id: message.chat.id,
        reply_to_message_id: message.message_id,
        files: {
            stream: fs.createReadStream(file_location)
        }
    }, function (err, msg) {
        console.log("error:", err);
        console.log(msg);
    });
}

var escape_message = function(msg) {
    msg = msg.trim();
    console.log(msg);
    msg = msg.replace(/\?/g, '~q').replace(/\%/g, '~p').replace(/\"/g, "''");
    msg = msg.replace(/\_/g, '__').replace(/\-/g, '--').replace(/\ /g, '-');
    return msg;
}

var bot = new Bot({
    token: process.env.BOT_TOKEN
})
.on('start', function (message) {
    send_message(bot, message, "Hello Bibhas");
})
.on('help', function (message) {
    send_message(bot, message, "List of commands: cam");
})
.on('cam', function (message) {
    console.log(message);
    var last_video = get_last_video();
    if (last_video !== '') {
        send_video(bot, message, last_video);
    } else {
        send_message(bot, message, "no video found");
    }
})
.start();
