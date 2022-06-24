import middy from '@middy/core';
import {APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2} from 'aws-lambda';
import {ApplicationError} from './models';

type Validator = (e: unknown) => boolean;
type Handler<T> = (e: T) => { errors: ApplicationError[], status: number };

export class MiddyErrorHandler {
    private readonly handlers: Map<Validator, Handler<any>>;
    
    public register<T>(v: Validator, h: Handler<T>): MiddyErrorHandler {
        this.handlers.set(v, h);
        return this;
    }
    
    public get middleware(): middy.MiddlewareObj<APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Error> {
        const error: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Error> = async (request) => {
            let status = 500;
            let errors: ApplicationError[] = [{ message: 'Internal error occurred' }];
            
            this.handlers.forEach((value, key) => {
                if (key(request.error)) {
                    const resp = value(request.error);
                    errors = resp.errors;
                    status = resp.status;
                }
            });
            
            const body = JSON.stringify(errors);
            request.response!.statusCode = status;
            request.response!.body = body;
        }
        
        return {
            onError: error
        };
    }
}
