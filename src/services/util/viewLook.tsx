import ImgUrl from '@/services/util/UpDownload';

const look = async (
  id: number,
  item: string,
  fileUrl: string,
  viewFn: (arg0: any) => void,
  visibles: (arg0: boolean) => void,
) => {
  const type = item.slice(item.indexOf('.'));
  if (type != '.png' && type != '.jpg' && type != '.jpeg' && type != '.pdf') {
    await ImgUrl(fileUrl, id, item, item);
  } else {
    await ImgUrl(fileUrl, id, item).then((res: any) => {
      viewFn(res);
      visibles(true);
    });
  }
};

export default look;
