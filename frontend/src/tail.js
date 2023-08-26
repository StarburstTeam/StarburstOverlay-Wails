export class Tail {
    constructor(path, callback) {
        this.path = path;
        this.callback = callback;
        console.log(window.go.main.App.MonitorFile(path));
        setInterval(async _ => {
            let data = await window.go.main.App.GetLines();
            if (data.length > 0)
                data.forEach(x => this.callback(x));
        }, 100);
    }
}