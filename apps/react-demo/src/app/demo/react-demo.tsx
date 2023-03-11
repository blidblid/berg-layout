import { BergLayout, BergPanel } from '@berg-layout/react';

export function ReactDemo() {
  return (
    <BergLayout
      children={[
        <BergPanel slot={'top'} />,
        <BergPanel slot={'right'} />,
        <BergPanel slot={'bottom'} />,
        <BergPanel slot={'left'} />,
        <div slot="content">Hello world</div>,
      ]}
    />
  );
}

export default ReactDemo;
