import { Config } from './config'
import { I18n } from './i18n'
import { Hypixel, modeList, socialMediaList, getSocialMedia } from './hypixel'
import { formatColor } from './util'
import { buildData, getData } from './i18n/hypixel_i18n'
import { $ } from './global'

const config = new Config(`config.json`, {
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
let i18n = null, hypixel = null;

window.onload = async () => {
    await config.load();
    i18n = new I18n(config.get('lang'));
    await i18n.load();
    i18n.initPage();
    hypixel = new Hypixel(config.get('apiKey'));

    $.id('minimize').onclick = _ => window.runtime.WindowMinimise();
    $.id('quit').onclick = _ => window.runtime.Quit();

    $.id('searchButton').onclick = _ => search();
    $.id('downloadSkin').onclick = _ => downloadSkin();

    //init search page
    modeList.reduce((p, c) => {
        let root = document.createElement('div');
        root.className = 'dataStyle';
        root.id = c;
        root.onclick = _ => showDetail(c);
        let name = document.createElement('div');
        name.style.fontSize = '20px';
        name.innerHTML = i18n.games().find(it => it.short == c).name;
        let detail = document.createElement('div');
        detail.id = `${c}detail`;
        root.appendChild(name);
        root.appendChild(detail);
        p.appendChild(root);
        return p;
    }, $.id('details'));
}

let searchPlayerName = null;
const search = async (name) => {
    if ($.id('searchPage').hidden) switchPage('searchPage');
    if (name == null) name = $.id('playername').value;
    else $.id('playername').value = name;
    searchPlayerName = name;
    let i = await hypixel.download(name);
    if (i == null) return $.id('playerName').innerText = hypixel.verified ? i18n.now().error_api_error : i18n.now().error_api_key_invalid;
    if (i == false) return $.id('playerName').innerText = i18n.now().error_player_not_found;

    window.hypixel = hypixel
    console.log(name)
    let data = hypixel.data[name];
    if (data.success == false) return console.log(data);

    $.id('playerName').innerHTML = formatColor(hypixel.formatName(name));
    $.id('skin').src = `https://crafatar.com/renders/body/${await hypixel.getPlayerUuid(name)}?overlay`;
    $.id('networkinfo').innerHTML = getData[config.get('lang')]['ov'](data.player);
    $.id('guild').innerHTML = hypixel.getGuild(config.get('lang'), name);
    $.id('status').innerHTML = await hypixel.getStatus(config.get('lang'), name);
    $.id('socialMedia').innerHTML = '';
    socialMediaList.reduce((prev, cur) => {
        let link = getSocialMedia(cur, data.player);
        if (link != null) {
            let icon = document.createElement('img');
            icon.src = 'img/icons/' + cur.toLowerCase() + '.png';
            icon.style = 'width:70px;height:70px;';
            icon.addEventListener('click', () => window.go.main.App.OpenExternal(link));
            prev.appendChild(icon);
        }
        return prev;
    }, $.id('socialMedia'));
}

let latestmode = '';
const showDetail = (mode) => {
    if (searchPlayerName == null || mode == 'details') return;
    if (latestmode == mode) {
        $.id(latestmode + 'detail').innerHTML = '';
        latestmode = '';
    } else {
        if (latestmode != '')
            $.id(latestmode + 'detail').innerHTML = '';
        $.id(mode + 'detail').innerHTML = buildData[mode](i18n, hypixel.data[searchPlayerName].player);
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