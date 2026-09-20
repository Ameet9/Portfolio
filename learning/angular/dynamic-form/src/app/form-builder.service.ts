import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface JsonFormValidators {
  min?: number;
  max?: number;
  required?: boolean;
  requiredTrue?: boolean;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  nullValidator?: boolean;
}

export interface JsonFormControlOptions {
  min?: string;
  max?: string;
  step?: string;
  icon?: string;
}

export interface JsonFormControls {
  name: string;
  label: string;
  value: string;
  type: string;
  options?: JsonFormControlOptions;
  required: boolean;
  validators: JsonFormValidators;
}

export interface JsonFormData {
  controls: JsonFormControls[];
}

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {
  constructor(private fb: FormBuilder) {}

  buildForm(controls: JsonFormControls[]): FormGroup {
    const formGroup: { [key: string]: any } = {};

    for (const control of controls) {
      const controlValidators: any[] = [];

      if (control.validators) {
        if (control.validators.required) {
          controlValidators.push(Validators.required);
        }
        if (control.validators.email) {
          controlValidators.push(Validators.email);
        }
        if (control.validators.minLength) {
          controlValidators.push(Validators.minLength(control.validators.minLength));
        }
        if (control.validators.maxLength) {
          controlValidators.push(Validators.maxLength(control.validators.maxLength));
        }
        // Add more validators as needed
      }

      formGroup[control.name] = [control.value || '', controlValidators];
    }

    return this.fb.group(formGroup);
  }
}
