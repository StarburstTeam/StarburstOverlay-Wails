let testTime = 10 * 1000, testing = false, tested = false;
let leftCnt = 0, rightCnt = 0;

const setTestTime = (time) => {
    testTime = time * 1000;
    document.getElementById('cpsTestTime').innerText = `${i18n.now().cps_test_time}${time}${i18n.now().cps_second}`;
}

const onTestClick = (button) => {
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
                document.getElementById('testCpsButton').innerHTML = `${i18n.now().cps_time_last}${testLast / 1000}${i18n.now().cps_second}<br>${i18n.now().cps_left_click}${leftCnt} , ${i18n.now().cps_right_click}${rightCnt}`;
                let result = document.getElementById('cpsTestResult');
                if (rightCnt == 0)
                    return result.innerHTML = `${i18n.now().cps_result_left}<b>${leftCnt * 1000 / testTime}</b>CPS`;
                if (leftCnt == 0)
                    return result.innerHTML = `${i18n.now().cps_result_right}<b>${rightCnt * 1000 / testTime}</b>CPS`;
                return result.innerHTML = `${i18n.now().cps_result_left}<b>${leftCnt * 1000 / testTime}</b>CPS , ${i18n.now().cps_result_right}<b>${rightCnt * 1000 / testTime}</b>CPS`;
            }
            testLast -= 100;
            document.getElementById('testCpsButton').innerHTML = `${i18n.now().cps_time_last}${testLast / 1000}${i18n.now().cps_second}<br>${i18n.now().cps_left_click}${leftCnt} , ${i18n.now().cps_right_click}${rightCnt}`;
        }, 100);
    }
    if (button == 0) leftCnt++;
    if (button == 2) rightCnt++;
}

const resetTest = () => {
    tested = false;
    document.getElementById('cpsTestResult').innerHTML = '';
    document.getElementById('testCpsButton').innerHTML = i18n.now().cps_click_to_start;
}