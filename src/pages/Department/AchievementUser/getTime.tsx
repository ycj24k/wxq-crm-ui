


const getFirstAndLastDayOfMonthDate = (months: any) => {
    let today = new Date(months);
    let year = today.getFullYear();
    let month = today.getMonth();

    let firstDay = formatDate(new Date(year, month, 1)) + " " + "00:00:00";
    let lastDay = formatDate(new Date(year, month + 1, 0)) + " " + "23:59:59";

    return { firstDay, lastDay };
}
const getFirstAndLastDayOfMonth = (date: any = false) => {
    let today = date ? new Date(date) : new Date();
    let year = today.getFullYear();
    let month = today.getMonth();

    let firstDay = formatDate(new Date(year, month, 1)) + " " + "00:00:00";
    let lastDay = formatDate(new Date(year, month + 1, 0)) + " " + "23:59:59";

    return { firstDay, lastDay };
}
const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
const getDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return new Date(year, month, 0).getDate();
}
const getTodayDate = (num: number = 0) => {
    const today = new Date();
    const targetDate = new Date(today.getTime() + num * 24 * 60 * 60 * 1000);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();

    // 格式化日期
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}
const getTodayDates = (day: number = 1) => {
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0'); // Adding 1 because January is 0


    return year + '-' + month + '-' + day;
}
const getAllTimesInPeriod = (startTime: any, endTime: any) => {
    let times = [];
    let currentTime = new Date(startTime);
    let currentEndTime = new Date(endTime);

    while (currentTime <= currentEndTime) {
        let year = currentTime.getFullYear();
        let month = ('0' + (currentTime.getMonth() + 1)).slice(-2);
        let day = ('0' + currentTime.getDate()).slice(-2);
        let time = `${year}-${month}-${day}`;
        times.push(time);

        currentTime.setDate(currentTime.getDate() + 1);
    }

    return times;
}
const getDaysInMonthBeforeToday = () => {
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let days = [];
    for (let day = 1; day <= today.getDate(); day++) {
        let num = day < 10 ? '0' + day : day
        let date = year + '-' + month + '-' + num
        days.push(date);
    }

    return days;
}
const getDaysInMonths = (date: any = false) => {
    let today = date ? new Date(date) : new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let days = [];
    let nums = new Date(year, month, 0).getDate()
    for (let day = 1; day <= nums; day++) {
        let num = day < 10 ? '0' + day : day
        let date = year + '-' + month + '-' + num + ' ' + '00:00:00'
        days.push(date);
    }

    return days;
}
const getNextDay = () => {
    let today = new Date();
    let todayFormatted = today.toISOString().split('T')[0];

    // 获取明天的日期
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    let tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    return {
        todayFormatted, tomorrowFormatted
    }
}
export { getFirstAndLastDayOfMonth, getDaysInMonth, getTodayDate, getTodayDates, getAllTimesInPeriod, getDaysInMonthBeforeToday, getFirstAndLastDayOfMonthDate, formatDate, getNextDay, getDaysInMonths }