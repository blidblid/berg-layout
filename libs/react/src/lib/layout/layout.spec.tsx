import { render } from '@testing-library/react';

import BergLayout from './layout';

describe('React', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BergLayout />);
    expect(baseElement).toBeTruthy();
  });
});
