import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (abstractControl: AbstractControl): ValidationErrors | null => {
    const control = abstractControl.get(controlName);
    const matchingControl = abstractControl.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    if (matchingControl.errors && !matchingControl.errors?.['matching']) {
      // Return if another validator has already found an error on the matchingControl
      return null;
    }

    if (control.value !== matchingControl.value) {
      const error = { matching: true };
      matchingControl.setErrors(error);
      return error;
    } else {
      matchingControl.setErrors(null);
      return null;
    }
  };
}
