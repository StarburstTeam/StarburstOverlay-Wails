export let blacklist = {};

export const loadBlacklist = async () => {
    blacklist = await window.go.main.App.Fetch("https://starburst.iafenvoy.net/blacklist.json")
        .then(res => JSON.parse(res)).then(res => JSON.parse(res.body));
}