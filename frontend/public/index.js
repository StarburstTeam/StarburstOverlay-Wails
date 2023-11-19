import { Tail } from './tail'
import { Config } from './config'
import { I18n } from './i18n'
import { Hypixel } from './hypixel'
import { loadBlacklist } from './blacklist'
import { setTestTime, onTestClick, resetTest } from './cps'
import { formatColor } from './util'
import { $ } from './global'
import { buildData } from './i18n/hypixel_i18n'

const config = new Config(`config.json`, {
    lang: 'en_us',
    lang_hypixel: 'en_us',
    ign: '',
    logPath: '',
    apiKey: '',
    lastType: 'bw',
    lastSub: '',
    autoShrink: true,
    notification: true,
});
const windowConfig = new Config(`window.json`, {
    width: 1080,
    height: 550,
    x: 40,
    y: 20,
});
let i18n = null, i18n_hypixel = null;
let players = [], party = [], hypixel = null, nowType = null, nowSub = null, inLobby = false, missingPlayer = false, numplayers = 0, hasLog = false;

window.onload = async () => {
    if (!await config.load()) {
        window.go.main.App.OpenSelf('setup');
        window.runtime.Quit();
    }
    await windowConfig.load();
    window.runtime.WindowSetSize(windowConfig.get('width'), windowConfig.get('height'));
    window.runtime.WindowSetPosition(windowConfig.get('x'), windowConfig.get('y'));
    window.screenX = window.screenLeft = windowConfig.get('x');
    window.screenY = window.screenTop = windowConfig.get('y');

    i18n = new I18n(config.get('lang'));
    await i18n.load();
    i18n.initPage();
    i18n_hypixel = new I18n(config.get('lang_hypixel'));
    await i18n_hypixel.load();

    loadBlacklist();

    $.id('cps').onclick = _ => switchPage('cpsPage');
    $.id('search').onclick = _ => openSearchPage();
    $.id('settings').onclick = _ => switchPage('settingPage');
    $.id('info').onclick = _ => switchPage('infoPage');
    $.id('session').onclick = _ => { updateSession(); switchPage('sessionPage'); }

    $.id('lang').onclick = async _ => {
        config.set('lang', $.id('lang').value);
        i18n = new I18n(config.get('lang'));
        await i18n.load();
        i18n.initPage();
    }
    $.id('lang_hypixel').onclick = async _ => {
        config.set('lang_hypixel', $.id('lang_hypixel').value);
        i18n_hypixel = new I18n(config.get('lang_hypixel'));
        await i18n_hypixel.load();
    }
    $.id('setting_change_log_path').onclick = _ => selectLogFile();
    $.id('apiKey').onclick = _ => {
        hypixel.apiKey = $.id('apiKey').value;
        config.set('apiKey', hypixel.apiKey);
    }
    $.id('copy_api_key').onclick = _ => copyApiKey();
    $.id('ign').onchange = _ => {
        config.set('ign', $.id('ign').value);
        hypixel.setSelfIgn(config.get('ign'));
    }
    $.id('infotype').onclick = _ => changeDiv();
    $.id('subGame').onclick = _ => setSubGame();
    $.id('autoShrink').onclick = _ => config.set('autoShrink', $.id('autoShrink').checked);
    $.id('notification').onclick = _ => config.set('notification', $.id('notification').checked);

    $.id('cps_1s').onclick = _ => setTestTime(1, i18n);
    $.id('cps_5s').onclick = _ => setTestTime(5, i18n);
    $.id('cps_10s').onclick = _ => setTestTime(10, i18n);
    $.id('cps_20s').onclick = _ => setTestTime(20, i18n);
    $.id('testCpsButton').onmousedown = event => onTestClick(event.button, i18n);
    $.id('cps_reset').onclick = _ => resetTest(i18n);

    $.id('show').onclick = _ => resize(null, true);
    $.id('minimize').onclick = _ => window.runtime.WindowMinimise();
    $.id('quit').onclick = _ => { onClose(); window.runtime.Quit(); }

    $.id('search_single').onkeydown = key => {
        if (key.key == 'Enter')
            $.id('add_manual').onclick();
    }
    $.id('add_manual').onclick = _ => {
        addManual($.id('search_single').value);
        $.id('search_single').value = '';
    }

    $.id('updateSession').onclick = _ => updateSession();
    $.id('resetSession').onclick = _ => { hypixel.previous_data = hypixel.data[hypixel.self_ign]; updateSession(); }

    window.hypixel = hypixel = new Hypixel(config.get('apiKey'));
    hypixel.setSelfIgn(config.get('ign'));
    setInterval(_ => updateApiRate(), 1000);

    updateSession();
    updateHTML();
    nowType = config.get('lastType');
    nowSub = config.get('lastSub');
    $.id('autoShrink').checked = config.get('autoShrink');
    $.id('apiKey').value = config.get('apiKey');
    $.id('ign').value = config.get('ign');
    $.id('notification').checked = config.get('notification');
    $.id('lang').value = config.get('lang');
    $.id('lang_hypixel').value = config.get('lang_hypixel');
    $.id('infotype').innerHTML = i18n.getMainModeHTML();
    pushError();
    changeCategory();
    loadSubGame(nowSub);
    $.id('infotype').value = nowType;
    $.id('subGame').value = nowSub;
    setSubGameInfo();

    if (config.get('logPath') == '') return;
    // hasLog = fs.existsSync(config.get('logPath'));
    new Tail(config.get('logPath'), async (data) => {
        let s = data.indexOf('[CHAT]');
        if (s == -1) return;//not a chat log
        let changed = false;
        let msg = data.substring(s + 7).replace(' [C]', '').replace('\r', '');
        console.log(msg);
        if (msg.indexOf(i18n_hypixel.now().chat_online) != -1 && msg.indexOf(',') != -1) {//the result of /who command
            if (inLobby) return;
            resize(true);
            let who = msg.replace(i18n_hypixel.now().chat_online, '').split(', ');
            players = [];
            for (let i = 0; i < who.length; i++) {
                players.push(who[i]);
                hypixel.download(who[i], updateHTML);
            }
            missingPlayer = false;
            changed = true;
        } else if (msg.indexOf(i18n_hypixel.now().chat_player_join) != -1 && msg.indexOf(':') == -1) {
            resize(true);
            inLobby = false;
            let join = msg.split(i18n_hypixel.now().chat_player_join)[0];
            if (players.find(x => x == join) == null) {
                players.push(join);
                hypixel.download(join, updateHTML);
                changed = true;
            }
            if (msg.indexOf('/') != -1) {
                numplayers = Number(msg.substring(msg.indexOf('(') + 1, msg.indexOf('/')));
                missingPlayer = players.length < numplayers;
            }
        } else if (msg.indexOf(i18n_hypixel.now().chat_player_quit) != -1 && msg.indexOf(':') == -1) {
            inLobby = false;
            let left = msg.split(i18n_hypixel.now().chat_player_quit)[0];
            if (players.find(x => x == left) != null) {
                players.remove(left);
                numplayers -= 1;
                if (numplayers < 0) numplayers = 0;
                missingPlayer = players.length < numplayers;
                changed = true;
            }
        } else if (msg.indexOf(i18n_hypixel.now().chat_sending) != -1 && msg.indexOf(':') == -1) {
            resize(false);
            inLobby = false;
            players = [];
            changed = true;
        } else if (msg.indexOf(i18n_hypixel.now().chat_join_lobby) != -1 && msg.indexOf(':') == -1) {
            if (inLobby) return;
            resize(false);
            inLobby = true;
            players = [];
            changed = true;
            // for future usage
            // } else if (msg.indexOf('joined the party') !== -1 && msg.indexOf(':') === -1 && inlobby) {
            // } else if (msg.indexOf('You left the party') !== -1 && msg.indexOf(':') === -1 && inlobby) {
            // } else if (msg.indexOf('left the party') !== -1 && msg.indexOf(':') === -1 && inlobby) {
            // } else if (inlobby && (msg.indexOf('Party Leader:') === 0 || msg.indexOf('Party Moderators:') === 0 || msg.indexOf('Party Members:') === 0)) {
        } else if ((msg.indexOf(i18n_hypixel.now().chat_final_kill) != -1 || msg.indexOf(i18n_hypixel.now().chat_disconnect) != -1) && msg.indexOf(':') == -1) {
            let left = msg.split(' ')[0];
            if (players.find(x => x == left) != null) {
                players.remove(left);
                changed = true;
            }
        } else if (msg.indexOf(i18n_hypixel.now().chat_reconnect) != -1 && msg.indexOf(':') == -1) {
            let join = msg.split(' ')[0];
            if (players.find(x => x == join) == null) {
                players.push(join);
                changed = true;
            }
        } else if (msg.indexOf(i18n_hypixel.now().chat_game_start_1_second) != -1 && msg.indexOf(':') == -1) {
            resize(false);
            if (config.get('notification'))
                window.go.main.App.ShowNotification(i18n_hypixel.now().notification_start_title, i18n_hypixel.now().notification_start_body, []);
        } else if (msg.indexOf(i18n_hypixel.now().chat_game_start_0_second) != -1 && msg.indexOf(':') == -1) resize(false);
        // else if (msg.indexOf('https://rewards.hypixel.net/claim-reward/') != -1) {
        //     let url = `https://rewards.hypixel.net/claim-reward/${msg.split('https://rewards.hypixel.net/claim-reward/')[1].split('\\n')[0]}`;
        //     console.log(url);
        //     window.open(url, 'Claim Rewards', 'width=800,height=600,frame=true,transparent=false,alwaysOnTop=true');
        // }
        if (changed) {
            console.log(players);
            updateHTML();
        }
    });
    updateHTML();
}

const changeCategory = () => {
    clearMainPanel();
    config.set('lastType', nowType);
}

let lastPage = 'mainPage';
const switchPage = (page) => {
    if ($.id('mainPage').hidden && lastPage == page) page = 'mainPage';
    lastPage = page;
    $.id('mainPage').style.display = '';
    $.id('mainPage').hidden = true;
    $.id('settingPage').hidden = true;
    $.id('infoPage').hidden = true;
    $.id('cpsPage').hidden = true;
    $.id('sessionPage').hidden = true;
    $.id('settings').className = 'menu_button settings';
    $.id('info').className = 'menu_button info';
    $.id('cps').className = 'menu_button cps';
    $.id('session').className = 'menu_button session';
    $.id(page).hidden = false;
    if (page == 'mainPage') $.id('mainPage').style.display = 'inline-block';
    if (page == 'settingPage') $.id('settings').className = 'menu_button_stay settings_stay';
    if (page == 'infoPage') $.id('info').className = 'menu_button_stay info_stay';
    if (page == 'cpsPage') $.id('cps').className = 'menu_button_stay cps_stay';
    if (page == 'sessionPage') $.id('session').className = 'menu_button_stay session_stay';
}

const openSearchPage = () => {
    window.go.main.App.OpenSelf('search');
}

let nowShow = true;
const resize = (show, force) => {
    if (!force && !config.get('autoShrink')) return;
    if (show != null) nowShow = show;
    else nowShow ^= true;
    $.id('show').style.transform = `rotate(${nowShow ? 0 : 90}deg)`;
    console.log({ w: windowConfig.get('width'), h: nowShow ? windowConfig.get('height') : 40 })
    window.runtime.WindowSetSize(windowConfig.get('width'), nowShow ? windowConfig.get('height') : 40);
}

const changeDiv = () => {
    nowType = $.id('infotype').value;
    changeCategory();
    loadSubGame();
    updateHTML();
}

const loadSubGame = (val) => {
    $.id('subGame').innerHTML = i18n.titleMode().mode[nowType] != null ? i18n.titleMode().mode[nowType].reduce((p, c) => p + `<option value="${c.id}">${c.name}</option>`, '') : '';
    setSubGame(val);
}

const setSubGame = (val) => {
    if (val == null)
        nowSub = $.id('subGame').value;
    config.set('lastSub', nowSub);
    updateHTML();
    setSubGameInfo();
}

const setSubGameInfo = _ => {
    let type = $.id('infotype'), sub = $.id('subGame');
    $.id('current_mode').innerHTML = `&nbsp;${type.options[type.selectedIndex].childNodes[0].data} - ${sub.options[sub.selectedIndex].childNodes[0].data}`;
}

const updateApiRate = () => {
    hypixel.reset_rate_limit--;
    if (hypixel.reset_rate_limit <= 0) hypixel.reset_rate_limit = 300;
    $.id('api_limit_remain').style['stroke-dashoffset'] = 100 - 100 * hypixel.remain_rate_limit / hypixel.max_rate_limit;
    $.id('api_limit_remain_num').innerHTML = hypixel.remain_rate_limit;
    $.id('api_limit_reset').style['stroke-dashoffset'] = 100 - hypixel.reset_rate_limit / 3;
    $.id('api_limit_reset_num').innerHTML = hypixel.reset_rate_limit;

    $.id('current_ping').innerHTML = `Mojang&nbsp;&nbsp;${hypixel.mojang_ping}ms<br>Hypixel&nbsp;${hypixel.hypixel_ping}ms`;
}

const updateHTML = async () => {
    let main = $.id('main');
    resetError(false);

    if (config.get('logPath') == '')
        return pushError(`${i18n.now().error_log_not_found}<br>${i18n.now().info_set_log_path}`, false);
    if (config.get('apiKey') == '')
        return pushError(`${i18n.now().error_api_key_not_found}<br>${i18n.now().info_api_new}`, false);
    if (!hypixel.verified && !hypixel.verifying)
        return pushError(`${i18n.now().error_api_key_invalid}<br>${i18n.now().info_api_new}`, false);

    clearMainPanel();

    let dataList = pickDataAndSort();
    for (let i = 0; i < dataList.length; i++) {
        if (dataList[i].nick == true) {
            main.innerHTML += `<tr><th>${formatColor('§eN')}</th>
            <th style="text-align:right">[ ? ]</th>
            <td>&nbsp; ${formatColor('§f' + dataList[i].name)}</td>
            <th>?</th><th>?</th><th>?</th>
            <th>?</th><th>?</th></tr>`;
            continue;
        }
        let tooltip = await hypixel.getToolTipData(dataList[i].name);
        main.innerHTML += `<tr><th>${dataList[i].data[dataList[i].data.length - 1].data.reduce((p, c) => {
            p.push(`<span title="${i18n.now()['tag_' + c.detail]}" style="color:${c.color}">${c.text}</span>`); return p;
        }, []).join('&nbsp;')}</th>
        <th style="text-align:right;width:80px;height:12px">${dataList[i].data[0].format}</th>
        <td style="word-break:keep-all;height:12px" class="tooltip">
            <img src="https://crafatar.com/avatars/${await hypixel.getPlayerUuid(dataList[i].name)}?overlay" style="position:relative;width:15px;height:15px;top:2px">
            ${dataList[i].data[1].format}
            <span class="tooltiptext">${i18n.now().language}${tooltip[0]}<br>${i18n.now().guild}${tooltip[1]}</span>
        </td>
        ${Array.from({ length: dataList[i].data.length - 3 }, (_, x) => x + 2).reduce((p, c) => p + `<th>${dataList[i].data[c].format}</th>`, '')}</tr>`;
    }
    if (missingPlayer)
        pushError(`${i18n.now().error_player_missing}<br>${i18n.now().info_who}`, false);
    if (column >= 1 && column <= 8)
        $.id(`sort_${column}`).innerHTML += isUp ? '↑' : '↓';
    for (let i = 1; i <= 8; i++)
        $.id('sort_' + i).onclick = _ => setSortContext(i);
}

let column = 0, isUp = false;//column: 0 none, 1 lvl, 2 name, 8 tag, 3-7 stats
const setSortContext = (c) => {
    if (c == column) isUp ^= true;
    else if (c >= 0 && c <= 8) {
        column = c;
        isUp = true;
    } else {
        column = 0;
        isUp = false;
    }
    updateHTML();
}

const pickDataAndSort = () => {
    let dataList = [];
    for (let i = 0; i < players.length; i++) {
        if (hypixel.data[players[i]] == null) continue;
        if (hypixel.data[players[i]].success == false) continue;// wait for download
        if (hypixel.data[players[i]].nick == true) {
            dataList.push({ name: players[i], nick: true });
            continue;
        }
        let d = hypixel.getMiniData(players[i], nowType, $.id('subGame').value);
        d.push(hypixel.getTag(players[i]));
        dataList.push({ name: players[i], nick: false, data: d });
    }
    if (column != 0)
        dataList = dataList.sort((a, b) => {
            if (a.nick || b.data == NaN || b.data == '?') return -1;
            if (b.nick || a.data == NaN || a.data == '?') return 1;
            return (a.data[column - 1].value - b.data[column - 1].value) * (isUp ? -1 : 1)
        });
    return dataList;
}

const selectLogFile = async () => {
    let temppath = await window.go.main.App.OpenFileDialog(i18n.now().hud_select_log_file_title, 'latest.log');
    config.set('logPath', temppath.split('\\').join('/'));
    window.runtime.WindowReload();
}

const clearMainPanel = () => {
    let main = $.id('main'), category = hypixel.getTitle(nowType, i18n.titleMode().title);
    main.innerHTML = `<tr><th id="sort_8" style="width:60px">${i18n.now().hud_main_tag}</th>
    <th id="sort_1" style="width:60px">${i18n.now().hud_main_level}</th>
    <th id="sort_2" style="width:400px">${i18n.now().hud_main_players}</th>
    ${category.reduce((p, c, i) => p + `<th id="sort_${i + 3}" style="width:100px">${c}</th>`, '')}</tr>`;
}

window.onresize = async () => {
    if (config.config != null && nowShow) {
        let size = await window.runtime.WindowGetSize();
        windowConfig.set('width', size.w);
        windowConfig.set('height', size.h);
    }
}

const onClose = async () => {
    let position = await window.runtime.WindowGetPosition();
    windowConfig.set('x', position.x);
    windowConfig.set('y', position.y);
}

let stable_message = false;
export const pushNetworkError = (code) => {
    if (code == 403) pushError(`${i18n.now().error_api_key_invalid}<br>${i18n.now().info_api_new}`, true);
    else if (code == 429) pushError(`${i18n.now().error_api_limit_exceeded}`, true);
}
const pushError = (error, stable) => {
    stable_message = stable;
    if (error == '' || error == null)
        return $.id('message').style.opacity = 0;
    $.id('message').style.opacity = 1;
    $.id('message').innerHTML = error;
}

const resetError = (force) => {
    if (force || !stable_message) return $.id('message').style.opacity = 0;
}

const addManual = async (name) => {
    await hypixel.download(name);
    players.push(name);
    updateHTML();
}

const copyApiKey = () => {
    navigator.clipboard.writeText($.id('apiKey').value);
    $.id('copy_api_key').innerHTML = i18n.data[i18n.current].page.copied_api_key;
    setTimeout(_ => $.id('copy_api_key').innerHTML = i18n.data[i18n.current].page.copy_api_key, 1000)
}

const updateSession = async () => {
    await hypixel.download(hypixel.self_ign);
    $.id('player_name').innerHTML = formatColor(hypixel.formatName(hypixel.self_ign));
    $.id('session_data').innerHTML = buildData[nowType](i18n, hypixel.previous_data?.player, hypixel.data[hypixel.self_ign]?.player).replaceAll('<br>', '<br><br>').replaceAll('|', '<br>');
    $.id('skin').src = `https://crafatar.com/renders/body/${await hypixel.getPlayerUuid(hypixel.self_ign)}?overlay`;
}

window.addManual = addManual;