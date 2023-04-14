import {
  BergLayoutBottomPosition,
  BergLayoutTopPosition,
} from './layout-model';

export function validateBergLayoutTopPosition(
  position: string
): BergLayoutTopPosition {
  if (position !== 'above' && position !== 'beside' && position !== 'under') {
    throw new Error(`Invalid layout top position: ${position}`);
  }

  return position;
}

export function validateBergLayoutBottomPosition(
  position: string
): BergLayoutBottomPosition {
  if (position !== 'below' && position !== 'beside' && position !== 'under') {
    throw new Error(`Invalid layout bottom position: ${position}`);
  }

  return position;
}
