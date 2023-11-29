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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore 
const vscode = window["acquireVsCodeApi"] !== undefined ?  acquireVsCodeApi() : undefined;

const Wrapper = () => {
  const [dataLoaded, setDataLoaded] = useState<IDeviceTemplate>();
  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message = event.data; // The JSON data our extension sent
      console.log(message);
      switch (message.type) {
        case 'update':
          // Update the webview's content
          try {
            const data = JSON.parse(message.text);
            setDataLoaded(data);
          } catch (e) {
            console.log("error", e);
            setDataLoaded(undefined);
          }
          break;
      }
    });
     // Handle messages sent from the extension to the webview
     vscode?.postMessage({ type: 'ready' });

  }, []);
  return (
    <RoutesViewer
      height={800}
      width={1024}
      deviceTemplate={dataLoaded}
    ></RoutesViewer>
  );
};
