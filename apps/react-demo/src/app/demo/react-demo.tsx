import { BergLayout, BergPanel } from '@berg-layout/react';

export function ReactDemo() {
  return (
    <BergLayout
      children={[
        <BergPanel key={'center'} slot={'center'} />,
        <BergPanel key={'top'} slot={'top'} />,
        <BergPanel key={'right'} slot={'right'} />,
        <BergPanel key={'bottom'} slot={'bottom'} />,
        <BergPanel key={'left'} slot={'left'} />,
      ]}
    />
  );
}

export default ReactDemo;
