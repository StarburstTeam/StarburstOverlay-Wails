import { blacklist } from "./blacklist";
import { sleep, formatColor, formatColorFromString, toDefault, formatNameString } from "./util";
import { pushNetworkError } from "./index"
import { getGuild, getStatus } from "./i18n/hypixel_i18n";
import { $ } from "./global";

//this file contains api to hypixel
export class Hypixel {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.self_ign = '';
        this.previous_data = '';
        this.owner_guild_id = '';
        this.data = {};
        this.verifying = true;
        this.uuids = [];
        this.download_count = 0;
        this.mojang_ping = this.hypixel_ping = 0;
        this.max_rate_limit = this.remain_rate_limit = this.reset_rate_limit = 300;
    }
    setSelfIgn = async (ign) => {
        this.self_ign = ign;
        this.self_uuid = await this.getPlayerUuid(ign);
        await this.download(ign);
        this.previous_data = this.data[ign] ?? {};
        this.owner_guild_id = this.data[ign]?.guild?._id ?? '';
    }
    getPlayerUuid = async (name) => {//null when the player not found
        if (this.uuids[name] != null) return this.uuids[name];
        let start = new Date().getTime();
        let a = await window.go.main.App.Fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`)
            .then(res => {
                if (res.Status == 404) return null;
                if (res.Status == 429) return 429;
                return JSON.parse(res.Body);
            });
        this.mojang_ping = new Date().getTime() - start;
        if (a == null) return null;
        if (a == 429) {
            console.log('Regetting in 5 seconds');
            await sleep(5 * 1000);
            return await this.getPlayerUuid(name);
        }
        return this.uuids[name] = a.id;
    }
    getPlayerData = async (uuid) => {
        try {
            let start = new Date().getTime();
            let res = await window.go.main.App.Fetch(`https://api.hypixel.net/player?key=${this.apiKey}&uuid=${uuid}`)
                .catch(err => { throw err })
                .then(res => {
                    this.max_rate_limit = +res.Headers['Ratelimit-Limit'][0];
                    this.remain_rate_limit = +res.Headers['Ratelimit-Remaining'][0];
                    this.reset_rate_limit = +res.Headers['Ratelimit-Reset'][0];
                    if (res.Status < 400) return JSON.parse(res.Body);
                    throw res.Status;
                });
            this.hypixel_ping = new Date().getTime() - start;
            return res;
        } catch (err) {
            console.log(err);
            if (pushNetworkError != null) pushNetworkError(err, true);
        }
    }
    getGuildData = async (uuid) => {
        try {
            let start = new Date().getTime();
            let res = await window.go.main.App.Fetch(`https://api.hypixel.net/guild?key=${this.apiKey}&player=${uuid}`)
                .catch(err => { throw err })
                .then(res => {
                    this.max_rate_limit = +res.Headers['Ratelimit-Limit'][0];
                    this.remain_rate_limit = +res.Headers['Ratelimit-Remaining'][0];
                    this.reset_rate_limit = +res.Headers['Ratelimit-Reset'][0];
                    if (res.Status < 400) return JSON.parse(res.Body);
                    throw res.Status;
                });
            this.hypixel_ping = new Date().getTime() - start;
            return res;
        } catch (err) {
            if (pushNetworkError != null) pushNetworkError(err, true);
        }
    }
    download = async (name, callback) => {//true if success, false if player not found, null if api error
        if (this.data[name] != null && this.data[name].success == true && this.data[name].time + 120 * 1000 > new Date().getTime())
            return true;
        this.data[name] = { success: false };
        let uuid = await this.getPlayerUuid(name);
        if (uuid == null) {
            this.data[name] = { success: true, time: new Date().getTime(), nick: true };
            if (callback != null) callback();
            return false;
        }
        let playerData = await this.getPlayerData(uuid);
        let guildData = await this.getGuildData(uuid);
        if (!playerData.success || !guildData.success) return null;
        if (playerData.player == null) {
            this.data[name] = { success: true, time: new Date().getTime(), nick: true };
            return false;
        }
        this.data[name] = { success: true, time: new Date().getTime(), nick: false, player: playerData.player, guild: guildData.guild };
        if (callback != null) callback();
        return true;
    }
    getRank = (name) => {
        if (this.data[name] == null || this.data[name].player == null) return '§7';
        let playerDataJson = this.data[name].player;
        let rank = playerDataJson.packageRank;
        if (rank == null)
            rank = playerDataJson.newPackageRank;
        let plus = playerDataJson.rankPlusColor;
        if (plus != null) plus = formatColorFromString(plus);
        else plus = '§c';
        if (playerDataJson.rank != null)
            if (playerDataJson.rank == 'YOUTUBER') return `§c[§fYT§c]`;
            else if (playerDataJson.rank == 'ADMIN') return `§4[ADMIN]`;
            else if (playerDataJson.rank == 'MODERATOR') return `§2[MOD]`;
            else if (playerDataJson.rank == 'HELPER') return `§9[HELP]`;
        if (rank == 'MVP_PLUS') {
            if (playerDataJson.monthlyPackageRank == 'NONE' || !playerDataJson.hasOwnProperty('monthlyPackageRank')) return `§b[MVP${plus}+§b]`;
            else return `§6[MVP${plus}++§6]`;
        } else if (rank == 'MVP') return `§b[MVP]`;
        else if (rank == 'VIP_PLUS') return `§a[VIP§6+§a]`;
        else if (rank == 'VIP') return `§a[VIP]`;
        else return `§7`;
    }
    getGuildName = (name) => {
        if (this.data[name] == null || this.data[name].guild == null) return `§7No Guild`;
        let guildJson = this.data[name].guild;
        if (guildJson.tag != null && guildJson.tagColor != null)
            return `${formatColorFromString(guildJson.tagColor)}${guildJson.name}`;
        return `§7No Guild`;
    }
    getGuildTag = (name) => {
        if (this.data[name] == null || this.data[name].guild == null) return ``;
        let guildJson = this.data[name].guild;
        if (guildJson.tag != null && guildJson.tagColor != null)
            return `${formatColorFromString(guildJson.tagColor)}[${guildJson.tag}]`;
        return ``;
    }
    formatName = (name) => `${this.getRank(name)}${this.data[name].player.displayname}${this.getGuildTag(name)}`;
    getLevel = (exp) => exp < 0 ? 1 : (1 - 3.5 + Math.sqrt(12.25 + 0.0008 * (exp ?? 0))).toFixed(1);
    getTitle = (type, gameTitle) => {
        let title = gameTitle[type];
        if (title != null) return title;
        return [];
    }
    getTag = (name) => {
        let api = this.data[name ?? '']?.player ?? {};
        let guild_id = this.data[name ?? '']?.guild?._id ?? '';
        let uuid = this.uuids[name ?? ''];
        let tags = { value: 0, data: [] };
        if (name == null) return tags;
        if (uuid == '40dff9cbb87b473f946b4dc9776949cc' || uuid == 'f1f464287e894024a5554610d635fa55') {
            tags.value = Math.max(tags.value, 100);
            tags.data.push({ text: 'D', color: '#FFAA00', detail: "developer" });//Developer
        }
        if (((api?.achievements?.bedwars_level ?? 0) < 15 && (api?.stats?.Bedwars?.final_kills_bedwars ?? 0) / (api?.stats?.Bedwars?.final_deaths_bedwars ?? 0) > 5)
            || ((api?.achievements?.bedwars_level ?? 0) > 15 && (api?.achievements?.bedwars_level ?? 0) < 100 && (api?.achievements?.bedwars_level ?? 0) / ((api?.stats?.Bedwars?.final_kills_bedwars ?? 0) / (api?.stats?.Bedwars?.final_deaths_bedwars ?? 0)) <= 5)) {
            tags.value = Math.max(tags.value, 50);
            tags.data.push({ text: 'A', color: '#FFFF00', detail: "alt" });//Alt
        }
        if ((api?.achievements?.bedwars_level ?? 0) < 150 && (api?.stats?.Bedwars?.final_deaths_bedwars ?? 0) / (api?.stats?.Bedwars?.losses_bedwars ?? 0) < 0.75 && (api?.stats?.Bedwars?.final_kills_bedwars ?? 0) / (api?.stats?.Bedwars?.final_deaths_bedwars ?? 0) < 1.5) {
            tags.value = Math.max(tags.value, 30);
            tags.data.push({ text: 'S', color: '#FFFF00', detail: "sniper" });//Sniper
        }
        if (api.channel == 'PARTY') {
            tags.value = Math.max(tags.value, 10);
            tags.data.push({ text: 'P', color: '#FFFF00', detail: "potential_party" });//Potential Party
        }
        if (guild_id != '' && guild_id == this.owner_guild_id) {
            tags.value = Math.max(tags.value, 90);
            tags.data.push({ text: 'G', color: '#55FF55', detail: "same_guild" });//Same Guild
        }
        if (blacklist.player != null && blacklist.player.find(x => x.uuid == uuid) != null) {
            tags.value = Math.max(tags.value, 60);
            tags.data.push({ text: 'H', color: '#FF5555', detail: "blacklist_player" });//Blacklist Player
        }
        if (blacklist.guild != null && guild_id != '' && blacklist.guild.find(x => x._id == guild_id) != null) {
            tags.value = Math.max(tags.value, 60);
            tags.data.push({ text: 'G', color: '#FF5555', detail: "blacklist_guild" });//Blacklist Guild
        }
        return tags;
    }
    getMiniData = (name, type, sub) => {
        if (this.data[name].nick) return [{ format: name, value: name }, 'NICK'];
        let api = this.data[name].player;
        let lvl = this.getLevel(api?.networkExp ?? 0);
        let basic = {
            name: formatColor(this.formatName(name)),
            lvl: buildSpan(lvlList.lvl, lvl, '[', ']'),
            nick: false
        };
        if (type == 'bw')
            return [basic.lvl, { format: `${formatBwLevel(api.achievements?.bedwars_level ?? 1)}${basic.name}`, value: api.achievements?.bedwars_level ?? 1 },
            buildSpan(wsColorList.bw, api.stats?.Bedwars?.winstreak ?? '?'),
            buildSpan(kdrColorList.bw, ((api.stats?.Bedwars?.[`${sub}final_kills_bedwars`] ?? 0) / (api.stats?.Bedwars?.[`${sub}final_deaths_bedwars`] ?? 0)).toFixed(2)),
            buildSpan(wlrColorList.bw, ((api.stats?.Bedwars?.[`${sub}wins_bedwars`] ?? 0) / (api.stats?.Bedwars?.[`${sub}losses_bedwars`] ?? 0)).toFixed(2)),
            buildSpan(finalsColorList.bw, api.stats?.Bedwars?.[`${sub}final_kills_bedwars`] ?? 0),
            buildSpan(winsColorList.bw, api.stats?.Bedwars?.[`${sub}wins_bedwars`] ?? 0)];
        if (type == 'sw') {
            let level = api.stats?.SkyWars?.levelFormatted ?? '§71⋆';
            return [basic.lvl, { format: `${formatColor(`${level.substring(0, 2)}[${level.substring(2)}]`)}${basic.name}`, value: new Number(level.substring(2)) },
            buildSpan(wsColorList.sw, api.stats?.SkyWars?.win_streak ?? '?'),
            buildSpan(kdrColorList.sw, ((api.stats?.SkyWars?.[`kills${sub}`] ?? 0) / (api.stats?.SkyWars?.[`deaths${sub}`] ?? 0)).toFixed(2)),
            buildSpan(wlrColorList.sw, ((api.stats?.SkyWars?.[`wins${sub}`] ?? 0) / (api.stats?.SkyWars?.[`losses${sub}`] ?? 0)).toFixed(2)),
            buildSpan(finalsColorList.sw, api.stats?.SkyWars?.[`kills${sub}`] ?? 0),
            buildSpan(winsColorList.sw, api.stats?.SkyWars?.[`wins${sub}`] ?? 0)];
        }
        if (type == 'mm')
            return [basic.lvl, { format: basic.name, value: api.displayname },
            buildSpan(wlrColorList.mm, (100 * (api.stats?.MurderMystery?.[`wins${sub}`] ?? 0) / (api.stats?.MurderMystery?.[`games${sub}`] ?? 0)).toFixed(1), '', '%'),
            buildSpan(finalsColorList.mm, api.stats?.MurderMystery?.[`kills${sub}`] ?? 0),
            buildSpan(probabilityList.murderer_chance, (api.stats?.MurderMystery?.murderer_chance ?? 0), '', '%'),
            buildSpan(probabilityList.detective_chance, (api.stats?.MurderMystery?.detective_chance ?? 0), '', '%'),
            buildSpan(probabilityList.alpha_chance, (api.stats?.MurderMystery?.alpha_chance ?? 0), '', '%')];
        if (type == 'duel')
            return [basic.lvl, { format: `${pickDuelLvl(api.stats?.Duels?.wins ?? 0)}${basic.name}`, value: api.stats?.Duels?.wins ?? 0 },
            buildSpan(wsColorList.duel, api.stats?.Duels?.current_winstreak ?? '?'),
            buildSpan(kdrColorList.duel, ((api.stats?.Duels?.kills ?? 0) / (api.stats?.Duels?.deaths ?? 0)).toFixed(2)),
            buildSpan(wlrColorList.duel, ((api.stats?.Duels?.wins ?? 0) / (api.stats?.Duels?.losses ?? 0)).toFixed(2)),
            buildSpan(finalsColorList.duel, api.stats?.Duels?.kills ?? 0),
            buildSpan(winsColorList.duel, api.stats?.Duels?.wins ?? 0)];
        if (type == 'uhc')
            return [basic.lvl, { format: basic.name, value: api.displayname },
            buildSpan(specialList.uhc_score, api.stats?.UHC?.score ?? 0),
            buildSpan(kdrColorList.uhc, ((api.stats?.UHC?.[`kills${sub}`] ?? 0) / (api.stats?.UHC?.[`deaths${sub}`] ?? 0)).toFixed(2)),
            buildSpan(wlrColorList.uhc, ((api.stats?.UHC?.[`wins${sub}`] ?? 0) / (api.stats?.UHC?.[`deaths${sub}`] ?? 0)).toFixed(2)),
            buildSpan(finalsColorList.uhc, api.stats?.UHC?.[`kills${sub}`] ?? 0),
            buildSpan(winsColorList.uhc, api.stats?.UHC?.[`wins${sub}`] ?? 0)];
        if (type == 'mw')
            return [basic.lvl, { format: basic.name, value: api.displayname },
            buildSpan(kdrColorList.mw, ((api.stats?.Walls3?.final_kills ?? 0) / (api.stats?.Walls3?.final_deaths ?? 0)).toFixed(2)),
            buildSpan(wlrColorList.mw, ((api.stats?.Walls3?.wins ?? 0) / (api.stats?.Walls3?.losses ?? 0)).toFixed(2)),
            buildSpan(finalsColorList.mw, api.stats?.Walls3?.final_kills ?? 0),
            buildSpan(winsColorList.mw, api.stats?.Walls3?.wins ?? 0),
            buildSpan(specialList.mw_wither_damage, api.stats?.Walls3?.wither_damage ?? 0)];
        if (type == 'ww')
            return [basic.lvl, { format: basic.name, value: api.displayname },
            buildSpan(kdrColorList.ww, ((api.stats?.WoolGames?.wool_wars?.stats?.kills ?? 0) / (api.stats?.WoolGames?.wool_wars?.stats?.deaths ?? 0)).toFixed(2)),
            buildSpan(wlrColorList.ww, ((api.stats?.WoolGames?.wool_wars?.stats?.wins ?? 0) / (api.stats?.WoolGames?.wool_wars?.stats?.games_played ?? 0)).toFixed(2)),
            buildSpan(finalsColorList.ww, api.stats?.WoolGames?.wool_wars?.stats?.kills ?? 0),
            buildSpan(winsColorList.ww, api.stats?.WoolGames?.wool_wars?.stats?.wins ?? 0),
            buildSpan(specialList.ww_wool_placed, api.stats?.WoolGames?.wool_wars?.stats?.wool_placed ?? 0)];
        if (type == 'bsg')
            return [basic.lvl, { format: basic.name, value: api.displayname },
            buildSpan(wlrColorList.mm, ((api.stats?.Blitz?.wins ?? 0) / (api.stats?.Blitz?.games_played ?? 0)).toFixed(2) * 100, '', '%'),
            buildSpan(winsColorList.sw, api.stats?.Blitz?.wins ?? 0),
            buildSpan(kdrColorList.sw, ((api.stats?.Blitz?.kills ?? 0) / (api.stats?.Blitz?.deaths ?? 0)).toFixed(2)),
            buildSpan(finalsColorList.sw, api.stats?.Blitz?.kills ?? 0),
            buildSpan(specialList.uhc_score, api.stats?.Blitz?.games_played ?? 0)];
    }
    getToolTipData = (name) => {
        if (this.data[name].nick) return ['?', '?'];
        let player = this.data[name].player;
        return [formatNameString(player.userLanguage ?? 'ENGLISH'), formatColor(this.getGuildName(name))];
    }
    getGuild = (lang, name) => getGuild[lang](this.data[name].guild, this.uuids[name]);
    getStatus = async (lang, name) => {
        const b = await window.go.main.App.Fetch(`https://api.hypixel.net/status?key=${this.apiKey}&uuid=${await this.getPlayerUuid(name)}`)
            .catch(reason => console.log(reason))
            .then(res => JSON.parse(res.Body));
        if (!b.success)
            return $.id('status').innerHTML = b.cause;
        return getStatus[lang](b.session);
    }
}

const colorList = ['7', 'f', 'a', 'b', 'c', '6'];
const lvlList = {
    lvl: [50, 100, 150, 200, 250]
}, wsColorList = {
    bw: [4, 10, 25, 50, 100],
    sw: [50, 100, 150, 200, 250],
    duel: [4, 10, 25, 50, 100]
}, kdrColorList = {
    bw: [1, 3, 5, 10, 25],
    sw: [1, 2, 3, 4, 5],
    duel: [1, 2, 3, 5, 7.5],
    uhc: [1, 2, 3, 5, 7.5],
    mw: [1, 2, 3, 5, 7.5],
    ww: [1, 2, 3, 5, 7.5]
}, wlrColorList = {
    bw: [1, 2, 5, 7, 10],
    sw: [0.1, 0.25, 0.5, 0.75, 1],
    mm: [70, 80, 85, 90, 95, 100],
    duel: [1, 2, 3, 5, 7.5],
    uhc: [1, 2, 3, 5, 7.5],
    mw: [1, 2, 3, 5, 7.5],
    ww: [1, 2, 3, 5, 7.5]
}, bblrColorList = {
    bw: [1, 2, 3, 5, 7.5]
}, finalsColorList = {
    bw: [1000, 5000, 10000, 20000, 30000],
    sw: [1000, 5000, 15000, 30000, 75000],
    mm: [500, 1000, 4000, 10000, 20000],
    duel: [500, 1500, 4000, 10000, 17500],
    uhc: [100, 200, 400, 800, 1600],
    mw: [100, 200, 400, 800, 1600],
    ww: [100, 200, 400, 800, 1600]
}, winsColorList = {
    bw: [500, 1000, 3000, 5000, 10000],
    sw: [100, 750, 4000, 10000, 25000],
    duel: [500, 1500, 4000, 10000, 17500],
    uhc: [100, 200, 400, 800, 1600],
    mw: [100, 200, 400, 800, 1600],
    ww: [100, 200, 400, 800, 1600]
}, probabilityList = {
    murderer_chance: [1, 3, 5, 10, 15],
    detective_chance: [1, 3, 5, 10, 15],
    alpha_chance: [1, 3, 5, 10, 15],
}, specialList = {
    ww_wool_placed: [100, 200, 400, 800, 1600],
    mw_wither_damage: [1000, 2000, 4000, 8000, 16000],
    uhc_score: [100, 200, 400, 800, 1600]
}
const pickColor = (list, value) => colorList[toDefault(list.indexOf(list.find(v => v >= value)), -1, 5)];
const buildSpan = (list, value, prefix, suffix) => {
    return { format: formatColor(`§${pickColor(list, value)}${prefix ?? ''}${value}${suffix ?? ''}`), value: value }
};

const duelLvlList = [
    { lvl: 100, txt: '' },
    { lvl: 120, txt: '§7[I]' }, { lvl: 140, txt: '§7[II]' }, { lvl: 160, txt: '§7[III]' }, { lvl: 180, txt: '§7[IV]' }, { lvl: 200, txt: '§7[V]' },
    { lvl: 260, txt: '§f[I]' }, { lvl: 320, txt: '§f[II]' }, { lvl: 380, txt: '§f[III]' }, { lvl: 440, txt: '§f[IV]' }, { lvl: 500, txt: '§f[V]' },
    { lvl: 600, txt: '§6[I]' }, { lvl: 700, txt: '§6[II]' }, { lvl: 800, txt: '§6[III]' }, { lvl: 900, txt: '§6[IV]' }, { lvl: 1000, txt: '§6[V]' },
    { lvl: 1200, txt: '§3[I]' }, { lvl: 1400, txt: '§3[II]' }, { lvl: 1600, txt: '§3[III]' }, { lvl: 1800, txt: '§3[IV]' }, { lvl: 2000, txt: '§3[V]' },
    { lvl: 2400, txt: '§2[I]' }, { lvl: 2800, txt: '§2[II]' }, { lvl: 3200, txt: '§2[III]' }, { lvl: 3600, txt: '§2[IV]' }, { lvl: 4000, txt: '§2[V]' },
    { lvl: 5200, txt: '§4[I]' }, { lvl: 6400, txt: '§4[II]' }, { lvl: 7600, txt: '§4[III]' }, { lvl: 8800, txt: '§4[IV]' }, { lvl: 10000, txt: '§4[V]' },
    { lvl: 12000, txt: '§e[I]' }, { lvl: 14000, txt: '§e[II]' }, { lvl: 16000, txt: '§e[III]' }, { lvl: 18000, txt: '§e[IV]' }, { lvl: 20000, txt: '§e[V]' },
    { lvl: 24000, txt: '§5[I]' }, { lvl: 28000, txt: '§5[II]' }, { lvl: 32000, txt: '§5[III]' }, { lvl: 36000, txt: '§5[IV]' }, { lvl: 40000, txt: '§5[V]' },
    { lvl: 44000, txt: '§5[VI]' }, { lvl: 48000, txt: '§5[VII]' }, { lvl: 52000, txt: '§5[VII]' }, { lvl: 56000, txt: '§5[IX]' }, { lvl: Infinity, txt: '§5[X]' },
], pickDuelLvl = (wins) => formatColor(duelLvlList.find(x => x.lvl >= wins).txt);

const bwLvlProvider = [
    (lvl) => `§7[${lvl}✪]`,
    (lvl) => `§f[${lvl}✪]`,
    (lvl) => `§6[${lvl}✪]`,
    (lvl) => `§b[${lvl}✪]`,
    (lvl) => `§2[${lvl}✪]`,
    (lvl) => `§3[${lvl}✪]`,
    (lvl) => `§4[${lvl}✪]`,
    (lvl) => `§d[${lvl}✪]`,
    (lvl) => `§9[${lvl}✪]`,
    (lvl) => `§5[${lvl}✪]`,
    (lvl) => `§c[§61§e${Math.floor((lvl % 1000) / 100)}§a${Math.floor((lvl % 100) / 10)}§b${lvl % 10}§d✫§5]`,
    (lvl) => `§7[§f${lvl}§7✪§7]`,
    (lvl) => `§7[§e${lvl}§6✪§7]`,
    (lvl) => `§7[§e${lvl}§6✪§7]`,
    (lvl) => `§7[§b${lvl}§3✪§7]`,
    (lvl) => `§7[§a${lvl}§2✪§7]`,
    (lvl) => `§7[§3${lvl}§9✪§7]`,
    (lvl) => `§7[§c${lvl}§4✪§7]`,
    (lvl) => `§7[§d${lvl}§5✪§7]`,
    (lvl) => `§7[§9${lvl}§1✪§7]`,
    (lvl) => `§7[§5${lvl}§8✪§7]`,
    (lvl) => `§8[§72§f${Math.floor(lvl / 10 % 100)}§7${lvl % 10}✪§8]`,
    (lvl) => `§f[2§e${Math.floor(lvl / 10 % 100)}§6${lvl % 10}⚝]`,
    (lvl) => `§6[2§f${Math.floor(lvl / 10 % 100)}§b${lvl % 10}§3⚝]`,
    (lvl) => `§5[2§d${Math.floor(lvl / 10 % 100)}§6${lvl % 10}§e⚝]`,
    (lvl) => `§b[2§f${Math.floor(lvl / 10 % 100)}§7${lvl % 10}⚝§8]`,
    (lvl) => `§f[2§a${Math.floor(lvl / 10 % 100)}§2${lvl % 10}⚝]`,
    (lvl) => `§4[2§c${Math.floor(lvl / 10 % 100)}§d${lvl % 10}⚝§5]`,
    (lvl) => `§e[2§f${Math.floor(lvl / 10 % 100)}§8${lvl % 10}⚝]`,
    (lvl) => `§a[${Math.floor(lvl / 1000)}§2${Math.floor(lvl / 100 % 10)}${Math.floor(lvl / 10 % 10)}§6${lvl % 10}⚝§c]`,
    (lvl) => `§b[${Math.floor(lvl / 1000)}§3${Math.floor(lvl / 100 % 10)}${Math.floor(lvl / 10 % 10)}§9${lvl % 10}⚝§1]`
], bwLvlProviderMax = (lvl) => `§e[3§6${Math.floor(lvl / 10 % 100)}§c${lvl % 10}⚝§4]`;
const formatBwLevel = (lvl) => {
    let i = Math.floor(lvl / 100);
    let ret = bwLvlProvider[i];
    if (ret == null) ret = bwLvlProviderMax;
    return formatColor(ret(lvl));
}

//searcher
export const modeList = ['bw', 'sw', 'mm', 'duel', 'uhc', 'mw', 'bb', 'bsg'];

// 在等级 10 * k 至 10 * (k + 1) 时, 升一级所需经验
const expReqPhased = [15, 30, 50, 75, 125, 300, 600, 800, 900, 1000, 1200, 1500];
// 在精通 k 时, 升一级所需经验需要乘以的倍数
const presMultipl = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 45, 50, 75, 100, 101, 101, 101, 101, 101];
export const getThePitLevel = (pitProfile) => {
    level = 0;
    let xp = pitProfile.xp ?? 0;
    for (let i = 0; i < presMultipl.length; i++)
        for (let j = 0; j < expReqPhased.length; j++)
            for (let k = 0; k < 10; k++) {
                if (xp < expReqPhased[j] * presMultipl[i]) return level % 120;
                xp -= expReqPhased[j] * presMultipl[i];
                level++;
            }
}

export const socialMediaList = ['DISCORD', 'HYPIXEL', 'TWITCH', 'TWITTER', 'YOUTUBE'];
export const getSocialMedia = (platform, api) => api?.socialMedia?.links[platform] ?? null;