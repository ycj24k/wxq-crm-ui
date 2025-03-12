import { useEffect, useState } from 'react';
import { Image } from 'antd';

export default (props: any) => {
  const { isModalVisibles, imgSrc, setisModalVisibles } = props;
  return (
    <>
      <div style={{ display: 'none' }}>
        <Image
          width={200}
          style={{ display: 'none' }}
          preview={{
            visible: isModalVisibles,
            src: imgSrc,
            onVisibleChange: (value: any) => {
              setisModalVisibles(value);
            },
          }}
        />
      </div>
    </>
  );
};
