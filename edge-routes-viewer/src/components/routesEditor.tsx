import styled from 'styled-components';
import { IModule, IRoute } from './interfaces';

/* eslint-disable-next-line */
export interface RoutesEditorProps {
    routes: IRoute[];
    modules: IModule[];
}

const StyledRoutesEditor = styled.div`
  color: pink;
`;

export function RoutesEditor(props: RoutesEditorProps) {
  return (
    <StyledRoutesEditor>
      <h1>Routes</h1>
      <ul>
        {props.routes.map((r, index) => {
          return <li key={index}>
            <>
            {r.name} 
            <input type='text' value={r.route.from}></input>
            </>
            </li>;
        })}
      </ul>
    </StyledRoutesEditor>
  );
}

export default RoutesEditor;
