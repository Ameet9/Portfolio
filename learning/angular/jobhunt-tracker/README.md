# Angular 18 JobHunt Tracker

A standalone Angular application to track job applications, demonstrating the use of Reactive Forms, Custom Validators, and HTTP Interceptors.

## Overview
This project is an Angular 18 application that allows users to log and view job applications. It does not use a real backend, instead utilizing an Angular Service with RxJS operators (`of`, `delay`) to mock HTTP requests, whilst still utilizing the `HttpClient` to demonstrate interceptor capabilities.

## Architecture & Key Concepts

### 1. Reactive Forms
Angular provides two approaches to handling forms: Template-driven and Reactive. This project uses Reactive Forms.
- **Why Reactive Forms?** They are more robust, scalable, reusable, and testable compared to template-driven forms. The form logic is managed entirely in the component class rather than the template.
- **Implementation**: The `FormBuilder` service is used to create a `FormGroup` containing `FormControl`s for company, role, status, appliedDate, and notes. Sync validators (`Validators.required`, `Validators.minLength`) are attached directly in the component.

### 2. Custom Validator (`noFutureDateValidator`)
Sometimes built-in validators aren't enough. We created a custom synchronous validator to ensure users cannot submit an "Applied Date" that is in the future.
- **How it works**: A custom validator is simply a function that returns a `ValidatorFn`. The function takes an `AbstractControl` and returns a `ValidationErrors` object if validation fails, or `null` if it passes.

### 3. Functional HTTP Interceptor (`loading.interceptor.ts`)
Angular 15 introduced functional interceptors, and they are the standard in Angular 18 standalone applications.
- **Why Interceptors?** They allow you to intercept and modify HTTP requests or responses globally. Common use cases include attaching authentication tokens, logging, or showing a global loading spinner.
- **Implementation**: We define an `HttpInterceptorFn`. In `main.ts`, we register it using `provideHttpClient(withInterceptors([loadingInterceptor]))`. Our interceptor logs outgoing requests and response events.

## How to Run

1. Open a terminal in the root directory (`d:\Portfolio\learning\angular\jobhunt-tracker\`).
2. Run `npm install` to install dependencies.
3. Run `npm start` (or `ng serve`) to start the development server.
4. Navigate to `http://localhost:4200/` in your browser.

## Interview Q&A

**Q: What is the difference between Reactive and Template-driven forms in Angular?**
A: Reactive forms are synchronous, scalable, and logic-driven from the component class, making them easier to test. Template-driven forms are asynchronous, rely heavily on directives in the HTML template (`ngModel`), and are better suited for simple forms.

**Q: How do you create a custom validator in Angular?**
A: You write a function that returns `null` if the control value is valid, or an object (like `{ errorName: true }`) if it is invalid. You then pass this function to the `FormControl` array of validators.

**Q: How do you register an HTTP Interceptor in a standalone Angular 18 application?**
A: You provide the `provideHttpClient` function in the application's bootstrap providers, and pass the `withInterceptors` function containing your functional interceptor. Example: `provideHttpClient(withInterceptors([myInterceptor]))`.
