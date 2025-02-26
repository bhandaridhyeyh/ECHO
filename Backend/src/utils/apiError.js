class apiError extends Error {  
    constructor( 
        statusCode, 
        message="Something went wrong", 
        errors = [], 
        stack = ""
    ) {  
        super(message) // to overwrite error parent class super is used  
        this.data = null 
        this.message = message 
        this.statusCode = statusCode 
        this.success = false 
        this.errors = errors  
        if (stack) {
            this.stack = stack //where the error has occured 
        }
        else {   
            Error.captureStackTrace(this,this.constructor) // generates current call stack when stack is not there !
        }
    }
} 
export { apiError } 