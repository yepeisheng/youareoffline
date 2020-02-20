var fs = require("fs");
require("dotenv").config()
const { Wechaty } = require('wechaty') // import { Wechaty } from 'wechaty'
const ONLINE_STATS = {};

const bot = new Wechaty();
var room;
bot.on('scan', (qrcode, status) => console.log(`Scan QR Code to login: ${status}\nhttps://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`));
bot.on('login', startTracking);
bot.on('message', commandHandle);
bot.start()

async function commandHandle(message) {
	if (message.room().payload.topic === process.env.WECHAT_ROOM &&
		message.text() === "查询当前在线情况") {
		const summary = Object.keys(ONLINE_STATS)
		.map(name => `${name}:${ONLINE_STATS[name] ? "在线" : "离线"}`).join("\n")
		await room.say(summary);
	}
}

async function startTracking() {
	room = await bot.Room.find({topic: process.env.WECHAT_ROOM })
	setTimeout(checkOnlineStats, 5000);
}

async function checkOnlineStats() {
	fs.readFile(process.env.WOW_PATH, async (err, data) => {
		let onlineStats = data.toString();
		const start = onlineStats.indexOf("PARSESTART") + 10;
		const end = onlineStats.indexOf("PARSEEND");
		onlineStats = onlineStats.substr(start, end-start-1);
		const onlineStatesDict = onlineStats.split(";");
		
		for (let i=0; i< onlineStatesDict.length; i++) {
			[name, online] = onlineStatesDict[i].split(":");
			online = online === "true";
			if (ONLINE_STATS[name] === undefined) {
				await room.say(`开始监控：${name} - ${online ? "在线" : "离线"}`)
			} else if (ONLINE_STATS[name] !== online) {
				await room.say(`提醒：${name}已${online ? "在线" : "离线"}`)
			}
			ONLINE_STATS[name] = online;
		}
	})
	setTimeout(checkOnlineStats, 5000);
}
