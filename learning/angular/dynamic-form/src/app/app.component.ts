import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormBuilderService, JsonFormData } from './form-builder.service';
import { DynamicFieldComponent } from './dynamic-field.component';
import { matchValidator } from './match.validator';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicFieldComponent],
  template: `
    <div class="container">
      <h2>Registration Form</h2>
      <form [formGroup]="myForm" (ngSubmit)="onSubmit()">
        @for (control of formData.controls; track control.name) {
          <app-dynamic-field
            [field]="control"
            [formName]="myForm">
          </app-dynamic-field>
        }
        <button type="submit" [disabled]="!myForm.valid">Submit</button>
      </form>
      
      <div class="form-values">
        <h3>Form Values:</h3>
        <pre>{{ myForm.value | json }}</pre>
        <h3>Form Status:</h3>
        <p>{{ myForm.status }}</p>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 400px; margin: 2rem auto; font-family: sans-serif; padding: 2rem; border: 1px solid #ccc; border-radius: 8px; }
    button { padding: 0.75rem 1.5rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background-color: #ccc; cursor: not-allowed; }
    .form-values { margin-top: 2rem; padding: 1rem; background-color: #f8f9fa; border-radius: 4px; }
    pre { white-space: pre-wrap; word-wrap: break-word; }
  `]
})
export class AppComponent implements OnInit {
  public myForm: FormGroup = new FormGroup({});
  
  public formData: JsonFormData = {
    controls: [
      {
        name: 'email',
        label: 'Email',
        value: '',
        type: 'email',
        required: true,
        validators: {
          required: true,
          email: true
        }
      },
      {
        name: 'password',
        label: 'Password',
        value: '',
        type: 'password',
        required: true,
        validators: {
          required: true,
          minLength: 6
        }
      },
      {
        name: 'confirmPassword',
        label: 'Confirm Password',
        value: '',
        type: 'password',
        required: true,
        validators: {
          required: true
        }
      }
    ]
  };

  constructor(private formBuilderService: FormBuilderService) {}

  ngOnInit() {
    this.myForm = this.formBuilderService.buildForm(this.formData.controls);
    
    // Apply cross-field validation for password matching
    this.myForm.addValidators(matchValidator('password', 'confirmPassword'));
  }

  onSubmit() {
    if (this.myForm.valid) {
      console.log('Form Submitted!', this.myForm.value);
      alert('Form submitted successfully!');
    } else {
      console.log('Form is invalid.');
    }
  }
}
