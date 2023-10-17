import { Config } from "./config";
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

    document.getElementById('setting_change_log_path').onclick = _ => selectLogFile();
    document.getElementById('lang').onclick = async _ => {
        i18n.set(document.getElementById('lang').value);
        await i18n.load();
        i18n.initPage();
    }
    document.getElementById('done').onclick = async _ => {
        await config.set('lang', document.getElementById('lang').value);
        await config.set('ign', document.getElementById('ign').value);
        await config.set('logPath', document.getElementById('logpath').value);
        await config.set('apiKey', document.getElementById('apikey').value);

        window.go.main.App.OpenSelf('normal');
        window.runtime.Quit();
    }
}

const selectLogFile = async () => {
    let temppath = await window.go.main.App.OpenFileDialog(i18n.now().hud_select_log_file_title, 'latest.log');
    document.getElementById('logpath').value = temppath.split('\\').join('/');
}