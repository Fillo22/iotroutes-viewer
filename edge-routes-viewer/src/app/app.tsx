import styled from 'styled-components';
import { useEffect, useState } from 'react';
import RoutesViewer from '../components/routes-viewer';
import { IDeviceTemplate } from '../components/interfaces';

const StyledApp = styled.div`
  // Your style here
`;


export function App() {
  return (
    <StyledApp>
      <Wrapper></Wrapper>
    </StyledApp>
  );
}

export default App;

const Wrapper = () => {
  const [dataLoaded, setDataLoaded] = useState<IDeviceTemplate>();
  useEffect(() => {
 
      fetch(
      'https://sachinobackup.blob.core.windows.net/data/devicetemplate%401.json?sp=r&st=2023-11-17T11:32:41Z&se=2024-02-04T19:32:41Z&spr=https&sv=2022-11-02&sr=b&sig=5UrQ7babVtzTgcxVV3%2B42c7ql5N%2BmXm3u19lFqsex7E%3D'
    )        
      .then((res) => res.json())
      .catch((err) => console.log(err))
      .then((data: IDeviceTemplate) => {
        console.log(data);
        setDataLoaded(data);
      });
  }, []);
  return (
      <RoutesViewer
        height={800}
        width={1024}
        deviceTemplate={dataLoaded}
      ></RoutesViewer>
  );
};
