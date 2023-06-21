import { Client, User } from "discord.js-selfbot-v13";

var user: User;
export async function getEnvUser(client: Client) {
	if (!user) user = await client.users.fetch(process.env.USER_ID!, { force: true });
	return user;
}