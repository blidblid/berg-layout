import { render } from '@testing-library/react';

import BergPanel from './panel';

describe('React', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BergPanel />);
    expect(baseElement).toBeTruthy();
  });
});
