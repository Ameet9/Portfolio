# Angular Dynamic Form Builder

This project is a dynamic form builder built with Angular 18 using standalone components and the Reactive Forms module. It takes a JSON schema and generates a form dynamically, applying standard and custom validations.

## Overview

The application demonstrates how to build forms dynamically based on a JSON configuration. This is particularly useful in scenarios where forms are driven by a backend system, content management system, or need to adapt based on user roles or prior inputs.

## Architecture

*   **`AppComponent`**: The main container. It holds the JSON schema (`formData`) representing the form configuration (email, password, confirmPassword) and delegates form generation to the `FormBuilderService`.
*   **`DynamicFieldComponent`**: A dumb component responsible for rendering a specific form control (e.g., text input, password input) based on the provided configuration using Angular's new `@switch` control flow. It binds to the parent `FormGroup` using `ReactiveFormsModule`.
*   **`FormBuilderService`**: A service that parses the JSON configuration and constructs the corresponding `FormGroup`, mapping string validator representations to real Angular `Validators` (e.g., `'required'` to `Validators.required`).
*   **`matchValidator`**: A custom cross-field validator function that ensures the password and confirm password fields match.

## How to Run

1.  Navigate to the project directory: `cd d:\Portfolio\learning\angular\dynamic-form`
2.  Install dependencies: `npm install`
3.  Start the development server: `npm start`
4.  Open your browser and navigate to `http://localhost:4200/`

## Key Concepts Explained

### Reactive vs Template-driven forms

*   **Reactive Forms:** Provide a model-driven approach to handling form inputs whose values change over time. The form state and validation logic are explicitly managed in the component class (TypeScript). They are more robust, scalable, reusable, and testable. In this project, we use `FormBuilder`, `FormGroup`, and `FormControl` programmatically.
*   **Template-driven Forms:** Rely on directives in the template (HTML) to create and manipulate the underlying object model (e.g., `ngModel`). They are easier to get started with but can become harder to manage for complex forms or when dynamic validation is required.

### How to write a custom synchronous validator

A custom synchronous validator is a function that takes an `AbstractControl` (like a `FormControl` or `FormGroup`) and returns either a map of validation errors (e.g., `{ matching: true }`) if the validation fails, or `null` if it passes.

In this project, `matchValidator.ts` creates a cross-field validator. Because it compares two fields within the form, it's typically applied to the `FormGroup` rather than individual `FormControl`s.

```typescript
export function matchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (abstractControl: AbstractControl): ValidationErrors | null => {
    // 1. Get references to both controls
    const control = abstractControl.get(controlName);
    const matchingControl = abstractControl.get(matchingControlName);

    // 2. Perform comparison logic
    if (control?.value !== matchingControl?.value) {
      // 3. Return an error object if invalid
      return { matching: true };
    }
    // 4. Return null if valid
    return null;
  };
}
```

### FormArray

While not heavily utilized in this basic example, a `FormArray` is an alternative to `FormGroup` for managing a collection of `AbstractControl`s.
*   **`FormGroup`** aggregates values of child controls into an object, using string keys (like `{ email: 'a@b.com', password: '123' }`).
*   **`FormArray`** aggregates values of child controls into an array, using numerical indices (like `['a@b.com', '123']`).

`FormArray` is extremely useful for dynamic forms where the user can add or remove identical sets of fields on the fly (e.g., adding multiple phone numbers or addresses to a contact form).

## Interview Q&A

**Q: Why use Reactive Forms over Template-Driven forms for a dynamic form builder?**
A: Reactive forms offer direct programmatic access to the form's state and structure in the component class. This makes it significantly easier to construct the form model (`FormGroup`, `FormControl`) dynamically by iterating over a JSON object or array, applying validators dynamically, and responding to changes outside of the template context.

**Q: How does the new control flow (`@if`, `@switch`, `@for`) in Angular 18 improve dynamic components?**
A: It provides a cleaner, more readable syntax built directly into the framework, replacing structural directives like `*ngIf`, `*ngSwitch`, and `*ngFor`. It offers better type checking, reduced bundle size (no need to import `CommonModule` directives in many cases, although `CommonModule` is still used here for brevity), and improved performance.

**Q: How do you handle cross-field validation, like checking if a password matches a confirm password field?**
A: You attach a custom validator to a common ancestor, typically the `FormGroup` that contains both fields. The validator receives the `FormGroup` as an argument, allowing it to retrieve and compare the values of both child controls and return a validation error if they don't meet the criteria.

**Q: What is the purpose of `forwardRef` in custom form controls (though not used in this specific example)?**
A: If you were building a custom component that implements `ControlValueAccessor` (to make it behave like a native input field that can be bound with `formControlName`), you would use `forwardRef` in the `NG_VALUE_ACCESSOR` provider. It allows referring to the component class itself before it has been fully defined by the compiler, resolving circular dependency issues during provider registration.
