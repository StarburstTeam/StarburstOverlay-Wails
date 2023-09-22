export class Tail {
    constructor(path, callback) {
        this.path = path;
        this.callback = callback;
        console.log(window.go.main.App.MonitorFile(path));
        window.runtime.EventsOn('tail_line', this.callback)
    }
}