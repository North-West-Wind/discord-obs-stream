import { Client, VoiceBasedChannel } from "discord.js-selfbot-v13";
import "dotenv/config";
import { getEnvUser } from "./state.js";
import { DiscordStreamClient, VoiceConnection } from "discord-stream-client";

const client = new Client({ checkUpdate: false });
const streamClient = new DiscordStreamClient(client);
var connection: VoiceConnection | undefined;

client.on("ready", async () => {
  console.log(`Logged in as ${client.user!.username}`);

	getEnvUser(client).then(async user => {
		console.log(`Fetched user ${user.username}`);

		if (user.voice.channelId && client.user?.voice.channelId != user.voice.channelId) await joinVoice(user.voice.channel!);
		else if (!user.voice.channelId && client.user?.voice.channelId) {
			connection = streamClient.connection;
			await leaveVoice();
		} else if (user.voice.channelId && client.user?.voice.channelId == user.voice.channelId) {
			connection = streamClient.connection;
			await joinVoice(user.voice.channel!);
		}
	}).catch(() => console.log(`Failed to fetch user`));
});

client.on("messageCreate", async (message) => {
	if (message.author.id != process.env.USER_ID) return;
	client.acceptInvite(message.content).catch(() => {});
});

client.on("voiceStateUpdate", async (oldState, newState) => {
	if (oldState.member!.id != process.env.USER_ID) return;
	if (oldState.channelId == newState.channelId) return;
	if (!newState.channelId) {
		console.log(`${newState.member!.user.username} disconnected`);
		await leaveVoice();
	} else {
		console.log(`${newState.member!.user.username} joined ${newState.channel?.name}`);
		await joinVoice(newState.channel!);
	}
});

async function joinVoice(channel: VoiceBasedChannel) {
	if (!connection) connection = await streamClient.joinVoiceChannel(channel, { selfDeaf: true, selfMute: true, selfVideo: false });

	const streamConnection = await connection.createStream();
	const player = streamClient.createPlayer("udp://@:1234", streamConnection.udp);

	player.play();
}

async function leaveVoice() {
	await streamClient.leaveVoiceChannel();
	if (connection) connection = undefined;
}

client.login(process.env.TOKEN);