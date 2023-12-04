import styled from 'styled-components';
import { useEffect, useState } from 'react';
import RoutesViewer from '../components/routes-viewer';
import { IDeviceTemplate, IState } from '../components/interfaces';
import _ from 'lodash';

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
if(process.env.NX_USE_LOCAL_FILE === 'true'){
  // load local file
  fetch('assets/devicetemplate.json', {method: 'GET'})
  .then(async (response) => {
    if(response.ok)
      window.postMessage({type: 'update', text: await response.text()}, '*');
    else
      window.postMessage({type: 'error', text: response.statusText}, '*');
  }).catch((error) => {
    window.postMessage({type: 'error', text: error}, '*');
  });
}

const Wrapper = () => {
  const [state, setState] = useState<IState>({current: "idle"});

  useEffect(() => {
    setState({current: "loading"});
    // Handle messages sent from the extension to the webview
    window.addEventListener('message', (event) => {
      const message = event.data; // The JSON data our extension sent
      switch (message.type) {
        case 'update':
          // Update the webview's content
          try {
            const data = JSON.parse(message.text);
            if(_.get(data, '$schema-template')=== undefined){
              throw new Error("Invalid file: this is not a device template file");
            }
            setState({current: "idle", data: data});
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (e: any) {
            setState({current: "error", error: e.message});
          }
          break;
        case 'error':
          setState({current: "error", error: message.text});
          break;
      }
    });
     // Handle messages sent from the extension to the webview
     vscode?.postMessage({ type: 'ready' });

  }, []);
  switch (state.current) {
      case "idle":
        return <RoutesViewer
          height={800}
          width={1024}
          deviceTemplate={state.data as IDeviceTemplate}
        ></RoutesViewer>;
      case "loading":
        return <div>Loading...</div>;
      case "error":
        return <div>{state.error}</div>;
    }
};
