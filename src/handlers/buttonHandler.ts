import { MessageComponentInteraction } from "discord.js";
import { VoiceManager } from "./VoiceHandler";

let buttonHandler = (interaction : MessageComponentInteraction, voiceManager:VoiceManager)=>{
    interaction.reply("OW YOU HIT MY HEAD");
}

export {buttonHandler};