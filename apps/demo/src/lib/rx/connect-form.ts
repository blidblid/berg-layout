import { FormControl, FormGroup } from '@angular/forms';
import { EMPTY, Observable } from 'rxjs';
import { Connectable } from './connect-model';
import { connect } from './connect-util';

/** Connects the value of a FormControl with a Connectable. */
export function connectFormValue<T>(
  connectable: Connectable<T>,
  form: FormControl | FormGroup,
  destroyed$: Observable<unknown> = EMPTY
): void {
  connect(connectable, form.valueChanges, destroyed$, (value: unknown) => {
    form.setValue(value, { emitEvent: false });
  });
}
