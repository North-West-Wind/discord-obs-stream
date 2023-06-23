#!/usr/bin/env node
import { Client, VoiceBasedChannel } from "discord.js-selfbot-v13";
import { DiscordStreamClient, Player, VoiceConnection } from "discord-stream-client";
import envPaths from "env-paths";
import path from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import inquirer from "inquirer";

var config: { token: string, user: string, url?: string, bitrate?: number, fps?: number } = loadConfig();

const client = new Client({ checkUpdate: false });
const streamClient = new DiscordStreamClient(client);
var connection: VoiceConnection | undefined;
var player: Player | undefined;

client.on("ready", async () => {
  console.log(`Logged in as ${client.user!.username}`);

	if (client.user?.voice.channelId) {
		connection = streamClient.connection;
		await leaveVoice();
	}
	runConsole();
});

client.on("messageCreate", async (message) => {
	if (message.author.id != config.user) return;
	client.acceptInvite(message.content).catch(() => {});
});

client.on("voiceStateUpdate", async (oldState, newState) => {
	if (oldState.member!.id != config.user) return;
	if (oldState.channelId == newState.channelId) return;
	if (!newState.channelId) await leaveVoice();
});

async function joinVoice(channel: VoiceBasedChannel) {
	if (!connection) connection = await streamClient.joinVoiceChannel(channel, { selfDeaf: true, selfMute: true, selfVideo: false });

	const streamConnection = await connection.createStream();
	player = streamClient.createPlayer(config.url || "udp://@:1234?overrun_nonfatal=1&fifo_size=50000000", streamConnection.udp);
	player.on("error", err => console.error(err));
	player.play(config.bitrate || 2500, config.fps || 30);
}

async function leaveVoice() {
	await streamClient.leaveVoiceChannel();
	if (connection) connection = undefined;
	if (player) player.stop();
}

function loadConfig() {
	const paths = envPaths("discord-obs-stream", { suffix: "" });
	const configPath = path.join(paths.config, "config.json");
	console.log("Reading config from", configPath);
	if (!existsSync(paths.config)) mkdirSync(paths.config);
	if (!existsSync(configPath)) {
		console.log("It does not exist! I will create a default file for you. Please edit it.");
		writeFileSync(configPath, JSON.stringify({ token: "YOUR ALT TOKEN HERE", user: "YOUR MAIN ID HERE", url: "udp://@:1234" }, null, 2));
		process.exit(1);
	}
	return JSON.parse(readFileSync(configPath, { encoding: "utf8" }));
}

async function runConsole() {
	while (true) {
		const answers = await inquirer.prompt([{ type: "input", name: "cmd", message: ">" }]);
		switch (answers.cmd) {
			case "on": {
				try {
					const user = await client.users.fetch(config.user);
					if (!user.voice.channelId) console.log("User is not in any voice channel");
					else await joinVoice(user.voice.channel!);
				} catch (err) {
					console.error(err);
				}
				break;
			}
			case "off": {
				await leaveVoice();
				break;
			}
			case "reload": {
				config = loadConfig();
				break;
			}
			case "stop": {
				console.log("Bye!");
				await leaveVoice();
				process.exit(0);
			}
			default: console.log("¯\\_(ツ)_/¯");
		}
	}
}

client.login(config.token);