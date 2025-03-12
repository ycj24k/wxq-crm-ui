import Dictionaries from '@/services/util/dictionaries';




const FnReduce = (value: any[], Dictionarie: any, types: any) => {
    const result = value.reduce((acc: { type: any; value: number; }[], curr: { source: any; }) => {
        let type = ''
        if (Dictionarie) {
            type = Dictionaries.getName(Dictionarie, curr[types]);
        } else {
            type = curr[types]
        }
        // const type = curr.source;
        const existingType = acc.find(item => item.type === type);

        if (existingType) {
            existingType.value += 1;
        } else {
            acc.push({ type, value: 1 });
        }

        return acc;
    }, []);
    result.forEach((item: any) => {
        // item.source = Dictionaries.getName('dict_source', item.type)
        // @ts-ignore
        const baifenbi: any = (item.value / value.length * 100).toFixed(2);
        item.sourceValue = `${item.type}${item.value}位`
        item.source = `${item.type} ${baifenbi}%`
    })

    return result
}

export default FnReduce