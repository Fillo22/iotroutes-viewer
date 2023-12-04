import { render } from '@testing-library/react';

import RoutesEditor from './routesEditor';

describe('RoutesEditor', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RoutesEditor />);
    expect(baseElement).toBeTruthy();
  });
});
