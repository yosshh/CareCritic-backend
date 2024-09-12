// THE PURPOSE OF THIS CODE BELOW IS TO CREATE CUSTOM ERROR CLASS TO HANDLE API ERRORS IN A STANDARDISED WAY


class ApiError extends Error{
    constructor( // constructor are special methods which are used to initialize objects when they are created, It takes 4 parameters written below
        statusCode, // this is the http status code like 404, 500 etc
        message = "Something went wrong", // a bried message when error occurs
        errors=[], // an array of errors (this is optional)
        stack = "" //
    ){
        super(message)
        this.statusCode= statusCode
        this.data = null
        this.message = message
        this.success = false; // this always occurs false indicating error
        this.errors = errors

        if(stack) {
            this.stack = stack 
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

// 1. When an API error occurs, create a new instance of ApiError, passing the relevant details (statusCode, message, errors, etc.).
// 2. The constructor sets the properties accordingly.
// 3. If no stack trace is provided, it generates one using Error.captureStackTrace.

// Benefits:

// - Standardized error handling for APIs.
// - Easy to extend or modify error properties.
// - Simplifies error logging and debugging.

// In summary, this code defines a custom error class to handle API errors in a structured and standardized way, making it easier to manage and debug errors in your application.


export { ApiError }