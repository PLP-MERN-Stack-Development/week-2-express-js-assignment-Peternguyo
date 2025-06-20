// errors 

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError'; 
        this.statusCode = 404; // Custom status code for this error type 
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400; // Custom status code for this error type 
    }
}

class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedError';
        this.statusCode = 401; 
    }
}

// Export the custom error classes 
module.exports = {
    NotFoundError,
    ValidationError,
    UnauthorizedError
}