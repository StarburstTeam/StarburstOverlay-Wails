import { $ } from "./global";

let testTime = 10 * 1000, testing = false, tested = false;
let leftCnt = 0, rightCnt = 0;

export const setTestTime = (time, i18n) => {
    testTime = time * 1000;
    $.id('cpsTestTime').innerText = `${i18n.now().cps_test_time}${time}${i18n.now().cps_second}`;
}

export const onTestClick = (button, i18n) => {
    if (tested) return;
    if (!testing) {
        leftCnt = rightCnt = 0;
        testing = true;
        let testLast = testTime;
        let t = setInterval(() => {
            if (testLast == 0 || tested) {
                clearInterval(t);
                testing = false;
                tested = true;
                $.id('testCpsButton').innerHTML = `${i18n.now().cps_time_last}${testLast / 1000}${i18n.now().cps_second}<br>${i18n.now().cps_left_click}${leftCnt} , ${i18n.now().cps_right_click}${rightCnt}`;
                let result = $.id('cpsTestResult');
                if (rightCnt == 0)
                    return result.innerHTML = `${i18n.now().cps_result_left}<b>${leftCnt * 1000 / testTime}</b>CPS`;
                if (leftCnt == 0)
                    return result.innerHTML = `${i18n.now().cps_result_right}<b>${rightCnt * 1000 / testTime}</b>CPS`;
                return result.innerHTML = `${i18n.now().cps_result_left}<b>${leftCnt * 1000 / testTime}</b>CPS , ${i18n.now().cps_result_right}<b>${rightCnt * 1000 / testTime}</b>CPS`;
            }
            testLast -= 100;
            $.id('testCpsButton').innerHTML = `${i18n.now().cps_time_last}${testLast / 1000}${i18n.now().cps_second}<br>${i18n.now().cps_left_click}${leftCnt} , ${i18n.now().cps_right_click}${rightCnt}`;
        }, 100);
    }
    if (button == 0) leftCnt++;
    if (button == 2) rightCnt++;
}

export const resetTest = (i18n) => {
    tested = false;
    $.id('cpsTestResult').innerHTML = '';
    $.id('testCpsButton').innerHTML = i18n.now().cps_click_to_start;
}