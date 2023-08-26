const { remote, shell, BrowserWindow } = require('electron');
const { app } = remote;
const fs = require('fs');

const currentWindow = remote.getCurrentWindow();
const config = new Config(`${app.getPath('userData')}/config.json`, {
    lang: 'en_us',
    logPath: '',
    apiKey: '',
    lastType: 'bw',
    lastSub: '',
    autoShrink: true,
    notification: true,
    width: 1080,
    height: 550,
    x: 40,
    y: 20
});
const i18n = new I18n(config.get('lang'));
let hypixel = null;

window.onload = async () => {
    i18n.initPage();
    hypixel = new Hypixel(config.get('apiKey'));

    //init search page
    let games = await fetch(`json/games_${config.get('lang')}.json`).then(res => res.json());
    modeList.reduce((p, c) => {
        let root = document.createElement('div');
        root.className = 'dataStyle';
        root.id = c;
        root.addEventListener('click', (e) => showDetail(e.path[1].id));
        let name = document.createElement('div');
        name.style.fontSize = '20px';
        name.innerHTML = games.find(it => it.short == c).name;
        let detail = document.createElement('div');
        detail.id = `${c}detail`;
        root.appendChild(name);
        root.appendChild(detail);
        p.appendChild(root);
        return p;
    }, document.getElementById('details'));
}

let searchPlayerName = null;
const search = async (name) => {
    if (document.getElementById('searchPage').hidden) switchPage('searchPage');
    if (name == null) name = document.getElementById('playername').value;
    else document.getElementById('playername').value = name;
    searchPlayerName = name;
    let i = await hypixel.download(name);
    if (i == null) return document.getElementById('playerName').innerText = hypixel.verified ? i18n.now().error_api_error : i18n.now().error_api_key_invalid;
    if (i == false) return document.getElementById('playerName').innerText = i18n.now().error_player_not_found;

    let data = hypixel.data[name];
    if (data.success == false) return console.log(data);

    document.getElementById('playerName').innerHTML = formatColor(hypixel.formatName(name));
    document.getElementById('skin').src = `https://crafatar.com/renders/body/${await hypixel.getPlayerUuid(name)}?overlay`;
    document.getElementById('networkinfo').innerHTML = getData[config.get('lang')]['ov'](data.player);
    document.getElementById('guild').innerHTML = hypixel.getGuild(name);
    document.getElementById('status').innerHTML = await hypixel.getStatus(name);
    document.getElementById('socialMedia').innerHTML = '';
    socialMediaList.reduce((prev, cur) => {
        let link = getSocialMedia(cur, data.player);
        if (link != null) {
            let icon = document.createElement('img');
            icon.src = 'img/icons/' + cur.toLowerCase() + '.png';
            icon.style = 'width:70px;height:70px;';
            icon.addEventListener('click', () => shell.openExternal(link));
            prev.appendChild(icon);
        }
        return prev;
    }, document.getElementById('socialMedia'));
}

let latestmode = '';
const showDetail = (mode) => {
    if (searchPlayerName == null || mode == 'details') return;
    if (latestmode == mode) {
        document.getElementById(latestmode + 'detail').innerHTML = '';
        latestmode = '';
    } else {
        if (latestmode != '')
            document.getElementById(latestmode + 'detail').innerHTML = '';
        document.getElementById(mode + 'detail').innerHTML = getData[config.get('lang')][mode](hypixel.data[searchPlayerName].player);
        latestmode = mode;
    }
}

const downloadSkin = async () => {
    if (searchPlayerName == null || searchPlayerName == '') return;
    let a = document.createElement('a');
    a.href = `https://crafatar.com/skins/${await hypixel.getPlayerUuid(searchPlayerName)}`;
    a.download = `${hypixel.getPlayerUuid(searchPlayerName)}.png`;
    a.click();
}