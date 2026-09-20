import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { JsonFormControls } from './form-builder.service';

@Component({
  selector: 'app-dynamic-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="formName">
      <label [for]="field.name">{{ field.label }}</label>
      
      @switch (field.type) {
        @case ('text') {
          <input
            type="text"
            [id]="field.name"
            [formControlName]="field.name"
          />
        }
        @case ('password') {
          <input
            type="password"
            [id]="field.name"
            [formControlName]="field.name"
          />
        }
        @case ('email') {
          <input
            type="email"
            [id]="field.name"
            [formControlName]="field.name"
          />
        }
        @case ('select') {
          <select [id]="field.name" [formControlName]="field.name">
            <option value="">Select an option</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </select>
        }
        @default {
          <input
            type="text"
            [id]="field.name"
            [formControlName]="field.name"
          />
        }
      }

      @if (formName.get(field.name)?.invalid && (formName.get(field.name)?.dirty || formName.get(field.name)?.touched)) {
        <div class="error">
          @if (formName.get(field.name)?.errors?.['required']) {
            <small>{{ field.label }} is required.</small>
          }
          @if (formName.get(field.name)?.errors?.['email']) {
            <small>Invalid email format.</small>
          }
          @if (formName.get(field.name)?.errors?.['minlength']) {
            <small>{{ field.label }} must be at least {{ field.validators.minLength }} characters long.</small>
          }
          @if (formName.get(field.name)?.errors?.['matching']) {
            <small>Passwords do not match.</small>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    div { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
    input, select { padding: 0.5rem; width: 100%; box-sizing: border-box; }
    .error { color: red; margin-top: 0.25rem; font-size: 0.875rem; }
  `]
})
export class DynamicFieldComponent {
  @Input() field!: JsonFormControls;
  @Input() formName!: FormGroup;
}
