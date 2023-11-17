import { render } from '@testing-library/react';

import RoutesViewer from './routes-viewer';

describe('RoutesViewer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RoutesViewer />);
    expect(baseElement).toBeTruthy();
  });
});
