import {ApplicationError} from "./models";
import {HttpError} from "http-errors";

export const httpErrorHandler = (error: HttpError): { errors: ApplicationError[], status: number } => {
    const message = error.expose ? error.message : 'Internal error occurred';
    
    return {
        errors: [{
            message: message
        }],
        status: error.status
    };
};
