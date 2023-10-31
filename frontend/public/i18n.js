import { $ } from "./global";

export class I18n {
    constructor(current) {
        this.current = current;
    }
    load = async () => {
        let path = await window.go.main.App.GetPath('this') + 'lang\\';
        let jsons = await window.go.main.App.GetDirectoryFiles(path);
        this.data = {};
        for (let i of jsons) {
            let d = JSON.parse(await window.go.main.App.ReadJsonString(i));
            this.data[d.id] = { name: d.name, values: d.values, page: d.page, mode: d.mode };
        }
    }
    now = () => this.data[this.current].values;
    set = (id) => this.current = id;
    initPage = () => {
        console.log(this.data);
        console.log(this.current);
        Object.keys(this.data[this.current].page).forEach((i) => {
            let e = $.id(i);
            if (e != null) e.innerHTML = this.data[this.current].page[i];
        });
    }
    getMainModeHTML = () => this.data[this.current].mode.reduce((p, c) => p + `<option value="${c.id}">${c.name}</option>`, '');
}