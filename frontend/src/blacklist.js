export let blacklist = {};

export const loadBlacklist = async () => {
    blacklist = await fetch("https://starburst.iafenvoy.net/blacklist.json").then(res => res.json());
}