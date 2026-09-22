import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    
    const inputDate = new Date(control.value);
    const today = new Date();
    // Reset time portion to compare only dates
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    const isFuture = inputDate.getTime() > today.getTime();
    
    return isFuture ? { futureDate: true } : null;
  };
}
