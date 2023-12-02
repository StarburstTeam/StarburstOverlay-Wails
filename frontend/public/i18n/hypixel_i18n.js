import { formatNameString, formatDateTime, formatColor, formatColorFromString } from "../util";
import { getThePitLevel } from "../hypixel";

export const getData = {
    'en_us': {
        "ov": (api) => {
            let achievements = api.achievements ?? {};
            return `Level : ${(api.networkExp ?? 0) < 0 ? 1 : (1 - 3.5 + Math.sqrt(12.25 + 0.0008 * (api.networkExp ?? 0))).toFixed(2)}<br>
          Karma : ${api.karma ?? 0}<br>
          Achievement Point :  ${api.achievementPoints ?? 0}<br>
          Complete Quest : ${achievements.general_quest_master ?? 0}<br>
          Complete Challenge : ${achievements.general_challenger ?? 0}<br>
          Language : ${formatNameString(api.userLanguage ?? 'ENGLISH')}<br>
          Rank Gifted : ${api?.giftingMeta?.ranksGiven ?? 0}<br>
          First Login : ${formatDateTime(api.firstLogin)}<br>
          Last Login &nbsp;: ${formatDateTime(api.lastLogin)}<br>
          Last Logout : ${formatDateTime(api.lastLogout)}`;//&nbsp; is space in html
        },
        "bw": (api) => {
            let achievements = api.achievements ?? {};
            let bedwar = api.stats?.Bedwars ?? {};
            return `Level : ${achievements.bedwars_level ?? 0} | Coins : ${bedwar.coins ?? 0}<br>
          Winstreak : ${bedwar.winstreak ?? 0}<br>
          Bed Destroy : ${bedwar.beds_broken_bedwars ?? 0} | Bed Lost : ${bedwar.beds_lost_bedwars ?? 0}<br>
          Win : ${bedwar.wins_bedwars ?? 0} | Loss : ${bedwar.losses_bedwars ?? 0} | W/L : ${((bedwar.wins_bedwars ?? 0) / (bedwar.losses_bedwars ?? 0)).toFixed(2)}<br>
          Kill : ${bedwar.kills_bedwars ?? 0} | Death : ${bedwar.deaths_bedwars ?? 0} | K/D : ${((bedwar.kills_bedwars ?? 0) / (bedwar.deaths_bedwars ?? 0)).toFixed(2)}<br>
          Final Kill : ${bedwar.final_kills_bedwars ?? 0} | Final Death : ${bedwar.final_deaths_bedwars ?? 0}<br>
          FKDR : ${((bedwar.final_kills_bedwars ?? 0) / (bedwar.final_deaths_bedwars ?? 0)).toFixed(2)}<br>
          Iron : ${bedwar.iron_resources_collected_bedwars ?? 0} | Gold : ${bedwar.gold_resources_collected_bedwars ?? 0}<br>
          Diamond : ${bedwar.diamond_resources_collected_bedwars ?? 0} | Emerald : ${bedwar.emerald_resources_collected_bedwars ?? 0}`;
        },
        "sw": (api) => {
            let skywar = api.stats?.SkyWars ?? {};
            return `Level : ${formatColor(skywar.levelFormatted)} | Soul : ${skywar.souls ?? 0}<br>
          Coins : ${skywar.coins ?? 0} | Assists : ${skywar.assists ?? 0}<br>
          Kills : ${skywar.kills ?? 0} | Deaths : ${skywar.deaths ?? 0} | K/D : ${((skywar.kills ?? 0) / (skywar.deaths ?? 0)).toFixed(2)}<br>
          Wins : ${skywar.wins ?? 0} | Losses : ${skywar.losses ?? 0} | W/L : ${((skywar.wins ?? 0) / (skywar.losses ?? 0)).toFixed(2)}`;
        },
        "mm": (api) => {
            let mm = api.stats?.MurderMystery ?? {};
            return `Coins : ${mm.coins ?? 0} | Gold Collected : ${mm.coins_pickedup ?? 0}<br>
          Murder Chance : ${mm.murderer_chance ?? 0}%<br>
          Detective Chance : ${mm.detective_chance ?? 0}%<br>
          Wins : ${mm.wins ?? 0} | Win Rate : ${(100 * (mm.wins ?? 0) / (mm.games ?? 0)).toFixed(2)}%<br>
          Kills : ${mm.kills ?? 0} | Deaths : ${mm.deaths ?? 0}<br>
          Knife Kills : ${mm.knife_kills ?? 0} | Bow Kills : ${mm.bow_kills ?? 0}<br>
          Kills As Murderer : ${mm.kills_as_murderer ?? 0} | Heroes : ${mm.was_hero ?? 0}<br>
          Kills As Infected : ${mm.kills_as_infected ?? 0}<br>
          Kills As Survivor : ${mm.kills_as_survivor ?? 0}<br>
          Longest Time Survive : ${mm.longest_time_as_survivor_seconds ?? 0}s<br>
          Alpha Chance : ${mm.alpha_chance ?? 0}%`
        },
        "duel": (api) => {
            let duel = api.stats?.Duels ?? {};
            return `Coins : ${duel.coins ?? 0} | Ping Preference : ${duel.pingPreference ?? 200}ms<br>
          Wins : ${duel.wins ?? 0} | Losses : ${duel.losses} | W/L : ${((duel.wins ?? 0) / (duel.losses ?? 0)).toFixed(2)}<br>
          Best Winstreak : ${duel.best_all_modes_winstreak ?? '?'} | Current Winstreak : ${duel.current_winstreak ?? '?'}<br>
          Kills : ${duel.kills ?? 0} | Deaths : ${duel.deaths ?? 0} | K/D : ${((duel.kills ?? 0) / (duel.deaths ?? 0)).toFixed(2)}<br>`
        },
        "uhc": (api) => {
            let uhc = api.stats?.UHC ?? {};
            return `Score : ${uhc.score ?? 0} | Coins : ${uhc.coins ?? 0} | Wins : ${uhc.wins ?? 0}<br>
          Kills : ${uhc.kills ?? 0} | Deaths : ${uhc.deaths ?? 0} | K/D : ${((uhc.kills ?? 0) / (uhc.deaths ?? 0)).toFixed(2)}<br>`
        },
        "mw": (api) => {
            let mw = api.stats?.Walls3 ?? {};
            return `Coins : ${mw.coins ?? 0} | Wither Damage : ${mw.wither_damage ?? 0}<br>
          Chosen Class : ${formatNameString(mw.chosen_class ?? 'None')}<br>
          Wins : ${mw.wins ?? 0} | Losses : ${mw.losses ?? 0} | W/L : ${((mw.wins ?? 0) / (mw.losses ?? 0)).toFixed(2)}<br>
          Kills : ${mw.kills ?? 0} | Deaths : ${mw.deaths ?? 0}<br>
          K/D : ${((mw.kills ?? 0) / (mw.deaths ?? 0)).toFixed(2)} | Assists : ${mw.assists ?? 0}<br>
          Final kills : ${mw.final_kills ?? 0} | Final deaths : ${mw.final_deaths ?? 0}<br>
          FKDR : ${((mw.final_kills ?? 0) / (mw.final_deaths ?? 0)).toFixed(2)} | Final Assists : ${mw.final_assists ?? 0}<br>`
        },
        "bb": (api) => {
            let bb = api.stats?.BuildBattle ?? {};
            return `Game played : ${bb.games_played ?? 0} | Score : ${bb.score ?? 0} | Wins : ${bb.wins ?? 0}<br>
          Solo-Normal wins : ${(bb.wins_solo_normal ?? 0) + (bb.wins_solo_normal_latest ?? 0)} | Team-Normal wins : ${bb.wins_teams_normal ?? 0}<br>
          Solo-Pro wins : ${bb.wins_solo_pro ?? 0} | Guess the build wins : ${bb.wins_guess_the_build ?? 0}<br>`
        },
        "pit": (api) => {
            let profile = api.stats?.Pit?.profile ?? {};
            let pit_stats_ptl = api.stats?.Pit?.pit_stats_ptl ?? {};
            return `Level : ${getThePitLevel(profile) ?? 0} | Prestiges : ${profile.prestiges ?? ['None']}<br>
          Kills : ${pit_stats_ptl.kills ?? 0} | Deaths : ${pit_stats_ptl.deaths ?? 0}<br>
          Assists : ${pit_stats_ptl.assists ?? 0} | Max Kill Streak : ${pit_stats_ptl.max_streak ?? 0}<br>
          K/D : ${((pit_stats_ptl.kills ?? 0) / (pit_stats_ptl.deaths ?? 0)).toFixed(2)} | 
          K+A/D : ${(((pit_stats_ptl.kills ?? 0) + (pit_stats_ptl.assists ?? 0)) / (pit_stats_ptl.deaths ?? 0)).toFixed(2)}<br>`
        },
        "bsg": (api) => {
            let bsg = api.stats?.Blitz ?? {};
            return `Coins : ${bsg.coins ?? 0} | Chests Opened : ${bsg.chests_opened ?? 0}<br>
          Games Played : ${bsg.games_played ?? 0} | Wins : ${bsg.wins ?? 0}<br>
          Kills : ${bsg.kills ?? 0} | Deaths : ${bsg.deaths ?? 0} | K/D : ${((bsg.kills ?? 0) / (bsg.deaths ?? 0)).toFixed(2)}<br>`
        },
        "arcade": (api) => {
            let arcade = api.stats?.Arcade ?? {};
            return `Coins : ${arcade.coins ?? 0}<br>
          Zombie : <br>
          Total Rounds Survived : ${arcade.total_rounds_survived_zombies ?? 0} | Wins : ${arcade.wins_zombies ?? 0}<br>
          Hit Rate : ${(100 * (arcade.bullets_hit_zombies ?? 0) / (arcade.bullets_shot_zombies ?? 0)).toFixed(2)}% | 
          Head Shot Rate : ${(100 * (arcade.headshots_zombies ?? 0) / (arcade.bullets_hit_zombies ?? 0)).toFixed(2)}%<br>
          Wins or Best Round : (Map : Normal/Hard/RIP)<br>
          Dead End : ${getRoundValue['en_us'](arcade, 'deadend', 'normal')} / ${getRoundValue['en_us'](arcade, 'deadend', 'hard')} / ${getRoundValue['en_us'](arcade, 'deadend', 'rip')}<br>
          Bad Blood : ${getRoundValue['en_us'](arcade, 'badblood', 'normal')} / ${getRoundValue['en_us'](arcade, 'badblood', 'hard')} / ${getRoundValue['en_us'](arcade, 'badblood', 'rip')}<br>
          Alien Arcadium : ${getRoundValue['en_us'](arcade, 'alienarcadium', 'normal')}<br>`
        }
    },
    'zh_cn': {
        "ov": (api) => {
            let achievements = api.achievements ?? {};
            return `等级：${(api.networkExp ?? 0) < 0 ? 1 : (1 - 3.5 + Math.sqrt(12.25 + 0.0008 * (api.networkExp ?? 0))).toFixed(2)} | 人品：${api.karma ?? 0}<br>
            成就点数：${api.achievementPoints ?? 0}<br>
            完成任务：${achievements.general_quest_master ?? 0} | 完成挑战：${achievements.general_challenger ?? 0}<br>
            语言：${formatNameString(api.userLanguage ?? 'ENGLISH')} | Rank赠送：${api?.giftingMeta?.ranksGiven ?? 0}<br>
            首次登入：${formatDateTime(api.firstLogin)}<br>
            上次登入：${formatDateTime(api.lastLogin)}<br>
            上次登出：${formatDateTime(api.lastLogout)}`;
        },
        "bw": (api) => {
            let achievements = api.achievements ?? {};
            let bedwar = api.stats?.Bedwars ?? {};
            return `等级：${achievements.bedwars_level ?? 0} | 硬币：${bedwar.coins ?? 0}<br>
            连胜：${bedwar.winstreak ?? 0}<br>
            破坏床数：${bedwar.beds_broken_bedwars ?? 0} | 被破坏床数：${bedwar.beds_lost_bedwars ?? 0}<br>
            胜场：${bedwar.wins_bedwars ?? 0} | 败场：${bedwar.losses_bedwars ?? 0} | W/L：${((bedwar.wins_bedwars ?? 0) / (bedwar.losses_bedwars ?? 0)).toFixed(2)}<br>
            击杀：${bedwar.kills_bedwars ?? 0} | 死亡：${bedwar.deaths_bedwars ?? 0} | K/D：${((bedwar.kills_bedwars ?? 0) / (bedwar.deaths_bedwars ?? 0)).toFixed(2)}<br>
            最终击杀：${bedwar.final_kills_bedwars ?? 0} | 最终死亡：${bedwar.final_deaths_bedwars ?? 0} | FKDR：${((bedwar.final_kills_bedwars ?? 0) / (bedwar.final_deaths_bedwars ?? 0)).toFixed(2)}<br>
            铁锭收集：${bedwar.iron_resources_collected_bedwars ?? 0} | 金锭收集：${bedwar.gold_resources_collected_bedwars ?? 0}<br>
            钻石收集：${bedwar.diamond_resources_collected_bedwars ?? 0} | 绿宝石收集：${bedwar.emerald_resources_collected_bedwars ?? 0}<br>`;
        },
        "sw": (api) => {
            let skywar = api.stats?.SkyWars ?? {};
            return `等级：${formatColor(skywar.levelFormatted)} | 灵魂：${skywar.souls ?? 0}<br>
            硬币：${skywar.coins ?? 0} | 助攻：${skywar.assists ?? 0}<br>
            击杀：${skywar.kills ?? 0} | 死亡：${skywar.deaths ?? 0} | K/D：${((skywar.kills ?? 0) / (skywar.deaths ?? 0)).toFixed(2)}<br>
            胜场：${skywar.wins ?? 0} | 败场：${skywar.losses ?? 0} | W/L：${((skywar.wins ?? 0) / (skywar.losses ?? 0)).toFixed(2)}`;
        },
        "mm": (api) => {
            let mm = api.stats?.MurderMystery ?? {};
            return `硬币：${mm.coins ?? 0} | 金锭收集：${mm.coins_pickedup ?? 0}<br>
            杀手概率：${mm.murderer_chance ?? 0}% | 侦探概率：${mm.detective_chance ?? 0}%<br>
            胜场：${mm.wins ?? 0} | 胜率：${(100 * (mm.wins ?? 0) / (mm.games ?? 0)).toFixed(2)}%<br>
            击杀：${mm.kills ?? 0} | 死亡：${mm.deaths ?? 0}<br>
            飞刀击杀：${mm.knife_kills ?? 0} | 弓箭击杀：${mm.bow_kills ?? 0}<br>
            作为杀手击杀：${mm.kills_as_murderer ?? 0} | 英雄：${mm.was_hero ?? 0}<br>
            作为感染者击杀：${mm.kills_as_infected ?? 0} | 作为幸存者击杀：${mm.kills_as_survivor ?? 0}<br>
            最长存活时间：${mm.longest_time_as_survivor_seconds ?? 0}s | 母体概率：${mm.alpha_chance ?? 0}%`
        },
        "duel": (api) => {
            let duel = api.stats?.Duels ?? {};
            return `硬币：${duel.coins ?? 0} | Ping偏好：${duel.pingPreference ?? 200}ms<br>
            胜场：${duel.wins ?? 0} | 败场：${duel.losses} | W/L：${((duel.wins ?? 0) / (duel.losses ?? 0)).toFixed(2)}<br>
            最佳连胜：${duel.best_all_modes_winstreak ?? '?'} | 目前连胜：${duel.current_winstreak ?? '?'}<br>
            击杀：${duel.kills ?? 0} | 死亡：${duel.deaths ?? 0} | K/D：${((duel.kills ?? 0) / (duel.deaths ?? 0)).toFixed(2)}`
        },
        "uhc": (api) => {
            let uhc = api.stats?.UHC ?? {};
            return `分数：${uhc.score ?? 0} | 硬币：${uhc.coins ?? 0} | 胜场：${uhc.wins ?? 0}<br>
            击杀：${uhc.kills ?? 0} | 死亡：${uhc.deaths ?? 0} | K/D：${((uhc.kills ?? 0) / (uhc.deaths ?? 0)).toFixed(2)}`
        },
        "mw": (api) => {
            let mw = api.stats?.Walls3 ?? {};
            return `硬币：${mw.coins ?? 0} | 凋零伤害${mw.wither_damage ?? 0}<br>
            职业：${formatNameString(mw.chosen_class ?? 'None')}<br>
            胜场：${mw.wins ?? 0} | 败场：${mw.losses ?? 0} | W/L：${((mw.wins ?? 0) / (mw.losses ?? 0)).toFixed(2)}<br>
            击杀：${mw.kills ?? 0} | 死亡：${mw.deaths ?? 0}<br>
            K/D：${((mw.kills ?? 0) / (mw.deaths ?? 0)).toFixed(2)} | 助攻：${mw.assists ?? 0}<br>
            最终击杀：${mw.final_kills ?? 0} | 最终死亡：${mw.final_deaths ?? 0}<br>
            FKDR：${((mw.final_kills ?? 0) / (mw.final_deaths ?? 0)).toFixed(2)} | 最终助攻：${mw.final_assists ?? 0}`
        },
        "bb": (api) => {
            let bb = api.stats?.BuildBattle ?? {};
            return `游玩次数：${bb.games_played ?? 0} | 分数：${bb.score ?? 0} | 胜场：${bb.wins ?? 0}<br>
            单人模式胜场：${(bb.wins_solo_normal ?? 0) + (bb.wins_solo_normal_latest ?? 0)} | 团队模式胜场：${bb.wins_teams_normal ?? 0}<br>
            高手模式胜场：${bb.wins_solo_pro ?? 0} | 建筑猜猜乐胜场：${bb.wins_guess_the_build ?? 0}`
        },
        "pit": (api) => {
            let profile = api.stats?.Pit?.profile ?? {};
            let pit_stats_ptl = api.stats?.Pit?.pit_stats_ptl ?? {};
            return `等级：${getThePitLevel(profile) ?? 0} | 精通：${profile.prestiges ?? ['None']}<br>
            击杀：${pit_stats_ptl.kills ?? 0} | 死亡：${pit_stats_ptl.deaths ?? 0}<br>
            助攻：${pit_stats_ptl.assists ?? 0} | 最大连续击杀：${pit_stats_ptl.max_streak ?? 0}<br>
            K/D：${((pit_stats_ptl.kills ?? 0) / (pit_stats_ptl.deaths ?? 0)).toFixed(2)} | 
            K+A/D：${(((pit_stats_ptl.kills ?? 0) + (pit_stats_ptl.assists ?? 0)) / (pit_stats_ptl.deaths ?? 0)).toFixed(2)}`
        },
        "bsg": (api) => {
            let bsg = api.stats?.Blitz ?? {};
            return `硬币：${bsg.coins ?? 0} | 打开箱子数：${bsg.chests_opened ?? 0}<br>
            游玩次数：${bsg.games_played ?? 0} | 胜场：${bsg.wins ?? 0}<br>
            击杀：${bsg.kills ?? 0} | 死亡：${bsg.deaths ?? 0} | K/D：${((bsg.kills ?? 0) / (bsg.deaths ?? 0)).toFixed(2)}`
        },
        "arcade": (api) => {
            let arcade = api.stats?.Arcade ?? {};
            return `硬币：${arcade.coins ?? 0}<br>
            僵尸末日：<br>
            总存活轮数：${arcade.total_rounds_survived_zombies ?? 0} | 总胜场：${arcade.wins_zombies ?? 0}<br>
            命中率：${(100 * (arcade.bullets_hit_zombies ?? 0) / (arcade.bullets_shot_zombies ?? 0)).toFixed(2)}% | 
            爆头率：${(100 * (arcade.headshots_zombies ?? 0) / (arcade.bullets_hit_zombies ?? 0)).toFixed(2)}%<br>
            胜场或最佳轮数：（地图：普通 / 困难 / 安息）<br>
            穷途末路：${getRoundValue['zh_cn'](arcade, 'deadend', 'normal')} / ${getRoundValue['zh_cn'](arcade, 'deadend', 'hard')} / ${getRoundValue['zh_cn'](arcade, 'deadend', 'rip')}<br>
            坏血之宫：${getRoundValue['en_us'](arcade, 'badblood', 'normal')} / ${getRoundValue['zh_cn'](arcade, 'badblood', 'hard')} / ${getRoundValue['zh_cn'](arcade, 'badblood', 'rip')}<br>
            外星游乐园：${getRoundValue['zh_cn'](arcade, 'alienarcadium', 'normal')}<br>`
        }
    }
}

const getRoundValue = {
    'en_us': (arcade, map, difficulty) => {
        if (arcade[`wins_zombies_${map}_${difficulty}`] ?? 0 > 0) return `${arcade[`wins_zombies_${map}_${difficulty}`]} Wins`;
        return `${arcade[`total_rounds_survived_zombies_${map}_${difficulty}`] ?? 0} Rounds`;
    },
    'zh_cn': (arcade, map, difficulty) => {
        if (arcade[`wins_zombies_${map}_${difficulty}`] ?? 0 > 0) return `${arcade[`wins_zombies_${map}_${difficulty}`]}胜场`;
        return `${arcade[`total_rounds_survived_zombies_${map}_${difficulty}`] ?? 0}轮`;
    }
}

export const getGuild = {
    'en_us': (guildJson, uuid) => {
        if (guildJson == null) return 'Guild : No Guild';
        let data = `Guild : ${guildJson.name}<br>
        Level : ${getGuildLevel(guildJson.exp).toFixed(2)}<br>
        Members : ${guildJson.members.length}<br>`
        let playerGuildJson = guildJson.members.find(member => member.uuid == uuid);
        let rankJson = guildJson.ranks.find(rank => rank.name == playerGuildJson.rank);
        if (playerGuildJson == null || rankJson == null) return data;
        return data + `Join Time : ${formatDateTime(playerGuildJson.joined)}<br>
        Rank : ${playerGuildJson.rank} (${formatColor(formatColorFromString(guildJson.tagColor ?? 'gray') + '[' + rankJson.tag + ']')})`;
    },
    'zh_cn': (guildJson, uuid) => {
        if (guildJson == null) return '公会 : 无';
        let data = `公会：${guildJson.name}<br>
        等级：${getGuildLevel(guildJson.exp).toFixed(2)}<br>
        玩家数：${guildJson.members.length}<br>`
        let playerGuildJson = guildJson.members.find(member => member.uuid == uuid);
        let rankJson = guildJson.ranks.find(rank => rank.name == playerGuildJson.rank);
        if (playerGuildJson == null || rankJson == null) return data;
        return data + `加入时间：${formatDateTime(playerGuildJson.joined)}<br>
        地位：${playerGuildJson.rank} (${formatColor(formatColorFromString(guildJson.tagColor ?? 'gray') + '[' + rankJson.tag + ']')})`;
    }
}

export const getStatus = {
    'en_us': (statusJson) => {
        if (statusJson.online)
            if (statusJson.map != null)
                return `Status : Online<br>Game Type : ${formatNameString(statusJson.gameType)}<br>Mode : ${formatNameString(statusJson.mode)}<br>Map : ${statusJson.map}`;
            else
                return `Status : Online<br>Game Type : ${formatNameString(statusJson.gameType)}<br>Mode : ${formatNameString(statusJson.mode)}`;
        else return `Status : Offline`;
    },
    'zh_cn': (statusJson) => {
        if (statusJson.online)
            if (statusJson.map != null)
                return `状态：在线<br>游戏类型：${formatNameString(statusJson.gameType)}<br>模式：${formatNameString(statusJson.mode)}<br>地图：${statusJson.map}`;
            else
                return `状态：在线<br>游戏类型 ：${formatNameString(statusJson.gameType)}<br>模式：${formatNameString(statusJson.mode)}`;
        else
            return `状态：离线`;
    }
}

const getGuildLevel = (exp) => {
    let guildLevelTables = [100000, 150000, 250000, 500000, 750000, 1000000, 1250000, 1500000, 2000000, 2500000, 2500000, 2500000, 2500000, 2500000, 3000000];
    let level = 0;
    for (let i = 0; ; i++) {
        let need = i >= guildLevelTables.length ? guildLevelTables[guildLevelTables.length - 1] : guildLevelTables[i];
        exp -= need;
        if (exp < 0) return level + 1 + exp / need;
        else level++;
    }
}



/** This method will try to replace ${} in template with all keys in data
 * 
 *  Example : data = {test: xxx, test2: yyy}, template = this is ${test} message by ${tester}
 * 
 *  => this is xxx message by ${tester}
 * 
 *  We don't use eval() since it's an unsafe method, especially when template reads from outer files
 */
const buildText = (data, template) => Object.keys(data).reduce((p, c) => p.replaceAll(`\${${c}}`, formatColor(data[c] + [], 15)), template.join('<br>'))

/**color=0 green↑ // color=1 red↑ */
const buildValue = (v1, v2, color) => {
    if (v2 == null) return v1;
    let s = v1 + ' -> ' + v2 + ' ';
    let delta = (v2 - v1).toFixed(v1 % 1 && v2 % 1 ? 0 : 2);
    if (v1 < v2) return `§${color ? 'c' : 'a'}${s} ↑${delta}`;
    if (v1 == v2) return `§e${s} ×0`;
    if (v1 > v2) return `§${color ? 'a' : 'c'}${s} ↓${-delta}`;
    return s;
}

const buildValues = (name1, name2, nameR, obj1, obj2, key1, key2, fixed = 2) => {
    let value1_1 = obj1?.[key1] ?? 0, value1_2 = obj1?.[key2] ?? 0, value2_1 = obj2?.[key1], value2_2 = obj2?.[key2];
    let result = {};
    result[name1] = buildValue(value1_1, value2_1);
    result[name2] = buildValue(value1_2, value2_2, true);
    let r1 = (value1_1 / value1_2).toFixed(fixed);
    if (value2_1 != null && value2_2 != null) result[nameR] = buildValue(r1, (value2_1 / value2_2).toFixed(fixed));
    else result[nameR] = buildValue(r1);
    return result;
}

//全局搜索页面只需要传入第一个api，session stats需要传入两个
export const buildData = {
    'ov': (i18n, api1, api2) => {
        let achievements1 = api1?.achievements ?? {}, achievements2 = api2?.achievements ?? {};
    },
    'bw': (i18n, api1, api2) => {
        let achievements1 = api1?.achievements ?? {}, achievements2 = api2?.achievements ?? {};
        let bedwar1 = api1.stats?.Bedwars ?? {}, bedwar2 = api2?.stats?.Bedwars ?? {};
        return buildText({
            level: buildValue(achievements1?.bedwars_level ?? 0, achievements2?.bedwars_level),
            coins: buildValue(bedwar1?.coins ?? 0, bedwar2?.coins),
            winstreak: buildValue(bedwar1?.winstreak ?? 0, bedwar2?.winstreak),
            ...buildValues('beds_broken', 'beds_lost', 'bblr', bedwar1, bedwar2, 'beds_broken_bedwars', 'beds_lost_bedwars'),
            ...buildValues('wins', 'losses', 'wl_rate', bedwar1, bedwar2, 'wins_bedwars', 'losses_bedwars'),
            ...buildValues('kills', 'deaths', 'kd_rate', bedwar1, bedwar2, 'kills_bedwars', 'deaths_bedwars'),
            ...buildValues('final_kills', 'final_deaths', 'fkdr', bedwar1, bedwar2, 'final_kills_bedwars', 'final_deaths_bedwars'),
            iron: buildValue(bedwar1?.iron_resources_collected_bedwars ?? 0, bedwar2?.iron_resources_collected_bedwars),
            gold: buildValue(bedwar1?.gold_resources_collected_bedwars ?? 0, bedwar2?.gold_resources_collected_bedwars),
            diamond: buildValue(bedwar1?.diamond_resources_collected_bedwars ?? 0, bedwar2?.diamond_resources_collected_bedwars),
            emerald: buildValue(bedwar1?.emerald_resources_collected_bedwars ?? 0, bedwar2?.emerald_resources_collected_bedwars),
        }, i18n.template().bw);
    },
    'sw': (i18n, api1, api2) => {
        let skywar1 = api1?.stats?.SkyWars ?? {}, skywar2 = api2?.stats?.SkyWars ?? {};
        return buildText({
            levelFormatted: buildValue(skywar1?.levelFormatted ?? '§71⋆', skywar2?.levelFormatted),
            souls: buildValue(skywar1?.souls ?? 0, skywar2?.souls),
            coins: buildValue(skywar1?.coins ?? 0, skywar2?.coins),
            assists: buildValue(skywar1?.assists ?? 0, skywar2?.assists),
            ...buildValues('kills', 'deaths', 'kd_rate', skywar1, skywar2, 'kills', 'deaths'),
            ...buildValues('wins', 'losses', 'wl_rate', skywar1, skywar2, 'wins', 'losses'),
        }, i18n.template().sw);
    },
    'mm': (i18n, api1, api2) => {
        let mm1 = api1?.stats?.MurderMystery ?? {}, mm2 = api2?.stats?.MurderMystery ?? {};
        return buildText({
            coins: buildValue(mm1?.coins ?? 0, mm2?.coins),
            coins_pickedup: buildValue(mm1?.coins_pickedup ?? 0, mm2?.coins_pickedup),
            murderer_chance: buildValue(mm1?.murderer_chance ?? 0, mm2?.murderer_chance),
            detective_chance: buildValue(mm1?.detective_chance ?? 0, mm2?.detective_chance),
            ...buildValues('wins', '_', 'win_rate', mm1, mm2, 'wins', 'games'),
            ...buildValues('kills', 'deaths', 'kd_rate', mm1, mm2, 'kills', 'deaths'),
            knife_kills: buildValue(mm1?.knife_kills ?? 0, mm2?.knife_kills),
            bow_kills: buildValue(mm1?.bow_kills ?? 0, mm2?.bow_kills),
            kills_as_murderer: buildValue(mm1?.kills_as_murderer ?? 0, mm2?.kills_as_murderer),
            was_hero: buildValue(mm1?.was_hero ?? 0, mm2?.was_hero),
            kills_as_infected: buildValue(mm1?.kills_as_infected ?? 0, mm2?.kills_as_infected),
            kills_as_survivor: buildValue(mm1?.kills_as_survivor ?? 0, mm2?.kills_as_survivor),
            longest_time_as_survivor_seconds: buildValue(mm1?.longest_time_as_survivor_seconds ?? 0, mm2?.longest_time_as_survivor_seconds),
            alpha_chance: buildValue(mm1?.alpha_chance ?? 0, mm2?.alpha_chance),
        }, i18n.template().mm);
    },
    'duel': (i18n, api1, api2) => {
        let duel1 = api1?.stats?.Duels ?? {}, duel2 = api2?.stats?.Duels ?? {};
        return buildText({
            coins: buildValue(duel1?.coins ?? 0, duel2?.coins),
            ping: buildValue(duel1?.ping ?? 200, duel2?.ping),
            ...buildValues('wins', 'losses', 'wl_rate', duel1, duel2, 'wins', 'losses'),
            best_winstreak: buildValue(duel1?.best_winstreak ?? 0, duel2?.best_winstreak),
            current_winstreak: buildValue(duel1?.current_winstreak ?? 0, duel2?.current_winstreak),
            ...buildValues('kills', 'deaths', 'kd_rate', duel1, duel2, 'kills', 'deaths'),
        }, i18n.template().duel);
    },
    'uhc': (i18n, api1, api2) => {
        let uhc1 = api1?.stats?.UHC ?? {}, uhc2 = api2?.stats?.UHC ?? {};
        return buildText({
            score: buildValue(uhc1?.score ?? 0, uhc2?.score),
            coins: buildValue(uhc1?.coins ?? 0, uhc2?.coins),
            wins: buildValue(uhc1?.wins ?? 0, uhc2?.wins),
            ...buildValues('kills', 'deaths', 'kd_rate', uhc1, uhc2, 'kills', 'deaths'),
        }, i18n.template().uhc);
    },
    'mw': (i18n, api1, api2) => {
        let mw1 = api1?.stats?.Walls3 ?? {}, mw2 = api2?.stats?.Walls3 ?? {};
        return buildText({
            coins: buildValue(mw1?.coins ?? 0, mw2?.coins),
            wither_damage: buildValue(mw1?.wither_damage ?? 0, mw2?.wither_damage),
            chosen_class: buildValue(mw1?.chosen_class ?? 'None', mw2?.chosen_class),
            ...buildValues('wins', 'losses', 'wl_rate', mw1, mw2, 'wins', 'losses'),
            ...buildValues('kills', 'deaths', 'kd_rate', mw1, mw2, 'kills', 'deaths'),
            assists: buildValue(mw1?.assists ?? 0, mw2?.assists),
            ...buildValues('final_kills', 'final_deaths', 'fkdr', mw1, mw2, 'final_kills', 'final_deaths'),
            final_assists: buildValue(mw1?.final_assists ?? 0, mw2?.final_assists),
        }, i18n.template().mw);
    },
    'bb': (i18n, api1, api2) => {
        let bb1 = api1?.stats?.BuildBattle ?? {}, bb2 = api2?.stats?.BuildBattle ?? {};
        return buildText({
            games_played: buildValue(bb1?.games_played ?? 0, bb2?.games_played),
            score: buildValue(bb1?.score ?? 0, bb2?.score),
            wins: buildValue(bb1?.wins ?? 0, bb2?.wins),
            wins_solo_normal: buildValue(bb1?.wins_solo_normal ?? 0, bb2?.wins_solo_normal),
            wins_teams_normal: buildValue(bb1?.wins_teams_normal ?? 0, bb2?.wins_teams_normal),
            wins_solo_pro: buildValue(bb1?.wins_solo_pro ?? 0, bb2?.wins_solo_pro),
            wins_guess_the_build: buildValue(bb1?.wins_guess_the_build ?? 0, bb2?.wins_guess_the_build),
        }, i18n.template().bb);
    },
    'bsg': (i18n, api1, api2) => {
        let bsg1 = api1?.stats?.Blitz ?? {}, bsg2 = api2?.stats?.Blitz ?? {};
        return buildText({
            coins: buildValue(bsg1?.coins ?? 0, bsg2?.coins),
            chests_opened: buildValue(bsg1?.chests_opened ?? 0, bsg2?.chests_opened),
            games_played: buildValue(bsg1?.games_played ?? 0, bsg2?.games_played),
            wins: buildValue(bsg1?.wins ?? 0, bsg2?.wins),
            ...buildValues('kills', 'deaths', 'kd_rate', bsg1, bsg2, 'kills', 'deaths'),
        }, i18n.template().bsg);
    }
}

window.buildData = buildData;