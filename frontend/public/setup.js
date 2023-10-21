import { Config } from "./config";
import { $ } from "./global";
import { I18n } from "./i18n";

const config = new Config(`config.json`, {
    lang: 'en_us',
    ign: '',
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

let i18n = null;
window.onload = async () => {
    await config.load();
    i18n = new I18n(config.get('lang'));
    await i18n.load();
    i18n.initPage();

    $.id('setting_change_log_path').onclick = _ => selectLogFile();
    $.id('lang').onclick = async _ => {
        i18n.set($.id('lang').value);
        await i18n.load();
        i18n.initPage();
    }
    $.id('done').onclick = async _ => {
        await config.set('lang', $.id('lang').value);
        await config.set('ign', $.id('ign').value);
        await config.set('logPath', $.id('logpath').value);
        await config.set('apiKey', $.id('apikey').value);

        window.go.main.App.OpenSelf('normal');
        window.runtime.Quit();
    }
}

const selectLogFile = async () => {
    let temppath = await window.go.main.App.OpenFileDialog(i18n.now().hud_select_log_file_title, 'latest.log');
    $.id('logpath').value = temppath.split('\\').join('/');
}