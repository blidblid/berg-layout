import {
  BergLayoutBottomPosition,
  BergLayoutOverflow,
  BergLayoutTopPosition,
} from './layout-model';

export function validateBergLayoutTopPosition(
  position: string
): BergLayoutTopPosition {
  if (position !== 'above' && position !== 'beside') {
    throw new Error(`Invalid layout top position: ${position}`);
  }

  return position;
}

export function validateBergLayoutBottomPosition(
  position: string
): BergLayoutBottomPosition {
  if (position !== 'below' && position !== 'beside') {
    throw new Error(`Invalid layout bottom position: ${position}`);
  }

  return position;
}

export function validateBergLayoutOverflow(
  overflow: string
): BergLayoutOverflow {
  if (
    overflow !== 'x' &&
    overflow !== 'y' &&
    overflow !== 'xy' &&
    overflow !== 'none'
  ) {
    throw new Error(`Invalid layout overflow: ${overflow}`);
  }

  return overflow;
}
