export class I18n {
    constructor(current) {
        this.current = current;
    }
    load = async () => {
        let path = await window.go.main.App.GetPath('this') + 'lang\\';
        let jsons = await window.go.main.App.GetDirectoryFiles(path);
        this.data = await jsons.reduce(async(p, c) => {
            let d = JSON.parse(await window.go.main.App.ReadJsonString(c));
            p[d.id] = { name: d.name, values: d.values, page: d.page, mode: d.mode };
            return p;
        }, {});
    }
    now = () => this.data[this.current].values;
    getAll = () => Object.keys(this.data).reduce((p, c) => {
        p.push({ id: c, name: this.data[c].name });
    }, []);
    set = (id) => this.current = id;
    initPage = () => {
        console.log(this.data);
        console.log(this.current);
        Object.keys(this.data[this.current].page).forEach((i) => {
        let e = document.getElementById(i);
        if (e != null) e.innerHTML = this.data[this.current].page[i];
    });}
    getMainModeHTML = () => this.data[this.current].mode.reduce((p, c) => p + `<option value="${c.id}">${c.name}</option>`, '');
}