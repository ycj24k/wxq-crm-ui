


const convertTime = (time: string) => {

    const date = new Date(time);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1 + '').padStart(2, '0')}-${(date.getDate() + '').padStart(2, '0')} 00:00:00`;
    return formattedDate

}

export default convertTime